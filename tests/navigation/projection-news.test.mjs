import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {capture,restore} from '../../scripts/quality/scope-state-projection-news.mjs';
function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'woek-projection-news-'));
  fs.mkdirSync(path.join(root,'wirkungsticker'),{recursive:true});fs.mkdirSync(path.join(root,'public/data'),{recursive:true});
  fs.writeFileSync(path.join(root,'wirkungsticker/index.html'),'<main>Schaden 60 EUR</main>');
  const file=path.join(root,'public/data/woek-search-meta.json'),snapshot=path.join(root,'snapshot.json');
  fs.writeFileSync(file,JSON.stringify({entries:{'/wirkungsticker/':{contentHash:'main-news'},'/methodik/':{contentHash:'old-core'}}}));
  return {root,file,snapshot};
}
test('scoped cache preservation retains new core projections and untouched Main news',()=>{
  const {root,file,snapshot}=fixture();try{
    capture(root,snapshot);
    fs.writeFileSync(file,JSON.stringify({entries:{'/wirkungsticker/':{contentHash:'unrelated-recompute'},'/methodik/':{contentHash:'new-core'}}}));
    restore(root,snapshot);const d=JSON.parse(fs.readFileSync(file));
    assert.equal(d.entries['/wirkungsticker/'].contentHash,'main-news');assert.equal(d.entries['/methodik/'].contentHash,'new-core');
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('a changed news fact fails before any cache row can be restored',()=>{
  const {root,file,snapshot}=fixture();try{
    capture(root,snapshot);fs.writeFileSync(path.join(root,'wirkungsticker/index.html'),'<main>Schaden 6 EUR</main>');
    const before=fs.readFileSync(file);assert.throws(()=>restore(root,snapshot),/source mutation detected/);assert.deepEqual(fs.readFileSync(file),before);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
