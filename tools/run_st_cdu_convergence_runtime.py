#!/usr/bin/env python3
"""Execute the CDU convergence pipeline in any CI runner with public GitHub read access.

This is a temporary convergence-phase runtime bridge for PR #257.  It reuses
only the already source-bound #234 review snapshots/comments and the deterministic
normalizer/reconciler/validator.  It performs no GitHub write itself and creates
no Fach semantics.
"""
from __future__ import annotations

import json
import os
import urllib.request

import materialize_st_cdu_review_snapshots as snapshots
import normalize_st_cdu_convergence_shards as normalize
import build_st_cdu_global_convergence as convergence
import validate_st_cdu_global_convergence as validate


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


def main() -> int:
    snapshots.api_json = public_api_json
    convergence.api_json = public_api_json
    snapshots.main()
    normalize.main()
    convergence.main()
    validate.main()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
