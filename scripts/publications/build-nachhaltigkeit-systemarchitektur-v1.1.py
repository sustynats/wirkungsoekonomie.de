#!/usr/bin/env python3
"""Build the versioned online and PDF editions of the Systemarchitektur paper.

Version 1.0 is deliberately not touched. This builder only creates the v1.1
publication files declared by the document registry.
"""
from __future__ import annotations

import html
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / os.environ.get("WOEK_PUBLICATION_SOURCE", "source-assets/originals/nachhaltigkeit-systemarchitektur-v1.1.md")
ONLINE = ROOT / os.environ.get("WOEK_PUBLICATION_ONLINE", "content/documents/online/nachhaltigkeit-systemarchitektur-v1.1.inc")
PDF = ROOT / os.environ.get("WOEK_PUBLICATION_PDF", "public/downloads/originals/Nachhaltigkeit-Systemarchitektur-v1.1.pdf")
TITLE = os.environ.get("WOEK_PUBLICATION_TITLE", "Nachhaltigkeit ist keine Strategie. Sie ist eine Systemarchitektur.")
EDITION = os.environ.get("WOEK_PUBLICATION_EDITION", "Version 1.1 · Stand 30. Juli 2026 · Working Paper")
SHOW_TITLE = os.environ.get("WOEK_PUBLICATION_SHOW_TITLE", "").strip().lower() in {"1", "true", "yes"}


def inline(value: str) -> str:
    escaped = html.escape(value)
    escaped = escaped.replace("`", "")
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", escaped)
    escaped = re.sub(r"\*(.+?)\*", r"<i>\1</i>", escaped)
    return escaped


def blocks(markdown: str):
    lines = markdown.replace("\r\n", "\n").split("\n")
    current: list[str] = []
    index = 0
    while index < len(lines):
        line = lines[index]
        if line.strip() == "---":
            if current:
                yield ("paragraph", " ".join(current).strip())
                current = []
            index += 1
            continue
        if line.strip().startswith("|"):
            if current:
                yield ("paragraph", " ".join(current).strip())
                current = []
            table_lines = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                table_lines.append(lines[index].strip())
                index += 1
            if len(table_lines) >= 2 and re.match(r"^\|?\s*:?-{3,}", table_lines[1]):
                def cells(value: str) -> list[str]:
                    return [cell.strip() for cell in value.strip().strip("|").split("|")]
                yield ("table", (cells(table_lines[0]), [cells(row) for row in table_lines[2:]]))
            else:
                yield ("paragraph", " ".join(table_lines))
            continue
        if not line.strip():
            if current:
                yield ("paragraph", " ".join(current).strip())
                current = []
            index += 1
            continue
        heading = re.match(r"^(#{1,4})\s+(.+)$", line)
        if heading:
            if current:
                yield ("paragraph", " ".join(current).strip())
                current = []
            yield (f"h{len(heading.group(1))}", heading.group(2).strip())
            index += 1
            continue
        if line.startswith("> "):
            if current:
                yield ("paragraph", " ".join(current).strip())
                current = []
            yield ("quote", line[2:].strip())
            index += 1
            continue
        if re.match(r"^[-*]\s+", line):
            if current:
                yield ("paragraph", " ".join(current).strip())
                current = []
            yield ("li", re.sub(r"^[-*]\s+", "", line).strip())
            index += 1
            continue
        current.append(line.strip())
        index += 1
    if current:
        yield ("paragraph", " ".join(current).strip())


def slug(value: str) -> str:
    value = value.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-") or "abschnitt"


def build_html(items) -> str:
    output = []
    used: dict[str, int] = {}
    for kind, value in items:
        if kind.startswith("h"):
            level = min(max(int(kind[1:]), 2), 4)
            ident = slug(value)
            used[ident] = used.get(ident, 0) + 1
            if used[ident] > 1:
                ident = f"{ident}-{used[ident]}"
            output.append(f'<h{level} id="{ident}">{inline(value)}</h{level}>')
        elif kind == "quote":
            output.append(f"<blockquote><p>{inline(value)}</p></blockquote>")
        elif kind == "li":
            output.append(f"<ul><li>{inline(value)}</li></ul>")
        elif kind == "table":
            headers, rows = value
            head = "".join(f"<th scope=\"col\">{inline(cell)}</th>" for cell in headers)
            body = "".join(
                "<tr>" + "".join(f"<td>{inline(cell)}</td>" for cell in row) + "</tr>"
                for row in rows
            )
            output.append(f'<div class="table-scroll"><table class="data-table"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>')
        else:
            output.append(f"<p>{inline(value)}</p>")
    return "\n".join(output) + "\n"


def build_pdf(items) -> None:
    body = build_html(items)
    title_block = f"<h1>{html.escape(TITLE)}</h1>" if SHOW_TITLE else ""
    document = f'''<!doctype html><html><head><meta charset="utf-8"><title>{html.escape(TITLE)}</title><style>@page {{ size: A4; margin: 18mm; }} body {{ color:#20242a; font-family:Arial,sans-serif; font-size:10pt; line-height:1.45; }} h1 {{ color:#081126; font-family:Georgia,serif; font-size:29pt; line-height:1.08; margin:0 0 7pt; }} h2 {{ color:#081126; font-family:Georgia,serif; font-size:21pt; line-height:1.15; margin:17pt 0 8pt; }} h3 {{ color:#1f6b4f; font-size:14pt; margin:15pt 0 6pt; }} h4 {{ color:#081126; font-size:11pt; margin:11pt 0 4pt; }} p {{ margin:0 0 7pt; }} blockquote {{ background:#f3f6ef; border-left:3px solid #b6903d; color:#1f6b4f; font-weight:bold; margin:9pt 8mm; padding:7pt; }} ul {{ margin:0 0 6pt 14pt; }} table {{ width:100%; border-collapse:collapse; font-size:8.2pt; margin:8pt 0; }} th {{ background:#081126; color:#fff; text-align:left; }} th, td {{ border:0.5pt solid #b8c0c8; padding:4pt; vertical-align:top; }} tr:nth-child(even) {{ background:#f3f6ef; }}</style></head><body>{title_block}<p><strong>{html.escape(EDITION)}</strong></p>{body}</body></html>'''
    soffice = Path("/Applications/LibreOffice.app/Contents/MacOS/soffice")
    if not soffice.exists():
        raise RuntimeError("LibreOffice ist für den PDF-Export nicht verfügbar.")
    PDF.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="woek-systemarchitektur-") as temp:
        temp_path = Path(temp)
        html_path = temp_path / "Nachhaltigkeit-Systemarchitektur-v1.1.html"
        html_path.write_text(document, encoding="utf-8")
        subprocess.run([str(soffice), "--headless", "--convert-to", "pdf", "--outdir", str(temp_path), str(html_path)], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        exported = temp_path / "Nachhaltigkeit-Systemarchitektur-v1.1.pdf"
        if not exported.exists():
            raise RuntimeError("LibreOffice hat keine PDF-Datei erzeugt.")
        shutil.copyfile(exported, PDF)


def main() -> None:
    items = list(blocks(SOURCE.read_text(encoding="utf-8")))
    ONLINE.parent.mkdir(parents=True, exist_ok=True)
    ONLINE.write_text(build_html(items), encoding="utf-8")
    build_pdf(items)
    print(f"wrote {ONLINE.relative_to(ROOT)}")
    print(f"wrote {PDF.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
