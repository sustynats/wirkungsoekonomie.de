import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE = "https://wirkungsoekonomie.de";
const TODAY = "2026-05-31";

const mainPages = [
  ["index.html", "/", "Wirkung statt Kapital | Wirkungsökonomie", "Die Wirkungsökonomie erklärt, wie Daten, Bewertung, Anreize und Lernen positive Netto-Wirkung für Mensch, Planet und Demokratie sichtbar und steuerbar machen.", "Wirkung statt Kapital"],
  ["verstehen.html", "/verstehen.html", "Wirkungsökonomie verstehen | Einstieg", "Verstehen, was Wirkung in der Wirkungsökonomie bedeutet: neutral, relational und bewertet am Referenzrahmen SDGs, Agenda 2030 und SDG+.", "Wirkungsökonomie verstehen"],
  ["verstehen/woek-auf-einer-seite/index.html", "/verstehen/woek-auf-einer-seite/", "WÖk auf einer Seite | Master-Map der Wirkungsökonomie", "Die Wirkungsökonomie kompakt erklärt: Wirkungsblindheit, Daten, Bewertung, Grenzen, Rückkopplung, Lernen und positive Netto-Wirkung.", "WÖk auf einer Seite"],
  ["wirkungsfelder/index.html", "/wirkungsfelder/", "Wirkungsfelder | Mensch, Planet und Demokratie", "Wirkungsfelder der Wirkungsökonomie: Alltag, Wirtschaft, Staat, Öffentlichkeit, Wissen, Planet und Resilienz als verbundene Handlungsräume.", "Wirkungsfelder der Wirkungsökonomie"],
  ["werkzeuge/index.html", "/werkzeuge/", "Methoden & Werkzeuge | Wirkungsökonomie", "Methodenlandkarte der Wirkungsökonomie mit WÖk-IDs, Scorecards, Reverse Merit Order, NWI, T-SROI, Datenqualität und Pilotwerkzeugen.", "Methoden & Werkzeuge"],
  ["erleben/index.html", "/erleben/", "Erleben | Demos der Wirkungsökonomie", "Modellhafte Demos der Wirkungsökonomie ausprobieren: Produktwirkung, Medienwirkung, Wirkungsschule, Automatisierung, Risiko und Resilienz.", "Wirkungsökonomie erleben"],
  ["einwaende/index.html", "/einwaende/", "Einwände & Missverständnisse | Wirkungsökonomie", "Antworten auf zentrale Einwände zur Wirkungsökonomie: Planwirtschaft, Social Credit, Messbarkeit, Datenlücken, Rechtsschutz und Schutzlinien.", "Einwände & Missverständnisse"],
  ["pilot-starten/index.html", "/pilot-starten/", "Pilot starten | Wirkungsökonomie anwenden", "Pilotpfade für Wirkungsökonomie: Produkt-Scorecards, Beschaffung, Lieferketten, Bildung, Medienwirkung, Kapital, Akademie und Datenräume.", "Pilot starten"],
  ["akademie.html", "/akademie.html", "Akademie | Lernpfad Wirkungskompetenz", "Akademie der Wirkungsökonomie als Lernpfad für Wirkungskompetenz: Grundbegriffe, SDGs, SDG+, Daten, Scorecards, NWI, T-SROI und Pilotierung.", "Akademie für Wirkungskompetenz"],
  ["downloads.html", "/downloads.html", "Bibliothek | Quellen und Versionen der Wirkungsökonomie", "Kuratierte Bibliothek der Wirkungsökonomie mit Grundlagenwerk, Whitepapers, Arbeitspapieren, Methodik, Glossar, Versionen und Lesepfaden.", "Bibliothek der Wirkungsökonomie"],
  ["begriffe/index.html", "/begriffe/", "Glossar | Begriffe der Wirkungsökonomie", "Glossar der Wirkungsökonomie mit Kurzdefinitionen, Langdefinitionen, Synonymen, verwandten Begriffen, Methoden und Wirkungsfeldern.", "Glossar der Wirkungsökonomie"],
  ["glossar.html", "/begriffe/", "Glossar | Begriffe der Wirkungsökonomie", "Vollständiger Glossar-Einstieg der Wirkungsökonomie mit Begriffsdetailseiten, Hoverdefinitionen, Suche, verwandten Begriffen und Querverlinkungen.", "Glossar der Wirkungsökonomie"],
  ["mitmachen.html", "/mitmachen.html", "Mitmachen | Wirkungsökonomie prüfen und pilotieren", "Mitmachen bei der Wirkungsökonomie: Feedback geben, Quellen prüfen, Methoden diskutieren, Pilotierung vorbereiten und Anwendungspartner werden.", "Mitmachen"],
].map(([file, canonical, title, description, ogTitle]) => ({ file, canonical, title, description, ogTitle }));

const redirectLabels = new Map([
  ["teil-iv-transformation-and-zukunft/index.html", "Weiterleitung zu Akademie"],
  ["leitbild/index.html", "Weiterleitung zum Leitbild"],
  ["ueber/index.html", "Weiterleitung zu Über"],
  ["ausprobieren/index.html", "Weiterleitung zu Erleben"],
  ["buch/index.html", "Weiterleitung zum Grundlagenwerk"],
  ["fa-qs-und-links/index.html", "Weiterleitung zum Glossar"],
  ["datenschutz/index.html", "Weiterleitung zum Datenschutz"],
  ["ueber-die-w-oek/index.html", "Weiterleitung zu Über"],
  ["afd-programm/index.html", "Weiterleitung zum Blogartikel"],
  ["manifest/index.html", "Weiterleitung zur Bibliothek"],
  ["inhalt-und-strategie/index.html", "Weiterleitung zu Wirkungsökonomie"],
  ["anwendungen/index.html", "Weiterleitung zu Wirkungsfeldern"],
  ["veroeffentlichungen/index.html", "Weiterleitung zur Bibliothek"],
  ["teil-iii-anwendung-and-praxis/index.html", "Weiterleitung zu Akademie"],
  ["teil-ii-methoden-and-instrumente/index.html", "Weiterleitung zu Akademie"],
  ["blog/index.html", "Weiterleitung zum Blog"],
  ["impressum/index.html", "Weiterleitung zum Impressum"],
  ["teil-i-grundlagen/index.html", "Weiterleitung zu Akademie"],
  ["akademie/index.html", "Weiterleitung zur Akademie"],
  ["wirkung-werte-journal/index.html", "Weiterleitung zum Blog"],
  ["wirkungsoekonomie/index.html", "Weiterleitung zu Wirkungsökonomie"],
  ["scorecard-dashboard/index.html", "Weiterleitung zum Scorecard-Dashboard"],
  ["mitmachen/index.html", "Weiterleitung zu Mitmachen"],
  ["funktionsweise.html", "Weiterleitung zum Modell"],
  ["ueber-die-woek/index.html", "Weiterleitung zu Über"],
  ["sdg-und-sdg-plus/index.html", "Weiterleitung zu SDGs und SDG+"],
  ["w-est-g-journal/index.html", "Weiterleitung zum Gesetzesmaterial"],
  ["modell/index.html", "Weiterleitung zum Modell"],
  ["glossar/index.html", "Weiterleitung zum Glossar"],
]);

const abs = (file) => path.join(ROOT, file);
const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function upsertTag(html, matcher, tag) {
  return matcher.test(html) ? html.replace(matcher, tag) : html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function updateMeta(page) {
  if (!fs.existsSync(abs(page.file))) return;
  let html = fs.readFileSync(abs(page.file), "utf8");
  const canonical = `${SITE}${page.canonical}`;
  html = upsertTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`);
  html = upsertTag(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(page.description)}">`);
  html = upsertTag(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}">`);
  html = upsertTag(html, /<meta\s+property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="website">`);
  html = upsertTag(html, /<meta\s+property=["']og:locale["'][^>]*>/i, `<meta property="og:locale" content="de_DE">`);
  html = upsertTag(html, /<meta\s+property=["']og:site_name["'][^>]*>/i, `<meta property="og:site_name" content="Wirkungsökonomie">`);
  html = upsertTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${esc(page.ogTitle)}">`);
  html = upsertTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${esc(page.description)}">`);
  html = upsertTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}">`);
  html = upsertTag(html, /<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">`);
  html = upsertTag(html, /<meta\s+name=["']twitter:card["'][^>]*>/i, `<meta name="twitter:card" content="summary_large_image">`);
  html = upsertTag(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${esc(page.ogTitle)}">`);
  html = upsertTag(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${esc(page.description)}">`);
  html = upsertTag(html, /<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">`);
  fs.writeFileSync(abs(page.file), html, "utf8");
}

function improveRedirectH1(file, label) {
  if (!fs.existsSync(abs(file))) return;
  let html = fs.readFileSync(abs(file), "utf8");
  if (/<h1\b/i.test(html)) return;
  html = html.replace(/<body>/i, `<body><main aria-labelledby="redirect-title"><h1 id="redirect-title">${esc(label)}</h1>`);
  html = html.replace(/<\/body>/i, `</main></body>`);
  fs.writeFileSync(abs(file), html, "utf8");
}

function updateSitemap() {
  const file = "sitemap.xml";
  if (!fs.existsSync(abs(file))) return;
  let xml = fs.readFileSync(abs(file), "utf8");
  for (const page of mainPages) {
    if (page.canonical === "/" || page.canonical.endsWith(".html")) continue;
    const loc = `${SITE}${page.canonical}`;
    const entry = `<url><loc>${loc}</loc><lastmod>${TODAY}</lastmod></url>`;
    if (!xml.includes(`<loc>${loc}</loc>`)) {
      xml = xml.replace("</urlset>", `  ${entry}\n</urlset>`);
    }
  }
  fs.writeFileSync(abs(file), xml, "utf8");
}

for (const page of mainPages) updateMeta(page);
for (const [file, label] of redirectLabels) improveRedirectH1(file, label);
updateSitemap();

console.log(`Stage 13 SEO/A11y updates applied to ${mainPages.length} main pages and ${redirectLabels.size} redirect stubs.`);
