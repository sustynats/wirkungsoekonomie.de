import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {contentType,contentTopics,searchWords,searchBucket,appNavigation,PAGE_SIZE} from '../../scripts/news/app-pages.mjs';
import {showIdentity,renderShowIdentity} from '../../scripts/news/show-identity.mjs';
const root=new URL('../../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const json=p=>JSON.parse(read(p));

test('public modes retain author content types without changing legacy identities',()=>{
 assert.equal(contentType({type:'story',value:{}}),'news');
 for(const type of ['listened','watched'])assert.equal(contentType({type:'analysis',value:{format:'approved_editorial',subtype:type}}),type);
 assert.equal(contentType({type:'analysis',value:{format:'book_and_impact'}}),'book');
 assert.ok(contentTopics({topic:['Finanzen','KI']}).includes('wirtschaft'));
 assert.ok(contentTopics({topic:['Finanzen','KI']}).includes('technik'));
});
test('news and analyses partitions are bounded, complete, unique and chronological',()=>{
 const manifest=json('wirkungsticker/data/app/manifest.json');
 for(const key of ['news-alle','analysen-alle']){
  const seen=new Set();let prior=Infinity;
  for(let page=0;page<manifest.feeds[key].pages;page++){
   const data=json(`wirkungsticker/data/app/feeds/${key}-${page}.json`);
   assert.equal(data.revision,manifest.revision);assert.ok(data.items.length<=PAGE_SIZE);
   for(const item of data.items){assert.equal(seen.has(item.id),false);seen.add(item.id);assert.equal(item.type==='news',key==='news-alle');assert.ok(Date.parse(item.date)<=prior);prior=Date.parse(item.date);assert.match(item.url,/^\/wirkungsticker\//);assert.doesNotMatch(item.html,/href="\.\.?\//);}
  }
  assert.equal(seen.size,manifest.feeds[key].count);
 }
});
test('search partitions support German prefixes and published records in every format',()=>{
 assert.deepEqual(searchWords('Übergröße & Straße'),['ubergrosse','strasse']);
 const m=json('wirkungsticker/data/app/manifest.json');
 for(const type of ['news','analysis','book','listened','watched']){
  const r=Object.values(m.lookup).find(r=>r.type===type);assert.ok(r,type);
  const item=json(`wirkungsticker/data/app/items/${r.id}.json`);
  const token=searchWords(item.title)[0].slice(0,5);
  const bucket=json(`wirkungsticker/data/app/search/${searchBucket(token)}.json`);
  assert.ok(bucket[token].includes(r.id));
 }
});
test('new routes expose navigation, global search and separated content without loading all records',()=>{
 for(const mode of ['news','analysen','merkzettel','suche','mehr']){
  const html=read(`wirkungsticker/${mode}/index.html`);
  for(const route of ['news','analysen','merkzettel','mehr','suche'])assert.ok(html.includes(`/wirkungsticker/${route}/`));
  assert.ok((html.match(/ data-news-card /g)||[]).length<=PAGE_SIZE);
  assert.doesNotMatch(html,/data\/stories\.json|search-index\.json/);
 }
 const news=read('wirkungsticker/news/index.html');assert.doesNotMatch(news,/data-news-editorial-analysis|news-reading-guide|news-install-promo/);
 assert.ok(read('wirkungsticker/mehr/index.html').includes('data-news-notification-toggle'));
 assert.match(appNavigation('https://wirkungsoekonomie.de/wirkungsticker/analyse/beispiel/'),/analysen\/" aria-current="page"/);
 const client=read('assets/js/news-app.js');assert.match(client,/IntersectionObserver/);assert.match(client,/popstate/);assert.match(client,/WoekUserSpace\?\.getItems\('saved_items'\)/);
});
test('show permission is asset-specific and fail-closed for unknown, expired, edited or social uses',()=>{
 const media={show:'Systemfragen'};
 assert.equal(showIdentity(media).usable_asset,'/assets/img/shows/systemfragen-official.jpg');
 assert.equal(showIdentity(media,{use:'sharecard'}).usable_asset,null);
 const good=showIdentity(media);
 for(const patch of [{rights_status:'UNKNOWN'},{rights_status:'PRESS_EDITORIAL_USE_LIMITED'},{expires_at:'2020-01-01T00:00:00Z'},{asset_sha256:'0'.repeat(64)},{asset:'https://foreign.example/logo.jpg'},{allow_archive:false}])assert.equal(showIdentity(media,{shows:[{...good,...patch}]}).usable_asset,null);
 assert.doesNotMatch(renderShowIdentity({show:'MAITHINK X'}),/<img/);
 assert.match(renderShowIdentity(media),/Logo: Deutschlandradio/);
});
