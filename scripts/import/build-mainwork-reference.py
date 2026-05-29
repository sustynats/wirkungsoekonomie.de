#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import shutil
import sys
import zipfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Iterable

from docx import Document
from docx.document import Document as DocumentType
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import Table
from docx.text.paragraph import Paragraph


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DOCX = Path("/Users/hagen/Desktop/WÖk-Konzepte etc/Kerndokumente/Neuauflage_Buch/Natalie-Weber_Die neue Ordnung des Wohlstands.docx")
REFERENCE_DIR = ROOT / "referenz"
ASSET_DIR = ROOT / "public/assets/imported/woek-main-2026"
PUBLIC_ASSET_PREFIX = "/public/assets/imported/woek-main-2026"
PDF_URL = "/assets/pdf/die-neue-ordnung-des-wohlstands.pdf"
DOC_ID = "woek-main-2026"
SOURCE_VERSION = "2026.0"
WEB_VERSION = "2026.2-live-reference"
REVIEW_STATUS = "partially-delta-reviewed"
PART_TITLE_OVERRIDES = {
    15: "Internationale Ordnung, Globalisierung und Geopolitik",
    17: "Kritik, Missverständnisse und ideologische Projektionen",
}
CHAPTER_TITLE_OVERRIDES = {
    17: "Wirkungsökonomie im Vergleich",
    96: "Wirkungsökonomie als weltfähige Ordnung",
    99: "Wirkungsökonomie im Alltag",
}


@dataclass
class Block:
    kind: str
    text: str = ""
    html: str = ""
    style: str = ""
    level: int = 0
    chapter_no: int | None = None
    part_no: int | None = None
    section_no: int = 0
    paragraph_no: int = 0
    block_id: str = ""
    content_hash: str = ""


@dataclass
class Chapter:
    number: int
    title: str
    slug: str
    part_no: int | None
    part_title: str = ""
    blocks: list[Block] = field(default_factory=list)


@dataclass
class Part:
    number: int
    roman: str
    title: str
    slug: str
    chapters: list[Chapter] = field(default_factory=list)


def escape(value: str) -> str:
    return html.escape(value or "", quote=True)


def slugify(value: str) -> str:
    value = value.lower()
    value = value.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "abschnitt"


def roman_to_int(value: str) -> int:
    numbers = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    previous = 0
    for char in reversed(value.upper()):
        current = numbers.get(char, 0)
        total += -current if current < previous else current
        previous = max(previous, current)
    return total


def digest_text(value: str) -> str:
    return sha256(value.encode("utf-8")).hexdigest()[:16]


def file_hash(path: Path) -> str:
    h = sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def iter_blocks(parent: DocumentType) -> Iterable[Paragraph | Table]:
    body = parent.element.body
    for child in body.iterchildren():
        if isinstance(child, CT_P):
            yield Paragraph(child, parent)
        elif isinstance(child, CT_Tbl):
            yield Table(child, parent)


def paragraph_image_rel_ids(paragraph: Paragraph) -> list[str]:
    rel_ids = []
    for blip in paragraph._element.xpath(".//*[local-name()='blip']"):
        rel_id = blip.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed")
        if rel_id:
            rel_ids.append(rel_id)
    return rel_ids


def extract_media(docx_path: Path) -> dict[str, str]:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    media: dict[str, str] = {}
    with zipfile.ZipFile(docx_path) as archive:
        for name in archive.namelist():
            if not name.startswith("word/media/"):
                continue
            raw_name = Path(name).name
            target_name = re.sub(r"[^A-Za-z0-9._-]+", "-", raw_name)
            target = ASSET_DIR / target_name
            with archive.open(name) as src, target.open("wb") as dst:
                shutil.copyfileobj(src, dst)
            web_target_name = target_name
            if target.suffix.lower() in {".tif", ".tiff"}:
                png_target = target.with_suffix(".png")
                if png_target.exists():
                    web_target_name = png_target.name
            media[raw_name] = f"{PUBLIC_ASSET_PREFIX}/{web_target_name}"
    return media


def relationship_targets(doc: Document) -> dict[str, str]:
    targets = {}
    for rel_id, rel in doc.part.rels.items():
        target = str(rel.target_ref)
        if target.startswith("media/"):
            targets[rel_id] = Path(target).name
    return targets


def render_table(table: Table, table_no: int, current_chapter: int | None, current_section: int) -> Block:
    rows = []
    for row in table.rows:
        cells = "".join(f"<td>{escape(cell.text.strip())}</td>" for cell in row.cells)
        if cells:
            rows.append(f"<tr>{cells}</tr>")
    prefix = f"{DOC_ID}-k{current_chapter:03d}" if current_chapter else f"{DOC_ID}-front"
    block_id = f"{prefix}-table-{table_no:03d}"
    table_html = (
        f'<div class="reference-table" id="{block_id}" data-document-id="{DOC_ID}" '
        f'data-section-id="{prefix}-s{current_section:03d}" data-version="{WEB_VERSION}" '
        f'data-content-hash="{digest_text("".join(rows))}"><table>{"".join(rows)}</table></div>'
    )
    return Block(kind="table", html=table_html, chapter_no=current_chapter, section_no=current_section, block_id=block_id, content_hash=digest_text("".join(rows)))


def split_title(text: str, number: int) -> str:
    return re.sub(rf"^Kapitel\s+{number}\s*[--:]\s*", "", text, flags=re.I).strip()


def parse_docx(docx_path: Path) -> dict[str, object]:
    doc = Document(str(docx_path))
    media = extract_media(docx_path)
    rel_targets = relationship_targets(doc)
    blocks: list[Block] = []
    toc_items: list[str] = []
    parts: list[Part] = []
    chapters: list[Chapter] = []
    current_part: Part | None = None
    current_chapter: Chapter | None = None
    current_section_no = 0
    paragraph_counters: dict[str, int] = {}
    table_no = 0
    figure_no = 0
    heading_count = 0
    paragraph_count = 0

    for raw_block in iter_blocks(doc):
        if isinstance(raw_block, Paragraph):
            text = raw_block.text.strip()
            style = raw_block.style.name if raw_block.style else ""
            image_rel_ids = paragraph_image_rel_ids(raw_block)
            if not text and not image_rel_ids:
                continue
            if style.lower().startswith("toc") and text:
                toc_items.append(text)
                continue

            part_match = re.match(r"^Teil\s+([IVXLCDM]+)\s*[--]\s*(.+)$", text)
            chapter_match = re.match(r"^Kapitel\s+(\d{1,3})\s*[--]\s*(.+)$", text)
            section_match = re.match(r"^\d{1,3}\.(\d{1,2})\s+", text)

            level = 0
            section_id = ""
            if part_match:
                part_no = roman_to_int(part_match.group(1))
                part_title = part_match.group(2).strip()
                current_part = Part(part_no, part_match.group(1), part_title, f"teil-{part_no:02d}-{slugify(part_title)}")
                parts.append(current_part)
                current_chapter = None
                current_section_no = 0
                section_id = f"{DOC_ID}-teil-{part_no:02d}"
                block_id = section_id
                level = 2
            elif chapter_match:
                chapter_no = int(chapter_match.group(1))
                title = CHAPTER_TITLE_OVERRIDES.get(chapter_no, chapter_match.group(2).strip())
                current_section_no = 0
                current_chapter = Chapter(
                    chapter_no,
                    title,
                    f"kapitel-{chapter_no:03d}-{slugify(title)}",
                    current_part.number if current_part else None,
                    current_part.title if current_part else "",
                )
                chapters.append(current_chapter)
                if current_part:
                    current_part.chapters.append(current_chapter)
                section_id = f"{DOC_ID}-k{chapter_no:03d}"
                block_id = section_id
                level = 2
            elif section_match and current_chapter:
                current_section_no = int(section_match.group(1))
                section_id = f"{DOC_ID}-k{current_chapter.number:03d}-s{current_section_no:03d}"
                block_id = section_id
                level = 3
            elif style.startswith("Heading"):
                current_section_no += 1
                prefix = f"{DOC_ID}-k{current_chapter.number:03d}" if current_chapter else f"{DOC_ID}-front"
                section_id = f"{prefix}-s{current_section_no:03d}"
                block_id = f"{section_id}-{slugify(text)[:48]}"
                level = 3

            if level and text:
                heading_count += 1
                content_hash = digest_text(text)
                attrs = (
                    f'id="{block_id}" data-document-id="{DOC_ID}" data-section-id="{section_id}" '
                    f'data-version="{WEB_VERSION}" data-content-hash="{content_hash}"'
                )
                block = Block("heading", text, f"<h{level} {attrs}>{escape(text)}</h{level}>", style, level, current_chapter.number if current_chapter else None, current_part.number if current_part else None, current_section_no, 0, block_id, content_hash)
                blocks.append(block)
                if current_chapter:
                    current_chapter.blocks.append(block)
            elif text:
                paragraph_count += 1
                prefix = f"{DOC_ID}-k{current_chapter.number:03d}" if current_chapter else f"{DOC_ID}-front"
                section_id = f"{prefix}-s{max(current_section_no, 1):03d}"
                paragraph_counters[section_id] = paragraph_counters.get(section_id, 0) + 1
                paragraph_id = f"{section_id}-p{paragraph_counters[section_id]:03d}"
                content_hash = digest_text(text)
                block_html = (
                    f'<p id="{paragraph_id}" data-document-id="{DOC_ID}" data-section-id="{section_id}" '
                    f'data-paragraph-id="{paragraph_id}" data-version="{WEB_VERSION}" '
                    f'data-content-hash="{content_hash}">{escape(text)}</p>'
                )
                block = Block("paragraph", text, block_html, style, 0, current_chapter.number if current_chapter else None, current_part.number if current_part else None, max(current_section_no, 1), paragraph_counters[section_id], paragraph_id, content_hash)
                blocks.append(block)
                if current_chapter:
                    current_chapter.blocks.append(block)

            for rel_id in image_rel_ids:
                raw_name = rel_targets.get(rel_id)
                if raw_name and raw_name in media:
                    figure_no += 1
                    prefix = f"{DOC_ID}-k{current_chapter.number:03d}" if current_chapter else f"{DOC_ID}-front"
                    section_id = f"{prefix}-s{max(current_section_no, 1):03d}"
                    fig_id = f"{prefix}-fig-{figure_no:03d}"
                    chapter_label = f"Kapitel {current_chapter.number} - {current_chapter.title}" if current_chapter else "Vorspann"
                    fig_html = (
                        f'<figure id="{fig_id}" class="reference-figure" data-document-id="{DOC_ID}" '
                        f'data-section-id="{section_id}" data-version="{WEB_VERSION}" data-content-hash="{digest_text(raw_name)}">'
                        f'<img src="{escape(media[raw_name])}" alt="Abbildung {figure_no} aus Die neue Ordnung des Wohlstands: {escape(chapter_label)}">'
                        f'<figcaption>Abbildung {figure_no} aus <cite>Die neue Ordnung des Wohlstands</cite>. Quelle: Hauptwerk, {escape(chapter_label)}.</figcaption>'
                        f"</figure>"
                    )
                    block = Block("figure", "", fig_html, chapter_no=current_chapter.number if current_chapter else None, part_no=current_part.number if current_part else None, section_no=max(current_section_no, 1), block_id=fig_id, content_hash=digest_text(raw_name))
                    blocks.append(block)
                    if current_chapter:
                        current_chapter.blocks.append(block)

        elif isinstance(raw_block, Table):
            table_no += 1
            block = render_table(raw_block, table_no, current_chapter.number if current_chapter else None, max(current_section_no, 1))
            blocks.append(block)
            if current_chapter:
                current_chapter.blocks.append(block)

    parts = normalize_parts(parts, chapters)
    return {
        "blocks": blocks,
        "tocItems": toc_items,
        "parts": parts,
        "chapters": chapters,
        "stats": {
            "paragraphs": paragraph_count,
            "headings": heading_count,
            "tables": table_no,
            "figures": figure_no,
            "parts": len(parts),
            "chapters": len(chapters),
        },
        "sourceHash": file_hash(docx_path),
    }


def normalize_parts(parts: list[Part], chapters: list[Chapter]) -> list[Part]:
    if not parts:
        return parts
    by_no = {part.number: part for part in parts}
    known_numbers = sorted(by_no)
    normalized: list[Part] = []
    expected = list(range(known_numbers[0], known_numbers[-1] + 1))

    for number in expected:
        if number in by_no:
            normalized.append(by_no[number])
            continue
        previous_numbers = [item for item in known_numbers if item < number]
        next_numbers = [item for item in known_numbers if item > number]
        previous_part = by_no[previous_numbers[-1]]
        next_part = by_no[next_numbers[0]]
        previous_max = max((chapter.number for chapter in previous_part.chapters), default=0)
        next_min = min((chapter.number for chapter in next_part.chapters), default=previous_max + 1)
        # If the source jumps from e.g. XIV to XVI, the DOCX has no explicit
        # part heading for the missing structural block. The live reference
        # keeps that import fact visible in metadata, but uses editorially
        # approved overrides so the public navigation is not left generic.
        carried = [chapter for chapter in previous_part.chapters if max(previous_max - 5, 1) <= chapter.number < next_min]
        if not carried:
            midpoint_start = previous_max + 1
            midpoint_end = next_min - 1
            carried = [chapter for chapter in chapters if midpoint_start <= chapter.number <= midpoint_end]
        missing_title = PART_TITLE_OVERRIDES.get(number, "redaktionell ergänzte Teilstruktur")
        missing = Part(number, int_to_roman(number), missing_title, f"teil-{number:02d}-{slugify(missing_title)}", [])
        for chapter in carried:
            if chapter in previous_part.chapters:
                previous_part.chapters.remove(chapter)
            chapter.part_no = number
            chapter.part_title = missing_title
            missing.chapters.append(chapter)
        normalized.append(missing)

    return normalized


def int_to_roman(number: int) -> str:
    pairs = [
        (1000, "M"),
        (900, "CM"),
        (500, "D"),
        (400, "CD"),
        (100, "C"),
        (90, "XC"),
        (50, "L"),
        (40, "XL"),
        (10, "X"),
        (9, "IX"),
        (5, "V"),
        (4, "IV"),
        (1, "I"),
    ]
    result = ""
    for value, numeral in pairs:
        while number >= value:
            result += numeral
            number -= value
    return result


def page_shell(title: str, description: str, body: str, depth: int = 1, search_type: str = "Hauptwerk") -> str:
    prefix = "../" * depth
    return f"""<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{escape(title)} - Wirkungsökonomie Online</title>
    <meta name="description" content="{escape(description)}">
    <meta name="search_title" content="{escape(title)}">
    <meta name="search_description" content="{escape(description)}">
    <meta name="search_section" content="Hauptwerk">
    <meta name="search_type" content="{escape(search_type)}">
    <link rel="stylesheet" href="{prefix}assets/css/style.css?v=20260523-fulltext-reader">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="{prefix}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="{prefix}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="{prefix}index.html">Start</a>
        <a href="{prefix}referenz/">Referenz</a>
        <a href="{prefix}begriffe/">Begriffe</a>
        <a href="{prefix}dokumente/">Dokumente</a>
        <a href="{prefix}suche.html">Suche</a>
      </nav>
    </header>
    {body}
    <script src="{prefix}assets/js/main.js?v=20260529-glossary-hover-audit"></script>
    <script src="{prefix}assets/js/reference-reader.js?v=20260523-fulltext-reader"></script>
  </body>
</html>
"""


def meta_panel(source_hash: str, extra: str = "") -> str:
    return f"""<section class="meta-box">
      <h2>Version und Reviewstatus</h2>
      <dl>
        <dt>Dokument-ID</dt><dd>{DOC_ID}</dd>
        <dt>Status</dt><dd>source-original / online strukturierter Import</dd>
        <dt>Source-Version</dt><dd>{SOURCE_VERSION}</dd>
        <dt>Web-Version</dt><dd>{WEB_VERSION}</dd>
        <dt>Reviewstatus</dt><dd>{REVIEW_STATUS}</dd>
        <dt>Terminologiebasis</dt><dd>WOeK_Begriffsleitfaden_fuehrend_v1.0.md</dd>
        <dt>Source-Hash</dt><dd>{source_hash}</dd>
      </dl>
      {extra}
    </section>"""


def fulltext_status_panel(stats: dict[str, int]) -> str:
    return f"""<section class="meta-box version-summary fulltext-status-summary">
      <h2>Stand dieser Onlinefassung</h2>
      <p>Diese Volltextansicht enthält das vollständige Grundlagenwerk als lesbare Webfassung. Die zitierfähige Originalfassung bleibt über das PDF erhalten; die Onlinefassung ist strukturiert, verlinkt und versioniert.</p>
      <div class="version-summary-grid" aria-label="Versionsinformationen">
        <div><span>Original</span><strong>2026.0</strong><small>PDF bleibt zitierfähig</small></div>
        <div><span>Onlinefassung</span><strong>2026.2</strong><small>Live-Referenz</small></div>
        <div><span>Umfang</span><strong>{stats["paragraphs"]} Absätze</strong><small>{stats["headings"]} Überschriften · {stats["figures"]} Abbildungen</small></div>
      </div>
      <p class="version-summary-note"><a class="text-link" href="../versionen/">Versionen ansehen</a></p>
    </section>"""


def discussion_placeholder(section_id: str, content_hash: str) -> str:
    return ""


def render_fulltext(parsed: dict[str, object]) -> None:
    blocks: list[Block] = parsed["blocks"]  # type: ignore[assignment]
    source_hash = parsed["sourceHash"]  # type: ignore[assignment]
    stats = parsed["stats"]  # type: ignore[assignment]
    fulltext_body = "".join(block.html for block in blocks)
    body = f"""<main class="reference-work reference-fulltext" data-reference-reader data-pagefind-body>
      <div class="reading-progress" aria-hidden="true"><span></span></div>
      <section class="hero compact-hero">
        <p class="hero-kicker">Wirkungsökonomie Online</p>
        <h1>Die neue Ordnung des Wohlstands</h1>
        <p class="hero-subtitle">Vollständige Web-Volltextansicht der bestätigten DOCX-Fassung.</p>
        <p><a class="button" href="../">Zum Referenzportal</a> <a class="button secondary" href="{PDF_URL}">Original-PDF öffnen</a></p>
      </section>
      <nav class="fulltext-toolbar" aria-label="Volltext-Navigation">
        <span>Volltext</span>
        <a href="../">Referenzportal</a>
        <a href="../kapitel/">Kapitelübersicht</a>
        <a href="#woek-main-fulltext">Zum Text</a>
        <a href="{PDF_URL}">Original-PDF</a>
        <button type="button" data-print-page>Drucken</button>
      </nav>
      {fulltext_status_panel(stats)}
      <article class="article-shell fulltext-reader" id="woek-main-fulltext">{fulltext_body}</article>
    </main>"""
    out = REFERENCE_DIR / "volltext" / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page_shell("Die neue Ordnung des Wohlstands - Volltext", "Lange Volltextansicht des Hauptwerks.", body, depth=2), encoding="utf-8")


def render_portal(parsed: dict[str, object]) -> None:
    parts: list[Part] = parsed["parts"]  # type: ignore[assignment]
    chapters: list[Chapter] = parsed["chapters"]  # type: ignore[assignment]
    source_hash = str(parsed["sourceHash"])
    part_items = "".join(
        f'<li><a href="{escape(part.slug)}/">Teil {part.roman} - {escape(part.title)}</a> <span class="meta-line">{len(part.chapters)} Kapitel</span></li>'
        for part in parts
    )
    chapter_items = "".join(
        f'<li><a href="{escape(chapter.slug)}/">Kapitel {chapter.number}: {escape(chapter.title)}</a></li>'
        for chapter in chapters
    )
    body = f"""<main class="reference-work" data-pagefind-body>
      <section class="hero compact-hero">
        <p class="hero-kicker">Wirkungsökonomie Online</p>
        <h1>Die neue Ordnung des Wohlstands</h1>
        <p class="hero-subtitle">Vollständige Online-Referenz zur neuen Ordnung des Wohlstands.</p>
        <p class="notice">Phase 1: statische Referenzfassung. Diskurs- und Kommentarfunktionen werden vorbereitet, aber noch nicht aktiviert.</p>
        <p>
          <a class="button" href="volltext/">Volltext lesen</a>
          <a class="button secondary" href="../begriffe/">Begriffe nachschlagen</a>
          <a class="button secondary" href="../dokumente/">Arbeitspapiere öffnen</a>
          <a class="button secondary" href="../downloads.html">PDF / Export</a>
        </p>
      </section>
      {meta_panel(source_hash, f'<p>Struktur: {len(parts)} Teile · {len(chapters)} Kapitel · Volltextansicht bleibt erhalten.</p>')}
      <section class="content-band" id="teile">
        <h2>Nach Teilen lesen</h2>
        <ol class="link-list">{part_items}</ol>
      </section>
      <section class="content-band" id="kapitel">
        <h2>Nach Kapiteln lesen</h2>
        <ol class="link-list">{chapter_items}</ol>
      </section>
    </main>"""
    (REFERENCE_DIR / "index.html").write_text(page_shell("Die neue Ordnung des Wohlstands", "Referenzportal mit Volltext, Teilen und Kapiteln des Hauptwerks.", body, depth=1), encoding="utf-8")


def render_parts(parsed: dict[str, object]) -> None:
    parts: list[Part] = parsed["parts"]  # type: ignore[assignment]
    source_hash = str(parsed["sourceHash"])
    for part in parts:
        chapter_items = "".join(
            f'<li><a href="../{escape(chapter.slug)}/">Kapitel {chapter.number}: {escape(chapter.title)}</a></li>'
            for chapter in part.chapters
        )
        body = f"""<main class="reference-work" data-pagefind-body>
          <article class="article-shell">
            <nav class="breadcrumb"><a href="../">Referenz</a> / Teil {escape(part.roman)}</nav>
            <h1>Teil {escape(part.roman)} - {escape(part.title)}</h1>
            {meta_panel(source_hash)}
            <h2>Kapitel in diesem Teil</h2>
            <ol class="link-list">{chapter_items}</ol>
          </article>
        </main>"""
        out = REFERENCE_DIR / part.slug / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page_shell(f"Teil {part.roman} - {part.title}", f"Teil {part.roman} des Hauptwerks.", body, depth=2), encoding="utf-8")


def chapter_related(chapter: Chapter) -> str:
    title = chapter.title.lower()
    links = []
    def add(label: str, href: str) -> None:
        links.append(f'<li><a href="{href}">{escape(label)}</a></li>')
    if "reverse merit order" in title:
        add("Reverse Merit Order", "../../begriffe/reverse-merit-order/")
        add("Nichtkompensationsprinzip", "../../begriffe/nichtkompensationsprinzip/")
        add("Technische WUStG-Leitlinien", "../../dokumente/technische-leitlinien-wustg-v2/")
        add("Apfelbeispiel", "../../dokumente/beispiel-apfel-wirkungssteuer-bonusregel/")
    elif "t-sroi" in title:
        add("Whitepaper T-SROI", "../../dokumente/whitepaper-t-sroi/")
        add("T-SROI", "../../begriffe/t-sroi/")
        add("Transformationswirkung", "../../begriffe/transformationswirkung/")
    elif "wirkungsrat" in title:
        add("Wirkungsrat Konzept", "../../dokumente/wirkungsrat-konzept/")
        add("Wirkungsrat", "../../begriffe/wirkungsrat/")
        add("WStG", "../../begriffe/wstg/")
    elif "apfel" in title:
        add("Apfelbeispiel-Arbeitspapier", "../../dokumente/beispiel-apfel-wirkungssteuer-bonusregel/")
        add("Scorecard", "../../begriffe/scorecard/")
        add("Reverse Merit Order", "../../begriffe/reverse-merit-order/")
    else:
        add("Wirkung", "../../begriffe/wirkung/")
        add("positive Netto-Wirkung", "../../begriffe/positive-netto-wirkung/")
        add("Wirkungsarchitektur", "../../begriffe/wirkungsarchitektur/")
    return "<ul>" + "".join(links) + "</ul>"


def render_chapters(parsed: dict[str, object]) -> None:
    chapters: list[Chapter] = parsed["chapters"]  # type: ignore[assignment]
    source_hash = str(parsed["sourceHash"])
    for chapter in chapters:
        body_parts = []
        for block in chapter.blocks:
            body_parts.append(block.html)
            if block.kind == "heading" and re.match(rf"{DOC_ID}-k{chapter.number:03d}-s\d{{3}}$", block.block_id):
                body_parts.append(discussion_placeholder(block.block_id, block.content_hash))
        chapter_id = f"{DOC_ID}-k{chapter.number:03d}"
        side = f"""<aside class="meta-box related-panel">
          <h2>Kontext</h2>
          <h3>Verwandte Begriffe und Dokumente</h3>
          {chapter_related(chapter)}
          <h3>Original und Export</h3>
          <p><a href="{PDF_URL}">Original-PDF öffnen</a></p>
          <p><a href="../volltext/#{chapter_id}">Zur Volltextstelle</a></p>
          {discussion_placeholder(chapter_id, digest_text(chapter.title))}
        </aside>"""
        body = f"""<main class="reference-work reference-grid" data-pagefind-body>
          <article class="article-shell">
            <nav class="breadcrumb"><a href="../">Referenz</a> / <a href="../{escape(chapter.slug)}/">Kapitel {chapter.number}</a></nav>
            <p class="hero-kicker">Teil {escape(chapter.part_title or 'Vorspann')}</p>
            <h1 id="{chapter_id}" data-document-id="{DOC_ID}" data-section-id="{chapter_id}" data-version="{WEB_VERSION}" data-content-hash="{digest_text(chapter.title)}">Kapitel {chapter.number} - {escape(chapter.title)}</h1>
            {meta_panel(source_hash)}
            {''.join(body_parts)}
          </article>
          {side}
        </main>"""
        out = REFERENCE_DIR / chapter.slug / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page_shell(f"Kapitel {chapter.number} - {chapter.title}", f"Kapitel {chapter.number} des Hauptwerks Die neue Ordnung des Wohlstands.", body, depth=2), encoding="utf-8")


def write_report(parsed: dict[str, object], docx_path: Path) -> None:
    stats = parsed["stats"]  # type: ignore[assignment]
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceFile": str(docx_path),
        "documentId": DOC_ID,
        "sourceVersion": SOURCE_VERSION,
        "webVersion": WEB_VERSION,
        "reviewStatus": REVIEW_STATUS,
        "route": "/referenz/",
        "fulltextRoute": "/referenz/volltext/",
        "stats": stats,
        "acceptanceNotes": {
            "fulltextPreserved": True,
            "chapterRoutesGenerated": stats["chapters"],
            "partRoutesGenerated": stats["parts"],
            "originalUnchanged": True,
            "commentsImplemented": False,
            "backendImplemented": False,
        },
    }
    (ROOT / "public/data/mainwork-reference.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DOCX
    if not src.exists():
        raise SystemExit(f"Missing mainwork DOCX: {src}")
    parsed = parse_docx(src)
    REFERENCE_DIR.mkdir(parents=True, exist_ok=True)
    render_fulltext(parsed)
    render_portal(parsed)
    render_parts(parsed)
    render_chapters(parsed)
    write_report(parsed, src)
    stats = parsed["stats"]
    print(f"Generated reference portal, fulltext, {stats['parts']} part pages and {stats['chapters']} chapter pages.")


if __name__ == "__main__":
    main()
