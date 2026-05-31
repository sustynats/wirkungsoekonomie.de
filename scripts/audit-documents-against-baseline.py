#!/usr/bin/env python3
from baseline_audit_common import count_download_like, fail_if_lower, load_baseline

baseline = load_baseline()["counts"]["documents_downloads_like"]
raise SystemExit(fail_if_lower("documents_downloads_like", count_download_like(), baseline))

