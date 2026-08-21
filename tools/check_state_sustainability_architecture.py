#!/usr/bin/env python3
"""Hard semantic release gates for issue #253.

The checks are deliberately fail-closed on the living public surfaces and provenance records.
They do not infer political judgements; they verify that the approved state-vs-WÖk distinction
survives generation and that historical publications were not silently rewritten.
"""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = "state-sustainability-architecture-20260821"
PRECISION_MARKER = "state-sustainability-precision-20260821"
REQUIRED_LIVING = [
    "index.html",
    "modell.html",
    "methodik/index.html",
    "methodik/datenbasis.html",
    "methodik/externe-quellen.html",
    "fuer/politik.html",
    "wirkungsfelder/staat-recht-demokratie/index.html",
    "wirkungswissenschaften/index.html",
]
HISTORICAL_ADDENDA = [
    "wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/index.html",
    "werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung/index.html",
    "werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/politische-wirkungspruefung/index.html",
]
PUBLIC_ENUMS = ("NOT_PUBLICLY_ESTABLISHED", "NOT_ASSESSED")


def read(rel: str) -> str:
    p = ROOT / rel
    if not p.exists():
        raise AssertionError(f"missing required file: {rel}")
    return p.read_text(encoding="utf-8", errors="replace")


def require(rel: str, needles: list[str]) -> None:
    text = read(rel)
    missing = [n for n in needles if n not in text]
    if missing:
        raise AssertionError(f"{rel}: missing required #253 semantics: {missing}")


def no_raw_public_enums() -> None:
    proc = subprocess.run(["git", "ls-files", "*.html"], cwd=ROOT, check=True, text=True, stdout=subprocess.PIPE)
    bad = []
    for rel in proc.stdout.splitlines():
        if rel.startswith(("_site/", "_debug/", "_internal/", "admin/", "woek-parlament-app/")):
            continue
        text = read(rel)
        hits = [e for e in PUBLIC_ENUMS if e in text]
        if hits:
            bad.append((rel, hits))
    if bad:
        raise AssertionError(f"public raw internal status enums found: {bad[:20]}")


def historical_additions_only() -> None:
    # Historical bodies may receive transparent addenda, never silent deletion/rewording.
    for rel in HISTORICAL_ADDENDA:
        require(rel, ["Fachaddendum", "21.08.2026"])
        proc = subprocess.run(
            ["git", "diff", "--unified=0", "origin/main...HEAD", "--", rel],
            cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
        if proc.returncode not in (0, 1):
            raise AssertionError(f"could not compare historical page {rel}: {proc.stderr}")
        removed = [ln for ln in proc.stdout.splitlines() if ln.startswith("-") and not ln.startswith("---")]
        if removed:
            raise AssertionError(f"historical publication silently changed/deleted content: {rel}: {removed[:5]}")


def glossary_and_sources() -> None:
    source_text = read("content/quellenarchiv/legal-source-records.json")
    for code in ("WÖK-Q-1029", "WÖK-Q-1030", "WÖK-Q-1031", "WÖK-Q-1032", "WÖK-Q-1033", "WÖK-Q-1034"):
        if code not in source_text:
            raise AssertionError(f"missing canonical federal architecture source {code}")
    correct_dns = "https://www.bundesregierung.de/breg-de/aktuelles/deutsche-nachhaltigkeitsstrategie-2025-2332540"
    if correct_dns not in source_text:
        raise AssertionError("canonical DNS 2025 source URL missing")
    glossary_source = json.loads(read("content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json"))
    ids = {t.get("termId") for t in glossary_source.get("terms", [])}
    required = {
        "deutsche-nachhaltigkeitsstrategie", "gesetzesfolgenabschaetzung", "nachhaltigkeitspruefung-bund",
        "enap", "egesetzgebung-egfa", "dns-indikator", "zielbezug-vs-wirkung",
        "ex-ante-folgenpruefung-reality-check", "staatliche-nachhaltigkeitsarchitektur",
        "parlamentarischer-beirat-nachhaltige-entwicklung", "state-gfa-enap-benchmark", "wirkungsblindheit",
    }
    if missing := sorted(required - ids):
        raise AssertionError(f"missing #253 glossary terms: {missing}")
    # If the site has already run its glossary build, generated registry must contain the terms too.
    generated = ROOT / "public/data/glossary.terms.json"
    if generated.exists():
        data = json.loads(generated.read_text(encoding="utf-8"))
        text = json.dumps(data, ensure_ascii=False)
        for tid in required:
            if tid not in text:
                raise AssertionError(f"generated glossary registry missing {tid}")


def main() -> int:
    checks: list[tuple[str, callable]] = []

    checks.append(("STATE_SUSTAINABILITY_ARCHITECTURE_ACKNOWLEDGED", lambda: [
        require(rel, ["Deutschland prüft Folgen bereits", "Die Wirkungsökonomie ersetzt diese Architektur nicht"])
        for rel in REQUIRED_LIVING if rel not in {"fuer/politik.html"}
    ]))
    checks.append(("NO_FALSE_GFA_ABSENCE_CLAIM", lambda: require("fuer/politik.html", ["Gesetzesfolgenabschätzung", "bereits Teil der staatlichen Architektur"])))
    checks.append(("NO_FALSE_ENAP_ABSENCE_CLAIM", lambda: require("methodik/datenbasis.html", ["eNAP / eGFA", "Bestehende staatliche Ex-ante-Folgenprüfung"])))
    checks.append(("DNS_GERMAN_CONTEXT_PRESENT_WHERE_RELEVANT", lambda: require("modell.html", ["Deutsche Nachhaltigkeitsstrategie", "DNS"])))
    checks.append(("STATE_ASSESSMENT_SEPARATE_FROM_WOEK_JUDGMENT", lambda: require("methodik/datenbasis.html", ["Staatliche Einschätzung bleibt vom unabhängigen WÖk-Urteil getrennt"])))
    checks.append(("STATE_TARGET_ALIGNMENT_NOT_CAUSALITY", lambda: require("index.html", ["kein automatischer Kausalitätsnachweis"])))
    checks.append(("PUBLIC_DOCUMENTATION_ABSENCE_NOT_EQUATED_WITH_NO_ASSESSMENT", lambda: require("methodik/externe-quellen.html", ["Daraus folgt nicht, dass keine Prüfung stattgefunden hat"])))
    checks.append(("WOEK_USP_IS_ADDITIVE_AND_SPECIFIC", lambda: require("fuer/politik.html", ["Problemprüfung", "Zielprüfung", "Gegenfaktum", "Optionsvergleich", "Reality Check"])))
    checks.append(("GLOSSARY_AND_SOURCE_CROSSLINKS_PASS", glossary_and_sources))
    checks.append(("HISTORICAL_PUBLICATIONS_NOT_SILENTLY_REWRITTEN", historical_additions_only))
    checks.append(("NO_FALSE_ABSENCE_OF_ALTERNATIVES_CLAIM", lambda: require("index.html", ["andere Lösungsmöglichkeiten"])))
    checks.append(("NO_FALSE_ABSENCE_OF_EXPOST_REVIEW_CLAIM", lambda: require("index.html", ["spätere Überprüfung"])))
    checks.append(("GGO_43_44_FULL_SCOPE_ACKNOWLEDGED", lambda: require("methodik/datenbasis.html", ["Ziel/Notwendigkeit", "Alternativen", "beabsichtigte Wirkungen", "unbeabsichtigte Nebenwirkungen", "späteren Überprüfung"])))
    checks.append(("PUBLIC_GFA_NOT_MISLABELED_AS_PUBLIC_ENAP_EXPORT", lambda: require("methodik/datenbasis.html", ["Öffentliche GFA-Dokumentation ist nicht automatisch ein veröffentlichter eNAP-Rohexport"])))
    checks.append(("NO_PUBLIC_RAW_STATUS_ENUMS", no_raw_public_enums))

    passed = []
    for name, fn in checks:
        fn()
        passed.append(name)
        print(f"PASS {name}")
    print(f"#253 semantic gates PASS: {len(passed)}/{len(checks)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
