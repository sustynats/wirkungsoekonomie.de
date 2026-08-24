#!/usr/bin/env python3
"""Build and validate Mecklenburg-Vorpommern's current-source classification.

The register materializes source facts already documented in issue #240 and
preserves the existing eight-theme Fachreview byte-for-byte. It does not
create impact directions, Fach judgements, DNS mappings, recommendations,
party scores, or a Vercel deployment.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTER_PATH = ROOT / "woek-parlament-app/data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json"
REVIEW_PATH = ROOT / "woek-parlament-app/data/states/mecklenburg-vorpommern/approved-review-2026-08-18.md"
REPOSITORY = "sustynats/wirkungsoekonomie.de"
BASE_MAIN_COMMIT = "f66af9d7ae9171bb49b7efa3188f269443d4c089"
REVIEW_SHA256 = "0fe5316048c5e9fef01dbdc0ccd8326e3c644bdee6ef43997ec12a60c1fd7639"
SOURCE_PINS = [
    {
        "comment_id": 5367625510,
        "updated_at": "2026-08-21T08:42:51Z",
        "body_sha256": "c9776e4a73f2d95453b7dddfb485070fbcb3be6d7181cfc5d0dd051e17bfd820",
        "url": "https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5367625510",
        "role": "final 19-list field and programme-source reconciliation",
    },
    {
        "comment_id": 5374701790,
        "updated_at": "2026-08-21T19:59:01Z",
        "body_sha256": "1079748768dfae384c55d44914779b67f4a09d69fefe71429c46025539683875",
        "url": "https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5374701790",
        "role": "Buendnis C closure and Die PARTEI/OEDP source-type update",
    },
]
SOURCE_HANDOFF_URL = SOURCE_PINS[0]["url"]


def entry(
    party: str,
    artifact_class: str,
    source_status: str,
    public_status_label: str,
    public_status_detail: str,
    source_urls: list[tuple[str, str]],
    *,
    final_verified: bool,
    source_available: bool,
    canonicalization_pending: bool,
    canonical_artifact: dict | None = None,
) -> dict:
    return {
        "party": party,
        "field_scope": "LANDESLISTE",
        "artifact_class": artifact_class,
        "source_status": source_status,
        "public_status_label": public_status_label,
        "public_status_detail": public_status_detail,
        "source_urls": [{"label": label, "url": url} for label, url in source_urls],
        "final_election_programme_verified": final_verified,
        "source_available_for_election_corpus": source_available,
        "canonicalization_pending": canonicalization_pending,
        "canonical_artifact": canonical_artifact,
        "assessment_maturity": "SOURCE_CLASSIFICATION_ONLY_EXISTING_FACH_REVIEW_PRESERVED",
    }


def artifact(
    artifact_id: str,
    artifact_url: str,
    media_type: str,
    byte_length: int,
    sha256: str,
    title: str,
    version_evidence: str,
    publication_status: str,
    *,
    page_count: int | None,
) -> dict:
    return {
        "artifact_id": artifact_id,
        "artifact_url": artifact_url,
        "media_type": media_type,
        "byte_length": byte_length,
        "sha256": sha256,
        "page_count": page_count,
        "title": title,
        "retrieved_on": "2026-08-24",
        "version_evidence": version_evidence,
        "publication_status": publication_status,
        "identity_status": "BYTE_EXACT_PARTY_PRIMARY_ARTIFACT",
    }


PARTIES = [
    entry(
        "SPD", "FINAL_ELECTION_PROGRAMME", "FINAL_PROGRAMME_VERIFIED_IN_PRESERVED_2026_REVIEW",
        "Finales Wahlprogramm verifiziert",
        "Das Regierungsprogramm 2026–2031 ist im bestehenden achtteiligen Fachreview als parteioffizielle Programmquelle verifiziert.",
        [("Regierungsprogramm 2026–2031", "https://spd-mv.de/wahlen/landtagswahl-2026/regierungsprogramm-2026-2031")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "AfD", "FINAL_ELECTION_PROGRAMME", "FINAL_PROGRAMME_VERIFIED_IN_PRESERVED_2026_REVIEW",
        "Finales Wahlprogramm verifiziert",
        "Das Regierungsprogramm ist im bestehenden achtteiligen Fachreview über die offizielle Kampagnen- und Landesverbandsquelle verifiziert.",
        [("Offizielle Wahlseite", "https://afd-mv.de/blaue-wende-2026/"), ("Landesverband", "https://afd-mv.de/")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "CDU", "FINAL_ELECTION_PROGRAMME", "FINAL_PROGRAMME_VERIFIED_IN_PRESERVED_2026_REVIEW",
        "Finales Wahlprogramm verifiziert",
        "Programmseite und Parteitagsbeschluss 2026 sind im bestehenden achtteiligen Fachreview als parteioffizielle Quellen verifiziert.",
        [("Programmseite", "https://cdu-mv.de/programme/"), ("Parteitagsbeschluss", "https://cdu-mv.de/2026/daniel-peters-wir-zeigen-mit-diesem-programm-mecklenburg-vorpommern-kann-mehr-besser-nur-mit-uns/")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "Die Linke", "FINAL_ELECTION_PROGRAMME", "FINAL_PROGRAMME_VERIFIED_IN_PRESERVED_2026_REVIEW",
        "Finales Wahlprogramm verifiziert",
        "Das Wahlprogramm „Sozial. Gerecht. Antifaschistisch.“ ist im bestehenden achtteiligen Fachreview verifiziert.",
        [("Wahlprogramm 2026", "https://wahlprogramm26.die-linke-mv.de/")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "BÜNDNIS 90/DIE GRÜNEN", "FINAL_ELECTION_PROGRAMME", "FINAL_PROGRAMME_VERIFIED_IN_PRESERVED_2026_REVIEW",
        "Finales Wahlprogramm verifiziert",
        "Das Programm „Klare Kante GRÜN – Für Mensch und Natur in MV“ ist im bestehenden achtteiligen Fachreview verifiziert.",
        [("Wahlprogramm 2026", "https://gruene-mv.de/landtagswahl-2026/wahlprogramm-2026-1/")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "FDP", "FINAL_ELECTION_PROGRAMME", "FINAL_PROGRAMME_VERIFIED_IN_PRESERVED_2026_REVIEW",
        "Finales Wahlprogramm verifiziert",
        "Das Wahlprogramm 2026 ist im bestehenden achtteiligen Fachreview über die offizielle Programmseite verifiziert.",
        [("Programmseite", "https://www.fdp-mv.de/programm")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "Tierschutzpartei", "FINAL_ELECTION_PROGRAMME_NOT_VERIFIED", "FINAL_2026_PROGRAMME_NOT_YET_VERIFIED_IN_CURRENT_SCAN",
        "Finales Wahlprogramm im aktuellen Scan nicht verifiziert",
        "Die dokumentierte Quellenprüfung weist keinen belastbaren eigenständigen finalen MV-2026-Programmartifact nach. Das bedeutet nicht, dass kein Programm existiert.",
        [("Dokumentierter Quellenstatus in #240", SOURCE_HANDOFF_URL)],
        final_verified=False, source_available=False, canonicalization_pending=False,
    ),
    entry(
        "FREIE WÄHLER", "FINAL_ELECTION_PROGRAMME_PDF", "PARTY_OFFICIAL_FULL_PROGRAMME_PDF_BYTE_EXACT",
        "Finales Wahlprogramm bytegenau verifiziert",
        "Das 34-seitige Wahlprogramm zur Landtagswahl am 20. September 2026 liegt auf der Parteidomain vor. URL, Byteumfang, Seitenzahl und SHA-256 sind eingefroren.",
        [("Programm-PDF", "https://freie-waehler-mv.eu/wp-content/uploads/2026/06/LTW_2026_Wahlprogramm_FW-M-V_A5_interaktiv.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "MV-LTW-2026-FREIE-WAEHLER-WAHLPROGRAMM", "https://freie-waehler-mv.eu/wp-content/uploads/2026/06/LTW_2026_Wahlprogramm_FW-M-V_A5_interaktiv.pdf",
            "application/pdf", 3451433, "9e6295ac5a691cf4b4483736e1cf87a5b95192e122f43bbb8ca5a3cb9b67554c",
            "Wahlprogramm für die Landtagswahl am 20. September 2026",
            "The party-domain PDF cover names the Landtagswahl date and Mecklenburg-Vorpommern; URL, response bytes and content length identify the frozen version.",
            "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME", page_count=34,
        ),
    ),
    entry(
        "Die PARTEI", "CURRENT_PROGRAMME_ROUTE", "PARTY_OFFICIAL_CURRENT_PROGRAMME_ROUTE_BYTE_EXACT_FINALITY_NOT_VERIFIED",
        "Aktuelle Programmseite versioniert · Finalstatus offen",
        "Der offizielle Landesauftritt führt die Programmseite aus dem Landtagswahl-2026-Bereich. Die aktuelle HTML-Fassung ist bytegenau eingefroren; ein ausdrücklicher Beschluss- oder Finalstatus ist weiterhin nicht nachgewiesen und wird nicht unterstellt.",
        [("Landesportal", "https://diepartei-mv.de/"), ("Programmroute", "https://www.diepartei-mv.de/Programm.html")],
        final_verified=False, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "MV-LTW-2026-DIE-PARTEI-CURRENT-PROGRAMME-ROUTE", "https://www.diepartei-mv.de/Programm.html",
            "text/html; charset=UTF-8", 21105, "2eb74e6cbeaa06109fb4e4333b4ac99742f7bf1e0008a9d87deeeb46ccf17641",
            "Unser Wahlprogramm – Das Sofort-Programm für MV",
            "The official state portal links this programme route from its 2026 election surface; two raw fetches were byte-identical. No adoption or finality evidence is claimed.",
            "PARTY_PUBLISHED_CURRENT_PROGRAMME_ROUTE_FINALITY_NOT_VERIFIED", page_count=None,
        ),
    ),
    entry(
        "PIRATEN", "FINAL_ELECTION_PROGRAMME_PDF", "PARTY_OFFICIAL_FINAL_PROGRAMME_ARTIFACT_READY",
        "Finales Wahlprogramm verifiziert",
        "Die offizielle Programmseite führt das Programm zur Landtagswahl 2026; das spätere finalwp2026-PDF wird vom früheren Entwurf getrennt.",
        [("Programmseite", "https://piratenpartei-mv.de/programme/"), ("Finales Programm-PDF", "https://piratenpartei-mv.de/wp-content/uploads/2026/04/finalwp2026_lek.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "ÖDP", "ELECTION_REFERENCED_CURRENT_LANDESPROGRAMME", "ELECTION_REFERENCED_CURRENT_LANDESPROGRAMME_NOT_NEW_2026_FINAL_CORPUS",
        "Aktuelles Landesprogramm wahlbezogen referenziert · kein neues finales 2026-Vollprogramm",
        "Die offizielle Wahlseite verweist auf das bestehende Landesprogramm. Es wird nicht still als neu 2026 verabschiedeter Wahlprogramm-Corpus umetikettiert.",
        [("Wahlseite 2026", "https://www.oedp-mv.de/wahlen/landtagswahl-2026"), ("Landesprogramm", "https://www.oedp-mv.de/programm/landesprogramm")],
        final_verified=False, source_available=False, canonicalization_pending=False,
    ),
    entry(
        "Bündnis C", "FINAL_ELECTION_PROGRAMME_PDF", "FINAL_PARTY_OFFICIAL_PROGRAMME_SOURCE_READY",
        "Finales Wahlprogramm verifiziert",
        "Das 22-seitige parteioffizielle Wahlprogramm zur Landtagswahl am 20. September 2026 ist als eigener finaler Programmartifact verifiziert.",
        [("Wahlseite", "https://mecklenburg-vorpommern.buendnis-c.de/"), ("Programm-PDF", "https://mecklenburg-vorpommern.buendnis-c.de/wp-content/uploads/sites/3/2026/08/BC-M-V-LTW-2026-WAHLPROGRAMM.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "BSW", "FINAL_ELECTION_PROGRAMME", "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE_READY",
        "Finales Wahlprogramm verifiziert",
        "Der Landesverband dokumentiert die einstimmige Annahme am 14. März 2026 und stellt Voll- und Kurzwahlprogramm bereit.",
        [("Wahlhub", "https://mv.bsw-vg.de/landtagswahl-2026/")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "Handwerker Partei Deutschland", "FINAL_ELECTION_PROGRAMME_NOT_VERIFIED", "FINAL_2026_PROGRAMME_NOT_YET_VERIFIED_IN_CURRENT_SCAN",
        "Finales Wahlprogramm im aktuellen Scan nicht verifiziert",
        "Die dokumentierte Quellenprüfung weist keinen belastbaren eigenständigen finalen MV-2026-Programmartifact nach. Das bedeutet nicht, dass kein Programm existiert.",
        [("Dokumentierter Quellenstatus in #240", SOURCE_HANDOFF_URL)],
        final_verified=False, source_available=False, canonicalization_pending=False,
    ),
    entry(
        "KPD", "FINAL_ELECTION_PROGRAMME_NOT_VERIFIED", "FINAL_2026_PROGRAMME_NOT_YET_VERIFIED_IN_CURRENT_SCAN",
        "Finales Wahlprogramm im aktuellen Scan nicht verifiziert",
        "Die dokumentierte Quellenprüfung weist keinen belastbaren eigenständigen finalen MV-2026-Programmartifact nach. Das bedeutet nicht, dass kein Programm existiert.",
        [("Dokumentierter Quellenstatus in #240", SOURCE_HANDOFF_URL)],
        final_verified=False, source_available=False, canonicalization_pending=False,
    ),
    entry(
        "PdF", "FINAL_ELECTION_PROGRAMME_PDF", "PARTY_OFFICIAL_2026_MV_ELECTION_PROGRAMME_PDF_READY",
        "Finales Wahlprogramm verifiziert",
        "Ein vollständiges MV-2026-Wahlprogramm mit eindeutiger Titel- und Inhaltsstruktur liegt auf der Parteidomain als PDF vor.",
        [("Wahlseite", "https://partei-des-fortschritts.de/landtagswahl-mecklenburg-vorpommern-2026/"), ("Programm-PDF", "https://partei-des-fortschritts.de/wp-content/uploads/2026/06/2026-05_wahlprogramm_MV.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "Team Freiheit", "CAMPAIGN_PROGRAMMATIC_SOURCE", "MV_2026_CAMPAIGN_PROGRAMMATIC_SOURCE_AVAILABLE_FINAL_STANDALONE_PROGRAMME_NOT_ESTABLISHED",
        "MV-2026-Kampagnenprogrammatik vorhanden · finales Vollprogramm nicht verifiziert",
        "MV-spezifische Positionen sind als Kampagnen- und Kommunikationsquelle verfügbar. Daraus wird kein eigenständiges finales Wahlprogramm abgeleitet.",
        [("Parteiwebsite", "https://team-freiheit.de/"), ("MV-Seite", "https://www.team-freiheit.de/mv/")],
        final_verified=False, source_available=False, canonicalization_pending=False,
    ),
    entry(
        "Volt", "FINAL_ELECTION_PROGRAMME_PDF", "PARTY_OFFICIAL_MV_2026_PROGRAMME_PDF_BYTE_EXACT",
        "Finales Wahlprogramm bytegenau verifiziert",
        "Das 67-seitige MV-Wahlprogramm zur Landtagswahl am 20. September 2026 ist als parteioffizielle PDF verfügbar. URL, Byteumfang, Seitenzahl und SHA-256 sind eingefroren.",
        [("Wahlhub", "https://voltdeutschland.org/mv/landtagswahl-2026"), ("Programmnavigation", "https://voltdeutschland.org/mv/programm/programme"), ("Wahlprogramm-PDF", "https://voltdeutschland.org/storage/assets-mv/pdf/haltungzeigen_wahlprogramm_voltmv_ltw26.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "MV-LTW-2026-VOLT-WAHLPROGRAMM", "https://voltdeutschland.org/storage/assets-mv/pdf/haltungzeigen_wahlprogramm_voltmv_ltw26.pdf",
            "application/pdf", 1725660, "a992f71adf0b37a633c60d9ac1e8923680e8a7e01ac428bf2e86036294e57663",
            "Haltung zeigen! Wahlprogramm von Volt MV zur Landtagswahl am 20.09.2026",
            "Direct full-programme PDF on the official party domain; cover identifies party, jurisdiction and election date.",
            "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME", page_count=67,
        ),
    ),
    entry(
        "WIR LEBEN DEMOKRATIE", "FINAL_ELECTION_PROGRAMME_NOT_VERIFIED", "FINAL_2026_PROGRAMME_NOT_YET_VERIFIED_IN_CURRENT_SCAN",
        "Finales Wahlprogramm im aktuellen Scan nicht verifiziert",
        "Die dokumentierte Quellenprüfung weist keinen belastbaren eigenständigen finalen MV-2026-Programmartifact nach. Das bedeutet nicht, dass kein Programm existiert.",
        [("Dokumentierter Quellenstatus in #240", SOURCE_HANDOFF_URL)],
        final_verified=False, source_available=False, canonicalization_pending=False,
    ),
]


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def descriptor_hash(payload: dict) -> str:
    hashed = dict(payload)
    hashed.pop("descriptor_sha256", None)
    canonical = json.dumps(hashed, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sha256_bytes(canonical.encode("utf-8"))


def build_register() -> dict:
    final_count = sum(party["final_election_programme_verified"] for party in PARTIES)
    pending_canonical = sum(party["canonicalization_pending"] for party in PARTIES)
    unavailable = sum(not party["source_available_for_election_corpus"] for party in PARTIES)
    final_not_verified = len(PARTIES) - final_count
    canonical_artifact_count = sum(party["canonical_artifact"] is not None for party in PARTIES)
    payload = {
        "schema_version": "woek-state-current-source-register-1.2",
        "register_id": "MV-LTW-2026-CURRENT-SOURCE-REGISTER-V2",
        "base_main_commit": BASE_MAIN_COMMIT,
        "jurisdiction": "mecklenburg-vorpommern",
        "election": "ltw-2026-mv",
        "source_as_of": "2026-08-24",
        "status": "CURRENT_SOURCE_CLASSIFICATION_COMPLETE_19_OF_19",
        "official_field": {
            "admitted_party_count": 19,
            "landesliste_count": 19,
            "official_source_url": "https://www.laiv-mv.de/Wahlen/Pressemitteilungen/?id=222342&processor=processor.sa.pressemitteilung",
            "official_source_date": "2026-07-31",
            "constitutional_court_closure_source_url": "https://www.regierung-mv.de/Landesregierung/im/Aktuell/?id=222602&processor=processor.sa.pressemitteilung",
            "constitutional_court_closure_date": "2026-08-14",
        },
        "coverage": {
            "classified_party_count": len(PARTIES),
            "final_election_programme_verified_count": final_count,
            "election_source_available_canonicalization_pending_count": pending_canonical,
            "final_election_programme_not_verified_count": final_not_verified,
            "source_unavailable_for_election_corpus_count": unavailable,
            "source_available_for_election_corpus_count": sum(party["source_available_for_election_corpus"] for party in PARTIES),
            "canonical_artifact_count": canonical_artifact_count,
            "canonical_final_programme_artifact_count": 2,
            "canonical_current_source_finality_open_count": 1,
            "canonicalization_completed_in_v2_count": 3,
            "full_final_election_programme_corpus_available": False,
            "assessment_maturity": "PARTIAL_ANALYSIS_NEEDS_COMPLETION",
        },
        "preserved_fach_review": {
            "path": "woek-parlament-app/data/states/mecklenburg-vorpommern/approved-review-2026-08-18.md",
            "sha256": REVIEW_SHA256,
            "byte_length": 11801,
            "materiality_theme_count": 8,
            "rule": "Preserve and cross-link the eight existing themes; source classification does not create or replace impact judgements.",
        },
        "source_pins": SOURCE_PINS,
        "parties": PARTIES,
        "publication_integrity": {
            "required_content_paths": ["/laender/mecklenburg-vorpommern", "/laender/mecklenburg-vorpommern/wahl"],
            "rendered_content_paths": ["/laender/mecklenburg-vorpommern", "/laender/mecklenburg-vorpommern/wahl"],
            "unrendered_content_paths": [],
        },
        "constraints": {
            "new_fach_judgements_created": False,
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


def github_comment(comment_id: int) -> dict:
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(
        f"https://api.github.com/repos/{REPOSITORY}/issues/comments/{comment_id}",
        headers=headers,
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def validate(actual: dict, expected: dict, *, check_github: bool) -> None:
    if actual != expected:
        raise ValueError("MV_CURRENT_SOURCE_REGISTER_DRIFT: run with --write and inspect the diff")
    if descriptor_hash(actual) != actual["descriptor_sha256"]:
        raise ValueError("MV_CURRENT_SOURCE_DESCRIPTOR_HASH_DRIFT")
    if sha256_bytes(REVIEW_PATH.read_bytes()) != REVIEW_SHA256 or REVIEW_PATH.stat().st_size != 11801:
        raise ValueError("MV_PRESERVED_FACH_REVIEW_DRIFT")
    parties = actual["parties"]
    if len(parties) != 19 or len({party["party"] for party in parties}) != 19:
        raise ValueError("MV_OFFICIAL_PARTY_SET_NOT_EXACTLY_19")
    if any(party["field_scope"] != "LANDESLISTE" for party in parties):
        raise ValueError("MV_NON_LANDESLISTE_PARTY")
    if sum(party["final_election_programme_verified"] for party in parties) != 12:
        raise ValueError("MV_VERIFIED_FINAL_PROGRAMME_COUNT_DRIFT")
    if sum(party["canonicalization_pending"] for party in parties) != 0:
        raise ValueError("MV_CANONICALIZATION_PENDING_COUNT_DRIFT")
    if sum(not party["source_available_for_election_corpus"] for party in parties) != 6:
        raise ValueError("MV_SOURCE_UNAVAILABLE_COUNT_DRIFT")
    if actual["coverage"]["final_election_programme_not_verified_count"] != 7:
        raise ValueError("MV_FINAL_PROGRAMME_NOT_VERIFIED_COUNT_DRIFT")
    if actual["coverage"]["canonical_artifact_count"] != 3:
        raise ValueError("MV_CANONICAL_ARTIFACT_COUNT_DRIFT")
    if any(not row["url"].startswith("https://") for party in parties for row in party["source_urls"]):
        raise ValueError("MV_NON_HTTPS_SOURCE_URL")
    canonical_parties = [party for party in parties if party["canonical_artifact"] is not None]
    if [party["party"] for party in canonical_parties] != ["FREIE WÄHLER", "Die PARTEI", "Volt"]:
        raise ValueError("MV_V2_CANONICAL_ARTIFACT_PARTY_DRIFT")
    for party in canonical_parties:
        artifact_record = party["canonical_artifact"]
        if not artifact_record["artifact_url"].startswith("https://"):
            raise ValueError(f"MV_CANONICAL_ARTIFACT_URL_DRIFT:{party['party']}")
        if not artifact_record["byte_length"] > 0 or any(char not in "0123456789abcdef" for char in artifact_record["sha256"]) or len(artifact_record["sha256"]) != 64:
            raise ValueError(f"MV_CANONICAL_ARTIFACT_IDENTITY_DRIFT:{party['party']}")
        if artifact_record["identity_status"] != "BYTE_EXACT_PARTY_PRIMARY_ARTIFACT":
            raise ValueError(f"MV_CANONICAL_ARTIFACT_STATUS_DRIFT:{party['party']}")
    die_partei = next(party for party in parties if party["party"] == "Die PARTEI")
    if die_partei["final_election_programme_verified"] or "FINALITY_NOT_VERIFIED" not in die_partei["source_status"]:
        raise ValueError("MV_DIE_PARTEI_FINALITY_MUST_REMAIN_FAIL_CLOSED")
    if any(actual["constraints"].values()):
        raise ValueError("MV_FORBIDDEN_SYNTHESIS_OR_DEPLOYMENT_RECORDED")
    integrity = actual["publication_integrity"]
    if integrity["required_content_paths"] != integrity["rendered_content_paths"] or integrity["unrendered_content_paths"]:
        raise ValueError("MV_PUBLICATION_PATH_COVERAGE_DRIFT")
    if check_github:
        for pin in SOURCE_PINS:
            comment = github_comment(pin["comment_id"])
            if comment["updated_at"] != pin["updated_at"]:
                raise ValueError(f"MV_GITHUB_COMMENT_UPDATED_AT_DRIFT:{pin['comment_id']}")
            if sha256_bytes(comment["body"].encode("utf-8")) != pin["body_sha256"]:
                raise ValueError(f"MV_GITHUB_COMMENT_BODY_HASH_DRIFT:{pin['comment_id']}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--check-github", action="store_true")
    args = parser.parse_args()
    expected = build_register()
    if args.write:
        REGISTER_PATH.parent.mkdir(parents=True, exist_ok=True)
        REGISTER_PATH.write_text(
            json.dumps(expected, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
            newline="\n",
        )
    if not REGISTER_PATH.exists():
        raise ValueError("MV_CURRENT_SOURCE_REGISTER_MISSING")
    actual = json.loads(REGISTER_PATH.read_text(encoding="utf-8"))
    validate(actual, expected, check_github=args.check_github)
    print(json.dumps({
        "gate": "MV_CURRENT_SOURCE_COMPLETION",
        "status": "PASS_19_OF_19_CLASSIFIED",
        "official_party_count": 19,
        "verified_final_programmes": 12,
        "election_sources_pending_canonicalization": 0,
        "canonical_artifacts_completed_in_v2": 3,
        "current_source_finality_open": 1,
        "final_programmes_not_verified": 7,
        "source_unavailable_for_election_corpus": 6,
        "full_final_election_programme_corpus_available": False,
        "preserved_materiality_themes": 8,
        "unrendered_content_paths": 0,
        "descriptor_sha256": actual["descriptor_sha256"],
        "github_source_pins": "PASS" if args.check_github else "NOT_REQUESTED",
        "new_fach_judgements_created": False,
        "dns_mapping_synthesized": False,
        "recommendation_synthesized": False,
        "vercel_build_triggered": False,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
