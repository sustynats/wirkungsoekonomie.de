#!/usr/bin/env python3
from __future__ import annotations

import os
import re
from datetime import datetime
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = Path("/Users/hagen/Desktop/WÖk-Konzepte etc")
INVENTORY_PATH = SITE_ROOT / "docs" / "woek-dokumenten-inventar.md"

SCAN_ROOTS = [
    SOURCE_ROOT,
    SOURCE_ROOT / "Kerndokumente",
    SOURCE_ROOT / "Kerndokumente" / "Buch Neuauflage",
]

SUPPORTED_SUFFIXES = {".md", ".pdf", ".docx", ".pptx", ".xlsx", ".numbers", ".png"}

TOPIC_PATTERNS = [
    ("Wirkung / Wirkungsmanagement", ["wenn alle von wirkung sprechen", "wirkungsmanagement", "foerderpolitik", "förderpolitik"]),
    ("Wirkungssteuer", ["wustg", "wstg", "wirkungssteuer", "steuer", "gewerbesteuer", "mwst"]),
    ("Scorecards / WÖk-IDs", ["scorecard", "master_items", "item", "benchmark", "threshold", "mapping", "woek-id"]),
    ("Datenbasis / Standards", ["csrd", "esrs", "gri", "sdg", "taxonomy", "taxonomie", "daten", "leitlinien"]),
    ("T-SROI", ["t-sroi", "tsroi", "solar", "fonds"]),
    ("Produkte / Preise", ["produkt", "apfel", "zange", "polyamid", "preise"]),
    ("Wohnen", ["wohn", "miete"]),
    ("Rente / Einkommen", ["rente", "einkommen", "maschinen", "arbeit", "roboter", "ki"]),
    ("Medien / Demokratie", ["medien", "kommunikation", "tonalitaet", "fakten", "social", "narrativ", "diskurs", "demokratie"]),
    ("Geopolitik / Systemrisiken", ["multipolare", "geopolit", "risiken", "energie", "infrastruktur", "systemdynamik"]),
    ("Grundlagen / Buch", ["grundidee", "kurz", "kreislaufsystem", "wohlstand", "manifest", "leitbild", "gesellschaftsordnung"]),
    ("Akademie / Didaktik", ["akademie", "vorlesung", "modul", "handbuch", "wirkungskompetenz", "wirkungshosting"]),
]

TERM_PATTERNS = [
    "Wirkung",
    "Wirkungspotenzial",
    "Wirkstoff",
    "Netto-Wirkung",
    "positive Netto-Wirkung",
    "Wirkungsarchitektur",
    "Wirkungslenkung",
    "Wirkungsrückkopplung",
    "Wirkungsblindheit",
    "Wirkungswahrheit",
    "Wirkungsgrenze",
    "SDG",
    "SDG+",
    "WÖk-ID",
    "Scorecard",
    "Reverse Merit Order",
    "Wirkungsrat",
    "NWI",
    "T-SROI",
    "CSRD",
    "ESRS",
    "GRI",
]


def slug(value: str) -> str:
    return value.lower().replace("ö", "oe").replace("ä", "ae").replace("ü", "ue").replace("ß", "ss")


def tokens(value: str) -> set[str]:
    return {token for token in re.split(r"[^a-z0-9]+", slug(value)) if token}


def matches(haystack: str, needle: str) -> bool:
    normalized_needle = slug(needle)
    if len(normalized_needle) <= 3:
        return normalized_needle in tokens(haystack)
    return normalized_needle in haystack


def collect_files() -> list[Path]:
    files: dict[str, Path] = {}
    for root in SCAN_ROOTS:
        if not root.exists():
            continue
        if root == SOURCE_ROOT:
            candidates = [path for path in root.iterdir() if path.is_file()]
        else:
            candidates = [path for path in root.rglob("*") if path.is_file()]
        for path in candidates:
            if path.name.startswith("~$"):
                continue
            if path.suffix.lower() not in SUPPORTED_SUFFIXES:
                continue
            files[str(path)] = path
    return sorted(files.values(), key=lambda path: str(path).casefold())


def document_type(path: Path) -> str:
    name = slug(path.stem)
    suffix = path.suffix.lower()
    if "begriffsleitfaden_fuehrend_v1.0" in name:
        return "Führendes Referenzdokument"
    if suffix == ".md":
        return "Redaktionelle Referenz"
    if suffix == ".pptx":
        return "Präsentation"
    if suffix in {".xlsx", ".numbers"}:
        return "Beispiel / Datenmodell"
    if suffix == ".png":
        return "Grafik / Beispiel"
    if "gesetz" in name or "wustg" in name or "wstg" in name:
        return "Gesetz / Leitlinie"
    if "working" in name or name.startswith("wp_") or "wp-" in name:
        return "Working Paper"
    if "whitepaper" in name or "whitepaper" in name:
        return "Whitepaper"
    if "handbuch" in name or name.startswith("hb-"):
        return "Handbuch / Akademie"
    if "buch" in str(path).casefold() or "wohlstand" in name:
        return "Buchauszug / Buchstand"
    if "manifest" in name or "leitbild" in name:
        return "Leitbild / Manifest"
    if any(token in name for token in ["beispiel", "usecase", "apfel", "zange", "mannheim"]):
        return "Beispiel"
    return "Konzeptpapier"


def topics(path: Path) -> list[str]:
    haystack = slug(" ".join(path.parts[-4:]))
    if "begriffsleitfaden_fuehrend_v1.0" in haystack:
        return ["Grundlagen / Begriffslogik"]
    result = []
    for label, needles in TOPIC_PATTERNS:
        if any(matches(haystack, needle) for needle in needles):
            result.append(label)
    return result or ["noch zu prüfen"]


def relevant_terms(path: Path) -> list[str]:
    haystack = slug(" ".join(path.parts[-4:]))
    if "begriffsleitfaden_fuehrend_v1.0" in haystack:
        return [
            "Wirkung",
            "Wirkungspotenzial",
            "Wirkstoff",
            "Netto-Wirkung",
            "positive Netto-Wirkung",
            "Wirkungsarchitektur",
            "Wirkungslenkung",
            "Wirkungsrückkopplung",
            "Wirkungsblindheit",
            "Wirkungswahrheit",
            "Wirkungsgrenze",
            "SDG",
            "SDG+",
            "WÖk-ID",
            "Scorecard",
            "Reverse Merit Order",
            "Wirkungsrat",
        ]
    terms = []
    for term in TERM_PATTERNS:
      normalized = slug(term)
      if matches(haystack, normalized):
          terms.append(term)
    if "wustg" in haystack or "wstg" in haystack or "steuer" in haystack:
        terms.extend(["Wirkungssteuer", "Wirkungsrückkopplung", "Reverse Merit Order"])
    if "sdg" in haystack:
        terms.extend(["SDG", "SDG+"])
    if "scorecard" in haystack or "master_items" in haystack:
        terms.extend(["Scorecard", "WÖk-ID", "NWI"])
    return sorted(set(terms)) or ["nach Extraktion prüfen"]


def freshness(path: Path) -> str:
    name = slug(path.stem)
    parent = slug(str(path.parent))
    if "begriffsleitfaden_fuehrend_v1.0" in name:
        return "führend"
    if "neuauflage" in parent or "buch neuauflage" in parent:
        return "hoch"
    if "2026" in name or "v1.2" in name:
        return "hoch / prüfen"
    if "2025" in name or "oktober2025" in name or "sept2025" in name:
        return "mittel / prüfen"
    if "alt" in name or "archiv" in parent or "manifest" in name:
        return "niedrig / historisch"
    return "unbekannt / prüfen"


def status(path: Path, doc_type: str) -> str:
    name = slug(path.stem)
    if "begriffsleitfaden_fuehrend_v1.0" in name:
        return "führend"
    if "wenn alle von wirkung sprechen" in name:
        return "aktuell nutzbar"
    if doc_type in {"Gesetz / Leitlinie"}:
        return "widersprüchlich / prüfen"
    if doc_type in {"Leitbild / Manifest", "Präsentation"}:
        return "nur historisch / Archiv"
    if "partei" in name or "parteilos" in name or "moral" in name:
        return "widersprüchlich / prüfen"
    if doc_type in {"Grafik / Beispiel", "Beispiel / Datenmodell", "Beispiel"}:
        return "nutzbar nach Überarbeitung"
    return "nutzbar nach Überarbeitung"


def website_use(path: Path, doc_type: str, topic_list: list[str]) -> str:
    if doc_type == "Führendes Referenzdokument":
        return "maßgebliche Prüfreferenz für alle neuen Inhalte"
    if "Wirkung / Wirkungsmanagement" in topic_list:
        return "Wissensseite / Dossier Wirkung, Wirkungsmanagement und Förderpolitik"
    topic_text = ", ".join(topic_list)
    if "Wirkungssteuer" in topic_list:
        return "Methodikseite / Beispiele / Dossier Wirkungssteuer"
    if "Scorecards / WÖk-IDs" in topic_list:
        return "Methodikseite Daten, Scorecards, WÖk-IDs"
    if "Datenbasis / Standards" in topic_list:
        return "Methodik / SDG+ / Datenbasis"
    if "Medien / Demokratie" in topic_list:
        return "SDG+ / Blog-Dossier / Akademie"
    if "Rente / Einkommen" in topic_list:
        return "Anwendungen / Dossier Automatisierung und Wirkungseinkommen"
    if "Wohnen" in topic_list:
        return "Anwendungen / Beispiel Wohnen"
    if "Produkte / Preise" in topic_list:
        return "Beispiele / Methodik Produktbewertung"
    if "Akademie / Didaktik" in topic_list:
        return "Akademie-Draft / Lernmaterial"
    if doc_type == "Präsentation":
        return "nur als Rohstruktur für Erklärseiten"
    return f"Rohmaterial für Wissensseiten ({topic_text})"


def conflict_note(path: Path, doc_type: str, status_value: str) -> str:
    if status_value == "führend":
        return "keine; maßgebliche Referenz"
    if doc_type == "Gesetz / Leitlinie":
        return "juristische/steuerliche Aussagen gegen Leitfaden und aktuellen Rechtsstand prüfen"
    if doc_type in {"Leitbild / Manifest", "Präsentation"}:
        return "mögliche alte Leitformeln und vereinfachte Systemgrafiken prüfen"
    return "Begriffe gegen Führungslogik prüfen; besonders Wirkung/Wirkungspotenzial/Netto-Wirkung/SDG+"


def stand(path: Path) -> str:
    match = re.search(r"(20\d{2}(?:[-_ ]?\d{2})?(?:[-_ ]?\d{2})?|v\d+(?:\.\d+)*)", path.name, re.I)
    if match:
        return match.group(1).replace("_", "-")
    modified = datetime.fromtimestamp(os.path.getmtime(path)).strftime("%Y-%m-%d")
    return f"Dateistand {modified}"


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(SOURCE_ROOT))
    except ValueError:
        return str(path)


def row(path: Path) -> str:
    doc_type = document_type(path)
    topic_list = topics(path)
    status_value = status(path, doc_type)
    cells = [
        rel(path),
        doc_type,
        stand(path),
        freshness(path),
        ", ".join(topic_list),
        ", ".join(relevant_terms(path)),
        website_use(path, doc_type, topic_list),
        conflict_note(path, doc_type, status_value),
        status_value,
    ]
    return "| " + " | ".join(cell.replace("\n", " ").replace("|", "/") for cell in cells) + " |"


def main() -> None:
    files = collect_files()
    lines = [
        "# WÖk-Dokumenten-Inventar",
        "",
        "Stand: automatisch erzeugtes Startinventar. Alte Dokumente sind Rohmaterial; der führende Begriffsleitfaden, der aktuelle Buchstand und die aktuelle Website-Logik haben Vorrang.",
        "",
        "## Quellenhierarchie",
        "",
        "1. Führend: `WOeK_Begriffsleitfaden_fuehrend_v1.0.md`, aktueller Buchstand, Website-Struktur und Glossar.",
        "2. Sekundär: ältere Whitepaper, Working Papers, Präsentationen, Konzeptpapiere, Beispiele, Gesetzesentwürfe und Leitlinien.",
        "3. Regel: Bei Abweichungen gilt der führende Begriffsleitfaden. Kein altes Dokument wird ohne Prüfung als öffentliche Systemfassung behandelt.",
        "",
        "## Redaktionsstatus",
        "",
        "Statuswerte für abgeleitete Inhalte: `draft`, `reviewed`, `published`, `archive`, `needs_update`. Dieses Inventar vergibt Dokumentstatus, keinen Veröffentlichungsstatus für neue Inhalte.",
        "",
        f"Erfasste Dateien: {len(files)}",
        "",
        "| Dateiname | Dokumenttyp | Datum / Stand | vermuteter Aktualitätsgrad | Hauptthemen | relevante Begriffe | mögliche Website-Verwendung | Konflikte mit aktuellem Begriffsleitfaden | empfohlener Status |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    lines.extend(row(path) for path in files)
    lines.extend(
        [
            "",
            "## Hinweise zur Nutzung",
            "",
            "- Dieses Inventar ist ein Startpunkt. Es ersetzt keine inhaltliche Prüfung.",
            "- PDF-, DOCX-, PPTX-, XLSX-, Numbers- und PNG-Dateien werden nicht automatisch veröffentlicht.",
            "- Inhalte werden zuerst extrahiert, gegen den führenden Begriffsleitfaden geprüft und dann als moderne Website-Seiten, Methodikseiten, Beispiele, Dossiers oder Akademie-Drafts neu geschrieben.",
            "- Besonders sensible Bereiche sind juristische Steuerlogik, konkrete politische Einordnungen, Medienwirkung, Moralbegriffe und ältere Manifest-/Leitbildfassungen.",
        ]
    )
    INVENTORY_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {INVENTORY_PATH.relative_to(SITE_ROOT)} with {len(files)} files.")


if __name__ == "__main__":
    main()
