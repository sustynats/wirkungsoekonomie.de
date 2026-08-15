#!/usr/bin/env python3
"""Import versioned territorial Wirkungskompass snapshots.

The public pages never call provider APIs directly. This script fetches public
data into static JSON snapshots with source, retrieval date and data quality.
It deliberately imports observations only; it does not calculate public scores.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "wirkungskompass"
SNAPSHOT_DIR = DATA_DIR / "snapshots"
CATALOG_PATH = DATA_DIR / "indicator-catalog.territorial-beta.json"
MANIFEST_PATH = DATA_DIR / "snapshot-manifest.json"

EUROSTAT_BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data"
WORLD_BANK_BASE = "https://api.worldbank.org/v2"
UNSDG_BASE = "https://unstats.un.org/sdgs/UNSDGAPIV5/v1/sdg"
EUROSTAT_GEO_ALIASES = {"GR": "EL"}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2, sort_keys=False)
        handle.write("\n")


def request_json(url: str, *, retries: int = 3, pause: float = 0.8) -> Any:
    headers = {"User-Agent": "wirkungsoekonomie-snapshot-importer/0.2"}
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            request = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(request, timeout=45) as response:
                return json.load(response)
        except Exception as exc:  # pragma: no cover - network guard
            last_error = exc
            if attempt + 1 < retries:
                time.sleep(pause * (attempt + 1))
    raise RuntimeError(f"Provider request failed: {url}") from last_error


def normalize(value: str | None) -> str:
    if not value:
        return ""
    text = unicodedata.normalize("NFD", value.casefold())
    return "".join(char for char in text if unicodedata.category(char) != "Mn")


def catalog_indicators(provider: str) -> list[dict[str, Any]]:
    catalog = read_json(CATALOG_PATH)
    return [
        item
        for item in catalog.get("indicators", [])
        if item.get("source_provider") == provider
    ]


def load_universe(filename: str) -> dict[str, Any]:
    return read_json(DATA_DIR / filename)


def observation_id(*parts: Any) -> str:
    digest = hashlib.sha1("|".join(str(part) for part in parts).encode("utf-8")).hexdigest()
    return f"obs-{digest[:16]}"


def as_number(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(parsed):
        return None
    return parsed


def year_range(start: int, end: int) -> list[str]:
    if start > end:
        raise ValueError("--start-year must be <= --end-year")
    return [str(year) for year in range(start, end + 1)]


def jsonstat_category_codes(dataset: dict[str, Any], dimension_id: str) -> list[str]:
    category = dataset["dimension"][dimension_id].get("category", {})
    labels = category.get("label", {})
    indexes = category.get("index")
    if isinstance(indexes, dict):
        return [code for code, _ in sorted(indexes.items(), key=lambda item: item[1])]
    return list(labels.keys())


def jsonstat_flat_to_coords(index: int, sizes: list[int]) -> list[int]:
    coords = [0] * len(sizes)
    remaining = index
    for pos in range(len(sizes) - 1, -1, -1):
        size = sizes[pos]
        coords[pos] = remaining % size
        remaining //= size
    return coords


def iter_jsonstat_values(dataset: dict[str, Any]) -> list[dict[str, Any]]:
    ids = dataset.get("id", [])
    sizes = dataset.get("size", [])
    code_lists = {dimension_id: jsonstat_category_codes(dataset, dimension_id) for dimension_id in ids}
    values = dataset.get("value", {})
    rows: list[dict[str, Any]] = []
    for flat, raw_value in values.items():
        coords = jsonstat_flat_to_coords(int(flat), sizes)
        dimensions = {
            dimension_id: code_lists[dimension_id][coords[pos]]
            for pos, dimension_id in enumerate(ids)
        }
        rows.append({"dimensions": dimensions, "value": raw_value})
    return rows


def build_snapshot(
    *,
    snapshot_id: str,
    universe: dict[str, Any],
    provider_id: str,
    provider_title: str,
    source_url: str,
    license_note: str,
    observations: list[dict[str, Any]],
    indicators: list[dict[str, Any]],
    import_report: dict[str, Any] | None = None,
) -> dict[str, Any]:
    entity_ids = sorted({item["entity_id"] for item in observations})
    years = sorted({int(item["year"]) for item in observations if str(item.get("year", "")).isdigit()})
    entity_counts: dict[str, int] = {}
    for item in observations:
        entity_counts[item["entity_id"]] = entity_counts.get(item["entity_id"], 0) + 1
    return {
        "snapshot_id": snapshot_id,
        "universe_id": universe["universe_id"],
        "shortname": universe["shortname"],
        "method_version": "territorial-compass-beta-0.2",
        "imported_at": utc_now(),
        "provider_id": provider_id,
        "provider_title": provider_title,
        "source_url": source_url,
        "license": license_note,
        "score_ready": False,
        "score_note": "Rohbeobachtungen importiert. Keine Scores, keine Rankings und keine Gesamtwerte ohne fachlich validierte Normalisierung und Mindestdatenabdeckung.",
        "indicator_count": len({item["indicator_id"] for item in observations}),
        "observation_count": len(observations),
        "entity_count": len(entity_ids),
        "entity_observation_counts": entity_counts,
        "years": years,
        "indicators": [
            {
                "indicator_id": item["indicator_id"],
                "name": item["name"],
                "dimension": item["dimension"],
                "source_provider": item["source_provider"],
                "source_dataset": item["source_dataset"],
                "unit": item.get("unit"),
                "polarity": item.get("polarity"),
                "source_url": item.get("source_url")
            }
            for item in indicators
        ],
        "observations": observations,
        "import_report": import_report or {}
    }


def update_manifest(snapshot_path: Path, snapshot: dict[str, Any]) -> None:
    manifest = read_json(MANIFEST_PATH) if MANIFEST_PATH.exists() else {
        "method_version": "territorial-compass-beta-0.2",
        "generated_at": utc_now(),
        "note": "Manifest fuer versionierte Wirkungskompass-Snapshots.",
        "snapshots": []
    }
    rel_path = snapshot_path.relative_to(ROOT).as_posix()
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
        "score_ready": snapshot["score_ready"],
        "status": "raw_observations_imported" if snapshot["observation_count"] else "no_observations"
    }
    manifest["snapshots"] = [
        item for item in manifest.get("snapshots", [])
        if item.get("snapshot_id") != snapshot["snapshot_id"]
    ]
    manifest["snapshots"].append(entry)
    manifest["snapshots"].sort(key=lambda item: (item.get("shortname", ""), item.get("provider_id", "")))
    manifest["generated_at"] = utc_now()
    write_json(MANIFEST_PATH, manifest)


def import_eurostat(args: argparse.Namespace) -> Path:
    universe = load_universe("entities.ewk-eu27.json")
    entities_by_iso2 = {entity["iso2"]: entity for entity in universe["entities"]}
    entities_by_eurostat_geo = {
        EUROSTAT_GEO_ALIASES.get(entity["iso2"], entity["iso2"]): entity
        for entity in universe["entities"]
    }
    indicators = catalog_indicators("eurostat_sdg")
    years = year_range(args.start_year, args.end_year)
    observations: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    geos = sorted(entities_by_eurostat_geo)
    retrieved_at = utc_now()

    for indicator in indicators:
        query: list[tuple[str, str]] = [("lang", "en")]
        for key, value in indicator.get("filters", {}).items():
            query.append((key, value))
        for geo in geos:
            query.append(("geo", geo))
        for year in years:
            query.append(("time", year))
        url = f"{EUROSTAT_BASE}/{indicator['source_dataset']}?{urllib.parse.urlencode(query)}"
        try:
            dataset = request_json(url)
        except Exception as exc:
            failures.append({"indicator_id": indicator["indicator_id"], "error": str(exc)})
            continue
        for row in iter_jsonstat_values(dataset):
            dims = row["dimensions"]
            value = as_number(row["value"])
            entity = entities_by_eurostat_geo.get(dims.get("geo"))
            if not entity or value is None:
                continue
            observations.append({
                "observation_id": observation_id("eurostat", indicator["indicator_id"], entity["entity_id"], dims.get("time")),
                "entity_id": entity["entity_id"],
                "year": int(dims["time"]),
                "indicator_id": indicator["indicator_id"],
                "raw_value": value,
                "unit": indicator.get("unit"),
                "source_id": "eurostat_sdg",
                "source_url": indicator["source_url"],
                "retrieved_at": retrieved_at,
                "license": "Eurostat public data; source and extraction timestamp retained.",
                "data_quality": "official_api_raw_observation",
                "extraction_method": "eurostat_jsonstat_snapshot",
                "confidence": "high",
                "dimension_values": dims,
                "notes": "Rohbeobachtung aus Eurostat SDG API; noch nicht normalisiert."
            })

    snapshot = build_snapshot(
        snapshot_id="ewk-eu27.eurostat-sdg.latest",
        universe=universe,
        provider_id="eurostat_sdg",
        provider_title="Eurostat EU SDG Indicator Set",
        source_url="https://ec.europa.eu/eurostat/web/sdi/database",
        license_note="Eurostat public data; Quelle, Tabellen-ID und Abrufzeit werden im Snapshot gespeichert.",
        observations=observations,
        indicators=indicators,
        import_report={"failures": failures, "years_requested": years}
    )
    path = SNAPSHOT_DIR / "ewk-eu27.eurostat-sdg.latest.json"
    write_json(path, snapshot)
    update_manifest(path, snapshot)
    return path


def chunked(items: list[str], size: int) -> list[list[str]]:
    return [items[index:index + size] for index in range(0, len(items), size)]


def import_world_bank(args: argparse.Namespace) -> Path:
    universe = load_universe("entities.wwk-193.json")
    entities_by_iso3 = {entity["iso3"]: entity for entity in universe["entities"] if entity.get("iso3")}
    indicators = catalog_indicators("world_bank_wdi")
    years = f"{args.start_year}:{args.end_year}"
    observations: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    retrieved_at = utc_now()
    iso3_codes = sorted(entities_by_iso3)

    for indicator in indicators:
        for batch in chunked(iso3_codes, args.batch_size):
            countries = ";".join(batch)
            url = (
                f"{WORLD_BANK_BASE}/country/{countries}/indicator/{indicator['source_dataset']}"
                f"?format=json&date={years}&per_page=20000"
            )
            try:
                payload = request_json(url)
            except Exception as exc:
                failures.append({"indicator_id": indicator["indicator_id"], "batch": countries, "error": str(exc)})
                continue
            if not isinstance(payload, list) or len(payload) < 2 or not isinstance(payload[1], list):
                failures.append({"indicator_id": indicator["indicator_id"], "batch": countries, "error": "unexpected payload"})
                continue
            for item in payload[1]:
                value = as_number(item.get("value"))
                iso3 = item.get("countryiso3code")
                entity = entities_by_iso3.get(iso3)
                if not entity or value is None:
                    continue
                observations.append({
                    "observation_id": observation_id("worldbank", indicator["indicator_id"], entity["entity_id"], item.get("date")),
                    "entity_id": entity["entity_id"],
                    "year": int(item["date"]),
                    "indicator_id": indicator["indicator_id"],
                    "raw_value": value,
                    "unit": indicator.get("unit") or item.get("unit") or "",
                    "source_id": "world_bank_wdi",
                    "source_url": indicator["source_url"],
                    "retrieved_at": retrieved_at,
                    "license": "World Bank Open Data API; source indicator and extraction timestamp retained.",
                    "data_quality": "official_api_raw_observation",
                    "extraction_method": "world_bank_indicators_api_snapshot",
                    "confidence": "high",
                    "dimension_values": {
                        "countryiso3code": iso3,
                        "country": item.get("country", {}).get("value"),
                        "indicator": item.get("indicator", {}).get("id")
                    },
                    "notes": "Rohbeobachtung aus World Bank WDI API; noch nicht normalisiert."
                })

    snapshot = build_snapshot(
        snapshot_id="wwk-193.world-bank-wdi.latest",
        universe=universe,
        provider_id="world_bank_wdi",
        provider_title="World Bank World Development Indicators",
        source_url="https://api.worldbank.org/v2",
        license_note="World Bank Open Data API; Quelle, Indikator-ID und Abrufzeit werden im Snapshot gespeichert.",
        observations=observations,
        indicators=indicators,
        import_report={"failures": failures, "years_requested": years}
    )
    path = SNAPSHOT_DIR / "wwk-193.world-bank-wdi.latest.json"
    write_json(path, snapshot)
    update_manifest(path, snapshot)
    return path


def import_unsdg(args: argparse.Namespace) -> Path:
    universe = load_universe("entities.wwk-193.json")
    indicators = catalog_indicators("un_global_sdg")
    retrieved_at = utc_now()
    observations: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []

    geo_list = request_json(f"{UNSDG_BASE}/GeoArea/List")
    geo_by_name = {normalize(item.get("geoAreaName")): item for item in geo_list}
    entity_geo_codes: dict[str, str] = {}
    unmatched: list[str] = []
    for entity in universe["entities"]:
        match = geo_by_name.get(normalize(entity.get("name"))) or geo_by_name.get(normalize(entity.get("official_name")))
        if match:
            entity_geo_codes[entity["entity_id"]] = str(match["geoAreaCode"])
        else:
            unmatched.append(entity["name"])

    entity_by_id = {entity["entity_id"]: entity for entity in universe["entities"]}
    code_to_entity = {code: entity_by_id[entity_id] for entity_id, code in entity_geo_codes.items()}

    for indicator in indicators:
        series = indicator["source_dataset"]
        for entity_id, geo_code in entity_geo_codes.items():
            query = {
                "seriesCode": series,
                "areaCode": geo_code,
                "timePeriodStart": str(args.start_year),
                "timePeriodEnd": str(args.end_year),
                "pageSize": "200"
            }
            url = f"{UNSDG_BASE}/Series/Data?{urllib.parse.urlencode(query)}"
            try:
                payload = request_json(url)
            except Exception as exc:
                failures.append({"indicator_id": indicator["indicator_id"], "geoAreaCode": geo_code, "error": str(exc)})
                continue
            for item in payload.get("data", []):
                entity = code_to_entity.get(str(item.get("geoAreaCode")))
                value = as_number(item.get("value"))
                year = item.get("timePeriodStart")
                if not entity or value is None or not year:
                    continue
                observations.append({
                    "observation_id": observation_id("unsdg", indicator["indicator_id"], entity["entity_id"], year),
                    "entity_id": entity["entity_id"],
                    "year": int(year),
                    "indicator_id": indicator["indicator_id"],
                    "raw_value": value,
                    "unit": indicator.get("unit"),
                    "source_id": "un_global_sdg",
                    "source_url": indicator["source_url"],
                    "retrieved_at": retrieved_at,
                    "license": "UN Global SDG Indicators Database API; source series and extraction timestamp retained.",
                    "data_quality": "official_api_raw_observation",
                    "extraction_method": "unsdg_api_snapshot",
                    "confidence": "medium",
                    "dimension_values": {
                        "geoAreaCode": item.get("geoAreaCode"),
                        "geoAreaName": item.get("geoAreaName"),
                        "series": item.get("series"),
                        "attributes": item.get("attributes", {}),
                        "dimensions": item.get("dimensions", {})
                    },
                    "notes": "Rohbeobachtung aus UN SDG API; noch nicht normalisiert. Confidence medium wegen Namensmapping UN-GeoArea zu WWK-193."
                })

    snapshot = build_snapshot(
        snapshot_id="wwk-193.un-sdg.latest",
        universe=universe,
        provider_id="un_global_sdg",
        provider_title="UN Global SDG Indicators Database",
        source_url="https://unstats.un.org/sdgs/dataportal/database",
        license_note="UN Global SDG Indicators Database API; Quelle, Serien-ID und Abrufzeit werden im Snapshot gespeichert.",
        observations=observations,
        indicators=indicators,
        import_report={"failures": failures, "unmatched_entities": unmatched[:40], "unmatched_count": len(unmatched)}
    )
    path = SNAPSHOT_DIR / "wwk-193.un-sdg.latest.json"
    write_json(path, snapshot)
    update_manifest(path, snapshot)
    return path


def import_lwk_csv(args: argparse.Namespace) -> Path:
    universe = load_universe("entities.lwk-de.json")
    valid_entities = {entity["entity_id"] for entity in universe["entities"]}
    retrieved_at = utc_now()
    observations: list[dict[str, Any]] = []
    skipped: list[dict[str, str]] = []
    source_path = Path(args.csv_path)
    with source_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            entity_id = row.get("entity_id", "")
            value = as_number(row.get("raw_value"))
            if entity_id not in valid_entities or value is None:
                skipped.append({"entity_id": entity_id, "indicator_id": row.get("indicator_id", ""), "reason": "unknown entity or empty raw_value"})
                continue
            observations.append({
                "observation_id": observation_id("lwk-csv", row.get("indicator_id"), entity_id, row.get("year"), value),
                "entity_id": entity_id,
                "year": int(row["year"]),
                "indicator_id": row["indicator_id"],
                "raw_value": value,
                "unit": row.get("unit", ""),
                "source_id": row.get("source_id", "manual_lwk_snapshot"),
                "source_url": row.get("source_url", ""),
                "retrieved_at": row.get("retrieved_at") or retrieved_at,
                "license": row.get("license", "Quelle im CSV-Snapshot dokumentieren."),
                "data_quality": row.get("data_quality", "manual_official_snapshot"),
                "extraction_method": "lwk_csv_snapshot",
                "confidence": "medium",
                "dimension_values": {},
                "notes": row.get("notes", "Aus amtlicher Quelle in LWK-DE-CSV-Snapshot ueberfuehrt.")
            })

    indicators = [
        {
            "indicator_id": item["indicator_id"],
            "name": item["indicator_id"],
            "dimension": "unmapped",
            "source_provider": "manual_lwk_snapshot",
            "source_dataset": source_path.name,
            "unit": item.get("unit", ""),
            "polarity": "method_review_required",
            "source_url": item.get("source_url", "")
        }
        for item in observations
    ]
    snapshot = build_snapshot(
        snapshot_id="lwk-de.manual.latest",
        universe=universe,
        provider_id="manual_lwk_snapshot",
        provider_title="LWK-DE amtlicher CSV-Snapshot",
        source_url=source_path.as_posix(),
        license_note="Lizenz und Quelle pro Beobachtung im CSV-Snapshot dokumentiert.",
        observations=observations,
        indicators=indicators,
        import_report={"skipped": skipped}
    )
    path = SNAPSHOT_DIR / "lwk-de.manual.latest.json"
    write_json(path, snapshot)
    update_manifest(path, snapshot)
    return path


def validate_snapshots(_: argparse.Namespace) -> None:
    manifest = read_json(MANIFEST_PATH)
    errors: list[str] = []
    for entry in manifest.get("snapshots", []):
        path = ROOT / entry["path"]
        if not path.exists():
            errors.append(f"Missing snapshot file: {entry['path']}")
            continue
        snapshot = read_json(path)
        if snapshot.get("observation_count") != len(snapshot.get("observations", [])):
            errors.append(f"Observation count mismatch: {entry['path']}")
        if snapshot.get("score_ready") is not False:
            errors.append(f"Snapshot must not claim score readiness yet: {entry['path']}")
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        raise SystemExit(1)
    print(f"OK: {len(manifest.get('snapshots', []))} snapshot entries validated.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    eurostat = sub.add_parser("ewk-eurostat", help="Import EWK-EU27 observations from Eurostat SDG API.")
    eurostat.add_argument("--start-year", type=int, default=2015)
    eurostat.add_argument("--end-year", type=int, default=2024)

    world_bank = sub.add_parser("wwk-worldbank", help="Import WWK-193 observations from World Bank WDI API.")
    world_bank.add_argument("--start-year", type=int, default=2015)
    world_bank.add_argument("--end-year", type=int, default=2024)
    world_bank.add_argument("--batch-size", type=int, default=45)

    unsdg = sub.add_parser("wwk-unsdg", help="Import WWK-193 observations from UN SDG API.")
    unsdg.add_argument("--start-year", type=int, default=2015)
    unsdg.add_argument("--end-year", type=int, default=2024)

    lwk = sub.add_parser("lwk-csv", help="Import LWK-DE observations from a versioned official CSV snapshot.")
    lwk.add_argument("csv_path")

    sub.add_parser("validate", help="Validate local snapshot manifest and files.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    if args.command == "ewk-eurostat":
        path = import_eurostat(args)
        print(path.relative_to(ROOT))
    elif args.command == "wwk-worldbank":
        path = import_world_bank(args)
        print(path.relative_to(ROOT))
    elif args.command == "wwk-unsdg":
        path = import_unsdg(args)
        print(path.relative_to(ROOT))
    elif args.command == "lwk-csv":
        path = import_lwk_csv(args)
        print(path.relative_to(ROOT))
    elif args.command == "validate":
        validate_snapshots(args)


if __name__ == "__main__":
    main()
