import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
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
const publicationSources = loadJson("data/generated/release-1/publication-sources.json");
const publicationSourceLinks = loadJson("data/generated/release-1/publication-source-links.json");
if (releaseIntegrity.coverage?.caseReviews?.received !== 28 || releaseIntegrity.coverage?.caseReviews?.uniqueCaseIds !== 28) fail("The released case-review archive is not complete.");
if ((releaseReviews.reviews?.length ?? 0) !== 28) fail("The released case-review source records are incomplete.");
if ((releaseRegisters.registers?.length ?? 0) !== 7 || releaseRegisters.registers.reduce((total, register) => total + (register.commitment_count ?? 0), 0) !== 1593) fail("The seven complete commitment registers are not fully present.");
if ((releaseLinks.programme_to_coalition?.length ?? 0) !== 1246 || (releaseLinks.coalition_to_parliamentary_decisions?.length ?? 0) !== 347 || (releaseLinks.open_or_ambiguous_relations?.length ?? 0) !== 314) fail("The released programme, coalition and parliamentary relationships are incomplete.");
if ((stateTargets.targets?.length ?? 0) !== 28) fail("The Saxony-Anhalt target register is incomplete.");

const completeSources = Array.isArray(publicationSources.documents) ? publicationSources.documents : [];
if (completeSources.length !== 48) fail("The release must contain exactly 48 complete authorised publication sources.");
const completeKinds = completeSources.reduce((counts, source) => {
  counts[source.kind] = (counts[source.kind] ?? 0) + 1;
  return counts;
}, {});
for (const [kind, expected] of Object.entries({ PARLIAMENTARY_CASE: 28, FEDERAL_ELECTION_PROGRAMME: 6, COALITION_AGREEMENT: 1, SAXONY_ANHALT_ELECTION_PROGRAMME_REVIEW: 6, SAXONY_ANHALT_COMMITMENT_REGISTER: 6, SPECIALIST_ANALYSIS: 1 })) {
  if (completeKinds[kind] !== expected) fail(`The complete-publication source coverage for ${kind} is incomplete.`);
}

const sourceByCaseId = new Map();
const renderedUrls = new Set();
for (const source of completeSources) {
  if (!source.id || !source.kind || !source.markdown_file || !/^[a-f0-9]{64}$/i.test(source.markdown_sha256 ?? "")) {
    fail("A complete-publication source is missing its identity, source type, file or checksum.");
    continue;
  }
  if (!Array.isArray(source.required_content_paths) || source.required_content_paths.length === 0 || source.required_content_paths.length !== source.rendered_content_paths?.length || source.unrendered_content_paths?.length !== 0) {
    fail(`${source.id} has incomplete public content coverage.`);
  }
  const relative = source.markdown_file;
  if (relative.includes("..") || relative.startsWith("/") || !relative.endsWith(".md")) {
    fail(`${source.id} has an unsafe public Fachakte path.`);
    continue;
  }
  const file = resolve("data/fachakten/release-1", relative);
  if (!file.startsWith(resolve("data/fachakten/release-1")) || !existsSync(file)) {
    fail(`${source.id} has no materialized complete Fachakte.`);
    continue;
  }
  const markdown = readFileSync(file, "utf8");
  const markdownHash = createHash("sha256").update(markdown).digest("hex");
  if (markdownHash !== source.markdown_sha256) fail(`${source.id} does not match its authorised Fachakte checksum.`);
  if (markdown.trim().length < 200) fail(`${source.id} has an implausibly short Fachakte.`);
  for (const value of markdown.match(/https:\/\/[^\s<>()]+/g) ?? []) renderedUrls.add(value.replace(/[),.;:]+$/g, ""));
  if (source.kind === "PARLIAMENTARY_CASE") sourceByCaseId.set(source.case_id, source);
}

const indexedSourceUrls = new Set((Array.isArray(publicationSourceLinks.sources) ? publicationSourceLinks.sources : []).map((source) => source?.canonical_url));
if (indexedSourceUrls.size < 100) fail("The public Fachakten source-detail index is implausibly incomplete.");
for (const url of renderedUrls) {
  if (!indexedSourceUrls.has(url)) fail(`A public Fachakte link has no source-detail record: ${url}`);
}

for (const item of workingActs) {
  const detail = item.publicWorkingAct?.reviewDetail;
  const mapping = item.publicWorkingAct?.normativeMapping;
  const fullReview = item.publicWorkingAct?.fullReview;
  if (!item.plainTitle || /^wirkungsökonomische vorprüfung/i.test(item.plainTitle)) fail(`${item.slug} has no usable public title.`);
  if (!Array.isArray(detail?.impactPaths) || detail.impactPaths.length === 0) fail(`${item.slug} has no published impact paths.`);
  if (!fullReview || !Array.isArray(fullReview.requiredContentPaths) || fullReview.requiredContentPaths.length === 0 || fullReview.unrenderedContentPaths?.length !== 0 || fullReview.requiredContentPaths.length !== fullReview.renderedContentPaths?.length) {
    fail(`${item.slug} does not render its complete released source record.`);
  }
  const caseId = fullReview?.result?.case_id;
  if (typeof caseId !== "string" || !sourceByCaseId.has(caseId)) fail(`${item.slug} has no complete released Fachakte in the source corpus.`);
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

if (!process.exitCode) console.log(JSON.stringify({ status: "pass", workingActs: workingActs.length, specialistAnalyses: analyses.length, completePublicationSources: completeSources.length }));
