import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {ROOT,read,atomic,sha} from './model.mjs';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function loadReferenceLinks(root=ROOT){
 const file=path.join(root,'content/wirkungslexikon/sdgplus-links.json');if(!fs.existsSync(file))return [];
 const {blocks}=read(file),ids=new Set();
 for(const b of blocks){if(!/^[a-z0-9-]+$/.test(b.id)||ids.has(b.id)||!Array.isArray(b.paths)||!b.paths.length||b.paths.some(p=>p.startsWith('/')||p.includes('..')||!p.endsWith('.html'))||!b.title||!b.paragraphs?.length||b.paragraphs.some(p=>typeof p!=='string')||b.anchor&&!/^[a-z0-9-]+$/.test(b.anchor)||b.position&&!['after-hero'].includes(b.position))throw Error('INVALID_REFERENCE_BLOCK');ids.add(b.id);for(const q of [...b.links||[],...(b.items||[])])if(!q.label||!/^\/(?!\/)[^\s"<>]*$/.test(q.href)||q.href.includes('..'))throw Error('INVALID_REFERENCE_LINK');}
 return blocks;
}
export function referenceHtml(block,lexicon=false){
 const b=block,level=b.anchor?'h3':'h2',css=lexicon?'wl-container wl-prose wl-section-space':b.anchor?'card':'section section-muted';
 return `<!-- wl-reference:${b.id}:start --><${b.anchor?'aside':'section'} class="${css}" data-wl-reference="${b.id}" id="${b.id}" aria-labelledby="${b.id}-title"><${level} id="${b.id}-title">${esc(b.title)}</${level}>${b.dated?'<p class="'+(lexicon?'wl-small':'card-kicker')+'">Ergänzender Anwendungshinweis · 16.10.2026</p>':''}${b.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')}${b.items?'<ul>'+b.items.map(i=>'<li><a href="'+esc(i.href)+'">'+esc(i.label)+'</a>: '+esc(i.text)+'</li>').join('')+'</ul>':''}${(b.links||[]).map(l=>'<p><a class="'+(lexicon?'wl-btn wl-btn--secondary':'btn btn-secondary')+'" href="'+esc(l.href)+'">'+esc(l.label)+'</a></p>').join('')}</${b.anchor?'aside':'section'}><!-- wl-reference:${b.id}:end -->`;
}
function sectionRange(html,anchor){
 const tokens=[...html.matchAll(/<section\b[^>]*>|<\/section\s*>/gi)];let start=-1,depth=0;
 for(const token of tokens){if(start<0){if(!token[0].startsWith('</')&&(!anchor||new RegExp('\\sid=["\']'+anchor+'["\']').test(token[0]))){start=token.index;depth=1;}continue;}depth+=token[0].startsWith('</')?-1:1;if(!depth)return {start,end:token.index+token[0].length,close:token.index};}
 throw Error('REFERENCE_SECTION_MISSING:'+anchor);
}
export function applyReferenceLinks(html,rel,blocks=loadReferenceLinks()){
 const edits=[];for(const b of blocks.filter(b=>b.paths.includes(rel))){
  const start='<!-- wl-reference:'+b.id+':start -->',end='<!-- wl-reference:'+b.id+':end -->',at=html.indexOf(start),after=referenceHtml(b,rel.startsWith('wirkungslexikon/'));let before='';
  if(at>=0){const stop=html.indexOf(end,at);if(stop<0||html.indexOf(start,at+1)>=0)throw Error('REFERENCE_MARKER_BROKEN');before=html.slice(at,stop+end.length);html=html.replace(before,after);}
  else{const at=b.anchor?sectionRange(html,b.anchor).close:b.position==='after-hero'?sectionRange(html).end:html.lastIndexOf('</main>');if(at<0)throw Error('REFERENCE_MAIN_MISSING');html=html.slice(0,at)+after+html.slice(at);}
  edits.push({before,after,id:b.id});
 }return {html,edits};
}
export const referenceSearchTags=(entry,rel,blocks)=>blocks.some(b=>b.paths.includes(rel))?{...entry,tags:[...new Set(['Wirkungslexikon','SDG+','Politische Sprache',...(entry.tags||[])])]}:entry;
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1],root=path.resolve(value('--root')),blocks=loadReferenceLinks(),rows=[];
 for(const rel of new Set(blocks.flatMap(b=>b.paths).filter(p=>!p.startsWith('wirkungslexikon/')))){
  const file=path.join(root,rel),before=fs.readFileSync(file,'utf8'),result=applyReferenceLinks(before,rel,blocks);let restored=result.html;for(const e of result.edits.toReversed())restored=restored.replace(e.after,e.before);if(restored!==before)throw Error('UNRELATED_REFERENCE_CHANGE');if(result.html!==before)fs.writeFileSync(file,result.html);rows.push({path:rel,blocks:result.edits.map(e=>e.id),beforeSha256:sha(before),afterSha256:sha(result.html),unrelatedContentUnchanged:true});
 }
 if(args.includes('--report'))atomic(path.resolve(value('--report')),{status:'PASS',pages:rows});console.log('Reference links: '+rows.length+' existing host pages updated; historical text preserved.');
}
