import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// One authoritative private SQLite database on the existing Oracle host.
// A separate SQLite write lock is held for the complete run: no expiring lease
// can admit a second writer while the first worker is still executing.
export class BridgeStore {
  constructor(file, { lane = 'global' } = {}) {
    if (!path.isAbsolute(file)) throw new Error('BRIDGE_DB_ABSOLUTE_PATH_REQUIRED');
    if (!['global','discovery','import'].includes(lane)) throw new Error('BRIDGE_LANE_INVALID');
    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(file);
    fs.chmodSync(file, 0o600);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, body TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS slots (slot TEXT PRIMARY KEY, status TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS observations (key TEXT PRIMARY KEY, body TEXT NOT NULL);`);
    const lockFile = `${file}.${lane}.lock`;
    this.lock = new DatabaseSync(lockFile);
    fs.chmodSync(lockFile, 0o600);
    this.lock.exec('PRAGMA busy_timeout=0; CREATE TABLE IF NOT EXISTS singleton (id INTEGER PRIMARY KEY);');
  }
  acquire(now, phase = 'combined', { manualRunId = null } = {}) {
    try { this.lock.exec('BEGIN IMMEDIATE'); } catch { throw new Error('BRIDGE_RUN_LOCKED'); }
    this.locked = true;
    if (!['discovery','import','combined','test'].includes(phase) || !Number.isFinite(Date.parse(now))) {
      this.lock.exec('ROLLBACK'); this.locked = false; throw new Error('BRIDGE_SLOT_INVALID');
    }
    const interval = phase === 'discovery' ? 900000 : phase === 'test' ? 3600000 : 300000;
    const offset = phase === 'discovery' ? 300000 : 0;
    this.slot = `v2:${phase}:${Math.floor((Date.parse(now) - offset) / interval)}`;
    if (manualRunId !== null) {
      if (!/^\d{1,20}:\d{1,5}$/.test(manualRunId)) { this.lock.exec('ROLLBACK'); this.locked = false; throw new Error('BRIDGE_MANUAL_RUN_INVALID'); }
      this.slot = `manual:${phase}:${manualRunId}`;
    }
    if (this.db.prepare('SELECT status FROM slots WHERE slot=?').get(this.slot)?.status === 'completed') {
      this.lock.exec('ROLLBACK'); this.locked = false; throw new Error('BRIDGE_SLOT_ALREADY_COMPLETED');
    }
    this.db.prepare("INSERT INTO slots VALUES (?, 'running') ON CONFLICT(slot) DO UPDATE SET status='running'").run(this.slot);
  }
  release(success) {
    if (!this.locked) return;
    this.db.prepare('UPDATE slots SET status=? WHERE slot=?').run(success ? 'completed' : 'failed', this.slot);
    this.lock.exec('ROLLBACK'); this.locked = false;
  }
  get(id) { const row = this.db.prepare('SELECT body FROM jobs WHERE id=?').get(id); return row ? JSON.parse(row.body) : null; }
  put(job) {
    const existing = this.get(job.input.job_id);
    if (existing?.staging && !job.staging) job = { ...job, staging: existing.staging };
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('INSERT INTO jobs VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').run(job.input.job_id, JSON.stringify(job));
      if (job.completed_at && !existing?.completed_at) {
        const metrics = this.observation('completion-metrics') || { completed: 0, average_queue_minutes: 0, last_publication_at: null };
        metrics.average_queue_minutes = (metrics.average_queue_minutes * metrics.completed + (Date.parse(job.completed_at) - Date.parse(job.created_at)) / 60000) / (metrics.completed + 1);
        metrics.completed++;
        metrics.output_detected_at = job.output_detected_at || null;
        metrics.output_imported_at = job.output_imported_at || null;
        metrics.processing_latency = job.processing_latency ?? null;
        metrics.import_pickup_latency = job.import_pickup_latency ?? null;
        if (job.ack?.status === 'imported') metrics.last_publication_at = job.completed_at;
        this.observe('completion-metrics', metrics);
      }
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  all() { return this.db.prepare("SELECT body FROM jobs WHERE json_extract(body,'$.archived_at') IS NULL ORDER BY id").all().map(row => { const job = JSON.parse(row.body); delete job.staging; return job; }); }
  observe(key, value) { this.db.prepare('INSERT INTO observations VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET body=excluded.body').run(key, JSON.stringify(value)); }
  observation(key) { const row = this.db.prepare('SELECT body FROM observations WHERE key=?').get(key); return row ? JSON.parse(row.body) : null; }
  close() { this.release(false); this.lock.close(); this.db.close(); }
}
