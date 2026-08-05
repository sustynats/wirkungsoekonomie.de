"use strict";
/* ========== Wirkungswahl-Kompass — realer Content (Programme 2025) ========== */
const DATA = JSON.parse(document.getElementById('wwk-data').textContent);
const D = DATA.dimensions, Q = DATA.questions, PARTIES = DATA.parties, FIELDS = DATA.fields;
const DIM = Object.fromEntries(D.map(d=>[d.id,d]));
const DIM_SHORT = {social:'Soziale Sicherheit',health:'Gesundheit & Teilhabe',freedom:'Freiheit',
  climate:'Klima & Energie',resources:'Ressourcen',resilience:'Resilienz',rule_of_law:'Rechtsstaat',information:'Information'};
const dimVar = id=>`var(--d-${id})`;
const QBY = Object.fromEntries(Q.map(q=>[q.id,q]));
const PBY = Object.fromEntries(PARTIES.map(p=>[p.id,p]));
const partyByCode = code=>PARTIES.find(p=>p.code===code);
const POSBY = {}; Q.forEach(q=>{POSBY[q.id]=Object.fromEntries(q.party_positions.map(p=>[p.party_id,p]));});
const PROG = Object.fromEntries(DATA.programs.map(p=>[p.id,p]));
const EVID = Object.fromEntries(DATA.evidence.map(e=>[e.id,e]));
const CONF_L={high:'hoch',medium:'mittel',low:'niedrig'};
const POS_L={clear_support:'klare Zustimmung (+2)',leaning_support:'tendenzielle Zustimmung (+1)',mixed:'gemischt (0)',not_evidenced:'keine eindeutige Position',leaning_opposition:'tendenzielle Ablehnung (−1)',clear_opposition:'klare Ablehnung (−2)'};

/* ---- State (nur lokal) ---- */
const KEY='wwk_real_state_v1';
const USER_SPACE_KEY='woek_user_space';
const USER_SPACE_ITEM_ID='wirkungswahl-kompass-mein-ergebnis';
const DEF={answers:{},reveal:false,compare:[],compareField:'A',qi:0};
let S=load();
function load(){try{return Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY))||{})}catch(e){return {...DEF}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function wipe(){try{localStorage.removeItem(KEY)}catch(e){} S={...DEF,answers:{},compare:[],compareField:'A',qi:0};}

/* Der Kompass lädt bewusst nicht assets/js/main.js: dort würden Analytics und
   weitere Seitendienste starten. Dieser kleine Adapter schreibt deshalb nur
   einen kompatiblen, rein lokalen Merkeintrag in Mein Wirkungsraum. */
function userSpaceDefaults(now){return {namespace:USER_SPACE_KEY,schema_version:3,created_at:now,updated_at:now,local_only:true,sync_ready:true,server_storage_enabled:false,
  sync:{prepared:true,enabled:false,login_enabled:false,server_storage_enabled:false,user_id:null,auth_provider:null,device_id:null,synced_at:null,status:'local_only',conflict_strategy:'latest_updated_at_wins',conflict_log:[]},
  objects:{saved_items:{version:1,updated_at:null,user_id:null,device_id:null,synced_at:null,sync_status:'local',conflicts:[],items:[]}}};}
function userSpaceStore(now){let raw=null;try{raw=JSON.parse(localStorage.getItem(USER_SPACE_KEY)||'null');}catch(e){}
  const store=raw&&typeof raw==='object'&&!Array.isArray(raw)&&raw.namespace===USER_SPACE_KEY?raw:userSpaceDefaults(now);
  store.schema_version=Math.max(3,Number(store.schema_version)||0);store.created_at=store.created_at||now;store.updated_at=now;store.local_only=true;store.sync_ready=true;store.server_storage_enabled=false;
  const sync=store.sync&&typeof store.sync==='object'&&!Array.isArray(store.sync)?store.sync:{};
  store.sync={...sync,prepared:true,enabled:Boolean(sync.enabled),login_enabled:Boolean(sync.login_enabled),server_storage_enabled:Boolean(sync.server_storage_enabled),user_id:Object.prototype.hasOwnProperty.call(sync,'user_id')?sync.user_id:null,auth_provider:Object.prototype.hasOwnProperty.call(sync,'auth_provider')?sync.auth_provider:null,device_id:Object.prototype.hasOwnProperty.call(sync,'device_id')?sync.device_id:null,synced_at:null,status:'local_only',conflict_strategy:sync.conflict_strategy||'latest_updated_at_wins',conflict_log:Array.isArray(sync.conflict_log)?sync.conflict_log.slice(-100):[]};
  store.objects=store.objects&&typeof store.objects==='object'&&!Array.isArray(store.objects)?store.objects:{};
  const saved=store.objects.saved_items&&typeof store.objects.saved_items==='object'&&!Array.isArray(store.objects.saved_items)?store.objects.saved_items:{};
  store.objects.saved_items={...saved,version:Math.max(1,Number(saved.version)||1),updated_at:saved.updated_at||null,user_id:Object.prototype.hasOwnProperty.call(saved,'user_id')?saved.user_id:store.sync.user_id,device_id:Object.prototype.hasOwnProperty.call(saved,'device_id')?saved.device_id:store.sync.device_id,synced_at:null,sync_status:'local_changed',conflicts:Array.isArray(saved.conflicts)?saved.conflicts.slice(-50):[],items:Array.isArray(saved.items)?saved.items.filter(item=>item&&typeof item==='object'&&!Array.isArray(item)):[]};
  return store;}

/* ---- Methodik-Helfer ---- */
const {isAnswered,proximity,priorityProfile}=WWKLogic;
function answeredQs(){return Q.filter(q=>isAnswered(S.answers[q.id]));}
function importanceSet(){return Q.filter(q=>isAnswered(S.answers[q.id])&&typeof (S.answers[q.id]||{}).importance==='number').length;}
function importanceProfile(){return priorityProfile(D,Q,S.answers).map(d=>({id:d.id,short:DIM_SHORT[d.id],val:d.value}));}
function partyStance(pid,qid){const p=POSBY[qid]&&POSBY[qid][pid];return p&&typeof p.stance==='number'?p.stance:null;}

/* ---- HTML-Helfer ---- */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function dimChip(id){return `<span class="chip"><span class="sw" style="background:${dimVar(id)}"></span>${esc(DIM_SHORT[id]||id)}</span>`;}
function pTag(p){return S.reveal?esc(p.name):'Partei '+p.code;}
function pxBadge(px){const m={hoch:'px-hoch',mittel:'px-mittel',gering:'px-gering',gegen:'px-gegen',keine:'px-keine'}[px.key];
  return `<span class="px ${m}"><span class="m"></span>${esc(px.label)}</span>`;}
function meter(level){return `<span class="meter lv-${level}" aria-hidden="true"><i></i><i></i><i></i></span>`;}
function fieldQs(fid){return Q.filter(q=>q.field===fid);}
function positionLabel(pp){return pp?POS_L[pp.position_status]||'nicht eingeordnet':'keine eindeutige Position';}
function safeHttpsUrl(value){try{const url=new URL(String(value));return url.protocol==='https:'?url.href:'';}catch{return '';}}
function programLink(pp){if(!pp||!pp.source_id)return '<span class="small mut">kein eindeutiger Programmbeleg</span>';
  const pr=PROG[pp.source_id],page=pp.pdf_page?` · PDF-S. ${esc(pp.pdf_page)}`:'';
  const href=pr&&safeHttpsUrl(pr.url);if(!href)return `<span class="small mut">${esc(pp.source_id)}${page}</span>`;
  return `<a class="source-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(pp.source_id)}${page} · Quelle öffnen ↗</a>`;}
function evidenceLink(id){const e=EVID[id];if(!e)return `<span class="tag">${esc(id)}</span>`;
  const href=safeHttpsUrl(e.url);return href?`<a class="source-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(id)} · ${esc(e.institution)} ↗</a>`:`<span class="tag">${esc(id)} · ${esc(e.institution)}</span>`;}

/* ---- Radar ---- */
function radar(profile){const N=profile.length,cx=190,cy=154,R=92,max=3;
  const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/N;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r];};
  let rings='';[1,2,3].forEach(k=>{rings+=`<polygon class="ring" points="${profile.map((_,i)=>pt(i,R*k/max).join(',')).join(' ')}"/>`;});
  let axes='',labels='';
  profile.forEach((d,i)=>{const[x,y]=pt(i,R);axes+=`<line class="axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`;
    const[lx,ly]=pt(i,R+32);labels+=`<text class="alab" x="${lx}" y="${ly}" text-anchor="${lx<cx-4?'end':lx>cx+4?'start':'middle'}" dominant-baseline="middle">${esc(d.short)}</text>`;});
  const poly=profile.map((d,i)=>pt(i,R*Math.max(0.02,d.val)/max).join(',')).join(' ');
  return `<svg viewBox="0 0 380 320" role="img" aria-label="Radar der Wichtigkeit je Wirkungsdimension.">${rings}${axes}<polygon class="poly" points="${poly}"/>${labels}</svg>`;}

/* ---- Wirkungs-Bandbalken (Bandbreite −3..+3) ---- */
function bandBar(dimId,lo,hi){const toX=v=>((v+3)/6)*100;const x0=toX(lo),x1=toX(hi),mid=toX(0);
  const posSide=lo>=0;const col=posSide?'var(--pos)':(hi<=0?'var(--neg)':'var(--gold)');
  return `<div class="ibar"><div class="name"><span class="sw" style="width:11px;height:11px;border-radius:3px;background:${dimVar(dimId)}"></span>${esc(DIM_SHORT[dimId])}</div>
   <div class="track" role="img" aria-label="${esc(DIM[dimId].label)}: Wirkungspotenzial ${lo>0?'+':''}${lo} bis ${hi>0?'+':''}${hi} (von −3 bis +3).">
     <div class="mid" style="left:${mid}%"></div>
     <div class="val" style="left:${x0}%;width:${Math.max(2,x1-x0)}%;background:color-mix(in srgb,${col} 72%,transparent);border:1px solid ${col}"></div>
     <span class="num">${lo>0?'+':''}${lo}${hi!==lo?'…'+(hi>0?'+':'')+hi:''}</span></div></div>`;}

/* ================= Screens ================= */
const demoNote=`<div class="demo-note" role="note"><span aria-hidden="true">🛈</span><span><b>Redaktioneller Arbeitsstand.</b> Programmbasis: offizielle Bundestagswahlprogramme 2025 · ${esc(DATA.meta.dataVersion)}. Vor Veröffentlichung: unabhängige Zweitprüfung, symmetrisches Stellungnahmeverfahren für Parteien und juristischer Check. Keine Wahlempfehlung.</span></div>`;

const SCREENS={
 landing(){const on=DATA.resultCopy.onboarding||[];return `
  ${demoNote}
  <div class="eyebrow">Wirkungswahl-Kompass</div>
  <h1>${esc(DATA.meta.claim)}</h1>
  ${on.length?`<div class="card">${on.map(l=>`<p style="margin:.2em 0 .6em">${esc(l)}</p>`).join('')}</div>`:''}
  <div class="grid2" style="margin:14px 0">
    <div class="card" style="margin:0"><div class="eyebrow" style="color:var(--green)">Der Kompass ist</div><ul style="margin:0;padding-left:18px">
      <li>ein Vergleich von Positionen und Wirkungen</li><li>programmbasiert & quellenbelegt</li>
      <li>überparteilich, gleiche Messlatte für alle</li><li>erklärbar bis zur Fundstelle</li></ul></div>
    <div class="card" style="margin:0"><div class="eyebrow" style="color:var(--redline)">Der Kompass ist nicht</div><ul style="margin:0;padding-left:18px">
      <li>eine Wahlempfehlung</li><li>ein Prozent-Match oder Ranking</li>
      <li>eine Partei-Gesamtwertung</li><li>ein Persönlichkeitstest</li></ul></div>
  </div>
  <div class="card"><div class="eyebrow">${Q.length} Fragen · ${FIELDS.length} Themenfelder · ${PARTIES.length} Parteien</div>
    <p class="small">Vier getrennte Ebenen — <b>ohne Gesamtzahl</b>: persönliche Prioritäten · positionale Nähe · Wirkungspotenzial · Wirkungsgrenzen.</p>
    <div class="chips">${FIELDS.map(f=>`<span class="chip">${esc(f.id)} · ${esc(f.topic)}</span>`).join('')}</div></div>
  <div class="cta"><a class="btn btn-primary" href="#/fragen">Kompass starten</a><a class="btn btn-quiet" href="#/methodik">Wie funktioniert das?</a></div>`;
 },
 methodik(){return `
  <div class="eyebrow">Methodik</div><h1>Dieselbe offengelegte Messlatte für alle</h1>
  <p>Die Parteiwertung beschreibt die <b>programmatische Nähe zur exakt formulierten Option</b> — keine Bewertung der Partei, kein Wirkungsurteil. Gleichartige Vorschläge erhalten dieselbe Einordnung, unabhängig vom Absender.</p>
  <div class="card"><h3>Vier Ebenen — strikt getrennt</h3><div class="levels">
    ${[['1','Persönliche Prioritäten','Wichtigkeit je Feld — nicht Güte'],
       ['2','Positionale Nähe','programmbasiert, qualitativ (hoch/mittel/gering/gegensätzlich) — nie als Gesamtprozent'],
       ['3','Wirkungspotenzial','modellierte Bandbreiten je Dimension, mit Evidenz und Unsicherheit'],
       ['4','Wirkungsgrenzen','nichtkompensierbare Mindestbedingungen — separat, nie verrechnet']]
      .map(l=>`<div class="level"><div class="n">${l[0]}</div><div><b>${l[1]}</b><div class="small">${l[2]}</div></div></div>`).join('')}
  </div></div>
  <div class="card"><h3>Bewertungsskala der Parteizuordnung</h3>
    <div class="tblwrap"><table><tbody>
    ${[['+2','klare Zustimmung — explizite Unterstützung der Kernoption'],['+1','tendenzielle Zustimmung — Richtung ja, Instrument/Umfang weicht ab'],
      ['0','gemischt — belegte, widersprüchliche oder ausgewogene Programmposition'],['−1','tendenzielle Ablehnung'],['−2','klare Ablehnung oder entgegengesetztes Modell']]
      .map(r=>`<tr><th scope="row" style="font-variant-numeric:tabular-nums">${r[0]}</th><td>${esc(r[1])}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="small" style="margin:.6em 0 0"><b>Keine eindeutige Position</b> ist kein Nullwert und wird nicht in die Nähe-Berechnung einbezogen.</p>
    <p class="small" style="margin:.6em 0 0">Quellenvertrauen: <b>hoch</b> = explizite Aussage im Programm · <b>mittel</b> = klare Richtung · <b>niedrig</b> = indirekte Ableitung (nachzurecherchieren).</p></div>
  <div class="card"><h3>Acht Wirkungsdimensionen</h3>
    <div style="display:grid;gap:6px">${D.map(d=>`<div style="display:flex;gap:10px;align-items:center"><span class="sw" style="width:12px;height:12px;border-radius:3px;flex:none;background:${dimVar(d.id)}"></span>${esc(d.label)}</div>`).join('')}</div></div>
  <div class="redline"><div class="h">${warnSvg()} Nichtkompensationsprinzip</div>
    <p class="small" style="margin:.4em 0 0">Demokratische und menschenrechtliche Mindestbedingungen werden für alle Optionen nach denselben Regeln geprüft und <b>nicht</b> mit positiven Werten in anderen Feldern verrechnet.</p>
    <ul class="small" style="margin:.5em 0 0">${DATA.globalRedLines.map(r=>`<li>${esc(r)}</li>`).join('')}</ul></div>
  <div class="cta"><a class="btn btn-primary" href="#/fragen">Zu den Fragen</a><a class="btn btn-quiet" href="#/transparenz">Transparenz</a></div>`;
 },
 datenschutz(){return `
  <div class="eyebrow">Datenschutz &amp; Speicherung</div><h1>Deine Antworten bleiben lokal</h1>
  <div class="card"><ul style="margin:0;padding-left:18px;line-height:1.9">
    <li>Nutzung <b>ohne Konto</b>.</li><li>Antworten <b>nur lokal im Browser</b>.</li>
    <li><b>Keine</b> Übertragung individueller Antwortprofile.</li><li>Keine personalisierte Werbung, keine Tracker.</li>
    <li>Beim ausdrücklichen Speichern in <b>Mein Wirkungsraum</b> entsteht nur eine lokale Merkkarte mit bis zu vier Prioritäten - ohne einzelne Antworten, Parteien oder Nähewerte.</li></ul></div>
  <div class="card"><h3>Kompass-Antworten lokal löschen</h3><p class="small">Entfernt nur die Antworten dieses Kompasses. Eine bewusst gespeicherte Merkkarte bleibt in Mein Wirkungsraum und kann dort entfernt werden.</p><button class="btn btn-danger" data-a="wipe">Kompassdaten löschen</button></div>
  <div class="cta"><a class="btn btn-ghost" href="#/">Zur Startseite</a></div>`;
 },
 fragen(){
  const idx=clamp(S.qi||0,0,Q.length-1);S.qi=idx;const q=Q[idx],a=S.answers[q.id]||{};const f=FIELDS.find(x=>x.id===q.field);
  return `
  <div class="prog"><span class="lab">Frage ${idx+1} / ${Q.length}</span>
    <div class="track"><div class="fill" style="width:${(idx+1)/Q.length*100}%"></div></div>
    <span class="lab">${answeredQs().length} beantw.</span></div>
  <div class="eyebrow">Feld ${esc(q.field)} · ${esc(f?f.topic:'')}</div>
  <h1 style="font-size:1.4rem">${esc(q.thesis)}</h1>
  <div class="chips">${(q.dimensions||[]).map(dimChip).join('')}</div>
  <details class="disclosure"><summary>Warum diese Frage?</summary><p class="small">${esc(q.explanation)}</p>
    ${q.baseline?`<p class="small mut"><b>Bewertete Option:</b> ${esc(q.baseline)}</p>`:''}</details>
  <div class="card"><div class="small" style="margin-bottom:6px">Wie stark stimmst du zu?</div>
    <div class="scale" role="group" aria-label="Zustimmung">
      ${DATA.answerScale.map(o=>`<button class="opt" data-a="set-value" data-v="${o.v}" aria-pressed="${a.value===o.v}"><span class="dot" aria-hidden="true"></span><span class="lab">${esc(o.label)}</span><span class="k">${o.v>0?'+':''}${o.v}</span></button>`).join('')}
      <div class="mini"><button class="opt" data-a="set-value" data-v="unsure" aria-pressed="${a.value==='unsure'}"><span class="dot"></span><span class="lab">unsicher</span></button>
        <button class="opt" data-a="set-value" data-v="skip" aria-pressed="${a.value==='skip'}"><span class="dot"></span><span class="lab">überspringen</span></button></div></div></div>
  <div class="card"><div class="small" style="margin-bottom:6px">Wie <b>wichtig</b> ist dir dieses Thema? <span class="mut">(formt dein Profil)</span></div>
    <div class="imp" role="group" aria-label="Wichtigkeit">${DATA.importanceScale.map(o=>`<button data-a="set-imp" data-w="${o.w}" aria-pressed="${a.importance===o.w}"><span class="w">${o.w}</span><span class="wl">${esc(o.label)}</span></button>`).join('')}</div>
    ${a.importance==null?`<p class="small mut" style="margin:.4em 0 0">Ohne Wichtigkeit fließt dieses Thema nicht in dein Profil ein.</p>`:''}</div>
  ${cta(`<button class="btn btn-ghost" data-a="q-prev" ${idx===0?'disabled':''}>Zurück</button>
    ${idx<Q.length-1?`<button class="btn btn-primary" data-a="q-next">Weiter</button>`:`<a class="btn btn-primary" href="#/profil">Zum Profil</a>`}`)}`;
 },
 profil(){const prof=importanceProfile();if(!answeredQs().length)return emptyState('Noch keine Antworten','Beantworte zuerst die Fragen.','#/fragen','Zu den Fragen');
  if(!importanceSet())return emptyState('Noch keine Wichtigkeit gesetzt','Dein Profil zeigt die <b>Wichtigkeit</b> je Feld (nicht deine Zustimmung — die steuert die Themenmatrix). Setze bei den Fragen die Wichtigkeit.','#/fragen','Wichtigkeit setzen');
  const rows=[...prof].sort((a,b)=>b.val-a.val);
  return `<div class="eyebrow">Ebene 1 · Persönliche Prioritäten</div><h1>Dein Prioritätenprofil</h1>
  <p>Zeigt, welche Wirkungsfelder dir <b>wichtig</b> sind — nicht deine Zustimmung (die steuert die <a href="#/ergebnis">Themenmatrix</a>).</p>
  <div class="figure">${radar(prof)}</div>
  <details class="disclosure" open><summary>Tabellen-Alternative</summary><div class="tblwrap"><table><thead><tr><th scope="col">Dimension</th><th class="cell" scope="col">Wichtigkeit (0–3)</th></tr></thead>
    <tbody>${rows.map(r=>`<tr><th scope="row"><span class="sw" style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${dimVar(r.id)};margin-right:6px"></span>${esc(DIM[r.id].label)}</th><td class="cell" style="font-variant-numeric:tabular-nums">${r.val.toFixed(1)}</td></tr>`).join('')}</tbody></table></div></details>
  <div class="cta"><a class="btn btn-primary" href="#/ergebnis">Weiter: Positionen vergleichen</a><a class="btn btn-quiet" href="#/teilen">Ergebnis sichern &amp; teilen</a></div>`;
 },
 ergebnis(){const aq=answeredQs();if(!aq.length)return emptyState('Noch keine Antworten','Beantworte zuerst Fragen.','#/fragen','Zu den Fragen');
  const byField={};aq.forEach(q=>{(byField[q.field]=byField[q.field]||[]).push(q);});
  return `<div class="eyebrow">Ebene 2 · Positionale Nähe</div><h1>Themenmatrix</h1>
  <p>Wie ähnlich deine Antworten den Programmaussagen sind — <b>Thema für Thema</b>. Kein Gesamtwert, kein Prozent-Match, keine Rangliste.</p>
  <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
    <button class="toggle" data-a="reveal" aria-pressed="${S.reveal}"><span>${S.reveal?'Parteinamen sichtbar':'Inhalte zuerst (A–G)'}</span><span class="sw"></span></button>
    <a class="btn btn-quiet" href="#/vergleich">2–3 vergleichen ›</a></div>
  <div class="tblwrap"><table><caption>Positionale Nähe je Thema und Partei. „—“ = nicht beantwortet · „keine Position“ = kein eindeutiger Programmbeleg.</caption>
    <thead><tr><th scope="col">Thema</th>${PARTIES.map(p=>`<th scope="col" class="cell"><button class="btn-quiet" data-a="goto" data-h="#/partei/${p.code}">${pTag(p)}</button></th>`).join('')}</tr></thead>
    <tbody>${FIELDS.filter(f=>byField[f.id]).map(f=>`
      <tr><th colspan="${PARTIES.length+1}" style="background:var(--surface-2);font-family:var(--serif);font-size:.9rem">${esc(f.id)} · ${esc(f.topic)}</th></tr>
      ${byField[f.id].map(q=>{const u=S.answers[q.id].value;return `<tr><th scope="row"><button class="btn-quiet" style="text-align:left" data-a="goto" data-h="#/thema/${q.id}">${esc(q.title)}</button></th>${PARTIES.map(p=>{const pv=partyStance(p.id,q.id);return `<td class="cell">${pxBadge(proximity(u,pv))}</td>`;}).join('')}</tr>`;}).join('')}`).join('')}</tbody></table></div>
  <div class="card" style="margin-top:14px"><div class="small"><b>Legende:</b>
    <span class="px px-hoch"><span class="m"></span>hoch</span> <span class="px px-mittel"><span class="m"></span>mittel</span>
    <span class="px px-gering"><span class="m"></span>gering</span> <span class="px px-gegen"><span class="m"></span>gegensätzlich</span> <span class="px px-keine"><span class="m"></span>keine Position</span></div>
    <p class="small" style="margin:.6em 0 0">Nähe = 1 − |deine Antwort − Parteiwert| / 4, nur auf beantwortete Fragen. Qualitativ, nie als Gesamtprozent.</p></div>`;
 },
 partei(code){const p=partyByCode(code);if(!p)return notFound();
  return `<div class="eyebrow">Parteidetail · Ebene 2</div><h1>${pTag(p)}</h1>
  <p class="small">Positionale Nähe ist themenbezogen. <b>Wirkungspotenziale gehören zur Option, nicht zur Partei</b> — im Themendetail.</p>
  <div class="tblwrap"><table><caption>Programmatische Position je Thema, deine Nähe und der zugrunde liegende Programmbeleg.</caption>
    <thead><tr><th scope="col">Thema</th><th class="cell" scope="col">Programmposition</th><th class="cell" scope="col">Nähe zu dir</th><th scope="col">Begründung und Quelle</th></tr></thead>
    <tbody>${Q.map(q=>{const pp=POSBY[q.id][p.id],ans=S.answers[q.id];
      const near=isAnswered(ans)?pxBadge(proximity(ans.value,partyStance(p.id,q.id))):'<span class="small mut">—</span>';
      return `<tr><th scope="row"><button class="btn-quiet" style="text-align:left" data-a="goto" data-h="#/thema/${q.id}">${esc(q.title)}</button></th>
        <td class="cell"><span class="tag">${esc(positionLabel(pp))}</span></td><td class="cell">${near}</td>
        <td><p class="small" style="margin:0 0 .35em">${esc(pp&&pp.kurzbegruendung?pp.kurzbegruendung:'Keine hinreichend eindeutige Programmaussage.')}</p>
          ${programLink(pp)}${pp?` <span class="tag">Vertrauen: ${esc(CONF_L[pp.confidence]||'?')}</span>`:''}</td></tr>`;}).join('')}</tbody></table></div>
  <div class="cta"><a class="btn btn-ghost" href="#/ergebnis">Zur Matrix</a></div>`;
 },
 thema(qid){const q=QBY[qid];if(!q)return notFound();const ia=q.impact_assessment;
  const bands=Object.entries(ia.bands||{});
  return `<div class="eyebrow">Feld ${esc(q.field)} · ${esc(q.title)}</div>
  <h1 style="font-size:1.35rem">${esc(q.thesis)}</h1>
  <div class="chips">${(q.dimensions||[]).map(dimChip).join('')}</div>
  ${q.baseline?`<p class="small mut"><b>Bewertete Option:</b> ${esc(q.baseline)}</p>`:''}
  ${q.referenceFrame?`<p class="small mut"><b>Referenzrahmen:</b> ${esc(q.referenceFrame)}</p>`:''}
  <div class="card"><div class="eyebrow">Ebene 3 · Wirkungspotenzial (modelliert)</div>
    <p class="small">Bandbreiten je Dimension, −3 bis +3. Modelliertes <b>Potenzial</b> der Option — nicht aus deinen Antworten und kein Wirkungsnachweis.</p>
    ${bands.map(([d,r])=>bandBar(d,r[0],r[1])).join('')}
    <div class="btn-row" style="margin-top:12px">
      <span class="tag">Evidenz: ${meter(ia.evidence_grade)} <b>${esc(CONF_L[ia.evidence_grade])}</b></span>
      <span class="tag">Unsicherheit: ${meter(ia.uncertainty)} <b>${esc(CONF_L[ia.uncertainty])}</b></span></div>
    ${ia.effect_path&&ia.effect_path.length?`<details class="disclosure" style="margin-top:8px"><summary>Wirkungspfad</summary><p class="small">${ia.effect_path.map(esc).join(' <b style="color:var(--gold)">→</b> ')}</p><p class="small mut"><b>Zeitwirkung:</b> ${esc(ia.time_effect)}</p><p class="small mut"><b>Betroffen:</b> ${esc(ia.affected_groups)}</p></details>`:''}
  </div>
  <div class="grid2">
    <div class="card" style="margin:0"><div class="eyebrow" style="color:var(--green)">Positive Potenziale</div><ul class="small" style="margin:0;padding-left:16px">${(ia.positive_potentials||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="card" style="margin:0"><div class="eyebrow" style="color:var(--caution)">Risiken &amp; Zielkonflikte</div><ul class="small" style="margin:0;padding-left:16px">${(ia.risks||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>
  ${ia.red_lines_text?`<div class="redline"><div class="h">${warnSvg()} Wirkungsgrenzen (nicht verrechnet)</div><p class="small" style="margin:.4em 0 0">${esc(ia.red_lines_text)}</p></div>`:''}
  <div class="card"><div class="eyebrow">Ebene 2 · Programmpositionen</div>
    <div class="tblwrap"><table><thead><tr><th scope="col">Partei</th><th class="cell" scope="col">Position</th><th scope="col">Begründung und Beleg</th></tr></thead>
    <tbody>${PARTIES.map(p=>{const pp=POSBY[qid][p.id];return `<tr><th scope="row">${pTag(p)}</th><td class="cell"><span class="tag">${esc(positionLabel(pp))}</span></td>
      <td><p class="small" style="margin:0 0 .35em">${esc(pp&&pp.kurzbegruendung?pp.kurzbegruendung:'Keine hinreichend eindeutige Programmaussage.')}</p>${programLink(pp)}${pp?` <span class="tag">Vertrauen: ${esc(CONF_L[pp.confidence]||'?')}</span>`:''}</td></tr>`;}).join('')}</tbody></table></div></div>
  ${ia.indicators?`<p class="small mut"><b>Mögliche Indikatoren:</b> ${esc(ia.indicators)}</p>`:''}
  ${ia.evidence_ids&&ia.evidence_ids.length?`<div class="card"><h3>Evidenzquellen</h3><div class="source-list">${ia.evidence_ids.map(e=>evidenceLink(e)).join('')}</div></div>`:''}
  <div class="cta"><a class="btn btn-ghost" href="#/ergebnis">Zur Matrix</a></div>`;
 },
 vergleich(){const sel=S.compare,field=FIELDS.find(f=>f.id===S.compareField)||FIELDS[0];const fieldQuestions=fieldQs(field.id);
  return `<div class="eyebrow">Vergleich · Ebene 2</div><h1>Zwei bis drei Parteien vergleichen</h1>
  <p class="small">Als Small Multiples, feldweise und ohne Ranking. Über den Themenfilter sind alle 36 Fragen erreichbar.</p>
  <div class="chips" style="gap:8px">${PARTIES.map(p=>`<button class="pbadge" data-a="cmp" data-id="${esc(p.id)}" aria-pressed="${sel.includes(p.id)}" style="${sel.includes(p.id)?'border-color:var(--gold);background:var(--gold-soft)':''}"><span class="gl">${esc(p.code)}</span>${pTag(p)}</button>`).join('')}</div>
  <label class="field-select"><span>Themenfeld</span><select id="compare-field">${FIELDS.map(f=>`<option value="${f.id}" ${f.id===field.id?'selected':''}>${esc(f.id)} · ${esc(f.topic)}</option>`).join('')}</select></label>
  ${sel.length<2?`<div class="card"><p class="small" style="margin:0">Bitte mindestens zwei Parteien auswählen.</p></div>`:
   `<div class="compare-grid">${sel.slice(0,3).map(id=>{const p=PBY[id];return `<section class="compare-card" aria-label="${esc(pTag(p))}"><h3>${pTag(p)}</h3>
     ${fieldQuestions.map(q=>{const answer=S.answers[q.id]||{};const px=isAnswered(answer)?proximity(answer.value,partyStance(p.id,q.id)):{key:'offen',label:'nicht beantwortet'},w={hoch:100,mittel:66,gering:36,gegen:14,keine:0,offen:0}[px.key];
       return `<div class="compare-row"><a href="#/thema/${q.id}" class="compare-label">${esc(q.title)}</a><span class="small">${esc(px.label)}</span><div class="compare-track" aria-hidden="true"><i style="width:${w}%;background:${px.key==='keine'||px.key==='offen'?'var(--line-2)':px.key==='gegen'?'var(--neg)':'var(--gold)'}"></i></div></div>`;}).join('')}</section>`;}).join('')}</div>`}
  <div class="cta"><a class="btn btn-ghost" href="#/ergebnis">Zur Matrix</a></div>`;
 },
 transparenz(){return `<div class="eyebrow">Transparenz &amp; Quellen</div><h1>Nachvollziehbarkeit</h1>
  <div class="card"><dl class="meta-list"><div><dt>Modus</dt><dd>Programmatic Mode — Bundestagswahlprogramme 2025</dd></div><div><dt>Datenstand</dt><dd>${esc(DATA.meta.dataVersion)}</dd></div><div><dt>Methodik</dt><dd>Version ${esc(DATA.meta.methodologyVersion)}</dd></div><div><dt>Content</dt><dd>Version ${esc(DATA.meta.contentVersion)}</dd></div><div><dt>Status</dt><dd>${esc(DATA.meta.status)}</dd></div></dl></div>
  <div class="card"><h3>Programmbasis</h3><div class="source-list">${DATA.programs.map(p=>{const href=safeHttpsUrl(p.url);const title=S.reveal?esc(p.title):'Programmquelle';return href?`<a class="source-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer"><b>${esc(p.id)}</b> — ${title} · geprüft ${esc(p.checked_at)} ↗</a>`:`<span class="small mut"><b>${esc(p.id)}</b> — ${title}</span>`;}).join('')}</div></div>
  <div class="card"><h3>Nicht erzeugte Werte (verboten)</h3><ul class="small">${(DATA.forbiddenFields||[]).map(x=>`<li><code>${esc(x)}</code></li>`).join('')}</ul></div>
  <div class="redline"><div class="h">${warnSvg()} Übergreifende Wirkungsgrenzen</div><ul class="small" style="margin:.5em 0 0">${(DATA.globalRedLines||[]).map(r=>`<li>${esc(r)}</li>`).join('')}</ul></div>
  <div class="card"><h3>Evidenzregister (${DATA.evidence.length})</h3><div class="tblwrap"><table><thead><tr><th scope="col">ID</th><th scope="col">Institution</th><th scope="col">Thema</th><th scope="col">Quelle</th></tr></thead>
    <tbody>${DATA.evidence.map(e=>{const href=safeHttpsUrl(e.url);return `<tr><th scope="row">${esc(e.id)}</th><td>${esc(e.institution)}</td><td class="small">${esc(e.topic)}</td><td>${href?`<a class="source-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">öffnen ↗</a>`:'<span class="small mut">URL nicht verfügbar</span>'}<div class="small mut">geprüft ${esc(e.checked_at)}</div></td></tr>`;}).join('')}</tbody></table></div>
    <p class="small mut" style="margin:.6em 0 0">${(DATA.resultCopy.sources||[]).map(esc).join(' ')}</p></div>
  <div class="cta"><a class="btn btn-ghost" href="#/">Startseite</a><a class="btn btn-quiet" href="#/datenschutz">Datenschutz</a></div>`;
 },
 teilen(){const prof=shareProfile(),ready=Boolean(prof.length),disabled=ready?'':' disabled';
  return `<div class="eyebrow">Ergebnis sichern &amp; teilen</div><h1>Dein Prioritätenprofil</h1>
  <p class="small">Es zeigt <b>deine Prioritäten</b> — kein Parteibekenntnis, keine Nähewerte und kein Ranking.</p>
  <div class="share"><div style="display:flex;align-items:center;gap:9px;margin-bottom:12px"><svg width="24" height="24" viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="9" r="5.2" fill="none" stroke="var(--ink)" stroke-width="1.7"/><circle cx="9" cy="16.5" r="5.2" fill="none" stroke="var(--green)" stroke-width="1.7"/><circle cx="17" cy="16.5" r="5.2" fill="none" stroke="var(--gold)" stroke-width="1.7"/></svg><b style="font-family:var(--serif)">Meine Wirkungs-Prioritäten</b></div>
    ${prof.length?prof.map(p=>`<span class="pill">${esc(DIM_SHORT[p.id])}</span>`).join(''):'<p class="small">Noch keine gewichteten Prioritäten. Setze bei den Fragen zuerst die Wichtigkeit.</p>'}
    <p class="small" style="margin:14px 0 0">Wirkungswahl-Kompass · ${esc(DATA.meta.claim)}</p></div>
  <div class="card"><h2>In Mein Wirkungsraum speichern</h2><p class="small">Nur auf deinen Klick wird eine lokale Merkkarte mit den wichtigsten Prioritäten gespeichert. Einzelne Antworten, Parteien und Nähewerte werden nicht übernommen.</p>
    <div class="btn-row"><button class="btn btn-primary" data-a="save-priority-profile"${disabled}>In Mein Wirkungsraum speichern</button><a class="btn btn-ghost" href="../../mein-wirkungsraum/#gemerkte-inhalte">Mein Wirkungsraum öffnen</a></div></div>
  <div class="card"><h2>Download &amp; teilen</h2><p class="small">Die Dateien enthalten nur das sichtbare Prioritätenprofil und den Hinweis „keine Wahlempfehlung“.</p>
    <div class="btn-row"><button class="btn btn-ghost" data-a="download-priority-png"${disabled}>Als PNG laden</button><button class="btn btn-ghost" data-a="download-priority-pdf"${disabled}>Als PDF laden</button><button class="btn btn-quiet" data-a="download-priority-graphic"${disabled}>Als SVG laden</button><button class="btn btn-quiet" data-a="share-priority"${disabled}>Prioritäten teilen</button></div></div>
  <p id="share-status" class="small" role="status" aria-live="polite"></p>
  <div class="cta"><a class="btn btn-ghost" href="#/profil">Zum Profil</a></div>`;
 },
};

/* ---- Bausteine ---- */
function warnSvg(){return `<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2 L19 18 H1 Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><line x1="10" y1="8" x2="10" y2="12.5" stroke="currentColor" stroke-width="1.7"/><circle cx="10" cy="15" r="1" fill="currentColor"/></svg>`;}
function cta(inner){return `<div class="cta-render" data-cta="${encodeURIComponent(inner)}"></div>`;}
function emptyState(h,p,href,btn){return `<div class="card" style="text-align:center;padding:40px 18px"><h2>${esc(h)}</h2><p class="small">${p}</p><a class="btn btn-primary" href="${href}">${esc(btn)}</a></div>`;}
function notFound(){return emptyState('Nicht gefunden','Dieser Bereich existiert nicht.','#/','Zur Startseite');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function shareProfile(){return importanceProfile().filter(p=>p.val>0).sort((a,b)=>b.val-a.val).slice(0,4);}
function announceShare(message){const status=document.getElementById('share-status');if(status)status.textContent=message;}
function priorityLabels(withValue=false){return shareProfile().map(p=>{const label=DIM_SHORT[p.id]||p.id;return withValue?`${label} · Wichtigkeit ${p.val.toFixed(1).replace('.',',')} von 3`:label;});}
function priorityShareText(){const labels=priorityLabels();return `Meine Wirkungs-Prioritäten: ${labels.length?labels.join(' · '):'noch nicht festgelegt'}. Wirkungswahl-Kompass – keine Wahlempfehlung.`;}
function priorityGraphicGeometry(){return {width:1200,height:156+Math.max(shareProfile().length,1)*34};}
function priorityGraphicSvg(){const lines=priorityLabels(true),items=lines.length?lines:['Noch keine Prioritäten festgelegt'],{width,height}=priorityGraphicGeometry();const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Meine Wirkungs-Prioritäten"><rect width="${width}" height="${height}" fill="#f6f3ec"/><rect x="44" y="36" width="${width-88}" height="${height-72}" rx="28" fill="#fffdf8" stroke="#cfc7b4"/><text x="86" y="92" fill="#12213a" font-family="Georgia, serif" font-size="42" font-weight="700">Meine Wirkungs-Prioritäten</text><text x="86" y="126" fill="#775000" font-family="Arial, sans-serif" font-size="20">Wirkungswahl-Kompass · keine Wahlempfehlung</text>${items.map((item,index)=>`<text x="86" y="${178+index*34}" fill="#12213a" font-family="Arial, sans-serif" font-size="25">• ${xml(item)}</text>`).join('')}</svg>`;}
function downloadBlob(blob,filename){const href=URL.createObjectURL(blob),link=document.createElement('a');link.href=href;link.download=filename;link.hidden=true;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(href),0);}
function downloadPriorityGraphic(){downloadBlob(new Blob([priorityGraphicSvg()],{type:'image/svg+xml;charset=utf-8'}),'meine-wirkungs-prioritaeten.svg');announceShare('Die neutrale Prioritätengrafik wurde als SVG geladen.');}
function priorityGraphicCanvas(){const {width,height}=priorityGraphicGeometry();return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{try{const canvas=document.createElement('canvas'),context=canvas.getContext('2d');if(!context)throw new Error('Grafik kann nicht gerendert werden.');canvas.width=width;canvas.height=height;context.fillStyle='#f6f3ec';context.fillRect(0,0,width,height);context.drawImage(image,0,0,width,height);resolve(canvas);}catch(error){reject(error);}};image.onerror=()=>reject(new Error('Grafik kann nicht gerendert werden.'));image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(priorityGraphicSvg())}`;});}
function canvasBlob(canvas,type,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Datei kann nicht erstellt werden.')),type,quality));}
async function downloadPriorityPng(){try{const canvas=await priorityGraphicCanvas(),blob=await canvasBlob(canvas,'image/png');downloadBlob(blob,'meine-wirkungs-prioritaeten.png');announceShare('Dein Prioritätenprofil wurde als PNG geladen.');}catch(error){announceShare('PNG konnte in diesem Browser nicht erstellt werden.');}}
function dataUrlBytes(value){const binary=atob(String(value).split(',',2)[1]||''),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i+=1)bytes[i]=binary.charCodeAt(i);return bytes;}
function textBytes(value){return new TextEncoder().encode(value);}
function joinBytes(parts){const size=parts.reduce((sum,part)=>sum+part.length,0),out=new Uint8Array(size);let offset=0;parts.forEach(part=>{out.set(part,offset);offset+=part.length;});return out;}
function priorityPdfBytes(imageBytes,imageWidth,imageHeight){const pageWidth=842,pageHeight=595,margin=36,scale=Math.min((pageWidth-margin*2)/imageWidth,(pageHeight-margin*2)/imageHeight),drawWidth=imageWidth*scale,drawHeight=imageHeight*scale,x=(pageWidth-drawWidth)/2,y=(pageHeight-drawHeight)/2,content=`q\n${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ`,contentBytes=textBytes(content),objects=[textBytes('<< /Type /Catalog /Pages 2 0 R >>'),textBytes('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),textBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),joinBytes([textBytes(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`),imageBytes,textBytes('\nendstream')]),textBytes(`<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream`)],header=textBytes('%PDF-1.4\n%Wirkungswahl-Kompass\n');let offset=header.length;const offsets=[0],parts=[header];objects.forEach((object,index)=>{const before=textBytes(`${index+1} 0 obj\n`),after=textBytes('\nendobj\n');offsets.push(offset);parts.push(before,object,after);offset+=before.length+object.length+after.length;});const xrefOffset=offset;let xref=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;offsets.slice(1).forEach(value=>{xref+=`${String(value).padStart(10,'0')} 00000 n \n`;});parts.push(textBytes(`${xref}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`));return joinBytes(parts);}
async function downloadPriorityPdf(){try{const canvas=await priorityGraphicCanvas(),jpeg=dataUrlBytes(canvas.toDataURL('image/jpeg',.92)),pdf=priorityPdfBytes(jpeg,canvas.width,canvas.height);downloadBlob(new Blob([pdf],{type:'application/pdf'}),'meine-wirkungs-prioritaeten.pdf');announceShare('Dein Prioritätenprofil wurde als PDF geladen.');}catch(error){announceShare('PDF konnte in diesem Browser nicht erstellt werden.');}}
function savePriorityProfile(){const priorities=shareProfile();if(!priorities.length){announceShare('Setze zuerst die Wichtigkeit für mindestens ein Thema.');return false;}const now=new Date().toISOString();try{const store=userSpaceStore(now),saved=store.objects.saved_items,existing=saved.items.find(item=>item.id===USER_SPACE_ITEM_ID),summary=priorities.map(p=>({dimension:p.id,label:DIM_SHORT[p.id]||p.id})),item={id:USER_SPACE_ITEM_ID,type:'Werkzeug',title:'Wirkungswahl-Kompass – Meine Prioritäten',url:'/werkzeuge/wirkungswahl-kompass/#/teilen',category:'Wirkungswahl-Kompass',tags:summary.map(p=>p.label),saved_at:existing&&existing.saved_at||now,updated_at:now,synced_at:null,sync_status:'local_changed',result_summary:{kind:'priority_profile',data_version:DATA.meta.dataVersion,answered_questions:answeredQs().length,top_priorities:summary}};saved.items=[item,...saved.items.filter(entry=>entry.id!==USER_SPACE_ITEM_ID)].slice(0,300);saved.updated_at=now;saved.user_id=store.sync.user_id;saved.device_id=store.sync.device_id;saved.synced_at=null;saved.sync_status='local_changed';store.updated_at=now;localStorage.setItem(USER_SPACE_KEY,JSON.stringify(store));announceShare('Dein Prioritätenprofil wurde lokal in Mein Wirkungsraum gespeichert.');return true;}catch(error){announceShare('Mein Wirkungsraum konnte in diesem Browser nicht gespeichert werden.');return false;}}
async function sharePriority(){if(!shareProfile().length){announceShare('Setze zuerst die Wichtigkeit für mindestens ein Thema.');return;}const text=priorityShareText(),url=`${location.href.split('#')[0]}#/teilen`;try{if(navigator.share){await navigator.share({title:'Meine Wirkungs-Prioritäten',text,url});announceShare('Deine neutralen Prioritäten wurden zum Teilen vorbereitet.');return;}if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(`${text}\n${url}`);announceShare('Der neutrale Prioritäten-Text wurde in die Zwischenablage kopiert.');return;}announceShare('Teilen ist hier nicht verfügbar. Du kannst PNG oder PDF laden.');}catch(error){if(error&&error.name==='AbortError'){announceShare('Teilen abgebrochen.');}else{announceShare('Teilen ist hier nicht verfügbar. Du kannst PNG oder PDF laden.');}}}

/* ================= Router ================= */
const MENU=[['#/','Start'],['#/methodik','Methodik'],['#/fragen','Fragen'],['#/profil','Persönliches Profil'],
  ['#/ergebnis','Themenmatrix'],['#/vergleich','Vergleich'],['#/transparenz','Transparenz &amp; Quellen'],
  ['#/teilen','Ergebnis sichern &amp; teilen'],['#/datenschutz','Datenschutz'],['../../werkzeuge/','Zur Website: Werkzeuge']];
function render(focusSelector){const seg=(location.hash.replace(/^#/,'')||'/').split('/').filter(Boolean);const view=document.getElementById('view');
  let html='',name=seg[0]||'landing';
  try{
    if(!seg.length)html=SCREENS.landing();
    else if(SCREENS[name])html=(name==='partei'||name==='thema')?SCREENS[name](seg[1]):SCREENS[name]();
    else html=notFound();
  }catch(e){html=`<div class="card"><h2>Fehler</h2><p class="small">${esc(e.message)}</p></div>`;console.error(e);}
  view.innerHTML=name==='landing'?html:`${demoNote}${html}`;
  const slot=document.getElementById('cta-slot');slot.innerHTML='';
  const ctaR=view.querySelector('[data-cta]'),ctaBox=view.querySelector('.cta');
  if(ctaR){slot.innerHTML=`<div class="cta-bar"><div class="cta-in">${decodeURIComponent(ctaR.dataset.cta)}</div></div>`;ctaR.remove();document.querySelector('.wrap').style.paddingBottom='120px';}
  else if(ctaBox){ctaBox.classList.add('cta-bar');ctaBox.innerHTML=`<div class="cta-in">${ctaBox.innerHTML}</div>`;slot.appendChild(ctaBox);document.querySelector('.wrap').style.paddingBottom='120px';}
  else document.querySelector('.wrap').style.paddingBottom='60px';
  document.getElementById('menunav').innerHTML=MENU.map(m=>`<a href="${m[0]}" data-a="menu-close">${m[1]}</a>`).join('');
  document.getElementById('foot').innerHTML=`Wirkungswahl-Kompass · Programme 2025 · ${esc(DATA.meta.dataVersion)} · Keine Wahlempfehlung · <a href="#/datenschutz">Datenschutz</a> · <a href="#/transparenz">Transparenz</a> · <a href="../../werkzeuge/">Werkzeuge</a>`;
  if(focusSelector){view.querySelector(focusSelector)?.focus({preventScroll:true});}
  else if(focusSelector!==false){view.focus({preventScroll:true});window.scrollTo(0,0);}}

document.addEventListener('click',e=>{const t=e.target.closest('[data-action],[data-a]');if(!t)return;const act=t.dataset.action||t.dataset.a;
  if(act==='theme'){const c=document.documentElement.getAttribute('data-theme'),n=c==='dark'?'light':c==='light'?'':'dark';if(n)document.documentElement.setAttribute('data-theme',n);else document.documentElement.removeAttribute('data-theme');return;}
  if(act==='menu'){openSheet(true);return;} if(act==='menu-close'){openSheet(false);return;}
  if(act==='wipe'){if(confirm('Kompass-Antworten in diesem Browser löschen?')){wipe();render();}return;}
  if(act==='save-priority-profile'){savePriorityProfile();return;}
  if(act==='download-priority-graphic'){downloadPriorityGraphic();return;}
  if(act==='download-priority-png'){downloadPriorityPng();return;}
  if(act==='download-priority-pdf'){downloadPriorityPdf();return;}
  if(act==='share-priority'){sharePriority();return;}
  if(act==='reveal'){S.reveal=!S.reveal;save();render('[data-a="reveal"]');return;}
  if(act==='goto'){location.hash=t.dataset.h;return;}
  if(act==='set-value'){const v=t.dataset.v,q=Q[S.qi],a=S.answers[q.id]||{};a.value=(v==='unsure'||v==='skip')?v:parseInt(v,10);S.answers[q.id]=a;save();render(`[data-a="set-value"][data-v="${v}"]`);return;}
  if(act==='set-imp'){const q=Q[S.qi],a=S.answers[q.id]||{};a.importance=parseInt(t.dataset.w,10);S.answers[q.id]=a;save();render(`[data-a="set-imp"][data-w="${t.dataset.w}"]`);return;}
  if(act==='q-next'){S.qi=clamp(S.qi+1,0,Q.length-1);save();render();return;}
  if(act==='q-prev'){S.qi=clamp(S.qi-1,0,Q.length-1);save();render();return;}
  if(act==='cmp'){const id=t.dataset.id,i=S.compare.indexOf(id);if(i>=0)S.compare.splice(i,1);else{if(S.compare.length>=3)S.compare.shift();S.compare.push(id);}save();render(`[data-a="cmp"][data-id="${id}"]`);return;}
});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='compare-field'){S.compareField=e.target.value;save();render('#compare-field');}});
let lastFocus=null;
function openSheet(o){const sheet=document.getElementById('sheet'),app=document.querySelector('.app'),ctaSlot=document.getElementById('cta-slot'),menuButton=document.querySelector('[data-action="menu"]');
  if(o){lastFocus=document.activeElement;sheet.setAttribute('open','');app.inert=true;ctaSlot.inert=true;menuButton.setAttribute('aria-expanded','true');requestAnimationFrame(()=>sheet.querySelector('button[data-action="menu-close"]')?.focus());}
  else{sheet.removeAttribute('open');app.inert=false;ctaSlot.inert=false;menuButton.setAttribute('aria-expanded','false');if(lastFocus&&document.contains(lastFocus))lastFocus.focus();lastFocus=null;}}
document.addEventListener('keydown',e=>{const sheet=document.getElementById('sheet');if(e.key==='Escape'&&sheet.hasAttribute('open')){e.preventDefault();openSheet(false);return;}
  if(e.key==='Tab'&&sheet.hasAttribute('open')){const focusable=[...sheet.querySelectorAll('a[href],button:not([disabled]),select,input,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.hidden);if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
window.addEventListener('hashchange',()=>{openSheet(false);render();});
render();
