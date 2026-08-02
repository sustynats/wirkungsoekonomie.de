#!/usr/bin/env python3
"""Keep current capital PDFs on the auditable T-SROI v1.1 standard.

Three current detail-concept PDFs and the public capital-tool specification used
the retired multiplier wording.  Their original office/browser exports have no
reproducible source build in this repository.  This script therefore replaces
only the affected page objects with complete, accessible pages.  It preserves
page numbers, existing PDF destinations and all unaffected pages.  A revision
marker makes the operation idempotent and the check mode rejects the retired
phrases as well as incomplete corrections.
"""

from __future__ import annotations

import argparse
from io import BytesIO
import os
from pathlib import Path
import tempfile
from typing import Callable
from xml.sax.saxutils import escape

from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[2]
MARKER_KEY = "/WOEKCurrentCapitalTsroiRevision"
MARKER_VALUE = "2026-08-02-current-capital-t-sroi-v1-1"
CONTENT_WIDTH = letter[0] - 2 * 25 * mm

RETIRED_SNIPPETS = (
    "Transformationsmultiplikator",
    "T-SROI-light",
    "mit Multiplikator",
    "WÖk-Produktionsprozess",
    "Markdown-Quellen werden nicht",
    "file:///var/folders",
)


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "header": ParagraphStyle(
            "header",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.8,
            leading=9.2,
            textColor=colors.HexColor("#287b61"),
            spaceAfter=4,
        ),
        "kicker": ParagraphStyle(
            "kicker",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.6,
            leading=9.2,
            textColor=colors.HexColor("#337864"),
            spaceAfter=4,
        ),
        "title": ParagraphStyle(
            "title",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=21.5,
            textColor=colors.HexColor("#11182d"),
            spaceBefore=4,
            spaceAfter=7,
        ),
        "tool_title": ParagraphStyle(
            "tool_title",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=21,
            leading=24,
            textColor=colors.HexColor("#11182d"),
            spaceBefore=8,
            spaceAfter=9,
        ),
        "heading": ParagraphStyle(
            "heading",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13.8,
            leading=16.4,
            textColor=colors.HexColor("#11182d"),
            spaceBefore=8,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.9,
            leading=11.0,
            textColor=colors.HexColor("#252a31"),
            spaceAfter=4.2,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7.55,
            leading=9.15,
            textColor=colors.HexColor("#252a31"),
            spaceAfter=2.4,
        ),
        "table": ParagraphStyle(
            "table",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=6.65,
            leading=7.8,
            textColor=colors.HexColor("#23272d"),
        ),
        "table_head": ParagraphStyle(
            "table_head",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=6.6,
            leading=7.7,
            textColor=colors.white,
        ),
        "formula": ParagraphStyle(
            "formula",
            parent=base["Code"],
            fontName="Courier",
            fontSize=6.35,
            leading=7.7,
            textColor=colors.HexColor("#18212d"),
        ),
        "callout_title": ParagraphStyle(
            "callout_title",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.4,
            leading=8.7,
            textColor=colors.HexColor("#175b48"),
        ),
        "callout_body": ParagraphStyle(
            "callout_body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7.25,
            leading=8.75,
            textColor=colors.HexColor("#202830"),
        ),
    }


S = styles()


def para(text: str, style: str = "body") -> Paragraph:
    return Paragraph(escape(text).replace("\n", "<br/>"), S[style])


def table(rows: list[list[str]], widths: list[float], *, header: bool = True, font: str = "table") -> Table:
    data: list[list[Paragraph]] = []
    for row_index, row in enumerate(rows):
        style = "table_head" if header and row_index == 0 else font
        data.append([para(cell, style) for cell in row])
    result = Table(data, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    commands: list[tuple] = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.32, colors.HexColor("#253142")),
        ("LEFTPADDING", (0, 0), (-1, -1), 4.1),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4.1),
        ("TOPPADDING", (0, 0), (-1, -1), 2.35),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.35),
    ]
    if header:
        commands.extend(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#101829")),
                ("LINEBELOW", (0, 0), (-1, 0), 0.55, colors.HexColor("#101829")),
            ]
        )
    result.setStyle(TableStyle(commands))
    return result


def callout(title: str, body: str, *, formula: str | None = None) -> Table:
    cells: list[Paragraph] = [para(title, "callout_title"), para(body, "callout_body")]
    if formula:
        cells.append(para(formula, "formula"))
    result = Table([[cells]], colWidths=[CONTENT_WIDTH], hAlign="LEFT")
    result.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#edf5f1")),
                ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#70a88f")),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return result


def footer(label: str, page_number: int) -> Callable:
    def draw(canvas, _doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#bfd4cb"))
        canvas.line(25 * mm, 16 * mm, letter[0] - 25 * mm, 16 * mm)
        canvas.setFillColor(colors.HexColor("#376c5a"))
        canvas.setFont("Helvetica", 7)
        canvas.drawString(25 * mm, 10.5 * mm, f"Wirkungsökonomie · {label} · aktuelle T-SROI-Einordnung v1.1")
        canvas.drawRightString(letter[0] - 25 * mm, 10.5 * mm, f"Seite {page_number}")
        canvas.restoreState()

    return draw


def render_page(story: list, label: str, page_number: int) -> object:
    stream = BytesIO()
    document = SimpleDocTemplate(
        stream,
        pagesize=letter,
        leftMargin=25 * mm,
        rightMargin=25 * mm,
        topMargin=18 * mm,
        bottomMargin=23 * mm,
        title=label,
        author="Natalie Weber",
    )
    document.build(story, onFirstPage=footer(label, page_number))
    stream.seek(0)
    reader = PdfReader(stream)
    if len(reader.pages) != 1:
        raise RuntimeError(f"Ersatzseite {page_number} von {label} ist auf {len(reader.pages)} Seiten umgebrochen.")
    return reader.pages[0]


def detail_08_page() -> object:
    story = [
        para("Wirkungsökonomie · Natalie Weber", "header"),
        para("8. Versicherungen: Versicherbarkeit als Wirklichkeitsprüfung", "title"),
        para(
            "Versicherungen sind reale Frühwarnsysteme. Steigen physische Schäden, Haftungs-, Cyber- oder Lieferkettenrisiken, verändern sich Prämien, Ausschlüsse, Selbstbehalte und Deckungsbedingungen. Versicherbarkeit ist damit kein moralisches Urteil, sondern ein prüfbares Signal über reale Gefahren.",
        ),
        para(
            "Für Unternehmen wird sie zur Wirklichkeitsprüfung: Ein Standort ohne Klimaanpassung, eine fragile Lieferkette oder ein toxisches Produktportfolio kann wirtschaftlich sichtbar werden, bevor Regulierung greift. Die WÖk nutzt diese Daten als Rückkopplung und nicht als Bestrafung.",
        ),
        para("9. Kapitalmarkt, ESG-Ratings und WÖk-Korrektur", "heading"),
        para(
            "ESG-Ratings können unterschiedliche Methodiken, Datenquellen und Gewichtungen nutzen. Die WÖk verhindert, dass gute Einzelwerte schwere Schäden verdecken: Risiko, Wirkung, Transformationsfähigkeit und Datenqualität bleiben unterscheidbar; rote Linien werden nicht verrechnet.",
        ),
        table(
            [
                ["Bewertungsebene", "Frage", "WÖk-Kennzahl / Instrument"],
                ["Wirkung heute", "Welche Zustandsveränderungen entstehen aktuell?", "NWI, Scorecards, WÖk-ID-Register"],
                ["Rote Linien", "Welche Schäden sind nicht kompensierbar?", "Reverse Merit Order, Wirkungsgrenzen"],
                ["Transformation", "Verändert das Unternehmen Pfade, Standards oder Märkte?", "T-SROI v1.1: belegte Nutzenströme, Schutz-Gate und Evidenzprüfung"],
                ["Datenqualität", "Wie belastbar, aktuell und auditierbar sind Daten?", "Datenqualitätsstufe, Assurance-Status"],
                ["Kapitalwirkung", "Welche Wirkung erzeugen Kapitalflüsse?", "Portfolio-Wirkungsrating, Wirkungskreditprüfung"],
            ],
            [170, 170, CONTENT_WIDTH - 340],
        ),
        Spacer(1, 5),
        callout(
            "T-SROI v1.1: Transformationswirkung wird nicht hochmultipliziert.",
            "Eine T-SROI-Zahl ist nur bei offenem Schutz-Gate zulässig. Direkter und separat belegter transformativer Nutzen werden in derselben Preisbasis erfasst, Schäden vollständig abgezogen und Ressourcen diskontiert. Zurechnung, Deadweight und Verdrängung mindern nur den beanspruchten Nutzen. Der Schaden wird nie mitgekürzt.",
            formula="T-SROI = PV(direkter Nutzen + belegter transformativer Nutzen - Schaden) / PV(Ressourcen)",
        ),
        Spacer(1, 4),
        para("10. Stranded Assets: alte und neue Formen", "heading"),
        para(
            "Stranded Assets verlieren wirtschaftlichen Wert, wenn sie regulatorisch, technologisch, gesellschaftlich, ökologisch oder versicherungsbezogen nicht mehr tragfähig sind. Die Prüfung umfasst deshalb Klima-, Ressourcen-, Sozial-, Digital-, Reputations- und Demokratie-Stranding sowie die Belastbarkeit der zugrunde liegenden Daten.",
        ),
    ]
    return render_page(story, "Risikomanagement, Resilienz und Finanzmarktanforderungen", 6)


def detail_30_page() -> object:
    story = [
        para("WIRKUNGSÖKONOMIE · FINANZSYSTEM & KAPITAL", "header"),
        para("Akteursgruppen und Wirkungspflichten", "title"),
        para(
            "Kapitalwirkung ordnet Kapitalflüsse, Institutionen und Rahmenbedingungen ein - nicht Menschen nach moralischer Haltung. Banken, Versicherungen, Fonds, Unternehmen, Staat und Bürger:innen behalten unterschiedliche Rollen, Rechte und Schutzinteressen.",
        ),
        table(
            [
                ["Akteur", "Kernaufgabe", "WÖk-Anschluss"],
                ["Banken und Versicherungen", "Risiken, Prävention und Zukunftsfähigkeit transparent machen", "Wirkungskredit, Versicherbarkeits-Check, Portfolio-Wirkungsrating"],
                ["Fonds und Unternehmen", "Kapital an nachvollziehbare Wirkpfade und Grenzen binden", "NWI, T-SROI v1.1, Scorecards, Wirkungsfonds"],
                ["Staat und Öffentlichkeit", "Zweck, Rechtsschutz, Transparenz und Korrektur sichern", "Wirkungshaushalt, rote Linien, demokratische Kontrolle"],
            ],
            [115, 190, CONTENT_WIDTH - 305],
        ),
        Spacer(1, 5),
        callout(
            "Keine Planwirtschaft.",
            "Die Wirkungsökonomie ersetzt Marktentscheidungen nicht durch zentrale Befehle. Sie verbessert Informations- und Anreizlage, damit Risiken, externe Schäden und Grenzen nicht unsichtbar bleiben.",
        ),
        para("Mechanik: Vom Kapitalfluss zur Wirkungsbewertung", "heading"),
        para(
            "Zuerst wird der Kapitalfluss einem Wirkungsträger zugeordnet. Danach werden Wirkpfade, Risiken, Daten und Rückkopplungen geprüft. Erst wenn die Schutzbedingungen erfüllt sind, darf eine Kennzahl die Entscheidung unterstützen.",
        ),
        table(
            [
                ["Schritt", "Frage", "Instrument"],
                ["1. Zuordnung", "Wohin fließt Kapital konkret?", "WÖk-ID, NACE, Projekt- oder Fonds-ID"],
                ["2. Wirkungsfeld", "Welche SDG- und SDG+-Räume sind betroffen?", "Mapping, Scorecard"],
                ["3. Datenqualität", "Welche Daten sind verfügbar und prüfbar?", "CSRD/ESRS, Taxonomie, Audit"],
                ["4. Risiko", "Welche negativen Wirkungsrisiken bestehen?", "Reverse Merit Order, rote Linien"],
                ["5. Netto-Wirkung", "Welche positive Netto-Wirkung bleibt?", "NWI, Portfolio-Wirkungsprofil"],
                ["6. Transformation", "Verändert der Kapitalfluss Pfade oder nur Symptome?", "T-SROI v1.1: Nutzenströme, Schäden, Schutz-Gate"],
                ["7. Rückkopplung", "Wie wirkt das Ergebnis auf Zins, Steuer, Förderung oder Versicherung?", "Zuständige, rechtsgebundene Entscheidung"],
            ],
            [93, 210, CONTENT_WIDTH - 303],
        ),
        Spacer(1, 5),
        callout(
            "Prüfregel T-SROI v1.1",
            "Nur Euro-Nutzen- und Schadenströme derselben Preisbasis werden gerechnet. Datenqualität, Resilienz und Reichweite sind Evidenzangaben, keine Geldwertaufschläge. Bei 100 EUR direktem Nutzen, 25 EUR Transformationsnutzen, 60 EUR Schaden, 5 Prozent Diskontsatz und 50 EUR Ressourcen bei t=0 ergibt sich 1,24 EUR/EUR; bei 20 Prozent Nutzenunsicherheit 0,76 EUR/EUR.",
            formula="T-SROI = Summe[((B_direkt + B_transformativ) * a * (1-d) * (1-v) - S) / (1+r)^t] / Summe[(I + K)/(1+r_K)^t]",
        ),
    ]
    return render_page(story, "Kapital als Wirkungskraft und Kapitalwirkung", 3)


def detail_31_page() -> object:
    story = [
        para("WIRKUNGSÖKONOMIE · FINANZSYSTEM & KAPITAL", "header"),
        table(
            [
                ["Wirkungsfeld", "Indikator", "Rückkopplung"],
                ["Mensch", "Mietbelastung, Gesundheit, Barrierefreiheit", "sozialer Schutz und zugängliche Finanzierung"],
                ["Planet", "CO2, Energiebedarf, erneuerbare Wärme", "Förderquote und günstiger Kredit"],
                ["Demokratie", "Beteiligung, Transparenz, Verdrängungsschutz", "kommunaler Vorrang und öffentliche Akzeptanz"],
                ["Kapital", "Stranded-Asset-Risiko, Versicherbarkeit, Werterhalt", "bessere Konditionen und geringeres Risiko"],
            ],
            [150, 188, CONTENT_WIDTH - 338],
        ),
        Spacer(1, 6),
        para("Verhältnis zu Staat, Markt und Zivilgesellschaft", "heading"),
        para(
            "Wirkungsfonds sind hybride Instrumente. Sie zentralisieren keine Entscheidungen, sondern verbinden öffentlichen Auftrag, privates Kapital, zivilgesellschaftliche Expertise und demokratische Kontrolle. Staat, Wirkungsrat, Investor:innen und Betroffene haben unterscheidbare Aufgaben.",
        ),
        callout(
            "Demokratische Fondslogik.",
            "Ein Wirkungsfonds darf keine Schattenregierung werden. Er finanziert Wirkung innerhalb eines demokratisch beschlossenen Rahmens und bleibt öffentlich prüfbar, korrigierbar und rechtsgebunden.",
        ),
        para("Berechnungslogik: Wirkungsfonds-Simulator", "heading"),
        para(
            "Der Simulator macht Wirkpfade transparent, behauptet aber keine exakte Wahrheit. Er erfasst Mittelzufluss, Zielwirkung, Datenqualität, Wirkungsprofil, Schutz-Gate, belegte transformative Nutzenströme, Rückfluss und Unsicherheit. Reichweite, Resilienz und Skalierung sind keine Aufschlagsfaktoren.",
        ),
        table(
            [
                ["Parameter", "Beschreibung", "Beispiel"],
                ["Mittelzufluss", "Kapital, Steueranteil, Co-Investment oder Maluszahlung", "10 Mio. EUR Wohnfonds"],
                ["Zielwirkung", "konkretes Wirkungsziel im MPD-Rahmen", "Warmmietenbelastung senken, CO2 reduzieren"],
                ["NWI", "dimensionsgleicher Profilwert, nur bei offenem Schutz-Gate ausweisbar", "Profilwert +1,8; kritische Felder dokumentiert"],
                ["T-SROI", "diskontierter direkter und separat belegter transformativer Nettonutzen je Ressourceneuro", "nur bei Euro-Nutzen, Schäden und Ressourcen derselben Preisbasis"],
                ["Datenqualität", "Prüfgrad, Quellen und Unsicherheit", "B: geprüfte Primärdaten plus Schätzungen"],
                ["Unsicherheitsanalyse", "Rebound, Verdrängung, Governance", "Sensitivitätsintervall und konservative Untergrenze"],
            ],
            [104, 220, CONTENT_WIDTH - 324],
        ),
        Spacer(1, 5),
        callout(
            "T-SROI v1.1: getrennte Nutzen- und Schadenströme.",
            "a, d und v begrenzen nur den beanspruchten Nutzen; S bleibt vollständig abgezogen. Die konservative Untergrenze setzt Unsicherheit nur beim Nutzen an. Der Schaden wird nie mitgekürzt.",
            formula="T-SROI = Summe[((B_direkt + B_transformativ) * a * (1-d) * (1-v) - S) / (1+r)^t] / Summe[(I + K)/(1+r_K)^t]",
        ),
        para("Einzelfonds im Detail", "heading"),
        para("Jeder Fonds braucht eigene Zielgruppen, Datenquellen, Wirkungspfade, Rückflusslogiken und Schutzmechanismen. Die Dacharchitektur schafft dabei Standards und Korrekturwege, nicht eine Einheitsbewertung.", "small"),
    ]
    return render_page(story, "Wirkungsfonds als Dacharchitektur", 5)


def tool_page_one() -> object:
    story = [
        para("WIRKUNGSÖKONOMIE · PDF-FASSUNG", "header"),
        para("Tool-Spezifikation: Kapitalwirkungs- und Wirkungsfonds-Tool-Suite", "tool_title"),
        para("Natalie Weber · Wirkungsökonomie · Fassung v0.2 · T-SROI-Rechenstandard v1.1 · Stand 2. August 2026", "kicker"),
        para("Zweck", "heading"),
        para(
            "Die Tool-Suite macht Kapitalwirkung modellhaft sichtbar. Sie ist keine Anlageberatung, keine Kreditentscheidung, keine Steuerberatung und kein Versicherungsrating. Sie dient der strukturierten Reflexion von Wirkung, Risiko, Resilienz und Finanzierung.",
        ),
        para("Module", "heading"),
        table(
            [
                ["Modul", "Aufgabe"],
                ["1. Kapitalwirkungscheck", "Prüft, ob eine Kapitalentscheidung positive Netto-Wirkung ermöglicht oder negative Wirkung skaliert."],
                ["2. Portfolio-Wirkungsrisiko-Rechner", "Ordnet Portfolios nach NWI, T-SROI, Stranded-Asset-Risiko, Datenqualität und SDG+-/Governance-Risiken ein."],
                ["3. Fonds-T-SROI-Rechner", "Rechnet nur bei offenem Schutz-Gate mit dokumentierten direkten und separat belegten transformativen Nutzen- und Schadenströmen in EUR derselben Preisbasis."],
                ["4. Kreditwirkungsprüfung", "Ergänzt klassische Kreditprüfung um Wirkungsrisiko, Transformationspfad, Datenqualität und dokumentierte Resilienz."],
                ["5. Versicherbarkeits- und Resilienzcheck", "Prüft modellhaft, ob Prävention, Anpassung und Governance Versicherbarkeit und Resilienz verbessern."],
                ["6. Wirkungsfonds-Simulator", "Zeigt Einzahlungen, Fondslogik, Auszahlungen und Wirkungsnachweise verschiedener Fondsarten."],
                ["7. Steuer- und Fondsarchitektur-Modul", "Verknüpft Wirkungssteuern, Fondslogiken und Automatisierungsdividende als demokratisch gestaltbare Modelle."],
            ],
            [155, CONTENT_WIDTH - 155],
        ),
        Spacer(1, 6),
        callout(
            "Kernregel",
            "Es gibt keinen Rechenmultiplikator für Transformation, Resilienz, Reichweite oder Datenqualität. Diese Angaben begründen oder begrenzen einen Wirkpfad; sie erhöhen keinen Geldwert von selbst.",
        ),
    ]
    return render_page(story, "Kapitalwirkungs- und Wirkungsfonds-Tool-Suite", 1)


def tool_page_two() -> object:
    story = [
        para("WIRKUNGSÖKONOMIE · KAPITALWIRKUNGS- UND WIRKUNGSFONDS-TOOL-SUITE", "header"),
        para("Eingaben und modellhafte Ergebnisgrößen", "title"),
        table(
            [
                ["Eingabe", "Erforderliche Dokumentation"],
                ["Akteur und Kapitalart", "Bank, Versicherung, Fonds, Unternehmen, Kommune oder Bürger:in; Kredit, Eigenkapital, Anleihe, Garantie, Fonds, Steuer oder Zuschuss."],
                ["Wirkungsobjekt", "Wirkungsfeld, WÖk-IDs, SDG-/SDG+-Zuordnung, Systemgrenze, Vergleichsfall und betroffene Gruppen."],
                ["Ressourcen", "Investition I, Folgekosten K, Zeitraum und Diskontsätze in derselben Preisbasis."],
                ["Nutzen und Schäden", "Direkter Nutzen, separat belegter transformativer Nutzen sowie Schäden S mit Quelle, Einheit und Zurechnung."],
                ["Evidenz und Unsicherheit", "Datenqualität, Auditpfad, Attribution, Deadweight, Verdrängung, Rebound und Sensitivität."],
            ],
            [130, CONTENT_WIDTH - 130],
        ),
        Spacer(1, 7),
        para("Ergebnisgrößen", "heading"),
        table(
            [
                ["Ergebnis", "Bedeutung"],
                ["Kapitalwirkungsprofil", "Profil aus Wirkung, Risiko, Datenqualität und Wirkpfad; keine Personenbewertung."],
                ["NWI", "Nur bei offenem Schutz-Gate: dimensionsgleicher operativer Netto-Wirkungswert."],
                ["T-SROI v1.1", "Nur bei vollständiger Euro-Bilanz: diskontierter Nettonutzen je Ressourceneuro."],
                ["Prüf- und Rückkopplungsstatus", "Schutz-Gate, Evidenzstatus, Stranded-Asset-Risiko und mögliche institutionelle Rückkopplung."],
            ],
            [130, CONTENT_WIDTH - 130],
        ),
        Spacer(1, 7),
        para("T-SROI-Rechenregel v1.1", "heading"),
        callout(
            "Nur nach offenem Schutz-Gate rechnen.",
            "a_t, d_t und v_t begrenzen ausschließlich den beanspruchten Nutzen. I_0 liegt bei t=0. Alle Größen müssen in EUR derselben Preisbasis dokumentiert sein; r und r_K sind offengelegte Diskontsätze.",
            formula="T-SROI = Summe_t=1..T [((B_direkt,t + B_transformativ,t) * a_t * (1-d_t) * (1-v_t) - S_t)/(1+r)^t] / Summe_t=0..T [(I_t + K_t)/(1+r_K)^t]",
        ),
        Spacer(1, 6),
        para("Konservative Untergrenze", "heading"),
        para("Unsicherheit u_t reduziert nur die beanspruchten Nutzen: PV_N^L = Summe_t [((B_direkt,t + B_transformativ,t) * (1-u_t) * a_t * (1-d_t) * (1-v_t) - S_t)/(1+r)^t]. Der Schaden wird nie mitgekürzt.", "small"),
    ]
    return render_page(story, "Kapitalwirkungs- und Wirkungsfonds-Tool-Suite", 2)


def tool_page_three() -> object:
    story = [
        para("WIRKUNGSÖKONOMIE · KAPITALWIRKUNGS- UND WIRKUNGSFONDS-TOOL-SUITE", "header"),
        para("Schutz-, Prüf- und Lernregeln", "title"),
        table(
            [
                ["Schutzlinie", "Konsequenz"],
                ["Keine Personenbewertung", "Bewertet werden Kapitalflüsse, Projekte, Portfolios und institutionelle Rahmenbedingungen, nicht Menschen."],
                ["Keine automatische Entscheidung", "Kein Ergebnis ersetzt eine rechtsgebundene Anlage-, Kredit-, Steuer-, Versicherungs- oder Förderentscheidung."],
                ["Nichtkompensation", "Schwere negative Wirkung und rote Linien werden nicht durch positive Einzelwerte, Rendite oder Datenqualität ausgeglichen."],
                ["Evidenz vor Kennzahl", "Fehlen Systemgrenze, Vergleichsfall, Preisbasis oder belastbare Nutzenströme, lautet das Ergebnis blockiert oder nicht bewertbar."],
                ["Korrektur und Rechtsschutz", "Annahmen, Quellen, Berechnung, Beschwerdeweg und Update-Zyklus werden nachvollziehbar dokumentiert."],
            ],
            [135, CONTENT_WIDTH - 135],
        ),
        Spacer(1, 8),
        para("Nachrechenbares Beispiel", "heading"),
        para(
            "Bei offenem Schutz-Gate entstehen im ersten Jahr 100 EUR direkter Nutzen, 25 EUR separat belegter Transformationsnutzen und 60 EUR Schaden. Bei fünf Prozent Diskontsatz und 50 EUR Investition bei t=0 gilt: (100 + 25 - 60) / 1,05 / 50 = 1,24 EUR/EUR. Bei 20 Prozent Unsicherheit auf Nutzen beträgt die Untergrenze (125 * 0,8 - 60) / 1,05 / 50 = 0,76 EUR/EUR. Der Schaden bleibt 60 EUR.",
        ),
        callout(
            "Interpretation",
            "Das Ergebnis ist eine transparente Entscheidungsvorlage, keine moralische Rangliste und keine Garantie. Ein positiver Wert ersetzt weder die Prüfung roter Linien noch die demokratische Abwägung von Zielkonflikten.",
        ),
        para("Quellen und aktuelle Fassung", "heading"),
        para(
            "Methodik: T-SROI-Rechenstandard v1.1, WÖK-Q-1024. Online: wirkungsoekonomie.de/werkzeuge/t-sroi/ und wirkungsoekonomie.de/quellenarchiv/wok-q-1024/. Diese öffentliche Lesefassung ist von technischen Produktions- und Repository-Hinweisen bereinigt.",
        ),
        para("Fassung v0.2 der Tool-Spezifikation · Stand 2. August 2026", "kicker"),
    ]
    return render_page(story, "Kapitalwirkungs- und Wirkungsfonds-Tool-Suite", 3)


PDFS = {
    "detail-08": {
        "path": ROOT / "assets/downloads/08_woek_wirtschaft_unternehmen_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0.pdf",
        "pages": {6: detail_08_page},
        "current": ("T-SROI v1.1", "Schutz-Gate", "Der Schaden wird nie mitgekürzt."),
        "legacy": ("Transformationsmultiplikator",),
    },
    "detail-30": {
        "path": ROOT / "assets/downloads/30_woek_finanzsystem_kapital_kapitalwirkung_statt_kapitalrendite_detailkonzept_v1_0.pdf",
        "pages": {3: detail_30_page},
        "current": ("T-SROI v1.1", "T-SROI = Summe", "1,24 EUR/EUR"),
        "legacy": ("Transformationsmultiplikator",),
    },
    "detail-31": {
        "path": ROOT / "assets/downloads/31_woek_finanzsystem_kapital_wirkungsfonds_dacharchitektur_detailkonzept_v1_0.pdf",
        "pages": {5: detail_31_page},
        "current": ("T-SROI v1.1", "Der Schaden wird nie mitgekürzt.", "Schutz-Gate"),
        "legacy": ("Transformationsmultiplikator",),
    },
    "tool-suite": {
        "path": ROOT / "assets/downloads/tool_spezifikation_kapitalwirkungs_und_wirkungsfonds_tool_suite.pdf",
        "pages": {1: tool_page_one, 2: tool_page_two, 3: tool_page_three},
        "current": ("T-SROI-Rechenregel v1.1", "Der Schaden wird nie mitgekürzt.", "WÖK-Q-1024"),
        "legacy": ("mit Multiplikator", "Transformationsmultiplikator", "WÖk-Produktionsprozess"),
    },
}


def page_text(reader: PdfReader, page_numbers: list[int]) -> str:
    return "\n".join((reader.pages[number - 1].extract_text() or "") for number in page_numbers)


def all_text(reader: PdfReader) -> str:
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def marker(reader: PdfReader) -> str:
    return str((reader.metadata or {}).get(MARKER_KEY, ""))


def validate(name: str, path: Path) -> None:
    spec = PDFS[name]
    reader = PdfReader(str(path))
    pages = sorted(spec["pages"])
    if len(reader.pages) < max(pages):
        raise RuntimeError(f"{name}: die erwarteten Korrekturseiten fehlen.")
    if marker(reader) != MARKER_VALUE:
        raise RuntimeError(f"{name}: Revisionsmarker fehlt oder ist nicht aktuell.")
    replacement = page_text(reader, pages)
    for phrase in spec["current"]:
        if phrase not in replacement:
            raise RuntimeError(f"{name}: aktuelle T-SROI-Angabe fehlt: {phrase}")
    text = all_text(reader)
    for phrase in RETIRED_SNIPPETS:
        if phrase in text:
            raise RuntimeError(f"{name}: überholter oder technischer Rest bleibt auslesbar: {phrase}")


def replace_page_contents(writer: PdfWriter, page_number: int, replacement) -> None:
    target = writer.pages[page_number - 1]
    parent = target.get("/Parent")
    clone = replacement.clone(writer, force_duplicate=True)
    target.clear()
    target.update(clone)
    if parent is not None:
        target[NameObject("/Parent")] = parent


def apply_one(name: str, *, force: bool = False) -> None:
    spec = PDFS[name]
    path: Path = spec["path"]
    if not path.exists():
        raise RuntimeError(f"{name}: PDF fehlt: {path}")
    source = PdfReader(str(path))
    if marker(source) == MARKER_VALUE and not force:
        validate(name, path)
        print(f"{name}: bereits aktuell.")
        return
    source_text = page_text(source, sorted(spec["pages"]))
    if not force and not any(phrase in source_text for phrase in spec["legacy"]):
        raise RuntimeError(f"{name}: erwartete überholte Formulierung nicht gefunden; keine unsichere PDF-Änderung durchgeführt.")
    writer = PdfWriter(clone_from=str(path))
    for page_number, page_builder in spec["pages"].items():
        replace_page_contents(writer, page_number, page_builder())
    writer.add_metadata({
        "/Author": "Natalie Weber",
        "/Subject": "Aktuelle T-SROI-Rechenstandard-Einordnung v1.1",
        MARKER_KEY: MARKER_VALUE,
    })
    with tempfile.NamedTemporaryFile(prefix=f"{name}-tsroi-", suffix=".pdf", dir=path.parent, delete=False) as handle:
        temporary = Path(handle.name)
        writer.write(handle)
    try:
        validate(name, temporary)
        os.replace(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()
    print(f"{name}: aktuelle T-SROI-Korrektur geschrieben.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="nur Marker, Inhalt und Resttexte prüfen")
    parser.add_argument("--force", action="store_true", help="aktuelle Ersatzseiten neu erzeugen")
    args = parser.parse_args()
    if args.check:
        for name, spec in PDFS.items():
            validate(name, spec["path"])
            print(f"{name}: geprüft.")
        return
    for name in PDFS:
        apply_one(name, force=args.force)


if __name__ == "__main__":
    main()
