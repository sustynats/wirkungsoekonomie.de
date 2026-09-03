#!/usr/bin/env python3
"""Materialize and validate current Parliament GitHub Golden readiness.

The immutable 2026-08-23 Golden State remains historical release evidence.
This current descriptor is deliberately fail-closed while Berlin/MV Fach truth
is non-terminal and never authorizes a Vercel action.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "ops/releases/parliament-current-golden-readiness-2026-08-28.json"
BASE_MAIN_COMMIT = "d8de40a2c740ab1c3d4b41d0ccb1a7fdf65d5d76"

HISTORICAL_GOLDEN = "ops/releases/parliament-github-golden-state-2026-08-23.json"
ST_RELEASE = "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-six-party-terminal-release-v1.json"
IMPACT_VISUALS = "woek-parlament-app/data/impact-visuals/sachsen-anhalt-2026-v1.json"
BERLIN_SOURCE = "woek-parlament-app/data/state-programmes/current-source-registers/berlin-2026-v2.json"
BERLIN_FACH = "woek-parlament-app/data/state-programmes/fach-content-residuals/berlin-2026-v3.json"
MV_SOURCE = "woek-parlament-app/data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json"
MV_REJECTED_FACH = "woek-parlament-app/data/state-programmes/fach-content-residuals/mecklenburg-vorpommern-2026-v2.json"
SAME_PAGE_GATE = "woek-parlament-app/scripts/quality/check-same-page-navigation.mjs"


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def sha256_file(path: str) -> str:
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def descriptor_hash(payload: dict) -> str:
    value = dict(payload)
    value.pop("descriptor_sha256", None)
    encoded = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def pin(path: str, payload: dict | None = None) -> dict:
    result = {"path": path, "file_sha256": sha256_file(path)}
    if payload and "descriptor_sha256" in payload:
        result["descriptor_sha256"] = payload["descriptor_sha256"]
    if payload and "manifest_sha256" in payload:
        result["manifest_sha256"] = payload["manifest_sha256"]
    return result


def build() -> dict:
    historical = load(HISTORICAL_GOLDEN)
    st = load(ST_RELEASE)
    visuals = load(IMPACT_VISUALS)
    berlin_source = load(BERLIN_SOURCE)
    berlin_fach = load(BERLIN_FACH)
    mv_source = load(MV_SOURCE)
    mv_rejected = load(MV_REJECTED_FACH)

    payload = {
        "schema_version": "woek-parliament-current-golden-readiness-1.0",
        "readiness_id": "WOEK-PARLIAMENT-CURRENT-GOLDEN-READINESS-2026-08-28",
        "base_main_commit": BASE_MAIN_COMMIT,
        "status": "FACH_RESIDUAL_OPEN",
        "historical_production_golden_state": {
            **pin(HISTORICAL_GOLDEN, historical),
            "status": historical["status"],
            "disposition": "IMMUTABLE_HISTORICAL_RELEASE_EVIDENCE_NOT_CURRENT_READINESS",
        },
        "protected_complete_lanes": {
            "sachsen_anhalt_six_party": {
                **pin(ST_RELEASE, st),
                "status": st["status"],
                "terminal_party_count": st["terminal_party_count"],
            },
            "sachsen_anhalt_impact_visuals": {
                **pin(IMPACT_VISUALS, visuals),
                "merge_commit": "a0f4b8ac7bd49c3c145003bb457627c897aea26a",
                "record_count": len(visuals["records"]),
                "program_scenario_count": sum(row["visual_scope"] == "PROGRAM_SCENARIO" for row in visuals["records"]),
                "case_scenario_count": sum(row["visual_scope"] == "CASE_SCENARIO" for row in visuals["records"]),
                "final_image_signoff_approved_count": sum(row["final_image_signoff"] == "APPROVED" for row in visuals["records"]),
                "records_with_missing_approved_inputs": sum(bool(row["missing_approved_inputs"]) for row in visuals["records"]),
                "status": "PASS_12_OF_12_ON_MAIN",
            },
            "same_page_navigation": {
                "issue": 282,
                "merge_commit": "3dc36ece02fb52ba791ce4db23affc664f74f7f2",
                "gate_path": SAME_PAGE_GATE,
                "gate_file_sha256": sha256_file(SAME_PAGE_GATE),
                "status": "PROTECTED_RELEASE_BLOCKING_REGRESSION_GATE",
            },
        },
        "blocking_lanes": {
            "berlin": {
                "source": pin(BERLIN_SOURCE, berlin_source),
                "fach": pin(BERLIN_FACH, berlin_fach),
                "verified_final_programmes": berlin_fach["summary"]["verified_final_programmes"],
                "programme_analysis_complete": berlin_fach["summary"]["programme_analysis_complete"],
                "programme_analysis_open": berlin_fach["summary"]["programme_analysis_open"],
                "remaining_review_envelopes": berlin_fach["summary"]["remaining_page_review_envelopes"],
                "remaining_exact_effect_objects_identified": berlin_fach["summary"]["remaining_exact_effect_objects_identified"],
                "remaining_review_scopes": berlin_fach["summary"]["remaining_review_scope_count"],
                "remaining_exact_effect_object_count": berlin_fach["summary"]["remaining_exact_effect_object_count"],
                "known_segmentation_defects": berlin_fach["summary"]["known_segmentation_defects"],
                "gate": berlin_fach["summary"]["berlin_completion_gate"],
            },
            "mecklenburg_vorpommern": {
                "source": pin(MV_SOURCE, mv_source),
                "rejected_false_terminal_matrix": {
                    **pin(MV_REJECTED_FACH, mv_rejected),
                    "matrix_id": mv_rejected["matrix_id"],
                    "disposition": "REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY",
                    "rejected_verified_programmes_terminal": mv_rejected["summary"]["verified_final_programmes_terminal"],
                    "rejected_generic_rnaa_count": mv_rejected["summary"]["reviewed_not_assessable_with_exact_reason"],
                },
                "verified_final_programmes": mv_source["coverage"]["final_election_programme_verified_count"],
                "verified_final_programmes_currently_proven_fach_terminal": 0,
                "verified_final_programmes_requiring_truthful_residual": 12,
                "source_maturity_pending": mv_source["coverage"]["final_election_programme_not_verified_count"],
                "current_exact_effect_object_residual": None,
                "current_truth_matrix": "NOT_YET_MATERIALIZED_ORDERED_AFTER_BERLIN",
                "gate": "FAIL_CLOSED_MV_FACH_TRUTH_REMEDIATION_REQUIRED_AFTER_BERLIN",
            },
        },
        "combined_release_gate": {
            "github_golden_state_current": False,
            "owner_runtime_rc_request_allowed": False,
            "parliament_release_approval": "NOT_GRANTED",
            "no_new_vercel_build": True,
            "vercel_preview": False,
            "vercel_build": False,
            "vercel_deployment": False,
            "next_condition": "BERLIN_FACH_TERMINAL_THEN_MV_FACH_TERMINAL_THEN_SUPERSEDING_COMBINED_GITHUB_GOLDEN_STATE",
        },
        "constraints": {
            "fach_synthesized": False,
            "dns_synthesized": False,
            "recommendation_synthesized": False,
            "score_synthesized": False,
            "vercel_action_triggered": False,
        },
        "hash_definition": "SHA-256 of canonical JSON (UTF-8, sorted keys, compact separators) excluding descriptor_sha256",
    }
    payload["descriptor_sha256"] = descriptor_hash(payload)
    return payload


def validate(actual: dict, expected: dict) -> None:
    if actual != expected:
        raise ValueError("PARLIAMENT_CURRENT_GOLDEN_READINESS_DRIFT: run --write and inspect")
    if descriptor_hash(actual) != actual["descriptor_sha256"]:
        raise ValueError("PARLIAMENT_CURRENT_GOLDEN_READINESS_DESCRIPTOR_DRIFT")
    if actual["status"] != "FACH_RESIDUAL_OPEN":
        raise ValueError("PARLIAMENT_CURRENT_GOLDEN_FALSE_GREEN")
    berlin = actual["blocking_lanes"]["berlin"]
    if (berlin["programme_analysis_complete"], berlin["programme_analysis_open"], berlin["remaining_review_envelopes"], berlin["remaining_exact_effect_objects_identified"], berlin["remaining_review_scopes"]) != (4, 8, 1193, 0, 1193):
        raise ValueError("PARLIAMENT_CURRENT_GOLDEN_BERLIN_TRUTH_DRIFT")
    mv = actual["blocking_lanes"]["mecklenburg_vorpommern"]
    if (mv["verified_final_programmes_requiring_truthful_residual"], mv["source_maturity_pending"]) != (12, 7):
        raise ValueError("PARLIAMENT_CURRENT_GOLDEN_MV_TRUTH_DRIFT")
    visuals = actual["protected_complete_lanes"]["sachsen_anhalt_impact_visuals"]
    if (visuals["record_count"], visuals["program_scenario_count"], visuals["case_scenario_count"], visuals["final_image_signoff_approved_count"], visuals["records_with_missing_approved_inputs"]) != (12, 6, 6, 12, 0):
        raise ValueError("PARLIAMENT_CURRENT_GOLDEN_IMPACT_VISUAL_TRUTH_DRIFT")
    if any(actual["constraints"].values()):
        raise ValueError("PARLIAMENT_CURRENT_GOLDEN_FORBIDDEN_ACTION")
    release = actual["combined_release_gate"]
    if release["github_golden_state_current"] or release["owner_runtime_rc_request_allowed"] or not release["no_new_vercel_build"]:
        raise ValueError("PARLIAMENT_CURRENT_GOLDEN_RELEASE_GATE_NOT_FAIL_CLOSED")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    expected = build()
    if args.write:
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT_PATH.write_text(json.dumps(expected, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    actual = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    validate(actual, expected)
    print(json.dumps({
        "gate": "PARLIAMENT_CURRENT_GOLDEN_READINESS",
        "status": "PASS_FAIL_CLOSED_FACH_RESIDUAL_OPEN",
        "base_main_commit": actual["base_main_commit"],
        "berlin_programmes_terminal": actual["blocking_lanes"]["berlin"]["programme_analysis_complete"],
        "berlin_programmes_open": actual["blocking_lanes"]["berlin"]["programme_analysis_open"],
        "berlin_remaining_review_envelopes": actual["blocking_lanes"]["berlin"]["remaining_review_envelopes"],
        "berlin_remaining_exact_effect_objects": actual["blocking_lanes"]["berlin"]["remaining_exact_effect_objects_identified"],
        "berlin_remaining_review_scopes": actual["blocking_lanes"]["berlin"]["remaining_review_scopes"],
        "mv_programmes_requiring_truthful_residual": actual["blocking_lanes"]["mecklenburg_vorpommern"]["verified_final_programmes_requiring_truthful_residual"],
        "source_maturity_pending": actual["blocking_lanes"]["mecklenburg_vorpommern"]["source_maturity_pending"],
        "impact_visuals_approved": actual["protected_complete_lanes"]["sachsen_anhalt_impact_visuals"]["final_image_signoff_approved_count"],
        "no_new_vercel_build": True,
        "descriptor_sha256": actual["descriptor_sha256"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
