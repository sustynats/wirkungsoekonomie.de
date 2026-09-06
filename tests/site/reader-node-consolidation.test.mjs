import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {consolidateEmptyReaderNodes} from '../../scripts/library/consolidate-empty-reader-nodes.mjs';
test('heading-only nodes skip to real text, keep old URLs and leave substantive pages intact',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'reader-nodes-'));
 const book='bibliothek/eintraege/book/lesen/';
 const write=(route,body)=>{const p=path.join(root,route,'index.html');fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,`<html><head><title>Reader</title></head><body><main>${body}</main></body></html>`);};
 try{
  write(book,'<h1>Übersicht</h1><a href="00/">Teil A</a><a href="01/">Einführung</a><a href="02/">Text</a>');
  for(const ch of ['00/','01/'])write(book+ch,'<h1 id="kapitel">Teil A</h1><div class="reader-body"><p>Inhalt wird ergänzt.</p></div>');
  write(book+'02/','<h1 id="kapitel">Fachtext</h1><div class="reader-body"><p>Ein vollständiger Absatz. Inhalt wird ergänzt ist hier nur ein Zitat.</p></div>');
  const before=fs.readFileSync(path.join(root,book,'02/index.html'),'utf8');
  const results=consolidateEmptyReaderNodes(root);assert.equal(results.length,2);assert.ok(results.every(x=>x.to==='/'+book+'02/'));
  assert.match(fs.readFileSync(path.join(root,book,'00/index.html'),'utf8'),/noindex, follow/);
  assert.equal(fs.readFileSync(path.join(root,book,'02/index.html'),'utf8'),before);
  assert.doesNotMatch(fs.readFileSync(path.join(root,book,'index.html'),'utf8'),/href="0[01]\//);
  assert.deepEqual(consolidateEmptyReaderNodes(root),results);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
