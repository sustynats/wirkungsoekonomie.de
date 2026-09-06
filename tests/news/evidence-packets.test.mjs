import test from 'node:test';
import assert from 'node:assert/strict';
import { compactEvidenceSegments, expandEvidenceSegments, serializeEvidencePackets, reviewFingerprint, reviewCheckpoint, canReuseReview, articleSourceOrder } from '../../scripts/news/evidence-packets.mjs';
import { runWirkungsticker, recoverAmbiguousPublicationDecisions, normalizeEditorialDecision, retryCoolingDown } from '../../scripts/news/run.mjs';
import { validateAnalysis } from '../../scripts/news/lib.mjs';
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
  assert.deepEqual(evaluateRunHealth(report,{now}),{ok:true,errors:[]});
  assert.ok(!evaluateRunHealth(report,{now}).errors.includes('AI_PROVIDER_DEGRADED'));
  const again=await runWirkungsticker({...opts,...captured});
  assert.equal(again.input_holds[0].reused,undefined); assert.equal(again.ai_calls,0);
});

test('malformed AI output is retained and retried automatically after backoff', async () => {
  let captured, calls=0, fail=true;
  const callAiImpl=async stories=>{
    calls++;
    if(fail){const error=new Error('AI_MALFORMED_JSON');error.requestAttempts=1;throw error;}
    return {analyses:stories.map(story=>({story_id:story.story_id,publication_recommendation:false,rejection:{code:'no_new_information',reason:'Die Quellen enthalten keine neue materielle Information gegenüber der bestehenden Fassung.'}})),model:'gpt-5.4-mini',reported_usage:{input_tokens:100,output_tokens:50}};
  };
  const first=await runWirkungsticker(options(storedStory(),{callAiImpl,captureState:value=>captured=value}));
  const pending=captured.storyStore.stories[0].pending_update;
  assert.equal(first.ai_output_invalid,1);
  assert.equal(first.operational_status,'ok');
  assert.equal(pending.reason,'AI_OUTPUT_INVALID');
  assert.equal(pending.quality_retry_count,1);
  assert.equal(pending.quality_retry_after,'2026-09-04T12:15:00.000Z');
  const waitingCandidate = { ...captured.storyStore.stories[0], sources: pending.sources, existing_story: captured.storyStore.stories[0], fresh: true, deepening_due: true, followup_due: true };
  assert.equal(retryCoolingDown(waitingCandidate, '2026-09-04T12:10:00Z'), true);
  const newEvidence = structuredClone(waitingCandidate);
  newEvidence.sources[0].summary += ' Eine neue verbindliche Entscheidung liegt vor.';
  assert.equal(retryCoolingDown(newEvidence, '2026-09-04T12:10:00Z'), false);
  captured.storyStore.stories[0].deepening_due_at = now;
  await runWirkungsticker({...options(captured.storyStore.stories[0]),...captured,now:'2026-09-04T12:10:00.000Z',callAiImpl,captureState:value=>captured=value});
  assert.equal(calls,1);
  fail=false;
  const third=await runWirkungsticker({...options(captured.storyStore.stories[0]),...captured,now:'2026-09-04T12:16:00.000Z',callAiImpl,captureState:value=>captured=value});
  assert.equal(calls,2);
  assert.equal(third.ai_batches_completed,1);
  assert.equal(captured.storyStore.stories[0].pending_update,undefined);
});

test('duplicate enum in a rejection is a terminal editorial decision, never a publication', () => {
  const c = { ...candidate(), preanalysis: { filter_version: '4.0' } };
  const draft = { story_id: c.story_id, publication_recommendation: false,
    rejection: { code: 'duplicate_without_new_information', reason: 'Die Quellen wiederholen den bereits belegten Sachverhalt ohne neue materielle Information.' } };
  normalizeEditorialDecision(draft);
  assert.equal(draft.rejection.original_code, 'duplicate_without_new_information');
  assert.deepEqual(validateAnalysis(draft, c), ['AI_PUBLICATION_NOT_RECOMMENDED', 'AI_DUPLICATE_WITHOUT_UPDATE']);
  draft.rejection.reason = 'kurz';
  assert.ok(validateAnalysis(draft, c).some(e => e.startsWith('AI_REQUIRED_STRING:')));
});

test('legacy exhausted records retry, but malformed rejection is never published or retired', async()=>{
  let captured,calls=0;
  const legacy=storedStory();
  legacy.published=false;
  delete legacy.pending_update;
  legacy.pending_reason='QUALITY_GATE_FAILED';
  legacy.quality_retry_count=4;
  legacy.quality_errors=['AI_REQUIRED_STRING:summary','AI_PUBLICATION_NOT_RECOMMENDED'];
  const callAiImpl=async stories=>{calls++;return {analyses:stories.map(s=>({story_id:s.story_id,publication_recommendation:false,rejection:{code:'not_material',reason:'kurz'}})),model:'gpt-5.4-mini',reported_usage:{input_tokens:100,output_tokens:50}}};
  const first=await runWirkungsticker(options(legacy,{callAiImpl,captureState:value=>captured=value}));
  assert.equal(calls,1);
  assert.equal(first.published_stories,0);
  const saved=captured.storyStore.stories[0];
  assert.notEqual(saved.listed,false);
  assert.equal(saved.quality_retry_count,5);
  assert.ok(Date.parse(saved.quality_retry_after)>Date.parse(now));
  assert.equal(first.queue.technical,1);
  await runWirkungsticker({...options(saved),...captured,now:'2026-09-04T12:10:00Z',callAiImpl});
  assert.equal(calls,1);
});

test('local relevance rejection settles stale capacity entries without a paid call',async()=>{
  const low={...storedStory(),published:false,title:'Neues Spiel für die Konsole',analysis:undefined};
  delete low.pending_update;
  low.pending_reason='AI_BUDGET_OR_BATCH_LIMIT';
  low.sources=[{...item,title:low.title,summary:'Ein neues Videospiel erscheint für die Konsole.'}];
  let captured,calls=0;
  const report=await runWirkungsticker(options(low,{callAiImpl:async()=>{calls++;throw Error('must not call')},captureState:value=>captured=value}));
  assert.equal(calls,0);assert.equal(report.local_queue_completed,1);assert.equal(report.queue.after,0);
  assert.equal(captured.storyStore.stories[0].listed,false);
  assert.deepEqual(captured.storyStore.stories[0].rejection.quality_errors,['LOCAL_RELEVANCE_BELOW_THRESHOLD']);
});

test('one-time legacy decision review preserves rejections and never republishes or reopens explicit false', async () => {
  const ambiguous = { ...storedStory(), published: false, listed: false, rejection: { at: now, quality_errors: ['AI_PUBLICATION_NOT_RECOMMENDED'] } };
  delete ambiguous.pending_update;
  const explicit = { ...structuredClone(ambiguous), story_id: 'explicit' };
  const immaterial = { ...structuredClone(ambiguous), story_id: 'immaterial', rejection: { quality_errors: ['AI_PUBLICATION_NOT_RECOMMENDED', 'AI_MATERIALITY_TOO_LOW'] } };
  const published = { ...structuredClone(ambiguous), story_id: 'historical', published: true };
  const rows = [ambiguous, explicit, immaterial, published];
  const decisions = [{ story_id: 'explicit', publication_recommendation: false }];
  assert.deepEqual(recoverAmbiguousPublicationDecisions(rows, decisions, now), ['wt-test']);
  assert.deepEqual(recoverAmbiguousPublicationDecisions(rows, decisions, now), []);
  assert.equal(ambiguous.published, false);
  assert.equal(ambiguous.rejection_history[0].quality_errors[0], 'AI_PUBLICATION_NOT_RECOMMENDED');
  assert.equal(explicit.listed, false); assert.equal(immaterial.listed, false); assert.equal(published.listed, false);
  let captured;
  const report = await runWirkungsticker(options(ambiguous, {
    callAiImpl: async stories => ({ analyses: stories.map(s => ({ story_id: s.story_id, publication_recommendation: false, rejection: { code: 'insufficient_evidence', reason: 'Die vorliegenden Quellen reichen für eine eigenständige Veröffentlichung nicht aus.' } })), model: 'gpt-5.4-mini', reported_usage: { input_tokens: 100, output_tokens: 50 } }),
    captureState: value => captured = value,
  }));
  assert.equal(report.ai_calls, 1); assert.equal(report.published_stories, 0);
  const result = captured.storyStore.stories[0];
  assert.equal(result.listed, false);
  assert.equal(result.rejection_history.length, 1);
  assert.ok(result.publication_decision_review);
  assert.equal(captured.newsroom.decisions.at(-1).publication_recommendation, false);
  assert.equal(captured.newsroom.decisions.at(-1).rejection_code, 'insufficient_evidence');
});
