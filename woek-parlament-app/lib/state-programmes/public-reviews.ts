import importedReviews from "@/data/generated/sachsen-anhalt-programme-reviews.json";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";

type RecordValue = Record<string, unknown>;

export type PublicProgrammeReview = {
  sourceKey: string;
  party: string;
  title: string;
  canonicalUrl: string;
  review: RecordValue;
  commitments: RecordValue[];
};

function record(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
}

function records(value: unknown) {
  return Array.isArray(value) ? value.map(record) : [];
}

/**
 * Public programme records are populated only by the validated, source-bound
 * import script. An empty collection is intentionally not a public analysis.
 */
export function getPublicProgrammeReviews(): PublicProgrammeReview[] {
  const payload = record(importedReviews);
  const programmeRecords = records(payload.programmes);
  return programmeRecords.flatMap((entry) => {
    const sourceKey = typeof entry.source_key === "string" ? entry.source_key : "";
    const source = saxonyAnhaltElectionProgrammes.find((candidate) => candidate.sourceKey === sourceKey);
    const review = record(entry.review);
    if (!source || !Object.keys(review).length) return [];
    return [{
      sourceKey,
      party: source.party,
      title: source.title,
      canonicalUrl: source.canonicalUrl,
      review,
      commitments: records(entry.commitments)
    }];
  });
}

export function getPublicProgrammeReview(sourceKey: string) {
  return getPublicProgrammeReviews().find((review) => review.sourceKey === sourceKey) ?? null;
}
