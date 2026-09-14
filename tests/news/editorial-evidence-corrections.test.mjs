import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {syntheticPotentialAssessment as profile} from './fixtures/impact21.mjs';
import {impactAssessmentErrors,deriveImpactPresentation,deriveAssessmentCalculations} from '../../scripts/news/impact-assessment.mjs';
import {isGroundedOpenDimension} from '../../scripts/news/impact-potential.mjs';
import {editorialEvidenceIssues} from '../../scripts/news/editorial-evidence.mjs';
import {renderDimensionMeters} from '../../scripts/news/visuals.mjs';
import {renderTitleImage,SIZES} from '../../scripts/news/title-image/index.mjs';
import {aggregateMainPaths} from '../../scripts/news/impact-magnitude.mjs';
import {assertsRealisedExAnteEffect} from '../../scripts/news/lib.mjs';
import {semanticIssues} from '../../scripts/news/impact-publication.mjs';
import {loadPersonalEditorials} from '../../scripts/news/personal-editorial.mjs';
import {validateEditorialRevisionPreview,editorialRevisionBaseHash,reviseEditorial} from '../../scripts/news/editorial-approved-revisions.mjs';
const sources=[{source_id:'official',primary_source:true}];
const open=()=>({path_status:'insufficient_basis',direction:'open',magnitude:null,evidence:'not_assessable',data_status:'missing',likelihood:'unknown',dominance:'none',temporal_status:'ex_ante',primary_paths:[],secondary_paths:[],rationale:'Der zweite Quellenabgleich liefert keinen hinreichend bestimmten Pfad.',research_pass:'second_pass',research_result:'Es fehlen konkrete Maßnahmen, Empfänger und belastbare Vergleichsdaten.',reviewed_source_ids:['official'],balance:null});
test('only democracy may be assessed, other dimensions stay explicitly open and valid',()=>{
 const a=profile();a.dimensions.human=open();a.dimensions.planet=open();a.system_check.central_dimensions=['democracy'];
 assert.deepEqual(impactAssessmentErrors(a,sources),[]);assert.deepEqual(semanticIssues(a,{sources},{secondPassComplete:true}),[]);
 const p=deriveImpactPresentation(a);assert.equal(p.dimensions.planet.magnitude,null);assert.equal(p.dimensions.planet.magnitudeBars,null);assert.equal(p.dimensions.planet.direction,'open');
 deriveAssessmentCalculations(a);assert.equal(a.dimensions.planet.magnitude,null);
 const html=renderDimensionMeters({impact_assessment:a},{compact:true,context:{privateImpactPreview:true}});
 assert.match(html,/wt-dim--human/);assert.match(html,/wt-dim--planet/);assert.match(html,/wt-dim--democracy/);
 assert.match(html,/Tragweite offen/);assert.doesNotMatch(html,/null(?: von |\/)5|data-magnitude="0"/);
});
test('open is not an escape hatch for missing research, invalid source binding or neutral zero',()=>{
 for(const patch of [{magnitude:0},{direction:'neutral'},{research_result:''},{reviewed_source_ids:['invented']},{primary_paths:[{}]}]){
  const a=profile();a.dimensions.planet={...open(),...patch};assert.ok(impactAssessmentErrors(a,sources).includes('IMPACT_OPEN_ASSESSMENT_INVALID:planet'));
 }
 assert.equal(isGroundedOpenDimension(open()),true);
});
test('unknown dimension is never silently aggregated as a zero path',()=>{
 assert.throws(()=>aggregateMainPaths([open()]));
 const a=profile();a.dimensions.planet=open();assert.equal(deriveImpactPresentation(a).dimensions.planet.magnitude,null);
});
test('open sharecard retains a labelled unknown, not a zero or null/5',()=>{
 const a=profile();a.dimensions.planet=open();
 for(const size of Object.keys(SIZES)){
  const {svg}=renderTitleImage({headline:'Synthetischer offener Befund',dimensions:deriveImpactPresentation(a).dimensions},{size,fonts:'none'});
  assert.match(svg,/data-magnitude="open"/);assert.match(svg,/Tragweite offen/);assert.doesNotMatch(svg,/null\/5|undefined\/5/);
 }
});
test('attribution is bound to the relevant headline claim, not arbitrary quotation marks',()=>{
 const claim={claim:'Zuordnung des Angriffs',attribution_required:true,headline_claim:true,headline_qualifier:'Behörde meldet'};
 const record={title:'Russischer Angriff auf Zug',editorial_evidence:{claims:[claim]}};
 assert.equal(editorialEvidenceIssues(record)[0].code,'EDITORIAL_HEADLINE_ATTRIBUTION_REQUIRED');
 record.title='Behörde meldet russischen Angriff auf Zug';assert.equal(editorialEvidenceIssues(record).length,0);
 record.title='„Russischer Angriff“';assert.ok(editorialEvidenceIssues(record).length);
});
test('official election claim needs a bound primary source, unrelated primary is insufficient',()=>{
 const r={title:'Vorläufiges Wahlergebnis',sources:[{source_id:'paper',source_function:'secondary_reporting'},{source_id:'official',source_function:'official_data'}],editorial_evidence:{claims:[{claim_type:'official_election_result',source_ids:['paper']}]} };
 assert.equal(editorialEvidenceIssues(r)[0].code,'EDITORIAL_PRIMARY_SOURCE_REQUIRED');
 r.editorial_evidence.claims[0].source_ids.push('official');assert.equal(editorialEvidenceIssues(r).length,0);
});
test('future is not serialized as observed; conditional and negated wording stays allowed',()=>{
 const r={editorial_evidence:{claims:[{claim_type:'observed_effect',temporal_status:'ex_ante'}]}};
 assert.equal(editorialEvidenceIssues(r)[0].code,'EDITORIAL_FUTURE_EFFECT_AS_OBSERVED');
 assert.equal(assertsRealisedExAnteEffect({summary:'Die Maßnahme könnte die Versorgung verbessern. Eine eingetretene Wirkung ist nicht belegt.'}),false);
});
test('strong wording triggers contextual review, not automatic deletion or party verdict',()=>{
 const issues=editorialEvidenceIssues({title:'Explosion zerstört ein Haus'});assert.equal(issues[0].severity,'warning');assert.equal(issues[0].code,'EDITORIAL_HEADLINE_FRAME_REVIEW');
});
test('inconsistent social headline is blocked',()=>{
 const issues=editorialEvidenceIssues({title:'Behörde meldet einen Angriff',editorial_evidence:{headline_surfaces:{og:'Angriff ist bestätigt',jsonld:'Behörde meldet einen Angriff'}}});
 assert.equal(issues.length,1);assert.equal(issues[0].code,'EDITORIAL_HEADLINE_SURFACE_MISMATCH');
});
test('dated factual personal revisions use the existing final approval flow and stable URL',()=>{
 const base=loadPersonalEditorials(process.cwd()).find(a=>a.analysis_id==='woek-personal-39347c140c3c919a');
 const patch={body_markdown:base.body_markdown.replace('Gesellschaftliche Wirkung','Kommunikatives Wirkungspotenzial'),correction_note:'Die mögliche Resonanz wird als Wirkungspotenzial, nicht als nachgewiesene Wirkung bezeichnet.'};
 const revision={base,target:{analysis_id:base.analysis_id,slug:base.slug,base_hash:editorialRevisionBaseHash(base)},patch};
 validateEditorialRevisionPreview({title:base.title,format:base.subtype,markdown:patch.body_markdown,editorial_revision:revision});
 const changed=reviseEditorial(base,revision,{at:'2026-09-14T12:00:00Z',content_hash:'approved-test'});
 assert.equal(changed.slug,base.slug);assert.equal(changed.published_at,base.published_at);assert.equal(changed.manual_only,true);
 assert.equal(base.body_markdown.includes('Gesellschaftliche Wirkung'),true);
});

test('native resolved evidence satisfies the primary gate without persisting source excerpts',async()=>{
 const {editorialEvidenceReceipt}=await import('../../scripts/news/editorial-evidence.mjs');
 const r={title:'Amtlicher Stand',sources:[{source_id:'amt',url:'https://example.org/result',primary_source:true}],analysis:{event_claims:[{claim:'Das amtliche Ergebnis',claim_type:'official_election_result',evidence:[{source_id:'amt',url:'https://example.org/result',excerpt:'Transienter Originaltext'}]}]}};
 assert.deepEqual(editorialEvidenceIssues(r),[]);
 const receipt=editorialEvidenceReceipt(r,'2026-09-14T12:00:00Z');assert.deepEqual(receipt.claims[0].source_ids,['amt']);assert.equal(JSON.stringify(receipt).includes('Transienter Originaltext'),false);
 assert.deepEqual(editorialEvidenceIssues({...r,analysis:{},editorial_evidence:receipt}),[]);
});
