#!/usr/bin/env python3
"""Repository-level entrypoint for the independent MV full-programme validator."""

from pathlib import Path
import runpy


VALIDATOR = (
    Path(__file__).resolve().parents[1]
    / "woek-parlament-app/scripts/quality/validate-mv-combined-terminal-matrix.py"
)

runpy.run_path(str(VALIDATOR), run_name="__main__")
