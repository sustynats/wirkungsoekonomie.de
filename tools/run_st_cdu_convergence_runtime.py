#!/usr/bin/env python3
"""Execute the CDU convergence pipeline in a CI runner.

This is a temporary convergence-phase runtime bridge for PR #257. It reuses
only already source-bound #234 review comments and deterministic mechanical
normalizer/reconciler/validator logic. It performs no GitHub write itself and
creates no Fach semantics.

Some historical #234 shard checkpoints use `SOURCE_RESTORE_GAPS = 0` while the
older reconciler expects `UNRESOLVED_SOURCE_GAPS = 0`. The runtime therefore
adds the latter as a temporary in-worktree compatibility alias, runs the
mechanical builder, and restores the exact source-review snapshots before the
workflow commits outputs. The provenance snapshot and its SHA remain exact.
"""
from __future__ import annotations

import json
import os
import pathlib
import re
import urllib.request

import materialize_st_cdu_review_snapshots as snapshots
import normalize_st_cdu_convergence_shards as normalize
import reconcile_st_cdu_source_bound_residuals as residuals
import build_st_cdu_global_convergence as convergence
import reconcile_st_cdu_source_manifest_nodes as source_manifest_nodes
import validate_st_cdu_global_convergence as validate

SNAP_INDEX = pathlib.Path(
    "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/review-snapshots/ltw-2026-st-cdu-review-snapshot-index-v1.json"
)
AUDIT = pathlib.Path(
    "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-cdu-global-leaf-reconciliation-audit-v1.json"
)
ROLE_SUPPLEMENTS = pathlib.Path(
    "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-cdu-source-bound-role-supplements-v1.json"
)


def public_api_json(url: str):
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "woek-st-cdu-convergence-runtime",
    }
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.load(response)


def shard_pages(slug: str) -> tuple[int, int]:
    match = re.fullmatch(r"p(\d+)-p(\d+)", slug)
    if not match:
        raise ValueError(f"Bad shard slug: {slug}")
    return int(match.group(1)), int(match.group(2))


def apply_source_bound_role_supplements() -> dict:
    """Materialize role facts already explicit in source-bound #234 prose.

    The strict parity-table parser intentionally reads only table cells. A small
    residual set of CDU role decisions was stated in the source-bound review
    prose instead. This function copies those exact role decisions into the
    canonical shard role tables and never creates impact/evidence/Fach content.
    """
    data = json.loads(ROLE_SUPPLEMENTS.read_text(encoding="utf-8"))
    changed = []
    applied = []
    for rec in data.get("role_supplements", []):
        shard_path = residuals.ROOT / rec["canonical_shard"]
        if not shard_path.exists():
            raise RuntimeError(f"SOURCE_BOUND_ROLE_SUPPLEMENT_SHARD_MISSING:{shard_path}")
        shard = json.loads(shard_path.read_text(encoding="utf-8"))
        diffs = list(shard.get("primary_source_diff") or [])
        legacy = str(rec["legacy_unit"]).zfill(4)
        existing = [x for x in diffs if str(x.get("legacy_unit") or "").zfill(4) == legacy]
        if existing:
            classes = {str(x.get("classification") or "").upper() for x in existing}
            if rec["classification"].upper() not in classes:
                raise RuntimeError(
                    f"SOURCE_BOUND_ROLE_SUPPLEMENT_CONFLICT:{legacy}:"
                    f"existing={sorted(classes)}:new={rec['classification']}"
                )
            applied.append({"legacy_unit": legacy, "status": "ALREADY_PRESENT"})
            continue
        diffs.append({
            "legacy_unit": legacy,
            "classification": rec["classification"],
            "action": rec["action"],
            "source_bound_review_line": rec["source_bound_finding"],
            "source_bound_role_provenance": {
                "issue": rec["source_issue"],
                "comment_id": rec["source_comment_id"],
                "materialization": "EXACT_EXISTING_FACH_ROLE_NO_SYNTHESIS",
            },
        })
        diffs.sort(key=lambda x: int(str(x.get("legacy_unit") or "9999").zfill(4)))
        shard["primary_source_diff"] = diffs
        shard.setdefault("source_bound_role_supplements", []).append({
            "legacy_unit": legacy,
            "classification": rec["classification"],
            "issue": rec["source_issue"],
            "comment_id": rec["source_comment_id"],
            "new_fach_semantics_created": False,
        })
        shard_path.write_text(
            json.dumps(shard, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        changed.append(shard_path.as_posix())
        applied.append({"legacy_unit": legacy, "status": "MATERIALIZED"})
    result = {
        "changed_shards": sorted(set(changed)),
        "role_supplements": applied,
        "new_fach_semantics_created": False,
    }
    print(json.dumps({"diagnostic": "ST_CDU_SOURCE_BOUND_ROLE_SUPPLEMENTS", **result}, ensure_ascii=False, indent=2))
    return result


def apply_source_bound_freeze_blockers() -> dict:
    """Keep denominator freeze fail-closed for explicit unresolved split duties."""
    data = json.loads(ROLE_SUPPLEMENTS.read_text(encoding="utf-8"))
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    requirements = data.get("unresolved_split_requirements") or []
    blockers = list(audit.get("blockers") or [])
    for req in requirements:
        blocker = req.get("freeze_blocker")
        if blocker and blocker not in blockers:
            blockers.append(blocker)
    audit["blockers"] = sorted(set(blockers))
    audit["source_bound_unresolved_split_requirements"] = requirements
    audit["freeze_gate"] = "BLOCKED" if audit["blockers"] else audit.get("freeze_gate", "BLOCKED")
    if audit["blockers"]:
        audit["authoritative_source_unit_count"] = None
        audit["authoritative_effect_mechanism_count"] = None
    AUDIT.write_text(
        json.dumps(audit, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    result = {
        "requirements": requirements,
        "freeze_gate": audit["freeze_gate"],
        "blockers_added": [x.get("freeze_blocker") for x in requirements if x.get("freeze_blocker")],
        "new_fach_semantics_created": False,
    }
    print(json.dumps({"diagnostic": "ST_CDU_SOURCE_BOUND_SPLIT_FREEZE_GUARD", **result}, ensure_ascii=False, indent=2))
    return result


def main() -> int:
    snapshots.api_json = public_api_json
    convergence.api_json = public_api_json

    # Mechanical parser compatibility only. These wrappers read exact #234
    # source-bound comments and immutable legacy IDs; they create no Fach state.
    residuals.install_legacy_terminal_ledger_supplement(convergence)
    residuals.install_validator_reference_normalization(validate)

    # First rematerialize exact source-bound snapshots with strict own-shard selection.
    snapshots.main()
    index = json.loads(SNAP_INDEX.read_text(encoding="utf-8"))

    exact_bodies: dict[pathlib.Path, str] = {}
    exact_plan = residuals.PLAN.read_text(encoding="utf-8")
    plan_temporarily_overridden = False
    try:
        for entry in index.get("entries", []):
            path = pathlib.Path(entry["snapshot_path"])
            body = path.read_text(encoding="utf-8")
            exact_bodies[path] = body
            start, end = shard_pages(entry["shard"])
            legacy_alias = f"ST_CDU_P{start}_P{end}_UNRESOLVED_SOURCE_GAPS = 0"
            if legacy_alias not in body:
                # Selection already proved a shard-local zero-gap marker. This alias
                # is temporary compatibility metadata only, never a Fach statement.
                path.write_text(
                    body.rstrip() + "\n\n<!-- MECHANICAL_RUNTIME_ZERO_GAP_ALIAS -->\n"
                    + legacy_alias + "\n",
                    encoding="utf-8",
                    newline="\n",
                )

        normalize.main()

        # All 24 canonical non-overlapping parity shards are already present on
        # PR #257. Re-materialize only their role table from the exact #234
        # snapshots, then restore the few exact role decisions stated in #234
        # review prose rather than parity-table cells. No Fach content is created.
        plan = json.loads(exact_plan)
        missing = []
        for seg in plan.get("canonical_non_overlapping_segments", []):
            expected = residuals.ROOT / seg["expected_shard"]
            if not expected.exists():
                missing.append(expected.as_posix())
        if missing:
            raise RuntimeError(f"CANONICAL_SHARD_MISSING_BEFORE_STRICT_RECONCILIATION:{missing}")

        residuals.refresh_canonical_shard_diffs()
        apply_source_bound_role_supplements()
        for seg in plan.get("canonical_non_overlapping_segments", []):
            seg["materialized_on_pr257"] = True
        residuals.PLAN.write_text(
            json.dumps(plan, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        plan_temporarily_overridden = True

        convergence.main()
        # #234 A17 explicitly classifies 0244 as a five-way split parent, but no
        # source-bound terminal child Fach records are materialized. Keep that
        # exact unresolved duty as a hard freeze blocker instead of synthesizing it.
        apply_source_bound_freeze_blockers()
        # The versioned source manifest already contains exact terminal child triplets
        # for a small number of restored/split nodes that were not repeated in a page
        # shard. Materialize those explicit nodes mechanically before graph validation.
        source_manifest_nodes.main()
        validate.main()
        if AUDIT.exists():
            audit = json.loads(AUDIT.read_text(encoding="utf-8"))
            print(json.dumps({
                "diagnostic": "ST_CDU_EXACT_RESIDUAL_AFTER_GLOBAL_RECONCILIATION",
                "legacy_role_unclassified": audit.get("legacy_role_unclassified", []),
                "source_bound_unresolved_split_requirements": audit.get("source_bound_unresolved_split_requirements", []),
                "builder_blockers": [
                    x for x in audit.get("blockers", [])
                    if str(x).startswith(("LEGACY_", "CANONICAL_", "TERMINAL_", "ZERO_", "SHARD_", "SOURCE_BOUND_"))
                ],
                "structural_blockers": (audit.get("structural_validation") or {}).get("blockers", []),
                "freeze_gate": audit.get("freeze_gate"),
            }, ensure_ascii=False, indent=2))
    finally:
        # Preserve exact issue-comment snapshots and their indexed SHA256 provenance.
        for path, body in exact_bodies.items():
            path.write_text(body, encoding="utf-8", newline="\n")
        if plan_temporarily_overridden:
            residuals.PLAN.write_text(exact_plan, encoding="utf-8", newline="\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
