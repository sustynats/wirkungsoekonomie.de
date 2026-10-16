import path from 'node:path';
import {CONTENT,loadModel,atomic,read,publicData,validate} from './model.mjs';
// Export only existing, explicitly recorded approvals. This command cannot approve cards.
const args=process.argv.slice(2);
if(args[0]!=='snapshot')throw Error('Aufruf: release.mjs snapshot --expected-revision=<n>. Neue Freigaben werden hier nicht erteilt.');
const revision=Number(args.find(a=>a.startsWith('--expected-revision='))?.split('=')[1]);
const model=loadModel();
if(!Number.isInteger(revision)||revision!==model.editorial.revision)throw Error('Fassungsbindung fehlt oder Revision wurde verändert');
const policy=read(path.join(CONTENT,'publication-policy.json'));
if(policy.lexikon.released!==true||policy.lexikon.person!=='Natalie Weber'||!policy.lexikon.approvalReference)throw Error('Lexikonfreigabe fehlt');
const data=publicData(model.data);validate(data,{allowSubset:true});
data.masterSha256=model.checksum;data.publicationRevision=revision;
data.publicationHistory=Object.fromEntries(Object.entries(model.editorial.history).filter(([slug])=>data.entries.some(e=>e.slug===slug)));
atomic(path.join(CONTENT,'published.json'),data);
console.log(JSON.stringify({publishedSnapshot:data.entries.length,revision,cardApprovalsChanged:false}));
