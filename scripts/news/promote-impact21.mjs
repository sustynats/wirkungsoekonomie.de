import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { bridgeSession } from './bridge/remote.mjs';
import { prepareImpactPromotion, assertImpactCoverage } from './impact-coverage.mjs';
import { IMPACT_VERSION } from './impact-assessment.mjs';
const root=process.cwd(),now=new Date().toISOString();
const catalogs=[['stories.json','stories'],['editorial-analyses.json','analyses']].map(([file,key])=>({file:path.join(root,'data/news',file),key}));
for(const c of catalogs)c.data=JSON.parse(fs.readFileSync(c.file,'utf8'));
const jobsFile=process.argv.find(arg=>arg.startsWith('--jobs-file='))?.slice(12);
async function stagingJobs(){const {store}=bridgeSession();const jobs=[];for(const entry of await store.impactStagingIndex())jobs.push(await store.get(entry.id));return jobs;}
const jobs=process.argv.includes('--catalog-only') ? [] : jobsFile ? JSON.parse(fs.readFileSync(path.resolve(jobsFile),'utf8')) : await stagingJobs();
const result=prepareImpactPromotion(catalogs.flatMap(c=>c.data[c.key]),jobs);
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/wirkungsticker-impact21-coverage.json'),JSON.stringify(result.report,null,2)+'\n');
console.log(JSON.stringify(result.report));
if(process.argv.includes('--promote')) {
  assertImpactCoverage(result.report);
  // A Git commit and its single Pages artifact are the atomic public boundary.
  // Prepare all files first. No public version changes on an incomplete report.
  const byId=new Map(result.records.map(r=>[r.analysis_id||r.story_id,r]));
  const writes=catalogs.map(c=>({file:c.file,body:JSON.stringify({...c.data,[c.key]:c.data[c.key].map(r=>byId.get(r.analysis_id||r.story_id)||r)},null,2)+'\n'}));
  writes.push({file:path.join(root,'content/news/impact-release.json'),body:JSON.stringify({public_version:IMPACT_VERSION,released_at:now,
    minimum_material_counts:Object.fromEntries(Object.entries(result.report.by_dimension).map(([k,d])=>[k,Math.floor(d.material*.5)]))},null,2)+'\n'});
  const backup=path.join(os.homedir(),'.local/share/woek-impact-backups',now.replaceAll(':','-'));fs.mkdirSync(backup,{recursive:true,mode:0o700});
  for(const w of writes){if(fs.existsSync(w.file))fs.copyFileSync(w.file,path.join(backup,path.basename(w.file)));fs.writeFileSync(w.file+'.impact21.tmp',w.body);}
  for(const w of writes)fs.renameSync(w.file+'.impact21.tmp',w.file);
}
