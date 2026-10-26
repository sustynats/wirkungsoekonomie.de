// Correct two ambiguous referents in one audited published edition. The free
// original report confirms the distinction already present in its title and
// excerpt: Katz denies a leadership conflict and says no attack is planned.
// No sources, claims, impact assessments or paid originals are replaced.
import {createHash} from 'node:crypto';
import {validateAnalysis} from './lib.mjs';
import {unchangedCapacityReview} from './unchanged-capacity-review.mjs';
import {assessmentBasis, persistedImpactAssessmentErrors} from './migrate-impact-assessments.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const TYPE = 'katz_denial_wording_clarification';
const REVIEWED = Object.freeze({
  story_id: 'wt-537ab218dc45ff9c', version: 1,
  published_at: '2026-10-26T08:56:23.731Z',
  content_hash: '35985f81ff22d6be00089cf5a07615d23798d6e093213e03e39198f08bcd710e',
  summary_sha256: 'ba7a10bda6f6504056f8d4165e51434ce1c1ba39ccc94964fc2566dc3959b315',
  analysis_sha256: 'fbe895d1b6b6467dcfa550b4b79549671a621d16c6b0581bfc2443a6be92e8c7',
  sources_sha256: 'ff37a802dd9b3f43f64c090c88c95563d68c21fea7061d0e14f1b496773fbdf2',
  claims_sha256: '3e83bcac158e2d2f4f67c0b65274933902dc69782831f49590f730a1e5107b74',
  versions_sha256: '732da30262961ab764c34479d81d82aff98c850dfdda3ae7327a30480c2f9b3d',
});
const wrongSummary = 'Danach weist der israelische Verteidigungsminister Katz einen Bericht zurück, wonach Israel vor der Wahl keinen Angriff auf den Iran plane.';
const wrongDetail = 'Der Verteidigungsminister Katz weist laut den vorliegenden Berichten eine Darstellung zurück, wonach Israel vor der Wahl keinen Angriff auf den Iran plane.';
const clarified = 'Laut den vorliegenden Berichten erklärt Verteidigungsminister Katz, Israel plane vor der Wahl keinen Angriff auf den Iran. Seine Zurückweisung bezieht sich auf den Bericht über einen angeblichen Konflikt zwischen Netanjahu und dem Militärchef.';

export function applyReviewedKatzDenialClarification(existing, reviewed, at) {
  const held = reason => ({record: existing, status: 'held', reason});
  if (existing?.story_id !== reviewed.story_id) return {record: existing, status: 'not_applicable'};
  if (existing.corrections?.some(c => c.type === TYPE && c.original_summary_sha256 === reviewed.summary_sha256)) {
    return {record: existing, status: 'already_applied'};
  }
  if (!Number.isFinite(Date.parse(at)) || Date.parse(at) < Date.parse(existing.updated_at)) return held('CORRECTION_DATE_INVALID');
  if (!existing.published || existing.listed === false || existing.retirement || existing.manual_only || existing.editorial_approval_hash
    || existing.provider_request_hold != null || existing.review_checkpoint != null
    || (existing.pending_update != null && !unchangedCapacityReview(existing, at))
    || existing.source_integrity?.status !== 'verified' || existing.source_integrity.publication_status !== 'eligible'
    || !Array.isArray(existing.source_integrity.issue_codes) || existing.source_integrity.issue_codes.length
    || !Array.isArray(existing.source_integrity.warning_codes) || existing.source_integrity.warning_codes.length
    || !Number.isFinite(Date.parse(existing.source_integrity.checked_at)) || Date.parse(existing.source_integrity.checked_at) > Date.parse(at)) {
    return held('CORRECTION_GATE_OPEN');
  }
  if (existing.current_version !== reviewed.version || existing.content_hash !== reviewed.content_hash
    || existing.published_at !== reviewed.published_at || existing.updated_at !== reviewed.published_at
    || hash(existing.source_summary || '') !== reviewed.summary_sha256
    || ['analysis', 'sources', 'claims', 'versions'].some(key => hash(JSON.stringify(existing[key] ?? null)) !== reviewed[`${key}_sha256`])) {
    return held('CORRECTION_INPUT_CHANGED');
  }
  if (existing.source_summary.split(wrongSummary).length !== 2 || existing.analysis.detail_summary?.split(wrongDetail).length !== 2) {
    return held('CORRECTION_NOT_APPLICABLE');
  }
  const existingImpactErrors = persistedImpactAssessmentErrors(existing);
  if (existingImpactErrors.length) return {...held('CORRECTION_VALIDATION_FAILED'), issues: existingImpactErrors};
  const record = structuredClone(existing);
  record.source_summary = record.source_summary.replace(wrongSummary, clarified);
  record.analysis.detail_summary = record.analysis.detail_summary.replace(wrongDetail, clarified);
  // The basis covers the entire analysis, including this wording-only summary.
  // Rebind that metadata without changing or releasing any assessment again.
  record.impact_assessment_basis = assessmentBasis(record);
  const errors = [...validateAnalysis({...record.analysis, source_summary: record.source_summary}, record, {validateSourceSummaryNumbers: false, persisted: true}),
    ...persistedImpactAssessmentErrors(record)];
  if (errors.length) return {...held('CORRECTION_VALIDATION_FAILED'), issues: errors};
  record.current_version++;
  record.updated_at = record.last_updated = at;
  record.versions.push({version: record.current_version, analyzed_at: at, content_hash: record.content_hash,
    title: record.title, source_summary: record.source_summary, analysis: structuredClone(record.analysis), claims: structuredClone(record.claims),
    source_versions: record.sources.map(({source_id, url, content_hash}) => ({source_id, url, content_hash})),
    provider: null, model: null, mode: 'katz_denial_wording_clarification_no_generation',
    original_summary_sha256: reviewed.summary_sha256, method_sources: []});
  record.corrections = [...(existing.corrections || []), {at, type: TYPE, original_summary_sha256: reviewed.summary_sha256,
    previous_impact_assessment_basis: existing.impact_assessment_basis, impact_assessment_basis: record.impact_assessment_basis,
    note: 'Die erste Fassung bezog Katz’ Zurückweisung im Nachrichtentext und im Überblick fälschlich auf die Aussage, Israel plane vor der Wahl keinen Angriff auf den Iran. Katz erklärt laut dem verlinkten Bericht gerade, dass ein solcher Angriff nicht geplant sei; zurückgewiesen wird der Bericht über einen angeblichen Führungskonflikt. Die beiden Formulierungen wurden präzisiert. Die Erstfassung bleibt im Versionsverlauf erhalten. Quellen, Claims und Wirkungsbewertung wurden nicht neu erzeugt oder unabhängig bestätigt.'}];
  record.publication_history = [...(existing.publication_history || []), {version: record.current_version,
    published_at: at, source_count: record.sources.length, change: TYPE}];
  return {record, status: 'applied'};
}

export function applyDocumentedKatzDenialClarification(stories, at) {
  const index = stories.findIndex(story => story.story_id === REVIEWED.story_id);
  if (index < 0) return [];
  if (stories.filter(story => story.story_id === REVIEWED.story_id).length !== 1) {
    return [{story_id: REVIEWED.story_id, status: 'held', reason: 'STORY_ID_AMBIGUOUS'}];
  }
  const result = applyReviewedKatzDenialClarification(stories[index], REVIEWED, at);
  if (result.status === 'applied') stories[index] = result.record;
  return [{story_id: REVIEWED.story_id, status: result.status, ...(result.reason ? {reason: result.reason} : {})}];
}
