#!/usr/bin/env python3
"""Release gate for the Wirkungswissenschaften living routes explicitly named in #253 Batch A."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
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


def main() -> int:
    for rel in PAGES:
        path = ROOT / rel
        if not path.exists():
            raise AssertionError(f"missing required #253 Wirkungswissenschaften route: {rel}")
        text = path.read_text(encoding="utf-8", errors="replace")
        missing = [needle for needle in REQUIRED if needle not in text]
        if missing:
            raise AssertionError(f"{rel}: missing #253 state-architecture continuity: {missing}")
        print(f"PASS {rel}")
    print(f"WIRKUNGSWISSENSCHAFTEN_253_SCOPE_PASS {len(PAGES)}/{len(PAGES)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
