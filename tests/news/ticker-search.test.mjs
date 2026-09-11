import test from 'node:test';
import assert from 'node:assert/strict';
import {searchWords, searchTokens, searchBucket, wordVariants, indexPrefixes, findSearchIds} from '../../assets/js/ticker-search.js';
import {recordSearchText, contentTopics} from '../../scripts/news/app-pages.mjs';
function index(records) {
  const buckets={};
  for(const r of records) for(const word of searchWords(r.text).flatMap(wordVariants)) for(const prefix of indexPrefixes(word)) {
    const b=buckets[searchBucket(prefix)]??={};b[prefix]??=[];if(!b[prefix].includes(r.id))b[prefix].push(r.id);
  }
  return {lookup:new Map(records.map(r=>[r.id,{type:'news',topics:['technik'],date:'2026-09-10',...r}])),loadBucket:async key=>buckets[key]||{}};
}
test('multiword searches ignore connecting words but retain every meaningful term',async()=>{
  assert.deepEqual(searchTokens('Die Sendung über KI und Arbeit'),['ki','arbeit']);
  const data=index([{id:'a',title:'KI und Arbeit',text:'KI Arbeit'},{id:'b',title:'Kiew',text:'Kiew Kinder Arbeit'},{id:'c',title:'KI',text:'KI ohne Beschäftigung'}]);
  assert.deepEqual(await findSearchIds({...data,term:'KI und Arbeit'}),['a']);
});
test('AI and KI are recognized without treating Airbnb, Kinder or Kiew as AI',async()=>{
  const data=index([{id:'a',title:'AI im Betrieb',text:'AI im Betrieb'},{id:'b',title:'Kiew',text:'Kiew Kinder Airbnb'}]);
  assert.deepEqual(await findSearchIds({...data,term:'KI'}),['a']);
  assert.equal(indexPrefixes('kinder').includes('ki'),false);
});
test('umlaut transliteration and prefixes match the same published people',async()=>{
  const data=index([{id:'a',title:'Maja Göpel',text:'Maja Göpel'}]);
  for(const term of ['Göpel','Goepel','Gopel','Göpe'])assert.deepEqual(await findSearchIds({...data,term}),['a']);
});
test('title matches rank first; newest sort remains explicitly available',async()=>{
  const data=index([{id:'a',title:'Europa und Kapital',text:'Europa Kapital',date:'2026-09-01'},{id:'b',title:'Ein anderer Titel',text:'Europa Kapital',date:'2026-09-11'}]);
  assert.deepEqual(await findSearchIds({...data,term:'Europa Kapital'}),['a','b']);
  assert.deepEqual(await findSearchIds({...data,term:'Europa Kapital',sort:'neueste'}),['b','a']);
});
test('format and topic filters intersect, including an empty search',async()=>{
  const data=index([{id:'a',title:'Sendung',text:'Lanz',type:'watched',topics:['politik']},{id:'b',title:'News',text:'Lanz',type:'news',topics:['politik']},{id:'c',title:'Klima',text:'Lanz',type:'watched',topics:['klima']}]);
  assert.deepEqual(await findSearchIds({...data,term:'Lanz',type:'watched',topic:'politik'}),['a']);
  assert.deepEqual(await findSearchIds({...data,term:'',type:'watched',topic:'politik',mode:'analysen'}),['a']);
  assert.deepEqual(await findSearchIds({...data,term:'',mode:'news'}),['b']);
});
test('only bounded needed index partitions are requested, not the complete index',async()=>{
  const data=index([{id:'a',title:'Thema',text:'Göpel KI Arbeit'}]);const calls=[];
  await findSearchIds({...data,term:'Goepel KI und Arbeit',loadBucket:key=>{calls.push(key);return data.loadBucket(key);}});
  assert.equal(calls.length,new Set(calls).size);assert.ok(calls.length<=5);
});
test('search includes published article text, guests and source names but no editorial notes',()=>{
  const text=recordSearchText({title:'Titel',body_markdown:'Öffentlicher Gedanke. <!-- INTERN -->',author_notes:'GEHEIM',editorial:{comment:'PRIVAT'},source_media:{show:'Sendung',hosts:['Host'],guests:['Gast']},sources:[{publisher:'heise online',url:'https://www.heise.de/bericht'}],analysis:{summary:'Kurzfassung',detail_summary:'Vertiefung',publication_gate:{reason:'INTERNES_GATE'}}});
  for(const value of ['Öffentlicher Gedanke','Host','Gast','heise','Vertiefung'])assert.ok(text.includes(value));
  assert.doesNotMatch(text,/GEHEIM|PRIVAT|INTERN/);
});
test('personal analyses without topic tags remain discoverable by ressort',()=>{
  assert.ok(contentTopics({tags:['Nachgesehen','Meinung & Analyse'],title:'Die Denkzettelwahl',subtitle:'Politikstil und Wahlergebnis'}).includes('politik'));
  assert.deepEqual(contentTopics({topic:['Technik'],title:'Regierung und Wirtschaft'}),['technik']);
});
