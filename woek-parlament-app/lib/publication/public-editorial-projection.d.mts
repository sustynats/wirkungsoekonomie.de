export type PublicEditorialFields = {
  overview_assessment_label: string;
  impact_core_summary: string;
  editorial_summary: string;
  evidence_summary: string;
  key_finding: string;
  reality_check_summary: string;
  recommendation_core_summary?: string;
  why_preferred?: string;
};

export type PublicEditorialProjection = {
  status: "PASS" | "PUBLICATION_REVIEW_REQUIRED";
  failed: string[];
  fields: PublicEditorialFields;
};

export function isGenericPublicEditorialText(value: unknown): boolean;
export function projectGovernmentEditorial(record: Record<string, unknown>): PublicEditorialProjection;
export function projectEuEditorial(record: Record<string, unknown>): PublicEditorialProjection;
export function projectParliamentEditorial(record: Record<string, unknown>): PublicEditorialProjection;
export function findGenericProjectionPatterns(records: Array<{ id: string; fields: PublicEditorialFields }>, threshold?: number): Array<{ code: "GENERIC_PUBLIC_EDITORIAL_PATTERN_DETECTED"; field: string; ids: string[]; similarity: number }>;
export function publicEnumLabel(value: unknown): string;
