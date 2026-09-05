import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {uniqueContentIds,normalizePublicContent} from '../../scripts/quality/normalize-public-content.mjs';

test('duplicate headings retain old links, update self-citations and reserve existing IDs',()=>{
  const result=uniqueContentIds('<h2 id="a">One</h2><h2 id="a"><a href="#a">Two</a></h2><p id="a--2">Existing</p><script>"<p id=\"a\">"</script>');
  assert.match(result.html,/<h2 id="a--3"><a href="#a--3">/);
  assert.match(result.html,/<p id="a--2">Existing/);
  assert.match(result.html,/<script>"<p id="a">"<\/script>/);
  assert.equal(result.changes.length,1);
});

test('interactive control contracts are left for explicit review',()=>{
  assert.equal(uniqueContentIds('<input id="x"><input id="x">').changes.length,0);
});

test('data attributes are not document IDs and survive normalization',()=>{
  const input='<span data-sdg-id="sdgplus-demokratie"></span><section id="sdgplus-demokratie">Content</section><div data-id="x" id="x"></div><h2 id="x">Heading</h2>';
  const result=uniqueContentIds(input);
  assert.match(result.html,/<section id="sdgplus-demokratie">/);
  assert.match(result.html,/<div data-id="x" id="x">/);
  assert.match(result.html,/<h2 id="x--2">/);
  assert.equal(result.changes.length,1);
});

test('publication normalization preserves routes, self-linked fragments and distinct documents',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'woek-normalize-'));
  const put=(rel,text)=>{const file=path.join(root,rel);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);};
  const html=(route,body)=>`<html><head><link rel="canonical" href="https://wirkungsoekonomie.de${route}"></head><body><main>${body}</main></body></html>`;
  const repeated=Array.from({length:110},(_,i)=>'Wort'+i).join(' ');
  try {
    put('kommunaler-wirkungsindex.html',html('/kommunaler-wirkungsindex.html','<h1>Index</h1><a href="#pruefung">Weiter</a><h2 id="prufung">Prüfung</h2><a href="#ohne-kennung">Abschnitt</a><h2>Ohne Kennung</h2>'));
    put('bibliothek/a/index.html',html('/bibliothek/a/','<h1>Werk</h1><p>'+repeated+'</p>'));
    put('bibliothek/b/index.html',html('/bibliothek/b/','<h1>Werk</h1><p>'+repeated+'</p>'));
    put('bibliothek/c/index.html',html('/bibliothek/c/','<h1>Werk</h1><p>'+repeated+' Ergänzung</p>'));
    put('assets/search/search-index.json',JSON.stringify(['a','b','c'].map(x=>({url:`/bibliothek/${x}/`,title:x}))));
    put('sitemap.xml','<urlset>'+['a','b','c'].map(x=>`<url><loc>https://wirkungsoekonomie.de/bibliothek/${x}/</loc></url>`).join('')+'</urlset>');
    const report=normalizePublicContent(root,{aliases:{},glossary:[],reportFile:path.join(root,'report.json')});
    assert.equal(report.fragmentAliases[0].route,'/kommunaler-wirkungsindex.html');
    assert.match(fs.readFileSync(path.join(root,'kommunaler-wirkungsindex.html'),'utf8'),/<span id="pruefung"/);
    assert.match(fs.readFileSync(path.join(root,'kommunaler-wirkungsindex.html'),'utf8'),/<h2 id="ohne-kennung">Ohne Kennung/);
    assert.equal(report.duplicates.length,1);
    assert.equal(report.duplicates[0].canonical,'/bibliothek/a/');
    assert.match(fs.readFileSync(path.join(root,'bibliothek/b/index.html'),'utf8'),/noindex, follow/);
    assert.doesNotMatch(fs.readFileSync(path.join(root,'bibliothek/c/index.html'),'utf8'),/noindex/);
    assert.equal(JSON.parse(fs.readFileSync(path.join(root,'assets/search/search-index.json'),'utf8')).length,2);
    const again=normalizePublicContent(root,{aliases:{},glossary:[],reportFile:path.join(root,'report.json')});
    assert.equal(again.fragmentAliases.length+again.duplicates.length+again.uniqueIds.length,0);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});
