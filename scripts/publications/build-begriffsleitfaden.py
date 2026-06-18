#!/usr/bin/env python3
from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Flowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.0.md"
ONLINE = ROOT / "content/documents/online/woek-begriffsleitfaden-fuehrend.inc"
PDF = ROOT / "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.0.pdf"

NAVY = colors.HexColor("#081126")
GREEN = colors.HexColor("#1f6b4f")
GOLD = colors.HexColor("#b6903d")
MUTED = colors.HexColor("#5f625f")
LINE = colors.HexColor("#d9d2c3")
BG = colors.HexColor("#fbfaf5")


def slugify(value: str) -> str:
    value = value.lower()
    replacements = {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"}
    for src, target in replacements.items():
        value = value.replace(src, target)
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "abschnitt"


def clean_md(md: str) -> str:
    return md.replace("\r\n", "\n").replace("\r", "\n").strip()


def inline_html(value: str) -> str:
    escaped = html.escape(value)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    return escaped


def inline_pdf(value: str) -> str:
    escaped = html.escape(value)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", escaped)
    escaped = re.sub(r"`([^`]+)`", r"<font name=\"Courier\">\1</font>", escaped)
    return escaped


def parse_blocks(md: str) -> list[dict]:
    lines = clean_md(md).split("\n")
    blocks: list[dict] = []
    i = 0

    def next_nonempty(index: int) -> int:
        while index < len(lines) and not lines[index].strip():
            index += 1
        return index

    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip() or line.strip() == "---":
            i += 1
            continue
        heading = re.match(r"^(#{1,4})\s+(.+)$", line)
        if heading:
            blocks.append({"type": "heading", "level": len(heading.group(1)), "text": heading.group(2).strip()})
            i += 1
            continue
        if line.startswith(">"):
            quote = []
            while i < len(lines) and lines[i].startswith(">"):
                quote.append(lines[i].lstrip(">").strip())
                i += 1
            blocks.append({"type": "quote", "text": " ".join(quote)})
            continue
        if re.match(r"^\|.+\|$", line):
            table = []
            while i < len(lines) and re.match(r"^\|.+\|$", lines[i].rstrip()):
                row = [cell.strip() for cell in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", cell) for cell in row):
                    table.append(row)
                i += 1
            if table:
                blocks.append({"type": "table", "rows": table})
            continue
        if re.match(r"^\s*[-*]\s+", line):
            items = []
            while i < len(lines):
                if not re.match(r"^\s*[-*]\s+", lines[i]):
                    break
                item = [re.sub(r"^\s*[-*]\s+", "", lines[i]).strip().rstrip()]
                i += 1
                while i < len(lines) and lines[i].startswith("   ") and not re.match(r"^\s*([-*]|\d+\.)\s+", lines[i]):
                    item.append(lines[i].strip())
                    i += 1
                items.append(" ".join(part for part in item if part))
                nxt = next_nonempty(i)
                if nxt < len(lines) and re.match(r"^\s*[-*]\s+", lines[nxt]):
                    i = nxt
                    continue
                break
            blocks.append({"type": "ul", "items": items})
            continue
        if re.match(r"^\s*\d+\.\s+", line):
            items = []
            while i < len(lines):
                if not re.match(r"^\s*\d+\.\s+", lines[i]):
                    break
                item = [re.sub(r"^\s*\d+\.\s+", "", lines[i]).strip().rstrip()]
                i += 1
                while i < len(lines) and lines[i].startswith("   ") and not re.match(r"^\s*([-*]|\d+\.)\s+", lines[i]):
                    item.append(lines[i].strip())
                    i += 1
                items.append(" ".join(part for part in item if part))
                nxt = next_nonempty(i)
                if nxt < len(lines) and re.match(r"^\s*\d+\.\s+", lines[nxt]):
                    i = nxt
                    continue
                break
            blocks.append({"type": "ol", "items": items})
            continue
        paragraph = [line.strip()]
        i += 1
        while i < len(lines):
            nxt = lines[i].rstrip()
            if not nxt.strip() or nxt.strip() == "---":
                break
            if re.match(r"^(#{1,4})\s+", nxt) or nxt.startswith(">") or re.match(r"^\|.+\|$", nxt) or re.match(r"^\s*([-*]|\d+\.)\s+", nxt):
                break
            paragraph.append(nxt.strip())
            i += 1
        blocks.append({"type": "paragraph", "text": " ".join(paragraph)})
    return blocks


def build_html(blocks: list[dict]) -> str:
    used: dict[str, int] = {}
    out = []
    for block in blocks:
        kind = block["type"]
        if kind == "heading":
            level = min(max(block["level"], 2), 4)
            text = block["text"]
            ident = slugify(text)
            used[ident] = used.get(ident, 0) + 1
            if used[ident] > 1:
                ident = f"{ident}-{used[ident]}"
            out.append(f'<h{level} id="{ident}">{inline_html(text)}</h{level}>')
        elif kind == "paragraph":
            out.append(f"<p>{inline_html(block['text'])}</p>")
        elif kind == "quote":
            out.append(f"<blockquote><p>{inline_html(block['text'])}</p></blockquote>")
        elif kind in {"ul", "ol"}:
            tag = kind
            out.append(f"<{tag}>" + "".join(f"<li>{inline_html(item)}</li>" for item in block["items"]) + f"</{tag}>")
        elif kind == "table":
            rows = block["rows"]
            head, body = rows[0], rows[1:]
            table = ["<div class=\"table-scroll\"><table class=\"data-table\"><thead><tr>"]
            table.append("".join(f"<th>{inline_html(cell)}</th>" for cell in head))
            table.append("</tr></thead><tbody>")
            for row in body:
                table.append("<tr>" + "".join(f"<td>{inline_html(cell)}</td>" for cell in row) + "</tr>")
            table.append("</tbody></table></div>")
            out.append("".join(table))
    return "\n".join(out) + "\n"


class HeaderFooter:
    def __call__(self, canvas, doc):
        canvas.saveState()
        width, height = A4
        canvas.setStrokeColor(LINE)
        canvas.line(18 * mm, height - 15 * mm, width - 18 * mm, height - 15 * mm)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(GREEN)
        canvas.drawString(18 * mm, height - 11 * mm, "WIRKUNGSOEKONOMIE")
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(MUTED)
        canvas.drawRightString(width - 18 * mm, 11 * mm, f"Führender Begriffsleitfaden v1.0 · Seite {doc.page}")
        canvas.restoreState()


def paragraph_style(styles, name: str, **kwargs) -> ParagraphStyle:
    parent = styles["BodyText"]
    return ParagraphStyle(name, parent=parent, **kwargs)


def table_flow(rows: list[list[str]], styles) -> Table:
    data = [[Paragraph(inline_pdf(cell), styles["TableCell"]) for cell in row] for row in rows]
    widths = [42 * mm] + [36 * mm] * max(0, len(data[0]) - 1)
    if len(widths) < len(data[0]):
        widths += [32 * mm] * (len(data[0]) - len(widths))
    tbl = Table(data, colWidths=widths[: len(data[0])], repeatRows=1, hAlign="LEFT")
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#edf4ef")),
        ("TEXTCOLOR", (0, 0), (-1, 0), NAVY),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return tbl


def build_pdf(blocks: list[dict]) -> None:
    PDF.parent.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("TitleWOeK", fontName="Times-Bold", fontSize=28, leading=32, textColor=NAVY, spaceAfter=10))
    styles.add(ParagraphStyle("SubtitleWOeK", fontName="Helvetica", fontSize=10, leading=14, textColor=MUTED, spaceAfter=18))
    styles.add(ParagraphStyle("H1WOeK", fontName="Times-Bold", fontSize=22, leading=26, textColor=NAVY, spaceBefore=14, spaceAfter=8))
    styles.add(ParagraphStyle("H2WOeK", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=GREEN, spaceBefore=12, spaceAfter=6))
    styles.add(ParagraphStyle("H3WOeK", fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=NAVY, spaceBefore=10, spaceAfter=4))
    styles.add(ParagraphStyle("BodyWOeK", fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=colors.HexColor("#20242a"), spaceAfter=6))
    styles.add(ParagraphStyle("QuoteWOeK", fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=GREEN, leftIndent=8 * mm, rightIndent=8 * mm, spaceBefore=6, spaceAfter=8, borderColor=GOLD, borderWidth=0, borderPadding=6, backColor=colors.HexColor("#f3f6ef")))
    styles.add(ParagraphStyle("TableCell", fontName="Helvetica", fontSize=7.2, leading=9.2, textColor=colors.HexColor("#20242a")))
    styles.add(ParagraphStyle("BulletWOeK", fontName="Helvetica", fontSize=9.2, leading=13, textColor=colors.HexColor("#20242a"), leftIndent=4 * mm))

    story: list[Flowable] = []
    title_seen = False
    for block in blocks:
        kind = block["type"]
        if kind == "heading":
            text = inline_pdf(block["text"])
            if block["level"] == 1 and not title_seen:
                story.append(Paragraph(text, styles["TitleWOeK"]))
                story.append(Paragraph("Version 1.0 · Stand 21. Mai 2026 · Führendes Referenzdokument", styles["SubtitleWOeK"]))
                title_seen = True
            elif block["level"] == 2:
                story.append(Paragraph(text, styles["H1WOeK"]))
            elif block["level"] == 3:
                story.append(Paragraph(text, styles["H2WOeK"]))
            else:
                story.append(Paragraph(text, styles["H3WOeK"]))
        elif kind == "paragraph":
            story.append(Paragraph(inline_pdf(block["text"]), styles["BodyWOeK"]))
        elif kind == "quote":
            story.append(Paragraph(inline_pdf(block["text"]), styles["QuoteWOeK"]))
        elif kind in {"ul", "ol"}:
            for index, item in enumerate(block["items"], start=1):
                marker = f"{index}." if kind == "ol" else "-"
                story.append(Paragraph(f"<b>{marker}</b> {inline_pdf(item)}", styles["BulletWOeK"]))
            story.append(Spacer(1, 2 * mm))
        elif kind == "table":
            story.append(table_flow(block["rows"], styles))
            story.append(Spacer(1, 4 * mm))

    doc = SimpleDocTemplate(
        str(PDF),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=22 * mm,
        bottomMargin=18 * mm,
        title="Führender Begriffsleitfaden der Wirkungsökonomie",
        author="Natalie Weber",
    )
    doc.build(story, onFirstPage=HeaderFooter(), onLaterPages=HeaderFooter())


def main() -> None:
    md = clean_md(SOURCE.read_text(encoding="utf-8"))
    blocks = parse_blocks(md)
    ONLINE.parent.mkdir(parents=True, exist_ok=True)
    ONLINE.write_text(build_html(blocks), encoding="utf-8")
    build_pdf(blocks)
    print(f"wrote {ONLINE.relative_to(ROOT)}")
    print(f"wrote {PDF.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
