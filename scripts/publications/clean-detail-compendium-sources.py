#!/usr/bin/env python3
"""Remove publication-process prose from five public detail compendium sources.

The Markdown files are the normalized, editable source layer recovered from the
original office documents.  This cleanup leaves the substantive model text in
place and removes only prose about correction history, web production and
download routing.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "docs/korrektur-detailkonzepte/docx-extracts"
REPORT = ROOT / "reports/consistency-20261009/detail-compendium-source-cleanup-20261013.json"
TARGETS = (
    "woek_impact_controlling_detailkonzepte_umfangreich_v0_2.md",
    "woek_produkte_konsum_detailkonzepte_umfangreich_v0_2.md",
    "woek_staat_recht_demokratie_detailkonzepte_umfangreich_v0_2.md",
    "woek_wirtschaft_unternehmen_detailkonzepte_umfangreich_v0_2.md",
    "woek_wohnen_stadt_detailkonzepte_umfangreich_v0_2.md",
)

DROP_EXACT = {
    "Vorwort und Korrekturhinweis",
    (
        "Diese nachgelieferte Korrekturfassung ersetzt die bisher sehr kurzen "
        "Detailkonzept-Skizzen. Sie ist bewusst als ausführliches "
        "Detailkonzept-Kompendium aufgebaut. Jeder Unterbereich erhält eine "
        "fachliche Ausarbeitung mit Problem, Wirkungslogik, Systemarchitektur, "
        "Messlogik, politischer Anschlussfähigkeit, Risiken und Online-/Dossierbezug."
    ),
    (
        "Die Inhalte sind öffentlich formuliert. Interne Umsetzungs- und "
        "Prozesshinweise wurden bewusst nicht aufgenommen. Öffentliche Dokumente "
        "erklären Fachinhalte, nicht Arbeitsabläufe."
    ),
    (
        "Öffentlicher CharakterDieses Dokument ist als fachliche Grundlage für "
        "Website, Online-Volltext, Download und Dossier geeignet. Es enthält "
        "keine internen technischen Arbeitsanweisungen."
    ),
    "Gemeinsame Veröffentlichungslogik",
    (
        "Jeder Unterbereich wird auf der Website als vollständige Online-Fassung "
        "veröffentlicht. Das Detailkonzept bildet die fachliche Grundlage, das "
        "Einzeldossier ergänzt Beispiele, Berechnungen, Datenquellen und "
        "Umsetzungsvarianten. Downloads sind Export und Archiv, nicht der Hauptzugang."
    ),
}

DROP_SECTION = re.compile(
    r"^\d+\.\s*(?:Online-,\s*Dossier-\s*und\s*Toolbezug|"
    r"Online-,\s*Dossier-\s*und\s*Tool-Bezug|"
    r"Online-Umsetzung|Tool-\s*und\s*Online-Bezug|"
    r"Tool-\s*und\s*Online-Umsetzung)$",
    re.IGNORECASE,
)

DROP_SECTION_BODY = re.compile(
    r"^Für diesen Unterbereich entstehen künftig drei öffentliche Zugänge:.*",
    re.IGNORECASE,
)

EDITORIAL_TAIL = re.compile(
    r"\s+Es ist als öffentliche Arbeitsfassung angelegt und bildet die fachliche "
    r"Grundlage für Online-Volltext, Einzeldossier, Toolbezug und politische "
    r"Anschlussfähigkeit\.$"
)

BANNED = re.compile(
    r"Vorwort und Korrekturhinweis|nachgelieferte Korrekturfassung|"
    r"interne(?:n)? (?:technische(?:n)? )?(?:Umsetzungs|Arbeits)|"
    r"nicht Arbeitsabläufe|Website|Online-Volltext|Toolbezug|"
    r"Gemeinsame Veröffentlichungslogik",
    re.IGNORECASE,
)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def clean(path: Path, previous: dict[str, object] | None = None) -> dict[str, object]:
    before = path.read_bytes()
    paragraphs = [part.strip() for part in path.read_text(encoding="utf-8").split("\n\n") if part.strip()]
    output: list[str] = []
    removed: list[str] = []
    changed: list[dict[str, str]] = []
    format_corrections = 0

    for paragraph in paragraphs:
        if paragraph in DROP_EXACT or DROP_SECTION.fullmatch(paragraph) or DROP_SECTION_BODY.fullmatch(paragraph):
            removed.append(paragraph)
            continue
        if paragraph == "nachgelieferte Korrekturfassung":
            output.append("Fachliche Arbeitsfassung")
            changed.append({"from": paragraph, "to": "Fachliche Arbeitsfassung"})
            continue
        revised = EDITORIAL_TAIL.sub("", paragraph).strip()
        revised, count = re.subn(r"^Kernformel(?=\S)", "Kernformel: ", revised)
        format_corrections += count
        if revised != paragraph:
            changed.append({"from": paragraph, "to": revised})
        output.append(revised)

    cleaned = "\n\n".join(output).rstrip() + "\n"
    match = BANNED.search(cleaned)
    if match:
        raise RuntimeError(f"editorial production wording remains in {path}: {match.group(0)!r}")
    path.write_text(cleaned, encoding="utf-8")
    after = path.read_bytes()
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "beforeSha256": (previous or {}).get("beforeSha256", sha256(before)),
        "afterSha256": sha256(after),
        "removedParagraphs": max(int((previous or {}).get("removedParagraphs", 0)), len(removed)),
        "revisedParagraphs": max(int((previous or {}).get("revisedParagraphs", 0)), len(changed)),
        "formatCorrections": max(int((previous or {}).get("formatCorrections", 0)), format_corrections),
    }


def main() -> None:
    previous_records: dict[str, dict[str, object]] = {}
    if REPORT.exists():
        previous_report = json.loads(REPORT.read_text(encoding="utf-8"))
        previous_records = {record["path"]: record for record in previous_report.get("records", [])}
    records = []
    for name in TARGETS:
        path = SOURCE_DIR / name
        key = path.relative_to(ROOT).as_posix()
        records.append(clean(path, previous_records.get(key)))
    report = {
        "date": "2026-10-13",
        "status": "PASS",
        "scope": "Five current detail-compendium source texts",
        "records": records,
        "totals": {
            "sources": len(records),
            "removedParagraphs": sum(int(record["removedParagraphs"]) for record in records),
            "revisedParagraphs": sum(int(record["revisedParagraphs"]) for record in records),
            "formatCorrections": sum(int(record["formatCorrections"]) for record in records),
        },
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS", **report["totals"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
