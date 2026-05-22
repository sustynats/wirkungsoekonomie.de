#!/usr/bin/env python3
"""Generate /fuer/ target-group pages from a shared systemic WÖk structure.

The company page is intentionally kept as a hand-curated longform page because
it includes a bespoke leadership visual and source panel. This generator owns
the /fuer/ hub and the remaining target-group pages.
"""

from __future__ import annotations

import html
from pathlib import Path

import sync_layout


ROOT = Path(__file__).resolve().parents[1]
FUER = ROOT / "fuer"
VERSION = "20260522-systemische-fuer-seiten"
SENSITIVE = {"politik.html", "rente.html", "wirkungseinkommen.html", "investoren.html", "wirkungssteuer.html"}

STATUS_TEXT = (
    "Diese Seite erklärt die aktuelle Systematik der Wirkungsökonomie. Sie ersetzt keine Rechts-, Steuer-, "
    "Anlage-, Leistungs- oder Politikberatung. Konkrete Zahlen, gesetzliche Ausgestaltungen und finanzielle "
    "Ableitungen gelten nur, wenn sie ausdrücklich als freigegebener Modellstand gekennzeichnet sind."
)

COMMON_SOURCES = [
    "Die neue Ordnung des Wohlstands",
    "Führender Begriffsleitfaden der Wirkungsökonomie",
    "Systemmodell der Wirkungsökonomie",
    "Wirkungskapitel 10 bis 23",
    "Wirkungslast, Wirkungskapital, Wirkungsordnungen und Wirkungslenkung",
    "Nichttrivialität, Netzwerke statt Hierarchien und Wirkungsarchitektur",
]

VISUAL_ALTS = {
    "woek_07_politik_reparaturstaat_wirkungsarchitektur": "Vergleich von Reparaturstaat und Wirkungsarchitektur mit Wirkungshaushalt, Wirkungsprüfung, Beschaffung und Evaluation.",
    "woek_11_wohnen_wirkungsraum": "Vergleich von Wohnen als Anlageklasse mit Wohnen als Wirkungsraum für Bezahlbarkeit, Energie, Gesundheit, Quartier und Teilhabe.",
    "woek_13_medien_sprache_wirkpfad": "Wirkpfad politischer Sprache von Begriff und Frame über Resonanzraum und Wirkungspotenzial bis demokratisches Risiko und SDG-Plus-Einordnung.",
    "woek_14_wirkungseinkommen_wirkungsrente_konzept": "Konzeptgrafik zu Arbeit, Einkommen, Wirkung, Automatisierung und neuer gesellschaftlicher Bezugsgröße ohne Leistungsversprechen.",
}


def e(value: object) -> str:
    return html.escape(str(value), quote=True)


def paras(items: list[str]) -> str:
    return "".join(f"<p>{e(item)}</p>" for item in items)


def card_grid(items: list[dict[str, str]], class_name: str = "card-grid") -> str:
    return f'<div class="{class_name}">' + "".join(
        f'<article class="card"><h3 class="card-title">{e(item["title"])}</h3><p class="card-text">{e(item["text"])}</p></article>'
        for item in items
    ) + "</div>"


def compare_table(rows: list[dict[str, str]]) -> str:
    return '<div class="why-compare-grid">' + "".join(
        f"""<article class="compare-card">
          <h3>{e(row["topic"])}</h3>
          <div class="compare-two-column">
            <div><p class="hero-kicker">Alte Logik</p><p>{e(row["old"])}</p></div>
            <div><p class="hero-kicker">WÖk-Logik</p><p>{e(row["new"])}</p></div>
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


def status_note(slug: str, status: str) -> str:
    if slug not in SENSITIVE and status == "veröffentlicht":
        return ""
    return f'<div class="scanner-notice" role="note"><strong>Status:</strong> {e(status)}. {e(STATUS_TEXT)}</div>'


def source_panel(status: str, sources: list[str] | None = None) -> str:
    source_items = sources or COMMON_SOURCES
    return f"""<details class="source-panel" open>
  <summary>Grundlage dieser Seite</summary>
  <div>
    <p class="hero-kicker">Primärlogik / Stand</p>
    <h2>Grundlage dieser Seite</h2>
    <ul class="source-list">{"".join(f"<li>{e(item)}</li>" for item in source_items)}</ul>
    <div class="source-meta"><span>Status: {e(status)}</span><span>Stand: 22. Mai 2026</span><span>Primärlogik WÖk; ESG/Standards nur Anschlussräume</span></div>
  </div>
</details>"""


def visual_figure(visual_id: str, caption: str, *, scroll: bool = True) -> str:
    scroll_class = " woek-visual-scroll" if scroll else ""
    return f"""<figure class="woek-visual-figure{scroll_class}">
        <picture>
          <source srcset="../assets/visuals/woek/{e(visual_id)}.webp" type="image/webp">
          <img class="woek-visual" src="../assets/visuals/woek/{e(visual_id)}.png" alt="{e(VISUAL_ALTS[visual_id])}" width="1600" height="900" loading="lazy" decoding="async">
        </picture>
        <figcaption class="woek-visual-caption">{e(caption)}</figcaption>
      </figure>"""


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


PAGES: dict[str, dict[str, object]] = {
    "politik.html": {
        "title": "Politik als Rückkopplungsarchitektur",
        "meta": "Warum demokratische Politik nicht nur Programme beschließen, sondern Wirkung in Recht, Haushalt, Steuern, Beschaffung und Lernen zurückkoppeln muss.",
        "kicker": "Für wen · Politik",
        "subtitle": "Vom Reparaturstaat zum lernenden Staat.",
        "status": "needs_review",
        "noindex": True,
        "tags": "Politik Wirkung, Rückkopplungsarchitektur, Reparaturstaat, Wirkungshaushalt, Wirkungsgesetz, lernender Staat, Gesetzesfolgenabschätzung",
        "hero": [
            "Politik steht heute unter Druck, immer mehr Krisen gleichzeitig zu reparieren: Klima, Wohnen, Pflege, Energie, Digitalisierung, Migration, Desinformation, Staatsfinanzen und Vertrauensverlust.",
            "Die WÖk setzt nicht bei noch mehr Einzelmaßnahmen an, sondern bei der Steuerungslogik: Welche Signale erzeugen Preise, Steuern, Kapital, öffentliche Haushalte, Verwaltung und politische Programme?",
            "Politik mit Wirkung heißt deshalb nicht technokratischer Staat. Es heißt: Zielkonflikte früher sehen, Folgekosten ehrlich benennen und Entscheidungen lernfähig korrigieren.",
        ],
        "formula_old": "Alte Politik repariert Folgen.",
        "formula_new": "Wirkungsorientierte Politik verändert die Anreize, die Folgen erzeugen.",
        "why": [
            {"title": "Was misst das alte System falsch?", "text": "Beschlüsse, Haushaltsvolumen, Ressortzuständigkeiten, Programme, Sichtbarkeit und kurzfristige Entlastung."},
            {"title": "Welche Schäden entstehen daraus?", "text": "Reparaturstaat, Ressortblindheit, Symbolpolitik, Förderlogik, Bürokratie durch falsche Preise und verspätete Korrektur."},
            {"title": "Warum reicht Reparaturpolitik nicht?", "text": "Förderprogramme, Verbote und Sonderregeln bleiben zu spät, wenn die Anreize vorher weiter Schäden erzeugen."},
            {"title": "Welche Logik verändert die WÖk?", "text": "Wirkung wird vor Entscheidungen geprüft, nach Entscheidungen evaluiert und in Recht, Haushalt, Beschaffung, Steuern und Verwaltung zurückgeführt."},
        ],
        "new_order": "Es entsteht ein lernender Staat: demokratisch entscheidend, aber wirkungsbewusst, präventiv und rückkopplungsfähig.",
        "visual": ("woek_07_politik_reparaturstaat_wirkungsarchitektur", "Alte Politik repariert Folgen. Wirkungsorientierte Politik verändert die Anreize, die Folgen erzeugen."),
        "faults_intro": "Politische Fehlsteuerung entsteht, wenn Handlung mit Wirkung verwechselt wird. Die WÖk trennt Beschluss, Output, Wirkungspotenzial und tatsächliche Zustandsveränderung.",
        "faults": [
            {"title": "Falsche Preise erzeugen Bürokratie", "text": "Wenn Schäden billig bleiben, muss Politik später mit immer mehr Regeln, Ausnahmen und Subventionen gegensteuern."},
            {"title": "Ressorts sehen Ausschnitte", "text": "Wohnen, Klima, Pflege, Bildung, Migration, Digitalisierung und Demokratie werden getrennt bearbeitet, obwohl sie systemisch zusammenwirken."},
            {"title": "Haushalte messen Ausgaben", "text": "Öffentliche Mittel zeigen Aktivität, aber nicht automatisch Prävention, Resilienz oder vermiedene Folgekosten."},
            {"title": "Symbolik ersetzt Lernfähigkeit", "text": "Politische Kommunikation belohnt Sichtbarkeit, während Wirkung, Nebenwirkung und Korrektur oft zu spät sichtbar werden."},
            {"title": "Vertrauen wird Nebenfolge", "text": "Wenn Bürger:innen widersprüchliche Signale erleben, wirkt Politik ungerecht, machtlos oder unaufrichtig."},
        ],
        "logic": [
            "Die Wirkungsökonomie gibt demokratischer Politik keinen Parteikatalog vor. Sie liefert einen gemeinsamen Prüfmaßstab: Welche Wirkung erzeugt eine Maßnahme für Mensch, Planet und Demokratie?",
            "Damit werden politische Unterschiede nicht aufgehoben. Sie werden genauer: Parteien können weiterhin verschiedene Prioritäten setzen, aber Zielkonflikte, Folgekosten, Wirkungslast und Korrekturpflicht werden sichtbarer.",
            "Der entscheidende Wechsel ist Rückkopplung: Wirkung bleibt nicht im Bericht. Sie verändert Haushalt, Recht, Beschaffung, Steuern, Förderung und Verwaltung.",
        ],
        "capabilities": [
            {"title": "Wirkungsprüfung", "text": "Maßnahmen werden nicht nur auf Zuständigkeit und Kosten, sondern auf Wirkungspfad, Zielkonflikte und Nebenwirkungen geprüft."},
            {"title": "Wirkungshaushalt", "text": "Haushalte können Prävention, Resilienz und positive Netto-Wirkung sichtbar machen, statt nur Ausgabenvolumen zu ordnen."},
            {"title": "Lernender Staat", "text": "Evaluation wird nicht nachgelagerte Kontrolle, sondern Teil politischer Steuerung und demokratischer Korrektur."},
            {"title": "Demokratische Anschlussfähigkeit", "text": "Die WÖk ist kein Parteiprogramm, sondern ein Wirkungsmaßstab für unterschiedliche demokratische Antworten."},
        ],
        "compare": [
            {"topic": "Gesetzgebung", "old": "Gesetze werden nach Kompromiss, Ressortlogik und politischer Durchsetzbarkeit beschlossen.", "new": "Gesetze werden zusätzlich nach Wirkungspfad, Zielkonflikten, Wirkungslast und Folgekosten geprüft."},
            {"topic": "Haushalt", "old": "Mittel werden nach Titeln, Ressorts und Ausgabenvolumen verteilt.", "new": "Mittel werden nach Prävention, Resilienz, Netto-Wirkung und vermiedenen Folgekosten gelesen."},
            {"topic": "Bürokratie", "old": "Einzelregeln reparieren Schäden nachträglich.", "new": "Rückkopplung in Preise, Steuern und Beschaffung reduziert widersprüchliche Nachsteuerung."},
            {"topic": "Demokratie", "old": "Debatten kreisen oft um Schuld, Symbolik und kurzfristige Entlastung.", "new": "Debatten können über Wirkung, Daten, Zielkonflikte und Korrektur geführt werden."},
        ],
        "path": ["Politisches Ziel", "Maßnahme / Gesetz / Haushalt", "Wirkungsräume", "Datenbasis", "Zielkonflikte", "Wirkungsbewertung", "Rückkopplung in Recht / Haushalt / Steuern", "Evaluation", "Anpassung"],
        "example": "Bezahlbares Wohnen, Sanierung, Baukosten, Stadtentwicklung und Klimaschutz werden heute häufig getrennt bearbeitet. Die WÖk fragt, welches Wohnmodell positive Netto-Wirkung auf Bezahlbarkeit, Energie, Gesundheit, Quartier, Flächenverbrauch und demokratische Stabilität erzeugt.",
        "not": [
            {"title": "Keine Planwirtschaft", "text": "Märkte, Eigentum, Wettbewerb und dezentrale Entscheidungen bleiben. Die WÖk verändert Prüfmaßstab und Rückkopplung."},
            {"title": "Keine Gesinnungsprüfung", "text": "Bewertet werden Wirkungspfade, Zielkonflikte, Daten und Rückkopplungen, nicht private Meinungen."},
            {"title": "Keine Wahlempfehlung", "text": "Die WÖk kann Programme analysieren, ersetzt aber keine demokratische Entscheidung."},
            {"title": "Keine Expertokratie", "text": "Daten bereiten Wirkung sichtbar auf. Entscheiden muss demokratisch verantwortete Politik."},
        ],
        "steps": [
            {"title": "Eine Maßnahme wirkungslogisch lesen", "text": "Nicht nur Beschluss und Kosten prüfen, sondern Zustandsveränderung, Zielkonflikte und Rückkopplung."},
            {"title": "Wirkungshaushalt skizzieren", "text": "Haushaltstitel mit Prävention, Folgekosten und Resilienz verbinden."},
            {"title": "Parteien anschlussfähig vergleichen", "text": "Nicht fragen, wer moralisch recht hat, sondern welche Wirkung eine Maßnahme erzeugt."},
        ],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Wirkungshaushalt verstehen", "kommunen.html"), ("Wirkungssteuer ansehen", "wirkungssteuer.html"), ("Evidenz ansehen", "../evidenz/")],
    },
    "buergerinnen.html": {
        "title": "Orientierung statt moralischer Überforderung",
        "meta": "Warum Bürger:innen nicht kompensieren sollen, was falsche Preise, Informationsarchitektur und politische Signale systemisch falsch steuern.",
        "kicker": "Für wen · Bürger:innen",
        "subtitle": "Die WÖk entlastet, weil sie Verantwortung aus Schuldgefühl zurück in Systemsignale übersetzt.",
        "status": "veröffentlicht",
        "noindex": False,
        "tags": "WÖk für Bürger, Bürger:innen, moralische Überforderung, ehrliche Preise, Wirkungskompass, Konsumwirkung, Desinformation, Systemsignale",
        "hero": [
            "Bürger:innen sollen ständig richtig konsumieren, richtig wählen, richtige Informationen erkennen und richtige Prioritäten setzen. Gleichzeitig zeigen Preise, Verpackungen, Werbung, Plattformlogik und politische Sprache oft nicht, welche Wirkung tatsächlich entsteht.",
            "Das alte System privatisiert Verantwortung: Einzelne sollen ausgleichen, was Preise, Märkte, Kapital und Politik strukturell falsch signalisieren.",
            "Die Wirkungsökonomie dreht diese Überforderung um. Nicht Menschen müssen perfekte Wirkungsexpert:innen werden. Das System muss Wirkung lesbarer machen.",
        ],
        "formula_old": "Alte Logik erzeugt Schuldgefühl.",
        "formula_new": "WÖk-Logik erzeugt Orientierung.",
        "why": [
            {"title": "Was misst das alte System falsch?", "text": "Preis, Bequemlichkeit, Reichweite, Konsumstatus und individuelle Entscheidungskraft."},
            {"title": "Welche Schäden entstehen daraus?", "text": "Informationsüberlastung, Misstrauen, moralische Dauerappelle und verdeckte Wirkungslast in Alltagspreisen."},
            {"title": "Warum reichen Appelle nicht?", "text": "Nachhaltiger Konsum bleibt unterbestimmt, wenn jede Person Lieferketten prüfen soll und schädliche Produkte weiterhin billig erscheinen."},
            {"title": "Welche Logik verändert die WÖk?", "text": "Wirkung wird in Produkten, Preisen, Scannern, politischer Sprache, Quellen und öffentlicher Entscheidung sichtbarer."},
        ],
        "new_order": "Es entsteht ein Wirkungskompass für Alltag und Demokratie: weniger Schuld, bessere Signale, mehr Urteilsfähigkeit.",
        "faults_intro": "Die Fehlsteuerung liegt nicht im einzelnen Menschen. Sie liegt in Signalen, die Verantwortung privatisieren und Wirkung unsichtbar halten.",
        "faults": [
            {"title": "Preise lügen oft", "text": "Billig kann heißen, dass Wasserstress, CO2, Arbeit, Gesundheit oder Zukunft nicht im Preis erscheinen."},
            {"title": "Verantwortung wird privatisiert", "text": "Bürger:innen sollen moralisch reparieren, was Märkte und politische Regeln falsch belohnen."},
            {"title": "Label ersetzen keine Logik", "text": "Ein Label kann helfen, aber es zeigt nicht automatisch Wirkungspfad, Datenqualität und Rückkopplung."},
            {"title": "Öffentlichkeit wird unübersichtlich", "text": "Frames, Plattformen und Desinformation erschweren die Unterscheidung von Fakt, Meinung, Wirkungspotenzial und Manipulation."},
        ],
        "logic": [
            "Die WÖk bewertet Bürger:innen nicht als Personen. Sie verschiebt die Analyse auf Produkte, Preise, Programme, Aussagen und Wirkungspfade.",
            "Dadurch wird Verantwortung nicht abgeschafft, sondern fairer verteilt: Wer Wirkung erzeugt, wer daran verdient und wer sie politisch ermöglicht, wird sichtbarer.",
            "Für Bürger:innen ist die WÖk deshalb kein Moralsystem, sondern eine Entlastungsarchitektur. Sie macht den Alltag nicht perfekt, aber lesbarer.",
        ],
        "capabilities": [
            {"title": "Ehrlichere Preise", "text": "Preise können stärker zeigen, wo Folgekosten ausgelagert werden und wo Verantwortung real getragen wird."},
            {"title": "Wirkungskompass", "text": "Produkte, Aussagen und politische Maßnahmen werden nach Wirkungspfaden statt nach bloßem Image gelesen."},
            {"title": "Quellenklarheit", "text": "Nicht jede Behauptung ist gleich belastbar. Datenlage, Unsicherheit und Quelle werden sichtbar."},
            {"title": "Mehr Handlungsspielraum", "text": "Gutes Handeln wird leichter, wenn Systeme bessere Signale senden."},
        ],
        "compare": [
            {"topic": "Alltag", "old": "Du sollst richtig handeln, obwohl das System falsche Signale sendet.", "new": "Das System muss Wirkung sichtbarer machen, damit gutes Handeln leichter wird."},
            {"topic": "Konsum", "old": "Kaufentscheidung wird zur moralischen Prüfung.", "new": "Produkte werden nach Wirkungspfad, Datenlage und Wirkungslast lesbar."},
            {"topic": "Politik", "old": "Botschaften konkurrieren um Zustimmung.", "new": "Maßnahmen und Sprache werden nach Wirkung auf Mensch, Planet und Demokratie eingeordnet."},
        ],
        "path": ["Produkt / Aussage / Maßnahme", "Preis- oder Informationssignal", "Wirkungspotenzial", "Datenlage", "Wirkungsraum", "Einordnung", "Rückkopplung in Preise / Politik", "Orientierung im Alltag"],
        "example": "Ein T-Shirt wirkt billig. In der WÖk-Frage ist es nicht nur billig oder teuer, sondern ein Wirkungsträger: Wasser, Arbeit, Chemie, Transport, Nutzungsdauer und Entsorgung werden sichtbar. Dadurch muss nicht jede Person Lieferkettenexpert:in werden.",
        "not": [
            {"title": "Keine Lebensstilpolizei", "text": "Die WÖk bewertet nicht, wie Menschen leben sollen. Sie macht Systemsignale lesbarer."},
            {"title": "Kein Social Credit", "text": "Es gibt keine Personenbewertung. Analysiert werden Produkte, Organisationen, Programme, Kapitalflüsse und Aussagen."},
            {"title": "Kein perfekter Konsum", "text": "Niemand muss jede Entscheidung optimal treffen. Entscheidend ist bessere Orientierung."},
            {"title": "Keine Schuldlogik", "text": "Die WÖk fragt nicht, wer moralisch versagt, sondern welche Steuerung falsche Wirkung erzeugt."},
        ],
        "steps": [
            {"title": "Eine Alltagsentscheidung prüfen", "text": "Frage nicht nur nach Preis, sondern nach Wirkungspfad und Datenlage."},
            {"title": "Sprache einordnen", "text": "Unterscheide Fakt, Meinung, Frame und Wirkungspotenzial."},
            {"title": "Scanner vorbereiten", "text": "Produkt, Aussage oder Programm als Wirkungsfrage formulieren."},
        ],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Scanner öffnen", "../scanner.html"), ("Glossar ansehen", "../glossar.html"), ("Evidenz ansehen", "../evidenz/")],
    },
    "mieter.html": {
        "title": "Wohnen als Wirkungsraum",
        "meta": "Warum Wohnen in der WÖk nicht als Anlageklasse, sondern als Wirkungsraum für Bezahlbarkeit, Energie, Gesundheit, Quartier und Demokratie gelesen wird.",
        "kicker": "Für wen · Wohnen",
        "subtitle": "Warum Miete, Boden, Sanierung und Quartier gemeinsam wirken.",
        "status": "draft",
        "noindex": True,
        "tags": "WÖk für Mieter, Wohnen als Wirkungsraum, Wirkungsmiete, Quartiersresilienz, Boden, Sanierung, Bezahlbarkeit",
        "hero": [
            "Die Maßstabskrise des Wohnens entsteht, wenn Wohnungen primär als Anlageklasse gelesen werden. Rendite misst Kapitalbewegung, aber nicht, ob ein Quartier bezahlbar, gesund, energieeffizient und demokratisch stabil bleibt.",
            "Wohnen wirkt immer mehrfach: auf Einkommen, Gesundheit, Bildung, Mobilität, Nachbarschaft, Energieverbrauch, kommunale Haushalte und Vertrauen.",
            "Die WÖk macht deshalb nicht einfach Wohnungsmarktpolitik. Sie liest Wohnen als Wirkungsraum.",
        ],
        "formula_old": "Alte Logik fragt: Was bringt die Wohnung?",
        "formula_new": "WÖk-Logik fragt: Was bewirkt die Wohnung?",
        "why": [
            {"title": "Was misst das alte System falsch?", "text": "Rendite, Bodenwert, Quadratmeterpreis, Auslastung, Modernisierungsumlage und Marktpreis."},
            {"title": "Welche Schäden entstehen daraus?", "text": "Spekulation, Verdrängung, Leerstand als Wirkungsverlust, Sanierungskonflikte und Quartiere ohne soziale Stabilität."},
            {"title": "Warum reichen Einzelregeln nicht?", "text": "Mietrecht, Förderung und Sanierungspflichten helfen punktuell, lösen aber nicht die gemeinsame Wirkung von Boden, Kapital, Energie und Quartier."},
            {"title": "Welche Logik verändert die WÖk?", "text": "Wohnen wird nach Bezahlbarkeit, Energie, Gesundheit, Teilhabe, Quartiersresilienz und demokratischer Stabilität bewertet."},
        ],
        "new_order": "Es entsteht eine Logik der Wirkungsmiete und Quartiersresilienz: Wohnmodelle werden danach unterschieden, welche Zustände sie langfristig erzeugen.",
        "visual": ("woek_11_wohnen_wirkungsraum", "Wohnen ist mehr als eine Anlageklasse. Die WÖk macht sichtbar, welche Wirkung Wohnraum auf Bezahlbarkeit, Energie, Gesundheit, Quartier und soziale Stabilität entfaltet."),
        "faults_intro": "Wohnungsprobleme entstehen nicht nur aus zu wenig Angebot. Sie entstehen auch aus einem Maßstab, der Rendite sichtbar macht und Wirkungslast verdeckt.",
        "faults": [
            {"title": "Boden wird Spekulationsobjekt", "text": "Kapitalrendite kann steigen, während soziale Stabilität und kommunale Handlungsfähigkeit sinken."},
            {"title": "Sanierung wird Zielkonflikt", "text": "Klimaschutz kann Verdrängung erzeugen, wenn Energie-, Miet- und Quartierswirkung getrennt bewertet werden."},
            {"title": "Leerstand bleibt zu billig", "text": "Ungenutzter Wohnraum erzeugt Wirkungslast für Nachbarschaft, Kommune und Menschen, die Wohnraum suchen."},
            {"title": "Quartier wird unterschätzt", "text": "Wohnen wirkt auf Gesundheit, Bildung, Teilhabe, Mobilität, Pflege und demokratisches Vertrauen."},
        ],
        "logic": [
            "Die WÖk sagt nicht, dass alle Mieten automatisch sinken. Sie macht sichtbar, welche Wohnmodelle langfristig bezahlbar, energieeffizient, gesund und sozial stabil wirken.",
            "Das verändert die Bewertung von Investitionen: Eine energetische Sanierung mit stabiler Miete, Mieterstrom und Quartiersnutzen ist wirkungslogisch etwas anderes als Luxussanierung mit Verdrängung.",
            "Eigentum bleibt möglich. Aber die Wirkung von Boden, Kapital, Miete und Sanierung wird nicht länger als private Nebenfolge behandelt.",
        ],
        "capabilities": [
            {"title": "Wirkungsmiete", "text": "Mietlogik wird mit Bezahlbarkeit, Energiepfad, Gesundheitswirkung und Quartiersstabilität verbunden."},
            {"title": "Quartiersresilienz", "text": "Wohnmodelle werden danach gelesen, ob sie Nachbarschaft, Teilhabe und kommunale Stabilität stärken."},
            {"title": "Sanierung mit Zielkonflikt", "text": "Klimaschutz und Bezahlbarkeit werden nicht gegeneinander ausgespielt, sondern als Wirkungspfad geprüft."},
            {"title": "Boden als Wirkungsträger", "text": "Bodenwert wird nicht nur als Kapitalwert, sondern als gesellschaftlicher Wirkungsraum gelesen."},
        ],
        "compare": [
            {"topic": "Wohnung", "old": "Anlageklasse, Kostenfaktor oder Quadratmeterprodukt.", "new": "Wirkungsträger für Bezahlbarkeit, Energie, Gesundheit, Quartier und Demokratie."},
            {"topic": "Sanierung", "old": "Investition mit Umlage- und Effizienzlogik.", "new": "Wirkungspfad mit Klima-, Miet-, Gesundheits- und Quartierseffekt."},
            {"topic": "Leerstand", "old": "Marktposition oder Spekulationsoption.", "new": "Wirkungsverlust für Kommune, Nachbarschaft und soziale Stabilität."},
        ],
        "path": ["Wohnmodell", "Boden / Kapital / Miete", "Energie- und Sanierungspfad", "Gesundheit und Quartier", "soziale Stabilität", "Netto-Wirkung", "kommunale Rückkopplung", "Lernen"],
        "example": "Eine energetische Sanierung mit stabiler Miete, Mieterstrom und Quartiersnutzen erzeugt andere Wirkung als eine Luxussanierung mit Verdrängung. Beide sind Investitionen, aber nicht dieselbe Wirkung.",
        "not": [
            {"title": "Keine automatische Mietsenkung", "text": "Die WÖk verspricht keine pauschal sinkenden Mieten. Sie macht Wirkungsunterschiede sichtbar."},
            {"title": "Keine Eigentumsabschaffung", "text": "Eigentum bleibt, aber Wirkung und Folgekosten von Boden und Wohnen werden klarer gelesen."},
            {"title": "Keine Sanierungsfeindlichkeit", "text": "Sanierung bleibt wichtig. Entscheidend ist, ob sie Bezahlbarkeit und Quartier mitdenkt."},
            {"title": "Keine Einzelfallberatung", "text": "Diese Seite erklärt Systemlogik und ersetzt keine Miet- oder Rechtsberatung."},
        ],
        "steps": [
            {"title": "Wohnmodell als Wirkungspfad lesen", "text": "Frage nach Bezahlbarkeit, Energie, Gesundheit, Quartier und Verdrängungsrisiko."},
            {"title": "Sanierung differenzieren", "text": "Nicht jede Investition hat dieselbe Wirkung. Zielkonflikte explizit machen."},
            {"title": "Kommunale Rückkopplung prüfen", "text": "Wohnen mit Haushalten, Gesundheit, Mobilität und Beteiligung verbinden."},
        ],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Politik-Seite ansehen", "politik.html"), ("Kommunen ansehen", "kommunen.html"), ("Evidenz ansehen", "../evidenz/")],
    },
    "rente.html": {
        "title": "Alterssicherheit braucht Wirkung",
        "meta": "Warum Rente nicht nur Einzahlung und Erwerbsbiografie messen darf, sondern gesellschaftliche Stabilitätsleistung, Care und Kapitalwirkung mitdenken muss.",
        "kicker": "Für wen · Rente",
        "subtitle": "Keine einfache Rentenzahl, sondern eine neue Frage nach Stabilitätsleistung.",
        "status": "draft",
        "noindex": True,
        "tags": "Wirkung und Rente, Rente, Generationenvertrag, Care, Wirkungskapital, Alterssicherheit, demografische Wirkung",
        "hero": [
            "Die Maßstabskrise der Rente liegt darin, dass Alterssicherheit vor allem an Erwerbsbiografie, Lohn und Beiträgen hängt. Gesellschaftliche Stabilität entsteht aber auch durch Care, Pflege, Bildung, Prävention, Gemeinwesen und ökologische Regeneration.",
            "Die WÖk verspricht nicht, das Rentenproblem durch eine einfache Zahl zu lösen. Sie stellt die tiefere Frage: Welche Leistungen tragen gesellschaftliche Stabilität, und wie wird Kapital so gelenkt, dass kommende Generationen nicht destabilisiert werden?",
        ],
        "formula_old": "Alte Rentenlogik misst Einzahlung.",
        "formula_new": "WÖk-Logik fragt nach Stabilitätswirkung.",
        "why": [
            {"title": "Was misst das alte System falsch?", "text": "Erwerbsarbeit, Beitragshöhe, Lohn, Demografiequote und Kapitalrendite als zentrale Bezugsgrößen."},
            {"title": "Welche Schäden entstehen daraus?", "text": "Care bleibt unsichtbar, Lebensleistung wird verengt, demografische Risiken werden technisch statt systemisch gelesen."},
            {"title": "Warum reichen Reparaturen nicht?", "text": "Höhere Beiträge, spätere Rente oder Kapitaldeckung beantworten nicht automatisch, welche Wirkung kommende Generationen stabilisiert."},
            {"title": "Welche Logik verändert die WÖk?", "text": "Lebensleistung, Care, Pflege, Bildung, Wirkungskapital und Generationenstabilität werden als Systembeiträge sichtbar."},
        ],
        "new_order": "Es entsteht keine Leistungszusage, sondern eine wirkungsorientierte Alterslogik: Umlage, Kapital und gesellschaftliche Wirkung werden zusammen gedacht.",
        "visual": ("woek_14_wirkungseinkommen_wirkungsrente_konzept", "Die Grafik zeigt den konzeptionellen Wechsel von Arbeit als alleiniger Beitragsbasis hin zu Wirkung als zusätzlicher gesellschaftlicher Bezugsgröße. Keine Leistungszusage; konkrete Zahlen nur mit freigegebenem Modellstand."),
        "faults_intro": "Rentenpolitik wird fragil, wenn sie nur Finanzierungsmechanik betrachtet und die gesellschaftlichen Wirkungen übersieht, die das System überhaupt tragfähig machen.",
        "faults": [
            {"title": "Arbeit als alte Steuerbasis", "text": "Wenn Produktivität zunehmend automatisiert entsteht, wird Erwerbsarbeit als alleinige Bezugsgröße fragiler."},
            {"title": "Care bleibt unsichtbar", "text": "Pflege, Erziehung und Gemeinwesen stabilisieren Gesellschaft, werden aber nur begrenzt als Systemleistung erfasst."},
            {"title": "Kapital kann Zukunftslast finanzieren", "text": "Kapitaldeckung hilft nur, wenn Kapitalwirkung und langfristige Resilienz mitgeprüft werden."},
            {"title": "Demografie wird zu eng gelesen", "text": "Alterung ist nicht nur Beitragsquote, sondern auch Pflege, Gesundheit, Prävention, Bildung und Produktivität."},
        ],
        "logic": [
            "Die WÖk erweitert die Rentenfrage von Finanzierung auf Wirkung. Nicht jede gesellschaftliche Leistung ist Erwerbsarbeit, aber viele Leistungen stabilisieren das System.",
            "Kapital bleibt möglich. Aber Rendite wird nicht blind gelesen, sondern mit Wirkungskapital, Zukunftsrisiko und Generationenstabilität verbunden.",
            "Gerade weil Rentenfragen sensibel sind, bleibt der Statushinweis zentral: keine Leistungsversprechen, keine ungeprüften Höhen, keine Scheinsicherheit.",
        ],
        "capabilities": [
            {"title": "Lebensleistung sichtbar machen", "text": "Care, Pflege, Bildung und Gemeinwesen werden als Stabilitätsleistung begrifflich sichtbar."},
            {"title": "Wirkungskapital prüfen", "text": "Kapitaldeckung wird nicht nur nach Rendite, sondern nach Zukunftsfähigkeit und Wirkung gelesen."},
            {"title": "Generationenvertrag erweitern", "text": "Alterssicherheit wird mit Prävention, Care, Produktivität und ökologischer Stabilität verbunden."},
            {"title": "Zahlen vorsichtig halten", "text": "Konkrete Beträge bleiben freigegebenen Modellständen vorbehalten."},
        ],
        "compare": [
            {"topic": "Leistung", "old": "Einzahlung und Erwerbsbiografie definieren den Kern.", "new": "Lebensleistung, Care, Wirkung und Stabilitätsbeitrag werden zusätzlich sichtbar."},
            {"topic": "Kapital", "old": "Rendite finanziert Ansprüche.", "new": "Wirkungskapital prüft, ob Rendite Zukunftsfähigkeit stärkt oder schwächt."},
            {"topic": "Generationen", "old": "Lasten werden technisch verteilt.", "new": "Wirkungslast und Stabilität zwischen Generationen werden sichtbar."},
        ],
        "path": ["Erwerb / Care / Bildung / Pflege", "Lebensleistung", "Wirkungspotenzial", "gesellschaftliche Stabilität", "Kapitalwirkung", "Netto-Wirkung", "Modellprüfung", "demokratische Entscheidung"],
        "example": "Pflegearbeit erzeugt gesellschaftliche Stabilität, wird aber in Rentenlogiken nur begrenzt als Leistung sichtbar. Die WÖk fragt, wie solche Wirkung anerkannt wird, ohne daraus ungeprüfte Leistungsversprechen abzuleiten.",
        "not": [
            {"title": "Keine konkrete Rentenhöhe", "text": "Konkrete Zahlen gelten nur, wenn sie als freigegebener Modellstand gekennzeichnet sind."},
            {"title": "Keine einfache Wunderzahl", "text": "Die WÖk löst Alterssicherheit nicht durch eine Einzelkennzahl."},
            {"title": "Keine Anlageberatung", "text": "Kapitalwirkung ist eine Analyseperspektive, keine Empfehlung zu Produkten oder Investments."},
            {"title": "Keine Abwertung von Erwerbsarbeit", "text": "Arbeit bleibt wichtig. Sie ist aber nicht die einzige gesellschaftliche Stabilitätsleistung."},
        ],
        "steps": [
            {"title": "Begriffe sauber halten", "text": "Rente, Wirkung, Care, Kapitalwirkung und Leistungsversprechen trennen."},
            {"title": "Kapitalwirkung mitdenken", "text": "Nicht nur Rendite, sondern Zukunftsrisiko und Systemwirkung prüfen."},
            {"title": "Modellstand kennzeichnen", "text": "Keine Zahlen ohne ausdrücklich freigegebene Berechnung verwenden."},
        ],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Wirkungseinkommen ansehen", "wirkungseinkommen.html"), ("Zahlenregel lesen", "../docs/woek-zahlen-und-modellrechnungen-regel.md"), ("Evidenz ansehen", "../evidenz/")],
    },
    "wirkungseinkommen.html": {
        "title": "Wirkungseinkommen als Wirkungsarchitektur",
        "meta": "Warum Wirkungseinkommen kein naives Grundeinkommen ist, sondern eine Systemfrage nach Arbeit, Automatisierung, Teilhabe, Sinn und gesellschaftlicher Wirkung.",
        "kicker": "Für wen · Wirkungseinkommen",
        "subtitle": "Wenn Produktivität nicht mehr nur aus Erwerbsarbeit entsteht, braucht Einkommen einen neuen Bezugsrahmen.",
        "status": "draft",
        "noindex": True,
        "tags": "Wirkungseinkommen, Automatisierung, KI, Grundeinkommen, Wirkung statt Erwerbszwang, Care, Teilhabe, Sinn, gesellschaftliche Stabilität",
        "hero": [
            "Automatisierung, KI und Robotik entkoppeln Produktivität zunehmend von menschlicher Erwerbsarbeit. Einkommen, Steuern, soziale Sicherheit und Anerkennung hängen aber weiter stark an Arbeit.",
            "Das Wirkungseinkommen ist deshalb kein naives Grundeinkommen und kein bloßer Transfer. Es ist die Frage, wie Sicherheit, Sinn, Teilhabe und gesellschaftliche Wirkung in einer automatisierten Wirtschaft stabilisiert werden können.",
        ],
        "formula_old": "Alte Logik koppelt Einkommen an Erwerbsarbeit.",
        "formula_new": "WÖk-Logik koppelt Sicherheit zusätzlich an gesellschaftliche Wirkung.",
        "why": [
            {"title": "Was misst das alte System falsch?", "text": "Arbeitszeit, Lohn, Erwerbsstatus, Produktivität und Steuerbasis als fast alleinige Einkommenslogik."},
            {"title": "Welche Schäden entstehen daraus?", "text": "Produktivität kann wachsen, während Teilhabe, Sinn, Sicherheit und soziale Stabilität schwächer werden."},
            {"title": "Warum reicht Transferdenken nicht?", "text": "Eine Auszahlung allein beantwortet nicht, welche Wirkung anerkannt, finanziert und rückgekoppelt werden soll."},
            {"title": "Welche Logik verändert die WÖk?", "text": "Einkommen wird als Teil einer Wirkungsarchitektur gedacht: Markteinkommen, Care, Bildung, Gemeinwesen, Demokratiearbeit und Automatisierungsdividende werden prüfbar verbunden."},
        ],
        "new_order": "Es entsteht kein freies Zahlenversprechen, sondern eine Modelllogik für Sicherheit, Teilhabe und Wirkung nach der alten Arbeitsgesellschaft.",
        "visual": ("woek_14_wirkungseinkommen_wirkungsrente_konzept", "Die Grafik zeigt den konzeptionellen Wechsel von Arbeit als alleiniger Einkommens- und Beitragsbasis hin zu Wirkung als zusätzlicher gesellschaftlicher Bezugsgröße. Keine Leistungszusage; konkrete Zahlen nur mit freigegebenem Modellstand."),
        "faults_intro": "Die Arbeitsgesellschaft wird nicht über Nacht verschwinden. Aber ihre Steuerbasis wird fragiler, wenn Produktivität zunehmend aus automatisierten Systemen entsteht.",
        "faults": [
            {"title": "Produktivität ohne Arbeit", "text": "Maschinen, KI und Plattformen können Wertschöpfung erzeugen, ohne Einkommen breit zu verteilen."},
            {"title": "Sicherheit bleibt arbeitsgebunden", "text": "Soziale Sicherung hängt weiterhin stark an Erwerbsstatus und Lohn."},
            {"title": "Wirkung bleibt unbezahlt", "text": "Care, Bildung, Pflege, Gemeinwesen und Demokratiearbeit stabilisieren Gesellschaft, sind aber oft einkommensschwach."},
            {"title": "Sinn wird nachgelagert", "text": "Menschen brauchen nicht nur Zahlung, sondern Teilhabe, Anerkennung und Rolle in einem Wirkungssystem."},
        ],
        "logic": [
            "Die WÖk fragt nicht: Wie verteilt man Geld möglichst einfach? Sie fragt: Welche gesellschaftliche Wirkung braucht Sicherheit, damit Menschen handlungsfähig bleiben?",
            "Markteinkommen bleibt möglich. Arbeit, Unternehmertum und Leistung werden nicht abgeschafft. Aber Einkommen wird nicht länger nur als Erwerbsfolge verstanden.",
            "Gerade bei Wirkungseinkommen gilt streng: keine Beträge, keine Leistungsversprechen, keine Scheingenauigkeit ohne freigegebenen Modellstand.",
        ],
        "capabilities": [
            {"title": "Sicherheit vor Reparatur", "text": "Soziale Stabilität wird nicht erst nachträglich repariert, wenn Ausschluss und Angst entstanden sind."},
            {"title": "Wirkungsbeiträge sichtbar machen", "text": "Care, Bildung, Pflege, Gemeinwesen und Demokratiearbeit werden als gesellschaftliche Leistung lesbar."},
            {"title": "Automatisierung rückkoppeln", "text": "Produktivität aus Maschinen und KI wird mit sozialer Stabilität und Teilhabe verbunden."},
            {"title": "Sinn und Rolle mitdenken", "text": "Einkommen wird nicht nur als Zahlung, sondern als Teil von Handlungsspielraum gelesen."},
        ],
        "compare": [
            {"topic": "Produktivität", "old": "Produktivität und Einkommen hängen stark an Erwerbsarbeit.", "new": "Automatisierte Produktivität wird als Wirkungs- und Verteilungsfrage sichtbar."},
            {"topic": "Transfer", "old": "Einkommen wird als Zahlung gedacht.", "new": "Einkommen wird als Baustein einer Wirkungsarchitektur geprüft."},
            {"topic": "Teilhabe", "old": "Wer nicht erwerbstätig ist, verliert häufig Status und Sicherheit.", "new": "Gesellschaftliche Wirkung, Sinn und Stabilität werden ergänzend sichtbar."},
        ],
        "path": ["Automatisierung / KI / Robotik", "Produktivität", "Erwerbsarbeit und Markteinkommen", "gesellschaftliche Wirkung", "Sicherheit und Teilhabe", "Finanzierungsbausteine", "Modellprüfung", "demokratische Entscheidung"],
        "example": "Eine Person pflegt Angehörige, begleitet Kinder, stärkt Nachbarschaft oder Demokratie. Diese Wirkung stabilisiert Gesellschaft, ist aber oft nicht einkommenswirksam. Die WÖk fragt, wie solche Wirkung sichtbar und anschlussfähig werden kann.",
        "not": [
            {"title": "Keine ungeprüften Beträge", "text": "Zahlen werden nicht veröffentlicht, solange sie nicht ausdrücklich freigegeben sind."},
            {"title": "Kein Ersatz für Markteinkommen", "text": "Arbeit, Unternehmertum und Leistung bleiben möglich und relevant."},
            {"title": "Kein naiver Transfer", "text": "Die Kernfrage ist Wirkungsarchitektur, nicht nur Auszahlung."},
            {"title": "Keine Leistungszusage", "text": "Diese Seite erklärt Konzeptlogik und ersetzt keine politische oder rechtliche Ausgestaltung."},
        ],
        "steps": [
            {"title": "Automatisierung richtig einordnen", "text": "KI und Robotik als Produktivitätstreiber lesen, nicht als sozialen Kompass."},
            {"title": "Wirkungsbeiträge erfassen", "text": "Care, Bildung, Pflege, Gemeinwesen und Demokratiearbeit systemisch unterscheiden."},
            {"title": "Modellstand schützen", "text": "Nur freigegebene Zahlen kommunizieren, alles andere als Konzeptstand kennzeichnen."},
        ],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Rente ansehen", "rente.html"), ("Downloads öffnen", "../downloads.html"), ("Evidenz ansehen", "../evidenz/")],
    },
    "journalismus.html": {
        "title": "Öffentlichkeit ist ein Wirkungsraum",
        "meta": "Warum Journalismus neben Faktenprüfung auch Wirkungspotenziale, Resonanzräume, Plattformlogik, Vertrauen und demokratische Korrekturfähigkeit analysieren muss.",
        "kicker": "Für wen · Journalismus",
        "subtitle": "Nicht aktivistischer, sondern wirkungsbewusster.",
        "status": "needs_review",
        "noindex": True,
        "tags": "WÖk für Journalisten, Journalismus, Wirkungsanalyse, Wirkung politischer Sprache, Resonanzräume, Desinformation, Vertrauen, Demokratie",
        "hero": [
            "Journalismus muss nicht aktivistischer werden. Er muss wirkungsbewusster werden.",
            "Die Maßstabskrise der Öffentlichkeit entsteht, wenn Reichweite, Geschwindigkeit und Empörung Orientierung ersetzen. Öffentlichkeit ist nicht nur Informationsfluss, sondern Wirkungsraum: Sie beeinflusst Vertrauen, Angst, Polarisierung, Handlungsfähigkeit und demokratische Korrektur.",
            "Faktencheck bleibt notwendig. Aber er reicht nicht, wenn Sprache, Frames, Plattformlogik und Wiederholung Wirkungspotenziale erzeugen.",
        ],
        "formula_old": "Alte Logik fragt: Stimmt die Aussage?",
        "formula_new": "WÖk-Logik fragt zusätzlich: Welche Wirkungspotenziale erzeugt sie?",
        "why": [
            {"title": "Was misst das alte System falsch?", "text": "Reichweite, Aktualität, Klicks, Erregung, Sichtbarkeit und Tempo."},
            {"title": "Welche Schäden entstehen daraus?", "text": "Resonanzräume verstärken Misstrauen, Plattformlogik belohnt Polarisierung, Desinformation nutzt Wirkung dritter Ordnung."},
            {"title": "Warum reichen Faktenchecks nicht?", "text": "Eine Aussage kann faktisch korrekt sein und trotzdem destruktive Frames, Feindbilder oder Handlungsschwellen erzeugen."},
            {"title": "Welche Logik verändert die WÖk?", "text": "Fakt, Meinung, Frame, Resonanzraum, Wirkungspotenzial und demokratische Wirkung werden getrennt analysiert."},
        ],
        "new_order": "Es entsteht wirkungsbewusster Journalismus: präziser in Einordnung, Quellenklarheit und demokratischer Verantwortung, ohne Zensur oder Parteiposition.",
        "visual": ("woek_13_medien_sprache_wirkpfad", "Politische Sprache erzeugt Wirkungspotenziale und Resonanzrisiken. Die WÖk hilft, Frames, Vertrauen, Polarisierung und demokratische Stabilität zu unterscheiden."),
        "faults_intro": "Medienwirkung ist nicht linear. Wiederholung, Kontext, Plattformverstärkung und soziale Identität können aus einer Aussage eine Wirkungsarchitektur machen.",
        "faults": [
            {"title": "Aufmerksamkeit ist kein Maßstab", "text": "Viel Reichweite kann Orientierung schaffen oder demokratische Stabilität schwächen."},
            {"title": "Sprache wirkt mehrstufig", "text": "Begriffe erzeugen Frames, Frames öffnen Resonanzräume, Resonanz kann Vertrauen und Verhalten verändern."},
            {"title": "Plattformen verstärken Potenziale", "text": "Algorithmen machen aus Aussagen Wirkungspfade zweiter und dritter Ordnung."},
            {"title": "Vertrauen ist Infrastruktur", "text": "Journalismus wirkt auf die Korrekturfähigkeit der Demokratie, nicht nur auf Informationsstand."},
        ],
        "logic": [
            "Die WÖk ersetzt keine Redaktion. Sie ergänzt journalistische Prüfung um Wirkungsanalyse: Welche Resonanzräume werden geöffnet, welche Handlungsschwellen entstehen, welche demokratische Wirkung ist plausibel?",
            "Wichtig ist die Unterscheidung zwischen nachgewiesener Wirkung und Wirkungspotenzial. Nicht jeder Begriff erzeugt automatisch messbare Wirkung. Aber er kann Resonanzrisiken eröffnen.",
            "Journalismus wird dadurch nicht parteiischer. Er wird methodischer, wenn Fakt, Meinung, Frame und Wirkung klarer getrennt werden.",
        ],
        "capabilities": [
            {"title": "Resonanzanalyse", "text": "Politische Sprache wird nach Frames, Emotionen, Feindbildern, Vertrauen und Handlungsfähigkeit gelesen."},
            {"title": "Wirkungspotenzial statt Behauptung", "text": "Die Analyse behauptet keine automatische Wirkung, sondern markiert plausible Wirkpfade und Unsicherheit."},
            {"title": "Quellenklarheit", "text": "Leser:innen sehen besser, worauf Einordnung beruht und wo die Datenlage begrenzt ist."},
            {"title": "Demokratische Verantwortung", "text": "Öffentlichkeit wird als Infrastruktur für Korrektur, Vertrauen und Rechtsstaatlichkeit verstanden."},
        ],
        "compare": [
            {"topic": "Faktencheck", "old": "Ist die Aussage wahr oder falsch?", "new": "Welche Frames, Resonanzräume und Wirkungspotenziale entstehen zusätzlich?"},
            {"topic": "Reichweite", "old": "Aufmerksamkeit gilt als Erfolg.", "new": "Orientierung, Vertrauen und demokratische Stabilität werden als Wirkungsräume mitgelesen."},
            {"topic": "Einordnung", "old": "Thema, Konflikt und Position.", "new": "Wirkungspfad, Resonanzrisiko, Quellenlage und Zielkonflikt."},
        ],
        "path": ["Aussage / Frame", "Resonanzraum", "Wirkungspotenzial", "Plattformverstärkung", "Vertrauen / Polarisierung", "Demokratiebezug", "redaktionelle Einordnung", "Lernen"],
        "example": "Ein politischer Begriff kann faktisch nicht falsch sein und trotzdem Angst, Misstrauen oder Feindbilder normalisieren. Die WÖk behauptet keine automatische Wirkung, sondern prüft Wirkungspotenzial, Resonanzrisiko und Kontext.",
        "not": [
            {"title": "Keine Zensur", "text": "Wirkungsanalyse entscheidet nicht, was gesagt werden darf."},
            {"title": "Keine Redaktionsersetzung", "text": "Journalistische Verantwortung bleibt bei Redaktion und Autor:innen."},
            {"title": "Keine staatliche Wahrheitshoheit", "text": "Die WÖk macht Wirkungspfade sichtbar, ersetzt aber keine offene Debatte."},
            {"title": "Keine Meinungssteuerung", "text": "Meinungen bleiben frei. Analysiert wird, welche Wirkungspotenziale sie im öffentlichen Raum erzeugen."},
        ],
        "steps": [
            {"title": "Aussage in Ebenen zerlegen", "text": "Fakt, Meinung, Frame, Quelle und Wirkungspotenzial getrennt betrachten."},
            {"title": "Resonanzraum prüfen", "text": "Welche Emotionen, Feindbilder, Vertrauenserwartungen oder Handlungsschwellen entstehen?"},
            {"title": "Scanner als Werkzeug nutzen", "text": "Artikel, Website oder Wahlprogramm als Wirkungsanalyse vorbereiten."},
        ],
        "links": [("Scanner öffnen", "../scanner.html"), ("Wirkung politischer Sprache", "../sdg-plus/medien-demokratie/wirkung-politischer-sprache.html"), ("Medien & Demokratie", "../sdg-plus/medien-demokratie.html"), ("Evidenz ansehen", "../evidenz/")],
    },
    "investoren.html": {
        "title": "Kapital als Verstärker von Richtung",
        "meta": "Warum Kapitalwirkung mehr ist als ESG-Risikosortierung: Rendite, Risiko, Wirkung, T-SROI und Resilienz müssen zusammen gelesen werden.",
        "kicker": "Für wen · Investor:innen",
        "subtitle": "Risikowahrheit entsteht, wenn Kapital seine Wirkung kennt.",
        "status": "needs_review",
        "noindex": True,
        "tags": "Kapitalwirkung, WÖk Investoren, Wirkungskapital, T-SROI, Transformationsrisiko, stranded assets, Resilienz, keine Anlageberatung",
        "hero": [
            "Die Maßstabskrise des Kapitals entsteht, wenn Rendite als Richtung gelesen wird. Kapital ist ein Werkzeug: Es verstärkt Geschäftsmodelle, Infrastrukturen und politische Möglichkeitsräume.",
            "Die eigentliche Frage lautet deshalb nicht nur, welche Rendite entsteht, sondern welche Wirkung Kapital skaliert und welche Zukunftsrisiken es erzeugt oder reduziert.",
            "Die WÖk ist keine Anlageberatung. Sie ist eine Logik für Kapitalwirkung, Risikowahrheit und resilientere Entscheidungsgrundlagen.",
        ],
        "formula_old": "Alte Kapitalanlage trennt Rendite, Risiko und Wirkung.",
        "formula_new": "WÖk-Logik verbindet Rendite, Risiko, Wirkung und Resilienz.",
        "why": [
            {"title": "Was misst das alte System falsch?", "text": "Rendite, Volatilität, Liquidität, ESG-Rating und kurzfristiges Marktrisiko."},
            {"title": "Welche Schäden entstehen daraus?", "text": "Stranded Assets, Rendite aus externalisierter Wirkungslast, Transformationsblindheit und Demokratie-/Governance-Risiken."},
            {"title": "Warum reicht ESG-Risikosortierung nicht?", "text": "ESG sortiert häufig Risiken und Offenlegung, zeigt aber nicht automatisch positive Netto-Wirkung oder Transformationsfähigkeit."},
            {"title": "Welche Logik verändert die WÖk?", "text": "Kapital wird als Rückkopplungssystem gelesen: Wirkungskapital, T-SROI, Transformationsrisiko und Resilienz werden verbunden."},
        ],
        "new_order": "Es entsteht Risikowahrheit: Kapital wird danach gelesen, welche Richtung es verstärkt und ob es positive Netto-Wirkung wahrscheinlicher macht.",
        "faults_intro": "Finanzmärkte sind nicht außerhalb der Wirkungsarchitektur. Sie entscheiden mit, welche Geschäftsmodelle wachsen, welche Infrastruktur entsteht und welche Zukunft teurer wird.",
        "faults": [
            {"title": "Kapital ist nicht neutral", "text": "Jeder Kapitalfluss verstärkt eine Wirkungsordnung, auch wenn er sich als rein finanziell versteht."},
            {"title": "Rendite kann blind sein", "text": "Profitabilität kann auf Wirkungslast beruhen, die später als Klima-, Lieferketten-, Regulierungs- oder Vertrauensrisiko zurückkehrt."},
            {"title": "ESG ist kein Kompass", "text": "ESG-Daten sind Anschlussräume. Der Kompass ist positive Netto-Wirkung für Mensch, Planet und Demokratie."},
            {"title": "Systemrisiken werden unterschätzt", "text": "Demokratie-, Governance-, Biodiversitäts- und Lieferkettenrisiken wirken auf Portfolios zurück."},
        ],
        "logic": [
            "Die WÖk verschiebt Kapitalanalyse von isolierter Rendite zu Wirkungskapital. Kapital bleibt Werkzeug, aber seine Richtung wird sichtbar.",
            "T-SROI und Transformationswirkung ergänzen klassische Kennzahlen, weil sie fragen, ob Kapital reale Zustandsveränderung und Systemresilienz ermöglicht.",
            "Das ist keine moralische Ausschlussliste und keine Renditegarantie, sondern eine präzisere Risikologik.",
        ],
        "capabilities": [
            {"title": "Kapitalwirkung lesen", "text": "Investments werden danach betrachtet, welche Wirkung sie ermöglichen, verstärken oder verdecken."},
            {"title": "Transformationsrisiko erkennen", "text": "Geschäftsmodelle mit hoher Wirkungslast werden als mögliche Zukunftsrisiken sichtbar."},
            {"title": "T-SROI ergänzen", "text": "Transformationswirkung wird als Ergänzung zu Rendite, Risiko und ESG gelesen."},
            {"title": "Portfolioresilienz stärken", "text": "Kapitalflüsse können stärker auf Zukunftsfähigkeit und positive Netto-Wirkung ausgerichtet werden."},
        ],
        "compare": [
            {"topic": "Kapital", "old": "Rendite und Risiko werden getrennt von Wirkung analysiert.", "new": "Kapitalwirkung verbindet Rendite, Risiko, Wirkung und Resilienz."},
            {"topic": "ESG", "old": "Rating, Offenlegung oder Ausschlusslogik.", "new": "Anschlussraum für Wirkungsdaten, aber nicht der eigentliche Kompass."},
            {"topic": "Portfolio", "old": "Diversifikation gegen Marktrisiko.", "new": "Resilienz gegen Klima-, Lieferketten-, Governance- und Demokratierisiken."},
        ],
        "path": ["Investmentthese", "Kapitalfluss", "Wirkungspotenzial", "Unternehmen / Infrastruktur", "Kapitalwirkung", "T-SROI / Netto-Wirkung", "Portfolio-Rückkopplung", "Lernen"],
        "example": "Ein Asset kann heute hohe Rendite bringen, aber fossile Abhängigkeit, Lieferkettenrisiken oder demokratische Instabilität verstärken. Die WÖk fragt, ob Rendite Zukunftsfähigkeit erzeugt oder Zukunftslast tarnt.",
        "not": [
            {"title": "Keine Anlageberatung", "text": "Diese Seite gibt keine Kauf-, Verkaufs- oder Produktempfehlung."},
            {"title": "Keine Renditegarantie", "text": "Wirkungsanalyse verbessert Risikowahrheit, garantiert aber keine Erträge."},
            {"title": "Keine pauschale Ausschlussmoral", "text": "Die WÖk analysiert Wirkungspfade und Transformationsfähigkeit, nicht symbolische Reinheit."},
            {"title": "Kein Ersatz für Due Diligence", "text": "Fachliche, rechtliche und finanzielle Prüfung bleibt notwendig."},
        ],
        "steps": [
            {"title": "Rendite nach Richtung fragen", "text": "Welche Wirkung und Wirkungslast wird durch Kapital verstärkt?"},
            {"title": "ESG nicht verwechseln", "text": "ESG-Daten als Anschlussraum nutzen, aber Wirkungskapital als Logik prüfen."},
            {"title": "Transformationsrisiko markieren", "text": "Stranded assets, Lieferketten, Klima, Governance und Demokratie zusammendenken."},
        ],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("T-SROI klären", "../glossar.html#begriff-t-sroi"), ("Datenstandards verstehen", "../methodik/daten-standards-regularien.html"), ("Evidenz ansehen", "../evidenz/")],
    },
    "kommunen.html": {
        "title": "Kommunen als reale Wirkungsräume",
        "meta": "Warum Kommunen Wirkungshaushalte, lokale Resilienz und präventive Steuerung brauchen, weil Wohnen, Hitze, Wasser, Pflege, Bildung und Teilhabe vor Ort zusammenwirken.",
        "kicker": "Für wen · Kommunen",
        "subtitle": "Vor Ort wird Wirkung konkret.",
        "status": "needs_review",
        "noindex": True,
        "tags": "Kommunen Wirkungshaushalt, lokale Resilienz, Wirkung vor Ort, Prävention, öffentliche Beschaffung, Stadtbaum, Mannheim 2030, SDG-Portale",
        "hero": [
            "Kommunen tragen viele Wirkungen direkt: Wohnen, Hitze, Wasser, Bildung, Pflege, Mobilität, Beteiligung, Sicherheit und Vertrauen treffen vor Ort zusammen.",
            "Die Maßstabskrise der Kommune entsteht, wenn Haushalte, Ressorts und Projektlogiken Mehrfachwirkung verdecken. Eine Maßnahme wirkt selten nur in einem Amt.",
            "Die WÖk liest Kommunen deshalb nicht als Verwaltungsflächen, sondern als reale Wirkungsräume.",
        ],
        "formula_old": "Alte Kommunallogik verteilt knappe Mittel in Silos.",
        "formula_new": "WÖk-Logik priorisiert Mehrfachwirkung und Prävention.",
        "why": [
            {"title": "Was misst das alte System falsch?", "text": "Haushaltstitel, Projektmittel, Ressortzuständigkeit, Ausgabenhöhe und kurzfristige Umsetzbarkeit."},
            {"title": "Welche Schäden entstehen daraus?", "text": "Projekt-Silos, verspätete Reparatur, unsichtbare Prävention, Beteiligungsmüdigkeit und lokale Verwundbarkeit."},
            {"title": "Warum reicht kommunale Nachhaltigkeit nicht?", "text": "Einzelne Nachhaltigkeitsprojekte bleiben zu schwach, wenn Haushalt, Beschaffung, Planung und Beteiligung nicht nach Wirkung verbunden werden."},
            {"title": "Welche Logik verändert die WÖk?", "text": "Wirkungshaushalt, lokale Resilienz, öffentliche Beschaffung und Beteiligung werden nach Mehrfachwirkung rückgekoppelt."},
        ],
        "new_order": "Es entsteht eine kommunale Wirkungsarchitektur: knappe Mittel werden nach Prävention, Resilienz und positiver Netto-Wirkung priorisiert.",
        "faults_intro": "Kommunen erleben Wirkung nicht abstrakt. Sie sehen direkt, ob Hitze, Wohnen, Pflege, Bildung, Wasser und Teilhabe zusammen stabiler oder verletzlicher werden.",
        "faults": [
            {"title": "Projekt-Silos verdecken Mehrfachwirkung", "text": "Ein Schulweg, Stadtbaum oder Quartierszentrum wirkt auf Gesundheit, Sicherheit, Klima, Bildung und Teilhabe zugleich."},
            {"title": "Prävention bleibt unsichtbar", "text": "Vermiedene Folgekosten erscheinen selten so klar wie aktuelle Ausgaben."},
            {"title": "Beschaffung wirkt stärker als gedacht", "text": "Kommunale Einkäufe beeinflussen Lieferketten, regionale Wertschöpfung, Klima und soziale Standards."},
            {"title": "Beteiligung braucht Wirkungsklarheit", "text": "Bürger:innen vertrauen eher, wenn sie sehen, welche Zustände eine Maßnahme verändern soll."},
        ],
        "logic": [
            "Die WÖk macht kommunale Wirkungshaushalte nicht zu einer neuen Berichtspflicht. Sie macht sichtbar, wie lokale Mittel Mehrfachwirkung erzeugen.",
            "Wohnen, Hitze, Wasser, Bildung, Pflege, Mobilität und Teilhabe werden nicht als getrennte Probleme behandelt, sondern als verbundene Wirkungsräume.",
            "So wird Prävention politisch und haushalterisch begründbarer.",
        ],
        "capabilities": [
            {"title": "Wirkungshaushalt", "text": "Ausgaben werden mit Prävention, Mehrfachwirkung und vermiedenen Folgekosten verbunden."},
            {"title": "Lokale Resilienz", "text": "Hitze, Wasser, Wohnen, Pflege, Bildung und Mobilität werden gemeinsam priorisiert."},
            {"title": "Wirkungsbeschaffung", "text": "Öffentliche Beschaffung wird als Hebel für regionale, soziale und ökologische Wirkung sichtbar."},
            {"title": "Beteiligung mit Substanz", "text": "Bürger:innen sehen nicht nur Projekte, sondern erwartete Zustandsveränderungen."},
        ],
        "compare": [
            {"topic": "Haushalt", "old": "Ausgaben werden nach Titeln, Ressorts und Jahreslogik geplant.", "new": "Mittel werden nach Mehrfachwirkung, Prävention und Resilienz gelesen."},
            {"topic": "Projekte", "old": "Einzelmaßnahmen konkurrieren um Mittel.", "new": "Wirkungspfade zeigen Synergien, Zielkonflikte und Folgekosten."},
            {"topic": "Beteiligung", "old": "Debatten bleiben oft abstrakt oder konfliktgetrieben.", "new": "Wirkung macht Entscheidungen lokal nachvollziehbarer."},
        ],
        "path": ["Lokales Problem", "Wirkungsräume", "Daten / Haushalt", "Mehrfachwirkung", "Zielkonflikte", "Priorisierung", "Beschaffung / Planung", "Evaluation"],
        "example": "Ein Stadtbaum ist nicht nur Grünfläche. Er wirkt auf Hitze, Gesundheit, Wasserhaushalt, Aufenthaltsqualität, soziale Begegnung, Biodiversität und Quartiersstabilität.",
        "not": [
            {"title": "Keine Wunderfinanzierung", "text": "Die WÖk ersetzt keine knappen Haushalte. Sie verbessert Priorisierung und Begründung."},
            {"title": "Keine Ratsersetzung", "text": "Demokratische Entscheidungen bleiben bei Rat, Verwaltung und Bürger:innen."},
            {"title": "Keine perfekte Messung", "text": "Lokale Wirkung bleibt kontextabhängig und braucht Evaluation."},
            {"title": "Keine Projektbürokratie", "text": "Ziel ist Rückkopplung in Haushalt und Planung, nicht ein weiteres Berichtssilo."},
        ],
        "steps": [
            {"title": "Eine Maßnahme als Wirkungsfall wählen", "text": "Stadtbaum, Schulweg, Sanierung oder Quartierszentrum als Beispiel prüfen."},
            {"title": "Mehrfachwirkung kartieren", "text": "Gesundheit, Klima, Wasser, Teilhabe, Haushalt und Vertrauen zusammen lesen."},
            {"title": "Haushalt rückkoppeln", "text": "Prävention und vermiedene Folgekosten sichtbar machen."},
        ],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Politik-Seite ansehen", "politik.html"), ("SDG+ öffnen", "../sdg-plus.html"), ("Evidenz ansehen", "../evidenz/")],
    },
    "akademie.html": {
        "title": "Wirkungskompetenz als Schlüsselkompetenz",
        "meta": "Warum die Akademie Wirkungskompetenz, systemisches Denken, Wirkungslogik, Quellenkompetenz, Scannerkompetenz und Zielkonfliktfähigkeit aufbaut.",
        "kicker": "Für wen · Akademie",
        "subtitle": "Komplexe Gesellschaften brauchen Menschen, die Wirkung lesen können.",
        "status": "draft",
        "noindex": True,
        "tags": "Wirkungskompetenz, Akademie, Wirkung lernen, systemisches Lernen, Scannerkompetenz, Quellenprüfung, Zielkonflikte, SDG+",
        "hero": [
            "Die Maßstabskrise ist auch eine Bildungskrise. Begriffe, Daten, Narrative, Zielkonflikte und Quellen werden oft vermischt, obwohl sie unterschiedliche Formen von Wirklichkeit beschreiben.",
            "Wirkungskompetenz heißt nicht, die richtige Meinung zu lernen. Es heißt, Wirkung, Wirkungspotenzial, Datenlage, Quelle, Zielkonflikt und Rückkopplung sauber unterscheiden zu können.",
            "Die Akademie ist deshalb kein Kursregal, sondern Lernarchitektur für eine komplexe Wirkungswelt.",
        ],
        "formula_old": "Alte Bildung sammelt Wissen.",
        "formula_new": "WÖk-Akademie trainiert Wirkungskompetenz.",
        "why": [
            {"title": "Was misst das alte System falsch?", "text": "Wissensmenge, Zertifikat, Meinungssicherheit, Aktivität und Wiederholung von Begriffen."},
            {"title": "Welche Schäden entstehen daraus?", "text": "Begriffsnebel, Datenmissverständnisse, moralische Reflexe, Zielkonfliktblindheit und manipulierbare Öffentlichkeit."},
            {"title": "Warum reicht Nachhaltigkeitswissen nicht?", "text": "Nachhaltigkeitswissen bleibt unterbestimmt, wenn Menschen Wirkung, Wirkungspotenzial, Datenqualität und Rückkopplung nicht unterscheiden."},
            {"title": "Welche Logik verändert die WÖk?", "text": "Lernen wird als Wirkungsarchitektur aufgebaut: Begriffslogik, Wirkungspfade, SDG/SDG+, Quellen, Scanner und Reflexion."},
        ],
        "new_order": "Es entsteht ein Bildungsraum für Urteilskraft: Menschen lernen, Komplexität zu lesen, statt nur Positionen zu wiederholen.",
        "faults_intro": "Wirkungskompetenz ist die Voraussetzung dafür, dass WÖk nicht als Schlagwort, sondern als prüfbare Systemlogik verstanden wird.",
        "faults": [
            {"title": "Wirkung wird verwechselt", "text": "Absicht, Output, Image, Bericht und tatsächliche Zustandsveränderung werden oft gleichgesetzt."},
            {"title": "Daten ohne Urteilskraft", "text": "Viele Kennzahlen helfen wenig, wenn Quelle, Qualität, Rahmen und Aussagegrenze unklar bleiben."},
            {"title": "Narrative wirken unbemerkt", "text": "Sprache, Frames und Resonanzräume beeinflussen Entscheidungen, bevor Daten geprüft werden."},
            {"title": "Zielkonflikte werden moralisiert", "text": "Komplexe Abwägungen brauchen Methode, nicht nur Haltung."},
        ],
        "logic": [
            "Die Akademie übersetzt die WÖk in Lernpfade: von Begriffen zu Wirkungspfaden, von Daten zu Scorecards, von Aussagen zu Resonanzanalyse, von Zielkonflikten zu begründeter Entscheidung.",
            "Wirkungskompetenz ist keine Ideologieschulung. Sie ist die Fähigkeit, Systeme, Daten, Sprache und Rückkopplung kritisch zu lesen.",
            "Damit wird die Akademie zum langfristigen Kompetenzraum der Wirkungsökonomie.",
        ],
        "capabilities": [
            {"title": "Begriffskompetenz", "text": "Wirkung, Wirkungspotenzial, Netto-Wirkung, Wirkungslast und Wirkungslenkung werden unterscheidbar."},
            {"title": "Daten- und Quellenkompetenz", "text": "Standards, Evidenz, Datenlücken und Aussagegrenzen können methodisch gelesen werden."},
            {"title": "Scannerkompetenz", "text": "Produkte, Texte, Programme und Unternehmen werden als Wirkungspfade analysierbar."},
            {"title": "Zielkonfliktfähigkeit", "text": "Lernende Abwägung ersetzt moralischen Reflex und einfache Lagerbildung."},
        ],
        "compare": [
            {"topic": "Lernen", "old": "Wissen wird gesammelt und geprüft.", "new": "Wirkungspfade werden verstanden, angewendet und reflektiert."},
            {"topic": "Begriffe", "old": "Wirkung bleibt unscharf.", "new": "Begriffe werden sauber getrennt und an Beispielen geübt."},
            {"topic": "Urteil", "old": "Meinungen dominieren.", "new": "Daten, Quellen, Zielkonflikte und Rückkopplung strukturieren Urteilskraft."},
        ],
        "path": ["Begriff", "Beispiel", "Wirkungspfad", "Datenlage", "Scorecard / SDG+", "Quellenprüfung", "Reflexion", "Anwendung"],
        "example": "Eine Aussage über ein Produkt klingt plausibel. Wirkungskompetenz fragt: Welche Daten liegen vor, welcher Wirkungsraum ist gemeint, was ist nur Potenzial und welche Zielkonflikte bleiben offen?",
        "not": [
            {"title": "Kein Dogma", "text": "Die Akademie soll prüfen, nicht Glaubenssätze vermitteln."},
            {"title": "Keine fertige Wahrheit", "text": "Status, Quellen und Unsicherheit bleiben sichtbar."},
            {"title": "Kein Buzzword-Lernen", "text": "Begriffe werden an Beispielen, Wirkungspfaden und Grenzen trainiert."},
            {"title": "Kein reines E-Learning", "text": "Die Akademie ist Kompetenzarchitektur, nicht nur Kursliste."},
        ],
        "steps": [
            {"title": "Begriffspfad starten", "text": "Wirkung, Wirkungspotenzial, Netto-Wirkung und Rückkopplung unterscheiden."},
            {"title": "Ein Beispiel analysieren", "text": "Produkt, Aussage oder Maßnahme als Wirkungspfad lesen."},
            {"title": "Scannerkompetenz aufbauen", "text": "Datenlage, Quellen und Zielkonflikte bewusst markieren."},
        ],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Akademie öffnen", "../akademie.html"), ("Glossar ansehen", "../glossar.html"), ("Evidenz ansehen", "../evidenz/")],
    },
}


HUB_CARDS = [
    ("unternehmen.html", "Unternehmen", "KPI, Kapitalrendite und Reporting messen Zielerreichung, aber nicht Tragfähigkeit.", "Wirkung wird zur Führungslogik für Mitarbeitende, Ressourcen, Kreisläufe, Wertschöpfung und Kapital.", "Resiliente Unternehmensführung; ESG entsteht als Nebenprodukt guter Wirkungssteuerung."),
    ("politik.html", "Politik", "Beschlüsse und Haushalte zeigen Aktivität, aber nicht automatisch Wirkung.", "Politik wird als Rückkopplungsarchitektur aus Recht, Haushalt, Steuern, Beschaffung und Lernen organisiert.", "Mehr Prävention, weniger Reparaturstaat, bessere demokratische Nachvollziehbarkeit."),
    ("buergerinnen.html", "Bürger:innen", "Menschen sollen moralisch richtig handeln, obwohl Preise und Informationen falsche Signale senden.", "Wirkung wird im System sichtbarer: Preise, Produkte, Scanner, Quellen und politische Sprache.", "Orientierung statt Schuldgefühl und mehr Handlungsspielraum im Alltag."),
    ("mieter.html", "Wohnen", "Wohnungen werden als Anlageklasse gelesen, obwohl sie Quartiere, Gesundheit und Demokratie prägen.", "Wohnen wird als Wirkungsraum bewertet: Bezahlbarkeit, Energie, Gesundheit, Quartier und Stabilität.", "Faire und klimastabile Wohnmodelle werden strukturell sichtbarer."),
    ("rente.html", "Rente", "Einzahlung misst nicht jede gesellschaftliche Stabilitätsleistung.", "Lebensleistung, Care, Bildung, Kapitalwirkung und Generationenstabilität werden sichtbar.", "Alterssicherheit wird als Wirkungssystem gedacht, ohne ungeprüfte Zahlenversprechen."),
    ("wirkungseinkommen.html", "Wirkungseinkommen", "Automatisierung löst Produktivität teilweise von Erwerbsarbeit.", "Einkommen wird als Wirkungsarchitektur für Sicherheit, Sinn, Teilhabe und gesellschaftliche Stabilität geprüft.", "Keine naive Transferlogik, sondern vorsichtiger Modellraum für die Arbeitsgesellschaft im Wandel."),
    ("journalismus.html", "Journalismus", "Reichweite und Faktencheck reichen nicht, wenn Frames Resonanzräume erzeugen.", "Öffentlichkeit wird als Wirkungsraum für Vertrauen, Polarisierung und Demokratie analysiert.", "Bessere Einordnung von Sprache, Quellen, Wirkungspotenzialen und Desinformation."),
    ("investoren.html", "Investor:innen", "Rendite zeigt nicht, welche Richtung Kapital verstärkt.", "Kapital wird nach Wirkungskapital, T-SROI, Transformationsrisiko und Resilienz gelesen.", "Risikowahrheit statt ESG-Ersatzkompass; keine Anlageberatung."),
    ("kommunen.html", "Kommunen", "Haushalte und Projekt-Silos verdecken lokale Mehrfachwirkung.", "Wirkungshaushalte und Beschaffung richten Mittel an Prävention und lokaler Resilienz aus.", "Bessere Priorisierung knapper Mittel und sichtbare Wirkung vor Ort."),
    ("akademie.html", "Akademie", "Wissen allein erzeugt noch keine Wirkungskompetenz.", "Wirkung, Daten, Quellen, Narrative und Zielkonflikte werden als Lernarchitektur aufgebaut.", "Urteilskraft statt Meinungswiederholung."),
]


def render_systemic_page(slug: str, data: dict[str, object]) -> str:
    visual = ""
    if data.get("visual"):
        visual_id, caption = data["visual"]  # type: ignore[misc]
        visual = visual_figure(str(visual_id), str(caption))

    return f"""
      <section class="hero">
        <div>
          <p class="hero-kicker">{e(data["kicker"])}</p>
          <h1 class="hero-title">{e(data["title"])}</h1>
          <p class="hero-subtitle">{e(data["subtitle"])}</p>
          {paras(data["hero"])}
          <div class="why-formula"><strong>{e(data["formula_old"])}</strong><span>{e(data["formula_new"])}</span></div>
          {status_note(slug, str(data["status"]))}
        </div>
      </section>

      <section class="section">
        <div class="why-block">
          <p class="hero-kicker">Maßstabskrise</p>
          <h2>Das Problem beginnt nicht bei einzelnen Themen. Es beginnt bei der alten Steuerungslogik.</h2>
          <div class="why-grid">
            {"".join(f'<article><span>{idx}</span><h3>{e(item["title"])}</h3><p>{e(item["text"])}</p></article>' for idx, item in enumerate(data["why"], start=1))}
          </div>
          <div class="core-problem"><strong>Neue Ordnung:</strong> {e(data["new_order"])}</div>
        </div>
      </section>

      {visual}

      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Fehlsteuerung</p><h2>Warum die alte Logik genau dieses Problem erzeugt</h2>{paras([str(data["faults_intro"])])}</div>
        {card_grid(data["faults"])}
      </section>

      <section class="section">
        <div class="section-header"><p class="hero-kicker">WÖk-Logik</p><h2>Welche Steuerungslogik die Wirkungsökonomie verändert</h2>{paras(data["logic"])}</div>
        {card_grid(data["capabilities"])}
      </section>

      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Vorher / Nachher</p><h2>Alte Logik vs. WÖk-Logik</h2></div>
        {compare_table(data["compare"])}
      </section>

      <section class="section">
        <div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Wie diese Perspektive in der WÖk wirkt</h2><p>Der Pfad zeigt nicht nur Aktivität, sondern Rückkopplung: Wirkung wird sichtbar, bewertet und in Entscheidungen zurückgeführt.</p></div>
        {path(data["path"])}
      </section>

      <section class="section section-muted">
        <div class="card-grid">
          <article class="card"><p class="hero-kicker">Nichttrivialität</p><h3 class="card-title">Komplexe Systeme reagieren nicht linear.</h3><p class="card-text">Dieselbe Maßnahme kann je nach Kontext Wirkung erster, zweiter und dritter Ordnung erzeugen. Deshalb braucht die WÖk Evaluation, Quellenklarheit und lernende Korrektur.</p></article>
          <article class="card"><p class="hero-kicker">Wirkungsräume</p><h3 class="card-title">Wirkung entsteht in Räumen, nicht in Slogans.</h3><p class="card-text">Mensch, Planet und Demokratie bilden Bewertungsräume. In ihnen wird sichtbar, ob Zustände stabiler, verletzlicher, gerechter, riskanter oder regenerativer werden.</p></article>
          <article class="card"><p class="hero-kicker">Wirkungskapital</p><h3 class="card-title">Kapital bleibt Werkzeug.</h3><p class="card-text">Kapital entscheidet nicht allein, was wertvoll ist. Es wird danach gelesen, welche Richtung es verstärkt und ob es positive Netto-Wirkung ermöglicht.</p></article>
        </div>
      </section>

      <section class="section">
        <div class="example-box"><p class="hero-kicker">Konkretes Beispiel</p><h2>Wie die neue Logik sichtbar wird</h2>{paras([str(data["example"])])}</div>
      </section>

      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Was nicht passiert</p><h2>Die WÖk ist keine moralische Ersatzsteuerung</h2></div>
        {card_grid(data["not"])}
      </section>

      <section class="section">
        <div class="section-header"><p class="hero-kicker">Erste Schritte</p><h2>Was du konkret tun kannst</h2></div>
        {card_grid(data["steps"])}
      </section>

      <section class="section section-muted">
        <div class="compass-box"><p class="hero-kicker">Vertiefung</p><h2>Im WÖk-Kompass weiterdenken</h2><p>Die nächste Frage lautet nicht nach einzelnen Nachhaltigkeitsmaßnahmen. Sie lautet: Welche alte Logik erzeugt das Problem, und wie kann Wirkung rückgekoppelt werden?</p>{links(data["links"])}</div>
      </section>

      <section class="section">{source_panel(str(data["status"]), data.get("sources"))}</section>
"""


def render_hub() -> str:
    cards = "".join(
        f"""<a class="card target-card" href="{e(href)}">
          <h3 class="card-title">{e(title)}</h3>
          <dl>
            <div><dt>Fehlsteuerung</dt><dd>{e(problem)}</dd></div>
            <div><dt>WÖk-Verschiebung</dt><dd>{e(shift)}</dd></div>
            <div><dt>Neue Logik</dt><dd>{e(benefit)}</dd></div>
          </dl>
        </a>"""
        for href, title, problem, shift, benefit in HUB_CARDS
    )
    return f"""
      <section class="hero">
        <div>
          <p class="hero-kicker">Für wen · Systemische Übersetzung</p>
          <h1 class="hero-title">Was bedeutet die Wirkungsökonomie für mich?</h1>
          <p class="hero-subtitle">Die Zielgruppen-Seiten sind keine Marketingsegmente. Sie übersetzen dieselbe WÖk-Frage in unterschiedliche Wirkungsräume: Welche alte Steuerungslogik erzeugt das Problem, und wie verändert Wirkung die Logik selbst?</p>
          <div class="why-formula"><strong>Nicht: Wer ist betroffen?</strong><span>Sondern: Welche Fehlsteuerung wird aus dieser Perspektive sichtbar?</span></div>
        </div>
      </section>
      <section class="section">
        <div class="why-block">
          <p class="hero-kicker">Warum diese Perspektiven wichtig sind</p>
          <h2>Die Wirkungsökonomie ist kein abstraktes Modell. Sie verändert Steuerungslogiken.</h2>
          <p>Unternehmen führen anders, Politik steuert anders, Bürger:innen lesen Preise anders, Kommunen priorisieren anders, Journalismus analysiert Öffentlichkeit anders und Kapital bewertet Risiko anders. Deshalb braucht jede Zielgruppe einen eigenen Einstieg.</p>
        </div>
      </section>
      <section class="section section-muted">
        <div class="section-header"><p class="hero-kicker">Zielgruppen</p><h2>Fehlsteuerung → WÖk-Verschiebung → neue Logik</h2></div>
        <div class="card-grid">{cards}</div>
      </section>
"""


def write_page(slug: str, title: str, description: str, body: str, tags: str, noindex: bool) -> None:
    content = shell(slug, title, description, body, tags, noindex)
    content = "\n".join(line.rstrip() for line in content.splitlines()) + "\n"
    (FUER / slug).write_text(content, encoding="utf-8")


def main() -> None:
    write_page(
        "index.html",
        "Was bedeutet die Wirkungsökonomie für mich?",
        "Zielgruppen-Hub der Wirkungsökonomie als systemische Übersetzung von Fehlsteuerung, Rückkopplung und neuer Logik.",
        render_hub(),
        "Zielgruppen, Unternehmen, Politik, Bürger:innen, Wohnen, Rente, Wirkungseinkommen, Journalismus, Investor:innen, Kommunen, Akademie",
        False,
    )
    for slug, data in PAGES.items():
        write_page(
            slug,
            str(data["title"]),
            str(data["meta"]),
            render_systemic_page(slug, data),
            str(data["tags"]),
            bool(data["noindex"]),
        )


if __name__ == "__main__":
    main()
