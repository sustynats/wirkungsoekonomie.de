#!/usr/bin/env python3
"""Wire approved #253 content sources into existing generators.

The GitHub Pages deployment workflow is now source-owned and directly carries the final #253
matrix/semantic gates. This helper therefore must not rewrite workflow YAML during CI; doing so
would create deterministic drift after checkout. It only wires the canonical glossary import.
"""
from __future__ import annotations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def patch(rel: str, old: str, new: str) -> bool:
    p = ROOT / rel
    text = p.read_text(encoding="utf-8")
    if new in text:
        return False
    if old not in text:
        raise RuntimeError(f"{rel}: integration anchor not found")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")
    return True


def main() -> int:
    changed = []
    rel = "scripts/glossary/build-glossary-registry.mjs"
    old = '  path.join(root, "content/glossary/imports/iooi-wirkungsarchitektur.json"),\n'
    new = old + '  path.join(root, "content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json"),\n'
    if patch(rel, old, new):
        changed.append(rel)

    print(f"Applied #253 build integration to {len(changed)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
