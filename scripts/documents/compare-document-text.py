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


def read_text(path: Path) -> str:
    if path.suffix.lower() == ".docx":
        return read_docx(path)
    return path.read_text(encoding="utf-8", errors="replace")


def normalize(text: str) -> str:
    lines: list[str] = []
    for raw in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        line = re.sub(r"\s+", " ", raw).strip()
        if not line:
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
