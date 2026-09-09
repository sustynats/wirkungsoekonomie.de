import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { prepareReviewedStory } from '../../scripts/news/publish-reviewed.mjs';
import { prepareEditorialReview } from '../../scripts/news/publish-editorial-review.mjs';

const read = relative => JSON.parse(fs.readFileSync(new URL(relative, import.meta.url), 'utf8'));
const news = read('../../content/news/reviews/2026-09-09-soeder-afd-abgrenzung.json');
const opinion = read('../../content/news/reviews/2026-09-09-soeder-meinung-analyse.json');
const registry = read('../../content/news/media-registry.json');
const now = '2026-09-10T00:00:00Z';

test('Söder: reviewed event remains separate from an unproved cooperation announcement', () => {
  const result = prepareReviewedStory(news, registry, [], now);
  assert.deepEqual(result.errors, []);
  assert.equal(result.record.source_integrity.status, 'verified');
  assert.equal(result.record.story_id, opinion.story_id);
  assert.match(result.record.source_summary, /Eine angekündigte Koalition oder Zusammenarbeit.*nicht belegt/);
  for (const axis of ['human', 'planet', 'democracy']) {
    assert.equal(result.record.analysis[axis].tendency, 'risiko');
    assert.ok(result.record.analysis[axis].negative_path.mechanism);
  }
});

test('Söder: commissioned opinion has its own sources, conditional cascade and author perspective', () => {
  const story = prepareReviewedStory(news, registry, [], now).record;
  const { record } = prepareEditorialReview(opinion, story, null, now);
  assert.equal(record.editorial_genre, 'commentary');
  assert.equal(record.editorial_mode, 'commissioned_review');
  assert.equal(record.author.name, 'Natalie Weber');
  assert.equal(record.evidence_gate.passed, true);
  assert.ok(record.author_perspective.paragraphs.length >= 3);
  assert.equal(record.assessment_context, 'risk');
  assert.ok(record.sections.some(section => section.visual?.type === 'cascade'));
  for (const dimension of Object.values(record.subject_dimensions)) {
    assert.equal(dimension.direction, 'negative');
    assert.equal(dimension.likelihood, 'open');
  }
  assert.equal(prepareEditorialReview(opinion, story, record, now).changed, false);
});

test('Söder: references do not activate new automatic feed or model calls', () => {
  for (const id of ['wdr-maischberger-reference', 'mi-sachsen-anhalt-context', 'afd-lsa-programme-reference', 'bundesrecht-context']) {
    const entry = registry.sources.find(source => source.source_id === id);
    assert.equal(entry.enabled, false);
    assert.equal(entry.access.cost_usd, 0);
    assert.equal(entry.access.article, 'disabled');
  }
});
