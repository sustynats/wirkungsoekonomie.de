#!/usr/bin/env python3
"""Project the approved #253 official-source/data-function layer into living method pages.

This helper is intentionally deterministic and idempotent. It adds only the source roles and
institutional distinctions approved in issue #253 and leaves historical publications intact.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = "state-sustainability-sources-20260821"


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def write(rel: str, text: str) -> None:
    (ROOT / rel).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, rel: str) -> str:
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{rel}: expected one anchor, got {count}: {old[:100]!r}")
    return text.replace(old, new, 1)


def insert_before(text: str, anchor: str, block: str, rel: str) -> str:
    if block in text:
        return text
    count = text.count(anchor)
    if count != 1:
        raise RuntimeError(f"{rel}: expected one insertion anchor, got {count}: {anchor[:100]!r}")
    return text.replace(anchor, block + anchor, 1)


def update_datenbasis() -> None:
    rel = "methodik/datenbasis.html"
    text = read(rel)
    text = replace_once(
        text,
        'content="Wie die Wirkungsökonomie bestehende Standards wie SDGs, CSRD, ESRS, GRI, NACE und digitale Produktpässe nutzt, um Wirkung messbar und steuerungswirksam zu machen."',
        'content="Wie die Wirkungsökonomie SDGs, Deutsche Nachhaltigkeitsstrategie, DNS-Indikatoren, GGO/GFA, eNAP/eGFA sowie CSRD, ESRS, GRI, NACE und weitere Datenräume nach ihrer Quellenfunktion einordnet."',
        rel,
    )
    text = replace_once(
        text,
        'content="Methodikseite zu SDGs, SDG+, CSRD, ESRS, GRI, EU-Taxonomie, NACE, DPP, Lieferketten, WÖk-IDs, Scorecards, NWI und Wirkungssteuer."',
        'content="Methodikseite zu SDGs, DNS 2025, DNS-Indikatoren, GGO/GFA, Nachhaltigkeitsprüfung, eNAP/eGFA, CSRD, ESRS, GRI, EU-Taxonomie, NACE, DPP, WÖk-IDs, Scorecards und Wirkungssteuer."',
        rel,
    )
    text = replace_once(
        text,
        'content="Datenbasis, Methodik, CSRD, ESRS, GRI, SDG, SDG+, WÖk-ID, Scorecard, NWI, Wirkungssteuer, Benchmark, Archetypen"',
        'content="Datenbasis, Methodik, DNS, Deutsche Nachhaltigkeitsstrategie, DNS-Indikator, GGO, GFA, Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung, eNAP, eGFA, CSRD, ESRS, GRI, SDG, SDG+, WÖk-ID, Scorecard, WÖk-Netto-Wirkungsindex, Wirkungssteuer, Benchmark"',
        rel,
    )
    text = replace_once(
        text,
        '<p class="hero-subtitle">Die Wirkungsökonomie setzt auf vorhandenen Datenstrukturen auf. Relevante Informationen entstehen bereits heute in Nachhaltigkeitsberichten, Lieferketten, Produktdaten, digitalen Produktpässen, Standards und regulatorischen Berichtssystemen.</p>',
        '<p class="hero-subtitle">Die Wirkungsökonomie setzt auf vorhandenen Daten- und Prüfstrukturen auf. Relevante Informationen entstehen bereits heute in Nachhaltigkeitsberichten, Lieferketten, Produktdaten und Standards - aber auch in der Deutschen Nachhaltigkeitsstrategie, im DNS-Indikatorenmonitoring von Destatis sowie in Gesetzesfolgenabschätzung und Nachhaltigkeitsprüfung des Bundes.</p>',
        rel,
    )
    text = replace_once(
        text,
        '<p>Der Bewertungsrahmen ist keine persönliche Moral, sondern ein öffentlicher Referenzrahmen: SDGs, Agenda 2030 und SDG+. Positive Netto-Wirkung stärkt diesen Rahmen. Negative Wirkung schwächt ihn.</p>',
        '<p>Der Bewertungsrahmen ist keine persönliche Moral. Global dienen SDGs und Agenda 2030 als Referenz; für Deutschland kommt die Deutsche Nachhaltigkeitsstrategie mit Zielen, Indikatoren und Monitoring hinzu. SDG+ ist eine WÖk-eigene Erweiterung für zusätzliche demokratische, mediale, rechtliche und digitale Wirkungsräume. Referenz und Wirkung bleiben getrennt: Zielbezug ist kein Kausalitätsnachweis.</p>',
        rel,
    )

    option_anchor = '              <option>SDG+</option>\n'
    options = '              <option>DNS</option>\n              <option>DNS-Indikatoren</option>\n              <option>GFA</option>\n              <option>eNAP/eGFA</option>\n'
    if options not in text:
        text = insert_before(text, option_anchor, options, rel)

    row_anchor = '          <article role="row" data-source="SDG+" data-impact="Demokratie" data-instrument="Scorecard WÖk-ID NWI">'
    state_rows = f'''          <!-- {MARKER} -->
          <article role="row" data-source="DNS" data-impact="Mensch Planet Demokratie" data-instrument="Benchmark Datenqualität WÖk-ID">
            <strong>Deutsche Nachhaltigkeitsstrategie (DNS)</strong>
            <span>Nationaler Ziel-, Management- und Monitoringrahmen für die Agenda 2030 in Deutschland.</span>
            <span>Deutsche Ziele, Indikatoren, Transformationsbereiche, Governance und Monitoring.</span>
            <span><strong>Datenfunktion:</strong> REFERENCE / TARGET / BASELINE / MONITORING / CONTEXT. Nicht automatisch CAUSAL_EVIDENCE.</span>
            <a class="text-link" href="https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/deutsche-nachhaltigkeitsstrategie-2025-2332540" rel="noopener noreferrer">Bundesregierung: DNS 2025</a>
            <span>Weiterentwicklung 2025</span>
          </article>
          <article role="row" data-source="DNS-Indikatoren" data-impact="Mensch Planet Demokratie" data-instrument="Benchmark Datenqualität WÖk-ID">
            <strong>DNS-Indikatoren / Destatis</strong>
            <span>Amtliches Monitoring des Zustands und der Zielerreichung der Deutschen Nachhaltigkeitsstrategie.</span>
            <span>Zeitreihen, Zielwerte, Trends und Indikatorenberichte.</span>
            <span><strong>Datenfunktion:</strong> BASELINE / TARGET / MONITORING / REALITY_CHECK. Ein Indikator ist nicht die Wirkung und seine Bewegung beweist keine Attribution.</span>
            <a class="text-link" href="https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html" rel="noopener noreferrer">Destatis: Nachhaltigkeitsindikatoren</a>
            <span>laufendes Monitoring</span>
          </article>
          <article role="row" data-source="GFA" data-impact="Mensch Planet Demokratie" data-instrument="Benchmark Datenqualität">
            <strong>GGO §§ 43/44 · Gesetzesfolgenabschätzung</strong>
            <span>Bestehende staatliche Ex-ante-Folgenprüfung für Bundesregelungsvorhaben.</span>
            <span>Ziel/Notwendigkeit, Sachverhalt/Erkenntnisquellen und Alternativen; beabsichtigte Wirkungen, unbeabsichtigte Nebenwirkungen, Nachhaltigkeitsbezug sowie Angaben zur späteren Überprüfung.</span>
            <span><strong>Quellenfunktion:</strong> STATE_EX_ANTE_ASSESSMENT / REFERENCE / CONTEXT. Staatliche Einschätzung bleibt vom unabhängigen WÖk-Urteil getrennt.</span>
            <a class="text-link" href="https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm" rel="noopener noreferrer">GGO §§ 43 und 44</a>
            <span>geltende GGO</span>
          </article>
          <article role="row" data-source="eNAP/eGFA" data-impact="Mensch Planet Demokratie" data-instrument="Benchmark Datenqualität">
            <strong>Nachhaltigkeitsprüfung · eNAP / eGFA</strong>
            <span>Digital unterstützte Nachhaltigkeitsprüfung innerhalb der staatlichen Gesetzesfolgenabschätzung.</span>
            <span>SDG-/DNS-Bezüge, Ziele und Indikatoren sowie dokumentierte positive/negative Nachhaltigkeitsaspekte und Zielkonflikte, soweit im Verfahren einschlägig.</span>
            <span><strong>Quellenfunktion:</strong> STATE_EX_ANTE_ASSESSMENT / REFERENCE. Öffentliche GFA-Dokumentation ist nicht automatisch ein veröffentlichter eNAP-Rohexport.</span>
            <a class="text-link" href="https://plattform.egesetzgebung.bund.de/cockpit/#/egfa" rel="noopener noreferrer">E-Gesetzgebung: eGFA/eNAP</a>
            <span>laufendes Bundesverfahren</span>
          </article>
'''
    if MARKER not in text:
        text = insert_before(text, row_anchor, state_rows, rel)
    write(rel, text)


def update_external_sources() -> None:
    rel = "methodik/externe-quellen.html"
    text = read(rel)
    marker = f"<!-- {MARKER}-external -->"
    if marker in text:
        return
    block = f'''\n{marker}
<section class="section" id="staatliche-primarquellen" aria-labelledby="staatliche-primarquellen-title">
  <div class="section-header">
    <p class="hero-kicker">Amtliche Primärquellen · Deutschland</p>
    <h2 id="staatliche-primarquellen-title">Zielrahmen, Ex-ante-Prüfung und Monitoring getrennt führen</h2>
    <p>Für Bundesregelungsvorhaben behandelt die WÖk die bestehende staatliche Architektur als eigene Quellenebene. Sie ist weder bloß Kontext noch automatisch Kausalbeweis.</p>
  </div>
  <div class="card-grid three">
    <article class="card"><p class="card-kicker">REFERENCE · TARGET · MONITORING</p><h3 class="card-title">DNS 2025 und Destatis</h3><p class="card-text">Die DNS liefert nationale Ziele und Governance; Destatis liefert Indikatoren, Zeitreihen und Zielstandsmonitoring. Indikatorbewegung ist nicht Attribution einer Einzelmaßnahme.</p><p><a class="text-link" href="https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/deutsche-nachhaltigkeitsstrategie-2025-2332540" rel="noopener noreferrer">DNS 2025</a> · <a class="text-link" href="https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html" rel="noopener noreferrer">Destatis</a></p></article>
    <article class="card"><p class="card-kicker">STATE_EX_ANTE_ASSESSMENT</p><h3 class="card-title">GGO §§ 43/44 und GFA</h3><p class="card-text">Ziel, Sachverhalt, Alternativen, beabsichtigte Wirkungen, unbeabsichtigte Nebenwirkungen, Nachhaltigkeitsbezug und die angelegte spätere Überprüfung sind bereits Bestandteil der Bundesarchitektur.</p><p><a class="text-link" href="https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm" rel="noopener noreferrer">GGO</a> · <a class="text-link" href="https://www.bmj.de/DE/ministerium/nachhaltigkeit/gesetzgebung/gesetzgebung_artikel.html" rel="noopener noreferrer">BMJV Nachhaltige Gesetzgebung</a></p></article>
    <article class="card"><p class="card-kicker">DIGITALES PRÜFWERKZEUG</p><h3 class="card-title">eNAP / eGFA / E-Gesetzgebung</h3><p class="card-text">eNAP unterstützt die Nachhaltigkeitsprüfung digital. Fehlt eine öffentlich auffindbare eNAP-Zusammenfassung, lautet der Dokumentationsstatus NOT_PUBLICLY_ESTABLISHED - nicht automatisch NOT_ASSESSED.</p><p><a class="text-link" href="https://plattform.egesetzgebung.bund.de/cockpit/#/egfa" rel="noopener noreferrer">eGFA/eNAP</a></p></article>
  </div>
</section>
'''
    if "</main>" not in text:
        raise RuntimeError(f"{rel}: no main end")
    text = text.replace("</main>", block + "</main>", 1)
    write(rel, text)


def update_glossary_pbnez_source() -> None:
    rel = "content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json"
    data = json.loads(read(rel))
    changed = False
    for term in data.get("terms", []):
        if term.get("termId") == "parlamentarischer-beirat-nachhaltige-entwicklung":
            sources = term.setdefault("officialSources", [])
            official = "Deutscher Bundestag: Parlamentarischer Beirat für nachhaltige Entwicklung und Zukunftsfragen (PBnEZ)|https://www.bundestag.de/ausschuesse/weitere_gremien/pbnez"
            if official not in sources:
                sources.insert(0, official)
                changed = True
            term["sourceProvenance"] = "Aktuelle institutionelle Bezeichnung und Funktion aus dem Deutschen Bundestag; ergänzende Verfahrenseinordnung aus BMJV/GGO."
    if changed:
        write(rel, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def main() -> int:
    update_datenbasis()
    update_external_sources()
    update_glossary_pbnez_source()
    print("Applied #253 source-function projection to data basis, external sources and PBnEZ glossary provenance.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
