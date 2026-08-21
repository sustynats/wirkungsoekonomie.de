#!/usr/bin/env python3
"""Project the approved #253 state-architecture block onto the required Wirkungswissenschaften living routes.

These pages are explicitly named in the #253 Batch-A fach audit. The text itself is imported
from the canonical deterministic projection helper so no new Fach judgement is synthesized here.
"""
from __future__ import annotations

from apply_state_sustainability_architecture import MARKER, STATE_BLOCK, add_before_main

PAGES = [
    "wirkungswissenschaften/definition/index.html",
    "wirkungswissenschaften/wirkungsforschung/index.html",
    "wirkungswissenschaften/wirkungsoekonomie/index.html",
    "wirkungswissenschaften/methodik/index.html",
    "wirkungswissenschaften/faq/index.html",
]


def main() -> int:
    changed = []
    for rel in PAGES:
        if add_before_main(rel, STATE_BLOCK, MARKER):
            changed.append(rel)
    print(f"Applied #253 Wirkungswissenschaften continuity block to {len(changed)} files")
    for rel in changed:
        print(rel)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
