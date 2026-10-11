import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {test} from 'node:test';
const script=path.resolve('scripts/quality/normalize-publication-typography.mjs');

test('scoped projection preserves news source while full artifact typography remains mandatory',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'woek-projection-typography-'));
  try{
    execFileSync('git',['init','-q',root]);
    for(const area of ['wirkungsticker','verstehen']){fs.mkdirSync(path.join(root,area));fs.writeFileSync(path.join(root,area,'index.html'),'<p>Wert − 3</p>');}
    execFileSync('git',['add','.'],{cwd:root});
    execFileSync(process.execPath,[script,root,'--tracked','--exclude-source-prefix=wirkungsticker/']);
    assert.match(fs.readFileSync(path.join(root,'wirkungsticker/index.html'),'utf8'),/−/);
    assert.doesNotMatch(fs.readFileSync(path.join(root,'verstehen/index.html'),'utf8'),/−/);
    assert.notEqual(spawnSync(process.execPath,[script,root,'--check']).status,0);
    execFileSync(process.execPath,[script,root]);
    assert.equal(spawnSync(process.execPath,[script,root,'--check']).status,0);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('neither artifact mode nor release check accepts projection exclusions',()=>{
  for(const args of [['--exclude-source-prefix=wirkungsticker/'],['--tracked','--check','--exclude-source-prefix=wirkungsticker/']]){
    const result=spawnSync(process.execPath,[script,...args],{encoding:'utf8'});
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/never for artifact\/check mode/);
  }
});
