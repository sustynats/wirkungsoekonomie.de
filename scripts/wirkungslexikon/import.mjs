import fs from 'node:fs';
import path from 'node:path';
import {CONTENT, ROOT, read, validate, atomic, sha} from './model.mjs';
const args=process.argv.slice(2);const source=args[0];
if(!source)throw Error('Aufruf: import.mjs <wirkungslexikon_master_v3.json> [--undo <backup>]');
if(args[0]==='--undo'){
 const backup=path.resolve(args[1]);if(!backup.startsWith(path.join(ROOT,'outputs/wirkungslexikon/import-backups/')))throw Error('Nur gesicherte Importdateien rückspielbar');
 const b=fs.readFileSync(backup);validate(JSON.parse(b));atomic(path.join(CONTENT,'wirkungslexikon_master_v3.json'),b.toString());console.log('Import aus Backup wiederhergestellt');
}else{
 if(path.basename(source)!=='wirkungslexikon_master_v3.json')throw Error('Nur V3-Master importieren; keine Archive oder Pilotdaten');
 const bytes=fs.readFileSync(source);const data=validate(JSON.parse(bytes));const destination=path.join(CONTENT,'wirkungslexikon_master_v3.json');
 const checksum=sha(bytes);let previous=null;
 if(fs.existsSync(destination)){
  const current=fs.readFileSync(destination);if(sha(current)!==checksum){previous=path.join(ROOT,'outputs/wirkungslexikon/import-backups',sha(current)+'.json');atomic(previous,current.toString());}
 }
 atomic(destination,bytes.toString());atomic(path.join(CONTENT,'import-manifest.json'),{migration:'v3-1',sha256:checksum,entries:data.entries.length,source:path.basename(source),previous,importedAt:new Date().toISOString(),publicationStatusPreserved:true});
 console.log(JSON.stringify({entries:data.entries.length,sha256:checksum,changed:!!previous,previous}));
}
