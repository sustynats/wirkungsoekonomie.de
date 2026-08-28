#!/usr/bin/env python3
"""Validate the current, finite residual matrix for issue #241.

The gate verifies existing source/Fach state only. It must never manufacture
impact directions, DNS mappings, recommendations, scores, or deployments.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MATRIX_PATH = ROOT / "docs/audits/parliament-241-current-residual-2026-08-24.json"
ST_PATH = ROOT / "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-six-party-terminal-release-v1.json"
BE_PATH = ROOT / "woek-parlament-app/data/state-programmes/current-source-registers/berlin-2026-v2.json"
BE_FACH_PATH = ROOT / "woek-parlament-app/data/state-programmes/fach-content-residuals/berlin-2026-v3.json"
MV_PATH = ROOT / "woek-parlament-app/data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json"
GOLDEN_PATH = ROOT / "ops/releases/parliament-github-golden-state-2026-08-23.json"
CURRENT_READINESS_PATH = ROOT / "ops/releases/parliament-current-golden-readiness-2026-08-28.json"
STATE_ADAPTERS_PATH = ROOT / "woek-parlament-app/data/state-sources/official-state-source-adapters-v1.json"

ALLOWED_STATUSES = {
    "DONE_ON_MAIN",
    "DONE_AND_LIVE",
    "PRESENT_BUT_HIDDEN",
    "RESTORE_REQUIRED",
    "TECHNICAL_GAP",
    "APPROVED_FACH_NOT_PROJECTED",
    "GENUINE_FACH_REVIEW_REQUIRED",
    "NOT_APPLICABLE",
}

REQUIRED_PREFIXES = {
    "241-GAP-", "241-A-", "241-B-", "241-C-", "241-D-", "241-E-",
    "241-F-", "241-G-", "241-H-", "241-DOD-", "241-POLICY-",
}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def validate() -> dict:
    matrix = load(MATRIX_PATH)
    st = load(ST_PATH)
    berlin = load(BE_PATH)
    berlin_fach = load(BE_FACH_PATH)
    mv = load(MV_PATH)
    golden = load(GOLDEN_PATH)
    current_readiness = load(CURRENT_READINESS_PATH)
    state_adapters = load(STATE_ADAPTERS_PATH)

    require(set(matrix["classification_taxonomy"]) == ALLOWED_STATUSES, "ISSUE_241_CLASSIFICATION_TAXONOMY_DRIFT")
    requirements = matrix["requirements"]
    ids = [item["id"] for item in requirements]
    require(len(ids) == len(set(ids)), "ISSUE_241_DUPLICATE_REQUIREMENT_ID")
    for prefix in REQUIRED_PREFIXES:
        require(any(item_id.startswith(prefix) for item_id in ids), f"ISSUE_241_SECTION_MISSING:{prefix}")
    for item in requirements:
        require(item["status"] in ALLOWED_STATUSES, f"ISSUE_241_INVALID_STATUS:{item['id']}")
        require(item["issue_241_refs"], f"ISSUE_241_BODY_REFERENCE_MISSING:{item['id']}")
        require(item["evidence"], f"ISSUE_241_EVIDENCE_MISSING:{item['id']}")
        if item["status"] in {"TECHNICAL_GAP", "GENUINE_FACH_REVIEW_REQUIRED", "RESTORE_REQUIRED", "APPROVED_FACH_NOT_PROJECTED"}:
            require(item["residual"], f"ISSUE_241_OPEN_RESIDUAL_NOT_FINITE:{item['id']}")

    require(st["status"] == "TERMINAL_6_OF_6" and st["terminal_party_count"] == 6, "ISSUE_241_ST_NOT_TERMINAL_6_OF_6")
    require(st["authoritative_totals"] == {"effect_mechanisms": 5308, "non_effect_source_leaves": 95, "source_units": 5403}, "ISSUE_241_ST_COUNTS_DRIFT")
    require(berlin["status"] == "CURRENT_SOURCE_CLASSIFICATION_COMPLETE_17_OF_17", "ISSUE_241_BE_SOURCE_FIELD_DRIFT")
    require(berlin["coverage"]["assessment_maturity"] == "PARTIAL_ANALYSIS_NEEDS_COMPLETION", "ISSUE_241_BE_FALSE_TERMINAL")
    require(berlin["coverage"]["final_election_programme_verified_count"] == 12, "ISSUE_241_BE_FINAL_COUNT_DRIFT")
    require(berlin["coverage"]["election_source_available_canonicalization_pending_count"] == 0, "ISSUE_241_BE_CANONICALIZATION_COUNT_DRIFT")
    require(berlin["coverage"]["canonical_artifact_count"] == 12, "ISSUE_241_BE_CANONICAL_ARTIFACT_COUNT_DRIFT")
    require(berlin_fach["summary"]["programme_analysis_complete"] == 3, "ISSUE_241_BE_FACH_TERMINAL_COUNT_DRIFT")
    require(berlin_fach["summary"]["genuine_fach_programmes"] == 9, "ISSUE_241_BE_FACH_RESIDUAL_COUNT_DRIFT")
    require(berlin_fach["summary"]["remaining_page_review_envelopes"] == 1244, "ISSUE_241_BE_FACH_ENVELOPE_COUNT_DRIFT")
    require(berlin_fach["summary"]["remaining_exact_effect_objects_identified"] == 19, "ISSUE_241_BE_FACH_EXACT_OBJECT_COUNT_DRIFT")
    require(berlin_fach["summary"]["remaining_review_scope_count"] == 1263, "ISSUE_241_BE_FACH_SCOPE_COUNT_DRIFT")
    require(berlin_fach["summary"]["remaining_exact_effect_object_count"] is None, "ISSUE_241_BE_FALSE_EFFECT_OBJECT_COUNT")
    require(berlin_fach["summary"]["known_segmentation_defects"] == 2, "ISSUE_241_BE_SEGMENTATION_DEFECT_DRIFT")
    require(berlin_fach["rejected_predecessor"]["disposition"] == "REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY", "ISSUE_241_BE_FALSE_TERMINAL_NOT_REJECTED")
    require(mv["status"] == "CURRENT_SOURCE_CLASSIFICATION_COMPLETE_19_OF_19", "ISSUE_241_MV_SOURCE_FIELD_DRIFT")
    require(mv["coverage"]["assessment_maturity"] == "PARTIAL_ANALYSIS_NEEDS_COMPLETION", "ISSUE_241_MV_FALSE_TERMINAL")
    require(mv["coverage"]["final_election_programme_verified_count"] == 12, "ISSUE_241_MV_FINAL_COUNT_DRIFT")
    require(mv["coverage"]["election_source_available_canonicalization_pending_count"] == 0, "ISSUE_241_MV_CANONICALIZATION_COUNT_DRIFT")
    require(mv["coverage"]["canonical_artifact_count"] == 3, "ISSUE_241_MV_CANONICAL_ARTIFACT_COUNT_DRIFT")
    require(mv["coverage"]["canonical_current_source_finality_open_count"] == 1, "ISSUE_241_MV_OPEN_FINALITY_COUNT_DRIFT")
    require(golden["status"] == "COMBINED_GITHUB_GOLDEN_STATE", "ISSUE_241_COMBINED_CHECKPOINT_DRIFT")
    require(current_readiness["status"] == "FACH_RESIDUAL_OPEN", "ISSUE_241_CURRENT_GOLDEN_FALSE_GREEN")
    require(current_readiness["blocking_lanes"]["berlin"]["remaining_review_envelopes"] == 1244, "ISSUE_241_CURRENT_GOLDEN_BE_RESIDUAL_DRIFT")
    require(current_readiness["blocking_lanes"]["berlin"]["remaining_exact_effect_objects_identified"] == 19, "ISSUE_241_CURRENT_GOLDEN_BE_EXACT_OBJECT_DRIFT")
    require(current_readiness["blocking_lanes"]["berlin"]["remaining_review_scopes"] == 1263, "ISSUE_241_CURRENT_GOLDEN_BE_SCOPE_DRIFT")
    require(current_readiness["blocking_lanes"]["mecklenburg_vorpommern"]["verified_final_programmes_requiring_truthful_residual"] == 12, "ISSUE_241_CURRENT_GOLDEN_MV_RESIDUAL_DRIFT")
    require(current_readiness["combined_release_gate"]["github_golden_state_current"] is False, "ISSUE_241_CURRENT_GOLDEN_RELEASE_FALSE_GREEN")
    require(current_readiness["combined_release_gate"]["owner_runtime_rc_request_allowed"] is False, "ISSUE_241_CURRENT_GOLDEN_RC_REQUEST_ENABLED")
    require(state_adapters["status"] == "ACTIVE_DOCUMENT_DISCOVERY_16_OF_16", "ISSUE_241_STATE_ADAPTER_STATUS_DRIFT")
    require(state_adapters["coverage"]["registered_state_count"] == 16, "ISSUE_241_STATE_ADAPTER_REGISTRY_DRIFT")
    require(state_adapters["coverage"]["active_document_discovery_adapter_count"] == 16, "ISSUE_241_STATE_ADAPTER_ACTIVE_COUNT_DRIFT")
    require(state_adapters["coverage"]["automatic_public_fact_projection_count"] == 0, "ISSUE_241_STATE_ADAPTER_FACT_BOUNDARY_DRIFT")
    require(state_adapters["coverage"]["automatic_fach_projection_count"] == 0, "ISSUE_241_STATE_ADAPTER_FACH_BOUNDARY_DRIFT")

    technical = matrix["finite_residuals"]["technical"]
    fach = matrix["finite_residuals"]["fach_review_required"]
    require([item["id"] for item in technical] == ["BLOCKED_BY_BE_AND_MV_FACH_TERMINAL"], "ISSUE_241_STATE_ORDER_DRIFT")
    require(len(fach[0]["verified_final_programmes"]) == 12 and len(fach[0]["canonicalization_pending_programmes"]) == 0, "ISSUE_241_BE_FACH_RESIDUAL_DRIFT")
    require(fach[0]["programme_analysis_complete"] == ["DKP", "Die PARTEI", "SGP"], "ISSUE_241_BE_FACH_TERMINAL_SET_DRIFT")
    require(fach[0]["genuine_fach_programmes"] == ["AfD", "BÜNDNIS 90/DIE GRÜNEN", "BSW", "FDP", "Tierschutzpartei", "Volt", "SPD", "CDU", "Die Linke"], "ISSUE_241_BE_FACH_OPEN_SET_DRIFT")
    require(fach[0]["canonical_artifact_register"].endswith("berlin-2026-v2.json"), "ISSUE_241_BE_FACH_ARTIFACT_REGISTER_DRIFT")
    require(fach[0]["fach_residual_matrix"].endswith("berlin-2026-v3.json"), "ISSUE_241_BE_FACH_MATRIX_DRIFT")
    require(fach[0]["remaining_review_envelopes"] == 1244, "ISSUE_241_BE_FACH_FINITE_ENVELOPE_DRIFT")
    require(fach[0]["remaining_exact_effect_objects_identified"] == 19, "ISSUE_241_BE_FACH_FINITE_EXACT_OBJECT_DRIFT")
    require(fach[0]["remaining_review_scopes"] == 1263, "ISSUE_241_BE_FACH_FINITE_SCOPE_DRIFT")
    require(fach[0]["remaining_exact_effect_object_count"] is None, "ISSUE_241_BE_FACH_FALSE_EFFECT_TOTAL")
    require(fach[0]["known_segmentation_defects"] == ["BE-SPD-2026-SU-0136-A01", "BE-SPD-2026-SU-0136-A03"], "ISSUE_241_BE_FACH_SEGMENTATION_SET_DRIFT")
    require(fach[0]["rejected_false_terminal_matrix"].endswith("berlin-2026-v2.json"), "ISSUE_241_BE_REJECTED_MATRIX_DRIFT")
    require(len(fach[1]["verified_final_programmes"]) == 12 and len(fach[1]["canonicalization_pending_programmes"]) == 0, "ISSUE_241_MV_FACH_RESIDUAL_DRIFT")
    require(fach[1]["current_source_finality_open"] == ["Die PARTEI"], "ISSUE_241_MV_OPEN_FINALITY_RESIDUAL_DRIFT")
    require(fach[1]["canonical_artifact_register"].endswith("mecklenburg-vorpommern-2026-v2.json"), "ISSUE_241_MV_ARTIFACT_REGISTER_DRIFT")
    require(fach[2]["source_commitment_count"] == 1593 and len(fach[2]["documents"]) == 7, "ISSUE_241_BUND_FACH_RESIDUAL_DRIFT")
    require(not any(matrix["constraints"].values()), "ISSUE_241_FORBIDDEN_SYNTHESIS_OR_DEPLOYMENT")
    require(matrix["release_policy"]["no_new_vercel_build"] is True, "ISSUE_241_VERCEL_GATE_NOT_FAIL_CLOSED")

    counts = Counter(item["status"] for item in requirements)
    require(counts["PRESENT_BUT_HIDDEN"] == 0, "ISSUE_241_UNRESOLVED_HIDDEN_CONTENT")
    require(counts["RESTORE_REQUIRED"] == 0, "ISSUE_241_UNRESOLVED_RESTORE")
    require(counts["APPROVED_FACH_NOT_PROJECTED"] == 0, "ISSUE_241_APPROVED_FACH_PROJECTION_GAP")
    return {
        "gate": "PARLIAMENT_ISSUE_241_CURRENT_RESIDUAL",
        "status": "PASS_CURRENT_RESIDUAL_FINITE",
        "audited_main_commit": matrix["audited_main_commit"],
        "requirements": len(requirements),
        "classification_counts": dict(sorted(counts.items())),
        "berlin_technical_items": 0,
        "mv_technical_items": 0,
        "state_official_source_adapters": 16,
        "automatic_state_fact_projection": 0,
        "berlin_verified_final_programmes_pending_explicit_full_fach": 9,
        "mv_verified_final_programmes_pending_explicit_full_fach": 12,
        "no_new_vercel_build": True,
    }


if __name__ == "__main__":
    print(json.dumps(validate(), ensure_ascii=False, indent=2, sort_keys=True))
