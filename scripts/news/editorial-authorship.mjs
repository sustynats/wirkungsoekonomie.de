import {escape} from './editorial-markdown.mjs';

// Formatweite Kuration ist keine Behauptung, jede historische Fassung sei
// einzeln manuell geprueft oder ohne KI entstanden. Einzel-Freigabe nur dort,
// wo der vorhandene Publikationsadapter eine solche Freigabe voraussetzt.
export const EDITORIAL_CURATION_LABEL = 'Persönlich kuratiert · Natalie Weber';
export const EDITORIAL_RESPONSIBILITY = 'Themenauswahl und redaktionelle Verantwortung liegen bei Natalie Weber. Die persönliche Einordnung gibt ihre Auffassung wieder. Recherchierte Fakten, wirkungsökonomische Analyse und persönliche Bewertung werden getrennt ausgewiesen.';
export const EDITORIAL_ASSISTANCE = 'KI-Werkzeuge können Recherche und Ausarbeitung unterstützen. Sie ersetzen nicht die redaktionelle Verantwortung der Autorin.';

export function hasPersonalRelease(analysis) {
  return analysis?.status === 'published' && (
    analysis.format === 'approved_editorial' && analysis.manual_only === true && /^[a-f0-9]{64}$/.test(analysis.content_hash || '')
    || analysis.format === 'book_and_impact' && analysis.editorial_mode === 'manual_manuscript' && /^[a-f0-9]{64}$/.test(analysis.manuscript_sha256 || '')
    || /^[a-f0-9]{64}$/.test(analysis.approved_editorial_revision?.content_hash || '') && Number.isFinite(Date.parse(analysis.approved_editorial_revision?.at))
  );
}

export function renderEditorialAuthorship(analysis) {
  return `<aside class="news-editorial-transparency" role="note" aria-label="Kuration und redaktionelle Verantwortung"><strong>${escape(EDITORIAL_CURATION_LABEL)}</strong><p>${escape(EDITORIAL_RESPONSIBILITY)}</p>${hasPersonalRelease(analysis) ? '<p class="news-editorial-transparency__release">Diese Fassung wurde von Natalie Weber zur Veröffentlichung freigegeben. Sie wird nicht automatisch veröffentlicht.</p>' : ''}<details><summary>Zur Arbeitsweise</summary><p>${escape(EDITORIAL_ASSISTANCE)}</p></details></aside>`;
}
