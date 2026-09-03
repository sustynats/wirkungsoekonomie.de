#!/usr/bin/env python3
"""Importiert die freigegebene Journalfassung zum Wahl-O-Mat Sachsen-Anhalt 2026.

Aufruf:
SOURCE_DOCX=/absoluter/pfad.docx TITLE_IMAGE=/absoluter/pfad.png \\
python3 scripts/import/import-wahlomat-sachsen-anhalt-journal.py
"""
from __future__ import annotations

import html
import json
import os
import re
import shutil
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DOCX = Path(os.environ["SOURCE_DOCX"])
TITLE_IMAGE = Path(os.environ["TITLE_IMAGE"])
SLUG = "wahl-o-mat-sachsen-anhalt-2026"
TITLE = "Wahl-O-Mat Sachsen-Anhalt 2026"
SUBTITLE = "Wirkungsökonomische Einordnung aller 38 Thesen"
DESCRIPTION = "Eine wirkungsökonomische Einordnung der 38 Thesen des Wahl-O-Mat Sachsen-Anhalt 2026: Wirkungspotenziale, Risiken, Wirkungspfade und Zielkonflikte statt Parteienempfehlung."
DATE = "8. August 2026"
DATE_ISO = "2026-08-08T12:00:00+02:00"
IMAGE = "2026-08-08-wahl-o-mat-sachsen-anhalt-2026.png"
IMAGE_ALT = "Karte von Sachsen-Anhalt mit Wahlzettel und Wirkungsrad für Mensch, Planet und Demokratie."
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
    # Word stores some phrases inside hyperlinks and smart-content wrappers;
    # those runs are not direct children of the paragraph.  Preserve the full
    # published wording rather than dropping those phrases for partial styling.
    if html.unescape(rendered) != text(el):
        return esc(text(el))
    return rendered


def rows(table: ET.Element) -> list[list[str]]:
    return [
        [" ".join(text(p) for p in cell.findall("w:p", NS) if text(p)).strip() for cell in row.findall("w:tc", NS)]
        for row in table.findall("w:tr", NS)
    ]


def table_html(table: ET.Element) -> str:
    values = [row for row in rows(table) if any(row)]
    if not values:
        return ""
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
    body_html = "\n".join(
        "              <tr>" + "".join(f"<td>{esc(cell)}</td>" for cell in row) + "</tr>"
        for row in body
    )
    return f'''          <div class="table-scroll"><table><thead><tr>{head}</tr></thead><tbody>
{body_html}
          </tbody></table></div>'''


def copy_assets() -> None:
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
                if kind == "Heading1" and raw == "Wie diese Bewertung funktioniert":
                    active = True
                else:
                    continue
            if not raw:
                continue
            if kind == "Heading1":
                # The original heading is rephrased for a public-facing source list.
                if raw == "Methodische und redaktionelle Quellen":
                    raw = "Quellen und methodische Hinweise"
                output.append(f"          <h2>{esc(raw)}</h2>")
            elif kind == "Heading2":
                output.append(f"          <h3>{esc(raw)}</h3>")
            elif kind == "CalloutWÖk":
                output.append(f"          <blockquote><p>{paragraph_html(child)}</p></blockquote>")
            elif raw.startswith("Fachlicher Anker:"):
                output.append(f"          <p class=\"source-entry\">{paragraph_html(child)}</p>")
            elif raw.startswith("WÖk-Vertiefung:"):
                output.append(f"          <p class=\"small-text\">{paragraph_html(child)}</p>")
            else:
                output.append(f"          <p>{paragraph_html(child)}</p>")
        elif active and child.tag == W + "tbl":
            rendered = table_html(child)
            if rendered:
                output.append(rendered)
    return "\n".join(output)


def shell() -> tuple[str, str]:
    source = (ROOT / "blog" / "atomkraft-wetterabhaengigkeit-hinter-beton.html").read_text(encoding="utf-8")
    header_start = source.index('    <header class="site-header"')
    main_start = source.index("    <main", header_start)
    main_end = source.rindex("    </main>")
    return source[header_start:main_start], source[main_end + len("    </main"):]


def write_article() -> None:
    header, footer = shell()
    schema = {
        "@context": "https://schema.org", "@type": "Article", "headline": TITLE,
        "alternativeHeadline": SUBTITLE, "description": DESCRIPTION,
        "url": f"https://wirkungsoekonomie.de/blog/{SLUG}.html",
        "image": f"https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}",
        "datePublished": DATE_ISO, "dateModified": DATE_ISO, "inLanguage": "de",
        "author": {"@type": "Person", "name": "Natalie Weber", "url": "https://wirkungsoekonomie.de/natalie-weber.html"},
        "publisher": {"@type": "Organization", "name": "Wirkungsökonomie", "url": "https://wirkungsoekonomie.de"},
        "articleSection": "Wirkung und Demokratie",
        "keywords": ["Wahl-O-Mat", "Sachsen-Anhalt", "Wirkungsökonomie", "Wirkungspotenzial", "Wirkungsrisiko", "Demokratie", "positive Netto-Wirkung"],
    }
    tags = ["Wahl-O-Mat", "Sachsen-Anhalt", "Wirkung und Demokratie", "Wirkungspotenzial", "Wirkungsrisiko", "positive Netto-Wirkung", "Wirkungspfade"]
    tags_html = "".join(f'<meta property="article:tag" content="{esc(tag)}">' for tag in tags)
    ARTICLE.write_text(f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)} - Journal der Wirkungsökonomie</title><meta name="description" content="{esc(DESCRIPTION)}"><meta name="search_title" content="{esc(TITLE)}"><meta name="search_description" content="{esc(DESCRIPTION)}"><meta name="search_section" content="Journal"><meta name="search_type" content="Journalartikel"><meta name="search_index_kind" content="journal"><meta name="search_tags" content="{esc(', '.join(tags))}"><link rel="canonical" href="https://wirkungsoekonomie.de/blog/{SLUG}.html"><meta property="og:type" content="article"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Wirkungsökonomie"><meta property="og:title" content="{esc(TITLE)}"><meta property="og:description" content="{esc(DESCRIPTION)}"><meta property="og:url" content="https://wirkungsoekonomie.de/blog/{SLUG}.html"><meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}"><meta property="og:image:alt" content="{esc(IMAGE_ALT)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(TITLE)}"><meta name="twitter:description" content="{esc(DESCRIPTION)}"><meta name="twitter:image" content="https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}"><meta property="article:published_time" content="{DATE_ISO}"><meta property="article:modified_time" content="{DATE_ISO}"><meta property="article:section" content="Wirkung und Demokratie">{tags_html}<link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml"><link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head><body>
{header}    <main data-pagefind-body><article class="hero"><div class="hero-copy"><p class="hero-kicker">Wirkung und Demokratie · {DATE} · 58 Min.</p><h1 class="hero-title">{esc(TITLE)}</h1><p class="hero-subtitle">{esc(SUBTITLE)}</p><p class="journal-pdf-download-row no-print" data-search-exclude><a class="btn btn-secondary journal-pdf-download" data-journal-pdf-download href="../assets/pdf/journal/{SLUG}.pdf" download>PDF herunterladen</a></p><p class="meta">Von Natalie Weber · Begründerin der Wirkungsökonomie</p></div><figure class="hero-system-visual article-visual"><img src="../assets/img/blog/{IMAGE}" width="1280" height="720" alt="{esc(IMAGE_ALT)}" decoding="async" fetchpriority="high"></figure></article><section class="article-page"><div class="article-body"><div class="status-note"><strong>Methodische Einordnung:</strong> Dieser Beitrag ist keine Wahlempfehlung und keine Bewertung von Personen oder Parteien. Er prüft die Formulierung der 38 Wahl-O-Mat-Thesen, ihre Voraussetzungen sowie plausible Wirkungspotenziale, Wirkungsrisiken und Wirkungspfade im Referenzrahmen Mensch, Planet und Demokratie.</div>
{render_content()}
          <p><strong>Weiterlesen:</strong> <a class="text-link" href="../begriffe/wirkungspotenzial/">Wirkungspotenzial</a>, <a class="text-link" href="../begriffe/wirkungsrisiko/">Wirkungsrisiko</a>, <a class="text-link" href="../begriffe/wirkpfad/">Wirkpfad</a> und <a class="text-link" href="../begriffe/positive-netto-wirkung/">positive Netto-Wirkung</a>.</p><p><a class="text-link" href="../blog.html">Zurück zum Journal</a></p></div></section></main>
{footer}''', encoding="utf-8")


if __name__ == "__main__":
    if not SOURCE_DOCX.is_file() or not TITLE_IMAGE.is_file():
        raise FileNotFoundError("SOURCE_DOCX und TITLE_IMAGE müssen auf vorhandene Dateien zeigen.")
    copy_assets()
    write_article()
