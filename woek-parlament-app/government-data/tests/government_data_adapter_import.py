"""Local import shim for the standalone package test layout."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


path = Path(__file__).resolve().parents[1] / "scripts" / "ingest" / "adapters_1_1.py"
spec = importlib.util.spec_from_file_location("woek_adapters_1_1", path)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Adapter module cannot be loaded: {path}")
adapters = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = adapters
spec.loader.exec_module(adapters)
