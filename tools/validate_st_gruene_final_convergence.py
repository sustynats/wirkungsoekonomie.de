#!/usr/bin/env python3
"""Fail-closed technical gate for the Sachsen-Anhalt GRUENE final union.

The gate only verifies that the required source-bound Fach handoffs exist. It
does not infer roles, edges, impact directions, evidence or recommendations.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "content/audits/sachsen-anhalt/gruene-issue234-source-corpus-c01.json"
REGISTER = (
    ROOT
    / "woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/"
    "ltw-2026-st-gruene-zusagen.md"
)

EXPECTED_REGISTER_HASH = "73130003d247bad51e27bb63bc140bf1aa815ebe51bf77bcdf9c348da5f4a48d"
EXPECTED_REGISTER_ROWS = 740
REQUIRED_RETRO_MARKERS = [
    "ST-GRUENE-PSP-R01",
    "ST-GRUENE-PSP-R02",
    "ST-GRUENE-PSP-R03",
    "ST-GRUENE-PSP-R04",
    "ST-GRUENE-PSP-R05",
    "ST-GRUENE-PSP-R06",
    "ST-GRUENE-PSP-R07",
    "ST-GRUENE-PSP-R08",
    "ST-GRUENE-PSP-R09",
    "ST-GRUENE-PSP-R10A",
    "ST-GRUENE-PSP-R10B",
    "ST-GRUENE-PSP-R11",
    "ST-GRUENE-PSP-R12",
    "ST-GRUENE-PSP-R13",
    "ST-GRUENE-PSP-R14",
    "ST-GRUENE-PSP-R15",
    "ST-GRUENE-PSP-R16",
    "ST-GRUENE-PSP-R17",
    "ST-GRUENE-PSP-R18",
    "ST-GRUENE-PSP-R19",
    "ST-GRUENE-PSP-R20",
    "ST-GRUENE-PSP-R21",
    "ST-GRUENE-PSP-R22",
    "ST-GRUENE-PSP-R23",
    "ST-GRUENE RETRO-PARITY R24",
    "GRÜNE RETRO-PARITY — R25",
    "GRÜNE RETRO-PARITY — R26",
    "GRÜNE RETRO-PARITY — R27",
    "GRÜNE RETRO-PARITY — R28",
    "GRÜNE RETRO-PARITY — R29",
    "GRÜNE RETRO-PARITY — R30",
    "GRÜNE RETRO-PARITY — R31",
    "GRÜNE RETRO-PARITY — R32",
    "GRÜNE RETRO-PARITY — R33",
    "GRÜNE RETRO-PARITY — R34",
]
REQUIRED_CONVERGENCE_MARKERS = [
    "ST-GRUENE-CONVERGENCE-C01",
    "ST-GRUENE-CONVERGENCE-C02",
    "ST-GRUENE-CONVERGENCE-C03",
    "ST-GRUENE-CONVERGENCE-C04",
]


def main() -> int:
    corpus_bytes = CORPUS.read_bytes()
    corpus = json.loads(corpus_bytes)
    comments = corpus.get("comments", [])
    bodies = "\n".join(str(comment.get("body", "")) for comment in comments)
    register_text = REGISTER.read_text(encoding="utf-8")

    blockers: list[str] = []
    missing_retro = [marker for marker in REQUIRED_RETRO_MARKERS if marker not in bodies]
    missing_convergence = [
        marker for marker in REQUIRED_CONVERGENCE_MARKERS if marker not in bodies
    ]
    if missing_retro:
        blockers.extend(f"MISSING_RETRO_HANDOFF:{marker}" for marker in missing_retro)
    if missing_convergence:
        blockers.extend(
            f"MISSING_CONVERGENCE_HANDOFF:{marker}" for marker in missing_convergence
        )

    row_count = len(re.findall(r"^#### Eintrag \d+$", register_text, flags=re.MULTILINE))
    if row_count != EXPECTED_REGISTER_ROWS:
        blockers.append(
            f"WORKING_REGISTER_ROW_COUNT_MISMATCH:{row_count}:{EXPECTED_REGISTER_ROWS}"
        )
    source_hash_match = re.search(r"^\*\*source_hash:\*\* ([0-9a-f]{64})$", register_text, re.MULTILINE)
    source_hash = source_hash_match.group(1) if source_hash_match else None
    if source_hash != EXPECTED_REGISTER_HASH:
        blockers.append(f"WORKING_REGISTER_SOURCE_HASH_MISMATCH:{source_hash}")

    convergence_end = 108 if not missing_convergence else 0
    if "ST_GRUENE_CONVERGENCE_C04_0085_0108 = PASS" not in bodies:
        blockers.append("C04_ZERO_GAP_PASS_MARKER_MISSING")
        convergence_end = 0

    # C05+ explicit role/edge handoffs do not yet exist. This is a Fach input
    # gap, not a condition the technical validator may infer away.
    if convergence_end < EXPECTED_REGISTER_ROWS:
        blockers.append(f"EXPLICIT_ROLE_EDGE_CONVERGENCE_MISSING:{convergence_end + 1:04d}-0740")

    report = {
        "gate": "ST_GRUENE_FINAL_CONVERGENCE",
        "status": "PASS" if not blockers else "BLOCKED",
        "code_must_not_generate_fach": True,
        "source_corpus": {
            "path": str(CORPUS.relative_to(ROOT)),
            "sha256": hashlib.sha256(corpus_bytes).hexdigest(),
            "matching_comments": len(comments),
            "last_comment_id": comments[-1].get("id") if comments else None,
        },
        "working_register": {
            "path": str(REGISTER.relative_to(ROOT)),
            "rows": row_count,
            "source_hash": source_hash,
            "history_only": True,
        },
        "retro_document_scan": "PASS" if not missing_retro else "BLOCKED",
        "explicit_role_edge_convergence_through": f"{convergence_end:04d}",
        "authoritative_source_unit_count": None,
        "authoritative_effect_mechanism_count": None,
        "blockers": blockers,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not blockers else 1


if __name__ == "__main__":
    raise SystemExit(main())
