#!/usr/bin/env python3
"""Fail-closed controller for the six Sachsen-Anhalt programme manifests."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

TERMINAL_VALIDATORS = {
    "BSW": "tools/validate_bsw_final_union_r22.py",
    "AfD": "tools/validate_afd_final_union_a43.py",
    "LINKE": "tools/validate_linke_final_union_c26.py",
    "SPD": "tools/validate_spd_final_active_leaf_c01i.py",
}

CDU_MANIFEST = (
    ROOT
    / "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/"
    "ltw-2026-st-cdu-final-versioned-manifest-v1.json"
)
GRUENE_MANIFEST_GLOB = "content/audits/sachsen-anhalt/gruene-final-union-manifest-*.json"


def run_validator(relative_path: str) -> tuple[bool, dict | None, str | None]:
    result = subprocess.run(
        ["python3", relative_path],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        return False, None, result.stderr.strip() or result.stdout.strip()
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError as error:
        return False, None, f"NON_JSON_VALIDATOR_OUTPUT:{error}"
    return payload.get("status") == "PASS", payload, None


def positive_int(value: object) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value > 0


def main() -> int:
    parties: dict[str, dict] = {}
    blockers: list[str] = []

    for party, validator in TERMINAL_VALIDATORS.items():
        passed, payload, error = run_validator(validator)
        parties[party] = {
            "status": "PASS" if passed else "BLOCKED",
            "validator": validator,
            "result": payload,
        }
        if not passed:
            blockers.append(f"{party}_TERMINAL_VALIDATOR_FAILED:{error}")

    if not CDU_MANIFEST.exists():
        parties["CDU"] = {"status": "BLOCKED", "reason": "FINAL_MANIFEST_MISSING"}
        blockers.append("CDU_FINAL_MANIFEST_MISSING")
    else:
        cdu = json.loads(CDU_MANIFEST.read_text(encoding="utf-8"))
        cdu_pass = (
            cdu.get("denominator_status") == "FROZEN_EXPLICIT_ROLE_UNION"
            and cdu.get("st_cdu_terminal_complete") is True
            and positive_int(cdu.get("authoritative_source_unit_count"))
            and positive_int(cdu.get("authoritative_effect_mechanism_count"))
        )
        parties["CDU"] = {
            "status": "PASS" if cdu_pass else "BLOCKED",
            "manifest": str(CDU_MANIFEST.relative_to(ROOT)),
            "authoritative_source_unit_count": cdu.get("authoritative_source_unit_count"),
            "authoritative_effect_mechanism_count": cdu.get("authoritative_effect_mechanism_count"),
            "denominator_status": cdu.get("denominator_status"),
        }
        if not cdu_pass:
            blockers.append("CDU_FINAL_MANIFEST_NOT_TERMINAL")

    gruene_manifests = sorted(ROOT.glob(GRUENE_MANIFEST_GLOB))
    if len(gruene_manifests) != 1:
        parties["GRUENE"] = {
            "status": "BLOCKED",
            "reason": f"EXPECTED_ONE_FINAL_MANIFEST_FOUND_{len(gruene_manifests)}",
        }
        blockers.append(f"GRUENE_FINAL_MANIFEST_CARDINALITY:{len(gruene_manifests)}")
    else:
        gruene_path = gruene_manifests[0]
        gruene = json.loads(gruene_path.read_text(encoding="utf-8"))
        gap_counts = gruene.get("gap_counts") or {}
        gruene_pass = (
            gruene.get("denominator_status") == "FROZEN_EXPLICIT_ROLE_UNION"
            and gruene.get("st_gruene_terminal_complete") is True
            and positive_int(gruene.get("authoritative_source_unit_count"))
            and positive_int(gruene.get("authoritative_effect_mechanism_count"))
            and all(value == 0 for value in gap_counts.values())
        )
        parties["GRUENE"] = {
            "status": "PASS" if gruene_pass else "BLOCKED",
            "manifest": str(gruene_path.relative_to(ROOT)),
            "authoritative_source_unit_count": gruene.get("authoritative_source_unit_count"),
            "authoritative_effect_mechanism_count": gruene.get("authoritative_effect_mechanism_count"),
            "denominator_status": gruene.get("denominator_status"),
            "gap_counts": gap_counts,
        }
        if not gruene_pass:
            blockers.append("GRUENE_FINAL_MANIFEST_NOT_TERMINAL")

    terminal_count = sum(1 for party in parties.values() if party["status"] == "PASS")
    report = {
        "gate": "SAXONY_ANHALT_SIX_PARTY_TERMINAL_RELEASE",
        "status": "PASS" if not blockers and terminal_count == 6 else "BLOCKED",
        "terminal_parties": terminal_count,
        "required_parties": 6,
        "code_generated_fach": False,
        "public_counts_mutated": False,
        "parties": parties,
        "blockers": blockers,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
