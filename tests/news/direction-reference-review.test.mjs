import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { prepareReviewedStory } from '../../scripts/news/publish-reviewed.mjs';
import { loadNewsRegistry } from '../../scripts/news/registry.mjs';
import { sha256 } from '../../scripts/news/lib.mjs';
import { storyCard, storyPage } from '../../scripts/news/build.mjs';

const registry=loadNewsRegistry(process.cwd());
const reviews=name=>JSON.parse(fs.readFileSync(`content/news/reviews/${name}-2026-09-09.json`));
function beforeReview(review) {
  const s=structuredClone(JSON.parse(fs.readFileSync('data/news/stories.json')).stories.find(s=>s.story_id===review.story_id));
  const version=s.versions.find(v=>sha256(JSON.stringify(v.analysis))===review.expected_analysis_hash);
  assert.ok(version,'review binds a preserved version');
  Object.assign(s,{analysis:structuredClone(version.analysis),current_version:version.version,content_hash:review.expected_content_hash});
  s.versions=s.versions.filter(v=>v.version<=version.version);
  return s;
}

test('EEG correction keeps the original, explains the baseline on list/detail and retains an independent positive path',()=>{
  const review=reviews('eeg-netzpaket-richtungsbezug'),old=beforeReview(review),before=structuredClone(old);
  const result=prepareReviewedStory(review,registry,[old],'2026-09-09T14:00:00Z');
  assert.deepEqual(result.errors,[]);assert.deepEqual(old,before);
  const s=result.record;
  assert.equal(s.story_id,old.story_id);assert.equal(s.slug,old.slug);assert.equal(s.published_at,old.published_at);
  assert.deepEqual(s.versions.slice(0,-1),old.versions);
  assert.equal(s.analysis.planet.tendency,'risiko');assert.equal(s.analysis.democracy.tendency,'risiko');
  assert.ok(s.analysis.visuals.path_directions.some(p=>p.direction==='positive'));
  for(const html of [storyCard(s),storyPage(s)]) {
    assert.ok(html.includes(s.analysis.assessment_frame.subject));
    assert.match(html,/data-magnitude="unknown"/);assert.doesNotMatch(html,/data-direction="mixed"/);
    assert.match(html,/Ausgangsmeldung(?:<\/strong><span>|(?: von)? )09\.09\.2026/);
    assert.doesNotMatch(html,/Ausgangsmeldung(?:<\/strong><span>|(?: von)? )29\.07\.2026/);
  }
  assert.match(storyPage(s),/Klimareporter[^<]* · Ausgangsmeldung 09\.09\.2026/);
  assert.ok(storyPage(s).includes(review.correction_note));
  assert.equal(prepareReviewedStory(review,registry,[s],'2026-09-09T14:01:00Z').unchanged,true);
  old.analysis.summary+=' Changed';
  assert.throws(()=>prepareReviewedStory(review,registry,[old],'2026-09-09T14:01:00Z'),/INPUT_CHANGED/);
});

for(const name of ['heilbronn','booking','waehlerprofil'])test(`${name}: phase correction does not change the event, sources, MPD verdicts or prior versions`,()=>{
  const review=reviews(`${name}-analysephase`),old=beforeReview(review),before=structuredClone(old);
  const {errors,record:s}=prepareReviewedStory(review,registry,[old],'2026-09-09T14:00:00Z');
  assert.deepEqual(errors,[]);assert.deepEqual(old,before);
  assert.equal(s.analysis.analysis_type,'monitoring');
  for(const key of ['story_id','slug','sources','claims','content_hash','published_at','source_summary'])assert.deepEqual(s[key],old[key]);
  for(const key of Object.keys(old.analysis).filter(k=>k!=='analysis_type'))assert.deepEqual(s.analysis[key],old.analysis[key]);
  assert.deepEqual(s.versions.slice(0,-1),old.versions);
  assert.equal(prepareReviewedStory(review,registry,[s],'2026-09-09T14:01:00Z').unchanged,true);
  old.analysis.summary+=' changed';
  assert.throws(()=>prepareReviewedStory(review,registry,[old],'2026-09-09T14:01:00Z'),/PHASE_REVIEW_INVALID/);
});
