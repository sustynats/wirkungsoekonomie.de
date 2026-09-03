#!/usr/bin/env python3
"""Build the deterministic root-worktree residual review artifact for #284."""

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


PATTERNS = {
    "private_key": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "github_token": re.compile(rb"\bgh[opusr]_[A-Za-z0-9_]{30,}\b"),
    "vercel_token": re.compile(rb"\b(?:vercel_[A-Za-z0-9_-]{24,}|vcp_[A-Za-z0-9_-]{24,})\b"),
    "aws_access_key": re.compile(rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "slack_token": re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    "stripe_secret": re.compile(rb"\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b"),
    "jwt": re.compile(rb"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"),
}


def details(payload: bytes) -> dict[str, Any]:
    return {
        "bytes": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
        "git_blob_oid": hashlib.sha1(
            f"blob {len(payload)}\0".encode("ascii") + payload
        ).hexdigest(),
    }


def add(archive: tarfile.TarFile, name: str, payload: bytes, mode: int = 0o644) -> None:
    info = tarfile.TarInfo(name)
    info.size = len(payload)
    info.mode = mode
    info.mtime = 0
    info.uid = info.gid = 0
    info.uname = info.gname = "root"
    archive.addfile(info, io.BytesIO(payload))


def review_group(path: str) -> tuple[str, bool]:
    if path.startswith("docs/parlament/"):
        return "PARLIAMENT_HISTORICAL_TECH_REVIEW", False
    if path.startswith("docs/wirkungscheck/"):
        return "WIRKUNGSCHECK_HISTORICAL_TECH_REVIEW", False
    if path.startswith("docs/woek-knowledge/"):
        return "CROSS_PROJECT_KNOWLEDGE_MAP_REVIEW", False
    if path.startswith("docs/institut-"):
        return "INSTITUT_HISTORICAL_ARCHITECTURE_REVIEW", False
    if path.startswith("docs/accessibility/"):
        return "ACCESSIBILITY_STANDARD_REVIEW", False
    return "CROSS_PROJECT_DOCUMENT_REVIEW", False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--worktree", type=Path, required=True)
    parser.add_argument("--audit", type=Path, required=True)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    root = args.worktree.resolve()
    audit = json.loads(args.audit.read_text(encoding="utf-8"))
    selected = [
        item
        for item in audit["items"]
        if item["classification"] == "UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED"
    ]
    findings: list[dict[str, Any]] = []
    manifest_files: list[dict[str, Any]] = []
    payloads: dict[str, bytes] = {}
    for item in selected:
        path = root / item["path"]
        metadata = path.lstat()
        if not stat.S_ISREG(metadata.st_mode):
            raise RuntimeError(f"residual path is not a regular file: {item['path']}")
        payload = path.read_bytes()
        current = details(payload)
        expected = item["working"]
        if expected.get("kind") == "dataless_placeholder":
            if current["bytes"] != expected["bytes"]:
                raise RuntimeError(
                    f"dataless working file size changed since inventory: {item['path']}"
                )
        elif current["sha256"] != expected["sha256"] or current["git_blob_oid"] != expected["git_blob_oid"]:
            raise RuntimeError(f"working file changed since inventory: {item['path']}")
        for name, pattern in PATTERNS.items():
            for match in pattern.finditer(payload):
                findings.append({"path": item["path"], "pattern": name, "byte_offset": match.start()})
        for line_number, line in enumerate(payload.splitlines(), start=1):
            if re.search(rb"(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY)\s*=\s*['\"]?[A-Za-z0-9+/=_-]{16,}", line, re.I):
                if b"process.env" not in line and b"your-" not in line.lower() and b"example" not in line.lower():
                    findings.append({"path": item["path"], "pattern": "literal_secret_assignment", "line": line_number})
        group, projection_authorized = review_group(item["path"])
        manifest_files.append(
            {
                "path": item["path"],
                "mode": stat.S_IMODE(metadata.st_mode),
                **current,
                "review_status": "INDIVIDUALLY_INVENTORIED_AND_CONTENT_REVIEWED",
                "review_group": group,
                "projection_authorized": projection_authorized,
                "initial_inventory_kind": expected.get("kind"),
            }
        )
        payloads[item["path"]] = payload

    if findings:
        raise RuntimeError(
            "secret scan failed; values suppressed: "
            + json.dumps(findings, ensure_ascii=False)
        )

    manifest = {
        "artifact": "WÖK root old dirty worktree residual documentation rescue for issue #284",
        "status": "SUPERSEDED_NON_PRODUCTION_REVIEW_ARTIFACT",
        "source_repository": "sustynats/wirkungsoekonomie.de",
        "source_local_head": audit["summary"]["old_head"],
        "compared_main": audit["summary"]["current_main"],
        "file_count": len(manifest_files),
        "logical_bytes": sum(item["bytes"] for item in manifest_files),
        "fach_dns_recommendation_projection_authorized": False,
        "deployment_authorized": False,
        "files": manifest_files,
    }
    readme = (
        "# Issue #284 residual documentation rescue\n\n"
        "This deterministic artifact preserves the final individually inventoried documentation "
        "residual from the old dirty root worktree. It is historical review material, not current "
        "architecture, not approved Fach/DNS/Recommendation content, and not deployable.\n\n"
        f"Old HEAD: `{manifest['source_local_head']}`\n\n"
        f"Compared current main: `{manifest['compared_main']}`\n\n"
        "Future recovery must be selective against current main and must verify every member with "
        "`MANIFEST.json`. No file may be projected merely because it appears in this archive.\n"
    ).encode()
    manifest_bytes = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode()

    args.archive.parent.mkdir(parents=True, exist_ok=True)
    with args.archive.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode="w", format=tarfile.PAX_FORMAT) as archive:
                add(archive, "README.md", readme)
                add(archive, "MANIFEST.json", manifest_bytes)
                for item in sorted(manifest_files, key=lambda value: value["path"]):
                    add(
                        archive,
                        f"wirkungsoekonomie.de/{item['path']}",
                        payloads[item["path"]],
                        item["mode"],
                    )

    report = {
        "archive": args.archive.name,
        "archive_sha256": hashlib.sha256(args.archive.read_bytes()).hexdigest(),
        "archive_bytes": args.archive.stat().st_size,
        "file_count": len(manifest_files),
        "logical_bytes": manifest["logical_bytes"],
        "secret_scan_status": "PASS",
        "secret_findings": [],
        "fach_dns_recommendation_projection_authorized": False,
        "manifest": manifest,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "manifest"}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
