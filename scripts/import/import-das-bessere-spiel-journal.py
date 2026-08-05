#!/usr/bin/env python3
"""Importiert die freigegebene Journalfassung „Das bessere Spiel“ inklusive Abbildungen.

Aufruf:
SOURCE_DOCX=/absoluter/pfad.docx TITLE_IMAGE=/absoluter/pfad.png \
python3 scripts/import/import-das-bessere-spiel-journal.py
"""
from __future__ import annotations

import html, json, os, re, shutil
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DOCX = Path(os.environ["SOURCE_DOCX"])
TITLE_IMAGE = Path(os.environ["TITLE_IMAGE"])
SLUG = "das-bessere-spiel"
TITLE = "Das bessere Spiel"
SUBTITLE = "Warum Wirkung statt Kapital nicht an guten Menschen, sondern an guten Regeln hängt"
DESCRIPTION = "Warum Wirkung statt Kapital gute Regeln braucht: soziale Dilemmata, Vertrauen, Betrugsprävention und SDG+ 2.0 verständlich erklärt."
DATE = "5. August 2026"
DATE_ISO = "2026-08-05T19:00:00+02:00"
IMAGE = "2026-08-05-das-bessere-spiel.png"
ARTICLE = ROOT / "blog" / f"{SLUG}.html"
ASSETS = ROOT / "assets" / "img" / "blog"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main", "a": "http://schemas.openxmlformats.org/drawingml/2006/main", "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
W, R = "{%s}" % NS["w"], "{%s}" % NS["r"]

def esc(value: str) -> str: return html.escape(value or "", quote=True)
def text(el: ET.Element) -> str: return "".join(node.text or "" for node in el.findall(".//w:t", NS)).strip()
def style(el: ET.Element) -> str:
    value = el.find("w:pPr/w:pStyle", NS)
    return value.get(W + "val", "Normal") if value is not None else "Normal"
def ids(el: ET.Element) -> list[str]: return [node.get(R + "embed") for node in el.findall(".//a:blip", NS) if node.get(R + "embed")]
def paragraph_html(el: ET.Element) -> str:
    out = []
    for run in el.findall("w:r", NS):
        value = "".join(node.text or "" for node in run.findall(".//w:t", NS))
        if not value: continue
        value = esc(value)
        props = run.find("w:rPr", NS)
        if props is not None and props.find("w:b", NS) is not None: value = f"<strong>{value}</strong>"
        if props is not None and props.find("w:i", NS) is not None: value = f"<em>{value}</em>"
        out.append(value)
    return "".join(out)
def linkify(value: str) -> str:
    """Render URLs and DOI references once, without matching generated hrefs."""
    def url_anchor(match: re.Match[str]) -> str:
        url = match.group(1)
        return f'<a href="{url}">{url}</a>'

    def doi_anchor(match: re.Match[str]) -> str:
        prefix, doi = match.group(1), match.group(2)
        trailing = ""
        while doi and doi[-1] in ".,;:":
            trailing = doi[-1] + trailing
            doi = doi[:-1]
        return f'{prefix}<a href="https://doi.org/{doi}">{doi}</a>{trailing}'

    value = esc(value)
    # Link URLs first. The subsequent DOI substitution then only sees plain DOI
    # identifiers, rather than the URL introduced in an href attribute.
    value = re.sub(r"(https?://[^\s<]+)", url_anchor, value)
    return re.sub(r"(DOI:\s*)(10\.\d{4,9}/[-._;()/:A-Za-z0-9]+)", doi_anchor, value)
def rows(table: ET.Element) -> list[list[str]]:
    return [[" ".join(text(p) for p in cell.findall("w:p", NS) if text(p)).strip() for cell in row.findall("w:tc", NS)] for row in table.findall("w:tr", NS)]
def table_html(table: ET.Element) -> str:
    values = [row for row in rows(table) if any(row)]
    if not values: return ""
    if len(values) == 1 and len(values[0]) == 1:
        return f"          <blockquote><p>{esc(values[0][0])}</p></blockquote>"
    header, *body = values
    head = "".join(f'<th scope="col">{esc(cell)}</th>' for cell in header)
    body_html = "\n".join("              <tr>" + "".join(f"<td>{esc(cell)}</td>" for cell in row) + "</tr>" for row in body)
    return f'''          <div class="table-scroll"><table><thead><tr>{head}</tr></thead><tbody>
{body_html}
          </tbody></table></div>'''

def copy_assets() -> dict[str, str]:
    ASSETS.mkdir(parents=True, exist_ok=True)
    title_target = ASSETS / IMAGE
    if TITLE_IMAGE.resolve() != title_target.resolve():
        shutil.copy2(TITLE_IMAGE, title_target)
    with ZipFile(SOURCE_DOCX) as doc:
        rels = ET.fromstring(doc.read("word/_rels/document.xml.rels"))
        mapping = {rel.get("Id"): rel.get("Target") for rel in rels if rel.get("Type", "").endswith("/image")}
        figure_names = {}
        for index, (rid, target) in enumerate(mapping.items(), 1):
            name = f"2026-08-05-das-bessere-spiel-abb-{index}.png"
            figure_names[rid] = name
            with doc.open(f"word/{target}") as source, open(ASSETS / name, "wb") as destination:
                shutil.copyfileobj(source, destination)
    return figure_names

def render_content(figures: dict[str, str]) -> str:
    with ZipFile(SOURCE_DOCX) as doc: body = ET.fromstring(doc.read("word/document.xml")).find("w:body", NS)
    assert body is not None
    output, active, pending = [], False, None
    def flush(caption=""):
        nonlocal pending
        if not pending: return
        filename = figures[pending]
        output.append(f'''          <figure class="article-visual"><img src="../assets/img/blog/{filename}" alt="{esc(caption or 'Abbildung zur Wirkungsökonomie und kooperativer Systemgestaltung.')}" loading="lazy" decoding="async"><figcaption>{esc(caption)}</figcaption></figure>''')
        pending = None
    for child in body:
        if child.tag == W + "p":
            raw, kind = text(child), style(child)
            if raw == "Redaktionelle Zusatzbausteine für die Veröffentlichung": break
            if not active:
                if kind == "Heading1" and raw == "Abstract": active = True
                else: continue
            image_ids = ids(child)
            if image_ids:
                flush(); pending = image_ids[0]; continue
            if pending and kind == "FigureCaption": flush(raw); continue
            flush()
            if not raw: continue
            if kind == "Heading1": output.append(f"          <h2>{esc(raw)}</h2>")
            elif kind == "Heading2": output.append(f"          <h3>{esc(raw)}</h3>")
            elif kind in {"Endnote", "Bibliography"}: output.append(f'          <p class="source-entry">{linkify(raw)}</p>')
            elif kind in {"SmallNote", "SmallText"}: output.append(f'          <p class="small-text">{paragraph_html(child)}</p>')
            else: output.append(f"          <p>{paragraph_html(child)}</p>")
        elif active and child.tag == W + "tbl":
            flush(); rendered = table_html(child)
            if rendered: output.append(rendered)
    flush()
    return "\n".join(output)

def shell() -> tuple[str, str]:
    source = (ROOT / "blog" / "atomkraft-wetterabhaengigkeit-hinter-beton.html").read_text(encoding="utf-8")
    header_start = source.index('    <header class="site-header"')
    main_start = source.index("    <main", header_start)
    main_end = source.rindex("    </main>")
    return source[header_start:main_start], source[main_end + len("    </main>"):]

def write_article(figures: dict[str, str]) -> None:
    header, footer = shell(); content = render_content(figures)
    schema = {"@context":"https://schema.org","@type":"Article","headline":TITLE,"alternativeHeadline":SUBTITLE,"description":DESCRIPTION,"url":f"https://wirkungsoekonomie.de/blog/{SLUG}.html","image":f"https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}","datePublished":DATE_ISO,"dateModified":DATE_ISO,"inLanguage":"de","author":{"@type":"Person","name":"Natalie Weber","url":"https://wirkungsoekonomie.de/natalie-weber.html"},"publisher":{"@type":"Organization","name":"Wirkungsökonomie","url":"https://wirkungsoekonomie.de"},"articleSection":"Grundlagen der Wirkungsökonomie","keywords":["Wirkungsökonomie","soziale Dilemmata","Kooperation","Vertrauen","Wirkungsintegrität","SDG+","Reverse Merit Order","Demokratie"]}
    ARTICLE.write_text(f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)} - Journal der Wirkungsökonomie</title><meta name="description" content="{esc(DESCRIPTION)}"><meta name="search_title" content="{esc(TITLE)}"><meta name="search_description" content="{esc(DESCRIPTION)}"><meta name="search_section" content="Journal"><meta name="search_type" content="Journalartikel"><meta name="search_index_kind" content="journal"><meta name="search_tags" content="Wirkungsökonomie, soziale Dilemmata, Gefangenendilemma, Tragik der Allmende, Vertrauen, Kooperation, Wirkungsintegrität, SDG+, Reverse Merit Order, Demokratie"><link rel="canonical" href="https://wirkungsoekonomie.de/blog/{SLUG}.html"><meta property="og:type" content="article"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Wirkungsökonomie"><meta property="og:title" content="{esc(TITLE)}"><meta property="og:description" content="{esc(DESCRIPTION)}"><meta property="og:url" content="https://wirkungsoekonomie.de/blog/{SLUG}.html"><meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}"><meta property="og:image:alt" content="Geteiltes Spielfeld: Ausbeutung und Kooperation als zwei Systemlogiken."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(TITLE)}"><meta name="twitter:description" content="{esc(DESCRIPTION)}"><meta name="twitter:image" content="https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}"><meta property="article:published_time" content="{DATE_ISO}"><meta property="article:modified_time" content="{DATE_ISO}"><meta property="article:section" content="Grundlagen der Wirkungsökonomie"><meta property="article:tag" content="soziale Dilemmata"><meta property="article:tag" content="Kooperation"><meta property="article:tag" content="Vertrauen"><meta property="article:tag" content="Wirkungsintegrität"><meta property="article:tag" content="SDG+"><meta property="article:tag" content="Reverse Merit Order"><link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml"><link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head><body>
{header}    <main data-pagefind-body><article class="hero"><div class="hero-copy"><p class="hero-kicker">Grundlagen der Wirkungsökonomie · {DATE} · 28 Min.</p><h1 class="hero-title">{esc(TITLE)}</h1><p class="hero-subtitle">{esc(SUBTITLE)}</p><p class="journal-pdf-download-row no-print" data-search-exclude><a class="btn btn-secondary journal-pdf-download" data-journal-pdf-download href="../assets/pdf/journal/{SLUG}.pdf" download>PDF herunterladen</a></p><p class="meta">Von Natalie Weber · Begründerin der Wirkungsökonomie</p></div><figure class="hero-system-visual article-visual"><img src="../assets/img/blog/{IMAGE}" width="2048" height="1152" alt="Geteiltes Spielfeld: Ausbeutung und Kooperation als zwei Systemlogiken." decoding="async" fetchpriority="high"></figure></article><section class="article-page"><div class="article-body"><div class="status-note"><strong>Einordnung:</strong> Dieser Grundlagenbeitrag beschreibt ein WÖk-Modell. Er ist keine individuelle Anlage-, Rechts- oder Verhaltensberatung und ersetzt keine disziplinäre Literaturübersicht.</div>
{content}
          <p><strong>Weiterlesen:</strong> Wirkungsintegrität, kooperative Wehrhaftigkeit, <a class="text-link" href="../begriffe/positive-netto-wirkung/">positive Netto-Wirkung</a> und <a class="text-link" href="../verstehen/sdgs-sdgplus/">SDG+</a>.</p><p><a class="text-link" href="../blog.html">Zurück zum Journal</a></p></div></section></main>
{footer}''', encoding="utf-8")

if __name__ == "__main__":
    if not SOURCE_DOCX.is_file() or not TITLE_IMAGE.is_file(): raise FileNotFoundError("SOURCE_DOCX und TITLE_IMAGE müssen auf vorhandene Dateien zeigen.")
    write_article(copy_assets())
