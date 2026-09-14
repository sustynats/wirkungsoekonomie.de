import test from 'node:test';
import assert from 'node:assert/strict';
import {newsInputReadiness} from '../../scripts/news/news-input-readiness.mjs';
import {preparedNewsStory,preparedNewsPrompt} from './fixtures/api-news-input.mjs';
import {fitAnalysisInput} from '../../scripts/news/lib.mjs';

test('one attributed source with an actual excerpt is enough; this is not an editorial approval',()=>{
 const result=newsInputReadiness(preparedNewsPrompt());
 assert.equal(result.status,'READY_FOR_DRAFT');assert.equal(result.usable_sources,1);
 assert.equal(result.scope,'input_completeness_not_editorial_approval');
});
for(const [label,change,code] of [
 ['headline only',s=>s.sources[0].evidence_segments[0].excerpt=s.sources[0].title,'NEWS_INPUT_EVIDENCE_TOO_THIN'],
 ['missing source',s=>s.sources=[],'NEWS_INPUT_SOURCES_MISSING'],
 ['undated source',s=>delete s.sources[0].published_at,'NEWS_INPUT_SOURCE_DATE_MISSING'],
 ['foreign claim',s=>s.claims[0].source_id='unread-source','NEWS_INPUT_CLAIM_UNBOUND'],
 ['missing claim',s=>s.claims=[],'NEWS_INPUT_CLAIMS_MISSING'],
 ['player configuration',s=>s.sources[0].evidence_segments[0].excerpt+=' ","params":"?startTime=$start$&endTime=$ende$"','NEWS_INPUT_EXTRACTION_CONTAMINATED'],
 ['mixed ticker',s=>s.canonical_title='++ Schwierigkeiten zum Schulstart ++ Droht Insolvenzwelle bei Krankenhäusern? ++','NEWS_INPUT_EVENT_NOT_SCOPED'],
 ['programme preview',s=>s.canonical_title='Vorschau: TV-Tipps am Montag','NEWS_INPUT_PROGRAMME_LISTING'],
]) test(`free preparation rejects ${label}`,()=>{
 const story=preparedNewsStory();change(story);const result=newsInputReadiness(preparedNewsPrompt(story));
 assert.equal(result.status,'NEEDS_PREPARATION');assert.ok(result.issues.some(i=>i.code===code));
});
test('unparseable and multiple event packets cannot be admitted',()=>{
 for(const prompt of ['metadata',preparedNewsPrompt().replace('UNTRUSTED_SOURCE_DATA_END','broken'),
  'Contract\nUNTRUSTED_SOURCE_DATA_BEGIN\n'+JSON.stringify([preparedNewsStory(),preparedNewsStory()])+'\nUNTRUSTED_SOURCE_DATA_END']){
  assert.equal(newsInputReadiness(prompt).status,'NEEDS_PREPARATION');
 }
});
test('lossless compact input retains readiness and source bindings',()=>{
 const original=preparedNewsStory(),packed=fitAnalysisInput([original],10000);
 const prompt='Contract\nUNTRUSTED_SOURCE_DATA_BEGIN\n'+(typeof packed==='string'?packed:JSON.stringify(packed))+'\nUNTRUSTED_SOURCE_DATA_END';
 assert.equal(newsInputReadiness(prompt).status,'READY_FOR_DRAFT');
});
