import "server-only";

import { cache } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";

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
  full_analysis_markdown: string;
  publication_status: "APPROVED_INITIAL_FACHREVIEW";
  analysis_version: string;
  analysis_as_of: string;
  source_release: Record<string, string | null>;
};

const file = path.join(process.cwd(), "data", "eu", "impact-cases", "public-impact-records.jsonl");
export const getEuImpactCases = cache(() => readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as EuImpactRecord));
export function euImpactCaseById(id: string) { return getEuImpactCases().find((record) => record.impact_case_id === id) ?? null; }
