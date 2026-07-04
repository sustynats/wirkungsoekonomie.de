#!/usr/bin/env python3
"""Synchronize static header and footer markup across content pages."""

from __future__ import annotations

import json
import re
from html import escape
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parents[1]
NAVIGATION = json.loads((SITE_ROOT / "assets/data/navigation.json").read_text(encoding="utf-8"))
HEADER_TEMPLATE = (SITE_ROOT / "templates/header.html").read_text(encoding="utf-8")
FOOTER_TEMPLATE = (SITE_ROOT / "templates/footer.html").read_text(encoding="utf-8")
SYNC_EXCLUDED_DIRS = {
    ".git",
    ".cache",
    ".codex-backup",
    "_site",
    "node_modules",
    "outputs",
    ".next",
    ".vercel",
    "__pycache__",
}
HEADER_UTILITY_LABELS = {"Suche", "WÖk-KI", "Mein Wirkungsraum"}


HEADER_RE = re.compile(r"\s*<header class=\"site-header\"[^>]*>.*?</header>", re.S)
FOOTER_RE = re.compile(r"\s*<footer class=\"footer\"[^>]*>.*?</footer>", re.S)


def base_for(path: Path) -> str:
    relative_parent = path.relative_to(SITE_ROOT).parent
    if str(relative_parent) == ".":
        return ""
    return "../" * len(relative_parent.parts)


def nav_match(item: dict[str, object]) -> str:
    return "|".join(str(token) for token in item.get("match", []))


def nav_link(item: dict[str, object], base: str) -> str:
    label = escape(str(item["label"]))
    href = escape(f"{base}{item['href']}", quote=True)
    match = escape(nav_match(item), quote=True)
    return f'<a href="{href}" data-nav-match="{match}">{label}</a>'


def nav_links(items: list[dict[str, object]], base: str) -> str:
    return "\n".join(nav_link(item, base) for item in items)


def nav_slug(label: str) -> str:
    return (
        label.lower()
        .replace("ö", "oe")
        .replace("ä", "ae")
        .replace("ü", "ue")
        .replace("ß", "ss")
        .replace("&", "und")
        .replace("/", "-")
        .replace("?", "")
        .replace(" ", "-")
    )


def header_item(item: dict[str, object], base: str) -> str:
    children_ref = item.get("childrenRef")
    if not children_ref:
        return nav_link(item, base)

    children = NAVIGATION[str(children_ref)]
    label = escape(str(item["label"]))
    match = escape(nav_match(item), quote=True)
    slug = escape(nav_slug(str(item["label"])), quote=True)
    panel = "\n".join(f"        {line}" for line in nav_links(children, base).splitlines())
    return (
        f'<details class="nav-more nav-{slug}" data-nav-match="{match}">\n'
        f"  <summary>{label}</summary>\n"
        f'  <div class="nav-more-panel">\n'
        f"{panel}\n"
        f"  </div>\n"
        f"</details>"
    )


def header_nav(base: str) -> str:
    return "\n".join(header_item(item, base) for item in NAVIGATION["header"])


def header_utility_items() -> list[dict[str, object]]:
    return [item for item in NAVIGATION.get("more", []) if str(item.get("label")) in HEADER_UTILITY_LABELS]


def header_utility_link(item: dict[str, object], base: str) -> str:
    label = escape(str(item["label"]))
    href = escape(f"{base}{item['href']}", quote=True)
    match = escape(nav_match(item), quote=True)
    slug = escape(nav_slug(str(item["label"])), quote=True)
    primary = ' data-utility-primary="true"' if label == "Mein Wirkungsraum" else ""
    return (
        f'<a class="site-utility-link site-utility-link--{slug}" href="{href}" '
        f'data-nav-match="{match}" data-utility-label="{label}"{primary}>{label}</a>'
    )


def header_utility_nav(base: str) -> str:
    language = (
        f'<a class="site-utility-link site-utility-link--language" href="{escape(base, quote=True)}en/" '
        'hreflang="en" lang="en" data-lang-switch="en" data-utility-label="English">EN</a>'
    )
    return "\n".join([*(header_utility_link(item, base) for item in header_utility_items()), language])


def footer_group(group: dict[str, object], base: str) -> str:
    title = escape(str(group["title"]))
    links = "\n".join(f"      {line}" for line in nav_links(group["items"], base).splitlines())
    return (
        '<div class="footer-nav-group">\n'
        f"  <h3>{title}</h3>\n"
        '  <div class="footer-nav-links">\n'
        f"{links}\n"
        "  </div>\n"
        "</div>"
    )


def footer_nav(base: str) -> str:
    return "\n".join(footer_group(group, base) for group in NAVIGATION["footerGroups"])


def render(template: str, base: str) -> str:
    rendered = (
        template.replace("{{BASE}}", base)
        .replace("{{HEADER_NAV}}", header_nav(base))
        .replace("{{HEADER_UTILITY_NAV}}", header_utility_nav(base))
        .replace("{{FOOTER_NAV}}", footer_nav(base))
        .replace("{{FOOTER_LEGAL_NAV}}", nav_links(NAVIGATION["footerLegal"], base))
    )
    return "\n".join(f"    {line}" if line else line for line in rendered.splitlines())


def insert_footer(text: str, footer: str) -> str:
    main_end = text.rfind("</main>")
    if main_end != -1:
        insert_at = main_end + len("</main>")
        return f"{text[:insert_at]}{footer}{text[insert_at:]}"
    if "</body>" in text:
        return text.replace("</body>", f"{footer}\n</body>", 1)
    return text + footer


def should_sync(path: Path, text: str) -> bool:
    relative_parts = path.relative_to(SITE_ROOT).parts
    if any(part in SYNC_EXCLUDED_DIRS for part in relative_parts):
        return False
    if relative_parts[0] == "en":
        return False
    if path.name == "404.html":
        return False
    if relative_parts[0] in {"templates"}:
        return False
    return "<header class=\"site-header\"" in text


def sync(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if not should_sync(path, text):
        return False

    base = base_for(path)
    updated = HEADER_RE.sub("\n" + render(HEADER_TEMPLATE, base), text, count=1)
    footer = "\n" + render(FOOTER_TEMPLATE, base)
    if FOOTER_RE.search(updated):
        updated = FOOTER_RE.sub("", updated, count=1)
    updated = insert_footer(updated, footer)

    if updated == text:
        return False

    path.write_text(updated, encoding="utf-8")
    return True


def iter_source_html() -> list[Path]:
    files: list[Path] = []
    stack = [SITE_ROOT]
    while stack:
        directory = stack.pop()
        for path in directory.iterdir():
            if path.is_symlink():
                continue
            if path.is_dir():
                if path.name not in SYNC_EXCLUDED_DIRS:
                    stack.append(path)
            elif path.suffix == ".html":
                files.append(path)
    return sorted(files)


def main() -> None:
    changed = [path for path in iter_source_html() if sync(path)]
    for path in changed:
        print(path.relative_to(SITE_ROOT))
    print(f"Updated {len(changed)} files.")

    import build_search_index

    build_search_index.main()


if __name__ == "__main__":
    main()
