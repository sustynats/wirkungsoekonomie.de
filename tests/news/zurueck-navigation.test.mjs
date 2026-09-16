import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const build = fs.readFileSync(new URL('../../scripts/news/build.mjs', import.meta.url), 'utf8');
const navigation = fs.readFileSync(new URL('../../assets/js/news-navigation.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../../assets/css/news.css', import.meta.url), 'utf8');

// Natalie am 16.09.2026: „Nicht jeder kapiert das mit dem Wischen ... Irgendwie
// fehlt die Zurücknavigation." Und: „Es ist nur am Ende des Artikels zurück."
// Der Rückweg lag ausschliesslich im Fuss - bei einer Analyse mit 13.000 Zeichen
// also unerreichbar, ohne alles zu durchscrollen.
test('jede Artikelart traegt den Rueckweg im Kopf, nicht nur im Fuss', () => {
  // Drei Vorlagen: Wirkungsakte, redaktionelle Analyse, persoenliche Ausgabe.
  // Direkt hinter der Brotkrume, also vor Rubrik und Titel.
  const heroes = [...build.matchAll(/<\/nav>\$\{backToOverview\(([^}]*)\)\}/g)];
  assert.equal(heroes.length, 3, 'alle drei Kopfbereiche haben den Rueckweg');
  assert.ok(heroes.some(([, args]) => args.includes('overviewHref(story')), 'die Wirkungsakte kehrt an die Leseposition zurueck');
  assert.equal(heroes.filter(([, args]) => args.includes('../../analysen/')).length, 2, 'die Analysen kehren in die Analysenliste zurueck');
  // Der Rueckweg steht vor dem Titel, nicht irgendwo spaeter.
  for (const [match] of heroes) {
    const rest = build.slice(build.indexOf(match) + match.length, build.indexOf(match) + match.length + 400);
    assert.ok(/hero-kicker|hero-title/.test(rest), 'unmittelbar danach folgt Rubrik oder Titel');
  }
});

test('der Rueckweg ist ein echter Verweis und funktioniert ohne JavaScript', () => {
  const helper = build.slice(build.indexOf('function backToOverview'), build.indexOf('function matchesFilter'));
  assert.match(helper, /<a class="news-back-top" href="\$\{escapeHtml\(href\)\}"/, 'ein Anker mit Adresse, keine versteckte Schaltflaeche');
  assert.match(helper, /data-news-return-to-list/, 'und als Rueckweg markiert, den die Navigation kennt');
  assert.match(helper, /data-news-back-top/);
  assert.ok(!/<button/.test(helper), 'keine Schaltflaeche, die ohne JavaScript verschwindet');
  assert.ok(!/\shidden[\s>]/.test(helper), 'und nichts daran ist versteckt');
  assert.match(helper, /escapeHtml\(label\)/, 'die Beschriftung wird maskiert');
});

test('mit JavaScript nimmt er denselben Weg wie das Wischen', () => {
  const block = navigation.slice(navigation.indexOf('a[data-news-back-top]'), navigation.indexOf('a[data-news-back-top]') + 600);
  assert.match(block, /event\.preventDefault\(\);\s*goBack\(\);/, 'derselbe Rueckweg, damit Filter und Leseposition bleiben');
  assert.match(block, /event\.metaKey \|\| event\.ctrlKey/, 'ein Klick mit Zusatztaste bleibt ein normaler Verweis');
  // goBack faellt auf den markierten Rueckweg zurueck, wenn es keine Vorgeschichte gibt.
  assert.match(navigation, /document\.querySelector\("\[data-news-return-to-list\]"\)\?\.href/);
});

test('der Rueckweg ist gross genug fuer den Daumen', () => {
  const rule = css.split('\n').find((line) => line.startsWith('.news-back-top{'));
  assert.ok(rule, 'die Regel ist auffindbar');
  assert.match(rule, /min-height:44px/, 'mindestens 44 Pixel hoch');
  assert.match(rule, /text-decoration:none/);
  assert.ok(css.includes('.news-back-top:focus-visible{outline:3px solid #ba632f'), 'mit sichtbarem Tastaturfokus');
});
