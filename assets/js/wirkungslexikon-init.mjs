// Carry the build's content version into the module dependency as well.
const {createLexicon}=await import('./wirkungslexikon.mjs'+new URL(import.meta.url).search);
const simulation=location.pathname.startsWith('/public/');
const response=await fetch((simulation?'/public':'')+'/wirkungslexikon/runtime.json',{cache:'no-cache'});
if(!response.ok) throw Error('Lexikondaten nicht verfügbar');
const {data,config}=await response.json();
config.mount=simulation?'/public':'';
const wl=createLexicon(data,config);
wl.init();
const narrativeForm=document.getElementById('wl-narrative-report');
if(narrativeForm){
 const result=document.getElementById('narrative-result'),submit=narrativeForm.querySelector('button[type=submit]');let requestId=crypto.randomUUID(),sending=false;
 submit.disabled=false;
 narrativeForm.addEventListener('submit',async event=>{
  event.preventDefault();if(sending||!narrativeForm.reportValidity())return;
  sending=true;submit.disabled=true;result.textContent='Meldung wird übermittelt …';result.setAttribute('role','status');
  const fields=Object.fromEntries(new FormData(narrativeForm));
  try{
   const response=await fetch(narrativeForm.action,{method:'POST',mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,requestId}),signal:AbortSignal.timeout(20000)});
   const v=await response.json().catch(()=>({}));
   if(!response.ok||!v.ok||v.id!==requestId){
    const messages={INVALID_FIELDS:'Bitte prüfen Sie die Angaben und die Länge der Felder.',TOO_MANY_REPORTS:'Es wurden gerade mehrere Meldungen über diese Verbindung gesendet. Bitte versuchen Sie es später erneut.',REPORT_TOO_LARGE:'Die Meldung ist zu lang. Bitte kürzen Sie die Angaben.',REQUEST_CONFLICT:'Diese Übertragung konnte nicht eindeutig zugeordnet werden. Bitte laden Sie die Seite neu und senden Sie die Meldung erneut.'};
    throw Error(messages[v.error]||'Die Meldung konnte gerade nicht gespeichert werden. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es später erneut.');
   }
   result.textContent='Vielen Dank. Ihre Meldung ist zur redaktionellen Prüfung gespeichert. Vorgangsnummer: '+v.id+'.';
   narrativeForm.reset();result.focus();
   const another=document.createElement('button');another.type='button';another.className='wl-btn wl-btn--secondary';another.textContent='Weitere Fundstelle melden';
   another.addEventListener('click',()=>{requestId=crypto.randomUUID();submit.disabled=false;result.replaceChildren();narrativeForm.elements.term.focus();});result.append(document.createElement('br'),another);
  }catch(error){result.setAttribute('role','alert');result.textContent=error.name==='TimeoutError'||error.name==='TypeError'?'Die Verbindung ist gerade nicht verfügbar. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es erneut.':error.message;submit.disabled=false;result.focus();}
  finally{sending=false;}
 });
}
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
const supplementForm=document.getElementById('wl-supplement-editor');
if(supplementForm){
 const input=document.getElementById('supplement-json'),reason=document.getElementById('supplement-reason'),result=document.getElementById('supplement-result'),button=supplementForm.querySelector('button[type=submit]');let revision=supplementForm.dataset.revision;
 supplementForm.addEventListener('submit',async e=>{e.preventDefault();button.disabled=true;try{
  const response=await fetch(supplementForm.dataset.endpoint||'/api/wirkungslexikon/narrativketten',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:supplementForm.dataset.supplementId,entry:JSON.parse(input.value),expectedHash:revision,reason:reason.value})});const value=await response.json();if(!response.ok)throw Error(value.error||'Speichern fehlgeschlagen');revision=value.revision;result.textContent='Entwurfsrevision gespeichert: '+revision+'. Keine Freigabe oder Veröffentlichung.';
 }catch(error){result.textContent=error.message;}finally{button.disabled=false;}});
}
const researchSearch=document.getElementById('research-search'),researchMode=document.getElementById('research-mode');
const v11Search=document.getElementById('v11-search');
if(v11Search){
 const form=v11Search.form,type=document.getElementById('v11-type'),topic=document.getElementById('v11-topic'),open=document.getElementById('v11-open');
 const normalize=s=>s.normalize('NFKC').toLocaleLowerCase('de').replaceAll('ß','ss');
 const rows=[...document.querySelectorAll('[data-v11-item]')].map(el=>({el,text:normalize(el.dataset.search)}));
 const filter=()=>{const words=normalize(v11Search.value).trim().split(/\s+/).filter(Boolean);let count=0;for(const {el,text} of rows){el.hidden=!(words.every(w=>text.includes(w))&&(!type.value||el.dataset.type===type.value)&&(!topic.value||el.dataset.topic===topic.value)&&(!open.value||el.dataset.open===open.value));if(!el.hidden)count++;}document.getElementById('v11-count').textContent=count+' Fassungen';};
 form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',filter);form.addEventListener('change',filter);form.addEventListener('reset',()=>setTimeout(filter,0));
}
if(researchSearch&&researchMode){const filter=()=>{const q=researchSearch.value.toLocaleLowerCase('de'),mode=researchMode.value;let count=0;for(const row of document.querySelectorAll('[data-research-item]')){row.hidden=!(row.textContent.toLocaleLowerCase('de').includes(q)&&(!mode||row.dataset.sourceMode===mode));if(!row.hidden)count++;}document.getElementById('research-count').textContent=count+' private Objekte';};researchSearch.addEventListener('input',filter);researchMode.addEventListener('change',filter);}
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
