import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const appKey = process.env.DROPBOX_APP_KEY;
const appSecret = process.env.DROPBOX_APP_SECRET;
const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
const folder = "/WÖK/WOEK-WIRKUNGSOBSERVATORIUM/FACHUPDATES";
const outputRoot = path.join(process.cwd(), "data", "observatory", "public");
if (!appKey || !appSecret || !refreshToken) {
  console.log("Observatory sync: no local Dropbox credentials; approved repository snapshot is preserved.");
  process.exit(0);
}

const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
  method: "POST",
  headers: { authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
});
if (!tokenResponse.ok) throw new Error(`Observatory sync token refresh failed (${tokenResponse.status}).`);
const { access_token: token } = await tokenResponse.json();

async function listFiles() {
  const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ path: folder, recursive: false }) });
  if (response.status === 409) return [];
  if (!response.ok) throw new Error(`Observatory sync list failed (${response.status}).`);
  const result = await response.json();
  return result.entries.filter((entry) => entry[".tag"] === "file");
}

async function download(filePath) {
  const response = await fetch("https://content.dropboxapi.com/2/files/download", { method: "POST", headers: { authorization: `Bearer ${token}`, "dropbox-api-arg": JSON.stringify({ path: filePath }) } });
  if (!response.ok) throw new Error(`Observatory sync download failed (${response.status}).`);
  return response.text();
}

async function validator(name) {
  const schema = JSON.parse(await readFile(path.join(process.cwd(), "data", "observatory", "contracts", name), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false }); addFormats(ajv);
  return ajv.compile(schema);
}

function parseJsonl(content, validate, sourceName) {
  return content.split(/\r?\n/).filter(Boolean).map((line, index) => {
    const record = JSON.parse(line);
    if (!validate(record)) throw new Error(`${sourceName}:${index + 1} is invalid: ${JSON.stringify(validate.errors)}`);
    return record;
  });
}

const files = await listFiles();
const evidenceValidate = await validator("evidence-event.schema.json");
const updateValidate = await validator("analysis-version-update.schema.json");
const evidence = [];
const updates = [];
for (const file of files) {
  if (/^APPROVED_PUBLIC_EVIDENCE_EVENTS-.*\.jsonl$/.test(file.name)) {
    const records = parseJsonl(await download(file.path_display), evidenceValidate, file.name);
    if (records.some((entry) => entry.publication_status !== "APPROVED_PUBLIC")) throw new Error(`${file.name} contains an unapproved EvidenceEvent.`);
    evidence.push(...records);
  }
  if (/^APPROVED_ANALYSIS_UPDATES-.*\.jsonl$/.test(file.name)) {
    const records = parseJsonl(await download(file.path_display), updateValidate, file.name);
    if (records.some((entry) => entry.fach_approval !== "APPROVED_ANALYSIS_UPDATE")) throw new Error(`${file.name} contains an unapproved analysis update.`);
    updates.push(...records);
  }
}
const evidenceById = new Map();
for (const item of evidence) {
  const prior = evidenceById.get(item.evidence_event_id);
  if (prior && JSON.stringify(prior) !== JSON.stringify(item)) throw new Error(`Conflicting EvidenceEvent ${item.evidence_event_id}.`);
  evidenceById.set(item.evidence_event_id, item);
}
for (const update of updates) {
  const missing = update.triggering_evidence_event_ids.filter((id) => !evidenceById.has(id));
  if (missing.length) throw new Error(`Analysis ${update.impact_case_id} ${update.analysis_version} has no public EvidenceEvent for: ${missing.join(", ")}.`);
}
const stableEvidence = [...evidenceById.values()].sort((a, b) => a.evidence_event_id.localeCompare(b.evidence_event_id));
const stableUpdates = updates.sort((a, b) => `${a.impact_case_id}:${a.analysis_version}`.localeCompare(`${b.impact_case_id}:${b.analysis_version}`));
await writeFile(path.join(outputRoot, "evidence-events.jsonl"), stableEvidence.map((entry) => JSON.stringify(entry)).join("\n") + (stableEvidence.length ? "\n" : ""));
await writeFile(path.join(outputRoot, "analysis-version-updates.jsonl"), stableUpdates.map((entry) => JSON.stringify(entry)).join("\n") + (stableUpdates.length ? "\n" : ""));
console.log(`Observatory sync: ${stableEvidence.length} EvidenceEvents and ${stableUpdates.length} analysis updates materialized (${createHash("sha256").update(JSON.stringify({ stableEvidence, stableUpdates })).digest("hex")}).`);
