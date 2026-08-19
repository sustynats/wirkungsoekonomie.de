import "server-only";

import { cache } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { projectEuEditorial, type PublicEditorialProjection } from "@/lib/publication/public-editorial-projection.mjs";

export type EuImpactRecord = {
  impact_case_id: string;
  jurisdiction_id: "EU";
  title: string;
  analysis_mode: string;
  legal_status: string;
  impact_core_summary: string;
  editorial_summary: string;
  key_finding: string;
  primary_direction: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "AMBIVALENT" | "OPEN";
  evidence_level: "HIGH" | "MEDIUM" | "LOW" | "NOT_ASSESSABLE";
  competence_scope: string;
  institutional_actor_role: string;
  implementation_route: string[];
  legal_feasibility_status: string;
  boundary_status: string;
  reality_check_status: string;
  inherited_legislative_file: boolean;
  key_indicators: string[];
  official_sources: string[];
  evidence_summary?: string | null;
  reality_check_summary?: string | null;
  source_function?: string[];
  source_refs?: string[];
  limitations?: string[];
  editorial_evidence_overlay?: boolean;
  full_analysis_markdown: string;
  publication_status: "APPROVED_INITIAL_FACHREVIEW";
  analysis_version: string;
  analysis_as_of: string;
  source_release: Record<string, string | null>;
};

const file = path.join(process.cwd(), "data", "eu", "impact-cases", "public-impact-records.jsonl");
function allEuImpactCases() { return readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as EuImpactRecord); }
export const getEuImpactCases = cache(() => allEuImpactCases().filter((record) => projectEuEditorial(record as unknown as Record<string, unknown>).status === "PASS"));
export const getEuEditorialExclusions = cache(() => allEuImpactCases()
  .map((record) => ({ record, projection: projectEuEditorial(record as unknown as Record<string, unknown>) }))
  .filter(({ projection }) => projection.status !== "PASS"));
export function euEditorialProjection(record: EuImpactRecord): PublicEditorialProjection { return projectEuEditorial(record as unknown as Record<string, unknown>); }
export function euImpactCaseById(id: string) { return getEuImpactCases().find((record) => record.impact_case_id === id) ?? null; }
