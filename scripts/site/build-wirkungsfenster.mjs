import fs from 'node:fs';
import {writeContentPage} from '../lib/content-page.mjs';
import {ExampleCards, ComparisonTable, FeedbackLoop, escapeHtml as esc} from '../lib/explainer-components.mjs';
import {windowContent as data, renderWindowNote} from '../lib/wirkungsfenster.mjs';

const term = JSON.parse(fs.readFileSync('content/glossary/imports/begriffsleitfaden-v1.8.json', 'utf8')).terms[0];
const canonical = 'https://wirkungsoekonomie.de/verstehen/wirkungsfenster/';
const schema = {'@context':'https://schema.org', '@type':['Article','LearningResource'], headline:data.title, description:data.description, dateModified:data.date, inLanguage:'de-DE', url:canonical, about:{'@type':'DefinedTerm',name:term.canonicalLabel,description:term.shortDefinition,url:'https://wirkungsoekonomie.de/begriffe/wirkungsfenster/'}};
const body = `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>
<section class="hero compact-hero explanation-hero" data-no-glossary>
<nav class="breadcrumb" aria-label="Brotkrumennavigation"><a href="/verstehen/">Verstehen</a><span aria-hidden="true">/</span><span>Wirkungsfenster</span></nav>
<p class="hero-kicker">Ein Beispiel aus dem Alltag</p><h1>${esc(data.title)}</h1><p class="hero-subtitle">${esc(data.intro)}</p>
<div class="hero-actions"><a class="btn btn-primary" href="#erklaerung">Den Zusammenhang verstehen</a><a class="btn btn-secondary" href="#anwendung">Fachliche Anwendung</a></div></section>
<section class="section" id="erklaerung"><h2>Wie eine Maßnahme ausreichend hilft und Grenzen einhält</h2><p>Es geht um die passende Gestaltung unter konkreten Bedingungen: Was soll die Maßnahme beitragen, welche Grenzen gelten und wie wird die Annahme überprüft? Für diesen Zusammenhang verwendet die WÖk den Begriff <strong>Wirkungsfenster</strong>.</p>
${ExampleCards(data.requirements)}<p>Schema gemeinsamer Anforderungen, keine gemessene Dosiskurve: Der Zielbeitrag wird begründet, die Schutzgrenzen werden eingehalten, und die Bedingungen werden offengelegt. Daraus entsteht eine Hypothese, die durch Beobachtung geprüft werden muss.</p></section>
<section class="section section-soft" id="definition" data-no-glossary><h2>Was Wirkungsfenster bedeutet</h2><blockquote><p>${esc(term.shortDefinition)}</p></blockquote><p>${esc(term.longDefinition)}</p><p>${esc(term.woekRelation)}</p><p><a href="/begriffe/wirkungsfenster/">Begriffsdefinition, Abgrenzungen und Quellen</a></p></section>
<section class="section"><h2>Eine Annahme mit klaren Grenzen</h2><p>Ein Wirkungsfenster ist kein Wirkungsnachweis, Optimalpunkt oder automatischer Entscheid. Es kann mehrere verknüpfte Bedingungen umfassen, unbekannt oder leer sein. Nicht für jede Maßnahme lässt sich ein geeigneter Bereich begründen; auch eine schädliche „Überdosis“ wird nicht allgemein unterstellt.</p><p>Unterlassen und Alternativen sind ebenfalls zu prüfen. Wer Stabilisierung oder vermiedene Verschlechterung als Beitrag anführt, braucht ein <a href="/begriffe/counterfactual/">Gegenfaktum</a>: Was wäre ohne die Maßnahme voraussichtlich geschehen?</p><p>Schutzgrenzen dürfen nicht verschoben werden, um ein scheinbar größeres Fenster zu erzeugen. <a href="/begriffe/nichtkompensationsprinzip/">Nichtkompensation</a> schützt vor der Verrechnung schwerer Schäden zwischen Gruppen, Feldern, Orten und Zeiten. <a href="/begriffe/reverse-merit-order/">Reverse Merit Order</a> bleibt die zugehörige Bewertungslogik. Die Entscheidung braucht weiterhin Zuständigkeit, Recht, fachliche und wirtschaftliche Prüfung sowie Legitimation.</p></section>
<section class="section section-soft" id="architektur"><h2>In der bestehenden Architektur arbeiten</h2>${ComparisonTable(data.architecture)}<p>Die sechs Module und die vorhandenen Fragen des <a href="/so-wirkt-wirkungsoekonomie/">Wirkungsrads</a> bleiben erhalten. Zielbeitrag, Schutzgrenzen, Evidenz und Entscheidung sind unterschiedliche Aufgaben.</p>${FeedbackLoop(data.feedback)}</section>
<section class="section" id="anwendung"><h2>Fachliche Anwendung: innerhalb vorhandener Arbeitsflächen</h2><p>Der Prüfvermerk wird dort geführt, wo der konkrete Fall bereits bearbeitet wird. Er schafft kein neues Register und keine globalen Zusatzpflichtfelder. Seine Tiefe richtet sich nach der materiellen Wirkungsrelevanz. Zahlenbereiche werden nur mit tragfähiger Grundlage angegeben. Fehlende Angaben bleiben offen, nicht null oder neutral.</p>
${ComparisonTable({caption:'Was der fallbezogene Prüfvermerk zusammenführt',columns:['Zusammenhang','Dokumentation'],rows:data.documentation})}
<h3>Gegenstand und Steuerungsinstrument getrennt prüfen</h3><p>Die Folgen eines Produkts und die Folgen einer darauf gerichteten Steuer, Förderung oder Beschaffungsregel sind zwei Prüfgegenstände. Für das Instrument braucht es einen eigenen Wirkpfad, Verteilungs- und Schutzprüfung sowie Rückkopplung. Eine problematische Instrumentenfolge ändert nicht automatisch die ursprüngliche Produktbewertung.</p>
<div class="card-grid three">${data.methods.map(m=>`<article class="card"><p class="card-kicker">${esc(m.id)} · vorhandene WÖMS-Methode</p><h3 class="card-title">${esc(m.title)}</h3><p>${esc(m.text)}</p><a href="/methodenraum/methoden/${m.id.toLowerCase()}/">Methode und Arbeitsfläche öffnen</a></article>`).join('')}</div>
<p>Dazu passen <a href="/methodenraum/methoden/a05/">A05 für Rechte und Schutzgrenzen</a>, <a href="/methodenraum/methoden/c07/">C07 für Nebenwirkungen, Wechselwirkungen und Rebound</a> sowie <a href="/methodenraum/methoden/f14/">F14 für Skalierung und Exit</a>. Es entsteht keine zusätzliche Methode.</p><p>Bei staatlichen Gegenständen bleibt die <a href="/methodik/#staatliche-nachhaltigkeitsarchitektur">objektspezifische Prüfarchitektur</a> maßgeblich. Die Präzisierung ersetzt keine bestehenden staatlichen Folgen-, Alternativen- oder Erfolgskontrollen.</p></section>
<section class="section section-soft" id="analogie" data-no-glossary><h2>Woher die medizinische Analogie kommt</h2><p>Die FDA beschreibt das therapeutische Fenster als Dosisbereich wirksamer Behandlung unter Vermeidung schwerer Nebenwirkungen. Das bedeutet keine Nebenwirkungsfreiheit. Diese medizinische Bedeutung bleibt eigenständig; sie ist kein Synonym für das WÖk-Wirkungsfenster.</p><p><a href="/begriffe/wirkstoff/">Wirkstoff</a> bleibt in der WÖk eine didaktische Analogie. Gesellschaftliche Systeme sind keine Patienten. Die medizinische Quelle validiert weder gesellschaftliche Dosiskurven noch das Wirkungsfenster als Universalstandard.</p><p>Medizinische Originalquelle: <a href="https://www.fda.gov/drugs/cder-conversations/setting-and-implementing-standards-narrow-therapeutic-index-drugs">FDA: Setting and Implementing Standards for Narrow Therapeutic Index Drugs</a> (geprüft am 30. September 2026).</p></section>
<section class="section"><h2>Vertiefen und weiterarbeiten</h2><p><a href="/werkzeuge/impact-controlling/#wirkungsfenster">Das vorhandene Küchenbeispiel im Impact Controlling</a> · <a href="/methodenraum/gesamtbild/#wirkungsfenster">Die bestehenden Entscheidungstore</a> · <a href="/bibliothek/woek-begriffsleitfaden-fuehrend/">Begriffsleitfaden v1.8</a> · <a href="/referenz/aktualisierung/#wirkungsfenster">Versionsdelta vom 30. September 2026</a></p></section>`;
writeContentPage({file:'verstehen/wirkungsfenster/index.html',title:data.title,description:data.description,section:'Verstehen',type:'Methodenerklärung',body});

// The existing sitemap normalizer removes stale routes but does not discover
// arbitrary new explanation pages. Register this canonical route at its source.
const sitemapFile = 'sitemap.xml';
const sitemap = fs.readFileSync(sitemapFile, 'utf8');
if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
  if (!sitemap.includes('</urlset>')) throw new Error('Missing sitemap urlset');
  fs.writeFileSync(sitemapFile, sitemap.replace('</urlset>', `  <url><loc>${canonical}</loc><lastmod>${data.date}</lastmod></url>\n</urlset>`));
}

// These entry pages are maintained as static HTML. Keep their additions in
// this content-backed, idempotent build step, just like existing site updates.
function insert(file, key, html, anchor) {
  const start = `<!-- wirkungsfenster-${key}:start -->`, end = `<!-- wirkungsfenster-${key}:end -->`;
  let page = fs.readFileSync(file, 'utf8');
  page = page.replace(new RegExp(`${start}[\\s\\S]*?${end}\\s*`, 'g'), '');
  if (!page.includes(anchor)) throw new Error(`Missing Wirkungsfenster anchor in ${file}`);
  page = page.replace(anchor, `${start}${html}${end}\n${anchor}`);
  fs.writeFileSync(file, page);
}
for (const [file,key] of [['modell.html','modell'],['workflow.html','workflow']]) insert(file,key,renderWindowNote(key),'</main>');
// The kitchen source also underpins a dated learning PDF. Its newer web
// section has a separate source; Methodik handles its addendum in its own builder.
insert('werkzeuge/impact-controlling/index.html','kueche',renderWindowNote('kueche'),'<section class="section"><h2>Mit dem Beispiel selbst rechnen</h2>');
insert('verstehen/index.html','karte','<article class="card"><p class="card-kicker">Gestaltung und Lernen</p><h3 class="card-title">Weniger Essen wegwerfen, ausreichend versorgen.</h3><p class="card-text">Wie Zielbeitrag, Bedingungen und Schutzgrenzen zusammenpassen: Wirkungsfenster am fiktiven Küchenbeispiel verstehen.</p><a class="text-link" href="/verstehen/wirkungsfenster/">Wirkungsfenster kennenlernen</a></article>','<article class="card">\n            <p class="card-kicker">Zielgröße</p>');
console.log('Wirkungsfenster: Erklärung und bestehende statische Einstiegspunkte erzeugt.');
