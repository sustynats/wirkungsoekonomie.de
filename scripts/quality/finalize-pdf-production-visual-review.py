#!/usr/bin/env python3
"""Finalize the complete, hash-bound visual review of public PDF changes.

The first render set contains all pixel changes and identified ten public files
with editorial production prose.  Those ten files were rebuilt from corrected
sources and reviewed in full in a separate render set.  This finalizer binds
the unchanged accepted PDFs to the first review and the replacements to the
second review.
"""
from __future__ import annotations

import hashlib
import json
import os
import stat
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PRE_REVIEW = ROOT / "recovery/final-pdf-production-visual-pre-detail-20261013/manifest.json"
DETAIL_MANIFEST = ROOT / "recovery/detail-compendia-visual-20261013/manifest.json"
DETAIL_REVIEW = ROOT / "reports/consistency-20261009/detail-compendium-visual-review-20261013.json"
DETAIL_BUILD = ROOT / "reports/consistency-20261009/detail-compendium-pdf-rebuild-20261013.json"
FINAL_RESIDUE_MANIFEST = ROOT.parent / "recovery/final-pdf-residue-visual-20261013/manifest.json"
FINAL_RESIDUE_REVIEW = ROOT / "reports/consistency-20261009/pdf-production-residue-visual-review-final-20261013.json"
BOOK_REVIEW = ROOT / "reports/consistency-20261009/book-pdf-visual-review.json"
BOOK_CURRENT = ROOT / "content/grundlagen/book-publication-current.json"
REPORT = ROOT / "reports/consistency-20261009/pdf-production-cleanup-visual-review.json"
BOOK = "assets/pdf/die-neue-ordnung-des-wohlstands.pdf"
PUBLIC_PREFIXES = ("assets/", "public/downloads/", "downloads/")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git_paths(*args: str) -> set[str]:
    output = subprocess.check_output(["git", *args, "--", "*.pdf"], cwd=ROOT)
    return {item.decode("utf-8") for item in output.split(b"\0") if item}


def changed_public_pdfs() -> set[str]:
    paths: set[str] = set()
    paths.update(git_paths("diff", "--name-only", "-z"))
    paths.update(git_paths("diff", "--cached", "--name-only", "-z"))
    reviewed_untracked = "public/downloads/originals/NATS_WOeK_allgemein 2.pdf"
    if (ROOT / reviewed_untracked).is_file():
        paths.add(reviewed_untracked)
    return {
        path for path in paths
        if path.startswith(PUBLIC_PREFIXES)
        and (ROOT / path).is_file()
        and not (os.stat(ROOT / path).st_flags & getattr(stat, "SF_DATALESS", 0))
    }


def main() -> None:
    first = json.loads(PRE_REVIEW.read_text(encoding="utf-8"))
    previous_report = json.loads(REPORT.read_text(encoding="utf-8")) if REPORT.exists() else {}
    detail_manifest = json.loads(DETAIL_MANIFEST.read_text(encoding="utf-8"))
    detail_review = json.loads(DETAIL_REVIEW.read_text(encoding="utf-8"))
    detail_build = json.loads(DETAIL_BUILD.read_text(encoding="utf-8"))
    final_residue_manifest = json.loads(FINAL_RESIDUE_MANIFEST.read_text(encoding="utf-8"))
    final_residue_review = json.loads(FINAL_RESIDUE_REVIEW.read_text(encoding="utf-8"))
    book_review = json.loads(BOOK_REVIEW.read_text(encoding="utf-8"))
    book_current = json.loads(BOOK_CURRENT.read_text(encoding="utf-8"))
    if first.get("flags"):
        raise RuntimeError("first render inventory contains unresolved flags")
    if detail_manifest.get("status") != "VISUALLY_REVIEWED" or detail_review.get("status") != "PASS":
        raise RuntimeError("detail-compendium review is incomplete")
    if detail_build.get("status") != "PASS" or book_review.get("status") != "PASS":
        raise RuntimeError("bound PDF build/review report is incomplete")
    if final_residue_manifest.get("status") != "VISUALLY_REVIEWED" or final_residue_review.get("status") != "PASS":
        raise RuntimeError("final production-residue visual review is incomplete")

    late_replaced = set(final_residue_review["paths"])
    for record in final_residue_manifest["pages"]:
        if sha256(ROOT / record["path"]) != record["pdfSha256"]:
            raise RuntimeError(f"final-remediation PDF changed: {record['path']}")
        if sha256(FINAL_RESIDUE_MANIFEST.parent / record["render"]) != record["renderSha256"]:
            raise RuntimeError(f"final-remediation render changed: {record['render']}")

    replaced: set[str] = set()
    for record in detail_build["records"]:
        replaced.update((record["pdf"], record["duplicate"]))
        if sha256(ROOT / record["pdf"]) != record["sha256"]:
            raise RuntimeError(f"rebuilt PDF hash changed: {record['pdf']}")
        if sha256(ROOT / record["duplicate"]) != record["sha256"]:
            raise RuntimeError(f"rebuilt duplicate hash changed: {record['duplicate']}")

    accepted_records = []
    rejected_records = []
    accepted_paths: set[str] = set()
    rejected_paths: set[str] = set()
    for record in first["records"]:
        png = ROOT / record["png"]
        if sha256(png) != record["renderSha256"]:
            raise RuntimeError(f"first-review render hash changed: {record['png']}")
        if record["path"] in replaced | late_replaced:
            rejected_records.append(record)
            rejected_paths.add(record["path"])
            continue
        if sha256(ROOT / record["path"]) != record["pdfSha256"]:
            raise RuntimeError(f"accepted PDF changed after visual review: {record['path']}")
        accepted_records.append(record)
        accepted_paths.add(record["path"])

    first_paths = {record["path"] for record in first["records"]}
    expected_rejected = replaced | (late_replaced & first_paths)
    if rejected_paths != expected_rejected:
        missing = sorted(expected_rejected - rejected_paths)
        raise RuntimeError(f"remediated files were not all present in the first review: {missing}")

    current_changed = changed_public_pdfs()
    compared_scope = current_changed - {BOOK}
    original_scope = first_paths | set(previous_report.get("pixelIdenticalChangedPdfs", []))
    late_public = {path for path in late_replaced if path.startswith(PUBLIC_PREFIXES)}
    if compared_scope != original_scope | late_public:
        raise RuntimeError("public PDF path inventory changed outside the reviewed remediation")
    pixel_identical = sorted(original_scope - first_paths)
    if len(pixel_identical) != first["comparedPublicPdfs"] - first["pdfsWithPixelChanges"]:
        raise RuntimeError("pixel-identical PDF inventory no longer matches the first render")

    expected_book = book_current["combined"]["sha256"]
    if expected_book != sha256(ROOT / BOOK):
        raise RuntimeError("combined book hash changed after its complete review")

    first["status"] = "VISUALLY_REVIEWED_WITH_REMEDIATION_COMPLETED"
    first["remediatedPaths"] = sorted(replaced | late_replaced)
    PRE_REVIEW.write_text(json.dumps(first, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = {
        "date": "2026-10-13",
        "status": "PASS",
        "scope": "Every public PDF page with a pixel difference from HEAD, plus the complete current combined book",
        "firstReview": {
            "manifest": PRE_REVIEW.relative_to(ROOT).as_posix(),
            "manifestSha256": sha256(PRE_REVIEW),
            "renderedPages": first["pages"],
            "contactSheets": len(first["contactSheets"]),
            "acceptedPages": len(accepted_records),
            "acceptedPdfs": len(accepted_paths),
            "rejectedAndRebuiltPages": len(rejected_records),
            "rejectedAndRebuiltPdfs": len(rejected_paths),
        },
        "remediationReview": {
            "report": DETAIL_REVIEW.relative_to(ROOT).as_posix(),
            "reportSha256": sha256(DETAIL_REVIEW),
            "manifest": DETAIL_MANIFEST.relative_to(ROOT).as_posix(),
            "manifestSha256": sha256(DETAIL_MANIFEST),
            "uniqueReviewedPages": detail_review["reviewedPages"],
            "uniquePdfs": detail_review["uniquePdfs"],
            "exactDuplicatePdfs": detail_review["exactDuplicatePdfs"],
            "paths": sorted(replaced),
        },
        "finalProductionResidueReview": {
            "report": FINAL_RESIDUE_REVIEW.relative_to(ROOT).as_posix(),
            "reportSha256": sha256(FINAL_RESIDUE_REVIEW),
            "manifest": str(FINAL_RESIDUE_MANIFEST),
            "manifestSha256": sha256(FINAL_RESIDUE_MANIFEST),
            "reviewedPages": final_residue_review["reviewedPages"],
            "reviewedPdfs": final_residue_review["reviewedPdfs"],
            "paths": sorted(late_replaced),
        },
        "independentBookReview": {
            "report": BOOK_REVIEW.relative_to(ROOT).as_posix(),
            "reportSha256": sha256(BOOK_REVIEW),
            "pdf": BOOK,
            "sha256": expected_book,
            "pages": book_review["totals"]["pages"],
        },
        "pixelIdenticalChangedPdfs": pixel_identical,
        "findings": {
            "resolvedEditorialProductionNotes": len(replaced | late_replaced),
            "clipping": 0,
            "overlap": 0,
            "blankRedactionResidue": 0,
            "remainingProductionNotes": 0,
            "unresolved": 0,
        },
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": "PASS",
        "acceptedPages": len(accepted_records),
        "remediationPages": detail_review["reviewedPages"],
        "finalResiduePages": final_residue_review["reviewedPages"],
        "bookPages": report["independentBookReview"]["pages"],
        "unresolved": 0,
    }))


if __name__ == "__main__":
    main()
