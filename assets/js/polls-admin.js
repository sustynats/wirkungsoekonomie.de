import { request, el, button, renderResults, renderPoll, validLink, STATUS_LABELS } from './polls.js';

const root=document.getElementById('poll-admin');
const message=document.getElementById('poll-admin-message');
const list=document.getElementById('poll-admin-list');
const editor=document.getElementById('poll-editor');
const form=document.getElementById('poll-editor-form');
const auth=()=>localStorage.getItem('woek_community_auth')||'';
let polls=[], selected=null, options=[], dirty=false, readyTimer;

function notify(text,error=false){message.textContent=text;message.className=`poll-status${error?' poll-error':''}`;}
function field(name){return form.elements.namedItem(name);}
function localDate(value){if(!value)return '';const d=new Date(value);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
function isoDate(value){return value?new Date(value).toISOString():null;}
async function api(path='',settings={}){return request(`/api/admin/polls${path}`,{...settings,auth:auth()});}
async function run(action){try{await action();}catch(error){notify(error.message,true);}}

function login(){
  const state=crypto.randomUUID();
  sessionStorage.setItem(`woek_discord_oauth_state:${state}`,location.href.split('#')[0]);
  const url=new URL('https://discord.com/oauth2/authorize');
  url.search=new URLSearchParams({client_id:'1520742698615832586',redirect_uri:`${location.origin}/app/`,response_type:'token',scope:'identify',state}).toString();
  location.assign(url.href);
}
document.getElementById('poll-admin-login').addEventListener('click',login);
document.getElementById('poll-admin-retry').addEventListener('click',()=>run(load));

async function load(){
  if(!auth()){notify('Bitte melde Dich mit Deinem bestehenden Discord-Konto an. Die Verwaltung ist auf berechtigte WÖk-Administratoren beschränkt.');return;}
  const data=await api();polls=data.polls;
  root.hidden=false;document.getElementById('poll-login-panel').hidden=true;
  drawList();notify('Verwaltung bereit.');
  const previewId=new URLSearchParams(location.search).get('vorschau');
  if(previewId){const p=polls.find(p=>p.id===previewId);if(p)openEditor(p);}
}
function drawList(){
  list.replaceChildren();
  const filter=document.getElementById('poll-status-filter').value;
  const visible=polls.filter(p=>!filter||p.effective_status===filter);
  if(!visible.length)list.append(el('li','In diesem Bereich gibt es noch keine Umfragen.'));
  for(const p of visible){
    const li=el('li'), b=button('',()=>{if(!dirty||confirm('Nicht gespeicherte Änderungen verwerfen?'))openEditor(p);});
    b.append(el('strong',p.title),el('span',`${STATUS_LABELS[p.effective_status]} · ${p.results.total} ${p.results.total===1?'Stimme':'Stimmen'} · /umfragen/${p.slug}/`));
    li.append(b);list.append(li);
  }
  document.getElementById('poll-admin-count').textContent=`${polls.length} ${polls.length===1?'Umfrage':'Umfragen'} insgesamt`;
}
document.getElementById('poll-status-filter').addEventListener('change',drawList);
document.getElementById('poll-new').addEventListener('click',()=>{if(!dirty||confirm('Nicht gespeicherte Änderungen verwerfen?'))openEditor(null);});

function openEditor(p){
  selected=p?structuredClone(p):null;dirty=false;clearInterval(readyTimer);
  form.reset();editor.hidden=false;
  const source=p||{title:'',slug:'',intro:'',question:'',status:'draft',results_visibility:'after_vote',image:'',cta_text:'',cta_url:'',further_url:'',feedback_note:''};
  for(const name of ['title','slug','intro','question','status','results_visibility','image','cta_text','cta_url','further_url','feedback_note','social_description'])field(name).value=source[name]||'';
  field('feedback_enabled').checked=Boolean(source.feedback_enabled);
  field('consent_required').checked=Boolean(source.consent_required);
  field('consent_required').disabled=Boolean(p?.results?.total);
  field('starts_at').value=localDate(p?.starts_at);field('ends_at').value=localDate(p?.ends_at);
  field('slug').readOnly=Boolean(p?.published_at);
  const voted=Boolean(p?.results?.total);
  field('question').readOnly=voted;
  options=(p?.options||[{label:''},{label:''}]).map(o=>({...o}));drawOptions();
  document.getElementById('poll-options-note').textContent=voted?'Frage und Antworttexte sind nach der ersten Stimme gesperrt. Die Reihenfolge kannst Du ändern. Für eine inhaltlich neue Umfrage nutze „Duplizieren“.':'Zwei bis acht Antworten. Mit ↑ und ↓ änderst Du die Reihenfolge.';
  document.getElementById('poll-editor-title').textContent=p?'Umfrage bearbeiten':'Neue Umfrage';
  document.getElementById('poll-add-option').disabled=voted||options.length>=8;
  drawActions();drawAdminResults();drawFeedback();updatePublication();
  editor.scrollIntoView({block:'start',behavior:'smooth'});
}
function drawOptions(){
  const mount=document.getElementById('poll-option-editor');mount.replaceChildren();
  const frozen=Boolean(selected?.results?.total);
  options.forEach((option,index)=>{
    const row=el('div',undefined,'poll-editor-option'),label=el('label',`Antwort ${index+1}`),input=el('input');
    input.type='text';input.value=option.label;input.maxLength=240;input.required=true;input.readOnly=frozen;
    input.addEventListener('input',()=>{options[index].label=input.value;dirty=true;});label.append(input);
    const actions=el('div',undefined,'poll-actions');
    const move=(offset)=>{const other=index+offset;[options[index],options[other]]=[options[other],options[index]];dirty=true;drawOptions();};
    const up=button('↑',()=>move(-1));up.disabled=index===0;up.setAttribute('aria-label',`Antwort ${index+1} nach oben`);
    const down=button('↓',()=>move(1));down.disabled=index===options.length-1;down.setAttribute('aria-label',`Antwort ${index+1} nach unten`);
    const remove=button('Entfernen',()=>{options.splice(index,1);dirty=true;drawOptions();});remove.disabled=frozen||options.length<=2;remove.setAttribute('aria-label',`Antwort ${index+1} entfernen`);
    actions.append(up,down,remove);row.append(label,actions);mount.append(row);
  });
  document.getElementById('poll-add-option').disabled=frozen||options.length>=8;
}
document.getElementById('poll-add-option').addEventListener('click',()=>{if(options.length<8){options.push({label:''});dirty=true;drawOptions();}});
form.addEventListener('input',()=>{dirty=true;});
function draft(status){
  return {...Object.fromEntries(['title','slug','intro','question','results_visibility','image','cta_text','cta_url','further_url','feedback_note','social_description'].map(k=>[k,field(k).value])),feedback_enabled:field('feedback_enabled').checked,consent_required:field('consent_required').checked,status:status||field('status').value,starts_at:isoDate(field('starts_at').value),ends_at:isoDate(field('ends_at').value),options:options.map(o=>({...o})),...(selected?{revision:selected.revision}:{})};
}
async function save(status){
  if(!form.reportValidity())return;
  const submit=document.getElementById('poll-save');submit.disabled=true;
  try{
    const result=await api(selected?`/${selected.id}`:'',{method:selected?'PATCH':'POST',body:JSON.stringify(draft(status))});
    dirty=false;await load();openEditor(polls.find(p=>p.id===result.poll.id));notify('Umfrage gespeichert.');
  }finally{submit.disabled=false;}
}
form.addEventListener('submit',event=>{event.preventDefault();run(()=>save());});
function drawActions(){
  const mount=document.getElementById('poll-lifecycle');mount.replaceChildren();
  if(!selected)return;
  const action=(status,label)=>button(label,()=>run(()=>save(status)));
  if(!selected.published_at)mount.append(action('active','Veröffentlichen'));
  else if(selected.effective_status==='paused')mount.append(action('active','Fortsetzen'));
  else if(['active','scheduled'].includes(selected.effective_status))mount.append(action('paused','Pausieren'));
  if(selected.published_at&&!['ended','archived'].includes(selected.effective_status))mount.append(action('ended','Beenden'));
  if(selected.status!=='archived')mount.append(action('archived','Archivieren'));
  mount.append(button('Duplizieren',()=>run(async()=>{const result=await api(`/${selected.id}/duplicate`,{method:'POST',body:'{}'});await load();openEditor(polls.find(p=>p.id===result.poll.id));notify('Kopie als neuer Entwurf angelegt. Die ursprünglichen Stimmen wurden nicht übernommen.');})));
  mount.append(button('Umfrage löschen',()=>run(async()=>{
    const confirmation=prompt(`Diese Umfrage, alle ${selected.results.total} Stimmen und das zugehörige interne Feedback dauerhaft löschen? Zur Bestätigung bitte den Titel eingeben:\n${selected.title}`);
    if(confirmation===null)return;
    await api(`/${selected.id}`,{method:'DELETE',body:JSON.stringify({revision:selected.revision,confirmation})});dirty=false;selected=null;editor.hidden=true;clearInterval(readyTimer);await load();notify('Umfrage und Stimmen gelöscht. Ein bereits veröffentlichter Slug wird nicht wiederverwendet.');
  }),'btn poll-danger'));
  if(selected.results.total&&['paused','ended','archived'].includes(selected.effective_status))mount.append(button('Alle Stimmen löschen',()=>run(async()=>{
    const confirmation=prompt('Alle Stimmen und das damit verknüpfte interne Feedback dieser Umfrage dauerhaft löschen? Gib STIMMEN LÖSCHEN ein.');if(confirmation===null)return;
    const id=selected.id;await api(`/${id}/votes`,{method:'DELETE',body:JSON.stringify({revision:selected.revision,confirmation})});await load();openEditor(polls.find(p=>p.id===id));notify('Stimmen gelöscht. Die Umfrage bleibt erhalten.');
  }),'btn poll-danger'));
}
function drawAdminResults(){const mount=document.getElementById('poll-admin-results');mount.replaceChildren();if(selected?.results)renderResults(selected.results,mount);}
async function drawFeedback(){
  const mount=document.getElementById('poll-admin-feedback'),pollId=selected?.id;mount.replaceChildren();if(!pollId)return;
  mount.append(el('h2','Feedback'),el('p','Nur für die Administration sichtbar. Datum, Kommentar und gewählte Antwort bleiben intern.','poll-notice'));
  const entries=el('div'),status=el('p','','poll-status');status.setAttribute('role','status');mount.append(entries,status);
  const labels={new:'Neu',read:'Gelesen',archived:'Archiviert'};
  async function page(offset=0){
    status.textContent='Feedback wird geladen …';
    try{
      const data=await api(`/${pollId}/feedback?offset=${offset}`);if(selected?.id!==pollId)return;
      for(const item of data.items){
        const card=el('article',undefined,'poll-feedback-entry'),actions=el('div',undefined,'poll-actions');
        card.append(el('p',`${new Date(item.created_at).toLocaleString('de-DE')} · ${labels[item.status]}`,'poll-notice'),el('p',item.body,'poll-feedback-text'),el('p',`Gewählte Antwort: ${item.selected_option}`,'poll-notice'));
        for(const [next,label] of [['read','Als gelesen markieren'],['archived','Archivieren'],['new','Als neu markieren']])if(item.status!==next)actions.append(button(label,()=>run(async()=>{await api(`/${pollId}/feedback/${item.id}`,{method:'PATCH',body:JSON.stringify({status:next})});if(selected?.id===pollId)await drawFeedback();})));
        actions.append(button('Feedback löschen',()=>run(async()=>{
          if(!confirm('Dieses interne Feedback dauerhaft löschen? Die Abstimmung bleibt erhalten.'))return;
          await api(`/${pollId}/feedback/${item.id}`,{method:'DELETE',body:JSON.stringify({confirmation:'FEEDBACK LÖSCHEN'})});if(selected?.id===pollId)await drawFeedback();notify('Feedback gelöscht. Die Stimme bleibt unverändert.');
        }),'btn poll-danger'));
        card.append(actions);entries.append(card);
      }
      status.textContent=data.total?`${data.total} interne ${data.total===1?'Rückmeldung':'Rückmeldungen'} insgesamt`:'Noch kein Feedback eingegangen.';
      mount.querySelector('[data-feedback-more]')?.remove();
      if(data.next_offset!==null){const more=button('Weiteres Feedback laden',()=>{more.disabled=true;page(data.next_offset);});more.dataset.feedbackMore='true';mount.append(more);}
    }catch(error){status.textContent=error.message;status.className='poll-status poll-error';}
  }
  await page();
}
document.getElementById('poll-preview').addEventListener('click',()=>{
  if(!form.reportValidity())return;
  const preview=document.getElementById('poll-preview-panel');preview.hidden=false;
  document.getElementById('poll-preview-title').textContent=field('title').value;
  document.getElementById('poll-preview-intro').textContent=field('intro').value;
  renderPoll(draft(),document.getElementById('poll-preview-ui'),{preview:true});
  preview.scrollIntoView({behavior:'smooth',block:'start'});
});
document.getElementById('poll-preview-close').addEventListener('click',()=>{document.getElementById('poll-preview-panel').hidden=true;});
function updatePublication(){
  const mount=document.getElementById('poll-publication');mount.replaceChildren();
  if(!selected?.published_at){mount.append(el('p','Entwürfe sind nur hier in der geschützten Vorschau sichtbar.','poll-notice'));return;}
  const poll=selected,url=`/umfragen/${poll.slug}/`,note=el('p','Website-Veröffentlichung wird geprüft …','poll-status');
  mount.append(note);
  async function check(){
    try{
      const response=await fetch(`${url}?poll_revision=${poll.revision}`,{cache:'no-store'});
      const html=await response.text();
      const doc=new DOMParser().parseFromString(html,'text/html');
      if(selected?.id!==poll.id||selected?.revision!==poll.revision)return;
      if(response.ok&&doc.querySelector('meta[name="woek-poll-id"]')?.content===poll.id&&Number(doc.querySelector('meta[name="woek-poll-revision"]')?.content)>=poll.revision){
        note.textContent='Öffentliche Seite und Linkvorschau sind veröffentlicht.';
        const a=el('a','Öffentliche Umfrage öffnen','btn btn-secondary');a.href=validLink(url);a.target='_blank';a.rel='noopener';
        mount.replaceChildren(note,a);clearInterval(readyTimer);
      } else note.textContent='Gespeichert. Die öffentliche Seite und Linkvorschau werden mit dem nächsten automatischen Website-Lauf veröffentlicht (üblicherweise innerhalb von 30 Minuten). Bitte erst danach den Link teilen. Abstimmungsstatus und Ergebnisse sind bereits serverseitig aktualisiert.';
    }catch{note.textContent='Gespeichert. Der Veröffentlichungsstatus der Website konnte gerade nicht geprüft werden.';}
  }
  check();readyTimer=setInterval(check,30000);
}
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
window.addEventListener('pagehide',()=>clearInterval(readyTimer));
run(load);
