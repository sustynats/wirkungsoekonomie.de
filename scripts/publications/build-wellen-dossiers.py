#!/usr/bin/env python3
"""Build public WÖk dossier artifacts for the Wellen publications.

This script is intentionally narrow: it standardizes the source DOCX files
through the shared WÖk dossier template, exports public PDFs, and creates the
HTML includes consumed by the document-library publication process.
"""

from __future__ import annotations

import html
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph


ROOT = Path(__file__).resolve().parents[2]
APPLY_TEMPLATE = ROOT / "scripts/publications/apply-woek-dossier-template.py"


@dataclass(frozen=True)
class Publication:
    slug: str
    source: Path
    output_docx: Path
    output_pdf: Path
    online_include: Path
    title: str
    subtitle: str
    start_heading: str
    status_label: str
    publication_note: str
    intro_note: str
    source_note: str = ""


PUBLICATIONS = [
    Publication(
        slug="fuenf-wellen-oeffentlicher-wirkung",
        source=Path("/Users/hagen/Downloads/Fuenf_Wellen_oeffentlicher_Wirkung_WOeK_Dossier_Arbeitsfassung.docx"),
        output_docx=ROOT / "assets/downloads/woek_dossier_fuenf_wellen_oeffentlicher_wirkung_v0_1.docx",
        output_pdf=ROOT / "assets/downloads/woek_dossier_fuenf_wellen_oeffentlicher_wirkung_v0_1.pdf",
        online_include=ROOT / "content/documents/online/fuenf-wellen-oeffentlicher-wirkung.inc",
        title="Die fünf Wellen öffentlicher Wirkung",
        subtitle="Das wirkungsökonomische Modell öffentlicher Kommunikation und Debattenführung.",
        start_heading="Impressum und Arbeitsstatus",
        status_label="Dossier · Arbeitsfassung v0.1 · Stand: Juni 2026",
        publication_note=(
            "Dieses Dossier ist eine öffentliche Arbeitsfassung. Die bestehende "
            "inhaltliche Reihenfolge bleibt erhalten; standardisiert werden "
            "Layout, Titelblatt, Kopf- und Fußzeilen, Tabellenoptik und "
            "typografische Konsistenz im WÖk-Dossier-Design."
        ),
        intro_note=(
            "Das Dossier übersetzt das Wellen-Tiefen-Modell in öffentliche "
            "Kommunikation, Debattenkarten, Resonanzräume und demokratische "
            "Schutzlinien."
        ),
        source_note=(
            "Die ältere 100-Seiten-Datei vom Desktop wird als Roh- bzw. "
            "Vorvariante derselben Veröffentlichung eingeordnet; die öffentliche "
            "Fassung nutzt die neuere WÖk-Layout-Datei aus Downloads."
        ),
    ),
    Publication(
        slug="fuenf-wellen-wirkungsentfaltung",
        source=Path("/Users/hagen/Downloads/Dossier_Die_fuenf_Wellen_der_Wirkungsentfaltung_WOeK_Arbeitsfassung.docx"),
        output_docx=ROOT / "assets/downloads/woek_dossier_fuenf_wellen_wirkungsentfaltung_v0_1.docx",
        output_pdf=ROOT / "assets/downloads/woek_dossier_fuenf_wellen_wirkungsentfaltung_v0_1.pdf",
        online_include=ROOT / "content/documents/online/fuenf-wellen-wirkungsentfaltung.inc",
        title="Die fünf Wellen der Wirkungsentfaltung",
        subtitle="Das Wellen-Tiefen-Modell als allgemeines wirkungsökonomisches Grundmuster.",
        start_heading="Hinweis zur Arbeitsfassung",
        status_label="Dossier · Arbeitsfassung v0.1 · Stand: Juni 2026",
        publication_note=(
            "Dieses Dossier ist eine öffentliche Arbeitsfassung. Die bestehende "
            "inhaltliche Reihenfolge bleibt erhalten; standardisiert werden "
            "Layout, Titelblatt, Kopf- und Fußzeilen, Tabellenoptik und "
            "typografische Konsistenz im WÖk-Dossier-Design."
        ),
        intro_note=(
            "Das Dossier verallgemeinert die Wellen-Tiefen-Logik über öffentliche "
            "Kommunikation hinaus und macht sie als Grundmuster für Produkte, "
            "Märkte, Kapital, Politik, Institutionen und gesellschaftliche "
            "Resilienz nutzbar."
        ),
    ),
]


def escape(value: str) -> str:
    return html.escape(value or "", quote=True)


def iter_block_items(document: Document):
    body = document.element.body
    for child in body.iterchildren():
        if child.tag.endswith("}p"):
            yield Paragraph(child, document)
        elif child.tag.endswith("}tbl"):
            yield Table(child, document)


def paragraph_text(paragraph: Paragraph) -> str:
    return " ".join(paragraph.text.split())


def row_text(row) -> list[str]:
    return [" ".join(cell.text.split()) for cell in row.cells]


def render_table(table: Table) -> str:
    rows = [row_text(row) for row in table.rows]
    rows = [row for row in rows if any(cell for cell in row)]
    if not rows:
        return ""
    max_cols = max(len(row) for row in rows)
    normalized = [row + [""] * (max_cols - len(row)) for row in rows]
    if max_cols == 1:
        text = " ".join(row[0] for row in normalized if row[0]).strip()
        if not text:
            return ""
        if text.lower().startswith("merksatz:"):
            return f'<div class="callout"><strong>Merksatz:</strong> {escape(text.split(":", 1)[1].strip())}</div>'
        return f'<div class="callout">{escape(text)}</div>'
    head = normalized[0]
    body = normalized[1:] if len(normalized) > 1 else []
    head_html = "".join(f"<th>{escape(cell)}</th>" for cell in head)
    body_html = "".join(
        "<tr>" + "".join(f"<td>{escape(cell)}</td>" for cell in row) + "</tr>"
        for row in body
    )
    return (
        '<div class="table-scroll"><table class="data-table">'
        f"<thead><tr>{head_html}</tr></thead><tbody>{body_html}</tbody>"
        "</table></div>"
    )


def heading_level(style_name: str) -> int | None:
    style = style_name.lower()
    match = re.match(r"heading\s+(\d+)", style)
    if match:
        return min(int(match.group(1)) + 1, 4)
    if style in {"title", "woek title", "wök title"}:
        return 2
    if style in {"subtitle"}:
        return 3
    return None


def is_bullet(paragraph: Paragraph, text: str, style_name: str) -> bool:
    style = style_name.lower()
    return (
        "bullet" in style
        or "list bullet" in style
        or text.startswith(("• ", "- ", "– "))
    )


def render_paragraph(paragraph: Paragraph) -> tuple[str, str | None]:
    text = paragraph_text(paragraph)
    if not text:
        return "", None
    style_name = paragraph.style.name if paragraph.style else ""
    if style_name.lower() in {"woek tag", "wök tag"} and text.upper() == text:
        return "", None
    if is_bullet(paragraph, text, style_name):
        return re.sub(r"^[•\-–]\s*", "", text).strip(), "bullet"
    level = heading_level(style_name)
    if level:
        return f"<h{level}>{escape(text)}</h{level}>", None
    if style_name.lower() in {"quote", "intense quote"}:
        return f"<blockquote>{escape(text)}</blockquote>", None
    if style_name.lower() in {"woek lead", "wök lead"}:
        return f'<p class="card-text"><strong>{escape(text)}</strong></p>', None
    return f"<p>{escape(text)}</p>", None


def render_online_include(publication: Publication) -> str:
    document = Document(str(publication.source))
    blocks = list(iter_block_items(document))
    start = 0
    for index, block in enumerate(blocks):
        if isinstance(block, Paragraph) and paragraph_text(block) == publication.start_heading:
            start = index
            break

    parts = [
        '<div class="callout">',
        f"  <strong>Dokumentstatus:</strong> {escape(publication.status_label)}. "
        "Modellhafte Veröffentlichung der Wirkungsökonomie; keine amtliche "
        "Bewertung, keine Personenbewertung und keine automatische Entscheidung.",
        "</div>",
        f'<p class="card-text"><strong>Einordnung:</strong> {escape(publication.intro_note)}</p>',
    ]
    if publication.source_note:
        parts.append(
            f'<div class="callout"><strong>Quellenstand:</strong> {escape(publication.source_note)}</div>'
        )

    list_items: list[str] = []

    def flush_list() -> None:
        nonlocal list_items
        if list_items:
            parts.append("<ul>" + "".join(f"<li>{escape(item)}</li>" for item in list_items) + "</ul>")
            list_items = []

    for block in blocks[start:]:
        if isinstance(block, Table):
            flush_list()
            table_html = render_table(block)
            if table_html:
                parts.append(table_html)
            continue

        rendered, kind = render_paragraph(block)
        if kind == "bullet":
            if rendered:
                list_items.append(rendered)
            continue
        flush_list()
        if rendered:
            parts.append(rendered)

    flush_list()
    return "\n".join(parts) + "\n"


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=ROOT, check=True)


def apply_template(publication: Publication) -> None:
    publication.output_docx.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            sys.executable,
            str(APPLY_TEMPLATE),
            str(publication.source),
            str(publication.output_docx),
            "--document-type",
            "Dossier",
            "--title",
            publication.title,
            "--subtitle",
            publication.subtitle,
            "--version",
            "v0.1",
            "--fassung",
            "Arbeitsfassung",
            "--stand",
            "Juni 2026",
            "--kurztitel",
            publication.title,
            "--geltung",
            "Öffentliche Dossierfassung",
            "--publication-note",
            publication.publication_note,
            "--start-heading",
            publication.start_heading,
        ]
    )


def convert_pdf(publication: Publication) -> None:
    if publication.output_pdf.exists():
        publication.output_pdf.unlink()
    run(
        [
            os.environ.get("SOFFICE_BIN", "soffice"),
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            str(publication.output_docx.parent),
            str(publication.output_docx),
        ]
    )
    if not publication.output_pdf.exists():
        raise FileNotFoundError(f"PDF export failed: {publication.output_pdf}")


def build(publication: Publication) -> None:
    if not publication.source.exists():
        raise FileNotFoundError(publication.source)
    apply_template(publication)
    convert_pdf(publication)
    publication.online_include.parent.mkdir(parents=True, exist_ok=True)
    publication.online_include.write_text(render_online_include(publication), encoding="utf-8")
    print(f"Built {publication.slug}")


def main() -> int:
    for publication in PUBLICATIONS:
        build(publication)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
