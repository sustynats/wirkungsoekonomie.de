#!/usr/bin/env python3
"""Build the current v1.2 guide; archived v1.0 and v1.1 editions stay untouched."""
from __future__ import annotations

import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
runpy.run_path(str(ROOT / "scripts/publications/build-begriffsleitfaden-v1.2.py"), run_name="__main__")
