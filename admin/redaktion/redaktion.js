import { EDITORIAL_COMMENT_LIMIT, COMMENT_TOO_LONG_MESSAGE } from './feedback-limits.js';
import {approvalStates,orderedReviews,requestWithReview,requestPresentation} from './review-state.js';
const API='https://130.162.217.58.sslip.io/api/admin/news-editorial';
const $=id=>document.getElementById(id);
const auth=()=>localStorage.getItem('woek_community_auth')||'';
const types={news:'Nachricht',opinion_analysis:'Meinung & Analyse',book_review:'Buch & Wirkung',listened:'Nachgehört',watched:'Nachgesehen'};
let selectedFiles=[],requests=[],sending=false,pendingId=null,poll;
let previewGeneration=0;
function note(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
function element(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
async function api(path='',options={}){
  const token=auth();if(!token)throw Error('Bitte melde Dich mit Deinem Discord-Konto an.');
  const headers={Authorization:`Bearer ${token}`,...options.headers};
  if(options.body&&typeof options.body==='string')headers['Content-Type']='application/json';
  const response=await fetch(API+path,{...options,headers,credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(90000)});
  const data=await response.json().catch(()=>({error:'Der Server konnte gerade nicht erreicht werden.'}));
  if(!response.ok){const e=Error(data.error||'Der Auftrag konnte noch nicht gespeichert werden.');e.status=response.status;throw e;}
  return data;
}
function login(){
  const state=crypto.randomUUID();sessionStorage.setItem(`woek_discord_oauth_state:${state}`,location.href.split('#')[0]);
  const url=new URL('https://discord.com/oauth2/authorize');
  url.search=new URLSearchParams({client_id:'1520742698615832586',redirect_uri:`${location.origin}/app/`,response_type:'token',scope:'identify',state}).toString();
  location.assign(url.href);
}
$('login-button').addEventListener('click',login);
$('login-retry').addEventListener('click',()=>load().catch(error=>note(error.message,true)));
function show(view){
  previewGeneration++;$('request-preview').hidden=true;$('request-list').hidden=false;
  for(const id of ['compose','requests','receipt','approvals'])$(id).hidden=id!==view;
  for(const [id,active] of [['tab-new',view==='compose'],['tab-list',view==='requests'],['tab-approval',view==='approvals']]){$(id).classList.toggle('selected',active);$(id).setAttribute('aria-pressed',String(active));}
  note('');window.scrollTo({top:0,behavior:'smooth'});
}
$('tab-new').addEventListener('click',()=>show('compose'));
$('tab-list').addEventListener('click',()=>{show('requests');load().catch(error=>note(error.message,true));});
$('refresh').addEventListener('click',()=>load().catch(error=>note(error.message,true)));
$('view-request').addEventListener('click',()=>{show('requests');load().catch(error=>note(error.message,true));});
$('another').addEventListener('click',()=>show('compose'));
$('copy-trigger').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('Wirkungsticker jetzt verarbeiten.');note('Text kopiert. Du kannst ihn jetzt in Deinen vereinbarten Verarbeitungschat einfügen.');}catch{note('Bitte den angezeigten Text markieren und kopieren.');}});
function drawFiles(){
  $('previews').replaceChildren();
  selectedFiles.forEach((file,index)=>{
    const item=element('div',undefined,'preview'),img=element('img'),url=URL.createObjectURL(file);
    img.src=url;img.alt=`Anhang ${index+1}: ${file.name}`;img.onload=()=>URL.revokeObjectURL(url);
    const remove=element('button','×');remove.type='button';remove.setAttribute('aria-label',`${file.name} entfernen`);
    remove.addEventListener('click',()=>{selectedFiles.splice(index,1);pendingId=null;drawFiles();});
    item.append(img,remove,element('small',file.name));$('previews').append(item);
  });
}
$('attachments').addEventListener('change',event=>{
  const incoming=[...event.target.files];event.target.value='';
  if(selectedFiles.length+incoming.length>4){note('Bitte höchstens vier Screenshots auswählen.',true);return;}
  if(incoming.some(file=>!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024||file.size===0)){note('Bitte PNG-, JPEG- oder WebP-Bilder mit höchstens 8 MB pro Datei auswählen.',true);return;}
  selectedFiles.push(...incoming);pendingId=null;drawFiles();note('');
});
$('request-form').addEventListener('input',()=>{if(!sending)pendingId=null;});
function packet(){
  return {client_id:pendingId||(pendingId=crypto.randomUUID()),kind:new FormData($('request-form')).get('kind'),brief:$('brief').value.trim(),links:$('links').value.trim(),author_notes:$('author-notes').value.trim(),urgent:$('urgent').checked,publish:false,attachments:selectedFiles.map(file=>({name:file.name,type:file.type,size:file.size}))};
}
$('request-form').addEventListener('submit',async event=>{
  event.preventDefault();if(sending||!$('request-form').reportValidity())return;
  if(!navigator.onLine){note('Du bist gerade offline. Bitte mit einer Verbindung absenden; Dein Auftrag wurde noch nicht übertragen.',true);return;}
  sending=true;$('submit').disabled=true;
  try{
    note('Dein Auftrag wird sicher gespeichert …');
    const draft=await api('/drafts',{method:'POST',body:JSON.stringify(packet())});
    for(let index=0;index<selectedFiles.length;index++){
      note(`Screenshot ${index+1} von ${selectedFiles.length} wird übertragen …`);
      await api(`/drafts/${draft.id}/attachments/${index}`,{method:'PUT',headers:{'Content-Type':selectedFiles[index].type},body:selectedFiles[index]});
    }
    note('Die Übergabe an die Redaktion wird abgeschlossen …');
    const result=await api(`/drafts/${draft.id}/submit`,{method:'POST',body:'{}'});
    $('receipt-copy').textContent=result.duplicate?'Dieser Auftrag ist bereits eingegangen. Du findest den bestehenden Bearbeitungsstand unter „Meine Aufträge“.':'Dein Auftrag ist gespeichert. Du bekommst das fertig vorbereitete Ergebnis unter „Freigeben“ angezeigt.';
    $('request-form').reset();selectedFiles=[];pendingId=null;drawFiles();show('receipt');
    await load();
  }catch(error){note(`${error.message} Du kannst erneut auf „Auftrag senden“ tippen. Bereits gespeicherte Teile werden erkannt.`,true);}
  finally{sending=false;$('submit').disabled=false;}
});
function drawRequests(){
  $('count').textContent=requests.length?String(requests.length):'';
  const mount=$('request-list');mount.replaceChildren();
  if(!requests.length){mount.append(element('p','Hier erscheint der Bearbeitungsstand Deiner eingereichten Aufträge.','quiet'));return;}
  for(const request of requests){
    const card=element('article',undefined,'request-card'),meta=element('div',undefined,'request-meta');
    meta.append(element('span',types[request.kind]||'Redaktionsauftrag'),element('time',new Date(request.created_at).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})));
    const {label,attention,description}=requestPresentation(request);
    const state=element('span',label,`state${attention?' hold':''}`);
    card.append(meta,element('h2',request.title||request.brief.slice(0,110)),state);
    if(description)card.append(element('p',description));
    if(request.publication_url){try{const url=new URL(request.publication_url);if(url.origin==='https://wirkungsoekonomie.de'){const link=element('a','Beitrag öffnen ↗');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';card.append(link);}}catch{/* Display only validated public URLs. */}}
    if(request.review_status){const button=element('button','Vorschau und Kommentare','text-button');button.type='button';button.addEventListener('click',()=>{show('approvals');openReview(request.review_job_id||request.job_id).catch(error=>note(error.message,true));});card.append(button);}
    else if(request.preview_available){const button=element('button','Zwischenstand lesen','text-button');button.type='button';button.dataset.previewJob=request.job_id;button.addEventListener('click',()=>openPrivatePreview(request));card.append(button);}
    mount.append(card);
  }
}
async function openPrivatePreview(request){
  const generation=++previewGeneration,mount=$('request-preview');
  mount.replaceChildren();mount.hidden=false;$('request-list').hidden=true;
  const back=element('button','← Alle Aufträge','text-button');back.type='button';
  back.addEventListener('click',()=>{previewGeneration++;mount.hidden=true;$('request-list').hidden=false;
    [...document.querySelectorAll('[data-preview-job]')].find(button=>button.dataset.previewJob===request.job_id)?.focus();});
  const heading=element('h2',request.title||'Dein privater Zwischenstand');heading.tabIndex=-1;
  const status=element('p','Text wird geladen …','preview-status');status.setAttribute('role','status');
  mount.append(back,heading,element('p','Noch nicht veröffentlicht. Die vollständige Fassung zur Freigabe erscheint nach Abschluss der Prüfung unter „Freigeben“.','quiet'),status);
  mount.setAttribute('aria-busy','true');mount.scrollIntoView({block:'start'});heading.focus({preventScroll:true});
  try{
    const data=await api(`/requests/${request.job_id}/preview`);
    if(generation!==previewGeneration)return;
    if(typeof data.text!=='string'||!data.text.trim())throw Error('Der Text ist noch nicht verfügbar. Bitte später erneut versuchen.');
    status.remove();mount.append(element('div',data.text,'private-preview-text'));
  }catch(error){
    if(generation!==previewGeneration)return;
    status.textContent=error.message;status.classList.add('error');status.setAttribute('role','alert');
    const retry=element('button','Erneut versuchen','secondary');retry.type='button';retry.addEventListener('click',()=>openPrivatePreview(request));mount.append(retry);
  }finally{if(generation===previewGeneration)mount.setAttribute('aria-busy','false');}
}
async function load(){
  if(!auth())return;
  const [data,reviewData]=await Promise.all([api('/requests'),api('/reviews')]);const reviews=new Map(reviewData.reviews.map(r=>[r.job_id,r]));requests=data.requests.map(r=>requestWithReview(r,reviews.get(r.review_job_id||r.job_id)));drawReviews(reviewData.reviews);
  $('login').hidden=true;$('workspace').hidden=false;drawRequests();if(location.hash==='#freigeben'){show('approvals');history.replaceState(null,'',location.pathname);}
  if(!poll)poll=setInterval(()=>{if(!document.hidden&&!sending)load().catch(error=>note(error.message,true));},60000);
}
window.addEventListener('online',()=>note('Du bist wieder online.'));
window.addEventListener('offline',()=>note('Du bist offline. Bereits eingegangene Aufträge laufen auf dem Server weiter.'));
window.addEventListener('beforeunload',event=>{if(sending){event.preventDefault();event.returnValue='';}});
window.addEventListener('pagehide',()=>clearInterval(poll));
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
load().catch(error=>note(error.message,true));

$('tab-approval').addEventListener('click',()=>{show('approvals');load().catch(error=>note(error.message,true));});
function drawReviews(reviews){
  $('approval-count').textContent=reviews.filter(r=>['AWAITING_FINAL_APPROVAL','NEEDS_REVIEW'].includes(r.status)).length||'';
  const list=$('approval-list');list.replaceChildren();
  if(!reviews.length){list.append(element('p','Sobald ein Beitrag fertig vorbereitet ist, erscheint hier seine Vorschau.','quiet'));return;}
  for(const r of orderedReviews(reviews)){const card=element('article',undefined,'request-card');card.append(element('span',types[r.format]||'Redaktion','eyebrow'),element('h2',r.title),element('p',approvalStates[r.status]||r.status));const button=element('button','Vorschau öffnen','text-button');button.type='button';button.addEventListener('click',()=>openReview(r.job_id).catch(e=>note(e.message,true)));card.append(button);list.append(card);}
}
async function openReview(id){
 const r=await api(`/reviews/${id}`),p=r.preview,mount=$('approval-preview');mount.replaceChildren();mount.hidden=false;$('approval-list').hidden=true;
 const back=element('button','← Alle Vorschauen','text-button');back.type='button';back.addEventListener('click',()=>{mount.hidden=true;$('approval-list').hidden=false;});mount.append(back);
 mount.append(element('p',`${types[p.format]} · Fassung ${r.revision}`,'eyebrow'),element('h2',p.title));if(p.subtitle)mount.append(element('p',p.subtitle));
 if(p.source_media){const m=p.source_media;mount.append(element('h3','Besprochen: '+m.show),element('p',m.episode_title),element('p',[m.original_release_date,...(m.hosts||[]),...(m.guests||[])].filter(Boolean).join(' · ')));}
 if(p.visual){const img=element('img');img.src=p.visual.url;img.alt=p.visual.alt;img.className='review-image';mount.append(img,element('p',p.visual.credit,'quiet'));}
 const frame=element('iframe');frame.title='Vollständiger Beitragsentwurf';frame.setAttribute('sandbox','');frame.className='review-text';frame.srcdoc=r.html_document?r.html:'<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{font:17px/1.7 system-ui;color:#173c36;margin:12px;overflow-wrap:anywhere}a{color:inherit}img{max-width:100%}</style><body>'+r.html+'</body></html>';mount.append(frame);
 const sourceList=element('ul');for(const source of p.sources){const li=element('li'),link=element('a',`${source.publisher}: ${source.title}`);link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';li.append(link);sourceList.append(li);}mount.append(element('h3','Quellen'),sourceList);
 for(const feedback of r.comments||[])mount.append(element('blockquote',feedback.comment));
 if(['AWAITING_FINAL_APPROVAL','APPROVED_FOR_PUBLICATION','HOLD','NEEDS_REVIEW'].includes(r.status)){
  const label=element('label','Kommentar an die Redaktion','field'),comment=element('textarea');comment.rows=8;comment.id='review-comment';comment.setAttribute('aria-describedby','review-comment-count');label.append(comment);mount.append(label);
  const count=element('p',undefined,'quiet');count.id='review-comment-count';count.setAttribute('aria-live','polite');
  const updateCount=()=>{count.textContent=`${comment.value.length.toLocaleString('de-DE')} / ${EDITORIAL_COMMENT_LIMIT.toLocaleString('de-DE')} Zeichen`;count.classList.toggle('error',comment.value.length>EDITORIAL_COMMENT_LIMIT);};comment.addEventListener('input',updateCount);updateCount();mount.append(count);
  const controls=element('div',undefined,'approval-actions');
  for(const [action,title,cls]of[['APPROVE','Diese Fassung freigeben','primary'],['REVISE','Mit Kommentar zurückgeben','secondary'],['HOLD','Für später zurückstellen','text-button'],['SKIP','Nicht veröffentlichen','text-button']]){
   if(r.status==='NEEDS_REVIEW'&&action==='APPROVE')continue;const button=element('button',title,cls);button.type='button';button.addEventListener('click',async()=>{if(comment.value.length>EDITORIAL_COMMENT_LIMIT){note(COMMENT_TOO_LONG_MESSAGE,true);comment.focus();return;}if(action==='REVISE'&&!comment.value.trim()){note('Bitte schreibe dazu, was geändert werden soll.',true);comment.focus();return;}for(const b of controls.querySelectorAll('button'))b.disabled=true;try{await api(`/reviews/${id}/decision`,{method:'POST',body:JSON.stringify({action,preview_hash:r.preview_hash,comment:comment.value})});mount.hidden=true;$('approval-list').hidden=false;await load();note({APPROVE:'Freigabe gespeichert. Genau diese Fassung ist zur Veröffentlichung freigegeben.',REVISE:'Dein Kommentar ist gespeichert. Die überarbeitete Fassung erscheint wieder zur Freigabe.',HOLD:'Der Beitrag ist zurückgestellt.',SKIP:'Der Beitrag wird nicht veröffentlicht.'}[action]);}catch(e){note(e.status===409?'Die Fassung hat sich geändert. Bitte die neue Vorschau öffnen.':e.message,true);for(const b of controls.querySelectorAll('button'))b.disabled=false;}});controls.append(button);
  }mount.append(controls);
 }mount.scrollIntoView({behavior:'smooth',block:'start'});
}
