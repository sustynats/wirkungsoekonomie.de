#!/usr/bin/env python3
"""Generate the #253 sitewide DNS/GGO/GFA/eNAP audit matrix.

The audit is intentionally source-first and deterministic. It enumerates every route in
sitemap.xml, resolves it to a source HTML file where possible, records search-index and
source-reference coverage, scans for claims that need human/fach review, and applies the
approved #253 path-family classifications.

It does not synthesize WÖk judgements and it does not rewrite historical publications.
"""
from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

SITE = "https://wirkungsoekonomie.de"
EXCLUDED_SOURCE_PREFIXES = (
    "_site/",
    "node_modules/",
    ".git/",
    "_debug/",
    "_internal/",
    "admin/",
    "woek-parlament-app/",
)

CLASSIFICATIONS = {
    "NO_CHANGE_REQUIRED",
    "ADD_STATE_SUSTAINABILITY_ARCHITECTURE",
    "CORRECT_OVERCLAIM",
    "ADD_DNS_REFERENCE",
    "ADD_GGO_GFA_REFERENCE",
    "ADD_ENAP_REFERENCE",
    "ADD_BENCHMARK_COMPARISON",
    "ADD_SOURCE_LINKS",
    "ADD_GLOSSARY_CROSSLINKS",
    "ADD_PORTAL_CROSSLINK",
    "REWRITE_REQUIRED",
    "ADDENDUM_REQUIRED",
    "REWRITE_OR_ADDENDUM_REQUIRED",
    "REVIEW_REQUIRED",
    "HISTORICAL_REVIEW_ONLY",
    "BENCHMARK_REFERENCE",
    "CURRENT_REFERENCE",
}

OFFICIAL_DOMAINS = (
    "bundesregierung.de",
    "bmj.de",
    "bmjv.de",
    "verwaltungsvorschriften-im-internet.de",
    "plattform.egesetzgebung.bund.de",
    "destatis.de",
    "bundestag.de",
    "dserver.bundestag.de",
    "gesetze-im-internet.de",
)

CLAIM_PATTERNS = {
    "wirkungsblind": re.compile(r"wirkungsblind", re.I),
    "folgenabschaetzung": re.compile(r"folgenabsch[aä]tzung|wirkungsfolgenabsch[aä]tzung", re.I),
    "nachhaltigkeitspruefung": re.compile(r"nachhaltigkeitspr[uü]fung", re.I),
    "enap": re.compile(r"\benap\b", re.I),
    "egfa": re.compile(r"\begfa\b", re.I),
    "dns": re.compile(r"deutsche nachhaltigkeitsstrategie|\bDNS\b", re.I),
    "alternativen": re.compile(r"alternativ(?:e|en)|l[oö]sungsm[oö]glichkeit", re.I),
    "evaluation": re.compile(r"evaluation|ex[- ]?post|reality check", re.I),
    "novelty_or_absence": re.compile(
        r"erstmals|gibt es nicht|existiert nicht|pr[uü]ft nicht|misst nicht|keine\s+(?:gesetzes)?folgenabsch[aä]tzung|keine\s+alternativen",
        re.I,
    ),
}


def strip_html(text: str) -> str:
    text = re.sub(r"<script\b[^>]*>.*?</script>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<style\b[^>]*>.*?</style>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def load_sitemap(root: Path) -> list[str]:
    sitemap = root / "sitemap.xml"
    tree = ET.parse(sitemap)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    for loc in tree.findall("sm:url/sm:loc", ns):
        if loc.text and loc.text.startswith(SITE):
            urls.append(loc.text.strip())
    return urls


def url_to_relpath(url: str) -> str:
    path = urlparse(url).path
    if path == "/":
        return "index.html"
    rel = path.lstrip("/")
    if rel.endswith("/"):
        return rel + "index.html"
    return rel


def canonical_from_html(text: str) -> str | None:
    m = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', text, re.I)
    if not m:
        m = re.search(r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']', text, re.I)
    return m.group(1).strip() if m else None


def content_type(path: str) -> str:
    if path.startswith("blog/"):
        return "journal_or_blog"
    if path.startswith("begriffe/"):
        return "glossary"
    if path.startswith(("quellen/", "quellenarchiv/", "evidenz/")):
        return "source_or_evidence"
    if path.startswith("bibliothek/"):
        return "library"
    if path.startswith("referenz/"):
        return "online_reference"
    if path.startswith("wirkungswissenschaften/"):
        return "impact_sciences"
    if path.startswith("wirkungsfelder/"):
        return "impact_field"
    if path.startswith("methodik/"):
        return "methodology"
    if path.startswith("verstehen/"):
        return "foundations"
    if path.startswith("fuer/"):
        return "audience"
    return "site_page"


def historical_status(path: str) -> str:
    if path.startswith("blog/linkedin/"):
        return "HISTORICAL_PUBLICATION"
    if path.startswith("bibliothek/") and ("working" in path or "dossier" in path):
        return "PUBLISHED_ARTIFACT_REVIEW_FIRST"
    return "CURRENT_OR_LIVING_PAGE"


def classify(path: str, text: str) -> tuple[list[str], str]:
    p = path
    classes: list[str] = []
    action = "No material #253 change identified by path rule; semantic scan still applies."

    if p == "index.html":
        classes = ["CORRECT_OVERCLAIM", "ADD_STATE_SUSTAINABILITY_ARCHITECTURE", "ADD_SOURCE_LINKS"]
        action = "Qualify Wirkungsblindheit; add 'Deutschland hat bereits / WÖk ergänzt' architecture block and primary-source links."
    elif p == "modell.html":
        classes = ["CORRECT_OVERCLAIM", "ADD_DNS_REFERENCE", "ADD_GGO_GFA_REFERENCE"]
        action = "Add German DNS operationalisation and existing GGO/GFA/eNAP architecture; define Wirkungsblindheit as incomplete causal/decision feedback."
    elif p == "methodik/index.html":
        classes = ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE"]
        action = "Add state target/assessment architecture card; position WÖk as connection/extension architecture."
    elif p == "methodik/datenbasis.html":
        classes = ["ADD_DNS_REFERENCE", "ADD_GGO_GFA_REFERENCE", "ADD_ENAP_REFERENCE", "ADD_SOURCE_LINKS"]
        action = "Add DNS 2025, Destatis DNS indicators, GGO §§43/44, GFA/sustainability assessment and eNAP/eGFA with explicit data/source functions."
    elif p == "methodik/daten-standards-regularien.html":
        classes = ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE"]
        action = "Add national target/monitoring/assessment layer; keep global SDGs separate from German operationalisation."
    elif p == "methodik/externe-quellen.html":
        classes = ["ADD_DNS_REFERENCE", "ADD_GGO_GFA_REFERENCE", "ADD_ENAP_REFERENCE", "ADD_SOURCE_LINKS"]
        action = "Expand German public sources/authorities into explicit state architecture and name source functions."
    elif p == "workflow.html":
        classes = ["NO_CHANGE_REQUIRED", "ADD_DNS_REFERENCE"]
        action = "Keep economic data→score→steering workflow; only add DNS/GFA context in source/reference block where applicable."
    elif p.startswith("verstehen/") and ("sdg" in p or p.startswith("referenzrahmen/")):
        classes = ["ADD_DNS_REFERENCE"]
        action = "State that Germany operationalises Agenda 2030 through DNS; keep WÖk-SDG+ explicitly non-official."
    elif p.startswith("verstehen/regularien-standards"):
        classes = ["ADD_DNS_REFERENCE", "ADD_GGO_GFA_REFERENCE", "ADD_ENAP_REFERENCE"]
        action = "Add state sustainability and assessment architecture as its own governance layer."
    elif p.startswith("verstehen/ausgangslage"):
        classes = ["CORRECT_OVERCLAIM"] if re.search(r"blind|misst nicht|pr[uü]ft nicht", text, re.I) else ["NO_CHANGE_REQUIRED"]
        action = "Separate market/system diagnosis from the existence of federal GFA/DNS structures; qualify any total-blindness claim."
    elif p == "verstehen/index.html" or p.startswith("verstehen/woek-auf-einer-seite"):
        classes = ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE"]
        action = "Add a short fair Anschlussdefinition without overloading the entry page."
    elif p == "fuer/politik.html":
        classes = ["REWRITE_REQUIRED", "ADD_GGO_GFA_REFERENCE", "ADD_ENAP_REFERENCE", "ADD_DNS_REFERENCE"]
        action = "Acknowledge existing GGO/GFA/eNAP/DNS; place Problem Review before Goal Review; describe WÖk as full-chain integration and deepening."
    elif p == "fuer/kommunen.html":
        classes = ["NO_CHANGE_REQUIRED"]
        action = "Do not manufacture federal eNAP/GGO layer for municipalities; add DNS/local sustainability links only if substantively relevant."
    elif p == "wirkungsfelder/staat-recht-demokratie/index.html":
        classes = ["CORRECT_OVERCLAIM", "ADD_STATE_SUSTAINABILITY_ARCHITECTURE"]
        action = "Contextualise state-steering critique; acknowledge DNS, GGO §§43/44, GFA, eNAP and specify the remaining WÖk integration gap."
    elif p.startswith("wirkungsfelder/staat-recht-demokratie/wirkungshaushalt"):
        classes = ["ADDENDUM_REQUIRED"]
        action = "Keep historical v1.0 publication intact; add dated current-method addendum recognising GFA/sustainability assessment and §44(7)."
    elif p.startswith("wirkungsfelder/staat-recht-demokratie/staat-als-wirkungsarchitektur-resilienzstaat"):
        classes = ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE"]
        action = "Treat current federal architecture as starting system; WÖk target state as further development."
    elif p.startswith("wirkungsfelder/staat-recht-demokratie/wirkung-als-rechtsprinzip-wstg"):
        classes = ["ADD_GGO_GFA_REFERENCE"]
        action = "Acknowledge existing procedural impact logic; do not frame WStG as first legal impact logic."
    elif p.startswith("wirkungsfelder/staat-recht-demokratie/wirkungsrat-governance"):
        classes = ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE"]
        action = "Differentiate proposed WÖk Wirkungsrat from existing federal sustainability/governance/control bodies."
    elif p.startswith("werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung"):
        classes = ["REWRITE_OR_ADDENDUM_REQUIRED", "ADD_GGO_GFA_REFERENCE", "ADD_ENAP_REFERENCE"]
        action = "Do not present model as invention of impact assessment; add GGO/eNAP benchmark and current Problem/Goal/A→M→ΔZ→R method; preserve older download version."
    elif p.startswith("werkstatt/dossiers/staat-recht-demokratie/"):
        classes = ["REVIEW_REQUIRED"]
        action = "Source-first review for state/assessment claims; use addendum rather than silent historical rewrite where needed."
    elif p.startswith("wirkungswissenschaften/"):
        classes = ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE"]
        action = "Add concrete German DNS/GFA/eNAP institutional continuity; reserve novelty for WÖk integration/feedback architecture."
    elif p.startswith("begriffe/"):
        classes = ["ADD_GLOSSARY_CROSSLINKS"]
        action = "Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions."
    elif p.startswith(("quellenarchiv/", "quellen/", "evidenz/")):
        classes = ["ADD_SOURCE_LINKS"]
        action = "Add official primary sources with function/version/status; separate public GFA documentation from public eNAP-export provenance."
    elif p.startswith("bibliothek/"):
        classes = ["REVIEW_REQUIRED"]
        action = "Review published artefacts; add visible current-method note/erratum when materially required; never silently rewrite historical files."
    elif p == "blog/nachhaltigkeit-ist-keine-parteifarbe.html":
        classes = ["NO_CHANGE_REQUIRED", "CURRENT_REFERENCE"]
        action = "Preserve as current source-bound reference; crosslink from relevant current pages."
    elif p == "blog/enap-woek-benchmark-fuenf-bundesvorhaben.html":
        classes = ["BENCHMARK_REFERENCE", "ADD_BENCHMARK_COMPARISON"]
        action = "Use as canonical five-case calibration corpus; recheck GGO §§43/44 claims and keep public-GFA vs public-eNAP provenance explicit."
    elif p == "blog/politik-an-ihren-folgen-messen.html":
        classes = ["NO_CHANGE_REQUIRED", "CURRENT_REFERENCE"]
        action = "Preserve current source-bound acknowledgement of §44/GFA/eNAP/DNS/PBnEZ."
    elif p.startswith("blog/linkedin/"):
        classes = ["HISTORICAL_REVIEW_ONLY"]
        action = "Semantic scan only; visible addendum/erratum solely for material current-understanding conflicts, never silent rewrite."
    elif p.startswith("referenz/"):
        classes = ["REVIEW_REQUIRED", "ADD_DNS_REFERENCE"]
        action = "Review current reader/reference framing; use versioned note for historical text and add current DNS/GFA/eNAP crosslinks where relevant."
    elif p in {"wirkungsoekonomie.html", "verstehen.html", "kompass.html"}:
        classes = ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE"]
        action = "Add concise acknowledgement of existing state assessment/monitoring architecture where system/steering claims are made."
    else:
        classes = ["NO_CHANGE_REQUIRED"]

    if not set(classes) <= CLASSIFICATIONS:
        raise RuntimeError(f"Unknown classification for {path}: {classes}")
    return classes, action


def load_search_haystack(root: Path) -> str:
    chunks = []
    for rel in ("assets/search/search-index.json", "public/data/woek-search-meta.json"):
        p = root / rel
        if p.exists():
            chunks.append(p.read_text(encoding="utf-8", errors="replace"))
    return "\n".join(chunks)


def scan_claims(text: str) -> list[str]:
    plain = strip_html(text)
    return [name for name, pattern in CLAIM_PATTERNS.items() if pattern.search(plain)]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--output", default="artifacts/state-sustainability-architecture-url-matrix.json")
    parser.add_argument("--markdown", default="artifacts/state-sustainability-architecture-url-matrix.md")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    urls = load_sitemap(root)
    search_haystack = load_search_haystack(root)

    rows = []
    missing_source = []
    for url in urls:
        rel = url_to_relpath(url)
        src = root / rel
        text = src.read_text(encoding="utf-8", errors="replace") if src.exists() else ""
        if not src.exists():
            missing_source.append({"url": url, "expected_file": rel})
        classes, action = classify(rel, text)
        canonical = canonical_from_html(text) if text else None
        matched_claims = scan_claims(text) if text else []
        source_links_present = sorted({d for d in OFFICIAL_DOMAINS if d in text})
        row = {
            "file_path": rel,
            "canonical_url": canonical or url,
            "sitemap_url": url,
            "sitemap_status": True,
            "search_index_status": (url in search_haystack or urlparse(url).path in search_haystack) if search_haystack else None,
            "content_type": content_type(rel),
            "historical_or_current": historical_status(rel),
            "matched_claims": matched_claims,
            "source_links_present": source_links_present,
            "classification": classes,
            "required_action": action,
            "owner_source": "source_html" if src.exists() else "unresolved_or_generated",
            "verification_status": "SOURCE_SCANNED" if src.exists() else "SOURCE_NOT_RESOLVED",
        }
        rows.append(row)

    sitemap_files = {r["file_path"] for r in rows}
    extra_html = []
    for src in root.rglob("*.html"):
        rel = src.relative_to(root).as_posix()
        if rel.startswith(EXCLUDED_SOURCE_PREFIXES) or rel in sitemap_files:
            continue
        text = src.read_text(encoding="utf-8", errors="replace")
        extra_html.append({
            "file_path": rel,
            "canonical_url": canonical_from_html(text),
            "sitemap_status": False,
            "search_index_status": (rel in search_haystack) if search_haystack else None,
            "content_type": content_type(rel),
            "historical_or_current": historical_status(rel),
            "matched_claims": scan_claims(text),
            "source_links_present": sorted({d for d in OFFICIAL_DOMAINS if d in text}),
            "classification": classify(rel, text)[0],
            "required_action": classify(rel, text)[1],
            "owner_source": "source_html",
            "verification_status": "NOT_IN_SITEMAP_REVIEW_VISIBILITY",
        })

    matrix = {
        "audit": "WOEK_STATE_SUSTAINABILITY_ARCHITECTURE_SITEWIDE",
        "issue": 253,
        "schema_version": "1.0",
        "site": SITE,
        "method": "sitemap enumeration + source HTML semantic scan + explicit #253 family rules",
        "invariants": [
            "GGO_43_44_FULL_SCOPE_ACKNOWLEDGED",
            "NO_FALSE_GFA_ABSENCE_CLAIM",
            "NO_FALSE_ENAP_ABSENCE_CLAIM",
            "NO_FALSE_ABSENCE_OF_ALTERNATIVES_CLAIM",
            "NO_FALSE_ABSENCE_OF_EXPOST_REVIEW_CLAIM",
            "PUBLIC_GFA_NOT_MISLABELED_AS_PUBLIC_ENAP_EXPORT",
            "STATE_TARGET_ALIGNMENT_NOT_CAUSALITY",
            "PUBLIC_DOCUMENTATION_ABSENCE_NOT_EQUATED_WITH_NO_ASSESSMENT",
            "WOEK_USP_IS_ADDITIVE_AND_SPECIFIC",
            "HISTORICAL_PUBLICATIONS_NOT_SILENTLY_REWRITTEN",
        ],
        "sitemap_route_count": len(rows),
        "missing_source_count": len(missing_source),
        "extra_source_html_not_in_sitemap_count": len(extra_html),
        "missing_sources": missing_source,
        "routes": rows,
        "extra_source_html_not_in_sitemap": extra_html,
    }

    out = root / args.output
    md = root / args.markdown
    out.parent.mkdir(parents=True, exist_ok=True)
    md.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(matrix, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    changed = [r for r in rows if r["classification"] != ["NO_CHANGE_REQUIRED"]]
    risk = [r for r in rows if "novelty_or_absence" in r["matched_claims"] or "wirkungsblind" in r["matched_claims"]]
    lines = [
        "# #253 State sustainability architecture URL/file audit",
        "",
        f"- Sitemap routes: **{len(rows)}**",
        f"- Sitemap routes without directly resolved source HTML: **{len(missing_source)}**",
        f"- Extra source HTML not in sitemap: **{len(extra_html)}**",
        f"- Routes with non-default #253 action: **{len(changed)}**",
        f"- Routes with blind/novelty/absence claim signals: **{len(risk)}**",
        "",
        "## Routes requiring explicit #253 action",
        "",
        "| Route | File | Classification | Signals |",
        "|---|---|---|---|",
    ]
    for r in changed:
        lines.append(f"| {r['sitemap_url']} | `{r['file_path']}` | {', '.join(r['classification'])} | {', '.join(r['matched_claims']) or '—'} |")
    lines.extend(["", "## Claim-signal review", "", "These are semantic-review candidates, not automatic errors.", ""])
    for r in risk:
        lines.append(f"- `{r['file_path']}` — {', '.join(r['matched_claims'])} — {r['required_action']}")
    if missing_source:
        lines.extend(["", "## Sitemap routes with unresolved source mapping", ""])
        for item in missing_source:
            lines.append(f"- {item['url']} → `{item['expected_file']}`")
    md.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(json.dumps({
        "sitemap_routes": len(rows),
        "missing_sources": len(missing_source),
        "extra_html_not_in_sitemap": len(extra_html),
        "explicit_actions": len(changed),
        "claim_signal_routes": len(risk),
        "json": str(out.relative_to(root)),
        "markdown": str(md.relative_to(root)),
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
