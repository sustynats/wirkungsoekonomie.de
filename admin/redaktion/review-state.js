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
  if (!review || review.job_id !== request.job_id) return request;
  return {
    ...request,
    title: review.title || request.title,
    review_status: review.status,
    publication_url: review.status === 'PUBLISHED' ? review.publication?.url || null : null,
    preview_available: false,
    status_note: review.status === 'REVISION_REQUESTED'
      ? 'Dein Kommentar ist gespeichert. Die überarbeitete Fassung erscheint erneut zur Freigabe.'
      : review.status === 'NEEDS_REVIEW' ? request.status_note : null,
  };
}
