#!/usr/bin/env python3
"""Importiert das detaillierte Aktionsplan-Update als Journalartikel.

Der Import übernimmt den freigegebenen Text aus der Word-Datei, verwendet die
bestehende Journal-Shell und hält Quellenanker, Inhaltsverzeichnis und
Publikationsprüfung zusammen. Die beiden methodischen IOOI-Stellen werden hier
bewusst auf den Begriffsleitfaden v1.8 gebracht.

Aufruf:
SOURCE_DOCX=/absoluter/pfad.docx TITLE_IMAGE=/absoluter/pfad.png \
python3 scripts/import/import-aktionsplan-update-journal.py
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
SLUG = "aktionsplan-nachhaltigkeit-detailliertes-update-2026-10-05"
TITLE = "Detailliertes Update: Aktionsplan Nachhaltigkeit - vom Kabinettsbeschluss zur tatsächlichen Wirkung"
SUBTITLE = (
    "Was die 20 Missionen konkret vorsehen, was seit dem ersten Journalbeitrag neu geklärt ist "
    "und woran sich die Bundesregierung jetzt messen lassen muss"
)
DESCRIPTION = (
    "Das detaillierte Update zum Aktionsplan Nachhaltigkeit: 20 Missionen, neue Konkretisierungen, "
    "bestehende staatliche Prüfarchitektur und die wirkungsökonomischen Fragen für Umsetzung und Lernen."
)
DATE = "5. Oktober 2026"
DATE_ISO = "2026-10-05T12:00:00+02:00"
SECTION = "Nachhaltigkeit & Regierungssteuerung"
HERO_IMAGE = "2026-10-05-aktionsplan-nachhaltigkeit-detailliertes-update-2026.png"
HERO_ALT = (
    "KI-generierte redaktionelle Titelillustration zum detaillierten Update des Aktionsplans "
    "Nachhaltigkeit mit Berliner Regierungsgebäuden, fünf Handlungsfeldern und 20 Missionen. "
    "Keine amtliche Veröffentlichung der Bundesregierung."
)
TAGS = [
    "Aktionsplan Nachhaltigkeit",
    "20 Missionen",
    "Deutsche Nachhaltigkeitsstrategie",
    "Wirkungssteuerung",
    "Wirkungsökonomie",
    "IOOI",
    "Nachhaltigkeitsprüfung",
    "Policy Coherence",
    "öffentliche Beschaffung",
]
ARTICLE = ROOT / "blog" / f"{SLUG}.html"
ASSETS = ROOT / "assets" / "img" / "blog"
REVIEW = ROOT / "docs" / "journal" / f"2026-10-05-{SLUG}-publication-review.json"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
W = "{%s}" % NS["w"]
R = "{%s}" % NS["r"]

OLD_SVIK = (
    "Wirkungsökonomische Einordnung. Diese Mission liegt der WÖk methodisch am nächsten, ist aber nicht mit der WÖk identisch. "
    "IOOI ordnet eine Ergebniskette. Die WÖk setzt davor mit Problem Review und Goal Review an und ergänzt Evidenz, Gegenfaktum, "
    "Zurechnung, Verteilung, Wirkungen erster bis dritter Ordnung, Schutzgrenzen und Rückkopplung. Eine hohe FWK darf deshalb nie "
    "so kommuniziert werden, als sei automatisch eine hohe gesellschaftliche Wirkung bewiesen. [15]"
)
NEW_SVIK = (
    "Wirkungsökonomische Einordnung. Diese Mission liegt der WÖk methodisch besonders nahe, ist aber nicht mit ihr identisch. "
    "IOOI kann als optionale Results Chain einen Teil des Wirkgeschehens in Input, Output, Outcome und Impact strukturieren. "
    "Die Wirkungsökonomie setzt im Entscheidungsprozess bereits bei Problem Review und Goal Review an und verbindet die Ergebniskette "
    "mit Wirkpfad, Evidenz und Zurechnung, Datenarchitektur, System- und Verteilungsprüfung, Schutzgrenzen, Bewertung sowie Rückkopplung "
    "und Lernen. Eine hohe Fortschritts- und Wirkungskennzahl ist deshalb noch kein automatischer Nachweis hoher gesellschaftlicher Wirkung. [15]"
)
OLD_IOOI_STEP = "5. Ergebnisstufen: Input, Output, Outcome und Impact nur dort nutzen, wo die Kette passt - und nicht miteinander verwechseln."
NEW_IOOI_STEP = (
    "IOOI / Results Chain: Input, Output, Outcome und Impact dort zur Strukturierung verwenden, wo eine Ergebniskette fachlich sinnvoll ist. "
    "IOOI ist eine optionale Anschlussmethode innerhalb der Wirkungsermittlung und nicht die Gesamtarchitektur der Wirkungsökonomie."
)


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
                if href
                else value
            )
    return "".join(rendered)


def linkify_refs(value: str) -> str:
    """Verlinkt Quellenmarker, ohne externe Hyperlinks erneut zu interpretieren."""
    return re.sub(
        r"\[(\d+)([^\]]*)\]",
        lambda match: (
            f'<a class="text-link source-ref" href="#quelle-{match.group(1)}" '
            f'aria-label="Quelle {match.group(1)}">[{match.group(1)}{match.group(2)}]</a>'
        ),
        value,
    )


def slugify(value: str) -> str:
    replacements = {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "Ä": "Ae", "Ö": "Oe", "Ü": "Ue"}
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = value.lower().replace("&", " und ")
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "abschnitt"


def read_paragraphs() -> list[dict[str, object]]:
    with ZipFile(SOURCE_DOCX) as doc:
        body = ET.fromstring(doc.read("word/document.xml")).find("w:body", NS)
        links = external_links(doc)
    if body is None:
        raise ValueError("Die Word-Datei enthält keinen Dokumentkörper.")
    paragraphs: list[dict[str, object]] = []
    for element in body.findall("w:p", NS):
        text = paragraph_text(element)
        if not text:
            continue
        style = paragraph_style(element)
        if text == OLD_SVIK:
            text = NEW_SVIK
        elif text == OLD_IOOI_STEP:
            text = NEW_IOOI_STEP
        paragraphs.append({"style": style, "text": text, "html": inline_html(element, links)})
    # The two corrections replace the complete source paragraph, including its
    # source marker. Rendering from plain text keeps the wording exact.
    for item in paragraphs:
        if item["text"] == NEW_SVIK:
            item["html"] = esc(NEW_SVIK)
        elif item["text"] == NEW_IOOI_STEP:
            item["html"] = esc(NEW_IOOI_STEP)
    return paragraphs


def copy_assets() -> tuple[str, str]:
    ASSETS.mkdir(parents=True, exist_ok=True)
    target = ASSETS / HERO_IMAGE
    if TITLE_IMAGE.resolve() != target.resolve():
        shutil.copy2(TITLE_IMAGE, target)
    return hashlib.sha256(SOURCE_DOCX.read_bytes()).hexdigest(), hashlib.sha256(target.read_bytes()).hexdigest()


def render_article_body(paragraphs: list[dict[str, object]]) -> tuple[str, list[dict[str, object]], int]:
    body: list[str] = []
    headings: list[dict[str, object]] = []
    used_ids: set[str] = set()
    in_numbered_list = False
    word_count = 0

    def close_list() -> None:
        nonlocal in_numbered_list
        if in_numbered_list:
            body.append("          </ol>")
            in_numbered_list = False

    def heading(level: str, text: str) -> None:
        nonlocal used_ids
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

    # Word metadata occupies the first six meaningful paragraphs. The lead is
    # retained in the article body; the remaining metadata becomes the hero.
    for index, item in enumerate(paragraphs):
        style = str(item["style"])
        text = str(item["text"])
        inline = str(item["html"])
        if index < 6 and style in {"Kicker", "Titel", "Untertitel", "Meta"}:
            continue
        if style == "Lead":
            close_list()
            word_count += len(re.findall(r"\b[\wÄÖÜäöüß’-]+\b", text))
            body.append(f"          <p class=\"article-lead\"><strong>{linkify_refs(inline)}</strong></p>")
            continue
        if style == "berschrift1":
            close_list()
            heading("h2", text)
            continue
        if style == "berschrift2":
            close_list()
            heading("h3", text)
            continue
        if style == "SourceNote":
            close_list()
            match = re.match(r"^\[(\d+)\](.*)$", text)
            if match:
                number, remainder = match.group(1), match.group(2).lstrip()
                rendered = inline
                rendered = re.sub(r"^\[" + re.escape(number) + r"\]", "", rendered, count=1).lstrip()
                body.append(
                    f'          <p class="source-entry" id="quelle-{number}" style="break-after:avoid-page;break-inside:avoid-page">'
                    f'<strong>[{number}]</strong> {rendered}</p>'
                )
            else:
                body.append(f'          <p class="source-entry">{inline}</p>')
            word_count += len(re.findall(r"\b[\wÄÖÜäöüß’-]+\b", text))
            continue
        if style.lower().startswith("aufz"):
            if not in_numbered_list:
                body.append("          <ol>")
                in_numbered_list = True
            item_text = re.sub(r"^\d+\.\s+", "", text)
            body.append(f"            <li>{esc(item_text)}</li>")
            word_count += len(re.findall(r"\b[\wÄÖÜäöüß’-]+\b", text))
            continue
        close_list()
        word_count += len(re.findall(r"\b[\wÄÖÜäöüß’-]+\b", text))
        body.append(f"          <p>{linkify_refs(inline)}</p>")

    close_list()
    return "\n".join(body), headings, word_count


def toc_html(headings: list[dict[str, object]]) -> str:
    output = [
        '          <details class="toc-card no-print" data-search-exclude>',
        "            <summary>In diesem Beitrag: 20 Missionen, Einordnung und Lernarchitektur</summary>",
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
            continue
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


def write_review(source_sha: str, image_sha: str, headings: list[dict[str, object]], word_count: int) -> None:
    REVIEW.parent.mkdir(parents=True, exist_ok=True)
    source_urls = {
        1: "https://www.bundesregierung.de/resource/blob/975228/2454612/a7e895a521b75a36851a240efb7faa2a/2026-09-30-aktionspla-nachhaltigkeit-data.pdf?download=1",
        2: "https://www.bundesregierung.de/breg-de/aktuelles/aktionsplan-nachhaltigkeit-2440506",
        3: "https://www.bundesregierung.de/breg-de/aktuelles/regierungspressekonferenz-vom-30-september-2026-2454960",
        4: "https://www.bundesregierung.de/breg-de/aktuelles/deutsche-nachhaltigkeitsstrategie-2025-2332540",
        5: "https://www.bundesregierung.de/breg-de/aktuelles/bundeskabinett-ergebnisse-2332544",
        6: "https://www.bundesregierung.de/resource/blob/975228/2392386/67432238cb5403c55e01fa06a156c0a9/2025-11-05-beschluss-nachhaltigkeit-data.pdf?download=1",
        7: "https://www.bundesregierung.de/resource/blob/992814/2409256/36002029c65060206c935ea2d7f1e4da/2026-03-02-sta-nez-beschluss-vom-23-02-2026-data.pdf?download=1",
        8: "https://www.bundesumweltministerium.de/pressemitteilung/deutschland-legt-fahrplan-fuer-abkehr-von-fossilen-energien-vor",
        9: "https://deutscher-nachhaltigkeitskodex.de/de/ueber-uns/was-wir-tun/",
        10: "https://www.deutscher-nachhaltigkeitskodex.de/de/bericht-erstellen/csrd-vsme/dnk-plattform/",
        11: "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/07/20260710-gebaeudemodernisierungsgesetz.html",
        12: "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/01/20260115-grundsatzeinigung-mit-europaeischen-kommission-ueber-eckpunkte-der-kraftwerksstrategie.html",
        13: "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/08/20260826-eckpunkte-waermenetzpaket.html",
        14: "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Reden/2026/rede-katherina-reiche-beim-ersten-wirtschaftspolitischen-symposium-in-berlin.html",
        16: "https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2026/07/Inhalte/Kapitel-2-Analysen/2-1-monitoring-svik.html",
    }
    review = {
        "article": f"https://wirkungsoekonomie.de/blog/{SLUG}.html",
        "date": "2026-10-05",
        "author": "Natalie Weber",
        "sourceManuscriptSha256": source_sha,
        "imageSha256": image_sha,
        "manuscriptPreserved": True,
        "sourceCount": 16,
        "sources": [{"number": number, "urls": [url]} for number, url in source_urls.items()],
        "changes": [
            "Word-Fassung vollständig in die bestehende Journalvorlage übernommen; Titelbild unverändert übernommen.",
            "IOOI im SVIK-Abschnitt ausdrücklich als externe, optionale Results Chain innerhalb der WÖk präzisiert.",
            "Methodenpunkt 5 auf IOOI / Results Chain als optionale Anschlussmethode nach Begriffsleitfaden v1.8 aktualisiert.",
            "Ein Quellenanker, ein aufklappbares Inhaltsverzeichnis und PDF-/Suchmetadaten ergänzt.",
        ],
        "checks": {
            "trackedChanges": 0,
            "comments": 0,
            "mainTextWords": word_count,
            "headings": len(headings),
            "sourceEntries": 16,
            "iooiCorrections": 2,
            "tocComponents": 1,
        },
        "deployment": "GitHub Pages; Live-Abnahme nach erfolgreichem Deployment",
    }
    REVIEW.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_article(source_sha: str, image_sha: str) -> None:
    paragraphs = read_paragraphs()
    body, headings, word_count = render_article_body(paragraphs)
    header, footer = site_shell()
    meta = next(str(item["text"]) for item in paragraphs if item["style"] == "Meta")
    meta_update = list(item["text"] for item in paragraphs if item["style"] == "Meta")[1]
    meta_update = meta_update.replace("Update 1.0Dieses", "Update 1.0. Dieses")
    reading_minutes = max(1, round(word_count / 220))
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
    <p class="hero-kicker">{esc(SECTION)} · {DATE} · {reading_minutes} Min.</p>
    <h1 class="hero-title">{esc(TITLE)}</h1>
    <p class="hero-subtitle">{esc(SUBTITLE)}</p>
    <p class="journal-pdf-download-row no-print" data-search-exclude><a class="btn btn-secondary journal-pdf-download" data-journal-pdf-download href="../assets/pdf/journal/{SLUG}.pdf" download>PDF herunterladen</a></p>
    <p class="meta">{esc(meta)}</p>
    <p class="meta">{esc(meta_update)}</p>
  </div>
  <figure class="hero-system-visual article-visual"><img src="../assets/img/blog/{HERO_IMAGE}" width="1672" height="941" alt="{esc(HERO_ALT)}" decoding="async" fetchpriority="high"><figcaption>KI-generierte redaktionelle Titelillustration. Keine amtliche Veröffentlichung oder Dokumentenabbildung der Bundesregierung.</figcaption></figure>
</article>
<section class="article-page"><div class="article-body">
{toc}
{body}
          <p><strong>Weiterlesen:</strong> <a class="text-link" href="../blog/aktionsplan-nachhaltigkeit-2026-20-missionen.html">Der Aktionsplan ist da: die erste Einordnung der 20 Missionen</a>, <a class="text-link" href="../wirkungsoekonomie.html">Wirkungsökonomie</a> und <a class="text-link" href="../begriffe/nichtkompensationsprinzip/">Nichtkompensation</a>.</p>
          <p><a class="text-link" href="../blog.html">Zurück zum Journal</a></p>
</div></section>
</main>
{footer}'''
    ARTICLE.write_text(article, encoding="utf-8")
    write_review(source_sha, image_sha, headings, word_count)


if __name__ == "__main__":
    if not SOURCE_DOCX.is_file() or not TITLE_IMAGE.is_file():
        raise FileNotFoundError("SOURCE_DOCX und TITLE_IMAGE müssen auf vorhandene Dateien zeigen.")
    source_sha, image_sha = copy_assets()
    write_article(source_sha, image_sha)
    print(f"geschrieben: {ARTICLE}")
