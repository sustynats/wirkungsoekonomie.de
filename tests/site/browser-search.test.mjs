import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {gunzipSync, gzipSync} from 'node:zlib';
import {buildBrowserSearchIndex} from '../../scripts/search/build-browser-search-index.mjs';
import {loadBrowserSearchIndex} from '../../assets/js/search-index-loader.js';

const entries = [{id:'example',title:'T-SROI',url:'/werkzeuge/t-sroi/',description:'Kausaler, diskontierter Nettonutzen',body:'Belegbare Transformation',aliases:['SROI'],semanticTerms:['Attribution'],priority:20}];
const version = '0123456789abcdef';
const manifest = {schemaVersion:1,version,entries:1,json:'search-index.json',gzip:`browser-index-${version}.json.gz`};

test('build preserves search routes and meaningful fields in a reproducible gzip, without another raw index', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'woek-search-test-'));
  try {
    const directory=path.join(root,'assets/search'); fs.mkdirSync(directory,{recursive:true});
    const original=JSON.stringify(entries); fs.writeFileSync(path.join(directory,'search-index.json'),original);
    fs.writeFileSync(path.join(directory,'editorial-notes.json'),'keep');
    const first=buildBrowserSearchIndex(root), second=buildBrowserSearchIndex(root);
    assert.deepEqual(first,second);
    const decoded=JSON.parse(gunzipSync(fs.readFileSync(path.join(directory,first.gzip))));
    assert.deepEqual(decoded,entries);
    assert.equal(fs.readFileSync(path.join(directory,'search-index.json'),'utf8'),original);
    assert.equal(fs.readFileSync(path.join(directory,'editorial-notes.json'),'utf8'),'keep');
    assert.equal(fs.existsSync(path.join(directory,first.gzip.replace(/\.gz$/,''))),false);
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});

test('shared loader handles gzip, caching, interrupted data and older releases', async t => {
  const realFetch=globalThis.fetch;
  try {
    await t.test('one compressed request is shared by concurrent consumers',async()=>{
      const requests=[];
      globalThis.fetch=async url=>{requests.push(String(url)); return new Response(String(url).endsWith('manifest.json')?JSON.stringify(manifest):gzipSync(JSON.stringify(entries)));};
      const [one,two]=await Promise.all([loadBrowserSearchIndex('https://example.test/compressed/'),loadBrowserSearchIndex('https://example.test/compressed/')]);
      assert.strictEqual(one,two); assert.deepEqual(one,entries); assert.equal(requests.length,2);
      assert.ok(requests[1].endsWith('.json.gz'));
    });
    await t.test('damaged gzip falls back to the existing versioned JSON',async()=>{
      const requests=[];
      globalThis.fetch=async url=>{requests.push(String(url));return new Response(String(url).endsWith('manifest.json')?JSON.stringify(manifest):String(url).endsWith('.gz')?'truncated':JSON.stringify(entries));};
      assert.deepEqual(await loadBrowserSearchIndex('https://example.test/fallback/'),entries);
      assert.ok(requests.at(-1).endsWith(`search-index.json?v=${version}`));
    });
    await t.test('a missing manifest supports older static releases',async()=>{
      globalThis.fetch=async url=>String(url).endsWith('manifest.json')?new Response('missing',{status:404}):new Response(JSON.stringify(entries));
      assert.deepEqual(await loadBrowserSearchIndex('https://example.test/legacy/'),entries);
    });
    await t.test('an incomplete index rejects and a new attempt can recover',async()=>{
      let incomplete=true;
      globalThis.fetch=async url=>new Response(String(url).endsWith('manifest.json')?JSON.stringify({...manifest,entries:incomplete?2:1}):gzipSync(JSON.stringify(entries)));
      await assert.rejects(loadBrowserSearchIndex('https://example.test/retry/'),/Incomplete/);
      incomplete=false;
      assert.deepEqual(await loadBrowserSearchIndex('https://example.test/retry/'),entries);
    });
    await t.test('a manifest cannot redirect the loader to an unrelated destination',async()=>{
      let count=0;
      globalThis.fetch=async()=>{count++;return new Response(JSON.stringify({...manifest,json:'https://other.test/private'}));};
      await assert.rejects(loadBrowserSearchIndex('https://example.test/invalid/'),/Invalid/);
      assert.equal(count,1);
    });
  } finally {globalThis.fetch=realFetch;}
});
