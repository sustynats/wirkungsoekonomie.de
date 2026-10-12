import fs from 'node:fs';
import path from 'node:path';
import {findPublicEditorialResidue} from '../lib/public-editorial-cleanup.mjs';

const root=path.resolve(process.argv[2] || '_site');
if(!fs.existsSync(root))throw new Error('Missing publication artifact: '+root);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.isFile()&&e.name.endsWith('.html')?[path.join(dir,e.name)]:[]);}
const findings=[];let reviewed=0;
for(const file of walk(root)){
  const relative=path.relative(root,file).replaceAll(path.sep,'/');
  // The English edition is parked by the explicit user instruction.
  if(relative.startsWith('en/'))continue;
  const html=fs.readFileSync(file,'utf8');
  if(/<html\b[^>]*\blang=["']en/i.test(html))continue;
  reviewed++;
  const residue=findPublicEditorialResidue(html);
  if(residue.length)findings.push({file:relative,residue});
}
const report={reviewedHtmlPages:reviewed,patterns:'reviewed production and editorial wording',findings};
fs.mkdirSync('reports/quality',{recursive:true});
fs.writeFileSync('reports/quality/public-editorial-residue.json',JSON.stringify(report,null,2)+'\n');
console.log(`Public editorial residue: ${findings.length} pages flagged in ${reviewed} German HTML pages.`);
if(findings.length){console.error(JSON.stringify(findings.slice(0,30),null,2));process.exitCode=1;}
