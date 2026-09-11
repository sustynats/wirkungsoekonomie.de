// Shared, on-device reading. No microphone, remote TTS, generated summary or audio upload.
const OMIT = 'script,style,noscript,nav,footer,button,form,input,textarea,select,[hidden],[aria-hidden="true"],[data-read-aloud-skip],[data-search-exclude],.read-aloud,.content-save-tools,.wirkungsraum-note-panel,.news-editorial-article__aside,.news-story-aside,.news-related,.news-editorial-related,.news-story-footer,.news-editorial-toc,.hero-actions,.news-source-summary__links,.news-editorial-byline,.news-reader-actions';
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
export function splitSpeech(text, limit = 240) {
  const parts = []; let rest = clean(text);
  while (rest.length > limit) {
    const head = rest.slice(0, limit + 1);
    const boundaries = [...head.matchAll(/[.!?;:]\s/g)].map(m => m.index + 1).filter(i => i >= limit / 3);
    let cut = boundaries.at(-1) || head.lastIndexOf(' ');
    if (cut < 1) cut = limit;
    parts.push(rest.slice(0, cut).trim()); rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}
export function localVoices(voices, lang = 'de') {
  const language = lang.toLowerCase().split('-')[0];
  return voices.filter(v => v.localService === true && v.lang.toLowerCase().split(/[-_]/)[0] === language)
    .sort((a, b) => Number(b.default) - Number(a.default) || a.name.localeCompare(b.name));
}
function textOf(node) {
  const copy = node.cloneNode(true);
  copy.querySelectorAll?.(OMIT).forEach(el => el.remove());
  copy.querySelectorAll?.('a').forEach(el => { if (/^(?:https?:\/\/|www\.)/.test(clean(el.textContent))) el.remove(); });
  return clean(copy.textContent);
}
export function tableSpeech(table, en = false) {
  const rows = [...table.rows];
  const caption = textOf(table.querySelector('caption') || table.ownerDocument.createElement('span'));
  const result = [caption ? `${en ? 'Table' : 'Tabelle'}: ${caption}.` : en ? 'Table.' : 'Tabelle.'];
  const complex = rows.some(row => [...row.cells].some(c => c.colSpan > 1 || c.rowSpan > 1));
  if (complex) {
    result.push(en ? 'Merged cells. Reading the rows in order.' : 'Verbundene Zellen. Die Zeilen werden der Reihe nach vorgelesen.');
    rows.forEach((row, i) => result.push(`${en ? 'Row' : 'Zeile'} ${i + 1}. ${[...row.cells].map(textOf).join('; ')}.`));
  } else {
    const headerRows = rows.filter(row => row.parentElement.tagName === 'THEAD');
    const header = headerRows.at(-1) || (rows[0] && [...rows[0].cells].every(c => c.tagName === 'TH' && c.scope !== 'row') ? rows[0] : null);
    const labels = header ? [...header.cells].map(textOf) : [];
    rows.filter(row => row !== header && !headerRows.includes(row)).forEach((row, i) => {
      const values = [...row.cells].map((cell, col) => `${labels[col] || `${en ? 'Column' : 'Spalte'} ${col + 1}`}: ${textOf(cell) || (en ? 'no entry' : 'keine Angabe')}`);
      result.push(`${en ? 'Row' : 'Zeile'} ${i + 1}. ${values.join('; ')}.`);
    });
  }
  result.push(en ? 'End of table.' : 'Ende der Tabelle.');
  return result;
}
export function articleRoots(doc) {
  const main = doc.querySelector('main');
  if (!main || /^\/(?:admin|intern|mein-wirkungsraum|api)(?:\/|$)/.test(doc.location?.pathname || '')) return [];
  if (main.dataset.newsReader === 'list' || /^\/wirkungsticker\/(?:news\/|analysen\/|merkzettel\/|suche\/|mehr\/)?(?:index\.html)?$/.test(doc.location?.pathname || '')) return [];
  const body = main.querySelector('.news-editorial-article__main, .news-story-main, [itemprop="articleBody"], .article-body, .article-content, .post-content');
  const heading = main.querySelector('h1');
  if (!heading) return [];
  if (body) return [heading, main.querySelector('.hero-subtitle'), ...main.querySelectorAll('.news-correction'), body].filter(Boolean);
  // Article metadata and explicit content surfaces cover journal, library and knowledge pages.
  const isArticle = doc.querySelector('meta[property="og:type"][content="article"]') || main.matches('[data-read-aloud], [data-search-content]') || main.querySelector('article h1');
  if (!isArticle || main.querySelector('[data-news-feed], [data-news-app-feed]')) return [];
  return [main];
}
export function readingBlocks(roots, en = false) {
  const blocks = [];
  const add = (text, element) => { text = clean(text); if (text) blocks.push({text, element}); };
  function walk(node) {
    if (node.nodeType === 3) { add(node.textContent, node.parentElement); return; }
    if (node.nodeType !== 1 || node.matches(OMIT)) return;
    if (node.tagName === 'TABLE') { tableSpeech(node, en).forEach(t => add(t, node)); return; }
    if (node.tagName === 'DETAILS' && !node.open) return;
    if (node.localName === 'svg') { const description = node.querySelector('desc')?.textContent || node.getAttribute('aria-label') || node.querySelector('title')?.textContent; if (description) add(`${en ? 'Diagram' : 'Diagramm'}: ${description}`, node); return; }
    if (node.tagName === 'IMG') { if (node.alt && !node.closest('.hero,.news-editorial-byline')) add(`${en ? 'Image' : 'Abbildung'}: ${node.alt}`, node); return; }
    if (/^(H[1-6]|P|DT|DD|FIGCAPTION|SUMMARY)$/.test(node.tagName)) { add(textOf(node), node); return; }
    if (node.tagName === 'LI') {
      const copy = node.cloneNode(true); copy.querySelectorAll('ul,ol').forEach(el => el.remove()); add(textOf(copy), node);
      [...node.children].filter(el => /^(UL|OL)$/.test(el.tagName)).forEach(walk); return;
    }
    if (node.tagName === 'A' && /^(?:https?:\/\/|www\.)/.test(clean(node.textContent))) return;
    for (const child of node.childNodes) walk(child);
  }
  roots.forEach(root => {
    // News titles can intentionally be visually hidden alongside their title card.
    if (root.tagName === 'H1') add(textOf(root), root); else walk(root);
  });
  return blocks;
}

// Cancel/restart from the current short passage avoids broken pause/resume on mobile engines.
// A generation token ignores late end/error events from cancelled utterances.
export class SpeechReader {
  constructor({synth, Utterance, onChange = () => {}, lang = 'de-DE'}) {
    Object.assign(this, {synth, Utterance, onChange, lang});
    this.state = 'idle'; this.index = 0; this.chunks = []; this.generation = 0; this.rate = 1;
  }
  update() { this.onChange(this); }
  start(blocks, voice) {
    if (!voice?.localService) throw new Error('LOCAL_VOICE_REQUIRED');
    this.stop(); this.voice = voice;
    this.chunks = blocks.flatMap((block, blockIndex) => splitSpeech(block.text).map(text => ({...block, blockIndex, text})));
    if (!this.chunks.length) return;
    this.state = 'playing'; this.speak();
  }
  cancel() { this.generation++; this.synth.cancel(); this.utterance = null; }
  speak() {
    if (this.index >= this.chunks.length) { this.cancel(); this.state = 'finished'; this.update(); return; }
    const token = ++this.generation;
    const utterance = new this.Utterance(this.chunks[this.index].text);
    this.utterance = utterance; utterance.voice = this.voice; utterance.lang = this.lang; utterance.rate = this.rate;
    utterance.onend = () => { if (token !== this.generation || this.state !== 'playing') return; this.index++; this.speak(); };
    utterance.onerror = event => {
      if (token !== this.generation) return;
      this.cancel(); this.state = 'error'; this.error = event.error; this.update();
    };
    this.update();
    try { this.synth.resume(); this.synth.speak(utterance); } catch { utterance.onerror({error:'unavailable'}); }
  }
  pause() { if (this.state !== 'playing') return; this.cancel(); this.state = 'paused'; this.update(); }
  resume() { if (this.state !== 'paused') return; this.state = 'playing'; this.speak(); }
  stop() { this.cancel(); this.index = 0; this.state = 'idle'; this.update(); }
  next() {
    if (!['playing','paused'].includes(this.state)) return;
    const block = this.chunks[this.index]?.blockIndex;
    while (this.index < this.chunks.length && this.chunks[this.index].blockIndex === block) this.index++;
    this.cancel(); if (this.state === 'playing') this.speak(); else if (this.index >= this.chunks.length) { this.state = 'finished'; this.update(); } else this.update();
  }
  setRate(rate) { this.rate = rate; if (this.state === 'playing') { this.cancel(); this.speak(); } }
}

export function initReadAloud(doc = document, win = window) {
  if (doc.querySelector('[data-read-aloud-player]')) return;
  const roots = articleRoots(doc); if (!roots.length) return;
  const en = doc.documentElement.lang.startsWith('en');
  const say = (de, english) => en ? english : de;
  const heading = doc.querySelector('main h1');
  const host = doc.createElement('div'); host.className = 'read-aloud-slot';
  const panel = doc.createElement('section'); panel.className = 'read-aloud'; panel.dataset.readAloudPlayer = 'true'; panel.setAttribute('aria-label', say('Beitrag vorlesen', 'Read article aloud'));
  const button = (text, label) => { const b = doc.createElement('button'); b.type = 'button'; b.textContent = text; if (label) b.setAttribute('aria-label', label); return b; };
  const play = button(say('▶ Vorlesen', '▶ Read aloud'));
  const pause = button(say('Pause', 'Pause'));
  const stop = button(say('Beenden', 'Stop'));
  const next = button('→', say('Nächsten Abschnitt vorlesen', 'Read next paragraph'));
  const controls = doc.createElement('div'); controls.className = 'read-aloud__controls'; controls.hidden = true; controls.append(pause, next, stop);
  const settings = doc.createElement('details'); settings.className = 'read-aloud__settings';
  const summary = doc.createElement('summary'); summary.textContent = say('Stimme & Tempo', 'Voice & speed'); settings.append(summary);
  const voices = doc.createElement('select'); voices.setAttribute('aria-label', say('Lokale Systemstimme', 'Local system voice'));
  const rate = doc.createElement('select'); rate.setAttribute('aria-label', say('Vorlesetempo', 'Reading speed'));
  for (const speed of [0.8, 1, 1.2, 1.5]) { const option = doc.createElement('option'); option.value = speed; option.textContent = `${String(speed).replace('.',en ? '.' : ',')} ×`; option.selected = speed === 1; rate.append(option); }
  settings.append(voices, rate);
  const status = doc.createElement('p'); status.className = 'read-aloud__status'; status.setAttribute('role','status');
  status.textContent = say('Mit Systemstimme. Tabellen werden zeilenweise vorgelesen.', 'System voice. Tables are read row by row.');
  panel.append(play, controls, settings, status); host.append(panel);
  const anchor = heading.closest('.hero-copy, .hero-content, .document-detail-hero, .term-hero__copy') || heading.parentElement;
  const actions = anchor.querySelector('.hero-actions');
  if (actions) actions.after(host); else heading.after(host);
  const css = doc.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('../css/read-aloud.css?v=20260912-1', import.meta.url).href; doc.head.append(css);
  if (!win.speechSynthesis || !win.SpeechSynthesisUtterance) {
    play.disabled = true; settings.hidden = true;
    status.textContent = say('Dieser Browser unterstützt den Vorlese-Button nicht. Nutze die Vorlesefunktion Deines Geräts.', 'This browser does not support reading aloud. Use your device’s reading function.'); return;
  }
  const synth = win.speechSynthesis;
  let available = [], currentElement;
  const reader = new SpeechReader({synth, Utterance:win.SpeechSynthesisUtterance, lang:doc.documentElement.lang || 'de-DE', onChange(r) {
    const active = ['playing','paused'].includes(r.state);
    if (active && !panel.classList.contains('read-aloud--active')) host.style.minHeight = `${panel.getBoundingClientRect().height}px`;
    play.hidden = active; controls.hidden = !active; panel.classList.toggle('read-aloud--active', active);
    voices.disabled = active;
    if (!active && controls.contains(doc.activeElement)) play.focus();
    pause.textContent = r.state === 'paused' ? say('Fortsetzen','Resume') : 'Pause';
    currentElement?.classList.remove('read-aloud-current'); currentElement = null;
    if (active) {
      currentElement = r.chunks[r.index]?.element; currentElement?.classList.add('read-aloud-current');
      status.textContent = r.state === 'paused' ? say('Pausiert. Fortsetzen wiederholt die letzte kurze Textpassage.', 'Paused. Resume repeats the last short passage.') : say(`Vorlesen · Textteil ${r.index + 1} von ${r.chunks.length}`, `Reading · Passage ${r.index + 1} of ${r.chunks.length}`);
    } else {
      status.textContent = r.state === 'error' ? say('Vorlesen unterbrochen. Bitte erneut starten oder eine andere Systemstimme wählen.', 'Reading interrupted. Restart or choose another system voice.') : r.state === 'finished' ? say('Vorlesen beendet.', 'Finished reading.') : say('Mit Systemstimme. Tabellen werden zeilenweise vorgelesen.', 'System voice. Tables are read row by row.');
    }
    position();
  }});
  function position() {
    const nav = doc.querySelector('.ticker-app-nav');
    const bottom = nav && win.getComputedStyle(nav).position === 'fixed' ? Math.max(0, win.innerHeight - nav.getBoundingClientRect().top) : 0;
    panel.style.setProperty('--read-aloud-bottom', bottom ? `${bottom + 8}px` : 'calc(env(safe-area-inset-bottom, 0px) + 12px)');
    if (panel.classList.contains('read-aloud--active')) {
      doc.body.style.setProperty('--read-aloud-space', `${panel.getBoundingClientRect().height + 20}px`); doc.body.classList.add('has-read-aloud');
    } else { host.style.minHeight = ''; doc.body.classList.remove('has-read-aloud'); }
  }
  function refreshVoices() {
    const selected = available[Number(voices.value)]?.voiceURI;
    available = localVoices(synth.getVoices(), doc.documentElement.lang || 'de'); voices.replaceChildren();
    for (const [i, voice] of available.entries()) { const option = doc.createElement('option'); option.value = String(i); option.textContent = voice.name; voices.append(option); }
    const index = available.findIndex(voice => voice.voiceURI === selected);
    if (index >= 0) voices.value = String(index);
  }
  refreshVoices(); synth.addEventListener('voiceschanged', refreshVoices);
  play.addEventListener('click', () => {
    refreshVoices();
    if (!available.length) { status.textContent = say('Noch keine lokale Stimme für diese Sprache verfügbar. Aktiviere sie in den Spracheinstellungen Deines Geräts und versuche es erneut.', 'No local voice for this language is available yet. Enable one in your device’s speech settings and try again.'); return; }
    const blocks = readingBlocks(roots, en);
    if (!blocks.length) { status.textContent = say('Kein vorlesbarer Beitragstext gefunden.', 'No readable article text found.'); return; }
    reader.start(blocks, available[Number(voices.value) || 0]); pause.focus();
  });
  pause.addEventListener('click', () => reader.state === 'paused' ? reader.resume() : reader.pause());
  stop.addEventListener('click', () => { reader.stop(); play.focus(); });
  next.addEventListener('click', () => reader.next()); rate.addEventListener('change', () => reader.setRate(Number(rate.value)));
  settings.addEventListener('toggle', position); win.addEventListener('resize', position);
  win.addEventListener('pagehide', () => reader.stop());
  // Pause when backgrounded; do not promise podcast-like lock-screen playback.
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) reader.pause(); });
  doc.addEventListener('play', event => { if (event.target?.matches?.('audio,video')) reader.pause(); }, true);
  return reader;
}
