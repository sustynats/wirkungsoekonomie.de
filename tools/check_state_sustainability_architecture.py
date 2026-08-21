#!/usr/bin/env python3
"""Hard semantic and audit-contract release gates for issue #253.

The checks are deliberately fail-closed on the living public surfaces and provenance records.
They do not infer political judgements; they verify that the approved state-vs-WÖk distinction
survives generation, that historical publications were not silently rewritten, and that the
complete sitewide matrix required by #253 is committed/reproducible.
"""
from __future__ import annotations

import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
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
MATRIX_JSON = "content/audits/state-sustainability-architecture-url-matrix.json"
MATRIX_MD = "content/audits/state-sustainability-architecture-url-matrix.md"
MATRIX_REQUIRED_FIELDS = {
    "source_path", "public_url", "historical_publication", "relevance",
    "classification", "required_action", "source_refs", "status",
}
CANONICAL_BENCHMARK = "blog/enap-woek-benchmark-fuenf-bundesvorhaben.html"


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
    """Require historical pages to remain content-preserving plus an explicit addendum.

    An addendum often has to be inserted immediately before ``</main>``. Git represents that
    as one removed ``</main>`` line and the same line re-added after the new section. That is a
    relocation, not a historical content deletion. We therefore cancel byte-equivalent (after
    outer whitespace) removed/added lines as a multiset and fail closed on every remaining
    removed non-empty line. This permits wrapper relocation but still rejects any historical
    prose deletion or rewrite.
    """
    for rel in HISTORICAL_ADDENDA:
        require(rel, ["Fachaddendum", "21.08.2026"])
        proc = subprocess.run(
            ["git", "diff", "--unified=0", "origin/main...HEAD", "--", rel],
            cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
        if proc.returncode not in (0, 1):
            raise AssertionError(f"could not compare historical page {rel}: {proc.stderr}")

        removed = [
            ln[1:].strip()
            for ln in proc.stdout.splitlines()
            if ln.startswith("-") and not ln.startswith("---") and ln[1:].strip()
        ]
        added = [
            ln[1:].strip()
            for ln in proc.stdout.splitlines()
            if ln.startswith("+") and not ln.startswith("+++") and ln[1:].strip()
        ]

        added_counts = Counter(added)
        unmatched_removed = []
        for line in removed:
            if added_counts[line] > 0:
                added_counts[line] -= 1
            else:
                unmatched_removed.append(line)
        if unmatched_removed:
            raise AssertionError(
                f"historical publication silently changed/deleted content: {rel}: {unmatched_removed[:5]}"
            )


def glossary_and_sources() -> None:
    source_text = read("content/quellenarchiv/legal-source-records.json")
    # #253 sources intentionally use a collision-free 9000 range because the
    # publication supplement corpus already owns WÖK-Q-1029..1037 historically.
    for code in ("WÖK-Q-9029", "WÖK-Q-9030", "WÖK-Q-9031", "WÖK-Q-9032", "WÖK-Q-9033", "WÖK-Q-9034", "WÖK-Q-9035"):
        if code not in source_text:
            raise AssertionError(f"missing canonical federal architecture source {code}")
    if "bundesregierung.de" not in source_text or "deutsche-nachhaltigkeitsstrategie-2025-2332540" not in source_text:
        raise AssertionError("canonical DNS 2025 Bundesregierung source missing")
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
    generated = ROOT / "public/data/glossary.terms.json"
    if generated.exists():
        data = json.loads(generated.read_text(encoding="utf-8"))
        text = json.dumps(data, ensure_ascii=False)
        for tid in required:
            if tid not in text:
                raise AssertionError(f"generated glossary registry missing {tid}")


def state_architecture_scope_guard() -> None:
    kommunal = read("fuer/kommunen.html")
    forbidden = [
        "state-sustainability-architecture-20260821",
        "§ 43 GGO",
        "§ 44 GGO",
        "STATE_GFA_ENAP_BENCHMARK",
    ]
    hits = [needle for needle in forbidden if needle in kommunal]
    if hits:
        raise AssertionError(f"federal #253 architecture leaked into municipal scope: {hits}")


def benchmark_single_source_of_truth() -> None:
    require(CANONICAL_BENCHMARK, ["21/6279", "21/2999", "21/3058", "21/1511", "21/1855"])
    proc = subprocess.run(
        ["git", "ls-files", "blog/*enap*benchmark*.html"],
        cwd=ROOT, check=True, text=True, stdout=subprocess.PIPE,
    )
    candidates = [line.strip() for line in proc.stdout.splitlines() if line.strip()]
    if candidates != [CANONICAL_BENCHMARK]:
        raise AssertionError(f"competing eNAP/WÖk benchmark corpus detected: {candidates}")


def audit_matrix_contract() -> None:
    matrix_path = ROOT / MATRIX_JSON
    md_path = ROOT / MATRIX_MD
    if not matrix_path.exists() or not md_path.exists():
        raise AssertionError("release-blocking #253 URL/file matrix is missing")
    data = json.loads(matrix_path.read_text(encoding="utf-8"))
    if data.get("issue") != 253:
        raise AssertionError("matrix issue binding is not #253")
    if int(data.get("sitemap_route_count", 0)) <= 0:
        raise AssertionError("matrix has no sitemap routes")
    items = data.get("all_items") or []
    if not items:
        raise AssertionError("matrix does not contain recursive all_items")
    for idx, item in enumerate(items):
        missing = sorted(MATRIX_REQUIRED_FIELDS - set(item))
        if missing:
            raise AssertionError(f"matrix item {idx} missing contract fields: {missing}")
    route_paths = {item.get("source_path") for item in items}
    if CANONICAL_BENCHMARK not in route_paths:
        raise AssertionError("canonical five-case benchmark missing from complete #253 matrix")
    if "llms.txt" not in route_paths or "sitemap.xml" not in route_paths:
        raise AssertionError("matrix omits required machine-readable support surfaces")


def living_route_precision() -> None:
    """Fail closed on living routes that the complete #253 matrix classifies for explicit action."""
    require("wirkungsoekonomie.html", [
        "Deutsche Nachhaltigkeitsstrategie (DNS)",
        "nicht automatisch Wirkung oder Kausalität",
        "SDG+ ist eine WÖk-eigene Erweiterung",
    ])
    require("verstehen.html", [
        "Deutsche Nachhaltigkeitsstrategie",
        "kein Wirkungs- oder Kausalitätsnachweis",
        "SDG+ ist eine WÖk-eigene Erweiterung",
    ])
    require("workflow.html", [
        "GGO/GFA",
        "eNAP/eGFA",
        "nicht automatisch Kausalitätsnachweise",
    ])
    require("kompass.html", [
        "Frühe Folgen- und Nachhaltigkeitsprüfung existiert im Bund bereits",
        "staatliche Prüf- und Quellenarchitektur",
    ])


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
    checks.append(("LIVING_ROUTE_PRECISION_COMPLETE", living_route_precision))
    checks.append(("GLOSSARY_AND_SOURCE_CROSSLINKS_PASS", glossary_and_sources))
    checks.append(("HISTORICAL_PUBLICATIONS_NOT_SILENTLY_REWRITTEN", historical_additions_only))
    checks.append(("NO_FALSE_ABSENCE_OF_ALTERNATIVES_CLAIM", lambda: require("index.html", ["andere Lösungsmöglichkeiten"])))
    checks.append(("NO_FALSE_ABSENCE_OF_EXPOST_REVIEW_CLAIM", lambda: require("index.html", ["spätere Überprüfung"])))
    checks.append(("GGO_43_44_FULL_SCOPE_ACKNOWLEDGED", lambda: require("methodik/datenbasis.html", ["Ziel/Notwendigkeit", "Alternativen", "beabsichtigte Wirkungen", "unbeabsichtigte Nebenwirkungen", "späteren Überprüfung"])))
    checks.append(("PUBLIC_GFA_NOT_MISLABELED_AS_PUBLIC_ENAP_EXPORT", lambda: require("methodik/datenbasis.html", ["Öffentliche GFA-Dokumentation ist nicht automatisch ein veröffentlichter eNAP-Rohexport"])))
    checks.append(("STATE_ARCHITECTURE_NOT_APPLIED_OUTSIDE_SCOPE", state_architecture_scope_guard))
    checks.append(("BENCHMARK_CORPUS_SINGLE_SOURCE_OF_TRUTH_5_CASES", benchmark_single_source_of_truth))
    checks.append(("AUDIT_MATRIX_CONTRACT_PASS", audit_matrix_contract))
    checks.append(("NO_PUBLIC_RAW_STATUS_ENUMS", no_raw_public_enums))

    passed = []
    for name, fn in checks:
        fn()
        passed.append(name)
        print(f"PASS {name}")
    print(f"#253 semantic/audit gates PASS: {len(passed)}/{len(checks)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())