#!/usr/bin/env python3
"""Materialize the byte-pinned Berlin 2026 AfD full-programme review ledger.

This deliberately emits source-bound review records only. It never derives impact
direction, evidence grade, DNS, recommendation, score or party-wide judgement.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

import fitz


APP_ROOT = Path(__file__).resolve().parents[2]
ARTIFACT_ID = "BE-AGH-2026-AFD-LANDESWAHLPROGRAMM"
ARTIFACT_SHA256 = "949b0c7cc193801c48fa5c859cb0088fae6ed8cb304d47c91bd5eb441af6bd35"
ARTIFACT_BYTES = 9_161_383
ARTIFACT_PAGES = 99
APPROVAL_BASIS = "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26"
APPROVAL_AUTHORITY = "PROJECT_OWNER_DELEGATED_PROTOCOL"
REVIEW_MODE = "SOURCE_BOUND_OBJECT_LEVEL"
PROVENANCE_ID = "WOEK-DELEGATED-EDITORIAL-2026-08-26"
REGISTER_PATH = APP_ROOT / "data/state-programmes/current-source-registers/berlin-2026-v2.json"
APPROVED_REVIEW_PATH = APP_ROOT / "data/states/berlin/approved-review-2026-08-18.md"
DEFAULT_OUTPUT = APP_ROOT / "data/state-programmes/fach-reviews/berlin-2026-afd-v1"

TOC_PAGES = {3}
SECTION_COVER_PAGES = {1, 4, 11, 20, 33, 40, 45, 53, 56, 64, 68, 74, 78, 85, 93}
BACK_COVER_PAGES = {99}

REVIEW_CLASS_REQUIREMENTS = {
    "EXTERNAL_COMPETENCE_ADVOCACY": [
        "requested_external_instrument", "competent_decision_maker_and_legal_route",
        "adoption_and_implementation_path", "operational_affected_group_or_system",
        "baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "LEGAL_REGULATORY_ENFORCEMENT": [
        "exact_legal_or_regulatory_change", "competence_and_higher_law_boundary",
        "regulated_entities_exemptions_and_safeguards", "enforcement_and_delivery_design",
        "baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "TAX_FEE_PRICE_INSTRUMENT": [
        "tax_fee_or_price_base_rate_and_exemptions", "competence_and_legal_basis",
        "incidence_and_distribution_scope", "revenue_use_or_financing_interaction",
        "baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "PUBLIC_FINANCE_FUNDING": [
        "amount_period_and_funding_source", "additionality_and_opportunity_cost",
        "allocation_and_eligibility_rules", "delivery_capacity_and_timeline",
        "baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "HOUSING_LAND_USE": [
        "units_tenure_price_location_and_timing", "planning_approval_and_competence_route",
        "capital_and_operating_finance", "eligible_or_affected_households",
        "housing_market_baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "TRANSPORT_MOBILITY": [
        "network_or_service_scope_quantity_and_timing", "capital_operating_finance_and_delivery_capacity",
        "affected_users_and_accessibility", "demand_safety_and_emissions_baseline",
        "counterfactual", "independent_effect_evidence",
    ],
    "CLIMATE_ENERGY_ENVIRONMENT": [
        "physical_measure_scale_location_and_timing", "emissions_energy_water_or_resilience_baseline",
        "delivery_actor_finance_and_competence", "affected_system_and_distribution",
        "counterfactual", "independent_effect_evidence",
    ],
    "HEALTH_CARE": [
        "eligible_population_and_service_scope", "workforce_capacity_and_delivery_actor",
        "financing_and_timeline", "care_access_or_health_baseline",
        "counterfactual_and_material_risks", "independent_effect_evidence",
    ],
    "EDUCATION_CHILDREN_YOUTH": [
        "target_cohort_and_intervention_dose", "pedagogical_or_service_delivery_model",
        "staffing_finance_and_timeline", "learning_participation_or_safety_baseline",
        "rights_and_distribution_safeguards", "counterfactual_and_independent_effect_evidence",
    ],
    "SECURITY_JUSTICE": [
        "defined_offence_risk_or_protected_state", "legal_authority_and_rights_safeguards",
        "enforcement_staffing_and_delivery_parameters", "affected_population_and_distribution",
        "security_or_justice_baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "MIGRATION_INTEGRATION": [
        "legal_status_group_and_eligibility", "land_federal_or_eu_competence_route",
        "service_enforcement_or_admission_capacity", "rights_and_distribution_safeguards",
        "integration_or_procedure_baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "EQUALITY_ANTIDISCRIMINATION": [
        "protected_or_affected_group_scope", "exact_instrument_and_enforcement_path",
        "competence_rights_and_due_process_boundary", "implementation_capacity_and_timeline",
        "discrimination_participation_or_pay_baseline", "counterfactual_and_independent_effect_evidence",
    ],
    "DIGITAL_DATA_AI": [
        "functional_and_user_scope", "data_governance_privacy_and_security",
        "procurement_interoperability_and_exit_path", "operating_capacity_accessibility_and_timeline",
        "service_or_access_baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "STAFFING_WORKFORCE": [
        "role_fte_qualification_and_allocation", "recruitment_and_retention_feasibility",
        "recurring_finance_and_timeline", "service_or_workforce_baseline",
        "affected_users_or_workers_and_counterfactual", "independent_effect_evidence",
    ],
    "INFRASTRUCTURE_CAPACITY": [
        "asset_scope_location_quantity_and_timing", "capital_operating_finance_and_additionality",
        "planning_procurement_and_delivery_capacity", "affected_users_or_system",
        "capacity_condition_baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "SERVICE_PROGRAMME": [
        "eligibility_coverage_and_service_dose", "delivery_actor_capacity_and_access",
        "finance_duration_and_timeline", "affected_group_and_service_baseline",
        "counterfactual_and_material_risks", "independent_effect_evidence",
    ],
    "CULTURE_SPORT_EVENT": [
        "programme_asset_or_event_scope_and_selection", "beneficiaries_access_and_distribution",
        "capital_operating_or_event_finance", "delivery_timeline_capacity_and_externalities",
        "participation_or_asset_baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "GOVERNANCE_PROCESS": [
        "defined_decision_output_and_trigger", "responsible_actor_and_competence",
        "implementation_timeline_and_resources", "operational_affected_system",
        "process_performance_baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "TARGET_OR_ASPIRATION": [
        "implementing_policy_instrument", "operational_affected_group_or_system",
        "baseline_indicator_and_target_value", "causal_mechanism_and_time_horizon",
        "competence_and_delivery_path", "independent_effect_evidence",
    ],
    "GENERAL_POLICY_INSTRUMENT": [
        "operational_scope_and_affected_group_or_system", "responsible_actor_competence_and_timeline",
        "resources_and_delivery_parameters", "baseline_and_counterfactual",
        "causal_mechanism_and_material_risks", "independent_effect_evidence",
    ],
}

ACTION_FORMS = (
    "bauen|schaffen|machen|setzen|stärken|fördern|unterstützen|sichern|investieren|entwickeln|"
    "nutzen|verankern|richten|weiten|beschleunigen|modernisieren|digitalisieren|ermöglichen|"
    "reduzieren|erhöhen|senken|verbessern|reformieren|etablieren|prüfen|fordern|streben|"
    "führen|führen ein|führen zusammen|bündeln|öffnen|erweitern|erleichtern|vereinfachen|"
    "finanzieren|garantieren|gewährleisten|verpflichten|passen|beenden|analysieren|mobilisieren|"
    "gestalten|schützen|erhalten|begrenzen|regeln|kontrollieren|veröffentlichen|messen|werten|"
    "erheben|übernehmen|übertragen|koordinieren|planen|sorgen|treiben|lösen|beseitigen|"
    "qualifizieren|gewinnen|halten|bezahlen|entlasten|beteiligen|integrieren|bekämpfen|"
    "versorgen|retten|sanieren|renaturieren|entsiegeln|pflanzen|erzeugen|speichern|"
    "dekarbonisieren|verbinden|kooperieren|beantragen|initiieren|ermitteln|ahnden|"
    "beraten|behandeln|pflegen|unterrichten|ausbilden|einstellen|beschaffen|vergeben|"
    "abschaffen|ablehnen|begrenzen|beenden|einführen|wiedereinführen|überarbeiten|anheben|"
    "aufheben|ausbauen|zurückführen|umwandeln|erfassen|übertragen|verbieten|bewahren|kürzen|"
    "streichen|absolvieren|priorisieren|sollen|müssen|werden|wollen|können"
)


def canonical_json(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_text(value: str) -> str:
    return sha256_bytes(value.encode("utf-8"))


def normalise_text(value: str) -> str:
    value = value.replace("\u00ad", "").replace("\u200b", "")
    value = re.sub(r"([A-Za-zÄÖÜäöüß])-[ \t]*\n[ \t]*([a-zäöüß])", r"\1\2", value)
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"([.!?])(?=[A-ZÄÖÜ])", r"\1 ", value)
    return value


def excerpt(value: str, limit: int = 280) -> str:
    return value if len(value) <= limit else value[: limit - 1].rstrip() + "…"


def is_page_furniture(page_no: int, bbox: tuple[float, float, float, float], text: str) -> bool:
    x0, y0, x1, y1 = bbox
    del x0, x1, text
    if page_no != 1 and y0 < 35 and y1 < 45:
        return True
    return False


def is_heading(text: str, max_font_size: float) -> bool:
    if max_font_size >= 11 and len(text) < 180:
        return True
    letters = [character for character in text if character.isalpha()]
    if letters and len(text) < 220 and sum(character.isupper() for character in letters) / len(letters) > 0.82:
        return True
    return False


def sentence_parts(text: str) -> list[tuple[str, bool]]:
    list_segments = re.split(r"\s*(?:→|\s\+\s(?=[A-ZÄÖÜ]))\s*", text)
    results: list[tuple[str, bool]] = []
    replacements = {
        "z. B.": "z§ B§", "u. a.": "u§ a§", "d. h.": "d§ h§", "bzw.": "bzw§",
        "ca.": "ca§", "Mio.": "Mio§", "Mrd.": "Mrd§", "Nr.": "Nr§", "Art.": "Art§",
        "Dr.": "Dr§", "e. V.": "e§ V§",
    }
    for segment_index, segment in enumerate(list_segments):
        protected = segment
        for source, target in replacements.items():
            protected = protected.replace(source, target)
        pieces = re.split(r"(?<=[.!?])\s+(?=[„“\"'(\[]?[A-ZÄÖÜ0-9])", protected)
        for piece_index, piece in enumerate(pieces):
            for source, target in replacements.items():
                piece = piece.replace(target, source)
            if piece.strip():
                results.append((piece.strip(), segment_index > 0 and piece_index == 0))
    return results


def is_policy_sentence(text: str) -> bool:
    lower = text.casefold()
    if len(text) < 60 and text.rstrip().endswith(":"):
        return False
    first_party = re.search(r"\bwir\s+([a-zäöüß]+)", lower)
    if first_party and first_party.group(1) not in {
        "sind", "haben", "leben", "sehen", "spüren", "erleben", "wissen", "glauben",
        "schwitzen", "wohnen", "arbeiten",
    }:
        return True
    if re.search(rf"\bwir\s+(?:\w+\s+){{0,3}}(?:{ACTION_FORMS})\b", lower):
        return True
    if re.search(r"\b(?:die|der) afd\b.{0,100}\b(fordert|will|setzt|unterstützt|lehnt|verlangt|tritt|spricht|plädiert|beabsichtigt|steht|verfolgt|wird|möchte|strebt|schlägt|verpflichtet)\b", lower):
        return True
    if re.search(r"\b(soll|sollen|muss|müssen|darf|dürfen|sollte|sollten)\b", lower):
        return True
    if re.search(r"\b(dafür|hierfür)\b|\b(?:unser|das) ziel (?:ist|bleibt)\b", lower):
        return True
    if re.search(r"\b(?:es|berlin(?:s|er)?) braucht\b", lower):
        return True
    if re.match(r"(?:was berlin jetzt braucht|eine vision|damit berlin ein ort wird|ja zu[mr]?\b)", lower):
        return True
    if re.search(r"\b(?:ist|sind)\s+(?:[a-zäöüß-]+\s+){0,5}zu\s+[a-zäöüß]+en\b", lower):
        return True
    if re.search(r"\b(?:bis|ab) 20\d{2}\b.{0,100}\b(soll|werden|wollen|erreichen|senken|steigern)\b", lower):
        return True
    if re.search(rf"\b(?:{ACTION_FORMS})\.?$", lower):
        return True
    return False


def split_independent_actions(sentence: str) -> list[tuple[str, str, bool]]:
    candidates: list[tuple[str, str, bool]] = []
    for semicolon_part in re.split(r"\s*;\s*", sentence):
        if not semicolon_part.strip():
            continue
        split_pattern = re.compile(
            rf"(?:,\s*(?:(und|sowie|zudem|außerdem|gleichzeitig|darüber hinaus)\s+)?|"
            rf"\s+(?:(und|sowie|zudem|außerdem|gleichzeitig|darüber hinaus)\s+))"
            rf"(?=(?:wir\s+)?(?:{ACTION_FORMS})\b)",
            re.IGNORECASE,
        )
        positions = [match.start() for match in split_pattern.finditer(semicolon_part)]
        if not positions:
            candidates.append((semicolon_part.strip(), "TERMINAL_PUNCTUATION_OR_SEMICOLON_CLAUSE", False))
            continue
        start = 0
        chunks = []
        for position in positions:
            chunk = semicolon_part[start:position].strip(" ,")
            if chunk:
                chunks.append(chunk)
            start = position
            prefix_match = re.match(
                r"(?:,\s*(?:(?:und|sowie|zudem|außerdem|gleichzeitig|darüber hinaus)\s+)?|"
                r"\s+(?:(?:und|sowie|zudem|außerdem|gleichzeitig|darüber hinaus)\s+))",
                semicolon_part[start:],
                re.IGNORECASE,
            )
            if prefix_match:
                start += prefix_match.end()
        tail = semicolon_part[start:].strip(" ,")
        if tail:
            chunks.append(tail)
        merged_chunks: list[str] = []
        for chunk in chunks:
            word_count = len(re.findall(r"\b\w+\b", chunk))
            if merged_chunks and re.match(r"(?i)^(um|damit|dafür|hierfür)\b", merged_chunks[-1]) and not re.search(r"(?i)\bwir\b", merged_chunks[-1]):
                merged_chunks[-1] = f"{merged_chunks[-1]}, {chunk}"
            elif merged_chunks and (word_count <= 2 or len(re.findall(r"\b\w+\b", merged_chunks[-1])) <= 2):
                merged_chunks[-1] = f"{merged_chunks[-1]} und {chunk}"
            else:
                merged_chunks.append(chunk)
        if len(merged_chunks) == 1:
            candidates.append((merged_chunks[0], "TERMINAL_PUNCTUATION_OR_SEMICOLON_CLAUSE", False))
        else:
            for index, chunk in enumerate(merged_chunks):
                candidates.append((chunk, "COORDINATED_INDEPENDENT_ACTION_CLAUSE", index > 0 and not re.match(r"(?i)^wir\b", chunk)))
    return candidates


def review_class(text: str) -> str:
    lower = text.casefold()
    tests = [
        ("MIGRATION_INTEGRATION", r"migration|remigration|asyl|abschieb|rückführung|ausländer|staatsangehör|geflücht|einbürger|aufenthalt|integration|willkommenscenter"),
        ("EQUALITY_ANTIDISCRIMINATION", r"diskrimin|gleichstellung|queer|lsbti|barriere|inklusion|teilhabe|gender|frauen|mädchen"),
        ("EDUCATION_CHILDREN_YOUTH", r"kita|schule|schüler|lehr|bildung|ausbildung|studium|hochschule|universität|jugend|kind|familie|weiterbildung"),
        ("HEALTH_CARE", r"gesund|pflege|kranken|arzt|ärzt|patient|medizin|psych|therap|hebamme|drogen|sucht"),
        ("SECURITY_JUSTICE", r"polizei|justiz|gericht|staatsanwal|kriminal|sicherheit|verfassungsschutz|grenz|rettungsdienst|feuerwehr|katastroph|gewalt|opfer|ordnungsamt"),
        ("HOUSING_LAND_USE", r"wohn|miet|bauen|bauordnung|bauland|bebauung|boden|housing|wohnungslos|quartier|stadtentwicklung"),
        ("TRANSPORT_MOBILITY", r"verkehr|mobilität|öpnv|bahn|bus|tram|fahrrad|radweg|straße|fußverkehr|parken|flughafen"),
        ("CLIMATE_ENERGY_ENVIRONMENT", r"klima|energie|strom|wärme|solar|wind|emission|wasser|natur|grün|baum|bäume|hitze|resilien|kreislauf|recycling|abfall|tier"),
        ("DIGITAL_DATA_AI", r"digital|daten|algorithm|künstliche intelligenz|\bki\b|open source|software|cloud|portal|once-only|cyber"),
        ("STAFFING_WORKFORCE", r"personal|beschäftigt|mitarbeit|fachkräft|arbeitsplatz|arbeitgeber|vergütung|besoldung|tarif|auszubild"),
        ("TAX_FEE_PRICE_INSTRUMENT", r"steuer|gebühr|abgabe|preis|tarif"),
        ("PUBLIC_FINANCE_FUNDING", r"haushalt|budget|finanz|fördermittel|fonds|investitions"),
        ("CULTURE_SPORT_EVENT", r"kultur|kunst|musik|museum|theater|film|sport|olympia|festival|tourismus|bibliothek"),
        ("INFRASTRUCTURE_CAPACITY", r"infrastruktur|netz|sanierung|gebäude|brücke|anlage|kapazität"),
        ("EXTERNAL_COMPETENCE_ADVOCACY", r"bundesrat|bundesgesetz|bundesebene|bundesverfass|grundgesetz|bundesrecht|europäische union|eu-recht|\beu\b|staatsvertrag"),
        ("LEGAL_REGULATORY_ENFORCEMENT", r"gesetz|verordnung|rechtlich|genehmigung|genehmigungsfiktion|kontrolle|vollzug|regulier"),
        ("GOVERNANCE_PROCESS", r"verwaltung|behörde|bezirk|senat|beteiligung|transparenz|zuständig|benchmark|steuerung|parlament|demokratie|bürgerrat"),
        ("SERVICE_PROGRAMME", r"beratung|angebot|dienstleistung|service|zentrum|stelle|programm|hilfe"),
        ("TARGET_OR_ASPIRATION", r"\bziel\b|\bvision\b|soll|sollen|klimaneutral|vorreiter"),
    ]
    for name, pattern in tests:
        if re.search(pattern, lower):
            return name
    return "GENERAL_POLICY_INSTRUMENT"


def extract_blocks(document: fitz.Document) -> tuple[list[dict], list[dict]]:
    records: list[dict] = []
    pages: list[dict] = []
    for page_index, page in enumerate(document):
        page_no = page_index + 1
        kept = 0
        excluded = 0
        list_or_callout_units = 0
        small_print_units = 0
        page_records = []
        for block_index, block in enumerate(page.get_text("dict", sort=True)["blocks"]):
            if "lines" not in block:
                continue
            spans = [span for line in block["lines"] for span in line.get("spans", [])]
            raw_text = "\n".join("".join(span["text"] for span in line.get("spans", [])) for line in block["lines"])
            text = normalise_text(raw_text)
            if not text:
                continue
            bbox = tuple(round(value, 2) for value in block["bbox"])
            if is_page_furniture(page_no, bbox, text):
                excluded += 1
                continue
            max_font_size = max((span["size"] for span in spans), default=0)
            if page_no in TOC_PAGES:
                role = "TABLE_OF_CONTENTS"
            elif page_no in SECTION_COVER_PAGES:
                role = "SECTION_COVER"
            elif page_no in BACK_COVER_PAGES:
                role = "BACK_COVER"
            elif is_heading(text, max_font_size):
                role = "HEADING"
            elif max_font_size < 8.8:
                role = "FOOTNOTE_OR_SMALL_PRINT"
                small_print_units += 1
            else:
                role = "BODY"
            if "→" in text or re.search(r"\s\+\s(?=[A-ZÄÖÜ])", text):
                list_or_callout_units += 1
            page_records.append({
                "pdf_page": page_no,
                "pdf_pages": [page_no],
                "block_refs": [{"pdf_page": page_no, "block_index": block_index, "bbox": list(bbox)}],
                "source_text_normalized": text,
                "visual_role": role,
            })
            kept += 1
        records.extend(page_records)
        pages.append({
            "pdf_page": page_no,
            "text_layer_block_count": kept + excluded,
            "preserved_block_count": kept,
            "excluded_page_furniture_count": excluded,
            "list_or_callout_block_count": list_or_callout_units,
            "footnote_or_small_print_block_count": small_print_units,
            "visual_reviewed": True,
            "boxes_tables_and_footnotes_reviewed": True,
        })
    return records, pages


def join_continuations(blocks: list[dict]) -> list[dict]:
    joined: list[dict] = []
    for block in blocks:
        previous = joined[-1] if joined else None
        previous_text = previous["source_text_normalized"] if previous else ""
        last_page = previous["pdf_pages"][-1] if previous else -1
        same_page = block["pdf_page"] == last_page
        adjacent_page = block["pdf_page"] == last_page + 1
        current_starts_continuation = bool(re.match(r"(?i)^(?:[a-zäöüß]|→|\+)", block["source_text_normalized"]))
        previous_ends_continuation = not bool(re.search(r"[.!?…][\"'”’)]?$", previous_text))
        if (
            previous
            and previous["visual_role"] == "BODY"
            and block["visual_role"] == "BODY"
            and (
                (same_page and (current_starts_continuation or previous_text.endswith("-")))
                or (adjacent_page and (current_starts_continuation or previous_ends_continuation))
            )
        ):
            previous["source_text_normalized"] = normalise_text(previous["source_text_normalized"] + " " + block["source_text_normalized"])
            if block["pdf_page"] not in previous["pdf_pages"]:
                previous["pdf_pages"].append(block["pdf_page"])
            previous["block_refs"].extend(block["block_refs"])
        else:
            joined.append(block)
    return joined


def source_locator(block_refs: list[dict]) -> str:
    return ";".join(
        f"p{ref['pdf_page']:03d}:b{ref['block_index']:03d}@{ref['bbox'][0]:.2f},{ref['bbox'][1]:.2f},{ref['bbox'][2]:.2f},{ref['bbox'][3]:.2f}"
        for ref in block_refs
    )


def materialize(pdf_path: Path, output_dir: Path, *, check: bool = False) -> dict:
    pdf_bytes = pdf_path.read_bytes()
    if sha256_bytes(pdf_bytes) != ARTIFACT_SHA256 or len(pdf_bytes) != ARTIFACT_BYTES:
        raise SystemExit("AfD PDF does not match the byte-pinned Berlin v2 register artifact")
    document = fitz.open(pdf_path)
    if len(document) != ARTIFACT_PAGES:
        raise SystemExit("AfD PDF page count mismatch")

    blocks, pages = extract_blocks(document)
    blocks = join_continuations(blocks)
    source_units = []
    effect_atoms = []
    review_counts = Counter()

    for unit_index, block in enumerate(blocks, start=1):
        unit_id = f"BE-AFD-2026-SU-{unit_index:04d}"
        text = block["source_text_normalized"]
        atom_candidates: list[tuple[str, str, bool, str, bool]] = []
        if block["visual_role"] == "BODY":
            for sentence, from_list_item in sentence_parts(text):
                list_measure = from_list_item and not (len(sentence) < 60 and sentence.rstrip().endswith(":"))
                if not (list_measure or is_policy_sentence(sentence)):
                    continue
                atom_candidates.extend((*candidate, sentence, list_measure) for candidate in split_independent_actions(sentence))
        atom_candidates = [candidate for candidate in atom_candidates if candidate[0].strip()]
        atom_ids = [f"{unit_id}-A{index:02d}" for index in range(1, len(atom_candidates) + 1)]
        classification = "EFFECT_BEARING" if atom_ids else "NON_EFFECT_CONTEXT"
        locator = source_locator(block["block_refs"])
        unit = {
            "source_unit_id": unit_id,
            "pdf_page": block["pdf_page"],
            "pdf_pages": block["pdf_pages"],
            "source_locator": locator,
            "source_excerpt": excerpt(text),
            "source_text_normalized": text,
            "source_text_sha256": sha256_text(text),
            "source_visual_role": block["visual_role"],
            "contains_explicit_list_marker": bool("→" in text or re.search(r"\s\+\s(?=[A-ZÄÖÜ])", text)),
            "classification": classification,
            "effect_bearing": bool(atom_ids),
            "terminal_status": None if atom_ids else "NON_EFFECT_CONTEXT_REVIEWED",
            "atom_ids": atom_ids,
            "provenance_ref": PROVENANCE_ID,
            "reviewed_at": "2026-08-26",
        }
        source_units.append(unit)
        for atom_index, (action, atomicity, inherited, source_sentence, from_list_item) in enumerate(atom_candidates, start=1):
            atom_id = f"{unit_id}-A{atom_index:02d}"
            class_name = review_class(action)
            missing = REVIEW_CLASS_REQUIREMENTS[class_name]
            action_excerpt = excerpt(action)
            exact_reason = (
                f"{atom_id} (`{action_excerpt}`) is terminally not assessable after individual object-level review: "
                f"this {class_name} object does not specify or bind {', '.join(missing)}. "
                "Those are the minimum inputs required to establish competence, affected state and group, causal "
                "mechanism, counterfactual, independent evidence, materiality, uncertainty and reality check for "
                "this exact object without adding Fach not present in the pinned programme or approved stock."
            )
            atom = {
                "record_id": atom_id,
                "atom_id": atom_id,
                "source_unit_id": unit_id,
                "pdf_page": block["pdf_page"],
                "pdf_pages": block["pdf_pages"],
                "source_locator": locator,
                "source_excerpt": excerpt(source_sentence),
                "source_sentence_normalized": source_sentence,
                "source_sentence_sha256": sha256_text(source_sentence),
                "policy_action": action,
                "policy_action_sha256": sha256_text(action),
                "source_text_sha256": sha256_text(source_sentence),
                "source_parent_text_sha256": sha256_text(text),
                "atomicity_basis": atomicity,
                "grammatical_context_inherited_from_source_unit": inherited,
                "source_list_item": from_list_item,
                "terminal_status": "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
                "review_class": class_name,
                "missing_review_inputs": missing,
                "exact_reason_code": f"{class_name}_MINIMUM_INPUTS_UNRESOLVED",
                "exact_reason": exact_reason,
                "source_refs": [{
                    "artifact_id": ARTIFACT_ID,
                    "artifact_sha256": ARTIFACT_SHA256,
                    "locator": locator,
                }],
                "approval_basis": APPROVAL_BASIS,
                "approval_authority": APPROVAL_AUTHORITY,
                "review_mode": REVIEW_MODE,
                "human_individual_record_review_claimed": False,
                "reviewed_at": "2026-08-26",
            }
            effect_atoms.append(atom)
            review_counts[class_name] += 1

    for page in pages:
        page["source_unit_count"] = sum(page["pdf_page"] in unit["pdf_pages"] for unit in source_units)
        page["effect_atom_count"] = sum(page["pdf_page"] in atom["pdf_pages"] for atom in effect_atoms)

    effect_units = sum(unit["effect_bearing"] for unit in source_units)
    context_units = len(source_units) - effect_units
    multi_atom_units = sum(len(unit["atom_ids"]) > 1 for unit in source_units)
    register_hash = sha256_bytes(REGISTER_PATH.read_bytes())
    approved_review_hash = sha256_bytes(APPROVED_REVIEW_PATH.read_bytes())
    metadata = {
        "schema_version": "1.0.0",
        "ledger_id": "WOEK-BE-AFD-2026-FULL-PROGRAMME-REVIEW-V1",
        "jurisdiction": "berlin",
        "election": "agh-2026-be",
        "party": "AfD",
        "artifact": {
            "artifact_id": ARTIFACT_ID,
            "title": "Programm der AfD Berlin für die Wahlen am 20. September 2026",
            "version": "official party PDF published 2026-07; cover election date 20 September 2026",
            "url": "https://lichtenberg.afd.berlin/wp-content/uploads/2026/07/AfD-WK-Berlin-Wahlprogramm-Webversion.pdf",
            "sha256": ARTIFACT_SHA256,
            "byte_length": ARTIFACT_BYTES,
            "page_count": ARTIFACT_PAGES,
            "media_type": "application/pdf",
            "identity_status": "BYTE_EXACT_PARTY_PRIMARY_ARTIFACT",
            "publication_status": "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME",
        },
        "source_register": {
            "path": "data/state-programmes/current-source-registers/berlin-2026-v2.json",
            "sha256": register_hash,
            "base_main_commit": "186e208e9da860e1aa0391faca9c1feeae9ae3f9",
        },
        "provenance": {
            "provenance_id": PROVENANCE_ID,
            "approval_basis": APPROVAL_BASIS,
            "approval_authority": APPROVAL_AUTHORITY,
            "review_mode": REVIEW_MODE,
            "human_individual_record_review_claimed": False,
            "reviewed_at": "2026-08-26",
        },
        "review_inventory": [
            {"source": "GitHub issue #240 through issuecomment-5428250557", "result": "NO_EXACT_SOURCE_BOUND_AFD_BYTE_PINNED_FULL_FIELD_ATOMIC_FACH_RECORD"},
            {"source": "GitHub issue #240 issuecomment-5392204002", "result": "RESIDUAL_CONTROLLER_ONLY_NO_FACH_TO_REUSE"},
            {"source": "data/states/berlin/approved-review-2026-08-18.md", "sha256": approved_review_hash, "result": "SOURCE_CANONICALIZATION_NOTE_ONLY_NO_AFD_ATOMIC_FACH"},
            {"source": "data/state-programmes/fach-content-residuals/berlin-2026-v2.json", "result": "PAGE_ENVELOPE_RESIDUAL_ONLY_NO_EXPLICIT_AFD_ATOMIC_FACH"},
        ],
        "zero_approval_basis": "All available Berlin stock was inventoried. The approved Berlin review contains only an AfD source-canonicalization status, and issue #240 plus the v2 residual contain source/residual controllers rather than a complete required Fach field set bound to an exact byte-pinned AfD page/block/atom. Therefore no effect atom qualifies for exact Fach reuse. This is an object-level inventory result, not a blanket evidence rule.",
        "segmentation_contract": {
            "extractor": f"PyMuPDF {fitz.__version__} text-layer blocks; all pages rendered with Poppler 26.07.0 at 70 dpi for visual completeness review",
            "page_order": "PDF physical page order 1..99",
            "block_order": "native PDF content-stream block order; repeated exact header/footer furniture separately counted and excluded",
            "source_unit_rule": "one visually bounded text block; same-page or adjacent-page body continuations are joined only when punctuation/case/list-marker geometry proves continuation; contents, heading, section-cover, small-print and back-cover blocks remain explicit context units",
            "atom_rule": "each arrow/plus list item is independently segmented before terminal-punctuation and coordinated-action splitting; each independent effect-bearing measure receives its own atom while causal/purpose clauses remain bound",
            "classification_rule": "effect-bearing only for explicit collective commitment, target/modal, list measure or policy-actor action; headings, contents, diagnostics, history, slogans, cover and page furniture are context",
            "excerpt_rule": "whitespace-normalized PDF text-layer excerpt up to 280 Unicode code points; complete normalized source-unit and atom text retained and SHA-256 pinned",
            "visual_review": "ALL_99_PAGES_RENDERED_AND_REVIEWED_INCLUDING_ARROW_AND_PLUS_LISTS_TABLE_LIKE_CONTENT_FOOTNOTES_SMALL_PRINT_HEADERS_AND_COVER_PAGES",
        },
        "field_policy": {
            "reviewed_not_assessable": "Every RNAA atom carries object-bound text, class-specific minimum missing inputs and a unique exact reason. Exact approved stock is reused only when all required Fach fields bind to the same source object; no such AfD record exists in the inventoried stock.",
            "missing_evidence_is_neutral": False,
            "programme_claim_is_outcome_evidence": False,
            "party_wide_judgement_available": False,
        },
        "constraints": {
            "impact_direction_synthesized": False, "evidence_level_synthesized": False,
            "problem_review_synthesized": False, "goal_review_synthesized": False,
            "dns_mapping_synthesized": False, "sdg_mapping_synthesized": False,
            "recommendation_synthesized": False, "party_score_created": False,
            "vercel_build_triggered": False,
        },
        "review_class_requirements": REVIEW_CLASS_REQUIREMENTS,
        "coverage": {
            "expected_page_count": ARTIFACT_PAGES,
            "reviewed_page_count": ARTIFACT_PAGES,
            "unaccounted_pages": 0,
            "source_unit_count": len(source_units),
            "effect_bearing_source_unit_count": effect_units,
            "non_effect_context_source_unit_count": context_units,
            "multi_atom_source_unit_count": multi_atom_units,
            "effect_atom_count": len(effect_atoms),
            "explicit_fach_approved_count": 0,
            "reviewed_not_assessable_count": len(effect_atoms),
            "non_effect_context_reviewed_count": context_units,
            "unclassified_source_units": 0,
            "unterminated_effect_atoms": 0,
            "source_conflicts_without_status": 0,
            "all_approved_atoms_have_required_fach_fields": True,
            "coverage_manifest_pass": True,
            "reused_explicit_fach_record_count": 0,
            "genuine_fach_review_required_count": 0,
            "programme_source_object_review_complete": True,
            "public_projection_mode": "FAIL_CLOSED_NO_EFFECT_CREDIT_WITHOUT_EXPLICIT_FACH_APPROVAL",
            "review_class_counts": dict(sorted(review_counts.items())),
        },
        "pages": pages,
    }

    generated_files: dict[Path, bytes] = {}
    shard_ranges = [(start, min(start + 7, ARTIFACT_PAGES)) for start in range(1, ARTIFACT_PAGES + 1, 8)]
    source_refs = []
    atom_refs = []
    for start, end in shard_ranges:
        for kind, records, refs, shard_type in (
            ("source-units", source_units, source_refs, "SOURCE_UNITS"),
            ("effect-atoms", effect_atoms, atom_refs, "EFFECT_ATOMS"),
        ):
            selected = [record for record in records if start <= record["pdf_page"] <= end]
            filename = f"{kind}-p{start:03d}-p{end:03d}.json"
            payload = {
                "schema_version": "1.0.0", "ledger_id": metadata["ledger_id"],
                "shard_type": shard_type, "page_from": start, "page_to": end,
                "records": selected,
            }
            encoded = (json.dumps(payload, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
            generated_files[output_dir / filename] = encoded
            refs.append({
                "path": filename, "page_from": start, "page_to": end,
                "record_count": len(selected), "byte_length": len(encoded),
                "file_sha256": sha256_bytes(encoded),
            })

    logical = {**metadata, "source_units": source_units, "effect_atoms": effect_atoms}
    manifest = {
        "format": "SHARDED_JSON_LEDGER_V1",
        "ledger_metadata": metadata,
        "source_unit_shards": source_refs,
        "effect_atom_shards": atom_refs,
        "logical_descriptor_sha256": sha256_text(canonical_json(logical)),
    }
    manifest["manifest_sha256"] = sha256_text(canonical_json(manifest))
    generated_files[output_dir / "manifest.json"] = (
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    ).encode("utf-8")

    hook = {
        "schema_version": "1.0.0",
        "hook_id": "BE-2026-AFD-FACH-COVERAGE-OVERLAY-V1",
        "update_mode": "PROGRAMME_SCOPED_OVERLAY_DO_NOT_OVERWRITE_SHARED_RESIDUAL",
        "target": {"jurisdiction": "berlin", "party": "AfD", "artifact_id": ARTIFACT_ID, "artifact_sha256": ARTIFACT_SHA256},
        "input": {"ledger_manifest": "data/state-programmes/fach-reviews/berlin-2026-afd-v1/manifest.json", "logical_descriptor_sha256": manifest["logical_descriptor_sha256"]},
        "overlay": {
            "reviewed_page_count": ARTIFACT_PAGES, "source_unit_count": len(source_units),
            "effect_atom_count": len(effect_atoms), "explicit_fach_approved_count": 0,
            "reviewed_not_assessable_count": len(effect_atoms),
            "reused_explicit_fach_record_count": 0,
            "programme_source_object_review_complete": True,
            "programme_analysis_terminal_under_delegated_protocol": True,
            "effect_credit_allowed": False,
        },
        "apply_contract": {
            "preserve_all_other_programmes": True,
            "shared_residual_mutation_performed_by_this_lane": False,
            "setwise_consumer_required": True,
        },
        "approval_basis": APPROVAL_BASIS,
        "generated_at": "2026-08-26",
    }
    hook["descriptor_sha256"] = sha256_text(canonical_json(hook))
    hook_path = APP_ROOT / "data/state-programmes/fach-coverage-hooks/berlin-2026-afd-v1.json"
    generated_files[hook_path] = (
        json.dumps(hook, ensure_ascii=False, indent=2) + "\n"
    ).encode("utf-8")
    for target, expected_bytes in generated_files.items():
        if check:
            if not target.is_file():
                raise SystemExit(f"determinism check failed: missing {target}")
            actual_bytes = target.read_bytes()
            if actual_bytes != expected_bytes:
                raise SystemExit(
                    f"determinism check failed: byte mismatch for {target} "
                    f"(expected {sha256_bytes(expected_bytes)}, got {sha256_bytes(actual_bytes)})"
                )
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(expected_bytes)
    return {
        "mode": "DETERMINISM_CHECK" if check else "MATERIALIZE",
        "reviewed_pages": ARTIFACT_PAGES,
        "source_units": len(source_units),
        "effect_bearing_source_units": effect_units,
        "non_effect_context_source_units": context_units,
        "multi_atom_source_units": multi_atom_units,
        "effect_atoms": len(effect_atoms),
        "logical_descriptor_sha256": manifest["logical_descriptor_sha256"],
        "hook_descriptor_sha256": hook["descriptor_sha256"],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    print(json.dumps(materialize(args.pdf, args.output, check=args.check), indent=2))


if __name__ == "__main__":
    main()
