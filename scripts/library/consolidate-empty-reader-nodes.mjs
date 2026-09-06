import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const SITE='https://wirkungsoekonomie.de';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const plain=s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const empty=html=>/<div class="reader-body">\s*<p>Inhalt wird ergänzt\.<\/p>\s*<\/div>/.test(html);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name==='index.html'?[path.join(dir,e.name)]:[]);
export function consolidateEmptyReaderNodes(root='.') {
 const dir=path.join(root,'bibliothek/eintraege');if(!fs.existsSync(dir))return [];
 const pages=new Map(walk(dir).filter(f=>f.includes('/lesen/')).map(file=>{
  const route='/'+path.relative(root,file).replaceAll(path.sep,'/').replace(/index.html$/,'');return [route,{file,html:fs.readFileSync(file,'utf8')}];
 }));
 const aliases=new Map();
 for(const [route,page] of pages){
  if(/data-reader-node-redirect/.test(page.html)){
   const target=page.html.match(/<link rel="canonical" href="https:\/\/wirkungsoekonomie.de([^"#]+)"/)?.[1];if(target && pages.has(target))aliases.set(route,target);
   continue;
  }
  if(!empty(page.html))continue;
  const parent=route.replace(/[^/]+\/$/,'');const overview=pages.get(parent);if(!overview)continue;
  const links=[...overview.html.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>/g)].map(m=>{try{return new URL(m[1],SITE+parent).pathname;}catch{return '';}});
  const order=[...new Set(links.filter(link=>link!==parent && link.startsWith(parent) && pages.has(link)))];
  const index=order.indexOf(route);if(index<0)continue;
  const next=order.slice(index+1).find(link=>{const html=pages.get(link).html;return /class="reader-body"/.test(html) && !empty(html) && !/data-reader-node-redirect/.test(html);});
  aliases.set(route,next||parent);
 }
 const results=[];
 for(const [from,first] of aliases){
  let to=first;const seen=new Set([from]);while(aliases.has(to)&&!seen.has(to)){seen.add(to);to=aliases.get(to);}if(seen.has(to))throw new Error(`Reader redirect cycle: ${from}`);
  const page=pages.get(from),target=pages.get(to);if(!target)throw new Error(`Missing reader destination: ${to}`);
  const title=page.html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'Onlinefassung';
  const label=plain(target.html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]||'Inhaltsübersicht').replace(/#$/,'').trim();
  const successor='/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/';
  const inherited=[...target.html.matchAll(/<p\b[^>]*>(?:(?!<\/?p\b)[\s\S])*?<\/p>/gi)].map(m=>m[0]).filter(p=>/Historische Quellenfassung:/i.test(p)).map(p=>p.replace(/href="([^"]+)"/g,(_,href)=>`href="${esc(new URL(href,SITE+to).href)}"`)).join('');
  const history=inherited+(target.html.includes('Historische, ersetzte Fassung') && target.html.includes(successor)?`<p>Historische, ersetzte Fassung. <a href="${successor}">Aktueller T-SROI-Rechenstandard</a></p>`:'');
  page.html=`<!doctype html>\n<html lang="de" data-reader-node-redirect><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${SITE}${to}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><main data-search-exclude><h1 id="kapitel">Direkt zum Text</h1>${history}<p>Dieser Gliederungspunkt wird mit dem anschließenden Textabschnitt erschlossen.</p><p><a href="${to}">${esc(label)}</a></p></main></body></html>\n`;
  fs.writeFileSync(page.file,page.html);results.push({from,to,basis:'generated reader body contained only the placeholder; substantive text retained in destination'});
 }
 const byFrom=new Map(results.map(x=>[x.from,x]));
 // Resolve the existing chapter navigation directly. A same-named chapter in
 // another book is never matched: every href is resolved against its full URL.
 for(const [route,page] of pages){
  if(aliases.has(route))continue;
  const html=page.html.replace(/(<a\b[^>]*href=")([^"#]+)(#[^"]*)?(")/g,(whole,start,href,fragment='',end)=>{
   let u;try{u=new URL(href,SITE+route);}catch{return whole;}if(u.origin!==SITE)return whole;
   const alias=byFrom.get(u.pathname);if(!alias)return whole;
   const target=pages.get(alias.to).html;const id=fragment.slice(1);const kept=id && target.includes(`id="${id}"`)?fragment:'';return start+alias.to+kept+end;
  });
  if(html!==page.html)fs.writeFileSync(page.file,html);
 }
 return results;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=consolidateEmptyReaderNodes(process.argv[2]||'.');console.log(`Reader navigation: ${result.length} empty generated nodes lead directly to the following text; old URLs retained.`);
 if(process.env.WOEK_READER_ALIAS_REPORT)fs.writeFileSync(process.env.WOEK_READER_ALIAS_REPORT,JSON.stringify(result,null,2)+'\n');
}
