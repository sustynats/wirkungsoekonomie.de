#!/usr/bin/env python3
"""Final public-copy precision for #253.

Keeps internal workflow enums out of public copy, fixes the canonical DNS 2025 URL and
uses a human-readable label for the state GFA/eNAP benchmark. Deterministic/idempotent.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REPLACEMENTS = {
    "methodik/datenbasis.html": [
        (
            "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/deutsche-nachhaltigkeitsstrategie-2025-2332540",
            "https://www.bundesregierung.de/breg-de/aktuelles/deutsche-nachhaltigkeitsstrategie-2025-2332540",
        ),
    ],
    "methodik/externe-quellen.html": [
        (
            "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/deutsche-nachhaltigkeitsstrategie-2025-2332540",
            "https://www.bundesregierung.de/breg-de/aktuelles/deutsche-nachhaltigkeitsstrategie-2025-2332540",
        ),
        (
            "Fehlt eine öffentlich auffindbare eNAP-Zusammenfassung, lautet der Dokumentationsstatus NOT_PUBLICLY_ESTABLISHED - nicht automatisch NOT_ASSESSED.",
            "Fehlt eine öffentlich auffindbare eNAP-Zusammenfassung, ist die öffentliche Dokumentation nicht belegt. Daraus folgt nicht, dass keine Prüfung stattgefunden hat.",
        ),
    ],
}


def replace_file(rel: str, pairs: list[tuple[str, str]]) -> bool:
    p = ROOT / rel
    if not p.exists():
        return False
    text = p.read_text(encoding="utf-8")
    before = text
    for old, new in pairs:
        text = text.replace(old, new)
    if text != before:
        p.write_text(text, encoding="utf-8")
        return True
    return False


def update_glossary() -> bool:
    import json
    rel = "content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json"
    p = ROOT / rel
    data = json.loads(p.read_text(encoding="utf-8"))
    changed = False
    for term in data.get("terms", []):
        if term.get("termId") in {"nachhaltigkeitspruefung-bund", "enap", "state-gfa-enap-benchmark"}:
            for key in ("shortDefinition", "hoverDefinition", "longDefinition", "usageNote", "woekRelation"):
                value = term.get(key)
                if not isinstance(value, str):
                    continue
                new = value.replace(
                    "NOT_PUBLICLY_ESTABLISHED", "öffentlich nicht belegt"
                ).replace(
                    "NOT_ASSESSED", "nicht geprüft"
                ).replace(
                    "STATE_GFA_ENAP_BENCHMARK", "staatlicher GFA-/eNAP-Benchmark"
                )
                if new != value:
                    term[key] = new
                    changed = True
        if term.get("termId") == "state-gfa-enap-benchmark":
            if term.get("canonicalLabel") != "Staatlicher GFA-/eNAP-Benchmark":
                term["canonicalLabel"] = "Staatlicher GFA-/eNAP-Benchmark"
                changed = True
            aliases = term.setdefault("aliases", [])
            if "STATE_GFA_ENAP_BENCHMARK" not in aliases:
                aliases.append("STATE_GFA_ENAP_BENCHMARK")
                changed = True
    if changed:
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return changed


def main() -> int:
    changed = []
    for rel, pairs in REPLACEMENTS.items():
        if replace_file(rel, pairs):
            changed.append(rel)
    if update_glossary():
        changed.append("content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json")
    print(f"Applied final public #253 precision to {len(changed)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
