#!/usr/bin/env python3
"""Remove textual and EXIF metadata chunks from a PNG without altering pixels."""

from __future__ import annotations

import argparse
import struct
import zlib
from pathlib import Path


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
METADATA_CHUNKS = {b"caBX", b"eXIf", b"iTXt", b"tEXt", b"zTXt"}


def sanitize(path: Path) -> int:
    source = path.read_bytes()
    if not source.startswith(PNG_SIGNATURE):
        raise ValueError("not a PNG file")

    position = len(PNG_SIGNATURE)
    output = bytearray(PNG_SIGNATURE)
    removed = 0
    while position < len(source):
        length = struct.unpack(">I", source[position : position + 4])[0]
        chunk_type = source[position + 4 : position + 8]
        data_start = position + 8
        data_end = data_start + length
        data = source[data_start:data_end]
        position = data_end + 4
        if chunk_type in METADATA_CHUNKS:
            removed += 1
            continue
        output.extend(struct.pack(">I", length))
        output.extend(chunk_type)
        output.extend(data)
        output.extend(struct.pack(">I", zlib.crc32(chunk_type + data) & 0xFFFFFFFF))
    path.write_bytes(output)
    return removed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path)
    args = parser.parse_args()
    print(f"Removed {sanitize(args.path)} metadata chunk(s) from {args.path}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
