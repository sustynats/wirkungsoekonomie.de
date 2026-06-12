#!/usr/bin/env python3
from __future__ import annotations

import csv
import hashlib
import html
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[2]
VERSION = "v2.1"

CONTENT_DIR = ROOT / "content" / "woek-register"
DOWNLOAD_DIR = ROOT / "assets" / "downloads" / "woek-register"
SOURCE_XLSX_LOCAL = Path("/Users/hagen/Downloads/WOeK_Master_Items_Public_Research_Register_v2.1.xlsx")
SOURCE_XLSX_PUBLIC = DOWNLOAD_DIR / "WOeK_Master_Items_Public_Research_Register_v2.1.xlsx"
DATA_PATH = ROOT / "assets" / "data" / "woek-id-register.json"
OVERVIEW_DIR = ROOT / "register"
REGISTER_DIR = ROOT / "woek-id-register"
LEGACY_TOOL_DIR = ROOT / "werkzeuge" / "woek-id-register"
OLD_PUBLIC_XLSX = DOWNLOAD_DIR / "WOeK_Master_Items_Public_Research_Register_v2.0.xlsx"
OLD_DUPLICATE_PUBLIC_XLSX = DOWNLOAD_DIR / "WOeK_Master_Items_Public_Research_Register_v2.1 2.xlsx"
NON_PUBLIC_EXPORTS = [
    DOWNLOAD_DIR / "items-v2.1.json",
    DOWNLOAD_DIR / "sources-v2.1.json",
    DOWNLOAD_DIR / "methods-v2.1.json",
    DOWNLOAD_DIR / "changelog-v2.1.json",
    DOWNLOAD_DIR / "items-v2.1.csv",
    DOWNLOAD_DIR / "items.json",
    DOWNLOAD_DIR / "sources.json",
    DOWNLOAD_DIR / "methods.json",
    DOWNLOAD_DIR / "data-quality.json",
    DOWNLOAD_DIR / "changelog.json",
    DOWNLOAD_DIR / "items.csv",
]


def source_xlsx() -> Path:
    if SOURCE_XLSX_LOCAL.exists():
        return SOURCE_XLSX_LOCAL
    return SOURCE_XLSX_PUBLIC


def public_text(value: object) -> object:
    if isinstance(value, str):
        return value.replace("—", "-")
    return value


def sanitize_public_payload(value: object) -> object:
    if isinstance(value, dict):
        return {key: sanitize_public_payload(item) for key, item in value.items()}
    if isinstance(value, list):
        return [sanitize_public_payload(item) for item in value]
    return public_text(value)


def esc(value: object) -> str:
    return html.escape("" if value is None else str(public_text(value)), quote=True)


def slugify(value: object) -> str:
    text = str(value or "").strip().lower()
    for old, new in {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "–": "-", "-": "-", "‑": "-"}.items():
        text = text.replace(old, new)
    return "-".join("".join(char if char.isalnum() else "-" for char in text).split("-"))


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def read_sheet(workbook, sheet_name: str) -> list[dict[str, object]]:
    rows = [row for row in workbook[sheet_name].iter_rows(values_only=True) if any(cell not in (None, "") for cell in row)]
    if not rows:
        return []
    headers = [str(cell or "").strip() for cell in rows[0]]
    records = []
    for row in rows[1:]:
        record = {}
        for index, header in enumerate(headers):
            if not header:
                continue
            value = row[index] if index < len(row) else ""
            if hasattr(value, "isoformat"):
                value = value.isoformat()
            record[header] = "" if value is None else value
        if any(value not in ("", None) for value in record.values()):
            records.append(record)
    return records


def split_multi(value: object) -> list[str]:
    text = str(value or "").replace("\n", ";")
    return [part.strip() for part in text.split(";") if part.strip()]


def normalize_number(value: object):
    if value in ("", None):
        return ""
    try:
        return float(value)
    except (TypeError, ValueError):
        return value


def is_truthy(value: object) -> bool:
    return str(value or "").strip().lower() in {"true", "ja", "yes", "1", "red line", "red_line"}


def status_badges(item: dict[str, object]) -> list[str]:
    badges = ["public research", "not official"]
    readiness = str(item.get("publication_readiness", "")).lower()
    specificity = str(item.get("source_specificity", "")).lower()
    scoring = str(item.get("scoring_mode", "")).lower()
    benchmark_status = str(item.get("benchmark_status", "")).lower()
    if item.get("thresholds") or "numeric" in scoring:
        badges.append("formula-ready")
    if "synthetic" in benchmark_status or "benchmark" in scoring:
        badges.append("benchmark calibration required")
    if "qualitative" in scoring or "review" in readiness:
        badges.append("qualitative review required")
    if is_truthy(item.get("non_compensation_red_line")):
        badges.append("red line")
    if item.get("source_ids"):
        badges.append("source mapped")
    if "exakte" in specificity or "exact" in specificity or "missing" in specificity:
        badges.append("exact disclosure missing")
    return list(dict.fromkeys(badges))


def normalize_items(raw_items, benchmarks, calculator):
    items = []
    for row in raw_items:
        wok_id = str(row.get("WOK_ID") or "").strip()
        if not wok_id:
            continue
        benchmark = benchmarks.get(wok_id, {})
        calc = calculator.get(wok_id, {})
        item = {
            "id": wok_id,
            "slug": slugify(wok_id),
            "category": row.get("Category", ""),
            "mpd_dimension": row.get("MPD_Dimension", ""),
            "core_field": row.get("Core_Field", ""),
            "sdg_or_sdgplus": row.get("SDG_or_SDGplus", ""),
            "target": row.get("Target/Unterziel", ""),
            "indicator_family": row.get("Indikatorfamilie", ""),
            "item": row.get("Item", ""),
            "definition": row.get("Definition/Messgröße", ""),
            "unit": row.get("Einheit", ""),
            "polarity": row.get("Polarity", ""),
            "archetype": row.get("Archetype", ""),
            "scoring_mode": row.get("Scoring_Mode", ""),
            "source_detail_original": row.get("Source_Detail_Original", ""),
            "source_ids": split_multi(row.get("Source_IDs", "")),
            "source_urls": split_multi(row.get("Source_URLs", "")),
            "source_specificity": row.get("Source_Specificity", ""),
            "measurement_type": row.get("Measurement_Type", ""),
            "numerator_denominator": row.get("Numerator_Denominator", ""),
            "calculation_original": row.get("Berechnungslogik_Original", ""),
            "calculation_formula_plain": row.get("Calculation_Formula_Plain", ""),
            "thresholds": row.get("Thresholds_WUStG_Classes", ""),
            "bm": normalize_number(row.get("BM", "")),
            "bm_150pct": normalize_number(row.get("BM_150pct", "")),
            "bm_250pct": normalize_number(row.get("BM_250pct", "")),
            "benchmark_source": row.get("Benchmark_Source", ""),
            "benchmark_status": row.get("Benchmark_Status", ""),
            "nace_examples": row.get("NACE_Beispiele", ""),
            "non_compensation_red_line": row.get("NonCompensation_RedLine", ""),
            "assurance_level_required": row.get("Assurance_Level_Required", ""),
            "data_quality_minimum": row.get("Data_Quality_Minimum", ""),
            "update_cadence": row.get("Update_Cadence", ""),
            "publication_readiness": row.get("Publication_Readiness", ""),
            "editorial_note": row.get("Editorial_Note", ""),
            "benchmark": benchmark,
            "scorecard": {
                key: normalize_number(calc.get(key, ""))
                for key in ["B1", "B2", "B3", "B4", "B5", "B6", "S1", "S2", "S3", "S4", "S5", "S6", "BM", "BM_150pct", "BM_250pct"]
            },
        }
        item["badges"] = status_badges(item)
        items.append(item)
    return items


def normalize_sources(raw_sources, items):
    usage = {}
    for item in items:
        for source_id in item["source_ids"]:
            usage.setdefault(source_id, []).append(item["id"])
    return [{
        "id": row.get("Source_ID", ""),
        "name": row.get("Source_Name", ""),
        "type": row.get("Source_Type", ""),
        "scope": row.get("Scope", ""),
        "url": row.get("Official_URL", ""),
        "access_type": row.get("Access_Type", ""),
        "update_cadence": row.get("Update_Cadence", ""),
        "used_for": row.get("Used_For", ""),
        "used_by_count": len(usage.get(str(row.get("Source_ID", "")), [])),
        "used_by_sample": usage.get(str(row.get("Source_ID", "")), [])[:16],
    } for row in raw_sources if row.get("Source_ID")]


def normalize_methods(raw_methods):
    methods = []
    for row in raw_methods:
        archetype = row.get("Archetype", "")
        if not archetype:
            continue
        methods.append({
            "id": archetype,
            "archetype": archetype,
            "use_case": row.get("Use_case", ""),
            "polarity": row.get("Polarity", ""),
            "thresholds": {key: normalize_number(row.get(key, "")) for key in ["B1", "B2", "B3", "B4", "B5", "B6", "S1", "S2", "S3", "S4", "S5", "S6"]},
            "calculation_rule": row.get("Calculation_Rule", ""),
            "notes": row.get("Notes", ""),
        })
    return methods


def write_json(path: Path, payload: object):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(sanitize_public_payload(payload), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_csv(path: Path, items: list[dict[str, object]]):
    fields = [
        "id", "category", "mpd_dimension", "core_field", "sdg_or_sdgplus", "target",
        "indicator_family", "item", "definition", "unit", "polarity", "archetype",
        "scoring_mode", "source_ids", "measurement_type", "numerator_denominator",
        "calculation_formula_plain", "thresholds", "bm", "bm_150pct", "bm_250pct",
        "non_compensation_red_line", "assurance_level_required", "data_quality_minimum",
        "publication_readiness", "badges",
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for item in items:
            row = {field: public_text(item.get(field, "")) for field in fields}
            row["source_ids"] = "; ".join(item.get("source_ids", []))
            row["badges"] = "; ".join(item.get("badges", []))
            writer.writerow(row)


def layout(title: str, description: str, body: str, prefix: str = "../") -> str:
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(title)}</title>
    <meta name="description" content="{esc(description)}">
    <meta name="search_title" content="{esc(title)}">
    <meta name="search_description" content="{esc(description)}">
    <meta name="search_section" content="Register">
    <meta name="search_type" content="WÖk-ID Register">
    <link rel="canonical" href="https://wirkungsoekonomie.de/{'' if prefix == '../' else 'woek-id-register/'}">
    <link rel="icon" href="{prefix}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="{prefix}assets/css/style.css?v=20260612-shell-audio-fix">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="{prefix}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="{prefix}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude>
        <a href="{prefix}index.html">Start</a>
        <a href="{prefix}verstehen.html">Verstehen</a>
        <a href="{prefix}wirkungsfelder/">Wirkungsfelder</a>
        <a href="{prefix}werkzeuge/">Methoden &amp; Werkzeuge</a>
        <a href="{prefix}erleben/">Erleben</a>
        <a href="{prefix}downloads.html">Bibliothek</a>
        <a href="{prefix}suche.html">Suche</a>
      </nav>
    </header>
    <main data-pagefind-body>{body}</main>
    <script src="{prefix}assets/js/main.js"></script>
  </body>
</html>
"""


def badge_html(badges: list[str]) -> str:
    return "".join(f'<span class="status-badge status-badge--{slugify(badge)}">{esc(badge)}</span>' for badge in badges)


def overview_page(items):
    body = f"""
      <section class="hero portal-hero woek-register-hero">
        <div class="hero-content">
          <nav class="breadcrumb"><a href="../index.html">Start</a> / Register</nav>
          <p class="hero-kicker">Public Research Draft · {VERSION}</p>
          <h1>WÖk-ID Register</h1>
          <p class="hero-subtitle">Öffentliches Forschungs- und Operationalisierungsregister der Wirkungsökonomie.</p>
          <p>Eine WÖk-ID ist eine eindeutige Kennung für eine Wirkungs-Messgröße. Sie verbindet Zielbezug, Messlogik, Einheit, Quellen, Datenqualität, Benchmark, Prüfpfad und Schutzlinien.</p>
          <p>Das Register zeigt, dass die Wirkungsökonomie operationalisierbar, prüfbar, versionierbar und kritisierbar ist. Es macht sichtbar, wo Formeln bereits verwendbar sind, wo Benchmarks kalibriert werden müssen und wo qualitative oder wissenschaftliche Prüfung nötig bleibt.</p>
          <p class="callout warning">Forschungs-/Pilotregister, nicht amtlich, keine Rechts-, Steuer-, Anlage-, Kredit-, Förder- oder Versicherungsberatung.</p>
          <div class="hero-actions no-print"><a class="btn btn-primary" href="../woek-id-register/">Register durchsuchen</a><a class="btn btn-secondary" href="../woek-id-register/methodik/">Methodik verstehen</a></div>
        </div>
      </section>
      <section class="section">
        <div class="feature-grid">
          <article class="card"><p class="card-kicker">Registerumfang</p><h2 class="card-title">{len(items)} WÖk-IDs</h2><p class="card-text">Jede Zeile ist als Public Research Draft gekennzeichnet und enthält Quellen- und Berechnungsansicht.</p></article>
          <article class="card"><p class="card-kicker">Operationalisierung</p><h2 class="card-title">Daten → Score → Rückkopplung</h2><p class="card-text">Messwerte werden über transparente Schwellen, Benchmarks, rote Linien und Datenqualität eingeordnet.</p></article>
          <article class="card"><p class="card-kicker">Kritikfähigkeit</p><h2 class="card-title">Review offen</h2><p class="card-text">Quellen, Benchmarks und Formeln können fachlich ergänzt, korrigiert und versioniert werden.</p></article>
        </div>
      </section>"""
    return layout("WÖk-ID Register – Public Research Explorer", "Öffentlicher Forschungs-Explorer mit WÖk-IDs, Quellen, Benchmarks, Berechnungslogik und Schutzlinien.", body, "../")


def register_page(items, sources, methods, data_quality, changelog, source_hash):
    payload = {
        "meta": {"version": VERSION, "item_count": len(items), "source_hash_sha256": source_hash, "generated_at": datetime.now(timezone.utc).isoformat()},
        "items": items,
        "sources": sources,
        "methods": methods,
        "data_quality": data_quality,
        "changelog": changelog,
    }
    embedded = json.dumps(payload, ensure_ascii=False).replace("<", "\\u003c")
    def opts(values, label):
        unique = sorted({str(v).strip() for v in values if str(v or "").strip()})
        return f'<option value="">{esc(label)}</option>' + "".join(f'<option value="{esc(v)}">{esc(v)}</option>' for v in unique)

    body = f"""
      <section class="hero compact-hero woek-register-hero">
        <nav class="breadcrumb"><a href="../index.html">Start</a> / <a href="../register/">Register</a></nav>
        <p class="hero-kicker">Public Research Draft · {VERSION}</p>
        <h1>WÖk-ID Register Explorer</h1>
        <p class="hero-subtitle">Filterbares Forschungsregister mit {len(items)} WÖk-IDs, Quellen, Formeln, Benchmarks und Reviewstatus.</p>
        <div class="document-card-badges">{badge_html(["public research", "not official"])}</div>
        <p class="callout warning">Demo- und Forschungsumgebung. Nicht amtlich. Keine automatische Bewertung, keine Steuerentscheidung und keine Beratung.</p>
      </section>
      <section class="section" id="register-table">
        <div class="section-header"><p class="hero-kicker">Durchsuchen</p><h2>Register durchsuchen</h2><p>Jede Zeile führt zu einer eigenen Detailseite mit Quellen- und Berechnungsansicht.</p></div>
        <form class="woek-register-filters" data-search-exclude>
          <label>WÖk-ID / Suche<input id="woekSearch" type="search" placeholder="WOK-S-101, Living Wage, ESRS"></label>
          <label>SDG / SDG+<select id="filterSdg">{opts([i["sdg_or_sdgplus"] for i in items], "Alle")}</select></label>
          <label>Mensch / Planet / Demokratie<select id="filterMpd">{opts([i["mpd_dimension"] for i in items], "Alle")}</select></label>
          <label>Core Field<select id="filterCore">{opts([i["core_field"] for i in items], "Alle")}</select></label>
          <label>Indikatorfamilie<select id="filterFamily">{opts([i["indicator_family"] for i in items], "Alle")}</select></label>
          <label>Archetype<select id="filterArchetype">{opts([i["archetype"] for i in items], "Alle")}</select></label>
          <label>Scoring Mode<select id="filterScoring">{opts([i["scoring_mode"] for i in items], "Alle")}</select></label>
          <label>Source<select id="filterSource">{opts([s["id"] for s in sources], "Alle")}</select></label>
          <label>NonCompensation_RedLine<select id="filterRedLine">{opts([i["non_compensation_red_line"] for i in items], "Alle")}</select></label>
          <label>Publication_Readiness<select id="filterReadiness">{opts([i["publication_readiness"] for i in items], "Alle")}</select></label>
        </form>
        <p class="text-note" id="registerCount" data-search-exclude></p>
        <div class="table-wrap woek-register-table-wrap" data-search-exclude><table class="data-table woek-register-table"><thead><tr><th>WÖk-ID</th><th>Item</th><th>SDG/SDG+</th><th>MPD</th><th>Core Field</th><th>Archetype</th><th>Scoring</th><th>Status</th><th>Details</th></tr></thead><tbody id="registerRows"></tbody></table></div>
      </section>
      <section class="section" id="score-demo">
        <div class="card woek-score-demo">
          <p class="hero-kicker">Score-Demo</p><h2>Modellhafte Score-Berechnung</h2>
          <p class="callout warning">Demo, nicht amtlich. Keine Steuer-, Rechts-, Anlage-, Kredit-, Förder- oder Versicherungsberatung. Keine Personenbewertung.</p>
          <div class="woek-demo-grid"><label>WÖk-ID<select id="demoItem"></select></label><label>Messwert<input id="demoValue" type="number" step="any"></label><button class="btn btn-primary" type="button" id="demoCalculate">Demo berechnen</button></div>
          <div id="demoResult" class="woek-demo-result" aria-live="polite">Noch keine Berechnung.</div>
        </div>
      </section>
      <section class="section" id="downloads"><div class="section-header"><p class="hero-kicker">Downloads</p><h2>Öffentliche Registerversion {VERSION}</h2></div><div class="card-grid three">
        <article class="card"><h3 class="card-title">XLSX</h3><a class="text-link" href="../assets/downloads/woek-register/WOeK_Master_Items_Public_Research_Register_v2.1.xlsx">XLSX herunterladen</a></article>
        <article class="card"><h3 class="card-title">Methodik</h3><a class="text-link" href="../woek-id-register/methodik/">Methodik online lesen</a></article>
        <article class="card"><h3 class="card-title">Quellen</h3><a class="text-link" href="../woek-id-register/quellen/">Quellen online lesen</a></article>
      </div></section>
      <section class="section"><div class="card"><p class="hero-kicker">Feedback</p><h2>Review beitragen</h2><p>Quelle ergänzen, Benchmark vorschlagen, Fehler melden oder Fachreview beitragen. Bitte keine personenbezogenen Daten senden.</p><a class="btn btn-secondary" href="mailto:kontakt@wirkungsoekonomie.de?subject=Feedback%20zum%20WOEK-ID-Register%20v2.1&body=Bitte%20W%C3%96k-ID%2C%20Quelle%2C%20Benchmark%20oder%20Fehlerhinweis%20eintragen.%20Bitte%20keine%20personenbezogenen%20Daten%20senden.">Fehler / Ergänzung melden</a></div></section>
      <script id="woekRegisterData" type="application/json">{embedded}</script>
      <script>
const data = JSON.parse(document.getElementById("woekRegisterData").textContent);
const items = data.items;
const $ = (id) => document.getElementById(id);
const safe = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}}[c]));
const val = (id) => $(id).value;
function match(item) {{
  const q = val("woekSearch").toLowerCase().trim();
  if (q && ![item.id,item.item,item.definition,item.source_ids.join(" "),item.core_field,item.indicator_family].join(" ").toLowerCase().includes(q)) return false;
  if (val("filterSdg") && item.sdg_or_sdgplus !== val("filterSdg")) return false;
  if (val("filterMpd") && item.mpd_dimension !== val("filterMpd")) return false;
  if (val("filterCore") && item.core_field !== val("filterCore")) return false;
  if (val("filterFamily") && item.indicator_family !== val("filterFamily")) return false;
  if (val("filterArchetype") && item.archetype !== val("filterArchetype")) return false;
  if (val("filterScoring") && item.scoring_mode !== val("filterScoring")) return false;
  if (val("filterSource") && !item.source_ids.includes(val("filterSource"))) return false;
  if (val("filterRedLine") && String(item.non_compensation_red_line) !== val("filterRedLine")) return false;
  if (val("filterReadiness") && item.publication_readiness !== val("filterReadiness")) return false;
  return true;
}}
function renderRows() {{
  const rows = items.filter(match);
  $("registerCount").textContent = `${{rows.length}} von ${{items.length}} WÖk-IDs sichtbar`;
  $("registerRows").innerHTML = rows.slice(0, 240).map(item => `<tr><td><strong>${{safe(item.id)}}</strong></td><td>${{safe(item.item)}}</td><td>${{safe(item.sdg_or_sdgplus)}}</td><td>${{safe(item.mpd_dimension)}}</td><td>${{safe(item.core_field)}}</td><td>${{safe(item.archetype)}}</td><td>${{safe(item.scoring_mode)}}</td><td>${{item.badges.slice(0,3).map(b=>`<span class="status-badge status-badge--${{safe(b.replaceAll(" ","-"))}}">${{safe(b)}}</span>`).join(" ")}}</td><td><a class="btn btn-secondary table-action" href="${{safe(item.slug)}}/">Details ansehen</a></td></tr>`).join("");
  if (rows.length > 240) $("registerRows").insertAdjacentHTML("beforeend", `<tr><td colspan="9">Weitere ${{rows.length - 240}} Treffer. Bitte Filter verfeinern.</td></tr>`);
}}
function thresholdScore(item, value) {{
  const b = ["B1","B2","B3","B4","B5","B6"].map(k => Number(item.scorecard[k]));
  const s = ["S1","S2","S3","S4","S5","S6"].map(k => Number(item.scorecard[k]));
  let score = s[0];
  for (let i = 0; i < b.length; i += 1) if (!Number.isNaN(b[i]) && value >= b[i] && !Number.isNaN(s[i])) score = s[i];
  return Number.isNaN(score) ? null : score;
}}
function benchmarkScore(item, value) {{
  const bm = Number(item.bm), b150 = Number(item.bm_150pct), b250 = Number(item.bm_250pct);
  if ([bm,b150,b250].some(Number.isNaN)) return null;
  if (item.polarity === "lower_is_better") return value <= bm ? 0 : value <= b150 ? -2 : -3;
  return value >= b150 ? 2 : value >= bm ? 0 : -2;
}}
function tax(score) {{ return {{ "-3": "25%", "-2": "20%", "-1": "15%", "0": "10%", "1": "5%", "2": "0%", "3": "0%" }}[String(score)] ?? "offen"; }}
function setupDemo() {{
  $("demoItem").innerHTML = items.map(item => `<option value="${{safe(item.id)}}">${{safe(item.id)}} · ${{safe(item.item)}}</option>`).join("");
  $("demoCalculate").addEventListener("click", () => {{
    const item = items.find(x => x.id === $("demoItem").value);
    const value = Number($("demoValue").value);
    if (!item || Number.isNaN(value)) {{ $("demoResult").textContent = "Bitte WÖk-ID und Messwert eingeben."; return; }}
    const auto = thresholdScore(item, value);
    const bench = benchmarkScore(item, value);
    const red = String(item.non_compensation_red_line).toLowerCase() === "true" ? -3 : 3;
    const finalScore = Math.min(...[auto, bench, red].filter(x => x !== null));
    $("demoResult").innerHTML = `<strong>AutoScore: ${{safe(auto ?? "offen")}} · BenchmarkScore: ${{safe(bench ?? "offen")}} · RedLineScore: ${{safe(red)}} · FinalScore: ${{safe(finalScore)}} · Steuerklasse: ${{safe(tax(finalScore))}}</strong><br><span class="text-note">Modellrechnung für ${{safe(item.id)}}. Nicht amtlich, keine Entscheidung, keine Personenbewertung.</span>`;
  }});
}}
document.querySelectorAll(".woek-register-filters input,.woek-register-filters select").forEach(el => el.addEventListener("input", renderRows));
renderRows(); setupDemo();
      </script>"""
    return layout("WÖk-ID Register – Indikatoren der Wirkungsökonomie", "Offenes Forschungsregister der Wirkungsökonomie mit WÖk-IDs, Quellen, Berechnungslogiken, Datenqualität und Scorecard-Methodik.", body, "../")


def detail_page(item, sources_by_id):
    source_links = []
    for source_id in item["source_ids"]:
        source = sources_by_id.get(source_id)
        label = source["name"] if source else source_id
        source_links.append(f'<li><strong>{esc(source_id)}</strong> · {esc(label)}{f" · {esc(source.get("url", ""))}" if source else ""}</li>')
    body = f"""
      <section class="hero compact-hero woek-register-hero">
        <nav class="breadcrumb"><a href="../../register/">Register</a> / <a href="../">WÖk-ID Register</a> / {esc(item["id"])}</nav>
        <p class="hero-kicker">WÖk-ID · {VERSION}</p>
        <h1>{esc(item["id"])} · {esc(item["item"])}</h1>
        <p class="hero-subtitle">{esc(item["definition"])}</p>
        <div class="document-card-badges">{badge_html(item["badges"])}</div>
        <p class="callout warning">Public Research Draft. Nicht amtlich, keine automatische Steuerentscheidung und keine Rechts-, Steuer-, Anlage-, Kredit-, Förder- oder Versicherungsberatung.</p>
      </section>
      <section class="section document-detail-grid">
        <article class="document-detail-main">
          <h2>Kurzbeschreibung</h2><p>{esc(item["definition"])}</p>
          <h2>Zielbezug und Dimension</h2><p>{esc(item["sdg_or_sdgplus"])} · {esc(item["target"])} · {esc(item["mpd_dimension"])}</p>
          <h2>Messgröße und Einheit</h2><p>{esc(item["measurement_type"])} · {esc(item["unit"])}</p>
          <h2>Zähler/Nenner-Logik</h2><p>{esc(item["numerator_denominator"])}</p>
          <h2>Berechnungslogik</h2><p>{esc(item["calculation_formula_plain"] or item["calculation_original"])}</p>
          <h2>Schwellen / Benchmark</h2><p>{esc(item["thresholds"])}<br>BM: {esc(item["bm"])} · BM_150pct: {esc(item["bm_150pct"])} · BM_250pct: {esc(item["bm_250pct"])} · {esc(item["benchmark_status"])}</p>
          <h2>Quellen</h2><ul>{''.join(source_links) or '<li>Keine Quelle hinterlegt.</li>'}</ul>
          <h2>Red-Line-/Nichtkompensationshinweis</h2><p>{esc(item["non_compensation_red_line"] or "Kein roter Linienstatus hinterlegt.")}</p>
          <h2>Verwandte Methoden</h2><p><a href="../../werkzeuge/scorecards/">Scorecards</a> · <a href="../../werkzeuge/reverse-merit-order/">Reverse Merit Order</a> · <a href="../../werkzeuge/netto-wirkungs-index/">NWI</a> · <a href="../../werkzeuge/t-sroi/">T-SROI</a> · <a href="../../werkzeuge/digitale-produktpaesse/">DPP</a> · <a href="../../werkzeuge/wirkungsdatenraeume/">Wirkungsdatenräume</a></p>
        </article>
        <aside class="document-detail-aside" data-search-exclude><dl>
          <dt>Core Field</dt><dd>{esc(item["core_field"])}</dd>
          <dt>Indikatorfamilie</dt><dd>{esc(item["indicator_family"])}</dd>
          <dt>Archetype</dt><dd>{esc(item["archetype"])}</dd>
          <dt>Scoring Mode</dt><dd>{esc(item["scoring_mode"])}</dd>
          <dt>Datenqualität</dt><dd>{esc(item["data_quality_minimum"])}</dd>
          <dt>Assurance-Level</dt><dd>{esc(item["assurance_level_required"])}</dd>
          <dt>Publication / Review</dt><dd>{esc(item["publication_readiness"])}</dd>
          <dt>Source Specificity</dt><dd>{esc(item["source_specificity"])}</dd>
        </dl><a class="btn btn-secondary" href="mailto:kontakt@wirkungsoekonomie.de?subject=Feedback%20zu%20{esc(item["id"])}">Fehler / Ergänzung melden</a></aside>
      </section>"""
    return layout(f'{item["id"]} – {item["item"]}', f'Detailseite zur WÖk-ID {item["id"]} mit Quellen, Berechnung, Benchmark und Reviewstatus.', body, "../../")


def methodology_page():
    body = """
      <section class="hero compact-hero"><nav class="breadcrumb"><a href="../../register/">Register</a> / Methodik</nav><p class="hero-kicker">Methodik</p><h1>Wie aus Daten Wirkungsscores werden</h1><p class="hero-subtitle">Daten → Messwert → AutoScore → BenchmarkScore → RedLineScore → FinalScore → Rückkopplung.</p></section>
      <section class="section narrow"><div class="card"><h2>Bewertungsfluss</h2><p>Ein Messwert wird zuerst gegen zeilenspezifische Schwellen gelesen. Danach wird er mit einem Benchmark abgeglichen. Rote Linien und Nichtkompensation begrenzen die Aufwertung. Der FinalScore ist eine Forschungslogik, keine amtliche Entscheidung.</p><h2>Reverse Merit Order</h2><p>Die schwächste kritische Wirkung begrenzt die Gesamtbewertung. Schwerwiegende negative Wirkung darf nicht durch positive Wirkung an anderer Stelle schön gerechnet werden.</p><h2>NWI und T-SROI getrennt</h2><p>NWI ist eine operative Netto-Wirkungskennzahl für konkrete Wirkungseinheiten. T-SROI betrachtet Transformationswirkung und Systemhebel. Beide dürfen nicht vermischt werden.</p><h2>Datenqualität und Unsicherheit</h2><p>Datenqualität, Quelle, Systemgrenze, Benchmarkreife und Assurance-Level bleiben sichtbar. Fehlende Daten erzeugen keinen finalen Score.</p></div></section>"""
    return layout("Methodik des WÖk-ID Registers", "Methodikseite zum Forschungsregister: Daten, AutoScore, BenchmarkScore, RedLineScore, FinalScore und Rückkopplung.", body, "../../")


def sources_page(sources):
    cards = "".join(f'<article class="card"><p class="card-kicker">{esc(source["type"])}</p><h3 class="card-title">{esc(source["name"])}</h3><p class="card-text"><strong>{esc(source["id"])}</strong><br>{esc(source["scope"])}</p><p class="card-text">Nutzung: {esc(source["used_for"])}</p><p class="text-note">{esc(source["url"])}</p></article>' for source in sources)
    body = f'<section class="hero compact-hero"><nav class="breadcrumb"><a href="../../register/">Register</a> / Quellen</nav><p class="hero-kicker">Quellenbibliothek</p><h1>Quellen des WÖk-ID Registers</h1><p class="hero-subtitle">UN SDGs, UN SDG Indicator Framework, UN Metadata, CSRD/ESRS, EFRAG, GRI, NACE, EU-Taxonomie, GHG Protocol, OECD, ILO, ISO, WRI Aqueduct, WJP, V-Dem und weitere Quellen aus v2.1.</p></section><section class="section"><div class="card-grid three">{cards}</div></section>'
    return layout("Quellen des WÖk-ID Registers", "Quellenübersicht des öffentlichen WÖk-ID Forschungsregisters v2.1.", body, "../../")


def legacy_tool_alias():
    return """<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>WÖk-ID Register – Weiterleitung</title>
    <meta name="description" content="Weiterleitung zum öffentlichen WÖk-ID Register Explorer v2.1.">
    <meta http-equiv="refresh" content="0; url=../../woek-id-register/">
    <link rel="canonical" href="https://wirkungsoekonomie.de/woek-id-register/">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-shell-audio-fix">
  </head>
  <body>
    <main class="section narrow">
      <h1>WÖk-ID Register</h1>
      <p>Der öffentliche Forschungs-Explorer ist umgezogen.</p>
      <p><a class="btn btn-primary" href="../../woek-id-register/">Zum WÖk-ID Register Explorer</a></p>
    </main>
  </body>
</html>
"""


def archive_old_public_download():
    # GitHub Pages publishes the repository root. Old raw workbooks therefore
    # must not be moved into a public-looking in-repo archive.
    if OLD_PUBLIC_XLSX.exists():
        OLD_PUBLIC_XLSX.unlink()
    if OLD_DUPLICATE_PUBLIC_XLSX.exists():
        OLD_DUPLICATE_PUBLIC_XLSX.unlink()
    for path in NON_PUBLIC_EXPORTS:
        if path.exists():
            path.unlink()


def main():
    workbook_path = source_xlsx()
    if not workbook_path.exists():
        raise SystemExit(f"Missing source workbook: {workbook_path}")
    workbook = load_workbook(workbook_path, data_only=True)
    raw_items = read_sheet(workbook, "04_WOeK_ID_Register")
    raw_sources = read_sheet(workbook, "02_Source_Library")
    raw_methods = read_sheet(workbook, "03_Archetypes_Method")
    raw_benchmarks = read_sheet(workbook, "05_Benchmarks_NACE")
    raw_calculator = read_sheet(workbook, "06_Scorecard_Calculator")
    data_quality = read_sheet(workbook, "07_Data_Quality_Assurance")
    audit = read_sheet(workbook, "08_Audit_Findings")
    changelog = read_sheet(workbook, "10_Changelog")

    benchmarks = {str(row.get("WOK_ID")): row for row in raw_benchmarks if row.get("WOK_ID")}
    calculator = {str(row.get("WOK_ID")): row for row in raw_calculator if row.get("WOK_ID")}
    items = normalize_items(raw_items, benchmarks, calculator)
    sources = normalize_sources(raw_sources, items)
    methods = normalize_methods(raw_methods)
    source_hash = digest(workbook_path)
    sources_by_id = {source["id"]: source for source in sources}

    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    REGISTER_DIR.mkdir(parents=True, exist_ok=True)
    OVERVIEW_DIR.mkdir(parents=True, exist_ok=True)
    LEGACY_TOOL_DIR.mkdir(parents=True, exist_ok=True)
    archive_old_public_download()

    write_json(CONTENT_DIR / "items.json", items)
    write_json(CONTENT_DIR / "sources.json", sources)
    write_json(CONTENT_DIR / "methods.json", methods)
    write_json(CONTENT_DIR / "data-quality.json", data_quality)
    write_json(CONTENT_DIR / "audit-findings.json", audit)
    write_json(CONTENT_DIR / "changelog.json", changelog)
    write_json(DATA_PATH, {"version": VERSION, "source_hash_sha256": source_hash, "items": items, "sources": sources, "methods": methods, "data_quality": data_quality, "audit": audit, "changelog": changelog})

    public_workbook = DOWNLOAD_DIR / SOURCE_XLSX_PUBLIC.name
    if workbook_path.resolve() != public_workbook.resolve():
        shutil.copy2(workbook_path, public_workbook)

    (OVERVIEW_DIR / "index.html").write_text(overview_page(items), encoding="utf-8")
    (REGISTER_DIR / "index.html").write_text(register_page(items, sources, methods, data_quality, changelog, source_hash), encoding="utf-8")
    (LEGACY_TOOL_DIR / "index.html").write_text(legacy_tool_alias(), encoding="utf-8")
    (REGISTER_DIR / "methodik").mkdir(parents=True, exist_ok=True)
    (REGISTER_DIR / "methodik" / "index.html").write_text(methodology_page(), encoding="utf-8")
    (REGISTER_DIR / "quellen").mkdir(parents=True, exist_ok=True)
    (REGISTER_DIR / "quellen" / "index.html").write_text(sources_page(sources), encoding="utf-8")
    for item in items:
        detail_dir = REGISTER_DIR / item["slug"]
        detail_dir.mkdir(parents=True, exist_ok=True)
        (detail_dir / "index.html").write_text(detail_page(item, sources_by_id), encoding="utf-8")
    print(f"Wrote WÖk-ID Register Explorer {VERSION}: {len(items)} detail pages, {len(sources)} sources, {len(methods)} methods.")


if __name__ == "__main__":
    main()
