#!/usr/bin/env python3
"""Synchronize static header and footer markup across content pages."""

from __future__ import annotations

import re
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parents[1]
HEADER_TEMPLATE = (SITE_ROOT / "templates/header.html").read_text(encoding="utf-8")
FOOTER_TEMPLATE = (SITE_ROOT / "templates/footer.html").read_text(encoding="utf-8")


HEADER_RE = re.compile(r"    <header class=\"site-header\">.*?    </header>", re.S)
FOOTER_RE = re.compile(r"    <footer class=\"footer\">.*?    </footer>", re.S)


def base_for(path: Path) -> str:
    relative_parent = path.relative_to(SITE_ROOT).parent
    if str(relative_parent) == ".":
        return ""
    return "../" * len(relative_parent.parts)


def render(template: str, base: str) -> str:
    return "\n".join(f"    {line}" if line else line for line in template.replace("{{BASE}}", base).splitlines())


def should_sync(path: Path, text: str) -> bool:
    if path.name == "404.html":
        return False
    if path.name == "index.html" and path.parent != SITE_ROOT:
        return False
    return "<header class=\"site-header\">" in text and "<footer class=\"footer\">" in text


def sync(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if not should_sync(path, text):
        return False

    base = base_for(path)
    updated = HEADER_RE.sub(render(HEADER_TEMPLATE, base), text, count=1)
    updated = FOOTER_RE.sub(render(FOOTER_TEMPLATE, base), updated, count=1)

    if updated == text:
        return False

    path.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    changed = [path for path in sorted(SITE_ROOT.rglob("*.html")) if sync(path)]
    for path in changed:
        print(path.relative_to(SITE_ROOT))
    print(f"Updated {len(changed)} files.")


if __name__ == "__main__":
    main()
