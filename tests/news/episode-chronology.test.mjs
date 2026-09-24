import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {originalEpisodeDate, episodeDateLabel, feedDate, mixedFeedItems, assertChronologicalFeedHtml} from '../../scripts/news/feed-order.mjs';
import {buildAppPages} from '../../scripts/news/app-pages.mjs';
import {findSearchIds} from '../../assets/js/ticker-search.js';
import {editorialCard, combinedFeedItems, editorialAnalysisPage} from '../../scripts/news/build.mjs';
import {loadPersonalEditorials} from '../../scripts/news/personal-editorial.mjs';

const episode = (date, patch = {}) => ({analysis_id:`episode-${date}`,slug:`episode-${date}`,format:'approved_editorial',subtype:'listened',
  title:'Lanz + Precht',subtitle:'Einordnung',published_at:'2026-09-20T08:00:00Z',updated_at:'2026-09-24T09:00:00Z',
  source_media:{show:'Lanz + Precht',episode_title:'Die Folge',original_release_date:date},...patch});

test('episode dates accept legacy German and ISO dates, with timestamps on the Berlin calendar day', () => {
  for (const [raw, expected] of [['11.09.2026','2026-09-11'],['4.9.2026','2026-09-04'],['2026-09-18','2026-09-18'],
    ['2026-09-03T23:01:00.000Z','2026-09-04'],['2026-01-01T23:30:00Z','2026-01-02'],
    ['2026-09-18T00:30:00+02:00','2026-09-18']]) {
    assert.equal(originalEpisodeDate(episode(raw)),expected);
    assert.equal(feedDate(episode(raw),'analysis'),`${expected}T00:00:00.000Z`);
  }
  assert.equal(episodeDateLabel(episode('2026-09-03T23:01:00.000Z')),'Folge vom 04.09.2026');
  assert.equal(episodeDateLabel(episode('2026-09-22',{subtype:'watched'})),'Sendung vom 22.09.2026');
});

test('unknown or invalid original dates fall back to first publication, never a correction date', () => {
  for (const raw of ['',undefined,'unbekannt','31.02.2026','2026-02-30','2026-13-01','2026-09-18T09:00:00','09/18/2026']) {
    const value = episode(raw);
    assert.equal(originalEpisodeDate(value),'');
    assert.equal(feedDate(value,'analysis'),'2026-09-20T08:00:00.000Z');
    assert.equal(episodeDateLabel(value),'Datum der Originalfolge nicht angegeben');
  }
  assert.equal(feedDate(episode('',{published_at:undefined}),'analysis'),'');
});

test('Lanz + Precht remains #263, #262, #261 even after a late import or correction of #261', () => {
  const values = [episode('2026-09-03T23:01:00.000Z'),episode('11.09.2026'),episode('18.09.2026',{updated_at:'2026-09-18T05:18:47Z'})];
  const before = JSON.stringify(values);
  const ordered = mixedFeedItems([],values).map(x=>x.value);
  assert.deepEqual(ordered,[values[2],values[1],values[0]]);
  assert.deepEqual(mixedFeedItems([],values.toReversed()).map(x=>x.value),ordered);
  assert.equal(JSON.stringify(values),before);
  const feed = combinedFeedItems([],values);
  assert.deepEqual(feed.map(x=>x.original_episode_date),['2026-09-18','2026-09-11','2026-09-04']);
  assert.equal(feed[2].published_at,values[0].published_at);
  assert.equal(feed[2].updated_at,values[0].updated_at,'feed publication/correction metadata is not falsified');
});

test('ordinary opinions and books keep their existing publication/update ordering', () => {
  for (const subtype of ['opinion_analysis','book_review',undefined]) {
    const value=episode('2026-01-01',{subtype});
    assert.equal(originalEpisodeDate(value),'');
    assert.equal(episodeDateLabel(value),'');
    assert.equal(feedDate(value,'analysis'),'2026-09-24T09:00:00.000Z');
  }
});

test('all published media cards and detail origins distinguish episode date from review publication without mutating content', () => {
  const media = loadPersonalEditorials(process.cwd()).filter(a=>['listened','watched'].includes(a.subtype));
  assert.ok(media.length>20);
  const before=JSON.stringify(media);
  for (const value of media) {
    const card=editorialCard(value,null,1), page=editorialAnalysisPage(value);
    assert.ok(card.includes(episodeDateLabel(value)),value.slug);
    assert.match(card,/news-editorial-card__episode/);
    assert.match(card,/Einordnung veröffentlicht/);
    assert.ok(page.includes(episodeDateLabel(value)),value.slug);
    assert.ok(page.includes(`"datePublished":"${value.published_at}"`));
  }
  assert.equal(JSON.stringify(media),before);
});

test('home, initial HTML, paginated media feeds and filtered search share episode chronology', async () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'woek-episode-order-'));
  try {
    const values=Array.from({length:25},(_,i)=>episode(`2026-09-${String(i+1).padStart(2,'0')}`,{subtype:i%2?'watched':'listened'}));
    const write=(file,body)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);};
    buildAppPages({root,stories:[],analyses:values,storiesById:new Map(),storyCard:()=>'',editorialCard,
      pageShell:({body})=>body,write,updatedAt:'2026-09-24T12:00:00Z'});
    const read=file=>JSON.parse(gunzipSync(fs.readFileSync(path.join(root,'wirkungsticker/data/app',`${file}.json.gz`))));
    const manifest=read('manifest');
    for (const type of ['alle','listened','watched']) {
      const key=`analysen-${type}`,items=Array.from({length:manifest.feeds[key].pages},(_,i)=>read(`feeds/${key}-${i}`).items).flat();
      const expected=values.filter(v=>type==='alle'||v.subtype===type).toReversed().map(v=>v.slug);
      assert.deepEqual(items.map(x=>x.url.split('/').at(-2)),expected);
      assertChronologicalFeedHtml(items.map(x=>x.html).join(''));
      const lookup=new Map(Object.values(manifest.lookup).map(r=>[r.id,r]));
      const ids=await findSearchIds({term:'',lookup,type,topic:'alle',mode:'analysen',sort:'neueste',loadBucket:()=>assert.fail('no search terms')});
      assert.deepEqual(ids,items.map(x=>x.id));
    }
    const initial=fs.readFileSync(path.join(root,'wirkungsticker/analysen/index.html'),'utf8');
    assertChronologicalFeedHtml(initial);
    assert.match(initial,/Folge vom 25\.09\.2026/);
    const home=fs.readFileSync(path.join(root,'wirkungsticker/index.html'),'utf8');
    assert.ok(home.indexOf('episode-2026-09-25')<home.indexOf('episode-2026-09-24'));
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
