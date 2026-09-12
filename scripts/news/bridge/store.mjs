import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { recordProcessorThroughput } from './processor.mjs';

// One authoritative private SQLite database on the existing Oracle host.
// A separate SQLite write lock is held for the complete run: no expiring lease
// can admit a second writer while the first worker is still executing.
export class BridgeStore {
  constructor(file, { lane = 'global' } = {}) {
    if (!path.isAbsolute(file)) throw new Error('BRIDGE_DB_ABSOLUTE_PATH_REQUIRED');
    if (!['global','discovery','import','intake'].includes(lane)) throw new Error('BRIDGE_LANE_INVALID');
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
    try {
      if (!['discovery','import','combined','test'].includes(phase) || !Number.isFinite(Date.parse(now))) throw new Error('BRIDGE_SLOT_INVALID');
      const interval = phase === 'discovery' ? 900000 : phase === 'test' ? 3600000 : 300000;
      const offset = phase === 'discovery' ? 300000 : 0;
      this.slot = `v2:${phase}:${Math.floor((Date.parse(now) - offset) / interval)}`;
      if (manualRunId !== null) {
        if (!/^\d{1,20}:\d{1,5}$/.test(manualRunId)) throw new Error('BRIDGE_MANUAL_RUN_INVALID');
        this.slot = `manual:${phase}:${manualRunId}`;
      }
      if (this.db.prepare('SELECT status FROM slots WHERE slot=?').get(this.slot)?.status === 'completed') {
        throw new Error('BRIDGE_SLOT_ALREADY_COMPLETED');
      }
      this.db.prepare("INSERT INTO slots VALUES (?, 'running') ON CONFLICT(slot) DO UPDATE SET status='running'").run(this.slot);
    } catch (error) {
      // Slot bookkeeping uses the shared journal, while lane ownership lives in
      // a separate connection. A journal error must not strand that lane lock.
      try { this.lock.exec('ROLLBACK'); } finally { this.locked = false; this.slot = null; }
      throw error;
    }
  }
  release(success) {
    if (!this.locked) return;
    try {
      this.db.prepare('UPDATE slots SET status=? WHERE slot=?').run(success ? 'completed' : 'failed', this.slot);
    } finally {
      // Keep the journal failure visible, but always release the process lock.
      try { this.lock.exec('ROLLBACK'); } finally { this.locked = false; }
    }
  }
  get(id) { const row = this.db.prepare('SELECT body FROM jobs WHERE id=?').get(id); return row ? JSON.parse(row.body) : null; }
  put(job) {
    const existing = this.get(job.input.job_id);
    if (existing?.staging && !job.staging) job = { ...job, staging: existing.staging };
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('INSERT INTO jobs VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').run(job.input.job_id, JSON.stringify(job));
      if (!existing || job.completed_at && !existing.completed_at) {
        this.observe('processor-throughput', recordProcessorThroughput(this.observation('processor-throughput'), existing, job, new Date().toISOString()));
      }
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
  all(page) {
    const select = "SELECT id, json_remove(body,'$.staging') AS body FROM jobs WHERE json_extract(body,'$.archived_at') IS NULL";
    if (page === undefined) return this.db.prepare(select + ' ORDER BY id').all().map(row => JSON.parse(row.body));
    if (!page || !Number.isInteger(page.page_size) || page.page_size < 1 || page.page_size > 20
      || typeof page.after !== 'string' || page.after.length > 180) throw Error('BRIDGE_QUEUE_PAGE_INVALID');
    const rows = this.db.prepare(select + ' AND id > ? ORDER BY id LIMIT ?').all(page.after, page.page_size + 1);
    const visible = rows.slice(0, page.page_size);
    return { page_version: 1, items: visible.map(row => JSON.parse(row.body)),
      next_cursor: rows.length > page.page_size ? visible.at(-1).id : null };
  }
  impactStagingIndex() {
    return this.db.prepare("SELECT id, json_extract(body,'$.staging.impact_record_hash') AS record_hash FROM jobs WHERE json_extract(body,'$.input.job_type')='impact_reassessment' AND json_extract(body,'$.staging.impact_record.impact_assessment.version')='2.1' AND json_extract(body,'$.accepted.decision')='publish' ORDER BY id").all();
  }
  observe(key, value) { this.db.prepare('INSERT INTO observations VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET body=excluded.body').run(key, JSON.stringify(value)); }
  observation(key) { const row = this.db.prepare('SELECT body FROM observations WHERE key=?').get(key); return row ? JSON.parse(row.body) : null; }
  close() { this.release(false); this.lock.close(); this.db.close(); }
}
