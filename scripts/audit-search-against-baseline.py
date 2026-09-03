#!/usr/bin/env python3
from baseline_audit_common import count_search_entries, fail_if_lower, load_baseline

baseline = load_baseline()["counts"]["search_entries"]
raise SystemExit(fail_if_lower("search_entries", count_search_entries(), baseline))

