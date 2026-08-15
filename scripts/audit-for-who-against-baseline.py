#!/usr/bin/env python3
from baseline_audit_common import ROOT, fail_if_lower, load_baseline

current = len(list((ROOT / "fuer").glob("**/index.html"))) if (ROOT / "fuer").exists() else 0
baseline = load_baseline()["counts"]["for_who_pages"]
raise SystemExit(fail_if_lower("for_who_pages", current, baseline))

