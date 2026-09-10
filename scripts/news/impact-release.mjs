// The complete legacy catalog is promoted atomically. Independently reviewed
// current stories can be released atomically with their complete own profile.
import fs from 'node:fs';
import {impactAssessmentErrors} from './impact-assessment.mjs';
import {assessmentBasis} from './migrate-impact-assessments.mjs';
export const IMPACT_RELEASE = JSON.parse(fs.readFileSync(new URL('../../content/news/impact-release.json', import.meta.url), 'utf8'));
export const PUBLIC_IMPACT_PROFILE_VERSION = IMPACT_RELEASE.public_version;
export const REVIEWED_IMPACT_PROFILE_VERSION = IMPACT_RELEASE.reviewed_record_version || null;
export const IMPACT_REVISION_NOTICE = 'Wir überarbeiten die Wirkungsprofile. Die Nachrichten, redaktionellen Einordnungen und Quellen bleiben verfügbar.';

export function publicImpactAssessment(record = {}) {
  const assessment = record.dimensions && record.version ? record : record.impact_assessment || record.analysis?.impact_assessment;
  const individuallyReleased = REVIEWED_IMPACT_PROFILE_VERSION && assessment?.version === REVIEWED_IMPACT_PROFILE_VERSION
    && record.impact_semantic_review?.status === 'ready' && record.impact_semantic_review?.review_job_id
    && record.impact_assessment_basis === assessmentBasis(record)
    && impactAssessmentErrors(assessment,[...(record.sources || record.source_snapshot || []),...(record.impact_sources || [])],{required:true}).length === 0;
  if (!(individuallyReleased || PUBLIC_IMPACT_PROFILE_VERSION && assessment?.version === PUBLIC_IMPACT_PROFILE_VERSION)
    || assessment.review?.status === 'needs_reassessment' || assessment.publication_status !== 'ready') return null;
  const { review: _review, research_check: _research, ...publicAssessment } = structuredClone(assessment);
  publicAssessment.review = {status:assessment.review?.status,at:assessment.review?.at,note:'Wirkpfade, Tragweite, Eintrittsplausibilität und Evidenz erneut geprüft.'};
  publicAssessment.source_functions = assessment.research_check?.source_functions || [];
  return publicAssessment;
}

// Every generated public page passes this guard, including detail and archive
// pages. A private preview must never be copied into the release artifact.
export function assertPublicImpactHtml(html) {
  if (html.includes('data-private-impact-preview')) throw Error('IMPACT_PRIVATE_PREVIEW_IN_PUBLIC_ARTIFACT');
  if (html.includes('Keine Größenschätzung vorhanden') || /class="wt-dim[^>]*>[\s\S]*kein(?: belastbarer| wesentlicher)? Wirkpfad/iu.test(html)) throw Error('IMPACT_PUBLIC_DEBUG_FALLBACK');
  if (!PUBLIC_IMPACT_PROFILE_VERSION && !REVIEWED_IMPACT_PROFILE_VERSION && /class="wt-dim wt-dim--|data-potential-model=/.test(html)) throw Error('IMPACT_PUBLIC_PROFILE_NOT_RELEASED');
  if (!PUBLIC_IMPACT_PROFILE_VERSION && /data-potential-model=/.test(html)
    && !html.includes('data-reviewed-impact-profile="2.1"')) throw Error('IMPACT_PUBLIC_PROFILE_NOT_RELEASED');
}
