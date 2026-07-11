#!/usr/bin/env node
/**
 * Generiert die Methodenraum-Seiten aus der kanonischen WÖMS-Registry (Codex-Lane):
 *   content/methods/woems-methoden.json   (152 Methoden, volle Felder)
 *   content/methods/woems-canvas.json      (Canvas mit Feldern + 5 Pflichtfeldern)
 *
 * Ausgabe (statisch, geht über build-public-artifact.mjs live):
 *   methodenraum/methoden/index.html                 – WÖMS-Hub, 152 nach Kategorie
 *   methodenraum/methoden/<id>/index.html            – 152 Methodenseiten (Canvas leer)
 *   methodenraum/gesamtbild/index.html               – WÖMM „Das Gesamtbild"
 *   methodenraum/canvas/index.html                   – Canvas-Prinzip + Übersicht
 *   methodenraum/journeys/index.html                 – 20 Workshop-Journeys
 *
 * Design: nutzt vorhandene Seiten-CSS-Klassen (.hero/.card/.card-grid/.section/.btn …),
 * damit die Seiten automatisch im Hausstil erscheinen. Header wird von
 * scripts/site/normalize-site-header.mjs synchron gehalten.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'));
const M = read('content/methods/woems-methoden.json');
const C = read('content/methods/woems-canvas.json');

const methods = M.methods;
const kategorien = M.kategorien;
const byId = Object.fromEntries(methods.map((m) => [m.id, m]));
const canvasById = Object.fromEntries(C.canvases.map((c) => [c.id, c]));
const slug = (id) => id.toLowerCase();

// --- HTML-Helfer -----------------------------------------------------------
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const li = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join('');
const oli = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join('');

// Header exakt wie methodenraum.html (relativer Präfix pro Tiefe)
function header(base) {
  const u = (h) => `${base}${h}`;
  return `    <header class="site-header" data-search-exclude>
      <a class="brand" href="${u('index.html')}" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${u('assets/img/brand/signet.svg')}" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-utility-nav" aria-label="Schnellzugriffe" data-search-exclude>
        <a class="site-utility-link site-utility-link--suche" href="${u('suche.html')}" data-nav-match="suche.html" data-utility-label="Suche">Suche</a>
        <a class="site-utility-link site-utility-link--woek-ki" href="${u('woek-ki/')}" data-nav-match="woek-ki/" data-utility-label="WÖk-KI">KI</a>
        <a class="site-utility-link site-utility-link--wok-app" href="${u('app/')}" data-nav-match="app/" data-utility-label="WÖk-App">WÖk-App</a>
        <a class="site-utility-link site-utility-link--mein-wirkungsraum" href="${u('mein-wirkungsraum/')}" data-nav-match="mein-wirkungsraum/" data-utility-label="Mein Wirkungsraum" data-utility-primary="true">Mein Wirkungsraum</a>
        <a class="site-utility-link site-utility-link--language" href="${u('en/')}" hreflang="en" lang="en" data-lang-switch="en" data-utility-label="English">EN</a>
      </nav>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude>
        <a href="${u('index.html')}" data-nav-match="index.html">Start</a>
        <a href="${u('verstehen/')}" data-nav-match="verstehen/|verstehen.html|wirkungsoekonomie.html|wirkungsoekonomie/|modell.html|ordnung/|so-wirkt-wirkungsoekonomie/|methodenraum.html|methodenraum/">Verstehen</a>
        <a href="${u('fuer/')}" data-nav-match="fuer/|fuer-wen/">Für wen?</a>
        <a href="${u('wirkungsfelder/')}" data-nav-match="wirkungsfelder/|anwendungen.html">Wirkungsfelder</a>
        <a href="${u('wirkungssteuerung/')}" data-nav-match="wirkungssteuerung/">Wirkungssteuerung</a>
        <a href="${u('oeffentlicher-wirkungsraum/')}" data-nav-match="oeffentlicher-wirkungsraum/|wirkungsradar/|woek-ki/|app/">Öffentlicher Wirkungsraum</a>
        <a href="${u('werkzeuge/')}" data-nav-match="werkzeuge/|tools/|methodik/">Praxis &amp; Tools</a>
        <a href="${u('lernen/')}" data-nav-match="lernen/|akademie.html|akademie/">Lernen</a>
        <a href="${u('bibliothek/')}" data-nav-match="bibliothek/|downloads.html|downloads/|fachbibliothek/|blog.html|blog/">Bibliothek</a>
        <a href="${u('mitmachen.html')}" data-nav-match="mitmachen.html|mitmachen/">Mitmachen</a>
      </nav>
    </header>`;
}

function page({ base, title, desc, section = 'Verstehen', type = 'Übersicht', body }) {
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <meta name="search_title" content="${esc(title.split(' | ')[0])}">
    <meta name="search_description" content="${esc(desc)}">
    <meta name="search_section" content="${esc(section)}">
    <meta name="search_type" content="${esc(type)}">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
${header(base)}
    <main data-pagefind-body>
${body}
    </main>
    <script src="${base}assets/js/main.js"></script>
  </body>
</html>
`;
}

const write = (rel, html) => {
  const abs = resolve(ROOT, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, html);
};

// Kurz-Intro je Kategorie (Armin-Maiwald: einfach erklärt, worum es geht)
const KAT_INTRO = {
  A: 'Bevor irgendetwas gemessen oder gebaut wird: Wofür haben wir überhaupt ein Mandat, und wo verlaufen die roten Linien für Mensch, Planet und Demokratie?',
  B: 'Erst verstehen, dann steuern. Wie hängt das System zusammen, welche Rückkopplungen und Hebel gibt es, und wo entstehen Wirkungen wirklich?',
  C: 'Vom Zusammenhang zum Modell: Wir bilden ab, wie aus Handeln Zustandsveränderungen werden — mit Zukunftslogik statt Wunschdenken.',
  D: 'Was zählt, muss auch ehrlich gemessen werden. Indikatoren, Bewertung und Evidenz — inklusive Unsicherheit und Gegenprobe.',
  E: 'Aus Wirkung wird Richtung: Strategie, Portfolio und Governance sorgen dafür, dass Entscheidungen der Wirkung folgen und nicht umgekehrt.',
  F: 'Angebote, Geschäfts- und Finanzierungsmodelle als Wirkungssysteme denken — tragfähig, mit klaren Grenzen und eingebautem Lernen.',
  G: 'Menschen machen Wirkung. Organisation, Führung und Kultur so gestalten, dass das Richtige leicht und das Schädliche schwer wird.',
  H: 'Umsetzen, beobachten, lernen — und prüfbar bleiben. Der Kreis schließt sich mit Monitoring, Lernen und Assurance.',
  I: 'Nach vorn schauen: Szenarien, Frühwarnung und Entscheidungsintelligenz für eine Welt voller Unsicherheit.',
  J: 'Die Bauzeichnung der Organisation: Fähigkeiten und Zielarchitektur, damit Strategie tragende Strukturen bekommt.',
  K: 'Wie fließt die Arbeit? Wertströme, Prozesse und Services so gestalten, dass Wirkung ohne Reibung entsteht.',
  L: 'Produkte dauerhaft betreiben: Teams, Plattformen und Ökosysteme statt Projekt-Strohfeuer.',
  M: 'Veränderung, die ankommt: Adoption, Workforce, Skills und Wissen — damit Neues wirklich gelebt wird.',
  N: 'Vieles gleichzeitig steuern: Portfolio, Programme und Delivery, konsequent auf realisierte Wirkung ausgerichtet.',
  O: 'Daten, Technologie und KI verantwortungsvoll nutzen — inklusive agentischer Systeme, mit Schutzregeln first.',
  P: 'Vertrauen durch Nachweis: Qualität, operative Resilienz, Kontrollen und integrierte Assurance.',
};

const PFLICHT = ['Evidenzstatus', 'Unsicherheit', 'negative Wirkung', 'Wirkungsgrenzen', 'offene Fragen'];

// --- 1) Methodenseiten (152) ----------------------------------------------
function methodPage(m) {
  const base = '../../../';
  const kat = kategorien.find((k) => k.id === m.kategorie);
  const inCat = methods.filter((x) => x.kategorie === m.kategorie);
  const idx = inCat.findIndex((x) => x.id === m.id);
  const prev = inCat[idx - 1], next = inCat[idx + 1];
  const canvas = canvasById[m.canvasRef];

  const linkChip = (id) => {
    const t = byId[id];
    return t
      ? `<a class="badge" href="${base}methodenraum/methoden/${slug(id)}/">${esc(id)} · ${esc(t.name)}</a>`
      : `<span class="badge">${esc(id)}</span>`;
  };

  const section = (kicker, h, inner) =>
    `      <section class="section">\n        <div class="card">\n          <p class="hero-kicker">${kicker}</p>\n          <h2>${h}</h2>\n${inner}\n        </div>\n      </section>`;

  const canvasFelder = canvas
    ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Feld</th><th>Leitfrage</th><th>Deine Notiz</th></tr></thead><tbody>${canvas.felder
        .map((f) => `<tr><td><strong>${esc(f.label)}</strong></td><td>${esc(f.leitfrage)}</td><td class="note">…</td></tr>`)
        .join('')}${PFLICHT.map(
        (p) => `<tr><td><strong>${esc(p)}</strong> <span class="badge">Pflicht</span></td><td>Immer auszufüllen — auch wenn unbequem.</td><td class="note">…</td></tr>`
      ).join('')}</tbody></table></div>`
    : '<p class="note">Canvas-Spezifikation folgt.</p>';

  const body = `      <section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}methodenraum.html">Methodenraum</a> / <a href="${base}methodenraum/methoden/">Methoden</a> / ${esc(m.id)}</nav>
            <p class="hero-kicker">WÖMS · Kategorie ${esc(m.kategorie)} · ${esc(kat?.name || '')}</p>
            <h1>${esc(m.id)} · ${esc(m.name)}</h1>
            <p class="hero-subtitle">${esc(m.zweck)}</p>
          </div>
          <aside class="card">
            <p class="card-kicker">Auf einen Blick</p>
            <dl class="portal-meta-grid compact">
              <div><dt>Kategorie</dt><dd>${esc(m.kategorie)}</dd></div>
              <div><dt>Schritte</dt><dd>${(m.schritte || []).length}</dd></div>
              <div><dt>Canvas</dt><dd>${canvas ? (canvas.felder.length + PFLICHT.length) + ' Felder' : '—'}</dd></div>
            </dl>
          </aside>
        </div>
      </section>
${m.inputs?.length ? section('Was du mitbringst', 'Inputs', `          <ul>${li(m.inputs)}</ul>`) : ''}
${m.schritte?.length ? section('So gehst du vor', 'Schritte', `          <ol>${oli(m.schritte)}</ol>`) : ''}
${m.outputs?.length ? section('Was herauskommt', 'Outputs', `          <ul>${li(m.outputs)}</ul>`) : ''}
${m.qualitaetsregeln?.length ? section('Woran du gute Arbeit erkennst', 'Qualitätsregeln', `          <ul>${li(m.qualitaetsregeln)}</ul>`) : ''}
${m.schutzregeln?.length ? section('Die roten Linien', 'Schutzregeln', `          <p class="lead">Diese Regeln stehen über allem. Eine verletzte Wirkungsgrenze lässt sich nicht durch positive Werte ausgleichen.</p>\n          <ul>${li(m.schutzregeln)}</ul>`) : ''}
      <section class="section">
        <div class="card">
          <p class="hero-kicker">Die Arbeitsfläche</p>
          <h2>Canvas${canvas ? ' — ' + esc(canvas.name) : ''}</h2>
          <p>Eine leere Vorlage mit klaren Leitfragen. Die fünf Pflichtfelder sind immer auszufüllen — sie halten Ehrlichkeit und Nichtkompensation im Blick.</p>
          ${canvasFelder}
          <p class="note">Ausgefülltes Beispiel folgt. <a href="${base}methodenraum/canvas/">Mehr zum Canvas-Prinzip</a>.</p>
        </div>
      </section>
      <section class="section">
        <div class="card-grid two">
          <article class="card"><p class="card-kicker">Baut auf</p>${(m.schnittstellen?.bautAuf?.length ? `<p>${m.schnittstellen.bautAuf.map(linkChip).join(' ')}</p>` : '<p class="note">—</p>')}</article>
          <article class="card"><p class="card-kicker">Führt zu</p>${(m.schnittstellen?.fuehrtZu?.length ? `<p>${m.schnittstellen.fuehrtZu.map(linkChip).join(' ')}</p>` : '<p class="note">—</p>')}</article>
        </div>
      </section>
      <section class="section">
        <div class="hero-actions no-print">
          ${prev ? `<a class="btn btn-secondary" href="${base}methodenraum/methoden/${slug(prev.id)}/">← ${esc(prev.id)}</a>` : ''}
          <a class="btn btn-secondary" href="${base}methodenraum/methoden/">Alle Methoden</a>
          ${next ? `<a class="btn btn-primary" href="${base}methodenraum/methoden/${slug(next.id)}/">${esc(next.id)} →</a>` : ''}
        </div>
      </section>`;

  return page({
    base,
    title: `${m.id} · ${m.name} | WÖMS-Methode | Wirkungsökonomie`,
    desc: m.zweck.slice(0, 155),
    type: 'Methode',
    body,
  });
}

let nMethod = 0;
for (const m of methods) {
  write(`methodenraum/methoden/${slug(m.id)}/index.html`, methodPage(m));
  nMethod++;
}

// --- 2) WÖMS-Hub: 152 nach Kategorie --------------------------------------
function hub() {
  const base = '../../';
  const catBlocks = kategorien
    .map((k) => {
      const list = methods.filter((m) => m.kategorie === k.id);
      const items = list
        .map(
          (m) =>
            `<li><a href="${base}methodenraum/methoden/${slug(m.id)}/"><strong>${esc(m.id)}</strong> · ${esc(m.name)}</a></li>`
        )
        .join('');
      return `      <section class="section" id="kat-${k.id}">
        <div class="section-header">
          <p class="hero-kicker">Kategorie ${esc(k.id)} · ${list.length} Methoden</p>
          <h2>${esc(k.name)}</h2>
          <p>${esc(KAT_INTRO[k.id] || '')}</p>
        </div>
        <ul class="link-list columns">${items}</ul>
      </section>`;
    })
    .join('\n');

  const catNav = kategorien
    .map((k) => `<a class="badge" href="#kat-${k.id}">${esc(k.id)}</a>`)
    .join(' ');

  const body = `      <section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}methodenraum.html">Methodenraum</a> / Methoden</nav>
            <p class="hero-kicker">WÖMS · Methodensystem</p>
            <h1>152 Methoden in 16 Kategorien</h1>
            <p class="hero-subtitle">Jede Methode zeigt konkret, <em>wie</em> man einen Schritt der Wirkungsökonomie ab Montag tut — mit Zweck, Schritten, Outputs, Qualitäts- und Schutzregeln und einem Canvas zum Ausfüllen.</p>
            <p>${catNav}</p>
          </div>
          <aside class="card">
            <p class="card-kicker">Abzweigungen</p>
            <ul class="link-list">
              <li><a href="${base}methodenraum/gesamtbild/">WÖMM · Das Gesamtbild</a></li>
              <li><a href="${base}methodenraum/canvas/">56 Canvas &amp; das Prinzip</a></li>
              <li><a href="${base}methodenraum/journeys/">20 Workshop-Journeys</a></li>
            </ul>
          </aside>
        </div>
      </section>
      <section class="section">
        <div class="card">
          <p class="hero-kicker">So liest du das System</p>
          <h2>A–H Grundlogik, I–P Realisierung</h2>
          <p>Die Kategorien <strong>A–H</strong> bilden die wirkungsökonomische Grundlogik von Mandat bis Lernen. <strong>I–P</strong> operationalisieren die Realisierung: von Vorausschau über Fähigkeiten, Prozesse und Produkte bis zu Daten, KI und Assurance. Über <em>Baut auf</em> und <em>Führt zu</em> hängt alles zusammen — nichts steht für sich.</p>
        </div>
      </section>
${catBlocks}`;

  write(
    'methodenraum/methoden/index.html',
    page({
      base,
      title: 'WÖMS · 152 Methoden | Methodensystem der Wirkungsökonomie',
      desc: 'Alle 152 Kernmethoden des Wirkungsökonomischen Methodensystems (WÖMS) in 16 Kategorien — mit Schritten, Schutzregeln und Canvas.',
      type: 'Übersicht',
      body,
    })
  );
}
hub();

// --- 3) WÖMM „Das Gesamtbild" ---------------------------------------------
function gesamtbild() {
  const base = '../../';
  const card = (kicker, h, p) =>
    `<article class="card"><p class="card-kicker">${kicker}</p><h3>${h}</h3><p>${p}</p></article>`;
  const body = `      <section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}methodenraum.html">Methodenraum</a> / Das Gesamtbild</nav>
            <p class="hero-kicker">WÖMM · Managementmodell</p>
            <h1>Das Gesamtbild</h1>
            <p class="hero-subtitle">Wie sich eine Organisation als <em>lernendes Wirkungssystem</em> führen lässt: der normative Kompass, die Räume und Felder des Managements, und die Architektur, die aus Absicht echte Wirkung macht.</p>
            <div class="hero-actions no-print"><a class="btn btn-primary" href="${base}assets/downloads/woemm-woems-praesentation-2.0.pdf">Referenzpräsentation (PDF)</a><a class="btn btn-secondary" href="${base}methodenraum/methoden/">Zum Methodensystem</a></div>
          </div>
          <aside class="card"><p class="card-kicker">Der Kern in einem Satz</p><p class="lead">Ein Modell zeigt, <em>worauf</em> es ankommt — die Methoden zeigen, <em>wie</em> man es tut. Das WÖMM ist das Worauf.</p></aside>
        </div>
      </section>
      <section class="section"><div class="card">
        <p class="hero-kicker">Warum überhaupt ein neues Modell</p>
        <h2>Weil die alten Werkzeuge die falsche Tabelle führen</h2>
        <p>Klassische Managementmodelle optimieren, was sich leicht zählen lässt: Umsatz, Kosten, Auslastung. Wirkung auf Mensch, Planet und Demokratie taucht darin bestenfalls als Bericht am Jahresende auf — wie ein Fairplay-Preis nach dem Spiel. Das WÖMM verändert die Tabelle selbst: Zustandsveränderungen werden zum obersten Maßstab, an dem Strategie, Angebote und Betrieb ausgerichtet werden.</p>
      </div></section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Der Kompass</p><h2>Wirkungskompass: Mensch · Planet · Demokratie</h2><p>Drei Wirkungsdimensionen geben die Richtung vor. Sie werden nicht gegeneinander verrechnet — eine verletzte Grenze in einer Dimension lässt sich nicht durch Erfolge in einer anderen ausgleichen (Nichtkompensation).</p></div>
        <div class="card-grid three">
          ${card('Dimension', 'Mensch', 'Gesundheit, Teilhabe, Würde, Sicherheit — spürt der Mensch eine echte Verbesserung?')}
          ${card('Dimension', 'Planet', 'Klima, Ressourcen, Biodiversität — bleibt der ökologische Boden tragfähig?')}
          ${card('Dimension', 'Demokratie', 'Vertrauen, Fairness, Institutionen — wird das Gemeinwesen gestärkt statt ausgehöhlt?')}
        </div>
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Die Landkarte</p><h2>Sieben Wirkungsräume &amp; zwölf Managementfelder</h2><p>Die Wirkungsräume sagen, <em>wo</em> Organisationen wirken; die zwölf Managementfelder in vier Clustern sagen, <em>was</em> dort gesteuert wird — von Orientierung und Strategie über Angebote und Organisation bis zu Umsetzung, Daten und Assurance.</p></div>
        <div class="card-grid two">
          ${card('Cluster', 'Ausrichten', 'Mandat, Systemdiagnose, Wirkungsmodell, Messung — verstehen und Richtung geben.')}
          ${card('Cluster', 'Gestalten', 'Strategie & Portfolio, Angebote & Geschäftsmodelle — das Richtige entwerfen.')}
          ${card('Cluster', 'Realisieren', 'Organisation, Prozesse, Produkte, Change — es tatsächlich zum Laufen bringen.')}
          ${card('Cluster', 'Sichern', 'Daten & KI, Qualität, Resilienz, Assurance — nachweisbar und robust halten.')}
        </div>
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Der Rhythmus</p><h2>Wirkungsrad, sechs Entscheidungstore, Reifegrade</h2></div>
        <div class="card-grid three">
          ${card('Wirkungsrad', 'Der Lernkreis', 'Ausrichten → Gestalten → Realisieren → Messen → Lernen, immer wieder. Wirkung ist kein Projekt, sondern ein Kreislauf.')}
          ${card('Entscheidungstore', 'Tor 0 bis Tor 5', 'An jedem Tor wird bewusst entschieden: weitermachen, nachbessern — oder stoppen und neu denken, wenn eine Wirkungsgrenze verletzt wird.')}
          ${card('Reifegrade', 'Wo stehen wir?', 'Sechs Stufen zeigen, wie tief die Organisation Wirkung schon steuert — vom ersten Bewusstsein bis zur durchgängigen Wirkungsführung.')}
        </div>
      </section>
      <section class="section"><div class="card">
        <p class="hero-kicker">Der entscheidende Unterschied</p>
        <h2>Wirkungsrealisierungsarchitektur: „Deliverables ≠ Wirkung"</h2>
        <p>Viele Vorhaben liefern fleißig Ergebnisse — Berichte, Features, Workshops — und verwechseln diese Deliverables mit Wirkung. Die Realisierungsarchitektur schließt genau diese Lücke: Sie verfolgt die Kette von Leistung über Nutzung und Verhaltensänderung bis zur tatsächlichen Zustandsveränderung, und macht sichtbar, wo sie reißt. Erst am Ende dieser Kette steht Wirkung.</p>
        <div class="hero-actions no-print"><a class="btn btn-primary" href="${base}methodenraum/methoden/">152 Methoden ansehen</a></div>
      </div></section>`;
  write(
    'methodenraum/gesamtbild/index.html',
    page({
      base,
      title: 'WÖMM · Das Gesamtbild | Managementmodell der Wirkungsökonomie',
      desc: 'Das Wirkungsökonomische Managementmodell (WÖMM): Wirkungskompass, sieben Wirkungsräume, zwölf Managementfelder, Wirkungsrad, sechs Entscheidungstore, Reifegrade und die Wirkungsrealisierungsarchitektur.',
      type: 'Modell',
      body,
    })
  );
}
gesamtbild();

// --- 4) Canvas-Prinzip -----------------------------------------------------
function canvasIndex() {
  const base = '../../';
  const anwend = C.canvases.filter((c) => c.anwendungsmodul);
  const body = `      <section class="hero"><div class="hero-grid"><div>
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}methodenraum.html">Methodenraum</a> / Canvas</nav>
        <p class="hero-kicker">WÖMS · Canvas-Prinzip</p>
        <h1>Canvas: die Arbeitsfläche jeder Methode</h1>
        <p class="hero-subtitle">Zu jeder Methode gehört ein Canvas — eine Arbeitsfläche mit klaren Leitfragen, als leere Vorlage und als ausgefülltes Beispiel. So wird aus Theorie sofort etwas, das man im Team ausfüllen kann.</p>
      </div><aside class="card"><p class="card-kicker">Auf einen Blick</p><dl class="portal-meta-grid compact"><div><dt>Methoden-Canvas</dt><dd>152</dd></div><div><dt>Anwendungs-Canvas</dt><dd>56</dd></div><div><dt>Pflichtfelder</dt><dd>5</dd></div></dl></aside></div></section>
      <section class="section"><div class="card">
        <p class="hero-kicker">Immer dabei</p><h2>Die fünf Pflichtfelder</h2>
        <p>Egal welche Methode — diese fünf Felder sind nie optional. Sie halten die Ehrlichkeit im System und verhindern, dass gute Zahlen schlechte überdecken.</p>
        <ul>${li(PFLICHT.map((p) => p.charAt(0).toUpperCase() + p.slice(1)))}</ul>
        <p class="note">Nichtkompensation: Eine verletzte Wirkungsgrenze erzeugt immer „Stopp oder neu gestalten". Ein aggregierter Gesamtwert ist dann unzulässig.</p>
      </div></section>
      <section class="section"><div class="section-header"><p class="hero-kicker">56 Anwendungs- und Realisierungs-Canvas</p><h2>Für konkrete Module</h2><p>Zusätzlich zu den 152 Methoden-Canvas gibt es fachspezifische Varianten für einzelne Anwendungsmodule.</p></div>
        <ul class="link-list columns">${anwend.map((c) => `<li>${esc(c.name)}${c.anwendungsmodul ? ` <span class="badge">${esc(c.anwendungsmodul)}</span>` : ''}</li>`).join('')}</ul>
      </section>`;
  write('methodenraum/canvas/index.html', page({ base, title: 'Canvas-Prinzip | WÖMS | Wirkungsökonomie', desc: 'Das Canvas-Prinzip des WÖMS: 152 Methoden-Canvas und 56 Anwendungs-Canvas mit fünf Pflichtfeldern und Nichtkompensation.', type: 'Übersicht', body }));
}
canvasIndex();

// --- 5) 20 Workshop-Journeys ----------------------------------------------
const JOURNEYS = [
  ['Mandat & Schutzrahmen klären', 'A', ['A01', 'A03', 'A05'], 'Bevor ein Vorhaben startet: Auftrag, Betroffene und rote Linien festlegen.'],
  ['System verstehen', 'B', ['B01', 'B03', 'B06'], 'Zusammenhänge, Rückkopplungen und Hebel eines Wirkungsfeldes sichtbar machen.'],
  ['Wirkungsmodell bauen', 'C', ['C01', 'C03', 'C05'], 'Von der Idee zum überprüfbaren Wirkungsmodell mit Zukunftslogik.'],
  ['Messen & Evidenz', 'D', ['D01', 'D04', 'D08'], 'Indikatoren, Bewertung und ehrliche Unsicherheit festlegen.'],
  ['Strategie auf Wirkung', 'E', ['E01', 'E04', 'E07'], 'Portfolio und Governance an Wirkung ausrichten.'],
  ['Geschäftsmodell als Wirkungssystem', 'F', ['F01', 'F03', 'F07'], 'Angebote und Finanzierung tragfähig und wirkungsorientiert gestalten.'],
  ['Organisation & Kultur', 'G', ['G01', 'G03', 'G06'], 'Führung und Kultur so gestalten, dass das Richtige leicht wird.'],
  ['Umsetzen & Lernen', 'H', ['H01', 'H04', 'H07'], 'Monitoring, Lernen und Assurance in den Betrieb bringen.'],
  ['Vorausschau & Frühwarnung', 'I', ['I01', 'I04', 'I07'], 'Szenarien und Entscheidungsintelligenz für Unsicherheit.'],
  ['Zielarchitektur & Fähigkeiten', 'J', ['J01', 'J04', 'J07'], 'Capabilities und Zielbild als tragende Struktur.'],
  ['Wertströme & Flow', 'K', ['K01', 'K04', 'K07'], 'Prozesse und Services reibungsarm auf Wirkung trimmen.'],
  ['Product Operating Model', 'L', ['L01', 'L04', 'L07'], 'Dauerhafte Produktteams und Plattformen statt Projekt-Strohfeuer.'],
  ['Change & Adoption', 'M', ['M01', 'M05', 'M08'], 'Veränderung so gestalten, dass sie wirklich gelebt wird.'],
  ['Portfolio & Benefits Realization', 'N', ['N01', 'N04', 'N07'], 'Programme konsequent auf realisierte Wirkung steuern.'],
  ['Daten, KI & Schutzregeln', 'O', ['O01', 'O04', 'O07'], 'Technologie und agentische Systeme verantwortungsvoll nutzen.'],
  ['Qualität & Resilienz', 'P', ['P01', 'P05', 'P08'], 'Kontrollen und integrierte Assurance für Vertrauen durch Nachweis.'],
  ['Vom Modell zum ersten Canvas', 'Quer', ['A01', 'C03', 'F03'], 'Einsteiger-Journey: Mandat, Wirkungsmodell, erstes Geschäftsmodell-Canvas.'],
  ['Transformationsvorhaben aufsetzen', 'Quer', ['B03', 'E04', 'N04'], 'Ein großes Vorhaben wirkungsökonomisch strukturieren.'],
  ['Wirkungscontrolling etablieren', 'Quer', ['D04', 'D08', 'P05'], 'Messung, Evidenz und Assurance zu einem Controlling verbinden.'],
  ['Coaching-Workshop moderieren', 'Quer', ['A05', 'C01', 'G03'], 'Format für Coaches & Trainer:innen in Unternehmen.'],
];
function journeys() {
  const base = '../../';
  const cards = JOURNEYS.map(([title, kat, ids, desc], i) => {
    const steps = ids
      .map((id) => (byId[id] ? `<a class="badge" href="${base}methodenraum/methoden/${slug(id)}/">${esc(id)}</a>` : `<span class="badge">${esc(id)}</span>`))
      .join(' ');
    return `<article class="card"><p class="card-kicker">Journey ${i + 1} · ${esc(kat)}</p><h3>${esc(title)}</h3><p>${esc(desc)}</p><p>${steps}</p></article>`;
  }).join('');
  const body = `      <section class="hero"><div class="hero-grid"><div>
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}methodenraum.html">Methodenraum</a> / Journeys</nav>
        <p class="hero-kicker">WÖMS · Workshop-Journeys</p>
        <h1>20 Standard-Workshop-Journeys</h1>
        <p class="hero-subtitle">Fertige Ablaufpläne, die Methoden zu einem Workshop verketten — für Team, Beratung und Coaching. Jede Journey ist ein roter Faden aus mehreren Methoden.</p>
      </div><aside class="card"><p class="card-kicker">Hinweis</p><p class="note">Die ausführlichen Moderationsleitfäden je Journey folgen fortlaufend; die Methoden dahinter sind bereits vollständig verlinkt.</p></aside></div></section>
      <section class="section"><div class="card-grid three">${cards}</div></section>`;
  write('methodenraum/journeys/index.html', page({ base, title: '20 Workshop-Journeys | WÖMS | Wirkungsökonomie', desc: '20 Standard-Workshop-Journeys des WÖMS: fertige Ablaufpläne, die Methoden zu Workshops für Team, Beratung und Coaching verketten.', type: 'Übersicht', body }));
}
journeys();

console.log(`Methodenraum generiert: ${nMethod} Methodenseiten + Hub + Gesamtbild + Canvas + Journeys.`);
