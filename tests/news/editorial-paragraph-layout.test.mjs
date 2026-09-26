import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderEditorialMarkdown} from '../../scripts/news/editorial-markdown.mjs';
import {diagramLayouts, editorialDiagramLayout} from '../../scripts/news/editorial-diagram-layouts.mjs';

const paragraphText = html => html.replace(/<\/?p>/g, ' ').replace(/\s+/g, ' ').trim();

test('opt-in paragraph joins preserve inline markup and all words without changing Markdown', () => {
  const markdown = '## Kontext\n\nWir wissen nicht:\n\nwer beteiligt ist,\n\nund ob es [Belege](https://example.org/) gibt.\n\n- Eine Liste\n\n## Fazit\n\nOffen.';
  const original = renderEditorialMarkdown(markdown);
  const joined = renderEditorialMarkdown(markdown, {paragraphJoins: {kontext: [[1, 3]]}});
  assert.equal(paragraphText(joined.html), paragraphText(original.html));
  assert.match(joined.html, /<p>Wir wissen nicht: wer beteiligt ist, und ob es <a /);
  assert.deepEqual(joined.headings, original.headings);
  assert.equal(joined.html, joined.sections.map(s => s.html).join('\n'));
  assert.equal(joined.sections[0].blocks.length, original.sections[0].blocks.length - 2);
  assert.equal(joined.sections.at(-1).html, original.sections.at(-1).html);
});

test('invalid or ambiguous paragraph joins fail instead of deleting structural boundaries', () => {
  const markdown = '## Kontext\n\nA.\n\nB.\n\n- Liste\n\nC.';
  for (const ranges of [[[0, 2]], [[2, 4]], [[-1, 2]], [[1, 99]], [[1, 1]], [[1.5, 2]], [[1, 2], [2, 4]], [[2, 1]], [[1]], 'all']) {
    assert.throws(() => renderEditorialMarkdown(markdown, {paragraphJoins: {kontext: ranges}}), /PARAGRAPH_JOIN_INVALID/);
  }
  assert.throws(() => renderEditorialMarkdown(markdown, {paragraphJoins: {missing: [[1, 2]]}}), /PARAGRAPH_SECTION_NOT_FOUND/);
});

test('both Habeck/Wissing layouts join short fragments, retaining sources, headings and approved editions', () => {
  const editions = JSON.parse(fs.readFileSync('data/news/personal-editorials.json')).editions;
  const targets = diagramLayouts.entries.filter(e => e.typesetting_only);
  assert.equal(targets.length, 2);
  for (const layout of targets) {
    const article = editions.find(e => e.slug === layout.slug);
    assert.ok(article);
    const before = JSON.stringify(article);
    const original = renderEditorialMarkdown(article.body_markdown);
    const formatted = renderEditorialMarkdown(article.body_markdown, editorialDiagramLayout(article));
    assert.equal(JSON.stringify(article), before);
    assert.equal(paragraphText(formatted.html), paragraphText(original.html), article.slug);
    assert.deepEqual(formatted.headings, original.headings);
    assert.equal(formatted.sections.find(s => s.id === 'quellen').html, original.sections.find(s => s.id === 'quellen').html);
    assert.ok((formatted.html.match(/<p>/g) || []).length < (original.html.match(/<p>/g) || []).length / 2);
    assert.deepEqual(editorialDiagramLayout({...article, body_markdown: article.body_markdown + '\nNeue Fassung.'}), {});
    if (article.subtype === 'opinion_analysis') {
      assert.match(formatted.html, /Wir wissen derzeit nicht: wer Wissings Unternehmer sind, ob Habeck mit ihnen spricht,/);
      assert.doesNotMatch(formatted.html, /<p>wer Wissings Unternehmer sind,|<p>Eine Stiftung\?/);
    }
  }
  for (const article of editions.filter(e => !targets.some(t => t.slug === e.slug))) {
    assert.equal(editorialDiagramLayout(article).paragraphJoins, undefined, article.slug);
  }
});
