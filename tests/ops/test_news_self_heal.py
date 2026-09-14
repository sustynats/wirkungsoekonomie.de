import importlib.util
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("news_self_heal", ROOT / "scripts/ops/news-self-heal.py")
supervisor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(supervisor)


class RecoveryTests(unittest.TestCase):
    def test_one_transient_failure_does_not_restart(self):
        self.assertEqual(supervisor.decision({}, False, 1000)["action"], "none")

    def test_three_failures_restart_only_idle_lanes(self):
        prior = {"failures": 2}
        self.assertEqual(supervisor.decision(prior, False, 1000)["action"], "restart")
        self.assertEqual(supervisor.decision(prior, False, 1000, locked=True)["action"], "defer_active_lane")

    def test_recovery_is_bounded_even_after_failed_restart(self):
        prior = {"failures": 8, "repairs": [1000, 1700, 2400]}
        self.assertEqual(supervisor.decision(prior, False, 3500)["action"], "cooldown")
        self.assertEqual(supervisor.decision({"failures": 8, "repairs": [3000]}, False, 3200)["action"], "cooldown")

    def test_healthy_probe_resets_failure_streak_without_erasing_rate_limit(self):
        result = supervisor.decision({"failures": 5, "repairs": [1000]}, True, 1100)
        self.assertEqual(result["failures"], 0)
        self.assertEqual(result["repairs"], [1000])

    def test_active_real_sqlite_lane_never_taken_over(self):
        with tempfile.TemporaryDirectory() as temp:
            directory = Path(temp)
            connections = []
            for lane in ("discovery", "import"):
                connection = sqlite3.connect(directory / f"queue.sqlite.{lane}.lock")
                connection.execute("CREATE TABLE singleton(id INTEGER)")
                connections.append(connection)
            connections[1].execute("BEGIN IMMEDIATE")
            with supervisor.idle_lanes(directory) as idle:
                self.assertFalse(idle)
            self.assertTrue(connections[1].in_transaction)
            connections[1].rollback()
            with supervisor.idle_lanes(directory) as idle:
                self.assertTrue(idle)
            for connection in connections:
                connection.close()

    def test_green_server_does_not_make_stalled_publication_healthy(self):
        metrics = {"open_primary_news": 20, "workers": [{"id": x, "fresh": True} for x in "ABC"]}
        public = {"ok": True, "checked_at": 10000, "last_new_visible_at": supervisor.iso(1000)}
        self.assertIn("PUBLICATION_STALLED", supervisor.publication_alerts(metrics, public, 10000))

    def test_missing_worker_and_unknown_feed_are_not_assumed_healthy(self):
        alerts = supervisor.publication_alerts({"open_primary_news": 1}, {}, 10000)
        self.assertIn("EDITORIAL_WORKER_STALE", alerts)
        self.assertIn("PUBLIC_FEED_UNVERIFIED", alerts)

    def test_queue_metrics_exclude_rejected_and_personal_items(self):
        import json
        with tempfile.TemporaryDirectory() as temp:
            directory = Path(temp)
            with sqlite3.connect(directory / 'queue.sqlite') as db:
                db.executescript('CREATE TABLE jobs(body TEXT); CREATE TABLE observations(key TEXT, body TEXT); '
                                 'CREATE TABLE editorial_reviews(body TEXT);')
                for kind, status, ack in [('new_story','queued',None), ('new_story','quarantined',None),
                                          ('editorial_request','queued',None), ('new_story','acknowledged',{'status':'imported'})]:
                    db.execute('INSERT INTO jobs VALUES (?)', (json.dumps({'input':{'job_type':kind},'status':status,
                               'ack':ack,'completed_at':supervisor.iso(9000) if ack else None}),))
            result = supervisor.journal_metrics(directory, 10000)
            self.assertEqual(result['open_primary_news'], 1)
            self.assertEqual(result['imported_primary_news_last_hour'], 1)
            self.assertEqual(result['open_editorial_requests'], 1)
            self.assertEqual(result['ready_for_final_approval'], 0)

    def test_editorial_delivery_is_not_hidden_by_fresh_news(self):
        metrics = {'open_editorial_requests': 2, 'oldest_editorial_request_at': supervisor.iso(1000),
                   'ready_for_final_approval': 0, 'workers': [{'id': x, 'fresh': True} for x in 'ABC']}
        public = {'ok': True, 'checked_at': 10000, 'latest_news_published_at': supervisor.iso(9990)}
        alerts = supervisor.publication_alerts(metrics, public, 10000)
        self.assertIn('EDITORIAL_DELIVERY_STALLED', alerts)
        self.assertIn('APPROVAL_QUEUE_EMPTY_WITH_PENDING_WORK', alerts)

    def test_new_request_gets_processing_time_and_awaiting_owner_is_not_failure(self):
        public = {'ok': True, 'checked_at': 10000}
        workers = [{'id': x, 'fresh': True} for x in 'ABC']
        metrics = {'open_editorial_requests': 1, 'oldest_editorial_request_at': supervisor.iso(9500),
                   'ready_for_final_approval': 0, 'workers': workers}
        self.assertEqual(supervisor.publication_alerts(metrics, public, 10000), [])
        self.assertEqual(supervisor.publication_alerts({'ready_for_final_approval': 5}, public, 10000), [])

    def test_second_pass_stall_is_visible_without_news_jobs(self):
        metrics = {'open_semantic_reviews': 1, 'oldest_semantic_review_at': supervisor.iso(1000)}
        alerts = supervisor.publication_alerts(metrics, {'ok': True, 'checked_at': 10000}, 10000)
        self.assertIn('SECOND_PASS_STALLED', alerts)
        self.assertIn('EDITORIAL_WORKER_STALE', alerts)

    def test_delivery_metrics_separate_research_holds_repairs_and_actual_previews(self):
        import json
        with tempfile.TemporaryDirectory() as temp:
            directory = Path(temp)
            with sqlite3.connect(directory / 'queue.sqlite') as db:
                db.executescript('CREATE TABLE jobs(body TEXT); CREATE TABLE observations(key TEXT, body TEXT); '
                                 'CREATE TABLE editorial_reviews(body TEXT);')
                for kind, status, accepted in [('editorial_request', 'correction_pending', None),
                                               ('editorial_request', 'accepted', {'decision': 'hold'}),
                                               ('editorial_request', 'accepted', {'staged': True}),
                                               ('impact_semantic_review', 'queued', None)]:
                    db.execute('INSERT INTO jobs VALUES (?)', (json.dumps({'input': {'job_type': kind,
                               'created_at': supervisor.iso(1000)}, 'status': status, 'accepted': accepted}),))
                for status in ['AWAITING_FINAL_APPROVAL', 'PUBLISHED', 'SKIPPED']:
                    db.execute('INSERT INTO editorial_reviews VALUES (?)', (json.dumps({'status': status}),))
            result = supervisor.journal_metrics(directory, 10000)
            self.assertEqual(result['open_editorial_requests'], 1)
            self.assertEqual(result['editorial_requests_needing_repair'], 1)
            self.assertEqual(result['ready_for_final_approval'], 1)
            self.assertEqual(result['open_semantic_reviews'], 1)

    def test_api_health_does_not_hide_stalled_publication_or_personal_queue(self):
        metrics = {'open_primary_news': 20, 'api_processor': {'enabled': True, 'fresh': True,
                   'status': 'RUN_COMPLETED', 'news_only': True}}
        public = {'ok': True, 'checked_at': 10000, 'last_new_visible_at': supervisor.iso(1000)}
        alerts = supervisor.publication_alerts(metrics, public, 10000)
        self.assertNotIn('EDITORIAL_WORKER_STALE', alerts)
        self.assertIn('PUBLICATION_STALLED', alerts)
        metrics['open_editorial_requests'] = 1
        self.assertIn('EDITORIAL_WORKER_STALE', supervisor.publication_alerts(metrics, public, 10000))
        metrics['api_processor']['status'] = 'ATTENTION'
        self.assertIn('API_PROCESSOR_ATTENTION', supervisor.publication_alerts(metrics, public, 10000))

    def test_failed_restart_timeout_returns_failure(self):
        import subprocess
        with patch.object(supervisor.subprocess, 'run', side_effect=subprocess.TimeoutExpired('systemctl', 20)):
            self.assertFalse(supervisor.service_command('stop', 'woek-news-bridge.service', 20))

    def test_visibility_baseline_is_not_a_batch_of_new_publications(self):
        item = {'url': 'https://wirkungsoekonomie.de/wirkungsticker/example-one/',
                '_woek_type': 'Wirkungsakte', 'date_published': supervisor.iso(9000)}
        first = supervisor.observe_public_feed([item], {}, 10000)
        self.assertEqual(first['new_visible_last_hour'], 0)
        self.assertIsNone(first['last_new_visible_at'])
        self.assertIn('PUBLICATION_OBSERVATION_WARMUP', supervisor.publication_alerts(
            {'open_primary_news': 1}, first, 10000))
        revised = {**item, 'title': 'Corrected headline', 'date_modified': supervisor.iso(11000)}
        second = supervisor.observe_public_feed([revised], first, 11000)
        self.assertEqual(second['new_visible_last_hour'], 0)

    def test_new_visibility_and_old_source_are_separate_signals(self):
        old = {'url': 'https://wirkungsoekonomie.de/wirkungsticker/example-one/',
               '_woek_type': 'Wirkungsakte', 'date_published': supervisor.iso(1000)}
        first = supervisor.observe_public_feed([old], {}, 10000)
        new = {**old, 'url': 'https://wirkungsoekonomie.de/wirkungsticker/example-two/'}
        second = supervisor.observe_public_feed([old, new], first, 11000)
        self.assertEqual(second['new_visible_last_hour'], 1)
        alerts = supervisor.publication_alerts({'open_primary_news': 1}, second, 11000)
        self.assertNotIn('PUBLICATION_STALLED', alerts)
        self.assertIn('NEWS_SOURCE_STALE', alerts)
        third = supervisor.observe_public_feed([new], second, 11100)
        fourth = supervisor.observe_public_feed([old, new], third, 11200)
        self.assertEqual(fourth['new_visible_last_hour'], 1)
        later = supervisor.observe_public_feed([old, new], fourth, 17000)
        self.assertEqual(later['new_visible_last_hour'], 0)
        self.assertIn('PUBLICATION_STALLED', supervisor.publication_alerts({'open_primary_news': 1}, later, 17000))

    def test_editorials_external_urls_and_future_source_dates_do_not_fake_current_news(self):
        base = {'url': 'https://wirkungsoekonomie.de/wirkungsticker/example-one/',
                '_woek_type': 'Wirkungsakte', 'date_published': supervisor.iso(30000)}
        first = supervisor.observe_public_feed([], {}, 10000)
        seen = supervisor.observe_public_feed([base, {**base, '_woek_type': 'Analyse'},
                    {**base, 'url': 'https://example.org/wirkungsticker/fake/'}], first, 11000)
        self.assertEqual(seen['new_visible_last_hour'], 1)
        self.assertEqual(seen['current_new_visible_last_hour'], 0)
        self.assertIsNone(seen['latest_source_at'])

    def test_publishing_articles_does_not_hide_missing_or_empty_mpd_profiles(self):
        base = {'url': 'https://wirkungsoekonomie.de/wirkungsticker/example/', 'date_published': supervisor.iso(10000)}
        empty = {key: {'magnitude': None, 'direction': 'open', 'status': 'potential'} for key in ('human', 'planet', 'democracy')}
        values = [{**base, '_woek_impact_profile': empty},
                  {**base, 'url': base['url'] + 'two', '_woek_impact_profile': empty},
                  {**base, 'url': base['url'] + 'three', '_woek_impact_profile': None}]
        result = supervisor.observe_impact_profiles(values)
        self.assertEqual(len(result['all_open_profiles']), 2)
        self.assertEqual(len(result['missing_profiles']), 1)
        alerts = supervisor.publication_alerts({}, {'ok': True, 'checked_at': 10000, 'impact_quality': result}, 10000)
        self.assertIn('POTENTIAL_ASSESSMENT_REVIEW_REQUIRED', alerts)
        self.assertIn('PUBLIC_MPD_PROFILE_MISSING', alerts)

    def test_individual_open_dimension_and_zero_are_not_a_profile_failure(self):
        profile = {'human': {'magnitude': 3}, 'planet': {'magnitude': None}, 'democracy': {'magnitude': 0}}
        result = supervisor.observe_impact_profiles([{'url': 'example', '_woek_impact_profile': profile}])
        self.assertEqual(result['all_open_profiles'], [])
        self.assertEqual(result['missing_profiles'], [])
        self.assertFalse(supervisor.observe_impact_profiles([{'url': 'legacy'}])['available'])


if __name__ == '__main__':
    unittest.main()
