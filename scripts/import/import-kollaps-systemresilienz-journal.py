#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import subprocess
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DOCX = Path("Journalbeitrag_Kollaps_Systemresilienz_Grundgesetz_SDGplus_WOeK_ohne_Meta_clean.docx")
SOURCE_IMAGE = Path("ChatGPT Image 15. Juni 2026, 20_26_49.png")
ARTICLE_PATH = ROOT / "blog" / "kollaps-der-zivilisation-systemresilienz-demokratie-sdgplus.html"
IMAGE_TARGET = ROOT / "assets" / "img" / "blog" / "2026-06-15-kollaps-zivilisation-systemresilienz-sdgplus.webp"
HEADER_TEMPLATE = ROOT / "templates" / "header.html"
FOOTER_TEMPLATE = ROOT / "templates" / "footer.html"
NAVIGATION_DATA = ROOT / "assets" / "data" / "navigation.json"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = f"{{{NS['w']}}}"

TITLE = "Kollaps der Zivilisation?"
SUBTITLE = "Systemresilienz, Grundrechte und SDG+ in der Wirkungsökonomie"
DESCRIPTION = (
    "Warum Kollaps für Deutschland nicht als Untergangsbild, sondern als Verlust von "
    "Grundrechts-, Lebensgrundlagen- und demokratischer Korrekturfähigkeit verstanden werden sollte."
)
DATE_LABEL = "15. Juni 2026"
DATE_ISO = "2026-06-15T20:26:49+02:00"
AUTHOR = "Natalie Weber"
ARTICLE_URL = "https://wirkungsoekonomie.de/blog/kollaps-der-zivilisation-systemresilienz-demokratie-sdgplus.html"
IMAGE_URL = "https://wirkungsoekonomie.de/assets/img/blog/2026-06-15-kollaps-zivilisation-systemresilienz-sdgplus.webp"
IMAGE_ALT = (
    "Kollaps der Zivilisation: Deutschland zwischen Systemstress und Systemresilienz, "
    "mit Grundgesetz, Demokratie, Medienqualität, Transparenz, sozialem Zusammenhalt und ökologischer Stabilität."
)


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


def article_blocks(blocks: list[dict]) -> list[dict]:
    kept: list[dict] = []
    in_article = False
    skip_toc = False
    for block in blocks:
        if block["type"] == "paragraph":
            text = block["text"].strip()
            style = block.get("style", "Normal")
            if heading_level(style) == 1 and text == "Abstract":
                in_article = True
            if not in_article:
                continue
            if heading_level(style) == 1 and text == "Inhalt":
                skip_toc = True
                continue
            if skip_toc:
                if heading_level(style) == 1 and re.match(r"^\d+\.", text):
                    skip_toc = False
                else:
                    continue
            if heading_level(style) == 2 and text == "Hinweis zur Verwendung":
                break
        elif not in_article:
            continue
        kept.append(block)
    return kept


def heading_level(style: str) -> int | None:
    normalized = style.lower()
    if normalized in {"heading1", "berschrift1"}:
        return 1
    if normalized in {"heading2", "berschrift2"}:
        return 2
    if normalized in {"heading3", "berschrift3"}:
        return 3
    return None


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


def shell(relative_depth: int) -> tuple[str, str]:
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
    footer = f'{footer}\n    <script src="{base}assets/js/main.js?v=20260612-mobile-table-fix"></script>\n  </body>\n</html>\n'
    return header, footer


TERMS = [
    ("positive Netto-Wirkung", "begriffe/positive-netto-wirkung/"),
    ("negative Netto-Wirkung", "begriffe/netto-wirkung/"),
    ("Netto-Wirkung", "begriffe/netto-wirkung/"),
    ("Systemresilienz", "begriffe/systemresilienz/"),
    ("SDG+", "begriffe/sdg-plus/"),
    ("Grundrechte", "begriffe/grundrechte/"),
    ("Demokratische Resilienz", "begriffe/demokratische-resilienz/"),
    ("Medienqualität", "begriffe/medienqualitaet/"),
    ("Diskursfähigkeit", "begriffe/diskursfaehigkeit/"),
    ("Rechtsstaatlichkeit", "begriffe/rechtsstaatlichkeit/"),
    ("institutionelles Vertrauen", "begriffe/institutionelles-vertrauen/"),
    ("gesellschaftlicher Zusammenhalt", "begriffe/gesellschaftlicher-zusammenhalt/"),
    ("digitale Selbstbestimmung", "begriffe/digitale-selbstbestimmung/"),
    ("Desinformation", "begriffe/desinformation/"),
    ("Polarisierung", "begriffe/polarisierung/"),
    ("Wirkungsrisiko", "begriffe/wirkungsrisiko/"),
    ("Wirkungspotenzial", "begriffe/wirkungspotenzial/"),
    ("Wirkungsdaten", "begriffe/wirkungsdaten/"),
    ("Wirkungsraum", "begriffe/wirkungsraum/"),
    ("Resonanzraum", "begriffe/resonanzraum/"),
    ("Nichtkompensation", "begriffe/nichtkompensationsprinzip/"),
    ("Wirkungsarchitektur", "begriffe/wirkungsarchitektur/"),
    ("Wirkungsökonomie", "wirkungsoekonomie.html"),
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
    max_cols = max(len(row) for row in rows)
    normalized = [row + [""] * (max_cols - len(row)) for row in rows]
    if len(normalized) == 1 and max_cols <= 2:
        head = normalized[0][0]
        body = normalized[0][1] if max_cols == 2 else ""
        if max_cols == 1 and "\n" in head:
            head, body = head.split("\n", 1)
        return (
            '          <aside class="callout dossier-note">'
            f"<p><strong>{link_text(head, prefix, linked_terms)}</strong>"
            f"{' ' + link_text(body, prefix, linked_terms) if body else ''}</p>"
            "</aside>"
        )
    head = normalized[0]
    body = normalized[1:]
    out = ['          <div class="table-wrap" role="region" tabindex="0"><table class="data-table dossier-table">']
    out.append("<thead><tr>" + "".join(f"<th>{link_text(cell, prefix, linked_terms)}</th>" for cell in head) + "</tr></thead>")
    out.append("<tbody>")
    for row in body:
        out.append("<tr>" + "".join(f"<td>{link_text(cell, prefix, linked_terms)}</td>" for cell in row) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


def render_blocks(blocks: list[dict], prefix: str, pid_prefix: str) -> tuple[str, list[tuple[int, str, str]], int]:
    used: set[str] = set()
    linked_terms: set[str] = set()
    toc: list[tuple[int, str, str]] = []
    parts: list[str] = []
    para_no = 0
    words = 0
    list_tag: str | None = None

    def close_list() -> None:
        nonlocal list_tag
        if list_tag:
            parts.append(f"          </{list_tag}>")
            list_tag = None

    for block in blocks:
        if block["type"] == "table":
            close_list()
            table_text = " ".join(" ".join(row) for row in block["rows"])
            words += len(re.findall(r"\w+", table_text))
            parts.append(render_table(block["rows"], prefix, linked_terms))
            continue

        style = block.get("style", "Normal")
        text = block["text"].strip()
        words += len(re.findall(r"\w+", text))

        level_value = heading_level(style)
        if level_value:
            close_list()
            anchor = slugify(text, used)
            level = 2 if level_value == 1 else 3 if level_value == 2 else 4
            toc.append((level, anchor, text))
            parts.append(
                f'          <h{level} id="{anchor}" data-section-id="{anchor}">{esc(text)} '
                f'<a class="cite-anchor no-print" href="#{anchor}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h{level}>'
            )
            continue

        style_key = style.lower()
        is_number = style.startswith("ListNumber") or "nummer" in style_key
        is_bullet = style.startswith("ListBullet") or "bullet" in style_key or "aufz" in style_key
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
        if style in {"Quote", "Zitat"}:
            parts.append(f'          <blockquote>{link_text(text, prefix, linked_terms)}</blockquote>')
        elif style in {"SourceNote", "Source Note"}:
            parts.append(f'          <aside class="source-note"><p>{link_text(text, prefix, linked_terms)}</p></aside>')
        else:
            para_no += 1
            pid = f"{pid_prefix}-{para_no:04d}"
            class_attr = ' class="lead"' if para_no == 1 else ""
            parts.append(f'          <p{class_attr} id="{pid}" data-paragraph-id="{pid}">{link_text(text, prefix, linked_terms)}</p>')

    close_list()
    return "\n".join(parts), toc, words


def toc_details(toc: list[tuple[int, str, str]]) -> str:
    items = "\n".join(f'            <li><a href="#{esc(anchor)}">{esc(title)}</a></li>' for level, anchor, title in toc if level == 2)
    return f'          <details class="toc-card no-print" aria-label="Inhaltsverzeichnis"><summary class="card-title">Inhaltsverzeichnis anzeigen</summary><ol>\n{items}\n          </ol></details>'


def render_article(body_html: str, toc: list[tuple[int, str, str]], reading_time: str) -> str:
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
        "datePublished": DATE_ISO,
        "dateModified": DATE_ISO,
        "author": {"@type": "Person", "name": AUTHOR},
        "publisher": {"@type": "Organization", "name": "Wirkungsökonomie", "url": "https://wirkungsoekonomie.de"},
        "articleSection": "Staat, Recht & Demokratie",
        "keywords": [
            "Kollaps der Zivilisation",
            "Systemresilienz",
            "Grundgesetz",
            "Grundrechte",
            "SDG+",
            "Demokratie",
            "Medienqualität",
            "Rechtsstaatlichkeit",
            "Wirkungsökonomie",
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
    <meta name="search_type" content="Journalartikel">
    <meta name="search_tags" content="Kollaps der Zivilisation, Systemresilienz, Grundgesetz, Grundrechte, SDG+, Demokratie, Medienqualität, Rechtsstaatlichkeit, Desinformation, Polarisierung, demokratische Resilienz, Wirkungsökonomie, Wirkungsarchitektur, positive Netto-Wirkung, Nichtkompensation">
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
    <meta property="article:published_time" content="{DATE_ISO}">
    <meta property="article:modified_time" content="{DATE_ISO}">
    <meta property="article:section" content="Staat, Recht &amp; Demokratie">
    <meta property="article:tag" content="Systemresilienz">
    <meta property="article:tag" content="Grundgesetz">
    <meta property="article:tag" content="SDG+">
    <meta property="article:tag" content="Demokratische Resilienz">
    <meta property="article:tag" content="Medienqualität">
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
          <p class="hero-kicker">Journal · Staat, Recht &amp; Demokratie · {DATE_LABEL} · {esc(reading_time)}</p>
          <h1 class="hero-title">{esc(TITLE)}</h1>
          <p class="hero-subtitle">{esc(SUBTITLE)}</p>
          <p class="meta">Von {esc(AUTHOR)}</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="../assets/img/blog/2026-06-15-kollaps-zivilisation-systemresilienz-sdgplus.webp" width="1672" height="941" alt="{esc(IMAGE_ALT)}" decoding="async" fetchpriority="high">
          <figcaption>Systemstress oder Systemresilienz: Die Kollapsfrage wird konkret, wenn sie an Grundrechte, Lebensgrundlagen und demokratische Korrekturfähigkeit rückgebunden wird.</figcaption>
        </figure>
      </article>
      <section class="article-page">
        <div class="article-body">
          <div class="status-note"><strong>Faktenstand:</strong> {DATE_LABEL}. Der Beitrag nutzt eine verfassungsbezogene Wirkungslogik als Orientierung; er ersetzt keine juristische Prüfung und ist kein Rechtsgutachten.</div>
          <div class="callout"><p><strong>Kernthese:</strong> Nicht der Untergang ist der eigentliche Gegenstand der Kollapsdebatte. Entscheidend ist, ob eine Gesellschaft ihre Grundrechte, natürlichen Lebensgrundlagen und demokratische Korrekturfähigkeit auch unter Stress sichern kann.</p></div>
{toc_details(toc)}
{body_html}
        </div>
      </section>
    </main>{footer}"""


def convert_image() -> None:
    if not SOURCE_IMAGE.exists():
        raise SystemExit(f"Missing image: {SOURCE_IMAGE}")
    IMAGE_TARGET.parent.mkdir(parents=True, exist_ok=True)
    try:
        from PIL import Image

        image = Image.open(SOURCE_IMAGE)
        image.save(IMAGE_TARGET, "WEBP", quality=86, method=6)
    except Exception:
        subprocess.run(["sips", "-s", "format", "webp", str(SOURCE_IMAGE), "--out", str(IMAGE_TARGET)], check=True)


def main() -> int:
    if not SOURCE_DOCX.exists():
        raise SystemExit(f"Missing source DOCX: {SOURCE_DOCX}")
    convert_image()
    blocks = article_blocks(read_docx_blocks(SOURCE_DOCX))
    body_html, toc, word_count = render_blocks(blocks, "../", "journal-kollaps")
    reading_minutes = max(1, round(word_count / 250))
    ARTICLE_PATH.write_text(render_article(body_html, toc, f"{reading_minutes} Min."), encoding="utf-8")
    print(f"Updated {ARTICLE_PATH.relative_to(ROOT)}")
    print(f"Updated {IMAGE_TARGET.relative_to(ROOT)}")
    print(f"Words: {word_count}; reading time: {reading_minutes} Min.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
