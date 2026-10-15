import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {loadPersonalEditorials,validatePersonalEdition} from '../../scripts/news/personal-editorial.mjs';
import {applyApprovedEditorialRevisions,assertFinalPersonalSection} from '../../scripts/news/editorial-approved-revisions.mjs';
import {editorialAnalysisPage,combinedFeedItems} from '../../scripts/news/build.mjs';
import {feedDate} from '../../scripts/news/feed-order.mjs';

const root=process.cwd();
const catalog=loadPersonalEditorials(root);
const records=applyApprovedEditorialRevisions(catalog,root,{partial:true});
const old=catalog.find(a=>a.analysis_id==='woek-personal-ab743bb45d132866');
const revised=records.find(a=>a.analysis_id===old.analysis_id);
const fresh=records.find(a=>a.slug==='berliner-sondierungen-was-ist-eine-rote-linie-wert-c3497b');

test('normal publication cleanup retains the dated development link and immutable source hashes',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'woek-berlin-cleanup-'));
 try{
  const html=editorialAnalysisPage(revised);
  fs.mkdirSync(path.join(temp,'data/news'),{recursive:true});
  fs.writeFileSync(path.join(temp,'index.html'),html);
  const source=fs.readFileSync(path.join(root,'data/news/editorial-revisions.json'),'utf8');
  fs.writeFileSync(path.join(temp,'data/news/editorial-revisions.json'),source);
  execFileSync(process.execPath,[path.join(root,'scripts/quality/sanitize-public-editorial-residue.mjs')],{cwd:temp});
  assert.equal(fs.readFileSync(path.join(temp,'data/news/editorial-revisions.json'),'utf8'),source);
  const cleaned=fs.readFileSync(path.join(temp,'index.html'),'utf8');
  assert.ok(cleaned.includes(`/wirkungsticker/analyse/${fresh.slug}/`));
  assert.match(cleaned,/Neue Entwicklung vom 15\. Oktober 2026/);
  assert.match(cleaned,/Stand 15\.10\.2026/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});

test('Lanz revision preserves the original immutable edition, identity and chronological publication',()=>{
 assert.equal(old.content_hash,'03ce95362caa89d52ae46481123506517e67d660bd8892e6ebebbbfcd51361e4');
 assert.equal(catalog.filter(a=>a.slug===old.slug).length,1);
 for(const key of ['analysis_id','slug','published_at','title','subtype'])assert.equal(revised[key],old[key]);
 assert.deepEqual(revised.visual,old.visual);assert.deepEqual(revised.source_media,old.source_media);
 assert.equal(revised.published_at,'2026-10-08T14:59:20.090Z');
 assert.equal(revised.updated_at.slice(0,10),'2026-10-15');
 assert.equal(feedDate(revised,'analysis'),old.published_at);
 const html=editorialAnalysisPage(revised);
 assert.ok(html.includes(` · ${Math.ceil(revised.body_markdown.split(/\s+/).length/210)} Min.`));
 assert.ok(html.includes(`"datePublished":"${old.published_at}"`));
 assert.ok(html.includes(`"dateModified":"${revised.updated_at}"`));
 assert.ok(html.includes(`https://wirkungsoekonomie.de/wirkungsticker/analyse/${old.slug}/`));
 assert.match(html,/Erstveröffentlichung: 08\.10\.2026 · Redaktionell überarbeitet: 15\.10\.2026/);
 assert.ok(html.includes(`/wirkungsticker/analyse/${fresh.slug}/`));
 for(const arrow of ['Wirkpfad der politischen Grenzziehung','Wirkpfad für jüdisches Leben'])assert.ok(revised.body_markdown.includes(arrow));
});

test('new commissioned opinion is independent, discoverable and separates evidence from open outcomes',()=>{
 const stored=JSON.parse(fs.readFileSync('data/news/personal-editorials.json')).editions.find(a=>a.analysis_id===fresh.analysis_id);
 validatePersonalEdition(stored);assert.equal(fresh.subtype,'opinion_analysis');
 assert.equal(fresh.source_media,null,'not a duplicate review of the same episode');
 assert.equal(fresh.published_at.slice(0,10),'2026-10-15');
 assert.ok(fresh.body_markdown.includes(`/wirkungsticker/analyse/${old.slug}/`));
 const visible=fresh.body_markdown.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1');
 assert.ok(visible.length>=6000&&visible.length<=9000);
 for(const value of [revised,fresh]){
  assertFinalPersonalSection(value.body_markdown);
  assert.match(value.body_markdown,/Vorsondierung/);
  assert.match(value.body_markdown,/1:05:54-1:06:10/);
 }
 assert.match(fresh.body_markdown,/Experten bewerten; die Fraktion entscheidet/);
 assert.match(fresh.body_markdown,/Weder vollständige Aufgabe noch vollständige Erfüllung/);
 assert.match(fresh.body_markdown,/keine gemessene Kausalität|kein gemessener Effekt/);
 assert.match(fresh.body_markdown,/Hamas als antisemitische Terrororganisation/);
 const feed=combinedFeedItems([], [revised,fresh]);
 const previous=feed.find(a=>a.url.includes(old.slug));
 const next=feed.find(a=>a.url.includes(fresh.slug));
 assert.equal(previous.published_at,old.published_at);
 assert.equal(next.published_at,fresh.published_at);
 assert.ok(Date.parse(next.published_at)>Date.parse(previous.published_at));
 const html=editorialAnalysisPage(fresh);
 assert.match(html,/Natalie Weber/);assert.match(html,/Meinung &amp; Analyse/);
});
