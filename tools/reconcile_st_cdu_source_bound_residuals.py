#!/usr/bin/env python3
"""Mechanical residual reconciliation for the Sachsen-Anhalt CDU convergence lane.

This module creates no Fach semantics. It only repairs machine materialization of
facts already explicit in source-bound #234 reviews:

* re-materialize canonical legacy parity classifications from the first/second
  cells of the exact markdown parity tables, avoiding cross-reference numbers in
  explanatory cells;
* supplement the legacy terminal ledger from explicit CDU #234 headings whose
  IDs are abbreviated as ``...-NNNN``;
* resolve semantic relation strings such as ``RESTATEMENT_DUPLICATE_OF_0251_*``
  to the immutable Release-1 stable ID.

All inputs remain the exact #234 review snapshots/comments and immutable working
register. No DNS mapping, Recommendation, score or new Fach judgement is added.
"""
from __future__ import annotations

import json
import pathlib
import re
from typing import Callable

ROOT = pathlib.Path("woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt")
PLAN = ROOT / "ltw-2026-st-cdu-global-leaf-reconciliation-plan-v1.json"
SNAP_INDEX = ROOT / "review-snapshots/ltw-2026-st-cdu-review-snapshot-index-v1.json"

TERMINAL = {
    "EDITORIAL_V2_PLUS_APPROVED",
    "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
    "SOURCE_UNIT_RECLASSIFIED_VERSIONED",
}
DIRECTIONS = {"POSITIVE", "NEGATIVE", "NEUTRAL", "AMBIVALENT", "OPEN"}
EVIDENCE = {"HIGH", "MEDIUM", "LOW", "NOT_ASSESSABLE"}
CLASS_TOKENS = [
    "ABSENT_IN_FINAL_PDF",
    "HISTORICAL_SOURCE_VARIANT",
    "SAME_PARTIAL_PARENT",
    "TRUNCATED_PARTIAL_PARENT",
    "TRUNCATED_OVERMERGED",
    "PARTIAL_PARENT",
    "OVERMERGED",
    "TRUNCATED",
    "CONTEXT_ONLY",
    "DUPLICATE",
    "RESTATEMENT",
    "CONTINUATION",
    "ABSENT",
    "SAME",
    "PARTIAL",
]


def read_json(path: pathlib.Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: pathlib.Path, obj):
    path.write_text(
        json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def normalize_class_cell(value: str) -> str | None:
    """Normalize only the explicit parity/classification cell.

    Weak tokens are removed when a stronger compound token already carries the
    same meaning. Mixed explicit roles (for example CONTINUATION + SAME) are
    retained because the source review stated both.
    """
    up = re.sub(r"[*_`]", "", value).upper().replace("-", "_")
    found = [tok for tok in CLASS_TOKENS if tok in up]
    if "SAME_PARTIAL_PARENT" in found:
        found = [x for x in found if x not in {"SAME", "PARTIAL_PARENT", "PARTIAL"}]
    if "TRUNCATED_PARTIAL_PARENT" in found:
        found = [x for x in found if x not in {"TRUNCATED", "PARTIAL_PARENT", "PARTIAL"}]
    if "TRUNCATED_OVERMERGED" in found:
        found = [x for x in found if x not in {"TRUNCATED", "OVERMERGED"}]
    if "PARTIAL_PARENT" in found:
        found = [x for x in found if x != "PARTIAL"]
    # Preserve deterministic token order and remove duplicates.
    out = []
    for token in found:
        if token not in out:
            out.append(token)
    return "+".join(out) if out else None


def strict_table_diff(text: str):
    """Read legacy classifications from the parity table's first two cells only.

    The previous generic parser inspected the entire row and therefore treated
    cross-reference numbers in explanatory cells as if they were the row's own
    legacy unit. This parser deliberately binds only IDs in the first cell to the
    classification in the second cell.
    """
    by_id: dict[str, dict] = {}
    conflicts = []
    for raw in text.splitlines():
        line = raw.strip()
        if not (line.startswith("|") and line.endswith("|")):
            continue
        cells = [cell.strip() for cell in line[1:-1].split("|")]
        if len(cells) < 2:
            continue
        ids = re.findall(r"(?<!\d)(\d{4})(?!\d)", cells[0])
        classification = normalize_class_cell(cells[1])
        if not ids or not classification:
            continue
        for legacy in ids:
            rec = {
                "legacy_unit": legacy,
                "classification": classification,
                "source_bound_review_line": raw.strip(),
            }
            old = by_id.get(legacy)
            if old and old["classification"] != classification:
                conflicts.append({
                    "legacy_unit": legacy,
                    "prior": old["classification"],
                    "new": classification,
                    "prior_line": old["source_bound_review_line"],
                    "new_line": raw.strip(),
                })
            by_id[legacy] = rec
    return [by_id[k] for k in sorted(by_id, key=int)], conflicts


def refresh_canonical_shard_diffs() -> dict:
    """Replace generated parity diffs with strict source-bound table materialization."""
    plan = read_json(PLAN)
    index = read_json(SNAP_INDEX)
    expected_by_slug = {}
    for seg in plan.get("canonical_non_overlapping_segments", []):
        pages = seg.get("pages") or []
        if pages:
            expected_by_slug[f"p{pages[0]}-p{pages[-1]}"] = seg.get("expected_shard")

    changed = []
    diagnostics = []
    for entry in index.get("entries", []):
        slug = entry.get("shard")
        expected = expected_by_slug.get(slug)
        if not expected:
            continue
        shard_path = ROOT / expected
        snapshot_path = pathlib.Path(entry["snapshot_path"])
        if not shard_path.exists() or not snapshot_path.exists():
            continue
        text = snapshot_path.read_text(encoding="utf-8")
        strict, conflicts = strict_table_diff(text)
        if conflicts:
            raise RuntimeError(f"STRICT_PARITY_TABLE_CONFLICT:{slug}:{conflicts}")
        if not strict:
            # Some older canonical shards were hand-materialized rather than
            # snapshot-generated. Never erase a valid existing diff.
            continue

        data = read_json(shard_path)
        before = json.dumps(data, ensure_ascii=False, sort_keys=True)
        data["primary_source_diff"] = strict
        data["canonical_diff_materialization"] = {
            "mode": "STRICT_FIRST_CELL_LEGACY_SECOND_CELL_PARITY_FROM_EXACT_234_SNAPSHOT",
            "review_snapshot_path": entry["snapshot_path"],
            "review_snapshot_sha256": entry.get("body_sha256"),
            "issue_comment_id": entry.get("issue_comment_id"),
            "legacy_rows_materialized": len(strict),
            "new_fach_semantics_created": False,
        }
        after = json.dumps(data, ensure_ascii=False, sort_keys=True)
        if after != before:
            write_json(shard_path, data)
            changed.append(shard_path.as_posix())
        diagnostics.append({
            "shard": slug,
            "legacy_rows": len(strict),
            "changed": after != before,
        })

    result = {
        "changed_shards": changed,
        "diagnostics": diagnostics,
        "fach_semantics_created": False,
        "public_count_mutated": False,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def _is_cdu_source_bound_comment(body: str) -> bool:
    head = body[:1200]
    return (
        "ST-CDU" in head
        or "WÖk CDU" in head
        or "CDU Primary-Source-Parity" in head
    )


def _heading_legacy_number(line: str) -> int | None:
    if not re.match(r"^\s*#{2,6}\s+", line):
        return None
    # Accept source-bound headings such as `...-0014`, `0014`, or a full CDU ID.
    m = re.search(
        r"(?:\.\.\.-|ltw-2026-st-cdu-)?(?<!\d)(\d{4})(?!\d)",
        line,
        re.IGNORECASE,
    )
    return int(m.group(1)) if m else None


def _explicit_terminal_from_heading(lines: list[str], index: int):
    end = min(len(lines), index + 12)
    for j in range(index + 1, end):
        if re.match(r"^\s*#{2,6}\s+", lines[j]):
            end = j
            break
    chunk = "\n".join(lines[index:end])
    sm = re.search(
        r"\b(EDITORIAL_V2_PLUS_APPROVED|REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON|SOURCE_UNIT_RECLASSIFIED_VERSIONED)\b",
        chunk,
    )
    if not sm:
        return None
    tail = chunk[sm.end():]
    dm = re.search(r"\b(POSITIVE|NEGATIVE|NEUTRAL|AMBIVALENT|OPEN)\b", tail)
    em = re.search(r"\b(HIGH|MEDIUM|LOW|NOT_ASSESSABLE)\b", tail)
    if not dm or not em:
        return None
    return sm.group(1), dm.group(1), em.group(1)


def install_legacy_terminal_ledger_supplement(convergence_module) -> None:
    """Supplement the builder ledger from explicit abbreviated CDU headings."""
    base: Callable = convergence_module.build_legacy_terminal_ledger

    def wrapped(comments, legacy_keys):
        ledger, provenance, deltas = base(comments, legacy_keys)
        for comment in comments:
            body = comment.get("body") or ""
            if not _is_cdu_source_bound_comment(body):
                continue
            cid = int(comment.get("id") or 0)
            lines = body.splitlines()
            for i, line in enumerate(lines):
                n = _heading_legacy_number(line)
                if n is None or n not in legacy_keys:
                    continue
                trip = _explicit_terminal_from_heading(lines, i)
                if not trip:
                    continue
                status, direction, evidence = trip
                if status not in TERMINAL or direction not in DIRECTIONS or evidence not in EVIDENCE:
                    continue
                # Do not allow an older comment to overwrite the builder's latest
                # already-resolved explicit terminal state.
                if cid < int(provenance.get(n) or 0):
                    continue
                rec = {
                    "source_unit_id": legacy_keys[n],
                    "terminal_fach_status": status,
                    "impact_direction": direction,
                    "evidence_level": evidence,
                }
                old = ledger.get(n)
                oldtrip = None
                if old:
                    oldtrip = (
                        old.get("terminal_fach_status"),
                        old.get("impact_direction"),
                        old.get("evidence_level"),
                    )
                newtrip = (status, direction, evidence)
                if oldtrip and oldtrip != newtrip:
                    deltas.append({
                        "legacy_number": n,
                        "prior": oldtrip,
                        "new": newtrip,
                        "new_comment_id": cid,
                        "type": "VERSIONED_TERMINAL_DELTA_LATEST_WINS_ABBREVIATED_HEADING_RECONCILIATION",
                    })
                ledger[n] = rec
                provenance[n] = cid
        return ledger, provenance, deltas

    convergence_module.build_legacy_terminal_ledger = wrapped


def install_validator_reference_normalization(validate_module) -> None:
    """Resolve exact semantic role strings containing an underscored legacy target."""
    base: Callable = validate_module.normalize_ref

    def wrapped(value, ids, hist_index):
        refs = base(value, ids, hist_index)
        if refs:
            return refs
        if value is None or isinstance(value, (dict, list)):
            return refs
        text = str(value).strip().upper()
        m = re.search(r"(?:OF|TO|PARENT|LEGACY)[_:\- ]*(\d{4})(?=[^0-9]|$)", text)
        if not m:
            return refs
        sid = hist_index.get(int(m.group(1)))
        return [sid] if sid else refs

    validate_module.normalize_ref = wrapped


def main() -> int:
    refresh_canonical_shard_diffs()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
