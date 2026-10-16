import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT,atomic,read} from './model.mjs';
const repo=process.env.GITHUB_REPOSITORY||'sustynats/wirkungsoekonomie.de';
const api=route=>JSON.parse(execFileSync('gh',['api',`repos/${repo}/${route}`],{encoding:'utf8'}));
function active(){
 for(const d of api('deployments?environment=github-pages&per_page=100')){
  const s=api(`deployments/${d.id}/statuses`)[0];
  if(s?.state==='success'){
   const run=Number(s.log_url?.match(/\/actions\/runs\/(\d+)/)?.[1]);if(!run)throw Error('Quelllauf der aktiven Veröffentlichung fehlt');
   return {deploymentId:d.id,sha:d.sha,runId:run};
  }
 }
 throw Error('Aktive erfolgreiche Veröffentlichung nicht nachweisbar');
}
const command=process.argv[2],folder=path.resolve(process.argv[3]||path.join(ROOT,'outputs/wirkungslexikon/deployment'));
if(command==='baseline'){
 const d=active();const run=api('actions/runs/'+d.runId);
 if(run.conclusion!=='success'||run.head_sha!==d.sha)throw Error('Veröffentlichung und Quellartefakt passen nicht zusammen');
 const files=api(`actions/runs/${d.runId}/artifacts`).artifacts.filter(a=>a.name==='github-pages'&&!a.expired);
 if(files.length!==1)throw Error('Kein eindeutiges aktives Artefakt');
 atomic(path.join(folder,'baseline.json'),{...d,artifactId:files[0].id});
 execFileSync('gh',['run','download',String(d.runId),'-R',repo,'-n','github-pages','-D',path.join(folder,'download')],{stdio:'inherit'});
 console.log(JSON.stringify(d));
}else if(command==='verify-baseline'){
 const expected=read(path.join(folder,'baseline.json'));const now=active();
 if(now.deploymentId!==expected.deploymentId)throw Error('Produktion wurde zwischenzeitlich geändert. Aus aktuellem Artefakt neu vorbereiten.');
 console.log('Aktive Veröffentlichung stimmt mit dem gesicherten Ausgangsartefakt überein: '+now.deploymentId);
}else throw Error('Aufruf: deployment.mjs baseline|verify-baseline <proof-dir>');
