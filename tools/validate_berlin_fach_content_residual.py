#!/usr/bin/env python3
"""Materialize and validate the finite Berlin 2026 Fach residual.

This is an inventory gate. It reuses only explicit WÖk Fach handoffs and
marks every other exact source page/atom fail-closed. It never derives an
impact direction, evidence grade, DNS mapping, recommendation, score, or
party-wide judgement from programme text or metadata.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import urllib.request
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MATRIX_PATH = ROOT / "woek-parlament-app/data/state-programmes/fach-content-residuals/berlin-2026-v1.json"
SOURCE_REGISTER_PATH = ROOT / "woek-parlament-app/data/state-programmes/current-source-registers/berlin-2026-v2.json"
THEME_REVIEW_PATH = ROOT / "woek-parlament-app/data/states/berlin/approved-review-2026-08-18.md"
REPOSITORY = "sustynats/wirkungsoekonomie.de"
BASE_MAIN_COMMIT = "03176878969f3af44a5169fd141c4bf98a0f7061"
SOURCE_REGISTER_SHA256 = "29f088e153613129cedaba91f4e6eb2da0f9554f8a0961a065a849328eadc36c"
THEME_REVIEW_SHA256 = "6a7c7eb890b57f7b2d5b3ce0d461468d79febb7397e2930a28217f42374ed9f2"

EXPLICIT = "EXPLICIT_FACH_REUSED"
NOT_ASSESSABLE = "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON"
GENUINE = "GENUINE_FACH_REVIEW_REQUIRED"
ALLOWED_STATUSES = {EXPLICIT, NOT_ASSESSABLE, GENUINE}

PARTY_ORDER = [
    "AfD",
    "BÜNDNIS 90/DIE GRÜNEN",
    "BSW",
    "DKP",
    "FDP",
    "Die PARTEI",
    "Tierschutzpartei",
    "SGP",
    "Volt",
    "SPD",
    "CDU",
    "Die Linke",
]

COMMENT_PINS = [
    (5367584560, "2026-08-21T08:39:54Z", "c061b873efbe5a8217a05f2dc9df90466ff1444b1707f1ffeccbd481d702efba", "Berlin source field and six-theme scope boundary"),
    (5367999804, "2026-08-21T09:20:02Z", "ec361372c8a96c2594b690cad0d3e5de58c31080018858d141cd1f48422e5766", "BSW housing seven-cluster Fach review"),
    (5368010997, "2026-08-21T09:21:05Z", "b2a2d4b84335294b51104a7b0cc3a252f31ac2be54f323eacab6c124f8608055", "BSW housing 23-atom source register and nine detail-depth gaps"),
    (5374672840, "2026-08-21T19:55:47Z", "491050279986ddc34df19b90f81a946bb7c5d33104330dd7406b4523f6941ddd", "Berlin final-programme source maturity guard"),
    (5392204002, "2026-08-24T07:47:46Z", "ed4af9df201f40d4aad94e6c38624ea7e775ae9066b92a5a70ccad3eb34b8cf6", "BE-FACH-CONTENT-RESIDUAL execution contract"),
    (5392797586, "2026-08-24T08:45:57Z", "7379deceda14178c79e3cb6fcec3b70b726ec781ecf1e83e2fc1341e80b00e43", "Die PARTEI 22-record atomic terminal review"),
    (5392816233, "2026-08-24T08:47:50Z", "985da40033e27042089f92c405f538213a86b89ad60aeeffe44e2ccfa8903694", "SGP earlier versioned record handoff"),
    (5394097186, "2026-08-24T10:42:26Z", "486855fd8bcc9d8061b75e31986ba90552e0dd64940047208af1dd1ca9bc5905", "DKP earlier 22-record parent handoff"),
    (5396796272, "2026-08-24T14:38:53Z", "39d2be80da4fd756172424c66e20204b22a09dabf51234d0bc68887f64e41a82", "DKP latest 34-record full-programme review"),
    (5396814341, "2026-08-24T14:40:18Z", "05a4b204c1f34d4d6650b02f417d55d7ce3c76ccaf75da1673ba46b4758f1ea5", "SGP latest 12-record full-manifest review"),
    (5396842873, "2026-08-24T14:42:39Z", "665cdac351b077c4b9e7911b278e1effb721ae7de06d726008b7a7386ea52877", "Die PARTEI latest ten-point terminal confirmation"),
    (5396848271, "2026-08-24T14:43:04Z", "b4ac6b67e8ba4a5b2109dbdd2d2ed1068c8ece2c6c072e5920e8a6fd346cd157", "Issue 241 latest residual: three terminal, nine open"),
]

THEME_STOCK = [
    {
        "record_id": "BE-IMPACT-2026-01",
        "title": "Social-Media-Mindestalter / digitaler Jugendschutz",
        "source_locators": [
            "https://spd.berlin/pressemitteilung/krach-und-koenig-befuerworten-mindestalter-fuer-die-nutzung-von-sozialen-medien/",
            "https://parteitag.spd.berlin/2026/04/konsensliste-2/",
            "https://parteitag.spd.berlin/cvtx_antrag/keine-social-media-bans-fuer-minderjaehrige-jugend-schuetzen-big-tech-regulieren/",
            "https://gruene.berlin/beschluesse/unser-wahlprogramm-kapitel-4_3766",
            "https://www.fdp-berlin.de/beschluss/wahlprogramm-zur-abgeordnetenhauswahl-2026",
        ],
    },
    {
        "record_id": "BE-IMPACT-2026-02",
        "title": "Wohnen, Mieten und landeseigene Wohnungsunternehmen",
        "source_locators": [
            "https://spd.berlin/wahlprogramm/",
            "https://gruene.berlin/beschluesse/unser-wahlprogramm-kapitel-2_3764",
            "https://dielinke.berlin/wahlprogramm/",
            "https://www.fdp-berlin.de/beschluss/wahlprogramm-zur-abgeordnetenhauswahl-2026",
        ],
    },
    {
        "record_id": "BE-IMPACT-2026-03",
        "title": "Verwaltungsmodernisierung, Bezirke und Genehmigungsfiktion",
        "source_locators": [
            "https://www.fdp-berlin.de/beschluss/wahlprogramm-zur-abgeordnetenhauswahl-2026",
            "https://voltdeutschland.org/berlin/programm/programme/programm-berlin-2026",
        ],
    },
    {
        "record_id": "BE-IMPACT-2026-04",
        "title": "Klima-, Hitze-, Wasser- und Stadtresilienz",
        "source_locators": ["https://gruene.berlin/beschluesse/unser-wahlprogramm-1_3763"],
    },
    {
        "record_id": "BE-IMPACT-2026-05",
        "title": "Migration, Einbürgerung, Unterbringung und Rückführung",
        "source_locators": [
            "https://www.fdp-berlin.de/beschluss/wahlprogramm-zur-abgeordnetenhauswahl-2026",
            "https://dielinke.berlin/wahlprogramm/19-einwanderungsgesellschaft-und-teilhabe/",
            "https://gruene.berlin/beschluesse/unser-wahlprogramm-kapitel-4_3766",
        ],
    },
    {
        "record_id": "BE-IMPACT-2026-06",
        "title": "Demokratie, Kinder-/Jugendbeteiligung und institutionelle Korrekturfähigkeit",
        "source_locators": [
            "https://gruene.berlin/beschluesse/unser-wahlprogramm-kapitel-4_3766",
            "https://www.fdp-berlin.de/beschluss/wahlprogramm-zur-abgeordnetenhauswahl-2026",
        ],
    },
]

BSW_LOCATORS = {
    1: "PDF page 6", 2: "PDF page 6", 3: "PDF page 6", 4: "PDF page 6",
    5: "PDF pages 6-7", 6: "PDF page 7", 7: "PDF page 7", 8: "PDF page 7",
    9: "PDF page 7", 10: "PDF page 7", 11: "PDF page 7", 12: "PDF page 7",
    13: "PDF page 7", 14: "PDF page 7", 15: "PDF page 8", 16: "PDF page 8",
    17: "PDF page 8", 18: "PDF page 8", 19: "PDF page 8", 20: "PDF page 8",
    21: "PDF page 8", 22: "PDF page 8", 23: "PDF page 8",
}
BSW_EXPLICIT = {1, 2, *range(5, 14), 17, 19, 21}
BSW_GENUINE_REASONS = {
    3: "separater Federal-Dependency-Subpfad",
    4: "tenant-access/rechtszugang Subpfad",
    14: "BE-BSW26-WOHN-004 / legal-design subreview nötig",
    15: "stock-preservation subpath",
    16: "modernization subpath; exact legal design needed",
    18: "federal-civil-law dependency / separate design review",
    20: "BE-BSW26-WOHN-005, eigene Schwellen-/Rechtsprüfung",
    22: "distribution/rights-design subreview erforderlich",
    23: "gemeinwohlorientierter Bestand subpath",
}

DKP_EXPLICIT = {1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 18, 19, 22, 23, 25, 26, 27, 29, 30, 32, 33, 34}
SGP_EXPLICIT = {7}
PARTEI_EXPLICIT = {1, 4, 5, 10, 13, 14, 16, 17, 18, 19, 21}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def issue_comment_url(comment_id: int) -> str:
    return f"https://github.com/{REPOSITORY}/issues/240#issuecomment-{comment_id}"


def page_unit(artifact_id: str, page: int, page_count: int) -> dict:
    return {
        "object_id": f"{artifact_id}:PDF_PAGE_{page:03d}",
        "object_kind": "UNSEGMENTED_PDF_PAGE_REVIEW_SCOPE",
        "source_locator": f"PDF page {page} of {page_count}",
        "status": GENUINE,
        "exact_reason": (
            "No exhaustive source-bound atomic Fach ledger exists for this frozen page in issue #240, "
            "the canonical six-theme stock, or merged Berlin work; the six-theme review explicitly "
            "disclaims full-programme completeness. Fach must first classify the page's source units "
            "as effect-bearing or non-effect context and review every effect-bearing unit."
        ),
    }


def active_record(
    record_id: str,
    source_locator: str,
    status: str,
    comment_id: int,
    *,
    exact_reason: str | None = None,
) -> dict:
    record = {
        "object_id": record_id,
        "object_kind": "SOURCE_BOUND_FACH_ATOM",
        "source_locator": source_locator,
        "status": status,
        "verbatim_fach_source": issue_comment_url(comment_id),
        "verbatim_fach_locator": f"issue #240 comment {comment_id}, record `{record_id}`",
    }
    if status == NOT_ASSESSABLE:
        record["exact_reason_source"] = record["verbatim_fach_locator"]
    if exact_reason is not None:
        record["exact_reason"] = exact_reason
    return record


def dkp_locator(record_number: int) -> str:
    if record_number <= 11:
        return "PDF pages 2-3"
    if record_number <= 17:
        return "PDF pages 3-4"
    if record_number <= 21:
        return "PDF page 4"
    if record_number <= 27:
        return "PDF pages 4-5"
    if record_number <= 30:
        return "PDF pages 5-6"
    return "PDF pages 6-7"


def partei_locator(record_number: int) -> str:
    if record_number <= 2:
        point = 1
    elif record_number == 3:
        point = 2
    elif record_number <= 6:
        point = 3
    elif record_number <= 8:
        point = 4
    elif record_number <= 11:
        point = 5
    elif record_number == 12:
        point = 6
    elif record_number == 13:
        point = 7
    elif record_number <= 18:
        point = 8
    elif record_number <= 20:
        point = 9
    else:
        point = 10
    return f"HTML numbered programme point {point} of 10"


def bsw_records() -> list[dict]:
    result = []
    for number in range(1, 24):
        record_id = f"BE-BSW-WOHN-{number:03d}"
        if number in BSW_EXPLICIT:
            result.append(active_record(record_id, BSW_LOCATORS[number], EXPLICIT, 5368010997))
        else:
            result.append(
                active_record(
                    record_id,
                    BSW_LOCATORS[number],
                    GENUINE,
                    5368010997,
                    exact_reason=BSW_GENUINE_REASONS[number],
                )
            )
    return result


def dkp_records() -> list[dict]:
    return [
        active_record(
            f"BE-DKP-2026-{number:03d}",
            dkp_locator(number),
            EXPLICIT if number in DKP_EXPLICIT else NOT_ASSESSABLE,
            5396796272,
        )
        for number in range(1, 35)
    ]


def sgp_records() -> list[dict]:
    return [
        active_record(
            f"BE-SGP-2026-{number:03d}",
            "PDF pages 1-4",
            EXPLICIT if number in SGP_EXPLICIT else NOT_ASSESSABLE,
            5396814341,
        )
        for number in range(1, 13)
    ]


def partei_records() -> list[dict]:
    return [
        active_record(
            f"BE-PARTEI-2026-{number:03d}",
            partei_locator(number),
            EXPLICIT if number in PARTEI_EXPLICIT else NOT_ASSESSABLE,
            5392797586,
        )
        for number in range(1, 23)
    ]


def programme_entry(source_entry: dict) -> dict:
    party = source_entry["party"]
    artifact = source_entry["canonical_artifact"]
    page_count = artifact["page_count"]
    common = {
        "party": party,
        "artifact": artifact,
        "source_register_status": source_entry["source_status"],
        "final_election_programme_verified": source_entry["final_election_programme_verified"],
    }

    if party == "DKP":
        records = dkp_records()
        return common | {
            "analysis_state": "PROGRAMME_ANALYSIS_COMPLETE",
            "programme_analysis_complete": True,
            "coverage_proof": {
                "source_range": "PDF pages 1-8",
                "primary_handoff": issue_comment_url(5396796272),
                "terminal_assertions": [
                    "BE_DKP_2026_PRIMARY_SOURCE_PARITY = PASS_FULL_PROGRAMME",
                    "BE_DKP_2026_FACH_COMPLETE = PASS_FULL_PROGRAMME",
                    "BE_DKP_2026_EFFECT_OBJECTS = 34_SOURCE_BOUND_RECORDS_WITH_EXPLICIT_NONCOUNTING_CONTEXT",
                ],
            },
            "active_source_objects": records,
            "genuine_residual_ranges": [],
        }
    if party == "SGP":
        records = sgp_records()
        return common | {
            "analysis_state": "PROGRAMME_ANALYSIS_COMPLETE",
            "programme_analysis_complete": True,
            "coverage_proof": {
                "source_range": "PDF pages 1-4",
                "primary_handoff": issue_comment_url(5396814341),
                "terminal_assertions": [
                    "BE_SGP_2026_PRIMARY_SOURCE_PARITY = PASS_FULL_MANIFEST",
                    "BE_SGP_2026_FACH_COMPLETE = PASS_FULL_MANIFEST",
                    "BE_SGP_2026_EFFECT_AND_CONTEXT_OBJECTS = 12_EXPLICITLY_CLASSIFIED",
                ],
            },
            "active_source_objects": records,
            "genuine_residual_ranges": [],
        }
    if party == "Die PARTEI":
        records = partei_records()
        return common | {
            "analysis_state": "PROGRAMME_ANALYSIS_COMPLETE",
            "programme_analysis_complete": True,
            "coverage_proof": {
                "source_range": "HTML numbered programme points 1-10",
                "atomic_handoff": issue_comment_url(5392797586),
                "terminal_confirmation": issue_comment_url(5396842873),
                "terminal_assertions": [
                    "BE_DIE_PARTEI_2026_PRIMARY_SOURCE_PARITY = PASS_FULL_10_POINT_PROGRAMME",
                    "BE_DIE_PARTEI_2026_FACH_COMPLETE = PASS_FULL_PROGRAMME_WITH_SATIRE_ASSESSABILITY_GUARD",
                ],
            },
            "active_source_objects": records,
            "genuine_residual_ranges": [],
        }
    if party == "BSW":
        page_units = [page_unit(artifact["artifact_id"], page, page_count) for page in [*range(1, 6), *range(9, 67)]]
        records = bsw_records()
        return common | {
            "analysis_state": "PARTIAL_EXPLICIT_FACH_WITH_GENUINE_RESIDUAL",
            "programme_analysis_complete": False,
            "partial_coverage_proof": {
                "source_range": "PDF pages 6-8, housing cluster only",
                "cluster_review": issue_comment_url(5367999804),
                "atomic_register": issue_comment_url(5368010997),
                "explicit_cluster_review_ids": [f"BE-BSW26-WOHN-{number:03d}" for number in range(1, 8)],
            },
            "active_source_objects": [*records, *page_units],
            "genuine_residual_ranges": [
                {"source_range": "PDF pages 1-5", "object_count": 5, "status": GENUINE},
                {"source_range": "PDF pages 9-66", "object_count": 58, "status": GENUINE},
                {
                    "source_range": "PDF pages 6-8",
                    "object_ids": [f"BE-BSW-WOHN-{number:03d}" for number in sorted(BSW_GENUINE_REASONS)],
                    "object_count": 9,
                    "status": GENUINE,
                },
            ],
        }

    require(isinstance(page_count, int), f"UNREVIEWED_NON_PDF_ARTIFACT:{party}")
    page_units = [page_unit(artifact["artifact_id"], page, page_count) for page in range(1, page_count + 1)]
    return common | {
        "analysis_state": GENUINE,
        "programme_analysis_complete": False,
        "active_source_objects": page_units,
        "genuine_residual_ranges": [
            {"source_range": f"PDF pages 1-{page_count}", "object_count": page_count, "status": GENUINE}
        ],
    }


def build_matrix() -> dict:
    register = load(SOURCE_REGISTER_PATH)
    final_entries = {
        item["party"]: item
        for item in register["parties"]
        if item["final_election_programme_verified"]
    }
    require(list(final_entries) == PARTY_ORDER, "BERLIN_FINAL_PROGRAMME_ORDER_DRIFT")
    programmes = [programme_entry(final_entries[party]) for party in PARTY_ORDER]
    all_objects = [record for programme in programmes for record in programme["active_source_objects"]]
    counts = Counter(record["status"] for record in all_objects)
    terminal = [item["party"] for item in programmes if item["programme_analysis_complete"]]
    open_programmes = [item["party"] for item in programmes if not item["programme_analysis_complete"]]
    genuine = [record for record in all_objects if record["status"] == GENUINE]

    matrix = {
        "schema_version": "woek-berlin-fach-content-residual-1.0",
        "matrix_id": "BE-FACH-CONTENT-RESIDUAL-2026-V1",
        "base_main_commit": BASE_MAIN_COMMIT,
        "jurisdiction": "DE-BE",
        "election": "agh-2026-be",
        "issue": 240,
        "source_as_of": "2026-08-24T14:43:04Z",
        "status": "FINITE_RESIDUAL_MATERIALIZED_3_OF_12_PROGRAMMES_TERMINAL",
        "status_taxonomy": [EXPLICIT, NOT_ASSESSABLE, GENUINE],
        "release_policy": {
            "github_first": True,
            "no_new_vercel_build": True,
            "vercel_preview": False,
            "vercel_build": False,
            "vercel_deployment": False,
        },
        "constraints": {
            "impact_direction_synthesized": False,
            "evidence_level_synthesized": False,
            "problem_review_synthesized": False,
            "goal_review_synthesized": False,
            "dns_mapping_synthesized": False,
            "recommendation_synthesized": False,
            "party_score_synthesized": False,
            "party_wide_judgement_synthesized": False,
        },
        "source_pins": [
            {
                "issue": 240 if comment_id != 5396848271 else 241,
                "comment_id": comment_id,
                "updated_at": updated_at,
                "body_sha256": body_sha256,
                "url": (
                    issue_comment_url(comment_id)
                    if comment_id != 5396848271
                    else f"https://github.com/{REPOSITORY}/issues/241#issuecomment-{comment_id}"
                ),
                "role": role,
            }
            for comment_id, updated_at, body_sha256, role in COMMENT_PINS
        ],
        "canonical_stock": {
            "current_source_register": {
                "path": str(SOURCE_REGISTER_PATH.relative_to(ROOT)),
                "sha256": SOURCE_REGISTER_SHA256,
                "verified_final_programmes": 12,
            },
            "six_theme_review": {
                "path": str(THEME_REVIEW_PATH.relative_to(ROOT)),
                "sha256": THEME_REVIEW_SHA256,
                "explicit_scope_boundary": "Initial materiality review; no claim of completeness for every programme commitment.",
                "records": [
                    item | {
                        "status": EXPLICIT,
                        "coverage_credit": "THEME_LEVEL_ONLY_NO_FULL_PROGRAMME_OR_PAGE_CREDIT",
                        "verbatim_fach_source": str(THEME_REVIEW_PATH.relative_to(ROOT)),
                    }
                    for item in THEME_STOCK
                ],
            },
            "merged_berlin_atomic_programme_records": 0,
            "issue_240_active_record_sets": {
                "BSW": {"comment_id": 5368010997, "record_ids": [f"BE-BSW-WOHN-{number:03d}" for number in range(1, 24)]},
                "DKP": {"comment_id": 5396796272, "record_ids": [f"BE-DKP-2026-{number:03d}" for number in range(1, 35)]},
                "SGP": {"comment_id": 5396814341, "record_ids": [f"BE-SGP-2026-{number:03d}" for number in range(1, 13)]},
                "Die PARTEI": {"comment_id": 5392797586, "record_ids": [f"BE-PARTEI-2026-{number:03d}" for number in range(1, 23)]},
            },
            "versioned_prior_record_sets_retained_without_double_counting": [
                {
                    "party": "DKP",
                    "comment_id": 5394097186,
                    "record_ids": [f"BE-DKP-2026-F{number:02d}" for number in range(1, 23)],
                    "relationship": "EARLIER_PARENT_REGISTER; latest 34-record set is active for current coverage cardinality",
                },
                {
                    "party": "SGP",
                    "comment_id": 5392816233,
                    "record_ids": [
                        "BE-SGP-2026-001A", "BE-SGP-2026-001B", "BE-SGP-2026-001C",
                        *[f"BE-SGP-2026-{number:03d}" for number in range(2, 14)],
                    ],
                    "declared_terminal_records": 13,
                    "enumerated_record_ids": 15,
                    "relationship": "EARLIER_VERSIONED_HANDOFF_WITH_DECLARED_ENUMERATION_MISMATCH; latest 12-record set is active",
                },
            ],
        },
        "coverage_summary": {
            "verified_final_programmes": 12,
            "programme_analysis_complete": 3,
            "programme_analysis_complete_parties": terminal,
            "genuine_fach_programmes": 9,
            "genuine_fach_programme_parties": open_programmes,
            "active_source_objects": len(all_objects),
            "status_counts": dict(sorted(counts.items())),
            "genuine_fach_review_required_objects": len(genuine),
            "genuine_unsegmented_pdf_pages": sum(1 for item in genuine if item["object_kind"] == "UNSEGMENTED_PDF_PAGE_REVIEW_SCOPE"),
            "genuine_source_bound_atoms": sum(1 for item in genuine if item["object_kind"] == "SOURCE_BOUND_FACH_ATOM"),
        },
        "programmes": programmes,
    }
    descriptor = json.dumps(matrix, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    matrix["descriptor_sha256"] = sha256_bytes(descriptor)
    return matrix


def fetch_comment(comment_id: int, token: str | None) -> dict:
    request = urllib.request.Request(
        f"https://api.github.com/repos/{REPOSITORY}/issues/comments/{comment_id}",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "woek-berlin-fach-residual-validator",
            **({"Authorization": f"Bearer {token}"} if token else {}),
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def validate(actual: dict, expected: dict, *, check_github: bool) -> dict:
    require(actual == expected, "BERLIN_FACH_RESIDUAL_NOT_DETERMINISTIC_RUN_WITH_WRITE")
    require(sha256_bytes(SOURCE_REGISTER_PATH.read_bytes()) == SOURCE_REGISTER_SHA256, "BERLIN_SOURCE_REGISTER_SHA_DRIFT")
    require(sha256_bytes(THEME_REVIEW_PATH.read_bytes()) == THEME_REVIEW_SHA256, "BERLIN_THEME_REVIEW_SHA_DRIFT")
    require(actual["release_policy"]["no_new_vercel_build"] is True, "BERLIN_FACH_VERCEL_GATE_NOT_FAIL_CLOSED")
    require(not any(actual["constraints"].values()), "BERLIN_FACH_FORBIDDEN_SYNTHESIS")
    require(actual["coverage_summary"]["programme_analysis_complete_parties"] == ["DKP", "Die PARTEI", "SGP"], "BERLIN_FACH_TERMINAL_SET_DRIFT")
    require(actual["coverage_summary"]["genuine_fach_programme_parties"] == ["AfD", "BÜNDNIS 90/DIE GRÜNEN", "BSW", "FDP", "Tierschutzpartei", "Volt", "SPD", "CDU", "Die Linke"], "BERLIN_FACH_OPEN_SET_DRIFT")
    require(actual["coverage_summary"]["genuine_unsegmented_pdf_pages"] == 1278, "BERLIN_FACH_PAGE_RESIDUAL_DRIFT")
    require(actual["coverage_summary"]["genuine_source_bound_atoms"] == 9, "BERLIN_FACH_ATOM_RESIDUAL_DRIFT")

    object_ids: list[str] = []
    for programme in actual["programmes"]:
        artifact = programme["artifact"]
        require(artifact["sha256"] and artifact["artifact_id"], f"BERLIN_FACH_ARTIFACT_PIN_MISSING:{programme['party']}")
        for item in programme["active_source_objects"]:
            require(item["status"] in ALLOWED_STATUSES, f"BERLIN_FACH_INVALID_STATUS:{item['object_id']}")
            require(item["source_locator"], f"BERLIN_FACH_SOURCE_LOCATOR_MISSING:{item['object_id']}")
            if item["status"] == GENUINE:
                require(item.get("exact_reason"), f"BERLIN_FACH_GENUINE_REASON_MISSING:{item['object_id']}")
            if item["status"] == NOT_ASSESSABLE:
                require(item.get("exact_reason_source"), f"BERLIN_FACH_NOT_ASSESSABLE_REASON_SOURCE_MISSING:{item['object_id']}")
            object_ids.append(item["object_id"])
    require(len(object_ids) == len(set(object_ids)), "BERLIN_FACH_DUPLICATE_ACTIVE_OBJECT_ID")

    if check_github:
        token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
        for pin in actual["source_pins"]:
            comment = fetch_comment(pin["comment_id"], token)
            require(comment["updated_at"] == pin["updated_at"], f"BERLIN_FACH_COMMENT_UPDATED:{pin['comment_id']}")
            require(sha256_bytes(comment["body"].encode("utf-8")) == pin["body_sha256"], f"BERLIN_FACH_COMMENT_BODY_DRIFT:{pin['comment_id']}")

    return {
        "gate": "BERLIN_FACH_CONTENT_RESIDUAL",
        "status": "PASS_FINITE_RESIDUAL_3_TERMINAL_9_GENUINE",
        "base_main_commit": BASE_MAIN_COMMIT,
        "programme_analysis_complete": 3,
        "genuine_fach_programmes": 9,
        "genuine_unsegmented_pdf_pages": 1278,
        "genuine_source_bound_atoms": 9,
        "github_source_pins": "PASS" if check_github else "NOT_REQUESTED",
        "no_new_vercel_build": True,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="rewrite the deterministic matrix")
    parser.add_argument("--check-github", action="store_true", help="verify immutable GitHub comment pins")
    args = parser.parse_args()

    expected = build_matrix()
    if args.write:
        MATRIX_PATH.write_text(json.dumps(expected, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    actual = load(MATRIX_PATH)
    print(json.dumps(validate(actual, expected, check_github=args.check_github), ensure_ascii=False, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
