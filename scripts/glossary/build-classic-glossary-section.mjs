import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryFile = path.join(root, "public/data/glossary.terms.json");
const glossaryFile = path.join(root, "glossar.html");

const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });
const registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
const glossaryHtml = fs.readFileSync(glossaryFile, "utf8");
const sectionStart = glossaryHtml.indexOf('<section class="section section-muted" id="glossar"');
const sectionEnd = glossaryHtml.indexOf("\n    </main>", sectionStart);
if (sectionStart === -1 || sectionEnd === -1) {
  throw new Error("Could not locate classic glossary section boundaries in glossar.html.");
}

const externalHtml = `${glossaryHtml.slice(0, sectionStart)}${glossaryHtml.slice(sectionEnd)}`;
const externalIds = new Set(Array.from(externalHtml.matchAll(/\sid="([^"]+)"/g), (match) => match[1]));

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function termLabel(term) {
  return term.canonicalLabel || term.label || term.termId;
}

function termPage(term) {
  return term.pageUrl || `/begriffe/${term.slug}/`;
}

function firstLetter(label) {
  const normalized = stripTags(label)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleUpperCase("de");
  const letter = normalized[0] || "#";
  if (/[0-9]/.test(letter)) return "0-9";
  if (/[A-Z]/.test(letter)) return letter;
  return "#";
}

function parseSource(value) {
  if (value && typeof value === "object") {
    return {
      label: value.label || value.title || "Quelle",
      url: value.url || value.href || "",
    };
  }
  const [label, url] = String(value || "").split("|");
  return {
    label: label?.trim() || "Quelle",
    url: url?.trim() || "",
  };
}

function distinctParagraphs(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const clean = stripTags(value);
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    result.push(clean);
  }
  return result;
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

function filterToken(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("de")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dimensionTokens(value) {
  const raw = String(value || "").toLocaleLowerCase("de");
  const tokens = [filterToken(value)];
  if (raw.includes("mensch")) tokens.push("mensch");
  if (raw.includes("planet")) tokens.push("planet");
  if (raw.includes("demokratie")) tokens.push("demokratie");
  return Array.from(new Set(tokens.filter(Boolean)));
}

function filterValues(field, fallbackField = "") {
  const values = new Set();
  for (const term of terms) {
    for (const value of asList(term[field] || (fallbackField ? term[fallbackField] : []))) values.add(value);
  }
  return Array.from(values).sort(collator.compare);
}

function filterButtons(name, label, values) {
  if (!values.length) return "";
  return `<fieldset class="glossary-filter-group" data-filter-group="${esc(name)}">
              <legend>${esc(label)}</legend>
              <div class="filter-chip-row">
                ${values.map((value) => `<button type="button" data-filter-name="${esc(name)}" data-filter-value="${esc(filterToken(value))}" aria-pressed="false">${esc(value)}</button>`).join("")}
              </div>
            </fieldset>`;
}

function termFilterData(term) {
  return {
    type: filterToken(term.type || term.begriffstyp || term.conceptStatus || term.concept_status || term.category),
    theme: asList(term.theme || term.themes).map(filterToken),
    dimension: asList(term.dimensions).flatMap(dimensionTokens),
    wirklogik: asList(term.wirklogik).map(filterToken),
    field: asList(term.applicationFields || term.application_fields).map(filterToken),
    source: asList(term.sourceField || term.source_field).map(filterToken),
  };
}

function dataAttrList(values) {
  return esc(asList(values).join(" "));
}

function termBadges(term) {
  const badges = [
    term.type || term.begriffstyp || term.conceptStatus || term.concept_status || term.category,
    ...asList(term.theme || term.themes).slice(0, 2),
    ...asList(term.dimensions).slice(0, 1),
  ].filter(Boolean).slice(0, 5);
  if (!badges.length) return "";
  return `<div class="term-card-tags">${badges.map((badge) => `<span>${esc(badge)}</span>`).join("")}</div>`;
}

const terms = (registry.terms || [])
  .filter((term) => term.classicGlossary !== false)
  .sort((a, b) => collator.compare(a.glossaryOrderKey || termLabel(a), b.glossaryOrderKey || termLabel(b)));
const termsById = new Map(terms.map((term) => [term.termId || term.id, term]));
const termsByLetter = new Map();

for (const term of terms) {
  const letter = firstLetter(termLabel(term));
  if (!termsByLetter.has(letter)) termsByLetter.set(letter, []);
  termsByLetter.get(letter).push(term);
}

function relatedLinks(term) {
  const links = (term.relatedTerms || [])
    .map((relatedId) => termsById.get(relatedId))
    .filter(Boolean)
    .slice(0, 10)
    .map((related) => `<a href="${esc(termPage(related))}">${esc(termLabel(related))}</a>`)
    .join("");
  return links || "<span>Keine direkten Glossarverweise hinterlegt.</span>";
}

function sourceLinks(term) {
  const links = (term.officialSources || [])
    .map(parseSource)
    .filter((source) => source.url)
    .slice(0, 4)
    .map((source) => `<a href="${esc(source.url)}">${esc(source.label)}</a>`)
    .join("");
  return links || "<span>Keine offizielle Quelle hinterlegt.</span>";
}

function aliasLine(term) {
  const aliases = (term.aliases || term.synonyms || [])
    .filter((alias) => alias && alias !== termLabel(term))
    .slice(0, 12);
  if (!aliases.length) return "";
  return `<p class="glossary-meta-line"><strong>Schreibweisen:</strong> ${esc(aliases.join(", "))}</p>`;
}

function renderTerm(term) {
  const slug = term.slug;
  const filterData = termFilterData(term);
  const primaryAnchor = `begriff-${slug}`;
  const dtId = externalIds.has(primaryAnchor) ? "" : ` id="${esc(primaryAnchor)}"`;
  const aliasAnchor = term.anchorId && !externalIds.has(term.anchorId)
    ? `<span class="classic-glossary-anchor" id="${esc(term.anchorId)}" aria-hidden="true"></span>`
    : "";
  const paragraphs = distinctParagraphs([term.shortDefinition, term.definition, term.longDefinition]);
  const woekRelation = stripTags(term.woekRelation);
  const statusOrUsage = stripTags(term.statusNote || term.usageNote);
  const body = [];
  if (paragraphs[0]) body.push(`<p><strong>Kurzdefinition:</strong> ${esc(paragraphs[0])}</p>`);
  if (paragraphs[1]) body.push(`<p><strong>Erklärung:</strong> ${esc(paragraphs[1])}</p>`);
  if (paragraphs[2]) body.push(`<p>${esc(paragraphs[2])}</p>`);
  if (woekRelation && !paragraphs.includes(woekRelation)) body.push(`<p><strong>WÖk-Bezug:</strong> ${esc(woekRelation)}</p>`);
  if (term.mythos) body.push(`<p><strong>Mythos:</strong> ${esc(term.mythos)}</p>`);
  if (term.woekKlaerung || term.woek_klaerung) body.push(`<p><strong>WÖk-Klärung:</strong> ${esc(term.woekKlaerung || term.woek_klaerung)}</p>`);
  if (term.blindSpot || term.blind_spot) body.push(`<p><strong>Blinder Fleck:</strong> ${esc(term.blindSpot || term.blind_spot)}</p>`);
  if (statusOrUsage) body.push(`<p><strong>Grenze / Status:</strong> ${esc(statusOrUsage)}</p>`);
  body.push(termBadges(term));
  body.push(aliasLine(term));
  body.push(`<p class="glossary-meta-line"><strong>Verwandt:</strong> ${relatedLinks(term)}</p>`);
  body.push(`<p class="glossary-meta-line"><strong>Offizielle Quelle:</strong> ${sourceLinks(term)}</p>`);
  body.push(`<p class="glossary-entry-action"><a class="text-link" href="${esc(termPage(term))}">Begriff vertiefen</a></p>`);

  return `              <div class="classic-glossary-entry" id="klassisch-${esc(slug)}" data-classic-term-id="${esc(term.termId)}" data-glossary-card data-type="${esc(filterData.type)}" data-theme="${dataAttrList(filterData.theme)}" data-dimension="${dataAttrList(filterData.dimension)}" data-wirklogik="${dataAttrList(filterData.wirklogik)}" data-field="${dataAttrList(filterData.field)}" data-source="${dataAttrList(filterData.source)}" data-search="${esc([termLabel(term), term.shortDefinition, term.definition, term.longDefinition, term.woekRelation, term.mythos, term.woekKlaerung, ...(term.aliases || []), ...(term.synonyms || [])].join(" ").toLowerCase())}">
                <dt${dtId}>${aliasAnchor}${esc(termLabel(term))}</dt>
                <dd>
                  ${body.filter(Boolean).join("\n                  ")}
                </dd>
              </div>`;
}

function renderLetter([letter, letterTerms]) {
  const anchor = letter === "0-9" ? "ziffern" : letter.toLocaleLowerCase("de");
  return `          <section class="classic-glossary-letter" id="glossar-${esc(anchor)}" aria-labelledby="glossar-${esc(anchor)}-title">
            <h3 id="glossar-${esc(anchor)}-title">${esc(letter)}</h3>
            <dl class="term-list compact">
${letterTerms.map(renderTerm).join("\n")}
            </dl>
          </section>`;
}

function renderSection() {
  const letters = Array.from(termsByLetter.keys()).sort((a, b) => collator.compare(a, b));
  const nav = renderAlphabetNav(letters);
  const typeValues = [...filterValues("type"), ...filterValues("begriffstyp"), ...filterValues("conceptStatus")].filter((value, index, all) => value && all.indexOf(value) === index);

  return `      <section class="section section-muted" id="glossar" aria-labelledby="glossar-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Glossar</p>
            <h2 id="glossar-title">Glossar von A bis Z und nach Themen</h2>
            <p>Der vollständige alphabetische Index lässt sich zusätzlich nach Begriffstyp, Themenwelt, WÖk-Dimension, Wirklogik, Anwendungsfeld und Quellenfeld filtern. Suche und Filter durchsuchen auch Aliasse und Synonyme.</p>
          </div>
          <div class="glossary-filter-panel" aria-label="Glossarfilter">
            <label class="glossary-search-field">
              <span>Freitextsuche</span>
              <input type="search" placeholder="Begriff, Alias, Synonym oder Definition suchen" data-glossary-search aria-label="Glossar durchsuchen">
            </label>
            <div class="glossary-quick-filters" aria-label="Schnellfilter">
              <button type="button" data-quick-filter="theme=wirkung-und-wirkungslogik">Wirkung verstehen</button>
              <button type="button" data-quick-filter="theme=wirtschaftssysteme-und-gesellschaftsmodelle">Wirtschaftssysteme vergleichen</button>
              <button type="button" data-quick-filter="theme=demokratie-medien-und-oeffentlichkeit">Medienwirkung & Folgencheck</button>
              <button type="button" data-quick-filter="theme=klima-energie-und-lebenszyklus">Klima & Produktwirkung</button>
              <button type="button" data-quick-filter="theme=management-organisation-und-wirksamkeit">Management & Innovation</button>
              <button type="button" data-quick-filter="theme=psychologie-und-resonanz">Psychologische Wirkmechanismen</button>
              <button type="button" data-quick-filter="theme=philosophie-ethik-und-werte">Philosophie & Werte</button>
            </div>
            <div class="glossary-filter-grid">
              ${filterButtons("type", "Begriffstyp", typeValues)}
              ${filterButtons("theme", "Themenwelt", filterValues("theme", "themes"))}
              ${filterButtons("dimension", "WÖk-Dimension", filterValues("dimensions"))}
              ${filterButtons("wirklogik", "Wirklogik", filterValues("wirklogik"))}
              ${filterButtons("field", "Anwendungsfeld", filterValues("applicationFields", "application_fields"))}
              ${filterButtons("source", "Quellenfeld", filterValues("sourceField", "source_field"))}
            </div>
            <div class="glossary-filter-actions">
              <button type="button" class="btn btn-secondary" data-glossary-reset>Filter zurücksetzen</button>
              <p class="reference-filter-status" data-glossary-filter-status role="status" aria-live="polite"></p>
            </div>
          </div>
          <nav class="glossary-standard-nav" aria-label="Alphabetische Glossar-Navigation">
            ${nav}
          </nav>
          <div class="classic-glossary-groups">
${Array.from(termsByLetter.entries()).sort((a, b) => collator.compare(a[0], b[0])).map(renderLetter).join("\n")}
          </div>
        </div>
      </section>
      <script>
        (() => {
          const search = document.querySelector("[data-glossary-search]");
          const buttons = Array.from(document.querySelectorAll("[data-filter-name]"));
          const cards = Array.from(document.querySelectorAll("[data-glossary-card]"));
          const status = document.querySelector("[data-glossary-filter-status]");
          const reset = document.querySelector("[data-glossary-reset]");
          const quickButtons = Array.from(document.querySelectorAll("[data-quick-filter]"));
          const state = { type: new Set(), theme: new Set(), dimension: new Set(), wirklogik: new Set(), field: new Set(), source: new Set(), q: "" };
          const params = new URLSearchParams(window.location.search);
          const split = (value) => (value || "").split(",").map((item) => item.trim()).filter(Boolean);
          const normalize = (value) => String(value || "")
            .trim()
            .toLocaleLowerCase("de")
            .replace(/ß/g, "ss")
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          Object.keys(state).forEach((key) => {
            if (key === "q") state.q = params.get("q") || "";
            else split(params.get(key)).forEach((value) => state[key].add(normalize(value)));
          });
          if (search instanceof HTMLInputElement) search.value = state.q;
          function hasAll(card, key) {
            const selected = state[key];
            if (!selected || !selected.size) return true;
            const values = (card.dataset[key] || "").split(" ").filter(Boolean);
            return Array.from(selected).every((value) => values.includes(value));
          }
          function updateUrl() {
            const next = new URLSearchParams();
            if (state.q) next.set("q", state.q);
            ["type", "theme", "dimension", "wirklogik", "field", "source"].forEach((key) => {
              if (state[key].size) next.set(key, Array.from(state[key]).join(","));
            });
            const url = next.toString() ? window.location.pathname + "?" + next.toString() + "#glossar" : window.location.pathname + "#glossar";
            window.history.replaceState(null, "", url);
          }
          function apply() {
            const q = search instanceof HTMLInputElement ? search.value.trim().toLowerCase() : state.q;
            state.q = q;
            let visible = 0;
            cards.forEach((card) => {
              const textMatch = !q || (card.dataset.search || card.textContent || "").toLowerCase().includes(q);
              const show = textMatch && hasAll(card, "type") && hasAll(card, "theme") && hasAll(card, "dimension") && hasAll(card, "wirklogik") && hasAll(card, "field") && hasAll(card, "source");
              card.hidden = !show;
              if (show) visible += 1;
            });
            buttons.forEach((button) => {
              const key = button.dataset.filterName;
              const value = button.dataset.filterValue;
              const active = Boolean(key && value && state[key]?.has(value));
              button.classList.toggle("active", active);
              button.setAttribute("aria-pressed", String(active));
            });
            document.querySelectorAll(".classic-glossary-letter").forEach((section) => {
              section.hidden = !Array.from(section.querySelectorAll("[data-glossary-card]")).some((card) => !card.hidden);
            });
            if (status) status.textContent = visible + " von " + cards.length + " Begriffen sichtbar";
            updateUrl();
          }
          buttons.forEach((button) => button.addEventListener("click", () => {
            const key = button.dataset.filterName;
            const value = button.dataset.filterValue;
            if (!key || !value || !state[key]) return;
            if (state[key].has(value)) state[key].delete(value);
            else state[key].add(value);
            apply();
          }));
          quickButtons.forEach((button) => button.addEventListener("click", () => {
            Object.keys(state).forEach((key) => {
              if (key === "q") state.q = "";
              else state[key].clear();
            });
            const quick = new URLSearchParams(button.dataset.quickFilter || "");
            quick.forEach((value, key) => state[key]?.add(value));
            if (search instanceof HTMLInputElement) search.value = "";
            apply();
          }));
          reset?.addEventListener("click", () => {
            Object.keys(state).forEach((key) => {
              if (key === "q") state.q = "";
              else state[key].clear();
            });
            if (search instanceof HTMLInputElement) search.value = "";
            apply();
          });
          search?.addEventListener("input", apply);
          apply();
        })();
      </script>`;
}

function renderAlphabetNav(letters) {
  return letters
    .map((letter) => {
      const anchor = letter === "0-9" ? "ziffern" : letter.toLocaleLowerCase("de");
      return `<a href="#glossar-${esc(anchor)}">${esc(letter)}</a>`;
    })
    .join("");
}

function updateHeroAlphabetNav(html) {
  const letters = Array.from(termsByLetter.keys()).sort((a, b) => collator.compare(a, b));
  const replacement = `<nav class="alphabet-nav" aria-label="Alphabetische Schnellnavigation im Glossar">
                ${renderAlphabetNav(letters)}
              </nav>`;
  return html.replace(/<nav class="alphabet-nav" aria-label="Alphabetische Schnellnavigation im Glossar">[\s\S]*?<\/nav>/, replacement);
}

const updatedClassicGlossary = `${glossaryHtml.slice(0, sectionStart)}${renderSection()}${glossaryHtml.slice(sectionEnd)}`;
const updatedGlossary = updateHeroAlphabetNav(updatedClassicGlossary);
fs.writeFileSync(glossaryFile, updatedGlossary, "utf8");

console.log(`Rendered ${terms.length} terms into the classic alphabetical glossary.`);
