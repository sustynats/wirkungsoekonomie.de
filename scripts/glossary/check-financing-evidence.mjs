import fs from 'node:fs';
import assert from 'node:assert/strict';
import { applyLearningSupplement } from './apply-learning-supplement.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const after=read('public/data/glossary.terms.json').terms;
const supplement=read('content/glossary/imports/finanzierung-evidenz-2026-09-15.json');
const decisions=read('content/glossary/editorial/finanzierung-evidenz-20260915/decisions.json');
const by=new Map(after.map(t=>[t.termId,t]));
const CORE=['termId','slug','canonicalLabel','shortDefinition','hoverDefinition','longDefinition','definition','woekRelation','status','version','protected_term','term_status'];
assert.equal(supplement.terms.length,32);assert.equal(supplement.learning.length,12);
assert.equal(decisions.decisions.length,44);assert.equal(by.size,after.length);
assert.equal(new Set(after.map(t=>t.slug)).size,after.length);
const baselinePath=process.env.GLOSSARY_BASELINE;
if(baselinePath){
 const before=read(baselinePath).terms;
 for(const t of before){assert.ok(by.has(t.termId),`Lost term ${t.termId}`);for(const k of CORE)assert.deepEqual(by.get(t.termId)[k],t[k],`Canonical field changed: ${t.termId}.${k}`);}
 assert.equal(after.length,before.length+32);
}
for(const d of decisions.decisions){
 const t=by.get(d.target);assert.ok(t,`Missing concept ${d.key}`);
 for(const alias of d.aliases)assert.ok(t.aliases.includes(alias),`Missing alias ${alias}`);
 assert.ok(t.longDefinition.length>=40);
 assert.ok(t.officialSources.length>0);
 assert.ok(t.relatedTerms.length>0);
 for(const rel of t.relatedTerms)assert.ok(by.has(rel),`Unresolved relation ${t.termId}.${rel}`);
 const section=d.action==='new'?'Im Gespräch':`Anwendungssprache: ${d.label}`;
 assert.ok(t.deepGlossarySections?.some(s=>s.title===section),`Missing learning section ${t.termId}`);
 if(process.env.GLOSSARY_CHECK_PAGES==='1'){
  const html=fs.readFileSync(`begriffe/${t.slug}/index.html`,'utf8');
  assert.ok(html.includes('rel="canonical"'),`Missing canonical: ${t.slug}`);
  assert.ok(!html.includes('[object Object]'),`Object residue ${t.slug}`);
  assert.ok(!html.match(/\/(?:Users|mnt\/data)\//),`Private path ${t.slug}`);
  assert.ok(html.includes(section),`Learning section not published: ${t.slug}`);
 }
}
assert.ok(!by.get('human-rights-due-diligence').aliases.includes('Due Diligence'));
assert.ok(by.get('due-diligence').aliases.includes('Due Diligence'));
assert.ok(by.get('klimaschutz').aliases.includes('Mitigation'));
assert.ok(!by.get('risikominderung').aliases.includes('Mitigation'));
assert.ok(by.get('resilienz')&&by.get('systemresilienz')&&by.get('wirkungsresilienz'));
const first=applyLearningSupplement(structuredClone(after));
const second=applyLearningSupplement(structuredClone(first));
assert.deepEqual(second,first,'Learning overlay is not idempotent');
for(const t of first)for(const k of CORE)assert.deepEqual(t[k],by.get(t.termId)[k]);
console.log('PASS: all 44 concepts, 32 new pages, 12 learning enrichments; canonical protection and idempotence.');
