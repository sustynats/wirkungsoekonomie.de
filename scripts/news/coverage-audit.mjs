import { createHash } from 'node:crypto';
import { clusterItems, preAnalyzeStory } from './lib.mjs';
import { eventFingerprint } from './newsroom.mjs';
import { structuredEventIdentity } from './event-identity.mjs';
import { isMerged } from './living-files.mjs';
import { categoryCoverage, COVERAGE_CATEGORIES, EVENT_RELEVANCE_VERSION } from './event-relevance.mjs';

const ms = value => Date.parse(value || '') || 0;
const hash = value => createHash('sha256').update(value).digest('hex').slice(0, 24);
const active = story => story.published && story.listed !== false && !isMerged(story);

export function observedMajorEvents(items, now, { limit = 600, hours = 48 } = {}) {
  const recent = [...new Map(items.filter(item => item.title && item.url && ms(item.published_at)
    && ms(item.published_at) <= ms(now) + 600000 && ms(item.published_at) >= ms(now) - hours * 3600000)
    .sort((a, b) => ms(b.published_at) - ms(a.published_at)).map(item => [item.url, item])).values()].slice(0, Math.min(1000, limit));
  // Reuse established event links and exact proceeding identities. An all-pairs
  // rescan of the entire raw archive twice per run is prohibitively expensive.
  // No topical keyword alone is a merge key; uncertain relations stay separate.
  const buckets = new Map();
  for (const item of recent) {
    const key = structuredEventIdentity(item)?.key || item.event_id || eventFingerprint(item).id;
    buckets.set(key, [...(buckets.get(key) || []), item]);
  }
  return [...buckets.values()].flatMap(items => clusterItems(items, [], now)).map(cluster => {
    const preanalysis = preAnalyzeStory(cluster, now);
    return { ...cluster, event_id: eventFingerprint(cluster.sources[0]).id, preanalysis,
      first_seen_at: cluster.sources.map(s => s.first_seen_at || s.ingested_at || now).sort()[0],
      last_seen_at: cluster.sources.map(s => s.last_seen_at || s.ingested_at || now).sort().at(-1),
      input_hash: hash(cluster.sources.map(s => `${s.url}:${s.content_hash || ''}`).sort().join('\n')) };
  }).filter(event => event.preanalysis.internal_relevance_score >= 50
    || (event.preanalysis.internal_relevance_score >= 30 && event.preanalysis.event_score.independent_source_count >= 2))
    .sort((a, b) => b.preanalysis.internal_relevance_score - a.preanalysis.internal_relevance_score);
}

export function findEventStory(event, stories, now) {
  const urls = new Set(event.sources.map(source => source.url));
  const direct = stories.filter(story => !isMerged(story) && (story.sources || []).some(s => urls.has(s.url)));
  if (direct.length) return direct.sort((a, b) => Number(active(b)) - Number(active(a)))[0];
  const keys = new Set(event.sources.map(item => structuredEventIdentity(item)?.key).filter(Boolean));
  const ids = new Set([event.event_id,...event.sources.map(source=>source.event_id)].filter(Boolean));
  return stories.find(story => active(story) && (ids.has(story.event_id)
    || (keys.size && story.sources?.some(item => keys.has(structuredEventIdentity(item)?.key)))));
}

export function eventDecision(event, story, decisions = [], selectedIds = new Set()) {
  const eventIds = new Set([event.event_id, story?.event_id, ...event.sources.map(s => s.event_id)].filter(Boolean));
  const relevant = decisions.filter(d => eventIds.has(d.event_id) || (story?.story_id && d.story_id === story.story_id));
  const last = relevant.at(-1);
  const selected = selectedIds.has(story?.story_id || event.story_id);
  if (story && active(story)) return { selection_status: 'published', selected_in_run: selected, failure_class: null, selection_reason: 'published_matching_event', rejection_reason: null, decision_at: story.published_at };
  if (selected && (!last || last.decision === 'selected_for_verification')) return { selection_status: 'selected', selected_in_run: true, failure_class: null, selection_reason: 'selected_for_verification', rejection_reason: null };
  const reason = story?.pending_update?.reason || story?.pending_reason || last?.rejection_code || last?.reason
    || last?.errors?.join(',') || last?.decision || 'no_recorded_selection';
  const local = last?.decision === 'local_relevance_below_threshold' || last?.rejection_code === 'not_material';
  const capacity = /BUDGET|BATCH_LIMIT|HOURLY_CALL|RUN_TIME|AI_DISABLED|capacity_deferred/.test(reason);
  const extraction = /PARSER|FETCH|SOURCE_DATE|SOURCE_PARSER|FEED_|EXTRACTION/.test(reason);
  const cluster = /DUPLICATE|no_new_information|superseded/.test(reason);
  return { selection_status: capacity ? 'deferred' : last ? 'rejected_or_held' : 'observed_only', selected_in_run: selected,
    failure_class: capacity ? 'E' : local ? 'D' : extraction ? 'B' : cluster ? 'C_REVIEW' : last ? 'F' : 'UNRESOLVED',
    selection_reason: last?.rationale || reason, rejection_reason: reason, decision_at: last?.at || null };
}

export function coverageAudit({ items = [], stories = [], decisions = [], selectedIds = new Set(), now, sourceFunnel = [], previousFunnel = [], observed = null }) {
  const fragments = observed || observedMajorEvents(items, now);
  // The observer can see old raw event IDs. Resolve them against the existing
  // story before counting: one reviewed file is not several paid selections.
  const groups = new Map();
  for (const event of fragments) {
    const story = findEventStory(event, stories, now);
    const key = story?.story_id || event.story_id || event.event_id;
    const previous = groups.get(key);
    if (!previous) groups.set(key, { ...event, matched_story: story });
    else {
      previous.sources = [...new Map([...previous.sources, ...event.sources].map(s => [s.url, s])).values()];
      previous.first_seen_at = [previous.first_seen_at, event.first_seen_at].sort()[0];
      previous.last_seen_at = [previous.last_seen_at, event.last_seen_at].sort().at(-1);
    }
  }
  const events = [...groups.values()];
  const coverage = categoryCoverage(stories, now);
  const rows = events.map(event => {
    const story = event.matched_story;
    const decision = eventDecision(event, story, decisions, selectedIds);
    const selection = decisions.filter(d => d.story_id === story?.story_id && d.decision === 'selected_for_verification' && d.score).at(-1);
    const score = selection?.score || preAnalyzeStory(event, now).event_score;
    const sources = story?.pending_update?.sources || story?.sources || event.sources;
    return { event_id: story?.event_id || event.event_id, canonical_title: event.title,
      first_seen_at: event.first_seen_at, last_seen_at: event.last_seen_at,
      sources: sources.map(s => ({ source_id: s.source_id, publisher_id: s.publisher_id, url: s.url, published_at: s.published_at })),
      ...score, score_basis: selection ? 'recorded_selection' : 'observed_evidence', ...decision, cluster_id: story?.story_id || event.story_id,
      published_article_id: story && active(story) ? story.story_id : null,
      public_url: story && active(story) ? `https://wirkungsoekonomie.de/wirkungsticker/${story.slug}/` : null,
      observation_scope: 'bounded_allowed_source_sample_not_entire_web',
      potential_missed: decision.selection_status !== 'published',
      age_minutes: Math.max(0, Math.round((ms(now) - ms(event.first_seen_at)) / 60000)) };
  });
  // The recorded selection can differ from the observer's partial source
  // score. Sort the final rows, not the pre-resolution fragments.
  const tier = {TOP:0,HIGH:1,NORMAL:2,LOW:3};
  rows.sort((a,b)=>(tier[a.priority]??4)-(tier[b.priority]??4)
    || b.total_relevance_score-a.total_relevance_score || String(a.cluster_id).localeCompare(String(b.cluster_id)));
  const gaps = rows.filter(row => row.potential_missed);
  const alerts = [];
  for (const category of COVERAGE_CATEGORIES) {
    const missing = gaps.filter(e => e.categories.includes(category) && e.total_relevance_score >= 50 && e.age_minutes >= 60);
    if (!coverage[category] && missing.length) alerts.push({ code: 'CATEGORY_COVERAGE_GAP', category, events: missing.length,
      event_ids: missing.slice(0, 5).map(e => e.event_id), severity: 'warning' });
  }
  for (const event of gaps.filter(e => e.breaking_status === 'breaking' && e.age_minutes >= 60)) alerts.push({ code: 'BREAKING_PUBLICATION_GAP', event_id: event.event_id, severity: 'warning' });
  for (const row of sourceFunnel) {
    const previous = previousFunnel.find(p => p.source_id === row.source_id);
    if (row.parse_failures || row.fetch_failures) alerts.push({ code: 'SOURCE_EXTRACTION_FAILURE', source_id: row.source_id, severity: 'warning' });
    if (row.scheduled && row.feed_items === 0 && row.fetch_successes && !row.not_modified && previous?.feed_items > 0) alerts.push({ code: 'SOURCE_ZERO_INPUT', source_id: row.source_id, severity: 'info' });
    if (row.scheduled && row.fetch_successes && !row.not_modified && previous?.feed_items >= 20 && row.feed_items < previous.feed_items * .2) alerts.push({ code: 'DISCOVERY_VOLUME_DROP', source_id: row.source_id, previous: previous.feed_items, current: row.feed_items, severity: 'info' });
    if (row.feed_items > 20 && row.items_duplicate / row.feed_items > .98) alerts.push({ code: 'HIGH_UNCHANGED_SHARE', source_id: row.source_id, severity: 'info' });
  }
  const publisherCounts = new Map();
  for (const event of rows) for (const publisher of new Set(event.sources.map(s => s.publisher_id || s.source_id))) publisherCounts.set(publisher, (publisherCounts.get(publisher) || 0) + 1);
  const dominant = [...publisherCounts].sort((a,b) => b[1]-a[1])[0];
  if (rows.length >= 10 && dominant?.[1] / rows.length > .75) alerts.push({ code: 'PUBLISHER_CONCENTRATION', publisher_id: dominant[0], share: Number((dominant[1]/rows.length).toFixed(2)), severity: 'info' });
  return { version: EVENT_RELEVANCE_VERSION, checked_at: now, sample_items: items.length,
    scope: 'Observed allowed sources; a missing unobserved event cannot be inferred without an external hint.',
    counts: { discovered: items.length, clustered_major: rows.length, selected: rows.filter(r => r.selected_in_run).length,
      published: rows.filter(r => r.published_article_id).length, rejected_or_held: rows.filter(r => r.selection_status === 'rejected_or_held').length, potential_missed: gaps.length },
    category_coverage: coverage, source_coverage: sourceFunnel, top_events: rows.slice(0, 30), potential_missed_news: gaps.slice(0, 60), alerts };
}

// A second check schedules existing allowed evidence through the SAME queue.
// It never calls a model, changes an editorial verdict or bypasses its cooldown.
export function missedNewsRechecks({ observed, stories, state, now, maxEvents = 4 }) {
  const previous = state.missed_news_rechecks || {};
  const records = Object.fromEntries(Object.entries(previous).filter(([, record]) => ms(record.checked_at) >= ms(now) - 7 * 86400000));
  const items = [], events = [];
  for (const event of observed) {
    if (events.length >= Math.min(4, maxEvents)) break;
    const story = findEventStory(event, stories, now);
    if (story && active(story)) continue;
    if (event.preanalysis.internal_relevance_score < 50) continue;
    const key = story?.story_id || event.sources[0]?.url;
    if (!key) continue;
    const record = records[key];
    // Repeated negative judgments with identical evidence must not become paid
    // hourly retries. Recheck only changed evidence or a new scoring version.
    if (record?.input_hash === event.input_hash && record.version === EVENT_RELEVANCE_VERSION) continue;
    if (record && ms(now) - ms(record.checked_at) < 3600000) continue;
    records[key] = { input_hash: event.input_hash, version: EVENT_RELEVANCE_VERSION, checked_at: now };
    items.push(...event.sources);
    events.push({ event_id: event.event_id, story_id: story?.story_id || null, reason: 'independent_major_event_recheck', input_hash: event.input_hash });
  }
  state.missed_news_rechecks = records;
  return { items: [...new Map(items.map(item => [item.url, item])).values()], events };
}
