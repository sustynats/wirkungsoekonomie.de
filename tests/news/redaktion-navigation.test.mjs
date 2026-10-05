import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {editorialRequest} from '../../admin/redaktion/api-client.js';
import * as reviewState from '../../admin/redaktion/review-state.js';

test('read timeouts explain the server failure; mutations are not retried',async()=>{
  let calls=0;
  const timeout=async()=>{calls++;throw new DOMException('signal timed out','TimeoutError');};
  await assert.rejects(editorialRequest('https://example.test','/reviews','test',{},timeout),/Anmeldung wurde nicht gelöscht/);
  await assert.rejects(editorialRequest('https://example.test','/decision','test',{method:'POST'},timeout),/bereits gespeichert/);
  assert.equal(calls,2);
});
test('requests retain authorization, no-store, and actionable authentication errors',async()=>{
  let options;
  await assert.rejects(editorialRequest('https://example.test','/reviews','test',{},async(_,o)=>{
    options=o;return Response.json({error:'FORBIDDEN'},{status:403});
  }),error=>error.status===403&&/Discord anmelden/.test(error.message));
  assert.equal(options.headers.Authorization,'Bearer test');assert.equal(options.cache,'no-store');assert.equal(options.credentials,'omit');
  await assert.rejects(editorialRequest('https://example.test','/reviews','test',{},async()=>new Response('<html>Error</html>')),/keine lesbare Antwort/);
});

// Exercise the real controller with a small DOM double, without external calls,
// credentials, browser automation, approval decisions or paid processing.
function app(){
  const nodes=new Map(),events=new Map();let token='',fetcher;
  class Element{
    constructor(tag='div'){this.tagName=tag;this.children=[];this.hidden=false;this.textContent='';this.dataset={};this.attrs={};this.events={};this.classList={toggle(){},add(){}};}
    append(...children){this.children.push(...children);for(const child of children)child.parent=this;}
    replaceChildren(...children){this.children=[];this.append(...children);}
    setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,v){this.events[k]=v;}
    scrollIntoView(){}focus(){document.activeElement=this;}remove(){this.parent.children=this.parent.children.filter(c=>c!==this);}
  }
  const document={hidden:false,getElementById:id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);},createElement:tag=>new Element(tag),querySelectorAll:()=>[],addEventListener:(k,v)=>events.set(k,v)};
  document.getElementById('workspace').hidden=true;
  const context=vm.createContext({...reviewState,editorialRequest,betriebsAnzeige:()=>({}),parkedReason:()=>null,enhancePrivateEditorialHtml:x=>x,EDITORIAL_COMMENT_LIMIT:20000,
    document,localStorage:{getItem:()=>token},location:{hash:'',pathname:'/admin/redaktion/'},history:{replaceState(){}},navigator:{},
    setInterval:()=>1,clearInterval(){},window:{scrollTo(){},addEventListener:(k,v)=>events.set(k,v)},
  });
  // The transport remains injected; the controller and navigation are unchanged.
  context.editorialRequest=(base,path,auth,options)=>fetcher(path,options);
  const source=fs.readFileSync(new URL('../../admin/redaktion/redaktion.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  vm.runInContext(source,context);
  return {nodes,events,document,run:code=>vm.runInContext(code,context),login:fn=>{token='test';fetcher=fn;}};
}
const ready={preview:{format:'opinion_analysis',title:'Synthetic review',sources:[]},html:'<p>Full draft</p>',revision:1,status:'PUBLISHED'};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
test('automatic login has a visible busy state, coalesces reads and retries after failure',async()=>{
  const a=app(),d=deferred();let calls=0;
  a.login(()=>{calls++;return d.promise;});
  const first=a.run('load()');assert.equal(a.run('load()'),first);assert.equal(calls,2);
  assert.match(a.nodes.get('login-status').textContent,/Anmeldung wird geprüft/);
  assert.equal(a.nodes.get('workspace').hidden,true);
  d.reject(Error('Server unavailable'));await assert.rejects(first,/Server unavailable/);
  assert.equal(a.nodes.get('login-retry').disabled,false);assert.match(a.nodes.get('login-status').textContent,/Server unavailable/);
  a.login(async path=>path==='/requests'?{requests:[]}:{reviews:[]});await a.run('load()');
  assert.equal(a.nodes.get('workspace').hidden,false);assert.equal(a.nodes.get('login').hidden,true);
});
test('review click opens loading immediately, shows retry in place and renders the full draft',async()=>{
  const a=app(),d=deferred();a.login(()=>d.promise);
  const pending=a.run("openReview('fixture')"),mount=a.nodes.get('approval-preview');
  assert.equal(mount.hidden,false);assert.equal(a.nodes.get('approval-list').hidden,true);assert.equal(mount.attrs['aria-busy'],'true');
  assert.match(mount.children[1].textContent,/Vorschau wird geladen/);
  d.reject(Error('Server unavailable'));await pending;
  assert.equal(mount.attrs['aria-busy'],'false');assert.equal(mount.children[1].attrs.role,'alert');assert.equal(mount.children[2].textContent,'Vorschau erneut laden');
  a.login(async()=>ready);await mount.children[2].events.click();
  assert.ok(mount.children.some(c=>c.tagName==='iframe'&&c.srcdoc.includes('Full draft')));
  assert.equal(mount.children.find(c=>c.tagName==='iframe').attrs.sandbox,'');
});
test('late preview responses cannot reopen a view after Back or a tab switch',async()=>{
  for(const navigate of ['back','tab']){
    const a=app(),d=deferred();a.login(()=>d.promise);const pending=a.run("openReview('fixture')"),mount=a.nodes.get('approval-preview');
    if(navigate==='back')mount.children[0].events.click();else a.run("show('compose')");
    d.resolve(ready);await pending;assert.equal(mount.hidden,true);assert.ok(!mount.children.some(c=>c.tagName==='iframe'));
  }
});
test('return from page cache re-arms polling and auth completion resumes login',async()=>{
  const a=app();a.login(async path=>path==='/requests'?{requests:[]}:{reviews:[]});await a.run('load()');
  a.events.get('pagehide')();assert.equal(a.run('poll'),undefined);
  a.events.get('pageshow')();await a.run('loading');assert.equal(a.run('poll'),1);
  assert.ok(a.events.has('storage'));assert.ok(a.events.has('visibilitychange'));
});
