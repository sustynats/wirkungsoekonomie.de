import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Der Umbau auf den Direktbetrieb (#776, 15.09.2026) hat die Adresse des
// Bilddienstes still aus dem Ticker entfernt. Seit dem 12.09. bekam keine
// Meldung mehr ein Symbolmotiv, und niemand merkte es, weil der Kartenfallback
// nie blockiert. Natalie fragte am 18.09.: "kann es sein, dass die Nachrichten
// keine Hintergrundbilder haben?" - dieser Test haette es beim Umbau gemeldet.
test('der Ticker ist an den Bilddienst angebunden', () => {
  const workflow = fs.readFileSync(new URL('../../.github/workflows/wirkungsticker.yml', import.meta.url), 'utf8');
  const schritt = workflow.split('- name: Import, analyze (one call per story) and build')[1]?.split('\n      - name:')[0] || '';
  assert.ok(schritt, 'der Analyseschritt ist nicht auffindbar');
  assert.match(schritt, /WOEK_NEWS_VISUAL_API_URL:\s*"https:\/\/[^"]+\/api\/news-title-image"/, 'die Adresse des Bilddienstes fehlt');
  assert.match(schritt, /WOEK_NEWS_ANALYSIS_TOKEN:\s*\$\{\{\s*secrets\.[A-Z_]+\s*\}\}/, 'das Token des Bilddienstes fehlt');
  assert.match(workflow, /VISUAL_GENERATION_PROVIDER:\s*higgsfield/);
});
