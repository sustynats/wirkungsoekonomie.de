#!/usr/bin/env python3
"""Materialize the final Sachsen-Anhalt 2026 BSW source-unit union, fail closed.

Source-role mechanics only. This script MUST NOT create Fach judgements, DNS mappings,
Recommendations, scores, directions, evidence grades or key findings.

Inputs:
- immutable historical register + R10 explicit/pending role checkpoint,
- immutable R14 exact 380-ID front+A01-A09 versioned base union,
- R20 source-bound restore-leaf addendum for the four previously explicit restore gaps,
- R18 base relation registry + R20 source-role overlay,
- mechanical collision report from audit_bsw_final_union.py.

The authoritative freeze is allowed only when every historical/versioned row has an
explicit final role, collision candidates have an explicit source-role resolution,
relations/targets are complete, graph is acyclic, source gaps are zero, and existing
terminal-Fach/applicable-layer set checks are PASS.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict, deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT_DIR = ROOT / "content/audits/sachsen-anhalt"
REGISTER = ROOT / "woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-bsw-zusagen.md"
R10 = AUDIT_DIR / "bsw-source-unit-manifest-reconciliation-r10.json"
R14 = AUDIT_DIR / "bsw-source-unit-union-r14.json"
R20_ADDENDUM = AUDIT_DIR / "bsw-final-union-source-leaf-addendum-r20.json"
DEFAULT_REL = AUDIT_DIR / "bsw-final-union-relation-registry-r18.json"
DEFAULT_OVERLAY = AUDIT_DIR / "bsw-final-union-relation-overlay-r20.json"

ROLE_EXPANSION = {
    "KA": ("KEEP_ATOMIC", True),
    "KAC": ("KEEP_ATOMIC_PLUS_CHILDREN", True),
    "SNL": ("SUPERSEDED_NONLEAF", False),
    "CTX": ("CONTEXT_ONLY", False),
}


def parse_register(text: str) -> list[dict]:
    starts = list(re.finditer(r"^#### Eintrag (\d+)\s*$", text, re.M))
    rows = []
    for i, m in enumerate(starts):
        block = text[m.start(): starts[i + 1].start() if i + 1 < len(starts) else len(text)]
        ordinal = f"{int(m.group(1)):04d}"
        km = re.search(r"^\*\*commitment_key:\*\*\s*(\S+)\s*$", block, re.M)
        if not km:
            raise SystemExit(f"missing commitment_key at ordinal {ordinal}")
        pm = re.search(r"^\*\*page:\*\*\s*(\d+)", block, re.M)
        rows.append({
            "ordinal": ordinal,
            "commitment_key": km.group(1),
            "page": int(pm.group(1)) if pm else None,
        })
    return rows


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def merge_registry(base: dict, overlay: dict) -> dict:
    out = json.loads(json.dumps(base))
    map_fields = [
        "historical_role_overrides",
        "collision_candidate_resolutions",
        "versioned_role_overrides",
        "historical_relation_targets",
        "historical_relation_types",
    ]
    for field in map_fields:
        merged = dict(out.get(field, {}) or {})
        merged.update(overlay.get(field, {}) or {})
        out[field] = merged
    for field in [
        "unresolved_source_relations",
        "resolved_gap_counts",
        "active_leaf_terminal_fach_set_check",
        "active_leaf_241_layer_set_check",
    ]:
        if field in overlay:
            out[field] = overlay[field]
    stored = list(out.get("directed_edges", []) or []) + list(overlay.get("directed_edges", []) or [])
    out["directed_edges"] = stored
    out["overlay_id"] = overlay.get("overlay_id")
    return out


def topo(nodes: set[str], edges: list[dict]) -> tuple[bool, list[str], list[str]]:
    adj = defaultdict(list)
    indeg = {n: 0 for n in nodes}
    edge_errors = []
    seen_pairs = set()
    for e in edges:
        a, b = e.get("from"), e.get("to")
        if a not in nodes or b not in nodes:
            edge_errors.append(f"missing target/node: {a!r}->{b!r}")
            continue
        if a == b:
            edge_errors.append(f"self-loop: {a}")
            continue
        pair = (a, b)
        if pair in seen_pairs:
            continue
        seen_pairs.add(pair)
        adj[a].append(b)
        indeg[b] += 1
    q = deque(sorted(n for n, d in indeg.items() if d == 0))
    order = []
    while q:
        n = q.popleft()
        order.append(n)
        for nxt in sorted(adj[n]):
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    cyclic = sorted(n for n, d in indeg.items() if d > 0)
    return (not edge_errors and not cyclic, order, edge_errors + ([f"cycle nodes: {cyclic}"] if cyclic else []))


def role_relation(role_code: str, explicit_type: str | None = None) -> str:
    if explicit_type:
        return explicit_type
    if role_code == "SNL":
        return "SUPERSEDED_BY_CANONICAL_TARGET"
    if role_code == "KAC":
        return "HAS_CANONICAL_CHILD"
    return "EXPLICIT_SOURCE_BOUND_RELATION_TARGET"


def derive_explicit_edges(hist_by_ord: dict[str, dict], role_codes: dict[str, str], rel: dict) -> list[dict]:
    edges: list[dict] = []
    seen: set[tuple[str, str, str]] = set()
    relation_types = rel.get("historical_relation_types", {}) or {}
    for ordinal, targets in sorted((rel.get("historical_relation_targets") or {}).items()):
        row = hist_by_ord.get(str(ordinal))
        if not row:
            continue
        source = row["commitment_key"]
        rtype = role_relation(role_codes.get(str(ordinal), ""), relation_types.get(str(ordinal)))
        for target in targets or []:
            key = (source, str(target), rtype)
            if key in seen:
                continue
            seen.add(key)
            edges.append({
                "from": source,
                "to": str(target),
                "relation": rtype,
                "basis": "EXISTING_SOURCE_BOUND_RELATION_REGISTRY",
                "historical_ordinal": str(ordinal),
            })
    return edges


def canonical_hash(payload: dict) -> str:
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--relations", default=str(DEFAULT_REL.relative_to(ROOT)))
    ap.add_argument("--relation-overlay", default=str(DEFAULT_OVERLAY.relative_to(ROOT)))
    ap.add_argument("--collision-report", default="")
    ap.add_argument("--output", default="content/audits/sachsen-anhalt/bsw-final-union-manifest-r20.json")
    ap.add_argument("--allow-default-pend-keep-atomic", action="store_true")
    args = ap.parse_args()

    r10, r14, addendum = load(R10), load(R14), load(R20_ADDENDUM)
    rel_path = ROOT / args.relations
    overlay_path = ROOT / args.relation_overlay
    base_rel = load(rel_path) if rel_path.exists() else {}
    overlay = load(overlay_path) if overlay_path.exists() else {}
    rel = merge_registry(base_rel, overlay)
    hist = parse_register(REGISTER.read_text(encoding="utf-8"))
    hist_by_ord = {r["ordinal"]: r for r in hist}
    base_role_codes = dict(r10["current_register_final_role_matrix"]["role_by_historical_ordinal"])
    role_codes = dict(base_role_codes)
    base_versioned_ids = list(r14["all_versioned_ids"])
    addendum_rows = list(addendum.get("source_leaves", []))
    addendum_ids = [r.get("source_unit_id") for r in addendum_rows]
    versioned_ids = base_versioned_ids + addendum_ids

    blockers = []
    if len(hist) != 311 or len(hist_by_ord) != 311:
        blockers.append(f"HISTORICAL_REGISTER_NOT_311:{len(hist)}")
    if set(role_codes) != set(hist_by_ord):
        blockers.append("R10_ROLE_KEYS_NOT_EQUAL_REGISTER_ORDINALS")
    if len(base_versioned_ids) != 380 or len(set(base_versioned_ids)) != 380:
        blockers.append(f"R14_BASE_UNION_NOT_380_DISTINCT:{len(base_versioned_ids)}/{len(set(base_versioned_ids))}")
    if len(addendum_ids) != 11 or len(set(addendum_ids)) != 11:
        blockers.append(f"R20_ADDENDUM_NOT_11_DISTINCT:{len(addendum_ids)}/{len(set(addendum_ids))}")
    if set(base_versioned_ids) & set(addendum_ids):
        blockers.append("R20_ADDENDUM_OVERLAPS_R14_BASE")
    if len(versioned_ids) != 391 or len(set(versioned_ids)) != 391:
        blockers.append(f"EXTENDED_VERSIONED_UNION_NOT_391_DISTINCT:{len(versioned_ids)}/{len(set(versioned_ids))}")

    addendum_by_id = {r.get("source_unit_id"): r for r in addendum_rows}
    for uid, row in addendum_by_id.items():
        if not uid or not row.get("source_locator") or not row.get("terminal_fach_locator") or not row.get("applicable_241_layer_locator"):
            blockers.append(f"R20_ADDENDUM_PROVENANCE_INCOMPLETE:{uid}")

    inherited = r10.get("inherited_closed_gates", {})
    required_inherited = {
        "frontmatter_p0_p6": "PASS_FRONTMATTER_RECONCILED",
        "p7_p89": "PASS_SEGMENT_COVERAGE",
        "p87_p89_prior_gap": "CLOSED_FOR_THIS_SOURCE_SPAN",
        "final_page_context": "PASS_CLASSIFIED_NO_NEW_EFFECT_OBJECTS",
        "known_parent_edge_queue_unresolved": 0,
        "a07_record_set": "PASS_42_UNIQUE",
        "a04_a05_p37_boundary": "PASS_DISTINCT_EFFECT_OBJECTS",
        "known_explicit_psr_duplicate_relation_queue": 0,
    }
    for k, v in required_inherited.items():
        if inherited.get(k) != v:
            blockers.append(f"INHERITED_GATE:{k}={inherited.get(k)!r},expected={v!r}")

    collision = None
    if args.collision_report:
        cp = ROOT / args.collision_report
        if cp.exists():
            collision = load(cp)
        else:
            blockers.append(f"COLLISION_REPORT_MISSING:{args.collision_report}")
    if collision:
        if collision.get("hard_errors"):
            blockers.append("COLLISION_SCAN_HARD_ERRORS")
        vu = collision.get("versioned_union", {})
        if vu.get("extended_distinct_ids") not in (None, 391):
            blockers.append(f"COLLISION_SCAN_EXTENDED_UNION:{vu.get('extended_distinct_ids')}")
        scan = collision.get("pending_collision_scan", {})
        if scan.get("pending_total") != 220:
            blockers.append(f"COLLISION_SCAN_PENDING_TOTAL:{scan.get('pending_total')}")
        if scan.get("review_candidate_count", 0):
            resolved = set((rel.get("collision_candidate_resolutions") or {}).keys())
            unresolved = [o for o in scan.get("review_candidate_ordinals", []) if o not in resolved]
            if unresolved:
                blockers.append("UNRESOLVED_COLLISION_CANDIDATES:" + ",".join(unresolved))
    elif args.allow_default_pend_keep_atomic:
        blockers.append("DEFAULT_PEND_KEEP_ATOMIC_REQUIRES_COLLISION_REPORT")

    hist_overrides = rel.get("historical_role_overrides", {}) or {}
    collision_resolutions = rel.get("collision_candidate_resolutions", {}) or {}
    historical_rows = []
    for h in hist:
        o = h["ordinal"]
        code = role_codes[o]
        basis = "R10_EXPLICIT"
        if code == "PEND":
            ov = hist_overrides.get(o)
            if ov:
                code = ov.get("role_code", "")
                basis = ov.get("basis", "RELATION_REGISTRY")
            elif args.allow_default_pend_keep_atomic and collision and not collision.get("hard_errors"):
                scan = collision.get("pending_collision_scan", {})
                flagged = set(scan.get("review_candidate_ordinals", []))
                if o not in flagged:
                    code = "KA"
                    basis = "FULL_EXTENDED_UNION_NEGATIVE_COLLISION_SET_CHECK"
                elif o in collision_resolutions:
                    code = collision_resolutions[o].get("role_code", "")
                    basis = collision_resolutions[o].get("basis", "SOURCE_BOUND_COLLISION_RESOLUTION")
                    if collision_resolutions[o].get("relation_targets"):
                        rel.setdefault("historical_relation_targets", {})[o] = collision_resolutions[o]["relation_targets"]
                    if collision_resolutions[o].get("relation_type"):
                        rel.setdefault("historical_relation_types", {})[o] = collision_resolutions[o]["relation_type"]
            if code == "PEND" or code not in ROLE_EXPANSION:
                blockers.append(f"HISTORICAL_ROLE_UNRESOLVED:{o}")
                historical_rows.append({**h, "final_role":"PENDING_EXPLICIT_SOURCE_ROLE", "active":False, "role_basis":basis})
                continue
        if code not in ROLE_EXPANSION:
            blockers.append(f"INVALID_ROLE_CODE:{o}:{code}")
            continue
        role_codes[o] = code
        role, active = ROLE_EXPANSION[code]
        row = {**h, "final_role":role, "active_effect_leaf":active, "count_contribution":1 if active else 0, "role_basis":basis}
        if o in (rel.get("historical_relation_targets", {}) or {}):
            row["relation_targets"] = rel["historical_relation_targets"][o]
        historical_rows.append(row)

    versioned_ex = rel.get("versioned_role_overrides", {}) or {}
    versioned_rows = []
    for uid in versioned_ids:
        ov = versioned_ex.get(uid, {})
        active = bool(ov.get("active", True))
        row = {
            "source_unit_id": uid,
            "final_role": ov.get("final_role", "ACTIVE_VERSIONED_EFFECT_LEAF"),
            "active_effect_leaf": active,
            "count_contribution": 1 if active else 0,
            "role_basis": ov.get("basis", "R20_EXTENDED_EXACT_SOURCE_BOUND_UNION" if uid in addendum_by_id else "R14_EXACT_POST_DEDUP_UNION"),
        }
        if ov.get("relation_targets"):
            row["relation_targets"] = ov["relation_targets"]
        if uid in addendum_by_id:
            row["source_locator"] = addendum_by_id[uid]["source_locator"]
            row["terminal_fach_locator"] = addendum_by_id[uid]["terminal_fach_locator"]
            row["applicable_241_layer_locator"] = addendum_by_id[uid]["applicable_241_layer_locator"]
        versioned_rows.append(row)

    required_target_ordinals = sorted(o for o,c in role_codes.items() if c in {"KAC","SNL"})
    explicit_targets = rel.get("historical_relation_targets", {}) or {}
    for o in required_target_ordinals:
        if not explicit_targets.get(o):
            blockers.append(f"RELATION_TARGETS_MISSING:{o}")

    explicit_unresolved = [str(o) for o in (rel.get("unresolved_source_relations", []) or [])]
    if explicit_unresolved:
        blockers.append("UNRESOLVED_SOURCE_RELATIONS:" + ",".join(explicit_unresolved))

    nodes = {r["commitment_key"] for r in historical_rows} | set(versioned_ids)
    stored_edges = rel.get("directed_edges", []) or []
    derived_edges = derive_explicit_edges(hist_by_ord, role_codes, rel)
    edge_map = {}
    for e in stored_edges + derived_edges:
        key = (e.get("from"), e.get("to"), e.get("relation"))
        edge_map[key] = e
    edges = [edge_map[k] for k in sorted(edge_map)]
    graph_ok, topo_order, graph_errors = topo(nodes, edges)
    if not graph_ok:
        blockers.extend("GRAPH:" + e for e in graph_errors)

    relation_targets_missing = sorted({str(t) for targets in explicit_targets.values() for t in (targets or []) if str(t) not in nodes})
    if relation_targets_missing:
        blockers.append("RELATION_TARGETS_NOT_IN_UNION:" + ",".join(relation_targets_missing))

    gap_counts = rel.get("resolved_gap_counts", {}) or {}
    required_gap_keys = ["ABSENT","PARTIAL_PARENT","OVERMERGED","TRUNCATED","RESTORE_GAP"]
    if any(gap_counts.get(k) != 0 for k in required_gap_keys):
        blockers.append("SOURCE_GAPS_NOT_ZERO:" + json.dumps({k:gap_counts.get(k) for k in required_gap_keys}, sort_keys=True))

    fach_set = rel.get("active_leaf_terminal_fach_set_check", {}) or {}
    layer_set = rel.get("active_leaf_241_layer_set_check", {}) or {}
    if fach_set.get("status") != "PASS":
        blockers.append("ACTIVE_LEAF_TERMINAL_FACH_SET_CHECK_NOT_PASS")
    if layer_set.get("status") != "PASS":
        blockers.append("ACTIVE_LEAF_241_SET_CHECK_NOT_PASS")

    unresolved_roles = [r for r in historical_rows if r.get("final_role") == "PENDING_EXPLICIT_SOURCE_ROLE"]
    if unresolved_roles:
        blockers.append(f"PEND_NOT_ZERO:{len(unresolved_roles)}")

    active_hist = sum(r.get("count_contribution", 0) for r in historical_rows)
    active_ver = sum(r.get("count_contribution", 0) for r in versioned_rows)
    inactive_hist = len(historical_rows) - active_hist
    inactive_ver = len(versioned_rows) - active_ver

    role_counts_hist = Counter(r.get("final_role") for r in historical_rows)
    role_counts_ver = Counter(r.get("final_role") for r in versioned_rows)
    count_vector = [r.get("count_contribution") for r in historical_rows + versioned_rows]
    if any(v not in (0, 1) for v in count_vector):
        blockers.append("COUNT_CONTRIBUTION_NOT_BINARY")

    authoritative = active_hist + active_ver if not blockers else None
    semantic_payload = {
        "historical_final_role_rows": historical_rows,
        "versioned_final_role_rows": versioned_rows,
        "directed_relation_edges": edges,
        "resolved_gap_counts": gap_counts,
        "terminal_fach_set_check": fach_set,
        "layer_241_set_check": layer_set,
    }
    semantic_hash = canonical_hash(semantic_payload)

    carried_relations = r14.get("relation_resolutions_carried_forward", {})
    manifest = {
        "manifest_id":"ST-BSW-FINAL-UNION-MANIFEST-R20",
        "scope":"Sachsen-Anhalt 2026 BSW Wahlprogramm only",
        "source_key":"ltw-2026-st-bsw",
        "primary_source":r10.get("primary_source"),
        "historical_register":r10.get("historical_register"),
        "source_role_only":True,
        "no_new_fach_semantics":True,
        "no_dns_synthesis":True,
        "no_recommendation_synthesis":True,
        "base_versioned_union":"R14:380_distinct",
        "source_bound_restore_addendum":"R20:11_distinct",
        "extended_versioned_union_set_check":{"rows":len(versioned_ids),"distinct":len(set(versioned_ids))},
        "historical_final_role_rows":historical_rows,
        "versioned_final_role_rows":versioned_rows,
        "counts":{
            "historical_rows":len(historical_rows),
            "historical_active_effect_leaves":active_hist,
            "historical_inactive_nonleaf_or_context":inactive_hist,
            "versioned_rows":len(versioned_rows),
            "versioned_active_effect_leaves":active_ver,
            "versioned_inactive_nonleaf_or_context":inactive_ver,
            "historical_final_role_counts":dict(sorted(role_counts_hist.items())),
            "versioned_final_role_counts":dict(sorted(role_counts_ver.items())),
            "directed_relation_edges":len(edges),
            "directed_relation_edges_stored":len(stored_edges),
            "directed_relation_edges_derived_from_explicit_targets":len(derived_edges),
            "count_contribution_zero_rows":sum(1 for v in count_vector if v == 0),
            "count_contribution_one_rows":sum(1 for v in count_vector if v == 1),
        },
        "relation_graph":{
            "acyclic":graph_ok,
            "topological_node_count":len(topo_order),
            "node_count":len(nodes),
            "target_existence_pass":not relation_targets_missing,
            "errors":graph_errors,
            "edges":edges,
        },
        "carried_forward_noncount_relation_resolutions":carried_relations,
        "unresolved_source_relations":explicit_unresolved,
        "resolved_gap_counts":gap_counts,
        "collision_scan":collision.get("pending_collision_scan") if collision else None,
        "active_leaf_terminal_fach_set_check":fach_set,
        "active_leaf_241_layer_set_check":layer_set,
        "union_semantic_sha256":semantic_hash,
        "blockers":sorted(set(blockers)),
        "completion":{
            "PEND":len(unresolved_roles),
            "unresolved_source_relations":len(explicit_unresolved),
            "authoritative_counts_frozen":authoritative is not None,
            "authoritative_active_source_unit_count":authoritative,
            "authoritative_effect_leaf_count":authoritative,
            "authoritative_non_effect_or_nonleaf_zero_count":inactive_hist + inactive_ver if authoritative is not None else None,
            "BSW_FULL_PROGRAM_FACH_COMPLETE":"PASS" if authoritative is not None else "BLOCKED",
            "ST_BSW_PRIMARY_SOURCE_PARITY_FULL_PROGRAM":"PASS_FULL_PROGRAMME" if authoritative is not None else "BLOCKED_FINAL_UNION_GATES",
            "PR270_merge_ready":False,
        },
    }
    out = ROOT / args.output
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({
        "output":str(out.relative_to(ROOT)),
        "historical_rows":len(historical_rows),
        "versioned_rows":len(versioned_rows),
        "active_hist":active_hist,
        "active_versioned":active_ver,
        "directed_edges":len(edges),
        "graph_acyclic":graph_ok,
        "unresolved_source_relations":explicit_unresolved,
        "PEND":len(unresolved_roles),
        "union_semantic_sha256":semantic_hash,
        "blockers":sorted(set(blockers)),
        "completion":manifest["completion"],
    },ensure_ascii=False,indent=2))
    return 0 if authoritative is not None else 2


if __name__ == "__main__":
    raise SystemExit(main())
