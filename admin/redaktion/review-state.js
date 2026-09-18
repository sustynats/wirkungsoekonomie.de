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

// Eine Rueckgabe mit Kommentar erzeugt einen Ueberarbeitungsauftrag mit
// derselben Freigabe (review_job_id). Die Karte der Rueckgabe kannte dessen Stand
// nicht und sagte am 18.09.2026 weiter "Mit Kommentar zurueckgegeben", obwohl die
// Ueberarbeitung laengst angehalten war (Quellen nicht pruefbar) - Natalie
// wartete auf eine Fassung, die nie kommen konnte. Der Stand kommt aus den
// Auftraegen, roh, bevor die Rueckgabe sie ueberdeckt.
export const revisionLabels = {
  blocked: 'Überarbeitung angehalten',
  unchanged: 'Überarbeitung ohne neue Fassung',
  working: 'Wird überarbeitet',
  waiting: 'Mit Kommentar zurückgegeben',
  supplemented: 'Mit Nachlieferung neu beauftragt',
};
const revisionNotes = {
  blocked: 'Die Redaktion konnte Deine Rückgabe so nicht umsetzen. Mit einer Nachlieferung geht es weiter.',
  unchanged: 'Die Überarbeitung brachte keine geänderte Fassung. Mit einer Nachlieferung geht es weiter.',
  working: 'Dein Kommentar ist gespeichert. Die überarbeitete Fassung erscheint erneut zur Freigabe.',
  waiting: 'Dein Kommentar ist gespeichert. Die überarbeitete Fassung erscheint erneut zur Freigabe.',
  supplemented: 'Deine Nachlieferung wird bearbeitet. Die neue Fassung erscheint unter „Freigeben“.',
};
const blocked = (request) => Boolean(request?.editorial_hold) || ['quarantined', 'archive_failed'].includes(request?.status)
  || request?.research_status === 'hold' || request?.ack_status === 'reject';
const supplementOf = (brief) => new RegExp(`^\\s*Nachlieferung zu Auftrag (wt_[0-9]{8}T[0-9]{6}Z_[a-f0-9]{24})\\s*$`, 'm').exec(String(brief || ''))?.[1] || null;

export function revisionStates(requests = [], reviews = []) {
  const states = new Map();
  const supplemented = new Set(requests.map((request) => supplementOf(request.brief)).filter(Boolean));
  for (const review of reviews) {
    if (review.status !== 'REVISION_REQUESTED') continue;
    const children = requests.filter((request) => request.review_job_id === review.job_id && request.job_id !== review.job_id)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    const child = children[0] || null, parent = requests.find((request) => request.job_id === review.job_id) || null;
    let state = child ? 'working' : 'waiting';
    if ([review.job_id, ...children.map((request) => request.job_id)].some((id) => supplemented.has(id))) state = 'supplemented';
    else if (child && blocked(child)) state = 'blocked';
    // Angenommen und trotzdem noch zurueckgegeben: die Fassung war unveraendert.
    // Meldungen gehen danach noch durch die Nachrichtenpruefung - dort gilt das nicht.
    else if (child?.status === 'accepted' && child.kind !== 'news') state = 'unchanged';
    states.set(review.job_id, { state, label: revisionLabels[state], note: ['blocked', 'unchanged'].includes(state)
      ? [child?.status_note, revisionNotes[state]].filter(Boolean).join(' ') : revisionNotes[state],
    attention: ['blocked', 'unchanged'].includes(state), parent, child });
  }
  return states;
}

export function requestPresentation(request) {
  if (request.revision_state) return { label: request.revision_state.label, attention: request.revision_state.attention, description: request.revision_state.note };
  if (request.revision_of && request.editorial_hold) return { label: revisionLabels.blocked, attention: true, description: request.status_note || '' };
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
export function requestWithReview(request, review, revision = null) {
  if (!review || review.job_id !== (request.review_job_id || request.job_id)) return request;
  // Die angehaltene Ueberarbeitung zeigt ihren eigenen Grund, nicht die Rueckgabe.
  if (review.status === 'REVISION_REQUESTED' && request.job_id !== review.job_id && blocked(request)) return { ...request, revision_of: review.job_id };
  return {
    ...request,
    title: review.title || request.title,
    review_status: review.status,
    review_job_id: review.job_id,
    publication_url: review.status === 'PUBLISHED' ? review.publication?.url || null : null,
    preview_available: false,
    status_note: review.status === 'REVISION_REQUESTED'
      ? revision?.note || revisionNotes.waiting
      : review.status === 'NEEDS_REVIEW' ? request.status_note : null,
    ...(review.status === 'REVISION_REQUESTED' && revision ? { revision_state: revision } : {}),
  };
}

// Nachliefern: Natalie darf jederzeit Material zu einem laufenden Auftrag
// ergänzen. Der Zusatz wird ein eigener Auftrag, der den ursprünglichen mitsamt
// bisheriger Fassung fortschreibt und erneut zur Freigabe kommt. Die Bindung
// steht in der ersten Zeile des Auftragstexts, weil der Server nur die
// Vertragsfelder kennt; dieselbe Zeile liest der Redaktionsworker
// (scripts/news/editorial-supplement.mjs, gleiche Schreibweise per Test).
export const SUPPLEMENT_PREFIX = 'Nachlieferung zu Auftrag';
export const supplementBrief = (jobId, text) => `${SUPPLEMENT_PREFIX} ${jobId}\n\n${String(text || '').trim()}`;

// Eine bereits veröffentlichte Fassung wird über die Freigabe geändert, nicht
// über eine Nachlieferung: dafür fehlt dem neuen Auftrag die Bindung an die
// bestehende Veröffentlichung. Übersprungene Aufträge bleiben übersprungen.
export function supplementable(request) {
  if (!request?.job_id) return false;
  if (request.publication_url || ['PUBLISHED', 'PUBLISHING', 'SKIPPED', 'APPROVED_FOR_PUBLICATION'].includes(request.review_status || '')) return false;
  return true;
}
