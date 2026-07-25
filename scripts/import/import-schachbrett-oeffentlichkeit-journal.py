#!/usr/bin/env python3
"""Importiert die freigegebene Journal-Langform zum Schachbrett der Öffentlichkeit.

Aufruf:
SOURCE_DOCX=/pfad/zum/manuskript.docx \
TITLE_IMAGE=/pfad/zum/titelbild.jpg \
DRESS_IMAGE=/pfad/zur/kleid-collage.jpg \
python3 scripts/import/import-schachbrett-oeffentlichkeit-journal.py
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
DRESS_IMAGE = Path(os.environ["DRESS_IMAGE"])
SLUG = "das-schachbrett-der-oeffentlichkeit"
ARTICLE_PATH = ROOT / "blog" / f"{SLUG}.html"
ASSET_DIR = ROOT / "assets" / "img" / "blog"
DATE_LABEL = "25. Juli 2026"
DATE_ISO = "2026-07-25T00:00:00+02:00"
TITLE = "Das Schachbrett der Öffentlichkeit"
SUBTITLE = "Wie Wahrnehmung, Frames und Plattformen politische Wirklichkeit formen – und warum der Rechtsruck als Wirkungskette verstanden werden muss"
DESCRIPTION = "Wie Wahrnehmung, Frames, Plattformen und Rückkopplung politische Wirklichkeit formen: eine wirkungsökonomische Analyse von Rechtsruck, demokratischer Gegenwirkung und Preisen."
ARTICLE_URL = f"https://wirkungsoekonomie.de/blog/{SLUG}.html"
TITLE_ASSET = "2026-07-25-das-schachbrett-der-oeffentlichkeit.jpg"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
W = f"{{{NS['w']}}}"
R = f"{{{NS['r']}}}"

FIGURES = {
    "rId13": ("2026-07-25-schachbrett-illusion.jpg", "Schachbrett mit grünem Zylinder und Schatten: Die Felder A und B haben denselben Grauwert, erscheinen aber unterschiedlich hell."),
    "rId14": ("2026-07-25-gleicher-grauwert.png", "Zwei gleiche graue Flächen erscheinen vor heller und dunkler Umgebung unterschiedlich."),
    "rId15": ("2026-07-25-the-dress-wahrnehmungsvarianten.jpg", "Drei Wahrnehmungsvarianten desselben Kleids: Weiß-Gold und Blau-Schwarz."),
    "rId16": ("2026-07-25-wirkungsmodell-stufen.png", "Wirkungsökonomisches Stufenmodell vom Auslöser zur Rückkopplung."),
    "rId18": ("2026-07-25-kommunikationsmodell-wirkungsoekonomie.png", "Kommunikationsmodell der Wirkungsökonomie mit Erfahrung, Deutung, Form, Empfängerstruktur, Wirkung und Rückkopplung."),
    "rId19": ("2026-07-25-rechtsruck-wirkungskette.png", "Sieben gekoppelte Ebenen des Rechtsrucks von der materiellen und sozialen Lage bis zur Systemwirkung."),
    "rId20": ("2026-07-25-demokratische-gegenarchitektur.png", "Sechs miteinander verbundene Hebel für positive demokratische Netto-Wirkung."),
}

SOURCE_CODES = {
    "Adelson, E. H.": "WÖK-Q-0996",
    "Hasher, L.": "WÖK-Q-0997",
    "Hayek, F. A.": "WÖK-Q-0085",
    "Kahan, D. M.": "WÖK-Q-0998",
    "Kunda, Z.": "WÖK-Q-0999",
    "Lafer-Sousa, R.": "WÖK-Q-1000",
    "Lewandowsky, S.": "WÖK-Q-1001",
    "Maturana, H. R. (2002)": "WÖK-Q-1002",
    "Maturana, H. R.; Varela, F. J. (1980)": "WÖK-Q-0758",
    "Maturana, H. R.; Varela, F. J. (1987/2009)": "WÖK-Q-0759",
    "McCombs, M. E.": "WÖK-Q-1003",
    "Nickerson, R. S.": "WÖK-Q-1004",
    "Pigou, A. C.": "WÖK-Q-0821",
    "Steindl, C.": "WÖK-Q-1005",
    "Stiglitz, J. E.": "WÖK-Q-0474",
    "Tversky, A.": "WÖK-Q-1006",
    "Weber, N. (2026): Wirkungsökonomie.": "WÖK-Q-1018",
    "Boese-Schlosser, V. A.": "WÖK-Q-1007",
    "Bundeswahlleiterin (2025)": "WÖK-Q-1008",
    "Ecker, U. K. H.": "WÖK-Q-1009",
    "Hirndorf, D.": "WÖK-Q-1010",
    "Jänicke, C.": "WÖK-Q-1011",
    "Kinast, J. K.": "WÖK-Q-1012",
    "Lewandowsky, M.": "WÖK-Q-1013",
    "Roozenbeek, J.": "WÖK-Q-1014",
    "Saldivia Gonzatti, D.": "WÖK-Q-1015",
    "Siebel, H.": "WÖK-Q-1016",
    "Solovev, K.": "WÖK-Q-1017",
    "Weber, N. (2026): Die neue Ordnung": "WÖK-Q-0576",
}


def esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def text_of(element: ET.Element) -> str:
    return "".join(node.text or "" for node in element.findall(".//w:t", NS)).strip()


def style_of(paragraph: ET.Element) -> str:
    style = paragraph.find("w:pPr/w:pStyle", NS)
    return style.attrib.get(f"{W}val", "Normal") if style is not None else "Normal"


def image_ids(paragraph: ET.Element) -> list[str]:
    return [node.attrib[R + "embed"] for node in paragraph.findall(".//a:blip", NS) if R + "embed" in node.attrib]


def table_rows(table: ET.Element) -> list[list[str]]:
    rows = []
    for row in table.findall("w:tr", NS):
        rows.append([text_of(cell) for cell in row.findall("w:tc", NS)])
    return rows


def copy_assets() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(TITLE_IMAGE, ASSET_DIR / TITLE_ASSET)
    with ZipFile(SOURCE_DOCX) as archive:
        rels = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
        targets = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels if rel.attrib.get("Type", "").endswith("/image")}
        for rid, (target_name, _) in FIGURES.items():
            destination = ASSET_DIR / target_name
            if rid == "rId15":
                shutil.copy2(DRESS_IMAGE, destination)
            else:
                archive.extract(f"word/{targets[rid]}", ASSET_DIR / ".source-images")
                source = ASSET_DIR / ".source-images" / "word" / targets[rid]
                shutil.move(source, destination)
    shutil.rmtree(ASSET_DIR / ".source-images", ignore_errors=True)


def extract_shell() -> tuple[str, str]:
    shell = (ROOT / "blog" / "wellen-tiefen-modell-oeffentliche-kommunikation.html").read_text(encoding="utf-8")
    header_start = shell.index('    <header class="site-header"')
    main_start = shell.index("    <main", header_start)
    main_end = shell.rindex("    </main>")
    return shell[header_start:main_start], shell[main_end + len("    </main>"):]


def render_table(rows: list[list[str]]) -> str:
    if len(rows) == 1 and len(rows[0]) == 1:
        return f'          <blockquote>{esc(rows[0][0])}</blockquote>'
    header, *body = rows
    head = "".join(f"<th>{esc(cell)}</th>" for cell in header)
    rendered_rows = "\n".join("              <tr>" + "".join(f"<td>{esc(cell)}</td>" for cell in row) + "</tr>" for row in body)
    return f'''          <div class="table-scroll"><table>
            <thead><tr>{head}</tr></thead>
            <tbody>
{rendered_rows}
            </tbody>
          </table></div>'''


def render_content() -> str:
    with ZipFile(SOURCE_DOCX) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    body = root.find("w:body", NS)
    assert body is not None
    parts: list[str] = []
    in_article = False
    list_open = False
    pending_figure: tuple[str, str] | None = None

    def close_list() -> None:
        nonlocal list_open
        if list_open:
            parts.append("          </ul>")
            list_open = False

    def flush_figure(caption: str = "") -> None:
        nonlocal pending_figure
        if pending_figure is None:
            return
        filename, alt = pending_figure
        figcaption = f"<figcaption>{esc(caption)}</figcaption>" if caption else ""
        parts.append(f'''          <figure class="article-visual">
            <img src="../assets/img/blog/{filename}" alt="{esc(alt)}" loading="lazy" decoding="async">
            {figcaption}
          </figure>''')
        pending_figure = None

    for child in body:
        if child.tag == W + "p":
            text = text_of(child)
            style = style_of(child)
            ids = image_ids(child)
            if not in_article:
                if style == "Heading1" and text.startswith("1."):
                    in_article = True
                else:
                    continue
            if ids:
                close_list()
                flush_figure()
                rid = ids[0]
                if rid in FIGURES:
                    pending_figure = FIGURES[rid]
                continue
            if pending_figure and style == "SmallText":
                if pending_figure[0] == "2026-07-25-the-dress-wahrnehmungsvarianten.jpg":
                    text = "Abb. 3: #TheDress. Dasselbe Foto wird je nach angenommener Beleuchtung als blau-schwarz oder weiß-gold erlebt. Bild: vom Nutzer bereitgestellte Montage."
                flush_figure(text)
                continue
            flush_figure()
            if not text:
                continue
            if text == "Abbildungsnachweise und Publikationshinweis":
                # Die interne Lizenznotiz des Manuskripts ist nach dem Bildtausch obsolet.
                continue
            if style == "Heading1":
                close_list()
                parts.append(f"          <h2>{esc(text)}</h2>")
            elif style == "Heading2":
                close_list()
                parts.append(f"          <h3>{esc(text)}</h3>")
            elif style == "ListBullet":
                if not list_open:
                    parts.append('          <ul class="article-list">')
                    list_open = True
                parts.append(f"            <li>{esc(text)}</li>")
            elif style == "Bibliography":
                close_list()
                code = next((value for prefix, value in SOURCE_CODES.items() if text.startswith(prefix)), None)
                if code:
                    source_slug = code.replace("WÖK", "wok").lower()
                    parts.append(f'          <p class="source-entry"><a class="text-link" href="../quellenarchiv/{source_slug}/">{esc(text)}</a></p>')
                else:
                    parts.append(f'          <p class="source-entry">{esc(text)}</p>')
            elif style == "SmallText":
                close_list()
                parts.append(f'          <p class="small-text">{esc(text)}</p>')
            else:
                close_list()
                parts.append(f"          <p>{esc(text)}</p>")
        elif in_article and child.tag == W + "tbl":
            close_list()
            rows = table_rows(child)
            if rows and rows[0] and rows[0][0].startswith("Vor öffentlicher Veröffentlichung"):
                continue
            parts.append(render_table(rows))
    close_list()
    flush_figure()
    return "\n".join(parts)


def write_article() -> None:
    header, footer = extract_shell()
    content = render_content()
    schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": TITLE,
        "description": DESCRIPTION,
        "url": ARTICLE_URL,
        "image": f"https://wirkungsoekonomie.de/assets/img/blog/{TITLE_ASSET}",
        "datePublished": DATE_ISO,
        "dateModified": DATE_ISO,
        "inLanguage": "de",
        "author": {"@type": "Person", "name": "Natalie Weber", "url": "https://wirkungsoekonomie.de/natalie-weber.html"},
        "publisher": {"@type": "Organization", "name": "Wirkungsökonomie", "url": "https://wirkungsoekonomie.de"},
        "articleSection": "Kommunikation & Demokratie",
        "keywords": ["Wahrnehmung", "Framing", "Öffentlichkeit", "Rechtsruck", "Wirkungspotenzial", "Folgencheck", "Wirkungsökonomie"],
    }
    article = f'''<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(TITLE)} - Journal der Wirkungsökonomie</title>
    <meta name="description" content="{esc(DESCRIPTION)}">
    <meta name="search_title" content="{esc(TITLE)}">
    <meta name="search_description" content="{esc(DESCRIPTION)}">
    <meta name="search_section" content="Journal">
    <meta name="search_type" content="Journal-Beitrag">
    <meta name="search_tags" content="Wahrnehmung, Framing, Öffentlichkeit, Rechtsruck, AfD, Wirkungspotenzial, Folgencheck, Plattformlogik, Wirkungsökonomie">
    <link rel="canonical" href="{ARTICLE_URL}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="{esc(TITLE)}">
    <meta property="og:description" content="{esc(DESCRIPTION)}">
    <meta property="og:url" content="{ARTICLE_URL}">
    <meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/blog/{TITLE_ASSET}">
    <meta property="og:image:alt" content="Das Schachbrett der Öffentlichkeit: Wahrnehmung, Kommunikation und Rückkopplung.">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{esc(TITLE)}">
    <meta name="twitter:description" content="{esc(DESCRIPTION)}">
    <meta name="twitter:image" content="https://wirkungsoekonomie.de/assets/img/blog/{TITLE_ASSET}">
    <meta property="article:published_time" content="{DATE_ISO}">
    <meta property="article:modified_time" content="{DATE_ISO}">
    <meta property="article:section" content="Kommunikation &amp; Demokratie">
    <meta property="article:tag" content="Wahrnehmung">
    <meta property="article:tag" content="Framing">
    <meta property="article:tag" content="Öffentlichkeit">
    <meta property="article:tag" content="Rechtsruck">
    <meta property="article:tag" content="Wirkungspotenzial">
    <meta property="article:tag" content="Folgencheck">
    <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
  </head>
  <body>
{header}    <main data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <p class="hero-kicker">Kommunikation &amp; Demokratie · {DATE_LABEL} · 43 Min.</p>
          <h1 class="hero-title">{esc(TITLE)}</h1>
          <p class="hero-subtitle">{esc(SUBTITLE)}</p>
          <p class="meta">Von Natalie Weber · Begründerin der Wirkungsökonomie</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="../assets/img/blog/{TITLE_ASSET}" width="1280" height="720" alt="Das Schachbrett der Öffentlichkeit: Wahrnehmung, Kommunikation und Rückkopplung." decoding="async" fetchpriority="high">
        </figure>
      </article>

      <section class="article-page">
        <div class="article-body">
          <div class="status-note"><strong>Einordnung:</strong> Der Beitrag unterscheidet konsequent zwischen Wirkungspotenzial, Wirkungsrisiko und tatsächlich eingetretener Wirkung. Er behandelt Kommunikation als demokratischen Wirkungsraum, nicht als Instrument zur Bewertung von Personen.</div>
          <p><strong>Weiterführend:</strong> Die <a class="text-link" href="../oeffentlicher-wirkungsraum/">Übersicht zum Öffentlichen Wirkungsraum</a>, der <a class="text-link" href="../wirkungsradar/">Wirkungsradar</a> und das <a class="text-link" href="../begriffe/wirkungspotenzial/">Glossar zu Wirkungspotenzial</a> ergänzen diese Langform.</p>
{content}
          <p><strong>Weiterlesen:</strong> <a class="text-link" href="../wirkungsfelder/medien-oeffentlichkeit/">Medien &amp; Öffentlichkeit</a>, <a class="text-link" href="../werkzeuge/faktencheck/">WÖk-Wirkungscheck</a>, <a class="text-link" href="../begriffe/positive-netto-wirkung/">positive Netto-Wirkung</a> und der <a class="text-link" href="../verstehen/sdgs-sdgplus/">SDG-/SDG+-Referenzrahmen</a>.</p>
          <p><a class="text-link" href="../blog.html">Zurück zum Journal</a></p>
        </div>
      </section>
    </main>
{footer}'''
    ARTICLE_PATH.write_text(article, encoding="utf-8")


if __name__ == "__main__":
    copy_assets()
    write_article()
