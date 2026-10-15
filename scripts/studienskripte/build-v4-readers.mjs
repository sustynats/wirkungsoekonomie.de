import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { renderSiteHeader } from '../lib/site-shell.mjs';
import { renderReader, esc } from './reader-renderer.mjs';
import { learningScriptBody } from '../academy/lib/public-script.mjs';
const root = process.cwd(), master = 'content/studienskripte/v4';
const manifest = JSON.parse(fs.readFileSync(`${master}/PUBLIC_MASTER_MANIFEST.json`));
const corrections = JSON.parse(fs.readFileSync('reports/academy-20261014/targeted-corrections.json'));
const corrected = new Set(corrections.corrections.flatMap(x => x.files.filter(x => x.repo === 'website').map(x => x.path)));
const release = 'https://github.com/sustynats/wirkungsoekonomie.de/releases/download/woek-academy-script-corrections-2026-10-15';
const projection = JSON.parse(fs.readFileSync('content/academy/academy-v4-main-domain-projection.json'));
const offeringTitles = new Map(projection.active_offerings.map(item => [item.offering_id, item.title]));
const displayBodies = JSON.parse(execFileSync('python3', ['scripts/academy/qualify-public-script-terms.py'], { input: JSON.stringify(manifest.lectures.map(item => learningScriptBody(fs.readFileSync(`${master}/${item.public_path}`, 'utf8')))), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
let displayIndex = 0;
const rows = [];
for (const item of manifest.lectures) {
  const sourcePath = `${master}/${item.public_path}`, source = fs.readFileSync(sourcePath, 'utf8');
  if (createHash('sha256').update(source).digest('hex') !== item.public_sha256) throw new Error(`Unknown public source: ${item.lecture_id}`);
  const body = displayBodies[displayIndex++];
  const title = /^#\s+(.+)$/m.exec(body)?.[1];
  if (!title) throw new Error(`Missing title: ${sourcePath}`);
  const slug = item.lecture_id.toLowerCase();
  const route = `bibliothek/studienskripte/v4/${slug}/`;
  const isCorrected = corrected.has(sourcePath);
  const pdfName = `${slug}-2026-10-15.pdf`;
  const {toc, html} = renderReader(body.replace(/^#\s+.+\n/, ''));
  const page = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} | WÖk-Akademie</title><meta name="description" content="${esc(title)}. Vorlesungsskript mit Beispielen, Quellen und Begriffen."><meta name="author" content="Natalie Weber"><meta name="search_section" content="Bibliothek · Studienskripte"><meta name="search_type" content="Studienskript"><link rel="canonical" href="https://wirkungsoekonomie.de/${route}"><link rel="stylesheet" href="../../../../assets/css/style.css?v=20261015-academy"></head><body>${renderSiteHeader('../../../../', 'de')}<main data-pagefind-body><section class="hero compact-hero"><p class="hero-kicker">WÖk-Akademie · Curriculum 4.0</p><h1>${esc(title)}</h1><p>Natalie Weber · Institut für Wirkungsökonomie</p><p>Begriffsgrundlage: <a href="../../../../bibliothek/woek-begriffsleitfaden-fuehrend/">Leitfaden v1.8</a></p><div class="hero-actions"><a class="btn btn-secondary" href="../">Alle Vorlesungsskripte</a>${isCorrected ? `<a class="btn btn-primary" href="${release}/${pdfName}">Skript als PDF</a>` : ''}</div></section><section class="section"><nav class="toc-card" aria-label="Inhaltsverzeichnis"><h2>Inhaltsverzeichnis</h2>${toc.map(t => `<p><a href="#${t.id}">${esc(t.text)}</a></p>`).join('')}</nav></section><article class="section narrow">${html}</article></main><script src="../../../../assets/js/main.js" defer></script></body></html>\n`;
  fs.mkdirSync(path.join(root, route), {recursive:true}); fs.writeFileSync(path.join(root, route, 'index.html'), page);
  rows.push({lecture_id:item.lecture_id, code:item.display_code, offering_id:item.offering_id, title, route, source:sourcePath, source_sha256:item.public_sha256, corrected:isCorrected, ...(isCorrected ? {pdf:pdfName,pdf_url:`${release}/${pdfName}`} : {})});
}
const groups = new Map();for(const row of rows){const list=groups.get(row.offering_id)??[];list.push(row);groups.set(row.offering_id,list);}
const directory = `<section class="section"><h2>Vorlesungsskripte · Curriculum 4.0</h2><p>120 Vorlesungen des Grundstudiums und 58 Lektionen der Weiterbildungen.</p><h3>Aktualisierte PDF-Ausgaben</h3><ul>${rows.filter(row=>row.corrected).map(row=>`<li><a href="${row.pdf_url}">${esc(row.title)} (PDF)</a></li>`).join('')}</ul>${[...groups].map(([id,group])=>`<h3>${id==='WOEK-G'?'Grundstudium':esc(offeringTitles.get(id) ?? id)}</h3><ul>${group.map(row=>`<li><a href="${row.lecture_id.toLowerCase()}/">${esc(row.title)}</a></li>`).join('')}</ul>`).join('')}</section>`;
fs.mkdirSync('bibliothek/studienskripte/v4',{recursive:true});
fs.writeFileSync('bibliothek/studienskripte/v4/index.html',`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Vorlesungsskripte | WÖk-Akademie</title><meta name="description" content="Vorlesungsskripte zu Wirtschaft, Gesellschaft, Medien, Demokratie und staatlicher Folgenprüfung."><meta name="author" content="Natalie Weber"><link rel="stylesheet" href="../../../assets/css/style.css?v=20261015-academy"></head><body>${renderSiteHeader('../../../','de')}<main data-pagefind-body><section class="hero compact-hero"><h1>Vorlesungsskripte der Wirkungsökonomie</h1></section>${directory}</main><script src="../../../assets/js/main.js" defer></script></body></html>\n`);
const index = 'bibliothek/studienskripte/index.html';
if(fs.existsSync(index)){
 let html=fs.readFileSync(index,'utf8');
 html=html.replace(/<section data-current-v4-scripts[\s\S]*?<\/section>/,'');
 html=html.replace('<main data-pagefind-body>',`<main data-pagefind-body><section data-current-v4-scripts class="section"><h2>Curriculum 4.0</h2><p>Hier findest du die aktuellen Vorlesungsskripte des Grundstudiums und der Weiterbildungen.</p><a class="btn btn-primary" href="v4/">Vorlesungsskripte öffnen</a></section>`);
 fs.writeFileSync(index,html);
}
fs.writeFileSync('content/academy/v4-reader-publication.json',JSON.stringify({date:'2026-10-15',release_tag:'woek-academy-script-corrections-2026-10-15',scope:'Canonical public script projections; app activation and assessments remain separate.',count:rows.length,readers:rows},null,2)+'\n');
console.log(`Canonical v4 readers generated: ${rows.length}; corrected PDF editions: ${rows.filter(r=>r.corrected).length}`);
