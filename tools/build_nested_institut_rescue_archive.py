#!/usr/bin/env python3
"""Build a deterministic, secret-scanned private rescue artifact for #284."""

from __future__ import annotations

import argparse
import gzip
import hashlib
import io
import json
import os
import re
import stat
import tarfile
from pathlib import Path
from typing import Any


STRONG_SECRET_PATTERNS = {
    "private_key": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "github_token": re.compile(rb"\bgh[opusr]_[A-Za-z0-9_]{30,}\b"),
    "vercel_token": re.compile(rb"\b(?:vercel_[A-Za-z0-9_-]{24,}|vcp_[A-Za-z0-9_-]{24,})\b"),
    "aws_access_key": re.compile(rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "slack_token": re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    "stripe_secret": re.compile(rb"\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b"),
    "jwt": re.compile(rb"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"),
}


def blob_details(payload: bytes) -> dict[str, Any]:
    return {
        "bytes": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
        "git_blob_oid": hashlib.sha1(
            f"blob {len(payload)}\0".encode("ascii") + payload
        ).hexdigest(),
    }


def add_bytes(archive: tarfile.TarFile, name: str, payload: bytes, mode: int = 0o644) -> None:
    info = tarfile.TarInfo(name=name)
    info.size = len(payload)
    info.mode = mode
    info.mtime = 0
    info.uid = 0
    info.gid = 0
    info.uname = "root"
    info.gname = "root"
    archive.addfile(info, io.BytesIO(payload))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--worktree", type=Path, required=True)
    parser.add_argument("--audit", type=Path, required=True)
    parser.add_argument("--review", type=Path, required=True)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    root = args.worktree.resolve()
    audit = json.loads(args.audit.read_text(encoding="utf-8"))
    review = json.loads(args.review.read_text(encoding="utf-8"))
    exact = review["exact"]
    default = review["default_unique_decision"]

    selected: list[dict[str, Any]] = []
    findings: list[dict[str, Any]] = []
    for original in audit["inventory"]:
        decision = exact.get(original["path"])
        if decision is None and original["classification"] == "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED":
            decision = default
        if not decision or decision.get("rescue") != "PRIVATE_GITHUB_RELEASE_ARCHIVE":
            continue
        path = root / original["path"]
        metadata = path.lstat()
        if not stat.S_ISREG(metadata.st_mode):
            raise RuntimeError(f"rescue path is not a regular file: {original['path']}")
        payload = path.read_bytes()
        details = blob_details(payload)
        if details["sha256"] != original["sha256"] or details["git_blob_oid"] != original["git_blob_oid"]:
            raise RuntimeError(f"working file changed since inventory: {original['path']}")
        for name, pattern in STRONG_SECRET_PATTERNS.items():
            for match in pattern.finditer(payload):
                findings.append(
                    {
                        "path": original["path"],
                        "pattern": name,
                        "byte_offset": match.start(),
                    }
                )
        # Generic assignments are examined without recording values.  Exclude
        # placeholders and process.env references by requiring a literal value.
        for line_number, line in enumerate(payload.splitlines(), start=1):
            if re.search(rb"(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY)\s*=\s*['\"]?[A-Za-z0-9+/=_-]{16,}", line, re.I):
                if b"process.env" not in line and b"your-" not in line.lower() and b"example" not in line.lower():
                    findings.append(
                        {
                            "path": original["path"],
                            "pattern": "literal_secret_assignment",
                            "line": line_number,
                        }
                    )
        selected.append(
            {
                "path": original["path"],
                "mode": stat.S_IMODE(metadata.st_mode),
                **details,
                "review_reason": decision["reason"],
                "projection_authorized": decision.get("projection_authorized"),
                "public_distribution_authorized": decision.get("public_distribution_authorized"),
            }
        )

    if findings:
        raise RuntimeError(
            "secret scan failed; see paths and pattern names only: "
            + json.dumps(findings, ensure_ascii=False)
        )

    manifest = {
        "artifact": "WÖK Institut old dirty worktree rescue for root issue #284",
        "status": "NON_PRODUCTION_PRIVATE_REVIEW_ARTIFACT",
        "source_repository": "sustynats/woek-institut-app",
        "source_local_head": audit["local_head"],
        "source_local_branch": audit["local_branch"],
        "created_from_inventory": args.audit.name,
        "file_count": len(selected),
        "logical_bytes": sum(item["bytes"] for item in selected),
        "ignored_content_included": False,
        "fach_projection_authorized": False,
        "deployment_authorized": False,
        "files": selected,
    }
    manifest_bytes = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode()
    readme = (
        "# Issue #284 private rescue artifact\n\n"
        "This deterministic archive preserves individually reviewed source files from the old "
        "nested `woek-institut-app` working tree. It is not a deployable release, not approved "
        "Fach/DNS/Recommendation content, and grants no projection or deployment authority.\n\n"
        f"Base commit: `{audit['local_head']}`\n\n"
        "Ignored `.env.local`, `.vercel`, `.next`, `node_modules`, tool configuration and other "
        "Git-ignored content are intentionally absent. Verify every file against `MANIFEST.json` "
        "before any future selective recovery.\n"
    ).encode()

    args.archive.parent.mkdir(parents=True, exist_ok=True)
    with args.archive.open("wb") as raw_handle:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw_handle, mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode="w", format=tarfile.PAX_FORMAT) as archive:
                add_bytes(archive, "README.md", readme)
                add_bytes(archive, "MANIFEST.json", manifest_bytes)
                for item in sorted(selected, key=lambda value: value["path"]):
                    payload = (root / item["path"]).read_bytes()
                    add_bytes(
                        archive,
                        f"woek-institut-app/{item['path']}",
                        payload,
                        item["mode"],
                    )

    archive_sha256 = hashlib.sha256(args.archive.read_bytes()).hexdigest()
    report = {
        "archive": args.archive.name,
        "archive_sha256": archive_sha256,
        "archive_bytes": args.archive.stat().st_size,
        "file_count": len(selected),
        "logical_bytes": manifest["logical_bytes"],
        "secret_scan_status": "PASS",
        "secret_findings": [],
        "ignored_content_included": False,
        "manifest": manifest,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "manifest"}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
