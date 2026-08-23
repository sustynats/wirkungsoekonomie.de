#!/usr/bin/env python3
"""Verify and secret-scan the five-commit #284 old-branch rescue bundle."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path
from typing import Any


PATTERNS = {
    "private_key": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "github_token": re.compile(rb"\bgh[opusr]_[A-Za-z0-9_]{30,}\b"),
    "vercel_token": re.compile(rb"\b(?:vercel_[A-Za-z0-9_-]{24,}|vcp_[A-Za-z0-9_-]{24,})\b"),
    "aws_access_key": re.compile(rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "slack_token": re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    "stripe_secret": re.compile(rb"\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b"),
    "jwt": re.compile(rb"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"),
}


def run(args: list[str], cwd: Path, text: bool = True) -> str | bytes:
    result = subprocess.run(
        args,
        cwd=cwd,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=text,
    )
    return result.stdout


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repository", type=Path, required=True)
    parser.add_argument("--bundle", type=Path, required=True)
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    repo = args.repository.resolve()
    bundle = args.bundle.resolve()
    commits_text = run(
        ["git", "log", "--reverse", "--format=%H%x09%s", f"{args.base}..{args.head}"],
        repo,
    )
    assert isinstance(commits_text, str)
    commits = [line.split("\t", 1) for line in commits_text.splitlines()]
    if len(commits) != 5:
        raise RuntimeError(f"expected five local branch commits, found {len(commits)}")

    verify = subprocess.run(
        ["git", "bundle", "verify", str(bundle)],
        cwd=repo,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    if verify.returncode != 0:
        raise RuntimeError(verify.stdout)
    heads = run(["git", "bundle", "list-heads", str(bundle)], repo)
    assert isinstance(heads, str)
    if f"{args.head} refs/heads/codex/live-clean-20260628" not in heads:
        raise RuntimeError("bundle does not expose the expected old branch head")

    findings: list[dict[str, Any]] = []
    scanned: list[dict[str, Any]] = []
    for commit, subject in commits:
        raw_paths = run(
            ["git", "diff-tree", "--root", "--no-commit-id", "--name-only", "-r", "-z", commit],
            repo,
            text=False,
        )
        assert isinstance(raw_paths, bytes)
        paths = [path.decode("utf-8", "surrogateescape") for path in raw_paths.split(b"\0") if path]
        commit_bytes = 0
        scanned_paths = 0
        for path in paths:
            exists = subprocess.run(
                ["git", "cat-file", "-e", f"{commit}:{path}"],
                cwd=repo,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            if exists.returncode:
                continue
            payload = run(["git", "cat-file", "blob", f"{commit}:{path}"], repo, text=False)
            assert isinstance(payload, bytes)
            commit_bytes += len(payload)
            scanned_paths += 1
            for name, pattern in PATTERNS.items():
                for match in pattern.finditer(payload):
                    findings.append(
                        {
                            "commit": commit,
                            "path": path,
                            "pattern": name,
                            "byte_offset": match.start(),
                        }
                    )
        scanned.append(
            {
                "commit": commit,
                "subject": subject,
                "changed_paths_scanned": scanned_paths,
                "introduced_blob_bytes_scanned": commit_bytes,
            }
        )
    if findings:
        raise RuntimeError("secret scan failed; values suppressed: " + json.dumps(findings))

    report = {
        "bundle": bundle.name,
        "bundle_sha256": hashlib.sha256(bundle.read_bytes()).hexdigest(),
        "bundle_bytes": bundle.stat().st_size,
        "bundle_verify_status": "PASS",
        "base_prerequisite": args.base,
        "head": args.head,
        "commit_count": len(commits),
        "secret_scan_status": "PASS",
        "secret_findings": [],
        "commits": scanned,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "commits"}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
