#!/usr/bin/env python3
from pathlib import Path

from baseline_audit_common import ROOT, fail_if_lower, load_baseline

baseline_counts = load_baseline()["counts"]
detail_pages = len(list((ROOT / "begriffe").glob("*/index.html"))) if (ROOT / "begriffe").exists() else 0
hover_text = (ROOT / "assets/js/glossaryTerms.js").read_text(encoding="utf-8", errors="ignore") if (ROOT / "assets/js/glossaryTerms.js").exists() else ""
hover_definitions = hover_text.count("definition")

status = 0
status |= fail_if_lower("glossary_detail_pages", detail_pages, baseline_counts["glossary_detail_pages"])
status |= fail_if_lower("hover_definitions_estimated", hover_definitions, baseline_counts["hover_definitions_estimated"])
raise SystemExit(status)

