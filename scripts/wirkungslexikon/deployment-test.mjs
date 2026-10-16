import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawnSync} from 'node:child_process';import {ROOT} from './model.mjs';
test('Deployment guard starts with the exact minimal CI checkout and no model dependencies',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wl-minimal-deploy-'));
 try{const target=path.join(dir,'scripts/wirkungslexikon/deployment.mjs');fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(ROOT,'scripts/wirkungslexikon/deployment.mjs'),target);const r=spawnSync(process.execPath,[target,'invalid-command'],{encoding:'utf8'});assert.equal(r.status,1);assert(r.stderr.includes('Aufruf: deployment.mjs'));assert(!r.stderr.includes('ERR_MODULE_NOT_FOUND'));}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
