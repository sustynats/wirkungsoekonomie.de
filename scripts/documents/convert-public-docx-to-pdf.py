#!/usr/bin/env python3
from __future__ import annotations

import json
import argparse
import shutil
import subprocess
import sys
import tempfile
from datetime import UTC, datetime
from pathlib import Path


ROOT = Path.cwd()
AUDIT = ROOT / "docs/public-docx-conversion-audit.md"
PUBLIC_ROOTS = [ROOT / "assets/downloads", ROOT / "public/downloads"]
REGISTRY = ROOT / "assets/data/document-registry.json"


def find_renderer() -> tuple[str, str] | None:
    for candidate in ("soffice", "libreoffice"):
        resolved = shutil.which(candidate)
        if resolved:
            return ("libreoffice", resolved)
    mac_soffice = Path("/Applications/LibreOffice.app/Contents/MacOS/soffice")
    if mac_soffice.exists():
        return ("libreoffice", str(mac_soffice))
    mac_word = Path("/Applications/Microsoft Word.app")
    if sys.platform == "darwin" and mac_word.exists() and shutil.which("osascript"):
        return ("word", "osascript")
    return None


def is_pdf(path: Path) -> bool:
    try:
        return path.exists() and path.read_bytes()[:4] == b"%PDF"
    except OSError:
        return False


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return path.name


def convert_with_libreoffice(binary: str, source: Path, target: Path) -> None:
    source = source.resolve()
    target = target.resolve()
    with tempfile.TemporaryDirectory(prefix="woek-docx-pdf-") as tmp:
        tmp_dir = Path(tmp)
        subprocess.run(
            [
                binary,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(tmp_dir),
                str(source),
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=180,
        )
        generated = tmp_dir / f"{source.stem}.pdf"
        if not is_pdf(generated):
            matches = list(tmp_dir.glob("*.pdf"))
            generated = matches[0] if matches else generated
        if not is_pdf(generated):
            raise RuntimeError("LibreOffice did not produce a valid PDF")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(generated, target)


def convert_with_word(source: Path, target: Path) -> None:
    source = source.resolve()
    target = target.resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    script = """
on run argv
  set inputPath to POSIX file (item 1 of argv)
  set outputPath to POSIX file (item 2 of argv)
  tell application "Microsoft Word"
    set wasVisible to visible
    set visible to false
    open inputPath
    set activeDoc to active document
    save as activeDoc file name outputPath file format format PDF
    close activeDoc saving no
    set visible to wasVisible
  end tell
end run
"""
    subprocess.run(
        ["osascript", "-e", script, str(source), str(target)],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=180,
    )
    if not is_pdf(target):
        raise RuntimeError("Microsoft Word did not produce a valid PDF")


def convert_docx(renderer: tuple[str, str], source: Path, target: Path) -> None:
    kind, binary = renderer
    if kind == "libreoffice":
        convert_with_libreoffice(binary, source, target)
    elif kind == "word":
        convert_with_word(source, target)
    else:
        raise RuntimeError(f"Unknown renderer: {kind}")


def slugify(value: str) -> str:
    return (
        value.lower()
        .replace("ä", "ae")
        .replace("ö", "oe")
        .replace("ü", "ue")
        .replace("ß", "ss")
        .replace("&", " und ")
        .replace("@", " at ")
        .replace("€", " euro ")
    )


def safe_pdf_slug(entry: dict, source: Path) -> str:
    raw = str(entry.get("slug") or entry.get("id") or source.stem).strip()
    normalized = "".join(char if char.isalnum() else "-" for char in slugify(raw))
    normalized = "-".join(part for part in normalized.split("-") if part)
    return normalized or "publikation"


def normalize_public_formats(entry: dict) -> bool:
    changed = False
    desired = ["pdf"]
    if entry.get("onlineUrl"):
        desired = ["online", "pdf"]
    current = [str(item).lower() for item in entry.get("publicFormats") or []]
    if current != desired:
        entry["publicFormats"] = desired
        changed = True
    if entry.get("docxUrl") is not None:
        entry["docxUrl"] = None
        changed = True
    if entry.get("allowPublicDocx") is not False:
        entry["allowPublicDocx"] = False
        changed = True
    return changed


def registry_jobs() -> list[tuple[Path, Path, str]]:
    if not REGISTRY.exists():
        return []
    entries = json.loads(REGISTRY.read_text(encoding="utf-8"))
    jobs: list[tuple[Path, Path, str]] = []
    changed = False
    for entry in entries:
        if entry.get("isPublic") is False:
            continue
        source_value = str(entry.get("importSource") or "")
        source_format = str(entry.get("sourceFormat") or "").lower()
        if source_format not in {"docx", "doc"} and not source_value.lower().endswith((".docx", ".doc")):
            continue
        if not source_value:
            if normalize_public_formats(entry):
                changed = True
            continue
        if normalize_public_formats(entry):
            changed = True
        pdf_url = str(entry.get("pdfUrl") or "").strip()
        source = Path(source_value)
        if not pdf_url:
            pdf_url = f"/assets/pdf/imported/{safe_pdf_slug(entry, source)}.pdf"
            entry["pdfUrl"] = pdf_url
            changed = True
        source = Path(source_value)
        target = ROOT / pdf_url.lstrip("/")
        if source.exists():
            jobs.append((source, target, f"registry:{entry.get('id') or source.stem}"))
    if changed:
        REGISTRY.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return jobs


def should_convert(source: Path, target: Path, force: bool) -> bool:
    if force:
        return True
    if not is_pdf(target):
        return True
    try:
        return source.stat().st_mtime > target.stat().st_mtime + 1
    except OSError:
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Render public DOCX/Word sources to template-preserving PDFs.")
    parser.add_argument("--force", action="store_true", help="Re-render PDFs even when an existing PDF is present.")
    args = parser.parse_args()

    renderer = find_renderer()
    public_docx_files = sorted(
        file
        for root in PUBLIC_ROOTS
        if root.exists()
        for file in root.rglob("*")
        if file.suffix.lower() in {".docx", ".doc"}
    )
    public_jobs = [(source, source.with_suffix(".pdf"), "public-asset") for source in public_docx_files]
    jobs = public_jobs + registry_jobs()
    generated = []
    existing = []
    failed = []

    if jobs and not renderer:
        failed.extend((source, target, "Kein Office-Renderer gefunden: LibreOffice/soffice oder Microsoft Word wird benötigt") for source, target, _kind in jobs if not is_pdf(target))
    else:
        for source, target, kind in jobs:
            if not should_convert(source, target, args.force):
                existing.append((source, target, kind))
                continue
            try:
                convert_docx(renderer, source, target)
                generated.append((source, target, kind))
            except Exception as exc:  # noqa: BLE001
                failed.append((source, target, f"{kind}: {exc}"))
                continue
            if not is_pdf(target):
                failed.append((source, target, f"{kind}: erzeugte Datei ist kein gültiges PDF"))
            continue

    lines = [
        "# Public DOCX to PDF Conversion Audit",
        "",
        f"Stand: {datetime.now(UTC).isoformat()}",
        "",
        "## Zusammenfassung",
        "",
        f"- Renderer: {renderer[0] if renderer else 'nicht gefunden'}",
        f"- Force-Modus: {'ja' if args.force else 'nein'}",
        f"- Öffentliche DOCX-/Word-Quellen gefunden: {len(public_docx_files)}",
        f"- Registry-DOCX-Quellen mit PDF-Ziel: {len(jobs) - len(public_jobs)}",
        f"- PDF bereits vorhanden: {len(existing)}",
        f"- PDF neu erzeugt: {len(generated)}",
        f"- Fehlgeschlagen: {len(failed)}",
        "",
        "Regel: DOCX-/Word-Quellen werden mit einem Office-Renderer als PDF exportiert, damit Layout, Seitenumbrüche und Publikationstemplate erhalten bleiben. Es gibt keinen Text-Neusatz-Fallback.",
        "",
        "Die Konvertierung verändert keine Quelldokumente. DOCX-Dateien bleiben nur als interne Quellen; öffentliche Downloads sind Onlinefassung und PDF.",
        "",
        "## Neu erzeugte PDFs",
        "",
    ]
    if generated:
        lines.extend(f"- `{display_path(src)}` -> `{dst.relative_to(ROOT)}` ({kind})" for src, dst, kind in generated)
    else:
        lines.append("- Keine")
    lines.extend(["", "## Bereits vorhandene PDFs", ""])
    if existing:
        lines.extend(f"- `{display_path(src)}` -> `{dst.relative_to(ROOT)}` ({kind})" for src, dst, kind in existing)
    else:
        lines.append("- Keine")
    lines.extend(["", "## Fehlgeschlagen", ""])
    if failed:
        lines.extend(f"- `{display_path(src)}` -> `{display_path(dst)}`: {reason}" for src, dst, reason in failed)
    else:
        lines.append("- Keine")
    AUDIT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Public DOCX conversion: {len(generated)} generated, {len(existing)} existing, {len(failed)} failed -> docs/public-docx-conversion-audit.md")
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
