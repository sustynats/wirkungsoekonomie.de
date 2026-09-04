import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildAnalysisPrompt, callWoekAi, claimLedgerFor, preAnalyzeStory } from '../../scripts/news/lib.mjs';
import { evidenceGroups } from '../../scripts/news/newsroom.mjs';
import { serializeEvidencePackets, expandPacketTransport, expandEvidenceSegments } from '../../scripts/news/evidence-packets.mjs';
import { evaluateRunHealth } from '../../scripts/news/check-run-health.mjs';

test('325 equal dependency records retain their multiplicity without quadratic prompt growth',()=>{
  const sources=Array.from({length:26},(_,i)=>({source_id:'same',publisher_id:'same',url:`https://example.org/${i}`,title:'Anhörung zur geplanten Änderung',summary:'Unveränderter Text'}));
  const groups=evidenceGroups(sources);
  assert.equal(groups.dependencies.length,1);
  assert.equal(groups.dependencies[0].document_pairs,325);
  assert.equal(groups.possible_independent_origins,1);
  assert.equal(groups.independence_is_verified,false);
  assert.deepEqual(groups.groups,[['same']]);
});
test('dense tables and text references round-trip roles, nulls, omissions, IDs and contradictions',()=>{
  const repeated='Eine lange unveränderte Textstelle, die identisch in verschiedenen Dokumenten vorkommt.';
  const story={sources:[{source_id:'s1',url:'https://example.org/1',title:repeated,primary_source:false,provenance:null,evidence_segments:[{evidence_id:'ev1',excerpt:repeated}]},{source_id:'s2',url:'https://example.org/2',title:'Die Behauptung wird ausdrücklich bestritten.',summary:repeated,evidence_segments:[{evidence_id:'ev2',excerpt:'Die Behauptung wird ausdrücklich bestritten.'}]}],claims:[{claim_id:'c1',claim:repeated,source_id:'s1'}]};
  const packed=JSON.parse(serializeEvidencePackets([story],true))[0];
  assert.deepEqual(expandPacketTransport(packed),story);
  assert.deepEqual(expandEvidenceSegments(packed),story.sources);
  assert.throws(()=>expandPacketTransport({sources:[{$text:9}],text_pool:[]}),/PACKET_TEXT_REFERENCE_INVALID/);
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
