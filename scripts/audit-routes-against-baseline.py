#!/usr/bin/env python3
from baseline_audit_common import fail_if_lower, html_files, load_baseline

baseline = load_baseline()["counts"]["routes"]
raise SystemExit(fail_if_lower("routes", len(html_files()), baseline))

