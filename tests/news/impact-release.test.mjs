import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PUBLIC_IMPACT_PROFILE_VERSION, publicImpactAssessment, assertPublicImpactHtml } from '../../scripts/news/impact-release.mjs';
import { storyCard, storyPage, publicStory } from '../../scripts/news/build.mjs';
import { storyToTitleInput } from '../../scripts/news/title-image/index.mjs';
import {syntheticPotentialAssessment} from './fixtures/impact21.mjs';
import {assessmentBasis} from '../../scripts/news/migrate-impact-assessments.mjs';
import {deriveStatusPresentation} from '../../scripts/news/impact-potential.mjs';
const catalog = JSON.parse(fs.readFileSync('data/news/stories.json')).stories;

test('atomic rollback hides incomplete profiles across cards, detail, API and title images, preserving news', () => {
  assert.equal(PUBLIC_IMPACT_PROFILE_VERSION, null);
  const active = catalog.filter(s => s.published && s.analysis && s.listed !== false);
  assert.ok(active.length > 200);
  for (const story of active) {
    const before = JSON.stringify(story);
    assert.equal(publicImpactAssessment(story), null);
    for (const html of [storyCard(story, 0), storyPage(story)]) {
      assert.doesNotThrow(() => assertPublicImpactHtml(html));
      assert.doesNotMatch(html, /data-potential-model=|wt-meter--unknown|Keine Größenschätzung vorhanden/);
      assert.ok(html.includes(story.slug));
    }
    assert.equal(publicStory(story).impact_assessment, null);
    assert.equal(publicStory(story).dimensions, null);
    assert.equal(storyToTitleInput(story).dimensions, null);
    assert.equal(JSON.stringify(story), before);
  }
});
test('public artifact gate rejects debug output and accidentally copied private profile previews', () => {
  assert.throws(() => assertPublicImpactHtml('<article data-private-impact-preview="true">'), /IMPACT_PRIVATE_PREVIEW/);
  assert.throws(() => assertPublicImpactHtml('<span>Keine Größenschätzung vorhanden</span>'), /IMPACT_PUBLIC_DEBUG_FALLBACK/);
  assert.throws(() => assertPublicImpactHtml('<div class="wt-dim wt-dim--human" data-potential-model="2.1">'), /IMPACT_PUBLIC_PROFILE_NOT_RELEASED/);
  assert.doesNotThrow(() => assertPublicImpactHtml('<h1>Eine weiterhin lesbare Nachricht</h1>'));
});
test('a complete independently reviewed current profile is visible without waiting for unrelated legacy backfill',()=>{
 const story=structuredClone(catalog.find(s=>s.published&&s.analysis));
 story.impact_assessment=syntheticPotentialAssessment();story.impact_assessment.publication_status='ready';
 story.impact_sources=[{source_id:'official',url:'https://example.org/test',publisher:'Synthetic test fixture'}];
 story.impact_semantic_review={status:'ready',review_job_id:'wt_20260910T000000Z_000000000000000000000000'};
 story.impact_assessment_basis=assessmentBasis(story);
 assert.ok(publicImpactAssessment(story));
 for(const html of [storyCard(story,0),storyPage(story)]){
  assert.match(html,/data-reviewed-impact-profile="2.1"/);assert.doesNotThrow(()=>assertPublicImpactHtml(html));
  for(const dim of ['human','planet','democracy'])assert.match(html,new RegExp('wt-dim--'+dim));
  assert.match(html,/wt-impact-ring--potential/);assert.match(html,/data-magnitude="3"/);
 }
 assert.ok(publicStory(story).impact_assessment);assert.ok(storyToTitleInput(story).dimensions);
 for(const mutate of [s=>{s.impact_semantic_review.status='needs_review';},s=>{s.analysis.summary+=' Changed after review.';},s=>{s.impact_assessment.dimensions.human.magnitude=null;},s=>{s.impact_assessment.dimensions.planet.primary_paths=[];}]){
  const invalid=structuredClone(story);mutate(invalid);assert.equal(publicImpactAssessment(invalid),null);
 }
});
test('the central status label preserves mixed-path dominance without changing ring or magnitude',()=>{
 const d=deriveStatusPresentation({direction:'mixed',dominance:'dominant_negative',temporal_status:'ex_ante',magnitude:4});
 assert.equal(d.directionLabel,'± überwiegend negativ');assert.equal(d.ringStatus,'potential');assert.equal(d.magnitudeBars,4);
});
