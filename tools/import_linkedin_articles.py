#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import html
from html.parser import HTMLParser
import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable


SOURCE_DIR = Path("Articles")
SITE_ROOT = Path(__file__).resolve().parents[1]
ARTICLE_DIR = SITE_ROOT / "blog" / "linkedin"
IMAGE_DIR = SITE_ROOT / "assets" / "img" / "linkedin"
TMP_CURL_CONFIG = Path("/private/tmp/linkedin-image-downloads.config")
ARCHIVE_PATH = SITE_ROOT / "blog" / "linkedin-artikel.html"
SITEMAP_PATH = SITE_ROOT / "sitemap.xml"


@dataclass
class SourceArticle:
    source: Path
    title: str
    slug: str
    date: str
    date_label: str
    original_url: str
    content_html: str
    text_length: int
    image_count: int


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)

    def text(self) -> str:
        return re.sub(r"\s+", " ", " ".join(self.parts)).strip()


class ArticleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.stack: list[tuple[str, dict[str, str]]] = []
        self.title_parts: list[str] = []
        self.h1_parts: list[str] = []
        self.created_parts: list[str] = []
        self.published_parts: list[str] = []
        self.h1_href = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {k: v or "" for k, v in attrs}
        self.stack.append((tag, attr))
        if tag == "a" and self._in_tag("h1") and attr.get("href"):
            self.h1_href = attr["href"]

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                self.stack = self.stack[:index]
                return

    def handle_data(self, data: str) -> None:
        if self._in_tag("title"):
            self.title_parts.append(data)
        if self._in_tag("h1"):
            self.h1_parts.append(data)
        if self._in_class("created"):
            self.created_parts.append(data)
        if self._in_class("published"):
            self.published_parts.append(data)

    def _in_tag(self, tag: str) -> bool:
        return any(item[0] == tag for item in self.stack)

    def _in_class(self, class_name: str) -> bool:
        return any(class_name in item[1].get("class", "").split() for item in self.stack)


class Sanitizer(HTMLParser):
    allowed_tags = {
        "a",
        "blockquote",
        "br",
        "code",
        "em",
        "figcaption",
        "figure",
        "h2",
        "h3",
        "h4",
        "li",
        "ol",
        "p",
        "pre",
        "strong",
        "ul",
        "img",
    }

    def __init__(self, image_map: dict[str, str]) -> None:
        super().__init__(convert_charrefs=False)
        self.image_map = image_map
        self.out: list[str] = []
        self.image_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag not in self.allowed_tags:
            return
        attr = {k: v or "" for k, v in attrs}
        if tag == "a":
            href = attr.get("href", "")
            if href:
                self.out.append(
                    f'<a href="{html.escape(href, quote=True)}" target="_blank" rel="noopener noreferrer">'
                )
            return
        if tag == "img":
            src = attr.get("src", "")
            if not src:
                return
            self.image_count += 1
            mapped = self.image_map.get(src, src)
            alt = attr.get("alt") or "Abbildung aus dem LinkedIn-Artikel"
            self.out.append(
                f'<img src="{html.escape(mapped, quote=True)}" alt="{html.escape(alt, quote=True)}" loading="lazy" decoding="async">'
            )
            return
        self.out.append(f"<{tag}>")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.allowed_tags and tag not in {"br", "img"}:
            self.out.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        self.out.append(html.escape(data))

    def handle_entityref(self, name: str) -> None:
        self.out.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self.out.append(f"&#{name};")

    def html(self) -> str:
        return "".join(self.out)


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value or "")).strip()


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii").lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value[:96].strip("-") or "linkedin-artikel"


def parse_date(label: str) -> tuple[str, str]:
    match = re.search(r"(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})", label)
    if not match:
        return "2026-05-18", "18. Mai 2026"
    date = match.group(1)
    dt = datetime.strptime(date, "%Y-%m-%d")
    months = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
    ]
    return date, f"{dt.day}. {months[dt.month - 1]} {dt.year}"


def extract_content(raw: str) -> str:
    body_match = re.search(r"<body[^>]*>(.*?)</body>", raw, re.S | re.I)
    body = body_match.group(1) if body_match else raw
    body = re.sub(r"^\s*<img\b[^>]*>\s*", "", body, count=1, flags=re.S | re.I)
    body = re.sub(r"\s*<h1\b.*?</h1>\s*", "", body, count=1, flags=re.S | re.I)
    body = re.sub(r"\s*<p\s+class=[\"']created[\"'].*?</p>\s*", "", body, count=1, flags=re.S | re.I)
    body = re.sub(r"\s*<p\s+class=[\"']published[\"'].*?</p>\s*", "", body, count=1, flags=re.S | re.I)
    body = body.strip()
    wrapper = re.fullmatch(r"<div>(.*)</div>", body, re.S | re.I)
    return wrapper.group(1).strip() if wrapper else body


def collect_image_urls(content: str) -> list[str]:
    return [html.unescape(src) for src in re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)["\']', content, flags=re.I)]


def image_name(article_slug: str, index: int, url: str) -> str:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:10]
    return f"{article_slug}-{index:02d}-{digest}.jpg"


def image_mapping(article_slug: str, urls: Iterable[str]) -> dict[str, str]:
    mapping: dict[str, str] = {}
    for index, url in enumerate(urls, start=1):
        filename = image_name(article_slug, index, url)
        local = IMAGE_DIR / filename
        if local.exists():
            mapping[url] = f"../../assets/img/linkedin/{filename}"
        else:
            mapping[url] = url
    return mapping


def parse_articles() -> tuple[list[SourceArticle], list[tuple[Path, str]]]:
    parsed: list[tuple[Path, str, str, str, str, str, str, int, list[str]]] = []
    skipped: list[tuple[Path, str]] = []
    for source in sorted(SOURCE_DIR.glob("*.html")):
        raw = unicodedata.normalize("NFC", source.read_bytes().decode("utf-8"))
        parser = ArticleParser()
        parser.feed(raw)
        title = clean_text(" ".join(parser.title_parts)) or clean_text(" ".join(parser.h1_parts))
        if not title:
            title = source.stem
        content_raw = extract_content(raw)
        text_parser = TextExtractor()
        text_parser.feed(content_raw)
        text_length = len(text_parser.text())
        if text_length < 200:
            skipped.append((source, "zu wenig Text"))
            continue
        published = clean_text(" ".join(parser.published_parts))
        created = clean_text(" ".join(parser.created_parts))
        date_source = published if published and "---" not in published else created
        date, date_label = parse_date(date_source)
        parsed.append((source, title, slugify(title), date, date_label, parser.h1_href, content_raw, text_length, collect_image_urls(content_raw)))

    by_title: dict[str, list[tuple[Path, str, str, str, str, str, str, int, list[str]]]] = {}
    for item in parsed:
        key = unicodedata.normalize("NFC", item[1]).casefold()
        by_title.setdefault(key, []).append(item)

    articles: list[SourceArticle] = []
    used_slugs: set[str] = set()
    for items in by_title.values():
        items = sorted(items, key=lambda item: (item[3], "---" not in item[5], item[0].name), reverse=True)
        winner = items[0]
        for duplicate in items[1:]:
            skipped.append((duplicate[0], f"Duplikat von {winner[0].name}"))
        source, title, base_slug, date, date_label, original_url, content_raw, text_length, urls = winner
        slug = f"{date}-{base_slug}"
        original_slug = slug
        counter = 2
        while slug in used_slugs:
            slug = f"{original_slug}-{counter}"
            counter += 1
        used_slugs.add(slug)
        sanitizer = Sanitizer(image_mapping(slug, urls))
        sanitizer.feed(content_raw)
        articles.append(
            SourceArticle(
                source=source,
                title=title,
                slug=slug,
                date=date,
                date_label=date_label,
                original_url=original_url,
                content_html=sanitizer.html(),
                text_length=text_length,
                image_count=sanitizer.image_count,
            )
        )
    return sorted(articles, key=lambda article: (article.date, article.title), reverse=True), skipped


def description_for(article: SourceArticle) -> str:
    extractor = TextExtractor()
    extractor.feed(article.content_html)
    text = extractor.text()
    return (text[:157].rsplit(" ", 1)[0] + "...") if len(text) > 160 else text


def render_article(article: SourceArticle) -> str:
    escaped_title = html.escape(article.title)
    description = html.escape(description_for(article), quote=True)
    canonical = f"https://wirkungsoekonomie.de/blog/linkedin/{article.slug}.html"
    source_link = (
        f'<p class="card-text">Zuerst veröffentlicht auf <a class="text-link" href="{html.escape(article.original_url, quote=True)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>.</p>'
        if article.original_url
        else ""
    )
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{escaped_title} - LinkedIn-Archiv</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="{canonical}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="{escaped_title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/brand/logo-full.svg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{escaped_title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="https://wirkungsoekonomie.de/assets/img/brand/logo-full.svg">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="../../index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="../../assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="../../index.html">Start</a>
        <a href="../../wirkungsoekonomie.html">Wirkungsökonomie</a>
        <a href="../../buch.html">Das Buch</a>
        <a href="../../modell.html">Modell</a>
        <a href="../../anwendungen.html">Anwendungen</a>
        <a class="active" href="../../blog.html">Journal</a>
        <a href="../../akademie.html">Akademie</a>
        <a href="../../mitmachen.html">Mitmachen</a>
      </nav>
    </header>

    <main>
      <article class="hero">
        <div class="hero-copy">
          <p class="hero-kicker">LinkedIn-Archiv · {html.escape(article.date_label)}</p>
          <h1 class="hero-title">{escaped_title}</h1>
          {source_link}
        </div>
      </article>

      <section class="article-page">
        <div class="article-body linkedin-article-body">
{indent(article.content_html, 10)}
          <p><a class="text-link" href="../linkedin-artikel.html">Zurück zum LinkedIn-Archiv</a></p>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">LinkedIn-Archiv</p>
          <h2>Texte der Wirkungsökonomie</h2>
          <p>Übernommene LinkedIn-Artikel von Natalie Weber, redaktionell in die Website-Struktur eingebettet.</p>
        </div>
        <a class="btn btn-primary" href="../linkedin-artikel.html">Zum Archiv</a>
        <nav class="footer-nav" aria-label="Footer Navigation">
          <a href="../../wirkungsoekonomie.html">Wirkungsökonomie</a>
          <a href="../../buch.html">Das Buch</a>
          <a href="../../modell.html">Modell</a>
          <a href="../../anwendungen.html">Anwendungen</a>
          <a href="../../downloads.html">Downloads</a>
          <a href="../../ueber.html">Über die Wirkungsökonomie</a>
          <a href="../../impressum.html">Impressum</a>
          <a href="../../datenschutz.html">Datenschutz</a>
        </nav>
        <p>© 2026 Natalie Weber - Wirkungsökonomie</p>
      </div>
    </footer>
    <script src="../../assets/js/main.js"></script>
  </body>
</html>
"""


def indent(value: str, spaces: int) -> str:
    prefix = " " * spaces
    return "\n".join(prefix + line if line.strip() else line for line in value.splitlines())


def render_archive(articles: list[SourceArticle], skipped: list[tuple[Path, str]]) -> str:
    cards = []
    for article in articles:
        cards.append(
            f"""          <article class="blog-card linkedin-archive-card" data-origin="linkedin">
            <span class="blog-origin-badge">LinkedIn-Archiv</span>
            <p class="card-kicker">{html.escape(article.date_label)}</p>
            <h3 class="card-title">{html.escape(article.title)}</h3>
            <p class="card-text">{html.escape(description_for(article))}</p>
            <p class="meta">{round(article.text_length / 900)} Min. · {article.image_count} Abb.</p>
            <a class="text-link" href="linkedin/{article.slug}.html">Beitrag öffnen</a>
          </article>"""
        )
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>LinkedIn-Artikel - Wirkungsökonomie</title>
    <meta name="description" content="Archiv der von LinkedIn übernommenen Artikel von Natalie Weber zur Wirkungsökonomie, Demokratie, Nachhaltigkeit, Energie, KI und gesellschaftlicher Steuerung.">
    <link rel="canonical" href="https://wirkungsoekonomie.de/blog/linkedin-artikel.html">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="LinkedIn-Artikel - Wirkungsökonomie">
    <meta property="og:description" content="Archiv der von LinkedIn übernommenen Artikel von Natalie Weber zur Wirkungsökonomie.">
    <meta property="og:url" content="https://wirkungsoekonomie.de/blog/linkedin-artikel.html">
    <meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/brand/logo-full.svg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="LinkedIn-Artikel - Wirkungsökonomie">
    <meta name="twitter:description" content="Archiv der von LinkedIn übernommenen Artikel von Natalie Weber zur Wirkungsökonomie.">
    <meta name="twitter:image" content="https://wirkungsoekonomie.de/assets/img/brand/logo-full.svg">
    <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../assets/css/style.css">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="../index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="../assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="../index.html">Start</a>
        <a href="../wirkungsoekonomie.html">Wirkungsökonomie</a>
        <a href="../buch.html">Das Buch</a>
        <a href="../modell.html">Modell</a>
        <a href="../anwendungen.html">Anwendungen</a>
        <a class="active" href="../blog.html">Journal</a>
        <a href="../akademie.html">Akademie</a>
        <a href="../mitmachen.html">Mitmachen</a>
      </nav>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="hero-kicker">LinkedIn-Archiv</p>
          <h1 class="hero-title">LinkedIn-Artikel</h1>
          <p class="hero-subtitle">Übernommene Artikel von Natalie Weber, technisch bereinigt, UTF-8/NFC-normalisiert und als eigenes Archiv der Wirkungsökonomie veröffentlicht.</p>
          <p class="card-text">{len(articles)} Artikel wurden übernommen. {len(skipped)} Exportdateien wurden wegen leerem Inhalt oder Duplikaten ausgelassen.</p>
        </div>
      </section>

      <section class="section" aria-labelledby="linkedin-beitraege-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Archiv</p>
            <h2 id="linkedin-beitraege-title">Alle übernommenen Beiträge</h2>
            <p>Die Beiträge sind nach Veröffentlichungs- beziehungsweise Erstellungsdatum sortiert. Die ursprünglichen LinkedIn-Links bleiben in den Artikeln erhalten.</p>
          </div>
          <div class="card-grid linkedin-archive-grid">
{chr(10).join(cards)}
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">Wirkungsökonomie</p>
          <h2>Die neue Ordnung des Wohlstands</h2>
          <p>Ein neues Gesellschafts- und Wirtschaftsmodell, das Wirkung auf Mensch, Planet und Demokratie sichtbar macht und in Entscheidungen zurückführt.</p>
        </div>
        <a class="btn btn-primary" href="../blog.html">Zum Journal</a>
        <nav class="footer-nav" aria-label="Footer Navigation">
          <a href="../wirkungsoekonomie.html">Wirkungsökonomie</a>
          <a href="../buch.html">Das Buch</a>
          <a href="../modell.html">Modell</a>
          <a href="../anwendungen.html">Anwendungen</a>
          <a href="../downloads.html">Downloads</a>
          <a href="../ueber.html">Über die Wirkungsökonomie</a>
          <a href="../impressum.html">Impressum</a>
          <a href="../datenschutz.html">Datenschutz</a>
        </nav>
        <p>© 2026 Natalie Weber - Wirkungsökonomie</p>
      </div>
    </footer>
    <script src="../assets/js/main.js"></script>
  </body>
</html>
"""


def write_sitemap(articles: list[SourceArticle]) -> None:
    sitemap = SITEMAP_PATH.read_text(encoding="utf-8")
    sitemap = re.sub(
        r"\n  <!-- LinkedIn archive start -->.*?  <!-- LinkedIn archive end -->",
        "",
        sitemap,
        flags=re.S,
    )
    entries = ['  <!-- LinkedIn archive start -->']
    entries.append('  <url><loc>https://wirkungsoekonomie.de/blog/linkedin-artikel.html</loc><lastmod>2026-05-18</lastmod></url>')
    for article in articles:
        entries.append(
            f"  <url><loc>https://wirkungsoekonomie.de/blog/linkedin/{article.slug}.html</loc><lastmod>2026-05-18</lastmod></url>"
        )
    entries.append("  <!-- LinkedIn archive end -->")
    sitemap = sitemap.replace("\n</urlset>", "\n" + "\n".join(entries) + "\n</urlset>")
    SITEMAP_PATH.write_text(sitemap, encoding="utf-8")


def write_curl_config(articles: list[SourceArticle]) -> int:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    lines: list[str] = []
    total = 0
    for article in articles:
        content_raw = extract_content(unicodedata.normalize("NFC", article.source.read_bytes().decode("utf-8")))
        for index, url in enumerate(collect_image_urls(content_raw), start=1):
            filename = image_name(article.slug, index, url)
            output = IMAGE_DIR / filename
            if output.exists():
                continue
            lines.extend(
                [
                    f'url = "{url}"',
                    f'output = "{output}"',
                    "location",
                    "fail",
                    "silent",
                    "show-error",
                    "create-dirs",
                    "user-agent = \"Mozilla/5.0\"",
                    "",
                ]
            )
            total += 1
    TMP_CURL_CONFIG.write_text("\n".join(lines), encoding="utf-8")
    return total


def update_blog_overview() -> None:
    path = SITE_ROOT / "blog.html"
    html_text = path.read_text(encoding="utf-8")
    if "blog/linkedin-artikel.html" in html_text:
        return
    marker = '        <div class="card-grid">\n'
    card = """        <div class="card-grid">
          <article class="blog-card" data-origin="linkedin">
            <p class="card-kicker">Archiv</p>
            <h3 class="card-title">LinkedIn-Artikel</h3>
            <p class="card-text">Übernommene Artikel von Natalie Weber zur Wirkungsökonomie, Demokratie, Nachhaltigkeit, Energie, KI und gesellschaftlicher Steuerung.</p>
            <p class="meta">Archiv · 93 Beiträge</p>
            <a class="text-link" href="blog/linkedin-artikel.html">Archiv öffnen</a>
          </article>
"""
    html_text = html_text.replace(marker, card, 1)
    path.write_text(html_text, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-curl-config", action="store_true")
    args = parser.parse_args()

    articles, skipped = parse_articles()
    if args.write_curl_config:
        count = write_curl_config(articles)
        print(f"Wrote {TMP_CURL_CONFIG} with {count} pending image downloads.")
        return

    ARTICLE_DIR.mkdir(parents=True, exist_ok=True)
    for article in articles:
        (ARTICLE_DIR / f"{article.slug}.html").write_text(render_article(article), encoding="utf-8")
    ARCHIVE_PATH.write_text(render_archive(articles, skipped), encoding="utf-8")
    update_blog_overview()
    write_sitemap(articles)
    import sync_layout

    sync_layout.main()
    print(f"Imported {len(articles)} articles; skipped {len(skipped)} files.")
    for source, reason in skipped:
        print(f"SKIP\t{reason}\t{source.name}")


if __name__ == "__main__":
    main()
