#!/usr/bin/env python3
from __future__ import annotations

import html
import re
import shutil
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DOCX_CANDIDATES = [
    Path("/Users/hagen/Desktop/WÖk-Konzepte etc/Kerndokumente/Nachhaltigkeit-Systemarchitektur.docx"),
]
PDF_CANDIDATES = [
    Path("/Users/hagen/Desktop/WÖk-Konzepte etc/Kerndokumente/Nachhaltigkeit-Systemarchitektur.pdf"),
    Path("/Users/hagen/Desktop/WÖk-Konzepte etc/Kerndokumente/Buch Neuauflage/Nachhaltigkeit-Systemarchitektur.pdf"),
]
MARKDOWN = ROOT / "source-assets/originals/nachhaltigkeit-systemarchitektur.md"
ONLINE = ROOT / "content/documents/online/nachhaltigkeit-systemarchitektur.inc"
PUBLIC_PDF = ROOT / "public/downloads/originals/Nachhaltigkeit-Systemarchitektur.pdf"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def first_existing(paths: list[Path]) -> Path:
    for path in paths:
        if path.exists():
            return path
    raise FileNotFoundError("Keine Quelldatei gefunden.")


def slugify(value: str) -> str:
    value = value.lower()
    for src, target in {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"}.items():
        value = value.replace(src, target)
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-") or "abschnitt"


def is_heading(text: str, index: int) -> int:
    stripped = text.strip()
    if index == 0:
        return 2
    if index == 1:
        return 3
    if stripped in {"Einleitung und Problemthese", "Fazit"}:
        return 2
    if re.match(r"^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s+", stripped):
        return 2
    if len(stripped) <= 95 and not stripped.endswith(".") and not stripped.endswith(":"):
        return 3
    return 0


def clean_text(value: str) -> str:
    replacements = {
        "\u00a0": " ",
        "\u2011": "-",
        "\ufb01": "fi",
        "\ufb02": "fl",
    }
    for src, target in replacements.items():
        value = value.replace(src, target)
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"([.!?])([A-ZÄÖÜ])", r"\1 \2", value)
    return value


def docx_paragraphs(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    paragraphs: list[str] = []
    for paragraph in root.findall(".//w:body/w:p", NS):
        parts = []
        for node in paragraph.findall(".//w:t", NS):
            if node.text:
                parts.append(node.text)
        text = clean_text("".join(parts))
        if text:
            paragraphs.append(text)
    return paragraphs


def build_markdown(paragraphs: list[str]) -> str:
    lines = []
    for index, text in enumerate(paragraphs):
        level = is_heading(text, index)
        if level:
            lines.append(f"{'#' * level} {text}")
        else:
            lines.append(text)
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def inline_html(value: str) -> str:
    return html.escape(value)


def build_html(markdown: str) -> str:
    used: dict[str, int] = {}
    output = []
    for block in re.split(r"\n{2,}", markdown.strip()):
        block = block.strip()
        if not block:
            continue
        heading = re.match(r"^(#{2,4})\s+(.+)$", block)
        if heading:
            level = len(heading.group(1))
            text = heading.group(2).strip()
            ident = slugify(text)
            used[ident] = used.get(ident, 0) + 1
            if used[ident] > 1:
                ident = f"{ident}-{used[ident]}"
            output.append(f'<h{level} id="{ident}">{inline_html(text)}</h{level}>')
        else:
            output.append(f"<p>{inline_html(block)}</p>")
    return "\n".join(output) + "\n"


def main() -> None:
    docx = first_existing(DOCX_CANDIDATES)
    pdf = first_existing(PDF_CANDIDATES)
    paragraphs = docx_paragraphs(docx)
    markdown = build_markdown(paragraphs)

    MARKDOWN.parent.mkdir(parents=True, exist_ok=True)
    ONLINE.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_PDF.parent.mkdir(parents=True, exist_ok=True)

    MARKDOWN.write_text(markdown, encoding="utf-8")
    ONLINE.write_text(build_html(markdown), encoding="utf-8")
    shutil.copyfile(pdf, PUBLIC_PDF)

    print(f"Wrote {MARKDOWN}")
    print(f"Wrote {ONLINE}")
    print(f"Wrote {PUBLIC_PDF}")


if __name__ == "__main__":
    main()
