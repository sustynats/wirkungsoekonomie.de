import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "data/wirkungsradar/redaktionelle-ueberarbeitung-17.json");
const PUBLIC_BASE = "https://wirkungsoekonomie.de";
const CSS_VERSION = "20260606-nav-cache-fix";

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripOuterQuotes(value) {
  return String(value ?? "").replace(/^["„“]+|["„“]+$/g, "").trim();
}

function normalizeSpaces(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function paragraph(value) {
  const text = normalizeSpaces(value);
  return text ? `<p>${escapeHtml(text)}</p>` : "";
}

function list(items, className = "check-list") {
  const rows = (items ?? []).filter(Boolean);
  if (!rows.length) return "";
  return `<ul class="${className}">${rows.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function sectionShell(id, kicker, title, body, extraClass = "") {
  return `<section class="section ${extraClass}" id="${id}">
        <div>
          <div class="section-header">
            <p class="hero-kicker">${escapeHtml(kicker)}</p>
            <h2>${escapeHtml(title)}</h2>
          </div>
          ${body}
        </div>
      </section>`;
}

function renderToc() {
  const links = [
    ["#host-cockpit", "Behauptung"],
    ["#host-antworten", "Sofortantwort"],
    ["#faktenkern", "Faktenkern"],
    ["#folgencheck", "Folgencheck"],
    ["#loesungspfad", "Wirkpfad"],
    ["#kritische-fragen", "Kritische Fragen"],
    ["#faktenlage", "Faktenlage"],
    ["#quellen", "Quellen"],
  ];
  return `<section class="section debate-toc-section" id="inhaltsverzeichnis" data-debate-toc data-search-exclude>
        <div>
          <article class="card debate-toc-card">
            <p class="card-kicker">Inhaltsverzeichnis</p>
            <nav class="dossier-tab-nav v3-radar-nav" aria-label="Debattenkarte Seitenbereiche">
              ${links.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`).join("")}
            </nav>
          </article>
        </div>
      </section>`;
}

function renderHero(page) {
  const title = escapeHtml(page.title);
  return `<section class="hero radar-page-hero theme-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../../wirkungsradar/">Debatten-Kompass</a> / Debattenkarte</nav>
          <p class="hero-kicker">Debatten-Kompass</p>
          <h1 class="hero-title">${title}</h1>
          <p class="hero-subtitle">${escapeHtml(page.subtitle)}</p>
          <p class="radar-abstract"><strong>Darum geht es:</strong> ${escapeHtml(page.why)}</p>
          <p class="radar-status-line"><span>Status: redaktionell überarbeitet</span><span>Datenstand: ${escapeHtml(page.stand ?? "2026-06-04")}</span><span>Quellen: belegt am Seitenende</span></p>
        </div>
      </section>`;
}

function renderClaim(page) {
  const body = `<article class="v2-cockpit-shell">
          <div class="v2-cockpit-head">
            <p class="hero-kicker">Die Frage / Behauptung</p>
            <h2>Was wird behauptet?</h2>
            <p class="v2-claim-line">Jemand sagt: <strong>${escapeHtml(page.claim)}</strong></p>
          </div>
          <div class="card-grid two">
            <article class="card">
              <p class="card-kicker">Narrativ</p>
              <h3>${escapeHtml(stripOuterQuotes(page.title))}</h3>
              <p>${escapeHtml(page.subtitle)}</p>
            </article>
            <article class="card">
              <p class="card-kicker">Prüflogik</p>
              <h3>Wahrer Kern und Denkfehler trennen.</h3>
              <p>Die Aussage wird nicht nur auf Wahrheit geprüft, sondern auf ihre mögliche Zustandsveränderung: Wahrnehmung, Entscheidung, Rückkopplung.</p>
            </article>
          </div>
        </article>`;
  return `<section class="section debate-claim-section" id="host-cockpit">${body}</section>`;
}

function renderAnswerDetails(page) {
  const short = page.answers?.Kurzantwort || page.shortAnswer;
  const medium = `${page.answers?.["Bessere Frage"] ?? ""} ${short}`.trim();
  const long = page.answers?.["Längere Antwort"] || page.shortAnswer;
  const rows = [
    ["10 Sekunden", "Kurzantwort - 10 Sekunden", short],
    ["30 Sekunden", "Bessere Frage plus Einordnung", medium],
    ["2 Minuten", "Längere Antwort", long],
  ];
  return rows
    .map(
      ([time, title, text], index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""}>
            <summary><span class="radar-answer-time">${escapeHtml(time)}</span><strong>${escapeHtml(title)}</strong></summary>
            <p>${escapeHtml(text)}</p>
          </details>`,
    )
    .join("");
}

function renderAnswers(page) {
  const goodImage =
    page.answers?.["Ein gutes Bild"] ||
    page.impactPath?.Gegensteuerung ||
    page.shortAnswer;
  return `<section class="section debate-immediate-answer" id="host-antworten">
        <div>
          <article class="v2-cockpit-shell">
            <div class="section-header">
              <p class="hero-kicker">Sofortantwort</p>
              <h2>So antwortest du.</h2>
              <p>Wenn du gerade in der Debatte bist.</p>
            </div>
            <div class="radar-answer-list">
              ${renderAnswerDetails(page)}
            </div>
            <div class="card-grid two">
              <article class="card">
                <p class="card-kicker">Nicht so</p>
                ${paragraph(page.answers?.["Nicht so"])}
              </article>
              <article class="card">
                <p class="card-kicker">Die bessere Frage</p>
                <h3>${escapeHtml(page.answers?.["Bessere Frage"] ?? "")}</h3>
              </article>
              <article class="card">
                <p class="card-kicker">Ein gutes Bild</p>
                <h3>${escapeHtml(page.subtitle)}</h3>
                <p>${escapeHtml(goodImage)}</p>
              </article>
            </div>
          </article>
        </div>
      </section>`;
}

function renderFacts(page) {
  const cards = page.facts
    .map(
      (fact, index) => `<article class="card">
            <p class="card-kicker">Fakt ${index + 1}</p>
            <p>${escapeHtml(fact)}</p>
          </article>`,
    )
    .join("");
  return sectionShell("faktenkern", "Faktenkern", "Was konkret geprüft werden muss.", `<div class="card-grid two">${cards}</div>`);
}

function renderConsequences(page) {
  const keys = ["Wirkung 1. Ordnung", "Wirkung 2. Ordnung", "Wirkung 3. Ordnung", "Mensch", "Planet", "Demokratie"];
  const cards = keys
    .map(
      (key) => `<article class="card">
            <p class="card-kicker">${escapeHtml(key)}</p>
            <p>${escapeHtml(page.consequences?.[key] ?? "")}</p>
          </article>`,
    )
    .join("");
  return sectionShell("folgencheck", "Folgencheck", "Was bewirkt dieses Narrativ?", `<div class="card-grid three">${cards}</div>`);
}

function renderImpactPath(page) {
  const keys = ["Auslöser", "Wirkungspotenzial", "Wirkmechanismus", "Zustandsveränderung", "Rückkopplung", "Gegensteuerung"];
  const rows = keys
    .map(
      (key) => `<li>
            <strong>${escapeHtml(key)}</strong>
            <span>${escapeHtml(page.impactPath?.[key] ?? "")}</span>
          </li>`,
    )
    .join("");
  return sectionShell(
    "loesungspfad",
    "Wirkpfad",
    "Vom Satz zur Zustandsveränderung.",
    `<article class="card"><ol class="impact-path-list">${rows}</ol></article>`,
  );
}

function renderCriticalQuestions(page) {
  return sectionShell(
    "kritische-fragen",
    "Kritische Fragen",
    "Was berechtigt kritisch gefragt werden darf.",
    `<article class="card">${list(page.criticalQuestions)}</article>`,
  );
}

function renderFactsLayer(page) {
  return `<section class="section" id="faktenlage" data-v3-facts-layer>
        <div>
          <div class="section-header">
            <p class="hero-kicker">Faktenlage</p>
            <h2>Was bleibt nach der Prüfung stehen?</h2>
            <p>Die Quellen stehen erst im nächsten Abschnitt. Hier wird die fachliche Einordnung zusammengezogen.</p>
          </div>
          <article class="card">
            <p>${escapeHtml(page.shortAnswer)}</p>
            ${paragraph(page.woekEinordnung)}
          </article>
        </div>
      </section>`;
}

function renderSources(page) {
  const rows = page.sources
    .map((source) => {
      const link = source.url
        ? `<a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener">Quelle öffnen</a>`
        : `<span class="source-link is-muted">Interne Referenz im Projektbestand</span>`;
      return `<article class="card source-card">
            <p class="card-kicker">Quelle → Belegzweck</p>
            <h3>${escapeHtml(source.label)}</h3>
            <p>${escapeHtml(source.proof)}</p>
            ${link}
          </article>`;
    })
    .join("");
  return sectionShell("quellen", "Quellen", "Welche Quelle welchen Fakt belegt.", `<div class="card-grid two">${rows}</div>`);
}

function renderSubmission() {
  return `<section class="section" id="narrativ-einreichen" data-search-exclude>
        <div>
          <article class="card">
            <p class="hero-kicker">Narrativ einreichen</p>
            <h2>Fehlt eine Aussage?</h2>
            <p>Neue Vorschläge laufen über die Akademie-Redaktion und werden vor Veröffentlichung geprüft.</p>
            <p><a class="btn btn-primary" href="../../../wirkungsradar/narrativ-einreichen/">Narrativ einreichen</a></p>
          </article>
        </div>
      </section>`;
}

function renderMain(page) {
  return `<main id="inhalt" data-pagefind-body>
      ${renderHero(page)}
      ${renderToc()}
      ${renderClaim(page)}
      ${renderAnswers(page)}
      ${renderFacts(page)}
      ${renderConsequences(page)}
      ${renderImpactPath(page)}
      ${renderCriticalQuestions(page)}
      ${renderFactsLayer(page)}
      ${renderSources(page)}
      ${renderSubmission()}
    </main>`;
}

function replaceOrInsert(pattern, replacement, html) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html;
}

function updateHead(html, page) {
  const title = `${page.title} | Debatten-Kompass | Wirkungsökonomie`;
  const description = `${page.title}: ${page.subtitle}. Redaktionell geprüfte Kurzantwort, Faktenkern, Folgencheck, Wirkpfad und Quellen.`;
  const canonical = `${PUBLIC_BASE}/wirkungsradar/live/${page.canonicalSlug}/`;
  let next = html;
  next = replaceOrInsert(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`, next);
  next = replaceOrInsert(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapeHtml(description)}">`, next);
  next = replaceOrInsert(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${escapeHtml(canonical)}">`, next);
  next = next.replace(/assets\/css\/style\.css\?v=[^"]+/g, `assets/css/style.css?v=${CSS_VERSION}`);
  return next;
}

function applyPage(page, stand) {
  const target = path.join(ROOT, "wirkungsradar/live", page.canonicalSlug, "index.html");
  if (!fs.existsSync(target)) {
    throw new Error(`Zielseite fehlt: ${path.relative(ROOT, target)}`);
  }
  const pageWithStand = { ...page, stand };
  const html = fs.readFileSync(target, "utf8");
  const main = renderMain(pageWithStand);
  if (!/<main id="inhalt"[\s\S]*?<\/main>/i.test(html)) {
    throw new Error(`Kein main#inhalt gefunden: ${path.relative(ROOT, target)}`);
  }
  let next = html.replace(/<main id="inhalt"[\s\S]*?<\/main>/i, main);
  next = updateHead(next, pageWithStand);
  fs.writeFileSync(target, next);
  return path.relative(ROOT, target);
}

const data = readJson(DATA_FILE);
const written = data.pages.map((page) => applyPage(page, data.stand));

console.log(`Redaktionelle Wirkungsradar-Überarbeitung angewendet: ${written.length} Seiten.`);
for (const file of written) console.log(`- ${file}`);
