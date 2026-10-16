import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {ROOT,read,validate,publicData,approvedV9} from './model.mjs';
import {createLexicon} from '../../assets/js/wirkungslexikon.mjs';
const args=process.argv.slice(2),i=args.indexOf('--out');const out=path.resolve(i>=0?args[i+1]:path.join(ROOT,'outputs/wirkungslexikon/public'));
const data=read(path.join(out,'wirkungslexikon/daten.json'));validate(data,{allowSubset:true});
const v9=approvedV9(data);assert.equal(data.entries.length,v9?180:132);assert.equal(publicData(data).entries.length,data.entries.length);
assert.equal(new Set(data.entries.map(e=>e.slug)).size,data.entries.length);
assert(!data.entries.some(e=>(!v9&&e.slug.startsWith('offen-'))||e.pruefstatus!=='freigegeben'));
const w=createLexicon(data,{mode:'public'});
for(const e of data.entries){
 const html=fs.readFileSync(path.join(out,'wirkungslexikon',e.slug,'index.html'),'utf8');
 assert(html.includes('Wirkungspotenzial'));assert(html.includes('Tatsächlich beobachtete Wirkungen')||(v9&&html.includes('Dokumentierte')));
 assert(!html.includes('data-wl-editor'));assert(!html.includes('/wirkungslexikon/redaktion/'));
 assert(html.includes('application/ld+json'));assert(html.includes('rel="canonical"'));
 for(const tile of [w.tileHtml(e),w.rowHtml(e)]){assert(tile.includes(w.esc(e.wirkungspotenzial.moegliche_veraenderung)));assert(!tile.includes('Keine spezifische Wirkung nachgewiesen'));}
 if(args.includes('--images'))for(const format of ['og','portrait','square'])assert(fs.statSync(path.join(out,'wirkungslexikon',e.slug,format+'.png')).size>1000);
}
if(!v9)for(const slug of ['ifr-self-deportation','offen-fluchtlingswelle','afd-remigration'])assert(!fs.existsSync(path.join(out,'wirkungslexikon',slug,'index.html')));
assert(!fs.existsSync(path.join(out,'wirkungslexikon/redaktion/index.html')));
const runtime=read(path.join(out,'wirkungslexikon/runtime.json'));assert.equal(runtime.config.mode,'public');
if(!v9)assert(!runtime.config.texts.schwerpunkt_ifr.includes('Beispielkarte: Self-Deportation'));
const policy=read(path.join(ROOT,'content/wirkungslexikon/publication-policy.json'));if(!v9)assert(!policy.journal.released&&!policy.linkedin.released);
console.log(JSON.stringify({status:'PASS',cards:data.entries.length,staticPermalinks:data.entries.length,publicationGates:true,potentialSummaries:true,structuredData:true,images:args.includes('--images')?data.entries.length*3:0}));
