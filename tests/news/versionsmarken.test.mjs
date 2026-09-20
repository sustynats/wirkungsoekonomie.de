import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

// Stylesheet und Navigationsskript werden mit fester Versionsmarke geladen
// (build.mjs). Aendert sich die Datei, ohne dass die Marke mitwandert, liefert
// der Cache die alte Fassung aus - die Aenderung ist live und trotzdem nicht
// da. Am 17.09.2026 haette das den Zurueck-Knopf des Vorlesers verschluckt; am
// 18.09. die Tabellen- und die Navigationsreparatur. Dieser Test erzwingt das
// Mitziehen: wer eine der Dateien aendert, faellt auf, bis er die Marke erhoeht.
const quelle = (datei) => fs.readFileSync(new URL(datei, import.meta.url), 'utf8');
const build = quelle('../../scripts/news/build.mjs');
const inhalt = (datei) => createHash('sha256').update(fs.readFileSync(new URL(datei, import.meta.url))).digest('hex').slice(0, 16);

for (const [datei, muster, marke, fingerabdruck, traeger] of [
  ['../../assets/css/news.css', /assets\/css\/news\.css\?v=\$\{PUBLIC_RELEASE\}-([\w-]+)/, 'app-20260918-tabellen', '7324415e00c69c61'],
  ['../../assets/js/news-app-viewport.js', /assets\/js\/news-app-viewport\.js\?v=([\w-]+)/, '20260918-tastatur', 'e7bc64988561691e'],
  // news-app.js holt seit dem 20.09.2026 gepackte Daten. Laedt ein Browser die
  // alte Fassung aus dem Cache, sucht sie Dateien, die es nicht mehr gibt.
  ['../../assets/js/news-app.js', /assets\/js\/news-app\.js\?v=([\w-]+)/, '20260920-gepackt', 'ae4dccc4a00a4e5e', '../../scripts/news/app-pages.mjs'],
]) {
  test(`die Versionsmarke wandert mit ${datei.split('/').at(-1)}`, () => {
    assert.equal(inhalt(datei), fingerabdruck,
      `${datei} wurde geaendert: neue Versionsmarke in build.mjs setzen und beide Werte hier nachziehen, sonst bleibt die alte Fassung im Cache.`);
    assert.equal((traeger ? quelle(traeger) : build).match(muster)?.[1], marke, `Marke in ${traeger || 'build.mjs'} und Wert in diesem Test muessen zusammen wandern.`);
  });
}
