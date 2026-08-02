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

// Nicht jede kuratierte Detailseite verwendet die Standard-ID
// "related-terms-title". Fachcluster und die Finanzseiten haben eigene,
// sprechende Überschriften. Maßgeblich ist deshalb nicht die ID, sondern ein
// tatsächlich veröffentlichter Chip auf eine andere Glossar-Detailseite.
function publishedGlossaryTermLinks(html) {
  const links = [];
  for (const match of String(html || "").matchAll(/<a\b([^>]*)>/gi)) {
    const attributes = match[1] || "";
    const classMatch = attributes.match(/\bclass=["']([^"']*)["']/i);
    const hrefMatch = attributes.match(/\bhref=["']([^"']*)["']/i);
    if (!classMatch || !hrefMatch) continue;
    if (!/(?:^|\s)term-chip(?:\s|$)/.test(classMatch[1])) continue;
    if (!/(?:^|\/)begriffe\/[^/?#]+\/?(?:[?#].*)?$/i.test(hrefMatch[1])) continue;
    links.push(hrefMatch[1]);
  }
  return unique(links);
}

function articleHtml(html) {
  const source = String(html || "");
  const start = source.match(/<article\b[^>]*class=["'][^"']*\bglossary-detail\b[^"']*["'][^>]*>/i);
  if (!start || start.index === undefined) return source;
  // Detail pages can contain semantic <article> cards. A non-greedy regular
  // expression would stop at the first nested card and silently omit the
  // actual source block from this audit. Count article tags instead.
  const contentStart = start.index + start[0].length;
  const tags = /<\/?article\b[^>]*>/gi;
  tags.lastIndex = contentStart;
  let depth = 1;
  for (let match = tags.exec(source); match; match = tags.exec(source)) {
    if (/^<\/article\b/i.test(match[0])) depth -= 1;
    else depth += 1;
    if (depth === 0) return source.slice(contentStart, match.index);
  }
  return source.slice(contentStart);
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

function normalizedDefinition(value) {
  return stripTags(value)
    .replace(/[.,;:!?]+$/g, "")
    .toLocaleLowerCase("de");
}

function definitionWordCount(value) {
  return stripTags(value).split(/\s+/).filter(Boolean).length;
}

function hasLinkedSource(term) {
  return ["officialSources", "curatedSources", "sourceLinks"]
    .flatMap((key) => asList(term?.[key]))
    .some((source) => {
      if (typeof source === "object") return Boolean(source.url || source.href || source.pageUrl);
      return String(source || "").includes("|") || /^https?:\/\//i.test(String(source || ""));
    });
}

function sourceReferenceUrls(term) {
  return ["officialSources", "curatedSources", "sourceLinks"]
    .flatMap((key) => asList(term?.[key]))
    .map((source) => {
      if (typeof source === "object") return String(source.url || source.href || source.pageUrl || "").trim();
      const raw = String(source || "");
      return raw.includes("|") ? raw.slice(raw.lastIndexOf("|") + 1).trim() : raw;
    })
    .filter(Boolean);
}

function hasOnlyWoeKPrimarySources(term) {
  const urls = sourceReferenceUrls(term);
  return urls.length > 0 && urls.every((url) => /\/quellenarchiv\/wok-g-/i.test(url));
}

// A repeated short/long definition is a useful editorial signal, but it is
// not by itself evidence of a superficial definition. Some technical terms
// are accurately defined in one compact sentence. A term is only queued for
// editorial expansion when it is both compact beyond a minimum explanatory
// scope and has no linked source to constrain its use.
function conciseDefinitionIsAdequate(term, shortDefinition, longDefinition) {
  return normalizedDefinition(shortDefinition) === normalizedDefinition(longDefinition)
    && definitionWordCount(shortDefinition) >= 8
    && hasLinkedSource(term);
}

function linkStats(html) {
  const hrefs = unique(Array.from(String(html || "").matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)).map((match) => match[1]));
  const external = hrefs.filter((href) => /^https?:\/\//i.test(href));
  const internal = hrefs.filter((href) => !/^https?:\/\//i.test(href) && !href.startsWith("mailto:") && !href.startsWith("#"));
  const sourceArchive = hrefs.filter((href) => href.includes("/quellenarchiv/"));
  const book = hrefs.filter((href) => href.includes("referenz/kapitel-") || href.includes("/referenz/kapitel-"));
  const documents = hrefs.filter((href) => href.includes("dokumente/") || href.includes("downloads/") || href.includes("bibliothek/"));
  const methods = hrefs.filter((href) => href.includes("werkzeuge/"));
  const demos = hrefs.filter((href) => href.includes("erleben/") || href.includes("anwendungen/"));
  return { hrefs, external, internal, sourceArchive, book, documents, methods, demos };
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
  const standardRelatedTermLinks = publishedGlossaryTermLinks(relatedTermsSection);
  const publishedRelatedTermLinks = publishedGlossaryTermLinks(article);
  // Standardseiten werden über die Standard-Section erkannt. Bei bewusst
  // abweichenden Templates zählen die im Artikel sichtbar veröffentlichten
  // Glossar-Chips genauso; Navigationschips zu Werkzeugen oder Dokumenten
  // reichen dagegen nicht.
  const hasNonEmptyRelatedTerms = standardRelatedTermLinks.length > 0 || publishedRelatedTermLinks.length > 0;
  const title = matchText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || term?.canonicalLabel || slug;
  const genericPhrase = "Der Eintrag dient als begriffliche Einordnung innerhalb der Wirkungsökonomie.";
  const leadDefinition = matchText(article, /<p\b[^>]*class=["'][^"']*\blead\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  const longDefinition = String(term?.longDefinition || term?.definition || "").trim();
  const shortDefinition = String(term?.shortDefinition || "").trim();
  const sourceBacked = Boolean(term);
  const legacyOnly = !sourceBacked;
  const repeatedDefinition = sourceBacked && shortDefinition && longDefinition
    && normalizedDefinition(shortDefinition) === normalizedDefinition(longDefinition);
  const conciseDefinition = repeatedDefinition && conciseDefinitionIsAdequate(term, shortDefinition, longDefinition);
  return {
    slug,
    title,
    sourceBacked,
    legacyOnly,
    hasDefinitionSection: Boolean(leadDefinition) || article.includes("Was bedeutet der Begriff?") || article.includes("Was der Begriff zusätzlich aussagt"),
    hasDefinitionText: definitionWordCount(leadDefinition) >= 6 || /Was bedeutet der Begriff\?[\s\S]{0,1200}<p>[^<]{30,}/.test(article),
    hasWoekMeaningSection: article.includes("Warum ist das wichtig?") || article.includes("Einordnung in der Wirkungsökonomie"),
    hasSpecificWoekMeaning: (article.includes("Warum ist das wichtig?") || article.includes("Einordnung in der Wirkungsökonomie")) && !article.includes(genericPhrase),
    hasWoekInterpretationBlock: article.includes("Wirkungsökonomische Einordnung") || Boolean(term?.woekRelation || term?.woek_einordnung),
    hasUsageSection: article.includes("So wird der Begriff genutzt") || /<h2>Verwendung<\/h2>/.test(article),
    hasBoundarySection: article.includes("Nicht verwechseln mit") || /<h2>Abgrenzung<\/h2>/.test(article),
    hasExamplesOrLearning: article.includes("Beispiel") || asList(term?.examples).length > 0,
    hasRelatedTermsSection: article.includes("Verwandte Begriffe") || publishedRelatedTermLinks.length > 0,
    hasNonEmptyRelatedTerms,
    publishedRelatedTermLinkCount: publishedRelatedTermLinks.length,
    hasRelatedContentBlock: article.includes("Verwandte Inhalte") || article.includes("Quellen und Vertiefungen"),
    hasVersionSourceBlock: article.includes("Version und Quellen") || article.includes("Version und Quelle") || article.includes("Quellen und Einordnung"),
    hasExternalLinks: links.external.length > 0,
    externalLinkCount: links.external.length,
    internalLinkCount: links.internal.length,
    hasSourceArchiveLink: links.sourceArchive.length > 0,
    sourceArchiveLinkCount: links.sourceArchive.length,
    bookChapterCount: links.book.length,
    documentLinkCount: links.documents.length,
    methodLinkCount: links.methods.length,
    demoLinkCount: links.demos.length,
    registryRelationCount: relationCount(term),
    definitionDetailStatus: term?.definitionDetailStatus || (repeatedDefinition ? "konzis" : "vertieft"),
    definitionDetailBasis: term?.definitionDetailBasis || "",
    definitionWordCount: definitionWordCount(shortDefinition),
    repeatedDefinition,
    conciseDefinition,
    conciseDefinitionWithModelOnlySource: conciseDefinition && hasOnlyWoeKPrimarySources(term),
    definitionNeedsEditorialExpansion: repeatedDefinition && !conciseDefinition,
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
  sourceBackedWithPublishedGlossaryCrossReference: countWhere((record) => record.sourceBacked && record.hasNonEmptyRelatedTerms),
  sourceBackedWithoutPublishedGlossaryCrossReference: countWhere((record) => record.sourceBacked && !record.hasNonEmptyRelatedTerms),
  hasRelatedContentBlock: countWhere((record) => record.hasRelatedContentBlock),
  hasVersionSourceBlock: countWhere((record) => record.hasVersionSourceBlock),
  hasExternalLinks: countWhere((record) => record.hasExternalLinks),
  hasSourceArchiveLink: countWhere((record) => record.hasSourceArchiveLink),
  sourceBackedWithoutSourceArchiveLink: countWhere((record) => record.sourceBacked && !record.hasSourceArchiveLink),
  hasBookChapterLinks: countWhere((record) => record.bookChapterCount > 0),
  hasDocumentLinks: countWhere((record) => record.documentLinkCount > 0),
  hasMethodLinks: countWhere((record) => record.methodLinkCount > 0),
  hasDemoLinks: countWhere((record) => record.demoLinkCount > 0),
  genericWoekText: countWhere((record) => record.genericWoekText),
  longDefinitionsExpanded: countWhere((record) => record.sourceBacked && record.definitionDetailStatus === "vertieft"),
  conciseDefinitions: countWhere((record) => record.conciseDefinition),
  conciseDefinitionsWithModelOnlySource: countWhere((record) => record.conciseDefinitionWithModelOnlySource),
  repeatedDefinitions: countWhere((record) => record.repeatedDefinition),
  definitionNeedsEditorialExpansion: countWhere((record) => record.definitionNeedsEditorialExpansion),
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
  ["Source-backed mit veröffentlichtem Glossar-Querverweis", summary.sourceBackedWithPublishedGlossaryCrossReference],
  ["Source-backed ohne veröffentlichten Glossar-Querverweis", summary.sourceBackedWithoutPublishedGlossaryCrossReference],
  ["Zusätzlicher Block Verwandte Inhalte", summary.hasRelatedContentBlock],
  ["Version-/Quellenblock vorhanden", summary.hasVersionSourceBlock],
  ["Quellenarchiv-Link vorhanden", summary.hasSourceArchiveLink],
  ["Direkter externer Link im Glossarartikel", summary.hasExternalLinks],
  ["Mindestens ein Buchkapitel-Link", summary.hasBookChapterLinks],
  ["Mindestens ein Dokument-/Bibliothekslink", summary.hasDocumentLinks],
  ["Mindestens ein Methoden-/Werkzeuglink", summary.hasMethodLinks],
  ["Mindestens ein Demo-/Anwendungslink", summary.hasDemoLinks],
  ["Langdefinition fachlich erweitert", summary.longDefinitionsExpanded],
  ["Konzise, quellenverlinkte Definitionen", summary.conciseDefinitions],
  ["Davon nur mit WÖk-Primärquelle", summary.conciseDefinitionsWithModelOnlySource],
  ["Potenzielle Langdefinitionslücken", summary.definitionNeedsEditorialExpansion],
].map(([label, value]) => `| ${label} | ${value} |`).join("\n");

const doc = `# Glossar-Detailseiten: Qualitätsaudit

Stand: ${today}

Dieses Audit prüft die ${records.length} vorhandenen Begriffsdetailseiten nicht auf Schönheit, sondern auf Wissens- und Quellenabdeckung. Es löscht nichts und ersetzt keine Detailseiten durch Hub-Einträge.

## Wann eine Langdefinition wirklich fehlt

Die Gleichheit von Kurz- und Langdefinition ist nur ein Dublettenhinweis, keine fachliche Diagnose. Eine technische oder rechtliche Definition kann in einem präzisen Satz vollständig sein. Das Register erweitert Langdefinitionen deshalb zentral nur mit bereits gepflegter, begriffsspezifischer WÖk-Einordnung oder Anwendungsregel. Es ergänzt keine behauptete Wirkung, keine Quelle und keine Grenze automatisch.

Eine wiederholte Kurzdefinition gilt hier als **konzis** (nicht als oberflächlich), wenn sie mindestens acht Wörter enthält und ein Quellenverweis verknüpft ist. Als potenzielle Lücke wird sie nur gezählt, wenn diese minimale Prüfbarkeit fehlt. Die Regel ist ein Qualitätsfilter, keine inhaltliche Begutachtung der jeweiligen Fachquelle.

Ein Quellenverweis auf eine WÖk-Primärquelle belegt ausschließlich die modellinterne Verwendung. Er ersetzt keine unabhängige Evidenz für empirische, rechtliche oder naturwissenschaftliche Aussagen. Solche Quellen werden nicht automatisch ergänzt, weil eine unpassende Fachquelle schlechter wäre als eine sichtbar offene Rechercheaufgabe.

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
- ${summary.sourceBackedWithoutSourceArchiveLink} source-backed Registerbegriffe haben noch keinen Link zu einer Detailseite des Quellenarchivs. Das ist ein Publikationsfehler, weil Originalquellen und Qualitätshinweise dort nachvollziehbar bleiben müssen.
- ${records.length - summary.hasRelatedContentBlock} Seiten haben noch keinen zusätzlichen, fachlich passenden Block mit Vertiefungen. Ein solcher Block ist nur dort erforderlich, wo eine konkrete Methode, ein Dokument oder ein Wirkungsfeld tatsächlich passt.
- ${records.length - summary.hasBookChapterLinks} Seiten verlinken noch nicht auf ein konkretes Buchkapitel; das ist eine Abdeckungszahl, keine Pflicht für jeden Begriff.
- ${records.length - summary.hasDocumentLinks} Seiten verlinken noch nicht auf ein Dokument oder die Bibliothek; auch das ist nur für fachlich passende Vertiefungen erforderlich.
- ${summary.repeatedDefinitions} source-backed Registerbegriffe wiederholen aus Gründen der Kürze noch die Kurzdefinition; ${summary.conciseDefinitions} davon sind quellenverlinkt und als konzise Definitionen klassifiziert.
- ${summary.conciseDefinitionsWithModelOnlySource} der konzisen Definitionen stützen sich ausschließlich auf WÖk-Primärquellen. Das dokumentiert die Modellverwendung, nicht unabhängig überprüfte Fach- oder Rechtsaussagen.
- ${summary.definitionNeedsEditorialExpansion} source-backed Registerbegriffe haben nach dieser Regel noch eine potenzielle Langdefinitionslücke und müssen redaktionell mit einer passenden Quelle oder einer bereits belegten Abgrenzung vertieft werden.
- ${summary.legacyOnly} Bestandsseiten sind erhalten und im Hub sichtbar, liegen aber noch nicht vollständig im strukturierten Glossar-Register.
- ${summary.sourceBackedWithoutPublishedGlossaryCrossReference} source-backed Registerbegriffe haben noch keinen sichtbaren Link zu einer anderen Glossar-Detailseite. Für Registerbegriffe ist das ein Publikationsfehler, kein Anlass für erfundene Beziehungen.

## Beispiele für Nachholbedarf

### Keine spezifische WÖk-Bedeutung

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => !record.hasSpecificWoekMeaning)}

### Keine explizite WÖk-Auslegung

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => !record.hasWoekInterpretationBlock)}

### Kein Quellenarchiv-Link

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => record.sourceBacked && !record.hasSourceArchiveLink)}

### Keine Buchkapitel-Links

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => record.bookChapterCount === 0)}

### Keine Dokument-/Bibliothekslinks

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => record.documentLinkCount === 0)}

### Potenzielle Langdefinitionslücken

| Slug | Begriff | Quelle |
| --- | --- | --- |
${missingList((record) => record.definitionNeedsEditorialExpansion)}

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
