#!/usr/bin/env python3
"""Build the physical DOCX/PDF page map used by the WÖMS registry importer."""

from pathlib import Path
from pypdf import PdfReader
import json
import re
import sys

if len(sys.argv) != 3:
    raise SystemExit("Usage: extract-woems-page-map.py <rendered-woems.pdf> <page-map.json>")

source = Path(sys.argv[1])
target = Path(sys.argv[2])
page_map = {}

for page_number, page in enumerate(PdfReader(str(source)).pages, 1):
    text = page.extract_text() or ""
    if "Verbindlicher Output" not in text or not re.search(r"Version \d+\.\d+", text):
        continue
    for line in text.splitlines():
        match = re.match(r"^([A-P]\d{2}) · (.+)$", line.strip())
        if not match or "Fortsetzung" in match.group(2) or ". . ." in match.group(2):
            continue
        page_map.setdefault(match.group(1), page_number)

if len(page_map) != 152:
    raise SystemExit(f"Expected 152 method pages, found {len(page_map)}")

target.write_text(json.dumps(page_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Mapped {len(page_map)} method pages to {target}")
