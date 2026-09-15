import fs from 'node:fs';
import path from 'node:path';
const CORE=['termId','id','slug','canonicalLabel','label','shortDefinition','hoverDefinition','longDefinition','definition','woekRelation','status','version','protected_term','term_status'];
const unique=items=>[...new Map(items.map(x=>[JSON.stringify(x),x])).values()];
export function applyLearningSupplement(terms,root=process.cwd()){
 const file=path.join(root,'content/glossary/imports/finanzierung-evidenz-2026-09-15.json');
 if(!fs.existsSync(file))throw Error('Missing approved financing evidence supplement');
 const supplement=JSON.parse(fs.readFileSync(file,'utf8'));
 const byId=new Map(terms.map(t=>[t.termId,t]));
 const preserved=new Map(terms.map(t=>[t.termId,JSON.stringify(CORE.map(k=>t[k]))]));
 for(const item of supplement.learning||[]){
  const t=byId.get(item.termId);if(!t)throw Error(`Unknown learning target ${item.termId}`);
  t.aliases=unique([...(t.aliases||[]),...item.aliases]);
  t.synonyms=unique([...(t.synonyms||[]),...item.aliases]);
  t.relatedTerms=unique([...(t.relatedTerms||[]),...item.relatedTerms]).filter(id=>id!==t.termId);
  t.officialSources=unique([...(t.officialSources||[]),...item.officialSources]);
  const same=(t.deepGlossarySections||[]).filter(s=>s.title===item.section.title);
  if(same.some(s=>JSON.stringify(s)!==JSON.stringify(item.section)))throw Error(`Conflicting learning section ${t.termId}`);
  t.deepGlossarySections=unique([...(t.deepGlossarySections||[]),item.section]);
 }
 for(const item of supplement.aliasCorrections||[]){
  const t=byId.get(item.target);if(!t)throw Error(`Unknown alias correction ${item.target}`);
  for(const field of ['aliases','synonyms'])t[field]=(t[field]||[]).filter(a=>!item.remove.includes(a));
  t.relatedTerms=unique([...(t.relatedTerms||[]),...(item.related||[])]);
 }
 // Back-links are curated from explicitly supplied relationships, never from categories.
 const added=new Set((supplement.terms||[]).map(t=>t.termId));
 for(const t of terms.filter(t=>added.has(t.termId))){
  for(const id of t.relatedTerms||[]){const target=byId.get(id);if(!target)throw Error(`Unresolved new relation ${t.termId}: ${id}`);target.relatedTerms=unique([...(target.relatedTerms||[]),t.termId]);}
 }
 for(const t of terms)if(JSON.stringify(CORE.map(k=>t[k]))!==preserved.get(t.termId))throw Error(`Protected definition changed: ${t.termId}`);
 return terms;
}
