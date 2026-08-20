import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import publicationSources from "../../data/generated/release-1/publication-sources.json";
import { politicalSourceCatalog } from "../../lib/commitments/source-catalog";
import { saxonyAnhaltElectionProgrammes } from "../../data/sachsen-anhalt-election-programmes";
import { saxonyAnhaltProgrammeEditorialV2 } from "../../data/presentation/sachsen-anhalt-programme-editorial-v2";
import { statePublicContent } from "../../lib/states/public-content";
import { stateJurisdictions, stateSlug } from "../../lib/autopilot/registry";

type PublicationRecord = {
  kind?: unknown;
  source_key?: unknown;
  markdown_file?: unknown;
  overview?: unknown;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function string(value: unknown) {
  return typeof value === "string" ? value : "";
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

const root = process.cwd();
const documents = Array.isArray((publicationSources as { documents?: unknown }).documents)
  ? (publicationSources as { documents: PublicationRecord[] }).documents
  : [];
assert.ok(documents.length > 0, "publication source registry is empty");

const federalKinds = new Set(["FEDERAL_ELECTION_PROGRAMME", "COALITION_AGREEMENT"]);
let federalNotMateriallyAssessableFragments = 0;
let federalGenericPotentialMentions = 0;

for (const source of politicalSourceCatalog) {
  const matches = documents.filter((item) => item.source_key === source.sourceKey && federalKinds.has(string(item.kind)));
  assert.equal(matches.length, 1, `${source.sourceKey}: expected one complete federal publication source`);
  const publication = matches[0];
  const overview = record(publication.overview);
  assert.equal(number(overview.commitment_count), source.commitmentCount, `${source.sourceKey}: source catalogue/publication count mismatch`);
  const markdownFile = string(publication.markdown_file);
  const absolute = path.join(root, "data/fachakten/release-1", markdownFile);
  assert.ok(markdownFile && existsSync(absolute), `${source.sourceKey}: complete fachakte markdown missing`);
  const markdown = readFileSync(absolute, "utf8");
  assert.match(markdown, /\*\*review_status:\*\*\s*COMPLETE/, `${source.sourceKey}: fachakte not COMPLETE`);
  federalNotMateriallyAssessableFragments += (markdown.match(/\*\*assessment_status:\*\*\s*NOT_MATERIALLY_ASSESSABLE/g) ?? []).length;
  federalGenericPotentialMentions += (markdown.match(/\*\*expected_state_change:\*\*\s*Die Maßnahme kann /g) ?? []).length;
}

const federalIndexSource = readFileSync(path.join(root, "app/mandat-und-praxis/page.tsx"), "utf8");
assert.match(federalIndexSource, /Vollständige Fachakten vorhanden - aktuelle Kurzbewertung im Qualitäts-Re-Audit/, "federal index must expose editorial re-audit status");
const federalDetailSource = readFileSync(path.join(root, "app/mandat-und-praxis/[sourceKey]/page.tsx"), "utf8");
assert.match(federalDetailSource, /Vollständige Ex-ante-Fachakte vorhanden/, "federal detail must surface complete fachakte");
assert.match(federalDetailSource, /Generische oder nicht materiell beurteilbare Fragmente/, "federal detail must fail closed on low-quality fragments");

let stateProgrammeObjects = 0;
let stateProgrammeCommitments = 0;
for (const programme of saxonyAnhaltElectionProgrammes) {
  const review = documents.filter((item) => item.source_key === programme.sourceKey && item.kind === "SAXONY_ANHALT_ELECTION_PROGRAMME_REVIEW");
  const commitments = documents.filter((item) => item.source_key === programme.sourceKey && item.kind === "SAXONY_ANHALT_COMMITMENT_REGISTER");
  assert.equal(review.length, 1, `${programme.sourceKey}: missing review publication object`);
  assert.equal(commitments.length, 1, `${programme.sourceKey}: missing commitment publication object`);
  const reviewCount = number(record(review[0].overview).commitment_count);
  const commitmentCount = number(record(commitments[0].overview).commitment_count);
  assert.ok(reviewCount && commitmentCount, `${programme.sourceKey}: commitment count missing`);
  assert.equal(reviewCount, commitmentCount, `${programme.sourceKey}: review/register count mismatch`);
  stateProgrammeCommitments += reviewCount;
  stateProgrammeObjects += 2;
  const editorial = saxonyAnhaltProgrammeEditorialV2[programme.sourceKey];
  assert.ok(editorial, `${programme.sourceKey}: editorial v2 missing`);
  const reviewMarkdown = readFileSync(path.join(root, "data/fachakten/release-1", string(review[0].markdown_file)), "utf8");
  for (const key of Object.keys(editorial.centralAssessments)) assert.ok(reviewMarkdown.includes(key), `${programme.sourceKey}: reviewed key absent from source review: ${key}`);
}

const stateRouteSource = readFileSync(path.join(root, "app/laender/sachsen-anhalt/wahlprogramme/[sourceKey]/page.tsx"), "utf8");
assert.match(stateRouteSource, /SaxonyAnhaltProgrammeAnalysisV3/, "Sachsen-Anhalt must use blueprint v3");
const blueprintSource = readFileSync(path.join(root, "app/components/SaxonyAnhaltProgrammeAnalysisV3.tsx"), "utf8");
assert.match(blueprintSource, /nicht mehr als aktuelle Kurzbewertung verwendet/, "legacy generic paths must not be current short assessments");
assert.match(blueprintSource, /Wirkungsrichtung/, "direction must be visible");
assert.match(blueprintSource, /Evidenz/, "evidence must be visible separately");

assert.equal(stateJurisdictions.length, 16, `expected 16 state jurisdictions, got ${stateJurisdictions.length}`);
const stateSlugs = stateJurisdictions.map((item) => stateSlug(item.jurisdiction_id));
assert.equal(new Set(stateSlugs).size, 16, "state slugs are not unique");
for (const slug of Object.keys(statePublicContent)) assert.ok(stateSlugs.includes(slug), `public state content has no jurisdiction: ${slug}`);
for (const [slug, content] of Object.entries(statePublicContent)) {
  if (!content.review) continue;
  const file = path.join(root, content.review.repoPath);
  assert.ok(existsSync(file), `${slug}: approved review file missing`);
  assert.ok(readFileSync(file, "utf8").trim().length > 500, `${slug}: approved review unexpectedly empty`);
}

const statesPageSource = readFileSync(path.join(root, "app/laender/page.tsx"), "utf8");
assert.match(statesPageSource, /automatische Quellenaktualisierung noch nicht aktiv/, "state overview must not call disabled adapters active monitoring");
assert.match(statesPageSource, /KEIN ÖFFENTLICHER FACHREVIEW/, "state overview must fail closed for uncovered states");

console.log(JSON.stringify({
  status: "pass",
  federalDocuments: politicalSourceCatalog.length,
  federalCommitments: politicalSourceCatalog.reduce((sum, source) => sum + source.commitmentCount, 0),
  federalNotMateriallyAssessableFragments,
  federalGenericPotentialMentions,
  federalEditorialReauditVisible: true,
  saxonyAnhaltProgrammeObjects: stateProgrammeObjects,
  saxonyAnhaltCommitments: stateProgrammeCommitments,
  saxonyAnhaltBlueprint: "v3",
  stateJurisdictions: stateJurisdictions.length,
  statePublicReviews: Object.values(statePublicContent).filter((item) => item.review).length,
  uncoveredStatesFailClosed: stateJurisdictions.length - new Set([...Object.keys(statePublicContent), "sachsen-anhalt"]).size,
}));
