// Atomic public release switch. Set a version only with a passing coverage
// report for the complete active catalog in the same release artifact.
import fs from 'node:fs';
export const IMPACT_RELEASE = JSON.parse(fs.readFileSync(new URL('../../content/news/impact-release.json', import.meta.url), 'utf8'));
export const PUBLIC_IMPACT_PROFILE_VERSION = IMPACT_RELEASE.public_version;
export const IMPACT_REVISION_NOTICE = 'Wir überarbeiten die Wirkungsprofile. Die Nachrichten, redaktionellen Einordnungen und Quellen bleiben verfügbar.';

export function publicImpactAssessment(record = {}) {
  const assessment = record.dimensions && record.version ? record : record.impact_assessment || record.analysis?.impact_assessment;
  if (!PUBLIC_IMPACT_PROFILE_VERSION || assessment?.version !== PUBLIC_IMPACT_PROFILE_VERSION
    || assessment.review?.status === 'needs_reassessment' || assessment.publication_status !== 'ready') return null;
  const { review: _review, research_check: _research, ...publicAssessment } = structuredClone(assessment);
  publicAssessment.review = {status:assessment.review?.status,at:assessment.review?.at,note:'Wirkpfade, Tragweite, Eintrittsplausibilität und Evidenz erneut geprüft.'};
  publicAssessment.source_functions = assessment.research_check?.source_functions || [];
  return publicAssessment;
}

// Every generated public page passes this guard, including detail and archive
// pages. A private preview must never be copied into the release artifact.
export function assertPublicImpactHtml(html) {
  if (html.includes('Keine Größenschätzung vorhanden') || /class="wt-dim[^>]*>[\s\S]*kein(?: belastbarer| wesentlicher)? Wirkpfad/iu.test(html)) throw Error('IMPACT_PUBLIC_DEBUG_FALLBACK');
  if (!PUBLIC_IMPACT_PROFILE_VERSION && /class="wt-dim wt-dim--|data-potential-model=/.test(html)) throw Error('IMPACT_PUBLIC_PROFILE_NOT_RELEASED');
}
