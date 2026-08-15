#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "docs" / "site-baseline-pre-relaunch.json"


def load_baseline() -> dict:
    if not BASELINE.exists():
        raise SystemExit(f"Baseline missing: {BASELINE}")
    return json.loads(BASELINE.read_text(encoding="utf-8"))


def html_files(root: Path = ROOT) -> list[Path]:
    return [
        path
        for path in root.rglob("*.html")
        if ".git" not in path.parts and "node_modules" not in path.parts
    ]


def fail_if_lower(name: str, current: int, baseline: int) -> int:
    print(f"{name}: current={current} baseline={baseline}")
    if current < baseline:
        print(f"CRITICAL: {name} sank below baseline", file=sys.stderr)
        return 1
    return 0


def count_download_like(root: Path = ROOT) -> int:
    suffixes = {".pdf", ".docx", ".xlsx", ".csv", ".pptx", ".md"}
    return sum(
        1
        for path in root.rglob("*")
        if path.is_file()
        and path.suffix.lower() in suffixes
        and ".git" not in path.parts
        and "node_modules" not in path.parts
    )


def count_internal_links(root: Path = ROOT) -> int:
    total = 0
    pattern = re.compile(r"href=[\"'](?!https?:|mailto:|tel:|#)([^\"']+)")
    for path in html_files(root):
        total += len(pattern.findall(path.read_text(encoding="utf-8", errors="ignore")))
    return total


def count_search_entries(root: Path = ROOT) -> int:
    for path in [root / "assets/search/search-index.json", root / "public/data/search-index.json"]:
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
            return len(data if isinstance(data, list) else data.get("items", []))
    return 0

