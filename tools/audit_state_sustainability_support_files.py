#!/usr/bin/env python3
"""Extend the #253 URL/file matrix to the non-HTML publication and generator surfaces.

The HTML route audit is produced by audit_state_sustainability_architecture_fast.py.
This second pass makes the matrix recursive across the support surfaces explicitly required
by #253: llms.txt, sitemap, search metadata, structured-data/content registries, glossary,
source archive, library/journal/reference inputs and the generators/workflows that publish them.
It inventories tracked text files only; binaries are represented by their text manifests rather
than parsed as content.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from pathlib import Path

from audit_state_sustainability_architecture import (
    OFFICIAL_DOMAINS,
    scan_claims,
)

SITE = "https://wirkungsoekonomie.de"
ALLOWED_CLASSIFICATIONS = {
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
}
TEXT_SUFFIXES = {
    ".txt", ".md", ".json", ".xml", ".js", ".mjs", ".cjs", ".ts", ".tsx",
    ".py", ".yml", ".yaml", ".toml", ".csv", ".html", ".css",
}
SKIP_PREFIXES = (
    ".git/", "node_modules/", "_site/", "_debug/", "_internal/", "admin/",
    "woek-parlament-app/", "assets/pdf/", "assets/img/", "assets/fonts/",
)
ALWAYS_INCLUDE = {
    "llms.txt",
    "sitemap.xml",
    "package.json",
    ".github/workflows/deploy.yml",
    "assets/search/search-index.json",
    "public/data/woek-search-meta.json",
    "assets/data/blog-index.json",
    "assets/data/journal-pdf-manifest.json",
    "content/quellenarchiv/legal-source-records.json",
    "content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json",
}
RELEVANT_PREFIXES = (
    "content/", "scripts/", "tools/", ".github/workflows/", "assets/data/", "assets/search/",
    "public/data/", "referenz/", "bibliothek/", "werkstatt/", "methodik/", "verstehen/",
    "wirkungsfelder/", "wirkungswissenschaften/", "fuer/", "blog/", "begriffe/", "quellen/",
    "quellenarchiv/", "evidenz/", "sdg-plus/", "referenzrahmen/",
)
SEMANTIC = re.compile(
    r"wirkungsblind|gesetzesfolgenabsch|wirkungsfolgenabsch|nachhaltigkeitspr[uü]fung|\benap\b|\begfa\b|"
    r"deutsche nachhaltigkeitsstrategie|\bDNS\b|reality check|evaluation|alternativ|l[oö]sungsm[oö]glichkeit",
    re.I,
)


def git_files(root: Path) -> list[str]:
    proc = subprocess.run(["git", "ls-files"], cwd=root, check=True, text=True, stdout=subprocess.PIPE)
    return [p.strip() for p in proc.stdout.splitlines() if p.strip()]


def public_url(rel: str) -> str | None:
    if rel in {"llms.txt", "sitemap.xml"}:
        return f"{SITE}/{rel}"
    if rel.startswith(("assets/", "public/")):
        if rel.startswith("public/"):
            rel = rel[len("public/"):]
        return f"{SITE}/{rel}"
    return None


def role(rel: str) -> str:
    if rel == ".github/workflows/deploy.yml": return "github_pages_deployment_workflow"
    if rel == "llms.txt": return "machine_readable_reference"
    if rel == "sitemap.xml": return "sitemap"
    if rel.startswith("assets/search/") or "search" in rel and rel.startswith("scripts/"): return "search_index_or_generator"
    if rel.startswith("content/glossary/") or rel.startswith("scripts/glossary/"): return "glossary_source_or_generator"
    if rel.startswith("content/quellenarchiv/") or rel.startswith("scripts/quellenarchiv/"): return "source_archive_source_or_generator"
    if rel.startswith("referenz/") or "referenz" in rel and rel.startswith("scripts/"): return "online_reference_source_or_generator"
    if rel.startswith("blog/") or "journal" in rel: return "journal_source_or_manifest"
    if rel.startswith("bibliothek/"): return "library_source"
    if rel.startswith("tools/"): return "quality_or_projection_tool"
    if rel.startswith("scripts/"): return "site_generator_or_quality_tool"
    if rel.startswith("public/data/") or rel.startswith("assets/data/"): return "structured_data_or_manifest"
    return "support_text"


def classify_support(rel: str, text: str, signals: list[str]) -> tuple[list[str], str]:
    classes: list[str] = []
    if rel == "llms.txt":
        classes = ["ADD_STATE_SUSTAINABILITY_ARCHITECTURE", "ADD_SOURCE_LINKS"]
    elif rel == "content/quellenarchiv/legal-source-records.json":
        classes = ["ADD_DNS_REFERENCE", "ADD_GGO_GFA_REFERENCE", "ADD_ENAP_REFERENCE", "ADD_SOURCE_LINKS"]
    elif rel.startswith("content/glossary/"):
        classes = ["ADD_GLOSSARY_CROSSLINKS", "ADD_SOURCE_LINKS"]
    elif rel in {"assets/search/search-index.json", "public/data/woek-search-meta.json", "sitemap.xml"}:
        classes = ["NO_CHANGE_REQUIRED"]
    elif rel == ".github/workflows/deploy.yml":
        classes = ["NO_CHANGE_REQUIRED"]
    elif rel.startswith("scripts/") or rel.startswith("tools/") or rel.startswith(".github/workflows/"):
        classes = ["NO_CHANGE_REQUIRED"]
    elif rel.startswith(("assets/data/", "public/data/")):
        classes = ["NO_CHANGE_REQUIRED"]
    elif signals and "novelty_or_absence" in signals:
        classes = ["CORRECT_OVERCLAIM"]
    elif signals and any(s in signals for s in ("dns", "enap", "egfa", "folgenabschaetzung", "nachhaltigkeitspruefung")):
        classes = ["ADD_SOURCE_LINKS"]
    else:
        classes = ["NO_CHANGE_REQUIRED"]
    classes = [c for c in classes if c in ALLOWED_CLASSIFICATIONS]
    if not classes:
        classes = ["NO_CHANGE_REQUIRED"]
    action = {
        "llms.txt": "Synchronise machine-readable model context with the acknowledged federal architecture and primary sources.",
        "content/quellenarchiv/legal-source-records.json": "Keep canonical official DNS/GGO/GFA/eNAP/Destatis sources with source-function and version metadata.",
    }.get(rel, "No separate mutation required unless the semantic scan or owning current page identifies a material #253 conflict.")
    return classes, action


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    ap.add_argument("--matrix", default="artifacts/state-sustainability-architecture-url-matrix.json")
    ap.add_argument("--markdown", default="artifacts/state-sustainability-architecture-url-matrix.md")
    args = ap.parse_args()
    root = Path(args.root).resolve()
    matrix_path = root / args.matrix
    matrix = json.loads(matrix_path.read_text(encoding="utf-8"))

    html_paths = {r.get("file_path") for r in matrix.get("routes", [])}
    html_paths |= {r.get("file_path") for r in matrix.get("extra_tracked_html_not_in_sitemap", [])}
    support = []
    for rel in git_files(root):
        if rel in html_paths or rel.startswith(SKIP_PREFIXES):
            continue
        p = root / rel
        if p.suffix.lower() not in TEXT_SUFFIXES and rel not in ALWAYS_INCLUDE:
            continue
        include = rel in ALWAYS_INCLUDE or rel.startswith(RELEVANT_PREFIXES)
        if not include:
            continue
        size = p.stat().st_size if p.exists() else 0
        scan_text = ""
        verification = "TRACKED_TEXT_SCANNED"
        if p.exists() and size <= 5_000_000:
            scan_text = p.read_text(encoding="utf-8", errors="replace")
        elif p.exists():
            verification = "TRACKED_TEXT_INVENTORIED_SIZE_LIMIT"
        signals = scan_claims(scan_text) if scan_text else []
        classes, action = classify_support(rel, scan_text, signals)
        support.append({
            "file_path": rel,
            "canonical_url": public_url(rel),
            "sitemap_status": None,
            "search_index_status": None,
            "content_type": role(rel),
            "historical_or_current": "CURRENT_SUPPORT_SURFACE",
            "matched_claims": signals,
            "source_links_present": sorted({d for d in OFFICIAL_DOMAINS if d in scan_text}),
            "classification": classes,
            "required_action": action,
            "owner_source": role(rel),
            "verification_status": verification,
            "bytes": size,
        })

    matrix["schema_version"] = "2.0"
    matrix["support_file_count"] = len(support)
    matrix["support_files"] = support
    all_items = list(matrix.get("routes", [])) + list(matrix.get("extra_tracked_html_not_in_sitemap", [])) + support
    matrix["all_item_count"] = len(all_items)
    matrix["classification_vocabulary"] = sorted(ALLOWED_CLASSIFICATIONS)
    matrix["all_items"] = all_items
    matrix_path.write_text(json.dumps(matrix, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    md_path = root / args.markdown
    with md_path.open("a", encoding="utf-8") as fh:
        fh.write("\n## Recursive non-HTML publication/support surfaces\n\n")
        fh.write(f"- Tracked support text files inventoried: **{len(support)}**\n")
        fh.write(f"- Combined matrix items (routes + extra HTML + support): **{len(all_items)}**\n")
        fh.write("- Includes llms.txt, sitemap/search metadata, structured-data registries, glossary/source archive, library/journal/reference inputs and generators/workflows.\n\n")
        fh.write("| File | Role | Classification | Signals |\n|---|---|---|---|\n")
        for row in support:
            if row["classification"] != ["NO_CHANGE_REQUIRED"] or row["matched_claims"] or row["file_path"] in ALWAYS_INCLUDE:
                fh.write(f"| `{row['file_path']}` | {row['content_type']} | {', '.join(row['classification'])} | {', '.join(row['matched_claims']) or '—'} |\n")

    print(json.dumps({"support_files": len(support), "all_items": len(all_items)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
