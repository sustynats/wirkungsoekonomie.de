#!/usr/bin/env python3
"""Build the public explorer from the reviewed WÖk Master Items v1.3 workbook."""
from __future__ import annotations

import hashlib
import html
import json
from datetime import datetime, timezone
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[2]
VERSION = "v1.3"
DOWNLOAD_DIR = ROOT / "assets" / "downloads" / "woek-register"
SOURCE_XLSX = DOWNLOAD_DIR / "WOeK_Master_Items_v1.3_geprueft.xlsx"
CONTENT_DIR = ROOT / "content" / "woek-register"
DATA_PATH = ROOT / "assets" / "data" / "woek-id-register.json"
REGISTER_DIR = ROOT / "woek-id-register"
OVERVIEW_DIR = ROOT / "register"
LEGACY_TOOL_DIR = ROOT / "werkzeuge" / "woek-id-register"
HEADER_ROW = 4


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def esc(value: object) -> str:
    return html.escape("" if value is None else str(value).replace("—", "-"), quote=True)


def slugify(value: object) -> str:
    text = str(value or "").strip().lower()
    for source, target in {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "–": "-", "‑": "-"}.items():
        text = text.replace(source, target)
    chunks = "".join(char if char.isalnum() else "-" for char in text).split("-")
    return "-".join(chunk for chunk in chunks if chunk)


def records(workbook, name: str) -> list[dict[str, object]]:
    sheet = workbook[name]
    headers = [str(cell.value or "").strip() for cell in sheet[HEADER_ROW]]
    result: list[dict[str, object]] = []
    for row in sheet.iter_rows(min_row=HEADER_ROW + 1, values_only=True):
        if not any(value not in (None, "") for value in row):
            continue
        record = {headers[i]: value for i, value in enumerate(row) if i < len(headers) and headers[i]}
        if any(value not in (None, "") for value in record.values()):
            result.append(record)
    return result


def multi(value: object) -> list[str]:
    return [part.strip() for part in str(value or "").replace("\n", ";").split(";") if part.strip()]


def mpd_dimension(sdg: object) -> str:
    value = str(sdg or "").lower()
    if any(token in value for token in ["sdg 16", "sdg 17", "demokratie", "rechtsstaat", "governance"]):
        return "Demokratie"
    if any(token in value for token in ["sdg 6", "sdg 7", "sdg 12", "sdg 13", "sdg 14", "sdg 15", "klima", "biodivers", "wasser"]):
        return "Planet"
    if any(token in value for token in ["sdg 1", "sdg 2", "sdg 3", "sdg 4", "sdg 5", "sdg 8", "sdg 10", "gesund", "arbeit", "armut", "bildung"]):
        return "Mensch"
    return "Nicht zugeordnet"


def normalize(items_raw, benchmarks_raw, rules_raw, sources_raw):
    benchmarks = {str(row.get("WOK_ID") or ""): row for row in benchmarks_raw}
    rules = {str(row.get("Rule_ID") or ""): row for row in rules_raw}
    source_map = {str(row.get("Source_ID") or ""): row for row in sources_raw}
    result = []
    for row in items_raw:
        identifier = str(row.get("WOK_ID") or "").strip()
        if not identifier:
            continue
        rule = rules.get(str(row.get("Rule_ID") or ""), {})
        benchmark = benchmarks.get(identifier, {})
        item = {
            "id": identifier, "slug": slugify(identifier),
            "sdg_or_sdgplus": row.get("SDG_or_SDGplus", ""),
            "target": row.get("Target/Unterziel", ""),
            "indicator_family": row.get("Indikatorfamilie", ""),
            "item": row.get("Item", ""), "definition": row.get("Definition/Messgröße", ""),
            "unit": row.get("Einheit", ""), "polarity": row.get("Polarity", ""),
            "rule_id": row.get("Rule_ID", ""), "archetype": row.get("Rule_ID", ""),
            "scoring_mode": rule.get("Regeltyp", ""), "input_mode": rule.get("Eingabemodus", ""),
            "thresholds": row.get("Schwellen (WÖk-Klassen)", ""),
            "threshold_status": row.get("Schwellenstatus", ""),
            "threshold_basis": row.get("Grenzwertbasis", ""),
            "benchmark_requirement": row.get("Benchmarkbedarf", ""),
            "benchmark_status": benchmark.get("Active_Status", ""),
            "active_benchmark": {key: benchmark.get(key, "") for key in ["Active_BM_Best", "Active_BM_Neutral", "Active_BM_Warn", "Active_BM_Critical", "Active_Source_ID", "Gültig_ab"]},
            "source_ids": multi(row.get("Source_IDs", "")),
            "source_status": row.get("Quellenstatus", ""),
            "source_detail": row.get("Quelle_detail", ""),
            "calculation": row.get("Berechnungslogik", ""),
            "system_boundary": row.get("Systemgrenze", ""),
            "data_quality_minimum": row.get("Datenqualitätsanforderung", ""),
            "assurance_level_required": row.get("Assurance_Anforderung", ""),
            "publication_readiness": row.get("Fachlogik_Status", ""),
            "audit_priority": row.get("Prüfpriorität", ""), "editorial_note": row.get("Prüfhinweis", ""),
            "valid_from": row.get("Gültig_ab", ""), "valid_to": row.get("Gültig_bis", ""),
            "mpd_dimension": mpd_dimension(row.get("SDG_or_SDGplus", "")),
            "core_field": "WÖk-ID-Register",
        }
        badges = ["geprüft v1.3"]
        if str(item["benchmark_requirement"]).lower() == "ja" and "aktiv" not in str(item["benchmark_status"]).lower():
            badges.append("validierter Benchmark offen")
        if "qual" in str(item["scoring_mode"]).lower() or "hybrid" in str(item["scoring_mode"]).lower():
            badges.append("Fachprüfung erforderlich")
        if item["source_ids"]:
            badges.append("Quelle zugeordnet")
        item["badges"] = badges
        item["sources"] = [{"id": source_id, "name": source_map.get(source_id, {}).get("Organisation", source_id), "title": source_map.get(source_id, {}).get("Titel/Standard", ""), "url": source_map.get(source_id, {}).get("URL", "")} for source_id in item["source_ids"]]
        result.append(item)
    return result


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")


def layout(title: str, description: str, body: str, prefix: str) -> str:
    return f'''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(title)}</title><meta name="description" content="{esc(description)}"><link rel="stylesheet" href="{prefix}assets/css/style.css"><link rel="canonical" href="https://wirkungsoekonomie.de/woek-id-register/"></head><body><header class="site-header"><a class="brand" href="{prefix}index.html"><span class="brand-name">Wirkungsökonomie</span></a><nav class="site-nav"><a href="{prefix}index.html">Start</a><a href="{prefix}begriffe/">Begriffe</a><a href="{prefix}downloads.html">Bibliothek</a><a href="{prefix}suche.html">Suche</a></nav></header><main data-pagefind-body>{body}</main><script src="{prefix}assets/js/main.js"></script></body></html>'''


def overview_page(items: list[dict[str, object]]) -> str:
    body = f'''<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="../index.html">Start</a> / Register</nav><p class="hero-kicker">Geprüftes Arbeitsmodell {VERSION}</p><h1>WÖk-ID Register</h1><p class="hero-subtitle">Öffentliches Register der WÖk-Messgrößen, Regeln, Benchmarkstatus und Prüfpfade.</p><p>Das Register dokumentiert {len(items)} WÖk-IDs. Es macht Messlogik, Systemgrenzen, Quellen, Datenqualität und Assurance sichtbar, ohne aus fehlenden Daten automatische Bewertungen abzuleiten.</p><p class="callout warning">Arbeits- und Governance-Modell, keine Rechtsnorm und keine automatische Steuerungs-, Förder-, Kredit- oder Personenentscheidung.</p><div class="hero-actions"><a class="btn btn-primary" href="../woek-id-register/">Register durchsuchen</a><a class="btn btn-secondary" href="../bibliothek/woek-master-items-register/">v1.3 herunterladen</a></div></div></section>'''
    return layout("WÖk-ID Register", "Geprüftes WÖk-ID Register v1.3.", body, "../")


def register_page(items, sources, rules, audit, changelog, source_hash) -> str:
    embedded = json.dumps({"items": items}, ensure_ascii=False, default=str).replace("<", "\\u003c")
    body = f'''<section class="hero compact-hero"><nav class="breadcrumb"><a href="../index.html">Start</a> / <a href="../register/">Register</a></nav><p class="hero-kicker">Geprüftes Arbeitsmodell {VERSION}</p><h1>WÖk-ID Register Explorer</h1><p class="hero-subtitle">{len(items)} WÖk-IDs mit Regelzuordnung, Quellen, Systemgrenze, Datenqualität und Prüfstatus.</p><p class="callout warning">Leere Messwerte bleiben unbewertet. Aktive Benchmarkwerte werden nur dort ausgewiesen, wo sie validiert sind. Diese Ansicht berechnet keine automatische Entscheidung.</p></section><section class="section"><div class="section-header"><h2>Register durchsuchen</h2><p>Filtert nach Begriffen, SDG-/SDG+-Bezug, Regel und Status.</p></div><form class="woek-register-filters" data-search-exclude><label>Suche<input id="woekSearch" type="search" placeholder="WOK-S-101, Wasser, ESRS"></label><label>Dimension<select id="filterMpd"><option value="">Alle</option><option>Mensch</option><option>Planet</option><option>Demokratie</option><option>Nicht zugeordnet</option></select></label><label>Regel<select id="filterRule"><option value="">Alle</option>{''.join(f'<option>{esc(rule["Rule_ID"])}</option>' for rule in rules if rule.get("Rule_ID"))}</select></label><label>Prüfstatus<select id="filterStatus"><option value="">Alle</option>{''.join(f'<option>{esc(status)}</option>' for status in sorted({str(item["publication_readiness"]) for item in items if item["publication_readiness"]}))}</select></label></form><p class="text-note" id="registerCount"></p><div class="table-wrap"><table class="data-table"><thead><tr><th>WÖk-ID</th><th>Item</th><th>SDG/SDG+</th><th>Dimension</th><th>Regel</th><th>Prüfstatus</th><th>Details</th></tr></thead><tbody id="registerRows"></tbody></table></div></section><section class="section"><div class="card-grid three"><article class="card"><h2 class="card-title">XLSX v1.3</h2><p>Führende geprüfte Arbeits- und Governance-Fassung.</p><a class="text-link" href="../assets/downloads/woek-register/WOeK_Master_Items_v1.3_geprueft.xlsx">XLSX herunterladen</a></article><article class="card"><h2 class="card-title">Prüfprotokoll</h2><p>{len(audit)} dokumentierte Prüf- und Korrekturpunkte.</p><a class="text-link" href="methodik/">Methodik und Einordnung</a></article><article class="card"><h2 class="card-title">Versionierung</h2><p>{len(changelog)} nachvollziehbare Änderungen; v1.2 bleibt archiviert.</p><a class="text-link" href="../dokumente/woek-master-items-final-v1-2/">Historische v1.2</a></article></div></section><script id="woekRegisterData" type="application/json">{embedded}</script><script>const data=JSON.parse(document.getElementById('woekRegisterData').textContent),items=data.items,$=id=>document.getElementById(id),safe=v=>String(v??'').replace(/[&<>"']/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}}[c]));function render(){{const q=$('woekSearch').value.toLowerCase().trim(),mpd=$('filterMpd').value,rule=$('filterRule').value,status=$('filterStatus').value,rows=items.filter(i=>(!q||[i.id,i.item,i.definition,i.sdg_or_sdgplus,i.indicator_family].join(' ').toLowerCase().includes(q))&&(!mpd||i.mpd_dimension===mpd)&&(!rule||i.rule_id===rule)&&(!status||i.publication_readiness===status));$('registerCount').textContent=`${{rows.length}} von ${{items.length}} WÖk-IDs sichtbar`;$('registerRows').innerHTML=rows.slice(0,250).map(i=>`<tr><td><strong>${{safe(i.id)}}</strong></td><td>${{safe(i.item)}}</td><td>${{safe(i.sdg_or_sdgplus)}}</td><td>${{safe(i.mpd_dimension)}}</td><td>${{safe(i.rule_id)}}</td><td>${{safe(i.publication_readiness)}}</td><td><a class="btn btn-secondary table-action" href="${{safe(i.slug)}}/">Details</a></td></tr>`).join('')+(rows.length>250?'<tr><td colspan="7">Bitte die Filter weiter eingrenzen.</td></tr>':'');}}document.querySelectorAll('.woek-register-filters input,.woek-register-filters select').forEach(e=>e.addEventListener('input',render));render();</script>'''
    return layout("WÖk-ID Register Explorer", "WÖk-ID Register v1.3 mit geprüfter Regel-, Benchmark- und Prüfstatuslogik.", body, "../")


def detail_page(item: dict[str, object]) -> str:
    source_rows = "".join(f'<li><strong>{esc(source["id"])}:</strong> {esc(source["name"])}{(" - <a href=\"" + esc(source["url"]) + "\">Quelle</a>") if source.get("url") else ""}</li>' for source in item["sources"]) or "<li>Keine Quelle hinterlegt.</li>"
    body = f'''<section class="hero compact-hero"><nav class="breadcrumb"><a href="../../register/">Register</a> / <a href="../">WÖk-ID Register</a> / {esc(item["id"])}</nav><p class="hero-kicker">WÖk-ID {VERSION}</p><h1>{esc(item["id"])}: {esc(item["item"])}</h1><p class="hero-subtitle">{esc(item["definition"])}</p><p class="callout warning">Arbeits- und Governance-Modell. Ein leerer Messwert erzeugt keinen Score; qualitative oder hybride Fälle benötigen den dokumentierten Prüfpfad.</p></section><section class="section document-detail-grid"><article class="document-detail-main"><h2>Einordnung</h2><p>{esc(item["sdg_or_sdgplus"])} · {esc(item["target"])} · {esc(item["mpd_dimension"])}</p><h2>Messgröße und Einheit</h2><p>{esc(item["definition"])} · {esc(item["unit"])}</p><h2>Regel und Schwellen</h2><p>{esc(item["rule_id"])} · {esc(item["scoring_mode"])}<br>{esc(item["thresholds"])}<br>Status: {esc(item["threshold_status"])}</p><h2>Benchmarkstatus</h2><p>{esc(item["benchmark_requirement"])} · {esc(item["benchmark_status"])}. Historische Berechnungswerte sind von aktiven validierten Benchmarks getrennt.</p><h2>Systemgrenze und Berechnungslogik</h2><p>{esc(item["system_boundary"])}</p><p>{esc(item["calculation"])}</p><h2>Quellen</h2><ul>{source_rows}</ul></article><aside class="document-detail-aside"><dl><dt>Datenqualität</dt><dd>{esc(item["data_quality_minimum"])}</dd><dt>Assurance</dt><dd>{esc(item["assurance_level_required"])}</dd><dt>Fachlogik</dt><dd>{esc(item["publication_readiness"])}</dd><dt>Prüfpriorität</dt><dd>{esc(item["audit_priority"])}</dd><dt>Prüfhinweis</dt><dd>{esc(item["editorial_note"])}</dd></dl></aside></section>'''
    return layout(f'{item["id"]} | WÖk-ID Register', f'Detailseite zur WÖk-ID {item["id"]}.', body, "../../")


def information_page(title: str, text: str, prefix: str) -> str:
    return layout(title, title, f'<section class="hero compact-hero"><h1>{esc(title)}</h1><p class="lead">{esc(text)}</p><p><a class="btn btn-primary" href="../">Zum Register</a></p></section>', prefix)


def main() -> None:
    if not SOURCE_XLSX.exists():
        raise SystemExit(f"Missing reviewed workbook: {SOURCE_XLSX}")
    workbook = load_workbook(SOURCE_XLSX, data_only=True, read_only=True)
    raw_items = records(workbook, "01_Item_Register")
    raw_benchmarks = records(workbook, "02_Benchmarks")
    raw_rules = records(workbook, "03_Scoring_Rules")
    raw_sources = records(workbook, "07_Quellenkatalog")
    audit = records(workbook, "08_Prüfprotokoll")
    changelog = records(workbook, "05_Changelog")
    items = normalize(raw_items, raw_benchmarks, raw_rules, raw_sources)
    if len(items) != 621 or len(raw_rules) != 28:
        raise SystemExit(f"Unexpected v1.3 import: {len(items)} items / {len(raw_rules)} rules")
    source_hash = digest(SOURCE_XLSX)
    payload = {"version": VERSION, "source_hash_sha256": source_hash, "generated_at": datetime.now(timezone.utc).isoformat(), "items": items, "sources": raw_sources, "methods": raw_rules, "audit": audit, "changelog": changelog}
    for directory in [CONTENT_DIR, REGISTER_DIR, OVERVIEW_DIR, LEGACY_TOOL_DIR]:
        directory.mkdir(parents=True, exist_ok=True)
    write_json(CONTENT_DIR / "items.json", items)
    write_json(CONTENT_DIR / "sources.json", raw_sources)
    write_json(CONTENT_DIR / "methods.json", raw_rules)
    write_json(CONTENT_DIR / "audit-findings.json", audit)
    write_json(CONTENT_DIR / "changelog.json", changelog)
    write_json(DATA_PATH, payload)
    (OVERVIEW_DIR / "index.html").write_text(overview_page(items), encoding="utf-8")
    (REGISTER_DIR / "index.html").write_text(register_page(items, raw_sources, raw_rules, audit, changelog, source_hash), encoding="utf-8")
    (REGISTER_DIR / "methodik").mkdir(exist_ok=True)
    (REGISTER_DIR / "methodik/index.html").write_text(information_page("Methodik des WÖk-ID Registers", "WÖk Master Items v1.3 dokumentiert Regeln, Eingabemodi, Systemgrenzen, Datenqualität, Assurance und den getrennten Status aktiver Benchmarks. Es berechnet keine automatische Entscheidung aus unvollständigen Daten.", "../../"), encoding="utf-8")
    (REGISTER_DIR / "quellen").mkdir(exist_ok=True)
    (REGISTER_DIR / "quellen/index.html").write_text(information_page("Quellen des WÖk-ID Registers", "Der Quellenkatalog v1.3 enthält die zugeordneten Organisationen, Standards, Versionen und offiziellen URLs.", "../../"), encoding="utf-8")
    (LEGACY_TOOL_DIR / "index.html").write_text('<!doctype html><meta http-equiv="refresh" content="0; url=../../woek-id-register/"><link rel="canonical" href="https://wirkungsoekonomie.de/woek-id-register/">', encoding="utf-8")
    for item in items:
        detail_dir = REGISTER_DIR / item["slug"]
        detail_dir.mkdir(exist_ok=True)
        (detail_dir / "index.html").write_text(detail_page(item), encoding="utf-8")
    print(f"Built WÖk-ID Register Explorer {VERSION}: {len(items)} IDs, {len(raw_rules)} rules, {len(raw_sources)} sources.")


if __name__ == "__main__":
    main()
