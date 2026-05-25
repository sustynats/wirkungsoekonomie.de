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

    doc = Document(path)
    parts: list[str] = []
    for paragraph in doc.paragraphs:
        text = paragraph.text.strip()
        if text:
            parts.append(text)
    for table in doc.tables:
        for row in table.rows:
            cells = [" ".join(cell.text.split()) for cell in row.cells]
            if any(cells):
                parts.append(" | ".join(cells))
    return "\n".join(parts)


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
    in_fence = False
    for raw in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        line = raw.strip()
        if line.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            out.append(line)
            continue
        if not line:
            out.append("")
            continue
        if re.fullmatch(r"\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?", line):
            continue
        line = re.sub(r"^#{1,6}\s+", "", line)
        line = re.sub(r"^>\s?", "", line)
        line = re.sub(r"^[-*+]\s+", "", line)
        line = re.sub(r"^\d+[.)]\s+", "", line)
        line = re.sub(r"`([^`]+)`", r"\1", line)
        line = re.sub(r"\*\*([^*]+)\*\*", r"\1", line)
        line = re.sub(r"\*([^*]+)\*", r"\1", line)
        if "|" in line and line.startswith("|"):
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            line = " | ".join(cells)
        out.append(line)
    return "\n".join(out)


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
