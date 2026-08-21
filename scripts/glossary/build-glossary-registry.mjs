import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const generatedAt = (() => {
  const epoch = Number(process.env.SOURCE_DATE_EPOCH || "");
  return Number.isFinite(epoch) && epoch > 0
    ? new Date(epoch * 1000).toISOString()
    : new Date().toISOString();
})();
const source = path.join(root, "assets/data/term-registry.json");
const supplementSources = [
  path.join(root, "content/glossary/imports/wirkungsfinanzpolitik-term-definitions.json"),
  path.join(root, "content/glossary/imports/legacy-detail-definitions.json"),
  path.join(root, "content/glossary/imports/wirkungsgrad-differenzierung.json"),
  path.join(root, "content/glossary/imports/impact-controlling-rechenlogiken.json"),
  path.join(root, "content/glossary/imports/formalisierte-leistungsbegriffe.json"),
  path.join(root, "content/glossary/imports/terminologische-korrekturen.json"),
  path.join(root, "content/glossary/imports/terminologie-leitplanken.json"),
  path.join(root, "content/glossary/imports/rechtsgrundlagen-primarquellen.json"),
  path.join(root, "content/glossary/imports/psychologie-und-kommunikation-definitionen.json"),
  path.join(root, "content/glossary/imports/value-pricing-und-wirkungsbasiertes-value-pricing.json"),
  path.join(root, "content/glossary/imports/iooi-wirkungsarchitektur.json"),
  path.join(root, "content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json"),
  path.join(root, "content/glossary/imports/phineo-wirkungslogik.json"),
  path.join(root, "content/glossary/imports/wirkungssteuer-wstg-v3.json"),
  path.join(root, "content/glossary/imports/gesamtstudie-wirkungsdilemmata-kooperation-sdgplus-term-definitions.json"),
  // Fachlich begründete Verbindungen für zuvor isolierte Begriffe. Diese
  // Datei ist kuratiert, nicht aus Kategorien automatisch abgeleitet.
  path.join(root, "content/glossary/imports/curated-crosslinks.json"),
  path.join(root, "content/glossary/imports/gesamtstudie-wirkungsdilemmata-kooperation-sdgplus-crosslinks.json"),
  path.join(root, "content/glossary/imports/begriffsleitfaden-v1.5.json"),
  path.join(root, "content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json"),
];
const out = path.join(root, "public/data/glossary.terms.json");
const modelOut = path.join(root, "assets/data/glossary-model.json");
const historyOut = path.join(root, "public/data/glossary-version-history.json");
const hoverOut = path.join(root, "assets/js/glossaryTerms.js");
const relationReportOut = path.join(root, "reports/glossary-relation-curation.json");
const sourceArchivePaths = [
  path.join(root, "content/quellenarchiv/sources.json"),
  path.join(root, "content/quellenarchiv/legal-source-records.json"),
  path.join(root, "content/quellenarchiv/evidence-source-records.json"),
];
const glossarySourceArchiveOut = path.join(root, "content/quellenarchiv/glossary-source-records.json");

const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });
const allowedContexts = ["home", "page", "reference", "blog", "academy", "method", "glossary"];

const groupAliases = new Map([
  ["Lieferketten und Sorgfalt", "Lieferketten und Sorgfaltspflichten"],
  ["Kommunikation und Greenwashing", "Kommunikation, Claims und Greenwashing"],
]);

function removeProductionMetadata(value) {
  if (Array.isArray(value)) return value.map(removeProductionMetadata);
  if (value && typeof value === "object") {
    const privateKeys = new Set(["updated_by", "updatedby", "reviewed_by", "reviewedby", "claudereviewdigest"]);
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !privateKeys.has(String(key).toLowerCase()))
        .map(([key, item]) => [key, removeProductionMetadata(item)]),
    );
  }
  if (typeof value !== "string") return value;
  return value
    .replace(/(?:^|\n)\s*(?:updated_by|updatedBy)\s*:\s*(?:codex|claude|chatgpt|openai)\s*(?=\n|$)/gim, "")
    .replace(/Aktualisiert durch:\s*(?:codex|claude|chatgpt|openai)\.?/gi, "")
    .replace(/\n{3,}/g, "\n\n");
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null || value === "" ? [] : [value];
}

function referenceText(value) {
  if (value && typeof value === "object") {
    return String(value.termId || value.id || value.slug || value.label || value.title || value.name || "").trim();
  }
  return String(value || "").trim();
}

function unique(values) {
  return Array.from(new Set(asArray(values).filter(Boolean).map(referenceText).filter(Boolean)));
}

function uniqueEntries(values) {
  const seen = new Set();
  const entries = [];
  for (const value of asArray(values)) {
    if (!value) continue;
    const entry = value && typeof value === "object" ? { ...value } : referenceText(value);
    const key = typeof entry === "object"
      ? `object:${referenceText(entry)}|${String(entry.url || entry.href || entry.pageUrl || "").trim()}`
      : `string:${entry}`;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    entries.push(entry);
  }
  return entries;
}

function normalizeSourceUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    url.hash = "";
    url.search = "";
    return url.href.replace(/\/$/, "").toLowerCase();
  } catch {
    return "";
  }
}

function sourceArchiveSlug(code) {
  return String(code || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const sourceArchiveEntries = sourceArchivePaths.flatMap((sourceArchivePath) => {
  if (!fs.existsSync(sourceArchivePath)) return [];
  const rawArchive = JSON.parse(fs.readFileSync(sourceArchivePath, "utf8"));
  return Array.isArray(rawArchive) ? rawArchive : rawArchive.sources || [];
});
const sourceArchiveByUrl = new Map(
  sourceArchiveEntries
    .filter((source) => source.code && normalizeSourceUrl(source.url))
    .map((source) => [normalizeSourceUrl(source.url), source]),
);
const sourceArchiveByTitle = new Map(
  sourceArchiveEntries
    .filter((source) => source.code && source.title)
    .map((source) => [normalizeKey(source.title), source]),
);
const sourceArchiveSearchEntries = sourceArchiveEntries
  .filter((source) => source.code && source.title)
  .map((source) => ({
    source,
    normalizedTitle: normalizeKey(source.title),
    tokens: new Set(normalizeKey(source.title).split(" ").filter((token) => token.length > 2)),
  }));

function fuzzyArchiveMatch(label) {
  const normalizedLabel = normalizeKey(label);
  const labelTokens = new Set(normalizedLabel.split(" ").filter((token) => token.length > 2));
  if (normalizedLabel.length < 14 || labelTokens.size < 3) return null;
  let best = null;
  for (const candidate of sourceArchiveSearchEntries) {
    if (candidate.normalizedTitle.length >= 14 && (
      normalizedLabel.includes(candidate.normalizedTitle) || candidate.normalizedTitle.includes(normalizedLabel)
    )) {
      const score = Math.min(normalizedLabel.length, candidate.normalizedTitle.length) + 30;
      if (!best || score > best.score) best = { source: candidate.source, score };
      continue;
    }
    let overlap = 0;
    for (const token of labelTokens) if (candidate.tokens.has(token)) overlap += 1;
    const comparable = Math.max(2, Math.min(labelTokens.size, candidate.tokens.size));
    if (overlap >= 3 && overlap / comparable >= 0.75) {
      const score = overlap * 10;
      if (!best || score > best.score) best = { source: candidate.source, score };
    }
  }
  return best?.source || null;
}

function archiveLinkedSource(value) {
  const raw = value && typeof value === "object" ? { ...value } : String(value || "").trim();
  const isObject = typeof raw === "object";
  const rawUrl = isObject
    ? String(raw.url || raw.href || raw.pageUrl || "").trim()
    : (raw.includes("|") ? raw.slice(raw.lastIndexOf("|") + 1).trim() : (/^https?:\/\//i.test(raw) ? raw : ""));
  const rawLabel = isObject
    ? String(raw.title || raw.label || "").trim()
    : (raw.includes("|") ? raw.slice(0, raw.lastIndexOf("|")).trim() : raw);
  if (rawUrl.startsWith("/quellenarchiv/")) return raw;
  const archiveMatch = sourceArchiveByUrl.get(normalizeSourceUrl(rawUrl))
    || sourceArchiveByTitle.get(normalizeKey(rawLabel))
    || fuzzyArchiveMatch(rawLabel);
  if (!archiveMatch) return raw;
  const archiveUrl = `/quellenarchiv/${sourceArchiveSlug(archiveMatch.code)}/`;
  const label = rawLabel || archiveMatch.title;
  if (isObject) {
    return {
      ...raw,
      title: raw.title || raw.label || archiveMatch.title,
      url: archiveUrl,
      originalUrl: rawUrl || raw.originalUrl || archiveMatch.url,
    };
  }
  return `${label}|${archiveUrl}`;
}

function stripTags(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKey(value) {
  return stripTags(value)
    .toLocaleLowerCase("de")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, " ")
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

// A short definition and a long definition do different jobs: the former is
// used in navigation, hover cards and search results; the latter must add
// scope when the register already contains a vetted, term-specific
// explanation.  Do not pad a definition with a generic WÖk sentence just to
// make it longer.  That would look more complete while making the glossary
// less precise.
const genericDefinitionContext = new Set([
  "wirkung, wirkungspotenzial, wirkungsrisiko, wirkmechanismus und eingetretene wirkung sauber unterscheiden",
  "wirkung, wirkungspotenzial, wirkungsrisiko, wirkmechanismus, wirkstoff, resonanzraum, wirkpfad und folgewirkung sauber unterscheiden",
  "zwischen wirkung, wirkungspotenzial, wirkungsrisiko, wirkmechanismus, resonanzraum und wirkpfad unterscheiden",
]);

function normalizedDefinitionText(value) {
  return stripTags(value)
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]+$/g, "")
    .trim()
    .toLocaleLowerCase("de");
}

function definitionIsDistinct(value, references = []) {
  const normalized = normalizedDefinitionText(value);
  if (!normalized || genericDefinitionContext.has(normalized)) return false;
  return references.every((reference) => {
    const comparison = normalizedDefinitionText(reference);
    return !comparison || comparison !== normalized;
  });
}

function deriveLongDefinition(rawTerm, shortDefinition) {
  const explicitCandidates = [rawTerm.longDefinition, rawTerm.definition]
    .filter((value) => String(value || "").trim());
  const explicitExtension = explicitCandidates.find((value) => definitionIsDistinct(value, [shortDefinition]));
  if (explicitExtension) {
    return { value: explicitExtension, basis: "explizite-langdefinition" };
  }

  // These fields are maintained with the term in its source registry.  They
  // may therefore extend the public long definition without inventing a
  // claim, a source or a boundary.  Usage notes that merely repeat the global
  // terminology rule are deliberately excluded above.
  const extensions = [];
  const references = [shortDefinition];
  for (const value of [
    rawTerm.woekRelation,
    rawTerm.woek_einordnung,
    rawTerm.preferredUsage,
    rawTerm.usageNote,
  ]) {
    if (!definitionIsDistinct(value, references)) continue;
    extensions.push(String(value).trim());
    references.push(value);
  }
  if (extensions.length) {
    return {
      value: [shortDefinition, ...extensions].filter(Boolean).join("\n\n"),
      basis: "vorhandene-einordnung-oder-anwendung",
    };
  }

  // Some terms are intentionally concise: a precise, source-linked sentence
  // is preferable to an unverified explanatory addition.  The quality audit
  // records those separately from actual editorial gaps.
  return { value: explicitCandidates[0] || shortDefinition, basis: "konzise-ohne-unverifizierte-ergaenzung" };
}

function definitionDetailStatus(shortDefinition, longDefinition) {
  return definitionIsDistinct(longDefinition, [shortDefinition]) ? "vertieft" : "konzis";
}

function categoryFor(term) {
  const section = String(term.sourceSection || "").toLowerCase();
  const id = String(term.termId || term.id || "").toLowerCase();
  if (section.includes("governance") || ["wirkungsrat", "wirkungswahrheit", "social-credit"].includes(id)) return "Schutzbegriff";
  if (
    section.includes("daten") ||
    ["woek-id", "digitaler-produktpass", "wirkungsdaten", "wirkungsdatenraum", "nace", "esrs", "gri", "csrd"].includes(id)
  ) {
    return "Datenbegriff";
  }
  if (section.includes("instrument") || ["nwi", "t-sroi", "finalscore", "scorecard", "benchmark", "host-wirkungsscore"].includes(id)) return "Messbegriff";
  if (["wirkungssteuer", "wirkungssteuergesetz", "wirkungsumsatzsteuer", "wirkungslenkung", "wirkungshaushalt"].includes(id)) return "Steuerungsbegriff";
  if (["wirkungsarchitektur", "wirkungsnetz", "wirkungsraum", "resonanzraum", "resonanzarchitektur", "social-taxonomy"].includes(id)) return "Architekturbegriff";
  if (["sdg-plus", "mensch-planet-demokratie", "demokratie"].includes(id)) return "Demokratiebegriff";
  if (
    [
      "positive-netto-wirkung",
      "netto-wirkung",
      "positive-wirkung",
      "negative-wirkung",
      "neutrale-wirkung",
      "reverse-merit-order",
      "nichtkompensationsprinzip",
      "wirkungsgrenze",
    ].includes(id)
  ) {
    return "Bewertungsbegriff";
  }
  if (["wirkungseinkommen", "wirkungsrente", "wirkungspunkte", "wirkungsorientiertes-hosting"].includes(id)) return "Praxisbegriff";
  return "Grundbegriff";
}

function normalizeGroup(group) {
  return groupAliases.get(group) || group || "";
}

function isDataStandardsTerm(term) {
  return (
    term.showInCategoryGlossary === true ||
    Boolean(term.dataStandardsGroup) ||
    (term.categories || []).includes("daten-standards-regularien")
  );
}

// Kernbegriffe dürfen in keiner Glossaransicht, keinem Hover und keinem
// Querverweis gegeneinander verschoben werden. Die Übersteuerungen machen die
// begrifflichen Schutzlinien unabhängig von älteren Importständen verbindlich.
const canonicalTermOverrides = new Map([
  ["wirkungslenkung", {
    aliases: ["Wirkungslenkung", "wirkungsorientierte Steuerung", "Impact Steering", "Steuerung nach Wirkung"],
    synonyms: ["Wirkungslenkung", "wirkungsorientierte Steuerung", "Impact Steering"],
    shortDefinition: "Wirkungslenkung ist die legitimierte Entscheidung über Ziele, Schutzgrenzen, Prioritäten und Instrumente, mit denen eine positive Netto-Wirkung angestrebt wird.",
    hoverDefinition: "Wirkungslenkung legt Ziele, Schutzgrenzen, Prioritäten und Instrumente fest. Sie ist nicht die Rückmeldung darüber, was später tatsächlich geschieht.",
    definition: "Wirkungslenkung bezeichnet die absichtsvolle Ausrichtung von Entscheidungen: Eine zuständige, demokratisch oder organisatorisch legitimierte Stelle legt Zielzustände, Schutzgrenzen, Prioritäten und Instrumentregeln fest. Dazu können etwa Beschaffungsregeln, Förderbedingungen, Informationspflichten oder – nur mit Rechtsgrundlage – Preis- und Steuerregeln gehören. Wirkungslenkung bewertet keine Menschen und ersetzt weder Rechtsschutz noch dezentrale Entscheidungen.",
    longDefinition: "Wirkungslenkung bezeichnet die absichtsvolle Ausrichtung von Entscheidungen: Eine zuständige, demokratisch oder organisatorisch legitimierte Stelle legt Zielzustände, Schutzgrenzen, Prioritäten und Instrumentregeln fest. Dazu können etwa Beschaffungsregeln, Förderbedingungen, Informationspflichten oder – nur mit Rechtsgrundlage – Preis- und Steuerregeln gehören. Wirkungslenkung bewertet keine Menschen und ersetzt weder Rechtsschutz noch dezentrale Entscheidungen. Ob eine Regel die beabsichtigte Zustandsveränderung tatsächlich erreicht, zeigt erst die Wirkungsrückkopplung.",
    woekRelation: "Im WÖk-Modell ist Wirkungslenkung die normative und institutionelle Entscheidungsebene. Nichtkompensation, Wirkungsgrenzen und Reverse Merit Order begrenzen, was ein Instrument zulassen darf. Die spätere Beobachtung und Korrektur ist Wirkungsrückkopplung, nicht Wirkungslenkung.",
    statusNote: "Von Wirkungsrückkopplung, Wirkungsbewertung und Reporting unterscheiden.",
    usageNote: "Wirkungslenkung nur verwenden, wenn Ziel, Schutzgrenze, zuständige Stelle und Instrument genannt oder bestimmbar sind. Nicht für bloße Kommunikation, Reporting oder beobachtete Wirkung verwenden.",
    relatedTerms: ["wirkungsarchitektur", "wirkungsbewertung", "wirkungsrueckkopplung", "reporting", "wirkungsgrenze", "nichtkompensationsprinzip", "reverse-merit-order", "positive-netto-wirkung", "wirkungsrisiko", "wirkungsdaten", "wirkungsrat", "wirkungshaushalt"],
    doNotConfuseWith: [
      "Wirkungsrückkopplung: Sie bringt Beobachtungen, Evidenz und Unsicherheit in spätere Entscheidungen zurück.",
      "Wirkungsbewertung: Sie liefert eine begründete Einschätzung, entscheidet aber noch nicht über ein Instrument.",
      "Reporting: Es dokumentiert Informationen; ohne Entscheidungsregel lenkt es nicht.",
      "Personenbewertung oder Social Credit: ausgeschlossen.",
    ],
    examples: [
      "Eine Kommune legt eine Beschaffungsregel mit klaren Schutzgrenzen und Einspruchsweg fest.",
      "Ein Förderprogramm priorisiert nach dokumentierter positiver Netto-Wirkung und schließt rote Linien aus.",
      "Eine gesetzliche Steuerregel wird nur mit definierter Bemessungsgrundlage, Verhältnismäßigkeit und Rechtsschutz entworfen.",
    ],
    deepGlossarySections: [
      {
        title: "Erst entscheiden, dann lernen",
        body: "Wirkungslenkung beantwortet die Frage: Wer darf innerhalb welcher Rechts- und Schutzgrenzen welches Instrument einsetzen? Die Antwort muss Ziel, Zuständigkeit, Begründung, Verhältnismäßigkeit und Rechtsschutz erkennen lassen. Erst danach kann geprüft werden, ob diese Entscheidung die erwartete Zustandsveränderung hervorgebracht hat.",
        items: [
          "Zielzustand und Bilanzgrenze vorab beschreiben.",
          "Nichtkompensationsprinzip und Reverse Merit Order als Schutz vor Schönrechnung anwenden.",
          "Einspruch, Überprüfung und Änderung des Instruments vorsehen.",
        ],
      },
      {
        title: "Was nicht unter den Begriff fällt",
        body: "Eine Kennzahl, ein Bericht oder eine Beobachtung lenkt noch nicht. Ebenso wenig legitimiert eine Wirkungsaussage die Bewertung von Personen. Die WÖk ist weder Planwirtschaft noch Sprachpolizei noch Social-Credit-System.",
      },
    ],
    preferredUsage: "Als Bezeichnung für die legitimierte Ziel-, Schutzgrenzen- und Instrumentenentscheidung verwenden.",
    officialSources: [
      "OECD DAC Criteria: Impact|/quellenarchiv/wok-q-0329/",
      "European Commission: Better Regulation|/quellenarchiv/wok-q-0379/",
      "United Nations: Sustainable Development Goals|/quellenarchiv/wok-q-0024/",
    ],
    curatedSources: [],
    sourceLinks: [],
    sourceProvenance: "Die WÖk-Definition beschreibt die Modellverwendung. OECD-DAC, Better Regulation und die SDGs dienen zur fachlichen Einordnung.",
    reviewStatus: "fachlich konsolidiert",
  }],
  ["wirkungsrueckkopplung", {
    aliases: ["Wirkungsrückkopplung", "Wirkungsrueckkopplung", "Impact Feedback", "wirkungsbezogene Rückführung"],
    synonyms: ["Wirkungsrückkopplung", "Impact Feedback", "wirkungsbezogene Rückführung"],
    shortDefinition: "Wirkungsrückkopplung ist der Lernmechanismus, der beobachtete Zustandsveränderungen, Evidenz und Unsicherheit in spätere Entscheidungen zurückführt.",
    hoverDefinition: "Wirkungsrückkopplung bringt geprüfte Beobachtungen und Unsicherheit in die nächste Entscheidung zurück. Sie legt nicht selbst Ziele oder Instrumente fest.",
    definition: "Wirkungsrückkopplung ist ein Lernmechanismus: Nach einer Maßnahme werden beobachtete Zustandsveränderungen, Wirkungsrisiken, Datenqualität und Unsicherheit gegen eine zuvor definierte Referenz geprüft. Die Ergebnisse fließen in spätere Entscheidungen zurück – etwa durch Anpassung, Aussetzung oder Beendigung einer Regel. Sie ist keine automatische Übertragung eines Scores in Preis, Steuer oder Förderung; solche Instrumentregeln gehören zur Wirkungslenkung.",
    longDefinition: "Wirkungsrückkopplung ist ein Lernmechanismus: Nach einer Maßnahme werden beobachtete Zustandsveränderungen, Wirkungsrisiken, Datenqualität und Unsicherheit gegen eine zuvor definierte Referenz geprüft. Die Ergebnisse fließen in spätere Entscheidungen zurück – etwa durch Anpassung, Aussetzung oder Beendigung einer Regel. Sie ist keine automatische Übertragung eines Scores in Preis, Steuer oder Förderung; solche Instrumentregeln gehören zur Wirkungslenkung. Rückkopplung braucht nachvollziehbare Daten, Verhältnismäßigkeit, Einspruch, Datenschutz und die Möglichkeit, Fehlannahmen zu korrigieren.",
    woekRelation: "Im WÖk-Modell verbindet Wirkungsrückkopplung Beobachtung und Lernen. Sie prüft, ob eine zuvor festgelegte Lenkung unter Schutzgrenzen tatsächlich zur erwarteten Zustandsveränderung beiträgt, und liefert die Grundlage für eine begründete Anpassung.",
    statusNote: "Von Wirkungslenkung, Wirkungsbewertung, Reporting und automatischer Sanktion unterscheiden.",
    usageNote: "Wirkungsrückkopplung nur verwenden, wenn Beobachtung, Referenz, Unsicherheit und die folgende Entscheidung nachvollziehbar beschrieben sind. Nicht als Synonym für Preis-, Steuer- oder Förderregel verwenden.",
    relatedTerms: ["wirkungsarchitektur", "wirkungslenkung", "wirkungsbewertung", "reporting", "wirkungsdaten", "datenqualitaet", "wirkungsrisiko", "wirkungsgrenze", "positive-netto-wirkung", "wirkpfad", "wirkung", "nichtkompensationsprinzip"],
    doNotConfuseWith: [
      "Wirkungslenkung: Sie setzt Ziele, Schutzgrenzen und Instrumentregeln.",
      "Wirkungsbewertung: Sie ordnet Evidenz ein; erst die Rückkopplung verbindet sie mit einer Folgerung für die nächste Entscheidung.",
      "Reporting: Es kann Daten bereitstellen, ist aber ohne Lern- und Entscheidungsprozess keine Rückkopplung.",
      "Automatische Sanktion oder Social Credit: ausgeschlossen.",
    ],
    examples: [
      "Eine Kommune prüft nach einem Pilotprojekt die gemessenen Veränderungen, die Datenlücken und Nebenwirkungen, bevor sie die Regel anpasst.",
      "Ein Förderprogramm veröffentlicht Annahmen und Unsicherheiten und beendet eine Maßnahme, wenn die Schutzgrenze verletzt wird.",
      "Ein Unternehmen vergleicht eine vorab definierte Baseline mit beobachteten Veränderungen und korrigiert seine Beschaffungskriterien.",
    ],
    deepGlossarySections: [
      {
        title: "Vom Befund zur nächsten Entscheidung",
        body: "Rückkopplung beginnt nicht mit einem Punktwert, sondern mit einer prüfbaren Frage: Was hat sich gegenüber welcher Baseline verändert, wie verlässlich ist der Befund und welche Nebenfolgen sind sichtbar? Erst eine begründete Entscheidung darüber, ob ein Instrument fortgesetzt, angepasst, ausgesetzt oder beendet wird, schließt den Lernkreis.",
        items: [
          "Beobachtung, Vergleichsmaßstab und Unsicherheit offenlegen.",
          "Datenqualität, Zurechnung und Wirkungsrisiken getrennt prüfen.",
          "Korrektur, Einspruch und Datenschutz als Teil des Verfahrens absichern.",
        ],
      },
      {
        title: "Keine automatische Sanktion",
        body: "Rückkopplung kann eine Entscheidung begründen, sie ersetzt aber keine Rechtsgrundlage, keine Verhältnismäßigkeitsprüfung und keine menschliche Verantwortung. Die automatische Übertragung eines Scores in Preise, Steuern oder Förderung wäre eine Instrumentregel der Wirkungslenkung und müsste dort eigenständig legitimiert werden.",
      },
    ],
    preferredUsage: "Als Bezeichnung für den überprüfbaren Lern- und Korrekturmechanismus verwenden.",
    officialSources: [
      "OECD DAC Criteria: Impact|/quellenarchiv/wok-q-0329/",
      "European Commission: Better Regulation|/quellenarchiv/wok-q-0379/",
      "Die Wirkungsökonomie als lernendes Kreislaufsystem|/quellenarchiv/wok-q-0729/",
    ],
    curatedSources: [],
    sourceLinks: [],
    sourceProvenance: "Die WÖk-Definition beschreibt die Modellverwendung. OECD-DAC, Better Regulation und Referenzen zum Systemlernen dienen zur fachlichen Einordnung.",
    reviewStatus: "fachlich konsolidiert",
  }],
  ["transformationswirkung", {
    shortDefinition: "Transformationswirkung ist eine eingetretene Zustandsveränderung, die die Bedingungen künftiger Entscheidungen – etwa Regeln, Standards, Anreize, Infrastrukturen oder Pfade – verändert.",
    hoverDefinition: "Transformationswirkung verändert nachweisbar nicht nur einen einzelnen Zustand, sondern Bedingungen künftiger Entscheidungen. Eine bloße Erwartung ist Wirkungspotenzial, keine Transformationswirkung.",
    definition: "Transformationswirkung bezeichnet eine tatsächliche Zustandsveränderung, die über einen Einzelfall hinaus die Struktur eines Systems verändert: etwa Regeln, Standards, Anreize, Infrastrukturen, Marktbedingungen oder institutionelle Routinen. Ob eine solche Veränderung eingetreten ist, muss mit Wirkpfad, Systemgrenze, Zeitraum, Vergleichsmaßstab, Daten und Gegenhypothesen begründet werden.",
    longDefinition: "Transformationswirkung bezeichnet eine tatsächliche Zustandsveränderung, die über einen Einzelfall hinaus die Struktur eines Systems verändert: etwa Regeln, Standards, Anreize, Infrastrukturen, Marktbedingungen oder institutionelle Routinen. Ob eine solche Veränderung eingetreten ist, muss mit Wirkpfad, Systemgrenze, Zeitraum, Vergleichsmaßstab, Daten und Gegenhypothesen begründet werden. Eine erwartete strukturelle Veränderung ist zunächst Transformationspotenzial oder eine Szenarioannahme. Sie darf nicht als eingetretene Wirkung ausgegeben werden.",
    woekRelation: "Die WÖk unterscheidet direkte Wirkung, Netto-Wirkung und Transformationswirkung. Nicht jede positive Wirkung ist transformativ. Im T-SROI dürfen separat belegte Transformationsnutzen als eigene monetäre Nutzenströme modelliert werden; die Kennzahl beweist die Transformationswirkung nicht, sondern bleibt von deren Evidenz, Bilanzgrenze, Zurechnung, Unsicherheit und Wirkungs-Gate abhängig.",
    statusNote: "Von Wirkungspotenzial, Skalierung, Innovation und dem T-SROI-Rechenwerkzeug unterscheiden.",
    usageNote: "Transformationswirkung nur bei einer tatsächlich beobachteten strukturellen Zustandsveränderung verwenden. Für Erwartungen, Wirkpfade oder Szenarien von Transformationspotenzial sprechen; T-SROI niemals als automatischen Nachweis verwenden.",
    relatedTerms: ["wirkung", "wirkungspotenzial", "wirkungsrisiko", "netto-wirkung", "positive-netto-wirkung", "wirkungsbewertung", "wirkungsrueckkopplung", "wirkungslenkung", "t-sroi", "wirkpfad", "systemgrenze", "datenqualitaet", "nichtkompensationsprinzip"],
    doNotConfuseWith: [
      "Wirkungspotenzial: begründete Möglichkeit einer künftigen Veränderung, noch keine Wirkung.",
      "Innovation oder Skalierung: können Transformationspotenzial schaffen, belegen aber keine Transformationswirkung.",
      "Netto-Wirkung: bewertetes Gesamtergebnis innerhalb einer Bilanzgrenze; sie ist nicht automatisch transformativ.",
      "T-SROI: Rechenstandard für getrennte, belegte Nutzen- und Ressourcenströme; keine Beweisautomatik für Systemveränderung."
    ],
    examples: [
      "Ein neues Beschaffungsrecht wird angewendet und verändert nachweisbar über mehrere Jahre die Kriterien und Entscheidungen vieler Beschaffungsstellen.",
      "Ein Pilot verspricht, Standards zu verändern. Solange dies nicht beobachtet und geprüft ist, beschreibt er Transformationspotenzial.",
      "Eine T-SROI-Rechnung weist einen separaten, konservativ belegten Transformationsnutzen aus und kennzeichnet die verbleibende Unsicherheit."
    ],
    deepGlossarySections: [
      {
        title: "Erst Veränderung, dann Etikett",
        body: "Eine strukturelle Erwartung ist noch keine Transformationswirkung. Die einfache Prüffrage lautet: Was hat sich gegenüber welcher Baseline wann, für wen und unter welchen Bedingungen tatsächlich verändert? Ohne diese Antwort bleibt es bei Potenzial oder Szenario.",
        items: [
          "Wirkpfad, Systemgrenze und Vergleichsmaßstab vorab beschreiben.",
          "Direkte Wirkung, mögliche Nebenwirkungen und Strukturveränderung getrennt prüfen.",
          "Unsicherheit und Gegenhypothesen sichtbar lassen."
        ]
      },
      {
        title: "Was der T-SROI leisten kann – und was nicht",
        body: "Der T-SROI-Rechenstandard kann separat belegte, monetarisierbare Transformationsnutzen transparent neben direkten Nutzen, Schäden und Ressourcen bilanzieren. Er ersetzt weder Evidenz für den Wirkpfad noch die Wirkungs-Gates, Nichtkompensation oder eine Prüfung nicht monetarisierbarer Folgen.",
      }
    ],
    preferredUsage: "Als Bezeichnung für eine belegte strukturelle Zustandsveränderung verwenden; Erwartungen als Transformationspotenzial oder Szenario ausweisen.",
    officialSources: [
      "T-SROI-Rechenstandard v1.1|/quellenarchiv/wok-q-1024/",
      "OECD DAC Criteria: Impact|/quellenarchiv/wok-q-0329/",
      "United Nations: Sustainable Development Goals|/quellenarchiv/wok-q-0024/"
    ],
    curatedSources: [],
    sourceLinks: [],
    sourceProvenance: "Die WÖk-Definition beschreibt die Modellverwendung; der T-SROI-Rechenstandard erklärt seine Grenzen. OECD-DAC und Agenda 2030 sind fachliche Referenzrahmen.",
    reviewStatus: "fachlich konsolidiert",
  }],
  ["social-credit", {
    aliases: ["Social Credit", "Sozialkredit", "Social-Credit-System", "Verhaltensscore"],
    synonyms: ["Social Credit", "Sozialkredit", "Social-Credit-System"],
    shortDefinition: "Social Credit bezeichnet Systeme, die Menschen anhand von Verhalten, Merkmalen, Konformität oder Loyalität umfassend bewerten oder einordnen. Sie sind kein Instrument der Wirkungsökonomie.",
    hoverDefinition: "Die Wirkungsökonomie bewertet keine Menschen, Gesinnungen oder Lebensstile. Social-Credit- und Verhaltensscores sind ausgeschlossen.",
    definition: "Social Credit bezeichnet Systeme, die Menschen anhand von Verhalten, Merkmalen, Konformität, Beziehungen oder Loyalität umfassend bewerten oder einordnen und daraus Vorteile, Nachteile oder Zugangschancen ableiten können. Die Wirkungsökonomie zieht hier eine Schutzlinie: Gegenstand der Prüfung sind Wirkungen von Produkten, Regeln, Organisationen, Programmen und Kapitalflüssen – nie der Wert, die Gesinnung oder der Lebensstil einzelner Menschen.",
    longDefinition: "Social Credit bezeichnet Systeme, die Menschen anhand von Verhalten, Merkmalen, Konformität, Beziehungen oder Loyalität umfassend bewerten oder einordnen und daraus Vorteile, Nachteile oder Zugangschancen ableiten können. Die Wirkungsökonomie zieht hier eine Schutzlinie: Gegenstand der Prüfung sind Wirkungen von Produkten, Regeln, Organisationen, Programmen und Kapitalflüssen – nie der Wert, die Gesinnung oder der Lebensstil einzelner Menschen. Datenschutz, Zweckbindung, Datenminimierung, Verhältnismäßigkeit, Einspruch und Rechtsschutz begrenzen auch jede zulässige datenbezogene Entscheidung.",
    woekRelation: "Die WÖk ist kein Social-Credit-System, keine Personenbewertung und keine moralische Rangliste. Produkt-, Organisations- oder Regelbewertungen dürfen nicht in Verhaltensprofile, individuelle Zugangsentscheidungen oder soziale Sanktionen umgedeutet werden.",
    statusNote: "Als rote Linie bei Punkten, Boni, Konsum-, Medien-, Einkommens- und Datensystemen nennen.",
    usageNote: "Nicht pauschal als Schlagwort verwenden: konkrete Daten, Bewertungsgegenstand, mögliche Folgen und Schutzrechte benennen. Bei WÖk-Modellen klarstellen, dass Personen nicht bewertet werden.",
    relatedTerms: ["personenbewertung", "wirkungspunkte", "wirkungslenkung", "wirkungsrueckkopplung", "wirkungsarchitektur", "datenschutz", "grundrechte", "rechtsschutz", "verhaeltnismaessigkeit"],
    doNotConfuseWith: [
      "Wirkungsbewertung: prüft Folgen von Strukturen und Entscheidungen, nicht Menschen.",
      "Produkt- oder Organisationsbewertung: klarer Gegenstand, Bilanzgrenze und Prüfpfad; keine individuelle Rangordnung.",
      "Verbraucherinformation: darf nicht zu einem Konsum- oder Verhaltensprofil ausgebaut werden."
    ],
    examples: [
      "Eine Produktscorecard zeigt Material- und Klimarisiken. Sie bewertet nicht die Käuferinnen und Käufer.",
      "Ein Förderprogramm prüft transparente Kriterien für Organisationen und sichert Einspruch; es vergibt keinen Bürgerscore.",
      "Eine aggregierte Statistik dient der Systembeobachtung und wird nicht für individuelle Sanktionen genutzt."
    ],
    officialSources: [
      "EU-Grundrechtecharta|/quellenarchiv/wok-q-0306/",
      "General Data Protection Regulation / GDPR|/quellenarchiv/wok-q-0556/",
      "Congressional Research Service: China's Corporate Social Credit System|/quellenarchiv/wok-q-0573/"
    ],
    curatedSources: [],
    sourceLinks: [],
    sourceProvenance: "Grundrechte- und Datenschutzquellen markieren rechtliche Schutzlinien. Die Social-Credit-Quelle dient der begrifflichen Einordnung; die WÖk-Abgrenzung ist eine eigene Modellschutzlinie.",
    reviewStatus: "fachlich konsolidiert",
  }],
]);

function applyCanonicalTermOverride(term) {
  const override = canonicalTermOverrides.get(term.termId);
  return override ? { ...term, ...override } : term;
}

function normalizeTerm(rawTerm, index) {
  const label = rawTerm.canonicalLabel || rawTerm.label || rawTerm.term || rawTerm.id || `Begriff ${index + 1}`;
  const id = rawTerm.termId || rawTerm.id || slugify(label);
  const slug = rawTerm.slug || slugify(label);
  const dataStandardsGroup = normalizeGroup(rawTerm.dataStandardsGroup);
  const aliases = unique([label, ...(rawTerm.aliases || []), ...(rawTerm.synonyms || [])]);
  const categories = unique(rawTerm.categories || []);
  const shortDefinition = rawTerm.shortDefinition || rawTerm.hoverDefinition || rawTerm.definition || rawTerm.longDefinition || rawTerm.woekRelation || "";
  const derivedLongDefinition = deriveLongDefinition(rawTerm, shortDefinition);
  const longDefinition = derivedLongDefinition.value;
  const sourceFallback = rawTerm.source
    || rawTerm.sourceSection
    || rawTerm.sourceDocument
    || rawTerm.importSource
    || rawTerm.sourceNote
    || rawTerm.sourceNotes
    || referenceText(asArray(rawTerm.officialSources)[0])
    || rawTerm.category
    || "WÖk-Begriffsleitfaden";
  const normalized = {
    ...rawTerm,
    id,
    termId: id,
    label,
    canonicalLabel: label,
    slug,
    aliases,
    synonyms: aliases,
    status: rawTerm.status || "approved",
    version: rawTerm.version || "1.0",
    source: sourceFallback,
    shortDefinition,
    hoverDefinition: rawTerm.hoverDefinition || shortDefinition,
    definition: rawTerm.definition || longDefinition || shortDefinition,
    longDefinition,
    definitionDetailStatus: definitionDetailStatus(shortDefinition, longDefinition),
    definitionDetailBasis: derivedLongDefinition.basis,
    woekRelation: rawTerm.woekRelation || longDefinition || rawTerm.definition || shortDefinition,
    reviewStatus: rawTerm.reviewStatus || "redaktionell synchronisiert",
    statusNote: rawTerm.statusNote || "",
    usageNote: rawTerm.usageNote || rawTerm.statusNote || "",
    pageUrl: rawTerm.pageUrl || `/begriffe/${slug}/`,
    classicGlossary: rawTerm.classicGlossary !== false,
    showInCategoryGlossary: rawTerm.showInCategoryGlossary === true,
    dataStandardsGroup,
    category: rawTerm.category || categoryFor(rawTerm),
    sourceSection: rawTerm.sourceSection || (dataStandardsGroup ? `Daten, Standards und Regularien · ${dataStandardsGroup}` : rawTerm.source || ""),
    glossaryOrderKey: rawTerm.glossaryOrderKey || label,
    priority: Number.isFinite(rawTerm.priority) ? rawTerm.priority : index + 1,
    relatedTerms: unique(rawTerm.relatedTerms || []),
    officialSources: uniqueEntries(asArray(rawTerm.officialSources).map(archiveLinkedSource)),
    curatedSources: uniqueEntries(asArray(rawTerm.curatedSources || rawTerm.curated_sources).map(archiveLinkedSource)),
    sourceLinks: uniqueEntries(asArray(rawTerm.sourceLinks || rawTerm.source_links).map(archiveLinkedSource)),
    relatedDocuments: uniqueEntries(rawTerm.relatedDocuments || []),
    doNotConfuseWith: unique(rawTerm.doNotConfuseWith || []),
    deprecatedUsage: unique(rawTerm.deprecatedUsage || []),
  };

  if (isDataStandardsTerm(normalized)) {
    normalized.categories = unique([...categories, "daten-standards-regularien"]);
    normalized.showInCategoryGlossary = true;
    normalized.classicGlossary = true;
  } else {
    normalized.categories = categories.length ? categories : [slugify(normalized.category)];
  }

  const canonical = applyCanonicalTermOverride(normalized);
  canonical.definitionDetailStatus = definitionDetailStatus(canonical.shortDefinition, canonical.longDefinition);
  return canonical;
}

function termCompletenessScore(term) {
  return [
    term.status,
    term.version,
    term.source,
    term.hoverDefinition,
    term.reviewStatus,
    term.longDefinition,
    term.woekRelation,
  ].filter(Boolean).length
    + (term.version === "2.0" ? 5 : 0)
    + (term.version === "3.0" ? 12 : 0)
    // #253 is the approved source for the state-architecture precision layer.
    // Older, longer glossary records must not win merely because they carry
    // more legacy enrichment fields (the Wirkungsblindheit collision exposed
    // exactly that failure mode).
    + (term.source === "Führende WÖk-Präzisierung #253" ? 50 : 0)
    + (term.status === "approved" ? 3 : 0)
    + (Array.isArray(term.deepGlossarySections) ? Math.min(term.deepGlossarySections.length, 6) : 0)
    + (Array.isArray(term.officialSources) ? Math.min(term.officialSources.length, 6) : 0)
    + (Array.isArray(term.relatedTerms) ? Math.min(term.relatedTerms.length, 6) : 0);
}

function mergeTermData(primary, secondary) {
  const merged = {
    ...secondary,
    ...primary,
    aliases: unique([...(primary.aliases || []), ...(secondary.aliases || [])]),
    synonyms: unique([...(primary.synonyms || []), ...(secondary.synonyms || [])]),
    categories: unique([...(primary.categories || []), ...(secondary.categories || [])]),
    relatedTerms: unique([...(primary.relatedTerms || []), ...(secondary.relatedTerms || [])]),
    officialSources: uniqueEntries([...(primary.officialSources || []), ...(secondary.officialSources || [])]),
    curatedSources: uniqueEntries([...(primary.curatedSources || []), ...(secondary.curatedSources || [])]),
    sourceLinks: uniqueEntries([...(primary.sourceLinks || []), ...(secondary.sourceLinks || [])]),
    relatedDocuments: uniqueEntries([...(primary.relatedDocuments || []), ...(secondary.relatedDocuments || [])]),
    doNotConfuseWith: unique([...(primary.doNotConfuseWith || []), ...(secondary.doNotConfuseWith || [])]),
    deprecatedUsage: unique([...(primary.deprecatedUsage || []), ...(secondary.deprecatedUsage || [])]),
  };
  if (!merged.deepGlossarySections?.length && secondary.deepGlossarySections?.length) {
    merged.deepGlossarySections = secondary.deepGlossarySections;
  }
  if (!merged.examples?.length && secondary.examples?.length) {
    merged.examples = secondary.examples;
  }
  return merged;
}

function dedupeCanonicalLabels(terms) {
  const byLabel = new Map();
  for (const term of terms) {
    const key = normalizeKey(term.canonicalLabel);
    if (!key || !byLabel.has(key)) {
      byLabel.set(key, term);
      continue;
    }
    const existing = byLabel.get(key);
    const primary = termCompletenessScore(term) >= termCompletenessScore(existing) ? term : existing;
    const secondary = primary === term ? existing : term;
    byLabel.set(key, mergeTermData(primary, secondary));
  }
  return Array.from(byLabel.values());
}

// Relation data arrived from several historical imports. Public pages must not
// turn an unresolved label into a dead link (or a silent chip), therefore the
// registry resolves every relation against the canonical term table once.
const relationOverrides = new Map([
  ["nicht-kompensation", "nichtkompensationsprinzip"],
  ["nichtkompensation", "nichtkompensationsprinzip"],
  ["reverse-merit-order-prinzip", "reverse-merit-order"],
  ["do-no-significant-harm", "dnsh-do-no-significant-harm"],
  ["dnsh", "dnsh-do-no-significant-harm"],
  ["digitale-oeffentlichkeit", "oeffentlichkeit-als-wirkungsraum"],
  ["wirkungsraum-oeffentlichkeit", "oeffentlichkeit-als-wirkungsraum"],
  ["faktenresistenz", "faktenreaktanz"],
  ["false-urgency", "false-urgency-kuenstliche-dringlichkeit"],
  ["oekosystemleistungen", "oekosystemleistungen-oekosystemfunktionen"],
  ["quote-mining", "quote-mining-dekontextualisierung"],
  ["systemkompetenz", "wirkungskompetenz"],
  ["wirkungspfad", "wirkpfad"],
  ["bullshit-asymmetrie", "bullshit-asymmetrie-brandolinis-gesetz"],
  ["derailing", "derailing-themenverschiebung"],
  ["tonalitaet", "framing-sprache-tonalitaet"],
  ["kontakt-hypothese", "kontakthypothese"],
  ["plattformlogik", "plattformlogik-und-algorithmen"],
  ["ingroup-bias", "ingroup-outgroup-dynamik"],
  ["false-consensus", "false-consensus-effect"],
  ["outside-in", "inside-out-outside-in"],
  ["inside-out", "inside-out-outside-in"],
  ["transformationsrente", "wirkungsrente"],
  ["care-arbeit", "sorgearbeit"],
  ["buergerinnenfonds", "wirkungsfonds"],
]);

const suppressedRelationKeys = new Set([
  "moderation",
  "voelkerrecht-und-menschenrechte",
  "europaeisches-primaerrecht-und-grundrechte",
  "uebergangsschutz",
  "wirkungsaufsicht",
].flatMap((value) => [normalizeKey(value), slugify(value)]));

function isSuppressedRelation(value) {
  const raw = referenceText(value);
  return suppressedRelationKeys.has(normalizeKey(raw)) || suppressedRelationKeys.has(slugify(raw));
}

function relationKeys(term) {
  return unique([
    term.canonicalLabel,
    term.label,
    ...(term.aliases || []),
    ...(term.synonyms || []),
  ]).flatMap((value) => unique([value, normalizeKey(value), slugify(value)]));
}

function identityKeys(term) {
  return unique([term.termId, term.id, term.slug])
    .flatMap((value) => unique([value, normalizeKey(value), slugify(value)]));
}

function buildTermLookup(terms) {
  // Aliases are editorial help, not stable identifiers. A normalized alias
  // can legitimately describe more than one term. Resolving a collision by
  // insertion order would silently create a wrong public cross-link.
  const identityCandidates = new Map();
  const aliasCandidates = new Map();
  for (const term of terms) {
    for (const key of identityKeys(term)) {
      if (!key) continue;
      const matches = identityCandidates.get(key) || [];
      matches.push(term);
      identityCandidates.set(key, matches);
    }
    for (const key of relationKeys(term)) {
      if (!key) continue;
      const matches = aliasCandidates.get(key) || [];
      matches.push(term);
      aliasCandidates.set(key, matches);
    }
  }
  const identityLookup = new Map();
  const aliasLookup = new Map();
  const ambiguous = new Set();
  for (const [key, matches] of identityCandidates) {
    const distinct = [...new Map(matches.map((term) => [term.termId, term])).values()];
    if (distinct.length === 1) identityLookup.set(key, distinct[0]);
    else ambiguous.add(key);
  }
  for (const [key, matches] of aliasCandidates) {
    const distinct = [...new Map(matches.map((term) => [term.termId, term])).values()];
    if (distinct.length === 1) aliasLookup.set(key, distinct[0]);
    else ambiguous.add(key);
  }
  return { identityLookup, aliasLookup, ambiguous };
}

function resolveTermReference(value, ownTerm, lookup) {
  const raw = referenceText(value);
  if (!raw) return null;
  const override = relationOverrides.get(normalizeKey(raw)) || relationOverrides.get(slugify(raw));
  const target = (override ? lookup.identityLookup.get(override) || lookup.aliasLookup.get(override) : null)
    || lookup.identityLookup.get(raw)
    || lookup.identityLookup.get(normalizeKey(raw))
    || lookup.identityLookup.get(slugify(raw))
    || lookup.aliasLookup.get(raw)
    || lookup.aliasLookup.get(normalizeKey(raw))
    || lookup.aliasLookup.get(slugify(raw));
  return target || null;
}

function preparePublicTerms(terms) {
  const lookup = buildTermLookup(terms);
  const unresolvedRelations = [];
  for (const term of terms) {
    const declaredRelations = asArray(term.relatedTerms).map(referenceText).filter(Boolean).filter((value) => !isSuppressedRelation(value));
    const resolutions = declaredRelations.map((value) => ({ value, target: resolveTermReference(value, term, lookup) }));
    const related = unique(resolutions
      .map(({ target }) => target && target.termId !== term.termId ? target.termId : "")
      .filter(Boolean));
    // Never manufacture a semantic relation from category membership. A
    // missing or ambiguous relation remains an auditable curation task.
    term.relatedTerms = related;
    term.related_terms = term.relatedTerms;
    const unresolved = unique(resolutions.filter(({ target }) => !target).map(({ value }) => value));
    if (unresolved.length) unresolvedRelations.push({
      termId: term.termId,
      canonicalLabel: term.canonicalLabel,
      unresolved,
    });
    term.sourceProvenance = String(term.sourceProvenance || "").trim();
  }
  return { unresolvedRelations, ambiguousAliases: [...lookup.ambiguous].sort() };
}

function sourceParts(value) {
  if (value && typeof value === "object") {
    return {
      label: String(value.title || value.label || "").trim(),
      url: String(value.url || value.href || value.pageUrl || "").trim(),
      type: String(value.source_type || value.sourceType || "").trim(),
    };
  }
  const raw = String(value || "").trim();
  const separatorIndex = raw.lastIndexOf("|");
  if (separatorIndex < 0) return { label: raw, url: /^https?:\/\//i.test(raw) ? raw : "", type: "" };
  return {
    label: raw.slice(0, separatorIndex).trim(),
    url: raw.slice(separatorIndex + 1).trim(),
    type: "",
  };
}

function isArchiveUrl(url) {
  return String(url || "").startsWith("/quellenarchiv/");
}

function hasLinkedSource(term) {
  return [
    ...asArray(term.curatedSources || term.curated_sources),
    ...asArray(term.sourceLinks || term.source_links),
    ...asArray(term.officialSources),
  ].some((source) => Boolean(sourceParts(source).url));
}

function sourceLabelForArchive(value) {
  const clean = String(value || "")
    .replace(/\.(?:md|docx?|rtf|txt|xlsx?)\b/gi, "")
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (/^definitionsmaster w[öo]k/i.test(clean)) return "WÖk-Glossargrundlage: Definitionssammlung";
  if (/^woek glossar psychologische effekte/i.test(clean)) return "WÖk-Glossargrundlage: psychologische Effekte und Diskursverschiebung";
  if (/^glossar erweiterung website/i.test(clean)) return "WÖk-Glossargrundlage: Website-Erweiterungen";
  return clean || "WÖk-Glossarquelle";
}

function sourceUrlForArchive(label, originalUrl = "") {
  // Alte interne Routen dürfen nicht als Quellenanker fortgeschrieben werden.
  // Die Archiv-ID bleibt stabil, der Locator verweist aber auf die kanonische
  // öffentliche Fassung des jeweiligen Materials.
  const canonicalInternalRoutes = new Map([
    ["https://wirkungsoekonomie.de/dokumente/wp-rente/", "https://wirkungsoekonomie.de/bibliothek/wp-rente/"],
  ]);
  if (originalUrl) return canonicalInternalRoutes.get(originalUrl) || originalUrl;
  const normalized = normalizeKey(label);
  if (normalized === "die wirkungsoekonomie als kooperative lernende und wehrhafte wirkungsordnung") {
    return "https://wirkungsoekonomie.de/bibliothek/wirkungsdilemmata-kooperation-sdgplus-gesamtstudie/";
  }
  if (/begriffsleitfaden/.test(normalized)) return "https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/";
  if (/woems|woemm|methodensystem|managementmodell/.test(normalized)) return "https://wirkungsoekonomie.de/methodenraum/gesamtbild/";
  if (/impact controlling|doppelte wesent/.test(normalized)) return "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/";
  if (/wirkungsfinanzpolitik|schuldenfrage/.test(normalized)) return "https://wirkungsoekonomie.de/wirkungsfelder/finanzsystem-kapital/";
  if (/energie strommarkt|energy sharing/.test(normalized)) return "https://wirkungsoekonomie.de/wirkungsfelder/klima-energie-ressourcen/";
  if (/wohnen investoren|wohnen stadt/.test(normalized)) return "https://wirkungsoekonomie.de/wirkungsfelder/wohnen-stadt/";
  if (/wirkungsraeume gestalten|medien oeffentlichkeit/.test(normalized)) return "https://wirkungsoekonomie.de/wirkungsfelder/medien-oeffentlichkeit/";
  if (/wirkungsradar/.test(normalized)) return "https://wirkungsoekonomie.de/wirkungsradar/";
  if (/daoismus|laotse/.test(normalized)) return "https://wirkungsoekonomie.de/begriffe/daoismus/";
  // Interne Modell- und Arbeitsquellen bleiben klar als solche verlinkt.
  // Für externe bibliografische Kurzangaben ohne URL erzeugen wir keinen
  // Fantasie-Volltextlink: Die Seite verweist transparent auf eine
  // Katalog- bzw. Literaturrecherche mit dem unveränderten Titel.
  if (/^(?:interne|w[öo]k|wirkungs[öo]konomie|wirkungsoekonomie|glossar|journal|anlage|nachtrag|systemmodell|grundlagenpapier|faktencheck)/.test(normalized)) {
    return "https://wirkungsoekonomie.de/bibliothek/";
  }
  if (/^(?:forschung|externe bezugslinien|deliberative demokratietheorie|kybernetik)/.test(normalized)) {
    return `https://api.openalex.org/works?search=${encodeURIComponent(label)}`;
  }
  return `https://search.worldcat.org/search?q=${encodeURIComponent(label)}`;
}

function sourceRecordKey(label, url) {
  return normalizeSourceUrl(url) || `label:${normalizeKey(label)}`;
}

function sourceRecordCode(key) {
  return `WÖK-G-${crypto.createHash("sha256").update(key).digest("hex").slice(0, 12).toUpperCase()}`;
}

function isWoeKPrimarySource(label, url) {
  return /(?:w[öo]k|wirkungs[öo]konomie|wirkungsoekonomie|wirkungsradar|definitionsmaster|woems|woemm)/i.test(`${label} ${url}`)
    || /^\/(?!\/)/.test(url || "");
}

function attachGlossarySourceArchive(terms) {
  const records = new Map();
  const recordFor = ({ label, url, term }) => {
    const sourceLabel = sourceLabelForArchive(label || term.sourceDocument || term.source || term.canonicalLabel);
    const sourceUrl = sourceUrlForArchive(sourceLabel, url);
    const key = sourceRecordKey(sourceLabel, sourceUrl);
    if (!records.has(key)) {
      const internal = isWoeKPrimarySource(sourceLabel, sourceUrl);
      const isCatalogLocator = /^https:\/\/search\.worldcat\.org\/search\?/i.test(sourceUrl);
      const isLiteratureSearch = /^https:\/\/api\.openalex\.org\/works\?search=/i.test(sourceUrl);
      records.set(key, {
        code: sourceRecordCode(key),
        title: sourceLabel,
        url: sourceUrl || null,
        doi: null,
        author: internal ? "Wirkungsökonomie" : null,
        year: null,
        type: "glossarquelle",
        typeLabel: internal ? "WÖk-Primärquelle" : (isCatalogLocator || isLiteratureSearch ? "Bibliografischer Nachweis" : "Bibliografischer Quellenverweis"),
        cluster: "M",
        clusterLabel: "Glossar-Quellen und Primärmaterial",
        origin: internal ? "intern" : "extern",
        reviewStatus: "referenziert",
        dataQuality: internal ? "graue-literatur" : (isCatalogLocator || isLiteratureSearch ? "bibliografischer-nachweis" : "quellenverweis"),
        locatorType: isCatalogLocator ? "katalog" : (isLiteratureSearch ? "literatursuche" : "direkt"),
        locatorNote: isCatalogLocator
          ? "Der Link führt zu einer bibliografischen Katalogsuche mit dem angegebenen Titel. Er ersetzt weder den Volltext noch eine eigene Evidenzprüfung."
          : (isLiteratureSearch
            ? "Der Link führt zu einer Literatursuche zum angegebenen Themenfeld. Er ersetzt weder eine systematische Recherche noch eine eigene Evidenzprüfung."
            : ""),
        summary: internal
          ? "Dokumentiert die begriffliche Verwendung innerhalb der Wirkungsökonomie. Für empirische, rechtliche oder naturwissenschaftliche Aussagen ist eine zusätzliche passende externe Quelle erforderlich."
          : "Bibliografischer Quellenverweis aus der Glossar-Terminologie. Die Detailseite bewahrt Titel und gegebenenfalls die originale Fundstelle.",
        einordnung: internal
          ? "Diese WÖk-Primärquelle belegt die modellinterne Begriffsverwendung. Sie ist transparent von unabhängiger empirischer Evidenz und von geltendem Recht zu unterscheiden."
          : "Diese Quelle wurde in der Glossar-Terminologie als Referenz genannt. Ihre fachliche Aussagekraft ergibt sich aus der Originalquelle, nicht aus der bloßen Aufnahme in das Archiv.",
        impactFields: [],
        sdg: null,
        domain: sourceUrl ? (() => {
          try { return new URL(sourceUrl).hostname || "wirkungsoekonomie.de"; } catch { return "wirkungsoekonomie.de"; }
        })() : null,
      });
    }
    return records.get(key);
  };

  for (const term of terms) {
    const sourceCollections = ["curatedSources", "sourceLinks", "officialSources"];
    for (const field of sourceCollections) {
      const values = asArray(term[field]);
      term[field] = uniqueEntries(values.map((value) => {
        const parsed = sourceParts(value);
        if (!parsed.label && !parsed.url) return value;
        if (isArchiveUrl(parsed.url)) return value;
        const record = recordFor({ ...parsed, term });
        return `${parsed.label || record.title}|/quellenarchiv/${sourceArchiveSlug(record.code)}/`;
      }));
    }
    if (!hasLinkedSource(term)) {
      const record = recordFor({ label: term.sourceDocument || term.source || term.canonicalLabel, url: "", term });
      term.officialSources = uniqueEntries([
        ...(term.officialSources || []),
        `${record.title}|/quellenarchiv/${sourceArchiveSlug(record.code)}/`,
      ]);
    }
    if (!term.sourceProvenance) {
      term.sourceProvenance = "Die Quellenverweise führen auf Detailseiten des Quellenarchivs; WÖk-Primärquellen dokumentieren Modellbegriffe und ersetzen keine externe Evidenz für empirische oder rechtliche Aussagen.";
    }
  }

  return [...records.values()].sort((a, b) => String(a.code).localeCompare(String(b.code), "de"));
}

const raw = removeProductionMetadata(JSON.parse(fs.readFileSync(source, "utf8")));
const rawTerms = [
  ...(Array.isArray(raw) ? raw : raw.terms || []),
  ...supplementSources.flatMap((file) => {
    if (!fs.existsSync(file)) return [];
    const supplement = removeProductionMetadata(JSON.parse(fs.readFileSync(file, "utf8")));
    return Array.isArray(supplement) ? supplement : supplement.terms || [];
  }),
];
// Deduplizierte Datensätze können ältere Ergänzungsfelder wieder mitbringen.
// Die kanonischen Kernbegriffe werden deshalb abschließend noch einmal gesetzt.
const terms = dedupeCanonicalLabels(rawTerms.map(normalizeTerm))
  .map(applyCanonicalTermOverride)
  .sort((a, b) => collator.compare(a.glossaryOrderKey || a.canonicalLabel, b.glossaryOrderKey || b.canonicalLabel));

const glossarySourceRecords = attachGlossarySourceArchive(terms);
fs.writeFileSync(glossarySourceArchiveOut, `${JSON.stringify({
  generatedAt,
  clusters: [{ key: "M", label: "Glossar-Quellen und Primärmaterial", count: glossarySourceRecords.length }],
  sources: glossarySourceRecords,
}, null, 2)}\n`);

const relationCuration = preparePublicTerms(terms);
fs.mkdirSync(path.dirname(relationReportOut), { recursive: true });
fs.writeFileSync(relationReportOut, `${JSON.stringify({
  generatedAt,
  unresolvedRelations: relationCuration.unresolvedRelations,
  ambiguousAliasKeys: relationCuration.ambiguousAliases,
}, null, 2)}\n`);

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify({ generatedAt, terms }, null, 2)}\n`);

// The structured model feeds the search and cross-link layer. Keep the
// established association metadata while the term registry remains the single
// source for names, definitions, aliases and versioning.
const previousModelTerms = new Map(
  (fs.existsSync(modelOut) ? JSON.parse(fs.readFileSync(modelOut, "utf8")).terms || [] : [])
    .map((term) => [term.id, term])
);
const associationKeys = [
  "relatedMethods",
  "relatedImpactFields",
  "relatedDemos",
  "relatedDocuments",
  "relatedObjections",
];
const glossaryModel = {
  generatedAt,
  schema: {
    term: "canonicalLabel",
    shortDefinition: "shortDefinition",
    longDefinition: "longDefinition",
    synonyms: "synonyms",
    relatedTerms: "relatedTerms",
    relatedMethods: "relatedMethods",
    relatedImpactFields: "relatedImpactFields",
  },
  terms: terms.map((term) => {
    const previous = previousModelTerms.get(term.termId) || {};
    const associations = Object.fromEntries(associationKeys.map((key) => [
      key,
      Array.isArray(term[key]) ? term[key] : (previous[key] || []),
    ]));
    return {
      id: term.termId,
      term: term.canonicalLabel,
      slug: term.slug,
      shortDefinition: term.shortDefinition,
      longDefinition: term.longDefinition,
      synonyms: term.synonyms || [],
      relatedTerms: term.relatedTerms || [],
      ...associations,
      category: term.category,
      status: term.status,
      version: term.version,
    };
  }),
};
fs.mkdirSync(path.dirname(modelOut), { recursive: true });
fs.writeFileSync(modelOut, `${JSON.stringify(glossaryModel, null, 2)}\n`);

const hoverTerms = terms
  .filter((term) => term.classicGlossary !== false)
  .map((term, index) => ({
    key: term.termId,
    label: term.canonicalLabel,
    aliases: term.autoLinkAliases || term.synonyms || [],
    definition: term.hoverDefinition || term.shortDefinition,
    url: term.pageUrl || `/begriffe/${term.slug}/`,
    priority: index + 1,
    autoLinkAllowed: term.autoLinkAllowed !== false,
    maxAutoLinksPerPage: Number.isFinite(term.maxAutoLinksPerPage) ? term.maxAutoLinksPerPage : undefined,
    allowedContexts,
  }));

fs.mkdirSync(path.dirname(hoverOut), { recursive: true });
fs.writeFileSync(hoverOut, `window.WIRKUNG_GLOSSARY_TERMS = ${JSON.stringify(hoverTerms, null, 2)};\n`);

const history = {
  generatedAt,
  entries: [
    {
      date: "2026-05-27",
      type: "single-source-term-registry",
      source: path.relative(root, source),
      status: "approved",
      reason: "Klassisches Glossar und thematische Glossarbereiche werden aus derselben Term-Registry erzeugt.",
      affectedTerms: terms.map((term) => term.termId),
    },
  ],
};
fs.writeFileSync(historyOut, `${JSON.stringify(history, null, 2)}\n`);

const dataCount = terms.filter(isDataStandardsTerm).length;
console.log(
  `Wrote ${terms.length} glossary terms (${dataCount} data/standards terms) to ${path.relative(root, out)} and hover terms to ${path.relative(root, hoverOut)}.`
);
