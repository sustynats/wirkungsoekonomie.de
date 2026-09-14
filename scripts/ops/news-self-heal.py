#!/usr/bin/env python3
"""Small Oracle supervisor. Never edits an article, claim, approval or queue row."""
import contextlib
import datetime as dt
import fcntl
import json
import os
import re
from pathlib import Path
import sqlite3
import subprocess
import time
import urllib.error
import urllib.request

VERSION = "2026-09-14-visibility"
SERVICES = {"bridge": ("woek-news-bridge.service", 8786, "/api/news-bridge", 401),
            "editorial": ("woek-news-editorial.service", 8788, "/internal/status", 200)}
DIRECTORY = Path("/var/lib/woek-news-bridge")
PUBLIC_FEED = "https://wirkungsoekonomie.de/wirkungsticker/feed.json"


def iso(timestamp):
    return dt.datetime.fromtimestamp(timestamp, dt.timezone.utc).isoformat()


def timestamp(value):
    try:
        return dt.datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
    except (ValueError, TypeError, AttributeError):
        return 0


def decision(previous, healthy, now, *, locked=False):
    """Three failed probes, idle lanes and at most three repairs/hour."""
    attempts = [x for x in previous.get("repairs", []) if 0 <= now - x < 3600]
    failures = 0 if healthy else previous.get("failures", 0) + 1
    action = "none"
    if failures >= 3:
        action = "defer_active_lane" if locked else "restart"
        if len(attempts) >= 3 or attempts and now - attempts[-1] < 600:
            action = "cooldown"
    return {"failures": failures, "repairs": attempts, "action": action}


def probe(port, route, expected):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}{route}", timeout=3) as response:
            return response.status == expected
    except urllib.error.HTTPError as error:
        return error.code == expected
    except (OSError, TimeoutError):
        return False


def service_command(action, service, timeout):
    try:
        return subprocess.run(["systemctl", action, service], timeout=timeout, check=False).returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        return False


@contextlib.contextmanager
def idle_lanes(directory):
    """Actual SQLite locks, not age-based assumptions about another writer."""
    connections = []
    available = False
    try:
        for lane in ("discovery", "import"):
            file = directory / f"queue.sqlite.{lane}.lock"
            connection = sqlite3.connect(f"file:{file}?mode=rw", uri=True, timeout=0)
            connections.append(connection)
            connection.execute("BEGIN IMMEDIATE")
        available = True
    except sqlite3.OperationalError:
        pass
    try:
        yield available
    finally:
        for connection in connections:
            connection.rollback()
            connection.close()


def journal_metrics(directory, now):
    # Aggregate in SQLite. Never load the complete queue or staged manuscripts.
    with sqlite3.connect(f"file:{directory / 'queue.sqlite'}?mode=ro", uri=True, timeout=2) as db:
        primary = "json_extract(body,'$.input.job_type') IN ('new_story','story_update')"
        open_count = db.execute("SELECT count(*) FROM jobs WHERE " + primary +
                                " AND json_extract(body,'$.ack') IS NULL AND "
                                "coalesce(json_extract(body,'$.status'),'') NOT IN "
                                "('acknowledged','quarantined','archive_failed')").fetchone()[0]
        latest, imported = db.execute("SELECT max(json_extract(body,'$.completed_at')), "
                                     "sum(CASE WHEN json_extract(body,'$.completed_at')>=? THEN 1 ELSE 0 END) "
                                     "FROM jobs WHERE " + primary +
                                     " AND json_extract(body,'$.ack.status')='imported'", (iso(now - 3600),)).fetchone()
        row = db.execute("SELECT body FROM observations WHERE key='processor-health'").fetchone()
        health = json.loads(row[0]) if row else {}
        api_row = db.execute("SELECT body FROM observations WHERE key='api-processor-health'").fetchone()
        api_health = json.loads(api_row[0]) if api_row else {}
        api_config_file = directory / 'api-processor-config.json'
        api_config = json.loads(api_config_file.read_text()) if api_config_file.exists() else {}
        # Personal requests are a separate delivery lane. A healthy news import
        # says nothing about whether Natalie has received a reviewable preview.
        editorial = db.execute("SELECT count(*), min(json_extract(body,'$.input.created_at')), "
                               "sum(CASE WHEN json_extract(body,'$.status') IN "
                               "('correction_pending','correction_prepared','quarantined') THEN 1 ELSE 0 END) "
                               "FROM jobs WHERE json_extract(body,'$.input.job_type')='editorial_request' "
                               "AND json_extract(body,'$.ack') IS NULL AND json_extract(body,'$.accepted') IS NULL "
                               "AND coalesce(json_extract(body,'$.status'),'') NOT IN ('acknowledged','archive_failed')").fetchone()
        semantic = db.execute("SELECT count(*), min(json_extract(body,'$.input.created_at')) "
                              "FROM jobs WHERE json_extract(body,'$.input.job_type')='impact_semantic_review' "
                              "AND json_extract(body,'$.ack') IS NULL AND json_extract(body,'$.accepted') IS NULL "
                              "AND coalesce(json_extract(body,'$.status'),'') NOT IN ('acknowledged','archive_failed')").fetchone()
        ready = db.execute("SELECT count(*) FROM editorial_reviews "
                           "WHERE json_extract(body,'$.status')='AWAITING_FINAL_APPROVAL'").fetchone()[0]
    workers = [{"id": worker.get("id"), "fresh": worker.get("processor_available") is True
                and 0 <= now - timestamp(worker.get("checked_at")) < 5400}
               for worker in health.get("workers", [])]
    return {"open_primary_news": open_count, "last_import_ack": latest,
            "imported_primary_news_last_hour": imported or 0, "workers": workers,
            "api_processor": {"enabled": api_config.get('enabled') is True,
                              "news_only": api_config.get('news_only') is True,
                              "fresh": api_health.get('actor') == 'oracle_api' and
                              0 <= now - timestamp(api_health.get('at')) < 1800,
                              "status": api_health.get('status'), "at": api_health.get('at'),
                              "delivered": api_health.get('delivered', 0)},
            "open_editorial_requests": editorial[0], "oldest_editorial_request_at": editorial[1],
            "editorial_requests_needing_repair": editorial[2] or 0,
            "ready_for_final_approval": ready,
            "open_semantic_reviews": semantic[0], "oldest_semantic_review_at": semantic[1]}


def observe_public_feed(items, previous, now):
    """First public visibility is independent of the article's source date."""
    baseline = not isinstance(previous.get("observed_urls"), dict)
    entries = dict(previous.get("observed_urls") or {})
    started = previous.get("visibility_started_at") if not baseline else iso(now)
    last_new = previous.get("last_new_visible_at") if not baseline else None
    news = [item for item in items if item.get("_woek_type") == "Wirkungsakte"
            and re.fullmatch(r"https://wirkungsoekonomie\.de/wirkungsticker/[a-z0-9-]+/", item.get("url", ""))]
    for item in news:
        url = item["url"]
        if url not in entries:
            entries[url] = {"first_seen_at": None if baseline else iso(now),
                            "source_at": item.get("date_published")}
            if not baseline:
                last_new = iso(now)
    dates = [timestamp(item.get("date_published")) for item in news]
    valid_dates = [date for date in dates if 0 < date <= now]
    latest_source = iso(max(valid_dates)) if valid_dates else None
    recent = [entry for entry in entries.values() if entry.get("first_seen_at")
              and 0 <= now - timestamp(entry["first_seen_at"]) < 3600]
    return {"checked_at": now, "ok": True, "observed_urls": entries,
            "visibility_started_at": started, "last_new_visible_at": last_new,
            "new_visible_last_hour": len(recent),
            "current_new_visible_last_hour": sum(0 <= now - timestamp(entry.get("source_at")) <= 21600
                                                  for entry in recent),
            "latest_source_at": latest_source,
            "latest_news_url": max(news, key=lambda x: timestamp(x.get("date_published"))).get("url") if news else None}


def fetch_public_feed(now, previous=None):
    request = urllib.request.Request(PUBLIC_FEED, headers={"User-Agent": "WOeK-Operations/1.0"})
    with urllib.request.urlopen(request, timeout=5) as response:
        raw = response.read(2 * 1024 * 1024 + 1)
    if len(raw) > 2 * 1024 * 1024:
        raise ValueError("PUBLIC_FEED_SIZE_LIMIT")
    feed = json.loads(raw)
    if not isinstance(feed.get("items"), list):
        raise ValueError("PUBLIC_FEED_ITEMS_INVALID")
    return observe_public_feed(feed["items"], previous or {}, now)


def publication_alerts(metrics, public, now):
    alerts = []
    if not public.get("ok") or now - public.get("checked_at", 0) > 600:
        alerts.append("PUBLIC_FEED_UNVERIFIED")
    if any(metrics.get(key, 0) for key in ("open_primary_news", "open_editorial_requests", "open_semantic_reviews")):
        api = metrics.get('api_processor', {})
        api_covers_work = api.get('enabled') and api.get('fresh') and api.get('status') == 'RUN_COMPLETED'
        if metrics.get('open_editorial_requests') and api.get('news_only'):
            api_covers_work = False
        if not api_covers_work and (len(metrics.get("workers", [])) != 3 or not all(w["fresh"] for w in metrics.get("workers", []))):
            alerts.append("EDITORIAL_WORKER_STALE")
        if api.get('enabled') and api.get('status') == 'ATTENTION':
            alerts.append('API_PROCESSOR_ATTENTION')
    if metrics.get("open_primary_news", 0):
        if public.get("ok"):
            last_new = timestamp(public.get("last_new_visible_at"))
            started = timestamp(public.get("visibility_started_at"))
            if (last_new or started) and now - (last_new or started) > 5400:
                alerts.append("PUBLICATION_STALLED")
            elif not last_new:
                alerts.append("PUBLICATION_OBSERVATION_WARMUP")
            source_at = timestamp(public.get("latest_source_at"))
            if source_at and now - source_at > 5400:
                alerts.append("NEWS_SOURCE_STALE")
    # Pending author decisions are not processor failures. Only unfinished work
    # upstream of the approval screen contributes to these stall alerts.
    for count, oldest, alert in (("open_editorial_requests", "oldest_editorial_request_at", "EDITORIAL_DELIVERY_STALLED"),
                                  ("open_semantic_reviews", "oldest_semantic_review_at", "SECOND_PASS_STALLED")):
        if metrics.get(count, 0):
            started = timestamp(metrics.get(oldest))
            if not started or now - started > 5400:
                alerts.append(alert)
    if "EDITORIAL_DELIVERY_STALLED" in alerts and metrics.get("ready_for_final_approval") == 0:
        alerts.append("APPROVAL_QUEUE_EMPTY_WITH_PENDING_WORK")
    return alerts


def write_private(file, value):
    temporary = file.with_suffix(".tmp")
    descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(descriptor, "w") as output:
        json.dump(value, output, ensure_ascii=False, indent=2)
        output.flush()
        os.fsync(output.fileno())
    os.replace(temporary, file)


def run(directory=DIRECTORY):
    state_dir = directory / "self-heal"
    state_dir.mkdir(mode=0o700, exist_ok=True)
    os.chmod(state_dir, 0o700)
    with (state_dir / "run.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        now = time.time()
        state_file = state_dir / "status.json"
        previous = json.loads(state_file.read_text()) if state_file.exists() else {}
        result = {"version": VERSION, "checked_at": iso(now), "services": {}, "actions": []}
        for key, (service, port, route, expected) in SERVICES.items():
            healthy = probe(port, route, expected)
            status = decision(previous.get("services", {}).get(key, {}), healthy, now)
            if status["action"] == "restart":
                with idle_lanes(directory) as idle:
                    status = decision(previous.get("services", {}).get(key, {}), healthy, now, locked=not idle)
                    if idle:
                        # Lane locks stay held until the old process has stopped.
                        # No claim/owner record is changed or expired.
                        status["repairs"].append(now)
                        # Persist the attempt before the side effect, including
                        # timeouts/crashes, so an unsuccessful restart is bounded.
                        recovery_state = {**previous, "services": {**previous.get("services", {}),
                                          **result["services"], key: status}}
                        write_private(state_file, recovery_state)
                        stopped = service_command("stop", service, 20)
                if idle and stopped:
                    started = service_command("start", service, 15)
                    healthy = started and probe(port, route, expected)
                    result["actions"].append({"service": key, "action": "restart", "probe_ok": healthy})
            status["probe_ok"] = healthy
            result["services"][key] = status
        try:
            result["metrics"] = journal_metrics(directory, now)
        except (sqlite3.Error, ValueError):
            result["metrics"] = {"error": "JOURNAL_READ_UNAVAILABLE"}
        public = previous.get("public", {})
        if now - public.get("checked_at", 0) >= 300:
            try:
                public = fetch_public_feed(now, public)
            except (OSError, ValueError, TimeoutError):
                public = {**public, "checked_at": now, "ok": False}
        result["public"] = public
        result["alerts"] = publication_alerts(result["metrics"], public, now)
        if "error" in result["metrics"]:
            result["alerts"].append(result["metrics"]["error"])
        if any(not s["probe_ok"] for s in result["services"].values()):
            result["alerts"].append("SERVICE_UNAVAILABLE")
        # Wake only the existing output detector, which dispatches an import
        # only for real ready outputs. No analysis, approval or budget bypass.
        result["last_poll_wakeup"] = previous.get("last_poll_wakeup", 0)
        if "PUBLICATION_STALLED" in result["alerts"] and now - result["last_poll_wakeup"] >= 600:
            result["last_poll_wakeup"] = now
            write_private(state_file, result)
            subprocess.run(["systemctl", "start", "--no-block", "woek-news-bridge-poll.service"], timeout=5, check=True)
            result["actions"].append({"action": "wake_existing_output_detector"})
        result["status"] = "ATTENTION" if result["alerts"] else "OK"
        # Only an explicitly enabled production timer authorizes this recovery.
        # Never activate a pilot, repeat an in-flight generation, remove a lock,
        # approve content, change budgets or silently replace an unknown output.
        result['last_api_wakeup'] = previous.get('last_api_wakeup', 0)
        api = result['metrics'].get('api_processor', {})
        if api.get('enabled') and not api.get('fresh') and now - result['last_api_wakeup'] >= 600:
            if service_command('is-enabled', 'woek-news-api-processor.timer', 5):
                result['last_api_wakeup'] = now
                write_private(state_file, result)
                subprocess.run(['systemctl', 'start', '--no-block', 'woek-news-api-processor.service'], timeout=5, check=True)
                result['actions'].append({'action': 'wake_enabled_api_processor'})
        write_private(state_file, result)
        print(json.dumps({"status": result["status"], "alerts": result["alerts"], "actions": result["actions"]}))


if __name__ == "__main__":
    run()
