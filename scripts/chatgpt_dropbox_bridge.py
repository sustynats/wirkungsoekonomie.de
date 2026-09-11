#!/usr/bin/env python3
"""Deliver a ChatGPT bridge payload from a GitHub issue to Dropbox.

Security properties:
- treats issue content strictly as data; no code from the issue is executed
- writes only to the fixed Wirkungsticker bridge output directory
- binds destination filenames to the job id
- rejects path separators and unexpected envelope fields/versions
- uses short-lived Dropbox access tokens obtained from a refresh token
- is idempotent: an already-identical target is accepted without rewriting
- verifies the uploaded bytes by downloading the target again
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

BRIDGE_VERSION = 1
DROPBOX_OUTPUT_DIR = "/WOEK/WIRKUNGSTICKER-CHATGPT-BRIDGE/20_OUTPUT_READY"
MAX_ISSUE_BODY_BYTES = 60_000
MAX_PAYLOAD_BYTES = 55_000
SAFE_FILENAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,179}\.json$")
SAFE_JOB_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$")


class BridgeError(RuntimeError):
    pass


def _required_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise BridgeError(f"missing required environment variable: {name}")
    return value


def _request(
    url: str,
    *,
    method: str = "GET",
    data: bytes | None = None,
    headers: dict[str, str] | None = None,
    expected: tuple[int, ...] = (200,),
) -> tuple[int, bytes]:
    request = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            body = response.read()
            status = response.status
    except urllib.error.HTTPError as exc:
        body = exc.read()
        status = exc.code
    except urllib.error.URLError as exc:
        raise BridgeError(f"network error calling {url}: {exc.reason}") from exc

    if status not in expected:
        message = body.decode("utf-8", errors="replace")[:1500]
        raise BridgeError(f"HTTP {status} from {url}: {message}")
    return status, body


def _load_issue_envelope() -> dict[str, Any]:
    event_path = Path(_required_env("GITHUB_EVENT_PATH"))
    event = json.loads(event_path.read_text(encoding="utf-8"))
    issue = event.get("issue") or {}
    title = str(issue.get("title") or "")
    if not title.startswith("[CHATGPT-BRIDGE] "):
        raise BridgeError("issue title is not a ChatGPT bridge request")

    body = issue.get("body")
    if not isinstance(body, str) or not body.strip():
        raise BridgeError("bridge issue body is empty")
    if len(body.encode("utf-8")) > MAX_ISSUE_BODY_BYTES:
        raise BridgeError("bridge issue body exceeds size limit")

    try:
        envelope = json.loads(body)
    except json.JSONDecodeError as exc:
        raise BridgeError(f"issue body is not valid JSON: {exc}") from exc
    if not isinstance(envelope, dict):
        raise BridgeError("bridge envelope must be a JSON object")
    return envelope


def _validate_envelope(envelope: dict[str, Any]) -> tuple[str, str, Any]:
    allowed = {"bridge_version", "job_id", "destination_filename", "payload"}
    unknown = set(envelope) - allowed
    if unknown:
        raise BridgeError(f"unexpected bridge fields: {', '.join(sorted(unknown))}")

    if envelope.get("bridge_version") != BRIDGE_VERSION:
        raise BridgeError(f"unsupported bridge_version: {envelope.get('bridge_version')!r}")

    job_id = envelope.get("job_id")
    if not isinstance(job_id, str) or not SAFE_JOB_ID.fullmatch(job_id):
        raise BridgeError("invalid job_id")

    filename = envelope.get("destination_filename")
    if not isinstance(filename, str) or not SAFE_FILENAME.fullmatch(filename):
        raise BridgeError("invalid destination_filename")
    if "/" in filename or "\\" in filename or filename in {".", ".."}:
        raise BridgeError("destination_filename must be a basename")

    allowed_filenames = {f"{job_id}.output.json", f"{job_id}.probe.json"}
    if filename not in allowed_filenames:
        raise BridgeError(
            "destination_filename must equal <job_id>.output.json or <job_id>.probe.json"
        )

    if "payload" not in envelope:
        raise BridgeError("missing payload")
    payload = envelope["payload"]
    return job_id, filename, payload


def _serialize_payload(payload: Any) -> bytes:
    try:
        rendered = json.dumps(
            payload,
            ensure_ascii=False,
            indent=2,
            sort_keys=False,
            allow_nan=False,
        ) + "\n"
    except (TypeError, ValueError) as exc:
        raise BridgeError(f"payload is not strict JSON: {exc}") from exc
    data = rendered.encode("utf-8")
    if len(data) > MAX_PAYLOAD_BYTES:
        raise BridgeError("serialized payload exceeds size limit")
    return data


def _dropbox_access_token() -> str:
    app_key = _required_env("DROPBOX_APP_KEY")
    app_secret = _required_env("DROPBOX_APP_SECRET")
    refresh_token = _required_env("DROPBOX_REFRESH_TOKEN")

    credentials = base64.b64encode(f"{app_key}:{app_secret}".encode()).decode()
    body = urllib.parse.urlencode(
        {"grant_type": "refresh_token", "refresh_token": refresh_token}
    ).encode()
    _, raw = _request(
        "https://api.dropboxapi.com/oauth2/token",
        method="POST",
        data=body,
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    response = json.loads(raw)
    token = response.get("access_token")
    if not isinstance(token, str) or not token:
        raise BridgeError("Dropbox token response did not contain an access_token")
    return token


def _download(token: str, path: str, *, allow_missing: bool) -> bytes | None:
    headers = {
        "Authorization": f"Bearer {token}",
        "Dropbox-API-Arg": json.dumps({"path": path}, separators=(",", ":")),
    }
    request = urllib.request.Request(
        "https://content.dropboxapi.com/2/files/download",
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        raw = exc.read()
        if allow_missing and exc.code == 409 and b"not_found" in raw:
            return None
        message = raw.decode("utf-8", errors="replace")[:1500]
        raise BridgeError(f"Dropbox download failed with HTTP {exc.code}: {message}") from exc
    except urllib.error.URLError as exc:
        raise BridgeError(f"Dropbox download network error: {exc.reason}") from exc


def _upload(token: str, path: str, data: bytes) -> None:
    args = {
        "path": path,
        "mode": "overwrite",
        "autorename": False,
        "mute": True,
        "strict_conflict": False,
    }
    _request(
        "https://content.dropboxapi.com/2/files/upload",
        method="POST",
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/octet-stream",
            "Dropbox-API-Arg": json.dumps(args, separators=(",", ":")),
        },
    )


def main() -> int:
    try:
        envelope = _load_issue_envelope()
        job_id, filename, payload = _validate_envelope(envelope)
        data = _serialize_payload(payload)
        digest = hashlib.sha256(data).hexdigest()
        destination = f"{DROPBOX_OUTPUT_DIR}/{filename}"

        token = _dropbox_access_token()
        existing = _download(token, destination, allow_missing=True)
        if existing == data:
            print(
                json.dumps(
                    {
                        "status": "already_delivered",
                        "job_id": job_id,
                        "destination": destination,
                        "sha256": digest,
                        "bytes": len(data),
                    }
                )
            )
            return 0

        _upload(token, destination, data)
        verified = _download(token, destination, allow_missing=False)
        if verified != data:
            raise BridgeError("read-after-write verification failed: Dropbox bytes differ")

        print(
            json.dumps(
                {
                    "status": "delivered",
                    "job_id": job_id,
                    "destination": destination,
                    "sha256": digest,
                    "bytes": len(data),
                }
            )
        )
        return 0
    except BridgeError as exc:
        print(f"BRIDGE_ERROR: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # fail closed and keep error visible in the Actions log
        print(f"BRIDGE_UNEXPECTED_ERROR: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
