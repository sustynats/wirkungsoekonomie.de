#!/usr/bin/env python3
"""Reject private local paths in metadata of tracked public artifacts."""

from __future__ import annotations

import argparse
import logging
import re
import subprocess
import sys
import zipfile
from pathlib import Path
from typing import Iterable


PATH_PATTERN = re.compile(
    rb"(?:file:/{2,3})?/(?:Users|home)/[A-Za-z0-9_.-]+(?:/|$)|[A-Za-z]:\\\\Users\\\\",
    re.IGNORECASE,
)
OFFICE_SUFFIXES = {".docx", ".xlsx", ".pptx", ".odt", ".ods", ".odp", ".epub"}
IMAGE_SUFFIXES = {".avif", ".heic", ".jpeg", ".jpg", ".png", ".tif", ".tiff", ".webp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    selection = parser.add_mutually_exclusive_group(required=True)
    selection.add_argument("--all", action="store_true", help="check all tracked artifacts")
    selection.add_argument("--paths-stdin", action="store_true", help="read candidate paths from stdin")
    return parser.parse_args()


def tracked_paths() -> Iterable[Path]:
    result = subprocess.run(["git", "ls-files", "-z"], check=True, stdout=subprocess.PIPE)
    for entry in result.stdout.split(b"\0"):
        if entry:
            yield Path(entry.decode("utf-8", errors="strict"))


def requested_paths() -> Iterable[Path]:
    for line in sys.stdin:
        value = line.strip()
        if value:
            yield Path(value)


def find_path_leak(value: bytes) -> str | None:
    match = PATH_PATTERN.search(value)
    return match.group(0).decode("utf-8", errors="replace") if match else None


def office_metadata(path: Path) -> Iterable[tuple[str, bytes]]:
    with zipfile.ZipFile(path) as archive:
        for entry in archive.infolist():
            name = entry.filename.lower()
            if (
                name.startswith("docprops/")
                or name == "meta.xml"
                or name.startswith("meta-inf/")
                or name.endswith(".opf")
            ):
                yield entry.filename, archive.read(entry)


def pdf_metadata(path: Path) -> Iterable[tuple[str, bytes]]:
    try:
        from pypdf import PdfReader
    except ImportError as error:  # pragma: no cover - CI installs pypdf
        raise RuntimeError("pypdf is required to inspect PDF metadata") from error

    logging.getLogger("pypdf").setLevel(logging.ERROR)
    reader = PdfReader(path)
    if reader.metadata:
        for key, value in reader.metadata.items():
            yield f"document-info:{key}", str(value).encode("utf-8", errors="replace")

    xmp = reader.xmp_metadata
    if xmp:
        yield "xmp", str(xmp).encode("utf-8", errors="replace")

    # A raw trailer check additionally catches plain-text Info dictionaries.
    with path.open("rb") as handle:
        handle.seek(max(0, path.stat().st_size - 1_048_576))
        yield "raw-trailer", handle.read()


def image_metadata(path: Path) -> Iterable[tuple[str, bytes]]:
    # EXIF/XMP metadata is conventionally located near the beginning. This is
    # deliberately a byte-level check so no image decoder is trusted.
    with path.open("rb") as handle:
        yield "raw-header", handle.read(4_194_304)


def metadata_blocks(path: Path) -> Iterable[tuple[str, bytes]]:
    suffix = path.suffix.lower()
    if suffix in OFFICE_SUFFIXES:
        return office_metadata(path)
    if suffix == ".pdf":
        return pdf_metadata(path)
    if suffix in IMAGE_SUFFIXES:
        return image_metadata(path)
    return ()


def main() -> int:
    args = parse_args()
    paths = tracked_paths() if args.all else requested_paths()
    failures: list[str] = []

    for path in paths:
        if path.suffix.lower() not in OFFICE_SUFFIXES | IMAGE_SUFFIXES | {".pdf"}:
            continue
        if not path.is_file():
            failures.append(f"{path}: tracked artifact is not materialized for metadata inspection")
            continue
        try:
            for location, content in metadata_blocks(path):
                leak = find_path_leak(content)
                if leak:
                    failures.append(f"{path} [{location}]: {leak}")
        except (OSError, RuntimeError, zipfile.BadZipFile) as error:
            failures.append(f"{path}: metadata could not be inspected ({error})")

    if failures:
        print("Private local path or unreadable metadata found:", file=sys.stderr)
        print("\n".join(failures), file=sys.stderr)
        return 1

    print("Artifact-metadata privacy check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
