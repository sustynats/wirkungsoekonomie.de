#!/usr/bin/env python3
"""Remove production-only labels from public historical PDF copies.

Private archived originals remain immutable.  The two terminology guides get a
public-facing section title and lead; the duplicate NATS URL receives the
already reviewed, pixel-identical publishing copy.
"""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
ARCHIVE = ROOT / "source-assets/originals/pdf-production-hints-20261013/pre-overlay-originals"
NATS_ARCHIVE = ROOT / "source-assets/originals/pdf-production-hints-20261013/public-downloads-originals"
REPORT = ROOT / "reports/consistency-20261009/pdf-production-note-corrections-20261013.json"
GEORGIA_BOLD = Path("/System/Library/Fonts/Supplemental/Georgia Bold.ttf")
ARIAL = Path("/System/Library/Fonts/Supplemental/Arial.ttf")

GUIDES = [
    {
        "path": "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.0.pdf",
        "archiveSha256": "b18291bad602ba66e5c922db1e7dba619bc2489618689bb624957918da07cd78",
        "page": 15,
        "sectionRect": [50, 105, 570, 190],
        "titleRect": [57, 111, 560, 165],
        "leadRect": [57, 172, 560, 189],
    },
    {
        "path": "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.1.pdf",
        "archiveSha256": "d68b34696885c37b9616d5f64ccc8a9875912a358038b2eeb62e9a584ec1209f",
        "page": 19,
        "sectionRect": [45, 45, 570, 131],
        "titleRect": [51, 50, 565, 103],
        "leadRect": [51, 111, 565, 128],
    },
    {
        "path": "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.2.pdf",
        "archiveSha256": "b71a30bcbecd08355ff99a89251aa89013e627f296180a7d5c287255fe3441e1",
        "page": 22,
        "sectionRect": [45, 45, 570, 131],
        "titleRect": [51, 50, 565, 103],
        "leadRect": [51, 111, 565, 128],
    },
]


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pixels(document: pymupdf.Document) -> list[str]:
    return [hashlib.sha256(page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False).samples).hexdigest()
            for page in document]


def metadata(document: pymupdf.Document) -> None:
    values = document.metadata
    values.update({
        "author": "Natalie Weber · Institut für Wirkungsökonomie",
        "creator": "Institut für Wirkungsökonomie",
        "producer": "Institut für Wirkungsökonomie",
        "modDate": "D:20261013000000+02'00'",
    })
    document.set_metadata({key: value for key, value in values.items() if key in {
        "title", "author", "subject", "keywords", "creator", "producer", "creationDate", "modDate", "trapped"
    }})


def correct_guide(item: dict) -> dict:
    target = ROOT / item["path"]
    source = ARCHIVE / target.name
    if digest(source) != item["archiveSha256"]:
        raise RuntimeError(f"Archived guide differs: {source}")
    with pymupdf.open(source) as original:
        before = pixels(original)
        document = pymupdf.open(source)
    page_index = item["page"] - 1
    # The original first page contained a workflow sentence aimed at an AI
    # coding agent. Remove its complete text block rather than substituting a
    # public-looking editorial label.
    for index, candidate in enumerate(document):
        if index == page_index:
            continue
        blocks = [block for block in candidate.get_text("blocks") if "codex" in block[4].casefold()]
        for block in blocks:
            rect = pymupdf.Rect(block[:4])
            candidate.add_redact_annot(rect, fill=(1, 1, 1))
        if blocks:
            candidate.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)
    page = document[page_index]
    page.add_redact_annot(pymupdf.Rect(item["sectionRect"]), fill=(1, 1, 1))
    page.apply_redactions()
    page.insert_font(fontname="guideheading", fontfile=str(GEORGIA_BOLD))
    page.insert_font(fontname="guidebody", fontfile=str(ARIAL))
    title_result = page.insert_textbox(
        pymupdf.Rect(item["titleRect"]),
        "14. Führende Mini-Definitionen für Glossar,\nSuche und kurze Erklärtexte",
        fontname="guideheading", fontsize=18, lineheight=1.12, color=(8/255, 17/255, 38/255),
    )
    lead_result = page.insert_textbox(
        pymupdf.Rect(item["leadRect"]),
        "Diese Kurzdefinitionen fassen die zentralen Begriffe knapp zusammen:",
        fontname="guidebody", fontsize=10, color=(32/255, 36/255, 42/255),
    )
    if title_result < 0 or lead_result < 0:
        raise RuntimeError(f"Replacement text does not fit in {target}")
    toc = document.get_toc()
    changed_toc = 0
    for row in toc:
        if "Hover, Glossar und CodeX" in row[1]:
            row[1] = "14. Führende Mini-Definitionen für Glossar, Suche und kurze Erklärtexte"
            changed_toc += 1
    if toc and changed_toc != 1:
        raise RuntimeError(f"Expected one historical guide outline correction: {target}")
    if toc:
        document.set_toc(toc)
    metadata(document)
    temporary = target.with_suffix(".publishing.tmp.pdf")
    document.save(temporary, garbage=4, deflate=True)
    document.close()
    with pymupdf.open(temporary) as checked:
        after = pixels(checked)
        expected_pages = sorted({1, item["page"]})
        if [i + 1 for i, pair in enumerate(zip(before, after)) if pair[0] != pair[1]] != expected_pages:
            raise RuntimeError(f"Unexpected pages changed in {target}")
        residue = "\n".join(page.get_text() for page in checked)
        if "CodeX" in residue or "Codex" in residue or "Website-Texte" in residue:
            raise RuntimeError(f"Production wording remains in {target}")
        if any("CodeX" in row[1] or "Codex" in row[1] for row in checked.get_toc()):
            raise RuntimeError(f"Production wording remains in PDF outline: {target}")
    temporary.replace(target)
    return {
        "path": item["path"],
        "original": str(source.relative_to(ROOT)),
        "beforeSha256": item["archiveSha256"],
        "afterSha256": digest(target),
        "pages": len(before),
        "changedVisualPages": sorted({1, item["page"]}),
        "unchangedPageRenders": len(before) - len({1, item["page"]}),
    }


def correct_nats_duplicate() -> dict:
    target = ROOT / "public/downloads/originals/NATS_WOeK_allgemein 2.pdf"
    source = NATS_ARCHIVE / target.name
    canonical = ROOT / "public/downloads/originals/NATS_WOeK_allgemein.pdf"
    expected = "49e88d8f3dba77d72efb486df06b5f3827b1bf0561e68a38ecbfce65e2751248"
    if digest(source) != expected:
        raise RuntimeError("Archived duplicate NATS source differs")
    with pymupdf.open(source) as before_document, pymupdf.open(canonical) as after_document:
        before = pixels(before_document)
        after = pixels(after_document)
        if before != after:
            raise RuntimeError("Reviewed NATS publishing copy is not pixel-identical to duplicate source")
        for xref in range(1, after_document.xref_length()):
            if "KI-generierte Inhalte können fehlerhaft sein." in after_document.xref_get_key(xref, "Alt")[1]:
                raise RuntimeError("AI production suffix remains in canonical NATS copy")
    shutil.copyfile(canonical, target)
    return {
        "path": str(target.relative_to(ROOT)),
        "original": str(source.relative_to(ROOT)),
        "beforeSha256": expected,
        "afterSha256": digest(target),
        "pages": len(before),
        "changedVisualPages": [],
        "unchangedPageRenders": len(before),
    }


def main() -> None:
    corrected = [correct_guide(item) for item in GUIDES]
    corrected.append(correct_nats_duplicate())
    report = {
        "date": "2026-10-13",
        "status": "PASS",
        "files": corrected,
        "description": "Public publishing copies contain no production-only AI, editor or implementation labels; archived originals remain byte-identical.",
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
