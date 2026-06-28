import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE = "https://wirkungsoekonomie.de";
const ASSET_VERSION = "20260628-faktencheck-bot-guides";
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const headerTemplate = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");

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

function navSlug(label) {
  return String(label)
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function navLink(item, base) {
  return `<a href="${esc(base + item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function headerItem(item, base) {
  if (!item.childrenRef) return navLink(item, base);
  const children = navigation[item.childrenRef] || [];
  const panel = children.map((child) => `        ${navLink(child, base)}`).join("\n");
  return `<details class="nav-more nav-${esc(navSlug(item.label))}" data-nav-match="${esc(navMatch(item))}">
  <summary>${esc(item.label)}</summary>
  <div class="nav-more-panel">
${panel}
  </div>
</details>`;
}

function headerUtilityItems() {
  return (navigation.more || []).filter((item) => ["Suche", "WÖk-KI", "Mein Wirkungsraum"].includes(item.label));
}

function utilityLink(item, base) {
  const slug = navSlug(item.label);
  const primary = item.label === "Mein Wirkungsraum" ? ' data-utility-primary="true"' : "";
  return `<a class="site-utility-link site-utility-link--${esc(slug)}" href="${esc(base + item.href)}" data-nav-match="${esc(navMatch(item))}" data-utility-label="${esc(item.label)}"${primary}>${esc(item.label)}</a>`;
}

function footerGroup(group, base) {
  return `<div class="footer-nav-group">
  <h3>${esc(group.title)}</h3>
  <div class="footer-nav-links">
      ${(group.items || []).map((item) => navLink(item, base)).join("\n      ")}
  </div>
</div>`;
}

function layoutParts(base) {
  const header = headerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{HEADER_NAV}}", navigation.header.map((item) => headerItem(item, base)).join("\n        "))
    .replaceAll("{{HEADER_UTILITY_NAV}}", headerUtilityItems().map((item) => utilityLink(item, base)).join("\n        "));
  const footer = footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n    "));
  return { header, footer };
}

function page({ title, description, canonicalPath, base, body }) {
  const { header, footer } = layoutParts(base);
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${SITE}${canonicalPath}">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${ASSET_VERSION}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
  </head>
  <body>
${header}
    <main>
${body}
    </main>
${footer}
    <script src="${base}assets/js/main.js?v=${ASSET_VERSION}"></script>
  </body>
</html>
`;
}

const indexBody = `      <section class="hero compact-hero">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Werkzeuge</a> / Faktencheck-Bot</nav>
        <p class="hero-kicker">Discord-Werkzeug</p>
        <h1>WÖk-Faktencheck-Bot</h1>
        <p class="hero-subtitle">Der Bot prüft Aussagen im Discord: Antwort zuerst, dann Quellen, Wahrheitsgehalt, Frame, Wirkungslogik und Grenzen.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="kurzanleitung/">Kurzanleitung öffnen</a>
          <a class="btn btn-secondary" href="anleitung/">Ausführliche Anleitung lesen</a>
        </div>
      </section>
      <section class="section">
        <div class="card-grid three">
          <article class="card"><p class="card-kicker">Schnellstart</p><h2>/check</h2><p>Prüft eine konkrete Aussage. Optional mit Link, Kontext oder Screenshot.</p></article>
          <article class="card"><p class="card-kicker">Wissen</p><h2>/woek</h2><p>Beantwortet Fragen zur Wirkungsökonomie aus dem Website-Wissensstand.</p></article>
          <article class="card"><p class="card-kicker">Produkt</p><h2>/produkt</h2><p>Ordnet Produktversprechen, Wirkungsscore, SDG/SDG+ und Reverse Merit Order ein.</p></article>
        </div>
      </section>`;

const quickBody = `      <section class="hero compact-hero">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Werkzeuge</a> / <a href="../">Faktencheck-Bot</a> / Kurzanleitung</nav>
        <p class="hero-kicker">Kurzanleitung</p>
        <h1>In zwei Minuten zum Faktencheck.</h1>
        <p class="hero-subtitle">Du brauchst nur eine konkrete Aussage. Der Bot macht daraus eine prüfbare, quellengebundene Einordnung.</p>
      </section>
      <section class="section">
        <div class="card-grid three">
          <article class="card"><p class="card-kicker">1</p><h2>Aussage einfügen</h2><p>Nutze <strong>/check aussage:</strong> und kopiere den Satz möglichst wörtlich hinein.</p></article>
          <article class="card"><p class="card-kicker">2</p><h2>Kontext ergänzen</h2><p>Wenn möglich: Link, Screenshot, wer es gesagt hat, wo es stand und worauf sich die Aussage bezieht.</p></article>
          <article class="card"><p class="card-kicker">3</p><h2>Antwort nutzen</h2><p>Die Antwort kommt zuerst. Danach folgen Erklärung, Quellen, Frame, WÖk-Einordnung und Grenzen.</p></article>
        </div>
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Beispiele</p><h2>Gute Eingaben sind konkret.</h2></div>
        <div class="table-wrap"><table class="data-table">
          <tbody>
            <tr><th scope="row">Nur Aussage</th><td><code>/check aussage: Der Klimawandel ist nicht menschengemacht.</code></td></tr>
            <tr><th scope="row">Mit Kontext</th><td><code>/check aussage: ... kontext: Link zum Artikel oder kurzer Hinweis</code></td></tr>
            <tr><th scope="row">Mit Bild</th><td><code>/check aussage: ... belegbild: Screenshot oder Foto</code></td></tr>
            <tr><th scope="row">Öffentlich posten</th><td><code>sichtbar:true</code> nur verwenden, wenn die Antwort in den Kanal soll.</td></tr>
          </tbody>
        </table></div>
      </section>
      <section class="section">
        <article class="card"><p class="card-kicker">Merksatz</p><h2>Der Bot bewertet Aussagen, nicht Menschen.</h2><p>Er kann Frames sichtbar machen und Antworten formulieren. Er ersetzt keine redaktionelle Prüfung bei heiklen, medizinischen, rechtlichen oder finanziellen Fragen.</p><p><a class="btn btn-primary" href="../anleitung/">Ausführliche Anleitung lesen</a></p></article>
      </section>`;

const guideBody = `      <section class="hero compact-hero">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Werkzeuge</a> / <a href="../">Faktencheck-Bot</a> / Anleitung</nav>
        <p class="hero-kicker">Ausführliche Anleitung</p>
        <h1>So nutzt du den WÖk-Faktencheck-Bot.</h1>
        <p class="hero-subtitle">Der Bot verbindet Faktenprüfung, Frame-Analyse und wirkungsökonomische Einordnung. Er antwortet zuerst brauchbar, erklärt danach die Belege und die Wirkung der Aussage.</p>
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Kommandos</p><h2>Die Oberfläche besteht aus fünf Slash-Commands.</h2></div>
        <div class="card-grid two">
          <article class="card"><h2>/check</h2><p>Für Aussagen, Behauptungen, Artikelzitate, Screenshots oder Debattenclaims. Wichtig sind Aussage, Kontext und möglichst eine Quelle.</p></article>
          <article class="card"><h2>/woek</h2><p>Für Fragen zur Wirkungsökonomie. Die Antwort nutzt den aktuellen Website-Wissensstand und verlinkt passende Seiten.</p></article>
          <article class="card"><h2>/produkt</h2><p>Für Produktversprechen, Werbeclaims und Herstellerinformationen. Der Bot ordnet Wirkungsscore, SDG/SDG+, Datenqualität und Reverse Merit Order ein.</p></article>
          <article class="card"><h2>/fall und /review</h2><p><strong>/fall</strong> zeigt gespeicherte Faktenchecks erneut. <strong>/review</strong> ist für redaktionelle Prüfung durch berechtigte Serverrollen.</p></article>
        </div>
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Was eine gute Prüfung braucht</p><h2>Kontext entscheidet über die Qualität.</h2></div>
        <div class="table-wrap"><table class="data-table">
          <tbody>
            <tr><th scope="row">Originalsatz</th><td>Den Satz möglichst wörtlich eingeben. Keine Zusammenfassung, wenn ein Originalzitat vorhanden ist.</td></tr>
            <tr><th scope="row">Quelle oder Link</th><td>Artikel, Post, Studie, Video-Beschreibung oder Dokumentlink in <code>kontext</code> ergänzen.</td></tr>
            <tr><th scope="row">Screenshot oder Foto</th><td>Als <code>belegbild</code> anhängen, wenn Text nicht kopierbar ist. Kopierter OCR-Text ist oft noch besser.</td></tr>
            <tr><th scope="row">Themenbereich</th><td>Der Bereich hilft beim Quellenplan: Klima, Sozialstaat, Demokratie, High-Stakes oder Breaking News.</td></tr>
            <tr><th scope="row">Sichtbarkeit</th><td>Ohne <code>sichtbar:true</code> ist die Antwort nur für dich sichtbar. Öffentlich posten nur, wenn das in den Kanal passt.</td></tr>
          </tbody>
        </table></div>
      </section>
      <section class="section">
        <div class="section-header"><p class="hero-kicker">Ausgabe</p><h2>Warum die Antwort in dieser Reihenfolge kommt.</h2></div>
        <div class="card-grid three">
          <article class="card"><h2>Antwort zuerst</h2><p>Du bekommst sofort eine nutzbare Antwort in einfacher Sprache.</p></article>
          <article class="card"><h2>Dann Prüfung</h2><p>Wahrheitsgehalt, Einzelbehauptungen, Quellen und Datenstand werden getrennt sichtbar.</p></article>
          <article class="card"><h2>Dann Wirkung</h2><p>Der Bot benennt Frame, mögliche Funktion, Wirkpfad, Reframing und Grenzen der Aussage.</p></article>
        </div>
      </section>
      <section class="section">
        <article class="card"><p class="card-kicker">Grenzen</p><h2>Der Bot ist kein Wahrheitsautomat.</h2><p>Bei unsicherer Quellenlage sagt er das. Bei Medizin, Recht, Finanzen, Sicherheit oder akuten Ereignissen braucht es besondere Vorsicht und gegebenenfalls redaktionelle Prüfung. Menschen werden nicht bewertet; geprüft werden Aussagen, Quellen, Frames und Wirkungsräume.</p><p><a class="btn btn-primary" href="../kurzanleitung/">Zur Kurzanleitung</a></p></article>
      </section>`;

const pages = [
  {
    output: path.join(ROOT, "werkzeuge/faktencheck-bot/index.html"),
    title: "WÖk-Faktencheck-Bot | Wirkungsökonomie",
    description: "Discord-Oberfläche für wirkungsökonomische Faktenchecks mit Kurzanleitung und ausführlicher Anleitung.",
    canonicalPath: "/werkzeuge/faktencheck-bot/",
    base: "../../",
    body: indexBody
  },
  {
    output: path.join(ROOT, "werkzeuge/faktencheck-bot/kurzanleitung/index.html"),
    title: "Kurzanleitung WÖk-Faktencheck-Bot | Wirkungsökonomie",
    description: "Kurzanleitung für den WÖk-Faktencheck-Bot im Discord.",
    canonicalPath: "/werkzeuge/faktencheck-bot/kurzanleitung/",
    base: "../../../",
    body: quickBody
  },
  {
    output: path.join(ROOT, "werkzeuge/faktencheck-bot/anleitung/index.html"),
    title: "Anleitung WÖk-Faktencheck-Bot | Wirkungsökonomie",
    description: "Ausführliche Anleitung für den WÖk-Faktencheck-Bot mit Kommandos, Belegen, Sichtbarkeit und Grenzen.",
    canonicalPath: "/werkzeuge/faktencheck-bot/anleitung/",
    base: "../../../",
    body: guideBody
  }
];

for (const entry of pages) {
  fs.mkdirSync(path.dirname(entry.output), { recursive: true });
  fs.writeFileSync(entry.output, page(entry), "utf8");
}

console.log(`Faktencheck-Bot-Anleitungen gebaut: ${pages.length}`);
