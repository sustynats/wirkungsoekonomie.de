import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PUBLIC_IMPACT_PROFILE_VERSION, publicImpactAssessment, assertPublicImpactHtml } from '../../scripts/news/impact-release.mjs';
import { storyCard, storyPage, publicStory } from '../../scripts/news/build.mjs';
import { storyToTitleInput } from '../../scripts/news/title-image/index.mjs';
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
  assert.throws(() => assertPublicImpactHtml('<span>Keine Größenschätzung vorhanden</span>'), /IMPACT_PUBLIC_DEBUG_FALLBACK/);
  assert.throws(() => assertPublicImpactHtml('<div class="wt-dim wt-dim--human" data-potential-model="2.1">'), /IMPACT_PUBLIC_PROFILE_NOT_RELEASED/);
  assert.doesNotThrow(() => assertPublicImpactHtml('<h1>Eine weiterhin lesbare Nachricht</h1>'));
});
