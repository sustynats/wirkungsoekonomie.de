import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const script = fs.readFileSync(new URL('../../assets/js/news-app-viewport.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../../assets/css/news.css', import.meta.url), 'utf8');

// Die Leiste ist position:fixed mit bottom:0; ihre Unterkante liegt damit am
// unteren Rand des Layout-Viewports (window.innerHeight). Ein positives lift
// zieht sie von dort nach oben, ein negatives nach unten.
function harness({ withViewport = true, lagging = false } = {}) {
  const events = {}, viewportEvents = {}, mediaEvents = {}, frames = [];
  const state = { lift: 0, writes: 0, removals: 0 };
  const nav = {
    // lagging: der Browser führt eine gesetzte Verschiebung noch nicht in der
    // gemessenen Kante. Für die Geometrie darf das keine Rolle spielen.
    getBoundingClientRect: () => ({ bottom: window.innerHeight - (lagging ? 0 : state.lift), height: 99 }),
    style: {
      setProperty(name, value) { assert.equal(name, '--ticker-nav-lift'); state.lift = parseFloat(value); state.writes++; },
      removeProperty(name) { assert.equal(name, '--ticker-nav-lift'); state.lift = 0; state.removals++; },
    },
  };
  const viewport = { height: 844, offsetTop: 0, scale: 1, addEventListener: (key, cb) => { viewportEvents[key] = cb; } };
  const media = { matches: true, addEventListener: (key, cb) => { mediaEvents[key] = cb; } };
  const window = { innerHeight: 844, visualViewport: withViewport ? viewport : undefined, matchMedia: () => media,
    requestAnimationFrame: cb => { frames.push(cb); return frames.length; }, addEventListener: (key, cb) => { events[key] = cb; } };
  const document = { hidden: false, querySelector: () => nav, addEventListener: (key, cb) => { events[key] = cb; } };
  vm.runInNewContext(script, { window, document });
  const flush = () => { while (frames.length) frames.shift()(); };
  flush();
  return { state, viewport, window, document, media, nav, frames, flush,
    bottom: () => nav.getBoundingClientRect().bottom,
    event: name => { events[name](); flush(); }, viewportEvent: name => { viewportEvents[name](); flush(); },
    desktop: () => { media.matches = false; mediaEvents.change(); flush(); } };
}

// 16.09., Natalies Screenshot: die Navigationsleiste stand mitten in der Seite,
// über dem Kartentext. Ursache war das transform auf einem position:fixed
// Element - WebKit hängt ein transformiertes fixed-Element ans Dokument statt
// an den Viewport, es scrollt also mit.
test('die fixierte Leiste trägt kein transform', () => {
  const rule = css.split('\n').find((line) => /\.ticker-app-nav \{position:fixed/.test(line));
  assert.ok(rule, 'die Mobilregel der Leiste ist auffindbar');
  assert.ok(!/transform/.test(rule), 'kein transform auf der fixierten Leiste');
  assert.ok(/bottom:var\(--ticker-nav-lift,0px\)/.test(rule), 'die Korrektur läuft über bottom');
});
test('gewöhnliches Scrollen lässt die native Leiste unberührt', () => {
  const h = harness();
  h.window.scrollY = 9000; h.event('scroll'); h.event('touchend'); h.event('scroll');
  assert.equal(h.state.lift, 0);
  assert.equal(h.state.writes, 0, 'ohne Anlass wird die Eigenschaft nie gesetzt');
});
// Die alte Fassung korrigierte anhand der gemessenen Kante der Leiste - und
// maß damit ihre eigene Wirkung mit. Jetzt zählt allein die Viewport-Geometrie.
test('vierzig Wischbewegungen verschieben nichts, auch bei nachhinkender Messung', () => {
  const h = harness({ lagging: true });
  h.viewport.height = 700;
  for (let i = 0; i < 40; i += 1) { h.event('scroll'); h.event('touchend'); }
  assert.equal(h.state.lift, 144, 'der Wert folgt der Geometrie und läuft nicht davon');
  assert.equal(h.state.writes, 1, 'und wird genau einmal geschrieben');
  h.viewport.height = 844; h.viewportEvent('resize');
  assert.equal(h.state.lift, 0, 'und fällt zurück, sobald der Sichtbereich wieder voll ist');
});
test('Tastatur öffnen und schließen folgt dem sichtbaren Bereich, auch bei stehengebliebenem iOS-Offset', () => {
  const h = harness(); h.viewport.height = 480; h.viewport.offsetTop = 110;
  h.viewportEvent('resize');
  assert.equal(h.state.lift, 254, 'die Leiste steht über der Tastatur');
  assert.equal(h.bottom(), 590, 'genau am unteren Rand des sichtbaren Bereichs');
  h.viewport.height = 844; h.viewport.offsetTop = 0; h.viewportEvent('resize');
  assert.equal(h.state.lift, 0); assert.equal(h.bottom(), 844);
});
test('eingeklappte Browserleiste, Drehung, Zurücknavigation und Rückkehr rechnen neu', () => {
  // Der sichtbare Bereich ist größer als der Layout-Viewport: die Leiste geht
  // nach unten an den echten Rand.
  const h = harness(); h.window.innerHeight = 650; h.viewport.height = 844;
  h.viewportEvent('resize');
  assert.equal(h.state.lift, -194); assert.equal(h.bottom(), 844);
  for (const [event, height, expected] of [['orientationchange', 390, 260], ['pageshow', 844, -194], ['visibilitychange', 650, 0]]) {
    h.viewport.height = height; h.event(event);
    assert.equal(h.state.lift, expected, `${event} rechnet aus der aktuellen Geometrie`);
  }
});
test('Desktop und Pinch-Zoom geben die Anpassung frei', () => {
  const h = harness(); h.viewport.height = 600; h.viewportEvent('resize');
  assert.equal(h.state.lift, 244, 'der verkleinerte Sichtbereich hebt die Leiste');
  h.viewport.scale = 2; h.viewportEvent('resize'); assert.equal(h.state.lift, 0);
  h.viewport.scale = 1; h.viewportEvent('resize'); assert.equal(h.state.lift, 244);
  h.desktop(); assert.equal(h.state.lift, 0);
});
test('ältere Browser bleiben beim Browserverhalten; Seiten ohne App-Navigation bleiben unberührt', () => {
  // Ohne visualViewport gibt es keine belastbare Geometrie: dann bleibt die
  // Leiste ein gewöhnliches position:fixed und wird nicht angefasst.
  const h = harness({ withViewport: false });
  h.event('resize'); h.event('scroll');
  assert.equal(h.state.writes, 0);
  assert.doesNotThrow(() => vm.runInNewContext(script, {
    window: { matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener() {}, requestAnimationFrame() {} },
    document: { querySelector: () => null, addEventListener() {} },
  }));
});
