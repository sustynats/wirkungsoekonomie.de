#!/usr/bin/env python3
"""Validate exact CDU 0259→0251 binding and the finite fail-closed residual."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BINDING_PATH = ROOT / "audit-manifests/sachsen-anhalt/cdu-final-residual-binding-v1.json"
REPOSITORY = "sustynats/wirkungsoekonomie.de"


def fail(message: str) -> None:
    raise ValueError(message)


def github_request(path: str, *, raw: bool = False) -> bytes:
    headers = {
        "Accept": "application/vnd.github.raw+json" if raw else "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    request = urllib.request.Request(f"https://api.github.com/repos/{REPOSITORY}/{path}", headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def fetch_json(path: str, *, raw: bool = False) -> tuple[bytes, dict[str, object]]:
    payload = github_request(path, raw=raw)
    return payload, json.loads(payload)


def validate_comment_pins(pins: dict[str, object]) -> None:
    required_facts = {
        5381703252: (
            "exact canonical target Stable ID: `ST-CDU-PRIMARY-SPLIT-0251-ANIMAL-WELFARE-FUNDING`",
            "SOURCE_BOUND_SPLIT_TERMINAL_CHILDREN_MISSING:0244:5",
        ),
        5383655655: (
            "preserve source/history ID `0259` unchanged",
            "resolve the directed restatement relation `0259 ->`",
            "remain fail-closed pending",
        ),
        5385115126: (
            "five terminal children, parent zero-count",
            "ST-CDU-PRIMARY-SPLIT-0244-REGULATION",
            "ST-CDU-PRIMARY-SPLIT-0244-ACCESSIBILITY",
            "VERSION_DELTA = 0244_PARENT_ZERO_COUNT -> 5_FINAL_ACTIVE_EFFECT_LEAVES",
        ),
    }
    for pin in pins["comments"]:
        payload = github_request(f"issues/comments/{pin['id']}")
        comment = json.loads(payload)
        body = str(comment["body"])
        if comment["updated_at"] != pin["updated_at"]:
            fail(f"ISSUE234_COMMENT_UPDATED_AT_DRIFT:{pin['id']}")
        if hashlib.sha256(body.encode("utf-8")).hexdigest() != pin["body_sha256"]:
            fail(f"ISSUE234_COMMENT_BODY_HASH_DRIFT:{pin['id']}")
        for fact in required_facts[int(pin["id"])]:
            if fact not in body:
                fail(f"ISSUE234_REQUIRED_FACT_MISSING:{pin['id']}:{fact}")


def validate_upstream(binding_manifest: dict[str, object]) -> None:
    pins = binding_manifest["source_pins"]
    binding = binding_manifest["binding"]
    resolution = binding_manifest["resolved_residual"]
    assert isinstance(pins, dict) and isinstance(binding, dict) and isinstance(resolution, dict)

    commit = pins["upstream_commit"]
    manifest_pin = pins["upstream_manifest"]
    audit_pin = pins["upstream_audit"]
    assert isinstance(manifest_pin, dict) and isinstance(audit_pin, dict)
    manifest_bytes, upstream = fetch_json(f"contents/{manifest_pin['path']}?ref={commit}", raw=True)
    audit_bytes, audit = fetch_json(f"contents/{audit_pin['path']}?ref={commit}", raw=True)
    if hashlib.sha256(manifest_bytes).hexdigest() != manifest_pin["sha256"]:
        fail("UPSTREAM_CDU_MANIFEST_HASH_DRIFT")
    if hashlib.sha256(audit_bytes).hexdigest() != audit_pin["sha256"]:
        fail("UPSTREAM_CDU_AUDIT_HASH_DRIFT")

    nodes = upstream["explicit_role_union"]
    source_nodes = [node for node in nodes if node.get("source_unit_id") == binding["from_source_unit_id"]]
    target_nodes = [node for node in nodes if node.get("source_unit_id") == binding["to_stable_source_unit_id"]]
    if len(source_nodes) != 1 or len(target_nodes) != 1:
        fail(f"DETERMINISTIC_NODE_LOOKUP_FAILED:{len(source_nodes)}:{len(target_nodes)}")
    source, target = source_nodes[0], target_nodes[0]

    source_expectations = {
        "parent_source_unit_id": binding["from_source_unit_id"],
        "terminal_fach_status": binding["from_terminal_status"],
        "semantic_role_source_record": binding["from_semantic_role"],
        "effect_role": "RESTATEMENT",
        "impact_direction": "OPEN",
        "evidence_level": "NOT_ASSESSABLE",
    }
    target_expectations = {
        "parent_source_unit_id": binding["to_parent_source_unit_id"],
        "terminal_fach_status": binding["to_terminal_status"],
        "impact_direction": binding["to_impact_direction"],
        "evidence_level": binding["to_evidence_level"],
        "effect_role": "COUNTABLE_EFFECT_LEAF",
    }
    for key, expected in source_expectations.items():
        if source.get(key) != expected:
            fail(f"SOURCE_NODE_DRIFT:{key}:{source.get(key)}")
    for key, expected in target_expectations.items():
        if target.get(key) != expected:
            fail(f"TARGET_NODE_DRIFT:{key}:{target.get(key)}")

    resolved_restatements = [
        edge
        for edge in upstream["edges"]["resolved_typed_edges"]
        if edge.get("from") == binding["from_source_unit_id"] and edge.get("relation") == "RESTATEMENT"
    ]
    if len(resolved_restatements) != 1:
        fail(f"UPSTREAM_RESTATEMENT_EDGE_COUNT:{len(resolved_restatements)}")
    if resolved_restatements[0].get("to") != binding["to_parent_source_unit_id"]:
        fail("UPSTREAM_RESTATEMENT_ALIAS_TARGET_DRIFT")

    structural = audit["structural_validation"]
    if structural["blockers"] or structural["unresolved_relation_refs"] or structural["cycles"]:
        fail("UPSTREAM_STRUCTURAL_RESIDUAL_NOT_ZERO")
    if structural["edge_counts"] != {"PARENT_CHILD": 438, "RESTATEMENT": 1}:
        fail("UPSTREAM_EDGE_COUNTS_DRIFT")
    expected_blocker = "SOURCE_BOUND_SPLIT_TERMINAL_CHILDREN_MISSING:0244:5"
    if audit["blockers"] != [expected_blocker]:
        fail(f"UPSTREAM_BLOCKER_SET_DRIFT:{audit['blockers']}")
    upstream_residual = audit["source_bound_unresolved_split_requirements"]
    if len(upstream_residual) != 1:
        fail("UPSTREAM_SOURCE_BOUND_RESIDUAL_CARDINALITY_DRIFT")
    expected_components = [
        "REGULATION",
        "OWNERSHIP_SUBSIDY",
        "SOCIAL_HOUSING",
        "ENERGY_RETROFIT",
        "ACCESSIBILITY",
    ]
    if upstream_residual[0]["required_components"] != expected_components:
        fail("UPSTREAM_0244_COMPONENT_SET_DRIFT")

    validate_comment_pins(pins)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-github", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(BINDING_PATH.read_text(encoding="utf-8"))
    binding = manifest["binding"]
    blockers = manifest["remaining_blockers"]
    resolution = manifest["resolved_residual"]
    constraints = manifest["constraints"]

    if binding["from_historical_ordinal"] != "0259" or binding["to_historical_ordinal"] != "0251":
        fail("ORDINAL_BINDING_DRIFT")
    if binding["relation"] != "RESTATEMENT":
        fail("RELATION_TYPE_DRIFT")
    if not binding["source_history_preserved"]:
        fail("SOURCE_HISTORY_MUST_BE_PRESERVED")
    if binding["independent_source_leaf_count"] != 0 or binding["independent_effect_leaf_count"] != 0:
        fail("0259_MUST_BE_ZERO_COUNT_RESTATEMENT")

    expected_child_ids = [
        "ST-CDU-PRIMARY-SPLIT-0244-REGULATION",
        "ST-CDU-PRIMARY-SPLIT-0244-OWNERSHIP-SUBSIDY",
        "ST-CDU-PRIMARY-SPLIT-0244-SOCIAL-HOUSING",
        "ST-CDU-PRIMARY-SPLIT-0244-ENERGY-RETROFIT",
        "ST-CDU-PRIMARY-SPLIT-0244-ACCESSIBILITY",
    ]
    if blockers:
        fail(f"0244_RESIDUAL_BLOCKERS_REMAIN:{blockers}")
    if resolution != {
        "historical_parent": "0244",
        "source_comment_id": 5385115126,
        "source_comment_body_sha256": "0ba3856971df07800e627425dfa640e9e58ba452ee6174a110eda9fd71cc76b4",
        "parent_role": "PARENT_PROVENANCE_NONCOUNTING",
        "terminal_child_records_found": 5,
        "terminal_child_ids": expected_child_ids,
        "status": "RESOLVED_EXACT_SOURCE_BOUND_TERMINAL_CHILDREN",
    }:
        fail("0244_SOURCE_BOUND_RESOLUTION_DRIFT")
    if constraints != {
        "new_fach_semantics": False,
        "stable_ids_source_bound_by_comment": 5385115126,
        "public_count_mutated": False,
        "dns_mapping": "NOT_MAPPED_HERE",
        "recommendation": "NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL",
        "score": "NOT_CREATED",
        "denominator": "FROZEN_IN_ST_CDU_FINAL_CONVERGENCE_V1",
    }:
        fail("FAIL_CLOSED_CONSTRAINT_DRIFT")

    if args.check_github:
        validate_upstream(manifest)

    print(json.dumps({
        "gate": "ST_CDU_FINAL_RESIDUAL_BINDING",
        "status": "PASS",
        "binding": f"{binding['from_historical_ordinal']}->{binding['to_stable_source_unit_id']}",
        "technical_relation_gap": 0,
        "fach_child_gap": 0,
        "blockers": [],
        "resolved_0244_terminal_children": 5,
        "github_source_pins": "PASS" if args.check_github else "NOT_REQUESTED",
        "denominator": "FROZEN_IN_ST_CDU_FINAL_CONVERGENCE_V1",
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, KeyError, TypeError, ValueError, urllib.error.URLError) as error:
        print(f"ST_CDU_FINAL_RESIDUAL_BINDING=BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(1)
