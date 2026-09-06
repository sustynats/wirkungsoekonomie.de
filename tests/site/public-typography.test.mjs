import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {normalizePublicationTypography,hasNonstandardDash,isFrozenPublicationSource} from '../../scripts/lib/public-typography.mjs';
test('normalizes visible, encoded and typographic hyphens without changing numbers or markup',()=>{
  const input='<p title="Wirkung\u2014Beispiel">10\u201320 kg &ndash; A &mdash; B &#8212; C &#x2011; D: 50 \u2212 10 = 40</p>';
  const result='<p title="Wirkung-Beispiel">10-20 kg - A - B - C - D: 50 - 10 = 40</p>';
  assert.equal(normalizePublicationTypography(input),result);
  assert.equal(normalizePublicationTypography(result),result);
  assert.equal(hasNonstandardDash(result),false);
});

test('news source protection is bounded to its directory on both path formats',()=>{
  assert.equal(isFrozenPublicationSource('data/news/editorial-analyses.json'),true);
  assert.equal(isFrozenPublicationSource('data\\news\\snapshots\\source.json'),true);
  assert.equal(isFrozenPublicationSource('data/newsroom/index.html'),false);
  assert.equal(isFrozenPublicationSource('wirkungsticker/data/stories.json'),false);
});

test('source normalizers preserve reviewed news bytes and hashes; public projections still normalize',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'woek-news-typography-'));
  const script=name=>path.resolve(import.meta.dirname,'../../scripts/quality',name);
  const put=(relative,text)=>{const file=path.join(root,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);return file;};
  const summary='Gepruefter Zeitraum 2026\u20132028 \u2014 unveraenderte Quelle.';
  const content_hash=crypto.createHash('sha256').update(summary).digest('hex');
  const source=JSON.stringify({source_snapshot:[{summary,editorial_review:{status:'approved',content_hash}}]},null,2)+'\n';
  const publicHtml='<main><h1>Zeitraum 2026\u20132028</h1><p>Pruefung \u2014 Einordnung &ndash; Quelle.</p></main>';
  try {
    execFileSync('git',['init','--quiet',root]);
    const sourceFile=put('data/news/editorial-analyses.json',source);
    const nestedSource=put('data/news/snapshots/source.md',summary+'\n');
    const page=put('wirkungsticker/index.html',publicHtml);
    const metadata=put('assets/data/article.json',JSON.stringify({title:'2026\u20132028'}));
    execFileSync('git',['add','.'],{cwd:root});
    execFileSync(process.execPath,[script('check-no-em-dash.mjs'),'--fix','data/news'],{cwd:root});
    execFileSync(process.execPath,[script('normalize-publication-typography.mjs'),root,'--tracked'],{cwd:root});
    execFileSync(process.execPath,[script('normalize-publication-typography.mjs'),root,'--tracked','--check'],{cwd:root});
    execFileSync(process.execPath,[script('check-no-em-dash.mjs'),'data/news'],{cwd:root});
    assert.equal(fs.readFileSync(sourceFile,'utf8'),source);
    assert.equal(fs.readFileSync(nestedSource,'utf8'),summary+'\n');
    const reviewed=JSON.parse(fs.readFileSync(sourceFile,'utf8')).source_snapshot[0];
    assert.equal(crypto.createHash('sha256').update(reviewed.summary).digest('hex'),reviewed.editorial_review.content_hash);
    assert.equal(fs.readFileSync(page,'utf8'),'<main><h1>Zeitraum 2026-2028</h1><p>Pruefung - Einordnung - Quelle.</p></main>');
    assert.deepEqual(JSON.parse(fs.readFileSync(metadata,'utf8')),{title:'2026-2028'});
    const artifact=path.join(root,'_site');
    const projection=put('_site/wirkungsticker/index.html',publicHtml);
    execFileSync(process.execPath,[script('normalize-publication-typography.mjs'),artifact],{cwd:root});
    execFileSync(process.execPath,[script('normalize-publication-typography.mjs'),artifact,'--check'],{cwd:root});
    assert.equal(fs.readFileSync(projection,'utf8'),fs.readFileSync(page,'utf8'));
    assert.equal(fs.readFileSync(sourceFile,'utf8'),source);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});
