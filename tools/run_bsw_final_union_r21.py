#!/usr/bin/env python3
"""Apply the explicit R21 BSW source-role closure, then run the fail-closed R20 materializer.

Source-role mechanics only. This wrapper MUST NOT create Fach judgements, DNS mappings,
Recommendations, directions, evidence grades, scores or key findings.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT_DIR = ROOT / "content/audits/sachsen-anhalt"
R20_OVERLAY = AUDIT_DIR / "bsw-final-union-relation-overlay-r20.json"
R21_CLOSURE = AUDIT_DIR / "bsw-final-union-role-closure-r21.json"
MATERIALIZER = ROOT / "tools/materialize_bsw_final_union_manifest.py"


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--relations", default="content/audits/sachsen-anhalt/bsw-final-union-relation-registry-r18.json")
    ap.add_argument("--collision-report", required=True)
    ap.add_argument("--output", required=True)
    args = ap.parse_args()

    overlay = load(R20_OVERLAY)
    closure = load(R21_CLOSURE)
    checks = closure.get("checks", {})
    pend = list(closure.get("pend_to_keep_atomic_ordinals", []))
    relation_bearing = set(closure.get("relation_bearing_ordinals", []))

    errors: list[str] = []
    if closure.get("mode") != "SOURCE_BOUND_FINAL_ROLE_ACCOUNTING_ONLY_NO_NEW_FACH":
        errors.append("R21_MODE_MISMATCH")
    if checks.get("status") != "PASS_PEND_ZERO":
        errors.append("R21_STATUS_NOT_PASS_PEND_ZERO")
    if checks.get("R10_PEND_rows") != 220 or len(pend) != 220 or len(set(pend)) != 220:
        errors.append(f"R21_PEND_SET_NOT_220_DISTINCT:{checks.get('R10_PEND_rows')}/{len(pend)}/{len(set(pend))}")
    if checks.get("pend_relation_overlap") != 0 or (set(pend) & relation_bearing):
        errors.append("R21_PEND_RELATION_OVERLAP_NOT_ZERO")
    if checks.get("final_role_counts", {}).get("PEND") != 0:
        errors.append("R21_FINAL_ROLE_PEND_NOT_ZERO")
    if errors:
        print(json.dumps({"wrapper":"ST-BSW-R21","errors":errors}, indent=2))
        return 2

    effective = json.loads(json.dumps(overlay))
    existing = dict(effective.get("historical_role_overrides", {}) or {})
    for ordinal in pend:
        existing[ordinal] = {
            "role_code": "KA",
            "basis": "R21_CLOSED_WORLD_SOURCE_ROLE_ACCOUNTING",
        }
    effective["historical_role_overrides"] = existing
    effective["overlay_id"] = "ST-BSW-FINAL-UNION-RELATION-OVERLAY-R21-EFFECTIVE"
    effective["source_role_closure"] = str(R21_CLOSURE.relative_to(ROOT))
    effective.setdefault("completion_guard", {})["historical_pend_roles_closed_from_r21"] = True
    effective["completion_guard"]["historical_pend_role_count"] = len(pend)

    tmp = ROOT / "tmp/bsw-final-union-relation-overlay-r21-effective.json"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_text(json.dumps(effective, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    cmd = [
        sys.executable,
        str(MATERIALIZER),
        "--collision-report", args.collision_report,
        "--relations", args.relations,
        "--relation-overlay", str(tmp.relative_to(ROOT)),
        "--output", args.output,
    ]
    print(json.dumps({
        "wrapper": "ST-BSW-R21",
        "explicit_pend_role_overrides": len(pend),
        "effective_overlay": str(tmp.relative_to(ROOT)),
        "materializer": str(MATERIALIZER.relative_to(ROOT)),
    }, indent=2))
    return subprocess.run(cmd, cwd=ROOT).returncode


if __name__ == "__main__":
    raise SystemExit(main())
