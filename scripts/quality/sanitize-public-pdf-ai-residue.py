#!/usr/bin/env python3
"""Remove publication-process residues from release-hosted public PDFs.

This deliberately targets only production labels and AI tracking parameters.
It does not remove substantive references to research, people, or AI topics.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "assets/data/public-release-assets.json"

PHRASE_REPLACEMENTS = (
    (re.compile(r"\b(?:CodeX|Codex)\s*(?:-|/|oder)?\s*Repository-?Anweisungen?\b", re.IGNORECASE), "interne Arbeitsanweisungen"),
    (re.compile(r"\b(?:CodeX|Codex)-?Anweisungen?\b", re.IGNORECASE), "interne Arbeitsanweisungen"),
    (re.compile(r"\b(?:CodeX|Codex)-?Hinweise?\b", re.IGNORECASE), "interne Hinweise"),
    (re.compile(r"\b(?:CodeX|Codex)-?Umsetzung\b", re.IGNORECASE), "Website-Umsetzung"),
    (re.compile(r"\b(?:CodeX|Codex)-?Informationen\b", re.IGNORECASE), "interne Informationen"),
    (re.compile(r"\bCodeX\b", re.IGNORECASE), "Redaktion"),
    (re.compile(r"\bCodex\b", re.IGNORECASE), "Redaktion"),
    (re.compile(r"\bChatGPT\b", re.IGNORECASE), "Redaktion"),
    (re.compile(r"\bOpenAI\b", re.IGNORECASE), "Redaktion"),
    (re.compile(r"\bKI-Anweisung\b", re.IGNORECASE), "Redaktionshinweis"),
    (re.compile(r"\bSystem Prompt\b", re.IGNORECASE), "Redaktionshinweis"),
    (re.compile(r"\bUser Prompt\b", re.IGNORECASE), "Redaktionshinweis"),
    (re.compile(r"\bPromptrest\b", re.IGNORECASE), "Redaktionshinweis"),
)
SENTENCE_REPLACEMENTS = (
    (
        re.compile(
            r"Öffentliche Inhalte dürfen keine (?:CodeX|Codex|Redaktion)\s*-?\s*oder\s*Repository-?Anweisungen enthalten\.?",
            re.IGNORECASE,
        ),
        "Öffentliche Inhalte bleiben frei von internen Arbeitsanweisungen.",
    ),
)
SENTENCE_TARGETS = tuple(pattern for pattern, _replacement in SENTENCE_REPLACEMENTS)
TRACKING_RE = re.compile(
    r"(?:[?&](?:amp;)?)(?:utm_source|utm_medium|utm_campaign)="
    r"(?:chatgpt|openai|claude|anthropic|gemini|copilot)(?:\.com)?(?:&(?:amp;)?|$)",
    re.IGNORECASE,
)
RAW_MARKER_RE = re.compile(
    r"\b(?:CodeX|Codex|ChatGPT|OpenAI|KI-Anweisung|System Prompt|User Prompt|Promptrest)\b"
    r"|[?&](?:amp;)?(?:utm_source|utm_medium|utm_campaign)="
    r"(?:chatgpt|openai|claude|anthropic|gemini|copilot)(?:\.com)?",
    re.IGNORECASE,
)


def release_pdfs() -> list[Path]:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    return [
        ROOT / relative
        for relative in manifest.get("assets", {})
        if relative.lower().endswith(".pdf") and (ROOT / relative).is_file()
    ]


def sanitize_metadata(doc: fitz.Document) -> bool:
    metadata = dict(doc.metadata or {})
    changed = False
    for key, value in metadata.items():
        if not isinstance(value, str):
            continue
        clean = TRACKING_RE.sub("", value)
        for pattern, replacement in PHRASE_REPLACEMENTS:
            clean = pattern.sub(replacement, clean)
        if clean != value:
            metadata[key] = clean
            changed = True
    if changed:
        doc.set_metadata(metadata)
    return changed


def process_pdf(path: Path, write: bool) -> tuple[bool, int]:
    doc = fitz.open(path)
    changed = sanitize_metadata(doc)
    matches = 0
    for page in doc:
        page_changed = False
        page_text = page.get_text("text")
        sentence_rects = []
        for pattern, replacement in SENTENCE_REPLACEMENTS:
            for text in {match.group(0) for match in pattern.finditer(page_text)}:
                rects = page.search_for(text)
                sentence_rects.extend(rects)
                for index, rect in enumerate(rects):
                    page.add_redact_annot(
                        rect,
                        fill=(1, 1, 1),
                        text=replacement if index == 0 else "",
                        fontname="helv",
                        fontsize=max(5.5, min(8, rect.height * 0.85)),
                        text_color=(0.08, 0.12, 0.18),
                    )
                matches += 1
                changed = page_changed = True
        # Search phrases individually so only the precise production token is
        # redacted, preserving all surrounding editorial text and layout.
        for pattern, replacement in PHRASE_REPLACEMENTS:
            for text in {match.group(0) for match in pattern.finditer(page_text)}:
                rects = page.search_for(text)
                matches += len(rects)
                for rect in rects:
                    line = next((line for line in page_text.splitlines() if text in line), "")
                    if any(sentence_pattern.search(line) for sentence_pattern in SENTENCE_TARGETS):
                        continue
                    if any(rect.intersects(sentence_rect) for sentence_rect in sentence_rects):
                        continue
                    page.add_redact_annot(
                        rect,
                        fill=(1, 1, 1),
                        text=replacement,
                        fontname="helv",
                        fontsize=max(5.5, min(8, rect.height * 0.85)),
                        text_color=(0.08, 0.12, 0.18),
                    )
                    changed = page_changed = True

        # URLs are often represented as one text span. Redact the visible
        # tracking segment; URI annotations are cleared below as well.
        for match in TRACKING_RE.finditer(page_text):
            token = match.group(0).rstrip("&")
            for rect in page.search_for(token):
                page.add_redact_annot(rect, fill=(1, 1, 1))
                matches += 1
                changed = page_changed = True

        for link in page.get_links():
            uri = link.get("uri")
            if not uri or not TRACKING_RE.search(uri):
                continue
            cleaned = TRACKING_RE.sub("", uri).replace("?&", "?").rstrip("?&")
            page.delete_link(link)
            page.insert_link({"kind": fitz.LINK_URI, "from": link["from"], "uri": cleaned})
            changed = page_changed = True

        if page_changed:
            page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

    if write and changed:
        temporary = path.with_name(f"{path.stem}.ai-residue-tmp.pdf")
        doc.save(temporary, garbage=4, deflate=True)
        doc.close()
        temporary.replace(path)
    else:
        doc.close()
    return changed, matches


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="rewrite affected public PDFs")
    parser.add_argument("--paths", nargs="*", help="optional repo-relative PDF subset")
    args = parser.parse_args()
    files = [ROOT / value for value in args.paths] if args.paths else release_pdfs()
    affected = []
    for path in files:
        if not path.is_file() or path.suffix.lower() != ".pdf":
            continue
        # Text extraction is necessary because PDF streams are commonly compressed.
        doc = fitz.open(path)
        text = "\n".join(page.get_text("text") for page in doc)
        metadata = " ".join(str(value) for value in (doc.metadata or {}).values())
        doc.close()
        if not RAW_MARKER_RE.search(text + "\n" + metadata):
            continue
        changed, matches = process_pdf(path, args.write)
        if changed:
            affected.append((path.relative_to(ROOT).as_posix(), matches))
    action = "bereinigt" if args.write else "gefunden"
    print(f"PDF-KI-Produktionsreste {action}: {len(affected)} Datei(en).")
    for relative, matches in affected:
        print(f"- {relative} ({matches} sichtbare Fundstelle(n))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
