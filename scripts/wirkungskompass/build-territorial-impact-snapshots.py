#!/usr/bin/env python3
"""Build source-bound impact-data snapshots for territorial Wirkungskompass pages.

The public pages must not call provider APIs directly. This script imports
official/raw observations into static JSON snapshots. It does not calculate
public scores, rankings or overall profiles.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import math
import time
import unicodedata
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "wirkungskompass"
SNAPSHOT_DIR = DATA_DIR / "snapshots"
MANIFEST_PATH = DATA_DIR / "snapshot-manifest.json"

REGIONALATLAS_URL = "https://www.gis-idmz.nrw.de/arcgis/rest/services/stba/regionalatlas/MapServer/dynamicLayer/query"
WORLD_BANK_BASE = "https://api.worldbank.org/v2"
WGI_CSV_ZIP_URL = "https://databank.worldbank.org/data/download/WGI_CSV.zip"

LWK_INDICATORS = [
    ("lwk_ra_ai0301", "Anteil betreute Kinder 0-2 Jahre in Tageseinrichtungen", "mensch", "Bildung / Betreuung", "AI003-1", "AI0301", "Prozent", "higher_is_better"),
    ("lwk_ra_ai0305", "Anteil Schulabgänger:innen ohne Hauptschulabschluss", "mensch", "Bildung", "AI003-2", "AI0305", "Prozent", "lower_is_better"),
    ("lwk_ra_ai0710", "Beschäftigtenquote", "mensch", "Arbeit", "AI007-2", "AI0710", "Prozent", "higher_is_better"),
    ("lwk_ra_ai0801", "Arbeitslosenquote", "mensch", "Arbeit", "AI008-1-5", "AI0801", "Prozent", "lower_is_better"),
    ("lwk_ra_ai0808", "Anteil Langzeitarbeitslose an Arbeitslosen insgesamt", "mensch", "Arbeit", "AI008-1-5", "AI0808", "Prozent", "lower_is_better"),
    ("lwk_ra_ai1401", "Krankenhausbettendichte", "mensch", "Gesundheit", "AI014-1", "AI1401", "Betten je 1.000 EW", "higher_is_better"),
    ("lwk_ra_ai1601", "Verfügbares Einkommen pro Kopf", "mensch", "Einkommen", "AI016-1", "AI1601", "EUR", "higher_is_better"),
    ("lwk_ra_ai0106", "Anteil der Fläche für Siedlung an Gesamtfläche", "planet", "Fläche / Siedlung", "AI001-2-5", "AI0106", "Prozent", "lower_is_better"),
    ("lwk_ra_ai0107", "Anteil der Fläche für Verkehr an Gesamtfläche", "planet", "Fläche / Verkehr", "AI001-2-5", "AI0107", "Prozent", "lower_is_better"),
    ("lwk_ra_ai0109", "Anteil der Fläche für Wald an Gesamtfläche", "planet", "Fläche / Wald", "AI001-2-5", "AI0109", "Prozent", "higher_is_better"),
    ("lwk_ra_ai0111", "Anteil Siedlungs- und Verkehrsfläche an Gesamtfläche", "planet", "Fläche / Versiegelungsdruck", "AI001-2-5", "AI0111", "Prozent", "lower_is_better"),
    ("lwk_ra_ai1901", "Haushaltsabfälle je Einwohner:in", "planet", "Abfall", "AI019", "AI1901", "kg", "lower_is_better"),
    ("lwk_ra_ai1908", "Wasserabgabe je Einwohner:in und Tag", "planet", "Wasser", "AI019-2", "AI1908", "Liter", "lower_is_better"),
    ("lwk_ra_ai0506", "Wahlbeteiligung Bundestagswahl", "demokratie", "Wahlbeteiligung", "AI005", "AI0506", "Prozent", "higher_is_better"),
    ("lwk_ra_ai0606", "Wahlbeteiligung Europawahl", "demokratie", "Wahlbeteiligung", "AI006", "AI0606", "Prozent", "higher_is_better"),
    ("lwk_ra_ai1501", "Beschäftigte öffentlicher Bereich je 1.000 Einwohner:innen", "demokratie", "Öffentliche Infrastruktur", "AI015", "AI1501", "Anzahl", "context"),
]

WGI_INDICATORS = [
    ("voice_accountability", "GOV_WGI_VA.EST", "Voice and Accountability", "demokratie", "Demokratie / Beteiligung", "estimate"),
    ("rule_of_law", "GOV_WGI_RL.EST", "Rule of Law", "demokratie", "Rechtsstaatlichkeit", "estimate"),
    ("control_corruption", "GOV_WGI_CC.EST", "Control of Corruption", "demokratie", "Korruptionskontrolle", "estimate"),
    ("political_stability", "GOV_WGI_PV.EST", "Political Stability and Absence of Violence/Terrorism", "demokratie", "Stabilität / Gewaltfreiheit", "estimate"),
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize(value: str | None) -> str:
    if not value:
        return ""
    text = unicodedata.normalize("NFD", value.casefold())
    return "".join(char for char in text if unicodedata.category(char) != "Mn")


def stable_id(*parts: Any) -> str:
    return hashlib.sha1("|".join("" if part is None else str(part) for part in parts).encode("utf-8")).hexdigest()[:16]


def as_number(value: Any) -> float | None:
    if value in (None, ""):
        return None
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(parsed):
        return None
    return parsed


def request_json(url: str, retries: int = 3) -> Any:
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "wirkungsoekonomie-territorial-impact-importer/0.1"})
            with urllib.request.urlopen(req, timeout=60) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as exc:
            last_error = exc
            if attempt + 1 < retries:
                time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f"Provider request failed: {url}") from last_error


def load_universe(filename: str) -> dict[str, Any]:
    return read_json(DATA_DIR / filename)


def build_snapshot(
    *,
    snapshot_id: str,
    universe: dict[str, Any],
    provider_id: str,
    provider_title: str,
    source_url: str,
    license_note: str,
    indicators: list[dict[str, Any]],
    observations: list[dict[str, Any]],
    import_report: dict[str, Any] | None = None,
) -> dict[str, Any]:
    entity_counts: dict[str, int] = {}
    for observation in observations:
        entity_counts[observation["entity_id"]] = entity_counts.get(observation["entity_id"], 0) + 1
    return {
        "snapshot_id": snapshot_id,
        "universe_id": universe["universe_id"],
        "shortname": universe["shortname"],
        "method_version": "territorial-compass-impact-data-0.1",
        "imported_at": utc_now(),
        "provider_id": provider_id,
        "provider_title": provider_title,
        "source_url": source_url,
        "license": license_note,
        "score_ready": False,
        "score_note": "Rohbeobachtungen importiert. Keine Rankings, keine Gesamtwerte und keine automatische Entscheidung ohne fachliche Normalisierung und Mindestabdeckung.",
        "indicator_count": len({item["indicator_id"] for item in observations}),
        "observation_count": len(observations),
        "entity_count": len(entity_counts),
        "entity_observation_counts": entity_counts,
        "years": sorted({int(item["year"]) for item in observations}),
        "indicators": indicators,
        "observations": observations,
        "import_report": import_report or {},
    }


def update_manifest(path: Path, snapshot: dict[str, Any]) -> None:
    manifest = read_json(MANIFEST_PATH) if MANIFEST_PATH.exists() else {
        "method_version": "territorial-compass-impact-data-0.1",
        "generated_at": utc_now(),
        "note": "Manifest fuer versionierte Wirkungskompass-Snapshots.",
        "snapshots": [],
    }
    rel_path = path.relative_to(ROOT).as_posix()
    entry = {
        "snapshot_id": snapshot["snapshot_id"],
        "universe_id": snapshot["universe_id"],
        "shortname": snapshot["shortname"],
        "path": rel_path,
        "provider_id": snapshot["provider_id"],
        "provider_title": snapshot["provider_title"],
        "imported_at": snapshot["imported_at"],
        "source_url": snapshot["source_url"],
        "license": snapshot["license"],
        "indicator_count": snapshot["indicator_count"],
        "observation_count": snapshot["observation_count"],
        "entity_count": snapshot["entity_count"],
        "entity_observation_counts": snapshot["entity_observation_counts"],
        "years": snapshot["years"],
        "score_ready": False,
        "status": "raw_observations_imported" if snapshot["observation_count"] else "no_observations",
    }
    manifest["snapshots"] = [item for item in manifest.get("snapshots", []) if item.get("snapshot_id") != snapshot["snapshot_id"]]
    manifest["snapshots"].append(entry)
    manifest["snapshots"].sort(key=lambda item: (item.get("shortname", ""), item.get("provider_id", "")))
    manifest["generated_at"] = utc_now()
    write_json(MANIFEST_PATH, manifest)


def regionalatlas_query(table_code: str, year: int) -> dict[str, Any]:
    table_name = table_code.lower().replace("-", "_")
    layer = {
        "source": {
            "dataSource": {
                "geometryType": "esriGeometryPolygon",
                "workspaceId": "gdb",
                "query": (
                    f"SELECT * FROM verwaltungsgrenzen_gesamt LEFT OUTER JOIN {table_name} "
                    f"ON ags = ags2 and jahr = jahr2 WHERE typ = 1 AND jahr = {year} "
                    f"AND (jahr2 = {year} OR jahr2 IS NULL)"
                ),
                "oidFields": "id",
                "spatialReference": {"wkid": 25832},
                "type": "queryTable",
            },
            "type": "dataLayer",
        }
    }
    params = {
        "layer": json.dumps(layer, separators=(",", ":")),
        "f": "json",
        "outFields": "*",
        "returnGeometry": "false",
        "spatialRel": "esriSpatialRelIntersects",
        "where": "1=1",
    }
    return request_json(f"{REGIONALATLAS_URL}?{urllib.parse.urlencode(params)}")


def build_lwk(args: argparse.Namespace) -> Path:
    universe = load_universe("entities.lwk-de.json")
    by_name = {normalize(entity["name"]): entity for entity in universe["entities"]}
    retrieved_at = utc_now()
    observations: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    indicators = [
        {
            "indicator_id": indicator_id,
            "name": name,
            "dimension": dimension,
            "subdimension": subdimension,
            "source_provider": "regionalatlas_de",
            "source_dataset": table_code,
            "source_field": field_code,
            "unit": unit,
            "polarity": polarity,
            "source_url": "https://regionalatlas.statistikportal.de/",
        }
        for indicator_id, name, dimension, subdimension, table_code, field_code, unit, polarity in LWK_INDICATORS
    ]

    for year in range(args.start_year, args.end_year + 1):
        table_codes = sorted({item[4] for item in LWK_INDICATORS})
        for table_code in table_codes:
            try:
                payload = regionalatlas_query(table_code, year)
            except Exception as exc:
                failures.append({"year": str(year), "table_code": table_code, "error": str(exc)})
                continue
            features = payload.get("features", [])
            for feature in features:
                attrs = feature.get("attributes", {})
                entity = by_name.get(normalize(attrs.get("gen")))
                if not entity:
                    continue
                for indicator_id, name, dimension, _sub, source_table, field_code, unit, _polarity in LWK_INDICATORS:
                    if source_table != table_code:
                        continue
                    value = as_number(attrs.get(field_code.lower()))
                    if value is None:
                        continue
                    observations.append({
                        "observation_id": f"obs-{stable_id('regionalatlas', indicator_id, entity['entity_id'], year, value)}",
                        "entity_id": entity["entity_id"],
                        "year": year,
                        "indicator_id": indicator_id,
                        "raw_value": value,
                        "unit": unit,
                        "source_id": "regionalatlas_de",
                        "source_url": f"https://regionalatlas.statistikportal.de/?BL=DE&TCode={source_table}&ICode={field_code}",
                        "retrieved_at": retrieved_at,
                        "license": "Regionalatlas Deutschland / Regionaldatenbank Deutschland; API-Abruf mit Quellenfeld, Jahr und Tabellenkennung dokumentiert.",
                        "data_quality": "official_api_raw_observation",
                        "extraction_method": "regionalatlas_dynamiclayer_snapshot",
                        "confidence": "high",
                        "dimension_values": {"ags": attrs.get("ags"), "name": attrs.get("gen"), "table": source_table, "field": field_code},
                        "notes": "Rohbeobachtung aus dem Regionalatlas Deutschland; noch nicht normalisiert.",
                    })

    snapshot = build_snapshot(
        snapshot_id="lwk-de.regionalatlas.latest",
        universe=universe,
        provider_id="regionalatlas_de",
        provider_title="Regionalatlas Deutschland / Regionaldatenbank",
        source_url="https://regionalatlas.statistikportal.de/",
        license_note="Regionalatlas Deutschland der Statistischen Ämter des Bundes und der Länder; Quellenpfad je Beobachtung dokumentiert.",
        indicators=indicators,
        observations=observations,
        import_report={"failures": failures, "years_requested": [args.start_year, args.end_year]},
    )
    path = SNAPSHOT_DIR / "lwk-de.regionalatlas.latest.json"
    write_json(path, snapshot)
    update_manifest(path, snapshot)
    return path


def build_wgi(args: argparse.Namespace, universe_file: str, snapshot_id: str) -> Path:
    universe = load_universe(universe_file)
    by_iso3 = {entity["iso3"]: entity for entity in universe["entities"] if entity.get("iso3")}
    retrieved_at = utc_now()
    observations: list[dict[str, Any]] = []
    indicators: list[dict[str, Any]] = []
    prefix = "ewk_wb_wgi" if universe["shortname"] == "EWK-EU27" else "wwk_wb_wgi"

    req = urllib.request.Request(WGI_CSV_ZIP_URL, headers={"User-Agent": "wirkungsoekonomie-territorial-impact-importer/0.1"})
    archive_bytes = urllib.request.urlopen(req, timeout=90).read()
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        rows = list(csv.DictReader(io.TextIOWrapper(archive.open("WGICSV.csv"), encoding="utf-8-sig")))

    wanted_codes = {code for _slug, code, _name, _dimension, _sub, _unit in WGI_INDICATORS}
    wanted_years = [str(year) for year in range(args.start_year, args.end_year + 1)]
    meta_by_code = {code: (slug, name, dimension, subdimension, unit) for slug, code, name, dimension, subdimension, unit in WGI_INDICATORS}

    for slug, wb_code, name, dimension, subdimension, unit in WGI_INDICATORS:
        indicator_id = f"{prefix}_{slug}"
        indicators.append({
            "indicator_id": indicator_id,
            "name": name,
            "dimension": dimension,
            "subdimension": subdimension,
            "source_provider": "world_bank_wgi",
            "source_dataset": wb_code,
            "unit": unit,
            "polarity": "higher_is_better",
            "source_url": WGI_CSV_ZIP_URL,
        })

    for row in rows:
        code = row.get("Indicator Code")
        entity = by_iso3.get(row.get("Country Code"))
        if code not in wanted_codes or not entity:
            continue
        slug, _name, _dimension, _subdimension, unit = meta_by_code[code]
        indicator_id = f"{prefix}_{slug}"
        for year in wanted_years:
            value = as_number(row.get(year))
            if value is None:
                continue
            observations.append({
                "observation_id": f"obs-{stable_id('worldbank-wgi', indicator_id, entity['entity_id'], year, value)}",
                "entity_id": entity["entity_id"],
                "year": int(year),
                "indicator_id": indicator_id,
                "raw_value": value,
                "unit": unit,
                "source_id": "world_bank_wgi",
                "source_url": WGI_CSV_ZIP_URL,
                "retrieved_at": retrieved_at,
                "license": "World Bank Worldwide Governance Indicators bulk CSV; CC BY 4.0.",
                "data_quality": "provider_model_raw_observation",
                "extraction_method": "world_bank_wgi_bulk_csv_snapshot",
                "confidence": "medium",
                "dimension_values": {"countryiso3code": row.get("Country Code"), "country": row.get("Country Name"), "indicator": code},
                "notes": "Governance-Rohwert aus World Bank WGI. Modell-/Sekundärindikator, daher nicht als amtliche Demokratiebewertung lesen.",
            })

    snapshot = build_snapshot(
        snapshot_id=snapshot_id,
        universe=universe,
        provider_id="world_bank_wgi",
        provider_title="World Bank Worldwide Governance Indicators",
        source_url=WGI_CSV_ZIP_URL,
        license_note="World Bank WGI via API; Modell-/Sekundärindikatoren mit Datenqualität C/medium.",
        indicators=indicators,
        observations=observations,
        import_report={"years_requested": [args.start_year, args.end_year], "rows_in_bulk_file": len(rows)},
    )
    path = SNAPSHOT_DIR / f"{snapshot_id}.json"
    write_json(path, snapshot)
    update_manifest(path, snapshot)
    return path


def validate(_: argparse.Namespace) -> None:
    manifest = read_json(MANIFEST_PATH)
    errors: list[str] = []
    for entry in manifest.get("snapshots", []):
        path = ROOT / entry["path"]
        if not path.exists():
            errors.append(f"Missing snapshot: {entry['path']}")
            continue
        snapshot = read_json(path)
        if snapshot.get("observation_count") != len(snapshot.get("observations", [])):
            errors.append(f"Observation count mismatch: {entry['path']}")
        if snapshot.get("score_ready") is not False:
            errors.append(f"Snapshot must not be score-ready: {entry['path']}")
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"OK: {len(manifest.get('snapshots', []))} snapshots validated.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    lwk = sub.add_parser("lwk-regionalatlas")
    lwk.add_argument("--start-year", type=int, default=2019)
    lwk.add_argument("--end-year", type=int, default=2022)
    ewk = sub.add_parser("ewk-wgi")
    ewk.add_argument("--start-year", type=int, default=2015)
    ewk.add_argument("--end-year", type=int, default=2024)
    ewk.add_argument("--batch-size", type=int, default=27)
    wwk = sub.add_parser("wwk-wgi")
    wwk.add_argument("--start-year", type=int, default=2015)
    wwk.add_argument("--end-year", type=int, default=2024)
    wwk.add_argument("--batch-size", type=int, default=45)
    sub.add_parser("validate")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    if args.command == "lwk-regionalatlas":
        print(build_lwk(args).relative_to(ROOT))
    elif args.command == "ewk-wgi":
        print(build_wgi(args, "entities.ewk-eu27.json", "ewk-eu27.world-bank-governance.latest").relative_to(ROOT))
    elif args.command == "wwk-wgi":
        print(build_wgi(args, "entities.wwk-193.json", "wwk-193.world-bank-governance.latest").relative_to(ROOT))
    elif args.command == "validate":
        validate(args)


if __name__ == "__main__":
    main()
