#!/usr/bin/env python3
"""Render every public PDF page whose pixels differ from HEAD.

The result is a hash-bound visual-review inventory plus 5x5 contact sheets.
The current combined book is excluded because its complete 1,546-page review
is already bound in book-pdf-visual-review.json.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import shutil
import stat
import subprocess
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "recovery/final-pdf-production-visual-20261013"
PUBLIC_PREFIXES = ("assets/", "public/downloads/", "downloads/")
BOOK = "assets/pdf/die-neue-ordnung-des-wohlstands.pdf"
BOOK_REPORT = ROOT / "reports/consistency-20261009/book-pdf-visual-review.json"


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_path(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def git_paths(*args: str) -> set[str]:
    output = subprocess.check_output(["git", *args, "--", "*.pdf"], cwd=ROOT)
    return {item.decode("utf-8") for item in output.split(b"\0") if item}


def changed_public_pdfs() -> list[str]:
    paths = set()
    paths.update(git_paths("diff", "--name-only", "-z"))
    paths.update(git_paths("diff", "--cached", "--name-only", "-z"))
    paths.update(git_paths("ls-files", "--others", "--exclude-standard", "-z"))
    return sorted(
        path for path in paths
        if path.startswith(PUBLIC_PREFIXES)
        and (ROOT / path).is_file()
        # iCloud may expose untracked Finder collision copies as dataless
        # placeholders.  They have no readable publication payload and must
        # never enter a build or block the PDF parser.
        and not (os.stat(ROOT / path).st_flags & getattr(stat, "SF_DATALESS", 0))
    )


def head_bytes(path: str) -> bytes | None:
    result = subprocess.run(
        ["git", "show", f"HEAD:{path}"], cwd=ROOT,
        stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
    )
    return result.stdout if result.returncode == 0 else None


def render_samples(document: pymupdf.Document) -> list[str]:
    return [
        sha256_bytes(page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False).samples)
        for page in document
    ]


def ink_fraction(image: Image.Image) -> float:
    gray = image.convert("L")
    pixels = gray.tobytes()
    return round(sum(value < 245 for value in pixels) / len(pixels), 6)


def make_contact_sheet(items: list[dict], start: int, end: int) -> Path:
    sheet = Image.new("RGB", (1800, 2500), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for slot, record in enumerate(items):
        row, column = divmod(slot, 5)
        x, y = column * 360, row * 500
        label = f"{record['ordinal']:04d} {Path(record['path']).name[:31]} p{record['page']}"
        draw.text((x + 8, y + 5), label, fill="black", font=font)
        page_image = Image.open(ROOT / record["png"]).convert("RGB")
        thumb = ImageOps.contain(page_image, (340, 465))
        sheet.paste(thumb, (x + 10 + (340 - thumb.width) // 2, y + 28))
    target = OUTPUT / f"contact-{start:04d}-{end:04d}.jpg"
    sheet.save(target, quality=90, optimize=True)
    return target


def validate_book_exclusion() -> dict:
    report = json.loads(BOOK_REPORT.read_text(encoding="utf-8"))
    if report.get("status") != "PASS":
        raise RuntimeError("The independent complete book review is not PASS")
    current = ROOT / BOOK
    expected = report.get("combined", {}).get("sha256") or report.get("pdfSha256")
    if expected and expected != sha256_path(current):
        raise RuntimeError("The current combined book no longer matches its visual review")
    return {
        "path": BOOK,
        "reason": "Complete 1,546-page review recorded separately",
        "report": BOOK_REPORT.relative_to(ROOT).as_posix(),
        "pdfSha256": sha256_path(current),
    }


def main() -> None:
    exclusion = validate_book_exclusion()
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    pages_dir = OUTPUT / "pages"
    pages_dir.mkdir(parents=True)

    records: list[dict] = []
    flags: list[dict] = []
    compared_files = 0
    for relative in changed_public_pdfs():
        if relative == BOOK:
            continue
        current_path = ROOT / relative
        current = pymupdf.open(current_path)
        current_hashes = render_samples(current)
        source = head_bytes(relative)
        if source is None:
            changed_pages = list(range(1, len(current) + 1))
        else:
            baseline = pymupdf.open(stream=source, filetype="pdf")
            baseline_hashes = render_samples(baseline)
            changed_pages = [
                index + 1 for index, value in enumerate(current_hashes)
                if index >= len(baseline_hashes) or value != baseline_hashes[index]
            ]
            baseline.close()
        compared_files += 1
        pdf_hash = sha256_path(current_path)
        for page_number in changed_pages:
            ordinal = len(records) + 1
            pixmap = current[page_number - 1].get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False)
            png_path = pages_dir / f"{ordinal:04d}.png"
            pixmap.save(png_path)
            page_image = Image.open(png_path)
            fraction = ink_fraction(page_image)
            record = {
                "ordinal": ordinal,
                "path": relative,
                "pdfSha256": pdf_hash,
                "page": page_number,
                "png": png_path.relative_to(ROOT).as_posix(),
                "renderSha256": sha256_path(png_path),
                "inkFraction": fraction,
            }
            records.append(record)
            if fraction < 0.001:
                flags.append({"ordinal": ordinal, "reason": "near-blank", "inkFraction": fraction})
        current.close()

    sheets = []
    for offset in range(0, len(records), 25):
        subset = records[offset:offset + 25]
        sheets.append(make_contact_sheet(subset, subset[0]["ordinal"], subset[-1]["ordinal"]))

    manifest = {
        "date": "2026-10-13",
        "status": "RENDERED_PENDING_VISUAL_REVIEW",
        "comparisonBase": "HEAD",
        "comparedPublicPdfs": compared_files,
        "pdfsWithPixelChanges": len({record["path"] for record in records}),
        "pages": len(records),
        "contactSheets": [path.relative_to(ROOT).as_posix() for path in sheets],
        "independentReviewExclusions": [exclusion],
        "flags": flags,
        "records": records,
    }
    (OUTPUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps({key: manifest[key] for key in (
        "status", "comparedPublicPdfs", "pdfsWithPixelChanges", "pages", "flags"
    )}, ensure_ascii=False))


if __name__ == "__main__":
    main()
