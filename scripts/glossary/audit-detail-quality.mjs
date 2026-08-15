import fs from "node:fs";
import path from "node:path";

const collator = new Intl.Collator("de", { sensitivity: "base" });
const today = new Date().toISOString().slice(0, 10);
const glossary = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const registryTerms = glossary.terms || [];
const registryBySlug = new Map(registryTerms.map((term) => [term.slug, term]));

function stripTags(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function matchText(html, pattern) {
  const match = String(html || "").match(pattern);
  return match ? stripTags(match[1]) : "";
}

function sectionBetween(html, startPattern) {
  const start = html.search(startPattern);
  if (start === -1) return "";
  const rest = html.slice(start);
  const next = rest.search(/\n\s*<section\b(?![^>]*aria-labelledby=["'][^"']*related-content-title)/i);
  return next > 0 ? rest.slice(0, next) : rest;
}

function articleHtml(html) {
  const match = String(html || "").match(/<article\b[^>]*class=["'][^"']*\bglossary-detail\b[^"']*["'][^>]*>([\s\S]*?)<\/article>/i);
  return match ? match[1] : html;
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

function linkStats(html) {
  const hrefs = unique(Array.from(String(html || "").matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)).map((match) => match[1]));
  const external = hrefs.filter((href) => /^https?:\/\//i.test(href));
  const internal = hrefs.filter((href) => !/^https?:\/\//i.test(href) && !href.startsWith("mailto:") && !href.startsWith("#"));
  const book = hrefs.filter((href) => href.includes("referenz/kapitel-") || href.includes("/referenz/kapitel-"));
  const documents = hrefs.filter((href) => href.includes("dokumente/") || href.includes("downloads/") || href.includes("bibliothek/"));
  const methods = hrefs.filter((href) => href.includes("werkzeuge/"));
  const demos = hrefs.filter((href) => href.includes("erleben/") || href.includes("anwendungen/"));
  return { hrefs, external, internal, book, documents, methods, demos };
}

function relationCount(term) {
  return [
    "relatedTerms",
    "relatedMethods",
    "relatedTools",
    "relatedDocuments",
    "relatedDemos",
    "relatedImpactFields",
    "relatedAcademyModules",
    "relatedDataRegisters",
    "relatedChapters",
  ].reduce((total, key) => total + asList(term?.[key]).length, 0);
}

function pageRecord(slug) {
  const file = path.join("begriffe", slug, "index.html");
  const html = fs.readFileSync(file, "utf8");
  const article = articleHtml(html);
  const term = registryBySlug.get(slug);
  const links = linkStats(article);
  const relatedTermsSection = sectionBetween(article, /related-terms-title/i);
  const hasNonEmptyRelatedTerms = /class=["'][^"']*term-chip/i.test(relatedTermsSection) && !relatedTermsSection.includes("Keine Einträge");
  const title = matchText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || term?.canonicalLabel || slug;
  const genericPhrase = "Der Eintrag dient als begriffliche Einordnung innerhalb der Wirkungsökonomie.";
  const longDefinition = String(term?.longDefinition || term?.definition || "").trim();
  const shortDefinition = String(term?.shortDefinition || "").trim();
  const sourceBacked = Boolean(term);
  const legacyOnly = !sourceBacked;
  return {
    slug,
    title,
    sourceBacked,
    legacyOnly,
    hasDefinitionSection: article.includes("Was bedeutet der Begriff?"),
    hasDefinitionText: /Was bedeutet der Begriff\?[\s\S]{0,1200}<p>[^<]{30,}/.test(article),
    hasWoekMeaningSection: article.includes("Warum ist das wichtig?"),
    hasSpecificWoekMeaning: article.includes("Warum ist das wichtig?") && !article.includes(genericPhrase),
    hasWoekInterpretationBlock: article.includes("Wirkungsökonomische Einordnung") || Boolean(term?.woekRelation || term?.woek_einordnung),
    hasUsageSection: article.includes("So wird der Begriff genutzt"),
    hasBoundarySection: article.includes("Nicht verwechseln mit"),
    hasExamplesOrLearning: article.includes("Beispiel") || asList(term?.examples).length > 0,
    hasRelatedTermsSection: article.includes("Verwandte Begriffe"),
    hasNonEmptyRelatedTerms,
    hasRelatedContentBlock: article.includes("Verwandte Inhalte"),
    hasVersionSourceBlock: article.includes("Version und Quellen") || article.includes("Version und Quelle"),
    hasExternalLinks: links.external.length > 0,
    externalLinkCount: links.external.length,
    internalLinkCount: links.internal.length,
    bookChapterCount: links.book.length,
    documentLinkCount: links.documents.length,
    methodLinkCount: links.methods.length,
    demoLinkCount: links.demos.length,
    registryRelationCount: relationCount(term),
    shallowDefinition: sourceBacked && shortDefinition && longDefinition && shortDefinition === longDefinition,
    genericWoekText: article.includes(genericPhrase),
  };
}

const slugs = fs.readdirSync("begriffe", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join("begriffe", entry.name, "index.html")))
  .map((entry) => entry.name)
  .sort(collator.compare);

const records = slugs.map(pageRecord);

function countWhere(predicate) {
  return records.filter(predicate).length;
}

function missingList(predicate, limit = 80) {
  return records
    .filter(predicate)
    .slice(0, limit)
    .map((record) => `| ${record.slug} | ${record.title} | ${record.sourceBacked ? "Register" : "Bestand"} |`)
    .join("\n");
}

const summary = {
  generatedAt: new Date().toISOString(),
  detailPages: records.length,
  sourceBacked: countWhere((record) => record.sourceBacked),
  legacyOnly: countWhere((record) => record.legacyOnly),
  hasDefinitionSection: countWhere((record) => record.hasDefinitionSection),
  hasDefinitionText: countWhere((record) => record.hasDefinitionText),
  hasWoekMeaningSection: countWhere((record) => record.hasWoekMeaningSection),
  hasSpecificWoekMeaning: countWhere((record) => record.hasSpecificWoekMeaning),
  hasWoekInterpretationBlock: countWhere((record) => record.hasWoekInterpretationBlock),
  hasUsageSection: countWhere((record) => record.hasUsageSection),
  hasBoundarySection: countWhere((record) => record.hasBoundarySection),
  hasExamplesOrLearning: countWhere((record) => record.hasExamplesOrLearning),
  hasNonEmptyRelatedTerms: countWhere((record) => record.hasNonEmptyRelatedTerms),
  hasRelatedContentBlock: countWhere((record) => record.hasRelatedContentBlock),
  hasVersionSourceBlock: countWhere((record) => record.hasVersionSourceBlock),
  hasExternalLinks: countWhere((record) => record.hasExternalLinks),
  hasBookChapterLinks: countWhere((record) => record.bookChapterCount > 0),
  hasDocumentLinks: countWhere((record) => record.documentLinkCount > 0),
  hasMethodLinks: countWhere((record) => record.methodLinkCount > 0),
  hasDemoLinks: countWhere((record) => record.demoLinkCount > 0),
  genericWoekText: countWhere((record) => record.genericWoekText),
  shallowDefinition: countWhere((record) => record.shallowDefinition),
};

const qualityRows = [
  ["Detailseiten gesamt", summary.detailPages],
  ["Source-backed im Glossar-Register", summary.sourceBacked],
  ["Erhaltene Bestandsseiten außerhalb Register", summary.legacyOnly],
  ["Definition-Abschnitt vorhanden", summary.hasDefinitionSection],
  ["Definition mit Text vorhanden", summary.hasDefinitionText],
  ["WÖk-Bedeutung/Relevanz-Abschnitt vorhanden", summary.hasWoekMeaningSection],
  ["WÖk-Bedeutung nicht nur generischer Standardsatz", summary.hasSpecificWoekMeaning],
  ["Explizite wirkungsökonomische Einordnung/Auslegung", summary.hasWoekInterpretationBlock],
  ["Verwendungs-/Nutzungsabschnitt vorhanden", summary.hasUsageSection],
  ["Abgrenzung vorhanden", summary.hasBoundarySection],
  ["Beispiel/Lernblock vorhanden", summary.hasExamplesOrLearning],
  ["Verwandte Begriffe nicht leer", summary.hasNonEmptyRelatedTerms],
  ["Zusätzlicher Block Verwandte Inhalte", summary.hasRelatedContentBlock],
  ["Version-/Quellenblock vorhanden", summary.hasVersionSourceBlock],
  ["Mindestens ein externer Link", summary.hasExternalLinks],
  ["Mindestens ein Buchkapitel-Link", summary.hasBookChapterLinks],
  ["Mindestens ein Dokument-/Bibliothekslink", summary.hasDocumentLinks],
  ["Mindestens ein Methoden-/Werkzeuglink", summary.hasMethodLinks],
  ["Mindestens ein Demo-/Anwendungslink", summary.hasDemoLinks],
].map(([label, value]) => `| ${label} | ${value} |`).join("\n");

const doc = `# Glossar-Detailseiten: Qualitätsaudit

Stand: ${today}

Dieses Audit prüft die ${records.length} vorhandenen Begriffsdetailseiten nicht auf Schönheit, sondern auf Wissens- und Quellenabdeckung. Es löscht nichts und ersetzt keine Detailseiten durch Hub-Einträge.

## Pflichtbausteine pro Begriff

Eine vollständige Glossar-Detailseite sollte enthalten:

1. Definition: Was bedeutet der Begriff?
2. Wirkungsökonomische Auslegung: Wie wird der Begriff in der WÖk eingeordnet?
3. Wirkungsökonomische Bedeutung und Relevanz: Warum ist der Begriff für Mensch, Planet, Demokratie, Wirkung, Messung oder Rückkopplung wichtig?
4. Verwendung: Wie soll der Begriff auf der Website genutzt werden?
5. Abgrenzung: Nicht verwechseln mit, Missverständnisse, rote Linien.
6. Beispiele oder Anwendungskontext.
7. Verwandte Begriffe und Rückverweise.
8. Verwandte Inhalte: Methoden/Werkzeuge, Demos, Wirkungsfelder, Akademie, Datenregister.
9. Interne Quellen: Online-Buch-Kapitel, Arbeitspapiere, Dokumente, Bibliothek.
10. Externe Quellen: Standards, Gesetze, Fachquellen oder Primärquellen, soweit fachlich passend.
11. Status und Version: Stand, Quelle, Review-/Arbeitsstatus.
12. Schutzlinien bei sensiblen Begriffen: keine Personenbewertung, keine automatische Entscheidung, keine Beratung, Datenqualität sichtbar.

## Zählstand

| Kriterium | Seiten |
| --- | ---: |
${qualityRows}

## Wichtigste Lücken

- ${summary.genericWoekText} Seiten enthalten noch den generischen Satz „Der Eintrag dient als begriffliche Einordnung innerhalb der Wirkungsökonomie.“ Diese Seiten brauchen eine echte wirkungsökonomische Relevanzbeschreibung.
- ${records.length - summary.hasWoekInterpretationBlock} Seiten haben noch keine explizite wirkungsökonomische Auslegung oder Einordnung.
- ${records.length - summary.hasRelatedContentBlock} Seiten zeigen noch keinen strukturierten Block „Verwandte Inhalte“ mit Methoden, Demos, Dokumenten, Wirkungsfeldern, Akademie oder Datenregistern.
- ${records.length - summary.hasExternalLinks} Seiten haben noch keinen externen Quellenlink.
- ${records.length - summary.hasBookChapterLinks} Seiten haben noch keinen direkten Link in ein konkretes Buchkapitel.
- ${records.length - summary.hasDocumentLinks} Seiten haben noch keinen Dokument- oder Bibliothekslink.
- ${summary.shallowDefinition} source-backed Registerbegriffe haben noch kurze Definition = Langdefinition und brauchen fachliche Vertiefung.
- ${summary.legacyOnly} Bestandsseiten sind erhalten und im Hub sichtbar, liegen aber noch nicht vollständig im strukturierten Glossar-Register.

## Beispiele für Nachholbedarf

### Keine spezifische WÖk-Bedeutung

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => !record.hasSpecificWoekMeaning)}

### Keine explizite WÖk-Auslegung

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => !record.hasWoekInterpretationBlock)}

### Keine externen Quellenlinks

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => !record.hasExternalLinks)}

### Keine Buchkapitel-Links

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => record.bookChapterCount === 0)}

### Keine Dokument-/Bibliothekslinks

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => record.documentLinkCount === 0)}

## Nicht automatisch ergänzen

Diese Lücken dürfen nicht durch erfundene Quellen oder generische Floskeln geschlossen werden. Besonders externe Quellen, Buchkapitel und Arbeitspapiere müssen tatsächlich passen. Automatisch sinnvoll ist nur:

- Struktur sichtbar machen,
- fehlende Bausteine markieren,
- vorhandene Register-, Such- und Manifestdaten ausspielen,
- sichere Standard-Schutzlinien bei sensiblen Begriffen ergänzen,
- manuelle Vertiefung priorisieren.

## Nächste fachliche Reihenfolge

1. Bestandsseiten in das strukturierte Glossar-Register übernehmen, ohne ihre alten URLs zu ändern.
2. Begriffe mit generischem WÖk-Text zuerst vertiefen.
3. Pro Begriff mindestens eine interne Quelle prüfen: Buchkapitel, Arbeitspapier, Dokument oder Methode.
4. Externe Primär-/Fachquellen nur ergänzen, wenn sie belastbar und passend sind.
5. Danach Hub, Hover, Suche, Crosslinks und Linkcheck erneut auditieren.
`;

fs.writeFileSync("public/data/glossary-detail-quality-audit.json", `${JSON.stringify({ summary, records }, null, 2)}\n`);
fs.writeFileSync("docs/glossary-detail-quality-audit.md", doc);
console.log(`Wrote glossary detail quality audit for ${records.length} pages.`);
console.log(JSON.stringify(summary, null, 2));
