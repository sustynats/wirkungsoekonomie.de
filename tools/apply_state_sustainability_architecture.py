#!/usr/bin/env python3
"""Apply the approved #253 state-sustainability architecture copy to living pages.

This is a deterministic projection helper. It does not invent fach judgements. It only
applies text that is explicitly approved in #253 / #241 and keeps historical artefacts
intact (historical pages receive a dated addendum instead of silent reinterpretation).
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = "state-sustainability-architecture-20260821"
MATERIALITY_MARKER = "state-sustainability-materiality-scope-20260821"
CURRENT_GUIDE_LABEL = "WÖk-Begriffsleitfaden führend v1.7"
CURRENT_GUIDE_SURFACES = [
    "fuer/akademie.html",
    "fuer/buergerinnen.html",
    "fuer/gesundheit.html",
    "fuer/investoren.html",
    "fuer/journalismus.html",
    "fuer/kommunen.html",
    "fuer/kommunen/kommunaler-wirkungsindex.html",
    "fuer/mieter.html",
    "fuer/politik.html",
    "fuer/rente.html",
    "fuer/unternehmen.html",
    "fuer/wirkungseinkommen.html",
    "fuer/wissenschaft-forschung.html",
    "sdg-plus/medien-demokratie/wirkung-politischer-sprache.html",
    "blog/enap-woek-benchmark-fuenf-bundesvorhaben.html",
]
REQUIRED_GLOSSARY_ROUTES = [
    "/begriffe/7-bundeshaushaltsordnung/",
    "/begriffe/vv-bho-wirtschaftlichkeitsuntersuchung-und-erfolgskontrolle/",
    "/begriffe/objektspezifische-staatliche-pruefarchitektur/",
    "/begriffe/wirkungsrelevanz-statt-rechtsform/",
]

STATE_BLOCK = f'''\n<!-- {MARKER} -->
<section class="section section-muted" id="staatliche-nachhaltigkeitsarchitektur" aria-labelledby="staatliche-nachhaltigkeitsarchitektur-title">
  <div class="section-header">
    <p class="hero-kicker">Bestehende Staatsarchitektur und WÖk-Ergänzung</p>
    <h2 id="staatliche-nachhaltigkeitsarchitektur-title">Deutschland prüft Folgen bereits - aber mit unterschiedlichen Verfahren je nach Entscheidungstyp.</h2>
    <p>Für Bundesregelungsvorhaben bilden GGO, Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung und eNAP/eGFA eine institutionalisierte Prüfarchitektur. § 43 GGO umfasst unter anderem Ziel und Notwendigkeit, Sachverhalt und Erkenntnisquellen sowie andere Lösungsmöglichkeiten; § 44 GGO beabsichtigte Wirkungen, unbeabsichtigte Nebenwirkungen und Angaben zur späteren Überprüfung. Für finanzwirksame Maßnahmen verlangt § 7 BHO angemessene Wirtschaftlichkeitsuntersuchungen. Die VV-BHO zu § 7 konkretisiert für Planung und Erfolgskontrolle unter anderem Ausgangslage und Bedarf, hinreichend konkrete Ziele und Zielkonflikte, Lösungsvergleich sowie Zielerreichungs-, Wirkungs- und Wirtschaftlichkeitskontrolle. Die Wirkungskontrolle fragt nach dem ursächlichen Beitrag und bezieht beabsichtigte und unbeabsichtigte Wirkungen sowie Risiken ein. Die Deutsche Nachhaltigkeitsstrategie (DNS), KSG § 13, KAnG § 8 und sektorale Evaluationsregime bilden weitere, nur bei sachlicher Anwendbarkeit heranzuziehende Schichten.</p>
    <p><strong>Die Wirkungsökonomie ersetzt diese Architektur nicht.</strong> Sie ergänzt sie um eine durchgängig objektspezifische Verbindung von Problemprüfung, Zielprüfung, expliziten Wirkpfaden (A→M→ΔZ→R), Wirkungen erster bis dritter Ordnung und Kaskaden, Verteilung und Resilienz, Gegenfaktum und Zurechnung, Omissions-/Delivery-/Kohärenzprüfung, strukturiertem Optionsvergleich unter denselben Ziel- und Schutzräumen, Nichtkompensation harter Schutzgrenzen sowie wiederholbarem Reality Check und versionierter Lernschleife.</p>
    <p>Ein Bezug zu DNS, SDGs oder Indikatoren ist dabei eine Ziel- und Referenzinformation - kein automatischer Kausalitätsnachweis. Indikator ist nicht Wirkung, Output ist nicht Outcome und Beobachtung ist nicht Zurechnung.</p>
    <p><a class="text-link" href="/methodik/">Zur WÖk-Methodik</a> · <a class="text-link" href="/methodik/datenbasis.html">Zu Daten- und Quellenfunktionen</a> · <a class="text-link" href="/quellenarchiv/wok-q-9048/">BHO § 7</a> · <a class="text-link" href="/quellenarchiv/wok-q-9049/">VV-BHO zu § 7</a> · <a class="text-link" href="/quellenarchiv/wok-q-9050/">BMF-Rahmen zwoH</a></p>
  </div>
</section>\n'''

DNS_BLOCK = f'''\n<!-- {MARKER}-dns -->
<section class="section section-muted" aria-labelledby="dns-deutschland-title">
  <div class="section-header">
    <p class="hero-kicker">Deutsche Operationalisierung</p>
    <h2 id="dns-deutschland-title">Von den globalen SDGs zur Deutschen Nachhaltigkeitsstrategie</h2>
    <p>Die 17 UN-SDGs sind der internationale Zielrahmen. Deutschland operationalisiert die Agenda 2030 über die Deutsche Nachhaltigkeitsstrategie mit eigenen Zielen, Indikatoren, Governance und Monitoring. Die WÖk nutzt diese amtliche Ebene als Referenz-, Ziel-, Baseline- und Monitoringquelle. Ein Ziel- oder Indikatorbezug allein beweist jedoch keine Wirkung einer konkreten Maßnahme.</p>
    <p>WÖk-SDG+ bleibt davon getrennt: Es ist eine WÖk-eigene Erweiterung und keine offizielle UN- oder DNS-Kategorie.</p>
  </div>
</section>\n'''

POLITIK_STATE_BLOCK = f'''\n<!-- {MARKER}-politik -->
<section class="section section-muted" aria-labelledby="politik-bestehende-pruefung-title">
  <div class="section-header">
    <p class="hero-kicker">Anschluss statt Neuerfindung</p>
    <h2 id="politik-bestehende-pruefung-title">Was der Bund bereits prüft - und was die WÖk entscheidungstypübergreifend verbindet</h2>
    <p>Gesetzesfolgenabschätzung und Nachhaltigkeitsprüfung sind für Bundesregelungsvorhaben verankert. Für finanzwirksame Maßnahmen verlangen § 7 BHO und die VV-BHO Wirtschaftlichkeitsuntersuchungen sowie begleitende oder abschließende Erfolgskontrollen mit Zielerreichungs-, Wirkungs- und Wirtschaftlichkeitskontrolle. KSG § 13, KAnG § 8, DNS-Governance und sektorale Evaluationsregime kommen nur dort hinzu, wo sie für das konkrete Objekt gelten.</p>
    <p>Die WÖk setzt deshalb nicht bei der Behauptung an, Folgen würden bislang gar nicht geprüft. Ihr Zusatznutzen liegt in der systematischen Vollkette: <strong>Problemprüfung → Zielprüfung → Wirkmechanismus → Zustandsveränderung → System- und Verteilungsfolgen → Gegenfaktum/Zurechnung → Optionsvergleich → Reality Check → Lernen und Nachsteuern</strong>.</p>
    <p><a class="text-link" href="/quellenarchiv/wok-q-9048/">BHO § 7</a> · <a class="text-link" href="/quellenarchiv/wok-q-9049/">VV-BHO zu § 7</a> · <a class="text-link" href="/quellenarchiv/wok-q-9050/">Ziel- und wirkungsorientierte Haushaltsführung</a></p>
  </div>
</section>\n'''

MATERIALITY_BLOCK = f'''\n<!-- {MATERIALITY_MARKER} -->
<section class="section" id="materialitaet-statt-rechtsform" aria-labelledby="materialitaet-statt-rechtsform-title">
  <div class="section-header">
    <p class="hero-kicker">Materialität statt Rechtsform</p>
    <h2 id="materialitaet-statt-rechtsform-title">Warum prüft die WÖk nicht nur Gesetze?</h2>
    <p><strong>Weil Wirkung nicht an der Rechtsform hängt.</strong> Ein Förderprogramm, eine Garantie, eine Infrastrukturinvestition, eine Beschaffungsentscheidung, eine Strategie, eine Verwaltungsentscheidung oder ein langfristiger Vertrag kann größere und längerfristigere Zustandsveränderungen auslösen als manches Gesetz. Deshalb fragt die WÖk zuerst, ob eine staatliche Entscheidung materiell genug für eine systematische Wirkungsprüfung ist. Erst danach wird geklärt, welcher staatliche Prüfrahmen für genau diesen Objekttyp und diese Zuständigkeit gilt.</p>
    <p><strong>Deutschland prüft Folgen bereits - aber mit unterschiedlichen Verfahren je nach Entscheidungstyp.</strong> Für Bundesgesetze und -verordnungen sind GGO §§ 43/44, Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung und eNAP/eGFA besonders formalisiert. Für alle finanzwirksamen Maßnahmen verlangt § 7 BHO angemessene Wirtschaftlichkeitsuntersuchungen; § 7 Absatz 2 BHO verankert dabei ausdrücklich diese Pflicht und die Berücksichtigung der Risikoverteilung. Die VV-BHO konkretisiert Planung, Lösungsvergleich und Erfolgskontrolle einschließlich Zielerreichungs-, Wirkungs- und Wirtschaftlichkeitskontrolle. Die Ziel- und Wirkungsorientierung des Bundeshaushalts (zwoH) entwickelt diese Haushaltsarchitektur weiter.</p>
    <p>Die DNS 2025 bezieht auch Strategien, Programme, Ressortaktivitäten und Verwaltungspraxis ein. KSG § 13, KAnG § 8 sowie Vergabe-, Beteiligungs- und Fachrechtsregeln gelten nur, wenn der jeweilige Gegenstand ihren Anwendungsbereich erfüllt. Außerhalb der Bundesrechtsetzung wird keine allgemeine eNAP-Pflicht behauptet. Eine fehlende öffentliche Dokumentation beweist weder fehlende Prüfung noch fehlende Alternativen oder Ex-post-Kontrolle.</p>
    <p>Die WÖk legt darüber einen einheitlichen materialitätsbasierten Wirkungsmaßstab. Sie weist für jedes Objekt zuerst den anwendbaren staatlichen Prüfrahmen und dessen öffentlichen Dokumentationsstand aus. Danach zeigt sie unabhängig Konvergenz, zusätzliche Befunde oder begründete Abweichungen entlang derselben Problem-, Ziel-, Wirkpfad-, Options- und Reality-Check-Kette.</p>
    <p>Entscheidungen staatseigener oder staatlich dominierter Unternehmen bleiben als <strong>Unternehmensentscheidung</strong> von Eigentümerrolle, politischer Begleitung und belegbarer staatlicher Zurechnung getrennt. Staatliches Eigentum allein macht eine Unternehmensentscheidung weder zur Ministeriumsentscheidung noch zu einem GGO-/eNAP-pflichtigen Regelungsvorhaben.</p>
    <p><a class="text-link" href="/quellenarchiv/wok-q-9029/">GGO §§ 43/44/62</a> · <a class="text-link" href="/quellenarchiv/wok-q-9048/">BHO § 7</a> · <a class="text-link" href="/quellenarchiv/wok-q-9049/">VV-BHO zu § 7</a> · <a class="text-link" href="/quellenarchiv/wok-q-9050/">BMF-Rahmen zwoH</a> · <a class="text-link" href="/quellenarchiv/wok-q-9046/">KSG § 13</a> · <a class="text-link" href="/quellenarchiv/wok-q-9047/">KAnG § 8</a> · <a class="text-link" href="/methodik/externe-quellen.html">Amtliche Quellen und ihre Funktion</a></p>
  </div>
</section>\n'''

HISTORICAL_ADDENDUM = f'''\n<!-- {MARKER}-addendum -->
<section class="section section-muted" aria-labelledby="methodenstand-addendum-20260821-title">
  <div class="section-header">
    <p class="hero-kicker">Fachaddendum · 21.08.2026</p>
    <h2 id="methodenstand-addendum-20260821-title">Einordnung zum heutigen Methodenstand</h2>
    <p>Diese Veröffentlichung bleibt als historischer Stand erhalten. Ergänzend ist festzuhalten: Auf Bundesebene bestehen bereits Gesetzesfolgenabschätzung und Nachhaltigkeitsprüfung nach GGO. § 43 GGO umfasst unter anderem Ziel, Sachverhalt und Alternativen; § 44 GGO beabsichtigte und unbeabsichtigte Folgen, Nachhaltigkeitsbezug und eine angelegte spätere Überprüfung. eNAP/eGFA unterstützt die Nachhaltigkeitsprüfung. Die WÖk-Wirkungsfolgenabschätzung ist daher als weiterführende Integrationsarchitektur zu verstehen - nicht als Erfindung der Folgenprüfung.</p>
    <p>Der aktuelle WÖk-Ansatz verbindet Problem- und Zielprüfung, A→M→ΔZ→R, System-/Verteilungswirkungen, Gegenfaktum/Zurechnung, Omissions-/Delivery-/Kohärenzprüfung, Optionsvergleich, Nichtkompensation und wiederholbaren Reality Check.</p>
  </div>
</section>\n'''

HISTORICAL_SOURCE_ADDENDUM = '''
<!-- state-assessment-bho-addendum-20260821 -->
<section class="section section-muted" aria-labelledby="staatlicher-pruefrahmen-addendum-20260821-title">
  <div class="section-header">
    <p class="hero-kicker">Quellenpräzisierung · 21.08.2026</p>
    <h2 id="staatlicher-pruefrahmen-addendum-20260821-title">Prüfregime unterscheiden sich nach Entscheidungstyp</h2>
    <p>Ergänzend zum damaligen Text gilt: § 7 BHO und die VV-BHO verlangen für finanzwirksame Maßnahmen Wirtschaftlichkeitsuntersuchungen und Erfolgskontrollen. GGO/GFA/eNAP bleibt der Regelungsvorhaben-Untertyp; weitere objekt- und fachrechtliche Rahmen gelten nur in ihrem jeweiligen Anwendungsbereich. WÖk legt darüber einen einheitlichen materialitätsbasierten Wirkungsmaßstab, ohne vorhandene staatliche Prüfung zu negieren.</p>
    <p><a class="text-link" href="/quellenarchiv/wok-q-9048/">BHO § 7</a> · <a class="text-link" href="/quellenarchiv/wok-q-9049/">VV-BHO zu § 7</a> · <a class="text-link" href="/quellenarchiv/wok-q-9050/">BMF-Rahmen zwoH</a></p>
  </div>
</section>
'''


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def write(rel: str, text: str) -> None:
    (ROOT / rel).write_text(text, encoding="utf-8")


def add_before_main(rel: str, block: str, marker: str = MARKER) -> bool:
    path = ROOT / rel
    if not path.exists():
        return False
    text = path.read_text(encoding="utf-8")
    if marker in text:
        return False
    if "</main>" not in text:
        raise RuntimeError(f"No </main> anchor in {rel}")
    text = text.replace("</main>", block + "</main>", 1)
    path.write_text(text, encoding="utf-8")
    return True


def upsert_before_main(rel: str, block: str, marker: str = MARKER) -> bool:
    """Keep one generator-owned public block current without touching other copy."""
    path = ROOT / rel
    if not path.exists():
        return False
    text = path.read_text(encoding="utf-8")
    token = f"<!-- {marker} -->"
    normalized = block.strip("\n")
    start = text.find(token)
    if start < 0:
        return add_before_main(rel, block, marker)
    end = text.find("</section>", start)
    if end < 0:
        raise RuntimeError(f"No closing section for {marker} in {rel}")
    end += len("</section>")
    updated = text[:start] + normalized + text[end:]
    if updated == text:
        return False
    path.write_text(updated, encoding="utf-8")
    return True


def upsert_markdown_section(text: str, heading: str, body: str) -> str:
    block = f"{heading}\n{body.strip()}\n"
    start = text.find(heading)
    if start < 0:
        return text.rstrip() + "\n\n" + block
    end = text.find("\n# ", start + len(heading))
    if end < 0:
        end = len(text)
    return text[:start] + block.rstrip() + text[end:]


def replace_once(rel: str, old: str, new: str) -> bool:
    text = read(rel)
    if new in text:
        return False
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one anchor in {rel}, found {count}: {old[:90]!r}")
    write(rel, text.replace(old, new, 1))
    return True


def sync_current_guide_label(rel: str) -> bool:
    """Update only explicit living surfaces; historical publications remain untouched."""
    path = ROOT / rel
    if not path.exists():
        return False
    text = path.read_text(encoding="utf-8")
    updated = text.replace("WÖk-Begriffsleitfaden führend v1.6", CURRENT_GUIDE_LABEL)
    updated = updated.replace(
        "Führender Begriffsleitfaden der Wirkungsökonomie v1.6",
        "Führender Begriffsleitfaden der Wirkungsökonomie v1.7",
    )
    if updated == text:
        return False
    path.write_text(updated, encoding="utf-8")
    return True


def ensure_glossary_sitemap_routes() -> bool:
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists():
        return False
    xml = sitemap.read_text(encoding="utf-8")
    additions: list[str] = []
    for route in REQUIRED_GLOSSARY_ROUTES:
        public_file = ROOT / route.lstrip("/") / "index.html"
        location = f"https://wirkungsoekonomie.de{route}"
        if public_file.exists() and f"<loc>{location}</loc>" not in xml:
            additions.append(f"  <url><loc>{location}</loc><lastmod>2026-08-21</lastmod></url>")
    if not additions:
        return False
    xml = xml.replace("</urlset>", f"{'\n'.join(additions)}\n</urlset>")
    sitemap.write_text(xml, encoding="utf-8")
    return True


def main() -> int:
    changed: list[str] = []

    for guide_surface in CURRENT_GUIDE_SURFACES:
        if sync_current_guide_label(guide_surface):
            changed.append(guide_surface)

    if ensure_glossary_sitemap_routes():
        changed.append("sitemap.xml")

    # Start page: preserve the critique but explicitly delimit 'Wirkungsblindheit'.
    rel = "index.html"
    old = "Unsere Steuerung ist wirkungsblind. Was Entscheidungen bei Menschen, Ökosystemen und Institutionen wirklich anrichten oder aufbauen, fließt nicht in die Entscheidungen zurück."
    new = "Unsere Steuerung bleibt in einem wichtigen Sinn wirkungsblind: Nicht weil Folgen grundsätzlich ungeprüft wären - für Bundesregelungsvorhaben bestehen bereits Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung, DNS-Monitoring und eNAP/eGFA. Die Lücke liegt in der durchgängigen Rückkopplung: Welche Zustände Entscheidungen bei Menschen, Ökosystemen und Institutionen tatsächlich verändern, wie sich Alternativen unter denselben Ziel- und Schutzräumen unterscheiden und was spätere Beobachtungen für die nächste Entscheidung bedeuten."
    if replace_once(rel, old, new):
        changed.append(rel)
    if upsert_before_main(rel, STATE_BLOCK):
        changed.append(rel)
    if upsert_before_main(rel, MATERIALITY_BLOCK, MATERIALITY_MARKER):
        changed.append(rel)

    # Politics: correct the total-absence framing, make Problem Review precede Goal Review,
    # and describe GFA as an existing architecture to be deepened rather than invented.
    rel = "fuer/politik.html"
    old = "Das Problem liegt nicht darin, dass Politik nichts tut. Das Problem liegt darin, dass Politik zu spät sieht, was ihr Handeln tatsächlich verändert."
    new = "Das Problem liegt nicht darin, dass Politik nichts tut - und auch nicht darin, dass der Bund grundsätzlich keine Folgen prüft. Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung, eNAP/eGFA und DNS-Monitoring sind bereits Teil der staatlichen Architektur. Die offene Aufgabe ist, Problem, Ziel, Wirkmechanismus, Zustandsveränderung, Alternativen, System- und Verteilungsfolgen sowie spätere Beobachtungen durchgängig miteinander zu verbinden."
    if replace_once(rel, old, new):
        changed.append(rel)
    old = "<li>Bessere Gesetzesfolgenabschätzung.</li>"
    new = "<li>Bestehende Gesetzesfolgenabschätzung systematisch vertiefen und mit Wirkpfad, Gegenfaktum, Optionsvergleich, Schutzgrenzen und Reality Check verknüpfen.</li>"
    if replace_once(rel, old, new):
        changed.append(rel)
    old = "<ol class=\"scanner-path master-path\"><li>Politisches Ziel</li><li>Maßnahme / Gesetz / Haushalt</li><li>betroffene Wirkungsräume</li><li>Daten und Indikatoren</li><li>Zielkonflikte und Nebenwirkungen</li><li>Wirkungsbewertung</li><li>Haushalt / Recht / Steuer / Beschaffung</li><li>Rückkopplung</li><li>Evaluation</li><li>Anpassung</li></ol>"
    new = "<ol class=\"scanner-path master-path\"><li>Problemprüfung: Gibt es das Problem - und was ist Ursache, Symptom oder Risiko?</li><li>Zielprüfung: Ist der Zielzustand problemadäquat und tragfähig?</li><li>Maßnahme / Gesetz / Haushalt</li><li>Wirkmechanismus und erwartete Zustandsveränderung</li><li>Daten, Indikatoren und Gegenfaktum</li><li>Wirkungen 1.-3. Ordnung, Verteilung, Resilienz und Schutzgrenzen</li><li>reale Alternativen und Optionsvergleich</li><li>Umsetzung in Haushalt / Recht / Steuer / Beschaffung</li><li>Beobachtung, Zurechnung und Reality Check</li><li>Lernen und Nachsteuern</li></ol>"
    if replace_once(rel, old, new):
        changed.append(rel)
    if upsert_before_main(rel, POLITIK_STATE_BLOCK, f"{MARKER}-politik"):
        changed.append(rel)
    if upsert_before_main(rel, MATERIALITY_BLOCK, MATERIALITY_MARKER):
        changed.append(rel)

    # Core living pages: add the same fair Anschluss architecture. The block is deliberately
    # uniform so the semantic statement has one source of truth and can be audited sitewide.
    state_pages = [
        "modell.html",
        "methodik/index.html",
        "methodik/datenbasis.html",
        "methodik/daten-standards-regularien.html",
        "methodik/externe-quellen.html",
        "verstehen/index.html",
        "wirkungsfelder/staat-recht-demokratie/index.html",
        "wirkungsfelder/staat-recht-demokratie/staat-als-wirkungsarchitektur-resilienzstaat/index.html",
        "wirkungsfelder/staat-recht-demokratie/wirkung-als-rechtsprinzip-wstg/index.html",
        "wirkungsfelder/staat-recht-demokratie/wirkungsrat-governance/index.html",
        "wirkungswissenschaften/index.html",
    ]
    for rel in state_pages:
        if upsert_before_main(rel, STATE_BLOCK):
            changed.append(rel)

    materiality_pages = [
        "modell.html",
        "methodik/index.html",
        "wirkungsfelder/staat-recht-demokratie/index.html",
    ]
    for rel in materiality_pages:
        if upsert_before_main(rel, MATERIALITY_BLOCK, MATERIALITY_MARKER):
            changed.append(rel)

    # DNS-reference pages: keep the international SDG and WÖk-SDG+ layers distinct.
    dns_pages = [
        "verstehen/regularien-standards/index.html",
        "verstehen/sdgs-sdgplus/index.html",
        "sdg-plus/index.html",
        "referenzrahmen/index.html",
    ]
    for rel in dns_pages:
        if upsert_before_main(rel, DNS_BLOCK, f"{MARKER}-dns"):
            changed.append(rel)

    # Historical Wirkungshaushalt publication: visible addendum, never silent historical rewrite.
    rel = "wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/index.html"
    if upsert_before_main(rel, HISTORICAL_ADDENDUM, f"{MARKER}-addendum"):
        changed.append(rel)
    if upsert_before_main(rel, HISTORICAL_SOURCE_ADDENDUM, "state-assessment-bho-addendum-20260821"):
        changed.append(rel)

    # Machine-readable model context for LLM/search consumers.
    llms = ROOT / "llms.txt"
    if llms.exists():
        text = llms.read_text(encoding="utf-8")
        state_heading = f"# Staatliche Nachhaltigkeits- und Gesetzesfolgenarchitektur ({MARKER})"
        state_body = """Deutschland prüft Folgen bereits, aber mit unterschiedlichen Verfahren je nach Entscheidungstyp. Für Bundesregelungsvorhaben sind insbesondere DNS, GGO §§ 43/44, GFA/Nachhaltigkeitsprüfung und eNAP/eGFA als bestehende Referenz-, Prüf- und Monitoringebenen zu berücksichtigen. Für alle finanzwirksamen Maßnahmen verlangt § 7 BHO angemessene Wirtschaftlichkeitsuntersuchungen; die VV-BHO zu § 7 konkretisiert Planung, Ausgangslage/Bedarf, Ziele/Zielkonflikte, Lösungsvergleich sowie Zielerreichungs-, Wirkungs- und Wirtschaftlichkeitskontrolle. KSG § 13, KAnG § 8, DNS-Governance und sektorale Evaluationsregime gelten nur, wenn sie für das jeweilige Objekt anwendbar sind. WÖk ergänzt diese verteilte Architektur durch die systematische objektspezifische Vollkette aus Problem Review, Goal Review, A→M→ΔZ→R, Wirkungen 1.-3. Ordnung/Kaskaden, Verteilung/Resilienz, Gegenfaktum/Attribution, Omissions/Delivery/Policy Coherence, strukturiertem Optionsvergleich, Nichtkompensation, Reality Check und versionierter Lernschleife. DNS-/SDG-Zielbezug ist kein Kausalitätsbeweis. Fehlende öffentliche Dokumentation ist kein Beweis fehlender Prüfung."""
        updated = upsert_markdown_section(text, state_heading, state_body)
        materiality_llms_marker = f"# Materialität statt Rechtsform ({MATERIALITY_MARKER})"
        materiality_body = """WÖk prüft materielles staatliches Handeln unabhängig davon, ob es als LAW, REGULATION, STRATEGY, PROGRAMME, SUBSIDY, GUARANTEE, PROCUREMENT, PUBLIC_INVESTMENT, ADMINISTRATIVE_DECISION, INTERNATIONAL_AGREEMENT, PUBLIC_OWNERSHIP_ACTION oder OTHER_MATERIAL_ACTION erfolgt. Für jedes Objekt werden Zuständigkeit, anwendbare staatliche Prüfrahmen, staatliche Problem-/Bedarfsprüfung, Optionsvergleich, Ex-ante-Folgenprüfung, Erfolgs-/Wirkungskontrolle, Zurechnungsmethode, öffentliche Dokumentation und WÖk-Materialitätsgrund getrennt ausgewiesen. GGO/eNAP ist der Regelungsvorhaben-Untertyp; BHO/VV-BHO ist der Rahmen für finanzwirksame Maßnahmen; weitere Rahmen werden nur bei objektiver Anwendbarkeit zugeordnet. Entscheidungen staatseigener Unternehmen bleiben von Eigentümerrolle, politischer Begleitung und nachgewiesener Regierungszurechnung getrennt. Code oder Renderer erzeugen daraus kein WÖk-Fachurteil."""
        updated = upsert_markdown_section(updated, materiality_llms_marker, materiality_body)
        normalized_updated = updated.rstrip() + "\n"
        if normalized_updated != text:
            llms.write_text(normalized_updated, encoding="utf-8")
            changed.append("llms.txt")

    print(f"Applied #253 approved architecture to {len(set(changed))} files")
    for rel in sorted(set(changed)):
        print(rel)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
