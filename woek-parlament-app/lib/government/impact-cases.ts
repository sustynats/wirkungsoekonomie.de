import "server-only";

import { cache } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ImpactCaseHistoryEntry, WoeKImpactCase } from "@/lib/government/daily-impact-ingest-core";
import { assessEditorialQuality, type EditorialAssessment } from "@/lib/publication/editorial-quality.mjs";
export type { WoeKImpactCase } from "@/lib/government/daily-impact-ingest-core";

export type PublicGovernmentImpactRecord = {
  record_profile: "FULL_SCHEMA_2_0_1" | "VERIFIED_FACH_RELEASE_COMPACT";
  schema_id: string | null;
  schema_validation: "PASS" | "COMPACT_SOURCE_PRESERVED_NO_SCHEMA_REPAIR";
  impact_case_id: string;
  title: string;
  analysis_mode: "IMPACT_POTENTIAL_EX_ANTE" | "IMPACT_REALITY_CHECK";
  publication_analysis_status: string;
  publication_status: "APPROVED";
  analysis_version: string;
  analysis_as_of: string;
  materiality: string;
  overall_character: string;
  primary_direction: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "AMBIVALENT" | "OPEN";
  overview_assessment_label: string;
  evidence_level: "HIGH" | "MEDIUM" | "LOW" | "NOT_ASSESSABLE";
  evidence_summary_text: string;
  implementation_status: string;
  impact_summary: {
    public_summary: string;
    central_lever: string;
    strongest_positive_potential: string;
    main_risk_or_tradeoff: string;
    direction_dependencies: string;
    measurement_priority: string;
  };
  impact_core_summary: string;
  editorial_summary: string;
  key_finding: string;
  public_analysis_depth: "FULL_STRUCTURED" | "LIMITED_FACH_RECORD";
  missing_structured_fields: string[];
  competence_review_status: "REVIEWED_CONCRETE" | "REVIEWED_OPEN" | "NOT_STRUCTURED";
  competence_status: string;
  editorial_quality: EditorialAssessment;
  boundary_status: "PASS" | "WATCH" | "BLOCK" | "OPEN";
  reality_check_status: string;
  reality_check_summary: string;
  recommendation_status: "APPROVED" | "BACKFILL_REQUIRED";
  linked_government_action_ids: string[];
  official_fact_sources: string[];
  mechanism_sources: string[];
  post_decision_sources: string[];
  full_analysis_markdown: string;
  source_release: {
    jsonl_file: string;
    jsonl_sha256: string;
    markdown_file: string;
    markdown_sha256: string;
    case_markdown_sha256: string;
    imported_at: string;
  };
  editorial_source?: {
    manifest_file: string;
    manifest_sha256: string;
    layer_status: string;
  };
  raw_record: WoeKImpactCase | Record<string, unknown>;
};

export type ImpactImportMeta = {
  fachrelease: string;
  imported_at: string;
  impact_cases_total: number;
  impact_cases_full_schema_2_0_1: number;
  impact_cases_compact_source_preserved: number;
  impact_cases_published: number;
  impact_cases_blocked_editorial_quality: number;
  fach_content_loss: number;
  editorial_layer_status: string;
  editorial_layer_coverage: number;
  editorial_layer_manifest: string;
  editorial_layer_source_hashes: Record<string, string>;
  note: string;
};

const impactRoot = path.join(process.cwd(), "data", "government", "impact-cases");

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(impactRoot, name), "utf8")) as T;
}

function readJsonl<T>(name: string): T[] {
  const content = readFileSync(path.join(impactRoot, name), "utf8");
  return content.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T);
}

export const getPublicImpactCases = cache(() => {
  const records = readJsonl<PublicGovernmentImpactRecord>("public-impact-records.jsonl");
  try {
    const daily = readJsonl<WoeKImpactCase>("public-impact-cases.jsonl").map(publicRecordFromFullSchema);
    const byId = new Map(records.map((record) => [record.impact_case_id, record]));
    for (const record of daily) {
      if (record.editorial_quality.status === "PASS") byId.set(record.impact_case_id, record);
    }
    return [...byId.values()];
  } catch {
    return records;
  }
});
export const getImpactImportMeta = cache(() => readJson<ImpactImportMeta>("public-impact-records-meta.json"));

export const getPublicImpactCaseHistory = cache(() => {
  try {
    return readJsonl<ImpactCaseHistoryEntry>("public-impact-case-history.jsonl");
  } catch {
    return [];
  }
});

type ImpactCaseAlias = {
  alias_id: string;
  canonical_impact_case_id: string;
  relationship: "SAME_FACH_CASE_ID_ALIAS";
};

export const getImpactCaseAliases = cache(() => {
  try {
    return readJsonl<ImpactCaseAlias>("impact-case-aliases.jsonl");
  } catch {
    return [];
  }
});

export function impactCaseById(id: string) {
  const alias = getImpactCaseAliases().find((entry) => entry.alias_id === id);
  const canonicalId = alias?.canonical_impact_case_id ?? id;
  return getPublicImpactCases().find((record) => record.impact_case_id === canonicalId);
}

export function impactCasesForGovernmentAction(actionId: string) {
  return getPublicImpactCases().filter((record) => record.linked_government_action_ids.includes(actionId));
}

export function impactCaseVersions(id: string) {
  return getPublicImpactCaseHistory().filter((entry) => entry.impact_case_id === id);
}

export function fullSchemaRecord(record: PublicGovernmentImpactRecord): WoeKImpactCase | null {
  return record.record_profile === "FULL_SCHEMA_2_0_1" ? record.raw_record as WoeKImpactCase : null;
}

export function publicRecordFromFullSchema(record: WoeKImpactCase): PublicGovernmentImpactRecord {
  const directions = new Set(record.impact_paths.map((path) => path.direction));
  const primaryDirection = directions.has("AMBIVALENT") || (directions.has("POSITIVE") && directions.has("NEGATIVE"))
    ? "AMBIVALENT"
    : directions.size === 1 ? [...directions][0] : "OPEN";
  const evidence = record.impact_paths.map((path) => String(path.evidence)).find((value) => ["HIGH", "MEDIUM", "LOW"].includes(value)) ?? "NOT_ASSESSABLE";
  const boundaryStatuses = record.boundary_review.map((item) => item.status);
  const boundaryStatus = boundaryStatuses.includes("BLOCK") ? "BLOCK" : boundaryStatuses.includes("WATCH") ? "WATCH" : boundaryStatuses.includes("OPEN") ? "OPEN" : "PASS";
  const normalized = {
    record_profile: "FULL_SCHEMA_2_0_1",
    schema_id: "https://wirkungsoekonomie.de/contracts/woek-impact-case-2.0.1.schema.json",
    schema_validation: "PASS",
    impact_case_id: record.impact_case_id,
    title: record.title,
    analysis_mode: record.analysis_mode,
    publication_analysis_status: record.publication_analysis_status,
    publication_status: "APPROVED",
    analysis_version: record.analysis_version,
    analysis_as_of: String(record.scope.analysis_as_of),
    materiality: record.materiality.level,
    overall_character: String(record.impact_summary.overall_character),
    primary_direction: primaryDirection,
    overview_assessment_label: primaryDirection === "OPEN" ? "Wirkungsrichtung fachlich offen" : directionLabels[primaryDirection],
    evidence_level: evidence as PublicGovernmentImpactRecord["evidence_level"],
    evidence_summary_text: [record.evidence_summary.fact_evidence, record.evidence_summary.mechanism_evidence, record.evidence_summary.effect_evidence, record.evidence_summary.uncertainty].join(" "),
    implementation_status: String(record.scope.implementation_state),
    impact_summary: {
      public_summary: String(record.impact_summary.public_summary),
      central_lever: String(record.impact_summary.central_lever),
      strongest_positive_potential: String(record.impact_summary.strongest_positive_potential),
      main_risk_or_tradeoff: String(record.impact_summary.main_risk_or_tradeoff),
      direction_dependencies: String(record.impact_summary.direction_dependencies),
      measurement_priority: String(record.impact_summary.measurement_priority),
    },
    impact_core_summary: String(record.impact_summary.central_lever),
    editorial_summary: String(record.impact_summary.public_summary),
    key_finding: String((record as WoeKImpactCase & { key_finding?: string }).key_finding ?? record.impact_summary.main_risk_or_tradeoff),
    public_analysis_depth: record.scope.competence_note ? "FULL_STRUCTURED" : "LIMITED_FACH_RECORD",
    missing_structured_fields: record.scope.competence_note ? [] : ["competence_review"],
    competence_review_status: record.scope.competence_note ? "REVIEWED_CONCRETE" : "NOT_STRUCTURED",
    competence_status: String(record.scope.competence_note ?? "In der Fachübergabe nicht strukturiert geprüft"),
    boundary_status: boundaryStatus,
    reality_check_status: String(record.reality_check.status),
    reality_check_summary: `${record.reality_check.status}. ${record.reality_check.attribution ?? "Eine Zurechnung ist nicht als belegt ausgewiesen."}`,
    recommendation_status: "BACKFILL_REQUIRED",
    linked_government_action_ids: record.linked_objects.government_action_ids,
    official_fact_sources: record.references.official_fact_sources,
    mechanism_sources: record.references.mechanism_sources,
    post_decision_sources: record.references.post_decision_sources,
    full_analysis_markdown: "",
    source_release: { jsonl_file: "approved-public-state.json", jsonl_sha256: "", markdown_file: "", markdown_sha256: "", case_markdown_sha256: "", imported_at: record.fach_review.reviewed_at },
    raw_record: record,
  };
  const editorialQuality = assessEditorialQuality(normalized as unknown as Record<string, unknown>);
  return { ...normalized, editorial_quality: editorialQuality } as PublicGovernmentImpactRecord;
}

export const directionLabels: Record<string, string> = {
  POSITIVE: "positives Wirkungspotenzial",
  NEGATIVE: "negatives Wirkungspotenzial",
  NEUTRAL: "begründet ohne materielle Richtungsänderung",
  AMBIVALENT: "gegenläufige Potenziale und Risiken",
  OPEN: "Wirkungsrichtung offen",
};

export const evidenceLabels: Record<string, string> = {
  HIGH: "hohe Evidenz",
  MEDIUM: "mittlere Evidenz",
  LOW: "geringe Evidenz",
  INSUFFICIENT: "Evidenz nicht ausreichend",
  NOT_ASSESSABLE: "Evidenz nicht bewertbar",
  NOT_APPLICABLE: "Evidenzstufe nicht anwendbar",
};

export const dataStatusLabels: Record<string, string> = {
  MEASURED: "gemessen",
  OBSERVED: "beobachtet",
  MODELLED: "modelliert",
  ESTIMATED: "geschätzt",
  SECONDARY: "aus Sekundärquelle",
  MISSING: "Daten fehlen",
};

export const mpdLabels: Record<string, string> = { MENSCH: "Mensch", PLANET: "Planet", DEMOKRATIE: "Demokratie" };

export const historyClassificationLabels: Record<string, string> = {
  NEW_IMPACT_CASE: "erste Fachanalyse",
  UPDATED_IMPACT_CASE: "aktualisierte Fachanalyse",
  LIFECYCLE_UPDATE: "Verfahrensstand aktualisiert",
  REALITY_CHECK_UPDATE: "Reality-Check aktualisiert",
  FACT_ONLY: "reine Fakten-/Verfahrensaktualisierung",
};

export const boundaryLabels: Record<string, string> = {
  PASS: "keine materielle Grenzverletzung festgestellt",
  WATCH: "Schutzgrenze beobachten",
  BLOCK: "nicht kompensierbare Schutzgrenze berührt",
  OPEN: "Schutzprüfung offen",
};

export const realityCheckLabels: Record<string, string> = {
  NOT_YET_OBSERVABLE: "noch nicht beobachtbar",
  OBSERVATION_ONLY: "Beobachtung ohne Zurechnung",
  PLAUSIBLE_CONTRIBUTION: "plausibler Beitrag",
  PARTIAL_ATTRIBUTION: "teilweise Zurechnung",
  CAUSAL_EVIDENCE: "kausale Evidenz",
  CONFLICTING_EVIDENCE: "widersprüchliche Evidenz",
  NOT_APPLICABLE: "nicht anwendbar",
};
