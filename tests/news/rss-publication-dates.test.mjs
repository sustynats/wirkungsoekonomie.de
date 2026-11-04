import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {previousPublicationDates,publicationDate} from '../../scripts/feeds/rss-publication-dates.mjs';
const past='Tue, 13 Oct 2026 19:29:11 GMT';
const wrap=items=>'<rss><channel>'+items+'</channel></rss>';
const item=(guid='https://wirkungsoekonomie.de/bibliothek/example/',date=past)=>'<item><guid isPermaLink="true">'+guid+'</guid><pubDate>'+date+'</pubDate></item>';
test('an undated existing item retains publication time across fresh file timestamps',()=>{
 const url='https://wirkungsoekonomie.de/bibliothek/example/';const dates=previousPublicationDates(wrap(item(url)));assert.equal(publicationDate([],dates.get(url),new Date('2027-01-01')).toUTCString(),past);
});
test('explicit dated metadata still governs intentional dated editions',()=>{assert.equal(publicationDate(['invalid','2026-10-22'],new Date(past),new Date('2027-01-01')).toISOString(),'2026-10-22T00:00:00.000Z');});
test('a genuinely new undated item uses its first file timestamp',()=>{const d=new Date('2026-11-03T12:00:00Z');assert.equal(publicationDate([],undefined,d).toISOString(),d.toISOString());});
test('XML-escaped and CDATA GUIDs preserve exact query identities',()=>{
 const dates=previousPublicationDates(wrap(item('https://example.test/?a=1&amp;b=2')+item('<![CDATA[https://example.test/other/?a=1&b=2]]>')));assert.equal(dates.size,2);assert.ok(dates.has('https://example.test/?a=1&b=2'));assert.ok(dates.has('https://example.test/other/?a=1&b=2'));
});
test('duplicate identities and malformed historical dates fail closed',()=>{for(const xml of [wrap(item()+item()),wrap(item('id','invalid')),wrap('<item><pubDate>'+past+'</pubDate></item>')])assert.throws(()=>previousPublicationDates(xml));});
test('DTD/entity declarations and invalid documents are not accepted',()=>{for(const x of ['', 'not xml','<!DOCTYPE rss><rss><channel></channel></rss>'])assert.throws(()=>previousPublicationDates(x));});
test('empty feed and immutable date copies work without inventing history',()=>{assert.equal(previousPublicationDates(wrap('')).size,0);const old=new Date(past),copy=publicationDate([],old,new Date());copy.setUTCFullYear(2000);assert.equal(old.toUTCString(),past);assert.throws(()=>publicationDate([],undefined,new Date('invalid')));});
test('the real generator does not republish undated pages after touching or rebuilding them',t=>{
 const root=fs.mkdtempSync(path.join(tmpdir(),'woek-rss-date-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'bibliothek/example'),{recursive:true});fs.mkdirSync(path.join(root,'feeds'));
 const page=path.join(root,'bibliothek/example/index.html');fs.writeFileSync(page,'<html><head><title>Example</title><meta name="description" content="Description"><link rel="canonical" href="https://wirkungsoekonomie.de/bibliothek/example/"></head><body><main>Example</main></body></html>');
 fs.writeFileSync(path.join(root,'feeds/bibliothek.xml'),wrap(item()));
 const script=fileURLToPath(new URL('../../scripts/feeds/build-rss-feeds.mjs',import.meta.url));
 for(const date of ['2026-11-03','2027-01-01']){
  fs.utimesSync(page,new Date(date),new Date(date));const r=spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8',timeout:15000});assert.equal(r.status,0,r.stderr);
  assert.equal(previousPublicationDates(fs.readFileSync(path.join(root,'feeds/bibliothek.xml'),'utf8')).get('https://wirkungsoekonomie.de/bibliothek/example/').toUTCString(),past);
 }
});

test('truncated history cannot silently turn existing items into new ones', () => {
 for (const xml of [wrap(item()).replace('</item>', ''),wrap(item()).replace('</rss>', ''),wrap(item()).replace('</channel>', ''),'<rss><channel><channel></channel></channel></rss>']) assert.throws(() => previousPublicationDates(xml));
});
test('CDATA entities remain literal while malformed XML entity fields fail closed', () => {
 const guid='https://example.test/?literal=&amp;';assert.ok(previousPublicationDates(wrap(item('<![CDATA['+guid+']]>'))).has(guid));
 for(const guid of ['https://example.test/?bad=&unknown;','https://example.test/&#0;','https://example.test/&#xd800;']) assert.throws(()=>previousPublicationDates(wrap(item(guid))));
});

test('restoring dates leaves the existing 120-item selection unchanged', t => {
 const root=fs.mkdtempSync(path.join(tmpdir(),'woek-rss-selection-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'feeds'));
 const expected=[];
 for(let i=0;i<121;i++){
  const slug='item-'+String(i).padStart(3,'0'),url='https://wirkungsoekonomie.de/bibliothek/'+slug+'/';
  const dir=path.join(root,'bibliothek',slug);fs.mkdirSync(dir,{recursive:true});
  const page=path.join(dir,'index.html');fs.writeFileSync(page,'<html><head><title>'+slug+'</title><link rel="canonical" href="'+url+'"></head><body><main>'+slug+'</main></body></html>');
  fs.utimesSync(page,new Date('2026-11-03'),new Date('2026-11-03'));if(i<120)expected.push(url);
 }
 fs.writeFileSync(path.join(root,'feeds/bibliothek.xml'),wrap(expected.map(url=>item(url)).join('')));
 const script=fileURLToPath(new URL('../../scripts/feeds/build-rss-feeds.mjs',import.meta.url));
 const result=spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8',timeout:15000});assert.equal(result.status,0,result.stderr);
 const dates=previousPublicationDates(fs.readFileSync(path.join(root,'feeds/bibliothek.xml'),'utf8'));
 assert.deepEqual([...dates.keys()],expected);assert.ok([...dates.values()].every(date=>date.toUTCString()===past));
});
