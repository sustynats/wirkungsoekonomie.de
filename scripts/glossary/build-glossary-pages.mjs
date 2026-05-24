import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const navigation = JSON.parse(fs.readFileSync("assets/data/navigation.json", "utf8"));
const headerTemplate = fs.readFileSync("templates/header.html", "utf8");
const footerTemplate = fs.readFileSync("templates/footer.html", "utf8");
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

function navMatch(item) {
  return (item.match || []).join("|");
}

function navLink(item, base) {
  return `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function footerGroup(group, base) {
  return `<div class="footer-nav-group">
      <h3>${esc(group.title)}</h3>
      <div class="footer-nav-links">
${group.items.map((item) => `          ${navLink(item, base)}`).join("\n")}
      </div>
    </div>`;
}

function renderHeader(base) {
  return headerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{HEADER_NAV}}", navigation.header.map((item) => navLink(item, base)).join("\n    "));
}

function renderFooter(base) {
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n"));
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
${renderHeader(depth)}
    <main class="section">
${body}
    </main>
${renderFooter(depth)}
    <script src="${depth}assets/js/main.js?v=20260524-begriffe-css-fix"></script>
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
const termsBySlug = new Map(data.terms.map((term) => [term.slug, term]));
const termTargetLinks = new Map([
  ["agenda-2030", "../../verstehen/sdgs-sdgplus/geschichte/"],
  ["sdg-sdgplus-referenzrahmen", "../../verstehen/sdgs-sdgplus/"],
  ["sdg-plus", "../../verstehen/sdgs-sdgplus/#sdgplus"],
  ["sdgs", "../../verstehen/sdgs-sdgplus/"],
  ["positive-netto-wirkung", "../../begriffe/positive-netto-wirkung/"],
  ["woek-id", "../../werkzeuge/woek-ids/"],
  ["scorecard", "../../werkzeuge/scorecards/"],
  ["reverse-merit-order", "../../werkzeuge/reverse-merit-order/"],
  ["t-sroi", "../../werkzeuge/impact-controlling/t-sroi/"],
  ["nwi", "../../werkzeuge/netto-wirkungs-index/"],
  ["wirkungsumsatzsteuer", "../../werkzeuge/wirkungsumsatzsteuer/"],
  ["wirkungssteuer", "../../werkzeuge/wirkungssteuergesetz/"],
  ["wirkungssteuergesetz", "../../werkstatt/gesetze/wirkungssteuergesetz/"],
  ["wstg", "../../werkstatt/gesetze/wirkungssteuergesetz/"],
  ["wustg", "../../werkstatt/gesetze/wirkungsumsatzsteuergesetz/"],
  ["wirkungsrat", "../../werkzeuge/wirkungsrat/"],
  ["wirkungshaushalt", "../../werkzeuge/wirkungshaushalt/"],
  ["wirkungsdatenraum", "../../werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"],
  ["digitaler-produktpass", "../../werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"],
  ["wirkungseinkommen", "../../wirkungsfelder/arbeit-einkommen/wirkungseinkommen/"],
  ["wirkungsrente", "../../wirkungsfelder/rente-soziale-sicherung/"],
  ["wohnwirkung", "../../wirkungsfelder/wohnen-stadt/"],
  ["warmmietenneutralitaet", "../../wirkungsfelder/wohnen-stadt/"],
  ["wix-vi", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["wirkungsvermietung", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["stranded-assets", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["spekulationslogik", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["csrd", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"],
  ["esrs", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"],
  ["eu-taxonomie", "../../wirkungsfelder/finanzsystem-kapital/"],
  ["esg", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"],
]);

function termLink(slug) {
  const term = termsBySlug.get(slug);
  if (!term) return `<span class="term-chip muted">${esc(slug)}</span>`;
  return `<a class="term-chip" href="../../begriffe/${esc(term.slug)}/">${esc(term.canonicalLabel)}</a>`;
}

function listItems(values, fallback = "Keine Einträge") {
  if (!Array.isArray(values) || values.length === 0) return `<p>${esc(fallback)}</p>`;
  return `<ul class="clean-list">${values.map((value) => `<li>${esc(value)}</li>`).join("")}</ul>`;
}

function detailLinks(term) {
  const links = [];
  const target = termTargetLinks.get(term.slug);
  if (target) links.push({ href: target, label: "Themenseite öffnen" });
  links.push({ href: "../../begriffe/", label: "Alle Begriffe" });
  links.push({ href: `../../suche.html?q=${encodeURIComponent(term.canonicalLabel)}`, label: "Website durchsuchen" });
  return links
    .map((link, index) => `<a class="btn ${index === 0 ? "btn-primary" : "btn-secondary"}" href="${esc(link.href)}">${esc(link.label)}</a>`)
    .join("");
}

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
  const body = `      <article class="article-shell glossary-detail">
        <nav class="breadcrumb"><a href="../">Begriffe</a> / ${esc(term.canonicalLabel)}</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">${esc(term.category || "Begriff")}</p>
          <h1>${esc(term.canonicalLabel)}</h1>
          <p class="lead">${esc(term.shortDefinition)}</p>
          <div class="term-meta-row" aria-label="Begriffsstatus">
            <span>Status: ${esc(term.status)}</span>
            <span>Version ${esc(term.version)}</span>
            <span>Review: ${esc(term.reviewStatus)}</span>
          </div>
          <div class="term-action-row">${detailLinks(term)}</div>
        </header>
        <section class="term-summary-card" aria-labelledby="term-summary-title">
          <h2 id="term-summary-title">Auf einen Blick</h2>
          <p>${esc(term.hoverDefinition)}</p>
        </section>
        <div class="term-section-grid">
          <section class="term-section-card">
            <p class="section-eyebrow">Definition</p>
            <h2>Was bedeutet der Begriff?</h2>
            <p>${esc(term.longDefinition)}</p>
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Wirkungsökonomie</p>
            <h2>Warum ist das wichtig?</h2>
            <p>${esc(term.preferredUsage || term.usageNote || "Der Begriff hilft, Wirkung, Bewertung und Rückkopplung präzise zu unterscheiden.")}</p>
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Verwendung</p>
            <h2>So wird der Begriff genutzt</h2>
            <p>${esc(term.usageNote)}</p>
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Abgrenzung</p>
            <h2>Nicht verwechseln mit</h2>
            ${listItems(term.doNotConfuseWith)}
          </section>
        </div>
        <section class="term-link-section" aria-labelledby="related-terms-title">
          <div>
            <p class="section-eyebrow">Verknüpfungen</p>
            <h2 id="related-terms-title">Verwandte Begriffe</h2>
          </div>
          <div class="term-chip-row">
            ${(term.relatedTerms || []).length ? term.relatedTerms.map(termLink).join("") : "<span class=\"term-chip muted\">Keine Einträge</span>"}
          </div>
        </section>
        <section class="term-link-section" aria-labelledby="chapters-title">
          <div>
            <p class="section-eyebrow">Online-Buch</p>
            <h2 id="chapters-title">Relevante Kapitel</h2>
          </div>
          <div class="term-chip-row">
            ${(term.relatedChapters || []).length
              ? term.relatedChapters.map((chapter) => `<span class="term-chip muted">${esc(chapter)}</span>`).join("")
              : `<a class="term-chip" href="../../referenz/">Kapitel-Navigator öffnen</a>`}
          </div>
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
