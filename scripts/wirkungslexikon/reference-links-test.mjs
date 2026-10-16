import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {ROOT,read,sha} from './model.mjs';import {digest} from './v9-store.mjs';import {loadReferenceLinks,applyReferenceLinks,referenceSearchTags} from './reference-links.mjs';
const blocks=loadReferenceLinks(),component=path.join(ROOT,'outputs/wirkungslexikon/public'),site=process.env.WL_SITE||path.join(ROOT,'outputs/wirkungslexikon/v9-final-deployment/candidate'),files=[...new Set(blocks.flatMap(b=>b.paths))];
test('Reference registry: 29 contextual blocks on 27 existing pages, seven specific dimensions, no card assignments',()=>{
 assert.equal(blocks.length,29);assert.equal(files.length,27);const methods=blocks.find(b=>b.id==='sdgplus-methodik');assert.equal(methods.items.length,7);assert(new Set(methods.items.map(i=>i.href)).size===7);assert(!Object.keys(read(path.join(ROOT,'content/wirkungslexikon/sdgplus-links.json'))).includes('entries'));
});
test('Host additions preserve exact prior text, including historical documents; reapplication is idempotent',()=>{
 for(const rel of files.filter(f=>!f.startsWith('wirkungslexikon/'))){
  const current=fs.readFileSync(path.join(ROOT,rel),'utf8'),before=process.env.WL_REFERENCE_BASE?fs.readFileSync(path.join(process.env.WL_REFERENCE_BASE,rel),'utf8'):execFileSync('git',['show','0c49ab62b685141af1cc809d88c42285506560b6:'+rel],{cwd:ROOT,encoding:'utf8'});const result=applyReferenceLinks(before,rel,blocks);assert.equal(current,result.html);let restored=result.html;for(const e of result.edits.toReversed())restored=restored.replace(e.after,e.before);assert.equal(restored,before);assert.equal(applyReferenceLinks(result.html,rel,blocks).html,result.html);
 }
});
test('Every new link and fragment resolves to its actual canonical content',()=>{
 for(const rel of files){const html=fs.readFileSync(path.join(rel.startsWith('wirkungslexikon/')?component:site,rel),'utf8');for(const b of blocks.filter(b=>b.paths.includes(rel))){assert(html.includes('data-wl-reference="'+b.id+'"'),rel);for(const link of [...b.links,...b.items||[]]){const u=new URL(link.href,'https://wirkungsoekonomie.de'),file=path.join(u.pathname.startsWith('/wirkungslexikon/')?component:site,u.pathname.slice(1)+(u.pathname.endsWith('/')?'index.html':''));assert(fs.existsSync(file),file);if(u.hash){const target=fs.readFileSync(file,'utf8');assert(new RegExp('\\sid=["\']'+u.hash.slice(1)+'["\']').test(target),link.href);}}}}
});
test('Scientific approval, 180 stable cards and all editorial exclusions remain unchanged',()=>{
 const payload=read(path.join(ROOT,'content/wirkungslexikon/publication-v9.json')),policy=read(path.join(ROOT,'content/wirkungslexikon/publication-policy.json')).lexikon,data=read(path.join(component,'wirkungslexikon/daten.json'));assert.equal(digest(payload),policy.payloadSha256);assert.equal(digest(data),policy.dataSha256);assert.equal(data.entries.length,180);assert.equal(new Set(data.entries.map(e=>e.id)).size,180);assert(!JSON.stringify(data).includes('sdgplus-bezug'));assert(!fs.existsSync(path.join(component,'wirkungslexikon/redaktion')));
});
test('Search enrichment is contextual, idempotent and preserves prior fields',()=>{
 const e={url:'/verstehen/sdgs-sdgplus/',title:'Referenz',body:'Originaltext',tags:['Verstehen']},a=referenceSearchTags(e,'verstehen/sdgs-sdgplus/index.html',blocks);assert(a.tags.includes('Wirkungslexikon'));assert(a.tags.includes('SDG+'));assert.equal(a.body,e.body);assert.deepEqual(referenceSearchTags(a,'verstehen/sdgs-sdgplus/index.html',blocks),a);assert.deepEqual(referenceSearchTags(e,'unrelated/index.html',blocks),e);
});
