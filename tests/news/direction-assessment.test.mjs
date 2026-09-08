import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { directionAssessmentErrors, dimensionAssessment, DIRECTION_ASSESSMENT_VERSION, DIRECTION_SEPARATION_RULE } from '../../scripts/news/direction-assessment.mjs';
import { renderDimensionMeters, renderImpactPath, sanitizeVisuals } from '../../scripts/news/visuals.mjs';
import { buildAnalysisPrompt, validateAnalysis } from '../../scripts/news/lib.mjs';
import { shouldRetryQualityGate } from '../../scripts/news/run.mjs';
import { editorialJudgmentErrors } from '../../scripts/news/editorial-judgment.mjs';
import { analysisReaderCopy } from '../../scripts/news/reader-copy.mjs';

const sources = [{source_id:'source-999'}];
const fixture = () => ({direction_assessment_version:DIRECTION_ASSESSMENT_VERSION,
  ...Object.fromEntries(['human','planet','democracy'].map(key=>[key,{relevance:'hoch',tendency:'risiko',direction_basis:'assessed',rationale:'Fällt die spezialisierte Beratung weg, sinkt die erreichbare Hilfe. Eintritt und Ausmaß sind offen.'}]))});
const mixed = () => ({positive_path:{mechanism:'Zusätzliche Beratung erleichtert den Zugang zu Hilfe.',source_ids:['source-999']},negative_path:{mechanism:'Gleichzeitiger Mittelentzug verkürzt die Öffnungszeiten.',source_ids:['source-999']}});

test('missing, explicit uncertainty, missing pathway and unsupported balance are distinct visible states',()=>{
  const a=fixture();delete a.human.tendency;a.planet.tendency='offen';a.planet.direction_basis='no_path';a.democracy.tendency='offen';a.democracy.direction_basis='unclear';
  const before=JSON.stringify(a);const html=renderDimensionMeters(a,{compact:true});
  for(const label of ['Noch nicht eingeordnet','Kein belastbarer Wirkpfad','Wirkungsrichtung unklar'])assert.ok(html.includes(label));
  assert.doesNotMatch(html,/sr-only[^>]*>Für diese Dimension/);
  assert.equal(JSON.stringify(a),before);
  a.democracy.tendency='gemischt';assert.equal(dimensionAssessment(a,'democracy').status,'unresolved_balance');
  assert.match(renderDimensionMeters(a),/Keine belastbare Gesamtbilanz/);
});

test('fresh output must not omit the contract, direction, basis, or substantive explanation',()=>{
  assert.deepEqual(directionAssessmentErrors(fixture(),sources),[]);
  for(const [field,value,code] of [['tendency',undefined,'INVALID'],['tendency','invalid','INVALID'],['rationale',' ','RATIONALE_REQUIRED'],['direction_basis','unclear','BASIS_INVALID']]) {
    const a=fixture();a.human[field]=value;const errors=directionAssessmentErrors(a,sources,{requireCurrent:true});
    assert.ok(errors.includes(`AI_DIRECTION_${code}:human`));
    assert.ok(shouldRetryQualityGate('QUALITY_GATE_FAILED',errors,0));
  }
  const a=fixture();delete a.direction_assessment_version;
  assert.deepEqual(directionAssessmentErrors(a,sources),[], 'historical contract remains valid');
  assert.ok(directionAssessmentErrors(a,sources,{requireCurrent:true}).includes('AI_DIRECTION_ASSESSMENT_REQUIRED'));
  assert.doesNotThrow(()=>directionAssessmentErrors({},sources,{requireCurrent:true}));
});

test('unimplemented negative risk stays negative; uncertainty is not a positive counterpath',()=>{
  const a=fixture();assert.deepEqual(directionAssessmentErrors(a,sources),[]);
  assert.match(renderDimensionMeters(a),/data-direction="negative"/);
  a.human.tendency='gemischt';assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_MIXED_PATHS_REQUIRED:human'));
  Object.assign(a.human,mixed());assert.deepEqual(directionAssessmentErrors(a,sources),[]);
  assert.match(renderDimensionMeters(a),/Positiver Pfad/);assert.match(renderDimensionMeters(a),/Negativer Pfad/);
  a.human.positive_path.source_ids=['unknown'];assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_PATH_SOURCE_INVALID:human'));
  a.human.positive_path=structuredClone(a.human.negative_path);assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_MIXED_PATHS_REQUIRED:human'));
});

test('new contract is present with visuals disabled and is enforced in the production worker',()=>{
  const prompt=buildAnalysisPrompt([{story_id:'test',title:'Test',claims:[],sources:[]}],{includeVisuals:false});
  assert.ok(prompt.includes(DIRECTION_SEPARATION_RULE));assert.ok(prompt.includes('"direction_assessment_version":"1.0"'));
  assert.ok(prompt.includes('"visuals":null'));assert.ok(prompt.length<39000);
  assert.match(fs.readFileSync('scripts/news/run.mjs','utf8'),/validateAnalysis\(analysis, analysisCandidate, \{ requireDirectionAssessment: true \}\)/);
});

for (const includeVisuals of [true, false]) test(`the actual output template includes both mixed paths (visuals=${includeVisuals})`,()=>{
  const prompt=buildAnalysisPrompt([{story_id:'test',title:'Test',claims:[],sources:[]}],{includeVisuals});
  const schema=JSON.parse(prompt.split('\n').find(line=>line.startsWith('{"analyses":'))).analyses[0];
  for (const key of ['human','planet','democracy']) {
    assert.deepEqual(schema[key].positive_path,{mechanism:'string',source_ids:['string']});
    assert.deepEqual(schema[key].negative_path,{mechanism:'string',source_ids:['string']});
  }
  assert.match(prompt,/sonst beide null/);
  const analysis=fixture();
  for (const key of ['human','planet','democracy']) {
    analysis[key]={...schema[key],relevance:'hoch',tendency:'gemischt',direction_basis:'assessed',rationale:fixture()[key].rationale,...mixed()};
  }
  assert.deepEqual(directionAssessmentErrors(analysis,sources,{requireCurrent:true}),[]);
  for (const key of ['human','planet','democracy']) Object.assign(analysis[key],{tendency:'risiko',positive_path:null,negative_path:null});
  assert.deepEqual(directionAssessmentErrors(analysis,sources,{requireCurrent:true}),[], 'no invented counterpaths required for a negative judgment');
});

test('source IDs are evidence metadata, not unsupported numeric reader claims',()=>{
  const a=fixture();a.human.tendency='gemischt';Object.assign(a.human,mixed());
  assert.ok(!JSON.stringify(analysisReaderCopy(a)).includes('source-999'));
  assert.ok(JSON.stringify(analysisReaderCopy(a)).includes(a.human.positive_path.mechanism));
});

test('full validation rejects malformed fresh direction without invalidating historical publications',()=>{
  const stories=JSON.parse(fs.readFileSync('data/news/stories.json')).stories;
  const s=stories.find(s=>s.published&&validateAnalysis({source_summary:s.source_summary,...s.analysis},s,{persisted:true}).length===0);
  const a={source_summary:s.source_summary,...structuredClone(s.analysis),...fixture(),story_id:s.story_id};
  a.human.rationale='';a.democracy.tendency='invented';
  const errors=validateAnalysis(a,s,{persisted:true});
  assert.ok(errors.includes('AI_DIRECTION_RATIONALE_REQUIRED:human'));assert.ok(errors.includes('AI_DIRECTION_INVALID:democracy'));
});

test('missing single-path directions are not displayed as open judgments; orders are not MPD dimensions',()=>{
  const a={mechanisms:['Eine Maßnahme verändert das System.'],first_order:['Der Zugang zu Hilfe sinkt.'],second_order:[],third_order:[]};
  const html=renderImpactPath(a);
  assert.doesNotMatch(html,/Richtung: Offen/);assert.match(html,/keine gesonderte Richtungsbewertung/);
  assert.match(html,/nicht die drei Dimensionen Mensch, Planet und Demokratie/);
  const p={order:'first_order',path:a.first_order[0],direction:'negative',dimensions:['human'],condition:'Bei ersatzlosem Wegfall der Beratung.',evidence:'plausible_path',claim_ids:['claim']};
  const story={analysis:{...a,direction_assessment_version:'1.0'},sources,claims:[{claim_id:'claim',source_id:'source-999',claim:'Die Beratungsstelle soll geschlossen werden.'}]};
  const {visuals}=sanitizeVisuals({path_directions:[p]},story);
  const shown=renderImpactPath(a,undefined,visuals);assert.match(shown,/Bezug:/);assert.match(shown,/Mensch/);assert.match(shown,/Richtung: Negativ/);
  delete p.dimensions;assert.ok(sanitizeVisuals({path_directions:[p]},story).dropped.includes('PATH_DIMENSIONS_REQUIRED:0'));
});

test('editorial mixed direction also requires grounded positive paths',()=>{
  const all=JSON.parse(fs.readFileSync('data/news/editorial-analyses.json')).analyses;
  const a=structuredClone(all.find(a=>a.editorial_rules_version&&editorialJudgmentErrors(a).length===0));
  for(const d of Object.values(a.subject_dimensions))d.direction='mixed';
  for(const s of a.sections)for(const i of s.visual?.items||[])if(i.direction==='positive')i.direction='mixed';
  a.positive_path_checks=[];assert.ok(editorialJudgmentErrors(a).includes('EDITORIAL_POSITIVE_PATH_UNGROUNDED'));
});
