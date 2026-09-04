import test from "node:test";
import assert from "node:assert/strict";
import { publishGitUpdate } from "../../scripts/news/publish-git.mjs";
test("concurrent main advances are rebased before each bounded push retry", async () => {
  const calls=[];let pushes=0;
  const result=await publishGitUpdate({sleep:async()=>{},run:async args=>{calls.push(args);if(args[0]==='push'&&++pushes<3)throw new Error('fetch first');}});
  assert.equal(result.attempts,3);
  assert.deepEqual(calls.map(a=>a[0]),['pull','push','pull','push','pull','push']);
  assert.ok(calls.every(a=>!a.some(v=>v.includes('force'))));
});
test("rebase conflicts stop without choosing a side or pushing", async () => {
  const calls=[];
  await assert.rejects(publishGitUpdate({run:async args=>{calls.push(args);throw new Error('conflict');}}),/conflict/);
  assert.equal(calls.length,1);assert.equal(calls[0][0],'pull');
});
test("persistent push failures stop after three attempts", async () => {
  let pushes=0;
  await assert.rejects(publishGitUpdate({sleep:async()=>{},run:async args=>{if(args[0]==='push'){pushes++;throw new Error('unavailable');}}}),/unavailable/);
  assert.equal(pushes,3);
});
