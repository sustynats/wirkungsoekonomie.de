#!/usr/bin/env python3
"""Build and validate the 16-state official document-discovery adapter registry.

The adapters monitor official parliamentary document surfaces only. Discovery
never becomes a public fact, impact judgement, DNS mapping, recommendation or
deployment without the existing review and publication gates.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urlencode


ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "woek-parlament-app/data/state-sources/official-state-source-adapters-v1.json"
JURISDICTIONS_PATH = ROOT / "woek-parlament-app/data/political-jurisdictions.json"
BASE_MAIN_COMMIT = "376be9ed1e6f6fc2095111fd86990b3bf149ca9b"
SHARED_ENDPOINT = "https://landtag-apps.nrw.de/GeheimesSpiegelein/suche"

STATES = [
    ("DE-BW", "Baden-Württemberg", "BW", "https://www.landtag-bw.de/de/dokumente/parlamentsdokumentation"),
    ("DE-RP", "Rheinland-Pfalz", "RPF", "https://dokumente.landtag.rlp.de/landtag/xml-dokumente/"),
    ("DE-ST", "Sachsen-Anhalt", "SACA", "https://www.landtag.sachsen-anhalt.de/dokumente/"),
    ("DE-BE", "Berlin", "BLN", "https://www.parlament-berlin.de/dokumente/open-data"),
    ("DE-MV", "Mecklenburg-Vorpommern", "MEVO", "https://www.landtag-mv.de/services/parlamentsdokumente"),
    ("DE-SH", "Schleswig-Holstein", "SH", "https://www.landtag.ltsh.de/parlament/drucksachen-online/"),
    ("DE-SL", "Saarland", "SAL", "https://www.landtag-saar.de/Dokumente"),
    ("DE-NW", "Nordrhein-Westfalen", "NW", "https://www.landtag.nrw.de/home/dokumente/dokumentensuche.html"),
    ("DE-HB", "Bremen", "HB", "https://paris.bremische-buergerschaft.de/index.htm"),
    ("DE-NI", "Niedersachsen", "NDS", "https://www.landtag-niedersachsen.de/dokumentensuche/"),
    ("DE-BY", "Bayern", "BAY", "https://www.bayern.landtag.de/parlament/dokumente/"),
    ("DE-HE", "Hessen", "HES", "https://hessischer-landtag.de/parlamentsdatenbank"),
    ("DE-BB", "Brandenburg", "BRA", "https://www.parlamentsdokumentation.brandenburg.de/"),
    ("DE-SN", "Sachsen", "SAC", "https://www.landtag.sachsen.de/de/mediathek-und-publikationen/parlamentsdokumente/index"),
    ("DE-TH", "Thüringen", "THUE", "https://parldok.thueringer-landtag.de/Parldok/%C3%BCber.html"),
    ("DE-HH", "Hamburg", "HH", "https://www.buergerschaft-hh.de/parldok/"),
]


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def descriptor_hash(payload: dict) -> str:
    hashed = dict(payload)
    hashed.pop("descriptor_sha256", None)
    canonical = json.dumps(hashed, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sha256_bytes(canonical.encode("utf-8"))


def adapter(jurisdiction_id: str, name: str, source_code: str, primary_portal_url: str) -> dict:
    common = {
        "adapter_id": f"state-document-discovery-{jurisdiction_id.lower()}",
        "jurisdiction_id": jurisdiction_id,
        "jurisdiction_name": name,
        "adapter_status": "ACTIVE_DOCUMENT_DISCOVERY",
        "primary_parliamentary_portal_url": primary_portal_url,
        "discovery_scope": ["PARLIAMENTARY_DOCUMENT", "PARLIAMENTARY_PROCEEDING"],
        "automatic_publication_allowed": False,
        "requires_fact_validation_before_projection": True,
        "requires_fach_review_for_impact_content": True,
    }
    if jurisdiction_id == "DE-HB":
        return common | {
            "source_authority": "Bremische Bürgerschaft – PARiS",
            "transport": "HTTP_POST_FORM",
            "request": {
                "url": "https://paris.bremische-buergerschaft.de/starweb/paris/servlet.starweb?",
                "allowed_host": "paris.bremische-buergerschaft.de",
                "form": {
                    "path": "paris/LISSHFL.web",
                    "format": "LISSH_BrowseVorgang_Report",
                    "01_LISSHFL_Themen": "",
                    "02_LISSHFL_PARL": "L",
                    "03_LISSHFL_WP": "21",
                },
            },
            "discovery": {
                "marker_pattern": r"search=DID%3D[A-Z]-[0-9]+",
                "minimum_marker_count": 1,
                "marker_semantics": "PARIS_DOCUMENT_ID",
            },
        }
    query = urlencode({
        "query": "",
        "qyZeitBis": "heute",
        "qyZeitAb": "letzterMonat",
        "qyHerk": source_code,
        "type": "dokument",
        "als": "0",
        "size": "10",
    })
    return common | {
        "source_authority": "Parlamentsspiegel – gemeinsames Informationssystem der Landesparlamente",
        "transport": "HTTP_GET",
        "request": {
            "url": f"{SHARED_ENDPOINT}?{query}",
            "allowed_host": "landtag-apps.nrw.de",
        },
        "discovery": {
            "marker_pattern": rf"ps-detail-{source_code}_[A-Za-z0-9_]+",
            "minimum_marker_count": 1,
            "marker_semantics": "PARLAMENTSSPIEGEL_DOCUMENT_ID",
        },
    }


def build_registry() -> dict:
    adapters = [adapter(*state) for state in STATES]
    payload = {
        "schema_version": "woek-state-official-source-adapters-1.0",
        "registry_id": "WOEK-STATE-OFFICIAL-DOCUMENT-DISCOVERY-16-V1",
        "base_main_commit": BASE_MAIN_COMMIT,
        "effective_date": "2026-08-24",
        "status": "ACTIVE_DOCUMENT_DISCOVERY_16_OF_16",
        "coverage": {
            "registered_state_count": 16,
            "active_document_discovery_adapter_count": 16,
            "shared_official_parliamentsspiegel_adapter_count": 15,
            "state_specific_official_adapter_count": 1,
            "automatic_public_fact_projection_count": 0,
            "automatic_fach_projection_count": 0,
        },
        "shared_source_evidence": {
            "name": "Parlamentsspiegel",
            "url": "https://landtag-apps.nrw.de/GeheimesSpiegelein/suche?type=dokument&als=0&size=10",
            "authority": "Gemeinsames Informationssystem der Landesparlamente im Auftrag ihrer Präsidentinnen und Präsidenten",
            "scope": "Server-side document search with direct access to parliamentary proceedings and documents",
        },
        "adapters": adapters,
        "publication_boundary": {
            "source_discovery_is_public_fact": False,
            "document_marker_is_impact_evidence": False,
            "automatic_publication_allowed": False,
            "required_next_gate": "SOURCE_IDENTITY_AND_FACT_VALIDATION_THEN_EXPLICIT_FACH_REVIEW_WHERE_APPLICABLE",
        },
        "constraints": {
            "fach_synthesized": False,
            "impact_direction_synthesized": False,
            "dns_mapping_synthesized": False,
            "recommendation_synthesized": False,
            "party_score_created": False,
            "vercel_build_triggered": False,
        },
        "hash_definition": "SHA-256 of canonical JSON (UTF-8, sorted keys, compact separators) excluding descriptor_sha256",
    }
    payload["descriptor_sha256"] = descriptor_hash(payload)
    return payload


def validate(actual: dict, expected: dict) -> None:
    if actual != expected:
        raise ValueError("STATE_OFFICIAL_SOURCE_ADAPTER_REGISTRY_DRIFT: run with --write and inspect the diff")
    if descriptor_hash(actual) != actual["descriptor_sha256"]:
        raise ValueError("STATE_OFFICIAL_SOURCE_ADAPTER_DESCRIPTOR_DRIFT")
    adapters = actual["adapters"]
    if len(adapters) != 16 or len({entry["jurisdiction_id"] for entry in adapters}) != 16:
        raise ValueError("STATE_OFFICIAL_SOURCE_ADAPTER_COVERAGE_DRIFT")
    political = json.loads(JURISDICTIONS_PATH.read_text(encoding="utf-8"))
    state_ids = {entry["jurisdiction_id"] for entry in political["jurisdictions"] if entry["jurisdiction_type"] == "STATE"}
    if {entry["jurisdiction_id"] for entry in adapters} != state_ids:
        raise ValueError("STATE_OFFICIAL_SOURCE_ADAPTER_JURISDICTION_SET_DRIFT")
    if sum(entry["transport"] == "HTTP_GET" for entry in adapters) != 15:
        raise ValueError("STATE_OFFICIAL_SOURCE_SHARED_ADAPTER_COUNT_DRIFT")
    if sum(entry["transport"] == "HTTP_POST_FORM" for entry in adapters) != 1:
        raise ValueError("STATE_OFFICIAL_SOURCE_DIRECT_ADAPTER_COUNT_DRIFT")
    for entry in adapters:
        if entry["adapter_status"] != "ACTIVE_DOCUMENT_DISCOVERY":
            raise ValueError(f"STATE_OFFICIAL_SOURCE_ADAPTER_NOT_ACTIVE:{entry['jurisdiction_id']}")
        if not entry["request"]["url"].startswith("https://") or not entry["primary_parliamentary_portal_url"].startswith("https://"):
            raise ValueError(f"STATE_OFFICIAL_SOURCE_ADAPTER_NON_HTTPS:{entry['jurisdiction_id']}")
        if entry["automatic_publication_allowed"] or not entry["requires_fact_validation_before_projection"]:
            raise ValueError(f"STATE_OFFICIAL_SOURCE_ADAPTER_PUBLICATION_BOUNDARY_DRIFT:{entry['jurisdiction_id']}")
        if entry["discovery"]["minimum_marker_count"] != 1:
            raise ValueError(f"STATE_OFFICIAL_SOURCE_ADAPTER_MARKER_GATE_DRIFT:{entry['jurisdiction_id']}")
    if any(actual["constraints"].values()):
        raise ValueError("STATE_OFFICIAL_SOURCE_ADAPTER_FORBIDDEN_SYNTHESIS_OR_DEPLOYMENT")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    expected = build_registry()
    if args.write:
        REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
        REGISTRY_PATH.write_text(json.dumps(expected, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")
    if not REGISTRY_PATH.exists():
        raise ValueError("STATE_OFFICIAL_SOURCE_ADAPTER_REGISTRY_MISSING")
    actual = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    validate(actual, expected)
    print(json.dumps({
        "gate": "STATE_OFFICIAL_SOURCE_ADAPTERS",
        "status": "PASS_ACTIVE_DOCUMENT_DISCOVERY_16_OF_16",
        "state_adapters": 16,
        "shared_official_adapters": 15,
        "state_specific_official_adapters": 1,
        "automatic_publication_allowed": False,
        "descriptor_sha256": actual["descriptor_sha256"],
        "new_fach_judgements_created": False,
        "dns_mapping_synthesized": False,
        "recommendation_synthesized": False,
        "vercel_build_triggered": False,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
