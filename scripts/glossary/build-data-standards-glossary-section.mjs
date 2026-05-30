import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const groupsFile = path.join(root, "assets/data/data-standards-glossary-groups.json");
const registryFile = path.join(root, "public/data/glossary.terms.json");
const glossaryFile = path.join(root, "glossar.html");

const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });

const groupsData = JSON.parse(fs.readFileSync(groupsFile, "utf8"));
const registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
const glossaryHtml = fs.readFileSync(glossaryFile, "utf8");
const sectionStart = glossaryHtml.indexOf('<section class="section" id="daten-standards-glossar"');
const sectionEnd = glossaryHtml.indexOf('<section class="section" id="externe-quellen-glossar"', sectionStart);
if (sectionStart === -1 || sectionEnd === -1) {
  throw new Error("Could not locate Daten, Standards und Regularien section boundaries in glossar.html.");
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function isDataStandardsTerm(term) {
  return (
    term.showInCategoryGlossary === true ||
    Boolean(term.dataStandardsGroup) ||
    (term.categories || []).includes("daten-standards-regularien")
  );
}

function termLabel(term) {
  return term.canonicalLabel || term.label || term.termId;
}

function termPage(term) {
  return term.pageUrl || `/begriffe/${term.slug}/`;
}

const terms = (registry.terms || []).filter(isDataStandardsTerm);
const termsById = new Map((registry.terms || []).map((term) => [term.termId || term.id, term]));

function relatedLinks(term) {
  const links = (term.relatedTerms || [])
    .map((relatedId) => termsById.get(relatedId))
    .filter(Boolean)
    .slice(0, 8)
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
  return links || "<span>Quelle wird redaktionell ergänzt.</span>";
}

function renderTerm(term) {
  const woekRelation = term.woekRelation || term.longDefinition || term.definition || term.shortDefinition;
  const hint =
    term.statusNote ||
    term.usageNote ||
    "Die WÖk nutzt den Begriff als Anschluss- und Datenbasis und ersetzt den Standard nicht.";
  return `              <div class="glossary-standard-entry" data-term-id="${esc(term.termId)}">
                <dt>${esc(termLabel(term))}</dt>
                <dd>
                  <p><strong>Kurzdefinition:</strong> ${esc(term.shortDefinition)}</p>
                  <p><strong>WÖk-Bezug:</strong> ${esc(woekRelation)}</p>
                  <p><strong>Hinweis:</strong> ${esc(hint)}</p>
                  <p class="glossary-meta-line"><strong>Verwandt:</strong> ${relatedLinks(term)}</p>
                  <p class="glossary-meta-line"><strong>Offizielle Quelle:</strong> ${sourceLinks(term)}</p>
                  <p class="glossary-entry-action"><a class="text-link" href="${esc(termPage(term))}">Begriff vertiefen</a></p>
                </dd>
              </div>`;
}

function renderGroup(group) {
  const groupTerms = terms
    .filter((term) => term.dataStandardsGroup === group.label)
    .sort((a, b) => {
      const aOrder = Number.isFinite(a.dataStandardsOrder) ? a.dataStandardsOrder : 9999;
      const bOrder = Number.isFinite(b.dataStandardsOrder) ? b.dataStandardsOrder : 9999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return collator.compare(termLabel(a), termLabel(b));
    });

  return `          <section class="glossary-standard-group" id="daten-standards-${esc(group.id)}" aria-labelledby="daten-standards-${esc(group.id)}-title">
            <div class="glossary-standard-group-header">
              <p class="section-eyebrow">${esc(group.label)}</p>
              <h3 id="daten-standards-${esc(group.id)}-title">${esc(group.label)}</h3>
              <p>${esc(group.description)}</p>
            </div>
            <dl class="term-list compact">
${groupTerms.map(renderTerm).join("\n")}
            </dl>
          </section>`;
}

function renderSection() {
  const nav = groupsData.groups
    .map((group) => `<a href="#daten-standards-${esc(group.id)}">${esc(group.label)}</a>`)
    .join("");

  return `      <section class="section" id="daten-standards-glossar" aria-labelledby="daten-standards-title">
        <div>
          <div class="section-header">
            <p class="section-eyebrow">Daten, Standards und Regularien</p>
            <h2 id="daten-standards-title">Daten, Standards und Regularien</h2>
            <p>Die Wirkungsökonomie erfindet bestehende EU-Standards, Datenquellen und Reportingrahmen nicht neu. Sie nutzt sie als Anschluss- und Datenbasis und übersetzt sie in Wirkung, Wirkungsbewertung und Wirkungsrückkopplung.</p>
          </div>
          <nav class="glossary-standard-nav" aria-label="Untergruppen im Glossarbereich Daten, Standards und Regularien">
            ${nav}
          </nav>
          <div class="glossary-standard-groups">
${groupsData.groups.map(renderGroup).join("\n")}
          </div>
        </div>
      </section>`;
}

const updatedGlossary = `${glossaryHtml.slice(0, sectionStart)}${renderSection()}\n\n${glossaryHtml.slice(sectionEnd)}`;
fs.writeFileSync(glossaryFile, updatedGlossary, "utf8");

console.log(`Rendered ${terms.length} data/standards glossary entries from the central term registry.`);
