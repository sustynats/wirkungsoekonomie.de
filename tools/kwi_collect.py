#!/usr/bin/env python3
"""Collect municipal SDG data for the KWI beta.

The website is static, and sdg-portal.de does not expose CORS headers for
browser-side use. This script creates local JSON snapshots that can be served
from wirkungsoekonomie.de and consumed by the beta page.
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import math
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path


SDG_PORTAL = "https://sdg-portal.de"
SEARCH_URL = f"{SDG_PORTAL}/de/api/municipalities.json?data=1&q={{query}}"
PNK_PORTAL = "https://nachhaltigekommunen.de"
PNK_ORGANIZATION_ID = "b7e4c3a0-0847-4016-8db2-1e4949006491"
PNK_SEARCH_URL = (
    f"{PNK_PORTAL}/container?organization={PNK_ORGANIZATION_ID}"
    "&payloadType=organizational_unit&terms={query}&limit=10"
)
ROOT = Path(__file__).resolve().parents[1]
LOCAL_SNAPSHOT_DIR = ROOT / "assets" / "data" / "kwi"
CURRENT_YEAR = dt.date.today().year

SDG_TITLES = {
    1: "Keine Armut",
    2: "Kein Hunger",
    3: "Gesundheit und Wohlergehen",
    4: "Hochwertige Bildung",
    5: "Geschlechtergleichstellung",
    6: "Sauberes Wasser und Sanitaerversorgung",
    7: "Bezahlbare und saubere Energie",
    8: "Menschenwuerdige Arbeit und Wirtschaftswachstum",
    9: "Industrie, Innovation und Infrastruktur",
    10: "Weniger Ungleichheiten",
    11: "Nachhaltige Staedte und Gemeinden",
    12: "Verantwortungsvolle Konsum- und Produktionsmuster",
    13: "Massnahmen zum Klimaschutz",
    14: "Leben unter Wasser",
    15: "Leben an Land",
    16: "Frieden, Gerechtigkeit und starke Institutionen",
    17: "Partnerschaften zur Erreichung der Ziele",
}

DIMENSION_BY_SDG = {
    1: "Mensch",
    2: "Mensch",
    3: "Mensch",
    4: "Mensch",
    5: "Mensch",
    6: "Planet",
    7: "Planet",
    8: "Mensch",
    9: "Mensch",
    10: "Mensch",
    11: "Planet",
    12: "Planet",
    13: "Planet",
    14: "Planet",
    15: "Planet",
    16: "Demokratie",
    17: "Demokratie",
}

DIMENSION_WEIGHTS = {"Mensch": 0.4, "Planet": 0.3, "Demokratie": 0.3}


class MunicipalityNotFoundError(RuntimeError):
    """Raised when neither the SDG search API nor the direct page route resolves."""


class SnapshotExtractionError(RuntimeError):
    """Raised when a municipality page exists but no indicator data can be read."""


class SourceUnavailableError(RuntimeError):
    """Raised when the upstream municipal data source is no longer available."""


def fetch_text(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "wirkungsoekonomie-kwi-beta/0.1 (+https://wirkungsoekonomie.de)",
            "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def strip_tags(value: str) -> str:
    value = re.sub(r"<br\s*/?>", " ", value, flags=re.I)
    value = re.sub(r"</p\s*>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def slugify_name(name: str) -> str:
    slug = name.lower().replace(",", "")
    slug = slug.replace("–", "-").replace("—", "-")
    slug = re.sub(r"[^0-9a-zäöüß]+", "-", slug)
    return slug.strip("-")


def ascii_fold(value: str) -> str:
    return (
        value.lower()
        .replace("ä", "ae")
        .replace("ö", "oe")
        .replace("ü", "ue")
        .replace("ß", "ss")
    )


def plain_fold(value: str) -> str:
    return (
        value.lower()
        .replace("ä", "a")
        .replace("ö", "o")
        .replace("ü", "u")
        .replace("ß", "ss")
    )


def normalized_key(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def search_key(value: str) -> str:
    return normalized_key(ascii_fold(value))


def search_keys(value: str) -> set[str]:
    return {
        normalized_key(value.lower()),
        normalized_key(ascii_fold(value)),
        normalized_key(plain_fold(value)),
    }


def compact_key(value: str) -> str:
    return search_key(value).replace(" ", "")


def trim_municipality_qualifiers(value: str) -> str:
    value = search_key(value)
    qualifiers = [
        "stadt",
        "kreisfreie stadt",
        "universitaetsstadt",
        "landeshauptstadt",
        "hansestadt",
        "kreisstadt",
        "documenta stadt",
        "freie und hansestadt",
    ]
    for qualifier in sorted(qualifiers, key=len, reverse=True):
        value = re.sub(rf"\b{re.escape(qualifier)}\b", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def local_snapshot_candidates(query: str) -> list[tuple[int, dict]]:
    manifest_path = LOCAL_SNAPSHOT_DIR / "municipalities.json"
    if not manifest_path.exists():
        return []
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []

    query_keys = set()
    for key in search_keys(query):
        query_keys.add(key)
        query_keys.add(key.replace(" ", ""))
        trimmed = trim_municipality_qualifiers(key)
        query_keys.add(trimmed)
        query_keys.add(trimmed.replace(" ", ""))
    query_keys = {item for item in query_keys if item}

    matches: list[tuple[int, dict]] = []
    for item in manifest.get("municipalities", []):
        values = [item.get("name", ""), item.get("slug", ""), item.get("file", "")]
        item_keys = set()
        for value in values:
            if not value:
                continue
            for key in search_keys(value):
                item_keys.add(key)
                item_keys.add(key.replace(" ", ""))
                trimmed = trim_municipality_qualifiers(key)
                item_keys.add(trimmed)
                item_keys.add(trimmed.replace(" ", ""))
        item_keys = {key for key in item_keys if key}

        score = 0
        if query_keys & item_keys:
            score = 100
        elif any(q and q in key for q in query_keys for key in item_keys):
            score = 80
        elif any(key and key in q for q in query_keys for key in item_keys):
            score = 70

        if score:
            matches.append((score, item))

    return sorted(matches, key=lambda match: (-match[0], match[1].get("name", "")))


def load_local_snapshot(query: str) -> dict | None:
    for _score, item in local_snapshot_candidates(query):
        file_name = item.get("file")
        if not file_name:
            continue
        path = LOCAL_SNAPSHOT_DIR / file_name
        try:
            snapshot = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        snapshot.setdefault("source", {})
        snapshot["source"]["cache"] = "local_snapshot"
        snapshot["servedAt"] = dt.datetime.now(dt.timezone.utc).isoformat()
        return snapshot
    return None


def portal_slug_candidates(name: str) -> list[str]:
    base = slugify_name(name)
    variants = [
        base,
        base.replace("ä", "a").replace("ö", "o").replace("ü", "u").replace("ß", "ss"),
        base.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss"),
    ]
    seen: set[str] = set()
    candidates = []
    for item in variants:
        if item and item not in seen:
            seen.add(item)
            candidates.append(item)
    return candidates


def extract_municipality_name(page_html: str, fallback: str) -> str:
    headline = re.search(r'<h1[^>]*class="[^"]*headline[^"]*"[^>]*>(.*?)</h1>', page_html, re.S)
    if headline:
        name = strip_tags(headline.group(1)).removeprefix("Kommune").strip()
        if name:
            return name
    title = re.search(r"<title>(.*?)</title>", page_html, re.S | re.I)
    if title:
        name = strip_tags(title.group(1)).replace("- SDG-Portal", "").strip()
        if name:
            return name
    return fallback.strip()


def stable_id(title: str) -> str:
    value = title.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:80] or "indikator"


def parse_number(value: str | None) -> float | None:
    if not value:
        return None
    normalized = value.replace(".", "").replace(",", ".")
    try:
        return float(normalized)
    except ValueError:
        return None


def latest_point(points: list[list[float]]) -> dict[str, float] | None:
    if not points:
        return None
    point = max(points, key=lambda item: item[0])
    return {"year": int(point[0]), "value": float(point[1])}


def clip(value: float, lower: float = 0.0, upper: float = 100.0) -> float:
    return max(lower, min(upper, value))


def trend_adjustment(points: list[list[float]], smaller_is_better: bool) -> float:
    if len(points) < 2:
        return 0.0
    ordered = sorted(points, key=lambda item: item[0])
    first = float(ordered[0][1])
    last = float(ordered[-1][1])
    if first == 0:
        return 0.0
    change = (last - first) / abs(first)
    if smaller_is_better:
        change = -change
    return clip(change * 20.0, -8.0, 8.0)


def beta_score(value: float | None, average: float | None, points: list[list[float]], smaller_is_better: bool) -> float | None:
    if value is None:
        return None
    if average is None or average == 0 or not math.isfinite(average):
        base = 50.0
    else:
        relative = (value - average) / abs(average)
        if smaller_is_better:
            relative = -relative
        base = 50.0 + relative * 35.0
    return round(clip(base + trend_adjustment(points, smaller_is_better)), 1)


def quality_for(year: int | None, source: str | None, has_timeseries: bool) -> str:
    if not year or not source:
        return "niedrig"
    age = CURRENT_YEAR - year
    if age <= 3 and has_timeseries:
        return "hoch"
    if age <= 6:
        return "mittel"
    return "niedrig"


def dimension_for(sdg: int, title: str) -> str:
    # SDG 11 is mixed. Keep a small keyword override for obviously social
    # indicators; otherwise treat it as Planet in this first KWI mapping.
    if sdg == 11 and re.search(r"wohn|miet|nahversorgung|erreichbarkeit|unfall|barriere", title, re.I):
        return "Mensch"
    if sdg == 9 and re.search(r"breitband|existenz|beschaeft|arbeits|wirtschaft", title, re.I):
        return "Mensch"
    return DIMENSION_BY_SDG.get(sdg, "Mensch")


def extract_label(block: str) -> str | None:
    match = re.search(r'<button class="tooltip__icon-button[^>]*>.*?<span class="tooltip__text[^"]*">(.*?)</span>', block, re.S)
    return strip_tags(match.group(1)) if match else None


def extract_detail(block: str, label: str) -> str | None:
    pattern = (
        r'<dialog[^>]+aria-label="'
        + re.escape(html.escape(label, quote=True))
        + r'".*?<div class="tooltip__content u-text">(.*?)</div>\s*</dialog>'
    )
    match = re.search(pattern, block, re.S)
    if not match:
        match = re.search(r'<div class="tooltip__content u-text">(.*?)</div>\s*</dialog>', block, re.S)
    return strip_tags(match.group(1)) if match else None


def detail_part(details: str | None, key: str) -> str | None:
    if not details:
        return None
    parts = re.split(r"(Berechnung:|Aussage:|Quelle\(n\):)", details)
    if len(parts) < 3:
        return None
    values: dict[str, str] = {}
    for index in range(1, len(parts), 2):
        marker = parts[index].replace(":", "")
        values[marker] = parts[index + 1].strip() if index + 1 < len(parts) else ""
    return values.get(key)


def parse_chart(block: str) -> dict | None:
    match = re.search(r'<script class="chart__data" type="application/json">\s*(.*?)\s*</script>', block, re.S)
    if not match:
        return None
    raw = html.unescape(match.group(1)).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def parse_indicators(page_html: str, municipality_name: str) -> list[dict]:
    indicators: list[dict] = []
    articles = re.split(r'<article class="indicator-card">', page_html)
    for article in articles[1:]:
        article = article.split("</article>", 1)[0]
        number_match = re.search(r'<span class="indicator-card__number">(\d+)</span>', article)
        if not number_match:
            continue
        sdg = int(number_match.group(1))
        sdg_title_match = re.search(r'<h2 class="indicator-card__title">(.*?)</h2>', article, re.S)
        sdg_title = strip_tags(sdg_title_match.group(1)) if sdg_title_match else SDG_TITLES.get(sdg, f"SDG {sdg}")
        item_blocks = re.split(r'<div class="indicator-card__item">', article)
        for item in item_blocks[1:]:
            label = extract_label(item)
            if not label or "keine Indikatorendaten" in label.lower():
                continue
            details = extract_detail(item, label)
            chart = parse_chart(item)
            current_match = re.search(r'<span class="indicator-card__current">(.*?)</span>', item, re.S)
            current_value = parse_number(strip_tags(current_match.group(1))) if current_match else None

            municipality_graph = None
            average_graph = None
            if chart:
                for graph in chart.get("graphs", []):
                    if not graph:
                        continue
                    config = graph.get("config", {})
                    if config.get("isAvg"):
                        average_graph = graph
                    else:
                        municipality_graph = graph

            config = (municipality_graph or average_graph or {}).get("config", {})
            smaller_is_better = bool(config.get("smallerIsBetter"))
            unit = config.get("unit")
            points = (municipality_graph or {}).get("points", [])
            avg_points = (average_graph or {}).get("points", [])
            latest = latest_point(points)
            latest_avg = latest_point(avg_points)
            value = latest["value"] if latest else current_value
            year = latest["year"] if latest else None
            average_value = latest_avg["value"] if latest_avg else None
            source = detail_part(details, "Quelle(n)")
            score = beta_score(value, average_value, points, smaller_is_better)
            dimension = dimension_for(sdg, label)
            indicators.append(
                {
                    "id": f"sdg{sdg}-{stable_id(label)}",
                    "title": label,
                    "dimension": dimension,
                    "sdg": sdg,
                    "sdgTitle": sdg_title,
                    "value": value,
                    "year": year,
                    "unit": unit,
                    "stateAverage": average_value,
                    "stateAverageLabel": (average_graph or {}).get("config", {}).get("title"),
                    "direction": "niedriger_ist_besser" if smaller_is_better else "hoeher_ist_besser",
                    "score": score,
                    "quality": quality_for(year, source, bool(points)),
                    "source": source,
                    "calculation": detail_part(details, "Berechnung"),
                    "statement": detail_part(details, "Aussage"),
                    "timeseries": [{"year": int(p[0]), "value": float(p[1])} for p in sorted(points, key=lambda item: item[0])],
                    "portalTitle": config.get("title") or municipality_name,
                }
            )
    return indicators


def resolve_municipality(query: str) -> dict:
    try:
        data = json.loads(fetch_text(SEARCH_URL.format(query=urllib.parse.quote(query))))
        results = data.get("data", [])
        if results:
            exact = [item for item in results if item["name"].lower() == query.lower()]
            selected = exact[0] if exact else results[0]
            return selected
    except Exception:
        # sdg-portal.de was shut down on 2026-06-30 and now returns 404 for the
        # former API/page structure. Continue with direct/new-portal probes so
        # callers receive a source error instead of a false "not found".
        pass

    for slug in portal_slug_candidates(query):
        try:
            page = fetch_municipality_page(slug=slug)
        except Exception:
            continue
        if '<article class="indicator-card">' not in page:
            continue
        return {
            "id": f"slug:{slug}",
            "name": extract_municipality_name(page, query),
            "slug": slug,
            "resolvedBy": "direct-page",
        }

    try:
        data = json.loads(fetch_text(PNK_SEARCH_URL.format(query=urllib.parse.quote(query))))
        if data:
            names = ", ".join(item.get("payload", {}).get("name", "Unbenannte Kommune") for item in data[:3])
            raise SourceUnavailableError(
                "Das alte SDG-Portal ist abgeschaltet. Das neue Portal Nachhaltige Kommunen "
                "kennt diese Eingabe, aber der KWI-Parser ist noch nicht auf dessen "
                f"Indikatorstruktur migriert: {names}"
            )
    except SourceUnavailableError:
        raise
    except Exception:
        pass

    raise MunicipalityNotFoundError(f"Keine Kommune in den verfügbaren KWI-Quellen gefunden: {query}")


def fetch_municipality_page(name: str | None = None, slug: str | None = None) -> str:
    if not slug:
        slug = slugify_name(name or "")
    query = urllib.parse.urlencode(
        [("goals[]", str(goal)) for goal in range(1, 18)]
        + [("showAverage", "1"), ("longTermComparison", "1")]
    )
    url = f"{SDG_PORTAL}/de/sdg-indikatoren/{urllib.parse.quote(slug)}?{query}"
    return fetch_text(url)


def aggregate(indicators: list[dict]) -> dict:
    dimensions: dict[str, dict] = {}
    for dimension in DIMENSION_WEIGHTS:
        values = [item["score"] for item in indicators if item["dimension"] == dimension and item["score"] is not None]
        dimensions[dimension] = {
            "score": round(sum(values) / len(values), 1) if values else None,
            "indicatorCount": len(values),
            "availableCount": len([item for item in indicators if item["dimension"] == dimension and item["value"] is not None]),
        }
    weighted = 0.0
    weight_sum = 0.0
    for dimension, weight in DIMENSION_WEIGHTS.items():
        score = dimensions[dimension]["score"]
        if score is not None:
            weighted += score * weight
            weight_sum += weight
    quality_counts: dict[str, int] = {"hoch": 0, "mittel": 0, "niedrig": 0}
    for item in indicators:
        quality_counts[item["quality"]] = quality_counts.get(item["quality"], 0) + 1
    return {
        "kwiScore": round(weighted / weight_sum, 1) if weight_sum else None,
        "dimensions": dimensions,
        "qualityCounts": quality_counts,
        "indicatorCount": len(indicators),
        "scoredIndicatorCount": len([item for item in indicators if item["score"] is not None]),
    }


def collect(query: str, prefer_local: bool = True) -> dict:
    if prefer_local:
        local_snapshot = load_local_snapshot(query)
        if local_snapshot:
            return local_snapshot

    municipality = resolve_municipality(query)
    page = (
        fetch_municipality_page(slug=municipality.get("slug"))
        if municipality.get("resolvedBy") == "direct-page"
        else fetch_municipality_page(municipality["name"])
    )
    indicators = parse_indicators(page, municipality["name"])
    if not indicators:
        raise SnapshotExtractionError(f"Keine Indikatoren aus der SDG-Portal-Seite extrahiert: {municipality['name']}")
    if not any(item.get("value") is not None for item in indicators):
        raise SnapshotExtractionError(
            "Die Kommune existiert im SDG-Portal, die Seite enthält aber aktuell keine "
            f"auswertbaren Indikatorwerte für den KWI: {municipality['name']}"
        )
    return {
        "schemaVersion": "kwi-beta-0.1",
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source": {
            "name": "SDG-Portal",
            "url": "https://sdg-portal.de/de/",
            "note": "HTML-Snapshot der oeffentlichen Kommune-Seite; Werte bleiben mit Quelle, Jahr und Richtung nachvollziehbar.",
        },
        "method": {
            "name": "Kommunaler Wirkungsindex Beta",
            "weights": DIMENSION_WEIGHTS,
            "scoreNote": "Beta-Score: Vergleich zum Landesdurchschnitt plus Trendkorrektur, skaliert auf 0-100. Keine amtliche Statistik.",
        },
        "municipality": {
            "sdgPortalId": municipality["id"],
            "name": municipality["name"],
            "slug": municipality.get("slug") or slugify_name(municipality["name"]),
        },
        "summary": aggregate(indicators),
        "indicators": indicators,
    }


def write_outputs(out_dir: Path, snapshots: list[dict], append: bool = False) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "municipalities.json"
    existing_municipalities: list[dict] = []
    new_slugs = {snapshot["municipality"]["slug"] for snapshot in snapshots}
    if append and manifest_path.exists():
        try:
            existing = json.loads(manifest_path.read_text(encoding="utf-8"))
            existing_municipalities = [
                item for item in existing.get("municipalities", [])
                if item.get("slug") not in new_slugs
            ]
        except json.JSONDecodeError:
            existing_municipalities = []

    municipalities = []
    for snapshot in snapshots:
        slug = snapshot["municipality"]["slug"]
        file_name = f"{slug}.json"
        (out_dir / file_name).write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        municipalities.append(
            {
                "name": snapshot["municipality"]["name"],
                "slug": slug,
                "sdgPortalId": snapshot["municipality"]["sdgPortalId"],
                "kwiScore": snapshot["summary"]["kwiScore"],
                "indicatorCount": snapshot["summary"]["indicatorCount"],
                "file": file_name,
            }
        )

    municipalities = existing_municipalities + municipalities
    manifest = {
        "schemaVersion": "kwi-beta-manifest-0.1",
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "sources": [
            {
                "name": "SDG-Portal",
                "url": "https://sdg-portal.de/de/",
                "coverage": "Landkreise sowie Städte und Gemeinden ab 5.000 Einwohner:innen, soweit Daten vorliegen.",
            }
        ],
        "municipalities": sorted(municipalities, key=lambda item: item["name"]),
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Collect KWI beta JSON snapshots from public municipal SDG data.")
    parser.add_argument("municipality", nargs="+", help="Municipality search term, e.g. 'Mannheim' or 'Gütersloh, Stadt'.")
    parser.add_argument("--out", default="assets/data/kwi", help="Output directory for JSON snapshots.")
    parser.add_argument("--append", action="store_true", help="Keep existing manifest entries and add or replace the requested snapshots.")
    args = parser.parse_args()

    snapshots = []
    for query in args.municipality:
        print(f"Collecting {query} ...", file=sys.stderr)
        snapshots.append(collect(query, prefer_local=False))
    write_outputs(Path(args.out), snapshots, append=args.append)
    print(f"Wrote {len(snapshots)} snapshot(s) to {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
