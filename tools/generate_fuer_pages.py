#!/usr/bin/env python3
"""Generate /fuer/ target-group pages with a shared why-first structure."""

from __future__ import annotations

import html
from pathlib import Path

import sync_layout


ROOT = Path(__file__).resolve().parents[1]
FUER = ROOT / "fuer"
VERSION = "20260522-warum-first"
SENSITIVE = {"politik.html", "rente.html", "wirkungseinkommen.html", "investoren.html", "wirkungssteuer.html"}
STATUS_TEXT = (
    "Diese Seite erklärt die aktuelle Systematik der Wirkungsökonomie. Sie ersetzt keine Rechts-, Steuer-, "
    "Anlage- oder Politikberatung. Konkrete Zahlen und gesetzliche Ausgestaltungen gelten nur, wenn sie "
    "ausdrücklich als freigegebener Modellstand gekennzeichnet sind."
)


def e(value: str) -> str:
    return html.escape(value, quote=True)


def paras(items: list[str]) -> str:
    return "".join(f"<p>{e(item)}</p>" for item in items)


def card_grid(items: list[dict[str, str]], class_name: str = "card-grid") -> str:
    return f'<div class="{class_name}">' + "".join(
        f'<article class="card"><h3 class="card-title">{e(item["title"])}</h3><p class="card-text">{e(item["text"])}</p></article>'
        for item in items
    ) + "</div>"


def structured_cards(items: list[dict[str, str]]) -> str:
    return '<div class="card-grid">' + "".join(
        f"""<article class="card target-card">
          <h3 class="card-title">{e(item["title"])}</h3>
          <dl>
            <div><dt>Problem heute</dt><dd>{e(item["problem"])}</dd></div>
            <div><dt>WÖk-Verschiebung</dt><dd>{e(item["shift"])}</dd></div>
            <div><dt>Konkreter Nutzen</dt><dd>{e(item["benefit"])}</dd></div>
          </dl>
        </article>"""
        for item in items
    ) + "</div>"


def compare_table(rows: list[dict[str, str]]) -> str:
    return '<div class="why-compare-grid">' + "".join(
        f"""<article class="compare-card">
          <h3>{e(row["topic"])}</h3>
          <div class="compare-two-column">
            <div><p class="hero-kicker">Heute</p><p>{e(row["today"])}</p></div>
            <div><p class="hero-kicker">Wirkungsökonomie</p><p>{e(row["woek"])}</p></div>
          </div>
        </article>"""
        for row in rows
    ) + "</div>"


def path(items: list[str]) -> str:
    return '<ol class="scanner-path">' + "".join(f"<li>{e(item)}</li>" for item in items) + "</ol>"


def links(items: list[tuple[str, str]]) -> str:
    return '<div class="button-row">' + "".join(
        f'<a class="btn {button_class}" href="{e(href)}">{e(label)}</a>'
        for index, (label, href) in enumerate(items)
        for button_class in ("btn-primary" if index == 0 else "btn-secondary",)
    ) + "</div>"


def source_panel(status: str, sources: list[str]) -> str:
    return f"""<details class="source-panel" open>
      <summary>Grundlage dieser Seite</summary>
      <div>
        <p class="hero-kicker">Evidenz / Stand</p>
        <h2>Grundlage dieser Seite</h2>
        <ul class="source-list">{"".join(f"<li>{e(item)}</li>" for item in sources)}</ul>
        <div class="source-meta"><span>Status: {e(status)}</span><span>Stand: 22. Mai 2026</span><span>Keine Rechts-, Steuer-, Anlage- oder Leistungsberatung</span></div>
      </div>
    </details>"""


def shell(slug: str, title: str, description: str, body: str, tags: str, noindex: bool = False) -> str:
    robots = '<meta name="robots" content="noindex, nofollow">' if noindex else ""
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{e(title)}</title>
    <meta name="description" content="{e(description)}">
    <link rel="canonical" href="https://wirkungsoekonomie.de/fuer/{e(slug)}">
    {robots}
    <meta name="search_title" content="{e(title)}">
    <meta name="search_description" content="{e(description)}">
    <meta name="search_type" content="Zielgruppenseite">
    <meta name="search_section" content="Für wen">
    <meta name="search_tags" content="{e(tags)}">
    <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../assets/css/style.css">
  </head>
  <body>
{sync_layout.render(sync_layout.HEADER_TEMPLATE, "../")}
    <main data-pagefind-body>
{body}
    </main>
{sync_layout.render(sync_layout.FOOTER_TEMPLATE, "../")}
    <script src="../assets/js/main.js?v={VERSION}"></script>
  </body>
</html>
"""


COMMON_SOURCES = [
    "Führender Begriffsleitfaden der Wirkungsökonomie",
    "Die neue Ordnung des Wohlstands",
    "interne Working Papers und Systemmodell der Wirkungsökonomie",
    "Evidenzhub, Quellenregister und Methodikseiten",
    "relevante externe Standards und Datenrahmen",
]


VISUAL_ALTS = {
    "woek_07_politik_reparaturstaat_wirkungsarchitektur": "Vergleich Reparaturstaat mit Subventionen und Sonderregeln gegenüber Wirkungsarchitektur mit Prüfung, Haushalt und Evaluation.",
    "woek_08_unternehmen_change_roadmap": "Zehnstufige Roadmap von Readiness-Prüfung über Wirkungsfelder, Daten, Baseline und Risiko bis Rückkopplung.",
    "woek_11_wohnen_wirkungsraum": "Vergleich von Wohnen als Anlageklasse mit Wohnen als Wirkungsraum für Bezahlbarkeit, Energie, Gesundheit und Quartier.",
    "woek_14_wirkungseinkommen_wirkungsrente_konzept": "Vergleich der alten Kopplung Arbeit, Einkommen, Steuern, Rente mit einer Wirkungslogik für Sicherheit und Anerkennung.",
}


def visual_figure(visual_id: str, caption: str, *, scroll: bool = False) -> str:
    alt = VISUAL_ALTS[visual_id]
    scroll_class = " woek-visual-scroll" if scroll else ""
    return f"""<figure class="woek-visual-figure{scroll_class}">
          <picture>
            <source srcset="../assets/visuals/woek/{visual_id}.webp" type="image/webp">
            <img class="woek-visual" src="../assets/visuals/woek/{visual_id}.png" alt="{e(alt)}" width="1600" height="900" loading="lazy" decoding="async">
          </picture>
          <figcaption class="woek-visual-caption">{e(caption)}</figcaption>
        </figure>"""


POLITIK = {
    "title": "Politik mit Wirkung",
    "subtitle": "Vom Reparaturstaat zur Wirkungsarchitektur.",
    "description": "Warum Politik Wirkung braucht und die Wirkungsökonomie demokratische Steuerung präventiver, nachvollziehbarer und lernfähiger macht.",
    "status": "needs_review",
    "tags": "Politik Wirkung, Wirkungshaushalt, Gesetzesfolgenabschätzung, Wirkungsprüfung, demokratische Politik, Reparaturstaat",
}


PEOPLE = {
    "unternehmen.html": {
        "title": "Wirkungsorientierte Unternehmensführung",
        "subtitle": "Vom Nachhaltigkeitsbericht zur Steuerungslogik für Resilienz, Kapitalfähigkeit und bessere Entscheidungen.",
        "description": "Warum Unternehmen Wirkung nicht nur berichten, sondern steuern müssen.",
        "status": "veröffentlicht",
        "noindex": False,
        "hero": "Unternehmen stehen vor härteren Lieferketten-, Energie-, Kapital- und Regulierungsrisiken. Reines Reporting reicht nicht mehr, wenn Wirkung über Resilienz, Finanzierung und Zukunftsfähigkeit entscheidet.",
        "wrong": "Nachhaltigkeit wird oft als Berichtspflicht, Label oder Kostenstelle behandelt, obwohl die eigentlichen Risiken in Lieferketten, Produkten, Energie, Kapital und Geschäftsmodell entstehen.",
        "not_enough": "ESG-Berichte, CSRD-Tabellen und einzelne CSR-Projekte beschreiben vieles, verändern aber noch nicht automatisch Einkauf, Innovation, Investitionen oder Strategie.",
        "need": "Unternehmen brauchen die WÖk, weil Wirkung zur Führungsinformation wird: Sie zeigt, wo ein Geschäftsmodell Zukunft schützt oder Risiken versteckt.",
        "shift": "Von Nachhaltigkeit als Pflicht zu Wirkung als Unternehmenssteuerung.",
        "issue_cards": [
            {"title": "Reporting reicht nicht", "text": "Berichte schaffen Transparenz, aber ohne Rückkopplung bleiben Entscheidungen oft wirkungsblind."},
            {"title": "Lieferketten werden fragiler", "text": "Günstige Beschaffung kann Wasser-, Arbeits-, Klima- oder Regulierungsrisiken verdecken."},
            {"title": "Kapital fragt nach Zukunft", "text": "Finanzierung wird schwieriger, wenn Risiken nicht belastbar, vergleichbar und steuerbar sind."},
            {"title": "Greenwashing wird teuer", "text": "Unklare Nachhaltigkeitsversprechen beschädigen Vertrauen, Marke und Managementqualität."},
        ],
        "why_better": "Die WÖk ist kein moralischer Zusatz. Sie macht sichtbar, welche Wirkung ein Unternehmen erzeugt und wie diese Wirkung auf Risiken, Kapital, Innovation, Beschaffung und Strategie zurückwirkt.",
        "benefits": [
            {"title": "Resilienz", "text": "Risiken in Lieferketten, Energie, Rohstoffen und Regulierung werden früher sichtbar."},
            {"title": "Kapitalfähigkeit", "text": "Wirkungsdaten stärken die Anschlussfähigkeit an CSRD, ESRS, Taxonomie, DPP und Finanzierungsgespräche."},
            {"title": "Bessere Entscheidungen", "text": "Management sieht nicht nur Kosten, sondern verdeckte Folgekosten, Chancen und Transformationsrisiken."},
            {"title": "Innovation", "text": "Produktentwicklung richtet sich stärker an Lösungen mit positiver Netto-Wirkung aus."},
            {"title": "Glaubwürdigkeit", "text": "Wirkung ersetzt pauschale Nachhaltigkeitsbehauptungen durch prüfbare Daten und Wirkungspfade."},
            {"title": "Arbeitgeberattraktivität", "text": "Sinn, Verantwortung und Zukunftsfähigkeit werden führbar statt nur kommunizierbar."},
        ],
        "compare": [
            {"topic": "Nachhaltigkeit", "today": "Bericht, Pflicht, Risiko, Kostenstelle.", "woek": "Steuerungsdaten, Strategie, Resilienz, Innovation."},
            {"topic": "Lieferkette", "today": "Preis und Verfügbarkeit dominieren.", "woek": "Wasserstress, Arbeit, Klima und Regulierung werden als Risiko sichtbar."},
            {"topic": "Gewinn", "today": "Gewinn steht isoliert im Zentrum.", "woek": "Gewinn bleibt wichtig, wird aber als Ergebnis tragfähiger Wirkung gelesen."},
        ],
        "not": [
            {"title": "Kein Profitverzicht", "text": "Gewinn bleibt möglich und notwendig; er wird nicht von Wirkung getrennt."},
            {"title": "Keine zentrale Planung", "text": "Unternehmerische Freiheit, Eigentum, Wettbewerb und Innovation bleiben erhalten."},
            {"title": "Keine Moralabteilung", "text": "Wirkung gehört in Strategie, Risiko, Einkauf, Produkt, Kapital und Governance."},
            {"title": "Kein reines CSR-Projekt", "text": "Die WÖk betrifft das Kerngeschäft, nicht nur Kommunikation oder Begleitmaßnahmen."},
        ],
        "path": ["Geschäftsmodell", "Wirkungsfelder", "Datenbasis", "WÖk-ID-Mapping", "Baseline", "Risiko", "Strategie", "Rückkopplung"],
        "example": "Ein scheinbar günstiger Lieferant bringt Wasserstress, Arbeitsrisiken und künftige Regulierungsrisiken in die Wertschöpfung. In der alten Logik ist er billig. In der WÖk-Logik wird sichtbar: Er ist ein verdecktes Risiko.",
        "steps": [
            {"title": "Readiness prüfen", "text": "Welche Daten liegen vor und wo entsteht Blindflug?"},
            {"title": "Wirkungsfelder bestimmen", "text": "Welche Themen sind wirklich entscheidungsrelevant?"},
            {"title": "Pilot starten", "text": "Eine Lieferkette, ein Produkt oder eine Investition wirkungslogisch prüfen."},
        ],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Scanner vorbereiten", "../scanner.html"), ("Datenstandards verstehen", "../methodik/daten-standards-regularien.html"), ("Evidenz ansehen", "../evidenz/")],
        "visual_after_steps": ("woek_08_unternehmen_change_roadmap", "Von ESG als Pflicht zu Wirkung als Steuerungslogik: Die Roadmap verbindet Daten, Risiko, Strategie, Kultur, Pilotierung und Rückkopplung.", True),
        "tags": "Unternehmen, Unternehmensführung, WÖk Vorteile Unternehmen, CSRD, ESRS, Kapitalfähigkeit, Lieferkettenwirkung",
    },
    "buergerinnen.html": {
        "title": "Wirkungsökonomie für Bürger:innen",
        "subtitle": "Warum bessere Systemsignale mehr entlasten als moralische Dauerappelle.",
        "description": "Warum Bürger:innen durch ehrlichere Preise, bessere Daten und Wirkungsanalyse entlastet werden.",
        "status": "veröffentlicht",
        "noindex": False,
        "hero": "Bürger:innen sollen ständig richtig konsumieren, richtig wählen und richtige Informationen erkennen, obwohl Preise, Werbung und Politik oft falsche Signale senden.",
        "wrong": "Verantwortung wird häufig auf Einzelne verschoben, obwohl das System selbst Schäden unsichtbar oder billig macht.",
        "not_enough": "Moralische Appelle, Label und individuelle Kaufberatung reichen nicht, wenn Preise und Informationen die eigentliche Wirkung nicht zeigen.",
        "need": "Bürger:innen brauchen die WÖk, weil Wirkung im System sichtbar werden muss: in Preisen, Produktdaten, politischer Kommunikation und öffentlichen Entscheidungen.",
        "shift": "Wirkung wird im System sichtbar: Preise, Daten, Scanner, Politik und Produkte werden lesbarer.",
        "issue_cards": [
            {"title": "Falsche Preise", "text": "Schädliche Folgekosten bleiben oft unsichtbar, während verantwortliche Alternativen teurer wirken."},
            {"title": "Informationsüberlastung", "text": "Niemand kann bei jedem Einkauf Lieferketten, Klima, Gesundheit und Arbeit prüfen."},
            {"title": "Moralischer Druck", "text": "Einzelne sollen Fehler ausgleichen, die aus falschen Systemanreizen entstehen."},
            {"title": "Desinformation", "text": "Politische Sprache und Plattformlogik erschweren Orientierung und Vertrauen."},
        ],
        "why_better": "Die WÖk dreht die Überforderung um: Nicht Bürger:innen müssen alles allein prüfen. Produkte, Preise, Programme und Aussagen sollen Wirkung klarer sichtbar machen.",
        "benefits": [
            {"title": "Weniger Überforderung", "text": "Wirkung wird lesbarer, ohne dass jede Person Expert:in für Lieferketten werden muss."},
            {"title": "Ehrlichere Preise", "text": "Preise können stärker zeigen, ob Folgekosten ausgelagert werden."},
            {"title": "Mehr Transparenz", "text": "Quellen, Produktdaten und Wirkungspfade helfen bei Alltag und politischer Orientierung."},
            {"title": "Mehr Handlungsspielraum", "text": "Gutes Handeln wird leichter, wenn das System bessere Signale sendet."},
        ],
        "compare": [
            {"topic": "Alltag", "today": "Du sollst richtig handeln, obwohl das System falsche Signale sendet.", "woek": "Das System sendet bessere Signale, damit gutes Handeln leichter wird."},
            {"topic": "Preise", "today": "Billig wirkt oft gut, obwohl Schäden ausgelagert sind.", "woek": "Preise tragen mehr Wirkungswahrheit."},
            {"topic": "Politik", "today": "Maßnahmen wirken oft abstrakt oder widersprüchlich.", "woek": "Wirkungspfade machen Entscheidungen nachvollziehbarer."},
        ],
        "not": [
            {"title": "Keine Lebensstilpolizei", "text": "Die WÖk bewertet keine privaten Lebensentwürfe."},
            {"title": "Kein Social Credit", "text": "Personen werden nicht bewertet; analysiert werden Produkte, Maßnahmen und Wirkungspfade."},
            {"title": "Kein perfekter Konsum", "text": "Niemand muss alles richtig machen. Das System soll bessere Orientierung geben."},
        ],
        "path": ["Produkt oder Aussage", "Daten und Quellen", "Wirkungsräume", "Preis- oder Programmsignal", "besserer Handlungsspielraum"],
        "example": "Ein Produkt wirkt billig, weil Wasserstress, CO2, Arbeitsbedingungen oder Gesundheitsrisiken nicht sichtbar im Preis liegen. Die WÖk macht diese Wirkung sichtbar.",
        "steps": [
            {"title": "Scanner nutzen", "text": "Ein Produkt, eine Aussage oder ein Programm als Wirkungspfad lesen."},
            {"title": "Begriffe prüfen", "text": "Wirkung, Wirkungspotenzial und Quellenklarheit unterscheiden."},
            {"title": "Politik lesbarer machen", "text": "Nicht nur fragen, was versprochen wird, sondern welche Zustände sich ändern."},
        ],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Scanner öffnen", "../scanner.html"), ("Glossar ansehen", "../glossar.html"), ("Evidenz ansehen", "../evidenz/")],
        "tags": "WÖk für Bürger, Bürger:innen, ehrliche Preise, Produktinformation, Desinformation",
    },
}


PEOPLE.update({
    "mieter.html": {
        "title": "Wohnen in der Wirkungsökonomie",
        "subtitle": "Warum Wohnen nicht nur Rendite, sondern Bezahlbarkeit, Gesundheit, Quartier und Demokratie betrifft.",
        "description": "Warum Wohnen Wirkung braucht.",
        "status": "draft",
        "noindex": True,
        "hero": "Wohnen wird oft nach Rendite, Baukosten und Einzelregeln gesteuert, obwohl es Grundbedürfnis, Gesundheit, Quartier, Energie und demokratische Stabilität berührt.",
        "wrong": "Miete, Sanierung, Boden, Leerstand, Energie und Quartier werden getrennt verhandelt, obwohl sie zusammenwirken.",
        "not_enough": "Mietrecht, Förderung und Sanierungspflichten helfen punktuell, lösen aber Zielkonflikte nicht automatisch.",
        "need": "Mieter:innen brauchen die WÖk, weil Wohnmodelle nach Wirkung auf Bezahlbarkeit, Energie, Gesundheit, Quartier und Stabilität bewertet werden müssen.",
        "shift": "Wohnen wird nach Wirkung statt nur nach Rendite oder Einzelmaßnahme gelesen.",
        "issue_cards": [
            {"title": "Rendite dominiert", "text": "Wohnraum kann Kapitalanlage sein, obwohl er soziale Infrastruktur ist."},
            {"title": "Sanierungskonflikte", "text": "Klimaschutz und Bezahlbarkeit werden gegeneinander ausgespielt."},
            {"title": "Leerstand schadet", "text": "Ungenutzter Wohnraum erzeugt Wirkungsverlust für Stadt und Quartier."},
            {"title": "Verdrängung destabilisiert", "text": "Luxussanierung kann Quartiere schwächen, obwohl sie als Investition zählt."},
        ],
        "why_better": "Die WÖk löst nicht automatisch alle Mietfragen. Sie macht aber sichtbar, welche Modelle Folgekosten verschieben und welche langfristig bezahlbar, energieeffizient und sozial stabil wirken.",
        "benefits": [
            {"title": "Zielkonflikte sichtbar", "text": "Bezahlbarkeit, Energie und Quartier werden gemeinsam bewertet."},
            {"title": "Faire Modelle stärken", "text": "Stabile Mieten, Mieterstrom und Quartiersnutzen werden als positive Wirkung sichtbar."},
            {"title": "Spekulation erkennbar", "text": "Rendite ohne soziale Stabilität wird als negative Wirkung lesbarer."},
            {"title": "Kommunale Folgekosten", "text": "Wohnen wird mit Gesundheit, Infrastruktur und Demokratie verbunden."},
        ],
        "compare": [
            {"topic": "Investition", "today": "Alles kann als Investition gelten.", "woek": "Investitionen werden nach Netto-Wirkung unterschieden."},
            {"topic": "Sanierung", "today": "Klima und Miete geraten gegeneinander.", "woek": "Sanierung wird nach Energie, Miete und Quartiersnutzen bewertet."},
            {"topic": "Quartier", "today": "Folgen von Verdrängung bleiben oft unsichtbar.", "woek": "Stabilität, Gesundheit und Teilhabe werden mitbewertet."},
        ],
        "not": [
            {"title": "Keine automatische Mietsenkung", "text": "Die WÖk macht Wirkungen sichtbar, ersetzt aber keine konkrete Mietrechtsprüfung."},
            {"title": "Keine Eigentumsabschaffung", "text": "Eigentum bleibt, aber Wirkung und Folgekosten werden sichtbarer."},
            {"title": "Keine Investitionsfeindlichkeit", "text": "Investitionen werden nach ihrer Wirkung unterschieden."},
        ],
        "path": ["Wohnmodell", "Mietbelastung", "Energie", "Boden und Leerstand", "Quartier", "kommunale Wirkung", "Rückkopplung"],
        "example": "Eine energetische Sanierung mit stabiler Miete, Mieterstrom und Quartiersnutzen wirkt anders als eine Luxussanierung mit Verdrängung. Beide sind Investitionen, aber nicht dieselbe Wirkung.",
        "steps": [{"title": "Wohnmodell prüfen", "text": "Bezahlbarkeit, Energie und Quartier gemeinsam lesen."}, {"title": "Kommunale Wirkung ansehen", "text": "Wohnen mit Gesundheit, Mobilität und Teilhabe verbinden."}, {"title": "Begriffe klären", "text": "Wirkungshaushalt, Netto-Wirkung und Quartiersstabilität verstehen."}],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Politik-Seite ansehen", "politik.html"), ("Ordnung verstehen", "../ordnung/"), ("Evidenz ansehen", "../evidenz/")],
        "visual_after_why": ("woek_11_wohnen_wirkungsraum", "Wohnen ist mehr als eine Anlageklasse. In der WÖk wird sichtbar, welche Wirkung Wohnraum auf Bezahlbarkeit, Energie, Gesundheit, Quartier und soziale Stabilität entfaltet.", False),
        "tags": "WÖk für Mieter, Wohnen, Miete, Sanierung, Quartiersstabilität",
    },
    "rente.html": {
        "title": "Rente in der Wirkungsökonomie",
        "subtitle": "Warum Alterssicherheit mehr als Einzahlung und Erwerbsbiografie braucht.",
        "description": "Warum Rente nicht nur Einzahlung, sondern Wirkung braucht.",
        "status": "draft",
        "noindex": True,
        "hero": "Das Rentensystem misst vor allem Erwerbsbiografie und Einzahlung. Gesellschaftliche Stabilitätsleistung entsteht aber auch durch Care, Pflege, Bildung, Prävention und Kapitalwirkung.",
        "wrong": "Alterssicherheit hängt stark an Erwerbsarbeit und Kapitalrendite, obwohl Stabilität breiter entsteht.",
        "not_enough": "Höhere Beiträge, spätere Renten oder Kapitaldeckung lösen nicht automatisch die Frage, welche Leistungen das System langfristig tragen.",
        "need": "Die WÖk macht Lebensleistung, Care, Bildung, Pflege, Kapitalwirkung und Generationenstabilität sichtbar.",
        "shift": "Von Einzahlung allein zu Lebensleistung, Wirkung und Generationenstabilität.",
        "issue_cards": [
            {"title": "Erwerbsfokus", "text": "Nicht jede gesellschaftlich tragende Leistung erscheint in der Erwerbsbiografie."},
            {"title": "Care bleibt unsichtbar", "text": "Pflege, Sorgearbeit und Bildung stabilisieren Systeme, sind aber oft schlecht abgebildet."},
            {"title": "Blinde Rendite", "text": "Kapitaldeckung kann Zukunftsrisiken finanzieren, wenn Kapitalwirkung ignoriert wird."},
            {"title": "Demografie", "text": "Demografische Risiken werden zu selten mit Prävention und Gemeinwesen verbunden."},
        ],
        "why_better": "Die WÖk verspricht keine Rentenzahl. Sie stellt die tiefere Frage, welche gesellschaftliche Wirkung Alterssicherheit trägt und welche Kapitalwirkung kommende Generationen stabilisiert.",
        "benefits": [
            {"title": "Gerechtere Anerkennung", "text": "Care, Pflege, Bildung und Gemeinwesen werden als Stabilitätsleistung sichtbar."},
            {"title": "Resilientere Vorsorge", "text": "Kapitalwirkung und Zukunftsrisiken werden in Altersvorsorgefragen einbezogen."},
            {"title": "Ehrlichere Debatte", "text": "Keine einfachen Zahlenversprechen, sondern klare Modellstände und Statushinweise."},
        ],
        "compare": [
            {"topic": "Leistung", "today": "Rente misst Einzahlung und Erwerbsbiografie.", "woek": "Rente fragt zusätzlich nach Lebensleistung und gesellschaftlicher Wirkung."},
            {"topic": "Kapital", "today": "Rendite steht oft isoliert.", "woek": "Kapitalwirkung und Zukunftsrisiken werden mitgedacht."},
            {"topic": "Generationen", "today": "Lasten werden oft technisch verteilt.", "woek": "Stabilität zwischen Generationen wird wirkungslogisch sichtbar."},
        ],
        "not": [
            {"title": "Keine Rentenhöhe", "text": "Konkrete Zahlen gelten nur als ausdrücklich freigegebene Modellrechnung."},
            {"title": "Kein Leistungsversprechen", "text": "Diese Seite erklärt Systematik, nicht individuelle Ansprüche."},
            {"title": "Keine Abwertung von Arbeit", "text": "Erwerbsarbeit bleibt wichtig, wird aber nicht als einzige Stabilitätsleistung gelesen."},
        ],
        "path": ["Erwerbsbiografie", "Lebensleistung", "Care und Bildung", "Kapitalwirkung", "Demografie", "Generationenstabilität", "Modellprüfung"],
        "example": "Pflege und Bildungsarbeit stabilisieren das System, erscheinen aber oft nur indirekt in Rentenlogiken. Die WÖk macht diese Wirkung sichtbar, ohne automatisch eine konkrete Rentenhöhe abzuleiten.",
        "steps": [{"title": "Status prüfen", "text": "Keine Zahlen ohne freigegebene Modellrechnung verwenden."}, {"title": "Kapitalwirkung lesen", "text": "Rendite und Zukunftsrisiko gemeinsam betrachten."}, {"title": "Care sichtbar machen", "text": "Stabilitätsleistungen begrifflich sauber erfassen."}],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Wirkungseinkommen ansehen", "wirkungseinkommen.html"), ("Zahlenregel lesen", "../docs/woek-zahlen-und-modellrechnungen-regel.md"), ("Evidenz ansehen", "../evidenz/")],
        "visual_after_why": ("woek_14_wirkungseinkommen_wirkungsrente_konzept", "Die Grafik zeigt den konzeptionellen Wechsel von Arbeit als alleiniger Einkommens- und Beitragsbasis hin zu Wirkung als zusätzlicher gesellschaftlicher Bezugsgröße. Keine Leistungszusage; konkrete Zahlen nur mit freigegebenem Modellstand.", False),
        "tags": "Wirkung und Rente, Rente, Generationenvertrag, Care, Kapitalwirkung",
    },
    "wirkungseinkommen.html": {
        "title": "Wirkungseinkommen",
        "subtitle": "Warum Einkommen in einer automatisierten Wirtschaft als Wirkungsarchitektur gedacht werden muss.",
        "description": "Warum Wirkungseinkommen kein naives Grundeinkommen ist.",
        "status": "draft",
        "noindex": True,
        "hero": "Automatisierung und KI entkoppeln Produktivität zunehmend von Erwerbsarbeit. Einkommen, Steuern und soziale Sicherheit hängen aber weiter stark an Arbeit.",
        "wrong": "Produktivität kann wachsen, während Teilhabe, Sinn und Sicherheit für Menschen unsicherer werden.",
        "not_enough": "Ein bloßer Transfer beantwortet nicht, welche gesellschaftliche Wirkung anerkannt, finanziert und stabilisiert werden soll.",
        "need": "Die WÖk denkt Einkommen als Teil einer Wirkungsarchitektur: Markteinkommen, Sicherheit, Care, Bildung, Pflege, Gemeinwesen und Demokratiearbeit werden gemeinsam betrachtet.",
        "shift": "Von Einkommen als bloßem Transfer zu Sicherheit, Teilhabe und sichtbarer gesellschaftlicher Wirkung.",
        "issue_cards": [
            {"title": "Automatisierung", "text": "Produktivität entsteht zunehmend durch Maschinen, Plattformen und KI."},
            {"title": "Arbeitsbindung", "text": "Soziale Sicherheit bleibt stark an Erwerbsarbeit gekoppelt."},
            {"title": "Unsichtbare Beiträge", "text": "Care, Bildung, Pflege und Gemeinwesenarbeit stabilisieren Gesellschaft, sind aber oft einkommensschwach."},
            {"title": "Späte Reparatur", "text": "Soziale Instabilität wird oft erst aufgefangen, wenn sie bereits entstanden ist."},
        ],
        "why_better": "Das Wirkungseinkommen ist kein naives Grundeinkommen. Es prüft, wie Sicherheit, Markteinkommen und gesellschaftliche Wirkung in einer automatisierten Wirtschaft zusammenpassen.",
        "benefits": [
            {"title": "Sicherheit", "text": "Soziale Stabilität wird nicht erst nachträglich repariert."},
            {"title": "Teilhabe", "text": "Menschen bleiben handlungsfähig, auch wenn Erwerbsarbeit sich verändert."},
            {"title": "Anerkennung", "text": "Care, Bildung, Pflege und Demokratiearbeit werden als Wirkung sichtbar."},
            {"title": "Kein Zahlensprung", "text": "Beträge werden nicht veröffentlicht, solange sie nicht freigegeben sind."},
        ],
        "compare": [
            {"topic": "Produktivität", "today": "Produktivität und Einkommen bleiben an Erwerbsarbeit gekoppelt.", "woek": "Automatisierte Produktivität wird in soziale Stabilität übersetzt."},
            {"topic": "Transfer", "today": "Einkommen wird oft als Zahlung gedacht.", "woek": "Einkommen wird als Teil einer Wirkungsarchitektur geprüft."},
            {"topic": "Wirkung", "today": "Viele gesellschaftliche Beiträge bleiben unsichtbar.", "woek": "Wirkung wird sichtbar, ohne Markteinkommen abzuschaffen."},
        ],
        "not": [
            {"title": "Keine ungeprüften Beträge", "text": "Zahlen gelten nur als ausdrücklich freigegebener Modellstand."},
            {"title": "Kein Ersatz für Markteinkommen", "text": "Arbeit, Leistung und Unternehmertum bleiben möglich."},
            {"title": "Kein naiver Transfer", "text": "Entscheidend ist die Wirkungsarchitektur, nicht nur eine Auszahlung."},
        ],
        "path": ["Automatisierung", "Produktivität", "Sicherheit", "Wirkungsbeiträge", "Finanzierungsbausteine", "Modellrechnung", "demokratische Entscheidung"],
        "example": "Eine Person pflegt Angehörige, unterstützt Bildung oder stärkt ein Gemeinwesen. Diese Arbeit stabilisiert Gesellschaft, ist aber oft kaum einkommenswirksam. Die WÖk fragt, wie solche Wirkung sichtbar werden kann.",
        "steps": [{"title": "Konzeptstand beachten", "text": "Keine Beträge ohne Freigabe verwenden."}, {"title": "Wirkungsbeiträge prüfen", "text": "Care, Bildung und Gemeinwesen als Stabilitätsleistung lesen."}, {"title": "Automatisierung einordnen", "text": "Produktivität und soziale Sicherheit gemeinsam denken."}],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Rente ansehen", "rente.html"), ("Downloads öffnen", "../downloads.html"), ("Evidenz ansehen", "../evidenz/")],
        "visual_after_why": ("woek_14_wirkungseinkommen_wirkungsrente_konzept", "Die Grafik zeigt den konzeptionellen Wechsel von Arbeit als alleiniger Einkommens- und Beitragsbasis hin zu Wirkung als zusätzlicher gesellschaftlicher Bezugsgröße. Keine Leistungszusage; konkrete Zahlen nur mit freigegebenem Modellstand.", False),
        "tags": "Wirkungseinkommen, Automatisierung, Grundeinkommen, Care, Teilhabe",
    },
})

PEOPLE.update({
    "journalismus.html": {
        "title": "Wirkungsanalyse für Journalismus",
        "subtitle": "Warum Faktencheck allein nicht reicht, wenn Sprache Wirkung erzeugt.",
        "description": "Warum Wirkungsanalyse Journalismus stärkt.",
        "status": "needs_review",
        "noindex": True,
        "hero": "Journalismus muss nicht aktivistischer werden. Er muss wirkungsbewusster werden, weil Frames, Narrative und Plattformlogiken Realität mitformen.",
        "wrong": "Faktenchecks prüfen Aussagen, aber sie zeigen nicht immer, welche Resonanzräume, Handlungsschwellen und demokratischen Wirkungen Sprache erzeugt.",
        "not_enough": "Wahr oder falsch reicht nicht, wenn Desinformation, KI und Polarisierung über Wiederholung, Empörung, Identität und Misstrauen wirken.",
        "need": "Journalismus braucht die WÖk, um Fakt, Meinung, Frame und Wirkung sauberer zu unterscheiden.",
        "shift": "Faktencheck plus Wirkungsanalyse.",
        "issue_cards": [
            {"title": "Frames wirken", "text": "Sprache erzeugt Deutungsräume, auch wenn einzelne Aussagen faktisch korrekt sind."},
            {"title": "Empörung dominiert", "text": "Plattformlogik belohnt Resonanz oft stärker als Einordnung."},
            {"title": "KI skaliert Inhalte", "text": "Automatisierte Texte und Bilder erhöhen Tempo und Unsicherheit."},
            {"title": "Vertrauen erodiert", "text": "Wenn Quellen und Wirkung unklar bleiben, sinkt demokratische Orientierung."},
        ],
        "why_better": "Die WÖk ersetzt keine Redaktion. Sie ergänzt Recherche um die Frage, welche Wirkung Aussagen, Programme, Websites und Narrative auf Vertrauen, Polarisierung und demokratische Stabilität erzeugen.",
        "benefits": [
            {"title": "Bessere Einordnung", "text": "Fakten, Meinung, Frame und Wirkung werden klarer getrennt."},
            {"title": "Quellenklarheit", "text": "Leser:innen sehen besser, worauf eine Analyse beruht."},
            {"title": "Wahlprogramme lesbar", "text": "Programme können nach Wirkungspfaden statt nur Positionen analysiert werden."},
            {"title": "Weniger Empörungslogik", "text": "Wirkung hilft, Resonanz nicht mit Relevanz zu verwechseln."},
        ],
        "compare": [
            {"topic": "Analyse", "today": "Fakten und Positionen stehen im Vordergrund.", "woek": "Frames, Resonanzräume und Wirkungspotenziale werden zusätzlich geprüft."},
            {"topic": "Demokratie", "today": "Wirkung politischer Sprache bleibt oft implizit.", "woek": "Demokratische Wirkungen werden begründet sichtbar gemacht."},
            {"topic": "Werkzeuge", "today": "Recherche und Faktencheck bleiben getrennt von Wirkungslogik.", "woek": "Scanner und Kompass ergänzen redaktionelle Einordnung."},
        ],
        "not": [
            {"title": "Keine Zensur", "text": "Wirkungsanalyse entscheidet nicht, was gesagt werden darf."},
            {"title": "Keine Redaktionsersetzung", "text": "Journalistische Verantwortung bleibt bei Redaktionen."},
            {"title": "Keine Wahrheitshoheit", "text": "Die WÖk macht Wirkungspfade sichtbar, ersetzt aber keine offene Debatte."},
        ],
        "path": ["Aussage", "Frame", "Resonanzraum", "Wirkungspotenzial", "Demokratiebezug", "Gegenfrage", "Einordnung"],
        "example": "Eine Aussage kann teilweise korrekt sein und dennoch Angst, Entsolidarisierung oder demokratische Erschöpfung verstärken. Wirkungsanalyse macht diese zweite Ebene sichtbar.",
        "steps": [{"title": "Text scannen", "text": "Artikel, Website oder Wahlprogramm als Wirkungspfad vorbereiten."}, {"title": "Ebenen trennen", "text": "Fakt, Meinung, Frame und Wirkung auseinanderhalten."}, {"title": "Quellen dokumentieren", "text": "Evidenz und Unsicherheit transparent machen."}],
        "links": [("Scanner öffnen", "../scanner.html"), ("Medien & Demokratie", "../sdg-plus/medien-demokratie.html"), ("Wirkung politischer Sprache", "../sdg-plus/medien-demokratie/wirkung-politischer-sprache.html"), ("Evidenz ansehen", "../evidenz/")],
        "tags": "WÖk für Journalisten, Journalismus, Wirkungsanalyse, Faktencheck, Medienwirkung",
    },
    "investoren.html": {
        "title": "Kapitalwirkung für Investor:innen",
        "subtitle": "Warum Rendite, Risiko und Wirkung nicht mehr getrennt gelesen werden können.",
        "description": "Warum Kapitalwirkung zur Risikowahrheit wird.",
        "status": "needs_review",
        "noindex": True,
        "hero": "ESG-Daten zeigen Risiken, aber nicht automatisch positive Netto-Wirkung. Kapital braucht eine klarere Sicht auf Transformationsrisiko, Resilienz und Zukunftsfähigkeit.",
        "wrong": "Rendite, Risiko und ESG werden oft getrennt gelesen, während stranded assets, Klima-, Lieferketten- und Governance-Risiken wachsen.",
        "not_enough": "Ratings und Ausschlusslisten reichen nicht, wenn sie Wirkung, Transformation und Systemrisiken nur teilweise abbilden.",
        "need": "Investor:innen brauchen die WÖk, weil Kapitalwirkung zeigt, ob ein Investment Zukunftsfähigkeit stärkt oder Risiken versteckt.",
        "shift": "Kapitalwirkung, T-SROI, Transformationswirkung und Wirkungsrisiko werden sichtbar.",
        "issue_cards": [
            {"title": "ESG bleibt begrenzt", "text": "ESG kann Risiken zeigen, aber positive Netto-Wirkung bleibt oft unscharf."},
            {"title": "Stranded Assets", "text": "Kurzfristig profitable Assets können langfristig entwertet werden."},
            {"title": "Systemrisiken", "text": "Demokratie-, Klima- und Lieferkettenrisiken wirken auf Portfolios zurück."},
            {"title": "Risikowahrheit", "text": "Kapitalmärkte brauchen Daten, die Zukunftsfähigkeit besser zeigen."},
        ],
        "why_better": "Die WÖk verbindet Rendite, Risiko, Wirkung und Resilienz. Sie ist keine Anlageberatung, sondern eine Logik, um Kapitalwirkung und Transformationsfähigkeit sichtbarer zu machen.",
        "benefits": [
            {"title": "Resilientere Portfolios", "text": "Transformations- und Wirkungsrisiken werden früher sichtbar."},
            {"title": "Weniger stranded assets", "text": "Kapital fließt weniger blind in Geschäftsmodelle mit verdeckten Folgekosten."},
            {"title": "Bessere Risikowahrheit", "text": "T-SROI und Kapitalwirkung ergänzen klassische Kennzahlen."},
            {"title": "Keine Anlageberatung", "text": "Die Seite erklärt Systematik, nicht individuelle Kauf- oder Verkaufsentscheidungen."},
        ],
        "compare": [
            {"topic": "Kapital", "today": "Rendite, Risiko und ESG werden oft getrennt gelesen.", "woek": "Kapitalwirkung verbindet Rendite, Risiko, Wirkung und Resilienz."},
            {"topic": "Risiko", "today": "Transformationsrisiken erscheinen spät.", "woek": "Wirkungsrisiken werden früher als Zukunftsrisiko sichtbar."},
            {"topic": "Wirkung", "today": "ESG zeigt nicht automatisch Netto-Wirkung.", "woek": "Positive und negative Wirkung werden als Kapitalinformation gelesen."},
        ],
        "not": [
            {"title": "Keine Anlageberatung", "text": "Keine Empfehlung zu einzelnen Titeln, Fonds oder Strategien."},
            {"title": "Keine Renditegarantie", "text": "Wirkung verbessert Analyse, garantiert aber keine Erträge."},
            {"title": "Kein Ersatz für Due Diligence", "text": "Bestehende Prüfpflichten und Fachanalysen bleiben notwendig."},
        ],
        "path": ["Investmentthese", "Wirkungsdaten", "Transformationsrisiko", "Kapitalwirkung", "T-SROI", "Portfolioresilienz", "Rückkopplung"],
        "example": "Ein heute profitables Asset kann regulatorisch, klimatisch oder reputativ an Wert verlieren. WÖk-Logik fragt, ob Kapitalwirkung Zukunftsfähigkeit stärkt oder Risiken versteckt.",
        "steps": [{"title": "Keine Beratung ableiten", "text": "Systematik verstehen, Entscheidungen fachlich prüfen."}, {"title": "Kapitalwirkung prüfen", "text": "Rendite und Wirkung gemeinsam lesen."}, {"title": "Transformationsrisiken kartieren", "text": "Klima, Lieferketten und Governance verbinden."}],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Datenstandards verstehen", "../methodik/daten-standards-regularien.html"), ("Downloads öffnen", "../downloads.html"), ("Evidenz ansehen", "../evidenz/")],
        "tags": "Kapitalwirkung, WÖk Investoren, T-SROI, Transformationsrisiko, stranded assets",
    },
    "kommunen.html": {
        "title": "Wirkungsökonomie für Kommunen",
        "subtitle": "Warum Wirkung vor Ort beginnt.",
        "description": "Warum Kommunen Wirkungshaushalte und lokale Resilienz brauchen.",
        "status": "needs_review",
        "noindex": True,
        "hero": "Kommunen tragen viele Wirkungen direkt: Wohnen, Hitze, Wasser, Bildung, Pflege, Mobilität, Beteiligung und Vertrauen treffen vor Ort zusammen.",
        "wrong": "Knappe Mittel werden oft projektweise verteilt, während lokale Probleme systemisch zusammenhängen.",
        "not_enough": "Einzelprogramme und Ressortlogik reichen nicht, wenn Hitze, Wohnen, Gesundheit, Mobilität und Teilhabe zusammenwirken.",
        "need": "Kommunen brauchen die WÖk, weil Wirkungshaushalte lokale Resilienz, Prävention und öffentliche Beschaffung nach Wirkung sichtbar machen.",
        "shift": "Wirkungshaushalt, lokale Resilienz und öffentliche Beschaffung nach Wirkung.",
        "issue_cards": [
            {"title": "Projekt-Silos", "text": "Einzelprojekte zeigen selten ihre Mehrfachwirkung."},
            {"title": "Knappe Mittel", "text": "Priorisierung braucht mehr als Ausgabenlogik."},
            {"title": "Hitze und Wasser", "text": "Klimafolgen treffen Gesundheit, Infrastruktur und Quartiere zugleich."},
            {"title": "Beteiligung", "text": "Bürger:innen brauchen nachvollziehbare Wirkung, nicht nur Haushaltszahlen."},
        ],
        "why_better": "Die WÖk macht sichtbar, welche kommunalen Maßnahmen Mehrfachwirkung erzeugen und wo Prävention langfristig günstiger ist als Reparatur.",
        "benefits": [
            {"title": "Bessere Priorisierung", "text": "Mittel fließen stärker in Maßnahmen mit hoher Netto-Wirkung."},
            {"title": "Weniger Silos", "text": "Hitze, Wasser, Wohnen, Bildung und Mobilität werden gemeinsam gelesen."},
            {"title": "Transparente Beteiligung", "text": "Bürger:innen sehen, welche Wirkung eine Maßnahme erzeugen soll."},
            {"title": "Lokale Resilienz", "text": "Prävention wird im Haushalt sichtbar."},
        ],
        "compare": [
            {"topic": "Haushalt", "today": "Ausgaben werden nach Titeln und Ressorts geplant.", "woek": "Mittel werden nach Mehrfachwirkung und Prävention gelesen."},
            {"topic": "Projekte", "today": "Einzelmaßnahmen konkurrieren.", "woek": "Wirkungspfade zeigen Synergien und Zielkonflikte."},
            {"topic": "Beteiligung", "today": "Debatten bleiben oft abstrakt.", "woek": "Wirkung wird lokal nachvollziehbar."},
        ],
        "not": [
            {"title": "Keine Wunderfinanzierung", "text": "Die WÖk ersetzt keine Haushaltsrealität."},
            {"title": "Keine Ratsersetzung", "text": "Demokratische Entscheidungen bleiben bei den zuständigen Gremien."},
            {"title": "Keine perfekte Messung", "text": "Lokale Wirkung braucht Evaluation und Korrektur."},
        ],
        "path": ["lokales Problem", "Wirkungsräume", "Haushalt", "Mehrfachwirkung", "Beteiligung", "Priorisierung", "Rückkopplung"],
        "example": "Ein Stadtbaum ist nicht nur Grünfläche. Er wirkt auf Hitze, Gesundheit, Wasserhaushalt, Aufenthaltsqualität, soziale Begegnung und Quartiersstabilität.",
        "steps": [{"title": "Beispiel wählen", "text": "Eine Maßnahme wie Stadtbaum, Schulweg oder Sanierung analysieren."}, {"title": "Wirkungshaushalt skizzieren", "text": "Ausgaben mit Prävention und Mehrfachwirkung verbinden."}, {"title": "Beteiligung erklären", "text": "Bürger:innen Wirkung verständlich zeigen."}],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Politik-Seite ansehen", "politik.html"), ("SDG+ öffnen", "../sdg-plus.html"), ("Evidenz ansehen", "../evidenz/")],
        "tags": "Kommunen Wirkungshaushalt, Wirkung vor Ort, SDG-Portale, Mannheim 2030",
    },
    "akademie.html": {
        "title": "Wirkungskompetenz in der Akademie",
        "subtitle": "Warum Menschen Wirkung verstehen müssen, statt nur Meinungen zu wiederholen.",
        "description": "Warum Wirkungskompetenz zur Schlüsselkompetenz wird.",
        "status": "draft",
        "noindex": True,
        "hero": "Ohne Wirkungskompetenz werden Begriffe, Daten, Narrative und Zielkonflikte falsch gelesen. Die Akademie macht Wirkung systematisch lernbar.",
        "wrong": "Wirkung, Wirkungspotenzial, Haltung, Bericht, Kennzahl und Beweis werden häufig vermischt.",
        "not_enough": "Nachhaltigkeitswissen allein reicht nicht, wenn Menschen Daten, Quellen, politische Sprache und Zielkonflikte nicht systemisch einordnen können.",
        "need": "Die Akademie braucht die WÖk als Lernarchitektur für Begriffslogik, Wirkungspfade, SDG/SDG+, Quellen und Scannerkompetenz.",
        "shift": "Systemisches Lernen, Wirkungspfade, Begriffslogik, SDG/SDG+ und Scannerkompetenz.",
        "issue_cards": [
            {"title": "Begriffsnebel", "text": "Wirkung wird oft mit Absicht, Output oder Bericht verwechselt."},
            {"title": "Daten ohne Urteil", "text": "Viele Daten helfen wenig, wenn ihre Bedeutung unklar bleibt."},
            {"title": "Narrative wirken", "text": "Sprache prägt Wahrnehmung und Entscheidungen."},
            {"title": "Zielkonflikte", "text": "Komplexe Abwägungen brauchen Methode statt Bauchgefühl."},
        ],
        "why_better": "Die WÖk macht Lernen an Wirkungspfaden, Quellen, Scorecards und Beispielen fest. So entsteht Urteilskraft statt bloßer Meinungswiederholung.",
        "benefits": [
            {"title": "Saubere Begriffe", "text": "Wirkung, Wirkungspotenzial und Wirkungsmanagement werden unterscheidbar."},
            {"title": "Quellenkompetenz", "text": "Daten und Standards können kritisch gelesen werden."},
            {"title": "Scannerkompetenz", "text": "Produkte, Texte und Programme werden wirkungslogisch analysierbar."},
            {"title": "Systemisches Denken", "text": "Menschen reagieren weniger moralisch und urteilen strukturierter."},
        ],
        "compare": [
            {"topic": "Lernen", "today": "Wissen wird gesammelt.", "woek": "Wirkungspfade werden verstanden und angewendet."},
            {"topic": "Begriffe", "today": "Wirkung bleibt unscharf.", "woek": "Begriffe werden prüfbar unterschieden."},
            {"topic": "Analyse", "today": "Meinungen dominieren.", "woek": "Daten, Quellen und Zielkonflikte strukturieren Urteilskraft."},
        ],
        "not": [
            {"title": "Kein Dogma", "text": "Die Akademie soll prüfen, nicht Glaubenssätze vermitteln."},
            {"title": "Keine fertige Wahrheit", "text": "Status, Quellen und Unsicherheit bleiben sichtbar."},
            {"title": "Kein Buzzword-Lernen", "text": "Begriffe werden an Beispielen und Wirkungspfaden trainiert."},
        ],
        "path": ["Begriff", "Beispiel", "Wirkungspfad", "Scorecard", "Quellenprüfung", "Reflexion", "Anwendung"],
        "example": "Eine Aussage über ein Produkt klingt plausibel. Wirkungskompetenz fragt: Welche Daten liegen vor, welcher Wirkungsraum ist gemeint, was ist nur Potenzial und welche Zielkonflikte bleiben offen?",
        "steps": [{"title": "Glossar lesen", "text": "Zentrale Begriffe sauber unterscheiden."}, {"title": "Kompass fragen", "text": "Eine konkrete Wirkungsperspektive analysieren."}, {"title": "Scanner üben", "text": "Text oder Produkt als Beispiel prüfen."}],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Glossar ansehen", "../glossar.html"), ("Scanner öffnen", "../scanner.html"), ("Evidenz ansehen", "../evidenz/")],
        "tags": "Wirkungskompetenz, Akademie, Wirkung lernen, Scorecards, Quellenprüfung",
    },
})


HUB_CARDS = [
    ("unternehmen.html", "Unternehmen", "ESG, CSRD und Lieferketten werden oft als Pflicht erlebt.", "Wirkung wird zur Steuerungsinformation für Risiko, Kapital und Innovation.", "Resilienz, Kapitalfähigkeit und bessere Entscheidungen."),
    ("politik.html", "Politik", "Politik repariert zu viele Schäden nachträglich.", "Wirkung wird vorab geprüft und in Haushalt, Recht und Verwaltung zurückgekoppelt.", "Mehr Prävention, weniger Flickenteppich, bessere Nachvollziehbarkeit."),
    ("buergerinnen.html", "Bürger:innen", "Menschen sollen richtig handeln, obwohl Preise und Informationen falsche Signale senden.", "Wirkung wird in Preisen, Daten, Scannern, Politik und Produkten sichtbar.", "Weniger Überforderung, mehr Transparenz und Handlungsspielraum."),
    ("mieter.html", "Mieter:innen", "Wohnen wird nach Rendite gesteuert, obwohl es Grundbedürfnis und Quartier betrifft.", "Wohnmodelle werden nach Bezahlbarkeit, Energie, Gesundheit und Stabilität bewertet.", "Faire und klimastabile Wohnmodelle werden strukturell sichtbarer."),
    ("rente.html", "Rente", "Rente misst Einzahlung, aber nicht jede gesellschaftliche Stabilitätsleistung.", "Lebensleistung, Care, Kapitalwirkung und Generationenstabilität werden sichtbar.", "Gerechtere Anerkennung und resilientere Altersvorsorge."),
    ("wirkungseinkommen.html", "Wirkungseinkommen", "Automatisierung entkoppelt Produktivität von Erwerbsarbeit.", "Einkommen wird als Teil einer Wirkungsarchitektur gedacht.", "Sicherheit, Sinn, Teilhabe und Anerkennung realer Wirkung."),
    ("journalismus.html", "Journalismus", "Faktenchecks reichen nicht, wenn Sprache Resonanzräume erzeugt.", "Faktencheck wird um Wirkungsanalyse ergänzt.", "Bessere Einordnung von Frames, Narrativen und Desinformation."),
    ("investoren.html", "Investor:innen", "ESG-Daten zeigen Risiken, aber nicht immer positive Netto-Wirkung.", "Kapitalwirkung, T-SROI und Transformationsrisiko werden sichtbar.", "Resilientere Portfolios und bessere Risikowahrheit."),
    ("kommunen.html", "Kommunen", "Lokale Wirkungen entstehen in Silos aus Wohnen, Hitze, Wasser und Mobilität.", "Wirkungshaushalt und Beschaffung richten Mittel an lokaler Resilienz aus.", "Bessere Priorisierung knapper Mittel und sichtbare Prävention."),
    ("akademie.html", "Akademie", "Begriffe, Daten, Narrative und Zielkonflikte werden oft falsch gelesen.", "Wirkungspfade, SDG/SDG+, Quellen und Scannerkompetenz werden lernbar.", "Urteilskraft statt Meinungswiederholung."),
]


def status_note(slug: str, status: str) -> str:
    if slug not in SENSITIVE and status == "veröffentlicht":
        return ""
    return f'<div class="scanner-notice" role="note"><strong>Status:</strong> {e(status)}. {e(STATUS_TEXT)}</div>'


def render_generic(slug: str, data: dict[str, object]) -> str:
    sources = data.get("sources", COMMON_SOURCES)
    visual_after_why = data.get("visual_after_why")
    visual_after_steps = data.get("visual_after_steps")
    visual_after_why_html = visual_figure(visual_after_why[0], visual_after_why[1], scroll=visual_after_why[2]) if visual_after_why else ""
    visual_after_steps_html = visual_figure(visual_after_steps[0], visual_after_steps[1], scroll=visual_after_steps[2]) if visual_after_steps else ""
    return f"""
      <section class="hero">
        <div>
          <p class="hero-kicker">Für wen · Warum zuerst</p>
          <h1 class="hero-title">{e(str(data["title"]))}</h1>
          <p class="hero-subtitle">{e(str(data["subtitle"]))}</p>
          <p class="hero-text">{e(str(data["hero"]))}</p>
          {status_note(slug, str(data["status"]))}
        </div>
      </section>
      <section class="section">
        <div class="why-block">
          <p class="hero-kicker">Warum diese Seite wichtig ist</p>
          <h2>Das läuft heute falsch. Deshalb reicht die alte Logik nicht.</h2>
          <div class="why-grid">
            <article><span>1</span><h3>Was läuft heute falsch?</h3><p>{e(str(data["wrong"]))}</p></article>
            <article><span>2</span><h3>Warum reicht das nicht?</h3><p>{e(str(data["not_enough"]))}</p></article>
            <article><span>3</span><h3>Warum braucht diese Perspektive die WÖk?</h3><p>{e(str(data["need"]))}</p></article>
            <article><span>4</span><h3>Was ändert sich?</h3><p>{e(str(data["shift"]))}</p></article>
          </div>
        </div>
      </section>
      {visual_after_why_html}
      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Was heute falsch läuft</p><h2>Die alte Logik erzeugt blinde Stellen</h2></div>
        {card_grid(data["issue_cards"])}
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Warum WÖk besser ist</p><h2>Die Wirkungsökonomie verschiebt die Logik</h2>{paras([str(data["why_better"])])}</div>
        {structured_cards([
          {"title": "Problem sichtbar machen", "problem": str(data["wrong"]), "shift": str(data["shift"]), "benefit": str(data["benefits"][0]["text"])},
          {"title": "Rückkopplung statt Appell", "problem": str(data["not_enough"]), "shift": "Wirkung wird mit Daten, Evidenz und Entscheidungen verbunden.", "benefit": "Entscheidungen werden nachvollziehbarer, früher und korrigierbarer."},
          {"title": "Praktisch anschlussfähig", "problem": "Die alte Logik bleibt oft abstrakt oder moralisch.", "shift": "Die WÖk arbeitet mit Wirkungspfaden, Beispielen und Statushinweisen.", "benefit": "Der Einstieg kann klein, prüfbar und lernfähig beginnen."},
        ])}
      </section>
      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Konkreter Nutzen</p><h2>Was du konkret gewinnst</h2></div>
        {card_grid(data["benefits"])}
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Vorher / Nachher</p><h2>Alte Logik vs. WÖk-Logik</h2></div>
        {compare_table(data["compare"])}
      </section>
      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Wie diese Perspektive in der WÖk wirkt</h2><p>Der Wirkungspfad kommt erst nach dem Warum: Er zeigt, wie Problem, Daten, Bewertung und Rückkopplung praktisch verbunden werden.</p></div>
        {path(data["path"])}
      </section>
      <section class="section">
        <div class="example-box"><p class="hero-kicker">Konkretes Beispiel</p><h2>Wie die neue Logik sichtbar wird</h2>{paras([str(data["example"])])}</div>
      </section>
      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Was nicht passiert</p><h2>Missverständnisse ausräumen</h2></div>
        {card_grid(data["not"])}
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Erste Schritte</p><h2>Was du jetzt tun kannst</h2></div>
        {card_grid(data["steps"])}
      </section>
      {visual_after_steps_html}
      <section class="section section-muted">
        <div class="compass-box"><p class="hero-kicker">Vertiefung</p><h2>Im WÖk-Kompass vertiefen</h2><p>Der erste Schritt ist kein perfekter Umbau, sondern eine prüfbare Wirkungsfrage.</p>{links(data["links"])}</div>
      </section>
      <section class="section">{source_panel(str(data["status"]), sources)}</section>
"""


def render_politik() -> str:
    sources = [
        "Führender Begriffsleitfaden der Wirkungsökonomie",
        "Die neue Ordnung des Wohlstands, Kapitel zu Staat, Recht, Wirkungshaushalt, Politik und Demokratie",
        "Working-Paper Wirkungssteuergesetz (WStG), Stand Oktober 2025",
        "Systemmodell der Wirkungsökonomie",
        "Wirkungsrat-Konzept",
        "Nachhaltigkeit als Systemarchitektur",
    ]
    return f"""
      <section class="hero">
        <div>
          <p class="hero-kicker">Für wen · Politik</p>
          <h1 class="hero-title">Politik mit Wirkung</h1>
          <p class="hero-subtitle">Vom Reparaturstaat zur Wirkungsarchitektur.</p>
          {paras([
            "Politik steht heute unter Druck, immer mehr Krisen gleichzeitig zu reparieren: Klima, Wohnen, Pflege, Energie, Digitalisierung, Migration, Desinformation, Staatsfinanzen und Vertrauensverlust.",
            "Doch viele politische Antworten setzen zu spät an. Sie reparieren Symptome: mit Förderprogrammen, Subventionen, Sonderregeln, Verboten, Ausnahmen und immer neuen Nachweispflichten.",
            "Die Wirkungsökonomie setzt früher an: bei den Signalen, nach denen Preise, Steuern, Kapital, öffentliche Haushalte, Verwaltung und politische Programme wirken.",
            "Sie macht Politik nicht technokratischer. Sie macht Politik wirksamer.",
          ])}
          <div class="why-formula"><strong>Alte Politik repariert Folgen.</strong><span>Wirkungsorientierte Politik verändert die Anreize, die Folgen erzeugen.</span></div>
          {status_note("politik.html", POLITIK["status"])}
        </div>
      </section>
      <section class="section">
        <div class="why-block">
          <p class="hero-kicker">Warum Politik Wirkung braucht</p>
          <h2>Handlung allein ist noch keine Wirkung.</h2>
          {paras([
            "Politik wird heute oft daran gemessen, ob sie handelt: ein Gesetz, ein Förderprogramm, ein Paket, ein Kompromiss, ein neuer Haushaltstitel. Doch Handlung allein ist noch keine Wirkung.",
            "Ein Gesetz kann gut gemeint sein und trotzdem Zielkonflikte verschärfen. Eine Subvention kann kurzfristig entlasten und langfristig falsche Strukturen stabilisieren. Ein Förderprogramm kann hilfreich sein und zugleich neue Bürokratie erzeugen. Ein Haushalt kann wachsen und trotzdem wenig verbessern.",
            "Das Problem liegt nicht darin, dass Politik zu wenig tut. Das Problem liegt darin, dass Politik oft zu spät sieht, was ihr Handeln tatsächlich verändert.",
            "Die Wirkungsökonomie verschiebt deshalb die Grundfrage: Nicht: Was wurde beschlossen? Sondern: Welche Zustände verändern sich dadurch - für Mensch, Planet und Demokratie?",
          ])}
          <div class="core-problem"><strong>Kernproblem:</strong> Politik repariert heute zu viele Schäden, die durch falsche Anreize vorher selbst mit erzeugt werden.</div>
        </div>
      </section>
      {visual_figure("woek_07_politik_reparaturstaat_wirkungsarchitektur", "Alte Politik repariert Folgen. Wirkungsorientierte Politik verändert die Anreize, die Folgen erzeugen.")}
      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Was heute falsch läuft</p><h2>Fünf blinde Stellen politischer Steuerung</h2></div>
        {card_grid([
          {"title": "Symbolpolitik", "text": "Maßnahmen werden oft nach Sichtbarkeit bewertet, nicht nach tatsächlicher Wirkung."},
          {"title": "Reparaturbürokratie", "text": "Wenn Preise, Steuern und Märkte Schäden nicht abbilden, muss Politik später mit immer mehr Regeln gegensteuern."},
          {"title": "Getrennte Ressorts", "text": "Klima, Wohnen, Gesundheit, Bildung, Migration, Digitalisierung und Demokratie werden oft getrennt bearbeitet, obwohl sie systemisch zusammenwirken."},
          {"title": "Falsche Haushaltslogik", "text": "Öffentliche Mittel werden nach Titeln, Ressorts und Ausgabenvolumen geplant - nicht konsequent nach Netto-Wirkung, Prävention und vermiedenen Folgekosten."},
          {"title": "Vertrauensverlust", "text": "Wenn Bürger:innen erleben, dass Schädliches billig bleibt und Verantwortliches teurer ist, wirkt Politik ungerecht, widersprüchlich oder machtlos."},
        ])}
        <div class="section-header compact-after"><p>Die WÖk löst diese Probleme nicht durch mehr Zentralsteuerung, sondern durch bessere Rückkopplung.</p></div>
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Der bessere Rahmen</p><h2>Warum die WÖk für Politik der bessere Rahmen ist</h2>
          {paras([
            "Die Wirkungsökonomie gibt Politik einen gemeinsamen Prüfmaßstab, ohne politische Unterschiede abzuschaffen.",
            "Demokratische Parteien müssen nicht dieselben Antworten geben. Aber sie können sich auf dieselbe Frage einigen: Welche Wirkung erzeugt eine Maßnahme für Mensch, Planet und Demokratie?",
            "Damit wird Politik nicht unpolitisch. Im Gegenteil: Zielkonflikte werden sichtbarer. Verteilung wird ehrlicher. Folgekosten werden früher benannt. Prävention wird messbar. Und politische Entscheidungen können besser begründet, überprüft und korrigiert werden.",
          ])}
        </div>
        {card_grid([
          {"title": "Bessere Entscheidungen", "text": "Politik entscheidet nicht nur nach Druck, Stimmung oder kurzfristiger Sichtbarkeit, sondern nach Wirkungspfaden, Datenlage, Zielkonflikten und Folgekosten."},
          {"title": "Weniger Reparaturbürokratie", "text": "Wenn Wirkung früher in Preise, Steuern, Beschaffung und Haushalte zurückgekoppelt wird, müssen weniger Schäden später durch Sonderprogramme repariert werden."},
          {"title": "Mehr Vertrauen", "text": "Bürger:innen sehen besser, warum eine Maßnahme beschlossen wurde, welche Wirkung erwartet wird und wie sie überprüft wird."},
          {"title": "Bessere Mittelverwendung", "text": "Öffentliche Mittel fließen stärker dorthin, wo sie Prävention, Resilienz und positive Netto-Wirkung erzeugen."},
          {"title": "Demokratische Anschlussfähigkeit", "text": "Die WÖk ist kein Parteiprogramm. Sie ist ein Wirkungsmaßstab, auf den sich demokratische Akteure trotz unterschiedlicher Werte und Prioritäten beziehen können."},
          {"title": "Zukunftssicherung", "text": "Politik wird weniger rückwärtsgewandt und reparierend, sondern vorausschauender, lernfähiger und resilienter."},
        ])}
      </section>
      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Vorher / Nachher</p><h2>Alte politische Logik vs. Wirkungslogik</h2></div>
        {compare_table([
          {"topic": "Gesetzgebung", "today": "Gesetze werden oft nach politischem Kompromiss und Ressortlogik beschlossen.", "woek": "Gesetze werden zusätzlich nach Wirkungspfad, Zielkonflikten und Folgekosten geprüft."},
          {"topic": "Haushalt", "today": "Mittel werden nach Ausgabenvolumen, Ressort und Haushaltslogik verteilt.", "woek": "Mittel werden nach Netto-Wirkung, Prävention, Resilienz und Wirkungshaushalt priorisiert."},
          {"topic": "Markt", "today": "Der Markt sendet oft falsche Preissignale, weil Folgekosten externalisiert werden.", "woek": "Preise und Steuern tragen mehr Wirkungswahrheit."},
          {"topic": "Bürokratie", "today": "Immer neue Einzelregeln reparieren Schäden nachträglich.", "woek": "Einheitliche Wirkungslogik reduziert widersprüchliche Nachsteuerung."},
          {"topic": "Demokratie", "today": "Politische Debatten kreisen oft um Schuld, Symbolik und kurzfristige Entlastung.", "woek": "Debatten können stärker über Wirkung, Daten, Zielkonflikte und Rückkopplung geführt werden."},
          {"topic": "Verantwortung", "today": "Verantwortung wird oft politisch verschoben.", "woek": "Verantwortung wird an Wirkungspfaden sichtbar gemacht."},
        ])}
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Wie Politik in der WÖk wirkt</h2></div>
        {path(["Politisches Ziel", "Maßnahme / Gesetz / Haushalt", "betroffene Wirkungsräume", "Datenbasis und Wirkungsindikatoren", "Zielkonflikte und Nebenwirkungen", "Wirkungsbewertung", "Wirkungshaushalt / Steuer / Beschaffung / Verwaltung", "Rückkopplung", "Evaluation", "Anpassung"])}
        <div class="section-header compact-after"><p>Der entscheidende Unterschied liegt in der Rückkopplung. Wirkung bleibt nicht im Bericht. Sie verändert Haushalt, Recht, Beschaffung, Steuern, Förderung und Verwaltung.</p></div>
      </section>
      <section class="section section-muted">
        <div class="example-box">
          <p class="hero-kicker">Konkretes Beispiel</p><h2>Beispiel: Wohnen, Klima und soziale Stabilität</h2>
          {paras([
            "Im heutigen System werden bezahlbares Wohnen, energetische Sanierung, Mietrecht, Baukosten, Stadtentwicklung und Klimaschutz oft getrennt bearbeitet. Das erzeugt Zielkonflikte: Sanierung kann Mieten erhöhen. Mietbegrenzung kann Investitionen bremsen. Neubau kann Flächen versiegeln. Förderprogramme können Bürokratie erzeugen.",
            "Die Wirkungsökonomie fragt anders: Welche Wohnmodelle erzeugen positive Netto-Wirkung auf Bezahlbarkeit, Energie, Gesundheit, Quartier, Flächenverbrauch und demokratische Stabilität?",
            "Dadurch wird sichtbar: Eine energetische Sanierung mit stabiler Miete, Mieterstrom und Quartiersnutzen wirkt anders als eine Luxussanierung mit Verdrängung. Beide sind Investitionen. Aber sie erzeugen nicht dieselbe Wirkung.",
          ])}
          {links([("Wohnen ansehen", "mieter.html"), ("Ordnung öffnen", "../ordnung/"), ("Kompass öffnen", "../kompass.html")])}
        </div>
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Grenzen</p><h2>Was die WÖk nicht macht</h2></div>
        {card_grid([
          {"title": "Keine Planwirtschaft", "text": "Politik entscheidet nicht zentral, was produziert wird. Märkte, Wettbewerb, Eigentum und dezentrale Entscheidungen bleiben."},
          {"title": "Keine Gesinnungsprüfung", "text": "Bewertet werden Wirkungspfade, Daten, Zielkonflikte und Rückkopplung - nicht private Meinungen."},
          {"title": "Keine Wahlempfehlung", "text": "Die WÖk kann Programme analysieren, aber sie ersetzt keine demokratische Entscheidung."},
          {"title": "Keine Expertokratie", "text": "Wissenschaft und Daten bereiten Wirkung sichtbar auf. Entscheiden muss demokratisch verantwortete Politik."},
          {"title": "Keine Personenbewertung", "text": "Die WÖk bewertet keine Bürger:innen als Personen. Sie analysiert Produkte, Maßnahmen, Programme, Kapitalflüsse, Organisationen und Wirkungspfade."},
          {"title": "Keine perfekte Maschine", "text": "Wirkung bleibt komplex. Deshalb braucht es Evaluation, Korrektur, Transparenz und Lernfähigkeit."},
        ])}
      </section>
      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Demokratische Anschlussfähigkeit</p><h2>Warum demokratische Parteien hier anschließen können</h2>
          {paras([
            "Die Wirkungsökonomie verlangt nicht, dass demokratische Parteien ihre Unterschiede aufgeben. Konservative, Liberale, Sozialdemokrat:innen, Grüne und Linke können unterschiedliche Prioritäten setzen. Aber sie können sich auf einen gemeinsamen Prüfmaßstab beziehen: Welche Wirkung entsteht?",
            "Für Konservative ist die WÖk anschlussfähig, weil sie Ordnung, Verantwortung, Eigentum mit Haftung, Generationenverantwortung und Bürokratieabbau stärkt.",
            "Für Liberale ist sie anschlussfähig, weil Markt, Wettbewerb, Innovation und dezentrale Entscheidung erhalten bleiben - aber bessere Informationen und ehrlichere Preise entstehen.",
            "Für Sozialdemokrat:innen ist sie anschlussfähig, weil Arbeit, Pflege, Wohnen, soziale Sicherheit, Teilhabe und faire Verteilung wirkungslogisch sichtbar werden.",
            "Für Grüne ist sie anschlussfähig, weil Klima, Biodiversität, Kreislaufwirtschaft und planetare Grenzen nicht moralisch, sondern steuerungslogisch verankert werden.",
            "Für Linke und soziale Bewegungen ist sie anschlussfähig, weil Ausbeutung, Ungleichheit und Kapitalmacht sichtbar werden - ohne in zentrale Planwirtschaft zurückzufallen.",
            "Die WÖk entscheidet nicht, welche Partei recht hat. Sie macht sichtbar, welche Wirkung politische Entscheidungen erzeugen.",
          ])}
        </div>
      </section>
      <section class="section">
        <div class="compass-box"><p class="hero-kicker">Handlungsbox</p><h2>Politik mit Wirkung beginnen</h2><p>Der erste Schritt ist nicht die perfekte Reform. Der erste Schritt ist, politische Entscheidungen nach Wirkung lesbar zu machen.</p>{links([("WÖk-Kompass öffnen", "../kompass.html"), ("Wahlprogramm-Scanner ansehen", "../scanner.html"), ("Wirkungshaushalt verstehen", "kommunen.html"), ("Wirkungssteuergesetz im Detail", "wirkungssteuer.html"), ("Evidenz ansehen", "../evidenz/")])}</div>
      </section>
      <section class="section">{source_panel(POLITIK["status"], sources)}</section>
"""


def render_hub() -> str:
    cards = "".join(
        f"""<a class="card target-card" href="{e(href)}">
          <h3 class="card-title">{e(title)}</h3>
          <dl>
            <div><dt>Aktuelles Problem</dt><dd>{e(problem)}</dd></div>
            <div><dt>WÖk-Verschiebung</dt><dd>{e(shift)}</dd></div>
            <div><dt>Konkreter Nutzen</dt><dd>{e(benefit)}</dd></div>
          </dl>
        </a>"""
        for href, title, problem, shift, benefit in HUB_CARDS
    )
    return f"""
      <section class="hero">
        <div>
          <p class="hero-kicker">Für wen · Warum zuerst</p>
          <h1 class="hero-title">Was bedeutet die Wirkungsökonomie für mich?</h1>
          <p class="hero-subtitle">Die Wirkungsökonomie ist kein abstraktes Modell. Sie verändert, wie Unternehmen führen, wie Politik steuert, wie Bürger:innen Preise verstehen, wie Kommunen planen, wie Journalismus Wirkung analysiert und wie Kapital Risiken bewertet.</p>
        </div>
      </section>
      <section class="section">
        <div class="why-block">
          <p class="hero-kicker">Perspektiven</p>
          <h2>Jede Perspektive beginnt mit derselben Frage.</h2>
          <p>Was läuft heute falsch - und wie verändert Wirkung die Logik?</p>
        </div>
      </section>
      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Zielgruppen</p><h2>Problem → WÖk-Verschiebung → Nutzen</h2></div>
        <div class="card-grid">{cards}</div>
      </section>
"""


def write_page(slug: str, title: str, description: str, body: str, tags: str, noindex: bool) -> None:
    (FUER / slug).write_text(shell(slug, title, description, body, tags, noindex), encoding="utf-8")


def main() -> None:
    write_page(
        "index.html",
        "Was bedeutet die Wirkungsökonomie für mich?",
        "Zielgruppen-Hub der Wirkungsökonomie mit Warum-zuerst-Struktur.",
        render_hub(),
        "Zielgruppen, Unternehmen, Politik, Bürger:innen, Mieter:innen, Rente, Wirkungseinkommen, Journalismus, Investoren, Kommunen, Akademie",
        False,
    )
    write_page("politik.html", POLITIK["title"], POLITIK["description"], render_politik(), POLITIK["tags"], True)
    for slug, data in PEOPLE.items():
        write_page(slug, str(data["title"]), str(data["description"]), render_generic(slug, data), str(data["tags"]), bool(data["noindex"]))


if __name__ == "__main__":
    main()
