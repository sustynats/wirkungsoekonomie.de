#!/usr/bin/env python3
"""Create the versioned v1.1 guide from its Markdown source without touching v1.0."""
from __future__ import annotations

import os
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
os.environ.update({
    "WOEK_PUBLICATION_SOURCE": "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.1.md",
    "WOEK_PUBLICATION_ONLINE": "content/documents/online/woek-begriffsleitfaden-fuehrend.inc",
    "WOEK_PUBLICATION_PDF": "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.1.pdf",
    "WOEK_PUBLICATION_TITLE": "Führender Begriffsleitfaden der Wirkungsökonomie",
    "WOEK_PUBLICATION_EDITION": "Version 1.1 · Stand 30. Juli 2026 · Führendes Referenzdokument",
})
runpy.run_path(str(ROOT / "scripts/publications/build-nachhaltigkeit-systemarchitektur-v1.1.py"), run_name="__main__")
