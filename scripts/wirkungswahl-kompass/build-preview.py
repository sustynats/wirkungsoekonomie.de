#!/usr/bin/env python3
"""Build the self-contained, non-indexed Wirkungswahl-Kompass preview.

Political copy never originates in this script or the browser UI. It is
validated first and then injected unchanged from the approved JSON dataset.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CONTENT_DIR = ROOT / "content" / "wirkungswahl-kompass"
COMPONENT_DIR = ROOT / "components" / "wirkungswahl-kompass"
CONTENT = CONTENT_DIR / "real-content.json"
VALIDATOR = CONTENT_DIR / "validate_content.py"
TEMPLATE = COMPONENT_DIR / "template.html"
LOGIC = COMPONENT_DIR / "logic.js"
APP = COMPONENT_DIR / "app.js"
OUTPUT = ROOT / "werkzeuge" / "wirkungswahl-kompass" / "index.html"


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def main() -> None:
    run([sys.executable, str(VALIDATOR), str(CONTENT)])
    run(["node", "--check", str(LOGIC)])
    run(["node", "--check", str(APP)])

    data = json.loads(read(CONTENT))
    data_json = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    template = read(TEMPLATE)
    replacements = {
        "/*__DATA__*/": data_json,
        "/*__LOGIC__*/": read(LOGIC),
        "/*__APP__*/": read(APP),
    }

    for placeholder, replacement in replacements.items():
        if template.count(placeholder) != 1:
            raise SystemExit(f"Template placeholder missing or duplicated: {placeholder}")
        template = template.replace(placeholder, replacement)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(template, encoding="utf-8")
    print(f"Built {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
