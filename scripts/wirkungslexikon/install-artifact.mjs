import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {ROOT,read,sha} from './model.mjs';
import {integrate} from './integrate.mjs';
const policy=read(path.join(ROOT,'content/wirkungslexikon/publication-policy.json'));
if(!policy.lexikon.released){console.log('Lexikon bleibt unveröffentlicht.');process.exit(0);}
const artifact=policy.lexikon.publicArtifact;
if(!artifact?.url||!artifact.sha256)throw Error('Geprüftes öffentliches Lexikonartefakt fehlt');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'woek-lexikon-'));
try{
 const r=await fetch(artifact.url);if(!r.ok)throw Error('Lexikonartefakt nicht erreichbar: '+r.status);
 const bytes=Buffer.from(await r.arrayBuffer());if(sha(bytes)!==artifact.sha256)throw Error('Prüfsumme des Lexikonartefakts stimmt nicht');
 const file=path.join(tmp,'lexikon.tar.gz');fs.writeFileSync(file,bytes);
 const py=spawnSync('python3',['-c',`import sys,tarfile\nfrom pathlib import Path\np=Path(sys.argv[1])\nwith tarfile.open(p/'lexikon.tar.gz') as a:\n if any(m.issym() or m.islnk() or not(m.isfile() or m.isdir()) for m in a.getmembers()):raise RuntimeError('Unexpected archive entry')\n a.extractall(p/'candidate',filter='data')`,tmp],{encoding:'utf8'});if(py.status)throw Error(py.stderr);
 const result=await integrate({artifact:path.join(ROOT,'_site'),candidate:path.join(tmp,'candidate')});
 console.log(JSON.stringify({...result,changedFiles:result.changedFiles.length}));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
