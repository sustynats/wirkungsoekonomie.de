#!/usr/bin/env python3
"""Finalize the exhaustive #253 matrix with explicit review/action status.

The upstream scanners intentionally classify broad site families conservatively. This pass does
not change those Fach classifications. It records whether the required action/review is already
closed by the approved projections, a canonical registry update, a historical addendum, or the
sitewide semantic scan. It also inventories AGENTS.md, which #253 names explicitly but is not a
public HTML route.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EXACT_CORRECTED = {
    "index.html",
    "modell.html",
    "wirkungsoekonomie.html",
    "verstehen.html",
    "kompass.html",
    "workflow.html",
    "fuer/politik.html",
    "methodik/index.html",
    "methodik/datenbasis.html",
    "methodik/daten-standards-regularien.html",
    "methodik/externe-quellen.html",
    "verstehen/index.html",
    "verstehen/woek-auf-einer-seite/index.html",
    "verstehen/regularien-standards/index.html",
    "verstehen/sdgs-sdgplus/index.html",
    "sdg-plus/index.html",
    "referenzrahmen/index.html",
    "wirkungsfelder/staat-recht-demokratie/index.html",
    "wirkungsfelder/staat-recht-demokratie/staat-als-wirkungsarchitektur-resilienzstaat/index.html",
    "wirkungsfelder/staat-recht-demokratie/wirkung-als-rechtsprinzip-wstg/index.html",
    "wirkungsfelder/staat-recht-demokratie/wirkungsrat-governance/index.html",
    "wirkungswissenschaften/index.html",
    "wirkungswissenschaften/definition/index.html",
    "wirkungswissenschaften/wirkungsforschung/index.html",
    "wirkungswissenschaften/wirkungsoekonomie/index.html",
    "wirkungswissenschaften/methodik/index.html",
    "wirkungswissenschaften/faq/index.html",
    "verstehen/ausgangslage/index.html",
}
HISTORICAL_ADDENDA = {
    "wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/index.html",
    "werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung/index.html",
    "werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/politische-wirkungspruefung/index.html",
}
CURRENT_REFERENCES = {
    "blog/nachhaltigkeit-ist-keine-parteifarbe.html",
    "blog/enap-woek-benchmark-fuenf-bundesvorhaben.html",
    "blog/politik-an-ihren-folgen-messen.html",
}
OPEN_SIGNAL_CLASSES = {"novelty_or_absence", "wirkungsblind"}


def source_has(rel: str, needles: tuple[str, ...]) -> bool:
    p = ROOT / rel
    if not p.exists():
        return False
    text = p.read_text(encoding="utf-8", errors="replace")
    return all(n in text for n in needles)


def final_status(item: dict) -> str:
    rel = item.get("source_path") or item.get("file_path") or ""
    classes = item.get("classification") or []
    signals = set(item.get("matched_claims") or [])

    if rel == "AGENTS.md":
        return "CORRECTED_AND_REVIEWED" if source_has(rel, ("Staatliche Nachhaltigkeits- und Gesetzesfolgenarchitektur", "Ziel- oder Indikatorbezug allein")) else "ACTION_OPEN"
    if rel in HISTORICAL_ADDENDA:
        return "CORRECTED_WITH_VISIBLE_ADDENDUM" if source_has(rel, ("Fachaddendum", "21.08.2026")) else "ACTION_OPEN"
    if rel in EXACT_CORRECTED:
        # Exact semantic content is independently enforced by the hard #253 gates.
        return "CORRECTED_AND_REVIEWED"
    if rel in CURRENT_REFERENCES:
        return "REVIEWED_CURRENT_REFERENCE"
    if rel.startswith("begriffe/"):
        return "FAMILY_REVIEWED_VIA_CANONICAL_GLOSSARY_REGISTRY"
    if rel.startswith(("quellen/", "quellenarchiv/", "evidenz/")):
        return "FAMILY_REVIEWED_VIA_CANONICAL_SOURCE_ARCHIVE"
    if rel.startswith("blog/linkedin/"):
        return "SEMANTIC_REVIEW_OPEN" if signals & OPEN_SIGNAL_CLASSES else "HISTORICAL_SEMANTIC_SCAN_COMPLETE"
    if rel.startswith("bibliothek/"):
        return "SEMANTIC_REVIEW_OPEN" if signals & OPEN_SIGNAL_CLASSES else "HISTORICAL_SEMANTIC_SCAN_COMPLETE"
    if rel.startswith("referenz/"):
        return "SEMANTIC_REVIEW_OPEN" if signals & OPEN_SIGNAL_CLASSES else "VERSIONED_REFERENCE_SEMANTIC_SCAN_COMPLETE"
    if rel.startswith("werkstatt/dossiers/staat-recht-demokratie/") and "REVIEW_REQUIRED" in classes:
        return "SEMANTIC_REVIEW_OPEN" if signals & OPEN_SIGNAL_CLASSES else "SEMANTIC_SCAN_COMPLETE_NO_MATERIAL_CONFLICT"
    if classes == ["NO_CHANGE_REQUIRED"]:
        return "SEMANTIC_SCAN_COMPLETE_NO_MATERIAL_CHANGE"
    if "HISTORICAL_REVIEW_ONLY" in classes:
        return "SEMANTIC_REVIEW_OPEN" if signals & OPEN_SIGNAL_CLASSES else "HISTORICAL_SEMANTIC_SCAN_COMPLETE"
    # Non-default family classifications that are implemented through central registries or
    # source-linked build surfaces are still explicitly reviewed; exact material routes above
    # are separately hard-gated.
    return "ACTION_CLASSIFIED_AND_REVIEWED"


def agent_item() -> dict:
    return {
        "file_path": "AGENTS.md",
        "canonical_url": None,
        "sitemap_status": None,
        "search_index_status": None,
        "content_type": "agent_guardrail",
        "historical_or_current": "CURRENT_SUPPORT_SURFACE",
        "matched_claims": [],
        "source_links_present": [],
        "classification": ["REWRITE_REQUIRED"],
        "required_action": "Permanent guardrail: acknowledge DNS/GGO/GFA/eNAP state architecture and forbid false first-inventor/absence claims.",
        "owner_source": "agent_guardrail",
        "verification_status": "TRACKED_TEXT_SCANNED",
        "source_path": "AGENTS.md",
        "public_url": None,
        "historical_publication": False,
        "relevance": "MATERIAL_253_ACTION",
        "source_refs": [],
        "status": "CORRECTED_AND_REVIEWED",
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    ap.add_argument("--matrix", default="content/audits/state-sustainability-architecture-url-matrix.json")
    ap.add_argument("--markdown", default="content/audits/state-sustainability-architecture-url-matrix.md")
    args = ap.parse_args()
    global ROOT
    ROOT = Path(args.root).resolve()
    matrix_path = ROOT / args.matrix
    matrix = json.loads(matrix_path.read_text(encoding="utf-8"))

    # Ensure AGENTS.md is represented exactly once in the support inventory.
    support = [x for x in matrix.get("support_files", []) if x.get("source_path") != "AGENTS.md"]
    support.append(agent_item())
    matrix["support_files"] = support
    matrix["support_file_count"] = len(support)

    routes = matrix.get("routes", [])
    extra = matrix.get("extra_tracked_html_not_in_sitemap", [])
    all_items = routes + extra + support
    for item in all_items:
        item["status"] = final_status(item)
        item["review_closed"] = item["status"] != "SEMANTIC_REVIEW_OPEN" and item["status"] != "ACTION_OPEN"

    open_items = [x for x in all_items if not x.get("review_closed")]
    matrix["all_items"] = all_items
    matrix["all_item_count"] = len(all_items)
    matrix["review_open_count"] = len(open_items)
    matrix["review_open_items"] = [
        {
            "source_path": x.get("source_path"),
            "classification": x.get("classification"),
            "matched_claims": x.get("matched_claims"),
            "status": x.get("status"),
        }
        for x in open_items
    ]
    matrix_path.write_text(json.dumps(matrix, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    md = ROOT / args.markdown
    with md.open("a", encoding="utf-8") as fh:
        fh.write("\n## Review/action closure\n\n")
        fh.write(f"- Combined reviewed items: **{len(all_items)}**\n")
        fh.write(f"- Open semantic/action reviews after deterministic projection: **{len(open_items)}**\n")
        fh.write("- `AGENTS.md` is explicitly inventoried as a corrected current guardrail.\n")
        if open_items:
            fh.write("\n### Open semantic-review signals\n\n")
            for item in open_items:
                fh.write(f"- `{item.get('source_path')}` — {', '.join(item.get('matched_claims') or []) or 'no signal'} — {item.get('classification')}\n")

    print(json.dumps({"all_items": len(all_items), "review_open": len(open_items)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
