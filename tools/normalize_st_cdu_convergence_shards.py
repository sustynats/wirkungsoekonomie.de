#!/usr/bin/env python3
"""Normalize CDU parity shard *schema only* for global convergence.

This helper is deliberately mechanical.  It never invents or changes a Fach
judgement.  Older source-bound parity shards used `new_or_split_units` whereas
newer shards use `terminal_source_objects`.  The global reconciler needs one
stable read shape, so this script copies already-present terminal tuples into
that alias and resolves numeric legacy-parent references to their immutable
Release-1 commitment IDs.
"""
from __future__ import annotations

import json
import pathlib
import re

ROOT = pathlib.Path("woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt")
PLAN = ROOT / "ltw-2026-st-cdu-global-leaf-reconciliation-plan-v1.json"
REGISTER = pathlib.Path(
    "woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-cdu-zusagen.md"
)
TERMINAL = {
    "EDITORIAL_V2_PLUS_APPROVED",
    "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
    "SOURCE_UNIT_RECLASSIFIED_VERSIONED",
}
DIRECTIONS = {"POSITIVE", "NEGATIVE", "NEUTRAL", "AMBIVALENT", "OPEN"}
EVIDENCE = {"HIGH", "MEDIUM", "LOW", "NOT_ASSESSABLE"}


def read_json(path: pathlib.Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: pathlib.Path, obj):
    path.write_text(
        json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def parse_register_keys(text: str):
    mapping = {}
    current_no = None
    for line in text.splitlines():
        m = re.match(r"####\s+Eintrag\s+(\d+)\s*$", line.strip())
        if m:
            current_no = int(m.group(1))
            continue
        m = re.match(r"\*\*commitment_key:\*\*\s+(.+?)\s*$", line.strip())
        if m and current_no is not None:
            mapping[current_no] = m.group(1).strip()
    return mapping


def comment_id_from_object(obj):
    blob = json.dumps(obj, ensure_ascii=False)
    m = re.search(r"issuecomment-(\d+)", blob)
    return int(m.group(1)) if m else None


def terminal_dicts_recursive(obj):
    found = []
    seen = set()

    def walk(x):
        if isinstance(x, dict):
            sid = x.get("source_unit_id")
            status = x.get("terminal_fach_status")
            direction = x.get("impact_direction")
            evidence = x.get("evidence_level")
            if sid and status in TERMINAL and direction in DIRECTIONS and evidence in EVIDENCE:
                key = str(sid)
                if key not in seen:
                    seen.add(key)
                    found.append(dict(x))
            for value in x.values():
                walk(value)
        elif isinstance(x, list):
            for value in x:
                walk(value)

    walk(obj)
    return found


def normalize_parent(rec, legacy_keys):
    out = dict(rec)
    raw = (
        out.get("parent_source_unit_id")
        or out.get("parent_legacy_source_unit")
        or out.get("parent_legacy_unit")
    )
    if raw is None:
        return out
    text = str(raw).strip()
    if re.fullmatch(r"\d{1,4}", text):
        key = legacy_keys.get(int(text))
        if key:
            out["parent_source_unit_id"] = key
    elif text.startswith("ltw-2026-st-cdu-") or text.startswith("ST-CDU-"):
        out["parent_source_unit_id"] = text
    return out


def main() -> int:
    plan = read_json(PLAN)
    legacy_keys = parse_register_keys(REGISTER.read_text(encoding="utf-8"))
    changed = []
    diagnostics = []

    for segment in plan["canonical_non_overlapping_segments"]:
        path = ROOT / segment["expected_shard"]
        if not path.exists():
            continue
        data = read_json(path)
        before = json.dumps(data, ensure_ascii=False, sort_keys=True)

        existing = data.get("terminal_source_objects")
        if not isinstance(existing, list):
            records = terminal_dicts_recursive(data)
            data["terminal_source_objects"] = [normalize_parent(x, legacy_keys) for x in records]
            diagnostics.append({
                "shard": path.name,
                "schema_alias_materialized": True,
                "terminal_records": len(records),
            })
        else:
            normalized = [normalize_parent(x, legacy_keys) if isinstance(x, dict) else x for x in existing]
            data["terminal_source_objects"] = normalized

        if not data.get("fach_review_comment_id"):
            cid = comment_id_from_object(data)
            if cid:
                data["fach_review_comment_id"] = cid

        data.setdefault("schema_normalization", {})
        data["schema_normalization"].update({
            "mode": "MECHANICAL_ALIAS_ONLY_NO_NEW_FACH_SEMANTICS",
            "terminal_alias": "terminal_source_objects",
            "legacy_parent_reference_resolution": "IMMUTABLE_RELEASE1_COMMITMENT_ID_WHERE_NUMERIC_PARENT_PRESENT",
        })

        after = json.dumps(data, ensure_ascii=False, sort_keys=True)
        if after != before:
            write_json(path, data)
            changed.append(path.as_posix())

    print(json.dumps({
        "changed_shards": changed,
        "diagnostics": diagnostics,
        "fach_semantics_created": False,
        "public_count_mutated": False,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
