import test from 'node:test';
import assert from 'node:assert/strict';
import { numberTokens, numericEvidenceReceipt, persistedNumericEvidence } from '../../scripts/news/numeric-evidence.mjs';
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

test('explicit English source language distinguishes thousands from decimal points', () => {
  for (const language of ['en', 'en-GB', 'en-US']) {
    assert.deepEqual([...numberTokens('Floods kill 1,300 people.', language)], ['1300']);
    assert.deepEqual([...numberTokens('1,300,000 people and 1,234.56 dollars', language)], ['1300000', '1234.56']);
    assert.deepEqual([...numberTokens('2.330 percent and 5.2 million', language)], ['2.33', '5.2']);
    assert.ok(!numberTokens('1,300 people', language).has('1.3'));
  }
  for (const language of [undefined, '', 'de', 'de-DE', 'unknown', ['en'], {language:'en'}]) {
    assert.ok(!numberTokens('1,300', language).has('1300'), 'no English locale guessed');
  }
});

test('malformed English grouping is not evidence for an integer or its fragments', () => {
  for (const value of ['1,30', '1,300,00', '12.34.56']) assert.deepEqual([...numberTokens(value, 'en')], []);
  assert.deepEqual([...numberTokens('12, 900 and 500 workers', 'en')], ['12', '900', '500']);
});

test('each cited source supplies its own number locale, not the model or another publisher', () => {
  const en = { source_id:'en', url:'https://example.org/en', title:'Floods kill 1,300 people.', language:'en', primary_source:false };
  const de = { source_id:'de', url:'https://example.org/de', title:'Der Wert beträgt 1,300 Prozent.', language:'de', primary_source:false };
  const a = { news_status:'preliminary', followups:[], event_claims:[{ claim:'Die Quelle berichtet von 1300 Todesfällen.', status:'single_source_claim', evidence:[{source_id:en.source_id,url:en.url,excerpt:en.title}] }] };
  const s = {sources:[en,de]};
  assert.deepEqual(validateNewsroomAnalysis(a,s), []);
  a.event_claims[0].evidence = [{source_id:de.source_id,url:de.url,excerpt:de.title,language:'en'}];
  assert.ok(validateNewsroomAnalysis(a,s).includes('CLAIM_NUMBER_NOT_IN_EVIDENCE'), 'other English source and model-supplied locale do not provide proof');
  a.event_claims[0].claim = 'Der Wert beträgt 1,3 Prozent.';
  assert.deepEqual(validateNewsroomAnalysis(a,s), []);
  a.event_claims[0].evidence = [{source_id:en.source_id,url:en.url,excerpt:en.title}];
  assert.ok(validateNewsroomAnalysis(a,s).includes('CLAIM_NUMBER_NOT_IN_EVIDENCE'), 'English thousands must not also license a decimal');
});

test('numeric receipts preserve exact source-locale interpretation without copying or altering text', () => {
  const excerpt = 'The report lists 1,300 people and 2.330 percent.';
  const source = {source_id:'en',url:'https://example.org/en',language:'en',content_hash:'v1',article_excerpt:excerpt};
  const s = {sources:[source],current_version:1};
  s.numeric_evidence = numericEvidenceReceipt(s,1,'2026-09-08T00:00:00Z');
  assert.equal(source.article_excerpt,excerpt);
  assert.deepEqual(s.numeric_evidence.sources[0].numbers,['1300','2.33']);
  assert.ok(!JSON.stringify(s.numeric_evidence).includes(excerpt));
  delete source.article_excerpt;
  assert.deepEqual(persistedNumericEvidence(s),['1300','2.33']);
  source.language = 'de';
  assert.deepEqual(persistedNumericEvidence(s),[], 'changed parsing context invalidates new receipts');
});

test('locale-aware diagnostics report only actual gaps and retain no source prose', () => {
  const source = {source_id:'en',url:'https://example.org/en',language:'en'};
  const excerpt = 'Floods kill 1,300 people.';
  const a = {event_claims:[{claim:'1300 Tote und 250 Vermisste.',evidence:[{...source,excerpt}]}]};
  const d = analysisValidationDiagnostics(a,undefined,{sources:[source]});
  assert.deepEqual(d.missing_claim_numbers,[{claim_index:0,missing:['250'],cited_numbers:['1300']}]);
  assert.ok(!JSON.stringify(d).includes(excerpt));
});

test('historical numeric receipts are not silently reinterpreted', () => {
  const source = {source_id:'s',url:'https://example.org/a',content_hash:'v1',article_excerpt:'Die Quelle nennt 5.200 Menschen.'};
  const s = {sources:[source],current_version:1};
  s.numeric_evidence = numericEvidenceReceipt(s,1,'2026-09-07T20:00:00Z');
  delete s.numeric_evidence.sources[0].number_locale;
  delete source.article_excerpt;
  assert.deepEqual(persistedNumericEvidence(s),['5200']);
  assert.deepEqual(s.numeric_evidence.sources[0].numbers,['5200']);
});

test('failed output diagnostics preserve numeric proof gaps, never foreign excerpts', () => {
  const excerpt = 'Laut Quelle mussten 5.200 Menschen das Gebiet verlassen.';
  const result = analysisValidationDiagnostics({source_summary:'Erster Absatz.\n\nZweiter Absatz.', event_claims:[
    {claim:'5200 Menschen.',evidence:[{excerpt}]},
    {claim:'Die Bombe wiegt 250 Kilogramm.',evidence:[{excerpt}]},
  ]});
  assert.equal(result.source_summary_words, 4);
  assert.equal(result.source_summary_paragraphs, 2);
  assert.equal(result.publication_decision_type,'undefined');
  assert.equal(analysisValidationDiagnostics({media_impact:{public_explanation:'Ein kurzer Erklärungstext.'}}).media_public_explanation_words,3);
  assert.equal(analysisValidationDiagnostics({publication_recommendation:'true'}).publication_decision_value,'true');
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

test('media diagnostics distinguish model output from normalization without retaining prose', () => {
  const original = 'Ein kurzer Anfang.\n\nEine wichtige Evidenzgrenze bleibt erhalten.';
  const result = analysisValidationDiagnostics({media_impact:{public_explanation:'Ein kurzer Anfang.'}}, original);
  assert.equal(result.media_public_explanation_input_words, 8);
  assert.equal(result.media_public_explanation_input_paragraphs, 2);
  assert.equal(result.media_public_explanation_words, 3);
  assert.equal(result.media_public_explanation_paragraphs, 1);
  assert.ok(!JSON.stringify(result).includes('Anfang'));
  assert.equal(analysisValidationDiagnostics({}).media_public_explanation_input_words, undefined, 'unknown raw length is not reported as zero');
});
