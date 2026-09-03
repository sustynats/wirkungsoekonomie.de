#!/usr/bin/env python3
"""Reproduzierbarer amtlicher Government-Data-Ingest ohne Wirkungsbewertung."""

from __future__ import annotations

import argparse
import csv
import email.utils
import gzip
import hashlib
import json
import os
import re
import shutil
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from difflib import SequenceMatcher
from functools import lru_cache
from pathlib import Path
from typing import Any, Iterable

from lxml import html


PARSER_VERSION = "woek-government-ingest-1.0"
TERM_START = "2025-05-06"
DEFAULT_END = date.today().isoformat()
USER_AGENT = "Institut-fuer-Wirkungsoekonomie-Government-Data/1.0 (+https://wirkungsoekonomie.de/)"
BASE_DIR = Path(__file__).resolve().parents[2]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def stable_id(prefix: str, *parts: Any, length: int = 24) -> str:
    value = "\x1f".join(str(part or "") for part in parts)
    return f"{prefix}:{hashlib.sha256(value.encode('utf-8')).hexdigest()[:length]}"


def slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii").lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value[:100] or "record"


def normalize_title(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii").lower()
    value = re.sub(r"\b(entwurf|eines|einer|einem|einen|zur|zum|des|der|die|das|von|und|fur|für|hier)\b", " ", value)
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def unique(values: Iterable[Any]) -> list[Any]:
    out: list[Any] = []
    for value in values:
        if value not in out:
            out.append(value)
    return out


def clean_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def iso_date(value: str | None) -> str | None:
    if not value:
        return None
    value = clean_text(value)
    try:
        if re.match(r"^\d{4}-\d{2}-\d{2}", value):
            return value[:10]
        match = re.search(r"(\d{1,2})\.(\d{1,2})\.(\d{4})", value)
        if match:
            return f"{int(match.group(3)):04d}-{int(match.group(2)):02d}-{int(match.group(1)):02d}"
        match = re.search(r"(\d{1,2})\.\s*([A-Za-zÄÖÜäöü]+)\s+(\d{4})", value)
        if match:
            months = {"januar":1,"februar":2,"marz":3,"märz":3,"april":4,"mai":5,"juni":6,"juli":7,"august":8,"september":9,"oktober":10,"november":11,"dezember":12}
            month = months.get(match.group(2).lower())
            if month:
                return f"{int(match.group(3)):04d}-{month:02d}-{int(match.group(1)):02d}"
    except (TypeError, ValueError):
        return None
    return None


def in_period(value: str | None, start: str, end: str) -> bool:
    parsed = iso_date(value)
    return bool(parsed and start <= parsed <= end)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field) for field in fields})


@dataclass
class FetchResult:
    url: str
    final_url: str
    status: int
    content_type: str
    body: bytes
    retrieved_at: str
    content_hash: str
    raw_metadata_path: str


@dataclass
class State:
    output: Path
    start: str
    end: str
    source_events: list[dict[str, Any]] = field(default_factory=list)
    actions: list[dict[str, Any]] = field(default_factory=list)
    relationships: list[dict[str, Any]] = field(default_factory=list)
    external_events: list[dict[str, Any]] = field(default_factory=list)
    errors: list[dict[str, Any]] = field(default_factory=list)
    warnings: list[dict[str, Any]] = field(default_factory=list)
    manual_review: list[dict[str, Any]] = field(default_factory=list)
    logs: list[dict[str, Any]] = field(default_factory=list)
    source_coverage: list[dict[str, Any]] = field(default_factory=list)
    seen_source_event_ids: set[str] = field(default_factory=set)
    seen_relationship_ids: set[str] = field(default_factory=set)
    fetch_cache: dict[str, FetchResult] = field(default_factory=dict)

    def log(self, adapter: str, event: str, **values: Any) -> None:
        self.logs.append({"at": utc_now(), "adapter": adapter, "event": event, **values})

    def add_relationship(self, source_id: str, target_id: str, relation_type: str, evidence: list[str], confidence: str, method: str, review_status: str) -> None:
        relationship_id = stable_id("rel", source_id, target_id, relation_type)
        if relationship_id in self.seen_relationship_ids:
            return
        self.seen_relationship_ids.add(relationship_id)
        self.relationships.append({
            "relationship_id": relationship_id,
            "source_object_id": source_id,
            "target_object_id": target_id,
            "relationship_type": relation_type,
            "evidence_source_event_ids": evidence,
            "confidence": confidence,
            "method": method,
            "review_status": review_status,
            "created_at": utc_now(),
        })


class Fetcher:
    def __init__(self, state: State, delay: float = 0.08, reuse_existing: bool = False):
        self.state = state
        self.delay = delay
        self.reuse_existing = reuse_existing
        self.existing_indexes: dict[str, dict[str, tuple[str, Path, dict[str, Any]]]] = {}

    def _existing(self, url: str, source_slug: str) -> FetchResult | None:
        source_dir = self.state.output / "raw" / source_slug
        if not self.reuse_existing or not source_dir.exists():
            return None
        if source_slug not in self.existing_indexes:
            index: dict[str, tuple[str, Path, dict[str, Any]]] = {}
            for path in source_dir.glob("*.json"):
                try:
                    metadata = read_json(path)
                except Exception:
                    continue
                source_url = metadata.get("source_url")
                retrieved = metadata.get("retrieved_at") or ""
                if source_url and (source_url not in index or retrieved > index[source_url][0]):
                    index[source_url] = (retrieved, path, metadata)
            self.existing_indexes[source_slug] = index
        match = self.existing_indexes[source_slug].get(url)
        if not match:
            return None
        _, path, metadata = match
        blob = self.state.output / metadata["blob_path"]
        if not blob.is_file() or sha256(blob.read_bytes()) != metadata.get("content_hash"):
            return None
        return FetchResult(
            url=url,
            final_url=metadata.get("final_url") or url,
            status=int(metadata.get("http_status") or 200),
            content_type=metadata.get("content_type") or "application/octet-stream",
            body=blob.read_bytes(),
            retrieved_at=metadata.get("retrieved_at") or utc_now(),
            content_hash=metadata["content_hash"],
            raw_metadata_path=str(path.relative_to(self.state.output)),
        )

    def fetch(self, url: str, source_slug: str, *, headers: dict[str, str] | None = None, timeout: int = 45, attempts: int = 4) -> FetchResult:
        if url in self.state.fetch_cache:
            return self.state.fetch_cache[url]
        existing = self._existing(url, source_slug)
        if existing:
            self.state.fetch_cache[url] = existing
            self.state.log(source_slug, "raw_reused", url=url, content_hash=existing.content_hash)
            return existing
        request_headers = {"User-Agent": USER_AGENT, "Accept": "*/*", "Accept-Language": "de"}
        request_headers.update(headers or {})
        last_error: Exception | None = None
        attempts = max(1, attempts)
        for attempt in range(attempts):
            try:
                request = urllib.request.Request(url, headers=request_headers)
                with urllib.request.urlopen(request, timeout=timeout) as response:
                    body = response.read()
                    result = self._store(url, response.geturl(), int(response.status), response.headers.get("Content-Type", "application/octet-stream"), body, source_slug)
                    self.state.fetch_cache[url] = result
                    time.sleep(self.delay)
                    return result
            except Exception as exc:  # network errors are audit data
                last_error = exc
                if attempt < attempts - 1:
                    time.sleep(2**attempt)
        status = getattr(last_error, "code", 0) or 0
        self.state.errors.append({"source": source_slug, "url": url, "status": status, "error": type(last_error).__name__, "message": clean_text(str(last_error))[:500]})
        self.state.log(source_slug, "fetch_failed", url=url, status=status, error=type(last_error).__name__)
        raise last_error or RuntimeError("FETCH_FAILED")

    def _store(self, source_url: str, final_url: str, status: int, content_type: str, body: bytes, source_slug: str) -> FetchResult:
        retrieved_at = utc_now()
        digest = sha256(body)
        blob = self.state.output / "blobs" / "sha256" / digest[:2] / digest
        blob.parent.mkdir(parents=True, exist_ok=True)
        if not blob.exists():
            blob.write_bytes(body)
        record_key = stable_id("raw", source_url, digest).split(":", 1)[1]
        metadata_path = self.state.output / "raw" / source_slug / f"{record_key}.json"
        prior_hashes = []
        source_dir = self.state.output / "raw" / source_slug
        if source_dir.exists():
            for path in source_dir.glob("*.json"):
                try:
                    old = read_json(path)
                    if old.get("source_url") == source_url:
                        prior_hashes.append(old.get("content_hash"))
                except Exception:
                    pass
        previous = prior_hashes[-1] if prior_hashes else None
        metadata = {
            "source_url": source_url,
            "final_url": final_url,
            "retrieved_at": retrieved_at,
            "http_status": status,
            "content_type": content_type,
            "content_size": len(body),
            "content_hash": digest,
            "previous_content_hash": previous,
            "change_detected": bool(previous and previous != digest),
            "blob_path": f"blobs/sha256/{digest[:2]}/{digest}",
            "parser_version": PARSER_VERSION,
        }
        write_json(metadata_path, metadata)
        if source_slug in self.existing_indexes:
            self.existing_indexes[source_slug][source_url] = (retrieved_at, metadata_path, metadata)
        return FetchResult(source_url, final_url, status, content_type, body, retrieved_at, digest, str(metadata_path.relative_to(self.state.output)))


def source_event(state: State, fetch: FetchResult, *, source_id: str, external_id: str | None, event_type: str, title: str, published_at: str | None, summary: str | None = None, body: str | None = None, source_function: str, canonical_url: str | None = None, official_ids: dict[str, Any] | None = None, ministries: list[str] | None = None, institutions: list[str] | None = None, legal_acts: list[str] | None = None, programmes: list[str] | None = None, attachments: list[dict[str, Any]] | None = None, warnings: list[str] | None = None, locator: str | None = None) -> str:
    event_id = stable_id("source-event", source_id, external_id or fetch.final_url, fetch.content_hash, locator or "")
    if event_id in state.seen_source_event_ids:
        return event_id
    state.seen_source_event_ids.add(event_id)
    raw_metadata = read_json(state.output / fetch.raw_metadata_path)
    state.source_events.append({
        "source_event_id": event_id,
        "source_id": source_id,
        "external_id": external_id,
        "event_type": event_type,
        "published_at": published_at,
        "effective_at": None,
        "retrieved_at": fetch.retrieved_at,
        "first_seen_at": fetch.retrieved_at,
        "last_seen_at": fetch.retrieved_at,
        "source_url": fetch.url,
        "canonical_source_url": canonical_url or fetch.final_url,
        "title_original": clean_text(title) or "Amtliche Veröffentlichung ohne extrahierten Titel",
        "summary_original": clean_text(summary) or None,
        "body_text_original": clean_text(body) or None,
        "attachments": attachments or [],
        "official_identifiers": official_ids or {},
        "named_institutions": institutions or [],
        "named_ministries": ministries or [],
        "named_legal_acts": legal_acts or [],
        "named_programmes": programmes or [],
        "raw_blob_sha256": fetch.content_hash,
        "previous_content_hash": raw_metadata.get("previous_content_hash"),
        "change_detected": bool(raw_metadata.get("change_detected")),
        "parser_version": PARSER_VERSION,
        "parse_status": "PARTIAL" if warnings else "SUCCESS",
        "parse_warnings": warnings or [],
        "source_version_status": "CURRENT",
        "source_function": source_function,
        "provenance": {"raw_metadata_path": fetch.raw_metadata_path, "locator": locator},
    })
    return event_id


def action_type(title: str) -> str:
    value = title.lower()
    patterns = [
        ("GOVERNMENT_BILL", ["gesetzentwurf", "entwurf eines gesetzes", "gesetz zur"]),
        ("REGULATION", ["verordnung", "rechtsverordnung"]),
        ("ADMINISTRATIVE_RULE", ["verwaltungsvorschrift", "richtlinie"]),
        ("FUNDING_PROGRAMME", ["förderprogramm", "foerderprogramm", "förderrichtlinie", "foerderrichtlinie"]),
        ("ACTION_PLAN", ["aktionsplan", "aktionsprogramm"]),
        ("STRATEGY", ["strategie", "strategischen rahmen"]),
        ("BUDGET_ACTION", ["bundeshaushalt", "haushalt", "finanzplan"]),
        ("INTERNATIONAL_AGREEMENT", ["abkommen", "vereinbarung", "memorandum of understanding", "partnerschaft"]),
        ("GOVERNMENT_REPORT", ["bericht", "stellungnahme"]),
        ("GOVERNANCE_ORGANISATION", ["kommission", "beirat", "organisationserlass"]),
    ]
    for kind, terms in patterns:
        if any(term in value for term in terms):
            return kind
    return "CABINET_DECISION"


def action_record(action_id: str, title: str, event_ids: list[str], *, kind: str, status: str, ministries: list[str], first_date: str | None, cabinet_date: str | None = None, source_completeness: str = "BEST_EFFORT_DEFINED_SOURCE_SCOPE", official_ids: dict[str, list[Any]] | None = None, provenance: list[dict[str, Any]] | None = None, notes: list[str] | None = None) -> dict[str, Any]:
    timestamp = utc_now()
    return {
        "government_action_id": action_id,
        "government_term_id": "bund-2025",
        "title_canonical": clean_text(title),
        "title_official_preferred": clean_text(title),
        "action_type": kind,
        "responsible_ministries": unique(ministries),
        "responsible_institutions": ["Bundesregierung"] if cabinet_date else unique(ministries),
        "first_known_date": first_date,
        "cabinet_decision_date": cabinet_date,
        "submitted_to_parliament_date": None,
        "promulgated_date": None,
        "effective_date": None,
        "lifecycle_status": status,
        "lifecycle_events": [{"status": status, "date": first_date, "source_event_id": event_ids[0]}],
        "source_event_ids": unique(event_ids),
        "official_identifiers": official_ids or {"dip_ids": [], "drucksachen": [], "eli": [], "bgbl": [], "other": []},
        "legal_basis_refs": [],
        "coalition_commitment_refs": [],
        "parliamentary_case_refs": [],
        "budget_refs": [],
        "funding_refs": [],
        "procurement_refs": [],
        "related_government_action_ids": [],
        "relationship_review_status": "NONE",
        "source_completeness": source_completeness,
        "canonicalization_notes": notes or [],
        "manual_review_required": False,
        "materiality_signals": {
            "national_scope": True if cabinet_date else None,
            "affected_population_explicit": None,
            "budget_amount_explicit": None,
            "legal_change": True if kind in {"GOVERNMENT_BILL", "REGULATION", "ADMINISTRATIVE_RULE"} else None,
            "constitutional_reference_explicit": None,
            "multi_ministry": len(ministries) > 1 if ministries else None,
            "long_term_strategy": True if kind in {"STRATEGY", "ACTION_PLAN"} else None,
            "major_infrastructure": None,
        },
        "field_provenance": provenance or [],
        "created_at": timestamp,
        "updated_at": timestamp,
        "schema_version": "1.0",
    }


def decode_content(body: bytes) -> bytes:
    """Entfernt ausschließlich erkennbare GZIP-Transport-/Dateischichten."""
    payload = body
    for _ in range(3):
        if not payload.startswith(b"\x1f\x8b"):
            break
        payload = gzip.decompress(payload)
    return payload


def html_doc(body: bytes):
    return html.fromstring(decode_content(body), base_url="https://invalid.example/")


def title_from_url(url: str) -> str:
    name = Path(urllib.parse.urlparse(url).path).stem
    return clean_text(urllib.parse.unquote(name).replace("-", " ").replace("_", " ")) or "Amtliche Datei ohne extrahierten Titel"


def is_access_challenge(body: bytes) -> bool:
    sample = decode_content(body)[:20000].lower()
    return any(marker in sample for marker in (
        b"radware captcha page",
        b"radware page",
        b"h-captcha",
        b"zugriff nicht m",
    ))


def fetch_is_access_challenge(fetched: FetchResult) -> bool:
    return "fwauth.init-ag.de" in urllib.parse.urlparse(fetched.final_url).netloc.lower() or is_access_challenge(fetched.body)


def page_title(doc) -> str:
    for xpath in ["//main//h1[1]", "//main//h2[contains(@class,'title')][1]", "//meta[@property='og:title']/@content", "//title[1]"]:
        values = doc.xpath(xpath)
        if values:
            value = values[0] if isinstance(values[0], str) else values[0].text_content()
            value = clean_text(value)
            if value:
                return value
    return "Amtliche Veröffentlichung ohne extrahierten Titel"


def page_date(doc) -> str | None:
    for xpath in ["//meta[@property='article:published_time']/@content", "//meta[@name='date']/@content", "//main//time[1]/@datetime", "//main//*[contains(@class,'date')][1]/text()"]:
        for value in doc.xpath(xpath):
            parsed = iso_date(str(value))
            if parsed:
                return parsed
    return None


def main_text(doc) -> str:
    nodes = doc.xpath("//main")
    return clean_text(nodes[0].text_content()) if nodes else clean_text(doc.text_content())


def parse_initial_search(body: bytes) -> dict[str, Any]:
    text = body.decode("utf-8", errors="replace")
    match = re.search(r"BPA\.initialSearchResultsJson\s*=\s*(\{.*?\});\s*</script>", text, re.S)
    if not match:
        raise ValueError("BREG_INITIAL_SEARCH_JSON_NOT_FOUND")
    return json.loads(match.group(1))["result"]


def cabinet_ingest(state: State, fetcher: Fetcher) -> None:
    adapter = "bundesregierung"
    archive = "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/kabinettssitzungen/bundeskabinett-ergebnisse"
    started = utc_now()
    first = fetcher.fetch(archive, adapter)
    first_result = parse_initial_search(first.body)
    pages = int(first_result.get("pageCount") or 1)
    listed: dict[str, dict[str, Any]] = {}
    page_records = [(first, first_result)]
    for index in range(1, pages):
        fetched = fetcher.fetch(f"{archive}?page={index}", adapter)
        page_records.append((fetched, parse_initial_search(fetched.body)))
    for _, result in page_records:
        for item in result.get("items", []):
            listed[str(item["id"])] = item
    session_numbers: list[int] = []
    processed_topics = 0
    session_failures = 0
    for content_id, item in sorted(listed.items(), key=lambda pair: pair[1].get("sortDate", "")):
        payload = html.fromstring(item.get("payload", "<div></div>"))
        links = payload.xpath("//a[@href]/@href")
        if not links:
            state.warnings.append({"source":"BREG_CABINET_ARCHIVE","record":content_id,"warning":"Sitzungslink fehlt"})
            continue
        url = urllib.parse.urljoin(archive, links[0])
        try:
            fetched = fetcher.fetch(url, adapter)
            doc = html_doc(fetched.body)
        except Exception:
            session_failures += 1
            continue
        header = clean_text(" ".join(doc.xpath("//main//header//*[self::p or self::h1 or self::h2]//text()")))
        session_match = re.search(r"(\d+)\.\s*Sitzung\s+am\s+(\d{1,2}\.\s*[A-Za-zÄÖÜäöü]+\s+\d{4}|\d{1,2}\.\d{1,2}\.\d{4})", header)
        session_number = int(session_match.group(1)) if session_match else None
        session_date = iso_date(session_match.group(2)) if session_match else iso_date(item.get("sortDate"))
        if not in_period(session_date, state.start, state.end):
            continue
        if session_number:
            session_numbers.append(session_number)
        session_event_id = source_event(
            state, fetched, source_id="BREG_CABINET_ARCHIVE", external_id=content_id,
            event_type="CABINET_SESSION_PUBLICATION", title=f"Bundeskabinett - {session_number or 'unbekannte'}. Sitzung",
            published_at=session_date, summary=header, body=None, source_function="OFFICIAL_DECISION",
            official_ids={"coremedia_content_id": content_id, "cabinet_session_number": session_number},
            institutions=["Bundesregierung"], locator="Sitzungsseite"
        )
        rich_nodes = [node for node in doc.xpath("//main//div[contains(concat(' ',normalize-space(@class),' '),' bpa-richtext ')]") if node.xpath(".//li")]
        if not rich_nodes:
            state.warnings.append({"source":"BREG_CABINET_ARCHIVE","record":content_id,"warning":"Keine TOP-Liste extrahierbar"})
            session_failures += 1
            continue
        rich = rich_nodes[-1]
        without_debate = False
        topic_index = 0
        for child in rich.iterchildren():
            if child.tag == "p" and "ohne aussprache" in clean_text(child.text_content()).lower():
                without_debate = True
            if child.tag != "ul":
                continue
            for li in child.xpath("./li"):
                topic_index += 1
                processed_topics += 1
                original = clean_text(li.text_content())
                links = unique([urllib.parse.urljoin(url, href) for href in li.xpath(".//a[@href]/@href")])
                ministry_match = re.search(r"(?:Vortrag:\s*|\s-\s)([A-ZÄÖÜ][A-ZÄÖÜa-z0-9/ -]{1,30})$", original)
                ministry = clean_text(ministry_match.group(1)).replace("Vortrag:", "") if ministry_match else None
                title = original
                if ministry_match:
                    title = clean_text(original[:ministry_match.start()])
                top_event_id = source_event(
                    state, fetched, source_id="BREG_CABINET_ARCHIVE", external_id=f"{content_id}:top:{topic_index}",
                    event_type="CABINET_AGENDA_ITEM", title=title, published_at=session_date,
                    summary=original, body=original, source_function="OFFICIAL_DECISION",
                    official_ids={"coremedia_content_id": content_id, "cabinet_session_number": session_number, "agenda_item_index": topic_index, "without_debate": without_debate},
                    ministries=[ministry] if ministry else [], institutions=["Bundesregierung"], locator=f"TOP {topic_index}"
                )
                event_ids = [top_event_id]
                attachments: list[dict[str, Any]] = []
                if links:
                    try:
                        detail = fetcher.fetch(links[0], adapter)
                        detail_doc = html_doc(detail.body)
                        detail_id = source_event(
                            state, detail, source_id="BREG_CABINET_ARCHIVE", external_id=re.search(r"-(\d+)(?:\?|$)", detail.final_url).group(1) if re.search(r"-(\d+)(?:\?|$)", detail.final_url) else None,
                            event_type="CABINET_ITEM_DETAIL", title=page_title(detail_doc), published_at=page_date(detail_doc) or session_date,
                            summary=None, body=main_text(detail_doc), source_function="OFFICIAL_DECISION",
                            canonical_url=detail.final_url, ministries=[ministry] if ministry else [], institutions=["Bundesregierung"], locator="Detailseite des Kabinettsgegenstands"
                        )
                        event_ids.append(detail_id)
                        for href in detail_doc.xpath("//main//a[@href]/@href"):
                            href = urllib.parse.urljoin(detail.final_url, href)
                            if "/resource/blob/" in href or href.lower().endswith((".pdf", ".docx", ".zip")):
                                attachments.append({"url": href, "download_status": "REFERENCED_NOT_DUPLICATED"})
                    except Exception as exc:
                        state.warnings.append({"source":"BREG_CABINET_ARCHIVE","record":content_id,"warning":f"Detailseite nicht abrufbar: {type(exc).__name__}"})
                action_id = f"govaction:breg-cabinet:{content_id}:top:{topic_index}"
                record = action_record(
                    action_id, title, event_ids, kind=action_type(title), status="CABINET_DECIDED",
                    ministries=[ministry] if ministry else [], first_date=session_date, cabinet_date=session_date,
                    source_completeness="COMPLETE_ENUMERATED_SOURCE",
                    official_ids={"dip_ids": [], "drucksachen": [], "eli": [], "bgbl": [], "other": [{"cabinet_session": session_number, "agenda_item": topic_index}]},
                    provenance=[{"field":"cabinet_decision_date","value":session_date,"source_event_id":top_event_id,"locator":f"Sitzung {session_number}, TOP {topic_index}"}],
                    notes=["Aus der veröffentlichten Kabinetts-TOP-Liste extrahiert.", "Ohne Aussprache beschlossen." if without_debate else "In der veröffentlichten Themenliste geführt."]
                )
                if attachments:
                    record["canonicalization_notes"].append(f"{len(attachments)} amtliche Anhänge referenziert; Binärdateien nicht unnötig dupliziert.")
                state.actions.append(record)
                for event_id in event_ids:
                    state.add_relationship(action_id, event_id, "HAS_SOURCE_EVENT", [event_id], "EXACT", "EXPLICIT_REFERENCE", "CONFIRMED")
        state.add_relationship(f"cabinet-session:{content_id}", session_event_id, "HAS_SOURCE_EVENT", [session_event_id], "EXACT", "OFFICIAL_IDENTIFIER", "CONFIRMED")
    max_session = max(session_numbers) if session_numbers else 0
    missing_numbers = sorted(set(range(1, max_session + 1)) - set(session_numbers))
    for number in missing_numbers:
        state.manual_review.append({"object_id":f"cabinet-session:{number}","reason":"CABINET_SESSION_NUMBER_NOT_IN_PUBLISHED_RESULT_REGISTER","source":"BREG_CABINET_ARCHIVE","priority":"P0"})
    state.source_coverage.append({
        "source_id":"BREG_CABINET_ARCHIVE", "scope":"veröffentlichtes Ergebnisregister der laufenden Bundesregierung",
        "coverage_status":"COMPLETE_ENUMERATED_SOURCE", "period_start":state.start, "period_end":state.end,
        "found_records":len([n for n in session_numbers]), "processed_records":len(session_numbers), "failed_records":session_failures,
        "found_items":processed_topics, "processed_items":processed_topics, "excluded_items":0,
        "unexplained_items":0, "missing_sequence_numbers":";".join(map(str,missing_numbers)), "started_at":started, "finished_at":utc_now()
    })
    state.log(adapter, "completed", sessions=len(session_numbers), topics=processed_topics, missing_sequence_numbers=missing_numbers)


@lru_cache(maxsize=1)
def dip_headers() -> dict[str, str] | None:
    key = os.environ.get("DIP_API_KEY", "").strip()
    if key in {"", "[SENSITIVE]"}:
        openapi = urllib.request.urlopen(urllib.request.Request("https://search.dip.bundestag.de/api/v1/openapi.yaml", headers={"User-Agent": USER_AGENT}), timeout=30).read().decode("utf-8")
        match = re.search(r"ApiKey ([A-Za-z0-9.]{42})", openapi)
        key = match.group(1) if match else ""
    return {"Authorization": f"ApiKey {key}", "Accept": "application/json"} if key else None


def dip_list(fetcher: Fetcher, resource: str, params: list[tuple[str, str]]) -> Iterable[tuple[FetchResult, dict[str, Any]]]:
    headers = dip_headers()
    if not headers:
        raise RuntimeError("DIP_API_KEY_MISSING")
    cursor = None
    seen = set()
    while True:
        query = list(params) + [("format", "json")]
        if cursor:
            query.append(("cursor", cursor))
        url = f"https://search.dip.bundestag.de/api/v1/{resource}?{urllib.parse.urlencode(query)}"
        fetched = fetcher.fetch(url, "dip", headers=headers)
        payload = json.loads(fetched.body)
        yield fetched, payload
        new_cursor = payload.get("cursor")
        if not new_cursor or new_cursor == cursor or new_cursor in seen:
            break
        seen.add(new_cursor)
        cursor = new_cursor


def dip_lifecycle(status: str | None) -> str:
    value = (status or "").lower()
    if "verkündet" in value or "abgeschlossen" in value:
        return "PROMULGATED"
    if "angenommen" in value or "beschlossen" in value:
        return "ADOPTED"
    if "zurückgezogen" in value:
        return "WITHDRAWN"
    if value:
        return "PARLIAMENTARY_PROCESS"
    return "UNKNOWN"


def extract_dip_identifiers(document: dict[str, Any], positions: list[dict[str, Any]]) -> dict[str, list[Any]]:
    drucksachen: list[str] = []
    eli: list[str] = []
    bgbl: list[str] = []
    other: list[Any] = []
    for position in positions:
        fund = position.get("fundstelle") or {}
        if fund.get("dokumentnummer"):
            drucksachen.append(f"{fund.get('herausgeber','')} {fund['dokumentnummer']}".strip())
        if fund.get("pdf_url"):
            other.append({"document_url": fund["pdf_url"], "dip_document_id": fund.get("id")})
    for entry in document.get("verkuendung") or []:
        if isinstance(entry, dict):
            link = entry.get("fundstelle") or entry.get("url") or entry.get("eli")
            if link and "recht.bund.de/eli/" in str(link): eli.append(str(link))
            if entry.get("fundstelle"): bgbl.append(str(entry["fundstelle"]))
        elif entry:
            bgbl.append(str(entry))
    return {"dip_ids":[str(document.get("id"))], "drucksachen":unique(drucksachen), "eli":unique(eli), "bgbl":unique(bgbl), "other":other}


def exact_or_candidate(state: State, new_action: dict[str, Any], evidence_event_id: str) -> dict[str, Any] | None:
    norm = normalize_title(new_action["title_canonical"])
    identifier_fields = ["dip_ids", "drucksachen", "eli", "bgbl"]
    identifier_matches = []
    for action in state.actions:
        shared = {
            key: set(map(str, action["official_identifiers"].get(key, [])))
            & set(map(str, new_action["official_identifiers"].get(key, [])))
            for key in identifier_fields
        }
        if any(shared.values()):
            identifier_matches.append((action, shared))
    if len(identifier_matches) == 1:
        target, shared = identifier_matches[0]
        target["source_event_ids"] = unique(target["source_event_ids"] + new_action["source_event_ids"])
        for key in ["dip_ids", "drucksachen", "eli", "bgbl", "other"]:
            target["official_identifiers"][key] = unique(target["official_identifiers"].get(key, []) + new_action["official_identifiers"].get(key, []))
        target["responsible_ministries"] = unique(target["responsible_ministries"] + new_action["responsible_ministries"])
        if new_action.get("submitted_to_parliament_date"):
            target["submitted_to_parliament_date"] = new_action["submitted_to_parliament_date"]
        if new_action["lifecycle_status"] != "UNKNOWN":
            target["lifecycle_status"] = new_action["lifecycle_status"]
        target["lifecycle_events"] = unique(target["lifecycle_events"] + new_action["lifecycle_events"])
        target["canonicalization_notes"].append(f"Über geteilte amtliche Kennung verknüpft: {shared}. Keine neue Parlamentsakte erzeugt.")
        state.add_relationship(target["government_action_id"], f"dip-vorgang:{new_action['official_identifiers']['dip_ids'][0]}", "RELATED_TO_PARLIAMENTARY_CASE", [evidence_event_id], "EXACT", "OFFICIAL_IDENTIFIER", "CONFIRMED")
        return target
    candidates = []
    for action in state.actions:
        ratio = SequenceMatcher(None, norm, normalize_title(action["title_canonical"])).ratio()
        if normalize_title(action["title_canonical"]) == norm:
            ratio = 1.0
        if ratio >= 0.90:
            candidates.append((ratio, action))
    if candidates:
        ratio, candidate = max(candidates, key=lambda item: item[0])
        state.add_relationship(candidate["government_action_id"], new_action["government_action_id"], "POSSIBLE_SAME_AS", [evidence_event_id], "HIGH" if ratio >= 0.96 else "MEDIUM", "SEMANTIC_CANDIDATE", "REVIEW_REQUIRED")
        state.manual_review.append({"object_id":new_action["government_action_id"],"candidate_id":candidate["government_action_id"],"reason":"POSSIBLE_MERGE_REQUIRED","similarity":round(ratio,4),"priority":"P1"})
    return None


def dip_ingest(state: State, fetcher: Fetcher) -> None:
    started = utc_now()
    params = [("f.datum.start", state.start), ("f.datum.end", state.end), ("f.wahlperiode", "21"), ("f.initiative", "Bundesregierung")]
    documents: dict[str, tuple[FetchResult, dict[str, Any]]] = {}
    page_count = 0
    try:
        for fetched, payload in dip_list(fetcher, "vorgang", params):
            page_count += 1
            for document in payload.get("documents", []):
                documents[str(document["id"])] = (fetched, document)
    except Exception as exc:
        state.source_coverage.append({"source_id":"DIP_API","scope":"Bundesregierung als Initiative, WP 21","coverage_status":"SOURCE_UNAVAILABLE","period_start":state.start,"period_end":state.end,"found_records":0,"processed_records":0,"failed_records":1,"found_items":0,"processed_items":0,"excluded_items":0,"unexplained_items":0,"missing_sequence_numbers":"","started_at":started,"finished_at":utc_now()})
        state.errors.append({"source":"DIP_API","url":"https://search.dip.bundestag.de/api/v1/vorgang","status":getattr(exc,"code",0),"error":type(exc).__name__,"message":clean_text(str(exc))[:500]})
        return
    failures = 0
    for dip_id, (list_fetch, list_doc) in sorted(documents.items(), key=lambda item: item[1][1].get("datum", "")):
        detail_url = f"https://search.dip.bundestag.de/api/v1/vorgang/{dip_id}?format=json"
        try:
            detail_fetch = fetcher.fetch(detail_url, "dip", headers=dip_headers())
            document = json.loads(detail_fetch.body)
        except Exception:
            detail_fetch, document = list_fetch, list_doc
            failures += 1
        positions: list[dict[str, Any]] = []
        position_event_ids: list[str] = []
        try:
            for position_fetch, payload in dip_list(fetcher, "vorgangsposition", [("f.vorgang", dip_id)]):
                for position in payload.get("documents", []):
                    positions.append(position)
                    fund = position.get("fundstelle") or {}
                    attachment = []
                    if fund.get("pdf_url"):
                        attachment.append({"url":fund["pdf_url"],"content_hash_source":fund.get("pdf_hash"),"download_status":"REFERENCED_NOT_DUPLICATED"})
                    position_event_ids.append(source_event(
                        state, position_fetch, source_id="DIP_API", external_id=str(position.get("id")), event_type="PARLIAMENTARY_PROCEDURAL_POSITION",
                        title=position.get("titel") or document.get("titel"), published_at=position.get("datum"),
                        summary=position.get("vorgangsposition"), body=json.dumps(position, ensure_ascii=False), source_function="PROCEDURAL_STATUS",
                        official_ids={"dip_position_id":position.get("id"),"dip_procedure_id":dip_id,"document_number":fund.get("dokumentnummer")},
                        ministries=[entry.get("titel") for entry in position.get("ressort") or [] if entry.get("titel")], institutions=["Deutscher Bundestag"], attachments=attachment,
                        locator=f"DIP Vorgangsposition {position.get('id')}"
                    ))
        except Exception as exc:
            state.warnings.append({"source":"DIP_API","record":dip_id,"warning":f"Vorgangspositionen unvollständig: {type(exc).__name__}"})
        ministries = unique([entry.get("titel") for position in positions for entry in (position.get("ressort") or []) if entry.get("titel")])
        identifiers = extract_dip_identifiers(document, positions)
        event_id = source_event(
            state, detail_fetch, source_id="DIP_API", external_id=dip_id, event_type="PARLIAMENTARY_PROCEDURE",
            title=document.get("titel") or "DIP-Vorgang ohne Titel", published_at=document.get("datum"),
            summary=document.get("beratungsstand"), body=json.dumps(document, ensure_ascii=False), source_function="PROCEDURAL_STATUS",
            canonical_url=detail_url, official_ids=identifiers, ministries=ministries, institutions=["Deutscher Bundestag"], locator=f"DIP Vorgang {dip_id}"
        )
        kind = "GOVERNMENT_BILL" if document.get("vorgangstyp") == "Gesetzgebung" else action_type(document.get("titel", ""))
        status = dip_lifecycle(document.get("beratungsstand"))
        action_id = f"govaction:dip:{dip_id}"
        record = action_record(
            action_id, document.get("titel") or f"DIP-Vorgang {dip_id}", [event_id] + position_event_ids,
            kind=kind, status=status, ministries=ministries, first_date=document.get("datum"), source_completeness="COMPLETE_ENUMERATED_SOURCE",
            official_ids=identifiers,
            provenance=[{"field":"lifecycle_status","value":status,"source_event_id":event_id,"locator":"beratungsstand"},{"field":"title_official_preferred","value":document.get("titel"),"source_event_id":event_id,"locator":"titel"}],
            notes=["Amtlicher DIP-Vorgang mit Bundesregierung als Initiative."]
        )
        record["submitted_to_parliament_date"] = document.get("datum")
        record["parliamentary_case_refs"] = [f"dip-vorgang:{dip_id}"]
        record["lifecycle_events"] = unique(record["lifecycle_events"] + [
            {"status":"PARLIAMENTARY_PROCESS","date":position.get("datum"),"position":position.get("vorgangsposition"),"source_event_id":position_event_id,"committees":position.get("ueberweisung") or []}
            for position, position_event_id in zip(positions, position_event_ids)
        ])
        merged = exact_or_candidate(state, record, event_id)
        if not merged:
            state.actions.append(record)
            state.add_relationship(action_id, f"dip-vorgang:{dip_id}", "RELATED_TO_PARLIAMENTARY_CASE", [event_id], "EXACT", "OFFICIAL_IDENTIFIER", "CONFIRMED")
        for action_event_id in [event_id] + position_event_ids:
            state.add_relationship((merged or record)["government_action_id"], action_event_id, "HAS_SOURCE_EVENT", [action_event_id], "EXACT", "OFFICIAL_IDENTIFIER", "CONFIRMED")
    state.source_coverage.append({"source_id":"DIP_API","scope":"DIP-Vorgänge der Wahlperiode 21 mit Bundesregierung als Initiative","coverage_status":"COMPLETE_ENUMERATED_SOURCE","period_start":state.start,"period_end":state.end,"found_records":len(documents),"processed_records":len(documents),"failed_records":failures,"found_items":sum(1 for event in state.source_events if event["event_type"]=="PARLIAMENTARY_PROCEDURAL_POSITION"),"processed_items":sum(1 for event in state.source_events if event["event_type"]=="PARLIAMENTARY_PROCEDURAL_POSITION"),"excluded_items":0,"unexplained_items":0,"missing_sequence_numbers":"","started_at":started,"finished_at":utc_now()})
    state.log("dip", "completed", records=len(documents), pages=page_count, detail_failures=failures)


def ministry_registry(state: State, fetcher: Fetcher) -> list[dict[str, Any]]:
    registry_source = "https://www.bundesregierung.de/breg-de/bundesregierung/bundesministerien"
    fetched = fetcher.fetch(registry_source, "bundesregierung")
    source_event_id = source_event(state, fetched, source_id="BREG_MINISTRY_REGISTER", external_id="bundesministerien", event_type="FEDERAL_MINISTRY_REGISTER_SNAPSHOT", title="Die Bundesministerien im Überblick", published_at=None, body=None, source_function="CONTEXT", institutions=["Bundesregierung"], locator="Ministeriumsregister")
    roster_source = "https://www.bundesregierung.de/resource/blob/975224/2345478/b818d344a5d18531936b476f47d583ab/2025-06-06-amtliche-reihenfolge-data.pdf?download=1"
    try:
        roster_fetch = fetcher.fetch(roster_source, "bundesregierung")
        roster_event_id = source_event(
            state, roster_fetch, source_id="BREG_MINISTRY_REGISTER", external_id="amtliche-reihenfolge-2025-06-06",
            event_type="FEDERAL_GOVERNMENT_ROSTER", title="Amtliche Reihenfolge der Mitglieder der Bundesregierung",
            published_at="2025-06-06", body=None, source_function="CONTEXT", institutions=["Bundesregierung"],
            attachments=[{"url":roster_source,"sha256":roster_fetch.content_hash,"download_status":"CONTENT_ADDRESSED"}], locator="Amtliche PDF"
        )
    except Exception:
        roster_event_id = source_event_id
        state.warnings.append({"source":"BREG_MINISTRY_REGISTER","record":"term-start-roster","warning":"Amtliche Reihenfolge nicht separat abrufbar; Ministeriumsregister als Ersatzprovenienz verwendet."})
    start_roster = {
        "BMF":"Lars Klingbeil", "BMI":"Alexander Dobrindt", "AA":"Johann Wadephul", "BMVg":"Boris Pistorius",
        "BMWE":"Katherina Reiche", "BMFTR":"Dorothee Bär", "BMJV":"Stefanie Hubig", "BMBFSFJ":"Karin Prien",
        "BMAS":"Bärbel Bas", "BMDS":"Karsten Wildberger", "BMV":"Patrick Schnieder", "BMUKN":"Carsten Schneider",
        "BMG":"Nina Warken", "BMLEH":"Alois Rainer", "BMZ":"Reem Alabali-Radovan", "BMWSB":"Verena Hubertz"
    }
    source_map = read_json(BASE_DIR / "config" / "ministry-source-map.json")["ministries"]
    rows = []
    for entry in source_map:
        rows.append({
            **entry,
            "government_term_id":"bund-2025",
            "office_holder_assignments":[{"name":start_roster.get(entry["ministry_id"]),"role":"Bundesministerin/Bundesminister","term_start":TERM_START,"term_end":None,"source_event_id":roster_event_id,"status":"TERM_START_ROSTER; späterer Wechsel wird nicht ohne amtliche Datumsquelle angenommen"}],
            "coverage_status":"BEST_EFFORT_DEFINED_SOURCE_SCOPE",
            "persons_used_for_assignment_only":True,
            "person_assessment":None,
        })
    write_json(state.output / "config" / "federal-ministry-registry.json", {"schema_version":"1.0","as_of":state.end,"government_term_start":TERM_START,"source_event_id":source_event_id,"ministries":rows})
    return rows


def sitemap_urls(fetcher: Fetcher, url: str, ministry_id: str, state: State, depth: int = 0) -> list[tuple[str, str | None]]:
    if depth > 2:
        return []
    fetched = fetcher.fetch(url, f"ministries/{ministry_id.lower()}")
    try:
        payload = decode_content(fetched.body)
    except (OSError, EOFError) as exc:
        state.warnings.append({"source":ministry_id,"record":url,"warning":f"GZIP-Sitemap nicht lesbar: {type(exc).__name__}"})
        return []
    try:
        root = ET.fromstring(payload)
    except ET.ParseError:
        return []
    tag = root.tag.rsplit("}", 1)[-1]
    if tag == "sitemapindex":
        out = []
        for node in root.findall(".//{*}sitemap"):
            loc = node.findtext("{*}loc")
            if loc:
                try:
                    out.extend(sitemap_urls(fetcher, loc, ministry_id, state, depth + 1))
                except Exception as exc:
                    state.warnings.append({"source":ministry_id,"record":loc,"warning":f"Sitemap-Teil nicht verfügbar: {type(exc).__name__}"})
        return out
    out = []
    for node in root.findall(".//{*}url"):
        loc = node.findtext("{*}loc")
        if loc:
            out.append((loc, iso_date(node.findtext("{*}lastmod"))))
    return out


def html_discovery_links(fetched: FetchResult, base_url: str) -> list[tuple[str, str | None, str]]:
    doc = html_doc(fetched.body)
    out = []
    for anchor in doc.xpath("//main//a[@href] | //a[@href]"):
        raw_href = anchor.get("href")
        if raw_href.startswith(("DE/", "SharedDocs/", "SiteGlobals/", "Redaktion/", "Navigation/")):
            raw_href = "/" + raw_href
        href = urllib.parse.urljoin(base_url, raw_href)
        if href.startswith("https://"):
            out.append((href, None, clean_text(anchor.text_content())))
    return unique(out)


def ministry_source_function(title: str, body: str) -> str:
    evidence = f"{title} {body[:1500]}".lower()
    if "referentenentwurf" in evidence or "verordnungsentwurf" in evidence or "gesetzentwurf" in evidence:
        return "MINISTRY_DRAFT"
    if "förderrichtlinie" in evidence or "foerderrichtlinie" in evidence or "förderprogramm" in evidence:
        return "FUNDING_RULE"
    if "evaluation" in evidence or "evaluationsbericht" in evidence:
        return "EVALUATION"
    if "monitoring" in evidence:
        return "MONITORING_DATA"
    if "richtlinie" in evidence or "verwaltungsvorschrift" in evidence:
        return "IMPLEMENTATION_RULE"
    return "COMMUNICATION"


def ministry_ingest(state: State, fetcher: Fetcher, registry: list[dict[str, Any]], per_ministry_limit: int, workers: int) -> None:
    source_map = read_json(BASE_DIR / "config" / "ministry-source-map.json")
    url_terms = source_map["candidate_url_terms"]
    title_terms = [term.lower() for term in source_map["candidate_title_terms"]]
    strong_terms = ["gesetz", "verordnung", "richtlinie", "strategie", "aktionsplan", "förderprogramm", "foerderprogramm", "vereinbarung", "memorandum", "evaluation", "monitoring", "beschlossen", "erlassen", "tritt in kraft", "umsetzung"]
    for ministry in registry:
        started = utc_now()
        ministry_id = ministry["ministry_id"]
        found: dict[str, tuple[str | None, str]] = {}
        discovery_failures = 0
        for discovery_url in ministry["discovery_urls"]:
            try:
                fetched = fetcher.fetch(discovery_url, f"ministries/{ministry_id.lower()}")
                if fetch_is_access_challenge(fetched):
                    discovery_failures += 1
                    state.errors.append({
                        "source":f"ministries/{ministry_id.lower()}", "url":discovery_url,
                        "status":fetched.status, "error":"ACCESS_CHALLENGE",
                        "message":"Amtlicher Quellenbereich antwortete mit einer technischen Zugriffssperre statt mit dem Quellenbestand.",
                    })
                    continue
                if (
                    "xml" in fetched.content_type
                    or "gzip" in fetched.content_type
                    or fetched.body.startswith(b"\x1f\x8b")
                    or fetched.body.lstrip().startswith(b"<?xml")
                ):
                    for target, lastmod in sitemap_urls(fetcher, discovery_url, ministry_id, state):
                        found[target] = (lastmod, "SITEMAP")
                else:
                    for target, lastmod, link_text in html_discovery_links(fetched, discovery_url):
                        found[target] = (lastmod, link_text)
            except Exception:
                discovery_failures += 1
        candidates = []
        for url, (lastmod, hint) in found.items():
            searchable = f"{url} {hint}".lower()
            if lastmod and lastmod < state.start:
                continue
            if ministry_id == "BMWE" and "/Redaktion/DE/Artikel/Service/Gesetzesvorhaben/" not in url:
                continue
            if not any(term in searchable for term in url_terms) and not any(term in searchable for term in title_terms):
                continue
            candidates.append((url, lastmod, hint))
        # Bei begrenzten Quellenräumen müssen die jüngsten amtlichen
        # Veröffentlichungen des Untersuchungszeitraums zuerst verarbeitet werden.
        candidates.sort(key=lambda item: (item[1] or "", item[0]), reverse=True)
        candidate_total = len(candidates)
        limit_reached = candidate_total > per_ministry_limit
        if limit_reached:
            candidates = candidates[:per_ministry_limit]
        processed = 0
        created = 0
        page_failures = 0

        def fetch_candidate(item: tuple[str, str | None, str]) -> tuple[str, str | None, str, FetchResult | None]:
            url, lastmod, hint = item
            try:
                fetched = fetcher.fetch(url, f"ministries/{ministry_id.lower()}", timeout=20, attempts=2)
                if fetch_is_access_challenge(fetched):
                    state.errors.append({
                        "source":f"ministries/{ministry_id.lower()}", "url":url,
                        "status":fetched.status, "error":"ACCESS_CHALLENGE",
                        "message":"Amtliche Einzelseite antwortete mit einer technischen Zugriffssperre statt mit dem Dokument.",
                    })
                    return url, lastmod, hint, None
            except Exception:
                return url, lastmod, hint, None
            return url, lastmod, hint, fetched

        with ThreadPoolExecutor(max_workers=max(1, workers), thread_name_prefix=f"ministry-{ministry_id.lower()}") as executor:
            fetched_candidates = list(executor.map(fetch_candidate, candidates))

        for url, lastmod, hint, fetched in fetched_candidates:
            if fetched is None:
                page_failures += 1
                continue
            payload = decode_content(fetched.body)
            is_pdf = fetched.content_type.lower().startswith("application/pdf") or payload.startswith(b"%PDF")
            if is_pdf:
                doc = None
                title = clean_text(hint) if clean_text(hint) not in {"", "SITEMAP"} else title_from_url(url)
                published = lastmod
                body = ""
                event_warnings = ["Binärdokument gespeichert; Volltext in diesem Ingest nicht extrahiert."]
                attachments = [{"url":fetched.final_url,"content_type":"application/pdf","raw_blob_sha256":fetched.content_hash}]
            else:
                doc = html_doc(payload)
                title = page_title(doc)
                published = page_date(doc) or lastmod
                body = main_text(doc)
                event_warnings = []
                attachments = []
            if published and not in_period(published, state.start, state.end):
                continue
            event_id = source_event(
                state, fetched, source_id=f"MINISTRY_{ministry_id}", external_id=None,
                event_type="MINISTRY_PUBLICATION", title=title, published_at=published,
                summary=hint, body=body, source_function=ministry_source_function(title, body),
                ministries=[ministry_id], institutions=[ministry["official_name"]], attachments=attachments,
                warnings=event_warnings, locator="amtliche Ressortseite oder amtliches Binärdokument"
            )
            processed += 1
            if published is None:
                state.manual_review.append({
                    "object_id":event_id,
                    "reason":"DATE_REQUIRED_BEFORE_GOVERNMENT_ACTION_CANONICALIZATION",
                    "source":f"MINISTRY_{ministry_id}",
                    "priority":"P1",
                })
                continue
            evidence = f"{title} {body[:2000]}".lower()
            if not any(term in evidence for term in strong_terms):
                continue
            action_id = stable_id("govaction:ministry", ministry_id, normalize_title(title), published or "", url)
            record = action_record(
                action_id, title, [event_id], kind=action_type(title), status="ANNOUNCED",
                ministries=[ministry_id], first_date=published, source_completeness="BEST_EFFORT_DEFINED_SOURCE_SCOPE",
                notes=["Eigenständiger Ressortkandidat aus dem definierten amtlichen Quellenraum; materielle Einordnung und Statusprüfung bleiben fachlich offen."],
                provenance=[{"field":"title_official_preferred","value":title,"source_event_id":event_id,"locator":"Seitentitel"}]
            )
            record["manual_review_required"] = True
            same_title_candidates = [
                action for action in state.actions
                if ministry_id in action.get("responsible_ministries", [])
                and normalize_title(action["title_canonical"]) == normalize_title(title)
            ]
            state.actions.append(record)
            state.add_relationship(action_id, event_id, "HAS_SOURCE_EVENT", [event_id], "EXACT", "EXPLICIT_REFERENCE", "CONFIRMED")
            for candidate in same_title_candidates:
                state.add_relationship(candidate["government_action_id"], action_id, "POSSIBLE_SAME_AS", [event_id], "HIGH", "SEMANTIC_CANDIDATE", "REVIEW_REQUIRED")
                state.manual_review.append({"object_id":action_id,"candidate_id":candidate["government_action_id"],"reason":"POSSIBLE_MERGE_REQUIRED","similarity":1.0,"priority":"P1"})
            state.manual_review.append({"object_id":action_id,"reason":"MINISTRY_PUBLICATION_REQUIRES_GOVERNMENT_ACTION_CONFIRMATION","source":f"MINISTRY_{ministry_id}","priority":"P1"})
            created += 1
        note = ""
        if limit_reached:
            note = f"Kandidatenlimit {per_ministry_limit} erreicht; Quellenraum nicht vollständig verarbeitet."
            state.warnings.append({"source":f"MINISTRY_{ministry_id}","record":"source-scope","warning":note})
        state.source_coverage.append({
            "source_id":f"MINISTRY_{ministry_id}", "scope":"; ".join(ministry["discovery_urls"]),
            "coverage_status":"BEST_EFFORT_DEFINED_SOURCE_SCOPE", "period_start":state.start, "period_end":state.end,
            "found_records":len(found), "processed_records":processed, "failed_records":discovery_failures + page_failures,
            "found_items":candidate_total, "processed_items":created, "excluded_items":max(0, processed-created),
            "unexplained_items":max(0, candidate_total-processed), "missing_sequence_numbers":"", "note":note,
            "started_at":started, "finished_at":utc_now()
        })
        state.log(f"ministry:{ministry_id}", "completed", discovered=len(found), candidates=candidate_total, source_events=processed, action_candidates=created, failures=discovery_failures+page_failures, limit_reached=limit_reached)


def legal_ingest(state: State, fetcher: Fetcher) -> None:
    started = utc_now()
    feeds = [
        ("RECHT_BUND", "https://www.recht.bund.de/rss/feeds/rss_bgbl-1-2.xml?nn=211452", "LEGAL_TEXT"),
        ("GESETZE_IM_INTERNET", "https://www.gesetze-im-internet.de/aktuDienst-rss-feed.xml", "CONSOLIDATED_LAW"),
    ]
    total = 0
    for source_id, url, function in feeds:
        try:
            fetched = fetcher.fetch(url, "recht-bund" if source_id == "RECHT_BUND" else "gesetze-im-internet")
            root = ET.fromstring(fetched.body)
        except Exception:
            continue
        for item in root.findall(".//item"):
            title = clean_text(item.findtext("description") or item.findtext("title"))
            link = clean_text(item.findtext("link"))
            embedded_date = iso_date(title)
            if not embedded_date:
                match = re.search(r"vom\s+(\d{1,2}\.\s*[A-Za-zÄÖÜäöü]+\s+\d{4}|\d{1,2}\.\d{1,2}\.\d{4})", title)
                embedded_date = iso_date(match.group(1)) if match else None
            if source_id == "RECHT_BUND":
                embedded_date = iso_date(item.findtext("pubDate")) or embedded_date
            if embedded_date and not in_period(embedded_date, state.start, state.end):
                continue
            bgbl = clean_text(item.findtext("title"))
            event_id = source_event(
                state, fetched, source_id=source_id, external_id=link or bgbl, event_type="PROMULGATED_LEGAL_ACT" if source_id == "RECHT_BUND" else "CONSOLIDATED_LAW_UPDATE",
                title=title or bgbl, published_at=embedded_date, summary=bgbl, body=None, source_function=function,
                canonical_url=link or url, official_ids={"bgbl":bgbl,"eli":link if "/eli/" in link else None}, institutions=["Bund"] if source_id == "RECHT_BUND" else ["Bundesamt für Justiz"], legal_acts=[title] if title else [], locator="RSS-Eintrag"
            )
            total += 1
            norm = normalize_title(re.sub(r"\s+vom\s+\d.*$", "", title, flags=re.I))
            candidates = [action for action in state.actions if normalize_title(action["title_canonical"]) == norm]
            if len(candidates) == 1:
                action = candidates[0]
                action["source_event_ids"] = unique(action["source_event_ids"] + [event_id])
                if link and "/eli/" in link:
                    action["official_identifiers"]["eli"] = unique(action["official_identifiers"]["eli"] + [link])
                if bgbl:
                    action["official_identifiers"]["bgbl"] = unique(action["official_identifiers"]["bgbl"] + [bgbl])
                action["promulgated_date"] = embedded_date
                action["lifecycle_status"] = "PROMULGATED"
                action["lifecycle_events"].append({"status":"PROMULGATED","date":embedded_date,"source_event_id":event_id})
                state.add_relationship(action["government_action_id"], event_id, "HAS_SOURCE_EVENT", [event_id], "EXACT", "OFFICIAL_IDENTIFIER", "CONFIRMED")
    toc_url = "https://www.gesetze-im-internet.de/gii-toc.xml"
    try:
        toc = fetcher.fetch(toc_url, "gesetze-im-internet")
        source_event(state, toc, source_id="GESETZE_IM_INTERNET", external_id="gii-toc", event_type="CONSOLIDATED_LAW_REGISTER_SNAPSHOT", title="Tagesaktuelles Inhaltsverzeichnis des geltenden Bundesrechts", published_at=state.end, body=None, source_function="CONSOLIDATED_LAW", institutions=["Bundesamt für Justiz"], locator="gii-toc.xml")
    except Exception:
        pass
    state.source_coverage.append({"source_id":"RECHT_BUND_AND_GII","scope":"aktuelle amtliche RSS-/XML-Zugänge; ältere Verkündungen zusätzlich über DIP-Fundstellen","coverage_status":"BEST_EFFORT_DEFINED_SOURCE_SCOPE","period_start":state.start,"period_end":state.end,"found_records":total,"processed_records":total,"failed_records":0,"found_items":total,"processed_items":total,"excluded_items":0,"unexplained_items":0,"missing_sequence_numbers":"","started_at":started,"finished_at":utc_now()})
    state.log("legal", "completed", legal_events=total)


def coalition_candidates(state: State, path: Path | None) -> None:
    if not path or not path.exists():
        state.warnings.append({"source":"COALITION_COMMITMENTS","record":"registry","warning":"Kein strukturiertes Koalitionsvertragsregister übergeben."})
        return
    payload = read_json(path)
    registers = payload.get("registers", []) if isinstance(payload, dict) else []
    coalition = next((entry for entry in registers if str(entry.get("source_key", "")).startswith("coalition-")), None)
    if not coalition:
        state.warnings.append({"source":"COALITION_COMMITMENTS","record":"registry","warning":"Koalitionsvertragsregister nicht gefunden."})
        return
    commitments = coalition.get("commitments", [])
    for action in state.actions:
        action_tokens = set(normalize_title(action["title_canonical"]).split())
        if len(action_tokens) < 3:
            continue
        scored = []
        for commitment in commitments:
            text = commitment.get("exact_text") or commitment.get("commitment_text") or ""
            tokens = set(normalize_title(text).split())
            if not tokens:
                continue
            overlap = len(action_tokens & tokens)
            jaccard = overlap / max(1, len(action_tokens | tokens))
            containment = overlap / max(1, min(len(action_tokens), len(tokens)))
            score = max(jaccard, containment)
            if overlap >= 3 and containment >= 0.55:
                scored.append((score, commitment))
        for score, commitment in sorted(scored, key=lambda item: item[0], reverse=True)[:3]:
            ref = commitment.get("commitment_key")
            if not ref:
                continue
            action["coalition_commitment_refs"].append({"commitment_key":ref,"relationship_status":"REVIEW_REQUIRED","similarity_signal":round(score,4)})
            state.add_relationship(action["government_action_id"], ref, "PARTIALLY_IMPLEMENTS_COALITION_COMMITMENT", [], "LOW", "SEMANTIC_CANDIDATE", "REVIEW_REQUIRED")
            state.manual_review.append({"object_id":action["government_action_id"],"candidate_id":ref,"reason":"COALITION_RELATIONSHIP_REQUIRES_REVIEW","similarity":round(score,4),"priority":"P2"})


def audit_and_package(state: State, ministry_registry_rows: list[dict[str, Any]]) -> None:
    # Hard safety: forbidden assessment fields must not exist anywhere in canonical objects.
    forbidden = {"impact_direction","sdg_direction","sdg_plus_direction","net_impact","nwi","effectiveness_score","democracy_score","government_score","minister_score","party_score","positive_effect","negative_effect"}
    contaminated = []
    for action in state.actions:
        found = forbidden & set(action)
        if found:
            contaminated.append({"object_id":action["government_action_id"],"fields":";".join(sorted(found))})
    if contaminated:
        raise RuntimeError(f"FORBIDDEN_ASSESSMENT_FIELDS: {contaminated[:3]}")
    write_jsonl(state.output / "normalized" / "source-events.jsonl", state.source_events)
    write_jsonl(state.output / "canonical" / "government-actions.jsonl", state.actions)
    write_jsonl(state.output / "canonical" / "relationships.jsonl", state.relationships)
    write_jsonl(state.output / "canonical" / "external-actor-events.jsonl", state.external_events)
    write_json(state.output / "canonical" / "government-term.json", {
        "government_term_id":"bund-2025", "government_term_start":TERM_START, "data_period_end":state.end,
        "official_source_url":"https://www.bundestag.de/dokumente/textarchiv/2025/kw19-de-kanzlerwahl-1062470",
        "source_statement":"Bundeskanzlerwahl, Ernennung und Vereidigung am 6. Mai 2025.",
        "no_impact_assessment":True
    })
    write_jsonl(state.output / "audit" / "INGESTION-LOG.jsonl", state.logs)
    write_csv(state.output / "audit" / "SOURCE-COVERAGE.csv", state.source_coverage, ["source_id","scope","coverage_status","period_start","period_end","found_records","processed_records","failed_records","found_items","processed_items","excluded_items","unexplained_items","missing_sequence_numbers","note","started_at","finished_at"])
    write_csv(state.output / "audit" / "INGESTION-ERRORS.csv", state.errors, ["source","url","status","error","message"])
    write_csv(state.output / "audit" / "PARSE-WARNINGS.csv", state.warnings, ["source","record","warning"])
    duplicate_rows = [{"source_action_id":rel["source_object_id"],"target_action_id":rel["target_object_id"],"confidence":rel["confidence"],"review_status":rel["review_status"]} for rel in state.relationships if rel["relationship_type"]=="POSSIBLE_SAME_AS"]
    write_csv(state.output / "audit" / "DUPLICATE-CANDIDATES.csv", duplicate_rows, ["source_action_id","target_action_id","confidence","review_status"])
    unresolved = [{"relationship_id":rel["relationship_id"],"source_object_id":rel["source_object_id"],"target_object_id":rel["target_object_id"],"relationship_type":rel["relationship_type"],"confidence":rel["confidence"],"review_status":rel["review_status"]} for rel in state.relationships if rel["review_status"]=="REVIEW_REQUIRED"]
    write_csv(state.output / "audit" / "UNRESOLVED-RELATIONSHIPS.csv", unresolved, ["relationship_id","source_object_id","target_object_id","relationship_type","confidence","review_status"])
    fields = sorted({key for row in state.manual_review for key in row} | {"object_id","reason","priority"})
    write_csv(state.output / "audit" / "MANUAL-REVIEW-QUEUE.csv", state.manual_review, fields)
    action_types = Counter(action["action_type"] for action in state.actions)
    status_counts = Counter(action["lifecycle_status"] for action in state.actions)
    counts = {
        "source_events":len(state.source_events), "government_actions":len(state.actions), "external_actor_events":len(state.external_events),
        "relationships":len(state.relationships), "dip_links":sum(1 for rel in state.relationships if rel["relationship_type"]=="RELATED_TO_PARLIAMENTARY_CASE"),
        "bgbl_or_eli_links":sum(1 for action in state.actions if action["official_identifiers"]["bgbl"] or action["official_identifiers"]["eli"]),
        "coalition_commitment_candidates":sum(len(action["coalition_commitment_refs"]) for action in state.actions),
        "possible_duplicates":len(duplicate_rows), "manual_review_cases":len(state.manual_review), "ingestion_errors":len(state.errors), "parse_warnings":len(state.warnings),
        "government_actions_without_cabinet_reference":sum(1 for action in state.actions if not action["cabinet_decision_date"]),
        "action_types":dict(sorted(action_types.items())), "lifecycle_statuses":dict(sorted(status_counts.items()))
    }
    write_json(state.output / "audit" / "COUNTS.json", counts)
    cabinet = next((row for row in state.source_coverage if row["source_id"]=="BREG_CABINET_ARCHIVE"), {})
    coverage_report = f"""# Coverage Report

Untersuchungszeitraum: {state.start} bis {state.end}

## Kabinett

- veröffentlichte Sitzungen im definierten Register: {cabinet.get('found_records', 0)}
- verarbeitete Sitzungen: {cabinet.get('processed_records', 0)}
- Sitzungen mit Abruf-/Parserfehlern: {cabinet.get('failed_records', 0)}
- gefundene Kabinettsgegenstände: {cabinet.get('found_items', 0)}
- verarbeitete Kabinettsgegenstände: {cabinet.get('processed_items', 0)}
- dokumentiert ausgeschlossene Gegenstände: {cabinet.get('excluded_items', 0)}
- unerklärte Gegenstände: {cabinet.get('unexplained_items', 0)}
- im veröffentlichten Nummernlauf fehlende Sitzungsnummern: {cabinet.get('missing_sequence_numbers') or 'keine'}

Die Vollständigkeitsaussage bezieht sich nur auf das veröffentlichte amtliche Ergebnisregister. Fehlende Nummern im Sitzungsnummernlauf stehen in der manuellen Prüfliste und werden nicht als still verarbeitet behauptet.

## Ressorts

Alle {len(ministry_registry_rows)} Bundesministerien besitzen eine eigene Source Map. Da nicht jedes Ressort ein vollständiges historisches Register anbietet, ist der Ressortstatus grundsätzlich `BEST_EFFORT_DEFINED_SOURCE_SCOPE`. Die exakten Quellenbereiche und Zähler stehen in `SOURCE-COVERAGE.csv`.

## Parlament und Recht

- DIP-Verknüpfungen: {counts['dip_links']}
- GovernmentActions mit BGBl/ELI: {counts['bgbl_or_eli_links']}
- Koalitionsvertragskandidaten: {counts['coalition_commitment_candidates']} - ausschließlich `REVIEW_REQUIRED`, keine Erfüllungsbehauptung

## Grenzen

- Ministeriums-Presseinformationen sind SourceEvents und nur regelbasierte Handlungskandidaten. Sie benötigen bei eigenständigen Ressortfällen eine fachliche Bestätigung.
- Der aktuelle BGBl-RSS-Zugang hat keinen vollständigen rückwirkenden Nenner für den gesamten Zeitraum. Historische Rechtsverknüpfungen werden deshalb zusätzlich aus DIP-Fundstellen gewonnen.
- Es wurde keine Wirkungsbewertung, keine SDG-Richtung und kein Personenscore erzeugt.
"""
    (state.output / "audit" / "COVERAGE-REPORT.md").write_text(coverage_report, encoding="utf-8")
    quality = f"""# Data Quality Report

- Schema-Vertrag: 1.0
- Parser-Version: {PARSER_VERSION}
- Rohabrufe mit SHA-256: {sum(1 for _ in (state.output / 'raw').rglob('*.json'))}
- einzigartige Binärblobs: {sum(1 for path in (state.output / 'blobs' / 'sha256').rglob('*') if path.is_file())}
- Parse-Warnungen: {len(state.warnings)}
- Ingestionsfehler: {len(state.errors)}
- mögliche Duplikate, nicht automatisch zusammengeführt: {len(duplicate_rows)}
- offene Relationen: {len(unresolved)}
- manuelle Prüffälle: {len(state.manual_review)}

`null` und `UNKNOWN` bleiben fachlich von `0` getrennt. Unsichere Titelähnlichkeiten wurden nicht automatisch gemergt. Personen erscheinen nur als amtliche Funktionsträger im Ressortregister und werden nicht bewertet.
"""
    (state.output / "audit" / "DATA-QUALITY-REPORT.md").write_text(quality, encoding="utf-8")
    report = f"""# CODEX INGESTION REPORT

## Ergebnis

Die amtliche Faktenbasis wurde für den Zeitraum {state.start} bis {state.end} erzeugt. Sie enthält {counts['source_events']} SourceEvents, {counts['government_actions']} GovernmentActions und {counts['relationships']} dokumentierte Beziehungen. Es wurden keine Wirkungsbewertungen erzeugt und keine Website veröffentlicht.

1. Integrierte Quellen: Bundesregierung/Kabinettsarchiv, Bundesministeriumsregister, definierte Ressortquellen, DIP, recht.bund.de und Gesetze im Internet.
2. Schnittstellen: DIP REST API, amtliche RSS-/XML-Zugänge und als solche gekennzeichnete HTML-Adapter.
3. Gefundene Kabinettssitzungen: {cabinet.get('found_records', 0)}.
4. Gefundene Kabinettsgegenstände: {cabinet.get('found_items', 0)}.
5. GovernmentActions: {counts['government_actions']}.
6. DIP-Verknüpfungen: {counts['dip_links']}.
7. BGBl-/ELI-Verknüpfungen: {counts['bgbl_or_eli_links']}.
8. Koalitionsvertragskandidaten: {counts['coalition_commitment_candidates']} - nie automatisch als erfüllt gewertet.
9. Mögliche Duplikate: {counts['possible_duplicates']}.
10. Manuelle Prüffälle: {counts['manual_review_cases']}.
11. Nicht vollständig erschließbare Quellen: Ressortarchive ohne vollständigen maschinenlesbaren Nenner und der rückwirkend begrenzte BGBl-RSS-Zugang; Details in `SOURCE-COVERAGE.csv`.
12. Canonicalization: amtliche IDs und exakte eindeutige Titel zuerst; semantische Ähnlichkeit nur als `POSSIBLE_SAME_AS`.
13. Bekannte Datenlücken: siehe `MANUAL-REVIEW-QUEUE.csv`, `PARSE-WARNINGS.csv` und `INGESTION-ERRORS.csv`.
14. Phase 2: Haushalt, Förderung, Vollzug, Beschaffung, Statistik, Beteiligungen und Lobbyregister sind in `future-source-registry.json` inventarisiert.
15. Tests: Schema-, Null-, ID-, Deduplikations- und Verbotstests werden mit `scripts/validate/validate_package.py` und `tests/` ausgeführt.
16. Teststatus: wird nach Validierung in `audit/VALIDATION-RESULT.json` dokumentiert.

## Abgrenzung

Dieser Datenbestand beschreibt amtlich belegtes Regierungshandeln und seinen dokumentierten Lebenszyklus. Er trifft keine Aussage darüber, ob ein Ziel erreicht wurde oder welche Wirkung eingetreten ist.

Herausgeber: Institut für Wirkungsökonomie
"""
    (state.output / "CODEX-INGESTION-REPORT.md").write_text(report, encoding="utf-8")


def copy_contract_assets(output: Path) -> None:
    for name in ["contracts", "config", "scripts", "tests"]:
        source = BASE_DIR / name
        target = output / name
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(source, target)
    shutil.copy2(BASE_DIR / "README.md", output / "README.md")
    shutil.copy2(BASE_DIR / "requirements.txt", output / "requirements.txt")


def manifest(output: Path, start: str, end: str) -> None:
    files = []
    for path in sorted(output.rglob("*")):
        if path.is_file() and path.name not in {"MANIFEST.json", "VALIDATION-RESULT.json"}:
            data = path.read_bytes()
            files.append({"path":str(path.relative_to(output)),"sha256":sha256(data),"size":len(data)})
    write_json(output / "MANIFEST.json", {
        "package_id":"WOEK-GOVERNMENT-DATA-2025-2026-INGEST-1.0",
        "schema_version":"1.0", "period_start":start, "period_end":end,
        "generated_at":utc_now(), "publisher":"Institut für Wirkungsökonomie",
        "purpose":"Amtliche Fakten- und Verknüpfungsebene; keine Wirkungsbewertung",
        "leading_terminology":"WOeK Begriffsleitfaden v1.5 FINAL",
        "leading_master_register":"WOeK Masterregister v1.4 FINAL 2026-08-16",
        "leading_master_register_sha256":"b70ad437dc1ab8d0b4264658346d5c10910d83309a51902e32dfe047e072ebcc",
        "files":files
    })


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--start", default=TERM_START)
    parser.add_argument("--end", default=DEFAULT_END)
    parser.add_argument("--commitment-register", type=Path)
    parser.add_argument("--ministry-max-candidates", type=int, default=300)
    parser.add_argument("--ministry-workers", type=int, default=3)
    parser.add_argument("--reuse-raw", action="store_true")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    copy_contract_assets(args.output)
    state = State(args.output, args.start, args.end)
    fetcher = Fetcher(state, reuse_existing=args.reuse_raw)
    cabinet_ingest(state, fetcher)
    registry = ministry_registry(state, fetcher)
    ministry_ingest(state, fetcher, registry, max(1, args.ministry_max_candidates), max(1, min(args.ministry_workers, 4)))
    dip_ingest(state, fetcher)
    legal_ingest(state, fetcher)
    coalition_candidates(state, args.commitment_register)
    audit_and_package(state, registry)
    manifest(args.output, args.start, args.end)
    print(json.dumps({"output":str(args.output),"source_events":len(state.source_events),"government_actions":len(state.actions),"relationships":len(state.relationships),"errors":len(state.errors),"warnings":len(state.warnings)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
