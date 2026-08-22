#!/usr/bin/env python3
"""Materialize exact canonical #234 CDU source-bound review comments.

Mechanical provenance helper only. It does not create, alter or infer Fach semantics.
Selection requires the shard's own PASS checkpoint and an exact shard-local zero-gap
marker, so a later continuation comment cannot be mistaken for the reviewed shard it cites.
"""
from __future__ import annotations

import hashlib
import json
import os
import pathlib
import re
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

ZERO_GAP_SUFFIXES = (
    "UNRESOLVED_SOURCE_GAPS",
    "SOURCE_RESTORE_GAPS",
    "SOURCE_GAPS",
)


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


def page_pair(slug: str) -> tuple[int, int]:
    match = re.fullmatch(r"p(\d+)-p(\d+)", slug)
    if not match:
        raise ValueError(f"Bad shard slug: {slug}")
    return int(match.group(1)), int(match.group(2))


def exact_zero_gap_token(body: str, slug: str) -> str | None:
    start, end = page_pair(slug)
    for suffix in ZERO_GAP_SUFFIXES:
        pattern = rf"ST_CDU_P{start}_P{end}_{suffix}\s*=\s*0\b"
        match = re.search(pattern, body)
        if match:
            return match.group(0)
    return None


def choose(comments, slug: str, checkpoint: str, canonical_token: str | None):
    candidates = []
    for c in comments:
        body = c.get("body") or ""
        if checkpoint not in body:
            continue
        zero_gap_token = exact_zero_gap_token(body, slug)
        if not zero_gap_token:
            continue
        if canonical_token and canonical_token not in body:
            continue
        candidates.append((c, zero_gap_token))
    if not candidates:
        raise RuntimeError(
            f"No #234 comment matches shard={slug!r}, checkpoint={checkpoint!r}, exact shard-local zero-gap marker, canonical_token={canonical_token!r}"
        )
    candidates.sort(key=lambda pair: (pair[0].get("created_at") or "", int(pair[0]["id"])))
    selected, zero_gap_token = candidates[-1]
    return selected, zero_gap_token, [int(c["id"]) for c, _ in candidates]


def main() -> int:
    comments = fetch_all_comments()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    index = {
        "schema_version": "1.2",
        "programme_key": "ltw-2026-st-cdu",
        "issue": 234,
        "purpose": "MECHANICAL_SOURCE_BOUND_REVIEW_PROVENANCE_FOR_GLOBAL_LEAF_RECONCILIATION",
        "selection_rule": "OWN_PASS_CHECKPOINT_AND_EXACT_SHARD_LOCAL_ZERO_GAP_MARKER_PLUS_CANONICAL_TOKEN_WHERE_REQUIRED",
        "zero_gap_suffixes_accepted": list(ZERO_GAP_SUFFIXES),
        "fach_semantics_created": False,
        "entries": [],
    }

    for slug, checkpoint, canonical_token in SHARDS:
        c, zero_gap_token, candidate_ids = choose(comments, slug, checkpoint, canonical_token)
        body = (c.get("body") or "").replace("\r\n", "\n").rstrip() + "\n"
        sha = hashlib.sha256(body.encode("utf-8")).hexdigest()
        out = OUT_DIR / f"ltw-2026-st-cdu-primary-parity-{slug}-review.md"
        out.write_text(body, encoding="utf-8", newline="\n")
        index["entries"].append(
            {
                "shard": slug,
                "checkpoint": checkpoint,
                "zero_gap_token": zero_gap_token,
                "canonical_token": canonical_token,
                "matching_candidate_ids": candidate_ids,
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
