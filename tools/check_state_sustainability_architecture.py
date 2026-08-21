#!/usr/bin/env python3
"""Hard semantic and audit-contract release gates for issue #253.

The checks are deliberately fail-closed on the living public surfaces and provenance records.
They do not infer political judgements; they verify that the approved state-vs-WÖk distinction
survives generation, that historical publications were not silently rewritten, and that the
complete sitewide matrix required by #253 is committed/reproducible.
"""
from __future__ import annotations

import json
import re
import subprocess
from collections import Counter
from html import unescape
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
NWI_AUDIT = "content/audits/nwi-acronym-disambiguation.json"
CURRENT_GUIDE_LABEL = "WÖk-Begriffsleitfaden führend v1.6"
CURRENT_GUIDE_URL = "/bibliothek/woek-begriffsleitfaden-fuehrend/"
CURRENT_GUIDE_SURFACES = [
    "fuer/akademie.html",
    "fuer/buergerinnen.html",
    "fuer/gesundheit.html",
    "fuer/investoren.html",
    "fuer/journalismus.html",
    "fuer/kommunen.html",
    "fuer/kommunen/kommunaler-wirkungsindex.html",
    "fuer/mieter.html",
    "fuer/politik.html",
    "fuer/rente.html",
    "fuer/unternehmen.html",
    "fuer/wirkungseinkommen.html",
    "fuer/wissenschaft-forschung.html",
    "sdg-plus/medien-demokratie/wirkung-politischer-sprache.html",
]


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
        if rel.startswith("api/"):
            continue
        if not (ROOT / rel).is_file():
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
    merge_base = subprocess.run(
        ["git", "merge-base", "origin/main", "HEAD"],
        cwd=ROOT, check=True, text=True, stdout=subprocess.PIPE,
    ).stdout.strip()
    for rel in HISTORICAL_ADDENDA:
        require(rel, ["Fachaddendum", "21.08.2026"])
        proc = subprocess.run(
            ["git", "diff", "--unified=0", merge_base, "--", rel],
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
    for code in (
        "WÖK-Q-9029", "WÖK-Q-9030", "WÖK-Q-9031", "WÖK-Q-9032", "WÖK-Q-9033",
        "WÖK-Q-9034", "WÖK-Q-9035", "WÖK-Q-9036", "WÖK-Q-9037",
    ):
        if code not in source_text:
            raise AssertionError(f"missing canonical federal architecture source {code}")
    if "bundesregierung.de" not in source_text or "deutsche-nachhaltigkeitsstrategie-2025-2332540" not in source_text:
        raise AssertionError("canonical DNS 2025 Bundesregierung source missing")
    glossary_source = json.loads(read("content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json"))
    ids = {t.get("termId") for t in glossary_source.get("terms", [])}
    required = {
        "deutsche-nachhaltigkeitsstrategie", "gemeinsame-geschaeftsordnung-bundesministerien",
        "gesetzesfolgenabschaetzung", "nachhaltigkeitspruefung-bund",
        "enap", "egesetzgebung-egfa", "dns-indikator", "zielbezug-vs-wirkung",
        "ex-ante-folgenpruefung-reality-check", "staatliche-nachhaltigkeitsarchitektur",
        "parlamentarischer-beirat-nachhaltige-entwicklung", "state-assessment-benchmark",
        "state-gfa-enap-benchmark", "wirkungsblindheit",
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
        terms = {term.get("termId"): term for term in data.get("terms", [])}
        blind = terms.get("wirkungsblindheit") or {}
        if blind.get("version") != "2.0" or "keinerlei Folgen prüft oder misst" not in blind.get("shortDefinition", ""):
            raise AssertionError("approved #253 Wirkungsblindheit v2.0 precision did not win the canonical glossary merge")


def terminology_guide_provenance() -> None:
    for rel in CURRENT_GUIDE_SURFACES:
        text = read(rel)
        if CURRENT_GUIDE_LABEL not in text or "woek-begriffsleitfaden-fuehrend/" not in text:
            raise AssertionError(f"{rel}: living source surface does not point to the leading terminology guide v1.6")
        if "Führender Begriffsleitfaden der Wirkungsökonomie v1.0" in text or "Führender Begriffsleitfaden der Wirkungsökonomie v1.2" in text:
            raise AssertionError(f"{rel}: obsolete guide is still presented as a current source")

    require(CANONICAL_BENCHMARK, ["WÖk-Masterregister v1.5", CURRENT_GUIDE_LABEL])
    require("woek-id-register/quellen/index.html", ["Quellenkatalog v1.5", "Begriffsleitfaden der Wirkungsökonomie v1.6", "WÖk Master Items v1.5"])

    records = json.loads(read("content/quellenarchiv/glossary-source-records.json")).get("sources", [])
    current = next((source for source in records if source.get("title") == CURRENT_GUIDE_LABEL), None)
    if not current or current.get("reviewStatus") != "fuehrend" or not str(current.get("url", "")).endswith(CURRENT_GUIDE_URL):
        raise AssertionError("leading terminology guide v1.6 has no correct source-archive record")
    historical_v10 = next((source for source in records if "Begriffsleitfaden" in source.get("title", "") and "v1.0" in source.get("title", "")), None)
    if not historical_v10 or historical_v10.get("reviewStatus") != "historisch" or not str(historical_v10.get("url", "")).endswith("/woek-begriffsleitfaden-fuehrend-v1-0/"):
        raise AssertionError("historical terminology guide v1.0 was silently redirected to the current publication")


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
    if int(data.get("review_open_count", -1)) != 0 or data.get("review_open_items"):
        raise AssertionError(
            f"matrix still has open semantic/action reviews: {data.get('review_open_count')}"
        )


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


def materiality_scope_precision() -> None:
    required_copy = [
        "Materialität statt Rechtsform",
        "Weil Wirkung nicht an der Rechtsform hängt.",
        "Deutschland prüft Folgen bereits - aber mit unterschiedlichen Verfahren je nach Entscheidungstyp.",
        "Für alle finanzwirksamen Maßnahmen verlangt § 7 BHO",
        "Zielerreichungs-, Wirkungs- und Wirtschaftlichkeitskontrolle",
        "Eine fehlende öffentliche Dokumentation beweist weder fehlende Prüfung",
        "Staatliches Eigentum allein",
    ]
    for rel in (
        "index.html",
        "modell.html",
        "methodik/index.html",
        "fuer/politik.html",
        "wirkungsfelder/staat-recht-demokratie/index.html",
    ):
        require(rel, required_copy)

    llms = read("llms.txt")
    for token in (
        "LAW, REGULATION, STRATEGY, PROGRAMME, SUBSIDY, GUARANTEE, PROCUREMENT",
        "PUBLIC_OWNERSHIP_ACTION",
        "GGO/eNAP ist der Regelungsvorhaben-Untertyp",
        "BHO/VV-BHO ist der Rahmen für finanzwirksame Maßnahmen",
    ):
        if token not in llms:
            raise AssertionError(f"llms materiality/object contract missing: {token}")

    sources = read("content/quellenarchiv/legal-source-records.json")
    for token in (
        "WÖK-Q-9046",
        "https://www.gesetze-im-internet.de/ksg/__13.html",
        "WÖK-Q-9047",
        "https://www.gesetze-im-internet.de/kang/__8.html",
        "WÖK-Q-9048",
        "https://www.gesetze-im-internet.de/bho/__7.html",
        "WÖK-Q-9049",
        "https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_14032001_DokNr20110981762.htm",
        "WÖK-Q-9050",
        "ziel-und-wirkungsorientierte-haushaltsfuehrung.html",
    ):
        if token not in sources:
            raise AssertionError(f"object-specific governance source missing: {token}")

    glossary = json.loads(read("content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json"))
    benchmark = next((term for term in glossary.get("terms", []) if term.get("termId") == "state-assessment-benchmark"), None)
    if not benchmark:
        raise AssertionError("object-generic state assessment benchmark is missing")
    required_fields = {
        "applicable_state_frameworks", "state_problem_or_need_assessment",
        "state_option_comparison", "state_ex_ante_effect_assessment",
        "state_success_or_effect_control", "state_attribution_method",
        "public_documentation_status",
    }
    if set(benchmark.get("schemaFields") or []) != required_fields:
        raise AssertionError("state assessment benchmark schema fields are incomplete")
    gfa_subtype = next((term for term in glossary.get("terms", []) if term.get("termId") == "state-gfa-enap-benchmark"), None)
    if not gfa_subtype or "Regelungsvorhaben-Untertyp" not in gfa_subtype.get("woekRelation", ""):
        raise AssertionError("GFA/eNAP benchmark is not preserved as the rulemaking subtype")
    for code in ("9048", "9049", "9050"):
        require(
            f"quellenarchiv/wok-q-{code}/index.html",
            ["Quelle öffnen", "Wirkungsökonomische Einordnung", "Verwendet in", "Objektspezifischer staatlicher Prüfbenchmark"],
        )


def nwi_acronym_disambiguated() -> None:
    report = json.loads(read(NWI_AUDIT))
    if report.get("gate") != "PASS" or int(report.get("failure_count", -1)) != 0:
        raise AssertionError("NWI terminology inventory is not fail-closed PASS")
    if report.get("established_public_meaning") != "Nationaler Wohlfahrtsindex (NWI)":
        raise AssertionError("established public NWI meaning is missing")
    if report.get("woek_model_public_name") != "WÖk-Netto-Wirkungsindex":
        raise AssertionError("WÖk model is not publicly namespaced")

    source_text = read("content/quellenarchiv/sources.json")
    if "WÖK-Q-9045" not in source_text or "umweltbundesamt.de/daten/umweltindikatoren/indikator-nationaler-wohlfahrtsindex" not in source_text:
        raise AssertionError("official UBA Nationaler Wohlfahrtsindex source is missing")
    require("quellenarchiv/wok-q-9045/index.html", ["Nationaler Wohlfahrtsindex", "21", "WÖk-Netto-Wirkungsindex"])
    require("begriffe/nationaler-wohlfahrtsindex/index.html", ["Nationaler Wohlfahrtsindex (NWI)", "WÖk-Netto-Wirkungsindex"])
    require("begriffe/nwi/index.html", ["WÖk-Netto-Wirkungsindex", "Nationaler Wohlfahrtsindex (NWI)"])
    public_glossary = json.loads(read("public/data/glossary.terms.json"))
    public_terms = public_glossary.get("terms", public_glossary) if isinstance(public_glossary, dict) else public_glossary
    woek_term = next((term for term in public_terms if term.get("id") == "nwi" or term.get("termId") == "nwi"), None)
    official_term = next((term for term in public_terms if term.get("id") == "nationaler-wohlfahrtsindex" or term.get("termId") == "nationaler-wohlfahrtsindex"), None)
    if not woek_term or woek_term.get("canonicalLabel") != "WÖk-Netto-Wirkungsindex":
        raise AssertionError("public glossary WÖk index label is ambiguous")
    if "WÖk-NWI" in (woek_term.get("aliases") or []):
        raise AssertionError("deprecated WÖk-NWI alias leaked into the public glossary")
    if not official_term or official_term.get("canonicalLabel") != "Nationaler Wohlfahrtsindex (NWI)":
        raise AssertionError("public glossary official NWI term is missing")

    proc = subprocess.run(
        ["git", "ls-files", "*.html"], cwd=ROOT, check=True, text=True, stdout=subprocess.PIPE,
    )
    ambiguous = []
    historical_prefixes = ("bibliothek/", "blog/", "dokumente/", "referenz/")
    for rel in proc.stdout.splitlines():
        if rel.startswith(("_site/", "_debug/", "_internal/", "admin/", "woek-parlament-app/")):
            continue
        if rel.startswith("api/"):
            continue
        if not (ROOT / rel).is_file():
            continue
        page = read(rel)
        if (rel.startswith(historical_prefixes) or rel in HISTORICAL_ADDENDA) and "WOEK:NWI-DISAMBIGUATION:START" in page:
            continue
        visible = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", page, flags=re.I | re.S)
        visible = unescape(re.sub(r"<[^>]+>", " ", visible))
        visible = re.sub(r"https?://\S+", " ", visible)
        for match in re.finditer(r"\bNWI\b", visible, flags=re.I):
            context = visible[max(0, match.start() - 220):min(len(visible), match.end() + 220)]
            qualified = (
                re.search(r"National(?:er|en|e|em|es)\s+Wohlfahrtsindex", context, flags=re.I)
                or re.search(r"(?:frühere|damalige|historische)\s+(?:WÖk-)?(?:Kurz)?bezeichnung", context, flags=re.I)
            )
            if not qualified:
                ambiguous.append((rel, match.start()))
                break
    if ambiguous:
        raise AssertionError(f"public HTML contains unqualified NWI: {ambiguous[:20]}")

    # Machine-readable public guidance must use a qualified acronym. The exact
    # established phrase and the dated historical-alias explanation are valid;
    # every other bare token is ambiguous and release-blocking.
    llms = read("llms.txt")
    for match in re.finditer(r"\bNWI\b", llms, flags=re.I):
        context = llms[max(0, match.start() - 220):min(len(llms), match.end() + 220)]
        qualified = (
            re.search(r"National(?:er|en|e|em|es)\s+Wohlfahrtsindex", context, flags=re.I)
            or re.search(r"(?:frühere|damalige|historische)\s+(?:WÖk-)?(?:Kurz)?bezeichnung", context, flags=re.I)
        )
        if not qualified:
            raise AssertionError(f"llms.txt contains unqualified NWI near offset {match.start()}")


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
    checks.append(("TERMINOLOGY_GUIDE_V16_PROVENANCE_PASS", terminology_guide_provenance))
    checks.append(("HISTORICAL_PUBLICATIONS_NOT_SILENTLY_REWRITTEN", historical_additions_only))
    checks.append(("NO_FALSE_ABSENCE_OF_ALTERNATIVES_CLAIM", lambda: require("index.html", ["andere Lösungsmöglichkeiten"])))
    checks.append(("NO_FALSE_ABSENCE_OF_EXPOST_REVIEW_CLAIM", lambda: require("index.html", ["zur späteren Überprüfung"])))
    checks.append(("GGO_43_44_FULL_SCOPE_ACKNOWLEDGED", lambda: require("methodik/datenbasis.html", ["Ziel/Notwendigkeit", "Alternativen", "beabsichtigte Wirkungen", "unbeabsichtigte Nebenwirkungen", "späteren Überprüfung"])))
    checks.append(("PUBLIC_GFA_NOT_MISLABELED_AS_PUBLIC_ENAP_EXPORT", lambda: require("methodik/datenbasis.html", ["Öffentliche GFA-Dokumentation ist nicht automatisch ein veröffentlichter eNAP-Rohexport"])))
    checks.append(("STATE_ARCHITECTURE_NOT_APPLIED_OUTSIDE_SCOPE", state_architecture_scope_guard))
    checks.append(("BENCHMARK_CORPUS_SINGLE_SOURCE_OF_TRUTH_5_CASES", benchmark_single_source_of_truth))
    checks.append(("AUDIT_MATRIX_CONTRACT_PASS", audit_matrix_contract))
    checks.append(("NO_PUBLIC_RAW_STATUS_ENUMS", no_raw_public_enums))
    checks.append(("NWI_ACRONYM_DISAMBIGUATED", nwi_acronym_disambiguated))
    checks.append(("WOEK_SCOPE_MATERIALITY_NOT_LEGAL_FORM", materiality_scope_precision))
    checks.append(("NON_LEGISLATIVE_GOVERNMENT_ACTIONS_SUPPORTED", materiality_scope_precision))
    checks.append(("STATE_ASSESSMENT_FRAMEWORK_OBJECT_SPECIFIC", materiality_scope_precision))
    checks.append(("NO_ENAP_REQUIREMENT_INVENTED_OUTSIDE_SCOPE", materiality_scope_precision))
    checks.append(("PUBLIC_OWNERSHIP_ACTION_SEPARATE_FROM_GOVERNMENT_ATTRIBUTION", materiality_scope_precision))
    checks.append(("GOVERNANCE_COVERAGE_GAP_PRECISE_NOT_ABSOLUTE", materiality_scope_precision))
    checks.append(("NO_FALSE_NONLEGISLATIVE_ASSESSMENT_ABSENCE_CLAIM", materiality_scope_precision))
    checks.append(("BHO_VVBHO_FRAMEWORK_ACKNOWLEDGED_FOR_FINANCIALLY_EFFECTIVE_MEASURES", materiality_scope_precision))
    checks.append(("APPLICABLE_STATE_ASSESSMENT_IDENTIFIED_BY_OBJECT_TYPE", materiality_scope_precision))
    checks.append(("WOEK_SCOPE_MATERIALITY_NOT_STATE_PROCEDURE_ABSENCE", materiality_scope_precision))

    passed = []
    for name, fn in checks:
        fn()
        passed.append(name)
        print(f"PASS {name}")
    print(f"#253 semantic/audit gates PASS: {len(passed)}/{len(checks)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
