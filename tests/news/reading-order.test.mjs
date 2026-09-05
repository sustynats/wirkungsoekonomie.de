import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { evidenceLevelLabel, storyPage } from "../../scripts/news/build.mjs";

const fixture = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url))).stories.find(story => story.published && story.listed !== false && story.analysis && story.news_status);

test("detail reading order starts with the news, then evidence and facts before analysis", () => {
  const story = structuredClone(fixture), before = structuredClone(story);
  const html = storyPage(story);
  const sequence = ['id="nachricht"', 'id="belegstand"', 'id="faktencheck"', 'aria-label="Auf einen Blick"', 'id="analyse"', 'id="einordnung"', 'id="folgencheck"'];
  let previous = -1;
  for (const marker of sequence) {
    const position = html.indexOf(marker);
    assert.ok(position > previous, `${marker} follows the preceding section`);
    previous = position;
  }
  assert.ok(html.indexOf('class="news-status-notice"') < html.indexOf('id="nachricht"'));
  assert.match(html, /href="#belegstand">Belegstand<\/a>/);
  assert.equal((html.match(/id="belegstand"/g) || []).length, 1);
  assert.deepEqual(story, before, "rendering never rewrites journalistic content or dates");
});

test("provisional and disputed status remain visible before reading, without dangling legacy anchors", () => {
  for (const [status, note] of [["developing", "Weitere Erkenntnisse können diesen Stand verändern."], ["preliminary", "Wesentliche Angaben sind noch vorläufig."], ["disputed", "Die Quellen widersprechen sich in wesentlichen Punkten."]]) {
    const html = storyPage({ ...fixture, news_status: status });
    assert.ok(html.indexOf(note) > 0 && html.indexOf(note) < html.indexOf('id="nachricht"'));
  }
  const html = storyPage({ ...fixture, news_status: undefined });
  assert.doesNotMatch(html, /href="#belegstand"|id="belegstand"|class="news-status-notice"/);
  assert.ok(html.indexOf('id="nachricht"') < html.indexOf('id="faktencheck"'));
});

test("technical evidence codes are translated on every public detail surface", () => {
  const story = structuredClone(fixture);
  story.analysis.evidence_level = "attributed_single_source";
  const html = storyPage(story);
  assert.doesNotMatch(html, /attributed_single_source|single_source/);
  assert.equal((html.match(/Einer Quelle zugeschrieben; keine unabhängige Bestätigung/g) || []).length, 2);
  assert.equal(evidenceLevelLabel("single_source_primary_statement"), "Primärquelle / Selbstauskunft; keine unabhängige Bestätigung");
  assert.equal(evidenceLevelLabel("single_source_claim mit bezifferten Angaben"), "einer Quelle zugeschrieben mit bezifferten Angaben");
});
