#!/usr/bin/env python3
"""Verify the exact Government Data 1.1 rescue archive for issue #284.

The checker never extracts the archive. It validates the outer checksum, every
manifested member, safe ZIP paths, and strong credential patterns. Potential
matches are reported by category and member name only; secret values are never
printed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import stat
import zipfile
from collections import Counter, defaultdict
from pathlib import Path, PurePosixPath


SECRET_PATTERNS = {
    "PRIVATE_KEY": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "AWS_ACCESS_KEY": re.compile(rb"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b"),
    "GITHUB_TOKEN": re.compile(rb"\bgh[pousr]_[A-Za-z0-9_]{30,}\b"),
    "SLACK_TOKEN": re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    "JWT": re.compile(rb"\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b"),
    "CREDENTIAL_ASSIGNMENT": re.compile(
        rb"(?i)\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|"
        rb"auth[_-]?token|database[_-]?url|private[_-]?key)\b\s*[:=]\s*"
        rb"[\"']?(?!not[_ -]?configured|missing|unset|none|null|false|true)"
        rb"(?!process\.env\.|Deno\.env\.|os\.environ|env\[)"
        rb"[A-Za-z0-9_./+@:-]{16,}"
    ),
}


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while chunk := handle.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def safe_member_name(name: str) -> bool:
    pure = PurePosixPath(name)
    return not pure.is_absolute() and ".." not in pure.parts and "\\" not in name


def scan_chunk(pattern_hits: dict[str, int], payload: bytes) -> None:
    for category, pattern in SECRET_PATTERNS.items():
        pattern_hits[category] += len(pattern.findall(payload))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path)
    parser.add_argument("--expected-sha256", required=True)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    archive = args.archive.resolve()
    actual_archive_sha256 = sha256_file(archive)
    archive_checksum_match = actual_archive_sha256 == args.expected_sha256.lower()

    unsafe_paths: list[str] = []
    symlink_members: list[str] = []
    duplicate_members: list[str] = []
    manifest_missing: list[str] = []
    manifest_size_mismatches: list[dict[str, int | str]] = []
    manifest_hash_mismatches: list[dict[str, str]] = []
    secret_hits: dict[str, Counter[str]] = defaultdict(Counter)

    with zipfile.ZipFile(archive) as package:
        infos = package.infolist()
        counts = Counter(info.filename for info in infos)
        duplicate_members = sorted(name for name, count in counts.items() if count > 1)
        for info in infos:
            if not safe_member_name(info.filename):
                unsafe_paths.append(info.filename)
            mode = info.external_attr >> 16
            if stat.S_ISLNK(mode):
                symlink_members.append(info.filename)

        manifest_names = [
            info.filename
            for info in infos
            if not info.is_dir() and PurePosixPath(info.filename).name == "MANIFEST.json"
        ]
        if len(manifest_names) != 1:
            raise RuntimeError(f"expected one MANIFEST.json, found {manifest_names}")
        manifest_name = manifest_names[0]
        root = str(PurePosixPath(manifest_name).parent)
        manifest = json.loads(package.read(manifest_name))
        declared_files = manifest.get("files", [])
        declared_names = {f"{root}/{entry['path']}" for entry in declared_files}
        actual_files = {info.filename for info in infos if not info.is_dir()}
        raw_extra_files = sorted(actual_files - declared_names - {manifest_name})
        post_manifest_files: list[str] = []
        validation_name = f"{root}/audit/VALIDATION-RESULT.json"
        if validation_name in raw_extra_files:
            validation = json.loads(package.read(validation_name))
            if (
                validation.get("status") == "PASS"
                and validation.get("errors") == []
                and validation.get("checks", {}).get("manifest_entries") == len(declared_files)
            ):
                post_manifest_files.append(validation_name)
        extra_files = sorted(set(raw_extra_files) - set(post_manifest_files))

        info_by_name = {info.filename: info for info in infos}
        for entry in declared_files:
            member_name = f"{root}/{entry['path']}"
            info = info_by_name.get(member_name)
            if not info:
                manifest_missing.append(entry["path"])
                continue
            if info.file_size != entry["size"]:
                manifest_size_mismatches.append(
                    {
                        "path": entry["path"],
                        "manifest_size": entry["size"],
                        "archive_size": info.file_size,
                    }
                )
            digest = hashlib.sha256()
            tail = b""
            member_hits: dict[str, int] = defaultdict(int)
            with package.open(info) as handle:
                while chunk := handle.read(1024 * 1024):
                    digest.update(chunk)
                    scan_payload = tail + chunk
                    scan_chunk(member_hits, scan_payload)
                    tail = scan_payload[-512:]
            actual_sha256 = digest.hexdigest()
            if actual_sha256 != entry["sha256"]:
                manifest_hash_mismatches.append(
                    {
                        "path": entry["path"],
                        "manifest_sha256": entry["sha256"],
                        "archive_sha256": actual_sha256,
                    }
                )
            for category, count in member_hits.items():
                if count:
                    secret_hits[category][entry["path"]] += count

    secret_hit_report = {
        category: {
            "hit_count": sum(paths.values()),
            "members": sorted(paths),
        }
        for category, paths in sorted(secret_hits.items())
        if paths
    }
    integrity_pass = not any(
        [
            not archive_checksum_match,
            unsafe_paths,
            symlink_members,
            duplicate_members,
            manifest_missing,
            manifest_size_mismatches,
            manifest_hash_mismatches,
            extra_files,
        ]
    )
    payload = {
        "schema_version": "woek-issue-284-rescue-archive-check-1.0",
        "archive": archive.name,
        "archive_bytes": archive.stat().st_size,
        "archive_sha256": actual_archive_sha256,
        "expected_sha256": args.expected_sha256.lower(),
        "archive_checksum_match": archive_checksum_match,
        "zip_member_count": len(infos),
        "manifest_file_count": len(declared_files),
        "unsafe_paths": unsafe_paths,
        "symlink_members": symlink_members,
        "duplicate_members": duplicate_members,
        "manifest_missing": manifest_missing,
        "manifest_size_mismatches": manifest_size_mismatches,
        "manifest_hash_mismatches": manifest_hash_mismatches,
        "post_manifest_validation_files": post_manifest_files,
        "extra_files": extra_files,
        "strong_secret_pattern_hits": secret_hit_report,
        "integrity_status": "PASS" if integrity_pass else "FAIL",
        "secret_scan_status": "PASS" if not secret_hit_report else "REVIEW_REQUIRED",
    }
    rendered = json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0 if integrity_pass and not secret_hit_report else 1


if __name__ == "__main__":
    raise SystemExit(main())
