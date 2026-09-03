#!/usr/bin/env python3
"""Contract and regression tests for the Government Data 1.1 package."""

from __future__ import annotations

import csv
import json
import os
import unittest
from collections import Counter
from pathlib import Path


PACKAGE = Path(os.environ.get("WOEK_GOVERNMENT_PACKAGE", Path(__file__).resolve().parents[1]))


def jsonl(path: Path) -> list[dict]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


@unittest.skipUnless((PACKAGE / "canonical" / "government-actions.jsonl").exists(), "Government Data package not selected")
class GovernmentData11Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.actions = jsonl(PACKAGE / "canonical" / "government-actions.jsonl")
        cls.events = jsonl(PACKAGE / "normalized" / "source-events.jsonl")
        cls.relationships = jsonl(PACKAGE / "canonical" / "relationships.jsonl")
        cls.public = jsonl(PACKAGE / "public" / "government-actions.jsonl")
        cls.institutions = jsonl(PACKAGE / "canonical" / "executive-institutions.jsonl")
        cls.assignments = jsonl(PACKAGE / "canonical" / "office-holder-assignments.jsonl")
        with (PACKAGE / "audit" / "CANDIDATE-CLASSIFICATION.csv").open(encoding="utf-8", newline="") as handle:
            cls.classifications = list(csv.DictReader(handle))

    def test_current_executive_registry(self) -> None:
        ministries = [row for row in self.institutions if row["institution_type"] == "FEDERAL_MINISTRY"]
        self.assertEqual(16, len(ministries))
        self.assertTrue(any(row["institution_id"] == "BKAmt" for row in self.institutions))
        self.assertTrue(any(row["institution_id"] == "NSR" for row in self.institutions))
        current = {row["institution_id"]: row for row in self.assignments if row.get("valid_to") is None}
        self.assertEqual("Nina Warken", current["BKAmt"]["office_holder_name"])
        self.assertEqual("Carsten Linnemann", current["BMG"]["office_holder_name"])
        self.assertEqual("Steffen Bilger", current["BMV"]["office_holder_name"])
        config = json.loads((PACKAGE / "config" / "office-holder-assignments.json").read_text(encoding="utf-8"))
        self.assertEqual(len(self.assignments), len(config["assignments"]))

    def test_cabinet_start_dates_do_not_invent_numbers(self) -> None:
        starts = [row for row in self.events if row.get("title_original") in {
            "Konstituierende Kabinettssitzung",
            "Erste regulär dokumentierte Kabinettssitzung der laufenden Bundesregierung",
        }]
        self.assertEqual({"2025-05-06", "2025-05-16"}, {row["published_at"] for row in starts})
        self.assertEqual({"2025-05-06", "2025-05-14"}, {row["effective_at"] for row in starts})
        self.assertTrue(all(row["official_identifiers"].get("cabinet_session_number") is None for row in starts))

    def test_bmwe_p0_regression_cases(self) -> None:
        expected = {"gwb12", "eeg2026", "gmodg", "eed2026"}
        actual = {
            row["government_action_id"].rsplit(":", 1)[-1]
            for row in self.actions if row["government_action_id"].startswith("govaction:bmwe-regression:")
        }
        self.assertEqual(expected, actual)
        classification = Counter(row["terminal_status"] for row in self.classifications if row["source_id"] == "MINISTRY_BMWE")
        self.assertEqual(4, classification["PROCESSED_ACTION"])
        self.assertEqual(6, classification["SOURCE_UNAVAILABLE"])

    def test_all_512_candidates_have_terminal_status(self) -> None:
        self.assertEqual(512, len(self.classifications))
        permitted = {"PROCESSED_ACTION", "NOT_GOVERNMENT_ACTION", "OUT_OF_PERIOD", "NEEDS_DATE", "SOURCE_UNAVAILABLE"}
        self.assertTrue(all(row["terminal_status"] in permitted for row in self.classifications))
        self.assertTrue(all(row["reason"].strip() for row in self.classifications))

    def test_publication_gate(self) -> None:
        public_ids = {row["government_action_id"] for row in self.public}
        expected = {row["government_action_id"] for row in self.actions if row["publication_status"] == "READY_FACT_LAYER"}
        self.assertEqual(expected, public_ids)
        source_events = {row["source_event_id"] for row in self.events}
        for row in self.public:
            self.assertEqual("READY_FACT_LAYER", row["publication_status"])
            self.assertFalse(row["has_woek_analysis"])
            self.assertIsNone(row["analysis_stage"])
            self.assertTrue(row["source_refs"])
            self.assertTrue(all(ref["source_event_id"] in source_events for ref in row["source_refs"]))
        for row in self.actions:
            if row["fach_review_status"] in {"UNREVIEWED", "NEEDS_SOURCE", "SOURCE_ONLY"}:
                self.assertNotEqual("READY_FACT_LAYER", row["publication_status"])
            if row.get("duplicate_cluster_id"):
                self.assertNotEqual("READY_FACT_LAYER", row["publication_status"])

    def test_historical_information_pages_are_not_current_actions(self) -> None:
        public_titles = {row["title"] for row in self.public}
        self.assertNotIn(
            "Directive 2008/101/EC of the European Parliament and of the Council of 19 November 2008 amending Directive 2003/07/EC so as to include aviation activities in the scheme for greenhoues gas emission allowance trading within the community",
            public_titles,
        )

    def test_no_effect_or_person_scores(self) -> None:
        forbidden = {
            "impact_direction", "sdg_direction", "sdg_plus_direction", "net_impact", "nwi",
            "effectiveness_score", "democracy_score", "government_score", "minister_score", "party_score",
            "positive_effect", "negative_effect",
        }
        self.assertTrue(all(not forbidden.intersection(row) for row in self.actions))
        self.assertEqual([], jsonl(PACKAGE / "analysis" / "government-impact-analyses.jsonl"))
        self.assertEqual([], jsonl(PACKAGE / "analysis" / "materiality-decisions.jsonl"))

    def test_coalition_candidates_remain_review_required(self) -> None:
        candidates = [row for row in self.relationships if row["relationship_type"] == "PARTIALLY_IMPLEMENTS_COALITION_COMMITMENT"]
        self.assertEqual(8, len(candidates))
        self.assertTrue(all(row["confidence"] == "LOW" for row in candidates))
        self.assertTrue(all(row["method"] == "SEMANTIC_CANDIDATE" for row in candidates))
        self.assertTrue(all(row["review_status"] == "REVIEW_REQUIRED" for row in candidates))

    def test_no_data_is_not_zero(self) -> None:
        for row in self.actions:
            for field in ("first_known_date", "cabinet_decision_date", "effective_date", "promulgated_date"):
                self.assertNotEqual(0, row.get(field))


if __name__ == "__main__":
    unittest.main()
