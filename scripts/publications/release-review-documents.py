from __future__ import annotations

import argparse
import html
import re
import shutil
import textwrap
import zipfile
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = ROOT / "public/downloads/originals"
ONLINE_DIR = ROOT / "content/documents/online"
SOURCE_DIR = ROOT / "source-assets/originals/review-release"


DOCUMENTS = [
    {
        "id": "beispiel-apfel-wirkungssteuer",
        "title": "Beispiel: Regionaler Apfel vs. Chile-Apfel",
        "source": ROOT / "content/internal-documents/originals/Beispiel_Apfel_Wirkungssteuer_Bonusregel.pdf",
        "public_name": "Beispiel_Apfel_Wirkungssteuer_Bonusregel.pdf",
        "mode": "copy",
    },
    {
        "id": "beispiel-konzern",
        "title": "Fallbeispiel: Von der CSRD zur Produktscorecard",
        "source": ROOT / "content/internal-documents/originals/Beispiel-Konzern.pdf",
        "public_name": "Beispiel-Konzern.pdf",
        "mode": "copy",
    },
    {
        "id": "wp-produkte",
        "title": "Produktbesteuerung durch Wirkung",
        "source": ROOT / "content/internal-documents/originals/WP_Produkte.pdf",
        "public_name": "WP_Produkte.pdf",
        "mode": "clean-pdf",
        "remove": [
            r"Soll ich jetzt den nächsten Abschnitt schreiben.*?(?:\?|$)",
        ],
    },
    {
        "id": "wp-einkommen",
        "title": "Wirkungseinkommen",
        "source": ROOT / "content/internal-documents/originals/WP_Einkommen.pdf",
        "public_name": "WP_Einkommen.pdf",
        "mode": "copy",
    },
    {
        "id": "wp-wohnungsmarkt",
        "title": "Working-Paper Wohnungsmarkt",
        "source": ROOT / "content/internal-documents/originals/WP_Wohnungsmarkt_.pdf",
        "public_name": "WP_Wohnungsmarkt.pdf",
        "mode": "copy",
    },
    {
        "id": "wenn-maschinen-arbeiten",
        "title": "Wenn Maschinen arbeiten",
        "source": ROOT / "content/internal-documents/originals/Wenn Maschinen arbeiten.pdf",
        "public_name": "Wenn-Maschinen-arbeiten.pdf",
        "mode": "clean-pdf",
        "remove": [
            r"Möchtest du, dass ich jetzt Abschnitt.*?(?:\?|$)",
            r"Moechtest du, dass ich jetzt Abschnitt.*?(?:\?|$)",
            r"1\.2\s*[–-]\s*These:\s*Einkommenssystem an Wirkung koppeln\s+schreibe\s*\(nahtlos\s+weiter\s+im\s+gleichen\s+Stil\)\?\s*",
        ],
    },
    {
        "id": "nats-woek-allgemein",
        "title": "Von Kapital zu Wirkung",
        "source": ROOT / "content/internal-documents/originals/NATS_WÖk@allgemein.pdf",
        "public_name": "NATS_WOeK_allgemein.pdf",
        "mode": "copy",
    },
    {
        "id": "woek-master-items-register",
        "title": "WÖk Master Items Register",
        "source": ROOT / "content/internal-documents/originals/WOeK_Master_Items_final_v1.2.pdf",
        "public_name": "WOeK_Master_Items_final_v1.2.pdf",
        "mode": "copy",
    },
    {
        "id": "sexarbeit-als-soziale-infrastruktur",
        "title": "Sexarbeit als soziale Infrastruktur",
        "source": Path("Sexarbeit als soziale Infrastruktur.docx"),
        "public_name": "Sexarbeit-als-soziale-Infrastruktur.pdf",
        "mode": "docx-to-pdf",
    },
    {
        "id": "illusionmaschine-buerokratieabbau",
        "title": "IllusionMaschine Bürokratieabbau",
        "source": Path("IllusionMaschine-Bürokratieabbau.pdf"),
        "public_name": "IllusionMaschine-Buerokratieabbau.pdf",
        "mode": "copy",
    },
    {
        "id": "wp-rente",
        "title": "Working-Paper Rente",
        "source": Path("WP_Rente.pdf"),
        "public_name": "WP_Rente.pdf",
        "mode": "copy",
    },
]


def extract_pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = []
    for index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        pages.append(f"\n\n[Seite {index}]\n{text}")
    return "\n".join(pages)


def extract_docx_text(path: Path) -> str:
    with zipfile.ZipFile(path) as archive:
        xml = archive.read("word/document.xml").decode("utf-8", "replace")
    xml = re.sub(r"</w:p>", "\n\n", xml)
    xml = re.sub(r"<[^>]+>", " ", xml)
    xml = html.unescape(xml)
    return normalize_text(xml)


def normalize_text(value: str) -> str:
    value = value.replace("\u00a0", " ")
    value = value.replace("CO₂", "CO2")
    value = value.replace("CO\u2082", "CO2")
    value = value.replace("CO■", "CO2")
    value = value.replace("CO□", "CO2")
    value = value.replace("CO\u25a0", "CO2")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def clean_text(text: str, patterns: list[str] | None = None) -> str:
    text = normalize_text(text)
    text = re.sub(r"^\s*\[Seite\s+\d+\]\s*", "", text, flags=re.MULTILINE)
    for pattern in patterns or []:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE | re.DOTALL)
    redaction_patterns = [
        r"ChatGPT",
        r"Codex",
        r"Armin\s*Maiwald",
        r"Armin-Mailwald",
        r"Redaktionsanweisung",
        r"redaktionelle Anweisung",
        r"Soll ich",
        r"Möchtest du",
        r"Moechtest du",
    ]
    for pattern in redaction_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)
    return normalize_text(text)


def preview_text(doc: dict[str, object], text: str) -> str:
    if doc["id"] == "woek-master-items-register":
        return (
            "Das WÖk Master Items Register ist ein fachliches Arbeitsregister für "
            "Wirkungsindikatoren, Scorecards, Benchmarks und Steuerungslogiken der "
            "Wirkungsökonomie. Die Online-Fassung zeigt eine kurze Einordnung; das "
            "vollständige Register steht als PDF bereit, damit Tabellen, Skalen und "
            "Referenzwerte unverzerrt genutzt werden können.\n\n"
            "Das Register dient als Grundlage für Wirkungsmessung, WÖK-IDs, "
            "Produkt- und Organisationsscorecards, Reverse Merit Order, "
            "Nichtkompensation und Wirkungssteuerung."
        )
    return text


def paragraphs(text: str) -> list[str]:
    chunks = []
    for raw in re.split(r"\n\s*\n|(?<=\.)\s+(?=[A-ZÄÖÜ][\wÄÖÜäöüß -]{8,}:)", text):
        item = " ".join(raw.split()).strip()
        if item:
            chunks.append(item)
    return chunks


def write_pdf(title: str, text: str, destination: Path) -> None:
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "WOeKTitle",
        parent=styles["Title"],
        fontName="Times-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#071126"),
        spaceAfter=14,
    )
    body_style = ParagraphStyle(
        "WOeKBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.2,
        leading=14,
        spaceAfter=7,
    )
    heading_style = ParagraphStyle(
        "WOeKHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#0f5c43"),
        spaceBefore=10,
        spaceAfter=8,
    )
    doc = SimpleDocTemplate(
        str(destination),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title=title,
        author="Natalie Weber",
    )
    story = [Paragraph(html.escape(title), title_style), Spacer(1, 0.25 * cm)]
    for para in paragraphs(text):
        escaped = html.escape(para)
        if len(para) < 92 and not para.endswith("."):
            story.append(Paragraph(escaped, heading_style))
        else:
            story.append(Paragraph(escaped, body_style))
    doc.build(story)


def html_fragment(title: str, text: str) -> str:
    parts = [f"<h2>{html.escape(title)}</h2>"]
    for para in paragraphs(text):
        if para.startswith("[Seite "):
            parts.append(f'<p class="document-page-marker">{html.escape(para)}</p>')
        elif len(para) < 92 and not para.endswith("."):
            parts.append(f"<h3>{html.escape(para)}</h3>")
        else:
            parts.append(f"<p>{html.escape(para)}</p>")
    return "\n".join(parts) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Erzeugt bereinigte öffentliche PDF- und Onlinefassungen.")
    parser.add_argument("--only", action="append", default=[], metavar="ID", help="Nur die angegebene Dokument-ID verarbeiten (wiederholbar).")
    args = parser.parse_args()
    selected = set(args.only)
    if selected:
        known = {str(doc["id"]) for doc in DOCUMENTS}
        unknown = selected - known
        if unknown:
            parser.error(f"Unbekannte Dokument-ID(s): {', '.join(sorted(unknown))}")

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    ONLINE_DIR.mkdir(parents=True, exist_ok=True)
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    for doc in DOCUMENTS:
        if selected and doc["id"] not in selected:
            continue
        source = doc["source"]
        destination = PUBLIC_DIR / doc["public_name"]
        if not source.exists():
            # Nach einem bereinigten Release liegt die redaktionelle Quelle
            # bewusst nicht mehr im öffentlichen Build. Für eine gezielte
            # Nachbereinigung darf die vorhandene öffentliche PDF-Fassung
            # deshalb als nachvollziehbarer Ausgangstext dienen.
            if destination.exists():
                source = destination
            else:
                raise FileNotFoundError(source)
        if source.suffix.lower() == ".docx":
            text = extract_docx_text(source)
        else:
            text = extract_pdf_text(source)
        text = clean_text(text, doc.get("remove"))
        online_text = preview_text(doc, text)
        if doc["mode"] == "copy":
            if source.resolve() != destination.resolve():
                shutil.copy2(source, destination)
        else:
            write_pdf(doc["title"], text, destination)
        (ONLINE_DIR / f"{doc['id']}.inc").write_text(html_fragment(doc["title"], online_text), encoding="utf-8")
        (SOURCE_DIR / f"{doc['id']}.txt").write_text(text + "\n", encoding="utf-8")
        print(f"released {doc['id']} -> {destination.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
