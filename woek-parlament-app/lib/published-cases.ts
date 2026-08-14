import "server-only";

import { createHash } from "node:crypto";
import { supabaseRest } from "@/lib/supabase-rest";

type CaseRow = {
  id: string;
  external_id: string;
  case_kind: "RADAR" | "IMPACT_BRIEF" | "FULL_CHECK" | "RETROSPECTIVE_CASE";
  decision_date: string | null;
  last_activity_on: string | null;
  next_confirmed_event_on: string | null;
  title: string;
  original_title: string | null;
  workflow_status: "PUBLISHED";
  updated_at: string;
};

type FactPackageRow = {
  decision_object: string | null;
  official_objective: string | null;
  parliamentary_status: string | null;
  fact_status: "DRAFT" | "SOURCE_REQUIRED" | "EDITORIALLY_CONFIRMED";
  created_at: string;
};

type AssessmentRow = {
  method_version: string;
  ruleset_version: string;
  assessment_status: string;
  provenance: "RULE" | "PRECEDENT" | "AI_SUGGESTION" | "HUMAN" | "MIXED";
  summary: Record<string, unknown>;
  created_at: string;
};

type RecommendationRow = {
  category: string;
  boundary_status: string;
  evidence_status: string;
  remaining_uncertainty: unknown[];
  reasons: unknown[];
  status: string;
  created_at: string;
};

type DocumentVersionRow = {
  version_label: string;
  is_final_voting_version: boolean;
  source_documents: {
    external_url: string;
    publisher: string;
    source_published_on: string;
  } | null;
};

export type PublishedPortalCase = {
  id: string;
  slug: string;
  externalId: string;
  kind: CaseRow["case_kind"];
  title: string;
  originalTitle: string | null;
  decisionDate: string | null;
  lastActivityOn: string | null;
  nextEvent: string | null;
  lastUpdated: string;
};

export type PublishedPortalCaseDetail = PublishedPortalCase & {
  factPackage: {
    decisionObject: string | null;
    officialObjective: string | null;
    parliamentaryStatus: string | null;
    status: FactPackageRow["fact_status"];
  } | null;
  assessment: {
    methodVersion: string;
    rulesetVersion: string;
    status: string;
    provenance: AssessmentRow["provenance"];
    summary: Record<string, unknown>;
  } | null;
  recommendation: {
    category: string;
    boundaryStatus: string;
    evidenceStatus: string;
    remainingUncertainty: unknown[];
    reasons: unknown[];
  } | null;
  source: {
    versionLabel: string;
    isFinalVotingVersion: boolean;
    url: string;
    publisher: string;
    publishedOn: string;
  } | null;
};

function stableSlug(externalId: string) {
  const positionId = externalId.match(/(?:^|:)position:([^:]+)$/)?.[1];
  if (positionId) return `dip-${positionId}`;
  return `fall-${createHash("sha256").update(externalId).digest("hex").slice(0, 12)}`;
}

function toPortalCase(row: CaseRow): PublishedPortalCase {
  return {
    id: row.id,
    slug: stableSlug(row.external_id),
    externalId: row.external_id,
    kind: row.case_kind,
    title: row.title,
    originalTitle: row.original_title,
    decisionDate: row.decision_date,
    lastActivityOn: row.last_activity_on,
    nextEvent: row.next_confirmed_event_on,
    lastUpdated: row.updated_at.slice(0, 10)
  };
}

/**
 * The public read model is intentionally narrow.  It reads only records that
 * already passed the server-side publication workflow; imports, tasks, AI
 * suggestions, review packets and other editorial data never reach this path.
 * A missing migration/configuration yields an empty public list rather than
 * exposing a draft or breaking the public portal during a rollout.
 */
export async function listPublishedPortalCases(): Promise<PublishedPortalCase[]> {
  try {
    const rows = await supabaseRest<CaseRow[]>(
      "parliamentary_cases?workflow_status=eq.PUBLISHED&select=id,external_id,case_kind,decision_date,last_activity_on,next_confirmed_event_on,title,original_title,workflow_status,updated_at&order=next_confirmed_event_on.asc.nullslast,updated_at.desc"
    );
    return rows.map(toPortalCase);
  } catch {
    return [];
  }
}

export async function getPublishedPortalCase(slug: string): Promise<PublishedPortalCaseDetail | null> {
  const cases = await listPublishedPortalCases();
  const item = cases.find((candidate) => candidate.slug === slug);
  if (!item) return null;

  try {
    const [factPackages, assessments, recommendations, documentVersions] = await Promise.all([
      supabaseRest<FactPackageRow[]>(
        `decision_fact_packages?parliamentary_case_id=eq.${encodeURIComponent(item.id)}&select=decision_object,official_objective,parliamentary_status,fact_status,created_at&order=package_version.desc&limit=1`
      ),
      supabaseRest<AssessmentRow[]>(
        `impact_assessments?parliamentary_case_id=eq.${encodeURIComponent(item.id)}&superseded_at=is.null&select=method_version,ruleset_version,assessment_status,provenance,summary,created_at&order=created_at.desc&limit=1`
      ),
      supabaseRest<RecommendationRow[]>(
        `recommendation_candidates?parliamentary_case_id=eq.${encodeURIComponent(item.id)}&status=eq.APPROVED&select=category,boundary_status,evidence_status,remaining_uncertainty,reasons,status,created_at&order=created_at.desc&limit=1`
      ),
      supabaseRest<DocumentVersionRow[]>(
        `document_versions?parliamentary_case_id=eq.${encodeURIComponent(item.id)}&select=version_label,is_final_voting_version,source_documents(external_url,publisher,source_published_on)&order=is_final_voting_version.desc,created_at.desc&limit=1`
      )
    ]);
    const factPackage = factPackages[0];
    const assessment = assessments[0];
    const recommendation = recommendations[0];
    const documentVersion = documentVersions[0];
    const source = documentVersion?.source_documents;
    return {
      ...item,
      factPackage: factPackage ? {
        decisionObject: factPackage.decision_object,
        officialObjective: factPackage.official_objective,
        parliamentaryStatus: factPackage.parliamentary_status,
        status: factPackage.fact_status
      } : null,
      assessment: assessment ? {
        methodVersion: assessment.method_version,
        rulesetVersion: assessment.ruleset_version,
        status: assessment.assessment_status,
        provenance: assessment.provenance,
        summary: assessment.summary
      } : null,
      recommendation: recommendation ? {
        category: recommendation.category,
        boundaryStatus: recommendation.boundary_status,
        evidenceStatus: recommendation.evidence_status,
        remainingUncertainty: recommendation.remaining_uncertainty,
        reasons: recommendation.reasons
      } : null,
      source: source ? {
        versionLabel: documentVersion.version_label,
        isFinalVotingVersion: documentVersion.is_final_voting_version,
        url: source.external_url,
        publisher: source.publisher,
        publishedOn: source.source_published_on
      } : null
    };
  } catch {
    // The case itself is published.  A temporarily unavailable detail table
    // must not turn that public case into a false 404 or leak a draft fallback.
    return { ...item, factPackage: null, assessment: null, recommendation: null, source: null };
  }
}
