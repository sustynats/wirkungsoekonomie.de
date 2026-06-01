import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const navigation = JSON.parse(fs.readFileSync("assets/data/navigation.json", "utf8"));
const headerTemplate = fs.readFileSync("templates/header.html", "utf8");
const footerTemplate = fs.readFileSync("templates/footer.html", "utf8");
const outDir = "begriffe";
fs.mkdirSync(outDir, { recursive: true });
const collator = new Intl.Collator("de", { sensitivity: "base" });
const categoryOrder = [
  "Grundbegriff",
  "Bewertungsbegriff",
  "Messbegriff",
  "Steuerungsbegriff",
  "Architekturbegriff",
  "Schutzbegriff",
  "Datenbegriff",
  "Demokratiebegriff",
  "Psychologische und systemische Wirkmechanismen",
  "Psychologische Wirkmechanismen",
  "Systemtheorie, Kybernetik und Konstruktivismus",
  "Systemtheorie, Konstruktivismus und Kybernetik",
  "Management, Wirksamkeit und Organisation",
  "Management, Organisation und Wirksamkeit",
  "Innovation, Evolution und Unternehmertum",
  "Transformation, Innovation und wirtschaftliche Entwicklung",
  "Daoismus, Prozessdenken und Nicht-Erzwingen",
  "Klima, Lebenszyklus und ökologische Wirkung",
  "Design, Geschäftsmodelle und Wertversprechen",
  "Physik, Energie und Wirkungsmetaphern",
  "Vordenker:innen und Bezugslinien",
  "Werte, Normativität und Bewertung",
  "Kapital, Markt und Eigentum",
  "Sprache, Wirklichkeit und Kommunikation",
  "Ethik, Würde und Verantwortung",
  "Wirtschaftssysteme, Kapitalmythen und Verteilungslogiken",
  "Kreislaufwirtschaft, Circular Design und Materialkreisläufe",
  "Gesundheit & Leben",
  "Klima- und Gesundheitsbegriff",
  "Neuropsychologische Wirkmechanismen",
  "Quantenphysik, Quantenmaterialien und Zukunftstechnologien",
  "Energie, Strommarkt und Systemkosten",
  "Glossar-Publizierungsprozess",
  "Praxisbegriff",
];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function textFromHtml(value) {
  return decodeHtmlEntities(String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function firstMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? textFromHtml(match[1]) : "";
}

function loadLegacyDetailTerms() {
  const sourceSlugs = new Set(data.terms.map((term) => term.slug));
  return fs.readdirSync(outDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !sourceSlugs.has(entry.name))
    .map((entry) => {
      const indexFile = path.join(outDir, entry.name, "index.html");
      if (!fs.existsSync(indexFile)) return null;
      const html = fs.readFileSync(indexFile, "utf8");
      const h1 = firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s*[|-]\s*Glossar.*$/i, "");
      const meta = firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i)
        || firstMatch(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["'][^>]*>/i);
      const lead = firstMatch(html, /<p[^>]*class=["'][^"']*\blead\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
      const label = h1 || title || entry.name.replace(/-/g, " ");
      const summary = meta || lead || "Bestehende Glossar-Detailseite aus dem Bestand.";
      return {
        id: entry.name,
        termId: entry.name,
        slug: entry.name,
        canonicalLabel: label,
        label,
        shortDefinition: summary,
        hoverDefinition: summary,
        longDefinition: summary,
        category: "Glossar-Bestand",
        type: "Bestand",
        status: "erhaltene Detailseite",
        version: "Bestand",
        sourceDocument: "Bestehende Glossar-Detailseite",
        sourceSection: "/begriffe/",
        glossaryOrderKey: label,
        relatedTerms: [],
        _legacyDetailOnly: true,
      };
    })
    .filter(Boolean)
    .sort((a, b) => collator.compare(a.glossaryOrderKey, b.glossaryOrderKey));
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
  const metaDescription = options.metaDescription || `Begriffsreferenz der Wirkungsökonomie: ${title}.`;
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(metaTitle)}</title>
    <meta name="description" content="${esc(metaDescription)}">
    <link rel="stylesheet" href="${depth}assets/css/style.css?v=20260531-glossary-filter-chips">
  </head>
  <body>
${renderHeader(depth)}
    <main class="section">
${body}
    </main>
${renderFooter(depth)}
    <script src="${depth}assets/js/main.js?v=20260529-glossary-hover-audit"></script>
  </body>
</html>
`;
}

function glossaryLegacyAlias(depth = "") {
  const target = `${depth}begriffe/`;
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="https://wirkungsoekonomie.de/begriffe/">
    <title>Weiterleitung zum vollständigen Glossar - Wirkungsökonomie</title>
    <script>
      (function () {
        var hash = window.location.hash || "";
        var match = hash.match(/^#begriff-(.+)$/);
        var destination = match ? "${target}" + match[1] + "/" : "${target}";
        window.location.replace(destination);
      })();
    </script>
  </head>
  <body>
    <main aria-labelledby="redirect-title">
      <h1 id="redirect-title">Weiterleitung zum vollständigen Glossar</h1>
      <p>Das vollständige Glossar mit Begriffsdetailseiten, Hoverdefinitionen, Suche und Querverlinkungen liegt unter <a href="${target}">/begriffe/</a>.</p>
      <p>Falls du einem alten Anker gefolgt bist, öffne den passenden Begriff über die Suche im vollständigen Glossar.</p>
    </main>
  </body>
</html>
`;
}

const legacyDetailTerms = loadLegacyDetailTerms();
const indexedTerms = [...data.terms, ...legacyDetailTerms];
const groups = new Map();
for (const term of indexedTerms) {
  const letter = (term.glossaryOrderKey || term.canonicalLabel).trim()[0].toLocaleUpperCase("de");
  if (!groups.has(letter)) groups.set(letter, []);
  groups.get(letter).push(term);
}
for (const items of groups.values()) {
  items.sort((a, b) => collator.compare(a.glossaryOrderKey || a.canonicalLabel, b.glossaryOrderKey || b.canonicalLabel));
}

const nav = Array.from(groups.keys()).sort(collator.compare);
const categories = categoryOrder.filter((category) => indexedTerms.some((term) => term.category === category));
const termsBySlug = new Map(indexedTerms.map((term) => [term.slug, term]));
const termTargetLinks = new Map([
  ["agenda-2030", "../../verstehen/sdgs-sdgplus/geschichte/"],
  ["sdg-sdgplus-referenzrahmen", "../../verstehen/sdgs-sdgplus/"],
  ["sdg-plus", "../../verstehen/sdgs-sdgplus/#sdgplus"],
  ["sdgs", "../../verstehen/sdgs-sdgplus/"],
  ["social-taxonomy", "../../bibliothek/social-taxonomy-wirkungsoekonomie/"],
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
  ["wirkungsschule", "../../wirkungsfelder/bildung/wirkungsschule/"],
  ["wirkungspaedagogik", "../../wirkungsfelder/bildung/wirkungspaedagogik/"],
  ["wirkungskompetenz", "../../wirkungsfelder/bildung/demokratie-medien-wirkungskompetenz/"],
  ["wirkungsorientiertes-hosting", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"],
  ["resonanzarchitektur", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/#16-hosts-als-resonanzarchitekt-innen"],
  ["host-wirkungsscore", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/#23-neun-wirkungsfelder-des-host-wirkungsscores"],
]);

const relatedContentTargets = new Map([
  ["wstg-oktober-2025", ["Wirkungssteuergesetz WStG", "../../dokumente/wstg-oktober-2025/"]],
  ["technische-leitlinien-wustg", ["Technische Leitlinien WUStG", "../../dokumente/technische-leitlinien-wustg-v2/"]],
  ["technische-leitlinien-wustg-v2", ["Technische Leitlinien WUStG", "../../dokumente/technische-leitlinien-wustg-v2/"]],
  ["beispiel-apfel-wirkungssteuer-bonusregel", ["Apfelbeispiel Wirkungssteuer", "../../dokumente/beispiel-apfel-wirkungssteuer-bonusregel/"]],
  ["woek-master-items", ["WÖk Master Items final v1.2", "../../dokumente/woek-master-items-final-v1-2/"]],
  ["woek-master-items-register", ["WÖk Master Items final v1.2", "../../dokumente/woek-master-items-final-v1-2/"]],
  ["von-der-pigou-steuer-zur-wirkungsoekonomie", ["Von der Pigou-Steuer zur Wirkungsökonomie", "../../blog/linkedin/2025-12-22-von-der-pigou-steuer-zur-wirkungsokonomie.html"]],
  ["scorecard", ["Scorecards", "../../werkzeuge/scorecards/"]],
  ["scorecards", ["Scorecards", "../../werkzeuge/scorecards/"]],
  ["reverse-merit-order", ["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"]],
  ["nwi", ["Netto-Wirkungs-Index", "../../werkzeuge/netto-wirkungs-index/"]],
  ["netto-wirkungs-index", ["Netto-Wirkungs-Index", "../../werkzeuge/netto-wirkungs-index/"]],
  ["wirkungssteuer", ["Wirkungssteuer", "../../werkzeuge/wirkungssteuergesetz/"]],
  ["wirkungssteuergesetz", ["Wirkungssteuergesetz", "../../werkzeuge/wirkungssteuergesetz/"]],
  ["wirkungsumsatzsteuer", ["Wirkungsumsatzsteuer", "../../werkzeuge/wirkungsumsatzsteuer/"]],
  ["produktwirkungsrechner", ["Produktwirkungsrechner", "../../erleben/produktwirkungsrechner/"]],
  ["impact-controlling-rechner", ["Impact-Controlling-Rechner", "../../erleben/impact-controlling-rechner/"]],
  ["produkte-konsum", ["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]],
  ["staat-recht-demokratie", ["Staat, Recht & Demokratie", "../../wirkungsfelder/staat-recht-demokratie/"]],
  ["finanzsystem-kapital", ["Finanzsystem & Kapital", "../../wirkungsfelder/finanzsystem-kapital/"]],
  ["woek-id-register", ["WÖk-ID Register", "../../woek-id-register/"]],
  ["wirkungsrueckkopplung", ["Wirkungsrückkopplung", "../../begriffe/wirkungsrueckkopplung/"]],
  ["scorecards-nwi-reverse-merit-order", ["Scorecards, NWI & Reverse Merit Order", "../../akademie.html"]],
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

function filterValues(field) {
  const values = new Set();
  for (const term of indexedTerms) {
    for (const value of asList(term[field])) values.add(value);
  }
  return Array.from(values).sort(new Intl.Collator("de", { sensitivity: "base" }).compare);
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
  const badges = unique([
    term.type || term.begriffstyp || term.conceptStatus || term.concept_status || term.category,
    ...asList(term.theme || term.themes).slice(0, 2),
    ...asList(term.dimensions).slice(0, 1),
  ]).slice(0, 5);
  return `<div class="term-card-tags">${badges.map((badge) => `<span>${esc(badge)}</span>`).join("")}</div>`;
}

function parseSource(value) {
  if (value && typeof value === "object") {
    return {
      label: value.title || value.label || "Quelle",
      url: value.url || value.href || "",
      type: value.source_type || value.sourceType || "",
      status: value.status || "",
    };
  }
  const [label, url] = String(value || "").split("|");
  return {
    label: label?.trim() || "Quelle",
    url: url?.trim() || "",
    type: "",
    status: "",
  };
}

function sourceList(term) {
  const rows = [
    ...((term.sourceLinks || term.source_links || []).map(parseSource)),
    ...((term.officialSources || []).map(parseSource)),
  ].filter((item, index, all) => item.label && all.findIndex((candidate) => `${candidate.label}|${candidate.url}` === `${item.label}|${item.url}`) === index);
  if (!rows.length) return `<p>Keine externe Quelle hinterlegt.</p>`;
  return `<ul class="clean-list">${rows.slice(0, 8).map((item) => {
    const label = item.type ? `${item.label} (${item.type})` : item.label;
    return item.url ? `<li><a class="text-link" href="${esc(item.url)}">${esc(label)}</a></li>` : `<li>${esc(label)}</li>`;
  }).join("")}</ul>`;
}

const centralTermDetails = new Map([
  ["faktencheck", ["Er verhindert, dass falsche Zahlen, manipulierte Quellen oder aus dem Kontext gerissene Aussagen als Grundlage für Entscheidungen dienen.", "Ein Faktencheck erklärt noch nicht, welche gesellschaftlichen Folgen eine richtige oder falsche Aussage auslösen kann.", "Eine Statistik wird auf Quelle, Zeitraum, Methode und Kontext geprüft, bevor sie in einer Debatte verwendet wird.", ["Richtig heißt nicht folgenlos.", "Ein Faktencheck ersetzt keine Wirkungsanalyse."], [["WÖk-Scanner", "../../anwendungen/scanner.html"], ["Medienwirkungscheck", "../../erleben/medienwirkungscheck/"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["folgencheck", ["Er macht Wirkungspotenziale sichtbar, bevor Schäden, Nebenwirkungen oder Systemfolgen vollständig eingetreten sind.", "Ein Folgencheck ist keine Zensur und keine nachträgliche Schadensbilanz.", "Vor einer Kampagne wird geprüft, welche Wirkstoffe, Wirkungspfade und Resonanzräume Polarisierung, Schutzverhalten oder Fehlanreize auslösen können.", ["Folgencheck ist ex ante.", "Er bewertet Wirkungspotenziale, nicht Menschen."], [["WÖk-Scanner", "../../anwendungen/scanner.html"], ["Medienwirkungscheck", "../../erleben/medienwirkungscheck/"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["idgs", ["Sie zeigen, welche Fähigkeiten Menschen und Organisationen brauchen, um Ziele verantwortlicher umzusetzen.", "IDGs sind kein Ersatz für SDGs oder SDG+ und kein dritter Zielkatalog der WÖk.", "Eine Akademie-Einheit kann SDG-Ziele mit Wirkungskompetenz, Reflexion, Zusammenarbeit und Urteilsfähigkeit verbinden.", ["Kompetenzen sind keine Ziele.", "IDGs ersetzen SDG+ nicht."], [["Akademie", "../../akademie.html"], ["Wirkungsschule-Check", "../../erleben/wirkungsschule-check/"]], [["Bildung", "../../wirkungsfelder/bildung/"]]]],
  ["wirkung", ["Sie macht sichtbar, ob sich Zustände tatsächlich verändern, statt nur Aktivität, Geld oder Reichweite zu zählen.", "Nicht jede Wirkung ist positiv. Der Begriff ist neutral und braucht Bewertung.", "Ein billiges Produkt kann verkauft werden und trotzdem Wasser, Gesundheit oder Arbeitsrechte belasten.", ["Wirkung ist kein Gütesiegel.", "Wirkung ersetzt keine demokratische Entscheidung."], [["Kompass", "../../kompass.html"], ["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Wirkungsfelder", "../../wirkungsfelder/"]]]],
  ["wirkungspotenzial", ["Es hilft, frühe Hinweise zu Wirkungspfaden zu erkennen, ohne eine endgültige Bewertung vorzutäuschen.", "Potenzial ist keine Faktenprüfung, keine Zertifizierung und kein fertiger Score.", "Ein Medienbeitrag kann Polarisierungspotenzial haben, ohne dass jede Reaktion vorhergesagt wird.", ["Potenzial ist nicht Ergebnis.", "Ein Prüfhinweis ist kein Urteil."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["positive-netto-wirkung", ["Sie verhindert, dass einzelne gute Effekte schwere Schäden überdecken.", "Positive Netto-Wirkung ist keine Schönrechnung und kein einfacher Durchschnitt.", "Ein klimafreundliches Produkt kann wegen schwerer Arbeitsrechtsprobleme trotzdem kritisch bleiben.", ["Netto heißt nicht, dass alles verrechnet werden darf.", "Wirkungsgrenzen bleiben wirksam."], [["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"], ["Scorecards", "../../werkzeuge/scorecards/"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["wirkungsrueckkopplung", ["Sie macht Wirkung entscheidungsrelevant, indem sie in Preise, Budgets, Kapital oder Regeln zurückgeführt wird.", "Sie ist keine zentrale Planwirtschaft und keine automatische Entscheidung.", "Eine Produktsteuer kann steigen oder sinken, wenn geprüfte Produktwirkung schlechter oder besser wird.", ["Rückkopplung ist nicht nur Strafe.", "Rechtsschutz und demokratische Kontrolle bleiben nötig."], [["Wirkungsumsatzsteuer", "../../werkzeuge/wirkungsumsatzsteuer/"], ["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungsblindheit", ["Sie erklärt, warum schädliche Folgen wirtschaftlich erfolgreich erscheinen können.", "Wirkungsblindheit ist kein Absichtsvorwurf gegen einzelne Personen.", "Ein Algorithmus optimiert Klicks und übersieht Vertrauen, Diskursqualität oder Polarisierung.", ["Blindheit heißt nicht, dass keine Wirkung existiert.", "Sie heißt: Die Wirkung fehlt im Steuerungssystem."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Digitalisierung & KI", "../../portale/digitalisierung-ki-wirkungsdatenraeume/"]]]],
  ["reverse-merit-order", ["Sie schützt vor dem Schönrechnen schwerer Schäden durch gute Werte an anderer Stelle.", "Sie ist kein einfacher Durchschnitt und keine Strafliste.", "Gute Klimawerte heben schwere Kinderrechtsverletzungen in einer Lieferkette nicht auf.", ["Nicht jede Schwäche blockiert alles.", "Entscheidend sind definierte Wirkungsgrenzen."], [["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"], ["Produktwirkung testen", "../../erleben.html#simulator"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["social-taxonomy", ["Sie macht soziale Wirkung in Märkten entscheidungsfähig: Arbeit, Grundversorgung, Teilhabe, Gemeinschaften und Demokratie werden nicht nur berichtet, sondern prüfbar eingeordnet.", "Social Taxonomy ist Stand 27. Mai 2026 kein verbindliches eigenständiges EU-Rechtsinstrument und keine Personenbewertung.", "Ein Wohnprojekt wird nach Energie, Bezahlbarkeit, Verdrängungsrisiko, Gesundheit, Beteiligung und lokaler Wirkung betrachtet.", ["Nicht mit EU-Umwelt-Taxonomie verwechseln.", "Keine Social-Credit-Logik.", "Positive soziale Beiträge ersetzen keine roten Linien."], [["Scorecards", "../../werkzeuge/scorecards/"], ["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"]], [["Finanzsystem & Kapital", "../../wirkungsfelder/finanzsystem-kapital/"], ["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"]]]],
  ["nwi", ["Er verdichtet Wirkungsdimensionen zu Orientierung, ohne Detailprüfung zu ersetzen.", "Der NWI ist kein ESG-Rating und keine amtliche Zertifizierung.", "Ein Projekt kann einen NWI als Übersicht erhalten, während kritische Einzelfelder separat sichtbar bleiben.", ["Ein Index ist keine Wahrheitstabelle.", "Datenqualität bleibt entscheidend."], [["NWI Methodik", "../../werkzeuge/netto-wirkungs-index/"], ["Impact Controlling", "../../werkzeuge/impact-controlling/"]], [["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/"]]]],
  ["t-sroi", ["Er macht vermiedene Schäden, Transformation und Stabilität als Investitionslogik diskutierbar.", "T-SROI ist keine sichere Renditeprognose und keine Anlageberatung.", "Prävention kann Folgekosten vermeiden, obwohl Kosten und Nutzen in verschiedenen Haushalten liegen.", ["Monetarisierung ist Hilfssprache.", "Unsicherheit muss sichtbar bleiben."], [["T-SROI", "../../werkzeuge/impact-controlling/t-sroi/"]], [["Gesundheit & Pflege", "../../wirkungsfelder/gesundheit-pflege/"]]]],
  ["woek-id", ["Sie macht Indikatoren nachvollziehbar, versioniert und prüfbar.", "Eine WÖk-ID ist keine Personen-ID und kein Trackinginstrument.", "Ein Wasserindikator braucht Einheit, Quelle, Zeitraum, Schwelle und Bewertungslogik.", ["Die ID bewertet nicht selbst.", "Sie macht die Datenbasis prüfbar."], [["WÖk-IDs", "../../werkzeuge/woek-ids/"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["scorecard", ["Sie zeigt starke, schwache und kritische Wirkungsfelder nebeneinander.", "Eine Scorecard ist kein Urteil über Menschen und kein endgültiges Gütesiegel.", "Eine Produktscorecard kann Klima, Wasser, Arbeit, Gesundheit und Kreislauf getrennt darstellen.", ["Der Gesamtscore darf Schwachstellen nicht verdecken.", "Scorecards brauchen Interpretation."], [["Scorecards", "../../werkzeuge/scorecards/"], ["Produktwirkung testen", "../../erleben.html#simulator"]], [["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/"]]]],
  ["wirkungseinkommen", ["Es zeigt, wie Einkommen und Teilhabe auch jenseits reiner Erwerbsarbeit gedacht werden können.", "Es ist kein fertiges Grundeinkommen und keine Finanzierungszusage.", "Automatisierte Wertschöpfung kann modellhaft in Fonds, Weiterbildung und Einkommensanteile zurückgeführt werden.", ["Das Tool erzeugt kein Geld.", "Es zeigt Rückkopplungslogik, keine amtlichen Ansprüche."], [["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungsfonds", ["Er bündelt Rückflüsse, damit Prävention, Bildung, Transformation oder Sicherung finanzierbar werden.", "Ein Wirkungsfonds ist kein Geld aus dem Nichts und kein Schattenhaushalt.", "Rückflüsse aus automatisierter Wertschöpfung können Weiterbildung und Übergangsschutz finanzieren.", ["Fonds ersetzen keine Haushaltsentscheidungen.", "Finanzierungsquellen müssen offen bleiben."], [["Wirkungsfonds", "../../werkzeuge/wirkungsfonds/"], ["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungshaushalt", ["Er zeigt, ob öffentliche Mittel Zustände verbessern oder nur ausgegeben werden.", "Ein Wirkungshaushalt ersetzt keine Parlamente und kein Haushaltsrecht.", "Vermiedene Krankheit kann als Präventionswirkung in Haushalten sichtbar werden.", ["Wirkungshaushalte brauchen Evaluation.", "Grundrechte dürfen nicht durch Kennzahlen ersetzt werden."], [["Wirkungshaushalt", "../../werkzeuge/wirkungshaushalt/"]], [["Gesundheit & Pflege", "../../wirkungsfelder/gesundheit-pflege/"]]]],
  ["wirkungsdatenraum", ["Er macht Wirkung prüfbar, ohne Datenschutz und Zweckbindung aufzugeben.", "Ein Wirkungsdatenraum ist kein ungeschützter Datenpool und kein Personen-Scoring.", "Ein Produktpass kann Klima- und Lieferkettendaten bereitstellen, ohne personenbezogene Daten offenzulegen.", ["Mehr Daten sind nicht automatisch bessere Wirkung.", "Rechte und Datenqualität sind Teil der Wirkung."], [["Digitale Produktpässe", "../../werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"]], [["Digitalisierung & KI", "../../portale/digitalisierung-ki-wirkungsdatenraeume/"]]]],
  ["wirkungsschule", ["Sie macht Schule als Wirkungsraum sichtbar: Unterricht, Raum, Beziehung, Bewertung, Förderung, Gesundheit, digitale Kultur und Demokratiepraxis wirken zusammen.", "Wirkungsschule ist keine neue Schulform, kein Ranking und kein Modell zur Bewertung einzelner Kinder, Familien oder Lehrkräfte.", "Ein Schulhof-Hitze-Projekt verbindet Messung, Beteiligung, Gesundheit, Stadtklima, Kostenvergleich und demokratische Entscheidung.", ["Keine Kinder-Scores.", "Daten verbessern Lernbedingungen, nicht Personenrankings."], [["Wirkungsschule-Check", "../../erleben/wirkungsschule-check/"], ["Wirkungsportfolio-Generator", "../../erleben/wirkungsportfolio-generator/"]], [["Bildung", "../../wirkungsfelder/bildung/"], ["Arbeitsbibliothek Bildung", "../../werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/"]]]],
  ["wirkungspaedagogik", ["Sie beschreibt Lernen als gestaltete Zustandsveränderung von Verstehen, Können, Haltung, Beziehung und Handlungsfähigkeit.", "Wirkungspädagogik ist keine Moralisierung, kein Gesinnungsunterricht und keine Projektbeliebigkeit ohne Fachlichkeit.", "Ein Fach-Zukunft-Modul verbindet fachliche Perspektiven mit einer realen Wirkungsfrage und einer reflektierten Handlung.", ["Fachlichkeit bleibt Grundlage.", "Wirkung ersetzt keine pädagogische Freiheit."], [["Fach-Zukunft-Modulgenerator", "../../erleben/fach-zukunft-generator/"], ["Wirkungsportfolio-Generator", "../../erleben/wirkungsportfolio-generator/"]], [["Bildung", "../../wirkungsfelder/bildung/"], ["Wirkungsschule", "../../wirkungsfelder/bildung/wirkungsschule/"]]]],
  ["wirkungskompetenz", ["Sie macht Menschen und Organisationen fähig, Folgen, Zielkonflikte, Nebenwirkungen, Rückkopplungen und Datenqualität zu verstehen.", "Wirkungskompetenz ist keine Ideologie, keine zentrale Wissensverwaltung und kein Personen-Score.", "Schüler:innen lernen im Schulhof-Hitze-Projekt zu unterscheiden, ob ein Projekt nur Output erzeugt oder Zustände für Lernen, Gesundheit und Teilhabe verbessert.", ["Kompetenz heißt nicht Kontrolle.", "Sie stärkt Urteilskraft, Teilhabe und Korrekturfähigkeit."], [["Akademie", "../../akademie.html"], ["Wirkungsschule-Check", "../../erleben/wirkungsschule-check/"]], [["Bildung", "../../wirkungsfelder/bildung/"]]]],
  ["wirkungsorientiertes-hosting", ["Es macht Reichweite, Gästeauswahl, Chat, Plattformpfad, Clip-Kontext und Korrektur als gestaltbaren Wirkungsraum sichtbar.", "Es ist keine Zensur, keine Gesinnungsprüfung und kein Benimmkatalog.", "Ein Host markiert eine Gesundheitsbehauptung als unbelegt, nennt Quellenstatus und ergänzt eine Korrektur nach der Sendung.", ["Bewertet werden Bedingungen, nicht Menschen.", "Korrektur ist Teil der Wirkung."], [["Medienwirkungscheck", "../../erleben/medienwirkungscheck/"], ["Wirkungsräume gestalten", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["resonanzarchitektur", ["Sie zeigt, dass ein Format durch Frage, Gäste, Redezeit, Humor, Chatregeln, Titel, Clips und Nachbereitung Resonanzen formt.", "Resonanzarchitektur ist keine Manipulationsstrategie und keine reine Reichweitenoptimierung.", "Ein Talkformat plant vorab, wann Falschbehauptungen gestoppt, welche Quellen gezeigt und wie Clips kontextualisiert werden.", ["Dramaturgie ist nicht automatisch Wirkung.", "Resonanz braucht Korrekturwege."], [["Wirkungsräume gestalten", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["host-wirkungsscore", ["Er macht Lernpunkte eines Formats sichtbar: Quellenklarheit, Tonalität, Diskursführung, Community, Schutz und Korrektur.", "Der Score ist kein Personenrating, kein Wahrheitsmonopol und keine automatische Sperrlogik.", "Eine Redaktion bewertet nach einem Stream, ob der Clip-Kontext die Gesamtbotschaft verzerrt und ob der Chat geschützt wurde.", ["Scorecards brauchen Interpretation.", "Rote Linien dürfen nicht durch Reichweite kompensiert werden."], [["Scorecards", "../../werkzeuge/scorecards/"], ["Wirkungsräume gestalten", "../../wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["wirkstoff", ["Er hilft, Auslöser wie Gesetze, Preise, Produkte, Narrative oder Algorithmen früh als mögliche Wirkungsauslöser zu untersuchen.", "Wirkstoff ist eine didaktische Analogie und kein medizinischer oder naturwissenschaftlicher Nachweis.", "Ein Rabatt, eine Schlagzeile oder ein Algorithmus kann als gesellschaftlicher Wirkstoff geprüft werden: Was kann er auslösen?", ["Wirkstoff ist nicht Wirkung.", "Ein Auslöser braucht Kontext, Pfad und Raum."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"], ["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["wirkungsraum", ["Er begrenzt die Frage, wo eine Handlung, ein Produkt oder eine Aussage Folgen entfalten kann.", "Ein Wirkungsraum ist keine Zielgruppe und kein Marktsegment.", "Eine Mietregel wirkt im Wohnraum, im kommunalen Haushalt, im Quartier und auf Vertrauen in Institutionen.", ["Räume überlappen.", "Der relevante Wirkungsraum muss begründet werden."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Wohnen & Stadt", "../../wirkungsfelder/wohnen-stadt/"], ["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["wirkungspfad", ["Er macht Annahmen nachvollziehbar: Was löst was unter welchen Bedingungen aus?", "Ein Wirkungspfad ist noch kein Kausalnachweis und kein endgültiges Urteil.", "Eine Produktinformation kann Aufmerksamkeit erzeugen, Kaufentscheidungen verändern und Lieferkettenanreize verschieben.", ["Pfad heißt nicht Beweis.", "Datenqualität und Unsicherheit gehören dazu."], [["WÖk-Scanner", "../../anwendungen/scanner.html"], ["Scorecards", "../../werkzeuge/scorecards/"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
]);

function linkedChips(items, fallback = "Keine Einträge") {
  if (!Array.isArray(items) || items.length === 0) return `<p>${esc(fallback)}</p>`;
  return `<div class="term-chip-row">${items.map(([label, href]) => `<a class="term-chip" href="${esc(href)}">${esc(label)}</a>`).join("")}</div>`;
}

function relationChip(value) {
  const raw = typeof value === "object" && value
    ? {
        key: value.id || value.slug || value.termId || value.label || value.title || value.name || "",
        label: value.label || value.title || value.name || value.id || value.slug || value.termId || "Verwandter Inhalt",
        href: value.href || value.url || "",
      }
    : { key: value, label: value, href: "" };
  const key = String(raw.key || raw.label || "").trim();
  const normalized = filterToken(key);
  const target = relatedContentTargets.get(key) || relatedContentTargets.get(normalized);
  if (target) return `<a class="term-chip" href="${esc(target[1])}">${esc(target[0])}</a>`;
  if (raw.href) return `<a class="term-chip" href="${esc(raw.href)}">${esc(raw.label)}</a>`;
  const term = termsBySlug.get(key) || termsBySlug.get(normalized);
  if (term) return `<a class="term-chip" href="../../begriffe/${esc(term.slug)}/">${esc(term.canonicalLabel)}</a>`;
  return `<span class="term-chip muted">${esc(raw.label || key)}</span>`;
}

function relationGroup(title, values) {
  const chips = [];
  for (const value of asList(values)) {
    const chip = relationChip(value);
    if (!chips.includes(chip)) chips.push(chip);
  }
  if (!chips.length) return "";
  return `<section class="term-section-card">
            <h3>${esc(title)}</h3>
            <div class="term-chip-row">${chips.join("")}</div>
          </section>`;
}

function relatedContentBlock(term) {
  const groups = [
    ["Methoden & Werkzeuge", [...asList(term.relatedMethods), ...asList(term.relatedTools)]],
    ["Demos", term.relatedDemos],
    ["Wirkungsfelder", term.relatedImpactFields],
    ["Dokumente", term.relatedDocuments],
    ["Akademie", term.relatedAcademyModules],
    ["Datenregister", term.relatedDataRegisters],
  ].map(([title, values]) => relationGroup(title, values)).filter(Boolean);
  if (!groups.length) return "";
  return `
        <section class="term-summary-card" aria-labelledby="related-content-title">
          <p class="section-eyebrow">Querverweise</p>
          <h2 id="related-content-title">Verwandte Inhalte</h2>
          <div class="term-section-grid">
            ${groups.join("")}
          </div>
        </section>
`;
}

function learningBlock(term) {
  const detail = centralTermDetails.get(term.slug);
  if (!detail) return "";
  const [why, notMeaning, example, misconceptions, tools, fields] = detail;
  return `<section class="term-summary-card" aria-labelledby="learning-${esc(term.slug)}">
          <h2 id="learning-${esc(term.slug)}">Lernpfad zu ${esc(term.canonicalLabel)}</h2>
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

function termExtraBlock(term) {
  if (term.termId !== "mensch-planet-demokratie") return "";
  return `<section class="term-summary-card" aria-labelledby="sdg-context-title">
          <h2 id="sdg-context-title">Warum nicht einfach nur SDGs sagen?</h2>
          <p>Die SDGs und die Agenda 2030 sind der globale Referenzrahmen. Sie sind fachlich wichtig und politisch anschlussfähig. In der öffentlichen Kommunikation sind sie jedoch oft zu abstrakt. Viele Menschen kennen weder die Agenda 2030 noch die Bedeutung der einzelnen SDGs.</p>
          <p>Die Wirkungsökonomie nutzt deshalb den Dreiklang Mensch, Planet und Demokratie. Er macht verständlich, was die Zielstruktur bedeutet: gutes Leben und Teilhabe für Menschen, Schutz und Regeneration des Planeten sowie starke demokratische Institutionen, Medienqualität, Rechtsstaatlichkeit und gesellschaftlichen Zusammenhalt.</p>
          <p>SDG+ ist keine UN-Kategorie. SDG+ ist eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
          <p>Mensch, Planet und Demokratie ist damit die kommunikative Übersetzung von SDGs, Agenda 2030 und SDG+.</p>
          <div class="table-wrap" role="region" aria-label="Verhältnis von Referenzrahmen, Übersetzung und Zielgröße" tabindex="0">
            <table>
              <thead>
                <tr>
                  <th>Ebene</th>
                  <th>Bezeichnung</th>
                  <th>Bedeutung</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fachlicher Referenzrahmen</td>
                  <td><a class="text-link" href="../../begriffe/sdgs/">SDGs</a>, <a class="text-link" href="../../begriffe/agenda-2030/">Agenda 2030</a> und <a class="text-link" href="../../begriffe/sdg-plus/">SDG+</a></td>
                  <td>Globale Nachhaltigkeitsziele plus transparente WÖk-Erweiterung für demokratische Voraussetzungen nachhaltiger Entwicklung.</td>
                </tr>
                <tr>
                  <td>Kommunikative Übersetzung</td>
                  <td>Mensch, Planet und Demokratie</td>
                  <td>Drei verständliche Oberbegriffe für soziale, ökologische und demokratische Wirkung.</td>
                </tr>
                <tr>
                  <td>Zielgröße der Wirkungsökonomie</td>
                  <td><a class="text-link" href="../../begriffe/positive-netto-wirkung/">Positive Netto-Wirkung</a> für Mensch, Planet und Demokratie</td>
                  <td>Handlungen, Produkte, Institutionen, Kapitalflüsse und Entscheidungen werden daran ausgerichtet, diese drei Dimensionen zu stärken.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>`;
}

function termLead(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return "Mensch, Planet und Demokratie sind die verständliche Zusammenfassung der SDGs, der Agenda 2030 und der SDG+-Erweiterung der Wirkungsökonomie. Der Dreiklang übersetzt den fachlichen Referenzrahmen in eine Sprache, die öffentlich anschlussfähig ist.";
  }
  return term.shortDefinition;
}

function termSummary(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return "Mensch, Planet und Demokratie sind die drei Oberbegriffe, unter denen die Wirkungsökonomie die SDGs, die Agenda 2030 und SDG+ zusammenfasst. Fachlich bleibt der Referenzrahmen SDGs, Agenda 2030 und SDG+. Kommunikativ wird daraus: Wirkung für Mensch, Planet und Demokratie.";
  }
  return term.hoverDefinition;
}

function termDefinitionHtml(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return `<p>Der Begriff bezeichnet die drei übergeordneten Wirkungsdimensionen der Wirkungsökonomie. Mensch steht für soziale Gerechtigkeit, Gesundheit, Bildung, Teilhabe, Würde und Sicherheit. Planet steht für Klima, Ressourcen, Wasser, Boden, Biodiversität, Energie und Regeneration. Demokratie steht für Rechtsstaatlichkeit, Medienqualität, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
            <p>Damit sind Mensch, Planet und Demokratie keine zusätzlichen UN-Ziele. Sie sind die kommunikative Ordnung, mit der die Wirkungsökonomie die SDGs, die Agenda 2030 und SDG+ verständlich zusammenführt.</p>`;
  }
  return `<p>${esc(term.longDefinition)}</p>`;
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
  return `<p>${esc(term.usageNote)}</p>`;
}

function mythBlock(term) {
  const mythos = term.mythos || "";
  const klaerung = term.woekKlaerung || term.woek_klaerung || "";
  const blind = term.blindSpot || term.blind_spot || "";
  if (!mythos && !klaerung && !blind) return "";
  return `<section class="term-summary-card term-myth-card" aria-labelledby="term-myth-title">
          <p class="section-eyebrow">Mythos und Klärung</p>
          <h2 id="term-myth-title">Wirkungsökonomische Einordnung</h2>
          <div class="term-section-grid">
            ${mythos ? `<section class="term-section-card"><h3>Mythos</h3><p>${esc(mythos)}</p></section>` : ""}
            ${klaerung ? `<section class="term-section-card"><h3>WÖk-Klärung</h3><p>${esc(klaerung)}</p></section>` : ""}
            ${blind ? `<section class="term-section-card"><h3>Blinder Fleck</h3><p>${esc(blind)}</p></section>` : ""}
          </div>
        </section>`;
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

const quickFilters = [
  ["Wirkung verstehen", { theme: "wirkung-und-wirkungslogik" }],
  ["Gesundheit & Leben", { theme: "gesundheit-und-leben" }],
  ["Wirtschaftssysteme vergleichen", { theme: "wirtschaftssysteme-und-gesellschaftsmodelle" }],
  ["Medienwirkung & Folgencheck", { theme: "demokratie-medien-und-oeffentlichkeit" }],
  ["Klima & Produktwirkung", { theme: "klima-energie-und-lebenszyklus" }],
  ["Management & Innovation", { theme: "management-organisation-und-wirksamkeit" }],
  ["Psychologische Wirkmechanismen", { theme: "psychologie-und-resonanz" }],
  ["Philosophie & Werte", { theme: "philosophie-ethik-und-werte" }],
];

const indexBody = `      <section class="hero compact-hero">
        <p class="hero-kicker">WÖk-Referenzsystem</p>
        <h1>Begriffe der Wirkungsökonomie</h1>
        <p class="hero-subtitle">Alphabetisch, thematisch und wirkungslogisch erschließbar: Suche nach Begriffen, Aliassen, Themenwelten, WÖk-Dimensionen, Anwendungsfeldern und Quellenfeldern.</p>
        <p class="notice">Die Filter sind kombinierbar und über URL-Parameter verlinkbar, zum Beispiel <code>?theme=wirtschaftssysteme-und-gesellschaftsmodelle</code>, <code>?type=methodenbegriff</code> oder <code>?q=kapital</code>.</p>
      </section>
      <section class="content-band glossary-filter-panel" aria-labelledby="glossary-filter-title">
        <div class="section-header compact">
          <p class="hero-kicker">Filter</p>
          <h2 id="glossary-filter-title">Glossar gezielt erschließen</h2>
          <p>Mehrfachfilter eingrenzen die Ergebnisliste; innerhalb der Treffer bleibt die alphabetische Ordnung erhalten.</p>
        </div>
        <label class="glossary-search-field">
          <span>Freitextsuche</span>
          <input type="search" placeholder="Begriff, Alias, Synonym oder Definition suchen" data-glossary-search aria-label="Glossar durchsuchen">
        </label>
        <div class="glossary-quick-filters" aria-label="Schnellfilter">
          ${quickFilters.map(([label, params]) => `<button type="button" data-quick-filter="${esc(new URLSearchParams(params).toString())}">${esc(label)}</button>`).join("")}
        </div>
        <div class="glossary-filter-grid">
          ${filterButtons("type", "Begriffstyp", filterValues("type").concat(filterValues("begriffstyp"), filterValues("conceptStatus")).filter(Boolean).filter((value, index, all) => all.indexOf(value) === index))}
          ${filterButtons("theme", "Themenwelt", filterValues("theme"))}
          ${filterButtons("dimension", "WÖk-Dimension", filterValues("dimensions"))}
          ${filterButtons("wirklogik", "Wirklogik", filterValues("wirklogik"))}
          ${filterButtons("field", "Anwendungsfeld", filterValues("applicationFields"))}
          ${filterButtons("source", "Quellenfeld", filterValues("sourceField"))}
        </div>
        <div class="glossary-filter-actions">
          <button type="button" class="btn btn-secondary" data-glossary-reset>Filter zurücksetzen</button>
          <p class="reference-filter-status" data-glossary-filter-status role="status" aria-live="polite"></p>
        </div>
      </section>
      <nav class="az-nav" aria-label="Alphabetische Navigation">
        ${nav.map((letter) => `<a href="#${esc(letter)}">${esc(letter)}</a>`).join(" ")}
      </nav>
      ${nav.map((letter) => {
        const items = groups.get(letter);
        return `<section id="${esc(letter)}" class="content-band">
        <h2>${esc(letter)}</h2>
        <div class="card-grid">${items.map((term) => {
          const filterData = termFilterData(term);
          return `<article class="info-card glossary-result-card" data-glossary-card data-category="${esc(term.category || "")}" data-type="${esc(filterData.type)}" data-theme="${dataAttrList(filterData.theme)}" data-dimension="${dataAttrList(filterData.dimension)}" data-wirklogik="${dataAttrList(filterData.wirklogik)}" data-field="${dataAttrList(filterData.field)}" data-source="${dataAttrList(filterData.source)}" data-search="${esc([term.canonicalLabel, term.shortDefinition, term.hoverDefinition, term.longDefinition, term.woekRelation, ...(term.synonyms || [])].join(" ").toLowerCase())}">
          <h3><a href="${esc(term.slug)}/">${esc(term.canonicalLabel)}</a></h3>
          <p>${esc(term.shortDefinition)}</p>
          ${termBadges(term)}
          <p class="meta-line">${esc(term.category || "Begriff")} · ${esc(term.type || term.begriffstyp || term.status)} · Version ${esc(term.version)}</p>
        </article>`;
        }).join("")}</div>
      </section>`;
      }).join("\n")}
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
            const url = next.toString() ? window.location.pathname + "?" + next.toString() : window.location.pathname;
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
            document.querySelectorAll(".content-band[id]").forEach((section) => {
              if (!section.querySelector("[data-glossary-card]")) return;
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

fs.writeFileSync(path.join(outDir, "index.html"), pageShell("Begriffe", indexBody, "../"));
fs.writeFileSync("glossar.html", glossaryLegacyAlias(""));
fs.mkdirSync("glossar", { recursive: true });
fs.writeFileSync(path.join("glossar", "index.html"), glossaryLegacyAlias("../"));

for (const term of data.terms) {
  const dir = path.join(outDir, term.slug);
  fs.mkdirSync(dir, { recursive: true });
  const metaItems = [
    `Version ${esc(term.version)}`,
    term.conceptStatus || term.concept_status,
    term.publicationStatus || term.publication_status,
  ].filter(Boolean).map((item) => `<span>${esc(item)}</span>`).join("");
  const statusParagraph = term.conceptStatus || term.concept_status || term.publicationStatus || term.publication_status
    ? `          <p>Begriffstatus: ${esc(term.conceptStatus || term.concept_status || "nicht klassifiziert")} · Publikationsstatus: ${esc(term.publicationStatus || term.publication_status || "published")}</p>
`
    : "";
  const body = `      <article class="article-shell glossary-detail">
        <nav class="breadcrumb"><a href="../">Begriffe</a> / ${esc(term.canonicalLabel)}</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">${esc(term.category || "Begriff")}</p>
          <h1>${esc(term.canonicalLabel)}</h1>
          <p class="lead">${esc(termLead(term))}</p>
          <div class="term-meta-row" aria-label="Begriffsinformation">
            ${metaItems}
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
${mythBlock(term)}
${learningBlock(term)}
        <section class="term-link-section" aria-labelledby="related-terms-title">
          <div>
            <p class="section-eyebrow">Verknüpfungen</p>
            <h2 id="related-terms-title">Verwandte Begriffe</h2>
          </div>
          <div class="term-chip-row">
            ${(term.relatedTerms || []).length ? term.relatedTerms.map(termLink).join("") : "<span class=\"term-chip muted\">Keine Einträge</span>"}
          </div>
        </section>${relatedContentBlock(term)}
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
          <h2>Version und Quellen</h2>
          <p>Kategorie: ${esc(term.category || "Begriff")} · Version: ${esc(term.version)}</p>
${statusParagraph}          <p>Quelle: ${esc(term.sourceDocument)} · Abschnitt: ${esc(term.sourceSection)}</p>
          ${sourceList(term)}
        </section>
      </article>`;
  const pageOptions = term.termId === "mensch-planet-demokratie"
    ? {
        metaTitle: "Mensch, Planet und Demokratie - verständliche Übersetzung von SDGs und SDG+",
        metaDescription: "Mensch, Planet und Demokratie sind die drei Oberbegriffe, mit denen die Wirkungsökonomie SDGs, Agenda 2030 und SDG+ öffentlich verständlich zusammenfasst.",
      }
    : {};
  if (term.metaTitle) pageOptions.metaTitle = term.metaTitle;
  if (term.metaDescription) pageOptions.metaDescription = term.metaDescription;
  fs.writeFileSync(path.join(dir, "index.html"), pageShell(term.canonicalLabel, body, "../../", pageOptions));
}

console.log(`Wrote glossary index with ${indexedTerms.length} entries, regenerated ${data.terms.length} source-backed term pages and preserved ${legacyDetailTerms.length} legacy detail pages.`);
