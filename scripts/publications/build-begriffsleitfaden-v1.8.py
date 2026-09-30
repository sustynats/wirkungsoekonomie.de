#!/usr/bin/env python3
"""Cumulative terminology v1.8; keep the historical v1.7 source and PDF intact."""
from __future__ import annotations

import importlib.util
import json
import os
import re
from urllib.parse import unquote, urlparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.7.md"
DELTA = ROOT / "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.8-wirkungsfenster.md"
GENERATED = ROOT / "source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.8.md"


def historical_source() -> str:
    base = BASE.read_text(encoding="utf-8")
    # The legacy prebuild can reinsert the superseded v1.6 migration notice.
    # Omit only that duplicate in new outputs; never rewrite the old source.
    duplicate = "Die folgende Matrix dokumentiert den damaligen v1.5-Migrationsauftrag. Sie ist kein offener v1.6-Release-Tracker. Für neue Inhalte gelten die Ergänzung v1.6, die dort genannten amtlichen Quellen und die aktuellen maschinenlesbaren Qualitätsgates.\n\n"
    if "Sie ist kein offener v1.7-Release-Tracker." in base:
        base = base.replace(duplicate, "")
    return base.replace("woek_systemhierarchie_v15.png", "woek-systemhierarchie-v15.png").replace("woek_architektur_v15.png", "woek-architektur-v15.png")


def build_source() -> str:
    base = historical_source()
    term = json.loads((ROOT / "content/glossary/imports/begriffsleitfaden-v1.8.json").read_text(encoding="utf-8"))["terms"][0]
    delta = DELTA.read_text(encoding="utf-8").strip().replace("{{SHORT_DEFINITION}}", term["shortDefinition"]).replace("{{LONG_DEFINITION}}", term["longDefinition"])
    replacements = {
        "**Version 1.7 · Stand 21. August 2026 · Führendes Referenzdokument**": "**Version 1.8 · Stand 30. September 2026 · Führendes Referenzdokument**",
        "Diese Version ersetzt Version 1.6 als führende begriffliche Arbeitsgrundlage. Ältere Fassungen bleiben als historische, zitierfähige Entwicklungsstände erhalten. Im Widerspruchsfall gilt für neue Inhalte Version 1.7.": "Diese Version ersetzt Version 1.7 als führende begriffliche Arbeitsgrundlage. Ältere Fassungen bleiben als historische, zitierfähige Entwicklungsstände erhalten. Im Widerspruchsfall gilt für neue Inhalte Version 1.8.",
        "**Direkte Basis dieser Fassung ist Version 1.6 vom 21. August 2026.** Version 1.7 ist kein Neuaufbau, sondern ein geprüftes Delta auf Version 1.6.": "**Direkte Basis dieser Fassung ist Version 1.7 vom 21. August 2026.** Version 1.8 ergänzt kumulativ die Gestaltungs-, Schutz- und Rückkopplungslogik um das Wirkungsfenster. Alle Präzisierungen aus v1.5, v1.6 und v1.7 bleiben erhalten.",
        "| Version | 1.7 |": "| Version | 1.8 |",
        "| Stand | 21. August 2026 |": "| Stand | 30. September 2026 |",
        "## Changelog Version 1.7": "## Changelog Version 1.8\n\n- Wirkungsfenster als WÖk-Präzisierungsbegriff mit führender Kurz- und Langdefinition eingeführt.\n- Hypothese, Evidenz, Schutz und Entscheidung getrennt; Gegenstand und Steuerungsinstrument eigenständig prüfen.\n- Bestehende WÖMS-Arbeitsflächen um fallbezogene Gestaltungs- und Lernfragen ergänzt; keine neue Methode, Kennzahl oder Pflichtstufe.\n- Medizinische Analogie mit Quellenfunktion und Grenzen dokumentiert; historische Publikationen bleiben erhalten.\n\n## Changelog Version 1.7",
        "- 0a. Ergänzung v1.7": "- 0. Ergänzung v1.8: Wirkungsfenster\n\n- 0a. Ergänzung v1.7",
        "# Ergänzung v1.7: Wirkungsrelevanz und objektspezifische staatliche Prüfarchitektur": delta + "\n\n# Ergänzung v1.7: Wirkungsrelevanz und objektspezifische staatliche Prüfarchitektur",
        "Für neue Inhalte gelten die Ergänzungen v1.6 und v1.7 sowie": "Für neue Inhalte gelten die Ergänzungen v1.6, v1.7 und v1.8 sowie",
    }
    for old, new in replacements.items():
        if old not in base:
            raise RuntimeError(f"Erwarteter v1.7-Anker fehlt: {old[:100]}")
        base = base.replace(old, new, 1)
    GENERATED.parent.mkdir(parents=True, exist_ok=True)
    GENERATED.write_text(base, encoding="utf-8")
    return base


def main() -> None:
    source = build_source()
    os.environ.update({
        "WOEK_PUBLICATION_SOURCE": str(GENERATED.relative_to(ROOT)),
        "WOEK_PUBLICATION_ONLINE": "content/documents/online/woek-begriffsleitfaden-fuehrend.inc",
        "WOEK_PUBLICATION_PDF": "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.8.pdf",
        "WOEK_PUBLICATION_TITLE": "Führender Begriffsleitfaden der Wirkungsökonomie",
        "WOEK_PUBLICATION_EDITION": "Version 1.8 · Stand 30. September 2026 · Führendes Referenzdokument",
        "WOEK_PUBLICATION_IMAGE_BASE": "../../assets/img/publications/",
    })
    spec = importlib.util.spec_from_file_location("publication", ROOT / "scripts/publications/build-nachhaltigkeit-systemarchitektur-v1.1.py")
    publication = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(publication)
    items = list(publication.blocks(source))
    publication.ONLINE.write_text(publication.build_html(items), encoding="utf-8")
    # New archive route, rendered from the unchanged historical source.
    archive = ROOT / "content/documents/online/woek-begriffsleitfaden-v1.7.inc"
    archive.write_text(publication.build_html(list(publication.blocks(historical_source()))), encoding="utf-8")
    if os.environ.get("WOEK_PDF_BUILD_MODE") == "verify":
        if not publication.PDF.is_file() or not publication.PDF.read_bytes().startswith(b"%PDF-"):
            raise RuntimeError(f"Published PDF missing or invalid: {publication.PDF}")
    elif not publication.SKIP_PDF:
        # The converter uses a temporary HTML directory: resolve figures from
        # the repository for PDF export; public HTML retains relative URLs.
        publication.IMAGE_BASE = (ROOT / "assets/img/publications").as_uri() + "/"
        # LibreOffice does not apply the website's responsive figure styles.
        # Give embedded originals explicit page-safe dimensions, without editing them.
        render_html = publication.build_html
        def pdf_html(blocks):
            from PIL import Image
            def fit_image(match):
                attrs = match.group(1)
                src = re.search(r'src="([^"]+)"', attrs).group(1)
                with Image.open(unquote(urlparse(src).path)) as image:
                    width, height = image.size
                rendered_width = 560
                rendered_height = round(height * rendered_width / width)
                return f'<p><img width="{rendered_width}" height="{rendered_height}" {attrs}></p>'
            return re.sub(r"<img ([^>]+)>", fit_image, render_html(blocks))
        publication.build_html = pdf_html
        publication.build_pdf(items)
        from pypdf import PdfReader, PdfWriter
        reader = PdfReader(publication.PDF)
        writer = PdfWriter(clone_from=reader)
        writer.add_metadata({"/Author": "Natalie Weber", "/Title": "Führender Begriffsleitfaden der Wirkungsökonomie v1.8"})
        with publication.PDF.open("wb") as stream:
            writer.write(stream)
    print(f"Begriffsleitfaden v1.8: {GENERATED.relative_to(ROOT)}; {publication.ONLINE.relative_to(ROOT)}; {publication.PDF.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
