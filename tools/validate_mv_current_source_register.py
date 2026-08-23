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
REGISTER_PATH = ROOT / "woek-parlament-app/data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026.json"
REVIEW_PATH = ROOT / "woek-parlament-app/data/states/mecklenburg-vorpommern/approved-review-2026-08-18.md"
REPOSITORY = "sustynats/wirkungsoekonomie.de"
BASE_MAIN_COMMIT = "8ab669258b46fb3904e4d1292423c1106dc8c778"
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
        "assessment_maturity": "SOURCE_CLASSIFICATION_ONLY_EXISTING_FACH_REVIEW_PRESERVED",
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
        "FREIE WÄHLER", "FULL_ELECTION_PROGRAMME_PDF_PENDING_CANONICALIZATION", "PARTY_DOMAIN_FULL_PROGRAMME_PDF_IDENTIFIED_CANONICAL_FETCH_HASH_REQUIRED",
        "Vollprogramm-PDF identifiziert · Kanonisierung offen",
        "Ein Vollprogramm-PDF auf der Parteidomain ist identifiziert. Vor dem kanonischen Import fehlen noch direkter Byte-Abruf und Hash-Sicherung.",
        [("Programm-PDF", "https://freie-waehler-mv.eu/wp-content/uploads/2026/06/LTW_2026_Wahlprogramm_FW-M-V_A5_interaktiv.pdf")],
        final_verified=False, source_available=True, canonicalization_pending=True,
    ),
    entry(
        "Die PARTEI", "ELECTION_PROGRAMME_ROUTE_PENDING_CANONICALIZATION", "PARTY_OFFICIAL_PROGRAMME_ROUTE_VERSION_AND_APPROVAL_STATUS_PENDING",
        "Programmroute vorhanden · Fassung und Beschlussstatus offen",
        "Der offizielle Landesauftritt führt einen Landtagswahl-2026-Bereich und eine Programmroute. Dokumentfassung und Beschlussstatus müssen vor dem atomaren Import gesichert werden.",
        [("Landesportal", "https://diepartei-mv.de/"), ("Programmroute", "https://www.diepartei-mv.de/Programm.html")],
        final_verified=False, source_available=True, canonicalization_pending=True,
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
        "Volt", "ELECTION_PROGRAMME_NAVIGATION_PENDING_CANONICALIZATION", "PARTY_OFFICIAL_MV_2026_PROGRAMMATIC_SOURCE_EXACT_VERSIONED_FILE_OR_SNAPSHOT_PENDING",
        "MV-2026-Programmquelle vorhanden · exakte Fassung noch zu kanonisieren",
        "Der offizielle Wahlhub verweist auf die Programmnavigation. Vor dem kanonischen Import fehlt noch eine exakt versionierte MV-Programmfassung oder ein Snapshot.",
        [("Wahlhub", "https://voltdeutschland.org/mv/landtagswahl-2026"), ("Programmnavigation", "https://voltdeutschland.org/mv/programm/programme")],
        final_verified=False, source_available=True, canonicalization_pending=True,
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
    payload = {
        "schema_version": "woek-state-current-source-register-1.1",
        "register_id": "MV-LTW-2026-CURRENT-SOURCE-REGISTER-V1",
        "base_main_commit": BASE_MAIN_COMMIT,
        "jurisdiction": "mecklenburg-vorpommern",
        "election": "ltw-2026-mv",
        "source_as_of": "2026-08-21",
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
            "final_election_programme_not_verified_count": unavailable,
            "source_available_for_election_corpus_count": sum(party["source_available_for_election_corpus"] for party in PARTIES),
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
    if sum(party["final_election_programme_verified"] for party in parties) != 10:
        raise ValueError("MV_VERIFIED_FINAL_PROGRAMME_COUNT_DRIFT")
    if sum(party["canonicalization_pending"] for party in parties) != 3:
        raise ValueError("MV_CANONICALIZATION_PENDING_COUNT_DRIFT")
    if sum(not party["source_available_for_election_corpus"] for party in parties) != 6:
        raise ValueError("MV_FINAL_PROGRAMME_NOT_VERIFIED_COUNT_DRIFT")
    if any(not row["url"].startswith("https://") for party in parties for row in party["source_urls"]):
        raise ValueError("MV_NON_HTTPS_SOURCE_URL")
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
        "verified_final_programmes": 10,
        "election_sources_pending_canonicalization": 3,
        "final_programmes_not_verified": 6,
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
