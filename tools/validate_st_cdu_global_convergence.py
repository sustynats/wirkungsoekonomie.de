#!/usr/bin/env python3
"""Hard structural validation for the CDU final explicit-role union.

No Fach semantics are created here. The validator only checks that the global
manifest produced from already source-bound #234 decisions is a complete,
non-overlapping, acyclic and internally consistent representation. If an
additional structural blocker is found, any premature denominator freeze is
revoked fail-closed. A deterministic SHA-256 seal is emitted only after every
freeze gate passes; it hashes the canonical role/edge/count state rather than
volatile generation metadata.
"""
from __future__ import annotations

import hashlib
import json
import pathlib
import re
from collections import Counter, defaultdict

ROOT = pathlib.Path("woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt")
FINAL = ROOT / "ltw-2026-st-cdu-final-versioned-manifest-v1.json"
AUDIT = ROOT / "ltw-2026-st-cdu-global-leaf-reconciliation-audit-v1.json"
SOURCE_MANIFEST = ROOT / "ltw-2026-st-cdu-source-unit-manifest-v2.json"
TERMINAL = {
    "EDITORIAL_V2_PLUS_APPROVED",
    "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
    "SOURCE_UNIT_RECLASSIFIED_VERSIONED",
}
PASS_LAYER = {
    "PASS_SOURCE_BOUND_MARKERS_CAPTURED",
    "INHERITED_TERMINAL_BASELINE_LAYER_PROVENANCE",
}
RELATION_KEYS = {
    "parent_source_unit_id": "PARENT_CHILD",
    "parent_legacy_source_unit": "PARENT_CHILD",
    "parent_legacy_unit": "PARENT_CHILD",
    "supersedes": "SUPERSEDES",
    "supersedes_source_unit_id": "SUPERSEDES",
    "supersedes_source_unit_ids": "SUPERSEDES",
    "continuation_of": "CONTINUATION",
    "continuation_of_source_unit_id": "CONTINUATION",
    "restatement_of": "RESTATEMENT",
    "restatement_of_source_unit_id": "RESTATEMENT",
    "duplicate_of": "DUPLICATE",
    "duplicate_of_source_unit_id": "DUPLICATE",
}


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, obj):
    path.write_text(
        json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def hist_no(sid: str | None):
    if not sid:
        return None
    m = re.search(r"ltw-2026-st-cdu-(\d{4})-", str(sid))
    return int(m.group(1)) if m else None


def normalize_ref(value, ids, hist_index):
    if value is None:
        return []
    if isinstance(value, dict):
        for key in ("source_unit_id", "id", "ref"):
            if value.get(key):
                return normalize_ref(value[key], ids, hist_index)
        return []
    if isinstance(value, list):
        out = []
        for item in value:
            out.extend(normalize_ref(item, ids, hist_index))
        return out
    text = str(value).strip()
    if text in ids:
        return [text]
    if re.fullmatch(r"\d{1,4}", text):
        sid = hist_index.get(int(text))
        return [sid] if sid else []
    m = re.search(r"(?:OF|TO|PARENT|LEGACY)[_:\- ]*(\d{4})\b", text.upper())
    if m:
        sid = hist_index.get(int(m.group(1)))
        return [sid] if sid else []
    return [text] if text.startswith(("ST-CDU-", "ltw-2026-st-cdu-")) else []


def collect_source_manifest_relations(obj, current_id, ids, hist_index, edges, unresolved):
    if isinstance(obj, dict):
        here = obj.get("source_unit_id") or current_id
        if here and here not in ids:
            here = str(here)
        for key, relation in RELATION_KEYS.items():
            if key not in obj or not here:
                continue
            refs = normalize_ref(obj.get(key), ids, hist_index)
            if not refs and obj.get(key) not in (None, [], ""):
                unresolved.append({"from": here, "relation": relation, "raw": obj.get(key)})
            for ref in refs:
                if relation == "PARENT_CHILD":
                    edges.append({"relation": relation, "from": ref, "to": here, "source": "source_manifest"})
                else:
                    edges.append({"relation": relation, "from": here, "to": ref, "source": "source_manifest"})
        for value in obj.values():
            collect_source_manifest_relations(value, here, ids, hist_index, edges, unresolved)
    elif isinstance(obj, list):
        for value in obj:
            collect_source_manifest_relations(value, current_id, ids, hist_index, edges, unresolved)


def semantic_role_relations(union, ids, hist_index):
    edges = []
    unresolved = []
    for row in union:
        sid = row["source_unit_id"]
        sem = str(row.get("semantic_role_source_record") or "").upper()
        if not sem:
            continue
        relation = None
        if "CONTINUATION" in sem:
            relation = "CONTINUATION"
        elif "RESTATEMENT" in sem:
            relation = "RESTATEMENT"
        elif "DUPLICATE" in sem:
            relation = "DUPLICATE"
        elif "SUPERSED" in sem:
            relation = "SUPERSEDES"
        if not relation:
            continue
        refs = normalize_ref(sem, ids, hist_index)
        refs = [x for x in refs if x != sid]
        if refs:
            for ref in refs:
                edges.append({"relation": relation, "from": sid, "to": ref, "source": "semantic_role"})
        elif any(token in sem for token in ("_OF_", "-OF-", "SUPERSED")):
            unresolved.append({"from": sid, "relation": relation, "raw": sem})
    return edges, unresolved


def dedupe_edges(edges):
    seen = set()
    out = []
    for e in edges:
        key = (e["relation"], e["from"], e["to"])
        if e["from"] == e["to"] or key in seen:
            continue
        seen.add(key)
        out.append(e)
    return sorted(out, key=lambda x: (x["relation"], x["from"], x["to"]))


def cycle_check(edges, node_ids):
    graph = defaultdict(list)
    for e in edges:
        if e["from"] in node_ids and e["to"] in node_ids:
            graph[e["from"]].append(e["to"])
    state = {}
    stack = []
    cycles = []

    def dfs(node):
        state[node] = 1
        stack.append(node)
        for nxt in graph.get(node, []):
            if state.get(nxt, 0) == 0:
                dfs(nxt)
            elif state.get(nxt) == 1:
                try:
                    i = stack.index(nxt)
                    cycles.append(stack[i:] + [nxt])
                except ValueError:
                    cycles.append([node, nxt, node])
        stack.pop()
        state[node] = 2

    for node in sorted(node_ids):
        if state.get(node, 0) == 0:
            dfs(node)
    uniq = []
    seen = set()
    for cyc in cycles:
        key = " -> ".join(cyc)
        if key not in seen:
            seen.add(key)
            uniq.append(cyc)
    return uniq


def frozen_union_sha256(final):
    """Hash only the canonical frozen role/edge/count state, never timestamps."""
    payload = {
        "programme_key": final.get("programme_key"),
        "primary_source_url": final.get("primary_source_url"),
        "primary_source_parity": final.get("primary_source_parity"),
        "canonical_partition": final.get("canonical_partition"),
        "explicit_role_union": final.get("explicit_role_union"),
        "resolved_typed_edges": (final.get("edges") or {}).get("resolved_typed_edges"),
        "authoritative_source_unit_count": final.get("authoritative_source_unit_count"),
        "authoritative_effect_mechanism_count": final.get("authoritative_effect_mechanism_count"),
        "source_count_rule": final.get("source_count_rule"),
        "effect_count_rule": final.get("effect_count_rule"),
    }
    canonical = json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def main():
    final = read(FINAL)
    audit = read(AUDIT)
    source_manifest = read(SOURCE_MANIFEST)
    union = final.get("explicit_role_union") or []
    ids = {row.get("source_unit_id") for row in union if row.get("source_unit_id")}
    hist_index = {}
    for sid in ids:
        n = hist_no(sid)
        if n is not None:
            hist_index.setdefault(n, sid)

    blockers = list(audit.get("blockers") or [])
    structural = []

    source_ids = [r["source_unit_id"] for r in union if r.get("source_role") == "COUNTABLE_CANONICAL_SOURCE"]
    effect_ids = [r["source_unit_id"] for r in union if r.get("effect_role") == "COUNTABLE_EFFECT_LEAF"]
    if len(source_ids) != len(set(source_ids)):
        structural.append(f"EXACTLY_ONE_SOURCE_COUNT_FAILED:{len(source_ids)-len(set(source_ids))}")
    if len(effect_ids) != len(set(effect_ids)):
        structural.append(f"EXACTLY_ONE_EFFECT_COUNT_FAILED:{len(effect_ids)-len(set(effect_ids))}")

    for row in union:
        sid = row.get("source_unit_id")
        erole = row.get("effect_role")
        srole = row.get("source_role")
        if erole == "COUNTABLE_EFFECT_LEAF":
            if row.get("terminal_fach_status") not in TERMINAL:
                structural.append(f"EFFECT_LEAF_NONTERMINAL:{sid}")
            if row.get("layer_set_check") not in PASS_LAYER:
                structural.append(f"EFFECT_LEAF_241_SET_CHECK_FAILED:{sid}:{row.get('layer_set_check')}")
        if erole == "NONLEAF_PARENT" and sid in effect_ids:
            structural.append(f"PARENT_AND_EFFECT_LEAF_DOUBLE_COUNT:{sid}")
        if erole in {"CONTINUATION", "RESTATEMENT", "DUPLICATE", "CONTEXT_ONLY", "NONLEAF_PARENT"} and sid in effect_ids:
            structural.append(f"NONCOUNT_EFFECT_ROLE_COUNTED:{sid}:{erole}")
        if srole == "PROVENANCE_PARENT_ONLY" and erole == "COUNTABLE_EFFECT_LEAF":
            structural.append(f"PROVENANCE_PARENT_EFFECT_COUNTED:{sid}")

    edges = []
    for e in (final.get("edges") or {}).get("parent_child", []):
        edges.append({"relation": "PARENT_CHILD", "from": e.get("parent"), "to": e.get("child"), "source": "builder"})

    unresolved = []
    collect_source_manifest_relations(source_manifest, None, ids, hist_index, edges, unresolved)
    sem_edges, sem_unresolved = semantic_role_relations(union, ids, hist_index)
    edges.extend(sem_edges)
    unresolved.extend(sem_unresolved)
    edges = dedupe_edges([e for e in edges if e.get("from") and e.get("to")])

    dangling = [e for e in edges if e["from"] not in ids or e["to"] not in ids]
    for e in dangling:
        structural.append(f"DANGLING_RELATION:{e['relation']}:{e['from']}->{e['to']}")
    for u in unresolved:
        structural.append(f"UNRESOLVED_RELATION:{u['relation']}:{u['from']}:{u['raw']}")

    internal_edges = [e for e in edges if e["from"] in ids and e["to"] in ids]
    cycles = cycle_check(internal_edges, ids)
    if cycles:
        structural.append(f"RELATION_GRAPH_CYCLES:{len(cycles)}")

    parents = defaultdict(set)
    for e in internal_edges:
        if e["relation"] == "PARENT_CHILD":
            parents[e["to"]].add(e["from"])
    multi_parent = {child: sorted(ps) for child, ps in parents.items() if len(ps) > 1}
    for child, ps in multi_parent.items():
        structural.append(f"MULTIPLE_PARENT_CONFLICT:{child}:{'|'.join(ps)}")

    structural = sorted(set(structural))
    all_blockers = sorted(set(blockers + structural))
    freeze = not all_blockers

    final.setdefault("edges", {})
    final["edges"]["resolved_typed_edges"] = internal_edges
    final["edges"]["typed_edge_counts"] = dict(sorted(Counter(e["relation"] for e in internal_edges).items()))
    final["relation_graph_acyclic"] = "PASS" if not cycles else "BLOCKED"
    final["relation_graph_cycles"] = cycles
    final["unresolved_relation_refs"] = unresolved
    final["dangling_relation_edges"] = dangling
    final["multiple_parent_conflicts"] = multi_parent
    final["one_count_per_final_effect_leaf"] = "PASS" if len(effect_ids) == len(set(effect_ids)) else "BLOCKED"

    if freeze:
        final["authoritative_source_unit_count"] = len(set(source_ids))
        final["authoritative_effect_mechanism_count"] = len(set(effect_ids))
        final["denominator_status"] = "FROZEN_EXPLICIT_ROLE_UNION"
        final["st_cdu_final_versioned_manifest"] = "PASS_GLOBAL_LEAF_RECONCILIATION"
        final["st_cdu_terminal_complete"] = True
        final["frozen_exact_union_sha256"] = frozen_union_sha256(final)
    else:
        final["authoritative_source_unit_count"] = None
        final["authoritative_effect_mechanism_count"] = None
        final["denominator_status"] = "NOT_FROZEN_GLOBAL_RECONCILIATION_BLOCKED"
        final["st_cdu_final_versioned_manifest"] = "PENDING_GLOBAL_LEAF_RECONCILIATION"
        final["st_cdu_terminal_complete"] = False
        final.pop("frozen_exact_union_sha256", None)

    audit["structural_validation"] = {
        "explicit_union_nodes": len(ids),
        "countable_source_nodes": len(set(source_ids)),
        "countable_effect_leaves": len(set(effect_ids)),
        "resolved_typed_edges": len(internal_edges),
        "edge_counts": dict(sorted(Counter(e["relation"] for e in internal_edges).items())),
        "relation_graph_acyclic": not cycles,
        "cycles": cycles,
        "dangling_edges": dangling,
        "unresolved_relation_refs": unresolved,
        "multiple_parent_conflicts": multi_parent,
        "blockers": structural,
        "new_fach_semantics_created": False,
        "public_count_mutated": False,
    }
    audit["blockers"] = all_blockers
    audit["freeze_gate"] = "PASS" if freeze else "BLOCKED"
    audit["authoritative_source_unit_count"] = final["authoritative_source_unit_count"]
    audit["authoritative_effect_mechanism_count"] = final["authoritative_effect_mechanism_count"]
    if freeze:
        audit["frozen_exact_union_sha256"] = final["frozen_exact_union_sha256"]
    else:
        audit.pop("frozen_exact_union_sha256", None)

    write(FINAL, final)
    write(AUDIT, audit)
    print(json.dumps({
        "freeze_gate": audit["freeze_gate"],
        "authoritative_source_unit_count": audit["authoritative_source_unit_count"],
        "authoritative_effect_mechanism_count": audit["authoritative_effect_mechanism_count"],
        "frozen_exact_union_sha256": audit.get("frozen_exact_union_sha256"),
        "structural_blockers": structural,
        "builder_blockers": blockers,
        "resolved_edge_counts": audit["structural_validation"]["edge_counts"],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
