import fs from 'node:fs';
import {renderSiteHeader} from '../lib/site-shell.mjs';
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')).map(x=>{const i=x.indexOf('=');return i<0?[x.slice(2),true]:[x.slice(2,i),x.slice(i+1)];}));
if(args.templates){
  fs.writeFileSync('templates/header.html',renderSiteHeader('{{BASE}}','de')+'\n');
}else process.stdout.write(renderSiteHeader(args.base||'',args.locale||'de'));
