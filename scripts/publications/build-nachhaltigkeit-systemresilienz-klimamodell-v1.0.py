#!/usr/bin/env python3
"""Build the online and PDF editions of the climate-model resilience paper."""
from __future__ import annotations

import os
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def main() -> None:
    os.environ.update({
        "WOEK_PUBLICATION_SOURCE": "source-assets/originals/nachhaltigkeit-als-systemresilienz-definition-und-klimamodell-v1.0.md",
        "WOEK_PUBLICATION_ONLINE": "content/documents/online/nachhaltigkeit-als-systemresilienz-definition-und-klimamodell-v1.0.inc",
        "WOEK_PUBLICATION_PDF": "public/downloads/originals/Nachhaltigkeit_als_Systemresilienz_Definition_und_Klimamodell_v1.0.pdf",
        "WOEK_PUBLICATION_TITLE": "Nachhaltigkeit als Systemresilienz",
        "WOEK_PUBLICATION_EDITION": "Version 1.0 · Stand 30. Juli 2026 · Fachveröffentlichung",
        "WOEK_PUBLICATION_SHOW_TITLE": "1",
    })
    runpy.run_path(str(ROOT / "scripts/publications/build-nachhaltigkeit-systemarchitektur-v1.1.py"), run_name="__main__")


if __name__ == "__main__":
    main()
