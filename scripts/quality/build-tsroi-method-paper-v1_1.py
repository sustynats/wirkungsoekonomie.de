#!/usr/bin/env python3
"""Build the current, public T-SROI calculation standard as a PDF.

The manuscript lives beside the other Impact-Controlling method papers.  The output
is intentionally versioned instead of overwriting historic PDFs that used an older
multiplier approach.
"""

from __future__ import annotations

import argparse
import html
import os
import re
from pathlib import Path

from pypdf import PdfReader

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from pdf_font_support import register_woek_fonts


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs/impact-controlling/go10-methodenpapiere/t-sroi-rechenstandard-v1_1.md"
OUTPUT = ROOT / "assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_1.pdf"

INK = colors.HexColor("#17324D")
TEAL = colors.HexColor("#007C78")
MINT = colors.HexColor("#EAF6F4")
BLUE_PALE = colors.HexColor("#EDF3F8")
GOLD = colors.HexColor("#C58B20")
GRID = colors.HexColor("#B8C4CE")
MUTED = colors.HexColor("#526675")


def read_manuscript() -> tuple[dict[str, str], list[str]]:
    raw = SOURCE.read_text(encoding="utf-8").splitlines()
    metadata: dict[str, str] = {}
    if raw[:1] == ["---"]:
        end = raw.index("---", 1)
        for line in raw[1:end]:
            if ":" not in line:
                continue
            key, value = line.split(":", 1)
            metadata[key.strip()] = value.strip().strip('"')
        raw = raw[end + 1 :]
    return metadata, raw


def esc(value: str) -> str:
    return html.escape(value, quote=False)


MARKDOWN_LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")


def rich_text(value: str) -> str:
    """Escape prose while rendering Markdown links as usable PDF links.

    The manuscript remains ordinary Markdown for the website.  A PDF should not
    expose that source notation; it should show the source title and retain the
    actual URL as a clickable link.
    """

    parts: list[str] = []
    cursor = 0
    for match in MARKDOWN_LINK.finditer(value):
        parts.append(esc(value[cursor:match.start()]))
        label, url = match.groups()
        parts.append(f'<a href="{html.escape(url, quote=True)}" color="#007C78">{esc(label)}</a>')
        cursor = match.end()
    parts.append(esc(value[cursor:]))
    return "".join(parts)


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="WoeKBold",
            fontSize=30,
            leading=35,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=8 * mm,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["Normal"],
            fontName="WoeKText",
            fontSize=15,
            leading=21,
            textColor=TEAL,
            spaceAfter=9 * mm,
        ),
        "kicker": ParagraphStyle(
            "Kicker",
            parent=base["Normal"],
            fontName="WoeKBold",
            fontSize=8,
            leading=10,
            textColor=TEAL,
            spaceAfter=4 * mm,
            uppercase=True,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="WoeKBold",
            fontSize=17,
            leading=21,
            textColor=INK,
            spaceBefore=7 * mm,
            spaceAfter=3.5 * mm,
            keepWithNext=True,
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=base["Heading3"],
            fontName="WoeKBold",
            fontSize=12,
            leading=15,
            textColor=INK,
            spaceBefore=5 * mm,
            spaceAfter=2.5 * mm,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="WoeKText",
            fontSize=9.5,
            leading=14,
            textColor=INK,
            spaceAfter=3.2 * mm,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["BodyText"],
            fontName="WoeKText",
            fontSize=9.2,
            leading=13,
            textColor=INK,
            leftIndent=6 * mm,
            firstLineIndent=-4 * mm,
            spaceAfter=2 * mm,
        ),
        "formula": ParagraphStyle(
            "Formula",
            parent=base["Code"],
            fontName="WoeKMono",
            fontSize=7.5,
            leading=10.5,
            textColor=INK,
            wordWrap="CJK",
        ),
        "callout": ParagraphStyle(
            "Callout",
            parent=base["BodyText"],
            fontName="WoeKText",
            fontSize=9.2,
            leading=13.3,
            textColor=INK,
        ),
        "table": ParagraphStyle(
            "Table",
            parent=base["BodyText"],
            fontName="WoeKText",
            fontSize=6.8,
            leading=8.3,
            textColor=INK,
            wordWrap="CJK",
        ),
        "table_head": ParagraphStyle(
            "TableHead",
            parent=base["BodyText"],
            fontName="WoeKBold",
            fontSize=6.8,
            leading=8.3,
            textColor=colors.white,
            wordWrap="CJK",
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=base["Normal"],
            fontName="WoeKText",
            fontSize=8.3,
            leading=12,
            textColor=MUTED,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["Normal"],
            fontName="WoeKBold",
            fontSize=11.5,
            leading=16,
            textColor=INK,
            alignment=TA_CENTER,
        ),
    }


def paragraph(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(rich_text(text), style)


def formula_box(formula: str, sty: dict[str, ParagraphStyle]) -> Table:
    content = Paragraph(esc(formula), sty["formula"])
    box = Table([[content]], colWidths=[174 * mm])
    box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BLUE_PALE),
                ("BOX", (0, 0), (-1, -1), 0.5, TEAL),
                ("LINEBEFORE", (0, 0), (0, -1), 3, TEAL),
                ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5 * mm),
            ]
        )
    )
    return box


def callout_box(text: str, sty: dict[str, ParagraphStyle]) -> Table:
    content = Paragraph(esc(text), sty["callout"])
    box = Table([[content]], colWidths=[174 * mm])
    box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), MINT),
                ("BOX", (0, 0), (-1, -1), 0.5, TEAL),
                ("LINEBEFORE", (0, 0), (0, -1), 3, GOLD),
                ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5 * mm),
            ]
        )
    )
    return box


def column_widths(count: int) -> list[float]:
    available = 174 * mm
    if count == 3:
        return [27 * mm, 48 * mm, available - 75 * mm]
    if count == 7:
        return [9 * mm, 20 * mm, 22 * mm, 28 * mm, 15 * mm, 39 * mm, available - 133 * mm]
    return [available / count] * count


def make_table(rows: list[list[str]], sty: dict[str, ParagraphStyle]) -> Table:
    rendered: list[list[Paragraph]] = []
    for row_index, row in enumerate(rows):
        cell_style = sty["table_head"] if row_index == 0 else sty["table"]
        rendered.append([Paragraph(esc(cell), cell_style) for cell in row])
    table = Table(rendered, colWidths=column_widths(len(rows[0])), repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), INK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.3, GRID),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 2.2 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2.2 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 1.8 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1.8 * mm),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7FAFC")]),
            ]
        )
    )
    return table


def parse_blocks(lines: list[str], sty: dict[str, ParagraphStyle]) -> list[object]:
    story: list[object] = []
    index = 0
    while index < len(lines):
        line = lines[index].rstrip()
        if not line:
            index += 1
            continue
        if line.startswith("## "):
            heading = line[3:]
            if heading in {"Rechenformel", "Beispielrechnung, Schritt für Schritt", "Grenzen und Angriffspunkte"}:
                story.append(PageBreak())
            story.append(Paragraph(esc(heading), sty["h2"]))
            index += 1
            continue
        if line.startswith("### "):
            story.append(Paragraph(esc(line[4:]), sty["h3"]))
            index += 1
            continue
        if line.startswith("> "):
            story.extend([callout_box(line[2:], sty), Spacer(1, 3 * mm)])
            index += 1
            continue
        if line.startswith("$$") and line.endswith("$$"):
            story.extend([formula_box(line[2:-2].strip(), sty), Spacer(1, 3 * mm)])
            index += 1
            continue
        if line.startswith("| "):
            rows: list[list[str]] = []
            while index < len(lines) and lines[index].startswith("|"):
                cells = [cell.strip() for cell in lines[index].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells):
                    rows.append(cells)
                index += 1
            if rows:
                story.extend([make_table(rows, sty), Spacer(1, 3 * mm)])
            continue
        if line.startswith("- "):
            while index < len(lines) and lines[index].startswith("- "):
                story.append(Paragraph(f"- {rich_text(lines[index][2:])}", sty["bullet"]))
                index += 1
            story.append(Spacer(1, 1.2 * mm))
            continue
        paragraph_lines = [line]
        index += 1
        while index < len(lines):
            candidate = lines[index].rstrip()
            if not candidate or candidate.startswith(("## ", "### ", "> ", "$$", "|", "- ")):
                break
            paragraph_lines.append(candidate)
            index += 1
        story.append(paragraph(" ".join(paragraph_lines), sty["body"]))
    return story


def footer(canvas, doc) -> None:  # type: ignore[no-untyped-def]
    canvas.saveState()
    canvas.setStrokeColor(GRID)
    canvas.setLineWidth(0.4)
    canvas.line(doc.leftMargin, 13 * mm, A4[0] - doc.rightMargin, 13 * mm)
    canvas.setFont("WoeKText", 7.2)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 8.5 * mm, "Wirkungsökonomie | T-SROI-Rechenstandard v1.1")
    canvas.drawRightString(A4[0] - doc.rightMargin, 8.5 * mm, f"Seite {doc.page}")
    canvas.restoreState()


def build() -> None:
    register_woek_fonts()
    metadata, lines = read_manuscript()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    document = BaseDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=20 * mm,
        title=metadata.get("title", "T-SROI-Rechenstandard"),
        author="Wirkungsökonomie",
        subject="Kausale, diskontierte Netto-Nutzenrechnung für Transformationsinvestitionen",
    )
    frame = Frame(document.leftMargin, document.bottomMargin, document.width, document.height, id="main")
    document.addPageTemplates([PageTemplate(id="standard", frames=[frame], onPage=footer)])

    sty = styles()
    story: list[object] = []
    story.extend(
        [
            Spacer(1, 20 * mm),
            Paragraph("WIRKUNGSÖKONOMIE | METHODENPAPIER 23", sty["kicker"]),
            Paragraph(esc(metadata.get("title", "T-SROI-Rechenstandard")), sty["title"]),
            Paragraph(esc(metadata.get("subtitle", "")), sty["subtitle"]),
            Spacer(1, 9 * mm),
            Table(
                [[Paragraph("<b>Version</b><br/>" + esc(metadata.get("version", "v1.1")), sty["meta"]),
                  Paragraph("<b>Stand</b><br/>" + esc(metadata.get("stand", "")), sty["meta"]),
                  Paragraph("<b>Geltung</b><br/>Aktuelle Rechenfassung", sty["meta"])]],
                colWidths=[58 * mm, 54 * mm, 62 * mm],
                style=TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), BLUE_PALE),
                        ("BOX", (0, 0), (-1, -1), 0.5, GRID),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
                        ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
                    ]
                ),
            ),
            Spacer(1, 18 * mm),
            Paragraph("Eine Rechnung soll etwas erklären, nicht etwas größer machen. Deshalb stehen vor dem Quotienten Wirkungspfad, Schutzgrenze und Gegenprobe.", sty["quote"]),
            Spacer(1, 12 * mm),
            Paragraph(esc(metadata.get("canonical_url", "")), sty["meta"]),
            PageBreak(),
        ]
    )
    story.extend(parse_blocks(lines, sty))
    document.build(story)
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")


def check() -> None:
    """Verify the released PDF without replacing the publication artifact.

    The public download is versioned and checksum-verified separately.  A site
    build must therefore use that released file as its source of truth instead
    of silently producing a platform-dependent replacement.
    """

    if not OUTPUT.exists() or OUTPUT.stat().st_size < 10_000:
        raise SystemExit(f"Missing or implausibly small T-SROI PDF: {OUTPUT}")
    text = "\n".join(page.extract_text() or "" for page in PdfReader(str(OUTPUT)).pages)
    required = ("T-SROI-Rechenstandard v1.1", "Schutz-Gate", "Aufschlagsfaktor")
    missing = [term for term in required if term not in text]
    if missing:
        raise SystemExit(f"T-SROI PDF is missing required current-standard terms: {missing}")
    print(f"T-SROI PDF check passed: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build or validate the public T-SROI PDF.")
    parser.add_argument("--check", action="store_true", help="Validate the released PDF without writing it.")
    args = parser.parse_args()
    if args.check or os.environ.get("WOEK_PDF_BUILD_MODE") == "verify":
        check()
    else:
        build()
