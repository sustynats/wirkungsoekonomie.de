#!/usr/bin/env python3
"""Baut den freigegebenen Journalbeitrag zum Wirkungsportal Parlament.

Die publizistische Quelle liegt als Markdown in source-assets/originals. Der
Builder hält die öffentliche HTML-Fassung, Metadaten und die direkte Portal-CTA
konsistent, ohne redaktionelle Arbeitsanweisungen zu veröffentlichen.
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "source-assets/originals/Journal_Politik_an_ihren_Folgen_messen.md"
ARTICLE = ROOT / "blog/politik-an-ihren-folgen-messen.html"
SLUG = "politik-an-ihren-folgen-messen"
TITLE = "Warum politische Entscheidungen einen Wirkungscheck brauchen, bevor sie getroffen werden"
SUBTITLE = "Wie das Wirkungsportal Parlament bestehende Folgenabschätzung zu einer durchgehenden Wirkungsarchitektur weiterführt"
DESCRIPTION = (
    "Das Wirkungsportal Parlament verbindet Folgenabschätzung, Entscheidungsreife, "
    "Beobachtung, Zurechnung und Rückkopplung zu einer durchgehenden Wirkungslogik."
)
DATE = "15. August 2026"
DATE_ISO = "2026-08-15T18:00:00+02:00"
SECTION = "Politik & Demokratie"
READING_TIME = "15 Min."
HERO_IMAGE = "2026-08-15-wirkungscheck-vor-politischen-entscheidungen.png"
HERO_ALT = (
    "Wirkungsportal Parlament: Warum politische Entscheidungen vor ihrem Beschluss "
    "einen Wirkungscheck brauchen."
)
TAGS = [
    "Wirkungsportal Parlament",
    "Politik und Demokratie",
    "Wirkungspotenzial",
    "Wirkungsrisiko",
    "Wirkpfad",
    "Wirkungsrückkopplung",
    "Folgencheck",
    "SDG+",
    "politische Verantwortung",
]


def esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def inline(value: str) -> str:
    """Rendert die bewusst kleine Markdown-Teilmenge der Quellenfassung."""
    rendered = esc(value)
    rendered = re.sub(
        r"\[([^\]]+)\]\((https?://[^\s)]+)\)",
        r'<a class="text-link" href="\2" rel="noopener noreferrer">\1</a>',
        rendered,
    )
    rendered = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", rendered)
    rendered = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", rendered)
    return rendered


def portal_callout() -> str:
    return """          <aside class=\"status-note\" aria-label=\"Wirkungsportal Parlament\">
            <strong>Wirkungsportal Parlament:</strong> Das Portal macht politische Entscheidungen und ihre Folgen nachvollziehbar, ohne Menschen oder Parteien zu bewerten.
            <p class=\"journal-pdf-download-row no-print\"><a class=\"btn btn-primary\" href=\"https://parlament.wirkungsoekonomie.de/\">Zum Wirkungsportal Parlament</a></p>
          </aside>"""


def render_content(source: str) -> str:
    lines = source.splitlines()
    output: list[str] = []
    paragraph: list[str] = []
    list_items: list[str] = []
    portal_added = False

    def flush_paragraph() -> None:
        nonlocal portal_added
        if not paragraph:
            return
        value = " ".join(part.strip() for part in paragraph).strip()
        paragraph.clear()
        if not value:
            return
        output.append(f"          <p>{inline(value)}</p>")
        if (
            value.startswith("Wie lässt sich die bestehende Betrachtung von Problemen")
            or value.startswith("Genau diese Verbindung versucht das Wirkungsportal herzustellen")
        ) and not portal_added:
            output.append(portal_callout())
            portal_added = True

    def flush_list() -> None:
        if not list_items:
            return
        output.append("          <ul>")
        output.extend(f"            <li>{inline(value)}</li>" for value in list_items)
        output.append("          </ul>")
        list_items.clear()

    for line in lines:
        if line.startswith("# "):
            continue
        if not output and not paragraph and not list_items and line.strip() == f"**{SUBTITLE}**":
            continue
        if line.startswith("## "):
            flush_paragraph()
            flush_list()
            output.append(f"          <h2>{inline(line[3:].strip())}</h2>")
            continue
        if line.startswith("- "):
            flush_paragraph()
            list_items.append(line[2:].strip())
            continue
        if not line.strip():
            flush_paragraph()
            flush_list()
            continue
        flush_list()
        paragraph.append(line)

    flush_paragraph()
    flush_list()
    if not portal_added:
        raise ValueError("Die prominente Portalverlinkung konnte nicht eingefügt werden.")
    return "\n".join(output)


def site_shell() -> tuple[str, str]:
    source = (ROOT / "blog/wie-wirksam-ist-das-sondervermoegen-wirklich.html").read_text(encoding="utf-8")
    header_start = source.index('    <header class="site-header"')
    main_start = source.index("    <main", header_start)
    main_end = source.rindex("</main>")
    footer = source[main_end + len("</main>") :]
    # Der globale Footer-Generator fügt das Newsletter-Skript einmalig ein.
    # Es darf nicht aus einer bereits normalisierten Quellseite mehrfach geerbt werden.
    footer = re.sub(r'\s*<script defer src="[^\"]*assets/js/newsletter\.js[^\"]*"></script>', "", footer)
    return source[header_start:main_start], footer


def write_article() -> None:
    if not SOURCE.is_file():
        raise FileNotFoundError(f"Quelltext fehlt: {SOURCE}")
    header, footer = site_shell()
    content = render_content(SOURCE.read_text(encoding="utf-8"))
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
            "name": "Institut für Wirkungsökonomie",
            "url": "https://wirkungsoekonomie.de/institut/",
        },
        "mainEntityOfPage": f"https://wirkungsoekonomie.de/blog/{SLUG}.html",
        "articleSection": SECTION,
        "keywords": TAGS,
    }
    tags = "\n".join(f'  <meta property="article:tag" content="{esc(tag)}">' for tag in TAGS)
    ARTICLE.write_text(
        f'''<!doctype html>
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
    <meta name="search_index_kind" content="journal">
    <meta name="search_tags" content="{esc(', '.join(TAGS))}">
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
          <p class="hero-kicker">{esc(SECTION)} · {DATE} · {READING_TIME}</p>
          <h1 class="hero-title">{esc(TITLE)}</h1>
          <p class="hero-subtitle">{esc(SUBTITLE)}</p>
          <p class="journal-pdf-download-row no-print" data-search-exclude><a class="btn btn-secondary journal-pdf-download" data-journal-pdf-download href="../assets/pdf/journal/{SLUG}.pdf" download>PDF herunterladen</a></p>
          <p class="meta">Von Natalie Weber · Begründerin der Wirkungsökonomie</p>
        </div>
        <figure class="hero-system-visual article-visual"><img src="../assets/img/blog/{HERO_IMAGE}" width="1920" height="1080" alt="{esc(HERO_ALT)}" decoding="async" fetchpriority="high"></figure>
      </article>
      <section class="article-page">
        <div class="article-body">
          <div class="status-note"><strong>Einordnung:</strong> Das Wirkungsportal trennt Wirkungspotenzial, Wirkungsrisiko, Beobachtung und evidenzgestützte Wirkungsbewertung. Es bewertet Entscheidungen und ihre Folgen, nicht Menschen oder Parteien.</div>
{content}
          <p><strong>Weiterlesen:</strong> <a class="text-link" href="../begriffe/wirkungspotenzial/">Wirkungspotenzial</a>, <a class="text-link" href="../begriffe/wirkungsrisiko/">Wirkungsrisiko</a>, <a class="text-link" href="../begriffe/wirkpfad/">Wirkpfad</a>, <a class="text-link" href="../begriffe/wirkungsrueckkopplung/">Wirkungsrückkopplung</a> und <a class="text-link" href="../verstehen/sdgs-sdgplus/">SDG+</a>.</p>
          <p><a class="text-link" href="https://parlament.wirkungsoekonomie.de/">Wirkungsportal Parlament öffnen</a></p>
          <p><a class="text-link" href="../blog.html">Zurück zum Journal</a></p>
        </div>
      </section>
    </main>
{footer}''',
        encoding="utf-8",
    )


if __name__ == "__main__":
    write_article()
