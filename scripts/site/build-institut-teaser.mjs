import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "institut");
const OUT_FILE = path.join(OUT_DIR, "index.html");
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const headerTemplate = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");
const BASE = "../";
const INSTITUT_URL = "https://institut.wirkungsoekonomie.de";
const BEWERBUNG_URL = "https://institut.wirkungsoekonomie.de/bewerbung";
const headerUtilityLabels = new Set(["Suche", "WÖk-KI", "Mein Wirkungsraum"]);

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function navMatch(item) {
  return (item.match || []).join("|");
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function navLink(item, base) {
  return `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function headerUtilityNav(base) {
  return (navigation.more || [])
    .filter((item) => headerUtilityLabels.has(item.label))
    .map((item) => {
      const label = esc(item.label);
      const primary = item.label === "Mein Wirkungsraum" ? ' data-utility-primary="true"' : "";
      return `<a class="site-utility-link site-utility-link--${esc(slugify(item.label))}" href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}" data-utility-label="${label}"${primary}>${label}</a>`;
    })
    .join("\n    ");
}

function footerGroup(group, base) {
  const links = group.items.map((item) => `          ${navLink(item, base)}`).join("\n");
  return `<div class="footer-nav-group">
      <h3>${esc(group.title)}</h3>
      <div class="footer-nav-links">
${links}
      </div>
    </div>`;
}

function renderHeader(base) {
  return headerTemplate
    .replaceAll("{{BASE}}", base)
    .replaceAll("{{HEADER_UTILITY_NAV}}", headerUtilityNav(base))
    .replace("{{HEADER_NAV}}", navigation.header.map((item) => navLink(item, base)).join("\n    "));
}

function renderFooter(base) {
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n"));
}

const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Wirkungsinstitut – der ThinkTank der Wirkungsökonomie</title>
    <meta name="description" content="Das Wirkungsinstitut ist der Forschungs- und Arbeitsraum neben der WÖk-Akademie: Modelle, Analysen und Veröffentlichungen zur tatsächlichen Wirkung wirtschaftlicher und politischer Entscheidungen.">
    <link rel="canonical" href="https://wirkungsoekonomie.de/institut/">
    <link rel="stylesheet" href="../assets/css/style.css">
  </head>
  <body>
${renderHeader(BASE)}
    <main>
      <section class="hero compact-hero">
        <nav class="breadcrumb"><a href="../index.html">Start</a> / Wirkungsinstitut</nav>
        <p class="hero-kicker">Der ThinkTank der Wirkungsökonomie</p>
        <h1>Wirkungsinstitut</h1>
        <p class="hero-subtitle">Das Wirkungsinstitut ist der Forschungs- und Arbeitsraum neben der WÖk-Akademie. Hier wird die Wirkungsökonomie weitergedacht, geprüft und in konkrete Modelle, Analysen und Veröffentlichungen übersetzt – nachvollziehbar und am Referenzrahmen der SDGs orientiert.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${BEWERBUNG_URL}">Am Institut mitwirken</a>
          <a class="btn btn-secondary" href="${INSTITUT_URL}">Institut öffnen</a>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-arbeit-title">
        <div class="section-header">
          <p class="hero-kicker">Was hier passiert</p>
          <h2 id="institut-arbeit-title">Wirkung prüfen, weiterdenken, veröffentlichen</h2>
        </div>
        <div class="card-grid three">
          <article class="card">
            <h3 class="card-title">Forschung &amp; Arbeitspapiere</h3>
            <p class="card-text">Modelle, Methoden und Analysen zur tatsächlichen Wirkung wirtschaftlicher und politischer Entscheidungen – am Referenzrahmen der SDGs geprüft.</p>
          </article>
          <article class="card">
            <h3 class="card-title">Module &amp; Rollen</h3>
            <p class="card-text">Strukturierte Arbeitsbereiche mit klaren Rollen und einem transparenten Bewerbungs- und Zugangsweg für Mitwirkende.</p>
          </article>
          <article class="card">
            <h3 class="card-title">Portal &amp; KI</h3>
            <p class="card-text">Ein Arbeitsportal mit gemeinsamer Kern-Suche, Glossar und KI-Unterstützung – dieselbe Wissensbasis wie Website und Akademie.</p>
          </article>
        </div>
      </section>

      <section class="section" aria-labelledby="institut-mitwirken-title">
        <div class="section-header compact">
          <p class="hero-kicker">Mitwirken</p>
          <h2 id="institut-mitwirken-title">Das Institut ist offen für Mitwirkung</h2>
          <p>Wer an Wirkungsforschung, Analysen und Veröffentlichungen mitarbeiten möchte, findet im Institut Rollen, Module und einen klaren Zugangsweg.</p>
        </div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${BEWERBUNG_URL}">Zur Bewerbung</a>
          <a class="btn btn-secondary" href="../index.html">Zurück zur Startseite</a>
        </div>
      </section>
    </main>
${renderFooter(BASE)}
    <script src="../assets/js/main.js"></script>
  </body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html);
console.log("Built institut/index.html.");
