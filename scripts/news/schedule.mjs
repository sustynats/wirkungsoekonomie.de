import fs from "node:fs";
import { scheduledSlot } from "./lib.mjs";

const now = process.env.WOEK_NEWS_NOW ? new Date(process.env.WOEK_NEWS_NOW) : new Date();
if (!Number.isFinite(now.getTime())) throw new Error("INVALID_RUN_TIME");

const schedule = scheduledSlot(now);
const forced = process.env.GITHUB_EVENT_NAME === "workflow_dispatch" || process.argv.includes("--force");
const automated = process.env.GITHUB_EVENT_NAME === "schedule";
// GitHub darf Zeitpläne verzögert starten. Ein geplanter Lauf wird deshalb nie
// wegen der tatsächlichen Startminute verworfen.
const shouldRun = forced || automated || Boolean(schedule.slot);
const output = {
  should_run: String(shouldRun),
  slot: schedule.slot || (automated ? `Automatischer Lauf ${String(schedule.hourNumber).padStart(2, "0")}:00` : forced ? "Manueller Lauf" : "kein Berliner Zeitslot"),
  berlin_date: schedule.isoDate,
  berlin_hour: String(schedule.hourNumber),
};

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(output).map(([key, value]) => `${key}=${value}\n`).join(""), "utf8");
}

console.log(JSON.stringify(output, null, 2));
