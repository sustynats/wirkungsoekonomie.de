import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import publicationSources from "../../data/generated/release-1/publication-sources.json";
import { saxonyAnhaltElectionProgrammes } from "../../data/sachsen-anhalt-election-programmes";
import { saxonyAnhaltProgrammeEditorialV2 } from "../../data/presentation/sachsen-anhalt-programme-editorial-v2";
import { buildSaxonyAnhaltProgrammeModel } from "../../lib/presentation/sachsen-anhalt-programme-model";

type PublicationRecord = {
  kind?: unknown;
  source_key?: unknown;
  rendered_route?: unknown;
  markdown_file?: unknown;
};

function fail(message: string): never {
  throw new Error(`Sachsen-Anhalt publication gate failed: ${message}`);
}

const root = process.cwd();
const overviewPath = path.join(root, "app/laender/sachsen-anhalt/page.tsx");
const routePath = path.join(root, "app/laender/sachsen-anhalt/wahlprogramme/[sourceKey]/page.tsx");
const componentPath = path.join(root, "app/components/SaxonyAnhaltProgrammeAnalysisV3.tsx");
const editorialPath = path.join(root, "data/presentation/sachsen-anhalt-programme-editorial-v2.ts");
const modelPath = path.join(root, "lib/presentation/sachsen-anhalt-programme-model.ts");
for (const requiredPath of [overviewPath, routePath, componentPath, editorialPath, modelPath]) {
  if (!existsSync(requiredPath)) fail(`required public presentation file is missing: ${path.relative(root, requiredPath)}`);
}

const overviewSource = readFileSync(overviewPath, "utf8");
for (const requiredToken of [
  "data-woek-programme-potential=\"published\"",
  "Wirkungspotenzial",
  "Key Findings",
  "Richtungsprofil der nachgeprüften Schlüsselpfade",
  "editorial.keyFindings.map",
  "Nicht kompensierbare Schutzgüter",
]) {
  if (!overviewSource.includes(requiredToken)) fail(`Sachsen-Anhalt overview does not contain ${requiredToken}`);
}
if (overviewSource.includes("editorial.keyFindings.slice(0, 2)")) {
  fail("programme overview must not hide approved material key findings behind a two-item preview");
}

const routeSource = readFileSync(routePath, "utf8");
for (const requiredToken of ["getSaxonyAnhaltPublicationSources", "SaxonyAnhaltProgrammeAnalysisV3"]) {
  if (!routeSource.includes(requiredToken)) fail(`detail route does not contain ${requiredToken}`);
}
if (routeSource.includes("CompletePublicationSource")) fail("raw complete-publication renderer must not be the primary route renderer");

const componentSource = readFileSync(componentPath, "utf8");
for (const requiredToken of [
  "data-woek-sachsen-anhalt-public=\"programme-blueprint-v3\"",
  "WÖk-Gesamtzusammenfassung",
  "Key Finding",
  "Richtungsprofil",
  "Wirkungsrichtung",
  "Wirkungspotenzial",
  "Evidenz",
  "vollstaendige-wirkungsakte",
  "vollstaendiges-zusageregister",
  "Historischer Release-1-Prüfpfad",
  "fail-closed",
  "Fachlicher Vollnachweis und technische Prüfinformationen",
]) {
  if (!componentSource.includes(requiredToken)) fail(`programme blueprint does not contain ${requiredToken}`);
}
if (componentSource.includes("firstPotential(")) fail("programme blueprint must not use the legacy firstPotential shortcut");
if (!componentSource.includes("saxonyAnhaltCommitmentEditorial")) fail("programme blueprint must use reviewed editorial commitment overlays");

const programmes = saxonyAnhaltElectionProgrammes;
if (programmes.length !== 6) fail(`expected 6 programme source records, found ${programmes.length}`);
const sourceKeys = programmes.map((programme) => programme.sourceKey);
if (new Set(sourceKeys).size !== sourceKeys.length) fail("programme source keys are not unique");
for (const sourceKey of sourceKeys) {
  const editorial = saxonyAnhaltProgrammeEditorialV2[sourceKey];
  if (!editorial) fail(`${sourceKey}: missing programme editorial v2`);
  if (editorial.version !== "2.0") fail(`${sourceKey}: unexpected editorial version`);
  if (!editorial.overallLabel.trim() || !editorial.impactCoreSummary.trim() || !editorial.editorialSummary.trim() || !editorial.readingGuide.trim()) {
    fail(`${sourceKey}: incomplete programme-level qualitative potential assessment`);
  }
  if (editorial.keyFindings.length < 4) fail(`${sourceKey}: fewer than four programme-level key findings`);
  const central = Object.values(editorial.centralAssessments);
  if (central.length < 4) fail(`${sourceKey}: fewer than four reviewed central assessments`);
  for (const assessment of central) {
    if (!assessment.impactCoreSummary.trim() || !assessment.editorialSummary.trim() || !assessment.directionRationale.trim() || !assessment.keyFinding.trim()) {
      fail(`${sourceKey}: incomplete central editorial assessment`);
    }
    if (!["POSITIVE", "NEGATIVE", "AMBIVALENT", "OPEN"].includes(assessment.direction)) fail(`${sourceKey}: invalid direction ${assessment.direction}`);
    if (!["HIGH", "MEDIUM", "LOW", "NOT_ASSESSABLE"].includes(assessment.evidence)) fail(`${sourceKey}: invalid evidence ${assessment.evidence}`);
  }
}

const documents = Array.isArray((publicationSources as { documents?: unknown }).documents)
  ? ((publicationSources as { documents: PublicationRecord[] }).documents)
  : fail("publication-sources.json has no documents array");

const sourceFiles = new Map<string, { review: string; commitments: string }>();
for (const sourceKey of sourceKeys) {
  const records = documents.filter((record) => record.source_key === sourceKey);
  const review = records.filter((record) => record.kind === "SAXONY_ANHALT_ELECTION_PROGRAMME_REVIEW");
  const commitments = records.filter((record) => record.kind === "SAXONY_ANHALT_COMMITMENT_REGISTER");
  if (review.length !== 1) fail(`${sourceKey}: expected exactly one review record, found ${review.length}`);
  if (commitments.length !== 1) fail(`${sourceKey}: expected exactly one commitment register, found ${commitments.length}`);

  const expectedRoute = `/laender/sachsen-anhalt/wahlprogramme/${sourceKey}`;
  const resolved: Partial<{ review: string; commitments: string }> = {};
  for (const [label, record] of [["review", review[0]], ["commitments", commitments[0]]] as const) {
    const renderedRoute = typeof record.rendered_route === "string" ? record.rendered_route : "";
    if (!renderedRoute.startsWith(expectedRoute)) fail(`${sourceKey}: ${label} rendered_route does not point to ${expectedRoute}`);
    const markdownFile = typeof record.markdown_file === "string" ? record.markdown_file : "";
    if (!markdownFile || markdownFile.includes("..") || path.isAbsolute(markdownFile)) fail(`${sourceKey}: ${label} markdown_file is invalid`);
    const markdownPath = path.join(root, "data/fachakten/release-1", markdownFile);
    if (!existsSync(markdownPath)) fail(`${sourceKey}: ${label} markdown file is missing`);
    if (statSync(markdownPath).size === 0) fail(`${sourceKey}: ${label} markdown file is empty`);
    resolved[label] = markdownPath;
  }
  sourceFiles.set(sourceKey, resolved as { review: string; commitments: string });
}

let legacyDuplicateClusters = 0;
for (const sourceKey of sourceKeys) {
  const files = sourceFiles.get(sourceKey)!;
  const model = buildSaxonyAnhaltProgrammeModel(readFileSync(files.review, "utf8"), readFileSync(files.commitments, "utf8"));
  if (model.commitments.length < 100) fail(`${sourceKey}: unexpectedly contains only ${model.commitments.length} commitments`);
  const byKey = new Set(model.commitments.map((commitment) => commitment.key));
  for (const key of Object.keys(saxonyAnhaltProgrammeEditorialV2[sourceKey].centralAssessments)) {
    if (!byKey.has(key)) fail(`${sourceKey}: reviewed central commitment ${key} is not present in source model`);
  }

  const duplicate = new Map<string, number>();
  for (const commitment of model.commitments) {
    const state = commitment.impactPotentials[0]?.stateChange?.replace(/\s+/g, " ").trim();
    if (!state) continue;
    duplicate.set(state, (duplicate.get(state) ?? 0) + 1);
  }
  legacyDuplicateClusters += [...duplicate.values()].filter((count) => count >= 3).length;
}

const bsw = saxonyAnhaltProgrammeEditorialV2["ltw-2026-st-bsw"];
if (bsw.centralAssessments["ltw-2026-st-bsw-0005-junge-menschen-duerfen-nicht-aus-sozialer-unsicherheit-ode"]?.direction !== "POSITIVE") {
  fail("BSW commitment 5 must expose the reviewed positive potential rather than a generic change statement");
}
if (bsw.centralAssessments["ltw-2026-st-bsw-0004-sachsenanhalt-darf-nicht-weiter-militarisiert-werden"]?.direction !== "OPEN") {
  fail("BSW commitment 4 must remain OPEN until the term and instrument are concrete");
}
const linkeCollision = saxonyAnhaltProgrammeEditorialV2["ltw-2026-st-linke"].centralAssessments["ltw-2026-st-linke-0010-dass-ehrenamtliche-mitglieder-der-kommunalen-vertretungen"];
if (linkeCollision?.sourceQuality !== "SOURCE_COLLISION" || linkeCollision.evidence !== "NOT_ASSESSABLE") {
  fail("known Linke source collision must fail closed");
}

console.log(JSON.stringify({
  status: "pass",
  programmes: sourceKeys.length,
  publicationObjects: sourceKeys.length * 2,
  route: "/laender/sachsen-anhalt/wahlprogramme/[sourceKey]",
  blueprint: "programme-blueprint-v3",
  programmePotentialSummaryVisibleInOverview: true,
  allApprovedProgrammeKeyFindingsVisibleInOverview: true,
  reviewedCentralAssessments: sourceKeys.reduce((sum, sourceKey) => sum + Object.keys(saxonyAnhaltProgrammeEditorialV2[sourceKey].centralAssessments).length, 0),
  legacyDuplicateTemplateClustersDetected: legacyDuplicateClusters,
  legacyTemplatesUsedAsCurrentShortAssessment: false,
  publicPresentationGate: "pass"
}));
