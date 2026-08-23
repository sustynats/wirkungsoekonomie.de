#!/usr/bin/env python3
"""Build and validate Berlin's complete current-source classification.

The register materializes only source facts already documented in issue #240.
It does not create impact directions, Fach judgements, DNS mappings,
recommendations, party scores, or a Vercel deployment.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTER_PATH = ROOT / "woek-parlament-app/data/state-programmes/current-source-registers/berlin-2026.json"
REVIEW_PATH = ROOT / "woek-parlament-app/data/states/berlin/approved-review-2026-08-18.md"
REPOSITORY = "sustynats/wirkungsoekonomie.de"
BASE_MAIN_COMMIT = "fefec75f09dc70db8de7880f93b4e8c6788e4461"
REVIEW_SHA256 = "6a7c7eb890b57f7b2d5b3ce0d461468d79febb7397e2930a28217f42374ed9f2"
SOURCE_PINS = [
    {
        "comment_id": 5367584560,
        "updated_at": "2026-08-21T08:39:54Z",
        "body_sha256": "c061b873efbe5a8217a05f2dc9df90466ff1444b1707f1ffeccbd481d702efba",
        "url": "https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5367584560",
        "role": "official field and programme-source reconciliation",
    },
    {
        "comment_id": 5374672840,
        "updated_at": "2026-08-21T19:55:47Z",
        "body_sha256": "491050279986ddc34df19b90f81a946bb7c5d33104330dd7406b4523f6941ddd",
        "url": "https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5374672840",
        "role": "five open artifact classifications and source-maturity guard",
    },
]


def entry(
    party: str,
    field_scope: str,
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
        "field_scope": field_scope,
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
        "AfD", "LANDESLISTE", "ELECTION_PROGRAMME_LINK",
        "PARTY_OFFICIAL_LANDESPROGRAMME_LINK_CONFIRMED_EXACT_FINAL_PDF_HASH_PENDING",
        "Landeswahlprogramm verlinkt · Dateifassung noch zu kanonisieren",
        "Eine offizielle Berliner Bezirksseite verlinkt das Landeswahlprogramm 2026. Die exakte finale PDF-Datei und ihr Hash sind im WÖk-Corpus noch nicht eingefroren; Bezirksprogramme bleiben getrennte Objekte.",
        [("Offizielle Wahlseite AfD Lichtenberg", "https://lichtenberg.afd.berlin/wahl-2026/")],
        final_verified=False, source_available=True, canonicalization_pending=True,
    ),
    entry(
        "BÜNDNIS 90/DIE GRÜNEN", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das beschlossene Berliner Wahlprogramm 2026 ist als parteioffizielle Programmquelle verfügbar.",
        [("Wahlprogramm", "https://gruene.berlin/wahlprogramm")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "BSW", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME_PDF",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_PDF",
        "Finales Wahlprogramm verifiziert",
        "Das am 25. April 2026 verabschiedete 66-seitige Landeswahlprogramm liegt als parteioffizielle PDF vor.",
        [("Programmseite", "https://bsw.berlin/allgemein/entwurf-des-landeswahlprogramms-des-berliner-bsw/"), ("Programm-PDF", "https://bsw.berlin/wp-content/uploads/Wahlprogramm-BSW-Berlin-AGH-Wahl-2026.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "DKP", "LANDESLISTE", "ELECTION_PROGRAMME_LINK",
        "PARTY_OFFICIAL_AGH_PROGRAMME_LINK_AVAILABLE_FINAL_FILE_HASH_PENDING",
        "Wahlprogramm verlinkt · Dateihash noch offen",
        "Eine parteioffizielle Wahlseite weist den AGH-Wahlprogramm-Link aus. Die finale Datei muss vor atomarem Import noch bytegenau kanonisiert werden.",
        [("Offizielle Wahlseite", "https://trep-koep.dkp.de/berliner-wahlen-2026/")],
        final_verified=False, source_available=True, canonicalization_pending=True,
    ),
    entry(
        "Die Urbane.", "LANDESLISTE", "GENERAL_CURRENT_PARTY_PROGRAMME",
        "GENERAL_WORK_IN_PROGRESS_NOT_FINAL_ELECTION_PROGRAMME",
        "Allgemeines Programm in Arbeit · kein finales Wahlprogramm",
        "Die Partei bezeichnet ihr allgemeines Programm selbst als unvollständig und ohne finales Lektorat. Ein eigener finaler Berlin-2026-Programmartifact ist nicht verifiziert.",
        [("Allgemeines Programm", "https://www.die-urbane.de/programm.html"), ("Landesverband Berlin", "https://www.die-urbane.de/die-urbane/landesverbaende/du-berlin.html")],
        final_verified=False, source_available=False, canonicalization_pending=False,
    ),
    entry(
        "FDP", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das Berliner Wahlprogramm zur Abgeordnetenhauswahl 2026 ist als parteioffizielle Programmquelle verfügbar.",
        [("Wahlprogramm", "https://www.fdp-berlin.de/wahlprogramm")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "ÖDP", "LANDESLISTE", "ELECTION_CAMPAIGN_AND_GENERAL_PROGRAMME_REFERENCE",
        "ELECTION_CAMPAIGN_SOURCE_DEDICATED_FINAL_PROGRAMME_NOT_VERIFIED",
        "Wahlkampagnenmaterial vorhanden · finales Vollprogramm nicht verifiziert",
        "Kampagne, Flyer und Spot sind Kommunikationsquellen. Bestehende landespolitische Programmatik wird nicht still als finales Berlin-2026-Wahlprogramm umetikettiert.",
        [("Wahlseite 2026", "https://www.oedp-berlin.de/wahlen/abgeordnetenhauswahl-2026"), ("Wahlwerbemittel", "https://www.oedp-berlin.de/wahlen/abgeordnetenhauswahl-2026/tv-spot-u-bahn-werbung-flyer-co")],
        final_verified=False, source_available=False, canonicalization_pending=False,
    ),
    entry(
        "PdF", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME_PENDING",
        "FINAL_ELECTION_PROGRAMME_NOT_YET_PUBLISHED_SOURCE_PENDING",
        "Finales Wahlprogramm noch nicht veröffentlicht",
        "Die offizielle Wahlseite kündigt das Wahlprogramm weiterhin an und verweist vorläufig nur auf das Grundsatzprogramm. Dieses ersetzt keinen Berlin-2026-Programmartifact.",
        [("Offizielle Wahlseite", "https://partei-des-fortschritts.de/wahl-zum-abgeordnetenhaus-berlin/")],
        final_verified=False, source_available=False, canonicalization_pending=False,
    ),
    entry(
        "Die PARTEI", "LANDESLISTE", "PARTY_OFFICIAL_2026_ELECTION_PROGRAMME",
        "PARTY_OFFICIAL_2026_ELECTION_PROGRAMME_AVAILABLE",
        "Wahlprogramm 2026 verifiziert",
        "Die parteioffizielle Berliner Seite veröffentlicht das AGH-Wahlprogramm 2026 als Zehn-Punkte-Plan. Bezirksspezifische Programme bleiben getrennt.",
        [("Parteiwebsite Berlin", "https://die-partei-berlin.de/")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "Tierschutzpartei", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME_PDF",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_PDF",
        "Finales Wahlprogramm verifiziert",
        "Das am 14. März 2026 beschlossene Berliner Landeswahlprogramm liegt als parteioffizielle Vollfassung vor.",
        [("Wahlseite", "https://berlin.tierschutzpartei.de/berliner-wahlen-2026"), ("Programm-PDF", "https://berlin.tierschutzpartei.de/wahlprogramm-berlin-2026.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "SGP", "LANDESLISTE", "ELECTION_MANIFEST",
        "PARTY_ELECTION_MANIFEST_AVAILABLE_GERMAN_ORIGINAL_PARTY_IDENTITY_PENDING",
        "Wahlmanifest verfügbar · Originalfassung noch zu kanonisieren",
        "Ein Berlin-Wahlmanifest ist verfügbar. Vor kanonischem Import müssen deutsche Originalfassung, Parteiquelle und Dokumentidentität exakt gesichert werden.",
        [("Manifest-PDF", "https://www.wsws.org/en/articles/2026/02/11/jhwp-f11.pdf")],
        final_verified=False, source_available=True, canonicalization_pending=True,
    ),
    entry(
        "Volt", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das Berliner Programm 2026 ist als parteioffizielle Programmquelle verfügbar.",
        [("Programm Berlin 2026", "https://voltdeutschland.org/berlin/programm/programme/programm-berlin-2026")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "SPD", "BERLINWEITE_BEZIRKSLISTEN", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das am 8./9. Mai 2026 final beschlossene Berliner Wahlprogramm ist als parteioffizielle Programmquelle verfügbar.",
        [("Wahlprogramm", "https://spd.berlin/wahlprogramm/")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "CDU", "BERLINWEITE_BEZIRKSLISTEN", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das am 9. Juni 2026 beschlossene Regierungsprogramm 2026–2031 ist als parteioffizielle Programmquelle verfügbar.",
        [("Regierungsprogramm", "https://cdu.berlin/wofuer-wir-stehen")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "Die Linke", "BERLINWEITE_BEZIRKSLISTEN", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das Berliner Wahlprogramm 2026 ist als parteioffizielle Programmquelle verfügbar.",
        [("Wahlprogramm", "https://dielinke.berlin/wahlprogramm/")],
        final_verified=True, source_available=True, canonicalization_pending=False,
    ),
    entry(
        "HEIMAT", "BEZIRKSLISTEN_EINZELNE_BEZIRKE", "CAMPAIGN_POSITION_AND_GENERAL_PROGRAMME_REFERENCE",
        "BERLIN_2026_POSITION_SOURCES_DEDICATED_FINAL_PROGRAMME_NOT_VERIFIED",
        "Berliner Positionen vorhanden · finales Wahlprogramm nicht verifiziert",
        "Aktuelle Berliner Positionen und das allgemeine Parteiprogramm bleiben getrennte Quellen. Kein eigener finaler Berlin-2026-Programmartifact ist verifiziert.",
        [("Parteiwebsite mit Berliner Bereich", "https://die-heimat.de/"), ("Allgemeines Parteiprogramm", "https://die-heimat.de/wp-content/uploads/2023/11/Parteiprogramm_Heimat.pdf")],
        final_verified=False, source_available=False, canonicalization_pending=False,
    ),
    entry(
        "B* (bergpartei, die überpartei)", "BEZIRKSLISTEN_EINZELNE_BEZIRKE", "GENERAL_PROGRAMME_REFERENCE",
        "GENERAL_PROGRAMME_REFERENCE_2026_SPECIFIC_FINAL_ARTIFACT_NOT_VERIFIED",
        "Allgemeine Programmreferenz · kein finales Wahlprogramm verifiziert",
        "Ein älterer allgemeiner Programmcorpus ist dokumentiert. Er wird nicht als finales Berlin-2026-Wahlprogramm oder vollständiger Wahlversprechen-Corpus ausgegeben.",
        [("Archivierte Programmreferenz", "https://www.bundeswahlleiterin.de/dam/jcr/cd0291eb-794b-4067-99cc-935ca9446a64/b.pdf")],
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
        "schema_version": "woek-state-current-source-register-1.0",
        "register_id": "BE-AGH-2026-CURRENT-SOURCE-REGISTER-V1",
        "base_main_commit": BASE_MAIN_COMMIT,
        "jurisdiction": "berlin",
        "election": "agh-2026-be",
        "source_as_of": "2026-08-21",
        "status": "CURRENT_SOURCE_CLASSIFICATION_COMPLETE_17_OF_17",
        "official_field": {
            "admitted_party_count": 17,
            "landesliste_count": 12,
            "berlinwide_bezirkslisten_count": 3,
            "selected_district_bezirkslisten_count": 2,
            "official_source_url": "https://www.berlin.de/wahlen/pressemitteilungen/2026/pressemitteilung.1697177.php",
            "official_source_date": "2026-07-24",
        },
        "coverage": {
            "classified_party_count": len(PARTIES),
            "final_election_programme_verified_count": final_count,
            "election_source_available_canonicalization_pending_count": pending_canonical,
            "final_election_programme_not_verified_count": unavailable,
            "source_available_for_election_corpus_count": sum(party["source_available_for_election_corpus"] for party in PARTIES),
            "full_17_final_election_programme_corpus_available": False,
            "assessment_maturity": "PARTIAL_ANALYSIS_NEEDS_COMPLETION",
        },
        "preserved_fach_review": {
            "path": "woek-parlament-app/data/states/berlin/approved-review-2026-08-18.md",
            "sha256": REVIEW_SHA256,
            "byte_length": 12016,
            "materiality_theme_count": 6,
            "rule": "Preserve and cross-link the six existing themes; source classification does not create or replace impact judgements.",
        },
        "source_pins": SOURCE_PINS,
        "parties": PARTIES,
        "publication_integrity": {
            "required_content_paths": ["/laender/berlin", "/laender/berlin/wahl"],
            "rendered_content_paths": ["/laender/berlin", "/laender/berlin/wahl"],
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
        raise ValueError("BERLIN_CURRENT_SOURCE_REGISTER_DRIFT: run with --write and inspect the diff")
    if descriptor_hash(actual) != actual["descriptor_sha256"]:
        raise ValueError("BERLIN_CURRENT_SOURCE_DESCRIPTOR_HASH_DRIFT")
    if sha256_bytes(REVIEW_PATH.read_bytes()) != REVIEW_SHA256 or REVIEW_PATH.stat().st_size != 12016:
        raise ValueError("BERLIN_PRESERVED_FACH_REVIEW_DRIFT")
    parties = actual["parties"]
    if len(parties) != 17 or len({party["party"] for party in parties}) != 17:
        raise ValueError("BERLIN_OFFICIAL_PARTY_SET_NOT_EXACTLY_17")
    if sum(party["field_scope"] == "LANDESLISTE" for party in parties) != 12:
        raise ValueError("BERLIN_LANDESLISTE_COUNT_DRIFT")
    if sum(party["final_election_programme_verified"] for party in parties) != 9:
        raise ValueError("BERLIN_VERIFIED_FINAL_PROGRAMME_COUNT_DRIFT")
    if sum(party["canonicalization_pending"] for party in parties) != 3:
        raise ValueError("BERLIN_CANONICALIZATION_PENDING_COUNT_DRIFT")
    if sum(not party["source_available_for_election_corpus"] for party in parties) != 5:
        raise ValueError("BERLIN_FINAL_PROGRAMME_NOT_VERIFIED_COUNT_DRIFT")
    if any(not row["url"].startswith("https://") for party in parties for row in party["source_urls"]):
        raise ValueError("BERLIN_NON_HTTPS_SOURCE_URL")
    if any(actual["constraints"].values()):
        raise ValueError("BERLIN_FORBIDDEN_SYNTHESIS_OR_DEPLOYMENT_RECORDED")
    integrity = actual["publication_integrity"]
    if integrity["required_content_paths"] != integrity["rendered_content_paths"] or integrity["unrendered_content_paths"]:
        raise ValueError("BERLIN_PUBLICATION_PATH_COVERAGE_DRIFT")
    if check_github:
        for pin in SOURCE_PINS:
            comment = github_comment(pin["comment_id"])
            if comment["updated_at"] != pin["updated_at"]:
                raise ValueError(f"BERLIN_GITHUB_COMMENT_UPDATED_AT_DRIFT:{pin['comment_id']}")
            if sha256_bytes(comment["body"].encode("utf-8")) != pin["body_sha256"]:
                raise ValueError(f"BERLIN_GITHUB_COMMENT_BODY_HASH_DRIFT:{pin['comment_id']}")


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
        raise ValueError("BERLIN_CURRENT_SOURCE_REGISTER_MISSING")
    actual = json.loads(REGISTER_PATH.read_text(encoding="utf-8"))
    validate(actual, expected, check_github=args.check_github)
    print(json.dumps({
        "gate": "BERLIN_CURRENT_SOURCE_COMPLETION",
        "status": "PASS_17_OF_17_CLASSIFIED",
        "official_party_count": 17,
        "verified_final_programmes": 9,
        "election_sources_pending_canonicalization": 3,
        "final_programmes_not_verified": 5,
        "full_17_final_election_programme_corpus_available": False,
        "preserved_materiality_themes": 6,
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
