#!/usr/bin/env python3
"""Build the cumulative, supplied v1.5 online edition of the WÖk terminology guide.

The reviewed PDF is a versioned primary publication and is committed separately.
This script only derives the accessible online reader from the canonical Markdown
source, so future builds cannot revert the current leading edition to v1.4.
"""
from __future__ import annotations

import os
import runpy
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def main() -> None:
    os.environ.update({
        "WOEK_PUBLICATION_SOURCE": "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.5.md",
        "WOEK_PUBLICATION_ONLINE": "content/documents/online/woek-begriffsleitfaden-fuehrend.inc",
        "WOEK_PUBLICATION_TITLE": "Führender Begriffsleitfaden der Wirkungsökonomie",
        "WOEK_PUBLICATION_EDITION": "Version 1.5 · Stand 15. August 2026 · Führendes Referenzdokument",
        "WOEK_PUBLICATION_IMAGE_BASE": "../../assets/img/publications/",
        "WOEK_PUBLICATION_SKIP_PDF": "1",
    })
    runpy.run_path(
        str(ROOT / "scripts/publications/build-nachhaltigkeit-systemarchitektur-v1.1.py"),
        run_name="__main__",
    )


if __name__ == "__main__":
    main()
