#!/usr/bin/env python3
"""Remove the exact Office AI production suffix from a publishing copy.

The source archive is checksum guarded. Figure descriptions, page contents,
geometry, links and historical source dates remain intact. Every page is rendered
before and after; publication is refused if a pixel changes.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
SOURCE_PATH = "public/downloads/originals/NATS_WOeK_allgemein.pdf"
ORIGINAL_PATH = "source-assets/originals/pdf-hidden-metadata-20261011/NATS_WOeK_allgemein.pdf"
SOURCE_SHA = "49e88d8f3dba77d72efb486df06b5f3827b1bf0561e68a38ecbfce65e2751248"
REPORT_PATH = "reports/consistency-20261009/pdf-hidden-alttext-correction.json"
SUFFIX = "KI-generierte Inhalte können fehlerhaft sein."
EXPECTED_COUNT = 45


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def render_hashes(document) -> list[str]:
    return [hashlib.sha256(page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False).samples).hexdigest()
            for page in document]


def main() -> None:
    source, archive, report_path = (ROOT / value for value in (SOURCE_PATH, ORIGINAL_PATH, REPORT_PATH))
    if archive.exists() and digest(archive) != SOURCE_SHA:
        raise RuntimeError("Archived source differs; preserve and review the conflict")
    if digest(source) != SOURCE_SHA:
        # A completed, pixel-verified publishing copy may be replayed. A changed
        # source or an undocumented output must never be silently overwritten.
        if not archive.exists() or not report_path.exists():
            raise RuntimeError("Input differs from the reviewed PDF source")
        report = json.loads(report_path.read_text())
        if report["afterSha256"] != digest(source):
            raise RuntimeError("Publishing PDF differs from the verified correction")
        with pymupdf.open(source) as checked:
            for xref in range(1, checked.xref_length()):
                if SUFFIX in checked.xref_get_key(xref, "Alt")[1]:
                    raise RuntimeError("AI suffix remains in a PDF object")
        print("Verified hidden-alttext publishing copy is unchanged")
        return
    archive.parent.mkdir(parents=True, exist_ok=True)
    if not archive.exists():
        archive.write_bytes(source.read_bytes())
    if digest(archive) != SOURCE_SHA:
        raise RuntimeError("Original archive checksum verification failed")
    doc = pymupdf.open(archive)
    before = render_hashes(doc)
    corrected = []
    for xref in range(1, doc.xref_length()):
        kind, value = doc.xref_get_key(xref, "Alt")
        if kind != "string" or SUFFIX not in value:
            continue
        if value.count(SUFFIX) != 1:
            raise RuntimeError("Unexpected alternate-text source structure")
        description = value.replace(SUFFIX, "").rstrip()
        if not description:
            raise RuntimeError("Do not replace a figure description with an empty text")
        doc.xref_set_key(xref, "Alt", pymupdf.get_pdf_str(description))
        corrected.append({"originalXref": xref, "description": description})
    if len(corrected) != EXPECTED_COUNT:
        raise RuntimeError(f"Reviewed 45 suffixes expected; found {len(corrected)}")
    metadata = doc.metadata
    metadata.update({"author": "Natalie Weber", "creator": "Natalie Weber",
                     "producer": "Natalie Weber", "modDate": "D:20261011000000+02'00'"})
    doc.set_metadata({k: v for k, v in metadata.items() if k in {
        "title", "author", "subject", "keywords", "creator", "producer",
        "creationDate", "modDate", "trapped"}})
    temporary = source.with_name(source.name + ".alttext-correction.tmp")
    doc.save(temporary, garbage=4, deflate=True)
    doc.close()
    with pymupdf.open(temporary) as checked:
        after = render_hashes(checked)
        if before != after:
            raise RuntimeError("Alternate-text correction changed page pixels")
        for xref in range(1, checked.xref_length()):
            if SUFFIX in checked.xref_get_key(xref, "Alt")[1]:
                raise RuntimeError("AI suffix remains in a PDF object")
    temporary.replace(source)
    report = {"date": "2026-10-11", "status": "LOCAL_METADATA_AND_PIXEL_VERIFICATION_COMPLETE",
              "path": SOURCE_PATH, "original": ORIGINAL_PATH, "beforeSha256": SOURCE_SHA,
              "afterSha256": digest(source), "pages": len(before), "renderDpi": 72,
              "renderedPagesUnchanged": True, "changedVisualPages": [],
              "alttextCorrections": corrected,
              "pageRenderHashes": before,
              "description": "Historical presentation; 45 internal Office AI suffixes removed from figure alternate text. Original privately archived; all 60 page renders unchanged."}
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: v for k, v in report.items() if k not in ("alttextCorrections", "pageRenderHashes")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
