from __future__ import annotations

import importlib.util
import gzip
import json
import sys
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "ingest" / "run_ingest.py"
SPEC = importlib.util.spec_from_file_location("government_ingest", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


class GovernmentIngestTests(unittest.TestCase):
    def test_stable_id_is_reproducible(self):
        self.assertEqual(MODULE.stable_id("x", "a", 1), MODULE.stable_id("x", "a", 1))
        self.assertNotEqual(MODULE.stable_id("x", "a", 1), MODULE.stable_id("x", "a", 2))

    def test_missing_values_remain_null(self):
        record = MODULE.action_record(
            "govaction:test", "Testhandlung", ["source-event:test"],
            kind="OTHER", status="UNKNOWN", ministries=[], first_date=None,
        )
        self.assertIsNone(record["effective_date"])
        self.assertIsNone(record["materiality_signals"]["budget_amount_explicit"])
        self.assertNotEqual(record["lifecycle_status"], 0)

    def test_no_assessment_fields_in_action(self):
        record = MODULE.action_record(
            "govaction:test", "Testhandlung", ["source-event:test"],
            kind="OTHER", status="UNKNOWN", ministries=[], first_date=None,
        )
        forbidden = {
            "impact_direction", "sdg_direction", "sdg_plus_direction", "net_impact",
            "government_score", "minister_score", "party_score",
        }
        self.assertFalse(forbidden & set(record))

    def test_title_similarity_does_not_silently_merge(self):
        with tempfile.TemporaryDirectory() as directory:
            state = MODULE.State(Path(directory), "2025-05-06", "2026-08-16")
            existing = MODULE.action_record(
                "govaction:one", "Strategie für digitale Verwaltung", ["source-event:one"],
                kind="STRATEGY", status="ANNOUNCED", ministries=["BMDS"], first_date="2025-06-01",
            )
            state.actions.append(existing)
            candidate = MODULE.action_record(
                "govaction:two", "Strategie digitale Verwaltung 2025", ["source-event:two"],
                kind="STRATEGY", status="ANNOUNCED", ministries=["BMDS"], first_date="2025-06-02",
                official_ids={"dip_ids":["123"], "drucksachen":[], "eli":[], "bgbl":[], "other":[]},
            )
            merged = MODULE.exact_or_candidate(state, candidate, "source-event:two")
            self.assertIsNone(merged)
            self.assertEqual(len(state.actions), 1)
            self.assertTrue(any(item["relationship_type"] == "POSSIBLE_SAME_AS" for item in state.relationships))

    def test_equal_title_without_identifier_does_not_merge(self):
        with tempfile.TemporaryDirectory() as directory:
            state = MODULE.State(Path(directory), "2025-05-06", "2026-08-16")
            state.actions.append(MODULE.action_record(
                "govaction:one", "Entwurf eines Testgesetzes", ["source-event:one"],
                kind="GOVERNMENT_BILL", status="CABINET_DECIDED", ministries=[], first_date="2025-06-01",
            ))
            candidate = MODULE.action_record(
                "govaction:two", "Entwurf eines Testgesetzes", ["source-event:two"],
                kind="GOVERNMENT_BILL", status="PARLIAMENTARY_PROCESS", ministries=[], first_date="2025-06-02",
                official_ids={"dip_ids":["123"], "drucksachen":[], "eli":[], "bgbl":[], "other":[]},
            )
            self.assertIsNone(MODULE.exact_or_candidate(state, candidate, "source-event:two"))
            self.assertEqual(state.relationships[0]["relationship_type"], "POSSIBLE_SAME_AS")

    def test_shared_official_identifier_can_merge(self):
        with tempfile.TemporaryDirectory() as directory:
            state = MODULE.State(Path(directory), "2025-05-06", "2026-08-16")
            existing = MODULE.action_record(
                "govaction:one", "Testhandlung", ["source-event:one"],
                kind="GOVERNMENT_BILL", status="CABINET_DECIDED", ministries=[], first_date="2025-06-01",
                official_ids={"dip_ids":[], "drucksachen":["21/42"], "eli":[], "bgbl":[], "other":[]},
            )
            state.actions.append(existing)
            candidate = MODULE.action_record(
                "govaction:two", "Amtlicher Langtitel der Testhandlung", ["source-event:two"],
                kind="GOVERNMENT_BILL", status="PARLIAMENTARY_PROCESS", ministries=[], first_date="2025-06-02",
                official_ids={"dip_ids":["123"], "drucksachen":["21/42"], "eli":[], "bgbl":[], "other":[]},
            )
            self.assertIs(existing, MODULE.exact_or_candidate(state, candidate, "source-event:two"))

    def test_raw_content_is_content_addressed_and_versioned(self):
        with tempfile.TemporaryDirectory() as directory:
            state = MODULE.State(Path(directory), "2025-05-06", "2026-08-16")
            fetcher = MODULE.Fetcher(state, delay=0)
            first = fetcher._store("https://example.org/a", "https://example.org/a", 200, "text/plain", b"one", "test")
            second = fetcher._store("https://example.org/a", "https://example.org/a", 200, "text/plain", b"two", "test")
            self.assertNotEqual(first.content_hash, second.content_hash)
            metadata = json.loads((state.output / second.raw_metadata_path).read_text(encoding="utf-8"))
            self.assertTrue(metadata["change_detected"])
            self.assertEqual(metadata["previous_content_hash"], first.content_hash)

    def test_existing_raw_can_be_reused_without_network(self):
        with tempfile.TemporaryDirectory() as directory:
            state = MODULE.State(Path(directory), "2025-05-06", "2026-08-16")
            writer = MODULE.Fetcher(state, delay=0)
            stored = writer._store("https://example.org/reuse", "https://example.org/reuse", 200, "application/json", b"{}", "test")
            reader = MODULE.Fetcher(state, delay=0, reuse_existing=True)
            reused = reader.fetch("https://example.org/reuse", "test")
            self.assertEqual(reused.content_hash, stored.content_hash)
            self.assertTrue(any(item["event"] == "raw_reused" for item in state.logs))

    def test_gzip_sitemap_is_parsed(self):
        xml = b'''<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>https://example.org/strategie</loc><lastmod>2025-07-01</lastmod></url>
        </urlset>'''

        class FakeFetcher:
            def fetch(self, *_args, **_kwargs):
                return MODULE.FetchResult(
                    url="https://example.org/sitemap.xml.gz",
                    final_url="https://example.org/sitemap.xml.gz",
                    status=200,
                    content_type="application/gzip",
                    body=gzip.compress(gzip.compress(xml)),
                    retrieved_at="2026-08-17T00:00:00Z",
                    content_hash=MODULE.sha256(gzip.compress(gzip.compress(xml))),
                    raw_metadata_path="raw/test.json",
                )

        with tempfile.TemporaryDirectory() as directory:
            state = MODULE.State(Path(directory), "2025-05-06", "2026-08-17")
            urls = MODULE.sitemap_urls(FakeFetcher(), "https://example.org/sitemap.xml.gz", "TEST", state)
            self.assertEqual(urls, [("https://example.org/strategie", "2025-07-01")])

    def test_access_challenge_is_not_parsed_as_official_content(self):
        self.assertTrue(MODULE.is_access_challenge(b"<title>Radware Captcha Page</title>"))
        self.assertFalse(MODULE.is_access_challenge(b"<title>Amtliche Strategie</title>"))
        redirected = MODULE.FetchResult(
            url="https://example.org/amtlich",
            final_url="https://fwauth.init-ag.de/connect/Access?url=blocked",
            status=200,
            content_type="text/html",
            body=b"<html></html>",
            retrieved_at="2026-08-17T00:00:00Z",
            content_hash="hash",
            raw_metadata_path="raw/test.json",
        )
        self.assertTrue(MODULE.fetch_is_access_challenge(redirected))

    def test_government_cms_root_relative_link_is_resolved_from_host_root(self):
        fetched = MODULE.FetchResult(
            url="https://example.org/Navigation/DE/liste.html",
            final_url="https://example.org/Navigation/DE/liste.html",
            status=200,
            content_type="text/html",
            body=b'<main><a href="Redaktion/DE/Artikel/Gesetz.html">Gesetz</a></main>',
            retrieved_at="2026-08-17T00:00:00Z",
            content_hash="hash",
            raw_metadata_path="raw/test.json",
        )
        links = MODULE.html_discovery_links(fetched, fetched.final_url)
        self.assertEqual(links[0][0], "https://example.org/Redaktion/DE/Artikel/Gesetz.html")


if __name__ == "__main__":
    unittest.main()
