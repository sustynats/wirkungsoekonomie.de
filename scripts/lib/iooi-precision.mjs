import fs from 'node:fs';
import path from 'node:path';
import {ComparisonTable, escapeHtml as esc} from './explainer-components.mjs';

export const iooiPrecision = JSON.parse(fs.readFileSync(new URL('../../content/site/iooi-precision-2026-10-01.json', import.meta.url), 'utf8'));

export function renderIooiPrecision({example = true} = {}) {
  const data = iooiPrecision;
  return `<section class="section section-soft" id="praezisierung-20261001" data-iooi-precision="${data.date}" aria-labelledby="iooi-precision-title">
    <div class="article-body">
    <p class="hero-kicker">Fachliche Präzisierung · <time datetime="${data.date}">1. Oktober 2026</time></p>
    <h2 id="iooi-precision-title">${esc(data.title)}</h2>
    <p><strong>${esc(data.summary)}</strong></p>
    ${data.sections.map(section => `<h3>${esc(section.title)}</h3>${section.paragraphs.map(text => `<p>${esc(text)}</p>`).join('')}`).join('')}
    <p class="meta-line">Die Tabellen lassen sich auf schmalen Bildschirmen seitlich verschieben.</p>
    ${ComparisonTable({...data.comparison, scroll:true})}
    ${example ? `<h3>${esc(data.example.title)}</h3><p class="notice">${esc(data.example.notice)}</p>${ComparisonTable({caption:'Modellbeispiel: beobachtete Veränderung und angenommener zusätzlicher Beitrag', columns:['Bezug','Wert','Bedeutung'], rows:data.example.rows, scroll:true})}<p>${esc(data.example.conclusion)}</p>` : ''}
    <h3>Quellen und Geltungsbereich</h3><ul>${data.sources.map(source => `<li><a href="${esc(source.url)}">${esc(source.title)}</a>: ${esc(source.role)}</li>`).join('')}</ul>
    <p>Die WÖk-Anforderungen sind die methodische Festlegung dieses Modells. Die externen Quellen belegen die beschriebenen Anschlussmethoden, nicht eine vergleichend gemessene Überlegenheit.</p>
    </div>
  </section>`;
}

export function renderIooiPublicationNotice() {
  return `<aside class="publication-current-note" data-search-exclude data-iooi-publication-note="${iooiPrecision.date}"><p><strong>${esc(iooiPrecision.publicationNotice)}</strong> <a href="/referenz/aktualisierung/#praezisierung-20261001">Präzisierung und aktuelle PDF-Lesefassungen</a>.</p></aside>`;
}

export function applyIooiPrecisionNotices(root = '.') {
  const marker = 'iooi-publication-20261001';
  const targets = new Set(['buch.html', 'referenz/index.html', 'referenz/volltext/index.html',
    'methodik/index.html', 'werkzeuge/impact-controlling/index.html', 'fuer/unternehmen/impact-controlling/index.html',
    'bibliothek/woek-begriffsleitfaden-fuehrend/index.html',
    'bibliothek/eintraege/woemm-2-0/index.html', 'bibliothek/eintraege/woemm-2-0/lesen/index.html',
    'bibliothek/eintraege/woems-2-0/index.html', 'bibliothek/eintraege/woems-2-0/lesen/index.html']);
  const reference = path.join(root, 'referenz');
  if (fs.existsSync(reference)) for (const name of fs.readdirSync(reference)) {
    if (iooiPrecision.chapterNumbers.some(number => name.startsWith(`kapitel-${String(number).padStart(3, '0')}-`))) targets.add(`referenz/${name}/index.html`);
  }
  for (const family of ['dossiers', 'methodenpapiere']) {
    const relative = `werkzeuge/impact-controlling/${family}`;
    const directory = path.join(root, relative);
    if (fs.existsSync(directory)) {
      targets.add(`${relative}/index.html`);
      for (const entry of fs.readdirSync(directory, {withFileTypes:true})) if (entry.isDirectory()) targets.add(`${relative}/${entry.name}/index.html`);
    }
  }
  const historical = JSON.parse(fs.readFileSync(new URL('../../assets/data/site-review-pdf-editions.json', import.meta.url), 'utf8')).files;
  const editions = JSON.parse(fs.readFileSync(new URL('../../assets/data/iooi-precision-editions-2026-10-01.json', import.meta.url), 'utf8')).files;
  const changed = [];
  for (const relative of targets) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) continue;
    const original = fs.readFileSync(file, 'utf8');
    if (!/<main\b/.test(original)) continue;
    let html = original.replace(new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->`, 'g'), '');
    const start = html.indexOf('>', html.search(/<main\b/)) + 1;
    const hero = html.slice(start).match(/^\s*<section\b[^>]*class="[^"]*\bhero\b[^"]*"[^>]*>[\s\S]*?<\/section>/);
    const at = hero ? start + hero[0].length : start;
    html = html.slice(0, at) + `<!-- ${marker}:start -->${renderIooiPublicationNotice()}<!-- ${marker}:end -->` + html.slice(at);
    for (const edition of editions.filter(item => item.supersedes)) {
      const previous = historical.find(item => item.filename === edition.supersedes);
      if (!previous) throw new Error(`Unknown prior PDF edition: ${edition.supersedes}`);
      html = html.replaceAll(previous.url, edition.url);
    }
    if (html !== original) { fs.writeFileSync(file, html); changed.push(relative); }
  }
  return changed;
}
