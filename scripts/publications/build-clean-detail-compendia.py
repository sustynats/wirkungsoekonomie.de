#!/usr/bin/env python3
"""Build five public detail-compendium PDFs from their corrected text sources."""
from __future__ import annotations

import hashlib
import html
import json
import re
import shutil
from pathlib import Path

import pymupdf
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
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


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "docs/korrektur-detailkonzepte/docx-extracts"
OUTPUT_DIR = ROOT / "assets/downloads"
REPORT = ROOT / "reports/consistency-20261009/detail-compendium-pdf-rebuild-20261013.json"
PRIVATE_ARCHIVE = ROOT.parent / "recovery/private-pdf-originals-20261013/detail-compendia"

REGULAR = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
ITALIC = Path("/System/Library/Fonts/Supplemental/Arial Italic.ttf")

GREEN = colors.HexColor("#16785A")
NAVY = colors.HexColor("#071527")
CREAM = colors.HexColor("#F6F1E7")
MUTED = colors.HexColor("#50605B")
RULE = colors.HexColor("#D9E5DF")

CONFIG = (
    {
        "source": "woek_impact_controlling_detailkonzepte_umfangreich_v0_2.md",
        "pdf": "woek_impact_controlling_detailkonzepte_umfangreich_v0_2.pdf",
        "duplicate": "woek_impact_controlling_detailkonzepte_umfangreich_v0_2 2.pdf",
    },
    {
        "source": "woek_produkte_konsum_detailkonzepte_umfangreich_v0_2.md",
        "pdf": "woek_produkte_konsum_detailkonzepte_umfangreich_v0_2.pdf",
        "duplicate": "woek_produkte_konsum_detailkonzepte_umfangreich_v0_2 2.pdf",
    },
    {
        "source": "woek_staat_recht_demokratie_detailkonzepte_umfangreich_v0_2.md",
        "pdf": "woek_staat_recht_demokratie_detailkonzepte_umfangreich_v0_2.pdf",
        "duplicate": "woek_staat_recht_demokratie_detailkonzepte_umfangreich_v0_2 2.pdf",
    },
    {
        "source": "woek_wirtschaft_unternehmen_detailkonzepte_umfangreich_v0_2.md",
        "pdf": "woek_wirtschaft_unternehmen_detailkonzepte_umfangreich_v0_2.pdf",
        "duplicate": "woek_wirtschaft_unternehmen_detailkonzepte_umfangreich_v0_2 2.pdf",
    },
    {
        "source": "woek_wohnen_stadt_detailkonzepte_umfangreich_v0_2.md",
        "pdf": "woek_wohnen_stadt_detailkonzepte_umfangreich_v0_2.pdf",
        "duplicate": "woek_wohnen_stadt_detailkonzepte_umfangreich_v0_2 2.pdf",
    },
)

BANNED_PUBLIC_TEXT = re.compile(
    r"Vorwort und Korrekturhinweis|nachgelieferte Korrekturfassung|"
    r"interne(?:n)? (?:technische(?:n)? )?(?:Umsetzungs|Arbeits)|"
    r"nicht Arbeitsabläufe|Website|Online-Volltext|Toolbezug|"
    r"Gemeinsame Veröffentlichungslogik",
    re.IGNORECASE,
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def safe(text: str) -> str:
    return html.escape(text, quote=False).replace("\n", "<br/>")


def rich(text: str) -> str:
    match = re.match(r"^([^:]{1,55}):\s+(.+)$", text, re.DOTALL)
    if match and not match.group(1).lower().startswith(("http", "https")):
        return f"<b>{safe(match.group(1))}:</b> {safe(match.group(2))}"
    return safe(text)


class CompendiumDocument(BaseDocTemplate):
    def __init__(self, filename: str, *, running_title: str):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=21 * mm,
            rightMargin=21 * mm,
            topMargin=22 * mm,
            bottomMargin=19 * mm,
            title=running_title,
            author="Institut für Wirkungsökonomie; Natalie Weber",
            subject="Wirkungsökonomie – fachliches Detailkonzept-Kompendium",
            creator="Institut für Wirkungsökonomie",
        )
        self.running_title = running_title
        self._outline_index = 0
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="main")
        self.addPageTemplates(PageTemplate(id="content", frames=frame, onPage=self.decorate_page))

    def decorate_page(self, canvas, doc) -> None:
        canvas.saveState()
        canvas.setTitle(self.running_title)
        canvas.setAuthor("Institut für Wirkungsökonomie; Natalie Weber")
        canvas.setSubject("Wirkungsökonomie – fachliches Detailkonzept-Kompendium")
        canvas.setCreator("Institut für Wirkungsökonomie")
        canvas.setProducer("Institut für Wirkungsökonomie")
        if doc.page > 1:
            canvas.setFont("WOEK-Regular", 7.4)
            canvas.setFillColor(MUTED)
            canvas.drawString(self.leftMargin, A4[1] - 12 * mm, "WIRKUNGSÖKONOMIE")
            canvas.drawRightString(A4[0] - self.rightMargin, A4[1] - 12 * mm, self.running_title)
            canvas.setStrokeColor(RULE)
            canvas.line(self.leftMargin, A4[1] - 14 * mm, A4[0] - self.rightMargin, A4[1] - 14 * mm)
        canvas.setFont("WOEK-Regular", 7.2)
        canvas.setFillColor(MUTED)
        canvas.drawString(self.leftMargin, 10 * mm, "© 2026 Institut für Wirkungsökonomie · Natalie Weber")
        canvas.drawRightString(A4[0] - self.rightMargin, 10 * mm, f"Seite {doc.page}")
        canvas.restoreState()

    def afterFlowable(self, flowable) -> None:
        if not isinstance(flowable, Paragraph) or flowable.style.name not in {"WOEK-H1", "WOEK-H2"}:
            return
        self._outline_index += 1
        key = f"section-{self._outline_index}"
        title = flowable.getPlainText()
        level = 0 if flowable.style.name == "WOEK-H1" else 1
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(title, key, level=level, closed=False)


def styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "cover_label": ParagraphStyle(
            "WOEK-CoverLabel", parent=base["Normal"], fontName="WOEK-Bold",
            fontSize=9, leading=11, textColor=GREEN, spaceAfter=7 * mm,
        ),
        "cover_title": ParagraphStyle(
            "WOEK-CoverTitle", parent=base["Title"], fontName="WOEK-Bold",
            fontSize=25, leading=29, textColor=NAVY, alignment=TA_LEFT, spaceAfter=5 * mm,
        ),
        "cover_subtitle": ParagraphStyle(
            "WOEK-CoverSubtitle", parent=base["Normal"], fontName="WOEK-Regular",
            fontSize=12, leading=16, textColor=MUTED, spaceAfter=10 * mm,
        ),
        "lead": ParagraphStyle(
            "WOEK-Lead", parent=base["Normal"], fontName="WOEK-Regular",
            fontSize=10.5, leading=15, textColor=NAVY, backColor=CREAM,
            borderColor=RULE, borderWidth=0.6, borderPadding=8, spaceBefore=4 * mm,
        ),
        "h1": ParagraphStyle(
            "WOEK-H1", parent=base["Heading1"], fontName="WOEK-Bold",
            fontSize=17, leading=21, textColor=NAVY, spaceBefore=7 * mm,
            spaceAfter=3 * mm, keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "WOEK-H2", parent=base["Heading2"], fontName="WOEK-Bold",
            fontSize=12.2, leading=15.5, textColor=GREEN, spaceBefore=4.5 * mm,
            spaceAfter=1.8 * mm, keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "WOEK-Body", parent=base["BodyText"], fontName="WOEK-Regular",
            fontSize=9.15, leading=12.7, textColor=NAVY, spaceAfter=2.3 * mm,
            splitLongWords=False, allowWidows=0, allowOrphans=0,
        ),
        "small": ParagraphStyle(
            "WOEK-Small", parent=base["BodyText"], fontName="WOEK-Regular",
            fontSize=8.1, leading=10.4, textColor=NAVY,
        ),
        "small_bold": ParagraphStyle(
            "WOEK-SmallBold", parent=base["BodyText"], fontName="WOEK-Bold",
            fontSize=8.1, leading=10.4, textColor=NAVY,
        ),
    }


def extract_front(paragraphs: list[str]) -> tuple[dict[str, str], list[str]]:
    start = paragraphs.index("Grundthese des Bereichs")
    front = paragraphs[:start]
    if len(front) < 5:
        raise RuntimeError("unexpected compendium front matter")
    metadata: dict[str, str] = {
        "kicker": front[0],
        "series": front[1],
        "title": front[2],
        "subtitle": front[3],
    }
    labels = {"Autorin", "Referenz", "Version", "Status", "Stand"}
    index = 4
    while index < len(front):
        if front[index] in labels and index + 1 < len(front):
            metadata[front[index]] = front[index + 1]
            index += 2
        else:
            metadata["lead"] = front[index]
            index += 1
    return metadata, paragraphs[start:]


def extract_overview(body: list[str]) -> tuple[list[str], list[list[str]], list[str]]:
    heading = body.index("Überblick der Unterbereiche")
    detail = body.index("Detailkonzepte")
    prefix = body[:heading]
    table_parts = body[heading + 1:detail]
    if table_parts[:3] != ["Nr.", "Unterbereich", "Kurzfunktion"]:
        raise RuntimeError("unexpected overview table structure")
    cells = table_parts[3:]
    if len(cells) % 3:
        raise RuntimeError("overview table has incomplete rows")
    rows = [["Nr.", "Unterbereich", "Kurzfunktion"]]
    rows.extend([cells[i:i + 3] for i in range(0, len(cells), 3)])
    return prefix, rows, body[detail:]


def build_story(source: Path) -> tuple[list[object], dict[str, str]]:
    paragraph_texts = [part.strip() for part in source.read_text(encoding="utf-8").split("\n\n") if part.strip()]
    residue = BANNED_PUBLIC_TEXT.search("\n".join(paragraph_texts))
    if residue:
        raise RuntimeError(f"production wording remains in source {source}: {residue.group(0)!r}")
    metadata, body = extract_front(paragraph_texts)
    prefix, overview_rows, detail_body = extract_overview(body)
    st = styles()
    story: list[object] = []

    story.extend([
        Spacer(1, 15 * mm),
        Paragraph(safe(metadata["kicker"]), st["cover_label"]),
        Paragraph(safe(metadata["title"]), st["cover_title"]),
        Paragraph(safe(metadata["subtitle"]), st["cover_subtitle"]),
    ])
    meta_rows = [
        [Paragraph(f"<b>{safe(label)}</b>", st["small"]), Paragraph(safe(metadata[label]), st["small"])]
        for label in ("Autorin", "Referenz", "Version", "Status", "Stand")
    ]
    meta = Table(meta_rows, colWidths=[35 * mm, 105 * mm], hAlign="LEFT")
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), CREAM),
        ("GRID", (0, 0), (-1, -1), 0.45, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(meta)
    if metadata.get("lead"):
        story.extend([Spacer(1, 6 * mm), Paragraph(rich(metadata["lead"]), st["lead"])])
    story.append(PageBreak())

    for index, text in enumerate(prefix):
        if text == "Grundthese des Bereichs":
            story.append(Paragraph(text, st["h1"]))
        else:
            story.append(Paragraph(rich(text), st["body"]))

    story.append(Paragraph("Überblick der Unterbereiche", st["h1"]))
    rendered_rows = []
    for row_index, row in enumerate(overview_rows):
        style = st["small_bold"] if row_index == 0 else st["small"]
        rendered_rows.append([Paragraph(safe(cell), style) for cell in row])
    overview = Table(rendered_rows, colWidths=[11 * mm, 52 * mm, 103 * mm], repeatRows=1, hAlign="LEFT")
    overview.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREAM]),
        ("GRID", (0, 0), (-1, -1), 0.45, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.extend([overview, PageBreak()])

    for index, text in enumerate(detail_body):
        next_text = detail_body[index + 1] if index + 1 < len(detail_body) else ""
        if text in {"Detailkonzepte", "Quellen- und Referenzrahmen"} or next_text.startswith("Dieses Detailkonzept vertieft"):
            story.append(Paragraph(safe(text), st["h1"]))
        elif re.match(r"^\d+\.\s+", text):
            story.append(Paragraph(safe(text), st["h2"]))
        else:
            story.append(Paragraph(rich(text), st["body"]))

    return story, metadata


def sanitize_metadata(path: Path, title: str) -> None:
    document = pymupdf.open(path)
    document.set_metadata({
        "title": title,
        "author": "Institut für Wirkungsökonomie; Natalie Weber",
        "subject": "Wirkungsökonomie – fachliches Detailkonzept-Kompendium",
        "keywords": "Wirkungsökonomie, positive Netto-Wirkung, Nichtkompensation, Reverse Merit Order",
        "creator": "Institut für Wirkungsökonomie",
        "producer": "Institut für Wirkungsökonomie",
        "creationDate": "D:20261013000000+02'00'",
        "modDate": "D:20261013000000+02'00'",
    })
    if document.get_xml_metadata():
        document.set_xml_metadata("")
    temporary = path.with_suffix(".metadata.pdf")
    temporary.unlink(missing_ok=True)
    document.save(temporary, garbage=4, deflate=True)
    document.close()
    temporary.replace(path)


def archive_predecessors() -> dict[str, str]:
    PRIVATE_ARCHIVE.mkdir(parents=True, exist_ok=True)
    archived: dict[str, str] = {}
    for item in CONFIG:
        for name in (item["pdf"], item["duplicate"]):
            source = OUTPUT_DIR / name
            destination = PRIVATE_ARCHIVE / name
            if source.exists() and not destination.exists():
                shutil.copy2(source, destination)
            if destination.exists():
                archived[name] = sha256(destination)
    (PRIVATE_ARCHIVE / "manifest.json").write_text(
        json.dumps({"date": "2026-10-13", "files": archived}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return archived


def build_one(item: dict[str, str], predecessor_hashes: dict[str, str]) -> dict[str, object]:
    source = SOURCE_DIR / item["source"]
    target = OUTPUT_DIR / item["pdf"]
    duplicate = OUTPUT_DIR / item["duplicate"]
    target.parent.mkdir(parents=True, exist_ok=True)
    story, metadata = build_story(source)
    document = CompendiumDocument(str(target), running_title=metadata["title"])
    document.build(story)
    sanitize_metadata(target, f"{metadata['title']} – Detailkonzept-Kompendium")
    shutil.copy2(target, duplicate)

    with pymupdf.open(target) as checked:
        text = "\n".join(page.get_text() for page in checked)
        pages = len(checked)
        pdf_metadata = checked.metadata
    residue = BANNED_PUBLIC_TEXT.search(text)
    if residue:
        raise RuntimeError(f"production wording remains in {target}: {residue.group(0)!r}")
    if pdf_metadata.get("author") != "Institut für Wirkungsökonomie; Natalie Weber":
        raise RuntimeError(f"unexpected author metadata in {target}")
    if sha256(target) != sha256(duplicate):
        raise RuntimeError(f"duplicate mismatch for {target}")
    return {
        "source": source.relative_to(ROOT).as_posix(),
        "sourceSha256": sha256(source),
        "pdf": target.relative_to(ROOT).as_posix(),
        "duplicate": duplicate.relative_to(ROOT).as_posix(),
        "predecessorSha256": predecessor_hashes.get(item["pdf"]),
        "sha256": sha256(target),
        "pages": pages,
        "author": pdf_metadata.get("author"),
        "duplicateExact": True,
    }


def main() -> None:
    pdfmetrics.registerFont(TTFont("WOEK-Regular", str(REGULAR)))
    pdfmetrics.registerFont(TTFont("WOEK-Bold", str(BOLD)))
    pdfmetrics.registerFont(TTFont("WOEK-Italic", str(ITALIC)))
    predecessors = archive_predecessors()
    records = [build_one(item, predecessors) for item in CONFIG]
    report = {
        "date": "2026-10-13",
        "status": "PASS",
        "sourcePolicy": "Corrected normalized source; historical predecessors retained outside the public tree",
        "records": records,
        "totals": {"publicPdfs": len(records) * 2, "uniqueEditions": len(records), "pages": sum(int(r["pages"]) for r in records)},
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS", **report["totals"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
