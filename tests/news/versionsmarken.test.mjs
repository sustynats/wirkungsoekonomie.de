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
const build = fs.readFileSync(new URL('../../scripts/news/build.mjs', import.meta.url), 'utf8');
const inhalt = (datei) => createHash('sha256').update(fs.readFileSync(new URL(datei, import.meta.url))).digest('hex').slice(0, 16);

for (const [datei, muster, marke, fingerabdruck] of [
  ['../../assets/css/news.css', /assets\/css\/news\.css\?v=\$\{PUBLIC_RELEASE\}-([\w-]+)/, 'app-20260918-tabellen', '7324415e00c69c61'],
  ['../../assets/js/news-app-viewport.js', /assets\/js\/news-app-viewport\.js\?v=([\w-]+)/, '20260918-tastatur', 'e7bc64988561691e'],
]) {
  test(`die Versionsmarke wandert mit ${datei.split('/').at(-1)}`, () => {
    assert.equal(inhalt(datei), fingerabdruck,
      `${datei} wurde geaendert: neue Versionsmarke in build.mjs setzen und beide Werte hier nachziehen, sonst bleibt die alte Fassung im Cache.`);
    assert.equal(build.match(muster)?.[1], marke, 'Marke in build.mjs und Wert in diesem Test muessen zusammen wandern.');
  });
}
