import fs from "node:fs";
import path from "node:path";

// Übersichtsseite aller RSS-Feeds unter /feeds/. Scannt dynamisch feeds/*.xml
// (Kanal-Titel/Beschreibung/Link) — neue Feeds erscheinen automatisch.
const site = "https://wirkungsoekonomie.de";
const CSS_VERSION = "20260612-mobile-table-fix";
const navigation = JSON.parse(fs.readFileSync("assets/data/navigation.json", "utf8"));
const headerTemplate = fs.readFileSync("templates/header.html", "utf8");
const footerTemplate = fs.readFileSync("templates/footer.html", "utf8");
const feedDir = "feeds";

// Bevorzugte Reihenfolge; unbekannte Feeds folgen alphabetisch.
const ORDER = [
  "quellenarchiv.xml",
  "journal.xml",
  "podcast.xml",
  "bibliothek.xml",
  "oeffentlicher-wirkungsraum.xml",
  "startseite.xml"
];

function esc(v) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function navSlug(v) {
  return String(v || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/ö/g, "oe").replace(/ä/g, "ae").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const headerUtilityLabels = new Set(["Suche", "WÖk-KI", "WÖk-App", "Mein Wirkungsraum"]);
const navMatch = (item) => (item.match || [item.href]).join("|");
const navLink = (item, base) => `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
function headerUtilityNav(base) {
  return (navigation.more || []).filter((i) => headerUtilityLabels.has(i.label)).map((item) => {
    const label = esc(item.label);
    const text = item.label === "WÖk-KI" ? "KI" : label;
    const cls = item.label === "WÖk-KI" ? "woek-ki" : navSlug(item.label);
    const primary = item.label === "Mein Wirkungsraum" ? ' data-utility-primary="true"' : "";
    return `<a class="site-utility-link site-utility-link--${esc(cls)}" href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}" data-utility-label="${label}"${primary}>${text}</a>`;
  }).join("\n    ");
}
const footerGroup = (g, base) => `<div class="footer-nav-group">
      <h3>${esc(g.title)}</h3>
      <div class="footer-nav-links">
${g.items.map((i) => `          ${navLink(i, base)}`).join("\n")}
      </div>
    </div>`;
function renderHeader(base) {
  return headerTemplate.replaceAll("{{BASE}}", base)
    .replace("{{HEADER_NAV}}", navigation.header.map((i) => navLink(i, base)).join("\n    "))
    .replaceAll("{{HEADER_UTILITY_NAV}}", headerUtilityNav(base));
}
function renderFooter(base) {
  return footerTemplate.replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((g) => footerGroup(g, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((i) => navLink(i, base)).join("\n"));
}
function pageShell(title, body, depth, opts = {}) {
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(opts.metaTitle || `${title} - Wirkungsökonomie`)}</title>
    <meta name="description" content="${esc(opts.metaDescription || "")}">
    <link rel="stylesheet" href="${depth}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
${renderHeader(depth)}
    <main class="section">
${body}
    </main>
${renderFooter(depth)}
    <script src="${depth}assets/js/main.js?v=${CSS_VERSION}"></script>
  </body>
</html>
`.replace(/[ \t]+$/gm, "");
}

function channelMeta(xmlText) {
  const chan = xmlText.slice(xmlText.indexOf("<channel"));
  const pick = (tag) => {
    const m = chan.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
    return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
  };
  const count = (chan.match(/<item[\s>]/g) || []).length;
  return { title: pick("title"), description: pick("description"), link: pick("link"), count };
}

function main() {
  const files = fs.existsSync(feedDir)
    ? fs.readdirSync(feedDir).filter((f) => f.endsWith(".xml"))
    : [];
  files.sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });
  const feeds = files.map((file) => {
    const meta = channelMeta(fs.readFileSync(path.join(feedDir, file), "utf8"));
    return { file, url: `${site}/feeds/${file}`, ...meta };
  }).filter((f) => f.title);

  const cards = feeds.map((f) => `      <article class="info-card">
        <h3>${esc(f.title)}</h3>
        <p class="card-summary">${esc(f.description)}</p>
        <p class="card-meta"><span class="muted">${f.count} Einträge</span></p>
        <p><a class="btn btn-primary" href="${esc(f.url)}">Feed abonnieren ↗</a></p>
        <p class="muted" style="word-break:break-all;font-size:0.85rem">${esc(f.url)}</p>
      </article>`).join("\n");

  const body = `      <section class="hero compact-hero">
        <p class="hero-kicker">Bleib auf dem Laufenden</p>
        <h1>RSS-Feeds der Wirkungsökonomie</h1>
        <p class="lead">Abonniere einzelne Bereiche als RSS-Feed und bekomme neue Inhalte automatisch in deinem Feed-Reader — ohne Newsletter, ohne Konto.</p>
      </section>

      <section class="content-band">
        <div class="card-grid">
${cards}
        </div>
      </section>

      <section class="content-band">
        <h2>Wie funktioniert RSS?</h2>
        <p>Kopiere die Feed-Adresse (endet auf <code>.xml</code>) in einen RSS-Reader (z. B. Feedly, NetNewsWire, Thunderbird). Neue Beiträge erscheinen dann automatisch. Viele Browser und Reader erkennen den Feed auch direkt über das RSS-Symbol.</p>
      </section>`;

  fs.mkdirSync(feedDir, { recursive: true });
  fs.writeFileSync(path.join(feedDir, "index.html"), pageShell("RSS-Feeds", body, "../", {
    metaTitle: "RSS-Feeds der Wirkungsökonomie",
    metaDescription: "Alle RSS-Feeds der Wirkungsökonomie auf einen Blick: Quellenarchiv, Journal, Podcast, Bibliothek, Öffentlicher Wirkungsraum und Startseite."
  }));
  console.log(`[feeds] Übersichtsseite /feeds/ mit ${feeds.length} Feeds erzeugt.`);
}

main();
