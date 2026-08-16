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

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function objects(value, field) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`${field}[${index}] hat ein unbekanntes Schema.`);
    return item;
  });
}

function strings(value, cap = 20) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()))].slice(0, cap)
    : [];
}

function mixedText(value, field, cap = 20) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (typeof item === "string" && item.trim()) return item.trim();
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item;
      return text(record.argument, text(record.description, text(record.statement, text(record.risk, text(record.question)))));
    }
    throw new Error(`${field}[${index}] hat ein unbekanntes Schema.`);
  }).filter(Boolean).slice(0, cap);
}

function impactDomains(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (typeof item === "string" && item.trim()) return { domain: item.trim(), relevance: [], assessment: "EX_ANTE_ONLY" };
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item;
      const domain = text(record.domain);
      if (!domain) throw new Error(`impact_domains[${index}] enthält keine Domain.`);
      return { domain, relevance: strings(record.relevance, 16), assessment: text(record.assessment, "EVIDENCE_OPEN") };
    }
    throw new Error(`impact_domains[${index}] hat ein unbekanntes Schema.`);
  });
}

function boundaries(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (typeof item === "string" && item.trim()) return { boundary: item.trim(), status: "MUST_BE_TESTED" };
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item;
      const boundary = text(record.boundary);
      if (!boundary) throw new Error(`non_compensable_boundaries[${index}] enthält keine Schutzgrenze.`);
      return { boundary, status: text(record.gate_status, "MUST_BE_TESTED"), ...(text(record.reason) ? { reason: text(record.reason) } : {}) };
    }
    throw new Error(`non_compensable_boundaries[${index}] hat ein unbekanntes Schema.`);
  });
}

function publicReviewDetail(review) {
  const exAnte = object(review.ex_ante);
  const retrospective = object(review.retrospective);
  const monitoring = object(retrospective.monitoring_and_correction);
  const paths = objects(Array.isArray(exAnte.impact_paths) && exAnte.impact_paths.length ? exAnte.impact_paths : review.impact_paths, "impact_paths");
  const feedback = {
    currentStatus: text(retrospective.current_proposal_effect_status),
    interpretation: text(retrospective.interpretation),
    outputFeedback: text(monitoring.output_feedback),
    outcomeFeedback: text(monitoring.outcome_feedback),
    causalReview: text(monitoring.causal_review),
    dataGaps: strings(retrospective.feedback_data_gaps)
  };
  const detail = {
    impactPaths: paths.map((path, index) => {
      const id = text(path.path_id, `P${index + 1}`);
      return {
        id,
        lever: text(path.lever, text(path.mechanism, `Wirkpfad ${id}`)),
        hypothesis: text(path.hypothesis),
        direction: text(path.direction, "EVIDENCE_OPEN"),
        affectedDimensions: strings(path.affected_mpd_dimensions, 8),
        affectedGroups: strings(path.affected_groups, 16),
        prerequisites: strings(path.prerequisites, 16),
        risks: strings(path.risks_and_side_effects, 16),
        evidenceBoundary: text(path.evidence_boundary, text(exAnte.evidence_boundary)),
        evidenceStatus: text(path.evidence_status, "EVIDENCE_OPEN"),
        changeLever: text(path.change_lever_for_positive_net_impact)
      };
    }),
    impactDomains: impactDomains(review.impact_domains),
    calculations: objects(review.calculation_requirements, "calculation_requirements").map((calculation, index) => ({
      id: text(calculation.calculation_id, `C${index + 1}`),
      name: text(calculation.name, "Berechnungsansatz"),
      specification: text(calculation.specification),
      requiredInputs: strings(calculation.required_inputs),
      availableInputs: strings(calculation.available_inputs),
      missingInputs: strings(calculation.missing_inputs),
      status: text(calculation.status, "DATA_GAP")
    })),
    risks: objects(review.risks, "risks").map((risk, index) => ({
      id: text(risk.risk_id, `R${index + 1}`),
      description: text(risk.description, text(risk.risk)),
      status: text(risk.status, "EVIDENCE_OPEN"),
      nonCompensationRelevant: risk.non_compensation_relevance === true
    })).filter((risk) => risk.description),
    boundaries: boundaries(review.non_compensable_boundaries),
    counterfactuals: objects(review.counterfactuals, "counterfactuals").map((counterfactual) => ({
      question: text(counterfactual.question),
      status: text(counterfactual.status, "REQUIRED_NOT_ESTABLISHED"),
      causalRule: text(counterfactual.causal_rule)
    })).filter((counterfactual) => counterfactual.question),
    counterarguments: mixedText(review.counterarguments, "counterarguments")
  };
  if (Object.values(feedback).some((value) => Array.isArray(value) ? value.length : Boolean(value))) detail.feedback = feedback;
  return detail;
}

function voteSummary(value) {
  const row = object(value);
  const summary = {};
  const assign = (target, ...keys) => {
    const value = keys.map((key) => row[key]).find((candidate) => Number.isFinite(candidate));
    if (Number.isFinite(value)) summary[target] = value;
  };
  assign("members", "members", "total");
  assign("yes", "yes");
  assign("no", "no");
  assign("abstain", "abstain");
  assign("notVoted", "not_voted");
  return Object.keys(summary).length ? summary : undefined;
}

function publicVoteLayer(supplement) {
  const vote = object(supplement.vote_layer);
  if (text(vote.status) !== "VOTED") return undefined;
  const factionRows = object(vote.factions);
  return {
    status: text(vote.status),
    rollCall: text(vote.roll_call),
    ...(text(vote.date) ? { date: text(vote.date) } : {}),
    ...(text(vote.result) ? { result: text(vote.result) } : {}),
    ...(voteSummary(vote.overall) ? { overall: voteSummary(vote.overall) } : {}),
    factions: Object.entries(factionRows).map(([name, value]) => typeof value === "string"
      ? { name, result: value }
      : { name, ...(voteSummary(value) ? { summary: voteSummary(value) } : {}) }),
    ...(text(vote.url) ? { sourceUrl: text(vote.url) } : {}),
    ...(text(vote.note, text(vote.source_note)) ? { note: text(vote.note, text(vote.source_note)) } : {}),
    ...(text(vote.source_conflict) ? { sourceConflict: text(vote.source_conflict) } : {}),
    ...(text(vote.individual_records_status) ? { individualRecordsStatus: text(vote.individual_records_status) } : {})
  };
}

for (const caseDirectory of fs.readdirSync(casesRoot)) {
  const reviewPath = path.join(casesRoot, caseDirectory, "review-result.json");
  const supplementPath = path.join(casesRoot, caseDirectory, "decision-and-vote-supplement.json");
  if (!fs.existsSync(reviewPath)) continue;
  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  const supplement = fs.existsSync(supplementPath) ? JSON.parse(fs.readFileSync(supplementPath, "utf8")) : {};
  if (review.decision?.object) sourceByDecision.set(review.decision.object, { caseId: caseDirectory, review, supplement });
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
    },
    reviewDetail: publicReviewDetail(source.review),
    ...(publicVoteLayer(source.supplement) ? { voteLayer: publicVoteLayer(source.supplement) } : {})
  };
  changed += 1;
}

if (changed !== workingActs.length) {
  throw new Error(`Release 1 Fachbasis unvollständig zugeordnet: ${changed}/${workingActs.length} Fälle.`);
}
fs.writeFileSync(projectionPath, `${JSON.stringify(workingActs, null, 2)}\n`);
console.log(JSON.stringify({ status: "synced", workingActs: changed }));
