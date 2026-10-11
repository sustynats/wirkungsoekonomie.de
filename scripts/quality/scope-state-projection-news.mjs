// #253 projections have no ownership of operational news sources or caches.
// Preserve cache rows only when every corresponding source byte is unchanged.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const roots=['wirkungsticker','news','data/news','content/news'];
const operational=url=>url.startsWith('/wirkungsticker/')||url.startsWith('/news/');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function files(root,dir){
  const full=path.join(root,dir);
  if(!fs.existsSync(full))return [];
  return fs.readdirSync(full,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(root,path.posix.join(dir,e.name)):[path.posix.join(dir,e.name)]);
}
function hashes(root){return Object.fromEntries(roots.flatMap(dir=>files(root,dir)).sort().map(file=>[file,sha(path.join(root,file))]));}
export function capture(root,snapshot){
  const meta=JSON.parse(fs.readFileSync(path.join(root,'public/data/woek-search-meta.json'),'utf8'));
  fs.writeFileSync(snapshot,JSON.stringify({sources:hashes(root),entries:Object.fromEntries(Object.entries(meta.entries).filter(([url])=>operational(url)))}));
}
export function restore(root,snapshot){
  const before=JSON.parse(fs.readFileSync(snapshot,'utf8'));
  const after=hashes(root);
  if(JSON.stringify(before.sources)!==JSON.stringify(after))throw new Error('Unrelated operational news source mutation detected; do not restore cache rows or self-commit');
  const file=path.join(root,'public/data/woek-search-meta.json');
  const meta=JSON.parse(fs.readFileSync(file,'utf8'));
  meta.entries=Object.fromEntries(Object.entries({...Object.fromEntries(Object.entries(meta.entries).filter(([url])=>!operational(url))),...before.entries}).sort(([a],[b])=>a.localeCompare(b,'en')));
  fs.writeFileSync(file,JSON.stringify(meta,null,2)+'\n');
}
if(process.argv[1]&&path.resolve(process.argv[1])===new URL(import.meta.url).pathname){
  const mode=process.argv[2],snapshot=process.argv.find(x=>x.startsWith('--snapshot='))?.slice(11);
  if(!snapshot||!['capture','restore'].includes(mode))throw new Error('capture|restore --snapshot=<temporary-file> required');
  ({capture,restore}[mode])(process.cwd(),snapshot);
  console.log('Operational news sources and existing metadata '+mode+'d for scoped #253 projection.');
}
