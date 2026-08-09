#!/usr/bin/env python3
"""Importiert die überarbeitete Journalfassung zur Wahl-O-Mat-Methodenkritik.

Aufruf:
SOURCE_DOCX=/absoluter/pfad.docx TITLE_IMAGE=/absoluter/pfad.png \\
python3 scripts/import/import-wahlomat-methodenkritik-journal.py
"""
from __future__ import annotations

import html
import json
import os
import shutil
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DOCX = Path(os.environ["SOURCE_DOCX"])
TITLE_IMAGE = Path(os.environ["TITLE_IMAGE"])
SLUG = "wahl-o-mat-methodenkritik-sachsen-anhalt-2026"
TITLE = "Wenn Ja und Nein nicht dasselbe meinen"
SUBTITLE = "Was der Wahl-O-Mat tatsächlich misst, wo seine Methodik an Grenzen stößt – und warum seine Fragen selbst politische Wirkung entfalten können"
DESCRIPTION = "Eine vollumfassende wirkungsökonomische Methodenkritik am Wahl-O-Mat Sachsen-Anhalt 2026: Entscheidungsreife, Auswahl, Rechenlogik, Kompetenzebenen, Demokratiekontext und strategische Robustheit."
DATE = "9. August 2026"
DATE_ISO = "2026-08-09T09:30:00+02:00"
IMAGE = "2026-08-09-wahl-o-mat-methodenkritik-sachsen-anhalt-2026.png"
IMAGE_ALT = "Methodenkritik zum Wahl-O-Mat: Eine These kann unterschiedliche plausible Bedeutungen und Antworten auslösen."
ARTICLE = ROOT / "blog" / f"{SLUG}.html"
ASSETS = ROOT / "assets" / "img" / "blog"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{%s}" % NS["w"]


def esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def text(el: ET.Element) -> str:
    return "".join(node.text or "" for node in el.findall(".//w:t", NS)).strip()


def style(el: ET.Element) -> str:
    value = el.find("w:pPr/w:pStyle", NS)
    return value.get(W + "val", "Normal") if value is not None else "Normal"


def paragraph_html(el: ET.Element) -> str:
    output = []
    for run in el.findall("w:r", NS):
        value = "".join(node.text or "" for node in run.findall(".//w:t", NS))
        if not value:
            continue
        value = esc(value)
        props = run.find("w:rPr", NS)
        if props is not None and props.find("w:b", NS) is not None:
            value = f"<strong>{value}</strong>"
        if props is not None and props.find("w:i", NS) is not None:
            value = f"<em>{value}</em>"
        output.append(value)
    rendered = "".join(output)
    # Preserve content stored in Word hyperlink/smart-content wrappers.
    return rendered if html.unescape(rendered) == text(el) else esc(text(el))


def rows(table: ET.Element) -> list[list[str]]:
    return [
        [" ".join(text(p) for p in cell.findall("w:p", NS) if text(p)).strip() for cell in row.findall("w:tc", NS)]
        for row in table.findall("w:tr", NS)
    ]


def callout_cell_html(cell: ET.Element) -> str:
    paragraph = cell.find("w:p", NS)
    if paragraph is None:
        return esc(text(cell))
    parts = ["".join(node.text or "" for node in run.findall(".//w:t", NS)) for run in paragraph.findall("w:r", NS)]
    parts = [part for part in parts if part]
    if len(parts) < 2:
        value = text(cell)
        for label in ("Die zentrale These dieses Artikels", "Methodischer Hinweis", "Die einfache Korrektur", "Wichtig", "Kurz gesagt"):
            if value.startswith(label):
                return f"<strong>{esc(label)}</strong> {esc(value[len(label):])}"
        return esc(value)
    # The Word source uses adjacent styled runs for callout labels and body text
    # without a literal whitespace run between them.
    return f"<strong>{esc(parts[0])}</strong> {esc(''.join(parts[1:]))}"


def table_html(table: ET.Element) -> str:
    values = [row for row in rows(table) if any(row)]
    if not values:
        return ""
    if len(values) == 1 and len(values[0]) == 1:
        cell = table.find(".//w:tc", NS)
        return f"          <blockquote><p>{callout_cell_html(cell) if cell is not None else esc(values[0][0])}</p></blockquote>"
    if len(values[0]) == 2:
        body = "\n".join(
            f"              <tr><th scope=\"row\">{esc(row[0])}</th><td>{esc(row[1] if len(row) > 1 else '')}</td></tr>"
            for row in values
        )
        return f'''          <div class="table-scroll"><table><tbody>
{body}
          </tbody></table></div>'''
    header, *body = values
    head = "".join(f'<th scope="col">{esc(cell)}</th>' for cell in header)
    rendered_rows = "\n".join(
        "              <tr>" + "".join(f"<td>{esc(cell)}</td>" for cell in row) + "</tr>"
        for row in body
    )
    return f'''          <div class="table-scroll"><table><thead><tr>{head}</tr></thead><tbody>
{rendered_rows}
          </tbody></table></div>'''


def copy_asset() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    target = ASSETS / IMAGE
    if TITLE_IMAGE.resolve() != target.resolve():
        shutil.copy2(TITLE_IMAGE, target)


def render_content() -> str:
    with ZipFile(SOURCE_DOCX) as doc:
        body = ET.fromstring(doc.read("word/document.xml")).find("w:body", NS)
    assert body is not None
    output: list[str] = []
    active = False
    for child in body:
        if child.tag == W + "p":
            raw, kind = text(child), style(child)
            if not active:
                if kind == "Heading1" and raw == "Executive Summary":
                    active = True
                else:
                    continue
            if not raw:
                continue
            if kind == "Heading1":
                output.append(f"          <h2>{esc(raw)}</h2>")
            elif kind == "Heading2":
                output.append(f"          <h3>{esc(raw)}</h3>")
            elif kind == "Callout":
                output.append(f"          <blockquote><p>{paragraph_html(child)}</p></blockquote>")
            elif kind == "Small":
                output.append(f"          <p class=\"small-text\">{paragraph_html(child)}</p>")
            else:
                output.append(f"          <p>{paragraph_html(child)}</p>")
        elif active and child.tag == W + "tbl":
            table_rows = rows(child)
            rendered = table_html(child)
            if rendered:
                output.append(rendered)
    return "\n".join(output)


def shell() -> tuple[str, str]:
    source = (ROOT / "blog" / "wahl-o-mat-sachsen-anhalt-2026.html").read_text(encoding="utf-8")
    header_start = source.index('    <header class="site-header"')
    main_start = source.index("    <main", header_start)
    main_end = source.rindex("</main>")
    return source[header_start:main_start], source[main_end + len("</main>"):]


def write_article() -> None:
    header, footer = shell()
    tags = ["Wahl-O-Mat", "Sachsen-Anhalt", "politische Bildung", "Methodenkritik", "Agenda-Setting", "Framing", "Wirkungspotenzial", "Wirkpfad", "Demokratie", "Verfassung"]
    tags_html = "".join(f'<meta property="article:tag" content="{esc(tag)}">' for tag in tags)
    schema = {
        "@context": "https://schema.org", "@type": "Article", "headline": TITLE,
        "alternativeHeadline": SUBTITLE, "description": DESCRIPTION,
        "url": f"https://wirkungsoekonomie.de/blog/{SLUG}.html",
        "image": f"https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}",
        "datePublished": DATE_ISO, "dateModified": DATE_ISO, "inLanguage": "de",
        "author": {"@type": "Person", "name": "Natalie Weber", "url": "https://wirkungsoekonomie.de/natalie-weber.html"},
        "publisher": {"@type": "Organization", "name": "Wirkungsökonomie", "url": "https://wirkungsoekonomie.de"},
        "articleSection": "Wirkung und Demokratie", "keywords": tags,
    }
    ARTICLE.write_text(f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)} - Journal der Wirkungsökonomie</title><meta name="description" content="{esc(DESCRIPTION)}"><meta name="search_title" content="{esc(TITLE)}"><meta name="search_description" content="{esc(DESCRIPTION)}"><meta name="search_section" content="Journal"><meta name="search_type" content="Journalartikel"><meta name="search_index_kind" content="journal"><meta name="search_tags" content="{esc(', '.join(tags))}"><link rel="canonical" href="https://wirkungsoekonomie.de/blog/{SLUG}.html"><meta property="og:type" content="article"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Wirkungsökonomie"><meta property="og:title" content="{esc(TITLE)}"><meta property="og:description" content="{esc(DESCRIPTION)}"><meta property="og:url" content="https://wirkungsoekonomie.de/blog/{SLUG}.html"><meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}"><meta property="og:image:alt" content="{esc(IMAGE_ALT)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(TITLE)}"><meta name="twitter:description" content="{esc(DESCRIPTION)}"><meta name="twitter:image" content="https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}"><meta property="article:published_time" content="{DATE_ISO}"><meta property="article:modified_time" content="{DATE_ISO}"><meta property="article:section" content="Wirkung und Demokratie">{tags_html}<link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml"><link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head><body>
{header}    <main data-pagefind-body><article class="hero"><div class="hero-copy"><p class="hero-kicker">Wirkung und Demokratie · {DATE} · 23 Min.</p><h1 class="hero-title">{esc(TITLE)}</h1><p class="hero-subtitle">{esc(SUBTITLE)}</p><p class="journal-pdf-download-row no-print" data-search-exclude><a class="btn btn-secondary journal-pdf-download" data-journal-pdf-download href="../assets/pdf/journal/{SLUG}.pdf" download>PDF herunterladen</a></p><p class="meta">Von Natalie Weber · Begründerin der Wirkungsökonomie</p></div><figure class="hero-system-visual article-visual"><img src="../assets/img/blog/{IMAGE}" width="1672" height="941" alt="{esc(IMAGE_ALT)}" decoding="async" fetchpriority="high"></figure></article><section class="article-page"><div class="article-body"><div class="status-note"><strong>Kernbefund:</strong> Von 38 Thesen sind nach dem verwendeten Prüfraster nur 10 klar entscheidungsreif. Bei 28 müssen Nutzer:innen relevante Bedingungen ergänzen; 15 sind so offen, dass plausible Ausgestaltungen zu gegensätzlichen Bewertungen führen können. Diese Analyse ist keine Wahlempfehlung und unterstellt weder Parteien noch der Wahl-O-Mat-Redaktion eine unbelegte Absicht.</div>
{render_content()}
          <p><strong>Vollständiger Folgencheck:</strong> Die wirkungsökonomische Einordnung aller 38 Thesen findet sich im <a class="text-link" href="wahl-o-mat-sachsen-anhalt-2026.html">Wahl-O-Mat Sachsen-Anhalt 2026</a>.</p><p><strong>Weiterlesen:</strong> <a class="text-link" href="../begriffe/wirkungspotenzial/">Wirkungspotenzial</a>, <a class="text-link" href="../begriffe/wirkpfad/">Wirkpfad</a>, <a class="text-link" href="../begriffe/wirkungsrisiko/">Wirkungsrisiko</a> und <a class="text-link" href="../begriffe/positive-netto-wirkung/">positive Netto-Wirkung</a>.</p><p><a class="text-link" href="../blog.html">Zurück zum Journal</a></p></div></section></main>
{footer}''', encoding="utf-8")


if __name__ == "__main__":
    if not SOURCE_DOCX.is_file() or not TITLE_IMAGE.is_file():
        raise FileNotFoundError("SOURCE_DOCX und TITLE_IMAGE müssen auf vorhandene Dateien zeigen.")
    copy_asset()
    write_article()
