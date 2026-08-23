#!/usr/bin/env python3
"""Validate the no-new-Fach GRUENE C05 role/edge ledger from issue #234 R09."""

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
MANIFEST_PATH = ROOT / "content/audits/sachsen-anhalt/gruene-convergence-c05.json"


def fail(message: str) -> None:
    raise ValueError(message)


def fetch_comment(comment_id: int) -> dict[str, object]:
    request = urllib.request.Request(
        f"https://api.github.com/repos/sustynats/wirkungsoekonomie.de/issues/comments/{comment_id}",
        headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            **(
                {"Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}"}
                if os.environ.get("GITHUB_TOKEN")
                else {}
            ),
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def validate_live_source(manifest: dict[str, object]) -> None:
    source = manifest["source"]
    assert isinstance(source, dict)
    comment = fetch_comment(int(source["comment_id"]))
    body = str(comment["body"])
    body_hash = hashlib.sha256(body.encode("utf-8")).hexdigest()
    if body_hash != source["comment_body_sha256"]:
        fail("ISSUE234_R09_BODY_HASH_DRIFT")
    if comment["updated_at"] != source["comment_updated_at"]:
        fail("ISSUE234_R09_UPDATED_AT_DRIFT")
    required_facts = (
        "ST-GRUENE-PSP-R09",
        "Working-Row-Parity `0109–0151`",
        "28 SAME + 6 OVERMERGED + 5 PARTIAL_PARENT + 2 TRUNCATED + 2 CONTEXT_ONLY = 43/43",
        "54** R09-Stable-Leaf-Records",
        "R09_LOCAL_UNRESOLVED_SOURCE_GAPS = 0",
        "R09_LOCAL_UNRESOLVED_RESTORE_GAPS = 0",
        "R09_LOCAL_UNRESOLVED_OVERMERGE_TRUNCATION_GAPS = 0",
    )
    for fact in required_facts:
        if fact not in body:
            fail(f"ISSUE234_R09_FACT_MISSING:{fact}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-github", action="store_true")
    args = parser.parse_args()

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    scope = manifest["scope"]
    roles = manifest["historical_roles"]
    counts = manifest["counts"]
    constraints = manifest["constraints"]

    expected_historical = {f"{number:04d}" for number in range(109, 152)}
    role_sets = {name: set(values) for name, values in roles.items()}
    assigned = set().union(*role_sets.values())
    if assigned != expected_historical:
        fail(f"HISTORICAL_ROLE_PARTITION_MISMATCH:{sorted(expected_historical ^ assigned)}")
    if sum(len(values) for values in role_sets.values()) != len(assigned):
        fail("HISTORICAL_ROLE_PARTITION_OVERLAP")
    if len(assigned) != scope["working_row_count"]:
        fail("WORKING_ROW_COUNT_MISMATCH")

    versioned = manifest["versioned_active_effect_leaves"]
    expected_versioned = [f"ST-GRUENE-PSP-R09-{number:04d}" for number in range(1, 55)]
    if versioned != expected_versioned or len(set(versioned)) != 54:
        fail("VERSIONED_LEAF_SET_MISMATCH")

    parent_set = role_sets["parent_provenance_nonleaf"]
    edges = manifest["lineage_edges"]
    if set(edges) != parent_set:
        fail("PARENT_EDGE_COVERAGE_MISMATCH")
    targets = [target for children in edges.values() for target in children]
    standalone = manifest["standalone_versioned_leaves"]
    if len(targets) != len(set(targets)):
        fail("VERSIONED_CHILD_HAS_MULTIPLE_PARENTS")
    if set(targets).intersection(standalone):
        fail("STANDALONE_CHILD_OVERLAP")
    if set(targets).union(standalone) != set(versioned):
        fail("VERSIONED_LINEAGE_PARTITION_MISMATCH")
    if any(parent in set(versioned) or child in expected_historical for parent, children in edges.items() for child in children):
        fail("LINEAGE_DIRECTION_OR_NAMESPACE_INVALID")

    calculated = {
        "historical_active_effect_leaves": len(role_sets["active_effect_leaf"]),
        "versioned_active_effect_leaves": len(versioned),
        "non_effect_source_leaves": len(role_sets["context_design_non_effect_source_leaf"]),
        "parent_provenance_nonleaves": len(parent_set),
        "authoritative_source_leaves": len(role_sets["active_effect_leaf"]) + len(role_sets["context_design_non_effect_source_leaf"]) + len(versioned),
        "authoritative_effect_leaves": len(role_sets["active_effect_leaf"]) + len(versioned),
    }
    if calculated != counts:
        fail(f"COUNT_MISMATCH:{calculated}")

    register = ROOT / scope["working_register"]
    register_text = register.read_text(encoding="utf-8")
    register_rows = len(re.findall(r"^#### Eintrag \d+$", register_text, flags=re.MULTILINE))
    if register_rows != 740:
        fail(f"WORKING_REGISTER_ROW_COUNT_MISMATCH:{register_rows}")
    source_hash = re.search(r"^\*\*source_hash:\*\* ([0-9a-f]{64})$", register_text, re.MULTILINE)
    if not source_hash or source_hash.group(1) != scope["working_register_source_hash"]:
        fail("WORKING_REGISTER_SOURCE_HASH_MISMATCH")

    if constraints != {
        "new_stable_ids": 0,
        "current_740_mutation": "NONE",
        "fach_synthesis": "FORBIDDEN",
        "dns_mapping": "NOT_MAPPED_HERE",
        "recommendation": "NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL",
        "global_count_freeze": "LOCKED_PENDING_C06_PLUS_AND_UNION_GATE",
    }:
        fail("NO_NEW_FACH_CONSTRAINT_DRIFT")

    if args.check_github:
        validate_live_source(manifest)

    report = {
        "gate": "ST_GRUENE_CONVERGENCE_C05_0109_0151",
        "status": "PASS",
        "source_leaves": counts["authoritative_source_leaves"],
        "effect_leaves": counts["authoritative_effect_leaves"],
        "non_effect_source_leaves": counts["non_effect_source_leaves"],
        "lineage_edges": len(targets),
        "github_source_pin": "PASS" if args.check_github else "NOT_REQUESTED",
        "global_freeze": "LOCKED",
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, KeyError, TypeError, ValueError, urllib.error.URLError) as error:
        print(f"ST_GRUENE_CONVERGENCE_C05=BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(1)
