#!/usr/bin/env python3
"""Generate Sprint 2 preservation inventories and audits."""

from __future__ import annotations

import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

ASSET_EXTENSIONS = {
    ".wav",
    ".mp3",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".svg",
    ".pdf",
    ".json",
    ".md",
}

REFERENCE_EXTENSIONS = {".html", ".css", ".js", ".json", ".md"}
SKIP_PARTS = {".git", "woek-akademie-app", "__pycache__"}


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def escape_cell(value: object) -> str:
    text = str(value).replace("\n", " ").strip()
    return text.replace("|", "\\|")


def iter_files(extensions: set[str]) -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_PARTS for part in path.relative_to(ROOT).parts):
            continue
        if path.suffix.lower() in extensions:
            files.append(path)
    return sorted(files, key=rel)


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return ""


REFERENCE_FILES = [
    path
    for path in iter_files(REFERENCE_EXTENSIONS)
    if path.suffix.lower() != ".md" and path.relative_to(ROOT).parts[0] != "docs"
]
REFERENCE_TEXT = {path: read_text(path) for path in REFERENCE_FILES}


def find_usage(asset: Path) -> list[str]:
    asset_rel = rel(asset)
    tokens = {asset_rel}
    if asset_rel.startswith("assets/"):
        tokens.add("../" + asset_rel)
        tokens.add("../../" + asset_rel)
        tokens.add(asset_rel.replace("assets/", "/assets/"))
    usage: list[str] = []
    for path, text in REFERENCE_TEXT.items():
        if path == asset:
            continue
        if any(token in text for token in tokens):
            usage.append(rel(path))
    return usage


def asset_type(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".wav", ".mp3"}:
        return "audio"
    if suffix in {".png", ".jpg", ".jpeg", ".webp"}:
        return "image"
    if suffix == ".svg":
        return "svg"
    if suffix == ".pdf":
        return "pdf"
    if suffix == ".json":
        return "json"
    if suffix == ".md":
        return "markdown"
    return suffix.lstrip(".")


def transcript_status(asset_rel: str, usage: list[str]) -> str:
    if not usage:
        return "Einbindung pruefen"
    combined = "\n".join(REFERENCE_TEXT.get(ROOT / page, "") for page in usage)
    if "Das vollständige Transkript wird hier ergänzt" in combined:
        return "Transkript fehlt oder ist nur Platzhalter"
    if "Transkript" in combined:
        return "Transkript vorhanden, Vollstaendigkeit pruefen"
    return "Transkript fehlt"


def status_for(path: Path, usage: list[str]) -> tuple[str, str]:
    path_rel = rel(path)
    kind = asset_type(path)
    if "/rejected/" in f"/{path_rel}":
        return "rejected", "Nicht oeffentlich einbinden; als rejected-Archiv behalten."
    if kind == "audio":
        return "improve", f"Audio erhalten; {transcript_status(path_rel, usage)}."
    if usage:
        return "keep", "Eingebunden; erhalten und bei Bedarf fachlich/visuell verbessern."
    if kind in {"image", "svg"} and "/visuals/" in f"/{path_rel}":
        return "needs_review", "Visual erhalten; Zuordnung, Stilstatus und moegliche Einbindung pruefen."
    if kind == "pdf":
        return "relink", "Download erhalten; Sichtbarkeit im Downloads-/Evidenzbereich pruefen."
    if kind in {"json", "markdown"} and path_rel.startswith(("content/", "assets/data/", "assets/search/")):
        return "keep", "Struktur- oder Datenbestand; nicht loeschen, Abhaengigkeiten vor Aenderungen pruefen."
    return "needs_review", "Nicht ungeprueft entfernen; Verwendung und fachliche Relevanz im naechsten Review klaeren."


def write_asset_inventory() -> None:
    assets = iter_files(ASSET_EXTENSIONS)
    rows = []
    counts = Counter()
    status_counts = Counter()
    for path in assets:
        usage = find_usage(path)
        status, recommendation = status_for(path, usage)
        counts[asset_type(path)] += 1
        status_counts[status] += 1
        pages = ", ".join(usage[:4])
        if len(usage) > 4:
            pages += f", +{len(usage) - 4} weitere"
        rows.append(
            [
                path.name,
                rel(path),
                asset_type(path),
                "eingebunden" if usage else "nicht direkt referenziert",
                pages or "-",
                status,
                recommendation,
            ]
        )

    lines = [
        "# Asset-Inventar",
        "",
        "Stand: 2026-05-22. Dieses Inventar ist die Bestandsschutz-Grundlage fuer Sprint 2. Keine Datei wurde geloescht; nicht direkt referenzierte Dateien werden zur Pruefung markiert, nicht entfernt.",
        "",
        "## Zusammenfassung",
        "",
        "| Kategorie | Anzahl |",
        "|---|---:|",
    ]
    for kind, count in sorted(counts.items()):
        lines.append(f"| {kind} | {count} |")
    lines.extend(["", "| Status | Anzahl |", "|---|---:|"])
    for status, count in sorted(status_counts.items()):
        lines.append(f"| {status} | {count} |")
    lines.extend(
        [
            "",
            "## Vollstaendige Liste",
            "",
            "| Dateiname | Pfad | Typ | aktuelle Verwendung | zugeordnete Seite | Status | Empfehlung |",
            "|---|---|---|---|---|---|---|",
        ]
    )
    for row in rows:
        lines.append("| " + " | ".join(escape_cell(cell) for cell in row) + " |")
    (DOCS / "asset-inventory.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_audio_audit() -> None:
    rows = []
    for path in sorted((ROOT / "assets/audio").glob("*")):
        if not path.is_file():
            continue
        usage = find_usage(path)
        status = transcript_status(rel(path), usage)
        rows.append(
            [
                path.name,
                rel(path),
                ", ".join(usage) or "-",
                "ja" if usage else "nein",
                status,
                "keep",
                "Player erhalten; fehlende Volltranskripte ergaenzen und mobile Darstellung im naechsten QA-Lauf pruefen.",
            ]
        )
    lines = [
        "# Audio-Integration-Audit",
        "",
        "Alle gefundenen Audio-Dateien bleiben erhalten. Fehlende oder nur platzhalterhafte Transkripte sind Verbesserungsbedarf, kein Grund zur Entfernung.",
        "",
        "| Audio | Pfad | Seite(n) | Player eingebunden | Transkriptstatus | Status | Empfehlung |",
        "|---|---|---|---|---|---|---|",
    ]
    for row in rows:
        lines.append("| " + " | ".join(escape_cell(cell) for cell in row) + " |")
    lines.extend(
        [
            "",
            "## Ergebnis",
            "",
            "- Keine Audio-Datei wurde entfernt oder umbenannt.",
            "- `wirkung-politischer-sprache.wav` hat eine ausgearbeitete Transkript-Einbindung.",
            "- Mehrere Grundlagen-Audios haben aktuell Platzhaltertexte. Diese bleiben online und werden als `improve` markiert.",
        ]
    )
    (DOCS / "audio-integration-audit.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_tools_audit() -> None:
    tools = [
        ["WÖk-Kompass", "kompass.html", "Orientierung und gefuehrte Wirkungsfragen", "MVP sichtbar", "ja", "zu pruefen", "grundsaetzlich", "ja", "Demo-Quellenpanel", "ja", "Sprint 3: Interaktion vertiefen", "B"],
        ["WÖk-Scanner", "scanner.html", "Erste Wirkungsanalyse fuer Texte, Produkte und Organisationen", "MVP / Konzept", "ja", "zu pruefen", "Status klarer fuehren", "ja", "ausbauen", "ja", "Nicht entfernen; als Anwendung prominent halten", "B"],
        ["Wirkung politischer Sprache", "sdg-plus/medien-demokratie/wirkung-politischer-sprache.html", "Analyse von Frames, Resonanzraeumen und Demokratiewirkung", "stark ausgearbeitet", "ja", "ja", "ja", "ja", "ja", "ja", "Erhalten; als Referenzanwendung weiter pflegen", "C"],
        ["Erleben-Bereich", "erleben.html", "Interaktive Beispiele und Demos", "umfangreich vorhanden", "ja", "zu pruefen", "teilweise pruefen", "teilweise", "ausbauen", "ja", "Nicht kuerzen; in Anwendungen-Hub besser fuehren", "B"],
        ["Produktwirkung / Apfelbeispiel", "erleben.html#simulator", "Produktwirkung didaktisch erfahrbar machen", "vorhanden", "ja", "zu pruefen", "Begriffe weiter schaerfen", "ja", "ausbauen", "ja", "Mit Produkte-und-Preise-Hub verbinden", "C"],
        ["Wirkungssteuer / Steuerlogik", "workflow.html", "Daten in Scorecards, Klassen und Rueckkopplung uebersetzen", "vorhanden", "ja", "zu pruefen", "ja", "ja", "teilweise", "ja", "Transkript zum Audio ergaenzen", "C"],
        ["Scorecard-Demos", "scorecard-dashboard.html", "Wirkungsdaten beispielhaft vergleichen", "vorhanden", "ja", "zu pruefen", "ja", "ja", "teilweise", "ja", "Datenstatus je Demo explizit halten", "C"],
        ["Suche", "suche.html", "Website auffindbar machen", "vorhanden", "ja", "ja", "neutral", "nicht relevant", "nein", "ja", "Suchindex nach Content-Aenderungen weiter aktualisieren", "C"],
        ["Glossar-Suche", "glossar.html", "Begriffe klaeren", "vorhanden", "ja", "ja", "ja", "nicht relevant", "Quellenbezug", "ja", "Begriffskonsistenz weiter als QA nutzen", "C"],
        ["Akademie-Lernpfade", "akademie.html", "Wirkungskompetenz als Lernarchitektur", "vorhanden", "ja", "ja", "ja", "ja", "ja", "ja", "Audio-Transkript ergaenzen", "C"],
        ["SDG+ Medien / Demokratie", "sdg-plus/medien-demokratie.html", "Demokratie als Bewertungsraum sichtbar machen", "vorhanden", "ja", "ja", "ja", "ja", "ja", "ja", "Mit Journalismus und politischer Sprache eng halten", "C"],
        ["Anwendungen-Hub", "anwendungen.html", "Zentraler Zugang zu Tools und Methoden", "neu strukturiert", "ja", "ja", "ja", "ja", "ja", "ja", "Gruppenlogik Sprint 2 ergaenzt; bestehende Inhalte erhalten", "C"],
        ["Wirkungseinkommen-Rechner", "fuer/wirkungseinkommen.html", "Modellrechnung fuer Grunddividende und Finanzierungsstack", "Konzept / Modell", "ja", "zu pruefen", "Statushinweis Pflicht", "ja", "ja", "ja", "Modellwerte weiterhin prominent kennzeichnen", "B"],
        ["Wirkungsrenten-Rechner", "fuer/rente.html", "Modellrechnung fuer Wirkungsrente", "Konzept / Modell", "ja", "zu pruefen", "Statushinweis Pflicht", "ja", "ja", "ja", "Keine Leistungszusage; Rechner in Sprint 3 weiter testen", "B"],
        ["Visual- und Diagramm-Komponenten", "content/visuals/visual-registry.json", "Kontrollierte SVG/HTML-Visuals verwalten", "Registry vorhanden", "ja", "ja", "ja", "ja", "ja", "ja", "Registry bei jedem neuen Visual aktualisieren", "C"],
    ]
    lines = [
        "# Tools- und Anwendungen-Audit",
        "",
        "Bestandsschutz-Pruefung fuer Sprint 2. Alle Anwendungen bleiben erhalten; Korrektur bedeutet hier Einordnung, Statusklarheit, bessere Verlinkung und fachliche Schaerfung.",
        "",
        "| Tool / Anwendung | URL | Zweck | aktueller Status | technisch | mobil | Begriffe korrekt | Visuals gut | Quellenpanel | CTA sinnvoll | Verbesserung nötig | Priorität |",
        "|---|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    for row in tools:
        lines.append("| " + " | ".join(escape_cell(cell) for cell in row) + " |")
    (DOCS / "tools-applications-audit.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_proposed_deletions() -> None:
    lines = [
        "# Vorgeschlagene Löschungen",
        "",
        "Stand: 2026-05-22.",
        "",
        "## Ergebnis",
        "",
        "Für diesen Sprint werden keine Löschungen vorgeschlagen.",
        "",
        "Die Ergänzungsanweisung verlangt Bestandsschutz: Dateien, Audio, Grafiken, Downloads, Tools, Journalartikel, persönliche Inhalte über Natalie Weber und bestehende Bausteine werden nicht ungeprüft entfernt.",
        "",
        "## Beobachtungen",
        "",
        "| Datei / Bereich | Grund | Ersatz? | Risiko | Empfehlung |",
        "|---|---|---|---|---|",
        "| `assets/visuals/rejected/` | Enthält bereits als rejected markierte Visuals. | Neue kontrollierte SVG-Visuals sind vorhanden. | Niedrig, solange nicht öffentlich eingebunden. | Behalten, nicht löschen; als Nachweis- und Archivbereich führen. |",
        "| Nicht direkt referenzierte alte Visuals und LinkedIn-Bilder | Teilweise Archiv-, Blog- oder Herkunftsmaterial. | Kein direkter Ersatz nötig. | Hoch, wenn vorschnell entfernt, weil Blog-/Kontextbezüge verloren gehen können. | `needs_review`, nicht löschen. |",
        "| Platzhalter-Transkripte | Inhaltlich unvollständig, aber Player funktionieren. | Volltranskripte ergänzen. | Mittel, wenn Audio entfernt würde. | Audio behalten; Transkripte nachziehen. |",
        "",
        "Löschen ist erst zulässig, wenn ein Asset eindeutig als `rejected`, doppelt vollständig ersetzt, veraltet und archiviert oder fachlich irrelevant markiert wurde und die Verlinkung geprüft ist.",
    ]
    (DOCS / "proposed-deletions.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_preservation_audit() -> None:
    audio_files = sorted((ROOT / "assets/audio").glob("*"))
    transcript_missing = [path.name for path in audio_files if "Platzhalter" in transcript_status(rel(path), find_usage(path))]
    lines = [
        "# Sprint 2 Tools- und Content-Preservation-Audit",
        "",
        "Stand: 2026-05-22.",
        "",
        "## 1. Welche Tools wurden geprüft?",
        "",
        "Geprüft wurden WÖk-Kompass, WÖk-Scanner, Wirkung politischer Sprache, Erleben-Bereich, Produktwirkung / Apfelbeispiel, Wirkungssteuer / Steuerlogik, Scorecard-Demos, Suche, Glossar-Suche, Akademie-Lernpfade, SDG+ Medien / Demokratie, Anwendungen-Hub, Wirkungseinkommen, Wirkungsrente und Visual-/Diagramm-Komponenten.",
        "",
        "## 2. Welche Anwendungen wurden geprüft?",
        "",
        "Die Anwendungen wurden nicht entfernt, sondern im Hub neu eingeordnet: Wirkung analysieren, Produkte und Märkte, Unternehmen, Staat und Gesellschaft sowie Wissen und Lernen.",
        "",
        "## 3. Welche Audios wurden gefunden?",
        "",
        f"Gefunden wurden {len(audio_files)} Audio-Dateien: " + ", ".join(path.name for path in audio_files) + ".",
        "",
        "## 4. Welche Audios sind eingebunden?",
        "",
        "Alle sechs Audio-Dateien sind in HTML-Seiten referenziert. Details stehen in `docs/audio-integration-audit.md`.",
        "",
        "## 5. Welche Transkripte fehlen?",
        "",
        "Volltranskripte oder vollständige Transkriptprüfung fehlen bei: " + (", ".join(transcript_missing) if transcript_missing else "keinem Audio eindeutig") + ". Die Audios bleiben eingebunden.",
        "",
        "## 6. Welche persönlichen Inhalte über Natalie wurden erhalten?",
        "",
        "`natalie-weber.html`, der Startseitenabschnitt zur Begründerin, Buchverweise, strukturierte Daten und Footer-Copyright bleiben erhalten. Zusätzlich wurde Natalie Weber auf `mehr.html` als Autorinnenschaft besser auffindbar gemacht.",
        "",
        "## 7. Welche Inhalte wurden verschoben?",
        "",
        "Keine Inhalte wurden verschoben. Der Anwendungen-Hub wurde ergänzt, bestehende Abschnitte bleiben erhalten.",
        "",
        "## 8. Welche Inhalte wurden optimiert?",
        "",
        "- `anwendungen.html` erhielt eine klarere Hub-Struktur mit Problem, WÖk-Frage, Methode, Status und Beispiel je Anwendungsgruppe.",
        "- `mehr.html` verlinkt Natalie Weber jetzt sichtbar als Autorinnenschaft.",
        "- `natalie-weber.html` wurde begrifflich präzisiert: Zielgröße ist positive Netto-Wirkung, nicht automatisch positive Wirkung.",
        "",
        "## 9. Welche Inhalte wurden nicht gelöscht und warum?",
        "",
        "Audio, Blogbilder, LinkedIn-Artikelbilder, PDFs, Downloads, Visuals, JSON-Daten, Suchdaten, Kompass-/Scanner-Vorarbeiten, Akademie- und Glossarinhalte wurden erhalten. Die Website soll professioneller werden, nicht ausgedünnt.",
        "",
        "## 10. Welche Dateien sind potenziell veraltet?",
        "",
        "Potentiell veraltet oder nur als Archiv zu behandeln sind vor allem Dateien in `assets/visuals/rejected/` sowie einzelne nicht direkt referenzierte Altvisuals. Sie bleiben als `needs_review` oder `rejected` dokumentiert.",
        "",
        "## 11. Welche Löschvorschläge gibt es?",
        "",
        "Keine Löschung in Sprint 2. Siehe `docs/proposed-deletions.md`.",
        "",
        "## 12. Welche Anwendungen brauchen Sprint 3?",
        "",
        "Kompass, Scanner, Erleben-Bereich, Produktwirkung, Scorecard-Demos, Wirkungseinkommen- und Wirkungsrentenrechner brauchen Sprint 3 für Interaktion, Datenstatus, mobile Detailprüfung und Quellenlogik.",
        "",
        "## 13. Welche Inhalte sind noch zu dünn?",
        "",
        "Nicht zu löschen, aber zu vertiefen sind Transkripte, einzelne Quellenpanels bei Tools, Statuslogik der Rechner und Nutzerführung zwischen Kompass, Scanner, Glossar und Evidenz.",
        "",
        "## 14. Welche Inhalte sind fachlich stark und sollten erhalten bleiben?",
        "",
        "Stark sind die Zielgruppen-Seiten aus dem Content-Master, die politische-Sprache-Anwendung mit Audio und Transkript, die neue Visual-Systematik, Glossar, Evidenz-/Methodikstruktur, Buchseite, Natalie-Weber-Seite und der gewachsene Blog-/LinkedIn-Bestand.",
    ]
    (DOCS / "sprint-2-tools-content-preservation-audit.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    write_asset_inventory()
    write_audio_audit()
    write_tools_audit()
    write_proposed_deletions()
    write_preservation_audit()


if __name__ == "__main__":
    main()
