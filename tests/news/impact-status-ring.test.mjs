import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveImpactPresentation,impactAssessmentErrors} from '../../scripts/news/impact-assessment.mjs';
import {deriveImpactStatus} from '../../scripts/news/impact-potential.mjs';
import {renderDimensionMeters} from '../../scripts/news/visuals.mjs';
import {storyCard,storyPage} from '../../scripts/news/build.mjs';
import fs from 'node:fs';
import {syntheticPotentialAssessment as profile,syntheticPotentialPath as path} from './fixtures/impact21.mjs';
const sources=[{source_id:'official'}];
const render=a=>renderDimensionMeters({impact_assessment:a},{context:{privateImpactPreview:true},compact:true});
function observation(temporal_status='ex_post',direction='negative'){
 return {...path({direction,magnitude:4}),temporal_status,dimension:'human',change:'Im synthetischen Test ist eine konkrete Zustandsänderung bereits belegt.',data_status:'observed',evidence:'high',attribution:'open',reference_frame:'Der offengelegte Schutzrahmen des synthetischen Tests.',observed_at:'Der ausdrücklich festgelegte Beobachtungszeitraum des Tests.'};
}
test('potential ring is independent from every magnitude level and has a text alternative',()=>{
 for(const magnitude of [0,1,2,3,4,5]){const a=profile(),d=a.dimensions.human;d.magnitude=magnitude;d.primary_paths=[path({magnitude})];
  const p=deriveImpactPresentation(a).dimensions.human;assert.equal(p.ringStatus,'potential');assert.equal(p.magnitudeBars,magnitude);
  const html=render(a);assert.match(html,/Status Potenzial/);assert.match(html,new RegExp(`data-magnitude="${magnitude}"`));assert.match(html,/aria-label="Mensch: Status/);
  assert.equal((html.match(/class="wt-dim wt-dim--/g)||[]).length,3);
 }
});
test('ongoing observations have the fixed emerging category, not a numeric completion fraction',()=>{
 const a=profile();a.observed_effects=[observation('ongoing')];assert.deepEqual(impactAssessmentErrors(a,sources),[]);
 const p=deriveImpactPresentation(a).dimensions.human;assert.equal(p.ringStatus,'emerging');assert.equal(p.directionLabel,'− laufende Wirkung');
 const html=render(a);assert.match(html,/wt-impact-ring--emerging/);assert.match(html,/data-magnitude="4"/);assert.doesNotMatch(html,/progressbar|aria-valuenow|50\s*%/);
});
test('observed positive and negative consequences use their own size; remaining potential survives',()=>{
 for(const direction of ['positive','negative']){const a=profile();a.observed_effects=[observation('ex_post',direction)];
  const p=deriveImpactPresentation(a).dimensions.human;assert.equal(p.ringStatus,'observed');assert.equal(p.magnitudeBars,4);assert.equal(p.magnitude,3);
  assert.equal(p.directionLabel,direction==='negative'?'− beobachtet':'+ beobachtet');assert.equal(p.potential_presentation.ringStatus,'potential');
  const html=render(a);assert.match(html,/wt-impact-ring--observed/);assert.match(html,/Weiteres Potenzial/);assert.match(html,/data-magnitude="4"/);
 }
});
test('open direction never removes the ring, bars or path title',()=>{
 const a=profile(),d=a.dimensions.planet;d.direction='open';d.dominance='none';d.primary_paths=[path({direction:'open',magnitude:3})];
 const html=render(a);assert.match(html,/Richtung offen/);assert.match(html,/wt-impact-path-title/);assert.equal((html.match(/data-magnitude="3"/g)||[]).length,3);
});
test('an implementation enum without observed signals cannot create an emerging verdict',()=>{
 const a=profile();a.dimensions.human.temporal_status='ongoing';assert.ok(impactAssessmentErrors(a,sources).includes('IMPACT_EMERGING_SIGNAL_REQUIRED:human'));
 assert.deepEqual(['ex_ante','ongoing','ex_post'].map(deriveImpactStatus),['potential','emerging','observed']);
});
test('real card and detail previews keep all three rings, bars and paths with public rollout disabled',()=>{
 const catalog=JSON.parse(fs.readFileSync('data/news/stories.json')).stories;
 const story={...catalog.find(s=>s.published&&s.analysis&&s.listed!==false),impact_assessment:profile()};
 for(const html of [storyCard(story,0,{privateImpactPreview:true}),storyPage(story,{privateImpactPreview:true})]){
  assert.match(html,/data-private-impact-preview/);
  for(const dimension of ['human','planet','democracy'])assert.match(html,new RegExp(`wt-dim--${dimension}`));
  assert.ok((html.match(/wt-impact-ring--potential/g)||[]).length>=3);
  assert.ok((html.match(/data-magnitude="3"/g)||[]).length>=3);
  assert.ok((html.match(/wt-impact-path-title/g)||[]).length>=3);
 }
 assert.match(storyPage(story,{privateImpactPreview:true}),/noindex, ?nofollow/);
});
