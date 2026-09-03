#!/usr/bin/env python3
"""Validate the GRUENE C09 role/edge ledger from pinned R13 and A05 facts."""

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
MANIFEST_PATH = ROOT / "audit-manifests/sachsen-anhalt/gruene-convergence-c09.json"


def fail(message: str) -> None:
    raise ValueError(message)


def fetch_comment(comment_id: int) -> dict[str, object]:
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    request = urllib.request.Request(f"https://api.github.com/repos/sustynats/wirkungsoekonomie.de/issues/comments/{comment_id}", headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def validate_live_sources(manifest: dict[str, object]) -> None:
    bodies = {}
    for pin in manifest["source"]["comments"]:
        comment = fetch_comment(int(pin["id"]))
        body = str(comment["body"])
        if comment["updated_at"] != pin["updated_at"] or hashlib.sha256(body.encode()).hexdigest() != pin["body_sha256"]:
            fail(f"ISSUE234_COMMENT_PIN_DRIFT:{pin['id']}")
        bodies[pin["marker"]] = body
    for fact in (
        "historische Working-IDs: **0253–0257**",
        "Lokale active-effect-Partition nach Dedupe: **8** unterschiedliche Effect-Leaves",
        "`ST_GRUENE_PSP_R13_NEW_STABLE_LEAVES=0`",
        "`ST_GRUENE_PSP_R13_LOCAL_ACTIVE_EFFECT_LEAVES=8`",
        "`DUPLICATE_ACTIVE_EFFECT=0`",
    ):
        if fact not in bodies["ST-GRUENE-PSP-R13"]:
            fail(f"ISSUE234_R13_FACT_MISSING:{fact}")
    for source_id in set().union(*map(set, manifest["versioned_roles"].values())):
        if source_id not in bodies["ST-GRUENE-A05"]:
            fail(f"ISSUE234_A05_STABLE_ID_MISSING:{source_id}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-github", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    scope = manifest["scope"]
    historical = set(manifest["historical_roles"]["active_effect_leaf"])
    versioned_active = set(manifest["versioned_roles"]["active_effect_leaf"])
    versioned_context = set(manifest["versioned_roles"]["context_design_non_effect_source_leaf"])
    if historical != {f"{number:04d}" for number in range(253, 258)}:
        fail("HISTORICAL_ROLE_PARTITION_MISMATCH")
    if len(versioned_active) != 3 or len(versioned_context) != 1 or versioned_active & versioned_context:
        fail("VERSIONED_ROLE_PARTITION_MISMATCH")
    targets = [target for children in manifest["lineage_edges"].values() for target in children]
    standalone = set(manifest["standalone_versioned_active_effect_leaves"])
    if len(targets) != 2 or set(targets).union(standalone) != versioned_active.union(versioned_context):
        fail("VERSIONED_LINEAGE_PARTITION_MISMATCH")
    counts = manifest["counts"]
    calculated = {
        "historical_active_effect_leaves": len(historical),
        "versioned_active_effect_leaves": len(versioned_active),
        "non_effect_source_leaves": len(versioned_context),
        "authoritative_source_leaves": len(historical) + len(versioned_active) + len(versioned_context),
        "authoritative_effect_leaves": len(historical) + len(versioned_active),
    }
    if calculated != counts:
        fail(f"COUNT_MISMATCH:{calculated}")
    register_text = (ROOT / scope["working_register"]).read_text(encoding="utf-8")
    if len(re.findall(r"^#### Eintrag \d+$", register_text, flags=re.MULTILINE)) != 740:
        fail("WORKING_REGISTER_ROW_COUNT_MISMATCH")
    source_hash = re.search(r"^\*\*source_hash:\*\* ([0-9a-f]{64})$", register_text, re.MULTILINE)
    if not source_hash or source_hash.group(1) != scope["working_register_source_hash"]:
        fail("WORKING_REGISTER_SOURCE_HASH_MISMATCH")
    if manifest["constraints"] != {
        "new_stable_ids": 0,
        "current_740_mutation": "NONE",
        "fach_synthesis": "FORBIDDEN",
        "dns_mapping": "NOT_MAPPED_HERE",
        "recommendation": "NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL",
        "global_count_freeze": "LOCKED_PENDING_R14_PLUS_AND_UNION_GATE",
    }:
        fail("NO_NEW_FACH_CONSTRAINT_DRIFT")
    if args.check_github:
        validate_live_sources(manifest)
    print(json.dumps({
        "gate": "ST_GRUENE_CONVERGENCE_C09_0253_0257",
        "status": "PASS",
        "source_leaves": counts["authoritative_source_leaves"],
        "effect_leaves": counts["authoritative_effect_leaves"],
        "github_source_pins": "PASS" if args.check_github else "NOT_REQUESTED",
        "global_freeze": "LOCKED",
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, TypeError, ValueError, urllib.error.URLError) as error:
        print(f"ST_GRUENE_CONVERGENCE_C09=BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(1)
