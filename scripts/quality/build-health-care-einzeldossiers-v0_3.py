#!/usr/bin/env python3
"""Build the corrected public PDF of the Health & Care single dossiers.

The former v0.2 PDFs remain unchanged historical source files.  This builder
uses the corrected current online manuscript and creates a separately named
v0.3 PDF, so a correction never masquerades as the original publication.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle

from pdf_font_support import register_woek_fonts


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs/gesundheit-pflege/docx-extracts/woek_gesundheit_pflege_einzeldossier_set_v0_2.md"
EXAMPLE_SOURCE = ROOT / "docs/gesundheit-pflege/source/rechenbeispiel-zwei-bilanzen-v0_3.json"
OUTPUT = ROOT / "assets/downloads/woek_gesundheit_pflege_einzeldossier_set_v0_3.pdf"

INK = colors.HexColor("#17324D")
TEAL = colors.HexColor("#007C78")
MINT = colors.HexColor("#EAF6F4")
BLUE_PALE = colors.HexColor("#EDF3F8")
GOLD = colors.HexColor("#C58B20")
MUTED = colors.HexColor("#526675")
GRID = colors.HexColor("#B8C4CE")

MODULE_TITLES = {
    "Gesundheit als gesellschaftliches Wirkungsfeld",
    "Prävention, Gesundheitskassen und Wirkungshaushalt",
    "Pflege als Wirkleistung und Pflegeökosystem",
    "Psychische Gesundheit und soziale Stabilität",
    "Gesundheitsgerechtigkeit, Inklusion und Migration",
    "One Health, Klima, Umwelt und Ernährung",
    "Arbeitswelt, Unternehmen und Gesundheitswirkung",
    "Gesundheitsdaten, KI und Bürgerkontrolle",
    "Finanzierung, Wirkungsfonds und Gesundheitskassen",
    "Versorgungsräume, Kliniken und Gesundheitsnetzwerke",
    "Governance, Wirkungsrat und politische Anschlussfähigkeit",
    "Quellen und Anschlussdokumente",
}


def esc(value: str) -> str:
    return html.escape(value, quote=False)


def link(label: str, url: str) -> str:
    return f'<a href="{html.escape(url, quote=True)}" color="#007C78">{esc(label)}</a>'


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "kicker": ParagraphStyle("Kicker", parent=base["Normal"], fontName="WoeKBold", fontSize=8, leading=10, textColor=TEAL, spaceAfter=4 * mm),
        "title": ParagraphStyle("Title", parent=base["Title"], fontName="WoeKBold", fontSize=28, leading=34, textColor=INK, spaceAfter=7 * mm),
        "subtitle": ParagraphStyle("Subtitle", parent=base["Normal"], fontName="WoeKText", fontSize=15, leading=21, textColor=TEAL, spaceAfter=9 * mm),
        "h1": ParagraphStyle("H1", parent=base["Heading1"], fontName="WoeKBold", fontSize=19, leading=24, textColor=INK, spaceAfter=4 * mm, keepWithNext=True),
        "h2": ParagraphStyle("H2", parent=base["Heading2"], fontName="WoeKBold", fontSize=12.5, leading=16, textColor=INK, spaceBefore=5 * mm, spaceAfter=2.4 * mm, keepWithNext=True),
        "body": ParagraphStyle("Body", parent=base["BodyText"], fontName="WoeKText", fontSize=9.3, leading=13.4, textColor=INK, spaceAfter=2.6 * mm),
        "formula": ParagraphStyle("Formula", parent=base["Code"], fontName="WoeKMono", fontSize=7.1, leading=10.1, textColor=INK, wordWrap="CJK"),
        "callout": ParagraphStyle("Callout", parent=base["BodyText"], fontName="WoeKText", fontSize=9.2, leading=13.2, textColor=INK),
        "meta": ParagraphStyle("Meta", parent=base["Normal"], fontName="WoeKText", fontSize=8.6, leading=12.2, textColor=MUTED),
        "source": ParagraphStyle("Source", parent=base["BodyText"], fontName="WoeKText", fontSize=8.5, leading=12, textColor=INK, leftIndent=4 * mm, firstLineIndent=-3 * mm, spaceAfter=2 * mm),
    }


def box(content: Paragraph, background: colors.Color, left_color: colors.Color) -> Table:
    table = Table([[content]], colWidths=[174 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), 0.5, TEAL),
        ("LINEBEFORE", (0, 0), (0, -1), 3, left_color),
        ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 3.4 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.4 * mm),
    ]))
    return table


def footer(canvas, doc) -> None:
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#B8C4CE"))
    canvas.line(18 * mm, 13 * mm, 192 * mm, 13 * mm)
    canvas.setFont("WoeKText", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 8.5 * mm, "Wirkungsökonomie · Gesundheit & Pflege · Korrekturfassung v0.3")
    canvas.drawRightString(192 * mm, 8.5 * mm, f"Seite {doc.page}")
    canvas.restoreState()


def document() -> BaseDocTemplate:
    doc = BaseDocTemplate(
        str(OUTPUT), pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm, topMargin=19 * mm, bottomMargin=20 * mm,
        title="Gesundheit & Pflege - Einzeldossiers (Korrekturfassung v0.3)",
        author="Natalie Weber / Wirkungsökonomie",
        subject="Zwei Bilanzen für monetäre und nichtmonetäre Gesundheitswirkung",
    )
    doc.addPageTemplates([PageTemplate(id="main", frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="content")], onPage=footer)])
    return doc


def first_content_line(lines: list[str]) -> int:
    for index, line in enumerate(lines):
        if line.strip() == "Gesundheit als gesellschaftliches Wirkungsfeld":
            return index
    raise ValueError("Beginn der Dossiers nicht gefunden")


def body_blocks(lines: list[str], sty: dict[str, ParagraphStyle]) -> list[object]:
    story: list[object] = []
    for raw in lines[first_content_line(lines):]:
        line = raw.strip()
        if not line:
            continue
        if line in MODULE_TITLES:
            if story:
                story.append(PageBreak())
            story.append(Paragraph(esc(line), sty["h1"]))
            continue
        if re.match(r"^\d+\.\s+", line):
            story.append(Paragraph(esc(line), sty["h2"]))
            continue
        if line.startswith("Zwei Bilanzen statt"):
            story.append(box(Paragraph(f"<b>{esc(line.split(':', 1)[0])}:</b>{esc(line.split(':', 1)[1] if ':' in line else '')}", sty["callout"]), MINT, GOLD))
            story.append(Spacer(1, 2.5 * mm))
            continue
        if line.startswith("Monetäre Bilanz"):
            story.append(box(Paragraph(esc(line), sty["formula"]), BLUE_PALE, TEAL))
            story.append(Spacer(1, 2.5 * mm))
            continue
        if line.startswith("Nichtmonetäres Wirkungsprofil"):
            story.append(box(Paragraph(esc(line), sty["callout"]), MINT, TEAL))
            story.append(Spacer(1, 2.5 * mm))
            continue
        if line.startswith("Entscheidungsregel"):
            story.append(box(Paragraph(esc(line), sty["callout"]), BLUE_PALE, GOLD))
            story.append(Spacer(1, 2.5 * mm))
            continue
        story.append(Paragraph(esc(line), sty["body"]))
    return story


def two_balance_example(sty: dict[str, ParagraphStyle]) -> list[object]:
    """Render the current, explicitly non-personal model calculation.

    The historical v0.2 manuscript remains an immutable source document.  This
    separately versioned payload is deliberately injected only into v0.3 so
    that the public correction can be reproduced without rewriting history.
    """
    example = json.loads(EXAMPLE_SOURCE.read_text(encoding="utf-8"))
    required = {"title", "label", "assumptions", "monetary", "profile", "gate"}
    missing = required.difference(example)
    if missing:
        raise ValueError(f"Rechenbeispiel v0.3 unvollständig: {sorted(missing)}")
    return [
        Paragraph(esc(example["title"]), sty["h2"]),
        Paragraph(f"<b>{esc(example['label'])}</b>", sty["meta"]),
        Paragraph(f"<b>Annahmen:</b> {esc(example['assumptions'])}", sty["body"]),
        box(Paragraph(esc(example["monetary"]), sty["callout"]), BLUE_PALE, TEAL),
        Spacer(1, 2.5 * mm),
        Paragraph(f"<b>Nichtmonetäres Wirkungsprofil:</b> {esc(example['profile'].replace('Nichtmonetäres Wirkungsprofil: ', ''))}", sty["body"]),
        Paragraph(f"<b>Schutz-Gate:</b> {esc(example['gate'].replace('Schutz-Gate: ', ''))}", sty["body"]),
    ]


def build() -> None:
    register_woek_fonts()
    sty = styles()
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    story: list[object] = [
        Paragraph("WIRKUNGSÖKONOMIE", sty["kicker"]),
        Paragraph("Gesundheit &amp; Pflege", sty["title"]),
        Paragraph("Umfangreiche Einzeldossiers - Korrekturfassung v0.3", sty["subtitle"]),
        Paragraph("Von der Krankheitsfinanzierung zur Wirkungsgesundheit", sty["h2"]),
        Paragraph("Stand: 2. August 2026 · Autorin: Natalie Weber · Öffentliche Lesefassung", sty["meta"]),
        Spacer(1, 6 * mm),
    ]
    clarification = (
        "<b>Fachliche Einordnung:</b> Diese Korrekturfassung trennt die monetäre Bilanz "
        "von nichtmonetären Zustandsveränderungen. Die frühere PDF v0.2 bleibt als "
        "historische Quellenfassung unverändert erreichbar. Für T-SROI gilt der "
        f"{link('aktuelle Rechenstandard v1.1', 'https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/')} "
        f"mit {link('Quellenarchiv WÖK-Q-1024', 'https://wirkungsoekonomie.de/quellenarchiv/wok-q-1024/')}."
    )
    story += [box(Paragraph(clarification, sty["callout"]), MINT, GOLD), Spacer(1, 5 * mm)]
    story += [
        Paragraph("Kurz erklärt", sty["h2"]),
        Paragraph("Wenn man wissen will, ob ein Programm Geld spart, rechnet man Euro mit Euro. Wenn man wissen will, ob Menschen selbstständiger leben, teilhaben oder besser mit Krisen zurechtkommen, misst man diese Veränderungen in ihren eigenen Einheiten. Beides ist wichtig. Beides darf nicht künstlich zu einer Zahl zusammengeklebt werden.", sty["body"]),
        Paragraph("Die Rechnung hat deshalb zwei sichtbare Teile: einen diskontierten Geldsaldo und ein nichtmonetäres Wirkungsprofil. Eine positive Geldbilanz genügt nicht: Rote Linien, schwere Verschlechterungen, fehlende Vergleichsfälle oder zu schwache Daten blockieren die Aussage über positive Netto-Wirkung.", sty["body"]),
        Spacer(1, 4 * mm),
        *two_balance_example(sty),
        PageBreak(),
    ]
    story.extend(body_blocks(lines, sty))
    story += [
        PageBreak(), Paragraph("Quellen zum Rechenweg", sty["h1"]),
        Paragraph(f"• {link('T-SROI-Rechenstandard v1.1 und Quellenarchiv WÖK-Q-1024', 'https://wirkungsoekonomie.de/quellenarchiv/wok-q-1024/')}", sty["source"]),
        Paragraph(f"• {link('WHO: Social determinants of health', 'https://www.who.int/health-topics/social-determinants-of-health')}", sty["source"]),
        Paragraph(f"• {link('OECD: Health at a Glance 2025', 'https://www.oecd.org/en/publications/health-at-a-glance-2025_15a55280-en.html')}", sty["source"]),
        Paragraph(f"• {link('Destatis: Gesundheitsausgaben', 'https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Gesundheit/Gesundheitsausgaben/_inhalt.html')}", sty["source"]),
        Paragraph(f"• {link('Europäische Kommission: European Health Data Space', 'https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space-regulation-ehds_en')}", sty["source"]),
        Paragraph(f"• {link('Bundesministerium für Gesundheit: Gesundheitsberichterstattung und Monitoring', 'https://www.bundesgesundheitsministerium.de/themen/gesundheitswesen/gesundheitsberichterstattung-und-gesundheitsmonitoring')}", sty["source"]),
        Spacer(1, 4 * mm),
        Paragraph("Diese externen Quellen begründen Daten- und Bezugsrahmen. Die konkrete Zwei-Bilanzen-Logik bleibt ein transparent gekennzeichnetes WÖk-Modell; sie ersetzt weder medizinische Diagnostik noch individuelle oder demokratische Entscheidungen.", sty["body"]),
    ]
    document().build(story)


def check() -> None:
    """Validate the released correction without replacing its PDF artifact."""

    if not OUTPUT.exists() or OUTPUT.stat().st_size < 10_000:
        raise SystemExit(f"Missing or implausibly small health-care PDF: {OUTPUT}")
    text = "\n".join(page.extract_text() or "" for page in PdfReader(str(OUTPUT)).pages)
    required = ("Korrekturfassung v0.3", "positive Geldbilanz", "Schutz-Gate")
    missing = [term for term in required if term not in text]
    if missing:
        raise SystemExit(f"Health-care PDF is missing required correction terms: {missing}")
    print(f"Health-care PDF check passed: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build or validate the public health-care PDF.")
    parser.add_argument("--check", action="store_true", help="Validate the released PDF without writing it.")
    args = parser.parse_args()
    if args.check or os.environ.get("WOEK_PDF_BUILD_MODE") == "verify":
        check()
    else:
        build()
