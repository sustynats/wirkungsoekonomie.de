import fs from 'node:fs';
import {renderSiteHeader,renderSiteFooter,renderFooterNewsletter} from '../lib/site-shell.mjs';
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')).map(x=>{const i=x.indexOf('=');return i<0?[x.slice(2),true]:[x.slice(2,i),x.slice(i+1)];}));
if(args.templates){
  fs.writeFileSync('templates/header.html',renderSiteHeader('{{BASE}}','de')+'\n');
  fs.writeFileSync('templates/footer.html',renderSiteFooter('{{BASE}}')+'\n'+renderFooterNewsletter('{{BASE}}')+'\n');
}else if(args.json) process.stdout.write(JSON.stringify({header:renderSiteHeader(args.base||'','de'),footer:renderSiteFooter(args.base||''),newsletter:renderFooterNewsletter(args.base||'')}));
else process.stdout.write(renderSiteHeader(args.base||'',args.locale||'de'));
