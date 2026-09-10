import fs from "node:fs";
import { scheduledSlot } from "./lib.mjs";
import { processingMode } from './processing-mode.mjs';

const now = process.env.WOEK_NEWS_NOW ? new Date(process.env.WOEK_NEWS_NOW) : new Date();
if (!Number.isFinite(now.getTime())) throw new Error("INVALID_RUN_TIME");

const schedule = scheduledSlot(now);
const forced = process.env.GITHUB_EVENT_NAME === "workflow_dispatch" || process.argv.includes("--force");
const automated = process.env.GITHUB_EVENT_NAME === "schedule"
  || (process.env.GITHUB_EVENT_NAME === "push" && ['refs/heads/codex/wirkungsticker-clock','refs/heads/codex/wirkungsticker-import-clock'].includes(process.env.GITHUB_REF));
// GitHub darf Zeitpläne verzögert starten. Ein geplanter Lauf wird deshalb nie
// wegen der tatsächlichen Startminute verworfen.
const shouldRun = forced || automated || Boolean(schedule.slot);
const output = {
  should_run: String(shouldRun),
  slot: schedule.slot || (automated ? `Automatischer Lauf ${String(schedule.hourNumber).padStart(2, "0")}:00` : forced ? "Manueller Lauf" : "kein Berliner Zeitslot"),
  berlin_date: schedule.isoDate,
  berlin_hour: String(schedule.hourNumber),
};

if (processingMode() === 'dropbox_chatgpt_bridge' && shouldRun) {
  const phase = process.env.WOEK_NEWS_BRIDGE_PHASE || 'import';
  const { bridgeSession } = await import('./bridge/remote.mjs');
  try {
    const session = bridgeSession();
    const status = phase === 'import' ? await session.status() : null;
    if (status && !status.ready.length) {
      output.should_run = 'false'; output.bridge_status = 'PROCESSING_PENDING';
    } else {
    await session.store.acquire(now.toISOString(), phase, { manualRunId: forced ? `${process.env.GITHUB_RUN_ID}:${process.env.GITHUB_RUN_ATTEMPT || '1'}` : null });
    output.slot = `Dropbox Bridge ${phase} ${now.toISOString().slice(0, 13)}`;
    output.bridge_phase = phase;
    output.bridge_acquired = 'true';
    if (process.env.GITHUB_ENV) fs.appendFileSync(process.env.GITHUB_ENV, `WOEK_NEWS_BRIDGE_PHASE=${phase}\n`);
    await session.store.observe(`run:${phase}`, { trigger_type: forced ? 'manual' : 'scheduled', triggered_at: now.toISOString(),
      triggered_by: process.env.GITHUB_ACTOR || 'oracle-clock', run_id: process.env.GITHUB_RUN_ID });
    }
  } catch (error) {
    if (!['BRIDGE_SLOT_ALREADY_COMPLETED','BRIDGE_RUN_LOCKED'].includes(error.message)) throw error;
    output.should_run = 'false'; output.bridge_skipped = error.message;
  }
}

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(output).map(([key, value]) => `${key}=${value}\n`).join(""), "utf8");
}

console.log(JSON.stringify(output, null, 2));
