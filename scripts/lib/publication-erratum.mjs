import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {escapeHtml as esc} from './explainer-components.mjs';

const data = JSON.parse(fs.readFileSync('content/site/publication-erratum-2026-09-06.json', 'utf8'));
const pdf = JSON.parse(fs.readFileSync('assets/data/publication-erratum-2026-09-06.json', 'utf8'));
const assets = JSON.parse(fs.readFileSync('assets/data/public-release-assets.json', 'utf8')).assets;
const marker = 'publication-erratum-20260906';
const origin = 'https://wirkungsoekonomie.de';

export function renderPublicationErratumDownload() {
  return `<article class="card"><h3 class="card-title">Erratum zu weiteren Fachpapieren</h3><p>Datierte Präzisierungen vom 6. September 2026 zu Registerbegriffen, T-SROI und Sprache, mit konkreten Fundstellen in neun Publikationen.</p><p><a href="${esc(pdf.url)}">PDF öffnen (${pdf.pages} Seiten)</a></p></article>`;
}

export function renderPublicationErratum() {
  return `<section class="section" id="erratum-20260906"><h2 id="erratum-20260906-title">Erratum vom 6. September 2026: Register, T-SROI und Sprache</h2><p>${esc(data.intro)}</p><p><a class="btn btn-secondary" href="${esc(pdf.url)}">PDF-Erratum öffnen (${pdf.pages} Seiten)</a></p>${data.groups.map(group => `<details class="card" id="erratum-${esc(group.id)}"><summary>${esc(group.title)}</summary><p>${esc(group.correction)}</p><p>${esc(group.example)}</p><h3>Betroffene Fundstellen</h3><ul>${group.documents.map(doc => `<li><a href="${esc(assets[doc.source])}">${esc(doc.title)}</a>, physische PDF-Seite ${esc(doc.pages)}. ${esc(doc.note)}</li>`).join('')}</ul><p><a href="${esc(group.reference)}">${esc(group.referenceLabel)}</a></p></details>`).join('')}<p>Die Seitenangaben zählen ab der ersten Seite der Originaldatei. Historische Originale bleiben erhalten; das Erratum ist bei heutiger Anwendung mitzulesen.</p></section>`;
}

export function applyPublicationErratumNotices(root = '.') {
  root = path.resolve(root);
  const targets = new Map();
  const key = url => url.origin + decodeURIComponent(url.pathname);
  for (const group of data.groups) for (const doc of group.documents) for (const source of [doc.source, ...(doc.aliases || [])]) {
    targets.set(key(new URL('/'+source, origin)), group);
    targets.set(key(new URL(assets[source])), group);
  }
  const excluded = new Set(['.git', '_site', 'node_modules', 'templates', 'outputs', 'tests', 'api', 'woek-institut-app']);
  const changed = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      if (excluded.has(entry.name) || entry.name.startsWith('.')) continue;
      const file = path.join(dir, entry.name);
      const relative = path.relative(root, file).replaceAll(path.sep, '/');
      if (entry.isDirectory()) { walk(file); continue; }
      if (!entry.isFile() || !file.endsWith('.html') || relative === 'referenz/aktualisierung/index.html') continue;
      const original = fs.readFileSync(file, 'utf8');
      let html = original.replace(new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->`, 'g'), '');
      const groups = new Map();
      const urls = new Set();
      for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
        try {
          const url = new URL(match[1].replaceAll('&amp;', '&'), origin+'/'+relative);
          const group = targets.get(key(url));
          if (group) { groups.set(group.id, group); urls.add(key(url)); }
        } catch { /* Unrelated non-URL anchors remain untouched. */ }
      }
      // A general catalogue with many originals is not a specific paper entry.
      if (groups.size && urls.size <= 2 && /<main\b/i.test(html)) {
        const links = [...groups.values()].map(group => `<a href="/referenz/aktualisierung/#erratum-${esc(group.id)}">${esc(group.title)}</a>`).join(' · ');
        const note = `<!-- ${marker}:start --><aside class="publication-current-note" data-search-exclude><p><strong>Fachliches Erratum vom 6. September 2026.</strong> Für die verlinkte historische Publikation ist eine datierte Präzisierung mitzulesen: ${links}. <a href="${esc(pdf.url)}">PDF-Erratum öffnen</a>.</p></aside><!-- ${marker}:end -->`;
        const main = html.search(/<main\b/i);
        const start = html.indexOf('>', main)+1;
        const hero = html.slice(start).match(/^\s*<section\b[^>]*class="[^"]*\bhero\b[^"]*"[^>]*>[\s\S]*?<\/section>/);
        const at = hero ? start+hero[0].length : start;
        html = html.slice(0, at)+note+html.slice(at);
      }
      if (html !== original) { fs.writeFileSync(file, html); changed.push(relative); }
    }
  }
  walk(root);
  console.log(`Historical PDF erratum: ${changed.length} publication surfaces updated.`);
  return changed;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  applyPublicationErratumNotices(process.argv[2] || '.');
}
