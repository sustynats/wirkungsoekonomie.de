import { reviewResultSchema, type ReviewResult } from "@/lib/review/contracts";
import { assertExternalReviewSafe, sha256 } from "@/lib/review/privacy";
import { supabaseRest } from "@/lib/database/supabase-admin";

const temporalClasses = new Set(["AVAILABLE_AT_DECISION_TIME", "PUBLISHED_AFTER_DECISION", "CURRENT_REFERENCE"]);

type UnknownRecord = Record<string, unknown>;

export type EvidenceCandidate = {
  candidateKey: string;
  title: string;
  institution: string;
  canonicalUrl: string;
  publicationDate: string | null;
  retrievalDate: string | null;
  sourceType: string;
  exactLocation: string | null;
  temporalClass: "AVAILABLE_AT_DECISION_TIME" | "PUBLISHED_AFTER_DECISION" | "CURRENT_REFERENCE";
  neededFor: string;
  whatItSupports: string;
  whatItDoesNotSupport: string;
  payload: UnknownRecord;
};

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : null;
}

function requiredText(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new Error(`Evidence candidate has no valid ${field}.`);
  }
  return value.trim();
}

function optionalText(value: unknown, field: string, maxLength: number) {
  if (value === null || value === undefined || value === "") return null;
  return requiredText(value, field, maxLength);
}

function optionalDate(value: unknown, field: string) {
  const date = optionalText(value, field, 10);
  if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Evidence candidate has no valid ${field}.`);
  return date;
}

function candidateUrl(value: unknown) {
  const url = requiredText(value, "canonical_url", 2_000);
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error("Evidence candidate URL must be a credential-free HTTPS URL.");
  }
  return parsed.toString();
}

/**
 * Reads only explicitly marked CANDIDATE_ONLY material from a review.  This
 * is intentionally not a source importer: a candidate cannot become evidence
 * or a public citation at this step.
 */
export function extractEvidenceCandidates(result: ReviewResult): EvidenceCandidate[] {
  const retrospective = asRecord(result.retrospective);
  const candidates = retrospective && Array.isArray(retrospective.source_candidates) ? retrospective.source_candidates : [];
  return candidates.map((candidate) => {
    const payload = asRecord(candidate);
    if (!payload) throw new Error("Evidence candidate must be an object.");
    assertExternalReviewSafe(payload, "evidence-candidate");
    if (payload.verification_status !== "CANDIDATE_ONLY") {
      throw new Error("External review candidates must be marked CANDIDATE_ONLY.");
    }
    const candidateKey = requiredText(payload.source_id, "source_id", 160);
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/.test(candidateKey)) {
      throw new Error("Evidence candidate source_id has an invalid format.");
    }
    const temporalClass = requiredText(payload.temporal_class, "temporal_class", 60);
    if (!temporalClasses.has(temporalClass)) throw new Error("Evidence candidate has an invalid temporal_class.");
    return {
      candidateKey,
      title: requiredText(payload.title, "title", 800),
      institution: requiredText(payload.institution, "institution", 320),
      canonicalUrl: candidateUrl(payload.canonical_url),
      publicationDate: optionalDate(payload.publication_date, "publication_date"),
      retrievalDate: optionalDate(payload.retrieval_date, "retrieval_date"),
      sourceType: requiredText(payload.source_type, "source_type", 160),
      exactLocation: optionalText(payload.exact_location, "exact_location", 12_000),
      temporalClass: temporalClass as EvidenceCandidate["temporalClass"],
      neededFor: requiredText(payload.needed_for, "needed_for", 12_000),
      whatItSupports: requiredText(payload.what_it_actually_supports, "what_it_actually_supports", 12_000),
      whatItDoesNotSupport: requiredText(payload.what_it_does_not_support, "what_it_does_not_support", 12_000),
      payload
    };
  });
}

export async function queueEvidenceCandidates(result: ReviewResult, externalReviewResultId: string, externalReviewResultRevisionId: string | null = null) {
  const candidates = extractEvidenceCandidates(result);
  if (candidates.length === 0) return { queued: 0 };
  await supabaseRest("parliament.evidence_candidates", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates" },
    body: JSON.stringify(candidates.map((candidate) => ({
      case_id: result.case_id,
      external_review_result_id: externalReviewResultId,
      external_review_result_revision_id: externalReviewResultRevisionId,
      candidate_key: candidate.candidateKey,
      title: candidate.title,
      institution: candidate.institution,
      canonical_url: candidate.canonicalUrl,
      publication_date: candidate.publicationDate,
      retrieval_date: candidate.retrievalDate,
      source_type: candidate.sourceType,
      exact_location: candidate.exactLocation,
      temporal_class: candidate.temporalClass,
      needed_for: candidate.neededFor,
      what_it_supports: candidate.whatItSupports,
      what_it_does_not_support: candidate.whatItDoesNotSupport,
      candidate_payload: candidate.payload,
      candidate_hash: sha256(candidate.payload)
    })))
  });
  return { queued: candidates.length };
}

type StoredReviewResult = {
  id: string;
  case_id: string;
  result_payload: unknown;
};

/**
 * A one-time, protected migration path for reviews that were already imported
 * before the candidate queue existed. It reads the stored review proposal,
 * never a public projection, and keeps every candidate CANDIDATE_ONLY.
 */
export async function queueStoredEvidenceCandidates(reviewBatchId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(reviewBatchId)) throw new Error("Invalid review batch ID.");
  const rows = await supabaseRest<StoredReviewResult[]>(`parliament.external_review_results?review_batch_id=eq.${encodeURIComponent(reviewBatchId)}&select=id,case_id,result_payload&order=imported_at.asc&limit=500`);
  let reviewed = 0;
  let queued = 0;
  let skippedWithoutExplicitCandidateStatus = 0;
  for (const row of rows) {
    const result = reviewResultSchema.parse(row.result_payload);
    if (result.case_id !== row.case_id) throw new Error("Stored review result does not belong to its case.");
    reviewed += 1;
    const retrospective = asRecord(result.retrospective);
    const rawCandidates = retrospective && Array.isArray(retrospective.source_candidates) ? retrospective.source_candidates : [];
    if (rawCandidates.some((candidate) => asRecord(candidate)?.verification_status !== "CANDIDATE_ONLY")) {
      // Older imports without the explicit status are deliberately left in
      // their original review record. They may be reimported as a versioned
      // evidence supplement, but never upgraded by this migration shortcut.
      skippedWithoutExplicitCandidateStatus += rawCandidates.length;
      continue;
    }
    queued += (await queueEvidenceCandidates(result, row.id)).queued;
  }
  return { reviewed, queued, skippedWithoutExplicitCandidateStatus };
}
