import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as search from '../../assets/js/ticker-search.js';
const client=fs.readFileSync(new URL('../../assets/js/news-app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function element(dataset={}){return {dataset,hidden:false,disabled:false,textContent:'',innerHTML:'',events:{},classList:{toggle(){}},setAttribute(){},addEventListener(k,fn){this.events[k]=fn;}};}
function harness(fetcher,{mode='news',initialQuery=''}={}){
 const grid=element(),status=element(),more=element(),filters=['alle','technik'].map(appFilter=>element({appFilter}));
 grid.replaceChildren=()=>{grid.innerHTML='';};grid.insertAdjacentHTML=(_,html)=>{grid.innerHTML+=html;};grid.querySelectorAll=()=>Array.from(grid.innerHTML.matchAll(/data-news-card/g));
 const form=element();form.elements={namedItem:name=>name==='ressort'?{value:'alle',options:[{value:'alle'},{value:'technik'}]}:null};
 const menu=element();menu.querySelector=()=>({focus(){}});
 const chips={querySelector:()=>null,offsetLeft:0};
 const query=element();query.value=initialQuery;const searchForm=element();
 const root=element({tickerApp:mode});root.querySelectorAll=selector=>selector==='[data-app-filter]'?filters:[];
 root.querySelector=selector=>({'[data-app-grid]':grid,'[data-app-status]':status,'[data-app-more]':more,'.ticker-app-toolbar':{getBoundingClientRect:()=>({top:60})},'.ticker-app-filter-menu':menu,'[data-app-filter-form]':form,'[data-app-filter-count]':element(),'.ticker-app-filters':chips,'input[name=q]':mode==='suche'?query:null,'form[role=search]':mode==='suche'?searchForm:null}[selector]||filters.find(f=>selector===`[data-app-filter="${f.dataset.appFilter}"]`)||null);
 const location={pathname:`/wirkungsticker/${mode}/`,search:initialQuery?'?q='+initialQuery:'',origin:'https://example.test'};
 const events={},store=new Map(),historyEntries=[''];let historyIndex=0;
 let intersect=()=>{};
 const window={addEventListener(k,fn){events[k]=fn;},scrollTo(){},IntersectionObserver:true};
 const sandbox={...search,getComputedStyle:()=>({top:'54px'}),document:{querySelector:()=>null,addEventListener(){},dispatchEvent(){}},window,location,history:{pushState(_s,_t,url){location.search=url;historyEntries.splice(++historyIndex);historyEntries.push(url);},replaceState(_s,_t,url){location.search=url;historyEntries[historyIndex]=url;}},fetch:async(url,opts)=>({ok:true,json:()=>fetcher(url.replace('/wirkungsticker/data/app/',''),opts)}),AbortController,URL,URLSearchParams,CSS:{escape:String},CustomEvent:class{},localStorage:{getItem:()=>null,setItem(){}},sessionStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},requestAnimationFrame:fn=>fn(),setTimeout,clearTimeout,scrollY:0};
 sandbox.IntersectionObserver=class{constructor(callback){intersect=()=>callback([{isIntersecting:true}]);}observe(){}};
 vm.runInNewContext(client+';globalThis.testBoot=boot;',sandbox);
 return {start:()=>sandbox.testBoot(root),intersect:()=>intersect(),back:()=>{location.search=historyEntries[--historyIndex];events.popstate();},search:value=>{query.value=value;searchForm.events.submit({preventDefault(){}});},grid,status,more,filter:name=>filters.find(f=>f.dataset.appFilter===name).events.click({preventDefault(){}})};
}
const manifest=revision=>({revision,feeds:{'news-alle':{pages:2},'news-technik':{pages:2}},lookup:{}});
const packet=(revision,label)=>({revision,items:[{html:`<article data-news-card>${label}</article>`}]});
test('a late response from the old filter cannot finish the new feed',async()=>{
 let resolveOld;const old=new Promise(resolve=>{resolveOld=resolve;});
 const app=harness(file=>file==='manifest.json'?manifest('v1'):file==='feeds/news-alle-1.json'?old:packet('v1',file));
 await app.start();const loading=app.more.events.click();app.filter('technik');await tick();
 resolveOld(packet('v1','STALE'));await loading;await tick();
 assert.doesNotMatch(app.grid.innerHTML,/STALE/);assert.match(app.grid.innerHTML,/news-technik-0/);
 assert.equal(app.more.hidden,false);await app.more.events.click();assert.match(app.grid.innerHTML,/news-technik-1/);assert.equal(app.more.hidden,true);
});
test('a new publication refreshes the manifest once and restarts a consistent feed',async()=>{
 let manifestReads=0,feedReads=0;
 const app=harness(file=>file==='manifest.json'?manifest(++manifestReads===1?'v1':'v2'):(feedReads++,packet('v2','CURRENT')));
 await app.start();assert.equal(manifestReads,2);assert.equal(feedReads,2);assert.match(app.grid.innerHTML,/CURRENT/);assert.doesNotMatch(app.status.textContent,/erneut versuchen/);
});
test('a persistently inconsistent deployment stops retrying and leaves an actionable error',async()=>{
 let manifestReads=0,feedReads=0;
 const app=harness(file=>file==='manifest.json'?(manifestReads++,manifest('v1')):(feedReads++,packet('v2','INCONSISTENT')));
 await app.start();assert.equal(manifestReads,2);assert.equal(feedReads,2);assert.equal(app.grid.innerHTML,'');assert.equal(app.more.hidden,false);assert.equal(app.more.textContent,'Erneut versuchen');
});
test('back restores the previous filter with its already loaded pages',async()=>{
 const app=harness(file=>file==='manifest.json'?manifest('v1'):packet('v1',file));
 await app.start();await app.more.events.click();assert.equal(app.more.hidden,true);
 app.filter('technik');await tick();assert.match(app.grid.innerHTML,/news-technik-0/);
 app.back();await tick();assert.match(app.grid.innerHTML,/news-alle-0/);assert.match(app.grid.innerHTML,/news-alle-1/);
 assert.doesNotMatch(app.grid.innerHTML,/news-technik/);assert.equal(app.more.hidden,true);
});
test('loading more cannot reuse old result IDs while the next search is pending',async()=>{
 let resolveNew;const pending=new Promise(resolve=>{resolveNew=resolve;});
 const rows=Array.from({length:21},(_,i)=>({id:String(i),type:'news',date:'2026-09-11',title:'Alpha',topics:[]}));
 const app=harness(file=>file==='manifest.json'?{revision:'v1',feeds:{},lookup:Object.fromEntries(rows.map(r=>['/'+r.id,r]))}
  :file==='search/'+search.searchBucket('alpha')+'.json'?{alpha:rows.map(r=>r.id)}
  :file==='search/'+search.searchBucket('beta')+'.json'?pending
  :{html:`<article data-news-card>${file}</article>`},{mode:'suche',initialQuery:'alpha'});
 await app.start();assert.match(app.grid.innerHTML,/items\/0/);
 app.search('beta');await tick();assert.equal(app.more.disabled,true);
 app.intersect();await tick();assert.equal(app.grid.innerHTML,'');
 resolveNew({beta:['20']});await tick();await tick();
 assert.match(app.grid.innerHTML,/items\/20/);assert.doesNotMatch(app.grid.innerHTML,/items\/0/);
 assert.equal(app.more.hidden,true);
});
