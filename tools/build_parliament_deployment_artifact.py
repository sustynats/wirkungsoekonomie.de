#!/usr/bin/env python3
"""Build and verify the minimal exact-commit Parliament deployment artifact.

Git is the only source of artifact bytes. The working tree is never copied, so
untracked files, build outputs and unrelated monorepo trees cannot enter the
archive. The archive keeps the repository-root layout required by the existing
Vercel project Root Directory.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import io
import json
import subprocess
import tarfile
import tempfile
from pathlib import Path, PurePosixPath
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_POLICY = ROOT / "ops/parliament-deployment-artifact-policy.json"
TOOL_PATH = "tools/build_parliament_deployment_artifact.py"


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def manifest_hash(value: dict[str, Any]) -> str:
    hashed = dict(value)
    hashed.pop("manifest_sha256", None)
    return sha256_bytes(canonical_json(hashed))


def git(*args: str, input_bytes: bytes | None = None) -> bytes:
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        input=input_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        detail = result.stderr.decode("utf-8", errors="replace").strip()
        raise ValueError(f"GIT_COMMAND_FAILED:{' '.join(args)}:{detail}")
    return result.stdout


def resolve_commit(value: str) -> str:
    commit = git("rev-parse", "--verify", f"{value}^{{commit}}").decode().strip()
    if len(commit) != 40:
        raise ValueError(f"PARLIAMENT_ARTIFACT_INVALID_COMMIT:{value}")
    return commit


def assert_tracked_clean() -> None:
    dirty = git("status", "--porcelain", "--untracked-files=no").decode().strip()
    if dirty:
        raise ValueError("PARLIAMENT_ARTIFACT_TRACKED_WORKTREE_DIRTY")


def load_policy(path: Path) -> tuple[dict[str, Any], bytes]:
    raw = path.read_bytes()
    policy = json.loads(raw)
    if policy.get("schema_version") != "woek-parliament-deployment-artifact-policy-1.0":
        raise ValueError("PARLIAMENT_ARTIFACT_POLICY_SCHEMA_UNSUPPORTED")
    project = policy.get("project", {})
    if project.get("name") != "woek-parlament":
        raise ValueError("PARLIAMENT_ARTIFACT_PROJECT_DRIFT")
    if project.get("root_directory") != "woek-parlament-app":
        raise ValueError("PARLIAMENT_ARTIFACT_ROOT_DIRECTORY_DRIFT")
    inputs = [entry.get("path") for entry in policy.get("source_inputs", [])]
    if inputs != ["woek-parlament-app", "datenschutz.html"]:
        raise ValueError("PARLIAMENT_ARTIFACT_SOURCE_INPUT_DRIFT")
    if policy.get("allowed_top_level_entries") != [
        "datenschutz.html",
        "woek-parlament-app",
    ]:
        raise ValueError("PARLIAMENT_ARTIFACT_ALLOWED_TOP_LEVEL_DRIFT")
    if policy.get("vercel_contract", {}).get(
        "production_mode"
    ) != "PROMOTE_SAME_TESTED_RC_WITHOUT_REBUILD":
        raise ValueError("PARLIAMENT_ARTIFACT_PROMOTION_CONTRACT_DRIFT")
    return policy, raw


def safe_archive_path(value: str) -> str:
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts or not path.parts:
        raise ValueError(f"PARLIAMENT_ARTIFACT_UNSAFE_PATH:{value}")
    return path.as_posix().rstrip("/")


def archive_records(raw_tar: bytes) -> tuple[list[dict[str, Any]], list[str]]:
    files: list[dict[str, Any]] = []
    top_levels: set[str] = set()
    with tarfile.open(fileobj=io.BytesIO(raw_tar), mode="r:") as archive:
        for member in archive.getmembers():
            path = safe_archive_path(member.name)
            top_levels.add(PurePosixPath(path).parts[0])
            if member.issym() or member.islnk():
                raise ValueError(f"PARLIAMENT_ARTIFACT_LINK_FORBIDDEN:{path}")
            if not member.isfile():
                continue
            source = archive.extractfile(member)
            if source is None:
                raise ValueError(f"PARLIAMENT_ARTIFACT_FILE_UNREADABLE:{path}")
            content = source.read()
            files.append(
                {
                    "path": path,
                    "bytes": len(content),
                    "mode": f"{member.mode & 0o777:04o}",
                    "sha256": sha256_bytes(content),
                }
            )
    files.sort(key=lambda item: item["path"])
    return files, sorted(top_levels)


def deterministic_tgz(raw_tar: bytes) -> bytes:
    output = io.BytesIO()
    with gzip.GzipFile(
        filename="",
        mode="wb",
        compresslevel=9,
        fileobj=output,
        mtime=0,
    ) as compressed:
        compressed.write(raw_tar)
    return output.getvalue()


def build_bytes(commit: str, includes: list[str]) -> tuple[bytes, bytes]:
    raw_tar = git("archive", "--format=tar", commit, "--", *includes)
    embedded_commit = git("get-tar-commit-id", input_bytes=raw_tar).decode().strip()
    if embedded_commit != commit:
        raise ValueError(
            f"PARLIAMENT_ARTIFACT_GIT_IDENTITY_DRIFT:{embedded_commit}:{commit}"
        )
    return raw_tar, deterministic_tgz(raw_tar)


def build_manifest(
    *,
    commit: str,
    policy: dict[str, Any],
    policy_bytes: bytes,
    archive_name: str,
    archive_bytes: bytes,
    raw_tar: bytes,
) -> dict[str, Any]:
    files, top_levels = archive_records(raw_tar)
    allowed = policy["allowed_top_level_entries"]
    if top_levels != allowed:
        raise ValueError(
            "PARLIAMENT_ARTIFACT_TOP_LEVEL_DRIFT:"
            f"actual={top_levels}:expected={allowed}"
        )
    forbidden = set(policy["forbidden_top_level_entries"])
    present_forbidden = sorted(forbidden.intersection(top_levels))
    if present_forbidden:
        raise ValueError(
            f"PARLIAMENT_ARTIFACT_FORBIDDEN_TREES:{','.join(present_forbidden)}"
        )
    paths = {entry["path"] for entry in files}
    if "datenschutz.html" not in paths:
        raise ValueError("PARLIAMENT_ARTIFACT_PRIVACY_DEPENDENCY_MISSING")
    if not any(path.startswith("woek-parlament-app/") for path in paths):
        raise ValueError("PARLIAMENT_ARTIFACT_APP_MISSING")

    tracked = {
        line
        for line in git(
            "ls-tree",
            "-r",
            "--name-only",
            commit,
            "--",
            *[entry["path"] for entry in policy["source_inputs"]],
        )
        .decode("utf-8")
        .splitlines()
        if line
    }
    if paths != tracked:
        missing = sorted(tracked - paths)
        unexpected = sorted(paths - tracked)
        raise ValueError(
            "PARLIAMENT_ARTIFACT_GIT_FILE_SET_DRIFT:"
            f"missing={missing[:5]}:unexpected={unexpected[:5]}"
        )

    manifest: dict[str, Any] = {
        "schema_version": "woek-parliament-deployment-artifact-1.0",
        "artifact_kind": "MINIMAL_EXACT_COMMIT_SOURCE_TGZ",
        "canonical_source": policy["canonical_source"],
        "project": policy["project"],
        "git": {
            "commit": commit,
            "tree": git("rev-parse", f"{commit}^{{tree}}").decode().strip(),
            "identity_embedded_in_archive": True,
        },
        "policy": {
            "path": str(DEFAULT_POLICY.relative_to(ROOT)),
            "sha256": sha256_bytes(policy_bytes),
            "schema_version": policy["schema_version"],
        },
        "input": {
            "source_inputs": policy["source_inputs"],
            "top_level_entries": top_levels,
            "file_count": len(files),
            "source_bytes": sum(entry["bytes"] for entry in files),
            "files": files,
            "forbidden_top_level_entries_present": [],
        },
        "archive": {
            "name": archive_name,
            "format": "tgz",
            "bytes": len(archive_bytes),
            "sha256": sha256_bytes(archive_bytes),
            "deterministic_gzip_mtime": 0,
        },
        "vercel_contract": policy["vercel_contract"],
        "generated_by": TOOL_PATH,
        "hash_definition": (
            "SHA-256 of canonical JSON (UTF-8, sorted keys, compact separators) "
            "excluding manifest_sha256"
        ),
    }
    manifest["manifest_sha256"] = manifest_hash(manifest)
    return manifest


def write_artifact(
    *,
    commit_value: str,
    output_dir: Path,
    policy_path: Path,
    require_clean: bool,
    verify_reproducible: bool,
) -> tuple[Path, Path, Path, dict[str, Any]]:
    commit = resolve_commit(commit_value)
    if require_clean:
        assert_tracked_clean()
    policy, policy_bytes = load_policy(policy_path)
    includes = [entry["path"] for entry in policy["source_inputs"]]
    raw_tar, compressed = build_bytes(commit, includes)
    if verify_reproducible:
        second_raw_tar, second_compressed = build_bytes(commit, includes)
        if raw_tar != second_raw_tar or compressed != second_compressed:
            raise ValueError("PARLIAMENT_ARTIFACT_REPRODUCIBILITY_FAILED")

    archive_name = f"woek-parlament-minimal-source-{commit}.tgz"
    manifest_name = f"woek-parlament-minimal-source-{commit}.manifest.json"
    checksums_name = f"woek-parlament-minimal-source-{commit}.sha256"
    manifest = build_manifest(
        commit=commit,
        policy=policy,
        policy_bytes=policy_bytes,
        archive_name=archive_name,
        archive_bytes=compressed,
        raw_tar=raw_tar,
    )

    output_dir.mkdir(parents=True, exist_ok=True)
    archive_path = output_dir / archive_name
    manifest_path = output_dir / manifest_name
    checksums_path = output_dir / checksums_name
    archive_path.write_bytes(compressed)
    manifest_bytes = (
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")
    manifest_path.write_bytes(manifest_bytes)
    checksums_path.write_text(
        f"{manifest['archive']['sha256']}  {archive_name}\n"
        f"{sha256_bytes(manifest_bytes)}  {manifest_name}\n",
        encoding="utf-8",
        newline="\n",
    )
    return archive_path, manifest_path, checksums_path, manifest


def verify_artifact(
    *, manifest_path: Path, archive_path: Path, policy_path: Path
) -> dict[str, Any]:
    policy, policy_bytes = load_policy(policy_path)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schema_version") != "woek-parliament-deployment-artifact-1.0":
        raise ValueError("PARLIAMENT_ARTIFACT_MANIFEST_SCHEMA_UNSUPPORTED")
    if manifest_hash(manifest) != manifest.get("manifest_sha256"):
        raise ValueError("PARLIAMENT_ARTIFACT_MANIFEST_HASH_DRIFT")
    if manifest.get("policy", {}).get("sha256") != sha256_bytes(policy_bytes):
        raise ValueError("PARLIAMENT_ARTIFACT_POLICY_HASH_DRIFT")
    archive_bytes = archive_path.read_bytes()
    if len(archive_bytes) != manifest.get("archive", {}).get("bytes"):
        raise ValueError("PARLIAMENT_ARTIFACT_ARCHIVE_SIZE_DRIFT")
    if sha256_bytes(archive_bytes) != manifest.get("archive", {}).get("sha256"):
        raise ValueError("PARLIAMENT_ARTIFACT_ARCHIVE_HASH_DRIFT")

    raw_tar = gzip.decompress(archive_bytes)
    embedded_commit = git("get-tar-commit-id", input_bytes=raw_tar).decode().strip()
    if embedded_commit != manifest.get("git", {}).get("commit"):
        raise ValueError("PARLIAMENT_ARTIFACT_EMBEDDED_COMMIT_DRIFT")
    files, top_levels = archive_records(raw_tar)
    expected_input = manifest.get("input", {})
    if files != expected_input.get("files"):
        raise ValueError("PARLIAMENT_ARTIFACT_FILE_MANIFEST_DRIFT")
    if top_levels != expected_input.get("top_level_entries"):
        raise ValueError("PARLIAMENT_ARTIFACT_TOP_LEVEL_MANIFEST_DRIFT")
    if top_levels != policy["allowed_top_level_entries"]:
        raise ValueError("PARLIAMENT_ARTIFACT_POLICY_TOP_LEVEL_DRIFT")
    if len(files) != expected_input.get("file_count"):
        raise ValueError("PARLIAMENT_ARTIFACT_FILE_COUNT_DRIFT")
    if sum(entry["bytes"] for entry in files) != expected_input.get("source_bytes"):
        raise ValueError("PARLIAMENT_ARTIFACT_SOURCE_BYTES_DRIFT")
    if expected_input.get("forbidden_top_level_entries_present") != []:
        raise ValueError("PARLIAMENT_ARTIFACT_FORBIDDEN_TREE_MANIFEST_DRIFT")
    return manifest


def summary(manifest: dict[str, Any], *, status: str) -> dict[str, Any]:
    return {
        "gate": "PARLIAMENT_MINIMAL_DEPLOYMENT_ARTIFACT",
        "status": status,
        "project": manifest["project"]["name"],
        "root_directory": manifest["project"]["root_directory"],
        "commit": manifest["git"]["commit"],
        "tree": manifest["git"]["tree"],
        "file_count": manifest["input"]["file_count"],
        "source_bytes": manifest["input"]["source_bytes"],
        "archive_bytes": manifest["archive"]["bytes"],
        "archive_sha256": manifest["archive"]["sha256"],
        "manifest_sha256": manifest["manifest_sha256"],
        "top_level_entries": manifest["input"]["top_level_entries"],
        "forbidden_top_level_entries_present": manifest["input"][
            "forbidden_top_level_entries_present"
        ],
        "production_mode": manifest["vercel_contract"]["production_mode"],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY)
    subparsers = parser.add_subparsers(dest="command", required=True)

    build = subparsers.add_parser("build")
    build.add_argument("--commit", default="HEAD")
    build.add_argument("--output-dir", type=Path, required=True)
    build.add_argument("--require-clean", action="store_true")
    build.add_argument("--verify-reproducible", action="store_true")

    verify = subparsers.add_parser("verify")
    verify.add_argument("--manifest", type=Path, required=True)
    verify.add_argument("--archive", type=Path, required=True)

    check = subparsers.add_parser("check")
    check.add_argument("--commit", default="HEAD")
    check.add_argument("--require-clean", action="store_true")

    args = parser.parse_args()
    policy_path = args.policy.resolve()
    if args.command == "build":
        archive_path, manifest_path, checksums_path, manifest = write_artifact(
            commit_value=args.commit,
            output_dir=args.output_dir.resolve(),
            policy_path=policy_path,
            require_clean=args.require_clean,
            verify_reproducible=args.verify_reproducible,
        )
        result = summary(manifest, status="PASS_BUILT_AND_REPRODUCIBLE")
        result["archive"] = str(archive_path)
        result["manifest"] = str(manifest_path)
        result["checksums"] = str(checksums_path)
    elif args.command == "verify":
        manifest = verify_artifact(
            manifest_path=args.manifest.resolve(),
            archive_path=args.archive.resolve(),
            policy_path=policy_path,
        )
        result = summary(manifest, status="PASS_VERIFIED")
    else:
        with tempfile.TemporaryDirectory(prefix="woek-parliament-artifact-check-") as tmp:
            archive_path, manifest_path, _, built = write_artifact(
                commit_value=args.commit,
                output_dir=Path(tmp),
                policy_path=policy_path,
                require_clean=args.require_clean,
                verify_reproducible=True,
            )
            verified = verify_artifact(
                manifest_path=manifest_path,
                archive_path=archive_path,
                policy_path=policy_path,
            )
            if built != verified:
                raise ValueError("PARLIAMENT_ARTIFACT_BUILD_VERIFY_DRIFT")
            result = summary(verified, status="PASS_REPRODUCIBLE_AND_VERIFIED")

    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
