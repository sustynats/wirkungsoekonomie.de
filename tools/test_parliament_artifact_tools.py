from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from tools import build_parliament_deployment_artifact as source_artifact
from tools import manifest_vercel_build_output as prebuilt_artifact


class ParliamentArtifactToolsTest(unittest.TestCase):
    def test_archive_paths_reject_escape_and_absolute_values(self) -> None:
        for value in ("../secret", "woek-parlament-app/../../secret", "/etc/passwd"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                source_artifact.safe_archive_path(value)

    def test_manifest_hash_excludes_only_its_own_hash(self) -> None:
        payload = {"schema_version": "test", "value": 1}
        digest = source_artifact.manifest_hash(payload)
        payload["manifest_sha256"] = digest
        self.assertEqual(source_artifact.manifest_hash(payload), digest)
        payload["value"] = 2
        self.assertNotEqual(source_artifact.manifest_hash(payload), digest)

    def test_prebuilt_manifest_binds_every_output_file_to_source(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            output = root / "output"
            output.mkdir()
            (output / "config.json").write_text(
                json.dumps({"version": 3}) + "\n", encoding="utf-8"
            )
            functions = output / "functions"
            functions.mkdir()
            (functions / "index.func").write_bytes(b"runtime")

            source = {
                "schema_version": "woek-parliament-deployment-artifact-1.0",
                "project": {
                    "name": "woek-parlament",
                    "id": "prj_test",
                    "root_directory": "woek-parlament-app",
                },
                "git": {"commit": "a" * 40, "tree": "b" * 40},
                "input": {"file_count": 2, "source_bytes": 10},
                "archive": {"sha256": "c" * 64},
            }
            source["manifest_sha256"] = source_artifact.manifest_hash(source)
            source_path = root / "source.manifest.json"
            source_path.write_text(json.dumps(source), encoding="utf-8")

            manifest = prebuilt_artifact.build_manifest(output, source_path)
            manifest_path = root / "prebuilt.manifest.json"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            verified = prebuilt_artifact.verify_manifest(
                output, source_path, manifest_path
            )
            self.assertEqual(verified["git"]["commit"], "a" * 40)
            self.assertEqual(verified["build_output"]["file_count"], 2)
            self.assertFalse(verified["deployment_invoked"])

            (functions / "index.func").write_bytes(b"changed")
            with self.assertRaises(ValueError):
                prebuilt_artifact.verify_manifest(output, source_path, manifest_path)


if __name__ == "__main__":
    unittest.main()
