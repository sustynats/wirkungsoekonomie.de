#!/usr/bin/env python3
"""Independent, read-only top-level validator for the combined MV terminal matrix."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any


APP_ROOT = Path(__file__).resolve().parents[2]
MATRIX_PATH = APP_ROOT / "data/state-programmes/fach-content-residuals/mecklenburg-vorpommern-2026-v2.json"
REGISTER_PATH = APP_ROOT / "data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json"
APP_PREFIX = "woek-parlament-app/"
APPROVAL_BASIS = "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26"
APPROVAL_AUTHORITY = "PROJECT_OWNER_DELEGATED_PROTOCOL"
REVIEW_MODE = "SOURCE_BOUND_OBJECT_LEVEL"
BINDINGS = [
    ("SPD", "SPD", "spd"),
    ("AfD", "AfD", "afd"),
    ("CDU", "CDU", "cdu"),
    ("Die Linke", "Die Linke", "linke"),
    ("Bündnis 90/Die Grünen", "BÜNDNIS 90/DIE GRÜNEN", "gruene"),
    ("FDP", "FDP", "fdp"),
    ("FREIE WÄHLER", "FREIE WÄHLER", "freie-waehler"),
    ("PIRATEN", "PIRATEN", "piraten"),
    ("Bündnis C", "Bündnis C", "buendnis-c"),
    ("BSW", "BSW", "bsw"),
    ("Partei des Fortschritts", "PdF", "pdf"),
    ("Volt", "Volt", "volt"),
]
BLOCKER_ORDER = [
    "Tierschutzpartei",
    "Die PARTEI",
    "ÖDP",
    "Handwerker Partei Deutschland",
    "KPD",
    "Team Freiheit",
    "WIR LEBEN DEMOKRATIE",
]
FORBIDDEN_FACH_FIELDS = {
    "impact_direction", "evidence_level", "materiality", "uncertainty",
    "problem_review", "goal_review", "dns_mapping", "sdg_mapping",
    "sdg_plus_mapping", "recommendation", "party_score", "party_judgement",
}


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def canonical_descriptor(payload: dict[str, Any], field: str) -> str:
    unhashed = dict(payload)
    unhashed.pop(field, None)
    return sha256_bytes(canonical(unhashed))


def resolve_repo_path(value: str) -> Path:
    assert value.startswith(APP_PREFIX), f"path is not repository-bound: {value}"
    return APP_ROOT / value.removeprefix(APP_PREFIX)


def reject_forbidden_fields(value: Any, pointer: str = "$") -> None:
    if isinstance(value, list):
        for index, item in enumerate(value):
            reject_forbidden_fields(item, f"{pointer}[{index}]")
        return
    if not isinstance(value, dict):
        return
    for key, item in value.items():
        assert key not in FORBIDDEN_FACH_FIELDS, f"{pointer}.{key}: forbidden Fach field"
        reject_forbidden_fields(item, f"{pointer}.{key}")


def load_shards(
    ledger_dir: Path,
    manifest: dict[str, Any],
    refs: list[dict[str, Any]],
    expected_type: str,
) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    covered_pages: set[int] = set()
    for ref in refs:
        shard_path = ledger_dir / ref["path"]
        raw = shard_path.read_bytes()
        assert len(raw) == ref["byte_length"], f"{ref['path']}: byte length mismatch"
        assert sha256_bytes(raw) == ref["file_sha256"], f"{ref['path']}: byte hash mismatch"
        shard = json.loads(raw)
        assert shard["schema_version"] == "1.0.0"
        assert shard["ledger_id"] == manifest["ledger_metadata"]["ledger_id"]
        assert shard["shard_type"] == expected_type
        assert shard["page_from"] == ref["page_from"]
        assert shard["page_to"] == ref["page_to"]
        assert len(shard["records"]) == ref["record_count"]
        for page in range(ref["page_from"], ref["page_to"] + 1):
            assert page not in covered_pages, f"{expected_type}: overlapping page {page}"
            covered_pages.add(page)
        assert all(ref["page_from"] <= row["pdf_page"] <= ref["page_to"] for row in shard["records"])
        records.extend(shard["records"])
    expected_pages = manifest["ledger_metadata"]["coverage"]["expected_page_count"]
    assert covered_pages == set(range(1, expected_pages + 1)), f"{expected_type}: page coverage gap"
    return records


def validate_programme(
    programme: dict[str, Any],
    display_party: str,
    register_party_name: str,
    slug: str,
    register_party: dict[str, Any],
) -> dict[str, int]:
    assert programme["party"] == display_party
    assert programme["source_register_party"] == register_party_name
    assert programme["programme_slug"] == slug
    assert register_party["final_election_programme_verified"] is True

    evidence = programme["coverage_evidence"]
    manifest_path = resolve_repo_path(evidence["ledger_manifest_path"])
    hook_path = resolve_repo_path(evidence["coverage_hook_path"])
    manifest_raw = manifest_path.read_bytes()
    hook_raw = hook_path.read_bytes()
    assert sha256_bytes(manifest_raw) == evidence["ledger_manifest_file_sha256"]
    assert sha256_bytes(hook_raw) == evidence["coverage_hook_file_sha256"]
    manifest = json.loads(manifest_raw)
    hook = json.loads(hook_raw)
    assert canonical_descriptor(manifest, "manifest_sha256") == manifest["manifest_sha256"]
    assert manifest["manifest_sha256"] == evidence["ledger_manifest_sha256"]
    assert canonical_descriptor(hook, "descriptor_sha256") == hook["descriptor_sha256"]
    assert hook["descriptor_sha256"] == evidence["coverage_hook_descriptor_sha256"]
    assert sha256_bytes(canonical(manifest["source_unit_shards"])) == evidence["source_unit_shard_set_sha256"]
    assert sha256_bytes(canonical(manifest["effect_atom_shards"])) == evidence["effect_atom_shard_set_sha256"]
    assert len(manifest["source_unit_shards"]) == evidence["source_unit_shard_count"]
    assert len(manifest["effect_atom_shards"]) == evidence["effect_atom_shard_count"]

    ledger_dir = manifest_path.parent
    source_units = load_shards(ledger_dir, manifest, manifest["source_unit_shards"], "SOURCE_UNITS")
    effect_atoms = load_shards(ledger_dir, manifest, manifest["effect_atom_shards"], "EFFECT_ATOMS")
    metadata = manifest["ledger_metadata"]
    coverage = metadata["coverage"]
    logical = {**metadata, "source_units": source_units, "effect_atoms": effect_atoms}
    assert sha256_bytes(canonical(logical)) == manifest["logical_descriptor_sha256"]
    assert manifest["logical_descriptor_sha256"] == evidence["logical_descriptor_sha256"]

    assert metadata["party"] == register_party_name
    assert metadata["jurisdiction"] == "mecklenburg-vorpommern"
    assert metadata["election"] == "ltw-2026-mv"
    assert metadata["provenance"]["approval_basis"] == APPROVAL_BASIS
    assert metadata["provenance"]["approval_authority"] == APPROVAL_AUTHORITY
    assert metadata["provenance"]["review_mode"] == REVIEW_MODE
    assert metadata["provenance"]["human_individual_record_review_claimed"] is False
    assert programme["artifact"]["artifact_id"] == metadata["artifact"]["artifact_id"] == hook["target"]["artifact_id"]
    assert programme["artifact"]["artifact_sha256"] == metadata["artifact"]["sha256"] == hook["target"]["artifact_sha256"]
    assert programme["artifact"]["page_count"] == metadata["artifact"]["page_count"]
    assert programme["artifact"]["source_status"] == register_party["source_status"]

    unit_ids = [row["source_unit_id"] for row in source_units]
    atom_ids = [row["atom_id"] for row in effect_atoms]
    assert len(set(unit_ids)) == len(unit_ids)
    assert len(set(atom_ids)) == len(atom_ids)
    atom_by_id = {row["atom_id"]: row for row in effect_atoms}
    effect_units = 0
    context_units = 0
    multi_units = 0
    for unit in source_units:
        if unit["effect_bearing"]:
            effect_units += 1
            assert unit["classification"] == "EFFECT_BEARING"
            assert unit["atom_ids"]
            if len(unit["atom_ids"]) > 1:
                multi_units += 1
            assert all(atom_by_id[atom_id]["source_unit_id"] == unit["source_unit_id"] for atom_id in unit["atom_ids"])
        else:
            context_units += 1
            assert unit["classification"] == "NON_EFFECT_CONTEXT"
            assert unit["terminal_status"] == "NON_EFFECT_CONTEXT_REVIEWED"
            assert unit["atom_ids"] == []
    for atom in effect_atoms:
        assert atom["terminal_status"] == "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON"
        assert atom["approval_basis"] == APPROVAL_BASIS
        assert atom["approval_authority"] == APPROVAL_AUTHORITY
        assert atom["review_mode"] == REVIEW_MODE
        assert atom["human_individual_record_review_claimed"] is False
        reject_forbidden_fields(atom)

    counts = programme["counts"]
    calculated = {
        "reviewed_pages": coverage["reviewed_page_count"],
        "unaccounted_pages": coverage["unaccounted_pages"],
        "source_units": len(source_units),
        "effect_bearing_source_units": effect_units,
        "non_effect_context_source_units": context_units,
        "multi_atom_source_units": multi_units,
        "effect_atoms": len(effect_atoms),
        "terminal_source_objects": context_units + len(effect_atoms),
        "explicit_fach_approved": coverage["explicit_fach_approved_count"],
        "reviewed_not_assessable_with_exact_reason": coverage["reviewed_not_assessable_count"],
        "non_effect_context_reviewed": coverage["non_effect_context_reviewed_count"],
        "genuine_fach_review_required": coverage["genuine_fach_review_required_count"],
        "unclassified_source_units": coverage["unclassified_source_units"],
        "unterminated_effect_atoms": coverage["unterminated_effect_atoms"],
        "source_conflicts_without_status": coverage["source_conflicts_without_status"],
    }
    assert counts == calculated
    assert counts["reviewed_pages"] == metadata["artifact"]["page_count"]
    assert counts["explicit_fach_approved"] == 0
    assert counts["reviewed_not_assessable_with_exact_reason"] == len(effect_atoms)
    assert counts["genuine_fach_review_required"] == 0
    assert programme["programme_analysis_complete"] is True
    assert programme["programme_source_object_review_complete"] is True
    assert programme["effect_credit_allowed"] is False
    return calculated


def blocker_register_state(register_party: dict[str, Any]) -> dict[str, Any]:
    return {
        "artifact_class": register_party["artifact_class"],
        "source_status": register_party["source_status"],
        "assessment_maturity": register_party["assessment_maturity"],
        "final_election_programme_verified": register_party["final_election_programme_verified"],
        "source_available_for_election_corpus": register_party["source_available_for_election_corpus"],
        "canonicalization_pending": register_party["canonicalization_pending"],
        "public_status_label": register_party["public_status_label"],
        "public_status_detail": register_party["public_status_detail"],
        "source_urls": register_party["source_urls"],
        "canonical_artifact": register_party["canonical_artifact"],
    }


def validate() -> dict[str, Any]:
    matrix = read_json(MATRIX_PATH)
    register_raw = REGISTER_PATH.read_bytes()
    register = json.loads(register_raw)
    reject_forbidden_fields(matrix)
    assert canonical_descriptor(matrix, "descriptor_sha256") == matrix["descriptor_sha256"]
    assert canonical_descriptor(register, "descriptor_sha256") == register["descriptor_sha256"]
    assert matrix["current_source_register"]["file_sha256"] == sha256_bytes(register_raw)
    assert matrix["current_source_register"]["descriptor_sha256"] == register["descriptor_sha256"]
    assert matrix["status"] == "VERIFIED_FINAL_PROGRAMME_SUBCORPUS_TERMINAL_FULL_CORPUS_FAIL_CLOSED"
    assert matrix["binding_order"] == [row[0] for row in BINDINGS]
    assert matrix["source_maturity_blocker_order"] == BLOCKER_ORDER
    assert matrix["release_policy"]["no_new_vercel_build"] is True
    assert matrix["release_policy"]["parliament_release_approval"] == "NOT_GRANTED"
    assert all(value is False for value in matrix["constraints"].values())

    register_by_party = {row["party"]: row for row in register["parties"]}
    assert len(register_by_party) == 19
    assert register["coverage"]["final_election_programme_verified_count"] == 12
    assert register["coverage"]["final_election_programme_not_verified_count"] == 7
    assert register["coverage"]["full_final_election_programme_corpus_available"] is False

    totals: dict[str, int] = {}
    assert len(matrix["programmes"]) == len(BINDINGS) == 12
    for index, (programme, (display, register_name, slug)) in enumerate(zip(matrix["programmes"], BINDINGS), start=1):
        assert programme["binding_order"] == index
        counts = validate_programme(programme, display, register_name, slug, register_by_party[register_name])
        for key, value in counts.items():
            totals[key] = totals.get(key, 0) + value

    assert len(matrix["source_maturity_blockers"]) == 7
    for index, (blocker, party) in enumerate(zip(matrix["source_maturity_blockers"], BLOCKER_ORDER), start=1):
        register_party = register_by_party[party]
        assert blocker["blocker_order"] == index
        assert blocker["party"] == party
        assert blocker["residual_class"] == "SOURCE_MATURITY_BLOCKER"
        assert blocker["blocking_gate"] == "FINAL_ELECTION_PROGRAMME_NOT_VERIFIED"
        assert blocker["exact_register_state"] == blocker_register_state(register_party)
        assert register_party["final_election_programme_verified"] is False
        assert blocker["fach_review_started"] is False
        assert blocker["fach_semantics_inferred"] is False

    expected_totals = {
        "reviewed_pages": 896,
        "unaccounted_pages": 0,
        "source_units": 8712,
        "effect_bearing_source_units": 4811,
        "non_effect_context_source_units": 3901,
        "multi_atom_source_units": 1434,
        "effect_atoms": 7494,
        "terminal_source_objects": 11395,
        "explicit_fach_approved": 0,
        "reviewed_not_assessable_with_exact_reason": 7494,
        "non_effect_context_reviewed": 3901,
        "genuine_fach_review_required": 0,
        "unclassified_source_units": 0,
        "unterminated_effect_atoms": 0,
        "source_conflicts_without_status": 0,
    }
    assert totals == expected_totals
    assert all(matrix["summary"][key] == value for key, value in totals.items())
    assert matrix["summary"]["verified_subcorpus_gate"] == "PASS_12_OF_12_TERMINAL"
    assert matrix["summary"]["full_field_gate"] == "FAIL_CLOSED_7_SOURCE_MATURITY_BLOCKERS"
    assert matrix["summary"]["silent_omissions"] == 0
    return {
        "status": "PASS",
        "validator": "PYTHON_TOP_LEVEL_INDEPENDENT_INPUT_BINDING",
        "verified_programmes_terminal": 12,
        "source_maturity_blockers": 7,
        "reviewed_pages": totals["reviewed_pages"],
        "source_units": totals["source_units"],
        "effect_atoms": totals["effect_atoms"],
        "terminal_source_objects": totals["terminal_source_objects"],
        "descriptor_sha256": matrix["descriptor_sha256"],
        "verified_subcorpus_gate": matrix["summary"]["verified_subcorpus_gate"],
        "full_field_gate": matrix["summary"]["full_field_gate"],
    }


if __name__ == "__main__":
    print(json.dumps(validate(), ensure_ascii=False, indent=2))
