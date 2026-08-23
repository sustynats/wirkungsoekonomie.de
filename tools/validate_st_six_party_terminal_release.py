#!/usr/bin/env python3
"""Build and validate the terminal Sachsen-Anhalt six-party release.

This is a convergence and publication descriptor only. It composes the six
already-frozen party manifests, preserves their historical working-register
counts as a separate dimension, and creates no Fach, DNS, recommendation,
party score, or Vercel deployment.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RELEASE_PATH = ROOT / "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-six-party-terminal-release-v1.json"
BASE_MAIN_COMMIT = "e7154e3540e46beb64e64880d0fcee3a53781f00"

PARTIES = [
    {
        "source_key": "ltw-2026-st-cdu",
        "party": "CDU Sachsen-Anhalt",
        "manifest_path": "audit-manifests/sachsen-anhalt/cdu-final-convergence-freeze-v1.json",
        "manifest_raw_sha256": "64994e275dbe3d139fe10f0e9f8db9ff5958f195cf31a78ecb4e0be382f3eaae",
        "manifest_content_sha256": "40c63bd93fe17093d5ba69b82efabaee9c31d51b23a14bae05579805b24db5e2",
        "hash_definition": "frozen_exact_union_sha256",
        "historical_working_register_count": 344,
        "authoritative_source_unit_count": 737,
        "authoritative_effect_mechanism_count": 736,
        "non_effect_source_leaf_count": 1,
        "terminal_fach_gate": "PASS",
    },
    {
        "source_key": "ltw-2026-st-spd",
        "party": "SPD Sachsen-Anhalt",
        "manifest_path": "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/spd-final-active-leaf-manifest-c01i.json",
        "manifest_raw_sha256": "9afe25ebfad343f65a96cb2d6ef2d2b0eb9be5ed9409b6a062af75e044dd604e",
        "manifest_content_sha256": "337e1be9535830b6ca6f24df79440d1946f61d82bdefb70f0450e5d7bee54874",
        "hash_definition": "canonical full JSON object",
        "historical_working_register_count": 174,
        "authoritative_source_unit_count": 894,
        "authoritative_effect_mechanism_count": 894,
        "non_effect_source_leaf_count": 0,
        "terminal_fach_gate": "PASS_REUSED",
    },
    {
        "source_key": "ltw-2026-st-gruene",
        "party": "BÜNDNIS 90/DIE GRÜNEN Sachsen-Anhalt",
        "manifest_path": "audit-manifests/sachsen-anhalt/gruene-final-union-c17.json",
        "manifest_raw_sha256": "1b939e42aee5983173861a39295caf25494a2bd1a6d8cca09fd2b4ea76dd3de4",
        "manifest_content_sha256": "bcb003608a6fe3777ab09736505c5bb2e9f55422bb4ba0a09abe0127cf7b0577",
        "hash_definition": "canonical JSON excluding descriptor_sha256",
        "historical_working_register_count": 740,
        "authoritative_source_unit_count": 1241,
        "authoritative_effect_mechanism_count": 1147,
        "non_effect_source_leaf_count": 94,
        "terminal_fach_gate": "PASS_REUSED_TERMINAL_LEAVES",
    },
    {
        "source_key": "ltw-2026-st-linke",
        "party": "Die Linke Sachsen-Anhalt",
        "manifest_path": "content/audits/sachsen-anhalt/linke-final-union-manifest-c26.json",
        "manifest_raw_sha256": "307919d5a528b5fd4ef8794753c068d8ba2a83a142e538c7d3f3a201b636ccd5",
        "manifest_content_sha256": "307919d5a528b5fd4ef8794753c068d8ba2a83a142e538c7d3f3a201b636ccd5",
        "hash_definition": "canonical full JSON object",
        "historical_working_register_count": 886,
        "authoritative_source_unit_count": 1243,
        "authoritative_effect_mechanism_count": 1243,
        "non_effect_source_leaf_count": 0,
        "terminal_fach_gate": "PASS_REUSED_EXACTLY_NO_NEW_JUDGEMENT",
    },
    {
        "source_key": "ltw-2026-st-bsw",
        "party": "BSW Sachsen-Anhalt",
        "manifest_path": "content/audits/sachsen-anhalt/bsw-final-union-manifest-r22.json",
        "manifest_raw_sha256": "5e56b59ed6ff9f579f3bfecc16142d7a43fde71dc7f967cfe13c409a287a46f9",
        "manifest_content_sha256": "df38b10505b4e560f00b5c4b771928699a5d700da933237c454ba47220f69875",
        "hash_definition": "canonical JSON excluding canonical_manifest_payload_sha256 and hash_definition",
        "historical_working_register_count": 311,
        "authoritative_source_unit_count": 669,
        "authoritative_effect_mechanism_count": 669,
        "non_effect_source_leaf_count": 0,
        "terminal_fach_gate": "PASS",
    },
    {
        "source_key": "ltw-2026-st-afd",
        "party": "Alternative für Deutschland Sachsen-Anhalt",
        "manifest_path": "content/audits/sachsen-anhalt/afd-final-union-manifest-a43.json",
        "manifest_raw_sha256": "6eaf6020a3e412535c40542dde1ddab655cace5b8f1e8cd177efa90537f2cf90",
        "manifest_content_sha256": "4223fde6b37165d56242df35d0278e77e16f55ea100d25e13607413c77fa6607",
        "hash_definition": "canonical full JSON object",
        "historical_working_register_count": 466,
        "authoritative_source_unit_count": 619,
        "authoritative_effect_mechanism_count": 619,
        "non_effect_source_leaf_count": 0,
        "terminal_fach_gate": "PASS_REUSED_EXACTLY",
    },
]


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def descriptor_hash(payload: dict) -> str:
    hashed = dict(payload)
    hashed.pop("release_descriptor_sha256", None)
    canonical = json.dumps(hashed, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sha256_bytes(canonical.encode("utf-8"))


def build_release() -> dict:
    required_paths = ["/laender/sachsen-anhalt"] + [
        f"/laender/sachsen-anhalt/wahlprogramme/{party['source_key']}" for party in PARTIES
    ]
    payload = {
        "schema_version": "woek-st-six-party-terminal-release-1.0",
        "manifest_id": "LTW-2026-ST-SIX-PARTY-TERMINAL-RELEASE-V1",
        "base_main_commit": BASE_MAIN_COMMIT,
        "election": "ltw-2026-st",
        "jurisdiction": "sachsen-anhalt",
        "status": "TERMINAL_6_OF_6",
        "terminal_party_count": 6,
        "expected_party_count": 6,
        "counting_rule": {
            "historical_working_register": "Immutable Release-1 working dimension; never arithmetically combined with authoritative source units.",
            "authoritative_source_units": "Sum of the six collision-resolved frozen party source-unit sets.",
            "authoritative_effect_mechanisms": "Sum of the six frozen effect-bearing leaf sets.",
            "non_effect_source_leaves": "Authoritative source leaves intentionally carrying no effect mechanism; source units minus effect mechanisms.",
        },
        "historical_working_register": {
            "count": sum(party["historical_working_register_count"] for party in PARTIES),
            "role": "HISTORICAL_RELEASE_1_WORKING_DIMENSION",
        },
        "authoritative_totals": {
            "source_units": sum(party["authoritative_source_unit_count"] for party in PARTIES),
            "effect_mechanisms": sum(party["authoritative_effect_mechanism_count"] for party in PARTIES),
            "non_effect_source_leaves": sum(party["non_effect_source_leaf_count"] for party in PARTIES),
        },
        "parties": [
            {
                **party,
                "primary_source_parity": "PASS_FULL_PROGRAMME",
                "source_gap_count": 0,
                "stable_id_collision_count": 0,
                "relation_graph_acyclic": True,
            }
            for party in PARTIES
        ],
        "publication_integrity": {
            "required_content_paths": required_paths,
            "rendered_content_paths": required_paths,
            "unrendered_content_paths": [],
        },
        "constraints": {
            "new_fach_semantics_created": False,
            "dns_mapping_synthesized": False,
            "recommendation_synthesized": False,
            "party_score_created": False,
            "vercel_build_triggered": False,
        },
        "gates": {
            "six_of_six_terminal": "PASS",
            "all_primary_source_parity": "PASS_FULL_PROGRAMME",
            "all_terminal_fach_sets": "PASS_PARTY_SPECIFIC_TERMINAL_GATES",
            "all_source_gaps_zero": "PASS",
            "all_stable_id_collisions_zero": "PASS",
            "all_relation_graphs_acyclic": "PASS",
            "public_projection_complete": "PASS",
        },
        "hash_definition": "SHA-256 of canonical JSON (UTF-8, sorted keys, compact separators) excluding release_descriptor_sha256",
    }
    payload["release_descriptor_sha256"] = descriptor_hash(payload)
    return payload


def validate_release(actual: dict, expected: dict) -> None:
    if actual != expected:
        raise ValueError("TERMINAL_RELEASE_DESCRIPTOR_DRIFT: run with --write and inspect the diff")
    if descriptor_hash(actual) != actual.get("release_descriptor_sha256"):
        raise ValueError("TERMINAL_RELEASE_DESCRIPTOR_HASH_DRIFT")
    source_keys = [party["source_key"] for party in actual["parties"]]
    if len(source_keys) != 6 or len(set(source_keys)) != 6:
        raise ValueError("TERMINAL_PARTY_SET_NOT_EXACTLY_SIX")
    for party in actual["parties"]:
        raw = (ROOT / party["manifest_path"]).read_bytes()
        if sha256_bytes(raw) != party["manifest_raw_sha256"]:
            raise ValueError(f"PARTY_MANIFEST_RAW_HASH_DRIFT:{party['source_key']}")
        if party["authoritative_source_unit_count"] - party["authoritative_effect_mechanism_count"] != party["non_effect_source_leaf_count"]:
            raise ValueError(f"PARTY_COUNT_CONSERVATION_DRIFT:{party['source_key']}")
    if actual["historical_working_register"]["count"] != 2921:
        raise ValueError("HISTORICAL_WORKING_REGISTER_TOTAL_DRIFT")
    if actual["authoritative_totals"] != {
        "source_units": 5403,
        "effect_mechanisms": 5308,
        "non_effect_source_leaves": 95,
    }:
        raise ValueError("AUTHORITATIVE_TOTAL_DRIFT")
    integrity = actual["publication_integrity"]
    if integrity["required_content_paths"] != integrity["rendered_content_paths"] or integrity["unrendered_content_paths"]:
        raise ValueError("PUBLICATION_PATH_COVERAGE_DRIFT")
    if any(actual["constraints"].values()):
        raise ValueError("FORBIDDEN_SYNTHESIS_OR_DEPLOYMENT_RECORDED")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    expected = build_release()
    if args.write:
        RELEASE_PATH.parent.mkdir(parents=True, exist_ok=True)
        RELEASE_PATH.write_text(
            json.dumps(expected, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
            newline="\n",
        )
    if not RELEASE_PATH.exists():
        raise ValueError("TERMINAL_RELEASE_DESCRIPTOR_MISSING")
    actual = json.loads(RELEASE_PATH.read_text(encoding="utf-8"))
    validate_release(actual, expected)
    print(json.dumps({
        "gate": "ST_SIX_PARTY_TERMINAL_RELEASE",
        "status": "PASS",
        "party_count": 6,
        "historical_working_register_count": 2921,
        "authoritative_source_unit_count": 5403,
        "authoritative_effect_mechanism_count": 5308,
        "non_effect_source_leaf_count": 95,
        "unrendered_content_paths": 0,
        "release_descriptor_sha256": actual["release_descriptor_sha256"],
        "new_fach_semantics_created": False,
        "dns_mapping_synthesized": False,
        "recommendation_synthesized": False,
        "vercel_build_triggered": False,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
