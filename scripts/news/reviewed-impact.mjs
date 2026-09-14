// A separately supplied review releases a source-bound correction. The writer's
// packet cannot certify itself; neither a new provider call nor a fake API job
// is needed to reuse a researched, independently checked editorial correction.
import { sha256 } from './lib.mjs';
import { derivePublicationStatus } from './impact-publication.mjs';
import { assessmentBasis } from './migrate-impact-assessments.mjs';
import { retainPotentialHistory } from './impact-potential.mjs';

export function finalizeReviewedImpact(record, packet, receipt, existing, now) {
  if (!packet || !record || !Number.isFinite(Date.parse(now))) throw Error('EDITORIAL_IMPACT_REVIEW_BINDING_REQUIRED');
  const hash = sha256(JSON.stringify(packet));
  if (!receipt || receipt.kind !== 'independent_agent_semantic_review'
    || receipt.review_packet_hash !== hash || receipt.story_id !== record.story_id || packet.story_id !== record.story_id
    || record.content_hash !== hash
    || typeof receipt.author_actor !== 'string' || !receipt.author_actor.trim()
    || typeof receipt.reviewer_actor !== 'string' || !receipt.reviewer_actor.trim()
    || receipt.author_actor.trim() === receipt.reviewer_actor.trim()
    || !Number.isFinite(Date.parse(receipt.reviewed_at)) || Date.parse(receipt.reviewed_at) > Date.parse(now)
    || receipt.expected_content_hash !== packet.expected_content_hash
    || receipt.expected_analysis_hash !== packet.expected_analysis_hash) throw Error('EDITORIAL_IMPACT_REVIEW_BINDING_REQUIRED');
  if (packet.analysis?.impact_assessment?.version !== '2.1' || !record.analysis?.impact_assessment || record.impact_assessment?.version !== '2.1') throw Error('EDITORIAL_IMPACT_ASSESSMENT_REQUIRED');
  // publishedRecord deterministically projects the packet into the record.
  // A stale content_hash alone cannot attest its two mutable assessment copies:
  // only the exact assessment actually seen by the second reviewer can release.
  const assessmentHash = sha256(JSON.stringify(packet.analysis.impact_assessment));
  if (sha256(JSON.stringify(record.analysis.impact_assessment)) !== assessmentHash
    || sha256(JSON.stringify(record.impact_assessment)) !== assessmentHash
    || record.title !== (packet.analysis.headline?.trim() || packet.title)
    || record.source_summary !== packet.analysis.source_summary
    || existing?.published_at && record.published_at !== existing.published_at) throw Error('EDITORIAL_IMPACT_REVIEW_BINDING_REQUIRED');
  const gate = derivePublicationStatus(record.impact_assessment, record, { review: receipt.review, secondPassComplete: true });
  if (gate.status !== 'ready') throw Error(`EDITORIAL_IMPACT_REVIEW_FAILED:${gate.issues.join(',')}`);
  const corrected = structuredClone(record);
  const reviewId = `editorial-review-${sha256(JSON.stringify(receipt))}`;
  corrected.impact_assessment.publication_status = 'ready';
  corrected.impact_assessment.review = { status: 'reviewed', at: receipt.reviewed_at, note: 'Wirkpfade und Tragweite anhand ergänzender Quellen erneut geprüft.' };
  corrected.analysis.impact_assessment = structuredClone(corrected.impact_assessment);
  corrected.impact_semantic_review = { review_job_id: reviewId, status: 'ready', reviewed_at: receipt.reviewed_at,
    mode: 'independent_editorial_review', review_packet_hash: hash, review_receipt_hash: sha256(JSON.stringify(receipt)) };
  corrected.editorial_review.basis = 'Quellengebundene Neubewertung mit gesonderter fachlicher Abschlussprüfung.';
  // Keep the original forecast even when a full article correction changes the
  // target. Retrospective reconstruction is never backdated as a prediction.
  for (const key of ['original_potential_assessment', 'current_potential_assessment', 'observed_effects']) {
    if (existing?.[key]) corrected[key] = structuredClone(existing[key]);
  }
  retainPotentialHistory(corrected, corrected.impact_assessment, { at: now, jobId: reviewId, retrospective: Boolean(existing?.published) });
  if (existing?.impact_assessment) corrected.impact_history = [...(existing.impact_history || []), {
    superseded_at: now, assessment: structuredClone(existing.impact_assessment), basis: existing.impact_assessment_basis || null,
  }];
  corrected.versions.at(-1).analysis = structuredClone(corrected.analysis);
  corrected.impact_assessment_basis = assessmentBasis(corrected);
  return corrected;
}
