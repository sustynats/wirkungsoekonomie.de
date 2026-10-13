#!/usr/bin/env python3
"""Render every page of the five rebuilt detail compendia for visual review."""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
BUILD_REPORT = ROOT / "reports/consistency-20261009/detail-compendium-pdf-rebuild-20261013.json"
OUTPUT = ROOT / "recovery/detail-compendia-visual-20261013"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    report = json.loads(BUILD_REPORT.read_text(encoding="utf-8"))
    if report.get("status") != "PASS":
        raise RuntimeError("detail-compendium build report is not PASS")
    shutil.rmtree(OUTPUT, ignore_errors=True)
    pages_dir = OUTPUT / "pages"
    pages_dir.mkdir(parents=True)
    records = []
    page_number = 0
    for pdf_record in report["records"]:
        path = ROOT / pdf_record["pdf"]
        if sha256(path) != pdf_record["sha256"]:
            raise RuntimeError(f"PDF hash changed after build: {path}")
        with pymupdf.open(path) as document:
            for index, page in enumerate(document):
                page_number += 1
                image_path = pages_dir / f"page-{page_number:04d}.png"
                pixmap = page.get_pixmap(matrix=pymupdf.Matrix(1.35, 1.35), alpha=False)
                pixmap.save(image_path)
                records.append({
                    "ordinal": page_number,
                    "pdf": pdf_record["pdf"],
                    "pdfSha256": pdf_record["sha256"],
                    "page": index + 1,
                    "image": image_path.relative_to(ROOT).as_posix(),
                    "imageSha256": sha256(image_path),
                })

    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 15)
    contacts = []
    for start in range(0, len(records), 25):
        group = records[start:start + 25]
        canvas = Image.new("RGB", (1800, 2500), "white")
        draw = ImageDraw.Draw(canvas)
        for cell, record in enumerate(group):
            row, column = divmod(cell, 5)
            left, top = column * 360, row * 500
            source = Image.open(ROOT / record["image"]).convert("RGB")
            source.thumbnail((338, 458), Image.Resampling.LANCZOS)
            x = left + (360 - source.width) // 2
            y = top + 32 + (458 - source.height) // 2
            canvas.paste(source, (x, y))
            label = f"{record['ordinal']:04d} {Path(record['pdf']).stem[:28]} p{record['page']}"
            draw.text((left + 8, top + 7), label, fill="black", font=font)
        end = group[-1]["ordinal"]
        path = OUTPUT / f"contact-{group[0]['ordinal']:04d}-{end:04d}.jpg"
        canvas.save(path, quality=92, subsampling=0)
        contacts.append({"path": path.relative_to(ROOT).as_posix(), "sha256": sha256(path), "pages": [r["ordinal"] for r in group]})

    manifest = {
        "date": "2026-10-13",
        "status": "RENDERED_PENDING_VISUAL_REVIEW",
        "uniquePdfs": len(report["records"]),
        "exactDuplicatePdfs": len(report["records"]),
        "pages": len(records),
        "records": records,
        "contactSheets": contacts,
        "flags": [],
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": manifest["status"], "pages": len(records), "contactSheets": len(contacts)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
