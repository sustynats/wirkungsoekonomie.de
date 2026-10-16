import fs from 'node:fs';
import path from 'node:path';
import {ROOT,loadModel,validate,read,atomic,sha} from './model.mjs';
const file=process.argv[2];if(!file)throw Error('Aufruf: review-intake.mjs <chatgpt-review.json> [--stage]');
const model=loadModel(), incoming=read(file);
if(incoming.masterSha256!==model.checksum)throw Error('Rückmeldung bezieht sich nicht auf den unveränderten V3-Master');
if(!Array.isArray(incoming.entries)||!incoming.entries.length)throw Error('Vollständige Kartenobjekte in entries[] erforderlich');
const originalIds=new Set(model.master.entries.map(e=>e.id));
const blocked=new Set(model.data.entries.filter(e=>originalIds.has(e.id)&&e.pruefstatus!=='freigegeben').map(e=>e.slug));
const seen=new Set();const prepared=[];
for(const candidate of incoming.entries){
 const old=model.data.entries.find(e=>e.slug===candidate.slug);
 if(!old||!blocked.has(candidate.slug)||old.id!==candidate.id||seen.has(candidate.slug))throw Error('Unbekannte, doppelte oder nicht gesperrte Karte: '+candidate.slug);
 seen.add(candidate.slug);const next=structuredClone(candidate);next.pruefstatus=old.pruefstatus;delete next.freigabe;
 validate({...model.data,entries:model.data.entries.map(e=>e.slug===next.slug?next:e)});
 prepared.push({slug:next.slug,changedFields:Object.keys(next).filter(k=>JSON.stringify(next[k])!==JSON.stringify(old[k])),entry:next});
}
const report={sourceSha256:sha(fs.readFileSync(file)),masterSha256:model.checksum,entries:prepared,cardStatusesChanged:false,publicationTriggered:false,notes:'Nur technische Prüfung und optionale separate Ablage. Keine fachliche Bestätigung und keine Übernahme in den aktiven Bestand.'};
if(process.argv.includes('--stage'))atomic(path.join(ROOT,'outputs/wirkungslexikon/incoming-review',report.sourceSha256+'.json'),report);
console.log(JSON.stringify({validated:prepared.length,staged:process.argv.includes('--stage'),cardStatusesChanged:false,publicationTriggered:false,changes:prepared.map(({slug,changedFields})=>({slug,changedFields}))},null,2));
