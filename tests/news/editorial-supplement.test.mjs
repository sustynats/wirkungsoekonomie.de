import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SUPPLEMENT_PREFIX, supplementBrief, supplementTarget, supplementText, supersededBySupplement, supplementContext, withSupplement } from '../../scripts/news/editorial-supplement.mjs';
import { SUPPLEMENT_PREFIX as APP_PREFIX, supplementBrief as appBrief, supplementable } from '../../admin/redaktion/review-state.js';

const TARGET = 'wt_20260916T070528Z_56ed1e70d5a72906fa5f2121';

test('App und Worker schreiben dieselbe Bindung, damit die Nachlieferung erkannt wird', () => {
  assert.equal(APP_PREFIX, SUPPLEMENT_PREFIX);
  const brief = appBrief(TARGET, '  Ich würde noch die politische Ebene ergänzen.  ');
  assert.equal(brief, supplementBrief(TARGET, 'Ich würde noch die politische Ebene ergänzen.'));
  assert.equal(supplementTarget(brief), TARGET);
  assert.equal(supplementText(brief), 'Ich würde noch die politische Ebene ergänzen.');
});

test('nur eine gültige Auftragskennung bindet; alles andere bleibt ein gewöhnlicher Auftrag', () => {
  assert.equal(supplementTarget('Nachlieferung zu Auftrag Sydney Sweeney'), null);
  assert.equal(supplementTarget('Nachlieferung zu Auftrag wt_2026_kurz'), null);
  assert.equal(supplementTarget('Ein Auftrag über Nachlieferungen im Handel'), null);
  assert.equal(supplementTarget(''), null);
  assert.equal(supplementTarget(null), null);
  assert.throws(() => supplementBrief('kein-auftrag', 'Text'), /EDITORIAL_SUPPLEMENT_TARGET_INVALID/);
});

test('ein fortgeschriebener Auftrag wird nicht mehr allein bearbeitet', () => {
  const rows = [
    { input: { job_type: 'editorial_request', job_id: TARGET, request: { brief: 'Ursprung' } } },
    { input: { job_type: 'editorial_request', job_id: 'wt_20260916T090000Z_' + 'b'.repeat(24), request: { brief: supplementBrief(TARGET, 'Zusatz') } } },
    { input: { job_type: 'news_import', job_id: 'wt_20260916T091000Z_' + 'c'.repeat(24), request: { brief: supplementBrief(TARGET, 'fremde Spur') } } },
  ];
  assert.deepEqual([...supersededBySupplement(rows)], [TARGET]);
  assert.deepEqual([...supersededBySupplement([])], []);
  // Ein Auftrag, der sich selbst nennt, hebt sich nicht selbst auf.
  const self = 'wt_20260916T092000Z_' + 'd'.repeat(24);
  assert.deepEqual([...supersededBySupplement([{ input: { job_type: 'editorial_request', job_id: self, request: { brief: supplementBrief(self, 'x') } } }])], []);
});

test('die Nachlieferung trägt Material und bisherige Fassung des Auftrags, ohne das abgelegte Paket zu verändern', async () => {
  const session = {
    store: { get: async (id) => id === TARGET ? { created_at: '2026-09-16T07:05:28.000Z',
      input: { request: { kind: 'opinion_analysis', brief: 'Ursprünglicher Auftrag', links: ['https://a.example'], author_notes: 'Meine Haltung', attachments: [{ name: 'shot.png', type: 'image/png', size: 12 }] } } } : null },
    transport: { read: async (path) => path.includes('leer') ? '{}' : JSON.stringify({ preview: { title: 'Erste Fassung', markdown: '## Kontext\nText', sources: [{ url: 'https://a.example', title: 'A' }] } }) },
  };
  const context = await supplementContext(session, TARGET, { paths: ['leer.json', 'output.json'] });
  assert.equal(context.kind, 'opinion_analysis');
  assert.equal(context.brief, 'Ursprünglicher Auftrag');
  assert.deepEqual(context.attachments, [{ name: 'shot.png', type: 'image/png' }]);
  assert.equal(context.previous_version.title, 'Erste Fassung');
  assert.equal(await supplementContext(session, 'wt_20260101T000000Z_' + '0'.repeat(24), {}), null);

  const packet = { job_id: 'wt_20260916T090000Z_' + 'b'.repeat(24), input_hash: 'a'.repeat(64),
    request: { kind: 'opinion_analysis', brief: supplementBrief(TARGET, 'Zusatz: politische Ebene'), links: ['https://b.example'] } };
  const prompt = withSupplement(packet, context);
  assert.equal(prompt.request.brief, 'Zusatz: politische Ebene', 'der Marker ist Technik und gehört nicht in den Auftragstext');
  assert.deepEqual(prompt.request.links, ['https://a.example', 'https://b.example']);
  assert.equal(prompt.origin.supplement_of.job_id, TARGET);
  assert.equal(prompt.input_hash, packet.input_hash);
  assert.equal(packet.request.links.length, 1, 'das abgelegte Paket bleibt unberührt');
  assert.equal(withSupplement(packet, null), packet);
});

test('eine veröffentlichte Fassung wird nicht über eine Nachlieferung geändert', () => {
  assert.equal(supplementable({ job_id: 'a' }), true);
  assert.equal(supplementable({ job_id: 'a', review_status: 'AWAITING_FINAL_APPROVAL' }), true);
  assert.equal(supplementable({ job_id: 'a', review_status: 'REVISION_REQUESTED' }), true);
  for (const blocked of [{ review_status: 'PUBLISHED' }, { review_status: 'PUBLISHING' }, { review_status: 'SKIPPED' }, { review_status: 'APPROVED_FOR_PUBLICATION' }, { publication_url: 'https://wirkungsoekonomie.de/x/' }])
    assert.equal(supplementable({ job_id: 'a', ...blocked }), false, JSON.stringify(blocked));
  assert.equal(supplementable({}), false);
});

test('die App bindet den Knopf an dieselbe Bedingung und sendet den Auftragstext mit Bindung', () => {
  const app = fs.readFileSync(new URL('../../admin/redaktion/redaktion.js', import.meta.url), 'utf8');
  assert.match(app, /if\(supplementable\(request\)\)/);
  assert.match(app, /supplementBrief\(supplement\.job_id,\$\('brief'\)\.value\)/);
  // Gesperrte Eingabefelder liefert FormData nicht mit: die Art kommt aus dem fortgeschriebenen Auftrag.
  assert.match(app, /kind:supplement\?\.kind\|\|new FormData/);
  assert.match(app, /supplement-cancel/);
  const html = fs.readFileSync(new URL('../../admin/redaktion/index.html', import.meta.url), 'utf8');
  for (const id of ['supplement-note', 'supplement-title', 'supplement-cancel']) assert.ok(html.includes(`id="${id}"`), id);
});
