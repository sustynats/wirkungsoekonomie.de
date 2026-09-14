import test from 'node:test';
import assert from 'node:assert/strict';
import { IMPACT_SCOPE_REVISION, impactScopeErrors } from '../../scripts/news/impact-scope.mjs';
import { derivePublicationStatus, SEMANTIC_CHECKS } from '../../scripts/news/impact-publication.mjs';
import { reviewResponseFormat } from '../../scripts/news/bridge/review-response-schema.mjs';
import { semanticOutputSchema } from '../../scripts/news/bridge/semantic-review.mjs';
import { parsePacket } from '../../scripts/news/bridge/contract.mjs';
import { syntheticPotentialAssessment, syntheticPotentialPath } from './fixtures/impact21.mjs';
const sources=[{source_id:'official'}];
function witness(a){return {version:IMPACT_SCOPE_REVISION,target:{label:a.evaluation_target.label,relation_to_news:'underlying_subject',underlying_subject:'Der in der synthetischen Ereignisquelle beschriebene Eingriff.',rationale:'Die Sachmaßnahme ist der Gegenstand; die Meldung ist nur der Anlass.',source_ids:['official']},baseline:{label:a.baseline,kind:'without_target',rationale:'Verglichen wird der bestehende Zustand ohne die geprüfte Maßnahme.'},paths:Object.entries(a.dimensions).flatMap(([dimension,d])=>['primary_paths','secondary_paths'].flatMap(path_set=>d[path_set].map((p,path_index)=>({dimension,path_set,path_index,target_relation:p.same_target?'same_target':'other_target',reference:p.same_baseline?'assessment_baseline':'other_baseline',baseline:p.same_baseline?a.baseline:'Abweichender früherer Vorschlag ohne seine spätere Nachbesserung.',effect_role:'substantive_change',rationale:'Dieser bedingte Pfad verändert eine Funktion gegenüber dem definierten Ausgangszustand.'}))))};}
function review(scope){return {status:'ready',checks:Object.fromEntries(SEMANTIC_CHECKS.map(k=>[k,{status:'pass',rationale:'Synthetischer unabhängig geprüfter Befund für diesen Test.'}])),findings:[],...(scope?{scope}:{})};}

test('fresh generation requires independent target and every final path role; historical receipt schema stays compatible',()=>{
 const format=reviewResponseFormat(syntheticPotentialAssessment());
 assert.ok(format.schema.properties.review.required.includes('scope'));
 assert.equal(format.schema.properties.review.properties.scope.properties.version.enum[0],IMPACT_SCOPE_REVISION);
 assert.ok(!semanticOutputSchema.properties.review.required.includes('scope'));
 parsePacket(JSON.stringify(review()),semanticOutputSchema.properties.review);
});
test('a substantive asymmetric verdict remains publishable without invented positive counterpaths',()=>{
 const a=syntheticPotentialAssessment();
 const s=witness(a);
 assert.deepEqual(impactScopeErrors(s,a,sources),[]);
 assert.deepEqual(derivePublicationStatus(a,{sources},{review:review(s),secondPassComplete:true}),{status:'ready',issues:[]});
});
test('warning-labelled target cannot be confirmed as the underlying measure merely with all pass checks',()=>{
 const a=syntheticPotentialAssessment();a.evaluation_target={label:'Warnung vor der möglichen Maßnahme im synthetischen Test',type:'communication'};
 const s=witness(a);
 const gate=derivePublicationStatus(a,{sources},{review:review(s),secondPassComplete:true});
 assert.equal(gate.status,'needs_review');assert.ok(gate.issues.includes('IMPACT_SCOPE_COMMUNICATION_CONFLICT'));
 // An explicitly justified communication subject remains a legitimate subject.
 s.target.relation_to_news='communication_itself';
 s.target.rationale='Die Untersuchung gilt ausdrücklich der Rezeption dieser Kommunikation.';
 assert.deepEqual(impactScopeErrors(s,a,sources),[]);
});
test('mitigation of a worse alternative cannot hide as a positive main counterpath behind true scope flags',()=>{
 const a=syntheticPotentialAssessment(),s=witness(a);
 s.paths[0].effect_role='risk_mitigation';
 const gate=derivePublicationStatus(a,{sources},{review:review(s),secondPassComplete:true});
 assert.equal(gate.status,'needs_review');assert.ok(gate.issues.includes('IMPACT_SCOPE_MAIN_ROLE_INVALID:human:primary_paths:0'));
 s.paths[0].effect_role='substantive_change';s.paths[0].reference='other_baseline';s.paths[0].baseline='Ein ungünstigerer Entwurf mit noch größerem Eingriff.';
 assert.ok(impactScopeErrors(s,a,sources).includes('IMPACT_SCOPE_PATH_BINDING_CONFLICT:human:primary_paths:0'));
});
test('a protection measure assessed in its own right may have positive substantive benefits',()=>{
 const a=syntheticPotentialAssessment();a.evaluation_target={label:'Einbau einer Rückhaltung an einer bestehenden gefährdeten Anlage',type:'measure'};a.baseline='Betrieb derselben Anlage ohne die zusätzlich vorgeschlagene Rückhaltung.';
 const s=witness(a);
 assert.deepEqual(impactScopeErrors(s,a,sources),[]);
});
test('different target or comparison is allowed separately but must not be falsely bound to the aggregate',()=>{
 const a=syntheticPotentialAssessment();a.dimensions.planet.secondary_paths.push(syntheticPotentialPath({same_target:false,same_baseline:false,type:'side_effect'}));
 const s=witness(a);s.paths.find(p=>p.path_set==='secondary_paths').effect_role='other_measure';
 assert.deepEqual(impactScopeErrors(s,a,sources),[]);
});
test('scope review covers replaced paths exactly, including duplicate, missing and nonexistent addresses',()=>{
 const a=syntheticPotentialAssessment(),s=witness(a);
 s.paths.pop();assert.ok(impactScopeErrors(s,a,sources).includes('IMPACT_SCOPE_PATH_UNREVIEWED:democracy:primary_paths:0'));
 s.paths.push(s.paths[0]);assert.ok(impactScopeErrors(s,a,sources).includes('IMPACT_SCOPE_PATH_ADDRESS_INVALID'));
 s.paths.at(-1).path_index=99;assert.ok(impactScopeErrors(s,a,sources).includes('IMPACT_SCOPE_PATH_ADDRESS_INVALID'));
});
test('witness binds final target, baseline and actual sources, without retrospectively invalidating absent legacy scope',()=>{
 const a=syntheticPotentialAssessment(),s=witness(a);
 s.target.source_ids=['invented'];s.baseline.label='Ein anderer Vergleich als im geprüften Profil.';
 assert.ok(impactScopeErrors(s,a,sources).includes('IMPACT_SCOPE_TARGET_INVALID'));
 assert.ok(impactScopeErrors(s,a,sources).includes('IMPACT_SCOPE_BASELINE_INVALID'));
 assert.deepEqual(impactScopeErrors(undefined,a,sources),[]);
});
test('a researched open dimension needs no invented scope paths or numerical factors',()=>{
 const a=syntheticPotentialAssessment();a.dimensions.planet.primary_paths=[];
 const s=witness(a);
 assert.deepEqual(impactScopeErrors(s,a,sources),[]);
 assert.equal(s.paths.filter(p=>p.dimension==='planet').length,0);
});

test('fresh release rejects historical null but old receipt stays readable and no model is invented',()=>{
 const a=syntheticPotentialAssessment(),open={path_status:'insufficient_basis',direction:'open',magnitude:null,evidence:'not_assessable',data_status:'missing',temporal_status:'ex_ante',likelihood:'unknown',dominance:'none',primary_paths:[],secondary_paths:[],balance:null,rationale:'Nach der damaligen Prüfung verblieb eine ausdrücklich dokumentierte Wissenslücke.',research_pass:'second_pass',research_result:'Die historische Recherche begrenzte den untersuchten Modellierungsraum ausdrücklich.',reviewed_source_ids:['official']};
 a.dimensions.planet=open;
 const legacy=derivePublicationStatus(a,{sources},{review:review(),secondPassComplete:true});
 assert.equal(legacy.status,'ready');
 const fresh=derivePublicationStatus(a,{sources},{review:review(witness(a)),secondPassComplete:true,requireScope:true});
 assert.equal(fresh.status,'needs_review');assert.ok(fresh.issues.includes('IMPACT_FRESH_MODELLED_DIMENSION_REQUIRED:planet'));
 const format=reviewResponseFormat(a);
 assert.deepEqual(format.schema.$defs.dimension.properties.path_status.enum,['modelled']);
 assert.ok(!format.schema.properties.assessment_result.anyOf.some(branch=>branch.properties.action.enum.includes('confirm')));
 assert.ok(format.schema.properties.assessment_result.anyOf.some(branch=>branch.properties.action.enum.includes('hold')));
 assert.equal(a.dimensions.planet.magnitude,null);
});
test('fresh independent input cannot omit scope and claim publication readiness',()=>{
 const a=syntheticPotentialAssessment();
 assert.ok(derivePublicationStatus(a,{sources},{review:review(),secondPassComplete:true,requireScope:true}).issues.includes('IMPACT_SCOPE_REQUIRED'));
});
test('unmeasured price change can retain negative modelled potential, low evidence and a justified range',()=>{
 const a=syntheticPotentialAssessment();a.news_event='Eine Quelle berichtet einen Preisanstieg ohne gemessene Haushaltsfolgen.';
 a.evaluation_target={label:'Bedingter Verlust des Zugangs zu einem lebenswichtigen Angebot',type:'development'};
 for(const d of Object.values(a.dimensions)){d.primary_paths[0].epistemic_basis='model_hypothesis';d.primary_paths[0].evidence='low';d.primary_paths[0].direction='negative';d.primary_paths[0].magnitude_range={lower:2,upper:4,rationale:'Synthetisch begründete Bandbreite der bedingten Modellannahme.'};d.direction='negative';d.dominance='dominant_negative';d.evidence='low';d.likelihood='unknown';}
 const gate=derivePublicationStatus(a,{sources},{review:review(witness(a)),secondPassComplete:true,requireScope:true});
 assert.equal(gate.status,'ready');assert.ok(Object.values(a.dimensions).every(d=>d.magnitude===3));
});

test('publication admission is independent of legacy scope while historical presentation remains compatible',()=>{
 const a=syntheticPotentialAssessment();a.dimensions.planet={path_status:'insufficient_basis',direction:'open',magnitude:null,evidence:'not_assessable',data_status:'missing',temporal_status:'ex_ante',likelihood:'unknown',dominance:'none',primary_paths:[],secondary_paths:[],balance:null,rationale:'Historisch nach Recherche ausdrücklich nicht ausreichend eingrenzbare Dimension.',research_pass:'second_pass',research_result:'Historische Recherche mit dokumentierter Grenze und geprüfter Quelle.',reviewed_source_ids:['official']};
 const before=structuredClone(a);
 assert.equal(derivePublicationStatus(a,{sources},{review:review(),secondPassComplete:true}).status,'ready');
 const gate=derivePublicationStatus(a,{sources},{review:review(),secondPassComplete:true,requireModelledDimensions:true});
 assert.equal(gate.status,'needs_review');assert.ok(gate.issues.includes('IMPACT_FRESH_MODELLED_DIMENSION_REQUIRED:planet'));
 assert.deepEqual(a,before);
});
