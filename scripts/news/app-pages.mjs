import path from 'node:path';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {escape as esc} from './editorial-markdown.mjs';
import {mixedFeedItems,feedDate} from './feed-order.mjs';
import {searchWords,searchBucket,wordVariants,indexPrefixes} from '../../assets/js/ticker-search.js';
export {searchWords,searchBucket};

export const APP_TYPES = {news:'News',analysis:'Meinung & Analyse',book:'Bücher',listened:'Nachgehört',watched:'Nachgesehen'};
export const APP_TOPICS = {alle:'Alle',politik:'Politik',wirtschaft:'Wirtschaft',gesellschaft:'Gesellschaft',technik:'Technik',klima:'Umwelt & Klima',gesundheit:'Gesundheit',wissenschaft:'Wissenschaft',international:'International'};
export const PAGE_SIZE=20;
const base='/wirkungsticker/';
export function contentType(item){return item.type==='story'?'news':item.value.format==='book_and_impact'||item.value.subtype==='book_review'?'book':['listened','watched'].includes(item.value.subtype)?item.value.subtype:'analysis';}
export function contentTopics(value){
 const patterns={politik:/politik|demokratie|recht|partei|wahl|regierung|bundestag|bundeswehr/,wirtschaft:/wirtschaft|finanz|arbeit|energie|industrie|handel|unternehmen|etat|investition|kapital/,gesellschaft:/gesellschaft|sozial|bildung|kultur|sicherheit|schule|zusammenhalt/,technik:/technik|technolog|digital|\bki\b|\bai\b|cyber|software/,klima:/klima|umwelt|energie|planet/,gesundheit:/gesundheit|medizin/,wissenschaft:/wissenschaft|forschung/,international:/international|europa|geopolitik/};
 const tags=[...(Array.isArray(value.topic)?value.topic:[]),...(Array.isArray(value.tags)?value.tags:[])].join(' ').toLowerCase();
 const match=text=>Object.entries(patterns).filter(([,re])=>re.test(text)).map(([key])=>key);
 const explicit=match(tags);
 // Personal formats do not all have editorial topic tags; use their public title/deck for navigation.
 return explicit.length?explicit:match([value.title,value.subtitle,value.teaser,value.book?.title].filter(Boolean).join(' ').toLowerCase());
}
export function appNavigation(canonical){
 const route=new URL(canonical).pathname;
 const active=route===base?'start':route.startsWith(base+'analyse/')||route===base+'analysen/'?'analysen':route===base+'merkzettel/'?'merkzettel':route===base+'news/'||!/^\/(?:wirkungsticker)\/(?:mehr|suche|quellen|methodik)\//.test(route)?'news':'mehr';
 const links=[['start','Start','⌂',''],['news','News','▤','news/'],['analysen','Analysen','◈','analysen/'],['merkzettel','Merkzettel','☆','merkzettel/'],['mehr','Mehr','⋯','mehr/']];
 return `<div class="ticker-app-header"><a href="${base}" class="ticker-app-brand">Wirkungsticker</a><a class="ticker-app-search" href="${base}suche/" aria-label="Im Wirkungsticker suchen"><span aria-hidden="true">⌕</span> Suche</a></div><nav class="ticker-app-nav" aria-label="Wirkungsticker">${links.map(([key,label,icon,url])=>`<a href="${base+url}"${active===key?' aria-current="page"':''}><span aria-hidden="true">${icon}</span><span>${label}</span></a>`).join('')}</nav>`;
}
function absoluteCard(html){return html.replace(/\b(href|src|data-news-href)="(\.\.?\/[^"<>]*)"/g,(_,attr,url)=>`${attr}="${esc(new URL(url,'https://wirkungsoekonomie.de/wirkungsticker/').pathname)}"`);}
export function appRecords(stories,analyses,storiesById,{storyCard,editorialCard}){
 return mixedFeedItems(stories,analyses).map((item,i)=>{const v=item.value,type=contentType(item),url=base+(type==='news'?'':'analyse/')+v.slug+'/';
 return {id:createHash('sha256').update(`${item.type}:${v.analysis_id||v.story_id||v.slug}`).digest('hex').slice(0,20),type,label:APP_TYPES[type],title:v.title,url,date:feedDate(v,item.type==='story'?'story':'analysis'),topics:contentTopics(v),summary:v.teaser||v.analysis?.summary||v.subtitle||'',search:[APP_TYPES[type],recordSearchText(v)].join(' '),html:absoluteCard(item.type==='story'?storyCard(v,i):editorialCard(v,storiesById.get(v.story_id),i))};});
}
export function recordSearchText(v) {
 const source=v.source_media||{}, analysis=v.analysis||{};
 // Only fields that appear in the public article or its source references; never editorial notes.
 return [v.title,v.subtitle,v.teaser,v.body_markdown?.replace(/<!--[\s\S]*?-->/g,''),v.book?.title,v.book?.author,
  ...(v.sections||[]).flatMap(s=>[s.title,s.heading,...(s.paragraphs||[])]),
  ...['summary','detail_summary','why_relevant','impact_potential','impact_risks','mechanisms','first_order','second_order','third_order','side_effects','uncertainties','watch_next'].flatMap(k=>Array.isArray(analysis[k])?analysis[k].filter(x=>typeof x==='string'):[typeof analysis[k]==='string'?analysis[k]:'']),
  ...(Array.isArray(v.topic)?v.topic:[]),...(Array.isArray(v.tags)?v.tags:[]),source.show,source.episode_title,...(source.hosts||[]),...(source.guests||[]),
  ...(v.sources||[]).flatMap(s=>{let host='';try{host=new URL(s.url).hostname;}catch{}return [s.publisher,s.title,host];})].filter(x=>typeof x==='string').join(' ');
}
function viewSwitch(){return '<div class="news-view-toggle" role="group" aria-label="Feedansicht"><button type="button" data-app-view="compact" aria-pressed="true">Kompakt</button><button type="button" data-app-view="detailed" aria-pressed="false">Ausführlich</button></div>';}
function filters(mode){
 const types=[['alle','Alle Formate'],...Object.entries(APP_TYPES).filter(([key])=>mode!=='analysen'||key!=='news')];
 const entries=mode==='news'?Object.entries(APP_TOPICS):types.map(([key,label])=>[key,key==='alle'?'Alle':label]);
 const options=list=>list.map(([key,label])=>`<option value="${key}">${esc(label)}</option>`).join('');
 return `<div class="ticker-app-filter-row"><details class="ticker-app-filter-menu"><summary>Filter<span data-app-filter-count></span></summary><form class="ticker-app-filter-panel" data-app-filter-form><strong>Beiträge filtern</strong>${mode!=='news'?`<label>Format<select name="typ">${options(types)}</select></label>`:''}<label>Ressort<select name="ressort">${options(Object.entries(APP_TOPICS).map(([k,v])=>[k,k==='alle'?'Alle Ressorts':v]))}</select></label>${mode==='suche'?'<label>Sortieren<select name="sort"><option value="relevanz">Passendste zuerst</option><option value="neueste">Neueste zuerst</option></select></label>':''}${viewSwitch()}<div class="ticker-filter-actions"><button class="btn btn-primary" type="submit">Anwenden</button><button class="btn btn-secondary" type="button" data-app-clear-filters>Zurücksetzen</button></div></form></details><div class="ticker-app-filters" role="group" aria-label="${mode==='news'?'Ressort':'Beitragsart'}">${entries.map(([key,label])=>`<a href="?${mode==='news'?'ressort':'typ'}=${key}" data-app-filter="${key}"${key==='alle'?' aria-current="true"':''}>${esc(label)}</a>`).join('')}</div></div>`;
}
export function buildAppPages({root,stories,analyses,storiesById,storyCard,editorialCard,pageShell,write,updatedAt,appTools=""}){
 const records=appRecords(stories,analyses,storiesById,{storyCard,editorialCard});
 const revision=createHash('sha256').update(JSON.stringify(records)).digest('hex').slice(0,16);
 const api=path.join(root,'wirkungsticker/data/app');
 // Only this generator owns this directory; remove obsolete public partitions.
 fs.rmSync(api,{recursive:true,force:true});
 const buckets=Array.from({length:128},()=>({}));
 for(const r of records){
  const {search,...publicRecord}=r;write(path.join(api,'items',r.id+'.json'),JSON.stringify(publicRecord));
  for(const w of new Set(searchWords(search).flatMap(wordVariants))){for(const p of indexPrefixes(w)){const bucket=buckets[Number(searchBucket(p))];bucket[p]??=[];if(!bucket[p].includes(r.id))bucket[p].push(r.id);}}
 }
 buckets.forEach((bucket,i)=>write(path.join(api,'search',i+'.json'),JSON.stringify(bucket)));
 const feeds={};
 for(const mode of ['news','analysen'])for(const key of mode==='news'?Object.keys(APP_TOPICS):['alle',...Object.keys(APP_TYPES).filter(k=>k!=='news')]){
  const selected=records.filter(r=>(mode==='news'?r.type==='news':r.type!=='news')&&(key==='alle'||(mode==='news'?r.topics.includes(key):r.type===key)));
  const prefix=mode+'-'+key;feeds[prefix]={count:selected.length,pages:Math.ceil(selected.length/PAGE_SIZE)};
  for(let i=0;i<selected.length;i+=PAGE_SIZE)write(path.join(api,'feeds',prefix+'-'+i/PAGE_SIZE+'.json'),JSON.stringify({revision,items:selected.slice(i,i+PAGE_SIZE).map(({search,...r})=>r)}));
 }
 write(path.join(api,'manifest.json'),JSON.stringify({revision,page_size:PAGE_SIZE,feeds,lookup:Object.fromEntries(records.map(r=>[r.url,{id:r.id,type:r.type,date:r.date,title:r.title,topics:r.topics}]))}));
 const routes=[];
 function page(slug,title,description,body,{noindex=false,mode=''}={}){const route=base+slug;write(path.join(root,route,'index.html'),pageShell({title,description,canonical:'https://wirkungsoekonomie.de'+route,base:slug?'../../':'../',body:`<main id="main-content" data-no-glossary data-search-content data-news-reader="list" class="ticker-app-main"${mode?` data-ticker-app="${mode}" data-app-revision="${revision}"`:''}>${body}</main>`,publicUpdatedAt:updatedAt,robots:noindex?'noindex,follow':'',extraScript:'<script type="module" src="/assets/js/news-app.js?v=20260912-search2"></script>',jsonLd:{'@context':'https://schema.org','@type':'CollectionPage',name:title,url:'https://wirkungsoekonomie.de'+route}}));if(!noindex)routes.push(route.slice(1));}
 const cardList=(list)=>list.map(r=>r.html).join('\n');
 const newestNews=records.filter(r=>r.type==='news').slice(0,4), opinion=records.filter(r=>r.type==='analysis').slice(0,3),books=records.filter(r=>r.type==='book').slice(0,2),media=records.filter(r=>['listened','watched'].includes(r.type)).slice(0,3);
 const section=(title,list,link)=>`<section class="section ticker-home-section"><div class="ticker-section-heading"><h2>${title}</h2><a href="${base+link}">Alle ansehen →</a></div><div class="news-grid">${cardList(list)}</div></section>`;
 page('','Wirkungsticker – Start','Nachrichten. Einordnen. Wirkung verstehen.',`<header class="ticker-app-title"><p class="hero-kicker">Wirkungsticker</p><h1>Nachrichten. Einordnen.<br>Wirkung verstehen.</h1><p>Was verändert sich – und was könnte daraus für Mensch, Planet und Demokratie folgen?</p><a class="btn btn-primary" href="${base}news/">Aktuelle News</a></header>${section('Aktuelle Meldungen',newestNews,'news/')}<section class="section ticker-home-explainer" id="methodik"><h2>Was macht den Wirkungsticker anders?</h2><p>Vom berichteten Ereignis zu seinen möglichen Folgen: Faktencheck, Folgencheck und begründete Wirkungspfade helfen bei der Einordnung.</p><div class="ticker-explainer-grid"><div><strong>Mensch</strong><p>Lebensbedingungen, Rechte, Gesundheit und Teilhabe.</p></div><div><strong>Planet</strong><p>Klima, Ressourcen und natürliche Lebensgrundlagen.</p></div><div><strong>Demokratie</strong><p>Kontrolle, Mitsprache und institutionelle Handlungsfähigkeit.</p></div></div><p>Ring = Status · Balken = Tragweite · +/− = Richtung</p><a href="${base}methodik/">So entsteht die Bewertung →</a></section>${section('Meinung & Analyse',opinion,'analysen/')} ${section('Buch & Wirkung',books,'analysen/?typ=book')}${section('Nachgehört & Nachgesehen',media,'analysen/?typ=listened')}<section class="section"><h2>Dein Wirkungsticker</h2><p>Beiträge auf dem <a href="${base}merkzettel/">Merkzettel</a> sammeln oder den Wirkungsticker über das Browsermenü zum Home-Bildschirm hinzufügen.</p><a href="${base}mehr/">Mehr entdecken →</a></section>`);
 for(const mode of ['news','analysen','merkzettel','suche']){
  const title={news:'News',analysen:'Analysen',merkzettel:'Merkzettel',suche:'Suche'}[mode];
  const initial=mode==='news'?records.filter(r=>r.type==='news').slice(0,PAGE_SIZE):mode==='analysen'?records.filter(r=>r.type!=='news').slice(0,PAGE_SIZE):[];
  page(mode+'/',title+' – Wirkungsticker',mode==='news'?'Aktuelle Nachrichten aus Politik, Wirtschaft, Gesellschaft und Technik.':mode==='analysen'?'Meinung & Analyse, Bücher, Nachgehört und Nachgesehen von Natalie Weber.':title+' im Wirkungsticker.',`<header class="ticker-app-title"><h1>${title}</h1>${mode==='merkzettel'?'<p>Deine gespeicherten Beiträge – auf diesem Gerät auch ohne Anmeldung.</p>':''}</header><div class="ticker-app-toolbar">${mode==='suche'?`<form class="ticker-app-search-form" role="search"><label for="ticker-query">Wirkungsticker durchsuchen</label><div><input id="ticker-query" name="q" type="search" placeholder="Thema, Titel oder Sendung" autocomplete="off" maxlength="160"><button type="submit" class="btn btn-primary" aria-label="Suchen"><span aria-hidden="true">⌕</span></button></div></form>`:''}${filters(mode)}</div><section class="section ticker-app-feed"><p data-app-status role="status" aria-live="polite"></p><div class="news-grid news-grid--compact" data-app-grid>${cardList(initial)}</div><div data-app-sentinel aria-hidden="true"></div><button class="btn btn-secondary ticker-load-more" data-app-more type="button">Weitere Beiträge laden</button><noscript><p>Zum fortlaufenden Nachladen und Filtern bitte JavaScript aktivieren. Alle Beiträge sind auch über <a href="${base}feed.xml">RSS</a> erreichbar.</p></noscript></section>`,{noindex:['suche','merkzettel'].includes(mode),mode});
 }
 page('mehr/','Mehr – Wirkungsticker','Formate, Methodik und Hintergründe des Wirkungstickers.',`<header class="ticker-app-title"><h1>Mehr entdecken</h1></header><section class="section ticker-more-links">${[['Buch & Wirkung',base+'analysen/?typ=book'],['Nachgehört',base+'analysen/?typ=listened'],['Nachgesehen',base+'analysen/?typ=watched'],['Methodik',base+'methodik/'],['Quellen & Auswahl',base+'quellen/'],['Über den Wirkungsticker','/institut/projekte/wirkungsticker/'],['Wirkungsökonomie erklärt','/so-wirkt-wirkungsoekonomie/'],['Über die Wirkungsökonomie','/ueber-die-woek/'],['Alle Inhalte durchsuchen',base+'suche/']].map(([name,url])=>`<a href="${url}">${name}<span aria-hidden="true">→</span></a>`).join('')}</section><div class="section"><button class="btn btn-secondary" type="button" data-news-refresh-button>Aktualisieren</button><span data-news-refresh-status role="status"></span></div>${absoluteCard(appTools)}`);
 return routes;
}
