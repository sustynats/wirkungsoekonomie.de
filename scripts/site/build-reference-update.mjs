import fs from 'node:fs';
import path from 'node:path';
import {writeContentPage} from '../lib/content-page.mjs';
import {escapeHtml as esc} from '../lib/explainer-components.mjs';
import {currentPdfEditions, editionLink} from '../lib/publication-editions.mjs';
import {renderPublicationErratum, renderPublicationErratumDownload, applyPublicationErratumNotices} from '../lib/publication-erratum.mjs';

const data = JSON.parse(fs.readFileSync('content/site/reference-update.json', 'utf8'));
const chapters = fs.readdirSync('referenz').filter(name => /^kapitel-\d{3}-/.test(name));
const chapterLink = number => chapters.find(name => name.startsWith(`kapitel-${String(number).padStart(3,'0')}-`));
let body = `<section class="hero compact-hero explanation-hero"><nav class="breadcrumb" aria-label="Brotkrumennavigation"><a href="/bibliothek/">Bibliothek</a><span aria-hidden="true">/</span><a href="/referenz/">Buch online</a><span aria-hidden="true">/</span><span>Aktualisierung</span></nav><p class="hero-kicker">Lesestand · <time datetime="${data.reviewedAt}">5. September 2026</time></p><h1>${esc(data.title)}</h1><p class="hero-subtitle">Das Buch erklärt das Gesamtsystem. Neuere Fachgrundlagen präzisieren einzelne Begriffe, Prüfregeln und Berechnungen. Diese Seite zeigt, wie beides zusammen gelesen wird.</p></section>
<section class="section"><h2>Die passende Quelle hängt von der Frage ab</h2><p>Eine höhere Versionsnummer macht ein Papier nicht automatisch zur maßgeblichen Quelle: Verschiedene Publikationsreihen zählen unabhängig voneinander. Entscheidend sind Fachgebiet, Datum, ausgewiesener Status und dokumentierte Ablösung.</p><div class="card-grid three">${data.references.map(item => `<article class="card"><p class="card-kicker">${esc(item.status)}</p><h3 class="card-title">${esc(item.title)}</h3><p>${esc(item.text)}</p><a class="text-link" href="${esc(item.href)}">Fachgrundlage öffnen</a></article>`).join('')}</div></section>
<section class="section section-soft"><h2>Präzisierungen zum Buch</h2><p>Die folgenden Einordnungen sind Ergänzungen vom 5. September 2026. Sie ersetzen keine historische Passage stillschweigend. Auf den betroffenen Kapitelseiten steht ein datierter Hinweis mit Link zu dieser Übersicht.</p>${data.chapterUpdates.map((update,i) => `<article class="card" id="praezisierung-${i+1}"><h3 class="card-title">${esc(update.title)}</h3><p>${esc(update.text)}</p><p>Betroffene Kapitel: ${update.chapters.map(number => {const slug=chapterLink(number); if(!slug) throw new Error('Missing book chapter '+number); return `<a href="/referenz/${slug}/">${number}</a>`;}).join(', ')}. <a href="${esc(update.source)}">Aktuelle Einordnung lesen</a>.</p></article>`).join('')}</section>
<section class="section" id="fachpapiere"><h2>Wie mit älteren Papieren umzugehen ist</h2><p>Historische Originaldateien behalten ihren Publikationsstand. Frühere T-SROI-Whitepaper mit freien Transformationsfaktoren werden für neue Rechnungen durch v1.1 abgelöst; vorhandene Errata sind mitzulesen. Ältere Register beschreiben den damaligen Aufbau, während aktuelle Prüfungen die Fassung v1.5 verwenden.</p><p>Eine Aussage in einem älteren Papier wird nicht dadurch aktuell, dass dieselbe Datei an mehreren Stellen heruntergeladen werden kann. Bibliotheksseite, Lesefassung und Download gehören als Zugänge zu derselben Veröffentlichung zusammen. Fachliche Korrekturen brauchen einen sichtbaren Standhinweis, ein Erratum oder eine neue Fassung.</p><p>Die Präzisierungen zu staatlichen Verfahren gelten bei der heutigen Anwendung auch für WÖk-Papiere zu Politik, Wirkungshaushalt, Nachhaltigkeit und Unternehmenssteuerung. Ob ein konkreter staatlicher Mechanismus bereits greift, wird anhand von Gegenstand, Zuständigkeit und Quellen geprüft. Eine fehlende öffentlich zugängliche eNAP-Datei beweist keine unterlassene Prüfung.</p></section>
<section class="section section-soft"><h2>Was dieser Abgleich abdeckt</h2><p>Dieser Abgleich behandelt die genannten fachlichen Entwicklungslinien und ihre Referenzstände. Er ist keine vollständige Neuauflage, kein Peer Review jedes Kapitels und keine Validierung aller Modellannahmen oder Registerschwellen. Offene empirische Fragen bleiben offen. Für eine neue gedruckte Auflage sind die markierten Themen in den jeweiligen Text einzubauen und erneut fachlich zu prüfen.</p><p><a href="/methodik/">Den gemeinsamen Prüfweg verstehen</a> · <a href="/referenz/">Zum Buch</a> · <a href="/bibliothek/">Zur Bibliothek</a></p></section>`;
const pdfSection = `<section class="section section-soft" id="aktualisierte-pdfs"><h2>Aktualisierte PDFs herunterladen</h2><p>Die neuen Lesefassungen enthalten die datierte fachliche Ergänzung. Gedruckte Seitenzahlen und zitierte Ausgangstexte bleiben nachvollziehbar; die Ergänzung erhält eigene Seitenlabels.</p><div class="card-grid three">${currentPdfEditions().map(item => `<article class="card"><h3 class="card-title">${esc(item.title)}</h3><p data-publication-abstract>${item.kind === 'reading-edition' ? `Ausgangswerk mit ${item.updatePages} vorgeschalteten Seiten zur fachlichen Aktualisierung. Die ursprünglichen ${item.originalPages} Seiten bleiben erhalten.` : item.kind === 'addendum' ? 'Eigenständige Erläuterung der fachlichen Änderungen und maßgeblichen Referenzen.' : 'Überarbeitete Erläuterung mit Beispielen, Prüfweg, Quellen und Grenzen.'}</p><p>${editionLink(item.filename,'PDF öffnen')}</p></article>`).join('')}</div></section>`;
body = body.replace('<section class="section"><h2>Die passende Quelle', pdfSection.replace('</div></section>',renderPublicationErratumDownload()+'</div></section>')+'<section class="section"><h2>Die passende Quelle');
body = body.replace('<section class="section section-soft"><h2>Was dieser Abgleich', renderPublicationErratum()+'<section class="section section-soft"><h2>Was dieser Abgleich');
writeContentPage({file:'referenz/aktualisierung/index.html', title:data.title, description:data.description, section:'Referenz', type:'Addendum', body});

const marker = 'publication-current-note-20260905';
function updateNotice(file, text, target = '/referenz/aktualisierung/') {
  if (!fs.existsSync(file)) throw new Error(`Missing publication surface ${file}`);
  let html = fs.readFileSync(file,'utf8').replace(new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->\\s*`, 'g'), '');
  const note = `<!-- ${marker}:start --><aside class="publication-current-note" data-search-exclude><p><strong>Fachliche Ergänzung vom 5. September 2026.</strong> ${esc(text)} <a href="${target}">Stand und Begründung nachlesen</a>.</p></aside><!-- ${marker}:end -->`;
  // After the first complete hero, otherwise at the start of main. Never inside
  // a heading or a historical paragraph with a persistent citation anchor.
  const start = html.search(/<main\b/);
  if (start < 0) throw new Error(`Missing main ${file}`);
  const mainEnd = html.indexOf('>',start)+1;
  const hero = html.slice(mainEnd).match(/^\s*<section\b[^>]*class="[^"]*\bhero\b[^"]*"[^>]*>[\s\S]*?<\/section>/);
  const at = hero ? mainEnd+hero[0].length : mainEnd;
  html = html.slice(0,at)+'\n'+note+'\n'+html.slice(at);
  fs.writeFileSync(file,html);
}
for (const file of ['buch.html','referenz/index.html','referenz/volltext/index.html']) updateNotice(file, 'Für Begriffe, Register und Berechnungen sind spätere Fachreferenzen mitzulesen. Historische Publikationen behalten ihren ursprünglichen Stand.');
for (const [index,update] of data.chapterUpdates.entries()) for (const number of update.chapters) updateNotice(path.join('referenz',chapterLink(number),'index.html'), update.text, `/referenz/aktualisierung/#praezisierung-${index+1}`);
const sitemap = 'sitemap.xml';
const url = 'https://wirkungsoekonomie.de/referenz/aktualisierung/';
let xml=fs.readFileSync(sitemap,'utf8');
if(!xml.includes(`<loc>${url}</loc>`)) fs.writeFileSync(sitemap,xml.replace('</urlset>',`  <url><loc>${url}</loc><lastmod>${data.reviewedAt}</lastmod></url>\n</urlset>`));
console.log(`Reference update: ${data.chapterUpdates.reduce((n,update)=>n+update.chapters.length,0)} chapter notices; historic PDFs unchanged.`);

// Current entry points use the dated reading edition. Historical source routes
// and citations keep their original files and explicitly labeled archive links.
const releaseAssets=JSON.parse(fs.readFileSync('assets/data/public-release-assets.json','utf8')).assets || {};
const currentSurfaces = new Map([
  ['assets/pdf/die-neue-ordnung-des-wohlstands.pdf',['buch.html','referenz/index.html']],
  ['assets/downloads/grundlagen/woemm-2.0-referenzfassung.pdf',['bibliothek/eintraege/woemm-2-0/index.html','bibliothek/eintraege/woemm-2-0/lesen/index.html']],
  ['assets/downloads/grundlagen/woems-2.0-referenzfassung.pdf',['bibliothek/eintraege/woems-2-0/index.html','bibliothek/eintraege/woems-2-0/lesen/index.html']],
]);
for (const edition of currentPdfEditions().filter(item=>currentSurfaces.has(item.source))) {
  for (const file of currentSurfaces.get(edition.source)) {
    if (!fs.existsSync(file)) throw new Error('Missing current publication entry '+file);
    let html=fs.readFileSync(file,'utf8');
    html=html.replace(/href="([^"]+)"/g,(match,url)=>{
      if (url===releaseAssets[edition.source] || url.replace(/^(?:\.\.\/)+/,'').replace(/^\//,'')===edition.source) return `href="${edition.url}"`;
      return match;
    });
    const archiveUrl=releaseAssets[edition.source] || '/'+edition.source;
    const archiveMarker='publication-original-access-20260905';
    html=html.replace(new RegExp(`<!-- ${archiveMarker}:start -->[\\s\\S]*?<!-- ${archiveMarker}:end -->`, 'g'),'');
    html=html.replace('</main>',`<!-- ${archiveMarker}:start --><section class="section"><h2>PDF-Lesefassungen</h2><p>${editionLink(edition.filename,'Aktualisierte Lesefassung vom 5. September 2026')}</p><p>Für bestehende Zitate bleibt auch die Fassung ohne die Ergänzung vom 5. September 2026 zugänglich.</p><p><a href="${esc(archiveUrl)}">PDF der historischen Ausgangsfassung öffnen</a></p></section><!-- ${archiveMarker}:end --></main>`);
    fs.writeFileSync(file,html);
    if(!file.startsWith('referenz/') && file!=='buch.html') updateNotice(file,'Die PDF-Lesefassung enthält jetzt die datierte fachliche Aktualisierung. Der zugrundeliegende Werktext behält seinen Publikationsstand.');
  }
}
applyPublicationErratumNotices();
