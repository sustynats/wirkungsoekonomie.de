#!/usr/bin/env python3
"""Small Oracle supervisor. Never edits an article, claim, approval or queue row."""
import contextlib
import datetime as dt
import fcntl
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import time
import urllib.error
import urllib.request

VERSION = "2026-09-12-1"
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
    workers = [{"id": worker.get("id"), "fresh": worker.get("processor_available") is True
                and 0 <= now - timestamp(worker.get("checked_at")) < 5400}
               for worker in health.get("workers", [])]
    return {"open_primary_news": open_count, "last_import_ack": latest,
            "imported_primary_news_last_hour": imported or 0, "workers": workers}


def fetch_public_feed(now):
    request = urllib.request.Request(PUBLIC_FEED, headers={"User-Agent": "WOeK-Operations/1.0"})
    with urllib.request.urlopen(request, timeout=5) as response:
        raw = response.read(2 * 1024 * 1024 + 1)
    if len(raw) > 2 * 1024 * 1024:
        raise ValueError("PUBLIC_FEED_SIZE_LIMIT")
    items = [item for item in json.loads(raw).get("items", []) if item.get("_woek_type") == "Wirkungsakte"]
    dates = [timestamp(item.get("date_published")) for item in items]
    return {"checked_at": now, "ok": True, "latest_news_published_at": iso(max(dates)) if dates else None,
            "visible_news_published_last_hour": sum(0 <= now - date < 3600 for date in dates),
            "latest_news_url": max(items, key=lambda x: timestamp(x.get("date_published"))).get("url") if items else None}


def publication_alerts(metrics, public, now):
    alerts = []
    if not public.get("ok") or now - public.get("checked_at", 0) > 600:
        alerts.append("PUBLIC_FEED_UNVERIFIED")
    if metrics.get("open_primary_news", 0):
        if len(metrics.get("workers", [])) != 3 or not all(w["fresh"] for w in metrics.get("workers", [])):
            alerts.append("EDITORIAL_WORKER_STALE")
        latest = timestamp(public.get("latest_news_published_at"))
        if public.get("ok") and (not latest or now - latest > 5400):
            alerts.append("PUBLICATION_STALLED")
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
                public = fetch_public_feed(now)
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
        write_private(state_file, result)
        print(json.dumps({"status": result["status"], "alerts": result["alerts"], "actions": result["actions"]}))


if __name__ == "__main__":
    run()
