#!/usr/bin/env python3
"""Remove internal publication notes from public DOCX downloads."""

import re
import sys
import tempfile
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
ET.register_namespace("w", NS["w"])

REMOVE_PATTERNS = [
    re.compile(r"CodeX|Codex|Repository|Sitemap aktualisieren|Dateien anlegen|Toolaufruf|Prompt|ChatGPT|Python|interne Aufgabe|Abschlussbericht", re.I),
    re.compile(r"sollte online .*veröffentlicht", re.I),
    re.compile(r"soll online .*veröffentlicht", re.I),
    re.compile(r"Seite benötigt .*Druckfunktion", re.I),
    re.compile(r"^Für das Portal .* gilt: Die Online-Volltexte", re.I),
    re.compile(r"^Dieses Dokument ist als öffentliche .*online lesbar.*Dossier-Download", re.I),
]

REMOVE_HEADINGS = [
    re.compile(r"^\d+\.\s*Online-Umsetzung$", re.I),
    re.compile(r"^Online-Umsetzung$", re.I),
    re.compile(r"^\d+\.\s*Website- und Dossierlogik$", re.I),
    re.compile(r"^Website- und Dossierlogik$", re.I),
]

REPLACEMENTS = {
    "interne Referenzpunkte": "methodische Referenzpunkte",
    "https://www.bmas.de/DE/Service/Presse/Pressemitteilungen/2025/bundeskabinett-beschliesst-rentenversicherungsbericht-2025.html": "https://www.bmas.de/SharedDocs/Downloads/DE/Rente/rentenversicherungsbericht-2025.html",
    "https://www.deutsche-rentenversicherung.de/SharedDocs/Downloads/DE/Statistiken-und-Berichte/statistikpublikationen/rv_in_zahlen.pdf": "https://www.deutsche-rentenversicherung.de/SharedDocs/Downloads/DE/Statistiken-und-Berichte/statistikpublikationen/rv_in_zahlen.html",
}


def paragraph_text(paragraph):
    return "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()


def should_remove(text):
    return any(pattern.search(text) for pattern in REMOVE_PATTERNS) or any(pattern.search(text) for pattern in REMOVE_HEADINGS)


def replace_text(paragraph):
    changed = False
    for node in paragraph.findall(".//w:t", NS):
        if not node.text:
            continue
        value = node.text
        for source, target in REPLACEMENTS.items():
            value = value.replace(source, target)
        if value != node.text:
            node.text = value
            changed = True
    return changed


def sanitize_docx(path):
    src = Path(path)
    with zipfile.ZipFile(src, "r") as zin:
        document_xml = zin.read("word/document.xml")
        root = ET.fromstring(document_xml)
        body = root.find("w:body", NS)
        removed = 0
        changed = 0
        for paragraph in list(body.findall("w:p", NS)):
            text = paragraph_text(paragraph)
            if text and should_remove(text):
                body.remove(paragraph)
                removed += 1
            elif replace_text(paragraph):
                changed += 1

        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
            temp_path = Path(tmp.name)
        with zipfile.ZipFile(temp_path, "w", compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename == "word/document.xml":
                    zout.writestr(item, ET.tostring(root, encoding="utf-8", xml_declaration=True))
                else:
                    zout.writestr(item, zin.read(item.filename))
    temp_path.replace(src)
    print(f"{src}: removed {removed} paragraphs, changed {changed} paragraphs")


def main():
    if len(sys.argv) < 2:
        print("Usage: sanitize-public-docx.py <file.docx> [<file.docx> ...]", file=sys.stderr)
        return 2
    for arg in sys.argv[1:]:
        sanitize_docx(arg)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
