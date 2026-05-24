import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const outDir = "begriffe";
fs.mkdirSync(outDir, { recursive: true });
const categoryOrder = [
  "Grundbegriff",
  "Bewertungsbegriff",
  "Messbegriff",
  "Steuerungsbegriff",
  "Architekturbegriff",
  "Schutzbegriff",
  "Datenbegriff",
  "Demokratiebegriff",
  "Praxisbegriff",
];

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
    <link rel="stylesheet" href="${depth}assets/css/style.css?v=20260524-begriffe-css-fix">
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
const categories = categoryOrder.filter((category) => data.terms.some((term) => term.category === category));
const indexBody = `      <section class="hero compact-hero">
        <p class="hero-kicker">WÖk-Referenzsystem</p>
        <h1>Begriffe der Wirkungsökonomie</h1>
        <p class="hero-subtitle">Alphabetische Begriffsschicht für Hoverdefinitionen, Crosslinks, Terminologieprüfung, Suche und spätere PDF-Glossare.</p>
        <p class="notice">Die Begriffe dieser Seite folgen dem Führenden Begriffsleitfaden der Wirkungsökonomie, Version 1.0, Stand 21. Mai 2026. Ältere Projektdateien können frühere Begriffsverwendungen enthalten.</p>
      </section>
      <section class="content-band glossary-filter-panel" aria-labelledby="glossary-filter-title">
        <h2 id="glossary-filter-title">Begriffe filtern</h2>
        <label>
          <span class="sr-only">Glossar durchsuchen</span>
          <input type="search" placeholder="Begriff, Alias oder Definition suchen" data-glossary-search>
        </label>
        <div class="filter-chip-row" aria-label="Begriffskategorien">
          <button type="button" class="active" data-glossary-category="all">Alle</button>
          ${categories.map((category) => `<button type="button" data-glossary-category="${esc(category)}">${esc(category.replace("begriff", ""))}</button>`).join("")}
        </div>
        <p class="reference-filter-status" data-glossary-filter-status></p>
      </section>
      <nav class="az-nav" aria-label="Alphabetische Navigation">
        ${nav.map((letter) => `<a href="#${esc(letter)}">${esc(letter)}</a>`).join(" ")}
      </nav>
      ${nav.map((letter) => {
        const items = groups.get(letter);
        return `<section id="${esc(letter)}" class="content-band">
        <h2>${esc(letter)}</h2>
        <div class="card-grid">${items.map((term) => `<article class="info-card" data-glossary-card data-category="${esc(term.category || "")}" data-search="${esc([term.canonicalLabel, term.shortDefinition, term.hoverDefinition, ...(term.synonyms || [])].join(" ").toLowerCase())}">
          <h3><a href="${esc(term.slug)}/">${esc(term.canonicalLabel)}</a></h3>
          <p>${esc(term.shortDefinition)}</p>
          <p class="meta-line">${esc(term.category || "Begriff")} · ${esc(term.status)} · Version ${esc(term.version)}</p>
        </article>`).join("")}</div>
      </section>`;
      }).join("\n")}
      <script>
        (() => {
          const search = document.querySelector("[data-glossary-search]");
          const buttons = Array.from(document.querySelectorAll("[data-glossary-category]"));
          const cards = Array.from(document.querySelectorAll("[data-glossary-card]"));
          const status = document.querySelector("[data-glossary-filter-status]");
          let active = "all";
          function apply() {
            const q = search instanceof HTMLInputElement ? search.value.trim().toLowerCase() : "";
            let visible = 0;
            cards.forEach((card) => {
              const categoryMatch = active === "all" || card.dataset.category === active;
              const textMatch = !q || (card.dataset.search || card.textContent || "").toLowerCase().includes(q);
              const show = categoryMatch && textMatch;
              card.hidden = !show;
              if (show) visible += 1;
            });
            if (status) status.textContent = visible + " Begriffe sichtbar";
          }
          buttons.forEach((button) => button.addEventListener("click", () => {
            active = button.dataset.glossaryCategory || "all";
            buttons.forEach((item) => item.classList.toggle("active", item === button));
            apply();
          }));
          search?.addEventListener("input", apply);
          apply();
        })();
      </script>`;

fs.writeFileSync(path.join(outDir, "index.html"), pageShell("Begriffe", indexBody, "../"));

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
          <h2>Warum wichtig?</h2>
          <p>${esc(term.preferredUsage || term.usageNote || "Der Begriff hilft, Wirkung, Bewertung und Rückkopplung präzise zu unterscheiden.")}</p>
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
        <section>
          <h2>Relevante Kapitel</h2>
          <p>${esc((term.relatedChapters || []).join(", ") || "Siehe Kapitel-Navigator der Online-Referenz.")}</p>
        </section>
        <section class="meta-box">
          <h2>Version und Quelle</h2>
          <p>Kategorie: ${esc(term.category || "Begriff")} · Status: ${esc(term.status)} · Version: ${esc(term.version)} · Review: ${esc(term.reviewStatus)}</p>
          <p>Quelle: ${esc(term.sourceDocument)} · Abschnitt: ${esc(term.sourceSection)}</p>
        </section>
      </article>`;
  fs.writeFileSync(path.join(dir, "index.html"), pageShell(term.canonicalLabel, body, "../../"));
}

console.log(`Wrote glossary index and ${data.terms.length} term pages.`);
