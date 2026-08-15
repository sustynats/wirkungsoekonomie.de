import releaseCommitmentRegisters from "@/data/generated/release-1/commitment-registers.json";
import releaseCommitmentLinks from "@/data/generated/release-1/commitment-links.json";
import { politicalSourceCatalog, type PoliticalSourceCatalogEntry } from "@/lib/commitments/source-catalog";

type LooseRecord = Record<string, unknown>;

type ProgrammeCoalitionLink = {
  programme_commitment_key?: string;
  coalition_commitment_keys?: string[];
  relationship_status?: string;
  link_resolution_status?: string;
  factual_rationale?: string;
  impact_path_refs?: string[];
  source_refs?: string[];
  evidence_status?: string;
  effect_assessment?: string;
};

type CoalitionDecisionLink = {
  coalition_commitment_key?: string;
  parliamentary_case_ids?: string[];
  relationship_status?: string;
  factual_rationale?: string;
  impact_path_refs?: string[];
  source_refs?: string[];
  evidence_status?: string;
  official_status_check?: string;
  effect_assessment?: string;
};

export type PublicCommitmentRelationship = {
  stage: "PROGRAMME_TO_COALITION" | "COALITION_TO_PARLIAMENT";
  status: string;
  resolutionStatus: string | null;
  rationale: string | null;
  linkedCommitmentKeys: string[];
  caseIds: string[];
  sourceRefs: string[];
  impactPathRefs: string[];
  evidenceStatus: string | null;
  effectAssessment: string | null;
};

export type PublicCommitment = {
  key: string;
  title: string;
  text: string;
  policyDomain: string;
  location: string | null;
  temporalScope: string | null;
  exactRecord: LooseRecord;
  relationships: PublicCommitmentRelationship[];
};

type ReleaseRegister = { source_key?: string; commitments?: unknown[] } & LooseRecord;
type ReleasePayload = { registers?: ReleaseRegister[] };
type LinkPayload = {
  programme_to_coalition?: ProgrammeCoalitionLink[];
  coalition_to_parliamentary_decisions?: CoalitionDecisionLink[];
};

const releaseRegisters = (releaseCommitmentRegisters as ReleasePayload).registers ?? [];
const releaseLinks = releaseCommitmentLinks as LinkPayload;

const policyDomainLabels: Record<string, string> = {
  CLIMATE_RESILIENCE: "Klima und Resilienz",
  DIGITAL_STATE_INFRASTRUCTURE: "Digitale staatliche Infrastruktur",
  ECONOMY_TRANSFORMATION: "Wirtschaft und Transformation",
  EDUCATION_PARTICIPATION: "Bildung und Teilhabe",
  ENERGY_GRIDS: "Energie und Netze",
  HEALTH_CARE: "Gesundheit und Pflege",
  HOUSING: "Wohnen und Bauen",
  MOBILITY: "Mobilität",
  STATE_ADMINISTRATION: "Staat und Verwaltung",
  UNCLASSIFIED: "Weitere Themen",
  WORK_SKILLS: "Arbeit und Qualifizierung"
};

function text(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function list(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function record(value: unknown): LooseRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as LooseRecord : {};
}

function publicPolicyDomain(value: string) {
  const normalized = value.trim() || "UNCLASSIFIED";
  return policyDomainLabels[normalized] ?? normalized
    .replaceAll("_", " ")
    .toLocaleLowerCase("de-DE")
    .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase("de-DE"));
}

function readableTitle(value: string) {
  const firstSentence = value.match(/^(.{18,140}?)(?:[.!?](?:\s|$)|$)/)?.[1] ?? value;
  return firstSentence.length > 124 ? `${firstSentence.slice(0, 121).trimEnd()}…` : firstSentence;
}

function locationLabel(row: LooseRecord) {
  const location = row.source_location;
  if (typeof location === "string" && location.trim()) return location.trim();
  const sourceLocation = record(location);
  const parts = [
    sourceLocation.page !== undefined && `Seite ${String(sourceLocation.page)}`,
    text(sourceLocation.section),
    text(sourceLocation.paragraph),
    text(sourceLocation.anchor),
    row.source_page !== undefined && `Seite ${String(row.source_page)}`
  ].filter((value): value is string => Boolean(value));
  return [...new Set(parts)].join(" · ") || null;
}

function programmeRelationships(commitmentKey: string): PublicCommitmentRelationship[] {
  return (releaseLinks.programme_to_coalition ?? [])
    .filter((link) => link.programme_commitment_key === commitmentKey)
    .map((link) => ({
      stage: "PROGRAMME_TO_COALITION" as const,
      status: text(link.relationship_status) || "OFFEN",
      resolutionStatus: text(link.link_resolution_status) || null,
      rationale: text(link.factual_rationale) || null,
      linkedCommitmentKeys: list(link.coalition_commitment_keys),
      caseIds: [],
      sourceRefs: list(link.source_refs),
      impactPathRefs: list(link.impact_path_refs),
      evidenceStatus: text(link.evidence_status) || null,
      effectAssessment: text(link.effect_assessment) || null
    }));
}

function coalitionRelationships(commitmentKey: string): PublicCommitmentRelationship[] {
  return (releaseLinks.coalition_to_parliamentary_decisions ?? [])
    .filter((link) => link.coalition_commitment_key === commitmentKey)
    .map((link) => ({
      stage: "COALITION_TO_PARLIAMENT" as const,
      status: text(link.relationship_status) || "OFFEN",
      resolutionStatus: text(link.official_status_check) || null,
      rationale: text(link.factual_rationale) || null,
      linkedCommitmentKeys: [],
      caseIds: list(link.parliamentary_case_ids),
      sourceRefs: list(link.source_refs),
      impactPathRefs: list(link.impact_path_refs),
      evidenceStatus: text(link.evidence_status) || null,
      effectAssessment: text(link.effect_assessment) || null
    }));
}

function toCommitment(value: unknown, sourceType: PoliticalSourceCatalogEntry["sourceType"]): PublicCommitment {
  const exactRecord = record(value);
  const textValue = text(exactRecord.exact_text) || text(exactRecord.commitment_text);
  const key = text(exactRecord.commitment_key);
  const domains = list(exactRecord.policy_domains);
  const domain = text(exactRecord.policy_field) || domains[0] || "UNCLASSIFIED";
  return {
    key,
    title: readableTitle(textValue) || key,
    text: textValue,
    policyDomain: publicPolicyDomain(domain),
    location: locationLabel(exactRecord),
    temporalScope: text(exactRecord.temporal_scope) || text(exactRecord.time_horizon) || null,
    exactRecord,
    relationships: sourceType === "COALITION_AGREEMENT" ? coalitionRelationships(key) : programmeRelationships(key)
  };
}

/**
 * The public register is built from the complete, source-preserving release
 * artifact. Editorial database projections never replace a richer source
 * record in the published edition.
 */
export async function getPublicCommitmentRegister(sourceKey: string): Promise<{
  source: PoliticalSourceCatalogEntry;
  commitments: PublicCommitment[];
  sourceRecord: LooseRecord;
} | null> {
  const source = politicalSourceCatalog.find((entry) => entry.sourceKey === sourceKey);
  if (!source) return null;
  const register = releaseRegisters.find((entry) => entry.source_key === sourceKey);
  if (!register || !Array.isArray(register.commitments)) return null;
  const commitments = register.commitments.map((commitment) => toCommitment(commitment, source.sourceType));
  if (commitments.some((commitment) => !commitment.key || !commitment.text)) return null;
  return { source, commitments, sourceRecord: register };
}

export function publicCommitmentDisplay(input: { text: string; policyDomain: string }) {
  return { title: readableTitle(input.text), policyDomain: publicPolicyDomain(input.policyDomain) };
}
