import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const directory = path.join(root, 'content/glossary/editorial/finanzierung-evidenz-20260915');
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const bundle = [1,2,3,4].flatMap(i => { const p = read(`candidates-${i}.json`); return p.records.map(r => { if(r.length !== p.fields.length) throw Error('Record width mismatch'); return Object.fromEntries(p.fields.map((f,j)=>[f,r[j]])); }); });
const decisions = read('decisions.json');
const sourceByKey = new Map(read('sources.json').map(s=>[s.key,s]));
const byKey = new Map(bundle.map(t=>[t.key,t]));
const targetByKey = new Map(decisions.decisions.map(d=>[d.key,d.target]));
if(bundle.length!==44 || byKey.size!==44 || decisions.decisions.length!==44 || targetByKey.size!==44) throw Error('Expected exactly 44 reviewed concepts');
const unique = items => [...new Set(items)];
const terms=[], learning=[];
const existing=JSON.parse(fs.readFileSync('public/data/glossary.terms.json','utf8')).terms;
const byId = new Map(existing.map(t=>[t.termId,t]));
const n=s=>String(s).toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFKD').replace(/[^a-z0-9]/g,'');
const names=t=>[t.termId,t.slug,t.canonicalLabel,...t.aliases||[],...t.synonyms||[]];
const corrections=decisions.aliasCorrections||[];
const correctionAllows=(id,alias)=>corrections.some(c=>c.target===id && c.remove.some(a=>n(a)===n(alias)));
for(const d of decisions.decisions){
 const c=byKey.get(d.key); if(!c || !['new','enrich'].includes(d.action))throw Error('Invalid decision');
 const found=byId.get(d.target);
 if(d.action==='enrich' && !found)throw Error(`Missing existing target ${d.target}`);
 if(d.action==='new' && found && found.source!=='Fachbegriffe zu Finanzierung und Evidenz')throw Error(`New target already exists ${d.target}`);
 for(const alias of [d.label,...d.aliases]){
  const owners=existing.filter(t=>t.termId!==d.target && names(t).some(a=>n(a)===n(alias)) && !correctionAllows(t.termId,alias));
  // The display label of an enrichment is not a replacement for the canonical label.
  if(owners.length && (d.action==='new'||d.aliases.includes(alias)))throw Error(`Alias collision ${alias}: ${owners.map(t=>t.termId)}`);
 }
 const sources=c.sources.map(k=>{const s=sourceByKey.get(k); if(!s)throw Error(`Missing source ${k}`);return `${s.title}|${s.url}`;});
 const relations=unique([...c.related.map(k=>{if(!targetByKey.has(k))throw Error(`Unknown relation ${k}`);return targetByKey.get(k)}),...d.related]).filter(k=>k!==d.target);
 const sections=[
  {title:'Einfach erklärt',body:c.plain},
  {title:'Im Gespräch',body:c.sentence},
  {title:'Darauf kommt es in der Anwendung an',body:c.usage},
 ];
 if(d.action==='new'){
  const finance=['capex','opex','cashflow','liquiditaet','fremdkapital','eigenkapital','refinanzierung','covenant','dscr','bonitaet','finanzierungsrelevanz'].includes(c.key);
  const category=finance?'Finanzsystem, Kapital und Unternehmenssteuerung':c.kind==='arbeitsbegriff'?'Praxisbegriff':(['risiko','abhaengigkeit','mitigation','transmissionskanal','szenario'].includes(c.key)?'Systeme, Steuerung und Resilienz':'Datenbegriff');
  terms.push({termId:d.target,canonicalLabel:d.label,slug:d.target,aliases:d.aliases,shortDefinition:c.short,hoverDefinition:c.short,longDefinition:c.plain+'\n\n'+c.usage,woekRelation:c.relation,usageNote:c.usage,statusNote:c.kind==='arbeitsbegriff'?'Arbeitsbegriff für Daten- und Nachweisprozesse; kein vorgeschriebener Standard.':'Fachlicher Anschlussbegriff; die konkrete Anwendung und Abgrenzung sind offenzulegen.',status:'anschlussbegriff',version:'1.0',lastReviewed:'2026-09-15',source:'Fachbegriffe zu Finanzierung und Evidenz',sourceProvenance:'Die externen Quellen stützen den Fachkontext. Die wirkungsökonomische Einordnung ist eine Modellanwendung; Beispiele sind typisiert.',category,relatedTerms:relations,officialSources:sources,doNotConfuseWith:c.distinguish,examples:c.examples,deepGlossarySections:sections,classicGlossary:true});
 }else{
  learning.push({termId:d.target,aliases:d.aliases,relatedTerms:relations,officialSources:sources,section:{title:`Anwendungssprache: ${d.label}`,body:c.plain,items:[c.usage,c.relation,...c.distinguish,...c.examples,c.sentence]}});
 }
}
const output={schemaVersion:1,reviewedAt:'2026-09-15',terms,learning,aliasCorrections:corrections};
fs.writeFileSync('content/glossary/imports/finanzierung-evidenz-2026-09-15.json',JSON.stringify(output,null,2)+'\n');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/glossary-financing-evidence-audit.json',JSON.stringify({reviewedAt:'2026-09-15',baselineCommit:decisions.baselineCommit,baseTermCount:decisions.baselineTerms,newTerms:terms.length,enrichedTerms:learning.length,candidateCount:bundle.length,sourcePayloadSha256:crypto.createHash('sha256').update(JSON.stringify(bundle)).digest('hex'),decisions:decisions.decisions,aliasCorrections:corrections},null,2)+'\n');
console.log(`Financing evidence: ${terms.length} new terms; ${learning.length} protected enrichments.`);
