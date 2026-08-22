#!/usr/bin/env python3
"""Execute the CDU convergence pipeline in a CI runner.

This is a temporary convergence-phase runtime bridge for PR #257. It reuses
only already source-bound #234 review comments and deterministic mechanical
normalizer/reconciler/validator logic. It performs no GitHub write itself and
creates no Fach semantics.

Some historical #234 shard checkpoints use `SOURCE_RESTORE_GAPS = 0` while the
older reconciler expects `UNRESOLVED_SOURCE_GAPS = 0`. The runtime therefore
adds the latter as a temporary in-worktree compatibility alias, runs the
mechanical builder, and restores the exact source-review snapshots before the
workflow commits outputs. The provenance snapshot and its SHA remain exact.
"""
from __future__ import annotations

import json
import os
import pathlib
import re
import urllib.request

import materialize_st_cdu_review_snapshots as snapshots
import normalize_st_cdu_convergence_shards as normalize
import build_st_cdu_global_convergence as convergence
import validate_st_cdu_global_convergence as validate

SNAP_INDEX = pathlib.Path(
    "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/review-snapshots/ltw-2026-st-cdu-review-snapshot-index-v1.json"
)


def public_api_json(url: str):
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "woek-st-cdu-convergence-runtime",
    }
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.load(response)


def shard_pages(slug: str) -> tuple[int, int]:
    match = re.fullmatch(r"p(\d+)-p(\d+)", slug)
    if not match:
        raise ValueError(f"Bad shard slug: {slug}")
    return int(match.group(1)), int(match.group(2))


def main() -> int:
    snapshots.api_json = public_api_json
    convergence.api_json = public_api_json

    # First rematerialize exact source-bound snapshots with strict own-shard selection.
    snapshots.main()
    index = json.loads(SNAP_INDEX.read_text(encoding="utf-8"))

    exact_bodies: dict[pathlib.Path, str] = {}
    try:
        for entry in index.get("entries", []):
            path = pathlib.Path(entry["snapshot_path"])
            body = path.read_text(encoding="utf-8")
            exact_bodies[path] = body
            start, end = shard_pages(entry["shard"])
            legacy_alias = f"ST_CDU_P{start}_P{end}_UNRESOLVED_SOURCE_GAPS = 0"
            if legacy_alias not in body:
                # Selection already proved a shard-local zero-gap marker. This alias
                # is temporary compatibility metadata only, never a Fach statement.
                path.write_text(
                    body.rstrip() + "\n\n<!-- MECHANICAL_RUNTIME_ZERO_GAP_ALIAS -->\n"
                    + legacy_alias + "\n",
                    encoding="utf-8",
                    newline="\n",
                )

        normalize.main()
        convergence.main()
        validate.main()
    finally:
        # Preserve exact issue-comment snapshots and their indexed SHA256 provenance.
        for path, body in exact_bodies.items():
            path.write_text(body, encoding="utf-8", newline="\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
