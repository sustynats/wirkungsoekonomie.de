// Restore only the five unpaid pending records from this completed failed run.
// They re-enter the existing queue, not publication or a separate provider path.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {sourceAccess} from './access-policy.mjs';
import {clusterItems} from './lib.mjs';

const FILE = new URL('../../content/news/reviews/2026-10-28-retained-unpaid-discovery.json', import.meta.url);
const HASH = '802dd9d21caf88f2e6146e1df3179142d14f202bfa7ad1a7ab21bafa8a9b8b54';
const IDS = ['wt-8859e50886747733', 'wt-700329a2ddcde365', 'wt-31faccc236ac7551', 'wt-713f92a939887fc7', 'wt-3c477adb6ca06dd5'];
const RECEIPT = 'retained_unpaid_discovery_20261028';

export function retainedDiscoverySnapshot() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function checkedSnapshot(bundle) {
  if (bundle?.schema_version !== 1 || bundle.kind !== 'retained_unpaid_pending_discovery'
      || bundle.run_id !== 40624975084 || bundle.artifact_id !== 12789018818
      || bundle.artifact_sha256 !== 'ee3eb4318b1215bf6a742717111b422a82026805da79ece307c6394db3f172c3'
      || bundle.completed_at !== '2026-10-28T03:18:16.926Z'
      || !Array.isArray(bundle.records) || bundle.records.length !== IDS.length
      || bundle.payload_sha256 !== HASH
      || createHash('sha256').update(JSON.stringify(bundle.records)).digest('hex') !== HASH
      || JSON.stringify(bundle.records.map(item => item.story.story_id)) !== JSON.stringify(IDS)) {
    throw Error('RETAINED_DISCOVERY_BINDING_INVALID');
  }
  for (const {story, seen_items} of bundle.records) {
    if (story.published !== false || story.versions?.length !== 0 || story.analysis
        || story.ai_retry || story.ai_retry_history?.length || story.quality_retry_count !== 0
        || story.manual_only || story.automation_policy === 'manual_only'
        || story.sources?.length !== 1 || seen_items?.length !== 1
        || !['AI_BUDGET_OR_BATCH_LIMIT', 'EDITORIAL_RELEVANCE_BELOW_THRESHOLD'].includes(story.pending_reason)) {
      throw Error('RETAINED_DISCOVERY_NOT_UNPAID_PENDING');
    }
    const source = story.sources[0], seen = seen_items[0];
    if (seen.key !== source.source_item_id || seen.record.source_id !== source.source_id
        || seen.record.url !== source.url || seen.record.content_hash !== source.content_hash
        || seen.record.published_at !== source.published_at) throw Error('RETAINED_DISCOVERY_SOURCE_CONFLICT');
  }
  return bundle;
}

export function recoverRetainedDiscovery({store, state, registry, now, bundle = retainedDiscoverySnapshot()}) {
  const snapshot = checkedSnapshot(bundle);
  if (!Number.isFinite(Date.parse(now))) throw Error('RETAINED_DISCOVERY_TIME_INVALID');
  const result = {run_id: snapshot.run_id, artifact_id: snapshot.artifact_id,
    payload_sha256: HASH, restored: [], existing: [], held: [], provider_called: false};
  if (Date.parse(now) < Date.parse(snapshot.completed_at)) return {...result, reason: 'before_completed_snapshot'};
  const receipt = state.publication_recovery?.[RECEIPT];
  if (receipt && receipt.payload_sha256 !== HASH) throw Error('RETAINED_DISCOVERY_RECEIPT_CONFLICT');
  const settled = new Set(receipt?.settled_story_ids || []);
  if (IDS.every(id => settled.has(id))) return {...result, reason: 'already_accounted'};
  const byId = new Map(store.stories.map(story => [story.story_id, story]));
  const seen = state.seen_items || {}, pending = new Set(state.pending_story_ids || []);
  for (const item of snapshot.records) {
    const row = item.story, id = row.story_id, source = row.sources[0], record = item.seen_items[0];
    if (settled.has(id)) continue;
    if (byId.has(id)) { result.existing.push({story_id: id, reason: 'existing_story'}); settled.add(id); continue; }
    const sameSource = store.stories.find(story => [...(story.sources || []), ...(story.pending_update?.sources || [])].some(s => s?.url === source.url));
    if (sameSource) { result.existing.push({story_id: id, canonical_story_id: sameSource.story_id, reason: 'existing_source'}); settled.add(id); continue; }
    if (pending.has(id)) { result.held.push({story_id: id, reason: 'pending_id_without_story'}); continue; }
    if (Object.hasOwn(seen, record.key) && seen[record.key]?.url !== source.url) {
      result.held.push({story_id: id, reason: 'seen_key_conflict'}); continue;
    }
    if (Object.values(seen).some(value => value?.url === source.url)) {
      result.existing.push({story_id: id, reason: 'source_already_seen'}); settled.add(id); continue;
    }
    const registered = registry.sources.find(s => s.source_id === source.source_id);
    if (!registered || !registered.enabled || !sourceAccess(registered).allowed) {
      result.held.push({story_id: id, reason: 'source_not_enabled_for_free_access'}); continue;
    }
    const matching = clusterItems([source], store.stories, now)[0];
    if (matching?.existing_story) {
      result.existing.push({story_id: id, canonical_story_id: matching.existing_story.story_id, reason: 'existing_event'});
      settled.add(id); continue;
    }
    if (!matching || matching.story_id !== id) {
      result.held.push({story_id: id, reason: 'retained_identity_changed'}); continue;
    }
    // Original dates, prefilter holds and source bindings remain unchanged.
    // The regular runner alone decides readiness, ranking, quota and publication.
    store.stories.push(structuredClone(row));
    (state.seen_items ||= {})[record.key] = structuredClone(record.record);
    (state.pending_story_ids ||= []).push(id);
    byId.set(id, row); pending.add(id); settled.add(id);
    result.restored.push({story_id: id, pending_reason: row.pending_reason});
  }
  if (settled.size > (receipt?.settled_story_ids?.length || 0)) {
    state.publication_recovery = {...state.publication_recovery, [RECEIPT]: {
      recovered_at: now, github_run_id: snapshot.run_id, artifact_id: snapshot.artifact_id,
      artifact_sha256: snapshot.artifact_sha256, payload_sha256: HASH,
      settled_story_ids: [...settled], restored_story_ids: [...(receipt?.restored_story_ids || []), ...result.restored.map(s => s.story_id)],
    }};
  }
  return result;
}
