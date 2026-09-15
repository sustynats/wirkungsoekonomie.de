"""Conservative data-only recovery of already reviewed potential profiles from PR #771.

No provider/LLM calls, no new scoring, no forced conflict resolution.
Already-published fresh 2.1 records that still lack a reviewed MPD model are
held from publication instead of receiving invented values.
This helper is one-off recovery machinery and must not be merged to main.
"""
import copy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

SOURCE = "6048f1b5336458cae9501088180af01f93409772"
BASE = "a985626602d3deebdd8ae7625bfcd53874b31a77"
EXPECTED_BRANCH = "chatgpt/wirkungspotenzial-final-recovery-20260915"
MISSING = object()
DIMENSIONS = ("human", "planet", "democracy")
HOLD_AT = "2026-09-15T06:41:00Z"


def complete(record):
    assessment = record.get("impact_assessment") or {}
    dimensions = assessment.get("dimensions") or {}
    return assessment.get("version") == "2.1" and all(
        (d := dimensions.get(key) or {}).get("path_status") == "modelled"
        and type(d.get("magnitude")) is int
        and 0 <= d["magnitude"] <= 5
        and bool(d.get("primary_paths"))
        for key in DIMENSIONS
    )


def missing_dimensions(record):
    assessment = record.get("impact_assessment") or {}
    dimensions = assessment.get("dimensions") or {}
    missing = []
    for key in DIMENSIONS:
        d = dimensions.get(key) or {}
        if not (d.get("path_status") == "modelled" and type(d.get("magnitude")) is int and 0 <= d["magnitude"] <= 5 and bool(d.get("primary_paths"))):
            missing.append(key)
    return missing


def fresh_incomplete_publication(record):
    assessment = record.get("impact_assessment") or {}
    semantic = record.get("impact_semantic_review") or {}
    return (
        record.get("published") is True
        and assessment.get("version") == "2.1"
        and assessment.get("review", {}).get("status") != "needs_reassessment"
        and (assessment.get("publication_status") == "ready" or semantic.get("status") == "ready")
        and not complete(record)
    )


def merge_record(base, current, proposed):
    """Merge only disjoint top-level changes; reject every conflict."""
    result = copy.deepcopy(current)
    conflicts = []
    for key in base.keys() | proposed.keys():
        old, new, live = base.get(key, MISSING), proposed.get(key, MISSING), current.get(key, MISSING)
        if old == new:
            continue
        if live != old and live != new:
            conflicts.append(key)
        elif new is MISSING:
            result.pop(key, None)
        else:
            result[key] = copy.deepcopy(new)

    for key in ("story_id", "slug", "url", "published_at", "original_potential_assessment"):
        if current.get(key, MISSING) != result.get(key, MISSING):
            conflicts.append("protected:" + key)

    for key in ("versions", "impact_history"):
        old_history, new_history = current.get(key, []), result.get(key, [])
        if not isinstance(old_history, list) or not isinstance(new_history, list):
            if old_history != new_history:
                conflicts.append("history:" + key)
        elif any(entry not in new_history for entry in old_history):
            conflicts.append("history:" + key)

    for key in base.keys() | current.keys():
        if base.get(key, MISSING) != current.get(key, MISSING) and current.get(key, MISSING) != result.get(key, MISSING):
            conflicts.append("concurrent:" + key)

    return (None, sorted(set(conflicts))) if conflicts else (result, [])


def git_bytes(ref, name):
    return subprocess.check_output(["git", "show", f"{ref}:{name}"])


def self_test():
    base = {"story_id": "x", "published_at": "old", "impact": 1, "metadata": 1, "versions": [{"v": 1}]}
    current = {**base, "metadata": 2, "new_field": "keep"}
    proposed = {**base, "impact": 2, "versions": [{"v": 1}, {"v": 2}]}
    merged, errors = merge_record(base, current, proposed)
    assert not errors and merged["metadata"] == 2 and merged["new_field"] == "keep" and merged["impact"] == 2
    assert merge_record(base, {**current, "impact": 3}, proposed)[0] is None
    assert merge_record(base, current, {**proposed, "published_at": "new"})[0] is None
    assert merge_record(base, current, {**proposed, "versions": [{"v": 2}]})[0] is None
    assert merge_record(base, {**current, "original_potential_assessment": {"original": 1}}, {**proposed, "original_potential_assessment": {"original": 2}})[0] is None
    print("PASS: conservative merge self-test")


def run():
    if os.environ.get("GITHUB_REPOSITORY") != "sustynats/wirkungsoekonomie.de":
        raise SystemExit("Unexpected repository")
    if os.environ.get("GITHUB_REF") != f"refs/heads/{EXPECTED_BRANCH}":
        raise SystemExit("Unexpected branch; refusing recovery")

    self_test()
    filename = "data/news/stories.json"
    store = json.loads(Path(filename).read_text())
    base_store = json.loads(git_bytes(BASE, filename))
    source_store = json.loads(git_bytes(SOURCE, filename))

    def index(records):
        mapping = {r["story_id"]: r for r in records}
        if len(mapping) != len(records):
            raise SystemExit("Duplicate story identity")
        return mapping

    base = index(base_store["stories"])
    proposed = index(source_store["stories"])
    current = index(store["stories"])
    candidates = [
        key for key, record in current.items()
        if key in base and key in proposed
        and not complete(record)
        and complete(proposed[key])
        and proposed[key].get("impact_assessment") != base[key].get("impact_assessment")
    ]
    if len(candidates) > 20:
        raise SystemExit(f"Unexpectedly broad candidate set ({len(candidates)}); refusing bulk rewrite")

    positions = {r["story_id"]: i for i, r in enumerate(store["stories"])}
    report = {
        "source_pr": 771,
        "source_commit": SOURCE,
        "comparison_base": BASE,
        "current_base": os.environ.get("CURRENT_BASE"),
        "candidate_count": len(candidates),
        "applied": [],
        "held": [],
        "unreviewed_publication_holds": [],
        "policy": "Existing independent reviews only; no new scoring/provider calls; no concurrent/protected-field overwrite. Fresh incomplete 2.1 publications are held instead of guessed."
    }

    for key in candidates:
        candidate = proposed[key]
        review = candidate.get("impact_semantic_review") or {}
        assessment = candidate.get("impact_assessment") or {}
        if review.get("status") != "ready" or not review.get("review_job_id") or assessment.get("publication_status") != "ready":
            report["held"].append({"story_id": key, "reason": ["independent_review_not_ready"]})
            continue
        merged, conflicts = merge_record(base[key], current[key], candidate)
        if conflicts:
            report["held"].append({"story_id": key, "reason": conflicts})
            continue
        if not complete(merged):
            raise SystemExit("Incomplete merged potential: " + key)
        store["stories"][positions[key]] = merged
        report["applied"].append({
            "story_id": key,
            "title": merged.get("title"),
            "slug": merged.get("slug"),
            "review_job_id": review["review_job_id"],
            "magnitudes": {k: merged["impact_assessment"]["dimensions"][k]["magnitude"] for k in DIMENSIONS},
        })

    for i, record in enumerate(store["stories"]):
        if not fresh_incomplete_publication(record):
            continue
        held_record = copy.deepcopy(record)
        missing = missing_dimensions(held_record)
        held_record["published"] = False
        assessment = held_record.get("impact_assessment") or {}
        if assessment.get("publication_status") == "ready":
            assessment["publication_status"] = "needs_review"
        semantic = held_record.get("impact_semantic_review")
        if isinstance(semantic, dict) and semantic.get("status") == "ready":
            semantic["status"] = "needs_review"
        held_record["publication_hold"] = {
            "reason": "IMPACT_FRESH_MODELLED_DIMENSIONS_REQUIRED",
            "held_at": HOLD_AT,
            "missing_dimensions": missing,
            "provider_call": False,
            "note": "Nicht erneut bewerten oder Werte erfinden; erst mit vollständig geprüftem MPD-Potenzial wieder veröffentlichen."
        }
        store["stories"][i] = held_record
        report["unreviewed_publication_holds"].append({
            "story_id": held_record.get("story_id"),
            "title": held_record.get("title"),
            "slug": held_record.get("slug"),
            "missing_dimensions": missing,
        })

    if len(report["unreviewed_publication_holds"]) > 20:
        raise SystemExit(f"Unexpectedly broad unreviewed publication hold set ({len(report['unreviewed_publication_holds'])}); refusing bulk hold")

    assert set(current) == set(index(store["stories"])), "Story identities must be preserved"
    report["story_count"] = len(store["stories"])
    if report["applied"] or report["unreviewed_publication_holds"]:
        Path(filename).write_text(json.dumps(store, ensure_ascii=False, indent=2) + "\n")
    report["result_sha256"] = hashlib.sha256(Path(filename).read_bytes()).hexdigest()
    report_path = Path(os.environ["RUNNER_TEMP"]) / "potential-final-recovery-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    self_test() if "--self-test" in sys.argv else run()
