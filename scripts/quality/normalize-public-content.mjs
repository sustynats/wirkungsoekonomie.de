import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const SITE='https://wirkungsoekonomie.de';
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const decode=value=>String(value).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&(amp|quot|lt|gt|nbsp|auml|ouml|uuml|szlig);/g,(_,name)=>({amp:'&',quot:'"',lt:'<',gt:'>',nbsp:' ',auml:'ä',ouml:'ö',uuml:'ü',szlig:'ß'})[name]);
const visible=value=>decode(value.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
const fold=value=>value.toLowerCase().replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const headingKey=value=>fold(value).replace(/^wgs-/,'').replace(/^(?:dossier-)+(?:(?:dossier-)?\d+-)?/,'');
const headingSlug=value=>fold(visible(value)).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function walk(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):entry.name.endsWith('.html')?[path.join(directory,entry.name)]:[]);}
function outsideRaw(html,transform){return html.split(/(<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>)/gi).map((part,i)=>i%2?part:transform(part)).join('');}

export function uniqueContentIds(html) {
  const seen=new Set();const reserved=new Set();const replacements=[];
  outsideRaw(html,part=>{for(const match of part.matchAll(/\sid=["']([^"']+)["']/g))reserved.add(match[1]);return part;});
  const result=outsideRaw(html,part=>part.replace(/<([a-z][\w:-]*)\b[^>]*\sid=(["'])([^"']+)\2[^>]*>/gi,(tag,name,quote,id)=>{
    if(!seen.has(id)){seen.add(id);return tag;}
    // A duplicated form control needs its label, script and form owner reviewed
    // together. Do not silently change an interactive contract here.
    if(!/^(?:h[1-6]|p|span|section|article|aside|div|figure|ul|ol|li|nav)$/i.test(name))return tag;
    let n=2;while(seen.has(`${id}--${n}`) || reserved.has(`${id}--${n}`))n++;
    const next=`${id}--${n}`;seen.add(next);replacements.push({id,next,tag:name});
    return tag.replace(/(\s)id=(["'])([^"']+)\2/i,(_,space,q)=>`${space}id=${q}${next}${q}`);
  }));
  let output=result;
  for(const {id,next,tag} of replacements.filter(item=>/^h[1-6]$/i.test(item.tag))){
    const escaped=next.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    output=output.replace(new RegExp(`(<${tag}\\b[^>]*\\sid=["']${escaped}["'][^>]*>)([\\s\\S]*?)(<\\/${tag}>)`,'i'),(_,start,body,end)=>start+body.replaceAll(`href="#${id}"`,`href="#${next}"`)+end);
  }
  return {html:output,changes:replacements};
}

export function normalizeStaticNavigation(html, ids) {
  const removedToc=[];let duplicateButtons=0;
  const result=outsideRaw(html,part=>part
    .replace(/<li\b[^>]*\sclass=["'][^"']*\btoc-level-[1-6]\b[^"']*["'][^>]*>\s*<a\b[^>]*\shref=["']#([^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/li>/gi,(item,fragment,label)=>{
      let id;try{id=decodeURIComponent(fragment);}catch{return item;}
      const key=headingSlug(label);
      // Existing publication cleanup deliberately removes this frontmatter.
      // Only discard its now-empty generated navigation entries, never prose
      // citations or unknown section labels that require editorial review.
      if(!ids.has(id) && /^(?:(?:inhaltsverzeichnis|dokumentlogik|kurzfassung|wirkungsokonomie)$|wok-rang-\d+(?:-|$))/.test(key)){
        removedToc.push({fragment:id,label:visible(label)});return '';
      }
      return item;
    })
    .replace(/(<a\b(?=[^>]*\sclass=["'][^"']*\bbtn\b)[^>]*>[\s\S]*?<\/a>)(?:\s*\1)+/gi,(repeated,anchor)=>{
      if(/\s(?:on\w+|data-[\w-]+)=/i.test(anchor.slice(0,anchor.indexOf('>'))))return repeated;
      duplicateButtons+=(repeated.match(/<a\b/gi)||[]).length-1;
      return anchor;
    }));
  return {html:result,removedToc,duplicateButtons};
}

export function normalizePublicContent(root, options={}) {
  const headingAnchors=options.headingAnchors ?? JSON.parse(fs.readFileSync('content/site/heading-anchors.json','utf8'));
  const pages=new Map();const report={reviewedAt:'2026-09-06',linkRewrites:[],fragmentAliases:[],uniqueIds:[],duplicates:[],headings:[],staleTocEntries:[],duplicateDownloadButtons:[]};
  for(const file of walk(root)){
    const rel=path.relative(root,file).replaceAll(path.sep,'/');const route=rel==='index.html'?'/':'/'+(rel.endsWith('/index.html')?rel.slice(0,-10):rel);
    const original=fs.readFileSync(file,'utf8');let html=original;
    for(const [id,label] of Object.entries(headingAnchors[route] || {})){
      if(html.includes(`id="${id}"`))continue;
      html=html.replace(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi,(whole,level,attrs,body)=>!/(?:^|\s)id=/.test(attrs)&&visible(body)===label?`<h${level}${attrs} id="${id}">${body}</h${level}>`:whole);
    }
    if(!rel.startsWith('api/') && !/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
      const normalized=uniqueContentIds(html);html=normalized.html;
      if(normalized.changes.length)report.uniqueIds.push({route,changes:normalized.changes});
      html=html.replace(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/i,(_,start,body,end)=>{
        const count=(body.match(/<h1\b/gi)||[]).length;
        if(count>1){let n=0;body=body.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi,(block,attrs,text)=>++n===1?block:`<h2${attrs}>${text}</h2>`);report.headings.push({route,action:'subordinate embedded document headings',count});}
        return start+body+end;
      });
    }
    const ids=new Set();outsideRaw(html,part=>{for(const match of part.matchAll(/\sid=["']([^"']+)["']/g))ids.add(decode(match[1]));return part;});
    pages.set(route,{file,route,rel,html,original,ids});
  }
  const aliases=options.aliases ?? JSON.parse(fs.readFileSync('content/site/fragment-aliases.json','utf8'));
  function addAlias(page,alias,target){
    if(!page || page.ids.has(alias) || !page.ids.has(target))return false;
    const escaped=target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const pattern=new RegExp(`(<(?:h[1-6]|section|article|aside|div|p|figure)\\b[^>]*\\sid=["']${escaped}["'][^>]*>)`,'i');
    if(!pattern.test(page.html))return false;
    page.html=page.html.replace(pattern,`<span id="${esc(alias)}" class="legacy-fragment-anchor" aria-hidden="true"></span>$1`);
    page.ids.add(alias);report.fragmentAliases.push({route:page.route,alias,target});return true;
  }
  for(const [route,map] of Object.entries(aliases))for(const [alias,target] of Object.entries(map))addAlias(pages.get(route),alias,target);
  const glossary=options.glossary ?? JSON.parse(fs.readFileSync('public/data/glossary.terms.json','utf8'));
  const terms=new Map((Array.isArray(glossary)?glossary:glossary.terms).flatMap(term=>[term.termId,term.slug].filter(Boolean).map(key=>[key,term.pageUrl])));
  const renamed = new Map([
    ['/bibliothek/eintraege/journal-blog-wirkungspotenzial-warum-fakten-allein-nicht-wirken-html/','/blog/wirkungspotenzial-warum-fakten-allein-nicht-wirken.html'],
    ['/bibliothek/eintraege/journal-blog-wirkstoff-narrative-rechte-frames-wirkungspotenzial-html/','/blog/wirkstoff-narrative-rechte-frames-wirkungspotenzial.html'],
  ]);
  const pendingAliases=[];const pendingHeadingIds=[];
  for(const page of pages.values())page.html=outsideRaw(page.html,part=>part.replace(/(<a\b[^>]*\bhref=)(["'])([^"']+)\2/gi,(tag,start,quote,href)=>{
    let url;try{url=new URL(decode(href),SITE+page.route);}catch{return tag;}
    if(![SITE,'https://www.wirkungsoekonomie.de'].includes(url.origin))return tag;
    let target,fragment;try{target=decodeURIComponent(url.pathname);fragment=decodeURIComponent(url.hash.slice(1));}catch{return tag;}
    if(target.endsWith('/index.html'))target=target.slice(0,-10);
    let replacement;
    if(target==='/glossar.html' && fragment){
      const legacy={
        'wirkungspfad':'wirkpfad', 'kausalitaet-zurechnung':'kausalitaet-und-zurechnung',
        'nicht-kompensation':'nichtkompensationsprinzip', 'medikamenten-analogie':'wirkstoff',
        'transitionsrisiko':'transition-risk', 'physisches-klimarisiko':'klimarisiko',
      };
      const key=fragment.replace(/^begriff-/, '');
      replacement=terms.get(legacy[key] || key);
      if(['externe-quellen-glossar','daten-standards-glossar'].includes(fragment))replacement='/quellen/';
    }
    if(target==='/wirkungsradar/muster/' && fragment==='verantwortungsdiffusion')replacement='/begriffe/verantwortungsdiffusion/';
    if(target==='/erleben/wirkungssteuer-beispiele/' && ['apfel','t-shirt'].includes(fragment))replacement=fragment==='apfel'?'/bibliothek/beispiel-apfel-wirkungssteuer/':'/bibliothek/apfel-t-shirt-wirkung-im-preis/';
    if(renamed.has(target))replacement=renamed.get(target);
    if(replacement && pages.has(replacement)){
      report.linkRewrites.push({from:page.route,previous:href,target:replacement});return `${start}${quote}${esc(replacement)}${quote}`;
    }
    const destination=pages.get(target);
    if(fragment && destination && !destination.ids.has(fragment) && fragment.length>5){
      // Only an unambiguous spelling or heading-prefix equivalent is repaired.
      // No guessed destination and no removal of real content.
      const matches=[...destination.ids].filter(id=>fold(id)===fold(fragment) || headingKey(id)===headingKey(fragment));
      if(matches.length===1)pendingAliases.push([destination,fragment,matches[0]]);
      if(matches.length===0){
        const headings=[...destination.html.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi)].filter(match=>!/(?:^|\s)id=/.test(match[2]) && headingKey(headingSlug(match[3]))===headingKey(fragment));
        if(headings.length===1)pendingHeadingIds.push([destination,fragment,headings[0][0]]);
      }
    }
    return tag;
  }));
  for(const [page,id,heading] of pendingHeadingIds)if(!page.ids.has(id) && page.html.includes(heading)){
    page.html=page.html.replace(heading,heading.replace(/<h([1-6])\b/,`<h$1 id="${esc(id)}"`));page.ids.add(id);report.fragmentAliases.push({route:page.route,alias:id,target:'matching heading without an ID'});
  }
  for(const args of pendingAliases)addAlias(...args);
  for(const page of pages.values()){
    const normalized=normalizeStaticNavigation(page.html,page.ids);page.html=normalized.html;
    for(const item of normalized.removedToc)report.staleTocEntries.push({route:page.route,...item});
    if(normalized.duplicateButtons)report.duplicateDownloadButtons.push({route:page.route,count:normalized.duplicateButtons});
  }
  const groups=new Map();
  for(const page of pages.values()){
    if(!/^(bibliothek\/|wirkungsradar\/)/.test(page.rel) || /noindex|http-equiv=["']refresh/i.test(page.html.slice(0,page.html.indexOf('</head>'))))continue;
    const main=page.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];if(!main || /<(input|form|textarea|canvas)\b/i.test(main))continue;
    const text=visible(main);if(text.split(' ').length<100)continue;
    const key=crypto.createHash('sha256').update(text).digest('hex');const group=groups.get(key)||[];group.push(page);groups.set(key,group);
  }
  const excluded=new Set();
  function rank(page){return (page.route.includes('/live/')?-100:0)+(page.route.includes('/antwort-playbooks/')?-80:0)+(page.route.includes('download-or-document-assets-')?-50:0)+(page.route.includes('download-or-document-docs-')?50:0);}
  for(const group of groups.values()){
    if(group.length<2)continue;group.sort((a,b)=>rank(a)-rank(b)||a.route.localeCompare(b.route,'en'));
    const primary=group[0];
    for(const duplicate of group.slice(1)){
      duplicate.html=duplicate.html.replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/i,`<link rel="canonical" href="${SITE}${primary.route}">`);
      duplicate.html=duplicate.html.replace(/<meta\b[^>]*name=["']robots["'][^>]*>/gi,'').replace('</head>','<meta name="robots" content="noindex, follow">\n</head>');
      excluded.add(duplicate.route);report.duplicates.push({duplicate:duplicate.route,canonical:primary.route,basis:'identical complete visible main text; original page and anchors retained'});
    }
  }
  for(const page of pages.values())if(page.html!==page.original)fs.writeFileSync(page.file,page.html);
  const indexFile=path.join(root,'assets/search/search-index.json');
  const index=JSON.parse(fs.readFileSync(indexFile,'utf8'));const filtered=index.filter(entry=>{try{return !excluded.has(new URL(entry.url,SITE).pathname);}catch{return true;}});
  if(filtered.length!==index.length)fs.writeFileSync(indexFile,JSON.stringify(filtered));
  const sitemap=path.join(root,'sitemap.xml');if(fs.existsSync(sitemap))fs.writeFileSync(sitemap,fs.readFileSync(sitemap,'utf8').replace(/<url\b[^>]*>[\s\S]*?<\/url>/g,block=>{const value=block.match(/<loc>(.*?)<\/loc>/)?.[1];return value && excluded.has(new URL(value).pathname)?'':block;}));
  const reportFile=options.reportFile ?? 'reports/site-review-normalization.json';
  fs.mkdirSync(path.dirname(reportFile),{recursive:true});fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
  console.log(`Public content: ${report.linkRewrites.length} direct links, ${report.fragmentAliases.length} restored anchors, ${report.uniqueIds.length} pages with distinct content IDs, ${report.duplicates.length} duplicate pages consolidated, ${index.length-filtered.length} redundant search records removed.`);
  return report;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))normalizePublicContent(path.resolve('_site'));
