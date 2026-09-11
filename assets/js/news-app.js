import {searchWords, findSearchIds, matchesFilters} from './ticker-search.js?v=20260912-search2';
const API='/wirkungsticker/data/app/';
const VIEW_KEY='woek:wirkungsticker:feed-view:v1';
const main=document.querySelector('[data-ticker-app]');
if(main) boot(main);
async function boot(root){
 const mode=root.dataset.tickerApp,grid=root.querySelector('[data-app-grid]'),status=root.querySelector('[data-app-status]'),more=root.querySelector('[data-app-more]');
 const query=root.querySelector('input[name=q]'),filterMenu=root.querySelector('.ticker-app-filter-menu'),filterForm=root.querySelector('[data-app-filter-form]');
 const cache=new Map();let manifest,lookup,epoch=0,page=0,busy=false,done=false,ids=[],type='alle',topic='alle',sort='relevanz',term='',abort;
 const stateKey=()=>`woek:ticker-app:v2:${location.pathname}${location.search}`;
 const readStore=()=>{try{return JSON.parse(sessionStorage.getItem(stateKey())||'null');}catch{return null;}};
 function saveState(){try{if(grid.innerHTML.length<1500000)sessionStorage.setItem(stateKey(),JSON.stringify({revision:manifest?.revision,page,done,ids,html:grid.innerHTML,scroll:scrollY}));}catch{}}
 function setView(value){const compact=value!=='detailed';grid.classList.toggle('news-grid--compact',compact);root.querySelectorAll('[data-app-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.appView===(compact?'compact':'detailed'))));}
 let view='compact';try{view=localStorage.getItem(VIEW_KEY)||view;}catch{}setView(view);
 root.querySelectorAll('[data-app-view]').forEach(b=>b.addEventListener('click',()=>{setView(b.dataset.appView);try{localStorage.setItem(VIEW_KEY,b.dataset.appView);}catch{}}));
 async function json(file,signal){if(cache.has(file))return cache.get(file);const r=await fetch(API+file,{cache:'no-cache',signal});if(!r.ok)throw Error('HTTP_'+r.status);const data=await r.json();cache.set(file,data);return data;}
 function setManifest(data){manifest=data;lookup=new Map(Object.values(manifest.lookup).map(r=>[r.id,r]));}
 const controls=()=>{document.dispatchEvent(new CustomEvent('wirkungsraum:content-added'));};
 function info(text){status.textContent=text;}
 function updateMore(){more.hidden=done;more.disabled=busy;more.textContent=busy?'Wird geladen …':'Weitere Beiträge laden';}
 const indexed=()=>mode==='suche'||mode==='merkzettel'||(mode==='analysen'&&topic!=='alle');
 function showCount(){
  const count=grid.querySelectorAll('[data-news-card]').length;
  const total=indexed()?ids.length:manifest.feeds[(mode==='news'?'news-'+topic:'analysen-'+type)]?.count||0;
  if(mode==='suche'&&term.trim()&&!searchWords(term).length){info('Bitte mindestens zwei Buchstaben oder Ziffern eingeben.');return;}
  if(count)info(mode==='suche'?`${count} von ${total} Treffern${term?` für „${term}“`:''}`:`${count} von ${total} Beiträgen`);
  else info(mode==='merkzettel'?'Noch nichts gespeichert oder kein Beitrag passt zu Deinen Filtern. Tippe bei einem Beitrag auf das Lesezeichen, um ihn hier wiederzufinden.':`Keine passenden Beiträge${term?` für „${term}“`:''}. Ändere den Suchbegriff oder setze die Filter zurück.`);
 }
 async function chooseIds(signal){
  if(mode==='suche'&&term.trim()&&!searchWords(term).length)return [];
  if(mode==='merkzettel'){
   const saved=window.WoekUserSpace?.getItems('saved_items')||[];
   return saved.map(s=>{try{const url=new URL(s.url,location.origin).pathname.replace(/\/index\.html$/,'/').replace(/\/?$/,'/');return {...manifest.lookup[url],saved_at:s.saved_at};}catch{return {};}}).filter(r=>r.id&&matchesFilters(r,{type,topic,mode})).sort((a,b)=>String(b.saved_at||b.date).localeCompare(a.saved_at||a.date)).map(r=>r.id);
  }
  return findSearchIds({term:mode==='suche'?term:'',lookup,type,topic,mode,sort,loadBucket:key=>json('search/'+key+'.json',signal)});
 }
 async function load({refreshRevision=true}={}){
  if(busy||done)return;const ticket=epoch;busy=true;updateMore();
  try{
   let items,nextDone;
   if(!indexed()){
    const key=mode==='news'?'news-'+topic:'analysen-'+type,feed=manifest.feeds[key];
    if(!feed||page>=feed.pages){items=[];nextDone=true;}
    else{const data=await json('feeds/'+key+'-'+page+'.json',abort.signal);if(data.revision!==manifest.revision)throw Error('REVISION_CHANGED');items=data.items;nextDone=page+1>=feed.pages;}
   }else{items=await Promise.all(ids.slice(page*20,(page+1)*20).map(id=>json('items/'+id+'.json',abort.signal)));nextDone=(page+1)*20>=ids.length;}
   if(ticket!==epoch)return;
   done=nextDone;grid.insertAdjacentHTML('beforeend',items.map(item=>item.html).join(''));page++;controls();showCount();
  }catch(e){
   if(ticket===epoch&&e.message==='REVISION_CHANGED'&&refreshRevision){cache.clear();try{const current=await json('manifest.json',abort.signal);if(ticket!==epoch)return;setManifest(current);await reset({refreshRevision:false});return;}catch(refreshError){if(refreshError.name==='AbortError')return;}}
   if(ticket===epoch&&e.name!=='AbortError'){info('Die Beiträge konnten nicht geladen werden. Bitte erneut versuchen.');more.textContent='Erneut versuchen';more.hidden=false;}
  }finally{if(ticket===epoch){busy=false;updateMore();if(status.textContent.includes('erneut versuchen'))more.textContent='Erneut versuchen';}}
 }
 function selected(name,value){const select=filterForm?.elements.namedItem(name);return select&&[...select.options].some(o=>o.value===value)?value:'alle';}
 async function reset({restore=false,scroll=false,refreshRevision=true}={}){
  epoch++;abort?.abort();abort=new AbortController();const ticket=epoch;busy=false;done=false;page=0;
  const params=new URLSearchParams(location.search);
  type=mode==='news'?'alle':selected('typ',params.get('typ')||'alle');topic=selected('ressort',params.get('ressort')||'alle');sort=params.get('sort')==='neueste'?'neueste':'relevanz';
  term=(params.get('q')||'').slice(0,160);if(query&&(document.activeElement!==query||restore))query.value=term;
  for(const [name,value] of Object.entries({typ:type,ressort:topic,sort}))if(filterForm?.elements.namedItem(name))filterForm.elements.namedItem(name).value=value;
  root.querySelector('[data-app-filter-count]').textContent=type!=='alle'||topic!=='alle'?` (${Number(type!=='alle')+Number(topic!=='alle')})`:'';
  root.querySelectorAll('[data-app-filter]').forEach(a=>{const key=mode==='news'?'ressort':'typ';a.setAttribute('aria-current',String(a.dataset.appFilter===(mode==='news'?topic:type)));const p=new URLSearchParams(location.search);p.set(key,a.dataset.appFilter);a.href='?'+p;});
  const chips=root.querySelector('.ticker-app-filters'),active=chips.querySelector('[aria-current=true]');
  if(active)chips.scrollLeft=Math.max(0,active.offsetLeft-chips.offsetLeft-8);
  const stored=restore?readStore():null;
  if(stored?.revision===manifest.revision&&(stored.page>0||stored.done)&&mode!=='merkzettel'){
   grid.innerHTML=stored.html;page=stored.page;done=stored.done;ids=stored.ids||[];controls();showCount();updateMore();requestAnimationFrame(()=>window.scrollTo({top:stored.scroll,behavior:'instant'}));return;
  }
  grid.replaceChildren();busy=true;info('Wird geladen …');updateMore();
  if(scroll){const toolbar=root.querySelector('.ticker-app-toolbar');window.scrollTo({top:toolbar.getBoundingClientRect().top+scrollY-parseFloat(getComputedStyle(toolbar).top),behavior:'instant'});}
  try{const nextIds=indexed()?await chooseIds(abort.signal):[];if(ticket!==epoch)return;ids=nextIds;busy=false;await load({refreshRevision});}
  catch(e){if(ticket===epoch&&e.name!=='AbortError'){busy=false;info('Die Suche ist gerade nicht erreichbar. Bitte erneut versuchen.');more.hidden=false;more.disabled=false;more.textContent='Erneut versuchen';}}
 }
 function navigate(params,{replace=false,scroll=true}={}){saveState();history[replace?'replaceState':'pushState'](null,'','?'+params);reset({scroll});}
 let timer;
 root.querySelectorAll('[data-app-filter]').forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();clearTimeout(timer);const params=new URLSearchParams(location.search);params.set(mode==='news'?'ressort':'typ',a.dataset.appFilter);if(query){if(query.value.trim())params.set('q',query.value.trim());else params.delete('q');}navigate(params);}));
 filterForm?.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);const params=new URLSearchParams(location.search);for(const key of ['typ','ressort','sort']){const value=filterForm.elements.namedItem(key)?.value;if(value&&value!=='alle'&&value!=='relevanz')params.set(key,value);else params.delete(key);}if(query){if(query.value.trim())params.set('q',query.value.trim());else params.delete('q');}filterMenu.open=false;navigate(params);filterMenu.querySelector('summary').focus();});
 root.querySelector('[data-app-clear-filters]')?.addEventListener('click',()=>{clearTimeout(timer);const p=new URLSearchParams(location.search);['typ','ressort','sort'].forEach(k=>p.delete(k));if(query){if(query.value.trim())p.set('q',query.value.trim());else p.delete('q');}filterMenu.open=false;navigate(p);filterMenu.querySelector('summary').focus();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&filterMenu?.open){filterMenu.open=false;filterMenu.querySelector('summary').focus();}});
 document.addEventListener('click',e=>{if(filterMenu?.open&&!filterMenu.contains(e.target))filterMenu.open=false;});
 function fitFilterPanel(){
  if(!filterMenu?.open)return;
  const panel=filterForm,nav=document.querySelector('.ticker-app-nav'),viewport=window.visualViewport;
  const viewportBottom=viewport?viewport.offsetTop+viewport.height:window.innerHeight;
  const bottom=nav&&getComputedStyle(nav).position==='fixed'?Math.min(viewportBottom,nav.getBoundingClientRect().top):viewportBottom;
  panel.style.maxHeight=Math.max(96,Math.min(480,bottom-panel.getBoundingClientRect().top-12))+'px';
 }
 filterMenu?.addEventListener('toggle',fitFilterPanel);
 window.addEventListener('resize',fitFilterPanel);
 window.addEventListener('scroll',fitFilterPanel,{passive:true});
 window.visualViewport?.addEventListener('resize',fitFilterPanel);
 function search(replace=false){const params=new URLSearchParams(location.search);if(query.value.trim())params.set('q',query.value.trim());else params.delete('q');navigate(params,{replace,scroll:false});}
 query?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>search(true),350);});
 root.querySelector('form[role=search]')?.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);search();});
 window.addEventListener('popstate',()=>{clearTimeout(timer);filterMenu.open=false;reset({restore:true});});
 window.addEventListener('pagehide',saveState);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)saveState();});
 root.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(link&&!link.matches('[data-app-filter]'))saveState();});
 more.addEventListener('click',async()=>{if(!manifest){await initialize();return;}if(!page&&indexed())await reset();else await load();});
 if(mode==='merkzettel')document.addEventListener('wirkungsraum:changed',()=>reset());
 async function initialize(){try{setManifest(await json('manifest.json'));await reset({restore:true});}catch{info('Der Feed ist gerade nicht erreichbar. Bitte erneut versuchen.');more.textContent='Erneut versuchen';more.hidden=false;}}
 await initialize();
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(manifest&&entries.some(e=>e.isIntersecting)&&!status.textContent.includes('erneut versuchen'))load();},{rootMargin:'350px'});observer.observe(root.querySelector('[data-app-sentinel]'));}
}
