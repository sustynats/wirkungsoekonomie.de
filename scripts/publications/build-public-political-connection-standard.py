#!/usr/bin/env python3
"""Build the corrected public PDF source for the political connection standard."""
from __future__ import annotations

import os
import runpy
import shutil
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
SOURCE = "content/grundlagen/woek-standard-politische-anschlussfaehigkeit-v0.1.md"
PDF = ROOT / "assets/downloads/woek_standard_politische_anschlussfaehigkeit_v0_1.pdf"
DUPLICATE = ROOT / "assets/downloads/woek_standard_politische_anschlussfaehigkeit_v0_1 2.pdf"


def normalize_metadata(path: Path) -> None:
    document = pymupdf.open(path)
    metadata = document.metadata
    metadata.update({
        "title": "Politische Anschlussfähigkeit als Standard",
        "author": "Natalie Weber · Institut für Wirkungsökonomie",
        "subject": "Demokratische und rechtsstaatliche Einordnung politischer Wirkungsoptionen",
        "creator": "Institut für Wirkungsökonomie",
        "producer": "Institut für Wirkungsökonomie",
        "creationDate": "D:20261013000000+02'00'",
        "modDate": "D:20261013000000+02'00'",
    })
    temporary = path.with_suffix(".metadata.tmp.pdf")
    document.set_metadata({key: value for key, value in metadata.items() if key in {
        "title", "author", "subject", "keywords", "creator", "producer", "creationDate", "modDate", "trapped"
    }})
    document.save(temporary, garbage=4, deflate=True)
    document.close()
    temporary.replace(path)


def main() -> None:
    os.environ.update({
        "WOEK_PUBLICATION_SOURCE": SOURCE,
        "WOEK_PUBLICATION_ONLINE": "content/documents/online/woek-standard-politische-anschlussfaehigkeit-v0-1.inc",
        "WOEK_PUBLICATION_PDF": str(PDF.relative_to(ROOT)),
        "WOEK_PUBLICATION_TITLE": "Politische Anschlussfähigkeit als Standard",
        "WOEK_PUBLICATION_EDITION": "Version 0.1 · überarbeiteter Stand 13. Oktober 2026 · Diskussionsfassung",
        "WOEK_PUBLICATION_SHOW_TITLE": "false",
        "WOEK_LIBREOFFICE_PATH": os.environ.get("WOEK_LIBREOFFICE_PATH", "/opt/homebrew/bin/soffice"),
    })
    runpy.run_path(str(ROOT / "scripts/publications/build-nachhaltigkeit-systemarchitektur-v1.1.py"), run_name="__main__")
    normalize_metadata(PDF)
    shutil.copyfile(PDF, DUPLICATE)
    print(f"wrote {PDF.relative_to(ROOT)} and URL-preserving duplicate")


if __name__ == "__main__":
    main()
