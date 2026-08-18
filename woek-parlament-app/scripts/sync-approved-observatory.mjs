import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const appKey = process.env.DROPBOX_APP_KEY;
const appSecret = process.env.DROPBOX_APP_SECRET;
const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
const root = "/WÖK/WOEK-WIRKUNGSOBSERVATORIUM";
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

async function listFiles(folder) {
  const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ path: folder, recursive: false }) });
  if (response.status === 409) return [];
  if (!response.ok) throw new Error(`Observatory sync list failed for ${folder} (${response.status}).`);
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
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

async function readJsonl(name) {
  try {
    const content = await readFile(path.join(outputRoot, name), "utf8");
    return content.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function parseRecords(content, validate, sourceName) {
  const trimmed = content.trim();
  const records = sourceName.endsWith(".json") ? [JSON.parse(trimmed)] : trimmed.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  return records.map((record, index) => {
    if (!validate(record)) throw new Error(`${sourceName}:${index + 1} is invalid: ${JSON.stringify(validate.errors)}`);
    return record;
  });
}

function mergeById(existing, incoming, idField) {
  const result = new Map(existing.map((entry) => [entry[idField], entry]));
  for (const entry of incoming) {
    const id = entry[idField];
    const prior = result.get(id);
    if (prior && JSON.stringify(prior) !== JSON.stringify(entry)) throw new Error(`Conflicting approved observatory record ${id}.`);
    result.set(id, entry);
  }
  return [...result.values()].sort((a, b) => String(a[idField]).localeCompare(String(b[idField])));
}

const evidenceValidate = await validator("evidence-event.schema.json");
const candidateValidate = await validator("reality-check-candidate.schema.json");
const updateValidate = await validator("analysis-version-update.schema.json");
const evidenceIncoming = [];
const candidateIncoming = [];
const updateIncoming = [];

for (const file of await listFiles(`${root}/PUBLIC-EVIDENCE`)) {
  if (!/^(?:EVIDENCE-EVENT|APPROVED_PUBLIC_EVIDENCE_EVENTS)-.*\.jsonl?$/.test(file.name)) continue;
  const records = parseRecords(await download(file.path_display), evidenceValidate, file.name);
  if (records.some((entry) => !["APPROVED_PUBLIC", "APPROVED_PUBLIC_EVIDENCE"].includes(entry.publication_status))) throw new Error(`${file.name} contains an unapproved EvidenceEvent.`);
  evidenceIncoming.push(...records);
}
for (const file of await listFiles(`${root}/REALITY-CANDIDATES`)) {
  if (!/^(?:REALITY-CANDIDATE|APPROVED_REALITY_CHECKS)-.*\.jsonl?$/.test(file.name)) continue;
  const records = parseRecords(await download(file.path_display), candidateValidate, file.name);
  if (records.some((entry) => entry.publication_status !== "APPROVED_REALITY_CHECK_CANDIDATE")) throw new Error(`${file.name} contains an unapproved RealityCheckCandidate.`);
  candidateIncoming.push(...records);
}
for (const file of await listFiles(`${root}/FACHUPDATES`)) {
  if (!/^APPROVED_ANALYSIS_UPDATES-.*\.jsonl$/.test(file.name)) continue;
  const records = parseRecords(await download(file.path_display), updateValidate, file.name);
  if (records.some((entry) => entry.fach_approval !== "APPROVED_ANALYSIS_UPDATE")) throw new Error(`${file.name} contains an unapproved analysis update.`);
  updateIncoming.push(...records);
}

const evidence = mergeById(await readJsonl("evidence-events.jsonl"), evidenceIncoming, "evidence_event_id");
const candidates = mergeById(await readJsonl("reality-check-candidates.jsonl"), candidateIncoming, "reality_candidate_id");
const updates = mergeById(await readJsonl("analysis-version-updates.jsonl"), updateIncoming, "impact_case_id");
const evidenceIds = new Set(evidence.map((entry) => entry.evidence_event_id));
for (const update of updates) {
  const missing = update.triggering_evidence_event_ids.filter((id) => !evidenceIds.has(id));
  if (missing.length) throw new Error(`Analysis ${update.impact_case_id} ${update.analysis_version} has no public EvidenceEvent for: ${missing.join(", ")}.`);
}
for (const candidate of candidates) {
  const missing = candidate.triggering_evidence_event_ids.filter((id) => !evidenceIds.has(id));
  if (missing.length) throw new Error(`RealityCheckCandidate ${candidate.reality_candidate_id} has no public EvidenceEvent for: ${missing.join(", ")}.`);
}

await writeFile(path.join(outputRoot, "evidence-events.jsonl"), evidence.map((entry) => JSON.stringify(entry)).join("\n") + (evidence.length ? "\n" : ""));
await writeFile(path.join(outputRoot, "reality-check-candidates.jsonl"), candidates.map((entry) => JSON.stringify(entry)).join("\n") + (candidates.length ? "\n" : ""));
await writeFile(path.join(outputRoot, "analysis-version-updates.jsonl"), updates.map((entry) => JSON.stringify(entry)).join("\n") + (updates.length ? "\n" : ""));
console.log(`Observatory sync: ${evidence.length} EvidenceEvents, ${candidates.length} reality candidates and ${updates.length} analysis updates preserved (${createHash("sha256").update(JSON.stringify({ evidence, candidates, updates })).digest("hex")}).`);
