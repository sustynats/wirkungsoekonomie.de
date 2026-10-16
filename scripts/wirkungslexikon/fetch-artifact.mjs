import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawnSync} from 'node:child_process';import {ROOT,CONTENT,read,sha,approvedV9} from './model.mjs';
const dest=path.resolve(process.argv[2]||path.join(ROOT,'outputs/wirkungslexikon/public'));
const policy=read(path.join(CONTENT,'publication-policy.json')).lexikon,a=policy.publicArtifact;
if(!policy.released||policy.person!=='Natalie Weber'||!a?.url||!a.sha256)throw Error('EXPLICIT_RELEASE_REQUIRED');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wl-component-'));
try{const response=await fetch(a.url);if(!response.ok)throw Error('COMPONENT_HTTP_'+response.status);const bytes=Buffer.from(await response.arrayBuffer());if(sha(bytes)!==a.sha256)throw Error('COMPONENT_HASH_MISMATCH');fs.writeFileSync(path.join(tmp,'component.tgz'),bytes);
const py=spawnSync('python3',['-c',`import sys,tarfile\nfrom pathlib import Path\np=Path(sys.argv[1]);o=Path(sys.argv[2])\nwith tarfile.open(p/'component.tgz') as a:\n if any(m.issym() or m.islnk() or not(m.isfile() or m.isdir()) for m in a.getmembers()):raise RuntimeError('Unexpected entry')\n a.extractall(o,filter='data')`,tmp,path.join(tmp,'candidate')],{encoding:'utf8'});if(py.status)throw Error(py.stderr);
const candidate=path.join(tmp,'candidate'),data=read(path.join(candidate,'wirkungslexikon/daten.json'));if(policy.version==='V9'&&!approvedV9(data))throw Error('UNAPPROVED_COMPONENT');if(data.entries.length!==a.cards)throw Error('COMPONENT_COUNT_MISMATCH');if(fs.existsSync(dest))throw Error('COMPONENT_TARGET_EXISTS');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.renameSync(candidate,dest);console.log(JSON.stringify({status:'PASS',cards:data.entries.length,sha256:a.sha256}));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
