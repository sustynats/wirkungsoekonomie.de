#!/usr/bin/env python3
"""Bind the six journal metadata corrections to all 71 rendered pages."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pymupdf


ROOT = Path(__file__).resolve().parents[2]
CORRECTIONS = ROOT / "reports/consistency-20261009/pdf-metadata-corrections-20261013.json"
INVENTORY = ROOT / "reports/consistency-20261009/pdf-publishing-metadata-final-20261013.json"
VISUAL_MANIFEST = ROOT / "recovery/final-pdf-production-visual-pre-detail-20261013/manifest.json"
VISUAL_REPORT = ROOT / "reports/consistency-20261009/pdf-production-cleanup-visual-review.json"
OUTPUT = ROOT / "reports/consistency-20261009/journal-metadata-pixel-proof-20261013.json"
ARCHIVE_ROOT = ROOT / "source-assets/originals/journal-metadata-20261013"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pixel_hashes(path: Path) -> list[str]:
    with pymupdf.open(path) as document:
        return [hashlib.sha256(page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False).samples).hexdigest() for page in document]


def main() -> None:
    corrections = json.loads(CORRECTIONS.read_text(encoding="utf-8"))
    corrected = [record for record in corrections["records"] if record.get("corrected")]
    if len(corrected) != 6 or sum(record["pages"] for record in corrected) != 71:
        raise RuntimeError("Expected six metadata corrections over 71 pages")
    inventory = {record["path"]: record for record in json.loads(INVENTORY.read_text(encoding="utf-8"))["records"]}
    visual_manifest = json.loads(VISUAL_MANIFEST.read_text(encoding="utf-8"))
    visual_report = json.loads(VISUAL_REPORT.read_text(encoding="utf-8"))
    if visual_report.get("status") != "PASS":
        raise RuntimeError("Bound visual review is incomplete")
    files = []
    for record in corrected:
        source = ROOT / record["path"]
        archive = ARCHIVE_ROOT / source.name
        if sha256(archive) != record["beforeSha256"]:
            raise RuntimeError(f"Historical metadata predecessor changed: {archive}")
        if inventory[record["path"]]["beforeSha256"] != sha256(source):
            raise RuntimeError(f"Current PDF differs from final metadata inventory: {source}")
        original_pixels = pixel_hashes(archive)
        current_pixels = pixel_hashes(source)
        changed = [index + 1 for index, pair in enumerate(zip(original_pixels, current_pixels)) if pair[0] != pair[1]]
        additional_review = []
        if changed:
            if source.name != "aktionsplan-nachhaltigkeit-detailliertes-update-2026-10-05.pdf" or changed != [21]:
                raise RuntimeError(f"Unexpected post-metadata visual change: {source}")
            matches = [entry for entry in visual_manifest["records"] if entry["path"] == record["path"] and entry["page"] == 21]
            if len(matches) != 1 or matches[0]["pdfSha256"] != sha256(source) or sha256(ROOT / matches[0]["png"]) != matches[0]["renderSha256"]:
                raise RuntimeError("Journal heading cleanup lacks bound visual review")
            additional_review = [{"page": 21, "reason": "public editorial heading removed after metadata correction", "visualReview": "PASS", "renderSha256": matches[0]["renderSha256"]}]
        files.append({
            "source": record["path"], "archive": archive.relative_to(ROOT).as_posix(),
            "predecessorSha256": record["beforeSha256"], "metadataOnlyOutputSha256": record["afterSha256"],
            "currentSha256": sha256(source), "pages": record["pages"], "status": "PASS",
            "metadataCorrectionRenderedPagesUnchanged": record.get("renderedPagesUnchanged") is True,
            "identicalPagePixels": [{"page": index + 1, "sha256": value} for index, value in enumerate(original_pixels)],
            "currentAdditionalReviewedVisualPages": additional_review,
        })
    report = {
        "date": "2026-10-13", "status": "PASS",
        "scope": "Six metadata-only correction steps covering 71 pages; one later removal of an editorial heading is separately hash-bound to the complete public PDF visual review.",
        "correctionReport": CORRECTIONS.relative_to(ROOT).as_posix(), "correctionReportSha256": sha256(CORRECTIONS),
        "finalInventory": INVENTORY.relative_to(ROOT).as_posix(), "finalInventorySha256": sha256(INVENTORY),
        "files": files,
        "totals": {"files": len(files), "pages": sum(item["pages"] for item in files), "postMetadataReviewedVisualChanges": sum(len(item["currentAdditionalReviewedVisualPages"]) for item in files)},
    }
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS", **report["totals"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
