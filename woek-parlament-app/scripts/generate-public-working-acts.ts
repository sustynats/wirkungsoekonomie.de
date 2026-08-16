#!/usr/bin/env tsx

import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { assertExternalReviewSafe } from "@/lib/review/privacy";
import { isSafePublicSourceUrl } from "@/lib/sources/public-registry";
import type {
  ParliamentaryCase,
  PublicMaturityStatus,
  PublicNormativeMapping,
  PublicNormativeMappingItem,
  PublicReviewDetail
} from "@/data/cases";
import { getNormativeReference } from "@/lib/normative/reference-registry";

type DatabaseCase = {
  id: string;
  slug: string;
  title: string;
  official_title: string | null;
  kind: string;
  decision_date: string | null;
  current_stage: string | null;
  materiality: string | null;
};

type ReviewRow = {
  id: string;
  case_id: string;
  review_batch_id: string;
  result_payload: unknown;
  imported_at: string;
  import_status: string;
};

type ReviewRevisionRow = {
  external_review_result_id: string;
  result_payload: unknown;
  imported_at: string;
  import_status: string;
};

type BatchCaseRow = {
  package_payload: unknown;
};

type JsonRecord = Record<string, unknown>;

function loadLocalEnvironment() {
  try {
    for (const line of readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const name = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      if (name && process.env[name] === undefined) process.env[name] = value;
    }
  } catch {
    // A hosted environment supplies configuration directly.
  }
}

function object(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function records(value: unknown) {
  return Array.isArray(value) ? value.map(object) : [];
}

function recordOrStringItems(value: unknown, field: string) {
  if (!Array.isArray(value)) return [] as Array<JsonRecord | string>;
  return value.map((item, index) => {
    if (typeof item === "string" && item.trim()) return item.trim();
    if (item && typeof item === "object" && !Array.isArray(item)) return item as JsonRecord;
    throw new Error(`${field}[${index}] has an unsupported public source shape.`);
  });
}

function strings(value: unknown, cap = 8) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()))].slice(0, cap)
    : [];
}

function safeDate(value: unknown, fallback: string) {
  const candidate = text(value);
  return /^\d{4}-\d{2}-\d{2}/.test(candidate) ? candidate.slice(0, 10) : fallback;
}

function firstText(rows: JsonRecord[], fields: string[], cap = 8) {
  return rows
    .map((item) => fields.map((field) => text(item[field])).find(Boolean) ?? "")
    .filter(Boolean)
    .slice(0, cap);
}

function unique(items: string[], cap = 8) {
  return [...new Set(items.filter(Boolean))].slice(0, cap);
}

function isClosedStage(stage: string) {
  return /(verkündet|abgelehnt|zurückgezogen|abgeschlossen|erledigt)/i.test(stage);
}

/**
 * Parliamentary titles are legal identifiers and can run over several lines.
 * The public view leads with a neutral short title and keeps the complete
 * official title directly below it.  This is presentation only: no legal or
 * factual wording is replaced in the underlying case record.
 */
function shortDecisionTitle(value: string) {
  const title = value.replace(/^\.\.\.\s*/, "").replace(/\s+/g, " ").trim();
  if (/Feststellung des Bundeshaushaltsplans.*Haushaltsjahr 2027/i.test(title)) return "Bundeshaushalt 2027";
  if (/Errichtung eines Sondervermögens Infrastruktur und Klimaneutralität/i.test(title)) return "Sondervermögen Infrastruktur und Klimaneutralität";
  if (/Finanzierung von Infrastrukturinvestitionen von Ländern und Kommunen/i.test(title)) return "Infrastrukturfinanzierung für Länder und Kommunen";

  const aliases = [...title.matchAll(/\(([^()]{3,100})\)/g)].map((match) => match[1].trim());
  const alias = aliases.at(-1);
  if (alias && alias.length <= 72 && /[\p{L}]/u.test(alias)) {
    return alias.replace(/\s*-\s*[A-ZÄÖÜ]{2,8}\s*\d{0,4}$/u, "").trim();
  }

  const dashParts = title.split(/\s[-–]\s/).map((part) => part.trim()).filter(Boolean);
  const finalDashPart = dashParts.at(-1);
  if (dashParts.length > 1 && finalDashPart && finalDashPart.length >= 14 && finalDashPart.length <= 82) return finalDashPart;

  const change = title.match(/^(?:[A-Z][a-zäöüß]+\s+)?Gesetz zur Änderung des (.{3,95})$/u);
  if (change) return `Änderung des ${change[1]}`;
  return title;
}

function maturityFor(result: JsonRecord, stage: string): PublicMaturityStatus {
  const retrospective = object(result.retrospective);
  const readiness = text(retrospective.publication_readiness, text(result.publication_readiness));
  if (readiness === "METHOD_REVIEW_REQUIRED") return "METHOD_REVIEW";
  if (readiness === "CALCULATION_REQUIRED") return "CALCULATION";
  if (readiness === "NOT_YET_ASSESSABLE") return "MONITORING";
  if (readiness === "READY_FOR_EDITORIAL_APPROVAL") return "REVIEW_COMPLETE";
  return isClosedStage(stage) ? "EVIDENCE_REVIEW" : "PRELIMINARY_REVIEW";
}

function maturityCopy(maturity: PublicMaturityStatus) {
  const copy: Record<PublicMaturityStatus, string> = {
    PRELIMINARY_REVIEW: "Die Entscheidung steht noch aus. Die Akte zeigt die dokumentierten Wirkungspotenziale, Wirkungsrisiken, Wirkpfade und veränderbaren Stellschrauben – nicht eine bereits eingetretene Wirkung.",
    MONITORING: "Die Entscheidung ist getroffen. Die Akte zeigt, was beobachtet werden muss; für eine belastbare Rückschau reicht die bisherige Beobachtungszeit noch nicht aus.",
    EVIDENCE_REVIEW: "Erste Informationen liegen vor. Eine beobachtete Entwicklung wird erst nach einer belastbaren Vergleichs- und Zurechnungsprüfung als Wirkung eingeordnet.",
    CALCULATION: "Die dokumentierten Berechnungsansätze benennen die belegten Eingaben, fehlenden Werte und Regeln, die vor einer reproduzierbaren Rechnung erforderlich sind.",
    METHOD_REVIEW: "Der Fall macht sichtbar, welche Vergleichsfrage oder methodische Regel vor einer belastbaren Einordnung geklärt werden muss.",
    REVIEW_COMPLETE: "Die vollständige fachliche Prüfung liegt vor und ist für die redaktionelle Freigabe vorbereitet. Quellen, Annahmen, Grenzen und Rechenwege bleiben sichtbar."
  };
  return copy[maturity];
}

function caseKind(stage: string) {
  return isClosedStage(stage) ? "RETROSPECTIVE_CASE" as const : "RADAR" as const;
}

function publicSources(packagePayload: unknown, retrievedAt: string) {
  const sourceManifest = records(object(packagePayload).source_manifest);
  return sourceManifest.flatMap((source) => {
    const url = isSafePublicSourceUrl(text(source.url));
    if (!url) return [];
    return [{
      title: text(source.title, "Amtliche Quelle"),
      publisher: text(source.institution, "Amtliche Stelle"),
      url,
      retrievedAt: safeDate(source.retrieved_at, retrievedAt),
      note: text(source.document_type, "Amtliche Entscheidungsgrundlage")
    }];
  }).slice(0, 8);
}

/**
 * A normative tile is a transparent view of a documented impact path, not a
 * new score. Registry labels and the internal source-detail route are used
 * instead of review-supplied labels or direct external links.
 */
function publicNormativeMapping(result: JsonRecord): PublicNormativeMapping | undefined {
  const mapping = object(result.normative_mapping);
  const tileRows = records(mapping.tile_mappings);
  if (tileRows.length === 0) return undefined;

  const sdgItems: PublicNormativeMappingItem[] = [];
  const sdgPlusItems: PublicNormativeMappingItem[] = [];
  const constitutionalAnchorItems: PublicNormativeMappingItem[] = [];
  for (const tile of tileRows) {
    const reference = getNormativeReference(text(tile.id));
    const direction = text(tile.direction);
    const evidenceStatus = text(tile.evidence_status);
    const rationale = text(tile.rationale);
    if (!reference || !direction || !evidenceStatus || !rationale) continue;
    const item: PublicNormativeMappingItem = {
      id: reference.id,
      framework: reference.framework,
      code: reference.code,
      label: reference.label,
      direction: direction as PublicNormativeMappingItem["direction"],
      evidenceStatus,
      rationale,
      impactPathRefs: strings(tile.impact_path_refs, 12),
      referenceHref: `/quellen/${reference.sourceSlug}`,
      constitutionalAnchorType: reference.constitutionalAnchorType,
      legalReference: reference.legalReference
    };
    if (reference.framework === "SDG") sdgItems.push(item);
    else if (reference.framework === "SDG_PLUS") sdgPlusItems.push(item);
    else constitutionalAnchorItems.push(item);
  }
  const mergeItems = (items: PublicNormativeMappingItem[]) => {
    const merged = new Map<string, PublicNormativeMappingItem>();
    for (const item of items) {
      const existing = merged.get(item.id);
      if (!existing) {
        merged.set(item.id, item);
        continue;
      }
      const rationales = unique([existing.rationale, item.rationale], 3);
      merged.set(item.id, {
        ...existing,
        direction: existing.direction === item.direction ? existing.direction : "AMBIVALENT",
        evidenceStatus: existing.evidenceStatus === item.evidenceStatus ? existing.evidenceStatus : "Evidenzstand je Wirkpfad unterschiedlich",
        rationale: rationales.join("\n\n"),
        impactPathRefs: unique([...existing.impactPathRefs, ...item.impactPathRefs], 12)
      });
    }
    return [...merged.values()];
  };
  const consolidatedSdgs = mergeItems(sdgItems);
  const consolidatedSdgPlus = mergeItems(sdgPlusItems);
  const consolidatedAnchors = mergeItems(constitutionalAnchorItems);
  if (consolidatedSdgs.length + consolidatedSdgPlus.length + consolidatedAnchors.length === 0) return undefined;
  const hasOpenEvidence = [...consolidatedSdgs, ...consolidatedSdgPlus, ...consolidatedAnchors]
    .some((item) => item.direction === "EVIDENCE_OPEN" || /open|lücke|unklar/i.test(item.evidenceStatus));
  return {
    // A working act is always a published preparation, never a final approval.
    status: hasOpenEvidence ? "EVIDENCE_OPEN" : "PROVISIONAL",
    basis: text(mapping.reference_frame, "Zuordnung zu SDGs, SDG+ und gegebenenfalls zum Verfassungs- und Staatszielrahmen anhand der dokumentierten Wirkpfade; keine Gesamtpunktzahl."),
    sdgItems: consolidatedSdgs,
    sdgPlusItems: consolidatedSdgPlus,
    constitutionalAnchorItems: consolidatedAnchors
  };
}

/**
 * Creates the public deep-dive from the validated review structure.  The
 * projection keeps review content that explains a published claim, but never
 * exports internal source identifiers, reviewer metadata, local paths or
 * unverified numeric operands.
 */
function publicReviewDetail(result: JsonRecord, impactPaths: JsonRecord[]): PublicReviewDetail | undefined {
  const exAnte = object(result.ex_ante);
  const retrospective = object(result.retrospective);
  const monitoring = object(retrospective.monitoring_and_correction);
  const detail: PublicReviewDetail = {
    impactPaths: impactPaths.map((path, index) => ({
      id: text(path.path_id, `P${index + 1}`),
      lever: text(path.lever, text(path.mechanism, `Wirkpfad ${text(path.path_id, `P${index + 1}`)}`)),
      hypothesis: text(path.hypothesis, "Die dokumentierte Wirkannahme wird mit Quellen und Vergleichsfragen weiter geprüft."),
      direction: text(path.direction, "EVIDENCE_OPEN"),
      affectedDimensions: strings(path.affected_mpd_dimensions, 8),
      affectedGroups: strings(path.affected_groups, 16),
      prerequisites: strings(path.prerequisites, 16),
      risks: strings(path.risks_and_side_effects, 16),
      evidenceBoundary: text(path.evidence_boundary, text(exAnte.evidence_boundary, "Die Evidenzgrenze wird im Quellen- und Rechenweg sichtbar gehalten.")),
      evidenceStatus: text(path.evidence_status, "EVIDENCE_OPEN"),
      changeLever: text(path.change_lever_for_positive_net_impact)
    })),
    impactDomains: recordOrStringItems(result.impact_domains, "impact_domains").map((domain) => typeof domain === "string"
      ? { domain, relevance: [], assessment: "EX_ANTE_ONLY" }
      : {
          domain: text(domain.domain),
          relevance: strings(domain.relevance, 16),
          assessment: text(domain.assessment, "EVIDENCE_OPEN")
        }).filter((domain) => domain.domain),
    calculations: records(result.calculation_requirements).map((calculation, index) => ({
      id: text(calculation.calculation_id, `C${index + 1}`),
      name: text(calculation.name, "Berechnungsansatz"),
      specification: text(calculation.specification, "Die Berechnungsvoraussetzungen werden transparent dokumentiert."),
      requiredInputs: strings(calculation.required_inputs, 20),
      availableInputs: strings(calculation.available_inputs, 20),
      missingInputs: strings(calculation.missing_inputs, 20),
      status: text(calculation.status, "DATA_GAP")
    })),
    risks: records(result.risks).map((risk, index) => ({
      id: text(risk.risk_id, `R${index + 1}`),
      description: text(risk.description, "Risiko wird im weiteren Fallverlauf geprüft."),
      status: text(risk.status, "EVIDENCE_OPEN"),
      nonCompensationRelevant: risk.non_compensation_relevance === true
    })),
    boundaries: recordOrStringItems(result.non_compensable_boundaries, "non_compensable_boundaries").map((boundary) => typeof boundary === "string"
      ? { boundary, status: "MUST_BE_TESTED" }
      : {
          boundary: text(boundary.boundary),
          status: text(boundary.gate_status, "MUST_BE_TESTED"),
          reason: text(boundary.reason) || undefined
        }).filter((boundary) => boundary.boundary),
    counterfactuals: records(result.counterfactuals).map((counterfactual) => ({
      question: text(counterfactual.question, "Welche Entwicklung wäre ohne die Entscheidung plausibel?"),
      status: text(counterfactual.status, "REQUIRED_NOT_ESTABLISHED"),
      causalRule: text(counterfactual.causal_rule, "Ohne begründete Vergleichsfrage wird keine starke Zurechnungsbehauptung veröffentlicht.")
    })),
    counterarguments: strings(result.counterarguments, 20)
  };
  const feedback = {
    currentStatus: text(retrospective.current_proposal_effect_status),
    interpretation: text(retrospective.interpretation),
    outputFeedback: text(monitoring.output_feedback),
    outcomeFeedback: text(monitoring.outcome_feedback),
    causalReview: text(monitoring.causal_review),
    dataGaps: strings(retrospective.feedback_data_gaps, 20)
  };
  if (Object.values(feedback).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value))) detail.feedback = feedback;
  const hasContent = detail.impactPaths.length + detail.impactDomains.length + detail.calculations.length + detail.risks.length + detail.boundaries.length + detail.counterfactuals.length + detail.counterarguments.length > 0;
  return hasContent ? detail : undefined;
}

function buildWorkingAct(caseRow: DatabaseCase, review: ReviewRow, packagePayload: unknown): ParliamentaryCase {
  const result = object(review.result_payload);
  const decision = object(result.decision);
  const exAnte = object(result.ex_ante);
  const impactPaths = records(exAnte.impact_paths).length > 0 ? records(exAnte.impact_paths) : records(result.impact_paths);
  const dataGaps = records(result.data_gaps);
  const counterfactuals = records(result.counterfactuals);
  const maturity = maturityFor(result, caseRow.current_stage ?? "");
  const stage = text(caseRow.current_stage, "Amtlicher Verfahrensstand wird fortlaufend geprüft");
  const retrievedAt = safeDate(review.imported_at, new Date().toISOString().slice(0, 10));
  const potential = text(exAnte.overall_potential, text(exAnte.scope_statement, "Die Fallakte wird auf Grundlage der amtlichen Unterlagen strukturiert."));
  const levers = unique(firstText(impactPaths, ["change_lever_for_positive_net_impact"], 5));
  const risks = unique([
    ...impactPaths.flatMap((item) => strings(item.risks_and_side_effects, 6)),
    ...firstText(records(exAnte.risks_and_side_effects), ["description", "risk"], 8),
    ...firstText(records(result.risks), ["description", "risk"], 8)
  ], 8);
  const groups = unique(impactPaths.flatMap((item) => strings(item.affected_groups, 8)), 10);
  const pathSummary = impactPaths.slice(0, 5).map((item) => {
    const lever = text(item.lever);
    const hypothesis = text(item.hypothesis);
    return lever && hypothesis ? `${lever}: ${hypothesis}` : hypothesis || lever;
  }).filter(Boolean);
  const questions = unique([
    ...counterfactuals.map((item) => text(item.question)),
    ...dataGaps.slice(0, 2).map((item) => `Welche belastbare Grundlage fehlt noch: ${text(item.description)}`)
  ], 5);
  const sourceCount = publicSources(packagePayload, retrievedAt).length;
  const normativeMapping = publicNormativeMapping(result);
  const reviewDetail = publicReviewDetail(result, impactPaths);

  const materiality = caseRow.materiality === "VERY_HIGH" || caseRow.materiality === "HIGH" || caseRow.materiality === "MEDIUM" || caseRow.materiality === "WATCH"
    ? caseRow.materiality
    : "HIGH";

  const finalVersion = text(decision.final_version);
  return {
    slug: caseRow.slug,
    // Titles identify the parliamentary decision. The analytical maturity is
    // a small, visible status below the title, never a repeated headline.
    title: caseRow.official_title ?? caseRow.title,
    plainTitle: shortDecisionTitle(caseRow.official_title ?? caseRow.title),
    kind: caseKind(stage),
    editorialStatus: "WORKING_ACT_PUBLISHED",
    materiality,
    parliamentaryStatus: stage,
    statusVerification: "VERIFIED",
    nextEvent: null,
    lastUpdated: retrievedAt,
    summary: `${maturityCopy(maturity)} ${sourceCount > 0 ? `Die Akte verweist auf ${sourceCount} amtliche Quellen.` : "Die amtlichen Quellen werden sichtbar nachgeführt."}`,
    whatIsDecided: text(decision.object, caseRow.official_title ?? caseRow.title),
    analysisStatus: maturity,
    intendedGoal: text(object(result.ex_ante).official_objective, "Das amtlich benannte Ziel und die Wirkungslogik werden in dieser Akte getrennt ausgewiesen."),
    impactPath: pathSummary.length ? pathSummary : ["Die relevanten Wirkpfade werden mit der amtlichen Fassung und belastbaren Quellen weiter präzisiert."],
    affectedGroups: groups,
    questions: questions.length ? questions : ["Welche Daten, Annahmen und Vergleichsmaßstäbe sind noch erforderlich?"],
    sources: publicSources(packagePayload, retrievedAt),
    versionNote: finalVersion
      ? `Betrachtete Fassung: ${finalVersion}`
      : "Die hier dokumentierte amtliche Fassung wird bei jeder parlamentarischen Änderung erneut abgeglichen.",
    retrospective: caseKind(stage) === "RETROSPECTIVE_CASE",
    publicWorkingAct: {
      maturity,
      scopeStatement: text(exAnte.scope_statement, "Die Akte trennt amtlichen Sachverhalt, Wirkungspotenzial, Wirkungsrisiko, Datenlücken und spätere Beobachtung."),
      overallPotential: potential,
      changeLevers: levers,
      risks,
      dataGaps: firstText(dataGaps, ["description"], 12),
      counterfactualQuestions: firstText(counterfactuals, ["question"], 6),
      normativeMapping,
      reviewDetail
    }
  };
}

async function packageForReview(review: ReviewRow) {
  const rows = await supabaseRest<BatchCaseRow[]>(
    `parliament.review_batch_cases?review_batch_id=eq.${encodeURIComponent(review.review_batch_id)}&case_id=eq.${encodeURIComponent(review.case_id)}&select=package_payload&limit=1`
  );
  return rows[0]?.package_payload ?? {};
}

async function main() {
  loadLocalEnvironment();
  const reviewRows = await supabaseRest<ReviewRow[]>(
    "parliament.external_review_results?select=id,case_id,review_batch_id,result_payload,imported_at,import_status&order=imported_at.desc&limit=250"
  );
  const reviewIds = [...new Set(reviewRows.map((review) => review.id))];
  const revisions = reviewIds.length === 0
    ? []
    : await supabaseRest<ReviewRevisionRow[]>(`parliament.external_review_result_revisions?external_review_result_id=in.(${reviewIds.map(encodeURIComponent).join(",")})&select=external_review_result_id,result_payload,imported_at,import_status&order=imported_at.desc&limit=1000`);
  const latestValidRevision = new Map<string, ReviewRevisionRow>();
  for (const revision of revisions) {
    if (revision.import_status === "REVIEW_PROPOSAL" && !latestValidRevision.has(revision.external_review_result_id)) {
      latestValidRevision.set(revision.external_review_result_id, revision);
    }
  }
  const effectiveReviewRows = reviewRows.flatMap((review) => {
    const revision = latestValidRevision.get(review.id);
    if (revision) return [{ ...review, result_payload: revision.result_payload, imported_at: revision.imported_at, import_status: revision.import_status }];
    return review.import_status === "REVIEW_PROPOSAL" ? [review] : [];
  });
  const latestReviewByCase = new Map<string, ReviewRow>();
  for (const review of effectiveReviewRows) if (!latestReviewByCase.has(review.case_id)) latestReviewByCase.set(review.case_id, review);
  const caseIds = [...latestReviewByCase.keys()];
  if (caseIds.length === 0) throw new Error("No validated review proposals are available for public working-act generation.");
  const encodedIds = caseIds.map(encodeURIComponent).join(",");
  const cases = await supabaseRest<DatabaseCase[]>(
    `parliament.cases?id=in.(${encodedIds})&select=id,slug,title,official_title,kind,decision_date,current_stage,materiality&limit=250`
  );
  const rows: ParliamentaryCase[] = [];
  for (const caseRow of cases) {
    const review = latestReviewByCase.get(caseRow.id);
    if (!review) continue;
    rows.push(buildWorkingAct(caseRow, review, await packageForReview(review)));
  }
  rows.sort((left, right) => {
    const leftBudget = /haushaltsgesetz 2027/i.test(left.plainTitle) ? 1 : 0;
    const rightBudget = /haushaltsgesetz 2027/i.test(right.plainTitle) ? 1 : 0;
    return rightBudget - leftBudget || right.lastUpdated.localeCompare(left.lastUpdated) || left.title.localeCompare(right.title, "de");
  });
  assertExternalReviewSafe(rows, "public-working-acts");
  const output = path.resolve(process.cwd(), "data/public-working-acts.json");
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ output: "data/public-working-acts.json", working_acts: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not generate public working acts.");
  process.exit(1);
});
