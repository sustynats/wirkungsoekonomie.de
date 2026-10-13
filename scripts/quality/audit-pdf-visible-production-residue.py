#!/usr/bin/env python3
"""Inventory-bound read-only audit for visible PDF production residue."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import runpy
from pathlib import Path

import pymupdf


EXTRA = re.compile(
    r"Vorwort\s+und\s+Korrekturhinweis|nachgelieferte\s+Korrekturfassung|"
    r"(?:technische|redaktionelle)\s+(?:Arbeits|Produktions|Veröffentlichungs)hinweise|"
    r"(?:KI|AI)[- ](?:Hinweis|Produktion|Erstellung|generiert)|"
    r"erstellt\s+mit\s+(?:ChatGPT|Claude|Codex|KI|AI)",
    re.IGNORECASE,
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--inventory", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    inventory = json.loads(args.inventory.read_text(encoding="utf-8"))
    cleaner = runpy.run_path(str(root / "scripts/quality/clean-current-pdf-production-notes.py"))
    pattern = cleaner["PATTERN"]
    normalized = cleaner["NORMALIZED_PATTERN"]
    cache: dict[str, list[dict]] = {}
    records = []
    pages_checked = 0
    for source in inventory["records"]:
        path = root / source["path"]
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != source["beforeSha256"]:
            raise RuntimeError(f"Inventory checksum differs for {source['path']}")
        if digest not in cache:
            findings = []
            with pymupdf.open(path) as document:
                pages_checked += len(document)
                for page_number, page in enumerate(document, 1):
                    for block in page.get_text("blocks"):
                        text = " ".join(block[4].split())
                        if pattern.search(block[4]) or normalized.search(text) or EXTRA.search(text):
                            findings.append({"page": page_number, "text": text[:600]})
            cache[digest] = findings
        if cache[digest]:
            records.append({"path": source["path"], "sha256": digest, "findings": cache[digest]})
    result = {
        "mode": "read-only candidate discovery, not overall publication approval",
        "pdfsChecked": len(inventory["records"]),
        "uniquePdfs": len(cache),
        "uniquePagesChecked": pages_checked,
        "candidatePdfs": len(records),
        "candidateBlocks": sum(len(record["findings"]) for record in records),
        "records": records,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in result.items() if key != "records"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
