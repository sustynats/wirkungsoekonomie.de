import path from 'node:path';import {ROOT,CONTENT,read,approvedV9} from './model.mjs';import {digest} from './v9-store.mjs';import {build} from './build.mjs';
const args=process.argv.slice(2),i=args.indexOf('--out');
const payload=read(path.join(CONTENT,'publication-v9.json')),policy=read(path.join(CONTENT,'publication-policy.json')).lexikon;
if(digest(payload)!==policy.payloadSha256||!approvedV9(payload.model.data))throw Error('V9_PAYLOAD_APPROVAL_MISMATCH');
console.log(JSON.stringify(build({...payload,mode:'public',out:i>=0?args[i+1]:path.join(ROOT,'outputs/wirkungslexikon/public')}),null,2));
