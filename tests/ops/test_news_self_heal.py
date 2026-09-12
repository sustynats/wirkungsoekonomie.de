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
        public = {"ok": True, "checked_at": 10000, "latest_news_published_at": supervisor.iso(1000)}
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
                db.executescript('CREATE TABLE jobs(body TEXT); CREATE TABLE observations(key TEXT, body TEXT);')
                for kind, status, ack in [('new_story','queued',None), ('new_story','quarantined',None),
                                          ('editorial_request','queued',None), ('new_story','acknowledged',{'status':'imported'})]:
                    db.execute('INSERT INTO jobs VALUES (?)', (json.dumps({'input':{'job_type':kind},'status':status,
                               'ack':ack,'completed_at':supervisor.iso(9000) if ack else None}),))
            result = supervisor.journal_metrics(directory, 10000)
            self.assertEqual(result['open_primary_news'], 1)
            self.assertEqual(result['imported_primary_news_last_hour'], 1)

    def test_failed_restart_timeout_returns_failure(self):
        import subprocess
        with patch.object(supervisor.subprocess, 'run', side_effect=subprocess.TimeoutExpired('systemctl', 20)):
            self.assertFalse(supervisor.service_command('stop', 'woek-news-bridge.service', 20))


if __name__ == '__main__':
    unittest.main()
