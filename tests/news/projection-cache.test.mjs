import test from 'node:test';
import assert from 'node:assert/strict';
import { projectionCache } from '../../scripts/news/projection-cache.mjs';
import { structuredEventIdentity } from '../../scripts/news/event-identity.mjs';
import { eventFingerprint } from '../../scripts/news/newsroom.mjs';
import { fileSubject, namedSubjects, diplomaticVisit, documentKey } from '../../scripts/news/living-files.mjs';
import { courtCaseRelation } from '../../scripts/news/court-case-identity.mjs';

test('bounded projection storage cannot freeze original evidence or be poisoned by callers', () => {
  const cache=projectionCache(2), source={values:['DE']};let calls=0;
  const read=key=>cache(key,()=>{calls++;return source});
  const first=read('a');assert.equal(read('a'),first);assert.equal(calls,1);
  source.values.push('FR');assert.deepEqual(first.values,['DE']);
  assert.throws(()=>first.values.push('IT'),TypeError);
  read('b');read('c');assert.deepEqual(read('a').values,['DE','FR']);assert.equal(calls,4);
  assert.equal(cache('null',()=>null),null);assert.equal(cache('null',()=>{throw Error('must be cached')}),null);
});

test('event day keeps Berlin summer/winter boundaries and explicit event-date precedence', () => {
  const item={title:'Generaldebatte im Bundestag',summary:'Debatte über den Haushalt.'};
  for(const [stamp,day] of [['2026-09-09T22:30:00Z','2026-09-10'],['2026-01-09T22:30:00Z','2026-01-09'],['2026-01-09T23:30:00Z','2026-01-10']]) {
    item.published_at=stamp;assert.equal(structuredEventIdentity(item).day,day);
  }
  item.event_date='2026-01-08T12:00:00Z';assert.equal(structuredEventIdentity(item).day,'2026-01-08');
  item.title='Generaldebatte im Bundestag vom 07.01.2026';assert.equal(structuredEventIdentity(item).day,'2026-01-07');
  item.title='Ein anderer Vorgang';assert.equal(structuredEventIdentity(item),null);
});

test('changed source content, date, geography and leading evidence invalidate routing projections', () => {
  const item={title:'Angriff auf Stromversorgung',summary:'Sabotage in Berlin.',event_geography:['DE'],published_at:'2026-09-10T10:00:00Z'};
  const old=eventFingerprint(item);item.summary='Sabotage in Hamburg.';item.event_geography.push('FR');item.published_at='2026-09-11T10:00:00Z';
  assert.notEqual(eventFingerprint(item).id,old.id);assert.deepEqual(old.geography,['DE']);
  assert.deepEqual(fileSubject(item).places,['hamburg']);item.summary='Sabotage in Dresden.';assert.deepEqual(fileSubject(item).places,['dresden']);
  const story={title:'Gespräche über Folgen',sources:[{title:'Ukraine-Krieg',summary:'Bericht über die Ukraine.'}]};
  assert.deepEqual(namedSubjects(story).conflicts,['ukraine']);story.sources[0].title='Iran-Krieg';assert.deepEqual(namedSubjects(story).conflicts,['iran']);
  const visit={title:'Sondergesandte reisen nach Berlin',summary:'Die Sondergesandten Anna Beispiel und Eva Muster als Vermittler.'};
  const result=diplomaticVisit(visit);visit.title='Sondergesandte reisen nach Hamburg';
  assert.notDeepEqual(diplomaticVisit(visit),result);
});

test('document projections retain identity and re-evaluate changed URL objects', () => {
  const url = new URL('https://www.example.org/article/?b=2&a=1&utm_source=feed#section');
  assert.equal(documentKey(url), 'example.org/article?a=1&b=2');
  url.searchParams.set('a', '3');
  assert.equal(documentKey(url), 'example.org/article?a=3&b=2');
  url.pathname = '/another-article/';
  assert.equal(documentKey(url), 'example.org/another-article?a=3&b=2');
  assert.equal(documentKey('https://www.stern.de/news/old-title-12345678.html'), documentKey('https://stern.de/news/new-title-12345678.html'));
  assert.notEqual(documentKey('https://stern.de/news/title-12345678.html'), documentKey('https://stern.de/news/title-12345679.html'));
  for (const invalid of ['not a URL', 'file:///article', null, undefined]) assert.equal(documentKey(invalid), '');
});

test('cached case citations never merge changed, ambiguous or differently suffixed proceedings', () => {
  const a = {title:'Verfahren C-123/26', summary:''};
  const b = {title:'Entscheidung C-123/26', summary:''};
  assert.equal(courtCaseRelation(a,b).status, 'shared');
  b.title = 'Entscheidung C-124/26';
  assert.equal(courtCaseRelation(a,b).status, 'different');
  b.summary = 'Auch C-123/26 wird besprochen.';
  assert.equal(courtCaseRelation(a,b).status, 'ambiguous');
  b.title = 'Entscheidung C-123/26 P'; b.summary = '';
  assert.equal(courtCaseRelation(a,b).status, 'different');
  b.title = 'Neue Entscheidung'; b.url = 'https://example.org/c12326/';
  assert.equal(courtCaseRelation(a,b).status, 'shared');
  b.url = 'https://example.org/c12426/';
  assert.equal(courtCaseRelation(a,b).status, 'unestablished');
  const result = courtCaseRelation(a,{title:'Verfahren C-123/26'});
  result.reference = 'C-999/26';
  assert.equal(courtCaseRelation(a,{title:'Verfahren C-123/26'}).reference, 'C-123/26');
});
