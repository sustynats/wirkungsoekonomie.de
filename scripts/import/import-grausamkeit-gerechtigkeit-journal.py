#!/usr/bin/env python3
"""Importiert den Journalbeitrag über Entmenschlichung als Journalartikel.

Die Word-Datei wird als Manuskriptquelle bewahrt und das bereitgestellte
Titelbild als redaktionelles Asset übernommen.
Aufruf:

SOURCE_DOCX=/absoluter/pfad.docx TITLE_IMAGE=/absoluter/pfad.png \
python3 scripts/import/import-grausamkeit-gerechtigkeit-journal.py
"""
from __future__ import annotations

import hashlib
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

SLUG = "wenn-grausamkeit-als-gerechtigkeit-gilt"
TITLE = "Wenn Grausamkeit als Gerechtigkeit gilt"
SUBTITLE = "Wie aus Menschen Bedrohungen gemacht werden – und warum die gesellschaftlichen Kosten weit über Hasskommentare hinausgehen"
DESCRIPTION = (
    "Meinung und Analyse: Wie Feindbilder entstehen, Menschen entwürdigt werden und welche gesellschaftlichen "
    "Folgen Polarisierung, Hass und Ausgrenzung haben können."
)
DATE = "15. Oktober 2026"
DATE_ISO = "2026-10-15T18:00:00+02:00"
SECTION = "Meinung & Analyse"
HERO_IMAGE = "2026-10-15-wenn-grausamkeit-als-gerechtigkeit-gilt.png"
HERO_ALT = (
    "Titelillustration: eine Frau zwischen düsteren Feindbild-Parolen und einer hellen Szene "
    "mit dem Schild ‚Menschen statt Schlagzeilen‘. Symbolbild, keine dokumentarische Aufnahme."
)
TAGS = [
    "Entmenschlichung", "Feindbilder", "Migration", "Queerfeindlichkeit",
    "Demokratie", "Polarisierung", "Wirkungsökonomie", "Wirkungsrisiko",
]
ARTICLE = ROOT / "blog" / f"{SLUG}.html"
ASSETS = ROOT / "assets" / "img" / "blog"
REVIEW = ROOT / "docs" / "journal" / f"2026-10-15-{SLUG}-publication-review.json"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
W = "{%s}" % NS["w"]
R = "{%s}" % NS["r"]


def esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def paragraph_style(element: ET.Element) -> str:
    style = element.find("w:pPr/w:pStyle", NS)
    return style.get(W + "val", "Normal") if style is not None else "Normal"


def paragraph_text(element: ET.Element) -> str:
    return "".join(node.text or "" for node in element.findall(".//w:t", NS)).strip()


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
    rendered = esc(value)
    properties = run.find("w:rPr", NS)
    bold = properties.find("w:b", NS) if properties is not None else None
    italic = properties.find("w:i", NS) if properties is not None else None
    if bold is not None and bold.get(W + "val", "1") not in {"0", "false", "off"}:
        rendered = f"<strong>{rendered}</strong>"
    if italic is not None and italic.get(W + "val", "1") not in {"0", "false", "off"}:
        rendered = f"<em>{rendered}</em>"
    return rendered


def inline_html(element: ET.Element, links: dict[str, str]) -> str:
    rendered: list[str] = []
    for child in element:
        if child.tag == W + "r":
            rendered.append(run_html(child))
        elif child.tag == W + "hyperlink":
            value = "".join(run_html(run) for run in child.findall("w:r", NS))
            href = links.get(child.get(R + "id", ""))
            rendered.append(
                f'<a class="text-link" href="{esc(href)}" rel="noopener noreferrer">{value}</a>'
                if href else value
            )
    return "".join(rendered)


def linkify_refs(value: str) -> str:
    return re.sub(
        r"\[(\d+)\]",
        lambda match: (
            f'<a class="text-link source-ref" href="#quelle-{match.group(1)}" '
            f'aria-label="Quelle {match.group(1)}">[{match.group(1)}]</a>'
        ),
        value,
    )


def slugify(value: str) -> str:
    replacements = {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "Ä": "Ae", "Ö": "Oe", "Ü": "Ue"}
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = value.lower().replace("&", " und ")
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-") or "abschnitt"


def read_paragraphs() -> tuple[list[dict[str, object]], int, int]:
    with ZipFile(SOURCE_DOCX) as doc:
        root = ET.fromstring(doc.read("word/document.xml"))
        body = root.find("w:body", NS)
        links = external_links(doc)
        tracked = len(root.findall(".//w:ins", NS)) + len(root.findall(".//w:del", NS))
        comments = 1 if "word/comments.xml" in doc.namelist() else 0
    if body is None:
        raise ValueError("Die Word-Datei enthält keinen Dokumentkörper.")
    paragraphs: list[dict[str, object]] = []
    for element in body.findall("w:p", NS):
        text = paragraph_text(element)
        has_image = bool(element.findall(".//a:blip", NS))
        if not text and not has_image:
            continue
        paragraphs.append({
            "style": paragraph_style(element),
            "text": text,
            "html": inline_html(element, links),
            "image": has_image,
            "urls": [href for href in links.values() if href and href in inline_html(element, links)],
        })
    return paragraphs, tracked, comments


def copy_assets() -> tuple[str, str]:
    ASSETS.mkdir(parents=True, exist_ok=True)
    hero = ASSETS / HERO_IMAGE
    if TITLE_IMAGE.resolve() != hero.resolve():
        shutil.copy2(TITLE_IMAGE, hero)
    return (
        hashlib.sha256(SOURCE_DOCX.read_bytes()).hexdigest(),
        hashlib.sha256(hero.read_bytes()).hexdigest(),
    )


def word_count(text: str) -> int:
    return len(re.findall(r"\b[\wÄÖÜäöüß’-]+\b", text))


def render_article_body(paragraphs: list[dict[str, object]]) -> tuple[str, list[dict[str, object]], int, int]:
    body: list[str] = []
    headings: list[dict[str, object]] = []
    used_ids: set[str] = set()
    total_words = 0

    def heading(level: str, text: str) -> None:
        base = slugify(text)
        identifier = base
        suffix = 2
        while identifier in used_ids:
            identifier = f"{base}-{suffix}"
            suffix += 1
        used_ids.add(identifier)
        tag = "h2" if level == "h2" else "h3"
        body.append(f'          <{tag} id="{identifier}" style="break-inside:avoid-page">{esc(text)}</{tag}>')
        headings.append({"level": level, "id": identifier, "text": text})

    metadata_styles = {"JournalTitle", "JournalDeck", "JournalKicker", "JournalByline", "JournalLead"}
    for item in paragraphs:
        style = str(item["style"])
        text = str(item["text"])
        inline = str(item["html"])
        if style in metadata_styles:
            continue
        if style == "JournalH2":
            heading("h2", text)
            continue
        if style == "JournalQuote":
            body.append(f"          <blockquote><p>{linkify_refs(inline)}</p></blockquote>")
            total_words += word_count(text)
            continue
        if style == "JournalSource":
            match = re.match(r"^\[(\d+)\](.*)$", text)
            if match:
                number = match.group(1)
                rendered = re.sub(r"^\[" + re.escape(number) + r"\]", "", inline, count=1).lstrip()
                body.append(
                    f'          <p class="source-entry" id="quelle-{number}" style="break-after:avoid-page;break-inside:avoid-page">'
                    f'<strong>[{number}]</strong> {rendered}</p>'
                )
            else:
                body.append(f'          <p class="source-entry">{inline}</p>')
            total_words += word_count(text)
            continue
        if style == "JournalMethod":
            body.append(f'          <p class="source-entry">{linkify_refs(inline)}</p>')
            total_words += word_count(text)
            continue
        rendered = linkify_refs(inline)
        body.append(f"          <p>{rendered}</p>")
        total_words += word_count(text)
    return "\n".join(body), headings, total_words, sum(1 for item in paragraphs if item["style"] == "JournalSource")


def toc_html(headings: list[dict[str, object]]) -> str:
    output = [
        '          <details class="toc-card no-print" data-search-exclude>',
        "            <summary>In diesem Beitrag</summary>",
        "            <ul>",
    ]
    h2_open = False
    nested_open = False
    for item in headings:
        if item["level"] == "h2":
            if nested_open:
                output.append("                </ul>")
                nested_open = False
            if h2_open:
                output.append("              </li>")
            output.append(f'              <li><a href="#{item["id"]}">{esc(str(item["text"]))}</a>')
            h2_open = True
        else:
            if not h2_open:
                output.append("              <li>")
                h2_open = True
            if not nested_open:
                output.append("                <ul>")
                nested_open = True
            output.append(f'                  <li><a href="#{item["id"]}">{esc(str(item["text"]))}</a></li>')
    if nested_open:
        output.append("                </ul>")
    if h2_open:
        output.append("              </li>")
    output.extend(["            </ul>", "          </details>"])
    return "\n".join(output)


def site_shell() -> tuple[str, str]:
    source = (ROOT / "blog" / "aktionsplan-nachhaltigkeit-2026-20-missionen.html").read_text(encoding="utf-8")
    header_start = source.index('<header class="site-header"')
    main_start = source.index("<main", header_start)
    main_end = source.rindex("</main>")
    return source[header_start:main_start], source[main_end + len("</main>") :]


def source_urls(paragraphs: list[dict[str, object]]) -> dict[str, list[str]]:
    values: dict[str, list[str]] = {}
    for item in paragraphs:
        if item["style"] != "JournalSource":
            continue
        match = re.match(r"^\[(\d+)\]", str(item["text"]))
        if match:
            values[match.group(1)] = list(dict.fromkeys(item.get("urls", [])))
    return values


def write_review(source_sha: str, image_sha: str, headings: list[dict[str, object]], word_total: int, source_total: int, paragraphs: list[dict[str, object]], tracked: int, comments: int) -> None:
    REVIEW.parent.mkdir(parents=True, exist_ok=True)
    urls = source_urls(paragraphs)
    review = {
        "article": f"https://wirkungsoekonomie.de/blog/{SLUG}.html",
        "date": "2026-10-15",
        "author": "Natalie Weber",
        "sourceManuscriptSha256": source_sha,
        "imageSha256": image_sha,
        "manuscriptPreserved": True,
        "sourceCount": len(urls),
        "sources": [{"number": number, "urls": values} for number, values in sorted(urls.items())],
        "changes": [
            "Word-Fassung vollständig in die bestehende Journalvorlage übernommen; bereitgestelltes Titelbild als redaktionelles Asset übernommen.",
            "Quellenanker, ein aufklappbares Inhaltsverzeichnis sowie PDF-, Feed- und Suchmetadaten ergänzt.",
            "Meinungs- und Analysecharakter sowie Trennung von berichteten Ereignissen, Studienbefunden und wirkungsökonomischer Einordnung sichtbar gemacht.",
        ],
        "checks": {
            "trackedChanges": tracked,
            "comments": comments,
            "mainTextWords": word_total,
            "headings": len(headings),
            "sourceEntries": source_total,
            "numberedSources": len(urls),
            "tocComponents": 1,
        },
        "deployment": "GitHub Pages; Live-Abnahme nach erfolgreichem Deployment",
    }
    REVIEW.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_article(source_sha: str, image_sha: str, paragraphs: list[dict[str, object]], tracked: int, comments: int) -> None:
    body, headings, word_total, source_total = render_article_body(paragraphs)
    header, footer = site_shell()
    byline = next(str(item["html"]) for item in paragraphs if item["style"] == "JournalByline")
    leads = [str(item["html"]) for item in paragraphs if item["style"] == "JournalLead"]
    lead_html = "\n".join(f'          <p class="article-lead">{lead}</p>' for lead in leads)
    reading_minutes = max(1, round(word_total / 220))
    toc = toc_html(headings)
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
        "author": {"@type": "Person", "name": "Natalie Weber", "url": "https://wirkungsoekonomie.de/natalie-weber.html"},
        "publisher": {"@type": "Organization", "name": "Institut für Wirkungsökonomie", "url": "https://wirkungsoekonomie.de/institut/"},
        "mainEntityOfPage": f"https://wirkungsoekonomie.de/blog/{SLUG}.html",
        "articleSection": SECTION,
        "keywords": TAGS,
    }
    tag_meta = ", ".join(TAGS)
    article = f'''<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(TITLE)} | Wirkungsökonomie</title>
  <meta name="description" content="{esc(DESCRIPTION)}">
  <meta name="search_title" content="{esc(TITLE)}">
  <meta name="search_description" content="{esc(DESCRIPTION)}">
  <meta name="search_section" content="Journal">
  <meta name="search_type" content="Journalartikel">
  <meta name="search_index_kind" content="journal">
  <meta name="search_tags" content="{esc(tag_meta)}">
  <link rel="canonical" href="https://wirkungsoekonomie.de/blog/{SLUG}.html">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="de_DE">
  <meta property="og:site_name" content="Wirkungsökonomie">
  <meta property="og:title" content="{esc(TITLE)}">
  <meta property="og:description" content="{esc(DESCRIPTION)}">
  <meta property="og:url" content="https://wirkungsoekonomie.de/blog/{SLUG}.html">
  <meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/blog/{HERO_IMAGE}">
  <meta property="og:image:alt" content="{esc(HERO_ALT)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(TITLE)}">
  <meta name="twitter:description" content="{esc(DESCRIPTION)}">
  <meta name="twitter:image" content="https://wirkungsoekonomie.de/assets/img/blog/{HERO_IMAGE}">
  <meta name="twitter:image:alt" content="{esc(HERO_ALT)}">
  <meta property="article:published_time" content="{DATE_ISO}">
  <meta property="article:modified_time" content="{DATE_ISO}">
  <meta property="article:section" content="{esc(SECTION)}">
  {''.join(f'<meta property="article:tag" content="{esc(tag)}">' for tag in TAGS)}
  <link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml">
  <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../assets/css/style.css">
  <script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body>
{header}<main data-pagefind-body>
<article class="hero">
  <div class="hero-copy">
    <nav class="breadcrumb journal-breadcrumb" aria-label="Pfadnavigation"><a href="../index.html">Start</a><span aria-hidden="true">/</span><a href="../blog.html">Journal</a></nav>
    <p class="hero-kicker">Meinung &amp; Analyse · {DATE} · {reading_minutes} Min.</p>
    <h1 class="hero-title">{esc(TITLE)}</h1>
    <p class="hero-subtitle">{esc(SUBTITLE)}</p>
    <p class="journal-pdf-download-row no-print" data-search-exclude><a class="btn btn-secondary journal-pdf-download" data-journal-pdf-download href="../assets/pdf/journal/{SLUG}.pdf" download>PDF herunterladen</a></p>
    <p class="meta">{byline}</p>
  </div>
  <figure class="hero-system-visual article-visual"><img src="../assets/img/blog/{HERO_IMAGE}" width="1672" height="941" alt="{esc(HERO_ALT)}" decoding="async" fetchpriority="high"><figcaption>Titelillustration; Symbolbild.</figcaption></figure>
</article>
<section class="article-page"><div class="article-body">
{toc}
{lead_html}
{body}
          <p><strong>Weiterlesen:</strong> <a class="text-link" href="../blog/rechtsruck-fukuyama-suche-nach-bedeutung.html">Rechtsruck und die Suche nach Bedeutung</a>, <a class="text-link" href="../dokumente/leitbild-mensch-planet-demokratie/">Leitbild für Mensch, Planet und Demokratie</a> und <a class="text-link" href="../wirkungsoekonomie.html">Wirkungsökonomie</a>.</p>
          <p><a class="text-link" href="../blog.html">Zurück zum Journal</a></p>
</div></section>
</main>
{footer}'''
    ARTICLE.write_text(article, encoding="utf-8")
    write_review(source_sha, image_sha, headings, word_total, source_total, paragraphs, tracked, comments)


if __name__ == "__main__":
    if not SOURCE_DOCX.is_file() or not TITLE_IMAGE.is_file():
        raise FileNotFoundError("SOURCE_DOCX und TITLE_IMAGE müssen auf vorhandene Dateien zeigen.")
    paragraphs, tracked, comments = read_paragraphs()
    source_sha, image_sha = copy_assets()
    write_article(source_sha, image_sha, paragraphs, tracked, comments)
    print(f"geschrieben: {ARTICLE}")
