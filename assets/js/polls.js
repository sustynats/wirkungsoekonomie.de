const API = 'https://130.162.217.58.sslip.io';
export const STATUS_LABELS = { draft:'Entwurf', scheduled:'Geplant', active:'Aktiv', paused:'Pausiert', ended:'Beendet', archived:'Archiviert' };
export const DISCLAIMER = 'Diese Online-Umfrage ist nicht repräsentativ. Das Ergebnis bildet die abgegebenen Stimmen der Teilnehmenden ab.';
export function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function validLink(value) {
  try { const u=new URL(value,location.origin); return u.protocol === 'https:' || (u.origin === location.origin && ['http:','https:'].includes(u.protocol)) ? u.href : ''; } catch { return ''; }
}
export function button(label, action, style='btn btn-secondary') {
  const b=el('button',label,style); b.type='button'; b.addEventListener('click',action); return b;
}
export async function request(path, { token, auth, ...options }={}) {
  const headers={...options.headers};
  if(token) headers['X-Poll-Vote-Token']=token;
  if(auth) headers.Authorization=`Bearer ${auth}`;
  if(options.body) headers['Content-Type']='application/json';
  const base=document.querySelector('[data-poll-api]')?.dataset.pollApi || API;
  const response=await fetch(`${base}${path}`,{...options,headers,cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(15000)});
  const data=await response.json();
  if(!response.ok) { const error=new Error(data.error || 'Die Anfrage konnte nicht abgeschlossen werden.'); error.data=data; error.status=response.status; throw error; }
  return data;
}
export function renderResults(results, container) {
  container.replaceChildren(el('h2','Ergebnis'));
  const list=el('ul',undefined,'poll-results');
  for(const option of results.options) {
    const li=el('li'), line=el('div',undefined,'poll-result-label');
    const percentage=Number(option.percentage).toLocaleString('de-DE',{maximumFractionDigits:1});
    line.append(el('span',option.label),el('strong',`${percentage} % · ${option.count} ${option.count===1?'Stimme':'Stimmen'}`));
    const bar=el('div',undefined,'poll-bar'); bar.setAttribute('aria-hidden','true');
    const fill=el('span'); fill.style.setProperty('--poll-percentage',`${Math.min(100,Math.max(0,Number(option.percentage)))}%`); bar.append(fill);
    li.append(line,bar);list.append(li);
  }
  container.append(list,el('p',`${results.total} ${results.total===1?'Stimme':'Stimmen'} insgesamt`,'poll-total'));
  if(!results.total) container.append(el('p','Noch keine Stimmen. Alle Anteile liegen bei 0 %.','poll-notice'));
  else container.append(el('p','Prozentwerte auf eine Nachkommastelle gerundet; Rundungsreste werden ausgeglichen.','poll-notice'));
}
function storedToken(id, create=false) {
  const key=`woek_poll_vote:${id}`;
  try {
    const entry=JSON.parse(localStorage.getItem(key)||'null');
    if(entry && /^[a-f0-9]{64}$/.test(entry.token) && Date.now()-entry.created_at < 365*86400000) return entry.token;
    if(!create) return '';
    const bytes=crypto.getRandomValues(new Uint8Array(32));
    const token=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
    localStorage.setItem(key,JSON.stringify({token,created_at:Date.now()}));
    if(JSON.parse(localStorage.getItem(key)||'null')?.token!==token) throw new Error();
    return token;
  } catch {
    if(create) throw new Error('Dein Browser blockiert die lokale Abstimmungskennung. Bitte erlaube Website-Speicher, damit Deine Stimme nicht versehentlich mehrfach abgegeben wird.');
    return '';
  }
}
export function renderPoll(poll, mount, { voted=false, selected_option=null, results=null, feedback_submitted=false, preview=false, submit, sendFeedback }={}) {
  mount.replaceChildren();
  if(preview) mount.append(el('p','Vorschau: Hier wird keine Stimme gespeichert.','poll-status'));
  const status=poll.effective_status || poll.status;
  const note=el('p',voted?'Danke! Deine Stimme wurde gespeichert.':STATUS_LABELS[status] || '', 'poll-status');
  mount.append(note);
  if(status==='scheduled') mount.append(el('p',`Abstimmung ab ${new Date(poll.starts_at).toLocaleString('de-DE')}.`));
  if(['paused','ended','archived'].includes(status)) mount.append(el('p',status==='paused'?'Diese Umfrage ist vorübergehend pausiert.':'Diese Umfrage nimmt keine weiteren Stimmen an.'));
  const form=el('form'), fieldset=el('fieldset'), legend=el('legend',poll.question); fieldset.append(legend);
  for(const option of poll.options) {
    const label=el('label',undefined,'poll-option'), radio=el('input');
    radio.type='radio';radio.name='answer';radio.value=option.id;radio.required=true;
    radio.checked=option.id===selected_option;radio.disabled=voted||(!preview&&status!=='active');
    label.append(radio,el('span',option.label));fieldset.append(label);
  }
  form.append(fieldset);
  const feedback=el('p','', 'poll-status');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  if(!voted&&(status==='active'||preview)) {
    const vote=el('button',preview?'Abstimmen (Vorschau)':'Abstimmen','btn btn-primary');vote.type='submit';
    vote.disabled=preview;form.append(vote);
    form.addEventListener('submit',async event=>{
      event.preventDefault(); const value=new FormData(form).get('answer');if(!value)return;
      vote.disabled=true;feedback.className='poll-status';feedback.textContent='Deine Stimme wird gespeichert …';
      try { await submit(value); }
      catch(error) { vote.disabled=false;feedback.className='poll-status poll-error';feedback.textContent=error.message; }
    });
  }
  mount.append(form,feedback);
  if(results) { const resultBox=el('section');resultBox.setAttribute('aria-label','Umfrageergebnisse');renderResults(results,resultBox);mount.append(resultBox); }
  else mount.append(el('p',poll.results_visibility==='after_end'?'Die Ergebnisse werden nach dem Ende der Umfrage sichtbar.':'Die Ergebnisse werden nach Deiner eigenen Abstimmung sichtbar.','poll-notice'));
  if(voted||preview) {
    if(poll.feedback_enabled){
      const section=el('section',undefined,'poll-feedback');
      section.append(el('h3','Was fehlt Euch noch oder was würdet Ihr verbessern?'));
      if(feedback_submitted)section.append(el('p','Danke für Dein Feedback.','poll-status'));
      else if(preview||!['archived','paused','scheduled'].includes(status)){
        const feedbackForm=el('form'),label=el('label','Dein Feedback (optional)'),input=el('textarea');
        input.name='feedback';input.rows=5;input.maxLength=1500;input.required=true;input.placeholder='Euer Feedback zum Wirkungsticker …';
        // Generic polls use a neutral placeholder; the first poll keeps its requested wording.
        if(poll.slug!=='wirkungsticker-feedback')input.placeholder='Dein Feedback zu dieser Umfrage …';
        input.setAttribute('aria-describedby','poll-feedback-privacy');label.append(input);
        const notice=el('p','Das Feedback wird nicht öffentlich angezeigt. Es wird mit Deiner anonymen Stimme verknüpft und nur intern bis zur Löschung gespeichert. Bitte keine Namen, Kontaktdaten oder sensiblen Angaben eintragen. Maximal 1.500 Zeichen.','poll-notice');notice.id='poll-feedback-privacy';
        const send=el('button',preview?'Feedback senden (Vorschau)':'Feedback senden','btn btn-secondary');send.type='submit';send.disabled=preview;
        const response=el('p','','poll-status');response.setAttribute('role','status');response.setAttribute('aria-live','polite');
        feedbackForm.append(label,notice,send,response);section.append(feedbackForm);
        feedbackForm.addEventListener('submit',async event=>{
          event.preventDefault();if(!input.value.trim()){input.setCustomValidity('Bitte gib einen Kommentar ein oder lasse das optionale Feedback aus.');input.reportValidity();return;}
          send.disabled=true;response.textContent='Feedback wird gespeichert …';
          try {await sendFeedback(input.value.trim());feedbackForm.replaceChildren(el('p','Danke für Dein Feedback.','poll-status'));}
          catch(error){send.disabled=false;response.className='poll-status poll-error';response.textContent=error.message;}
        });
        input.addEventListener('input',()=>input.setCustomValidity(''));
      }else section.append(el('p','Die Annahme von Feedback ist derzeit geschlossen.','poll-notice'));
      mount.append(section);
    }
    if(poll.cta_text&&validLink(poll.cta_url)) { const a=el('a',poll.cta_text,'btn btn-primary');a.href=validLink(poll.cta_url);const cta=el('div',undefined,'poll-actions');cta.append(a);mount.append(cta); }
    if(poll.feedback_note&&!poll.feedback_enabled) mount.append(el('p',poll.feedback_note));
  }
  if(poll.further_url&&validLink(poll.further_url)) { const a=el('a','Weiterführende Informationen');a.href=validLink(poll.further_url);mount.append(a); }
}
export function initSharing(container, title, url) {
  const actions=el('div',undefined,'poll-actions'), status=el('p','','poll-notice');status.setAttribute('role','status');
  const input=el('input');input.value=url;input.readOnly=true;input.setAttribute('aria-label','Link zu dieser Umfrage');
  actions.append(button('Link kopieren',async()=>{
    try { await navigator.clipboard.writeText(url);status.textContent='Link kopiert.'; }
    catch { input.focus();input.select();status.textContent='Bitte den markierten Link kopieren.'; }
  }));
  if(navigator.share) actions.prepend(button('Umfrage teilen',async()=>{ try{await navigator.share({title,url});}catch(error){if(error.name!=='AbortError')status.textContent='Teilen nicht möglich. Du kannst den Link kopieren.';} }));
  container.append(el('h2','Andere einladen'),actions,input,status);
}
async function start() {
  const page=document.querySelector('[data-poll-slug]');if(!page)return;
  const slug=page.dataset.pollSlug, id=page.dataset.pollId, mount=document.getElementById('poll-ui');
  let current;
  async function load() {
    const data=await request(`/api/polls/${encodeURIComponent(slug)}`,{token:storedToken(id)});current=data;
    document.getElementById('poll-title').textContent=data.poll.title;
    document.getElementById('poll-intro').textContent=data.poll.intro;
    renderPoll(data.poll,mount,{...data,sendFeedback:async text=>{
      await request(`/api/polls/${encodeURIComponent(slug)}/feedback`,{method:'POST',token:storedToken(id),body:JSON.stringify({text})});
      current.feedback_submitted=true;
    },submit:async option=>{
      const voteToken=storedToken(id,true);
      try { current=await request(`/api/polls/${encodeURIComponent(slug)}/vote`,{method:'POST',token:voteToken,body:JSON.stringify({option_id:option})}); }
      catch(error) {
        if(error.data?.code==='ALREADY_VOTED') current=error.data;
        else {
          // A timeout can follow a committed vote: retrying never adds a second one.
          try { const confirmed=await request(`/api/polls/${encodeURIComponent(slug)}`,{token:voteToken}); if(confirmed.voted)current=confirmed;else throw error; }
          catch { throw error; }
        }
      }
      await load();mount.querySelector('.poll-status')?.setAttribute('tabindex','-1');mount.querySelector('.poll-status')?.focus();
    }});
  }
  try { await load(); }
  catch(error) { mount.replaceChildren(el('p',error.status===404?'Diese Umfrage ist nicht mehr verfügbar.':`Die Umfrage konnte nicht geladen werden. ${error.message}`,'poll-status poll-error'),button('Erneut versuchen',()=>location.reload())); }
  // Never destroy an in-progress optional comment when refreshing result counts.
  const timer=setInterval(()=>{const feedbackInput=mount.querySelector('textarea');if(feedbackInput&&(feedbackInput.value||feedbackInput===document.activeElement))return;if(!document.hidden&&current&&(current.voted||current.poll.effective_status!=='active'))load().catch(()=>{});},60000);
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
  const share=document.getElementById('poll-share');if(share)initSharing(share,document.title,`https://wirkungsoekonomie.de/umfragen/${slug}/`);
}
if(typeof document!=='undefined') start();
