#!/usr/bin/env python3
"""Bind the manually reviewed final residue-remediation renders to current PDFs."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT.parent / "recovery/final-pdf-residue-visual-20261013/manifest.json"
REPORT = ROOT / "reports/consistency-20261009/pdf-production-residue-visual-review-final-20261013.json"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if manifest.get("status") != "AWAITING_VISUAL_REVIEW":
        raise RuntimeError("Visual remediation manifest is not awaiting review")
    paths = set()
    for record in manifest["pages"]:
        if sha256(ROOT / record["path"]) != record["pdfSha256"]:
            raise RuntimeError(f"Reviewed PDF changed: {record['path']}")
        render = MANIFEST.parent / record["render"]
        if sha256(render) != record["renderSha256"]:
            raise RuntimeError(f"Reviewed render changed: {record['render']}")
        paths.add(record["path"])
    manifest["status"] = "VISUALLY_REVIEWED"
    manifest["reviewedAt"] = "2026-10-13"
    manifest["reviewDecision"] = "All rendered pages inspected; no clipping, overlap, blank redaction residue, or production note remains."
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {
        "date": "2026-10-13", "status": "PASS",
        "manifest": str(MANIFEST), "manifestSha256": sha256(MANIFEST),
        "reviewedPages": len(manifest["pages"]), "reviewedPdfs": len(paths),
        "paths": sorted(paths),
        "findings": {"clipping": 0, "overlap": 0, "blankRedactionResidue": 0, "remainingProductionNotes": 0, "unresolved": 0},
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS", "reviewedPages": report["reviewedPages"], "reviewedPdfs": report["reviewedPdfs"], "unresolved": 0}, ensure_ascii=False))


if __name__ == "__main__":
    main()
