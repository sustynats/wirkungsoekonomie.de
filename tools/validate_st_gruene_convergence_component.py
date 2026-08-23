#!/usr/bin/env python3
"""Validate a source-pinned GRUENE convergence component without new Fach."""

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
ROLE_KEYS = (
    "active_effect_leaf",
    "context_design_non_effect_source_leaf",
    "parent_provenance_nonleaf",
    "duplicate_restatement_nonleaf",
)


def fail(message: str) -> None:
    raise ValueError(message)


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


def validate_live_sources(manifest: dict[str, object]) -> None:
    bodies: dict[str, str] = {}
    for pin in manifest["source"]["comments"]:
        comment = fetch_comment(int(pin["id"]))
        body = str(comment["body"])
        if comment["updated_at"] != pin["updated_at"]:
            fail(f"ISSUE234_COMMENT_UPDATED_AT_DRIFT:{pin['id']}")
        if hashlib.sha256(body.encode("utf-8")).hexdigest() != pin["body_sha256"]:
            fail(f"ISSUE234_COMMENT_BODY_HASH_DRIFT:{pin['id']}")
        if pin["marker"] not in body:
            fail(f"ISSUE234_COMMENT_MARKER_MISSING:{pin['id']}:{pin['marker']}")
        bodies[pin["marker"]] = body

    for marker, facts in manifest["source"]["required_facts"].items():
        if marker not in bodies:
            fail(f"REQUIRED_FACT_MARKER_NOT_PINNED:{marker}")
        for fact in facts:
            if fact not in bodies[marker]:
                fail(f"ISSUE234_FACT_MISSING:{marker}:{fact}")

    source_corpus = "\n".join(bodies.values())
    for window in manifest["windows"]:
        for role in ROLE_KEYS:
            for stable_id in window["versioned_roles"][role]:
                if stable_id not in source_corpus:
                    fail(f"PINNED_SOURCE_STABLE_ID_MISSING:{stable_id}")


def assert_acyclic(edges: list[tuple[str, str]]) -> None:
    graph: dict[str, list[str]] = {}
    for source, target in edges:
        graph.setdefault(source, []).append(target)
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str) -> None:
        if node in visiting:
            fail(f"LINEAGE_GRAPH_CYCLE:{node}")
        if node in visited:
            return
        visiting.add(node)
        for target in graph.get(node, []):
            visit(target)
        visiting.remove(node)
        visited.add(node)

    for node in graph:
        visit(node)


def validate_window(window: dict[str, object]) -> tuple[int, int, set[str], list[tuple[str, str]]]:
    first = int(window["historical_first"])
    last = int(window["historical_last"])
    expected_historical = {f"{number:04d}" for number in range(first, last + 1)}
    historical = {role: set(window["historical_roles"][role]) for role in ROLE_KEYS}
    versioned = {role: set(window["versioned_roles"][role]) for role in ROLE_KEYS}
    historical_union = set().union(*historical.values())
    versioned_union = set().union(*versioned.values())
    if historical_union != expected_historical:
        fail(f"HISTORICAL_ROLE_PARTITION_MISMATCH:{first:04d}-{last:04d}")
    if sum(map(len, historical.values())) != len(historical_union):
        fail(f"HISTORICAL_ROLE_COLLISION:{first:04d}-{last:04d}")
    if sum(map(len, versioned.values())) != len(versioned_union):
        fail(f"VERSIONED_ROLE_COLLISION:{first:04d}-{last:04d}")

    lineage_edges: list[tuple[str, str]] = []
    lineage_targets: list[str] = []
    for source, targets in window["lineage_edges"].items():
        if source not in historical_union:
            fail(f"UNKNOWN_LINEAGE_PARENT:{source}")
        for target in targets:
            if target not in versioned_union:
                fail(f"UNKNOWN_LINEAGE_TARGET:{target}")
            lineage_edges.append((source, target))
            lineage_targets.append(target)
    if len(lineage_targets) != len(set(lineage_targets)):
        fail(f"LINEAGE_TARGET_COLLISION:{first:04d}-{last:04d}")

    restored = set(window["restored_in_place_historical"])
    if not restored.issubset(historical["active_effect_leaf"]):
        fail(f"RESTORED_IN_PLACE_NOT_ACTIVE:{first:04d}-{last:04d}")

    relation_edges: list[tuple[str, str]] = []
    for relation in window["semantic_relations"]:
        if relation["count"] != 0:
            fail(f"SEMANTIC_RELATION_MUST_COUNT_ZERO:{relation['from']}")
        relation_edges.append((relation["from"], relation["to"]))

    non_effect_sources = len(historical["context_design_non_effect_source_leaf"]) + len(versioned["context_design_non_effect_source_leaf"])
    parent_nonleaves = len(historical["parent_provenance_nonleaf"]) + len(versioned["parent_provenance_nonleaf"])
    duplicate_nonleaves = len(historical["duplicate_restatement_nonleaf"]) + len(versioned["duplicate_restatement_nonleaf"])
    source_count = len(historical["active_effect_leaf"]) + len(versioned["active_effect_leaf"]) + non_effect_sources
    effect_count = len(historical["active_effect_leaf"]) + len(versioned["active_effect_leaf"])
    calculated = {
        "historical_active_effect_leaves": len(historical["active_effect_leaf"]),
        "versioned_active_effect_leaves": len(versioned["active_effect_leaf"]),
        "non_effect_source_leaves": non_effect_sources,
        "parent_provenance_nonleaves": parent_nonleaves,
        "duplicate_restatement_nonleaves": duplicate_nonleaves,
        "authoritative_source_leaves": source_count,
        "authoritative_effect_leaves": effect_count,
    }
    if calculated != window["counts"]:
        fail(f"WINDOW_COUNT_MISMATCH:{first:04d}-{last:04d}:{calculated}")
    return source_count, effect_count, historical_union | versioned_union, lineage_edges + relation_edges


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--check-github", action="store_true")
    args = parser.parse_args()
    manifest_path = args.manifest if args.manifest.is_absolute() else ROOT / args.manifest
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest["schema_version"] != "woek-st-gruene-convergence-component-1.0":
        fail("SCHEMA_VERSION_DRIFT")

    source_count = 0
    effect_count = 0
    all_nodes: set[str] = set()
    all_edges: list[tuple[str, str]] = []
    last_historical: int | None = None
    for window in manifest["windows"]:
        first = int(window["historical_first"])
        if last_historical is not None and first != last_historical + 1:
            fail(f"WINDOW_SCOPE_NOT_CONTIGUOUS:{last_historical:04d}->{first:04d}")
        last_historical = int(window["historical_last"])
        window_source, window_effect, nodes, edges = validate_window(window)
        if all_nodes.intersection(nodes):
            fail(f"CROSS_WINDOW_ID_COLLISION:{window['source_marker']}")
        all_nodes.update(nodes)
        source_count += window_source
        effect_count += window_effect
        all_edges.extend(edges)

    for source, target in all_edges:
        if source not in all_nodes or target not in all_nodes:
            fail(f"CROSS_WINDOW_RELATION_TARGET_UNKNOWN:{source}->{target}")
    assert_acyclic(all_edges)
    expected_counts = {"authoritative_source_leaves": source_count, "authoritative_effect_leaves": effect_count}
    if manifest["counts"] != expected_counts:
        fail(f"COMPONENT_COUNT_MISMATCH:{expected_counts}")

    scope = manifest["scope"]
    register_text = (ROOT / scope["working_register"]).read_text(encoding="utf-8")
    if len(re.findall(r"^#### Eintrag \d+$", register_text, flags=re.MULTILINE)) != 740:
        fail("WORKING_REGISTER_ROW_COUNT_MISMATCH")
    source_hash = re.search(r"^\*\*source_hash:\*\* ([0-9a-f]{64})$", register_text, re.MULTILINE)
    if not source_hash or source_hash.group(1) != scope["working_register_source_hash"]:
        fail("WORKING_REGISTER_SOURCE_HASH_MISMATCH")

    constraints = manifest["constraints"]
    if constraints["new_stable_ids"] != 0 or constraints["current_740_mutation"] != "NONE":
        fail("CURRENT_REGISTER_OR_ID_MUTATION_FORBIDDEN")
    if constraints["fach_synthesis"] != "FORBIDDEN":
        fail("FACH_SYNTHESIS_CONSTRAINT_DRIFT")
    if constraints["dns_mapping"] != "NOT_MAPPED_HERE" or constraints["recommendation"] != "NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL":
        fail("DNS_OR_RECOMMENDATION_CONSTRAINT_DRIFT")
    if not constraints["global_count_freeze"].startswith("LOCKED_PENDING_"):
        fail("GLOBAL_FREEZE_PREMATURELY_RELEASED")
    if args.check_github:
        validate_live_sources(manifest)

    print(json.dumps({
        "gate": manifest["manifest_id"],
        "status": "PASS",
        "historical_scope": f"{manifest['windows'][0]['historical_first']}-{manifest['windows'][-1]['historical_last']}",
        "source_leaves": source_count,
        "effect_leaves": effect_count,
        "lineage_and_semantic_edges": len(all_edges),
        "github_source_pins": "PASS" if args.check_github else "NOT_REQUESTED",
        "global_freeze": "LOCKED",
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, TypeError, ValueError, urllib.error.URLError) as error:
        print(f"ST_GRUENE_CONVERGENCE_COMPONENT=BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(1)
