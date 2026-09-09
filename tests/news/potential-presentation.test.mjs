import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { directionAssessmentErrors, dimensionAssessment, DIRECTION_RECIPIENT_RULE } from '../../scripts/news/direction-assessment.mjs';
import { renderDimensionMeters } from '../../scripts/news/visuals.mjs';
import { storyCard, storyPage } from '../../scripts/news/build.mjs';
import { buildAnalysisPrompt } from '../../scripts/news/lib.mjs';
import { prepareReviewedStory } from '../../scripts/news/publish-reviewed.mjs';
import { loadNewsRegistry } from '../../scripts/news/registry.mjs';
const sources = [{source_id:'primary'}];
const path = state_change => ({state_change, mechanism:state_change+' Die Finanzierung verändert die Angebote.', condition:'Wenn die angekündigte Änderung umgesetzt wird.', effect_type:'independent_change', effect_role:'substantive_change',reference:'assessment_baseline',source_ids:['primary']});
const fixture = () => ({direction_assessment_version:'1.2',assessment_frame:{subject:'Änderung der Förderung erreichbarer Beratungsangebote.',baseline:'Fortführung der bisher erreichbaren Beratungsangebote.',object_kind:'proposed_measure'},...Object.fromEntries(['human','planet','democracy'].map(k=>[k,{relevance:'hoch',tendency:'risiko',direction_basis:'assessed',rationale:'Weniger finanzierte Öffnungsstunden verringern die erreichbare Beratung.',positive_path:null,negative_path:path('Weniger erreichbare Hilfe für Betroffene.')}]))});

test('intention, procedure, mitigation and political reaction never supply a balancing MPD verdict',()=>{
  for(const role of ['intention_only','procedural_step','political_reaction','mitigation']) {
    const a=fixture();a.human.tendency='gemischt';a.human.positive_path=path('Mehr erreichbare Beratung für Betroffene.');a.human.negative_path.effect_role=role;
    assert.ok(directionAssessmentErrors(a,sources,{requireCurrent:true}).includes('AI_DIRECTION_MIXED_PATHS_REQUIRED:human'));
    assert.equal(dimensionAssessment(a,'human').status,'unresolved_balance');
    a.human.tendency='risiko';assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_SUBSTANTIVE_CHANGE_REQUIRED:human:negative_path'));
    // A reaction may remain separately visible, without changing the primary verdict.
    a.human.tendency='chance';assert.deepEqual(directionAssessmentErrors(a,sources),[]);
    const html=renderDimensionMeters(a,{compact:true});
    assert.match(html,/wt-consequence--separate/);assert.doesNotMatch(html,/data-direction="mixed"/);
  }
});

test('future judgments need a concrete endpoint, condition and clear assessment object',()=>{
  for(const prop of ['state_change','condition','effect_role']) {
    const a=fixture();delete a.planet.negative_path[prop];
    assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_CONSEQUENCE_REQUIRED:planet'));
  }
  const a=fixture();delete a.assessment_frame.object_kind;
  assert.ok(directionAssessmentErrors(a,sources).includes('AI_DIRECTION_OBJECT_KIND_REQUIRED'));
  const prompt=buildAnalysisPrompt([{story_id:'test',title:'Test',claims:[],sources:[]}],{includeVisuals:false});
  assert.ok(prompt.includes(DIRECTION_RECIPIENT_RULE));
});

test('list and detail explain signed potentials without a mixed total or hidden consequence',()=>{
  const a=fixture();a.human.tendency='gemischt';a.human.positive_path=path('Mehr Hilfe an zusätzlich finanzierten Standorten.');
  for(const compact of [true,false]) {
    const html=renderDimensionMeters(a,{compact});
    assert.match(html,/Zwei getrennte Potenziale/);assert.match(html,/data-direction="positive"/);assert.match(html,/data-direction="negative"/);
    assert.doesNotMatch(html,/data-direction="mixed"|wt-dim__note sr-only/);
    assert.ok(html.includes(a.human.positive_path.state_change));assert.ok(html.includes(a.human.negative_path.state_change));
    assert.match(html,/Relevanz: hoch/);assert.match(html,/Bedingung:/);
  }
});

test('the reported Dröge case changes through the shared presentation, not a content override',()=>{
  const s=JSON.parse(fs.readFileSync('data/news/stories.json')).stories.find(s=>s.slug==='droge-mussen-antrag-zum-afd-verbot-einbringen-ac1645');
  assert.ok(s);const before=JSON.stringify(s);
  for(const html of [storyCard(s),storyPage(s)]) {
    assert.doesNotMatch(html,/Gegenläufige Wirkpfade/);
    assert.match(html,/Keine belastbare Gesamtbewertung/);
    assert.match(html,/Bisherige Nutzenannahme/);assert.match(html,/Bisherige Risikoannahme/);
    assert.ok(html.includes(s.analysis.democracy.positive_path.mechanism));
    assert.ok(html.includes(s.analysis.democracy.negative_path.mechanism));
  }
  assert.equal(JSON.stringify(s),before);
});

test('legacy mixed records are not silently promoted to the new semantic contract',()=>{
  const a=fixture();a.direction_assessment_version='1.1';a.human.tendency='gemischt';a.human.positive_path=path('Mehr Hilfe an zusätzlich finanzierten Standorten.');
  const before=JSON.stringify(a);
  assert.equal(dimensionAssessment(a,'human').status,'unreviewed_roles');
  assert.match(renderDimensionMeters(a,{compact:true}),/ältere Einordnung/);
  assert.equal(JSON.stringify(a),before);assert.deepEqual(directionAssessmentErrors(a,sources),[]);
});

test('newly researched manual reviews use the same contract as automatic assessments',()=>{
  const review=JSON.parse(fs.readFileSync('content/news/reviews/2026-09-09-soeder-afd-abgrenzung.json'));
  const registry=loadNewsRegistry(process.cwd());
  const now='2026-09-10T00:00:00Z';
  assert.deepEqual(prepareReviewedStory(review,registry,[],now).errors,[]);
  review.research_checked_at=now;
  assert.ok(prepareReviewedStory(review,registry,[],now).errors.includes('AI_DIRECTION_ASSESSMENT_REQUIRED'));
});

test('an unscoped historical judgment cannot appear as a verdict about the headline event',()=>{
  const s=JSON.parse(fs.readFileSync('data/news/stories.json')).stories.find(s=>s.slug==='afd-wahler-in-sachsen-anhalt-wer-die-partei-gewahlt-hat-bfbf87');
  assert.ok(s);const before=JSON.stringify(s);
  assert.equal(dimensionAssessment(s.analysis,'democracy').status,'unscoped');
  for(const html of [storyCard(s),storyPage(s)]) {
    assert.match(html,/Teilbewertung ohne klaren Vergleich/);
    assert.doesNotMatch(html,/Positiv · Potenzial|wt-tendency--chance|data-direction="positive"/);
    assert.ok(html.includes(s.analysis.democracy.positive_path.mechanism));
  }
  assert.equal(JSON.stringify(s),before);
  for(const t of ['chance','risiko']) {
    const a=fixture();delete a.assessment_frame;a.human.tendency=t;
    assert.equal(dimensionAssessment(a,'human').status,'unscoped','same rule for both signs, no party heuristic');
  }
});

test('embedded dimension-only diagrams keep the scope of their surrounding authored analysis',()=>{
  const dimensions=Object.fromEntries(['human','planet','democracy'].map(k=>[k,{relevance:'hoch',tendency:'risiko',rationale:'Das im umgebenden Analysetext begründete negative Potenzial.'}]));
  assert.equal(dimensionAssessment(dimensions,'human').status,'assessed');
  assert.match(renderDimensionMeters(dimensions),/data-direction="negative"/);
  assert.doesNotMatch(renderDimensionMeters(dimensions),/Teilbewertung ohne klaren Vergleich/);
});
