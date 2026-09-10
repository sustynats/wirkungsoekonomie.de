// Atomic public release switch. Set a version only with a passing coverage
// report for the complete active catalog in the same release artifact.
export const PUBLIC_IMPACT_PROFILE_VERSION = null;
export const IMPACT_REVISION_NOTICE = 'Wir überarbeiten die Wirkungsprofile. Die Nachrichten, redaktionellen Einordnungen und Quellen bleiben verfügbar.';

export function publicImpactAssessment(record = {}) {
  const assessment = record.dimensions && record.version ? record : record.impact_assessment || record.analysis?.impact_assessment;
  if (!PUBLIC_IMPACT_PROFILE_VERSION || assessment?.version !== PUBLIC_IMPACT_PROFILE_VERSION
    || assessment.review?.status === 'needs_reassessment' || assessment.publication_status !== 'ready') return null;
  return assessment;
}

// Every generated public page passes this guard, including detail and archive
// pages. A private preview must never be copied into the release artifact.
export function assertPublicImpactHtml(html) {
  if (html.includes('Keine Größenschätzung vorhanden')) throw Error('IMPACT_PUBLIC_DEBUG_FALLBACK');
  if (!PUBLIC_IMPACT_PROFILE_VERSION && /class="wt-dim wt-dim--|data-potential-model=/.test(html)) throw Error('IMPACT_PUBLIC_PROFILE_NOT_RELEASED');
}
