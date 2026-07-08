import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Grundlagenbereich "Wirkungswissenschaften": Hub /wirkungswissenschaften/ +
// Unterseiten (Definition, Wirkungsforschung, Wirkungsökonomie, Begriffssystem,
// Methodik, Publikationen, FAQ). Volles Site-Chrome; alle öffentlich (index,follow).
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const CSS_VERSION = "20260612-mobile-table-fix";
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const headerTemplate = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");

const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const navMatch = (item) => (item.match || [item.href]).join("|");
const navLink = (item, base) => `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
const footerGroup = (g, base) => `<div class="footer-nav-group">
      <h3>${esc(g.title)}</h3>
      <div class="footer-nav-links">
${g.items.map((i) => `          ${navLink(i, base)}`).join("\n")}
      </div>
    </div>`;
const renderHeader = (base) => headerTemplate.replaceAll("{{BASE}}", base);
const renderFooter = (base) => footerTemplate.replaceAll("{{BASE}}", base)
  .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((g) => footerGroup(g, base)).join("\n    "))
  .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((i) => navLink(i, base)).join("\n"));

// Depth: /wirkungswissenschaften/ -> "../"; Unterseiten -> "../../"
function page({ rel, title, metaTitle, description, section, base, body }) {
  const route = `/${rel.replace(/index\.html$/, "")}`;
  const canonical = `${SITE}${route}`;
  const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(metaTitle)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title)}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="${esc(section)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
${renderHeader(base)}
    <main>
${body}
    </main>
${renderFooter(base)}
    <script src="${base}assets/js/main.js?v=${CSS_VERSION}"></script>
  </body>
</html>
`;
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  return rel;
}

// --- Wiederverwendbare Bausteine --------------------------------------------
const HUB = "wirkungswissenschaften/";
const JOURNAL = "blog/wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie/";
const DOSSIER = "dokumente/dossier-wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie/";

function breadcrumb(base, trail) {
  return `        <nav class="breadcrumb">${trail.map(([h, l]) => h ? `<a href="${base}${h}">${esc(l)}</a>` : esc(l)).join(" / ")}</nav>`;
}
function cards(items) {
  return `        <section class="term-section-grid">
${items.map((c) => `          <section class="term-section-card">
            ${c.eyebrow ? `<p class="section-eyebrow">${esc(c.eyebrow)}</p>` : ""}
            <h2>${esc(c.h)}</h2>
            <p>${c.p}</p>
            ${c.href ? `<p><a class="text-link" href="${c.href}">${esc(c.link || "Mehr")} →</a></p>` : ""}
          </section>`).join("\n")}
        </section>`;
}
function chips(base, items) {
  return `        <section class="term-link-section">
          <div><p class="section-eyebrow">Begriffswelt</p><h2>Zentrale Begriffe</h2></div>
          <div class="term-chip-row">
${items.map(([h, l]) => `            <a class="term-chip" href="${base}${h}">${esc(l)}</a>`).join("\n")}
          </div>
        </section>`;
}
function prose(heading, eyebrow, paras) {
  return `        <section class="term-summary-card">
          ${eyebrow ? `<p class="section-eyebrow">${esc(eyebrow)}</p>` : ""}
          ${heading ? `<h2>${esc(heading)}</h2>` : ""}
${paras.map((p) => `          <p>${p}</p>`).join("\n")}
        </section>`;
}
function subnav(base, current) {
  const items = [
    ["wirkungswissenschaften/", "Überblick"],
    ["wirkungswissenschaften/definition/", "Definition"],
    ["wirkungswissenschaften/wirkungsforschung/", "Wirkungsforschung"],
    ["wirkungswissenschaften/wirkungsoekonomie/", "Wirkungsökonomie"],
    ["wirkungswissenschaften/begriffssystem/", "Begriffssystem"],
    ["wirkungswissenschaften/methodik/", "Methodik"],
    ["wirkungswissenschaften/publikationen/", "Publikationen"],
    ["wirkungswissenschaften/faq/", "FAQ"],
  ];
  return `        <nav class="term-chip-row" aria-label="Bereich Wirkungswissenschaften">
${items.map(([h, l]) => h === current
    ? `          <span class="term-chip term-chip--active" aria-current="page">${esc(l)}</span>`
    : `          <a class="term-chip" href="${base}${h}">${esc(l)}</a>`).join("\n")}
        </nav>`;
}

// --- SVG-Grafiken (barrierearm: role=img + <title>/<desc>) -------------------
const SVG_PROCESS = `<figure class="wiwi-figure">
          <svg viewBox="0 0 900 130" role="img" aria-labelledby="proc-t proc-d" class="wiwi-svg">
            <title id="proc-t">Der Wirkungsprozess</title>
            <desc id="proc-d">Von Auslöser über Wirkungspotenzial, Wirkungspfad, tatsächliche Wirkung, Bewertung und Netto-Wirkung bis zur Rückkopplung.</desc>
            ${["Auslöser", "Potenzial", "Pfad", "Wirkung", "Bewertung", "Netto-Wirkung", "Rückkopplung"].map((t, i) => {
              const x = 12 + i * 126;
              return `<g><rect x="${x}" y="40" width="112" height="46" rx="9" fill="${i === 5 ? "#1B7A4B" : "#13335B"}"></rect><text x="${x + 56}" y="68" text-anchor="middle" fill="#ffffff" font-size="13" font-family="system-ui,sans-serif">${t}</text>${i < 6 ? `<path d="M${x + 112} 63 l14 0" stroke="#C9A227" stroke-width="3" marker-end="url(#ah)"></path>` : ""}</g>`;
            }).join("")}
            <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="#C9A227"></path></marker></defs>
          </svg>
          <figcaption>Der Wirkungsprozess: von der Möglichkeit zur rückgekoppelten, bewerteten Wirkung.</figcaption>
        </figure>`;

const SVG_ROLES = `<figure class="wiwi-figure">
          <svg viewBox="0 0 900 150" role="img" aria-labelledby="roles-t roles-d" class="wiwi-svg">
            <title id="roles-t">Rahmen, Methode, Steuerungsdisziplin</title>
            <desc id="roles-d">Wirkungswissenschaften sind der Rahmen, Wirkungsforschung die Methode, Wirkungsökonomie die Steuerungsdisziplin.</desc>
            ${[["Wirkungswissenschaften", "Rahmen", "#13335B"], ["Wirkungsforschung", "Methode", "#1B7A4B"], ["Wirkungsökonomie", "Steuerungsdisziplin", "#C9A227"]].map(([t, s, c], i) => {
              const x = 20 + i * 300;
              return `<g><rect x="${x}" y="30" width="260" height="86" rx="12" fill="${c}"></rect><text x="${x + 130}" y="70" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" font-family="system-ui,sans-serif">${t}</text><text x="${x + 130}" y="94" text-anchor="middle" fill="#ffffffcc" font-size="13" font-family="system-ui,sans-serif">= ${s}</text></g>`;
            }).join("")}
          </svg>
          <figcaption>Drei Ebenen, eine Ordnung: Rahmen, Methode und ausgearbeitete Steuerungsdisziplin.</figcaption>
        </figure>`;

const SVG_DISCIPLINES = `<figure class="wiwi-figure">
          <svg viewBox="0 0 900 320" role="img" aria-labelledby="disc-t disc-d" class="wiwi-svg">
            <title id="disc-t">Disziplinenordnung der Wirkungswissenschaften</title>
            <desc id="disc-d">Die Wirkungswissenschaften bilden den Oberrahmen über Wirkungsforschung, Wirkungsökonomie, Wirkungsrecht, Wirkungscontrolling, Medienwirkungsanalyse, Demokratiewirkung, Wirkungsgovernance und Wirkungskompetenz.</desc>
            <rect x="300" y="14" width="300" height="48" rx="10" fill="#13335B"></rect>
            <text x="450" y="43" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" font-family="system-ui,sans-serif">Wirkungswissenschaften</text>
            ${["Wirkungsforschung", "Wirkungsökonomie", "Wirkungsrecht", "Wirkungscontrolling", "Medienwirkungsanalyse", "Demokratiewirkung", "Wirkungsgovernance", "Wirkungskompetenz"].map((t, i) => {
              const col = i % 4, row = Math.floor(i / 4);
              const x = 24 + col * 218, y = 120 + row * 90;
              return `<line x1="450" y1="62" x2="${x + 95}" y2="${y}" stroke="#C9A227" stroke-width="2"></line><rect x="${x}" y="${y}" width="190" height="60" rx="9" fill="#ffffff" stroke="#13335B" stroke-width="1.5"></rect><text x="${x + 95}" y="${y + 35}" text-anchor="middle" fill="#13335B" font-size="13" font-family="system-ui,sans-serif">${t}</text>`;
            }).join("")}
          </svg>
          <figcaption>Die Wirkungswissenschaften als Oberrahmen mit ihren Spezialbereichen.</figcaption>
        </figure>`;

function publicationsBlock(base) {
  return `        <section class="term-link-section">
          <div><p class="section-eyebrow">Grundlagen &amp; Publikationen</p><h2>Dossier, Journalbeitrag und Glossar</h2></div>
          <div class="card-grid">
            <article class="info-card">
              <h3>Dossier</h3>
              <p class="card-summary">Systematische Einordnung der Disziplinen, Begriffe und Wirkungsarchitektur – die Grundlage für Website, Glossar und Akademie.</p>
              <p><a class="btn btn-primary" href="${base}${DOSSIER}">Dossier lesen</a></p>
            </article>
            <article class="info-card">
              <h3>Journalbeitrag</h3>
              <p class="card-summary">„Wirkungswissenschaften als neuer Bezugsrahmen" – konzeptioneller Beitrag zur wissenschaftlichen Einordnung im Kontext der Wirkungsökonomie.</p>
              <p><a class="btn btn-primary" href="${base}${JOURNAL}">Journalbeitrag lesen</a></p>
            </article>
            <article class="info-card">
              <h3>Glossar</h3>
              <p class="card-summary">Zentrale Begriffe: Wirkung, Wirkstoff, Wirkungspotenzial, Wirkungspfad, Wirkungsgrad, Netto-Wirkung und Wirkungsarchitektur.</p>
              <p><a class="btn btn-secondary" href="${base}begriffe/">Zum Glossar</a></p>
            </article>
          </div>
        </section>`;
}

// ============================ HUB (Überblick) ================================
function buildHub() {
  const base = "../";
  const body = `      <article class="article-shell">
${breadcrumb(base, [["index.html", "Start"], ["verstehen/", "Verstehen"], [null, "Wirkungswissenschaften"]])}
        <header class="term-detail-hero">
          <p class="hero-kicker">Grundlagenbereich · Verstehen</p>
          <h1>Wirkungswissenschaften</h1>
          <p class="lead">Der wissenschaftliche Rahmen hinter der Wirkungsökonomie.</p>
          <p>Wirkungswissenschaften untersuchen, wie Handlungen, Unterlassen, Produkte, Gesetze, Kapitalflüsse, Technologien, Sprache, Institutionen und Medien reale Zustände verändern. Im Rahmen der von Natalie Weber begründeten Wirkungsökonomie werden sie zu einem inter- und transdisziplinären Bezugsrahmen für Wirkung auf Mensch, Planet und Demokratie.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${base}${DOSSIER}">Dossier lesen</a>
            <a class="btn btn-secondary" href="${base}${JOURNAL}">Journalbeitrag lesen</a>
            <a class="btn btn-ghost" href="${base}wirkungswissenschaften/begriffssystem/">Zum Begriffssystem</a>
          </div>
        </header>
${subnav(base, "wirkungswissenschaften/")}

        <section class="content-band"><h2>Die Grundunterscheidung</h2></section>
${cards([
    { eyebrow: "Der Oberrahmen", h: "Wirkungswissenschaften", p: "Wirkungswissenschaften fragen, wie Zustände entstehen, verändert, stabilisiert oder destabilisiert werden — und wie diese Wirkung verantwortbar bewertet und rückgekoppelt werden kann.", href: `${base}wirkungswissenschaften/definition/`, link: "Definition" },
    { eyebrow: "Die methodische Teildisziplin", h: "Wirkungsforschung", p: "Wirkungsforschung untersucht Wirkungen, Wirkungspotenziale, Wirkmechanismen, Nebenwirkungen, Wechselwirkungen und Transformationsbeiträge empirisch, theoretisch und systemisch.", href: `${base}wirkungswissenschaften/wirkungsforschung/`, link: "Wirkungsforschung" },
    { eyebrow: "Die erste ausgearbeitete Steuerungsdisziplin", h: "Wirkungsökonomie", p: "Die Wirkungsökonomie überführt Wirkung in Preise, Steuern, Kapital, Unternehmen, Politik, Recht, Medien und demokratische Rückkopplung.", href: `${base}wirkungswissenschaften/wirkungsoekonomie/`, link: "Wirkungsökonomie" },
  ])}

        <section class="content-band">
          <h2>Rahmen, Methode, Steuerungsdisziplin</h2>
          ${SVG_ROLES}
        </section>

${prose("Was Natalie Weber neu begründet", "Urheberschaft, wissenschaftlich sauber", [
    "Wirkung wurde auch vor der Wirkungsökonomie untersucht: in Evaluation, Wirkungsforschung, Impact Assessment, Technikfolgenabschätzung, Nachhaltigkeitswissenschaft und Transformationsforschung. Neu ist jedoch der systemische Rahmen, in dem Wirkung nicht nur Gegenstand nachträglicher Bewertung ist, sondern zur Leitkategorie gesellschaftlicher Erkenntnis, Verantwortung und Steuerung wird.",
    "Natalie Weber begründet mit der Wirkungsökonomie einen Rahmen, in dem Wirkungsforschung, Wirkungswissenschaften und wirkungsorientierte Steuerung zusammengeführt werden. Wirkung wird dadurch nicht nur gemessen, sondern in Entscheidungs-, Preis-, Steuer-, Kapital-, Rechts-, Medien- und Demokratieprozesse rückgekoppelt.",
    "<strong>Kurzformel:</strong> Wirkungsforschung fragt, ob und wie etwas wirkt. Wirkungswissenschaften fragen, wie Wirkung als Grundkategorie gesellschaftlicher Realität verstanden wird. Wirkungsökonomie fragt, wie Wirtschaft, Kapital, Staat und Gesellschaft gebaut sein müssen, damit positive Netto-Wirkung für Mensch, Planet und Demokratie entscheidungsrelevant wird.",
  ])}

        <section class="content-band">
          <h2>Vom Auslöser zur Wirkungsarchitektur</h2>
          <p>Die Wirkungswissenschaften unterscheiden zwischen möglicher, tatsächlicher, bewerteter und rückgekoppelter Wirkung. So wird verhindert, dass Absicht, Image, Output oder Symbolik mit realer Zustandsveränderung verwechselt werden.</p>
          ${SVG_PROCESS}
        </section>

${chips(base, [
    ["begriffe/wirkung/", "Wirkung"], ["begriffe/wirkstoff/", "Wirkstoff"], ["begriffe/wirkungspotenzial/", "Wirkungspotenzial"],
    ["begriffe/wirkmechanismus/", "Wirkmechanismus"], ["begriffe/wirkpfad/", "Wirkungspfad"], ["begriffe/wirkungsraum/", "Wirkungsraum"],
    ["begriffe/netto-wirkung/", "Netto-Wirkung"], ["begriffe/transformationswirkung/", "Transformationswirkung"], ["begriffe/wirkungsgrad/", "Wirkungsgrad"],
    ["begriffe/wirkungsrueckkopplung/", "Wirkungsrückkopplung"], ["begriffe/wirkungsarchitektur/", "Wirkungsarchitektur"],
  ])}

${publicationsBlock(base)}

${prose("Anschluss an bestehende Forschung", "Kein luftleerer Raum", [
    "Die Wirkungswissenschaften und die Wirkungsökonomie entstehen nicht im luftleeren Raum. Sie schließen an bestehende Felder an: Wirkungsforschung, Evaluation, Impact Measurement, Impact Assessment, Nachhaltigkeitswissenschaft, Transformationsforschung, Systemtheorie, Medienwirkungsforschung, Technikfolgenabschätzung und Governance-Forschung.",
    "Der neue Beitrag liegt darin, diese verstreuten Ansätze in einen gemeinsamen Rahmen zu stellen. Wirkung wird nicht nur untersucht, sondern zur Leitkategorie gesellschaftlicher Erkenntnis, Bewertung und Steuerung weiterentwickelt.",
  ])}

${prose("Schutzlinien", "Rote Linie", [
    "Die Wirkungswissenschaften bewerten keine Menschen als Personen. Sie untersuchen Wirkungen von Handlungen, Produkten, Strukturen, Institutionen, Kapitalflüssen, Technologien, Kommunikation und Entscheidungen.",
    "Personenbewertung ist eine rote Linie. Ziel ist nicht Kontrolle, sondern bessere Rückkopplung: sichtbar machen, welche Folgen entstehen, wo Risiken liegen und wie positive Netto-Wirkung gestärkt werden kann.",
  ])}
      </article>`;
  return page({
    rel: "wirkungswissenschaften/index.html",
    title: "Wirkungswissenschaften",
    metaTitle: "Wirkungswissenschaften | Der wissenschaftliche Rahmen der Wirkungsökonomie",
    description: "Wirkungswissenschaften untersuchen, wie Handlungen, Produkte, Gesetze, Kapitalflüsse, Technologien, Sprache und Institutionen reale Zustände verändern. Der von Natalie Weber im Kontext der Wirkungsökonomie begründete Rahmen verbindet Wirkungsforschung, Evaluation, Nachhaltigkeitswissenschaft und systemische Rückkopplung.",
    section: "Verstehen", base, body,
  });
}

// ============================ Unterseiten ====================================
function subPage({ slug, title, metaTitle, description, kicker, lead, intro, body }) {
  const base = "../../";
  const current = `wirkungswissenschaften/${slug}/`;
  const full = `      <article class="article-shell">
${breadcrumb(base, [["index.html", "Start"], ["wirkungswissenschaften/", "Wirkungswissenschaften"], [null, title]])}
        <header class="term-detail-hero">
          <p class="hero-kicker">${esc(kicker)}</p>
          <h1>${esc(title)}</h1>
          <p class="lead">${esc(lead)}</p>
${intro ? `          <p>${intro}</p>` : ""}
        </header>
${subnav(base, current)}
${body(base)}
        <section class="term-link-section">
          <div><p class="section-eyebrow">Weiterlesen</p><h2>Im Bereich Wirkungswissenschaften</h2></div>
          <div class="term-chip-row">
            <a class="term-chip" href="${base}${DOSSIER}">Dossier</a>
            <a class="term-chip" href="${base}${JOURNAL}">Journalbeitrag</a>
            <a class="term-chip" href="${base}begriffe/">Glossar</a>
            <a class="term-chip" href="${base}wirkungswissenschaften/">Überblick</a>
          </div>
        </section>
      </article>`;
  return page({ rel: `wirkungswissenschaften/${slug}/index.html`, title, metaTitle, description, section: "Verstehen", base, body: full });
}

function buildSubPages() {
  const out = [];
  out.push(subPage({
    slug: "definition", title: "Definition der Wirkungswissenschaften",
    metaTitle: "Definition | Wirkungswissenschaften", kicker: "Grundlagen",
    description: "Wirkungswissenschaften sind der von Natalie Weber im Kontext der Wirkungsökonomie begründete inter- und transdisziplinäre Rahmen, der Wirkung als tatsächliche Zustandsveränderung untersucht, bewertet und rückkoppelt.",
    lead: "Was Wirkungswissenschaften sind – und wie sie sich von Wirkungsforschung, Impact Measurement und Nachhaltigkeitswissenschaft unterscheiden.",
    intro: "",
    body: (base) => `${prose("", "Kerndefinition", [
      "Wirkungswissenschaften bezeichnen den von Natalie Weber im Kontext der Wirkungsökonomie begründeten inter- und transdisziplinären Wissenschaftsrahmen, der Wirkung als tatsächliche Veränderung von Zuständen untersucht, bewertet und in gesellschaftliche Lern-, Entscheidungs- und Steuerungsprozesse rückkoppelt.",
      "Sie führen verstreute Ansätze der Wirkungsforschung, Evaluation, Nachhaltigkeitswissenschaft, Impact-Messung, Folgenabschätzung, Systemtheorie und Transformationsforschung in einer gemeinsamen Leitkategorie zusammen: Wirkung für Mensch, Planet und Demokratie.",
    ])}
${cards([
      { eyebrow: "Abgrenzung", h: "Nicht nur Wirkungsforschung", p: "Wirkungsforschung ist die methodische Teildisziplin. Die Wirkungswissenschaften sind der übergreifende Rahmen, der Erkenntnis, Bewertung und Rückkopplung verbindet." },
      { eyebrow: "Abgrenzung", h: "Mehr als Impact Measurement", p: "Impact Measurement misst einzelne Wirkungen. Die Wirkungswissenschaften fragen zusätzlich, wie Wirkung bewertet, gewichtet und in Entscheidungen zurückgeführt wird." },
      { eyebrow: "Referenzrahmen", h: "Mensch, Planet, Demokratie", p: "Positive Wirkung wird an Mensch, Planet und Demokratie sowie an SDGs und SDG+ eingeordnet – nicht an Kapitalrendite allein." },
    ])}
${SVG_DISCIPLINES}`,
  }));

  out.push(subPage({
    slug: "wirkungsforschung", title: "Wirkungsforschung",
    metaTitle: "Wirkungsforschung | Wirkungswissenschaften", kicker: "Methodische Teildisziplin",
    description: "Wirkungsforschung ist innerhalb der Wirkungswissenschaften die methodische Teildisziplin – von Natalie Weber von einer nachträglichen Evaluationspraxis zur voraus-, begleit- und rückkoppelnden systemischen Wirkungsforschung erweitert.",
    lead: "Wirkungsforschung untersucht Wirkungen, Wirkungspotenziale, Wirkmechanismen, Neben- und Wechselwirkungen, Wirkungsrisiken und Transformationsbeiträge.",
    intro: "",
    body: (base) => `${prose("", "Kerndefinition", [
      "Wirkungsforschung ist innerhalb der Wirkungswissenschaften die methodische Teildisziplin, die Wirkungen, Wirkungspotenziale, Wirkmechanismen, Nebenwirkungen, Wechselwirkungen, Wirkungsrisiken und Transformationsbeiträge empirisch, theoretisch und systemisch untersucht.",
      "In der Weiterentwicklung durch Natalie Weber wird Wirkungsforschung von einer überwiegend nachträglichen Evaluationspraxis zu einer voraus-, begleit- und rückkoppelnden Forschungsform erweitert.",
    ])}
${cards([
      { eyebrow: "Vorher", h: "Klassische Wirkungsforschung", p: "Evaluation, Impact Assessment und Wirkungsmessung liefern wichtige Methoden – überwiegend als nachträgliche Bewertung einzelner Programme." },
      { eyebrow: "Grenze", h: "Zu punktuell, zu spät", p: "Einzelbefunde bleiben oft ohne systemischen Rahmen, ohne Rückkopplung und ohne Schutz vor Scheinkausalität und Wirkungssimulation." },
      { eyebrow: "Neu", h: "Systemische Wirkungsforschung", p: "Voraus-, begleit- und rückkoppelnd: Sie fragt, wie Wirkung entsteht, wie sie plausibel nachgewiesen, begrenzt, bewertet und in künftige Entscheidungen zurückgeführt wird." },
    ])}
${prose("Methodischer Anschluss", "", [
      "Zum Kanon gehören Theory of Change, Contribution Analysis, Wirkpfade, Indikatoren und Scorecards, Datenqualität und Unsicherheitsangaben – ausführlich auf der Seite <a class=\"text-link\" href=\"" + base + "wirkungswissenschaften/methodik/\">Methodik</a>.",
    ])}`,
  }));

  out.push(subPage({
    slug: "wirkungsoekonomie", title: "Wirkungsökonomie als Steuerungsdisziplin",
    metaTitle: "Wirkungsökonomie | Wirkungswissenschaften", kicker: "Erste ausgearbeitete Steuerungsdisziplin",
    description: "Die Wirkungsökonomie ist die von Natalie Weber begründete erste ausgearbeitete Steuerungs- und Ordnungsdisziplin der Wirkungswissenschaften – sie überführt Wirkung in Preise, Steuern, Kapital und Governance.",
    lead: "Wie Märkte, Preise, Steuern, Kapital und öffentliche Entscheidungen so gestaltet werden, dass positive Netto-Wirkung entscheidungsrelevant wird.",
    intro: "",
    body: (base) => `${prose("", "Kerndefinition", [
      "Die Wirkungsökonomie ist die von Natalie Weber begründete erste ausgearbeitete Steuerungs- und Ordnungsdisziplin der Wirkungswissenschaften. Sie untersucht nicht nur, welche Wirkungen wirtschaftliche Aktivitäten erzeugen, sondern wie Märkte, Preise, Steuern, Kapital, Unternehmen und öffentliche Entscheidungen so gestaltet werden können, dass positive Netto-Wirkung für Mensch, Planet und Demokratie entscheidungsrelevant wird.",
    ])}
${cards([
      { eyebrow: "Prinzip", h: "Wirkung statt Kapital", p: "Kapital bleibt Werkzeug, Wirkung wird Kompass. Wirtschaft wird als Wirkungssystem verstanden.", href: `${base}verstehen/`, link: "Modell verstehen" },
      { eyebrow: "Werkzeuge", h: "Von Daten zu Preisen", p: "WÖk-IDs, Scorecards, Netto-Wirkungs-Index und T-SROI übersetzen Wirkungsdaten in Preise, Steuern und Kapitalzugang.", href: `${base}wirkungssteuerung/`, link: "Wirkungssteuerung" },
      { eyebrow: "Abgrenzung", h: "Über ESG, SROI, Donut hinaus", p: "Die Wirkungsökonomie bleibt nicht bei Berichtspflichten oder Einzelkennzahlen stehen, sondern koppelt Wirkung in Entscheidungen zurück." },
    ])}`,
  }));

  out.push(subPage({
    slug: "begriffssystem", title: "Begriffssystem der Wirkungswissenschaften",
    metaTitle: "Begriffssystem | Wirkungswissenschaften", kicker: "Glossarbasis",
    description: "Das systemische Begriffssystem der Wirkungswissenschaften – vom Auslöser über Wirkungspotenzial und Wirkungspfad bis zur Wirkungsarchitektur.",
    lead: "Wirkungswissenschaften brauchen eine präzise Sprache. Die zentralen Begriffe – systemisch geordnet.",
    intro: "",
    body: (base) => {
      const terms = [
        ["wirkung", "Wirkung", "Die tatsächliche Veränderung von Zuständen – positiv, negativ oder neutral, immer mit Bezugspunkt."],
        ["wirkstoff", "Wirkstoff", "Didaktische Analogie für einen Auslöser mit Wirkungspotenzial. Nicht selbst Wirkung, sondern das, was Wirkung ermöglicht."],
        ["wirkungspotenzial", "Wirkungspotenzial", "Die Möglichkeit, dass eine Handlung, ein Produkt, ein Gesetz oder ein Kapitalfluss Wirkung entfaltet – noch keine eingetretene Wirkung."],
        ["wirkungsrisiko", "Wirkungsrisiko", "Die Möglichkeit negativer, destabilisierender oder unbeabsichtigter Wirkungen."],
        ["wirkmechanismus", "Wirkmechanismus", "Wie eine Wirkung entstehen soll oder kann."],
        ["wirkpfad", "Wirkungspfad", "Der plausible Weg vom Auslöser über Wirkmechanismus, Wirkungsraum und Nebenwirkungen zur Zustandsveränderung."],
        ["wirkungsraum", "Wirkungsraum", "Der Bereich, in dem eine Handlung, ein Produkt oder Kommunikation Folgen entfaltet."],
        ["wirkungsbewertung", "Wirkungsbewertung", "Die Einordnung einer Zustandsveränderung an Mensch, Planet und Demokratie sowie an SDGs und SDG+."],
        ["netto-wirkung", "Netto-Wirkung", "Die zusammenführende Bewertung positiver und negativer Wirkungen unter Wirkungsgrenzen und Nichtkompensation."],
        ["wirkungsgrad", "Wirkungsgrad", "Das Verhältnis von eingesetzten Ressourcen und Aktivität zu tatsächlich positiver Netto-Wirkung – Wirkleistung statt Scheinleistung."],
        ["transformationswirkung", "Transformationswirkung", "Die Veränderung von Systemlogiken, Standards, Anreizen, Infrastrukturen oder Handlungspfaden."],
        ["wirkungsrueckkopplung", "Wirkungsrückkopplung", "Der Lernprozess, durch den bewertete Wirkung in künftige Entscheidungen, Regeln und Anreize zurückfließt."],
        ["wirkungsarchitektur", "Wirkungsarchitektur", "Das Gesamtsystem aus Daten, Begriffen, Methoden, Institutionen, Regeln, Schutzlinien und Rückkopplungen."],
      ];
      return `        <p style="margin:0 0 1rem">Jeder Begriff ist im <a class="text-link" href="${base}begriffe/">Glossar der Wirkungsökonomie</a> ausführlich definiert.</p>
        <dl class="wiwi-glossary">
${terms.map(([s, t, d]) => `          <div class="wiwi-term"><dt><a href="${base}begriffe/${s}/">${esc(t)}</a></dt><dd>${esc(d)}</dd></div>`).join("\n")}
        </dl>
${SVG_PROCESS}`;
    },
  }));

  out.push(subPage({
    slug: "methodik", title: "Methodik der Wirkungswissenschaften",
    metaTitle: "Methodik | Wirkungswissenschaften", kicker: "Wissenschaftliches Arbeiten",
    description: "Methoden der Wirkungserfassung, Wirkungsbewertung und Wirkungsrückkopplung: Theory of Change, Contribution Analysis, Wirkpfade, Scorecards, Netto-Wirkungs-Index, T-SROI, Datenqualität und Unsicherheit.",
    lead: "Wirkungswissenschaftliche Methodik fragt nicht nur, ob etwas gewirkt hat, sondern wie Wirkung entsteht, nachgewiesen, bewertet und zurückgeführt wird.",
    intro: "",
    body: (base) => `${cards([
      { eyebrow: "Wirkung modellieren", h: "Wirkpfade & Theory of Change", p: "Plausible Ketten von Auslöser zu Wirkung, inklusive Wirkmechanismus, Nebenwirkungen und Annahmen." },
      { eyebrow: "Beitrag klären", h: "Contribution Analysis", p: "Statt vorschneller Kausalitätsbehauptung: den plausiblen Beitrag unter Alternativerklärungen prüfen." },
      { eyebrow: "Bewerten", h: "Scorecards, NWI, T-SROI", p: "Von Indikatoren zur bewerteten Netto-Wirkung – mit Wirkungsgrenzen und Nichtkompensation." },
      { eyebrow: "Absichern", h: "Datenqualität & Unsicherheit", p: "Datenherkunft, Qualität und Unsicherheit ausweisen; Schutz vor Scheinkausalität und Wirkungssimulation." },
    ])}
${prose("Mindeststandards", "Leitthese", [
      "Wirkungswissenschaftliche Methodik trennt Wirkleistung von Scheinleistung, Blindleistung und Verlustleistung. Wo Wirkung behauptet wird, gehören Datenqualität, Unsicherheit und Bilanzgrenze transparent dazu.",
    ])}`,
  }));

  out.push(subPage({
    slug: "publikationen", title: "Publikationen zu Wirkungswissenschaften",
    metaTitle: "Publikationen | Wirkungswissenschaften", kicker: "Belege & Downloads",
    description: "Dossier, Journalbeitrag und Glossarbasis zu Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie – mit Online-Fassung, PDF und Word.",
    lead: "Die theoretische und methodische Einordnung ist in Dossier, Journalbeitrag und Glossartexten ausgearbeitet.",
    intro: "",
    body: (base) => `${publicationsBlock(base)}
        <section class="term-summary-card" id="zitierempfehlung">
          <p class="section-eyebrow">Zitierempfehlung</p>
          <p>Weber, Natalie (2026): Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie. Dossier zur systemischen Einordnung, Version 1.0, Stand 7. Juli 2026.</p>
          <div class="document-action-row">
            <a class="btn btn-primary" href="${base}downloads/wirkungswissenschaften/dossier-wirkungswissenschaften.pdf">Dossier (PDF)</a>
            <a class="btn btn-primary" href="${base}downloads/wirkungswissenschaften/journalbeitrag-wirkungswissenschaften.pdf">Journalbeitrag (PDF)</a>
          </div>
          <p class="muted">Autorin: Natalie Weber · Status: Grundlagenpapier / Arbeitsfassung · Version 1.0 · Stand Juli 2026.</p>
        </section>`,
  }));

  const faqs = [
    ["Sind Wirkungswissenschaften neu?", "Neu ist nicht, dass Wirkung untersucht wird, sondern der systemische Dachrahmen, der verstreute Ansätze zusammenführt und Wirkung zur Leitkategorie von Erkenntnis, Bewertung und Steuerung macht."],
    ["Was ist der Unterschied zwischen Wirkungsforschung und Wirkungswissenschaften?", "Wirkungsforschung ist die methodische Teildisziplin (sie untersucht, ob und wie etwas wirkt). Die Wirkungswissenschaften sind der übergreifende Rahmen, in dem Wirkung als Grundkategorie verstanden, bewertet und rückgekoppelt wird."],
    ["Hat Natalie Weber die Wirkungsforschung erfunden?", "Nein. Bestehende Wirkungsforschung, Evaluation und Impact Assessment liefern wichtige Vorarbeiten. Natalie Weber führt sie in einen eigenständigen systemischen Rahmen zusammen und erweitert sie zur voraus-, begleit- und rückkoppelnden Wirkungsforschung."],
    ["Was ist der neue Beitrag der Wirkungsökonomie?", "Die Wirkungsökonomie ist die erste ausgearbeitete Steuerungs- und Ordnungsdisziplin dieses Rahmens: Sie überführt Wirkung in Preise, Steuern, Kapital, Recht, Medien und demokratische Rückkopplung."],
    ["Ist das eine neue Wissenschaft oder ein Ordnungsrahmen?", "Beides ist zu unterscheiden: Die Wirkungswissenschaften sind ein Wissenschafts- und Bezugsrahmen; die Wirkungsökonomie ist die daraus abgeleitete Steuerungsdisziplin."],
    ["Bewerten Wirkungswissenschaften Menschen?", "Nein. Bewertet werden Wirkungen von Handlungen, Produkten, Strukturen, Institutionen, Kapitalflüssen und Kommunikation – nicht Personen. Personenbewertung ist eine rote Linie."],
    ["Wie verhalten sich Wirkungswissenschaften zu ESG, SROI und Nachhaltigkeitswissenschaft?", "Sie schließen an diese Felder an, gehen aber über Berichtspflichten und Einzelkennzahlen hinaus, indem sie Wirkung bewerten, gewichten und in Entscheidungen zurückkoppeln."],
    ["Was bedeutet Mensch, Planet und Demokratie?", "Der normative Referenzrahmen, an dem positive Wirkung eingeordnet wird – ergänzt um SDGs und SDG+."],
  ];
  out.push(subPage({
    slug: "faq", title: "Häufige Fragen zu Wirkungswissenschaften",
    metaTitle: "FAQ | Wirkungswissenschaften", kicker: "Einwände & Missverständnisse",
    description: "Häufige Fragen zu Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie – und wie sich Natalie Webers Beitrag präzise und wissenschaftlich sauber einordnen lässt.",
    lead: "Antworten auf die häufigsten Fragen und Missverständnisse.",
    intro: "",
    body: () => `        <section class="wiwi-faq">
${faqs.map(([q, a]) => `          <details class="wiwi-faq-item"><summary>${esc(q)}</summary><div><p>${esc(a)}</p></div></details>`).join("\n")}
        </section>`,
  }));
  return out;
}

const hub = buildHub();
const subs = buildSubPages();
console.log(`[wiwi-hub] ${1 + subs.length} Seiten erzeugt: ${[hub, ...subs].map((r) => r.replace(/\/index\.html$/, "/")).join(", ")}`);
