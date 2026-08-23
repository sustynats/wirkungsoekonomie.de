#!/usr/bin/env python3
"""Build and validate the combined WÖk Parliament GitHub Golden State.

The descriptor binds the already-reviewed navigation, Sachsen-Anhalt,
Berlin, and Mecklenburg-Vorpommern releases. It creates no new Fach content,
DNS mapping, recommendation, party score, or Vercel deployment.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GOLDEN_PATH = ROOT / "ops/releases/parliament-github-golden-state-2026-08-23.json"
EXECUTION_ORIGIN = "9ad10243b8aa4a7d74e7475639b86d50d1be327e"
BASE_MAIN_COMMIT = "9c7d2de3599abdde5559e1fb7d63dc5a5cc38f7f"

NAV_SCRIPT_PATH = "woek-parlament-app/scripts/quality/check-same-page-navigation.mjs"
NAV_COMPONENT_PATH = "woek-parlament-app/app/components/SamePageNavigation.tsx"
ST_RELEASE_PATH = "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-six-party-terminal-release-v1.json"
BERLIN_REGISTER_PATH = "woek-parlament-app/data/state-programmes/current-source-registers/berlin-2026.json"
MV_REGISTER_PATH = "woek-parlament-app/data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026.json"
CDU_FREEZE_PATH = "audit-manifests/sachsen-anhalt/cdu-final-convergence-freeze-v1.json"

RAW_SHA256 = {
    NAV_SCRIPT_PATH: "649904fcd1208dc83663b69bc5134ce88923073755487922a1478e5e1bdac87c",
    NAV_COMPONENT_PATH: "c5546d66e011580651c5e90715aee8d1d7dc5883a275a07aa201022d11f1224c",
    ST_RELEASE_PATH: "c6d7ec4c0ad1e57ee1d5f41d7b20edc4c5b43a0c70acc7e5ea86d1aef1259b50",
    BERLIN_REGISTER_PATH: "7f22fb873ebb0e3b6bb113be37ad311378e043cd4369f051d49ffab1811bff10",
    MV_REGISTER_PATH: "4025e66a18d89040f907b1483b7dce261f6dc3e61b545f4b15d59f045da3ec77",
    CDU_FREEZE_PATH: "64994e275dbe3d139fe10f0e9f8db9ff5958f195cf31a78ecb4e0be382f3eaae",
}

LANE_COMMITS = {
    "shared_same_page_navigation": "3dc36ece02fb52ba791ce4db23affc664f74f7f2",
    "sachsen_anhalt_six_party_terminal": "fefec75f09dc70db8de7880f93b4e8c6788e4461",
    "berlin_current_source": "8ab669258b46fb3904e4d1292423c1106dc8c778",
    "mecklenburg_vorpommern_current_source": BASE_MAIN_COMMIT,
}

REQUIRED_PATHS = [
    "/laender/sachsen-anhalt",
    "/laender/sachsen-anhalt/wahlprogramme/ltw-2026-st-cdu",
    "/laender/sachsen-anhalt/wahlprogramme/ltw-2026-st-spd",
    "/laender/sachsen-anhalt/wahlprogramme/ltw-2026-st-gruene",
    "/laender/sachsen-anhalt/wahlprogramme/ltw-2026-st-linke",
    "/laender/sachsen-anhalt/wahlprogramme/ltw-2026-st-bsw",
    "/laender/sachsen-anhalt/wahlprogramme/ltw-2026-st-afd",
    "/laender/berlin",
    "/laender/berlin/wahl",
    "/laender/mecklenburg-vorpommern",
    "/laender/mecklenburg-vorpommern/wahl",
]


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def load_json(relative_path: str) -> dict:
    return json.loads((ROOT / relative_path).read_text(encoding="utf-8"))


def descriptor_hash(payload: dict) -> str:
    hashed = dict(payload)
    hashed.pop("golden_state_descriptor_sha256", None)
    canonical = json.dumps(hashed, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sha256_bytes(canonical.encode("utf-8"))


def build_descriptor() -> dict:
    payload = {
        "schema_version": "woek-parliament-github-golden-state-1.0",
        "release_id": "WOEK-PARLIAMENT-GITHUB-GOLDEN-STATE-2026-08-23",
        "execution_origin_commit": EXECUTION_ORIGIN,
        "base_main_commit": BASE_MAIN_COMMIT,
        "status": "COMBINED_GITHUB_GOLDEN_STATE",
        "lanes": {
            "shared_same_page_navigation": {
                "issue": 282,
                "pull_request": 283,
                "merge_commit": LANE_COMMITS["shared_same_page_navigation"],
                "gate_script_path": NAV_SCRIPT_PATH,
                "gate_script_sha256": RAW_SHA256[NAV_SCRIPT_PATH],
                "component_path": NAV_COMPONENT_PATH,
                "component_sha256": RAW_SHA256[NAV_COMPONENT_PATH],
                "same_page_query_navigation_preserves_scroll": True,
                "cross_page_navigation_default_unchanged": True,
            },
            "sachsen_anhalt_six_party_terminal": {
                "pull_request": 292,
                "merge_commit": LANE_COMMITS["sachsen_anhalt_six_party_terminal"],
                "release_path": ST_RELEASE_PATH,
                "release_raw_sha256": RAW_SHA256[ST_RELEASE_PATH],
                "release_descriptor_sha256": "6e0cf6fce5c41734bfd3f5480e562b93aff38a759c9b57b55298d8da4ee9dcee",
                "party_count": 6,
                "historical_working_register_count": 2921,
                "authoritative_source_unit_count": 5403,
                "authoritative_effect_mechanism_count": 5308,
                "non_effect_source_leaf_count": 95,
                "gruene_final_union_sha256": "bcb003608a6fe3777ab09736505c5bb2e9f55422bb4ba0a09abe0127cf7b0577",
                "cdu_final_union_sha256": "40c63bd93fe17093d5ba69b82efabaee9c31d51b23a14bae05579805b24db5e2",
                "cdu_0259_restatement_target": "ST-CDU-PRIMARY-SPLIT-0251-ANIMAL-WELFARE-FUNDING",
            },
            "berlin_current_source": {
                "pull_request": 293,
                "merge_commit": LANE_COMMITS["berlin_current_source"],
                "register_path": BERLIN_REGISTER_PATH,
                "register_raw_sha256": RAW_SHA256[BERLIN_REGISTER_PATH],
                "descriptor_sha256": "99a1043163b308817e858fab0d51695ac4d4e11bc537c8aab3d4ebec7f375e13",
                "classified_party_count": 17,
                "final_election_programme_verified_count": 9,
                "canonicalization_pending_count": 3,
                "source_unavailable_for_election_corpus_count": 5,
                "preserved_materiality_theme_count": 6,
            },
            "mecklenburg_vorpommern_current_source": {
                "pull_request": 294,
                "merge_commit": LANE_COMMITS["mecklenburg_vorpommern_current_source"],
                "register_path": MV_REGISTER_PATH,
                "register_raw_sha256": RAW_SHA256[MV_REGISTER_PATH],
                "descriptor_sha256": "f61a5a43f07389bf94f8e548f9cbbd1a4b74005ccd170f337f13665e5cd97673",
                "classified_party_count": 19,
                "final_election_programme_verified_count": 10,
                "canonicalization_pending_count": 3,
                "source_unavailable_for_election_corpus_count": 6,
                "preserved_materiality_theme_count": 8,
            },
        },
        "publication_integrity": {
            "required_content_paths": REQUIRED_PATHS,
            "rendered_content_paths": REQUIRED_PATHS,
            "unrendered_content_paths": [],
        },
        "github_gate_contract": {
            "combined_source_gate": "REQUIRED",
            "combined_public_projection_gate": "REQUIRED",
            "website_search_privacy_url_gate": "REQUIRED",
            "exact_head_before_merge": True,
            "tree_equivalence_after_merge": True,
        },
        "release_transition": {
            "vercel_release_budget_gate": "REQUIRED_BEFORE_BUILD",
            "vercel_build_slot_reservation": "REQUIRED_BEFORE_BUILD",
            "maximum_release_candidate_builds": 1,
            "release_candidate_builds_triggered_at_github_golden_state": 0,
            "production_strategy": "PROMOTE_SAME_TESTED_RC_WITHOUT_REBUILD",
        },
        "constraints": {
            "new_fach_judgements_created": False,
            "dns_mapping_synthesized": False,
            "recommendation_synthesized": False,
            "party_score_created": False,
            "vercel_build_triggered": False,
        },
        "hash_definition": "SHA-256 of canonical JSON (UTF-8, sorted keys, compact separators) excluding golden_state_descriptor_sha256",
    }
    payload["golden_state_descriptor_sha256"] = descriptor_hash(payload)
    return payload


def assert_ancestor(commit: str) -> None:
    result = subprocess.run(
        ["git", "merge-base", "--is-ancestor", commit, "HEAD"],
        cwd=ROOT,
        check=False,
    )
    if result.returncode != 0:
        raise ValueError(f"GOLDEN_STATE_REQUIRED_COMMIT_NOT_IN_ANCESTRY:{commit}")


def validate(actual: dict, expected: dict) -> None:
    if actual != expected:
        raise ValueError("PARLIAMENT_GITHUB_GOLDEN_STATE_DRIFT: run with --write and inspect the diff")
    if descriptor_hash(actual) != actual["golden_state_descriptor_sha256"]:
        raise ValueError("PARLIAMENT_GITHUB_GOLDEN_STATE_DESCRIPTOR_HASH_DRIFT")
    for relative_path, expected_sha in RAW_SHA256.items():
        if sha256_bytes((ROOT / relative_path).read_bytes()) != expected_sha:
            raise ValueError(f"PARLIAMENT_GOLDEN_STATE_RAW_HASH_DRIFT:{relative_path}")

    st_release = load_json(ST_RELEASE_PATH)
    berlin = load_json(BERLIN_REGISTER_PATH)
    mv = load_json(MV_REGISTER_PATH)
    cdu_freeze = load_json(CDU_FREEZE_PATH)
    if st_release["status"] != "TERMINAL_6_OF_6" or st_release["terminal_party_count"] != 6:
        raise ValueError("PARLIAMENT_GOLDEN_STATE_ST_NOT_TERMINAL_6_OF_6")
    if st_release["release_descriptor_sha256"] != actual["lanes"]["sachsen_anhalt_six_party_terminal"]["release_descriptor_sha256"]:
        raise ValueError("PARLIAMENT_GOLDEN_STATE_ST_DESCRIPTOR_DRIFT")
    if cdu_freeze["relations"]["0259_restatement_target"] != "ST-CDU-PRIMARY-SPLIT-0251-ANIMAL-WELFARE-FUNDING":
        raise ValueError("PARLIAMENT_GOLDEN_STATE_CDU_0259_TO_0251_BINDING_DRIFT")
    if cdu_freeze["relations"]["edge_counts"]["RESTATEMENT"] != 1:
        raise ValueError("PARLIAMENT_GOLDEN_STATE_CDU_RESTATEMENT_EDGE_COUNT_DRIFT")
    if berlin["status"] != "CURRENT_SOURCE_CLASSIFICATION_COMPLETE_17_OF_17" or berlin["descriptor_sha256"] != actual["lanes"]["berlin_current_source"]["descriptor_sha256"]:
        raise ValueError("PARLIAMENT_GOLDEN_STATE_BERLIN_REGISTER_DRIFT")
    if mv["status"] != "CURRENT_SOURCE_CLASSIFICATION_COMPLETE_19_OF_19" or mv["descriptor_sha256"] != actual["lanes"]["mecklenburg_vorpommern_current_source"]["descriptor_sha256"]:
        raise ValueError("PARLIAMENT_GOLDEN_STATE_MV_REGISTER_DRIFT")
    for source in (st_release, berlin, mv):
        if any(source["constraints"].values()):
            raise ValueError("PARLIAMENT_GOLDEN_STATE_FORBIDDEN_SOURCE_CONSTRAINT")
    integrity = actual["publication_integrity"]
    if integrity["required_content_paths"] != integrity["rendered_content_paths"] or integrity["unrendered_content_paths"]:
        raise ValueError("PARLIAMENT_GOLDEN_STATE_PUBLICATION_PATH_DRIFT")
    if any(actual["constraints"].values()):
        raise ValueError("PARLIAMENT_GOLDEN_STATE_FORBIDDEN_SYNTHESIS_OR_DEPLOYMENT")
    if actual["release_transition"]["maximum_release_candidate_builds"] != 1:
        raise ValueError("PARLIAMENT_GOLDEN_STATE_RC_BUILD_LIMIT_DRIFT")
    if actual["release_transition"]["release_candidate_builds_triggered_at_github_golden_state"] != 0:
        raise ValueError("PARLIAMENT_GOLDEN_STATE_PREMATURE_VERCEL_BUILD")
    for commit in [EXECUTION_ORIGIN, *LANE_COMMITS.values()]:
        assert_ancestor(commit)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    expected = build_descriptor()
    if args.write:
        GOLDEN_PATH.parent.mkdir(parents=True, exist_ok=True)
        GOLDEN_PATH.write_text(
            json.dumps(expected, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
            newline="\n",
        )
    if not GOLDEN_PATH.exists():
        raise ValueError("PARLIAMENT_GITHUB_GOLDEN_STATE_DESCRIPTOR_MISSING")
    actual = json.loads(GOLDEN_PATH.read_text(encoding="utf-8"))
    validate(actual, expected)
    print(json.dumps({
        "gate": "PARLIAMENT_GITHUB_GOLDEN_STATE",
        "status": "PASS_COMBINED_GITHUB_GOLDEN_STATE",
        "execution_origin_commit": EXECUTION_ORIGIN,
        "base_main_commit": BASE_MAIN_COMMIT,
        "sachsen_anhalt_terminal_parties": 6,
        "berlin_current_source_classifications": 17,
        "mv_current_source_classifications": 19,
        "required_public_paths": len(REQUIRED_PATHS),
        "unrendered_content_paths": 0,
        "maximum_release_candidate_builds": 1,
        "release_candidate_builds_triggered": 0,
        "production_strategy": "PROMOTE_SAME_TESTED_RC_WITHOUT_REBUILD",
        "golden_state_descriptor_sha256": actual["golden_state_descriptor_sha256"],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
