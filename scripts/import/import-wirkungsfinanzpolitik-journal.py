#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DOCX = Path("/Users/hagen/Downloads/Wirkungsfinanzpolitik_Journalbeitrag_WOeK_v3_MMT_PublicPurpose_IOI.docx")
SOURCE_IMAGE = Path("/Users/hagen/Downloads/ChatGPT Image 11. Juni 2026, 20_59_00.png")
IMAGE_TARGET = ROOT / "assets" / "img" / "blog" / "2026-06-11-wirkungsfinanzpolitik-schulden-ohne-wirkung.png"
ARTICLE_SLUG = "nicht-schulden-belasten-die-zukunft-schulden-ohne-wirkung"
ARTICLE_PATH = ROOT / "blog" / f"{ARTICLE_SLUG}.html"
DOSSIER_PATH = ROOT / "blog" / "dossiers" / "wirkungsfinanzpolitik.html"
AREA_PATH = ROOT / "wirkungsfelder" / "wirkungsfinanzpolitik" / "index.html"
GLOSSARY_CLUSTER_PATH = ROOT / "begriffe" / "oeffentliche-finanzen-schulden-wirkung" / "index.html"
AKADEMIE_PATH = ROOT / "akademie" / "wirkungsfinanzpolitik" / "index.html"
SHELL_PAGE = ROOT / "bibliothek" / "arbeitspapier-doppelte-wesentlichkeit-impact-controlling" / "index.html"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = f"{{{NS['w']}}}"

TITLE = "Nicht Schulden belasten die Zukunft - sondern Schulden ohne Wirkung"
SOURCE_TITLE = "Von der Schuldenfrage zur Wirkungsfinanzpolitik"
SUBTITLE = "Warum öffentliche Finanzen nach Wirkung bewertet werden müssen"
DATE_LABEL = "11. Juni 2026"
DATE_ISO = "2026-06-11T00:00:00+02:00"
AUTHOR = "Natalie Weber"
DESCRIPTION = (
    "Journal-Beitrag zur Wirkungsfinanzpolitik: Nicht die bloße Staatsverschuldung entscheidet "
    "über Zukunftslasten, sondern ob öffentliche Finanzierung positive Netto-Wirkung für Mensch, "
    "Planet und Demokratie erzeugt. Die v3-Fassung ordnet MMT, Public Purpose, Functional "
    "Finance und IOI als Anschlussstellen ein."
)
ARTICLE_URL = f"https://wirkungsoekonomie.de/blog/{ARTICLE_SLUG}.html"
IMAGE_URL = "https://wirkungsoekonomie.de/assets/img/blog/2026-06-11-wirkungsfinanzpolitik-schulden-ohne-wirkung.png"

TERM_DEFINITIONS = [
    ("Wirkungsfinanzpolitik", "wirkungsfinanzpolitik", "Wirkungsfinanzpolitik ist die wirkungsökonomische Steuerung öffentlicher Einnahmen, Ausgaben, Schulden, Investitionen und Steuern nach ihrer positiven Netto-Wirkung für Mensch, Planet und Demokratie."),
    ("Funktionale Wirkungsfinanzpolitik", "funktionale-wirkungsfinanzpolitik", "Funktionale Wirkungsfinanzpolitik verbindet Functional Finance mit der Wirkungsökonomie: Finanzpolitik wird nicht nach Haushaltsästhetik bewertet, sondern nach realer Wirkung, Ressourcenlage und Rückkopplung."),
    ("Wirkungshaushalt", "wirkungshaushalt", "Ein Wirkungshaushalt strukturiert Einnahmen, Ausgaben, Kredite, Investitionen und Förderungen nach erwarteter und überprüfter Wirkung."),
    ("Wirkungsprüfung öffentlicher Mittel", "wirkungspruefung-oeffentlicher-mittel", "Wirkungsprüfung öffentlicher Mittel fragt vor, während und nach einer Ausgabe, welche Zustandsveränderung entsteht, welche Nebenwirkungen auftreten und ob Korrektur nötig ist."),
    ("Öffentliche Netto-Wirkung", "oeffentliche-netto-wirkung", "Öffentliche Netto-Wirkung ist die bilanzierte Wirkung staatlichen Handelns auf Mensch, Planet und Demokratie nach Einbezug positiver Wirkungen, negativer Wirkungen, Folgekosten und Schutzgrenzen."),
    ("Wirkschulden", "wirkschulden", "Wirkschulden sind öffentliche Schulden, die positive Netto-Wirkung erzeugen, künftige Risiken senken, Resilienz erhöhen oder spätere Folgekosten vermeiden."),
    ("Blindschulden", "blindschulden", "Blindschulden sind öffentliche Schulden, die finanzielle Bewegung erzeugen, aber keine ausreichend nachweisbare positive Zustandsveränderung bewirken."),
    ("Verlustschulden", "verlustschulden", "Verlustschulden sind öffentliche Schulden, die negative Netto-Wirkung erzeugen, künftige Schäden erhöhen oder destruktive Strukturen stabilisieren."),
    ("Reparaturschulden", "reparaturschulden", "Reparaturschulden werden nötig, um Schäden zu beheben, die durch frühere Unterlassung, Fehlsteuerung oder negative Wirkung entstanden sind."),
    ("Präventionsschulden", "praeventionsschulden", "Präventionsschulden sind öffentliche Schulden, die aufgenommen werden, um absehbare Schäden, Krisen oder Folgekosten zu vermeiden, bevor sie eintreten."),
    ("Transformationsschulden", "transformationsschulden", "Transformationsschulden ermöglichen strukturelle Veränderungen und verändern dadurch künftige Handlungspfade, Standards, Märkte, Infrastrukturen oder Systemlogiken."),
    ("Zukunftsschulden", "zukunftsschulden", "Zukunftsschulden sind alle heute erzeugten oder nicht verhinderten Lasten, die künftige Generationen ökologisch, sozial, infrastrukturell, demokratisch oder sicherheitspolitisch tragen müssen."),
    ("Nicht-finanzielle Staatsschulden", "nicht-finanzielle-staatsschulden", "Nicht-finanzielle Staatsschulden sind öffentliche Lasten, die nicht als Kredit im Haushalt erscheinen, aber Zukunftsfähigkeit schwächen."),
    ("Infrastrukturelle Staatsschuld", "infrastrukturelle-staatsschuld", "Infrastrukturelle Staatsschuld entsteht durch marode Brücken, Netze, Schulen, Krankenhäuser, digitale Systeme oder andere vernachlässigte öffentliche Grundlagen."),
    ("Ökologische Staatsschuld", "oekologische-staatsschuld", "Ökologische Staatsschuld beschreibt Klimaschäden, Biodiversitätsverlust, Wasserstress, Bodenverlust und andere ökologische Lasten, die durch heutiges Handeln oder Unterlassen entstehen."),
    ("Soziale Staatsschuld", "soziale-staatsschuld", "Soziale Staatsschuld entsteht, wenn Bildung, Pflege, Wohnen, Gesundheit, Teilhabe oder soziale Stabilität so vernachlässigt werden, dass spätere Gesellschaften höhere Lasten tragen."),
    ("Demokratische Staatsschuld", "demokratische-staatsschuld", "Demokratische Staatsschuld beschreibt Vertrauensverlust, institutionelle Erosion, Polarisierung und geschwächte demokratische Handlungsfähigkeit als Zukunftslast."),
    ("Sicherheitspolitische Staatsschuld", "sicherheitspolitische-staatsschuld", "Sicherheitspolitische Staatsschuld entsteht durch unterlassene Resilienz, Schutzfähigkeit, Cybersicherheit, Infrastruktur- und Demokratiesicherung."),
    ("Unterlassungskosten", "unterlassungskosten", "Unterlassungskosten sind die Kosten, Risiken und Schäden, die entstehen, weil eine notwendige Maßnahme nicht oder zu spät ergriffen wird."),
    ("Kosten des Nichthandelns", "kosten-des-nichthandelns", "Kosten des Nichthandelns bezeichnen die Folgekosten, die durch Ausbleiben von Prävention, Transformation, Instandhaltung oder Schutz entstehen."),
    ("Zukunftskosten", "zukunftskosten", "Zukunftskosten sind Lasten, die durch heutige Entscheidungen oder Unterlassungen in spätere Haushalte, Lebenslagen und Ökosysteme verschoben werden."),
    ("Folgekostenvermeidung", "folgekostenvermeidung", "Folgekostenvermeidung bewertet, welche späteren Schäden, Reparaturen oder Risiken durch rechtzeitige öffentliche Finanzierung vermieden werden."),
    ("Wirkungsrendite öffentlicher Ausgaben", "wirkungsrendite-oeffentlicher-ausgaben", "Wirkungsrendite öffentlicher Ausgaben beschreibt das Verhältnis zwischen Ressourceneinsatz und erreichter positiver Netto-Wirkung."),
    ("Impact-of-Investment (IOI)", "impact-of-investment", "Impact-of-Investment (IOI) misst, wie viel positive Netto-Wirkung pro investiertem Euro entsteht. IOI ergänzt ROI und T-SROI, ersetzt aber keine demokratische Abwägung."),
    ("Öffentlicher T-SROI", "oeffentlicher-t-sroi", "Öffentlicher T-SROI überträgt transformatorische Wirkungsmessung auf öffentliche Investitionen und macht vermiedene Folgekosten, Resilienz und Teilhabe sichtbar."),
    ("Fiskalischer Wirkungsgrad", "fiskalischer-wirkungsgrad", "Fiskalischer Wirkungsgrad beschreibt, wie viel tatsächliche positive Wirkung pro eingesetztem öffentlichen Euro entsteht."),
    ("Haushaltsblindleistung", "haushaltsblindleistung", "Haushaltsblindleistung bezeichnet Ausgaben, Programme oder Kredite, die Mittel bewegen, aber keine ausreichend belegbare positive Zustandsveränderung erzeugen."),
    ("Haushaltsverlustleistung", "haushaltsverlustleistung", "Haushaltsverlustleistung bezeichnet öffentliche Mittelverwendung, die negative Netto-Wirkung erzeugt oder destruktive Strukturen stabilisiert."),
    ("Haushaltswirkleistung", "haushaltswirkleistung", "Haushaltswirkleistung bezeichnet öffentliche Mittelverwendung, die positive Netto-Wirkung erzeugt und mit Daten, Prüfung und Rückkopplung begründet werden kann."),
    ("Wirkungsqualität der Schulden", "wirkungsqualitaet-der-schulden", "Wirkungsqualität der Schulden beschreibt, ob eine Kreditaufnahme Risiken senkt, Zukunftsfähigkeit stärkt und Folgekosten vermeidet oder ob sie wirkungslos bzw. schädlich bleibt."),
    ("Wirkungsorientierte Schuldentragfähigkeit", "wirkungsorientierte-schuldentragfaehigkeit", "Wirkungsorientierte Schuldentragfähigkeit bewertet Schulden nicht nur nach Zinslast und Quote, sondern nach Wirkung, Realressourcen, Resilienzgewinn und künftigen Handlungsräumen."),
    ("Zinslast ohne Gegenwert", "zinslast-ohne-gegenwert", "Zinslast ohne Gegenwert entsteht, wenn öffentliche Kreditkosten anfallen, ohne dass die zugrunde liegende Finanzierung eine tragfähige positive Wirkung erzeugt hat."),
    ("Schuldenmythos", "schuldenmythos", "Schuldenmythos bezeichnet die verkürzte Vorstellung, Staatsschulden seien automatisch wie private Schulden und deshalb per se zukunftsschädlich."),
    ("Privathaushaltsmythos", "privathaushaltsmythos", "Privathaushaltsmythos bezeichnet die falsche Gleichsetzung des Staates mit einem privaten Haushalt, obwohl Staaten über Steuer-, Rechts- und institutionelle Gestaltungsmacht verfügen."),
    ("Wirkungsdisziplin", "wirkungsdisziplin", "Wirkungsdisziplin verlangt, öffentliche Finanzierung an Wirkungsziel, Netto-Prüfung, Datenqualität, Ressourcenlage und Korrekturmechanismus zu binden."),
    ("Zukunftsdisziplin", "zukunftsdisziplin", "Zukunftsdisziplin ersetzt bloße Schuldenangst durch die Pflicht, finanzielle und nicht-finanzielle Zukunftslasten gemeinsam sichtbar zu machen."),
    ("Wirkungsdefizit", "wirkungsdefizit", "Wirkungsdefizit ist die Lücke zwischen eingesetztem öffentlichem Geld und tatsächlich erreichter positiver Netto-Wirkung."),
    ("Wirkungsinvestition des Staates", "wirkungsinvestition-des-staates", "Eine Wirkungsinvestition des Staates ist eine öffentliche Ausgabe oder Kreditaufnahme, die begründet positive Netto-Wirkung erzeugt oder ermöglicht."),
    ("Wirkungsfinanzierung", "wirkungsfinanzierung", "Wirkungsfinanzierung richtet öffentliche Finanzierung an Wirkungsziel, Wirkungsprüfung, Realressourcen, Risiko und Rückkopplung aus."),
    ("Wirkungsorientierte Subventionsprüfung", "wirkungsorientierte-subventionspruefung", "Wirkungsorientierte Subventionsprüfung fragt, ob eine Subvention positive Netto-Wirkung erzeugt oder Wirkungslosigkeit, Pfadabhängigkeiten und Schäden finanziert."),
    ("Wirkungsorientierte Schuldenregel", "wirkungsorientierte-schuldenregel", "Eine wirkungsorientierte Schuldenregel unterscheidet Schulden nach Wirkungsqualität und verbindet Kreditaufnahme mit Wirkungsprüfung, Realressourcen und demokratischer Kontrolle."),
    ("Schulden-Nichtkompensation", "schulden-nichtkompensation", "Schulden-Nichtkompensation bedeutet, dass positive Einzelwirkungen nicht automatisch gravierende negative Wirkungen oder rote Linien ausgleichen dürfen."),
    ("Haushaltswashing", "haushaltswashing", "Haushaltswashing liegt vor, wenn öffentliche Ausgaben rhetorisch als Zukunfts- oder Wirkungsinvestition dargestellt werden, ohne belastbare Wirkungsarchitektur."),
    ("Staatsfinanzielle Wirkungsblindheit", "staatsfinanzielle-wirkungsblindheit", "Staatsfinanzielle Wirkungsblindheit beschreibt Haushalts- und Finanzpolitik, die Geldbewegungen misst, aber reale Zustandsveränderungen, Folgekosten und Nebenwirkungen ausblendet."),
    ("Wirkungsspielraum", "wirkungsspielraum", "Wirkungsspielraum bezeichnet den realen finanziellen, institutionellen und ressourcenseitigen Raum, in dem öffentliche Finanzierung positive Wirkung erzeugen kann."),
    ("Wirkungskapazität des Staates", "wirkungskapazitaet-des-staates", "Wirkungskapazität des Staates beschreibt seine Fähigkeit, Geld, Recht, Verwaltung, Daten, Infrastruktur und Vertrauen so zu verbinden, dass öffentliche Wirkung entsteht."),
    ("MMT", "mmt", "Modern Monetary Theory ist ein Anschlussbegriff der Wirkungsfinanzpolitik. MMT erklärt, warum der Staat nicht wie ein Privathaushalt funktioniert; Wirkungsfinanzpolitik ergänzt die Bewertungsfrage nach positiver Netto-Wirkung."),
    ("Public Purpose", "public-purpose", "Public Purpose bedeutet öffentlicher Zweck: staatliches Handeln, öffentliche Ausgaben und fiskalische Kapazität sollen nicht Selbstzweck sein, sondern einem gesellschaftlichen Zweck dienen."),
    ("Public Purpose Finance", "public-purpose-finance", "Public Purpose Finance richtet staatliche Finanzierung an einem öffentlichen Zweck aus. Wirkungsfinanzpolitik präzisiert diesen Zweck durch Wirkungsprüfung, positive Netto-Wirkung und Rückkopplung."),
    ("Functional Finance", "functional-finance", "Functional Finance bewertet Finanzpolitik nach ihrer Funktion für Beschäftigung, Stabilität und Nachfrage. Die WÖk erweitert diese Funktion um positive Netto-Wirkung, Nichtkompensation und demokratische Rückkopplung."),
    ("Endogenes Geld", "endogenes-geld", "Endogenes Geld beschreibt die Einsicht, dass Geld in modernen Volkswirtschaften wesentlich durch Kreditvergabe und institutionelle Buchung entsteht."),
    ("Monetäre Souveränität", "monetaere-souveraenitaet", "Monetäre Souveränität bezeichnet die Fähigkeit eines Staates, in eigener Währung zu finanzieren und geldpolitische Institutionen zu steuern."),
    ("Realressourcengrenze", "realressourcengrenze", "Realressourcengrenze bezeichnet die Grenze öffentlicher Finanzierung durch Personal, Material, Energie, Flächen, Zeit, Verwaltungskapazität und ökologische Tragfähigkeit."),
    ("Inflationsgrenze", "inflationsgrenze", "Inflationsgrenze beschreibt die Grenze, an der zusätzliche Nachfrage ohne entsprechende reale Kapazitäten Preise, Grundbedarf oder Stabilität gefährdet."),
]

TERM_BY_LABEL = {label: slug for label, slug, _ in TERM_DEFINITIONS}


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


def read_docx_blocks(path: Path) -> list[dict[str, str]]:
    with ZipFile(path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    body = root.find("w:body", NS)
    if body is None:
        return []
    blocks: list[dict[str, str]] = []
    for child in body:
        if child.tag != f"{W}p":
            continue
        text = para_text(child)
        if text:
            blocks.append({"style": para_style(child), "text": text})
    return blocks


def body_blocks(blocks: list[dict[str, str]]) -> list[dict[str, str]]:
    result: list[dict[str, str]] = []
    skip_toc = False
    for block in blocks:
        style = block["style"]
        text = block["text"]
        if style in {"Title", "Subtitle", "DeckblattInfo"}:
            continue
        if style == "Heading1" and text == "Inhaltsübersicht":
            skip_toc = True
            continue
        if skip_toc:
            if style == "Heading1" and re.match(r"^\d+\.", text):
                skip_toc = False
            else:
                continue
        result.append(block)
    return result


def extract_shell(relative_depth: int) -> tuple[str, str]:
    page = SHELL_PAGE.read_text(encoding="utf-8")
    header_start = page.index('    <header class="site-header"')
    main_start = page.index("    <main", header_start)
    main_close = "    </main>"
    main_end = page.rindex(main_close)
    header = page[header_start:main_start]
    footer = page[main_end + len(main_close):]
    if relative_depth == 1:
        header = header.replace("../../", "../")
        footer = footer.replace("../../", "../")
    return header, footer


def toc_html(toc: list[tuple[str, str]]) -> str:
    items = "\n".join(f'            <li><a href="#{esc(anchor)}">{esc(title)}</a></li>' for anchor, title in toc)
    return f"<ol>\n{items}\n          </ol>"


def render_blocks(blocks: list[dict[str, str]], prefix: str) -> tuple[str, list[tuple[str, str]]]:
    used: set[str] = set()
    linked_terms: set[str] = set()
    toc: list[tuple[str, str]] = []
    parts: list[str] = []
    paragraph_index = 0

    links = [
        ("positive Netto-Wirkung", f"{prefix}begriffe/positive-netto-wirkung/"),
        ("Wirkungsfinanzpolitik", f"{prefix}wirkungsfelder/wirkungsfinanzpolitik/"),
        ("Wirkungshaushalt", f"{prefix}begriffe/wirkungshaushalt/"),
        ("Public Purpose Finance", f"{prefix}begriffe/public-purpose-finance/"),
        ("Public Purpose", f"{prefix}begriffe/public-purpose/"),
        ("Functional Finance", f"{prefix}begriffe/functional-finance/"),
        ("Wirkschulden", f"{prefix}begriffe/wirkschulden/"),
        ("Blindschulden", f"{prefix}begriffe/blindschulden/"),
        ("Verlustschulden", f"{prefix}begriffe/verlustschulden/"),
        ("Zukunftsschulden", f"{prefix}begriffe/zukunftsschulden/"),
        ("Wirkungsrat", f"{prefix}begriffe/wirkungsrat/"),
        ("T-SROI", f"{prefix}werkzeuge/t-sroi/"),
        ("MMT", f"{prefix}begriffe/mmt/"),
        ("Schuldenbremse", f"{prefix}begriffe/schuldenbremse/"),
        ("Sustainable Value", f"{prefix}begriffe/sustainable-value/"),
        ("Wirkungsökonomie", f"{prefix}wirkungsoekonomie.html"),
    ]

    def link_text(text: str) -> str:
        rendered = esc(text)
        for term, href in links:
            if term in linked_terms:
                continue
            pattern = re.compile(rf"(?<![\w-]){re.escape(term)}(?![\w-])")
            if pattern.search(rendered):
                rendered = pattern.sub(f'<a class="text-link" href="{href}">{esc(term)}</a>', rendered, count=1)
                linked_terms.add(term)
        return rendered

    for block in blocks:
        style = block["style"]
        text = block["text"]
        if style in {"Heading1", "Heading2"}:
            anchor = slugify(text, used)
            toc.append((anchor, text))
            tag = "h2" if style == "Heading1" else "h3"
            parts.append(
                f'          <{tag} id="{anchor}">{esc(text)} '
                f'<a class="cite-anchor no-print" href="#{anchor}" aria-label="Zitierlink zu diesem Abschnitt">#</a></{tag}>'
            )
            continue
        paragraph_index += 1
        pid = f"wfp-{paragraph_index:04d}"
        if style in {"Kernsatz", "Callout"}:
            parts.append(f'          <blockquote id="{pid}">{link_text(text)}</blockquote>')
        else:
            parts.append(f'          <p id="{pid}">{link_text(text)}</p>')
    return "\n".join(parts), toc


def render_article(body_html: str, toc: list[tuple[str, str]]) -> str:
    header, footer = extract_shell(1)
    json_ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://wirkungsoekonomie.de/#website",
                "url": "https://wirkungsoekonomie.de",
                "name": "Wirkungsökonomie",
                "inLanguage": "de",
            },
            {
                "@type": "Person",
                "@id": "https://wirkungsoekonomie.de/#natalie-weber",
                "name": AUTHOR,
                "url": "https://wirkungsoekonomie.de/natalie-weber.html",
            },
            {
                "@type": "BlogPosting",
                "@id": f"{ARTICLE_URL}#blogposting",
                "headline": TITLE,
                "alternativeHeadline": SOURCE_TITLE,
                "description": DESCRIPTION,
                "url": ARTICLE_URL,
                "image": IMAGE_URL,
                "mainEntityOfPage": ARTICLE_URL,
                "inLanguage": "de",
                "datePublished": DATE_ISO,
                "dateModified": DATE_ISO,
                "author": {"@id": "https://wirkungsoekonomie.de/#natalie-weber"},
                "articleSection": "Politik",
                "keywords": [
                    "Wirkungsfinanzpolitik",
                    "Staatsschulden",
                    "Wirkungshaushalt",
                    "Schuldenbremse",
                    "MMT",
                    "Public Purpose",
                    "Public Purpose Finance",
                    "Functional Finance",
                    "positive Netto-Wirkung",
                    "Wirkungsökonomie",
                ],
            },
        ],
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
    <meta name="search_type" content="Journal-Beitrag">
    <meta name="search_tags" content="Wirkungsfinanzpolitik, Staatsschulden, Wirkungshaushalt, Schuldenbremse, IOI, Impact of Investment, T-SROI, NWI, Haushaltsblindleistung, MMT, Public Purpose, Public Purpose Finance, Functional Finance, positive Netto-Wirkung, Wirkschulden, Blindschulden, Verlustschulden, Reparaturschulden, Zukunftsschulden">
    <link rel="canonical" href="{ARTICLE_URL}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="{esc(TITLE)}">
    <meta property="og:description" content="{esc(DESCRIPTION)}">
    <meta property="og:url" content="{ARTICLE_URL}">
    <meta property="og:image" content="{IMAGE_URL}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{esc(TITLE)}">
    <meta name="twitter:description" content="{esc(DESCRIPTION)}">
    <meta name="twitter:image" content="{IMAGE_URL}">
    <meta property="article:published_time" content="{DATE_ISO}">
    <meta property="article:modified_time" content="{DATE_ISO}">
    <meta property="article:section" content="Politik">
    <meta property="article:tag" content="Wirkungsfinanzpolitik">
    <meta property="article:tag" content="Staatsschulden">
    <meta property="article:tag" content="Wirkungshaushalt">
    <meta property="article:tag" content="Schuldenbremse">
    <meta property="article:tag" content="MMT">
    <meta property="article:tag" content="Public Purpose">
    <meta property="article:tag" content="Functional Finance">
    <meta property="article:tag" content="Positive Netto-Wirkung">
    <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix">
    <script type="application/ld+json">
{json.dumps(json_ld, ensure_ascii=False, indent=2)}
    </script>
  </head>
  <body>
{header}    <main data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <p class="hero-kicker">Journal · Wirkungsfinanzpolitik · {esc(DATE_LABEL)} · Langform</p>
          <h1 class="hero-title">{esc(TITLE)}</h1>
          <p class="hero-subtitle">{esc(SUBTITLE)}</p>
          <p class="meta">Von {esc(AUTHOR)} · Arbeitsfassung / Langfassung</p>
        </div>
      </article>

      <section class="article-page">
        <figure class="blog-image article-visual">
          <img src="../assets/img/blog/{IMAGE_TARGET.name}" width="1536" height="1024" alt="Wirkungsfinanzpolitik als Waage: Wirkschulden mit Bildung, Klimaschutz und Infrastruktur stehen Schulden ohne Wirkung gegenüber." decoding="async" fetchpriority="high">
        </figure>
        <div class="article-body">
          <div class="status-note"><strong>Einordnung:</strong> Dieser Beitrag ist eine konzeptionelle Journal-Langform der Wirkungsökonomie. Er ersetzt keine Rechts-, Steuer-, Finanz-, Anlage- oder Politikberatung.</div>
          <div class="callout">
            <p><strong>Vertiefung:</strong> Zur zitierfähigen v3-Arbeitsfassung geht es im <a class="text-link" href="../dokumente/wirkungsfinanzpolitik/">Arbeitspapier Wirkungsfinanzpolitik</a>. Der Bereich <a class="text-link" href="../wirkungsfelder/wirkungsfinanzpolitik/">Wirkungsfinanzpolitik</a> ordnet <a class="text-link" href="../begriffe/impact-of-investment/">IOI</a>, MMT, <a class="text-link" href="../begriffe/public-purpose/">Public Purpose</a> und <a class="text-link" href="../begriffe/functional-finance/">Functional Finance</a> als Anschlussstellen ein; die Begriffe stehen im <a class="text-link" href="../begriffe/oeffentliche-finanzen-schulden-wirkung/">Glossar-Cluster öffentliche Finanzen, Schulden und Wirkung</a>.</p>
          </div>
          <details class="toc-card no-print" aria-label="Inhaltsverzeichnis">
            <summary class="card-title">Inhaltsverzeichnis anzeigen</summary>
            {toc_html(toc)}
          </details>
          <section class="callout">
            <h2>Kein Anti-MMT</h2>
            <p>MMT ist keine naive Gelddrucktheorie. Gute MMT-Vertreter:innen betonen reale Ressourcen, Inflation, Steuern, Beschäftigung und öffentlichen Zweck. Die Wirkungsfinanzpolitik widerspricht dem nicht. Sie setzt dort an, wo MMT die Finanzierungsfrage neu stellt.</p>
            <h2>Public Purpose operationalisieren</h2>
            <p>In MMT-nahen Debatten beschreibt Public Purpose den öffentlichen Zweck staatlicher Ausgaben. Die Wirkungsökonomie präzisiert diesen Zweck als positive Netto-Wirkung für Mensch, Planet und Demokratie. Dadurch wird aus einem politischen Anspruch eine prüfbare Steuerungslogik.</p>
            <h2>MMT als Türöffner, WÖk als Kompass</h2>
            <p>MMT zeigt, dass die Finanzierungsfrage anders gestellt werden muss. Die WÖk ergänzt die entscheidende Frage: Welche Wirkung erzeugt diese Finanzierung - und welche Zukunftskosten entstehen, wenn sie unterbleibt?</p>
          </section>
{body_html}
          <div class="status-note"><strong>Schutzlinie:</strong> Wirkungsfinanzpolitik ist keine Schuldenromantik und keine Sparideologie. Sie fragt nach realer Netto-Wirkung, demokratischer Legitimation, Datenqualität, Zielkonflikten und Korrekturfähigkeit.</div>
        </div>
      </section>
    </main>{footer}
"""


def render_dossier() -> str:
    header, footer = extract_shell(2)
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Wirkungsfinanzpolitik - Dossier der Wirkungsökonomie</title>
    <meta name="description" content="Lesepfad zur Wirkungsfinanzpolitik: Journal-Beitrag, Arbeitspapier, Wirkungsfeld, Wirkungshaushalt und Glossar-Cluster.">
    <meta name="search_title" content="Dossier Wirkungsfinanzpolitik">
    <meta name="search_description" content="Lesepfad zur Wirkungsfinanzpolitik: öffentliche Finanzen nach Wirkung bewerten, Wirkschulden von Schulden ohne Wirkung unterscheiden und Wirkungshaushalte verstehen.">
    <meta name="search_section" content="Journal">
    <meta name="search_type" content="Dossier">
    <link rel="canonical" href="https://wirkungsoekonomie.de/blog/dossiers/wirkungsfinanzpolitik.html">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="Wirkungsfinanzpolitik">
    <meta property="og:description" content="Ein Lesepfad zur Frage, wann öffentliche Finanzierung Zukunft entlastet - und wann sie Wirkungslosigkeit verschuldet.">
    <meta property="og:url" content="https://wirkungsoekonomie.de/blog/dossiers/wirkungsfinanzpolitik.html">
    <meta property="og:image" content="{IMAGE_URL}">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
{header}    <main data-pagefind-body>
      <section class="hero dossier-hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Dossier</p>
            <h1 class="hero-title">Wirkungsfinanzpolitik</h1>
            <p class="hero-subtitle">Öffentliche Finanzen nach Wirkung statt nach bloßer Schuldenangst lesen.</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="#lesepfad">Lesepfad starten</a>
              <a class="btn btn-secondary" href="../../blog.html#dossiers">Alle Dossiers</a>
            </div>
          </div>
          <aside class="card">
            <p class="card-kicker">Kurzfrage</p>
            <h2 class="card-title">Welche Schulden entlasten Zukunft?</h2>
            <p class="card-text">Das Dossier unterscheidet Wirkschulden, Blindschulden, Verlustschulden und Reparaturschulden und ordnet MMT, Public Purpose und Functional Finance als Anschlussstellen ein.</p>
          </aside>
        </div>
      </section>

      <section class="section" id="lesepfad" aria-labelledby="lesepfad-title">
        <div class="section-header">
          <p class="hero-kicker">Empfohlene Reihenfolge</p>
          <h2 id="lesepfad-title">Von These zu Werkzeug</h2>
          <p>Erst die Grundthese lesen, dann die Arbeitsfassung zitieren, anschließend Begriffe und Methoden vertiefen.</p>
        </div>
        <ol class="dossier-reading-list">
          <li class="dossier-reading-item"><span class="dossier-order">1</span><div><a class="text-link" href="../../wirkungsfelder/wirkungsfinanzpolitik/">Wirkungsfinanzpolitik: öffentliche Finanzen nach Wirkung</a><p>Die neue Bereichsseite ordnet das Thema im Wirkungsfeld Staat &amp; Demokratie ein.</p></div></li>
          <li class="dossier-reading-item"><span class="dossier-order">2</span><div><a class="text-link" href="../../blog/{ARTICLE_SLUG}.html">{esc(TITLE)}</a><p>Die journalistische Langform erklärt die Grundthese und die Schuldentypen.</p></div></li>
          <li class="dossier-reading-item"><span class="dossier-order">3</span><div><a class="text-link" href="../../dokumente/wirkungsfinanzpolitik/">Arbeitspapier: Von der Schuldenfrage zur Wirkungsfinanzpolitik</a><p>Zitierfähige Webfassung mit PDF der Arbeitsfassung.</p></div></li>
          <li class="dossier-reading-item"><span class="dossier-order">4</span><div><a class="text-link" href="../../begriffe/oeffentliche-finanzen-schulden-wirkung/">Glossar-Cluster: öffentliche Finanzen, Schulden und Wirkung</a><p>Begriffe wie MMT, Public Purpose, Wirkschulden, Blindschulden, Reparaturschulden und Wirkungsdefizit.</p></div></li>
          <li class="dossier-reading-item"><span class="dossier-order">5</span><div><a class="text-link" href="../../werkzeuge/wirkungshaushalt/">Werkzeug: Wirkungshaushalt</a><p>Die methodische Brücke von Ausgabenlogik zu Wirkungsrechnung.</p></div></li>
        </ol>
      </section>
    </main>{footer}
"""


def render_area() -> str:
    header, footer = extract_shell(2)
    core_terms = [
        ("Wirkungsfinanzpolitik", "wirkungsfinanzpolitik", "Wirkungsfinanzpolitik ist die wirkungsökonomische Steuerung öffentlicher Einnahmen, Ausgaben, Schulden, Investitionen und Steuern nach ihrer positiven Netto-Wirkung für Mensch, Planet und Demokratie."),
        ("Wirkungshaushalt", "wirkungshaushalt", "Ein Wirkungshaushalt ist ein öffentlicher Haushalt, der Einnahmen, Ausgaben, Kredite, Investitionen und Förderungen nach Wirkung strukturiert, bewertet und priorisiert."),
        ("IOI", "impact-of-investment", "IOI misst, wie viel positive Netto-Wirkung pro investiertem Euro entsteht. Er zeigt Wirkungseffizienz und ergänzt den T-SROI, der Transformationswirkung bewertet."),
        ("Wirkschulden", "wirkschulden", "Wirkschulden sind öffentliche Schulden, die positive Netto-Wirkung erzeugen, künftige Risiken senken, Resilienz erhöhen oder spätere Folgekosten vermeiden."),
        ("Blindschulden", "blindschulden", "Blindschulden sind öffentliche Schulden, die finanzielle Bewegung erzeugen, aber keine ausreichend nachweisbare positive Zustandsveränderung bewirken."),
        ("Verlustschulden", "verlustschulden", "Verlustschulden sind öffentliche Schulden, die negative Netto-Wirkung erzeugen, künftige Schäden erhöhen oder destruktive Strukturen stabilisieren."),
        ("Reparaturschulden", "reparaturschulden", "Reparaturschulden sind öffentliche Schulden, die notwendig werden, um Schäden zu beheben, die durch frühere Unterlassung, Fehlsteuerung oder negative Wirkung entstanden sind."),
        ("Präventionsschulden", "praeventionsschulden", "Präventionsschulden sind öffentliche Schulden, die aufgenommen werden, um absehbare Schäden, Krisen oder Folgekosten zu vermeiden, bevor sie eintreten."),
        ("Transformationsschulden", "transformationsschulden", "Transformationsschulden sind öffentliche Schulden, die strukturelle Veränderungen ermöglichen und dadurch künftige Handlungspfade, Standards, Märkte, Infrastrukturen oder Systemlogiken verändern."),
        ("Zukunftsschulden", "zukunftsschulden", "Zukunftsschulden sind nicht nur finanzielle Staatsschulden, sondern alle heute erzeugten oder nicht verhinderten Lasten, die künftige Generationen ökologisch, sozial, infrastrukturell, demokratisch oder sicherheitspolitisch tragen müssen."),
    ]
    core_cards = "\n".join(
        f'          <article class="card"><p class="card-kicker">Kernbegriff</p><h3 class="card-title">{esc(label)}</h3><p class="card-text">{esc(definition)}</p><div class="portal-card-actions"><a class="text-link" href="../../begriffe/{esc(slug)}/">Glossar öffnen</a></div></article>'
        for label, slug, definition in core_terms
    )
    faq_items = [
        ("Ist Wirkungsfinanzpolitik einfach MMT?", "Nein. MMT ist ein wichtiger Anschluss, aber nicht der Kern. MMT erklärt, warum der Staat nicht wie ein Privathaushalt funktioniert. Wirkungsfinanzpolitik fragt, welche Wirkung staatliche Finanzierung erzeugt. Kurz gesagt: MMT öffnet den Raum gegen Schuldenmythen. Wirkungsfinanzpolitik füllt diesen Raum mit einem Wirkungskompass."),
        ("Ist MMT damit falsch?", "Nein. Gute MMT-Positionen betonen reale Ressourcen, Inflation, Steuern, Beschäftigung und öffentlichen Zweck. Die WÖk widerspricht dem nicht. Sie übernimmt die nützliche Einsicht, dass die Finanzierungsfrage anders gestellt werden muss, und ergänzt die Wirkungsfrage."),
        ("Was ist der Unterschied zwischen Public Purpose und positiver Netto-Wirkung?", "Public Purpose benennt den Anspruch, dass staatliche Finanzierung einem öffentlichen Zweck dienen soll. Die Wirkungsökonomie operationalisiert diesen Zweck als positive Netto-Wirkung für Mensch, Planet und Demokratie. Public Purpose ist der Anspruch. Wirkungsfinanzpolitik macht ihn prüfbar."),
        ("Warum reicht MMT allein nicht?", "Weil eine Ausgabe finanzierbar sein kann und trotzdem wirkungslos oder schädlich bleibt. Auch wenn reale Ressourcen vorhanden sind und Inflation beherrschbar scheint, kann der Staat Blindleistung, Verlustleistung oder Zukunftsschäden finanzieren."),
        ("Ist Wirkungsfinanzpolitik schuldenfreundlich?", "Nein. Sie ist wirkungsfreundlich. Sie sagt nicht: Mehr Schulden sind gut. Sie sagt auch nicht: Weniger Schulden sind gut. Sie sagt: Entscheidend ist die Wirkungsqualität der Schulden."),
        ("Was ist mit Inflation?", "Inflation bleibt eine reale Grenze. Aber sie ist nicht nur eine Geldfrage. Sie zeigt oft reale Engpässe: Fachkräfte, Energie, Material, Flächen, Produktionskapazitäten oder Lieferketten. Wirkungsfinanzpolitik berücksichtigt deshalb Geld, Realressourcen, Umsetzungskapazität und Nebenwirkungen gemeinsam."),
        ("Wer entscheidet, was Wirkung ist?", "Nicht eine einzelne Person und nicht eine Regierung allein. Die WÖk braucht transparente Indikatoren, öffentliche Daten, wissenschaftliche Standards, demokratische Kontrolle und unabhängige Evaluation. Dafür ist der Wirkungsrat als Wächterinstitution vorgesehen."),
        ("Ist das technokratisch?", "Nur dann, wenn Messung Demokratie ersetzt. In der Wirkungsökonomie ersetzt Messung keine demokratische Entscheidung. Sie verbessert die Rückkopplung. Politik entscheidet weiterhin, aber sie muss sichtbarer machen, welche Wirkung ihre Entscheidungen erzeugen."),
        ("Was ist die wichtigste Aussage?", "Nicht Schulden belasten die Zukunft, sondern Schulden ohne Wirkung. Die größte Staatsschuld steht nicht immer im Haushalt. Sie kann in maroden Brücken, schlechter Bildung, Pflegekrisen, Klimaschäden, Sicherheitslücken oder demokratischem Vertrauensverlust liegen."),
        ("Was ist der Unterschied zwischen IOI und T-SROI?", "Der IOI misst, wie viel positive Netto-Wirkung pro investiertem Euro entsteht. Er ist eine Kennzahl für Wirkungseffizienz. Der T-SROI misst, ob eine Investition darüber hinaus transformative Systemwirkung erzeugt, also Standards, Märkte, Infrastrukturen, Anreize oder Handlungspfade verändert. Kurz: IOI fragt, wie wirksam der Euro ist. T-SROI fragt, ob dieser Euro das System verändert."),
        ("Entscheidet dann nur noch der höchste IOI?", "Nein. Der IOI ist wichtig, aber er darf nicht allein entscheiden. Öffentliche Finanzen müssen auch Grundrechte, Daseinsvorsorge, Wirkungsgrenzen, Nichtkompensation, langfristige Transformation, Datenqualität und demokratische Legitimation berücksichtigen. Ein hoher IOI darf schwere negative Wirkungen nicht überdecken."),
    ]
    faq_cards = "\n".join(
        f'          <article class="card"><h3 class="card-title">{esc(question)}</h3><p class="card-text">{esc(answer)}</p></article>'
        for question, answer in faq_items
    )
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Wirkungsfinanzpolitik | Wirkungsökonomie</title>
    <meta name="description" content="Wirkungsfinanzpolitik bewertet Staatsschulden, Steuern und öffentliche Ausgaben nach ihrer Wirkung auf Mensch, Planet und Demokratie - nicht nach Schuldenangst oder Ausgabenromantik.">
    <meta name="search_title" content="Wirkungsfinanzpolitik">
    <meta name="search_description" content="Öffentliche Finanzen, Schulden und Staatshaushalt nach Wirkung: MMT als Anschluss, Public Purpose als Anspruch und positive Netto-Wirkung als Maßstab.">
    <meta name="search_section" content="Wirkungsfelder">
    <meta name="search_type" content="Bereich">
    <meta name="search_tags" content="Wirkungsfinanzpolitik, Staat, Demokratie, Wirkungshaushalt, IOI, Impact of Investment, NWI, Haushaltsblindleistung, Staatsschulden, Schuldenbremse, Wirkschulden, Blindschulden, Verlustschulden, Zukunftsschulden, MMT, Public Purpose, Functional Finance, T-SROI, Wirkungsrat">
    <link rel="canonical" href="https://wirkungsoekonomie.de/wirkungsfelder/wirkungsfinanzpolitik/">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="Wirkungsfinanzpolitik">
    <meta property="og:description" content="Nicht Staatsschulden belasten die Zukunft, sondern Schulden ohne positive Netto-Wirkung.">
    <meta property="og:url" content="https://wirkungsoekonomie.de/wirkungsfelder/wirkungsfinanzpolitik/">
    <meta property="og:image" content="{IMAGE_URL}">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
{header}    <main data-pagefind-body>
      <section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsfelder</a></nav>
            <p class="hero-kicker">Wirkungsfeld · Staat &amp; Demokratie</p>
            <h1 class="hero-title">Wirkungsfinanzpolitik</h1>
            <p class="hero-subtitle">Öffentliche Finanzen, Schulden und Staatshaushalt nach Wirkung</p>
            <p class="hero-text"><strong>Nicht Schulden belasten die Zukunft. Schulden ohne Wirkung belasten die Zukunft.</strong></p>
            <p class="hero-text">Staatsschulden sind eines der umkämpftesten Themen der politischen Debatte. Die einen sehen in ihnen eine Last für kommende Generationen. Die anderen betonen, dass ein Staat nicht wie ein Privathaushalt funktioniert. Die Wirkungsökonomie geht einen Schritt weiter: Sie fragt nicht zuerst, ob der Staat Schulden machen darf, sondern welche Wirkung staatliche Finanzierung erzeugt - und welche Kosten entstehen, wenn sie unterbleibt.</p>
            <div class="hero-actions no-print"><a class="btn btn-primary" href="../../blog/{ARTICLE_SLUG}.html">Journal-Beitrag lesen</a><a class="btn btn-secondary" href="../../dokumente/wirkungsfinanzpolitik/">Arbeitspapier öffnen</a></div>
          </div>
          <figure class="hero-system-visual article-visual">
            <img src="../../assets/img/blog/{IMAGE_TARGET.name}" width="1536" height="1024" alt="Waage der Wirkungsfinanzpolitik: Wirkschulden und Schulden ohne Wirkung im Vergleich." decoding="async" loading="lazy">
          </figure>
        </div>
      </section>

      <section class="section home-video-section" id="bereichsvideo" aria-labelledby="bereichsvideo-title">
        <div class="section-header">
          <p class="hero-kicker">Bereichsvideo</p>
          <h2 id="bereichsvideo-title">Jeder Euro muss wirken</h2>
          <p>Das Erklärvideo führt in die Wirkungsfinanzpolitik ein: Es zeigt, warum öffentliche Finanzierung nicht nur nach Schuldenstand bewertet werden darf, sondern nach Wirkung, Folgekosten, Unterlassungskosten und öffentlichem Zweck.</p>
        </div>
        <video class="home-explainer-video" controls controlsList="nodownload" preload="metadata" playsinline poster="../../assets/video/wirkungsfeld-wirkungsfinanzpolitik-poster.png?v=20260611" aria-label="Erklärvideo zur Wirkungsfinanzpolitik">
          <source src="../../assets/video/wirkungsfeld-wirkungsfinanzpolitik.mp4?v=20260611" type="video/mp4">
          Dein Browser kann dieses Video nicht direkt abspielen.
        </video>
      </section>

      <section class="section" aria-labelledby="andere-frage">
        <div class="article-body">
          <h2 id="andere-frage">Die Wirkungsökonomie stellt die Frage anders</h2>
          <p>Sie fragt nicht zuerst: <strong>Darf der Staat Schulden machen?</strong></p>
          <p>Sondern: <strong>Welche Wirkung erzeugt staatliche Finanzierung - und welche Kosten entstehen, wenn sie unterbleibt?</strong></p>
          <p>Denn Zukunft wird nicht nur durch finanzielle Schulden belastet. Zukunft wird auch belastet durch marode Infrastruktur, Klimaschäden, Bildungsarmut, Pflegekrisen, Sicherheitslücken und demokratischen Vertrauensverlust.</p>
          <p>Die Wirkungsfinanzpolitik unterscheidet deshalb zwischen Schulden, die Zukunft entlasten, und Schulden, die Zukunft belasten.</p>
        </div>
      </section>

      <section class="section" aria-labelledby="mmt-abgrenzung">
        <div class="callout">
          <p class="hero-kicker">Abgrenzung zu MMT</p>
          <h2 id="mmt-abgrenzung">Anschluss statt Abwertung</h2>
          <p>Die Wirkungsfinanzpolitik ist keine Anti-MMT. <a class="text-link" href="../../begriffe/mmt/">MMT</a> zeigt, dass der Staat nicht wie ein Privathaushalt funktioniert. Die WÖk übernimmt diese Einsicht, ergänzt aber die Wirkungsfrage.</p>
          <p><strong>MMT fragt:</strong> Was kann ein Staat finanzieren?</p>
          <p><strong>Wirkungsfinanzpolitik fragt:</strong> Was soll er finanzieren, weil es positive Netto-Wirkung erzeugt?</p>
          <p><strong>MMT öffnet den Raum. Wirkungsfinanzpolitik gibt ihm Richtung.</strong></p>
        </div>
      </section>

      <section class="section" aria-labelledby="rechnung">
        <div class="section-header">
          <p class="hero-kicker">Die neue Rechnung</p>
          <h2 id="rechnung">Was ändert sich in der Wirkungsökonomie?</h2>
          <p>Ein Staatshaushalt ist nicht nur ein Finanzplan. Er ist eine Wirkungsarchitektur.</p>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Klassische Haushaltslogik</th><th>Wirkungsfinanzpolitik</th></tr></thead>
            <tbody>
              <tr><td>Eine Ausgabe ist vor allem ein Kostenblock.</td><td>Eine Ausgabe wird nach Wirkungsnutzen, Folgekosten, Nebenwirkungen und Datenqualität bewertet.</td></tr>
              <tr><td>Eine Kreditaufnahme ist vor allem eine Last.</td><td>Eine Kreditaufnahme kann Wirkschuld, Blindschuld, Verlustschuld oder Reparaturschuld sein.</td></tr>
              <tr><td>Sparen gilt oft automatisch als Zukunftsschutz.</td><td>Unterlassen kann die teuerste Form der Finanzierung sein, wenn dadurch Reparaturkosten, Klimaschäden, Bildungsdefizite oder Vertrauensverluste wachsen.</td></tr>
              <tr><td>Steuern dienen primär der Finanzierung.</td><td>Steuern sind Rückkopplung: Sie können Schäden bepreisen, positive Wirkung entlasten und Wirkungslücken schließen.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section" aria-labelledby="ioi">
        <div class="section-header">
          <p class="hero-kicker">Wirkung je Euro</p>
          <h2 id="ioi">IOI: Wie viel Wirkung erzeugt ein öffentlicher Euro?</h2>
          <p><a class="text-link" href="../../begriffe/impact-of-investment/">Impact-of-Investment (IOI)</a> ist die Wirkungseffizienz-Kennzahl der Wirkungsfinanzpolitik. Sie fragt nicht, wie viel finanzieller Gewinn entsteht, sondern wie viel <a class="text-link" href="../../begriffe/positive-netto-wirkung/">positive Netto-Wirkung</a> ein öffentlicher Euro erzeugt.</p>
        </div>
        <div class="callout">
          <p class="hero-kicker">Arbeitsformel</p>
          <h3>IOI = positive Netto-Wirkung / Investitionssumme</h3>
          <p>Ein hoher IOI zeigt, dass öffentliche Mittel viel belegbare Wirkung auslösen. Ein niedriger oder negativer IOI macht sichtbar, wo Programme, Subventionen oder Kredite zur <a class="text-link" href="../../begriffe/haushaltsblindleistung/">Haushaltsblindleistung</a> werden können.</p>
          <p>Der IOI ist dabei kein Autopilot. Er muss mit Wirkungsgrenzen, <a class="text-link" href="../../begriffe/nichtkompensation/">Nichtkompensation</a>, Realressourcen, Datenqualität, Daseinsvorsorge und demokratischer Legitimation zusammen gelesen werden.</p>
        </div>
        <div class="card-grid three">
          <article class="card"><p class="card-kicker">IOI</p><h3 class="card-title">Wirkungseffizienz</h3><p class="card-text">Wie viel positive Netto-Wirkung entsteht pro investiertem Euro?</p></article>
          <article class="card"><p class="card-kicker">T-SROI</p><h3 class="card-title">Transformationswirkung</h3><p class="card-text">Verändert die Investition Standards, Infrastrukturen, Märkte, Anreize oder Handlungspfade?</p><div class="portal-card-actions"><a class="text-link" href="../../werkzeuge/t-sroi/">T-SROI öffnen</a></div></article>
          <article class="card"><p class="card-kicker">Schutzlinie</p><h3 class="card-title">Nicht allein entscheiden</h3><p class="card-text">Ein hoher IOI darf schwere negative Wirkungen, Grundrechtsrisiken oder rote Linien nicht überdecken.</p></article>
        </div>
      </section>

      <section class="section" aria-labelledby="kernbegriffe">
        <div class="section-header">
          <p class="hero-kicker">Kernbegriffe</p>
          <h2 id="kernbegriffe">Nicht jede Schuld wirkt gleich</h2>
          <p>Wirkungsfinanzpolitik unterscheidet Finanzierung danach, ob sie Zukunft entlastet, Risiken senkt, Resilienz stärkt oder Lasten verschiebt.</p>
        </div>
        <div class="card-grid three">
{core_cards}
        </div>
      </section>

      <section class="section" aria-labelledby="vertiefung">
        <div class="section-header">
          <p class="hero-kicker">Lesen und anwenden</p>
          <h2 id="vertiefung">Anschlussstellen</h2>
        </div>
        <div class="card-grid three">
          <article class="card"><p class="card-kicker">Journal</p><h3 class="card-title">{esc(TITLE)}</h3><p class="card-text">Die Langform erklärt die Grundthese und ordnet MMT, Public Purpose, Functional Finance, Wirkungshaushalt und Schuldenbremse ein.</p><div class="portal-card-actions"><a class="text-link" href="../../blog/{ARTICLE_SLUG}.html">Artikel lesen</a></div></article>
          <article class="card"><p class="card-kicker">Arbeitspapier</p><h3 class="card-title">Von der Schuldenfrage zur Wirkungsfinanzpolitik</h3><p class="card-text">Zitierfähige Webfassung mit PDF aus dem WÖk-Publikationsstandard.</p><div class="portal-card-actions"><a class="text-link" href="../../dokumente/wirkungsfinanzpolitik/">Arbeitspapier öffnen</a></div></article>
          <article class="card"><p class="card-kicker">Glossar</p><h3 class="card-title">Öffentliche Finanzen, Schulden und Wirkung</h3><p class="card-text">Begriffsklärung für Wirkschulden, Blindschulden, Reparaturschulden, Wirkungsdefizit und Wirkungsdisziplin.</p><div class="portal-card-actions"><a class="text-link" href="../../begriffe/oeffentliche-finanzen-schulden-wirkung/">Begriffe öffnen</a></div></article>
          <article class="card"><p class="card-kicker">Kennzahl</p><h3 class="card-title">IOI</h3><p class="card-text">Impact-of-Investment zeigt, wie viel positive Netto-Wirkung pro investiertem Euro entsteht.</p><div class="portal-card-actions"><a class="text-link" href="../../begriffe/impact-of-investment/">IOI öffnen</a></div></article>
          <article class="card"><p class="card-kicker">Werkzeug</p><h3 class="card-title">Wirkungshaushalt</h3><p class="card-text">Methode, um öffentliche Mittel nach Zustandsveränderung, Prävention und Resilienz zu steuern.</p><div class="portal-card-actions"><a class="text-link" href="../../werkzeuge/wirkungshaushalt/">Werkzeug ansehen</a></div></article>
          <article class="card"><p class="card-kicker">Anschlussbegriff</p><h3 class="card-title">MMT</h3><p class="card-text">MMT entkräftet den Privathaushaltsmythos. Wirkungsfinanzpolitik ergänzt die Frage nach positiver Netto-Wirkung.</p><div class="portal-card-actions"><a class="text-link" href="../../begriffe/mmt/">MMT öffnen</a></div></article>
          <article class="card"><p class="card-kicker">Anschlussbegriff</p><h3 class="card-title">Public Purpose</h3><p class="card-text">Public Purpose benennt den öffentlichen Zweck. Wirkungsfinanzpolitik macht ihn prüfbar.</p><div class="portal-card-actions"><a class="text-link" href="../../begriffe/public-purpose/">Public Purpose öffnen</a></div></article>
          <article class="card"><p class="card-kicker">Brückenbegriff</p><h3 class="card-title">Functional Finance</h3><p class="card-text">Functional Finance fragt nach der Funktion von Finanzpolitik. Die WÖk erweitert diese Funktion um Wirkung, Nichtkompensation und Rückkopplung.</p><div class="portal-card-actions"><a class="text-link" href="../../begriffe/functional-finance/">Functional Finance öffnen</a></div></article>
          <article class="card"><p class="card-kicker">Methode</p><h3 class="card-title">T-SROI</h3><p class="card-text">T-SROI macht Transformationsnutzen, vermiedene Folgekosten und Resilienz als Wirkungsrechnung sichtbar.</p><div class="portal-card-actions"><a class="text-link" href="../../werkzeuge/t-sroi/">T-SROI öffnen</a></div></article>
          <article class="card"><p class="card-kicker">Governance</p><h3 class="card-title">Wirkungsrat</h3><p class="card-text">Der Wirkungsrat ist als Wächterinstitution für Standards, Daten, Evaluation und demokratische Rückkopplung vorgesehen.</p><div class="portal-card-actions"><a class="text-link" href="../../begriffe/wirkungsrat/">Wirkungsrat öffnen</a></div></article>
          <article class="card"><p class="card-kicker">Dossier</p><h3 class="card-title">Lesepfad Wirkungsfinanzpolitik</h3><p class="card-text">Kuratiert die wichtigsten Einstiege von Journal über Arbeitspapier bis Glossar.</p><div class="portal-card-actions"><a class="text-link" href="../../blog/dossiers/wirkungsfinanzpolitik.html">Dossier öffnen</a></div></article>
          <article class="card"><p class="card-kicker">Akademie</p><h3 class="card-title">Öffentliche Finanzen nach Wirkung</h3><p class="card-text">Lernmodul für die Grundfrage: Welche Finanzierung entlastet Zukunft wirklich?</p><div class="portal-card-actions"><a class="text-link" href="../../akademie/wirkungsfinanzpolitik/">Modul öffnen</a></div></article>
        </div>
      </section>

      <section class="section" aria-labelledby="faq">
        <div class="section-header">
          <p class="hero-kicker">FAQ</p>
          <h2 id="faq">Fragen, Einwände und Abgrenzungen</h2>
        </div>
        <div class="card-grid three">
{faq_cards}
        </div>
      </section>

      <section class="section" aria-labelledby="schutz">
        <div class="card">
          <p class="hero-kicker">Schutzlinie</p>
          <h2 id="schutz">Keine automatische Finanz- oder Politikentscheidung</h2>
          <p>Wirkungsfinanzpolitik ersetzt keine parlamentarische Entscheidung, keine Verfassungsprüfung, keine Haushaltsprüfung und keine Beratung. Sie schafft einen Maßstab, damit finanzielle Entscheidungen mit Wirkungsdaten, Zielkonflikten und Korrekturwegen begründet werden können.</p>
        </div>
      </section>
    </main>{footer}
"""


def ordered_cluster_terms() -> list[tuple[str, str, str]]:
    preferred = [
        "wirkungsfinanzpolitik",
        "wirkungshaushalt",
        "wirkungspruefung-oeffentlicher-mittel",
        "impact-of-investment",
        "oeffentlicher-t-sroi",
        "wirkschulden",
        "praeventionsschulden",
        "transformationsschulden",
        "blindschulden",
        "verlustschulden",
        "reparaturschulden",
        "zukunftsschulden",
        "nicht-finanzielle-staatsschulden",
        "unterlassungskosten",
        "wirkungsdisziplin",
        "public-purpose",
        "mmt",
        "functional-finance",
        "realressourcengrenze",
        "inflationsgrenze",
    ]
    by_slug = {slug: (label, slug, definition) for label, slug, definition in TERM_DEFINITIONS}
    ordered = [by_slug[slug] for slug in preferred if slug in by_slug]
    seen = {slug for _, slug, _ in ordered}
    ordered.extend(item for item in TERM_DEFINITIONS if item[1] not in seen)
    return ordered


def render_glossary_cluster() -> str:
    header, footer = extract_shell(2)
    term_cards = "\n".join(
        f'          <section class="term-section-card"><p class="section-eyebrow">Begriff</p><h2><a class="text-link" href="../../begriffe/{esc(slug)}/">{esc(term)}</a></h2><p>{esc(definition)}</p></section>'
        for term, slug, definition in ordered_cluster_terms()
    )
    debt_table = """
        <section class="term-summary-card" aria-labelledby="debt-classes">
          <p class="section-eyebrow">Schuldenklassen</p>
          <h2 id="debt-classes">Schuldenklassen im Vergleich</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Schuldenklasse</th><th>Kernfrage</th><th>Wirkung</th></tr></thead>
              <tbody>
                <tr><td><a class="text-link" href="../../begriffe/wirkschulden/">Wirkschulden</a></td><td>Verbessert die Finanzierung reale Zustände?</td><td>positive Netto-Wirkung, Resilienz, vermiedene Folgekosten</td></tr>
                <tr><td><a class="text-link" href="../../begriffe/praeventionsschulden/">Präventionsschulden</a></td><td>Verhindert sie absehbare Schäden?</td><td>Risikosenkung vor Eintritt des Schadens</td></tr>
                <tr><td><a class="text-link" href="../../begriffe/transformationsschulden/">Transformationsschulden</a></td><td>Verändert sie Pfade, Standards oder Infrastrukturen?</td><td>strukturelle Zukunftsfähigkeit</td></tr>
                <tr><td><a class="text-link" href="../../begriffe/blindschulden/">Blindschulden</a></td><td>Bleibt die Wirkung unklar?</td><td>Mittelabfluss ohne belegbare Zustandsveränderung</td></tr>
                <tr><td><a class="text-link" href="../../begriffe/verlustschulden/">Verlustschulden</a></td><td>Erzeugt sie negative Netto-Wirkung?</td><td>Schäden, Pfadabhängigkeiten, künftige Lasten</td></tr>
                <tr><td><a class="text-link" href="../../begriffe/reparaturschulden/">Reparaturschulden</a></td><td>Muss Vergangenes repariert werden?</td><td>späte Schadensbehebung statt früher Prävention</td></tr>
                <tr><td><a class="text-link" href="../../begriffe/zukunftsschulden/">Zukunftsschulden</a></td><td>Welche Lasten verschieben wir?</td><td>finanzielle und nicht-finanzielle Zukunftslasten</td></tr>
                <tr><td><a class="text-link" href="../../begriffe/nicht-finanzielle-staatsschulden/">Nicht-finanzielle Staatsschulden</a></td><td>Welche Last steht nicht im Haushalt?</td><td>ökologische, soziale, infrastrukturelle und demokratische Schäden</td></tr>
              </tbody>
            </table>
          </div>
        </section>"""
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Öffentliche Finanzen, Schulden und Wirkung - Glossar der Wirkungsökonomie</title>
    <meta name="description" content="Glossar-Cluster der Wirkungsfinanzpolitik: IOI, MMT, Public Purpose, Wirkungshaushalt, Wirkschulden, Blindschulden, Verlustschulden, Präventionsschulden, Transformationsschulden und Zukunftsschulden.">
    <meta name="search_title" content="Öffentliche Finanzen, Schulden und Wirkung">
    <meta name="search_description" content="Begriffe der Wirkungsfinanzpolitik: IOI, Impact of Investment, MMT, Public Purpose, Wirkungshaushalt, Wirkschulden, Blindschulden, Verlustschulden, Präventionsschulden, Transformationsschulden und Zukunftsschulden.">
    <meta name="search_section" content="Glossar">
    <meta name="search_type" content="Glossar-Cluster">
    <meta name="search_tags" content="Wirkungsfinanzpolitik, Wirkungshaushalt, IOI, Impact of Investment, positive Netto-Wirkung, T-SROI, Haushaltsblindleistung, Wirkschulden, Blindschulden, Verlustschulden, Reparaturschulden, Präventionsschulden, Transformationsschulden, Zukunftsschulden, MMT, Public Purpose, Public Purpose Finance, Functional Finance, Realressourcengrenze, Inflationsgrenze">
    <link rel="canonical" href="https://wirkungsoekonomie.de/begriffe/oeffentliche-finanzen-schulden-wirkung/">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
{header}    <main class="section" data-pagefind-body>
      <article class="article-shell glossary-detail">
        <nav class="breadcrumb"><a href="../">Begriffe</a> / Öffentliche Finanzen, Schulden und Wirkung</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">Wirkungsfinanzpolitik</p>
          <h1>Öffentliche Finanzen, Schulden und Wirkung</h1>
          <p class="lead">Dieses Glossar-Cluster erklärt die Begriffe, mit denen öffentliche Finanzierung nach positiver Netto-Wirkung statt nur nach Betrag, Defizit oder Schuldenstand gelesen wird.</p>
          <div class="term-action-row"><a class="btn btn-primary" href="../../wirkungsfelder/wirkungsfinanzpolitik/">Bereich öffnen</a><a class="btn btn-secondary" href="../../blog/{ARTICLE_SLUG}.html">Journal-Beitrag lesen</a></div>
        </header>
        <section class="term-summary-card" aria-labelledby="cluster-summary">
          <h2 id="cluster-summary">Auf einen Blick</h2>
          <p>Nicht jede öffentliche Schuld ist gleich. Entscheidend ist, ob Finanzierung Zukunft entlastet, Schäden vermeidet, Resilienz stärkt und demokratisch korrigierbar bleibt. MMT ist dabei ein wichtiger Anschluss gegen Schuldenmythen; Public Purpose benennt den Anspruch, den die Wirkungsökonomie als positive Netto-Wirkung prüfbar macht.</p>
        </section>
{debt_table}
        <div class="term-section-grid">
{term_cards}
        </div>
        <section class="term-link-section" aria-labelledby="related-terms-title">
          <div><p class="section-eyebrow">Verknüpfungen</p><h2 id="related-terms-title">Verwandte Inhalte</h2></div>
          <div class="term-chip-row">
            <a class="term-chip" href="../../begriffe/wirkungshaushalt/">Wirkungshaushalt</a>
            <a class="term-chip" href="../../begriffe/impact-of-investment/">Impact-of-Investment (IOI)</a>
            <a class="term-chip" href="../../begriffe/mmt/">MMT</a>
            <a class="term-chip" href="../../begriffe/public-purpose/">Public Purpose</a>
            <a class="term-chip" href="../../begriffe/public-purpose-finance/">Public Purpose Finance</a>
            <a class="term-chip" href="../../begriffe/functional-finance/">Functional Finance</a>
            <a class="term-chip" href="../../begriffe/wirkschulden/">Wirkschulden</a>
            <a class="term-chip" href="../../begriffe/blindschulden/">Blindschulden</a>
            <a class="term-chip" href="../../begriffe/verlustschulden/">Verlustschulden</a>
            <a class="term-chip" href="../../begriffe/zukunftsschulden/">Zukunftsschulden</a>
            <a class="term-chip" href="../../begriffe/schuldenbremse/">Schuldenbremse</a>
            <a class="term-chip" href="../../begriffe/positive-netto-wirkung/">positive Netto-Wirkung</a>
            <a class="term-chip" href="../../werkzeuge/t-sroi/">T-SROI</a>
            <a class="term-chip" href="../../begriffe/wirkungsrat/">Wirkungsrat</a>
            <a class="term-chip" href="../../begriffe/sustainable-value/">Sustainable Value</a>
            <a class="term-chip" href="../../werkzeuge/wirkungshaushalt/">Werkzeug Wirkungshaushalt</a>
            <a class="term-chip" href="../../dokumente/wirkungsfinanzpolitik/">Arbeitspapier</a>
            <a class="term-chip" href="../../blog/dossiers/wirkungsfinanzpolitik.html">Dossier</a>
          </div>
        </section>
        <section class="meta-box">
          <h2>Version und Schutzlinie</h2>
          <p>Kategorie: Öffentliche Finanzen, Staat und Demokratie · Version: 3.0 IOI-Erweiterung · Stand: {esc(DATE_LABEL)}</p>
          <p>Die Begriffe sind konzeptionelle Arbeitsbegriffe der Wirkungsökonomie. Sie ersetzen keine Rechts-, Steuer-, Finanz-, Anlage- oder Politikberatung.</p>
        </section>
      </article>
    </main>{footer}
"""


def term_special_html(slug: str) -> str:
    specials = {
        "mmt": """
        <section class="term-summary-card">
          <h2>Abgrenzung zur Wirkungsfinanzpolitik</h2>
          <p>MMT ist ein Anschlussbegriff, nicht die Grundlage der Wirkungsökonomie. MMT erklärt, warum der Staat nicht wie ein Privathaushalt funktioniert und warum Geld nicht als fixer Topf verstanden werden sollte.</p>
          <p>Die Wirkungsfinanzpolitik übernimmt diese Einsicht, ergänzt aber die entscheidende Bewertungsfrage: Welche Wirkung erzeugt staatliche Finanzierung?</p>
          <p><strong>Leitsatz:</strong> MMT entkräftet den Schuldenmythos. Wirkungsfinanzpolitik liefert den Wirkungskompass.</p>
        </section>""",
        "public-purpose": """
        <section class="term-summary-card">
          <h2>Einordnung in der Wirkungsökonomie</h2>
          <p>Public Purpose ist ein wichtiger Anschlussbegriff für die Wirkungsfinanzpolitik. Er beschreibt, dass staatliche Finanzmacht an einen öffentlichen Zweck gebunden sein muss.</p>
          <p>Die Wirkungsökonomie geht weiter: Sie operationalisiert diesen öffentlichen Zweck als positive Netto-Wirkung für Mensch, Planet und Demokratie.</p>
          <p><strong>Leitsatz:</strong> Public Purpose benennt den Anspruch. Wirkungsfinanzpolitik macht ihn messbar.</p>
        </section>""",
        "public-purpose-finance": """
        <section class="term-summary-card">
          <h2>Brücke zur Wirkungsfinanzpolitik</h2>
          <p>Public Purpose Finance verbindet MMT, Functional Finance und Wirkungsfinanzpolitik. Die WÖk präzisiert, dass öffentlicher Zweck nicht nur politisch behauptet, sondern durch Wirkungsprüfung, Netto-Wirkung und Rückkopplung überprüfbar gemacht werden muss.</p>
          <p><strong>Leitsatz:</strong> Public Purpose Finance fragt, ob Finanzierung einem öffentlichen Zweck dient. Wirkungsfinanzpolitik fragt, welche positive Netto-Wirkung sie erzeugt.</p>
        </section>""",
        "functional-finance": """
        <section class="term-summary-card">
          <h2>Brückenfunktion</h2>
          <p>Functional Finance ist für die WÖk eine bessere Brücke als bloße Haushaltsästhetik: Entscheidend ist, welche reale Funktion öffentliche Finanzierung erfüllt.</p>
          <p>Die Wirkungsfinanzpolitik erweitert diese Funktionsfrage um Mensch, Planet, Demokratie, Nichtkompensation, T-SROI, Wirkungsrat und Wirkungshaushalt.</p>
        </section>""",
    }
    return specials.get(slug, "")


def render_term_page(label: str, slug: str, definition: str) -> str:
    header, footer = extract_shell(2)
    special = term_special_html(slug)
    category = "Anschlussbegriff" if slug in {"mmt", "public-purpose", "public-purpose-finance", "functional-finance", "endogenes-geld", "monetaere-souveraenitaet"} else "Wirkungsfinanzpolitik"
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(label)} - Glossar der Wirkungsökonomie</title>
    <meta name="description" content="{esc(definition)}">
    <meta name="search_title" content="{esc(label)}">
    <meta name="search_description" content="{esc(definition)}">
    <meta name="search_section" content="Glossar">
    <meta name="search_type" content="Glossar-Begriff">
    <meta name="search_tags" content="Wirkungsfinanzpolitik, öffentliche Finanzen, Staatsschulden, Wirkungshaushalt, IOI, Impact of Investment, T-SROI, Haushaltsblindleistung, MMT, Public Purpose, positive Netto-Wirkung">
    <meta name="generator" content="import-wirkungsfinanzpolitik-journal">
    <link rel="canonical" href="https://wirkungsoekonomie.de/begriffe/{esc(slug)}/">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
{header}    <main class="section" data-pagefind-body>
      <article class="article-shell glossary-detail">
        <nav class="breadcrumb"><a href="../">Begriffe</a> / <a href="../oeffentliche-finanzen-schulden-wirkung/">Öffentliche Finanzen, Schulden und Wirkung</a></nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">{esc(category)}</p>
          <h1>{esc(label)}</h1>
          <p class="lead">{esc(definition)}</p>
          <div class="term-action-row"><a class="btn btn-primary" href="../oeffentliche-finanzen-schulden-wirkung/">Glossar-Cluster</a><a class="btn btn-secondary" href="../../wirkungsfelder/wirkungsfinanzpolitik/">Bereich öffnen</a></div>
        </header>
        <section class="term-summary-card">
          <h2>WÖk-Einordnung</h2>
          <p>Der Begriff gehört zum Cluster öffentliche Finanzen, Schulden und Wirkung. Er hilft, staatliche Finanzierung nicht nur nach Betrag, Defizit oder Schuldenstand zu lesen, sondern nach Wirkung, Realressourcen, Nebenwirkungen und demokratischer Rückkopplung.</p>
        </section>
{special}
        <section class="term-link-section" aria-labelledby="related-{esc(slug)}">
          <div><p class="section-eyebrow">Verknüpfungen</p><h2 id="related-{esc(slug)}">Verwandte Inhalte</h2></div>
          <div class="term-chip-row">
            <a class="term-chip" href="../../wirkungsfelder/wirkungsfinanzpolitik/">Wirkungsfinanzpolitik</a>
            <a class="term-chip" href="../../dokumente/wirkungsfinanzpolitik/">Arbeitspapier</a>
            <a class="term-chip" href="../../blog/{ARTICLE_SLUG}.html">Journal-Beitrag</a>
            <a class="term-chip" href="../oeffentliche-finanzen-schulden-wirkung/">Glossar-Cluster</a>
            <a class="term-chip" href="../positive-netto-wirkung/">positive Netto-Wirkung</a>
            <a class="term-chip" href="../impact-of-investment/">Impact-of-Investment (IOI)</a>
            <a class="term-chip" href="../wirkungshaushalt/">Wirkungshaushalt</a>
            <a class="term-chip" href="../../werkzeuge/t-sroi/">T-SROI</a>
            <a class="term-chip" href="../wirkungsrat/">Wirkungsrat</a>
          </div>
        </section>
        <section class="meta-box">
          <h2>Version und Schutzlinie</h2>
          <p>Kategorie: {esc(category)} · Version: 3.0 IOI-Erweiterung · Stand: {esc(DATE_LABEL)}</p>
          <p>Konzeptioneller Glossarbegriff der Wirkungsökonomie; keine Rechts-, Steuer-, Finanz-, Anlage- oder Politikberatung.</p>
        </section>
      </article>
    </main>{footer}
"""


def render_term_pages() -> int:
    preserve_slugs = {"wirkungshaushalt"}
    written = 0
    for label, slug, definition in TERM_DEFINITIONS:
        if slug in preserve_slugs:
            continue
        target = ROOT / "begriffe" / slug / "index.html"
        if target.exists():
            current = target.read_text(encoding="utf-8")
            if 'generator" content="import-wirkungsfinanzpolitik-journal' not in current:
                continue
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(render_term_page(label, slug, definition), encoding="utf-8")
        written += 1
    return written


def render_akademie() -> str:
    header, footer = extract_shell(2)
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Öffentliche Finanzen nach Wirkung | Akademie der Wirkungsökonomie</title>
    <meta name="description" content="Akademie-Modul zur Wirkungsfinanzpolitik: Schulden, Wirkungshaushalt, Wirkschulden und öffentliche Wirkung verständlich einordnen.">
    <meta name="search_title" content="Öffentliche Finanzen nach Wirkung">
    <meta name="search_description" content="Akademie-Modul zur Wirkungsfinanzpolitik: Welche Finanzierung entlastet Zukunft wirklich?">
    <meta name="search_section" content="Akademie">
    <meta name="search_type" content="Lernmodul">
    <link rel="canonical" href="https://wirkungsoekonomie.de/akademie/wirkungsfinanzpolitik/">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
{header}    <main data-pagefind-body>
      <section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb"><a href="../../akademie.html">Akademie</a> / Wirkungsfinanzpolitik</nav>
            <p class="hero-kicker">Akademie-Modul</p>
            <h1 class="hero-title">Öffentliche Finanzen nach Wirkung</h1>
            <p class="hero-subtitle">Vom Satz "Wie wollen wir das bezahlen?" zur Frage "Was bewirkt diese Finanzierung?"</p>
          </div>
          <aside class="card">
            <p class="card-kicker">Lernziel</p>
            <h2 class="card-title">Schulden nach Wirkung unterscheiden</h2>
            <p class="card-text">Nach diesem Modul sind Wirkschulden, Blindschulden, Verlustschulden, Reparaturschulden und Wirkungshaushalt als Grundbegriffe einordenbar.</p>
          </aside>
        </div>
      </section>
      <section class="section">
        <div class="card-grid three">
          <article class="card"><p class="card-kicker">1</p><h2 class="card-title">These lesen</h2><p class="card-text">Nicht die bloße Kreditaufnahme entscheidet über Zukunftslasten, sondern die Netto-Wirkung der Finanzierung.</p><a class="text-link" href="../../blog/{ARTICLE_SLUG}.html">Journal-Beitrag</a></article>
          <article class="card"><p class="card-kicker">2</p><h2 class="card-title">Begriffe sichern</h2><p class="card-text">Die wichtigsten Arbeitsbegriffe der Wirkungsfinanzpolitik im Glossar-Cluster nachschlagen.</p><a class="text-link" href="../../begriffe/oeffentliche-finanzen-schulden-wirkung/">Glossar öffnen</a></article>
          <article class="card"><p class="card-kicker">3</p><h2 class="card-title">Methode anwenden</h2><p class="card-text">Mit dem Wirkungshaushalt öffentliche Mittel nach Zustandsveränderung, Prävention und Resilienz lesen.</p><a class="text-link" href="../../werkzeuge/wirkungshaushalt/">Werkzeug ansehen</a></article>
          <article class="card"><p class="card-kicker">4</p><h2 class="card-title">Arbeitsfassung vertiefen</h2><p class="card-text">Das Arbeitspapier bündelt die zitierfähige Langfassung und die PDF-Fassung zur Wirkungsfinanzpolitik.</p><a class="text-link" href="../../dokumente/wirkungsfinanzpolitik/">Arbeitspapier öffnen</a></article>
        </div>
      </section>
    </main>{footer}
"""


def update_blog_json_ld(text: str) -> str:
    match = re.search(r'(<script type="application/ld\+json">\s*)(\{[\s\S]*?\})(\s*</script>)', text)
    if not match:
        return text
    data = json.loads(match.group(2))
    graph = data.get("@graph", [])
    item_list = next((item for item in graph if item.get("@type") == "ItemList"), None)
    if not item_list:
        return text
    url = ARTICLE_URL
    items = item_list.get("itemListElement", [])
    if any(item.get("url") == url for item in items):
        return text
    for item in items:
        if isinstance(item.get("position"), int):
            item["position"] += 1
    items.insert(0, {"@type": "ListItem", "position": 1, "url": url, "name": TITLE})
    item_list["itemListElement"] = items
    item_list["numberOfItems"] = int(item_list.get("numberOfItems", len(items) - 1)) + 1
    rendered = json.dumps(data, ensure_ascii=False, indent=10)
    return text[:match.start(2)] + rendered + text[match.end(2):]


def update_blog_html() -> None:
    path = ROOT / "blog.html"
    text = path.read_text(encoding="utf-8")
    text = update_blog_json_ld(text)
    text = text.replace("reparaturschulden mmt functional-finance", "reparaturschulden mmt public-purpose functional-finance")
    text = text.replace(
        "Kurzthese: Nicht die bloße Staatsverschuldung belastet die Zukunft, sondern Finanzierung ohne positive Netto-Wirkung.",
        "Kurzthese: Nicht die bloße Staatsverschuldung belastet die Zukunft, sondern Finanzierung ohne positive Netto-Wirkung. MMT öffnet den Raum; Public Purpose wird über Wirkung prüfbar.",
    )
    text = text.replace(
        "Wann entlasten öffentliche Schulden die Zukunft - und wann verschulden sie Wirkungslosigkeit?",
        "Wann entlasten öffentliche Schulden die Zukunft - und wie werden MMT und Public Purpose wirkungsökonomisch anschlussfähig?",
    )
    text = text.replace(
        "Kurzthese: Entscheidend ist nicht, ob der Staat Schulden macht, sondern welche Wirkung staatliche Finanzierung erzeugt.",
        "Kurzthese: Entscheidend ist nicht, ob der Staat Schulden machen darf, sondern welche Wirkung staatliche Finanzierung erzeugt.",
    )
    feature_card = f"""            <article class="blog-card editorial-feature-card">
              <div class="blog-image">
                <img src="assets/img/blog/{IMAGE_TARGET.name}" width="1536" height="1024" alt="Wirkungsfinanzpolitik als Waage: Wirkschulden stehen Schulden ohne Wirkung gegenüber." decoding="async" loading="lazy">
              </div>
              <div class="blog-badge-row"><span class="blog-origin-badge">Journal</span><span class="blog-origin-badge">Wirkungsfinanzpolitik</span></div>
              <p class="card-kicker">Politik · {esc(DATE_LABEL)} · Langform</p>
              <h3 class="card-title">{esc(TITLE)}</h3>
              <p class="card-text">Kurzthese: Nicht die bloße Staatsverschuldung belastet die Zukunft, sondern Finanzierung ohne positive Netto-Wirkung. MMT öffnet den Raum; Public Purpose wird über Wirkung prüfbar.</p>
              <div class="tag-list" aria-label="Schlagworte"><a href="#tag-wirkungsfinanzpolitik" data-blog-tag="wirkungsfinanzpolitik">Wirkungsfinanzpolitik</a><a href="#tag-politik" data-blog-tag="politik">Politik</a><a href="#tag-steuern" data-blog-tag="steuern">Steuern</a><a href="#tag-wirkung" data-blog-tag="wirkung">Wirkung</a></div>
              <a class="text-link" href="blog/{ARTICLE_SLUG}.html">Beitrag lesen</a>
            </article>
"""
    dossier_card = f"""            <article class="card dossier-card">
              <div class="blog-badge-row"><span class="blog-origin-badge">Dossier</span></div>
              <p class="card-kicker">Lesepfad</p>
              <h3 class="card-title">Wirkungsfinanzpolitik</h3>
              <p class="card-text"><strong>Wann entlasten öffentliche Schulden die Zukunft - und wie werden MMT und Public Purpose wirkungsökonomisch anschlussfähig?</strong></p>
              <ol class="dossier-links">
                <li><a class="text-link" href="wirkungsfelder/wirkungsfinanzpolitik/">Wirkungsfinanzpolitik als Wirkungsfeld</a></li>
                <li><a class="text-link" href="blog/{ARTICLE_SLUG}.html">{esc(TITLE)}</a></li>
                <li><a class="text-link" href="dokumente/wirkungsfinanzpolitik/">Arbeitspapier Wirkungsfinanzpolitik</a></li>
                <li><a class="text-link" href="begriffe/oeffentliche-finanzen-schulden-wirkung/">Glossar-Cluster öffentliche Finanzen</a></li>
              </ol>
              <div class="dossier-card-actions">
                <a class="text-link" href="blog/dossiers/wirkungsfinanzpolitik.html">Dossier öffnen</a>
                <a class="text-link" href="#beitraege" data-blog-filter="politik">Alle politischen Beiträge</a>
              </div>
            </article>
"""
    list_card = f"""          <article class="blog-card" data-origin="redaktion" data-category="politik" data-tags="wirkungsfinanzpolitik staatsschulden wirkungshaushalt schuldenbremse wirkschulden blindschulden reparaturschulden mmt public-purpose functional-finance politik steuern wirkung wirkungsokonomie">
            <div class="blog-image">
              <img src="assets/img/blog/{IMAGE_TARGET.name}" width="1536" height="1024" alt="Wirkungsfinanzpolitik als Waage: Wirkschulden stehen Schulden ohne Wirkung gegenüber." decoding="async" loading="lazy">
            </div>
            <div class="blog-badge-row"><span class="blog-origin-badge">Journal</span><span class="blog-origin-badge">Langform</span></div>
            <p class="card-kicker"><a class="category-link" href="#thema-politik" data-blog-filter="politik">Politik</a> · {esc(DATE_LABEL)} · Langform</p>
            <h3 class="card-title">{esc(TITLE)}</h3>
            <p class="card-text">Kurzthese: Entscheidend ist nicht, ob der Staat Schulden machen darf, sondern welche Wirkung staatliche Finanzierung erzeugt.</p>
            <a class="text-link" href="blog/{ARTICLE_SLUG}.html">Beitrag lesen</a>
            <div class="tag-list" aria-label="Schlagworte"><a href="#tag-wirkungsfinanzpolitik" data-blog-tag="wirkungsfinanzpolitik">Wirkungsfinanzpolitik</a><a href="#tag-politik" data-blog-tag="politik">Politik</a><a href="#tag-steuern" data-blog-tag="steuern">Steuern</a><a href="#tag-wirkung" data-blog-tag="wirkung">Wirkung</a></div>
          </article>
"""
    if "data-tags=\"wirkungsfinanzpolitik staatsschulden" not in text:
        text = text.replace('          <div class="card-grid editorial-feature-grid">\n', '          <div class="card-grid editorial-feature-grid">\n' + feature_card, 1)
        text = text.replace('          <div class="card-grid dossier-grid">\n', '          <div class="card-grid dossier-grid">\n' + dossier_card, 1)
        text = text.replace('        <div class="card-grid blog-list-grid" id="redaktion-beitraege">\n', '        <div class="card-grid blog-list-grid" id="redaktion-beitraege">\n' + list_card, 1)
    tag = '<a href="#tag-wirkungsfinanzpolitik" data-blog-tag="wirkungsfinanzpolitik">Wirkungsfinanzpolitik</a>'
    text = text.replace(tag + '<a href="#tag-wirkungsokonomie" data-blog-tag="wirkungsokonomie">Wirkungsökonomie</a>', '<a href="#tag-wirkungsokonomie" data-blog-tag="wirkungsokonomie">Wirkungsökonomie</a>')
    cloud_marker = '<div class="tag-list tag-cloud" aria-label="Schlagwortfilter">'
    cloud_index = text.find(cloud_marker)
    cloud_end = text.find("</div>", cloud_index)
    if cloud_index != -1 and cloud_end != -1 and tag not in text[cloud_index:cloud_end]:
        term = '<a href="#tag-wirkungsokonomie" data-blog-tag="wirkungsokonomie">Wirkungsökonomie</a>'
        term_index = text.find(term, cloud_index, cloud_end)
        if term_index != -1:
            text = text[:term_index] + tag + text[term_index:]
    path.write_text(text, encoding="utf-8")


def update_wirkungsfelder_index() -> None:
    path = ROOT / "wirkungsfelder" / "index.html"
    text = path.read_text(encoding="utf-8")
    if 'href="./wirkungsfinanzpolitik/"' in text:
        text = text.replace(
            "Öffentliche Finanzen nach Wirkung: Schulden, Steuern, Investitionen und Unterlassen nach positiver Netto-Wirkung bewerten.",
            "Öffentliche Finanzen nach Wirkung: MMT als Anschluss, Public Purpose als Anspruch und Staatsschulden, Steuern, Investitionen und Unterlassen nach positiver Netto-Wirkung bewerten.",
        )
        path.write_text(text, encoding="utf-8")
        return
    card = """\n<article class="card impact-field-card">
              <p class="card-kicker">Wirkungsfeld · <span class="status-badge status-badge--live">Live</span></p>
              <h3 class="card-title">Wirkungsfinanzpolitik</h3>
              <p class="card-text">Öffentliche Finanzen nach Wirkung: Schulden, Steuern, Investitionen und Unterlassen nach positiver Netto-Wirkung bewerten.</p>
              <div class="model-strip" aria-label="Betroffene MPD-Dimensionen"><span class="badge">Mensch</span><span class="badge">Planet</span><span class="badge">Demokratie</span></div>
              <div class="impact-field-meta"><strong>Methoden:</strong> <a class="text-link" href="../werkzeuge/wirkungshaushalt/">Wirkungshaushalt</a><a class="text-link" href="../werkzeuge/politische-wirkungspruefung/">Politische Wirkungsprüfung</a></div>
              <div class="impact-field-meta"><strong>Bibliothek:</strong> <a class="text-link" href="../dokumente/wirkungsfinanzpolitik/">Arbeitspapier</a><a class="text-link" href="../blog/dossiers/wirkungsfinanzpolitik.html">Dossier</a></div>
              <div class="portal-card-actions"><a class="text-link" href="./wirkungsfinanzpolitik/">Mehr erfahren</a></div>
            </article>"""
    anchor = '<div class="portal-card-actions"><a class="text-link" href="./staat-recht-demokratie/">Mehr erfahren</a></div>\n            </article>'
    text = text.replace(anchor, anchor + card, 1)
    path.write_text(text, encoding="utf-8")


def update_staat_recht_page() -> None:
    path = ROOT / "wirkungsfelder" / "staat-recht-demokratie" / "index.html"
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        "Öffentliche Einnahmen, Ausgaben, Kredite, Steuern und Investitionen nach positiver Netto-Wirkung bewerten.",
        "Öffentliche Einnahmen, Ausgaben, Kredite, Steuern und Investitionen nach positiver Netto-Wirkung bewerten; MMT, Public Purpose und Functional Finance als Anschlussstellen einordnen.",
    )
    if '../../wirkungsfelder/wirkungsfinanzpolitik/' not in text:
        text = text.replace(
            '<a class="text-link" href="../../dokumente/wirkungsrat-konzept/">Wirkungsrat Konzept</a><a class="text-link" href="../../dokumente/wstg-oktober-2025/">Wirkungssteuergesetz</a>',
            '<a class="text-link" href="../../dokumente/wirkungsrat-konzept/">Wirkungsrat Konzept</a><a class="text-link" href="../../dokumente/wstg-oktober-2025/">Wirkungssteuergesetz</a><a class="text-link" href="../../wirkungsfelder/wirkungsfinanzpolitik/">Wirkungsfinanzpolitik</a><a class="text-link" href="../../dokumente/wirkungsfinanzpolitik/">Arbeitspapier Wirkungsfinanzpolitik</a>',
            1,
        )
    if 'href="../../blog/{ARTICLE_SLUG}.html"'.format(ARTICLE_SLUG=ARTICLE_SLUG) not in text:
        card = f"""<article class="card"><h3 class="card-title">Wirkungsfinanzpolitik</h3><p class="card-text">Öffentliche Einnahmen, Ausgaben, Kredite, Steuern und Investitionen nach positiver Netto-Wirkung bewerten.</p><div class="portal-card-actions"><a class="text-link" href="../../wirkungsfelder/wirkungsfinanzpolitik/">Bereich öffnen</a><a class="text-link" href="../../blog/{ARTICLE_SLUG}.html">Journal-Beitrag</a><a class="text-link" href="../../dokumente/wirkungsfinanzpolitik/">Arbeitspapier</a></div></article>"""
        marker = '<section class="section" aria-labelledby="concepts"><div class="section-header"><p class="hero-kicker">Unterbereiche</p><h2 id="concepts">Zentrale Unterbereiche'
        index = text.find(marker)
        if index != -1:
            grid = text.find('<div class="card-grid three">', index)
            if grid != -1:
                insert_at = grid + len('<div class="card-grid three">')
                text = text[:insert_at] + card + text[insert_at:]
    path.write_text(text, encoding="utf-8")


def update_approved_corpus() -> None:
    path = ROOT / "content" / "assistant" / "approved-corpus.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    sources = data.setdefault("sources", [])
    additions = [
        {
            "source_id": "woek-wirkungsfinanzpolitik-arbeitspapier-2026-06-11",
            "title": "Von der Schuldenfrage zur Wirkungsfinanzpolitik",
            "path": "dokumente/wirkungsfinanzpolitik/",
            "status": "published",
            "allowed_for_assistant": True,
            "source_type": "working_paper",
            "terms": ["Wirkungsfinanzpolitik", "Staatsschulden", "Wirkungshaushalt", "Schuldenbremse", "Wirkschulden", "Blindschulden", "positive Netto-Wirkung", "IOI", "Impact of Investment", "T-SROI", "MMT", "Public Purpose", "Public Purpose Finance", "Functional Finance"],
            "last_checked": "2026-06-11",
            "limitations": "Arbeitsfassung v3 mit IOI-Erweiterung; keine Rechts-, Steuer-, Finanz-, Anlage- oder Politikberatung. MMT als Anschlussbegriff einordnen, Public Purpose als prüfbaren Wirkungsanspruch erläutern, IOI nicht als alleinige Entscheidungskennzahl verwenden und Webfassung/PDF als zitierfähige Fassung nennen.",
        },
        {
            "source_id": "woek-wirkungsfinanzpolitik-journal-2026-06-11",
            "title": TITLE,
            "path": f"blog/{ARTICLE_SLUG}.html",
            "status": "published",
            "allowed_for_assistant": True,
            "source_type": "journal_article",
            "terms": ["Wirkungsfinanzpolitik", "Staatsschulden", "Wirkungshaushalt", "Wirkschulden", "Blindschulden", "positive Netto-Wirkung", "IOI", "Impact of Investment", "T-SROI", "MMT", "Public Purpose", "Functional Finance"],
            "last_checked": "2026-06-11",
            "limitations": "Journalistische Langform v3 mit IOI-Erweiterung; keine Rechts-, Steuer-, Finanz-, Anlage- oder Politikberatung. MMT als Anschlussbegriff einordnen, nicht als Gegner. IOI als Wirkungseffizienz und T-SROI als Transformationswirkung erklären. Bei Antworten Schutzlinie und Arbeitspapier als Vertiefung nennen.",
        },
        {
            "source_id": "woek-wirkungsfinanzpolitik-wirkungsfeld-2026-06-11",
            "title": "Wirkungsfinanzpolitik",
            "path": "wirkungsfelder/wirkungsfinanzpolitik/",
            "status": "published",
            "allowed_for_assistant": True,
            "source_type": "website_page",
            "terms": ["Wirkungsfinanzpolitik", "öffentliche Finanzen", "Wirkungshaushalt", "IOI", "Impact of Investment", "T-SROI", "Schuldenbremse", "MMT", "Public Purpose", "Public Purpose Finance"],
            "last_checked": "2026-06-11",
            "limitations": "Konzeptionelle Bereichsseite; ersetzt keine demokratische, haushaltsrechtliche oder finanzielle Einzelfallprüfung.",
        },
        {
            "source_id": "woek-wirkungsfinanzpolitik-glossarcluster-2026-06-11",
            "title": "Öffentliche Finanzen, Schulden und Wirkung",
            "path": "begriffe/oeffentliche-finanzen-schulden-wirkung/",
            "status": "published",
            "allowed_for_assistant": True,
            "source_type": "glossary_cluster",
            "terms": ["Wirkschulden", "Blindschulden", "Verlustschulden", "Reparaturschulden", "Präventionsschulden", "Transformationsschulden", "Zukunftsschulden", "IOI", "Impact of Investment", "MMT", "Public Purpose", "Public Purpose Finance", "Functional Finance"],
            "last_checked": "2026-06-11",
            "limitations": "Begriffliche Arbeitsfassung; Begriffe müssen in konkreten Haushalts- oder Politikfällen mit Daten, Rechtsrahmen und demokratischer Entscheidung abgeglichen werden.",
        },
    ]
    for addition in additions:
        for index, source in enumerate(sources):
            if source.get("source_id") == addition["source_id"]:
                sources[index] = {**source, **addition}
                break
        else:
            sources.insert(-1 if sources else 0, addition)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def update_llms() -> None:
    path = ROOT / "llms.txt"
    text = path.read_text(encoding="utf-8")
    old_line = "- Wirkungsfinanzpolitik: https://wirkungsoekonomie.de/dokumente/wirkungsfinanzpolitik/ und PDF https://wirkungsoekonomie.de/public/downloads/originals/wirkungsfinanzpolitik-aufsatz-woek.pdf"
    new_line = "- Wirkungsfinanzpolitik v3 mit IOI: https://wirkungsoekonomie.de/dokumente/wirkungsfinanzpolitik/ und PDF https://wirkungsoekonomie.de/public/downloads/originals/wirkungsfinanzpolitik-aufsatz-woek-v2-mmt-public-purpose.pdf"
    text = re.sub(r"^- Wirkungsfinanzpolitik(?: v3 mit IOI)?: https://wirkungsoekonomie\.de/dokumente/wirkungsfinanzpolitik/.*\n?", "", text, flags=re.M)
    if old_line in text:
        text = text.replace(old_line, new_line)
    elif new_line not in text:
        text += "\n" + new_line + "\n"
    additions = [
        f"- Journal Wirkungsfinanzpolitik: https://wirkungsoekonomie.de/blog/{ARTICLE_SLUG}.html",
        "- Wirkungsfeld Wirkungsfinanzpolitik: https://wirkungsoekonomie.de/wirkungsfelder/wirkungsfinanzpolitik/",
        "- Glossar-Cluster Öffentliche Finanzen, Schulden und Wirkung: https://wirkungsoekonomie.de/begriffe/oeffentliche-finanzen-schulden-wirkung/",
        "- MMT als Anschlussbegriff der Wirkungsfinanzpolitik: https://wirkungsoekonomie.de/begriffe/mmt/",
        "- Public Purpose in der Wirkungsfinanzpolitik: https://wirkungsoekonomie.de/begriffe/public-purpose/",
        "- Public Purpose Finance: https://wirkungsoekonomie.de/begriffe/public-purpose-finance/",
        "- IOI / Impact of Investment: https://wirkungsoekonomie.de/begriffe/impact-of-investment/",
    ]
    for line in additions:
        if line not in text:
            text = text.replace(new_line + "\n", new_line + "\n" + line + "\n")
    path.write_text(text, encoding="utf-8")


def clean_html(text: str) -> str:
    text = re.sub(r"<script[\s\S]*?</script>", " ", text, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<(header|footer|nav|aside)\b[\s\S]*?</\1>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def update_search_assets() -> None:
    index_path = ROOT / "assets" / "search" / "search-index.json"
    meta_path = ROOT / "public" / "data" / "woek-search-meta.json"
    if not index_path.exists():
        return
    entries = json.loads(index_path.read_text(encoding="utf-8"))
    pages = [
        {
            "id": "journal-wirkungsfinanzpolitik-2026-06-11",
            "title": TITLE,
            "description": DESCRIPTION,
            "url": f"/blog/{ARTICLE_SLUG}.html",
            "section": "Journal",
            "type": "Journal-Beitrag",
            "format": "Webartikel",
            "tags": ["Wirkungsfinanzpolitik", "Staatsschulden", "Wirkungshaushalt", "Schuldenbremse", "Wirkschulden", "positive Netto-Wirkung", "IOI", "Impact of Investment", "T-SROI", "Haushaltsblindleistung", "MMT", "Public Purpose", "Functional Finance"],
            "priority": 160,
            "file": ARTICLE_PATH,
        },
        {
            "id": "dossier-wirkungsfinanzpolitik-2026-06-11",
            "title": "Dossier Wirkungsfinanzpolitik",
            "description": "Lesepfad zur Wirkungsfinanzpolitik mit Journal-Beitrag, Arbeitspapier, Wirkungsfeld, Glossar und Wirkungshaushalt.",
            "url": "/blog/dossiers/wirkungsfinanzpolitik.html",
            "section": "Journal",
            "type": "Dossier",
            "format": "Lesepfad",
            "tags": ["Wirkungsfinanzpolitik", "Dossier", "Wirkungshaushalt", "IOI", "Impact of Investment"],
            "priority": 140,
            "file": DOSSIER_PATH,
        },
        {
            "id": "wirkungsfeld-wirkungsfinanzpolitik-2026-06-11",
            "title": "Wirkungsfinanzpolitik",
            "description": "Wirkungsfeld für öffentliche Finanzen nach Wirkung: IOI als Wirkung je Euro, MMT als Anschluss, Public Purpose als Anspruch und positive Netto-Wirkung als Maßstab.",
            "url": "/wirkungsfelder/wirkungsfinanzpolitik/",
            "section": "Wirkungsfelder",
            "type": "Bereich",
            "format": "Website",
            "tags": ["Wirkungsfinanzpolitik", "öffentliche Finanzen", "Staat", "Demokratie", "Wirkungshaushalt", "IOI", "Impact of Investment", "T-SROI", "Haushaltsblindleistung", "MMT", "Public Purpose", "Public Purpose Finance"],
            "priority": 155,
            "file": AREA_PATH,
        },
        {
            "id": "glossarcluster-oeffentliche-finanzen-schulden-wirkung-2026-06-11",
            "title": "Öffentliche Finanzen, Schulden und Wirkung",
            "description": "Glossar-Cluster der Wirkungsfinanzpolitik: IOI, MMT, Public Purpose, Wirkschulden, Blindschulden, Verlustschulden, Präventionsschulden, Transformationsschulden und Zukunftsschulden.",
            "url": "/begriffe/oeffentliche-finanzen-schulden-wirkung/",
            "section": "Glossar",
            "type": "Glossar-Cluster",
            "format": "Begriffe",
            "tags": ["IOI", "Impact of Investment", "Wirkschulden", "Blindschulden", "Reparaturschulden", "Zukunftsschulden", "MMT", "Public Purpose", "Public Purpose Finance", "Functional Finance"],
            "priority": 135,
            "file": GLOSSARY_CLUSTER_PATH,
        },
        {
            "id": "glossar-mmt-2026-06-11",
            "title": "MMT",
            "description": "Modern Monetary Theory als Anschlussbegriff der Wirkungsfinanzpolitik: MMT entkräftet den Privathaushaltsmythos, die WÖk ergänzt die Wirkungsfrage.",
            "url": "/begriffe/mmt/",
            "section": "Glossar",
            "type": "Glossar-Begriff",
            "format": "Begriffe",
            "tags": ["MMT", "Modern Monetary Theory", "Wirkungsfinanzpolitik", "Public Purpose", "Schuldenmythos"],
            "priority": 138,
            "file": ROOT / "begriffe" / "mmt" / "index.html",
        },
        {
            "id": "glossar-public-purpose-2026-06-11",
            "title": "Public Purpose",
            "description": "Public Purpose benennt den öffentlichen Zweck; Wirkungsfinanzpolitik macht ihn über positive Netto-Wirkung prüfbar.",
            "url": "/begriffe/public-purpose/",
            "section": "Glossar",
            "type": "Glossar-Begriff",
            "format": "Begriffe",
            "tags": ["Public Purpose", "Wirkungsfinanzpolitik", "positive Netto-Wirkung", "MMT"],
            "priority": 136,
            "file": ROOT / "begriffe" / "public-purpose" / "index.html",
        },
        {
            "id": "glossar-public-purpose-finance-2026-06-11",
            "title": "Public Purpose Finance",
            "description": "Public Purpose Finance verbindet MMT, Functional Finance und Wirkungsfinanzpolitik; die WÖk ergänzt Wirkungsprüfung und Rückkopplung.",
            "url": "/begriffe/public-purpose-finance/",
            "section": "Glossar",
            "type": "Glossar-Begriff",
            "format": "Begriffe",
            "tags": ["Public Purpose Finance", "Public Purpose", "Functional Finance", "MMT", "Wirkungsfinanzpolitik"],
            "priority": 134,
            "file": ROOT / "begriffe" / "public-purpose-finance" / "index.html",
        },
        {
            "id": "glossar-functional-finance-2026-06-11",
            "title": "Functional Finance",
            "description": "Functional Finance bewertet Finanzpolitik nach ihrer realen Funktion; die WÖk erweitert diese Brücke um positive Netto-Wirkung.",
            "url": "/begriffe/functional-finance/",
            "section": "Glossar",
            "type": "Glossar-Begriff",
            "format": "Begriffe",
            "tags": ["Functional Finance", "Wirkungsfinanzpolitik", "Public Purpose", "MMT"],
            "priority": 132,
            "file": ROOT / "begriffe" / "functional-finance" / "index.html",
        },
        {
            "id": "akademie-wirkungsfinanzpolitik-2026-06-11",
            "title": "Öffentliche Finanzen nach Wirkung",
            "description": "Akademie-Modul zur Wirkungsfinanzpolitik: Schulden nach Wirkung unterscheiden und Wirkungshaushalte verstehen.",
            "url": "/akademie/wirkungsfinanzpolitik/",
            "section": "Akademie",
            "type": "Lernmodul",
            "format": "Website",
            "tags": ["Akademie", "Wirkungsfinanzpolitik", "Wirkungshaushalt"],
            "priority": 120,
            "file": AKADEMIE_PATH,
        },
    ]
    existing_urls = {page["url"] for page in pages}
    high_priority_terms = {
        "wirkungsfinanzpolitik",
        "wirkschulden",
        "blindschulden",
        "verlustschulden",
        "reparaturschulden",
        "praeventionsschulden",
        "transformationsschulden",
        "zukunftsschulden",
        "mmt",
        "public-purpose",
        "public-purpose-finance",
        "functional-finance",
        "impact-of-investment",
    }
    for label, slug, definition in TERM_DEFINITIONS:
        url = f"/begriffe/{slug}/"
        target = ROOT / "begriffe" / slug / "index.html"
        if url in existing_urls or not target.exists():
            continue
        pages.append({
            "id": f"glossar-{slug}-2026-06-11",
            "title": label,
            "description": definition,
            "url": url,
            "section": "Glossar",
            "type": "Glossar-Begriff",
            "format": "Begriffe",
            "tags": ["Wirkungsfinanzpolitik", "öffentliche Finanzen", "Staatsschulden", "Wirkungshaushalt", "positive Netto-Wirkung", label],
            "priority": 130 if slug in high_priority_terms else 112,
            "file": target,
        })
        existing_urls.add(url)
    manual_ids = {page["id"] for page in pages}
    entries = [entry for entry in entries if entry.get("id") not in manual_ids]
    for page in pages:
        file_path = page.pop("file")
        body = clean_html(file_path.read_text(encoding="utf-8"))[:1400] if file_path.exists() else page["description"]
        entries.append({
            **page,
            "impactSpaces": ["Mensch", "Planet", "Demokratie"],
            "standards": [],
            "instruments": ["Wirkungshaushalt"],
            "aliases": ["Schulden ohne Wirkung", "Wirkschulden", "Blindschulden", "Reparaturschulden", "Public Purpose", "MMT", "Wirkungskompass"],
            "body": body,
        })
    entries.sort(key=lambda entry: (-int(entry.get("priority", 0)), str(entry.get("title", "")).lower()))
    index_path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if meta_path.exists():
        meta_data = json.loads(meta_path.read_text(encoding="utf-8"))
    else:
        meta_data = {"entries": {}}
    meta_entries = meta_data.setdefault("entries", {})
    for page in pages:
        meta_entries[page["url"]] = {
            "documentType": page["type"],
            "status": "published",
            "version": "2026.1",
            "sectionId": page["id"],
            "sourceFile": page["url"].strip("/") or "index.html",
            "searchBoost": page["priority"],
        }
    meta_path.write_text(json.dumps(meta_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if not SOURCE_DOCX.exists():
        raise FileNotFoundError(SOURCE_DOCX)
    if not SOURCE_IMAGE.exists():
        raise FileNotFoundError(SOURCE_IMAGE)
    blocks = body_blocks(read_docx_blocks(SOURCE_DOCX))
    body_html, toc = render_blocks(blocks, "../")
    IMAGE_TARGET.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE_IMAGE, IMAGE_TARGET)
    ARTICLE_PATH.write_text(render_article(body_html, toc), encoding="utf-8")
    DOSSIER_PATH.write_text(render_dossier(), encoding="utf-8")
    AREA_PATH.parent.mkdir(parents=True, exist_ok=True)
    AREA_PATH.write_text(render_area(), encoding="utf-8")
    GLOSSARY_CLUSTER_PATH.parent.mkdir(parents=True, exist_ok=True)
    GLOSSARY_CLUSTER_PATH.write_text(render_glossary_cluster(), encoding="utf-8")
    term_page_count = render_term_pages()
    AKADEMIE_PATH.parent.mkdir(parents=True, exist_ok=True)
    AKADEMIE_PATH.write_text(render_akademie(), encoding="utf-8")
    update_blog_html()
    update_wirkungsfelder_index()
    update_staat_recht_page()
    update_approved_corpus()
    update_llms()
    update_search_assets()
    print(f"Imported journal article with {len(toc)} sections and {term_page_count} glossary terms: {ARTICLE_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
