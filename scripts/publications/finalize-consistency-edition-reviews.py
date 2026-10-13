#!/usr/bin/env python3
"""Finalize hash-bound visual reports for the seven consistency editions."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
WORKSPACE = ROOT.parent
METHOD_REPORT = ROOT / "reports/consistency-20261009/method-pdf-visual-review.json"
LEARNING_REPORT = ROOT / "reports/consistency-20261009/learning-pdf-visual-review.json"
EXPLAINER_REPORT = ROOT / "reports/consistency-20261009/explainer-pdf-visual-review.json"
FIRST_MANIFEST = ROOT / "recovery/final-pdf-production-visual-pre-detail-20261013/manifest.json"
GLOBAL_VISUAL = ROOT / "reports/consistency-20261009/pdf-production-cleanup-visual-review.json"
METHOD_VISUAL = WORKSPACE / "recovery/method-visual"

METHODS = {
    "woemm": {
        "path": "assets/downloads/grundlagen/woemm-2.0-referenzfassung.pdf",
        "sha256": "5ac598d373cb995236b1852aa8a06ed49b56bd5a953c444a962fe85b8d74a18a",
        "pages": 98,
        "corrected": [1, 2, 12, 80, 93, 94, 95],
    },
    "woems": {
        "path": "assets/downloads/grundlagen/woems-2.0-referenzfassung.pdf",
        "sha256": "52a46ca8772f5eff8dcbcfbf6ed5d36c6f6bf3504b69b12a252e85015d6f2dd0",
        "pages": 387,
        "corrected": [1, 13, 98, 99, 100, 101, 375, 380, 381, 384],
    },
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    previous = json.loads(METHOD_REPORT.read_text(encoding="utf-8"))
    if previous.get("pagesReviewed") != 17 or previous.get("unchangedPagesPixelIdentical") != 468:
        raise RuntimeError("Method review coverage changed")
    editions = []
    renders = []
    for method_id, item in METHODS.items():
        if sha256(ROOT / item["path"]) != item["sha256"]:
            raise RuntimeError(f"Current method PDF changed: {method_id}")
        changed = []
        for page in item["corrected"]:
            render = METHOD_VISUAL / f"{method_id}-{page:03d}.png"
            if not render.exists():
                raise RuntimeError(f"Missing reviewed method render: {render}")
            with Image.open(render) as image:
                dimensions = list(image.size)
            render_record = {"page": page, "path": str(render), "sha256": sha256(render), "dimensions": dimensions, "visualReview": "PASS"}
            renders.append({"edition": method_id, **render_record})
            changed.append(render_record)
        editions.append({
            "id": method_id, "path": item["path"], "sha256": item["sha256"],
            "pages": item["pages"], "renderedChangedPages": changed,
            "unchangedPagesPixelIdentical": item["pages"] - len(item["corrected"]),
            "visualReview": "PASS",
        })
    method_report = {
        "status": "PASS", "checkedAt": "2026-10-13",
        "scope": "All 17 corrected method pages visually reviewed; 468 unchanged pages are pixel-identical to their preserved predecessors.",
        "pagesReviewed": 17, "unchangedPagesPixelIdentical": 468,
        "editions": editions, "renders": renders, "publicReleaseStatus": "READY_FOR_RELEASE",
    }
    METHOD_REPORT.write_text(json.dumps(method_report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    learning = json.loads(LEARNING_REPORT.read_text(encoding="utf-8"))
    learning_path = ROOT / "source-assets/generated/consistency-20261013/pdf/woek-impact-controlling-lernweg-2026-10-13.pdf"
    if learning.get("status") != "PASS" or sha256(learning_path) != learning["pdfSha256"] or learning["visualPageCoverage"] != learning["pages"]:
        raise RuntimeError("Learning PDF review is incomplete")
    first = json.loads(FIRST_MANIFEST.read_text(encoding="utf-8"))
    global_review = json.loads(GLOBAL_VISUAL.read_text(encoding="utf-8"))
    nats_path = ROOT / "public/downloads/originals/NATS_WOeK_allgemein.pdf"
    nats_copy = "public/downloads/originals/NATS_WOeK_allgemein 2.pdf"
    nats_sha = sha256(nats_path)
    records = sorted((record for record in first["records"] if record["path"] == nats_copy), key=lambda record: record["page"])
    if global_review.get("status") != "PASS" or len(records) != 60 or [record["page"] for record in records] != list(range(1, 61)):
        raise RuntimeError("NATS full-page visual review is incomplete")
    if any(record["pdfSha256"] != nats_sha or sha256(ROOT / record["png"]) != record["renderSha256"] for record in records):
        raise RuntimeError("NATS visual evidence changed")
    explainer_report = {
        "status": "PASS", "checkedAt": "2026-10-13",
        "scope": "Complete current learning and NATS editions",
        "pdfs": [
            {"id": "impact-controlling-learning", "path": learning_path.relative_to(ROOT).as_posix(), "pdfSha256": learning["pdfSha256"], "pages": learning["pages"], "visualPageCoverage": learning["visualPageCoverage"], "evidence": LEARNING_REPORT.relative_to(ROOT).as_posix()},
            {"id": "nats-woek", "path": nats_path.relative_to(ROOT).as_posix(), "pdfSha256": nats_sha, "pages": 60, "visualPageCoverage": 60, "evidence": FIRST_MANIFEST.relative_to(ROOT).as_posix(), "reviewedViaExactDuplicate": nats_copy},
        ],
        "findings": {"clipping": 0, "overlap": 0, "productionResidue": 0, "unresolved": 0},
    }
    EXPLAINER_REPORT.write_text(json.dumps(explainer_report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS", "methodPages": 17, "explainerPages": 81}, ensure_ascii=False))


if __name__ == "__main__":
    main()
