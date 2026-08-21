#!/usr/bin/env python3
"""Materialize the final Sachsen-Anhalt 2026 BSW source-unit union, fail closed.

This script performs *source-role mechanics only*. It MUST NOT create fach judgements,
DNS mappings, Recommendations, scores, directions or evidence grades.

Inputs are the immutable historical register, R10 role checkpoint, R14 exact versioned
stable-ID union, an optional collision report produced by audit_bsw_final_union.py, and
an explicit relation registry. It writes a candidate/final manifest with every historical
commitment key and every versioned ID represented exactly once.

Authoritative denominator freeze is allowed only when:
- the 311 historical rows are exact and every role is explicit (no PEND),
- the 380 versioned IDs are exact/distinct,
- source relation registry has no unresolved relation rows,
- all relation targets exist and the directed graph is acyclic,
- collision scan has no unresolved candidates,
- corpus-wide source-gap counters are explicitly zero,
- terminal-fach and applicable-#241 set checks are explicitly PASS in the relation registry.

The only default conversion this tool can make is R10 PEND -> KEEP_ATOMIC, and even that
is gated behind a clean complete-union collision report plus the inherited source gates.
That conversion is a source-role assertion, not a fach judgement.
"""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict, deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT_DIR = ROOT / "content/audits/sachsen-anhalt"
REGISTER = ROOT / "woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-bsw-zusagen.md"
R10 = AUDIT_DIR / "bsw-source-unit-manifest-reconciliation-r10.json"
R14 = AUDIT_DIR / "bsw-source-unit-union-r14.json"
DEFAULT_REL = AUDIT_DIR / "bsw-final-union-relation-registry-r15.json"

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


def topo(nodes: set[str], edges: list[dict]) -> tuple[bool, list[str], list[str]]:
    adj = defaultdict(list)
    indeg = {n: 0 for n in nodes}
    edge_errors = []
    for e in edges:
        a, b = e.get("from"), e.get("to")
        if a not in nodes or b not in nodes:
            edge_errors.append(f"missing target/node: {a!r}->{b!r}")
            continue
        if a == b:
            edge_errors.append(f"self-loop: {a}")
            continue
        adj[a].append(b)
        indeg[b] += 1
    q = deque(sorted(n for n, d in indeg.items() if d == 0))
    order = []
    while q:
        n = q.popleft()
        order.append(n)
        for nxt in adj[n]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    cyclic = sorted(n for n, d in indeg.items() if d > 0)
    return (not edge_errors and not cyclic, order, edge_errors + ([f"cycle nodes: {cyclic}"] if cyclic else []))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--relations", default=str(DEFAULT_REL.relative_to(ROOT)))
    ap.add_argument("--collision-report", default="")
    ap.add_argument("--output", default="content/audits/sachsen-anhalt/bsw-final-union-manifest-r15.json")
    ap.add_argument("--allow-default-pend-keep-atomic", action="store_true")
    args = ap.parse_args()

    r10, r14 = load(R10), load(R14)
    rel_path = ROOT / args.relations
    rel = load(rel_path) if rel_path.exists() else {}
    hist = parse_register(REGISTER.read_text(encoding="utf-8"))
    hist_by_ord = {r["ordinal"]: r for r in hist}
    role_codes = dict(r10["current_register_final_role_matrix"]["role_by_historical_ordinal"])
    versioned_ids = list(r14["all_versioned_ids"])

    blockers = []
    if len(hist) != 311 or len(hist_by_ord) != 311:
        blockers.append(f"HISTORICAL_REGISTER_NOT_311:{len(hist)}")
    if set(role_codes) != set(hist_by_ord):
        blockers.append("R10_ROLE_KEYS_NOT_EQUAL_REGISTER_ORDINALS")
    if len(versioned_ids) != 380 or len(set(versioned_ids)) != 380:
        blockers.append(f"VERSIONED_UNION_NOT_380_DISTINCT:{len(versioned_ids)}/{len(set(versioned_ids))}")
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
        scan = collision.get("pending_collision_scan", {})
        if scan.get("pending_total") != 220:
            blockers.append(f"COLLISION_SCAN_PENDING_TOTAL:{scan.get('pending_total')}")
        if scan.get("review_candidate_count", 0):
            resolved = set(rel.get("collision_candidate_resolutions", {}).keys())
            unresolved = [o for o in scan.get("review_candidate_ordinals", []) if o not in resolved]
            if unresolved:
                blockers.append("UNRESOLVED_COLLISION_CANDIDATES:" + ",".join(unresolved))
    elif args.allow_default_pend_keep_atomic:
        blockers.append("DEFAULT_PEND_KEEP_ATOMIC_REQUIRES_COLLISION_REPORT")

    hist_overrides = rel.get("historical_role_overrides", {})
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
                    basis = "FULL_UNION_NEGATIVE_COLLISION_SET_CHECK"
                elif o in rel.get("collision_candidate_resolutions", {}):
                    code = rel["collision_candidate_resolutions"][o].get("role_code", "")
                    basis = "SOURCE_BOUND_COLLISION_RESOLUTION"
            if code == "PEND" or code not in ROLE_EXPANSION:
                blockers.append(f"HISTORICAL_ROLE_UNRESOLVED:{o}")
                historical_rows.append({**h, "final_role":"PENDING_EXPLICIT_SOURCE_ROLE", "active":False, "role_basis":basis})
                continue
        if code not in ROLE_EXPANSION:
            blockers.append(f"INVALID_ROLE_CODE:{o}:{code}")
            continue
        role, active = ROLE_EXPANSION[code]
        row = {**h, "final_role":role, "active":active, "role_basis":basis}
        if o in rel.get("historical_relation_targets", {}):
            row["relation_targets"] = rel["historical_relation_targets"][o]
        historical_rows.append(row)

    # R14 is the post-cross-span set-wise versioned union. Its IDs are candidate active
    # versioned effect leaves. Any exception must be explicit in the relation registry.
    versioned_ex = rel.get("versioned_role_overrides", {})
    versioned_rows = []
    for uid in versioned_ids:
        ov = versioned_ex.get(uid, {})
        versioned_rows.append({
            "source_unit_id": uid,
            "final_role": ov.get("final_role", "ACTIVE_VERSIONED_EFFECT_LEAF"),
            "active": ov.get("active", True),
            "role_basis": ov.get("basis", "R14_EXACT_POST_DEDUP_UNION"),
            **({"relation_targets": ov["relation_targets"]} if ov.get("relation_targets") else {}),
        })

    # Relation registry is mandatory for every R10 KAC/SNL row and every explicit
    # versioned override; otherwise graph semantics are not fully materialized.
    required_target_ordinals = sorted(o for o,c in role_codes.items() if c in {"KAC","SNL"})
    for o in required_target_ordinals:
        if not rel.get("historical_relation_targets", {}).get(o):
            blockers.append(f"RELATION_TARGETS_MISSING:{o}")

    explicit_unresolved = rel.get("unresolved_source_relations", [])
    if explicit_unresolved:
        blockers.append("UNRESOLVED_SOURCE_RELATIONS:" + ",".join(map(str, explicit_unresolved)))

    nodes = {r["commitment_key"] for r in historical_rows} | set(versioned_ids)
    edges = rel.get("directed_edges", [])
    graph_ok, topo_order, graph_errors = topo(nodes, edges)
    if not graph_ok:
        blockers.extend("GRAPH:" + e for e in graph_errors)

    gap_counts = rel.get("resolved_gap_counts", {})
    required_gap_keys = ["ABSENT","PARTIAL_PARENT","OVERMERGED","TRUNCATED","RESTORE_GAP"]
    if any(gap_counts.get(k) != 0 for k in required_gap_keys):
        blockers.append("SOURCE_GAPS_NOT_ZERO:" + json.dumps({k:gap_counts.get(k) for k in required_gap_keys}, sort_keys=True))

    fach_set = rel.get("active_leaf_terminal_fach_set_check", {})
    layer_set = rel.get("active_leaf_241_layer_set_check", {})
    if fach_set.get("status") != "PASS":
        blockers.append("ACTIVE_LEAF_TERMINAL_FACH_SET_CHECK_NOT_PASS")
    if layer_set.get("status") != "PASS":
        blockers.append("ACTIVE_LEAF_241_SET_CHECK_NOT_PASS")

    active_hist = sum(1 for r in historical_rows if r.get("active"))
    active_ver = sum(1 for r in versioned_rows if r.get("active"))
    authoritative = active_hist + active_ver if not blockers else None

    manifest = {
        "manifest_id":"ST-BSW-FINAL-UNION-MANIFEST-R15",
        "scope":"Sachsen-Anhalt 2026 BSW Wahlprogramm only",
        "source_key":"ltw-2026-st-bsw",
        "primary_source":r10.get("primary_source"),
        "historical_register":r10.get("historical_register"),
        "source_role_only":True,
        "no_new_fach_semantics":True,
        "no_dns_synthesis":True,
        "no_recommendation_synthesis":True,
        "historical_final_role_rows":historical_rows,
        "versioned_final_role_rows":versioned_rows,
        "counts":{
            "historical_rows":len(historical_rows),
            "historical_active":active_hist,
            "historical_inactive":len(historical_rows)-active_hist,
            "versioned_rows":len(versioned_rows),
            "versioned_active":active_ver,
            "versioned_inactive":len(versioned_rows)-active_ver,
            "directed_relation_edges":len(edges),
        },
        "relation_graph":{
            "acyclic":graph_ok,
            "topological_node_count":len(topo_order),
            "errors":graph_errors,
        },
        "collision_scan":{
            "present":collision is not None,
            "unresolved_candidate_count":None if not collision else len([o for o in collision.get("pending_collision_scan",{}).get("review_candidate_ordinals",[]) if o not in rel.get("collision_candidate_resolutions",{})]),
        },
        "resolved_gap_counts":gap_counts,
        "active_leaf_terminal_fach_set_check":fach_set,
        "active_leaf_241_layer_set_check":layer_set,
        "completion":{
            "blockers":sorted(set(blockers)),
            "ST_BSW_PRIMARY_SOURCE_PARITY_FULL_PROGRAM":"PASS_FULL_PROGRAMME" if not blockers else "READY_FOR_UNION_MANIFEST_AND_FINAL_ROLE_MATRIX",
            "authoritative_denominator":authoritative,
            "authoritative_denominator_frozen":not blockers,
            "BSW_FULL_PROGRAM_FACH_COMPLETE":"PASS" if not blockers else False,
            "PR270_merge_ready":False,
            "next_step":"RECONCILE_ST_ONLY_ON_LATEST_MAIN_AND_RUN_EXACT_HEAD_GATES" if not blockers else "RESOLVE_LISTED_BLOCKERS_WITH_EXISTING_SOURCE_BOUND_FINDINGS_ONLY",
        },
    }

    out = ROOT / args.output
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(json.dumps(manifest["counts"] | manifest["completion"], ensure_ascii=False, indent=2))
    return 0 if not blockers else 2


if __name__ == "__main__":
    raise SystemExit(main())
