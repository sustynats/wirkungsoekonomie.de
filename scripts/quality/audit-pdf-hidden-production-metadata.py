#!/usr/bin/env python3
"""Inspect PDF object, embedded-image and attachment metadata without edits.

Findings are review candidates. A scientific source citation is not a production
instruction, and an empty candidate list is not a complete publication approval.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
from pathlib import Path

import pymupdf
from PIL import Image


MARKS = re.compile(
    r"chatgpt|openai|anthropic|claude|midjourney|dall[ -]?e|"
    r"\b(?:codex|gpt[ -]?\d)\b|\.codex|/Users/|/private/tmp/|"
    r"KI[- ](?:Prompt|Antwortbasis|generiert)|"
    r"Redaktionshinweis|Qualit[äa]tsgate|Generiert mit|Erstellt mit KI",
    re.IGNORECASE,
)


def candidates(value: str) -> list[dict]:
    return [
        {"matched": m.group(), "context": value[max(0, m.start() - 90):m.end() + 160]}
        for m in MARKS.finditer(value)
    ]


def inspect_pdf(path: Path) -> dict:
    record = {"objectsChecked": 0, "metadataStreamsChecked": 0,
              "imageMetadataChecked": 0, "attachmentsChecked": 0, "findings": []}
    with pymupdf.open(path) as doc:
        if doc.is_encrypted:
            raise RuntimeError("Encrypted PDF cannot be completely inspected")
        for xref in range(1, doc.xref_length()):
            obj = doc.xref_object(xref, compressed=False)
            record["objectsChecked"] += 1
            for match in candidates(obj):
                record["findings"].append({"surface": "object-dictionary", "xref": xref, **match})
            if doc.xref_is_stream(xref) and re.search(r"/Type\s*/Metadata|/Subtype\s*/XML", obj):
                raw = doc.xref_stream(xref)
                value = raw.decode("utf-8", "replace")
                record["metadataStreamsChecked"] += 1
                for match in candidates(value):
                    record["findings"].append({"surface": "metadata-stream", "xref": xref, **match})
            if re.search(r"/Subtype\s*/Image\b", obj):
                # Read metadata in the encoded image itself, including EXIF and
                # PNG text. Pixels and PDF image geometry are never changed.
                extracted = doc.extract_image(xref)
                if extracted and extracted.get("image"):
                    with Image.open(io.BytesIO(extracted["image"])) as im:
                        values = {str(k): str(v) for k, v in im.info.items()}
                        values.update({f"exif:{k}": str(v) for k, v in im.getexif().items()})
                    record["imageMetadataChecked"] += 1
                    for match in candidates(json.dumps(values, ensure_ascii=False)):
                        record["findings"].append({"surface": "embedded-image-metadata", "xref": xref, **match})
        for name in doc.embfile_names():
            value = json.dumps(doc.embfile_info(name), ensure_ascii=False)
            record["attachmentsChecked"] += 1
            for match in candidates(value):
                record["findings"].append({"surface": "attachment-metadata", "name": name, **match})
    return record


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--inventory", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    inventory = json.loads(args.inventory.read_text())
    result = {"mode": "read-only candidate discovery, not overall publication approval",
              "pdfsChecked": 0, "uniquePdfs": 0, "objectsChecked": 0,
              "metadataStreamsChecked": 0, "imageMetadataChecked": 0,
              "attachmentsChecked": 0, "findings": [], "failures": []}
    cache = {}
    for source in inventory["records"]:
        path = args.root / source["path"]
        try:
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if digest != source["beforeSha256"]:
                raise RuntimeError("Inventory checksum differs; re-inventory before inspection")
            if digest not in cache:
                cache[digest] = inspect_pdf(path)
                result["uniquePdfs"] += 1
                for key in ("objectsChecked", "metadataStreamsChecked", "imageMetadataChecked", "attachmentsChecked"):
                    result[key] += cache[digest][key]
            inspected = cache[digest]
            result["pdfsChecked"] += 1
            if inspected["findings"]:
                result["findings"].append({"path": source["path"], "sha256": digest, **inspected})
        except Exception as exc:
            result["failures"].append({"path": source["path"], "error": str(exc)})
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: v for k, v in result.items() if k not in ("findings", "failures")}, ensure_ascii=False))
    print(f"Candidate PDFs: {len(result['findings'])}; inspection failures: {len(result['failures'])}")
    if result["failures"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
