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
          localStorage.removeItem('woek_user_space');
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


def nested_keys(value: object) -> set[str]:
    if isinstance(value, dict):
        return {str(key) for key in value} | set().union(*(nested_keys(item) for item in value.values()))
    if isinstance(value, list):
        return set().union(*(nested_keys(item) for item in value)) if value else set()
    return set()


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
            context = browser.new_context(viewport={"width": width, "height": 900})
            page = context.new_page()
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
                      reviewNote: document.querySelector('.demo-note')?.innerText.includes('Transparenz zum Prüfstatus'),
                      sitePath: ['Startseite', 'Praxis & Tools', 'Mein Wirkungsraum'].every(label => [...document.querySelectorAll('.site-context a, .breadcrumb a')].some(link => link.textContent.trim() === label)),
                      legalLink: [...document.querySelectorAll('#foot a')].some(link => link.textContent.trim() === 'Impressum' && link.getAttribute('href') === '../../impressum.html'),
                      privacyLink: [...document.querySelectorAll('#foot a')].some(link => link.textContent.trim() === 'Datenschutzerklärung' && link.getAttribute('href') === '../../datenschutz.html')
                    })""",
                )
                overflow = max(measure["documentWidth"], measure["bodyWidth"]) - measure["inner"]
                result = {
                    "width": width,
                    "route": route,
                    "overflow": overflow,
                    "visible": measure["visible"],
                    "reviewNote": measure["reviewNote"],
                    "sitePath": measure["sitePath"],
                    "legalLink": measure["legalLink"],
                    "privacyLink": measure["privacyLink"],
                }
                results.append(result)
                if overflow > 1:
                    errors.append(f"global overflow {overflow}px at {width}px {route}")
                if not measure["visible"]:
                    errors.append(f"empty screen at {width}px {route}")
                if not measure["reviewNote"]:
                    errors.append(f"missing review notice at {width}px {route}")
                if not measure["sitePath"]:
                    errors.append(f"missing Wirkungsökonomie path at {width}px {route}")
                if not measure["legalLink"]:
                    errors.append(f"missing Impressum link at {width}px {route}")
                if not measure["privacyLink"]:
                    errors.append(f"missing Datenschutzerklärung link at {width}px {route}")

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
            page.get_by_role("button", name="Kompassdaten löschen").click()
            page.wait_for_timeout(30)
            persisted = page.evaluate("() => localStorage.getItem('wwk_real_state_v1')")
            if persisted is not None:
                errors.append(f"wipe left local state at {width}px")

            page.goto(f"{base_url}#/teilen", wait_until="load")
            set_complete_local_state(page)
            page.evaluate(
                """() => localStorage.setItem('woek_user_space', JSON.stringify({
                  namespace: 'woek_user_space', schema_version: 3,
                  objects: {
                    saved_items: { version: 1, items: [{ id: 'bestehende-merkung', type: 'Werkzeug', title: 'Bestehende Merkung', url: '/werkzeuge/', saved_at: '2026-01-01T00:00:00.000Z' }] },
                    notes: { version: 1, items: [{ id: 'notiz-bleibt', text: 'Erhalten' }] }
                  }
                }))""",
            )
            for label in ["In Mein Wirkungsraum speichern", "Als PNG laden", "Als PDF laden", "Prioritäten teilen"]:
                if page.get_by_role("button", name=label).count() != 1:
                    errors.append(f"result action {label!r} is unavailable at {width}px")
            graphic_bounds = page.evaluate(
                """() => {
                  const count = Math.max(shareProfile().length, 1);
                  const lastBaseline = 178 + (count - 1) * 34;
                  return { cardBottom: priorityGraphicGeometry().height - 36, lastBaseline };
                }""",
            )
            if graphic_bounds["cardBottom"] < graphic_bounds["lastBaseline"] + 30:
                errors.append(f"priority graphic clips its last line at {width}px")

            page.get_by_role("button", name="In Mein Wirkungsraum speichern").click()
            page.wait_for_timeout(30)
            page.get_by_role("button", name="In Mein Wirkungsraum speichern").click()
            saved_store = page.evaluate("() => JSON.parse(localStorage.getItem('woek_user_space') || '{}')")
            saved_items = saved_store.get("objects", {}).get("saved_items", {}).get("items", [])
            result_items = [item for item in saved_items if item.get("id") == "wirkungswahl-kompass-mein-ergebnis"]
            result_item = result_items[0] if result_items else {}
            if len(result_items) != 1 or not saved_items or saved_items[0].get("id") != "wirkungswahl-kompass-mein-ergebnis":
                errors.append(f"priority profile was not upserted at the top of Mein Wirkungsraum at {width}px")
            if any(item.get("id") == "bestehende-merkung" for item in saved_items) is False:
                errors.append(f"saving priority profile removed an existing saved item at {width}px")
            if saved_store.get("objects", {}).get("notes", {}).get("items", [{}])[0].get("id") != "notiz-bleibt":
                errors.append(f"saving priority profile removed another Mein-Wirkungsraum object at {width}px")
            if result_item.get("type") != "Werkzeug" or result_item.get("url") != "/werkzeuge/wirkungswahl-kompass/#/teilen":
                errors.append(f"priority profile has no compatible Werkzeug card at {width}px")
            if not result_item.get("saved_at") or not result_item.get("tags") or not result_item.get("result_summary", {}).get("top_priorities"):
                errors.append(f"priority profile summary is incomplete at {width}px")
            forbidden = {"answers", "party", "parties", "proximity", "compare", "reveal", "stance"}
            if nested_keys(result_item) & forbidden:
                errors.append(f"priority profile stores excluded political answer data at {width}px")

            if width == WIDTHS[0]:
                with page.expect_download() as png_download_info:
                    page.get_by_role("button", name="Als PNG laden").click()
                png_download = png_download_info.value
                png_path = png_download.path()
                png_bytes = Path(png_path).read_bytes() if png_path else b""
                if not png_download.suggested_filename.endswith(".png") or not png_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
                    errors.append("priority PNG export is not a PNG download")

                with page.expect_download() as pdf_download_info:
                    page.get_by_role("button", name="Als PDF laden").click()
                pdf_download = pdf_download_info.value
                pdf_path = pdf_download.path()
                pdf_bytes = Path(pdf_path).read_bytes() if pdf_path else b""
                if not pdf_download.suggested_filename.endswith(".pdf") or not pdf_bytes.startswith(b"%PDF-") or b"%%EOF" not in pdf_bytes[-128:]:
                    errors.append("priority PDF export is not a valid PDF download")

                page.evaluate(
                    """() => {
                      window.__wwk_shared_payload = null;
                      Object.defineProperty(navigator, 'share', { configurable: true, value: payload => {
                        window.__wwk_shared_payload = payload;
                        return Promise.resolve();
                      }});
                    }""",
                )
                page.get_by_role("button", name="Prioritäten teilen").click()
                page.wait_for_timeout(30)
                shared_payload = page.evaluate("() => window.__wwk_shared_payload") or {}
                shared_text = json.dumps(shared_payload, ensure_ascii=False).lower()
                if "#/teilen" not in str(shared_payload.get("url", "")) or any(token in shared_text for token in ["answers", "cdu/csu", "spd", "afd", "proximity"]):
                    errors.append("share payload contains more than the neutral priority profile")

                portal = context.new_page()
                portal.goto(f"{base_url[:-len(BASE_PATH)]}/mein-wirkungsraum/#gemerkte-inhalte", wait_until="load")
                portal.get_by_role("button", name="Werkzeuge").click()
                try:
                    portal.get_by_role("heading", name="Wirkungswahl-Kompass – Meine Prioritäten").wait_for(timeout=3000)
                except Exception:
                    errors.append("Mein Wirkungsraum does not render the saved priority card")
                portal.close()

                page.evaluate("() => localStorage.setItem('woek_user_space', 'unlesbar')")
                page.get_by_role("button", name="In Mein Wirkungsraum speichern").click()
                if "gespeichert" not in page.locator("#share-status").inner_text().lower():
                    errors.append("saving with malformed Mein-Wirkungsraum data failed")

            if any("akademie.wirkungsoekonomie.de/api/site-event" in request for request in requests):
                errors.append(f"external analytics request at {width}px")
            errors.extend(f"console at {width}px: {error}" for error in console_errors)
            page.close()
            context.close()
        browser.close()

    report = {"passed": not errors, "results": results, "errors": errors}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()
