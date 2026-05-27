import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataFile = path.join(root, "assets/data/data-standards-glossary-terms.json");
const registryFile = path.join(root, "public/data/glossary.terms.json");
const hoverFile = path.join(root, "assets/js/glossaryTerms.js");
const glossaryFile = path.join(root, "glossar.html");

const allowedContexts = ["home", "page", "reference", "blog", "academy", "method", "glossary"];
const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });

const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
const registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
const glossaryHtml = fs.readFileSync(glossaryFile, "utf8");
const sectionStart = glossaryHtml.indexOf('<section class="section" id="daten-standards-glossar"');
const sectionEnd = glossaryHtml.indexOf('<section class="section" id="externe-quellen-glossar"', sectionStart);
if (sectionStart === -1 || sectionEnd === -1) {
  throw new Error("Could not locate Daten, Standards und Regularien section boundaries in glossar.html.");
}
const externalGlossaryHtml = `${glossaryHtml.slice(0, sectionStart)}${glossaryHtml.slice(sectionEnd)}`;
const externalIds = new Set(Array.from(externalGlossaryHtml.matchAll(/\sid="([^"]+)"/g), (match) => match[1]));

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

function slugify(value) {
  return stripTags(value)
    .replace(/\([^)]*\)/g, "")
    .split("/")[0]
    .trim()
    .toLocaleLowerCase("de")
    .replace(/&/g, " und ")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "begriff";
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function parseSource(value) {
  const [label, url] = String(value || "").split("|");
  return {
    label: label?.trim() || "Quelle",
    url: url?.trim() || "",
  };
}

const groupOrder = new Map(data.groups.map((group, index) => [group.label, index]));
const extraById = new Map();

for (const [index, item] of data.terms.entries()) {
  const id = item.id || slugify(item.label);
  const slug = item.slug || id;
  const woek = item.woek || item.long || item.short;
  extraById.set(id, {
    termId: id,
    canonicalLabel: item.label,
    slug,
    status: item.status || "anschlussbegriff",
    version: item.version || "1.0",
    category: item.category || "Datenbegriff",
    source: item.source || "Daten, Standards und Regularien",
    sourceDocument: item.sourceDocument || "Glossar-Datenstandards",
    sourceSection: `Daten, Standards und Regularien · ${item.group}`,
    dataStandardsGroup: item.group,
    dataStandardsOrder: index,
    shortDefinition: item.short,
    hoverDefinition: item.hover || item.short,
    longDefinition: woek,
    usageNote: item.usage || "Die WÖk nutzt den Begriff als Anschluss- und Datenbasis und ersetzt den Standard nicht.",
    doNotConfuseWith: item.doNotConfuseWith || [],
    synonyms: item.synonyms || [],
    relatedTerms: item.related || [],
    officialSources: item.sources || [],
    relatedDocuments: item.relatedDocuments || [],
    examples: item.examples || [],
    preferredUsage: item.preferredUsage || "Als Anschlussbegriff verwenden und von WÖk-Bewertung unterscheiden.",
    deprecatedUsage: item.deprecatedUsage || [],
    reviewStatus: item.reviewStatus || "approved",
    glossaryOrderKey: item.orderKey || item.label,
    firstApprovedIn: item.firstApprovedIn || "2026.2",
    lastUpdated: item.lastUpdated || "2026-05-27",
  });
}

const byId = new Map();
for (const term of registry.terms || []) byId.set(term.termId, term);

for (const extra of extraById.values()) {
  const existing = byId.get(extra.termId);
  if (!existing) {
    byId.set(extra.termId, extra);
    continue;
  }
  byId.set(extra.termId, {
    ...extra,
    ...existing,
    dataStandardsGroup: extra.dataStandardsGroup,
    dataStandardsOrder: extra.dataStandardsOrder,
    sourceSection: existing.sourceSection?.includes("Daten, Standards und Regularien")
      ? existing.sourceSection
      : extra.sourceSection,
    officialSources: unique([...(existing.officialSources || []), ...(extra.officialSources || [])]),
    relatedTerms: unique([...(existing.relatedTerms || []), ...(extra.relatedTerms || [])]),
    synonyms: unique([...(existing.synonyms || []), ...(extra.synonyms || [])]),
    usageNote: existing.usageNote || extra.usageNote,
    longDefinition: existing.longDefinition || extra.longDefinition,
    shortDefinition: existing.shortDefinition || extra.shortDefinition,
    hoverDefinition: existing.hoverDefinition || extra.hoverDefinition,
  });
}

const terms = Array.from(byId.values()).sort((a, b) =>
  collator.compare(a.glossaryOrderKey || a.canonicalLabel, b.glossaryOrderKey || b.canonicalLabel)
);

fs.writeFileSync(
  registryFile,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), terms }, null, 2)}\n`
);

const hoverTerms = terms.map((term, index) => ({
  key: term.termId,
  label: term.canonicalLabel,
  aliases: term.synonyms || [],
  definition: term.hoverDefinition || term.shortDefinition,
  url: `/begriffe/${term.slug}/`,
  priority: index + 1,
  allowedContexts,
}));

fs.writeFileSync(
  hoverFile,
  `window.WIRKUNG_GLOSSARY_TERMS = ${JSON.stringify(hoverTerms, null, 2)};\n`
);

const termsById = new Map(terms.map((term) => [term.termId, term]));

function relatedLinks(term) {
  const links = (term.relatedTerms || [])
    .map((relatedId) => termsById.get(relatedId))
    .filter(Boolean)
    .slice(0, 8)
    .map((related) => `<a href="#begriff-${esc(related.slug)}">${esc(related.canonicalLabel)}</a>`)
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

function glossaryAnchorAttrs(term) {
  const anchor = `begriff-${term.slug}`;
  if (externalIds.has(anchor)) {
    return {
      wrapper: ` data-term-id="${esc(term.termId)}"`,
      term: "",
    };
  }
  return {
    wrapper: ` data-term-id="${esc(term.termId)}"`,
    term: ` id="${esc(anchor)}"`,
  };
}

function renderTerm(term) {
  const anchors = glossaryAnchorAttrs(term);
  return `              <div class="glossary-standard-entry"${anchors.wrapper}>
                <dt${anchors.term}>${esc(term.canonicalLabel)}</dt>
                <dd>
                  <p><strong>Kurzdefinition:</strong> ${esc(term.shortDefinition)}</p>
                  <p><strong>WÖk-Bezug:</strong> ${esc(term.longDefinition)}</p>
                  <p><strong>Hinweis:</strong> ${esc(term.usageNote || "Die WÖk nutzt den Begriff als Anschluss- und Datenbasis und ersetzt den Standard nicht.")}</p>
                  <p class="glossary-meta-line"><strong>Verwandt:</strong> ${relatedLinks(term)}</p>
                  <p class="glossary-meta-line"><strong>Offizielle Quelle:</strong> ${sourceLinks(term)}</p>
                  <p class="glossary-entry-action"><a class="text-link" href="begriffe/${esc(term.slug)}/">Begriff vertiefen</a></p>
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
      return collator.compare(a.canonicalLabel, b.canonicalLabel);
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
  const nav = data.groups
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
${data.groups.map(renderGroup).join("\n")}
          </div>
        </div>
      </section>`;
}

const updatedGlossary = `${glossaryHtml.slice(0, sectionStart)}${renderSection()}\n\n${glossaryHtml.slice(sectionEnd)}`;
fs.writeFileSync(glossaryFile, updatedGlossary, "utf8");

const groupedCount = terms.filter((term) => term.dataStandardsGroup).length;
console.log(`Merged ${extraById.size} data-standards terms and rendered ${groupedCount} grouped glossary entries.`);
