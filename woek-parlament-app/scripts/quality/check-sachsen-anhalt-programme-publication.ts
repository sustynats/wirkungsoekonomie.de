import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import publicationSources from "../../data/generated/release-1/publication-sources.json";
import { saxonyAnhaltElectionProgrammes } from "../../data/sachsen-anhalt-election-programmes";
import { buildSaxonyAnhaltProgrammeModel } from "../../lib/presentation/sachsen-anhalt-programme-model";
import { presentSaxonyAnhaltMarkdown } from "../../lib/presentation/sachsen-anhalt-programmes";

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
const routePath = path.join(root, "app/laender/sachsen-anhalt/wahlprogramme/[sourceKey]/page.tsx");
const componentPath = path.join(root, "app/components/SaxonyAnhaltProgrammeAnalysis.tsx");
const modelPath = path.join(root, "lib/presentation/sachsen-anhalt-programme-model.ts");
for (const requiredPath of [routePath, componentPath, modelPath]) {
  if (!existsSync(requiredPath)) fail(`required public presentation file is missing: ${path.relative(root, requiredPath)}`);
}

const routeSource = readFileSync(routePath, "utf8");
for (const requiredToken of ["getSaxonyAnhaltPublicationSources", "SaxonyAnhaltProgrammeAnalysis"]) {
  if (!routeSource.includes(requiredToken)) fail(`detail route does not contain ${requiredToken}`);
}
if (routeSource.includes("CompletePublicationSource")) fail("raw complete-publication renderer must not be the primary route renderer");

const componentSource = readFileSync(componentPath, "utf8");
for (const requiredToken of [
  "data-woek-sachsen-anhalt-public=\"structured-accordion-v2\"",
  "WÖk-Kurzbewertung",
  "vollstaendige-wirkungsakte",
  "vollstaendiges-zusageregister",
  "<details",
  "Zusammenfassende WÖk-Bewertung",
  "Fachlicher Vollnachweis und technische Prüfinformationen"
]) {
  if (!componentSource.includes(requiredToken)) fail(`public accordion component does not contain ${requiredToken}`);
}

const programmes = saxonyAnhaltElectionProgrammes;
if (programmes.length !== 6) fail(`expected 6 programme source records, found ${programmes.length}`);
const sourceKeys = programmes.map((programme) => programme.sourceKey);
if (new Set(sourceKeys).size !== sourceKeys.length) fail("programme source keys are not unique");

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

const linkeFiles = sourceFiles.get("ltw-2026-st-linke");
if (!linkeFiles) fail("Linke regression fixture is missing");
const linkeModel = buildSaxonyAnhaltProgrammeModel(
  readFileSync(linkeFiles.review, "utf8"),
  readFileSync(linkeFiles.commitments, "utf8")
);
if (linkeModel.commitments.length < 100) fail(`Linke accordion model unexpectedly contains only ${linkeModel.commitments.length} commitments`);
if (!linkeModel.summary || !linkeModel.policyDomains.length) fail("Linke public summary or programme structure is empty");
if (!linkeModel.commitments[0]?.impactPotentials.length) fail("Linke first commitment has no public impact-potential summary");

const technicalFixture = [
  "### programme_profile",
  "#### declared_objectives",
  "**implementation_boundary:** MULTI_LEVEL",
  "#### material_policy_domains",
  "- WORK_SOCIAL_SECURITY",
  "- SECURITY_POLICE_JUSTICE",
  "**analysis_time_status:** EX_ANTE_PROGRAMME_COMMITMENT"
].join("\n");
const publicFixture = presentSaxonyAnhaltMarkdown(technicalFixture);
for (const forbidden of [
  "programme_profile",
  "declared_objectives",
  "implementation_boundary",
  "material_policy_domains",
  "WORK_SOCIAL_SECURITY",
  "SECURITY_POLICE_JUSTICE",
  "MULTI_LEVEL",
  "EX_ANTE_PROGRAMME_COMMITMENT"
]) {
  if (publicFixture.includes(forbidden)) fail(`public presentation leaks technical token ${forbidden}`);
}

console.log(JSON.stringify({
  status: "pass",
  programmes: sourceKeys.length,
  publicationObjects: sourceKeys.length * 2,
  route: "/laender/sachsen-anhalt/wahlprogramme/[sourceKey]",
  accordionUx: "pass",
  linkeCommitmentsParsed: linkeModel.commitments.length,
  publicPresentationGate: "pass"
}));
