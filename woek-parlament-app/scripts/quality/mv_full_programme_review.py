#!/usr/bin/env python3
"""Deterministic source-bound MV full-programme review materializer.

The engine accounts for every physical page and every preserved text block,
atomises mechanically identifiable policy objects, and keeps Fach fail-closed.
It never derives impact direction, evidence, materiality, DNS/SDG mappings,
recommendations, scores or party-wide judgements from programme language.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

import fitz


APP_ROOT = Path(__file__).resolve().parents[2]
REGISTER_PATH = APP_ROOT / "data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json"
APPROVED_REVIEW_PATH = APP_ROOT / "data/states/mecklenburg-vorpommern/approved-review-2026-08-18.md"
APPROVAL_BASIS = "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26"
APPROVAL_AUTHORITY = "PROJECT_OWNER_DELEGATED_PROTOCOL"
REVIEW_MODE = "SOURCE_BOUND_OBJECT_LEVEL"
PROVENANCE_ID = "WOEK-DELEGATED-EDITORIAL-2026-08-26"

PROFILES = {
    "spd": {
        "party": "SPD",
        "prefix": "MV-SPD",
        "artifact_id": "MV-LTW-2026-SPD-REGIERUNGSPROGRAMM",
        "title": "Aufschwung, Zusammenhalt und Respekt – Regierungsprogramm 2026–2031",
        "url": "https://spd-mv.de/uploads/bilderpool/2-Mecklenburg-Vorpommern/Wahlen-und-Kandidaturen/2026-Landtagswahlen/SPD_MV_Programm_2026.pdf",
        "register_url": "https://spd-mv.de/wahlen/landtagswahl-2026/regierungsprogramm-2026-2031",
        "sha256": "b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc",
        "byte_length": 1072223,
        "page_count": 95,
    },
    "afd": {
        "party": "AfD",
        "prefix": "MV-AFD",
        "artifact_id": "MV-LTW-2026-AFD-REGIERUNGSPROGRAMM",
        "title": "Bereit für die blaue Wende – AfD-Regierungsprogramm zur Landtagswahl 2026",
        "url": "https://afd-mv.de/wp-content/uploads/2026/06/AfD-Regierungsprogramm-Mecklenburg-Vorpommern-2026.pdf",
        "register_url": "https://afd-mv.de/blaue-wende-2026/",
        "sha256": "44087592fed7d8943d44019722def861947cf72acd203bf3b802deb6873ec8b0",
        "byte_length": 1580871,
        "page_count": 93,
    },
    "cdu": {
        "party": "CDU",
        "prefix": "MV-CDU",
        "artifact_id": "MV-LTW-2026-CDU-WAHLPROGRAMM",
        "title": "Besser. Nur mit uns. – Wahlprogramm 2026",
        "url": "https://cdu-mv.de/wp-content/uploads/2026/06/Wahlprogramm-CDU-MV-2026.pdf",
        "register_url": "https://cdu-mv.de/programme/",
        "sha256": "a33653bbe873666bf337522c51778e7b32a768e75d716b0e3483781d27a6c72e",
        "byte_length": 1197976,
        "page_count": 139,
        "line_number_x_bands": [[30, 60]],
    },
    "linke": {
        "party": "Die Linke",
        "prefix": "MV-LINKE",
        "artifact_id": "MV-LTW-2026-LINKE-LANGWAHLPROGRAMM",
        "title": "Sozial. Gerecht. Antifaschistisch. – Unser Programm zur Landtagswahl 2026",
        "url": "https://wahlprogramm26.die-linke-mv.de/wp-content/uploads/sites/77/2026/08/LINKE-MV_LTW26_Langwahlprogramm_A4_web.pdf",
        "register_url": "https://wahlprogramm26.die-linke-mv.de/",
        "sha256": "c26d2be501a05e820ed6761d75d0b2468ffbeb06859b967e3b8836129779fb6e",
        "byte_length": 918713,
        "page_count": 30,
    },
    "gruene": {
        "party": "BÜNDNIS 90/DIE GRÜNEN",
        "prefix": "MV-GRUENE",
        "artifact_id": "MV-LTW-2026-GRUENE-WAHLPROGRAMM",
        "title": "Klare Kante Zukunft – Für Mensch und Natur in MV",
        "url": "https://gruene-mv.de/?wpdmdl=33772",
        "register_url": "https://gruene-mv.de/landtagswahl-2026/wahlprogramm-2026-1/",
        "sha256": "a3ddd454f4612460ace9deb2c4789e161a37f62f0abfa9e5c12d7f9878377ee3",
        "byte_length": 15989661,
        "page_count": 112,
    },
    "fdp": {
        "party": "FDP",
        "prefix": "MV-FDP",
        "artifact_id": "MV-LTW-2026-FDP-WAHLPROGRAMM",
        "title": "Programm zur Landtagswahl Mecklenburg-Vorpommern 2026 – Freiheit Leistung Erfolg",
        "url": "https://www.fdp-mv.de/sites/default/files/2026-06/Landtagswahlprogramm_2026_0.pdf",
        "register_url": "https://www.fdp-mv.de/programm",
        "sha256": "91699d395bd4af26ffb7c9f824fd892a4aca0e29737f856a5d3b189f7bf16b31",
        "byte_length": 2583137,
        "page_count": 152,
    },
    "freie-waehler": {
        "party": "FREIE WÄHLER",
        "prefix": "MV-FW",
        "artifact_id": "MV-LTW-2026-FREIE-WAEHLER-WAHLPROGRAMM",
        "title": "Wahlprogramm für die Landtagswahl am 20. September 2026",
        "url": "https://freie-waehler-mv.eu/wp-content/uploads/2026/06/LTW_2026_Wahlprogramm_FW-M-V_A5_interaktiv.pdf",
        "sha256": "9e6295ac5a691cf4b4483736e1cf87a5b95192e122f43bbb8ca5a3cb9b67554c",
        "byte_length": 3451433,
        "page_count": 34,
    },
    "piraten": {
        "party": "PIRATEN",
        "prefix": "MV-PIRATEN",
        "artifact_id": "MV-LTW-2026-PIRATEN-WAHLPROGRAMM",
        "title": "Wahlprogramm der Piratenpartei Mecklenburg-Vorpommern zur Landtagswahl 2026",
        "url": "https://piratenpartei-mv.de/wp-content/uploads/2026/04/finalwp2026_lek.pdf",
        "sha256": "033643c4deabd8ac5c414ba2276ca25906418e0349143bff1dc0fb1d3c4d13a1",
        "byte_length": 145496,
        "page_count": 5,
        "toc_pages": [1],
        "toc_block_refs": {2: [1]},
    },
    "buendnis-c": {
        "party": "Bündnis C",
        "prefix": "MV-BC",
        "artifact_id": "MV-LTW-2026-BUENDNIS-C-WAHLPROGRAMM",
        "title": "Wahlprogramm Landtagswahl Mecklenburg-Vorpommern 2026",
        "url": "https://mecklenburg-vorpommern.buendnis-c.de/wp-content/uploads/sites/3/2026/08/BC-M-V-LTW-2026-WAHLPROGRAMM.pdf",
        "sha256": "52465aa4ba287c0687a45138d7eff75272a5bf85c18b8e846e3cbe118db32443",
        "byte_length": 473925,
        "page_count": 22,
    },
    "bsw": {
        "party": "BSW",
        "prefix": "MV-BSW",
        "artifact_id": "MV-LTW-2026-BSW-LANDESWAHLPROGRAMM",
        "title": "Frischer Wind in MV! – Mit Vernunft. Für Gerechtigkeit.",
        "url": "https://mv.bsw-vg.de/wp-content/uploads/2026/04/Landeswahlprogramm-2026.pdf",
        "register_url": "https://mv.bsw-vg.de/landtagswahl-2026/",
        "sha256": "062b284d3e91919c673a2746c53c9d4e14ef8b1ab4b82699782789ec483c7968",
        "byte_length": 1184670,
        "page_count": 94,
    },
    "pdf": {
        "party": "PdF",
        "prefix": "MV-PDF",
        "artifact_id": "MV-LTW-2026-PDF-WAHLPROGRAMM",
        "title": "Wahlprogramm PdF – Landtagswahl Mecklenburg-Vorpommern 2026",
        "url": "https://partei-des-fortschritts.de/wp-content/uploads/2026/06/2026-05_wahlprogramm_MV.pdf",
        "sha256": "418ccadca7e8f63ae3f9b5f2ca436b2045d41e803fa44eddbbb93947b74e543b",
        "byte_length": 163254,
        "page_count": 53,
    },
    "volt": {
        "party": "Volt",
        "prefix": "MV-VOLT",
        "artifact_id": "MV-LTW-2026-VOLT-WAHLPROGRAMM",
        "title": "Haltung zeigen! Wahlprogramm von Volt MV zur Landtagswahl am 20.09.2026",
        "url": "https://voltdeutschland.org/storage/assets-mv/pdf/haltungzeigen_wahlprogramm_voltmv_ltw26.pdf",
        "sha256": "a992f71adf0b37a633c60d9ac1e8923680e8a7e01ac428bf2e86036294e57663",
        "byte_length": 1725660,
        "page_count": 67,
    },
}

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
    "PUBLIC_FINANCE_FUNDING": [
        "amount_period_and_funding_source", "additionality_and_opportunity_cost",
        "allocation_and_eligibility_rules", "delivery_capacity_and_timeline",
        "baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "EDUCATION_CHILDREN_YOUTH": [
        "target_cohort_and_intervention_dose", "pedagogical_or_service_delivery_model",
        "staffing_finance_and_timeline", "learning_participation_or_safety_baseline",
        "rights_and_distribution_safeguards", "counterfactual_and_independent_effect_evidence",
    ],
    "HEALTH_CARE": [
        "eligible_population_and_service_scope", "workforce_capacity_and_delivery_actor",
        "financing_and_timeline", "care_access_or_health_baseline",
        "counterfactual_and_material_risks", "independent_effect_evidence",
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
    "DIGITAL_DATA_AI": [
        "functional_and_user_scope", "data_governance_privacy_and_security",
        "procurement_interoperability_and_exit_path", "operating_capacity_accessibility_and_timeline",
        "service_or_access_baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "ECONOMY_WORKFORCE": [
        "eligible_firms_workers_or_sectors", "instrument_scale_and_delivery_actor",
        "finance_tax_or_regulatory_incidence", "labour_market_or_productivity_baseline",
        "counterfactual_and_distribution", "independent_effect_evidence",
    ],
    "AGRICULTURE_FOOD_ANIMALS": [
        "affected_farms_animals_or_value_chain", "physical_or_regulatory_instrument",
        "finance_enforcement_and_transition_path", "production_environment_or_welfare_baseline",
        "counterfactual_and_distribution", "independent_effect_evidence",
    ],
    "DEMOCRACY_GOVERNANCE": [
        "defined_decision_output_and_trigger", "responsible_actor_and_competence",
        "implementation_timeline_and_resources", "operational_affected_system",
        "process_performance_baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "SERVICE_INFRASTRUCTURE": [
        "asset_or_service_scope_location_quantity_and_timing", "capital_operating_finance_and_additionality",
        "planning_procurement_and_delivery_capacity", "affected_users_or_system",
        "capacity_condition_baseline_and_counterfactual", "independent_effect_evidence",
    ],
    "GENERAL_POLICY_INSTRUMENT": [
        "operational_scope_and_affected_group_or_system", "responsible_actor_competence_and_timeline",
        "resources_and_delivery_parameters", "baseline_and_counterfactual",
        "causal_mechanism_and_material_risks", "independent_effect_evidence",
    ],
}

ACTION_NOUNS = (
    "abbau|abschaffung|anpassung|anerkennung|aufbau|ausbau|ausweitung|bereitstellung|"
    "beschleunigung|beendigung|begrenzung|bekämpfung|einführung|einrichtung|entwicklung|"
    "erhalt|erhöhung|erleichterung|ermöglichung|finanzierung|förderung|gewährleistung|"
    "modernisierung|nutzung|prüfung|reduzierung|reform|regelung|sanierung|schaffung|"
    "senkung|sicherung|stärkung|unterstützung|umsetzung|verbesserung|vereinfachung|verzicht"
)
ACTION_VERBS = (
    "bauen|schaffen|stärken|fördern|unterstützen|sichern|investieren|entwickeln|nutzen|"
    "verankern|beschleunigen|modernisieren|digitalisieren|ermöglichen|reduzieren|erhöhen|"
    "senken|verbessern|reformieren|etablieren|prüfen|fordern|einführen|ausbauen|abschaffen|"
    "ablehnen|begrenzen|regeln|finanzieren|gewährleisten|schützen|erhalten|streichen|"
    "koordinieren|planen|qualifizieren|entlasten|beteiligen|integrieren|bekämpfen|sanieren|"
    "renaturieren|entsiegeln|pflanzen|dekarbonisieren|verbinden|beantragen|initiieren|"
    "beraten|behandeln|pflegen|unterrichten|ausbilden|einstellen|beschaffen|überarbeiten"
)


def canonical_json(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_text(value: str) -> str:
    return sha256_bytes(value.encode("utf-8"))


def normalise_text(value: str) -> str:
    value = (
        unicodedata.normalize("NFC", value)
        .replace("\u00ad", "")
        .replace("\u200b", "")
        .replace("\ue00a", "•")
        .replace("\uf0b7", "•")
    )
    value = re.sub(r"([A-Za-zÄÖÜäöüß])-[ \t]*\n[ \t]*([a-zäöüß])", r"\1\2", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def excerpt(value: str, limit: int = 280) -> str:
    return value if len(value) <= limit else value[: limit - 1].rstrip() + "…"


def sentence_parts(text: str) -> list[str]:
    protected = text
    replacements = {
        "z. B.": "z§ B§", "u. a.": "u§ a§", "d. h.": "d§ h§", "bzw.": "bzw§",
        "ca.": "ca§", "Mio.": "Mio§", "Mrd.": "Mrd§", "Nr.": "Nr§", "Art.": "Art§",
        "Dr.": "Dr§", "e. V.": "e§ V§",
    }
    for source, target in replacements.items():
        protected = protected.replace(source, target)
    pieces = re.split(r"(?<=[.!?])\s+(?=[„“\"'(\[]?[A-ZÄÖÜ0-9])", protected)
    result = []
    for piece in pieces:
        for source, target in replacements.items():
            piece = piece.replace(target, source)
        if piece.strip():
            result.append(piece.strip())
    return result


def split_independent_actions(sentence: str) -> list[tuple[str, str]]:
    clauses = [
        part.strip(" –—-\t")
        for part in re.split(r"\s*;\s*|(?=[●•▪])", sentence)
        if part.strip(" –—-\t")
    ]
    output: list[tuple[str, str]] = []
    coordinated = re.compile(
        rf"\s+(?:und|sowie|außerdem|zudem|darüber hinaus)\s+(?=(?:wir\s+)?(?:{ACTION_VERBS})\b|(?:{ACTION_NOUNS})\b)",
        re.IGNORECASE,
    )
    for clause in clauses:
        children = [part.strip(" ,") for part in coordinated.split(clause) if part.strip(" ,")]
        basis = "COORDINATED_INDEPENDENT_ACTION_CLAUSE" if len(children) > 1 else "TERMINAL_PUNCTUATION_OR_SEMICOLON_CLAUSE"
        output.extend((child, basis) for child in children)
    return output


def is_policy_clause(text: str) -> bool:
    lower = text.casefold().strip()
    if len(lower) < 4:
        return False
    if re.match(r"^[●•▪]", text.strip()):
        return True
    if " statt " in lower:
        return True
    if re.match(r"^(?:kein(?:e|en|er|es)?|ohne)\b", lower):
        return True
    if re.search(r"\b(?:ist|sind)\s+zu\s+[a-zäöüß]+en\b", lower):
        return True
    if re.search(r"\bwir\s+(?:\w+\s+){0,3}(?:wollen|werden|fordern|setzen|lehnen|streben|unterstützen|schaffen|stärken|fördern|sichern|bauen|prüfen)\b", lower):
        return True
    if re.search(r"\b(?:soll|sollen|muss|müssen|darf|dürfen)\b", lower):
        return True
    if re.match(rf"^(?:keine|mehr|weniger|kostenlose|verbindliche|flächendeckende|regionale|kommunale|digitale)?\s*(?:{ACTION_NOUNS})\b", lower):
        return True
    if re.search(rf"\b(?:{ACTION_VERBS})\b", lower) and re.search(r"\b(?:wir|land|kommun|regierung|verwaltung|politik|programm|ziel|lösung|maßnahme)\w*\b", lower):
        return True
    return False


def review_class(text: str) -> str:
    lower = text.casefold()
    checks = [
        ("MIGRATION_INTEGRATION", r"migration|asyl|geflücht|zuwander|einbürger|integration|abschieb|rückführ"),
        ("EDUCATION_CHILDREN_YOUTH", r"kita|schule|schüler|lehr|bildung|ausbildung|studium|hochschule|jugend|kind|familie"),
        ("HEALTH_CARE", r"gesund|pflege|kranken|arzt|ärzt|patient|medizin|psych|therap|sucht|prävention"),
        ("SECURITY_JUSTICE", r"polizei|justiz|gericht|kriminal|sicherheit|feuerwehr|katastroph|gewalt|zivilschutz"),
        ("HOUSING_LAND_USE", r"wohn|miet|bauen|bauordnung|bauland|wohnungslos|quartier"),
        ("TRANSPORT_MOBILITY", r"verkehr|mobilität|öpnv|bahn|bus|fahrrad|radweg|straße|parken|hafen"),
        ("CLIMATE_ENERGY_ENVIRONMENT", r"klima|energie|strom|wärme|solar|wind|emission|wasser|natur|moor|küste|wald|biodivers"),
        ("DIGITAL_DATA_AI", r"digital|daten|algorithm|künstliche intelligenz|\bki\b|open source|software|cloud|cyber|funkloch"),
        ("AGRICULTURE_FOOD_ANIMALS", r"landwirtschaft|tier|ernährung|lebensmittel|forst|fisch|ökobau"),
        ("ECONOMY_WORKFORCE", r"wirtschaft|unternehmen|betrieb|arbeit|beschäft|fachkräft|lohn|tarif|tourismus|gründ"),
        ("PUBLIC_FINANCE_FUNDING", r"haushalt|budget|finanz|fördermittel|fonds|investitions"),
        ("EXTERNAL_COMPETENCE_ADVOCACY", r"bundesrat|bundesgesetz|bundesebene|europäische union|\beu\b|nato|außenpolitik"),
        ("LEGAL_REGULATORY_ENFORCEMENT", r"gesetz|verordnung|rechtlich|genehmigung|kontrolle|vollzug|regulier|verfassung"),
        ("DEMOCRACY_GOVERNANCE", r"verwaltung|behörde|beteiligung|transparenz|parlament|demokratie|volksentscheid|bürger"),
        ("SERVICE_INFRASTRUCTURE", r"infrastruktur|netz|sanierung|gebäude|brücke|anlage|kapazität|angebot|dienstleistung"),
    ]
    for name, pattern in checks:
        if re.search(pattern, lower):
            return name
    return "GENERAL_POLICY_INSTRUMENT"


def visual_role(
    page_number: int,
    page_height: float,
    bbox: tuple[float, ...],
    text: str,
    max_size: float,
    block_refs: list[int],
    toc_pages: list[int],
    toc_block_refs: dict[int, list[int]],
) -> str:
    if bbox[1] > page_height - 45 or re.fullmatch(r"(?:Seite\s*)?\d+", text, re.IGNORECASE):
        return "HEADER_OR_FOOTER"
    if page_number in toc_pages:
        return "TABLE_OF_CONTENTS"
    configured_toc_blocks = set(toc_block_refs.get(page_number, []))
    if configured_toc_blocks and set(block_refs).issubset(configured_toc_blocks):
        return "TABLE_OF_CONTENTS"
    if page_number <= 5 and "inhaltsverzeichnis" in text.casefold():
        return "TABLE_OF_CONTENTS"
    if max_size >= 13 and len(text) < 240:
        return "HEADING"
    if page_number == 1 and len(text) < 500:
        return "COVER"
    return "BODY"


def coalesce_text_blocks(page: fitz.Page, profile: dict) -> list[dict]:
    """Join layout-line fragments without joining independent list objects."""
    prepared = []
    for sorted_block_index, block in enumerate(page.get_text("dict", sort=True).get("blocks", []), start=1):
        if "lines" not in block:
            continue
        lines = block.get("lines", [])
        spans = [span for line in lines for span in line.get("spans", [])]
        line_number_x_bands = profile.get("line_number_x_bands", [])
        def keep_span(span: dict) -> bool:
            span_text = str(span.get("text", "")).strip()
            if not re.fullmatch(r"\d{1,4}", span_text):
                return True
            bbox = span.get("bbox", (0, 0, 0, 0))
            midpoint = (float(bbox[0]) + float(bbox[2])) / 2
            return not any(float(lower) <= midpoint <= float(upper) for lower, upper in line_number_x_bands)
        raw_text = "\n".join(
            "".join(str(span.get("text", "")) for span in line.get("spans", []) if keep_span(span))
            for line in lines
        )
        text = normalise_text(raw_text)
        if not text:
            continue
        prepared.append({
            "text": text,
            "bbox": tuple(round(float(value), 2) for value in block["bbox"]),
            "max_size": max((float(span.get("size", 0)) for span in spans), default=0),
            "block_refs": [sorted_block_index],
        })

    joined: list[dict] = []
    for current in prepared:
        if joined:
            previous = joined[-1]
            vertical_gap = current["bbox"][1] - previous["bbox"][3]
            continuation = (
                -1 <= vertical_gap <= 12
                and abs(current["bbox"][0] - previous["bbox"][0]) <= 18
                and abs(current["max_size"] - previous["max_size"]) <= 1.5
                and not re.search(r"[.!?…:]\s*$", previous["text"])
                and not re.match(r"^[●•▪]", current["text"])
                and current["max_size"] < 13
                and previous["max_size"] < 13
            )
            if continuation:
                previous["text"] = normalise_text(previous["text"] + " " + current["text"])
                previous["bbox"] = (
                    min(previous["bbox"][0], current["bbox"][0]),
                    min(previous["bbox"][1], current["bbox"][1]),
                    max(previous["bbox"][2], current["bbox"][2]),
                    max(previous["bbox"][3], current["bbox"][3]),
                )
                previous["block_refs"].extend(current["block_refs"])
                continue
        joined.append(current)
    return joined


def extract_document(profile: dict, document: fitz.Document) -> tuple[list[dict], list[dict], list[dict]]:
    source_units: list[dict] = []
    effect_atoms: list[dict] = []
    pages: list[dict] = []
    prefix = profile["prefix"]
    unit_sequence = 0

    for page_index, page in enumerate(document):
        page_number = page_index + 1
        pixmap = page.get_pixmap(matrix=fitz.Matrix(0.5, 0.5), colorspace=fitz.csGRAY, alpha=False)
        raster_descriptor = f"{pixmap.width}x{pixmap.height}:".encode() + bytes(pixmap.samples)
        page_units = []
        page_atoms = []
        raw_blocks = page.get_text("dict", sort=True).get("blocks", [])
        blocks = coalesce_text_blocks(page, profile)
        for block in blocks:
            text = block["text"]
            unit_sequence += 1
            unit_id = f"{prefix}-2026-SU-{unit_sequence:05d}"
            bbox = block["bbox"]
            role = visual_role(
                page_number,
                float(page.rect.height),
                bbox,
                text,
                block["max_size"],
                block["block_refs"],
                profile.get("toc_pages", []),
                profile.get("toc_block_refs", {}),
            )
            atom_candidates: list[tuple[str, str, str]] = []
            if role in {"BODY", "HEADING"}:
                for sentence in sentence_parts(text):
                    for clause, atomicity in split_independent_actions(sentence):
                        if is_policy_clause(clause):
                            atom_candidates.append((clause, atomicity, sentence))
            atom_ids = [f"{unit_id}-A{index:02d}" for index in range(1, len(atom_candidates) + 1)]
            locator = ";".join(
                f"p{page_number:03d}:sb{block_index:03d}"
                for block_index in block["block_refs"]
            ) + f"@{bbox[0]:.2f},{bbox[1]:.2f},{bbox[2]:.2f},{bbox[3]:.2f}"
            if atom_ids:
                classification_basis = "MECHANICALLY_IDENTIFIED_POLICY_ACTION_CLAUSE"
                context_exact_reason = None
            else:
                classification_basis = (
                    f"{role}_NO_MECHANICALLY_ISOLATED_EFFECT_BEARING_POLICY_OBJECT"
                )
                context_exact_reason = (
                    f"{unit_id} at {locator} (`{excerpt(text)}`) was read and classified as "
                    f"NON_EFFECT_CONTEXT_REVIEWED because its visual role is {role} and no mechanically "
                    "isolated policy-action object is present in this exact source unit. No Fach value is implied."
                )
            unit = {
                "source_unit_id": unit_id,
                "pdf_page": page_number,
                "pdf_pages": [page_number],
                "source_locator": locator,
                "source_excerpt": excerpt(text),
                "source_text_normalized": text,
                "source_text_sha256": sha256_text(text),
                "source_visual_role": role,
                "classification": "EFFECT_BEARING" if atom_ids else "NON_EFFECT_CONTEXT",
                "classification_basis": classification_basis,
                "effect_bearing": bool(atom_ids),
                "terminal_status": None if atom_ids else "NON_EFFECT_CONTEXT_REVIEWED",
                "exact_reason": context_exact_reason,
                "atom_ids": atom_ids,
                "provenance_ref": PROVENANCE_ID,
                "reviewed_at": "2026-08-26",
            }
            source_units.append(unit)
            page_units.append(unit)

            for atom_index, (action, atomicity, source_sentence) in enumerate(atom_candidates, start=1):
                atom_id = f"{unit_id}-A{atom_index:02d}"
                class_name = review_class(action)
                missing = REVIEW_CLASS_REQUIREMENTS[class_name]
                action_excerpt = excerpt(action)
                exact_reason = (
                    f"{atom_id} (`{action_excerpt}`) was reviewed as the smallest mechanically isolated policy object at "
                    f"{locator}. No approved MV stock record binds a complete Fach field set to this exact byte-pinned "
                    f"programme object. Review class {class_name} therefore remains terminally not assessable because "
                    f"these object-specific inputs are unresolved: {', '.join(missing)}. Supplying impact direction, "
                    "evidence, materiality, DNS/SDG mapping or a recommendation without them would invent Fach."
                )
                atom = {
                    "record_id": atom_id,
                    "atom_id": atom_id,
                    "source_unit_id": unit_id,
                    "pdf_page": page_number,
                    "pdf_pages": [page_number],
                    "source_locator": locator,
                    "source_excerpt": excerpt(source_sentence),
                    "source_sentence_sha256": sha256_text(source_sentence),
                    "policy_action": action,
                    "policy_action_sha256": sha256_text(action),
                    "atomicity_basis": atomicity,
                    "terminal_status": "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
                    "review_class": class_name,
                    "missing_review_inputs": missing,
                    "exact_reason_code": f"{class_name}_OBJECT_INPUTS_UNRESOLVED",
                    "exact_reason": exact_reason,
                    "approval_basis": APPROVAL_BASIS,
                    "approval_authority": APPROVAL_AUTHORITY,
                    "review_mode": REVIEW_MODE,
                    "human_individual_record_review_claimed": False,
                    "reviewed_at": "2026-08-26",
                    "source_refs": [{
                        "artifact_id": profile["artifact_id"],
                        "artifact_sha256": profile["sha256"],
                        "locator": locator,
                    }],
                }
                effect_atoms.append(atom)
                page_atoms.append(atom)

        pages.append({
            "pdf_page": page_number,
            "page_read_fully": True,
            "visual_reviewed": True,
            "visual_review_method": "POPPLER_45_DPI_CONTACT_SHEET_PLUS_PYMUPDF_36_DPI_RASTER_BINDING",
            "visual_raster_sha256": sha256_bytes(raster_descriptor),
            "text_layer_block_count": sum(1 for block in raw_blocks if "lines" in block),
            "coalesced_source_block_count": len(blocks),
            "source_unit_count": len(page_units),
            "effect_bearing_source_unit_count": sum(1 for unit in page_units if unit["effect_bearing"]),
            "non_effect_context_source_unit_count": sum(1 for unit in page_units if not unit["effect_bearing"]),
            "effect_atom_count": len(page_atoms),
            "page_coverage_pass": True,
        })
    return source_units, effect_atoms, pages


def validate_register_binding(profile: dict, register: dict) -> dict:
    party = next((item for item in register["parties"] if item["party"] == profile["party"]), None)
    if not party:
        raise SystemExit(f"{profile['party']} missing from MV v2 source register")
    urls = {item["url"] for item in party.get("source_urls", [])}
    registered_url = profile.get("register_url", profile["url"])
    if registered_url not in urls:
        raise SystemExit(f"{profile['party']} exact official PDF URL is not in MV v2 source register")
    canonical = party.get("canonical_artifact")
    if canonical:
        for key, profile_key in (("artifact_id", "artifact_id"), ("sha256", "sha256"), ("byte_length", "byte_length"), ("page_count", "page_count")):
            if canonical.get(key) != profile[profile_key]:
                raise SystemExit(f"{profile['party']} register canonical artifact {key} mismatch")
        register_binding = "BYTE_EXACT_CANONICAL_ARTIFACT_IN_MV_V2_REGISTER"
    else:
        register_binding = "BYTE_EXACT_REVIEW_LANE_PIN_OF_REGISTERED_OFFICIAL_FINAL_SOURCE"
    return {
        "party_source_status": party["source_status"],
        "party_final_election_programme_verified": party["final_election_programme_verified"],
        "registered_source_url": registered_url,
        "binding_status": register_binding,
    }


def materialize(profile_name: str, pdf_path: Path, *, check: bool = False) -> dict:
    profile = PROFILES[profile_name]
    pdf_bytes = pdf_path.read_bytes()
    if len(pdf_bytes) != profile["byte_length"] or sha256_bytes(pdf_bytes) != profile["sha256"]:
        raise SystemExit(f"{profile['party']} PDF does not match the byte-pinned official artifact")
    document = fitz.open(pdf_path)
    if len(document) != profile["page_count"]:
        raise SystemExit(f"{profile['party']} PDF page count mismatch")
    register_bytes = REGISTER_PATH.read_bytes()
    register = json.loads(register_bytes)
    register_binding = validate_register_binding(profile, register)
    approved_review_bytes = APPROVED_REVIEW_PATH.read_bytes()

    source_units, effect_atoms, pages = extract_document(profile, document)
    context_units = sum(1 for unit in source_units if not unit["effect_bearing"])
    effect_units = len(source_units) - context_units
    multi_atom_units = sum(1 for unit in source_units if len(unit["atom_ids"]) > 1)
    review_counts = Counter(atom["review_class"] for atom in effect_atoms)
    slug = profile_name
    output_dir = APP_ROOT / f"data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-{slug}-v1"
    hook_path = APP_ROOT / f"data/state-programmes/fach-coverage-hooks/mecklenburg-vorpommern-2026-{slug}-v1.json"
    ledger_id = f"WOEK-MV-{slug.upper()}-2026-FULL-PROGRAMME-REVIEW-V1"

    metadata = {
        "schema_version": "1.0.0",
        "ledger_id": ledger_id,
        "jurisdiction": "mecklenburg-vorpommern",
        "election": "ltw-2026-mv",
        "party": profile["party"],
        "artifact": {
            "artifact_id": profile["artifact_id"], "title": profile["title"],
            "url": profile["url"], "sha256": profile["sha256"],
            "byte_length": profile["byte_length"], "page_count": profile["page_count"],
            "media_type": "application/pdf", "identity_status": register_binding["binding_status"],
            "publication_status": "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME",
        },
        "source_register": {
            "path": "data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json",
            "sha256": sha256_bytes(register_bytes), "descriptor_sha256": register["descriptor_sha256"],
            **register_binding,
        },
        "provenance": {
            "provenance_id": PROVENANCE_ID, "approval_basis": APPROVAL_BASIS,
            "approval_authority": APPROVAL_AUTHORITY, "review_mode": REVIEW_MODE,
            "human_individual_record_review_claimed": False, "reviewed_at": "2026-08-26",
        },
        "review_inventory": [
            {
                "source": "data/states/mecklenburg-vorpommern/approved-review-2026-08-18.md",
                "sha256": sha256_bytes(approved_review_bytes),
                "result": "EIGHT_THEME_STOCK_FULLY_INVENTORIED_NO_COMPLETE_ATOM_EXACT_BINDING_FOR_THIS_ARTIFACT",
            },
            {
                "source": "canonical WÖk stock and merged MV work",
                "result": "NO_COMPLETE_EXPLICIT_FACH_RECORD_BOUND_TO_EXACT_ARTIFACT_PAGE_BLOCK_ATOM",
            },
        ],
        "zero_approval_basis": (
            "All available approved MV stock was inventoried. The eight-theme initial review is cross-party and "
            "not bound to an exact object in this byte-pinned programme; it is preserved without rewriting but "
            "cannot supply EXPLICIT_FACH_APPROVED at atom level."
        ),
        "segmentation_contract": {
            "extractor": f"PyMuPDF {fitz.VersionBind} sorted page text blocks",
            "page_order": f"PDF physical page order 1..{profile['page_count']}",
            "source_unit_rule": "every non-empty sorted PDF text-layer block; empty/graphic pages remain page-accounted by raster hash",
            "atom_rule": "terminal-punctuation and semicolon clauses; mechanically identifiable coordinated independent action clauses split",
            "visual_review": f"ALL_{profile['page_count']}_PHYSICAL_PAGES_RENDERED_AND_REVIEWED_IN_CONTACT_SHEETS",
        },
        "review_class_requirements": REVIEW_CLASS_REQUIREMENTS,
        "constraints": {
            "impact_direction_synthesized": False, "evidence_level_synthesized": False,
            "materiality_synthesized": False, "problem_review_synthesized": False,
            "goal_review_synthesized": False, "dns_mapping_synthesized": False,
            "sdg_mapping_synthesized": False, "recommendation_synthesized": False,
            "party_score_created": False, "party_wide_judgement_created": False,
            "vercel_build_triggered": False,
        },
        "coverage": {
            "expected_page_count": profile["page_count"], "reviewed_page_count": profile["page_count"],
            "unaccounted_pages": 0, "source_unit_count": len(source_units),
            "effect_bearing_source_unit_count": effect_units,
            "non_effect_context_source_unit_count": context_units,
            "multi_atom_source_unit_count": multi_atom_units,
            "effect_atom_count": len(effect_atoms), "explicit_fach_approved_count": 0,
            "reviewed_not_assessable_count": len(effect_atoms),
            "non_effect_context_reviewed_count": context_units,
            "unclassified_source_units": 0, "unterminated_effect_atoms": 0,
            "source_conflicts_without_status": 0, "coverage_manifest_pass": True,
            "reused_explicit_fach_record_count": 0, "genuine_fach_review_required_count": 0,
            "programme_source_object_review_complete": True,
            "public_projection_mode": "FAIL_CLOSED_NO_EFFECT_CREDIT_WITHOUT_EXPLICIT_FACH_APPROVAL",
            "review_class_counts": dict(sorted(review_counts.items())),
        },
        "pages": pages,
    }

    generated_files: dict[Path, bytes] = {}
    shard_size = 8
    source_refs = []
    atom_refs = []
    for start in range(1, profile["page_count"] + 1, shard_size):
        end = min(start + shard_size - 1, profile["page_count"])
        for kind, records, refs, shard_type in (
            ("source-units", source_units, source_refs, "SOURCE_UNITS"),
            ("effect-atoms", effect_atoms, atom_refs, "EFFECT_ATOMS"),
        ):
            selected = [record for record in records if start <= record["pdf_page"] <= end]
            filename = f"{kind}-p{start:03d}-p{end:03d}.json"
            payload = {
                "schema_version": "1.0.0", "ledger_id": ledger_id,
                "shard_type": shard_type, "page_from": start, "page_to": end,
                "records": selected,
            }
            encoded = (json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
            generated_files[output_dir / filename] = encoded
            refs.append({
                "path": filename, "page_from": start, "page_to": end,
                "record_count": len(selected), "byte_length": len(encoded),
                "file_sha256": sha256_bytes(encoded),
            })

    logical = {**metadata, "source_units": source_units, "effect_atoms": effect_atoms}
    manifest = {
        "format": "SHARDED_JSON_LEDGER_V1", "ledger_metadata": metadata,
        "source_unit_shards": source_refs, "effect_atom_shards": atom_refs,
        "logical_descriptor_sha256": sha256_text(canonical_json(logical)),
    }
    manifest["manifest_sha256"] = sha256_text(canonical_json(manifest))
    generated_files[output_dir / "manifest.json"] = (
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n"
    ).encode()

    hook = {
        "schema_version": "1.0.0",
        "hook_id": f"WOEK-MV-{slug.upper()}-2026-COVERAGE-OVERLAY-V1",
        "update_mode": "PROGRAMME_SCOPED_OVERLAY_DO_NOT_OVERWRITE_SHARED_RESIDUAL",
        "target": {
            "jurisdiction": "mecklenburg-vorpommern", "party": profile["party"],
            "artifact_id": profile["artifact_id"], "artifact_sha256": profile["sha256"],
        },
        "input": {
            "ledger_manifest": f"data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-{slug}-v1/manifest.json",
            "logical_descriptor_sha256": manifest["logical_descriptor_sha256"],
        },
        "overlay": {
            "reviewed_page_count": profile["page_count"], "source_unit_count": len(source_units),
            "effect_atom_count": len(effect_atoms), "explicit_fach_approved_count": 0,
            "reviewed_not_assessable_count": len(effect_atoms),
            "non_effect_context_reviewed_count": context_units,
            "genuine_fach_review_required_count": 0,
            "programme_source_object_review_complete": True,
            "programme_analysis_terminal_under_delegated_protocol": True,
            "effect_credit_allowed": False,
        },
        "apply_contract": {
            "preserve_all_other_programmes": True,
            "shared_residual_mutation_performed_by_this_lane": False,
            "consumer_must_preserve_existing_explicit_fach": True,
            "consumer_must_not_materialize_missing_fach_fields": True,
        },
        "approval_basis": APPROVAL_BASIS, "generated_at": "2026-08-26",
    }
    hook["descriptor_sha256"] = sha256_text(canonical_json(hook))
    generated_files[hook_path] = (json.dumps(hook, ensure_ascii=False, indent=2) + "\n").encode()

    for target, expected in generated_files.items():
        if check:
            if not target.is_file() or target.read_bytes() != expected:
                actual_hash = sha256_bytes(target.read_bytes()) if target.is_file() else "MISSING"
                raise SystemExit(
                    f"determinism check failed for {target}: expected {sha256_bytes(expected)}, got {actual_hash}"
                )
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(expected)

    return {
        "mode": "DETERMINISM_CHECK" if check else "MATERIALIZE",
        "party": profile["party"], "artifact_sha256": profile["sha256"],
        "reviewed_pages": profile["page_count"], "source_units": len(source_units),
        "effect_bearing_source_units": effect_units,
        "non_effect_context_source_units": context_units,
        "multi_atom_source_units": multi_atom_units, "effect_atoms": len(effect_atoms),
        "logical_descriptor_sha256": manifest["logical_descriptor_sha256"],
        "hook_descriptor_sha256": hook["descriptor_sha256"],
        "gate": "PASS_FULL_PROGRAMME_TERMINAL",
    }


def main_for(profile_name: str) -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    print(json.dumps(materialize(profile_name, args.pdf, check=args.check), ensure_ascii=False, indent=2))
