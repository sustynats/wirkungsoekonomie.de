#!/usr/bin/env python3
"""Dependency-free integrity checks for real-content.json."""
from __future__ import annotations
import json
import sys
from collections import Counter
from pathlib import Path

path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("content/real-content.json")
data = json.loads(path.read_text(encoding="utf-8"))
errors: list[str] = []

# Validate the published JSON contract as well as the project-specific invariants.
try:
    from jsonschema import Draft202012Validator, FormatChecker
    schema_path = path.with_name("real-content.schema.json")
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    for issue in Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(data):
        location = ".".join(str(x) for x in issue.absolute_path) or "$"
        errors.append(f"schema {location}: {issue.message}")
except ImportError:
    errors.append("jsonschema dependency missing; install content/requirements-content.txt")


def unique(items, label):
    ids = [x["id"] for x in items]
    dup = [x for x, n in Counter(ids).items() if n > 1]
    if dup:
        errors.append(f"duplicate {label} IDs: {dup}")
    return set(ids)

if len(data.get("questions", [])) != 36:
    errors.append("questions must contain exactly 36 entries")
if len(data.get("fields", [])) != 9:
    errors.append("fields must contain exactly 9 entries")
if len(data.get("parties", [])) != 7:
    errors.append("parties must contain exactly 7 entries")
if len(data.get("programs", [])) != 7:
    errors.append("programs must contain exactly 7 entries")
if len(data.get("evidence", [])) != 28:
    errors.append("evidence must contain exactly 28 entries")
if len(data.get("dimensions", [])) != 8:
    errors.append("dimensions must contain exactly 8 entries")
if len(data.get("globalRedLines", [])) != 9:
    errors.append("globalRedLines must contain exactly 9 entries")
if [item.get("v") for item in data.get("answerScale", [])] != [-2, -1, 0, 1, 2]:
    errors.append("answerScale must be [-2, -1, 0, 1, 2]")
if [item.get("w") for item in data.get("importanceScale", [])] != [0, 1, 2, 3]:
    errors.append("importanceScale must be [0, 1, 2, 3]")

qids = unique(data["questions"], "question")
fids = unique(data["fields"], "field")
pids = unique(data["parties"], "party")
progids = unique(data["programs"], "program")
evids = unique(data["evidence"], "evidence")
dimids = unique(data["dimensions"], "dimension")
pcodes = [x["code"] for x in data["parties"]]
if set(pcodes) != set("ABCDEFG") or len(set(pcodes)) != 7:
    errors.append("party codes must contain A-G exactly once")
program_by_id = {program["id"]: program for program in data["programs"]}
if {program["party_id"] for program in data["programs"]} != pids:
    errors.append("programs must contain exactly one source for every party")

if Counter(q["field"] for q in data["questions"]) != Counter({x: 4 for x in "ABCDEFGHI"}):
    errors.append("each field A-I must contain exactly four questions")

for src in [*data["programs"], *data["evidence"]]:
    if not src.get("url", "").startswith("https://"):
        errors.append(f"{src['id']}: missing HTTPS source URL")

status_to_stance = {
    "clear_support": 2,
    "leaning_support": 1,
    "mixed": 0,
    "not_evidenced": None,
    "leaning_opposition": -1,
    "clear_opposition": -2,
}

for q in data["questions"]:
    qid = q["id"]
    if q["field"] not in fids:
        errors.append(f"{qid}: unknown field {q['field']}")
    if not set(q["dimensions"]).issubset(dimids):
        errors.append(f"{qid}: unknown question dimension")
    positions = q.get("party_positions", [])
    if len(positions) != 7 or {p["party_id"] for p in positions} != pids:
        errors.append(f"{qid}: party position set incomplete")
    for pos in positions:
        stance = pos.get("stance")
        if stance is not None and stance not in {-2, -1, 0, 1, 2}:
            errors.append(f"{qid}/{pos['party_id']}: invalid stance")
        expected_stance = status_to_stance.get(pos["position_status"])
        if pos["position_status"] not in status_to_stance:
            errors.append(f"{qid}/{pos['party_id']}: unknown position status")
        elif stance != expected_stance:
            errors.append(
                f"{qid}/{pos['party_id']}: {pos['position_status']} must have stance {expected_stance}"
            )
        sid = pos.get("source_id")
        if sid is not None and sid not in progids:
            errors.append(f"{qid}/{pos['party_id']}: unknown program {sid}")
        elif sid is not None and program_by_id[sid]["party_id"] != pos["party_id"]:
            errors.append(f"{qid}/{pos['party_id']}: program {sid} belongs to another party")
        if pos["position_status"] == "not_evidenced" and sid is not None:
            errors.append(f"{qid}/{pos['party_id']}: not_evidenced must not name a program source")
    ia = q["impact_assessment"]
    if not ia.get("positive_potentials") or not ia.get("risks"):
        errors.append(f"{qid}: positive/risk lists must both be non-empty")
    for did, band in ia.get("bands", {}).items():
        if did not in dimids or len(band) != 2 or band[0] > band[1] or band[0] < -3 or band[1] > 3:
            errors.append(f"{qid}: invalid band {did}={band}")
    for eid in ia.get("evidence_ids", []):
        if eid not in evids:
            errors.append(f"{qid}: unknown evidence ID {eid}")

# Forbidden derived fields may be named in the transparency list, but may not
# appear as keys anywhere else in the content tree.
forbidden = set(data.get("forbiddenFields", []))

def walk(value, path="$"):
    if isinstance(value, dict):
        for key, child in value.items():
            if key in forbidden and path != "$":
                errors.append(f"forbidden derived field present at {path}.{key}")
            walk(child, f"{path}.{key}")
    elif isinstance(value, list):
        for i, child in enumerate(value):
            walk(child, f"{path}[{i}]")
walk(data)

if errors:
    print("CONTENT VALIDATION FAILED")
    for error in errors:
        print("-", error)
    raise SystemExit(1)
print("CONTENT VALIDATION PASSED")
print(f"36 questions · 9 fields · 7 parties · 8 dimensions · 7 programs · 28 evidence records")
