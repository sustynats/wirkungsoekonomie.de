import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const client=fs.readFileSync(new URL('../../assets/js/news-app.js',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function element(dataset={}){return {dataset,hidden:false,disabled:false,textContent:'',innerHTML:'',events:{},classList:{toggle(){}},setAttribute(){},addEventListener(k,fn){this.events[k]=fn;}};}
function harness(fetcher){
 const grid=element(),status=element(),more=element(),filters=['alle','technik'].map(appFilter=>element({appFilter}));
 grid.replaceChildren=()=>{grid.innerHTML='';};grid.insertAdjacentHTML=(_,html)=>{grid.innerHTML+=html;};grid.querySelectorAll=()=>Array.from(grid.innerHTML.matchAll(/data-news-card/g));
 const root=element({tickerApp:'news'});root.querySelectorAll=selector=>selector==='[data-app-filter]'?filters:[];
 root.querySelector=selector=>({'[data-app-grid]':grid,'[data-app-status]':status,'[data-app-more]':more,'.ticker-app-toolbar':{offsetTop:60}}[selector]||filters.find(f=>selector===`[data-app-filter="${f.dataset.appFilter}"]`)||null);
 const location={pathname:'/wirkungsticker/news/',search:'',origin:'https://example.test'};
 const window={addEventListener(){},scrollTo(){}};
 const sandbox={document:{querySelector:()=>null,addEventListener(){},dispatchEvent(){}},window,location,history:{pushState(_s,_t,url){location.search=url;}},fetch:async(url,opts)=>({ok:true,json:()=>fetcher(url.replace('/wirkungsticker/data/app/',''),opts)}),AbortController,URL,URLSearchParams,CSS:{escape:String},CustomEvent:class{},localStorage:{getItem:()=>null,setItem(){}},sessionStorage:{getItem:()=>null,setItem(){}},requestAnimationFrame:fn=>fn(),setTimeout,clearTimeout,scrollY:0};
 vm.runInNewContext(client+';globalThis.testBoot=boot;',sandbox);
 return {start:()=>sandbox.testBoot(root),grid,status,more,filter:name=>filters.find(f=>f.dataset.appFilter===name).events.click({preventDefault(){}})};
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
