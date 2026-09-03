#!/usr/bin/env python3
"""Create a public PDF with clean publisher metadata and no release blockers."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from pypdf import PdfReader, PdfWriter


FORBIDDEN = (
    re.compile(r"/(?:Users|private|tmp|var/folders)/", re.IGNORECASE),
    re.compile(r"file://", re.IGNORECASE),
    re.compile(r"(?:Chat" + "GPT|Open" + "AI|Clau" + "de|Code" + "x)", re.IGNORECASE),
    re.compile(r"\barbeitsstand\b", re.IGNORECASE),
    re.compile(r"\binterne?\b", re.IGNORECASE),
    re.compile(r"\bredaktionell\b", re.IGNORECASE),
)


def visible_text(reader: PdfReader) -> str:
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def finalize(source: Path, destination: Path) -> None:
    reader = PdfReader(source)
    text = visible_text(reader)
    for expression in FORBIDDEN:
        if expression.search(text):
            raise ValueError(f"Public PDF contains a release blocker: {expression.pattern}")

    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    writer.add_metadata({
        "/Title": "Wie wirksam ist das Sondervermögen wirklich?",
        "/Subject": "Wirkungsökonomische Gesamtanalyse des Sondervermögens Infrastruktur und Klimaneutralität",
        "/Author": "Institut für Wirkungsökonomie",
        "/Creator": "Institut für Wirkungsökonomie",
        "/Producer": "Institut für Wirkungsökonomie",
        "/Keywords": "Wirkungsökonomie, Sondervermögen, Infrastruktur, Klimaneutralität",
    })
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("wb") as stream:
        writer.write(stream)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    finalize(args.source, args.destination)


if __name__ == "__main__":
    main()
