#!/usr/bin/env python3
"""Mechanically add explicit terminal source-manifest nodes to the CDU union.

This convergence helper creates no Fach semantics. It only materializes source-unit
nodes whose exact terminal triplet and parent relation are already explicitly
stored in the versioned source manifest produced from #234 source-bound review.
It exists so the global graph cannot contain a relation to an explicit reviewed
child that is absent merely because that child was not repeated in a page-shard
snapshot.
"""
from __future__ import annotations

import json
import pathlib

ROOT = pathlib.Path("woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt")
SOURCE_MANIFEST = ROOT / "ltw-2026-st-cdu-source-unit-manifest-v2.json"
FINAL = ROOT / "ltw-2026-st-cdu-final-versioned-manifest-v1.json"
AUDIT = ROOT / "ltw-2026-st-cdu-global-leaf-reconciliation-audit-v1.json"

TERMINAL = {
    "EDITORIAL_V2_PLUS_APPROVED",
    "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
    "SOURCE_UNIT_RECLASSIFIED_VERSIONED",
}
DIRECTIONS = {"POSITIVE", "NEGATIVE", "NEUTRAL", "AMBIVALENT", "OPEN"}
EVIDENCE = {"HIGH", "MEDIUM", "LOW", "NOT_ASSESSABLE"}


def read(path: pathlib.Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: pathlib.Path, obj):
    path.write_text(
        json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def collect_explicit_terminal_nodes(manifest):
    nodes: dict[str, dict] = {}
    relations: set[tuple[str, str]] = set()

    def walk(obj, inherited_parent: str | None = None):
        if isinstance(obj, dict):
            sid = obj.get("source_unit_id")
            sid = str(sid) if sid else None
            explicit_parent = (
                obj.get("parent_source_unit_id")
                or obj.get("parent_legacy_source_unit")
                or obj.get("parent_legacy_unit")
                or inherited_parent
            )
            explicit_parent = str(explicit_parent) if explicit_parent else None

            status = obj.get("terminal_fach_status")
            direction = obj.get("impact_direction")
            evidence = obj.get("evidence_level")
            child_ids = [
                str(x.get("source_unit_id"))
                for x in obj.get("children", [])
                if isinstance(x, dict) and x.get("source_unit_id")
            ]
            if sid and status in TERMINAL and direction in DIRECTIONS and evidence in EVIDENCE:
                nodes[sid] = {
                    "source_unit_id": sid,
                    "terminal_fach_status": status,
                    "impact_direction": direction,
                    "evidence_level": evidence,
                    "parent_source_unit_id": explicit_parent,
                    "child_source_unit_ids": sorted(set(child_ids)),
                    "semantic_role_source_record": str(obj.get("semantic_role") or obj.get("source_role") or "").upper() or None,
                }
                if explicit_parent:
                    relations.add((explicit_parent, sid))
                for child in child_ids:
                    relations.add((sid, child))

            # A versioned split container may identify its parent by legacy_source_unit.
            container_parent = sid or obj.get("legacy_source_unit") or inherited_parent
            if container_parent:
                container_parent = str(container_parent)
            for key, value in obj.items():
                if key == "children" and isinstance(value, list):
                    for child in value:
                        walk(child, container_parent)
                else:
                    walk(value, inherited_parent)
        elif isinstance(obj, list):
            for value in obj:
                walk(value, inherited_parent)

    walk(manifest)
    return nodes, relations


def blocker_relation_resolved(blocker: str, ids: set[str]) -> bool:
    if not blocker.startswith("DANGLING_RELATION:") or "->" not in blocker:
        return False
    payload = blocker.rsplit(":", 1)[-1]
    left, right = payload.split("->", 1)
    return left in ids and right in ids


def main() -> int:
    manifest = read(SOURCE_MANIFEST)
    final = read(FINAL)
    audit = read(AUDIT)
    explicit_nodes, explicit_relations = collect_explicit_terminal_nodes(manifest)

    union = list(final.get("explicit_role_union") or [])
    by_id = {row.get("source_unit_id"): row for row in union if row.get("source_unit_id")}
    added = []

    # Add only nodes with explicit, already-reviewed terminal triplets.
    for sid, node in sorted(explicit_nodes.items()):
        if sid in by_id:
            continue
        has_children = bool(node.get("child_source_unit_ids"))
        sem = str(node.get("semantic_role_source_record") or "").upper()
        if has_children:
            source_role = "PROVENANCE_PARENT_ONLY"
            effect_role = "NONLEAF_PARENT"
        elif "CONTEXT_ONLY" in sem:
            source_role = "CONTEXT_ONLY"
            effect_role = "CONTEXT_ONLY"
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

        row = {
            "source_unit_id": sid,
            "source_role": source_role,
            "effect_role": effect_role,
            "terminal_fach_status": node["terminal_fach_status"],
            "impact_direction": node["impact_direction"],
            "evidence_level": node["evidence_level"],
            "canonical_legacy_classification": None,
            "parent_source_unit_id": node.get("parent_source_unit_id"),
            "child_source_unit_ids": node.get("child_source_unit_ids") or [],
            "semantic_role_source_record": node.get("semantic_role_source_record"),
            "applicable_241_layer_markers_explicit": [],
            "layer_set_check": "INHERITED_TERMINAL_BASELINE_LAYER_PROVENANCE",
            "fach_provenance": [{
                "source_manifest": SOURCE_MANIFEST.as_posix(),
                "join_reason": "EXPLICIT_SOURCE_MANIFEST_TERMINAL_NODE_NOT_REPEATED_IN_CANONICAL_PAGE_SHARD",
                "new_fach_semantics_created": False,
            }],
        }
        union.append(row)
        by_id[sid] = row
        added.append(sid)

    # Reconcile parent child arrays using only explicit manifest relations.
    for parent, child in sorted(explicit_relations):
        if parent in by_id and child in by_id:
            children = set(by_id[parent].get("child_source_unit_ids") or [])
            children.add(child)
            by_id[parent]["child_source_unit_ids"] = sorted(children)
            if not by_id[child].get("parent_source_unit_id"):
                by_id[child]["parent_source_unit_id"] = parent

    union = sorted(union, key=lambda r: str(r.get("source_unit_id") or ""))
    final["explicit_role_union"] = union
    final.setdefault("mechanical_source_manifest_node_materialization", {})
    final["mechanical_source_manifest_node_materialization"] = {
        "source_manifest": SOURCE_MANIFEST.as_posix(),
        "explicit_terminal_nodes_seen": len(explicit_nodes),
        "nodes_added": added,
        "nodes_added_count": len(added),
        "new_fach_semantics_created": False,
        "public_count_mutated": False,
    }

    ids = {row.get("source_unit_id") for row in union if row.get("source_unit_id")}
    audit["blockers"] = [
        b for b in (audit.get("blockers") or [])
        if not blocker_relation_resolved(str(b), ids)
    ]
    structural = audit.get("structural_validation") or {}
    if structural.get("blockers"):
        structural["blockers"] = [
            b for b in structural["blockers"]
            if not blocker_relation_resolved(str(b), ids)
        ]
    audit["structural_validation"] = structural
    audit["mechanical_source_manifest_node_materialization"] = final["mechanical_source_manifest_node_materialization"]

    write(FINAL, final)
    write(AUDIT, audit)
    print(json.dumps(final["mechanical_source_manifest_node_materialization"], ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
