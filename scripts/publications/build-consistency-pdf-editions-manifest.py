#!/usr/bin/env python3
"""Build the guarded seven-edition release manifest from current reviewed files."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pymupdf


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "assets/data/consistency-pdf-editions-2026-10-11.json"
TAG = "woek-consistency-2026-10-09"

EDITIONS = [
    ("die-neue-ordnung-des-wohlstands-konsistenz-2026-10-13.pdf", "Die neue Ordnung des Wohlstands – Gesamtausgabe", "book-combined", "assets/pdf/die-neue-ordnung-des-wohlstands.pdf"),
    ("die-neue-ordnung-des-wohlstands-band-i-2026-10-13.pdf", "Die neue Ordnung des Wohlstands – Band I", "book-volume", "source-assets/generated/consistency-20261013/pdf/die-neue-ordnung-des-wohlstands-band-i-2026-10-13.pdf"),
    ("die-neue-ordnung-des-wohlstands-band-ii-2026-10-13.pdf", "Die neue Ordnung des Wohlstands – Band II", "book-volume", "source-assets/generated/consistency-20261013/pdf/die-neue-ordnung-des-wohlstands-band-ii-2026-10-13.pdf"),
    ("woemm-2.0-referenzfassung-2026-10-13.pdf", "WÖMM 2.0 – Referenzfassung", "method", "assets/downloads/grundlagen/woemm-2.0-referenzfassung.pdf"),
    ("woems-2.0-referenzfassung-2026-10-13.pdf", "WÖMS 2.0 – Referenzfassung", "method", "assets/downloads/grundlagen/woems-2.0-referenzfassung.pdf"),
    ("woek-impact-controlling-lernweg-2026-10-13.pdf", "Impact Controlling – vollständiger Lernweg", "explainer", "source-assets/generated/consistency-20261013/pdf/woek-impact-controlling-lernweg-2026-10-13.pdf"),
    ("nats-woek-allgemein-2026-10-13.pdf", "NATS – Wirkungsökonomie allgemein", "reference", "public/downloads/originals/NATS_WOeK_allgemein.pdf"),
]

SOURCE_PATHS = [
    "content/grundlagen/book-corrections-20261009.json",
    "source-assets/generated/books-20261009/PRINT_6x9_Band-I_Konsistenz_2026-10-10.docx",
    "source-assets/generated/books-20261009/PRINT_6x9_Band-II_Konsistenz_2026-10-10.docx",
    "scripts/publications/build-consistency-method-pdfs.py",
    "scripts/publications/build-consistency-learning-editions.py",
    "content/site/home-explainer.json",
    "content/site/impact-controlling-course.json",
    "assets/js/impact-controlling-rechner.js",
    "content/documents/online/nats-woek-allgemein.inc",
    "reports/consistency-20261009/pdf-publishing-metadata-final-20261013.json",
]

VISUAL_REVIEWS = [
    "reports/consistency-20261009/book-pdf-visual-review.json",
    "reports/consistency-20261009/method-pdf-visual-review.json",
    "reports/consistency-20261009/explainer-pdf-visual-review.json",
    "reports/consistency-20261009/pdf-production-cleanup-visual-review.json",
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pages(path: Path) -> int:
    with pymupdf.open(path) as document:
        return len(document)


def succession(source: str, archive: str, predecessor: str, edition: str) -> dict:
    return {
        "archive": archive, "predecessorSha256": predecessor,
        "archivedSha256": sha256(ROOT / archive), "currentSha256": sha256(ROOT / source),
        "editionFilename": edition,
    }


def main() -> None:
    files = []
    for filename, title, kind, source in EDITIONS:
        path = ROOT / source
        files.append({
            "filename": filename, "title": title, "kind": kind, "source": source,
            "sha256": sha256(path), "pages": pages(path), "bytes": path.stat().st_size,
            "url": f"https://github.com/sustynats/wirkungsoekonomie.de/releases/download/{TAG}/{filename}",
        })
    metadata_report = ROOT / "reports/consistency-20261009/journal-metadata-pixel-proof-20261013.json"
    metadata = json.loads(metadata_report.read_text(encoding="utf-8"))
    if metadata.get("status") != "PASS" or metadata.get("totals", {}).get("pages") != 71:
        raise RuntimeError("Journal metadata pixel proof is incomplete")
    manifest = {
        "schemaVersion": "woek-consistency-pdf-editions-1.0",
        "reviewedAt": "2026-10-13", "releaseTag": TAG,
        "status": "LOCAL_SOURCE_AND_VISUAL_VERIFICATION_COMPLETE",
        "files": files,
        "sources": [{"path": path, "sha256": sha256(ROOT / path)} for path in SOURCE_PATHS],
        "visualReview": [{"path": path, "sha256": sha256(ROOT / path)} for path in VISUAL_REVIEWS],
        "sourceSuccessions": {
            "assets/pdf/die-neue-ordnung-des-wohlstands.pdf": succession(
                "assets/pdf/die-neue-ordnung-des-wohlstands.pdf",
                "source-assets/originals/mainwork-2026-08-02/die-neue-ordnung-des-wohlstands-lesefassung.pdf",
                "4e04ea740de878099f8375a033c09aa39645f4715c710251cb3d6f41e9b2ba10",
                EDITIONS[0][0],
            ),
            "assets/downloads/grundlagen/woemm-2.0-referenzfassung.pdf": succession(
                "assets/downloads/grundlagen/woemm-2.0-referenzfassung.pdf",
                "source-assets/originals/methods-20261010/woemm-2.0-referenzfassung.pdf",
                "1450cb5c1955f0451909333009249c75b86d9328c16aa4f82c0a4e7723c7b896",
                EDITIONS[3][0],
            ),
            "assets/downloads/grundlagen/woems-2.0-referenzfassung.pdf": succession(
                "assets/downloads/grundlagen/woems-2.0-referenzfassung.pdf",
                "source-assets/originals/methods-20261010/woems-2.0-referenzfassung.pdf",
                "10820c06a12ae6c072175abc8f01acb4d7dfc6fb9823add7469b31af58bfd57a",
                EDITIONS[4][0],
            ),
            "assets/js/impact-controlling-rechner.js": succession(
                "assets/js/impact-controlling-rechner.js",
                "source-assets/originals/publication-inputs-2026-09-06/assets/js/impact-controlling-rechner.js",
                "3040407d73422420133b556d95bd38907c3b5518217f7e9c17c371140f48d61a",
                EDITIONS[5][0],
            ),
            "public/downloads/originals/NATS_WOeK_allgemein.pdf": succession(
                "public/downloads/originals/NATS_WOeK_allgemein.pdf",
                "source-assets/originals/pdf-hidden-metadata-20261011/NATS_WOeK_allgemein.pdf",
                "35d00a6774260b0c7a4cdbf4960c4a2b33b45f575aeab918b61dc6bd2122e70c",
                EDITIONS[6][0],
            ),
        },
        "metadataOnlyCorrections": {
            "review": metadata_report.relative_to(ROOT).as_posix(),
            "reviewSha256": sha256(metadata_report),
            "files": {
                item["source"]: {
                    "source": item["source"], "archive": item["archive"], "predecessorSha256": item["predecessorSha256"],
                    "currentSha256": item["currentSha256"], "pages": item["pages"],
                }
                for item in metadata["files"]
            },
        },
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": manifest["status"], "files": len(files), "pages": sum(item["pages"] for item in files)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
