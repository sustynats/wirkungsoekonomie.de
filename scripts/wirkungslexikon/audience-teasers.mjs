import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT,read,atomic} from './model.mjs';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function loadAudienceTeasers(root=ROOT){
 const items=read(path.join(root,'content/wirkungslexikon/audience-teasers.json'));
 const seen=new Set();
 for(const item of items){
  if(!/^fuer\/[a-z-]+\.html$/.test(item.path)||seen.has(item.path)||!/^\/wirkungslexikon\/[a-z-]+\/$/.test(item.href)||['title','text','label'].some(k=>typeof item[k]!=='string'||!item[k].trim()))throw Error('Ungültiger Zielgruppen-Teaser');
  seen.add(item.path);
 }
 return items;
}
export function applyAudienceTeaser(html,item){
 const block=`<section class="section section-muted" data-wl-audience-teaser="true" aria-labelledby="wirkungslexikon-teaser-title"><div class="section-header"><p class="hero-kicker">Ergänzendes Nachschlagewerk</p><h2 id="wirkungslexikon-teaser-title">${esc(item.title)}</h2><p>${esc(item.text)}</p><p><a class="btn btn-secondary" href="${esc(item.href)}">${esc(item.label)}</a></p></div></section>`;
 const pattern=/<section\b(?=[^>]*\bdata-wl-audience-teaser="true")[^>]*>[\s\S]*?<\/section>/g;
 const matches=[...html.matchAll(pattern)];if(matches.length>1)throw Error('Doppelter Zielgruppen-Teaser');
 const previous=matches[0]?.[0]||'';
 if(!previous&&!html.includes('</main>'))throw Error('Zielgruppen-Seite ohne Hauptinhalt');
 return {html:previous?html.replace(previous,block):html.replace('</main>',block+'</main>'),before:previous,after:block};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.resolve(process.argv[2]||ROOT);const items=loadAudienceTeasers();
 for(const item of items){const file=path.join(root,item.path);atomic(file,applyAudienceTeaser(fs.readFileSync(file,'utf8'),item).html);}
 console.log('Ergänzende Lexikon-Teaser auf '+items.length+' bestehenden Zielgruppen-Seiten aktualisiert.');
}
