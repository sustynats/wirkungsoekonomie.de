import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import publicationSources from "../../data/generated/release-1/publication-sources.json";
import terminalRelease from "../../data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-six-party-terminal-release-v1.json";
import { politicalSourceCatalog } from "../../lib/commitments/source-catalog";
import { saxonyAnhaltElectionProgrammes } from "../../data/sachsen-anhalt-election-programmes";
import { saxonyAnhaltProgrammeEditorialV2 } from "../../data/presentation/sachsen-anhalt-programme-editorial-v2";
import { saxonyAnhaltReviewedCommitmentCounts } from "../../data/presentation/sachsen-anhalt-programme-counts";
import { buildSaxonyAnhaltProgrammeModel } from "../../lib/presentation/sachsen-anhalt-programme-model";
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
let stateProgrammeRegisterMetadataCommitments = 0;
let stateProgrammeAnalysedCommitments = 0;
let reviewMetadataVsAnalysedMismatches = 0;
const terminalBySourceKey = new Map(terminalRelease.parties.map((party) => [party.source_key, party]));
for (const programme of saxonyAnhaltElectionProgrammes) {
  const review = documents.filter((item) => item.source_key === programme.sourceKey && item.kind === "SAXONY_ANHALT_ELECTION_PROGRAMME_REVIEW");
  const commitments = documents.filter((item) => item.source_key === programme.sourceKey && item.kind === "SAXONY_ANHALT_COMMITMENT_REGISTER");
  assert.equal(review.length, 1, `${programme.sourceKey}: missing review publication object`);
  assert.equal(commitments.length, 1, `${programme.sourceKey}: missing commitment publication object`);
  const reviewCount = number(record(review[0].overview).commitment_count);
  const commitmentCount = number(record(commitments[0].overview).commitment_count);
  assert.ok(reviewCount && commitmentCount, `${programme.sourceKey}: commitment count missing`);
  assert.equal(reviewCount, commitmentCount, `${programme.sourceKey}: release metadata review/register count mismatch`);
  stateProgrammeRegisterMetadataCommitments += commitmentCount;
  stateProgrammeObjects += 2;

  const editorial = saxonyAnhaltProgrammeEditorialV2[programme.sourceKey];
  assert.ok(editorial, `${programme.sourceKey}: editorial v2 missing`);
  const reviewMarkdown = readFileSync(path.join(root, "data/fachakten/release-1", string(review[0].markdown_file)), "utf8");
  const registerMarkdown = readFileSync(path.join(root, "data/fachakten/release-1", string(commitments[0].markdown_file)), "utf8");
  const model = buildSaxonyAnhaltProgrammeModel(reviewMarkdown, registerMarkdown);
  const expectedAnalysedCount = saxonyAnhaltReviewedCommitmentCounts[programme.sourceKey];
  assert.equal(model.commitments.length, expectedAnalysedCount, `${programme.sourceKey}: material review count changed; inspect source extraction before publishing`);
  stateProgrammeAnalysedCommitments += model.commitments.length;
  if (reviewCount !== model.commitments.length) reviewMetadataVsAnalysedMismatches += 1;
  const terminalParty = terminalBySourceKey.get(programme.sourceKey);
  assert.ok(terminalParty, `${programme.sourceKey}: terminal six-party record missing`);
  assert.equal(terminalParty.historical_working_register_count, expectedAnalysedCount, `${programme.sourceKey}: historical working-register dimension drifted`);
  assert.equal(terminalParty.authoritative_source_unit_count - terminalParty.authoritative_effect_mechanism_count, terminalParty.non_effect_source_leaf_count, `${programme.sourceKey}: terminal source/effect conservation failed`);
  assert.equal(terminalParty.primary_source_parity, "PASS_FULL_PROGRAMME", `${programme.sourceKey}: primary-source parity is not terminal`);
  for (const key of Object.keys(editorial.centralAssessments)) assert.ok(reviewMarkdown.includes(key), `${programme.sourceKey}: reviewed key absent from source review: ${key}`);
}

const stateRouteSource = readFileSync(path.join(root, "app/laender/sachsen-anhalt/wahlprogramme/[sourceKey]/page.tsx"), "utf8");
assert.match(stateRouteSource, /SaxonyAnhaltProgrammeAnalysisV3/, "Sachsen-Anhalt must use blueprint v3");
const blueprintSource = readFileSync(path.join(root, "app/components/SaxonyAnhaltProgrammeAnalysisV3.tsx"), "utf8");
assert.match(blueprintSource, /nicht mehr als aktuelle Kurzbewertung verwendet/, "legacy generic paths must not be current short assessments");
assert.match(blueprintSource, /Wirkungsrichtung/, "direction must be visible");
assert.match(blueprintSource, /Evidenz/, "evidence must be visible separately");

const stateOverviewSource = readFileSync(path.join(root, "app/laender/sachsen-anhalt/page.tsx"), "utf8");
assert.match(stateOverviewSource, /saxonyAnhaltExecutiveImpactSummary/, "Sachsen-Anhalt overview must use the approved full-programme impact projection");
assert.match(stateOverviewSource, /summary\.material_paths\.slice\(0, 3\)/, "Sachsen-Anhalt overview must expose at most three approved material paths");
assert.doesNotMatch(stateOverviewSource, /saxonyAnhaltReviewedCommitmentCounts|editorial\.keyFindings\.map/, "Sachsen-Anhalt overview must not treat the historical Editorial-v2 subset as a programme-wide materiality selection");
assert.match(stateOverviewSource, /saxonyAnhaltTerminalRelease/, "Sachsen-Anhalt overview must project the terminal six-party release");
assert.match(stateOverviewSource, /getrennte Zähldimension/, "Sachsen-Anhalt overview must distinguish historical and authoritative counts");
assert.doesNotMatch(stateOverviewSource, /overview\.commitment_count/, "Sachsen-Anhalt overview must not expose ambiguous release metadata as analysed count");
assert.doesNotMatch(stateOverviewSource, /Vollreaudit laufen|finale Nenner ist noch nicht eingefroren/, "Sachsen-Anhalt overview must not retain stale convergence wording");

assert.equal(terminalRelease.status, "TERMINAL_6_OF_6", "Sachsen-Anhalt release must be terminal 6/6");
assert.equal(terminalRelease.historical_working_register.count, stateProgrammeAnalysedCommitments, "historical working-register total drifted");
assert.deepEqual(terminalRelease.authoritative_totals, { effect_mechanisms: 5308, non_effect_source_leaves: 95, source_units: 5403 }, "terminal authoritative totals drifted");
assert.equal(terminalRelease.publication_integrity.unrendered_content_paths.length, 0, "Sachsen-Anhalt has unrendered terminal content paths");

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
  saxonyAnhaltReleaseMetadataCommitments: stateProgrammeRegisterMetadataCommitments,
  saxonyAnhaltAnalysedCommitments: stateProgrammeAnalysedCommitments,
  saxonyAnhaltMetadataVsAnalysedCountMismatches: reviewMetadataVsAnalysedMismatches,
  saxonyAnhaltBlueprint: "v3",
  saxonyAnhaltTerminalStatus: terminalRelease.status,
  saxonyAnhaltTerminalSourceUnits: terminalRelease.authoritative_totals.source_units,
  saxonyAnhaltTerminalEffectMechanisms: terminalRelease.authoritative_totals.effect_mechanisms,
  stateJurisdictions: stateJurisdictions.length,
  statePublicReviews: Object.values(statePublicContent).filter((item) => item.review).length,
  uncoveredStatesFailClosed: stateJurisdictions.length - new Set([...Object.keys(statePublicContent), "sachsen-anhalt"]).size,
}));
