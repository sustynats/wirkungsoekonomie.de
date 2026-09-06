import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {hasPublicationAccess} from '../../scripts/lib/publication-access.mjs';
test('download access follows the publication entry and rejects dead links',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'publication-access-'));
 try{
  fs.mkdirSync(path.join(root,'entry'));fs.writeFileSync(path.join(root,'entry/index.html'),'<a href="/source.pdf">Historische PDF öffnen</a>');
  const start='<a href="/entry/">Herunterladen</a>';
  assert.equal(hasPublicationAccess(start,'/reader/',root),false);
  fs.writeFileSync(path.join(root,'source.pdf'),'fixture');
  assert.equal(hasPublicationAccess(start,'/reader/',root),true);
  assert.equal(hasPublicationAccess('Originaldatei öffnen','/reader/',root),false);
 }finally{fs.rmSync(root,{recursive:true});}
});
