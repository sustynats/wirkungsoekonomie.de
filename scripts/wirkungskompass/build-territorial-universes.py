#!/usr/bin/env python3
"""Build territorial beta universes for the Wirkungskompass family.

The script keeps scores deliberately empty. It prepares searchable entity
metadata, source/provider notes and method scaffolding for the concept tools.
"""

from __future__ import annotations

import html
import json
import os
import re
import subprocess
import unicodedata
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "wirkungskompass"
CREATED_AT = "2026-06-10T00:00:00+02:00"
METHOD_VERSION = "territorial-compass-beta-0.1"
UN_MEMBERS_URL = "https://www.un.org/en/about-us/member-states"
REST_COUNTRIES_URL = "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,unMember,region,subregion,population,area"


def fetch_text(url: str) -> str:
    completed = subprocess.run(
        [
            "curl",
            "-L",
            "--max-time",
            "20",
            "-A",
            "wirkungsoekonomie-beta-metadata-builder/0.1 (+https://wirkungsoekonomie.de)",
            "-s",
            url,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return completed.stdout


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return value or "entity"


def norm(value: str | None) -> str:
    if not value:
        return ""
    value = html.unescape(value)
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = re.sub(r"&", " and ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    value = re.sub(r"\b(the|republic|state|states|kingdom|federal|democratic|people|s|of|and)\b", " ", value)
    return re.sub(r"\s+", " ", value).strip()


REST_ALIASES = {
    "bahamas": "bahamas",
    "bolivia plurinational": "bolivia",
    "brunei darussalam": "brunei",
    "cabo verde": "cape verde",
    "congo": "republic congo",
    "cote d ivoire": "ivory coast",
    "czechia": "czechia",
    "democratic republic congo": "democratic republic congo",
    "democratic peoples republic korea": "north korea",
    "eswatini": "eswatini",
    "gambia": "gambia",
    "guinea bissau": "guinea bissau",
    "iran islamic republic": "iran",
    "iran islamic": "iran",
    "korea": "south korea",
    "lao people democratic republic": "laos",
    "lao peoples": "laos",
    "micronesia federated states": "micronesia",
    "micronesia federated": "micronesia",
    "moldova republic": "moldova",
    "netherlands": "netherlands",
    "north macedonia": "north macedonia",
    "republic korea": "south korea",
    "russian federation": "russia",
    "saint kitts and nevis": "saint kitts and nevis",
    "saint lucia": "saint lucia",
    "saint vincent and grenadines": "saint vincent and the grenadines",
    "sao tome and principe": "sao tome and principe",
    "syrian arab republic": "syria",
    "tanzania united republic": "tanzania",
    "turkiye": "turkey",
    "venezuela bolivarian republic": "venezuela",
    "venezuela bolivarian": "venezuela",
    "viet nam": "vietnam",
}

G20_ISO3 = {
    "ARG",
    "AUS",
    "BRA",
    "CAN",
    "CHN",
    "FRA",
    "DEU",
    "IND",
    "IDN",
    "ITA",
    "JPN",
    "MEX",
    "RUS",
    "SAU",
    "ZAF",
    "KOR",
    "TUR",
    "GBR",
    "USA",
}

OECD_ISO3 = {
    "AUS",
    "AUT",
    "BEL",
    "CAN",
    "CHL",
    "COL",
    "CRI",
    "CZE",
    "DNK",
    "EST",
    "FIN",
    "FRA",
    "DEU",
    "GRC",
    "HUN",
    "ISL",
    "IRL",
    "ISR",
    "ITA",
    "JPN",
    "KOR",
    "LVA",
    "LTU",
    "LUX",
    "MEX",
    "NLD",
    "NZL",
    "NOR",
    "POL",
    "PRT",
    "SVK",
    "SVN",
    "ESP",
    "SWE",
    "CHE",
    "TUR",
    "GBR",
    "USA",
}

EU27 = [
    ("Austria", "Österreich", "AT", "AUT"),
    ("Belgium", "Belgien", "BE", "BEL"),
    ("Bulgaria", "Bulgarien", "BG", "BGR"),
    ("Croatia", "Kroatien", "HR", "HRV"),
    ("Cyprus", "Zypern", "CY", "CYP"),
    ("Czechia", "Tschechien", "CZ", "CZE"),
    ("Denmark", "Dänemark", "DK", "DNK"),
    ("Estonia", "Estland", "EE", "EST"),
    ("Finland", "Finnland", "FI", "FIN"),
    ("France", "Frankreich", "FR", "FRA"),
    ("Germany", "Deutschland", "DE", "DEU"),
    ("Greece", "Griechenland", "GR", "GRC"),
    ("Hungary", "Ungarn", "HU", "HUN"),
    ("Ireland", "Irland", "IE", "IRL"),
    ("Italy", "Italien", "IT", "ITA"),
    ("Latvia", "Lettland", "LV", "LVA"),
    ("Lithuania", "Litauen", "LT", "LTU"),
    ("Luxembourg", "Luxemburg", "LU", "LUX"),
    ("Malta", "Malta", "MT", "MLT"),
    ("Netherlands", "Niederlande", "NL", "NLD"),
    ("Poland", "Polen", "PL", "POL"),
    ("Portugal", "Portugal", "PT", "PRT"),
    ("Romania", "Rumänien", "RO", "ROU"),
    ("Slovakia", "Slowakei", "SK", "SVK"),
    ("Slovenia", "Slowenien", "SI", "SVN"),
    ("Spain", "Spanien", "ES", "ESP"),
    ("Sweden", "Schweden", "SE", "SWE"),
]

LWK_STATES = [
    ("Baden-Württemberg", "DE1", "Flächenland", "Süd"),
    ("Bayern", "DE2", "Flächenland", "Süd"),
    ("Berlin", "DE3", "Stadtstaat", "Ost / Stadtstaat"),
    ("Brandenburg", "DE4", "Flächenland", "Ost"),
    ("Bremen", "DE5", "Stadtstaat", "Nord / Stadtstaat"),
    ("Hamburg", "DE6", "Stadtstaat", "Nord / Stadtstaat"),
    ("Hessen", "DE7", "Flächenland", "West"),
    ("Mecklenburg-Vorpommern", "DE8", "Flächenland", "Nord / Ost"),
    ("Niedersachsen", "DE9", "Flächenland", "Nord"),
    ("Nordrhein-Westfalen", "DEA", "Flächenland", "West"),
    ("Rheinland-Pfalz", "DEB", "Flächenland", "West"),
    ("Saarland", "DEC", "Flächenland", "West"),
    ("Sachsen", "DED", "Flächenland", "Ost"),
    ("Sachsen-Anhalt", "DEE", "Flächenland", "Ost"),
    ("Schleswig-Holstein", "DEF", "Flächenland", "Nord"),
    ("Thüringen", "DEG", "Flächenland", "Ost"),
]


def load_rest_countries() -> dict[str, dict]:
    try:
        cache = Path("/tmp/restcountries-uwk.json")
        if cache.exists():
            countries = json.loads(cache.read_text(encoding="utf-8"))
        elif os.environ.get("WK_FETCH_REST") == "1":
            countries = json.loads(fetch_text(REST_COUNTRIES_URL))
        else:
            return {}
    except Exception as exc:  # pragma: no cover - network fallback path
        print(f"REST Countries unavailable: {exc}")
        return {}

    by_key: dict[str, dict] = {}
    for country in countries:
        name = country.get("name") or {}
        keys = {
            norm(name.get("common")),
            norm(name.get("official")),
            norm(country.get("cca2")),
            norm(country.get("cca3")),
        }
        for key in keys:
            if key:
                by_key[key] = country
    return by_key


def parse_un_members() -> list[dict[str, str]]:
    cache = Path("/tmp/un-members.html")
    markup = cache.read_text(encoding="utf-8") if cache.exists() else fetch_text(UN_MEMBERS_URL)
    members = []
    for block in markup.split('country">')[1:]:
        name_match = re.search(r"<h2[^>]*>(.*?)</h2>", block, flags=re.S)
        date_match = re.search(r"Date of Admission:\s*([0-9-]+)", block)
        if not name_match or not date_match:
            continue
        cleaned = re.sub(r"<.*?>", "", html.unescape(name_match.group(1))).strip()
        admission_date = date_match.group(1)
        members.append({"name": cleaned, "admission_date": admission_date})
    if len(members) != 193:
        raise RuntimeError(f"Expected 193 UN member states, got {len(members)}")
    return members


def rest_match(member_name: str, rest_index: dict[str, dict]) -> dict | None:
    raw = member_name.lower()
    if raw.startswith("democratic people's republic of korea"):
        return rest_index.get(norm("north korea"))
    if raw == "republic of korea":
        return rest_index.get(norm("south korea"))
    key = norm(member_name)
    alias = REST_ALIASES.get(key)
    if alias:
        return rest_index.get(norm(alias))
    direct = rest_index.get(key)
    if direct:
        return direct
    return None


def data_status_note() -> dict[str, str]:
    return {
        "status": "Metadaten verfügbar, Wirkungsdaten fehlen",
        "data_status": "Metadaten verfügbar, Wirkungsdaten fehlen",
        "data_status_code": "metadata_only",
        "coverage": "0 %",
    }


def build_lwk() -> dict:
    entities = []
    for name, nuts, structure, group in LWK_STATES:
        entities.append(
            {
                "entity_id": f"lwk-de-{slugify(name)}",
                "entity_type": "german_state",
                "name": name,
                "official_name": name,
                "iso2": "DE",
                "iso3": "DEU",
                "nuts_code": nuts,
                "ags": None,
                "parent_entity_id": "DEU",
                "region_group": group,
                "comparison_groups": [structure, group],
                "population": None,
                "area": None,
                "method_version": METHOD_VERSION,
                "notes": "Bundesland im LWK-DE-Beta-Universum. Strukturgruppe dient nur der Kontextualisierung, nicht einer Rangliste.",
                **data_status_note(),
            }
        )
    return universe(
        "lwk-de-16-beta-2026-06-10",
        "Länder-Wirkungskompass Deutschland",
        "Alle 16 Bundesländer als Beta-Universum für Wirkungsprofile zu Mensch, Planet und Demokratie.",
        "LWK-DE",
        entities,
        "Bundesländer-Grundgesamtheit nach amtlicher Länderstruktur; Datenprovider sind vorbereitet, aber noch nicht importiert.",
        ["Stadtstaaten", "Flächenländer", "Nord", "Süd", "Ost", "West"],
    )


def build_ewk() -> dict:
    entities = []
    for english, german, iso2, iso3 in EU27:
        entities.append(
            {
                "entity_id": f"ewk-eu27-{slugify(english)}",
                "entity_type": "eu_country",
                "name": german,
                "official_name": english,
                "iso2": iso2,
                "iso3": iso3,
                "nuts_code": None,
                "ags": None,
                "parent_entity_id": "EU27",
                "region_group": "EU-27",
                "comparison_groups": ["EU-27", "EWK-EU27"],
                "population": None,
                "area": None,
                "method_version": METHOD_VERSION,
                "notes": "EU-Mitgliedstaat im EWK-EU27-MVP. Europa+ ist als spätere Erweiterung getrennt zu behandeln.",
                **data_status_note(),
            }
        )
    return universe(
        "ewk-eu27-beta-2026-06-10",
        "Europa-Wirkungskompass",
        "EU-27 als priorisiertes MVP-Universum; Europa+ wird später methodisch getrennt ergänzt.",
        "EWK-EU27",
        entities,
        "EU-27-Liste nach offizieller EU-Mitgliedstaatenstruktur; Datenprovider sind vorbereitet, aber noch nicht importiert.",
        ["EU-27", "Europa+ später"],
    )


def build_wwk() -> dict:
    rest_index = load_rest_countries()
    entities = []
    unmatched = []
    for member in parse_un_members():
        country = rest_match(member["name"], rest_index)
        iso2 = country.get("cca2") if country else None
        iso3 = country.get("cca3") if country else None
        region = country.get("region") if country else None
        subregion = country.get("subregion") if country else None
        groups = ["WWK-193"]
        if region:
            groups.append(region)
        if subregion:
            groups.append(subregion)
        if iso3 in G20_ISO3:
            groups.append("G20")
        if iso3 in OECD_ISO3:
            groups.append("OECD")
        if iso3 in {entry[3] for entry in EU27}:
            groups.append("EU")
        if not country:
            unmatched.append(member["name"])
        entities.append(
            {
                "entity_id": f"wwk193-{slugify(member['name'])}",
                "entity_type": "world_state",
                "name": member["name"],
                "official_name": (country.get("name") or {}).get("official") if country else member["name"],
                "iso2": iso2,
                "iso3": iso3,
                "nuts_code": None,
                "ags": None,
                "parent_entity_id": None,
                "region_group": region or "Region noch zu validieren",
                "comparison_groups": groups,
                "population": country.get("population") if country else None,
                "area": country.get("area") if country else None,
                "un_admission_date": member["admission_date"],
                "method_version": METHOD_VERSION,
                "notes": "UN-Mitgliedstaat im WWK-193-Grunduniversum. Fehlende Metadaten bedeuten keine schlechte Wirkung, sondern offene Datenvalidierung.",
                **data_status_note(),
            }
        )
    meta_note = "Alle 193 UN-Mitgliedstaaten laut offizieller UN-Mitgliederseite. REST-Countries-Metadaten nur ergänzend."
    if unmatched:
        meta_note += f" ISO-/Regionsmetadaten bei {len(unmatched)} Einträgen später manuell validieren: {', '.join(unmatched)}."
    return universe(
        "wwk-193-beta-2026-06-10",
        "Welt-Wirkungskompass",
        "Alle 193 UN-Mitgliedstaaten als Grunduniversum. Gesamtwerte erscheinen nur bei ausreichender Datenabdeckung.",
        "WWK-193",
        entities,
        meta_note,
        ["G20", "EU", "OECD", "Africa", "Asia", "Europe", "Americas", "Oceania", "SIDS später", "Top-Datenabdeckung später"],
    )


def universe(uid: str, title: str, description: str, shortname: str, entities: list[dict], source_note: str, filters: list[str]) -> dict:
    return {
        "universe_id": uid,
        "title": title,
        "shortname": shortname,
        "description": description,
        "created_at": CREATED_AT,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "method_version": METHOD_VERSION,
        "source_note": source_note,
        "license_note": "Dieser Snapshot enthält nur Basis-Metadaten und keine Scores, Ratings oder proprietären Daten.",
        "minimum_profile_rule": "Gesamtwerte werden nur angezeigt, wenn Mindestdatenabdeckung, Mindestindikatoren und Datenqualität erfüllt sind.",
        "ranking_disclaimer": "Kein Ranking, kein amtliches Rating, keine automatische Entscheidung und keine politische Gesinnungsbewertung.",
        "available_filters": filters,
        "entities": entities,
        "profiles": [],
        "scores": [],
        "observations": [],
    }


def write_json(filename: str, payload: dict) -> None:
    path = OUT / filename
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}", flush=True)


def write_support_files() -> None:
    provider_registry = {
        "method_version": METHOD_VERSION,
        "created_at": CREATED_AT,
        "providers": [
            {
                "provider_id": "destatis_regionaldatenbank",
                "scope": "LWK-DE",
                "title": "Destatis / Regionaldatenbank",
                "status": "prepared_not_scraped",
                "possible_indicators": ["Armutsgefährdung", "Arbeitslosigkeit", "Bildung", "Bevölkerung", "Fläche"],
                "license_note": "Vor Import Lizenz und Nutzungsbedingungen prüfen.",
            },
            {
                "provider_id": "uba",
                "scope": "LWK-DE",
                "title": "Umweltbundesamt",
                "status": "prepared_not_scraped",
                "possible_indicators": ["CO2-Emissionen", "Luftqualität", "Flächenverbrauch", "Klimaanpassung"],
                "license_note": "Nur offene, zitierfähige Daten versioniert übernehmen.",
            },
            {
                "provider_id": "bundeswahlleiter_landeswahlleitungen",
                "scope": "LWK-DE",
                "title": "Bundeswahlleiterin / Landeswahlleitungen",
                "status": "prepared_not_scraped",
                "possible_indicators": ["Wahlbeteiligung", "ungültige Stimmen", "Beteiligungstrends"],
                "license_note": "Quelle, Wahlart, Gebietsstand und Abrufdatum sichtbar speichern.",
            },
            {
                "provider_id": "eurostat_sdg",
                "scope": "EWK",
                "title": "Eurostat EU SDG Indicator Set",
                "status": "prepared_not_scraped",
                "possible_indicators": ["Armut", "Beschäftigung", "Gesundheit", "Bildung", "Emissionen", "Energie"],
                "license_note": "Eurostat-Daten mit Tabellen-ID, Zeitstand und Abrufdatum versionieren.",
            },
            {
                "provider_id": "eea",
                "scope": "EWK",
                "title": "European Environment Agency",
                "status": "prepared_not_scraped",
                "possible_indicators": ["Klima", "Biodiversität", "Luftverschmutzung", "Ressourcen"],
                "license_note": "Datensatzlizenz pro Quelle prüfen.",
            },
            {
                "provider_id": "un_global_sdg",
                "scope": "WWK",
                "title": "UN Global SDG Indicators Database",
                "status": "prepared_not_scraped",
                "possible_indicators": ["SDG-Status", "SDG-Trend", "Zielabstand"],
                "license_note": "Indikator-ID, Land, Jahr, Lizenz und Abrufdatum speichern.",
            },
            {
                "provider_id": "world_bank_wdi",
                "scope": "WWK",
                "title": "World Bank World Development Indicators",
                "status": "prepared_not_scraped",
                "possible_indicators": ["Armut", "Gesundheit", "Bildung", "Emissionen", "Wasser", "Energie"],
                "license_note": "Keine Live-Abfrage im Seitenaufruf; Snapshots versionieren.",
            },
            {
                "provider_id": "sdgplus_democracy_sources",
                "scope": "EWK/WWK",
                "title": "SDG+ Demokratie-Proxyquellen",
                "status": "method_review_required",
                "possible_indicators": ["Rechtsstaatlichkeit", "Pressefreiheit", "Korruption", "Zivilgesellschaft", "Vertrauen"],
                "license_note": "V-Dem, WJP, RSF, Freedom House, Transparency International und Surveys nur nach Lizenz- und Methodikprüfung verwenden.",
            },
        ],
    }
    data_model = {
        "method_version": METHOD_VERSION,
        "entities": ["entity_id", "entity_type", "name", "official_name", "iso2", "iso3", "nuts_code", "ags", "parent_entity_id", "region_group", "population", "area", "status", "notes"],
        "indicator_catalog": ["indicator_id", "name", "dimension", "subdimension", "sdg_or_sdgplus", "unit", "polarity", "source_priority", "benchmark_method", "required", "red_line", "method_version"],
        "observations": ["observation_id", "entity_id", "year", "indicator_id", "raw_value", "unit", "source_id", "source_url", "retrieved_at", "license", "data_quality", "notes"],
        "scores": ["score_id", "entity_id", "year", "indicator_id", "score_0_100", "method_version", "data_quality", "red_line_flag", "notes"],
        "profiles": ["profile_id", "entity_id", "entity_type", "year", "method_version", "mensch_score", "planet_score", "demokratie_score", "overall_score", "coverage", "data_quality_score", "trend_summary", "interpretation", "created_at"],
        "sources": ["source_id", "title", "provider", "url", "license", "retrieved_at", "update_frequency", "notes"],
        "comparison_groups": ["group_id", "title", "entity_type", "entities", "method_note"],
    }
    scoring = {
        "method_version": METHOD_VERSION,
        "score_types": ["Status-Score", "Trend-Score", "Zielabstand", "Datenqualität", "Transformationspfad"],
        "normalization": ["higher_is_better", "lower_is_better", "target_corridor", "near_zero_better", "binary_compliance", "red_line_event", "disclosure_quality"],
        "overall_score_rules": [
            "ausreichende Datenabdeckung in allen drei Dimensionen",
            "Mindestanzahl von Indikatoren pro Dimension",
            "Datenqualität ausreichend",
            "rote Linien sichtbar und nicht durch Durchschnittswerte verdeckt",
        ],
        "no_score_text": "Kein Gesamtwert: Datenabdeckung reicht für eine belastbare Gesamtaussage nicht aus.",
        "non_compensation": "Kritische Schäden bleiben sichtbar und können Gesamtwerte begrenzen.",
    }
    todo = """# Wirkungskompass Beta TODO

- Provider-Importer als versionierte Snapshot-Jobs bauen, nicht als Live-Scraper im Seitenaufruf.
- Indikatorkatalog für LWK-DE, EWK-EU27 und WWK-193 fachlich finalisieren.
- Mindestdatenabdeckung pro Dimension und rote Linien je Vergleichsebene festlegen.
- Demokratie-/SDG+-Proxyquellen lizenzrechtlich und methodisch prüfen.
- Zielpfade für Bundesländer, EU-27 und Weltstaaten fachlich validieren.
- Vergleichsgruppen für WWK-193 um SIDS und Income Groups ergänzen.
- REST-Countries-Metadaten für UN-Sondernamen manuell validieren, falls Match fehlt.
"""
    write_json("provider-registry.json", provider_registry)
    write_json("territorial-data-model.schema.json", data_model)
    write_json("scoring-method.territorial-beta.json", scoring)
    (OUT / "TODO.md").write_text(todo, encoding="utf-8")
    print(f"wrote {(OUT / 'TODO.md').relative_to(ROOT)}", flush=True)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    write_json("entities.lwk-de.json", build_lwk())
    write_json("entities.ewk-eu27.json", build_ewk())
    write_json("entities.wwk-193.json", build_wwk())
    write_support_files()


if __name__ == "__main__":
    main()
