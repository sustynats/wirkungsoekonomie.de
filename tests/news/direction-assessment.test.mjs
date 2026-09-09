import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { directionAssessmentErrors, directionInputDiagnostics, dimensionAssessment, normalizeEmptyDirectionPaths, DIRECTION_ASSESSMENT_VERSION, DIRECTION_SEPARATION_RULE, DIRECTION_REFERENCE_RULE, NEWS_DIMENSION_SCHEMA } from '../../scripts/news/direction-assessment.mjs';
import { renderDimensionMeters, renderImpactPath, sanitizeVisuals } from '../../scripts/news/visuals.mjs';
import { buildAnalysisPrompt, validateAnalysis } from '../../scripts/news/lib.mjs';
import { analysisValidationDiagnostics, shouldRetryQualityGate } from '../../scripts/news/run.mjs';
import { editorialJudgmentErrors } from '../../scripts/news/editorial-judgment.mjs';
import { analysisReaderCopy } from '../../scripts/news/reader-copy.mjs';
import { resolveEvidenceReferences, sourceEvidenceSegments } from '../../scripts/news/newsroom.mjs';

const sources = [{source_id:'source-999'}];
const path = mechanism => ({mechanism,state_change:mechanism,condition:'Wenn die angekündigte Änderung umgesetzt wird.',effect_role:'substantive_change',source_ids:['source-999'],effect_type:'independent_change',reference:'assessment_baseline'});
const fixture = () => ({direction_assessment_version:DIRECTION_ASSESSMENT_VERSION,
  assessment_frame:{subject:'Änderung der erreichbaren Beratungsangebote.',baseline:'Fortführung der bisherigen Beratungsangebote ohne den Eingriff.',object_kind:'proposed_measure'},
  ...Object.fromEntries(['human','planet','democracy'].map(key=>[key,{relevance:'hoch',tendency:'risiko',direction_basis:'assessed',rationale:'Fällt die spezialisierte Beratung weg, sinkt die erreichbare Hilfe. Eintritt und Ausmaß sind offen.',positive_path:null,negative_path:path('Mittelentzug verkürzt die Öffnungszeiten der Beratungsstelle.')}]))});
const mixed = () => ({positive_path:path('Zusätzliche Beratung erleichtert den Zugang zu Hilfe.'),negative_path:path('Gleichzeitiger Mittelentzug verkürzt die Öffnungszeiten.')});

test('exact empty optional path objects normalize to null without changing the judgment',()=>{
  const a=fixture();for(const key of ['human','planet','democracy'])Object.assign(a[key],{tendency:'offen',direction_basis:'no_path'});
  for(const key of ['human','planet','democracy'])Object.assign(a[key],{positive_path:{mechanism:'',source_ids:[]},negative_path:{mechanism:'  ',source_ids:[]}});
  const original=directionInputDiagnostics(a,sources),rationales=Object.values(a).filter(x=>x?.rationale).map(x=>x.rationale);
  assert.equal(normalizeEmptyDirectionPaths(a).length,6);
  assert.deepEqual(normalizeEmptyDirectionPaths(a),[], 'idempotent');
  assert.deepEqual(directionAssessmentErrors(a,sources,{requireCurrent:true}),[]);
  assert.deepEqual(Object.values(a).filter(x=>x?.rationale).map(x=>x.rationale),rationales);
  assert.equal(original.planet.positive_path.mechanism_chars,0);
  assert.equal(analysisValidationDiagnostics(a,'',{sources},undefined,original).direction_input.planet.positive_path.shape,'object');
});

test('empty-path normalization never deletes incomplete evidence, content, extra fields or mixed requirements',()=>{
  for(const path of [{mechanism:'',source_ids:['unknown']},{mechanism:'Noch offen',source_ids:[]},{mechanism:'',source_ids:[],extra:'content'},{mechanism:null,source_ids:[]},{mechanism:'',source_ids:null},{},'null',[],{mechanism:'string',source_ids:['string']}]) {
    const a=fixture();a.human.positive_path=path;const before=JSON.stringify(a);
    assert.deepEqual(normalizeEmptyDirectionPaths(a),[]);assert.equal(JSON.stringify(a),before);
    assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_PATH_SOURCE_INVALID:human'));
  }
  const a=fixture();a.human.tendency='gemischt';a.human.positive_path={mechanism:'',source_ids:[]};a.human.negative_path={mechanism:'',source_ids:[]};
  assert.deepEqual(normalizeEmptyDirectionPaths(a),[]);
  assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_MIXED_PATHS_REQUIRED:human'));
  delete a.direction_assessment_version;a.human.tendency='risiko';assert.deepEqual(normalizeEmptyDirectionPaths(a),[], 'no historical migration');
});

test('an explicitly absent path permits empty enum templates, but no substantive or uncertain judgment is erased',()=>{
  const template=()=>({mechanism:'',source_ids:[],effect_type:'procedural_possibility',reference:'assessment_baseline'});
  for(const mechanism of ['', 'null']) {
    const a=fixture();Object.assign(a.planet,{tendency:'offen',direction_basis:'no_path',positive_path:{...template(),mechanism},negative_path:null});
    assert.deepEqual(normalizeEmptyDirectionPaths(a),['planet.positive_path']);
    assert.deepEqual(directionAssessmentErrors(a,sources,{requireCurrent:true}),[]);
  }
  for(const changed of [{mechanism:'Ein begründeter Wirkpfad ist nicht leer.'},{source_ids:['source-999']},{extra:'content'},{effect_type:'unknown'},{reference:'anderer politischer Vergleich'}]) {
    const a=fixture();Object.assign(a.planet,{tendency:'offen',direction_basis:'no_path',positive_path:{...template(),...changed},negative_path:null});
    const before=JSON.stringify(a);assert.deepEqual(normalizeEmptyDirectionPaths(a),[]);assert.equal(JSON.stringify(a),before);
  }
  for(const basis of ['assessed','unclear']) {
    const a=fixture();a.human.positive_path=template();a.human.direction_basis=basis;
    if(basis==='unclear')a.human.tendency='offen';
    assert.deepEqual(normalizeEmptyDirectionPaths(a),[]);
  }
});

const referenceStory=()=>({sources:[{source_id:'source-999',url:'https://example.org/one',title:'Die Beratung soll zusätzliche Öffnungszeiten erhalten.',summary:'Der Bericht beschreibt weitere geplante Veränderungen.'},{source_id:'source-other',url:'https://example.org/two',title:'Die Förderung einer anderen Beratungsstelle soll entfallen.'}]});

test('path evidence aliases resolve only through the actual supplied story catalog',()=>{
  const a=fixture();a.human.tendency='gemischt';Object.assign(a.human,mixed());
  a.human.positive_path.source_ids=['e0_0','e0_1','source-999'];a.human.negative_path.source_ids=['e1_0'];
  const story=referenceStory(),before=structuredClone(story),diagnostics={};
  const mechanisms=[a.human.positive_path.mechanism,a.human.negative_path.mechanism];
  resolveEvidenceReferences(a,story,['e0_0','e0_1','e1_0'],diagnostics);
  assert.deepEqual(a.human.positive_path.source_ids,['source-999'], 'multiple passages are still one source');
  assert.deepEqual(a.human.negative_path.source_ids,['source-other']);
  assert.deepEqual([a.human.positive_path.mechanism,a.human.negative_path.mechanism],mechanisms);
  assert.deepEqual(directionAssessmentErrors(a,story.sources,{requireCurrent:true}),[]);
  assert.deepEqual(diagnostics,{supplied_evidence_refs:3,unknown_refs:0,resolved_refs:3,resolved_paths:2});
  assert.deepEqual(story,before);const after=JSON.stringify(a);resolveEvidenceReferences(a,story,['e0_0']);assert.equal(JSON.stringify(a),after);
});

test('unknown, unsent, foreign and malformed path references remain rejected without guessing',()=>{
  const story=referenceStory();
  const hashId=sourceEvidenceSegments(story.sources[0])[0].evidence_id;
  for(const refs of [['e0_1'],[hashId],['e9_0'],['e0_0','unknown'],['0'],[0],[null],[{evidence_id:'e0_0'}],['https://example.org/one']]) {
    const a=fixture();a.human.tendency='gemischt';Object.assign(a.human,mixed());a.human.positive_path.source_ids=refs;
    const before=JSON.stringify(a.human.positive_path),d={};
    resolveEvidenceReferences(a,story,['e0_0','e9_0'],d);
    assert.equal(JSON.stringify(a.human.positive_path),before,'no partial reference repair');
    assert.ok(directionAssessmentErrors(a,story.sources).includes('AI_DIRECTION_PATH_SOURCE_INVALID:human'));
    assert.ok(d.unknown_refs>0);assert.equal(d.resolved_refs,0);
  }
  const a=fixture();a.human.positive_path={mechanism:'',source_ids:['e0_0']};resolveEvidenceReferences(a,story,['e0_0']);
  assert.ok(directionAssessmentErrors(a,story.sources).includes('AI_DIRECTION_PATH_SOURCE_INVALID:human'),'resolving a reference does not supply a missing mechanism');
});

test('direction diagnostics retain only shape and counts, never provider text or source IDs',()=>{
  const a=fixture();
  for (const [path,shape] of [[undefined,'missing'],[null,'null'],['null','string'],[{},'object'],[[],'array'],[false,'boolean']]) {
    a.human.positive_path=path;
    const before=JSON.stringify(a),d=directionInputDiagnostics(a,sources).human.positive_path;
    assert.equal(d.shape,shape);assert.equal(d.literal_null,path==='null');
    assert.equal(JSON.stringify(a),before);
  }
  a.human.positive_path={mechanism:'PRIVATE UNTRUSTED MODEL TEXT',source_ids:['source-999','PRIVATE UNKNOWN SOURCE'],effect_type:'PRIVATE EFFECT',reference:'PRIVATE REFERENCE',PRIVATE_KEY:'PRIVATE VALUE'};
  const d=analysisValidationDiagnostics(a,'',{sources}).direction_input;
  assert.equal(d.human.positive_path.mechanism_chars,'PRIVATE UNTRUSTED MODEL TEXT'.length);
  assert.equal(d.human.positive_path.source_ids_count,2);
  assert.equal(d.human.positive_path.known_source_ids_count,1);
  assert.equal(d.human.positive_path.effect_type_shape,'string');
  assert.equal(d.human.positive_path.effect_type,null);
  assert.equal(d.human.positive_path.reference_shape,'string');
  assert.equal(d.human.positive_path.reference,null);
  assert.doesNotMatch(JSON.stringify(d),/PRIVATE|UNTRUSTED|source-999/);
  assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_PATH_SOURCE_INVALID:human'));
  assert.doesNotThrow(()=>directionInputDiagnostics(null));
});

test('MPD output schema enumerates the exact reference contract, without silently repairing model judgments',()=>{
  for(const key of ['positive_path','negative_path']) {
    assert.equal(NEWS_DIMENSION_SCHEMA[key].effect_type,'independent_change|mitigation_only|unrealized_benefit|procedural_possibility');
    assert.equal(NEWS_DIMENSION_SCHEMA[key].reference,'assessment_baseline|other_baseline');
  }
  const a=fixture();
  const d=directionInputDiagnostics(a,sources).human.negative_path;
  assert.equal(d.effect_type,'independent_change');assert.equal(d.reference,'assessment_baseline');
  a.human.negative_path.reference='comparison with previous state';
  const before=JSON.stringify(a);
  assert.ok(directionAssessmentErrors(a,sources,{requireCurrent:true}).includes('AI_DIRECTION_PATH_REFERENCE_INVALID:human'));
  assert.equal(JSON.stringify(a),before,'a free-text comparison must not be silently declared equivalent');
  const prompt=buildAnalysisPrompt([{story_id:'test',title:'Test',claims:[],sources:[]}]);
  assert.match(prompt,/jede Zahl muss in den zitierten Segmenten stehen/);
  assert.match(prompt,/effect_type\/reference sind Pflichtfelder/);
});

test('missing, explicit uncertainty, missing pathway and unsupported balance are distinct visible states',()=>{
  const a=fixture();delete a.human.tendency;a.planet.tendency='offen';a.planet.direction_basis='no_path';a.democracy.tendency='offen';a.democracy.direction_basis='unclear';
  const before=JSON.stringify(a);const html=renderDimensionMeters(a,{compact:true});
  for(const label of ['Noch nicht eingeordnet','Kein belastbarer Wirkpfad','Wirkungsrichtung unklar'])assert.ok(html.includes(label));
  assert.doesNotMatch(html,/sr-only[^>]*>Für diese Dimension/);
  assert.equal(JSON.stringify(a),before);
  a.democracy.tendency='gemischt';assert.equal(dimensionAssessment(a,'democracy').status,'unresolved_balance');
  assert.match(renderDimensionMeters(a),/Keine belastbare Gesamtbewertung/);
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
  assert.ok(prompt.includes(DIRECTION_SEPARATION_RULE));assert.ok(prompt.includes(`"direction_assessment_version":"${DIRECTION_ASSESSMENT_VERSION}"`));
  assert.ok(prompt.includes(DIRECTION_REFERENCE_RULE));
  assert.ok(prompt.includes('"visuals":null'));assert.ok(prompt.length<39000);
  assert.match(fs.readFileSync('scripts/news/run.mjs','utf8'),/validateAnalysis\(analysis, analysisCandidate, \{ requireDirectionAssessment: true \}\)/);
});

for (const includeVisuals of [true, false]) test(`the actual output template includes both mixed paths (visuals=${includeVisuals})`,()=>{
  const prompt=buildAnalysisPrompt([{story_id:'test',title:'Test',claims:[],sources:[]}],{includeVisuals});
  const template=JSON.parse(prompt.split('\n').find(line=>line.startsWith('{"analyses":')));
  const schema=template.analyses[0];
  for (const key of ['human','planet','democracy']) {
    assert.equal(schema[key].$ref,'#/$defs/mpd');
    schema[key]=structuredClone(template.$defs.mpd);
    for (const sign of ['positive_path','negative_path']) {
      assert.equal(schema[key][sign].$ref,'#/$defs/path');
      schema[key][sign]=structuredClone(template.$defs.path);
      assert.deepEqual(schema[key][sign],{...NEWS_DIMENSION_SCHEMA.positive_path,state_change:'konkrete Zustandsänderung'});
    }
  }
  assert.match(prompt,/unbenötigte Pfade null/);
  const analysis=fixture();
  for (const key of ['human','planet','democracy']) {
    analysis[key]={...schema[key],relevance:'hoch',tendency:'gemischt',direction_basis:'assessed',rationale:fixture()[key].rationale,...mixed()};
  }
  assert.deepEqual(directionAssessmentErrors(analysis,sources,{requireCurrent:true}),[]);
  for (const key of ['human','planet','democracy']) Object.assign(analysis[key],{tendency:'risiko',positive_path:null,negative_path:fixture()[key].negative_path});
  assert.deepEqual(directionAssessmentErrors(analysis,sources,{requireCurrent:true}),[], 'no invented counterpaths required for a negative judgment');
});

test('mixed findings require independent changes against the same baseline, not offsets or missing benefits',()=>{
  for(const [key,value] of [['effect_type','mitigation_only'],['effect_type','unrealized_benefit'],['effect_type','procedural_possibility'],['reference','other_baseline']]) {
    const a=fixture();a.planet.tendency='gemischt';Object.assign(a.planet,mixed());
    a.planet.positive_path[key]=value;
    const before=JSON.stringify(a);
    assert.ok(directionAssessmentErrors(a,sources,{requireCurrent:true}).includes('AI_DIRECTION_MIXED_PATHS_REQUIRED:planet'));
    assert.equal(dimensionAssessment(a,'planet').status,'unresolved_balance');
    assert.equal(JSON.stringify(a),before,'never silently replace the verdict');
  }
  const a=fixture();a.planet.tendency='gemischt';Object.assign(a.planet,mixed());
  a.planet.negative_path.effect_type='unrealized_benefit';
  assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_INDEPENDENT_PATH_REQUIRED:planet:negative_path'));
  a.democracy.tendency='chance';a.democracy.positive_path={...mixed().positive_path,effect_type:'procedural_possibility'};
  assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_INDEPENDENT_PATH_REQUIRED:democracy:positive_path'));
});

test('reference is visible on compact and detailed meters, escaped, and required only in the new contract',()=>{
  const a=fixture();
  for(const compact of [true,false]) {
    const html=renderDimensionMeters(a,{compact});
    assert.match(html,/Bewertet:/);assert.ok(html.includes(a.assessment_frame.subject));
    assert.match(html,/Verglichen mit:/);assert.ok(html.includes(a.assessment_frame.baseline));
  }
  a.assessment_frame.subject='<script>Do not execute this text</script>';
  assert.doesNotMatch(renderDimensionMeters(a),/<script>/);
  delete a.assessment_frame;
  assert.ok(directionAssessmentErrors(a,sources,{requireCurrent:true}).includes('AI_DIRECTION_REFERENCE_REQUIRED'));
  a.direction_assessment_version='1.0';
  assert.deepEqual(directionAssessmentErrors(a,sources),[],'historical data are not blocked or rewritten');
  assert.ok(directionAssessmentErrors(a,sources,{requireCurrent:true}).includes('AI_DIRECTION_ASSESSMENT_REQUIRED'));
});

test('source IDs are evidence metadata, not unsupported numeric reader claims',()=>{
  const a=fixture();a.human.tendency='gemischt';Object.assign(a.human,mixed());
  assert.ok(!JSON.stringify(analysisReaderCopy(a)).includes('source-999'));
  assert.ok(JSON.stringify(analysisReaderCopy(a)).includes(a.human.positive_path.mechanism));
});

test('adoption still permits ex-ante risk; retrospective outcome requires a separately sourced change',()=>{
  const a=fixture();a.status='beschlossen';a.analysis_type='ex_ante';
  assert.deepEqual(directionAssessmentErrors(a,sources,{requireCurrent:true}),[]);
  a.analysis_type='ex_post';
  assert.ok(directionAssessmentErrors(a,sources,{requireCurrent:true}).includes('AI_OBSERVED_OUTCOME_REQUIRED'));
  a.observed_outcome={change:'Die tatsächlich erreichten Beratungsstunden sind gesunken.',source_ids:['source-999'],attribution:'open'};
  assert.deepEqual(directionAssessmentErrors(a,sources,{requireCurrent:true}),[], 'observation need not pretend proven causality');
  a.observed_outcome.source_ids=['unknown'];
  assert.ok(directionAssessmentErrors(a,sources,{requireCurrent:true}).includes('AI_OBSERVED_OUTCOME_REQUIRED'));
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
