#!/usr/bin/env python3
"""Validate the GRUENE C06B role/edge ledger from pinned R10B and A04 facts."""

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
MANIFEST_PATH = ROOT / "audit-manifests/sachsen-anhalt/gruene-convergence-c06b.json"


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
        bodies[str(pin["marker"])] = body

    r10b = bodies["ST-GRUENE-PSP-R10B"]
    required_r10b = (
        "Historische Working-Baseline: `0181–0216`",
        "`19 + 6 + 3 + 3 + 4 + 1 = 36/36`",
        "`0205` = erneute Formulierung `sichere Haltestellen/Angsträume`",
        "`ST_GRUENE_R10B_NEW_OR_CLEAN_STABLE_RECORDS = 24`",
        "`DNS_REFERENCE = NOT_MAPPED_HERE`",
        "`RECOMMENDATION = NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL`",
    )
    for fact in required_r10b:
        if fact not in r10b:
            fail(f"ISSUE234_R10B_FACT_MISSING:{fact}")

    a04 = bodies["ST-GRUENE-A04"]
    required_a04 = (
        "`0185` **landesweit sichere Schulwege** — `EDITORIAL_V2_PLUS_APPROVED`",
        "`0191` **faire/verursachergerechte Beteiligung des Schwerlastverkehrs** — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`",
        "`0194` **Umrüstung privater Verbrenner zu reinen E-Fahrzeugen fördern** — `EDITORIAL_V2_PLUS_APPROVED`",
        "`0204` **Schulungen/Weiterbildungen zu Möglichkeiten der StVO-Novelle** — `EDITORIAL_V2_PLUS_APPROVED`",
        "`0208` **sichere/barrierefreie Haltestellen fördern und standardisieren** — `EDITORIAL_V2_PLUS_APPROVED`",
    )
    for fact in required_a04:
        if fact not in a04:
            fail(f"ISSUE234_A04_FACT_MISSING:{fact}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-github", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    scope = manifest["scope"]
    roles = {name: set(values) for name, values in manifest["historical_roles"].items()}
    counts = manifest["counts"]

    expected_historical = {f"{number:04d}" for number in range(181, 217)}
    assigned = set().union(*roles.values())
    if assigned != expected_historical:
        fail(f"HISTORICAL_ROLE_PARTITION_MISMATCH:{sorted(expected_historical ^ assigned)}")
    if sum(map(len, roles.values())) != len(assigned) or len(assigned) != scope["working_row_count"]:
        fail("HISTORICAL_ROLE_PARTITION_OVERLAP_OR_COUNT")

    versioned = manifest["versioned_active_effect_leaves"]
    expected_versioned = [f"ST-GRUENE-PSP-R10B-{number:04d}" for number in range(1, 25)]
    if versioned != expected_versioned or len(set(versioned)) != 24:
        fail("VERSIONED_LEAF_SET_MISMATCH")
    edges = manifest["lineage_edges"]
    valid_ancestors = assigned - roles["active_effect_leaf"] - roles["duplicate_restatement_nonleaf"]
    if not set(edges).issubset(valid_ancestors):
        fail("LINEAGE_ANCESTOR_ROLE_MISMATCH")
    targets = [child for children in edges.values() for child in children]
    standalone = manifest["standalone_versioned_leaves"]
    if len(targets) != len(set(targets)) or set(targets).intersection(standalone):
        fail("VERSIONED_LINEAGE_COLLISION")
    if set(targets).union(standalone) != set(versioned):
        fail("VERSIONED_LINEAGE_PARTITION_MISMATCH")

    semantic = manifest["semantic_relations"]
    if semantic[0] != {"from": "0205", "relation": "DUPLICATE_RESTATEMENT_OF", "to": "0169", "count": 0}:
        fail("0205_TO_0169_RESTATEMENT_DRIFT")
    if semantic[1] != {"from": "0191", "relation": "IMPLEMENTATION_DESIGN", "to": "LKW_MAUT_FEDERAL_COOPERATION", "count": 0}:
        fail("0191_IMPLEMENTATION_DESIGN_DRIFT")

    historical_effects = len(roles["active_effect_leaf"]) + len(roles["active_effect_leaf_with_source_v2_child"])
    non_effect_sources = len(roles["implementation_design_non_effect_source_leaf"]) + len(roles["context_design_non_effect_source_leaf"])
    calculated = {
        "historical_active_effect_leaves": historical_effects,
        "versioned_active_effect_leaves": len(versioned),
        "non_effect_source_leaves": non_effect_sources,
        "parent_provenance_nonleaves": len(roles["parent_provenance_nonleaf"]),
        "duplicate_restatement_nonleaves": len(roles["duplicate_restatement_nonleaf"]),
        "authoritative_source_leaves": historical_effects + non_effect_sources + len(versioned),
        "authoritative_effect_leaves": historical_effects + len(versioned),
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
        "global_count_freeze": "LOCKED_PENDING_R11_PLUS_AND_UNION_GATE",
    }
    if manifest["constraints"] != expected_constraints:
        fail("NO_NEW_FACH_CONSTRAINT_DRIFT")
    if args.check_github:
        validate_live_sources(manifest)

    print(json.dumps({
        "gate": "ST_GRUENE_CONVERGENCE_C06B_0181_0216",
        "status": "PASS",
        "source_leaves": counts["authoritative_source_leaves"],
        "effect_leaves": counts["authoritative_effect_leaves"],
        "lineage_edges": len(targets),
        "duplicate_active_effect": 0,
        "github_source_pins": "PASS" if args.check_github else "NOT_REQUESTED",
        "global_freeze": "LOCKED",
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, KeyError, TypeError, ValueError, urllib.error.URLError) as error:
        print(f"ST_GRUENE_CONVERGENCE_C06B=BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(1)
