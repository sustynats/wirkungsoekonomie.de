import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { evidenceLevelLabel, storyPage } from "../../scripts/news/build.mjs";
import { readerHtmlHasEditorialResidue } from "../../scripts/news/reader-copy.mjs";

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
  assert.match(html, /href="#faktencheck">Belege<\/a>/);
  const subnav = html.match(/<nav class="wt-subnav"[\s\S]*?<\/nav>/)[0];
  assert.equal((subnav.match(/<a /g) || []).length, 4);
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
  // Some articles also repeat the evidence boundary in their synthesis. Check
  // the two required surfaces, not a count dependent on the newest story copy.
  assert.match(html.match(/<article\b[^>]*id="faktencheck"[\s\S]*?<\/article>/)?.[0] || '', /Einer Quelle zugeschrieben; keine unabhängige Bestätigung/);
  assert.match(html, /Evidenzgrad<\/strong><span>Einer Quelle zugeschrieben; keine unabhängige Bestätigung<\/span>/);
  assert.equal(evidenceLevelLabel("single_source_primary_statement"), "Primärquelle / Selbstauskunft; keine unabhängige Bestätigung");
  assert.equal(evidenceLevelLabel("single_source_claim mit bezifferten Angaben"), "einer Quelle zugeschrieben mit bezifferten Angaben");
  assert.equal(evidenceLevelLabel("attributed_single_source: mehrere Berichte"), "zugeschriebene Quellenlage: mehrere Berichte");
});

test("every correction uses a bounded reader notice, with date and unchanged escaped text", () => {
  const story = structuredClone(fixture);
  story.corrections = [
    { at: "2026-09-08T12:00:00Z", note: "Erste Korrektur: Mensch & Planet bleiben getrennt." },
    { at: "2026-09-09T12:00:00Z", note: "Zweite Korrektur: <em>keine HTML-Anweisung</em>." },
  ];
  const before = structuredClone(story), html = storyPage(story);
  const notices = [...html.matchAll(/<aside class="notice news-correction" role="note">([\s\S]*?)<\/aside>/g)];
  assert.equal(notices.length, 2);
  assert.match(notices[0][1], /<p><strong>Korrektur vom 08\.09\.2026<\/strong><\/p><p>Erste Korrektur: Mensch &amp; Planet bleiben getrennt\.<\/p>/);
  assert.match(notices[1][1], /Korrektur vom 09\.09\.2026/);
  assert.match(notices[1][1], /&lt;em&gt;keine HTML-Anweisung&lt;\/em&gt;/);
  assert.ok(notices[1].index < html.indexOf('<nav class="wt-subnav"'));
  assert.deepEqual(story, before);
  assert.doesNotMatch(storyPage({ ...story, corrections: [] }), /class="notice news-correction"/);
  const css = fs.readFileSync(new URL("../../assets/css/news.css", import.meta.url), "utf8");
  const sharedStyle = css.match(/\.news-status-notice,\s*\.news-correction\s*\{([^}]+)\}/)?.[1];
  assert.ok(sharedStyle, "corrections share the existing centered status-notice layout");
  assert.match(sharedStyle, /width:\s*min\(calc\(100% - 2 \* var\(--space-gutter/);
  assert.match(sharedStyle, /margin:\s*0\.75rem auto/);
  assert.match(sharedStyle, /box-sizing:\s*border-box/);
});

test("public ticker copy explains quality without infrastructure internals", () => {
  const html = fs.readFileSync(new URL("../../wirkungsticker/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /\b(?:Oracle|OCI|Higgsfield|OpenAI|Anthropic|GPT-\d)/i);
  assert.doesNotMatch(html, /URL-\/Hash-Deduplizierung|Story-Clustering|Fail closed/i);
  assert.doesNotMatch(html, /attributed_single_source|media_trigger|controlled_source_text|provider_reported_usage|AI_INPUT_/i);
  assert.match(html, /Vorprüfen und bündeln/);
  assert.match(html, /Nur Belastbares veröffentlichen/);
  assert.match(html, /Name und E-Mail-Adresse sind nicht erforderlich/);
});

test("all existing reader pages keep concrete findings but no editorial boilerplate", () => {
  const stories = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url))).stories;
  for (const story of stories.filter(item => item.published && item.listed !== false)) {
    const before = structuredClone(story);
    const html = storyPage(story);
    assert.equal(readerHtmlHasEditorialResidue(html), false, story.story_id);
    const facts = html.match(/<article\b[^>]*id="faktencheck"[\s\S]*?<\/article>/)?.[0];
    assert.ok(facts.indexOf("Gesicherter Ausgangspunkt") < facts.indexOf("Was dieser Stand nicht belegt"));
    assert.match(html, /href="\.\.\/\.\.\/methodik\/">Wie diese Einordnung entsteht/);
    assert.match(html, /id="quellen"/);
    assert.doesNotMatch(facts, /Wahrheit zuerst|quellengebundenen? Claims?/);
    assert.deepEqual(story, before, "rendering preserves facts, uncertainty, sources, corrections, scores and dates");
  }
});
