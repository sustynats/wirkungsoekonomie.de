import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { schreibeDaten, DATEN_ENDUNG } from '../../scripts/news/app-pages.mjs';

// Natalie am 20.09.2026, als die ausgelieferte Seite 12 MB unter dem Limit von
// GitHub Pages stand: „koennen die Tickerdaten nicht direkt ins release?" Ins
// Release nicht - GitHub setzt bei Release-Dateien keine Freigabe fuer
// Skriptzugriffe, die App bekaeme die Daten nicht mehr. Gepackt schrumpfen sie
// auf ein Sechstel, und jede neue Meldung waechst ebenfalls nur gepackt.

test('die App-Daten liegen gepackt und ergeben wieder genau den Datensatz', () => {
  const ordner = fs.mkdtempSync(path.join(os.tmpdir(), 'ticker-daten-'));
  try {
    const wert = { revision: 'abc', items: Array.from({ length: 40 }, (_, i) => ({ id: `x${i}`,
      html: '<article data-news-card>Wirkung fuer Mensch, Planet und Demokratie</article>' })) };
    const datei = path.join(ordner, `manifest${DATEN_ENDUNG}`);
    schreibeDaten(datei, wert);
    assert.equal(DATEN_ENDUNG, '.json.gz');
    assert.deepEqual(JSON.parse(gunzipSync(fs.readFileSync(datei)).toString('utf8')), wert);
    assert.ok(fs.readFileSync(datei).length < Buffer.byteLength(JSON.stringify(wert)), 'gepackt ist kleiner');
    // Gleicher Stand, gleiche Datei: sonst erzeugte jeder Lauf einen Unterschied.
    const erste = fs.readFileSync(datei);
    schreibeDaten(datei, wert);
    assert.deepEqual(fs.readFileSync(datei), erste);
    assert.equal(fs.readdirSync(ordner).length, 1, 'keine Reste vom Zwischenschritt');
  } finally { fs.rmSync(ordner, { recursive: true }); }
});

test('der Erzeuger schreibt keine ungepackten App-Daten mehr', () => {
  const erzeuger = fs.readFileSync(new URL('../../scripts/news/app-pages.mjs', import.meta.url), 'utf8');
  for (const teil of ["'items'", "'search'", "'feeds'"]) {
    const zeile = erzeuger.split('\n').find((z) => z.includes(teil) && z.includes('path.join(api'));
    assert.ok(zeile?.includes('DATEN_ENDUNG'), `${teil} muss gepackt geschrieben werden`);
  }
  assert.equal(erzeuger.includes("path.join(api,'manifest.json')"), false);
});
