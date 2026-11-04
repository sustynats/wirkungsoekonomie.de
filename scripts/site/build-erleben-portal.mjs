import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderSiteHeader} from '../lib/site-shell.mjs';

export const categories = {
  products: 'Produkte & Wirkungssteuer',
  business: 'Unternehmen & Resilienz',
  climate: 'Klima, Energie & Wohnen',
  media: 'Medien & Demokratie',
  regions: 'Kommunen, Regionen & Welt',
  social: 'Soziales, Arbeit & Zukunft',
  learning: 'Lernen & Verstehen'
};
export const types = {
  simulation: 'Simulation', calculator: 'Rechner', check: 'Check',
  compass: 'Kompass', quiz: 'Quiz', learning: 'Lernmodul', method: 'Methodenbeschreibung'
};
export const statuses = {
  demo: 'Interaktive Demo', beta: 'Interaktive Beta',
  learning: 'Lernmodul', method: 'Beschreibung · ohne Rechner', online: 'Onlinezugang · Community-Funktion'
};
const title = 'Wirkungsökonomie erleben | Simulatoren & Rechner';
const description = 'Erlebe die Wirkungsökonomie interaktiv: Entdecke Simulatoren und Rechner für Produktwirkung, Wirkungssteuer, Unternehmen, Klima, Wohnen und Demokratie.';
const e = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read = (root, file) => fs.readFileSync(path.join(root, file), 'utf8');
const writeChanged = (root, file, text) => {
  const target = path.join(root, file);
  if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === text) return;
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, text);
};

// The legacy document remains the source of the established interactive DOM and
// explanations. Preserve nested sections rather than cutting at the first close.
export function topSections(main) {
  let depth = 0, start = 0;
  const sections = [];
  for (const tag of main.matchAll(/<\/?section\b[^>]*>/g)) {
    if (!tag[0].startsWith('</')) {
      if (depth === 0) start = tag.index;
      depth += 1;
    } else {
      if (--depth < 0) throw new Error('Unbalanced legacy section');
      if (depth === 0) sections.push(main.slice(start, tag.index + tag[0].length));
    }
  }
  if (depth !== 0) throw new Error('Unclosed legacy section');
  return sections;
}

function rootLinks(html) {
  return html.replace(/\b(href|src|poster)="([^"#][^"]*)"/g, (all, attr, value) => (
    /^(?:\/|[a-z][\w+.-]*:)/i.test(value) ? all : `${attr}="/${value}"`
  ));
}

export function validateRegistry(registry, root) {
  if (!Array.isArray(registry) || registry.length === 0) throw new Error('Tool register must be a nonempty array');
  const ids = new Set(), routes = new Set();
  for (const tool of registry) {
    const c = tool.catalog;
    if (!/^[a-z0-9-]+$/.test(tool.id) || ids.has(tool.id)) throw new Error(`Duplicate or invalid tool ID: ${tool.id}`);
    if (!c || !categories[c.category] || !types[c.type] || !statuses[c.status] || !c.description || !c.question) throw new Error(`Incomplete catalog metadata: ${tool.id}`);
    if (!tool.route.startsWith('/') || tool.route.startsWith('//') || routes.has(tool.route)) throw new Error(`Duplicate or invalid tool route: ${tool.route}`);
    const url = new URL(tool.route, 'https://wirkungsoekonomie.de');
    const file = path.resolve(root, '.' + url.pathname + (url.pathname.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(path.resolve(root) + path.sep) || !fs.existsSync(file)) throw new Error(`Missing tool page: ${tool.route}`);
    if (c.sourceRuntime && c.sourceRuntime !== 'inline' && !fs.existsSync(path.join(root, c.sourceRuntime))) throw new Error(`Missing runtime: ${tool.id}`);
    if (c.status === 'method' && tool.hasResults) throw new Error(`Method advertised as calculator: ${tool.id}`);
    if (c.quickStart && !['demo', 'beta'].includes(c.status)) throw new Error(`Quick start is not an interactive demo: ${tool.id}`);
    ids.add(tool.id); routes.add(tool.route);
  }
  const quick = registry.filter(t => t.catalog.quickStart);
  if (quick.length !== 6 || new Set(quick.map(t => t.catalog.quickStart.order)).size !== 6) throw new Error('Expected six distinct quick starts');
  return registry;
}

function options(entries, available) {
  return Object.entries(entries).filter(([id]) => available.has(id)).map(([id, label]) => `<option value="${e(id)}">${e(label)}</option>`).join('');
}

export function renderCatalog(registry) {
  const available = key => new Set(registry.map(t => t.catalog[key]));
  const cards = registry.map(tool => {
    const c = tool.catalog;
    const words = [tool.title, c.description, c.question, categories[c.category], types[c.type], statuses[c.status]].join(' ');
    return `<article class="portal-tool-card" data-method-card data-tool-id="${e(tool.id)}" data-search="${e(words)}" data-cluster="${e(c.category)}" data-type="${e(c.type)}" data-status="${e(c.status)}">
      <p class="portal-tool-topic">${e(categories[c.category])}</p>
      <h3>${e(tool.title)}</h3><p>${e(c.description)}</p>
      <p class="portal-tool-question">${e(c.question)}</p>
      <dl class="portal-tool-meta"><div><dt>Typ</dt><dd>${e(types[c.type])}</dd></div><div><dt>Status</dt><dd>${e(statuses[c.status])}</dd></div></dl>
      <a class="text-link portal-tool-start" href="${e(tool.route)}">${e(tool.publicCta)}<span class="sr-only">: ${e(tool.title)}</span><span aria-hidden="true"> →</span></a>
    </article>`;
  }).join('\n');
  // This is also the static public-area directory. Packaging checks its complete
  // subroute coverage before retaining it, so no second "Alle Inhalte" list appears.
  return `<section class="section tool-directory" id="erlebniswelt" data-tool-directory data-erleben-tool-catalog="true" data-public-area-directory="true" aria-labelledby="tool-directory-title">
    <div class="container-wide"><p class="hero-kicker">Dein Werkzeugkatalog</p><h2 id="tool-directory-title">Alle interaktiven Werkzeuge entdecken</h2>
    <p>Alle Einträge sind sichtbar. Du kannst Thema, Typ und Status mit der Suche kombinieren. Methodenbeschreibungen sind ausdrücklich gekennzeichnet.</p>
    <form class="portal-tool-filters" data-tool-filter role="search" aria-label="Werkzeugkatalog durchsuchen" hidden>
      <div class="portal-tool-search"><label for="tool-search">Werkzeug oder Frage suchen</label><input id="tool-search" type="search" name="q" placeholder="Zum Beispiel Wohnen, Produkt oder Demokratie" data-tool-filter-search aria-controls="tool-catalog-cards" autocomplete="off"></div>
      <div><label for="tool-category">Thema</label><select id="tool-category" name="category" data-tool-filter-cluster aria-controls="tool-catalog-cards"><option value="">Alle Themen</option>${options(categories, available('category'))}</select></div>
      <div><label for="tool-type">Tool-Typ</label><select id="tool-type" name="type" data-tool-filter-type aria-controls="tool-catalog-cards"><option value="">Alle Typen</option>${options(types, available('type'))}</select></div>
      <div><label for="tool-status">Entwicklungsstatus</label><select id="tool-status" name="status" data-tool-filter-status aria-controls="tool-catalog-cards"><option value="">Alle Status</option>${options(statuses, available('status'))}</select></div>
      <button class="btn btn-secondary" type="button" data-tool-filter-reset>Filter zurücksetzen</button>
    </form>
    <p class="portal-tool-count" role="status" aria-live="polite" aria-atomic="true" data-tool-filter-count>${registry.length} von ${registry.length} Einträgen</p>
    <p class="portal-tool-empty" data-tool-filter-empty hidden>Kein passender Eintrag. Ändere den Suchbegriff oder setze die Filter zurück.</p>
    <div class="portal-tool-grid" id="tool-catalog-cards">${cards}</div>
    <noscript><p>Ohne JavaScript bleiben alle Einträge und ihre direkten Links sichtbar. Die Suche steht mit aktiviertem JavaScript zur Verfügung.</p></noscript>
    </div></section>`;
}

function hero(registry) {
  const quick = registry.filter(t => t.catalog.quickStart).sort((a, b) => a.catalog.quickStart.order - b.catalog.quickStart.order);
  return `<section class="portal-hero" aria-labelledby="erleben-title"><div class="container-wide">
    <p class="hero-kicker">Wirkung verstehen. Selbst ausprobieren. Zukunft gestalten.</p>
    <h1 id="erleben-title">Die Wirkungsökonomie erleben</h1>
    <p class="portal-hero-intro">Was verändert sich, wenn wir Entscheidungen nach ihrer Wirkung auf Mensch, Planet und Demokratie beurteilen? Entdecke unsere interaktiven Simulatoren, Rechner und Werkzeuge und probiere es selbst aus.</p>
    <h2 class="portal-start-question">Was möchtest du ausprobieren?</h2>
    <div class="portal-quick-grid">${quick.map(tool => {
      const q = tool.catalog.quickStart;
      return `<a class="portal-quick-card" href="${e(tool.route)}"><span class="portal-quick-number" aria-hidden="true">0${q.order}</span><h3>${e(q.title)}</h3><p>${e(q.question)}</p><span class="portal-quick-action">${e(q.action)} <span aria-hidden="true">→</span></span><span class="portal-quick-status">${e(statuses[tool.catalog.status])}</span></a>`;
    }).join('')}</div>
    <nav class="portal-jump-links" aria-label="Auf dieser Seite"><a href="#erlebniswelt">Alle Werkzeuge</a><a href="#direkt-ausprobieren">Hier direkt ausprobieren</a><a href="#ergebnisse-verstehen">Ergebnisse verstehen</a></nav>
    <p class="portal-model-note">Modelle und Lernbeispiele · keine amtliche Bewertung · keine Personenbewertung · simulierte Steuern sind kein geltendes Steuerrecht</p>
  </div></section>`;
}

function prepareEmbedded(html) {
  const hooks = {
    'data-price-truth': 'mini-preiswahrheit', 'data-radar': 'mini-wirkungsradar',
    'data-policy-check': 'mini-politik-folgencheck', 'data-tax-game': 'mini-wirkungssteuer-spiel',
    'data-communication-check': 'mini-kommunikation', 'data-mini-quiz': 'mini-quiz', 'data-cycle': 'mini-wirkungskreislauf'
  };
  for (const [hook, id] of Object.entries(hooks)) {
    html = html.replace(new RegExp(`(<article\\b[^>]*)(\\s${hook}(?=[\\s=>]))`), `$1 id="${id}"$2`);
  }
  for (const [key, id] of Object.entries({impact:'wirkung', product:'produkt', media:'medien', capital:'kapital'})) {
    html = html.replace(`data-quiz-module="${key}"`, `id="quiz-${id}" data-quiz-module="${key}"`);
  }
  html = html.replace(/(<article\b[^>]*)(>\s*<p class="hero-kicker">Wirkungs-Bibliothek<\/p>\s*<h3>Fallbeispiele:)/, '$1 id="mini-fallbeispiele"$2');
  return html.replace('Neun kurze Zugänge, um Wirkung praktisch zu begreifen.', 'Kleine Werkzeuge für Alltag und Entscheidungen');
}

function explanations(sections, canonical) {
  const originalHero = sections.find(s => /class="hero experience-hero"/.test(s));
  const governance = sections.find(s => /class="section demo-governance"/.test(s));
  const oldDirectory = sections.find(s => /id="erlebniswelt"/.test(s));
  if (!originalHero || !governance || !oldDirectory) throw new Error('Missing original explanations');
  const overview = oldDirectory
    .replace(/<div class="experience-path-grid">[\s\S]*?<\/div>/, '<span id="alltag"></span><span id="scorecard-demos"></span><span id="scanner"></span>')
    .replace('id="erlebniswelt"', 'id="beispiele-einordnen"');
  const guide = canonical.match(/<!-- website-guide:erleben-kurz:start -->[\s\S]*?<!-- website-guide:erleben-kurz:end -->/)?.[0] || '';
  return `<section class="section portal-explanations" id="ergebnisse-verstehen" aria-labelledby="portal-results-title"><div class="container-wide">
    <h2 id="portal-results-title">Was zeigen dir die Ergebnisse?</h2>
    <p>Die Werkzeuge machen Annahmen, Wirkungspfade und mögliche Zielkonflikte sichtbar. Ein Modellwert ist noch kein Nachweis einer tatsächlichen Zustandsveränderung. Für reale Bewertungen braucht es nachvollziehbare Daten und Evidenz.</p>
    <div class="portal-model-questions"><details><summary>Was wird simuliert und welche Annahmen gelten?</summary><p>Du veränderst Eingaben innerhalb des jeweiligen Modells. Ergebnisse gelten für dessen Systemgrenze, Vergleich und Datenstand. Demo- und Beta-Hinweise stehen an den Werkzeugen; tatsächliche Veränderungen müssen separat belegt werden.</p></details>
    <details><summary>Was bedeutet ein Score?</summary><p>Ein Score ordnet Befunde nach offengelegten Maßstäben. Er bewertet keine Menschen und ist weder eine Messung an sich noch eine amtliche Einstufung. Datenlücken und Unsicherheit bleiben sichtbar.</p></details>
    <details><summary>Welche Schutzlinien und Grenzen gelten?</summary><p>Positive Netto-Wirkung verlangt eine begründete Betrachtung von Nutzen, Schäden und Verteilung. Nichtkompensation schützt harte Grenzen; die Reverse Merit Order macht kritische Defizite sichtbar und begrenzt die Bewertung. SDGs und die WÖk-Erweiterung SDG+ geben Referenzen, aber keinen Kausalitätsbeweis. Steuerbeispiele bleiben Modellrechnungen und sind kein geltendes Steuerrecht.</p></details></div>
    <details class="portal-original-explanation"><summary>Einführung und bisherige fachliche Einordnung</summary>${originalHero.replace(/<h1\b/g, '<h3').replace(/<\/h1>/g, '</h3>').replace('class="hero experience-hero"','class="portal-context-intro"')}</details>
    <details class="portal-original-explanation"><summary>Modellannahmen, Schutzlinien und Grenzen im Detail</summary>${governance}</details>
    <details class="portal-original-explanation"><summary>Wie du Produkt-, Medien-, Plattform- und Risikoprofile liest</summary>${overview}</details>
    ${guide ? `<details class="portal-original-explanation"><summary>Erleben kurz erklärt: Video und Transkript</summary>${guide}</details>` : ''}
    </div></section>`;
}

function learning() {
  const links = [
    ['/verstehen/', 'Grundlagen verstehen', 'Begriffe und Zusammenhänge Schritt für Schritt.'],
    ['/wirkungsfelder/', 'Wirkungsfelder erkunden', 'Mensch, Planet und Demokratie im Zusammenhang.'],
    ['/methodik/', 'Methodik vertiefen', 'Systemgrenzen, Evidenz und nachvollziehbare Prüfwege.'],
    ['/akademie.html', 'In der Akademie weiterlernen', 'Vorhandene Lernangebote und Lernwege.'],
    ['/bibliothek/', 'Quellen in der Bibliothek lesen', 'Originaltexte, Vertiefungen und Versionsstände.']
  ];
  return `<section class="section section-muted" id="weiterlernen"><div class="container-wide"><h2>Du möchtest mehr verstehen?</h2><p>Verbinde dein Beispiel mit den fachlichen Grundlagen und prüfe die Quellen hinter den Annahmen.</p><div class="portal-learning-grid">${links.map(([href, label, text]) => `<a class="portal-learning-link" href="${href}"><strong>${label}</strong><span>${text}</span></a>`).join('')}</div></div></section>`;
}

export function buildErlebenPortal(root = process.cwd()) {
  const registry = validateRegistry(JSON.parse(read(root, 'assets/data/tool-registry.json')), root);
  const legacy = read(root, 'erleben.html');
  const canonical = read(root, 'erleben/index.html');
  const main = legacy.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  if (!main) throw new Error('Legacy Erleben main missing');
  const sections = topSections(main);
  const interactive = ['politik-sprache', 'werkzeuge', 'lernmodule'].map(id => {
    const section = sections.find(s => s.includes(`id="${id}"`));
    if (!section) throw new Error(`Missing existing interactive section: ${id}`);
    return prepareEmbedded(section);
  }).join('\n');
  const body = hero(registry) + renderCatalog(registry) + `<section class="portal-embedded" id="direkt-ausprobieren" aria-labelledby="portal-inline-title"><div class="container-wide"><h2 id="portal-inline-title">Hier direkt ausprobieren</h2><p>Alle folgenden Module laufen direkt auf dieser Seite. Die Regler, Quizfragen und Rechenwege bleiben die vorhandenen Demos.</p><nav class="portal-jump-links" aria-label="Direkt zu den eingebetteten Werkzeugen"><a href="#politik-sprache">Entscheidungskompass</a><a href="#werkzeuge">Mini-Werkzeuge</a><a href="#lernmodule">Quizmodule</a></nav></div>${interactive}</section>` + explanations(sections, canonical) + learning();
  for (const tool of registry.filter(t => t.route.startsWith('/erleben/#'))) {
    if (!body.includes(`id="${tool.route.split('#')[1]}"`)) throw new Error(`Missing embedded target: ${tool.route}`);
  }
  let html = legacy.replace(/<!-- erleben-legacy-redirect:start -->[\s\S]*?<!-- erleben-legacy-redirect:end -->\s*/g, '');
  html = html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/, `<main class="erleben-portal" data-erleben-portal>\n${body}\n</main>`);
  html = html.replace(/<header\b[^>]*\bclass="site-header"[\s\S]*?<\/header>/, renderSiteHeader('', 'de'));
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${e(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${e(description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${e(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${e(description)}`)
    .replace(/\s*<meta name="robots" content="noindex,follow">/, '')
    .replace(/("description": ")Interaktive Erlebnis-Seite[^"]*/, `$1${description}`)
    .replace(/(":\s*")erleben\//g, '$1/erleben/')
    .replace('</head>', '  <link rel="stylesheet" href="/assets/css/erleben-portal.css?v=20261104">\n  </head>');
  html = rootLinks(html).replace(/assets\/js\/main\.js\?[^"']+/g, 'assets/js/main.js?v=20261104-tool-catalog');
  html = html.replace(/(href="\/erleben\/"[^>]*>)Interaktive Demos(<\/a>)/g, '$1Erleben &amp; Simulieren$2');
  writeChanged(root, 'erleben/index.html', html);

  const redirect = '<!-- erleben-legacy-redirect:start --><script>if(window.location.pathname==="/erleben.html"){window.location.replace("/erleben/"+window.location.search+window.location.hash);}</script><!-- erleben-legacy-redirect:end -->';
  if (!legacy.includes('<!-- erleben-legacy-redirect:start -->')) writeChanged(root, 'erleben.html', legacy.replace('</head>', redirect + '\n  </head>'));

  let home = read(root, 'index.html');
  if (!home.includes('data-erleben-home-cta')) {
    const cta = '<a class="btn btn-secondary" href="/erleben/" data-erleben-home-cta>Wirkungsökonomie selbst ausprobieren</a>';
    const next = home.replace(/(<section class="hero home-journey-hero"[\s\S]*?<div class="hero-actions">[\s\S]*?)(<\/div>)/, `$1${cta}$2`);
    if (next === home) throw new Error('Homepage hero action group missing');
    home = next;
    writeChanged(root, 'index.html', home);
  }
  return {entries: registry.length, embedded: registry.filter(t => t.route.startsWith('/erleben/#')).length, canonical: '/erleben/'};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(buildErlebenPortal()));
