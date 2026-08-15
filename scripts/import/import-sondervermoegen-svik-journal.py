#!/usr/bin/env python3
"""Importiert die freigegebene SVIK-Analyse als Journalbeitrag.

Aufruf:
SOURCE_DOCX=/absoluter/pfad.docx TITLE_IMAGE=/absoluter/pfad.png \
python3 scripts/import/import-sondervermoegen-svik-journal.py
"""
from __future__ import annotations

import html
import json
import os
import re
import shutil
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DOCX = Path(os.environ["SOURCE_DOCX"])
TITLE_IMAGE = Path(os.environ["TITLE_IMAGE"])
SLUG = "wie-wirksam-ist-das-sondervermoegen-wirklich"
TITLE = "Wie wirksam ist das Sondervermögen wirklich?"
SUBTITLE = "Wirkungsökonomische Gesamtanalyse des Sondervermögens Infrastruktur und Klimaneutralität"
DESCRIPTION = (
    "Eine wirkungsökonomische Gesamtanalyse des Sondervermögens Infrastruktur und "
    "Klimaneutralität: Von der Klimakompatibilität zur positiven Netto-Wirkung für "
    "Mensch, Planet und Demokratie."
)
DATE = "15. August 2026"
DATE_ISO = "2026-08-15T12:00:00+02:00"
HERO_IMAGE = "2026-08-15-wie-wirksam-ist-das-sondervermoegen-wirklich.png"
HERO_ALT = (
    "Deutschlandkarte über dem Reichstagsgebäude, verbunden mit Bahn, erneuerbarer "
    "Energie, Gesundheitsversorgung und den Dimensionen Mensch, Planet und Demokratie."
)
ARTICLE = ROOT / "blog" / f"{SLUG}.html"
ASSETS = ROOT / "assets" / "img" / "blog"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
W = "{%s}" % NS["w"]
R = "{%s}" % NS["r"]


def esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def paragraph_text(element: ET.Element) -> str:
    return "".join(node.text or "" for node in element.findall(".//w:t", NS)).strip()


def paragraph_style(element: ET.Element) -> str:
    style = element.find("w:pPr/w:pStyle", NS)
    return style.get(W + "val", "Normal") if style is not None else "Normal"


def is_list_item(element: ET.Element) -> bool:
    return paragraph_style(element).lower().startswith("list") or element.find("w:pPr/w:numPr", NS) is not None


def embedded_ids(element: ET.Element) -> list[str]:
    return [
        node.get(R + "embed")
        for node in element.findall(".//a:blip", NS)
        if node.get(R + "embed")
    ]


def relationship_map(doc: ZipFile) -> dict[str, str]:
    root = ET.fromstring(doc.read("word/_rels/document.xml.rels"))
    return {
        relation.get("Id"): relation.get("Target")
        for relation in root
        if relation.get("Type", "").endswith("/image")
    }


def external_links(doc: ZipFile) -> dict[str, str]:
    root = ET.fromstring(doc.read("word/_rels/document.xml.rels"))
    return {
        relation.get("Id"): relation.get("Target")
        for relation in root
        if relation.get("TargetMode") == "External"
    }


def run_html(run: ET.Element) -> str:
    value = "".join(node.text or "" for node in run.findall(".//w:t", NS))
    if not value:
        return ""
    value = esc(value)
    properties = run.find("w:rPr", NS)
    bold = properties.find("w:b", NS) if properties is not None else None
    italic = properties.find("w:i", NS) if properties is not None else None
    if bold is not None and bold.get(W + "val", "1") not in {"0", "false", "off"}:
        value = f"<strong>{value}</strong>"
    if italic is not None and italic.get(W + "val", "1") not in {"0", "false", "off"}:
        value = f"<em>{value}</em>"
    return value


def inline_html(element: ET.Element, links: dict[str, str]) -> str:
    output: list[str] = []
    for child in element:
        if child.tag == W + "r":
            output.append(run_html(child))
        elif child.tag == W + "hyperlink":
            value = "".join(run_html(run) for run in child.findall("w:r", NS))
            href = links.get(child.get(R + "id", ""))
            output.append(f'<a href="{esc(href)}">{value}</a>' if href else value)
    return "".join(output)


def table_rows(table: ET.Element) -> list[list[str]]:
    rows: list[list[str]] = []
    for row in table.findall("w:tr", NS):
        values: list[str] = []
        for cell in row.findall("w:tc", NS):
            paragraphs = [paragraph_text(item) for item in cell.findall("w:p", NS)]
            values.append(" ".join(item for item in paragraphs if item).strip())
        if any(values):
            rows.append(values)
    return rows


def table_html(table: ET.Element) -> str:
    values = table_rows(table)
    if not values:
        return ""
    if len(values) == 1 and len(values[0]) == 1:
        return f"          <blockquote><p>{esc(values[0][0])}</p></blockquote>"
    header, *body = values
    headings = "".join(f'<th scope="col">{esc(value)}</th>' for value in header)
    body_html = "\n".join(
        "              <tr>" + "".join(f"<td>{esc(value)}</td>" for value in row) + "</tr>"
        for row in body
    )
    return (
        '          <div class="table-scroll"><table><thead><tr>'
        f"{headings}</tr></thead><tbody>\n{body_html}\n"
        "          </tbody></table></div>"
    )


def copy_assets() -> dict[str, str]:
    ASSETS.mkdir(parents=True, exist_ok=True)
    hero_target = ASSETS / HERO_IMAGE
    if TITLE_IMAGE.resolve() != hero_target.resolve():
        shutil.copy2(TITLE_IMAGE, hero_target)

    with ZipFile(SOURCE_DOCX) as doc:
        relationships = relationship_map(doc)
        figures: dict[str, str] = {}
        for index, (relation_id, target) in enumerate(relationships.items(), 1):
            extension = Path(target).suffix.lower() or ".png"
            filename = f"2026-08-15-sondervermoegen-svik-abb-{index}{extension}"
            figures[relation_id] = filename
            with doc.open(f"word/{target}") as source, open(ASSETS / filename, "wb") as destination:
                shutil.copyfileobj(source, destination)
    return figures


def render_content(figures: dict[str, str]) -> str:
    with ZipFile(SOURCE_DOCX) as doc:
        body = ET.fromstring(doc.read("word/document.xml")).find("w:body", NS)
        links = external_links(doc)
    if body is None:
        raise ValueError("Die Word-Datei enthält keinen Dokumentkörper.")

    output: list[str] = []
    active = False
    in_contents = False
    list_open = False
    pending_figure: str | None = None
    caption_parts: list[str] = []

    def close_list() -> None:
        nonlocal list_open
        if list_open:
            output.append("          </ul>")
            list_open = False

    def flush_figure() -> None:
        nonlocal pending_figure, caption_parts
        if not pending_figure:
            return
        caption = " ".join(caption_parts).strip()
        filename = figures[pending_figure]
        output.append(
            "          <figure class=\"article-visual\">"
            f'<img src="../assets/img/blog/{filename}" alt="{esc(caption or "Abbildung zur wirkungsökonomischen Analyse des Sondervermögens.")}" '
            'loading="lazy" decoding="async">'
            f"<figcaption>{esc(caption)}</figcaption></figure>"
        )
        pending_figure = None
        caption_parts = []

    for child in body:
        if child.tag == W + "tbl":
            if active and not in_contents:
                close_list()
                flush_figure()
                rendered = table_html(child)
                if rendered:
                    output.append(rendered)
            continue
        if child.tag != W + "p":
            continue

        value = paragraph_text(child)
        style = paragraph_style(child)
        image_ids = embedded_ids(child)

        if style == "Heading2" and value == "Hinweis zum Status und zur Lesart":
            active = True
            in_contents = False
        elif style == "Heading2" and value == "Inhaltsverzeichnis":
            close_list()
            flush_figure()
            in_contents = True
            continue
        elif style == "Heading1" and value == "Executive Summary":
            active = True
            in_contents = False

        if not active or in_contents:
            continue
        if image_ids:
            close_list()
            flush_figure()
            pending_figure = image_ids[0]
            continue
        if pending_figure and (value.startswith("Abbildung ") or value.startswith("Quelle:")):
            if value:
                caption_parts.append(value)
            continue
        flush_figure()
        if not value:
            close_list()
            continue

        if style == "Heading1":
            close_list()
            output.append(f"          <h2>{esc(value)}</h2>")
        elif style == "Heading2":
            close_list()
            output.append(f"          <h3>{esc(value)}</h3>")
        elif is_list_item(child):
            if not list_open:
                output.append("          <ul>")
                list_open = True
            output.append(f"            <li>{inline_html(child, links)}</li>")
        else:
            close_list()
            css_class = "source-entry" if value.startswith("[") else ""
            class_attr = f' class="{css_class}"' if css_class else ""
            output.append(f"          <p{class_attr}>{inline_html(child, links)}</p>")

    close_list()
    flush_figure()
    return "\n".join(output)


def site_shell() -> tuple[str, str]:
    source = (ROOT / "blog" / "das-bessere-spiel.html").read_text(encoding="utf-8")
    header_start = source.index('    <header class="site-header"')
    main_start = source.index("    <main", header_start)
    main_end = source.rindex("</main>")
    return source[header_start:main_start], source[main_end + len("</main>") :]


def write_article(figures: dict[str, str]) -> None:
    header, footer = site_shell()
    content = render_content(figures)
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": TITLE,
        "alternativeHeadline": SUBTITLE,
        "description": DESCRIPTION,
        "url": f"https://wirkungsoekonomie.de/blog/{SLUG}.html",
        "image": f"https://wirkungsoekonomie.de/assets/img/blog/{HERO_IMAGE}",
        "datePublished": DATE_ISO,
        "dateModified": DATE_ISO,
        "inLanguage": "de",
        "author": {
            "@type": "Person",
            "name": "Natalie Weber",
            "url": "https://wirkungsoekonomie.de/natalie-weber.html",
        },
        "publisher": {
            "@type": "Organization",
            "name": "Wirkungsökonomie",
            "url": "https://wirkungsoekonomie.de",
        },
        "articleSection": "Wirkungsfinanzpolitik",
        "keywords": [
            "Sondervermögen",
            "Infrastruktur",
            "Klimaneutralität",
            "Wirkungsfinanzpolitik",
            "Wirkungspotenzial",
            "Wirkungsrisiko",
            "positive Netto-Wirkung",
            "Zusätzlichkeit",
            "Wirkungsrückkopplung",
            "SDG+",
            "Demokratie",
        ],
    }
    ARTICLE.write_text(
        f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)} - Journal der Wirkungsökonomie</title><meta name="description" content="{esc(DESCRIPTION)}"><meta name="search_title" content="{esc(TITLE)}"><meta name="search_description" content="{esc(DESCRIPTION)}"><meta name="search_section" content="Journal"><meta name="search_type" content="Journalartikel"><meta name="search_index_kind" content="journal"><meta name="search_tags" content="Sondervermögen, Infrastruktur, Klimaneutralität, Wirkungsfinanzpolitik, Wirkungspotenzial, Wirkungsrisiko, positive Netto-Wirkung, Zusätzlichkeit, Wirkungsrückkopplung, SDG+, Demokratie"><link rel="canonical" href="https://wirkungsoekonomie.de/blog/{SLUG}.html"><meta property="og:type" content="article"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Wirkungsökonomie"><meta property="og:title" content="{esc(TITLE)}"><meta property="og:description" content="{esc(DESCRIPTION)}"><meta property="og:url" content="https://wirkungsoekonomie.de/blog/{SLUG}.html"><meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/blog/{HERO_IMAGE}"><meta property="og:image:alt" content="{esc(HERO_ALT)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(TITLE)}"><meta name="twitter:description" content="{esc(DESCRIPTION)}"><meta name="twitter:image" content="https://wirkungsoekonomie.de/assets/img/blog/{HERO_IMAGE}"><meta property="article:published_time" content="{DATE_ISO}"><meta property="article:modified_time" content="{DATE_ISO}"><meta property="article:section" content="Wirkungsfinanzpolitik"><meta property="article:tag" content="Sondervermögen"><meta property="article:tag" content="Wirkungsfinanzpolitik"><meta property="article:tag" content="positive Netto-Wirkung"><meta property="article:tag" content="Zusätzlichkeit"><meta property="article:tag" content="Wirkungsrückkopplung"><link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml"><link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head><body>
{header}    <main data-pagefind-body><article class="hero"><div class="hero-copy"><p class="hero-kicker">Wirkungsfinanzpolitik · {DATE} · 45 Min.</p><h1 class="hero-title">{esc(TITLE)}</h1><p class="hero-subtitle">{esc(SUBTITLE)}</p><p class="journal-pdf-download-row no-print" data-search-exclude><a class="btn btn-secondary journal-pdf-download" data-journal-pdf-download href="../assets/pdf/journal/{SLUG}.pdf" download>PDF herunterladen</a></p><p class="meta">Von Natalie Weber · Begründerin der Wirkungsökonomie</p></div><figure class="hero-system-visual article-visual"><img src="../assets/img/blog/{HERO_IMAGE}" width="1680" height="945" alt="{esc(HERO_ALT)}" decoding="async" fetchpriority="high"></figure></article><section class="article-page"><div class="article-body"><div class="status-note"><strong>Methodische Einordnung:</strong> Diese Analyse ist eine Ex-ante-Prüfung nach Datenstand 15. August 2026. Sie trennt Wirkungspotenzial, Wirkungsrisiko, beobachtete Umsetzung und nachgewiesene Wirkung. Haushaltsansätze können sich im parlamentarischen Verfahren verändern.</div>
{content}
          <p><strong>Weiterlesen:</strong> <a class="text-link" href="../begriffe/wirkungspotenzial/">Wirkungspotenzial</a>, <a class="text-link" href="../begriffe/wirkungsrisiko/">Wirkungsrisiko</a>, <a class="text-link" href="../begriffe/wirkpfad/">Wirkpfad</a>, <a class="text-link" href="../begriffe/positive-netto-wirkung/">positive Netto-Wirkung</a> und <a class="text-link" href="../begriffe/wirkungsrueckkopplung/">Wirkungsrückkopplung</a>.</p><p><a class="text-link" href="../blog.html">Zurück zum Journal</a></p></div></section></main>
{footer}''',
        encoding="utf-8",
    )


if __name__ == "__main__":
    if not SOURCE_DOCX.is_file() or not TITLE_IMAGE.is_file():
        raise FileNotFoundError("SOURCE_DOCX und TITLE_IMAGE müssen auf vorhandene Dateien zeigen.")
    write_article(copy_assets())
