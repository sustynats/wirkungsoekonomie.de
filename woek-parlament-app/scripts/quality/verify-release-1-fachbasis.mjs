import fs from "node:fs";
import path from "node:path";

function fail(message) {
  console.error(`FACHBASIS RELEASE CHECK FAILED: ${message}`);
  process.exitCode = 1;
}

const dossierRoot = path.resolve("public/fachakten/dossiers");
const requiredProgrammeDossiers = [
  "sachsen-anhalt-cdu", "sachsen-anhalt-spd", "sachsen-anhalt-gruene", "sachsen-anhalt-linke", "sachsen-anhalt-afd", "sachsen-anhalt-bsw",
  "bund-btw-2025-cdu-csu", "bund-btw-2025-spd", "bund-btw-2025-gruene", "bund-btw-2025-linke", "bund-btw-2025-afd", "bund-btw-2025-ssw", "bund-coalition-2025-cdu-csu-spd"
];
const dossierStylesheet = path.resolve("public/fachakten/dossiers.css");
if (!fs.existsSync(dossierStylesheet) || fs.statSync(dossierStylesheet).size < 1_000) fail("External dossier stylesheet is missing or implausibly short.");
const dossierScript = path.resolve("public/fachakten/dossiers.js");
if (!fs.existsSync(dossierScript) || fs.statSync(dossierScript).size < 1_000) fail("External dossier navigation script is missing or implausibly short.");

for (const id of requiredProgrammeDossiers) {
  const file = path.join(dossierRoot, `${id}.html`);
  if (!fs.existsSync(file)) fail(`Required public programme dossier missing: ${id}`);
  if (fs.statSync(file).size < 4_000) fail(`Public programme dossier is implausibly short: ${id}`);
  const html = fs.readFileSync(file, "utf8");
  if (/<style[\s>]/i.test(html)) fail(`Public programme dossier still uses CSP-blocked inline styles: ${id}`);
  if (!html.includes('href="/fachakten/dossiers.css"')) fail(`Public programme dossier does not load the shared stylesheet: ${id}`);
  if (!html.includes('src="/fachakten/dossiers.js"')) fail(`Public dossier has no progressive navigation script: ${id}`);
  if (!html.includes('class="dossier-layout"') || !html.includes('class="dossier-method-path"')) fail(`Public dossier has no structured web layout: ${id}`);
  if (!html.includes('name="author" content="Institut für Wirkungsökonomie"')) fail(`Public dossier has no institutional author metadata: ${id}`);
  if (/\b(?:SECURITY_POLICE_JUSTICE|TAX_FISCAL_BUDGET|EDUCATION|MULTI_LEVEL|CONDITIONAL)\b/.test(html)) fail(`Public programme dossier exposes known machine labels: ${id}`);
}

const publicIndex = JSON.parse(fs.readFileSync("data/fachakten/public/index.json", "utf8"));
for (const sourceKey of ["ltw-2026-st-cdu", "ltw-2026-st-spd", "ltw-2026-st-gruene", "ltw-2026-st-linke", "ltw-2026-st-afd", "ltw-2026-st-bsw"]) {
  const summary = publicIndex.programmes?.[sourceKey];
  for (const field of ["resultHeadline", "resultTeaser", "potentialHighlights", "riskHighlights", "conditions"]) {
    if (!summary?.[field] || summary[field].length === 0) fail(`${sourceKey} is missing its public result field: ${field}`);
  }
}

const projection = JSON.parse(fs.readFileSync("data/public-working-acts.json", "utf8"));
if (!Array.isArray(projection) || projection.length !== 28) fail("Expected all 28 Release-1 working acts.");
let publishedVoteLayers = 0;
for (const item of projection) {
  if (!item.fachakteId || !/^case-[0-9a-f-]{36}$/i.test(item.fachakteId)) fail(`${item.slug} is missing its complete fachakte link.`);
  if (!item.plainTitle || /^Wirkungsökonomische Vorprüfung/i.test(item.plainTitle)) fail(`${item.slug} has no publishable short title.`);
  if (!item.summary || /Die Entscheidung (steht noch aus|ist getroffen)\. Die Akte zeigt/i.test(item.summary)) fail(`${item.slug} still has a generic release summary.`);
  const dossier = path.join(dossierRoot, `${item.fachakteId}.html`);
  if (!fs.existsSync(dossier) || fs.statSync(dossier).size < 4_000) fail(`${item.slug} is missing its complete public dossier.`);
  const dossierHtml = fs.readFileSync(dossier, "utf8");
  if (!dossierHtml.includes('src="/fachakten/dossiers.js"') || !dossierHtml.includes('class="dossier-layout"') || !dossierHtml.includes('class="dossier-method-path"')) {
    fail(`${item.slug} has no structured full-dossier web layout.`);
  }
  if (!dossierHtml.includes('name="author" content="Institut für Wirkungsökonomie"')) fail(`${item.slug} has no institutional dossier author metadata.`);
  if (JSON.stringify(item.publicWorkingAct?.reviewDetail?.boundaries ?? []).includes("Schutzgrenze wird geprüft")) fail(`${item.slug} overwrites a concrete protection boundary with a fallback.`);
  if (item.publicWorkingAct?.voteLayer) publishedVoteLayers += 1;
}
if (publishedVoteLayers !== 12) fail(`Expected 12 published official vote layers, found ${publishedVoteLayers}.`);

const projectionText = JSON.stringify(projection);
for (const sentinel of [
  "Unzulässige Eingriffe in Grundrechte dürfen nicht mit abstrakten Sicherheitsnutzen verrechnet werden.",
  "Grund- und Menschenrechte sowie Kindeswohl sind nicht kompensierbare Schutzgates und müssen fallbezogen geprüft werden.",
  "Rechtsschutz, Eigentumsrechte und erhebliche Umweltwirkungen bleiben projektbezogene Schutzgates.",
  "Sicheres und gesundes Wohnen."
]) if (!projectionText.includes(sentinel)) fail(`Protection-boundary sentinel missing: ${sentinel}`);

const directionReviewPath = path.resolve("data/fachakten/direction-review.json");
if (!fs.existsSync(directionReviewPath)) fail("Direction review list is missing.");
else {
  const directionReview = JSON.parse(fs.readFileSync(directionReviewPath, "utf8"));
  if (directionReview.total_paths !== 128) fail(`Expected 128 direction-review rows, found ${directionReview.total_paths}.`);
  if (directionReview.direction_counts?.POSITIVE_POTENTIAL !== 49 || directionReview.direction_counts?.NEGATIVE_RISK !== 20 || directionReview.direction_counts?.AMBIVALENT !== 59) {
    fail("Direction review counts no longer match the authoritative Release 1.0 snapshot.");
  }
  const familyP4 = directionReview.rows?.find((row) => row.public_title === "Aussetzung des Familiennachzugs" && row.path_id === "P4");
  if (!familyP4?.proposed_issue_flags?.includes("OPEN_HYPOTHESIS_WITH_AMBIVALENT_CODE")) fail("Family-reunification P4 is not flagged for OPEN/AMBIVALENT method review.");
  const budgetReviews = directionReview.rows?.filter((row) => row.public_title === "Bundeshaushalt 2027" && row.proposed_issue_flags?.includes("DIRECTION_RATIONALE_REQUIRED")) ?? [];
  if (budgetReviews.length !== 11) fail(`Expected 11 budget direction-rationale reviews, found ${budgetReviews.length}.`);
}

const familyVote = projection.find((item) => item.publicWorkingAct?.voteLayer?.overall?.yes === 444);
if (!familyVote || familyVote.publicWorkingAct.voteLayer.overall.no !== 133 || familyVote.publicWorkingAct.voteLayer.overall.notVoted !== 53 || !familyVote.publicWorkingAct.voteLayer.sourceConflict) {
  fail("The official family-reunification roll-call result or documented source conflict is incomplete.");
}

const integrityReportPath = path.resolve("public/fachakten/production-integrity-report.json");
if (!fs.existsSync(integrityReportPath)) fail("Production integrity report is missing.");
else {
  const integrity = JSON.parse(fs.readFileSync(integrityReportPath, "utf8"));
  if (integrity.result !== "PASS" || integrity.cases !== 28 || integrity.missing_paths?.length !== 0 || integrity.fallback_overwrites?.length !== 0) {
    fail("Production integrity report does not pass with 28 complete case dossiers.");
  }
}

const gegDossier = path.join(dossierRoot, "gebaeudeenergiegesetz-medienwirkung.html");
if (!fs.existsSync(gegDossier)) fail("Complete GEG publication source is missing.");
else {
  const gegHtml = fs.readFileSync(gegDossier, "utf8");
  for (const sentinel of ["GEG-SRC-20", "fachlich complete with causality limits", "ready for public release with evidence boundaries"]) {
    if (!gegHtml.toLowerCase().includes(sentinel.toLowerCase())) fail(`Complete GEG publication source is missing sentinel: ${sentinel}`);
  }
}

if (!process.exitCode) console.log(JSON.stringify({ status: "pass", stateProgrammeFachakten: 6, federalProgrammeFachakten: 7, decisionFachakten: 28, specialistFachakten: 1, fullPublicDossiers: 42, publishedVoteLayers }));
