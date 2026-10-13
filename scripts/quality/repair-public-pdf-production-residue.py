#!/usr/bin/env python3
"""Rebuild public PDF copies from the pre-overlay source and remove production blocks.

Commit d899148d537 attempted to hide AI/workflow labels by drawing replacement
words over them.  The replacement text itself became visible in hundreds of
PDFs.  This repair starts from the parent commit, removes complete production
blocks without replacement text, cleans tracked query parameters and preserves
all unaffected page pixels.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
FAULTY_COMMIT = "d899148d537"
SOURCE_REVISION = f"{FAULTY_COMMIT}^"
REPORT = ROOT / "reports/consistency-20261009/pdf-production-residue-repair-20261013.json"

# These files have newer, independently source-built corrections in the current
# consistency package and must never be restored from the older commit.
PROTECTED = {
    "assets/pdf/die-neue-ordnung-des-wohlstands.pdf",
    "assets/downloads/woek_dossier_oeffentlicher_wirkungsraum_wellen_tiefe_v0_1.pdf",
    "assets/downloads/woek_standard_politische_anschlussfaehigkeit_v0_1.pdf",
    "assets/downloads/woek_standard_politische_anschlussfaehigkeit_v0_1 2.pdf",
    "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.0.pdf",
    "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.1.pdf",
    "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.2.pdf",
}

PRODUCTION = re.compile(
    r"\b(?:CodeX|Codex|ChatGPT|OpenAI)\b|KI-Anweisung|System Prompt|User Prompt|Promptrest",
    re.IGNORECASE,
)
FALSE_POSITIVE = re.compile(r"\bClaude\s+E\.?(?:\s+Shannon)?\b", re.IGNORECASE)
TRACKING = re.compile(
    r"([?&])(?:amp;)?(?:utm_source|utm_medium|utm_campaign)="
    r"(?:chatgpt|openai|claude|anthropic|gemini|copilot)(?:\.com)?(?=(?:&|\s|\)|$))",
    re.IGNORECASE,
)
CURRENT_RESIDUE = re.compile(
    r"Redaktion\s+Redaktion|interne(?:n|r|s)?\s+(?:technische[nr]?\s+)?Arbeitsanweisungen|"
    r"Website-Umsetzung|Redaktionshinweis",
    re.IGNORECASE,
)
PRODUCTION_BLOCK = re.compile(
    PRODUCTION.pattern + r"|Redaktionshinweis|"
    r"interne(?:n|r|s)?\s+(?:technische[nr]?\s+)?(?:Arbeitsanweisungen|Arbeitsnotizen|Hinweise|Informationen)|"
    r"Website-Umsetzung|Website-\s*und\s*Downloadanforderungen|Website-\s*und\s*Portalintegration|"
    r"Tool-\s*und\s*Website-Integration|Website-Integration|Website-Baustein|"
    r"Für die Website muss|Die Website-Fassung|Die Seite braucht Inhaltsverzeichnis|"
    r"Als Download muss|Die Downloadfassung muss|Downloadbereiche zeigen|"
    r"für Website, Online-Volltext, Download|Online-Fassung enthält keine|"
    r"Arbeitsfassung zur öffentlichen Online-Lesefassung|Nächste Textprodukte",
    re.IGNORECASE,
)
ACCEPTED_AUTHORS = {
    "Natalie Weber",
    "Institut für Wirkungsökonomie",
    "Institut für Wirkungsökonomie / Natalie Weber",
}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_path(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def render_hashes(document: pymupdf.Document) -> list[str]:
    return [hashlib.sha256(page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False).samples).hexdigest()
            for page in document]


def changed_pdf_paths() -> list[str]:
    names = subprocess.check_output(
        ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", FAULTY_COMMIT],
        cwd=ROOT,
        text=True,
    ).splitlines()
    return sorted(
        name for name in names
        if name.lower().endswith(".pdf")
        and name not in PROTECTED
        and (name.startswith("assets/") or name.startswith("public/downloads/") or name.startswith("downloads/"))
        and (ROOT / name).is_file()
    )


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{SOURCE_REVISION}:{path}"], cwd=ROOT)


def clean_metadata(document: pymupdf.Document) -> None:
    metadata = dict(document.metadata or {})
    for key, value in list(metadata.items()):
        if isinstance(value, str) and PRODUCTION.search(value):
            metadata[key] = "Institut für Wirkungsökonomie" if key in {"creator", "producer"} else ""
    if metadata.get("author") not in ACCEPTED_AUTHORS:
        metadata["author"] = "Natalie Weber"
    document.set_metadata({key: value for key, value in metadata.items() if key in {
        "title", "author", "subject", "keywords", "creator", "producer", "creationDate", "modDate", "trapped"
    }})
    if PRODUCTION.search(document.get_xml_metadata() or ""):
        document.del_xml_metadata()


def clean_outline(document: pymupdf.Document) -> int:
    toc = document.get_toc()
    changed = 0
    cleaned = []
    for row in toc:
        title = row[1]
        if PRODUCTION_BLOCK.search(title):
            changed += 1
            if not PRODUCTION.search(title):
                continue
            title = re.sub(r"\s*(?:,|/|und|oder)?\s*(?:CodeX|Codex|ChatGPT|OpenAI)(?:[- /][\wÄÖÜäöüß]+)*", "", title, flags=re.I)
            title = re.sub(r"\s{2,}", " ", title).strip(" -/,:")
            if not title:
                continue
            row[1] = title
        cleaned.append(row)
    if changed:
        document.set_toc(cleaned)
    return changed


def clean_links(page: pymupdf.Page) -> int:
    changed = 0
    for link in page.get_links():
        uri = link.get("uri")
        if not uri or not TRACKING.search(uri):
            continue
        clean = TRACKING.sub(lambda match: match.group(1), uri)
        clean = clean.replace("?&", "?").replace("&&", "&").rstrip("?&")
        page.delete_link(link)
        page.insert_link({"kind": pymupdf.LINK_URI, "from": link["from"], "uri": clean})
        changed += 1
    return changed


def repair(path: str) -> dict | None:
    target = ROOT / path
    faulty_hash = sha256_path(target)
    source_data = git_bytes(path)
    document = pymupdf.open(stream=source_data, filetype="pdf")
    before = render_hashes(document)
    source_hash = sha256_bytes(source_data)
    redacted_blocks = []
    tracking_marks = 0
    link_marks = 0
    for page_number, page in enumerate(document, 1):
        blocks = list(page.get_text("blocks"))
        page_changed = False
        for block in blocks:
            text = block[4]
            if not PRODUCTION_BLOCK.search(text) or FALSE_POSITIVE.search(text):
                continue
            # Production references are paragraph/cell blocks in these source
            # PDFs. Removing the whole block avoids broken public sentences and
            # avoids adding any new editorial label.
            source_rect = pymupdf.Rect(block[:4])
            rect = pymupdf.Rect(source_rect.x0 - 0.8, source_rect.y0 - 0.8,
                                source_rect.x1 + 0.8, source_rect.y1 + 0.8)
            page.add_redact_annot(rect, fill=(1, 1, 1))
            redacted_blocks.append({"page": page_number, "text": " ".join(text.split())[:240]})
            page_changed = True
        page_text = page.get_text()
        for match in list(TRACKING.finditer(page_text)):
            token = match.group(0)
            for rect in page.search_for(token):
                page.add_redact_annot(rect, fill=(1, 1, 1))
                tracking_marks += 1
                page_changed = True
        link_marks += clean_links(page)
        if page_changed:
            page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)
    outline_changes = clean_outline(document)
    clean_metadata(document)
    temporary = target.with_suffix(".production-repair.tmp.pdf")
    temporary.unlink(missing_ok=True)
    document.save(temporary, garbage=4, deflate=True)
    document.close()
    with pymupdf.open(temporary) as checked:
        after = render_hashes(checked)
        changed_pages = [index + 1 for index, pair in enumerate(zip(before, after)) if pair[0] != pair[1]]
        visible = "\n".join(page.get_text() for page in checked)
        if PRODUCTION_BLOCK.search(visible) or CURRENT_RESIDUE.search(visible):
            raise RuntimeError(f"Production residue remains in {path}")
        hidden = json.dumps(checked.metadata, ensure_ascii=False) + (checked.get_xml_metadata() or "") + json.dumps(checked.get_toc(), ensure_ascii=False)
        if PRODUCTION_BLOCK.search(hidden) or CURRENT_RESIDUE.search(hidden):
            raise RuntimeError(f"Hidden production residue remains in {path}")
    temporary.replace(target)
    return {
        "path": path,
        "sourceRevision": SOURCE_REVISION,
        "sourceSha256": source_hash,
        "beforeFaultyRepairSha256": faulty_hash,
        "pages": len(before),
        "changedVisualPages": changed_pages,
        "unchangedVisualPages": len(before) - len(changed_pages),
        "redactedProductionBlocks": redacted_blocks,
        "outlineCorrections": outline_changes,
        "trackingMarksRemoved": tracking_marks,
        "trackingLinksCorrected": link_marks,
    }


def main() -> None:
    records = []
    for path in changed_pdf_paths():
        record = repair(path)
        if record:
            record["publishedSha256"] = sha256_path(ROOT / path)
            records.append(record)
    report = {
        "date": "2026-10-13",
        "status": "PASS",
        "faultyCommit": FAULTY_COMMIT,
        "sourceRevision": SOURCE_REVISION,
        "files": records,
        "totals": {
            "files": len(records),
            "pages": sum(record["pages"] for record in records),
            "changedVisualPages": sum(len(record["changedVisualPages"]) for record in records),
            "productionBlocksRemoved": sum(len(record["redactedProductionBlocks"]) for record in records),
        },
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], **report["totals"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
