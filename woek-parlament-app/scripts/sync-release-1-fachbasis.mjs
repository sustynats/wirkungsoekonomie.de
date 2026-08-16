import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const projectionPath = path.join(appRoot, "data/public-working-acts.json");
// The original review delivery is deliberately kept outside of public data.
// Public pages are built from the curated projection under data/fachakten/public.
// An explicit environment override keeps this import script usable for a later,
// separately stored review delivery without ever exposing a workstation path.
const sourceRoot = process.env.FACHBASIS_SOURCE_ROOT ?? path.join(appRoot, ".local", "fachbasis-source-20260816");
const casesRoot = path.join(sourceRoot, "02_parlament_28_and_votes", "cases");
const workingActs = JSON.parse(fs.readFileSync(projectionPath, "utf8"));
const sourceByDecision = new Map();

for (const caseDirectory of fs.readdirSync(casesRoot)) {
  const reviewPath = path.join(casesRoot, caseDirectory, "review-result.json");
  if (!fs.existsSync(reviewPath)) continue;
  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  if (review.decision?.object) sourceByDecision.set(review.decision.object, { caseId: caseDirectory, review });
}

let changed = 0;
for (const workingAct of workingActs) {
  const source = sourceByDecision.get(workingAct.title) ?? sourceByDecision.get(workingAct.whatIsDecided);
  if (!source) continue;
  const release = source.review.release_1_0;
  const publicSummary = source.review.public_summary;
  if (!release?.public_title || !publicSummary?.key_statement) continue;

  workingAct.plainTitle = release.public_title;
  // Preserve the supplied statement; "Zugang" is the clearer alltagssprachliche
  // form where the source uses the abstract noun "Zugänglichkeit".
  workingAct.summary = publicSummary.key_statement.replace(/messbar bessere Zugänglichkeit/g, "messbar besseren Zugang");
  workingAct.whatIsDecided = source.review.decision.object;
  workingAct.intendedGoal = publicSummary.what_is_known || publicSummary.key_statement;
  workingAct.fachakteId = `case-${source.caseId}`;
  workingAct.publicWorkingAct = {
    ...workingAct.publicWorkingAct,
    maturity: release.maturity_stage ?? workingAct.publicWorkingAct?.maturity,
    scopeStatement: release.public_release_boundary ?? workingAct.publicWorkingAct?.scopeStatement,
    overallPotential: publicSummary.key_statement,
    changeLevers: release.effect_improving_options ?? publicSummary.improvement_options ?? workingAct.publicWorkingAct?.changeLevers ?? [],
    releaseSummary: {
      whatIsKnown: publicSummary.what_is_known ?? null,
      whatIsNotYetKnown: publicSummary.what_is_not_yet_known ?? null,
      evidenceBoundary: publicSummary.evidence_boundary ?? release.public_release_boundary ?? null
    }
  };
  changed += 1;
}

if (changed !== workingActs.length) {
  throw new Error(`Release 1 Fachbasis unvollständig zugeordnet: ${changed}/${workingActs.length} Fälle.`);
}
fs.writeFileSync(projectionPath, `${JSON.stringify(workingActs, null, 2)}\n`);
console.log(JSON.stringify({ status: "synced", workingActs: changed }));
