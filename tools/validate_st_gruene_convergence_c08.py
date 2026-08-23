#!/usr/bin/env python3
"""Validate the GRUENE C08 union from pinned R12, A04 and A05 facts."""

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
MANIFEST_PATH = ROOT / "audit-manifests/sachsen-anhalt/gruene-convergence-c08.json"


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
    bodies = {}
    for pin in manifest["source"]["comments"]:
        comment = fetch_comment(int(pin["id"]))
        body = str(comment["body"])
        if comment["updated_at"] != pin["updated_at"]:
            fail(f"ISSUE234_COMMENT_UPDATED_AT_DRIFT:{pin['id']}")
        if hashlib.sha256(body.encode("utf-8")).hexdigest() != pin["body_sha256"]:
            fail(f"ISSUE234_COMMENT_BODY_HASH_DRIFT:{pin['id']}")
        bodies[pin["marker"]] = body

    for fact in (
        "historische Working-IDs: **0225–0252** = 28 Records",
        "`ST_GRUENE_R12_EXISTING_SOURCE_BOUND_DELTAS_REUSED=19`",
        "`ST_GRUENE_R12_CONTEXT_ONLY_ROWS=6`",
        "generische 0228-Bürgerrat-Passage ↔ konkretisierte 0236-Passage",
        "generische 0228-Bürgerhaushalt-Passage ↔ konkretisierte Passage nach 0241",
        "Parent nicht zusätzlich als identischer kommunaler Effect zählen",
    ):
        if fact not in bodies["ST-GRUENE-PSP-R12"]:
            fail(f"ISSUE234_R12_FACT_MISSING:{fact}")
    for source_id in manifest["versioned_roles"]["active_effect_leaf"][:8] + manifest["versioned_roles"]["parent_scope_nonleaf"]:
        if source_id not in bodies["ST-GRUENE-A04"]:
            fail(f"ISSUE234_A04_STABLE_ID_MISSING:{source_id}")
    for source_id in (
        manifest["versioned_roles"]["active_effect_leaf"][8:]
        + manifest["versioned_roles"]["context_design_non_effect_source_leaf"]
        + manifest["versioned_roles"]["duplicate_restatement_nonleaf"]
    ):
        if source_id not in bodies["ST-GRUENE-A05"]:
            fail(f"ISSUE234_A05_STABLE_ID_MISSING:{source_id}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-github", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    scope = manifest["scope"]
    historical = {name: set(values) for name, values in manifest["historical_roles"].items()}
    versioned = {name: set(values) for name, values in manifest["versioned_roles"].items()}
    counts = manifest["counts"]

    expected_historical = {f"{number:04d}" for number in range(225, 253)}
    historical_union = set().union(*historical.values())
    if historical_union != expected_historical or sum(map(len, historical.values())) != len(historical_union):
        fail("HISTORICAL_ROLE_PARTITION_MISMATCH")
    versioned_union = set().union(*versioned.values())
    if sum(map(len, versioned.values())) != 19 or len(versioned_union) != 19:
        fail("VERSIONED_ROLE_PARTITION_MISMATCH")

    edges = manifest["lineage_edges"]
    edge_targets = [target for targets in edges.values() for target in targets]
    if len(edge_targets) != len(set(edge_targets)) or not set(edge_targets).issubset(versioned_union):
        fail("LINEAGE_TARGET_COLLISION_OR_UNKNOWN")
    standalone = set(manifest["standalone_versioned_active_effect_leaves"])
    duplicate = versioned["duplicate_restatement_nonleaf"]
    if set(edge_targets).union(standalone).union(duplicate) != versioned_union:
        fail("VERSIONED_LINEAGE_PARTITION_MISMATCH")

    semantic = manifest["semantic_relations"]
    if len(semantic) != 3 or any(relation["count"] != 0 for relation in semantic):
        fail("SEMANTIC_RELATION_SET_DRIFT")
    if {relation["from"] for relation in semantic} != {
        "0236",
        "ltw-2026-st-gruene-v2-after-0241-buergerhaushalte",
        "ltw-2026-st-gruene-0228-c4-digitale-beteiligungsformate",
    }:
        fail("SEMANTIC_RELATION_SOURCE_DRIFT")

    non_effect_sources = len(historical["context_design_non_effect_source_leaf"]) + len(versioned["context_design_non_effect_source_leaf"])
    parent_nonleaves = len(historical["parent_provenance_nonleaf"]) + len(versioned["parent_scope_nonleaf"])
    duplicate_nonleaves = len(historical["duplicate_restatement_nonleaf"]) + len(versioned["duplicate_restatement_nonleaf"])
    calculated = {
        "historical_active_effect_leaves": len(historical["active_effect_leaf"]),
        "versioned_active_effect_leaves": len(versioned["active_effect_leaf"]),
        "non_effect_source_leaves": non_effect_sources,
        "parent_provenance_nonleaves": parent_nonleaves,
        "duplicate_restatement_nonleaves": duplicate_nonleaves,
        "authoritative_source_leaves": len(historical["active_effect_leaf"]) + len(versioned["active_effect_leaf"]) + non_effect_sources,
        "authoritative_effect_leaves": len(historical["active_effect_leaf"]) + len(versioned["active_effect_leaf"]),
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
        "global_count_freeze": "LOCKED_PENDING_R13_PLUS_AND_UNION_GATE",
    }
    if manifest["constraints"] != expected_constraints:
        fail("NO_NEW_FACH_CONSTRAINT_DRIFT")
    if args.check_github:
        validate_live_sources(manifest)

    print(json.dumps({
        "gate": "ST_GRUENE_CONVERGENCE_C08_0225_0252",
        "status": "PASS",
        "source_leaves": counts["authoritative_source_leaves"],
        "effect_leaves": counts["authoritative_effect_leaves"],
        "semantic_zero_count_relations": len(semantic),
        "github_source_pins": "PASS" if args.check_github else "NOT_REQUESTED",
        "global_freeze": "LOCKED",
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, TypeError, ValueError, urllib.error.URLError) as error:
        print(f"ST_GRUENE_CONVERGENCE_C08=BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(1)
