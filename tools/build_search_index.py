#!/usr/bin/env python3
import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SEARCH_INDEX = ROOT / "assets/search/search-index.json"
KNOWLEDGE_CARDS = ROOT / "content/wissen/wissenskarten.json"
BODY_LIMIT = 3500

TAG_STOPWORDS = {
    "aber",
    "alle",
    "alles",
    "als",
    "auch",
    "auf",
    "aus",
    "bei",
    "das",
    "da",
    "der",
    "die",
    "ein",
    "eine",
    "einer",
    "eines",
    "einem",
    "fuer",
    "für",
    "hat",
    "immer",
    "index",
    "ist",
    "live",
    "mit",
    "nicht",
    "nur",
    "oder",
    "oben",
    "schon",
    "sich",
    "sind",
    "themen",
    "und",
    "von",
    "was",
    "werden",
    "wird",
    "wirkungsradar",
}

EXCLUDED_DIRS = {
    ".git",
    ".codex-backup",
    "_debug",
    "_internal",
    "_site",
    "assets",
    "node_modules",
    "outputs",
    "source-assets",
    "templates",
    "website-1-0-release",
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
    "wirkungsfelder/": "Wirkungsfelder",
    "werkzeuge/": "Werkzeuge",
    "werkstatt/": "Bibliothek",
}

NOISE_TITLES = {
    "kontakt",
    "verstehen",
    "referenzrahmen",
    "kontext-werkzeuge",
    "erleben & lernen",
    "werkstatt",
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
    "werkzeuge.html": "Werkzeuge",
    "werkstatt.html": "Werkstatt",
    "wirkungsfelder.html": "Wirkungsfelder",
    "scanner.html": "Scanner",
    "suche.html": "Suche",
}


def clean_text(value):
    value = html.unescape(value or "")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalize_public_labels(value):
    value = clean_text(value)
    replacements = {
        "Wirkungsradar Narrative": "Mythen & Narrative",
        "Wirkungsradar-Narrative": "Mythen & Narrative",
        "Wirkungsradar-Themencluster": "Themencluster",
        "Wirkungsradar Themencluster": "Themencluster",
        "Wirkungsradar-Themenseite": "Themenseite",
        "Wirkungsradar Detailanalysen": "Debatten-Kompass Detailanalysen",
        "Wirkungsradar Detail": "Debattenkarte Detail",
        "Wirkungsradar Live": "Debattenkarte",
        "Wirkungsradar-Live": "Debattenkarte",
        "Psychologie im Wirkungsradar": "Psychologie im Debatten-Kompass",
        "Was der Wirkungsradar nicht ist": "Was der Debatten-Kompass nicht ist",
        "Was der Wirkungsradar sichtbar macht": "Was der Debatten-Kompass sichtbar macht",
    }
    for before, after in replacements.items():
        value = value.replace(before, after)
    return value


def strip_html(value):
    value = remove_search_noise_markup(value)
    value = re.sub(r"(?is)<(script|style|svg|noscript)\b.*?</\1>", " ", value)
    value = re.sub(r"(?is)<(header|footer|nav|aside)\b.*?</\1>", " ", value)
    value = re.sub(r"(?is)<[^>]+>", " ", value)
    return clean_text(value)


def remove_search_noise_markup(value):
    value = re.sub(r"(?is)<([a-z0-9:-]+)\b[^>]*data-search-exclude[^>]*>.*?</\1>", " ", value)
    value = re.sub(
        r"(?is)<([a-z0-9:-]+)\b[^>]*class\s*=\s*['\"][^'\"]*(?:no-print|breadcrumb|side-nav|toc-card|model-strip|footer-nav|site-nav|publication-matrix-wrap)[^'\"]*['\"][^>]*>.*?</\1>",
        " ",
        value,
    )
    return value


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
    return clean_search_title(title) or fallback


def clean_search_title(title):
    title = normalize_public_labels(title)
    exact_titles = {
        "Wirkungsradar": "Folgencheck für öffentliche Aussagen",
    }
    if title in exact_titles:
        return exact_titles[title]
    replacements = [
        r"\s+\|\s+Debatten-Kompass\s+Detail\s*$",
        r"\s+\|\s+Debatten-Kompass\s*$",
        r"\s+\|\s+Debattenkarte\s+Detail\s*$",
        r"\s+\|\s+Mythen\s+&\s+Narrative\s*$",
        r"\s+\|\s+Themencluster\s*$",
        r"\s+[-–]\s+Debatten-Kompass\s+Detail\s*$",
        r"\s+[-–]\s+Debatten-Kompass\s*$",
        r"\s+[-–]\s+Debattenkarte\s+Detail\s*$",
        r"\s+[-–]\s+Wirkungsradar\s+Live\s*$",
        r"\s+[-–]\s+Wirkungsradar\s*$",
        r"\s+\|\s+Psychologie\s+im\s+Wirkungsradar\s*$",
        r"^Psychologie\s+im\s+Wirkungsradar\s+[-–]\s+",
        r"\s+[-|]\s+Wirkungsökonomie.*$",
    ]
    for pattern in replacements:
        title = re.sub(pattern, "", title, flags=re.IGNORECASE).strip()
    return title


def main_text(source):
    match = re.search(r"(?is)<main\b[^>]*data-search-content[^>]*>(.*?)</main>", source)
    if not match:
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
        return "Journalartikel"
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
    return sorted(clean_tag(tag) for tag in tags if clean_tag(tag))


def clean_tag(tag):
    tag = clean_text(tag)
    if not tag:
        return ""
    normalized = (
        tag.lower()
        .replace("ö", "oe")
        .replace("ä", "ae")
        .replace("ü", "ue")
        .replace("ß", "ss")
    )
    normalized = re.sub(r"[^a-z0-9+]+", " ", normalized).strip()
    if normalized in TAG_STOPWORDS or len(normalized) < 3:
        return ""
    return tag


def generated_entry(path):
    rel = path.relative_to(ROOT)
    source = path.read_text(encoding="utf-8", errors="ignore")
    if rel.name in EXCLUDED_FILES or is_noindex_redirect(source):
        return None

    text = main_text(source)
    if len(text) < 80:
        return None

    title = clean_search_title(meta_content(source, "search_title") or title_from_source(source, rel.stem.replace("-", " ").title()))
    description = normalize_public_labels(meta_content(source, "search_description") or meta_content(source, "description") or text[:240])
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
        "body": normalize_public_labels(text[:BODY_LIMIT]),
        "priority": 20 if section == "Blog" else 35,
    }


def is_search_noise_entry(entry):
    title = clean_text(entry.get("title", "")).lower()
    section = clean_text(entry.get("section", "")).lower()
    body = clean_text(entry.get("body", "")).lower()
    if title in NOISE_TITLES and len(body) < 900:
        return True
    if "footer navigation" in body or "hauptnavigation" in body:
        return True
    footer_cluster = [
        "wirkung einfach erklärt",
        "sdg-/sdg+-referenzrahmen",
        "interaktive demos",
        "arbeitsbibliothek",
        "dokumentenregistry",
    ]
    if sum(1 for item in footer_cluster if item in body) >= 3:
        return True
    if "kontakt:" in body and "© 2026 natalie weber" in body:
        return True
    return "footer" in section or "navigation" in section


def html_files():
    for path in sorted(ROOT.rglob("*.html")):
        rel_parts = path.relative_to(ROOT).parts
        if any(part in EXCLUDED_DIRS for part in rel_parts):
            continue
        yield path


def merge_entries(curated, generated):
    by_url = {entry["url"]: dict(entry) for entry in generated}
    for entry in curated:
        if str(entry.get("id", "")).startswith(("page-", "knowledge-card-")):
            continue
        existing = by_url.get(entry["url"])
        if existing:
            merged = dict(existing)
            merged.update(entry)
            merged["body"] = existing.get("body", entry.get("body", ""))
            by_url[entry["url"]] = merged
        else:
            by_url[entry["url"]] = entry
    for entry in by_url.values():
        entry["title"] = clean_search_title(entry.get("title", ""))
        entry["description"] = normalize_public_labels(entry.get("description", ""))
        entry["body"] = normalize_public_labels(entry.get("body", ""))
    return sorted(
        (entry for entry in by_url.values() if not is_search_noise_entry(entry)),
        key=lambda item: (-int(item.get("priority", 0)), item.get("title", "")),
    )


def knowledge_card_entries():
    if not KNOWLEDGE_CARDS.exists():
        return []
    data = json.loads(KNOWLEDGE_CARDS.read_text(encoding="utf-8"))
    entries = []
    for card in data.get("cards", []):
        if card.get("status") != "published":
            continue
        body = " ".join(
            clean_text(part)
            for part in [
                card.get("title", ""),
                card.get("short_answer", ""),
                card.get("one_sentence", ""),
                card.get("why_important", ""),
                card.get("example", ""),
                " ".join(card.get("impact_path", [])),
                " ".join(card.get("terms", [])),
                " ".join(card.get("sources", [])),
            ]
        )
        entries.append({
            "id": "knowledge-card-" + re.sub(r"[^a-z0-9]+", "-", str(card.get("id", "")).lower()).strip("-"),
            "title": card.get("title", ""),
            "description": clean_text(card.get("short_answer", "")),
            "url": "/kompass.html?karte=" + str(card.get("id", "")),
            "section": "Wissenskarten",
            "type": "Wissenskarte",
            "format": "Wissenskarte",
            "impactSpaces": ["Mensch", "Planet", "Demokratie"],
            "standards": ["SDG", "SDG+"],
            "instruments": card.get("terms", []),
            "tags": sorted(set([card.get("title", ""), *card.get("terms", [])])),
            "aliases": [card.get("one_sentence", "")],
            "body": body,
            "priority": 85,
        })
    return entries


def main():
    curated = json.loads(SEARCH_INDEX.read_text(encoding="utf-8"))
    curated_count = sum(
        1
        for entry in curated
        if not str(entry.get("id", "")).startswith(("page-", "knowledge-card-"))
    )
    generated = [entry for entry in (generated_entry(path) for path in html_files()) if entry and not is_search_noise_entry(entry)]
    generated.extend(knowledge_card_entries())
    merged = merge_entries(curated, generated)
    SEARCH_INDEX.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(merged)} search entries from {len(generated)} HTML pages plus {curated_count} curated entries.")


if __name__ == "__main__":
    main()
