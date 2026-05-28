import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "begriffe");
const glossaryFile = path.join(root, "glossar.html");
const termsFile = path.join(root, "public/data/glossary.terms.json");
const navigationFile = path.join(root, "assets/data/navigation.json");
const headerTemplateFile = path.join(root, "templates/header.html");
const footerTemplateFile = path.join(root, "templates/footer.html");
const documentRegistryFile = path.join(root, "assets/data/document-registry.json");
const relationshipFile = path.join(root, "public/data/relationship-manifest.json");
const journalRelatedFile = path.join(root, "assets/data/journal-related-content.json");
const blogIndexFile = path.join(root, "assets/data/blog-index.json");
const sitemapFile = path.join(root, "sitemap.xml");
const site = "https://wirkungsoekonomie.de";

const categoryOrder = [
  "Grundbegriff",
  "Bewertungsbegriff",
  "Messbegriff",
  "Steuerungsbegriff",
  "Architekturbegriff",
  "Schutzbegriff",
  "Datenbegriff",
  "Demokratiebegriff",
  "Kompetenzbegriff",
  "Praxisbegriff",
  "Prüfbegriff",
  "Glossareintrag",
];

const termData = JSON.parse(fs.readFileSync(termsFile, "utf8"));
const navigation = JSON.parse(fs.readFileSync(navigationFile, "utf8"));
const headerTemplate = fs.readFileSync(headerTemplateFile, "utf8");
const footerTemplate = fs.readFileSync(footerTemplateFile, "utf8");
const registryTerms = termData.terms || [];
const registryTermsById = new Map(registryTerms.map((term) => [term.termId || term.id, term]));
const registryTermsByAlias = new Map();
const glossaryHtml = fs.existsSync(glossaryFile) ? fs.readFileSync(glossaryFile, "utf8") : "";
const glossaryActionPattern = /\n?\s*<p class="glossary-entry-action">[\s\S]*?<\/p>/g;
const documentRegistry = readJson(documentRegistryFile, []);
const relationshipManifest = readJson(relationshipFile, { relationships: {} }).relationships || {};
const journalRelated = readJson(journalRelatedFile, { terms: {}, articles: {} });
const blogIndex = readJson(blogIndexFile, []);

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalize(value) {
  return decodeEntities(stripTags(value))
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/ö/g, "oe")
    .replace(/ä/g, "ae")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

for (const term of registryTerms) {
  const values = [term.canonicalLabel, term.label, term.termId, term.slug, ...(term.synonyms || []), ...(term.aliases || [])];
  for (const value of values) {
    const key = normalize(value);
    if (key && !registryTermsByAlias.has(key)) registryTermsByAlias.set(key, term);
  }
}

function slugify(value) {
  return decodeEntities(stripTags(value))
    .replace(/\([^)]*kurz[^)]*\)/gi, "")
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

function slugFromEntry(id, label) {
  if (id) return id.replace(/^begriff-/, "").replace(/-{2,}/g, "-");
  return slugify(label);
}

function labelsOverlap(a, b) {
  const left = normalize(a);
  const right = normalize(b);
  return left === right || left.includes(right) || right.includes(left);
}

function firstSentence(value) {
  const text = decodeEntities(stripTags(value)).replace(/\s+/g, " ").trim();
  const match = text.match(/^(.{24,240}?[.!?])(\s|$)/);
  if (match) return match[1].trim();
  if (text.length <= 220) return text;
  const clipped = text.slice(0, 220).trim();
  const wordSafe = clipped.replace(/\s+\S*$/, "").trim();
  return `${wordSafe || clipped} ...`;
}

function phraseCount(text, phrase) {
  return phraseCountNormalized(normalize(text), normalize(phrase));
}

function phraseCountNormalized(text, phrase) {
  const haystack = ` ${text} `;
  const needle = ` ${phrase} `;
  if (!needle.trim()) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length - 1);
  }
  return count;
}

function humanLabel(value, fallback = "Begriff") {
  const raw = decodeEntities(stripTags(value || fallback)).replace(/[-_]+/g, " ").trim();
  if (!raw) return fallback;
  return raw
    .split(/\s+/)
    .map((part) => {
      if (/^(WÖk|SDG|SDGs|SDG\+|EU|CSRD|ESG|ESRS|NWI|T-SROI|IDG|IDGs)$/i.test(part)) {
        return part.toUpperCase().replace("WÖK", "WÖk");
      }
      return part.charAt(0).toLocaleUpperCase("de") + part.slice(1);
    })
    .join(" ");
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

function pageShell(title, body, depth = "", options = {}) {
  const metaTitle = options.metaTitle || `${title} - Wirkungsökonomie`;
  const metaDescription = options.metaDescription || `Lernseite der Wirkungsökonomie: ${title}.`;
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(metaTitle)}</title>
    <meta name="description" content="${esc(metaDescription)}">
    <link rel="stylesheet" href="${depth}assets/css/style.css?v=20260527-term-pages">
  </head>
  <body>
${renderHeader(depth)}
    <main class="section">
${body}
    </main>
${renderFooter(depth)}
    <script src="${depth}assets/js/main.js?v=20260525-sprint-2"></script>
  </body>
</html>
`;
}

function parseGlossaryEntries(html) {
  const cleaned = html.replace(glossaryActionPattern, "");
  const entries = [];
  const seen = new Map();
  const pattern = /<div([^>]*)>\s*<dt(?:\s+id="([^"]+)")?>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>\s*<\/div>/g;
  let match;
  while ((match = pattern.exec(cleaned))) {
    const attrs = match[1] || "";
    const registryId = (attrs.match(/data-(?:classic-)?term-id="([^"]+)"/) || [])[1] || "";
    const id = match[2] || "";
    const rawLabel = decodeEntities(stripTags(match[3]));
    const lookupLabel = rawLabel.replace(/\s*\((Kurz|Kurzverweis)\)\s*$/i, "").trim();
    const registryTerm =
      registryTermsById.get(registryId) ||
      registryTermsByAlias.get(normalize(rawLabel)) ||
      registryTermsByAlias.get(normalize(lookupLabel)) ||
      registryTermsByAlias.get(normalize(id.replace(/^begriff-/, "")));
    const label = registryTerm?.canonicalLabel || rawLabel;
    if (!label) continue;
    const baseSlug = registryTerm?.slug || slugFromEntry(id, label);
    let slug = baseSlug;
    if (!registryTerm && seen.has(slug) && !labelsOverlap(seen.get(slug), label)) {
      let counter = 2;
      while (seen.has(`${baseSlug}-${counter}`)) counter += 1;
      slug = `${baseSlug}-${counter}`;
    }
    seen.set(slug, label);
    entries.push({
      id,
      label,
      slug,
      html: match[4].trim(),
      text: decodeEntities(stripTags(match[4])),
    });
  }
  return entries;
}

const classicEntries = parseGlossaryEntries(glossaryHtml);
const recordsBySlug = new Map();
const termsBySlug = new Map();
for (const term of registryTerms) {
  const record = {
    ...term,
    title: term.canonicalLabel,
    slug: term.slug,
    orderKey: term.glossaryOrderKey || term.canonicalLabel,
    kind: "registry",
    glossaryAnchor: `begriff-${term.slug}`,
    glossaryHtml: "",
    glossaryText: "",
  };
  recordsBySlug.set(record.slug, record);
  termsBySlug.set(record.slug, record);
}

for (const entry of classicEntries) {
  const existing = recordsBySlug.get(entry.slug);
  if (existing) {
    existing.glossaryAnchor = entry.id || existing.glossaryAnchor;
    existing.glossaryHtml = entry.html;
    existing.glossaryText = entry.text;
    continue;
  }
  const record = {
    termId: entry.slug,
    canonicalLabel: entry.label,
    title: entry.label,
    slug: entry.slug,
    status: "glossareintrag",
    version: "1.0",
    category: "Glossareintrag",
    source: "Glossar der Wirkungsökonomie",
    sourceDocument: "glossar.html",
    sourceSection: "Glossar",
    shortDefinition: firstSentence(entry.text) || `Glossareintrag zu ${entry.label}.`,
    hoverDefinition: firstSentence(entry.text) || `Glossareintrag zu ${entry.label}.`,
    longDefinition: entry.text,
    usageNote: "Der Eintrag dient als begriffliche Einordnung innerhalb der Wirkungsökonomie.",
    doNotConfuseWith: [],
    synonyms: [],
    relatedTerms: [],
    relatedDocuments: [],
    examples: [],
    preferredUsage: "",
    deprecatedUsage: [],
    reviewStatus: "glossary-entry",
    glossaryOrderKey: entry.label,
    firstApprovedIn: "",
    lastUpdated: "",
    orderKey: entry.label,
    kind: "classic",
    glossaryAnchor: entry.id,
    glossaryHtml: entry.html,
    glossaryText: entry.text,
  };
  recordsBySlug.set(record.slug, record);
  termsBySlug.set(record.slug, record);
}

const records = Array.from(recordsBySlug.values()).sort((a, b) =>
  new Intl.Collator("de", { sensitivity: "base", numeric: true }).compare(a.orderKey || a.canonicalLabel, b.orderKey || b.canonicalLabel)
);

const anchorToSlug = new Map();
const labelToSlug = new Map();
for (const record of records) {
  if (record.glossaryAnchor) anchorToSlug.set(record.glossaryAnchor, record.slug);
  anchorToSlug.set(`begriff-${record.slug}`, record.slug);
  labelToSlug.set(normalize(record.canonicalLabel), record.slug);
  for (const synonym of record.synonyms || []) labelToSlug.set(normalize(synonym), record.slug);
}

for (const record of records) {
  if (!record.glossaryHtml) continue;
  const anchors = Array.from(record.glossaryHtml.matchAll(/href="#([^"]+)"/g))
    .map((match) => anchorToSlug.get(match[1]))
    .filter(Boolean)
    .filter((slug) => slug !== record.slug);
  record.relatedTerms = Array.from(new Set([...(record.relatedTerms || []), ...anchors])).slice(0, 10);
}

const termTargetLinks = new Map([
  ["agenda-2030", "../../verstehen/sdgs-sdgplus/geschichte/"],
  ["sdg-sdgplus-referenzrahmen", "../../verstehen/sdgs-sdgplus/"],
  ["sdg-plus", "../../verstehen/sdgs-sdgplus/#sdgplus"],
  ["sdgs", "../../verstehen/sdgs-sdgplus/"],
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
  ["social-taxonomy", "../../bibliothek/social-taxonomy-wirkungsoekonomie/"],
]);

const centralTermDetails = new Map([
  ["wirkung", ["Sie macht sichtbar, ob sich Zustände tatsächlich verändern, statt nur Aktivität, Geld oder Reichweite zu zählen.", "Nicht jede Wirkung ist positiv. Der Begriff ist neutral und braucht Bewertung.", "Ein billiges Produkt kann verkauft werden und gleichzeitig Wasser, Gesundheit oder Arbeitsrechte belasten.", ["Wirkung ist kein Gütesiegel.", "Wirkung ersetzt keine demokratische Entscheidung."], [["Kompass", "../../kompass.html"], ["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Wirkungsfelder", "../../wirkungsfelder/"]]]],
  ["wirkungspotenzial", ["Es hilft, frühe Hinweise zu Wirkungspfaden zu erkennen, ohne eine endgültige Bewertung vorzutäuschen.", "Potenzial ist keine Faktenprüfung, keine Zertifizierung und kein fertiger Score.", "Ein Medienbeitrag kann Polarisierungspotenzial haben, ohne dass jede Reaktion vorhergesagt wird.", ["Potenzial ist nicht Ergebnis.", "Ein Prüfhinweis ist kein Urteil."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["positive-netto-wirkung", ["Sie verhindert, dass einzelne gute Effekte schwere Schäden überdecken.", "Positive Netto-Wirkung ist keine Schönrechnung und kein einfacher Durchschnitt.", "Ein klimafreundliches Produkt kann wegen schwerer Arbeitsrechtsprobleme trotzdem kritisch bleiben.", ["Netto heißt nicht, dass alles verrechnet werden darf.", "Wirkungsgrenzen bleiben wirksam."], [["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"], ["Scorecards", "../../werkzeuge/scorecards/"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["wirkungsrueckkopplung", ["Sie macht Wirkung entscheidungsrelevant, indem sie in Preise, Budgets, Kapital oder Regeln zurückgeführt wird.", "Sie ist keine zentrale Planwirtschaft und keine automatische Entscheidung.", "Eine Produktsteuer kann steigen oder sinken, wenn geprüfte Produktwirkung schlechter oder besser wird.", ["Rückkopplung ist nicht nur Strafe.", "Rechtsschutz und demokratische Kontrolle bleiben nötig."], [["Wirkungsumsatzsteuer", "../../werkzeuge/wirkungsumsatzsteuer/"], ["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungsblindheit", ["Sie erklärt, warum schädliche Folgen wirtschaftlich erfolgreich erscheinen können.", "Wirkungsblindheit ist kein Absichtsvorwurf gegen einzelne Personen.", "Ein Algorithmus optimiert Klicks und übersieht Vertrauen, Diskursqualität oder Polarisierung.", ["Blindheit heißt nicht, dass keine Wirkung existiert.", "Sie heißt: Die Wirkung fehlt im Steuerungssystem."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Digitalisierung & KI", "../../portale/digitalisierung-ki-wirkungsdatenraeume/"]]]],
  ["reverse-merit-order", ["Sie schützt vor dem Schönrechnen schwerer Schäden durch gute Werte an anderer Stelle.", "Sie ist kein einfacher Durchschnitt und keine Strafliste.", "Gute Klimawerte heben schwere Kinderrechtsverletzungen in einer Lieferkette nicht auf.", ["Nicht jede Schwäche blockiert alles.", "Entscheidend sind definierte Wirkungsgrenzen."], [["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"], ["Produktwirkung testen", "../../erleben.html#simulator"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["nwi", ["Er verdichtet Wirkungsdimensionen zu Orientierung, ohne Detailprüfung zu ersetzen.", "Der NWI ist kein ESG-Rating und keine amtliche Zertifizierung.", "Ein Projekt kann einen NWI als Übersicht erhalten, während kritische Einzelfelder separat sichtbar bleiben.", ["Ein Index ist keine Wahrheitstabelle.", "Datenqualität bleibt entscheidend."], [["NWI Methodik", "../../werkzeuge/netto-wirkungs-index/"], ["Impact Controlling", "../../werkzeuge/impact-controlling/"]], [["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/"]]]],
  ["t-sroi", ["Er macht vermiedene Schäden, Transformation und Stabilität als Investitionslogik diskutierbar.", "T-SROI ist keine sichere Renditeprognose und keine Anlageberatung.", "Prävention kann Folgekosten vermeiden, obwohl Kosten und Nutzen in verschiedenen Haushalten liegen.", ["Monetarisierung ist Hilfssprache.", "Unsicherheit muss sichtbar bleiben."], [["T-SROI", "../../werkzeuge/impact-controlling/t-sroi/"]], [["Gesundheit & Pflege", "../../wirkungsfelder/gesundheit-pflege/"]]]],
  ["woek-id", ["Sie macht Indikatoren nachvollziehbar, versioniert und prüfbar.", "Eine WÖk-ID ist keine Personen-ID und kein Trackinginstrument.", "Ein Wasserindikator braucht Einheit, Quelle, Zeitraum, Schwelle und Bewertungslogik.", ["Die ID bewertet nicht selbst.", "Sie macht die Datenbasis prüfbar."], [["WÖk-IDs", "../../werkzeuge/woek-ids/"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["scorecard", ["Sie zeigt starke, schwache und kritische Wirkungsfelder nebeneinander.", "Eine Scorecard ist kein Urteil über Menschen und kein endgültiges Gütesiegel.", "Eine Produktscorecard kann Klima, Wasser, Arbeit, Gesundheit und Kreislauf getrennt darstellen.", ["Der Gesamtscore darf Schwachstellen nicht verdecken.", "Scorecards brauchen Interpretation."], [["Scorecards", "../../werkzeuge/scorecards/"], ["Produktwirkung testen", "../../erleben.html#simulator"]], [["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/"]]]],
  ["social-taxonomy", ["Sie macht soziale Wirkung in Märkten entscheidungsfähig: Menschenrechte, gute Arbeit, Grundversorgung, Teilhabe, Gemeinschaften und demokratische Stabilität werden nicht nur berichtet, sondern für Kapital, Beschaffung und Management nutzbar.", "Social Taxonomy ist Stand 27. Mai 2026 kein verbindliches eigenständiges EU-Rechtsinstrument und keine Personenbewertung.", "Ein Wohnprojekt wird nicht nur nach Energie und Rendite betrachtet, sondern auch nach Bezahlbarkeit, Verdrängungsrisiko, Gesundheit, Beteiligung und Quartierswirkung.", ["Nicht mit der geltenden EU-Umwelt-Taxonomie verwechseln.", "Keine Social-Credit-Logik und keine Bewertung privater Lebensführung.", "Positive soziale Beiträge dürfen rote Linien bei Arbeit, Rechten, Datenschutz oder Diskriminierung nicht überdecken."], [["Scorecards", "../../werkzeuge/scorecards/"], ["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"], ["Impact Controlling", "../../werkzeuge/impact-controlling/"]], [["Finanzsystem & Kapital", "../../wirkungsfelder/finanzsystem-kapital/"], ["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/"], ["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["faktencheck", ["Er schützt gemeinsame Wirklichkeit, indem er Behauptungen an Quellen, Daten und Kontext zurückbindet.", "Ein Faktencheck ist keine Folgenbewertung und keine Garantie, dass eine Aussage gesellschaftlich unschädlich wirkt.", "Die Aussage 'Die Arbeitslosenquote ist gesunken' wird mit Statistik, Erhebungsmethode und Kontext abgeglichen.", ["Faktencheck ersetzt nicht Folgencheck.", "Richtigkeit allein beantwortet noch nicht die Wirkungsfrage."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["folgencheck", ["Er macht mögliche Wirkungen sichtbar, bevor Schäden, Nebenwirkungen oder Systemfolgen vollständig eingetreten sind.", "Der Folgencheck ist keine Zensur, keine Personenbewertung und kein Wahrheitsmonopol.", "Eine faktisch richtige Aussage kann trotzdem polarisierend wirken, wenn sie einseitig gerahmt, strategisch wiederholt oder aus dem Kontext gelöst wird.", ["Folgencheck prüft Wirkungspotenziale, keine Gesinnungen.", "Er ersetzt demokratische Entscheidungen nicht, sondern bereitet sie besser vor."], [["WÖk-Scanner", "../../anwendungen/scanner.html"], ["Medienwirkung prüfen", "../../erleben.html#medienwirkung"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"], ["Staat, Recht & Demokratie", "../../wirkungsfelder/staat-recht-demokratie/"]]]],
  ["idgs", ["Sie beschreiben innere und soziale Fähigkeiten, die Menschen und Organisationen brauchen, damit Transformation nicht nur als Ziel, sondern als Fähigkeit entsteht.", "IDGs sind kein Ersatz für SDGs, SDG+ oder Wirkungskompetenz und kein offizieller UN-Zielrahmen.", "Eine Verwaltung kann IDG-Kompetenzen nutzen, um Konflikte, Unsicherheit und Kooperation in Transformationsprozessen besser zu tragen.", ["IDGs sind kein Messsystem für Wirkung.", "Sie erklären Fähigkeiten, nicht Zielerreichung."], [["Akademie", "../../akademie.html"], ["Kompass", "../../kompass.html"]], [["Bildung", "../../wirkungsfelder/bildung/"], ["Wissenschaft & Innovation", "../../wirkungsfelder/wissenschaft-innovation-digitalisierung/"]]]],
  ["wirkungseinkommen", ["Es zeigt, wie Einkommen und Teilhabe auch jenseits reiner Erwerbsarbeit gedacht werden können.", "Es ist kein fertiges Grundeinkommen und keine Finanzierungszusage.", "Automatisierte Wertschöpfung kann modellhaft in Fonds, Weiterbildung und Einkommensanteile zurückgeführt werden.", ["Das Tool erzeugt kein Geld.", "Es zeigt Rückkopplungslogik, keine amtlichen Ansprüche."], [["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungsfonds", ["Er bündelt Rückflüsse, damit Prävention, Bildung, Transformation oder Sicherung finanzierbar werden.", "Ein Wirkungsfonds ist kein Geld aus dem Nichts und kein Schattenhaushalt.", "Rückflüsse aus automatisierter Wertschöpfung können Weiterbildung und Übergangsschutz finanzieren.", ["Fonds ersetzen keine Haushaltsentscheidungen.", "Finanzierungsquellen müssen offen bleiben."], [["Wirkungsfonds", "../../werkzeuge/wirkungsfonds/"], ["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungshaushalt", ["Er zeigt, ob öffentliche Mittel Zustände verbessern oder nur ausgegeben werden.", "Ein Wirkungshaushalt ersetzt keine Parlamente und kein Haushaltsrecht.", "Vermiedene Krankheit kann als Präventionswirkung in Haushalten sichtbar werden.", ["Wirkungshaushalte brauchen Evaluation.", "Grundrechte dürfen nicht durch Kennzahlen ersetzt werden."], [["Wirkungshaushalt", "../../werkzeuge/wirkungshaushalt/"]], [["Gesundheit & Pflege", "../../wirkungsfelder/gesundheit-pflege/"]]]],
  ["wirkungsdatenraum", ["Er macht Wirkung prüfbar, ohne Datenschutz und Zweckbindung aufzugeben.", "Ein Wirkungsdatenraum ist kein ungeschützter Datenpool und kein Personen-Scoring.", "Ein Produktpass kann Klima- und Lieferkettendaten bereitstellen, ohne personenbezogene Daten offenzulegen.", ["Mehr Daten sind nicht automatisch bessere Wirkung.", "Rechte und Datenqualität sind Teil der Wirkung."], [["Digitale Produktpässe", "../../werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"]], [["Digitalisierung & KI", "../../portale/digitalisierung-ki-wirkungsdatenraeume/"]]]],
  ["wirkungskompetenz", ["Sie macht Menschen und Organisationen fähig, Folgen, Zielkonflikte und Datenqualität zu verstehen.", "Wirkungskompetenz ist keine Ideologie und keine zentrale Wissensverwaltung.", "Schüler:innen lernen zu unterscheiden, ob ein Projekt nur Output erzeugt oder Zustände verbessert.", ["Kompetenz heißt nicht Kontrolle.", "Sie stärkt Urteilskraft und Teilhabe."], [["Akademie", "../../akademie.html"], ["Wirkungsschule-Check", "../../erleben/wirkungsschule-check/"]], [["Bildung", "../../wirkungsfelder/bildung/"]]]],
]);

function termLink(slug) {
  const term = termsBySlug.get(slug) || termsBySlug.get(labelToSlug.get(normalize(slug)));
  if (!term) return `<span class="term-chip muted">${esc(slug)}</span>`;
  return `<a class="term-chip" href="../../begriffe/${esc(term.slug)}/">${esc(term.canonicalLabel)}</a>`;
}

function listItems(values, fallback = "Keine Einträge") {
  if (!Array.isArray(values) || values.length === 0) return `<p>${esc(fallback)}</p>`;
  return `<ul class="clean-list">${values.map((value) => `<li>${esc(value)}</li>`).join("")}</ul>`;
}

function linkedChips(items, fallback = "Keine Einträge") {
  if (!Array.isArray(items) || items.length === 0) return `<p>${esc(fallback)}</p>`;
  return `<div class="term-chip-row">${items.map(([label, href]) => `<a class="term-chip" href="${esc(href)}">${esc(label)}</a>`).join("")}</div>`;
}

function transformGlossaryHtml(html) {
  return String(html || "")
    .replace(glossaryActionPattern, "")
    .replace(/href="#([^"]+)"/g, (_, anchor) => {
      const slug = anchorToSlug.get(anchor);
      return slug ? `href="../../begriffe/${esc(slug)}/"` : `href="../../glossar.html#${esc(anchor)}"`;
    })
    .replace(/href="(?!https?:|mailto:|#|\/|\.\.\/)([^"]+)"/g, 'href="../../$1"');
}

function termLead(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return "Mensch, Planet und Demokratie sind die verständliche Zusammenfassung der SDGs, der Agenda 2030 und der SDG+-Erweiterung der Wirkungsökonomie. Der Dreiklang übersetzt den fachlichen Referenzrahmen in eine Sprache, die öffentlich anschlussfähig ist.";
  }
  return term.shortDefinition || term.hoverDefinition || `Glossareintrag zu ${term.canonicalLabel}.`;
}

function termSummary(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return "Mensch, Planet und Demokratie sind die drei Oberbegriffe, unter denen die Wirkungsökonomie die SDGs, die Agenda 2030 und SDG+ zusammenfasst. Fachlich bleibt der Referenzrahmen SDGs, Agenda 2030 und SDG+. Kommunikativ wird daraus: Wirkung für Mensch, Planet und Demokratie.";
  }
  return term.hoverDefinition || term.shortDefinition || firstSentence(term.longDefinition);
}

function termDefinitionHtml(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return `<p>Der Begriff bezeichnet die drei übergeordneten Wirkungsdimensionen der Wirkungsökonomie. Mensch steht für soziale Gerechtigkeit, Gesundheit, Bildung, Teilhabe, Würde und Sicherheit. Planet steht für Klima, Ressourcen, Wasser, Boden, Biodiversität, Energie und Regeneration. Demokratie steht für Rechtsstaatlichkeit, Medienqualität, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
            <p>Damit sind Mensch, Planet und Demokratie keine zusätzlichen UN-Ziele. Sie sind die kommunikative Ordnung, mit der die Wirkungsökonomie die SDGs, die Agenda 2030 und SDG+ verständlich zusammenführt.</p>`;
  }
  if (term.glossaryHtml) {
    const transformed = transformGlossaryHtml(term.glossaryHtml);
    return /<(p|ul|ol|table|div|section|blockquote|h[1-6])[\s>]/i.test(transformed)
      ? transformed
      : `<p>${transformed}</p>`;
  }
  return `<p>${esc(term.longDefinition || term.shortDefinition || term.hoverDefinition)}</p>`;
}

function termWhyHtml(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return `<p>Die SDGs und die Agenda 2030 sind fachlich zentral, aber in der Bevölkerung wenig bekannt. Für öffentliche Kommunikation braucht die Wirkungsökonomie deshalb eine einfache, klare und wiedererkennbare Sprache. Mensch, Planet und Demokratie macht sichtbar, worum es geht: nicht um abstrakte Zielnummern, sondern um Lebensqualität, ökologische Stabilität und demokratische Handlungsfähigkeit.</p>
            <p>Der Dreiklang ersetzt die SDGs nicht. Er übersetzt sie.</p>`;
  }
  return `<p>${esc(term.preferredUsage || term.usageNote || "Der Begriff hilft, Wirkung, Bewertung und Rückkopplung präzise zu unterscheiden.")}</p>`;
}

function termUsageHtml(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return `<p>Mensch, Planet und Demokratie nicht als Zusatz-Ziel neben den SDGs verwenden. Der Dreiklang ist die öffentliche Übersetzung des fachlichen Referenzrahmens und bleibt an Wirkung, Wirkungsbewertung und positive Netto-Wirkung gebunden.</p>`;
  }
  return `<p>${esc(term.usageNote || "Als erklärenden Begriff verwenden und bei fachlicher Bewertung mit Quellen, Datenqualität und Kontext verbinden.")}</p>`;
}

function detailLinks(term) {
  const links = [];
  const target = termTargetLinks.get(term.slug);
  if (target) links.push({ href: target, label: term.slug === "social-taxonomy" ? "Ausarbeitung lesen" : "Themenseite öffnen" });
  if (term.glossaryAnchor) links.push({ href: `../../glossar.html#${term.glossaryAnchor}`, label: "Glossareintrag ansehen" });
  else if (term.sourceDocument === "glossar.html") links.push({ href: "../../glossar.html", label: "Glossar ansehen" });
  links.push({ href: "../../begriffe/", label: "Alle Begriffe" });
  links.push({ href: `../../suche.html?q=${encodeURIComponent(term.canonicalLabel)}`, label: "Website durchsuchen" });
  return links
    .map((link, index) => `<a class="btn ${index === 0 ? "btn-primary" : "btn-secondary"}" href="${esc(link.href)}">${esc(link.label)}</a>`)
    .join("");
}

function learningData(term) {
  const central = centralTermDetails.get(term.slug);
  if (central) return central;
  const confused = (term.doNotConfuseWith || []).filter(Boolean).slice(0, 3);
  const notMeaning = confused.length
    ? `${term.canonicalLabel} ist nicht dasselbe wie ${confused.join(", ")}. Die Abgrenzung verhindert, dass unterschiedliche Prüf- und Steuerungsfragen vermischt werden.`
    : `${term.canonicalLabel} ist keine automatische Bewertung und kein Ersatz für Kontext, Datenqualität und demokratische Entscheidung.`;
  const example = (term.examples || []).length
    ? term.examples[0]
    : `In der Anwendung hilft ${term.canonicalLabel}, eine Beobachtung, Entscheidung oder Datenlage genauer einzuordnen und mit Wirkung, Nebenwirkung und Rückkopplung zu verbinden.`;
  const misconceptions = [
    ...confused.map((item) => `Nicht mit ${item} gleichsetzen.`),
    "Nicht als isolierte Kennzahl verwenden.",
    "Immer Kontext, Datenqualität und Wirkungsgrenzen mitprüfen.",
  ].slice(0, 4);
  return [
    term.preferredUsage || term.hoverDefinition || term.shortDefinition,
    notMeaning,
    example,
    misconceptions,
    toolLinks(term).map((item) => [item.title, item.url]),
    fieldLinks(term).map((item) => [item.title, item.url]),
  ];
}

function learningBlock(term) {
  const [why, notMeaning, example, misconceptions, tools, fields] = learningData(term);
  return `<section class="term-summary-card" aria-labelledby="learning-${esc(term.slug)}">
          <h2 id="learning-${esc(term.slug)}">Lernseite zu ${esc(term.canonicalLabel)}</h2>
          <div class="term-section-grid">
            <section class="term-section-card"><p class="section-eyebrow">Warum wichtig?</p><h3>Was macht der Begriff sichtbar?</h3><p>${esc(why)}</p></section>
            <section class="term-section-card"><p class="section-eyebrow">Abgrenzung</p><h3>Was es nicht bedeutet</h3><p>${esc(notMeaning)}</p></section>
            <section class="term-section-card"><p class="section-eyebrow">Beispiel</p><h3>So wird es konkret</h3><p>${esc(example)}</p></section>
            <section class="term-section-card"><p class="section-eyebrow">Missverständnisse</p><h3>Worauf achten?</h3>${listItems(misconceptions)}</section>
          </div>
          <div class="term-section-grid">
            <section class="term-section-card"><h3>Passende Tools</h3>${linkedChips(tools)}</section>
            <section class="term-section-card"><h3>Passende Wirkungsfelder</h3>${linkedChips(fields)}</section>
          </div>
        </section>`;
}

const termExampleBlocks = new Map([
  ["wirkungssteuer", {
    eyebrow: "Beispielrechnung",
    title: "Apfel & T-Shirt: Wirkung im Preis",
    text: "Die Beispielseite zeigt Schritt für Schritt, wie aus Lieferkettendaten eine Scorecard, daraus eine Steuerklasse und daraus ein Endpreis entsteht.",
    href: "../../erleben/wirkungssteuer-beispiele/",
    label: "Apfel & T-Shirt ansehen",
  }],
  ["reverse-merit-order", {
    eyebrow: "Praxisbeispiel",
    title: "Warum das schwächste Feld entscheidet",
    text: "Am T-Shirt-Beispiel wird sichtbar, warum gute Einzelwerte schwere Arbeits-, Chemie- oder Wasserbelastungen nicht überdecken dürfen.",
    href: "../../erleben/wirkungssteuer-beispiele/#t-shirt",
    label: "Beispiel T-Shirt ansehen",
  }],
]);

function termExampleBlock(term) {
  const block = termExampleBlocks.get(term.slug);
  if (!block) return "";
  return `<section class="term-summary-card" aria-labelledby="example-${esc(term.slug)}">
          <p class="section-eyebrow">${esc(block.eyebrow)}</p>
          <h2 id="example-${esc(term.slug)}">${esc(block.title)}</h2>
          <p>${esc(block.text)}</p>
          <div class="hero-actions"><a class="btn btn-primary" href="${esc(block.href)}">${esc(block.label)}</a></div>
        </section>`;
}

function termExtraBlock(term) {
  if (term.termId === "folgencheck") {
    const steps = [
      ["1. Gegenstand klären", "Was wird geprüft: Aussage, Maßnahme, Gesetz, Produkt, Technologie, Kapitalfluss oder Medienbeitrag?"],
      ["2. Wirkstoffe identifizieren", "Welche Sprache, Anreize, Technik, Preise, Regeln oder Frames können Wirkung auslösen?"],
      ["3. Wirkungsraum bestimmen", "In welchem sozialen, ökologischen, wirtschaftlichen, medialen, politischen oder digitalen Raum kann Wirkung entstehen?"],
      ["4. Wirkungsempfänger bestimmen", "Wer oder was kann betroffen sein: Menschen, Gruppen, Institutionen, Märkte, Ökosysteme oder Demokratie?"],
      ["5. Wirkungspfade sichtbar machen", "Über welche Mechanismen entstehen direkte, indirekte oder zeitverzögerte Folgen?"],
      ["6. Wirkungspotenziale einordnen", "Welche positiven, negativen, neutralen oder ambivalenten Potenziale sind plausibel?"],
      ["7. Nebenwirkungen und Rebound prüfen", "Wird Schaden verlagert, verstärkt oder nur unsichtbar gemacht?"],
      ["8. Datenqualität und Unsicherheit markieren", "Was ist belegt, plausibel, unklar oder unbekannt?"],
      ["9. Schutzgrenzen prüfen", "Wo dürfen Grundrechte, Würde, Datenschutz, Minderheitenschutz oder demokratische Kontrolle nicht überschritten werden?"],
      ["10. Handlungsoptionen ableiten", "Welche nächsten Fragen, Korrekturen, Gegenmaßnahmen oder Rückkopplungen ergeben sich?"],
    ];
    return `<section class="term-summary-card" aria-labelledby="folgencheck-compare">
          <h2 id="folgencheck-compare">Faktencheck vs. Folgencheck</h2>
          <div class="table-wrap" role="region" aria-label="Faktencheck und Folgencheck im Vergleich" tabindex="0">
            <table>
              <thead><tr><th>Prüfung</th><th>Leitfrage</th><th>Prüft</th><th>Ergebnis</th></tr></thead>
              <tbody>
                <tr><td>Faktencheck</td><td>Stimmt das?</td><td>Quellen, Daten, Belege, Kontext, Richtigkeit.</td><td>Wahr, falsch, unbelegt, verkürzt oder irreführend.</td></tr>
                <tr><td>Folgencheck</td><td>Was kann das auslösen?</td><td>Wirkstoffe, Wirkungspotenziale, Wirkungspfade, Betroffene, Systemfolgen und Datenlücken.</td><td>Positive, negative, neutrale oder ambivalente Wirkungspotenziale sowie Schutzgrenzen.</td></tr>
                <tr><td>Wirkungsbewertung</td><td>Wie ist die Wirkung einzuordnen?</td><td>SDGs, SDG+, Mensch, Planet, Demokratie und definierte Wirkungsgrenzen.</td><td>Einordnung im Referenzrahmen.</td></tr>
                <tr><td>Wirkungsrückkopplung</td><td>Was folgt daraus?</td><td>Entscheidungen, Preise, Regeln, Förderung, Kommunikation oder Korrektur.</td><td>Handlungsoptionen und Verantwortungspunkte.</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="term-summary-card" aria-labelledby="folgencheck-steps">
          <h2 id="folgencheck-steps">10-Schritte-Modell des Folgenchecks</h2>
          <div class="term-section-grid">
            ${steps.map(([title, text]) => `<section class="term-section-card"><h3>${esc(title)}</h3><p>${esc(text)}</p></section>`).join("")}
          </div>
        </section>`;
  }
  if (term.termId === "faktencheck") {
    return `<section class="term-summary-card" aria-labelledby="facts-and-effects">
          <h2 id="facts-and-effects">Warum Faktencheck und Folgencheck zusammengehören</h2>
          <p>Ein Faktencheck ist die Grundlage: Ohne überprüfbare Quellen, Kontext und Richtigkeit entsteht keine belastbare öffentliche Orientierung. Die Wirkungsökonomie ergänzt diese Prüfung um den Folgencheck, weil auch faktisch richtige Aussagen Wirkungen entfalten können.</p>
          <div class="term-section-grid">
            <section class="term-section-card"><h3>Faktencheck fragt</h3><p>Stimmt das? Ist es belegt, verkürzt, irreführend oder aus dem Zusammenhang gerissen?</p></section>
            <section class="term-section-card"><h3>Folgencheck fragt</h3><p>Was kann das auslösen? Welche Wirkungspotenziale, Zielkonflikte, Datenlücken oder Schutzgrenzen werden sichtbar?</p></section>
          </div>
        </section>`;
  }
  if (term.termId === "idgs") {
    return `<section class="term-summary-card" aria-labelledby="idgs-wirkungskompetenz">
          <h2 id="idgs-wirkungskompetenz">Verhältnis zu Wirkungskompetenz</h2>
          <p>Die IDGs beschreiben wichtige innere und soziale Entwicklungsfähigkeiten. Wirkungskompetenz knüpft daran an, geht aber weiter: Sie verbindet innere Entwicklung mit Daten, Systemen, Demokratie, Technologie, Institutionen, Wirkungsmessung und Rückkopplung.</p>
          <p>In der Wirkungsökonomie sind IDGs deshalb ein Anschlussrahmen. Wirkungskompetenz ist die operative Fähigkeit, Wirkungen, Wirkungspotenziale, Nebenwirkungen, Unsicherheit und Verantwortung in konkreten Entscheidungen zu erkennen und zu gestalten.</p>
        </section>`;
  }
  if (term.termId !== "mensch-planet-demokratie") return "";
  return `<section class="term-summary-card" aria-labelledby="sdg-context-title">
          <h2 id="sdg-context-title">Warum nicht einfach nur SDGs sagen?</h2>
          <p>Die SDGs und die Agenda 2030 sind der globale Referenzrahmen. Sie sind fachlich wichtig und politisch anschlussfähig. In der öffentlichen Kommunikation sind sie jedoch oft zu abstrakt.</p>
          <p>Die Wirkungsökonomie nutzt deshalb den Dreiklang Mensch, Planet und Demokratie. Er macht verständlich, was die Zielstruktur bedeutet: gutes Leben und Teilhabe für Menschen, Schutz und Regeneration des Planeten sowie starke demokratische Institutionen, Medienqualität, Rechtsstaatlichkeit und gesellschaftlichen Zusammenhalt.</p>
          <p>SDG+ ist keine UN-Kategorie. SDG+ ist eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
        </section>`;
}

function htmlTitle(file) {
  const html = fs.readFileSync(file, "utf8");
  return decodeEntities(stripTags((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [null, path.basename(path.dirname(file))])[1]));
}

function htmlDescription(file) {
  const html = fs.readFileSync(file, "utf8");
  const meta = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (meta) return decodeEntities(meta[1]);
  const p = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return p ? firstSentence(p[1]) : "";
}

function routeForFile(file) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

function collectHtmlPages(prefixes) {
  const files = [];
  for (const prefix of prefixes) {
    const start = path.join(root, prefix);
    if (!fs.existsSync(start)) continue;
    walk(start, (file) => {
      if (file.endsWith(".html")) files.push(file);
    });
  }
  return files.map((file) => {
    const html = fs.readFileSync(file, "utf8");
    return {
      url: routeForFile(file),
      title: htmlTitle(file),
      excerpt: htmlDescription(file),
      text: normalize(html),
    };
  });
}

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target, callback);
    else callback(target);
  }
}

const referencePages = collectHtmlPages(["referenz"]).filter((page) =>
  /\/referenz\/(kapitel-|teil-|version-1-1\/|$)/.test(page.url)
);
const blogPages = collectHtmlPages(["blog"]);
const blogMeta = new Map();
for (const item of blogPages) blogMeta.set(item.url, item);
for (const item of blogIndex) blogMeta.set(item.url, { ...blogMeta.get(item.url), ...item });

function aliasesFor(term) {
  return Array.from(new Set([
    term.canonicalLabel,
    term.slug.replace(/-/g, " "),
    ...(term.synonyms || []),
  ].filter(Boolean).map(normalize).filter((item) => item.length >= 3)));
}

function scoreText(term, text) {
  const aliases = aliasesFor(term);
  const haystack = normalize(text);
  let score = 0;
  for (const alias of aliases) {
    const count = phraseCountNormalized(haystack, alias);
    if (count) score += (alias.split(" ").length > 1 ? 8 : 4) * Math.min(count, 5);
  }
  return score;
}

function scoreReferencePage(term, page) {
  const aliases = aliasesFor(term);
  const title = normalize(page.title);
  const contentTitle = title
    .replace(/^kapitel\s+\d+\s+/, "")
    .replace(/^teil\s+\d+\s+/, "")
    .trim();
  const excerpt = normalize(page.excerpt);
  const url = normalize(page.url.replace(/[-/]+/g, " "));
  let score = 0;
  for (const alias of aliases) {
    const words = alias.split(" ").length;
    const titleHits = phraseCountNormalized(title, alias);
    const excerptHits = phraseCountNormalized(excerpt, alias);
    const urlHits = phraseCountNormalized(url, alias);
    const textHits = phraseCountNormalized(page.text, alias);
    if (contentTitle === alias) score += 340 + words * 20;
    if (contentTitle.startsWith(`${alias} `)) score += 140 + words * 12;
    if (title === alias || title.endsWith(` ${alias}`)) score += 160 + words * 12;
    if (titleHits) score += 90 + words * 12;
    if (urlHits) score += 80 + words * 8;
    if (excerptHits) score += 32 + words * 6;
    score += Math.min(Math.max(textHits - titleHits - excerptHits, 0), 6) * (words > 1 ? 5 : 3);
  }
  if (page.url === "/referenz/" && term.slug !== "wirkungsoekonomie") score -= 80;
  if (page.url.includes("/teil-") && !aliases.some((alias) => phraseCount(title, alias))) score -= 20;
  return score;
}

function referenceLinks(term) {
  const scored = referencePages
    .map((page) => ({ ...page, score: scoreReferencePage(term, page) }))
    .filter((page) => page.score >= 18)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "de"));
  return scored.slice(0, 4);
}

function journalLinks(term) {
  const direct = journalRelated.terms?.[term.slug] || [];
  const relations = relationshipManifest[term.slug]?.journalArticles || [];
  const items = [];
  for (const item of direct) items.push(item);
  for (const url of relations) {
    const meta = blogMeta.get(url);
    if (meta) items.push(meta);
  }
  if (items.length === 0) {
    const scored = Array.from(blogMeta.values())
      .map((page) => ({ ...page, score: scoreText(term, `${normalize(page.title)} ${normalize(page.excerpt)} ${page.text || ""}`) }))
      .filter((page) => page.score > 1)
      .sort((a, b) => b.score - a.score || String(b.date || "").localeCompare(String(a.date || "")));
    items.push(...scored.slice(0, 4));
  }
  return uniqueByUrl(items).slice(0, 4);
}

function documentLinks(term) {
  const relationDocs = new Set(relationshipManifest[term.slug]?.documents || []);
  const termNames = new Set([term.slug, term.termId, normalize(term.canonicalLabel), ...(term.synonyms || []).map(normalize)].filter(Boolean));
  const direct = documentRegistry.filter((doc) => {
    if (!doc.isPublic || doc.isArchive) return false;
    if (relationDocs.has(doc.id) || relationDocs.has(doc.slug)) return true;
    return (doc.relatedTerms || []).some((item) => termNames.has(item) || termNames.has(normalize(item)));
  });
  if (direct.length) return direct.slice(0, 4);
  return documentRegistry
    .filter((doc) => doc.isPublic && !doc.isArchive)
    .map((doc) => ({ ...doc, score: scoreText(term, normalize([doc.title, doc.summary, ...(doc.relatedTerms || [])].join(" "))) }))
    .filter((doc) => doc.score > 1)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "de"))
    .slice(0, 4);
}

function toolLinks(term) {
  return documentLinks(term)
    .flatMap((doc) => doc.relatedTools || [])
    .filter(Boolean)
    .slice(0, 4)
    .map((url) => ({ title: labelFromUrl(url), url: relativeFromTerm(url) }));
}

function fieldLinks(term) {
  return documentLinks(term)
    .flatMap((doc) => doc.relatedFields || [])
    .filter(Boolean)
    .slice(0, 4)
    .map((url) => ({ title: labelFromUrl(url), url: relativeFromTerm(url) }));
}

function labelFromUrl(url) {
  const clean = String(url).replace(/^\/|\/$/g, "");
  const last = clean.split("/").pop() || clean;
  return last
    .split("-")
    .filter(Boolean)
    .map((part) => part ? part[0].toLocaleUpperCase("de") + part.slice(1) : part)
    .join(" ");
}

function relativeFromTerm(url) {
  if (!url) return "#";
  if (/^https?:/i.test(url)) return url;
  return `../..${url.startsWith("/") ? url : `/${url}`}`;
}

function uniqueByUrl(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (!item?.url || seen.has(item.url)) continue;
    seen.add(item.url);
    result.push(item);
  }
  return result;
}

function resourceCards(title, eyebrow, items, fallback) {
  return `<section class="term-resource-section" aria-labelledby="${esc(slugify(title))}">
          <div class="term-resource-heading">
            <p class="section-eyebrow">${esc(eyebrow)}</p>
            <h2 id="${esc(slugify(title))}">${esc(title)}</h2>
          </div>
          ${items.length
            ? `<div class="term-resource-grid">${items.map(resourceCard).join("")}</div>`
            : `<p class="term-resource-empty">${esc(fallback)}</p>`}
        </section>`;
}

function journalResourceCards(items) {
  return `<!-- journal-related-content:start -->
        ${resourceCards("Passende Journal-Artikel", "Journal", items, "Noch keine passende Journal-Verknüpfung gefunden.")}
        <!-- journal-related-content:end -->`;
}

function resourceCard(item) {
  const href = relativeFromTerm(item.onlineUrl || item.url || item.href);
  const kicker = item.type || item.category || item.date || "Verknüpfung";
  const excerpt = item.summary || item.excerpt || item.description || "";
  return `<article class="term-resource-card">
            <p class="section-eyebrow">${esc(Array.isArray(kicker) ? kicker.join(" · ") : kicker)}</p>
            <h3><a href="${esc(href)}">${esc(item.title || item.label || href)}</a></h3>
            ${excerpt ? `<p>${esc(firstSentence(excerpt))}</p>` : ""}
          </article>`;
}

function relatedTermChips(term) {
  const relations = relationshipManifest[term.slug]?.terms || [];
  const related = Array.from(new Set([...(term.relatedTerms || []), ...relations])).filter((slug) => slug !== term.slug);
  return related.length ? related.map(termLink).join("") : "<span class=\"term-chip muted\">Keine Einträge</span>";
}

function indexPage() {
  const groups = new Map();
  for (const term of records) {
    const letter = (term.glossaryOrderKey || term.canonicalLabel).trim()[0].toLocaleUpperCase("de");
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(term);
  }
  const nav = Array.from(groups.keys()).sort(new Intl.Collator("de", { sensitivity: "base" }).compare);
  const categories = categoryOrder.filter((category) => records.some((term) => term.category === category));
  const body = `      <section class="hero compact-hero">
        <p class="hero-kicker">WÖk-Referenzsystem</p>
        <h1>Begriffe der Wirkungsökonomie</h1>
        <p class="hero-subtitle">Alphabetische Begriffsschicht mit Lernseiten, Hoverdefinitionen, Crosslinks, Grundlagenwerk, Journal und Dokumentenbibliothek.</p>
        <p class="notice">Die Begriffseiten ergänzen das bestehende Glossar. Das Glossar bleibt der schnelle Leseschlüssel; die Einzelseiten vertiefen, verknüpfen und verweisen auf passende Quellen.</p>
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
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), pageShell("Begriffe", body, "../"));
}

function parseOfficialSource(value) {
  const [label, url] = String(value || "").split("|");
  return {
    label: label?.trim() || "Quelle",
    url: url?.trim() || "",
  };
}

function officialSourcesBlock(term) {
  const sources = (term.officialSources || [])
    .map(parseOfficialSource)
    .filter((source) => source.url)
    .slice(0, 8);
  if (!sources.length) return "";
  return `<section class="term-link-section" aria-labelledby="official-sources-title">
          <div>
            <p class="section-eyebrow">Externe Quellen</p>
            <h2 id="official-sources-title">Hochwertige externe Quellen</h2>
            <p>Dieser Begriff ist nicht ausschließlich durch die Wirkungsökonomie geprägt. Die folgenden Quellen zeigen den externen Referenzrahmen, an den die WÖk anschließt.</p>
          </div>
          <div class="term-chip-row">${sources.map((source) => `<a href="${esc(source.url)}">${esc(source.label)}</a>`).join("")}</div>
        </section>`;
}

function termPage(term) {
  const references = referenceLinks(term);
  const journals = journalLinks(term);
  const docs = documentLinks(term);
  const supplementalBlocks = [
    resourceCards("Im Grundlagenwerk", "Grundlagen", references, "Keine direkte Kapitelverknüpfung gefunden."),
    journalResourceCards(journals),
    resourceCards("Dokumente und Materialien", "Bibliothek", docs, "Noch kein passendes Dokument in der Bibliothek verknüpft."),
    officialSourcesBlock(term),
  ].filter(Boolean).join("\n");
  const body = `      <article class="article-shell glossary-detail">
        <nav class="breadcrumb"><a href="../">Begriffe</a> / ${esc(term.canonicalLabel)}</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">${esc(humanLabel(term.category || "Begriff"))}</p>
          <h1>${esc(term.canonicalLabel)}</h1>
          <p class="lead">${esc(termLead(term))}</p>
          <div class="term-meta-row" aria-label="Begriffsinformation">
            <span>Version ${esc(term.version || "1.0")}</span>
            <span>${esc(humanLabel(term.status || "Glossareintrag"))}</span>
          </div>
          <div class="term-action-row">${detailLinks(term)}</div>
        </header>
        <section class="term-summary-card" aria-labelledby="term-summary-title">
          <h2 id="term-summary-title">Auf einen Blick</h2>
          <p>${esc(termSummary(term))}</p>
        </section>
        <div class="term-section-grid">
          <section class="term-section-card">
            <p class="section-eyebrow">Definition</p>
            <h2>Was bedeutet der Begriff?</h2>
            ${termDefinitionHtml(term)}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Wirkungsökonomie</p>
            <h2>Warum ist das wichtig?</h2>
            ${termWhyHtml(term)}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Verwendung</p>
            <h2>So wird der Begriff genutzt</h2>
            ${termUsageHtml(term)}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Abgrenzung</p>
            <h2>Nicht verwechseln mit</h2>
            ${listItems(term.doNotConfuseWith)}
          </section>
        </div>
${termExtraBlock(term)}
${termExampleBlock(term)}
${learningBlock(term)}
        <section class="term-link-section" aria-labelledby="related-terms-title">
          <div>
            <p class="section-eyebrow">Verknüpfungen</p>
            <h2 id="related-terms-title">Verwandte Begriffe</h2>
          </div>
          <div class="term-chip-row">${relatedTermChips(term)}</div>
        </section>
${supplementalBlocks}
        <section class="meta-box">
          <h2>Version und Quelle</h2>
          <p>Kategorie: ${esc(humanLabel(term.category || "Begriff"))} · Version: ${esc(term.version || "1.0")}</p>
          <p>Quelle: ${esc(term.sourceDocument || "glossar.html")} · Abschnitt: ${esc(term.sourceSection || "Glossar")}</p>
        </section>
      </article>`;
  const dir = path.join(outDir, term.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), pageShell(term.canonicalLabel, body, "../../", {
    metaTitle: `${term.canonicalLabel} - Begriff der Wirkungsökonomie`,
    metaDescription: firstSentence(termSummary(term)) || `Lernseite zu ${term.canonicalLabel}.`,
  }));
}

function injectGlossaryLinks() {
  if (!glossaryHtml) return;
  const cleaned = glossaryHtml.replace(glossaryActionPattern, "");
  const pattern = /(<div(?:\s+[^>]*)?>\s*<dt(?:\s+id="([^"]+)")?>([\s\S]*?)<\/dt>\s*<dd>)([\s\S]*?)(<\/dd>\s*<\/div>)/g;
  let entryIndex = 0;
  const updated = cleaned.replace(pattern, (full, start, id, labelHtml, dd, end) => {
    const label = decodeEntities(stripTags(labelHtml));
    const parsedEntry = classicEntries[entryIndex++];
    const slug = parsedEntry && normalize(parsedEntry.label) === normalize(label)
      ? parsedEntry.slug
      : recordsBySlug.has(slugFromEntry(id || "", label))
        ? slugFromEntry(id || "", label)
        : labelToSlug.get(normalize(label)) || slugify(label);
    if (!recordsBySlug.has(slug)) return full;
    return `${start}${dd}<p class="glossary-entry-action"><a class="text-link" href="begriffe/${esc(slug)}/">Begriff vertiefen</a></p>${end}`;
  });
  fs.writeFileSync(glossaryFile, updated, "utf8");
}

function updateSitemap() {
  if (!fs.existsSync(sitemapFile)) return;
  let sitemap = fs.readFileSync(sitemapFile, "utf8");
  const additions = records
    .map((term) => `begriffe/${term.slug}/`)
    .filter((url) => !sitemap.includes(`${site}/${url}`))
    .map((url) => `  <url><loc>${site}/${url}</loc><lastmod>2026-05-27</lastmod></url>`)
    .join("\n");
  if (additions) sitemap = sitemap.replace("</urlset>", `${additions}\n</urlset>`);
  fs.writeFileSync(sitemapFile, sitemap, "utf8");
}

indexPage();
for (const term of records) termPage(term);
injectGlossaryLinks();
updateSitemap();

console.log(`Enhanced ${records.length} term pages from ${registryTerms.length} registry terms and ${classicEntries.length} glossary entries.`);
