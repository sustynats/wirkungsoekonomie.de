#!/usr/bin/env python3
"""Compare document text while ignoring layout artifacts.

The script is intentionally conservative: it reports a mismatch whenever the
normalized body text differs. It supports DOCX and Markdown/plain text files.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def read_docx(path: Path) -> str:
    from docx import Document
    from docx.table import Table
    from docx.text.paragraph import Paragraph
    from docx.oxml.table import CT_Tbl
    from docx.oxml.text.paragraph import CT_P

    doc = Document(path)
    parts: list[str] = []

    for child in doc.element.body.iterchildren():
        if isinstance(child, CT_P):
            paragraph = Paragraph(child, doc)
            text = paragraph.text.strip()
            if text:
                parts.append(text)
        elif isinstance(child, CT_Tbl):
            table = Table(child, doc)
            for row in table.rows:
                cells = [" ".join(cell.text.split()) for cell in row.cells]
                if any(cells):
                    parts.append(" | ".join(cells))
    return "\n".join(parts)


def is_md_table_separator(line: str) -> bool:
    if "|" not in line:
        return False
    cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell or "") for cell in cells)


def read_markdown(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="replace")
    meta_title = ""
    meta_subtitle = ""
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end >= 0:
            block = text[3:end].strip()
            for line in block.splitlines():
                match = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", line)
                if not match:
                    continue
                key = match.group(1).lower()
                value = match.group(2).strip().strip("\"'")
                if key == "title":
                    meta_title = value
                if key == "subtitle":
                    meta_subtitle = value
            text = text[end + 4 :]

    out: list[str] = [value for value in [meta_title, meta_subtitle] if value]
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    i = 0
    in_fence = False
    while i < len(lines):
        raw = lines[i]
        line = raw.strip()
        if line.startswith("```"):
            in_fence = not in_fence
            i += 1
            continue
        if in_fence:
            out.append(line)
            i += 1
            continue
        if not line:
            i += 1
            continue

        heading = re.match(r"^#{1,6}\s+(.+)$", line)
        if heading:
            out.append(clean_markdown_inline(heading.group(1).strip()))
            i += 1
            continue

        if line.startswith("|"):
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and is_md_table_separator(lines[j].strip()):
                out.append(" | ".join(cell.strip() for cell in line.strip("|").split("|")))
                i = j + 1
                while i < len(lines):
                    row = lines[i].strip()
                    if not row:
                        i += 1
                        continue
                    if not row.startswith("|"):
                        break
                    if not is_md_table_separator(row):
                        out.append(" | ".join(cell.strip() for cell in row.strip("|").split("|")))
                    i += 1
                continue

        if line.startswith(">"):
            out.append(clean_markdown_inline(re.sub(r"^>\s?", "", line)))
            i += 1
            continue

        if re.match(r"^\*\*[^*]+:\*\*", line):
            out.append(clean_markdown_inline(line))
            i += 1
            continue

        bullet = re.match(r"^[-*+]\s+(.+)$", line)
        ordered = re.match(r"^\d+[.)]\s+(.+)$", line)
        if bullet or ordered:
            out.append(clean_markdown_inline((bullet or ordered).group(1).strip()))
            i += 1
            continue

        paragraph_lines = [line]
        i += 1
        while i < len(lines):
            next_line = lines[i].strip()
            if (
                not next_line
                or next_line.startswith("#")
                or next_line.startswith(">")
                or next_line.startswith("|")
                or next_line.startswith("```")
                or re.match(r"^\*\*[^*]+:\*\*", next_line)
                or re.match(r"^[-*+]\s+", next_line)
                or re.match(r"^\d+[.)]\s+", next_line)
            ):
                break
            paragraph_lines.append(next_line)
            i += 1
        out.append(clean_markdown_inline(" ".join(paragraph_lines)))
    return "\n".join(out)


def clean_markdown_inline(line: str) -> str:
    line = re.sub(r"`([^`]+)`", r"\1", line)
    line = re.sub(r"\*\*([^*]+)\*\*", r"\1", line)
    line = re.sub(r"\*([^*]+)\*", r"\1", line)
    return line


def read_text(path: Path) -> str:
    if path.suffix.lower() == ".docx":
        return read_docx(path)
    if path.suffix.lower() in {".md", ".markdown"}:
        return read_markdown(path)
    return path.read_text(encoding="utf-8", errors="replace")


def normalize(text: str) -> str:
    lines: list[str] = []
    for raw in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        line = re.sub(r"\s+", " ", raw).strip()
        if not line:
            continue
        if re.match(r"^(Autorin|Referenz|Version|Stand|Status):\s+", line, re.I):
            continue
        if re.fullmatch(r"(seite|page)\s+\d+(\s+von\s+\d+)?", line, re.I):
            continue
        if re.fullmatch(r"\d+", line):
            continue
        lines.append(line)
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("original")
    parser.add_argument("candidate")
    parser.add_argument("--report", default="")
    args = parser.parse_args()

    original = normalize(read_text(Path(args.original)))
    candidate = normalize(read_text(Path(args.candidate)))

    ok = original == candidate
    report = [
        "# Document Text Comparison",
        "",
        f"Original: `{args.original}`",
        f"Candidate: `{args.candidate}`",
        f"Result: {'OK' if ok else 'MISMATCH'}",
        "",
        f"Original characters: {len(original)}",
        f"Candidate characters: {len(candidate)}",
    ]
    if not ok:
        original_lines = original.splitlines()
        candidate_lines = candidate.splitlines()
        first_diff = next(
            (i for i, (a, b) in enumerate(zip(original_lines, candidate_lines), start=1) if a != b),
            min(len(original_lines), len(candidate_lines)) + 1,
        )
        report.extend(["", f"First differing normalized line: {first_diff}"])

    output = "\n".join(report) + "\n"
    if args.report:
        Path(args.report).write_text(output, encoding="utf-8")
    else:
        print(output)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
