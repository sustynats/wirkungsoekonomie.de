#!/usr/bin/env python3
"""Read-only Source-vs-Public audit for Government Data 1.1."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path


def jsonl(path: Path):
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("package", type=Path)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    canonical = {row["government_action_id"]: row for row in jsonl(args.package / "canonical" / "government-actions.jsonl")}
    source_events = {row["source_event_id"]: row for row in jsonl(args.package / "normalized" / "source-events.jsonl")}
    public = jsonl(args.package / "public" / "government-actions.jsonl")
    errors = []
    rows = []
    public_ids = {row["government_action_id"] for row in public}
    expected_ids = {key for key, row in canonical.items() if row.get("publication_status") == "READY_FACT_LAYER"}

    if public_ids != expected_ids:
        errors.append(f"ID-Menge abweichend: expected={len(expected_ids)} public={len(public_ids)}")

    for item in public:
        source = canonical.get(item["government_action_id"])
        status = "PASS"
        details = []
        if source is None:
            status = "FAIL"; details.append("kanonisches Objekt fehlt")
        else:
            checks = {
                "title": source.get("title_canonical") or source.get("title_official_preferred"),
                "action_type": source.get("action_type"),
                "responsible_institutions": source.get("responsible_institutions") or [],
                "responsible_ministries": source.get("responsible_ministries") or [],
                "lifecycle_status": source.get("lifecycle_status"),
                "decision_date": source.get("cabinet_decision_date") or source.get("first_known_date"),
                "effective_date": source.get("effective_date"),
                "official_identifiers": source.get("official_identifiers") or {},
                "publication_status": "READY_FACT_LAYER",
                "analysis_stage": None,
                "has_woek_analysis": False,
            }
            for field, expected in checks.items():
                if item.get(field) != expected:
                    status = "FAIL"; details.append(f"{field}: public={item.get(field)!r} canonical={expected!r}")
            if source.get("fach_review_status") != "CONFIRMED_ACTION":
                status = "FAIL"; details.append("fach_review_status ist nicht CONFIRMED_ACTION")
            expected_event_ids = source.get("source_event_ids") or []
            public_refs = item.get("source_refs") or []
            public_ref_ids = [row.get("source_event_id") for row in public_refs]
            if public_ref_ids != expected_event_ids:
                status = "FAIL"; details.append(
                    f"source_refs: public={public_ref_ids!r} canonical={expected_event_ids!r}"
                )
            for reference in public_refs:
                event_id = reference.get("source_event_id")
                event = source_events.get(event_id)
                if event is None:
                    status = "FAIL"; details.append(f"SourceEvent fehlt: {event_id}")
                    continue
                source_checks = {
                    "title": event.get("title_original"),
                    "url": event.get("canonical_source_url") or event.get("source_url"),
                    "source_function": event.get("source_function"),
                    "published_at": event.get("published_at"),
                    "retrieved_at": event.get("retrieved_at"),
                    "official_identifiers": event.get("official_identifiers") or {},
                }
                for field, expected in source_checks.items():
                    if reference.get(field) != expected:
                        status = "FAIL"; details.append(
                            f"source_refs[{event_id}].{field}: public={reference.get(field)!r} source={expected!r}"
                        )
        rows.append({"government_action_id": item["government_action_id"], "status": status, "details": "; ".join(details)})
        if status == "FAIL": errors.append(f"{item['government_action_id']}: {rows[-1]['details']}")

    args.report.parent.mkdir(parents=True, exist_ok=True)
    with args.report.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["government_action_id", "status", "details"])
        writer.writeheader(); writer.writerows(rows)
    print(json.dumps({"status": "PASS" if not errors else "FAIL", "canonical_ready": len(expected_ids), "public": len(public), "errors": errors}, ensure_ascii=False))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
