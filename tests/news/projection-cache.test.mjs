import test from 'node:test';
import assert from 'node:assert/strict';
import { projectionCache } from '../../scripts/news/projection-cache.mjs';
import { structuredEventIdentity } from '../../scripts/news/event-identity.mjs';
import { eventFingerprint } from '../../scripts/news/newsroom.mjs';
import { fileSubject, namedSubjects, diplomaticVisit } from '../../scripts/news/living-files.mjs';

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
