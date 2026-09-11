const API='/wirkungsticker/data/app/';
const VIEW_KEY='woek:wirkungsticker:feed-view:v1';
const words=text=>String(text||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ß/g,'ss').match(/[a-z0-9]{2,}/g)||[];
const bucket=word=>{let n=0;for(const c of word)n=(n*31+c.charCodeAt(0))>>>0;return String(n%128);};
const main=document.querySelector('[data-ticker-app]');
if(main) boot(main);
async function boot(root){
 const mode=root.dataset.tickerApp,grid=root.querySelector('[data-app-grid]'),status=root.querySelector('[data-app-status]'),more=root.querySelector('[data-app-more]');
 const query=root.querySelector('input[name=q]');
 const cache=new Map();let manifest,epoch=0,page=0,busy=false,done=false,ids=[],filter='alle',term='',abort;
 const stateKey=()=>`woek:ticker-app:v1:${location.pathname}${location.search}`;
 const readStore=()=>{try{return JSON.parse(sessionStorage.getItem(stateKey())||'null');}catch{return null;}};
 function saveState(){try{if(grid.innerHTML.length<1500000)sessionStorage.setItem(stateKey(),JSON.stringify({revision:manifest?.revision,page,done,ids,html:grid.innerHTML,scroll:scrollY}));}catch{}}
 function setView(value){const compact=value!=='detailed';grid.classList.toggle('news-grid--compact',compact);root.querySelectorAll('[data-app-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.appView===(compact?'compact':'detailed'))));}
 let view='compact';try{view=localStorage.getItem(VIEW_KEY)||view;}catch{}setView(view);
 root.querySelectorAll('[data-app-view]').forEach(b=>b.addEventListener('click',()=>{setView(b.dataset.appView);try{localStorage.setItem(VIEW_KEY,b.dataset.appView);}catch{}}));
 async function json(file,signal){if(cache.has(file))return cache.get(file);const r=await fetch(API+file,{cache:'no-cache',signal});if(!r.ok)throw Error('HTTP_'+r.status);const data=await r.json();cache.set(file,data);return data;}
 const controls=()=>{document.dispatchEvent(new CustomEvent('wirkungsraum:content-added'));};
 function info(text){status.textContent=text;}
 function updateMore(){more.hidden=done;more.disabled=busy;more.textContent=busy?'Wird geladen …':'Weitere Beiträge laden';}
 async function chooseIds(signal){
  if(mode==='merkzettel'){
   const saved=window.WoekUserSpace?.getItems('saved_items')||[];
   return saved.map(s=>{try{const url=new URL(s.url,location.origin).pathname.replace(/\/index\.html$/,'/').replace(/\/?$/,'/');return {...manifest.lookup[url],saved_at:s.saved_at};}catch{return {};}}).filter(r=>r.id&&(filter==='alle'||r.type===filter)).sort((a,b)=>String(b.saved_at||b.date).localeCompare(a.saved_at||a.date)).map(r=>r.id);
  }
  const tokens=[...new Set(words(term).map(w=>w.slice(0,36)))].slice(0,8);
  if(!tokens.length)return [];
  const lists=await Promise.all(tokens.map(async token=>(await json('search/'+bucket(token)+'.json',signal))[token]||[]));
  const selected=lists.reduce((a,b)=>{const set=new Set(b);return a.filter(id=>set.has(id));});
  const meta=new Map(Object.values(manifest.lookup).map(r=>[r.id,r]));
  return selected.filter(id=>filter==='alle'||meta.get(id)?.type===filter).sort((a,b)=>String(meta.get(b)?.date).localeCompare(meta.get(a)?.date));
 }
 async function load({refreshRevision=true}={}){
  if(busy||done)return;const ticket=epoch;busy=true;updateMore();
  try{
   let items,nextDone;
   if(mode==='news'||mode==='analysen'){
    const feed=manifest.feeds[mode+'-'+filter];
    if(!feed||page>=feed.pages){items=[];nextDone=true;}
    else{const data=await json('feeds/'+mode+'-'+filter+'-'+page+'.json',abort.signal);if(data.revision!==manifest.revision)throw Error('REVISION_CHANGED');items=data.items;nextDone=page+1>=feed.pages;}
   }else{items=await Promise.all(ids.slice(page*20,(page+1)*20).map(id=>json('items/'+id+'.json',abort.signal)));nextDone=(page+1)*20>=ids.length;}
   if(ticket!==epoch)return;
   done=nextDone;
   grid.insertAdjacentHTML('beforeend',items.map(item=>item.html).join(''));
   page++;controls();
   const count=grid.querySelectorAll('[data-news-card]').length;
   info(count?`${count} ${count===1?'Beitrag':'Beiträge'}${done?' · Keine weiteren Beiträge':''}`:mode==='merkzettel'?'Noch nichts gespeichert. Tippe bei einem Beitrag auf das Lesezeichen, um ihn hier wiederzufinden.':mode==='suche'&&!words(term).length?'Gib mindestens zwei Zeichen ein.':'Keine passenden Beiträge.');
  }catch(e){if(ticket===epoch&&e.message==='REVISION_CHANGED'&&refreshRevision){cache.clear();try{const current=await json('manifest.json',abort.signal);if(ticket!==epoch)return;manifest=current;await reset({refreshRevision:false});return;}catch(refreshError){if(refreshError.name==='AbortError')return;}}if(ticket===epoch&&e.name!=='AbortError'){info('Die Beiträge konnten nicht geladen werden. Bitte erneut versuchen.');more.textContent='Erneut versuchen';more.hidden=false;}}
  finally{if(ticket===epoch){busy=false;updateMore();if(status.textContent.includes('erneut versuchen'))more.textContent='Erneut versuchen';}}
 }
 async function reset({restore=false,scroll=false,refreshRevision=true}={}){
  epoch++;abort?.abort();abort=new AbortController();const ticket=epoch;busy=false;done=false;page=0;
  const params=new URLSearchParams(location.search);filter=params.get(mode==='news'?'ressort':'typ')||'alle';
  if(!root.querySelector(`[data-app-filter="${CSS.escape(filter)}"]`))filter='alle';
  term=params.get('q')||'';if(query)query.value=term;
  root.querySelectorAll('[data-app-filter]').forEach(a=>{a.setAttribute('aria-current',String(a.dataset.appFilter===filter));const p=new URLSearchParams(location.search);p.set(mode==='news'?'ressort':'typ',a.dataset.appFilter);a.href='?'+p;});
  const stored=restore?readStore():null;
  if(stored?.revision===manifest.revision&&mode!=='merkzettel'){
   grid.innerHTML=stored.html;page=stored.page;done=stored.done;ids=stored.ids||[];controls();info(`${grid.querySelectorAll('[data-news-card]').length} Beiträge`);updateMore();requestAnimationFrame(()=>window.scrollTo(0,stored.scroll));return;
  }
  grid.replaceChildren();info('Wird geladen …');if(scroll)window.scrollTo({top:root.querySelector('.ticker-app-toolbar').offsetTop-60,behavior:'instant'});
  try{const nextIds=['suche','merkzettel'].includes(mode)?await chooseIds(abort.signal):[];if(ticket!==epoch)return;ids=nextIds;await load({refreshRevision});}catch(e){if(ticket===epoch&&e.name!=='AbortError')info('Die Suche ist gerade nicht erreichbar. Bitte erneut versuchen.');}
 }
 function navigate(params){saveState();history.pushState(null,'','?'+params);reset({scroll:true});}
 root.querySelectorAll('[data-app-filter]').forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey)return;e.preventDefault();const params=new URLSearchParams(location.search);params.set(mode==='news'?'ressort':'typ',a.dataset.appFilter);navigate(params);}));
 let timer;function search(){const params=new URLSearchParams(location.search);if(query.value.trim())params.set('q',query.value.trim());else params.delete('q');navigate(params);}
 query?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(search,350);});
 root.querySelector('form[role=search]')?.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);search();});
 window.addEventListener('popstate',()=>reset({restore:true}));
 window.addEventListener('pagehide',saveState);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)saveState();});
 root.addEventListener('click',e=>{if(e.target.closest('a[href]'))saveState();});
 more.addEventListener('click',async()=>{if(!manifest){await initialize();return;}if(!page&&['suche','merkzettel'].includes(mode))await reset();else await load();});
 if(mode==='merkzettel')document.addEventListener('wirkungsraum:changed',()=>reset());
 async function initialize(){try{manifest=await json('manifest.json');await reset({restore:true});}catch{info('Der Feed ist gerade nicht erreichbar. Bitte erneut versuchen.');more.textContent='Erneut versuchen';more.hidden=false;}}
 await initialize();
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(manifest&&entries.some(e=>e.isIntersecting)&&!status.textContent.includes('erneut versuchen'))load();},{rootMargin:'350px'});observer.observe(root.querySelector('[data-app-sentinel]'));}
}
