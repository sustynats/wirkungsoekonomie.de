import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {recoverRetainedDiscovery, retainedDiscoverySnapshot} from '../../scripts/news/retained-discovery-inputs.mjs';

const now = '2026-10-28T06:00:00.000Z';
const registry = {sources: [{source_id: 'stern-schlagzeilen', enabled: true, role: 'A',
  url: 'https://www.stern.de/', feed_url: 'https://www.stern.de/feed/standard/all/',
  access: {status: 'public', cost_usd: 0, article: 'metadata_only'}}]};
const fixture = () => ({store: {stories: [], public_updated_at: 'unchanged'}, state: {
  seen_items: {}, pending_story_ids: ['unrelated'], source_status: {keep: {etag: 'unchanged'}},
  publication_recovery: {old_receipt: {keep: true}}, locked_request: {status: 'started'},
}, registry: structuredClone(registry), now});

test('only the five immutable unpaid pending originals return to the ordinary queue', () => {
  const input = fixture(), originals = retainedDiscoverySnapshot();
  const result = recoverRetainedDiscovery(input);
  assert.equal(result.provider_called, false); assert.equal(result.restored.length, 5);
  assert.deepEqual(input.store.stories, originals.records.map(r => r.story));
  assert.equal(input.store.public_updated_at, 'unchanged');
  assert.deepEqual(input.state.pending_story_ids, ['unrelated', ...originals.records.map(r => r.story.story_id)]);
  assert.deepEqual(input.state.source_status, {keep: {etag: 'unchanged'}});
  assert.deepEqual(input.state.locked_request, {status: 'started'});
  assert.deepEqual(input.state.publication_recovery.old_receipt, {keep: true});
  for (const row of originals.records) {
    const s = input.store.stories.find(s => s.story_id === row.story.story_id);
    assert.equal(s.published, false); assert.equal(s.versions.length, 0); assert.equal(s.analysis, undefined);
    assert.deepEqual(input.state.seen_items[row.seen_items[0].key], row.seen_items[0].record);
  }
  assert.equal(input.store.stories.filter(s => s.pending_reason === 'EDITORIAL_RELEVANCE_BELOW_THRESHOLD').length, 2);
});

test('a repeat run or later explicit removal cannot reinsert the same recovery cohort', () => {
  const input = fixture(); recoverRetainedDiscovery(input);
  const first = structuredClone(input);
  assert.equal(recoverRetainedDiscovery(input).reason, 'already_accounted'); assert.deepEqual(input, first);
  input.store.stories.pop(); input.state.pending_story_ids.pop();
  delete input.state.seen_items[retainedDiscoverySnapshot().records.at(-1).seen_items[0].key];
  const removed = structuredClone(input);
  assert.equal(recoverRetainedDiscovery(input).restored.length, 0); assert.deepEqual(input, removed);
});

test('published, paid, unknown-provider and manually edited current records are preserved exactly', () => {
  for (const extra of [{published: true, versions: [{version: 1}], analysis: {keep: true}},
    {ai_retry: {retry_count: 3, fingerprint: 'retained'}, ai_retry_history: [{keep: true}]},
    {provider_request: {status: 'started', outcome: 'unknown'}},
    {manual_only: true, title: 'A later editorial decision'}]) {
    const input = fixture(), original = retainedDiscoverySnapshot().records[0].story;
    const current = {...structuredClone(original), ...extra}; input.store.stories.push(current);
    const before = structuredClone(current), result = recoverRetainedDiscovery(input);
    assert.equal(input.store.stories.filter(s => s.story_id === original.story_id).length, 1);
    assert.deepEqual(input.store.stories[0], before);
    assert.equal(result.restored.some(s => s.story_id === original.story_id), false);
  }
});

test('an existing exact source, including a pending update, prevents another story', () => {
  for (const pendingUpdate of [false, true]) {
    const input = fixture(), original = retainedDiscoverySnapshot().records[0].story;
    const current = {story_id: 'different-existing-id', title: 'Existing edition', published: true,
      sources: pendingUpdate ? [] : structuredClone(original.sources),
      ...(pendingUpdate ? {pending_update: {sources: structuredClone(original.sources)}} : {})};
    input.store.stories.push(current); const before = structuredClone(current);
    const result = recoverRetainedDiscovery(input);
    assert.ok(result.existing.some(s => s.canonical_story_id === current.story_id && s.reason === 'existing_source'));
    assert.deepEqual(input.store.stories[0], before);
    assert.equal(input.store.stories.some(s => s.story_id === original.story_id), false);
  }
});

test('the existing native document matcher also protects a canonical URL alias', () => {
  const input = fixture(), original = retainedDiscoverySnapshot().records[0].story;
  const current = {...structuredClone(original), story_id: 'canonical-alias',
    sources: original.sources.map(s => ({...s, url: s.url + '#article'}))};
  input.store.stories.push(current); const before = structuredClone(current);
  const result = recoverRetainedDiscovery(input);
  assert.ok(result.existing.some(s => s.story_id === original.story_id && s.reason === 'existing_event'
    && s.canonical_story_id === current.story_id));
  assert.deepEqual(input.store.stories[0], before);
  assert.equal(input.store.stories.some(s => s.story_id === original.story_id), false);
});

test('current source access and publisher restrictions cannot be bypassed by a retained snapshot', () => {
  for (const patch of [{enabled: false}, {role: 'B'}, {access: {status: 'private'}},
    {access: {status: 'public', requires_login: true}}, {access: {status: 'public', cost_usd: 1}}]) {
    const input = fixture(); Object.assign(input.registry.sources[0], patch);
    const before = structuredClone(input), result = recoverRetainedDiscovery(input);
    assert.equal(result.restored.length, 0); assert.equal(result.held.length, 5); assert.deepEqual(input, before);
  }
});

test('seen-key conflicts, newer seen metadata and orphan pending IDs are not reset', () => {
  const original = retainedDiscoverySnapshot().records[0], id = original.story.story_id;
  for (const kind of ['conflict', 'seen', 'pending', 'null_legacy_seen']) {
    const input = fixture();
    if (kind === 'pending') input.state.pending_story_ids.push(id);
    else if (kind === 'null_legacy_seen') input.state.seen_items[original.seen_items[0].key] = null;
    else input.state.seen_items[original.seen_items[0].key] = {...original.seen_items[0].record,
      url: kind === 'conflict' ? 'https://www.stern.de/a-newer-different-document.html' : original.story.sources[0].url,
      content_hash: 'newer-content-hash', last_seen: now};
    const seen = structuredClone(input.state.seen_items); const pending = [...input.state.pending_story_ids];
    const result = recoverRetainedDiscovery(input);
    assert.equal(result.restored.some(s => s.story_id === id), false);
    for (const [key, value] of Object.entries(seen)) assert.deepEqual(input.state.seen_items[key], value);
    assert.deepEqual(input.state.pending_story_ids.slice(0, pending.length), pending);
  }
});

test('changed bindings, a conflicting receipt and premature replay fail before modifying state', () => {
  const input = fixture(), before = structuredClone(input);
  const bundle = retainedDiscoverySnapshot(); bundle.records[0].story.title = 'Changed or private input';
  bundle.payload_sha256 = createHash('sha256').update(JSON.stringify(bundle.records)).digest('hex');
  assert.throws(() => recoverRetainedDiscovery({...input, bundle}), /BINDING_INVALID/); assert.deepEqual(input, before);
  const early = fixture(); early.now = '2026-10-28T03:00:00Z'; const earlyBefore = structuredClone(early);
  assert.equal(recoverRetainedDiscovery(early).reason, 'before_completed_snapshot'); assert.deepEqual(early, earlyBefore);
  const conflict = fixture(); conflict.state.publication_recovery.retained_unpaid_discovery_20261028 = {payload_sha256: 'other'};
  const conflictBefore = structuredClone(conflict);
  assert.throws(() => recoverRetainedDiscovery(conflict), /RECEIPT_CONFLICT/); assert.deepEqual(conflict, conflictBefore);
});
