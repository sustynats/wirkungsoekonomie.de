import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

if (process.env.WOEK_AUTOPILOT_RUNTIME_MODE !== "NORMAL") {
  console.log("Government impact sync: bootstrap/remediation mode; the audited repository snapshot is preserved and Dropbox is not read.");
  process.exit(0);
}

const root = process.cwd();
const dataRoot = path.join(root, "data", "government", "impact-cases");
const gates = JSON.parse(await readFile(path.join(dataRoot, "deployment-gates.json"), "utf8"));
const gateKeys = [
  "data_1_2_validation", "known_overmerge_regressions", "public_export", "fach_import",
  "source_vs_view", "semantic_ui", "accessibility", "build", "privacy", "background_automation",
];

if (!gateKeys.every((key) => gates[key] === "PASS")) {
  console.log("Government impact sync: publication gates are not green; the last approved snapshot is preserved.");
  process.exit(0);
}

const appKey = process.env.DROPBOX_APP_KEY;
const appSecret = process.env.DROPBOX_APP_SECRET;
const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
const statePath = (process.env.DROPBOX_GOVERNMENT_INGEST_STATE_PATH ?? "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/technical-ingest").replace(/\/+$/, "");
if (!appKey || !appSecret || !refreshToken) {
  if (process.env.VERCEL_ENV === "production") throw new Error("Government impact sync: Dropbox credentials are missing in Production while publication gates are green.");
  console.log("Government impact sync: no local Dropbox credentials; the fach-approved repository snapshot is preserved.");
  process.exit(0);
}

const tokenBody = new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken });
const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
  method: "POST",
  headers: { authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" },
  body: tokenBody,
});
if (!tokenResponse.ok) throw new Error(`Government impact sync: token refresh failed (${tokenResponse.status}).`);
const { access_token: accessToken } = await tokenResponse.json();
if (!accessToken) throw new Error("Government impact sync: Dropbox returned no access token.");

const stateResponse = await fetch("https://content.dropboxapi.com/2/files/download", {
  method: "POST",
  headers: { authorization: `Bearer ${accessToken}`, "dropbox-api-arg": JSON.stringify({ path: `${statePath}/daily-ingest-state.json` }) },
});
if (stateResponse.status === 409) {
  console.log("Government impact sync: no daily state exists yet; the initial fach-approved release snapshot is preserved.");
  process.exit(0);
}
if (!stateResponse.ok) throw new Error(`Government impact sync: state download failed (${stateResponse.status}).`);
const state = await stateResponse.json();
if (state.schema_version !== "1.0" || !Array.isArray(state.history)) throw new Error("Government impact sync: unsupported state structure.");

const schema = JSON.parse(await readFile(path.join(dataRoot, "WOEK-IMPACT-CASE-SCHEMA-2.0.1.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const latest = new Map();
for (const entry of state.history) latest.set(entry.impact_case_id, entry.record);
const publicCases = [...latest.values()].filter((record) => ["APPROVED", "APPROVED_WITH_OPEN_DATA"].includes(record.fach_review?.status));
publicCases.sort((a, b) => a.impact_case_id.localeCompare(b.impact_case_id));
const publicHistory = state.history.filter((entry) => ["APPROVED", "APPROVED_WITH_OPEN_DATA"].includes(entry.record?.fach_review?.status));
const forbidden = [
  /\/(?:Users|private|tmp)\//i,
  /localhost/i,
  /chat\s*gpt/i,
  /open\s*ai/i,
  /claude/i,
  /redaktioneller hinweis/i,
];
for (const record of publicCases) {
  if (!validate(record)) throw new Error(`Government impact sync: ${record.impact_case_id} is no longer schema-valid.`);
  const serialized = JSON.stringify(record);
  const marker = forbidden.find((pattern) => pattern.test(serialized));
  if (marker) throw new Error(`Government impact sync: publication safety marker ${marker} in ${record.impact_case_id}.`);
}

const jsonl = publicCases.map((record) => JSON.stringify(record)).join("\n") + (publicCases.length ? "\n" : "");
await writeFile(path.join(dataRoot, "public-impact-cases.jsonl"), jsonl, "utf8");
await writeFile(path.join(dataRoot, "public-impact-case-history.jsonl"), publicHistory.map((entry) => JSON.stringify(entry)).join("\n") + (publicHistory.length ? "\n" : ""), "utf8");
await writeFile(path.join(dataRoot, "public-impact-cases-meta.json"), `${JSON.stringify({
  generated_at: new Date().toISOString(),
  count: publicCases.length,
  source_hash: (await import("node:crypto")).createHash("sha256").update(JSON.stringify(publicCases)).digest("hex"),
  method_version: "WOEK-POLITICAL-IMPACT-2.0",
  schema_id: schema.$id,
}, null, 2)}\n`, "utf8");
console.log(`Government impact sync: ${publicCases.length} approved ImpactCases materialized.`);
