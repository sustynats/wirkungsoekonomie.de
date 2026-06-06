import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RADAR_ROOT = path.join(ROOT, "wirkungsradar");
const ACADEMY_SUBMISSION = "https://akademie.wirkungsoekonomie.de/narrativ-einreichen/";

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

function write(relative, html) {
  fs.writeFileSync(path.join(ROOT, relative), html, "utf8");
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hrefFrom(file, target = "") {
  const fromDir = path.posix.dirname(path.relative(ROOT, file).split(path.sep).join("/"));
  let base = path.posix.relative(fromDir, "wirkungsradar");
  if (!base || base === ".") base = ".";
  return target ? `${base}/${target}/`.replaceAll("//", "/") : `${base}/`.replaceAll("//", "/");
}

function canonicalRadarNav(file) {
  const links = [
    ["Debatten-Kompass", hrefFrom(file)],
    ["Debattenkarten", hrefFrom(file, "debattenkarten")],
    ["Antwort-Playbooks", hrefFrom(file, "antwort-playbooks")],
    ["Wirkungsradar-Methode", hrefFrom(file, "methode")],
    ["Narrativ einreichen", ACADEMY_SUBMISSION],
  ];
  return `<nav class="topic-subnav radar-sprint-nav" aria-label="Debatten-Kompass Navigation" data-search-exclude>${links
    .map(([label, href]) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`)
    .join("")}</nav>`;
}

function replaceSubnavs(html, file) {
  return html
    .replace(/<nav class="topic-subnav radar-sprint-nav"[\s\S]*?<\/nav>/g, canonicalRadarNav(file))
    .replace(/<nav class="topic-subnav public-impact-room-nav"[\s\S]*?<\/nav>/g, canonicalRadarNav(file))
    .replace(/<nav class="radar-subnav"[\s\S]*?<\/nav>/g, canonicalRadarNav(file));
}

function replaceMeta(html, title, description) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`);
}

function normalizeDebateCompassIndex() {
  const relative = "wirkungsradar/index.html";
  if (!fs.existsSync(path.join(ROOT, relative))) return false;
  const before = read(relative);
  let html = before;

  html = replaceMeta(
    html,
    "Debatten-Kompass - Mythen erkennen, Fakten klären, Wirkungen verstehen | Wirkungsoekonomie.de",
    "Der Debatten-Kompass hilft, öffentliche Aussagen einzuordnen: Behauptung verstehen, Sofortantwort finden, Folgencheck, Wirkpfad, Faktenlage und Quellen."
  );
  html = html
    .replace(/<p class="hero-kicker">[\s\S]*?<\/p>\s*<h1 class="hero-title">[\s\S]*?<\/h1>/, '<p class="hero-kicker">Öffentlicher Wirkungsraum</p><h1 class="hero-title">Debatten-Kompass</h1>')
    .replace(/<p class="hero-subtitle">[\s\S]*?<\/p>/, '<p class="hero-subtitle">Mythen erkennen. Fakten klären. Wirkungen verstehen. Besser antworten.</p>')
    .replace(/<p class="radar-sprint-lead">[\s\S]*?<\/p>/, '<p class="radar-sprint-lead">Der Debatten-Kompass hilft, öffentliche Aussagen einzuordnen: Was wird behauptet? Was stimmt? Was fehlt? Welcher Frame wird gesetzt? Welche Wirkung kann entstehen? Und welche Antwort verbessert die Debatte, ohne das Narrativ zu verstärken? Die Wirkungsradar-Methode ist dabei der Blick unter die Oberfläche: Faktenlage, Frameanalyse, Resonanzprofil, Agenda-Gewichtung, Ursachenprüfung, Wirkpfad, Folgencheck und Resilienzfrage.</p>')
    .replace(/<a class="btn btn-primary" href="debattenkarten\/">[\s\S]*?<\/a>/, '<a class="btn btn-primary" href="debattenkarten/">Debattenkarten öffnen</a>')
    .replace(/<a class="btn btn-secondary" href="methode\/">[\s\S]*?<\/a>/, '<a class="btn btn-secondary" href="methode/">Methode verstehen</a>');

  html = replaceSubnavs(html, path.join(ROOT, relative));

  html = html
    .replace(/<p class="hero-kicker">Begriffe sauber trennen<\/p><h2>[\s\S]*?<\/h2><p>[\s\S]*?<\/p>/, '<p class="hero-kicker">Begriffe sauber trennen</p><h2>Debatten-Kompass, Debattenkarte und Wirkungsradar-Methode.</h2><p>Die Begriffe gehören zusammen, aber sie stehen nicht als konkurrierende Produkte nebeneinander.</p>')
    .replace(/<p class="card-kicker">Wirkungsradar-Methode<\/p><h3 class="card-title">Der Blick unter die Oberfläche<\/h3><p class="card-text">[\s\S]*?<\/p>/, '<p class="card-kicker">Wirkungsradar-Methode</p><h3 class="card-title">Der Blick unter die Oberfläche</h3><p class="card-text">Das Wirkungsradar ist die Methode in jeder Karte: Faktenkern, Frame, Resonanz, Agenda, Ursache, Wirkpfad, Folgen und Resilienz.</p>');

  html = html.replace(
    /<section class="section" id="begriffe">[\s\S]*?<\/section>\s*(<section class="section section-soft" id="aktuelle-debattenkarten">)/,
    `<section class="section" id="begriffe"><div><div class="section-header"><p class="hero-kicker">Begriffe sauber trennen</p><h2>Debatten-Kompass, Debattenkarte und Wirkungsradar-Methode.</h2><p>Die Begriffe gehören zusammen, aber sie stehen nicht als konkurrierende Produkte nebeneinander.</p></div><div class="card-grid three"><article class="card"><p class="card-kicker">Debatten-Kompass</p><h3 class="card-title">Das öffentliche Produkt</h3><p class="card-text">Der Debatten-Kompass ist der Einstieg für Nutzer:innen: Aussage verstehen, Antwort finden, Wirkung prüfen.</p></article><article class="card"><p class="card-kicker">Debattenkarte</p><h3 class="card-title">Die konkrete Fallseite</h3><p class="card-text">Eine Debattenkarte behandelt eine Aussage oder ein Narrativ: Behauptung, Sofortantwort, Folgencheck, Wirkpfad, Faktenlage und Quellen.</p></article><article class="card"><p class="card-kicker">Wirkungsradar-Methode</p><h3 class="card-title">Der Blick unter die Oberfläche</h3><p class="card-text">Das Wirkungsradar ist die Methode in jeder Karte: Faktenkern, Frame, Resonanz, Agenda, Ursache, Wirkpfad, Folgen und Resilienz.</p></article></div></div></section>\n    $1`
  );

  html = html.replace(
    /<section class="section" id="mehr-als-faktencheck">[\s\S]*?<\/section>\s*(<section class="section section-soft" id="werkzeuge">)/,
    `<section class="section" id="mehr-als-faktencheck"><div><div class="section-header"><p class="hero-kicker">Methode</p><h2>Warum der Debatten-Kompass mehr ist als ein Faktencheck.</h2></div><article class="card radar-method-card"><p>Ein Faktencheck fragt: <strong>Stimmt das?</strong></p><p>Der Debatten-Kompass fragt zusätzlich: <strong>Warum findet diese Aussage Resonanz? Welche Aufmerksamkeit bindet sie? Welche Ursachen verdeckt sie? Welche Wirkungspotenziale entstehen für Mensch, Planet und Demokratie?</strong></p><p>Ein Faktencheck prüft Aussagen. Die Wirkungsradar-Methode liest Wirkpfade.</p><p>Wirkung ist neutral: Sie ist die tatsächliche Veränderung von Zuständen. Entscheidend ist, ob aus Wirkungspotenzial, Resonanzraum und Wirkpfad positive Netto-Wirkung für Mensch, Planet und Demokratie wahrscheinlicher wird - oder ob Wirkungsrisiken verdeckt werden.</p></article></div></section>\n    $1`
  );

  html = html.replace(
    /<section class="section" id="merkhilfe">[\s\S]*?<\/section>/,
    '<section class="section" id="merkhilfe"><div><article class="card radar-memory-card"><p class="card-kicker">Die einfache Merkhilfe</p><h2>Die meisten Menschen diskutieren über den Stein. Die Wirkungsradar-Methode analysiert die Wellen.</h2><p>Der Stein ist die Aussage. Die Wellen sind Aufmerksamkeit, Resonanz, Narrative, Wirkpfade und Folgen. Wirkungsökonomisch wird erst dann sichtbar, ob eine Debatte Probleme löst - oder sie nur lauter macht.</p></article></div></section>'
  );

  if (!html.includes("Der Debatten-Kompass ist die Karte. Das Wirkungsradar ist der Blick unter die Oberfläche.")) {
    html = html.replace(
      /(<section class="section" id="mehr-als-faktencheck">)/,
      '<section class="section section-soft" id="produktlogik"><div><article class="card important-card"><p class="card-kicker">Produktlogik</p><h2>Der Debatten-Kompass ist die Karte. Das Wirkungsradar ist der Blick unter die Oberfläche.</h2><p>Nutzer:innen öffnen den Debatten-Kompass, wenn sie eine Antwort brauchen. Die Wirkungsradar-Methode erklärt, wie die Karte zu ihrer Einordnung kommt.</p></article></div></section>$1'
    );
  }

  if (html !== before) write(relative, html);
  return html !== before;
}

const modulePages = [
  {
    file: "wirkungsradar/resonanz-kompass/index.html",
    title: "Radar-Modul: Resonanzprofil",
    description: "Das Resonanzprofil zeigt, warum eine Aussage Anschluss findet, welche Erfahrungen sie aktiviert und welche öffentliche Gewichtung daraus entsteht.",
  },
  {
    file: "wirkungsradar/agenda-radar/index.html",
    title: "Radar-Modul: Agenda-Gewichtung",
    description: "Die Agenda-Gewichtung zeigt, welche wichtigen Wirkungsfragen durch laute Debatten verdrängt werden.",
  },
  {
    file: "wirkungsradar/ursachen-navigator/index.html",
    title: "Radar-Modul: Ursachenprüfung",
    description: "Die Ursachenprüfung führt vom Aufreger zur Systemfrage und sucht den Hebel unter der sichtbaren Debatte.",
  },
  {
    file: "wirkungsradar/resilienz-prinzipien/index.html",
    title: "Radar-Modul: Resilienzfrage",
    description: "Die Resilienzfrage prüft, wie Öffentlichkeit trotz Empörung, Ablenkung und Manipulation lern- und handlungsfähig bleibt.",
  },
];

function normalizeModulePage({ file, title, description }) {
  const absolute = path.join(ROOT, file);
  if (!fs.existsSync(absolute)) return false;
  const before = read(file);
  let html = before;

  html = replaceMeta(html, `${title} | Wirkungsökonomie`, description);
  html = html
    .replace(/<p class="hero-kicker">[\s\S]*?<\/p>\s*<h1 class="hero-title">[\s\S]*?<\/h1>/, `<p class="hero-kicker">Wirkungsradar-Methode</p><h1 class="hero-title">${escapeHtml(title)}</h1>`)
    .replace(/<p class="hero-subtitle">[\s\S]*?<\/p>/, `<p class="hero-subtitle">${escapeHtml(description)}</p>`)
    .replace(/<nav class="breadcrumb" aria-label="Breadcrumb">[\s\S]*?<\/nav>/, `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a> / <a href="../../wirkungsradar/">Debatten-Kompass</a> / ${escapeHtml(title)}</nav>`);

  html = replaceSubnavs(html, absolute);

  if (html !== before) write(file, html);
  return html !== before;
}

function normalizeMethodPage() {
  const file = "wirkungsradar/methode/index.html";
  const absolute = path.join(ROOT, file);
  if (!fs.existsSync(absolute)) return false;
  const before = read(file);
  let html = before;

  html = replaceMeta(
    html,
    "Die Wirkungsradar-Methode im Debatten-Kompass | Wirkungsoekonomie.de",
    "Die Wirkungsradar-Methode erklärt, wie der Debatten-Kompass Faktenkern, Frame, Resonanz, Agenda, Ursachen, Wirkpfad, Folgencheck und Quellen zusammenführt."
  );
  html = html
    .replace(/<p class="hero-kicker">[\s\S]*?<\/p>\s*<h1 class="hero-title">[\s\S]*?<\/h1>/, '<p class="hero-kicker">Methode</p><h1 class="hero-title">Die Wirkungsradar-Methode im Debatten-Kompass</h1>')
    .replace(/<p class="hero-subtitle">[\s\S]*?<\/p>/, '<p class="hero-subtitle">Warum der Debatten-Kompass mehr macht als einen Faktencheck.</p>')
    .replace(/<p class="radar-sprint-lead">[\s\S]*?<\/p>/, '<p class="radar-sprint-lead">Die Wirkungsradar-Methode verbindet Faktenkern, Frameanalyse, Resonanzprofil, Agenda-Gewichtung, Ursachenprüfung, Wirkpfad, Folgencheck, Resilienzfrage sowie Quellen- und Unsicherheitslogik. Sie ist die Methode im Debatten-Kompass, nicht ein zweites Produkt neben ihm.</p>')
    .replace(/<nav class="breadcrumb" aria-label="Breadcrumb">[\s\S]*?<\/nav>/, '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a> / <a href="../../wirkungsradar/">Debatten-Kompass</a> / Methode</nav>');

  html = replaceSubnavs(html, absolute);

  if (html !== before) write(file, html);
  return html !== before;
}

function normalizeStartPage() {
  const file = "index.html";
  const absolute = path.join(ROOT, file);
  if (!fs.existsSync(absolute)) return false;
  const before = read(file);
  let html = before
    .replace(/<h2 id="wirkungsradar-einstieg-title">[\s\S]*?<\/h2>/, '<h2 id="wirkungsradar-einstieg-title">Debatten-Kompass: öffentliche Aussagen systemisch verstehen.</h2>')
    .replace(/<p>Der Wirkungsradar führt zu Debattenkarten[\s\S]*?<\/p>/, '<p>Der Debatten-Kompass führt zu Debattenkarten, Antwort-Playbooks und zur Wirkungsradar-Methode. Er ist der Einstieg, wenn öffentliche Aussagen nicht nur auf Wahrheit, sondern auf Wirkung geprüft werden sollen.</p>')
    .replace(/>Wirkungsradar öffnen<\/a>/g, ">Debatten-Kompass öffnen</a>");

  if (html !== before) write(file, html);
  return html !== before;
}

let changed = 0;
if (normalizeDebateCompassIndex()) changed += 1;
if (normalizeStartPage()) changed += 1;
if (normalizeMethodPage()) changed += 1;
for (const page of modulePages) {
  if (normalizeModulePage(page)) changed += 1;
}

for (const file of walk(RADAR_ROOT)) {
  const before = fs.readFileSync(file, "utf8");
  let html = replaceSubnavs(before, file)
    .replace(/Wirkungsradar-Live/g, "Debatten-Kompass")
    .replace(/Wirkungsradar Live/g, "Debatten-Kompass")
    .replace(/Live-Karten/g, "Debattenkarten")
    .replace(/Live-Karte/g, "Debattenkarte")
    .replace(/Wirkungsradar öffnen/g, "Debatten-Kompass öffnen")
    .replace(/aria-label="Wirkungsradar Navigation"/g, 'aria-label="Debatten-Kompass Navigation"');
  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    changed += 1;
  }
}

console.log(`Applied Debatten-Kompass product architecture to ${changed} files.`);
