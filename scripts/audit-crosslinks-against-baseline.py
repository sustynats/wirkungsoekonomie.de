#!/usr/bin/env python3
from baseline_audit_common import count_internal_links, fail_if_lower, load_baseline

baseline = load_baseline()["counts"]["internal_links_estimated"]
raise SystemExit(fail_if_lower("internal_links_estimated", count_internal_links(), baseline))

