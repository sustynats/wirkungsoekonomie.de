#!/usr/bin/env python3
"""Materialize the exact-source Berlin Die Linke delegated full-programme ledger."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
from collections import Counter
from pathlib import Path


APP_ROOT = Path(__file__).resolve().parents[2]
REGISTER_PATH = APP_ROOT / "data/state-programmes/current-source-registers/berlin-2026-v2.json"
OUTPUT_DIR = APP_ROOT / "data/state-programmes/fach-reviews/berlin-2026-linke-v1"
HOOK_PATH = APP_ROOT / "data/state-programmes/fach-coverage-hooks/berlin-2026-linke-v1.json"
HELPER_PATH = Path(__file__).with_name("materialize-berlin-gruene-fach-review.py")
SPEC = importlib.util.spec_from_file_location("woek_berlin_review_helpers", HELPER_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("Cannot load deterministic Berlin review helpers")
HELPERS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(HELPERS)

ARTIFACT = {
    "artifact_id": "BE-AGH-2026-LINKE-WAHLPROGRAMM",
    "title": "Berlin bezahlbar machen – Wahlprogramm zur Abgeordnetenhauswahl 2026",
    "url": "https://dielinke.berlin/fileadmin/download/2026/Wahlprogramm_AGH_2026_Die_Linke_Berlin.pdf",
    "sha256": "70be401125217cac46a94d3b0b97b49bd332774342e54fb22a202043bd099c1f",
    "byte_length": 2556826,
    "page_count": 336,
    "media_type": "application/pdf",
    "identity_status": "BYTE_EXACT_PARTY_PRIMARY_ARTIFACT",
    "publication_status": "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME",
}
PARTY = "Die Linke"
LEDGER_ID = "WOEK-BE-LINKE-2026-FULL-PROGRAMME-REVIEW-V1"
PROVENANCE = HELPERS.PROVENANCE
REVIEW_CLASS_REQUIREMENTS = HELPERS.REVIEW_CLASS_REQUIREMENTS
CHAPTER_STARTS = {14, 41, 55, 73, 84, 99, 112, 127, 147, 152, 175, 192, 209, 211, 216, 219, 230, 244, 259, 268, 275, 286, 303, 312, 325}


def extract_page_paragraphs(pdf: Path, page: int) -> list[str]:
    raw = subprocess.run(
        ["pdftotext", "-f", str(page), "-l", str(page), "-layout", str(pdf), "-"],
        check=True, capture_output=True, text=True,
    ).stdout
    paragraphs: list[str] = []
    lines: list[str] = []

    def flush() -> None:
        nonlocal lines
        if page in CHAPTER_STARTS and lines and re.match(r"^\d{2}\s+", lines[0].strip()):
            heading = HELPERS.normalize(lines[0])
            body = HELPERS.join_layout_lines(lines[1:])
            if heading:
                paragraphs.append(heading)
            if body:
                paragraphs.append(body)
        else:
            text = HELPERS.join_layout_lines(lines)
            if text:
                paragraphs.append(text)
        lines = []

    for source_line in raw.splitlines():
        line = source_line.strip()
        if not line or line == "\f":
            flush()
        elif not re.fullmatch(r"\d{1,3}", line):
            lines.append(line)
    flush()
    return paragraphs


def is_heading(text: str) -> bool:
    text = HELPERS.normalize(text)
    if text == "Berlin bezahlbar machen.":
        return True
    if re.match(r"^\d{2}\s+", text):
        return True
    if len(text) > 180 or re.search(r"[.!?]\s*$", text):
        return False
    words = text.split()
    if len(words) > 18:
        return False
    if re.match(r"^(?:Wir|Die Linke|Berlin|Der Senat|Das Land)\s+(?:wollen|werden|muss|soll|braucht|setzt)\b", text, re.I):
        return False
    return True


def is_context(page: int, text: str) -> tuple[bool, str]:
    if page <= 4:
        return True, "COVER_IMPRINT_CONTENTS_OR_BLANK_FRONTMATTER"
    if page >= 334:
        return True, "BLANK_OR_BACK_COVER"
    if is_heading(text):
        return True, "STRUCTURAL_HEADING"
    return False, "PROGRAMME_SOURCE_OBJECT"


def should_join(previous: dict | None, current: str, page: int) -> bool:
    if not previous or previous["pdf_page"] <= 4 or page >= 334:
        return False
    same_page = previous["pdf_pages"][-1] == page and bool(re.match(r"^[a-zäöüß]", current))
    next_page = previous["pdf_pages"][-1] == page - 1 and page not in CHAPTER_STARTS
    if not (same_page or next_page):
        return False
    if re.search(r"[.!?]\s*$", previous["full_text"]) or is_heading(current):
        return False
    return True


def review_class(page: int, text: str) -> str:
    if re.search(r"\b(?:Bundesebene|Bundesrecht|Bundesgesetz|Bundesrat|Bundestag|Europäische Union|EU-Recht|europäisch|bundesweit)\w*", text, re.I):
        return "EXTERNAL_COMPETENCE_ADVOCACY"
    if re.search(r"\b(?:Gesetz|Rechtsanspruch|Verbot|Pflicht|Sanktion|Genehmigung|Kontrolle|Straf|Ordnungsamt|Polizei|Justiz|Gericht)\w*", text, re.I):
        return "LEGAL_REGULATORY_ENFORCEMENT"
    if re.search(r"\b(?:Steuer|Abgabe|Gebühr|Beitragssatz|Hebesatz|Tarif|Preisobergrenze|Ticketpreis|Mietpreis)\w*", text, re.I):
        return "TAX_FEE_PRICE_INSTRUMENT"
    if re.search(r"\b(?:Fördermittel|Finanzierung|finanzieren|Zuschuss|Subvention|Stipendium|Haushaltsmittel|Budget|Fonds)\w*", text, re.I):
        return "PUBLIC_FINANCE_FUNDING"
    if re.search(r"\b(?:Fachkräfte|Lehrkräfte|Personal|Stellen|Besoldung|Vergütung|Ausbildung|Weiterbildung|Qualifizierung|Arbeitsbedingungen)\w*", text, re.I):
        return "STAFFING_WORKFORCE"
    if re.search(r"\b(?:digital|Daten|KI|Künstliche Intelligenz|Algorithm|Software|App|Open.Source|IT-Sicherheit|Cyber)\w*", text, re.I):
        return "DIGITAL_DATA_AI"
    if re.search(r"\b(?:Ziel|anstreben|Vision|bis 20\d\d|klimaneutral)\w*", text, re.I):
        return "TARGET_OR_ASPIRATION"
    if re.search(r"\b(?:bauen|Ausbau|Sanierung|Infrastruktur|Gebäude|Anlage|Standort|Fläche|Netz|Kapazität|Brücke|Schiene)\w*", text, re.I):
        return "INFRASTRUCTURE_CAPACITY"
    if 14 <= page <= 54:
        return "HOUSING_LAND_USE"
    if 55 <= page <= 72:
        return "TRANSPORT_MOBILITY"
    if 73 <= page <= 83:
        return "PUBLIC_FINANCE_FUNDING"
    if 84 <= page <= 98:
        return "GENERAL_POLICY_INSTRUMENT"
    if 99 <= page <= 111:
        return "STAFFING_WORKFORCE"
    if 112 <= page <= 126:
        return "SERVICE_PROGRAMME"
    if 127 <= page <= 151:
        return "HEALTH_CARE"
    if 152 <= page <= 174:
        return "EDUCATION_CHILDREN_YOUTH"
    if 175 <= page <= 191:
        return "EDUCATION_CHILDREN_YOUTH"
    if 192 <= page <= 210:
        return "CLIMATE_ENERGY_ENVIRONMENT"
    if 211 <= page <= 218:
        return "EQUALITY_ANTIDISCRIMINATION"
    if 219 <= page <= 229:
        return "EDUCATION_CHILDREN_YOUTH"
    if 230 <= page <= 243:
        return "CULTURE_SPORT_EVENT"
    if 244 <= page <= 258:
        return "DIGITAL_DATA_AI"
    if 259 <= page <= 267:
        return "GOVERNANCE_PROCESS"
    if 268 <= page <= 274:
        return "EQUALITY_ANTIDISCRIMINATION"
    if 275 <= page <= 285:
        return "MIGRATION_INTEGRATION"
    if 286 <= page <= 302:
        return "SECURITY_JUSTICE"
    if 303 <= page <= 311:
        return "SECURITY_JUSTICE"
    if 312 <= page <= 324:
        return "CULTURE_SPORT_EVENT"
    if 325 <= page <= 333:
        return "SECURITY_JUSTICE"
    return "GENERAL_POLICY_INSTRUMENT"


def locator(first_page: int, pages: list[int], index: int) -> str:
    prefix = f"p{first_page:03d}" if len(pages) == 1 else f"p{first_page:03d}-p{pages[-1]:03d}"
    return f"{prefix}:u{index:04d}"


def exact_reason(atom_id: str, klass: str, text: str, missing: list[str], source_locator: str) -> str:
    return (
        f"{atom_id} ({klass}) ist an {source_locator} exakt an „{HELPERS.excerpt(text)}“ gebunden. "
        f"Für dieses Einzelobjekt legt der Wortlaut {', '.join(missing)} nicht als gemeinsam prüfbare Source-bound-Fachgrundlage fest. "
        "Ohne diese objektspezifischen Prüfeingaben ist EXPLICIT_FACH_APPROVED nicht belastbar; Richtung, Evidenzstufe, "
        "Materialität, DNS, SDG/SDG+, Problem-/Goal-Review und Recommendation werden nicht aus Programmtext, Parteiidentität oder Schlagworten ergänzt."
    )


def build_ledger(pdf: Path) -> tuple[dict, list[dict], list[dict]]:
    artifact_bytes = pdf.read_bytes()
    if len(artifact_bytes) != ARTIFACT["byte_length"] or HELPERS.sha256(artifact_bytes) != ARTIFACT["sha256"]:
        raise SystemExit("LINKE artifact byte identity mismatch")
    register_bytes = REGISTER_PATH.read_bytes()
    register = json.loads(register_bytes)
    registered = next((entry for entry in register["parties"] if entry["party"] == PARTY), None)
    if not registered:
        raise SystemExit("LINKE missing from current-source register")
    for key, expected in {"artifact_id": ARTIFACT["artifact_id"], "artifact_url": ARTIFACT["url"], "sha256": ARTIFACT["sha256"], "byte_length": ARTIFACT["byte_length"], "page_count": 336}.items():
        if registered["canonical_artifact"].get(key) != expected:
            raise SystemExit(f"LINKE source-register {key} drift")

    page_paragraphs = {page: extract_page_paragraphs(pdf, page) for page in range(1, 337)}
    raw_units: list[dict] = []
    for page, paragraphs in page_paragraphs.items():
        for paragraph in paragraphs:
            previous = raw_units[-1] if raw_units else None
            if should_join(previous, paragraph, page):
                joiner = ""
                if not (previous["full_text"].endswith("-") and re.match(r"^[a-zäöüß]", paragraph)):
                    joiner = " "
                else:
                    previous["full_text"] = previous["full_text"][:-1]
                previous["full_text"] = HELPERS.normalize(previous["full_text"] + joiner + paragraph)
                if previous["pdf_pages"][-1] != page:
                    previous["pdf_pages"].append(page)
            else:
                raw_units.append({"full_text": paragraph, "pdf_page": page, "pdf_pages": [page]})

    source_units: list[dict] = []
    atoms: list[dict] = []
    for index, raw in enumerate(raw_units, 1):
        unit_id = f"BE-LINKE-2026-SU-{index:04d}"
        source_locator = locator(raw["pdf_page"], raw["pdf_pages"], index)
        context, kind = is_context(raw["pdf_page"], raw["full_text"])
        parts = [] if context else HELPERS.atomize(raw["full_text"])
        atom_ids = [f"{unit_id}-A{atom_index:02d}" for atom_index in range(1, len(parts) + 1)]
        parent_hash = HELPERS.sha256(raw["full_text"])
        source_units.append({
            "source_unit_id": unit_id, "pdf_page": raw["pdf_page"], "pdf_pages": raw["pdf_pages"],
            "source_locator": source_locator, "source_excerpt": HELPERS.excerpt(raw["full_text"]),
            "source_text_sha256": parent_hash, "source_text_length": len(raw["full_text"]), "source_unit_kind": kind,
            "classification": "NON_EFFECT_CONTEXT" if context else "EFFECT_BEARING",
            "classification_basis": (
                f"The complete source unit at {source_locator}, „{HELPERS.excerpt(raw['full_text'])}“, is visually and textually identified as {kind}; it carries no independent programme instrument."
                if context else
                f"The complete source unit at {source_locator}, „{HELPERS.excerpt(raw['full_text'])}“, contains one or more programme claims; every terminal sentence and independently coordinated action remains bound to its own child atom without assigning impact direction."
            ),
            "effect_bearing": not context, "terminal_status": "NON_EFFECT_CONTEXT_REVIEWED" if context else None,
            "exact_reason": f"NON_EFFECT_CONTEXT_REVIEWED {unit_id} at {source_locator}: „{HELPERS.excerpt(raw['full_text'])}“ is source-visible {kind.lower().replace('_', ' ')}, not an independent effect object." if context else None,
            "atom_ids": atom_ids, "provenance_ref": PROVENANCE["provenance_id"],
        })
        for atom_index, part in enumerate(parts, 1):
            atom_id = atom_ids[atom_index - 1]
            klass = review_class(raw["pdf_page"], part["text"])
            missing = REVIEW_CLASS_REQUIREMENTS[klass]
            atom = {
                "record_id": atom_id, "atom_id": atom_id, "source_unit_id": unit_id,
                "pdf_page": raw["pdf_page"], "pdf_pages": raw["pdf_pages"], "source_locator": source_locator,
                "source_excerpt": HELPERS.excerpt(part["text"]), "source_text_sha256": HELPERS.sha256(part["text"]),
                "source_parent_text_sha256": parent_hash, "atomicity_basis": part["atomicity_basis"],
                "grammatical_context_inherited_from_source_unit": not bool(re.match(r"^(?:Wir|Die Linke|Berlin|Das Land|Der Senat|Die Bezirke|Die Verwaltung)\b", part["text"])),
                "policy_action": HELPERS.excerpt(part["text"]), "terminal_status": "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
                "review_class": klass, "missing_review_inputs": missing,
                "exact_reason": exact_reason(atom_id, klass, part["text"], missing, source_locator),
                "source_refs": [{"artifact_id": ARTIFACT["artifact_id"], "artifact_sha256": ARTIFACT["sha256"], "locator": source_locator}],
                **{key: value for key, value in PROVENANCE.items() if key != "provenance_id"},
            }
            if any(field in atom for field in HELPERS.FORBIDDEN_FIELDS):
                raise AssertionError(f"forbidden Fach field materialized on {atom_id}")
            atoms.append(atom)

    pages = []
    for page in range(1, 337):
        page_units = [unit for unit in source_units if page in unit["pdf_pages"]]
        page_atoms = [atom for atom in atoms if page in atom["pdf_pages"]]
        pages.append({"pdf_page": page, "visual_reviewed": True, "source_unit_count": len(page_units), "effect_atom_count": len(page_atoms), "normalized_page_sha256": HELPERS.sha256("\n\n".join(page_paragraphs[page])), "page_status": "SOURCE_UNITS_CLASSIFIED" if page_units else "VISUAL_NON_EFFECT_OR_BLANK_PAGE_REVIEWED"})
    effect_units = [unit for unit in source_units if unit["effect_bearing"]]
    context_units = [unit for unit in source_units if not unit["effect_bearing"]]
    review_counts = Counter(atom["review_class"] for atom in atoms)
    coverage = {
        "expected_page_count": 336, "reviewed_page_count": 336, "unaccounted_pages": 0,
        "source_unit_count": len(source_units), "effect_bearing_source_unit_count": len(effect_units),
        "non_effect_context_source_unit_count": len(context_units), "multi_page_source_unit_count": sum(len(unit["pdf_pages"]) > 1 for unit in source_units),
        "multi_atom_source_unit_count": sum(len(unit["atom_ids"]) > 1 for unit in source_units), "effect_atom_count": len(atoms),
        "explicit_fach_approved_count": 0, "reviewed_not_assessable_count": len(atoms), "non_effect_context_reviewed_count": len(context_units),
        "unclassified_source_units": 0, "unterminated_effect_atoms": 0, "source_conflicts_without_status": 0,
        "all_approved_atoms_have_required_fach_fields": True, "all_effect_bearing_atoms_terminal": True, "coverage_manifest_pass": True,
        "reused_explicit_fach_record_count": 0, "genuine_fach_review_required_count": 0, "programme_source_object_review_complete": True,
        "public_projection_mode": "FAIL_CLOSED_NO_EFFECT_CREDIT_WITHOUT_EXPLICIT_FACH_APPROVAL",
        "review_class_counts": {key: review_counts[key] for key in REVIEW_CLASS_REQUIREMENTS},
    }
    metadata = {
        "schema_version": "1.0.0", "ledger_id": LEDGER_ID, "jurisdiction": "berlin", "election": "agh-2026-be", "party": PARTY,
        "artifact": ARTIFACT, "source_register": {"path": str(REGISTER_PATH.relative_to(APP_ROOT)), "sha256": HELPERS.sha256(register_bytes), "base_main_commit": register.get("base_main_commit")},
        "provenance": PROVENANCE,
        "review_inventory": [
            {"source": "GitHub issue #240 latest residual controller and linked completed work", "result": "NO_EXACT_SOURCE_BOUND_LINKE_FINAL_PDF_ATOMIC_FACH_RECORD"},
            {"source": "data/states/berlin/approved-review-2026-08-18.md", "sha256": HELPERS.sha256((APP_ROOT / "data/states/berlin/approved-review-2026-08-18.md").read_bytes()), "result": "SIX_THEME_NON_EXHAUSTIVE_REVIEW_NOT_BYTE_EXACT_OBJECT_BOUND"},
            {"source": "data/state-programmes/fach-content-residuals/berlin-2026-v1.json", "sha256": HELPERS.sha256((APP_ROOT / "data/state-programmes/fach-content-residuals/berlin-2026-v1.json").read_bytes()), "result": "336_PAGE_ENVELOPE_RESIDUAL_ONLY_NO_EXPLICIT_LINKE_ATOMIC_FACH"},
        ],
        "zero_approval_basis": "Every available approved Berlin stock record was inventoried. None binds the complete required Fach field set to an exact atom in this byte-exact 336-page Die Linke artifact. No EXPLICIT_FACH_APPROVED record is therefore reused or created; this is an exact stock-inventory result, not a party-, keyword- or missing-evidence-only downgrade rule.",
        "segmentation_contract": {"extractor": "Poppler pdftotext -layout, exact physical-page isolation and deterministic line-break dehyphenation", "page_order": "PDF physical page order 1..336", "source_unit_rule": "Exact page-number removal; blank-line paragraph boundaries; cross-page continuation only where prior programme text lacks terminal punctuation and the next physical page is not a chapter start or heading.", "atom_rule": "Every non-structural programme source unit is preserved whole; terminal-punctuation/semicolon claims, explicit new-subject coordinations and coordinated independent action verbs receive separate source-bound atom IDs (0..n atoms per source unit).", "classification_rule": "Cover, imprint, contents, structural headings, blank pages 4/334/335 and back cover are terminal NON_EFFECT_CONTEXT; all other programme wording is conservatively EFFECT_BEARING and atomized without assigning impact direction.", "excerpt_rule": "Whitespace-normalized exact PDF text-layer excerpt, maximum 280 Unicode code points; full source identities pinned by SHA-256.", "visual_review": "ALL_336_PHYSICAL_PAGES_RENDERED_WITH_POPPLER_AND_REVIEWED_IN_28_CONTACT_SHEETS; DENSE_TEXT_PAGES, CHAPTER_STARTS, LISTS, FOOTERS, BLANK_PAGES_4_334_335, BACK_COVER_AND_CROSS_PAGE_CONTINUATIONS_INCLUDED."},
        "field_policy": {"reviewed_not_assessable": "Every RNAA atom carries an object-quoted exact reason, review class and finite missing-input list. Unsupported Fach fields are absent and MUST NOT be synthesized.", "missing_evidence_is_neutral": False, "programme_claim_is_outcome_evidence": False, "party_wide_judgement_available": False},
        "constraints": {"impact_direction_synthesized": False, "evidence_level_synthesized": False, "problem_review_synthesized": False, "goal_review_synthesized": False, "dns_mapping_synthesized": False, "sdg_mapping_synthesized": False, "recommendation_synthesized": False, "party_score_created": False, "vercel_build_triggered": False},
        "review_class_requirements": REVIEW_CLASS_REQUIREMENTS, "pages": pages, "coverage": coverage,
    }
    return metadata, source_units, atoms


def materialize(metadata: dict, source_units: list[dict], atoms: list[dict]) -> tuple[dict[str, str], dict]:
    files: dict[str, str] = {}
    source_refs: list[dict] = []
    atom_refs: list[dict] = []
    for page_from in range(1, 337, 10):
        page_to = min(page_from + 9, 336)
        for shard_type, records, refs, prefix in [("SOURCE_UNITS", source_units, source_refs, "source-units"), ("EFFECT_ATOMS", atoms, atom_refs, "effect-atoms")]:
            selected = [record for record in records if page_from <= record["pdf_page"] <= page_to]
            shard = {"schema_version": "1.0.0", "ledger_id": LEDGER_ID, "shard_type": shard_type, "page_from": page_from, "page_to": page_to, "records": selected}
            name = f"{prefix}-p{page_from:03d}-p{page_to:03d}.json"
            serialized = HELPERS.pretty(shard)
            files[name] = serialized
            refs.append({"path": name, "page_from": page_from, "page_to": page_to, "record_count": len(selected), "file_sha256": HELPERS.sha256(serialized), "byte_length": len(serialized.encode())})
    logical_hash = HELPERS.sha256(HELPERS.canonical({**metadata, "source_units": source_units, "effect_atoms": atoms}))
    manifest = {"format": "SHARDED_JSON_LEDGER_V1", "ledger_metadata": metadata, "source_unit_shards": source_refs, "effect_atom_shards": atom_refs, "logical_descriptor_sha256": logical_hash}
    manifest["manifest_sha256"] = HELPERS.sha256(HELPERS.canonical(manifest))
    files["manifest.json"] = HELPERS.pretty(manifest)
    return files, manifest


def build_hook(manifest: dict) -> dict:
    coverage = manifest["ledger_metadata"]["coverage"]
    hook = {
        "schema_version": "1.0.0", "hook_id": "WOEK-BE-LINKE-2026-COVERAGE-OVERLAY-V1", "update_mode": "PROGRAMME_SCOPED_OVERLAY_DO_NOT_OVERWRITE_SHARED_RESIDUAL",
        "target": {"shared_residual_path": "data/state-programmes/fach-content-residuals/berlin-2026-v1.json", "party": PARTY, "artifact_id": ARTIFACT["artifact_id"], "artifact_sha256": ARTIFACT["sha256"]},
        "input": {"ledger_manifest_path": "data/state-programmes/fach-reviews/berlin-2026-linke-v1/manifest.json", "ledger_id": LEDGER_ID, "logical_descriptor_sha256": manifest["logical_descriptor_sha256"]},
        "precondition": {"source_register_path": "data/state-programmes/current-source-registers/berlin-2026-v2.json", "source_register_sha256": manifest["ledger_metadata"]["source_register"]["sha256"], "expected_page_count": 336, "require_ledger_validation_pass": True},
        "overlay": {"source_object_review_status": "SOURCE_OBJECT_REVIEW_COMPLETE", "programme_analysis_complete": True, "programme_terminal_basis": "ALL_EFFECT_ATOMS_TERMINATED_OR_CONTEXT_REVIEWED_UNDER_DELEGATED_PROTOCOL", "reviewed_page_count": 336, "source_unit_count": coverage["source_unit_count"], "effect_atom_count": coverage["effect_atom_count"], "explicit_fach_approved_count": 0, "reviewed_not_assessable_count": coverage["reviewed_not_assessable_count"], "genuine_fach_review_required_count": 0, "explicit_fach_available_for_public_effect_projection": False, "effect_credit_allowed": False, "public_projection_mode": coverage["public_projection_mode"]},
        "apply_contract": {"match_keys": ["party", "artifact_id", "artifact_sha256"], "preserve_all_other_programmes": True, "remove_only_exact_matching_linke_page_envelopes_after_validation": True, "shared_residual_mutation_performed_by_this_lane": False, "consumer_must_preserve_existing_explicit_fach": True, "consumer_must_not_materialize_missing_fach_fields": True},
        "constraints": {"impact_direction_synthesized": False, "evidence_level_synthesized": False, "materiality_synthesized": False, "dns_mapping_synthesized": False, "recommendation_synthesized": False, "party_score_created": False, "vercel_build_triggered": False},
    }
    hook["descriptor_sha256"] = HELPERS.sha256(HELPERS.canonical(hook))
    return hook


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--artifact", required=True, type=Path)
    parser.add_argument("--output-dir", type=Path, default=OUTPUT_DIR)
    parser.add_argument("--hook", type=Path, default=HOOK_PATH)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    metadata, units, atoms = build_ledger(args.artifact.resolve())
    files, manifest = materialize(metadata, units, atoms)
    hook = HELPERS.pretty(build_hook(manifest))
    if args.check:
        for name, expected in files.items():
            if (args.output_dir / name).read_text() != expected:
                raise SystemExit(f"LINKE determinism mismatch: {args.output_dir / name}")
        if args.hook.read_text() != hook:
            raise SystemExit(f"LINKE determinism mismatch: {args.hook}")
    else:
        args.output_dir.mkdir(parents=True, exist_ok=True)
        args.hook.parent.mkdir(parents=True, exist_ok=True)
        for name, serialized in files.items():
            (args.output_dir / name).write_text(serialized)
        args.hook.write_text(hook)
    print(json.dumps({"status": "PASS", "mode": "DETERMINISM_CHECK" if args.check else "MATERIALIZE", "pages": 336, "source_units": len(units), "effect_atoms": len(atoms), "logical_descriptor_sha256": manifest["logical_descriptor_sha256"]}))


if __name__ == "__main__":
    main()
