import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

if (process.env.WOEK_AUTOPILOT_RUNTIME_MODE !== "NORMAL") {
  console.log("Parliament daily sync: bootstrap/remediation mode; the audited repository snapshot is preserved and Dropbox is not read.");
  process.exit(0);
}

const appKey = process.env.DROPBOX_APP_KEY;
const appSecret = process.env.DROPBOX_APP_SECRET;
const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
const dailyRoot = (process.env.DROPBOX_PARLIAMENT_DAILY_PATH ?? "/WOEK/WOEK-PARLAMENT-DAILY").replace(/\/+$/, "");
const autopilotRoot = "/WOEK/WOEK-AUTOPILOT";
const outputRoot = path.join(process.cwd(), "data", "generated");

if (!appKey || !appSecret || !refreshToken) {
  console.log("Parliament daily sync: Dropbox is not configured; the last verified build snapshot is preserved.");
  process.exit(0);
}

const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
  method: "POST",
  headers: { authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
});
if (!tokenResponse.ok) throw new Error(`Parliament daily sync: token refresh failed (${tokenResponse.status}).`);
const { access_token: accessToken } = await tokenResponse.json();
if (!accessToken) throw new Error("Parliament daily sync: Dropbox returned no access token.");

async function downloadJson(dropboxPath, { optional = false } = {}) {
  const response = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}`, "dropbox-api-arg": JSON.stringify({ path: dropboxPath }) },
  });
  if (optional && response.status === 409) return null;
  if (!response.ok) throw new Error(`Parliament daily sync: download failed for configured snapshot (${response.status}).`);
  return response.json();
}

const state = await downloadJson(`${dailyRoot}/CONTROL/approved-public-state.json`, { optional: true });
if (state) {
  if (state.schema_version !== "1.0" || !Array.isArray(state.impact_cases) || !Array.isArray(state.vote_reviews) || !Array.isArray(state.approvals)) {
    throw new Error("Parliament daily sync: unsupported approved-state structure.");
  }
  const schema = JSON.parse(await readFile(path.join(process.cwd(), "data", "government", "impact-cases", "WOEK-IMPACT-CASE-SCHEMA-2.0.1.json"), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const forbidden = [/\/(?:Users|private|tmp)\//i, /localhost/i, /chat\s*gpt/i, /open\s*ai/i, /claude/i, /redaktioneller hinweis/i];
  for (const record of state.impact_cases) {
    if (!validate(record)) throw new Error(`Parliament daily sync: schema-invalid approved record ${record?.impact_case_id ?? "unknown"}.`);
    const serialized = JSON.stringify(record);
    const marker = forbidden.find((pattern) => pattern.test(serialized));
    if (marker) throw new Error(`Parliament daily sync: publication-safety marker in ${record.impact_case_id}.`);
  }
  const jsonl = state.impact_cases.map((record) => JSON.stringify(record)).join("\n") + (state.impact_cases.length ? "\n" : "");
  await writeFile(path.join(outputRoot, "parliament-daily-impact-cases.jsonl"), jsonl, "utf8");
  await writeFile(path.join(outputRoot, "parliament-daily-state.json"), `${JSON.stringify({
    schema_version: state.schema_version,
    updated_at: state.updated_at,
    source_hash: state.source_hash,
    impact_case_count: state.impact_cases.length,
    vote_review_count: state.vote_reviews.length,
    approval_count: state.approvals.length,
  }, null, 2)}\n`, "utf8");
  console.log(`Parliament daily sync: ${state.impact_cases.length} approved ImpactCases materialized.`);
}

const health = await downloadJson(`${autopilotRoot}/CONTROL/health.json`, { optional: true });
if (health) {
  if (health.schema_version !== "1.0" || !health.domains || typeof health.domains !== "object") {
    throw new Error("Parliament daily sync: unsupported autopilot-health structure.");
  }
  await writeFile(path.join(outputRoot, "autopilot-health.json"), `${JSON.stringify(health, null, 2)}\n`, "utf8");
}
