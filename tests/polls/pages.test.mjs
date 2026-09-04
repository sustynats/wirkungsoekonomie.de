import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,mkdtempSync,mkdirSync,writeFileSync,existsSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pollPage,adminPage,indexPage,retiredPage } from '../../scripts/polls/pages.mjs';
import { sanitizeCatalog } from '../../scripts/polls/sync.mjs';
import { writePollFiles } from '../../scripts/polls/build.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const seed=JSON.parse(readFileSync(new URL('../../ops/polls/backend/first-poll.json',import.meta.url)));
const poll={...seed,id:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',revision:1,published_at:'2026-09-04T10:00:00Z',created_at:'2026-09-04T10:00:00Z',updated_at:'2026-09-04T10:00:00Z',effective_status:'active',options:seed.options.map((o,i)=>({...o,id:`00000000-0000-0000-0000-00000000000${i}`,sort_order:i}))};
test('public HTML has real crawlable metadata, form fallback, breadcrumbs and privacy',()=>{
  const html=pollPage(root,poll);
  assert.match(html,/<link rel="canonical" href="https:\/\/wirkungsoekonomie.de\/umfragen\/wirkungsticker-feedback\/">/);
  assert.match(html,/property="og:image"/);assert.match(html,/name="twitter:card"/);
  assert.match(html,/href="\/umfragen\/"/);assert.match(html,/aria-label="Abstimmung"/);
  assert.match(html,/keine Klartext-IP/);assert.match(html,/Diese Online-Umfrage ist nicht repräsentativ/);
  assert.doesNotMatch(html,/\{\{[A-Z_]+\}\}/);
});
test('stored XSS is escaped in body, metadata and structured data',()=>{
  const html=pollPage(root,{...poll,title:'</script><img src=x onerror=alert(1)>',intro:'<svg onload=alert(1)>',question:'<iframe>',options:poll.options.map(o=>({...o,label:'<script>alert(1)</script>'}))});
  assert.doesNotMatch(html,/<img src=x|<svg onload|<script>alert|<iframe>/);
  assert.match(html,/&lt;svg/);assert.match(html,/\\u003c/);
});
test('admin pages carry no session or private polls and are noindex',()=>{
  const html=adminPage(root);assert.match(html,/noindex,nofollow/);assert.match(html,/id="poll-admin" hidden/);
  assert.match(html,/Mit bestehendem Discord-Konto anmelden/);assert.doesNotMatch(html,/Bearer|POLLS_TOKEN_PEPPER|anonymous_vote_identifier/);
});
test('catalog sanitizes counts/identifiers and never publishes drafts',()=>{
  const data=sanitizeCatalog({ok:true,schema_version:1,polls:[{...poll,results:{total:5},votes:[{anonymous_vote_identifier:'private'}]}]});
  assert.equal(data.polls[0].votes,undefined);assert.equal(data.polls[0].results,undefined);
  assert.throws(()=>sanitizeCatalog({ok:true,schema_version:1,polls:[{...poll,status:'draft'}]}));
  assert.throws(()=>sanitizeCatalog({ok:false,polls:[]}));
  const removed=sanitizeCatalog({ok:true,schema_version:1,polls:[]},{polls:[poll]});assert.deepEqual(removed.retired_slugs,[poll.slug]);
});
test('deleted public surveys leave an empty noindex tombstone, archives leave index',()=>{
  assert.doesNotMatch(retiredPage(root,poll.slug),new RegExp(seed.title));
  assert.doesNotMatch(indexPage(root,[{...poll,status:'archived',effective_status:'archived'}]),/wirkungsticker-feedback/);
});
test('failed catalog publication restores the previous output',t=>{
  const dir=mkdtempSync(path.join(tmpdir(),'woek-poll-publication-'));t.after(()=>rmSync(dir,{recursive:true}));
  writeFileSync(path.join(dir,'existing.html'),'previous');mkdirSync(path.join(dir,'blocked'));
  assert.throws(()=>writePollFiles(dir,new Map([['existing.html','next'],['new.html','new'],['blocked','not a file']])));
  assert.equal(readFileSync(path.join(dir,'existing.html'),'utf8'),'previous');assert.equal(existsSync(path.join(dir,'new.html')),false);
});
