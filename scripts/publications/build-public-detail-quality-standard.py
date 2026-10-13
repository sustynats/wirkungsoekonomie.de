#!/usr/bin/env python3
"""Build the public fachlicher Qualitätsstandard from its corrected Markdown source."""
from __future__ import annotations

import hashlib
import html
import json
import re
import shutil
from pathlib import Path

import pymupdf
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs/sanierung-detaildossiers/source/woek_standard_umfangreiche_detailkonzepte_dossiers_v1_0.md"
OUTPUT = ROOT / "docs/sanierung-detaildossiers/source/woek_standard_umfangreiche_detailkonzepte_dossiers_v1_0.pdf"
PRIVATE_ARCHIVE = ROOT.parent / "recovery/private-pdf-originals-20261013/detail-quality-standard"
REPORT = ROOT / "reports/consistency-20261009/detail-quality-standard-rebuild-20261013.json"

REGULAR = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
GREEN = colors.HexColor("#16785A")
NAVY = colors.HexColor("#071527")
CREAM = colors.HexColor("#F6F1E7")
MUTED = colors.HexColor("#50605B")
RULE = colors.HexColor("#D9E5DF")

TITLE = "Qualitätsstandard für umfangreiche Detailkonzepte und Dossiers"
AUTHOR = "Institut für Wirkungsökonomie; Natalie Weber"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rich(value: str) -> str:
    escaped = html.escape(value, quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", escaped)


class StandardDocument(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(
            filename, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
            topMargin=22 * mm, bottomMargin=19 * mm, title=TITLE,
            author=AUTHOR, subject="Fachlicher Qualitätsstandard der Wirkungsökonomie",
            creator="Institut für Wirkungsökonomie",
        )
        self._outline_index = 0
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="main")
        self.addPageTemplates(PageTemplate(id="content", frames=frame, onPage=self.decorate))

    def decorate(self, canvas, doc) -> None:
        canvas.saveState()
        canvas.setTitle(TITLE)
        canvas.setAuthor(AUTHOR)
        canvas.setSubject("Fachlicher Qualitätsstandard der Wirkungsökonomie")
        canvas.setCreator("Institut für Wirkungsökonomie")
        canvas.setProducer("Institut für Wirkungsökonomie")
        if doc.page > 1:
            canvas.setFont("WOEK-Regular", 7.4)
            canvas.setFillColor(MUTED)
            canvas.drawString(self.leftMargin, A4[1] - 12 * mm, "WIRKUNGSÖKONOMIE")
            canvas.drawRightString(A4[0] - self.rightMargin, A4[1] - 12 * mm, "Fachlicher Qualitätsstandard")
            canvas.setStrokeColor(RULE)
            canvas.line(self.leftMargin, A4[1] - 14 * mm, A4[0] - self.rightMargin, A4[1] - 14 * mm)
        canvas.setFont("WOEK-Regular", 7.2)
        canvas.setFillColor(MUTED)
        canvas.drawString(self.leftMargin, 10 * mm, "© 2026 Institut für Wirkungsökonomie · Natalie Weber")
        canvas.drawRightString(A4[0] - self.rightMargin, 10 * mm, f"Seite {doc.page}")
        canvas.restoreState()

    def afterFlowable(self, flowable) -> None:
        if not isinstance(flowable, Paragraph) or flowable.style.name != "WOEK-H1":
            return
        self._outline_index += 1
        key = f"section-{self._outline_index}"
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(flowable.getPlainText(), key, level=0, closed=False)


def build_story() -> list[object]:
    base = getSampleStyleSheet()
    title = ParagraphStyle("WOEK-CoverTitle", parent=base["Title"], fontName="WOEK-Bold", fontSize=25, leading=29, textColor=NAVY, spaceAfter=5 * mm)
    subtitle = ParagraphStyle("WOEK-CoverSubtitle", parent=base["Normal"], fontName="WOEK-Regular", fontSize=12, leading=16, textColor=MUTED, spaceAfter=10 * mm)
    h1 = ParagraphStyle("WOEK-H1", parent=base["Heading1"], fontName="WOEK-Bold", fontSize=16, leading=20, textColor=NAVY, spaceBefore=7 * mm, spaceAfter=3 * mm, keepWithNext=True)
    body = ParagraphStyle("WOEK-Body", parent=base["BodyText"], fontName="WOEK-Regular", fontSize=9.5, leading=13.3, textColor=NAVY, spaceAfter=2.7 * mm, allowWidows=0, allowOrphans=0)
    bullet = ParagraphStyle("WOEK-Bullet", parent=body, leftIndent=6 * mm, firstLineIndent=-3.5 * mm, bulletIndent=0, spaceAfter=1.5 * mm)
    lead = ParagraphStyle("WOEK-Lead", parent=body, fontSize=10.5, leading=15, backColor=CREAM, borderColor=RULE, borderWidth=0.6, borderPadding=8, spaceBefore=4 * mm)
    small = ParagraphStyle("WOEK-Small", parent=body, fontSize=8.4, leading=10.7, spaceAfter=0)

    text = SOURCE.read_text(encoding="utf-8")
    banned = re.search(r"Codex|Claude|ChatGPT|Repository|Arbeitsanweisung|Redaktion\s+Redaktion|Website-Pflichten|Sanierungsumfang|Priorisierte Reihenfolge", text, re.I)
    if banned:
        raise RuntimeError(f"Non-public production wording remains in source: {banned.group(0)!r}")
    lines = [line.rstrip() for line in text.splitlines()]
    first_heading = next(i for i, line in enumerate(lines) if line.startswith("## "))
    opening = [line for line in lines[:first_heading] if line and not line.startswith("# ")]
    story: list[object] = [
        Spacer(1, 15 * mm),
        Paragraph("WIRKUNGSÖKONOMIE · STANDARD", ParagraphStyle("WOEK-Label", parent=body, fontName="WOEK-Bold", fontSize=9, textColor=GREEN, spaceAfter=7 * mm)),
        Paragraph(TITLE, title),
        Paragraph("Fachlicher Mindeststandard der Wirkungsökonomie", subtitle),
    ]
    meta_values = {}
    lead_text = ""
    for line in opening:
        match = re.match(r"\*\*(.+?):\*\*\s*(.+?)(?:\s{2})?$", line)
        if match:
            meta_values[match.group(1)] = match.group(2)
        elif line != "Fachlicher Mindeststandard der Wirkungsökonomie":
            lead_text = line
    meta = Table(
        [[Paragraph(f"<b>{html.escape(label)}</b>", small), Paragraph(rich(meta_values[label]), small)] for label in ("Autorin", "Version", "Status", "Stand")],
        colWidths=[35 * mm, 105 * mm], hAlign="LEFT",
    )
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), CREAM), ("GRID", (0, 0), (-1, -1), 0.45, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.extend([meta, Spacer(1, 6 * mm), Paragraph(rich(lead_text), lead), PageBreak()])

    for line in lines[first_heading:]:
        if not line:
            continue
        if line.startswith("## "):
            story.append(Paragraph(rich(line[3:]), h1))
        elif line.startswith("- "):
            story.append(Paragraph(rich(line[2:]), bullet, bulletText="•"))
        else:
            story.append(Paragraph(rich(line), body))
    return story


def main() -> None:
    pdfmetrics.registerFont(TTFont("WOEK-Regular", str(REGULAR)))
    pdfmetrics.registerFont(TTFont("WOEK-Bold", str(BOLD)))
    PRIVATE_ARCHIVE.mkdir(parents=True, exist_ok=True)
    archive = PRIVATE_ARCHIVE / "woek_standard_umfangreiche_detailkonzepte_dossiers_v1_0-historical-original.pdf"
    if OUTPUT.exists() and not archive.exists():
        shutil.copy2(OUTPUT, archive)
    before = sha256(OUTPUT) if OUTPUT.exists() else None
    temporary = OUTPUT.with_suffix(".rebuild.tmp.pdf")
    temporary.unlink(missing_ok=True)
    StandardDocument(str(temporary)).build(build_story())
    with pymupdf.open(temporary) as document:
        if len(document) < 2:
            raise RuntimeError("Unexpectedly short quality standard")
        visible = "\n".join(page.get_text() for page in document)
        if re.search(r"Codex|Claude|ChatGPT|Repository|Redaktion\s+Redaktion|Website-Pflichten|Sanierungsumfang|Priorisierte Reihenfolge", visible, re.I):
            raise RuntimeError("Production wording remains in rebuilt PDF")
        pages = len(document)
        metadata = document.metadata
    temporary.replace(OUTPUT)
    report = {
        "date": "2026-10-13", "status": "PASS", "source": SOURCE.relative_to(ROOT).as_posix(),
        "output": OUTPUT.relative_to(ROOT).as_posix(), "historicalOriginal": str(archive),
        "historicalOriginalSha256": sha256(archive), "beforeSha256": before,
        "afterSha256": sha256(OUTPUT), "pages": pages, "metadata": metadata,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS", "pages": pages, "sha256": report["afterSha256"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
