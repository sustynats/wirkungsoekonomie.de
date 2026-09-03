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
REGISTER_PATH = ROOT / "woek-parlament-app/data/state-programmes/current-source-registers/berlin-2026-v2.json"
REVIEW_PATH = ROOT / "woek-parlament-app/data/states/berlin/approved-review-2026-08-18.md"
REPOSITORY = "sustynats/wirkungsoekonomie.de"
BASE_MAIN_COMMIT = "76e885da27574b1c1d8cd3cbcf6cf6083bceee63"
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
    canonical_artifact: dict | None = None,
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
        "AfD", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME_PDF",
        "PARTY_OFFICIAL_LANDESPROGRAMME_PDF_BYTE_EXACT",
        "Finales Landeswahlprogramm bytegenau verifiziert",
        "Die offizielle Berliner Bezirksseite bezeichnet und verlinkt die 99-seitige PDF als Landeswahlprogramm 2026. PDF-Cover, Wahlbezug, Byteumfang und SHA-256 sind eingefroren; das separate Bezirkswahlprogramm bleibt ein anderes Objekt.",
        [("Offizielle Wahlseite AfD Lichtenberg", "https://lichtenberg.afd.berlin/wahl-2026/"), ("Landeswahlprogramm-PDF", "https://lichtenberg.afd.berlin/wp-content/uploads/2026/07/AfD-WK-Berlin-Wahlprogramm-Webversion.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-AFD-LANDESWAHLPROGRAMM", "https://lichtenberg.afd.berlin/wp-content/uploads/2026/07/AfD-WK-Berlin-Wahlprogramm-Webversion.pdf",
            "application/pdf", 9161383, "949b0c7cc193801c48fa5c859cb0088fae6ed8cb304d47c91bd5eb441af6bd35",
            "Programm der AfD Berlin für die Wahlen am 20. September 2026",
            "Direct PDF linked as Landeswahlprogramm 2026 by the official AfD Berlin district page; cover names party, election and date.",
            "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME", page_count=99,
        ),
    ),
    entry(
        "BÜNDNIS 90/DIE GRÜNEN", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das beschlossene Berliner Wahlprogramm 2026 ist als parteioffizielle Programmquelle verfügbar.",
        [("Wahlprogramm", "https://gruene.berlin/wahlprogramm"), ("Wahlprogramm-PDF", "https://gruene.berlin/fileadmin/BE/lv_berlin/files/Wahlprogramm_2026_Online.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-GRUENE-WAHLPROGRAMM", "https://gruene.berlin/fileadmin/BE/lv_berlin/files/Wahlprogramm_2026_Online.pdf",
            "application/pdf", 2212991, "db07990ef613bf239691980873dbfaff3df98e07e8a27c5e05edc2363d9dade2",
            "Politik ändern. Berlin bleiben. Wahlprogramm zur Abgeordnetenhauswahl 2026",
            "Direct full-programme PDF linked by the official Berlin party programme page; cover identifies election and party.",
            "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME", page_count=256,
        ),
    ),
    entry(
        "BSW", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME_PDF",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_PDF",
        "Finales Wahlprogramm verifiziert",
        "Das am 25. April 2026 verabschiedete 66-seitige Landeswahlprogramm liegt als parteioffizielle PDF vor.",
        [("Programmseite", "https://bsw.berlin/allgemein/entwurf-des-landeswahlprogramms-des-berliner-bsw/"), ("Programm-PDF", "https://bsw.berlin/wp-content/uploads/Wahlprogramm-BSW-Berlin-AGH-Wahl-2026.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-BSW-WAHLPROGRAMM", "https://bsw.berlin/wp-content/uploads/Wahlprogramm-BSW-Berlin-AGH-Wahl-2026.pdf",
            "application/pdf", 757572, "fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675",
            "Berlin – Mit uns endlich vernünftig und gerecht",
            "Direct 66-page PDF linked by the official party page documenting adoption on 25 April 2026.",
            "PARTY_APPROVED_FINAL_ELECTION_PROGRAMME", page_count=66,
        ),
    ),
    entry(
        "DKP", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME_PDF",
        "PARTY_OFFICIAL_AGH_PROGRAMME_PDF_BYTE_EXACT",
        "Finales Wahlprogramm bytegenau verifiziert",
        "Die parteioffizielle Wahlseite verlinkt die achtseitige PDF ausdrücklich als Wahlprogramm zur AGH-Wahl. Titel, Dateiidentität, Byteumfang und SHA-256 sind eingefroren.",
        [("Offizielle Wahlseite", "https://trep-koep.dkp.de/berliner-wahlen-2026/"), ("Wahlprogramm-PDF", "https://berlin.dkp.de/wp-content/uploads/sites/83/2026/04/Wahlprogramm.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-DKP-WAHLPROGRAMM", "https://berlin.dkp.de/wp-content/uploads/sites/83/2026/04/Wahlprogramm.pdf",
            "application/pdf", 1911023, "dbc90c37b7280b700e8a2bb744f92b17483d865fe2d4e76f37e6c8b79ff09911",
            "Wahlprogramm zur Berliner Abgeordnetenhauswahl 2026",
            "Direct PDF linked as Wahlprogramm zur AGH-Wahl by the official DKP election page; cover identifies election and party state association.",
            "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME", page_count=8,
        ),
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
        [("Wahlprogramm", "https://www.fdp-berlin.de/wahlprogramm"), ("Wahlprogramm-PDF", "https://www.fdp-berlin.de/sites/default/files/2026-07/Wahlprogramm_FDP%20Berlin_Abgeordnetenhauswahl%202026_FINAL.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-FDP-WAHLPROGRAMM", "https://www.fdp-berlin.de/sites/default/files/2026-07/Wahlprogramm_FDP%20Berlin_Abgeordnetenhauswahl%202026_FINAL.pdf",
            "application/pdf", 1208209, "3e3e1f5cac99864937d79e4d7c9c0bda4a03a71868ba1f25d8bf918766223f32",
            "Berlin geht besser. Das Wahlprogramm zur Abgeordnetenhauswahl 2026",
            "Direct full-programme PDF linked by the official party programme page; filename and cover identify the final election version.",
            "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME", page_count=121,
        ),
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
        [("Parteiwebsite Berlin", "https://die-partei-berlin.de/"), ("Wahlprogramm 2026", "https://die-partei-berlin.de/archiv/7778")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-DIE-PARTEI-WAHLPROGRAMM", "https://die-partei-berlin.de/archiv/7778",
            "text/html; charset=UTF-8", 62936, "41e75b0d3cb617f85fff789a3aca217c1a68e761134fecdc44b56d64887d32b8",
            "Unser Wahlprogramm zur AGH Wahl 2026",
            "Official party article published 22 June 2026 and modified 19 August 2026; raw response bytes freeze the current ten-point programme page.",
            "PARTY_PUBLISHED_CURRENT_ELECTION_PROGRAMME", page_count=None,
        ),
    ),
    entry(
        "Tierschutzpartei", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME_PDF",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_PDF",
        "Finales Wahlprogramm verifiziert",
        "Das am 14. März 2026 beschlossene Berliner Landeswahlprogramm liegt als parteioffizielle Vollfassung vor.",
        [("Wahlseite", "https://berlin.tierschutzpartei.de/berliner-wahlen-2026"), ("Programm-PDF", "https://berlin.tierschutzpartei.de/wahlprogramm-berlin-2026.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-TIERSCHUTZPARTEI-WAHLPROGRAMM", "https://berlin.tierschutzpartei.de/wahlprogramm-berlin-2026.pdf",
            "application/pdf", 5583527, "1db89d9811e0d546c269c6ad6819603e12841b0d3f7f20f976444858d86cf172",
            "Wähle Mitgefühl! Wahlprogramm Berlin-Wahl 2026",
            "Direct full-programme PDF linked by the official election page; the party documents adoption on 14 March 2026.",
            "PARTY_APPROVED_FINAL_ELECTION_PROGRAMME", page_count=96,
        ),
    ),
    entry(
        "SGP", "LANDESLISTE", "FINAL_ELECTION_MANIFEST_PDF",
        "PARTY_OFFICIAL_GERMAN_ELECTION_MANIFEST_PDF_BYTE_EXACT",
        "Deutsche Wahlerklärung bytegenau verifiziert",
        "Die offizielle SGP-Parteiseite verlinkt die deutschsprachige Wahlerklärung vom 10. Juli 2026. Die vierseitige PDF nennt Partei, Berlinwahl und Datum; URL, Byteumfang und SHA-256 sind eingefroren.",
        [("Offizielle SGP-Wahlseite", "https://www.gleichheit.de/home.html"), ("Deutsche Wahlerklärung", "https://www.wsws.org/de/articles/2026/07/10/sgpb-j10.html"), ("Manifest-PDF", "https://www.wsws.org/de/articles/2026/07/10/sgpb-j10.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-SGP-WAHLERKLAERUNG", "https://www.wsws.org/de/articles/2026/07/10/sgpb-j10.pdf",
            "application/pdf", 33938, "69851181a6d105a1ee3c5decddd6a4bc00922a61f3d363a2b8a0dc6cd464e2a2",
            "Berlinwahl 2026: Sozialismus statt Krieg",
            "The official SGP site labels and links the German declaration; the PDF names Sozialistische Gleichheitspartei and 10 July 2026.",
            "PARTY_PUBLISHED_FINAL_ELECTION_MANIFEST", page_count=4,
        ),
    ),
    entry(
        "Volt", "LANDESLISTE", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das Berliner Programm 2026 ist als parteioffizielle Programmquelle verfügbar.",
        [("Programm Berlin 2026", "https://voltdeutschland.org/berlin/programm/programme/programm-berlin-2026"), ("Wahlprogramm-PDF", "https://voltdeutschland.org/storage/assets-berlin/pdf/policy-wahlprogramm-2026/wahlprogramm-(last_edited_5-8-2026).pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-VOLT-WAHLPROGRAMM", "https://voltdeutschland.org/storage/assets-berlin/pdf/policy-wahlprogramm-2026/wahlprogramm-(last_edited_5-8-2026).pdf",
            "application/pdf", 1041663, "515828c1e965b0ade7025941386a3c6a31a3e91c4fe54b4c0b47b39a4c2c3fb1",
            "Programm zur Wahl des Berliner Abgeordnetenhauses – Wahlprogramm Berlin 2026",
            "Newest dated full-programme PDF linked by the official Berlin 2026 programme page; retained separately from the older 20 July file.",
            "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME", page_count=113,
        ),
    ),
    entry(
        "SPD", "BERLINWEITE_BEZIRKSLISTEN", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das am 8./9. Mai 2026 final beschlossene Berliner Wahlprogramm ist als parteioffizielle Programmquelle verfügbar.",
        [("Wahlprogramm", "https://spd.berlin/wahlprogramm/"), ("Wahlprogramm-PDF", "https://spd.berlin/media/2026/08/SPD_Berlin_Wahlprogramm_20260521-v4-1.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-SPD-WAHLPROGRAMM", "https://spd.berlin/media/2026/08/SPD_Berlin_Wahlprogramm_20260521-v4-1.pdf",
            "application/pdf", 663059, "379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9",
            "Wahlprogramm Abgeordnetenhauswahl 2026",
            "Direct v4.1 PDF linked by the official programme page after the documented 8/9 May 2026 final adoption.",
            "PARTY_APPROVED_FINAL_ELECTION_PROGRAMME", page_count=66,
        ),
    ),
    entry(
        "CDU", "BERLINWEITE_BEZIRKSLISTEN", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das am 9. Juni 2026 beschlossene Regierungsprogramm 2026–2031 ist als parteioffizielle Programmquelle verfügbar.",
        [("Regierungsprogramm", "https://cdu.berlin/wofuer-wir-stehen"), ("Regierungsprogramm-PDF", "https://cdu.berlin/download?dokument=1&file=366")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-CDU-REGIERUNGSPROGRAMM", "https://cdu.berlin/download?dokument=1&file=366",
            "application/pdf", 1546182, "ff27b8efafc426669f76ef71576a7cbce52bdb95fbb0cc2931afa7e11bbed455",
            "Berlin wird. Regierungsprogramm 2026–2031",
            "Official download record names file 366 and documents the 50th state party conference decision of 9 June 2026.",
            "PARTY_APPROVED_FINAL_ELECTION_PROGRAMME", page_count=128,
        ),
    ),
    entry(
        "Die Linke", "BERLINWEITE_BEZIRKSLISTEN", "FINAL_ELECTION_PROGRAMME",
        "FINAL_PARTY_APPROVED_PROGRAMME_PARTY_OFFICIAL_SOURCE",
        "Finales Wahlprogramm verifiziert",
        "Das Berliner Wahlprogramm 2026 ist als parteioffizielle Programmquelle verfügbar.",
        [("Wahlprogramm", "https://dielinke.berlin/wahlprogramm/"), ("Wahlprogramm-PDF", "https://dielinke.berlin/fileadmin/download/2026/Wahlprogramm_AGH_2026_Die_Linke_Berlin.pdf")],
        final_verified=True, source_available=True, canonicalization_pending=False,
        canonical_artifact=artifact(
            "BE-AGH-2026-LINKE-WAHLPROGRAMM", "https://dielinke.berlin/fileadmin/download/2026/Wahlprogramm_AGH_2026_Die_Linke_Berlin.pdf",
            "application/pdf", 2556826, "70be401125217cac46a94d3b0b97b49bd332774342e54fb22a202043bd099c1f",
            "Berlin bezahlbar machen – Wahlprogramm zur Abgeordnetenhauswahl 2026",
            "Direct full-programme PDF linked by the official Berlin party programme page.",
            "PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME", page_count=336,
        ),
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
    canonical_artifacts = [party["canonical_artifact"] for party in PARTIES if party["canonical_artifact"]]
    payload = {
        "schema_version": "woek-state-current-source-register-1.2",
        "register_id": "BE-AGH-2026-CURRENT-SOURCE-REGISTER-V2",
        "base_main_commit": BASE_MAIN_COMMIT,
        "jurisdiction": "berlin",
        "election": "agh-2026-be",
        "source_as_of": "2026-08-24",
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
            "canonical_artifact_count": len(canonical_artifacts),
            "byte_exact_current_available_final_programme_set_count": final_count,
            "canonicalization_completed_in_v2_count": 3,
            "full_final_election_programme_corpus_available": False,
            "assessment_maturity": "PARTIAL_ANALYSIS_NEEDS_COMPLETION",
        },
        "current_available_final_programme_set": [
            {
                "party": party["party"],
                "artifact_id": party["canonical_artifact"]["artifact_id"],
                "sha256": party["canonical_artifact"]["sha256"],
            }
            for party in PARTIES
            if party["final_election_programme_verified"]
        ],
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
    if sum(party["final_election_programme_verified"] for party in parties) != 12:
        raise ValueError("BERLIN_VERIFIED_FINAL_PROGRAMME_COUNT_DRIFT")
    if sum(party["canonicalization_pending"] for party in parties) != 0:
        raise ValueError("BERLIN_CANONICALIZATION_PENDING_COUNT_DRIFT")
    if sum(not party["source_available_for_election_corpus"] for party in parties) != 5:
        raise ValueError("BERLIN_FINAL_PROGRAMME_NOT_VERIFIED_COUNT_DRIFT")
    if any(not row["url"].startswith("https://") for party in parties for row in party["source_urls"]):
        raise ValueError("BERLIN_NON_HTTPS_SOURCE_URL")
    final_parties = [party for party in parties if party["final_election_programme_verified"]]
    artifacts = [party["canonical_artifact"] for party in final_parties]
    if len(artifacts) != 12 or any(artifact is None for artifact in artifacts):
        raise ValueError("BERLIN_FINAL_PROGRAMME_NOT_BYTE_EXACT")
    if any(party["canonical_artifact"] is not None for party in parties if not party["final_election_programme_verified"]):
        raise ValueError("BERLIN_NON_FINAL_SOURCE_HAS_CANONICAL_FINAL_ARTIFACT")
    if len({artifact["artifact_id"] for artifact in artifacts}) != 12 or len({artifact["sha256"] for artifact in artifacts}) != 12:
        raise ValueError("BERLIN_CANONICAL_ARTIFACT_IDENTITY_NOT_UNIQUE")
    if any(len(artifact["sha256"]) != 64 or artifact["byte_length"] <= 0 for artifact in artifacts):
        raise ValueError("BERLIN_CANONICAL_ARTIFACT_HASH_OR_LENGTH_INVALID")
    if any(artifact["identity_status"] != "BYTE_EXACT_PARTY_PRIMARY_ARTIFACT" for artifact in artifacts):
        raise ValueError("BERLIN_CANONICAL_ARTIFACT_IDENTITY_STATUS_DRIFT")
    frozen_set = actual["current_available_final_programme_set"]
    if [row["party"] for row in frozen_set] != [party["party"] for party in final_parties]:
        raise ValueError("BERLIN_CURRENT_AVAILABLE_FINAL_SET_DRIFT")
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
        "verified_final_programmes": 12,
        "election_sources_pending_canonicalization": 0,
        "byte_exact_canonical_artifacts": 12,
        "final_programmes_not_verified": 5,
        "full_final_election_programme_corpus_available": False,
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
