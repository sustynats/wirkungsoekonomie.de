#!/usr/bin/env python3
"""Deliver a ChatGPT bridge payload from a GitHub issue to Dropbox.

Security properties:
- treats issue content strictly as data; no code from the issue is executed
- writes outputs to the fixed bridge output directory; verified worker
  attestations have one derived private 95_LOGS destination
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
MAX_PAYLOAD_BYTES = 256_000
SAFE_FILENAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,179}\.json$")
SAFE_JOB_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$")
# Matches the bounded correction protocol in news/bridge/corrections.mjs.
MAX_CORRECTION_ATTEMPTS = 2


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
    if event.get('action') not in {'opened', 'reopened'} or issue.get('pull_request'):
        raise BridgeError('unsupported issue event')
    # Both the submitting account and the account causing a rerun must have
    # current write access. Public issue text cannot confer authorization.
    repository = _required_env('GITHUB_REPOSITORY')
    if (event.get('repository') or {}).get('full_name') != repository:
        raise BridgeError('repository mismatch')
    for login in {str((issue.get('user') or {}).get('login') or ''), str((event.get('sender') or {}).get('login') or ''), _required_env('GITHUB_ACTOR')}:
        if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9-]{0,38}(?:\[bot\])?', login):
            raise BridgeError('invalid issue actor')
        _, permission_raw = _request('https://api.github.com/repos/' + repository + '/collaborators/' + urllib.parse.quote(login, safe='') + '/permission',
            headers={'Authorization': 'Bearer ' + _required_env('GH_TOKEN'), 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'})
        if json.loads(permission_raw).get('permission') not in {'write', 'admin', 'maintain'}:
            raise BridgeError('issue actor requires repository write permission')
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
    if title != '[CHATGPT-BRIDGE] ' + str(envelope.get('job_id', '')):
        raise BridgeError('issue title and job mismatch')
    return envelope


def _validate_envelope(envelope: dict[str, Any]) -> tuple[str, str, Any]:
    encrypted = envelope.get('bridge_version') == 2
    allowed = {"bridge_version", "job_id", "destination_filename", 'sealed_payload' if encrypted else 'payload'}
    unknown = set(envelope) - allowed
    if unknown:
        raise BridgeError(f"unexpected bridge fields: {', '.join(sorted(unknown))}")

    if type(envelope.get('bridge_version')) is not int or envelope.get("bridge_version") not in {BRIDGE_VERSION, 2}:
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
    if encrypted:
        allowed_filenames.add(f"{job_id}.processor.json")
    if filename not in allowed_filenames:
        raise BridgeError(
            "destination_filename must be a supported job-bound JSON filename"
        )

    if encrypted:
        from chatgpt_bridge_crypto import unseal
        try:
            payload = unseal(envelope, _required_env('CHATGPT_BRIDGE_PRIVATE_KEY').encode())
        except ValueError:
            raise BridgeError('encrypted payload verification failed') from None
    elif "payload" not in envelope:
        raise BridgeError("missing payload")
    else:
        payload = envelope['payload']
        # Only an inert, tightly bounded probe may be sent in plaintext.
        if filename != job_id + '.probe.json' or not isinstance(payload, dict) or set(payload) != {'probe_id', 'test_only'} or payload != {'probe_id': job_id, 'test_only': True}:
            raise BridgeError('plaintext editorial payloads are forbidden')
    if not isinstance(payload, dict):
        raise BridgeError('payload must be an object')
    if filename.endswith('.processor.json'):
        from chatgpt_processor_receipt import validate_report
        try:
            validate_report(payload, job_id)
        except ValueError as exc:
            raise BridgeError(str(exc)) from None
    if filename.endswith('.output.json') and (payload.get('job_id') != job_id or not re.fullmatch(r'[a-f0-9]{64}', str(payload.get('input_hash', '')))):
        raise BridgeError('output job or input hash mismatch')
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
        "mode": "add",
        "autorename": False,
        "mute": True,
        "strict_conflict": True,
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


def _validate_claimed_output(token: str, job_id: str, payload: dict[str, Any]) -> None:
    root = DROPBOX_OUTPUT_DIR.removesuffix('/20_OUTPUT_READY')
    claimed = None
    # A newer correction supersedes an older claim. An unclaimed correction
    # must not authorize delivery through a leftover original/older claim.
    for attempt in range(MAX_CORRECTION_ATTEMPTS, 0, -1):
        name = f'{job_id}.repair-{attempt}.json'
        raw = _download(token, f'{root}/10_CLAIMED/{name}', allow_missing=True)
        if raw is not None:
            claimed = json.loads(raw)
            original = claimed.get('original_input') if isinstance(claimed, dict) else None
            if (not isinstance(original, dict)
                    or claimed.get('job_type') != 'correction'
                    or type(claimed.get('correction_attempt')) is not int
                    or claimed.get('correction_attempt') != attempt
                    or original.get('job_id') != job_id
                    or original.get('input_hash') != payload.get('input_hash')):
                raise BridgeError('invalid claimed correction lineage')
            break
        if _download(token, f'{root}/00_INBOX/{name}', allow_missing=True) is not None:
            raise BridgeError('latest correction has not been claimed')
    if claimed is None:
        raw = _download(token, f'{root}/10_CLAIMED/{job_id}.input.json', allow_missing=False)
        claimed = json.loads(raw)
    if (not isinstance(claimed, dict) or claimed.get('job_id') != job_id
            or claimed.get('input_hash') != payload.get('input_hash')):
        raise BridgeError('output does not match the claimed input')
    if _download(token, f'{root}/30_ACK/{job_id}.ack.json', allow_missing=True) is not None:
        raise BridgeError('job already acknowledged')


def main() -> int:
    try:
        envelope = _load_issue_envelope()
        job_id, filename, payload = _validate_envelope(envelope)
        destination = f"{DROPBOX_OUTPUT_DIR}/{filename}"
        token = _dropbox_access_token()
        if filename.endswith('.processor.json'):
            from chatgpt_processor_receipt import validate_report, verified_receipt
            try:
                destination = validate_report(payload, job_id)
                probe_path = f"{DROPBOX_OUTPUT_DIR}/preflight-{payload['run_id']}.probe.json"
                payload = verified_receipt(payload, _download(token, probe_path, allow_missing=False))
            except ValueError as exc:
                raise BridgeError(str(exc)) from None
        data = _serialize_payload(payload)
        digest = hashlib.sha256(data).hexdigest()
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

        if existing is not None:
            raise BridgeError('existing output differs; overwrite forbidden')
        if filename.endswith('.output.json'):
            _validate_claimed_output(token, job_id, payload)
        try:
            _upload(token, destination, data)
        except BridgeError:
            # A simultaneous identical delivery is safe. Different bytes stay
            # untouched because Dropbox enforces add + strict_conflict.
            if _download(token, destination, allow_missing=True) != data:
                raise
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
        print(f"BRIDGE_UNEXPECTED_ERROR: {type(exc).__name__}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
