export const approvalStates = {
  NEEDS_REVIEW: 'Erneute Prüfung erforderlich',
  PUBLISHING: 'Wird veröffentlicht',
  AWAITING_FINAL_APPROVAL: 'Bereit für Deine Freigabe',
  APPROVED_FOR_PUBLICATION: 'Freigegeben · Veröffentlichung vorbereitet',
  REVISION_REQUESTED: 'Mit Kommentar zurückgegeben',
  HOLD: 'Zurückgestellt',
  SKIPPED: 'Übersprungen',
  PUBLISHED: 'Veröffentlicht',
};

const requestStates = {
  draft: 'Noch nicht abgesendet', intake_prepared: 'Wird vorbereitet', queued: 'Wartet auf Bearbeitung',
  claimed: 'In Bearbeitung', accepted: 'Wird übernommen', acknowledged: 'Abgeschlossen',
  quarantined: 'Bearbeitung blockiert', archive_failed: 'Übernommen · Archivierung offen',
};

export function requestPresentation(request) {
  if (request.review_status) return {
    label: approvalStates[request.review_status] || 'Wird geprüft',
    attention: ['NEEDS_REVIEW', 'REVISION_REQUESTED', 'HOLD'].includes(request.review_status),
    description: request.status_note || '',
  };
  if (request.publication_url) return {label: 'Veröffentlicht', attention: false, description: ''};
  if (request.editorial_hold) return {
    label: request.editorial_hold.code === 'EDITORIAL_CONTEXT_MISSING' ? 'Themenbezug fehlt' : 'Redaktionelle Klärung erforderlich',
    attention: true, description: request.status_note || request.editorial_hold.reason,
  };
  if (request.research_status) return {
    label: request.research_status === 'hold' ? 'Quellenklärung erforderlich' : 'Nachrecherche beauftragt',
    attention: request.research_status === 'hold', description: request.status_note || '',
  };
  if (['quarantined', 'archive_failed'].includes(request.status) || request.ack_status === 'hold') return {
    label: requestStates[request.status] || 'Prüfung erforderlich', attention: true,
    description: request.status_note || 'Die Redaktion muss einen Prüfschritt klären. Der Auftrag ist gespeichert.',
  };
  if (request.ack_status === 'reject') return {label: 'Nicht zur Veröffentlichung geeignet', attention: true, description: request.status_note || ''};
  // Staging is a transport receipt, not proof of a complete, approvable article.
  if (request.preview_available || request.ack_status === 'staged') return {
    label: request.preview_available ? 'Zwischenstand vorhanden' : 'Weiterverarbeitung läuft', attention: false,
    description: request.preview_available
      ? 'Du kannst den bisherigen Text lesen. Die vollständige Fassung erscheint nach der Prüfung unter „Freigeben“.'
      : 'Das Rechercheergebnis wurde übernommen. Eine vollständige Vorschau zur Freigabe liegt noch nicht vor.',
  };
  return {label: requestStates[request.status] || 'Wird geprüft', attention: false, description: request.status_note || ''};
}

const priority = {
  AWAITING_FINAL_APPROVAL: 0, NEEDS_REVIEW: 0, REVISION_REQUESTED: 1,
  APPROVED_FOR_PUBLICATION: 2, PUBLISHING: 2, HOLD: 3, PUBLISHED: 4, SKIPPED: 4,
};
export function orderedReviews(reviews) {
  return [...reviews].sort((a, b) => (priority[a.status] ?? 1) - (priority[b.status] ?? 1)
    || String(b.updated_at || '').localeCompare(String(a.updated_at || '')));
}

// A staging ACK describes an import. The versioned review describes the
// owner's current decision and the independently verified publication.
export function requestWithReview(request, review) {
  if (!review || review.job_id !== (request.review_job_id || request.job_id)) return request;
  return {
    ...request,
    title: review.title || request.title,
    review_status: review.status,
    review_job_id: review.job_id,
    publication_url: review.status === 'PUBLISHED' ? review.publication?.url || null : null,
    preview_available: false,
    status_note: review.status === 'REVISION_REQUESTED'
      ? 'Dein Kommentar ist gespeichert. Die überarbeitete Fassung erscheint erneut zur Freigabe.'
      : review.status === 'NEEDS_REVIEW' ? request.status_note : null,
  };
}
