#!/usr/bin/env python3
"""Create the public PDF edition of the WÖk total study 2.0.

The source DOCX is a redaction master.  This builder deliberately keeps the
substantive study, glossary proposals, legal/institutional modules, research
agenda and source list, while excluding the parts that are instructions for
the later editorial workflow.  It writes no public DOCX; the intermediate
DOCX is only used for the PDF export.

Usage:
  python3 scripts/publications/build-gesamtstudie-wirkungsdilemmata-kooperation-sdgplus-pdf.py \
    --source /path/to/source.docx \
    --output assets/downloads/woek_gesamtstudie_wirkungsdilemmata_kooperation_sdgplus_v2_0.pdf
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
ET.register_namespace("w", NS["w"])

REMOVE_HEADING_PREFIXES = (
    "Hinweis zu Zweck, Quellen und Dokumentstatus",
    "Inhaltsübersicht",
    "Vertiefung G – Publikations- und Integrationsstrategie",
    "Vertiefung H – Entwurf eines eigenständigen WÖk-Grundlagenkapitels",
    "Vertiefung I – Entwurf eines Journal-Artikels",
    "Vertiefung J – Vorschläge für Glossartexte",
    "Lesebrücke zu den folgenden Vertiefungen",
    "47. Was bereits vorhanden ist",
    "48. Die bisherige Lücke",
    "65. Website und Glossar",
    "66. Redaktionelle Konflikte im bisherigen Bestand",
    "Anhang A – Redaktionsauftrag",
    "Anhang D – Empfohlene nächste Arbeitspakete",
    "Anhang G – Fünf-Jahres-Roadmap",
    "Anhang H – Qualitätsmaßstab",
    "Schlussnotiz zum Dokumentstatus",
    "Redaktioneller Gesamtarbeitsauftrag",
    "Empfohlene Publikationsarchitektur",
)

REMOVE_PARAGRAPH_PREFIXES = (
    "Schlussnotiz zum Dokumentstatus:",
    "Die ausführliche Vertiefungsstudie enthält bereits eine umfangreiche interne und externe Bibliografie.",
)

REPLACEMENTS = {
    "Gesamtstudie und redaktioneller Master – Neufassung 2.0": "Gesamtstudie 2.0 · Arbeits- und Diskussionsfassung",
    "Arbeitsfassung – vor wissenschaftlicher oder rechtlicher Veröffentlichung fachlich prüfen.": "Arbeits- und Diskussionsfassung. Fachliche und redaktionelle Weiterentwicklung vorgesehen.",
    "Interne WÖk-Quellen mit Vorrang": "WÖk-Ausgangstexte und Anschlussdokumente",
    "Interne WÖk-Quellen": "WÖk-Ausgangstexte und Anschlussdokumente",
    "Interne WÖk-Grundlagen": "WÖk-Ausgangstexte und Anschlussdokumente",
}

PARAGRAPH_REPLACEMENTS = {
    "© 2026 Natalie Weber. Arbeitsfassung – vor Veröffentlichung fachlich, empirisch und juristisch prüfen.": "© 2026 Natalie Weber · Arbeits- und Diskussionsfassung. Fachliche und redaktionelle Weiterentwicklung vorgesehen.",
    "Das Dokument ist daher zugleich Theorie, Diagnose, Designstudie, Risikoprüfung und redaktioneller Master. Es soll nicht nur begründen, warum die Wirkungsökonomie gebraucht wird. Es soll offenlegen, woran sie scheitern kann und welche Sicherungen deshalb von Anfang an in ihre Architektur gehören.": "Das Dokument ist daher zugleich Theorie, Diagnose, Designstudie und Risikoprüfung. Es soll nicht nur begründen, warum die Wirkungsökonomie gebraucht wird. Es soll offenlegen, woran sie scheitern kann und welche Sicherungen deshalb von Anfang an in ihre Architektur gehören.",
    "Externe Literatur wird als Bezugslinie und Prüfinstrument genutzt, nicht als nachträgliche Autorisierung der WÖk. Wo die Studie neue Begriffe oder institutionelle Vorschläge entwickelt, werden sie als WÖk-Erweiterungsvorschlag kenntlich gemacht. Aktuelle Lagezahlen beschreiben den Stand 2024 bis August 2026 und müssen bei späterer Veröffentlichung aktualisiert werden.": "Externe Literatur wird als Bezugslinie und Prüfinstrument genutzt, nicht als nachträgliche Autorisierung der WÖk. Wo die Studie neue Begriffe oder institutionelle Vorschläge entwickelt, werden sie als WÖk-Erweiterungsvorschlag kenntlich gemacht. Aktuelle Lagezahlen sind mit ihrem Berichtsstand bis August 2026 ausgewiesen.",
    "Wo ältere Dokumente abweichende Skalen, Steuerklassen, Aggregationslogiken oder Begriffe enthalten, werden diese Unterschiede nicht stillschweigend geglättet, sondern als redaktioneller Prüfbedarf markiert.": "Wo ältere Dokumente abweichende Skalen, Steuerklassen, Aggregationslogiken oder Begriffe enthalten, werden diese Unterschiede nicht stillschweigend geglättet, sondern als fachlicher Klärungsbedarf markiert.",
}


def paragraph_text(paragraph: ET.Element) -> str:
    return "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()


def paragraph_style(paragraph: ET.Element) -> str:
    style = paragraph.find("w:pPr/w:pStyle", NS)
    return style.get(f"{{{NS['w']}}}val", "") if style is not None else ""


def heading_level(paragraph: ET.Element) -> int | None:
    style = paragraph_style(paragraph).lower().replace(" ", "")
    for prefix in ("heading", "überschrift"):
        if style.startswith(prefix) and style[len(prefix):].isdigit():
            return int(style[len(prefix):])
    return None


def replace_whole_paragraph(paragraph: ET.Element, replacement: str) -> bool:
    nodes = paragraph.findall(".//w:t", NS)
    if not nodes:
        return False
    nodes[0].text = replacement
    for node in nodes[1:]:
        node.text = ""
    return True


def normalize_public_figure_captions(body: ET.Element) -> int:
    """Renumber retained figure captions once across the public PDF edition."""
    started = False
    pending_figure: int | None = None
    figure_number = 0
    changed = 0
    for child in list(body):
        if child.tag != f"{{{NS['w']}}}p":
            continue
        text = paragraph_text(child)
        if heading_level(child) == 1 and text == "Vorbemerkung":
            started = True
        if started and child.findall(".//w:drawing", NS):
            figure_number += 1
            pending_figure = figure_number
            continue
        if pending_figure is None or paragraph_style(child) not in {"Caption", "CaptionWOEK"}:
            continue
        normalized = re.sub(r"^Abbildung\s+(?:[A-Z]-)?\d+\s*:\s*", "", text, flags=re.IGNORECASE)
        if normalized:
            changed += int(replace_whole_paragraph(child, f"Abbildung {pending_figure}: {normalized}"))
        pending_figure = None
    return changed


def reference_prefix(text: str) -> str:
    """Return a conservative identity key for a bibliography entry.

    The source contains a base bibliography and a later update list. Their
    citations often differ only in page detail or DOI, so an exact string
    comparison would leave the public PDF with duplicate works.
    """
    match = re.match(r"\s*([^,(]+).*?\)\s*:\s*(.+)$", text)
    if not match:
        return ""
    author = re.sub(r"[^a-z0-9]+", " ", match.group(1).lower()).strip().split()
    title = re.sub(r"\bdoi\b.*$", "", match.group(2), flags=re.IGNORECASE)
    title_words = re.sub(r"[^a-z0-9]+", " ", title.lower()).strip().split()
    if not author or len(title_words) < 2:
        return ""
    return " ".join([author[0], *title_words[:3]])


def deduplicate_public_bibliography(body: ET.Element) -> tuple[int, int]:
    """Retain each source once and turn the second list into an addendum."""
    first_bibliography = False
    updated_bibliography = False
    known: set[str] = set()
    removed = 0
    changed = 0
    for child in list(body):
        if child.tag != f"{{{NS['w']}}}p":
            continue
        text = paragraph_text(child)
        level = heading_level(child)
        if level == 1:
            if text == "Literatur und Quellen":
                first_bibliography = True
                updated_bibliography = False
                continue
            if text == "Aktualisierte Literatur und Quellen der Neufassung":
                first_bibliography = False
                updated_bibliography = True
                changed += int(replace_whole_paragraph(child, "Ergänzende Literatur und Quellen der Neufassung"))
                continue
            first_bibliography = False
            updated_bibliography = False
            continue
        key = reference_prefix(text)
        if first_bibliography and key:
            known.add(key)
            continue
        if updated_bibliography and key and key in known:
            body.remove(child)
            removed += 1
    return removed, changed


def public_docx(source: Path, target: Path) -> None:
    with zipfile.ZipFile(source, "r") as zin:
        root = ET.fromstring(zin.read("word/document.xml"))
        body = root.find("w:body", NS)
        if body is None:
            raise RuntimeError("DOCX enthält keinen Dokumentkörper.")

        remove_at_level: int | None = None
        removed = 0
        changed = 0
        for child in list(body):
            if child.tag == f"{{{NS['w']}}}p":
                text = paragraph_text(child)
                level = heading_level(child)
                if level is not None:
                    if remove_at_level is not None and level <= remove_at_level:
                        remove_at_level = None
                    if any(text.startswith(prefix) for prefix in REMOVE_HEADING_PREFIXES):
                        remove_at_level = level
                if remove_at_level is not None:
                    body.remove(child)
                    removed += 1
                    continue
                if any(text.startswith(prefix) for prefix in REMOVE_PARAGRAPH_PREFIXES):
                    body.remove(child)
                    removed += 1
                    continue
                if text in PARAGRAPH_REPLACEMENTS:
                    changed += int(replace_whole_paragraph(child, PARAGRAPH_REPLACEMENTS[text]))
                for node in child.findall(".//w:t", NS):
                    if not node.text:
                        continue
                    value = node.text
                    for old, new in REPLACEMENTS.items():
                        value = value.replace(old, new)
                    if value != node.text:
                        node.text = value
                        changed += 1
            elif remove_at_level is not None:
                body.remove(child)
                removed += 1

        bibliography_removed, bibliography_changed = deduplicate_public_bibliography(body)
        removed += bibliography_removed
        changed += bibliography_changed + normalize_public_figure_captions(body)

        target.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename == "word/document.xml":
                    zout.writestr(item, ET.tostring(root, encoding="utf-8", xml_declaration=True))
                else:
                    zout.writestr(item, zin.read(item.filename))
    print(f"Public DOCX prepared: removed {removed} XML blocks, changed {changed} text runs.")


def export_pdf(public_source: Path, output: Path) -> None:
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        raise RuntimeError("LibreOffice/soffice ist für den PDF-Export nicht verfügbar.")
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="woek-gesamtstudie-pdf-") as temp_dir:
        result = subprocess.run(
            [soffice, "--headless", "--convert-to", "pdf", "--outdir", temp_dir, str(public_source)],
            check=False,
            text=True,
            capture_output=True,
        )
        if result.returncode:
            raise RuntimeError(f"PDF-Export fehlgeschlagen: {result.stderr or result.stdout}")
        rendered = Path(temp_dir) / f"{public_source.stem}.pdf"
        if not rendered.exists():
            raise RuntimeError(f"PDF-Export erzeugte keine Datei: {result.stdout or result.stderr}")
        shutil.copy2(rendered, output)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path, help="Redaktionelles DOCX-Ausgangsdokument")
    parser.add_argument("--output", required=True, type=Path, help="Zielpfad der öffentlichen PDF-Fassung")
    parser.add_argument("--public-docx", type=Path, help="Optionaler Pfad für die temporäre bereinigte DOCX-Fassung")
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    output = args.output.expanduser().resolve()
    if not source.exists():
        raise SystemExit(f"Ausgangsdokument nicht gefunden: {source}")

    if args.public_docx:
        public_source = args.public_docx.expanduser().resolve()
        public_docx(source, public_source)
        export_pdf(public_source, output)
    else:
        with tempfile.TemporaryDirectory(prefix="woek-gesamtstudie-public-docx-") as temp_dir:
            public_source = Path(temp_dir) / "woek_gesamtstudie_wirkungsdilemmata_kooperation_sdgplus_v2_0.docx"
            public_docx(source, public_source)
            export_pdf(public_source, output)

    print(f"Public PDF written: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
