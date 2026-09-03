#!/usr/bin/env python3
"""Explicit source-adapter policies introduced with Government Data 1.1.

The adapters deliberately separate transport success from source usability.  A
redirect to a consent wall, a syntactically valid but empty sitemap, or a page
without a source date is never silently treated as a government action.
"""

from __future__ import annotations

import hashlib
import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from enum import Enum
from urllib.parse import urljoin, urlparse


class TerminalStatus(str, Enum):
    PROCESSED_ACTION = "PROCESSED_ACTION"
    NOT_GOVERNMENT_ACTION = "NOT_GOVERNMENT_ACTION"
    OUT_OF_PERIOD = "OUT_OF_PERIOD"
    NEEDS_DATE = "NEEDS_DATE"
    SOURCE_UNAVAILABLE = "SOURCE_UNAVAILABLE"


@dataclass(frozen=True)
class AdapterDecision:
    usable: bool
    status: TerminalStatus | None
    reason: str


class OfficialSourceAdapter:
    source_id: str
    base_url: str
    allowed_hosts: tuple[str, ...]

    def __init__(self, source_id: str, base_url: str, allowed_hosts: tuple[str, ...]) -> None:
        self.source_id = source_id
        self.base_url = base_url
        self.allowed_hosts = allowed_hosts

    def classify_response(
        self,
        *,
        requested_url: str,
        final_url: str,
        status: int,
        content_type: str,
        body: bytes,
    ) -> AdapterDecision:
        host = (urlparse(final_url).hostname or "").lower()
        if status == 404:
            return AdapterDecision(False, TerminalStatus.SOURCE_UNAVAILABLE, "Amtliche Quelle antwortet mit HTTP 404.")
        if status >= 400:
            return AdapterDecision(False, TerminalStatus.SOURCE_UNAVAILABLE, f"Amtliche Quelle antwortet mit HTTP {status}.")
        if not any(host == allowed or host.endswith(f".{allowed}") for allowed in self.allowed_hosts):
            return AdapterDecision(False, TerminalStatus.SOURCE_UNAVAILABLE, "Weiterleitung verließ den zugelassenen amtlichen Quellenraum.")
        sample = body[:120_000].lower()
        challenge_markers = (b"cookie-check", b"fwauth", b"access denied", b"javascript is required", b"consent required")
        if any(marker in sample for marker in challenge_markers):
            return AdapterDecision(False, TerminalStatus.SOURCE_UNAVAILABLE, "Technische Cookie-/Access-Challenge statt amtlichem Inhalt.")
        if not body.strip():
            return AdapterDecision(False, TerminalStatus.SOURCE_UNAVAILABLE, "Leere amtliche Antwort.")
        if "html" not in content_type.lower() and "xml" not in content_type.lower() and "json" not in content_type.lower() and "pdf" not in content_type.lower():
            return AdapterDecision(False, TerminalStatus.SOURCE_UNAVAILABLE, f"Nicht unterstützter Content-Type: {content_type}.")
        return AdapterDecision(True, None, "Amtliche Antwort technisch nutzbar.")

    def classify_candidate(self, *, published_at: str | None, is_action: bool, in_period: bool) -> AdapterDecision:
        if not published_at:
            return AdapterDecision(False, TerminalStatus.NEEDS_DATE, "Belastbares amtliches Datum fehlt.")
        if not in_period:
            return AdapterDecision(False, TerminalStatus.OUT_OF_PERIOD, "Amtliches Datum liegt außerhalb des Untersuchungszeitraums.")
        if not is_action:
            return AdapterDecision(False, TerminalStatus.NOT_GOVERNMENT_ACTION, "Quelle belegt keinen eigenständigen staatlichen Handlungsakt.")
        return AdapterDecision(True, TerminalStatus.PROCESSED_ACTION, "Amtliche Quellenkette und Handlungsakt sind belegt.")

    def parse_sitemap(self, body: bytes, source_url: str) -> list[str]:
        try:
            root = ET.fromstring(body)
        except ET.ParseError as exc:
            raise ValueError(f"Malformed XML in {self.source_id}: {exc}") from exc
        urls: list[str] = []
        for node in root.iter():
            if node.tag.rsplit("}", 1)[-1] != "loc" or not node.text:
                continue
            value = urljoin(source_url, node.text.strip())
            host = (urlparse(value).hostname or "").lower()
            if any(host == allowed or host.endswith(f".{allowed}") for allowed in self.allowed_hosts):
                urls.append(value)
        return sorted(set(urls))

    def stable_candidate_id(self, canonical_url: str) -> str:
        normalized = re.sub(r"[?#].*$", "", canonical_url.strip())
        digest = hashlib.sha256(f"{self.source_id}|{normalized}".encode()).hexdigest()[:24]
        return f"candidate:{self.source_id.lower()}:{digest}"

    @staticmethod
    def content_changed(previous_hash: str | None, current_body: bytes) -> bool:
        current_hash = hashlib.sha256(current_body).hexdigest()
        return previous_hash is not None and previous_hash != current_hash


class BKAmtAdapter(OfficialSourceAdapter):
    def __init__(self) -> None:
        super().__init__("BKAmt", "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt", ("bundesregierung.de",))


class BMIAdapter(OfficialSourceAdapter):
    def __init__(self) -> None:
        super().__init__("MINISTRY_BMI", "https://www.bmi.bund.de", ("bmi.bund.de",))


class BMWEAdapter(OfficialSourceAdapter):
    def __init__(self) -> None:
        super().__init__("MINISTRY_BMWE", "https://www.bundeswirtschaftsministerium.de", ("bundeswirtschaftsministerium.de",))


class BMBFSFJAdapter(OfficialSourceAdapter):
    def __init__(self) -> None:
        super().__init__("MINISTRY_BMBFSFJ", "https://www.bmbfsfj.bund.de", ("bmbfsfj.bund.de",))
