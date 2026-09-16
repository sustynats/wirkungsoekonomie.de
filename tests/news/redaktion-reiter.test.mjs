import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../../admin/redaktion/index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../../admin/redaktion/redaktion.css', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../../admin/redaktion/redaktion.js', import.meta.url), 'utf8');
const nav = html.match(/<nav class="tabs"[\s\S]*?<\/nav>/)[0];
const header = html.match(/<header class="app-header">[\s\S]*?<\/header>/)[0];

// 16.09., Natalie: „Freigeben lässt sich in der Redaktionsapp nicht mehr
// anklicken." Ein vierter Reiter (Betrieb) liess die Zeile bei 375 px
// ueberlaufen - "Freigeben" rutschte an den Rand und war nicht mehr zu treffen.
// Die Arbeitszeile traegt genau die drei Ansichten, mit denen Natalie arbeitet.
test('die Arbeitszeile traegt genau drei Reiter', () => {
  const buttons = nav.match(/<button/g) || [];
  assert.equal(buttons.length, 3, 'drei Reiter, kein vierter');
  for (const id of ['tab-new', 'tab-list', 'tab-approval']) {
    assert.ok(nav.includes(`id="${id}"`), `${id} steht in der Arbeitszeile`);
  }
  assert.ok(!nav.includes('tab-status'), 'Betrieb gehoert nicht in die Arbeitszeile');
});

test('der Betriebsknopf liegt im Kopf und erscheint erst mit dem Arbeitsbereich', () => {
  assert.ok(header.includes('id="tab-status"'), 'im Kopf, neben Privat');
  assert.ok(header.includes('class="betrieb-chip"'));
  assert.match(header, /<button id="tab-status"[^>]*\shidden>/, 'vor der Anmeldung verborgen');
  assert.match(app, /\$\('workspace'\)\.hidden=false;\$\('tab-status'\)\.hidden=false;/, 'und mit dem Arbeitsbereich sichtbar');
  assert.match(app, /\$\('tab-status'\)\.addEventListener\('click'/, 'er oeffnet weiter die Betriebsansicht');
});

// Sicherheitsnetz: auch bei groesserer Schrift oder einem spaeteren Reiter darf
// die Zeile umbrechen statt einen Knopf aus dem Bild zu schieben.
test('die Arbeitszeile darf umbrechen statt zu klemmen', () => {
  assert.match(css, /\.tabs\{flex-wrap:wrap\}/);
  assert.match(css, /\.tabs button\{flex:1 1 30%;min-width:96px\}/);
  assert.match(css, /\.betrieb-chip\{[^}]*min-height:34px/);
  assert.match(css, /\.betrieb-chip:focus-visible\{outline:3px solid/, 'mit sichtbarem Tastaturfokus');
});
