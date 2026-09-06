import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildAnalysisPrompt, callWoekAi, claimLedgerFor, preAnalyzeStory, fitAnalysisInput, budgetStage } from '../../scripts/news/lib.mjs';
import { detectMediaImpactTrigger } from '../../scripts/news/media-impact.mjs';
import { evidenceGroups } from '../../scripts/news/newsroom.mjs';
import { serializeEvidencePackets, expandPacketTransport, expandEvidenceSegments } from '../../scripts/news/evidence-packets.mjs';
import { evaluateRunHealth } from '../../scripts/news/check-run-health.mjs';
import { aiDeferralReason } from '../../scripts/news/run.mjs';

test('September 6 election packet fits with 20 sources, fresh excerpts and full comparison context', () => {
  const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/input-limit-regression-20260906.json', import.meta.url)));
  fixture.currentness = { ...fixture.currentness, compared_current_feed_items: 5000, matching_current_feed_items: 20, followups_due: [] };
  fixture.sources.slice(0, 3).forEach((source, i) => {
    source.article_excerpt = `Die Quelle ${i} nennt weitere Angaben, lässt Ursache und mögliche Folgen aber ausdrücklich offen. `.repeat(45);
  });
  const before = structuredClone(fixture);
  const prompt = buildAnalysisPrompt([fixture]);
  assert.ok(prompt.length <= 39000, `Prompt has ${prompt.length} characters`);
  const packet = expandPacketTransport(JSON.parse(prompt.split('UNTRUSTED_SOURCE_DATA_BEGIN\n')[1].split('\nUNTRUSTED_SOURCE_DATA_END')[0])[0]);
  assert.equal(packet.sources.length, 20);
  assert.equal(packet.claims.length, fixture.claims.length);
  assert.deepEqual(packet.related_ticker_history, fixture.related_ticker_history);
  assert.deepEqual(packet.currentness, fixture.currentness);
  packet.sources.forEach((row, i) => {
    const source = { ...packet.source_defaults, ...row };
    assert.equal(source.url, fixture.sources[i].url);
    assert.equal(source.source_id, fixture.sources[i].source_id);
    assert.equal(source.published_at, fixture.sources[i].published_at);
    assert.equal(source.primary_source, fixture.sources[i].primary_source);
    assert.deepEqual(source.provenance ? { ...packet.provenance_defaults, ...source.provenance } : null, fixture.sources[i].provenance || null);
  });
  for (const source of expandEvidenceSegments(packet)) for (const evidence of source.evidence_segments) {
    const original = fixture.sources.find(item => item.url === source.url);
    assert.ok(`${original.title} ${original.summary} ${original.article_excerpt || ''}`.includes(evidence.excerpt));
  }
  assert.deepEqual(fixture, before);
});

test('dense cells preserve explicit null, absent fields, exact evidence ownership and legacy packets', () => {
  const story = { sources: [
    { url: 'https://example.org/one', provenance: null, evidence_segments: [{ evidence_id: 'a', excerpt: 'Die Aussage wird ausdrücklich nicht bestätigt.' }] },
    { url: 'https://example.org/two', evidence_segments: [{ evidence_id: 'b', excerpt: 'Die Aussage wird ausdrücklich bestätigt.' }] },
    { url: 'https://example.org/empty', evidence_segments: [] },
  ], claims: [{ claim: null }, { claim_id: 'missing-claim' }], related_ticker_history: [{ story_id: 'prior', summary: null }] };
  assert.deepEqual(expandPacketTransport(JSON.parse(serializeEvidencePackets([story], true))[0]), story);
  assert.deepEqual(expandPacketTransport({ sources_table: { columns: ['url', 'provenance'], rows: [[['https://example.org/old'], [null]]] } }), { sources: [{ url: 'https://example.org/old', provenance: null }] });
  assert.throws(() => expandPacketTransport({ sources: [], evidence_table: { format: 'cells-v2', columns: ['source_index'], rows: [[9]] } }), /PACKET_SOURCE_REFERENCE_INVALID/);
});

test('soft budget throttling remains retryable; only a budget stop blocks eligible stories',()=>{
  const candidate={preanalysis:{internal_relevance_score:34},reassessment:false};
  assert.equal(aiDeferralReason(candidate,budgetStage(13.42,18.9),25),'AI_BUDGET_OR_BATCH_LIMIT');
  assert.equal(aiDeferralReason(candidate,budgetStage(17.96,18.9),25),'AI_BUDGET_BLOCKED');
  assert.equal(aiDeferralReason(candidate,{stage:0,threshold:30},25),'AI_BUDGET_OR_BATCH_LIMIT');
  assert.equal(aiDeferralReason(candidate,{stage:0,threshold:30},0),'AI_HOURLY_CALL_LIMIT');
  assert.equal(aiDeferralReason({...candidate,reassessment:true},budgetStage(13.42,18.9),25),'AI_BUDGET_OR_BATCH_LIMIT');
});

test('325 equal dependency records retain their multiplicity without quadratic prompt growth',()=>{
  const sources=Array.from({length:26},(_,i)=>({source_id:'same',publisher_id:'same',url:`https://example.org/${i}`,title:'Anhörung zur geplanten Änderung',summary:'Unveränderter Text'}));
  const groups=evidenceGroups(sources);
  assert.equal(groups.dependencies.length,1);
  assert.equal(groups.dependencies[0].document_pairs,325);
  assert.equal(groups.possible_independent_origins,1);
  assert.equal(groups.independence_is_verified,false);
  assert.deepEqual(groups.groups,[['same']]);
});
test('large same-registry source sets factor publisher metadata without losing document URLs',()=>{
  const sources=Array.from({length:31},(_,i)=>({source_id:'bundestag-hib',publisher:'Deutscher Bundestag – Heute im Bundestag',publisher_id:'bundestag',url:`https://www.bundestag.de/presse/hib/kurzmeldungen-${1210200+i}`,title:'Anhörung zur Änderung des Düngegesetzes',summary:'Der Ausschuss veröffentlicht eine eigene Stellungnahme zur Anhörung.',published_at:`2026-09-04T15:${String(i).padStart(2,'0')}:00Z`,primary_source:true,source_role:'institutional_statement',provenance:{origin:'publisher:bundestag',basis:'publisher_only_origin_unverified',independence_established:false}}));
  const candidate={story_id:'wt-large-hearing',title:'Anhörung zur Änderung des Düngegesetzes',sources,claims:claimLedgerFor(sources,'wt-large-hearing','2026-09-05T11:00:00Z'),preanalysis:preAnalyzeStory({title:'Anhörung zur Änderung des Düngegesetzes',sources}),related_ticker_history:[]};
  const prompt=buildAnalysisPrompt([candidate]);
  const packed=JSON.parse(prompt.split('UNTRUSTED_SOURCE_DATA_BEGIN\n')[1].split('\nUNTRUSTED_SOURCE_DATA_END')[0])[0];
  assert.equal(packed.source_defaults.source_id,'bundestag-hib');
  assert.equal(packed.source_defaults.publisher,'Deutscher Bundestag – Heute im Bundestag');
  const expanded=expandPacketTransport(packed);
  assert.deepEqual(expanded.sources.map(source=>source.url),sources.map(source=>source.url));
  assert.ok(prompt.length<=39000);
});
test('dense tables and text references round-trip roles, nulls, omissions, IDs and contradictions',()=>{
  const repeated='Eine lange unveränderte Textstelle, die identisch in verschiedenen Dokumenten vorkommt.';
  const story={sources:[{source_id:'s1',url:'https://example.org/1',title:repeated,primary_source:false,provenance:null,evidence_segments:[{evidence_id:'ev1',excerpt:repeated}]},{source_id:'s2',url:'https://example.org/2',title:'Die Behauptung wird ausdrücklich bestritten.',summary:repeated,evidence_segments:[{evidence_id:'ev2',excerpt:'Die Behauptung wird ausdrücklich bestritten.'}]}],claims:[{claim_id:'c1',claim:repeated,source_id:'s1'}]};
  const packed=JSON.parse(serializeEvidencePackets([story],true))[0];
  assert.deepEqual(expandPacketTransport(packed),story);
  assert.deepEqual(expandEvidenceSegments(packed),story.sources);
  const optional={sources:[{url:'https://example.org/optional',published_at:undefined,provenance:null,evidence_segments:[]}]};
  assert.deepEqual(expandPacketTransport(JSON.parse(serializeEvidencePackets([optional],true))[0]),JSON.parse(JSON.stringify(optional)));
  assert.throws(()=>expandPacketTransport({sources:[{$text:9}],text_pool:[]}),/PACKET_TEXT_REFERENCE_INVALID/);
});

test('repeated long source URLs are losslessly factored with every reference retained',()=>{
  const url='https://example.org/news/'+ 'identical-document-'.repeat(15);
  const story={sources:[{url,source_id:'a',evidence_segments:[]}],related_ticker_history:[{source_urls:[url]}],currentness:{followups_due:[{source_url:url}]} };
  const packed=serializeEvidencePackets([story],true);
  assert.ok(packed.length<JSON.stringify([story]).length);
  assert.deepEqual(expandPacketTransport(JSON.parse(packed)[0]),story);
});
test('an authenticated budget refusal is not retried or charged as an unknown provider failure',async()=>{
  let calls=0;
  await assert.rejects(callWoekAi([{story_id:'test',title:'Test',sources:[],claims:[]}],{attempts:3,fetchImpl:async()=>{calls++;return new Response(JSON.stringify({ok:false,code:'BUDGET_EXHAUSTED',provider_called:false}),{status:429,headers:{'Content-Type':'application/json'}})}}),error=>error.message==='AI_BUDGET_EXHAUSTED'&&error.providerNotCalled===true&&error.requestAttempts===1);
  assert.equal(calls,1);
  const result=evaluateRunHealth({started_at:'2026-09-04T17:00:00Z',completed_at:'2026-09-04T17:01:00Z',sources_scheduled:0,ai_error:'AI_BUDGET_EXHAUSTED'},{now:'2026-09-04T17:02:00Z'});
  assert.ok(result.errors.includes('AI_BUDGET_EXHAUSTED'));assert.ok(!result.errors.includes('AI_PROVIDER_DEGRADED'));
});
test('both actual September 4 input failures fit, with full source identity and extra article context',()=>{
  const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/input-limit-regressions-20260904.json',import.meta.url)));
  for(const fixture of fixtures){
    const sources=fixture.sources.map((s,i)=>({...s,...(i<3?{article_excerpt:Array.from({length:35},(_,n)=>`Absatz ${n}: Diese überprüfbare Textstelle enthält Grenzen und einen möglichen Widerspruch zur bisherigen Darstellung.`).join(' ')}:{})}));
    const c={...fixture,sources,claims:claimLedgerFor(sources,fixture.story_id,'2026-09-04T17:00:00Z'),preanalysis:preAnalyzeStory({...fixture,sources}),related_ticker_history:Array.from({length:5},(_,i)=>({story_id:`related-${i}`,title:'Eigenständiges verwandtes Ereignis',summary:'Kein unabhängiger Nachweis für das aktuelle Ereignis. '.repeat(6),source_urls:[`https://example.org/related-${i}`]}))};
    const prompt=buildAnalysisPrompt([c]);
    assert.ok(prompt.length<=39000,fixture.story_id);
    const packet=expandPacketTransport(JSON.parse(prompt.split('UNTRUSTED_SOURCE_DATA_BEGIN\n')[1].split('\nUNTRUSTED_SOURCE_DATA_END')[0])[0]);
    assert.deepEqual(packet.sources.map(s=>s.url),sources.map(s=>s.url));
    assert.equal(packet.claims.length,c.claims.length);
    for(const s of expandEvidenceSegments(packet)) for(const proof of s.evidence_segments){
      const original=sources.find(o=>o.url===s.url);
      assert.ok(`${original.title} ${original.summary} ${original.article_excerpt||''}`.includes(proof.excerpt));
    }
  }
});

test('September 5 election backlog fits with related stories, all claims and media context',()=>{
  const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/input-limit-regression-20260905.json',import.meta.url)));
  const prompt=buildAnalysisPrompt([fixture]);
  assert.ok(prompt.length<=39000);
  const packet=expandPacketTransport(JSON.parse(prompt.split('UNTRUSTED_SOURCE_DATA_BEGIN\n')[1].split('\nUNTRUSTED_SOURCE_DATA_END')[0])[0]);
  assert.deepEqual(packet.sources.map(s=>s.url),fixture.sources.map(s=>s.url));
  assert.equal(packet.claims.length,fixture.claims.length);
  assert.equal(packet.related_ticker_history.length,fixture.related_ticker_history.length);
  assert.deepEqual(packet.media_trigger,fixture.media_trigger);
});

test('a living file still fits after the two real late arrivals and fresh article excerpts',()=>{
  const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/input-limit-regression-20260905.json',import.meta.url)));
  const arrivals=JSON.parse(fs.readFileSync(new URL('./fixtures/input-limit-growth-20260905.json',import.meta.url)));
  const sources=[...fixture.sources,...arrivals].map((s,i)=>({...s,...(i<3?{article_excerpt:Array.from({length:35},(_,n)=>`Absatz ${n}: Die bislang vorliegenden Angaben klären die Folgen nicht abschließend. Widersprüche müssen ausdrücklich offenbleiben.`).join(' ')}:{})}));
  const candidate={...fixture,sources};
  candidate.claims=claimLedgerFor(sources,candidate.story_id,'2026-09-05T21:15:13.080Z');
  candidate.preanalysis=preAnalyzeStory(candidate);
  candidate.media_trigger=detectMediaImpactTrigger(candidate);
  const prompt=buildAnalysisPrompt([candidate]);
  assert.ok(prompt.length<=39000);
  const packet=expandPacketTransport(JSON.parse(prompt.split('UNTRUSTED_SOURCE_DATA_BEGIN\n')[1].split('\nUNTRUSTED_SOURCE_DATA_END')[0])[0]);
  assert.equal(packet.sources.length,17);
  assert.deepEqual(packet.sources.map(s=>s.url),sources.map(s=>s.url));
  assert.equal(packet.claims.length,candidate.claims.length);
  assert.deepEqual(packet.media_trigger,candidate.media_trigger);
  packet.sources.forEach((row,i)=>{
    const s={...packet.source_defaults,...row};
    assert.equal(s.primary_source,sources[i].primary_source);
    assert.equal(s.source_id,sources[i].source_id);
    assert.equal(s.role,sources[i].source_role||(sources[i].primary_source?'institutional_statement':'journalistic_report'));
    assert.deepEqual(s.provenance?{...packet.provenance_defaults,...s.provenance}:null,sources[i].provenance||null);
  });
  for(const s of expandEvidenceSegments(packet)) for(const proof of s.evidence_segments){
    const original=sources.find(o=>o.url===s.url);
    assert.ok(`${original.title} ${original.summary} ${original.article_excerpt||''}`.includes(proof.excerpt));
  }
});

test('majority transport defaults retain minority roles, explicit nulls and missing values',()=>{
  const sources=Array.from({length:6},(_,i)=>({source_id:`s-${i}`,publisher:i===5?null:'Journalismus',role:i===5?'interest_statement':'journalistic_report',primary_source:i===5,provenance:i===5?null:{basis:'publisher_only_origin_unverified',independence_established:false},evidence_segments:[]}));
  delete sources[0].publisher;
  const [packed]=JSON.parse(fitAnalysisInput([{sources,claims:[]}],10000));
  assert.equal(packed.source_defaults.role,'journalistic_report');
  assert.equal(Object.hasOwn(packed.source_defaults,'publisher'),false);
  const restored=packed.sources.map(row=>{const s={...packed.source_defaults,...row};if(s.provenance)s.provenance={...packed.provenance_defaults,...s.provenance};return s;});
  assert.deepEqual(restored,sources);
});
