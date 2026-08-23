#!/usr/bin/env python3
"""Validate the GRUENE C07 role/edge ledger from pinned issue #234 R11 facts."""

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
MANIFEST_PATH = ROOT / "audit-manifests/sachsen-anhalt/gruene-convergence-c07.json"


def fail(message: str) -> None:
    raise ValueError(message)


def validate_live_source(manifest: dict[str, object]) -> None:
    source = manifest["source"]
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
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
        fail("ISSUE234_R11_UPDATED_AT_DRIFT")
    if hashlib.sha256(body.encode("utf-8")).hexdigest() != source["comment_body_sha256"]:
        fail("ISSUE234_R11_BODY_HASH_DRIFT")
    for fact in (
        "ST-GRUENE-PSP-R11",
        "Working-Baseline `0217–0224`",
        "`1 GOAL_CONTEXT + 1 PARTIAL_PARENT + 4 SAME-like + 1 OVERMERGED + 1 SAME_WITH_PAGE_NOISE = 8/8`",
        "`ST_GRUENE_R11_NEW_ACTIVE_STABLE_LEAVES = 6`",
        "`DNS_REFERENCE = NOT_MAPPED_HERE`",
        "`RECOMMENDATION = NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL`",
    ):
        if fact not in body:
            fail(f"ISSUE234_R11_FACT_MISSING:{fact}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-github", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    scope = manifest["scope"]
    roles = {name: set(values) for name, values in manifest["historical_roles"].items()}
    counts = manifest["counts"]

    expected_historical = {f"{number:04d}" for number in range(217, 225)}
    assigned = set().union(*roles.values())
    if assigned != expected_historical or sum(map(len, roles.values())) != len(assigned):
        fail("HISTORICAL_ROLE_PARTITION_MISMATCH")
    versioned = manifest["versioned_active_effect_leaves"]
    expected_versioned = [f"ST-GRUENE-PSP-R11-{number:04d}" for number in range(1, 7)]
    if versioned != expected_versioned:
        fail("VERSIONED_LEAF_SET_MISMATCH")
    edges = manifest["lineage_edges"]
    if set(edges) != {"0218", "0222"}:
        fail("LINEAGE_ANCESTOR_SET_MISMATCH")
    targets = [child for children in edges.values() for child in children]
    standalone = manifest["standalone_versioned_leaves"]
    if len(targets) != len(set(targets)) or set(targets).intersection(standalone):
        fail("VERSIONED_LINEAGE_COLLISION")
    if set(targets).union(standalone) != set(versioned):
        fail("VERSIONED_LINEAGE_PARTITION_MISMATCH")

    calculated = {
        "historical_active_effect_leaves": len(roles["active_effect_leaf"]),
        "versioned_active_effect_leaves": len(versioned),
        "non_effect_source_leaves": len(roles["context_design_non_effect_source_leaf"]),
        "parent_provenance_nonleaves": len(roles["parent_provenance_nonleaf"]),
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
        "global_count_freeze": "LOCKED_PENDING_R12_PLUS_AND_UNION_GATE",
    }
    if manifest["constraints"] != expected_constraints:
        fail("NO_NEW_FACH_CONSTRAINT_DRIFT")
    if args.check_github:
        validate_live_source(manifest)

    print(json.dumps({
        "gate": "ST_GRUENE_CONVERGENCE_C07_0217_0224",
        "status": "PASS",
        "source_leaves": counts["authoritative_source_leaves"],
        "effect_leaves": counts["authoritative_effect_leaves"],
        "lineage_edges": len(targets),
        "github_source_pin": "PASS" if args.check_github else "NOT_REQUESTED",
        "global_freeze": "LOCKED",
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, TypeError, ValueError, urllib.error.URLError) as error:
        print(f"ST_GRUENE_CONVERGENCE_C07=BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(1)
