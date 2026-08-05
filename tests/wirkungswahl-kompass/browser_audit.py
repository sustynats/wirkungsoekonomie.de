#!/usr/bin/env python3
"""Browser smoke, privacy, responsive, and dialog checks for the preview.

Requires the optional Playwright dependency from requirements-test.txt and a
local Chromium binary installed with ``playwright install chromium``.
"""
from __future__ import annotations

import json
import os
import threading
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[2]
BASE_PATH = "/werkzeuge/wirkungswahl-kompass/"
WIDTHS = [360, 485, 768, 1440]
ROUTES = [
    "#/",
    "#/methodik",
    "#/datenschutz",
    "#/fragen",
    "#/profil",
    "#/ergebnis",
    "#/partei/A",
    "#/thema/Q05",
    "#/vergleich",
    "#/transparenz",
    "#/teilen",
]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:  # noqa: A003
        return


@contextmanager
def local_server():
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}{BASE_PATH}"
    finally:
        server.shutdown()
        thread.join(timeout=5)


def set_complete_local_state(page) -> None:
    page.evaluate(
        """() => {
          S.answers = {};
          Q.forEach((question, index) => {
            S.answers[question.id] = { value: (index % 5) - 2, importance: index % 4 };
          });
          S.compare = ['cdu_csu', 'spd', 'gruene'];
          S.compareField = 'A';
          S.reveal = true;
          S.qi = Q.length - 1;
          save();
          render();
        }""",
    )


def main() -> None:
    output = ROOT / "werkzeuge" / "wirkungswahl-kompass" / "index.html"
    if not output.exists():
        raise SystemExit("Build the preview first: python scripts/wirkungswahl-kompass/build-preview.py")

    errors: list[str] = []
    results: list[dict[str, object]] = []

    with local_server() as base_url, sync_playwright() as playwright:
        executable = os.environ.get("CHROMIUM_EXECUTABLE")
        launch_options = {"headless": True}
        if executable:
            launch_options["executable_path"] = executable
        browser = playwright.chromium.launch(**launch_options)
        for width in WIDTHS:
            page = browser.new_page(viewport={"width": width, "height": 900})
            console_errors: list[str] = []
            requests: list[str] = []
            page.on(
                "console",
                lambda message: console_errors.append(message.text)
                if message.type == "error" and "frame-ancestors' is ignored when delivered via a <meta> element" not in message.text
                else None,
            )
            page.on("pageerror", lambda exception: console_errors.append(str(exception)))
            page.on("request", lambda request: requests.append(request.url))

            page.goto(base_url, wait_until="load")
            set_complete_local_state(page)
            for route in ROUTES:
                page.evaluate("route => { location.hash = route; }", route)
                page.wait_for_timeout(50)
                measure = page.evaluate(
                    """() => ({
                      inner: window.innerWidth,
                      documentWidth: document.documentElement.scrollWidth,
                      bodyWidth: document.body.scrollWidth,
                      visible: document.querySelector('#view')?.innerText.length > 0,
                      draftNote: document.querySelector('.demo-note')?.innerText.includes('Redaktioneller Arbeitsstand')
                    })""",
                )
                overflow = max(measure["documentWidth"], measure["bodyWidth"]) - measure["inner"]
                result = {
                    "width": width,
                    "route": route,
                    "overflow": overflow,
                    "visible": measure["visible"],
                    "draftNote": measure["draftNote"],
                }
                results.append(result)
                if overflow > 1:
                    errors.append(f"global overflow {overflow}px at {width}px {route}")
                if not measure["visible"]:
                    errors.append(f"empty screen at {width}px {route}")
                if not measure["draftNote"]:
                    errors.append(f"missing draft notice at {width}px {route}")

            page.goto(f"{base_url}#/vergleich", wait_until="load")
            set_complete_local_state(page)
            comparison_question_links: set[str] = set()
            for field in "ABCDEFGHI":
                page.locator("#compare-field").select_option(field)
                page.wait_for_timeout(30)
                question_links = page.locator(".compare-label").evaluate_all(
                    "links => [...new Set(links.map(link => link.getAttribute('href')))]",
                )
                if len(question_links) != 4:
                    errors.append(f"comparison exposes {len(question_links)} rather than four questions in field {field} at {width}px")
                comparison_question_links.update(question_links)
            if len(comparison_question_links) != 36:
                errors.append(f"comparison exposes {len(comparison_question_links)} rather than 36 questions at {width}px")

            page.goto(f"{base_url}#/transparenz", wait_until="load")
            page.evaluate("() => { S.reveal = false; save(); render(); }")
            transparency_text = page.locator("#view").inner_text()
            for party_name in ["CDU/CSU", "SPD", "Bündnis 90/Die Grünen", "AfD", "Die Linke", "BSW", "FDP"]:
                if party_name in transparency_text:
                    errors.append(f"unrevealed party name {party_name!r} in transparency screen at {width}px")

            page.goto(f"{base_url}#/fragen", wait_until="load")
            set_complete_local_state(page)
            page.locator('[data-a="set-value"][data-v="0"]').click()
            value_focus = page.evaluate(
                "() => document.activeElement?.matches('[data-a=\"set-value\"][data-v=\"0\"]')",
            )
            if not value_focus:
                errors.append(f"answer focus was not retained at {width}px")
            page.locator('[data-a="set-imp"][data-w="3"]').click()
            importance_focus = page.evaluate(
                "() => document.activeElement?.matches('[data-a=\"set-imp\"][data-w=\"3\"]')",
            )
            if not importance_focus:
                errors.append(f"importance focus was not retained at {width}px")

            page.goto(f"{base_url}#/", wait_until="load")
            set_complete_local_state(page)
            menu = page.get_by_role("button", name="Menü")
            menu.focus()
            menu.click()
            page.wait_for_timeout(30)
            if not page.locator("#sheet").evaluate("element => element.hasAttribute('open')"):
                errors.append(f"menu dialog did not open at {width}px")
            page.keyboard.press("Escape")
            restored = page.evaluate("() => document.activeElement === document.querySelector('[data-action=\"menu\"]')")
            if not restored:
                errors.append(f"menu focus was not restored at {width}px")

            page.goto(f"{base_url}#/datenschutz", wait_until="load")
            set_complete_local_state(page)
            page.once("dialog", lambda dialog: dialog.accept())
            page.get_by_role("button", name="Alle lokalen Daten löschen").click()
            page.wait_for_timeout(30)
            persisted = page.evaluate("() => localStorage.getItem('wwk_real_state_v1')")
            if persisted is not None:
                errors.append(f"wipe left local state at {width}px")

            page.goto(f"{base_url}#/teilen", wait_until="load")
            if page.get_by_role("button", name="Grafik als SVG laden").count() != 1:
                errors.append(f"share graphic download is unavailable at {width}px")

            if any("akademie.wirkungsoekonomie.de/api/site-event" in request for request in requests):
                errors.append(f"external analytics request at {width}px")
            errors.extend(f"console at {width}px: {error}" for error in console_errors)
            page.close()
        browser.close()

    report = {"passed": not errors, "results": results, "errors": errors}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()
