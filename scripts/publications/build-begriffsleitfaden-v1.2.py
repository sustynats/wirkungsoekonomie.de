#!/usr/bin/env python3
"""Build the cumulative v1.2 leading terminology guide without altering v1.0 or v1.1."""
from __future__ import annotations

import os
import runpy
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.1.md"
DELTA = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.2-resilienzsystematik.md"


def main() -> None:
    source = BASE.read_text(encoding="utf-8")
    source = source.replace("**Version:** 1.1", "**Version:** 1.2", 1)
    source = source.replace(
        "**Changelog 1.1:**",
        "**Changelog 1.1:**",
        1,
    )
    changelog = "**Changelog 1.2:** Präzisierung der Resilienzsystematik: Trennung von Stabilitätslandschaft, Rückstellfähigkeit und Dämpfungsfähigkeit; korrekte Einordnung von Latitude, Resistance, Precariousness, Panarchy, Adaptability und Transformability; Wirkungsresilienz als WÖk-Integrationsbegriff."
    source = source.replace("\n---\n\n## 1. Zweck", f"\n{changelog}\n\n---\n\n## 1. Zweck", 1)
    marker = "\n---\n\n## 7. Verbindliche Glossardefinitionen"
    if marker not in source:
        raise RuntimeError("Einfügemarke für die Resilienzsystematik fehlt.")
    source = source.replace(marker, f"\n\n{DELTA.read_text(encoding='utf-8').strip()}\n{marker}", 1)
    with tempfile.NamedTemporaryFile("w", suffix=".md", encoding="utf-8", delete=False) as handle:
        handle.write(source)
        temp_source = handle.name
    try:
        os.environ.update({
            "WOEK_PUBLICATION_SOURCE": temp_source,
            "WOEK_PUBLICATION_ONLINE": "content/documents/online/woek-begriffsleitfaden-fuehrend.inc",
            "WOEK_PUBLICATION_PDF": "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.2.pdf",
            "WOEK_PUBLICATION_TITLE": "Führender Begriffsleitfaden der Wirkungsökonomie",
            "WOEK_PUBLICATION_EDITION": "Version 1.2 · Stand 30. Juli 2026 · Führendes Referenzdokument",
        })
        runpy.run_path(str(ROOT / "scripts/publications/build-nachhaltigkeit-systemarchitektur-v1.1.py"), run_name="__main__")
    finally:
        Path(temp_source).unlink(missing_ok=True)


if __name__ == "__main__":
    main()
