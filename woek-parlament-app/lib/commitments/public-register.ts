import { politicalSourceCatalog, type PoliticalSourceCatalogEntry } from "@/lib/commitments/source-catalog";
import { supabaseRest } from "@/lib/database/supabase-admin";

type SourceRow = { id: string; source_key: string; publication_status: string };
type CommitmentRow = {
  id: string;
  commitment_key: string;
  title: string;
  commitment_text: string;
  policy_domain: string | null;
  source_location: { page?: string; section?: string; paragraph?: string; anchor?: string } | null;
  temporal_scope: string | null;
  extraction_status: string;
};

export type PublicCommitment = {
  key: string;
  title: string;
  text: string;
  policyDomain: string;
  location: string | null;
  temporalScope: string | null;
};

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

function publicPolicyDomain(value: string | null) {
  const normalized = value?.trim() || "UNCLASSIFIED";
  return policyDomainLabels[normalized] ?? normalized
    .replaceAll("_", " ")
    .toLocaleLowerCase("de-DE")
    .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase("de-DE"));
}

function readableTitle(value: string, text: string) {
  const candidate = value.replace(/\s+/g, " ").trim();
  const looksLikeImportArtifact = /^(?:\d+\s*[-–—]\s*|[-–—]?\d+[-–—]?)$/.test(candidate) || !/[A-Za-zÄÖÜäöüß]{3}/.test(candidate);
  if (candidate.length >= 12 && !looksLikeImportArtifact) return candidate;
  const normalizedText = text
    .replace(/([A-Za-zÄÖÜäöüß])-\s+([A-Za-zÄÖÜäöüß])/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
  const firstSentence = normalizedText.match(/^(.{12,120}?)(?:[.!?](?:\s|$)|$)/)?.[1] ?? normalizedText;
  return firstSentence.length > 108 ? `${firstSentence.slice(0, 105).trimEnd()}…` : firstSentence;
}

export function publicCommitmentDisplay(input: { title: string; text: string; policyDomain: string | null }) {
  return {
    title: readableTitle(input.title, input.text),
    policyDomain: publicPolicyDomain(input.policyDomain)
  };
}

function locationLabel(location: CommitmentRow["source_location"]) {
  if (!location) return null;
  const values = [location.page && `Seite ${location.page}`, location.section, location.paragraph, location.anchor].filter(Boolean);
  return values.length > 0 ? values.join(" · ") : null;
}

/**
 * The register is public only as a source edition: every item remains tied to
 * its primary political document. It intentionally contains neither a score
 * nor an inferred position on the substance of a promise.
 */
export async function getPublicCommitmentRegister(sourceKey: string): Promise<{
  source: PoliticalSourceCatalogEntry;
  commitments: PublicCommitment[];
} | null> {
  const source = politicalSourceCatalog.find((entry) => entry.sourceKey === sourceKey);
  if (!source) return null;
  const rows = await supabaseRest<SourceRow[]>(`parliament.political_source_documents?source_key=eq.${encodeURIComponent(sourceKey)}&select=id,source_key,publication_status&limit=1`);
  const databaseSource = rows[0];
  if (!databaseSource || databaseSource.publication_status !== "STRUCTURED") return null;
  const commitments = await supabaseRest<CommitmentRow[]>(`parliament.policy_commitments?source_document_id=eq.${encodeURIComponent(databaseSource.id)}&extraction_status=eq.SOURCE_EXTRACTED&select=id,commitment_key,title,commitment_text,policy_domain,source_location,temporal_scope,extraction_status&order=policy_domain.asc,title.asc&limit=650`);
  return {
    source,
    commitments: commitments.map((commitment) => {
      const display = publicCommitmentDisplay({ title: commitment.title, text: commitment.commitment_text, policyDomain: commitment.policy_domain });
      return {
        key: commitment.commitment_key,
        title: display.title,
        text: commitment.commitment_text,
        policyDomain: display.policyDomain,
        location: locationLabel(commitment.source_location),
        temporalScope: commitment.temporal_scope
      };
    })
  };
}
