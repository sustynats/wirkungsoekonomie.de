#!/usr/bin/env tsx

import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import releasedCaseReviews from "@/data/generated/release-1/case-reviews.json";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { assertExternalReviewSafe, sha256 } from "@/lib/review/privacy";
import { isSafePublicSourceUrl } from "@/lib/sources/public-registry";
import type {
  ParliamentaryCase,
  PublicMaturityStatus,
  PublicFullReview,
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
type ReleasedCaseReviews = { reviews?: unknown[] };

const releasedReviewByCaseId = new Map(
  ((releasedCaseReviews as ReleasedCaseReviews).reviews ?? [])
    .map((review) => object(review))
    .filter((review) => text(review.case_id))
    .map((review) => [text(review.case_id), review])
);

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

function nonEmptyContentPaths(value: unknown, prefix = ""): string[] {
  if (value === null || value === undefined || value === "") return [];
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    return value.flatMap((item) => nonEmptyContentPaths(item, `${prefix}[]`));
  }
  if (typeof value === "object") {
    return Object.entries(value as JsonRecord).flatMap(([key, nested]) => nonEmptyContentPaths(nested, prefix ? `${prefix}.${key}` : key));
  }
  return prefix ? [prefix] : [];
}

function publicSourceManifest(packagePayload: unknown): Array<Record<string, unknown>> {
  return records(object(packagePayload).source_manifest).map((source) => ({
    source_id: text(source.source_id),
    title: text(source.title),
    institution: text(source.institution),
    url: isSafePublicSourceUrl(text(source.url)) ?? "",
    document_date: source.document_date ?? null,
    retrieved_at: text(source.retrieved_at),
    document_type: text(source.document_type),
    version: source.version ?? null,
    temporal_class: text(source.temporal_class),
    relevant_locations: Array.isArray(source.relevant_locations) ? source.relevant_locations : []
  }));
}

function completePublicReview(result: JsonRecord, packagePayload: unknown): PublicFullReview {
  const requiredContentPaths = [...new Set(nonEmptyContentPaths(result))].sort();
  // FullReviewRecord recursively renders every nonempty result field. Exact
  // duplicates in the orientation layer are documented, never discarded.
  return {
    result,
    sourceManifest: publicSourceManifest(packagePayload),
    sourceHash: sha256(result),
    sourceDocumentHash: sha256({ result, source_manifest: publicSourceManifest(packagePayload) }),
    requiredContentPaths,
    renderedContentPaths: requiredContentPaths,
    duplicateMappings: [
      { sourcePath: "public_summary", renderedAt: "orientation" },
      { sourcePath: "normative_mapping", renderedAt: "sdg-and-schutzgueter" },
      { sourcePath: "impact_paths", renderedAt: "wirkpfade" },
      { sourcePath: "calculation_requirements", renderedAt: "rechenweg" }
    ],
    unrenderedContentPaths: []
  };
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
      lever: text(path.lever, "Auslöser und Umsetzungsschritt werden weiter präzisiert."),
      hypothesis: text(path.hypothesis, "Die dokumentierte Wirkannahme wird mit Quellen und Vergleichsfragen weiter geprüft."),
      direction: text(path.direction, "EVIDENCE_OPEN"),
      affectedDimensions: strings(path.affected_mpd_dimensions, 8),
      affectedGroups: strings(path.affected_groups, 16),
      prerequisites: strings(path.prerequisites, 16),
      risks: strings(path.risks_and_side_effects, 16),
      evidenceBoundary: text(path.evidence_boundary, text(exAnte.evidence_boundary, "Die Evidenzgrenze wird im Quellen- und Rechenweg sichtbar gehalten.")),
      evidenceStatus: text(path.evidence_status, "EVIDENCE_OPEN"),
      changeLever: text(path.change_lever_for_positive_net_impact, "Noch keine belastbar dokumentierte Stellschraube hinterlegt.")
    })),
    impactDomains: records(result.impact_domains).map((domain) => ({
      domain: text(domain.domain, "Wirkungsbereich"),
      relevance: strings(domain.relevance, 16),
      assessment: text(domain.assessment, "EVIDENCE_OPEN")
    })),
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
    boundaries: records(result.non_compensable_boundaries).map((boundary) => ({
      boundary: text(boundary.boundary, "Schutzgrenze wird geprüft."),
      status: text(boundary.gate_status, "MUST_BE_TESTED"),
      reason: text(boundary.reason, "Die Schutzgrenze wird nicht mit positiven Wirkungen in anderen Bereichen verrechnet.")
    })),
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
  const publicSummary = object(result.public_summary);
  const impactPaths = records(exAnte.impact_paths).length > 0 ? records(exAnte.impact_paths) : records(result.impact_paths);
  const dataGaps = records(result.data_gaps);
  const counterfactuals = records(result.counterfactuals);
  const maturity = maturityFor(result, caseRow.current_stage ?? "");
  const stage = text(caseRow.current_stage, "Amtlicher Verfahrensstand wird fortlaufend geprüft");
  const retrievedAt = safeDate(review.imported_at, new Date().toISOString().slice(0, 10));
  const potential = text(exAnte.overall_potential, text(exAnte.scope_statement, "Die Fallakte wird auf Grundlage der amtlichen Unterlagen strukturiert."));
  const publicHeadline = text(publicSummary.headline);
  const publicKeyStatement = text(publicSummary.key_statement, maturityCopy(maturity));
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
  // The overview may use a current editorial projection, but the Fachakte
  // always renders the released source record verbatim. This prevents a
  // normalized database shape from silently shortening a public analysis.
  const fullReview = completePublicReview(releasedReviewByCaseId.get(caseRow.id) ?? result, packagePayload);

  const materiality = caseRow.materiality === "VERY_HIGH" || caseRow.materiality === "HIGH" || caseRow.materiality === "MEDIUM" || caseRow.materiality === "WATCH"
    ? caseRow.materiality
    : "HIGH";

  const finalVersion = text(decision.final_version);
  return {
    slug: caseRow.slug,
    // Titles identify the parliamentary decision. The analytical maturity is
    // a small, visible status below the title, never a repeated headline.
    title: caseRow.official_title ?? caseRow.title,
    plainTitle: publicHeadline || shortDecisionTitle(caseRow.official_title ?? caseRow.title),
    kind: caseKind(stage),
    editorialStatus: "WORKING_ACT_PUBLISHED",
    materiality,
    parliamentaryStatus: stage,
    statusVerification: "VERIFIED",
    nextEvent: null,
    lastUpdated: retrievedAt,
    // The release review supplies the public plain-language statement.  The
    // maturity sentence is valuable context, but must not replace the actual
    // subject of the parliamentary case in the first viewport.
    summary: `${publicKeyStatement} ${sourceCount > 0 ? `Die Akte verweist auf ${sourceCount} amtliche Quellen.` : "Die amtlichen Quellen werden sichtbar nachgeführt."}`,
    whatIsDecided: text(decision.object, caseRow.official_title ?? caseRow.title),
    analysisStatus: maturity,
    intendedGoal: text(object(result.ex_ante).official_objective, "Ein separates amtliches Ziel ist im vorliegenden Fachbestand nicht ausgewiesen. Die vollständige Fachakte zeigt stattdessen, welche Ziele, Wirkpfade und Voraussetzungen für die Einordnung geprüft werden."),
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
      editorialSummary: {
        keyStatement: publicKeyStatement,
        whatIsKnown: text(publicSummary.what_is_known) || undefined,
        whatIsNotYetKnown: text(publicSummary.what_is_not_yet_known) || undefined,
        evidenceBoundary: text(publicSummary.evidence_boundary) || undefined,
        improvementOptions: strings(publicSummary.improvement_options, 8)
      },
      normativeMapping,
      reviewDetail,
      fullReview
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
  const contentIntegrity = rows.map((row) => ({
    case_id: row.slug,
    route: `/entscheidungen/${row.slug}?ansicht=fachakte`,
    source_sha256: row.publicWorkingAct?.fullReview?.sourceHash ?? null,
    required_content_paths: row.publicWorkingAct?.fullReview?.requiredContentPaths ?? [],
    rendered_content_paths: row.publicWorkingAct?.fullReview?.renderedContentPaths ?? [],
    duplicate_mappings: row.publicWorkingAct?.fullReview?.duplicateMappings ?? [],
    unrendered_content_paths: row.publicWorkingAct?.fullReview?.unrenderedContentPaths ?? [],
    reference_version: text(object(row.publicWorkingAct?.fullReview?.result).woek_reference_snapshot ? "documented" : "not documented"),
    last_verified: new Date().toISOString()
  }));
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(path.resolve(process.cwd(), "data/content-integrity-manifest.json"), `${JSON.stringify({ generated_at: new Date().toISOString(), cases: contentIntegrity }, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ output: "data/public-working-acts.json", content_integrity_manifest: "data/content-integrity-manifest.json", working_acts: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not generate public working acts.");
  process.exit(1);
});
