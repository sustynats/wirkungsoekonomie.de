#!/usr/bin/env python3
"""Classify every commit reported as local-only by the #284 raw audit."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path


PRESERVED_FIVE = {
    "da4eeb5c561877f3cd1f3d3cc680a30680b83079",
    "229d1bf8f30e2390fdac7aede43ba84874f317f4",
    "fb9dac4451c8775081909764ccb588495aadaedf",
    "3f599dd3728fd6ab1d0673e58db08734680115ed",
    "7e38fcb248c756fa6021cfdc87b3ef1eeb58b093",
}

STASH_COMMITS = {
    "c9485d4a821cf2255acdad824b15c8bccbf0f3fe",
    "7b7eaab1fd2586f8132acfa15cca69ff5f6efd19",
    "d376f46d3201f2b6882c565d5fa0c2126531a979",
}


def supersession_evidence(subject: str) -> str:
    lowered = subject.lower()
    if "#253" in lowered or "state assessment" in lowered or "state sustainability" in lowered or "nwi" in lowered or "masteritems v1.5" in lowered:
        return "Current main contains the completed #253 state-sustainability architecture and subsequent v1.7/current release state."
    if "kooperative wirkungsordnung" in lowered:
        return "Current main contains the merged #201/#202 Kooperative Wirkungsordnung publication and integration."
    if "parlament" in lowered:
        return "Current main contains the later Parliament Golden State and current release architecture."
    if "quellenarchiv" in lowered:
        return "Current main contains the evolved Quellenarchiv source registry, website mirror and current build pipeline."
    if "journal" in lowered:
        return "Current main contains the later journal/publication pipeline and current article outputs."
    if "gloss" in lowered:
        return "Current main contains the evolved glossary source/build/publication state."
    return "Historical local-ref commit is superseded by the current main tree and completed GitHub lanes; its changed working artifacts were separately classified item by item."


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output-json", type=Path, required=True)
    parser.add_argument("--output-markdown", type=Path, required=True)
    args = parser.parse_args()

    rows = []
    for line in args.input.read_text(encoding="utf-8").splitlines():
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) < 6:
            raise RuntimeError(f"unexpected local commit row: {line}")
        commit, parents, date, author, decoration = parts[:5]
        subject = "\t".join(parts[5:])
        if commit in PRESERVED_FIVE:
            classification = "ALREADY_IN_GITHUB_PR_OR_BRANCH"
            evidence = (
                "Exact commit and its four sibling old-branch commits are preserved in the verified "
                "issue-284-live-clean-local-five.bundle GitHub Release asset."
            )
        elif commit in STASH_COMMITS or "refs/stash" in decoration:
            classification = "BUILD_CACHE_OR_TEMPORARY"
            evidence = (
                "Git stash/index/untracked snapshot from the completed #253 lane; not canonical branch history."
            )
        else:
            classification = "SUPERSEDED"
            evidence = supersession_evidence(subject)
        rows.append(
            {
                "commit": commit,
                "parents": parents.split(),
                "date": date,
                "author": author,
                "decoration": decoration.strip(),
                "subject": subject,
                "classification": classification,
                "evidence": evidence,
            }
        )

    if len(rows) != 69:
        raise RuntimeError(f"expected 69 local-only-ref rows, found {len(rows)}")
    if {row["commit"] for row in rows if row["classification"] == "ALREADY_IN_GITHUB_PR_OR_BRANCH"} != PRESERVED_FIVE:
        raise RuntimeError("five-commit rescue classification mismatch")
    counts = Counter(row["classification"] for row in rows)
    payload = {
        "issue": 284,
        "commit_count": len(rows),
        "classification_counts": dict(sorted(counts.items())),
        "rescue_release": "https://github.com/sustynats/wirkungsoekonomie.de/releases/tag/issue-284-old-dirty-worktree-rescue",
        "five_commit_bundle_sha256": "2d0dd6e6c438e4374427499e43bcaf1dd8d548d176b5984415ccb7c823cdaf8e",
        "wholesale_all_refs_bundle_uploaded": False,
        "commits": rows,
    }
    args.output_json.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    lines = [
        "# Issue #284 local-only commit classification",
        "",
        f"- Commit rows: **{len(rows)}**",
        f"- Exact old-branch commits rescued: **{counts['ALREADY_IN_GITHUB_PR_OR_BRANCH']}**",
        f"- Superseded stale/local histories: **{counts['SUPERSEDED']}**",
        f"- Stash/index/untracked snapshot commits: **{counts['BUILD_CACHE_OR_TEMPORARY']}**",
        "- Wholesale all-refs bundle uploaded: **no**",
        "",
        "| Commit | Classification | Subject |",
        "|---|---|---|",
    ]
    for row in rows:
        lines.append(
            f"| `{row['commit']}` | `{row['classification']}` | {row['subject'].replace('|', '\\|')} |"
        )
    args.output_markdown.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload["classification_counts"], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
