#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import html
import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]
BUNDLED_PYTHON = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"

JOURNAL_SOURCE = Path("/Users/hagen/Downloads/Von_der_Wissensgesellschaft_zur_Wirkungsgesellschaft_Journalbeitrag_v3_final.docx")
DOSSIER_SOURCE = Path("/Users/hagen/Downloads/Von_der_Wissensgesellschaft_zur_Wirkungsgesellschaft_Dossier_v2_erweitert.docx")
SOURCE_IMAGE = Path("/Users/hagen/Downloads/ChatGPT Image 15. Juni 2026, 15_26_39.png")

ARTICLE_PATH = ROOT / "blog" / "von-der-wissensgesellschaft-zur-wirkungsgesellschaft.html"
DOCUMENT_PATH = ROOT / "dokumente" / "von-der-wissensgesellschaft-zur-wirkungsgesellschaft" / "index.html"
BIBLIOTHEK_PATH = ROOT / "bibliothek" / "von-der-wissensgesellschaft-zur-wirkungsgesellschaft" / "index.html"
IMAGE_TARGET = ROOT / "assets" / "img" / "blog" / "2026-06-15-wissensgesellschaft-wirkungsgesellschaft.webp"
PUBLIC_PDF = ROOT / "public" / "downloads" / "originals" / "von-der-wissensgesellschaft-zur-wirkungsgesellschaft-dossier.pdf"
INTERNAL_DOCX = ROOT / "outputs" / "nonpublic-source-archive" / "dossiers" / "von-der-wissensgesellschaft-zur-wirkungsgesellschaft-dossier-woek-ci.docx"
INTERNAL_SOURCE_COPY = ROOT / "outputs" / "nonpublic-source-archive" / "dossiers" / "von-der-wissensgesellschaft-zur-wirkungsgesellschaft-dossier-source-v2.docx"
HEADER_TEMPLATE = ROOT / "templates" / "header.html"
FOOTER_TEMPLATE = ROOT / "templates" / "footer.html"
NAVIGATION_DATA = ROOT / "assets" / "data" / "navigation.json"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = f"{{{NS['w']}}}"

TITLE = "Von der Wissensgesellschaft zur Wirkungsgesellschaft"
SUBTITLE = "Warum Labels, Zertifikate, Scores und Faktenchecks wichtig sind - aber erst Rückkopplung daraus Wirkung macht"
DOSSIER_SUBTITLE = "Warum die nächste Entwicklungsstufe nicht nur fragt, was wir wissen - sondern was wir bewirken."
DESCRIPTION = (
    "Journal-Beitrag zum Übergang von der Wissensgesellschaft zur Wirkungsgesellschaft: "
    "Labels, Zertifikate, Scores, Faktenchecks und Berichte machen Wirkung sichtbar, aber erst "
    "Rückkopplung in Preise, Regeln, Kapital, Beschaffung und Öffentlichkeit macht daraus reale Steuerung."
)
DOSSIER_DESCRIPTION = (
    "Dossier zum Übergang von der Wissensgesellschaft zur Wirkungsgesellschaft: "
    "Wissen, Labels, Zertifikate, Scores, Faktenchecks und Berichte werden erst wirksam, wenn sie in "
    "Bewertung, Rückkopplung und positive Netto-Wirkung übersetzt werden."
)
SUMMARY_SHORT = (
    "Dossier zum Übergang von der Wissensgesellschaft zur Wirkungsgesellschaft: "
    "Das Dossier schärft Labels, Zertifikate, Scores, Faktenchecks und Berichte als "
    "Sichtbarkeitsinstrumente, die erst durch Bewertung und Rückkopplung Wirkung erzeugen."
)
DATE_LABEL = "15. Juni 2026"
DATE_ISO = "2026-06-15T20:38:00+02:00"
AUTHOR = "Natalie Weber"
ARTICLE_URL = "https://wirkungsoekonomie.de/blog/von-der-wissensgesellschaft-zur-wirkungsgesellschaft.html"
DOCUMENT_URL = "https://wirkungsoekonomie.de/dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/"
PDF_URL = "https://wirkungsoekonomie.de/public/downloads/originals/von-der-wissensgesellschaft-zur-wirkungsgesellschaft-dossier.pdf"
IMAGE_URL = "https://wirkungsoekonomie.de/assets/img/blog/2026-06-15-wissensgesellschaft-wirkungsgesellschaft.webp"
IMAGE_ALT = (
    "Von der Wissensgesellschaft zur Wirkungsgesellschaft: Daten, Analyse und Wissen werden "
    "über Rückkopplung in Handeln, Klimaschutz, Bildung, Gesundheit, Teilhabe und Kreislaufwirtschaft übersetzt."
)


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def slugify(value: str, used: set[str]) -> str:
    slug = value.lower()
    slug = slug.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    slug = slug or "abschnitt"
    base = slug
    counter = 2
    while slug in used:
        slug = f"{base}-{counter}"
        counter += 1
    used.add(slug)
    return slug


def para_text(para: ET.Element) -> str:
    return "".join(t.text or "" for t in para.findall(".//w:t", NS)).strip()


def para_style(para: ET.Element) -> str:
    ppr = para.find("w:pPr", NS)
    if ppr is None:
        return "Normal"
    style = ppr.find("w:pStyle", NS)
    if style is None:
        return "Normal"
    return style.attrib.get(f"{W}val", "Normal")


def table_rows(table: ET.Element) -> list[list[str]]:
    rows: list[list[str]] = []
    for row in table.findall("w:tr", NS):
        cells: list[str] = []
        for cell in row.findall("w:tc", NS):
            pieces = [para_text(p) for p in cell.findall("w:p", NS)]
            cells.append("\n".join(piece for piece in pieces if piece).strip())
        if any(cells):
            rows.append(cells)
    return rows


def read_docx_blocks(path: Path) -> list[dict]:
    with ZipFile(path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    body = root.find("w:body", NS)
    if body is None:
        return []
    blocks: list[dict] = []
    for child in body:
        if child.tag == f"{W}p":
            text = para_text(child)
            if text:
                blocks.append({"type": "paragraph", "style": para_style(child), "text": text})
        elif child.tag == f"{W}tbl":
            rows = table_rows(child)
            if rows:
                blocks.append({"type": "table", "rows": rows})
    return blocks


def body_from_first_heading(blocks: list[dict], heading: str | None = None) -> list[dict]:
    body: list[dict] = []
    in_body = False
    skip_toc = False
    for block in blocks:
        if block["type"] == "paragraph":
            text = block["text"].strip()
            style = block.get("style", "Normal")
            if style == "Heading1" and text == "Inhaltsübersicht":
                skip_toc = True
                continue
            if skip_toc:
                if style == "Heading1" and (heading is None or text == heading or re.match(r"^\d+\.", text)):
                    skip_toc = False
                else:
                    continue
            if not in_body and style == "Heading1" and (heading is None or text == heading):
                in_body = True
            if not in_body:
                continue
        if in_body:
            body.append(block)
    return body


def stop_before_headings(blocks: list[dict], headings: set[str]) -> list[dict]:
    kept: list[dict] = []
    for block in blocks:
        if block["type"] == "paragraph" and block.get("style") == "Heading1" and block["text"].strip() in headings:
            break
        kept.append(block)
    return kept


def base_for(relative_depth: int) -> str:
    return "../" * relative_depth


def nav_slug(label: str) -> str:
    return slugify(label, set())


def nav_match(item: dict) -> str:
    return "|".join(item.get("match", []))


def nav_link(item: dict, base: str) -> str:
    return f'<a href="{base}{esc(item["href"])}" data-nav-match="{esc(nav_match(item))}">{esc(item["label"])}</a>'


def footer_group(group: dict, base: str) -> str:
    links = "\n".join(f"          {nav_link(item, base)}" for item in group.get("items", []))
    return (
        '<div class="footer-nav-group">\n'
        f"      <h3>{esc(group['title'])}</h3>\n"
        '      <div class="footer-nav-links">\n'
        f"{links}\n"
        "      </div>\n"
        "    </div>"
    )


def header_utility(navigation: dict, base: str) -> str:
    labels = {"Suche", "WÖk-KI", "Mein Wirkungsraum"}
    links: list[str] = []
    for item in navigation.get("more", []):
        if item.get("label") not in labels:
            continue
        label = esc(item["label"])
        primary = ' data-utility-primary="true"' if item["label"] == "Mein Wirkungsraum" else ""
        links.append(
            f'<a class="site-utility-link site-utility-link--{esc(nav_slug(item["label"]))}" '
            f'href="{base}{esc(item["href"])}" data-nav-match="{esc(nav_match(item))}" '
            f'data-utility-label="{label}"{primary}>{label}</a>'
        )
    return "\n    ".join(links)


def shell(relative_depth: int, reference_reader: bool = False) -> tuple[str, str]:
    base = base_for(relative_depth)
    navigation = json.loads(NAVIGATION_DATA.read_text(encoding="utf-8"))
    header = (
        HEADER_TEMPLATE.read_text(encoding="utf-8")
        .replace("{{BASE}}", base)
        .replace("{{HEADER_NAV}}", "\n    ".join(nav_link(item, base) for item in navigation.get("header", [])))
        .replace("{{HEADER_UTILITY_NAV}}", header_utility(navigation, base))
    )
    footer = (
        FOOTER_TEMPLATE.read_text(encoding="utf-8")
        .replace("{{BASE}}", base)
        .replace("{{FOOTER_NAV}}", "\n    ".join(footer_group(group, base) for group in navigation.get("footerGroups", [])))
        .replace("{{FOOTER_LEGAL_NAV}}", "\n".join(nav_link(item, base) for item in navigation.get("footerLegal", [])))
    )
    scripts = f'    <script src="{base}assets/js/main.js?v=20260612-mobile-table-fix"></script>\n'
    if reference_reader:
        scripts += f'    <script src="{base}assets/js/reference-reader.js?v=20260605-referenz-merkliste-ux"></script>\n'
    footer = f"{footer}\n{scripts}  </body>\n</html>\n"
    return header, footer


TERMS = [
    ("positive Netto-Wirkung", "begriffe/positive-netto-wirkung/"),
    ("Netto-Wirkung", "begriffe/netto-wirkung/"),
    ("Wissensgesellschaft", "begriffe/wissensgesellschaft/"),
    ("Wirkungsgesellschaft", "begriffe/wirkungsgesellschaft/"),
    ("Wirkungsökonomie", "wirkungsoekonomie.html"),
    ("Wirkungsrückkopplung", "begriffe/wirkungsrueckkopplung/"),
    ("Rückkopplung", "begriffe/wirkungsrueckkopplung/"),
    ("Wirkungsarchitektur", "begriffe/wirkungsarchitektur/"),
    ("Wirkungskompetenz", "begriffe/wirkungskompetenz/"),
    ("Wirkungsraum", "begriffe/wirkungsraum/"),
    ("Resonanzraum", "begriffe/resonanzraum/"),
    ("Medienqualität", "begriffe/medienqualitaet/"),
    ("Diskursfähigkeit", "begriffe/diskursfaehigkeit/"),
    ("Demokratische Resilienz", "begriffe/demokratische-resilienz/"),
    ("SDG+", "begriffe/sdg-plus/"),
    ("Reverse Merit Order", "begriffe/reverse-merit-order/"),
    ("Nichtkompensation", "begriffe/nichtkompensationsprinzip/"),
    ("Scorecards", "begriffe/scorecards/"),
    ("WÖk-IDs", "begriffe/woek-ids/"),
    ("WÖk-ID", "begriffe/woek-id/"),
    ("Wirkungsrat", "begriffe/wirkungsrat/"),
    ("Wirkungssteuer", "wirkungssteuerung/wirkungssteuer/"),
    ("Wirkungshaushalt", "wirkungssteuerung/wirkungshaushalt/"),
    ("Wirkungsfinanzpolitik", "wirkungsfelder/wirkungsfinanzpolitik/"),
    ("T-SROI", "werkzeuge/t-sroi/"),
    ("Impact-of-Investment", "begriffe/impact-of-investment/"),
    ("IOI", "begriffe/impact-of-investment/"),
    ("Tacit Knowledge", "begriffe/tacit-knowledge/"),
    ("Informelles Wissen", "begriffe/informelles-wissen/"),
    ("Rebound-Effekt", "begriffe/rebound-effekt/"),
    ("Streisand-Effekt", "begriffe/streisand-effekt/"),
    ("Amathia", "begriffe/amathia/"),
    ("Wirkung", "begriffe/wirkung/"),
]


def link_text(text: str, prefix: str, linked_terms: set[str]) -> str:
    rendered = esc(text)
    for term, path in TERMS:
        key = term.lower()
        if key in linked_terms:
            continue
        boundary = r"A-Za-zÄÖÜäöüß0-9_-"
        pattern = re.compile(rf"(?<![{boundary}]){re.escape(term)}(?![{boundary}])")
        if pattern.search(rendered):
            rendered = pattern.sub(
                f'<a class="text-link" href="{prefix}{path}">{esc(term)}</a>',
                rendered,
                count=1,
            )
            linked_terms.add(key)
            break
    return rendered


def render_table(rows: list[list[str]], prefix: str, linked_terms: set[str]) -> str:
    if len(rows) == 1 and len(rows[0]) == 1:
        text = rows[0][0]
        if "\n" in text:
            head, rest = text.split("\n", 1)
        else:
            match = re.match(
                r"^(Kernbild|Alltagsbild|Merksatz|Einordnung|Medienformel|Demokratische Grenze|Schlussformel|Korrektur der Visualisierungslogik|Wirkungsökonomische Pointe|Faktencheck und Folgencheck|Der letzte Satz|Kernthese)(.*)$",
                text,
            )
            if match:
                head, rest = match.group(1), match.group(2).strip()
            elif ":" in text:
                head, rest = text.split(":", 1)
            else:
                words = text.split()
                head, rest = " ".join(words[:4]), " ".join(words[4:])
        return (
            '          <aside class="callout dossier-note">'
            f"<p><strong>{link_text(head.strip(), prefix, linked_terms)}</strong>"
            f"{' ' + link_text(rest.strip(), prefix, linked_terms) if rest.strip() else ''}</p>"
            "</aside>"
        )
    max_cols = max(len(row) for row in rows)
    normalized = [row + [""] * (max_cols - len(row)) for row in rows]
    head = normalized[0]
    body = normalized[1:]
    out = ['          <div class="table-wrap" role="region" tabindex="0"><table class="data-table dossier-table">']
    out.append("<thead><tr>" + "".join(f"<th>{link_text(cell, prefix, linked_terms)}</th>" for cell in head) + "</tr></thead>")
    out.append("<tbody>")
    for row in body:
        out.append("<tr>" + "".join(f"<td>{link_text(cell, prefix, linked_terms)}</td>" for cell in row) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


def render_blocks(blocks: list[dict], prefix: str, pid_prefix: str) -> tuple[str, list[tuple[int, str, str]]]:
    used: set[str] = set()
    linked_terms: set[str] = set()
    toc: list[tuple[int, str, str]] = []
    parts: list[str] = []
    para_no = 0
    list_tag: str | None = None

    def close_list() -> None:
        nonlocal list_tag
        if list_tag:
            parts.append(f"          </{list_tag}>")
            list_tag = None

    for block in blocks:
        if block["type"] == "table":
            close_list()
            parts.append(render_table(block["rows"], prefix, linked_terms))
            continue

        style = block.get("style", "Normal")
        text = block["text"].strip()
        if style in {"Title", "Subtitle", "Kicker", "Meta"}:
            continue

        if style in {"Heading1", "Heading2", "Heading3"}:
            close_list()
            anchor = slugify(text, used)
            level = 2 if style == "Heading1" else 3 if style == "Heading2" else 4
            toc.append((level, anchor, text))
            tag = f"h{level}"
            parts.append(
                f'          <{tag} id="{anchor}" data-section-id="{anchor}">{esc(text)} '
                f'<a class="cite-anchor no-print" href="#{anchor}" aria-label="Zitierlink zu diesem Abschnitt">#</a></{tag}>'
            )
            continue

        is_number = style.startswith("ListNumber")
        is_bullet = style.startswith("ListBullet")
        if is_number or is_bullet:
            wanted = "ol" if is_number else "ul"
            if list_tag != wanted:
                close_list()
                parts.append(f'          <{wanted} class="clean-list">')
                list_tag = wanted
            para_no += 1
            pid = f"{pid_prefix}-{para_no:04d}"
            parts.append(f'            <li id="{pid}" data-paragraph-id="{pid}">{link_text(text, prefix, linked_terms)}</li>')
            continue

        close_list()
        para_no += 1
        pid = f"{pid_prefix}-{para_no:04d}"
        class_attr = ' class="lead"' if style == "Lead" and para_no <= 5 else ""
        parts.append(f'          <p{class_attr} id="{pid}" data-paragraph-id="{pid}">{link_text(text, prefix, linked_terms)}</p>')

    close_list()
    return "\n".join(parts), toc


def toc_details(toc: list[tuple[int, str, str]]) -> str:
    items = "\n".join(f'            <li><a href="#{esc(anchor)}">{esc(title)}</a></li>' for level, anchor, title in toc if level == 2)
    return f'          <details class="toc-card no-print" aria-label="Inhaltsverzeichnis"><summary class="card-title">Inhaltsverzeichnis anzeigen</summary><ol>\n{items}\n          </ol></details>'


def side_nav(toc: list[tuple[int, str, str]]) -> str:
    links = "".join(f'<a href="#{esc(anchor)}">{esc(title)}</a>' for _, anchor, title in toc[:36])
    return f'<nav class="side-nav" aria-label="Abschnitte">{links}</nav>'


def render_article(body_html: str, toc: list[tuple[int, str, str]]) -> str:
    header, footer = shell(1)
    json_ld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": TITLE,
        "alternativeHeadline": SUBTITLE,
        "description": DESCRIPTION,
        "url": ARTICLE_URL,
        "image": IMAGE_URL,
        "inLanguage": "de",
        "datePublished": "2026-06-15T15:26:39+02:00",
        "dateModified": DATE_ISO,
        "author": {"@type": "Person", "name": AUTHOR},
        "publisher": {"@type": "Organization", "name": "Wirkungsökonomie", "url": "https://wirkungsoekonomie.de"},
        "articleSection": "Transformation & Wirkungsgesellschaft",
        "keywords": [
            "Wissensgesellschaft",
            "Wirkungsgesellschaft",
            "Labels",
            "Zertifikate",
            "Scores",
            "Faktencheck",
            "Folgencheck",
            "Wirkungsrückkopplung",
            "positive Netto-Wirkung",
            "6. Kondratieff",
        ],
        "isBasedOn": DOCUMENT_URL,
    }
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(TITLE)} - Journal der Wirkungsökonomie</title>
    <meta name="description" content="{esc(DESCRIPTION)}">
    <meta name="search_title" content="{esc(TITLE)}">
    <meta name="search_description" content="{esc(DESCRIPTION)}">
    <meta name="search_section" content="Journal">
    <meta name="search_type" content="Journalartikel">
    <meta name="search_tags" content="Wissensgesellschaft, Wirkungsgesellschaft, Labels, Zertifikate, Scores, Faktencheck, Folgencheck, Wirkungsökonomie, Wirkung, 6. Kondratieff, SDG+, Rückkopplung, Nachhaltigkeit, Transformation, Wirkungskompetenz, positive Netto-Wirkung, Wirkungsarchitektur, Wirkungsrückkopplung, Reverse Merit Order">
    <link rel="canonical" href="{ARTICLE_URL}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="{esc(TITLE)}">
    <meta property="og:description" content="{esc(DESCRIPTION)}">
    <meta property="og:url" content="{ARTICLE_URL}">
    <meta property="og:image" content="{IMAGE_URL}">
    <meta property="og:image:alt" content="{esc(IMAGE_ALT)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{esc(TITLE)}">
    <meta name="twitter:description" content="{esc(DESCRIPTION)}">
    <meta name="twitter:image" content="{IMAGE_URL}">
    <meta name="twitter:image:alt" content="{esc(IMAGE_ALT)}">
    <meta property="article:published_time" content="2026-06-15T15:26:39+02:00">
    <meta property="article:modified_time" content="{DATE_ISO}">
    <meta property="article:section" content="Transformation &amp; Wirkungsgesellschaft">
    <meta property="article:tag" content="Wissensgesellschaft">
    <meta property="article:tag" content="Wirkungsgesellschaft">
    <meta property="article:tag" content="Labels">
    <meta property="article:tag" content="Zertifikate">
    <meta property="article:tag" content="Scores">
    <meta property="article:tag" content="Faktencheck">
    <meta property="article:tag" content="Folgencheck">
    <meta property="article:tag" content="Wirkungsrückkopplung">
    <link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml">
    <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False, indent=2)}</script>
  </head>
  <body>
{header}    <main id="inhalt" data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Start</a> / <a href="../blog.html">Journal</a> / {esc(TITLE)}</nav>
          <p class="hero-kicker">Journal · Transformation &amp; Wirkungsgesellschaft · {DATE_LABEL} · 18 Min.</p>
          <h1 class="hero-title">{esc(TITLE)}</h1>
          <p class="hero-subtitle">{esc(SUBTITLE)}</p>
          <p class="meta">Von {esc(AUTHOR)} · Journal-Beitrag</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="../assets/img/blog/2026-06-15-wissensgesellschaft-wirkungsgesellschaft.webp" width="1672" height="941" alt="{esc(IMAGE_ALT)}" decoding="async" fetchpriority="high">
          <figcaption>Vom Wissen zur Wirkung: Sichtbarkeit wird erst durch Rückkopplung zu realer Steuerung.</figcaption>
        </figure>
      </article>
      <section class="article-page">
        <div class="article-body">
          <div class="status-note"><strong>Faktenstand:</strong> {DATE_LABEL}. Der Beitrag ist mit dem vertiefenden Dossier verbunden und nutzt modellhafte WÖk-Begriffe; er ist keine Rechts-, Anlage-, Steuer- oder Politikberatung.</div>
          <div class="callout"><p><strong>Grundlagenpfad:</strong> Die Verstehen-Seite <a class="text-link" href="../verstehen/wissensgesellschaft-wirkungsgesellschaft/">Von der Wissensgesellschaft zur Wirkungsgesellschaft</a> erklärt den Gedanken kompakt als Einstieg - inklusive Einordnung vom 5. zum 6. Kondratieff.</p></div>
          <div class="callout"><p><strong>Vertiefung:</strong> Der Beitrag verdichtet das aktualisierte Dossier <a class="text-link" href="../dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/">Von der Wissensgesellschaft zur Wirkungsgesellschaft</a>. Die PDF-Fassung bleibt unter dem bestehenden Link abrufbar.</p></div>
{toc_details(toc)}
{body_html}
          <h2 id="quellen-und-arbeitsgrundlagen">Quellen und Arbeitsgrundlagen <a class="cite-anchor no-print" href="#quellen-und-arbeitsgrundlagen" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
          <ol class="clean-list sources-list"><li id="quelle-1">[1] Dossier: <a class="text-link" href="../dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/">Von der Wissensgesellschaft zur Wirkungsgesellschaft</a>, öffentliche Dossierfassung, Stand {DATE_LABEL}.</li><li id="quelle-2">[2] UN Department of Economic and Social Affairs: The 17 Sustainable Development Goals.</li><li id="quelle-3">[3] OECD: Measuring What People Know. Human Capital Accounting for the Knowledge Economy, 1996.</li><li id="quelle-4">[4] European Commission: Corporate sustainability reporting, ESRS, Green Claims, Digital Services Act und Ecodesign for Sustainable Products Regulation.</li><li id="quelle-5">[5] Wirkungsökonomie: Glossar-Hub mit Detailseiten zu Wirkung, SDG+, Reverse Merit Order, Wirkungsarchitektur und Wirkungsrückkopplung.</li></ol>
        </div>
      </section>
    </main>{footer}"""


def render_document(body_html: str, toc: list[tuple[int, str, str]], source_hash: str) -> str:
    header, footer = shell(2, reference_reader=True)
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(TITLE)} | Wirkungsökonomie</title>
    <meta name="description" content="{esc(DOSSIER_DESCRIPTION)}">
    <meta name="search_title" content="{esc(TITLE)}">
    <meta name="search_description" content="{esc(DOSSIER_DESCRIPTION)}">
    <meta name="search_section" content="Dokumente">
    <meta name="search_type" content="Dossier">
    <meta name="search_tags" content="Wissensgesellschaft, Wirkungsgesellschaft, Labels, Zertifikate, Scores, Faktencheck, Folgencheck, Wirkungskompetenz, SDG+, Rückkopplung, Wirkungsarchitektur, KI, Medien, Demokratie, positive Netto-Wirkung">
    <link rel="canonical" href="{DOCUMENT_URL}">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body class="reference-ux-page">
{header}    <main class="reference-work reference-reader workpaper-reader" data-pagefind-body>
      <article class="article-shell">
        <nav class="breadcrumb"><a href="../">Dokumente</a> / Dossier</nav>
        <p class="hero-kicker">Dossier · Erweiterte öffentliche Dossierfassung v2.0 · Stand {DATE_LABEL}</p>
        <h1>{esc(TITLE)}</h1>
        <p class="lead">{esc(DOSSIER_SUBTITLE)}</p>
        <div class="document-reader-tools">
          <a class="btn btn-secondary" href="../">Dokumentenbibliothek</a>
          <a class="btn btn-secondary" href="../../verstehen/wissensgesellschaft-wirkungsgesellschaft/">Grundlagenpfad</a>
          <a class="btn btn-secondary" href="../../bibliothek/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/">Bibliothekseintrag</a>
          <a class="btn btn-secondary" href="../../blog/von-der-wissensgesellschaft-zur-wirkungsgesellschaft.html">Journal-Beitrag</a>
          <a class="btn btn-secondary" href="../../begriffe/wirkungsgesellschaft/">Glossar: Wirkungsgesellschaft</a>
          <button class="btn btn-secondary" type="button" data-print-page>Drucken</button>
        </div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="../../public/downloads/originals/von-der-wissensgesellschaft-zur-wirkungsgesellschaft-dossier.pdf">PDF öffnen</a>
          <a class="btn btn-secondary" href="../../begriffe/wissensgesellschaft/">Wissensgesellschaft</a>
          <a class="btn btn-secondary" href="../../begriffe/wirkungsgesellschaft/">Wirkungsgesellschaft</a>
        </div>
        <section class="callout">
          <h2>Kernaussage</h2>
          <p>Sichtbarkeit ist notwendig, aber nicht ausreichend. Die Wirkungsgesellschaft beginnt dort, wo Wissen, Labels, Zertifikate, Scores, Berichte und Faktenchecks in Bewertung, Rückkopplung und positive Netto-Wirkung übersetzt werden.</p>
        </section>
        <aside class="citation-note" role="note">
          <p class="card-kicker">Schutzlinie</p>
          <h2>Dossier, keine automatische Steuerung</h2>
          <p>Das Dossier beschreibt einen konzeptionellen Lern- und Ordnungsrahmen. Die Wirkungsökonomie bewertet Maßnahmen, Strukturen und Wirkungsräume, nicht Menschen. Sie ist keine Planwirtschaft, keine Sprachpolizei und kein Social-Credit-System.</p>
        </aside>
        <section class="live-reference-notice">
          <h2>Versionshinweis</h2>
          <p>Stand: {DATE_LABEL}. Öffentliche Downloadfassung: WÖK-CI-PDF.</p>
        </section>
        <section class="article-body">
{body_html}
        </section>
      </article>
      <aside class="reading-sidebar" data-search-exclude>
        <section class="toc-card">
          <p class="hero-kicker">Inhalt</p>
          <h2>Abschnitte</h2>
          {side_nav(toc)}
        </section>
        <section class="toc-card">
          <p class="hero-kicker">Begriffe</p>
          <h2>Verknüpfte Glossarbegriffe</h2>
          <div class="document-chip-row"><a href="../../begriffe/wissensgesellschaft/">Wissensgesellschaft</a><a href="../../begriffe/wirkungsgesellschaft/">Wirkungsgesellschaft</a><a href="../../begriffe/wirkung/">Wirkung</a><a href="../../begriffe/positive-netto-wirkung/">Positive Netto-Wirkung</a><a href="../../begriffe/wirkungsrueckkopplung/">Wirkungsrückkopplung</a><a href="../../begriffe/wirkungsarchitektur/">Wirkungsarchitektur</a><a href="../../begriffe/reverse-merit-order/">Reverse Merit Order</a><a href="../../begriffe/sdg-plus/">SDG+</a><a href="../../begriffe/medienqualitaet/">Medienqualität</a></div>
        </section>
        <section class="toc-card">
          <p class="hero-kicker">Weiterlesen</p>
          <h2>Verwandte Seiten</h2>
          <ul><li><a href="../../verstehen/wissensgesellschaft-wirkungsgesellschaft/">Verstehen-Seite zum Thema</a></li><li><a href="../../blog/von-der-wissensgesellschaft-zur-wirkungsgesellschaft.html">Journal-Beitrag</a></li><li><a href="../../dokumente/grundlagenpapier-wirkungsoekonomie-woek/">Grundlagenpapier Wirkungsökonomie</a></li><li><a href="../../dokumente/systemmodell-der-wirkungsoekonomie/">Systemmodell der Wirkungsökonomie</a></li><li><a href="../../dokumente/wirkungsfinanzpolitik/">Wirkungsfinanzpolitik-Aufsatz</a></li></ul>
        </section>
      </aside>
    </main>{footer}"""


def render_library(source_hash: str) -> str:
    header, footer = shell(2)
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(TITLE)} - Bibliothek | Wirkungsökonomie</title>
    <meta name="description" content="{esc(DOSSIER_DESCRIPTION)}">
    <meta name="search_title" content="{esc(TITLE)}">
    <meta name="search_description" content="{esc(DOSSIER_DESCRIPTION)}">
    <meta name="search_section" content="Bibliothek">
    <meta name="search_type" content="Dossier">
    <meta name="search_tags" content="Wissensgesellschaft, Wirkungsgesellschaft, Dossier, Labels, Zertifikate, Scores, Rückkopplung, positive Netto-Wirkung">
    <link rel="canonical" href="https://wirkungsoekonomie.de/bibliothek/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
{header}    <main id="inhalt" data-pagefind-body>
      <section class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Bibliothek</a> / {esc(TITLE)}</nav>
          <p class="hero-kicker">Dossier · Öffentliche Fassung · {DATE_LABEL}</p>
          <h1 class="hero-title">{esc(TITLE)}</h1>
          <p class="hero-subtitle">{esc(DOSSIER_DESCRIPTION)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="../../dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/">Online lesen</a>
            <a class="btn btn-secondary" href="../../public/downloads/originals/von-der-wissensgesellschaft-zur-wirkungsgesellschaft-dossier.pdf">PDF öffnen</a>
            <a class="btn btn-secondary" href="../../blog/von-der-wissensgesellschaft-zur-wirkungsgesellschaft.html">Journal-Beitrag</a>
          </div>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="../../assets/img/blog/2026-06-15-wissensgesellschaft-wirkungsgesellschaft.webp" width="1672" height="941" alt="{esc(IMAGE_ALT)}" loading="lazy">
        </figure>
      </section>
      <section class="section">
        <article class="download-card">
          <p class="hero-kicker">Öffentliche Dossierfassung</p>
          <h2>Dossier als öffentliche PDF-Fassung</h2>
          <p>Das Dossier ergänzt die Argumentation um Labels, Zertifikate, Scores, Green-Claims, Faktenchecks, Folgenchecks und die Unterscheidung von Sichtbarkeit, Bewertung und Rückkopplung.</p>
        </article>
      </section>
    </main>{footer}"""


def convert_image() -> None:
    if not SOURCE_IMAGE.exists():
        raise SystemExit(f"Missing image: {SOURCE_IMAGE}")
    IMAGE_TARGET.parent.mkdir(parents=True, exist_ok=True)
    try:
        from PIL import Image
        img = Image.open(SOURCE_IMAGE)
        img.save(IMAGE_TARGET, "WEBP", quality=86, method=6)
    except Exception:
        subprocess.run(["sips", "-s", "format", "webp", str(SOURCE_IMAGE), "--out", str(IMAGE_TARGET)], check=True)


def build_pdf() -> None:
    if not DOSSIER_SOURCE.exists():
        raise SystemExit(f"Missing dossier source: {DOSSIER_SOURCE}")
    INTERNAL_DOCX.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(DOSSIER_SOURCE, INTERNAL_SOURCE_COPY)
    apply_script = ROOT / "scripts" / "publications" / "apply-woek-dossier-template.py"
    cmd = [
        str(BUNDLED_PYTHON),
        str(apply_script),
        str(DOSSIER_SOURCE),
        str(INTERNAL_DOCX),
        "--document-type",
        "Dossier",
        "--title",
        TITLE,
        "--subtitle",
        DOSSIER_SUBTITLE,
        "--version",
        "v2.0",
        "--fassung",
        "Erweiterte öffentliche Dossierfassung",
        "--stand",
        DATE_LABEL,
        "--author",
        AUTHOR,
        "--start-heading",
        "Executive Summary",
    ]
    subprocess.run(cmd, check=True, cwd=ROOT)
    with os.scandir(INTERNAL_DOCX.parent) as _:
        pass
    out_dir = PUBLIC_PDF.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "/opt/homebrew/bin/soffice",
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            str(out_dir),
            str(INTERNAL_DOCX),
        ],
        check=True,
        cwd=ROOT,
    )
    generated = out_dir / (INTERNAL_DOCX.stem + ".pdf")
    if generated.exists() and generated != PUBLIC_PDF:
        generated.replace(PUBLIC_PDF)
    if not PUBLIC_PDF.exists():
        raise SystemExit(f"PDF was not created: {PUBLIC_PDF}")


def update_metadata_files() -> None:
    tags = [
        "Wissensgesellschaft",
        "Wirkungsgesellschaft",
        "Labels",
        "Zertifikate",
        "Scores",
        "Faktencheck",
        "Folgencheck",
        "Wirkungsrückkopplung",
        "positive Netto-Wirkung",
    ]
    docs_json = ROOT / "content" / "documents" / "documents.json"
    data = json.loads(docs_json.read_text(encoding="utf-8"))
    documents = data["documents"] if isinstance(data, dict) else data
    for item in documents:
        if item.get("slug") == "von-der-wissensgesellschaft-zur-wirkungsgesellschaft":
            item["version"] = "v2.0"
            item["summaryShort"] = SUMMARY_SHORT
            item["summary"] = DOSSIER_DESCRIPTION
            item["description"] = DOSSIER_DESCRIPTION
            item["date"] = "2026-06-15"
            item["topics"] = tags
            item["tags"] = tags
            item["fileSize"] = "349 KB"
            item["pageCount"] = 21
            item["estimatedReadingTime"] = "36 Min."
    docs_json.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    library_json = ROOT / "assets" / "data" / "document-library.json"
    if library_json.exists():
        library = json.loads(library_json.read_text(encoding="utf-8"))
        library_documents = library["documents"] if isinstance(library, dict) else library
        for item in library_documents:
            if item.get("slug") == "von-der-wissensgesellschaft-zur-wirkungsgesellschaft":
                item["summaryShort"] = SUMMARY_SHORT
                item["topics"] = tags
                item["pageCount"] = 21
                item["estimatedReadingTime"] = "36 Min."
        library_json.write_text(json.dumps(library, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    version_registry = ROOT / "assets" / "data" / "library-version-registry.json"
    if version_registry.exists():
        registry = json.loads(version_registry.read_text(encoding="utf-8"))
        registry_documents = registry["documents"] if isinstance(registry, dict) else registry
        for item in registry_documents:
            urls = item.get("urls", {})
            source_path = urls.get("sourcePath", "")
            if source_path in {
                "dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html",
                "public/downloads/originals/von-der-wissensgesellschaft-zur-wirkungsgesellschaft-dossier.pdf",
            }:
                item["shortDescription"] = DOSSIER_DESCRIPTION
                item["dateOrStand"] = DATE_LABEL
        version_registry.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    for path in (JOURNAL_SOURCE, DOSSIER_SOURCE):
        if not path.exists():
            raise SystemExit(f"Missing source DOCX: {path}")
    convert_image()
    build_pdf()
    source_hash = digest(DOSSIER_SOURCE)

    journal_blocks = stop_before_headings(
        body_from_first_heading(read_docx_blocks(JOURNAL_SOURCE), "1. Der Rauchmelder piept - aber wer schaltet den Herd aus?"),
        {"Quellen und Arbeitsgrundlagen", "Redaktioneller Hinweis", "Glossar-Links für die Website-Fassung"},
    )
    dossier_blocks = body_from_first_heading(read_docx_blocks(DOSSIER_SOURCE), "Executive Summary")
    journal_html, journal_toc = render_blocks(journal_blocks, "../", "journal-wg")
    dossier_html, dossier_toc = render_blocks(dossier_blocks, "../../", "dossier-wg")

    ARTICLE_PATH.write_text(render_article(journal_html, journal_toc), encoding="utf-8")
    DOCUMENT_PATH.write_text(render_document(dossier_html, dossier_toc, source_hash), encoding="utf-8")
    BIBLIOTHEK_PATH.write_text(render_library(source_hash), encoding="utf-8")
    update_metadata_files()
    print(f"Updated {ARTICLE_PATH.relative_to(ROOT)}")
    print(f"Updated {DOCUMENT_PATH.relative_to(ROOT)}")
    print(f"Updated {BIBLIOTHEK_PATH.relative_to(ROOT)}")
    print(f"Updated {PUBLIC_PDF.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
