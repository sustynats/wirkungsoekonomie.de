"""Serverless KWI endpoint.

This endpoint keeps the public tool static-first while allowing a deployment
target with Python functions to calculate a fresh municipal snapshot on demand.
The score itself stays deterministic; AI interpretation can be layered on top
later without changing the index calculation.
"""

from __future__ import annotations

import json
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.kwi_collect import collect  # noqa: E402


def json_bytes(payload: dict, status: int = 200) -> tuple[int, bytes]:
    return status, (json.dumps(payload, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, body: bytes) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("X-Robots-Tag", "none")
        if status == 200:
            self.send_header("Cache-Control", "public, s-maxage=604800, stale-while-revalidate=86400")
        else:
            self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        status, body = json_bytes({"ok": True})
        self._send_json(status, body)

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        query = (params.get("q") or params.get("municipality") or [""])[0].strip()

        if not query:
            status, body = json_bytes({"error": "missing_query", "message": "Bitte eine Kommune angeben."}, 400)
            self._send_json(status, body)
            return

        if len(query) > 120:
            status, body = json_bytes({"error": "query_too_long", "message": "Die Eingabe ist zu lang."}, 400)
            self._send_json(status, body)
            return

        try:
            snapshot = collect(query)
        except Exception as exc:  # pragma: no cover - serverless boundary
            status, body = json_bytes(
                {
                    "error": "snapshot_failed",
                    "message": f"Für diese Eingabe konnte kein KWI-Snapshot erzeugt werden: {query}",
                    "detail": str(exc),
                },
                502,
            )
            self._send_json(status, body)
            return

        status, body = json_bytes(snapshot)
        self._send_json(status, body)
