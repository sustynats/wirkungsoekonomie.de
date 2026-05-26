#!/usr/bin/env python3
from __future__ import annotations

import shutil
import tempfile
import zipfile
from pathlib import Path


ROOT = Path.cwd()
AUDIT = ROOT / "docs/public-zip-docx-audit.md"
PUBLIC_ROOTS = [ROOT / "assets/downloads", ROOT / "public/downloads"]


def public_zips() -> list[Path]:
    return sorted(
        path
        for root in PUBLIC_ROOTS
        if root.exists()
        for path in root.rglob("*.zip")
    )


def rewrite_without_editable_documents(path: Path) -> tuple[int, list[str]]:
    removed: list[str] = []
    with zipfile.ZipFile(path) as source:
        infos = source.infolist()
        editable = [info for info in infos if info.filename.lower().endswith((".docx", ".doc"))]
        if not editable:
            return 0, []
        with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp:
            tmp_path = Path(tmp.name)
        try:
            with zipfile.ZipFile(tmp_path, "w", compression=zipfile.ZIP_DEFLATED) as target:
                for info in infos:
                    if info.filename.lower().endswith((".docx", ".doc")):
                        removed.append(info.filename)
                        continue
                    target.writestr(info, source.read(info.filename))
            shutil.move(tmp_path, path)
        finally:
            if tmp_path.exists():
                tmp_path.unlink()
    return len(removed), removed


def main() -> None:
    findings: list[tuple[Path, list[str]]] = []
    total_removed = 0
    for archive in public_zips():
        removed_count, removed = rewrite_without_editable_documents(archive)
        if removed_count:
            total_removed += removed_count
            findings.append((archive, removed))

    remaining: list[tuple[Path, list[str]]] = []
    for archive in public_zips():
        with zipfile.ZipFile(archive) as zipped:
            bad = [name for name in zipped.namelist() if name.lower().endswith((".docx", ".doc"))]
        if bad:
            remaining.append((archive, bad))

    lines = [
        "# Public ZIP DOCX Audit",
        "",
        "## Policy",
        "",
        "- Öffentliche ZIP-Pakete dürfen keine DOCX- oder Word-Dateien enthalten.",
        "- ZIP-Pakete dürfen PDF, HTML, Daten und andere nicht editierbare öffentliche Materialien enthalten.",
        "",
        "## Zusammenfassung",
        "",
        f"- Geprüfte ZIP-Dateien: {len(public_zips())}",
        f"- Bereinigte ZIP-Dateien: {len(findings)}",
        f"- Entfernte DOCX-/Word-Einträge aus ZIPs: {total_removed}",
        f"- Verbleibende ZIPs mit DOCX-/Word-Einträgen: {len(remaining)}",
        "",
        "## Bereinigte ZIP-Dateien",
        "",
    ]
    if findings:
        for archive, removed in findings:
            lines.append(f"### `{archive.relative_to(ROOT)}`")
            lines.extend(f"- `{name}`" for name in removed)
            lines.append("")
    else:
        lines.append("- Keine")
        lines.append("")

    lines.extend(["## Verbleibende Treffer", ""])
    if remaining:
        for archive, bad in remaining:
            lines.append(f"### `{archive.relative_to(ROOT)}`")
            lines.extend(f"- `{name}`" for name in bad)
            lines.append("")
    else:
        lines.append("- Keine")

    AUDIT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(
        f"Public ZIP policy: {total_removed} DOCX/Word entries removed from {len(findings)} ZIP files -> docs/public-zip-docx-audit.md",
    )
    if remaining:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
