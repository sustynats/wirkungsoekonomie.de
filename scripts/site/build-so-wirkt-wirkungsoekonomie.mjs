import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "so-wirkt-wirkungsoekonomie");
const OUT_FILE = path.join(OUT_DIR, "index.html");
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const headerTemplate = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");
const BASE = "../";
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
    <title>So wirkt die Wirkungsökonomie</title>
    <meta name="description" content="Die Wirkungsökonomie erklärt, wie Entscheidungen, Preise, Regeln, Kapital und Sprache auf Mensch, Planet und Demokratie wirken.">
    <link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-headline-fix">
  </head>
  <body>
${renderHeader(BASE)}
    <main>
      <section class="hero compact-hero">
        <nav class="breadcrumb"><a href="../index.html">Start</a> / So wirkt die Wirkungsökonomie</nav>
        <p class="hero-kicker">Wirkungsökonomie verstehen</p>
        <h1>So wirkt die Wirkungsökonomie</h1>
        <p class="hero-subtitle">Die Wirkungsökonomie fragt nicht zuerst, ob etwas gut gemeint, laut sichtbar oder finanziell erfolgreich ist. Sie fragt, was sich dadurch tatsächlich verändert: für Mensch, Planet und Demokratie.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#wirkungsmodell">Wirkungsmodell ansehen</a>
          <a class="btn btn-secondary" href="../kompass.html">Grundlagen öffnen</a>
        </div>
      </section>

      <section class="section" id="kernformel" aria-labelledby="kernformel-title">
        <div class="section-header compact">
          <p class="hero-kicker">Kernformel</p>
          <h2 id="kernformel-title">Wirkung ist nicht Absicht, Reichweite oder Kapital.</h2>
          <p><strong>Wirkung</strong> ist die tatsächliche Veränderung von Zuständen. Sie kann positiv, negativ oder neutral sein - und sie muss im jeweiligen Wirkungsraum geprüft werden.</p>
        </div>
      </section>

      <section class="section" id="ausgangspunkt" aria-labelledby="ausgangspunkt-title">
        <div class="prose">
          <p class="hero-kicker">Ausgangspunkt</p>
          <h2 id="ausgangspunkt-title">Wirkungsblindheit macht Folgen unsichtbar</h2>
          <p>Viele Systeme messen Umsatz, Kosten, Klicks, Stimmen, Rendite oder Veröffentlichungen. Sie sehen aber nur teilweise, ob sich Zustände für <strong>Mensch, Planet und Demokratie</strong> verbessern oder verschlechtern.</p>
          <p>Dadurch können Schäden ausgelagert werden: schlechte Luft, Vertrauensverlust, Überlastung, Abhängigkeit, soziale Spaltung oder demokratische Erosion tauchen dann nicht dort auf, wo Entscheidungen getroffen werden.</p>
        </div>
      </section>

      <section class="section" id="wirkungsmodell" aria-labelledby="wirkungsmodell-title">
        <div class="section-header">
          <p class="hero-kicker">Modell</p>
          <h2 id="wirkungsmodell-title">Vier Schritte machen Wirkung lesbar</h2>
        </div>
        <div class="card-grid four">
          <article class="card">
            <p class="card-kicker">1</p>
            <h3 class="card-title">Handlung</h3>
            <p class="card-text">Eine Entscheidung, ein Produkt, eine Regel, ein Preis, ein Medium oder ein politischer Satz greift in ein System ein.</p>
          </article>
          <article class="card">
            <p class="card-kicker">2</p>
            <h3 class="card-title">Zustandsveränderung</h3>
            <p class="card-text">Geprüft wird, was sich dadurch real verändert: Belastung, Freiheit, Sicherheit, Vertrauen, Ressourcen, Teilhabe oder Resilienz.</p>
          </article>
          <article class="card">
            <p class="card-kicker">3</p>
            <h3 class="card-title">Bewertung</h3>
            <p class="card-text">Die Veränderung wird nicht moralisch geraten, sondern entlang von Mensch, Planet und Demokratie eingeordnet.</p>
          </article>
          <article class="card">
            <p class="card-kicker">4</p>
            <h3 class="card-title">Rückkopplung</h3>
            <p class="card-text">Gute Wirkung muss sich lohnen, schädliche Wirkung darf nicht billig bleiben. Dafür braucht es Preise, Regeln, Kapital, Beschaffung und Verantwortung.</p>
          </article>
        </div>
      </section>

      <section class="section" id="rueckkopplung" aria-labelledby="rueckkopplung-title">
        <div class="prose">
          <p class="hero-kicker">Rückkopplung</p>
          <h2 id="rueckkopplung-title">Die Wirkungsökonomie ersetzt keine Demokratie</h2>
          <p>Sie liefert einen klareren Maßstab für demokratische Entscheidungen. Parlamente, Verwaltungen, Unternehmen und Bürger:innen können sichtbar machen, welche Folgen bisher ausgeblendet waren und welche Zielkonflikte politisch entschieden werden müssen.</p>
          <p>Der Unterschied zur alten Logik ist einfach: Nicht nur Output zählt, sondern Netto-Wirkung. Nicht nur Absicht zählt, sondern überprüfbare Veränderung. Nicht nur Marktpreis zählt, sondern auch der Schaden oder Nutzen, der bisher außerhalb der Rechnung lag.</p>
        </div>
      </section>

      <section class="section" aria-labelledby="weiter-title">
        <div class="section-header">
          <p class="hero-kicker">Weitergehen</p>
          <h2 id="weiter-title">Wo du tiefer einsteigen kannst</h2>
        </div>
        <div class="card-grid three">
          <article class="card">
            <h3 class="card-title">WÖk-Kompass</h3>
            <p class="card-text">Kurzantworten, Begriffe und Pfade für den schnellen Einstieg.</p>
            <a class="text-link" href="../kompass.html">Kompass öffnen</a>
          </article>
          <article class="card">
            <h3 class="card-title">Wirkungsradar</h3>
            <p class="card-text">Narrative, Frames und öffentliche Aussagen wirkungsökonomisch prüfen.</p>
            <a class="text-link" href="../wirkungsradar/">Radar öffnen</a>
          </article>
          <article class="card">
            <h3 class="card-title">Methoden & Werkzeuge</h3>
            <p class="card-text">Scorecards, Register, Rechner und Methoden für praktische Anwendung.</p>
            <a class="text-link" href="../werkzeuge/">Methoden öffnen</a>
          </article>
        </div>
      </section>
    </main>
${renderFooter(BASE)}
    <script src="../assets/js/main.js?v=20260612-mobile-headline-fix"></script>
  </body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html);
console.log("Built so-wirkt-wirkungsoekonomie/index.html.");
