import fs from "node:fs";

const registryPath = "assets/data/term-registry.json";
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const date = "2026-07-30";

const sources = [
  "Holling (1973), Resilience and Stability of Ecological Systems|https://doi.org/10.1146/annurev.es.04.110173.000245",
  "Carpenter et al. (2001), Resilience of What to What?|https://doi.org/10.1007/s10021-001-0045-9",
  "Walker et al. (2004), Resilience, Adaptability and Transformability|https://www.ecologyandsociety.org/vol9/iss2/art5/",
  "Folke (2006), Resilience: The Emergence of a Perspective|https://doi.org/10.1016/j.gloenvcha.2006.04.002",
  "IPCC (2022), AR6 WGII Annex II: Glossary – Resilience|https://doi.org/10.1017/9781009325844.029",
];

const sourceLinks = sources.map((entry) => {
  const [title, url] = entry.split("|");
  return { title, label: title, url, sourceType: "Primärquelle", status: "Referenz" };
});

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sections(kind) {
  const systemQuestion = "Jede Anwendung beantwortet vier Fragen: Resilienz wovon, gegenüber welcher Störung, für wen und zur Erhaltung welcher Funktionen? Ohne Systemgrenze, Störung, Betroffene und Funktionen bleibt der Begriff zu unbestimmt.";
  const walker = "Latitude, Resistance, Precariousness und Panarchy sind vier diagnostische Aspekte einer Stabilitätslandschaft, keine additive Rechenformel: Spielraum im tragfähigen Bereich, Widerstand gegen Veränderung, Abstand zu einer Schwelle und die Einbettung in andere Systemebenen.";
  const mechanisms = "Tragfähigkeit entsteht nicht durch starres Festhalten, sondern durch stabilisierende, korrektive und regenerative Rückkopplungen: Puffer und Dämpfung, Fehlerkorrektur, Wiederherstellung, Regeneration, Lernen und bei Bedarf Transformation zurück in einen tragfähigen Funktionsbereich.";
  const boundary = "Robustheit hält eine gegebene Form aus. Stabilität beschreibt einen Zustand. Anpassung verändert Verhalten innerhalb eines Funktionsbereichs. Transformation verändert untragbar gewordene Strukturen. Resilienz kann diese Fähigkeiten verbinden, ist aber zunächst wertneutral.";
  const undesirable = "Nicht jede Resilienz ist erwünscht: Ein autoritärer oder faschistischer Machtapparat kann regimeresilient sein und zugleich Menschenwürde, Wahrheit, Rechtsstaatlichkeit und demokratische Korrekturfähigkeit zerstören. Unerwünschte Attraktoren und Regimeresilienz sind keine Nachhaltigkeit.";
  const common = [
    { title: "Systemfrage", body: systemQuestion },
    { title: "Diagnostik: Walker-Dimensionen", body: walker },
    { title: "Rückstell- und Regenerationsmechanismen", body: mechanisms },
    { title: "Abgrenzung", body: boundary },
    { title: "Unerwünschte Attraktoren", body: undesirable },
    { title: "Primärquellen", items: sources.map((entry) => entry.split("|")[0]) },
    { title: "Querverweise", items: ["nachhaltigkeit", "resilienz", "systemresilienz", "wirkungsresilienz", "wirkungsrueckkopplung", "positive-netto-wirkung", "sdgs", "sdg-plus", "supply-chain-resilienz", "globale-resilienz"] },
  ];
  if (kind === "nachhaltigkeit") return [
    { title: "Kanonische Kurzdefinition", body: "Nachhaltigkeit ist die langfristige Wirkungsresilienz des gekoppelten Systems Mensch–Planet–Demokratie." },
    { title: "Führende Definition", body: "Nachhaltigkeit bezeichnet die Fähigkeit des gekoppelten Systems Mensch–Planet–Demokratie, Störungen innerhalb tragfähiger Grenzen aufzunehmen, seine lebensnotwendigen und demokratischen Grundfunktionen durch stabilisierende, korrektive und regenerative Rückkopplungen zu erhalten oder wiederherzustellen, ausreichenden Abstand zu kritischen Schwellen zu bewahren, Einflüsse anderer Systemebenen zu verarbeiten, aus Belastungen zu lernen und sich dort zu transformieren, wo bestehende Strukturen keine zukunftsfähige positive Netto-Wirkung mehr ermöglichen – ohne Schäden auf andere Menschen, Regionen, Ökosysteme oder kommende Generationen zu verlagern." },
    { title: "Einordnung", body: "Nachhaltigkeit ist weder ein Bericht noch ein Abfallprodukt und auch nicht bloß ein Zielzustand. Ein Nachhaltigkeits-, ESG- oder Auditbericht kann ein nachgelagerter Nachweis guter Wirkungs-, Risiko- und Rückkopplungssteuerung sein. Die Zielgröße der Bewertung bleibt positive Netto-Wirkung im Referenzrahmen SDGs, Agenda 2030 und SDG+." },
    ...common,
  ];
  if (kind === "resilienz") return [
    { title: "Kurzdefinition / Hover", body: "Resilienz bezeichnet die Fähigkeit eines klar abgegrenzten Systems, Störungen aufzunehmen, sich zu reorganisieren und wesentliche Funktionen, Identität und Rückkopplungen zu erhalten oder wiederherzustellen." },
    { title: "Einordnung", body: "Resilienz ist zunächst beschreibend und wertneutral. Ob sie erwünscht ist, hängt vom betrachteten System, den Betroffenen und den erhaltenen Funktionen ab." },
    ...common,
  ];
  if (kind === "systemresilienz") return [
    { title: "Kurzdefinition / Hover", body: "Systemresilienz bezeichnet die Fähigkeit eines gekoppelten Systems, Belastungen innerhalb tragfähiger Grenzen aufzunehmen, zentrale Funktionen durch stabilisierende, korrektive und regenerative Rückkopplungen zu erhalten oder wiederherzustellen, Abstand zu kritischen Schwellen zu bewahren, Einflüsse anderer Ebenen zu verarbeiten und lernfähig zu bleiben." },
    { title: "Systemarchitektur und Systemresilienz", body: "Systemarchitektur beschreibt Regeln, Daten, Institutionen, Rückkopplungen und Strukturen. Systemresilienz beschreibt das dynamische Verhalten dieser Architektur unter Belastung. Nachhaltigkeit bezeichnet ihre langfristige tragfähige Fähigkeit im MPD-Referenzrahmen." },
    ...common,
  ];
  return [
    { title: "Hauptdefinition", body: "Wirkungsresilienz bezeichnet in der Wirkungsökonomie die lernfähige und normativ gebundene Resilienz des gekoppelten Systems Mensch–Planet–Demokratie. Sie umfasst die Fähigkeit, negative Wirkungen und Störungen früh zu erkennen, Funktionen zu schützen oder wiederherzustellen, Puffer und Regeneration aufzubauen, aus Rückkopplungen zu lernen, sich anzupassen und bei untragbaren Strukturen zu transformieren – ohne Schäden räumlich, sozial oder zeitlich zu externalisieren." },
    { title: "Wirkungsökonomische Einordnung", body: "Wirkungsresilienz präzisiert Systemresilienz normativ. Sie sichert weder ein Geschäftsmodell noch einen Machtapparat um seiner selbst willen, sondern prüft positive Netto-Wirkung für Mensch, Planet und Demokratie entlang der SDGs, Agenda 2030 und SDG+. Nichtkompensation und Reverse Merit Order begrenzen eine Verrechnung schwerer Schäden." },
    ...common,
  ];
}

const updates = {
  nachhaltigkeit: {
    version: "1.1",
    shortDefinition: "Nachhaltigkeit ist die langfristige Wirkungsresilienz des gekoppelten Systems Mensch–Planet–Demokratie.",
    definition: "Nachhaltigkeit bezeichnet die Fähigkeit des gekoppelten Systems Mensch–Planet–Demokratie, Störungen innerhalb tragfähiger Grenzen aufzunehmen, lebensnotwendige und demokratische Grundfunktionen durch stabilisierende, korrektive und regenerative Rückkopplungen zu erhalten oder wiederherzustellen, kritische Schwellen nicht zu überschreiten, zu lernen und Schäden nicht zu externalisieren.",
    woekRelation: "Nachhaltigkeit ist kein Zusatzlabel, kein Bericht und kein Abfallprodukt. Sie ist die langfristige Wirkungsresilienz im MPD-Referenzrahmen; positive Netto-Wirkung wird an SDGs, Agenda 2030 und SDG+ bewertet.",
    preferredUsage: "Nachhaltigkeit als langfristige Wirkungsresilienz des gekoppelten Systems Mensch–Planet–Demokratie beschreiben.",
    deprecatedUsage: ["Nachhaltigkeit als bloßes Abfallprodukt", "Nachhaltigkeit als bloßen Zielzustand", "Nachhaltigkeit als reine Berichtspflicht"],
    doNotConfuseWith: ["ESG- oder Nachhaltigkeitsbericht", "bloßem Unternehmensrisikomanagement", "Regimeresilienz", "grünem Image"],
  },
  resilienz: {
    version: "1.1",
    shortDefinition: "Resilienz bezeichnet die Fähigkeit eines klar abgegrenzten Systems, Störungen aufzunehmen, sich zu reorganisieren und wesentliche Funktionen, Identität und Rückkopplungen zu erhalten oder wiederherzustellen.",
    definition: "Resilienz ist zunächst beschreibend und wertneutral. Sie bezeichnet die Fähigkeit eines klar abgegrenzten Systems, Störungen zu verarbeiten, wesentliche Funktionen zu erhalten oder wiederherzustellen und – je nach Begriffsweite – Anpassungs-, Lern- und Transformationsfähigkeit zu bewahren.",
    woekRelation: "Die WÖk präzisiert Resilienz über Wirkungsresilienz: Systemgrenze, Störung, Betroffene, Funktionen und normative Richtung werden ausdrücklich benannt.",
    doNotConfuseWith: ["Robustheit", "Stabilität", "Anpassung", "Transformation", "Regimeresilienz"],
  },
  systemresilienz: {
    version: "1.1",
    shortDefinition: "Systemresilienz bezeichnet die Fähigkeit eines gekoppelten Systems, Belastungen innerhalb tragfähiger Grenzen aufzunehmen, zentrale Funktionen durch stabilisierende, korrektive und regenerative Rückkopplungen zu erhalten oder wiederherzustellen, Abstand zu kritischen Schwellen zu bewahren, Einflüsse anderer Ebenen zu verarbeiten und lernfähig zu bleiben.",
    definition: "Systemresilienz beschreibt das dynamische Verhalten eines gekoppelten Systems unter Belastung. Sie macht immer explizit: Resilienz wovon, gegenüber welcher Störung, für wen und zur Erhaltung welcher Funktionen? Sie ist nicht mit Systemarchitektur gleichzusetzen und nicht automatisch normativ erwünscht.",
    woekRelation: "Systemarchitektur beschreibt Regeln, Daten, Institutionen, Rückkopplungen und Strukturen; Systemresilienz ihr Verhalten unter Belastung. Nachhaltigkeit ist die langfristige Wirkungsresilienz des gekoppelten Systems Mensch–Planet–Demokratie.",
    doNotConfuseWith: ["Systemarchitektur", "bloßem Unternehmensrisikomanagement", "Regimeresilienz", "Nachhaltigkeitsmarketing"],
  },
  wirkungsresilienz: {
    version: "1.2",
    shortDefinition: "Wirkungsresilienz bezeichnet in der Wirkungsökonomie die lernfähige und normativ gebundene Resilienz des gekoppelten Systems Mensch–Planet–Demokratie.",
    definition: "Wirkungsresilienz bezeichnet in der Wirkungsökonomie die lernfähige und normativ gebundene Resilienz des gekoppelten Systems Mensch–Planet–Demokratie. Sie umfasst Rückstellung und Wiederherstellung, Regeneration, Korrektur, Lernen, Anpassung, Transformation und Nicht-Externalisierung.",
    woekRelation: "Wirkungsresilienz bindet Systemresilienz an Mensch, Planet und Demokratie. Sie prüft positive Netto-Wirkung im Referenzrahmen SDGs, Agenda 2030 und SDG+ und erlaubt keine Kompensation schwerer Schäden.",
    doNotConfuseWith: ["Robustheit", "Business Continuity ohne Systemgrenze", "Krisenkommunikation", "Regimeresilienz", "Stabilisierung negativer Geschäftsmodelle"],
  },
};

for (const [slug, update] of Object.entries(updates)) {
  const term = registry.terms.find((entry) => entry.slug === slug);
  if (!term) throw new Error(`Glossarbegriff nicht gefunden: ${slug}`);
  Object.assign(term, update, {
    short_definition: update.shortDefinition,
    long_definition: update.definition,
    woek_einordnung: update.woekRelation,
    longDefinition: update.definition,
    hoverDefinition: update.shortDefinition,
    source: "WOeK_Begriffsleitfaden_fuehrend_v1.1.md",
    sourceDocument: "WOeK_Begriffsleitfaden_fuehrend_v1.1.md",
    sourceSection: "Nachhaltigkeit, Resilienz, Systemresilienz und Wirkungsresilienz",
    officialSources: unique([...(term.officialSources || []), ...sources]),
    sourceLinks: unique([...(term.sourceLinks || []), ...sourceLinks].map((entry) => JSON.stringify(entry))).map((entry) => JSON.parse(entry)),
    relatedTerms: unique([...(term.relatedTerms || []), "nachhaltigkeit", "resilienz", "systemresilienz", "wirkungsresilienz", "wirkungsrueckkopplung", "positive-netto-wirkung", "sdgs", "sdg-plus", "supply-chain-resilienz", "globale-resilienz"]),
    related_terms: unique([...(term.related_terms || []), "nachhaltigkeit", "resilienz", "systemresilienz", "wirkungsresilienz", "wirkungsrueckkopplung", "positive-netto-wirkung", "sdgs", "sdg-plus", "supply-chain-resilienz", "globale-resilienz"]),
    deepGlossarySections: sections(slug),
    reviewStatus: "approved",
    lastUpdated: date,
    updatedAt: date,
    lastReviewed: date,
    last_reviewed: date,
    updated_by: "Nachhaltigkeit-/Wirkungsresilienz-Konsistenzkorrektur 2026.3",
  });
}

for (const slug of ["supply-chain-resilienz", "globale-resilienz"]) {
  const term = registry.terms.find((entry) => entry.slug === slug);
  if (!term) throw new Error(`Glossarbegriff nicht gefunden: ${slug}`);
  const supply = slug === "supply-chain-resilienz";
  const addition = supply
    ? "Als Teilsystembegriff umfasst sie Puffer, Wiederherstellung, Lernen und Anpassung; sie trägt nur dann zur Nachhaltigkeit bei, wenn sie keine Schäden auf Menschen, Regionen, Ökosysteme oder kommende Generationen externalisiert."
    : "Die Definition wird als Teil der langfristigen Wirkungsresilienz von Mensch, Planet und Demokratie gelesen; Systemgrenze, Störung, Betroffene und Funktionen bleiben explizit.";
  term.definition = `${term.definition} ${addition}`.replace(/\s+/g, " ");
  term.short_definition = term.shortDefinition;
  term.long_definition = term.definition;
  term.woek_einordnung = term.woekRelation;
  term.longDefinition = term.definition;
  term.woekRelation = `${term.woekRelation || ""} ${addition}`.trim();
  term.version = supply ? "1.2" : "1.2";
  term.officialSources = unique([...(term.officialSources || []), ...sources]);
  term.sourceLinks = unique([...(term.sourceLinks || []), ...sourceLinks].map((entry) => JSON.stringify(entry))).map((entry) => JSON.parse(entry));
  term.relatedTerms = unique([...(term.relatedTerms || []), "nachhaltigkeit", "resilienz", "systemresilienz", "wirkungsresilienz"]);
  term.related_terms = unique([...(term.related_terms || []), "nachhaltigkeit", "resilienz", "systemresilienz", "wirkungsresilienz"]);
  term.lastUpdated = date;
  term.updatedAt = date;
  term.lastReviewed = date;
  term.last_reviewed = date;
  term.reviewStatus = "approved";
}

registry.generatedAt = `${date}T00:00:00.000Z`;
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Aktualisiert: ${Object.keys(updates).join(", ")}, supply-chain-resilienz, globale-resilienz`);
