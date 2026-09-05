import test from 'node:test';
import assert from 'node:assert/strict';
import { compactEvidenceSegments, expandEvidenceSegments, serializeEvidencePackets, reviewFingerprint, reviewCheckpoint, canReuseReview, articleSourceOrder } from '../../scripts/news/evidence-packets.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { buildAnalysisPrompt } from '../../scripts/news/lib.mjs';
import { evaluateRunHealth } from '../../scripts/news/check-run-health.mjs';

const now = '2026-09-04T12:00:00.000Z';
const source = { source_id: 'test', publisher_id: 'test', name: 'Test', url: 'https://example.org/', feed_url: 'https://example.org/rss', enabled: true, source_type: 'official_rss', primary_source: true, access: { status: 'public', article: 'metadata_only', cost_usd: 0 }, frequency_class: 'high_frequency' };
const item = { source_id: 'test', publisher_id: 'test', publisher: 'Test', url: 'https://example.org/a', title: 'Bund beschließt Klimagesetz zur Energieversorgung', summary: 'Neue Regeln verändern Investitionen in Energie und Infrastruktur.', primary_source: true, published_at: now };
const candidate = () => ({ story_id: 'wt-test', title: item.title, sources: [{...item}], claims: [], existing_story: { current_version: 2 }, related_ticker_history: [{story_id:'related', title:'Anderes Ereignis', summary:'Unveränderte Einordnung', source_urls:['https://example.org/b']}] });
const options = (story, overrides = {}) => ({ dryRun: true, now, registry: { schema_version: '1.0', sources: [source], policy: {} }, state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' }, storyStore: { stories: [story] }, usage: { runs: [] }, newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] }, budgetFx: { rate_date: '2026-09-04', rate_usd_per_eur: 1.16 }, fetchFeedImpl: async () => ({ not_modified: true, final_url: source.feed_url }), fetchArticleImpl: async () => { throw new Error('No paid or live network in tests'); }, aiBatchDelayImpl: async () => {}, ...overrides });
const storedStory = () => ({ story_id: 'wt-test', slug: 'klimagesetz', title: item.title, published: true, listed: true, first_seen: now, last_updated: now, published_at: now, current_version: 2, versions: [{version:2,analysis:{summary:'Bestehender Artikel'}}], analysis: { summary:'Bestehender Artikel' }, sources: [{...item}], pending_update: { sources:[{...item}], detected_at: now, reason:'AI_BUDGET_OR_BATCH_LIMIT' } });

test('packet references round-trip all exact passages, including contradictory statements', () => {
  const shared = 'Diese lange Passage ist in zwei Artikeln wortgleich enthalten und belegt keine unabhängige Bestätigung.';
  const original = {sources:[0,1].map(n => ({ source_id:`s-${n}`, url:`https://example.org/${n}`, title:'Amtliche Aussage zur Versorgung', abstract:`Die Versorgung ist ${n ? 'nicht ' : ''}gesichert. Alle Angaben gelten ausschließlich für den genannten Zeitraum.`, evidence_segments:[{evidence_id:`title-${n}`,excerpt:'Amtliche Aussage zur Versorgung'}, {evidence_id:`shared-${n}`,excerpt:shared}]}))};
  original.sources.forEach((s,n) => s.evidence_segments.push({evidence_id:`fact-${n}`,excerpt:s.abstract}));
  const [packed] = compactEvidenceSegments([structuredClone(original)]);
  assert.ok(JSON.stringify(packed).length < JSON.stringify(original).length);
  assert.deepEqual(expandEvidenceSegments(packed), original.sources);
  assert.notEqual(expandEvidenceSegments(packed)[0].evidence_segments[2].excerpt, expandEvidenceSegments(packed)[1].evidence_segments[2].excerpt);
  // Removing all dictionary references must not leave unused bytes behind.
  packed.sources.forEach(s => s.evidence_segments = s.evidence_segments.filter(e => e.excerpt_text === undefined));
  assert.equal(JSON.parse(serializeEvidencePackets([packed]))[0].evidence_texts, undefined);
  assert.throws(() => expandEvidenceSegments({sources:[{evidence_segments:[{excerpt_text:99}]}]}), /EVIDENCE_REFERENCE_INVALID/);
  assert.throws(() => expandEvidenceSegments({sources:[{title:'kurz',evidence_segments:[{excerpt_from:['title',-1,90]}]}]}), /EVIDENCE_REFERENCE_INVALID/);
});

test('review reuse is bounded and invalidated by evidence, scope and publication changes', () => {
  const c = candidate();
  c.existing_story.review_checkpoint = reviewCheckpoint(c, now, 'no_material_update');
  assert.equal(canReuseReview(c, now), true);
  assert.equal(canReuseReview(c, '2026-09-04T18:00:00Z'), false);
  for (const mutate of [c=>c.sources[0].summary+=' Nicht bestätigt.', c=>c.sources.push({...item,url:item.url+'/neu'}), c=>c.sources[0].published_at='2026-09-04T12:01:00Z', c=>c.sources[0].provenance={origin:'agency:dpa'}, c=>c.sources[0].primary_source=false, c=>c.sources[0].source_role='commentary', c=>c.sources[0].content_hash='changed', c=>c.related_ticker_history[0].summary+=' Neue Entwicklung.', c=>c.existing_story.current_version++, c=>c.followup_due=true, c=>c.deepening_due=true]) {
    const changed = structuredClone(c); mutate(changed); assert.equal(canReuseReview(changed, now), false);
  }
  const repeated = structuredClone(c); repeated.sources[0].ingested_at='later'; repeated.sources[0].last_checked_at='later';
  assert.equal(reviewFingerprint(repeated),reviewFingerprint(c));
  c.existing_story.review_checkpoint = reviewCheckpoint(c, now, 'input_too_large');
  assert.equal(canReuseReview(c, now), false);
  c.sources.push({...item,url:item.url+'/b'}); const before=reviewFingerprint(c); c.sources.reverse(); assert.equal(reviewFingerprint(c),before);
});

test('article reads favor changed evidence without dropping the source catalog', () => {
  const old={...item,url:item.url+'/old'}, fresh={...item,url:item.url+'/new',summary:'Ein neuer abweichender Bericht.'};
  const c={sources:[old,fresh,{...fresh,url:item.url+'/copy'}],existing_story:{sources:[old]}};
  assert.equal(articleSourceOrder(c)[0].url,fresh.url);
  assert.equal(articleSourceOrder(c).length,2);
  assert.equal(c.sources.length,3);
  c.sources[2].source_role='opinion'; assert.equal(articleSourceOrder(c).length,3);
});

test('headless no-update review persists its evidence and skips the same input without public changes', async () => {
  let captured, calls=0;
  const callAiImpl=async stories => { calls++; buildAnalysisPrompt(stories); return {analyses:stories.map(s=>({story_id:s.story_id,publication_recommendation:false,rejection:{code:'no_new_information',reason:'Die vorliegenden Quellen ergänzen keine neue materielle Information gegenüber der veröffentlichten Fassung.'}})),model:'gpt-5.4-mini',reported_usage:{input_tokens:100,output_tokens:50}}; };
  const opts=options(storedStory(),{callAiImpl,captureState:value=>captured=value});
  const first=await runWirkungsticker(opts);
  assert.equal(calls,1); assert.equal(first.public_changed,false);
  const saved=captured.storyStore.stories[0];
  assert.equal(saved.review_checkpoint.outcome,'no_material_update'); assert.deepEqual(saved.review_checkpoint.sources,[item]);
  assert.equal(saved.pending_update,undefined); assert.equal(saved.current_version,2); assert.deepEqual(saved.versions,opts.storyStore.stories[0].versions);
  // Simulate a repeated queue arrival of the same source set.
  saved.pending_update={...opts.storyStore.stories[0].pending_update};
  const second=await runWirkungsticker({...opts,...captured});
  assert.equal(calls,1); assert.equal(second.reviews_reused,1); assert.equal(second.ai_calls,0); assert.equal(second.estimated_cost_usd,0); assert.equal(second.public_changed,false);
  assert.equal(captured.storyStore.stories[0].pending_update,undefined);
  captured.storyStore.stories[0].pending_update={sources:[{...item,summary:item.summary+' Neue verbindliche Vorgabe.'}],detected_at:now,reason:'AI_BUDGET_OR_BATCH_LIMIT'};
  await runWirkungsticker({...opts,...captured}); assert.equal(calls,2);
});

test('oversize preflight preserves a queue item and leaves the paid slot to another article', async () => {
  let captured, calls=[];
  const blocked=storedStory(); blocked.pending_update.sources=[{...item,url:'https://example.org/'+ 'x'.repeat(40000)}];
  const other={...storedStory(),story_id:'wt-other',slug:'krankenkassen',title:'Reform der Krankenkassen beschlossen',sources:[{...item,url:'https://example.org/health',title:'Reform der Krankenkassen beschlossen',summary:'Die Gesundheitsreform betrifft Versicherte und Finanzierung der Versorgung.'}]};
  other.pending_update={sources:other.sources,detected_at:now,reason:'AI_BUDGET_OR_BATCH_LIMIT'};
  const opts=options(blocked,{storyStore:{stories:[blocked,other]},callAiImpl:async stories=>{calls.push(...stories.map(s=>s.story_id));return {analyses:stories.map(s=>({story_id:s.story_id,publication_recommendation:false,rejection:{code:'no_new_information',reason:'Der Quellenstand enthält keine neuen materiellen Informationen gegenüber dem veröffentlichten Artikel.'}})),model:'gpt-5.4-mini',reported_usage:{input_tokens:100,output_tokens:50}};},captureState:value=>captured=value});
  const report=await runWirkungsticker(opts);
  assert.deepEqual(calls,['wt-other']); assert.equal(report.ai_error,undefined); assert.equal(report.input_holds.length,1); assert.equal(report.ai_calls,1);
  assert.equal(captured.storyStore.stories.find(s=>s.story_id==='wt-test').pending_update.reason,'AI_INPUT_TOO_LARGE');
  assert.ok(evaluateRunHealth(report,{now}).errors.includes('AI_INPUT_BLOCKED'));
  assert.ok(!evaluateRunHealth(report,{now}).errors.includes('AI_PROVIDER_DEGRADED'));
  const again=await runWirkungsticker({...opts,...captured});
  assert.equal(again.input_holds[0].reused,undefined); assert.equal(again.ai_calls,0);
});
