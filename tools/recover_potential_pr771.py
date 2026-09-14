"""Conservative extraction of already reviewed potential repairs from PR #771.
No provider calls, new factual evaluations, deletion, or conflict resolution by force.
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
FILES = [
    "scripts/news/reviewed-impact.mjs",
    "scripts/news/publish-reviewed.mjs",
    "scripts/news/impact-coverage.mjs",
    "tests/news/reviewed-impact.test.mjs",
    "tests/news/impact-coverage.test.mjs",
]
MISSING = object()
DIMENSIONS = ("human", "planet", "democracy")


def complete(record):
    assessment = record.get("impact_assessment") or {}
    dimensions = assessment.get("dimensions") or {}
    return assessment.get("version") == "2.1" and all(
        (d := dimensions.get(key) or {}).get("path_status") == "modelled"
        and type(d.get("magnitude")) is int and 0 <= d["magnitude"] <= 5
        and bool(d.get("primary_paths")) for key in DIMENSIONS
    )


def merge_record(base, current, proposed):
    """Merge only disjoint top-level changes; any conflict rejects the record."""
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
    assert base["impact"] == 1 and current["impact"] == 1
    assert merge_record(base, {**current, "impact": 3}, proposed)[0] is None
    assert merge_record(base, current, {**proposed, "published_at": "new"})[0] is None
    assert merge_record(base, current, {**proposed, "versions": [{"v": 2}]})[0] is None
    assert merge_record(base, {**current, "original_potential_assessment": {"original": 1}}, {**proposed, "original_potential_assessment": {"original": 2}})[0] is None
    print("PASS: disjoint updates, conflict rejection, history/date/original preservation")


def run():
    if os.environ.get("GITHUB_REPOSITORY") != "sustynats/wirkungsoekonomie.de":
        raise SystemExit("Unexpected repository")
    if os.environ.get("GITHUB_REF") != "refs/heads/chatgpt/wirkungspotenzial-recovery-20260915":
        raise SystemExit("Unexpected branch: this recovery may never write to main")
    self_test()
    report = {"source_pr": 771, "source_commit": SOURCE, "comparison_base": BASE,
              "current_base": os.environ["CURRENT_BASE"], "applied": [], "held": [], "code_files": FILES,
              "policy": "No new scoring, no provider calls, no concurrent field overwritten; immutable original history retained."}
    for name in FILES:
        live = Path(name).read_bytes()
        old, new = git_bytes(BASE, name), git_bytes(SOURCE, name)
        if live != old and live != new:
            raise SystemExit("Concurrent source change: " + name)
        Path(name).write_bytes(new)
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
    candidates = [key for key, record in current.items() if key in base and key in proposed
                  and not complete(record) and complete(proposed[key])
                  and proposed[key].get("impact_assessment") != base[key].get("impact_assessment")]
    if len(candidates) > 20:
        raise SystemExit("Unexpectedly broad change set; refusing a bulk rewrite")
    positions = {r["story_id"]: i for i, r in enumerate(store["stories"])}
    for key in candidates:
        candidate = proposed[key]
        review = candidate.get("impact_semantic_review") or {}
        if review.get("status") != "ready" or not review.get("review_job_id") or candidate["impact_assessment"].get("publication_status") != "ready":
            report["held"].append({"story_id": key, "reason": ["independent_review_not_ready"]})
            continue
        merged, conflicts = merge_record(base[key], current[key], candidate)
        if conflicts:
            report["held"].append({"story_id": key, "reason": conflicts})
            continue
        if not complete(merged):
            raise SystemExit("Incomplete merged potential: " + key)
        store["stories"][positions[key]] = merged
        report["applied"].append({"story_id": key, "title": merged.get("title"), "slug": merged.get("slug"),
             "review_job_id": review["review_job_id"], "magnitudes": {k: merged["impact_assessment"]["dimensions"][k]["magnitude"] for k in DIMENSIONS}})
    assert set(current) == set(index(store["stories"])), "Story identities must be preserved"
    report["story_count"] = len(store["stories"])
    report["candidate_count"] = len(candidates)
    if report["applied"]:
        Path(filename).write_text(json.dumps(store, ensure_ascii=False, indent=2) + "\n")
    report["result_sha256"] = hashlib.sha256(Path(filename).read_bytes()).hexdigest()
    report_path = Path(os.environ["RUNNER_TEMP"]) / "potential-recovery-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    self_test() if "--self-test" in sys.argv else run()
