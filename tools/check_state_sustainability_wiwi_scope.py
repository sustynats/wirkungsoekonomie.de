#!/usr/bin/env python3
"""Release gate for the additional living routes explicitly named in #253 Batch A."""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CDU_CONVERGENCE_BRANCH = "woek/st-cdu-source-manifest-p89-20260821"
PAGES = [
    "verstehen/woek-auf-einer-seite/index.html",
    "wirkungswissenschaften/definition/index.html",
    "wirkungswissenschaften/wirkungsforschung/index.html",
    "wirkungswissenschaften/wirkungsoekonomie/index.html",
    "wirkungswissenschaften/methodik/index.html",
    "wirkungswissenschaften/faq/index.html",
]
REQUIRED = [
    "state-sustainability-architecture-20260821",
    "Deutschland prüft Folgen bereits",
    "Die Wirkungsökonomie ersetzt diese Architektur nicht",
    "kein automatischer Kausalitätsnachweis",
]


def run_cdu_convergence_bridge_if_needed() -> None:
    # Temporary PR #257 convergence bridge. Strictly branch-scoped and
    # mechanically source-bound; remove before PR #257 becomes merge-ready.
    branch = os.environ.get("GITHUB_HEAD_REF") or os.environ.get("GITHUB_REF_NAME") or ""
    if branch != CDU_CONVERGENCE_BRANCH:
        return
    subprocess.run(
        [sys.executable, "tools/run_st_cdu_convergence_runtime.py"],
        cwd=ROOT,
        check=True,
    )


def main() -> int:
    run_cdu_convergence_bridge_if_needed()
    for rel in PAGES:
        path = ROOT / rel
        if not path.exists():
            raise AssertionError(f"missing required #253 Batch-A living route: {rel}")
        text = path.read_text(encoding="utf-8", errors="replace")
        missing = [needle for needle in REQUIRED if needle not in text]
        if missing:
            raise AssertionError(f"{rel}: missing #253 state-architecture continuity: {missing}")
        print(f"PASS {rel}")
    print(f"BATCH_A_LIVING_SCOPE_253_PASS {len(PAGES)}/{len(PAGES)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
