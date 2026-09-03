import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Grundlagenbereich "Wirkungswissenschaften": Hub /wirkungswissenschaften/ +
// Unterseiten. Layout nach Styleguide (Bereichsseiten wie /verstehen/):
// <section class="hero"> + <section class="section [section-soft]"> mit
// .section-header + .card-grid; KEIN article-shell/term-* (das ist Detail-/
// Glossar-Layout). Volles Site-Chrome; alle öffentlich (index,follow).
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
    <main data-pagefind-body>
${body}
      <!-- state-sustainability-architecture-20260821 -->
      <section class="section section-muted" id="staatliche-nachhaltigkeitsarchitektur" aria-labelledby="staatliche-nachhaltigkeitsarchitektur-title">
        <div class="section-header">
          <p class="hero-kicker">Bestehende Staatsarchitektur und WÖk-Ergänzung</p>
          <h2 id="staatliche-nachhaltigkeitsarchitektur-title">Deutschland prüft Folgen bereits. Die WÖk führt die Ebenen systematisch zusammen.</h2>
          <p>Für Bundesregelungsvorhaben existiert bereits eine institutionalisierte Prüfarchitektur: Deutsche Nachhaltigkeitsstrategie, GGO/Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung und eNAP/eGFA sowie Monitoring. § 43 GGO umfasst unter anderem Ziel, Sachverhalt und Alternativen; § 44 beabsichtigte und unbeabsichtigte Folgen, Nachhaltigkeitsbezug und Vorgaben zur späteren Überprüfung.</p>
          <p><strong>Die Wirkungsökonomie ersetzt diese Architektur nicht.</strong> Sie ergänzt sie um eine durchgängig objektspezifische Verbindung von Problemprüfung, Zielprüfung, expliziten Wirkpfaden (A→M→ΔZ→R), Wirkungen erster bis dritter Ordnung und Kaskaden, Verteilung und Resilienz, Gegenfaktum und Zurechnung, Omissions-/Delivery-/Kohärenzprüfung, strukturiertem Optionsvergleich, Nichtkompensation und wiederholbarem Reality Check.</p>
          <p>Ein Bezug zu DNS, SDGs oder Indikatoren ist Ziel- und Referenzinformation - kein automatischer Kausalitätsnachweis. Indikator ist nicht Wirkung, Output ist nicht Outcome und Beobachtung ist nicht Zurechnung.</p>
          <p><a class="text-link" href="${base}methodik/">Zur WÖk-Methodik</a> · <a class="text-link" href="${base}methodik/datenbasis.html">Zu Daten- und Quellenfunktionen</a> · <a class="text-link" href="${base}blog/enap-woek-benchmark-fuenf-bundesvorhaben.html">Zum Fünf-Fälle-Benchmark</a></p>
        </div>
      </section>
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

// --- Layout-Bausteine nach Styleguide ---------------------------------------
function heroSection({ kicker, title, subtitle, intro, actions }) {
  return `      <section class="hero">
        <p class="hero-kicker">${esc(kicker)}</p>
        <h1 class="hero-title">${esc(title)}</h1>
        ${subtitle ? `<p class="hero-subtitle">${esc(subtitle)}</p>` : ""}
        ${intro ? `<p>${intro}</p>` : ""}
        ${actions ? `<div class="hero-actions">${actions}</div>` : ""}
      </section>`;
}
function section({ soft, id, kicker, heading, intro, inner }) {
  return `      <section class="section${soft ? " section-soft" : ""}"${id ? ` id="${id}"` : ""}>
        <div class="section-header">
          ${kicker ? `<p class="hero-kicker">${esc(kicker)}</p>` : ""}
          ${heading ? `<h2>${esc(heading)}</h2>` : ""}
          ${intro ? `<p>${intro}</p>` : ""}
        </div>
${inner || ""}
      </section>`;
}
function cardGrid(cols, items) {
  return `        <div class="card-grid ${cols}">
${items.map((c) => `          <article class="card">
            ${c.kicker ? `<p class="card-kicker">${esc(c.kicker)}</p>` : ""}
            <h3 class="card-title">${esc(c.title)}</h3>
            <p class="card-text">${c.text}</p>
            ${c.href ? `<p><a class="text-link" href="${c.href}">${esc(c.link || "Mehr")} →</a></p>` : ""}
          </article>`).join("\n")}
        </div>`;
}
function prose(paras) {
  return paras.map((p) => `        <p>${p}</p>`).join("\n");
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
  return `      <nav class="wiwi-subnav" aria-label="Bereich Wirkungswissenschaften">
${items.map(([h, l]) => h === current
    ? `        <span class="wiwi-subnav-link is-active" aria-current="page">${esc(l)}</span>`
    : `        <a class="wiwi-subnav-link" href="${base}${h}">${esc(l)}</a>`).join("\n")}
      </nav>`;
}

// --- SVG-Grafiken (barrierearm) ---------------------------------------------
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

const DOSSIER = "dokumente/dossier-wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie/";
const JOURNAL = "blog/wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie.html";

function publikationenCards(base) {
  return cardGrid("three", [
    { kicker: "Dossier", title: "Grundlagendossier", text: "Systematische Einordnung der Disziplinen, Begriffe und Wirkungsarchitektur - Grundlage für Website, Glossar und Akademie.", href: `${base}${DOSSIER}`, link: "Dossier lesen" },
    { kicker: "Journal", title: "Wirkungswissenschaften als neuer Bezugsrahmen", text: "Konzeptioneller Beitrag zur wissenschaftlichen Einordnung im Kontext der Wirkungsökonomie.", href: `${base}${JOURNAL}`, link: "Journalbeitrag lesen" },
    { kicker: "Glossar", title: "Begriffe der Wirkung", text: "Wirkung, Wirkstoff, Wirkungspotenzial, Wirkungspfad, Wirkungsgrad, Netto-Wirkung und Wirkungsarchitektur.", href: `${base}begriffe/`, link: "Zum Glossar" },
  ]);
}
function weiterlesen(base) {
  return section({ soft: true, kicker: "Weiterlesen", heading: "Im Bereich Wirkungswissenschaften",
    inner: cardGrid("three", [
      { title: "Dossier", text: "Das Grundlagendossier zur systemischen Einordnung.", href: `${base}${DOSSIER}`, link: "Öffnen" },
      { title: "Journalbeitrag", text: "Der konzeptionelle Beitrag im Journal.", href: `${base}${JOURNAL}`, link: "Öffnen" },
      { title: "Glossar", text: "Alle Begriffe der Wirkungsökonomie.", href: `${base}begriffe/`, link: "Öffnen" },
    ]) });
}

// ============================ HUB (Überblick) ================================
function buildHub() {
  const base = "../";
  const body = [
    heroSection({
      kicker: "Grundlagenbereich · Verstehen",
      title: "Wirkungswissenschaften",
      subtitle: "Der wissenschaftliche Rahmen hinter der Wirkungsökonomie.",
      intro: "Wirkungswissenschaften untersuchen, wie Handlungen, Unterlassen, Produkte, Gesetze, Kapitalflüsse, Technologien, Sprache, Institutionen und Medien reale Zustände verändern. Im Rahmen der von Natalie Weber begründeten Wirkungsökonomie werden sie zu einem inter- und transdisziplinären Bezugsrahmen für Wirkung auf Mensch, Planet und Demokratie.",
      actions: `<a class="btn btn-primary" href="${base}${DOSSIER}">Dossier lesen</a> <a class="btn btn-secondary" href="${base}${JOURNAL}">Journalbeitrag lesen</a> <a class="btn btn-ghost" href="${base}wirkungswissenschaften/begriffssystem/">Zum Begriffssystem</a>`,
    }),
    subnav(base, "wirkungswissenschaften/"),
    section({ kicker: "Die Grundunterscheidung", heading: "Rahmen, Methode, Steuerungsdisziplin",
      inner: cardGrid("three", [
        { kicker: "Der Oberrahmen", title: "Wirkungswissenschaften", text: "Fragen, wie Zustände entstehen, verändert, stabilisiert oder destabilisiert werden - und wie diese Wirkung verantwortbar bewertet und rückgekoppelt werden kann.", href: `${base}wirkungswissenschaften/definition/`, link: "Definition" },
        { kicker: "Die methodische Teildisziplin", title: "Wirkungsforschung", text: "Untersucht Wirkungen, Wirkungspotenziale, Wirkmechanismen, Nebenwirkungen, Wechselwirkungen und Transformationsbeiträge empirisch, theoretisch und systemisch.", href: `${base}wirkungswissenschaften/wirkungsforschung/`, link: "Wirkungsforschung" },
        { kicker: "Die erste Steuerungsdisziplin", title: "Wirkungsökonomie", text: "Überführt Wirkung in Preise, Steuern, Kapital, Unternehmen, Politik, Recht, Medien und demokratische Rückkopplung.", href: `${base}wirkungswissenschaften/wirkungsoekonomie/`, link: "Wirkungsökonomie" },
      ]) }),
    section({ soft: true, kicker: "Auf einen Blick", heading: "Drei Ebenen, eine Ordnung", inner: `        ${SVG_ROLES}` }),
    section({ kicker: "Urheberschaft, wissenschaftlich sauber", heading: "Was Natalie Weber neu begründet",
      inner: prose([
        "Wirkung wurde auch vor der Wirkungsökonomie untersucht: in Evaluation, Wirkungsforschung, Impact Assessment, Technikfolgenabschätzung, Nachhaltigkeitswissenschaft und Transformationsforschung. Neu ist jedoch der systemische Rahmen, in dem Wirkung nicht nur Gegenstand nachträglicher Bewertung ist, sondern zur Leitkategorie gesellschaftlicher Erkenntnis, Verantwortung und Steuerung wird.",
        "Natalie Weber begründet mit der Wirkungsökonomie einen Rahmen, in dem Wirkungsforschung, Wirkungswissenschaften und wirkungsorientierte Steuerung zusammengeführt werden. Wirkung wird dadurch nicht nur gemessen, sondern in Entscheidungs-, Preis-, Steuer-, Kapital-, Rechts-, Medien- und Demokratieprozesse rückgekoppelt.",
      ]) + `
        <div class="wiwi-formula">
          <p class="card-kicker">Kurzformel</p>
          <ul>
            <li><strong>Wirkungsforschung</strong> fragt, ob und wie etwas wirkt.</li>
            <li><strong>Wirkungswissenschaften</strong> fragen, wie Wirkung als Grundkategorie gesellschaftlicher Realität verstanden wird.</li>
            <li><strong>Wirkungsökonomie</strong> fragt, wie Wirtschaft, Kapital, Staat und Gesellschaft gebaut sein müssen, damit positive Netto-Wirkung für Mensch, Planet und Demokratie entscheidungsrelevant wird.</li>
          </ul>
        </div>` }),
    section({ soft: true, kicker: "Begriffsarchitektur", heading: "Vom Auslöser zur Wirkungsarchitektur",
      intro: "Die Wirkungswissenschaften unterscheiden zwischen möglicher, tatsächlicher, bewerteter und rückgekoppelter Wirkung. So wird verhindert, dass Absicht, Image, Output oder Symbolik mit realer Zustandsveränderung verwechselt werden.",
      inner: `        ${SVG_PROCESS}
        <p class="wiwi-chips">
${[["begriffe/wirkung/", "Wirkung"], ["begriffe/wirkstoff/", "Wirkstoff"], ["begriffe/wirkungspotenzial/", "Wirkungspotenzial"], ["begriffe/wirkmechanismus/", "Wirkmechanismus"], ["begriffe/wirkpfad/", "Wirkungspfad"], ["begriffe/netto-wirkung/", "Netto-Wirkung"], ["begriffe/transformationswirkung/", "Transformationswirkung"], ["begriffe/wirkungsgrad/", "Wirkungsgrad"], ["begriffe/wirkungsrueckkopplung/", "Wirkungsrückkopplung"], ["begriffe/wirkungsarchitektur/", "Wirkungsarchitektur"]].map(([h, l]) => `          <a class="wiwi-chip" href="${base}${h}">${esc(l)}</a>`).join("\n")}
        </p>` }),
    section({ kicker: "Grundlagen & Publikationen", heading: "Dossier, Journalbeitrag und Glossar", inner: publikationenCards(base) }),
    section({ soft: true, kicker: "Kein luftleerer Raum", heading: "Anschluss an bestehende Forschung",
      inner: prose([
        "Die Wirkungswissenschaften und die Wirkungsökonomie entstehen nicht im luftleeren Raum. Sie schließen an bestehende Felder an: Wirkungsforschung, Evaluation, Impact Measurement, Impact Assessment, Nachhaltigkeitswissenschaft, Transformationsforschung, Systemtheorie, Medienwirkungsforschung, Technikfolgenabschätzung und Governance-Forschung.",
        "Der neue Beitrag liegt darin, diese verstreuten Ansätze in einen gemeinsamen Rahmen zu stellen. Wirkung wird nicht nur untersucht, sondern zur Leitkategorie gesellschaftlicher Erkenntnis, Bewertung und Steuerung weiterentwickelt.",
      ]) }),
    section({ kicker: "Rote Linie", heading: "Schutzlinien",
      inner: prose([
        "Die Wirkungswissenschaften bewerten keine Menschen als Personen. Sie untersuchen Wirkungen von Handlungen, Produkten, Strukturen, Institutionen, Kapitalflüssen, Technologien, Kommunikation und Entscheidungen.",
        "Personenbewertung ist eine rote Linie. Ziel ist nicht Kontrolle, sondern bessere Rückkopplung: sichtbar machen, welche Folgen entstehen, wo Risiken liegen und wie positive Netto-Wirkung gestärkt werden kann.",
      ]) }),
  ].join("\n");
  return page({
    rel: "wirkungswissenschaften/index.html", title: "Wirkungswissenschaften",
    metaTitle: "Wirkungswissenschaften | Der wissenschaftliche Rahmen der Wirkungsökonomie",
    description: "Wirkungswissenschaften untersuchen, wie Handlungen, Produkte, Gesetze, Kapitalflüsse, Technologien, Sprache und Institutionen reale Zustände verändern. Der von Natalie Weber im Kontext der Wirkungsökonomie begründete Rahmen verbindet Wirkungsforschung, Evaluation, Nachhaltigkeitswissenschaft und systemische Rückkopplung.",
    section: "Verstehen", base, body,
  });
}

// ============================ Unterseiten ====================================
function subPage({ slug, title, metaTitle, description, kicker, subtitle, intro, bodySections }) {
  const base = "../../";
  const current = `wirkungswissenschaften/${slug}/`;
  const body = [
    heroSection({ kicker, title, subtitle, intro }),
    subnav(base, current),
    ...bodySections(base),
    weiterlesen(base),
  ].join("\n");
  return page({ rel: `wirkungswissenschaften/${slug}/index.html`, title, metaTitle, description, section: "Verstehen", base, body });
}

function buildSubPages() {
  const out = [];

  out.push(subPage({
    slug: "definition", title: "Definition der Wirkungswissenschaften",
    metaTitle: "Definition | Wirkungswissenschaften", kicker: "Wirkungswissenschaften · Grundlagen",
    subtitle: "Was Wirkungswissenschaften sind - und wie sie sich abgrenzen.",
    description: "Wirkungswissenschaften sind der von Natalie Weber im Kontext der Wirkungsökonomie begründete inter- und transdisziplinäre Rahmen, der Wirkung als tatsächliche Zustandsveränderung untersucht, bewertet und rückkoppelt.",
    intro: "",
    bodySections: (base) => [
      section({ kicker: "Kerndefinition", heading: "Wirkung als Grundkategorie",
        inner: prose([
          "Wirkungswissenschaften bezeichnen den von Natalie Weber im Kontext der Wirkungsökonomie begründeten inter- und transdisziplinären Wissenschaftsrahmen, der Wirkung als tatsächliche Veränderung von Zuständen untersucht, bewertet und in gesellschaftliche Lern-, Entscheidungs- und Steuerungsprozesse rückkoppelt.",
          "Sie führen verstreute Ansätze der Wirkungsforschung, Evaluation, Nachhaltigkeitswissenschaft, Impact-Messung, Folgenabschätzung, Systemtheorie und Transformationsforschung in einer gemeinsamen Leitkategorie zusammen: Wirkung für Mensch, Planet und Demokratie.",
        ]) }),
      section({ soft: true, kicker: "Abgrenzung", heading: "Rahmen, nicht Einzelmethode",
        inner: cardGrid("three", [
          { kicker: "Abgrenzung", title: "Nicht nur Wirkungsforschung", text: "Wirkungsforschung ist die methodische Teildisziplin. Die Wirkungswissenschaften sind der übergreifende Rahmen, der Erkenntnis, Bewertung und Rückkopplung verbindet." },
          { kicker: "Abgrenzung", title: "Mehr als Impact Measurement", text: "Impact Measurement misst einzelne Wirkungen. Die Wirkungswissenschaften fragen zusätzlich, wie Wirkung bewertet, gewichtet und in Entscheidungen zurückgeführt wird." },
          { kicker: "Referenzrahmen", title: "Mensch, Planet, Demokratie", text: "Wirkung wird an Mensch, Planet und Demokratie sowie an relevanten Referenz- und Schutzräumen eingeordnet. Global gehören SDGs dazu, bei deutschen öffentlichen Fällen zusätzlich die DNS; SDG+ ist WÖk-eigen. Zielbezug allein ist kein Wirkungsnachweis." },
        ]) }),
      section({ kicker: "Disziplinenordnung", heading: "Der Oberrahmen und seine Spezialbereiche", inner: `        ${SVG_DISCIPLINES}` }),
    ],
  }));

  out.push(subPage({
    slug: "wirkungsforschung", title: "Wirkungsforschung",
    metaTitle: "Wirkungsforschung | Wirkungswissenschaften", kicker: "Wirkungswissenschaften · Methodische Teildisziplin",
    subtitle: "Von der Evaluation zur systemischen Wirkungsforschung.",
    description: "Wirkungsforschung ist innerhalb der Wirkungswissenschaften die methodische Teildisziplin. Der WÖk-Rahmen verbindet etablierte ex-ante-, begleitende und ex-post-Methoden mit einer expliziten systemischen Rückkopplungslogik.",
    intro: "",
    bodySections: (base) => [
      section({ kicker: "Kerndefinition", heading: "Was Wirkungsforschung untersucht",
        inner: prose([
          "Wirkungsforschung ist innerhalb der Wirkungswissenschaften die methodische Teildisziplin, die Wirkungen, Wirkungspotenziale, Wirkmechanismen, Nebenwirkungen, Wechselwirkungen, Wirkungsrisiken und Transformationsbeiträge empirisch, theoretisch und systemisch untersucht.",
          "Im WÖk-Rahmen werden etablierte ex-ante-, begleitende und ex-post-Ansätze ausdrücklich mit systemischer Wirkmodellierung, Gegenfaktum/Zurechnung und wiederholbarer Rückkopplung verbunden.",
        ]) }),
      section({ soft: true, kicker: "Vom Befund zum System", heading: "Alte und neue Wirkungsforschung",
        inner: cardGrid("three", [
          { kicker: "Bestehender Kanon", title: "Evaluation und Impact Assessment", text: "Evaluation, Impact Assessment und Folgenabschätzung liefern wichtige ex-ante-, begleitende und ex-post-Methoden. Die WÖk baut darauf auf, statt sie als Leerstelle zu behandeln." },
          { kicker: "Integrationsfrage", title: "Wie wird aus Befunden Steuerungslernen?", text: "Der WÖk-Zusatz liegt in der durchgängigen Verbindung von Problem, Ziel, Kausalhypothese, Verteilung, Optionen, Attribution und wiederholbarer Rückkopplung - nicht in der Behauptung, Folgenprüfung habe zuvor gefehlt." },
          { kicker: "Neu", title: "Systemische Wirkungsforschung", text: "Voraus-, begleit- und rückkoppelnd: Sie fragt, wie Wirkung entsteht, wie sie plausibel nachgewiesen, begrenzt, bewertet und in künftige Entscheidungen zurückgeführt wird." },
        ]) }),
      section({ kicker: "Methodischer Anschluss", heading: "Werkzeuge der Wirkungsforschung",
        inner: prose([`Zum Kanon gehören Theory of Change, Contribution Analysis, Wirkpfade, Indikatoren und Scorecards, Datenqualität und Unsicherheitsangaben - ausführlich auf der Seite <a class="text-link" href="${base}wirkungswissenschaften/methodik/">Methodik</a>.`]) }),
    ],
  }));

  out.push(subPage({
    slug: "wirkungsoekonomie", title: "Wirkungsökonomie als Steuerungsdisziplin",
    metaTitle: "Wirkungsökonomie | Wirkungswissenschaften", kicker: "Wirkungswissenschaften · Steuerungsdisziplin",
    subtitle: "Wie Wirkung in Preise, Steuern, Kapital und Governance übergeht.",
    description: "Die Wirkungsökonomie ist eine von Natalie Weber ausgearbeitete Steuerungs- und Ordnungsdisziplin im Rahmen der Wirkungswissenschaften - sie untersucht die Rückkopplung von Wirkung in Preise, Steuern, Kapital und Governance.",
    intro: "",
    bodySections: (base) => [
      section({ kicker: "Kerndefinition", heading: "Eine ausgearbeitete Steuerungsdisziplin",
        inner: prose(["Die Wirkungsökonomie ist eine von Natalie Weber ausgearbeitete Steuerungs- und Ordnungsdisziplin im Rahmen der Wirkungswissenschaften. Sie untersucht nicht nur, welche Wirkungen wirtschaftliche Aktivitäten erzeugen, sondern wie Märkte, Preise, Steuern, Kapital, Unternehmen und öffentliche Entscheidungen so gestaltet werden können, dass positive Netto-Wirkung für Mensch, Planet und Demokratie entscheidungsrelevant wird. Bei staatlichen Entscheidungen schließt sie ausdrücklich an bestehende Folgen-, Nachhaltigkeits- und Evaluationsarchitekturen an."]) }),
      section({ soft: true, kicker: "Vom Prinzip zum Werkzeug", heading: "Wirkung statt Kapital",
        inner: cardGrid("three", [
          { kicker: "Prinzip", title: "Wirkung statt Kapital", text: "Kapital bleibt Werkzeug, Wirkung wird Kompass. Wirtschaft wird als Wirkungssystem verstanden.", href: `${base}verstehen/`, link: "Modell verstehen" },
          { kicker: "Werkzeuge", title: "Von Daten zu Preisen", text: "WÖk-IDs, Scorecards, Netto-Wirkungs-Index und T-SROI übersetzen Wirkungsdaten in Preise, Steuern und Kapitalzugang.", href: `${base}wirkungssteuerung/`, link: "Wirkungssteuerung" },
          { kicker: "Abgrenzung", title: "Über ESG, SROI, Donut hinaus", text: "Die Wirkungsökonomie bleibt nicht bei Berichtspflichten oder Einzelkennzahlen stehen, sondern koppelt Wirkung in Entscheidungen zurück." },
        ]) }),
    ],
  }));

  out.push(subPage({
    slug: "begriffssystem", title: "Begriffssystem der Wirkungswissenschaften",
    metaTitle: "Begriffssystem | Wirkungswissenschaften", kicker: "Wirkungswissenschaften · Glossarbasis",
    subtitle: "Die zentralen Begriffe - systemisch geordnet.",
    description: "Das systemische Begriffssystem der Wirkungswissenschaften - vom Auslöser über Wirkungspotenzial und Wirkungspfad bis zur Wirkungsarchitektur.",
    intro: "",
    bodySections: (base) => {
      const terms = [
        ["wirkung", "Wirkung", "Die tatsächliche Veränderung von Zuständen - positiv, negativ oder neutral, immer mit Bezugspunkt."],
        ["wirkstoff", "Wirkstoff", "Didaktische Analogie für einen Auslöser mit Wirkungspotenzial. Nicht selbst Wirkung, sondern das, was Wirkung ermöglicht."],
        ["wirkungspotenzial", "Wirkungspotenzial", "Die Möglichkeit, dass eine Handlung, ein Produkt, ein Gesetz oder ein Kapitalfluss Wirkung entfaltet - noch keine eingetretene Wirkung."],
        ["wirkungsrisiko", "Wirkungsrisiko", "Die Möglichkeit negativer, destabilisierender oder unbeabsichtigter Wirkungen."],
        ["wirkmechanismus", "Wirkmechanismus", "Wie eine Wirkung entstehen soll oder kann."],
        ["wirkpfad", "Wirkungspfad", "Der plausible Weg vom Auslöser über Wirkmechanismus, Wirkungsraum und Nebenwirkungen zur Zustandsveränderung."],
        ["wirkungsraum", "Wirkungsraum", "Der Bereich, in dem eine Handlung, ein Produkt oder Kommunikation Folgen entfaltet."],
        ["wirkungsbewertung", "Wirkungsbewertung", "Die Einordnung einer Zustandsveränderung an Mensch, Planet und Demokratie sowie an SDGs und SDG+."],
        ["netto-wirkung", "Netto-Wirkung", "Die zusammenführende Bewertung positiver und negativer Wirkungen unter Wirkungsgrenzen und Nichtkompensation."],
        ["wirkungsgrad", "Wirkungsgrad", "Das Verhältnis von eingesetzten Ressourcen und Aktivität zu tatsächlich positiver Netto-Wirkung - Wirkleistung statt Scheinleistung."],
        ["transformationswirkung", "Transformationswirkung", "Die Veränderung von Systemlogiken, Standards, Anreizen, Infrastrukturen oder Handlungspfaden."],
        ["wirkungsrueckkopplung", "Wirkungsrückkopplung", "Der Lernprozess, durch den bewertete Wirkung in künftige Entscheidungen, Regeln und Anreize zurückfließt."],
        ["wirkungsarchitektur", "Wirkungsarchitektur", "Das Gesamtsystem aus Daten, Begriffen, Methoden, Institutionen, Regeln, Schutzlinien und Rückkopplungen."],
      ];
      return [
        section({ kicker: "Begriffssystem", heading: "Von der Möglichkeit zur Architektur",
          intro: `Jeder Begriff ist im <a class="text-link" href="${base}begriffe/">Glossar der Wirkungsökonomie</a> ausführlich definiert.`,
          inner: `        ${SVG_PROCESS}
        <dl class="wiwi-glossary">
${terms.map(([s, t, d]) => `          <div class="wiwi-term"><dt><a href="${base}begriffe/${s}/">${esc(t)}</a></dt><dd>${esc(d)}</dd></div>`).join("\n")}
        </dl>` }),
      ];
    },
  }));

  out.push(subPage({
    slug: "methodik", title: "Methodik der Wirkungswissenschaften",
    metaTitle: "Methodik | Wirkungswissenschaften", kicker: "Wirkungswissenschaften · Wissenschaftliches Arbeiten",
    subtitle: "Wie Wirkung entsteht, nachgewiesen, bewertet und zurückgeführt wird.",
    description: "Methoden der Wirkungserfassung, Wirkungsbewertung und Wirkungsrückkopplung: Theory of Change, Contribution Analysis, Wirkpfade, Scorecards, Netto-Wirkungs-Index, T-SROI, Datenqualität und Unsicherheit.",
    intro: "",
    bodySections: () => [
      section({ kicker: "Methodischer Kanon", heading: "Vier Schritte wirkungswissenschaftlicher Methodik",
        inner: cardGrid("two", [
          { kicker: "Wirkung modellieren", title: "Wirkpfade & Theory of Change", text: "Plausible Ketten von Auslöser zu Wirkung, inklusive Wirkmechanismus, Nebenwirkungen und Annahmen." },
          { kicker: "Beitrag klären", title: "Contribution Analysis", text: "Statt vorschneller Kausalitätsbehauptung: den plausiblen Beitrag unter Alternativerklärungen prüfen." },
          { kicker: "Bewerten", title: "Scorecards, NWI, T-SROI", text: "Von Indikatoren zur bewerteten Netto-Wirkung - mit Wirkungsgrenzen und Nichtkompensation." },
          { kicker: "Absichern", title: "Datenqualität & Unsicherheit", text: "Datenherkunft, Qualität und Unsicherheit ausweisen; Schutz vor Scheinkausalität und Wirkungssimulation." },
        ]) }),
      section({ soft: true, kicker: "Leitthese", heading: "Wirkleistung statt Scheinleistung",
        inner: prose(["Wirkungswissenschaftliche Methodik trennt Wirkleistung von Scheinleistung, Blindleistung und Verlustleistung. Wo Wirkung behauptet wird, gehören Datenqualität, Unsicherheit und Bilanzgrenze transparent dazu."]) }),
    ],
  }));

  out.push(subPage({
    slug: "publikationen", title: "Publikationen zu Wirkungswissenschaften",
    metaTitle: "Publikationen | Wirkungswissenschaften", kicker: "Wirkungswissenschaften · Belege & Downloads",
    subtitle: "Dossier, Journalbeitrag und Glossar - mit Zitierempfehlung.",
    description: "Dossier, Journalbeitrag und Glossarbasis zu Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie.",
    intro: "",
    bodySections: (base) => [
      section({ kicker: "Grundlagen & Publikationen", heading: "Dossier, Journalbeitrag und Glossar", inner: publikationenCards(base) }),
      section({ soft: true, id: "zitierempfehlung", kicker: "Zitierempfehlung", heading: "So wird zitiert",
        inner: `        <div class="wiwi-formula">
          <p>Weber, Natalie (2026): Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie. Dossier zur systemischen Einordnung, Version 1.0, Stand 7. Juli 2026.</p>
        </div>
        <p class="wiwi-meta">Autorin: Natalie Weber · Status: Grundlagenpapier / Arbeitsfassung · Version 1.0 · Stand Juli 2026.</p>` }),
    ],
  }));

  const faqs = [
    ["Sind Wirkungswissenschaften neu?", "Neu ist nicht, dass Wirkung untersucht wird, sondern der systemische Dachrahmen, der verstreute Ansätze zusammenführt und Wirkung zur Leitkategorie von Erkenntnis, Bewertung und Steuerung macht."],
    ["Was ist der Unterschied zwischen Wirkungsforschung und Wirkungswissenschaften?", "Wirkungsforschung ist die methodische Teildisziplin (sie untersucht, ob und wie etwas wirkt). Die Wirkungswissenschaften sind der übergreifende Rahmen, in dem Wirkung als Grundkategorie verstanden, bewertet und rückgekoppelt wird."],
    ["Hat Natalie Weber die Wirkungsforschung erfunden?", "Nein. Bestehende Wirkungsforschung, Evaluation und Impact Assessment liefern wichtige Vorarbeiten. Natalie Weber führt sie in einen eigenständigen systemischen Rahmen zusammen und erweitert sie zur voraus-, begleit- und rückkoppelnden Wirkungsforschung."],
    ["Was ist der neue Beitrag der Wirkungsökonomie?", "Die Wirkungsökonomie ist die erste ausgearbeitete Steuerungs- und Ordnungsdisziplin dieses Rahmens: Sie überführt Wirkung in Preise, Steuern, Kapital, Recht, Medien und demokratische Rückkopplung."],
    ["Ist das eine neue Wissenschaft oder ein Ordnungsrahmen?", "Beides ist zu unterscheiden: Die Wirkungswissenschaften sind ein Wissenschafts- und Bezugsrahmen; die Wirkungsökonomie ist die daraus abgeleitete Steuerungsdisziplin."],
    ["Bewerten Wirkungswissenschaften Menschen?", "Nein. Bewertet werden Wirkungen von Handlungen, Produkten, Strukturen, Institutionen, Kapitalflüssen und Kommunikation - nicht Personen. Personenbewertung ist eine rote Linie."],
    ["Wie verhalten sich Wirkungswissenschaften zu ESG, SROI und Nachhaltigkeitswissenschaft?", "Sie schließen an diese Felder an, gehen aber über Berichtspflichten und Einzelkennzahlen hinaus, indem sie Wirkung bewerten, gewichten und in Entscheidungen zurückkoppeln."],
    ["Was bedeutet Mensch, Planet und Demokratie?", "Der normative Referenzrahmen, an dem positive Wirkung eingeordnet wird - ergänzt um SDGs und SDG+."],
  ];
  out.push(subPage({
    slug: "faq", title: "Häufige Fragen zu Wirkungswissenschaften",
    metaTitle: "FAQ | Wirkungswissenschaften", kicker: "Wirkungswissenschaften · Einwände & Missverständnisse",
    subtitle: "Antworten auf die häufigsten Fragen.",
    description: "Häufige Fragen zu Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie - und wie sich Natalie Webers Beitrag präzise und wissenschaftlich sauber einordnen lässt.",
    intro: "",
    bodySections: () => [
      section({ kicker: "FAQ", heading: "Fragen und Missverständnisse",
        inner: `        <div class="wiwi-faq">
${faqs.map(([q, a]) => `          <details class="wiwi-faq-item"><summary>${esc(q)}</summary><div><p>${esc(a)}</p></div></details>`).join("\n")}
        </div>` }),
    ],
  }));
  return out;
}

const hub = buildHub();
const subs = buildSubPages();
console.log(`[wiwi-hub] ${1 + subs.length} Seiten (Styleguide-Layout) erzeugt: ${[hub, ...subs].map((r) => r.replace(/\/index\.html$/, "/")).join(", ")}`);
