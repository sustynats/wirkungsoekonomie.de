import test from 'node:test';
import assert from 'node:assert/strict';
import { initSharing } from '../../assets/js/polls.js';

const url='https://wirkungsoekonomie.de/umfragen/stadtvergleich-bundestagswahl-2025/';
function node(tag) {
  return {tag,children:[],events:{},append(...items){this.children.push(...items);},
    prepend(...items){this.children.unshift(...items);},setAttribute(key,value){this[key]=value;},
    addEventListener(event,callback){this.events[event]=callback;},focus(){this.focused=true;},select(){this.selected=true;}};
}
function environment(t,navigator) {
  for(const [key,value] of Object.entries({document:{createElement:node},navigator})) {
    const previous=Object.getOwnPropertyDescriptor(globalThis,key);
    Object.defineProperty(globalThis,key,{configurable:true,value});
    t.after(()=>previous?Object.defineProperty(globalThis,key,previous):delete globalThis[key]);
  }
}
test('compact sharing copies and shares only the public URL, without a vote',async t=>{
  let copied,shared;
  environment(t,{clipboard:{writeText:async value=>{copied=value;}},share:async value=>{shared=value;}});
  const container=node('div');initSharing(container,'Stadtvergleich',url,{compact:true});
  const [actions,input,status]=container.children;
  assert.equal(input.hidden,true);assert.equal(status.role,'status');
  await actions.children.find(b=>b.textContent==='Link kopieren').events.click();
  assert.equal(copied,url);assert.equal(status.textContent,'Link kopiert.');
  await actions.children.find(b=>b.textContent==='Umfrage teilen').events.click();
  assert.deepEqual(shared,{title:'Stadtvergleich',url});
});
test('clipboard denial reveals a selected fallback; native sharing is optional',async t=>{
  environment(t,{clipboard:{writeText:async()=>{throw new Error('denied');}}});
  const container=node('div');initSharing(container,'Stadtvergleich',url,{compact:true});
  const [actions,input,status]=container.children;
  assert.equal(actions.children.length,1);
  await actions.children[0].events.click();
  assert.equal(input.hidden,false);assert.equal(input.focused,true);assert.equal(input.selected,true);
  assert.equal(input.value,url);assert.match(status.textContent,/markierten Link/);
});
test('existing full sharing retains its heading and visible canonical link',t=>{
  environment(t,{});
  const container=node('section');initSharing(container,'Stadtvergleich',url);
  assert.equal(container.children[0].textContent,'Andere einladen');
  assert.equal(container.children[2].value,url);assert.equal(container.children[2].hidden,false);
});
