#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]
ARTICLE_PATH = ROOT / "blog" / "die-stille-neubewertung.html"
IMAGE_TARGET = ROOT / "assets" / "img" / "blog" / "2026-06-29-die-stille-neubewertung.webp"
HEADER_TEMPLATE = ROOT / "templates" / "header.html"
FOOTER_TEMPLATE = ROOT / "templates" / "footer.html"
NAVIGATION_DATA = ROOT / "assets" / "data" / "navigation.json"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = f"{{{NS['w']}}}"

TITLE = "Die stille Neubewertung"
SUBTITLE = "Was der Finanzmarkt über den Klimawandel weiß. Und warum es dein Zuhause, dein Geschäft und dein Erspartes betrifft."
DESCRIPTION = (
    "Journal-Beitrag darüber, wie Klimawandel über Versicherbarkeit, Kreditwürdigkeit "
    "und Vermögenswerte in Preise, Zinsen und Bewertungen zurückkehrt."
)
DATE_LABEL = "29. Juni 2026"
DATE_ISO = "2026-06-29T17:39:23+02:00"
AUTHOR = "Natalie Weber"
ARTICLE_URL = "https://wirkungsoekonomie.de/blog/die-stille-neubewertung.html"
IMAGE_URL = "https://wirkungsoekonomie.de/assets/img/blog/2026-06-29-die-stille-neubewertung.webp"
IMAGE_ALT = (
    "Klimawandel, Finanzmarkt und Wirkungsökonomie: Versicherungsrisiken, Stranded Assets, "
    "Sustainable Finance, Wirkungskapital und eine vernetzte Neubewertung von Vermögen."
)
FIGCAPTION = (
    "Die stille Neubewertung: Klimarisiken kehren über Versicherbarkeit, Kredit, Kapital "
    "und Vermögenswerte ins System zurück."
)

TERMS = [
    ("positive Netto-Wirkung", "begriffe/positive-netto-wirkung/"),
    ("Netto-Wirkung", "begriffe/netto-wirkung/"),
    ("Wirkungsrisiko", "begriffe/wirkungsrisiko/"),
    ("Wirkungspotenzial", "begriffe/wirkungspotenzial/"),
    ("Wirkungsrückkopplung", "begriffe/wirkungsrueckkopplung/"),
    ("Nichtkompensation", "begriffe/nichtkompensationsprinzip/"),
    ("Reverse Merit Order", "begriffe/reverse-merit-order/"),
    ("Wirkungskapital", "begriffe/wirkungskapital/"),
    ("Sustainable Finance", "begriffe/sustainable-finance/"),
    ("Stranded Assets", "begriffe/stranded-assets/"),
    ("Klimarisiko", "begriffe/klimarisiko/"),
    ("Klimawandel", "begriffe/klimawandel/"),
    ("Wirkungsökonomie", "wirkungsoekonomie/"),
    ("Wirkung", "begriffe/wirkung/"),
    ("Dossier Klimawandel und der Finanzmarkt", "bibliothek/klimawandel-finanzmarkt/"),
]


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


def para_style(para: ET.Element) -> tuple[str, bool]:
    ppr = para.find("w:pPr", NS)
    if ppr is None:
        return "Normal", False
    style = ppr.find("w:pStyle", NS)
    num_pr = ppr.find("w:numPr", NS) is not None
    return (style.attrib.get(f"{W}val", "Normal") if style is not None else "Normal"), num_pr


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
                style, num_pr = para_style(child)
                blocks.append({"type": "paragraph", "style": style, "numPr": num_pr, "text": text})
        elif child.tag == f"{W}tbl":
            rows = table_rows(child)
            if rows:
                blocks.append({"type": "table", "rows": rows})
    return blocks


def article_blocks(blocks: list[dict]) -> list[dict]:
    kept: list[dict] = []
    in_body = False
    for block in blocks:
        if block["type"] == "paragraph":
            text = block["text"].strip()
            if text == "JOURNAL. KLIMA UND KAPITAL":
                continue
            if text == TITLE or text == SUBTITLE:
                continue
            if not in_body:
                in_body = True
        if in_body:
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


def emphasize_lead_sentence(text: str, prefix: str, linked_terms: set[str]) -> str:
    match = re.match(r"^([^.!?]{3,80}[.!?])\s+(.+)$", text)
    if not match:
        return link_text(text, prefix, linked_terms)
    lead, rest = match.groups()
    return f"<strong>{link_text(lead, prefix, linked_terms)}</strong> {link_text(rest, prefix, linked_terms)}"


def render_callout(text: str, prefix: str, linked_terms: set[str]) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return ""
    title = lines[0]
    body_lines = lines[1:]
    lowered = title.lower()
    class_name = "callout dossier-note"
    if "gegenfrage" in lowered:
        class_name += " warning"
    elif "merksatz" in lowered:
        class_name += " highlight"

    body = ""
    if body_lines:
        body = "".join(f"<p>{emphasize_lead_sentence(line, prefix, linked_terms)}</p>" for line in body_lines)
    return (
        f'          <aside class="{class_name}">'
        f"<p><strong>{link_text(title, prefix, linked_terms)}</strong></p>"
        f"{body}"
        "</aside>"
    )


def render_table(rows: list[list[str]], prefix: str, linked_terms: set[str]) -> str:
    if len(rows) == 1 and len(rows[0]) == 1:
        return render_callout(rows[0][0], prefix, linked_terms)
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
            level = 2 if level_value <= 2 else 3
            toc.append((level, anchor, text))
            parts.append(
                f'          <h{level} id="{anchor}" data-section-id="{anchor}">{esc(text)} '
                f'<a class="cite-anchor no-print" href="#{anchor}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h{level}>'
            )
            continue

        is_list = block.get("numPr") or style.lower() in {"listparagraph", "listbullet"}
        if is_list:
            if list_tag != "ul":
                close_list()
                parts.append('          <ul class="clean-list">')
                list_tag = "ul"
            para_no += 1
            pid = f"{pid_prefix}-{para_no:04d}"
            parts.append(f'            <li id="{pid}" data-paragraph-id="{pid}">{emphasize_lead_sentence(text, prefix, linked_terms)}</li>')
            continue

        close_list()
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
    tags = [
        "Klimawandel",
        "Finanzmarkt",
        "Versicherbarkeit",
        "Kreditwürdigkeit",
        "Sustainable Finance",
        "Stranded Assets",
        "Klimarisiko",
        "Wirkungskapital",
        "Wirkungsökonomie",
    ]
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
        "articleSection": "Klima & Kapital",
        "keywords": tags,
        "isBasedOn": "https://wirkungsoekonomie.de/bibliothek/klimawandel-finanzmarkt/",
    }
    tag_meta = "\n".join(f'    <meta property="article:tag" content="{esc(tag)}">' for tag in tags)
    search_tags = ", ".join(tags + ["Versicherung", "Kredit", "Vermögenswert", "Nichtkompensation", "positive Netto-Wirkung"])
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
    <meta name="search_tags" content="{esc(search_tags)}">
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
    <meta property="article:section" content="Klima &amp; Kapital">
{tag_meta}
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
          <p class="hero-kicker">Journal · Klima &amp; Kapital · {DATE_LABEL} · {esc(reading_time)}</p>
          <h1 class="hero-title">{esc(TITLE)}</h1>
          <p class="hero-subtitle">{esc(SUBTITLE)}</p>
          <p class="meta">Von {esc(AUTHOR)} · Journal-Beitrag</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="../assets/img/blog/2026-06-29-die-stille-neubewertung.webp" width="1376" height="768" alt="{esc(IMAGE_ALT)}" decoding="async" fetchpriority="high">
          <figcaption>{esc(FIGCAPTION)}</figcaption>
        </figure>
      </article>
      <section class="article-page">
        <div class="article-body">
          <div class="status-note"><strong>Faktenstand:</strong> Juni 2026. Der Beitrag ist eine Einordnung, keine Versicherungs-, Rechts-, Kredit-, Förder-, Steuer- oder Anlageberatung.</div>
          <div class="callout"><p><strong>Vertiefung:</strong> Die ausführliche Fassung mit Quellenapparat ist das <a class="text-link" href="../bibliothek/klimawandel-finanzmarkt/">Dossier Klimawandel und der Finanzmarkt</a>.</p></div>
{toc_details(toc)}
{body_html}
        </div>
      </section>
    </main>{footer}"""


def convert_image(source: Path) -> None:
    if not source.exists():
        raise SystemExit(f"Missing image: {source}")
    IMAGE_TARGET.parent.mkdir(parents=True, exist_ok=True)
    try:
        from PIL import Image

        image = Image.open(source).convert("RGB")
        image.save(IMAGE_TARGET, "WEBP", quality=86, method=6)
    except Exception:
        subprocess.run(["sips", "-s", "format", "webp", str(source), "--out", str(IMAGE_TARGET)], check=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import the 'Die stille Neubewertung' journal article.")
    parser.add_argument("--source-docx", type=Path, required=True)
    parser.add_argument("--source-image", type=Path, required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.source_docx.exists():
        raise SystemExit(f"Missing source DOCX: {args.source_docx}")
    convert_image(args.source_image)
    blocks = article_blocks(read_docx_blocks(args.source_docx))
    body_html, toc, word_count = render_blocks(blocks, "../", "journal-stille-neubewertung")
    reading_minutes = max(1, round(word_count / 250))
    ARTICLE_PATH.write_text(render_article(body_html, toc, f"{reading_minutes} Min."), encoding="utf-8")
    print(f"Updated {ARTICLE_PATH.relative_to(ROOT)}")
    print(f"Updated {IMAGE_TARGET.relative_to(ROOT)}")
    print(f"Words: {word_count}; reading time: {reading_minutes} Min.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
