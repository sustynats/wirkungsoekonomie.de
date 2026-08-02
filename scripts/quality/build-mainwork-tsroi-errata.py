#!/usr/bin/env python3
"""Replace the retired T-SROI formula pages in the current public main-work PDF.

The book remains a 1,250-page publication with stable page references.  Only
the two pages that carried the retired multiplier formula are replaced.  The
page objects keep their identity, so existing internal destinations continue
to point to pages 477 and 478.  The historical formula is not merely covered
visually: its page content is replaced, so text extraction and search no
longer return it as the current rule.
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
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_INPUT = ROOT / "assets/pdf/die-neue-ordnung-des-wohlstands.pdf"
MARKER_KEY = "/WOEKMethodRevision"
MARKER_VALUE = "2026-08-02-t-sroi-rechenstandard-v1-1"
PAGE_NUMBERS = (477, 478)
RETIRED_SNIPPETS = (
    "T-SROI = Transformationswirkung",
    "T-SROI = (T_struktur",
)
CURRENT_SNIPPETS = (
    "PV_N^L",
    "T-SROI = {sum(t=1..T)",
    "Der Schaden wird nie mitgekürzt.",
)


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "caption": ParagraphStyle(
            "caption", parent=base["Normal"], fontName="Helvetica", fontSize=9.8,
            leading=12, spaceAfter=5,
        ),
        "table_head": ParagraphStyle(
            "table_head", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=8.2,
            leading=9.8,
        ),
        "table": ParagraphStyle(
            "table", parent=base["Normal"], fontName="Helvetica", fontSize=8.1,
            leading=10.1,
        ),
        "heading": ParagraphStyle(
            "heading", parent=base["Heading2"], fontName="Helvetica", textColor=colors.HexColor("#0d5578"),
            fontSize=14.2, leading=17, spaceBefore=7, spaceAfter=7,
        ),
        "subheading": ParagraphStyle(
            "subheading", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=10.3,
            leading=13, spaceBefore=6, spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"], fontName="Helvetica", fontSize=9.7,
            leading=13.1, alignment=TA_LEFT, spaceAfter=7,
        ),
        "formula": ParagraphStyle(
            "formula", parent=base["Code"], fontName="Courier", fontSize=7.45,
            leading=9.25, spaceAfter=0,
        ),
        "fine": ParagraphStyle(
            "fine", parent=base["Normal"], fontName="Helvetica", fontSize=8.6,
            leading=11.2, spaceAfter=6,
        ),
    }


def paragraph(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text, style)


def formula_box(lines: list[str], s: dict[str, ParagraphStyle]) -> Table:
    content = "<br/>".join(escape(line) for line in lines)
    table = Table([[paragraph(content, s["formula"])]], colWidths=[475])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f3f6f7")),
        ("BOX", (0, 0), (-1, -1), 0.45, colors.HexColor("#95afb9")),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def draw_footer(page_number: int):
    def footer(canvas, _doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 9)
        canvas.setFillColor(colors.HexColor("#202020"))
        canvas.drawRightString(A4[0] - 30 * mm, 18 * mm, str(page_number))
        canvas.restoreState()
    return footer


def build_page_477(s: dict[str, ParagraphStyle]) -> list:
    comparison = [
        [paragraph("Kennzahl", s["table_head"]), paragraph("Leitfrage", s["table_head"]), paragraph("Funktion in der Wirkungsökonomie", s["table_head"])],
        [paragraph("ROI", s["table"]), paragraph("Rechnet es sich finanziell?", s["table"]), paragraph("Finanzielle Rendite. Wichtig für Tragfähigkeit, aber keine vollständige Wirkungsbewertung.", s["table"])],
        [paragraph("SROI", s["table"]), paragraph("Welcher gesellschaftliche Nutzen wird monetarisiert?", s["table"]), paragraph("Monetarisierte soziale oder ökologische Folgen. Systemgrenze, Schäden und Doppelzählungen bleiben prüfpflichtig.", s["table"])],
        [paragraph("NWI", s["table"]), paragraph("Wie ist das dokumentierte Wirkungsprofil einzuordnen?", s["table"]), paragraph("Nichtmonetäres Profil mit Schutz-Gate. Es ist kein Eurowert und keine Personenbewertung.", s["table"])],
        [paragraph("IOI", s["table"]), paragraph("Wie viel direkter Nettonutzen in Euro entsteht je Ressourceneuro?", s["table"]), paragraph("Geldrechnung für direkte, kausal begrenzte Nutzen- und Schadenströme.", s["table"])],
        [paragraph("T-SROI", s["table"]), paragraph("Was ändert sich bei zusätzlichem, eigenständig belegtem Transformationsnutzen?", s["table"]), paragraph("Dieselbe Geldlogik wie der IOI, ergänzt nur um einen separat dokumentierten Nutzenstrom in Euro.", s["table"])],
    ]
    table = Table(comparison, colWidths=[57, 149, 269], repeatRows=1)
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), 0.65, colors.HexColor("#6a6a6a")),
        ("LINEBELOW", (0, 1), (-1, -1), 0.25, colors.HexColor("#c7c7c7")),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return [
        paragraph("Tabelle 34-1: ROI, SROI, NWI, IOI und T-SROI im Vergleich", s["caption"]),
        table,
        Spacer(1, 10),
        paragraph("34.2 Die Arbeitslogik von NWI, IOI und T-SROI", s["heading"]),
        paragraph(
            "Die Werkzeuge sind drei Schubladen, keine Rechenleiter: Das NWI beschreibt ein Wirkungsprofil. "
            "IOI und T-SROI rechnen nur dokumentierte Geldströme. Ein offenes Schutz-Gate ist Voraussetzung "
            "für eine positive Aussage; ein NWI-Punkt wandert aber niemals in den Euro-Zähler.",
            s["body"],
        ),
        paragraph("Formelkasten 34-1: Grundlogik des Impact-Controllings", s["subheading"]),
        formula_box([
            "NWI = dimensionsloses Wirkungsprofil bei offenem NWI-Schutz-Gate",
            "IOI = {sum(t=1..T)[(B_direct,t * a_t * (1-d_t) * (1-v_t) - S_t)/(1+r)^t]} /",
            "      {sum(t=0..T)[(I_t + K_t)/(1+r_K)^t]}",
            "T-SROI = dieselbe Rechnung plus separat belegtes B_transformativ,t",
        ], s),
        Spacer(1, 8),
        paragraph(
            "T ist eine ganze Zahl von Jahren mit T >= 1. I_0 liegt bei t=0 und wird nicht abgezinst. "
            "B steht für Nutzen, S für Schaden, I für Investition und K für inkrementelle Kosten. "
            "Attribution a, Counterfactual/Deadweight d und Verdrängung v begrenzen nur den beanspruchten Nutzen.",
            s["fine"],
        ),
        paragraph(
            "Reichweite, Resilienz, Diffusion und Datenqualität bleiben wichtige Befunde. Sie sind jedoch keine "
            "frei wählbaren Multiplikatoren. Ein Eurobetrag entsteht erst, wenn ein eigener Nutzenstrom mit "
            "Wirkpfad, Vergleichsfall, Empfängerkreis, Preisbasis und Zurechnung belegt ist.",
            s["fine"],
        ),
    ]


def build_page_478(s: dict[str, ParagraphStyle]) -> list:
    return [
        paragraph(
            "Formelkasten 34-2: Arbeitsformel als Bewertungslogik", s["subheading"]),
        formula_box([
            "T-SROI = {sum(t=1..T)[((B_direct,t + B_transformativ,t) * a_t * (1-d_t) * (1-v_t) - S_t)/(1+r)^t]} /",
            "         {sum(t=0..T)[(I_t + K_t)/(1+r_K)^t]}",
            "PV_N^L = sum(t=1..T)[((B_direct,t + B_transformativ,t) * a_t * (1-d_t) * (1-v_t) * (1-u_t) - S_t)/(1+r)^t]",
        ], s),
        Spacer(1, 8),
        paragraph(
            "PV_N^L ist die konservative Szenario-Untergrenze. u_t kürzt nur den beanspruchten Nutzen. "
            "Der Schaden wird nie mitgekürzt. PV_N^L ist keine statistische Konfidenzgrenze, sondern eine "
            "offen gelegte Vorsichtsannahme.",
            s["body"],
        ),
        paragraph(
            "Eine positive IOI- oder T-SROI-Aussage ist nur zulässig, wenn keine rote Linie aktiv ist, kein "
            "Kernfeld negativ bleibt, Systemgrenze und Zurechnung dokumentiert sind, die Evidenz genügt, die "
            "Ressourcenbasis positiv ist und PV_N^L > 0 bleibt. Sonst lautet das Ergebnis: blockiert oder nicht bewertbar.",
            s["body"],
        ),
        paragraph("Ein Beispiel zum Nachrechnen", s["subheading"]),
        paragraph(
            "Im ersten Jahr entstehen 100 EUR direkter Nutzen und 25 EUR separat belegter Transformationsnutzen. "
            "Attribution ist 1, Deadweight und Verdrängung sind 0, der Schaden 60 EUR, der Diskontsatz 5 Prozent "
            "und die Investition 50 EUR. Dann beträgt der T-SROI-Zähler (100 + 25 - 60) / 1,05 = 61,90 EUR. "
            "Der T-SROI ist 61,90 / 50 = 1,24 EUR/EUR.",
            s["body"],
        ),
        paragraph(
            "Bei 20 Prozent Unsicherheitsabschlag lautet die Untergrenze ((100 + 25) * 0,8 - 60) / 1,05 = 38,10 EUR. "
            "Nicht 52 EUR und auch nicht 32 EUR: Der Abschlag trifft nur den behaupteten Nutzen, nicht den bereits "
            "angesetzten Schaden. So bleibt die Rechnung vorsichtig und prüfbar.",
            s["body"],
        ),
        paragraph("34.3 Transformation statt bloßer Projekt-Nutzen", s["heading"]),
        paragraph(
            "Transformation ist eine Veränderung von Regeln, Routinen, Infrastrukturen, Standards oder "
            "Entscheidungspfaden. Sie ist zunächst ein Wirkpfad-Befund, keine automatische Rechengröße. Ein Projekt "
            "kann nützlich sein, ohne transformativ zu wirken. Ein zusätzlicher Transformationsnutzen gehört nur dann "
            "in den T-SROI, wenn er ebenso sauber abgegrenzt und monetarisiert ist wie der direkte Nutzen.",
            s["body"],
        ),
        paragraph(
            "Diese Fassung ersetzt die historische Multiplikatorformel aus früheren Arbeitspapieren. Die historische "
            "Quelle bleibt als Vorfassung dokumentiert; der aktuelle Rechenstandard ist v1.1 (WÖK-Q-1024).",
            s["fine"],
        ),
    ]


def render_single_page(story: list, page_number: int, s: dict[str, ParagraphStyle]):
    packet = BytesIO()
    doc = SimpleDocTemplate(
        packet, pagesize=A4,
        leftMargin=30 * mm, rightMargin=30 * mm,
        topMargin=27 * mm, bottomMargin=25 * mm,
        title="Die neue Ordnung des Wohlstands - T-SROI-Rechenstandard v1.1",
        author="Natalie Weber",
    )
    doc.build(story, onFirstPage=draw_footer(page_number))
    packet.seek(0)
    rendered = PdfReader(packet)
    if len(rendered.pages) != 1:
        raise RuntimeError(f"Ersatzseite {page_number} ist unerwartet auf {len(rendered.pages)} Seiten umgebrochen.")
    return rendered.pages[0]


def replace_page_contents(writer: PdfWriter, page_number: int, replacement) -> None:
    target = writer.pages[page_number - 1]
    parent = target.get("/Parent")
    # Clone resources and content into the destination writer.  Reusing the
    # existing page dictionary keeps outline destinations stable.
    cloned = replacement.clone(writer, force_duplicate=True)
    target.clear()
    target.update(cloned)
    if parent is not None:
        target[NameObject("/Parent")] = parent


def revision_marker(reader: PdfReader) -> str:
    metadata = reader.metadata or {}
    return str(metadata.get(MARKER_KEY, ""))


def text_for_pages(reader: PdfReader) -> str:
    return "\n".join((reader.pages[number - 1].extract_text() or "") for number in PAGE_NUMBERS)


def validate_current(reader: PdfReader) -> None:
    if len(reader.pages) < max(PAGE_NUMBERS):
        raise RuntimeError("Hauptwerk enthält die erwarteten Seiten 477 und 478 nicht.")
    text = text_for_pages(reader)
    if revision_marker(reader) != MARKER_VALUE:
        raise RuntimeError("PDF trägt den Revisionsmarker für den T-SROI-Rechenstandard v1.1 nicht.")
    for snippet in CURRENT_SNIPPETS:
        if snippet not in text:
            raise RuntimeError(f"Aktuelle T-SROI-Korrektur fehlt auf Ersatzseiten: {snippet}")
    for snippet in RETIRED_SNIPPETS:
        if snippet in text:
            raise RuntimeError(f"Überholte T-SROI-Multiplikatorformel ist noch auslesbar: {snippet}")


def apply_revision(input_path: Path, output_path: Path, force: bool = False) -> None:
    source_reader = PdfReader(str(input_path))
    if len(source_reader.pages) < max(PAGE_NUMBERS):
        raise RuntimeError("Hauptwerk enthält die erwarteten Seiten 477 und 478 nicht.")
    already_current = revision_marker(source_reader) == MARKER_VALUE
    if already_current and not force:
        if input_path.resolve() != output_path.resolve():
            output_path.write_bytes(input_path.read_bytes())
        validate_current(PdfReader(str(output_path)))
        print("Hauptwerk-PDF enthält bereits die geprüfte T-SROI-Korrektur.")
        return

    old_text = text_for_pages(source_reader)
    if not already_current and not any(snippet in old_text for snippet in RETIRED_SNIPPETS):
        raise RuntimeError("Die erwartete historische T-SROI-Multiplikatorformel wurde nicht gefunden; keine unsichere PDF-Änderung durchgeführt.")

    s = styles()
    replacements = {
        477: render_single_page(build_page_477(s), 477, s),
        478: render_single_page(build_page_478(s), 478, s),
    }
    writer = PdfWriter(clone_from=str(input_path))
    for page_number, replacement in replacements.items():
        replace_page_contents(writer, page_number, replacement)
    writer.add_metadata({
        "/Title": "Natalie Weber - Die neue Ordnung des Wohlstands",
        "/Author": "Natalie Weber",
        "/Subject": "Öffentliche Lesefassung; methodisch korrigierter T-SROI-Rechenstandard v1.1",
        MARKER_KEY: MARKER_VALUE,
    })

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(prefix="woek-mainwork-", suffix=".pdf", dir=output_path.parent, delete=False) as temporary:
        temporary_path = Path(temporary.name)
        writer.write(temporary)
    try:
        validate_current(PdfReader(str(temporary_path)))
        os.replace(temporary_path, output_path)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()
    print(f"Hauptwerk-PDF mit T-SROI-Rechenstandard v1.1 aktualisiert: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--force", action="store_true", help="Erzeugt die Ersatzseiten erneut, auch wenn der Revisionsmarker bereits gesetzt ist.")
    args = parser.parse_args()
    input_path = args.input.resolve()
    output_path = (args.output or input_path).resolve()
    if not input_path.exists():
        raise SystemExit(f"PDF nicht gefunden: {input_path}")
    if args.check:
        validate_current(PdfReader(str(input_path)))
        print("Hauptwerk-PDF: T-SROI-Rechenstandard v1.1 und Ersatzseiten geprüft.")
        return
    apply_revision(input_path, output_path, force=args.force)


if __name__ == "__main__":
    main()
