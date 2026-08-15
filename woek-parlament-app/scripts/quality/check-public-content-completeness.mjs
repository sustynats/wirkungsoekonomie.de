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

const releaseIntegrity = loadJson("data/generated/release-1/content-integrity.json");
const releaseReviews = loadJson("data/generated/release-1/case-reviews.json");
const releaseRegisters = loadJson("data/generated/release-1/commitment-registers.json");
const releaseLinks = loadJson("data/generated/release-1/commitment-links.json");
const stateTargets = loadJson("data/generated/release-1/sachsen-anhalt-target-register.json");
if (releaseIntegrity.coverage?.caseReviews?.received !== 28 || releaseIntegrity.coverage?.caseReviews?.uniqueCaseIds !== 28) fail("The released case-review archive is not complete.");
if ((releaseReviews.reviews?.length ?? 0) !== 28) fail("The released case-review source records are incomplete.");
if ((releaseRegisters.registers?.length ?? 0) !== 7 || releaseRegisters.registers.reduce((total, register) => total + (register.commitment_count ?? 0), 0) !== 1593) fail("The seven complete commitment registers are not fully present.");
if ((releaseLinks.programme_to_coalition?.length ?? 0) !== 1246 || (releaseLinks.coalition_to_parliamentary_decisions?.length ?? 0) !== 347 || (releaseLinks.open_or_ambiguous_relations?.length ?? 0) !== 314) fail("The released programme, coalition and parliamentary relationships are incomplete.");
if ((stateTargets.targets?.length ?? 0) !== 28) fail("The Saxony-Anhalt target register is incomplete.");

for (const item of workingActs) {
  const detail = item.publicWorkingAct?.reviewDetail;
  const mapping = item.publicWorkingAct?.normativeMapping;
  const fullReview = item.publicWorkingAct?.fullReview;
  if (!item.plainTitle || /^wirkungsökonomische vorprüfung/i.test(item.plainTitle)) fail(`${item.slug} has no usable public title.`);
  if (!Array.isArray(detail?.impactPaths) || detail.impactPaths.length === 0) fail(`${item.slug} has no published impact paths.`);
  if (!fullReview || !Array.isArray(fullReview.requiredContentPaths) || fullReview.requiredContentPaths.length === 0 || fullReview.unrenderedContentPaths?.length !== 0 || fullReview.requiredContentPaths.length !== fullReview.renderedContentPaths?.length) {
    fail(`${item.slug} does not render its complete released source record.`);
  }
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
