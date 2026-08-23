#!/usr/bin/env python3
"""Create or verify an audit manifest for a local Vercel Build Output tree."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def descriptor_hash(value: dict[str, Any]) -> str:
    hashed = dict(value)
    hashed.pop("manifest_sha256", None)
    return sha256_bytes(canonical_json(hashed))


def load_source_manifest(path: Path) -> dict[str, Any]:
    manifest = json.loads(path.read_text(encoding="utf-8"))
    if manifest.get("schema_version") != "woek-parliament-deployment-artifact-1.0":
        raise ValueError("PARLIAMENT_PREBUILT_SOURCE_MANIFEST_SCHEMA_DRIFT")
    expected = dict(manifest)
    actual_hash = expected.pop("manifest_sha256", None)
    if sha256_bytes(canonical_json(expected)) != actual_hash:
        raise ValueError("PARLIAMENT_PREBUILT_SOURCE_MANIFEST_HASH_DRIFT")
    return manifest


def file_records(output_dir: Path) -> list[dict[str, Any]]:
    if not (output_dir / "config.json").is_file():
        raise ValueError("PARLIAMENT_PREBUILT_CONFIG_MISSING")
    records: list[dict[str, Any]] = []
    for path in sorted(output_dir.rglob("*")):
        if path.is_symlink():
            raise ValueError(
                f"PARLIAMENT_PREBUILT_SYMLINK_FORBIDDEN:{path.relative_to(output_dir)}"
            )
        if not path.is_file():
            continue
        relative = path.relative_to(output_dir).as_posix()
        content = path.read_bytes()
        records.append(
            {
                "path": relative,
                "bytes": len(content),
                "sha256": sha256_bytes(content),
            }
        )
    if not records:
        raise ValueError("PARLIAMENT_PREBUILT_OUTPUT_EMPTY")
    return records


def build_manifest(
    output_dir: Path, source_manifest_path: Path
) -> dict[str, Any]:
    source = load_source_manifest(source_manifest_path)
    records = file_records(output_dir)
    config = json.loads((output_dir / "config.json").read_text(encoding="utf-8"))
    manifest: dict[str, Any] = {
        "schema_version": "woek-parliament-vercel-build-output-audit-1.0",
        "artifact_kind": "VERCEL_BUILD_OUTPUT_API_PREBUILT_EVALUATION",
        "deployment_invoked": False,
        "project": source["project"],
        "git": source["git"],
        "source_artifact": {
            "manifest_sha256": source["manifest_sha256"],
            "archive_sha256": source["archive"]["sha256"],
            "file_count": source["input"]["file_count"],
            "source_bytes": source["input"]["source_bytes"],
        },
        "build_output": {
            "version": config.get("version"),
            "file_count": len(records),
            "bytes": sum(record["bytes"] for record in records),
            "files": records,
        },
        "production_mode": "PROMOTE_SAME_TESTED_RC_WITHOUT_REBUILD",
        "hash_definition": (
            "SHA-256 of canonical JSON (UTF-8, sorted keys, compact separators) "
            "excluding manifest_sha256"
        ),
    }
    manifest["manifest_sha256"] = descriptor_hash(manifest)
    return manifest


def verify_manifest(
    output_dir: Path, source_manifest_path: Path, manifest_path: Path
) -> dict[str, Any]:
    actual = json.loads(manifest_path.read_text(encoding="utf-8"))
    if actual.get("schema_version") != "woek-parliament-vercel-build-output-audit-1.0":
        raise ValueError("PARLIAMENT_PREBUILT_MANIFEST_SCHEMA_DRIFT")
    if descriptor_hash(actual) != actual.get("manifest_sha256"):
        raise ValueError("PARLIAMENT_PREBUILT_MANIFEST_HASH_DRIFT")
    expected = build_manifest(output_dir, source_manifest_path)
    if actual != expected:
        raise ValueError("PARLIAMENT_PREBUILT_OUTPUT_DRIFT")
    return actual


def summary(manifest: dict[str, Any], status: str) -> dict[str, Any]:
    return {
        "gate": "PARLIAMENT_VERCEL_BUILD_OUTPUT_AUDIT",
        "status": status,
        "deployment_invoked": manifest["deployment_invoked"],
        "commit": manifest["git"]["commit"],
        "source_manifest_sha256": manifest["source_artifact"][
            "manifest_sha256"
        ],
        "build_output_version": manifest["build_output"]["version"],
        "file_count": manifest["build_output"]["file_count"],
        "bytes": manifest["build_output"]["bytes"],
        "manifest_sha256": manifest["manifest_sha256"],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    for command in ("build", "verify"):
        subparser = subparsers.add_parser(command)
        subparser.add_argument("--output-dir", type=Path, required=True)
        subparser.add_argument("--source-manifest", type=Path, required=True)
        subparser.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args()

    if args.command == "build":
        manifest = build_manifest(
            args.output_dir.resolve(), args.source_manifest.resolve()
        )
        args.manifest.parent.mkdir(parents=True, exist_ok=True)
        args.manifest.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        status = "PASS_BUILT"
    else:
        manifest = verify_manifest(
            args.output_dir.resolve(),
            args.source_manifest.resolve(),
            args.manifest.resolve(),
        )
        status = "PASS_VERIFIED"
    print(json.dumps(summary(manifest, status), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
