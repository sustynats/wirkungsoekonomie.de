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
    .map((related) => `<a href="#klassisch-${esc(related.slug)}">${esc(termLabel(related))}</a>`)
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
  const primaryAnchor = `begriff-${slug}`;
  const dtId = externalIds.has(primaryAnchor) ? "" : ` id="${esc(primaryAnchor)}"`;
  const paragraphs = distinctParagraphs([term.shortDefinition, term.definition, term.longDefinition]);
  const woekRelation = stripTags(term.woekRelation);
  const statusOrUsage = stripTags(term.statusNote || term.usageNote);
  const body = [];
  if (paragraphs[0]) body.push(`<p><strong>Kurzdefinition:</strong> ${esc(paragraphs[0])}</p>`);
  if (paragraphs[1]) body.push(`<p><strong>Erklärung:</strong> ${esc(paragraphs[1])}</p>`);
  if (paragraphs[2]) body.push(`<p>${esc(paragraphs[2])}</p>`);
  if (woekRelation && !paragraphs.includes(woekRelation)) body.push(`<p><strong>WÖk-Bezug:</strong> ${esc(woekRelation)}</p>`);
  if (statusOrUsage) body.push(`<p><strong>Grenze / Status:</strong> ${esc(statusOrUsage)}</p>`);
  body.push(aliasLine(term));
  body.push(`<p class="glossary-meta-line"><strong>Verwandt:</strong> ${relatedLinks(term)}</p>`);
  body.push(`<p class="glossary-meta-line"><strong>Offizielle Quelle:</strong> ${sourceLinks(term)}</p>`);
  body.push(`<p class="glossary-entry-action"><a class="text-link" href="${esc(termPage(term))}">Begriff vertiefen</a></p>`);

  return `              <div class="classic-glossary-entry" id="klassisch-${esc(slug)}" data-classic-term-id="${esc(term.termId)}">
                <dt${dtId}>${esc(termLabel(term))}</dt>
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
  const nav = letters
    .map((letter) => {
      const anchor = letter === "0-9" ? "ziffern" : letter.toLocaleLowerCase("de");
      return `<a href="#glossar-${esc(anchor)}">${esc(letter)}</a>`;
    })
    .join("");

  return `      <section class="section section-muted" id="glossar" aria-labelledby="glossar-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Glossar</p>
            <h2 id="glossar-title">Klassisches Glossar von A bis Z</h2>
            <p>Das klassische Glossar ist der vollständige alphabetische Index. Thematische Bereiche wie Daten, Standards und Regularien sind daraus abgeleitete Filter.</p>
          </div>
          <nav class="glossary-standard-nav" aria-label="Alphabetische Glossar-Navigation">
            ${nav}
          </nav>
          <div class="classic-glossary-groups">
${Array.from(termsByLetter.entries()).sort((a, b) => collator.compare(a[0], b[0])).map(renderLetter).join("\n")}
          </div>
        </div>
      </section>`;
}

const updatedGlossary = `${glossaryHtml.slice(0, sectionStart)}${renderSection()}${glossaryHtml.slice(sectionEnd)}`;
fs.writeFileSync(glossaryFile, updatedGlossary, "utf8");

console.log(`Rendered ${terms.length} terms into the classic alphabetical glossary.`);
