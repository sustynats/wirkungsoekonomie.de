#!/usr/bin/env python3
"""Build cumulative v1.6 of the leading WÖk terminology guide."""
from __future__ import annotations

import os
import runpy
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.5.md"
DELTA = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.6-staatsarchitektur.md"
GENERATED = ROOT / "source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.6.md"


def build_source() -> None:
    base = BASE.read_text(encoding="utf-8")
    delta = DELTA.read_text(encoding="utf-8").strip()
    replacements = {
        "**Version 1.5 · Stand 15. August 2026 · Führendes Referenzdokument**": "**Version 1.6 · Stand 21. August 2026 · Führendes Referenzdokument**",
        "Diese Version ersetzt Version 1.4 als führende begriffliche Arbeitsgrundlage. Ältere Fassungen bleiben als historische, zitierfähige Entwicklungsstände erhalten. Im Widerspruchsfall gilt für neue Inhalte Version 1.5.": "Diese Version ersetzt Version 1.5 als führende begriffliche Arbeitsgrundlage. Ältere Fassungen bleiben als historische, zitierfähige Entwicklungsstände erhalten. Im Widerspruchsfall gilt für neue Inhalte Version 1.6.",
        "**Direkte Basis dieser Fassung ist Version 1.4 vom 14. August 2026.** Version 1.5 ist kein Neuaufbau aus Version 1.0, sondern ein Delta auf Version 1.4.": "**Direkte Basis dieser Fassung ist Version 1.5 vom 15. August 2026.** Version 1.6 ist kein Neuaufbau, sondern ein geprüftes Delta auf Version 1.5.",
        "| Version | 1.5 |": "| Version | 1.6 |",
        "| Stand | 15. August 2026 |": "| Stand | 21. August 2026 |",
        "- 1. Zweck, Geltung und Quellenhierarchie": "- 0. Ergänzung v1.6: Staatliche Nachhaltigkeits- und Folgenprüfungsarchitektur\n\n- 1. Zweck, Geltung und Quellenhierarchie",
        "Version 1.5 stellt die Eigenständigkeit der Wirkungsökonomie klar: Sie nutzt etablierte Methoden dort, wo diese eine Teilfrage gut beantworten, geht aber nicht in einer Results Chain, einer Kennzahl oder einem Bericht auf. Ihre besondere Leistung ist die Verbindung von Vorwirkung, Wirkungsermittlung, Evidenz, Bewertung, Schutz, Systemwirkung, Transformation, Governance, Rückkopplung und Lernen.": "Version 1.6 erkennt die bestehende staatliche Folgen- und Nachhaltigkeitsarchitektur ausdrücklich an und präzisiert den WÖk-Zusatznutzen: die Verbindung von Problem Review, Goal Review, Wirkpfad, Evidenz, Gegenfaktum und Attribution, Bewertung, Schutz, Systemwirkung, Optionsvergleich, Umsetzung, Reality Check, Rückkopplung und Lernen. Die WÖk ersetzt weder GFA und Nachhaltigkeitsprüfung noch DNS-Monitoring und Evaluation.",
        "## 15.2 Verbindliche Migrationsmatrix": "## 15.2 Historische Migrationsmatrix aus Version 1.5\n\nDie folgende Matrix dokumentiert den damaligen v1.5-Migrationsauftrag. Sie ist kein offener v1.6-Release-Tracker. Für neue Inhalte gelten die Ergänzung v1.6, die dort genannten amtlichen Quellen und die aktuellen maschinenlesbaren Qualitätsgates.",
        "| P0 | Live-Fassung Begriffsleitfaden | Version 1.5 veröffentlichen, v1.4 als historische Fassung erhalten, aktuelle Downloads und Verweise umstellen. |": "| Erledigt v1.6 | Live-Fassung Begriffsleitfaden | Version 1.6 ist die führende Fassung; v1.5 und ältere Fassungen bleiben als historische, zitierfähige Entwicklungsstände erhalten. |",
    }
    for old, new in replacements.items():
        if old not in base:
            raise RuntimeError(f"Erwarteter v1.5-Anker fehlt: {old[:80]}")
        base = base.replace(old, new, 1)
    marker = "# 1. Zweck, Geltung und Quellenhierarchie"
    if marker not in base:
        raise RuntimeError("Einfügeanker für v1.6 fehlt")
    base = base.replace(marker, f"{delta}\n\n\n{marker}", 1)
    GENERATED.parent.mkdir(parents=True, exist_ok=True)
    GENERATED.write_text(base, encoding="utf-8")


def main() -> None:
    build_source()
    os.environ.update({
        "WOEK_PUBLICATION_SOURCE": str(GENERATED.relative_to(ROOT)),
        "WOEK_PUBLICATION_ONLINE": "content/documents/online/woek-begriffsleitfaden-fuehrend.inc",
        "WOEK_PUBLICATION_PDF": "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.6.pdf",
        "WOEK_PUBLICATION_TITLE": "Führender Begriffsleitfaden der Wirkungsökonomie",
        "WOEK_PUBLICATION_EDITION": "Version 1.6 · Stand 21. August 2026 · Führendes Referenzdokument",
        "WOEK_PUBLICATION_IMAGE_BASE": "../../assets/img/publications/",
        "WOEK_LIBREOFFICE_PATH": os.environ.get("WOEK_LIBREOFFICE_PATH", "/opt/codex/runtimes/codex-primary-runtime/dependencies/bin/override/soffice"),
    })
    runpy.run_path(str(ROOT / "scripts/publications/build-nachhaltigkeit-systemarchitektur-v1.1.py"), run_name="__main__")


if __name__ == "__main__":
    main()
