#!/usr/bin/env python3
"""Set clean, institution-owned PDF metadata for public downloads."""

from __future__ import annotations

import argparse
from pathlib import Path

from pypdf import PdfReader, PdfWriter


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--title", required=True)
    parser.add_argument("--subject", required=True)
    parser.add_argument("--keywords", default="Wirkungsökonomie")
    args = parser.parse_args()

    reader = PdfReader(args.input)
    writer = PdfWriter()
    # Clone the complete document so tagged-PDF structure, outlines and links survive.
    writer.clone_document_from_reader(reader)
    writer.add_metadata({
        "/Title": args.title,
        "/Author": "Institut für Wirkungsökonomie",
        "/Subject": args.subject,
        "/Keywords": args.keywords,
        "/Creator": "Institut für Wirkungsökonomie",
        "/Producer": "Institut für Wirkungsökonomie",
    })

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("wb") as handle:
        writer.write(handle)


if __name__ == "__main__":
    main()
