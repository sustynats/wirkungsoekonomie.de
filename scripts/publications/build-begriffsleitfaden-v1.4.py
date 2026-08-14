#!/usr/bin/env python3
"""Build the cumulative v1.4 terminology guide without changing older editions."""
from __future__ import annotations

import os
import runpy
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.1.md"
DELTA_12 = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.2-resilienzsystematik.md"
DELTA_13 = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.3-resilienzpraezisierung.md"
DELTA_14 = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.4-iooi-wirkungsarchitektur.md"


def main() -> None:
    source = BASE.read_text(encoding="utf-8")
    source = source.replace("**Version:** 1.1", "**Version:** 1.4", 1)
    source = source.replace("**Stand:** 30. Juli 2026", "**Stand:** 14. August 2026", 1)
    source = source.replace(
        "Diese Kurzformel ist die Grundlage für Website, Glossar, Akademie, Blog, Social Media und CodeX-Anweisungen.",
        "Diese Kurzformel ist die Grundlage für öffentliche Texte, Glossar, Akademie, Blog und Social-Media-Beiträge.",
        1,
    )
    source = source.replace(
        "## 14. Führende Mini-Definitionen für Hover, Glossar und CodeX",
        "## 14. Führende Mini-Definitionen für Glossar, Suche und kurze Erklärtexte",
        1,
    )
    changes = (
        "**Changelog 1.2:** Präzisierung der Resilienzsystematik: Trennung von Stabilitätslandschaft, "
        "Rückstellfähigkeit und Dämpfungsfähigkeit; korrekte Einordnung von Latitude, Resistance, "
        "Precariousness, Panarchy, Adaptability und Transformability; Wirkungsresilienz als WÖk-Integrationsbegriff.\n\n"
        "**Changelog 1.3:** Nachhaltigkeit ist als langfristig gesicherte Wirkungsresilienz präzisiert. "
        "Die allgemeine IPCC-kompatible Resilienzdefinition, die Hierarchie von Resilienz bis Nachhaltigkeit "
        "und die acht Analysebausteine von Resilienz und Systementwicklung sind verbindlich ergänzt.\n\n"
        "**Changelog 1.4:** IOOI ist als Wirkpfad innerhalb der WÖk-Wirkungsarchitektur präzisiert. "
        "Die Trennung von Auslöser, Wirkungspotenzial, Wirkungsrisiko, Wirkmechanismus, Wirkung, Evidenz, "
        "Bewertung, Nichtkompensation, Transformation und Rückkopplung ist verbindlich ergänzt."
    )
    source = source.replace("\n---\n\n## 1. Zweck", f"\n{changes}\n\n---\n\n## 1. Zweck", 1)
    marker = "\n---\n\n## 7. Verbindliche Glossardefinitionen"
    if marker not in source:
        raise RuntimeError("Einfügemarke für die Begriffsleitfaden-Deltas fehlt.")
    deltas = "\n\n".join(delta.read_text(encoding="utf-8").strip() for delta in (DELTA_12, DELTA_13, DELTA_14))
    source = source.replace(marker, f"\n\n{deltas}{marker}", 1)
    with tempfile.NamedTemporaryFile("w", suffix=".md", encoding="utf-8", delete=False) as handle:
        handle.write(source)
        temp_source = handle.name
    try:
        os.environ.update({
            "WOEK_PUBLICATION_SOURCE": temp_source,
            "WOEK_PUBLICATION_ONLINE": "content/documents/online/woek-begriffsleitfaden-fuehrend.inc",
            "WOEK_PUBLICATION_PDF": "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.4.pdf",
            "WOEK_PUBLICATION_TITLE": "Führender Begriffsleitfaden der Wirkungsökonomie",
            "WOEK_PUBLICATION_EDITION": "Version 1.4 · Stand 14. August 2026 · Führendes Referenzdokument",
        })
        runpy.run_path(str(ROOT / "scripts/publications/build-nachhaltigkeit-systemarchitektur-v1.1.py"), run_name="__main__")
    finally:
        Path(temp_source).unlink(missing_ok=True)


if __name__ == "__main__":
    main()
