#!/usr/bin/env python3
"""Build real-content.json directly from the authoritative editorial DOCX.

This parser reads tables in document order so two-column positive/risk lists remain
separate. It also preserves source URLs stored as Word hyperlinks.

Usage:
  python3 content/parse_editorial.py \
    source/Wirkungswahl-Kompass_Redaktionelles_Inhaltspaket_v1.0.docx \
    content/real-content.json
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Iterable

from docx import Document
from docx.document import Document as DocxDocument
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

DIMS = [
    ("climate", "Klima & Energie"),
    ("resilience", "Resilienz & Generationengerechtigkeit"),
    ("resources", "Ressourcen & Biodiversität"),
    ("social", "Soziale Sicherheit & Fairness"),
    ("health", "Gesundheit, Bildung & Teilhabe"),
    ("freedom", "Freiheit & Selbstbestimmung"),
    ("rule_of_law", "Rechtsstaat & Grundrechte"),
    ("information", "Informationsqualität & demokratischer Zusammenhalt"),
]
FIELDS = [
    ("A", "Klima, Energie & Ressourcen"),
    ("B", "Mobilität, Gebäude, Landwirtschaft & Natur"),
    ("C", "Wirtschaft, Finanzen & Industrie"),
    ("D", "Arbeit, soziale Sicherung & Gesundheit"),
    ("E", "Wohnen, Boden & öffentliche Daseinsvorsorge"),
    ("F", "Demokratie, Medien & digitale Öffentlichkeit"),
    ("G", "Rechte, Migration & gesellschaftliche Teilhabe"),
    ("H", "Europa, Außenpolitik & Sicherheit"),
    ("I", "Bildung, Wissenschaft & digitale Zukunft"),
]
PARTY_ID = {
    "CDU/CSU": "cdu_csu",
    "SPD": "spd",
    "BÜNDNIS 90/DIE GRÜNEN": "gruene",
    "AfD": "afd",
    "DIE LINKE": "linke",
    "BSW": "bsw",
    "FDP": "fdp",
}
PARTY_NAME = {
    "cdu_csu": "CDU/CSU",
    "spd": "SPD",
    "gruene": "Bündnis 90/Die Grünen",
    "afd": "AfD",
    "linke": "Die Linke",
    "bsw": "BSW",
    "fdp": "FDP",
}
PARTY_ORDER = ["cdu_csu", "spd", "gruene", "afd", "linke", "bsw", "fdp"]
PROGRAM_BY_PARTY = {
    "cdu_csu": "P01",
    "spd": "P02",
    "gruene": "P03",
    "afd": "P04",
    "linke": "P05",
    "bsw": "P06",
    "fdp": "P07",
}
CONF = {"hoch": "high", "mittel": "medium", "niedrig": "low"}
DIM_BY_NAME = {label: dim_id for dim_id, label in DIMS}


def norm_minus(text: str) -> str:
    return text.replace("−", "-").replace("–", "-").replace("—", "-")


def dim_id(label: str) -> str | None:
    label = label.strip()
    if label in DIM_BY_NAME:
        return DIM_BY_NAME[label]
    for did, canonical in DIMS:
        if label.lower().startswith(canonical.split(" ")[0].lower()):
            return did
    return None


def iter_blocks(doc: DocxDocument) -> Iterable[Paragraph | Table]:
    for child in doc.element.body.iterchildren():
        if child.tag.endswith("}p"):
            yield Paragraph(child, doc)
        elif child.tag.endswith("}tbl"):
            yield Table(child, doc)


def cell_url(cell) -> str | None:
    links = cell._tc.xpath(".//w:hyperlink")
    for link in links:
        rid = link.get(qn("r:id"))
        if rid and rid in cell.part.rels:
            return cell.part.rels[rid].target_ref
    return None


def table_rows(table: Table) -> list[list[str]]:
    return [[cell.text.strip() for cell in row.cells] for row in table.rows]


def field_for(qnum: int) -> tuple[str, str]:
    return FIELDS[(qnum - 1) // 4]


def position_status(stance: int | None, source_id: str | None, confidence: str) -> str:
    if stance is None:
        return "not_evidenced"
    if stance == 2:
        return "clear_support"
    if stance == 1:
        return "leaning_support"
    if stance == -1:
        return "leaning_opposition"
    if stance == -2:
        return "clear_opposition"
    # The source package uses 0 for both a genuinely mixed position and an
    # insufficiently evidenced position. Low confidence/no citation is treated as
    # not evidenced, so no artificial proximity is calculated.
    if source_id is None or confidence == "low":
        return "not_evidenced"
    return "mixed"


def parse(docx_path: Path) -> dict:
    doc = Document(docx_path)
    blocks = list(iter_blocks(doc))

    programs: list[dict] = []
    evidence: list[dict] = []

    for block in blocks:
        if not isinstance(block, Table):
            continue
        rows = table_rows(block)
        if not rows:
            continue
        header = rows[0]
        if header == ["ID", "Quelle", "Link"]:
            for row_obj, row in zip(block.rows[1:], rows[1:]):
                pid, title = row[0], row[1]
                party_id = next((k for k, v in PROGRAM_BY_PARTY.items() if v == pid), None)
                programs.append({
                    "id": pid,
                    "party_id": party_id,
                    "title": title,
                    "year": 2025,
                    "url": cell_url(row_obj.cells[2]),
                    "checked_at": "2026-08-04",
                })
        elif header == ["ID", "Institution", "Thema", "Link"]:
            for row_obj, row in zip(block.rows[1:], rows[1:]):
                evidence.append({
                    "id": row[0],
                    "institution": row[1],
                    "topic": row[2],
                    "url": cell_url(row_obj.cells[3]),
                    "checked_at": "2026-08-04",
                })

    questions: list[dict] = []
    for idx, block in enumerate(blocks):
        if not isinstance(block, Paragraph) or not re.match(r"^Q\d\d ·", block.text):
            continue
        qid = block.text[:3]
        qnum = int(qid[1:])
        title = block.text.split("·", 1)[1].strip()
        chunk: list[Paragraph | Table] = []
        j = idx + 1
        while j < len(blocks):
            nxt = blocks[j]
            if isinstance(nxt, Paragraph) and (
                re.match(r"^Q\d\d ·", nxt.text) or nxt.text.startswith("J. Übergreifende Wirkungsgrenzen")
            ):
                break
            chunk.append(nxt)
            j += 1

        question_table = info_table = party_table = impact_table = potential_table = bands_table = None
        paras: list[str] = []
        for item in chunk:
            if isinstance(item, Paragraph):
                paras.append(item.text.strip())
                continue
            rows = table_rows(item)
            if not rows:
                continue
            header = rows[0]
            if len(header) == 1 and header[0].startswith("FRAGE AN"):
                question_table = rows
            elif header[0] == "Warum diese Frage?":
                info_table = rows
            elif header[0] == "Partei":
                party_table = rows
            elif header[0] == "Wirkungspfad":
                impact_table = rows
            elif header[0] == "Positive Wirkungspotenziale":
                potential_table = rows
            elif header[0] == "Dimension":
                bands_table = rows

        if not all([question_table, info_table, party_table, impact_table, potential_table, bands_table]):
            raise ValueError(f"Incomplete question block {qid}")

        raw_question = question_table[0][0]
        thesis = raw_question.split("\n", 1)[1].strip() if "\n" in raw_question else raw_question.strip()
        info = {row[0]: row[1] for row in info_table}
        impact = {row[0]: row[1] for row in impact_table}

        party_positions: list[dict] = []
        for row in party_table[1:]:
            party_id = PARTY_ID[row[0]]
            value_match = re.search(r"[+-]?\d+", norm_minus(row[1]))
            editorial_value = int(value_match.group()) if value_match else None
            source_match = re.search(r"(P0\d).*?PDF-S\.\s*([0-9\-]+).*?Vertrauen:\s*(\w+)", row[4])
            source_id = source_match.group(1) if source_match else None
            pdf_page = source_match.group(2) if source_match else None
            confidence = CONF.get(source_match.group(3), "low") if source_match else "low"
            status = position_status(editorial_value, source_id, confidence)
            stance = None if status == "not_evidenced" else editorial_value
            party_positions.append({
                "party_id": party_id,
                "stance": stance,
                "editorial_value": editorial_value,
                "position_status": status,
                "einordnung": "keine eindeutige Position" if status == "not_evidenced" else row[2],
                "kurzbegruendung": row[3],
                "source_id": source_id,
                "pdf_page": pdf_page,
                "confidence": confidence,
                "review_required": confidence == "low" or source_id is None,
            })

        positive = [row[0][1:].strip() for row in potential_table[1:] if row[0].startswith("•")]
        risks = [row[1][1:].strip() for row in potential_table[1:] if row[1].startswith("•")]

        bands: dict[str, list[int]] = {}
        for row in bands_table[1:]:
            did = dim_id(row[0])
            nums = [int(x) for x in re.findall(r"[+-]?\d+", norm_minus(row[1]))]
            if did and nums:
                bands[did] = [nums[0], nums[1] if len(nums) > 1 else nums[0]]

        indicators = ""
        microcopy: list[str] = []
        for para in paras:
            if para.startswith("Mögliche Indikatoren:"):
                indicators = para.split(":", 1)[1].strip()
            if para.startswith("„"):
                microcopy.append(para.strip("„“\""))

        dimensions = [dim_id(x.strip()) for x in info["Wirkungsdimensionen"].split(",")]
        dimensions = [x for x in dimensions if x]
        field_id, field_topic = field_for(qnum)
        questions.append({
            "id": qid,
            "field": field_id,
            "topic": field_topic,
            "title": title,
            "thesis": thesis,
            "explanation": info["Warum diese Frage?"],
            "dimensions": dimensions,
            "referenceFrame": info["Referenzrahmen"],
            "baseline": info["Abgrenzung / Baseline"],
            "answer_scale": [-2, -1, 0, 1, 2],
            "importance_scale": [0, 1, 2, 3],
            "party_positions": party_positions,
            "impact_assessment": {
                "status": "modelled_potential",
                "effect_path": [x.strip() for x in impact["Wirkungspfad"].split("→")],
                "time_effect": impact["Zeitwirkung"],
                "affected_groups": impact["Betroffene Gruppen"],
                "evidence_grade": CONF.get(impact["Evidenzgrad"].lower(), "medium"),
                "uncertainty": CONF.get(impact["Zentrale Unsicherheit"].split(":", 1)[0].strip().lower(), "medium"),
                "bands": bands,
                "positive_potentials": positive,
                "risks": risks,
                "red_lines_text": impact["Wirkungsgrenzen"],
                "evidence_ids": re.findall(r"E\d\d", impact["Evidenzquellen"]),
                "indicators": indicators,
                "microcopy": microcopy[-3:],
            },
        })

    # Global red lines and result copy from paragraphs.
    ptexts = [b.text.strip() for b in blocks if isinstance(b, Paragraph)]
    j = ptexts.index("J. Übergreifende Wirkungsgrenzen")
    k = ptexts.index("K. Ergebnis- und Transparenztexte")
    global_red_lines = [
        ptexts[i] for i in range(j + 1, k)
        if ptexts[i]
        and not ptexts[i].startswith("Die folgenden")
        and ptexts[i] != "Darstellungsregel"
        and not ptexts[i].startswith("Die Anwendung darf")
    ]

    def copy_between(start: str, end: str) -> list[str]:
        a = ptexts.index(start)
        b = ptexts.index(end)
        return [x.strip("„“\"") for x in ptexts[a + 1:b] if x.startswith("„")]

    result_copy = {
        "onboarding": copy_between("K.1 Onboarding", "K.2 Ergebnisübersicht"),
        "results": copy_between("K.2 Ergebnisübersicht", "K.3 Quellen- und Fehlerhinweis"),
        "sources": copy_between("K.3 Quellen- und Fehlerhinweis", "L. Datenvertrag für Claude und CodeX"),
    }

    source_hash = hashlib.sha256(docx_path.read_bytes()).hexdigest()
    return {
        "meta": {
            "product": "Wirkungswahl-Kompass",
            "mode": "programmatic",
            "dataVersion": "Programme 2025 · Stichtag 2026-08-04",
            "methodologyVersion": "1.0",
            "contentVersion": "1.1",
            "status": "redaktioneller Arbeitsstand — vor Veröffentlichung Zweitprüfung + juristischer Check",
            "claim": "Wo du stehst. Was Parteien vorschlagen. Was daraus folgen kann.",
            "demo": False,
            "sourceDocument": docx_path.name,
            "sourceSha256": source_hash,
        },
        "forbiddenFields": [
            "party_total_impact_score",
            "recommended_party",
            "winner",
            "overall_democracy_compensation",
            "single_match_percentage_primary",
        ],
        "dimensions": [{"id": did, "label": label} for did, label in DIMS],
        "fields": [{"id": fid, "topic": topic} for fid, topic in FIELDS],
        "parties": [
            {"id": pid, "name": PARTY_NAME[pid], "code": code}
            for code, pid in zip("ABCDEFG", PARTY_ORDER)
        ],
        "programs": programs,
        "evidence": evidence,
        "globalRedLines": global_red_lines,
        "resultCopy": result_copy,
        "answerScale": [
            {"v": -2, "label": "stimme gar nicht zu"},
            {"v": -1, "label": "stimme eher nicht zu"},
            {"v": 0, "label": "unentschieden"},
            {"v": 1, "label": "stimme eher zu"},
            {"v": 2, "label": "stimme vollständig zu"},
        ],
        "importanceScale": [
            {"w": 0, "label": "nicht relevant"},
            {"w": 1, "label": "eher nachrangig"},
            {"w": 2, "label": "wichtig"},
            {"w": 3, "label": "sehr wichtig"},
        ],
        "questions": questions,
    }


def main() -> int:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
        "source/Wirkungswahl-Kompass_Redaktionelles_Inhaltspaket_v1.0.docx"
    )
    output = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("content/real-content.json")
    if not source.exists():
        raise SystemExit(f"Source DOCX not found: {source}")
    data = parse(source)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"Wrote {output}: {len(data['questions'])} questions, "
        f"{len(data['programs'])} programs, {len(data['evidence'])} evidence records"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
