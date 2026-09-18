import test from 'node:test';
import assert from 'node:assert/strict';
import {requestWithReview, orderedReviews, requestPresentation, supplementable} from '../../admin/redaktion/review-state.js';

test('a concrete research hold outranks a stale transport receipt or pending research label',()=>{
 const p=requestPresentation({ack_status:'staged',research_status:'queued',editorial_hold:{code:'EDITORIAL_CONTEXT_MISSING',reason:'Themenbezug fehlt.'},status_note:'Bitte einen Link ergänzen.'});
 assert.equal(p.label,'Themenbezug fehlt');assert.equal(p.attention,true);assert.equal(p.description,'Bitte einen Link ergänzen.');
});

test('a source repair is not described as a completed draft or completed receipt',()=>{
 for(const state of ['queued','hold']){
  const display=requestPresentation({ack_status:'staged',status:'acknowledged',research_status:state,status_note:'Die Quellenbasis wird geprüft.'});
  assert.equal(display.label,state==='hold'?'Quellenklärung erforderlich':'Nachrecherche beauftragt');
  assert.equal(display.attention,state==='hold');assert.equal(display.description,'Die Quellenbasis wird geprüft.');
 }
 assert.equal(requestPresentation({research_status:'queued',review_status:'PUBLISHED'}).label,'Veröffentlicht');
});

test('a transport staging receipt cannot promise an approvable draft',()=>{
 assert.equal(requestPresentation({ack_status:'staged'}).label,'Weiterverarbeitung läuft');
 assert.equal(requestPresentation({ack_status:'staged',preview_available:true}).label,'Zwischenstand vorhanden');
 assert.match(requestPresentation({ack_status:'staged'}).description,/noch nicht vor/);
});

test('a failed check remains visible despite an older staging receipt',()=>{
 const state=requestPresentation({ack_status:'staged',status:'quarantined',preview_available:true,status_note:'Prüfung blockiert'});
 assert.equal(state.label,'Bearbeitung blockiert');assert.equal(state.attention,true);assert.equal(state.description,'Prüfung blockiert');
});

test('only the versioned review announces final approval readiness',()=>{
 assert.equal(requestPresentation({ack_status:'staged',review_status:'AWAITING_FINAL_APPROVAL'}).label,'Bereit für Deine Freigabe');
 assert.equal(requestPresentation({ack_status:'staged',review_status:'REVISION_REQUESTED'}).label,'Mit Kommentar zurückgegeben');
});

const request = {job_id:'book', title:null, ack_status:'staged', preview_available:true,
  publication_url:'https://wirkungsoekonomie.de/wirkungsticker/analyse/old/', status_note:'Old import error'};

test('the current return or new draft takes precedence over an older staging ACK and live edition', () => {
  for (const status of ['REVISION_REQUESTED','AWAITING_FINAL_APPROVAL','HOLD','SKIPPED','PUBLISHING']) {
    const review = {job_id:'book',title:'Current book edition',status,approval:null};
    const state = requestWithReview(request,review);
    assert.equal(state.review_status,status);
    assert.equal(state.title,review.title);
    assert.equal(state.publication_url,null);
    assert.equal(state.preview_available,false);
    assert.equal(review.approval,null);
  }
  assert.equal(request.title,null);
  assert.equal(request.preview_available,true);
});

test('verified publication is visible even though the intake retains its private staging ACK', () => {
  const url='https://wirkungsoekonomie.de/wirkungsticker/analyse/current/';
  const state=requestWithReview(request,{job_id:'book',status:'PUBLISHED',publication:{url}});
  assert.equal(state.review_status,'PUBLISHED');
  assert.equal(state.publication_url,url);
  assert.equal(state.status_note,null);
});

test('a review from another job cannot relabel a request', () => {
  assert.equal(requestWithReview(request,{job_id:'other',status:'PUBLISHED'}),request);
  assert.equal(requestWithReview(request,null),request);
});

test('pending approvals and returns stay above more recently published editions without mutating history', () => {
  const reviews=[
    {job_id:'live',status:'PUBLISHED',updated_at:'2026-09-11T02:00:00Z'},
    {job_id:'returned',status:'REVISION_REQUESTED',updated_at:'2026-09-10T23:00:00Z'},
    {job_id:'ready-old',status:'AWAITING_FINAL_APPROVAL',updated_at:'2026-09-10T22:00:00Z'},
    {job_id:'ready-new',status:'AWAITING_FINAL_APPROVAL',updated_at:'2026-09-10T23:30:00Z'},
  ];
  assert.deepEqual(orderedReviews(reviews).map(r=>r.job_id),['ready-new','ready-old','returned','live']);
  assert.equal(reviews[0].job_id,'live');
});

test('revision follow-ups open the server-bound parent review and reflect its current decision',()=>{
 const child={...request,job_id:'revision',review_job_id:'book'};
 const state=requestWithReview(child,{job_id:'book',status:'AWAITING_FINAL_APPROVAL',title:'Revised title'});
 assert.equal(state.review_job_id,'book');assert.equal(state.review_status,'AWAITING_FINAL_APPROVAL');assert.equal(state.title,'Revised title');
 assert.equal(requestWithReview(child,{job_id:'foreign',status:'PUBLISHED'}),child);
});

// Am 18.09.2026 zeigte die Freigabe zwei Rueckgaben weiter als „Mit Kommentar
// zurückgegeben“, obwohl deren Ueberarbeitung angehalten war
// (SOURCE_VERIFICATION_REQUIRED). Die Karte muss den Stand der Ueberarbeitung zeigen.
test('eine angehaltene Ueberarbeitung zeigt ihren Grund und bietet die Nachlieferung an', async () => {
  const { revisionStates, revisionLabels } = await import('../../admin/redaktion/review-state.js');
  const parentId = 'wt_20260918T091011Z_6f31ec6a01ca595b7343b821', childId = 'wt_20260918T091011Z_d499d6e90d55c99c7d8e130a';
  const review = { job_id: parentId, status: 'REVISION_REQUESTED', title: 'Wenn der Ausweichweg ausfällt' };
  const parent = { job_id: parentId, review_job_id: parentId, kind: 'opinion_analysis', status: 'accepted', brief: 'Analyse zur Ölkrise', created_at: '2026-09-18T09:10:11Z' };
  const child = { job_id: childId, review_job_id: parentId, kind: 'opinion_analysis', status: 'accepted', brief: 'Analyse zur Ölkrise', created_at: '2026-09-18T10:50:40Z',
    editorial_hold: { code: 'SOURCE_VERIFICATION_REQUIRED', reason: 'Die neue Zahl ist in keiner Quelle belegt.' }, status_note: 'Die neue Zahl ist in keiner Quelle belegt. Bitte Quelle nachreichen.' };
  const state = revisionStates([parent, child], [review]).get(parentId);
  assert.equal(state.state, 'blocked');
  assert.equal(state.label, revisionLabels.blocked);
  assert.equal(state.attention, true);
  assert.match(state.note, /in keiner Quelle belegt/);
  assert.equal(state.parent, parent, 'die Nachlieferung geht an den urspruenglichen Auftrag mit seiner Fassung');
  assert.equal(supplementable(state.parent), true);
  // Die Auftragskarte der Rueckgabe sagt dasselbe, nicht mehr „erscheint erneut“.
  const parentCard = requestPresentation(requestWithReview(parent, review, state));
  assert.equal(parentCard.label, 'Überarbeitung angehalten');
  assert.equal(parentCard.attention, true);
  assert.doesNotMatch(parentCard.description, /erscheint erneut/);
  // Die Karte des Ueberarbeitungsauftrags zeigt seinen eigenen Grund.
  const childCard = requestPresentation(requestWithReview(child, review, state));
  assert.equal(childCard.label, 'Überarbeitung angehalten');
  assert.match(childCard.description, /Quelle nachreichen/);
});

test('laufende, unveraenderte und nachgelieferte Ueberarbeitungen sind unterscheidbar', async () => {
  const { revisionStates } = await import('../../admin/redaktion/review-state.js');
  const p = 'wt_20260912T160000Z_aaaaaaaaaaaaaaaaaaaaaaaa', review = { job_id: p, status: 'REVISION_REQUESTED' };
  const kind = (felder) => ({ job_id: 'wt_20260912T170000Z_bbbbbbbbbbbbbbbbbbbbbbbb', review_job_id: p, created_at: '2026-09-12T17:00:00Z', ...felder });
  assert.equal(revisionStates([], [review]).get(p).state, 'waiting');
  assert.equal(revisionStates([kind({ status: 'queued', kind: 'opinion_analysis' })], [review]).get(p).state, 'working');
  assert.equal(revisionStates([kind({ status: 'accepted', kind: 'opinion_analysis' })], [review]).get(p).state, 'unchanged');
  assert.equal(revisionStates([kind({ status: 'accepted', kind: 'news' })], [review]).get(p).state, 'working', 'eine Meldung laeuft danach noch durch die Nachrichtenpruefung');
  assert.equal(revisionStates([kind({ status: 'quarantined', kind: 'news' })], [review]).get(p).state, 'blocked');
  const nachlieferung = { job_id: 'wt_20260918T180000Z_cccccccccccccccccccccccc', created_at: '2026-09-18T18:00:00Z', brief: `Nachlieferung zu Auftrag ${p}\n\nHier die Quelle.` };
  assert.equal(revisionStates([kind({ status: 'accepted', editorial_hold: { code: 'X' } }), nachlieferung], [review]).get(p).state, 'supplemented');
  assert.equal(revisionStates([], [{ job_id: p, status: 'AWAITING_FINAL_APPROVAL' }]).has(p), false, 'nur Rueckgaben');
});
