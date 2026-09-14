import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const script = fs.readFileSync(new URL('../../assets/js/news-app-viewport.js', import.meta.url), 'utf8');
function harness({ withViewport = true } = {}) {
  const events = {}, viewportEvents = {}, mediaEvents = {}, frames = [];
  const state = { nativeBottom: 844, offset: 0, writes: 0 };
  const nav = {
    getBoundingClientRect: () => ({ bottom: state.nativeBottom + state.offset, height: 99 }),
    style: {
      setProperty(name, value) { assert.equal(name, '--ticker-nav-offset'); state.offset = parseFloat(value); state.writes++; },
      removeProperty() { state.offset = 0; },
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
    event: name => { events[name](); flush(); }, viewportEvent: name => { viewportEvents[name](); flush(); },
    desktop: () => { media.matches = false; mediaEvents.change(); flush(); } };
}
test('ordinary feed scrolling leaves native fixed navigation untouched', () => {
  const h = harness();
  h.window.scrollY = 9000; h.event('scroll'); h.event('touchend');
  assert.equal(h.state.offset, 0); assert.equal(h.state.writes, 0);
});
test('a displaced mobile bar returns to the screen edge without accumulating offsets', () => {
  const h = harness(); h.state.nativeBottom = 540; h.event('scroll');
  assert.equal(h.nav.getBoundingClientRect().bottom, 844);
  h.event('scroll'); h.event('touchend'); assert.equal(h.state.writes, 1);
  h.state.nativeBottom = 844; h.viewportEvent('resize');
  assert.equal(h.state.offset, 0); assert.equal(h.nav.getBoundingClientRect().bottom, 844);
});
test('keyboard opening and dismissal track the visible screen, including a stale iOS offset', () => {
  const h = harness(); h.viewport.height = 480; h.viewport.offsetTop = 110;
  h.viewportEvent('resize'); assert.equal(h.nav.getBoundingClientRect().bottom, 590);
  h.viewport.height = 844; h.viewportEvent('resize');
  assert.equal(h.nav.getBoundingClientRect().bottom, 844);
});
test('viewport growth, orientation, history return and resuming repair stale positions', () => {
  const h = harness(); h.window.innerHeight = 650; h.viewport.height = 844;
  h.state.nativeBottom = 650; h.viewportEvent('resize'); assert.equal(h.nav.getBoundingClientRect().bottom, 844);
  for (const event of ['orientationchange', 'pageshow', 'visibilitychange']) {
    h.state.nativeBottom -= 30; h.event(event); assert.equal(h.nav.getBoundingClientRect().bottom, 844);
  }
});
test('desktop and pinch zoom release the mobile adjustment', () => {
  const h = harness(); h.state.nativeBottom = 600; h.event('scroll');
  h.viewport.scale = 2; h.viewportEvent('resize'); assert.equal(h.state.offset, 0);
  h.viewport.scale = 1; h.viewportEvent('resize'); assert.notEqual(h.state.offset, 0);
  h.desktop(); assert.equal(h.state.offset, 0);
});
test('older browsers use window height; pages without the app navigation are untouched', () => {
  const h = harness({ withViewport: false }); h.state.nativeBottom = 600; h.event('resize');
  assert.equal(h.nav.getBoundingClientRect().bottom, 844);
  assert.doesNotThrow(() => vm.runInNewContext(script, { document: { querySelector: () => null } }));
});
