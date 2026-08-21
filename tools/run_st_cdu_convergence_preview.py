#!/usr/bin/env python3
"""Run the CDU convergence reconciler in an external preview build.

Mechanical execution helper only. The canonical reconciler remains
``tools/build_st_cdu_global_convergence.py``.  GitHub Actions normally supplies a
repository token; Vercel preview builds do not.  Because issue #234 and the
repository are public, this wrapper falls back to read-only unauthenticated
GitHub REST access when no token is present.  It never writes to GitHub and
never creates Fach semantics.
"""
from __future__ import annotations

import json
import os
import urllib.request

import build_st_cdu_global_convergence as convergence


def public_api_json(url: str):
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "woek-st-cdu-convergence-preview",
    }
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.load(response)


convergence.api_json = public_api_json
raise SystemExit(convergence.main())
