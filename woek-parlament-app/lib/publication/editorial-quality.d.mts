export type EditorialGateName =
  | "EDITORIAL_SPECIFICITY"
  | "IMPACT_CORE_SPECIFICITY"
  | "SUMMARY_IS_CASE_SPECIFIC"
  | "NO_TEMPLATE_LANGUAGE"
  | "NO_PLACEHOLDER_TEXT"
  | "DIRECTION_HAS_REASON"
  | "EVIDENCE_IS_EXPLAINED"
  | "KEY_TRADEOFF_VISIBLE"
  | "COMPETENCE_VISIBLE_IF_MATERIAL"
  | "REALITY_STATUS_VISIBLE";

export type EditorialAssessment = {
  status: "PASS" | "FAIL";
  gates: Record<EditorialGateName, boolean>;
  failed: EditorialGateName[];
};

export function assessEditorialQuality(record: Record<string, unknown>): EditorialAssessment;
export function findGenericEditorialPatterns(records: Array<Record<string, unknown>>, threshold?: number): Array<{
  code: "GENERIC_EDITORIAL_PATTERN_DETECTED";
  impact_case_ids: string[];
  similarity: number;
}>;
