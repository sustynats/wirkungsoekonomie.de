import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

if (process.env.WOEK_AUTOPILOT_RUNTIME_MODE !== "NORMAL") {
  console.log("Election registry sync: recurring writers are disabled.");
  process.exit(0);
}

const appKey = process.env.DROPBOX_APP_KEY;
const appSecret = process.env.DROPBOX_APP_SECRET;
const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
if (!appKey || !appSecret || !refreshToken) throw new Error("Election registry sync: Dropbox credentials are required.");

const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
  method: "POST",
  headers: { authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
});
if (!tokenResponse.ok) throw new Error(`Election registry sync: token refresh failed (${tokenResponse.status}).`);
const { access_token: accessToken } = await tokenResponse.json();
if (!accessToken) throw new Error("Election registry sync: Dropbox returned no access token.");

const response = await fetch("https://content.dropboxapi.com/2/files/download", {
  method: "POST",
  headers: {
    authorization: `Bearer ${accessToken}`,
    "dropbox-api-arg": JSON.stringify({ path: "/WOEK/WOEK-AUTOPILOT/REGISTRIES/election-cycles.json" }),
  },
});
if (!response.ok) throw new Error(`Election registry sync: registry download failed (${response.status}).`);
const remote = await response.json();
if (remote.schema_version !== "1.0" || !Array.isArray(remote.cycles)) throw new Error("Election registry sync: unsupported registry structure.");

const root = process.cwd();
const cyclePath = path.join(root, "data", "autopilot", "election-cycles.json");
const jurisdictionPath = path.join(root, "data", "political-jurisdictions.json");
const schema = JSON.parse(await readFile(path.join(root, "data", "autopilot", "contracts", "election-cycle.schema.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
for (const cycle of remote.cycles) {
  if (!validate(cycle)) throw new Error(`Election registry sync: invalid cycle ${cycle?.election_cycle_id ?? "unknown"}: ${JSON.stringify(validate.errors)}`);
}

const local = JSON.parse(await readFile(cyclePath, "utf8"));
const cycles = [...remote.cycles].sort((left, right) => left.election_date.localeCompare(right.election_date) || left.election_cycle_id.localeCompare(right.election_cycle_id));
const cycleChanged = JSON.stringify(local.cycles) !== JSON.stringify(cycles);
if (cycleChanged) {
  await writeFile(cyclePath, `${JSON.stringify({ schema_version: "1.0", generated_at: remote.generated_at, cycles }, null, 2)}\n`);
}

const stateForStatus = {
  ANNOUNCED: "PRE_ELECTION_WATCH",
  PROGRAMMES_COLLECTING: "PRE_ELECTION_WATCH",
  PROGRAMMES_REVIEW: "PROGRAMME_ANALYSIS",
  ELECTION_COMPLETE: "ELECTION_RESULT",
  COALITION_FORMATION: "COALITION_FORMATION",
  GOVERNMENT_FORMED: "GOVERNMENT_FORMED",
  CLOSED: "CLOSED",
};
const completed = new Set(["ELECTION_COMPLETE", "COALITION_FORMATION", "GOVERNMENT_FORMED", "CLOSED"]);
const jurisdictions = JSON.parse(await readFile(jurisdictionPath, "utf8"));
let jurisdictionChanged = false;
for (const entry of jurisdictions.jurisdictions) {
  if (entry.jurisdiction_type !== "STATE") continue;
  const cycle = cycles.find((candidate) => candidate.jurisdiction_id === entry.jurisdiction_id);
  if (!cycle) continue;
  const resultMonitor = cycle.result_status !== "NOT_AVAILABLE";
  const next = {
    ...entry,
    active_election_cycle_id: cycle.election_cycle_id,
    election_cycle_state: stateForStatus[cycle.status],
    next_election_date: completed.has(cycle.status) ? null : cycle.election_date,
    date_precision: "EXACT",
    source_status: resultMonitor ? "ACTIVE_ELECTION_RESULT_MONITOR_NO_GOVERNMENT_ADAPTER" : "ACTIVE_ELECTION_CALENDAR_NO_GOVERNMENT_ADAPTER",
    source_health: "DEGRADED",
    monitoring_enabled: true,
    operational_adapter_status: resultMonitor ? "ELECTION_RESULT_ONLY" : "ELECTION_CALENDAR_ONLY",
  };
  if (JSON.stringify(next) !== JSON.stringify(entry)) {
    Object.assign(entry, next, { last_election_check: remote.generated_at });
    jurisdictionChanged = true;
  }
}
if (jurisdictionChanged) {
  jurisdictions.as_of = String(remote.generated_at).slice(0, 10);
  await writeFile(jurisdictionPath, `${JSON.stringify(jurisdictions, null, 2)}\n`);
}

console.log(`Election registry sync: ${cycles.length} cycles checked; changed=${cycleChanged || jurisdictionChanged}.`);
