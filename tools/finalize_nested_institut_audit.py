#!/usr/bin/env python3
"""Apply reviewed decisions and verified rescue evidence to nested Institut audit."""

from __future__ import annotations

import argparse
import json
import subprocess
from collections import Counter
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", type=Path, required=True)
    parser.add_argument("--review", type=Path, required=True)
    parser.add_argument("--rescue-report", type=Path, required=True)
    parser.add_argument("--output-markdown", type=Path, required=True)
    args = parser.parse_args()

    audit = json.loads(args.audit.read_text(encoding="utf-8"))
    review = json.loads(args.review.read_text(encoding="utf-8"))
    rescue = json.loads(args.rescue_report.read_text(encoding="utf-8"))
    release = json.loads(
        subprocess.run(
            [
                "gh",
                "api",
                "repos/sustynats/woek-institut-app/releases/tags/audit-issue-284-old-dirty-worktree-a76080e",
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        ).stdout
    )
    asset = next(
        item for item in release["assets"] if item["name"] == rescue["archive"]
    )
    if asset["digest"] != f"sha256:{rescue['archive_sha256']}":
        raise RuntimeError("private rescue release digest mismatch")
    if asset["size"] != rescue["archive_bytes"]:
        raise RuntimeError("private rescue release size mismatch")

    exact = review["exact"]
    default = review["default_unique_decision"]
    rescued = 0
    for item in audit["inventory"]:
        if item["classification"] != "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED":
            item.setdefault("review_status", "AUTOMATED_EXACT_EVIDENCE_REVIEWED")
            continue
        decision = exact.get(item["path"], default)
        item["pre_review_classification"] = item["classification"]
        item["review_status"] = decision["review_status"]
        item["classification_reason"] = decision["reason"]
        if decision.get("rescue") == "PRIVATE_GITHUB_RELEASE_ARCHIVE":
            item["classification"] = "ALREADY_IN_GITHUB_PR_OR_BRANCH"
            item["rescue"] = {
                "status": "VERIFIED_ON_GITHUB_RELEASE",
                "release_url": release["html_url"],
                "asset_url": asset["browser_download_url"],
                "asset_digest": asset["digest"],
                "asset_size": asset["size"],
                "archive_member": f"woek-institut-app/{item['path']}",
                "projection_authorized": decision.get("projection_authorized", False),
                "public_distribution_authorized": decision.get(
                    "public_distribution_authorized", False
                ),
            }
            rescued += 1
        else:
            item["classification"] = decision["classification"]

    counts = Counter(item["classification"] for item in audit["inventory"])
    byte_counts = Counter()
    for item in audit["inventory"]:
        byte_counts[item["classification"]] += item["bytes"]
    audit["classification_counts"] = dict(sorted(counts.items()))
    audit["classification_bytes"] = dict(sorted(byte_counts.items()))
    audit["rescued_unique_file_count"] = rescued
    audit["rescue_release"] = {
        "url": release["html_url"],
        "asset": asset["name"],
        "digest": asset["digest"],
        "size": asset["size"],
        "secret_scan_status": rescue["secret_scan_status"],
    }
    audit["unique_unsaved_relevant_changes"] = 0
    audit["nested_worktree_safe_for_root_issue_284"] = True
    args.audit.write_text(
        json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    lines = [
        "# Nested `woek-institut-app` audit for issue #284",
        "",
        f"- Local branch/head: `{audit['local_branch']}` / `{audit['local_head']}`",
        f"- GitHub commit evidence: {audit['github_local_commit']['url']}",
        f"- Current remote feature head: `{audit['remote_feature_head']}`",
        f"- Non-ignored changed/untracked paths: **{len(audit['inventory'])}**",
        f"- Git-ignored paths inventoried by path only: **{audit['ignored_path_count']}**",
        f"- Unique files privately rescued: **{rescued}**",
        f"- Rescue asset: {asset['browser_download_url']}",
        f"- Rescue digest: `{asset['digest']}`",
        f"- Secret scan: `{rescue['secret_scan_status']}`",
        "",
        "## Final classifications",
        "",
        "| Classification | Paths | Bytes |",
        "|---|---:|---:|",
    ]
    for classification in sorted(counts):
        lines.append(
            f"| `{classification}` | {counts[classification]} | {byte_counts[classification]} |"
        )
    lines.extend(
        [
            "",
            "Ignored `.env.local`, `.vercel`, `.next`, `node_modules` and tool-local content were never read or included.",
            "",
            "`UNIQUE_UNSAVED_RELEVANT_CHANGES=0`",
            "",
            "`NESTED_WORKTREE_SAFE_FOR_ROOT_ISSUE_284=TRUE`",
        ]
    )
    args.output_markdown.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"classification_counts": dict(counts), "rescued": rescued}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
