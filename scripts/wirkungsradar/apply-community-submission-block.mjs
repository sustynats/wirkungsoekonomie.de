import fs from "node:fs";
import path from "node:path";
import { communitySubmissionBlock, escapeHtml } from "../../components/wirkungsradar/communitySubmissionBlock.mjs";

const ROOT = process.cwd();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wirkungsoekonomie.de";
const ACADEMY_NARRATIVE_URL = "https://akademie.wirkungsoekonomie.de/narrativ-einreichen/";
const FORM_ROUTE = path.join(ROOT, "wirkungsradar/narrativ-einreichen");
const PROCESS_ROUTE = path.join(ROOT, "wirkungsradar/pruefprozess");
const CSS_VERSION = "20260604-community-layout-fix";
const JS_VERSION = "20260604-community-submit";

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${String(text).trim()}\n`);
}

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...listHtml(full));
    else if (entry.isFile() && entry.name === "index.html") result.push(full);
  }
  return result;
}

function relDir(fromFile, toDir) {
  const rel = path.relative(path.dirname(fromFile), toDir).split(path.sep).join("/");
  return rel ? `${rel}/` : "./";
}

function relFile(fromFile, toFile) {
  return path.relative(path.dirname(fromFile), toFile).split(path.sep).join("/");
}

function relNavBase(fromFile) {
  const rel = path.relative(path.dirname(fromFile), path.join(ROOT, "wirkungsradar")).split(path.sep).join("/");
  return rel ? `${rel}/` : "./";
}

function rootPrefix(fromFile) {
  const rel = path.relative(path.dirname(fromFile), ROOT).split(path.sep).join("/");
  return rel ? `${rel}/` : "./";
}

function shell({ file, title, description, canonical, main }) {
  const base = rootPrefix(file);
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} | Wirkungsökonomie</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_section" content="Debatten-Kompass">
    <meta name="search_type" content="Redaktion">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude></nav>
    </header>
    <main id="inhalt" data-pagefind-body>${main}</main>
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Debatten-Kompass</p><h2>Aufklärung ohne Frame-Verstärkung.</h2><p>Der Debatten-Kompass prüft Aussagen, Narrative und Frames nach Faktenkern, Wirkpfad und demokratischem Aufklärungsnutzen.</p><p><a class="text-link" href="${base}wirkungsradar/">Debatten-Kompass</a> · <a class="text-link" href="${base}wirkungsradar/pruefprozess/">Prüfprozess</a> · <a class="text-link" href="${ACADEMY_NARRATIVE_URL}">Narrativ einreichen</a></p></div><a class="btn btn-primary" href="${base}wirkungsradar/">Debatten-Kompass öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=${JS_VERSION}"></script>
  </body>
</html>`;
}

function radarNav(base = "") {
  const links = [
    ["Antwort finden", `${base}`],
    ["Debattenkarten", `${base}debattenkarten/`],
    ["Narrative", `${base}narrative/`],
    ["Antwort-Playbooks", `${base}antwort-playbooks/`],
    ["Studio", `${base}studio/`],
    ["Narrativ einreichen", ACADEMY_NARRATIVE_URL],
    ["Prüfprozess", `${base}pruefprozess/`],
    ["Methode", `${base}methode/`],
    ["Quellen", `${base}quellen/`],
  ];
  return `<nav class="topic-subnav radar-sprint-nav" aria-label="Debatten-Kompass Navigation" data-search-exclude>${links.map(([label, href]) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).join("")}</nav>`;
}

function formPage(file) {
  const base = rootPrefix(file);
  const main = `<section class="hero radar-page-hero radar-sprint-hero">
  <div>
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Narrativ einreichen</nav>
    <p class="hero-kicker">Redaktionelle Einreichung</p>
    <h1 class="hero-title">Narrativ einreichen</h1>
    <p class="hero-subtitle">Einreichungen laufen geschützt über die Akademie-App mit Discord-Login.</p>
    <p class="radar-sprint-lead">Du landest dort auf einer eigenen Narrativ-Seite, nicht auf der Fragenstrecke. Erst nach dem Login öffnet sich das Formular.</p>
    <p><a class="btn btn-primary" href="${ACADEMY_NARRATIVE_URL}">Zur Akademie-App wechseln</a></p>
  </div>
</section>${radarNav("../")}<section class="section"><div class="community-submission-form-layout">
  <article class="card community-submission-workflow">
    <p class="card-kicker">Warum Akademie-App?</p>
    <h2>Geschützt einreichen statt öffentlich posten.</h2>
    <p>Der Discord-Login schützt die Redaktion vor Spam und verhindert, dass problematische Rohzitate ohne Prüfung öffentlich weiterverbreitet werden.</p>
    <p><a class="btn btn-primary" href="${ACADEMY_NARRATIVE_URL}">Narrativ einreichen</a></p>
  </article>
  <aside class="card community-submission-workflow">
    <p class="card-kicker">Redaktionsworkflow</p>
    <h2>Was geprüft wird.</h2>
    <ol class="clean-list">
      <li>Ist die Aussage relevant genug und verbreitet?</li>
      <li>Gibt es bereits eine ähnliche Debattenkarte?</li>
      <li>Würde Veröffentlichung den Frame verstärken?</li>
      <li>Lässt sich der Wirkpfad für Mensch, Planet und Demokratie sinnvoll erklären?</li>
      <li>Gibt es belastbare Fakten, Quellen und eine ableitbare Antwortstrategie?</li>
    </ol>
    <p><a class="btn btn-secondary" href="../pruefprozess/">Prüfprozess verstehen</a></p>
    <p><a class="text-link" href="${ACADEMY_NARRATIVE_URL}">Akademie-Login öffnen</a></p>
  </aside>
</div></section>`;
  return shell({
    file,
    title: "Narrativ einreichen",
    description: "Zentrales Formular für wirkungsrelevante Aussagen, Narrative, Frames und Behauptungen im Debatten-Kompass.",
    canonical: `${SITE_URL}/wirkungsradar/narrativ-einreichen/`,
    main,
  });
}

function processPage(file) {
  const base = rootPrefix(file);
  const main = `<section class="hero radar-page-hero radar-sprint-hero">
  <div>
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Prüfprozess</nav>
    <p class="hero-kicker">Redaktionelle Prüfung</p>
    <h1 class="hero-title">Wie aus einer Einreichung eine Debattenkarte wird</h1>
    <p class="hero-subtitle">Wir veröffentlichen nicht jede eingereichte Aussage. Manche Narrative würden durch Wiederholung mehr Reichweite gewinnen, als ihre Einordnung Nutzen stiftet.</p>
    <p class="radar-sprint-lead">Deshalb prüfen wir zuerst Wirkungspotenzial, Relevanz, Verbreitung, Schaden und Aufklärungsnutzen.</p>
  </div>
</section>${radarNav("../")}<section class="section"><div class="article-body community-process-body">
  <h2>Was passiert nach einer Einreichung?</h2>
  <p>Eine Einreichung landet nicht automatisch auf der Website. Sie wird redaktionell als Hinweis behandelt. Zuerst wird geprüft, ob es sich um eine konkrete Aussage, ein wiederkehrendes Narrativ, einen Frame, ein Schlagwort oder nur um einen Einzelfall ohne größere Wirkung handelt.</p>
  <h2>Wird alles veröffentlicht?</h2>
  <p>Nein. Der Debatten-Kompass sammelt keine problematischen Originalzitate um ihrer selbst willen. Wenn eine Veröffentlichung den Frame stärker verbreiten würde als die Einordnung Nutzen stiftet, bleibt die Aussage intern oder wird mit einer bestehenden Seite zusammengeführt.</p>
  <h2>Warum manche Narrative nicht veröffentlicht werden</h2>
  <p>Nicht veröffentlicht werden Einreichungen ohne erkennbare Relevanz, ohne prüfbaren Wirkpfad, mit hohem Risiko der Menschenabwertung oder mit sehr ähnlicher bestehender Debattenkarte. Rohzitate, Screenshots und toxische Formulierungen werden besonders zurückhaltend behandelt.</p>
  <h2>Wie Framing-Verstärkung vermieden wird</h2>
  <p>Eine neue Seite entsteht nur, wenn Aufklärung klarer ist als Wiederholung. Deshalb steht nicht der problematische Satz als Spektakel im Zentrum, sondern die Einordnung: Was stimmt, was fehlt, welcher Wirkpfad entsteht, welche bessere Frage hilft und wie kann man antworten, ohne den Frame zu übernehmen?</p>
  <h2>Faktencheck und Folgencheck</h2>
  <p>Ein Faktencheck fragt, ob eine Aussage stimmt. Der Folgencheck fragt zusätzlich: Was macht diese Aussage mit Wahrnehmung, Verantwortung, Handlung und demokratischer Entscheidung? Wirkungsökonomisch zählt beides: Faktenkern und Wirkpfad.</p>
  <h2>Wann eine Debatten-Kompass-Seite entsteht</h2>
  <p>Eine Seite entsteht, wenn die Aussage relevant, verbreitet oder wirkungsstark genug ist, sich von bestehenden Karten unterscheidet, eine belastbare Quellenlage hat und eine faire, klare Reaktion ableitbar ist. Bewertet wird nach Mensch, Planet und Demokratie.</p>
  ${communitySubmissionBlock({ variant: "method", formHref: ACADEMY_NARRATIVE_URL, processHref: "./", methodHref: "../methode/", compassHref: "../", includeProcessLink: false })}
</div></section>`;
  return shell({
    file,
    title: "Prüfprozess im Debatten-Kompass",
    description: "Warum nicht jede Einreichung veröffentlicht wird und wie der Debatten-Kompass Framing-Verstärkung vermeidet.",
    canonical: `${SITE_URL}/wirkungsradar/pruefprozess/`,
    main,
  });
}

function aliasPage(file) {
  const base = rootPrefix(file);
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Narrativ einreichen | Wirkungsökonomie</title>
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0; url=${ACADEMY_NARRATIVE_URL}">
    <link rel="canonical" href="${ACADEMY_NARRATIVE_URL}">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
    <main class="section"><div><article class="card"><p class="card-kicker">Weiterleitung</p><h1>Narrativ einreichen</h1><p>Der Meldeworkflow liegt in der Akademie-App.</p><p><a class="btn btn-primary" href="${ACADEMY_NARRATIVE_URL}">Narrativ einreichen</a></p></article></div></main>
    <script src="${base}assets/js/main.js?v=${JS_VERSION}"></script>
  </body>
</html>`;
}

function shouldReceiveBlock(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  if (!rel.startsWith("wirkungsradar/")) return false;
  if (rel.includes("/embed/card/") || rel.includes("/embed/host/") || rel.includes("/embed/trust/")) return false;
  if (rel === "wirkungsradar/narrativ-einreichen/index.html" || rel === "wirkungsradar/pruefprozess/index.html" || rel === "wirkungsradar/mythos-melden/index.html") return false;
  return (
    rel === "wirkungsradar/index.html" ||
    rel === "wirkungsradar/live/index.html" ||
    rel === "wirkungsradar/debattenkarten/index.html" ||
    rel.startsWith("wirkungsradar/live/") ||
    rel.startsWith("wirkungsradar/detail/") ||
    rel.startsWith("wirkungsradar/narrative/") ||
    rel.startsWith("wirkungsradar/antwort-playbooks/") ||
    rel.startsWith("wirkungsradar/host-playbook/") ||
    rel === "wirkungsradar/methode/index.html"
  );
}

function variantFor(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  if (rel.includes("/antwort-playbooks/") || rel.includes("/host-playbook/")) return "playbook";
  if (rel === "wirkungsradar/methode/index.html") return "method";
  if (rel.startsWith("wirkungsradar/live/") || rel.startsWith("wirkungsradar/detail/") || rel.startsWith("wirkungsradar/narrative/") || rel === "wirkungsradar/live/index.html" || rel === "wirkungsradar/debattenkarten/index.html") return "compact";
  return "default";
}

function normalizeHtml(file) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  const formHref = relDir(file, FORM_ROUTE);
  const processHref = relDir(file, PROCESS_ROUTE);
  const methodHref = relDir(file, path.join(ROOT, "wirkungsradar/methode"));
  const compassHref = relDir(file, path.join(ROOT, "wirkungsradar"));

  html = html
    .replace(/assets\/css\/style\.css\?v=[^"' <)]+/g, `assets/css/style.css?v=${CSS_VERSION}`)
    .replace(/assets\/js\/main\.js\?v=[^"' <)]+/g, `assets/js/main.js?v=${JS_VERSION}`)
    .replace(/Wirkungsradar, Fakten, Folgen, Frames, Psychologie, bessere Antworten, Mythos melden/g, "Debatten-Kompass, Fakten, Folgen, Frames, Psychologie, bessere Antworten, Narrativ einreichen")
    .replace(/Mythen &amp; Narrative/g, "Narrative")
    .replace(/Mythen & Narrative/g, "Narrative")
    .replace(/Mythos melden/g, "Narrativ einreichen")
    .replace(/mythos-melden\//g, "narrativ-einreichen/")
    .replace(/<section class="section sprint5-myth-cta"[\s\S]*?<\/section>\s*/g, "")
    .replace(/<section class="section community-submission-section[\s\S]*?data-community-submission-block[\s\S]*?<\/section>\s*/g, "");

  if (html.includes("radar-sprint-nav")) {
    html = html.replace(/<nav class="topic-subnav radar-sprint-nav"[\s\S]*?<\/nav>/, radarNav(relNavBase(file)));
  }

  if (shouldReceiveBlock(file) && html.includes("</main>")) {
    const block = communitySubmissionBlock({
      variant: variantFor(file),
      formHref,
      processHref,
      methodHref,
      compassHref,
      includeProcessLink: true,
    });
    html = html.replace("</main>", `${block}\n</main>`);
  }

  if (html !== before) {
    fs.writeFileSync(file, html);
    return true;
  }
  return false;
}

function writeSubmissionSchema() {
  const schema = {
    fields: [
      "submission_id",
      "created_at",
      "claim_text",
      "source_url",
      "platform",
      "topic",
      "user_relevance_note",
      "status",
      "review_notes",
      "risk_of_amplification",
      "publication_decision",
      "related_existing_page",
      "created_page_url",
    ],
    transport: {
      route: ACADEMY_NARRATIVE_URL,
      pageType: "narrative_submission",
      source: "debate_compass_narrative",
      moderation_area: "narrativ_queue",
      spamProtection: "Discord-Login der Akademie-Narrativstrecke",
    },
    statuses: [
      "eingereicht",
      "in Prüfung",
      "abgelehnt wegen Frame-Verstärkung",
      "abgelehnt wegen fehlender Relevanz",
      "zusammengeführt mit bestehendem Narrativ",
      "zur Veröffentlichung freigegeben",
      "veröffentlicht",
    ],
    publicationPolicy: "Neue Einreichungen dürfen nicht automatisch veröffentlicht werden.",
    reviewCriteria: [
      "Ist die Aussage relevant genug?",
      "Hat sie Verbreitung oder Wirkungspotenzial?",
      "Gibt es bereits eine ähnliche Seite?",
      "Würde Veröffentlichung den Frame verstärken?",
      "Lässt sich der Wirkpfad sinnvoll erklären?",
      "Gibt es belastbare Fakten- oder Quellenlage?",
      "Ist eine Reaktion oder Antwortstrategie ableitbar?",
    ],
  };
  write(path.join(ROOT, "assets/data/wirkungsradar-community-submission-schema.json"), JSON.stringify(schema, null, 2));
}

write(path.join(FORM_ROUTE, "index.html"), formPage(path.join(FORM_ROUTE, "index.html")));
write(path.join(PROCESS_ROUTE, "index.html"), processPage(path.join(PROCESS_ROUTE, "index.html")));
write(path.join(ROOT, "wirkungsradar/mythos-melden/index.html"), aliasPage(path.join(ROOT, "wirkungsradar/mythos-melden/index.html")));
writeSubmissionSchema();

const changed = listHtml(path.join(ROOT, "wirkungsradar")).filter(normalizeHtml);
console.log(`CommunitySubmissionBlock normalisiert: ${changed.length} Wirkungsradar-Seiten aktualisiert.`);
