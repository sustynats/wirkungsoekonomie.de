#!/usr/bin/env python3
"""Fail-closed repository boundary for the current Berlin Fach truth.

Combined-v2 is retained as rejected historical evidence. This validator binds
CI and repository consumers to the deterministic v3 matrix, which truthfully
exposes the finite residual instead of treating source/page coverage as Fach.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
APP_ROOT = REPO_ROOT / "woek-parlament-app"
MATRIX_PATH = APP_ROOT / "data/state-programmes/fach-content-residuals/berlin-2026-v3.json"
REGISTER_PATH = APP_ROOT / "data/state-programmes/current-source-registers/berlin-2026-v2.json"
NODE_CHECKER = APP_ROOT / "scripts/quality/check-berlin-fach-truth-residual.mjs"

BINDING_ORDER = [
    "BSW", "SPD", "CDU", "FDP", "Volt", "Tierschutzpartei",
    "BÜNDNIS 90/DIE GRÜNEN", "AfD", "Die Linke", "DKP", "Die PARTEI", "SGP",
]
TERMINAL = ["DKP", "Die PARTEI", "SGP"]
OPEN = [
    "AfD", "BÜNDNIS 90/DIE GRÜNEN", "BSW", "FDP", "Tierschutzpartei",
    "Volt", "SPD", "CDU", "Die Linke",
]


def fail(message: str) -> None:
    raise SystemExit(f"Berlin Fach-truth gate failed: {message}")


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def canonical_descriptor(payload: dict) -> str:
    unhashed = dict(payload)
    unhashed.pop("descriptor_sha256", None)
    encoded = json.dumps(
        unhashed,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate_boundary(matrix: dict, register: dict) -> None:
    require(matrix.get("schema_version") == "woek-berlin-fach-content-residual-3.2", "schema drift")
    require(matrix.get("matrix_id") == "BE-FACH-CONTENT-RESIDUAL-2026-V3", "matrix id drift")
    require(matrix.get("base_main_commit") == "2f5d5d896eb1a8e851529a31139bfa57b00eca84", "base main commit drift")
    require(matrix.get("status") == "BERLIN_FACH_TRUTH_REMEDIATION_OPEN_9_OF_12", "false terminal status")
    require(matrix.get("binding_order") == BINDING_ORDER, "binding order drift")
    require(matrix.get("execution_order_remaining") == OPEN, "execution residual drift")
    require(matrix.get("descriptor_sha256") == canonical_descriptor(matrix), "descriptor mismatch")

    release = matrix.get("release_policy", {})
    require(release.get("no_new_vercel_build") is True, "NO_NEW_VERCEL_BUILD is not retained")
    require(release.get("parliament_release_approval") == "NOT_GRANTED", "release approval changed")
    require(release.get("owner_rc_request_allowed") is False, "owner RC request was enabled")
    require(all(value is False for value in matrix.get("constraints", {}).values()), "forbidden synthesis/deployment flag")

    source_pin = matrix.get("canonical_source_register", {})
    require(source_pin.get("path") == REGISTER_PATH.relative_to(REPO_ROOT).as_posix(), "source-register path drift")
    require(source_pin.get("file_sha256") == sha256_file(REGISTER_PATH), "source-register byte hash drift")
    require(register.get("descriptor_sha256") == canonical_descriptor(register), "source-register descriptor drift")
    require(source_pin.get("descriptor_sha256") == register.get("descriptor_sha256"), "source-register pin drift")

    programmes = matrix.get("programmes", [])
    require([item.get("party") for item in programmes] == BINDING_ORDER, "programme array drift")
    require(len({item.get("party") for item in programmes}) == 12, "programme set is not unique 12/12")
    register_by_party = {item["party"]: item for item in register["current_available_final_programme_set"]}
    require(set(register_by_party) == set(BINDING_ORDER), "source-register party set drift")
    for programme in programmes:
        party = programme["party"]
        source = register_by_party[party]
        require(programme.get("artifact_id") == source.get("artifact_id"), f"{party}: artifact id drift")
        require(programme.get("artifact_sha256") == source.get("sha256"), f"{party}: artifact hash drift")
        complete = party in TERMINAL
        require(programme.get("programme_analysis_complete") is complete, f"{party}: completion truth drift")
        if complete:
            require(programme.get("remaining_review_envelope_count") == 0, f"{party}: terminal residual")
        else:
            require(programme.get("remaining_review_envelope_count", 0) > 0, f"{party}: open residual disappeared")

    summary = matrix.get("summary", {})
    expected = {
        "verified_final_programmes": 12,
        "source_ready_programmes": 12,
        "programme_analysis_complete": 3,
        "programme_analysis_complete_parties": TERMINAL,
        "programme_analysis_open": 9,
        "genuine_fach_programmes": 9,
        "genuine_fach_programme_parties": OPEN,
        "remaining_genuine_fach_review_required": 1248,
        "remaining_review_scope_count": 1248,
        "remaining_page_review_envelopes": 1248,
        "remaining_exact_effect_objects_identified": 0,
        "remaining_exact_effect_object_count": None,
        "terminal_source_objects": 643,
        "known_segmentation_defects": 2,
        "berlin_completion_gate": "FAIL_CLOSED_9_PROGRAMMES_REQUIRE_SOURCE_BOUND_FACH",
    }
    for key, value in expected.items():
        require(summary.get(key) == value, f"summary {key}: expected {value!r}, got {summary.get(key)!r}")

    require(
        matrix.get("rejected_predecessor", {}).get("disposition")
        == "REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY",
        "false Combined-v2 predecessor is not rejected",
    )
    require(len(matrix.get("known_segmentation_defects", [])) == 2, "known segmentation defects drift")


def main() -> None:
    for required in (MATRIX_PATH, REGISTER_PATH, NODE_CHECKER):
        require(required.is_file(), f"missing required file {required}")
    matrix = json.loads(MATRIX_PATH.read_text(encoding="utf-8"))
    register = json.loads(REGISTER_PATH.read_text(encoding="utf-8"))
    validate_boundary(matrix, register)

    process = subprocess.run(
        ["node", str(NODE_CHECKER)],
        cwd=APP_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    if process.returncode:
        fail(process.stderr.strip() or process.stdout.strip() or "Node reproduction failed")
    node_result = json.loads(process.stdout)
    require(node_result.get("gate") == "FAIL_CLOSED_9_PROGRAMMES_REQUIRE_SOURCE_BOUND_FACH", "Node gate drift")

    print(json.dumps({
        "matrix_id": matrix["matrix_id"],
        "programmes_terminal": 3,
        "programmes_open": 9,
        "terminal_source_objects": 643,
        "remaining_review_envelopes": 1248,
        "remaining_exact_objects": 0,
        "remaining_review_scopes": 1248,
        "known_segmentation_defects": 2,
        "descriptor_sha256": matrix["descriptor_sha256"],
        "input_bound_reproduction": "PASS",
        "gate": "PASS_TRUTHFUL_NONZERO_RESIDUAL",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (FileNotFoundError, json.JSONDecodeError, KeyError, TypeError) as error:
        fail(str(error))
