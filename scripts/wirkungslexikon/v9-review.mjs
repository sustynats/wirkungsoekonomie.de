import fs from 'node:fs';
import path from 'node:path';
import {read,atomic} from './model.mjs';
import {V9,loadStore,digest,snapshot,event} from './v9-store.mjs';

export const escape=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const reviewIndex=(base=V9)=>fs.existsSync(path.join(base,'review/index.json'))?read(path.join(base,'review/index.json')):null;
export const reviewValue=(o,base=V9)=>read(path.join(base,'snapshots',o.draftHash+'.json'));

// Deliberately limited to the keywords used by the two supplied local schemas.
// Unsupported validation keywords fail closed; no remote schema fetching.
export function schemaCheck(value,schema,root=schema,location='$'){
 const supported=new Set(['$schema','$id','title','description','$defs','$ref','type','required','properties','additionalProperties','enum','const','items','minItems','minLength','pattern','format']);
 for(const k of Object.keys(schema))if(!supported.has(k))throw Error('UNSUPPORTED_SCHEMA_KEYWORD:'+k);
 if(schema.$ref){if(!schema.$ref.startsWith('#/'))throw Error('REMOTE_SCHEMA_FORBIDDEN');const s=schema.$ref.slice(2).split('/').reduce((v,k)=>v[k],root);return schemaCheck(value,s,root,location);}
 const fail=why=>{throw Error('SCHEMA:'+location+':'+why);};
 if(schema.type){const types=[schema.type].flat();const actual=value===null?'null':Array.isArray(value)?'array':typeof value;if(!types.includes(actual))fail('type');}
 if(schema.enum&&!schema.enum.some(x=>JSON.stringify(x)===JSON.stringify(value)))fail('enum');
 if('const'in schema&&JSON.stringify(value)!==JSON.stringify(schema.const))fail('const');
 if(typeof value==='string'){
  if(schema.minLength&&value.length<schema.minLength)fail('minLength');
  if(schema.pattern&&!new RegExp(schema.pattern,'u').test(value))fail('pattern');
  if(schema.format==='date'&&(!/^\d{4}-\d\d-\d\d$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))fail('date');
 }
 if(Array.isArray(value)){if(value.length<(schema.minItems||0))fail('minItems');if(schema.items)value.forEach((v,i)=>schemaCheck(v,schema.items,root,location+'.'+i));}
 else if(value&&typeof value==='object'){
  for(const k of schema.required||[])if(!Object.hasOwn(value,k))fail('required:'+k);
  for(const [k,v]of Object.entries(value)){if(schema.properties?.[k])schemaCheck(v,schema.properties[k],root,location+'.'+k);else if(schema.additionalProperties===false)fail('additionalProperties:'+k);}
 }
 return true;
}
export function referenceObject(ref,store){
 const type={wirkungskarte:'wirkungskarte',narrativfamilie:'narrativfamilie',programmdossier:'programm_narrativ_dossier'}[ref.ref_type];
 const o=Object.values(store.objects).find(o=>o.type===type&&(o.id===ref.ref_id||o.slug===ref.ref_id));
 if(!o)throw Error('UNKNOWN_EXISTING_REFERENCE');return o;
}
export function validateReview(type,value,store,base=V9){
 const schemaFile={normalisierungsereignis:'normalisierung.json',politische_entscheidungs_vorwirkung:'entscheidungsvorwirkung.json'}[type];
 if(!schemaFile)throw Error('UNKNOWN_REVIEW_TYPE');schemaCheck(value,read(path.join(base,'review/schemas',schemaFile)));
 referenceObject(type==='normalisierungsereignis'?value:value.reference,store);
 // Editorial drafts cannot grant human source review or publication to themselves.
 if(type==='normalisierungsereignis'){
  if(!['ENTWURF','QUELLENPRUEFUNG','FACHREVIEW'].includes(value.editorial_review)||value.reviewer_id||value.revision_hash||value.source_review==='quote_and_context_verified'||value.semantic_shift?.review_status==='verified'||value.network_attribution?.review_status==='verified')throw Error('HUMAN_REVIEW_REQUIRED');
 }else{
  if(value.editorial_approval.status!=='pending'||value.editorial_approval.reviewer||value.editorial_approval.source_commit_sha||value.source_review_status!=='review_draft')throw Error('HUMAN_REVIEW_REQUIRED');
  const ids=value.sources?.map(s=>s.source_id)||[];if(new Set(ids).size!==ids.length)throw Error('DUPLICATE_SOURCE_ID');
  for(const c of [...value.documented_goals,...value.documented_communication_strategies,...value.target_decisions,...value.observations])for(const id of c.source_ids)if(!ids.includes(id))throw Error('UNKNOWN_SOURCE_REFERENCE');
  for(const d of value.target_decisions)if(d.decision_status!=='unknown'&&(!d.source_ids.length||!d.date||!d.specific_decision.trim()||!d.jurisdiction.trim()))throw Error('POLICY_SOURCE_DATE_JURISDICTION_REQUIRED');
 }
 return value;
}
export function saveReview({type,id,entry,expectedHash,reason},principal,base=V9){
 if(principal.role!=='editor'||!principal.subject)throw Error('EDITOR_REQUIRED');
 if(typeof reason!=='string'||reason.trim().length<10||reason.length>2000)throw Error('REASON_REQUIRED');
 const index=reviewIndex(base);if(!index)throw Error('REVIEW_NOT_IMPORTED');
 const key=entry.event_id||entry.analysis_id;if(!/^[a-z0-9][a-z0-9-]{2,120}$/.test(id)||key!==id)throw Error('IMMUTABLE_REVIEW_ID');
 const old=index.objects[id];if(old&&(old.type!==type||old.draftHash!==expectedHash)||!old&&expectedHash!==null)throw Error('REVISION_CONFLICT');
 const store=loadStore(base);validateReview(type,entry,store,base);
 const before=old?reviewValue(old,base):null;
 if(before&&JSON.stringify(before.reference||{ref_type:before.ref_type,ref_id:before.ref_id})!==JSON.stringify(entry.reference||{ref_type:entry.ref_type,ref_id:entry.ref_id}))throw Error('IMMUTABLE_REVIEW_REFERENCE');
 const h=snapshot(entry,base);index.objects[id]={id,type,draftHash:h,publicHash:null,status:'ENTWURF',history:[...(old?.history||[]),{at:new Date().toISOString(),subject:principal.subject,reason,revision:h}]};
 atomic(path.join(base,'review/index.json'),index);
 event(store,{action:'review_draft_saved',object:id,role:principal.role,subject:principal.subject,reason,revision:h,approvalsCreated:0},base);
 return {id,entry,revision:h,approved:false};
}
export function structured(v){
 if(v==null)return '<span>Nicht erfasst</span>';
 if(typeof v!=='object'){if(typeof v==='string'&&/^https?:\/\/\S+$/.test(v))return `<a href="${escape(v)}">${escape(v)}</a>`;return escape(v);}
 if(Array.isArray(v))return `<ul>${v.map(x=>`<li>${structured(x)}</li>`).join('')}</ul>`;
 return `<dl class="wl-facts">${Object.entries(v).map(([k,x])=>`<div class="wl-facts__full"><dt>${escape(k.replaceAll('_',' '))}</dt><dd>${structured(x)}</dd></div>`).join('')}</dl>`;
}
export function decisionHtml(d){
 const p=d.effect_potential,roles={actor_primary:'Primärquelle der Organisation',party_primary:'Primärquelle der Partei',other_primary:'Weitere Primärquelle',press_report:'Journalistischer Bericht',scientific_mechanism:'Allgemeiner wissenschaftlicher Mechanismus',judicial_original:'Gerichtlicher Originaltext',other:'Weitere Quelle'};
 const state={unknown:'Ungeklärt',proposal:'Politischer Vorschlag',draft:'Entwurf',passed:'Beschlossen',implemented:'Umgesetzt',observed:'Beobachtet'};
 const claims=items=>items.map(c=>`<p><strong>${escape(c.actor)}</strong>: ${escape(c.statement)}</p><p>Beleg-IDs: ${escape(c.source_ids.join(', '))} · Quellenprüfung offen.</p>`).join('');
 return `<p class="wl-guard">Geschützter Prüfentwurf. Wirkungspotenzial; keine gemessene Einzelwortwirkung und keine Freigabe.</p><h3>Wirkungspotenzial und Betroffene</h3>${structured(p.possible_changes)}<h4>Bedingungen</h4>${structured(p.preconditions)}<h4>Möglicherweise betroffene Gruppen</h4>${structured(p.affected_groups)}<p>Zeithorizont: ${escape({short:'kurzfristig',medium:'mittelfristig',long:'langfristig',mixed:'mehrere Zeiträume',unassessed:'noch nicht eingeordnet'}[p.time_horizon])}. Evidenzbasis: ${escape({general_research_support:'allgemeine Forschung, kein Einzelfallnachweis',case_specific_support:'fallbezogene Belege im Prüfentwurf',unassessed:'noch nicht eingeordnet'}[p.evidence_status])}.</p><p>${escape(p.limitations)}</p><h3>Erklärtes Ziel / dokumentierte Kommunikationsstrategie</h3><p>Getrennte Akteursquellen; Angaben im gelieferten Vorschlag, Einzelprüfung offen.</p>${claims(d.documented_goals)}${claims(d.documented_communication_strategies)}<h3>Interpretierte kommunikative Funktion</h3><p>${escape(d.interpreted_communicative_function.hypothesis)}</p><p>${escape(d.interpreted_communicative_function.context_limits)}</p><h3>Mögliche politische Entscheidung und Zuständigkeit</h3><p>Keine konkrete beschlossene oder vollzogene Maßnahme aus diesem Vorschlag ableiten.</p>${d.target_decisions.map(x=>`<p><strong>${escape(state[x.decision_status])}</strong>: ${escape(x.specific_decision)}</p><p>Zuständigkeit: ${escape(x.jurisdiction)}. Datum: ${escape(x.date||'offen')}. Beleg: ${escape(x.source_ids.join(', ')||'noch kein konkreter Maßnahmenbeleg')}.</p>`).join('')}<h3>Dokumentierte Verwendung und Beobachtungsart</h3>${d.observations.map(x=>`<p><strong>${escape({discourse_use:'Verwendung im Diskurs - keine Zustandsmessung',population_norm:'Normbeobachtung im Prüfentwurf',attitude:'Einstellungsbeobachtung im Prüfentwurf',behavior:'Verhaltensbeobachtung im Prüfentwurf',policy:'Politischer Vorgang im Prüfentwurf',other:'Weitere Beobachtung im Prüfentwurf'}[x.observation_type])}</strong>: ${escape(x.finding)}</p>`).join('')}<h3>Zurechnung - eigener Prüfstatus</h3><p><strong>${d.causal_attribution.status==='not_established'?'Nicht nachgewiesen':'Eigenständig zu prüfende Zurechnung'}</strong>: ${escape(d.causal_attribution.statement)}</p><h3>Mögliche Gegenwirkungen</h3>${structured(d.countereffects)}<h3>Quellen und Quellenrollen</h3><ul>${(d.sources||[]).map(s=>`<li><strong>${escape(roles[s.role])}</strong>: <a href="${escape(s.url)}">${escape(s.source_id)}</a><p>${escape(s.locator)}</p><p>Prüfdatum laut Vorschlag: ${escape(s.checked_on)}. Originalkontext und Claims noch menschlich zu prüfen.</p></li>`).join('')}</ul>`;
}
export function verifiedStationsHtml(records){
 const verified=records.filter(({content:c,revision,sourceReviewHash,expertReviewHash})=>c.source_review==='quote_and_context_verified'&&digest(c)===revision&&sourceReviewHash===revision&&expertReviewHash===revision&&c.source.date&&c.source.locator);
 if(!verified.length)return '';
 const roles={self_expression:'Eigene Formulierung',earliest_attestation_in_sample:'Frühester Beleg im untersuchten Korpus',own_media_frame:'Eigene mediale Rahmung',supportive_adoption:'Zustimmende Übernahme',neutral_report:'Neutrale Berichterstattung',direct_quote:'Zitat',critical_context:'Kritische Kontextualisierung',fact_check:'Faktencheck',parody:'Satire oder Parodie',repost:'Weiterverbreitung',unknown:'Rolle ungeklärt'};
 return '<p>Chronologische Quellenstationen. Die Reihenfolge belegt keine direkte Übernahme oder kausale Wirkung.</p><ol>'+verified.sort((a,b)=>a.content.source.date.localeCompare(b.content.source.date)).map(({content:c})=>`<li><time>${escape(c.source.date)}</time><p><strong>${escape(roles[c.use_role])}</strong> · ${escape(c.actor_name||c.medium_or_platform||'Urheber offen')}</p>${c.use_role==='fact_check'?'<p>Widerlegung oder Kontextualisierung ist von bloßer Wiederholung getrennt zu prüfen.</p>':''}<p>${escape(c.quote_excerpt)}</p><p><a href="${escape(c.source.url)}">${escape(c.source.title)}</a> · ${escape(c.source.locator)}</p>${c.normalization_hypothesis?'<h4>Mögliche sprachliche Normalisierung</h4>'+structured(c.normalization_hypothesis):''}${c.observed_norm_change?'<h4>Eigenständig erhobene Beobachtung</h4>'+structured(c.observed_norm_change):''}<p>Keine automatische Einstellungs-, Koordinations- oder Urheberzuschreibung.</p></li>`).join('')+'</ol>';
}
export function reviewPresentation(base=V9){
 const index=reviewIndex(base);if(!index)return {bySlug:{},extraPages:[],templates:{}};
 const store=loadStore(base),bySlug={},byReference={};
 const card=(slug)=>bySlug[slug]||=( {qa:[],patches:[],journal:null,decisions:[],events:[]} );
 for(const table of Object.values(index.tables))for(const row of table.rows)if(row.slug)card(row.slug).qa.push({table:table.name,content:row});
 for(const x of index.journal)card(x.slug).journal=x;
 for(const x of index.patches)card(x.slug).patches.push(x);
 for(const x of index.tables.BEOBACHTETE_REAKTIONEN_ROLLENPRUEFUNG_21.rows)card(x.slug).observationRole=x;
 for(const o of Object.values(index.objects)){
  const value=reviewValue(o,base);const ref=o.type==='normalisierungsereignis'?value:value.reference;const target=referenceObject(ref,store);
  if(target.slug)card(target.slug)[o.type==='normalisierungsereignis'?'events':'decisions'].push(o.type==='normalisierungsereignis'?{content:value,revision:o.draftHash,sourceReviewHash:o.sourceReviewHash,expertReviewHash:o.expertReviewHash}:value);
  else{const group=byReference[target.id]||=( {events:[],decisions:[]} );group[o.type==='normalisierungsereignis'?'events':'decisions'].push(o.type==='normalisierungsereignis'?{content:value,revision:o.draftHash,sourceReviewHash:o.sourceReviewHash,expertReviewHash:o.expertReviewHash}:value);}
 }
 // Events intentionally remain absent from the chronological view until signed review exists.
 for(const c of Object.values(bySlug)){
  c.reviewHtml=`<p>Getrennte Prüfobjekte, unveränderte Kartenversion. Kein Vorschlag ist angenommen.</p>${c.journal?'<h3>Journalistischer Arbeitsvorschlag</h3>'+structured(c.journal):''}<h3>Quellen- und Statusachsen</h3>${c.qa.map(x=>`<details><summary>${escape(x.table)}</summary>${structured(x.content)}</details>`).join('')}${c.patches.length?'<h3>Vorgeschlagene Änderungen - Vorher / Nachher</h3>'+c.patches.map(x=>`<details data-review-patch="${escape(x.review_id)}"><summary>${escape(x.op+' · '+x.path)}</summary><h4>Aktueller Wert im V8-Draft</h4>${structured(x.actual_before)}<h4>Vorher-Angabe des Lieferpakets</h4>${structured(x.vorher)}<h4>Vorgeschlagener Wert</h4>${structured(x.vorschlag)}<p>${escape(x.grund)}</p><p>REDAKTIONELL_OFFEN · ${escape(x.review_id)}</p></details>`).join(''):''}<p><a href="/wirkungslexikon/redaktion/pruefungen/">Alle Prüfobjekte und Änderungsvorschläge</a></p>`;
  c.decisionHtml=c.decisions.map(decisionHtml).join('');
  c.stationHtml=verifiedStationsHtml(c.events);
 }
 const template=index.templates;
 const options=Object.values(index.objects).map(o=>`<option value="${escape(o.id)}">${escape(o.type+' · '+o.id)}</option>`).join('');
 const form=`<h2>Zusatzobjekte bearbeiten</h2><p>Entwürfe speichern; keine fachliche Bestätigung und keine Veröffentlichung. Das Normalisierungsregister ist derzeit leer.</p><form id="wl-review-editor" class="wl-stack wl-editor"><div class="wl-field"><label for="review-select">Objekt oder neuer Entwurf</label><select id="review-select">${options}<option value="new-normalisierungsereignis">Neue beleggebundene Verwendungsstation</option><option value="new-politische_entscheidungs_vorwirkung">Neue begründete Entscheidungs-Hypothese</option></select></div><div class="wl-field"><label for="review-json">Strukturierte Daten</label><textarea id="review-json" spellcheck="false" required></textarea></div><div class="wl-field"><label for="review-reason">Änderungsgrund</label><input id="review-reason" required minlength="10" maxlength="2000"></div><button class="wl-btn" type="submit">Zusatzentwurf speichern</button><p id="review-result" role="status" aria-live="polite"></p></form>`;
 const rows=index.patches.map(x=>`<li data-review-item><details><summary>${escape(x.slug+' · '+x.op)}</summary><p><a href="/wirkungslexikon/${escape(x.slug)}/">Karte mit Quellenstatus öffnen</a></p><p>Revision: ${escape(x.base_revision)} · ${escape(x.review_id)} · REDAKTIONELL_OFFEN</p><h3>Pfad</h3><p>${escape(x.path)}</p><h3>Aktueller Wert</h3>${structured(x.actual_before)}<h3>Geliefertes Vorher</h3>${structured(x.vorher)}<h3>Vorschlag</h3>${structured(x.vorschlag)}<h3>Begründung und Quellen</h3><p>${escape(x.grund)}</p>${structured(x.quellen)}</details></li>`).join('');
 const html=`<div class="wl-container wl-prose wl-section-space"><h1>Redaktionelle Prüfobjekte</h1><p>180 Karten, 20 Narrativfamilien, 21 Programm-Dossiers bleiben getrennt. 48 historische Sperren und 63 Quellenfälle sind eigene Statusachsen. 137 Vorschläge, 0 angenommene Änderungen. 0 freigegebene Verwendungsstationen.</p><p><a href="/wirkungslexikon/redaktion/">Karten- und Dossierredaktion</a> · <a href="/wirkungslexikon/afd-remigration/#entscheidungs-vorwirkung">Remigration: geschützter Hypothesenentwurf</a></p>${form}<h2>137 Vorher-/Nachher-Vorschläge</h2><label for="review-search">Vorschläge nach Karte, Operation oder Text durchsuchen</label><input class="wl-input" id="review-search" type="search"><p id="review-count" role="status" aria-live="polite">137 Vorschläge</p><ul>${rows}</ul><h2>Quellenregister: gemeinsame Vorlage, Einzelbeleg bleibt erforderlich</h2>${structured(index.tables.QUELLENREGISTER_NACHTRAG_30_PRUEFFELDER.rows)}<h2>Medienfundstellen: getrennte Rollen</h2>${structured(index.media)}</div>`;
 const tableHtml='<h2>Alle gelieferten Prüftabellen</h2>'+Object.values(index.tables).map(t=>`<details><summary>${escape(t.name)} (${t.rows.length} Datensätze)</summary>${structured(t.rows)}</details>`).join('');
 return {byReference:Object.fromEntries(Object.entries(byReference).map(([id,c])=>[id,{stationHtml:verifiedStationsHtml(c.events),decisionHtml:c.decisions.map(decisionHtml).join('')}])),bySlug:Object.fromEntries(Object.entries(bySlug).map(([slug,c])=>[slug,{reviewHtml:c.reviewHtml,decisionHtml:c.decisionHtml,stationHtml:c.stationHtml,observationRole:c.observationRole}])),templates:template,extraPages:[{rel:'redaktion/pruefungen/',title:'Quellenprüfung und redaktionelle Vorschläge',html:html.replace(/<\/div>$/,tableHtml+'</div>')}]};
}
