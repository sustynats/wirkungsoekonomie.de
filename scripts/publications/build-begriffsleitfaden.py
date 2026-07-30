#!/usr/bin/env python3
"""Build the current v1.1 guide; the archived v1.0 edition stays untouched."""
from __future__ import annotations

import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
runpy.run_path(str(ROOT / "scripts/publications/build-begriffsleitfaden-v1.1.py"), run_name="__main__")
