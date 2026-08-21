#!/usr/bin/env python3
"""Restore protected historical pages to the exact committed publication state.

Several broad site generators normalize current UI structures across all HTML files.
The three #253 historical concept publications are an explicit exception: their
original prose is immutable and current semantics are supplied only through dated
addenda.  The committed page is therefore the canonical build input and is restored
after broad generators have run.
"""
from __future__ import annotations

import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROTECTED_PATHS = (
    "wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/index.html",
    "werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung/index.html",
    "werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/politische-wirkungspruefung/index.html",
)


def committed_bytes(relative: str) -> bytes:
    result = subprocess.run(
        ["git", "show", f"HEAD:{relative}"],
        cwd=ROOT,
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode:
        raise RuntimeError(
            f"cannot restore protected historical publication {relative}: "
            f"{result.stderr.decode('utf-8', errors='replace').strip()}"
        )
    return result.stdout


def main() -> int:
    changed = []
    for relative in PROTECTED_PATHS:
        path = ROOT / relative
        expected = committed_bytes(relative)
        if not path.exists() or path.read_bytes() != expected:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(expected)
            changed.append(relative)
    print(f"Restored {len(changed)} protected historical #253 publication(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
