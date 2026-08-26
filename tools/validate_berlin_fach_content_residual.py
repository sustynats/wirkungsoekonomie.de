#!/usr/bin/env python3
"""Fail-closed repository entrypoint for the Berlin combined terminal matrix.

This path is intentionally repository-local because the application package
invokes it as ``python3 ../tools/validate_berlin_fach_content_residual.py``.
The Python boundary validates the immutable combined contract and delegates the
full input-by-input reproduction check to the versioned Node checker.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
APP_ROOT = REPO_ROOT / "woek-parlament-app"
MATRIX_PATH = (
    APP_ROOT
    / "data/state-programmes/fach-content-residuals/berlin-2026-v2.json"
)
REGISTER_PATH = (
    APP_ROOT
    / "data/state-programmes/current-source-registers/berlin-2026-v2.json"
)
NODE_CHECKER = (
    APP_ROOT / "scripts/quality/check-berlin-combined-terminal-matrix.mjs"
)

BINDING_ORDER = [
    "BSW",
    "SPD",
    "CDU",
    "FDP",
    "Volt",
    "Tierschutzpartei",
    "BÜNDNIS 90/DIE GRÜNEN",
    "AfD",
    "Die Linke",
    "DKP",
    "Die PARTEI",
    "SGP",
]

EXPECTED_SUMMARY = {
    "verified_final_programmes": 12,
    "programme_analysis_complete": 12,
    "programme_analysis_open": 0,
    "remaining_genuine_fach_review_required": 0,
    "remaining_page_review_envelopes": 0,
    "pdf_pages_reviewed": 1293,
    "html_programme_scopes_reviewed": 1,
    "terminal_source_objects": 22334,
    "terminal_explicit_fach_approved_or_reused": 78,
    "terminal_explicit_fach_approved": 42,
    "terminal_explicit_fach_reused": 36,
    "terminal_reviewed_not_assessable": 19629,
    "terminal_non_effect_context": 2627,
    "unaccounted_programmes": 0,
    "unaccounted_pages": 0,
    "unclassified_source_units": 0,
    "unterminated_effect_atoms": 0,
    "source_conflicts_without_status": 0,
    "silent_omissions": 0,
    "berlin_completion_gate": "PASS_12_OF_12_TERMINAL",
}


def fail(message: str) -> None:
    raise SystemExit(f"Berlin combined terminal matrix gate failed: {message}")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def descriptor_sha256(value: dict) -> str:
    unhashed = dict(value)
    unhashed.pop("descriptor_sha256", None)
    encoded = json.dumps(
        unhashed,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return sha256_bytes(encoded)


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def validate_python_boundary(matrix: dict, register: dict) -> None:
    require(
        matrix.get("schema_version") == "woek-berlin-fach-content-residual-2.1",
        "unexpected schema_version",
    )
    require(
        matrix.get("matrix_id") == "BE-FACH-CONTENT-RESIDUAL-2026-V2",
        "unexpected matrix_id",
    )
    require(
        matrix.get("status") == "BERLIN_FULL_PROGRAMME_REVIEW_TERMINAL_12_OF_12",
        "matrix is not terminal 12/12",
    )
    require(matrix.get("binding_order") == BINDING_ORDER, "binding order drift")
    require(matrix.get("execution_order_remaining") == [], "execution residual is not empty")
    require(
        matrix.get("descriptor_sha256") == descriptor_sha256(matrix),
        "matrix descriptor mismatch",
    )
    require(
        matrix.get("hash_definition")
        == "SHA-256 of canonical JSON (UTF-8, sorted keys, compact separators) excluding descriptor_sha256",
        "matrix hash definition drift",
    )

    policy = matrix.get("release_policy", {})
    require(policy.get("no_new_vercel_build") is True, "NO_NEW_VERCEL_BUILD is not retained")
    require(
        policy.get("parliament_release_approval") == "NOT_GRANTED",
        "Parliament release approval changed",
    )
    for key in ("vercel_preview", "vercel_build", "vercel_deployment"):
        require(policy.get(key) is False, f"release policy permits {key}")
    require(
        all(value is False for value in matrix.get("constraints", {}).values()),
        "a no-synthesis constraint is not false",
    )

    source_pin = matrix.get("canonical_source_register", {})
    register_bytes = REGISTER_PATH.read_bytes()
    require(source_pin.get("path") == REGISTER_PATH.relative_to(REPO_ROOT).as_posix(), "register path drift")
    require(source_pin.get("file_sha256") == sha256_bytes(register_bytes), "register byte hash mismatch")
    require(source_pin.get("descriptor_sha256") == descriptor_sha256(register), "register descriptor mismatch")
    require(register.get("descriptor_sha256") == descriptor_sha256(register), "register self-descriptor mismatch")

    verified_set = register.get("current_available_final_programme_set", [])
    require(len(verified_set) == 12, "source register does not expose exactly 12 final programmes")
    register_by_party = {item.get("party"): item for item in verified_set}
    require(set(register_by_party) == set(BINDING_ORDER), "matrix/source-register party-set mismatch")

    programmes = matrix.get("programmes", [])
    require([item.get("party") for item in programmes] == BINDING_ORDER, "programme array order drift")
    require(len({item.get("party") for item in programmes}) == 12, "programme array is not unique 12/12")
    for index, programme in enumerate(programmes, start=1):
        party = programme.get("party")
        registered = register_by_party[party]
        require(programme.get("binding_order") == index, f"{party}: binding index drift")
        require(programme.get("artifact_id") == registered.get("artifact_id"), f"{party}: artifact id mismatch")
        require(programme.get("artifact_sha256") == registered.get("sha256"), f"{party}: artifact hash mismatch")
        require(programme.get("analysis_state") == "PROGRAMME_ANALYSIS_COMPLETE", f"{party}: analysis not complete")
        require(programme.get("programme_analysis_complete") is True, f"{party}: completion flag false")
        require(programme.get("genuine_fach_review_required") == 0, f"{party}: Fach residual remains")
        for field in (
            "unaccounted_pages",
            "unclassified_source_units",
            "unterminated_effect_atoms",
            "source_conflicts",
        ):
            require(programme.get(field) == 0, f"{party}: non-zero {field}")
        require(programme.get("coverage_manifest_pass") is True, f"{party}: coverage gate not PASS")

    summary = matrix.get("summary", {})
    for key, expected in EXPECTED_SUMMARY.items():
        require(summary.get(key) == expected, f"summary {key}: expected {expected!r}, got {summary.get(key)!r}")


def main() -> None:
    for required in (MATRIX_PATH, REGISTER_PATH, NODE_CHECKER):
        require(required.is_file(), f"missing required repository file {required}")

    matrix = json.loads(MATRIX_PATH.read_text(encoding="utf-8"))
    register = json.loads(REGISTER_PATH.read_text(encoding="utf-8"))
    validate_python_boundary(matrix, register)

    process = subprocess.run(
        ["node", str(NODE_CHECKER)],
        cwd=APP_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    if process.returncode != 0:
        details = process.stderr.strip() or process.stdout.strip() or "unknown Node checker failure"
        fail(f"input-bound Combined-v2 reproduction failed: {details}")
    try:
        node_summary = json.loads(process.stdout)
    except json.JSONDecodeError as error:
        fail(f"Node checker did not return JSON: {error}")
    require(node_summary.get("gate") == "PASS_12_OF_12_TERMINAL", "Node checker did not return terminal PASS")

    output = {
        "matrix_id": matrix["matrix_id"],
        "programmes_terminal": matrix["summary"]["programme_analysis_complete"],
        "programmes_open": matrix["summary"]["programme_analysis_open"],
        "terminal_source_objects": matrix["summary"]["terminal_source_objects"],
        "genuine_fach_review_required": matrix["summary"]["remaining_genuine_fach_review_required"],
        "descriptor_sha256": matrix["descriptor_sha256"],
        "input_bound_reproduction": "PASS",
        "gate": "PASS_12_OF_12_TERMINAL",
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (FileNotFoundError, json.JSONDecodeError, KeyError, TypeError) as error:
        fail(str(error))
