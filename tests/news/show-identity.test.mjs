import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { showIdentity, renderShowIdentity, officialShowName, canonicalShowName, showNameCollisions } from '../../scripts/news/show-identity.mjs';
import { normalizeEditorialPreview } from '../../scripts/news/redaktionsworker.mjs';

const config = JSON.parse(fs.readFileSync(new URL('../../data/news/show-visual-identities.json', import.meta.url)));
const cleared = config.shows.filter((show) => show.rights_status === 'PERMISSION_GRANTED' && show.asset_delivery_status === 'DELIVERED');

// 16.09.: Die Ausgabe zu Folge #262 schrieb „Lanz & Precht", die ZDF-Freigabe
// lautet auf „Lanz + Precht". Gleiche Sendung, gleiches Recht, geliefertes
// Logo - und in der App stand die Platzhalterkachel.
test('ein freigegebenes Logo wird auch bei anderer Schreibweise gefunden', () => {
  const asset = '/assets/img/shows/lanz-precht-official.jpg';
  for (const show of ['Lanz + Precht', 'Lanz & Precht', 'Lanz und Precht', 'LANZ & PRECHT', 'lanz+precht']) {
    const identity = showIdentity({ show });
    assert.equal(identity?.id, 'lanz_precht', `${show} findet die Sendung`);
    assert.equal(identity.usable_asset, asset, `${show} findet das Logo`);
    assert.ok(renderShowIdentity({ show }).includes(asset), `${show} rendert das Logo`);
    assert.ok(renderShowIdentity({ show }).includes('Logo: ZDF/Brand New Media'), 'mit der Credit-Zeile');
  }
  // Die eigene Sendung von Markus Lanz bleibt davon unberührt.
  assert.equal(showIdentity({ show: 'Markus Lanz' })?.id, 'markus_lanz');
  assert.equal(showIdentity({ show: 'Lanz' })?.id, 'markus_lanz');
});

test('alle gelieferten Freigaben sind über ihre amtliche Schreibweise erreichbar', () => {
  assert.ok(cleared.length >= 5, 'die fünf ZDF-Logos sind konfiguriert');
  for (const show of cleared) {
    const identity = showIdentity({ show: show.show_name });
    assert.equal(identity?.id, show.id);
    assert.equal(identity.usable_asset, show.asset, `${show.show_name} liefert sein Logo aus`);
  }
});

// Eine mehrdeutige Schreibweise darf nie zum Logo der falschen Sendung führen:
// ein Rechtefehler wäre schwerer als eine Platzhalterkachel.
test('mehrdeutige oder unbekannte Namen geben die Platzhalterkachel', () => {
  assert.deepEqual(showNameCollisions(), [], 'keine zwei Sendungen teilen eine kanonische Form');
  const ambiguous = [{ id: 'a', show_name: 'Doppelt + Belegt', rights_status: 'PERMISSION_GRANTED', allow_website: true, allow_archive: true, asset: '/assets/img/shows/markus-lanz-official.jpg', credit: 'c', rights_checked_at: '2026-09-14', source_url: 'https://example.org' },
    { id: 'b', show_name: 'Doppelt & Belegt', rights_status: 'PERMISSION_GRANTED', allow_website: true, allow_archive: true, asset: '/assets/img/shows/maybrit-illner-official.jpg', credit: 'c', rights_checked_at: '2026-09-14', source_url: 'https://example.org' }];
  assert.equal(showIdentity({ show: 'Doppelt und Belegt' }, { shows: ambiguous }), null, 'lieber kein Logo als das falsche');
  assert.equal(showNameCollisions(ambiguous).length, 1);
  assert.equal(showIdentity({ show: 'Tagesschau' }), null);
  assert.equal(showIdentity({ show: '' }), null);
  assert.equal(showIdentity({}), null);
  // Ohne Freigabe bleibt es bei der textlichen Kennung.
  assert.equal(showIdentity({ show: 'NEU DENKEN' })?.usable_asset, null);
  assert.ok(renderShowIdentity({ show: 'NEU DENKEN' }).includes('news-show-identity__fallback'));
});

test('die kanonische Form trennt Sendungen und verbindet Schreibweisen', () => {
  assert.equal(canonicalShowName('Lanz & Precht'), canonicalShowName('Lanz + Precht'));
  assert.equal(canonicalShowName('Terra X Lesch & Co.'), canonicalShowName('Terra X Lesch und Co'));
  assert.notEqual(canonicalShowName('Markus Lanz'), canonicalShowName('Lanz + Precht'));
  assert.equal(canonicalShowName(null), '');
  assert.equal(officialShowName('lanz und precht'), 'Lanz + Precht');
  assert.equal(officialShowName('Tagesschau'), null);
});

// Damit die Akte gar nicht erst eine abweichende Schreibweise speichert.
test('der Worker traegt die amtliche Schreibweise in die Akte ein', () => {
  const repairs = [];
  const preview = normalizeEditorialPreview({ title: 'Nachgehört', format: 'listened', markdown: '## Meine Einordnung\n\nEin Urteil.',
    source_media: { show: 'Lanz & Precht', episode_title: '#262', original_release_date: '2026-09-12', original_url: 'https://www.zdf.de/talk/lanz-precht-102' } }, { repairs });
  assert.equal(preview.source_media.show, 'Lanz + Precht');
  assert.ok(repairs.some((r) => /amtliche Schreibweise \(Lanz \+ Precht\)/.test(r)), 'und protokolliert es');
  // Eine unbekannte Sendung wird nicht umbenannt.
  const other = normalizeEditorialPreview({ title: 'T', format: 'listened', markdown: '## Meine Einordnung\n\nU.',
    source_media: { show: 'Irgendein Podcast', original_url: 'https://example.org/x' } }, { repairs: [] });
  assert.equal(other.source_media.show, 'Irgendein Podcast');
});

// Die veröffentlichten Ausgaben tragen die Schreibweise, die ihr Logo findet.
test('jede veroeffentlichte Ausgabe mit freigegebener Sendung zeigt ihr Logo', () => {
  const editions = JSON.parse(fs.readFileSync(new URL('../../data/news/personal-editorials.json', import.meta.url))).editions;
  const withShow = editions.filter((edition) => edition.source_media?.show);
  assert.ok(withShow.length >= 4, 'es gibt Nachbesprechungen mit Sendungsangabe');
  for (const edition of withShow) {
    const official = officialShowName(edition.source_media.show);
    if (!official) continue;
    assert.equal(edition.source_media.show, official, `${edition.slug} traegt die amtliche Schreibweise`);
    const entry = cleared.find((show) => show.show_name === official);
    if (entry) assert.equal(showIdentity(edition.source_media)?.usable_asset, entry.asset, `${edition.slug} zeigt sein Logo`);
  }
});
