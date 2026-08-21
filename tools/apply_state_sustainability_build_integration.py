#!/usr/bin/env python3
"""Wire the approved #253 terms and semantic/matrix gates into existing site generators/deploy.

Idempotent source integration only: no fach content is generated here.
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

    rel = ".github/workflows/deploy.yml"
    old = '      - name: Build Parliament and Institute information pages\n        run: npm run build:parlament-info\n'
    new = '''      - name: Verify #253 state sustainability architecture
        run: |
          python tools/check_state_sustainability_architecture.py
          python tools/audit_state_sustainability_architecture_fast.py --root . --output content/audits/state-sustainability-architecture-url-matrix.json --markdown content/audits/state-sustainability-architecture-url-matrix.md
          python tools/audit_state_sustainability_support_files.py --root . --matrix content/audits/state-sustainability-architecture-url-matrix.json --markdown content/audits/state-sustainability-architecture-url-matrix.md
          git diff --exit-code -- content/audits/state-sustainability-architecture-url-matrix.json content/audits/state-sustainability-architecture-url-matrix.md
      - name: Build Parliament and Institute information pages
        run: npm run build:parlament-info
'''
    if patch(rel, old, new):
        changed.append(rel)

    print(f"Applied #253 build integration to {len(changed)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
