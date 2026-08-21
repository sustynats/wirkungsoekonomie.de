#!/usr/bin/env python3
"""Fast exhaustive #253 URL/file audit using the Git index instead of filesystem rglob.

The source-of-truth route audit is still sitemap.xml. The Git index is used only to find
additional tracked HTML that is not in the sitemap, which avoids traversing build/cache trees.
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path
from urllib.parse import urlparse

from audit_state_sustainability_architecture import (
    SITE,
    EXCLUDED_SOURCE_PREFIXES,
    OFFICIAL_DOMAINS,
    canonical_from_html,
    classify,
    content_type,
    historical_status,
    load_search_haystack,
    load_sitemap,
    scan_claims,
    url_to_relpath,
)


def tracked_html(root: Path) -> list[str]:
    proc = subprocess.run(
        ["git", "ls-files", "*.html"],
        cwd=root,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
    )
    out = []
    for line in proc.stdout.splitlines():
        rel = line.strip()
        if not rel or rel.startswith(EXCLUDED_SOURCE_PREFIXES):
            continue
        out.append(rel)
    return out


def make_row(root: Path, url: str, search_haystack: str) -> tuple[dict, dict | None]:
    rel = url_to_relpath(url)
    src = root / rel
    text = src.read_text(encoding="utf-8", errors="replace") if src.exists() else ""
    missing = None if src.exists() else {"url": url, "expected_file": rel}
    classes, action = classify(rel, text)
    return ({
        "file_path": rel,
        "canonical_url": canonical_from_html(text) if text else url,
        "sitemap_url": url,
        "sitemap_status": True,
        "search_index_status": (url in search_haystack or urlparse(url).path in search_haystack) if search_haystack else None,
        "content_type": content_type(rel),
        "historical_or_current": historical_status(rel),
        "matched_claims": scan_claims(text) if text else [],
        "source_links_present": sorted({d for d in OFFICIAL_DOMAINS if d in text}),
        "classification": classes,
        "required_action": action,
        "owner_source": "source_html" if src.exists() else "unresolved_or_generated",
        "verification_status": "SOURCE_SCANNED" if src.exists() else "SOURCE_NOT_RESOLVED",
    }, missing)


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
    missing_sources = []
    for url in urls:
        row, missing = make_row(root, url, search_haystack)
        rows.append(row)
        if missing:
            missing_sources.append(missing)

    sitemap_files = {r["file_path"] for r in rows}
    extra = []
    for rel in tracked_html(root):
        if rel in sitemap_files:
            continue
        src = root / rel
        text = src.read_text(encoding="utf-8", errors="replace")
        classes, action = classify(rel, text)
        extra.append({
            "file_path": rel,
            "canonical_url": canonical_from_html(text),
            "sitemap_status": False,
            "search_index_status": (rel in search_haystack) if search_haystack else None,
            "content_type": content_type(rel),
            "historical_or_current": historical_status(rel),
            "matched_claims": scan_claims(text),
            "source_links_present": sorted({d for d in OFFICIAL_DOMAINS if d in text}),
            "classification": classes,
            "required_action": action,
            "owner_source": "source_html",
            "verification_status": "TRACKED_HTML_NOT_IN_SITEMAP_REVIEW_VISIBILITY",
        })

    matrix = {
        "audit": "WOEK_STATE_SUSTAINABILITY_ARCHITECTURE_SITEWIDE",
        "issue": 253,
        "schema_version": "1.1",
        "site": SITE,
        "method": "sitemap enumeration + tracked source HTML semantic scan + approved #253 family rules",
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
        "missing_source_count": len(missing_sources),
        "extra_tracked_html_not_in_sitemap_count": len(extra),
        "missing_sources": missing_sources,
        "routes": rows,
        "extra_tracked_html_not_in_sitemap": extra,
    }

    out = root / args.output
    md = root / args.markdown
    out.parent.mkdir(parents=True, exist_ok=True)
    md.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(matrix, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    explicit = [r for r in rows if r["classification"] != ["NO_CHANGE_REQUIRED"]]
    risk = [r for r in rows if "novelty_or_absence" in r["matched_claims"] or "wirkungsblind" in r["matched_claims"]]
    lines = [
        "# #253 State sustainability architecture URL/file audit",
        "",
        f"- Sitemap routes: **{len(rows)}**",
        f"- Sitemap routes without directly resolved source HTML: **{len(missing_sources)}**",
        f"- Extra tracked source HTML not in sitemap: **{len(extra)}**",
        f"- Routes with non-default #253 action: **{len(explicit)}**",
        f"- Routes with Wirkungsblindheit/novelty/absence claim signals: **{len(risk)}**",
        "",
        "## Routes requiring explicit #253 action",
        "",
        "| Route | File | Classification | Signals |",
        "|---|---|---|---|",
    ]
    for r in explicit:
        lines.append(f"| {r['sitemap_url']} | `{r['file_path']}` | {', '.join(r['classification'])} | {', '.join(r['matched_claims']) or '—'} |")
    lines += ["", "## Claim-signal review", "", "Signals are review candidates, not automatic errors.", ""]
    for r in risk:
        lines.append(f"- `{r['file_path']}` — {', '.join(r['matched_claims'])} — {r['required_action']}")
    if missing_sources:
        lines += ["", "## Sitemap routes with unresolved source mapping", ""]
        for item in missing_sources:
            lines.append(f"- {item['url']} → `{item['expected_file']}`")
    md.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(json.dumps({
        "sitemap_routes": len(rows),
        "missing_sources": len(missing_sources),
        "extra_tracked_html_not_in_sitemap": len(extra),
        "explicit_actions": len(explicit),
        "claim_signal_routes": len(risk),
        "json": str(out.relative_to(root)),
        "markdown": str(md.relative_to(root)),
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
