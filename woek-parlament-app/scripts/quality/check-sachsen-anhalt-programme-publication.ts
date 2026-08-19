import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import publicationSources from "../../data/generated/release-1/publication-sources.json";
import { saxonyAnhaltElectionProgrammes } from "../../data/sachsen-anhalt-election-programmes";
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
if (!existsSync(routePath)) fail("public programme detail route is missing");
const routeSource = readFileSync(routePath, "utf8");
for (const requiredToken of [
  "getSaxonyAnhaltPublicationSources",
  "presentSaxonyAnhaltSource",
  "vollstaendige-wirkungsakte",
  "vollstaendiges-zusageregister"
]) {
  if (!routeSource.includes(requiredToken)) fail(`detail route does not contain ${requiredToken}`);
}

const programmes = saxonyAnhaltElectionProgrammes;
if (programmes.length !== 6) fail(`expected 6 programme source records, found ${programmes.length}`);
const sourceKeys = programmes.map((programme) => programme.sourceKey);
if (new Set(sourceKeys).size !== sourceKeys.length) fail("programme source keys are not unique");

const documents = Array.isArray((publicationSources as { documents?: unknown }).documents)
  ? ((publicationSources as { documents: PublicationRecord[] }).documents)
  : fail("publication-sources.json has no documents array");

for (const sourceKey of sourceKeys) {
  const records = documents.filter((record) => record.source_key === sourceKey);
  const review = records.filter((record) => record.kind === "SAXONY_ANHALT_ELECTION_PROGRAMME_REVIEW");
  const commitments = records.filter((record) => record.kind === "SAXONY_ANHALT_COMMITMENT_REGISTER");
  if (review.length !== 1) fail(`${sourceKey}: expected exactly one review record, found ${review.length}`);
  if (commitments.length !== 1) fail(`${sourceKey}: expected exactly one commitment register, found ${commitments.length}`);

  const expectedRoute = `/laender/sachsen-anhalt/wahlprogramme/${sourceKey}`;
  for (const [label, record] of [["review", review[0]], ["commitments", commitments[0]]] as const) {
    const renderedRoute = typeof record.rendered_route === "string" ? record.rendered_route : "";
    if (!renderedRoute.startsWith(expectedRoute)) fail(`${sourceKey}: ${label} rendered_route does not point to ${expectedRoute}`);
    const markdownFile = typeof record.markdown_file === "string" ? record.markdown_file : "";
    if (!markdownFile || markdownFile.includes("..") || path.isAbsolute(markdownFile)) fail(`${sourceKey}: ${label} markdown_file is invalid`);
    const markdownPath = path.join(root, "data/fachakten/release-1", markdownFile);
    if (!existsSync(markdownPath)) fail(`${sourceKey}: ${label} markdown file is missing`);
    if (statSync(markdownPath).size === 0) fail(`${sourceKey}: ${label} markdown file is empty`);
  }
}

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
  publicPresentationGate: "pass"
}));
