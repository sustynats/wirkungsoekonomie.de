import test from 'node:test';
import assert from 'node:assert/strict';
import { numberTokens } from '../../scripts/news/numeric-evidence.mjs';
import { validateNewsroomAnalysis } from '../../scripts/news/newsroom.mjs';
import { analysisValidationDiagnostics } from '../../scripts/news/run.mjs';

test('German grouped integers and decimal notation are normalized without changing magnitude', () => {
  for (const value of ['5.200', '5 200', '5\u00a0200', '5\u202f200', '5200']) assert.deepEqual([...numberTokens(value)], ['5200']);
  for (const value of ['1.234,56 Euro', '1 234,56 Euro', '1234.56 Euro']) assert.deepEqual([...numberTokens(value)], ['1234.56']);
  assert.deepEqual([...numberTokens('2,330 Prozent')], ['2.33']);
  assert.deepEqual([...numberTokens('2.330 Prozent')], ['2.33']);
  assert.ok(!numberTokens('5,2 Millionen').has('5200000'), 'no implicit unit conversion');
  assert.ok(!numberTokens('2,330').has('2330'), 'ambiguous English grouping is not silently accepted');
  assert.ok(!numberTokens('250').has('5200'));
});

test('failed output diagnostics preserve numeric proof gaps, never foreign excerpts', () => {
  const excerpt = 'Laut Quelle mussten 5.200 Menschen das Gebiet verlassen.';
  const result = analysisValidationDiagnostics({source_summary:'Erster Absatz.\n\nZweiter Absatz.', event_claims:[
    {claim:'5200 Menschen.',evidence:[{excerpt}]},
    {claim:'Die Bombe wiegt 250 Kilogramm.',evidence:[{excerpt}]},
  ]});
  assert.equal(result.source_summary_words, 4);
  assert.equal(result.source_summary_paragraphs, 2);
  assert.deepEqual(result.missing_claim_numbers, [{claim_index:1,missing:['250'],cited_numbers:['5200']}]);
  assert.ok(!JSON.stringify(result).includes(excerpt));
  assert.deepEqual(analysisValidationDiagnostics({event_claims:[null,{claim:null,evidence:[null]}]}).missing_claim_numbers, []);
  assert.deepEqual(analysisValidationDiagnostics({event_claims:{}}).missing_claim_numbers, []);
});

test('claim numbers remain bound to the actual cited excerpt', () => {
  const source = { source_id:'s', url:'https://example.org/a', title:'Kiel: Bombe entschärft', summary:'Rund 5.200 Menschen mussten das Gebiet verlassen. Die Bombe wiegt 250 Kilogramm.', primary_source:true };
  const analysis = { news_status:'confirmed', followups:[], event_claims:[{ claim:'Rund 5200 Menschen mussten das Gebiet verlassen.', status:'primary_source_claim', evidence:[{source_id:'s',url:source.url,excerpt:'Rund 5.200 Menschen mussten das Gebiet verlassen.'}] }] };
  assert.ok(!validateNewsroomAnalysis(analysis,{sources:[source]}).includes('CLAIM_NUMBER_NOT_IN_EVIDENCE'));
  analysis.event_claims[0].claim = 'Die Bombe wiegt 250 Kilogramm.';
  assert.ok(validateNewsroomAnalysis(analysis,{sources:[source]}).includes('CLAIM_NUMBER_NOT_IN_EVIDENCE'), 'uncited part of same source is not proof');
  analysis.event_claims[0].claim = 'Rund 52000 Menschen mussten das Gebiet verlassen.';
  assert.ok(validateNewsroomAnalysis(analysis,{sources:[source]}).includes('CLAIM_NUMBER_NOT_IN_EVIDENCE'));
});
