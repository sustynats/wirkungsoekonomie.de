import fs from "node:fs";
import { scheduledSlot } from "./lib.mjs";
import { processingMode } from './processing-mode.mjs';

const now = process.env.WOEK_NEWS_NOW ? new Date(process.env.WOEK_NEWS_NOW) : new Date();
if (!Number.isFinite(now.getTime())) throw new Error("INVALID_RUN_TIME");

const schedule = scheduledSlot(now);
const forced = process.env.GITHUB_EVENT_NAME === "workflow_dispatch" || process.argv.includes("--force");
const automated = process.env.GITHUB_EVENT_NAME === "schedule"
  || (process.env.GITHUB_EVENT_NAME === "push" && process.env.GITHUB_REF === "refs/heads/codex/wirkungsticker-clock");
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
  const eventSchedule = process.env.GITHUB_EVENT_SCHEDULE;
  const phase = eventSchedule === '45 * * * *' ? 'discovery' : eventSchedule === '30 * * * *' ? 'import'
    : process.env.WOEK_NEWS_BRIDGE_PHASE || (now.getUTCMinutes() >= 45 ? 'discovery' : 'import');
  const { bridgeSession } = await import('./bridge/remote.mjs');
  try {
    await bridgeSession().store.acquire(now.toISOString(), phase);
    output.slot = `Dropbox Bridge ${phase} ${now.toISOString().slice(0, 13)}`;
    output.bridge_phase = phase;
    output.bridge_acquired = 'true';
    if (process.env.GITHUB_ENV) fs.appendFileSync(process.env.GITHUB_ENV, `WOEK_NEWS_BRIDGE_PHASE=${phase}\n`);
  } catch (error) {
    if (!['BRIDGE_SLOT_ALREADY_COMPLETED','BRIDGE_RUN_LOCKED'].includes(error.message)) throw error;
    output.should_run = 'false'; output.bridge_skipped = error.message;
  }
}

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(output).map(([key, value]) => `${key}=${value}\n`).join(""), "utf8");
}

console.log(JSON.stringify(output, null, 2));
