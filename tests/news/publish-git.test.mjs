import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { mergeDisjointStoryStores, publishGitUpdate, regeneratablePublicationPath } from "../../scripts/news/publish-git.mjs";
const store = (stories, minute = 0) => ({ schema_version: "1.1", updated_at: `2026-09-06T01:${String(minute).padStart(2, "0")}:00Z`, stories });
test("disjoint story edits preserve both complete records and version histories", () => {
  const a = { story_id: "a", versions: [{ v: 1 }], sources: ["original"] }, b = { story_id: "b", title: "before" };
  const edited = { ...a, versions: [...a.versions, { v: 2 }], sources: ["original", "corrected"] };
  const result = mergeDisjointStoryStores(store([a, b]), store([edited, b, { story_id: "editor-new" }], 2), store([a, { ...b, title: "worker update" }, { story_id: "worker-new" }], 3));
  assert.deepEqual(result.stories.find(s => s.story_id === "a"), edited);
  assert.equal(result.stories.find(s => s.story_id === "b").title, "worker update");
  assert.deepEqual(result.stories.map(s => s.story_id), ["a", "b", "editor-new", "worker-new"]);
  assert.equal(result.updated_at, store([], 3).updated_at);
});
test("overlapping changes and deletion versus correction never choose a newer timestamp", () => {
  const before = { story_id: "a", title: "before" };
  for (const left of [[{ ...before, title: "editor" }], []]) {
    assert.throws(() => mergeDisjointStoryStores(store([before]), store(left, 1), store([{ ...before, title: "worker" }], 4)), /STORY_RECORD_OVERLAP/);
  }
  assert.throws(() => mergeDisjointStoryStores(store([]), store([{ story_id: "a", title: "x" }]), store([{ story_id: "a", title: "y" }])), /STORY_RECORD_OVERLAP/);
});
test("story merge rejects duplicate identities, malformed stores and divergent schemas", () => {
  const valid = store([{ story_id: "a" }]);
  assert.throws(() => mergeDisjointStoryStores(valid, store([{ story_id: "a" }, { story_id: "a" }]), valid), /STORY_IDENTITIES_INVALID/);
  assert.throws(() => mergeDisjointStoryStores(valid, { news: 1 }, valid), /STORY_STORE_INVALID/);
  assert.throws(() => mergeDisjointStoryStores(valid, { ...valid, schema_version: "2" }, { ...valid, schema_version: "3" }), /STORY_SCHEMA_CONFLICT/);
  assert.throws(() => mergeDisjointStoryStores(valid, { ...valid, schema_version: "2" }, valid), /STORY_SCHEMA_CONFLICT/);
});
test("concurrent main advances are rebased before each bounded push retry", async () => {
  const calls=[];let pushes=0;
  const result=await publishGitUpdate({sleep:async()=>{},run:async args=>{calls.push(args);if(args[0]==='push'&&++pushes<3)throw new Error('fetch first');return 'unchanged';}});
  assert.equal(result.attempts,3);
  assert.deepEqual(calls.filter(a=>['pull','push'].includes(a[0])).map(a=>a[0]),['pull','push','pull','push','pull','push']);
  assert.ok(calls.every(a=>!a.some(v=>v.includes('force'))));
});
test("canonical conflicts abort this rebase without overwriting either version", async () => {
  const calls=[];
  await assert.rejects(publishGitUpdate({run:async args=>{calls.push(args);if(args[0]==='pull')throw new Error('conflict');return args[0]==='diff'?'data/news/stories.json\0':'';}}),/PUBLISH_CANONICAL_CONFLICT/);
  assert.ok(calls.some(a=>a.join(' ')==='rebase --abort'));
  assert.ok(!calls.some(a=>['push','restore'].includes(a[0])));
});
test("persistent push failures stop after three attempts", async () => {
  let pushes=0;
  await assert.rejects(publishGitUpdate({sleep:async()=>{},run:async args=>{if(args[0]==='push'){pushes++;throw new Error('unavailable');}}}),/unavailable/);
  assert.equal(pushes,3);
});

test("only reproducible publication outputs are eligible for conflict recovery",()=>{
  for(const file of ['wirkungsticker/quellen/bild/index.html','wirkungsticker/data/stories.json','news/feed.xml','assets/search/search-index.json']) assert.equal(regeneratablePublicationPath(file),true,file);
  for(const file of ['data/news/stories.json','scripts/news/build.mjs','content/news/source-registry.json','wirkungsticker/manual.md','wirkungsticker/image.png','../wirkungsticker/index.html']) assert.equal(regeneratablePublicationPath(file),false,file);
});
test("real git race regenerates pages with new renderer and preserves news data", async t=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'woek-publish-race-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const cmd=(cwd,args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe'],env:{...process.env,GIT_EDITOR:'true'}});
  const remote=path.join(root,'remote.git'),local=path.join(root,'worker'),release=path.join(root,'release');
  cmd(root,['init','--bare',remote]);cmd(root,['clone',remote,local]);
  const write=(base,file,value)=>{fs.mkdirSync(path.dirname(path.join(base,file)),{recursive:true});fs.writeFileSync(path.join(base,file),value)};
  const identity=base=>{cmd(base,['config','user.name','Test']);cmd(base,['config','user.email','test@example.org'])};
  identity(local);cmd(local,['checkout','-b','main']);
  write(local,'data/news/stories.json','{"news":1}\n');write(local,'scripts/renderer.txt','old\n');write(local,'wirkungsticker/quellen/bild/index.html','old:1\n');
  cmd(local,['add','.']);cmd(local,['commit','-m','base']);cmd(local,['push','-u','origin','main']);
  cmd(root,['clone','--branch','main',remote,release]);identity(release);
  write(local,'data/news/stories.json','{"news":2}\n');write(local,'wirkungsticker/quellen/bild/index.html','old:2\n');cmd(local,['add','.']);cmd(local,['commit','-m','worker']);
  write(release,'scripts/renderer.txt','new\n');write(release,'wirkungsticker/quellen/bild/index.html','new:1\n');cmd(release,['add','.']);cmd(release,['commit','-m','release']);cmd(release,['push']);
  let builds=0;
  const result=await publishGitUpdate({run:async args=>cmd(local,args),rebuild:async()=>{builds++;const data=JSON.parse(fs.readFileSync(path.join(local,'data/news/stories.json')));const renderer=fs.readFileSync(path.join(local,'scripts/renderer.txt'),'utf8').trim();write(local,'wirkungsticker/quellen/bild/index.html',`${renderer}:${data.news}\n`);},sleep:async()=>{}});
  assert.equal(result.regenerated,true);assert.equal(builds,1);
  assert.equal(cmd(local,['show','origin/main:data/news/stories.json']),'{"news":2}\n');
  assert.equal(cmd(local,['show','origin/main:wirkungsticker/quellen/bild/index.html']),'new:2\n');
  assert.equal(cmd(local,['status','--porcelain']).trim(),'');
});

test("real git race merges different stories and rebuilds their common publication report", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-story-race-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cmd = (cwd, args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, GIT_EDITOR: "true" } });
  const remote = path.join(root, "remote.git"), worker = path.join(root, "worker"), editor = path.join(root, "editor");
  const write = (dir, file, value) => { fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true }); fs.writeFileSync(path.join(dir, file), value); };
  const identity = dir => { cmd(dir, ["config", "user.name", "Test"]); cmd(dir, ["config", "user.email", "test@example.org"]); };
  const save = (dir, data, report) => { write(dir, "data/news/stories.json", `${JSON.stringify(data)}\n`); write(dir, "reports/wirkungsticker-source-integrity.json", report); cmd(dir, ["add", "."]); cmd(dir, ["commit", "-m", report.trim()]); };
  const a = { story_id: "a", title: "old A", versions: [1] }, b = { story_id: "b", title: "old B" };
  cmd(root, ["init", "--bare", remote]); cmd(root, ["clone", remote, worker]); identity(worker); cmd(worker, ["checkout", "-b", "main"]);
  save(worker, store([a, b]), "base\n"); cmd(worker, ["push", "-u", "origin", "main"]);
  cmd(root, ["clone", "--branch", "main", remote, editor]); identity(editor);
  save(worker, store([a, { ...b, title: "worker B" }], 1), "worker\n");
  const corrected = { ...a, title: "editor A", versions: [1, 2], corrections: ["Explained"] };
  save(editor, store([corrected, b], 2), "editor\n"); cmd(editor, ["push"]);
  let builds = 0;
  const result = await publishGitUpdate({
    run: async args => cmd(worker, args), sleep: async () => {},
    writeStoryStore: data => write(worker, "data/news/stories.json", `${JSON.stringify(data, null, 2)}\n`),
    rebuild: async () => { builds++; const data = JSON.parse(fs.readFileSync(path.join(worker, "data/news/stories.json"))); write(worker, "reports/wirkungsticker-source-integrity.json", data.stories.map(s => s.title).join(" / ")); },
  });
  assert.equal(result.regenerated, true); assert.equal(builds, 1);
  const published = JSON.parse(cmd(worker, ["show", "origin/main:data/news/stories.json"]));
  assert.deepEqual(published.stories.find(s => s.story_id === "a"), corrected);
  assert.equal(published.stories.find(s => s.story_id === "b").title, "worker B");
  assert.equal(cmd(worker, ["show", "origin/main:reports/wirkungsticker-source-integrity.json"]), "editor A / worker B");
  assert.equal(cmd(worker, ["status", "--porcelain"]).trim(), "");
});
