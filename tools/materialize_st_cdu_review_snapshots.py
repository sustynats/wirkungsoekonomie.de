#!/usr/bin/env python3
"""Materialize exact #234 CDU source-bound review comments for convergence.

Mechanical provenance helper only. It does not create, alter or infer Fach semantics.
It selects already-existing source-bound #234 comments by their canonical checkpoint
and writes byte-stable Markdown snapshots plus an index for PR #257 reconciliation.
"""
from __future__ import annotations

import hashlib
import json
import os
import pathlib
import sys
import urllib.request

REPO = os.environ.get("GITHUB_REPOSITORY", "sustynats/wirkungsoekonomie.de")
TOKEN = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
ISSUE = 234
OUT_DIR = pathlib.Path(
    "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/review-snapshots"
)

SHARDS = [
    ("p23-p24", "ST_CDU_PRIMARY_PARITY_P23_P24 = PASS_SEGMENT", None),
    ("p25-p28", "ST_CDU_PRIMARY_PARITY_P25_P28 = PASS_SEGMENT", None),
    ("p29-p32", "ST_CDU_PRIMARY_PARITY_P29_P32 = PASS_SEGMENT", None),
    ("p33-p36", "ST_CDU_PRIMARY_PARITY_P33_P36 = PASS_SEGMENT", None),
    ("p37-p39", "ST_CDU_PRIMARY_PARITY_P37_P39 = PASS_SEGMENT", None),
    ("p40-p42", "ST_CDU_PRIMARY_PARITY_P40_P42 = PASS_SEGMENT", None),
    ("p43-p46", "ST_CDU_PRIMARY_PARITY_P43_P46 = PASS_SEGMENT", "ST_CDU_P43_P46_NEW_OR_SPLIT_TERMINAL = PASS_36"),
    ("p47-p49", "ST_CDU_PRIMARY_PARITY_P47_P49 = PASS_SEGMENT", "ST_CDU_P47_P49_NEW_OR_SPLIT_TERMINAL = PASS_16"),
    ("p50-p53", "ST_CDU_PRIMARY_PARITY_P50_P53 = PASS_SEGMENT", None),
    ("p54-p56", "ST_CDU_PRIMARY_PARITY_P54_P56 = PASS_SEGMENT", None),
    ("p57-p59", "ST_CDU_PRIMARY_PARITY_P57_P59 = PASS_SEGMENT", None),
    ("p63-p64", "ST_CDU_PRIMARY_PARITY_P63_P64 = PASS_SEGMENT", None),
]


def api_json(url: str):
    if not TOKEN:
        raise RuntimeError("GITHUB_TOKEN/GH_TOKEN missing")
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "woek-st-cdu-convergence",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.load(response)


def fetch_all_comments():
    comments = []
    page = 1
    while True:
        batch = api_json(
            f"https://api.github.com/repos/{REPO}/issues/{ISSUE}/comments?per_page=100&page={page}&sort=created&direction=asc"
        )
        if not batch:
            break
        comments.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return comments


def choose(comments, checkpoint: str, canonical_token: str | None):
    candidates = [c for c in comments if checkpoint in (c.get("body") or "")]
    if canonical_token:
        candidates = [c for c in candidates if canonical_token in (c.get("body") or "")]
    if not candidates:
        raise RuntimeError(
            f"No #234 comment matches checkpoint={checkpoint!r}, canonical_token={canonical_token!r}"
        )
    # Later source-bound reconciliation wins for duplicate/overlapping reviews.
    candidates.sort(key=lambda c: (c.get("created_at") or "", int(c["id"])))
    return candidates[-1]


def main() -> int:
    comments = fetch_all_comments()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    index = {
        "schema_version": "1.0",
        "programme_key": "ltw-2026-st-cdu",
        "issue": 234,
        "purpose": "MECHANICAL_SOURCE_BOUND_REVIEW_PROVENANCE_FOR_GLOBAL_LEAF_RECONCILIATION",
        "fach_semantics_created": False,
        "entries": [],
    }

    for slug, checkpoint, canonical_token in SHARDS:
        c = choose(comments, checkpoint, canonical_token)
        body = (c.get("body") or "").replace("\r\n", "\n").rstrip() + "\n"
        sha = hashlib.sha256(body.encode("utf-8")).hexdigest()
        out = OUT_DIR / f"ltw-2026-st-cdu-primary-parity-{slug}-review.md"
        out.write_text(body, encoding="utf-8", newline="\n")
        index["entries"].append(
            {
                "shard": slug,
                "checkpoint": checkpoint,
                "canonical_token": canonical_token,
                "issue_comment_id": int(c["id"]),
                "issue_comment_url": c["html_url"],
                "created_at": c.get("created_at"),
                "body_sha256": sha,
                "snapshot_path": out.as_posix(),
            }
        )

    index_path = OUT_DIR / "ltw-2026-st-cdu-review-snapshot-index-v1.json"
    index_path.write_text(
        json.dumps(index, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(json.dumps(index, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
