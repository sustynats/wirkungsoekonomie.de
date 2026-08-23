#!/usr/bin/env python3
"""Validate the no-new-Fach GRUENE C06A role/edge ledger from issue #234 R10A."""

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
MANIFEST_PATH = ROOT / "audit-manifests/sachsen-anhalt/gruene-convergence-c06a.json"


def fail(message: str) -> None:
    raise ValueError(message)


def validate_live_source(manifest: dict[str, object]) -> None:
    source = manifest["source"]
    assert isinstance(source, dict)
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    request = urllib.request.Request(
        f"https://api.github.com/repos/sustynats/wirkungsoekonomie.de/issues/comments/{source['comment_id']}",
        headers=headers,
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        comment = json.load(response)
    body = str(comment["body"])
    if comment["updated_at"] != source["comment_updated_at"]:
        fail("ISSUE234_R10A_UPDATED_AT_DRIFT")
    if hashlib.sha256(body.encode("utf-8")).hexdigest() != source["comment_body_sha256"]:
        fail("ISSUE234_R10A_BODY_HASH_DRIFT")
    required_facts = (
        "ST-GRUENE-PSP-R10A",
        "Working-Register-Parity `0152–0180`",
        "12 SAME + 5 OVERMERGED + 6 PARTIAL_PARENT + 1 TRUNCATED + 5 CONTEXT_ONLY = 29/29",
        "`0159` = `SUMMARY_DUPLICATE_NONLEAF`",
        "**40 aktive Stable Effect Leaves**",
        "`29` Child-/Restore-Leaves + `11` aktive SAME-Leaves",
    )
    for fact in required_facts:
        if fact not in body:
            fail(f"ISSUE234_R10A_FACT_MISSING:{fact}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-github", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    scope = manifest["scope"]
    roles = {name: set(values) for name, values in manifest["historical_roles"].items()}
    counts = manifest["counts"]

    expected_historical = {f"{number:04d}" for number in range(152, 181)}
    assigned = set().union(*roles.values())
    if assigned != expected_historical:
        fail(f"HISTORICAL_ROLE_PARTITION_MISMATCH:{sorted(expected_historical ^ assigned)}")
    if sum(map(len, roles.values())) != len(assigned) or len(assigned) != scope["working_row_count"]:
        fail("HISTORICAL_ROLE_PARTITION_OVERLAP_OR_COUNT")

    versioned = manifest["versioned_active_effect_leaves"]
    expected_versioned = [f"ST-GRUENE-PSP-R10A-{number:04d}" for number in range(1, 30)]
    if versioned != expected_versioned or len(set(versioned)) != 29:
        fail("VERSIONED_LEAF_SET_MISMATCH")
    edges = manifest["lineage_edges"]
    if set(edges) != roles["parent_provenance_nonleaf"]:
        fail("PARENT_EDGE_COVERAGE_MISMATCH")
    targets = [child for children in edges.values() for child in children]
    if len(targets) != len(set(targets)) or set(targets) != set(versioned):
        fail("VERSIONED_LINEAGE_EXACTLY_ONCE_MISMATCH")

    semantic = manifest["semantic_relations"]
    if semantic != [{"from": "0159", "relation": "SUMMARY_DUPLICATE_OF", "to": "0167", "count": 0}]:
        fail("0159_TO_0167_RESTATEMENT_DRIFT")
    if semantic[0]["from"] not in roles["duplicate_restatement_nonleaf"] or semantic[0]["to"] not in roles["active_effect_leaf"]:
        fail("0159_TO_0167_ROLE_MISMATCH")

    calculated = {
        "historical_active_effect_leaves": len(roles["active_effect_leaf"]),
        "versioned_active_effect_leaves": len(versioned),
        "non_effect_source_leaves": len(roles["context_design_non_effect_source_leaf"]),
        "parent_provenance_nonleaves": len(roles["parent_provenance_nonleaf"]),
        "portfolio_summary_nonleaves": len(roles["portfolio_summary_nonleaf"]),
        "duplicate_restatement_nonleaves": len(roles["duplicate_restatement_nonleaf"]),
        "authoritative_source_leaves": len(roles["active_effect_leaf"]) + len(roles["context_design_non_effect_source_leaf"]) + len(versioned),
        "authoritative_effect_leaves": len(roles["active_effect_leaf"]) + len(versioned),
    }
    if calculated != counts:
        fail(f"COUNT_MISMATCH:{calculated}")

    register_text = (ROOT / scope["working_register"]).read_text(encoding="utf-8")
    if len(re.findall(r"^#### Eintrag \d+$", register_text, flags=re.MULTILINE)) != 740:
        fail("WORKING_REGISTER_ROW_COUNT_MISMATCH")
    source_hash = re.search(r"^\*\*source_hash:\*\* ([0-9a-f]{64})$", register_text, re.MULTILINE)
    if not source_hash or source_hash.group(1) != scope["working_register_source_hash"]:
        fail("WORKING_REGISTER_SOURCE_HASH_MISMATCH")

    expected_constraints = {
        "new_stable_ids": 0,
        "current_740_mutation": "NONE",
        "fach_synthesis": "FORBIDDEN",
        "dns_mapping": "NOT_MAPPED_HERE",
        "recommendation": "NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL",
        "global_count_freeze": "LOCKED_PENDING_C06B_PLUS_AND_UNION_GATE",
    }
    if manifest["constraints"] != expected_constraints:
        fail("NO_NEW_FACH_CONSTRAINT_DRIFT")
    if args.check_github:
        validate_live_source(manifest)

    print(json.dumps({
        "gate": "ST_GRUENE_CONVERGENCE_C06A_0152_0180",
        "status": "PASS",
        "source_leaves": counts["authoritative_source_leaves"],
        "effect_leaves": counts["authoritative_effect_leaves"],
        "lineage_edges": len(targets),
        "duplicate_active_effect": 0,
        "github_source_pin": "PASS" if args.check_github else "NOT_REQUESTED",
        "global_freeze": "LOCKED",
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, KeyError, TypeError, ValueError, urllib.error.URLError) as error:
        print(f"ST_GRUENE_CONVERGENCE_C06A=BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(1)
