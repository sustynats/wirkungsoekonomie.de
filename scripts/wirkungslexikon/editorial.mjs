import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {CONTENT, ROOT, atomic, read, loadModel, validate, approvalProblems, sha} from './model.mjs';
export function saveEntry({slug,entry,reason,revision}, principal, {content=CONTENT, model=loadModel()}={}) {
  if(!principal?.name || !['editor','publisher'].includes(principal.role))throw Error('Redaktionsrecht fehlt');
  if(revision!==model.editorial.revision)throw Error('REVISION_CONFLICT: Neu laden; eine andere Bearbeitung wurde gespeichert.');
  if(typeof reason!=='string'||reason.trim().length<10||reason.length>2000)throw Error('Änderungsbegründung mit 10–2000 Zeichen erforderlich');
  const old=model.data.entries.find(e=>e.slug===slug);
  if(!old||entry.slug!==old.slug||entry.id!==old.id)throw Error('Stabile ID und Permalink dürfen nicht verändert werden');
  if(entry.pruefstatus==='freigegeben'&&old.pruefstatus!=='freigegeben'&&principal.role!=='publisher')throw Error('Freigabe nur durch das gesonderte Freigabekonto');
  const next=structuredClone(entry);
  if(principal.role!=='publisher'){next.pruefstatus=old.pruefstatus==='freigegeben'?'quellenbelegt_redaktionell_pruefen':old.pruefstatus;delete next.freigabe;}
  next.version=`3.${model.editorial.revision+1}`;next.geprueft_am=new Date().toISOString().slice(0,10);
  const result={...model.data,entries:model.data.entries.map(e=>e.slug===slug?next:e)};validate(result);
  const at=new Date().toISOString();const event={id:crypto.randomUUID(),slug,date:at,actor:principal.name,role:principal.role,reason:reason.trim(),version:next.version,previousSha256:sha(JSON.stringify(old)),sha256:sha(JSON.stringify(next)),before:old,after:next};
  // Immutable event precedes current projection; a crash leaves a recoverable record.
  const journal=path.join(content,'revisions',event.id+'.json');atomic(journal,event);
  const editorial=structuredClone(model.editorial);editorial.revision++;editorial.overrides[slug]=next;
  (editorial.history[slug]||=[]).push({date:at,actor:principal.name,reason:reason.trim(),version:next.version,eventId:event.id});
  atomic(path.join(content,'editorial.json'),editorial);
  return {entry:next,revision:editorial.revision,eventId:event.id};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const [cmd,file]=process.argv.slice(2);const model=loadModel();
 if(cmd==='audit'){console.log(JSON.stringify(model.data.entries.map(e=>({slug:e.slug,status:e.pruefstatus,publicationProblems:approvalProblems(e)})),null,2));}
 else if(cmd==='add'){
  const entry=read(file);if(model.data.entries.some(e=>e.slug===entry.slug||e.id===entry.id))throw Error('ID oder Permalink existiert bereits');
  entry.pruefstatus='quellenbelegt_redaktionell_pruefen';
  validate({...model.data,entries:[...model.data.entries,entry]});
  // New cards go to a separate private extension; original master remains immutable.
  const additions=path.join(CONTENT,'additions.json');const list=fs.existsSync(additions)?read(additions):[];
  list.push(entry);atomic(additions,list);console.log('Private Karte angelegt: '+entry.slug);
 }else if(cmd==='undo'){
  const event=read(path.join(CONTENT,'revisions',file+'.json'));
  console.log(saveEntry({slug:event.slug,entry:event.before,reason:'Rücknahme der Änderung '+file,revision:model.editorial.revision},{name:'Lokale Redaktion (CLI)',role:'editor'}));
 }else throw Error('Aufruf: editorial.mjs audit | add <json> | undo <event-id>');
}
