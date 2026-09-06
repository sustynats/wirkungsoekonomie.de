#!/usr/bin/env python3
"""Build the dated v1.2 model introduction without rewriting prior editions."""

import hashlib
import json
from pathlib import Path
from xml.sax.saxutils import escape

import reportlab
from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "outputs/closeout-2026-09-06/pdf"
OUT.mkdir(parents=True, exist_ok=True)
GREEN = colors.HexColor("#215e45")
NAVY = colors.HexColor("#17231b")
PALE = colors.HexColor("#eff3eb")
GOLD = colors.HexColor("#756748")

fonts = Path(reportlab.__file__).parent / "fonts"
for name, filename in (("Learn", "Vera.ttf"), ("LearnBold", "VeraBd.ttf")):
    pdfmetrics.registerFont(TTFont(name, str(fonts / filename)))
pdfmetrics.registerFontFamily("Learn", normal="Learn", bold="LearnBold", italic="Learn", boldItalic="LearnBold")

styles = {
    "p": ParagraphStyle("p", fontName="Learn", fontSize=10, leading=15.5, spaceAfter=11, textColor=NAVY),
    "h1": ParagraphStyle("h1", fontName="LearnBold", fontSize=26, leading=33, spaceAfter=20, textColor=NAVY),
    "h2": ParagraphStyle("h2", fontName="LearnBold", fontSize=18, leading=24, spaceAfter=13, textColor=GREEN, keepWithNext=True),
    "h3": ParagraphStyle("h3", fontName="LearnBold", fontSize=11.5, leading=16, spaceAfter=8, spaceBefore=9, textColor=NAVY, keepWithNext=True),
    "fine": ParagraphStyle("fine", fontName="Learn", fontSize=8.4, leading=12, spaceAfter=10, textColor=GOLD),
    "callout": ParagraphStyle("callout", fontName="LearnBold", fontSize=11, leading=17, spaceAfter=15, borderPadding=12, backColor=PALE, textColor=NAVY),
}


def norm(value):
    return value.translate({0x2010: "-", 0x2011: "-", 0x2012: "-", 0x2013: "-", 0x2014: "-", 0x2212: "-", 0x2192: " > ", 0x0394: "Delta ", 0x2082: "2"})


def paragraph(text, kind="p"):
    return Paragraph(norm(escape(text)), styles[kind])


def link(label, url):
    safe_url = escape(url, {'"': "&quot;"})
    return Paragraph(f'<a href="{safe_url}" color="#215e45">{escape(label)}</a>', styles["p"])


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#d0d9cc"))
    canvas.line(48, 44, A4[0] - 48, 44)
    canvas.setFont("Learn", 7.5)
    canvas.setFillColor(NAVY)
    canvas.drawString(48, 29, "Wirkungsökonomie | Einführung v1.2 | 06.09.2026 | Modellbeispiele")
    canvas.drawRightString(A4[0] - 48, 29, str(doc.page))
    canvas.restoreState()


home = json.loads((ROOT / "content/site/home-explainer.json").read_text())
filename = "woek-einfach-erklaert-2026-09-06-v1-2.pdf"
story = [
    paragraph("WIRKUNGSÖKONOMIE EINFACH ERKLÄRT | V1.2 | 06.09.2026", "fine"),
    paragraph(home["title"], "h1"),
    paragraph(home["intro"]),
    paragraph(home["scopeTitle"], "h2"),
    paragraph(home["scope"]),
]
for title, text in home["scopeExamples"]:
    story.extend((paragraph(title, "h3"), paragraph(text)))
story.extend((
    paragraph("Die Beispiele veranschaulichen das Modell. Sie sind keine empirischen Fallstudien.", "fine"),
    PageBreak(),
    paragraph(home["exampleTitle"], "h1"),
    paragraph(home["example"]),
))
for step, title, text in home["steps"]:
    story.extend((paragraph(f"{step}: {title}", "h2"), paragraph(text)))
story.extend((
    paragraph(home["exampleConclusion"], "callout"),
    paragraph("Was heißt hier Wirkung?", "h2"),
    paragraph(home["principle"]),
    PageBreak(),
    paragraph("Ein gemeinsamer Rahmen", "h1"),
    paragraph(home["framework"]),
    paragraph(home["integration"]),
    paragraph("Schutzgrenzen und Lernen", "h2"),
    paragraph("Nichtkompensation bedeutet: Harte Schutzgrenzen lassen sich nicht durch andere Vorteile aufwiegen. Reverse Merit Order lenkt die Bearbeitung zuerst auf kritische negative Wirkungen. Bewertet werden Maßnahmen und ihre Folgen, keine Menschen als Personen."),
    paragraph(home["status"]),
    paragraph("Transparenter Versionsstand", "h2"),
    paragraph("Version 1.2 ersetzt auf der Startseite und in dieser Einführung das zahlenreiche Küchenbeispiel durch einen leichter verständlichen Schulweg. Die vertiefende Impact-Controlling-Fassung behält die Schulküche als eigenes Rechenbeispiel. Version 1.1 bleibt historisch verfügbar."),
    paragraph("Weiterlesen und ausprobieren", "h2"),
    link("Das vollständige Impact-Controlling-Beispiel mit Formeln", "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/"),
    link("Der einfache Rechner in drei Schritten", "https://wirkungsoekonomie.de/erleben/impact-controlling-rechner/"),
    link("Methodik und bestehende staatliche Verfahren", "https://wirkungsoekonomie.de/methodik/"),
    link("Publikationsstände und Ergänzungen", "https://wirkungsoekonomie.de/referenz/aktualisierung/"),
    link("Agenda 2030: die 17 SDGs", "https://sdgs.un.org/goals"),
))

pdf_path = OUT / filename
SimpleDocTemplate(
    str(pdf_path),
    pagesize=A4,
    topMargin=48,
    leftMargin=48,
    rightMargin=48,
    bottomMargin=60,
    title="Wirkungsökonomie einfach erklärt: Wirtschafts- und Gesellschaftsmodell",
    author="Natalie Weber",
    creator="Natalie Weber",
    subject="Verständlicher Lernweg mit offen ausgewiesenen Modellannahmen",
    invariant=1,
).build(story, onFirstPage=footer, onLaterPages=footer)

sources = [
    "content/site/home-explainer.json",
    "scripts/site/build-home-explainer.mjs",
    "scripts/publications/build-model-explainer-v1-2.py",
    "scripts/lib/model-definition-update.mjs",
]
manifest = {
    "reviewedAt": "2026-09-06",
    "version": "1.2",
    "releaseTag": "woek-gesamtmodell-2026-09-06-v1-2",
    "supersedesSources": [
        "content/site/home-explainer.json",
        "scripts/site/build-home-explainer.mjs",
        "scripts/lib/model-definition-update.mjs",
    ],
    "sourceHashes": {source: hashlib.sha256((ROOT / source).read_bytes()).hexdigest() for source in sources},
    "files": [{
        "filename": filename,
        "title": "Wirkungsökonomie einfach erklärt: Wirtschafts- und Gesellschaftsmodell (v1.2)",
        "kind": "explainer",
        "supersedes": "woek-einfach-erklaert-2026-09-06-v1-1.pdf",
        "url": f"https://github.com/sustynats/wirkungsoekonomie.de/releases/download/woek-gesamtmodell-2026-09-06-v1-2/{filename}",
        "sha256": hashlib.sha256(pdf_path.read_bytes()).hexdigest(),
        "bytes": pdf_path.stat().st_size,
        "pages": len(PdfReader(pdf_path).pages),
    }],
}
manifest_path = ROOT / "assets/data/model-explainer-edition-2026-09-06-v1-2.json"
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
(OUT / manifest_path.name).write_text(manifest_path.read_text())
(OUT / "MODEL-V1-2-SHA256SUMS").write_text(f"{manifest['files'][0]['sha256']}  {filename}\n")
print(manifest["files"])
