// A missing first-pass classification is work for the independent reviewer,
// never an automatic finding that a media effect is absent.
export function needsMediaReview(record = {}) {
  return record.media_review_required === true && !record.analysis?.media_impact;
}

export function reviewedMediaRecord(record, output) {
  if (!needsMediaReview(record)) return record;
  const check = output.media_applicability;
  if (!check || typeof check.relevant !== 'boolean' || typeof check.reason !== 'string' || check.reason.trim().length < 30) {
    throw Error('MEDIA_INDEPENDENT_REVIEW_REQUIRED');
  }
  // A relevant finding requires the full existing media contract. This small
  // completion path cannot turn it off or fabricate the missing analysis.
  if (check.relevant) throw Error('MEDIA_IMPACT_REQUIRED');
  return {...record, analysis:{...record.analysis, media_impact:structuredClone(check)}};
}
