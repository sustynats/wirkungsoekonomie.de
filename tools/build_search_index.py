#!/usr/bin/env python3
import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SEARCH_INDEX = ROOT / "assets/search/search-index.json"

EXCLUDED_DIRS = {
    ".git",
    "templates",
    "woek-akademie-app",
}

EXCLUDED_FILES = {
    "404.html",
}

SECTION_BY_PREFIX = {
    "blog/": "Blog",
    "methodik/": "Methodik",
    "sdg-plus/": "SDG / SDG+",
    "downloads/": "Downloads",
    "akademie/": "Akademie",
    "glossar/": "Glossar",
    "ordnung/": "Ordnung",
    "fuer/": "Für wen",
    "evidenz/": "Evidenz",
    "quellen/": "Quellen",
    "wissen/": "Wissen",
}

SECTION_BY_FILE = {
    "index.html": "Grundlagen",
    "wirkungsoekonomie.html": "Grundlagen",
    "modell.html": "Grundlagen",
    "workflow.html": "Workflow",
    "vergleich.html": "Vergleich",
    "erleben.html": "Erleben",
    "downloads.html": "Downloads",
    "akademie.html": "Akademie",
    "blog.html": "Blog",
    "glossar.html": "Glossar",
    "anwendungen.html": "Anwendungen",
    "scanner.html": "Scanner",
    "suche.html": "Suche",
}


def clean_text(value):
    value = html.unescape(value or "")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def strip_html(value):
    value = re.sub(r"(?is)<(script|style|svg|noscript)\b.*?</\1>", " ", value)
    value = re.sub(r"(?is)<(header|footer|nav)\b.*?</\1>", " ", value)
    value = re.sub(r"(?is)<[^>]+>", " ", value)
    return clean_text(value)


def attr(content, name):
    pattern = rf'{name}\s*=\s*([\'"])(.*?)\1'
    match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
    return html.unescape(match.group(2)) if match else ""


def meta_content(source, name):
    for match in re.finditer(r"(?is)<meta\b([^>]*)>", source):
        attrs = match.group(1)
        if attr(attrs, "name").lower() == name.lower() or attr(attrs, "property").lower() == name.lower():
            return clean_text(attr(attrs, "content"))
    return ""


def is_noindex_redirect(source):
    robots = meta_content(source, "robots").lower()
    has_refresh = re.search(r'(?is)<meta\b[^>]*http-equiv\s*=\s*["\']refresh["\']', source)
    return "noindex" in robots or ("noindex" in robots and bool(has_refresh))


def canonical_url(path):
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return "/"
    if path.name == "index.html":
        parent = path.relative_to(ROOT).parent.as_posix()
        return f"/{parent}/"
    return "/" + rel


def title_from_source(source, fallback):
    match = re.search(r"(?is)<title>(.*?)</title>", source)
    if not match:
        return fallback
    title = clean_text(strip_html(match.group(1)))
    return re.sub(r"\s+[-|]\s+Wirkungsökonomie.*$", "", title).strip() or fallback


def main_text(source):
    match = re.search(r"(?is)<main\b[^>]*>(.*?)</main>", source)
    return strip_html(match.group(1) if match else source)


def infer_section(rel):
    rel_posix = rel.as_posix()
    for prefix, section in SECTION_BY_PREFIX.items():
        if rel_posix.startswith(prefix):
            return section
    return SECTION_BY_FILE.get(rel.name, "Seite")


def infer_format(rel, section):
    rel_posix = rel.as_posix()
    if rel_posix.startswith("blog/") and rel.name != "index.html":
        return "Blogartikel"
    if section == "Glossar":
        return "Glossarbegriff" if "#" in rel_posix else "Seite"
    if section == "Downloads":
        return "Download / Paper"
    if section == "Erleben":
        return "Tool / Demo"
    return "Seite"


def tags_from_path(rel, source):
    tags = set()
    for part in rel.with_suffix("").parts:
        tags.update(token for token in re.split(r"[-_]", part) if len(token) > 2)
    keywords = meta_content(source, "keywords")
    if keywords:
        tags.update(clean_text(item) for item in keywords.split(","))
    search_tags = meta_content(source, "search_tags")
    if search_tags:
        tags.update(clean_text(item) for item in search_tags.split(","))
    return sorted(tag for tag in tags if tag)


def generated_entry(path):
    rel = path.relative_to(ROOT)
    source = path.read_text(encoding="utf-8", errors="ignore")
    if rel.name in EXCLUDED_FILES or is_noindex_redirect(source):
        return None

    text = main_text(source)
    if len(text) < 80:
        return None

    title = meta_content(source, "search_title") or title_from_source(source, rel.stem.replace("-", " ").title())
    description = meta_content(source, "search_description") or meta_content(source, "description") or text[:240]
    section = meta_content(source, "search_section") or infer_section(rel)
    format_name = meta_content(source, "search_type") or infer_format(rel, section)
    url = canonical_url(path)

    return {
        "id": "page-" + re.sub(r"[^a-z0-9]+", "-", rel.with_suffix("").as_posix().lower()).strip("-"),
        "title": title,
        "description": clean_text(description),
        "url": url,
        "section": section,
        "type": format_name,
        "format": format_name,
        "impactSpaces": [],
        "standards": [],
        "instruments": [],
        "tags": tags_from_path(rel, source),
        "aliases": [],
        "body": text[:12000],
        "priority": 20 if section == "Blog" else 35,
    }


def html_files():
    for path in sorted(ROOT.rglob("*.html")):
        rel_parts = path.relative_to(ROOT).parts
        if any(part in EXCLUDED_DIRS for part in rel_parts):
            continue
        yield path


def merge_entries(curated, generated):
    by_url = {entry["url"]: dict(entry) for entry in generated}
    for entry in curated:
        if str(entry.get("id", "")).startswith("page-"):
            continue
        existing = by_url.get(entry["url"])
        if existing:
            merged = dict(existing)
            merged.update(entry)
            merged["body"] = existing.get("body", entry.get("body", ""))
            by_url[entry["url"]] = merged
        else:
            by_url[entry["url"]] = entry
    return sorted(by_url.values(), key=lambda item: (-int(item.get("priority", 0)), item.get("title", "")))


def main():
    curated = json.loads(SEARCH_INDEX.read_text(encoding="utf-8"))
    curated_count = sum(1 for entry in curated if not str(entry.get("id", "")).startswith("page-"))
    generated = [entry for entry in (generated_entry(path) for path in html_files()) if entry]
    merged = merge_entries(curated, generated)
    SEARCH_INDEX.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(merged)} search entries from {len(generated)} HTML pages plus {curated_count} curated entries.")


if __name__ == "__main__":
    main()
