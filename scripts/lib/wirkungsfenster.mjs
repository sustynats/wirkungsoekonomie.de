import fs from 'node:fs';
import {escapeHtml as esc} from './explainer-components.mjs';

export const windowContent = JSON.parse(fs.readFileSync(new URL('../../content/site/wirkungsfenster.json', import.meta.url), 'utf8'));

export function renderWindowNote(key) {
  const note = windowContent.notes[key];
  if (!note) throw new Error(`Unknown Wirkungsfenster context: ${key}`);
  return `<section class="section" id="wirkungsfenster"><p class="hero-kicker">Begriffliche Ergänzung · <time datetime="${esc(windowContent.date)}">30. September 2026</time></p><h2>${esc(note.title)}</h2>${note.paragraphs.map(text => `<p>${esc(text)}</p>`).join('')}<p><a class="text-link" href="/verstehen/wirkungsfenster/#anwendung">Wirkungsfenster verstehen und anwenden</a> · <a href="/begriffe/wirkungsfenster/">Definition im Glossar</a></p></section>`;
}
