import fs from "node:fs";
import path from "node:path";
import { readYamlList } from "../lib/simple-yaml.mjs";

const root = process.cwd();
const source = path.join(root, "src/data/glossary.terms.yml");
const out = path.join(root, "public/data/glossary.terms.json");
const modelOut = path.join(root, "assets/data/glossary-model.json");
const historyOut = path.join(root, "public/data/glossary-version-history.json");
const hoverOut = path.join(root, "assets/js/glossaryTerms.js");

const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });
const terms = readYamlList(source, "terms").sort((a, b) =>
  collator.compare(a.glossaryOrderKey || a.canonicalLabel, b.glossaryOrderKey || b.canonicalLabel)
);

function categoryFor(term) {
  const section = String(term.sourceSection || "").toLowerCase();
  const id = String(term.termId || "").toLowerCase();
  if (section.includes("governance") || ["wirkungsrat", "wirkungswahrheit", "social-credit"].includes(id)) return "Schutzbegriff";
  if (section.includes("daten") || ["woek-id", "digitaler-produktpass", "wirkungsdaten", "wirkungsdatenraum", "nace", "esrs", "gri", "csrd", "european-green-deal"].includes(id)) return "Datenbegriff";
  if (section.includes("instrument") || ["nwi", "t-sroi", "finalscore", "scorecard", "benchmark", "host-wirkungsscore"].includes(id)) return "Messbegriff";
  if (["wirkungssteuer", "wirkungssteuergesetz", "wirkungsumsatzsteuer", "wirkungslenkung", "wirkungshaushalt"].includes(id)) return "Steuerungsbegriff";
  if (["wirkungsarchitektur", "wirkungsnetz", "wirkungsraum", "resonanzraum", "resonanzarchitektur", "social-taxonomy"].includes(id)) return "Architekturbegriff";
  if (["sdg-plus", "mensch-planet-demokratie", "demokratie"].includes(id)) return "Demokratiebegriff";
  if (["positive-netto-wirkung", "netto-wirkung", "positive-wirkung", "negative-wirkung", "neutrale-wirkung", "reverse-merit-order", "nichtkompensationsprinzip", "wirkungsgrenze"].includes(id)) return "Bewertungsbegriff";
  if (["wirkungseinkommen", "wirkungsrente", "wirkungspunkte", "wirkungsorientiertes-hosting"].includes(id)) return "Praxisbegriff";
  return "Grundbegriff";
}

const associationOverrides = {
  wirkung: {
    relatedMethods: [["WÖk-Kompass", "/kompass.html"], ["WÖk-Scanner", "/anwendungen/scanner.html"]],
    relatedImpactFields: [["Wirkungsfelder", "/wirkungsfelder/"]],
    relatedDemos: [["Produktwirkungsrechner", "/erleben/produktwirkungsrechner/"]],
    relatedDocuments: [["Grundlagenwerk", "/buch.html"], ["Systemmodell", "/dokumente/systemmodell-der-wirkungsoekonomie/"]],
    relatedObjections: [["Kann man Wirkung überhaupt messen?", "/einwaende/#messbarkeit"]],
  },
  wirkungspotenzial: {
    relatedMethods: [["Faktencheck & Folgencheck", "/werkstatt/arbeitsbibliothek/whitepaper/faktencheck-folgencheck/"], ["WÖk-Scanner", "/anwendungen/scanner.html"]],
    relatedImpactFields: [["Medien & Öffentlichkeit", "/wirkungsfelder/medien-oeffentlichkeit/"]],
    relatedDemos: [["Medienwirkungscheck", "/erleben/medienwirkungscheck/"]],
    relatedDocuments: [["Faktencheck und Folgencheck", "/werkstatt/arbeitsbibliothek/whitepaper/faktencheck-folgencheck/"]],
    relatedObjections: [["Was passiert, wenn die WÖk falsch liegt?", "/einwaende/#korrektur"]],
  },
  wirkungsrisiko: {
    relatedMethods: [["Wirkungsrisiko-Matrix", "/werkzeuge/wirkungsrisiko-matrix/"], ["Datenqualität & Assurance", "/werkzeuge/datenqualitaet-assurance/"]],
    relatedImpactFields: [["Wirtschaft & Unternehmen", "/wirkungsfelder/wirtschaft-unternehmen/"], ["Staat & Demokratie", "/wirkungsfelder/staat-recht-demokratie/"]],
    relatedDemos: [["Unternehmens-Wirkungscheck", "/erleben/unternehmens-wirkungscheck/"]],
    relatedDocuments: [["Risikomanagement im Unternehmen", "/wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/risikomanagement_wirkungsrisiko_erm/"]],
    relatedObjections: [["Was passiert bei Zielkonflikten?", "/einwaende/#zielkonflikte"]],
  },
  "sdg-plus": {
    relatedMethods: [["SDG-/SDG+-Referenzrahmen", "/verstehen/sdgs-sdgplus/"], ["WÖk-IDs", "/werkzeuge/woek-ids/"]],
    relatedImpactFields: [["Staat & Demokratie", "/wirkungsfelder/staat-recht-demokratie/"], ["Öffentlichkeit & Wissen", "/wirkungsfelder/medien-oeffentlichkeit/"]],
    relatedDocuments: [["SDG-/SDG+-Referenzrahmen", "/assets/downloads/woek_sdg_sdgplus_referenzrahmen_vertiefungskonzept_lesefassung_v0_3.docx"]],
    relatedObjections: [["Wer entscheidet, was positive Wirkung ist?", "/einwaende/#entscheidung"]],
  },
  "woek-id": {
    relatedMethods: [["WÖk-IDs", "/werkzeuge/woek-ids/"], ["Datenqualität & Assurance", "/werkzeuge/datenqualitaet-assurance/"]],
    relatedImpactFields: [["Daten & Infrastruktur", "/wirkungsfelder/wissenschaft-innovation-digitalisierung/"]],
    relatedDemos: [["Datenraum-Reifegradcheck", "/werkzeuge/datenraum-reifegradcheck/"]],
    relatedDocuments: [["Datenbasis", "/methodik/datenbasis.html"], ["Daten, Standards & Regularien", "/methodik/daten-standards-regularien.html"]],
    relatedObjections: [["Was passiert bei Datenlücken?", "/einwaende/#datenluecken"]],
  },
  scorecard: {
    relatedMethods: [["Scorecards", "/werkzeuge/scorecards/"], ["Benchmarks & Archetypen", "/werkzeuge/benchmarks-archetypen/"], ["Reverse Merit Order", "/werkzeuge/reverse-merit-order/"]],
    relatedImpactFields: [["Produkte & Konsum", "/wirkungsfelder/produkte-konsum/"], ["Wirtschaft & Unternehmen", "/wirkungsfelder/wirtschaft-unternehmen/"]],
    relatedDemos: [["Produktwirkungsrechner", "/erleben/produktwirkungsrechner/"], ["Unternehmens-Wirkungscheck", "/erleben/unternehmens-wirkungscheck/"]],
    relatedDocuments: [["WÖk Master Items", "/dokumente/woek-master-items-final-v1-2/"]],
    relatedObjections: [["Kann man Wirkung überhaupt messen?", "/einwaende/#messbarkeit"]],
  },
  nwi: {
    relatedMethods: [["Netto-Wirkungs-Index", "/werkzeuge/netto-wirkungs-index/"], ["Scorecards", "/werkzeuge/scorecards/"]],
    relatedImpactFields: [["Wirtschaft & Unternehmen", "/wirkungsfelder/wirtschaft-unternehmen/"], ["Kapital & Finanzierung", "/wirkungsfelder/finanzsystem-kapital/"]],
    relatedDemos: [["Impact-Controlling-Rechner", "/erleben/impact-controlling-rechner/"]],
    relatedDocuments: [["Scorecards, Benchmarks & NWI", "/werkzeuge/impact-controlling/methodenpapiere/scorecards-benchmarks-nwi/"]],
    relatedObjections: [["Was passiert bei Zielkonflikten?", "/einwaende/#zielkonflikte"]],
  },
  "reverse-merit-order": {
    relatedMethods: [["Reverse Merit Order", "/werkzeuge/reverse-merit-order/"], ["Scorecards", "/werkzeuge/scorecards/"]],
    relatedImpactFields: [["Produkte & Konsum", "/wirkungsfelder/produkte-konsum/"]],
    relatedDemos: [["Produktwirkungsrechner", "/erleben/produktwirkungsrechner/"]],
    relatedDocuments: [["WÖk Master Items", "/dokumente/woek-master-items-final-v1-2/"]],
    relatedObjections: [["Was passiert bei Zielkonflikten?", "/einwaende/#zielkonflikte"]],
  },
  "t-sroi": {
    relatedMethods: [["T-SROI", "/werkzeuge/t-sroi/"], ["Impact Controlling", "/werkzeuge/impact-controlling/"]],
    relatedImpactFields: [["Kapital & Finanzierung", "/wirkungsfelder/finanzsystem-kapital/"], ["Gesundheit & Pflege", "/wirkungsfelder/gesundheit-pflege/"]],
    relatedDemos: [["Wirkungsportfolio-Generator", "/erleben/wirkungsportfolio-generator/"]],
    relatedDocuments: [["Whitepaper T-SROI", "/dokumente/whitepaper-t-sroi/"]],
    relatedObjections: [["Werden Produkte teurer?", "/einwaende/#teurer"]],
  },
  wirkungsrueckkopplung: {
    relatedMethods: [["Wirkungsumsatzsteuer", "/werkzeuge/wirkungsumsatzsteuer/"], ["Wirkungshaushalt", "/werkzeuge/wirkungshaushalt/"], ["Öffentliche Beschaffung", "/werkzeuge/oeffentliche-beschaffung/"]],
    relatedImpactFields: [["Staat & Demokratie", "/wirkungsfelder/staat-recht-demokratie/"], ["Produkte & Konsum", "/wirkungsfelder/produkte-konsum/"]],
    relatedDemos: [["Wirkungsförderungs-Check", "/erleben/wirkungsfoerderungs-check/"]],
    relatedDocuments: [["WStG", "/dokumente/wstg-oktober-2025/"], ["Technische Leitlinien WUStG", "/dokumente/technische-leitlinien-wustg-v2/"]],
    relatedObjections: [["Ist das Planwirtschaft?", "/einwaende/#planwirtschaft"]],
  },
  wirkungsrat: {
    relatedMethods: [["Wirkungsrat", "/werkzeuge/wirkungsrat/"], ["Wirkungsregister", "/werkzeuge/wirkungsregister/"], ["Wirkungsaudit", "/werkzeuge/wirkungsaudit/"]],
    relatedImpactFields: [["Staat & Demokratie", "/wirkungsfelder/staat-recht-demokratie/"]],
    relatedDocuments: [["Wirkungsrat Konzept", "/dokumente/wirkungsrat-konzept/"]],
    relatedObjections: [["Was schützt vor Lobbyismus?", "/einwaende/#lobbyismus"]],
  },
  wirkungskompetenz: {
    relatedMethods: [["Akademie", "/akademie.html"], ["Scorecards", "/werkzeuge/scorecards/"]],
    relatedImpactFields: [["Bildung", "/wirkungsfelder/bildung/"], ["Öffentlichkeit & Wissen", "/wirkungsfelder/medien-oeffentlichkeit/"]],
    relatedDemos: [["Wirkungsschule-Check", "/erleben/wirkungsschule-check/"], ["Fach-Zukunft-Generator", "/erleben/fach-zukunft-generator/"]],
    relatedDocuments: [["Akademie-Lernpfad", "/akademie.html#lernpfad"], ["WÖk auf einer Seite", "/verstehen/woek-auf-einer-seite/"]],
    relatedObjections: [["Ist das Social Credit?", "/einwaende/#social-credit"]],
  },
};

function defaultAssociations(term, category) {
  const relatedMethods = [];
  const relatedImpactFields = [];
  const relatedDemos = [];
  const relatedDocuments = [];
  const relatedObjections = [];
  if (category === "Datenbegriff") {
    relatedMethods.push(["Datenqualität & Assurance", "/werkzeuge/datenqualitaet-assurance/"]);
    relatedImpactFields.push(["Daten & Infrastruktur", "/wirkungsfelder/wissenschaft-innovation-digitalisierung/"]);
  }
  if (category === "Messbegriff" || category === "Bewertungsbegriff") {
    relatedMethods.push(["Methoden & Werkzeuge", "/werkzeuge/"]);
    relatedDocuments.push(["Methodenlandkarte", "/werkzeuge/"]);
  }
  if (category === "Steuerungsbegriff") {
    relatedMethods.push(["Wirkungsrückkopplung", "/werkzeuge/"]);
    relatedImpactFields.push(["Staat & Demokratie", "/wirkungsfelder/staat-recht-demokratie/"]);
  }
  if (["social-credit", "wirkungswahrheit"].includes(term.termId)) {
    relatedObjections.push(["Einwände & Schutzgrenzen", "/einwaende/"]);
  }
  return { relatedMethods, relatedImpactFields, relatedDemos, relatedDocuments, relatedObjections };
}

function mergeAssociations(term, category) {
  const base = defaultAssociations(term, category);
  const override = associationOverrides[term.termId] || {};
  const merge = (key) => [...(override[key] || []), ...(base[key] || [])]
    .filter((item, index, arr) => arr.findIndex((candidate) => candidate[1] === item[1]) === index);
  return {
    relatedMethods: merge("relatedMethods"),
    relatedImpactFields: merge("relatedImpactFields"),
    relatedDemos: merge("relatedDemos"),
    relatedDocuments: merge("relatedDocuments"),
    relatedObjections: merge("relatedObjections"),
  };
}

const enrichedTerms = terms.map((term) => ({
  ...term,
  category: categoryFor(term),
  ...mergeAssociations(term, categoryFor(term)),
}));

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), terms: enrichedTerms }, null, 2)}\n`);

const glossaryModel = {
  generatedAt: new Date().toISOString(),
  schema: {
    term: "canonicalLabel",
    shortDefinition: "shortDefinition",
    longDefinition: "longDefinition",
    synonyms: "synonyms",
    relatedTerms: "relatedTerms",
    relatedMethods: "relatedMethods",
    relatedImpactFields: "relatedImpactFields",
  },
  terms: enrichedTerms.map((term) => ({
    id: term.termId,
    term: term.canonicalLabel,
    slug: term.slug,
    shortDefinition: term.shortDefinition,
    longDefinition: term.longDefinition,
    synonyms: term.synonyms || [],
    relatedTerms: term.relatedTerms || [],
    relatedMethods: term.relatedMethods || [],
    relatedImpactFields: term.relatedImpactFields || [],
    relatedDemos: term.relatedDemos || [],
    relatedDocuments: term.relatedDocuments || [],
    relatedObjections: term.relatedObjections || [],
    category: term.category,
    status: term.status,
    version: term.version,
  })),
};
fs.mkdirSync(path.dirname(modelOut), { recursive: true });
fs.writeFileSync(modelOut, `${JSON.stringify(glossaryModel, null, 2)}\n`);

const allowedContexts = ["home", "page", "reference", "blog", "academy", "method", "glossary"];
const hoverTerms = enrichedTerms.map((term, index) => ({
  key: term.termId,
  label: term.canonicalLabel,
  aliases: term.synonyms || [],
  definition: term.hoverDefinition || term.shortDefinition,
  url: `/begriffe/${term.slug}/`,
  priority: index + 1,
  allowedContexts,
  relatedTerms: term.relatedTerms || [],
  relatedMethods: term.relatedMethods || [],
  relatedImpactFields: term.relatedImpactFields || [],
}));
fs.mkdirSync(path.dirname(hoverOut), { recursive: true });
fs.writeFileSync(
  hoverOut,
  `window.WIRKUNG_GLOSSARY_TERMS = ${JSON.stringify(hoverTerms, null, 2)};\n`
);

const history = {
  generatedAt: new Date().toISOString(),
  entries: [
    {
      date: "2026-05-23",
      type: "new-term-registry",
      source,
      status: "approved",
      reason: "Phase-1A-Zentralisierung der führenden WÖk-Begriffsschicht.",
      affectedTerms: enrichedTerms.map((term) => term.termId),
    },
  ],
};
fs.writeFileSync(historyOut, `${JSON.stringify(history, null, 2)}\n`);
console.log(`Wrote ${enrichedTerms.length} glossary terms to ${path.relative(root, out)} and hover terms to ${path.relative(root, hoverOut)}.`);
