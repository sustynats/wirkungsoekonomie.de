// Selection only: no transport, LLM, filesystem write or publication.
import { createHash } from 'node:crypto';
import { eventCompatibility } from './newsroom.mjs';
import { isManualEditorial } from './manual-policy.mjs';
import { namedSubjectConflict } from './living-files.mjs';

export const CLOUD_SELECTION_VERSION = 'woek-cloud-selection-1';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fail = code => { throw new Error(code); };
const manual = row => isManualEditorial(row) || isManualEditorial(row.existing_story) || row.manual_request || row.manual_authority || row.book
  || (row.sources || []).some(isManualEditorial);
const text = (value, max) => String(value || '').slice(0, max);
const source = row => ({
  source_id: row.source_id, url: row.url, title: text(row.title, 400),
  published_at: row.source_published_at || row.published_at || null,
  excerpt: text(row.article_excerpt || row.summary, 1800),
  excerpt_truncated: String(row.article_excerpt || row.summary || '').length > 1800,
  content_hash: row.content_hash || null,
  primary_source: Boolean(row.primary_source), provenance: row.provenance || null,
});
const byId = (a, b) => a.candidate_id.localeCompare(b.candidate_id);
export function comparisonEvents(stories) {
  return stories.filter(row => row.published && !manual(row)
    && row.retirement?.reason_code !== 'MERGED_INTO_LIVING_FILE').map(row => ({
      event_id: row.event_id || null, story_id: row.story_id, title: text(row.title, 400),
      summary: text(row.analysis?.source_summary || row.source_summary || row.summary, 600),
      summary_truncated: String(row.analysis?.source_summary || row.source_summary || row.summary || '').length > 600,
      version: row.current_version || 1, content_hash: row.content_hash || null,
      updated_at: row.last_updated || row.published_at || null,
      sources: (row.sources || []).map(s => ({ source_id: s.source_id, url: s.url })),
    })).sort((a, b) => a.story_id.localeCompare(b.story_id));
}

export function makeSelectionSnapshot({ candidates, stories, runId, now, coverage }) {
  if (!runId || !Number.isFinite(Date.parse(now))) fail('CLOUD_SNAPSHOT_CONTEXT_INVALID');
  const rows = candidates.filter(row => !manual(row)).map(row => {
    const projected = {
      candidate_id: row.story_id, title: text(row.title, 400),
      existing_event_id: row.existing_story?.published ? row.existing_story.event_id || null : null,
      existing_story_id: row.existing_story?.published ? row.existing_story.story_id : null,
      sources: (row.sources || []).map(source).sort((a, b) => a.url.localeCompare(b.url)),
    };
    return { ...projected, candidate_hash: hash(projected) };
  }).sort(byId);
  if (new Set(rows.map(row => row.candidate_id)).size !== rows.length) fail('CLOUD_CANDIDATE_DUPLICATE');
  if (rows.some(row => !row.candidate_id || !row.sources.length
    || row.sources.some(s => !s.source_id || !/^https?:\/\//.test(s.url)))) fail('CLOUD_CANDIDATE_INVALID');
  const events = comparisonEvents(stories);
  const payload = {
    schema_version: CLOUD_SELECTION_VERSION, run_id: runId, created_at: now,
    candidates: rows, events, comparison_hash: hash(events),
    content_hash: hash({ candidates: rows, events }),
    coverage: coverage || { complete: false, limitations: ['source_coverage_not_supplied'] },
  };
  return { ...payload, input_hash: hash(payload) };
}

function assertSnapshot(snapshot) {
  const { input_hash, ...payload } = snapshot;
  if (snapshot.schema_version !== CLOUD_SELECTION_VERSION || input_hash !== hash(payload)) fail('CLOUD_SNAPSHOT_HASH_INVALID');
}

// Validate the whole return before exposing even one candidate to the paid lane.
// All shards must have one final global decision list; partial output fails closed.
export function validateSelectionResult(snapshot, result, { candidates, stories, now }) {
  assertSnapshot(snapshot);
  const at = Date.parse(now), created = Date.parse(snapshot.created_at), finished = Date.parse(result?.completed_at);
  if (!Number.isFinite(at) || !Number.isFinite(finished) || finished < created || finished > at + 60000
    || at < created || at - created > 2 * 3600000) fail('CLOUD_RESULT_EXPIRED');
  const resultKeys = new Set(['schema_version', 'run_id', 'input_hash', 'comparison_hash', 'completed_at',
    'complete', 'reviewed_candidate_ids', 'decisions', 'processor', 'usage']);
  if (Object.keys(result || {}).some(key => !resultKeys.has(key))) fail('CLOUD_RESULT_FIELDS_INVALID');
  if (result.schema_version !== CLOUD_SELECTION_VERSION || result.run_id !== snapshot.run_id
    || result.input_hash !== snapshot.input_hash || result.comparison_hash !== snapshot.comparison_hash) fail('CLOUD_RESULT_BINDING_INVALID');
  if (result.complete !== true || !Array.isArray(result.decisions) || result.decisions.length !== snapshot.candidates.length
    || hash([...(result.reviewed_candidate_ids || [])].sort()) !== hash(snapshot.candidates.map(row => row.candidate_id).sort()))
    fail('CLOUD_RESULT_INCOMPLETE');
  if (hash(comparisonEvents(stories)) !== snapshot.comparison_hash) fail('CLOUD_COMPARISON_STALE');
  // Freeze the reviewed pool, not the collector: later arrivals remain unreviewed.
  const reviewedIds = new Set(snapshot.candidates.map(row => row.candidate_id));
  const current = makeSelectionSnapshot({ candidates: candidates.filter(row => reviewedIds.has(row.story_id)),
    stories, runId: snapshot.run_id, now: snapshot.created_at, coverage: snapshot.coverage });
  if (current.input_hash !== snapshot.input_hash) fail('CLOUD_CANDIDATES_STALE');
  const sourceRows = new Map(snapshot.candidates.map(row => [row.candidate_id, row]));
  const actual = new Map(candidates.map(row => [row.story_id, row]));
  const events = new Map();
  for (const story of stories.filter(row => row.published && !manual(row) && row.retirement?.reason_code !== 'MERGED_INTO_LIVING_FILE')) {
    if (!story.event_id) continue;
    if (events.has(story.event_id)) events.set(story.event_id, null);
    else events.set(story.event_id, story);
  }
  const seen = new Set(), targets = new Set(), ranks = new Set(), selected = [];
  const dispositions = new Set(['new', 'update', 'repeat', 'defer']);
  const allowedKeys = new Set(['candidate_id', 'candidate_hash', 'decision', 'event_id', 'duplicate_candidate_id',
    'rank', 'new_information', 'reason', 'evidence', 'uncertainty', 'topics']);
  for (const decision of result.decisions) {
    const row = sourceRows.get(decision.candidate_id), candidate = actual.get(decision.candidate_id);
    if (!row || !candidate || seen.has(row.candidate_id)) fail('CLOUD_DECISION_ID_INVALID');
    seen.add(row.candidate_id);
    if (Object.keys(decision).some(key => !allowedKeys.has(key)) || decision.candidate_hash !== row.candidate_hash
      || !dispositions.has(decision.decision) || typeof decision.reason !== 'string' || decision.reason.trim().length < 30
      || decision.reason.length > 1600 || typeof decision.uncertainty !== 'string'
      || !Array.isArray(decision.topics) || decision.topics.some(topic => typeof topic !== 'string')) fail('CLOUD_DECISION_INVALID');
    if (!Array.isArray(decision.evidence) || decision.evidence.some(ref =>
      !row.sources.some(s => s.source_id === ref.source_id && s.url === ref.url))) fail('CLOUD_EVIDENCE_INVALID');
    if (decision.event_id && !events.get(decision.event_id)) fail('CLOUD_EVENT_ID_INVALID');
    if (decision.duplicate_candidate_id && (!sourceRows.has(decision.duplicate_candidate_id)
      || decision.duplicate_candidate_id === decision.candidate_id)) fail('CLOUD_DUPLICATE_ID_INVALID');
    if (decision.decision === 'repeat') {
      if (!decision.event_id && !decision.duplicate_candidate_id) fail('CLOUD_REPEAT_TARGET_MISSING');
      continue;
    }
    if (decision.decision === 'defer') continue;
    if (!Number.isSafeInteger(decision.rank) || decision.rank < 1 || ranks.has(decision.rank)
      || typeof decision.new_information !== 'string' || decision.new_information.trim().length < 30
      || decision.new_information.length > 1600 || !decision.evidence.length || decision.duplicate_candidate_id)
      fail('CLOUD_SELECTION_INVALID');
    ranks.add(decision.rank);
    if (decision.decision === 'new') {
      if (decision.event_id || candidate.existing_story?.published) fail('CLOUD_NEW_EVENT_CONFLICT');
      selected.push({ ...candidate, cloud_selection: decision });
      continue;
    }
    const existing = events.get(decision.event_id);
    if (!existing || targets.has(existing.story_id)) fail('CLOUD_UPDATE_TARGET_INVALID');
    targets.add(existing.story_id);
    // No automatic merge of published stories. An uncertain semantic identity
    // needs source preparation, never a made-up ID or an unchecked redirection.
    if (candidate.existing_story?.published && candidate.existing_story.story_id !== existing.story_id)
      fail('CLOUD_PUBLISHED_REDIRECT_FORBIDDEN');
    const lead = candidate.sources?.[0] || {};
    const anchor = { title: existing.title, summary: existing.analysis?.source_summary || existing.source_summary || '',
      published_at: existing.published_at };
    if (candidate.existing_story?.story_id !== existing.story_id
      && (namedSubjectConflict(lead, anchor) || !eventCompatibility(lead, anchor).same_event))
      fail('CLOUD_UPDATE_IDENTITY_UNCERTAIN');
    selected.push({ ...candidate, story_id: existing.story_id, slug: existing.slug,
      existing_story: existing, event_id: existing.event_id, first_seen: existing.first_seen,
      cloud_selection: decision });
  }
  const selectedIds = new Set(result.decisions.filter(d => ['new', 'update'].includes(d.decision)).map(d => d.candidate_id));
  for (const d of result.decisions) if (d.duplicate_candidate_id && !selectedIds.has(d.duplicate_candidate_id))
    fail('CLOUD_DUPLICATE_CHAIN_INVALID');
  // A new row and an update must not both consume the same stored story ID.
  if (new Set(selected.map(row => row.story_id)).size !== selected.length) fail('CLOUD_TARGET_DUPLICATE');
  return selected.sort((a, b) => a.cloud_selection.rank - b.cloud_selection.rank);
}

export function selectionReceiptKey(snapshot, result) {
  return hash({ input_hash: snapshot.input_hash, result });
}
export function importSelection(snapshot, result, context) {
  assertSnapshot(snapshot);
  const key = selectionReceiptKey(snapshot, result);
  if (context.state.cloud_selection_receipts?.[snapshot.input_hash]) {
    if (context.state.cloud_selection_receipts[snapshot.input_hash].key !== key) fail('CLOUD_RESULT_CONFLICT');
    return { selected: [], key, replay: true };
  }
  const selected = validateSelectionResult(snapshot, result, context);
  return { selected, key, replay: false };
}
export function acknowledgeSelection(state, snapshot, receipt, now) {
  state.cloud_selection_receipts ||= {};
  state.cloud_selection_receipts[snapshot.input_hash] = { key: receipt.key, run_id: snapshot.run_id, imported_at: now };
  // Keep receipts at least as long as any valid result can be replayed.
  for (const [id, row] of Object.entries(state.cloud_selection_receipts))
    if (Date.parse(now) - Date.parse(row.imported_at) > 7 * 86400000) delete state.cloud_selection_receipts[id];
}
