#!/usr/bin/env python3
"""Build version 1.2 of the Systemarchitektur paper while preserving v1.1."""
from __future__ import annotations

import os
import runpy
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "source-assets/originals/nachhaltigkeit-systemarchitektur-v1.1.md"
DELTA = ROOT / "source-assets/originals/nachhaltigkeit-systemarchitektur-v1.2-resilienzpraezisierung.md"


def main() -> None:
    source = f"{BASE.read_text(encoding='utf-8').rstrip()}\n\n---\n\n{DELTA.read_text(encoding='utf-8').strip()}\n"
    with tempfile.NamedTemporaryFile("w", suffix=".md", encoding="utf-8", delete=False) as handle:
        handle.write(source)
        temp_source = handle.name
    try:
        os.environ.update({
            "WOEK_PUBLICATION_SOURCE": temp_source,
            "WOEK_PUBLICATION_ONLINE": "content/documents/online/nachhaltigkeit-systemarchitektur-v1.2.inc",
            "WOEK_PUBLICATION_PDF": "public/downloads/originals/Nachhaltigkeit-Systemarchitektur-v1.2.pdf",
            "WOEK_PUBLICATION_TITLE": "Nachhaltigkeit ist keine Strategie. Sie ist eine Systemarchitektur.",
            "WOEK_PUBLICATION_EDITION": "Version 1.2 · Stand 30. Juli 2026 · Working Paper",
        })
        runpy.run_path(str(ROOT / "scripts/publications/build-nachhaltigkeit-systemarchitektur-v1.1.py"), run_name="__main__")
    finally:
        Path(temp_source).unlink(missing_ok=True)


if __name__ == "__main__":
    main()
