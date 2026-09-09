import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { createReleaseStore, publicTitleImage } from "../../scripts/news/title-image/pipeline.mjs";

const tag = "wirkungsticker-media-2026-09";
const full = Array.from({length:1000},(_,i)=>({name:`old-${i}.png`}));
const fileName = "wt-1111111111111111-2222222222222222-og.png";

test("full monthly media release continues without replacing or deleting old assets", async () => {
  const calls=[]; const archives=new Map([[tag,full]]);
  const publish=createReleaseStore({run:async args=>{
    calls.push(args);
    const [,action,selected]=args;
    if(action==='view'){if(!archives.has(selected))throw new Error('release not found');return JSON.stringify({assets:archives.get(selected)});}
    if(action==='create'){archives.set(selected,[]);return '';}
    if(action==='upload')return '';
    throw new Error('unexpected write');
  }});
  const result=await publish([`/tmp/${fileName}`],{tag});
  assert.ok(result[fileName].includes(`${tag}-part-2/`));
  assert.equal(calls.filter(c=>c[1]==='create').length,1);
  assert.equal(calls.find(c=>c[1]==='upload')[2],`${tag}-part-2`);
  assert.ok(!calls.flat().some(c=>['--clobber','delete'].includes(c)));
  assert.equal(archives.get(tag).length,1000);
  assert.ok(publicTitleImage({mode:'impact_card',og:{url:result[fileName]}})?.og);
  assert.equal(publicTitleImage({mode:'impact_card',og:{url:result[fileName].replace('part-2','part-01')}}),null);
  assert.equal(publicTitleImage({mode:'impact_card',og:{url:result[fileName].replace('sustynats','attacker')}}),null);
});

test("capacity race retries in the next shard but unrelated failures remain failures", async () => {
  const uploads=[];
  const publish=createReleaseStore({run:async args=>{
    if(args[1]==='view')return JSON.stringify({assets:[]});
    if(args[1]==='upload'){uploads.push(args[2]);if(args[2]===tag)throw new Error('file_count limited to 1000 assets per release');return '';}
    throw new Error('unexpected');
  }});
  const result=await publish([`/tmp/${fileName}`],{tag});
  assert.deepEqual(uploads,[tag,`${tag}-part-2`]);
  assert.ok(result[fileName].includes('-part-2/'));
  const denied=createReleaseStore({run:async args=>{if(args[1]==='view')return '{"assets":[]}';throw new Error('permission denied');}});
  await assert.rejects(()=>denied([`/tmp/${fileName}`],{tag}),/permission denied/);
});

test("existing immutable media is reused byte-for-byte; a conflict is not bypassed by sharding", async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'woek-release-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const file=path.join(dir,fileName);fs.writeFileSync(file,'checked bytes');
  let digest=crypto.createHash('sha256').update('checked bytes').digest('hex');let writes=0;
  const publish=createReleaseStore({run:async args=>{if(args[1]==='view')return JSON.stringify({assets:[{name:fileName,size:13,digest:`sha256:${digest}`} ]});writes++;return '';}});
  const result=await publish([file],{tag});assert.ok(result[fileName].includes(`${tag}/`));assert.equal(writes,0);
  digest='0'.repeat(64);
  await assert.rejects(()=>publish([file],{tag}),/IMMUTABLE_ASSET_CONFLICT/);assert.equal(writes,0);
});
