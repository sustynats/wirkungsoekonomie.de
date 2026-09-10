import test from 'node:test';
import assert from 'node:assert/strict';
import { IMPACT_VERSION, deriveImpactPresentation, migrateImpactAssessment, impactAssessmentErrors } from '../../scripts/news/impact-assessment.mjs';
import { renderDimensionMeters } from '../../scripts/news/visuals.mjs';
import { renderTitleImageFromStory } from '../../scripts/news/title-image/index.mjs';

const sources = [{source_id:'official'}];
const path = (direction='positive', magnitude=5) => ({direction, magnitude, label:'Verbesserter Zugang zu erreichbarer Hilfe', mechanism:'Zusätzliche örtliche Angebote verkürzen den Weg zur Hilfe.', recipients:['Menschen mit erschwertem Zugang'], evidence:'medium', temporal_status:'ex_ante', material:true, same_target:true, same_baseline:true, source_ids:['official'], condition:'Wenn das vorgeschlagene Programm vollständig umgesetzt wird.'});
function profile() {
  const dimension = {direction:'positive',magnitude:5,evidence:'medium',data_status:'modelled',temporal_status:'ex_ante',primary_paths:[path()],secondary_paths:[],rationale:'Der Zugang wird unter den genannten Bedingungen erleichtert.',observed_outcome:null,balance:null};
  return {version:IMPACT_VERSION,news_event:'Eine politische Akteurin fordert ein neues Hilfsprogramm.',evaluation_target:{label:'Umsetzung des vorgeschlagenen Hilfsprogramms',type:'proposal'},baseline:'Fortführung des bestehenden Angebots ohne dieses Programm.',temporal_status:'ex_ante',systemic_relevance:'high',dimensions:Object.fromEntries(['human','planet','democracy'].map(k=>[k,structuredClone(dimension)]))};
}
test('future political proposal is potential and distinguishes statement from measure',()=>{
  const a=profile(),p=deriveImpactPresentation(a);assert.deepEqual(impactAssessmentErrors(a,sources),[]);
  assert.equal(p.dimensions.human.label,'+ Potenzial');assert.equal(p.show_target,true);assert.equal(p.evaluation_target.type,'proposal');
  assert.doesNotMatch(renderDimensionMeters({impact_assessment:a}),/\+ beobachtet/);
});
test('occurred injury is negative observed change, with future risk separate',()=>{
  const a=profile(),d=a.dimensions.human;a.temporal_status='ex_post';d.temporal_status='ex_post';d.direction='negative';d.data_status='observed';
  d.primary_paths=[{...path('negative'),label:'Menschen sind verletzt worden und benötigen Versorgung.',temporal_status:'ex_post'}];
  d.observed_outcome={change:'Die Quelle dokumentiert bereits eingetretene Verletzungen.',source_ids:['official'],attribution:'open'};
  d.secondary_paths=[{...path('negative',2),label:'Mögliche längerfristige gesundheitliche Folgeschäden'}];
  assert.deepEqual(impactAssessmentErrors(a,sources),[]);assert.equal(deriveImpactPresentation(a).dimensions.human.label,'− beobachtet');
  d.observed_outcome.source_ids=['invented'];assert.ok(impactAssessmentErrors(a,sources).includes('IMPACT_OBSERVED_OUTCOME_REQUIRED:human'));
});
test('missing data stays open and unknown, never neutral or zero',()=>{
  const a=profile(),d=a.dimensions.planet;Object.assign(d,{direction:'open',magnitude:null,evidence:'not_assessable',data_status:'missing',primary_paths:[]});
  assert.deepEqual(impactAssessmentErrors(a,sources),[]);assert.equal(deriveImpactPresentation(a).dimensions.planet.magnitude,null);
  d.direction='neutral';assert.ok(impactAssessmentErrors(a,sources).includes('IMPACT_MISSING_IS_OPEN:planet'));
});
test('explicit non-material finding is distinct from missing evidence',()=>{
  const a=profile(),d=a.dimensions.planet;Object.assign(d,{direction:'not_material',magnitude:0,primary_paths:[],rationale:'Im betrachteten Umfang ist kein materieller ökologischer Wirkpfad identifiziert.'});
  assert.deepEqual(impactAssessmentErrors(a,sources),[]);assert.equal(deriveImpactPresentation(a).dimensions.planet.label,'kein wesentlicher Wirkpfad');
});
test('positive main path plus minor adverse secondary path remains positive',()=>{
  const a=profile();a.dimensions.democracy.secondary_paths=[{...path('negative',1),evidence:'low'}];
  assert.deepEqual(impactAssessmentErrors(a,sources),[]);assert.equal(deriveImpactPresentation(a).dimensions.democracy.direction,'positive');
});
test('ambivalence requires material opposing main paths and an explicit same-baseline conflict',()=>{
  const a=profile(),d=a.dimensions.human;d.direction='ambivalent';d.primary_paths.push(path('negative',4));
  assert.ok(impactAssessmentErrors(a,sources).includes('IMPACT_AMBIVALENCE_UNSUPPORTED:human'));
  d.balance={comparable_material_paths:true,protection_boundary_decisive:false,rationale:'Beide materiellen Pfade betreffen denselben Gegenstand mit vergleichbarer Tragweite.'};
  assert.deepEqual(impactAssessmentErrors(a,sources),[]);assert.equal(deriveImpactPresentation(a).dimensions.human.label,'± gegenläufig');
  d.balance.protection_boundary_decisive=true;assert.ok(impactAssessmentErrors(a,sources).includes('IMPACT_AMBIVALENCE_UNSUPPORTED:human'));
});
test('actual propaganda or frame analysis can evaluate communication itself',()=>{
  const a=profile();a.evaluation_target={label:'Wiederholte öffentliche Verbreitung des untersuchten Narrativs',type:'communication'};
  assert.deepEqual(impactAssessmentErrors(a,sources),[]);assert.equal(deriveImpactPresentation(a).evaluation_target.type,'communication');
});
test('dossier target persists while the specific news event changes',()=>{
  const target={label:'Sicherheitsarchitektur bei möglicher Regierungsbeteiligung',type:'dossier'};
  const a=migrateImpactAssessment({}, {news_event:'Neue Einschätzung eines Nachrichtendienstes veröffentlicht.',evaluation_target:target});
  const b=migrateImpactAssessment({}, {news_event:'Parlament berät eine weitere Kontrollmaßnahme.',evaluation_target:target});
  assert.deepEqual(a.evaluation_target,b.evaluation_target);assert.notEqual(a.news_event,b.news_event);
});
test('large potential magnitude and low evidence remain independent in HTML and sharecard',()=>{
  const a=profile();a.dimensions.human.evidence='low';a.dimensions.human.primary_paths[0].evidence='low';
  assert.deepEqual(impactAssessmentErrors(a,sources),[]);assert.equal(deriveImpactPresentation(a).dimensions.human.magnitude,5);
  const html=renderDimensionMeters({impact_assessment:a});assert.match(html,/data-magnitude="5"/);assert.match(html,/Evidenz: gering/);assert.doesNotMatch(html,/Balken.*Relevanz/);
  const image=renderTitleImageFromStory({title:'Eine konkrete Nachricht',impact_assessment:a,analysis:{}},{fonts:'none'});
  assert.match(image.svg,/TRAGWEITE &amp; RICHTUNG/);assert.match(image.svg,/\+ Potenzial/);
});
test('legacy migration is idempotent, does not invent materiality or convert relevance to strength',()=>{
  const raw={analysis_type:'ex_ante',human:{relevance:'sehr hoch',tendency:'gemischt'},planet:{relevance:'gering',tendency:'offen',direction_basis:'no_path'}};
  const before=JSON.stringify(raw), a=migrateImpactAssessment(raw,{title:'Originaltitel bleibt unverändert'});
  assert.equal(a.dimensions.human.magnitude,null);assert.equal(a.dimensions.planet.direction,'open');assert.equal(a.review.status,'needs_reassessment');
  assert.deepEqual(migrateImpactAssessment({impact_assessment:a}),a);assert.equal(JSON.stringify(raw),before);
});
test('observed labels cannot be obtained from an ex-post enum alone',()=>{
  const a=profile();a.dimensions.human.temporal_status='ex_post';
  assert.ok(impactAssessmentErrors(a,sources).includes('IMPACT_OBSERVED_OUTCOME_REQUIRED:human'));assert.equal(deriveImpactPresentation(a).dimensions.human.label,'? offen');
});
