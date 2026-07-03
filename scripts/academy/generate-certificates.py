from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "data/academy/certificates.json"
OUTPUT_DIR = ROOT / "assets/downloads/zertifikate"
ARCHIVE_DIR = ROOT / "output/pdf"
TMP_DIR = ROOT / "tmp/pdfs"

NAVY = colors.HexColor("#0B1020")
IVORY = colors.HexColor("#F6F1E8")
PAPER = colors.HexColor("#FFFCF5")
GREEN = colors.HexColor("#2F7D5C")
GOLD = colors.HexColor("#C69B3C")
CORAL = colors.HexColor("#C85A4A")
TEXT = colors.HexColor("#252A2C")
LINE = colors.HexColor("#E8E4DC")


def draw_wrapped(c: canvas.Canvas, text: str, x: float, y: float, width: float, style: ParagraphStyle) -> float:
    paragraph = Paragraph(text, style)
    _, height = paragraph.wrap(width, 200 * mm)
    paragraph.drawOn(c, x, y - height)
    return y - height


def draw_centered(c: canvas.Canvas, text: str, x: float, y: float, width: float, font: str, size: float, color=TEXT):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x + (width - stringWidth(text, font, size)) / 2, y, text)


def draw_signet(c: canvas.Canvas, x: float, y: float, radius: float):
    c.setLineWidth(1.1)
    c.setStrokeColor(GREEN)
    c.circle(x - radius * 0.52, y, radius, stroke=1, fill=0)
    c.setStrokeColor(NAVY)
    c.circle(x + radius * 0.52, y, radius, stroke=1, fill=0)
    c.setStrokeColor(GOLD)
    c.circle(x, y - radius * 0.72, radius, stroke=1, fill=0)


def draw_qr(c: canvas.Canvas, value: str, x: float, y: float, size: float):
    qr_code = QrCodeWidget(value)
    bounds = qr_code.getBounds()
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    drawing = Drawing(size, size, transform=[size / width, 0, 0, size / height, 0, 0])
    drawing.add(qr_code)
    renderPDF.draw(drawing, c, x, y)


def set_pdf_metadata(c: canvas.Canvas, record: dict, registry: dict):
    c.setTitle(f"{record['holderName']} - {record['qualificationLabel']}")
    c.setAuthor(registry["issuer"]["name"])
    c.setSubject(f"Zertifikat {record['certificateId']}")


def draw_certificate_pdf(record: dict, registry: dict, out_path: Path):
    width, height = landscape(A4)
    styles = getSampleStyleSheet()
    body = ParagraphStyle(
        "CertificateBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=12.4,
        textColor=TEXT,
        spaceAfter=4,
    )
    small = ParagraphStyle(
        "CertificateSmall",
        parent=body,
        fontSize=4.5,
        leading=5.3,
        textColor=colors.HexColor("#4F5559"),
    )
    compact = ParagraphStyle(
        "CertificateCompact",
        parent=body,
        fontSize=7.2,
        leading=8.8,
    )

    c = canvas.Canvas(str(out_path), pagesize=landscape(A4))
    set_pdf_metadata(c, record, registry)

    margin = 17 * mm
    c.setFillColor(IVORY)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.roundRect(margin, margin, width - 2 * margin, height - 2 * margin, 8, fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.2)
    c.roundRect(margin + 4 * mm, margin + 4 * mm, width - 2 * (margin + 4 * mm), height - 2 * (margin + 4 * mm), 5, fill=0, stroke=1)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.roundRect(margin + 8 * mm, margin + 8 * mm, width - 2 * (margin + 8 * mm), height - 2 * (margin + 8 * mm), 3, fill=0, stroke=1)

    content_x = margin + 18 * mm
    content_w = width - 2 * (margin + 18 * mm)
    top = height - margin - 18 * mm

    draw_signet(c, content_x + content_w / 2, top - 5 * mm, 8 * mm)
    draw_centered(c, "AKADEMIE FÜR WIRKUNGSÖKONOMIE", content_x, top - 21 * mm, content_w, "Helvetica-Bold", 9.5, GOLD)
    draw_centered(c, "ZERTIFIKAT", content_x, top - 38 * mm, content_w, "Times-Bold", 31, NAVY)
    draw_centered(c, "Private interne Meisterstufe der Wirkungsökonomie", content_x, top - 49 * mm, content_w, "Helvetica", 11, TEXT)

    c.setStrokeColor(LINE)
    c.line(content_x + 33 * mm, top - 57 * mm, content_x + content_w - 33 * mm, top - 57 * mm)

    draw_centered(c, record["holderName"], content_x, top - 76 * mm, content_w, "Times-Bold", 30, NAVY)
    draw_centered(c, record["qualificationLabel"], content_x, top - 88 * mm, content_w, "Helvetica-Bold", 13, GREEN)

    c.setFont("Helvetica", 9)
    c.setFillColor(TEXT)
    details_y = top - 99 * mm
    c.drawString(content_x + 1 * mm, details_y, f"Zertifikats-ID: {record['certificateId']}")
    c.drawString(content_x + 1 * mm, details_y - 7 * mm, f"Ausgestellt am: {record['issueDateDisplay']}")
    c.drawString(content_x + 1 * mm, details_y - 14 * mm, f"Status: {record['status']} - Version {record['version']}")
    c.drawString(content_x + 1 * mm, details_y - 21 * mm, f"Freigabe: {record['releaseAuthority']}")

    right_x = content_x + content_w - 58 * mm
    qr_size = 31 * mm
    draw_qr(c, record["verificationUrl"], right_x, details_y - 24 * mm, qr_size)
    c.setFont("Helvetica", 6.4)
    c.setFillColor(colors.HexColor("#4F5559"))
    c.drawCentredString(right_x + qr_size / 2, details_y - 27 * mm, "QR-Code zur öffentlichen Verifikation")

    text_x = content_x + 1 * mm
    text_w = content_w - 68 * mm
    compact_basis = record["recognitionBasis"]
    if record["certificateId"] == "WOEK-PH-2025-0001":
        compact_basis = "Anerkennung als Begründerin der Wirkungsökonomie; originäre Entwicklungs-, Lehr- und Prüfungsleistung zur internen Meisterstufe Ph.WÖk."
    scope_text = "Wirkungskompetenz: Wirkungslogik, positive Netto-Wirkung, SDG/SDG+, Nichtkompensation, Reverse Merit Order, Wirkungsarchitektur, Wirkungsdaten und Rückkopplung."
    y = details_y - 25 * mm
    y = draw_wrapped(c, f"<b>Prüfungs- und Anerkennungsgrundlage:</b> {compact_basis}", text_x, y, text_w, compact)
    y -= 1.5 * mm
    draw_wrapped(c, f"<b>Gegenstand der Qualifikation:</b> {scope_text}.", text_x, y, text_w, compact)

    c.setStrokeColor(LINE)
    c.line(content_x + 1 * mm, margin + 18 * mm, content_x + content_w - 1 * mm, margin + 18 * mm)
    draw_wrapped(c, f"<b>Rechtlicher Hinweis:</b> {registry['legalNotice']} Verifikation: {record['verificationUrl']}", content_x + 1 * mm, margin + 16 * mm, content_w - 2 * mm, small)

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(NAVY)
    c.drawString(content_x + 1 * mm, margin + 6.2 * mm, registry["issuer"]["name"])
    c.setFont("Helvetica", 7)
    c.setFillColor(colors.HexColor("#4F5559"))
    c.drawRightString(content_x + content_w - 1 * mm, margin + 6.2 * mm, "Wirkung statt Kapital. Für Mensch, Planet und Demokratie.")

    c.showPage()
    c.save()


def flatten_certificate_pdf(vector_path: Path, out_path: Path, record: dict, registry: dict):
    pdftoppm = shutil.which("pdftoppm")
    if not pdftoppm:
        shutil.copyfile(vector_path, out_path)
        return

    TMP_DIR.mkdir(parents=True, exist_ok=True)
    image_prefix = TMP_DIR / f"{out_path.stem}-flattened"
    image_path = image_prefix.with_suffix(".png")
    subprocess.run(
        [pdftoppm, "-singlefile", "-png", "-r", "220", str(vector_path), str(image_prefix)],
        check=True,
    )

    width, height = landscape(A4)
    c = canvas.Canvas(str(out_path), pagesize=landscape(A4))
    set_pdf_metadata(c, record, registry)
    c.drawImage(ImageReader(str(image_path)), 0, 0, width=width, height=height, preserveAspectRatio=False)
    c.showPage()
    c.save()


def certificate_pdf(record: dict, registry: dict, out_path: Path):
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    vector_path = TMP_DIR / f"{out_path.stem}.vector.pdf"
    draw_certificate_pdf(record, registry, vector_path)
    flatten_certificate_pdf(vector_path, out_path, record, registry)


def main():
    registry = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    for record in registry["certificates"]:
        record = {
            **record,
            "verificationUrl": f"https://wirkungsoekonomie.de/{record['verificationPath']}",
        }
        out_path = ROOT / record["pdfPath"]
        certificate_pdf(record, registry, out_path)
        archive_path = ARCHIVE_DIR / out_path.name
        certificate_pdf(record, registry, archive_path)
        print(f"Wrote {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
