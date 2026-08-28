#!/usr/bin/env python3
"""Repository boundary for the current fail-closed MV Fach state."""

from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
CHECKER = ROOT / "woek-parlament-app/scripts/quality/check-mv-fach-truth-pending.mjs"

process = subprocess.run(
    ["node", str(CHECKER)],
    cwd=ROOT / "woek-parlament-app",
    check=False,
    text=True,
    capture_output=True,
)
if process.returncode:
    raise SystemExit(process.stderr.strip() or process.stdout.strip() or "MV Fach-truth gate failed")
print(process.stdout, end="")
