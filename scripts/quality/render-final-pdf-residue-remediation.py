#!/usr/bin/env python3
"""Render every page changed by the final production-residue remediation."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT.parent / "recovery/final-pdf-residue-visual-20261013"
MANIFEST = OUT / "manifest.json"
REPORTS = [
    ROOT / "reports/consistency-20261009/pdf-visible-production-note-cleanup-pass8-20261013.json",
]
GO3_REPORT = ROOT / "reports/consistency-20261009/pdf-visible-production-note-cleanup-pass7b-20261013.json"
STANDARD_REPORT = ROOT / "reports/consistency-20261009/detail-quality-standard-rebuild-20261013.json"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def render_page(path: Path, page_number: int, target: Path) -> tuple[int, int]:
    with pymupdf.open(path) as document:
        page = document[page_number - 1]
        pixmap = page.get_pixmap(matrix=pymupdf.Matrix(1.7, 1.7), alpha=False)
        pixmap.save(target)
        return pixmap.width, pixmap.height


def make_contacts(records: list[dict]) -> list[dict]:
    contacts = []
    for group_index in range(0, len(records), 10):
        group = records[group_index:group_index + 10]
        thumbs = []
        for record in group:
            image = Image.open(OUT / record["render"]).convert("RGB")
            width = 760
            height = round(image.height * width / image.width)
            image.thumbnail((width, height), Image.Resampling.LANCZOS)
            panel = Image.new("RGB", (800, image.height + 54), "white")
            panel.paste(image, ((800 - image.width) // 2, 36))
            ImageDraw.Draw(panel).text((12, 10), f"{record['path']} · S. {record['page']}", fill="black")
            thumbs.append(panel)
        rows = (len(thumbs) + 1) // 2
        row_heights = [max((thumbs[i].height for i in range(row * 2, min(row * 2 + 2, len(thumbs)))), default=0) for row in range(rows)]
        canvas = Image.new("RGB", (1610, sum(row_heights) + 10 * (rows + 1)), "#dfe5e2")
        y = 10
        for row in range(rows):
            for column in range(2):
                index = row * 2 + column
                if index < len(thumbs):
                    canvas.paste(thumbs[index], (5 + column * 800, y))
            y += row_heights[row] + 10
        filename = f"contact-{group_index // 10 + 1:02d}.jpg"
        canvas.save(OUT / filename, quality=90)
        contacts.append({"path": filename, "records": len(group), "width": canvas.width, "height": canvas.height})
    return contacts


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    records = []
    seen = set()
    for report_path in REPORTS:
        report = json.loads(report_path.read_text(encoding="utf-8"))
        for source in report["files"]:
            path = ROOT / source["path"]
            if sha256(path) != source["afterSha256"]:
                raise RuntimeError(f"Remediation checksum differs: {source['path']}")
            for page_number in source["changedVisualPages"]:
                key = (source["path"], page_number)
                if key in seen:
                    continue
                seen.add(key)
                filename = f"page-{len(records) + 1:03d}.png"
                width, height = render_page(path, page_number, OUT / filename)
                records.append({"path": source["path"], "pdfSha256": sha256(path), "page": page_number, "render": filename, "renderSha256": sha256(OUT / filename), "width": width, "height": height})
    go3 = json.loads(GO3_REPORT.read_text(encoding="utf-8"))
    for source in go3["files"]:
        if not source["path"].startswith("docs/go3-sdg-referenzrahmen-v1/"):
            continue
        path = ROOT / source["path"]
        if sha256(path) != source["afterSha256"]:
            raise RuntimeError(f"GO3 remediation checksum differs: {source['path']}")
        for page_number in source["changedVisualPages"]:
            key = (source["path"], page_number)
            if key in seen:
                continue
            seen.add(key)
            filename = f"page-{len(records) + 1:03d}.png"
            width, height = render_page(path, page_number, OUT / filename)
            records.append({"path": source["path"], "pdfSha256": sha256(path), "page": page_number, "render": filename, "renderSha256": sha256(OUT / filename), "width": width, "height": height})
    standard = json.loads(STANDARD_REPORT.read_text(encoding="utf-8"))
    standard_path = ROOT / standard["output"]
    if sha256(standard_path) != standard["afterSha256"]:
        raise RuntimeError("Quality-standard checksum differs")
    with pymupdf.open(standard_path) as document:
        page_numbers = list(range(1, len(document) + 1))
    for page_number in page_numbers:
        filename = f"page-{len(records) + 1:03d}.png"
        width, height = render_page(standard_path, page_number, OUT / filename)
        records.append({"path": standard["output"], "pdfSha256": sha256(standard_path), "page": page_number, "render": filename, "renderSha256": sha256(OUT / filename), "width": width, "height": height})
    manifest = {"date": "2026-10-13", "status": "AWAITING_VISUAL_REVIEW", "pages": records}
    manifest["contactSheets"] = make_contacts(records)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": manifest["status"], "pages": len(records), "contactSheets": len(manifest["contactSheets"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()
