#!/usr/bin/env python3
"""Markiert bekannte historische Quellen dauerhaft als Archivquellen.

Die Dokumente bleiben für bereits vorhandene Fundstellen lesbar. Vor dem
historischen Text steht jedoch ein eindeutiges Deckblatt mit der fachlichen
Korrektur. Das gilt für Personen-Scoring-Papiere ebenso wie für die drei
zurückgezogenen T-SROI-Duplikate mit Multiplikatorverweisen. Ein versehentlich
übernommener Arbeitsprozess-Satz wird direkt in der PDF entfernt. ``--check``
ist absichtlich schreibfrei und dient dem Release-Gate.
"""

from __future__ import annotations

import argparse
import io
import os
import re
import tempfile
from dataclasses import dataclass
from pathlib import Path

import fitz
from pypdf import PdfReader, PdfWriter
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[2]
MARKER = "WÖK-HISTORISCHE-QUELLENFASSUNG"
PROMPT_PATTERNS = (
    re.compile(r"Möchtest du, dass ich jetzt Abschnitt", re.IGNORECASE),
    re.compile(r"Moechtest du, dass ich jetzt Abschnitt", re.IGNORECASE),
    re.compile(r"Soll ich jetzt den nächsten Abschnitt schreiben", re.IGNORECASE),
)

T_SROI_ARCHIVE_SAFEGUARD = (
    "Der aktuelle Rechenstandard rechnet abgegrenzte und diskontierte Nutzenströme, "
    "zieht Schäden innerhalb der Bilanzgrenze separat ab und setzt sie zu diskontierten "
    "Ressourcen ins Verhältnis. Unsicherheit darf Nutzenannahmen konservativ mindern, "
    "nicht aber Schäden verkleinern. Datenqualität und Resilienz sind Prüf- und "
    "Sensitivitätsbedingungen. Ein positiver T-SROI setzt ein offenes Schutz-Gate voraus."
)


@dataclass(frozen=True)
class Publication:
    path: str
    title: str
    successor: str
    successor_label: str
    correction: str
    safeguard: str = (
        "Die Wirkungsökonomie ist kein Social-Credit-System: Sie bewertet keine Menschen, führt keine persönlichen Wirkungskonten und trifft keine automatischen Entscheidungen über Einzelne. "
        "Wirkungen werden an Angeboten, Entscheidungen und Systemen geprüft. Nichtkompensation und Reverse Merit Order sind Schutzgrenzen in dieser Prüfung, keine Rechtfertigung für Personeneingriffe."
    )
    required_cover_terms: tuple[str, ...] = ()


PUBLICATIONS = (
    Publication(
        "assets/pdf/wenn-maschinen-arbeiten.pdf",
        "Wenn Maschinen arbeiten",
        "https://wirkungsoekonomie.de/wirkungsfelder/arbeit-einkommen/",
        "Aktuelle Einordnung zu Arbeit & Einkommen",
        "Passagen zu individuellen Wirkungswerten, persönlichen Konten und automatischen Steuer-, Transfer- oder Leistungsfolgen sind verworfen.",
    ),
    Publication(
        "public/downloads/originals/Wenn-Maschinen-arbeiten.pdf",
        "Wenn Maschinen arbeiten",
        "https://wirkungsoekonomie.de/wirkungsfelder/arbeit-einkommen/",
        "Aktuelle Einordnung zu Arbeit & Einkommen",
        "Passagen zu individuellen Wirkungswerten, persönlichen Konten und automatischen Steuer-, Transfer- oder Leistungsfolgen sind verworfen.",
    ),
    Publication(
        "assets/pdf/working-paper-produktbesteuerung-durch-wirkung.pdf",
        "Produktbesteuerung durch Wirkung",
        "https://wirkungsoekonomie.de/wirkungsfelder/produkte-konsum/dossier/",
        "Aktuelles Dossier Produkte & Konsum",
        "Automatische Zuordnungen von Scores zu Steuerklassen oder Preisen sowie jede Ausdehnung auf Personen oder Einkommen sind verworfen.",
    ),
    Publication(
        "public/downloads/originals/WP_Produkte.pdf",
        "Produktbesteuerung durch Wirkung",
        "https://wirkungsoekonomie.de/wirkungsfelder/produkte-konsum/dossier/",
        "Aktuelles Dossier Produkte & Konsum",
        "Automatische Zuordnungen von Scores zu Steuerklassen oder Preisen sowie jede Ausdehnung auf Personen oder Einkommen sind verworfen.",
    ),
    Publication(
        "public/downloads/originals/WP_Rente.pdf",
        "Working-Paper Rente",
        "https://wirkungsoekonomie.de/wirkungsfelder/rente-soziale-sicherung/",
        "Aktuelle Einordnung zu Rente & sozialer Sicherung",
        "Die Verrechnung persönlicher Biografien, Wirkungsfaktoren und Rentenhöhen ist verworfen. Die WÖk bewertet keine Personen und automatisiert keine individuellen Leistungsansprüche.",
    ),
    Publication(
        "assets/downloads/08_woek_wirtschaft_unternehmen_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0 2.pdf",
        "Wirkungsorientiertes Risikomanagement, Resilienz und Finanzmarktanforderungen",
        "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
        "Aktuellen T-SROI-Rechenstandard öffnen",
        "Verweise auf einen Transformationsmultiplikator sind verworfen. Im aktuellen Rechenstandard ist transformative Wirkung ein separat belegter und diskontierter Nettonutzenstrom, kein Aufschlagsfaktor.",
        "Die aktuelle T-SROI-Rechnung verwendet keine freien Transformations-, Resilienz- oder Datenqualitätsmultiplikatoren. Datenqualität, Unsicherheit und Resilienz werden dokumentiert, geprüft und in Sensitivitäten behandelt. Ein positiver Wert setzt eine abgegrenzte, kausal belegte Bilanz und ein offenes Schutz-Gate voraus.",
    ),
    Publication(
        "assets/downloads/30_woek_finanzsystem_kapital_kapitalwirkung_statt_kapitalrendite_detailkonzept_v1_0 2.pdf",
        "Kapital als Wirkungskraft und Kapitalwirkung statt Kapitalrendite",
        "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
        "Aktuellen T-SROI-Rechenstandard öffnen",
        "Verweise auf einen Transformationsmultiplikator sind verworfen. Im aktuellen Rechenstandard ist transformative Wirkung ein separat belegter und diskontierter Nettonutzenstrom, kein Aufschlagsfaktor.",
        "Die aktuelle T-SROI-Rechnung verwendet keine freien Transformations-, Resilienz- oder Datenqualitätsmultiplikatoren. Datenqualität, Unsicherheit und Resilienz werden dokumentiert, geprüft und in Sensitivitäten behandelt. Ein positiver Wert setzt eine abgegrenzte, kausal belegte Bilanz und ein offenes Schutz-Gate voraus.",
    ),
    Publication(
        "assets/downloads/31_woek_finanzsystem_kapital_wirkungsfonds_dacharchitektur_detailkonzept_v1_0 2.pdf",
        "Wirkungsfonds als Dacharchitektur",
        "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
        "Aktuellen T-SROI-Rechenstandard öffnen",
        "Verweise auf einen Transformationsmultiplikator sind verworfen. Im aktuellen Rechenstandard ist transformative Wirkung ein separat belegter und diskontierter Nettonutzenstrom, kein Aufschlagsfaktor.",
        "Die aktuelle T-SROI-Rechnung verwendet keine freien Transformations-, Resilienz- oder Datenqualitätsmultiplikatoren. Datenqualität, Unsicherheit und Resilienz werden dokumentiert, geprüft und in Sensitivitäten behandelt. Ein positiver Wert setzt eine abgegrenzte, kausal belegte Bilanz und ein offenes Schutz-Gate voraus.",
    ),
    Publication(
        "assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_0.pdf",
        "T-SROI und Impact Controlling v1.0",
        "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
        "Führenden T-SROI-Rechenstandard v1.1 öffnen",
        "Die frühere multiplikative T-SROI-Formel mit Transformations-, Resilienz- oder Datenqualitätsaufschlägen ist verworfen. Im T-SROI-Rechenstandard v1.1 ist transformative Wirkung ein separat belegter und diskontierter Nettonutzenstrom, kein Aufschlagsfaktor.",
        safeguard=T_SROI_ARCHIVE_SAFEGUARD,
        required_cover_terms=("T-SROI-Rechenstandard v1.1", "kein Aufschlagsfaktor", "Schutz-Gate"),
    ),
    Publication(
        "assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_0 2.pdf",
        "T-SROI und Impact Controlling v1.0 (historische Duplikatfassung)",
        "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
        "Führenden T-SROI-Rechenstandard v1.1 öffnen",
        "Die frühere multiplikative T-SROI-Formel mit Transformations-, Resilienz- oder Datenqualitätsaufschlägen ist verworfen. Im T-SROI-Rechenstandard v1.1 ist transformative Wirkung ein separat belegter und diskontierter Nettonutzenstrom, kein Aufschlagsfaktor.",
        safeguard=T_SROI_ARCHIVE_SAFEGUARD,
        required_cover_terms=("T-SROI-Rechenstandard v1.1", "kein Aufschlagsfaktor", "Schutz-Gate"),
    ),
    Publication(
        "assets/downloads/impact-controlling-einfach-erklaert.pdf",
        "Impact Controlling einfach erklärt",
        "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
        "Führenden T-SROI-Rechenstandard v1.1 öffnen",
        "Die gezeigte multiplikative T-SROI-Formel mit Transformations-, Resilienz- oder Datenqualitätsaufschlägen ist verworfen. Im T-SROI-Rechenstandard v1.1 ist transformative Wirkung ein separat belegter und diskontierter Nettonutzenstrom, kein Aufschlagsfaktor.",
        safeguard=T_SROI_ARCHIVE_SAFEGUARD,
        required_cover_terms=("T-SROI-Rechenstandard v1.1", "kein Aufschlagsfaktor", "Schutz-Gate"),
    ),
    Publication(
        "assets/downloads/wirkungscontrolling_detailkonzept_dossier_v1_0.pdf",
        "Wirkungscontrolling - Detailkonzept v1.0",
        "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
        "Führenden T-SROI-Rechenstandard v1.1 öffnen",
        "Die frühere multiplikative T-SROI-Formel mit Transformations-, Resilienz- oder Datenqualitätsaufschlägen ist verworfen. Im T-SROI-Rechenstandard v1.1 ist transformative Wirkung ein separat belegter und diskontierter Nettonutzenstrom, kein Aufschlagsfaktor.",
        safeguard=T_SROI_ARCHIVE_SAFEGUARD,
        required_cover_terms=("T-SROI-Rechenstandard v1.1", "kein Aufschlagsfaktor", "Schutz-Gate"),
    ),
)


def text_from_reader(path: Path) -> str:
    return "\n".join((page.extract_text() or "") for page in PdfReader(str(path)).pages)


def contains_prompt(value: str) -> bool:
    return any(pattern.search(value) for pattern in PROMPT_PATTERNS)


def has_marker(page: fitz.Page) -> bool:
    return MARKER in (page.get_text() or "")


def redact_prompt_lines(document: fitz.Document) -> int:
    """Redact whole PDF text lines that contain an editorial prompt."""
    redactions = 0
    for page in document:
        lines = []
        for block in page.get_text("dict").get("blocks", []):
            for line in block.get("lines", []):
                text = "".join(span.get("text", "") for span in line.get("spans", [])).strip()
                if contains_prompt(text):
                    lines.append(fitz.Rect(line["bbox"]))
        for rect in lines:
            page.add_redact_annot(rect, fill=(1, 1, 1))
        if lines:
            page.apply_redactions()
            redactions += len(lines)
    return redactions


def build_cover(publication: Publication) -> bytes:
    stream = io.BytesIO()
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "HistoricalTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#071126"),
        spaceAfter=10,
    )
    subtitle_style = ParagraphStyle(
        "HistoricalSubtitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#8b2e1f"),
        spaceAfter=14,
    )
    body_style = ParagraphStyle(
        "HistoricalBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        alignment=TA_LEFT,
        spaceAfter=8,
    )
    small_style = ParagraphStyle(
        "HistoricalSmall",
        parent=body_style,
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#334155"),
    )
    document = SimpleDocTemplate(
        stream,
        pagesize=A4,
        rightMargin=2.1 * cm,
        leftMargin=2.1 * cm,
        topMargin=2.0 * cm,
        bottomMargin=1.8 * cm,
        title=f"{publication.title} - historische Quellenfassung",
        author="Wirkungsökonomie",
        subject="Historische Einordnung und fachliche Korrektur",
    )
    story = [
        Paragraph(MARKER, small_style),
        Spacer(1, 0.25 * cm),
        Paragraph(publication.title, title_style),
        Paragraph("Historische Quellenfassung - ersetzt", subtitle_style),
        Paragraph(
            "Dieses Dokument bleibt nur für bestehende Fundstellen und die Entwicklungsgeschichte zugänglich. "
            "Es ist kein aktueller fachlicher Maßstab und keine Grundlage für reale Entscheidungen.",
            body_style,
        ),
        Paragraph("Was daran nicht mehr gilt", subtitle_style),
        Paragraph(publication.correction, body_style),
        Paragraph(publication.safeguard, body_style),
        Paragraph("Wohin für den aktuellen Stand", subtitle_style),
        Paragraph(
            f'<link href="{publication.successor}"><font color="#0f5c43">{publication.successor_label}: {publication.successor}</font></link>',
            body_style,
        ),
        Spacer(1, 0.2 * cm),
        Paragraph(
            "Der historische Text beginnt auf der nächsten Seite. Er darf nicht als Rechenstandard, Rechtsgrundlage oder Entscheidungsregel verwendet werden.",
            small_style,
        ),
    ]
    document.build(story)
    return stream.getvalue()


def write_historical_cover(publication: Publication) -> int:
    target = ROOT / publication.path
    if not target.exists():
        raise FileNotFoundError(target)

    source = fitz.open(target)
    if source.page_count and has_marker(source[0]):
        source.delete_page(0)
    redactions = redact_prompt_lines(source)
    with tempfile.TemporaryDirectory(prefix="woek-historical-pdf-") as tmp:
        body_path = Path(tmp) / "body.pdf"
        cover_path = Path(tmp) / "cover.pdf"
        output_path = Path(tmp) / "output.pdf"
        source.save(body_path, garbage=4, deflate=True)
        source.close()
        cover_path.write_bytes(build_cover(publication))

        writer = PdfWriter()
        writer.append(PdfReader(str(cover_path)))
        writer.append(PdfReader(str(body_path)))
        writer.add_metadata({
            "/Title": f"{publication.title} - historische Quellenfassung",
            "/Author": "Wirkungsökonomie",
            "/Subject": "Historische Einordnung und fachliche Korrektur",
            "/Keywords": "historische Quellenfassung, ersetzt, keine Personenbewertung",
        })
        with output_path.open("wb") as handle:
            writer.write(handle)
        os.replace(output_path, target)
    return redactions


def check_publication(publication: Publication) -> list[str]:
    path = ROOT / publication.path
    errors: list[str] = []
    if not path.exists():
        return [f"missing PDF: {publication.path}"]
    reader = PdfReader(str(path))
    if not reader.pages:
        return [f"empty PDF: {publication.path}"]
    first_page = reader.pages[0].extract_text() or ""
    for required in (MARKER, "Historische Quellenfassung", "ersetzt", *publication.required_cover_terms):
        if required not in first_page:
            errors.append(f"{publication.path}: historical cover is missing {required!r}")
    # PDF-Text-Extraktoren umbrechen lange URLs gelegentlich. Die sichtbare
    # Nachfolger-URL wird daher ohne Zeilen-/Leerraum geprüft.
    if re.sub(r"\s+", "", publication.successor) not in re.sub(r"\s+", "", first_page):
        errors.append(f"{publication.path}: historical cover is missing {publication.successor!r}")
    all_text = "\n".join((page.extract_text() or "") for page in reader.pages)
    if contains_prompt(all_text):
        errors.append(f"{publication.path}: editorial prompt remains in PDF text")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser(description="Erstellt und prüft historische PDF-Deckblätter.")
    parser.add_argument("--check", action="store_true", help="Nur prüfen, nichts schreiben.")
    args = parser.parse_args()

    if args.check:
        errors = [error for publication in PUBLICATIONS for error in check_publication(publication)]
        if errors:
            raise SystemExit("Historical PDF check failed:\n- " + "\n- ".join(errors))
        print(f"Historical PDF check passed for {len(PUBLICATIONS)} canonical PDFs.")
        return

    total_redactions = 0
    for publication in PUBLICATIONS:
        redactions = write_historical_cover(publication)
        total_redactions += redactions
        print(f"archived {publication.path} ({redactions} editorial prompt line(s) redacted)")
    print(f"Historical PDF covers written for {len(PUBLICATIONS)} files; redacted lines: {total_redactions}.")


if __name__ == "__main__":
    main()
