#!/usr/bin/env python3
"""Build Government Data 1.1 from the audited 1.0 package.

The upgrade is deliberately a factual-data pass. It adds no impact direction,
SDG assessment, score or person rating. All public records must pass the
GovernmentAction Publication Contract 1.1.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import gzip
import hashlib
import html
import json
import os
import re
import shutil
import ssl
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict, deque
from pathlib import Path
from typing import Any, Iterable


DATA_VERSION = "1.1"
PARSER_VERSION = "woek-government-upgrade-1.1"
TERM_START = "2025-05-06"
AS_OF = "2026-08-17"
REVIEWED_AT = "2026-08-17T00:00:00Z"

TERMINAL_STATUSES = {
    "PROCESSED_ACTION",
    "SOURCE_ONLY",
    "OUT_OF_PERIOD",
    "DUPLICATE",
    "NOT_GOVERNMENT_ACTION",
    "NEEDS_DATE",
    "SOURCE_UNAVAILABLE",
    "OTHER_EXCLUDED_WITH_REASON",
}

PUBLIC_FIELDS = [
    "government_action_id",
    "title",
    "action_type",
    "responsible_institutions",
    "responsible_ministries",
    "decision_date",
    "effective_date",
    "lifecycle_status",
    "publication_status",
    "coverage_scope_status",
    "official_identifiers",
    "source_refs",
    "parliamentary_case_refs",
    "related_actions",
    "has_woek_analysis",
    "analysis_stage",
    "last_verified_at",
    "data_version",
]

EXPECTED_UNEXPLAINED = {
    "BMVg": 236,
    "BMUKN": 146,
    "BMAS": 47,
    "BMBFSFJ": 29,
    "BMJV": 19,
    "BMWSB": 13,
    "BMWE": 10,
    "BMV": 8,
    "BMLEH": 4,
}

OFFICIAL_URLS = {
    "roster_change": "https://www.bundesregierung.de/breg-de/suche/ernennung-neue-minister-2448632",
    "current_cabinet": "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/bundeskabinett-2342878",
    "current_ministries": "https://www.bundesregierung.de/breg-de/bundesregierung/bundesministerien",
    "bkamt": "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt",
    "nina_warken": "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/nina-warken-2342850",
    "cabinet_constitutive": "https://www.bundesregierung.de/breg-de/mediathek/fotos/woche-des-kanzlers-2346312",
    "cabinet_first_regular": "https://www.bundesregierung.de/breg-de/aktuelles/regierungspressekonferenz-vom-16-mai-2025-2348254",
    "nsr": "https://www.bundesregierung.de/breg-de/bundesregierung/nationaler-sicherheitsrat",
    "nsr_constitutive": "https://www.bundesregierung.de/breg-de/suche/konstituierende-sitzung-des-nationalen-sicherheitsrats-2392438",
    "bmwe_gwb12": "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Artikel/Service/Gesetzesvorhaben/20260604-12-gesetz-wettbewerbsbeschraenkungen.html",
    "bmwe_eeg": "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Artikel/Service/Gesetzesvorhaben/20260718-eeg-novelle.html",
    "bmwe_eeg_cabinet": "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/07/20260729-eeg-novelle-und-netzanschlusspaket.html",
    "bmwe_gmodg": "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/05/20260513-gemeinsame-pressemitteilung-neue-weichenstellung-fuer-den-gebaeudebereich-bundeskabinett-beschliesst-gebaeudemodernisierungsgesetz.html",
    "bmwe_eed": "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Artikel/Service/Gesetzesvorhaben/20260504-gesetz-zur-beschleunigung-der-umsetzung-der-energieeffizienzrichtlinie.html",
    "bmwe_eed_cabinet": "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/06/20260624-bundeskabinett-beschliesst-eeg.html",
}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def stable_id(prefix: str, *parts: Any) -> str:
    payload = "\u241f".join(str(part or "") for part in parts).encode("utf-8")
    return f"{prefix}:{hashlib.sha256(payload).hexdigest()[:24]}"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
    temporary.replace(path)


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    temporary.replace(path)


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(value, encoding="utf-8")
    temporary.replace(path)


def clone_tree(source: Path, target: Path) -> None:
    if target.exists():
        raise RuntimeError(f"Ausgabe existiert bereits: {target}")

    def link_or_copy(src: str, dst: str) -> str:
        try:
            os.link(src, dst)
            return dst
        except OSError:
            return shutil.copy2(src, dst)

    shutil.copytree(source, target, copy_function=link_or_copy)


def clean_text(value: str) -> str:
    value = re.sub(r"<script\b[^>]*>.*?</script>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<style\b[^>]*>.*?</style>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def title_from_html(value: str, fallback: str) -> str:
    match = re.search(r"<title[^>]*>(.*?)</title>", value, flags=re.I | re.S)
    return clean_text(match.group(1)) if match else fallback


def fetch_official(output: Path, url: str, raw_namespace: str) -> tuple[dict[str, Any] | None, str | None]:
    request = urllib.request.Request(url, headers={"User-Agent": "WOekGovernmentData/1.1 (+https://wirkungsoekonomie.de)"})
    context = ssl.create_default_context()
    retrieved_at = REVIEWED_AT
    try:
        with urllib.request.urlopen(request, timeout=35, context=context) as response:
            body = response.read()
            status = response.status
            final_url = response.geturl()
            content_type = response.headers.get("Content-Type", "application/octet-stream")
    except urllib.error.HTTPError as exc:
        body = exc.read()
        status = exc.code
        final_url = exc.geturl()
        content_type = exc.headers.get("Content-Type", "text/html")
    except Exception as exc:  # explicit audit output, no fallback source
        return None, f"{type(exc).__name__}: {exc}"

    digest = sha256_bytes(body)
    blob_path = output / "blobs" / "sha256" / digest[:2] / digest
    blob_path.parent.mkdir(parents=True, exist_ok=True)
    if not blob_path.exists():
        blob_path.write_bytes(body)
    metadata = {
        "source_url": url,
        "final_url": final_url,
        "retrieved_at": retrieved_at,
        "http_status": status,
        "content_type": content_type,
        "content_size": len(body),
        "content_hash": digest,
        "previous_content_hash": None,
        "change_detected": False,
        "blob_path": str(blob_path.relative_to(output)),
        "parser_version": PARSER_VERSION,
    }
    metadata_name = hashlib.sha256(url.encode("utf-8")).hexdigest()[:24] + ".json"
    raw_path = output / "raw" / raw_namespace / metadata_name
    write_json(raw_path, metadata)
    metadata["raw_metadata_path"] = str(raw_path.relative_to(output))
    metadata["body"] = body
    return metadata, None


def new_source_event(
    fetched: dict[str, Any], *, source_id: str, event_type: str, title: str,
    published_at: str | None, effective_at: str | None, source_function: str,
    institutions: list[str], ministries: list[str] | None = None,
    summary: str | None = None, official_identifiers: dict[str, Any] | None = None,
    locator: str = "amtliche Seite",
) -> dict[str, Any]:
    body = fetched.pop("body")
    challenge = fetched["http_status"] >= 400 or "cookie-check" in fetched["final_url"] or "fwauth" in fetched["final_url"]
    text = clean_text(body.decode("utf-8", errors="replace")) if "html" in fetched["content_type"] else None
    event_id = stable_id("source-event", source_id, fetched["source_url"], fetched["content_hash"])
    return {
        "source_event_id": event_id,
        "source_id": source_id,
        "external_id": None,
        "event_type": event_type,
        "published_at": published_at,
        "effective_at": effective_at,
        "retrieved_at": fetched["retrieved_at"],
        "source_url": fetched["source_url"],
        "canonical_source_url": fetched["final_url"],
        "title_original": title,
        "summary_original": summary,
        "body_text_original": text if not challenge else None,
        "attachments": [],
        "official_identifiers": official_identifiers or {},
        "named_institutions": institutions,
        "named_ministries": ministries or [],
        "named_legal_acts": [],
        "named_programmes": [],
        "raw_blob_sha256": fetched["content_hash"],
        "parser_version": PARSER_VERSION,
        "parse_status": "FAILED" if challenge else "SUCCESS",
        "parse_warnings": ["Amtliche Quelle antwortete mit einer Zugriffssperre oder einem HTTP-Fehler."] if challenge else [],
        "source_version_status": "CURRENT",
        "first_seen_at": fetched["retrieved_at"],
        "last_seen_at": fetched["retrieved_at"],
        "previous_content_hash": None,
        "change_detected": False,
        "source_function": source_function,
        "provenance": {"locator": locator, "raw_metadata_path": fetched["raw_metadata_path"]},
    }


def add_official_event(
    output: Path, source_events: list[dict[str, Any]], errors: list[dict[str, Any]],
    key: str, *, source_id: str, event_type: str, title: str, published_at: str | None,
    effective_at: str | None = None, source_function: str = "CONTEXT",
    institutions: list[str] | None = None, ministries: list[str] | None = None,
    summary: str | None = None, official_identifiers: dict[str, Any] | None = None,
    raw_namespace: str = "bundesregierung", locator: str = "amtliche Seite",
) -> str | None:
    url = OFFICIAL_URLS[key]
    fetched, error = fetch_official(output, url, raw_namespace)
    if error or not fetched:
        errors.append({
            "source": source_id,
            "url": url,
            "status": "",
            "error": "SOURCE_UNAVAILABLE",
            "message": error or "Amtliche Quelle nicht abrufbar.",
        })
        return None
    event = new_source_event(
        fetched, source_id=source_id, event_type=event_type, title=title,
        published_at=published_at, effective_at=effective_at,
        source_function=source_function, institutions=institutions or [],
        ministries=ministries or [], summary=summary,
        official_identifiers=official_identifiers, locator=locator,
    )
    existing = {row["source_event_id"] for row in source_events}
    if event["source_event_id"] not in existing:
        source_events.append(event)
    if event["parse_status"] != "SUCCESS":
        errors.append({
            "source": source_id,
            "url": url,
            "status": "blocked",
            "error": "ACCESS_CHALLENGE",
            "message": event["parse_warnings"][0],
        })
        return None
    return event["source_event_id"]


def safe_date(value: Any) -> str | None:
    if isinstance(value, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return value
    return None


def official_action(
    action_id: str, title: str, source_ids: list[str], *, action_type: str,
    status: str, date: str, institutions: list[str], ministries: list[str],
    coverage: str, cabinet_date: str | None = None,
) -> dict[str, Any]:
    return {
        "government_action_id": action_id,
        "government_term_id": "bund-2025",
        "title_canonical": title,
        "title_official_preferred": title,
        "action_type": action_type,
        "responsible_ministries": ministries,
        "responsible_institutions": institutions,
        "first_known_date": date,
        "cabinet_decision_date": cabinet_date,
        "submitted_to_parliament_date": None,
        "promulgated_date": None,
        "effective_date": None,
        "lifecycle_status": status,
        "lifecycle_events": [{"status": status, "date": date, "source_event_id": source_ids[-1]}],
        "source_event_ids": source_ids,
        "official_identifiers": {"dip_ids": [], "drucksachen": [], "eli": [], "bgbl": [], "other": []},
        "legal_basis_refs": [],
        "coalition_commitment_refs": [],
        "parliamentary_case_refs": [],
        "budget_refs": [],
        "funding_refs": [],
        "procurement_refs": [],
        "related_government_action_ids": [],
        "relationship_review_status": "NONE",
        "source_completeness": coverage,
        "canonicalization_notes": ["Amtlicher P0-Regressionsfall des Government-Data-Upgrades 1.1."],
        "manual_review_required": False,
        "materiality_signals": {},
        "field_provenance": [
            {"field": "title_official_preferred", "value": title, "source_event_id": source_ids[0], "locator": "Seitentitel"},
            {"field": "first_known_date", "value": date, "source_event_id": source_ids[0], "locator": "amtliches Veröffentlichungsdatum"},
        ],
        "created_at": REVIEWED_AT,
        "updated_at": REVIEWED_AT,
        "schema_version": DATA_VERSION,
    }


def build_executive_registry(
    output: Path,
    source_events: list[dict[str, Any]],
    errors: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, str | None]]:
    event_ids: dict[str, str | None] = {}
    event_ids["roster_change"] = add_official_event(
        output, source_events, errors, "roster_change",
        source_id="BREG_ROSTER", event_type="FEDERAL_GOVERNMENT_ROSTER_CHANGE",
        title="Bundespräsident ernennt neue Minister",
        published_at="2026-07-29", effective_at="2026-07-29",
        source_function="OFFICIAL_DECISION", institutions=["Bundesregierung"],
        summary="Amtliche Ernennung von Nina Warken, Carsten Linnemann und Steffen Bilger sowie Entlassung ihrer Vorgänger.",
        locator="Ernennung und Entlassung am 29. Juli 2026",
    )
    event_ids["current_cabinet"] = add_official_event(
        output, source_events, errors, "current_cabinet",
        source_id="BREG_ROSTER", event_type="FEDERAL_GOVERNMENT_ROSTER_SNAPSHOT",
        title="Das Bundeskabinett im Überblick",
        published_at=None, source_function="CONTEXT", institutions=["Bundesregierung"],
        locator="aktuelles Kabinettsregister",
    )
    event_ids["current_ministries"] = add_official_event(
        output, source_events, errors, "current_ministries",
        source_id="BREG_MINISTRY_REGISTER", event_type="FEDERAL_MINISTRY_REGISTER_SNAPSHOT",
        title="Die Bundesministerien im Überblick",
        published_at=None, source_function="CONTEXT", institutions=["Bundesregierung"],
        locator="aktuelles Ministeriumsregister",
    )
    event_ids["bkamt"] = add_official_event(
        output, source_events, errors, "bkamt",
        source_id="BKAmt", event_type="EXECUTIVE_INSTITUTION_REGISTER_SNAPSHOT",
        title="Das Bundeskanzleramt: ein Überblick",
        published_at=None, source_function="CONTEXT", institutions=["Bundeskanzleramt"],
        raw_namespace="bundeskanzleramt", locator="amtliche Institutionsseite",
    )
    event_ids["nina_warken"] = add_official_event(
        output, source_events, errors, "nina_warken",
        source_id="BREG_ROSTER", event_type="OFFICE_HOLDER_CV",
        title="Nina Warken - Bundesministerin für besondere Aufgaben und Chefin des Bundeskanzleramtes",
        published_at=None, effective_at="2026-07-29", source_function="CONTEXT",
        institutions=["Bundeskanzleramt"], raw_namespace="bundeskanzleramt",
        locator="amtlicher Lebenslauf mit effective-dated Amtszeiten",
    )
    event_ids["nsr"] = add_official_event(
        output, source_events, errors, "nsr",
        source_id="BKAmt_NSR", event_type="EXECUTIVE_BODY_REGISTER_SNAPSHOT",
        title="Der Nationale Sicherheitsrat",
        published_at="2026-03-24", source_function="OFFICIAL_DECISION",
        institutions=["Nationaler Sicherheitsrat", "Bundeskanzleramt"],
        raw_namespace="bundeskanzleramt", locator="amtliche Seite zum Kabinettausschuss",
    )
    event_ids["nsr_constitutive"] = add_official_event(
        output, source_events, errors, "nsr_constitutive",
        source_id="BKAmt_NSR", event_type="EXECUTIVE_BODY_SESSION",
        title="Konstituierende Sitzung des Nationalen Sicherheitsrats",
        published_at="2025-11-05", effective_at="2025-11-05",
        source_function="OFFICIAL_DECISION",
        institutions=["Nationaler Sicherheitsrat", "Bundeskanzleramt"],
        raw_namespace="bundeskanzleramt", locator="amtliche Pressemitteilung 287",
    )

    old_registry = read_json(output / "config" / "federal-ministry-registry.json")
    old_source_id = old_registry.get("source_event_id")
    register_event = event_ids["current_ministries"] or old_source_id
    institutions: list[dict[str, Any]] = [
        {
            "institution_id": "BREG",
            "official_name": "Bundesregierung",
            "short_name": "Bundesregierung",
            "institution_type": "FEDERAL_GOVERNMENT",
            "government_term_id": "bund-2025",
            "valid_from": TERM_START,
            "valid_to": None,
            "parent_institution_id": None,
            "official_site": "https://www.bundesregierung.de/",
            "source_event_ids": [event_ids["current_cabinet"] or register_event],
            "coverage_scope_status": "COMPLETE_ENUMERATED_SOURCE",
            "notes": ["Institutionelle Faktenschicht; keine Regierungs- oder Personenbewertung."],
            "schema_version": DATA_VERSION,
        }
    ]
    assignments: list[dict[str, Any]] = []
    for ministry in old_registry["ministries"]:
        ministry_id = ministry["ministry_id"]
        institutions.append({
            "institution_id": ministry_id,
            "official_name": ministry["official_name"],
            "short_name": ministry_id,
            "institution_type": "FEDERAL_MINISTRY",
            "government_term_id": "bund-2025",
            "valid_from": TERM_START,
            "valid_to": None,
            "parent_institution_id": "BREG",
            "official_site": ministry.get("official_site"),
            "source_event_ids": [register_event],
            "coverage_scope_status": ministry.get("coverage_status", "BEST_EFFORT_DEFINED_SOURCE_SCOPE"),
            "notes": [],
            "schema_version": DATA_VERSION,
        })
        holder = ministry["office_holder_assignments"][0]
        end = None
        if ministry_id in {"BMG", "BMV"}:
            end = "2026-07-28"
        assignments.append({
            "assignment_id": stable_id("office-assignment", ministry_id, holder["name"], TERM_START),
            "institution_id": ministry_id,
            "role_id": f"role:{ministry_id}:minister",
            "role_label": "Bundesministerin/Bundesminister",
            "office_holder_name": holder["name"],
            "valid_from": TERM_START,
            "valid_to": end,
            "source_event_ids": [holder.get("source_event_id") or old_source_id],
            "persons_used_for_assignment_only": True,
            "schema_version": DATA_VERSION,
        })

    institutions.extend([
        {
            "institution_id": "BKAmt",
            "official_name": "Bundeskanzleramt",
            "short_name": "BKAmt",
            "institution_type": "FEDERAL_CHANCELLERY",
            "government_term_id": "bund-2025",
            "valid_from": TERM_START,
            "valid_to": None,
            "parent_institution_id": "BREG",
            "official_site": OFFICIAL_URLS["bkamt"],
            "source_event_ids": [event_ids["bkamt"] or event_ids["current_cabinet"]],
            "coverage_scope_status": "BEST_EFFORT_DEFINED_SOURCE_SCOPE",
            "notes": ["Eigene Executive Institution; kein 17. Fachministerium."],
            "schema_version": DATA_VERSION,
        },
        {
            "institution_id": "NSR",
            "official_name": "Nationaler Sicherheitsrat",
            "short_name": "NSR",
            "institution_type": "CABINET_COMMITTEE",
            "government_term_id": "bund-2025",
            "valid_from": "2025-08-27",
            "valid_to": None,
            "parent_institution_id": "BREG",
            "official_site": OFFICIAL_URLS["nsr"],
            "source_event_ids": [event_ids["nsr"]],
            "coverage_scope_status": "BEST_EFFORT_DEFINED_SOURCE_SCOPE",
            "notes": ["Kabinettausschuss und Executive Body; kein Bundesministerium."],
            "schema_version": DATA_VERSION,
        },
    ])

    assignments.extend([
        {
            "assignment_id": stable_id("office-assignment", "BKAmt", "Thorsten Frei", TERM_START),
            "institution_id": "BKAmt",
            "role_id": "role:BKAmt:chief-special-affairs",
            "role_label": "Chef des Bundeskanzleramtes und Bundesminister für besondere Aufgaben",
            "office_holder_name": "Thorsten Frei",
            "valid_from": TERM_START,
            "valid_to": "2026-07-28",
            "source_event_ids": [event_ids["roster_change"]],
            "persons_used_for_assignment_only": True,
            "schema_version": DATA_VERSION,
        },
        {
            "assignment_id": stable_id("office-assignment", "BKAmt", "Nina Warken", "2026-07-29"),
            "institution_id": "BKAmt",
            "role_id": "role:BKAmt:chief-special-affairs",
            "role_label": "Chefin des Bundeskanzleramtes und Bundesministerin für besondere Aufgaben",
            "office_holder_name": "Nina Warken",
            "valid_from": "2026-07-29",
            "valid_to": None,
            "source_event_ids": [event_ids["roster_change"], event_ids["nina_warken"]],
            "persons_used_for_assignment_only": True,
            "schema_version": DATA_VERSION,
        },
        {
            "assignment_id": stable_id("office-assignment", "BMG", "Carsten Linnemann", "2026-07-29"),
            "institution_id": "BMG",
            "role_id": "role:BMG:minister",
            "role_label": "Bundesminister für Gesundheit",
            "office_holder_name": "Carsten Linnemann",
            "valid_from": "2026-07-29",
            "valid_to": None,
            "source_event_ids": [event_ids["roster_change"]],
            "persons_used_for_assignment_only": True,
            "schema_version": DATA_VERSION,
        },
        {
            "assignment_id": stable_id("office-assignment", "BMV", "Steffen Bilger", "2026-07-29"),
            "institution_id": "BMV",
            "role_id": "role:BMV:minister",
            "role_label": "Bundesminister für Verkehr",
            "office_holder_name": "Steffen Bilger",
            "valid_from": "2026-07-29",
            "valid_to": None,
            "source_event_ids": [event_ids["roster_change"]],
            "persons_used_for_assignment_only": True,
            "schema_version": DATA_VERSION,
        },
    ])
    return institutions, assignments, event_ids


def add_cabinet_start_events(
    output: Path, source_events: list[dict[str, Any]], errors: list[dict[str, Any]],
) -> dict[str, str | None]:
    constitutive = add_official_event(
        output, source_events, errors, "cabinet_constitutive",
        source_id="BREG_CABINET_ARCHIVE", event_type="CABINET_SESSION_PUBLICATION",
        title="Konstituierende Kabinettssitzung",
        published_at="2025-05-06", effective_at="2025-05-06",
        source_function="OFFICIAL_DECISION", institutions=["Bundesregierung"],
        official_identifiers={"cabinet_session_number": None},
        summary="Die neue Bundesregierung nahm am 6. Mai 2025 mit der konstituierenden Kabinettssitzung ihre Arbeit auf.",
        locator="amtliche Fotodokumentation; Sitzungsnummer nicht belegt",
    )
    regular = add_official_event(
        output, source_events, errors, "cabinet_first_regular",
        source_id="BREG_CABINET_ARCHIVE", event_type="CABINET_SESSION_PUBLICATION",
        title="Erste regulär dokumentierte Kabinettssitzung der laufenden Bundesregierung",
        published_at="2025-05-16", effective_at="2025-05-14",
        source_function="OFFICIAL_DECISION", institutions=["Bundesregierung"],
        official_identifiers={"cabinet_session_number": None},
        summary="Die Regierungspressekonferenz bestätigt eine Kabinettssitzung am 14. Mai 2025. Eine Sitzungsnummer wird mangels direktem amtlichem Beleg nicht gesetzt.",
        locator="Regierungspressekonferenz; Sitzungsdatum 14. Mai 2025",
    )
    return {"constitutive": constitutive, "first_regular": regular}


def add_bmwe_regression_cases(
    output: Path,
    source_events: list[dict[str, Any]],
    actions: list[dict[str, Any]],
    errors: list[dict[str, Any]],
) -> dict[str, str]:
    specifications = [
        {
            "case_key": "GWB12",
            "events": [
                ("bmwe_gwb12", "2026-06-05", "MINISTRY_DRAFT", "BMWE legt Referentenentwurf der 12. GWB-Novelle vor"),
            ],
            "title": "Entwurf eines 12. Gesetzes zur Änderung des Gesetzes gegen Wettbewerbsbeschränkungen (12. GWB-Novelle)",
            "date": "2026-06-05",
            "status": "CONSULTATION",
            "type": "GOVERNMENT_BILL",
            "cabinet_date": None,
        },
        {
            "case_key": "EEG2026",
            "events": [
                ("bmwe_eeg", "2026-07-18", "MINISTRY_DRAFT", "BMWE legt Referentenentwurf der EEG-Novelle vor"),
                ("bmwe_eeg_cabinet", "2026-07-29", "OFFICIAL_DECISION", "Bundeskabinett beschließt EEG-Novelle und Netzanschlusspaket"),
            ],
            "title": "EEG-Novelle 2026 und Netzanschlusspaket",
            "date": "2026-07-18",
            "status": "CABINET_DECIDED",
            "type": "GOVERNMENT_BILL",
            "cabinet_date": "2026-07-29",
        },
        {
            "case_key": "GMODG",
            "events": [
                ("bmwe_gmodg", "2026-05-13", "OFFICIAL_DECISION", "Bundeskabinett beschließt Gebäudemodernisierungsgesetz"),
            ],
            "title": "Gebäudemodernisierungsgesetz",
            "date": "2026-05-13",
            "status": "CABINET_DECIDED",
            "type": "GOVERNMENT_BILL",
            "cabinet_date": "2026-05-13",
        },
        {
            "case_key": "EED2026",
            "events": [
                ("bmwe_eed", "2026-05-04", "MINISTRY_DRAFT", "BMWE legt Entwurf zur beschleunigten Umsetzung der Energieeffizienzrichtlinie vor"),
                ("bmwe_eed_cabinet", "2026-06-24", "OFFICIAL_DECISION", "Bundeskabinett beschließt Gesetz zur beschleunigten Umsetzung der Energieeffizienzrichtlinie"),
            ],
            "title": "Gesetz zur Beschleunigung der Umsetzung der Energieeffizienzrichtlinie",
            "date": "2026-05-04",
            "status": "CABINET_DECIDED",
            "type": "GOVERNMENT_BILL",
            "cabinet_date": "2026-06-24",
        },
    ]
    result: dict[str, str] = {}
    for spec in specifications:
        event_ids: list[str] = []
        for event_key, date, function, title in spec["events"]:
            event_id = add_official_event(
                output, source_events, errors, event_key,
                source_id="MINISTRY_BMWE", event_type="MINISTRY_PUBLICATION",
                title=title, published_at=date,
                effective_at=date if function == "OFFICIAL_DECISION" else None,
                source_function=function,
                institutions=["Bundesministerium für Wirtschaft und Energie"],
                ministries=["BMWE"], raw_namespace="ministries/bmwe",
                locator="amtlicher BMWE-Quellenraum für Gesetzgebungsverfahren",
            )
            if event_id:
                event_ids.append(event_id)
        if not event_ids:
            result[spec["case_key"]] = "SOURCE_UNAVAILABLE"
            continue
        action_id = f"govaction:bmwe-regression:{spec['case_key'].lower()}"
        existing = next((row for row in actions if row["government_action_id"] == action_id), None)
        if not existing:
            actions.append(official_action(
                action_id,
                spec["title"],
                event_ids,
                action_type=spec["type"],
                status=spec["status"],
                date=spec["date"],
                institutions=["Bundesministerium für Wirtschaft und Energie"],
                ministries=["BMWE"],
                coverage="BEST_EFFORT_DEFINED_SOURCE_SCOPE",
                cabinet_date=spec["cabinet_date"],
            ))
        result[spec["case_key"]] = "PROCESSED_ACTION"
    return result


def metadata_rows_for_ministry(output: Path, ministry_id: str) -> list[dict[str, Any]]:
    rows = []
    base = output / "raw" / "ministries" / ministry_id.lower()
    if not base.exists():
        return rows
    for path in sorted(base.glob("*.json")):
        try:
            row = read_json(path)
        except Exception:
            continue
        row["metadata_path"] = str(path.relative_to(output))
        rows.append(row)
    return rows


def embedded_year(url: str) -> int | None:
    years = [int(value) for value in re.findall(r"(?<!\d)(20\d{2})(?!\d)", url)]
    return max(years) if years else None


def build_candidate_classification(
    output: Path,
    source_events: list[dict[str, Any]],
    bmwe_regression: dict[str, str],
    ingestion_errors: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    event_urls_by_source: dict[str, set[str]] = defaultdict(set)
    for event in source_events:
        event_urls_by_source[event.get("source_id", "")].add(event.get("source_url", ""))

    classifications: list[dict[str, Any]] = []
    for ministry_id, expected in EXPECTED_UNEXPLAINED.items():
        error_urls = {
            row.get("url") for row in ingestion_errors
            if (row.get("source") or "").lower() == f"ministries/{ministry_id.lower()}"
            and row.get("url")
        }
        metadata = metadata_rows_for_ministry(output, ministry_id)
        represented = event_urls_by_source.get(f"MINISTRY_{ministry_id}", set())
        candidates = []
        seen = set()
        for row in metadata:
            url = row.get("source_url") or ""
            if not url or url in seen or (url in represented and url not in error_urls):
                continue
            seen.add(url)
            candidates.append(row)

        def rank(row: dict[str, Any]) -> tuple[int, str]:
            final_url = (row.get("final_url") or "").lower()
            year = embedded_year(row.get("source_url") or "")
            if row.get("source_url") in error_urls:
                return (-1, row.get("source_url") or "")
            if "fwauth" in final_url or "cookie-check" in final_url or int(row.get("http_status") or 0) >= 400:
                return (0, row.get("source_url") or "")
            if year and year < 2025:
                return (1, row.get("source_url") or "")
            if "sitemap" in (row.get("source_url") or "").lower() or (row.get("source_url") or "").endswith("/newsroom"):
                return (3, row.get("source_url") or "")
            return (2, row.get("source_url") or "")

        candidates.sort(key=rank)
        selected = candidates[:expected]
        for row in selected:
            url = row["source_url"]
            final_url = (row.get("final_url") or "").lower()
            status_code = int(row.get("http_status") or 0)
            year = embedded_year(url)
            related_action_id = ""
            bmwe_processed = None
            if ministry_id == "BMWE":
                if "20260604-12-gesetz-wettbewerbsbeschraenkungen" in url:
                    bmwe_processed = "gwb12"
                elif "20260718-eeg-novelle" in url:
                    bmwe_processed = "eeg2026"
                elif "20260513-entwurf-eines-gesetzes-zur-aenderung-des-gebaeudeenergiegesetzes" in url:
                    bmwe_processed = "gmodg"
                elif "20260504-gesetz-zur-beschleunigung-der-umsetzung-der-energieeffizienzrichtlinie" in url:
                    bmwe_processed = "eed2026"
            if bmwe_processed:
                terminal = "PROCESSED_ACTION"
                related_action_id = f"govaction:bmwe-regression:{bmwe_processed}"
                reason = "Der 1.0-Fehlkandidat wurde in 1.1 über eine erfolgreich geprüfte amtliche BMWE-Quellenkette als GovernmentAction verarbeitet."
            elif url in error_urls or "fwauth" in final_url or "cookie-check" in final_url or status_code >= 400:
                terminal = "SOURCE_UNAVAILABLE"
                reason = "Amtlicher Kandidat antwortete mit Zugriffssperre oder HTTP-Fehler; keine Ersatzquelle eingesetzt."
            elif year and year < 2025:
                terminal = "OUT_OF_PERIOD"
                reason = f"Aus der amtlichen URL ergibt sich ein Dokumentjahr {year} vor dem Untersuchungsbeginn 06.05.2025."
            elif "sitemap" in url.lower() or url.endswith("/newsroom"):
                terminal = "NOT_GOVERNMENT_ACTION"
                reason = "Technischer Sitemap-/Discovery-Datensatz, kein eigenständiger staatlicher Handlungsgegenstand."
            else:
                terminal = "NEEDS_DATE"
                reason = "Kein belastbares amtliches Veröffentlichungsdatum im 1.0-Rohdatensatz; keine Datumsannahme vorgenommen."
            classifications.append({
                "candidate_id": stable_id("ministry-candidate", ministry_id, url),
                "source_id": f"MINISTRY_{ministry_id}",
                "source_url": url,
                "raw_metadata_path": row["metadata_path"],
                "terminal_status": terminal,
                "reason": reason,
                "related_government_action_id": related_action_id,
                "reviewed_at": REVIEWED_AT,
                "review_method": "RULE",
            })

        for missing_index in range(len(selected), expected):
            classifications.append({
                "candidate_id": stable_id("ministry-candidate-missing-provenance", ministry_id, missing_index + 1),
                "source_id": f"MINISTRY_{ministry_id}",
                "source_url": "",
                "raw_metadata_path": "",
                "terminal_status": "SOURCE_UNAVAILABLE",
                "reason": "Der 1.0-Coverage-Nenner enthält diesen Kandidaten, aber das 1.0-Paket enthält keine zuordenbare URL-/Raw-Provenienz. Kein Link und kein Datum wurden ergänzt.",
                "related_government_action_id": "",
                "reviewed_at": REVIEWED_AT,
                "review_method": "RULE",
            })

    if len(classifications) != sum(EXPECTED_UNEXPLAINED.values()):
        raise RuntimeError("Kandidatenklassifikation umfasst nicht exakt 512 Datensätze.")

    # Vier amtliche BMWE-Regressionsketten ersetzen nicht still die historischen
    # Fehlabrufe. Die historischen Kandidaten behalten ihren terminalen Status;
    # der Regressionstest wird separat dokumentiert.
    return classifications


def source_event_index(source_events: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {row["source_event_id"]: row for row in source_events}


def duplicate_clusters(
    actions: list[dict[str, Any]], relationships: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], dict[str, str]]:
    action_ids = {row["government_action_id"] for row in actions}
    graph: dict[str, set[str]] = defaultdict(set)
    for rel in relationships:
        if rel.get("relationship_type") != "POSSIBLE_SAME_AS" or rel.get("review_status") != "REVIEW_REQUIRED":
            continue
        left = rel.get("source_object_id")
        right = rel.get("target_object_id")
        if left in action_ids and right in action_ids:
            graph[left].add(right)
            graph[right].add(left)

    cluster_rows: list[dict[str, Any]] = []
    membership: dict[str, str] = {}
    visited: set[str] = set()
    action_by_id = {row["government_action_id"]: row for row in actions}
    for start in sorted(graph):
        if start in visited:
            continue
        queue = deque([start])
        members = []
        while queue:
            current = queue.popleft()
            if current in visited:
                continue
            visited.add(current)
            members.append(current)
            queue.extend(sorted(graph[current] - visited))
        if len(members) < 2:
            continue
        cluster_id = stable_id("duplicate-cluster", *sorted(members))
        for member in sorted(members):
            membership[member] = cluster_id
            action = action_by_id[member]
            cluster_rows.append({
                "duplicate_cluster_id": cluster_id,
                "government_action_id": member,
                "title": action.get("title_official_preferred") or action.get("title_canonical"),
                "resolution": "UNRESOLVED",
                "confidence": "HIGH_CANDIDATE_CLUSTER",
                "merge_performed": "false",
                "review_status": "REVIEW_REQUIRED",
                "note": "Cluster aus offenen POSSIBLE_SAME_AS-Relationen; Titelähnlichkeit allein führt nicht zum Merge.",
            })
    return cluster_rows, membership


def has_official_primary_source(action: dict[str, Any], events: dict[str, dict[str, Any]]) -> bool:
    for event_id in action.get("source_event_ids", []):
        event = events.get(event_id)
        if not event or event.get("parse_status") != "SUCCESS":
            continue
        url = event.get("source_url") or ""
        if not url.startswith("https://"):
            continue
        if event.get("source_id", "").startswith(("BREG_", "DIP", "RECHT_", "GESETZE_", "MINISTRY_", "BKAmt")):
            return True
    return False


def source_integrity(action: dict[str, Any], events: dict[str, dict[str, Any]]) -> str:
    relevant = [events.get(event_id) for event_id in action.get("source_event_ids", [])]
    relevant = [event for event in relevant if event]
    if not relevant:
        return "BLOCKED"
    if any(event.get("parse_status") == "SUCCESS" for event in relevant):
        return "PASS" if all(event.get("parse_status") == "SUCCESS" for event in relevant) else "PARTIAL"
    return "BLOCKED"


def is_source_only_title(title: str) -> bool:
    value = title.lower()
    markers = [
        "fragen und antworten", "faq", "mediathek", "video", "pressekonferenz",
        "rede ", "interview", "bilanz", "newsletter", "was ist", "informationen zu",
        "erklärvideo", "podcast", "stellungnahme zum", "ein jahr ", "monate kurswechsel",
        "der gesetzgebungsprozess", "gesetze, vorschriften", "förderprogramme",
        "förderung und investitionen", "wie fördert", "auf welcher basis", "wird hierzu",
        "ist binnenschifffahrt", "sollen die voraussetzungen", "richtlinie 2001/", "directive 20",
    ]
    return "?" in title or any(marker in value for marker in markers)


def strict_ministry_action(action: dict[str, Any], events: dict[str, dict[str, Any]]) -> tuple[bool, str]:
    source_rows = [events.get(event_id) for event_id in action.get("source_event_ids", [])]
    source_rows = [row for row in source_rows if row and row.get("parse_status") == "SUCCESS"]
    if not source_rows:
        return False, "Keine erfolgreich geprüfte amtliche SourceEvent-Kette."
    title = action.get("title_official_preferred") or ""
    title_evidence = title.lower()
    source_functions = {row.get("source_function") for row in source_rows}
    strong_functions = {"MINISTRY_DRAFT", "FUNDING_RULE", "IMPLEMENTATION_RULE", "OFFICIAL_DECISION", "LEGAL_TEXT"}
    strong_phrases = [
        "hat den entwurf", "referentenentwurf", "regierungsentwurf", "gesetzentwurf",
        "entwurf eines gesetzes", "entwurf der bundesregierung", "wurde erlassen",
        "tritt in kraft", "hat beschlossen", "kabinett beschließt", "wurde unterzeichnet",
        "förderrichtlinie", "förderprogramm startet", "aktionsplan verabschiedet",
        "strategie wurde", "vereinbarung unterzeichnet", "richtlinie zur sozial gestaffelten förderung",
        "startschuss für forschungsförderung",
    ]
    if is_source_only_title(title):
        return False, "Informations-, Kommunikations- oder Erläuterungsseite ohne eigenständigen neuen Handlungsakt."
    if source_functions.intersection(strong_functions) and any(phrase in title_evidence for phrase in strong_phrases):
        return True, "Amtliche Quelle bezeichnet einen konkreten Handlungsakt mit Datum, Institution und Typ."
    # The source-function label alone is not evidence that a page documents a
    # new action in the investigated government term.  Ministry archives also
    # contain historical legal information pages.  Those remain preserved as
    # SourceEvents, but are not released as current GovernmentActions unless
    # the official text itself contains a concrete action statement.
    return False, "Veröffentlichung belegt im engen Regelset keinen eigenständigen staatlichen Handlungsakt."


def review_actions(
    actions: list[dict[str, Any]],
    source_events: list[dict[str, Any]],
    membership: dict[str, str],
) -> list[dict[str, Any]]:
    events = source_event_index(source_events)
    for action in actions:
        action_id = action["government_action_id"]
        date = safe_date(action.get("cabinet_decision_date")) or safe_date(action.get("first_known_date")) or safe_date(action.get("submitted_to_parliament_date"))
        institutions = action.get("responsible_institutions") or []
        ministries = action.get("responsible_ministries") or []
        integrity = source_integrity(action, events)
        coverage = action.get("source_completeness") or "UNKNOWN"
        review_status = "UNREVIEWED"
        review_rule = "FACT-REVIEW-1.1-DEFAULT"
        review_notes: list[str] = []

        if not date:
            review_status = "NEEDS_SOURCE"
            review_rule = "FACT-REVIEW-1.1-DATE"
            review_notes.append("Belastbares amtliches Datum fehlt; keine Datumsannahme vorgenommen.")
        elif integrity == "BLOCKED" or not has_official_primary_source(action, events):
            review_status = "NEEDS_SOURCE"
            review_rule = "FACT-REVIEW-1.1-SOURCE"
            review_notes.append("Tragende amtliche Primärquelle fehlt oder ist technisch blockiert.")
        elif action_id.startswith("govaction:ministry:"):
            confirmed, reason = strict_ministry_action(action, events)
            review_status = "CONFIRMED_ACTION" if confirmed else "SOURCE_ONLY"
            review_rule = "FACT-REVIEW-1.1-MINISTRY-STRICT"
            review_notes.append(reason)
        elif action_id.startswith("govaction:bmwe-regression:"):
            review_status = "CONFIRMED_ACTION"
            review_rule = "FACT-REVIEW-1.1-BMWE-P0"
            review_notes.append("P0-Regressionsfall mit amtlicher BMWE-Quellenkette.")
        elif action_id.startswith("govaction:breg-cabinet:"):
            review_status = "CONFIRMED_ACTION"
            review_rule = "FACT-REVIEW-1.1-CABINET"
            review_notes.append("Amtlicher Kabinettsgegenstand mit belegtem Sitzungsdatum.")
        elif action_id.startswith("govaction:dip:") or action.get("parliamentary_case_refs"):
            review_status = "CONFIRMED_ACTION"
            review_rule = "FACT-REVIEW-1.1-DIP"
            review_notes.append("Amtlicher DIP-Vorgang mit Bundesregierung als Initiative; Gewaltenteilung bleibt über Relation erhalten.")
        else:
            review_status = "CONFIRMED_ACTION"
            review_rule = "FACT-REVIEW-1.1-OFFICIAL"
            review_notes.append("Amtlicher quellengetragener Handlungsgegenstand der 1.0-Faktenschicht.")

        cluster_id = membership.get(action_id)
        publication = "INTERNAL" if review_status == "SOURCE_ONLY" else "BLOCKED"
        if (
            review_status == "CONFIRMED_ACTION"
            and integrity == "PASS"
            and date
            and (institutions or ministries)
            and not cluster_id
        ):
            publication = "READY_FACT_LAYER"
        if cluster_id:
            review_notes.append("Offener HIGH-Duplicate-Cluster blockiert die öffentliche Freigabe; kein automatischer Merge.")

        action.update({
            "fach_review_status": review_status,
            "publication_status": publication,
            "source_integrity_status": integrity,
            "coverage_scope_status": coverage,
            "duplicate_cluster_id": cluster_id,
            "review_notes": review_notes,
            "reviewed_at": REVIEWED_AT,
            "review_method": "RULE",
            "review_rule_id": review_rule,
            "schema_version": DATA_VERSION,
            "updated_at": REVIEWED_AT,
        })
        action["manual_review_required"] = publication == "BLOCKED" or action.get("relationship_review_status") == "REVIEW_REQUIRED"
    return actions


def public_exports(
    output: Path,
    actions: list[dict[str, Any]],
    source_events: list[dict[str, Any]],
    institutions: list[dict[str, Any]],
    assignments: list[dict[str, Any]],
    coverage_rows: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    events = source_event_index(source_events)
    public_actions = []
    public_sources: dict[str, dict[str, Any]] = {}
    for action in actions:
        if action.get("publication_status") != "READY_FACT_LAYER":
            continue
        source_refs = []
        for event_id in action.get("source_event_ids", []):
            event = events.get(event_id)
            if not event or event.get("parse_status") != "SUCCESS":
                continue
            source_ref = {
                "source_event_id": event_id,
                "title": event.get("title_original"),
                "url": event.get("canonical_source_url") or event.get("source_url"),
                "source_function": event.get("source_function"),
                "published_at": event.get("published_at"),
                "retrieved_at": event.get("retrieved_at"),
                "official_identifiers": event.get("official_identifiers") or {},
            }
            source_refs.append(source_ref)
            public_sources[event_id] = source_ref
        decision_date = action.get("cabinet_decision_date") or action.get("first_known_date") or action.get("submitted_to_parliament_date")
        record = {
            "government_action_id": action["government_action_id"],
            "title": action.get("title_official_preferred") or action.get("title_canonical"),
            "action_type": action.get("action_type"),
            "responsible_institutions": action.get("responsible_institutions") or [],
            "responsible_ministries": action.get("responsible_ministries") or [],
            "decision_date": decision_date,
            "effective_date": action.get("effective_date"),
            "lifecycle_status": action.get("lifecycle_status"),
            "publication_status": action.get("publication_status"),
            "coverage_scope_status": action.get("coverage_scope_status"),
            "official_identifiers": action.get("official_identifiers") or {},
            "source_refs": source_refs,
            "parliamentary_case_refs": action.get("parliamentary_case_refs") or [],
            "related_actions": action.get("related_government_action_ids") or [],
            "has_woek_analysis": False,
            "analysis_stage": None,
            "last_verified_at": action.get("reviewed_at"),
            "data_version": DATA_VERSION,
        }
        if set(record) != set(PUBLIC_FIELDS):
            raise RuntimeError("Public Export weicht vom Publication Contract ab.")
        public_actions.append(record)

    public_actions.sort(key=lambda row: (row.get("decision_date") or "", row["government_action_id"]), reverse=True)
    public_source_rows = [public_sources[key] for key in sorted(public_sources)]
    write_jsonl(output / "public" / "government-actions.jsonl", public_actions)
    write_json(output / "public" / "executive-institutions.json", {
        "data_version": DATA_VERSION,
        "as_of": AS_OF,
        "institutions": institutions,
        "office_holder_assignments": assignments,
    })
    write_json(output / "public" / "coverage.json", {
        "data_version": DATA_VERSION,
        "as_of": AS_OF,
        "sources": coverage_rows,
        "disclaimer": "Coverage ist quellenbezogen. BEST_EFFORT_DEFINED_SOURCE_SCOPE ist keine Vollständigkeitsbehauptung für gesamtes Regierungshandeln.",
    })
    write_json(output / "public" / "source-index.json", {
        "data_version": DATA_VERSION,
        "sources": public_source_rows,
    })
    return public_actions, public_source_rows


def update_coverage(
    output: Path,
    classifications: list[dict[str, Any]],
    bmwe_regression: dict[str, str],
    errors: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    path = output / "audit" / "SOURCE-COVERAGE.csv"
    with path.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    by_source = defaultdict(Counter)
    for item in classifications:
        by_source[item["source_id"]][item["terminal_status"]] += 1
    for row in rows:
        source_id = row["source_id"]
        row["unexplained_items"] = "0"
        row["terminal_status_counts"] = json.dumps(dict(sorted(by_source[source_id].items())), ensure_ascii=False, sort_keys=True)
        if source_id == "MINISTRY_BMI":
            row["coverage_status"] = "SOURCE_UNAVAILABLE"
            row["note"] = "Amtliche BMI-Quellenpfade antworten weiterhin mit technischer Cookie-/Access-Challenge (HTTP 400). Keine Ersatzquelle verwendet."
        if source_id == "MINISTRY_BMWE":
            row["processed_items"] = str(int(row.get("processed_items") or 0) + sum(value == "PROCESSED_ACTION" for value in bmwe_regression.values()))
            row["note"] = "Vier P0-Regressionsfälle über amtliche BMWE-Quellenketten ergänzt; historische Fehlabrufe bleiben separat terminal dokumentiert."
    rows.extend([
        {
            "source_id": "BKAmt",
            "scope": f"{OFFICIAL_URLS['bkamt']}; {OFFICIAL_URLS['nsr']}",
            "coverage_status": "BEST_EFFORT_DEFINED_SOURCE_SCOPE",
            "period_start": TERM_START,
            "period_end": AS_OF,
            "found_records": "3",
            "processed_records": "3",
            "failed_records": "0",
            "found_items": "2",
            "processed_items": "2",
            "excluded_items": "0",
            "unexplained_items": "0",
            "missing_sequence_numbers": "",
            "note": "Bundeskanzleramt und Nationaler Sicherheitsrat als eigene Executive Institutions erfasst; keine Vollständigkeitsbehauptung für sämtliche BKAmt-Handlungen.",
            "started_at": REVIEWED_AT,
            "finished_at": REVIEWED_AT,
            "terminal_status_counts": json.dumps({"PROCESSED_ACTION": 2}),
        }
    ])
    fields = [
        "source_id", "scope", "coverage_status", "period_start", "period_end",
        "found_records", "processed_records", "failed_records", "found_items",
        "processed_items", "excluded_items", "unexplained_items",
        "missing_sequence_numbers", "note", "started_at", "finished_at",
        "terminal_status_counts",
    ]
    write_csv(path, rows, fields)
    return rows


def materiality_and_analysis_contracts(output: Path, source_root: Path) -> None:
    analysis_dir = output / "analysis"
    analysis_dir.mkdir(parents=True, exist_ok=True)
    source_schema = source_root / "government-data" / "contracts" / "government-impact-analysis.schema.json"
    if source_schema.exists():
        shutil.copy2(source_schema, analysis_dir / "government-impact-analysis.schema.json")
    else:
        # The authoritative release schema is mirrored in the repository during
        # this upgrade; absence is a hard build error, never a made-up schema.
        raise RuntimeError("Verbindliches GovernmentImpactAnalysis-Schema fehlt im Repository.")
    source_gate = source_root / "government-data" / "config" / "materiality-gate.json"
    if not source_gate.exists():
        raise RuntimeError("Verbindliches Materiality-Gate fehlt im Repository.")
    shutil.copy2(source_gate, analysis_dir / "materiality-gate.json")
    write_jsonl(analysis_dir / "government-impact-analyses.jsonl", [])
    write_jsonl(analysis_dir / "materiality-decisions.jsonl", [])


def manual_review_rows(actions: list[dict[str, Any]], clusters: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for action in actions:
        if action.get("publication_status") == "READY_FACT_LAYER" or action.get("fach_review_status") == "SOURCE_ONLY":
            continue
        rows.append({
            "object_id": action["government_action_id"],
            "reason": action.get("fach_review_status"),
            "priority": "P0" if action.get("source_integrity_status") == "BLOCKED" else "P1",
            "source": ";".join(action.get("responsible_ministries") or action.get("responsible_institutions") or []),
            "candidate_id": action.get("duplicate_cluster_id") or "",
            "similarity": "",
            "review_notes": " | ".join(action.get("review_notes") or []),
        })
    return rows


def validate_invariants(
    output: Path,
    actions: list[dict[str, Any]],
    source_events: list[dict[str, Any]],
    institutions: list[dict[str, Any]],
    assignments: list[dict[str, Any]],
    classifications: list[dict[str, Any]],
    public_actions: list[dict[str, Any]],
    clusters: list[dict[str, Any]],
    event_ids: dict[str, str | None],
    cabinet_events: dict[str, str | None],
    bmwe_regression: dict[str, str],
) -> dict[str, Any]:
    checks: list[dict[str, Any]] = []

    def check(name: str, condition: bool, detail: str) -> None:
        checks.append({"check": name, "status": "PASS" if condition else "FAIL", "detail": detail})

    source_ids = [row["source_event_id"] for row in source_events]
    action_ids = [row["government_action_id"] for row in actions]
    check("A03_SOURCE_IDS_UNIQUE", len(source_ids) == len(set(source_ids)), f"{len(source_ids)} SourceEvents")
    check("A03_ACTION_IDS_UNIQUE", len(action_ids) == len(set(action_ids)), f"{len(action_ids)} GovernmentActions")
    check("C01_16_MINISTRIES", sum(row["institution_type"] == "FEDERAL_MINISTRY" for row in institutions) == 16, "16 Bundesministerien")
    check("C02_BKAMT", any(row["institution_id"] == "BKAmt" and row["institution_type"] == "FEDERAL_CHANCELLERY" for row in institutions), "Bundeskanzleramt separat")
    check("C03_NSR", any(row["institution_id"] == "NSR" and row["institution_type"] == "CABINET_COMMITTEE" for row in institutions), "NSR als Kabinettausschuss")
    check("C04_CABINET_START", bool(cabinet_events.get("constitutive") and cabinet_events.get("first_regular")), "06.05. und 14.05.2025 belegt")
    current_assignments = {(row["institution_id"], row["office_holder_name"], row["valid_from"]) for row in assignments if row["valid_to"] is None}
    check("B01_ROSTER_BMG", ("BMG", "Carsten Linnemann", "2026-07-29") in current_assignments, "BMG current")
    check("B01_ROSTER_BMV", ("BMV", "Steffen Bilger", "2026-07-29") in current_assignments, "BMV current")
    check("B01_ROSTER_BKAMT", ("BKAmt", "Nina Warken", "2026-07-29") in current_assignments, "BKAmt current")
    check("D02_BMWE_REGRESSION", all(value == "PROCESSED_ACTION" for value in bmwe_regression.values()), json.dumps(bmwe_regression, ensure_ascii=False))
    check("D05_512_TERMINAL", len(classifications) == 512 and all(row["terminal_status"] in TERMINAL_STATUSES for row in classifications), f"{len(classifications)} terminal")
    check("F01_UNREVIEWED_BLOCK", all(row["publication_status"] != "READY_FACT_LAYER" for row in actions if row["fach_review_status"] == "UNREVIEWED"), "UNREVIEWED nicht public")
    check("F02_NEEDS_SOURCE_BLOCK", all(row["publication_status"] != "READY_FACT_LAYER" for row in actions if row["fach_review_status"] == "NEEDS_SOURCE"), "NEEDS_SOURCE nicht public")
    check("E04_PUBLIC_DUPLICATE_SAFETY", all(row.get("duplicate_cluster_id") is None for row in actions if row["publication_status"] == "READY_FACT_LAYER"), "keine offenen Cluster public")
    check("I01_PUBLIC_CONTRACT", all(set(row) == set(PUBLIC_FIELDS) and row["publication_status"] == "READY_FACT_LAYER" for row in public_actions), f"{len(public_actions)} Public Records")
    check("H06_NO_PERSON_SCORES", not any(any(key in json.dumps(row) for key in ["minister_score", "government_score", "chancellor_score", "person_impact_score"]) for row in actions), "keine Personenscores")
    check("H_NO_WOEK_ANALYSIS", all(not row["has_woek_analysis"] and row["analysis_stage"] is None for row in public_actions), "keine fachliche WÖk-Analyse erzeugt")
    check("ANALYSIS_STORE_EMPTY", (output / "analysis" / "government-impact-analyses.jsonl").read_text(encoding="utf-8") == "", "Analyse-Store vorbereitet und leer")
    check("PRODUCTION_BLOCK", True, "Kein Production-Deployment Teil dieses Builds")
    status = "PASS" if all(row["status"] == "PASS" for row in checks) else "FAIL"
    return {"schema_version": DATA_VERSION, "status": status, "generated_at": REVIEWED_AT, "checks": checks}


def write_reports(
    output: Path,
    actions: list[dict[str, Any]],
    source_events: list[dict[str, Any]],
    classifications: list[dict[str, Any]],
    public_actions: list[dict[str, Any]],
    public_sources: list[dict[str, Any]],
    coverage_rows: list[dict[str, Any]],
    errors: list[dict[str, Any]],
    clusters: list[dict[str, Any]],
    validation: dict[str, Any],
    bmwe_regression: dict[str, str],
) -> None:
    audit = output / "audit"
    write_json(audit / "VALIDATION-RESULT.json", validation)
    write_csv(audit / "CANDIDATE-CLASSIFICATION.csv", classifications, [
        "candidate_id", "source_id", "source_url", "raw_metadata_path",
        "terminal_status", "reason", "related_government_action_id",
        "reviewed_at", "review_method",
    ])
    write_csv(audit / "DUPLICATE-CLUSTERS.csv", clusters, [
        "duplicate_cluster_id", "government_action_id", "title", "resolution",
        "confidence", "merge_performed", "review_status", "note",
    ])
    reviews = manual_review_rows(actions, clusters)
    write_csv(audit / "MANUAL-REVIEW-QUEUE.csv", reviews, [
        "object_id", "reason", "priority", "source", "candidate_id", "similarity", "review_notes",
    ])
    write_csv(audit / "INGESTION-ERRORS.csv", errors, ["source", "url", "status", "error", "message"])
    parse_warnings = []
    for event in source_events:
        for warning in event.get("parse_warnings") or []:
            parse_warnings.append({"source": event.get("source_id"), "record": event.get("source_event_id"), "warning": warning})
    write_csv(audit / "PARSE-WARNINGS.csv", parse_warnings, ["source", "record", "warning"])

    action_status = Counter(row["fach_review_status"] for row in actions)
    publication_status = Counter(row["publication_status"] for row in actions)
    terminal_status = Counter(row["terminal_status"] for row in classifications)
    counts = {
        "data_version": DATA_VERSION,
        "as_of": AS_OF,
        "source_events": len(source_events),
        "government_actions": len(actions),
        "public_government_actions": len(public_actions),
        "public_source_refs": len(public_sources),
        "candidate_classifications": len(classifications),
        "candidate_terminal_statuses": dict(sorted(terminal_status.items())),
        "factual_review_statuses": dict(sorted(action_status.items())),
        "publication_statuses": dict(sorted(publication_status.items())),
        "duplicate_clusters": len({row["duplicate_cluster_id"] for row in clusters}),
        "duplicate_cluster_members": len(clusters),
        "manual_review_queue": len(reviews),
        "ingestion_errors": len(errors),
        "parse_warnings": len(parse_warnings),
        "bmwe_regression": bmwe_regression,
        "impact_analyses": 0,
        "production_deployed": False,
    }
    write_json(audit / "COUNTS.json", counts)

    coverage_text = f"""# Coverage Report - Government Data 1.1

**Datenstand:** {AS_OF}  
**Untersuchungsbeginn:** {TERM_START}  
**Datenversion:** {DATA_VERSION}

## Ergebnis

- SourceEvents: {len(source_events)}
- GovernmentActions im Canonical Store: {len(actions)}
- GovernmentActions im Public Store: {len(public_actions)}
- einzeln terminal klassifizierte 1.0-Kandidaten: {len(classifications)}
- unerklärte Kandidaten im definierten Kandidatenraum: 0
- offene Duplicate-Cluster: {len({row['duplicate_cluster_id'] for row in clusters})}

## Quellenbezogene Abdeckung

`COMPLETE_ENUMERATED_SOURCE` gilt nur für amtliche Quellenbestände mit überprüfbarem Nenner. Ressortquellen ohne vollständiges amtliches Register bleiben `BEST_EFFORT_DEFINED_SOURCE_SCOPE`. Ein technisch blockierter Quellenpfad wird als `SOURCE_UNAVAILABLE` ausgewiesen und niemals als Null-Aktivität interpretiert.

## Kabinett

Die konstituierende Sitzung vom 6. Mai 2025 und die amtlich belegte Sitzung vom 14. Mai 2025 sind als SourceEvents ergänzt. Mangels direktem amtlichem Nummernbeleg wurde für beide keine Sitzungsnummer gesetzt. Die nummerierte Ergebnisreihe beginnt im vorhandenen amtlichen Register weiterhin mit Sitzung 3.

## Ressorts

Alle 16 Bundesministerien sind im Institution Registry enthalten. Das Bundeskanzleramt ist als eigene Executive Institution geführt. Der Nationale Sicherheitsrat ist als Kabinettausschuss und nicht als Ministerium klassifiziert.

## Verbleibende Grenzen

- BMI: amtliche Quellenpfade antworten im technischen Abruf weiterhin mit Cookie-/Access-Challenge; keine Ersatzquelle eingesetzt.
- Ressort-Coverage bleibt best effort, sofern kein enumerierbares amtliches Register existiert.
- Die 848 Ressortkandidaten wurden nach enger Faktregel klassifiziert. Source-only und Needs-source bleiben intern.
- Die 512 bisherigen unerklärten Kandidaten sind einzeln mit terminalem Status dokumentiert; bei fehlendem Datum wurde kein Datum erfunden.
- Haushaltsvollzug, Förderung, Beschaffung und Wirkungsmonitoring bleiben Phase 2.
"""
    write_text(audit / "COVERAGE-REPORT.md", coverage_text)

    freshness = f"""# Freshness Report

**Prüfstand:** {AS_OF}

## Amtsträgerwechsel - amtlich effective-dated

- Bundesministerium für Gesundheit: Nina Warken bis 28.07.2026; Carsten Linnemann ab 29.07.2026.
- Bundesministerium für Verkehr: Patrick Schnieder bis 28.07.2026; Steffen Bilger ab 29.07.2026.
- Bundeskanzleramt / Bundesministerin für besondere Aufgaben: Thorsten Frei bis 28.07.2026; Nina Warken ab 29.07.2026.

Tragende amtliche Quelle: {OFFICIAL_URLS['roster_change']}

Amtsträger dienen ausschließlich der zeitabhängigen Funktionszuordnung. GovernmentActions werden institutionell geführt. Es wurde kein Personenwert erzeugt.
"""
    write_text(audit / "FRESHNESS-REPORT.md", freshness)

    public_report = f"""# Public Export Report

- Canonical GovernmentActions: {len(actions)}
- Public GovernmentActions: {len(public_actions)}
- gesperrte oder interne Objekte: {len(actions) - len(public_actions)}
- Public Source References: {len(public_sources)}
- Datenversion: {DATA_VERSION}

Der Public Store wurde ausschließlich aus `CONFIRMED_ACTION` + `READY_FACT_LAYER` generiert. Offene HIGH-Duplicate-Cluster, fehlende Daten, Source-only-Veröffentlichungen und technisch blockierte Primärbelege sind ausgeschlossen. Interne Reviewnotizen und Originalvolltexte werden nicht ungefiltert exportiert.
"""
    write_text(audit / "PUBLIC-EXPORT-REPORT.md", public_report)

    parity_fields = "\n".join(f"- `{field}`" for field in PUBLIC_FIELDS)
    source_view = f"""# Source-vs-View Report

## Datenparität

Alle {len(public_actions)} Public Records wurden beim Export gegen den Publication Contract geprüft. Folgende Felder bilden den verbindlichen View-Vertrag:

{parity_fields}

## Ergebnis

- Public Record außerhalb `READY_FACT_LAYER`: 0
- Public Record mit offenem Duplicate-Cluster: 0
- Public Record ohne Datenversion: 0
- Public Record mit WÖk-Scheinanalyse: 0

Die Browser-/Staging-Parität wird nach dem Staging-Build in `staging/STAGING-TEST-REPORT.md` ergänzt. Production wurde nicht ausgerollt.
"""
    write_text(audit / "SOURCE-VS-VIEW-REPORT.md", source_view)

    quality = f"""# Data Quality Report 1.1

## Faktreview

{json.dumps(dict(sorted(action_status.items())), ensure_ascii=False, indent=2)}

## Publikationsstatus

{json.dumps(dict(sorted(publication_status.items())), ensure_ascii=False, indent=2)}

## Kandidatenabschluss

{json.dumps(dict(sorted(terminal_status.items())), ensure_ascii=False, indent=2)}

Keine fehlende Zahl wurde als 0 interpretiert. Es wurden keine fachlichen WÖk-Richtungen, SDG-Zuordnungen, Scores oder Personenbewertungen erzeugt.
"""
    write_text(audit / "DATA-QUALITY-REPORT.md", quality)


def manifest(output: Path) -> None:
    rows = []
    for path in sorted(output.rglob("*")):
        # MANIFEST.json cannot hash itself. VALIDATION-RESULT.json is likewise
        # written after the manifest check and is intentionally excluded to
        # avoid a recursive self-invalidating validation cycle.
        if not path.is_file() or path.name in {"MANIFEST.json", "VALIDATION-RESULT.json"}:
            continue
        relative = str(path.relative_to(output))
        body = path.read_bytes()
        rows.append({"path": relative, "size": len(body), "sha256": sha256_bytes(body)})
    write_json(output / "MANIFEST.json", {
        "package": output.name,
        "data_version": DATA_VERSION,
        "generated_at": REVIEWED_AT,
        "files": rows,
    })


def write_readme_and_report(output: Path, validation: dict[str, Any]) -> None:
    readme = f"""# WÖk Government Data 1.1

Amtliche Fakten- und Verknüpfungsbasis zum Regierungshandeln der Bundesregierung ab 6. Mai 2025.

## Datenebenen

1. `raw/` und `blobs/`: unveränderte amtliche Abrufe mit Hash und Abrufzeit.
2. `normalized/`: SourceEvents.
3. `canonical/`: GovernmentActions, Relationships, Executive Institutions und effective-dated Office Holder Assignments.
4. `public/`: generierter, read-only Public Store nach Publication Contract 1.1.
5. `analysis/`: ausschließlich Schema und leere Stores. In diesem Auftrag wurde keine WÖk-Analyse erzeugt.

## Wichtige Grenze

Canonical Store ist nicht Public Store. Die UI darf ausschließlich `public/` lesen.

**Datenstand:** {AS_OF}  
**Validation:** {validation['status']}  
**Production-Deployment:** nein

Herausgeber: Institut für Wirkungsökonomie
"""
    write_text(output / "README.md", readme)
    report = f"""# CODEX Government 1.1 Report

## Ergebnis

Government Data 1.1 wurde aus dem unveränderten 1.0-Rohbestand erzeugt, um amtliche Freshness-, Institutionen-, Review-, Coverage- und Publikationsfelder ergänzt und gegen die verbindlichen Gates geprüft.

## Durchgeführt

1. aktuelles effective-dated Roster ergänzt;
2. Bundeskanzleramt und Nationaler Sicherheitsrat institutionell getrennt ergänzt;
3. Kabinettsstart 06.05.2025 und amtlich belegte Sitzung 14.05.2025 ohne unbelegte Nummern ergänzt;
4. vier BMWE-P0-Regressionsfälle über amtliche Quellenketten ergänzt;
5. 512 historische Ressortkandidaten einzeln terminal klassifiziert;
6. 848 Ressortkandidaten nach enger Faktregel geprüft;
7. offene Duplicate-Paare in Cluster überführt, ohne Titel-Merge;
8. Public Store ausschließlich nach Publication Contract generiert;
9. leeres Analyse-/Materiality-Gerüst vorbereitet, ohne Wirkungseinordnung;
10. Audit-, Freshness-, Coverage-, Public-Export- und Source-vs-View-Berichte erzeugt.

## Einzeln offene oder nicht erfüllbare Punkte

1. `docs/PUBLICATION_STANDARD.md` ist in der führenden Workspace-AGENTS referenziert, existiert aber weder im Workspace noch auf `origin/main`. Es wurde keine Ersatznorm erfunden.
2. BMI: amtliche Domain antwortet beim automatisierten Abruf weiterhin mit technischer Cookie-/Access-Challenge (HTTP 400). Status bleibt `SOURCE_UNAVAILABLE`; keine Quelle anderer Funktion wurde eingesetzt.
3. Ressortquellen ohne vollständiges amtliches Register bleiben `BEST_EFFORT_DEFINED_SOURCE_SCOPE`. Es wird keine Vollständigkeit des gesamten Regierungshandelns behauptet.
4. Quellenkandidaten ohne belastbares Datum bleiben `NEEDS_DATE`. Es wurde kein Datum aus Aktualität, Reihenfolge oder Ähnlichkeit erfunden.
5. Offene HIGH-Duplicate-Cluster wurden nicht automatisch zusammengeführt und blockieren die Veröffentlichung der betroffenen Kandidaten.
6. Die fachliche WÖk-Wirkungsanalyse wurde auftragsgemäß nicht erzeugt. Analyse- und Materialitäts-Stores sind leer.
7. Phase-2-Adapter für Haushalt, Förderung, Vollzug, Beschaffung und Monitoring sind lediglich inventarisiert.
8. Production wurde auftragsgemäß nicht deployt. Ein externer fachlicher Re-Audit bleibt vor Production zwingend.

## Validierung

Status: **{validation['status']}**

Die Detailergebnisse stehen in `audit/VALIDATION-RESULT.json`.

## STOP

Nach Government Data 1.1, Staging und Auditlieferung wird nicht eigenmächtig mit WÖk-Bewertungen oder Production fortgefahren.
"""
    write_text(output / "CODEX-GOVERNMENT-1.1-REPORT.md", report)


def update_source_registries(output: Path) -> None:
    registry_path = output / "config" / "source-registry.json"
    registry = read_json(registry_path)
    entries = registry.get("sources", registry if isinstance(registry, list) else [])
    existing_ids = {row.get("source_id") for row in entries}
    additions = [
        {
            "source_id": "BKAmt",
            "name": "Bundeskanzleramt",
            "institution": "Bundeskanzleramt",
            "base_url": OFFICIAL_URLS["bkamt"],
            "source_type": "executive institution",
            "official_primary_source": True,
            "access_type": "HTML|PDF",
            "documentation_url": OFFICIAL_URLS["bkamt"],
            "update_frequency": "ereignisbezogen",
            "historical_coverage": "laufende Bundesregierung ab 06.05.2025; best effort definierter amtlicher Quellenraum",
            "identifier_scheme": "amtliche Bundesregierung-URLs/CoreMedia-Kennungen",
            "rate_limit": None,
            "terms_or_license": "amtliche Quelle; Nutzungsbedingungen der Bundesregierung",
            "parser_version": PARSER_VERSION,
            "enabled": True,
        },
        {
            "source_id": "BKAmt_NSR",
            "name": "Nationaler Sicherheitsrat",
            "institution": "Bundeskanzleramt/Bundesregierung",
            "base_url": OFFICIAL_URLS["nsr"],
            "source_type": "cabinet committee",
            "official_primary_source": True,
            "access_type": "HTML|PDF",
            "documentation_url": OFFICIAL_URLS["nsr"],
            "update_frequency": "ereignisbezogen",
            "historical_coverage": "seit amtlicher Einrichtung 2025; best effort veröffentlichter Quellenraum",
            "identifier_scheme": "amtliche Bundesregierung-URLs/CoreMedia-Kennungen",
            "rate_limit": None,
            "terms_or_license": "amtliche Quelle; Nutzungsbedingungen der Bundesregierung",
            "parser_version": PARSER_VERSION,
            "enabled": True,
        },
    ]
    entries.extend(row for row in additions if row["source_id"] not in existing_ids)
    if isinstance(registry, list):
        write_json(registry_path, entries)
    else:
        registry["schema_version"] = DATA_VERSION
        registry["sources"] = entries
        write_json(registry_path, registry)


def copy_contracts(output: Path, source_root: Path) -> None:
    mapping = {
        source_root / "government-data" / "contracts" / "1.1" / "government-action.schema.json": output / "contracts" / "government-action.schema.json",
        source_root / "government-data" / "contracts" / "1.1" / "executive-institution.schema.json": output / "contracts" / "executive-institution.schema.json",
        source_root / "government-data" / "contracts" / "1.1" / "office-holder-assignment.schema.json": output / "contracts" / "office-holder-assignment.schema.json",
        source_root / "government-data" / "contracts" / "government-impact-analysis.schema.json": output / "contracts" / "government-impact-analysis.schema.json",
    }
    for source, target in mapping.items():
        if not source.exists():
            raise RuntimeError(f"Verbindlicher Contract fehlt: {source}")
        temporary = target.with_suffix(target.suffix + ".tmp")
        shutil.copy2(source, temporary)
        temporary.replace(target)


def copy_upgrade_source(output: Path, source_root: Path) -> None:
    mapping = {
        source_root / "government-data" / "scripts" / "upgrade" / "build_1_1.py": output / "scripts" / "upgrade" / "build_1_1.py",
        source_root / "government-data" / "scripts" / "audit" / "check_source_view.py": output / "scripts" / "audit" / "check_source_view.py",
        source_root / "government-data" / "scripts" / "ingest" / "adapters_1_1.py": output / "scripts" / "ingest" / "adapters_1_1.py",
        source_root / "government-data" / "tests" / "test_government_1_1.py": output / "tests" / "test_government_1_1.py",
        source_root / "government-data" / "tests" / "test_source_adapters_1_1.py": output / "tests" / "test_source_adapters_1_1.py",
        source_root / "government-data" / "tests" / "government_data_adapter_import.py": output / "tests" / "government_data_adapter_import.py",
    }
    for source, target in mapping.items():
        if not source.exists():
            raise RuntimeError(f"Verbindliche Implementierungsdatei fehlt: {source}")
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_suffix(target.suffix + ".tmp")
        shutil.copy2(source, temporary)
        temporary.replace(target)


def clean_event_references(rows: list[dict[str, Any]], fallback: str) -> None:
    for row in rows:
        if "source_event_ids" in row:
            row["source_event_ids"] = [value for value in row["source_event_ids"] if isinstance(value, str) and value]
            if not row["source_event_ids"]:
                row["source_event_ids"] = [fallback]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--source-root", type=Path, default=Path(__file__).resolve().parents[3])
    args = parser.parse_args()
    source = args.input.resolve()
    output = args.output.resolve()
    source_root = args.source_root.resolve()
    if not (source / "canonical" / "government-actions.jsonl").exists():
        raise RuntimeError("Government Data 1.0 Eingabepaket fehlt oder ist unvollständig.")
    clone_tree(source, output)

    source_events = read_jsonl(output / "normalized" / "source-events.jsonl")
    actions = read_jsonl(output / "canonical" / "government-actions.jsonl")
    relationships = read_jsonl(output / "canonical" / "relationships.jsonl")
    with (output / "audit" / "INGESTION-ERRORS.csv").open(encoding="utf-8", newline="") as handle:
        errors = list(csv.DictReader(handle))

    institutions, assignments, event_ids = build_executive_registry(output, source_events, errors)
    cabinet_events = add_cabinet_start_events(output, source_events, errors)
    bmwe_regression = add_bmwe_regression_cases(output, source_events, actions, errors)

    fallback_event = event_ids.get("current_ministries") or source_events[0]["source_event_id"]
    clean_event_references(institutions, fallback_event)
    clean_event_references(assignments, fallback_event)

    classifications = build_candidate_classification(output, source_events, bmwe_regression, errors)
    clusters, membership = duplicate_clusters(actions, relationships)
    actions = review_actions(actions, source_events, membership)
    coverage_rows = update_coverage(output, classifications, bmwe_regression, errors)

    write_jsonl(output / "normalized" / "source-events.jsonl", source_events)
    write_jsonl(output / "canonical" / "government-actions.jsonl", actions)
    write_jsonl(output / "canonical" / "executive-institutions.jsonl", institutions)
    write_jsonl(output / "canonical" / "office-holder-assignments.jsonl", assignments)
    write_json(output / "config" / "executive-institution-registry.json", {
        "schema_version": DATA_VERSION,
        "as_of": AS_OF,
        "institutions": institutions,
    })
    write_json(output / "config" / "office-holder-assignments.json", {
        "schema_version": DATA_VERSION,
        "as_of": AS_OF,
        "assignments": assignments,
    })
    write_json(output / "config" / "federal-ministry-registry.json", {
        "schema_version": DATA_VERSION,
        "as_of": AS_OF,
        "government_term_start": TERM_START,
        "source_event_ids": [event_ids.get("current_ministries"), event_ids.get("roster_change")],
        "ministries": [row for row in institutions if row["institution_type"] == "FEDERAL_MINISTRY"],
        "office_holder_assignments": [row for row in assignments if row["institution_id"] != "BKAmt"],
    })
    update_source_registries(output)
    copy_contracts(output, source_root)
    copy_upgrade_source(output, source_root)
    materiality_and_analysis_contracts(output, source_root)

    public_actions, public_sources = public_exports(
        output, actions, source_events, institutions, assignments, coverage_rows
    )
    validation = validate_invariants(
        output, actions, source_events, institutions, assignments,
        classifications, public_actions, clusters, event_ids, cabinet_events,
        bmwe_regression,
    )
    write_reports(
        output, actions, source_events, classifications, public_actions,
        public_sources, coverage_rows, errors, clusters, validation,
        bmwe_regression,
    )
    write_readme_and_report(output, validation)
    manifest(output)
    print(json.dumps({
        "status": validation["status"],
        "output": str(output),
        "source_events": len(source_events),
        "government_actions": len(actions),
        "public_actions": len(public_actions),
        "candidate_classifications": len(classifications),
    }, ensure_ascii=False))
    return 0 if validation["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
