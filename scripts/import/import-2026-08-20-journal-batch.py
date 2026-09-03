#!/usr/bin/env python3
"""Importiert die beiden freigegebenen Journalbeiträge vom 20./21. August 2026.

Aufruf:
NACHHALTIGKEIT_DOCX=/absoluter/pfad.docx \
NACHHALTIGKEIT_IMAGE=/absoluter/pfad.png \
ENAP_DOCX=/absoluter/pfad.docx \
ENAP_IMAGE=/absoluter/pfad.png \
python3 scripts/import/import-2026-08-20-journal-batch.py

Die öffentliche Fassung übernimmt den redaktionell freigegebenen Inhalt, entfernt
Arbeits- und Redaktionshinweise, bereinigt Trackingparameter und erzeugt die beiden
statischen Journalartikel im bestehenden Seitentemplate.
"""
from __future__ import annotations

import html
import json
import os
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from xml.etree import ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[2]
NACHHALTIGKEIT_DOCX = Path(os.environ["NACHHALTIGKEIT_DOCX"])
NACHHALTIGKEIT_IMAGE = Path(os.environ["NACHHALTIGKEIT_IMAGE"])
ENAP_DOCX = Path(os.environ["ENAP_DOCX"])
ENAP_IMAGE = Path(os.environ["ENAP_IMAGE"])

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
W = "{%s}" % NS["w"]
R = "{%s}" % NS["r"]


@dataclass(frozen=True)
class Article:
    kind: str
    source: Path
    image_source: Path
    slug: str
    title: str
    subtitle: str
    description: str
    date_label: str
    date_iso: str
    section: str
    reading_time: str
    image_name: str
    image_alt: str
    tags: tuple[str, ...]
    status_note: str


ARTICLES = (
    Article(
        kind="nachhaltigkeit",
        source=NACHHALTIGKEIT_DOCX,
        image_source=NACHHALTIGKEIT_IMAGE,
        slug="nachhaltigkeit-ist-keine-parteifarbe",
        title='CDU/CSU und SPD machen „grüne Politik“ - und keiner soll es wissen?',
        subtitle=(
            "Warum diese Zuspitzung gleich doppelt falsch ist - und warum Deutschlands "
            "neue Nachhaltigkeitsarchitektur trotzdem politisch viel größer ist, als die "
            "öffentliche Debatte vermuten lässt."
        ),
        description=(
            "Deutschland entwickelt aus 25 Jahren Nachhaltigkeitsstrategie eine stärkere "
            "Prüf- und Wirkungsarchitektur. Was DNS, eNAP und Aktionsplan leisten - und was "
            "die Wirkungsökonomie ergänzt."
        ),
        date_label="20. August 2026",
        date_iso="2026-08-20T12:00:00+02:00",
        section="Nachhaltigkeit & Wirkungssteuerung",
        reading_time="20 Min.",
        image_name="2026-08-20-deutschlands-nachhaltigkeitsarchitektur-wirkungssteuerung.png",
        image_alt=(
            "Reichstagsgebäude neben der Deutschen Nachhaltigkeitsstrategie und einem "
            "digitalen Wirkungsdashboard von Zielen über Messung bis zur Wirkung."
        ),
        tags=(
            "Deutsche Nachhaltigkeitsstrategie",
            "Nachhaltigkeit",
            "Wirkungssteuerung",
            "eNAP",
            "Gesetzesfolgenabschätzung",
            "Aktionsplan Nachhaltigkeit",
            "Wirkungsrückkopplung",
            "Nichtkompensation",
            "Reverse Merit Order",
            "SDG+",
        ),
        status_note=(
            "Dieser Beitrag trennt amtliche Strukturen, beobachtete Umsetzungslücken, "
            "Wirkungspotenziale und die normative WÖk-Einordnung. Nachhaltigkeit ist keine "
            "Parteifarbe; eine Prüfarchitektur ist noch kein Nachweis tatsächlich "
            "eingetretener positiver Netto-Wirkung."
        ),
    ),
    Article(
        kind="enap",
        source=ENAP_DOCX,
        image_source=ENAP_IMAGE,
        slug="enap-woek-benchmark-fuenf-bundesvorhaben",
        title="eNAP × WÖk-Benchmark mit fünf realen Bundesvorhaben",
        subtitle=(
            "Was der Vergleich von staatlicher Nachhaltigkeitsprüfung und "
            "wirkungsökonomischer Analyse zeigt - einschließlich der Lücken im WÖk-Masterregister."
        ),
        description=(
            "Fünf Bundesvorhaben im Vergleich: eNAP und WÖk erreichen 80 Prozent "
            "Richtungsübereinstimmung. Der Unterschied liegt in Wirkpfad, Evidenz, "
            "Nebenfolgen und Rückkopplung."
        ),
        date_label="21. August 2026",
        date_iso="2026-08-21T10:30:00+02:00",
        section="Politik & Wirkungssteuerung",
        reading_time="5 Min.",
        image_name="2026-08-21-enap-woek-benchmark-fuenf-bundesvorhaben.png",
        image_alt=(
            "Vergleich von eNAP-Nachhaltigkeitsprüfung und WÖk-Wirkungsmodell vor dem "
            "Reichstagsgebäude mit Gesetzesvorlage und Wirkungsfeldern."
        ),
        tags=(
            "eNAP",
            "WÖk-Benchmark",
            "Gesetzesfolgenabschätzung",
            "Deutsche Nachhaltigkeitsstrategie",
            "Wirkungspotenzial",
            "Wirkungsrisiko",
            "Wirkpfad",
            "Evidenz",
            "Wirkungsrückkopplung",
            "WÖk-Masterregister",
        ),
        status_note=(
            "Der Vergleich von fünf Vorhaben ist ein Konsistenz- und Vertiefungstest, "
            "keine unabhängige Validierung. Die 80 Prozent Richtungsübereinstimmung "
            "beruhen auf zehn vergebenen Vergleichspunkten. Wirkungspotenzial und "
            "Wirkungsrisiko sind keine nachgewiesene Wirkung."
        ),
    ),
)


def esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def clean_url(value: str) -> str:
    """Entfernt bekannte Kampagnen- und KI-Trackingparameter aus öffentlichen Links."""
    parts = urlsplit(value)
    query = [
        (key, item)
        for key, item in parse_qsl(parts.query, keep_blank_values=True)
        if not key.lower().startswith("utm_") and key.lower() not in {"gclid", "fbclid"}
    ]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def relationship_map(document: ZipFile) -> dict[str, str]:
    root = ET.fromstring(document.read("word/_rels/document.xml.rels"))
    return {
        relation.get("Id", ""): clean_url(relation.get("Target", ""))
        for relation in root
        if relation.get("TargetMode") == "External"
    }


def paragraph_style(element: ET.Element) -> str:
    style = element.find("w:pPr/w:pStyle", NS)
    return style.get(W + "val", "Normal") if style is not None else "Normal"


def paragraph_text(element: ET.Element) -> str:
    return "".join(node.text or "" for node in element.findall(".//w:t", NS)).strip()


def is_list_item(element: ET.Element) -> bool:
    return paragraph_style(element).lower().startswith("list") or element.find("w:pPr/w:numPr", NS) is not None


def run_html(run: ET.Element) -> str:
    pieces: list[str] = []
    for child in run:
        if child.tag == W + "t":
            pieces.append(esc(child.text or ""))
        elif child.tag == W + "tab":
            pieces.append(" ")
        elif child.tag == W + "br":
            pieces.append("<br>")
    value = "".join(pieces)
    if not value:
        return ""
    properties = run.find("w:rPr", NS)
    if properties is not None:
        bold = properties.find("w:b", NS)
        italic = properties.find("w:i", NS)
        if bold is not None and bold.get(W + "val", "1") not in {"0", "false", "off"}:
            value = f"<strong>{value}</strong>"
        if italic is not None and italic.get(W + "val", "1") not in {"0", "false", "off"}:
            value = f"<em>{value}</em>"
    return value


def external_link(href: str, label: str) -> str:
    label = label.replace("Dserver Bundestag", "Deutscher Bundestag")
    return f'<a class="text-link" href="{esc(clean_url(href))}" rel="noopener noreferrer">{label}</a>'


def inline_html(element: ET.Element, links: dict[str, str]) -> str:
    output: list[str] = []
    field_url: str | None = None
    field_active = False
    field_label: list[str] = []
    for child in element:
        if child.tag == W + "hyperlink":
            label = "".join(run_html(run) for run in child.findall("w:r", NS))
            href = links.get(child.get(R + "id", ""), "")
            output.append(external_link(href, label) if href else label)
            continue
        if child.tag != W + "r":
            continue
        instruction = child.find("w:instrText", NS)
        if instruction is not None and instruction.text:
            match = re.search(r'HYPERLINK\s+"([^"]+)"', instruction.text)
            if match:
                field_url = clean_url(match.group(1))
            continue
        field = child.find("w:fldChar", NS)
        if field is not None:
            field_type = field.get(W + "fldCharType", "")
            if field_type == "begin":
                field_url = None
                field_active = False
                field_label = []
            elif field_type == "separate":
                field_active = bool(field_url)
            elif field_type == "end":
                if field_active and field_url and field_label:
                    output.append(external_link(field_url, "".join(field_label)))
                field_url = None
                field_active = False
                field_label = []
            continue
        value = run_html(child)
        if not value:
            continue
        if field_active and field_url:
            field_label.append(value)
        else:
            output.append(value)
    if field_active and field_url and field_label:
        output.append(external_link(field_url, "".join(field_label)))
    return "".join(output).strip()


def table_html(table: ET.Element, links: dict[str, str]) -> str:
    rows: list[list[str]] = []
    for row in table.findall("w:tr", NS):
        cells: list[str] = []
        for cell in row.findall("w:tc", NS):
            values = [inline_html(item, links) for item in cell.findall("w:p", NS)]
            cells.append(" ".join(value for value in values if value).strip())
        if any(cells):
            rows.append(cells)
    if not rows:
        return ""
    if len(rows) == 1 and len(rows[0]) == 1:
        return f'          <aside class="status-note">{rows[0][0]}</aside>'
    header, *body = rows
    headings = "".join(f'<th scope="col">{value}</th>' for value in header)
    body_html = "\n".join(
        "              <tr>" + "".join(f"<td>{value}</td>" for value in row) + "</tr>"
        for row in body
    )
    return (
        '          <div class="table-scroll"><table><thead><tr>'
        f"{headings}</tr></thead><tbody>\n{body_html}\n"
        "          </tbody></table></div>"
    )


def render_nachhaltigkeit(body: ET.Element, links: dict[str, str]) -> str:
    output: list[str] = []
    active = False
    for child in body:
        if child.tag == W + "tbl":
            if active:
                rendered = table_html(child, links)
                if rendered:
                    rendered = rendered.replace("Für die Diskussion auf LinkedIn", "Frage zur Diskussion")
                    output.append(rendered)
            continue
        if child.tag != W + "p":
            continue
        value = paragraph_text(child)
        style = paragraph_style(child)
        if style == "Lead":
            active = True
        if not active:
            continue
        if style == "Heading1" and value == "Redaktionelle Einordnung":
            break
        if not value:
            continue
        rendered = inline_html(child, links)
        if value.startswith("[25]"):
            rendered = rendered.replace(
                'href="https://wirkungsoekonomie.de"',
                'href="https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/"',
            )
        if value.startswith("Genau an dieser Schnittstelle wird das WÖk-Portal"):
            rendered = rendered.replace(
                "WÖk-Portal für politische Wirkungsanalyse",
                external_link("https://parlament.wirkungsoekonomie.de/", "WÖk-Portal für politische Wirkungsanalyse"),
                1,
            )
        if style == "Heading1":
            output.append(f"          <h2>{esc(value)}</h2>")
        elif style == "Heading2":
            output.append(f"          <h3>{esc(value)}</h3>")
        elif style == "CaptionSmall":
            output.append(f"          <p><em>{rendered}</em></p>")
        elif style == "Source":
            output.append(f'          <p class="source-entry">{rendered}</p>')
        else:
            output.append(f"          <p>{rendered}</p>")
    return "\n".join(output)


ENAP_HEADINGS = {
    "Was der Test tatsächlich zeigt",
    "Und der Benchmark hat einen Schwachpunkt der WÖk selbst aufgedeckt",
    "Mein Gesamturteil nach dem Test",
}


def render_enap(body: ET.Element, links: dict[str, str]) -> str:
    output: list[str] = []
    list_open = False
    paragraph_index = 0

    def close_list() -> None:
        nonlocal list_open
        if list_open:
            output.append("          </ul>")
            list_open = False

    for child in body:
        if child.tag == W + "tbl":
            close_list()
            rendered = table_html(child, links)
            if rendered:
                output.append(rendered)
            continue
        if child.tag != W + "p":
            continue
        value = paragraph_text(child)
        if not value:
            close_list()
            continue
        rendered = inline_html(child, links)
        if value.startswith("Basis ist also auf Bundesebene"):
            rendered = rendered.replace("Basis ist also auf Bundesebene die ressortübergreifende", "Basis bilden auf Bundesebene die ressortübergreifenden", 1)
            rendered = rendered.replace("mittels der Elektronische Nachhaltigkeitsprüfung", "mithilfe der elektronischen Nachhaltigkeitsprüfung", 1)
            rendered = rendered.replace("sowie des aktuellen", "sowie das aktuelle", 1)
            rendered = rendered.replace("Masterregisters der Wirkungsökonomie", "Masterregister der Wirkungsökonomie", 1)
        if paragraph_index == 0:
            output.append(f"          <p>{rendered}</p>")
        elif value.startswith("Ich habe den eNAP × WÖk-Benchmark"):
            close_list()
            output.append("          <h2>Der Benchmark</h2>")
            output.append(f"          <p>{rendered}</p>")
        elif value in ENAP_HEADINGS:
            close_list()
            output.append(f"          <h2>{esc(value)}</h2>")
        elif is_list_item(child) or value.startswith(("Strom:", "Verkehr:", "Banken:", "Pflege:", "Verbraucherpolitik:")):
            if not list_open:
                output.append("          <ul>")
                list_open = True
            output.append(f"            <li>{rendered}</li>")
        elif value.startswith("Ich habe den gesamten Benchmark mit Fallvergleich"):
            close_list()
            output.append(
                "          <p>Der Benchmark wurde mit Fallvergleich, Bewertungsmatrix, "
                "Claim Ledger, Quellen, WÖk-ID-Mapping und den gefundenen Registerlücken dokumentiert.</p>"
            )
        else:
            close_list()
            output.append(f"          <p>{rendered}</p>")
        paragraph_index += 1
    close_list()
    output.append("          <h2>Quellen und Prüfbasis</h2>")
    sources = (
        ("Empfehlungen zur Prüfung von Nachhaltigkeitszielen bei der Gesetzgebung", "https://www.bmjv.de/SharedDocs/Downloads/DE/Themen/Nav_Ministerium/2022_Empfehlungen_Nachhaltigkeitsziele.pdf?__blob=publicationFile&v=3"),
        ("eNAP im Portal Elektronische Gesetzesfolgenabschätzung", "https://plattform.egesetzgebung.bund.de/cockpit/"),
        ("BMJV: Ressortübergreifende Empfehlungen zur Nachhaltigkeitsprüfung", "https://www.bmjv.de/SharedDocs/Pressemitteilungen/DE/2023/0103_Nachhaltigkeitsziele_und_Rechtsetzung.html"),
        ("Bundesregierung: Erfahrungsbericht zu früher Einbeziehung und eNAP", "https://www.bundesregierung.de/resource/blob/976074/2253682/2d019561674ad7af4f11e19d4aa4fc71/2024-01-18-sta-nhk-beschluss-vom-27-november-2023-data.pdf?download=1"),
        ("StromVKG - Bundestagsdrucksache 21/6279", "https://dserver.bundestag.de/btd/21/062/2106279.pdf"),
        ("IVSG - Bundestagsdrucksache 21/2999", "https://dserver.bundestag.de/btd/21/029/2102999.pdf"),
        ("BRUBEG - Bundestagsdrucksache 21/3058", "https://dserver.bundestag.de/btd/21/030/2103058.pdf"),
        ("Pflegegesetz - Bundestagsdrucksache 21/1511", "https://dserver.bundestag.de/btd/21/015/2101511.pdf"),
        ("Änderung des UWG - Bundestagsdrucksache 21/1855", "https://dserver.bundestag.de/btd/21/018/2101855.pdf"),
        ("WÖk-Masterregister v1.5", "https://wirkungsoekonomie.de/bibliothek/woek-master-items-register/"),
        ("WÖk-Begriffsleitfaden führend v1.7", "https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/"),
    )
    output.append("          <ul>")
    output.extend(f"            <li>{external_link(href, esc(label))}</li>" for label, href in sources)
    output.append("          </ul>")
    return "\n".join(output)


def site_shell() -> tuple[str, str]:
    source = (ROOT / "blog/politik-an-ihren-folgen-messen.html").read_text(encoding="utf-8")
    header_start = source.index('    <header class="site-header"')
    main_start = source.index("    <main", header_start)
    main_end = source.rindex("</main>")
    footer = source[main_end + len("</main>") :]
    return source[header_start:main_start], footer


def article_content(article: Article) -> str:
    with ZipFile(article.source) as document:
        root = ET.fromstring(document.read("word/document.xml"))
        body = root.find("w:body", NS)
        links = relationship_map(document)
    if body is None:
        raise ValueError(f"Kein Dokumentkörper in {article.source}")
    if article.kind == "nachhaltigkeit":
        return render_nachhaltigkeit(body, links)
    return render_enap(body, links)


def write_article(article: Article, header: str, footer: str) -> None:
    target_image = ROOT / "assets/img/blog" / article.image_name
    target_image.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(article.image_source, target_image)
    content = article_content(article)
    canonical = f"https://wirkungsoekonomie.de/blog/{article.slug}.html"
    image_url = f"https://wirkungsoekonomie.de/assets/img/blog/{article.image_name}"
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "alternativeHeadline": article.subtitle,
        "description": article.description,
        "url": canonical,
        "image": image_url,
        "datePublished": article.date_iso,
        "dateModified": article.date_iso,
        "inLanguage": "de",
        "author": {"@type": "Person", "name": "Natalie Weber", "url": "https://wirkungsoekonomie.de/natalie-weber.html"},
        "publisher": {"@type": "Organization", "name": "Institut für Wirkungsökonomie", "url": "https://wirkungsoekonomie.de/institut/"},
        "mainEntityOfPage": canonical,
        "articleSection": article.section,
        "keywords": list(article.tags),
    }
    tags = "\n".join(f'  <meta property="article:tag" content="{esc(tag)}">' for tag in article.tags)
    document = f'''<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(article.title)} - Journal der Wirkungsökonomie</title>
    <meta name="description" content="{esc(article.description)}">
    <meta name="search_title" content="{esc(article.title)}">
    <meta name="search_description" content="{esc(article.description)}">
    <meta name="search_section" content="Journal">
    <meta name="search_type" content="Journalartikel">
    <meta name="search_index_kind" content="journal">
    <meta name="search_tags" content="{esc(', '.join(article.tags))}">
    <link rel="canonical" href="{canonical}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="{esc(article.title)}">
    <meta property="og:description" content="{esc(article.description)}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:image" content="{image_url}">
    <meta property="og:image:alt" content="{esc(article.image_alt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{esc(article.title)}">
    <meta name="twitter:description" content="{esc(article.description)}">
    <meta name="twitter:image" content="{image_url}">
    <meta name="twitter:image:alt" content="{esc(article.image_alt)}">
    <meta property="article:published_time" content="{article.date_iso}">
    <meta property="article:modified_time" content="{article.date_iso}">
    <meta property="article:section" content="{esc(article.section)}">
{tags}
    <link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml">
    <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
  </head>
  <body>
{header}    <main data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb journal-breadcrumb" aria-label="Pfadnavigation"><a href="../index.html">Start</a><span aria-hidden="true">/</span><a href="../blog.html">Journal</a></nav>
          <p class="hero-kicker">{esc(article.section)} · {article.date_label} · {article.reading_time}</p>
          <h1 class="hero-title">{esc(article.title)}</h1>
          <p class="hero-subtitle">{esc(article.subtitle)}</p>
          <p class="journal-pdf-download-row no-print" data-search-exclude><a class="btn btn-secondary journal-pdf-download" data-journal-pdf-download href="../assets/pdf/journal/{article.slug}.pdf" download>PDF herunterladen</a></p>
          <p class="meta">Von Natalie Weber · Begründerin der Wirkungsökonomie</p>
        </div>
        <figure class="hero-system-visual article-visual"><img src="../assets/img/blog/{article.image_name}" width="2752" height="1536" alt="{esc(article.image_alt)}" decoding="async" fetchpriority="high"></figure>
      </article>
      <section class="article-page">
        <div class="article-body">
          <div class="status-note"><strong>Methodische Einordnung:</strong> {esc(article.status_note)}</div>
{content}
          <p><strong>Weiterlesen:</strong> <a class="text-link" href="../begriffe/wirkungspotenzial/">Wirkungspotenzial</a>, <a class="text-link" href="../begriffe/wirkungsrisiko/">Wirkungsrisiko</a>, <a class="text-link" href="../begriffe/wirkpfad/">Wirkpfad</a>, <a class="text-link" href="../begriffe/wirkungsrueckkopplung/">Wirkungsrückkopplung</a> und <a class="text-link" href="../verstehen/sdgs-sdgplus/">SDG+</a>.</p>
          <p><a class="text-link" href="../blog.html">Zurück zum Journal</a></p>
        </div>
      </section>
    </main>
{footer}'''
    (ROOT / "blog" / f"{article.slug}.html").write_text(document, encoding="utf-8")


def main() -> None:
    for article in ARTICLES:
        if not article.source.is_file() or not article.image_source.is_file():
            raise FileNotFoundError(f"Quelle fehlt: {article.source} oder {article.image_source}")
    header, footer = site_shell()
    for article in ARTICLES:
        write_article(article, header, footer)
        print(f"Erzeugt: blog/{article.slug}.html")


if __name__ == "__main__":
    main()
