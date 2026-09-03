#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import unittest

from government_data_adapter_import import adapters


class SourceAdapterTests(unittest.TestCase):
    def setUp(self) -> None:
        self.adapter = adapters.BMWEAdapter()

    def test_happy_path(self) -> None:
        decision = self.adapter.classify_response(
            requested_url=self.adapter.base_url,
            final_url=self.adapter.base_url + "/Redaktion/DE/Artikel/test.html",
            status=200,
            content_type="text/html; charset=utf-8",
            body=b"<html><main>Amtlicher Inhalt</main></html>",
        )
        self.assertTrue(decision.usable)

    def test_same_host_redirect_is_accepted(self) -> None:
        decision = self.adapter.classify_response(
            requested_url=self.adapter.base_url + "/alt",
            final_url=self.adapter.base_url + "/neu",
            status=200,
            content_type="text/html",
            body=b"<html>Inhalt</html>",
        )
        self.assertTrue(decision.usable)

    def test_challenge_and_404_are_source_unavailable(self) -> None:
        for status, body in ((200, b"<html>cookie-check</html>"), (404, b"not found")):
            with self.subTest(status=status):
                decision = self.adapter.classify_response(
                    requested_url=self.adapter.base_url,
                    final_url=self.adapter.base_url,
                    status=status,
                    content_type="text/html",
                    body=body,
                )
                self.assertEqual(adapters.TerminalStatus.SOURCE_UNAVAILABLE, decision.status)

    def test_missing_date_is_not_invented(self) -> None:
        decision = self.adapter.classify_candidate(published_at=None, is_action=True, in_period=True)
        self.assertEqual(adapters.TerminalStatus.NEEDS_DATE, decision.status)

    def test_stable_id_is_idempotent_and_ignores_query(self) -> None:
        first = self.adapter.stable_candidate_id(self.adapter.base_url + "/x?a=1")
        second = self.adapter.stable_candidate_id(self.adapter.base_url + "/x?a=2")
        self.assertEqual(first, second)

    def test_content_change_detection(self) -> None:
        body = b"version one"
        previous = hashlib.sha256(body).hexdigest()
        self.assertFalse(self.adapter.content_changed(previous, body))
        self.assertTrue(self.adapter.content_changed(previous, b"version two"))

    def test_sitemap_deduplicates_and_malformed_xml_fails(self) -> None:
        xml = b"<urlset><url><loc>https://www.bundeswirtschaftsministerium.de/a</loc></url><url><loc>https://www.bundeswirtschaftsministerium.de/a</loc></url></urlset>"
        self.assertEqual(["https://www.bundeswirtschaftsministerium.de/a"], self.adapter.parse_sitemap(xml, self.adapter.base_url))
        with self.assertRaises(ValueError):
            self.adapter.parse_sitemap(b"<urlset>", self.adapter.base_url)


if __name__ == "__main__":
    unittest.main()
