#!/usr/bin/env python3
"""Create a public, lossless web source from an approved DOCX analysis.

The DOCX itself remains an original download. This importer creates an
accessible web representation of every paragraph, list, table and embedded
figure in document order. It deliberately has no summarisation path.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from io import BytesIO
from pathlib import Path

from docx import Document
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import Table
from docx.text.paragraph import Paragraph
from PIL import Image


FORBIDDEN_PUBLIC_TRACE = re.compile(r"(?:file:|/Users/|/private/|C:\\Users\\)", re.IGNORECASE)


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def slug(value: str) -> str:
    normalized = value.lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    return normalized.strip("-") or "abschnitt"


def heading_depth(style_name: str) -> int | None:
    match = re.search(r"Heading\s+(\d+)", style_name, re.IGNORECASE)
    if not match:
        return None
    return 2 if match.group(1) == "1" else 3


def figure_relation_ids(paragraph: Paragraph) -> list[str]:
    return re.findall(r'<a:blip[^>]*r:embed="([^"]+)"', paragraph._p.xml)


def write_figure(blob: bytes, destination: Path) -> None:
    with Image.open(BytesIO(blob)) as source:
        # A fresh RGB/RGBA image intentionally drops source metadata.
        image = source.convert("RGBA") if source.mode == "RGBA" else source.convert("RGB")
        image.save(destination, "PNG", optimize=True)


def is_non_public_front_matter(text: str) -> bool:
    return text in {
        "Autorin und methodischer Bezugsrahmen",
        "Arbeitsstand zur fachlichen Veröffentlichung",
    } or text.startswith("Natalie Weber")


def parse_document(source: Path, public_asset_directory: Path, public_asset_prefix: str) -> dict:
    document = Document(source)
    public_asset_directory.mkdir(parents=True, exist_ok=True)
    blocks: list[dict] = []
    used_ids: dict[str, int] = {}
    figure_counter = 0
    pending_figure: dict | None = None

    def unique_heading_id(text: str) -> str:
        base = slug(text)
        used_ids[base] = used_ids.get(base, 0) + 1
        return base if used_ids[base] == 1 else f"{base}-{used_ids[base]}"

    def append_block(block: dict) -> None:
        nonlocal pending_figure
        if block["kind"] != "figure":
            pending_figure = None
        blocks.append(block)

    for child in document.element.body.iterchildren():
        if isinstance(child, CT_P):
            paragraph = Paragraph(child, document)
            text = clean(paragraph.text)
            figure_ids = figure_relation_ids(paragraph)
            for relationship_id in figure_ids:
                relation = document.part.rels.get(relationship_id)
                if relation is None:
                    continue
                figure_counter += 1
                filename = f"figure-{figure_counter}.png"
                write_figure(relation.target_part.blob, public_asset_directory / filename)
                figure = {
                    "kind": "figure",
                    "src": f"{public_asset_prefix}/{filename}",
                    "alt": "Abbildung aus der vollständigen Fachanalyse",
                }
                blocks.append(figure)
                pending_figure = figure
            if not text or is_non_public_front_matter(text):
                continue
            if pending_figure and re.match(r"^Abbildung\s+\d+:", text):
                pending_figure["caption"] = text
                pending_figure["alt"] = text
                pending_figure = None
                continue
            depth = heading_depth(paragraph.style.name)
            if depth:
                append_block({"kind": "heading", "depth": depth, "text": text, "id": unique_heading_id(text)})
                continue
            ordered = "List Number" in paragraph.style.name
            unordered = "List Bullet" in paragraph.style.name
            if ordered or unordered:
                if blocks and blocks[-1].get("kind") == "list" and blocks[-1].get("ordered") == ordered:
                    blocks[-1]["items"].append(text)
                else:
                    append_block({"kind": "list", "ordered": ordered, "items": [text]})
                continue
            append_block({"kind": "paragraph", "text": text})
        elif isinstance(child, CT_Tbl):
            table = Table(child, document)
            rows = [[clean(cell.text) for cell in row.cells] for row in table.rows]
            rows = [row for row in rows if any(row)]
            if not rows:
                continue
            headers, body = rows[0], rows[1:]
            append_block({"kind": "table", "headers": headers, "rows": body})

    public_text = json.dumps(blocks, ensure_ascii=False, sort_keys=True)
    if FORBIDDEN_PUBLIC_TRACE.search(public_text):
        raise ValueError("The source contains a local or file-system trace and cannot be published.")
    source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
    content_hash = hashlib.sha256(public_text.encode("utf-8")).hexdigest()
    return {
        "sourceDocumentHash": source_hash,
        "sourceHash": content_hash,
        "blocks": blocks,
        "blockCounts": {
            "paragraphs": sum(block["kind"] == "paragraph" for block in blocks),
            "headings": sum(block["kind"] == "heading" for block in blocks),
            "lists": sum(block["kind"] == "list" for block in blocks),
            "tables": sum(block["kind"] == "table" for block in blocks),
            "figures": sum(block["kind"] == "figure" for block in blocks),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("--output", required=True)
    parser.add_argument("--asset-dir", required=True)
    parser.add_argument("--asset-prefix", required=True)
    args = parser.parse_args()
    result = parse_document(Path(args.source), Path(args.asset_dir), args.asset_prefix.rstrip("/"))
    destination = Path(args.output)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(destination), **result["blockCounts"], "sourceHash": result["sourceHash"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
