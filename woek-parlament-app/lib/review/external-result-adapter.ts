import { reviewResultSchema, type ReviewCasePackage, type ReviewResult } from "@/lib/review/contracts";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function records(value: unknown) {
  if (!Array.isArray(value)) return [] as JsonRecord[];
  return value.flatMap((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) return [item as JsonRecord];
    if (typeof item === "string" && item.trim()) return [{ label: item.trim() }];
    return [];
  });
}

function isoDateTime(value: unknown) {
  const parsed = new Date(text(value));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function sourceIds(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

/**
 * Review packages may use an ISO offset (for example `+02:00`) while the
 * stable internal contract deliberately persists UTC timestamps.  Normalize
 * the envelope before trying the canonical schema so a fully structured
 * result does not fall back to the lossy legacy adapter.
 */
function prepareCanonicalReviewResult(input: unknown) {
  const source = record(input);
  const provenance = record(source.provenance);
  return {
    ...source,
    generated_at: isoDateTime(source.generated_at ?? provenance.review_generated_at ?? provenance.generated_at),
    provenance: {
      ...provenance,
      source_refs_used: sourceIds(provenance.source_refs_used).length > 0
        ? sourceIds(provenance.source_refs_used)
        : sourceIds(provenance.source_ids_referenced),
      review_generated_at: isoDateTime(provenance.review_generated_at ?? provenance.generated_at ?? source.generated_at)
    }
  };
}

function mappedReviewStatus(value: unknown): ReviewResult["review_status"] {
  if (value === "COMPLETE" || value === "DATA_GAP" || value === "SOURCE_CONFLICT" || value === "METHOD_REVIEW_REQUIRED" || value === "PARTIAL") return value;
  // A structured pre-review with explicit evidence limits is useful work, but
  // it is not a complete historical impact finding.
  return "PARTIAL";
}

export function reviewResultIdentity(input: unknown) {
  const candidate = record(input);
  const caseId = text(candidate.case_id);
  const inputPackageHash = text(candidate.input_package_hash);
  if (!caseId || !inputPackageHash) throw new Error("Review result is missing its case ID or input package hash.");
  return { caseId, inputPackageHash };
}

/**
 * Converts the documented external pre-review format into the stable import
 * contract. It carries over the supplied analysis verbatim as structured
 * records, adds only package-bound technical metadata, and never fills a
 * missing factual or numerical value.
 */
export function normalizeExternalReviewResult(input: unknown, reviewPackage: ReviewCasePackage): ReviewResult {
  const canonical = reviewResultSchema.safeParse(prepareCanonicalReviewResult(input));
  if (canonical.success) return canonical.data;

  const source = record(input);
  const provenance = record(source.provenance);
  const exAnte = record(source.ex_ante);
  const exPost = record(source.ex_post);
  const normativeMapping = record(source.normative_mapping);
  const sourceCompleteness = record(source.source_completeness);
  const retrospective = record(source.retrospective);
  const canonicalShapedResult = Object.prototype.hasOwnProperty.call(source, "schema_version");

  const sourceRefs = sourceIds(provenance.source_refs_used).length > 0
    ? sourceIds(provenance.source_refs_used)
    : sourceIds(provenance.source_ids_referenced);

  const targetAreas = records(normativeMapping.target_areas);
  const nonCompensationGates = records(normativeMapping.non_compensation_protection_gates);
  const counterfactual = record(source.counterfactual);
  const impactPaths = canonicalShapedResult ? records(source.impact_paths) : records(exAnte.impact_paths);
  const impactDomains = canonicalShapedResult ? records(source.impact_domains) : targetAreas;
  const risks = canonicalShapedResult ? records(source.risks) : records(exAnte.risks_and_side_effects);
  const boundaries = canonicalShapedResult ? records(source.non_compensable_boundaries) : nonCompensationGates;
  const counterarguments = canonicalShapedResult ? records(source.counterarguments) : [];
  const counterfactuals = canonicalShapedResult ? records(source.counterfactuals) : (Object.keys(counterfactual).length > 0 ? [counterfactual] : []);
  const sourceConflicts = canonicalShapedResult ? records(source.source_conflicts) : [];
  const crossCaseLinks = canonicalShapedResult ? records(source.cross_case_links) : [];

  return reviewResultSchema.parse({
    schema_version: text(source.schema_version, text(source.review_result_schema_version, "1.0.0")),
    review_id: text(source.review_id),
    case_id: text(source.case_id),
    review_type: text(source.review_type, reviewPackage.review_type),
    input_package_hash: text(source.input_package_hash),
    woek_reference_snapshot: reviewPackage.woek_reference_snapshot,
    previous_review_id: text(source.previous_review_id) || null,
    analysis_version: text(source.analysis_version, text(source.review_result_schema_version, "1.0.0")),
    generated_at: isoDateTime(source.generated_at ?? provenance.review_generated_at ?? provenance.generated_at),
    review_status: mappedReviewStatus(source.review_status ?? source.status),
    source_completeness: sourceCompleteness,
    decision: record(source.decision),
    ex_ante: exAnte,
    ex_post: exPost,
    impact_paths: impactPaths,
    impact_domains: impactDomains,
    normative_mapping: normativeMapping,
    calculation_requirements: records(source.calculation_requirements),
    risks,
    non_compensable_boundaries: boundaries,
    counterarguments,
    counterfactuals,
    data_gaps: records(source.data_gaps),
    source_conflicts: sourceConflicts,
    retrospective: {
      ...retrospective,
      external_review_assessment: text(source.executive_assessment),
      methodology_gate: record(source.methodology_gate),
      source_review_status: text(source.status)
    },
    cross_case_links: crossCaseLinks,
    provenance: {
      source_refs_used: sourceRefs,
      review_generated_at: isoDateTime(provenance.review_generated_at ?? provenance.generated_at ?? source.generated_at)
    }
  });
}
