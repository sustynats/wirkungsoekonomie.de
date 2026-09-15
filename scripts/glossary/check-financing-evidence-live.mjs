import fs from 'node:fs';
import assert from 'node:assert/strict';
const root='content/glossary/editorial/finanzierung-evidenz-20260915/';
const decisions=JSON.parse(fs.readFileSync(root+'decisions.json','utf8')).decisions;
const concepts=new Map([1,2,3,4].flatMap(i=>{const p=JSON.parse(fs.readFileSync(root+`candidates-${i}.json`,'utf8'));return p.records.map(r=>{const c=Object.fromEntries(p.fields.map((f,n)=>[f,r[n]]));return [c.key,c];});}));
const base=process.env.SITE_BASE||'https://wirkungsoekonomie.de';
const result=[];
const plain=s=>s.replace(/<[^>]*>/g,' ').replace(/&(?:amp|lt|gt|quot|#39);/g,e=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"}[e])).replace(/\s+/g,' ').trim();
async function get(p){const r=await fetch(base+p,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,`${p}: HTTP ${r.status}`);return r.text();}
for(let i=0;i<decisions.length;i+=4){await Promise.all(decisions.slice(i,i+4).map(async d=>{
 const url=`/begriffe/${d.target}/`;const html=await get(url);const text=plain(html);const c=concepts.get(d.key);
 const fragment=c.sentence.replace(/[„“"']/g,'').replace(/\s+/g,' ').trim();
 assert.ok(text.replace(/[„“"']/g,'').includes(fragment),`${url}: new learning text missing`);
 assert.ok(html.includes('rel="canonical"'),`${url}: canonical missing`);
 assert.ok(!/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html),`${url}: noindex`);
 result.push({key:d.key,url:base+url,status:200,learning:true,canonical:true});
}));}
const lookup=JSON.parse(await get('/assets/data/glossary-lookup.json'));
for(const d of decisions){const t=lookup.terms.find(t=>t.id===d.target||t.slug===d.target);assert.ok(t,`Live lookup missing ${d.target}`);for(const a of d.aliases)assert.ok(t.aliases.includes(a),`Live lookup missing alias ${a}`);}
const index=await get('/begriffe/');const sitemap=await get('/sitemap.xml');
for(const d of decisions){assert.ok(index.includes(d.target),`Index missing ${d.target}`);assert.ok(sitemap.includes(`/begriffe/${d.target}/`),`Sitemap missing ${d.target}`);}
const report={checkedAt:new Date().toISOString(),releaseCommit:process.env.RELEASE_COMMIT||null,glossaryCount:lookup.count,verifiedTerms:result.length,index:true,lookup:true,sitemap:true,details:result};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/glossary-financing-evidence-live.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
