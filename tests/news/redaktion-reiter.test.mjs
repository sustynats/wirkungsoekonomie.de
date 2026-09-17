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

// 16.09., Natalie im Betrieb-Reiter: „diese Aktion wurde nicht gefunden." Die
// Auskunft ist eine neue Route des Redaktionsservers; die App war vor seiner
// neuen Fassung da. Dann gehoert dort ein verstaendlicher Satz hin statt des
// rohen Serverhinweises - und der Ticker laeuft davon unberuehrt weiter.
test('eine noch unbekannte Betriebsroute wird erklaert, nicht durchgereicht', () => {
  const block = app.slice(app.indexOf('async function loadStatus'), app.indexOf('async function loadStatus') + 1400);
  assert.match(block, /error\.status===404/, 'der Fall wird unterschieden');
  assert.match(block, /Der Redaktionsserver kennt die Betriebsauskunft noch nicht/);
  assert.match(block, /am Ticker selbst ändert das nichts/, 'und sagt, dass nichts kaputt ist');
  assert.match(block, /error\.status===403 \|\| error\.status===401/, 'eine abgelaufene Anmeldung ist etwas anderes');
  assert.ok(!/body\.append\(element\('p',error\.message\|\|/.test(block), 'der rohe Serverhinweis steht nicht mehr allein da');
});

// 17.09.2026, Natalie vor einer geparkten Fassung: „Hier ist gar kein
// Freigeben-Button?" und „Aber bei Freigeben steht eine 1 oben. Ich muss also
// etwas tun." Der Reiter zaehlte sie als offen, der Knopf war weg, der Grund
// stand nirgends. Die App erklaert ihn jetzt.
test('eine geparkte Fassung erklaert sich, statt nur den Knopf wegzunehmen', async () => {
  const { parkedReason, PARKED_CODES } = await import('../../admin/redaktion/parked-review.js');
  const geparkt = parkedReason({ status: 'NEEDS_REVIEW', publication: { error: 'PERSONAL_EPISODE_ALREADY_PUBLISHED' } });
  assert.equal(geparkt.kopf, 'Diese Fassung ist geparkt');
  assert.match(geparkt.was, /schon eine Analyse veröffentlicht/, 'sagt, was passiert ist');
  assert.match(geparkt.warum, /Deshalb fehlt/, 'und warum der Knopf fehlt');
  assert.match(geparkt.tun, /Nicht veröffentlichen/, 'und was zu tun ist');
  assert.equal(geparkt.code, 'PERSONAL_EPISODE_ALREADY_PUBLISHED');
  // Ein unbekannter Code bleibt verstaendlich, statt roh durchzureichen.
  const unbekannt = parkedReason({ status: 'NEEDS_REVIEW', publication: { error: 'IRGENDWAS_NEUES' } });
  assert.match(unbekannt.was, /Veröffentlichung ist danach fehlgeschlagen/);
  assert.match(unbekannt.tun, /zurückgeben|nicht veröffentlichen/i);
  // Ohne Code und in jedem anderen Zustand passiert nichts.
  assert.equal(parkedReason({ status: 'NEEDS_REVIEW' }).code, null);
  assert.equal(parkedReason({ status: 'AWAITING_FINAL_APPROVAL' }), null);
  assert.equal(parkedReason(null), null);
  assert.ok(PARKED_CODES.includes('PERSONAL_SLUG_COLLISION'));
  // Die App zeigt den Kasten vor den Knoepfen.
  const kasten = app.indexOf('const geparkt=parkedReason(r)');
  assert.ok(kasten > 0 && kasten < app.indexOf("'approval-actions'"), 'die Erklaerung steht vor den Knoepfen');
});
