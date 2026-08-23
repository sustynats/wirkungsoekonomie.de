#!/usr/bin/env python3
"""Audit the nested woek-institut-app worktree without modifying it.

The old root worktree records ``woek-institut-app/`` as one untracked
directory, but that directory is itself a Git repository.  This tool expands
that single root item into a path-level inventory and compares every changed
or untracked file with all currently visible GitHub branches and pull-request
heads.  Ignored local configuration and build caches are inventoried by path
only; their content is never read.
"""

from __future__ import annotations

import argparse
import base64
import difflib
import hashlib
import json
import os
import re
import stat
import subprocess
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


GITHUB_PRESERVED = "ALREADY_IN_GITHUB_PR_OR_BRANCH"
TEMPORARY = "BUILD_CACHE_OR_TEMPORARY"
UNIQUE = "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED"


def run(
    args: list[str],
    *,
    cwd: Path,
    check: bool = True,
    text: bool = True,
    timeout: int = 120,
) -> subprocess.CompletedProcess[str] | subprocess.CompletedProcess[bytes]:
    return subprocess.run(
        args,
        cwd=cwd,
        check=check,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=text,
        timeout=timeout,
    )


def git(repo: Path, *args: str, text: bool = True) -> str | bytes:
    result = run(["git", *args], cwd=repo, text=text)
    return result.stdout


def gh_json(repo: Path, endpoint: str) -> Any:
    result = run(["gh", "api", endpoint], cwd=repo)
    assert isinstance(result.stdout, str)
    return json.loads(result.stdout)


def parse_status(repo: Path) -> list[dict[str, str]]:
    raw = git(repo, "status", "--porcelain=v1", "-z", "--untracked-files=all", text=False)
    assert isinstance(raw, bytes)
    records = raw.split(b"\0")
    items: list[dict[str, str]] = []
    index = 0
    while index < len(records):
        record = records[index]
        index += 1
        if not record:
            continue
        status_code = record[:2].decode("ascii", "replace")
        path = record[3:].decode("utf-8", "surrogateescape")
        item = {"status": status_code, "path": path}
        if "R" in status_code or "C" in status_code:
            item["source_path"] = records[index].decode("utf-8", "surrogateescape")
            index += 1
        items.append(item)
    return items


def git_blob(path: Path) -> dict[str, Any]:
    metadata = path.lstat()
    if stat.S_ISLNK(metadata.st_mode):
        payload = os.readlink(path).encode("utf-8", "surrogateescape")
    else:
        payload = path.read_bytes()
    return {
        "bytes": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
        "git_blob_oid": hashlib.sha1(
            f"blob {len(payload)}\0".encode("ascii") + payload
        ).hexdigest(),
    }


def duplicate_canonical_path(path: str) -> str | None:
    candidate = re.sub(r" ([2-9]|[1-9][0-9]+)(?=\.[^/]+$)", "", path)
    return candidate if candidate != path else None


def github_refs(repo: Path, slug: str) -> tuple[list[dict[str, str]], list[dict[str, Any]]]:
    branches = gh_json(repo, f"repos/{slug}/branches?per_page=100")
    prs_result = run(
        [
            "gh",
            "pr",
            "list",
            "--repo",
            slug,
            "--state",
            "all",
            "--limit",
            "100",
            "--json",
            "number,state,isDraft,headRefName,headRefOid,baseRefName,mergeCommit,title,url",
        ],
        cwd=repo,
    )
    assert isinstance(prs_result.stdout, str)
    pull_requests = json.loads(prs_result.stdout)
    branch_refs = [
        {"kind": "branch", "name": branch["name"], "sha": branch["commit"]["sha"]}
        for branch in branches
    ]
    return branch_refs, pull_requests


def load_remote_trees(
    repo: Path,
    slug: str,
    branch_refs: list[dict[str, str]],
    pull_requests: list[dict[str, Any]],
) -> tuple[dict[str, list[dict[str, str]]], dict[str, list[dict[str, str]]]]:
    refs_by_sha: dict[str, list[dict[str, str]]] = defaultdict(list)
    for ref in branch_refs:
        refs_by_sha[ref["sha"]].append(ref)
    for pr in pull_requests:
        refs_by_sha[pr["headRefOid"]].append(
            {
                "kind": "pull_request_head",
                "name": f"PR #{pr['number']} {pr['headRefName']}",
                "sha": pr["headRefOid"],
                "url": pr["url"],
                "state": pr["state"],
            }
        )
        if pr.get("mergeCommit"):
            merge_sha = pr["mergeCommit"]["oid"]
            refs_by_sha[merge_sha].append(
                {
                    "kind": "pull_request_merge",
                    "name": f"PR #{pr['number']} merge",
                    "sha": merge_sha,
                    "url": pr["url"],
                    "state": pr["state"],
                }
            )

    by_path_oid: dict[str, list[dict[str, str]]] = defaultdict(list)
    by_oid: dict[str, list[dict[str, str]]] = defaultdict(list)
    for commit_sha, refs in refs_by_sha.items():
        tree = gh_json(repo, f"repos/{slug}/git/trees/{commit_sha}?recursive=1")
        if tree.get("truncated"):
            raise RuntimeError(f"GitHub tree was truncated for {commit_sha}")
        for entry in tree["tree"]:
            if entry["type"] != "blob":
                continue
            occurrence = {
                "path": entry["path"],
                "commit": commit_sha,
                "refs": refs,
            }
            by_path_oid[f"{entry['path']}\0{entry['sha']}"].append(occurrence)
            by_oid[entry["sha"]].append(occurrence)
    return by_path_oid, by_oid


def remote_base_tree(repo: Path, slug: str, sha: str) -> dict[str, dict[str, Any]]:
    tree = gh_json(repo, f"repos/{slug}/git/trees/{sha}?recursive=1")
    if tree.get("truncated"):
        raise RuntimeError(f"GitHub base tree was truncated for {sha}")
    return {entry["path"]: entry for entry in tree["tree"] if entry["type"] == "blob"}


def github_blob_bytes(repo: Path, slug: str, oid: str) -> bytes:
    payload = gh_json(repo, f"repos/{slug}/git/blobs/{oid}")
    if payload.get("encoding") != "base64":
        raise RuntimeError(f"unexpected GitHub blob encoding for {oid}")
    return base64.b64decode(payload["content"])


def reconstructed_diff_stat(
    repo: Path,
    slug: str,
    local_head_tree: dict[str, dict[str, Any]],
    inventory: list[dict[str, Any]],
) -> tuple[str, str]:
    """Return complete name-status and numstat when local iCloud objects block git diff."""
    name_status: list[str] = []
    numstat: list[str] = []
    for item in inventory:
        path = item["path"]
        if item["status"] == "??":
            # Match Git semantics: ordinary ``git diff`` does not include
            # untracked paths.  They are preserved in the separate complete
            # untracked inventory.
            continue
        name_status.append(f"M\t{path}")
        base = local_head_tree.get(path)
        if not base:
            numstat.append(f"-\t-\t{path}")
            continue
        before = github_blob_bytes(repo, slug, base["sha"])
        after = (repo / path).read_bytes()
        if b"\0" in before or b"\0" in after:
            numstat.append(f"-\t-\t{path}")
            continue
        before_lines = before.decode("utf-8", "surrogateescape").splitlines()
        after_lines = after.decode("utf-8", "surrogateescape").splitlines()
        matcher = difflib.SequenceMatcher(a=before_lines, b=after_lines, autojunk=False)
        deleted = inserted = 0
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag in {"delete", "replace"}:
                deleted += i2 - i1
            if tag in {"insert", "replace"}:
                inserted += j2 - j1
        numstat.append(f"{inserted}\t{deleted}\t{path}")
    return "\n".join(name_status) + "\n", "\n".join(numstat) + "\n"


def ignored_inventory(repo: Path) -> tuple[list[str], dict[str, int]]:
    raw = git(repo, "status", "--porcelain=v1", "--ignored", "--untracked-files=all")
    assert isinstance(raw, str)
    paths = [line[3:] for line in raw.splitlines() if line.startswith("!! ")]
    categories: Counter[str] = Counter()
    for path in paths:
        if path == ".env.local":
            categories["LOCAL_SECRET_CONFIGURATION_CONTENT_NOT_READ"] += 1
        elif path.startswith(".next/"):
            categories["NEXT_BUILD_CACHE"] += 1
        elif path.startswith("node_modules/"):
            categories["DEPENDENCY_CACHE"] += 1
        elif path.startswith(".vercel/"):
            categories["LOCAL_VERCEL_LINK_METADATA_CONTENT_NOT_READ"] += 1
        elif path == ".DS_Store" or path.endswith("/.DS_Store"):
            categories["MACOS_METADATA"] += 1
        elif path.startswith(".claude/"):
            categories["LOCAL_TOOL_CONFIGURATION_CONTENT_NOT_READ"] += 1
        else:
            categories["OTHER_GITIGNORED_PATH_CONTENT_NOT_READ"] += 1
    return paths, dict(sorted(categories.items()))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--worktree", type=Path, required=True)
    parser.add_argument("--github-repo", required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    repo = args.worktree.resolve()
    output = args.output.resolve()
    raw_dir = output / "raw" / "nested-woek-institut-app"
    raw_dir.mkdir(parents=True, exist_ok=True)

    status = parse_status(repo)
    local_head = str(git(repo, "rev-parse", "HEAD")).strip()
    branch = str(git(repo, "branch", "--show-current")).strip()
    branch_refs, pull_requests = github_refs(repo, args.github_repo)
    by_path_oid, by_oid = load_remote_trees(repo, args.github_repo, branch_refs, pull_requests)
    local_head_tree = remote_base_tree(repo, args.github_repo, local_head)
    local_commit = gh_json(repo, f"repos/{args.github_repo}/commits/{local_head}")
    remote_feature_head = next(
        (ref["sha"] for ref in branch_refs if ref["name"] == branch), None
    )
    ancestry = (
        gh_json(
            repo,
            f"repos/{args.github_repo}/compare/{local_head}...{remote_feature_head}",
        )
        if remote_feature_head
        else None
    )

    inventory: list[dict[str, Any]] = []
    working_oids: dict[str, list[str]] = defaultdict(list)
    for status_item in status:
        path = status_item["path"]
        details = git_blob(repo / path)
        item: dict[str, Any] = {**status_item, **details}
        working_oids[details["git_blob_oid"]].append(path)
        inventory.append(item)

    for item in inventory:
        path = item["path"]
        oid = item["git_blob_oid"]
        exact = by_path_oid.get(f"{path}\0{oid}", [])
        canonical = duplicate_canonical_path(path)
        canonical_hits = by_path_oid.get(f"{canonical}\0{oid}", []) if canonical else []
        any_hits = by_oid.get(oid, [])
        if exact or canonical_hits or any_hits:
            item["classification"] = GITHUB_PRESERVED
            item["classification_reason"] = (
                "working blob is already present in a GitHub branch or pull-request commit"
            )
            item["github_matches"] = (exact or canonical_hits or any_hits)[:20]
            if canonical:
                item["duplicate_canonical_path"] = canonical
        elif canonical and any(other != path for other in working_oids[oid]):
            item["classification"] = TEMPORARY
            item["classification_reason"] = (
                "number-suffixed local conflict copy duplicates another inventoried working file"
            )
            item["duplicate_canonical_path"] = canonical
            item["local_blob_matches"] = working_oids[oid]
        else:
            item["classification"] = UNIQUE
            item["classification_reason"] = (
                "working blob was not found in any current GitHub branch or any pull-request head/merge commit"
            )
            if canonical:
                item["duplicate_canonical_path"] = canonical

    ignored_paths, ignored_categories = ignored_inventory(repo)
    name_status, numstat = reconstructed_diff_stat(
        repo, args.github_repo, local_head_tree, inventory
    )

    # Reflogs are read directly because a malformed iCloud conflict-copy ref
    # (``feature/quellen-public-api 2``) makes broad Git ref enumeration hang.
    reflog_paths = [
        repo / ".git" / "logs" / "HEAD",
        repo / ".git" / "logs" / "refs" / "heads" / branch,
        repo / ".git" / "logs" / "refs" / "remotes" / "origin" / branch,
    ]
    reflogs: dict[str, str] = {}
    for path in reflog_paths:
        if path.exists():
            reflogs[str(path.relative_to(repo))] = path.read_text(
                encoding="utf-8", errors="replace"
            )

    raw_status = "".join(f"{item['status']} {item['path']}\n" for item in status)
    untracked = "".join(f"{item['path']}\n" for item in status if item["status"] == "??")
    (raw_dir / "git-status-short.txt").write_text(raw_status, encoding="utf-8")
    (raw_dir / "git-untracked-files.txt").write_text(untracked, encoding="utf-8")
    (raw_dir / "git-diff-name-status-reconstructed.txt").write_text(name_status, encoding="utf-8")
    (raw_dir / "git-diff-numstat-reconstructed.txt").write_text(numstat, encoding="utf-8")
    (raw_dir / "git-ignored-paths-content-not-read.txt").write_text(
        "\n".join(ignored_paths) + "\n", encoding="utf-8"
    )
    (raw_dir / "reflogs.json").write_text(
        json.dumps(reflogs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (raw_dir / "github-branches.json").write_text(
        json.dumps(branch_refs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (raw_dir / "github-pull-requests.json").write_text(
        json.dumps(pull_requests, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    counts = Counter(item["classification"] for item in inventory)
    bytes_by_class = Counter()
    for item in inventory:
        bytes_by_class[item["classification"]] += item["bytes"]
    payload = {
        "scope": "nested Git repository inside old root worktree: woek-institut-app/",
        "worktree": str(repo),
        "github_repo": args.github_repo,
        "local_head": local_head,
        "local_branch": branch,
        "github_local_commit": {
            "sha": local_commit["sha"],
            "url": local_commit["html_url"],
        },
        "github_head_preserved": local_commit["sha"] == local_head,
        "remote_feature_head": remote_feature_head,
        "local_to_remote_feature_compare": (
            {
                "status": ancestry["status"],
                "ahead_by": ancestry["ahead_by"],
                "behind_by": ancestry["behind_by"],
                "total_commits": ancestry["total_commits"],
                "html_url": ancestry["html_url"],
            }
            if ancestry
            else None
        ),
        "git_diff_commands": {
            "git_status_short": "completed",
            "git_diff_stat": "attempted; blocked by macOS dataless Git objects",
            "git_diff_name_status": "attempted; blocked by macOS dataless Git objects",
            "reconstruction_basis": (
                "exact local working bytes versus immutable GitHub tree/blob objects at local HEAD"
            ),
        },
        "classification_counts": dict(sorted(counts.items())),
        "classification_bytes": dict(sorted(bytes_by_class.items())),
        "ignored_path_count": len(ignored_paths),
        "ignored_categories": ignored_categories,
        "ignored_content_read": False,
        "inventory": inventory,
        "unique_unsaved_relevant_changes": counts.get(UNIQUE, 0),
    }
    (output / "nested-woek-institut-app-audit.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps({key: value for key, value in payload.items() if key != "inventory"}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
