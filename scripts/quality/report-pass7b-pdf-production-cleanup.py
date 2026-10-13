#!/usr/bin/env python3
"""Bind the seven source-tree PDF cleanups interrupted before report emission."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

import pymupdf


ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / "reports/consistency-20261009/pdf-visible-production-note-cleanup-pass7b-20261013.json"
ARCHIVE = ROOT.parent / "recovery/private-pdf-originals-20261013/source-tree-production-notes"
PATHS = [
    "content/governance/woek-language-rules.pdf",
    "docs/gesetze/WStG_2.0_Wirkungssteuerrahmengesetz_Entwurf.pdf",
    "docs/gesetze/WUStG_Technische_Leitlinien_v2.1_Entwurf.pdf",
    "docs/go3-sdg-referenzrahmen-v1/source/pdf/01_woek_sdgs_agenda2030_referenzrahmen_detailkonzept_v1_0.pdf",
    "docs/go3-sdg-referenzrahmen-v1/source/pdf/02_woek_sdgplus_erweiterung_detailkonzept_v1_0.pdf",
    "docs/go3-sdg-referenzrahmen-v1/source/pdf/03_woek_sdg_unterziele_global_europa_deutschland_detailkonzept_v1_0.pdf",
    "docs/grundlagen/Historische_Dokumente_Hinweis_v1.1.pdf",
]
PRODUCTION = re.compile(
    r"Website|Portalintegration|Online-Volltext|Datenordner|Arbeitsfassung|"
    r"WÖk-Produktionsprozess|Markdown-Quellen werden nicht",
    re.IGNORECASE,
)


def sha(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def page_hashes(value: bytes) -> list[str]:
    with pymupdf.open(stream=value, filetype="pdf") as document:
        return [hashlib.sha256(page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False).samples).hexdigest() for page in document]


def main() -> None:
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    records = []
    for relative in PATHS:
        before = subprocess.check_output(["git", "show", f"HEAD:{relative}"], cwd=ROOT)
        after = (ROOT / relative).read_bytes()
        before_pages = page_hashes(before)
        after_pages = page_hashes(after)
        if len(before_pages) != len(after_pages):
            raise RuntimeError(f"Page count changed unexpectedly: {relative}")
        changed = [index + 1 for index, pair in enumerate(zip(before_pages, after_pages)) if pair[0] != pair[1]]
        removed = []
        with pymupdf.open(stream=before, filetype="pdf") as old, pymupdf.open(stream=after, filetype="pdf") as new:
            new_text = "\n".join(page.get_text() for page in new)
            for page_number, page in enumerate(old, 1):
                for block in page.get_text("blocks"):
                    text = " ".join(block[4].split())
                    if PRODUCTION.search(text) and text not in new_text:
                        removed.append({"page": page_number, "text": text[:600]})
        if not removed or not changed:
            raise RuntimeError(f"Cleanup evidence incomplete: {relative}")
        archive = ARCHIVE / relative.replace("/", "__")
        if not archive.exists():
            archive.write_bytes(before)
        records.append({
            "path": relative, "beforeSha256": sha(before), "afterSha256": sha(after),
            "pages": len(after_pages), "changedVisualPages": changed,
            "removedBlocks": removed, "historicalOriginal": str(archive),
        })
    report = {
        "date": "2026-10-13", "status": "PASS", "files": records,
        "totals": {
            "files": len(records), "pages": sum(record["pages"] for record in records),
            "changedVisualPages": sum(len(record["changedVisualPages"]) for record in records),
            "removedBlocks": sum(len(record["removedBlocks"]) for record in records),
        },
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS", **report["totals"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
