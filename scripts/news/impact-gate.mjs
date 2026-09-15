// Deterministisches Freigabe-Gate für das Wirkungspotenzial im Direktbetrieb.
// Es ersetzt die frühere unabhängige Zweitprüfung per ChatGPT-/API-Job durch
// die vollständige maschinelle Prüfung des Vertrags 2.1: Struktur, Quellen-
// bindung, Faktorenrechnung, drei modellierte Dimensionen, Systemprüfung.
// Ein Profil, das dieses Gate nicht besteht, wird nicht veröffentlicht und
// nicht erneut bezahlt; es wartet auf neue Evidenz.
import { sha256 } from './lib.mjs';
import { semanticIssues } from './impact-publication.mjs';
import { modelledPublicationIssues } from './impact-scope.mjs';
import { assessmentBasis } from './migrate-impact-assessments.mjs';
import { retainPotentialHistory } from './impact-potential.mjs';
import { IMPACT_VERSION } from './impact-assessment.mjs';

export const DETERMINISTIC_GATE_VERSION = 'deterministic-gate-1';

export function deterministicGateIssues(record) {
  const assessment = record?.impact_assessment;
  if (!assessment) return ['IMPACT_ASSESSMENT_REQUIRED'];
  if (assessment.version !== IMPACT_VERSION) return ['IMPACT_VERSION_INVALID'];
  const issues = [...semanticIssues(assessment, record), ...modelledPublicationIssues(assessment)];
  return [...new Set(issues)];
}

// Stamps the record as publicly releasable. Mutates both assessment copies
// consistently and rebinds the basis hash, exactly like the reviewed release.
export function releaseDeterministicImpact(record, { now, existing = null } = {}) {
  const issues = deterministicGateIssues(record);
  if (issues.length) return { released: false, issues };
  const at = now || new Date().toISOString();
  const reviewId = `deterministic-gate-${sha256(JSON.stringify(record.impact_assessment)).slice(0, 24)}`;
  const stamp = (assessment) => {
    assessment.publication_status = 'ready';
    assessment.review = { status: 'reviewed', at, note: 'Vollständig maschinell geprüft: Quellenbindung, Faktorenrechnung, drei modellierte Dimensionen, Systemprüfung.' };
  };
  stamp(record.impact_assessment);
  if (record.analysis?.impact_assessment) stamp(record.analysis.impact_assessment);
  const lastVersion = record.versions?.at(-1);
  if (lastVersion?.analysis?.impact_assessment) stamp(lastVersion.analysis.impact_assessment);
  record.impact_semantic_review = { review_job_id: reviewId, status: 'ready', reviewed_at: at,
    mode: DETERMINISTIC_GATE_VERSION, review_packet_hash: sha256(JSON.stringify(record.analysis || {})) };
  for (const key of ['original_potential_assessment', 'current_potential_assessment', 'observed_effects']) {
    if (existing?.[key]) record[key] = structuredClone(existing[key]);
  }
  retainPotentialHistory(record, record.impact_assessment, { at, jobId: reviewId, retrospective: Boolean(existing?.published) });
  if (existing?.impact_assessment && existing.impact_assessment_basis) {
    record.impact_history = [...(existing.impact_history || []), { superseded_at: at, assessment: structuredClone(existing.impact_assessment), basis: existing.impact_assessment_basis }];
  }
  record.impact_assessment_basis = assessmentBasis(record);
  return { released: true, issues: [], review_job_id: reviewId };
}
