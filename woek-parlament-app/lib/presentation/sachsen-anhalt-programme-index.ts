import "server-only";

import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { saxonyAnhaltCommitmentEditorial } from "@/data/presentation/sachsen-anhalt-programme-editorial-v2";
import { saxonyAnhaltReviewedCommitmentCounts } from "@/data/presentation/sachsen-anhalt-programme-counts";
import { getSaxonyAnhaltPublicationSources } from "@/lib/publication/fachakten";
import { buildSaxonyAnhaltProgrammeModel } from "@/lib/presentation/sachsen-anhalt-programme-model";

function excerpt(value: string, maximum = 1_200) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maximum) return { text: normalized, truncated: false };
  const candidate = normalized.slice(0, maximum - 1);
  const boundary = candidate.lastIndexOf(" ");
  return { text: `${candidate.slice(0, boundary > maximum * .7 ? boundary : candidate.length)}…`, truncated: true };
}

export async function buildSaxonyAnhaltProgrammeIndex(sourceKey: string) {
  if (!saxonyAnhaltElectionProgrammes.some((programme) => programme.sourceKey === sourceKey)) return null;
  const [review, commitments] = await getSaxonyAnhaltPublicationSources(sourceKey);
  if (!review || !commitments) return null;
  const model = buildSaxonyAnhaltProgrammeModel(review.markdown, commitments.markdown);
  const archiveHref = `/wirkungsakten/fachakten/${encodeURIComponent(commitments.id)}`;
  const entries = model.commitments.map((commitment) => {
    const reviewed = saxonyAnhaltCommitmentEditorial(sourceKey, commitment.key);
    const source = excerpt(commitment.sourceText);
    return {
      key: commitment.key,
      index: commitment.index,
      title: commitment.title,
      policyDomain: commitment.policyDomain ?? "Weitere Themen / Zuordnung offen",
      sourceExcerpt: source.text,
      sourceTruncated: source.truncated,
      sourceLocation: [commitment.page ? `Seite ${commitment.page}` : null, commitment.section].filter(Boolean).join(" · "),
      direction: reviewed?.direction ?? "OPEN",
      evidence: reviewed?.evidence ?? "NOT_ASSESSABLE",
      keyFinding: reviewed?.keyFinding ?? "OBJEKTSPEZIFISCHE NACHPRÜFUNG OFFEN",
      impactCoreSummary: reviewed?.impactCoreSummary ?? "Für diese Zusage ist noch keine objektspezifische Wirkungsrichtung redaktionell verifiziert.",
      readinessLabel: commitment.readinessLabel,
      reviewed: Boolean(reviewed),
    };
  });
  const expected = saxonyAnhaltReviewedCommitmentCounts[sourceKey];
  if (!expected || entries.length !== expected) {
    throw new Error(`Sachsen-Anhalt programme index count mismatch for ${sourceKey}: ${entries.length} != ${expected ?? "missing"}`);
  }
  return { sourceKey, archiveHref, total: entries.length, entries };
}
