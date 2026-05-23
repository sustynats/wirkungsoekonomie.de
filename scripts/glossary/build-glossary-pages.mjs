import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const outDir = "begriffe";
fs.mkdirSync(outDir, { recursive: true });

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageShell(title, body, depth = "") {
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} - Wirkungsökonomie</title>
    <meta name="description" content="Begriffsreferenz der Wirkungsökonomie: ${esc(title)}.">
    <link rel="stylesheet" href="${depth}assets/css/style.css?v=20260523-reference">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${depth}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${depth}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-nav" aria-label="Hauptnavigation">
        <a href="${depth}index.html">Start</a>
        <a href="${depth}verstehen.html">Verstehen</a>
        <a href="${depth}modell.html">Modell</a>
        <a href="${depth}glossar.html">Glossar</a>
        <a href="${depth}begriffe/">Begriffe</a>
        <a href="${depth}suche.html">Suche</a>
      </nav>
    </header>
    <main class="section">
${body}
    </main>
  </body>
</html>
`;
}

const groups = new Map();
for (const term of data.terms) {
  const letter = (term.glossaryOrderKey || term.canonicalLabel).trim()[0].toLocaleUpperCase("de");
  if (!groups.has(letter)) groups.set(letter, []);
  groups.get(letter).push(term);
}

const nav = Array.from(groups.keys()).sort(new Intl.Collator("de", { sensitivity: "base" }).compare);
const indexBody = `      <section class="hero compact-hero">
        <p class="hero-kicker">WÖk-Referenzsystem</p>
        <h1>Begriffe der Wirkungsökonomie</h1>
        <p class="hero-subtitle">Alphabetische Begriffsschicht für Hoverdefinitionen, Crosslinks, Terminologieprüfung, Suche und spätere PDF-Glossare.</p>
        <p class="notice">Phase 1: zentrale Glossarstruktur. Die bestehende Website-Suche bleibt die einzige Suche.</p>
      </section>
      <nav class="az-nav" aria-label="Alphabetische Navigation">
        ${nav.map((letter) => `<a href="#${esc(letter)}">${esc(letter)}</a>`).join(" ")}
      </nav>
      ${nav.map((letter) => {
        const items = groups.get(letter);
        return `<section id="${esc(letter)}" class="content-band">
        <h2>${esc(letter)}</h2>
        <div class="card-grid">${items.map((term) => `<article class="info-card">
          <h3><a href="${esc(term.slug)}/">${esc(term.canonicalLabel)}</a></h3>
          <p>${esc(term.shortDefinition)}</p>
          <p class="meta-line">${esc(term.status)} · Version ${esc(term.version)}</p>
        </article>`).join("")}</div>
      </section>`;
      }).join("\n")}`;

fs.writeFileSync(path.join(outDir, "index.html"), pageShell("Begriffe", indexBody));

for (const term of data.terms) {
  const dir = path.join(outDir, term.slug);
  fs.mkdirSync(dir, { recursive: true });
  const body = `      <article class="article-shell">
        <nav class="breadcrumb"><a href="../">Begriffe</a> / ${esc(term.canonicalLabel)}</nav>
        <h1>${esc(term.canonicalLabel)}</h1>
        <p class="lead">${esc(term.shortDefinition)}</p>
        <section class="callout">
          <h2>Hoverdefinition</h2>
          <p>${esc(term.hoverDefinition)}</p>
        </section>
        <section>
          <h2>Definition</h2>
          <p>${esc(term.longDefinition)}</p>
        </section>
        <section>
          <h2>Verwendung in der WÖk</h2>
          <p>${esc(term.usageNote)}</p>
        </section>
        <section>
          <h2>Nicht verwechseln mit</h2>
          <p>${esc((term.doNotConfuseWith || []).join(", ") || "Keine Einträge")}</p>
        </section>
        <section>
          <h2>Verwandte Begriffe</h2>
          <p>${esc((term.relatedTerms || []).join(", ") || "Keine Einträge")}</p>
        </section>
        <section class="meta-box">
          <h2>Version und Quelle</h2>
          <p>Status: ${esc(term.status)} · Version: ${esc(term.version)} · Review: ${esc(term.reviewStatus)}</p>
          <p>Quelle: ${esc(term.sourceDocument)} · Abschnitt: ${esc(term.sourceSection)}</p>
        </section>
      </article>`;
  fs.writeFileSync(path.join(dir, "index.html"), pageShell(term.canonicalLabel, body, "../../"));
}

console.log(`Wrote glossary index and ${data.terms.length} term pages.`);

