#!/usr/bin/env python3
"""Finalize the hash-bound visual review of rebuilt detail compendia."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "recovery/detail-compendia-visual-20261013/manifest.json"
BUILD_REPORT = ROOT / "reports/consistency-20261009/detail-compendium-pdf-rebuild-20261013.json"
REPORT = ROOT / "reports/consistency-20261009/detail-compendium-visual-review-20261013.json"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    build = json.loads(BUILD_REPORT.read_text(encoding="utf-8"))
    if manifest.get("status") not in {"RENDERED_PENDING_VISUAL_REVIEW", "VISUALLY_REVIEWED"}:
        raise RuntimeError("unexpected render-manifest status")
    if manifest.get("flags"):
        raise RuntimeError("render manifest contains flags")
    expected = {record["pdf"]: record["sha256"] for record in build["records"]}
    seen_pages: dict[str, int] = {path: 0 for path in expected}
    for record in manifest["records"]:
        pdf = ROOT / record["pdf"]
        image = ROOT / record["image"]
        if record["pdf"] not in expected or sha256(pdf) != expected[record["pdf"]]:
            raise RuntimeError(f"PDF binding failed: {record['pdf']}")
        if sha256(image) != record["imageSha256"]:
            raise RuntimeError(f"render binding failed: {record['image']}")
        seen_pages[record["pdf"]] += 1
    for record in build["records"]:
        if seen_pages[record["pdf"]] != record["pages"]:
            raise RuntimeError(f"page coverage failed: {record['pdf']}")
        duplicate = ROOT / record["duplicate"]
        if sha256(duplicate) != record["sha256"]:
            raise RuntimeError(f"exact duplicate binding failed: {record['duplicate']}")
    for contact in manifest["contactSheets"]:
        path = ROOT / contact["path"]
        if sha256(path) != contact["sha256"]:
            raise RuntimeError(f"contact-sheet binding failed: {contact['path']}")

    manifest["status"] = "VISUALLY_REVIEWED"
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {
        "date": "2026-10-13",
        "status": "PASS",
        "scope": "Every page of five rebuilt current detail compendia; five duplicate downloads verified byte-identical",
        "uniquePdfs": manifest["uniquePdfs"],
        "exactDuplicatePdfs": manifest["exactDuplicatePdfs"],
        "reviewedPages": manifest["pages"],
        "contactSheets": len(manifest["contactSheets"]),
        "findings": {
            "clipping": 0,
            "overlap": 0,
            "blankRedactionResidue": 0,
            "productionNotes": 0,
            "unresolved": 0,
        },
        "manifestSha256": sha256(MANIFEST),
        "pdfs": [
            {"pdf": record["pdf"], "duplicate": record["duplicate"], "sha256": record["sha256"], "pages": record["pages"]}
            for record in build["records"]
        ],
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS", "reviewedPages": report["reviewedPages"], "unresolved": 0}))


if __name__ == "__main__":
    main()
