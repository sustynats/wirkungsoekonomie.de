import {createLexicon} from './wirkungslexikon.mjs';
const simulation=location.pathname.startsWith('/public/');
const response=await fetch((simulation?'/public':'')+'/wirkungslexikon/runtime.json',{cache:'no-cache'});
if(!response.ok) throw Error('Lexikondaten nicht verfügbar');
const {data,config}=await response.json();
config.mount=simulation?'/public':'';
const wl=createLexicon(data,config);
wl.init();
if(simulation){const rewrite=()=>document.querySelectorAll('[href^="/wirkungslexikon/"]').forEach(a=>a.setAttribute('href','/public'+a.getAttribute('href')));rewrite();new MutationObserver(rewrite).observe(document.querySelector('#app'),{childList:true,subtree:true});}
// Existing site navigation, without starting unrelated analytics or API services.
const toggle=document.querySelector('.nav-toggle');const nav=document.querySelector('#site-nav');
if(toggle&&nav) toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);document.body.classList.toggle('nav-is-open',open);});
const form=document.querySelector('#wl-editor');
if(form){
 let revision=0;
 const select=form.elements.slug;const json=form.elements.entry;const result=document.querySelector('#edit-result');
 async function load(){const r=await fetch('/api/wirkungslexikon/editorial?slug='+encodeURIComponent(select.value));if(!r.ok){result.textContent='Karte konnte nicht geladen werden.';return;}const v=await r.json();revision=v.revision;json.value=JSON.stringify(v.entry,null,2);result.textContent='Revision '+revision+' · '+v.actor;}
 const slug=new URLSearchParams(location.search).get('slug');if(slug&&[...select.options].some(o=>o.value===slug))select.value=slug;
 select.addEventListener('change',load);await load();
 form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('button[type=submit]');button.disabled=true;try{
  const entry=JSON.parse(json.value);const r=await fetch('/api/wirkungslexikon/editorial',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:select.value,entry,reason:form.elements.reason.value,revision})});const v=await r.json();if(!r.ok)throw Error(v.error||'Speichern fehlgeschlagen');revision=v.revision;json.value=JSON.stringify(v.entry,null,2);result.textContent='Gespeichert: Version '+v.entry.version+' · Revision '+revision+'. Vorschau wurde neu gebaut.';
 }catch(error){result.textContent=error.message;}finally{button.disabled=false;}});
 document.querySelector('#load-reports').addEventListener('click',async()=>{const r=await fetch('/api/wirkungslexikon/reports');document.querySelector('#editor-reports').textContent=r.ok?JSON.stringify(await r.json(),null,2):'Hinweise nicht verfügbar.';});
}
