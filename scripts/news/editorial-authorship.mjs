// Formatweite Kuration ist keine Behauptung, jede historische Fassung sei
// einzeln manuell geprueft oder ohne KI entstanden. Einzel-Freigabe nur dort,
// wo der vorhandene Publikationsadapter eine solche Freigabe voraussetzt.
export const EDITORIAL_CURATION_LABEL = 'Persönlich kuratiert · Natalie Weber';
export const EDITORIAL_RESPONSIBILITY = 'Themenauswahl und redaktionelle Verantwortung liegen bei Natalie Weber. Die persönliche Einordnung gibt ihre Auffassung wieder. Recherchierte Fakten, wirkungsökonomische Analyse und persönliche Bewertung werden getrennt ausgewiesen.';

export function hasPersonalRelease(analysis) {
  return analysis?.status === 'published' && (
    analysis.format === 'approved_editorial' && analysis.manual_only === true && /^[a-f0-9]{64}$/.test(analysis.content_hash || '')
    || analysis.format === 'book_and_impact' && analysis.editorial_mode === 'manual_manuscript' && /^[a-f0-9]{64}$/.test(analysis.manuscript_sha256 || '')
    || /^[a-f0-9]{64}$/.test(analysis.approved_editorial_revision?.content_hash || '') && Number.isFinite(Date.parse(analysis.approved_editorial_revision?.at))
  );
}

export function renderEditorialAuthorship(analysis) {
  // Public articles keep the normal byline; internal curation and production notes stay out of the public reading view.
  return '';
}
