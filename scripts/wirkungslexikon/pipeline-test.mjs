import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {ROOT,read,atomic} from './model.mjs';
import {readBuiltSearchEntries} from '../search/build-browser-search-index.mjs';
const args=process.argv.slice(2),i=args.indexOf('--artifact');
const artifact=path.resolve(i>=0?args[i+1]:path.join(ROOT,'_site'));
const site=path.join(ROOT,'_site');const source=path.join(artifact,'assets/search/search-index.json');
if(!fs.existsSync(source)){const entries=readBuiltSearchEntries(artifact);assert(entries.length>0);atomic(source,entries);}
const ownLink=artifact!==site;
if(ownLink){assert(!fs.existsSync(site),'Existing _site must remain untouched');fs.symlinkSync(artifact,site,'dir');}
try{
 execFileSync(process.execPath,[path.join(ROOT,'scripts/wirkungslexikon/install-artifact.mjs')],{cwd:ROOT,stdio:'inherit',timeout:240000});
 assert(fs.existsSync(source),'Installer must retain the index required by the following website build step');
 execFileSync(process.execPath,[path.join(ROOT,'scripts/search/build-browser-search-index.mjs'),'--artifact'],{cwd:ROOT,stdio:'inherit',timeout:120000});
 assert(!fs.existsSync(source),'Final website search step must remove the full index');
 const entries=readBuiltSearchEntries(artifact),routes=read(path.join(artifact,'assets/data/public-routes.json'));
 assert.equal(entries.length,routes.counts.routes);
 const data=read(path.join(artifact,'wirkungslexikon/daten.json'));
 assert.equal(data.entries.length,132);
 for(const e of data.entries)assert(entries.some(item=>item.url==='/wirkungslexikon/'+e.slug+'/'));
 console.log(JSON.stringify({status:'PASS',installerRetainsIndex:true,standardSearchStepPrunesIndex:true,searchableRoutes:entries.length,approvedCards:132}));
}finally{if(ownLink)fs.unlinkSync(site);}
