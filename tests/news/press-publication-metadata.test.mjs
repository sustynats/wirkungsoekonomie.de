import test from 'node:test';
import assert from 'node:assert/strict';
import {extractDiscoveryMetadata} from '../../scripts/news/active-discovery.mjs';
const source={source_id:'official-test',name:'Synthetisches Statistikamt',primary_source:true,official_endpoint_verified:true};
const url='https://example.org/press/release';
const page=heading=>`<meta property="og:title" content="Synthetische Importpreisstatistik"><meta property="og:updated_time" content="2026-09-12T13:00:00Z"><h1>Synthetische Importpreisstatistik</h1>${heading}`;
test('an explicitly declared official press release date retains day precision',()=>{
 const item=extractDiscoveryMetadata(page('<h2>Pressemitteilung Nr. 309 vom 28. August 2026</h2>'),url,source);
 assert.equal(item.published_at,'2026-08-28');assert.equal(item.published_precision,'day');
});
test('dates in body, update metadata, ambiguous headings and invalid days cannot become publication dates',()=>{
 for(const heading of [
  '<p>Pressemitteilung Nr. 309 vom 28. August 2026</p>',
  '<h2>Aktualisiert am 28. August 2026</h2>',
  '<h2>Pressemitteilung Nr. 309 vom 31. Februar 2026</h2>',
  '<h2>Pressemitteilung Nr. 309 vom 28. August 2026</h2><h2>Pressemitteilung Nr. 310 vom 29. August 2026</h2>',
  '<!-- <h2>Pressemitteilung Nr. 309 vom 28. August 2026</h2> -->',
 ])assert.equal(extractDiscoveryMetadata(page(heading),url,source),null);
 const html=page('<h2>Pressemitteilung Nr. 309 vom 28. August 2026</h2>');
 assert.equal(extractDiscoveryMetadata(html,url,{...source,primary_source:false}),null);
 assert.equal(extractDiscoveryMetadata(html,url,{...source,official_endpoint_verified:false}),null);
});
test('structured original publication time remains authoritative',()=>{
 const html=page('<h2>Pressemitteilung Nr. 309 vom 28. August 2026</h2>')+'<meta property="article:published_time" content="2026-08-28T08:00:00+02:00">';
 const item=extractDiscoveryMetadata(html,url,source);assert.equal(item.published_at,'2026-08-28T06:00:00.000Z');assert.equal(item.published_precision,undefined);
});
