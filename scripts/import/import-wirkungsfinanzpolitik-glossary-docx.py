#!/usr/bin/env python3
"""Import the Wirkungsfinanzpolitik glossary DOCX into the term registry."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any

from docx import Document


ROOT = Path(__file__).resolve().parents[2]
REGISTRY_FILE = ROOT / "assets/data/term-registry.json"
IMPORT_FILE = ROOT / "content/glossary/imports/wirkungsfinanzpolitik-begriffe-v0-1.json"
REPORT_FILE = ROOT / "reports/glossary-import-wirkungsfinanzpolitik-begriffe-v0-1.md"

SOURCE_DOCUMENT = "WOeK_Glossar_Wirkungsfinanzpolitik_Begriffe_v0_1.docx"
SOURCE_SECTION = "Glossar: Neue Begriffe fuer die Wirkungsfinanzpolitik"
DATA_STAND = "2026-06-30"

PUBLIC_SECTION_EXCLUDES = {
    "Kurzdefinition / Hover",
    "SEO / Suchbegriffe",
    "Meta-Beschreibung",
}

SECTION_KEYS = {
    "Kurzdefinition / Hover": "shortDefinition",
    "Auf einen Blick": "keyPoints",
    "Was bedeutet der Begriff?": "definition",
    "Einordnung in der Wirkungsökonomie": "woekRelation",
    "Verwendung": "usageNote",
    "Abgrenzung": "doNotConfuseWith",
    "Wo der Begriff praktisch auftaucht": "examples",
    "Querverweise im Glossar": "relatedLabels",
    "SEO / Suchbegriffe": "searchKeywords",
    "Meta-Beschreibung": "metaDescription",
}

MANUAL_REFERENCE_MAP = {
    "positive netto wirkung": "positive-netto-wirkung",
    "mensch planet und demokratie": "mensch-planet-demokratie",
    "souveranes stranding risiko": "souveraenes-stranding-risiko",
    "sovereign stranding risk": "souveraenes-stranding-risiko",
    "stranding risiko von staaten": "souveraenes-stranding-risiko",
    "gestrandeter staat": "stranded-sovereign",
    "souveran gestrandeter schuldner": "stranded-sovereign",
}

ALIASES_BY_SLUG = {
    "refinanzierungsresilienz": [
        "Refinanzierungsfähigkeit",
        "Refinanzierungsfaehigkeit",
        "Refinanzierungsrisiko",
        "finanzielle Resilienz des Staates",
    ],
    "souveraenes-stranding-risiko": [
        "Sovereign Stranding Risk",
        "Stranding-Risiko von Staaten",
        "souveränes Stranding Risiko",
        "souveranes Stranding-Risiko",
        "sovereign stranding",
    ],
    "stranded-sovereign": [
        "Gestrandeter Staat",
        "souverän gestrandeter Schuldner",
        "souveran gestrandeter Schuldner",
        "Stranded Sovereigns",
        "sovereign stranding",
    ],
    "wirkungskapazitaet-des-staates": [
        "staatliche Wirkungskapazität",
        "staatliche Wirkungskapazitaet",
        "State Capacity",
        "Wirkungskapazität",
        "Wirkungskapazitaet",
    ],
}

HOVER_BY_SLUG = {
    "refinanzierungsresilienz": (
        "Refinanzierungsresilienz beschreibt, ob ein Staat sich auch unter Stress "
        "zu tragfähigen Konditionen finanzieren kann - getragen von Institutionen, "
        "Steuerbasis, Zukunftsfähigkeit und Vertrauen."
    ),
    "souveraenes-stranding-risiko": (
        "Souveränes Stranding-Risiko beschreibt das Risiko, dass ein Staat durch "
        "ökologische, wirtschaftliche, institutionelle, währungspolitische oder "
        "demokratische Fehlsteuerung seine Refinanzierungsresilienz verliert."
    ),
    "stranded-sovereign": (
        "Ein Stranded Sovereign ist ein Staat, dessen Anleihen nicht mehr als "
        "zukunftsfähig sichere Forderungen gelten, weil Steuerbasis, Institutionen, "
        "Resilienz oder demokratische Stabilität beschädigt sind."
    ),
    "wirkungskapazitaet-des-staates": (
        "Wirkungskapazität bezeichnet die Fähigkeit des Staates, Mittel, Regeln, "
        "Institutionen, Personal, Daten und Vertrauen in positive Netto-Wirkung zu "
        "übersetzen."
    ),
}


@dataclass
class Section:
    title: str
    parts: list[tuple[str, str]] = field(default_factory=list)


@dataclass
class Entry:
    heading: str
    meta: dict[str, str] = field(default_factory=dict)
    sections: list[Section] = field(default_factory=list)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize_key(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return (
        value.lower()
        .replace("ß", "ss")
        .replace("&", " und ")
        .replace("+", " und ")
        .replace("/", " ")
        .replace("-", " ")
    )


def lookup_key(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", normalize_key(value))).strip()


def slugify(value: str) -> str:
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", lookup_key(value))).strip("-") or "begriff"


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        text = clean_text(value)
        if not text:
            continue
        key = lookup_key(text)
        if key in seen:
            continue
        seen.add(key)
        result.append(text)
    return result


def split_semicolon_list(value: str) -> list[str]:
    return [clean_text(item) for item in re.split(r"[;]", value or "") if clean_text(item)]


def split_search_terms(value: str) -> list[str]:
    return unique([clean_text(item) for item in re.split(r"[,;]", value or "")])


def slug_from_meta(value: str) -> str:
    text = clean_text(value).strip("/")
    if text.startswith("begriffe/"):
        text = text.split("/", 1)[1]
    return text.strip("/") or slugify(value)


def title_from_heading(value: str) -> str:
    match = re.match(r"Glossar-Eintrag\s+\d+:\s*(.+)$", value)
    return clean_text(match.group(1) if match else value)


def parse_docx(path: Path) -> list[Entry]:
    doc = Document(path)
    entries: list[Entry] = []
    current_entry: Entry | None = None
    current_section: Section | None = None

    for para in doc.paragraphs:
        text = clean_text(para.text)
        if not text:
            continue
        style = para.style.name
        if style == "Heading 1":
            if text.startswith("Glossar-Eintrag"):
                current_entry = Entry(heading=title_from_heading(text))
                entries.append(current_entry)
                current_section = None
            elif current_entry is not None:
                current_entry = None
                current_section = None
            continue
        if current_entry is None:
            continue
        if style == "MetaLine":
            key, _, value = text.partition(":")
            if value:
                current_entry.meta[clean_text(key)] = clean_text(value)
            continue
        if style == "Heading 2":
            current_section = Section(title=text)
            current_entry.sections.append(current_section)
            continue
        if current_section is None:
            continue
        kind = "item" if "List" in style else "paragraph"
        current_section.parts.append((kind, text))

    return entries


def section_by_title(entry: Entry, title: str) -> Section | None:
    return next((section for section in entry.sections if section.title == title), None)


def section_paragraphs(entry: Entry, title: str) -> list[str]:
    section = section_by_title(entry, title)
    if not section:
        return []
    return [text for kind, text in section.parts if kind == "paragraph"]


def section_items(entry: Entry, title: str) -> list[str]:
    section = section_by_title(entry, title)
    if not section:
        return []
    return [text for kind, text in section.parts if kind == "item"]


def section_text(entry: Entry, title: str) -> str:
    section = section_by_title(entry, title)
    if not section:
        return ""
    return "\n\n".join(text for _kind, text in section.parts)


def is_subsection_label(text: str) -> bool:
    if not text.endswith(":"):
        return False
    return len(text) <= 90 or text.startswith(("Mögliche", "WÖk", "Interne", "Externe", "Wichtig"))


def deep_sections(entry: Entry) -> list[dict[str, Any]]:
    deep: list[dict[str, Any]] = []
    for section in entry.sections:
        if section.title in PUBLIC_SECTION_EXCLUDES:
            continue
        body: list[str] = []
        items: list[str] = []
        pending_label = ""
        pending_items: list[str] = []

        def flush_pending() -> None:
            nonlocal pending_label, pending_items
            if pending_label and pending_items:
                deep.append({"title": pending_label, "items": pending_items})
            pending_label = ""
            pending_items = []

        for kind, text in section.parts:
            if kind == "paragraph" and is_subsection_label(text):
                flush_pending()
                pending_label = text.rstrip(":").strip()
                continue
            if kind == "paragraph":
                if pending_items:
                    flush_pending()
                if pending_label:
                    deep.append({"title": pending_label, "body": text})
                    pending_label = ""
                else:
                    body.append(text)
                continue
            if kind == "item":
                if pending_label:
                    pending_items.append(text)
                else:
                    items.append(text)

        flush_pending()
        card: dict[str, Any] = {"title": section.title}
        if body:
            card["body"] = "\n\n".join(body)
        if items:
            card["items"] = items
        if card.get("body") or card.get("items"):
            deep.append(card)

    deep.append(
        {
            "title": "Schutzlinie",
            "body": (
                "Diese Begriffe dienen der wirkungsökonomischen Begriffs- und Prüfarchitektur. "
                "Sie sind keine Anlageberatung, keine Ratingmethodik, keine Personenbewertung "
                "und kein Social Credit."
            ),
        }
    )
    return deep


def build_alias_map(terms: list[dict[str, Any]], imports: list[dict[str, Any]]) -> dict[str, str]:
    alias_map = dict(MANUAL_REFERENCE_MAP)
    for term in terms:
        slug = term.get("slug") or slugify(term.get("canonicalLabel") or term.get("label") or "")
        labels = [
            slug,
            term.get("label", ""),
            term.get("canonicalLabel", ""),
            *(term.get("aliases") or []),
            *(term.get("synonyms") or []),
        ]
        for label in labels:
            key = lookup_key(label)
            if key and slug:
                alias_map.setdefault(key, slug)
    for term in imports:
        slug = term["slug"]
        for label in [term["canonicalLabel"], term["label"], slug, *(term.get("aliases") or [])]:
            key = lookup_key(label)
            if key:
                alias_map[key] = slug
    return alias_map


def resolve_related(labels: list[str], alias_map: dict[str, str]) -> tuple[list[str], list[str]]:
    related: list[str] = []
    missing: list[str] = []
    for label in labels:
        slug = alias_map.get(lookup_key(label))
        if slug:
            related.append(slug)
        else:
            missing.append(label)
    return unique(related), unique(missing)


def aliases_from_meta(entry: Entry, slug: str) -> list[str]:
    aliases = [entry.meta.get("Titel", entry.heading), *(ALIASES_BY_SLUG.get(slug) or [])]
    alt = entry.meta.get("Alternativtitel", "")
    if alt:
        aliases.extend([item.strip() for item in re.split(r"/|;", alt) if item.strip()])
    redirects = entry.meta.get("Empfohlene Redirects / Aliase", "")
    if redirects:
        aliases.extend([item.strip("/ ").split("/")[-1].replace("-", " ") for item in redirects.split(";")])
    return unique(aliases)


def normalize_entry(entry: Entry) -> dict[str, Any]:
    title = entry.meta.get("Titel") or entry.heading
    slug = slug_from_meta(entry.meta.get("Slug", title))
    short_definition = "\n\n".join(section_paragraphs(entry, "Kurzdefinition / Hover")) or section_text(entry, "Kurzdefinition / Hover")
    definition = "\n\n".join(section_paragraphs(entry, "Was bedeutet der Begriff?")) or short_definition
    woek_relation = "\n\n".join(section_paragraphs(entry, "Einordnung in der Wirkungsökonomie"))
    usage_note = section_text(entry, "Verwendung")
    related_labels = section_items(entry, "Querverweise im Glossar")
    seo_terms = split_search_terms(section_text(entry, "SEO / Suchbegriffe"))
    meta_description = section_text(entry, "Meta-Beschreibung")
    category = entry.meta.get("Kategorie", "Wirkungsfinanzpolitik")
    term_type = entry.meta.get("Begriffstyp", "Wirkungsfinanzpolitik / WÖk-Prägungsbegriff")
    version = entry.meta.get("Stand / Version", "Glossar-Erweiterung v0.1")
    source_field = entry.meta.get("Quellenfeld", "")
    categories = unique(
        [
            "glossar",
            "wirkungsfinanzpolitik",
            "oeffentliche-finanzen-schulden-wirkung",
            "finanzsystem-kapital",
            "staat-recht-demokratie",
        ]
    )
    aliases = aliases_from_meta(entry, slug)
    return {
        "id": slug,
        "termId": slug,
        "label": title,
        "canonicalLabel": title,
        "slug": slug,
        "aliases": aliases,
        "synonyms": aliases,
        "shortDefinition": short_definition,
        "hoverDefinition": HOVER_BY_SLUG.get(slug, short_definition),
        "definition": definition,
        "longDefinition": definition,
        "woekRelation": woek_relation or definition,
        "usageNote": usage_note,
        "statusNote": (
            "WÖk-Prägungsbegriff im Cluster Wirkungsfinanzpolitik. Keine Anlageberatung, "
            "keine Ratingmethodik und keine Personenbewertung."
        ),
        "category": "Wirkungsfinanzpolitik",
        "categories": categories,
        "type": term_type,
        "termType": term_type,
        "begriffstyp": term_type,
        "themes": split_semicolon_list(entry.meta.get("Themenwelt", "")),
        "woekDimensions": split_semicolon_list(entry.meta.get("WÖk-Dimension", "")),
        "wirklogik": split_semicolon_list(entry.meta.get("Wirklogik", "")),
        "applicationFields": split_semicolon_list(entry.meta.get("Anwendungsfeld", "")),
        "sourceField": source_field,
        "searchKeywords": seo_terms,
        "metaTitle": f"{title} - Glossar der Wirkungsökonomie",
        "metaDescription": meta_description,
        "doNotConfuseWith": section_items(entry, "Abgrenzung"),
        "examples": section_items(entry, "Wo der Begriff praktisch auftaucht"),
        "keyPoints": section_items(entry, "Auf einen Blick"),
        "relatedLabels": related_labels,
        "sourceNotes": section_text(entry, "Quellenbasis"),
        "officialSources": [],
        "source": SOURCE_SECTION,
        "sourceDocument": SOURCE_DOCUMENT,
        "sourceSection": category,
        "importSource": str(IMPORT_FILE.relative_to(ROOT)),
        "conceptStatus": "WÖk-Prägungsbegriff",
        "publicationStatus": "published",
        "status": "approved",
        "reviewStatus": "redaktionell aus DOCX übernommen",
        "glossaryOrderKey": title,
        "priority": 20,
        "version": version,
        "firstApprovedIn": DATA_STAND,
        "lastReviewed": DATA_STAND,
        "lastUpdated": DATA_STAND,
        "updatedAt": DATA_STAND,
        "classicGlossary": True,
        "showInHub": True,
        "showHover": True,
        "autoLinkAllowed": True,
        "maxAutoLinksPerPage": 1,
        "deepGlossarySections": deep_sections(entry),
    }


def merge_term(existing: dict[str, Any], imported: dict[str, Any]) -> dict[str, Any]:
    return {**existing, **imported}


def write_report(added: list[str], updated: list[str], missing: dict[str, list[str]]) -> None:
    lines = [
        "# Glossar-Import Wirkungsfinanzpolitik-Begriffe v0.1",
        "",
        f"Stand: {DATA_STAND}",
        "",
        f"- Redaktionsquelle: `{SOURCE_DOCUMENT}`",
        f"- Importdatei: `{IMPORT_FILE.relative_to(ROOT)}`",
        f"- Neue Begriffe: {len(added)}",
        f"- Aktualisierte Begriffe: {len(updated)}",
        f"- Offene Querverweise: {sum(len(items) for items in missing.values())}",
        "",
        "## Neu angelegt",
        "",
        *(f"- /begriffe/{slug}/" for slug in added),
        *([] if added else ["- keine"]),
        "",
        "## Aktualisiert",
        "",
        *(f"- /begriffe/{slug}/" for slug in updated),
        *([] if updated else ["- keine"]),
        "",
        "## Offene Querverweise",
        "",
    ]
    if missing:
        for slug, labels in missing.items():
            lines.append(f"### {slug}")
            lines.extend(f"- {label}" for label in labels)
            lines.append("")
    else:
        lines.append("- keine")
        lines.append("")
    lines.extend(
        [
            "## Standardprozess",
            "",
            "1. DOCX in strukturierte Importdaten ueberfuehren.",
            "2. Zentrale Term-Registry aktualisieren.",
            "3. Glossar, Hover-Daten, Suche, KI-/Content-Indizes und Seiten neu bauen.",
            "4. Lokale Checks ausfuehren.",
            "5. Commit, Push, Deployment abwarten und Live-URLs pruefen.",
            "",
        ]
    )
    REPORT_FILE.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-docx", required=True, type=Path)
    args = parser.parse_args()

    entries = parse_docx(args.source_docx)
    if len(entries) != 4:
        raise SystemExit(f"Expected 4 glossary entries, found {len(entries)}")

    imported_terms = [normalize_entry(entry) for entry in entries]
    registry = read_json(REGISTRY_FILE)
    terms = registry["terms"] if isinstance(registry, dict) else registry
    alias_map = build_alias_map(terms, imported_terms)

    missing_by_slug: dict[str, list[str]] = {}
    for term in imported_terms:
        related, missing = resolve_related(term.pop("relatedLabels", []), alias_map)
        term["relatedTerms"] = related
        if missing:
            missing_by_slug[term["slug"]] = missing

    write_json(
        IMPORT_FILE,
        {
            "sourceDocument": SOURCE_DOCUMENT,
            "sourcePath": str(args.source_docx),
            "importedAt": DATA_STAND,
            "terms": imported_terms,
        },
    )

    by_slug = {term.get("slug"): index for index, term in enumerate(terms)}
    added: list[str] = []
    updated: list[str] = []
    for term in imported_terms:
        slug = term["slug"]
        index = by_slug.get(slug)
        if index is None:
            terms.append(term)
            by_slug[slug] = len(terms) - 1
            added.append(slug)
        else:
            terms[index] = merge_term(terms[index], term)
            updated.append(slug)

    if isinstance(registry, dict):
        registry["generatedAt"] = f"{date.today().isoformat()}T00:00:00.000Z"
        registry["sourceNote"] = (
            f"{registry.get('sourceNote', '').strip()} · {SOURCE_DOCUMENT} synchronisiert am {DATA_STAND}"
        ).strip(" ·")
        registry["terms"] = terms
        write_json(REGISTRY_FILE, registry)
    else:
        write_json(REGISTRY_FILE, terms)

    write_report(added, updated, missing_by_slug)
    print(
        json.dumps(
            {
                "added": added,
                "updated": updated,
                "missingRelated": missing_by_slug,
                "importFile": str(IMPORT_FILE.relative_to(ROOT)),
                "report": str(REPORT_FILE.relative_to(ROOT)),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
