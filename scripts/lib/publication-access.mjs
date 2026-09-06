import fs from 'node:fs';
import path from 'node:path';
const SITE='https://wirkungsoekonomie.de';
export function hasPublicationAccess(html,route,root='.',seen=new Set()){
 if(seen.has(route)||seen.size>3)return false;seen.add(route);
 for(const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  const label=match[2].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
  if(!/Original|PDF|XLSX|Herunterladen|Download/i.test(label))continue;
  let url;try{url=new URL(match[1].replaceAll('&amp;','&'),SITE+route);}catch{continue;}
  if(url.origin==='https://github.com'&&url.pathname.startsWith('/sustynats/wirkungsoekonomie.de/releases/download/')&&/\.(pdf|xlsx)$/i.test(url.pathname))return true;
  if(url.origin!==SITE)continue;
  const rel=decodeURIComponent(url.pathname).replace(/^\//,'');
  const file=path.resolve(root,rel.endsWith('/')?rel+'index.html':rel);
  if(!file.startsWith(path.resolve(root)+path.sep)||!fs.existsSync(file))continue;
  if(/\.(pdf|xlsx)$/i.test(file))return true;
  if(file.endsWith('.html')&&hasPublicationAccess(fs.readFileSync(file,'utf8'),url.pathname,root,new Set(seen)))return true;
 }
 return false;
}
