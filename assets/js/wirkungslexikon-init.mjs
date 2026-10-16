// Carry the build's content version into the module dependency as well.
const {createLexicon}=await import('./wirkungslexikon.mjs'+new URL(import.meta.url).search);
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
if(toggle&&nav&&!document.querySelector('script[src*="site-navigation.js"]')) toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);document.body.classList.toggle('nav-is-open',open);});
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

const dossierSearch=document.querySelector("[data-dossier-search]");if(dossierSearch)dossierSearch.addEventListener("input",()=>{const q=dossierSearch.value.toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g,"");let n=0;document.querySelectorAll("[data-dossier-item]").forEach(el=>{const match=el.textContent.toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(q);el.hidden=!match;if(match)n++;});document.querySelector("#dossier-count").textContent=n+" Dossiers";});

const reviewSearch=document.querySelector('#review-search');
if(reviewSearch)reviewSearch.addEventListener('input',()=>{const q=reviewSearch.value.toLocaleLowerCase('de');let n=0;document.querySelectorAll('[data-review-item]').forEach(el=>{el.hidden=!el.textContent.toLocaleLowerCase('de').includes(q);if(!el.hidden)n++;});document.querySelector('#review-count').textContent=n+' Vorschläge';});
const reviewForm=document.querySelector('#wl-review-editor');
if(reviewForm){
 const select=document.querySelector('#review-select'),input=document.querySelector('#review-json'),result=document.querySelector('#review-result');let revision=null,type=null;
 const r=await fetch('/api/wirkungslexikon/review');if(!r.ok)throw Error('Prüfobjekte nicht verfügbar');const registry=await r.json();
 async function load(){
  if(select.value.startsWith('new-')){type=select.value.slice(4);revision=null;input.value=JSON.stringify(registry.templates[type],null,2);result.textContent='Neuer Prüfentwurf. Quellen und vorhandene Referenz selbst eintragen.';return;}
  const r=await fetch('/api/wirkungslexikon/review?id='+encodeURIComponent(select.value));if(!r.ok){result.textContent='Prüfobjekt nicht verfügbar';return;}const v=await r.json();type=v.type;revision=v.revision;input.value=JSON.stringify(v.entry,null,2);result.textContent='Entwurfsrevision '+revision;
 }
 select.addEventListener('change',load);await load();
 reviewForm.addEventListener('submit',async e=>{e.preventDefault();const button=reviewForm.querySelector('button');button.disabled=true;try{
  const entry=JSON.parse(input.value),id=entry.event_id||entry.analysis_id;const r=await fetch('/api/wirkungslexikon/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,type,entry,expectedHash:revision,reason:document.querySelector('#review-reason').value})});const v=await r.json();if(!r.ok)throw Error(v.error||'Speichern fehlgeschlagen');revision=v.revision;if(![...select.options].some(o=>o.value===id))select.add(new Option(type+' · '+id,id),0);select.value=id;result.textContent='Neuer Entwurf gespeichert: '+revision+'. Keine Freigabe.';
 }catch(error){result.textContent=error.message;}finally{button.disabled=false;}});
}
