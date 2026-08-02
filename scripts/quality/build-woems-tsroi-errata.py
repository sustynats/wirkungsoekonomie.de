#!/usr/bin/env python3
"""Replace the two current WÖMS 2.0 pages that still described T-SROI as a multiplier.

The leading WÖMS PDF is also the source for its public online reader.  Replacing
the complete page contents - rather than painting a notice over the old text -
keeps PDF search, accessibility extraction and the regenerated reader aligned
with the current T-SROI v1.1 standard.  Page objects and therefore existing
outline destinations remain stable.
"""

from __future__ import annotations

import argparse
from io import BytesIO
from pathlib import Path
import os
import tempfile

from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_INPUT = ROOT / "assets/downloads/grundlagen/woems-2.0-referenzfassung.pdf"
MARKER_KEY = "/WOEKMethodRevision"
MARKER_VALUE = "2026-08-02-woems-t-sroi-rechenstandard-v1-1"
PAGE_NUMBERS = (100, 375)
RETIRED_SNIPPETS = (
    "Transformationsmultiplikatoren",
    "Ist der Multiplikator empirisch",
)
CURRENT_SNIPPETS = (
    "belegter transformativer Nettonutzen",
    "Schutz-Gate",
    "Der Schaden wird nie mitgekürzt.",
    "T-SROI-Auswertung mit direkten",
)


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "header": ParagraphStyle("header", parent=base["Normal"], fontName="Helvetica", fontSize=7.7, leading=9.4, textColor=colors.HexColor("#28536a")),
        "title": ParagraphStyle("title", parent=base["Heading1"], fontName="Helvetica-Bold", fontSize=14, leading=16.5, textColor=colors.HexColor("#0d5578"), spaceAfter=3),
        "kicker": ParagraphStyle("kicker", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=10.5, textColor=colors.HexColor("#355f73"), spaceAfter=8),
        "body": ParagraphStyle("body", parent=base["Normal"], fontName="Helvetica", fontSize=8.7, leading=11.2, spaceAfter=5),
        "small": ParagraphStyle("small", parent=base["Normal"], fontName="Helvetica", fontSize=7.7, leading=9.4, spaceAfter=3),
        "label": ParagraphStyle("label", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=7.6, leading=9.2),
        "table_head": ParagraphStyle("table_head", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=6.3, leading=7.3),
        "table": ParagraphStyle("table", parent=base["Normal"], fontName="Helvetica", fontSize=6.2, leading=7.3),
        "formula": ParagraphStyle("formula", parent=base["Code"], fontName="Courier", fontSize=6.6, leading=8.1),
    }


def paragraph(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text, style)


def footer(page_number: int):
    def draw(canvas, _doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#bed0d8"))
        canvas.line(25 * mm, 18 * mm, A4[0] - 25 * mm, 18 * mm)
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(colors.HexColor("#28536a"))
        canvas.drawString(25 * mm, 13.5 * mm, "WÖMS 2.0 · Wirkungsökonomisches Methodensystem · aktuelle T-SROI-Einordnung v1.1")
        canvas.drawRightString(A4[0] - 25 * mm, 13.5 * mm, f"Seite {page_number}")
        canvas.restoreState()
    return draw


def make_doc(story: list, page_number: int) -> object:
    packet = BytesIO()
    doc = SimpleDocTemplate(
        packet,
        pagesize=A4,
        leftMargin=25 * mm,
        rightMargin=25 * mm,
        topMargin=20 * mm,
        bottomMargin=24 * mm,
        title="Das Wirkungsökonomische Methodensystem - T-SROI-Rechenstandard v1.1",
        author="Natalie Weber",
    )
    doc.build(story, onFirstPage=footer(page_number))
    packet.seek(0)
    rendered = PdfReader(packet)
    if len(rendered.pages) != 1:
        raise RuntimeError(f"Ersatzseite {page_number} ist unerwartet auf {len(rendered.pages)} Seiten umgebrochen.")
    return rendered.pages[0]


def method_page(s: dict[str, ParagraphStyle]) -> list:
    facts = [
        ("Verbindlicher Output", "T-SROI-Auswertung mit direkten und separat belegten transformativen Nutzen- und Schadenströmen, Ressourcen, Preisbasis, Zurechnung, Diskontierung, Schutz-Gate und Sensitivität."),
        ("Geeignet", "Für Investitionen, Programme, Infrastrukturen und Portfolios, wenn alle Geldströme in einer gemeinsamen Preisbasis dokumentiert werden können."),
        ("Nicht geeignet", "Nicht zur Scheingenauigkeit, Personenbewertung, automatischen Tarifentscheidung oder Kompensation schwerer Schäden."),
        ("Dauer / Beteiligte", "90–150 Minuten für die Erststrukturierung; fachlich zuständige Personen, Betroffene und Datenverantwortliche einbeziehen."),
        ("Benötigte Eingaben", "Wirkpfad, Systemgrenze, Vergleichsfall, direkte Nutzen und Schäden, Investition und Folgekosten, Preisbasis, Evidenz- und Unsicherheitsangaben."),
        ("Schnittstellen", "Vorgänger: C10 Transformationswirkungs-Logik und D08 NWI. Nachfolger: E05 Transformationsportfolio, E07 Wirkungskapital- und Investitionsgate, F14 Skalierung/Exit."),
    ]
    rows = [[paragraph(label, s["label"]), paragraph(value, s["small"])] for label, value in facts]
    fact_table = Table(rows, colWidths=[105, 365])
    fact_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, colors.HexColor("#d0d9dc")),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
    ]))
    formula = Table([[paragraph(
        escape("T-SROI = Σ[t=1..T](((B_direkt,t + B_transformativ,t) · a_t · (1-d_t) · (1-v_t) - S_t)/(1+r)^t) / Σ[t=0..T]((I_t + K_t)/(1+r_K)^t)"),
        s["formula"],
    )]], colWidths=[470])
    formula.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f2f6f7")),
        ("BOX", (0, 0), (-1, -1), 0.35, colors.HexColor("#9ab3bd")),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return [
        paragraph("WÖMS 2.0 · Messung, Bewertung und Evidenz", s["header"]),
        paragraph("D09 · T-SROI – Transformational Social Return on Investment", s["title"]),
        paragraph("Transformationskennzahl · Bewerten · aktuelle Rechenfassung v1.1 · WÖK-Q-1024", s["kicker"]),
        paragraph(
            "Der T-SROI ist ein Euro-zu-Euro-Verhältnis. Er setzt den Barwert kausal zurechenbarer direkter und separat belegter transformativer Nettonutzen zum Barwert der eingesetzten Ressourcen in Beziehung. Er ergänzt den IOI um einen Nutzenstrom - er multipliziert keine Wirkung.",
            s["body"],
        ),
        fact_table,
        Spacer(1, 6),
        paragraph("Arbeitsformel", s["label"]),
        formula,
        Spacer(1, 5),
        paragraph("Vorgehen", s["label"]),
        paragraph(
            "1. Schutz-Gate, Systemgrenze, Empfängerkreis und Zurechnung prüfen.  2. Investition I, Folgekosten K, direkten Nutzen B_direkt und Schaden S in Euro derselben Preisbasis erfassen.  3. Transformative Nutzen B_transformativ nur mit eigenem Wirkpfad, Vergleichsfall und Preisnachweis aufnehmen.  4. Attribution a, Deadweight d und Verdrängung v nur auf den beanspruchten Nutzen anwenden.  5. Diskontierung, Unsicherheit und die konservative Untergrenze dokumentieren.  6. Entscheidung, Auflagen und Lernschleife festhalten.",
            s["small"],
        ),
        paragraph("Prüffragen", s["label"]),
        paragraph(
            "- Welcher eigenständige Wirkpfad belegt den transformativen Nutzen?  - Welche Schäden und Grenzen bleiben getrennt sichtbar?  - Ist bei Unsicherheit die Untergrenze noch positiv? Der Schaden wird nie mitgekürzt.  - Falls das Schutz-Gate geschlossen ist: blockiert oder nicht bewertbar statt positiver Kennzahl.",
            s["small"],
        ),
        paragraph("Kurzbeispiel zum Nachrechnen", s["label"]),
        paragraph(
            "Bei offenem Gate entstehen im ersten Jahr 100 EUR direkter Nutzen, 25 EUR separat belegter Transformationsnutzen und 60 EUR Schaden. Bei 5 Prozent Diskontsatz und 50 EUR Investition heute (t=0) ergibt sich (100 + 25 - 60) / 1,05 / 50 = 1,24 EUR/EUR. Mit 20 Prozent Unsicherheitsabschlag auf den Nutzen beträgt die konservative Untergrenze ((100 + 25) · 0,8 - 60) / 1,05 = 38,10 EUR. Der Schaden bleibt dabei 60 EUR.",
            s["small"],
        ),
    ]


def compact_methods_page(s: dict[str, ParagraphStyle]) -> list:
    rows = [
        ("C07", "Nebenwirkungs-, Wechselwirkungs- und Rebound-Analyse", "Wirkungsmodellierung und Zukunftslogik", "Risiko- und Folgemethode", "Nebenwirkungsregister mit Wirkpfad, Betroffenen, Schwere, Frühwarnsignal, Gegenmaßnahme und Restunsicherheit."),
        ("C08", "Wirkungsszenarien und Zukunftsbilder", "Wirkungsmodellierung und Zukunftslogik", "Foresight-Methode", "Drei bis fünf plausible Szenarien mit Treibern, Wirkungszuständen, Kipppunkten, Signalen und strategischen Implikationen."),
        ("C09", "Wirkungsresilienz-Pfade", "Wirkungsmodellierung und Zukunftslogik", "Resilienzdesign", "Resilienzarchitektur aus kritischen Funktionen, Redundanz, Diversität, Puffern, Anpassung, Wiederherstellung und Lernen."),
        ("C10", "Transformationswirkungs-Logik", "Wirkungsmodellierung und Zukunftslogik", "Systemveränderungsmodell", "Transformationsmodell mit Hebel, Diffusion, Standardsetzung, Pfadveränderung, Resilienzgewinn und Risiken."),
        ("D01", "Referenzrahmen- und Standardmapping", "Messung, Bewertung und Evidenz", "Mapping / Compliance", "Referenzmatrix mit Ziel, Standard, Indikator, Datenquelle, Verbindlichkeit und Lücke."),
        ("D02", "Wirkungsrelevanz- und Materialitätsanalyse", "Messung, Bewertung und Evidenz", "Priorisierungsmethode", "Priorisierte IRO- und Wirkungslandkarte mit Schwere, Reichweite, Unabänderlichkeit, Wahrscheinlichkeit, Betroffenen und finanzieller Rückwirkung."),
        ("D03", "WÖk-Indikatorenarchitektur", "Messung, Bewertung und Evidenz", "Messdesign", "Indikatorenbaum mit Definition, Einheit, Referenzwert, Quelle, Frequenz, Empfängern, Verantwortlichen und WÖk-ID."),
        ("D04", "KII-Design – Key Impact Indicators", "Messung, Bewertung und Evidenz", "Managementkennzahlen", "KII-Set mit Zielwerten, Schwellen, Verantwortlichen, Gate-Verknüpfung und Eskalationsregeln."),
        ("D05", "Wirkungsdaten-Inventur und Datenflusskarte", "Messung, Bewertung und Evidenz", "Datenarchitektur", "Datenkatalog und Flusskarte mit Datenlücken, Eigentum, Qualität, Zugriff, Automatisierung und Schutz."),
        ("D06", "Datenqualitäts- und Evidenzmatrix", "Messung, Bewertung und Evidenz", "Qualitätssicherung", "Qualitätsprofil je Indikator samt Freigabestufe, konservativer Behandlung und Verbesserungsplan."),
        ("D07", "Wirkungsscorecard und FinalScore", "Messung, Bewertung und Evidenz", "Bewertungsinstrument", "Scorecard je Wirkungsobjekt mit Einzelwerten, Benchmarks, Datenqualität, Mindestbedingungen und FinalScore."),
        ("D08", "Netto-Wirkungs-Index (NWI)", "Messung, Bewertung und Evidenz", "Aggregierte operative Wirkung", "NWI mit Wirkungsprofil, Spannbreite, Grenzprüfung und Entscheidungsinterpretation."),
        ("D09", "T-SROI – Transformational Social Return on Investment", "Messung, Bewertung und Evidenz", "Transformationskennzahl", "T-SROI-Auswertung mit direkten und separat belegten transformativen Nutzen- und Schadenströmen, Ressourcen, Preisbasis, Zurechnung, Diskontierung, Schutz-Gate und Sensitivität."),
        ("D10", "Wirkungsrisiko-Matrix", "Messung, Bewertung und Evidenz", "Risikomanagement", "Risikoregister mit Prävention, Owner, Frühwarnsignal, Restwirkung und Eskalationsstufe."),
    ]
    data = [[paragraph(label, s["table_head"]) for label in ("Code", "Methode", "Kategorie", "Typ", "Kernoutput")]]
    data.extend([[paragraph(value, s["table"]) for value in row] for row in rows])
    table = Table(data, colWidths=[27, 104, 108, 83, 148], repeatRows=1)
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e9f0f2")),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.HexColor("#6d8996")),
        ("LINEBELOW", (0, 1), (-1, -1), 0.2, colors.HexColor("#d1dbde")),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 2.1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.1),
    ]))
    return [
        paragraph("WÖMS 2.0 · Anhang A", s["header"]),
        paragraph("Tabelle 21: Alle Kernmethoden (Fortsetzung)", s["title"]),
        table,
    ]


def replace_page_contents(writer: PdfWriter, page_number: int, replacement) -> None:
    target = writer.pages[page_number - 1]
    parent = target.get("/Parent")
    cloned = replacement.clone(writer, force_duplicate=True)
    target.clear()
    target.update(cloned)
    if parent is not None:
        target[NameObject("/Parent")] = parent


def revision_marker(reader: PdfReader) -> str:
    return str((reader.metadata or {}).get(MARKER_KEY, ""))


def replacement_text(reader: PdfReader) -> str:
    return "\n".join((reader.pages[number - 1].extract_text() or "") for number in PAGE_NUMBERS)


def validate(reader: PdfReader) -> None:
    if len(reader.pages) < max(PAGE_NUMBERS):
        raise RuntimeError("WÖMS-PDF enthält die erwarteten T-SROI-Seiten nicht.")
    if revision_marker(reader) != MARKER_VALUE:
        raise RuntimeError("WÖMS-PDF trägt den Revisionsmarker für den T-SROI-Rechenstandard v1.1 nicht.")
    text = replacement_text(reader)
    for snippet in CURRENT_SNIPPETS:
        if snippet not in text:
            raise RuntimeError(f"Aktuelle WÖMS-T-SROI-Korrektur fehlt: {snippet}")
    for snippet in RETIRED_SNIPPETS:
        if snippet in text:
            raise RuntimeError(f"Überholte WÖMS-T-SROI-Multiplikatorlogik ist weiter auslesbar: {snippet}")


def apply(input_path: Path, output_path: Path, force: bool = False) -> None:
    source = PdfReader(str(input_path))
    if len(source.pages) < max(PAGE_NUMBERS):
        raise RuntimeError("WÖMS-PDF enthält die erwarteten T-SROI-Seiten nicht.")
    already_current = revision_marker(source) == MARKER_VALUE
    if already_current and not force:
        if input_path.resolve() != output_path.resolve():
            output_path.write_bytes(input_path.read_bytes())
        validate(PdfReader(str(output_path)))
        print("WÖMS-PDF enthält bereits die geprüfte T-SROI-Korrektur.")
        return
    old_text = replacement_text(source)
    if not already_current and not any(snippet in old_text for snippet in RETIRED_SNIPPETS):
        raise RuntimeError("Die erwartete überholte WÖMS-T-SROI-Formulierung wurde nicht gefunden; keine unsichere PDF-Änderung durchgeführt.")

    s = styles()
    replacements = {
        100: make_doc(method_page(s), 100),
        375: make_doc(compact_methods_page(s), 375),
    }
    writer = PdfWriter(clone_from=str(input_path))
    for page_number, replacement in replacements.items():
        replace_page_contents(writer, page_number, replacement)
    writer.add_metadata({
        "/Title": "Das Wirkungsökonomische Methodensystem (WÖMS 2.0)",
        "/Author": "Natalie Weber",
        "/Subject": "Aktuelle T-SROI-Rechenstandard-Einordnung v1.1",
        MARKER_KEY: MARKER_VALUE,
    })
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(prefix="woems-t-sroi-", suffix=".pdf", dir=output_path.parent, delete=False) as handle:
        temporary = Path(handle.name)
        writer.write(handle)
    try:
        validate(PdfReader(str(temporary)))
        os.replace(temporary, output_path)
    finally:
        if temporary.exists():
            temporary.unlink()
    print(f"WÖMS-PDF mit T-SROI-Rechenstandard v1.1 aktualisiert: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    output = args.output or args.input
    if args.check:
        validate(PdfReader(str(args.input)))
        print("WÖMS-PDF: T-SROI-Rechenstandard v1.1 geprüft.")
        return
    apply(args.input, output, force=args.force)


if __name__ == "__main__":
    main()
