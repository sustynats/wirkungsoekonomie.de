#!/usr/bin/env python3
"""Build cumulative v1.7 of the leading WÖk terminology guide."""
from __future__ import annotations

import os
import runpy
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.6.md"
DELTA = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.7-objektspezifische-pruefarchitektur.md"
GENERATED = ROOT / "source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.7.md"


def build_source() -> None:
    base = BASE.read_text(encoding="utf-8")
    delta = DELTA.read_text(encoding="utf-8").strip()
    replacements = {
        "**Version 1.6 · Stand 21. August 2026 · Führendes Referenzdokument**": "**Version 1.7 · Stand 21. August 2026 · Führendes Referenzdokument**",
        "Diese Version ersetzt Version 1.5 als führende begriffliche Arbeitsgrundlage. Ältere Fassungen bleiben als historische, zitierfähige Entwicklungsstände erhalten. Im Widerspruchsfall gilt für neue Inhalte Version 1.6.": "Diese Version ersetzt Version 1.6 als führende begriffliche Arbeitsgrundlage. Ältere Fassungen bleiben als historische, zitierfähige Entwicklungsstände erhalten. Im Widerspruchsfall gilt für neue Inhalte Version 1.7.",
        "**Direkte Basis dieser Fassung ist Version 1.5 vom 15. August 2026.** Version 1.6 ist kein Neuaufbau, sondern ein geprüftes Delta auf Version 1.5.": "**Direkte Basis dieser Fassung ist Version 1.6 vom 21. August 2026.** Version 1.7 ist kein Neuaufbau, sondern ein geprüftes Delta auf Version 1.6.",
        "| Version | 1.6 |": "| Version | 1.7 |",
        "## Changelog Version 1.5": "## Changelog Version 1.7\n\n- Wirkungsrelevanz statt Rechtsform wird als WÖk-Scope-Prinzip eingeführt, ohne staatliche Anwendungsbereiche zu verwischen.\n\n- § 7 BHO und die VV-BHO werden als bestehender Ex-ante-/Ex-post-Rahmen für finanzwirksame Maßnahmen anerkannt; zwoH wird als aktuelle Weiterentwicklung eingeordnet.\n\n- GGO/GFA/eNAP, BHO/VV-BHO sowie KSG/KAnG werden objektspezifisch getrennt.\n\n- Der `STATE_ASSESSMENT_BENCHMARK` wird als generische Transparenzschicht eingeführt; `STATE_GFA_ENAP_BENCHMARK` bleibt der Regelungsvorhaben-Untertyp.\n\n- Staatliches Eigentum, Steuerung, Mandat und Attribution werden bei öffentlichen Unternehmen getrennt belegt.\n\n## Changelog Version 1.5",
        "- 0. Ergänzung v1.6: Staatliche Nachhaltigkeits- und Folgenprüfungsarchitektur": "- 0a. Ergänzung v1.7: Wirkungsrelevanz und objektspezifische staatliche Prüfarchitektur\n\n- 0b. Ergänzung v1.6: Staatliche Nachhaltigkeits- und Folgenprüfungsarchitektur",
        "Version 1.6 erkennt die bestehende staatliche Folgen- und Nachhaltigkeitsarchitektur ausdrücklich an und präzisiert den WÖk-Zusatznutzen: die Verbindung von Problem Review, Goal Review, Wirkpfad, Evidenz, Gegenfaktum und Attribution, Bewertung, Schutz, Systemwirkung, Optionsvergleich, Umsetzung, Reality Check, Rückkopplung und Lernen. Die WÖk ersetzt weder GFA und Nachhaltigkeitsprüfung noch DNS-Monitoring und Evaluation.": "Version 1.7 ordnet Prüfrahmen objektspezifisch und behauptet keine staatliche Prüfleere.",
    }
    for old, new in replacements.items():
        if old not in base:
            raise RuntimeError(f"Erwarteter v1.6-Anker fehlt: {old[:100]}")
        base = base.replace(old, new, 1)
    matrix_heading = "## 15.2 Historische Migrationsmatrix aus Version 1.5 und v1.6\n\nDie folgende Matrix dokumentiert den damaligen v1.5-Migrationsauftrag. Sie ist kein offener v1.7-Release-Tracker. Für neue Inhalte gelten die Ergänzungen v1.6 und v1.7 sowie die aktuellen maschinenlesbaren Qualitätsgates."
    matrix_heading_anchors = (
        "## 15.2 Historische Migrationsmatrix aus Version 1.5",
        "## 15.2 Verbindliche Migrationsmatrix",
    )
    for old in matrix_heading_anchors:
        if old in base:
            base = base.replace(old, matrix_heading, 1)
            break
    else:
        raise RuntimeError("Erwarteter v1.6-Migrationsmatrix-Anker fehlt")
    current_release_row = "| Erledigt v1.7 | Live-Fassung Begriffsleitfaden | Version 1.7 ist die führende Fassung; v1.6 und ältere Fassungen bleiben als historische, zitierfähige Entwicklungsstände erhalten. |"
    release_row_anchors = (
        "| Erledigt v1.6 | Live-Fassung Begriffsleitfaden | Version 1.6 ist die führende Fassung; v1.5 und ältere Fassungen bleiben als historische, zitierfähige Entwicklungsstände erhalten. |",
        "| P0 | Live-Fassung Begriffsleitfaden | Version 1.5 veröffentlichen, v1.4 als historische Fassung erhalten, aktuelle Downloads und Verweise umstellen. |",
    )
    for old in release_row_anchors:
        if old in base:
            base = base.replace(old, current_release_row, 1)
            break
    else:
        raise RuntimeError("Erwartete v1.6-Releasezeile fehlt")
    marker = "# Ergänzung v1.6: Staatliche Nachhaltigkeits- und Folgenprüfungsarchitektur"
    if marker not in base:
        raise RuntimeError("Einfügeanker für v1.7 fehlt")
    base = base.replace(marker, f"{delta}\n\n\n{marker}", 1)
    GENERATED.parent.mkdir(parents=True, exist_ok=True)
    GENERATED.write_text(base, encoding="utf-8")


def main() -> None:
    build_source()
    os.environ.update({
        "WOEK_PUBLICATION_SOURCE": str(GENERATED.relative_to(ROOT)),
        "WOEK_PUBLICATION_ONLINE": "content/documents/online/woek-begriffsleitfaden-fuehrend.inc",
        "WOEK_PUBLICATION_PDF": "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.7.pdf",
        "WOEK_PUBLICATION_TITLE": "Führender Begriffsleitfaden der Wirkungsökonomie",
        "WOEK_PUBLICATION_EDITION": "Version 1.7 · Stand 21. August 2026 · Führendes Referenzdokument",
        "WOEK_PUBLICATION_IMAGE_BASE": "../../assets/img/publications/",
        "WOEK_LIBREOFFICE_PATH": os.environ.get("WOEK_LIBREOFFICE_PATH", "/opt/codex/runtimes/codex-primary-runtime/dependencies/bin/override/soffice"),
    })
    runpy.run_path(str(ROOT / "scripts/publications/build-nachhaltigkeit-systemarchitektur-v1.1.py"), run_name="__main__")


if __name__ == "__main__":
    main()
