#!/usr/bin/env python3
"""Create the complete, read-only evidence inventory required by issue #284.

The inspected worktree is never written. Reports are written below the current
fresh-main checkout so that the evidence can be reviewed and versioned safely.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import stat
import subprocess
from collections import Counter
from collections import defaultdict
from pathlib import Path, PurePosixPath
from typing import Any


CLASSES = {
    "ALREADY_ON_MAIN",
    "ALREADY_IN_GITHUB_PR_OR_BRANCH",
    "GENERATED_REPRODUCIBLE",
    "BUILD_CACHE_OR_TEMPORARY",
    "SUPERSEDED",
    "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED",
}


def load_overrides(path: Path | None) -> tuple[dict[str, dict[str, str]], list[dict[str, str]]]:
    """Load exact and prefix review decisions.

    The original audit format was a direct ``path -> decision`` mapping.  Keep
    accepting it so previously recorded evidence stays reproducible, while the
    structured format lets one reviewed rule classify every member of a large
    generated or versioned artifact tree without losing per-item output.
    """
    if not path or not path.exists():
        return {}, []
    payload = json.loads(path.read_text(encoding="utf-8"))
    if "exact" not in payload and "prefixes" not in payload:
        return payload, []
    exact = payload.get("exact", {})
    prefixes = payload.get("prefixes", [])
    if not isinstance(exact, dict) or not isinstance(prefixes, list):
        raise RuntimeError("override file must contain an object 'exact' and an array 'prefixes'")
    for rule in prefixes:
        if not isinstance(rule, dict) or not isinstance(rule.get("prefix"), str):
            raise RuntimeError("each prefix override needs a string 'prefix'")
    return exact, prefixes


def reviewed_override(
    path: str,
    exact: dict[str, dict[str, str]],
    prefixes: list[dict[str, str]],
) -> dict[str, str] | None:
    if path in exact:
        return exact[path]
    matches = [rule for rule in prefixes if path.startswith(rule["prefix"])]
    if not matches:
        return None
    # The most specific prefix wins; declaration order resolves equal lengths.
    return max(enumerate(matches), key=lambda entry: (len(entry[1]["prefix"]), entry[0]))[1]


def apply_reviewed_override(item: dict[str, Any], override: dict[str, str] | None) -> None:
    if not override:
        return
    override_class = override.get("classification")
    if override_class not in CLASSES:
        raise RuntimeError(f"invalid override class for {item['path']}: {override_class}")
    item["classification"] = override_class
    item["classification_reason"] = override.get("reason", "manual reviewed override")
    item["review_rule"] = override.get("prefix", item["path"])
    if override.get("evidence"):
        item["review_evidence"] = override["evidence"]
    if override.get("rescue"):
        item["rescue"] = override["rescue"]


def git(repo: Path, *args: str, text: bool = True, check: bool = True) -> str | bytes:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        check=check,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=text,
    )
    return result.stdout


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")


def load_tree(repo: Path, ref: str) -> dict[str, dict[str, str]]:
    raw = git(repo, "ls-tree", "-rz", "--full-tree", ref, text=False)
    assert isinstance(raw, bytes)
    tree: dict[str, dict[str, str]] = {}
    for record in raw.split(b"\0"):
        if not record:
            continue
        meta, encoded_path = record.split(b"\t", 1)
        mode, kind, oid = meta.decode("ascii").split(" ")
        path = encoded_path.decode("utf-8", "surrogateescape")
        tree[path] = {"mode": mode, "type": kind, "oid": oid}
    return tree


def parse_status(repo: Path) -> list[dict[str, str]]:
    raw = git(
        repo,
        "status",
        "--porcelain=v1",
        "-z",
        "--untracked-files=all",
        text=False,
    )
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
            if index < len(records):
                item["source_path"] = records[index].decode("utf-8", "surrogateescape")
                index += 1
        items.append(item)
    return items


def hash_worktree_path(root: Path, relative: str) -> dict[str, Any]:
    path = root / relative
    try:
        metadata = path.lstat()
    except FileNotFoundError:
        return {
            "kind": "missing",
            "bytes": 0,
            "sha256": None,
            "git_blob_oid": None,
        }

    dataless_flag = getattr(stat, "SF_DATALESS", 0)
    if dataless_flag and getattr(metadata, "st_flags", 0) & dataless_flag:
        return {
            "kind": "dataless_placeholder",
            "bytes": metadata.st_size,
            "allocated_blocks": getattr(metadata, "st_blocks", 0),
            "filesystem_flags": getattr(metadata, "st_flags", 0),
            "sha256": None,
            "git_blob_oid": None,
            "content_read": False,
            "technical_limitation": "macOS SF_DATALESS placeholder; content not materialized during read-only inventory",
        }

    if stat.S_ISLNK(metadata.st_mode):
        payload = os.readlink(path).encode("utf-8", "surrogateescape")
        return {
            "kind": "symlink",
            "bytes": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
            "git_blob_oid": hashlib.sha1(
                f"blob {len(payload)}\0".encode("ascii") + payload
            ).hexdigest(),
        }
    if not stat.S_ISREG(metadata.st_mode):
        return {
            "kind": "directory_or_special",
            "bytes": 0,
            "sha256": None,
            "git_blob_oid": None,
        }

    sha256 = hashlib.sha256()
    blob_sha1 = hashlib.sha1(f"blob {metadata.st_size}\0".encode("ascii"))
    with path.open("rb") as handle:
        while chunk := handle.read(1024 * 1024):
            sha256.update(chunk)
            blob_sha1.update(chunk)
    return {
        "kind": "file",
        "bytes": metadata.st_size,
        "sha256": sha256.hexdigest(),
        "git_blob_oid": blob_sha1.hexdigest(),
    }


def inspect_worktree_metadata(root: Path, relative: str) -> dict[str, Any]:
    """Inventory known temporary paths without materializing cloud placeholders."""
    path = root / relative
    try:
        metadata = path.lstat()
    except FileNotFoundError:
        return {
            "kind": "missing",
            "bytes": 0,
            "sha256": None,
            "git_blob_oid": None,
            "content_read": False,
        }
    if stat.S_ISLNK(metadata.st_mode):
        kind = "symlink"
        byte_count = len(os.readlink(path).encode("utf-8", "surrogateescape"))
    elif stat.S_ISREG(metadata.st_mode):
        kind = "file"
        byte_count = metadata.st_size
    else:
        kind = "directory_or_special"
        byte_count = 0
    return {
        "kind": kind,
        "bytes": byte_count,
        "sha256": None,
        "git_blob_oid": None,
        "content_read": False,
    }


def is_cache_or_temporary(path: str) -> tuple[bool, str]:
    parts = PurePosixPath(path).parts
    cache_parts = {
        "node_modules",
        ".next",
        ".cache",
        ".parcel-cache",
        ".turbo",
        ".vite",
        "coverage",
        "__pycache__",
        ".pytest_cache",
        ".mypy_cache",
        ".ruff_cache",
        ".venv",
        "venv",
    }
    if any(part in cache_parts for part in parts):
        return True, "path belongs to a dependency, build, or interpreter cache"
    if parts and parts[0] == "tmp":
        return True, "repository-local tmp tree"
    if parts and parts[0] == ".tmp":
        return True, "repository-local hidden tmp tree"
    if parts and parts[0].startswith(".release-"):
        return True, "local release validation/build output"
    if parts and parts[0].startswith(".wt-"):
        return True, "local helper-worktree marker"
    if parts and parts[0] == "$CODEX_HOME":
        return True, "accidentally literal local tool-home path"
    if len(parts) >= 2 and parts[:2] == (".claude", "worktrees"):
        return True, "nested tool worktree metadata/content"
    name = parts[-1] if parts else path
    if name in {".DS_Store", "Thumbs.db"}:
        return True, "operating-system metadata"
    if name.endswith((".log", ".tmp", ".swp", ".swo", "~")):
        return True, "temporary/editor/log output"
    return False, ""


def is_generated_reproducible(path: str) -> tuple[bool, str]:
    pure = PurePosixPath(path)
    parts = pure.parts
    if len(parts) >= 3 and parts[0] == "begriffe" and parts[-1] == "index.html":
        return True, "generated glossary detail page"
    if parts[:2] == ("assets", "search") and pure.suffix == ".json":
        return True, "generated search projection"
    generated_data = {
        "assets/data/blog-index.json",
        "assets/data/document-library.json",
        "assets/data/document-registry.json",
        "assets/data/glossary-lookup.json",
        "assets/data/glossary-reference-index.json",
        "assets/data/library-version-registry.json",
    }
    if path in generated_data:
        return True, "generated public registry/index projection"
    if parts[:2] == ("content", "audits") and pure.suffix in {".json", ".md"}:
        return True, "generated repository audit projection"
    if path in {"sitemap.xml", "llms.txt", "reports/url-baseline.txt"}:
        return True, "generated site/search discovery projection"
    return False, ""


def duplicate_counterpart(path: str) -> str | None:
    pure = PurePosixPath(path)
    name = pure.name
    for marker in (" 2", " copy", " Kopie"):
        stem = pure.stem
        if stem.endswith(marker):
            counterpart = pure.with_name(stem[: -len(marker)] + pure.suffix)
            return counterpart.as_posix()
    return None


def remote_tip_map(repo: Path) -> tuple[list[str], dict[str, list[str]]]:
    raw = git(
        repo,
        "for-each-ref",
        "--format=%(objectname) %(refname)",
        "refs/remotes/origin",
        "refs/remotes/pull",
    )
    assert isinstance(raw, str)
    by_commit: dict[str, list[str]] = {}
    for line in raw.splitlines():
        if not line.strip():
            continue
        oid, ref = line.split(" ", 1)
        if ref == "refs/remotes/origin/HEAD":
            continue
        by_commit.setdefault(oid, []).append(ref)
    commits = sorted(
        by_commit,
        key=lambda oid: (
            0 if any(ref.startswith("refs/remotes/origin/") for ref in by_commit[oid]) else 1,
            by_commit[oid][0],
        ),
    )
    return commits, by_commit


def match_remote_tips(
    repo: Path,
    candidates: list[dict[str, Any]],
) -> None:
    commits, refs_by_commit = remote_tip_map(repo)
    process = subprocess.Popen(
        ["git", "-C", str(repo), "cat-file", "--batch-check"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
    )
    assert process.stdin is not None
    assert process.stdout is not None
    try:
        for item in candidates:
            blob_oid = item.get("working", {}).get("git_blob_oid")
            path = item["path"]
            if not blob_oid or "\n" in path or "\r" in path:
                continue
            queries = [f"{commit}:{path}" for commit in commits]
            process.stdin.write("\n".join(queries) + "\n")
            process.stdin.flush()
            matched_commit: str | None = None
            for commit in commits:
                response = process.stdout.readline().rstrip("\n")
                if response.endswith(" missing"):
                    continue
                fields = response.rsplit(" ", 2)
                if len(fields) == 3 and fields[0] == blob_oid and fields[1] == "blob":
                    matched_commit = commit
            if matched_commit:
                refs = refs_by_commit[matched_commit]
                item["github_match"] = {
                    "commit": matched_commit,
                    "refs": refs[:10],
                    "additional_ref_count": max(0, len(refs) - 10),
                }
                item["classification"] = "ALREADY_IN_GITHUB_PR_OR_BRANCH"
                item["classification_reason"] = "working content equals the same path at a fetched GitHub branch/PR tip"
    finally:
        process.stdin.close()
        process.wait(timeout=30)


def match_remote_reachable_history(
    repo: Path,
    candidates: list[dict[str, Any]],
) -> None:
    """Mark blobs already preserved anywhere in fetched GitHub ref history."""
    by_oid: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in candidates:
        oid = item.get("working", {}).get("git_blob_oid")
        if oid:
            by_oid[oid].append(item)
    if not by_oid:
        return

    process = subprocess.Popen(
        [
            "git",
            "-C",
            str(repo),
            "rev-list",
            "--objects",
            "--remotes=origin",
            "--remotes=pull",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    assert process.stdout is not None
    matches: dict[str, list[str]] = defaultdict(list)
    for line in process.stdout:
        line = line.rstrip("\n")
        if " " not in line:
            continue
        oid, path = line.split(" ", 1)
        if oid in by_oid and len(matches[oid]) < 10:
            matches[oid].append(path)
    returncode = process.wait()
    if returncode != 0:
        stderr = process.stderr.read() if process.stderr else ""
        raise RuntimeError(f"git rev-list remote history failed: {stderr}")

    for oid, paths in matches.items():
        for item in by_oid[oid]:
            item["github_history_match"] = {
                "blob_oid": oid,
                "representative_paths": paths,
            }
            item["classification"] = "ALREADY_IN_GITHUB_PR_OR_BRANCH"
            item["classification_reason"] = (
                "exact content blob is reachable from fetched GitHub branch/PR history"
            )


def count_streamed_bytes(repo: Path, *args: str) -> int:
    process = subprocess.Popen(
        ["git", "-C", str(repo), *args],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    assert process.stdout is not None
    total = 0
    while chunk := process.stdout.read(1024 * 1024):
        total += len(chunk)
    returncode = process.wait()
    if returncode != 0:
        stderr = process.stderr.read().decode("utf-8", "replace") if process.stderr else ""
        raise RuntimeError(f"git {' '.join(args)} failed: {stderr}")
    return total


def github_release_assets(repository: str) -> list[dict[str, Any]]:
    result = subprocess.run(
        [
            "gh",
            "api",
            f"repos/{repository}/releases?per_page=100",
            "--paginate",
            "--slurp",
        ],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    pages = json.loads(result.stdout)
    assets: list[dict[str, Any]] = []
    for page in pages:
        for release in page:
            for asset in release.get("assets", []):
                assets.append(
                    {
                        "release_tag": release.get("tag_name"),
                        "name": asset.get("name"),
                        "size": asset.get("size"),
                        "digest": asset.get("digest"),
                        "url": asset.get("browser_download_url"),
                        "state": asset.get("state"),
                    }
                )
    return assets


def match_github_release_assets(
    items: list[dict[str, Any]], assets: list[dict[str, Any]]
) -> None:
    by_name_and_size: dict[tuple[str, int], list[dict[str, Any]]] = defaultdict(list)
    for asset in assets:
        if asset.get("name") and isinstance(asset.get("size"), int):
            by_name_and_size[(asset["name"], asset["size"])].append(asset)
    for item in items:
        if item["classification"] != "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED":
            continue
        working = item["working"]
        key = (PurePosixPath(item["path"]).name, int(working["bytes"]))
        candidates = by_name_and_size.get(key, [])
        if not candidates:
            continue
        local_sha256 = working.get("sha256")
        exact = [
            asset
            for asset in candidates
            if local_sha256 and asset.get("digest") == f"sha256:{local_sha256}"
        ]
        if exact:
            match = exact[0]
            method = "SHA256_NAME_SIZE"
        elif working.get("kind") == "dataless_placeholder" and len(candidates) == 1:
            match = candidates[0]
            method = "UNIQUE_NAME_SIZE_DATALLESS_PLACEHOLDER"
        else:
            continue
        item["github_release_match"] = {**match, "match_method": method}
        item["classification"] = "ALREADY_IN_GITHUB_PR_OR_BRANCH"
        item["classification_reason"] = (
            "content is already preserved as an immutable GitHub Release asset; "
            "the required GitHub-preserved classification is used"
        )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--old-worktree", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--main-ref", default="origin/main")
    parser.add_argument("--overrides", type=Path)
    parser.add_argument("--github-repository")
    args = parser.parse_args()

    old = args.old_worktree.resolve()
    output = args.output_dir.resolve()
    output.mkdir(parents=True, exist_ok=True)

    object_format = str(git(old, "rev-parse", "--show-object-format")).strip()
    if object_format != "sha1":
        raise RuntimeError(f"unsupported Git object format: {object_format}")

    head = str(git(old, "rev-parse", "HEAD")).strip()
    branch = str(git(old, "rev-parse", "--abbrev-ref", "HEAD")).strip()
    main_commit = str(git(old, "rev-parse", args.main_ref)).strip()
    main_tree = load_tree(old, args.main_ref)
    old_tree = load_tree(old, "HEAD")
    main_paths_by_oid: dict[str, list[str]] = defaultdict(list)
    for main_path, entry in main_tree.items():
        if entry["type"] == "blob" and len(main_paths_by_oid[entry["oid"]]) < 10:
            main_paths_by_oid[entry["oid"]].append(main_path)
    status_items = parse_status(old)

    raw_commands = {
        "git-status-short.txt": ("status", "--short"),
        "git-diff-stat.txt": ("diff", "--stat"),
        "git-diff-name-status.txt": ("diff", "--name-status"),
        "git-untracked-files.txt": ("ls-files", "--others", "--exclude-standard"),
        "git-reflog-head.txt": ("reflog", "show", "--date=iso", "HEAD"),
        "git-reflog-branch.txt": ("reflog", "show", "--date=iso", branch),
        "git-local-only-commits-branch.txt": (
            "log",
            "--date=iso-strict",
            "--format=%H%x09%P%x09%ad%x09%an%x09%s",
            branch,
            "--not",
            "--remotes=origin",
            "--remotes=pull",
        ),
        "git-local-only-commits-all.txt": (
            "log",
            "--date=iso-strict",
            "--format=%H%x09%P%x09%ad%x09%an%x09%d%x09%s",
            "--all",
            "--not",
            "--remotes=origin",
            "--remotes=pull",
        ),
    }
    for filename, command in raw_commands.items():
        value = str(git(old, *command))
        write_text(output / "raw" / filename, value)

    exact_overrides, prefix_overrides = load_overrides(args.overrides)

    items: list[dict[str, Any]] = []
    remote_candidates: list[dict[str, Any]] = []
    for position, status_item in enumerate(status_items, start=1):
        path = status_item["path"]
        cache, cache_reason = is_cache_or_temporary(path)
        working = (
            inspect_worktree_metadata(old, path)
            if cache
            else hash_worktree_path(old, path)
        )
        old_entry = old_tree.get(path)
        main_entry = main_tree.get(path)
        item: dict[str, Any] = {
            **status_item,
            "working": working,
            "old_head": old_entry,
            "current_main": main_entry,
            "classification": "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED",
            "classification_reason": "content is not yet proven present or reproducible elsewhere",
        }

        working_oid = working.get("git_blob_oid")
        if working["kind"] == "missing" and main_entry is None:
            item["classification"] = "ALREADY_ON_MAIN"
            item["classification_reason"] = "path is deleted in the worktree and absent from current main"
        elif working_oid and main_entry and working_oid == main_entry["oid"]:
            item["classification"] = "ALREADY_ON_MAIN"
            item["classification_reason"] = "working content equals current main at the same path"
        elif working["kind"] == "dataless_placeholder" and main_entry and main_entry["type"] == "blob":
            main_size = int(str(git(old, "cat-file", "-s", main_entry["oid"])).strip())
            item["current_main"]["bytes"] = main_size
            if int(working["bytes"]) == main_size:
                item["classification"] = "ALREADY_ON_MAIN"
                item["classification_reason"] = (
                    "untracked macOS dataless placeholder has the same path and logical byte count "
                    "as current main; byte hashing was technically unavailable without materialization"
                )
                item["verification_limitation"] = (
                    "PATH_AND_LOGICAL_SIZE_ONLY_DUE_TO_SF_DATALESS"
                )
        else:
            generated, generated_reason = is_generated_reproducible(path)
            if cache:
                item["classification"] = "BUILD_CACHE_OR_TEMPORARY"
                item["classification_reason"] = cache_reason
            elif generated:
                item["classification"] = "GENERATED_REPRODUCIBLE"
                item["classification_reason"] = generated_reason
            else:
                counterpart = duplicate_counterpart(path)
                if counterpart:
                    counterpart_info = hash_worktree_path(old, counterpart)
                    counterpart_main = main_tree.get(counterpart)
                    counterpart_oid = counterpart_info.get("git_blob_oid")
                    if working_oid and (
                        working_oid == counterpart_oid
                        or (counterpart_main and working_oid == counterpart_main["oid"])
                    ):
                        item["classification"] = "SUPERSEDED"
                        item["classification_reason"] = f"duplicate-suffixed copy of {counterpart}"
                        item["superseded_by"] = counterpart
                if item["classification"] == "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED":
                    remote_candidates.append(item)

        override = reviewed_override(path, exact_overrides, prefix_overrides)
        apply_reviewed_override(item, override)
        items.append(item)
        if position % 1000 == 0:
            print(f"hashed {position}/{len(status_items)}", flush=True)

    release_assets: list[dict[str, Any]] = []
    if args.github_repository:
        release_assets = github_release_assets(args.github_repository)
        (output / "raw" / "github-release-assets.json").write_text(
            json.dumps(release_assets, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
            encoding="utf-8",
        )
        match_github_release_assets(items, release_assets)

    candidates_without_override = [
        item
        for item in remote_candidates
        if item["classification"] == "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED"
        and reviewed_override(item["path"], exact_overrides, prefix_overrides) is None
    ]
    for item in candidates_without_override:
        oid = item.get("working", {}).get("git_blob_oid")
        if oid and oid in main_paths_by_oid:
            item["current_main_match_paths"] = main_paths_by_oid[oid]
            item["classification"] = "ALREADY_ON_MAIN"
            item["classification_reason"] = (
                "working content equals a blob present in the current main tree"
            )
    candidates_without_override = [
        item
        for item in candidates_without_override
        if item["classification"] == "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED"
    ]
    print(
        f"checking {len(candidates_without_override)} candidates in fetched GitHub history",
        flush=True,
    )
    match_remote_reachable_history(old, candidates_without_override)
    candidates_without_override = [
        item
        for item in candidates_without_override
        if item["classification"] == "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED"
    ]
    print(f"checking {len(candidates_without_override)} candidates across fetched GitHub tips", flush=True)
    match_remote_tips(old, candidates_without_override)

    # Apply reviewed overrides once more so they remain authoritative over all automation.
    for item in items:
        override = reviewed_override(item["path"], exact_overrides, prefix_overrides)
        apply_reviewed_override(item, override)

    counts = Counter(item["classification"] for item in items)
    byte_counts = Counter()
    for item in items:
        byte_counts[item["classification"]] += int(item["working"]["bytes"])

    local_only_branch = (output / "raw" / "git-local-only-commits-branch.txt").read_text(
        encoding="utf-8"
    ).splitlines()
    local_only_all = (output / "raw" / "git-local-only-commits-all.txt").read_text(
        encoding="utf-8"
    ).splitlines()
    tracked = sum(1 for item in items if item["status"] != "??")
    untracked = sum(1 for item in items if item["status"] == "??")
    total_bytes = sum(int(item["working"]["bytes"]) for item in items)
    unique_items = [
        item for item in items if item["classification"] == "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED"
    ]
    summary = {
        "schema_version": "woek-issue-284-old-dirty-worktree-audit-1.0",
        "issue": 284,
        "audit_mode": "READ_ONLY_SOURCE_WORKTREE",
        "old_worktree": str(old),
        "old_head": head,
        "old_branch": branch,
        "current_main": main_commit,
        "changed_and_untracked_count": len(items),
        "tracked_changed_count": tracked,
        "untracked_count": untracked,
        "working_item_bytes": total_bytes,
        "tracked_binary_diff_bytes": count_streamed_bytes(old, "diff", "--binary"),
        "classification_counts": dict(sorted(counts.items())),
        "classification_bytes": dict(sorted(byte_counts.items())),
        "local_only_branch_commit_count": len(local_only_branch),
        "local_only_all_refs_commit_count": len(local_only_all),
        "github_release_asset_count_compared": len(release_assets),
        "unique_unsaved_relevant_changes": len(unique_items),
        "old_dirty_worktree_safe_to_delete": len(unique_items) == 0,
    }
    payload = {"summary": summary, "items": items}
    inventory_path = output / "issue-284-old-worktree-inventory.json"
    inventory_path.write_text(
        json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )

    markdown = [
        "# Issue #284 old dirty worktree audit",
        "",
        "> Deterministic read-only inventory. The inspected source worktree was not changed.",
        "",
        f"- Old worktree: `{old}`",
        f"- HEAD: `{head}`",
        f"- Branch: `{branch}`",
        f"- Compared main: `{main_commit}`",
        f"- Changed + untracked: **{len(items):,}**",
        f"- Tracked changed: **{tracked:,}**",
        f"- Untracked: **{untracked:,}**",
        f"- Working item bytes: **{total_bytes:,}**",
        f"- Tracked binary diff bytes: **{summary['tracked_binary_diff_bytes']:,}**",
        f"- Local-only commits on old branch: **{len(local_only_branch):,}**",
        f"- Local-only commits across local refs: **{len(local_only_all):,}**",
        "",
        "## Classification counts",
        "",
        "| Classification | Files | Bytes |",
        "|---|---:|---:|",
    ]
    for classification in sorted(CLASSES):
        markdown.append(
            f"| `{classification}` | {counts[classification]:,} | {byte_counts[classification]:,} |"
        )
    markdown.extend(
        [
            "",
            "## Unique review queue",
            "",
        ]
    )
    if unique_items:
        markdown.extend(
            f"- `{item['path']}` ({item['status']}, {item['working']['bytes']:,} bytes)"
            for item in unique_items
        )
    else:
        markdown.append("- None.")
    markdown.extend(
        [
            "",
            f"`UNIQUE_UNSAVED_RELEVANT_CHANGES={len(unique_items)}`",
            f"`OLD_DIRTY_WORKTREE_SAFE_TO_DELETE={'TRUE' if not unique_items else 'FALSE'}`",
            "",
            "The complete per-item classification is in `issue-284-old-worktree-inventory.json`;",
            "raw Git evidence is retained in the adjacent `raw/` directory.",
        ]
    )
    write_text(output / "issue-284-old-worktree-audit.md", "\n".join(markdown) + "\n")
    print(json.dumps(summary, ensure_ascii=False, sort_keys=True, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
