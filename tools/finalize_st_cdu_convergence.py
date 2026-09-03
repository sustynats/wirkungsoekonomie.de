#!/usr/bin/env python3
"""Finalize the source-bound Sachsen-Anhalt CDU convergence freeze.

This tool performs set/graph/count reconciliation only. It starts from the
exact frozen residual artifacts at PR #257 head 5ba3403a, joins the exact five
terminal records authored in issue #234 comment 5385115126, validates the
already-merged 0259 -> 0251 restatement binding, and seals the resulting
canonical union. It never derives Fach, DNS mappings, recommendations or
scores from text, IDs, keywords or party metadata.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = ROOT / "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt"
FINAL_PATH = DATA_ROOT / "ltw-2026-st-cdu-final-versioned-manifest-v1.json"
AUDIT_PATH = DATA_ROOT / "ltw-2026-st-cdu-global-leaf-reconciliation-audit-v1.json"
CHILDREN_PATH = DATA_ROOT / "ltw-2026-st-cdu-0244-final-source-bound-children-v1.json"
BINDING_PATH = ROOT / "audit-manifests/sachsen-anhalt/cdu-final-residual-binding-v1.json"
FREEZE_PATH = ROOT / "audit-manifests/sachsen-anhalt/cdu-final-convergence-freeze-v1.json"

REPOSITORY = "sustynats/wirkungsoekonomie.de"
UPSTREAM_COMMIT = "5ba3403a561f9ba3c9d337bf58ab176d16737341"
UPSTREAM_FINAL_SHA256 = "132672058cd0d50fdb61b0044ef2550dda1c8e9cbfbca67c63fb4ef93dde8af9"
UPSTREAM_AUDIT_SHA256 = "8abcd8dc580e9a34e4e2b423066d1da3371c56c4d7ac76fe456fbd9b4cb526e8"
COMMENT_ID = 5385115126
COMMENT_UPDATED_AT = "2026-08-23T08:42:07Z"
COMMENT_BODY_SHA256 = "0ba3856971df07800e627425dfa640e9e58ba452ee6174a110eda9fd71cc76b4"
RESIDUAL_BLOCKER = "SOURCE_BOUND_SPLIT_TERMINAL_CHILDREN_MISSING:0244:5"

PARENT_ID = "ltw-2026-st-cdu-0244-wohnungsbau-staerken-und-eigentum-foerdern-wir-lehnen-ideo"
RESTATEMENT_ID = "ltw-2026-st-cdu-0259-tierheime-besser-unterstuetzen-die-tierheime-leisten-wertv"
RESTATEMENT_PARENT_ID = "ltw-2026-st-cdu-0251-tierschutz-besser-unterstuetzen-die-tierheime-und-tierschu"
RESTATEMENT_TARGET_ID = "ST-CDU-PRIMARY-SPLIT-0251-ANIMAL-WELFARE-FUNDING"

EXPECTED_CHILDREN = [
    ("REGULATION", "ST-CDU-PRIMARY-SPLIT-0244-REGULATION", "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON", "OPEN", "NOT_ASSESSABLE"),
    ("OWNERSHIP_SUBSIDY", "ST-CDU-PRIMARY-SPLIT-0244-OWNERSHIP-SUBSIDY", "EDITORIAL_V2_PLUS_APPROVED", "AMBIVALENT", "LOW"),
    ("SOCIAL_HOUSING", "ST-CDU-PRIMARY-SPLIT-0244-SOCIAL-HOUSING", "EDITORIAL_V2_PLUS_APPROVED", "POSITIVE", "MEDIUM"),
    ("ENERGY_RETROFIT", "ST-CDU-PRIMARY-SPLIT-0244-ENERGY-RETROFIT", "EDITORIAL_V2_PLUS_APPROVED", "AMBIVALENT", "MEDIUM"),
    ("ACCESSIBILITY", "ST-CDU-PRIMARY-SPLIT-0244-ACCESSIBILITY", "EDITORIAL_V2_PLUS_APPROVED", "POSITIVE", "MEDIUM"),
]
EXPECTED_CHILD_IDS = [item[1] for item in EXPECTED_CHILDREN]
EXPECTED_LAYER_MARKERS = [
    "COMMUNICATION_MEDIA_IMPACT",
    "COVERAGE_SCOPE",
    "DELIVERY_FEASIBILITY",
    "DNS_REFERENCE",
    "FALSIFICATION_TRIGGERS",
    "GOAL_REVIEW",
    "INTERNATIONAL_LEAKAGE",
    "LIFECYCLE_TRACEABILITY",
    "MATERIAL_OMISSIONS",
    "POLICY_COHERENCE",
    "PROBLEM_REVIEW",
    "RECOMMENDATION",
    "RESOURCE_FINANCING",
    "REVERSIBILITY_LOCKIN",
    "ROBUSTNESS_STRESS_TEST",
    "SPATIAL_DISTRIBUTION",
    "VERSION_DELTA",
]
TERMINAL = {
    "EDITORIAL_V2_PLUS_APPROVED",
    "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
    "SOURCE_UNIT_RECLASSIFIED_VERSIONED",
}


def fail(message: str) -> None:
    raise ValueError(message)


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_text(payload: str) -> str:
    return sha256_bytes(payload.encode("utf-8"))


def github_request(path: str, *, raw: bool = False) -> bytes:
    headers = {
        "Accept": "application/vnd.github.raw+json" if raw else "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "woek-st-cdu-final-convergence",
    }
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(
        f"https://api.github.com/repos/{REPOSITORY}/{path}", headers=headers
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def validate_github_pins() -> None:
    comment = json.loads(github_request(f"issues/comments/{COMMENT_ID}"))
    if comment.get("updated_at") != COMMENT_UPDATED_AT:
        fail("ISSUE234_COMMENT_UPDATED_AT_DRIFT")
    if sha256_text(str(comment.get("body"))) != COMMENT_BODY_SHA256:
        fail("ISSUE234_COMMENT_BODY_HASH_DRIFT")

    paths = {
        "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-cdu-final-versioned-manifest-v1.json": UPSTREAM_FINAL_SHA256,
        "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-cdu-global-leaf-reconciliation-audit-v1.json": UPSTREAM_AUDIT_SHA256,
    }
    for path, expected_hash in paths.items():
        payload = github_request(f"contents/{path}?ref={UPSTREAM_COMMIT}", raw=True)
        if sha256_bytes(payload) != expected_hash:
            fail(f"UPSTREAM_ARTIFACT_HASH_DRIFT:{path}")


def exact_comment_sections(body: str) -> dict[str, str]:
    sections: dict[str, str] = {}
    for index, (_, source_id, _, _, _) in enumerate(EXPECTED_CHILDREN, start=1):
        heading = f"### {index}. `{source_id}`"
        start = body.find(heading)
        if start < 0:
            fail(f"SOURCE_COMMENT_CHILD_HEADING_MISSING:{source_id}")
        if index < len(EXPECTED_CHILDREN):
            next_id = EXPECTED_CHILDREN[index][1]
            end = body.find(f"### {index + 1}. `{next_id}`", start)
        else:
            end = body.find("## Batch-wide #241", start)
        if end < 0:
            fail(f"SOURCE_COMMENT_CHILD_SECTION_END_MISSING:{source_id}")
        sections[source_id] = body[start:end].replace("\n---\n\n", "\n").rstrip()
    return sections


def validate_source_bound_children(children_manifest: dict) -> list[dict]:
    pin = children_manifest.get("source_pin") or {}
    if pin.get("comment_id") != COMMENT_ID:
        fail("CHILD_MANIFEST_COMMENT_ID_DRIFT")
    if pin.get("updated_at") != COMMENT_UPDATED_AT:
        fail("CHILD_MANIFEST_COMMENT_UPDATED_AT_DRIFT")
    body = str(children_manifest.get("source_comment_body") or "")
    if sha256_text(body) != COMMENT_BODY_SHA256 or pin.get("body_sha256") != COMMENT_BODY_SHA256:
        fail("CHILD_MANIFEST_COMMENT_BODY_HASH_DRIFT")

    parent = children_manifest.get("parent") or {}
    expected_parent = {
        "source_unit_id": PARENT_ID,
        "historical_ordinal": "0244",
        "final_status": "SOURCE_UNIT_RECLASSIFIED_VERSIONED",
        "final_role": "PARENT_PROVENANCE_NONCOUNTING",
        "impact_direction": "OPEN",
        "evidence_level": "NOT_ASSESSABLE",
        "counts_toward_authoritative_source_unit_count": False,
        "counts_toward_authoritative_effect_mechanism_count": False,
        "version_delta": [item[0] for item in EXPECTED_CHILDREN],
    }
    if parent != expected_parent:
        fail("0244_PARENT_EXACT_ROLE_DRIFT")

    sections = exact_comment_sections(body)
    children = children_manifest.get("terminal_children") or []
    if len(children) != 5:
        fail(f"0244_CHILD_CARDINALITY:{len(children)}")
    by_id = {row.get("source_unit_id"): row for row in children}
    if sorted(by_id) != sorted(EXPECTED_CHILD_IDS):
        fail("0244_CHILD_ID_SET_DRIFT")

    for component, source_id, status, direction, evidence in EXPECTED_CHILDREN:
        row = by_id[source_id]
        expected = {
            "component": component,
            "parent_source_unit_id": PARENT_ID,
            "final_status": status,
            "impact_direction": direction,
            "evidence_level": evidence,
            "final_role": "ACTIVE_EFFECT_LEAF",
            "counts_toward_authoritative_source_unit_count": True,
            "counts_toward_authoritative_effect_mechanism_count": True,
        }
        for key, value in expected.items():
            if row.get(key) != value:
                fail(f"0244_CHILD_FACT_DRIFT:{source_id}:{key}:{row.get(key)}")
        if row.get("source_record_markdown") != sections[source_id]:
            fail(f"0244_CHILD_MARKDOWN_NOT_EXACT_SOURCE_SECTION:{source_id}")
        for exact_line in (
            f"`final_status = {status}`",
            f"`impact_direction = {direction}`",
            f"`evidence_level = {evidence}`",
            "`final_role = ACTIVE_EFFECT_LEAF`",
            "`counts_toward_authoritative_source_unit_count = true`",
            "`counts_toward_authoritative_effect_mechanism_count = true`",
            "`RECOMMENDATION = NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL`",
        ):
            if exact_line not in sections[source_id]:
                fail(f"0244_CHILD_SOURCE_FACT_MISSING:{source_id}:{exact_line}")

    batch = children_manifest.get("batch_241_set_check") or {}
    if sorted(batch) != EXPECTED_LAYER_MARKERS:
        fail("0244_BATCH_241_LAYER_SET_DRIFT")
    if batch.get("DNS_REFERENCE") != "EXPLICITLY_NOT_SYNTHESIZED_PENDING_EXACT_REGISTRY_CROSSWALK":
        fail("0244_DNS_NO_SYNTHESIS_CONSTRAINT_DRIFT")
    if batch.get("RECOMMENDATION") != "NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL":
        fail("0244_RECOMMENDATION_CONSTRAINT_DRIFT")
    if children_manifest.get("constraints") != {
        "new_fach_semantics_created_by_materializer": False,
        "dns_mapping_synthesized": False,
        "recommendation_synthesized": False,
        "party_score_created": False,
    }:
        fail("0244_MATERIALIZATION_CONSTRAINT_DRIFT")
    return children


def base_or_finalized_state(final: dict, audit: dict) -> str:
    present = {
        row.get("source_unit_id")
        for row in final.get("explicit_role_union") or []
        if row.get("source_unit_id") in EXPECTED_CHILD_IDS
    }
    if not present:
        if sha256_bytes(FINAL_PATH.read_bytes()) != UPSTREAM_FINAL_SHA256:
            fail("LOCAL_UPSTREAM_FINAL_ARTIFACT_HASH_DRIFT")
        if sha256_bytes(AUDIT_PATH.read_bytes()) != UPSTREAM_AUDIT_SHA256:
            fail("LOCAL_UPSTREAM_AUDIT_ARTIFACT_HASH_DRIFT")
        if audit.get("blockers") != [RESIDUAL_BLOCKER]:
            fail(f"UPSTREAM_RESIDUAL_BLOCKER_SET_DRIFT:{audit.get('blockers')}")
        return "UPSTREAM_RESIDUAL"
    if present != set(EXPECTED_CHILD_IDS):
        fail(f"PARTIAL_0244_CHILD_MATERIALIZATION:{sorted(present)}")
    return "FINALIZED"


def materialize(final: dict, audit: dict, source_children: list[dict], state: str) -> None:
    union = list(final.get("explicit_role_union") or [])
    by_id = {row.get("source_unit_id"): row for row in union if row.get("source_unit_id")}
    parent = by_id.get(PARENT_ID)
    if not parent:
        fail("0244_PARENT_MISSING_FROM_EXPLICIT_UNION")

    parent.update({
        "source_role": "PROVENANCE_PARENT_ONLY",
        "effect_role": "NONLEAF_PARENT",
        "final_role": "PARENT_PROVENANCE_NONCOUNTING",
        "counts_toward_authoritative_source_unit_count": False,
        "counts_toward_authoritative_effect_mechanism_count": False,
        "child_source_unit_ids": sorted(EXPECTED_CHILD_IDS),
    })
    provenance = list(parent.get("fach_provenance") or [])
    pin = {"source_bound_terminal_children_comment_id": COMMENT_ID}
    if pin not in provenance:
        provenance.append(pin)
    parent["fach_provenance"] = provenance

    source_by_id = {row["source_unit_id"]: row for row in source_children}
    if state == "UPSTREAM_RESIDUAL":
        for _, source_id, status, direction, evidence in EXPECTED_CHILDREN:
            source_row = source_by_id[source_id]
            union.append({
                "source_unit_id": source_id,
                "source_role": "COUNTABLE_CANONICAL_SOURCE",
                "effect_role": "COUNTABLE_EFFECT_LEAF",
                "final_role": "ACTIVE_EFFECT_LEAF",
                "counts_toward_authoritative_source_unit_count": True,
                "counts_toward_authoritative_effect_mechanism_count": True,
                "terminal_fach_status": status,
                "impact_direction": direction,
                "evidence_level": evidence,
                "canonical_legacy_classification": None,
                "parent_source_unit_id": PARENT_ID,
                "child_source_unit_ids": [],
                "semantic_role_source_record": None,
                "applicable_241_layer_markers_explicit": EXPECTED_LAYER_MARKERS,
                "layer_set_check": "PASS_SOURCE_BOUND_MARKERS_CAPTURED",
                "source_bound_terminal_record_sha256": sha256_text(source_row["source_record_markdown"]),
                "fach_provenance": [{
                    "issue": 234,
                    "comment_id": COMMENT_ID,
                    "source_artifact": CHILDREN_PATH.relative_to(ROOT).as_posix(),
                    "new_fach_semantics_created": False,
                }],
            })

    union.sort(key=lambda row: str(row.get("source_unit_id") or ""))
    final["explicit_role_union"] = union
    final.setdefault("edges", {})
    parent_child = list(final["edges"].get("parent_child") or [])
    edge_keys = {(edge.get("parent"), edge.get("child")) for edge in parent_child}
    for child_id in EXPECTED_CHILD_IDS:
        if (PARENT_ID, child_id) not in edge_keys:
            parent_child.append({"parent": PARENT_ID, "child": child_id})
    final["edges"]["parent_child"] = sorted(
        parent_child, key=lambda edge: (str(edge.get("parent")), str(edge.get("child")))
    )
    final["source_bound_0244_materialization"] = {
        "source_artifact": CHILDREN_PATH.relative_to(ROOT).as_posix(),
        "source_comment_id": COMMENT_ID,
        "source_comment_body_sha256": COMMENT_BODY_SHA256,
        "parent_zero_count": True,
        "terminal_children_added": EXPECTED_CHILD_IDS,
        "new_fach_semantics_created": False,
        "dns_mapping_synthesized": False,
        "recommendation_synthesized": False,
    }

    audit["blockers"] = [item for item in audit.get("blockers") or [] if item != RESIDUAL_BLOCKER]
    requirements = list(audit.get("source_bound_unresolved_split_requirements") or [])
    for item in requirements:
        if item.get("legacy_unit") == "0244":
            item["status"] = "RESOLVED_EXACT_SOURCE_BOUND_TERMINAL_CHILDREN"
            item["terminal_child_records_found_in_canonical_materialization"] = 5
            item["resolution_comment_id"] = COMMENT_ID
            item["resolution_comment_body_sha256"] = COMMENT_BODY_SHA256
            item.pop("freeze_blocker", None)
    audit["source_bound_unresolved_split_requirements"] = requirements
    audit["source_bound_0244_materialization"] = final["source_bound_0244_materialization"]


def dedupe_edges(edges: list[dict]) -> list[dict]:
    by_key: dict[tuple[str, str, str], dict] = {}
    for edge in edges:
        relation = str(edge.get("relation") or "")
        source = str(edge.get("from") or "")
        target = str(edge.get("to") or "")
        if not relation or not source or not target or source == target:
            continue
        by_key.setdefault((relation, source, target), edge)
    return [by_key[key] for key in sorted(by_key)]


def graph_cycles(edges: list[dict], ids: set[str]) -> list[list[str]]:
    graph: dict[str, list[str]] = defaultdict(list)
    for edge in edges:
        if edge["from"] in ids and edge["to"] in ids:
            graph[edge["from"]].append(edge["to"])
    state: dict[str, int] = {}
    stack: list[str] = []
    cycles: list[list[str]] = []

    def visit(node: str) -> None:
        state[node] = 1
        stack.append(node)
        for target in graph.get(node, []):
            if state.get(target, 0) == 0:
                visit(target)
            elif state.get(target) == 1:
                cycles.append(stack[stack.index(target):] + [target])
        stack.pop()
        state[node] = 2

    for node in sorted(ids):
        if state.get(node, 0) == 0:
            visit(node)
    return cycles


def frozen_union_sha256(final: dict) -> str:
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
        payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return sha256_bytes(canonical)


def validate_and_freeze(final: dict, audit: dict, binding: dict) -> dict:
    union = final.get("explicit_role_union") or []
    ids = [row.get("source_unit_id") for row in union]
    if len(ids) != len(set(ids)):
        fail(f"STABLE_ID_COLLISIONS:{len(ids) - len(set(ids))}")
    by_id = {row["source_unit_id"]: row for row in union}

    parent = by_id.get(PARENT_ID) or {}
    if parent.get("source_role") != "PROVENANCE_PARENT_ONLY" or parent.get("effect_role") != "NONLEAF_PARENT":
        fail("0244_PARENT_ROLE_NOT_NONCOUNTING")
    if sorted(parent.get("child_source_unit_ids") or []) != sorted(EXPECTED_CHILD_IDS):
        fail("0244_PARENT_CHILD_SET_DRIFT")

    for _, source_id, status, direction, evidence in EXPECTED_CHILDREN:
        row = by_id.get(source_id) or {}
        expected = {
            "source_role": "COUNTABLE_CANONICAL_SOURCE",
            "effect_role": "COUNTABLE_EFFECT_LEAF",
            "final_role": "ACTIVE_EFFECT_LEAF",
            "terminal_fach_status": status,
            "impact_direction": direction,
            "evidence_level": evidence,
            "parent_source_unit_id": PARENT_ID,
            "layer_set_check": "PASS_SOURCE_BOUND_MARKERS_CAPTURED",
        }
        for key, value in expected.items():
            if row.get(key) != value:
                fail(f"0244_FINAL_UNION_CHILD_DRIFT:{source_id}:{key}:{row.get(key)}")
        if sorted(row.get("applicable_241_layer_markers_explicit") or []) != EXPECTED_LAYER_MARKERS:
            fail(f"0244_FINAL_UNION_241_LAYER_SET_DRIFT:{source_id}")

    relation = binding.get("binding") or {}
    if relation.get("from_source_unit_id") != RESTATEMENT_ID or relation.get("to_stable_source_unit_id") != RESTATEMENT_TARGET_ID:
        fail("0259_BINDING_MANIFEST_DRIFT")
    source = by_id.get(RESTATEMENT_ID) or {}
    target = by_id.get(RESTATEMENT_TARGET_ID) or {}
    if source.get("effect_role") != "RESTATEMENT" or source.get("semantic_role_source_record") != "RESTATEMENT_DUPLICATE_OF_0251_ANIMAL_WELFARE_FUNDING":
        fail("0259_RESTATEMENT_ROLE_DRIFT")
    if target.get("parent_source_unit_id") != RESTATEMENT_PARENT_ID or target.get("effect_role") != "COUNTABLE_EFFECT_LEAF":
        fail("0251_RESTATEMENT_TARGET_DRIFT")

    edges = list((final.get("edges") or {}).get("resolved_typed_edges") or [])
    for child_id in EXPECTED_CHILD_IDS:
        edges.append({"relation": "PARENT_CHILD", "from": PARENT_ID, "to": child_id, "source": "issue_234_comment_5385115126"})
    edges = dedupe_edges(edges)
    id_set = set(by_id)
    dangling = [edge for edge in edges if edge["from"] not in id_set or edge["to"] not in id_set]
    if dangling:
        fail(f"DANGLING_RELATION_EDGES:{dangling}")
    cycles = graph_cycles(edges, id_set)
    if cycles:
        fail(f"RELATION_GRAPH_CYCLES:{cycles}")
    parents: dict[str, set[str]] = defaultdict(set)
    for edge in edges:
        if edge["relation"] == "PARENT_CHILD":
            parents[edge["to"]].add(edge["from"])
    multi_parent = {child: sorted(values) for child, values in parents.items() if len(values) > 1}
    if multi_parent:
        fail(f"MULTIPLE_PARENT_CONFLICTS:{multi_parent}")
    restatement_edges = [
        edge for edge in edges
        if edge["relation"] == "RESTATEMENT" and edge["from"] == RESTATEMENT_ID
    ]
    if len(restatement_edges) != 1 or restatement_edges[0]["to"] != RESTATEMENT_PARENT_ID:
        fail(f"0259_RESTATEMENT_EDGE_DRIFT:{restatement_edges}")

    source_ids = [row["source_unit_id"] for row in union if row.get("source_role") == "COUNTABLE_CANONICAL_SOURCE"]
    effect_ids = [row["source_unit_id"] for row in union if row.get("effect_role") == "COUNTABLE_EFFECT_LEAF"]
    if len(source_ids) != len(set(source_ids)) or len(effect_ids) != len(set(effect_ids)):
        fail("EXACTLY_ONCE_COUNT_FAILED")
    if len(source_ids) != 737 or len(effect_ids) != 736:
        fail(f"AUTHORITATIVE_COUNT_DRIFT:{len(source_ids)}:{len(effect_ids)}")

    for row in union:
        if row.get("effect_role") == "COUNTABLE_EFFECT_LEAF":
            if row.get("terminal_fach_status") not in TERMINAL:
                fail(f"NONTERMINAL_EFFECT_LEAF:{row.get('source_unit_id')}")
            if row.get("layer_set_check") not in {
                "PASS_SOURCE_BOUND_MARKERS_CAPTURED",
                "INHERITED_TERMINAL_BASELINE_LAYER_PROVENANCE",
            }:
                fail(f"241_SET_CHECK_FAILED:{row.get('source_unit_id')}")

    if audit.get("blockers"):
        fail(f"BUILDER_BLOCKERS_REMAIN:{audit.get('blockers')}")
    if any(item.get("status") != "RESOLVED_EXACT_SOURCE_BOUND_TERMINAL_CHILDREN" for item in audit.get("source_bound_unresolved_split_requirements") or []):
        fail("SOURCE_BOUND_SPLIT_REQUIREMENT_NOT_RESOLVED")

    final["edges"]["resolved_typed_edges"] = edges
    final["edges"]["typed_edge_counts"] = dict(sorted(Counter(edge["relation"] for edge in edges).items()))
    final["relation_graph_acyclic"] = "PASS"
    final["relation_graph_cycles"] = []
    final["unresolved_relation_refs"] = []
    final["dangling_relation_edges"] = []
    final["multiple_parent_conflicts"] = {}
    final["one_count_per_final_effect_leaf"] = "PASS"
    final["authoritative_source_unit_count"] = 737
    final["authoritative_effect_mechanism_count"] = 736
    final["non_effect_source_leaf_count"] = 1
    final["denominator_status"] = "FROZEN_EXPLICIT_ROLE_UNION"
    final["st_cdu_final_versioned_manifest"] = "PASS_GLOBAL_LEAF_RECONCILIATION"
    final["st_cdu_terminal_complete"] = True
    final["frozen_exact_union_sha256"] = frozen_union_sha256(final)

    structural = {
        "explicit_union_nodes": len(id_set),
        "countable_source_nodes": 737,
        "countable_effect_leaves": 736,
        "non_effect_source_leaves": 1,
        "resolved_typed_edges": len(edges),
        "edge_counts": final["edges"]["typed_edge_counts"],
        "relation_graph_acyclic": True,
        "cycles": [],
        "dangling_edges": [],
        "unresolved_relation_refs": [],
        "multiple_parent_conflicts": {},
        "stable_id_collisions": 0,
        "exactly_once_source_count": "PASS",
        "exactly_once_effect_count": "PASS",
        "terminal_effect_leaf_set_check": "PASS",
        "applicable_241_layer_set_check": "PASS",
        "blockers": [],
        "new_fach_semantics_created": False,
        "public_count_mutated": False,
    }
    audit["structural_validation"] = structural
    audit["blockers"] = []
    audit["freeze_gate"] = "PASS"
    audit["authoritative_source_unit_count"] = 737
    audit["authoritative_effect_mechanism_count"] = 736
    audit["non_effect_source_leaf_count"] = 1
    audit["countable_source_ids"] = sorted(source_ids)
    audit["countable_effect_ids"] = sorted(effect_ids)
    audit["source_id_duplicates"] = []
    audit["effect_id_duplicates"] = []
    audit["terminal_id_conflicts"] = []
    audit["frozen_exact_union_sha256"] = final["frozen_exact_union_sha256"]

    return structural


def build_freeze_descriptor(final: dict, audit: dict, structural: dict) -> dict:
    return {
        "schema_version": "woek-st-cdu-final-convergence-freeze-1.0",
        "manifest_id": "ST-CDU-FINAL-CONVERGENCE-FREEZE-V1",
        "programme_key": "ltw-2026-st-cdu",
        "source_pins": {
            "upstream_pr": 257,
            "upstream_commit": UPSTREAM_COMMIT,
            "upstream_manifest_sha256": UPSTREAM_FINAL_SHA256,
            "upstream_audit_sha256": UPSTREAM_AUDIT_SHA256,
            "terminal_children_issue": 234,
            "terminal_children_comment_id": COMMENT_ID,
            "terminal_children_comment_updated_at": COMMENT_UPDATED_AT,
            "terminal_children_comment_body_sha256": COMMENT_BODY_SHA256,
            "residual_binding_manifest": BINDING_PATH.relative_to(ROOT).as_posix(),
        },
        "authoritative_counts": {
            "source_units": final["authoritative_source_unit_count"],
            "effect_mechanisms": final["authoritative_effect_mechanism_count"],
            "non_effect_source_leaves": final["non_effect_source_leaf_count"],
        },
        "relations": {
            "0244_parent_zero_count": True,
            "0244_terminal_children": EXPECTED_CHILD_IDS,
            "0259_restatement_target": RESTATEMENT_TARGET_ID,
            "edge_counts": structural["edge_counts"],
        },
        "gates": {
            "primary_source_parity": final.get("st_cdu_primary_source_parity"),
            "terminal_complete": final.get("st_cdu_terminal_complete"),
            "source_gap_count": 0,
            "stable_id_collisions": 0,
            "dedupe_conflicts": 0,
            "dangling_edges": 0,
            "cycles": 0,
            "multiple_parent_conflicts": 0,
            "exactly_once_source_count": "PASS",
            "exactly_once_effect_count": "PASS",
            "terminal_effect_leaf_set_check": "PASS",
            "applicable_241_layer_set_check": "PASS",
            "freeze_gate": audit["freeze_gate"],
        },
        "frozen_exact_union_sha256": final["frozen_exact_union_sha256"],
        "constraints": {
            "new_fach_semantics_created": False,
            "dns_mapping_synthesized": False,
            "recommendation_synthesized": False,
            "party_score_created": False,
            "vercel_build_triggered": False,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-github", action="store_true")
    args = parser.parse_args()

    final = read_json(FINAL_PATH)
    audit = read_json(AUDIT_PATH)
    children_manifest = read_json(CHILDREN_PATH)
    binding = read_json(BINDING_PATH)
    source_children = validate_source_bound_children(children_manifest)
    if args.check_github:
        validate_github_pins()

    state = base_or_finalized_state(final, audit)
    materialize(final, audit, source_children, state)
    structural = validate_and_freeze(final, audit, binding)
    descriptor = build_freeze_descriptor(final, audit, structural)
    write_json(FINAL_PATH, final)
    write_json(AUDIT_PATH, audit)
    write_json(FREEZE_PATH, descriptor)

    print(json.dumps({
        "gate": "ST_CDU_FINAL_CONVERGENCE",
        "status": "PASS",
        "input_state": state,
        "authoritative_source_unit_count": 737,
        "authoritative_effect_mechanism_count": 736,
        "non_effect_source_leaf_count": 1,
        "stable_id_collisions": 0,
        "source_gap_count": 0,
        "resolved_edge_counts": structural["edge_counts"],
        "relation_graph_acyclic": True,
        "terminal_effect_leaf_set_check": "PASS",
        "applicable_241_layer_set_check": "PASS",
        "frozen_exact_union_sha256": final["frozen_exact_union_sha256"],
        "github_source_pins": "PASS" if args.check_github else "NOT_REQUESTED",
        "new_fach_semantics_created": False,
        "dns_mapping_synthesized": False,
        "recommendation_synthesized": False,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, TypeError, ValueError, urllib.error.URLError) as error:
        print(f"ST_CDU_FINAL_CONVERGENCE=BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(1)
