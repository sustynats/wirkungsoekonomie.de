import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(path), "utf8"));
}

function fail(message) {
  console.error(`PUBLIC CONTENT CHECK FAILED: ${message}`);
  process.exitCode = 1;
}

const workingActs = loadJson("data/public-working-acts.json");
if (!Array.isArray(workingActs) || workingActs.length < 28) fail("The public decision projection must contain all 28 approved working acts.");

for (const item of workingActs) {
  const detail = item.publicWorkingAct?.reviewDetail;
  const mapping = item.publicWorkingAct?.normativeMapping;
  if (!item.plainTitle || /^wirkungsökonomische vorprüfung/i.test(item.plainTitle)) fail(`${item.slug} has no usable public title.`);
  if (!Array.isArray(detail?.impactPaths) || detail.impactPaths.length === 0) fail(`${item.slug} has no published impact paths.`);
  const normativeItems = [...(mapping?.sdgItems ?? []), ...(mapping?.sdgPlusItems ?? []), ...(mapping?.constitutionalAnchorItems ?? [])];
  if (normativeItems.length === 0) fail(`${item.slug} has no public normative mapping.`);
  for (const group of [mapping?.sdgItems ?? [], mapping?.sdgPlusItems ?? [], mapping?.constitutionalAnchorItems ?? []]) {
    const ids = group.map((entry) => entry.id);
    if (new Set(ids).size !== ids.length) fail(`${item.slug} contains duplicate public mapping tiles.`);
  }
}

const analyses = loadJson("data/public-fachanalysen.json");
const geg = analyses.find((item) => item.slug === "gebaeudeenergiegesetz-medienwirkung");
if (!geg) fail("The approved GEG specialist analysis is missing from the public projection.");
if ((geg.timeline?.length ?? 0) < 10 || (geg.impactPaths?.length ?? 0) < 5 || (geg.mediaPatterns?.length ?? 0) < 5 || (geg.sources?.length ?? 0) < 20) {
  fail("The GEG specialist analysis is incomplete.");
}
if (!Array.isArray(geg.referenceFields?.mpd) || geg.referenceFields.mpd.length !== 3 || !Array.isArray(geg.referenceFields?.sdgAndPlus) || geg.referenceFields.sdgAndPlus.length < 5) {
  fail("The GEG specialist analysis is missing its documented reference fields.");
}
for (const pattern of geg.mediaPatterns ?? []) {
  if (!pattern.label || !pattern.potentialPath || !pattern.alternativeExplanation || !pattern.causalStatus || !Array.isArray(pattern.sources) || pattern.sources.length === 0) {
    fail("A GEG media-pattern entry is missing its evidence or causal boundary.");
  }
}

const publicPayload = JSON.stringify({ workingActs, analyses });
const providerMarkers = ["chat" + "gpt", "open" + "ai", "code" + "x", "clau" + "de"];
const forbidden = [/\/Users\//i, /\/private\//i, ...providerMarkers.map((marker) => new RegExp(marker, "i")), /localhost/i];
for (const pattern of forbidden) {
  if (pattern.test(publicPayload)) fail(`Public projection contains a forbidden internal marker: ${pattern}.`);
}

if (!process.exitCode) console.log(JSON.stringify({ status: "pass", workingActs: workingActs.length, specialistAnalyses: analyses.length }));
