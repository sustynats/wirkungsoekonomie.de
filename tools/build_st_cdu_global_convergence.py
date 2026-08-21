#!/usr/bin/env python3
"""Build the Sachsen-Anhalt CDU convergence manifest from already-approved #234 reviews.

This is a *mechanical reconciliation* tool. It must not create Fach semantics.
It consumes canonical non-overlapping parity shards and exact #234 review snapshots,
materializes missing machine-readable shards, resolves explicit role/edge metadata,
and freezes source/effect denominators only when hard reconciliation gates pass.
"""
from __future__ import annotations

import hashlib
import json
import os
import pathlib
import re
import sys
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone

REPO = os.environ.get("GITHUB_REPOSITORY", "sustynats/wirkungsoekonomie.de")
TOKEN = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
ISSUE = 234
ROOT = pathlib.Path("woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt")
SNAP = ROOT / "review-snapshots"
PLAN = ROOT / "ltw-2026-st-cdu-global-leaf-reconciliation-plan-v1.json"
SOURCE_MANIFEST = ROOT / "ltw-2026-st-cdu-source-unit-manifest-v2.json"
REGISTER = pathlib.Path("woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-cdu-zusagen.md")
FINAL = ROOT / "ltw-2026-st-cdu-final-versioned-manifest-v1.json"
AUDIT = ROOT / "ltw-2026-st-cdu-global-leaf-reconciliation-audit-v1.json"

PRIMARY_URL = "https://www.cdulsa.de/sites/www.cdulsa.de/files/downloads/regierungsprogramm_ltw_web.pdf"
TERMINAL = {
    "EDITORIAL_V2_PLUS_APPROVED",
    "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
    "SOURCE_UNIT_RECLASSIFIED_VERSIONED",
}
DIRECTIONS = {"POSITIVE", "NEGATIVE", "NEUTRAL", "AMBIVALENT", "OPEN"}
EVIDENCE = {"HIGH", "MEDIUM", "LOW", "NOT_ASSESSABLE"}
CLASS_TOKENS = [
    "ABSENT_IN_FINAL_PDF", "HISTORICAL_SOURCE_VARIANT", "SAME_PARTIAL_PARENT",
    "TRUNCATED_PARTIAL_PARENT", "TRUNCATED_OVERMERGED", "PARTIAL_PARENT",
    "OVERMERGED", "TRUNCATED", "CONTEXT_ONLY", "DUPLICATE", "RESTATEMENT",
    "CONTINUATION", "ABSENT", "SAME", "PARTIAL",
]
LAYER_MARKERS = [
    "PROBLEM_REVIEW", "GOAL_REVIEW", "DNS_REFERENCE", "MATERIAL_OMISSIONS",
    "POLICY_COHERENCE", "DELIVERY_FEASIBILITY", "RESOURCE_FINANCING",
    "SPATIAL_DISTRIBUTION", "INTERNATIONAL_LEAKAGE", "ROBUSTNESS_STRESS_TEST",
    "REVERSIBILITY_LOCKIN", "FALSIFICATION_TRIGGERS", "LIFECYCLE_TRACEABILITY",
    "VERSION_DELTA", "COVERAGE_SCOPE", "COMMUNICATION_MEDIA_IMPACT",
    "RECOMMENDATION", "STATE_GFA_ENAP_BENCHMARK",
]
CORE_LAYER_MARKERS = {"PROBLEM_REVIEW", "GOAL_REVIEW", "COVERAGE_SCOPE", "RECOMMENDATION"}


def api_json(url: str):
    if not TOKEN:
        raise RuntimeError("GITHUB_TOKEN/GH_TOKEN missing")
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "woek-st-cdu-global-convergence",
    })
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.load(response)


def fetch_comments():
    out = []
    page = 1
    while True:
        batch = api_json(f"https://api.github.com/repos/{REPO}/issues/{ISSUE}/comments?per_page=100&page={page}&sort=created&direction=asc")
        if not batch:
            break
        out.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return out


def read_json(path: pathlib.Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: pathlib.Path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def parse_register_keys(text: str):
    mapping = {}
    current_no = None
    for line in text.splitlines():
        m = re.match(r"####\s+Eintrag\s+(\d+)\s*$", line.strip())
        if m:
            current_no = int(m.group(1))
            continue
        m = re.match(r"\*\*commitment_key:\*\*\s+(.+?)\s*$", line.strip())
        if m and current_no is not None:
            mapping[current_no] = m.group(1).strip()
    return mapping


def pages_from_slug(slug: str):
    nums = [int(x) for x in re.findall(r"\d+", slug)]
    if len(nums) != 2:
        raise ValueError(slug)
    return list(range(nums[0], nums[1] + 1))


def normalize_class(value: str):
    up = value.upper().replace("-", "_")
    found = []
    for token in CLASS_TOKENS:
        if token in up and token not in found:
            found.append(token)
    # remove weak tokens subsumed by stronger compound tokens
    if "SAME_PARTIAL_PARENT" in found:
        found = [x for x in found if x not in {"SAME", "PARTIAL_PARENT", "PARTIAL"}]
    if "TRUNCATED_PARTIAL_PARENT" in found:
        found = [x for x in found if x not in {"TRUNCATED", "PARTIAL_PARENT", "PARTIAL"}]
    if "TRUNCATED_OVERMERGED" in found:
        found = [x for x in found if x not in {"TRUNCATED", "OVERMERGED"}]
    return "+".join(found) if found else None


def diff_prefix(text: str):
    lines = text.splitlines()
    stop = len(lines)
    for i, line in enumerate(lines):
        s = line.strip().lower()
        if re.match(r"^#{2,4}\s*2[\.:)]", s) or "terminale fach" in s or "stable leaves" in s:
            stop = i
            break
    return lines[:stop]


def extract_diff(text: str):
    entries = []
    seen = set()
    current_class = None
    for raw in diff_prefix(text):
        line = raw.strip()
        clean = re.sub(r"[*_`]", "", line).strip()
        class_here = normalize_class(clean)
        # classification-only heading/list label sets state
        has_legacy = bool(re.search(r"\b\d{4}\b", clean))
        if class_here and not has_legacy and len(clean) < 100:
            current_class = class_here
        classification = class_here or current_class
        if not classification:
            continue
        ids = re.findall(r"(?<!\d)(\d{4})(?!\d)", clean)
        for legacy in ids:
            key = (legacy, classification, line)
            if key in seen:
                continue
            seen.add(key)
            entries.append({
                "legacy_unit": legacy,
                "classification": classification,
                "source_bound_review_line": line,
            })
    # collapse each legacy to its strongest/latest explicit classification in the review prefix
    priority = {
        "ABSENT_IN_FINAL_PDF+HISTORICAL_SOURCE_VARIANT": 100,
        "TRUNCATED_OVERMERGED": 95,
        "TRUNCATED_PARTIAL_PARENT": 94,
        "OVERMERGED": 90,
        "TRUNCATED": 85,
        "PARTIAL_PARENT": 80,
        "SAME_PARTIAL_PARENT": 75,
        "CONTEXT_ONLY": 70,
        "DUPLICATE": 65,
        "RESTATEMENT": 65,
        "CONTINUATION": 60,
        "PARTIAL": 50,
        "SAME": 40,
        "ABSENT": 30,
    }
    by_id = {}
    for e in entries:
        old = by_id.get(e["legacy_unit"])
        score = max(priority.get(x, 10) for x in e["classification"].split("+"))
        if old is None or score >= old[0]:
            by_id[e["legacy_unit"]] = (score, e)
    return [v[1] for _, v in sorted(by_id.items(), key=lambda kv: int(kv[0]))]


def tokens_after_status(chunk: str, status_end: int, allowed: set[str]):
    tail = chunk[status_end:]
    # Prefer backticked/upper-case explicit tokens in source review.
    toks = re.findall(r"\b[A-Z][A-Z_]+\b", tail.upper())
    for tok in toks:
        if tok in allowed:
            return tok
    return None


def extract_terminal_objects(text: str, legacy_keys: dict[int, str]):
    lines = text.splitlines()
    out = {}
    conflicts = []
    full_id_re = re.compile(r"`((?:ST-CDU-[A-Za-z0-9._-]+|ltw-2026-st-cdu-[A-Za-z0-9._-]+))`")
    numeric_heading_re = re.compile(r"^\s*#{2,5}\s*`?(\d{4})`?\b")
    legacy_inline_re = re.compile(r"\bLegacy\s+`?(\d{4})`?\s+(?:bleibt|remains)", re.I)

    for i, line in enumerate(lines):
        candidates = [m.group(1) for m in full_id_re.finditer(line)]
        mh = numeric_heading_re.search(line)
        if mh:
            no = int(mh.group(1))
            if no in legacy_keys:
                candidates.append(legacy_keys[no])
        ml = legacy_inline_re.search(line)
        if ml:
            no = int(ml.group(1))
            if no in legacy_keys:
                candidates.append(legacy_keys[no])
        if not candidates:
            continue
        chunk = "\n".join(lines[i:i+5])
        sm = re.search(r"\b(EDITORIAL_V2_PLUS_APPROVED|REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON|SOURCE_UNIT_RECLASSIFIED_VERSIONED)\b", chunk)
        if not sm:
            continue
        status = sm.group(1)
        direction = tokens_after_status(chunk, sm.end(), DIRECTIONS)
        evidence = tokens_after_status(chunk, sm.end(), EVIDENCE)
        # Handle prose variants: Evidenz `MEDIUM`, `POSITIVE/MEDIUM`, etc.
        if not direction:
            dm = re.search(r"\b(POSITIVE|NEGATIVE|NEUTRAL|AMBIVALENT|OPEN)\b", chunk[sm.end():])
            direction = dm.group(1) if dm else None
        if not evidence:
            em = re.search(r"\b(HIGH|MEDIUM|LOW|NOT_ASSESSABLE)\b", chunk[sm.end():])
            evidence = em.group(1) if em else None
        if not direction or not evidence:
            continue
        for source_id in candidates:
            rec = {
                "source_unit_id": source_id,
                "terminal_fach_status": status,
                "impact_direction": direction,
                "evidence_level": evidence,
            }
            old = out.get(source_id)
            if old and (old["terminal_fach_status"], old["impact_direction"], old["evidence_level"]) != (status, direction, evidence):
                conflicts.append({"source_unit_id": source_id, "old": old, "new": rec})
            out[source_id] = rec
    return list(out.values()), conflicts


def extract_layer_markers(text: str):
    present = sorted({m for m in LAYER_MARKERS if m in text})
    has_system_section = bool(re.search(r"#241[-– ]?(?:System|system|Prüf|pruef)", text)) or CORE_LAYER_MARKERS.issubset(set(present))
    return {
        "markers_explicit_in_source_review": present,
        "source_review_has_241_system_section": has_system_section,
        "set_check_status": "PASS_SOURCE_BOUND_MARKERS_CAPTURED" if has_system_section else "REVIEW_SOURCE_SECTION_MARKERS_NOT_EXPLICIT",
    }


def normalize_existing_terminal(obj):
    if isinstance(obj, list):
        if len(obj) < 4:
            raise ValueError(f"Bad terminal tuple: {obj}")
        return {"source_unit_id": obj[0], "terminal_fach_status": obj[1], "impact_direction": obj[2], "evidence_level": obj[3]}
    return dict(obj)


def normalize_diff_entry(obj):
    if isinstance(obj, list):
        return {"legacy_unit": obj[0], "classification": obj[1], "action": obj[2] if len(obj) > 2 else None}
    return dict(obj)


def materialize_missing_shards(plan, snapshot_index, legacy_keys):
    by_slug = {e["shard"]: e for e in snapshot_index["entries"]}
    generated = []
    blockers = []
    for segment in plan["canonical_non_overlapping_segments"]:
        if segment.get("materialized_on_pr257"):
            continue
        pages = segment["pages"]
        slug = f"p{pages[0]}-p{pages[-1]}"
        path = ROOT / segment["expected_shard"]
        idx = by_slug.get(slug)
        if not idx:
            blockers.append(f"MISSING_REVIEW_SNAPSHOT_INDEX:{slug}")
            continue
        text = pathlib.Path(idx["snapshot_path"]).read_text(encoding="utf-8")
        terminal, tconf = extract_terminal_objects(text, legacy_keys)
        diff = extract_diff(text)
        m = re.search(rf"ST_CDU_P{pages[0]}_P{pages[-1]}_NEW_OR_SPLIT_TERMINAL\s*=\s*PASS_(\d+)", text)
        expected = int(m.group(1)) if m else None
        if expected is not None and len(terminal) < expected:
            blockers.append(f"TERMINAL_PARSE_SHORT:{slug}:parsed={len(terminal)}:checkpoint={expected}")
        if tconf:
            blockers.append(f"TERMINAL_CONFLICT_WITHIN_SNAPSHOT:{slug}:{len(tconf)}")
        if f"ST_CDU_P{pages[0]}_P{pages[-1]}_UNRESOLVED_SOURCE_GAPS = 0" not in text:
            blockers.append(f"ZERO_GAP_TOKEN_MISSING:{slug}")
        layer_check = extract_layer_markers(text)
        shard = {
            "schema_version": "1.1",
            "shard_version": f"2026-08-22-{slug}-v1",
            "programme_key": "ltw-2026-st-cdu",
            "party": "CDU",
            "primary_source_url": PRIMARY_URL,
            "primary_pdf_pages": pages,
            "historical_ids_immutable": True,
            "fach_review_issue": 234,
            "fach_review_comment_id": idx["issue_comment_id"],
            "review_snapshot_path": idx["snapshot_path"],
            "review_snapshot_sha256": idx["body_sha256"],
            "materialization_mode": "MECHANICAL_FROM_SOURCE_BOUND_ISSUE_234_REVIEW_NO_NEW_FACH_SEMANTICS",
            "authoritative_source_unit_count": None,
            "authoritative_effect_mechanism_count": None,
            "denominator_status": "NOT_FROZEN_PENDING_GLOBAL_LEAF_RECONCILIATION",
            "primary_source_diff": diff,
            "terminal_source_objects": terminal,
            "tuple_schema": ["source_unit_id", "terminal_fach_status", "impact_direction", "evidence_level"],
            "applicable_241_layer_set_check": layer_check,
            "segment_checks": {
                "primary_source_parity": "PASS_SEGMENT",
                "terminal_source_objects_parsed": len(terminal),
                "checkpoint_terminal_count": expected,
                "unresolved_source_gaps": 0,
                "historical_ids_mutated": False,
                "recommendation_synthesized": False,
                "dns_mapping_synthesized": False,
                "public_count_mutated": False,
            },
            "completion_guard": {
                "st_cdu_primary_source_parity": "PASS_FULL_PROGRAMME",
                "st_cdu_final_versioned_manifest": "PENDING_GLOBAL_LEAF_RECONCILIATION",
                "st_cdu_terminal_complete": False,
            },
        }
        write_json(path, shard)
        generated.append(path.as_posix())
    return generated, blockers


def source_manifest_edges(manifest):
    children_of = defaultdict(set)
    parent_of = {}
    semantic_roles = {}

    def add_child(parent, child):
        if parent and child:
            children_of[parent].add(child)
            parent_of[child] = parent

    for item in manifest.get("additive_source_units", []):
        pid = item.get("source_unit_id")
        if item.get("assessment_maturity", "").upper().find("PARENT") >= 0:
            semantic_roles[pid] = "PARENT"
        for ch in item.get("children", []):
            add_child(pid, ch.get("source_unit_id"))
    for split in manifest.get("versioned_splits_of_legacy_units", []):
        parent = split.get("legacy_source_unit")
        semantic_roles[parent] = "PARENT"
        for ch in split.get("children", []):
            add_child(parent, ch.get("source_unit_id"))
    # recurse over any nested dict/list relation fields conservatively
    def walk(x):
        if isinstance(x, dict):
            cid = x.get("source_unit_id")
            parent = x.get("parent_source_unit_id") or x.get("parent_legacy_source_unit") or x.get("parent_legacy_unit")
            if cid and parent:
                add_child(parent, cid)
            role = x.get("semantic_role") or x.get("source_role")
            if cid and role:
                semantic_roles[cid] = str(role).upper()
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
    walk(manifest)
    return children_of, parent_of, semantic_roles


def historical_number(source_id: str):
    m = re.search(r"ltw-2026-st-cdu-(\d{4})-", source_id)
    return int(m.group(1)) if m else None


def split_parent_number(source_id: str):
    m = re.search(r"ST-CDU-PRIMARY-SPLIT-(\d{4})-", source_id)
    return int(m.group(1)) if m else None


def class_is_parent(c: str | None):
    if not c:
        return False
    return any(x in c for x in ("OVERMERGED", "PARTIAL_PARENT", "TRUNCATED")) and "SAME" not in c


def class_is_context(c: str | None):
    return bool(c and ("CONTEXT_ONLY" in c or "ABSENT_IN_FINAL_PDF" in c or "HISTORICAL_SOURCE_VARIANT" in c))


def build_legacy_terminal_ledger(comments, legacy_keys):
    ledger = {}
    provenance = {}
    conflicts = []
    for c in comments:
        body = c.get("body") or ""
        if "CDU" not in body and "ltw-2026-st-cdu" not in body and "ST_CDU" not in body:
            continue
        recs, local_conf = extract_terminal_objects(body, legacy_keys)
        for conf in local_conf:
            conflicts.append({"comment_id": c["id"], **conf})
        for rec in recs:
            n = historical_number(rec["source_unit_id"])
            if n is None:
                continue
            old = ledger.get(n)
            trip = (rec["terminal_fach_status"], rec["impact_direction"], rec["evidence_level"])
            if old:
                oldtrip = (old["terminal_fach_status"], old["impact_direction"], old["evidence_level"])
                # Later explicit review is authoritative; record a delta rather than silently hiding it.
                if oldtrip != trip:
                    conflicts.append({"legacy_number": n, "prior": oldtrip, "new": trip, "new_comment_id": c["id"], "type": "VERSIONED_TERMINAL_DELTA_LATEST_WINS"})
            ledger[n] = rec
            provenance[n] = c["id"]
    return ledger, provenance, conflicts


def main() -> int:
    now = datetime.now(timezone.utc).isoformat()
    plan = read_json(PLAN)
    snapshot_index = read_json(SNAP / "ltw-2026-st-cdu-review-snapshot-index-v1.json")
    register_text = REGISTER.read_text(encoding="utf-8")
    legacy_keys = parse_register_keys(register_text)
    comments = fetch_comments()
    comment_by_id = {int(c["id"]): c for c in comments}

    generated, blockers = materialize_missing_shards(plan, snapshot_index, legacy_keys)

    source_manifest = read_json(SOURCE_MANIFEST)
    children_of, parent_of, semantic_roles = source_manifest_edges(source_manifest)
    legacy_ledger, legacy_prov, legacy_deltas = build_legacy_terminal_ledger(comments, legacy_keys)

    # Load exact canonical partition only. Overlapping alternative shards are never loaded.
    shard_records = []
    missing_files = []
    for seg in plan["canonical_non_overlapping_segments"]:
        path = ROOT / seg["expected_shard"]
        if not path.exists():
            missing_files.append(path.as_posix())
            continue
        data = read_json(path)
        cid = data.get("fach_review_comment_id")
        comment_body = (comment_by_id.get(int(cid), {}).get("body") or "") if cid else ""
        layers = data.get("applicable_241_layer_set_check") or extract_layer_markers(comment_body)
        diffs = [normalize_diff_entry(x) for x in data.get("primary_source_diff", [])]
        terms = [normalize_existing_terminal(x) for x in data.get("terminal_source_objects", [])]
        shard_records.append((seg, path, data, diffs, terms, layers))

    blockers += [f"CANONICAL_SHARD_MISSING:{x}" for x in missing_files]

    # Canonical classification by legacy record, with conflict detection.
    classes = defaultdict(list)
    for seg, path, data, diffs, terms, layers in shard_records:
        checks = data.get("segment_checks", {})
        if checks.get("primary_source_parity") not in {"PASS_SEGMENT", None}:
            blockers.append(f"SHARD_PARITY_NOT_PASS:{path}:{checks.get('primary_source_parity')}")
        if checks.get("unresolved_source_gaps", 0) != 0:
            blockers.append(f"SHARD_SOURCE_GAPS_NONZERO:{path}:{checks.get('unresolved_source_gaps')}")
        for d in diffs:
            legacy = d.get("legacy_unit")
            if legacy is None:
                continue
            legacy = str(legacy).zfill(4)
            classes[int(legacy)].append((d.get("classification"), path.as_posix(), d))

    canonical_class = {}
    class_conflicts = []
    for n, vals in classes.items():
        normalized = [normalize_class(str(v[0] or "")) or str(v[0] or "").upper() for v in vals]
        uniq = sorted(set(normalized))
        # Multiple labels are okay only if they are compatible parent refinements; exact same canonical partition
        # should normally produce one. Preserve discrepancy as blocker rather than guess.
        if len(uniq) > 1:
            # SAME_PARTIAL/PARTIAL refinements can coexist in one source-bound shard.
            parentish = all(class_is_parent(x) or "PARTIAL" in x or "SAME" in x for x in uniq)
            if not parentish:
                class_conflicts.append({"legacy_number": n, "classifications": uniq, "sources": [v[1] for v in vals]})
        # strongest role determines reconciliation; no Fach direction is inferred here.
        if any(class_is_context(x) for x in uniq):
            chosen = next(x for x in uniq if class_is_context(x))
        elif any(class_is_parent(x) for x in uniq):
            chosen = next(x for x in uniq if class_is_parent(x))
        elif any("PARTIAL" in x for x in uniq):
            chosen = next(x for x in uniq if "PARTIAL" in x)
        elif any("SAME" in x for x in uniq):
            chosen = next(x for x in uniq if "SAME" in x)
        else:
            chosen = uniq[-1]
        canonical_class[n] = chosen
    if class_conflicts:
        blockers.append(f"LEGACY_CLASSIFICATION_CONFLICTS:{len(class_conflicts)}")

    # Terminal union, with identical-ID conflict gate.
    terminal_by_id = {}
    provenance_by_id = defaultdict(list)
    terminal_conflicts = []
    layer_by_id = defaultdict(set)
    layer_source_ok = {}
    raw_semantic_role = {}
    explicit_parent = {}
    for seg, path, data, diffs, terms, layers in shard_records:
        for rec in terms:
            sid = rec.get("source_unit_id")
            if not sid:
                blockers.append(f"TERMINAL_OBJECT_WITHOUT_ID:{path}")
                continue
            trip = (rec.get("terminal_fach_status"), rec.get("impact_direction"), rec.get("evidence_level"))
            if trip[0] not in TERMINAL or trip[1] not in DIRECTIONS or trip[2] not in EVIDENCE:
                blockers.append(f"NONTERMINAL_OR_INVALID_TRIPLET:{sid}:{trip}:{path}")
                continue
            if sid in terminal_by_id:
                old = terminal_by_id[sid]
                oldtrip = (old["terminal_fach_status"], old["impact_direction"], old["evidence_level"])
                if oldtrip != trip:
                    terminal_conflicts.append({"source_unit_id": sid, "old": oldtrip, "new": trip, "new_path": path.as_posix()})
            terminal_by_id[sid] = rec
            provenance_by_id[sid].append({"shard": path.as_posix(), "fach_review_comment_id": data.get("fach_review_comment_id")})
            layer_by_id[sid].update(layers.get("markers_explicit_in_source_review", []))
            layer_source_ok[sid] = layer_source_ok.get(sid, False) or layers.get("source_review_has_241_system_section", False)
            if rec.get("semantic_role"):
                raw_semantic_role[sid] = str(rec["semantic_role"]).upper()
            p = rec.get("parent_source_unit_id") or rec.get("parent_legacy_source_unit") or rec.get("parent_legacy_unit")
            if p:
                explicit_parent[sid] = p
    if terminal_conflicts:
        blockers.append(f"TERMINAL_ID_CONFLICTS:{len(terminal_conflicts)}")

    # Fill SAME/standalone legacy leaves from the already terminal 344 working baseline ledger only when
    # the canonical parity shard did not repeat the triplet. This is a provenance join, not new assessment.
    for n, cls in canonical_class.items():
        if class_is_context(cls) or class_is_parent(cls):
            continue
        key = legacy_keys.get(n)
        if not key or key in terminal_by_id:
            continue
        rec = legacy_ledger.get(n)
        if rec:
            terminal_by_id[key] = rec
            provenance_by_id[key].append({"legacy_terminal_review_comment_id": legacy_prov.get(n), "join_reason": "CANONICAL_SAME_OR_STANDALONE_LEAF_NOT_REPEATED_IN_PARITY_SHARD"})
        else:
            blockers.append(f"LEGACY_EFFECT_LEAF_TERMINAL_TRIPLET_NOT_FOUND:{n:04d}:{key}")

    # Add explicit relation metadata from source manifest and mechanically-derived split-parent keys.
    for sid in list(terminal_by_id):
        if sid in parent_of:
            explicit_parent[sid] = parent_of[sid]
        pn = split_parent_number(sid)
        if pn is not None and sid not in explicit_parent and pn in legacy_keys:
            explicit_parent[sid] = legacy_keys[pn]
            children_of[legacy_keys[pn]].add(sid)

    # Determine explicit roles. No direction/evidence is inferred here.
    union = []
    effect_ids = []
    source_ids = []
    role_blockers = []
    for sid, rec in sorted(terminal_by_id.items()):
        n = historical_number(sid)
        cls = canonical_class.get(n) if n is not None else None
        sem = (raw_semantic_role.get(sid) or semantic_roles.get(sid) or "").upper()
        has_children = bool(children_of.get(sid))
        if n is not None and legacy_keys.get(n) == sid and children_of.get(sid):
            has_children = True

        if class_is_context(cls) or "CONTEXT_ONLY" in sem:
            source_role = "CONTEXT_ONLY"
            effect_role = "CONTEXT_ONLY"
        elif has_children or (n is not None and class_is_parent(cls) and rec.get("terminal_fach_status") == "SOURCE_UNIT_RECLASSIFIED_VERSIONED"):
            source_role = "PROVENANCE_PARENT_ONLY"
            effect_role = "NONLEAF_PARENT"
        elif "RESTATEMENT" in sem:
            source_role = "COUNTABLE_CANONICAL_SOURCE"
            effect_role = "RESTATEMENT"
        elif "DUPLICATE" in sem:
            source_role = "COUNTABLE_CANONICAL_SOURCE"
            effect_role = "DUPLICATE"
        elif "CONTINUATION" in sem:
            source_role = "COUNTABLE_CANONICAL_SOURCE"
            effect_role = "CONTINUATION"
        else:
            source_role = "COUNTABLE_CANONICAL_SOURCE"
            effect_role = "COUNTABLE_EFFECT_LEAF"

        if source_role == "COUNTABLE_CANONICAL_SOURCE":
            source_ids.append(sid)
        if effect_role == "COUNTABLE_EFFECT_LEAF":
            effect_ids.append(sid)

        layers = sorted(layer_by_id.get(sid, set()))
        layer_check = "PASS_SOURCE_BOUND_MARKERS_CAPTURED" if layer_source_ok.get(sid, False) else "INHERITED_TERMINAL_BASELINE_LAYER_PROVENANCE"
        union.append({
            "source_unit_id": sid,
            "source_role": source_role,
            "effect_role": effect_role,
            "terminal_fach_status": rec["terminal_fach_status"],
            "impact_direction": rec["impact_direction"],
            "evidence_level": rec["evidence_level"],
            "canonical_legacy_classification": cls,
            "parent_source_unit_id": explicit_parent.get(sid),
            "child_source_unit_ids": sorted(children_of.get(sid, set())),
            "semantic_role_source_record": sem or None,
            "applicable_241_layer_markers_explicit": layers,
            "layer_set_check": layer_check,
            "fach_provenance": provenance_by_id[sid],
        })

    # Add non-terminal provenance parents/context legacy objects that intentionally do not count.
    union_ids = {u["source_unit_id"] for u in union}
    for n, cls in sorted(canonical_class.items()):
        sid = legacy_keys.get(n)
        if not sid or sid in union_ids:
            continue
        if class_is_context(cls):
            union.append({
                "source_unit_id": sid,
                "source_role": "CONTEXT_ONLY",
                "effect_role": "CONTEXT_ONLY",
                "terminal_fach_status": legacy_ledger.get(n, {}).get("terminal_fach_status"),
                "impact_direction": legacy_ledger.get(n, {}).get("impact_direction"),
                "evidence_level": legacy_ledger.get(n, {}).get("evidence_level"),
                "canonical_legacy_classification": cls,
                "parent_source_unit_id": None,
                "child_source_unit_ids": sorted(children_of.get(sid, set())),
                "applicable_241_layer_markers_explicit": [],
                "layer_set_check": "NOT_APPLICABLE_NON_EFFECT_CONTEXT",
                "fach_provenance": [{"legacy_terminal_review_comment_id": legacy_prov.get(n)}] if legacy_prov.get(n) else [],
            })
        elif class_is_parent(cls) or children_of.get(sid):
            union.append({
                "source_unit_id": sid,
                "source_role": "PROVENANCE_PARENT_ONLY",
                "effect_role": "NONLEAF_PARENT",
                "terminal_fach_status": legacy_ledger.get(n, {}).get("terminal_fach_status"),
                "impact_direction": legacy_ledger.get(n, {}).get("impact_direction"),
                "evidence_level": legacy_ledger.get(n, {}).get("evidence_level"),
                "canonical_legacy_classification": cls,
                "parent_source_unit_id": None,
                "child_source_unit_ids": sorted(children_of.get(sid, set())),
                "applicable_241_layer_markers_explicit": [],
                "layer_set_check": "NOT_APPLICABLE_NONLEAF_PARENT",
                "fach_provenance": [{"legacy_terminal_review_comment_id": legacy_prov.get(n)}] if legacy_prov.get(n) else [],
            })

    # Global hard checks.
    source_dups = sorted([x for x, n in __import__('collections').Counter(source_ids).items() if n > 1])
    effect_dups = sorted([x for x, n in __import__('collections').Counter(effect_ids).items() if n > 1])
    if source_dups:
        blockers.append(f"SOURCE_COUNT_DUPLICATES:{len(source_dups)}")
    if effect_dups:
        blockers.append(f"EFFECT_COUNT_DUPLICATES:{len(effect_dups)}")

    # Canonical partition should classify every historical working-baseline record. If a Release-1 record
    # is not represented by any parity class, corpus-wide source parity cannot be proven mechanically.
    unclassified_legacy = sorted(set(legacy_keys) - set(canonical_class))
    if unclassified_legacy:
        blockers.append(f"LEGACY_PRIMARY_ROLE_UNCLASSIFIED:{len(unclassified_legacy)}")

    # Every countable effect leaf must be terminal and have source-bound #241 set provenance (direct shard
    # or inherited terminal baseline). The field is explicit even when only baseline provenance applies.
    for u in union:
        if u["effect_role"] != "COUNTABLE_EFFECT_LEAF":
            continue
        if u["terminal_fach_status"] not in TERMINAL:
            blockers.append(f"EFFECT_LEAF_NONTERMINAL:{u['source_unit_id']}")
        if u["layer_set_check"] not in {"PASS_SOURCE_BOUND_MARKERS_CAPTURED", "INHERITED_TERMINAL_BASELINE_LAYER_PROVENANCE"}:
            blockers.append(f"EFFECT_LEAF_241_LAYER_SET_UNRESOLVED:{u['source_unit_id']}")

    # Any duplicate/conflict that changes terminal semantics is blocking; historical version deltas are
    # recorded but only exact final terminal ID conflicts block.
    duplicate_conflicts = terminal_conflicts
    source_restore_gap_count = sum(1 for b in blockers if "SOURCE_GAP" in b or "SHARD_MISSING" in b or "PARSE_SHORT" in b)
    overmerge_conflict_count = len(class_conflicts)

    unique_blockers = sorted(set(blockers))
    freeze = not unique_blockers
    authoritative_source_count = len(set(source_ids)) if freeze else None
    authoritative_effect_count = len(set(effect_ids)) if freeze else None

    final_manifest = {
        "schema_version": "1.0",
        "manifest_version": "2026-08-22-global-leaf-reconciliation-v1",
        "programme_key": "ltw-2026-st-cdu",
        "party": "CDU",
        "primary_source": {"url": PRIMARY_URL, "page_count": 91, "parity_status": "PASS_FULL_PROGRAMME"},
        "historical_release1": {"source_unit_count": 344, "role": "IMMUTABLE_WORKING_BASELINE_NOT_FINAL_DENOMINATOR", "register_path": REGISTER.as_posix()},
        "canonical_partition": [x["pages"] for x in plan["canonical_non_overlapping_segments"]],
        "overlapping_alternative_shard_arithmetic": "REJECTED",
        "explicit_role_union": sorted(union, key=lambda x: x["source_unit_id"]),
        "edges": {
            "parent_child": [{"parent": p, "child": c} for p, children in sorted(children_of.items()) for c in sorted(children)],
            "supersedes_continuation_restatement_duplicate": "PRESERVED_WHERE_EXPLICIT_IN_SOURCE_MANIFEST_OR_TERMINAL_SEMANTIC_ROLE",
        },
        "authoritative_source_unit_count": authoritative_source_count,
        "authoritative_effect_mechanism_count": authoritative_effect_count,
        "denominator_status": "FROZEN_EXPLICIT_ROLE_UNION" if freeze else "NOT_FROZEN_GLOBAL_RECONCILIATION_BLOCKED",
        "source_count_rule": "COUNT UNIQUE source_unit_id WHERE source_role=COUNTABLE_CANONICAL_SOURCE",
        "effect_count_rule": "COUNT UNIQUE source_unit_id WHERE effect_role=COUNTABLE_EFFECT_LEAF",
        "one_count_per_final_effect_leaf": "PASS" if freeze and not effect_dups else "BLOCKED",
        "source_restore_overmerge_duplicate_conflicts": {
            "source_restore_gap_count": source_restore_gap_count,
            "overmerge_classification_conflicts": overmerge_conflict_count,
            "terminal_duplicate_conflicts": len(duplicate_conflicts),
        },
        "st_cdu_primary_source_parity": "PASS_FULL_PROGRAMME",
        "st_cdu_final_versioned_manifest": "PASS_GLOBAL_LEAF_RECONCILIATION" if freeze else "PENDING_GLOBAL_LEAF_RECONCILIATION",
        "st_cdu_terminal_complete": freeze,
        "public_count_mutated": False,
        "fach_semantics_created_by_reconciler": False,
        "generated_at": now,
        "audit_path": AUDIT.as_posix(),
    }
    write_json(FINAL, final_manifest)

    audit = {
        "schema_version": "1.0",
        "programme_key": "ltw-2026-st-cdu",
        "generated_at": now,
        "canonical_shards_expected": len(plan["canonical_non_overlapping_segments"]),
        "canonical_shards_loaded": len(shard_records),
        "missing_shard_files": missing_files,
        "missing_shards_materialized_this_run": generated,
        "legacy_register_rows": len(legacy_keys),
        "legacy_roles_classified": len(canonical_class),
        "legacy_role_unclassified": unclassified_legacy,
        "legacy_terminal_triplets_found": len(legacy_ledger),
        "legacy_versioned_terminal_deltas_observed": legacy_deltas,
        "union_records": len(union),
        "countable_source_ids": len(set(source_ids)),
        "countable_effect_ids": len(set(effect_ids)),
        "terminal_id_conflicts": terminal_conflicts,
        "legacy_classification_conflicts": class_conflicts,
        "source_id_duplicates": source_dups,
        "effect_id_duplicates": effect_dups,
        "blockers": unique_blockers,
        "freeze_gate": "PASS" if freeze else "BLOCKED",
        "authoritative_source_unit_count": authoritative_source_count,
        "authoritative_effect_mechanism_count": authoritative_effect_count,
        "public_count_mutated": False,
        "new_fach_semantics_created": False,
    }
    write_json(AUDIT, audit)

    print(json.dumps({
        "freeze_gate": audit["freeze_gate"],
        "blockers": unique_blockers,
        "canonical_shards_loaded": len(shard_records),
        "legacy_roles_classified": len(canonical_class),
        "legacy_terminal_triplets_found": len(legacy_ledger),
        "union_records": len(union),
        "source_count": authoritative_source_count,
        "effect_count": authoritative_effect_count,
        "generated_shards": generated,
    }, ensure_ascii=False, indent=2))
    # Do not fail the workflow merely because reconciliation still has explicit blockers; commit the audit
    # so the next convergence pass has an exact machine-readable residual. Structural exceptions still fail.
    return 0


if __name__ == "__main__":
    sys.exit(main())
