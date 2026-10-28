import test from 'node:test';
import assert from 'node:assert/strict';
import { extractArticleText } from '../../scripts/news/lib.mjs';

test('trailing share controls retain the news and omit unrelated recommendations', () => {
  // Synthetic structural fixture for the WDR sharing footer checked 2026-10-28;
  // no original article HTML or manuscript is retained here.
  const story = '<h1>Stromausfall stoppt Schwebebahn</h1><p>Die Feuerwehr brachte 24 Fahrgäste aus der stehenden Bahn. Niemand wurde verletzt.</p><p>Nach etwa einer Stunde war der Einsatz beendet. Die Strecke ist wieder befahrbar; die Ursache des Ausfalls bleibt offen.</p>';
  const html = '<main>' + story + '<div>Diesen Artikel teilen <a>Facebook</a> <a>Link kopieren</a></div><aside><h2>Weitere Beiträge aus Wuppertal</h2><p>Laub harken im Herbst</p></aside></main>';
  const text = extractArticleText(html);
  assert.match(text, /24 Fahrgäste/);
  assert.match(text, /Niemand wurde verletzt/);
  assert.match(text, /wieder befahrbar/);
  assert.doesNotMatch(text, /Diesen Artikel teilen|Link kopieren|Weitere Beiträge|Laub harken/);
});

test('copy controls before the article still give way to the complete news', () => {
  const html = '<main><div>Ansicht Druckansicht Link kopieren</div><h1>Neue Regel beschlossen</h1><p>Das Parlament hat nach der Beratung eine neue Regel beschlossen. Sie tritt erst im kommenden Jahr in Kraft. Umfang und Folgen werden anschließend geprüft.</p></main>';
  const text = extractArticleText(html);
  assert.match(text, /^Neue Regel beschlossen Das Parlament/);
  assert.match(text, /Folgen werden anschließend geprüft/);
  assert.doesNotMatch(text, /Ansicht|Druckansicht|Link kopieren/);
});

test('a full sharing toolbar at the start is still a leading control', () => {
  const html = '<main><div>Ansicht Diesen Artikel teilen Facebook X WhatsApp E-Mail Link kopieren</div><h1>Neue Regel beschlossen</h1><p>Das Parlament hat nach der Beratung eine neue Regel beschlossen. Sie tritt erst im kommenden Jahr in Kraft. Umfang und Folgen werden anschließend geprüft.</p></main>';
  assert.match(extractArticleText(html), /^Neue Regel beschlossen Das Parlament/);
});

test('an article mentioning sharing without a matching toolbar is retained', () => {
  const html = '<article><h1>Neue Medienangebote</h1><p>Diesen Artikel teilen viele Leserinnen und Leser mit ihrer Familie. Die Redaktion erklärt anschließend die Bedingungen des Angebots.</p></article>';
  assert.match(extractArticleText(html), /Die Redaktion erklärt anschließend die Bedingungen/);
});
