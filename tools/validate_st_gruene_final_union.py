#!/usr/bin/env python3
"""Validate the content-addressed GRUENE final convergence union."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "audit-manifests/sachsen-anhalt/gruene-final-union-c17.json"
EXTERNAL_GRAPH_ANCHORS = {"LKW_MAUT_FEDERAL_COOPERATION"}


def fail(message: str) -> None:
    raise ValueError(message)


def canonical_hash(manifest: dict[str, object]) -> str:
    payload = dict(manifest)
    payload.pop("descriptor_sha256", None)
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def fetch_comment(comment_id: int) -> dict[str, object]:
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    request = urllib.request.Request(
        f"https://api.github.com/repos/sustynats/wirkungsoekonomie.de/issues/comments/{comment_id}",
        headers=headers,
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def validate_issue_only_sources(manifest: dict[str, object]) -> None:
    required = {
        "C01": (
            "`ST_GRUENE_C01_AUTHORITATIVE_SOURCE_LEAF_COUNT_PREFIX_0001_0049 = 93`",
            "`ST_GRUENE_C01_AUTHORITATIVE_EFFECT_LEAF_COUNT_PREFIX_0001_0049 = 92`",
        ),
        "C02": (
            "`ST_GRUENE_C02_AUTHORITATIVE_SOURCE_LEAF_COUNT_0050_0068 = 34`",
            "`ST_GRUENE_C02_AUTHORITATIVE_EFFECT_LEAF_COUNT_0050_0068 = 32`",
        ),
        "C03": (
            "`ST_GRUENE_C03_AUTHORITATIVE_SOURCE_LEAF_COUNT_0069_0084 = 35`",
            "`ST_GRUENE_C03_AUTHORITATIVE_EFFECT_LEAF_COUNT_0069_0084 = 34`",
            "`ST_GRUENE_C03_RESERVED_NONLEAF_MARKERS = 1`",
        ),
        "C04": (
            "`ST_GRUENE_C04_AUTHORITATIVE_SOURCE_LEAF_COUNT_0085_0108 = 36`",
            "`ST_GRUENE_C04_AUTHORITATIVE_EFFECT_LEAF_COUNT_0085_0108 = 36`",
        ),
    }
    for pin in manifest["source"]["issue_only_components"]:
        comment = fetch_comment(int(pin["comment_id"]))
        body = str(comment["body"])
        if comment["updated_at"] != pin["updated_at"]:
            fail(f"ISSUE234_COMMENT_UPDATED_AT_DRIFT:{pin['comment_id']}")
        if hashlib.sha256(body.encode("utf-8")).hexdigest() != pin["body_sha256"]:
            fail(f"ISSUE234_COMMENT_BODY_HASH_DRIFT:{pin['comment_id']}")
        for fact in required[pin["component"]]:
            if fact not in body:
                fail(f"ISSUE234_COMPONENT_FACT_MISSING:{pin['component']}:{fact}")


def parse_scope(scope: str) -> tuple[int, int]:
    match = re.fullmatch(r"(\d{4})-(\d{4})", scope)
    if not match:
        fail(f"INVALID_COMPONENT_SCOPE:{scope}")
    return int(match.group(1)), int(match.group(2))


def role_values(roles: dict[str, object]) -> set[str]:
    values: set[str] = set()
    for records in roles.values():
        if not isinstance(records, list):
            fail("ROLE_RECORDS_NOT_LIST")
        values.update(str(record) for record in records)
    return values


def normalize_manifest(component: dict[str, object], payload: dict[str, object]) -> tuple[set[str], set[str], list[tuple[str, str]], set[str]]:
    expected_id = f"ST-GRUENE-CONVERGENCE-{component['component']}"
    if payload["manifest_id"] != expected_id:
        fail(f"COMPONENT_MANIFEST_ID_MISMATCH:{component['component']}:{payload['manifest_id']}")
    counts = payload["counts"]
    if counts["authoritative_source_leaves"] != component["source_leaves"] or counts["authoritative_effect_leaves"] != component["effect_leaves"]:
        fail(f"COMPONENT_COUNT_DESCRIPTOR_MISMATCH:{component['component']}")

    windows = payload.get("windows")
    if windows is None:
        scope = payload["scope"]
        windows = [{
            "historical_first": scope["historical_first"],
            "historical_last": scope["historical_last"],
            "historical_roles": payload["historical_roles"],
            "versioned_roles": payload.get("versioned_roles"),
            "versioned_active_effect_leaves": payload.get("versioned_active_effect_leaves"),
            "lineage_edges": payload.get("lineage_edges", {}),
            "semantic_relations": payload.get("semantic_relations", []),
        }]

    historical_nodes: set[str] = set()
    stable_nodes: set[str] = set()
    non_effect_versioned: set[str] = set()
    edges: list[tuple[str, str]] = []
    window_first = None
    window_last = None
    for window in windows:
        current_first = int(window["historical_first"])
        current_last = int(window["historical_last"])
        if window_first is None:
            window_first = current_first
        if window_last is not None and current_first != window_last + 1:
            fail(f"COMPONENT_INTERNAL_SCOPE_GAP:{component['component']}:{window_last:04d}->{current_first:04d}")
        window_last = current_last
        historical = role_values(window["historical_roles"])
        expected_historical = {f"{number:04d}" for number in range(current_first, current_last + 1)}
        if historical != expected_historical:
            fail(f"COMPONENT_HISTORICAL_PARTITION_MISMATCH:{component['component']}:{current_first:04d}-{current_last:04d}")
        historical_nodes.update(historical)

        versioned_roles = window.get("versioned_roles")
        if versioned_roles is not None:
            stable_nodes.update(role_values(versioned_roles))
            for role_name, records in versioned_roles.items():
                if role_name != "active_effect_leaf":
                    non_effect_versioned.update(str(record) for record in records)
        else:
            stable_nodes.update(str(record) for record in window.get("versioned_active_effect_leaves", []))

        for source, targets in window.get("lineage_edges", {}).items():
            for target in targets:
                edges.append((str(source), str(target)))
        for relation in window.get("semantic_relations", []):
            if relation["count"] != 0:
                fail(f"NONZERO_SEMANTIC_RELATION:{component['component']}:{relation['from']}")
            edges.append((str(relation["from"]), str(relation["to"])))

    descriptor_first, descriptor_last = parse_scope(str(component["scope"]))
    if (window_first, window_last) != (descriptor_first, descriptor_last):
        fail(f"COMPONENT_SCOPE_DESCRIPTOR_MISMATCH:{component['component']}")
    return historical_nodes, stable_nodes, edges, non_effect_versioned


def issue_only_stable_ids() -> set[str]:
    ids: set[str] = set()
    for marker, last in (("R01", 13), ("R02", 8), ("R03", 5), ("R04", 13), ("R05", 12), ("R06", 20), ("R08", 18)):
        ids.update(f"ST-GRUENE-PSP-{marker}-{number:04d}" for number in range(1, last + 1))
    ids.update(f"ST-GRUENE-PSP-R07-{number:04d}" for number in range(1, 22) if number != 12)
    return ids


def assert_acyclic(edges: set[tuple[str, str]]) -> None:
    graph: dict[str, list[str]] = {}
    for source, target in edges:
        graph.setdefault(source, []).append(target)
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str) -> None:
        if node in visiting:
            fail(f"GLOBAL_GRAPH_CYCLE:{node}")
        if node in visited:
            return
        visiting.add(node)
        for target in graph.get(node, []):
            visit(target)
        visiting.remove(node)
        visited.add(node)

    for node in graph:
        visit(node)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-github", action="store_true")
    parser.add_argument("--print-hash", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if manifest["schema_version"] != "woek-st-gruene-final-union-1.0":
        fail("SCHEMA_VERSION_DRIFT")
    calculated_hash = canonical_hash(manifest)
    if args.print_hash:
        print(calculated_hash)
        return 0
    if manifest["descriptor_sha256"] != calculated_hash:
        fail(f"DESCRIPTOR_HASH_MISMATCH:{calculated_hash}")

    components = manifest["components"]
    if len(components) != 17:
        fail("COMPONENT_SET_SIZE_DRIFT")
    expected_first = 1
    source_sum = 0
    effect_sum = 0
    all_nodes = {f"{number:04d}" for number in range(1, 109)}
    stable_nodes = issue_only_stable_ids()
    all_edges: set[tuple[str, str]] = set()
    non_effect_versioned: set[str] = set()
    for component in components:
        first, last = parse_scope(str(component["scope"]))
        if first != expected_first:
            fail(f"GLOBAL_SCOPE_GAP:{expected_first:04d}->{first:04d}")
        expected_first = last + 1
        source_sum += int(component["source_leaves"])
        effect_sum += int(component["effect_leaves"])
        if "manifest" not in component:
            continue
        manifest_path = ROOT / component["manifest"]
        raw = manifest_path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != component["manifest_sha256"]:
            fail(f"COMPONENT_MANIFEST_HASH_DRIFT:{component['component']}")
        payload = json.loads(raw)
        historical, stable, edges, versioned_non_effect = normalize_manifest(component, payload)
        if all_nodes.intersection(historical):
            fail(f"GLOBAL_HISTORICAL_ID_COLLISION:{component['component']}")
        if stable_nodes.intersection(stable):
            fail(f"GLOBAL_STABLE_ID_COLLISION:{component['component']}")
        all_nodes.update(historical)
        stable_nodes.update(stable)
        all_edges.update(edges)
        non_effect_versioned.update(versioned_non_effect)

    if expected_first != 741 or all_nodes.intersection({f"{number:04d}" for number in range(1, 741)}) != {f"{number:04d}" for number in range(1, 741)}:
        fail("GLOBAL_HISTORICAL_SCOPE_NOT_0001_0740")
    all_nodes.update(stable_nodes)
    for relation in manifest["cross_component_reconciliation"]:
        if relation["count"] != 0:
            fail(f"NONZERO_CROSS_COMPONENT_RELATION:{relation['from']}")
        source = str(relation["from"])
        target = str(relation["to"])
        if source not in all_nodes and relation["relation"] != "SAME_RESTATEMENT_NO_RECORD_CREATED":
            fail(f"UNKNOWN_CROSS_COMPONENT_SOURCE:{source}")
        if target not in all_nodes:
            fail(f"UNKNOWN_CROSS_COMPONENT_TARGET:{target}")
        if source in all_nodes:
            all_edges.add((source, target))

    for source, target in all_edges:
        if source not in all_nodes:
            fail(f"GLOBAL_EDGE_SOURCE_UNKNOWN:{source}")
        if target not in all_nodes and target not in EXTERNAL_GRAPH_ANCHORS:
            fail(f"GLOBAL_EDGE_TARGET_UNKNOWN:{source}->{target}")
    assert_acyclic(all_edges)

    counts = manifest["authoritative_counts"]
    if (source_sum, effect_sum) != (1241, 1147):
        fail(f"GLOBAL_COMPONENT_COUNT_SUM_MISMATCH:{source_sum}:{effect_sum}")
    if counts["authoritative_source_unit_count"] != source_sum or counts["authoritative_effect_mechanism_count"] != effect_sum:
        fail("GLOBAL_AUTHORITATIVE_COUNT_DESCRIPTOR_MISMATCH")
    if counts["non_effect_source_leaf_count"] != source_sum - effect_sum:
        fail("GLOBAL_NON_EFFECT_SOURCE_COUNT_MISMATCH")
    if not counts["counts_frozen"]:
        fail("GLOBAL_COUNTS_NOT_FROZEN")

    a12 = manifest["a12_count_fidelity"]
    if a12["effect_bearing_stable_count"] != 62 or len(a12["zero_count_passage_records"]) != 3 or a12["reserved_not_created_records"] != 1:
        fail("A12_COUNT_FIDELITY_DRIFT")
    if not set(a12["zero_count_passage_records"]).issubset(non_effect_versioned):
        fail("A12_ZERO_COUNT_RECORDS_NOT_MATERIALIZED")

    checks = manifest["global_checks"]
    zero_checks = (
        "stable_id_collisions", "unresolved_parent_child_edges",
        "unresolved_restatement_duplicate_supersedes_edges", "unresolved_semantic_collisions",
        "source_gaps", "restore_gaps", "overmerge_gaps", "truncation_gaps", "duplicate_gaps",
    )
    if any(checks[name] != 0 for name in zero_checks):
        fail("GLOBAL_ZERO_GAP_ASSERTION_DRIFT")
    if checks["continuous_historical_scope"] != "PASS_0001_0740_NO_GAPS" or checks["graph_acyclic"] != "PASS":
        fail("GLOBAL_SCOPE_OR_DAG_ASSERTION_DRIFT")
    completion = manifest["completion"]
    if completion["ST_GRUENE_PRIMARY_SOURCE_PARITY"] != "PASS_FULL_PROGRAMME":
        fail("PRIMARY_SOURCE_PARITY_NOT_TERMINAL")
    if completion["new_fach_judgements"] != 0 or completion["new_stable_ids"] != 0:
        fail("NEW_FACH_OR_STABLE_ID_FORBIDDEN")
    if completion["dns_mapping"] != "NOT_SYNTHESIZED" or completion["recommendation"] != "NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL":
        fail("DNS_OR_RECOMMENDATION_SYNTHESIS_FORBIDDEN")
    if args.check_github:
        validate_issue_only_sources(manifest)

    print(json.dumps({
        "gate": "ST_GRUENE_FINAL_UNION_C17",
        "status": "PASS_FULL_PROGRAMME",
        "historical_scope": "0001-0740",
        "authoritative_source_unit_count": source_sum,
        "authoritative_effect_mechanism_count": effect_sum,
        "non_effect_source_leaf_count": source_sum - effect_sum,
        "stable_id_collisions": 0,
        "graph_acyclic": "PASS",
        "descriptor_sha256": calculated_hash,
        "github_source_pins": "PASS" if args.check_github else "NOT_REQUESTED",
        "new_fach_judgements": 0,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, TypeError, ValueError, urllib.error.URLError) as error:
        print(f"ST_GRUENE_FINAL_UNION_C17=BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(1)
