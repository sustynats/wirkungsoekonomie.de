import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "assets/data/term-registry.json");
const glossaryDir = path.join(root, "content/glossar");
const sourcesPath = path.join(glossaryDir, "glossar-quellen.md");
const backlinkAuditPath = path.join(glossaryDir, "glossar-backlink-audit.json");
const processPath = path.join(glossaryDir, "glossar-publizierungsprozess.md");

const today = "2026-05-29";

function slugify(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
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
    .replace(/-{2,}/g, "-");
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

const categoryTags = {
  "Psychologische Wirkmechanismen": ["Psychologie", "Medienwirkung", "Resonanzraum", "Wirkungspotenzial", "Wirkungsrisiko", "Demokratie"],
  "Systemtheorie, Kybernetik und Konstruktivismus": ["Systemtheorie", "Kybernetik", "Konstruktivismus", "Rückkopplung", "Resonanzraum", "Wirkungsarchitektur"],
  "Management, Wirksamkeit und Organisation": ["Management", "Organisation", "Wirksamkeit", "Wirkungssteuerung", "Transformation"],
  "Innovation, Evolution und Unternehmertum": ["Innovation", "Evolution", "Unternehmertum", "Transformation", "Wirkungsinnovation"],
  "Daoismus, Prozessdenken und Nicht-Erzwingen": ["Prozessdenken", "Selbstorganisation", "Resonanz", "Wirkungsarchitektur"],
  "Klima, Lebenszyklus und ökologische Wirkung": ["Klima", "Lebenszyklus", "Produktwirkung", "LCA", "Planet", "Wirkungsrisiko"],
  "Design, Geschäftsmodelle und Wertversprechen": ["Design", "Geschäftsmodell", "Innovation", "Wertversprechen", "Wirkungspotenzial"],
  "Physik, Energie und Wirkungsmetaphern": ["Energie", "Systemgrenze", "Metapher", "Wirkungsanalyse", "Wirkungssteuerung"],
  "Glossar-Publizierungsprozess": ["Glossar", "Publizierungsprozess", "Qualitätssicherung", "Quellen", "Backlinks"],
  "Vordenker:innen und Bezugslinien": ["Vordenker", "Bezugslinie", "Einordnung", "Abgrenzung", "Wirkungsökonomie"],
  "Werte, Normativität und Bewertung": ["Werte", "Normativität", "Bewertung", "Wirkungswert", "Mensch, Planet und Demokratie"],
  "Kapital, Markt und Eigentum": ["Kapital", "Markt", "Eigentum", "Externalisierung", "Wirkungsverantwortung"],
  "Sprache, Wirklichkeit und Kommunikation": ["Sprache", "Kommunikation", "Wahrheit", "Wirklichkeit", "Resonanzraum"],
  "Ethik, Würde und Verantwortung": ["Ethik", "Menschenwürde", "Verantwortung", "Nichtkompensation", "Rechtsstaatlichkeit"],
  "Management, Organisation und Wirksamkeit": ["Management", "Organisation", "Wirksamkeit", "Wirkungssteuerung", "Transformation"],
  "Transformation, Innovation und wirtschaftliche Entwicklung": ["Transformation", "Innovation", "Wohlstand", "Entwicklung", "Wirkungsinnovation"],
};

const conceptStatusMap = {
  core: "WÖk-Kernbegriff",
  precision: "WÖk-Präzisierungsbegriff",
  connection: "Anschlussbegriff",
  method: "Methodenbegriff",
  sourceLine: "Quellen-/Bezugslinienbegriff",
  thinker: "Vordenker-/Bezugslinienbegriff",
};

const sourceGroups = {
  system: [
    ["internal_woek", "WÖk Glossar und Referenz", "https://wirkungsoekonomie.de/glossar.html"],
    ["primary", "Stafford Beer: Brain of the Firm", ""],
    ["primary", "Humberto Maturana / Francisco Varela: Autopoiesis and Cognition", ""],
    ["primary", "Heinz von Foerster: Understanding Understanding", ""],
    ["primary", "Donella Meadows: Leverage Points", "https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/"],
  ],
  management: [
    ["primary", "Peter Drucker: The Effective Executive", ""],
    ["institutional", "Drucker Institute", "https://drucker.institute/"],
    ["institutional", "St. Galler Management-Modell", "https://www.sgmm.ch/en/about-the-model/history/"],
    ["secondary", "Malik Management", "https://www.malik-management.com/"],
  ],
  innovation: [
    ["primary", "Joseph A. Schumpeter: Theorie der wirtschaftlichen Entwicklung", ""],
    ["primary", "Joseph A. Schumpeter: Capitalism, Socialism and Democracy", ""],
    ["primary", "Nikolai Kondratieff: The Long Waves in Economic Life", ""],
    ["secondary", "EconStor", "https://www.econstor.eu/"],
  ],
  dao: [
    ["secondary", "Alan Watts: Taoist Way / Taoismus-Vorträge", ""],
    ["article_context_only", "Daoismus als philosophische Bezugslinie der Wirkungsökonomie", ""],
  ],
  climate: [
    ["institutional", "IPCC AR6 Glossary", "https://www.ipcc.ch/report/ar6/syr/downloads/report/IPCC_AR6_SYR_Annex-I.pdf"],
    ["institutional", "IPCC WGII", "https://www.ipcc.ch/report/ar6/wg2/"],
    ["institutional", "EU JRC Life Cycle Assessment", "https://eplca.jrc.ec.europa.eu/lifecycleassessment.html"],
    ["institutional", "EU Product Environmental Footprint", "https://eplca.jrc.ec.europa.eu/EnvironmentalFootprint.html"],
    ["institutional", "ISO 14040", "https://www.iso.org/standard/37456.html"],
    ["institutional", "GHG Protocol Product Life Cycle Standard", "https://ghgprotocol.org/sites/default/files/standards/Product-Life-Cycle-Accounting-Reporting-Standard_041613.pdf"],
    ["institutional", "JEC Well-to-Wheels", "https://joint-research-centre.ec.europa.eu/welcome-jec-website/jec-activities/well-wheels-analyses_en"],
    ["institutional", "Cradle to Cradle Certified", "https://c2ccertified.org/the-standard"],
  ],
  design: [
    ["institutional", "IDEO Design Thinking", "https://designthinking.ideo.com/"],
    ["institutional", "Stanford d.school", "https://dschool.stanford.edu/"],
    ["institutional", "Strategyzer Business Model Canvas", "https://www.strategyzer.com/library/the-business-model-canvas"],
    ["institutional", "Strategyzer Value Proposition Canvas", "https://www.strategyzer.com/library/the-value-proposition-canvas"],
  ],
  capital: [
    ["primary", "Adam Smith: The Theory of Moral Sentiments", ""],
    ["primary", "Adam Smith: An Inquiry into the Nature and Causes of the Wealth of Nations", ""],
    ["primary", "Karl Marx: Das Kapital", ""],
    ["primary", "Karl Polanyi: The Great Transformation", ""],
    ["primary", "Friedrich Hayek: The Use of Knowledge in Society", ""],
    ["primary", "John Maynard Keynes: The General Theory", ""],
  ],
  ethics: [
    ["primary", "Immanuel Kant: Grundlegung zur Metaphysik der Sitten", ""],
    ["primary", "Immanuel Kant: Kritik der praktischen Vernunft", ""],
    ["primary", "Hannah Arendt: Vita activa / The Human Condition", ""],
    ["primary", "Amartya Sen: Development as Freedom", ""],
    ["primary", "Martha Nussbaum: Creating Capabilities", ""],
    ["institutional", "Grundgesetz Art. 1 und Art. 20a", "https://www.gesetze-im-internet.de/gg/"],
  ],
  communication: [
    ["primary", "Ludwig Wittgenstein: Philosophische Untersuchungen", ""],
    ["primary", "Paul Watzlawick / Janet Beavin / Don Jackson: Pragmatics of Human Communication", ""],
    ["primary", "Paul Watzlawick: Die erfundene Wirklichkeit", ""],
    ["primary", "Ernst von Glasersfeld: Radical Constructivism", ""],
    ["primary", "Humberto Maturana / Francisco Varela: Autopoiesis and Cognition", ""],
  ],
  systems2: [
    ["primary", "Heinz von Foerster: Understanding Understanding", ""],
    ["primary", "Stafford Beer: Brain of the Firm", ""],
    ["primary", "Gregory Bateson: Steps to an Ecology of Mind", ""],
    ["primary", "Niklas Luhmann: Soziale Systeme", ""],
    ["primary", "Frederic Vester: Die Kunst vernetzt zu denken", ""],
    ["primary", "Donella Meadows: Thinking in Systems", ""],
    ["primary", "Donella Meadows: Leverage Points", "https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/"],
  ],
  management2: [
    ["primary", "Peter Drucker: The Practice of Management", ""],
    ["primary", "Peter Drucker: Management: Tasks, Responsibilities, Practices", ""],
    ["primary", "Hans Ulrich: Die Unternehmung als produktives soziales System", ""],
    ["institutional", "St. Galler Management-Modell", "https://www.sgmm.ch/en/about-the-model/history/"],
    ["primary", "Fredmund Malik: Führen Leisten Leben", ""],
  ],
  transformation: [
    ["primary", "Maja Göpel: Unsere Welt neu denken", ""],
    ["primary", "Kate Raworth: Doughnut Economics", ""],
    ["primary", "Mariana Mazzucato: Mission Economy", ""],
    ["institutional", "Wellbeing Economy Alliance", "https://weall.org/"],
    ["institutional", "OECD Measuring Well-being and Progress", "https://www.oecd.org/wise/measuring-well-being-and-progress.htm"],
    ["institutional", "Stockholm Resilience Centre: Planetary Boundaries", "https://www.stockholmresilience.org/research/planetary-boundaries.html"],
  ],
  scope: [
    ["institutional", "GHG Protocol Corporate Standard", "https://ghgprotocol.org/corporate-standard"],
    ["institutional", "GHG Protocol Scope 3 Standard", "https://ghgprotocol.org/corporate-value-chain-scope-3-standard"],
    ["institutional", "ESRS E1 Climate Change", "https://www.efrag.org/en/sustainability-reporting/esrs"],
    ["institutional", "ISO 14064", "https://www.iso.org/standard/66453.html"],
    ["institutional", "ISO 14067", "https://www.iso.org/standard/71206.html"],
    ["internal_woek", "Interne WÖk-Master-Items zu Scope, PCF, LCA und Wirkungsdaten", ""],
  ],
};

function sources(...groups) {
  return groups.flatMap((group) => sourceGroups[group] || []);
}

function official(sourceRows) {
  return unique(sourceRows.map(([, label, url]) => url ? `${label}|${url}` : label));
}

function sourceLinks(sourceRows) {
  return sourceRows.map(([source_type, title, url]) => ({ source_type, title, url, status: url ? "linked" : "bibliographic" }));
}

function term({
  id,
  title,
  category,
  concept = "connection",
  publicationStatus = "published",
  short,
  definition,
  woek,
  aliases = [],
  related = [],
  examples = [],
  statusNote = "",
  usage = "",
  sourceGroup = "system",
  reviewStatus = "approved",
  version = "1.0",
}) {
  const slug = id || slugify(title);
  const sourceRows = sources(sourceGroup);
  const conceptStatus = conceptStatusMap[concept] || conceptStatusMap.connection;
  return {
    id: slug,
    termId: slug,
    label: title,
    canonicalLabel: title,
    slug,
    aliases: unique([title, ...aliases]),
    synonyms: unique([title, ...aliases]),
    shortDefinition: short,
    short_definition: short,
    definition,
    longDefinition: definition,
    long_definition: definition,
    woekRelation: woek,
    woek_einordnung: woek,
    examples,
    relatedTerms: unique(related),
    related_terms: unique(related),
    officialSources: official(sourceRows),
    sourceLinks: sourceLinks(sourceRows),
    source_links: sourceLinks(sourceRows),
    internalLinks: [],
    internal_links: [],
    categories: [slugify(category)],
    tags: categoryTags[category] || [],
    category,
    conceptStatus,
    concept_status: conceptStatus,
    publicationStatus,
    publication_status: publicationStatus,
    status: {
      "WÖk-Kernbegriff": "woek-kernbegriff",
      "WÖk-Präzisierungsbegriff": "woek-praezisierungsbegriff",
      "Anschlussbegriff": "anschlussbegriff",
      "Methodenbegriff": "methodenbegriff",
      "Quellen-/Bezugslinienbegriff": "bezugsbegriff",
      "Vordenker-/Bezugslinienbegriff": "vordenker-bezugslinie",
    }[conceptStatus] || "anschlussbegriff",
    version,
    lastReviewed: today,
    last_reviewed: today,
    lastUpdated: today,
    updatedAt: today,
    firstApprovedIn: today,
    reviewStatus,
    source: category,
    sourceDocument: "Glossar-Architektur Wirkmechanismen",
    sourceSection: category,
    hoverDefinition: short,
    statusNote,
    usageNote: usage || "Wirkung, Wirkungspotenzial, Wirkungsrisiko, Wirkmechanismus und eingetretene Wirkung sauber unterscheiden.",
    classicGlossary: publicationStatus === "published",
    showInCategoryGlossary: false,
    pageUrl: `/begriffe/${slug}/`,
    metaTitle: `${title} | Glossar der Wirkungsökonomie`,
    metaDescription: `${short} Wirkungsökonomisch eingeordnet als ${conceptStatus}.`,
    doNotConfuseWith: [],
    relatedDocuments: [],
    preferredUsage: usage,
    deprecatedUsage: [],
    glossaryOrderKey: title,
  };
}

const additions = [
  term({ id: "strukturdeterminiertheit", title: "Strukturdeterminiertheit", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Strukturdeterminiertheit beschreibt, dass ein System auf Impulse gemäß seiner eigenen Struktur, Geschichte und inneren Organisation reagiert.", definition: "Ein System nimmt Impulse nicht neutral auf. Es verarbeitet politische Aussagen, Fakten, Preise, Regeln, Produkte oder Wirkungsdaten nach seiner eigenen Logik.", woek: "Strukturdeterminiertheit erklärt, warum Wirkungsökonomie Resonanzräume, Anschlussfähigkeit, Rückkopplung und Folgencheck braucht.", related: ["strukturelle-kopplung", "autopoiesis", "nichttriviales-system", "resonanzraum", "anschlussfaehigkeit", "wirkungspfad"] }),
  term({ id: "triviale-maschine", title: "Triviale Maschine", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Eine triviale Maschine reagiert auf denselben Input immer mit demselben Output.", definition: "Der Begriff beschreibt ein lineares Modell von Steuerung: gleiche Eingabe, gleiche Ausgabe. Für einfache technische Abläufe kann das nützlich sein.", woek: "Viele Steuerungsmodelle behandeln Gesellschaft, Märkte oder Menschen zu sehr wie triviale Maschinen. Wirkungsökonomisch ist das unzureichend.", related: ["nichttriviale-maschine", "nichttriviales-system", "kybernetik", "rueckkopplung"] }),
  term({ id: "nichttriviale-maschine", title: "Nichttriviale Maschine", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Eine nichttriviale Maschine reagiert abhängig von innerem Zustand, Geschichte und früheren Ausgaben.", definition: "Bei nichttrivialen Maschinen hängt der Output nicht nur vom Input ab. Frühere Erfahrungen, Zustände und Rückkopplungen verändern die Reaktion.", woek: "Gesellschaft, Märkte, Organisationen, Medien und Demokratien müssen als nichttriviale Systeme gelesen werden.", related: ["triviale-maschine", "nichttriviales-system", "strukturdeterminiertheit", "rueckkopplung"] }),
  term({ id: "selbstreferenz", title: "Selbstreferenz", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Selbstreferenz beschreibt, dass ein System sich in seinen Operationen auf sich selbst bezieht.", definition: "Selbstreferenz stabilisiert eigene Unterscheidungen, Routinen und Kriterien. Systeme verarbeiten Umweltreize daher nicht einfach objektiv, sondern aus ihrer eigenen Operationslogik.", woek: "Relevant für Medien, Märkte, Politik, Organisationen und digitale Öffentlichkeiten, wenn externe Fakten an internen Logiken abprallen.", related: ["autopoiesis", "wirklichkeitskonstruktion", "beobachtung-zweiter-ordnung", "strukturdeterminiertheit"] }),
  term({ id: "beobachterabhaengigkeit", title: "Beobachterabhängigkeit", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Beobachterabhängigkeit beschreibt, dass Beobachtungen durch Perspektive, Auswahl, Sprache, Kriterien und Deutungsrahmen geprägt sind.", definition: "Beobachtungen sind nicht beliebig, aber sie sind nie völlig voraussetzungslos. Schon die Wahl von Indikatoren, Grenzen, Kategorien und Vergleichswerten prägt das Ergebnis.", woek: "Wichtig für Faktencheck, Folgencheck, Scorecards und Wirkungsbewertung: Zustandsveränderungen bleiben real, ihre Erfassung braucht transparente Kriterien.", related: ["beobachtung-zweiter-ordnung", "wirklichkeitskonstruktion", "scorecard", "folgencheck"] }),
  term({ id: "kybernetik", title: "Kybernetik", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Kybernetik ist die Wissenschaft von Steuerung, Regelung, Kommunikation und Rückkopplung in Systemen.", definition: "Kybernetik untersucht, wie Systeme Informationen aufnehmen, verarbeiten, steuern, lernen und stabilisieren.", woek: "Die Wirkungsökonomie nutzt kybernetische Grundideen, indem Wirkung nicht nur gemessen, sondern in Preise, Steuern, Kapital, Beschaffung, Förderung und Entscheidungen zurückgekoppelt wird.", related: ["rueckkopplung", "kybernetik-zweiter-ordnung", "wirkungsrueckkopplung", "wirkungsarchitektur"] }),
  term({ id: "kybernetik-zweiter-ordnung", title: "Kybernetik zweiter Ordnung", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Kybernetik zweiter Ordnung betrachtet Beobachter:innen und Steuernde als Teil des Systems.", definition: "Sie fragt nicht nur, wie ein System gesteuert wird, sondern wie Beobachtung und Steuerung selbst Wirkungen erzeugen.", woek: "Relevant für Wirkungsrat, Folgencheck, Governance und demokratische Kontrolle: Wer Wirkung misst, wirkt selbst.", related: ["kybernetik", "beobachtung-zweiter-ordnung", "wirkungsrat", "governance"] }),
  term({ id: "rekursion", title: "Rekursion", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Rekursion beschreibt, dass Strukturen oder Prozesse auf mehreren Ebenen wiederkehren.", definition: "Rekursive Systeme besitzen ähnliche Funktionen auf unterschiedlichen Ebenen, etwa Team, Organisation, Kommune, Land oder Lieferkette.", woek: "Relevant für föderale Wirkung, Unternehmen, Kommunen, Lieferketten und Wirkungsarchitektur.", related: ["viable-system-model", "wirkungsarchitektur", "rueckkopplung"] }),
  term({ id: "varietaet", title: "Varietät", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Varietät beschreibt die Vielfalt möglicher Zustände, Störungen oder Handlungsoptionen eines Systems.", definition: "Ein System mit hoher Varietät kann viele verschiedene Situationen verarbeiten. Zu geringe Varietät führt zu Überforderung oder blinder Vereinfachung.", woek: "Relevant für Resilienz, Governance und Viable System Model: Steuerung braucht genug Varietät, um Wirklichkeit verarbeiten zu können.", related: ["viable-system-model", "wirkungsresilienz", "komplexitaetsmanagement", "kybernetik"] }),
  term({ id: "viabilitaet", title: "Viabilität", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Viabilität beschreibt die Überlebens- und Anpassungsfähigkeit eines Systems in einer veränderlichen Umwelt.", definition: "Ein viables System kann sich erhalten, lernen und an veränderte Umweltbedingungen anpassen.", woek: "Wirkungsökonomisch ist ein System nicht schon viabel, wenn es finanziell funktioniert. Es ist viabel, wenn es Mensch, Planet und Demokratie nicht zerstört.", related: ["viable-system-model", "wirkungsresilienz", "mensch-planet-demokratie"] }),
  term({ id: "viable-system-model", title: "Viable System Model", category: "Systemtheorie, Kybernetik und Konstruktivismus", concept: "method", short: "Das Viable System Model beschreibt Organisationen als rekursive, lebensfähige Systeme mit operativen, koordinierenden, steuernden, strategischen und normativen Funktionen.", definition: "Das von Stafford Beer entwickelte Modell hilft, Organisationen nicht als Organigramm, sondern als lernfähige, rekursive Steuerungsarchitektur zu verstehen.", woek: "Anschlussmodell für Wirkungsarchitektur, Organisationen, Verwaltung, Wirkungsrat und lernende Institutionen.", related: ["stafford-beer", "rekursion", "varietaet", "viabilitaet", "wirkungsarchitektur"] }),
  term({ id: "effektivitaet", title: "Effektivität", category: "Management, Wirksamkeit und Organisation", short: "Effektivität bedeutet, die richtigen Dinge zu tun.", definition: "Effektivität fragt zuerst nach Richtung und Ziel. Eine Maßnahme kann sehr effizient sein und trotzdem am falschen Ziel arbeiten.", woek: "In der Wirkungsökonomie ist eine Maßnahme effektiv, wenn sie tatsächliche positive Zustandsveränderungen für Mensch, Planet und Demokratie ermöglicht.", related: ["effizienz", "effektivitaet-vs-effizienz", "wirksamkeit", "positive-netto-wirkung"], sourceGroup: "management" }),
  term({ id: "effizienz", title: "Effizienz", category: "Management, Wirksamkeit und Organisation", short: "Effizienz bedeutet, Dinge mit möglichst geringem Ressourceneinsatz zu tun.", definition: "Effizienz beschreibt das Verhältnis von Ergebnis und Ressourceneinsatz. Sie sagt noch nicht, ob das Ergebnis sinnvoll oder schädlich ist.", woek: "Effizienz ist nicht automatisch positiv. Effizienz ohne richtige Zielrichtung kann destruktive Systeme beschleunigen.", related: ["effektivitaet", "effektivitaet-vs-effizienz", "wirkungsgrad", "verlustleistung"], sourceGroup: "management" }),
  term({ id: "effektivitaet-vs-effizienz", title: "Effektivität vs. Effizienz", category: "Management, Wirksamkeit und Organisation", short: "Effektivität fragt nach dem richtigen Ziel; Effizienz fragt nach dem sparsamen Weg dorthin.", definition: "Der Unterschied schützt vor der Verwechslung von Zielrichtigkeit und Ressourcensparsamkeit.", woek: "Wirkungsökonomisch gilt: Erst Effektivität, dann Effizienz. Ein falsches Ziel effizient zu erreichen, erzeugt Verlustleistung.", related: ["effektivitaet", "effizienz", "verlustleistung", "wirkung"] , sourceGroup: "management"}),
  term({ id: "wirksamkeit", title: "Wirksamkeit", category: "Management, Wirksamkeit und Organisation", concept: "precision", short: "Wirksamkeit beschreibt die Fähigkeit, eine beabsichtigte Wirkung tatsächlich hervorzubringen.", definition: "Wirksamkeit liegt näher an Wirkung als Effizienz, bleibt aber auf eine beabsichtigte Wirkung bezogen.", woek: "Eine Maßnahme kann wirksam sein und trotzdem normativ schädlich wirken. Daher braucht sie den Referenzrahmen Mensch, Planet und Demokratie.", related: ["wirkung", "effektivitaet", "positive-netto-wirkung", "wirkungsanalyse"], sourceGroup: "management" }),
  term({ id: "management", title: "Management", category: "Management, Wirksamkeit und Organisation", short: "Management ist die Gestaltung, Steuerung und Rückkopplung von Organisationen und Prozessen.", definition: "Management verbindet Ziele, Ressourcen, Menschen, Strukturen, Entscheidungen und Lernen.", woek: "In der WÖk wird Management als Wirkungssteuerung verstanden: nicht nur Ressourcen planen, sondern Zustandsveränderungen gestalten.", related: ["wirksames-management", "systemorientiertes-management", "wirkungsarchitektur"], sourceGroup: "management" }),
  term({ id: "wirksames-management", title: "Wirksames Management", category: "Management, Wirksamkeit und Organisation", short: "Wirksames Management richtet Organisationen auf tatsächliche Problemlösung und Zustandsverbesserung aus.", definition: "Der Begriff schließt an Managementlehre an und fragt, ob Organisationen ihre Zwecke real erreichen.", woek: "In der WÖk wird wirksames Management an positiver Netto-Wirkung gemessen, nicht nur an Zielerreichung, Gewinn oder Effizienz.", related: ["management", "wirksamkeit", "effektivitaet", "positive-netto-wirkung"], sourceGroup: "management" }),
  term({ id: "kundennutzen", title: "Kundennutzen", category: "Management, Wirksamkeit und Organisation", short: "Kundennutzen beschreibt den Nutzen, den ein Produkt oder eine Dienstleistung für Kund:innen erzeugt.", definition: "Kundennutzen ist wichtig für Geschäftsmodelle, aber er erfasst nur einen Teil der Wirkung eines Angebots.", woek: "Kundennutzen ist nicht automatisch Wirkung. Tabak, SUVs oder manipulative Plattformen können Kundennutzen stiften und zugleich negative Wirkung erzeugen.", related: ["business-value", "impact-value", "value-proposition", "wirkungsempfaenger"], sourceGroup: "management" }),
  term({ id: "business-value", title: "Business Value", category: "Management, Wirksamkeit und Organisation", short: "Business Value beschreibt den wirtschaftlichen Wertbeitrag einer Maßnahme, eines Produkts oder Geschäftsmodells für ein Unternehmen.", definition: "Business Value umfasst Umsatz, Marge, Kostensenkung, Wachstum, Risiko- oder Marktposition aus Unternehmenssicht.", woek: "Business Value ist nicht identisch mit Wirkungswert. Er muss mit Impact Value und positiver Netto-Wirkung abgeglichen werden.", related: ["impact-value", "kundennutzen", "business-model", "positive-netto-wirkung"], sourceGroup: "management" }),
  term({ id: "impact-value", title: "Impact Value / Wirkungswert", category: "Management, Wirksamkeit und Organisation", concept: "precision", short: "Impact Value beschreibt den Wert einer Aktivität aus Sicht ihrer Wirkung auf Mensch, Planet und Demokratie.", definition: "Impact Value erweitert die Frage nach wirtschaftlichem Wert um reale Zustandsveränderungen und vermiedene Schäden.", woek: "Der Wirkungswert macht sichtbar, was Business Value nicht zwingend zeigt: ob ein Angebot positive Netto-Wirkung erzeugt.", aliases: ["Wirkungswert", "Impact Value"], related: ["business-value", "positive-netto-wirkung", "t-sroi"], sourceGroup: "management" }),
  term({ id: "gewinn-als-test", title: "Gewinn als Test", category: "Management, Wirksamkeit und Organisation", concept: "sourceLine", short: "Gewinn kann anzeigen, dass eine Lösung am Markt tragfähig ist, ist aber kein Beweis positiver Wirkung.", definition: "Der Gedanke schließt an Drucker an: Gewinn kann als Test wirtschaftlicher Tragfähigkeit verstanden werden.", woek: "In wirkungsblinden Märkten kann Gewinn auch aus Externalisierung entstehen. Gewinn ist erst dann belastbar, wenn Preise Wirkung abbilden.", related: ["business-value", "wirkungsblindheit", "wirkungsrueckkopplung"], sourceGroup: "management" }),
  term({ id: "st-galler-management-modell", title: "St. Galler Management-Modell", category: "Management, Wirksamkeit und Organisation", concept: "sourceLine", short: "Das St. Galler Management-Modell ist ein systemtheoretisch geprägter Bezugsrahmen für Organisationen, Umfeld und Managementdimensionen.", definition: "Es betrachtet Organisationen in Umweltsphären, Anspruchsgruppen, Prozessen und Managementebenen.", woek: "Anschlussbegriff für systemorientiertes Management, Anspruchsgruppen und integrierte Unternehmensführung.", related: ["systemorientiertes-management", "normatives-management", "strategisches-management", "operatives-management"], sourceGroup: "management" }),
  term({ id: "systemorientiertes-management", title: "Systemorientiertes Management", category: "Management, Wirksamkeit und Organisation", short: "Systemorientiertes Management betrachtet Organisationen als offene, vernetzte Systeme in Wechselwirkung mit Umwelt, Anspruchsgruppen und Prozessen.", definition: "Es ersetzt isolierte Steuerung durch Denken in Beziehungen, Dynamiken und Rückkopplungen.", woek: "Grundlage für Wirkungsmanagement und Wirkungsarchitektur.", related: ["st-galler-management-modell", "management", "wirkungsarchitektur"], sourceGroup: "management" }),
  term({ id: "normatives-management", title: "Normatives Management", category: "Management, Wirksamkeit und Organisation", short: "Normatives Management bezieht sich auf Sinn, Werte, Zweck, Legitimität und langfristige Orientierung einer Organisation.", definition: "Es fragt, wofür eine Organisation steht und welche Rolle sie gesellschaftlich einnimmt.", woek: "In der WÖk entspricht dies der Frage: Auf welchen Wirkungsrahmen richtet sich eine Organisation aus?", related: ["strategisches-management", "operatives-management", "mensch-planet-demokratie"], sourceGroup: "management" }),
  term({ id: "strategisches-management", title: "Strategisches Management", category: "Management, Wirksamkeit und Organisation", short: "Strategisches Management legt fest, wie eine Organisation ihre langfristigen Ziele unter Unsicherheit erreicht.", definition: "Strategie verbindet Richtung, Ressourcen, Wettbewerb, Umfeld und Handlungspfade.", woek: "In der WÖk wird Strategie zum Wirkungspfad: Wie erzeugt eine Organisation positive Netto-Wirkung?", related: ["normatives-management", "operatives-management", "wirkungspfad"], sourceGroup: "management" }),
  term({ id: "operatives-management", title: "Operatives Management", category: "Management, Wirksamkeit und Organisation", short: "Operatives Management steuert die konkrete Umsetzung von Aufgaben, Prozessen und Ressourcen.", definition: "Es übersetzt strategische Ziele in Alltag, Abläufe, Zuständigkeiten und Entscheidungen.", woek: "Operatives Management braucht Wirkungsdaten, Scorecards und Rückkopplung.", related: ["strategisches-management", "scorecard", "wirkungsdaten"], sourceGroup: "management" }),
  term({ id: "komplexitaetsmanagement", title: "Komplexitätsmanagement", category: "Management, Wirksamkeit und Organisation", short: "Komplexitätsmanagement beschreibt den Umgang mit vielen vernetzten, dynamischen und unsicheren Einflussfaktoren.", definition: "Komplexität entsteht, wenn viele Elemente sich wechselseitig beeinflussen und Ergebnisse nicht linear vorhersehbar sind.", woek: "Komplexität wird nicht durch bloße Vereinfachung gelöst, sondern durch Rückkopplung, Varietät, Lernfähigkeit und Wirkungsarchitektur.", related: ["varietaet", "rueckkopplung", "wirkungsarchitektur", "nichttriviales-system"], sourceGroup: "management" }),
  term({ id: "innovation", title: "Innovation", category: "Innovation, Evolution und Unternehmertum", short: "Innovation ist die erfolgreiche Durchsetzung einer neuen Problemlösung in einem sozialen, wirtschaftlichen oder technischen System.", definition: "Innovation ist mehr als Erfindung oder Neuheit. Sie wird erst relevant, wenn eine neue Lösung Anwendung, Diffusion und Systemwirkung entfaltet.", woek: "Innovation ist in der WÖk nur dann Fortschritt, wenn sie positive Netto-Wirkung erzeugt. Neuheit allein reicht nicht.", related: ["erfindung", "diffusion", "wirkungsinnovation", "positive-netto-wirkung"], sourceGroup: "innovation" }),
  term({ id: "erfindung", title: "Erfindung", category: "Innovation, Evolution und Unternehmertum", short: "Eine Erfindung ist eine neue technische, organisatorische oder konzeptionelle Möglichkeit, die noch nicht notwendigerweise wirksam verbreitet ist.", definition: "Erfindungen schaffen Optionen. Ob daraus Innovation wird, entscheidet sich an Anwendung, Akzeptanz, Diffusion und Wirkung.", woek: "Erfindung wird erst durch Anwendung, Diffusion und Wirkung zur Innovation.", related: ["innovation", "diffusion", "wirkungspotenzial"], sourceGroup: "innovation" }),
  term({ id: "diffusion", title: "Diffusion", category: "Innovation, Evolution und Unternehmertum", short: "Diffusion beschreibt die Verbreitung einer Innovation in Märkten, Organisationen oder Gesellschaften.", definition: "Diffusion hängt von Nutzen, Anschlussfähigkeit, Kosten, Normen, Netzwerken, Vertrauen und Infrastruktur ab.", woek: "Diffusion entscheidet, ob ein Wirkungspotenzial systemische Wirkung entfaltet.", related: ["innovation", "anschlussfaehigkeit", "transformationswirkung"], sourceGroup: "innovation" }),
  term({ id: "rekombination", title: "Rekombination / neue Kombination", category: "Innovation, Evolution und Unternehmertum", short: "Rekombination beschreibt die neue Kombination bestehender Ressourcen, Technologien, Kompetenzen, Märkte oder Organisationsformen.", definition: "Der Begriff schließt an Schumpeters neue Kombinationen an. Fortschritt entsteht oft nicht durch völlig Neues, sondern durch neue Kombinationen.", woek: "Rekombination wird zur Wirkungsinnovation, wenn sie mehr positive Netto-Wirkung bei weniger Verlustleistung erzeugt.", aliases: ["Neue Kombination", "neue Kombinationen"], related: ["unternehmerfunktion", "innovation", "wirkungsinnovation", "verlustleistung"], sourceGroup: "innovation" }),
  term({ id: "unternehmerfunktion", title: "Unternehmerfunktion", category: "Innovation, Evolution und Unternehmertum", short: "Die Unternehmerfunktion besteht darin, neue Kombinationen zu erkennen, durchzusetzen und neue Entwicklungspfade zu eröffnen.", definition: "Die Unternehmerfunktion ist nicht an eine bestimmte Person gebunden. Sie beschreibt eine Entwicklungsleistung im wirtschaftlichen System.", woek: "In der WÖk wird sie zur Wirkungsfunktion: Neue Kombinationen müssen bessere Zustände für Mensch, Planet und Demokratie erzeugen.", related: ["rekombination", "innovativer-unternehmer", "lernender-unternehmer"], sourceGroup: "innovation" }),
  term({ id: "schoepferische-zerstoerung", title: "Schöpferische Zerstörung", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Schöpferische Zerstörung bezeichnet den Prozess, in dem Innovation alte Strukturen verdrängt und neue hervorbringt.", definition: "Bei Schumpeter ist schöpferische Zerstörung ein Kernmoment kapitalistischer Entwicklung.", woek: "Nicht jede schöpferische Zerstörung ist Fortschritt. Wenn neue Strukturen Mensch, Planet oder Demokratie schwächen, ist sie wirkungsökonomisch negativ.", related: ["kreative-rekonstruktion", "innovation", "positive-netto-wirkung"], sourceGroup: "innovation" }),
  term({ id: "kreative-rekonstruktion", title: "Kreative Rekonstruktion", category: "Innovation, Evolution und Unternehmertum", concept: "core", short: "Kreative Rekonstruktion überführt Altes durch Dekonstruktion, Reinigung und neue Kombination in höhere Wirkung.", definition: "Kreative Rekonstruktion ist die WÖk-Weiterentwicklung der schöpferischen Zerstörung. Sie fragt, was erhalten, repariert, rekombiniert oder regeneriert werden kann.", woek: "Wichtig für Kreislaufwirtschaft, Sanierung, Remanufacturing, Materialbanken, Re-Use und Wirkungstransformation.", related: ["schoepferische-zerstoerung", "wirkungsinnovation", "kreislaufwirtschaft", "verlustleistung"], sourceGroup: "innovation" }),
  term({ id: "wirkungsinnovation", title: "Wirkungsinnovation", category: "Innovation, Evolution und Unternehmertum", concept: "core", short: "Wirkungsinnovation ist eine Innovation, die reale Zustände verbessert, Verlustleistung senkt, Resilienz erhöht und Mensch, Planet oder Demokratie stärkt.", definition: "Sie verbindet Innovation mit positiver Netto-Wirkung und prüft, ob Neues tatsächlich bessere Zustände erzeugt.", woek: "Wirkungsinnovation ist kein Etikett für jede nachhaltige Neuheit, sondern eine geprüfte Transformationsleistung.", related: ["innovation", "positive-netto-wirkung", "transformationswirkung", "kreative-rekonstruktion"], sourceGroup: "innovation" }),
  term({ id: "basisinnovation", title: "Basisinnovation", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Basisinnovationen sind grundlegende Neuerungen, die langfristige technologische, wirtschaftliche oder gesellschaftliche Entwicklungspfade verändern.", definition: "Der Begriff wird häufig in Verbindung mit langen Wellen wirtschaftlicher Entwicklung verwendet.", woek: "Relevant, wenn Basisinnovationen Transformationswellen positiver Netto-Wirkung auslösen.", related: ["kondratieff-zyklus", "transformationswelle", "wirkungsinnovation"], sourceGroup: "innovation" }),
  term({ id: "kondratieff-zyklus", title: "Kondratieff-Zyklus", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Kondratieff-Zyklen sind langfristige wirtschaftliche Entwicklungswellen, die mit technologischen und strukturellen Veränderungen verbunden werden.", definition: "Der Begriff dient als historisches Deutungsmuster für lange Wellen, nicht als deterministische Vorhersage.", woek: "In der WÖk werden Kondratieff-Zyklen vorsichtig als Bündel aus Technologie, Infrastruktur, Kapital, Kompetenzen, Institutionen und Akzeptanz gelesen.", related: ["basisinnovation", "transformationswelle", "innovation"], sourceGroup: "innovation", statusNote: "Nicht deterministisch verwenden." }),
  term({ id: "transformationswelle", title: "Transformationswelle", category: "Innovation, Evolution und Unternehmertum", concept: "precision", short: "Eine Transformationswelle ist eine längerfristige Veränderungsbewegung, in der Innovationen, Infrastrukturen, Institutionen und Verhaltensmuster zusammenwirken.", definition: "Transformationswellen entstehen nicht durch einen einzelnen Auslöser, sondern durch gekoppelte Entwicklungen.", woek: "Die Wirkungsökonomie versteht die nächste Transformationswelle als Übergang von Kapitalsteuerung zu Wirkungssteuerung.", related: ["transformationswirkung", "basisinnovation", "wirkungsinnovation"], sourceGroup: "innovation" }),
  term({ id: "lernender-unternehmer", title: "Lernender Unternehmer", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Der lernende Unternehmer entwickelt Kompetenz, Wahrnehmung, Risiko- und Wirkungsfähigkeit weiter.", definition: "Der Begriff schließt an Jochen Röpke an und beschreibt Unternehmertum als Lern- und Entwicklungsfähigkeit.", woek: "In der WÖk wird der lernende Unternehmer zum Wirkungsakteur: Er lernt, Wirkungen zu lesen und neue Kombinationen für bessere Zustände zu schaffen.", related: ["unternehmerisches-lernen", "unternehmerfunktion", "wirkungsinnovation"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "routineunternehmer", title: "Routineunternehmer / Homo oeconomicus", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Der Routineunternehmer handelt innerhalb gegebener Marktlogiken, optimiert Ressourcen und reproduziert bestehende Muster.", definition: "Routine kann stabilisieren und effizient machen, aber auch bestehende Pfade verfestigen.", woek: "Wichtig als Gegenpol zum lernenden und wirkungsorientierten Unternehmer.", aliases: ["Homo oeconomicus"], related: ["lernender-unternehmer", "arbitrageur", "innovativer-unternehmer"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "arbitrageur", title: "Arbitrageur", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Der Arbitrageur nutzt Preis-, Informations- oder Marktunterschiede aus und trägt dadurch zur Angleichung von Differenzen bei.", definition: "Arbitrage kann Märkte effizienter machen, aber sie erzeugt nicht automatisch bessere Zustände.", woek: "Relevant ist, ob Arbitrage reale Zustände verbessert oder nur Wert aus Differenzen abschöpft.", related: ["routineunternehmer", "business-value", "impact-value"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "innovativer-unternehmer", title: "Innovativer Unternehmer", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Der innovative Unternehmer setzt neue Kombinationen durch und eröffnet neue Märkte, Produkte, Prozesse oder Organisationsformen.", definition: "Der Begriff beschreibt die Durchsetzungsfunktion von Innovation.", woek: "In der WÖk ist Innovation nur dann positiv, wenn sie positive Netto-Wirkung erzeugt.", related: ["unternehmerfunktion", "rekombination", "wirkungsinnovation"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "evolutorischer-unternehmer", title: "Evolutorischer Unternehmer", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Der evolutorische Unternehmer entwickelt die Fähigkeit des Systems zur Selbstentwicklung und Erneuerung.", definition: "Der Begriff markiert Unternehmertum als Beitrag zur Evolution von Kompetenzen, Märkten und Strukturen.", woek: "Relevant für Transformation, Wirkungsinnovation und Systemerneuerung.", related: ["unternehmerisches-lernen", "wirkungsinnovation", "transformationswelle"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "unternehmerisches-lernen", title: "Unternehmerisches Lernen", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Unternehmerisches Lernen beschreibt die Entwicklung von Wahrnehmung, Kompetenz, Risiko- und Innovationsfähigkeit.", definition: "Es umfasst nicht nur Wissenserwerb, sondern Veränderung von Routinen, Entscheidungen und Möglichkeiten.", woek: "In der WÖk wird es zur Fähigkeit, Wirkung zu lesen und bessere Wirkungspfade zu erzeugen.", related: ["lernender-unternehmer", "lernebenen", "wirkungskompetenz"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "lernebenen", title: "Lernebenen", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", publicationStatus: "published", short: "Lernebenen unterscheiden unterschiedliche Tiefen des Lernens: Anpassung, Reflexion, Transformation und Entwicklung der eigenen Lernfähigkeit.", definition: "Als vorläufige Arbeitsstruktur unterscheidet die WÖk Anpassungslernen, Reflexionslernen, Transformationslernen und Selbstevolution. Die genaue Zuschreibung zu Röpke / Rassidakis bleibt quellenmäßig zu prüfen.", woek: "Hilfreich, um Wirkungskompetenz und unternehmerisches Lernen nicht nur als Wissen, sondern als Entwicklungsfähigkeit zu verstehen.", related: ["unternehmerisches-lernen", "lernender-unternehmer", "wirkungskompetenz"], sourceGroup: "innovation", reviewStatus: "needs_source_check", statusNote: "Die Viererstruktur ist als WÖk-Arbeitsstruktur markiert und nicht endgültig Röpke zugeschrieben." }),
  term({ id: "dao", title: "Dao / Tao", category: "Daoismus, Prozessdenken und Nicht-Erzwingen", concept: "sourceLine", short: "Dao bezeichnet im Daoismus den Weg oder Prozess, in dem sich Wirklichkeit entfaltet.", definition: "Der Begriff wird hier knapp als philosophische Bezugslinie für Prozessdenken und Eingebettetheit verwendet.", woek: "Nicht religiös ausbauen. Funktional relevant als Gegenbild zu Kontrolle gegen Systemlogiken.", aliases: ["Tao"], related: ["wu-wei", "prozessdenken", "selbstorganisation"], sourceGroup: "dao" }),
  term({ id: "wu-wei", title: "Wu Wei / Nicht-Erzwingen", category: "Daoismus, Prozessdenken und Nicht-Erzwingen", concept: "sourceLine", short: "Wu Wei bezeichnet ein Handeln ohne gewaltsames Erzwingen: Mitgehen mit Systemlogiken statt Kontrolle gegen sie.", definition: "Der Begriff beschreibt kein Nichtstun, sondern angemessenes, nicht übergriffiges Handeln im Prozess.", woek: "Relevant als Gegenbild zu technokratischer Steuerungsillusion. Die WÖk setzt auf Rückkopplung, Resonanz und Selbstorganisation.", aliases: ["Nicht-Erzwingen"], related: ["dao", "prozessdenken", "selbstorganisation", "rueckkopplung"], sourceGroup: "dao" }),
  term({ id: "nicht-dualitaet", title: "Nicht-Dualität", category: "Daoismus, Prozessdenken und Nicht-Erzwingen", concept: "sourceLine", short: "Nicht-Dualität beschreibt die Auflösung starrer Trennungen zwischen Subjekt und Objekt, Mensch und Natur, Innen und Außen.", definition: "Der Begriff wird vorsichtig als philosophischer Anschluss an Prozessdenken genutzt.", woek: "Relevant für die Einsicht, dass Mensch, Wirtschaft und Natur gekoppelte Wirkungsräume sind.", related: ["dao", "prozessdenken", "interdependenz", "wirkungsraum"], sourceGroup: "dao" }),
  term({ id: "prozessdenken", title: "Prozessdenken", category: "Daoismus, Prozessdenken und Nicht-Erzwingen", short: "Prozessdenken betrachtet Wirklichkeit nicht primär als Dinge, sondern als Beziehungen, Bewegungen und Veränderungen.", definition: "Es richtet Aufmerksamkeit auf Werden, Veränderung, Kopplung, Rhythmus und Rückwirkung.", woek: "Anschlussbegriff für Wirkung als Zustandsveränderung, strukturelles Driften, Rückkopplung und Wirkungsarchitektur.", related: ["wirkung", "strukturelles-driften", "rueckkopplung", "wirkungsarchitektur"], sourceGroup: "dao" }),
  term({ id: "klimawandel", title: "Klimawandel", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Klimawandel beschreibt langfristige Veränderungen des Klimasystems, insbesondere durch den menschengemachten Anstieg von Treibhausgasen.", definition: "Der Glossarbegriff ersetzt kein Klimawissenschaftslexikon. Er markiert Klimawandel als zentrales Wirkungsfeld ökologischer und sozialer Folgewirkungen.", woek: "Klimawandel ist ein Wirkungsfeld, in dem externalisierte Emissionen reale Zustandsveränderungen und Folgekosten erzeugen.", related: ["treibhausgasemissionen", "klimaschutz", "klimaanpassung", "klimafolgeschaeden"], sourceGroup: "climate" }),
  term({ id: "klimaschutz", title: "Klimaschutz / Mitigation", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Klimaschutz umfasst Maßnahmen zur Vermeidung, Reduktion oder Bindung von Treibhausgasemissionen.", definition: "Klimaschutz senkt Ursachen des Klimawandels, etwa durch weniger fossile Emissionen, Effizienz, erneuerbare Energien oder Senken.", woek: "Klimaschutz ist eine Wirkungsrichtung, die mit Produktwirkung, Preisen, Steuern, Kapital und Infrastruktur verbunden werden muss.", aliases: ["Mitigation"], related: ["treibhausgasemissionen", "co2e", "carbon-budget", "klimaanpassung"], sourceGroup: "climate" }),
  term({ id: "klimaanpassung", title: "Klimaanpassung / Adaptation", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Klimaanpassung umfasst Maßnahmen, die Systeme widerstandsfähiger gegenüber eingetretenen oder erwartbaren Klimafolgen machen.", definition: "Anpassung mindert Verwundbarkeit und Schäden, ersetzt aber nicht Klimaschutz.", woek: "Relevant für Resilienz, Infrastruktur, Gesundheit, Landwirtschaft, Wohnen, Kommunen und Versicherbarkeit.", aliases: ["Adaptation"], related: ["klimarisiko", "vulnerabilitaet", "anpassungskapazitaet", "wirkungsresilienz"], sourceGroup: "climate" }),
  term({ id: "klimafolgeschaeden", title: "Klimafolgeschäden / Loss and Damage", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Klimafolgeschäden sind Schäden und Verluste durch Klimawandelfolgen, die nicht oder nicht vollständig vermieden werden können.", definition: "Sie umfassen physische, soziale, ökologische und wirtschaftliche Folgen, etwa Ernteausfälle, Hitzeschäden, Infrastrukturverluste oder Gesundheitsbelastungen.", woek: "Klimafolgeschäden sind reale Folgewirkungen externalisierter Emissionen und zentrale Beispiele für Wirkung, die in heutigen Preisen nicht ausreichend sichtbar ist.", aliases: ["Loss and Damage"], related: ["folgewirkung", "klimarisiko", "treibhausgasemissionen", "externalisierung"], sourceGroup: "climate" }),
  term({ id: "klimarisiko", title: "Klimarisiko", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Klimarisiko beschreibt Risiken aus physischen Klimafolgen oder aus dem Übergang zu einer klimaneutralen Wirtschaft.", definition: "Dazu gehören physische Risiken, transitorische Risiken, Haftungsrisiken und Transformationsrisiken.", woek: "Klimarisiko verbindet ökologische Wirkung, Kapitalrisiko, Versicherung, Infrastruktur, Lieferketten und soziale Verwundbarkeit.", related: ["klimafolgeschaeden", "vulnerabilitaet", "exposition", "anpassungskapazitaet"], sourceGroup: "climate" }),
  term({ id: "vulnerabilitaet", title: "Vulnerabilität", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Vulnerabilität beschreibt die Verwundbarkeit von Menschen, Ökosystemen, Infrastrukturen oder Institutionen gegenüber Risiken und Schäden.", definition: "Sie hängt von Sensitivität, Exposition und Anpassungskapazität ab.", woek: "Vulnerabilität macht sichtbar, dass dieselbe Belastung unterschiedliche Wirkungen erzeugen kann.", related: ["exposition", "anpassungskapazitaet", "klimarisiko", "wirkungsresilienz"], sourceGroup: "climate" }),
  term({ id: "exposition", title: "Exposition", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Exposition beschreibt, ob und in welchem Ausmaß Menschen, Systeme oder Werte einem Risiko ausgesetzt sind.", definition: "Ein System kann verwundbar sein, aber ohne Exposition tritt ein bestimmtes Risiko nicht ein.", woek: "Wichtig für Klimarisiko, Gesundheit, Wohnen, Infrastruktur und Lieferketten.", related: ["vulnerabilitaet", "klimarisiko", "anpassungskapazitaet"], sourceGroup: "climate" }),
  term({ id: "anpassungskapazitaet", title: "Anpassungskapazität", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Anpassungskapazität beschreibt die Fähigkeit eines Systems, auf Veränderungen zu reagieren und Schäden zu begrenzen.", definition: "Sie hängt von Ressourcen, Wissen, Infrastruktur, Institutionen, Vertrauen und Handlungsoptionen ab.", woek: "Eine zentrale Brücke zwischen Klimaanpassung, Wirkungsresilienz und gesellschaftlicher Stabilität.", related: ["klimaanpassung", "vulnerabilitaet", "wirkungsresilienz", "vertrauen"], sourceGroup: "climate" }),
  term({ id: "treibhausgasemissionen", title: "Treibhausgasemissionen", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Treibhausgasemissionen sind Freisetzungen klimawirksamer Gase wie CO2, Methan oder Lachgas.", definition: "Sie tragen je nach Gas und Zeitraum unterschiedlich zur Erwärmung bei und werden häufig als CO2-Äquivalente berichtet.", woek: "Treibhausgasemissionen sind messbare ökologische Wirkungstreiber, aber nicht die gesamte Produkt- oder Unternehmenswirkung.", related: ["co2e", "global-warming-potential", "emissionsfaktor", "scope-1-2-3"], sourceGroup: "climate" }),
  term({ id: "co2e", title: "CO2e / CO2-Äquivalent", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "CO2e macht verschiedene Treibhausgase über ihr Erwärmungspotenzial vergleichbar.", definition: "CO2-Äquivalente übersetzen Klimawirkungen verschiedener Gase in eine gemeinsame Einheit.", woek: "Wichtig für Product Carbon Footprint, Scope-Bilanzen, LCA und Produktwirkungssteuer.", aliases: ["CO2-Äquivalent", "CO2e"], related: ["global-warming-potential", "treibhausgasemissionen", "product-carbon-footprint"], sourceGroup: "climate" }),
  term({ id: "global-warming-potential", title: "Global Warming Potential / GWP", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Global Warming Potential beschreibt das Erwärmungspotenzial eines Treibhausgases im Vergleich zu CO2 über einen festgelegten Zeitraum.", definition: "GWP wird genutzt, um unterschiedliche Treibhausgase in CO2-Äquivalente umzurechnen.", woek: "Methodische Grundlage für Klimabilanzierung, Product Carbon Footprint und Lebenszyklusanalyse.", aliases: ["GWP"], related: ["co2e", "treibhausgasemissionen", "product-carbon-footprint"], sourceGroup: "climate" }),
  term({ id: "emissionsfaktor", title: "Emissionsfaktor", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Ein Emissionsfaktor beschreibt, wie viele Emissionen pro Einheit Aktivität, Energie, Material oder Produkt entstehen.", definition: "Emissionsfaktoren übersetzen Aktivitätsdaten in Emissionswerte.", woek: "Sie sind zentrale Datenbausteine, aber ihre Qualität, Systemgrenze und Aktualität bestimmen die Aussagekraft.", related: ["treibhausgasemissionen", "product-carbon-footprint", "lebenszyklusanalyse", "datenqualitaet"], sourceGroup: "climate" }),
  term({ id: "carbon-budget", title: "Carbon Budget", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Ein Carbon Budget beschreibt die verbleibende Menge an Treibhausgasemissionen, die mit einem Temperaturziel vereinbar ist.", definition: "Carbon Budgets machen Klimagrenzen als mengenmäßige Restriktion sichtbar.", woek: "Relevant für Wirkungsgrenzen, Investitionen, Infrastruktur, Produktpolitik und Transformationspfade.", related: ["klimaschutz", "treibhausgasemissionen", "wirkungsgrenze"], sourceGroup: "climate" }),
  term({ id: "scope-1-2-3", title: "Scope 1, Scope 2, Scope 3", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Scope 1, 2 und 3 unterscheiden direkte Emissionen, energiebezogene indirekte Emissionen und weitere indirekte Emissionen entlang der Wertschöpfungskette.", definition: "Die Scope-Logik strukturiert Unternehmensbilanzierung von Treibhausgasemissionen.", woek: "Wichtig, weil viele Wirkungen nicht im eigenen Betrieb, sondern in Energiebezug, Lieferketten, Nutzung und Entsorgung entstehen.", related: ["treibhausgasemissionen", "product-carbon-footprint", "lieferkette", "systemgrenze"], sourceGroup: "climate" }),
  term({ id: "product-carbon-footprint", title: "Product Carbon Footprint / PCF", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Der Product Carbon Footprint beschreibt die Treibhausgasemissionen eines Produkts entlang einer definierten Systemgrenze.", definition: "Ein PCF kann je nach Methode unterschiedliche Lebenszyklusphasen umfassen, etwa Cradle-to-Gate oder Cradle-to-Grave.", woek: "Wichtig für Produktwirkung, Scorecards, Digitalen Produktpass und Produktwirkungssteuer. PCF ist aber nur Klimawirkung, nicht Gesamtwirkung.", aliases: ["PCF"], related: ["lebenszyklusanalyse", "co2e", "systemgrenze", "scorecard"], sourceGroup: "climate" }),
  term({ id: "lebenszyklusanalyse", title: "Lebenszyklusanalyse / LCA", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Lebenszyklusanalyse bewertet potenzielle Umweltwirkungen eines Produktsystems über seinen Lebensweg.", definition: "LCA betrachtet Eingaben, Ausgaben und Umweltwirkungen über definierte Lebenszyklusphasen und Systemgrenzen.", woek: "In der WÖk wird LCA mit Scorecards, WÖk-IDs, Digitalem Produktpass, Reverse Merit Order und Produktwirkungssteuer verknüpft.", aliases: ["LCA", "Life Cycle Assessment"], related: ["lebenszyklusinventar", "lebenszykluswirkungsabschaetzung", "systemgrenze", "product-carbon-footprint"], sourceGroup: "climate" }),
  term({ id: "lebenszyklusinventar", title: "Lebenszyklusinventar / LCI", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Das Lebenszyklusinventar erfasst Eingaben und Ausgaben eines Produktsystems innerhalb definierter Systemgrenzen.", definition: "LCI ist die Datengrundlage der Lebenszyklusanalyse.", woek: "Ohne belastbares Inventar bleiben Scorecards, PCF und Produktwirkungssteuer unsicher.", aliases: ["LCI"], related: ["lebenszyklusanalyse", "lebenszykluswirkungsabschaetzung", "datenqualitaet"], sourceGroup: "climate" }),
  term({ id: "lebenszykluswirkungsabschaetzung", title: "Lebenszykluswirkungsabschätzung / LCIA", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Lebenszykluswirkungsabschätzung übersetzt Inventardaten in potenzielle Umweltwirkungen.", definition: "LCIA ordnet Emissionen und Ressourcenflüsse Wirkungskategorien zu, etwa Klimawirkung, Versauerung oder Ressourcenverbrauch.", woek: "Sie ist Brücke zwischen Daten und Wirkungsbewertung, ersetzt aber keine vollständige WÖk-Scorecard.", aliases: ["LCIA"], related: ["lebenszyklusanalyse", "lebenszyklusinventar", "scorecard"], sourceGroup: "climate" }),
  term({ id: "cradle-to-gate", title: "Cradle-to-Gate", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Cradle-to-Gate betrachtet Umweltwirkungen von Rohstoffgewinnung bis zum Werkstor.", definition: "Nutzung und End-of-Life liegen bei dieser Systemgrenze außerhalb der Betrachtung.", woek: "Wichtig, um PCF- und LCA-Ergebnisse nicht mit vollständiger Produktwirkung zu verwechseln.", related: ["cradle-to-grave", "lebenszyklusanalyse", "systemgrenze"], sourceGroup: "climate" }),
  term({ id: "cradle-to-grave", title: "Cradle-to-Grave", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Cradle-to-Grave betrachtet Umweltwirkungen von Rohstoffgewinnung über Nutzung bis Entsorgung.", definition: "Diese Systemgrenze umfasst den gesamten Lebensweg bis zum Lebensende.", woek: "Wichtig für Produktwirkung, Rebound, Reparatur, Kreislaufwirtschaft und Entsorgung.", related: ["cradle-to-gate", "cradle-to-cradle", "lebenszyklusanalyse", "produktlebenszyklus"], sourceGroup: "climate" }),
  term({ id: "cradle-to-cradle", title: "Cradle to Cradle", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Cradle to Cradle beschreibt ein Design- und Zertifizierungsprinzip, bei dem Materialien in sicheren biologischen oder technischen Kreisläufen geführt werden.", definition: "Der Ansatz zielt darauf, Abfall als Designfehler zu vermeiden und Materialien für Kreisläufe zu gestalten.", woek: "Anschlussbegriff für Kreislaufwirtschaft, Produktwirkung, kreative Rekonstruktion und Reverse Merit Order.", aliases: ["C2C"], related: ["kreislaufwirtschaft", "cradle-to-grave", "kreative-rekonstruktion"], sourceGroup: "climate" }),
  term({ id: "environmental-product-declaration", title: "Environmental Product Declaration / EPD", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Eine Environmental Product Declaration ist eine standardisierte Umweltproduktdeklaration auf Basis von Lebenszyklusdaten.", definition: "EPDs machen Umweltinformationen für Produkte vergleichbarer, besonders im Bau- und Produktkontext.", woek: "EPDs können Datenquellen für Scorecards, Produktpässe und Produktwirkungssteuer sein.", aliases: ["EPD"], related: ["lebenszyklusanalyse", "product-environmental-footprint", "digitaler-produktpass"], sourceGroup: "climate" }),
  term({ id: "product-environmental-footprint", title: "Product Environmental Footprint / PEF", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Der Product Environmental Footprint ist ein EU-Ansatz zur Bewertung der Umweltleistung von Produkten über den Lebenszyklus.", definition: "PEF soll Produktumweltinformationen methodisch stärker vergleichbar machen.", woek: "Anschluss an Produktwirkung, Scorecards, Digitalen Produktpass und europäische Datenlogiken.", aliases: ["PEF"], related: ["organisation-environmental-footprint", "lebenszyklusanalyse", "scorecard"], sourceGroup: "climate" }),
  term({ id: "organisation-environmental-footprint", title: "Organisation Environmental Footprint / OEF", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Der Organisation Environmental Footprint ist ein EU-Ansatz zur Bewertung der Umweltleistung von Organisationen.", definition: "OEF ergänzt produktbezogene Ansätze um organisationsbezogene Umweltwirkung.", woek: "Anschluss an Unternehmenswirkung, Reporting, Wirkungsdaten und Scorecards.", aliases: ["OEF"], related: ["product-environmental-footprint", "wirkungsdaten", "scorecard"], sourceGroup: "climate" }),
  term({ id: "well-to-tank", title: "Well-to-Tank", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Well-to-Tank betrachtet Energie- und Emissionswirkungen von der Gewinnung oder Erzeugung eines Energieträgers bis zur Bereitstellung am Fahrzeug.", definition: "Der Begriff grenzt die Vorkette der Energiebereitstellung ab.", woek: "Wichtig für Mobilität, Energie, Fahrzeugvergleich und Klimawirkung.", aliases: ["WTT"], related: ["tank-to-wheel", "well-to-wheel", "systemgrenze"], sourceGroup: "climate" }),
  term({ id: "tank-to-wheel", title: "Tank-to-Wheel", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Tank-to-Wheel betrachtet Energie- und Emissionswirkungen während der Nutzung im Fahrzeug.", definition: "Der Begriff fokussiert die Nutzungsphase im Fahrzeug und blendet Vorketten aus.", woek: "Nur zusammen mit Well-to-Tank und Well-to-Wheel vollständig für Fahrzeug- und Energiewirkung einzuordnen.", aliases: ["TTW"], related: ["well-to-tank", "well-to-wheel", "systemgrenze"], sourceGroup: "climate" }),
  term({ id: "well-to-wheel", title: "Well-to-Wheel", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Well-to-Wheel verbindet Well-to-Tank und Tank-to-Wheel und betrachtet den Pfad von Energiebereitstellung bis Nutzung.", definition: "WTW ist eine wichtige Systemgrenze für Mobilitäts- und Energievergleiche.", woek: "Wichtig für Mobilität, Energie, Fahrzeugvergleich, Wirkungssteuer, Produktwirkung und Klimafolgen.", aliases: ["WTW"], related: ["well-to-tank", "tank-to-wheel", "product-carbon-footprint"], sourceGroup: "climate" }),
  term({ id: "design-thinking", title: "Design Thinking", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Design Thinking ist ein menschenzentrierter, iterativer Ansatz zur Lösung komplexer Probleme.", definition: "Design Thinking arbeitet häufig mit Verstehen, Beobachten, Ideenentwicklung, Modellentwicklung und Testen.", woek: "Anschlussfähig, aber nicht ausreichend. Die WÖk ergänzt Desirability, Feasibility und Viability um positive Netto-Wirkung.", related: ["persona", "value-proposition", "impact-fit", "minimum-viable-impact"], sourceGroup: "design" }),
  term({ id: "persona", title: "Persona", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Eine Persona ist ein modelliertes Nutzer:innenprofil, das Bedürfnisse, Verhalten, Ziele und Kontext einer Zielgruppe greifbar macht.", definition: "Personas helfen, Nutzer:innen nicht abstrakt zu behandeln. Sie bleiben Modelle und dürfen reale Vielfalt nicht ersetzen.", woek: "Personas verbessern Anschlussfähigkeit, dürfen Wirkungsempfänger aber nicht auf Kund:innen reduzieren. Auch Nicht-Kund:innen, zukünftige Generationen, Ökosysteme und Institutionen zählen.", related: ["design-thinking", "wirkungsempfaenger", "value-proposition"], sourceGroup: "design" }),
  term({ id: "jobs-to-be-done", title: "Jobs-to-be-Done", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Jobs-to-be-Done beschreibt, welche Aufgabe oder welches Ziel Nutzer:innen mit einem Produkt oder einer Dienstleistung erreichen wollen.", definition: "Der Ansatz fragt nach dem Fortschritt, den Nutzer:innen in einer Situation erreichen wollen.", woek: "Nützlich für Kundennutzen, aber Kundenziel ist nicht automatisch Wirkungsziel.", related: ["kundennutzen", "value-proposition", "impact-fit"], sourceGroup: "design" }),
  term({ id: "value-proposition", title: "Value Proposition", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Eine Value Proposition beschreibt, welchen Nutzen ein Angebot für eine Zielgruppe verspricht.", definition: "Sie verbindet Zielgruppe, Nutzenversprechen, Probleme und Differenzierung.", woek: "Ein Wertversprechen muss auch Wirkung auf Nicht-Kund:innen, Lieferketten, Umwelt und Demokratie berücksichtigen.", aliases: ["Wertversprechen"], related: ["value-proposition-canvas", "kundennutzen", "impact-fit"], sourceGroup: "design" }),
  term({ id: "value-proposition-canvas", title: "Value Proposition Canvas", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Das Value Proposition Canvas ist ein Werkzeug zur Abstimmung von Kund:innenprofil und Wertangebot.", definition: "Es strukturiert Jobs, Pains, Gains, Pain Relievers und Gain Creators.", woek: "WÖk-Erweiterung: Pain Relievers und Gain Creators müssen um Wirkungsrisiken, externe Kosten und Wirkungsempfänger erweitert werden.", related: ["value-proposition", "business-model-canvas", "impact-fit"], sourceGroup: "design" }),
  term({ id: "business-model-canvas", title: "Business Model Canvas", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Das Business Model Canvas ist ein strategisches Werkzeug zur Beschreibung, Gestaltung und Prüfung von Geschäftsmodellen.", definition: "Es ordnet zentrale Elemente wie Partner, Aktivitäten, Ressourcen, Wertangebot, Kunden, Kanäle, Kosten und Erlöse.", woek: "Die WÖk ergänzt ein Wirkungsmodell: Welche Wirkung entsteht entlang von Ressourcen, Partnern, Wertangebot, Kund:innen, Kosten, Erlösen und Lieferketten?", related: ["business-model", "value-proposition-canvas", "impact-fit"], sourceGroup: "design" }),
  term({ id: "business-model", title: "Business Model", category: "Design, Geschäftsmodelle und Wertversprechen", short: "Ein Business Model beschreibt, wie eine Organisation Wert schafft, vermittelt und wirtschaftlich trägt.", definition: "Geschäftsmodelle verbinden Kundennutzen, Ressourcen, Aktivitäten, Erlöse, Kosten, Partner und Märkte.", woek: "Ein Geschäftsmodell ist wirkungsökonomisch zu prüfen: Welche Zustände erzeugt, stabilisiert oder beschädigt es?", aliases: ["Geschäftsmodell"], related: ["business-model-canvas", "business-value", "impact-value"], sourceGroup: "design" }),
  term({ id: "product-market-fit", title: "Product-Market Fit", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Product-Market Fit beschreibt, dass ein Produkt eine tragfähige Nachfrage in einem Markt trifft.", definition: "Der Begriff zeigt, ob ein Angebot für Kund:innen und Markt attraktiv genug ist.", woek: "Product-Market Fit ist nicht gleich Impact Fit. Ein Produkt kann perfekt zum Markt passen und negative Wirkung erzeugen.", related: ["impact-fit", "kundennutzen", "business-value"], sourceGroup: "design" }),
  term({ id: "impact-fit", title: "Impact Fit", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "core", short: "Impact Fit beschreibt, ob ein Produkt, eine Dienstleistung oder ein Geschäftsmodell positive Netto-Wirkung im relevanten Wirkungsraum entfaltet.", definition: "Impact Fit ergänzt Product-Market Fit um die Frage, ob ein Angebot nicht nur Nachfrage erzeugt, sondern die richtigen Zustände verbessert.", woek: "WÖk-Prägungsbegriff für Geschäftsmodell- und Produktentwicklung nach Wirkung.", related: ["product-market-fit", "positive-netto-wirkung", "wirkungsraum", "wirkungsempfaenger"], sourceGroup: "design" }),
  term({ id: "minimum-viable-impact", title: "Minimum Viable Impact / MVI", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "core", publicationStatus: "article_only", short: "Minimum Viable Impact bezeichnet die kleinste überprüfbare positive Wirkung, die ein Produkt, Projekt oder Geschäftsmodell vor Skalierung nachweisen muss.", definition: "Der Begriff bleibt vorerst im Backlog, bis er in WÖk-Artikeln und Methoden häufiger verwendet wird.", woek: "Als WÖk-Prägungsbegriff vorgemerkt, aber noch nicht allgemein publiziert.", aliases: ["MVI"], related: ["impact-fit", "minimum-viable-product", "positive-netto-wirkung"], sourceGroup: "design", reviewStatus: "article_context_only" }),
  term({ id: "wirkungsgrad", title: "Wirkungsgrad", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Der Wirkungsgrad beschreibt das Verhältnis von nutzbarer Leistung oder Wirkung zum eingesetzten Aufwand.", definition: "In Technik und Physik beschreibt der Wirkungsgrad Effizienz einer Umwandlung.", woek: "Übertragen gefragt: Wie viel positive Zustandsveränderung entsteht im Verhältnis zu Ressourcen, Zeit, Kapital oder Energie?", related: ["effizienz", "wirkleistung", "verlustleistung"] }),
  term({ id: "wirkleistung", title: "Wirkleistung", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Wirkleistung ist in der Elektrotechnik die nutzbare Leistung, die tatsächlich Arbeit verrichtet.", definition: "Als technischer Begriff bezeichnet sie den Anteil der Leistung, der reale Arbeit leistet.", woek: "Als Metapher: gesellschaftliche Leistung, die reale positive Zustandsveränderung erzeugt oder negative verhindert.", related: ["scheinleistung", "blindleistung", "verlustleistung", "wirkung"] }),
  term({ id: "scheinleistung", title: "Scheinleistung", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Scheinleistung ist in der Elektrotechnik die scheinbar vorhandene Gesamtleistung im System.", definition: "Als technischer Begriff verbindet sie Wirk- und Blindanteile.", woek: "Als WÖk-Metapher: Aktivität, Umsatz, Reichweite oder Aufwand, der nach Leistung aussieht, aber keine positive Wirkung erzeugen muss.", related: ["wirkleistung", "blindleistung", "verlustleistung", "wirkungsblindheit"] }),
  term({ id: "blindleistung", title: "Blindleistung", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Blindleistung pendelt im System, belastet es, verrichtet aber keine nutzbare Arbeit.", definition: "In der Elektrotechnik ist Blindleistung für bestimmte Systeme relevant, erzeugt aber keine nutzbare Arbeit.", woek: "Als Metapher: bürokratische, ökonomische oder mediale Aktivität, die Systeme belastet, aber keine positive Netto-Wirkung erzeugt.", related: ["scheinleistung", "wirkleistung", "verlustleistung"] }),
  term({ id: "verlustleistung", title: "Verlustleistung", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Verlustleistung beschreibt Leistung, die als Reibung, Wärme, Schaden oder unnötiger Aufwand verloren geht.", definition: "Technisch ist Verlustleistung nicht nutzbar. Übertragen beschreibt sie Ressourcenverbrauch ohne gewünschte Zustandsverbesserung.", woek: "Wichtig für Reparaturkosten, Klimafolgeschäden, Bürokratie, schlechte Produkte, destruktive Medienwirkung und falsche Anreize.", related: ["effizienz", "effektivitaet-vs-effizienz", "blindleistung", "klimafolgeschaeden"] }),
  term({ id: "systemgrenze", title: "Systemgrenze", category: "Physik, Energie und Wirkungsmetaphern", concept: "method", short: "Eine Systemgrenze legt fest, was in einer Analyse berücksichtigt wird und was außerhalb bleibt.", definition: "Systemgrenzen entscheiden, welche Eingaben, Ausgaben, Wirkungen, Akteure, Zeiten und Orte in einer Bewertung sichtbar werden.", woek: "Zentral für LCA, T-SROI, Scorecards, Wirkungsanalyse und Folgencheck.", related: ["bilanzraum", "lebenszyklusanalyse", "t-sroi", "scorecard"] }),
  term({ id: "bilanzraum", title: "Bilanzraum", category: "Physik, Energie und Wirkungsmetaphern", concept: "method", short: "Der Bilanzraum beschreibt den Bereich, innerhalb dessen Wirkungen, Eingaben und Ausgaben erfasst werden.", definition: "Er macht transparent, welche räumlichen, zeitlichen und sachlichen Grenzen eine Bilanz hat.", woek: "Wichtig für Wirkungsanalyse, Produktwirkung, Klimabilanzierung und öffentliche Haushalte.", related: ["systemgrenze", "wirkungshaushalt", "product-carbon-footprint"] }),
  term({ id: "entropie", title: "Entropie", category: "Physik, Energie und Wirkungsmetaphern", short: "Entropie beschreibt in der Physik ein Maß für Verteilung, Unordnung oder nicht mehr nutzbare Energie.", definition: "Der Begriff ist physikalisch präzise und darf metaphorisch nur vorsichtig verwendet werden.", woek: "Als begrenzte Metapher für Ordnungsverlust, Zerstreuung, Systemverschleiß oder steigende Reparaturkosten.", related: ["verlustleistung", "wirkungsresilienz", "systemgrenze"], statusNote: "Nicht als allgemeine Weltformel überdehnen." }),
  term({ id: "hebelpunkt", title: "Hebelpunkt", category: "Physik, Energie und Wirkungsmetaphern", short: "Ein Hebelpunkt ist ein Ort im System, an dem eine Veränderung besonders große Folgewirkungen erzeugen kann.", definition: "Der Begriff schließt an Donella Meadows an und hilft, nicht nur Symptome, sondern Systembedingungen zu verändern.", woek: "Wichtig für Wirkungslenkung, Wirkungsarchitektur und Transformationswirkung.", related: ["wirkungslenkung", "transformationswirkung", "rueckkopplung", "systemgrenze"] }),
  term({ id: "schwellenwert", title: "Schwellenwert", category: "Physik, Energie und Wirkungsmetaphern", short: "Ein Schwellenwert ist eine Grenze, ab der ein Zustand, Risiko oder Bewertungsfeld anders eingeordnet wird.", definition: "Schwellenwerte machen rote Linien, Kipppunkte, Mindestbedingungen oder Bewertungswechsel sichtbar.", woek: "Relevant für Reverse Merit Order, Wirkungsgrenzen, Klimarisiken und Scorecards.", related: ["kipppunkt", "wirkungsgrenze", "reverse-merit-order", "scorecard"] }),
  term({ id: "resonanz", title: "Resonanz", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Resonanz beschreibt die Verstärkung eines Impulses, wenn er auf ein aufnahmefähiges System trifft.", definition: "Physikalisch ist Resonanz an Schwingungen gebunden. Sozial wird der Begriff als Metapher für Aufnahme, Verstärkung oder Rückwirkung genutzt.", woek: "Grundlage für Resonanzräume, Medienwirkung, Narrative und Anschlussfähigkeit.", related: ["resonanzraum", "anschlussfaehigkeit", "salienz", "narrativ"] }),
  term({ id: "folgewirkung", title: "Folgewirkung", category: "WÖk-Begriff", concept: "core", short: "Folgewirkung ist eine indirekte, zeitversetzte oder aus erster Wirkung hervorgehende Wirkung.", definition: "Folgewirkungen entstehen, wenn eine erste Zustandsveränderung weitere Veränderungen auslöst, verstärkt oder verschiebt.", woek: "Der Begriff hilft, Wirkung nicht nur unmittelbar und linear zu denken, sondern in Wirkungspfaden und Rückkopplungen.", related: ["wirkung", "wirkungspfad", "rueckkopplung", "klimafolgeschaeden"] }),
  term({ id: "glossar-publizierungsprozess", title: "Glossar-Publizierungsprozess", category: "Glossar-Publizierungsprozess", concept: "method", short: "Der Glossar-Publizierungsprozess regelt, wie neue Begriffe geprüft, eingeordnet, verlinkt, belegt und veröffentlicht werden.", definition: "Er umfasst Artikel-Scan, Kandidatenprüfung, Quellenlogik, Statusvergabe, Related-Terms, Backlink-Audit, Suchindex, Sitemap und Linkprüfung.", woek: "Sichert, dass externe Anschlussbegriffe nicht vereinnahmt werden und WÖk-Kernbegriffe konsistent bleiben.", related: ["glossar-backlink-audit", "wirkung", "wirkungspotenzial", "wirkungsrisiko"] }),
  term({ id: "glossar-backlink-audit", title: "Glossar-Backlink-Audit", category: "Glossar-Publizierungsprozess", concept: "method", short: "Das Glossar-Backlink-Audit prüft, wo neue Begriffe im bestehenden Content vorkommen und welche internen Verknüpfungen sinnvoll sind.", definition: "Es verhindert Link-Wüsten und hilft, pro Seite nur fachlich zentrale Nennungen zu verknüpfen.", woek: "Macht den Übergang von Begriffspflege zu Website-Wirkung nachvollziehbar.", related: ["glossar-publizierungsprozess", "anschlussfaehigkeit", "resonanzraum"] }),
];

const CAT_THINKERS = "Vordenker:innen und Bezugslinien";
const CAT_VALUES = "Werte, Normativität und Bewertung";
const CAT_CAPITAL = "Kapital, Markt und Eigentum";
const CAT_LANGUAGE = "Sprache, Wirklichkeit und Kommunikation";
const CAT_ETHICS = "Ethik, Würde und Verantwortung";
const CAT_SYSTEMS = "Systemtheorie, Konstruktivismus und Kybernetik";
const CAT_MANAGEMENT2 = "Management, Organisation und Wirksamkeit";
const CAT_TRANSFORMATION = "Transformation, Innovation und wirtschaftliche Entwicklung";

function thinker({ id, title, short, idea, woek, correction, related = [], sourceGroup = "capital", aliases = [], reviewStatus = "approved" }) {
  return term({
    id,
    title,
    category: CAT_THINKERS,
    concept: "thinker",
    short,
    definition: `${idea} WÖk-Korrektur / Abgrenzung: ${correction}`,
    woek,
    aliases,
    related,
    sourceGroup,
    reviewStatus,
    usage: "Als Bezugslinie verwenden, nicht als Autoritätsbeweis oder biografischen Lexikoneintrag.",
  });
}

const controlledClusterAdditions = [
  term({
    id: "sechster-kondratieff",
    title: "6. Kondratieff",
    category: CAT_TRANSFORMATION,
    concept: "precision",
    short: "Der 6. Kondratieff beschreibt in der Wirkungsökonomie die Transformationswelle des 21. Jahrhunderts, in der Nachhaltigkeit, Resilienz, Gesundheit und Wirkung zur zentralen Entwicklungslogik werden.",
    definition: "Der 6. Kondratieff ist in der WÖk ein Deutungsmuster für eine langfristige wirtschaftliche und gesellschaftliche Transformationswelle. Die Leitlogik verschiebt sich von Kapital- und Ressourcenoptimierung zu Wirkung, Resilienz, Gesundheit, SDGs, SDG+, Kreislaufwirtschaft, digitalen Wirkungsdaten, demokratischer Stabilität und systemischer Zukunftsfähigkeit.",
    woek: "Die Wirkungsökonomie versteht den 6. Kondratieff als Übergang von der Effizienzlogik zur Wirkungslogik: Wie erzeugen wir mit vorhandenen Ressourcen die größte positive Netto-Wirkung für Mensch, Planet und Demokratie? Er beschreibt Wirkung maximieren und Impact-Intensität als makroökonomische Leitfrage, aber kein Prognosegesetz.",
    aliases: ["6. Kondratieff", "sechster Kondratieff", "sechste lange Welle", "sechste Kondratieff-Welle", "Sixth Kondratieff"],
    related: ["kondratieff-zyklus", "transformationswelle", "wirkungsinnovation", "wirkungskapital", "wirkungsoekonomie", "nachhaltigkeit", "resilienz", "gesundheit", "sdgs", "sdg-plus", "t-sroi", "kreislaufwirtschaft", "wirkungsarchitektur", "wirkungsresilienz", "positive-netto-wirkung"],
    sourceGroup: "innovation",
    statusNote: "Nicht deterministisch formulieren; Deutungsmodell, keine naturgesetzliche Vorhersage.",
  }),
  term({
    id: "thg-emissions-scopes",
    title: "THG-Emissions-Scopes",
    category: "Klima, Lebenszyklus und ökologische Wirkung",
    concept: "method",
    short: "THG-Emissions-Scopes unterscheiden Emissionen danach, ob sie direkt entstehen, aus eingekaufter Energie stammen oder entlang der Wertschöpfungskette auftreten.",
    definition: "Die Emissions-Scopes des GHG Protocols strukturieren betriebliche Treibhausgasemissionen in Scope 1, Scope 2 und Scope 3: direkte Emissionen aus eigenen oder kontrollierten Quellen, indirekte Emissionen aus eingekaufter Energie und weitere indirekte Emissionen entlang der vor- und nachgelagerten Wertschöpfungskette.",
    woek: "Die Scopes sind zentrale Anschlussbegriffe für Wirkungsdaten, Klimabilanzierung, Produktwirkung, Lieferkettenwirkung, Wirkungskapital und Produktwirkungssteuer.",
    aliases: ["Scope 1, 2 und 3", "Emissionsscopes", "GHG Scopes", "Greenhouse Gas Scopes"],
    related: ["scope-1", "scope-2", "scope-3", "treibhausgasemissionen", "co2e", "product-carbon-footprint", "lebenszyklusanalyse", "lieferkette", "scope-3-datenqualitaet", "woek-id", "csrd", "esrs-e1", "ghg-protocol", "klimawirkung"],
    sourceGroup: "scope",
  }),
  term({
    id: "scope-1",
    title: "Scope 1",
    category: "Klima, Lebenszyklus und ökologische Wirkung",
    concept: "method",
    short: "Scope 1 umfasst direkte Treibhausgasemissionen aus Quellen, die ein Unternehmen besitzt oder kontrolliert.",
    definition: "Scope-1-Emissionen entstehen direkt durch Tätigkeiten eines Unternehmens, etwa durch eigene Heizkessel, Öfen, Produktionsanlagen, Unternehmensfahrzeuge, Prozess-Emissionen oder Kältemittelverluste.",
    woek: "Scope 1 ist ein zentraler Indikator für direkte Klimawirkung und operative Verantwortung. Scope-1-Daten können in WÖk-IDs, Scorecards, Produktwirkungssteuer, Unternehmenswirkung und T-SROI einfließen, zeigen aber nicht die gesamte Klimawirkung.",
    aliases: ["Scope-1-Emissionen", "direkte Emissionen", "direkte THG-Emissionen"],
    examples: ["Dieselverbrauch eigener Lkw", "Erdgasverbrennung in eigenen Heizkesseln", "Prozess-Emissionen in Chemie oder Zement", "Kältemittelverluste aus eigenen Anlagen"],
    related: ["thg-emissions-scopes", "scope-2", "scope-3", "treibhausgasemissionen", "co2e", "emissionsfaktor", "klimawirkung", "product-carbon-footprint", "woek-id", "esrs-e1"],
    sourceGroup: "scope",
  }),
  term({
    id: "scope-2",
    title: "Scope 2",
    category: "Klima, Lebenszyklus und ökologische Wirkung",
    concept: "method",
    short: "Scope 2 umfasst indirekte Treibhausgasemissionen aus eingekaufter Energie, insbesondere Strom, Dampf, Wärme oder Kühlung.",
    definition: "Scope-2-Emissionen entstehen bei der Erzeugung von Energie, die ein Unternehmen einkauft und verbraucht. Sie können location-based nach durchschnittlichem Standortmix oder market-based nach vertraglich eingekaufter Energie beziehungsweise Herkunftsnachweisen ausgewiesen werden.",
    woek: "Scope 2 zeigt, wie stark ein Unternehmen über seinen Energiebezug auf Klimawirkung einwirkt. Es ist zentral für erneuerbaren Strom, Energieeffizienz, Gebäude, Rechenzentren, Produktionsstandorte und Energiebeschaffung.",
    aliases: ["Scope-2-Emissionen", "indirekte Energieemissionen", "Emissionen aus eingekaufter Energie"],
    examples: ["Stromverbrauch in Produktionshallen", "Stromverbrauch in Bürogebäuden", "eingekaufte Fernwärme", "eingekaufter Dampf", "eingekaufte Kühlung"],
    related: ["thg-emissions-scopes", "scope-1", "scope-3", "erneuerbarer-strom", "energieeffizienz", "strommix", "herkunftsnachweis-hkn", "product-carbon-footprint", "esrs-e1"],
    sourceGroup: "scope",
  }),
  term({
    id: "scope-3",
    title: "Scope 3",
    category: "Klima, Lebenszyklus und ökologische Wirkung",
    concept: "method",
    short: "Scope 3 umfasst weitere indirekte Treibhausgasemissionen entlang der vor- und nachgelagerten Wertschöpfungskette eines Unternehmens.",
    definition: "Scope-3-Emissionen entstehen durch Aktivitäten, die mit dem Unternehmen verbunden sind, aber nicht direkt von ihm kontrolliert werden und nicht unter Scope 2 fallen: eingekaufte Waren, Kapitalgüter, Transporte, Geschäftsreisen, Pendeln, Abfall, Nutzung verkaufter Produkte, Weiterverarbeitung, End-of-Life, Investitionen, Franchise- oder Leasingaktivitäten.",
    woek: "Scope 3 ist besonders wichtig, weil viele ökologische und soziale Wirkungen in Lieferketten, Produktnutzung und Entsorgung entstehen. Ohne Scope 3 bleibt Klimawirkung oft dort unsichtbar, wo sie tatsächlich entsteht.",
    aliases: ["Scope-3-Emissionen", "Wertschöpfungskettenemissionen", "Lieferkettenemissionen", "indirekte Wertschöpfungskettenemissionen"],
    examples: ["eingekaufte Rohstoffe und Vorprodukte", "Lieferantentransporte", "Geschäftsreisen", "Nutzung verkaufter Produkte", "End-of-Life-Behandlung verkaufter Produkte"],
    related: ["thg-emissions-scopes", "scope-1", "scope-2", "scope-3-datenqualitaet", "lieferkette", "digitaler-produktpass", "product-carbon-footprint", "lebenszyklusanalyse", "woek-id", "reverse-merit-order", "produktwirkungssteuer", "externalisierung", "greenwashing", "wirkungsblindheit"],
    sourceGroup: "scope",
  }),
  term({
    id: "scope-3-datenqualitaet",
    title: "Scope-3-Datenqualität",
    category: "Klima, Lebenszyklus und ökologische Wirkung",
    concept: "precision",
    short: "Scope-3-Datenqualität beschreibt, wie vollständig, belastbar, überprüfbar und differenziert indirekte Emissionsdaten entlang der Wertschöpfungskette sind.",
    definition: "Scope-3-Datenqualität bewertet Vollständigkeit, Primärdatenanteil, Lieferantenabdeckung, Kategorienabdeckung, Aktualität, Prüfbarkeit, Methodenkonsistenz und Transparenz über Unsicherheit.",
    woek: "Schlechte Scope-3-Daten sind selbst ein Wirkungsrisiko, weil sie Externalisierung unsichtbar halten. Fehlende Daten dürfen keinen Vorteil erzeugen.",
    aliases: ["Scope 3 Datenqualität", "Scope-3-Qualität", "Wertschöpfungsketten-Datenqualität", "Lieferketten-Datenqualität"],
    related: ["scope-3", "datenqualitaet", "wirkungsdaten", "lieferkette", "digitaler-produktpass", "woek-id", "product-carbon-footprint", "lebenszyklusanalyse", "wirkungsblindheit", "wirkungssimulation", "greenwashing"],
    sourceGroup: "scope",
  }),

  thinker({ id: "adam-smith", title: "Adam Smith", sourceGroup: "capital", short: "Adam Smith ist für die Wirkungsökonomie relevant, weil seine Markttheorie ursprünglich nicht ohne Moral, Sympathie, Gerechtigkeit und gesellschaftliche Ordnung gedacht war.", idea: "Smith zeigt Märkte als dezentrale Koordination, aber nicht als moral- und institutionsfreie Maschine. Arbeitsteilung, Sympathie und gesellschaftliche Ordnung gehören zur Einbettung des Marktes.", woek: "Die WÖk knüpft an Marktkoordination an und korrigiert die Verkürzung auf Gewinn, Eigeninteresse und unsichtbare Hand: Preise müssen Wirkungswahrheit tragen.", correction: "Smith wird nicht als Kronzeuge ungezügelter Kapitalsteuerung genutzt.", related: ["markt", "kapital", "wirkungswahrheit", "externalisierung", "gemeinwohl", "marktwert"] }),
  thinker({ id: "karl-marx", title: "Karl Marx", sourceGroup: "capital", short: "Karl Marx ist relevant, weil er Kapital als gesellschaftliches Macht- und Produktionsverhältnis analysiert.", idea: "Marx beschreibt Kapitalmacht, Mehrwert, Ausbeutung, Entfremdung, Warenform und Krisendynamik. Damit wird sichtbar, dass Wirtschaft nicht nur Tausch, sondern auch Machtordnung ist.", woek: "Die WÖk übernimmt die Kritik an Kapitalmacht und Externalisierung, operationalisiert aber Wirkungsverantwortung statt Eigentumsform allein.", correction: "Eigentumsform ersetzt keine Wirkungsprüfung; auch staatliches, genossenschaftliches oder gemeinnütziges Eigentum kann negative Wirkung erzeugen.", related: ["kapital", "kapital-als-machtverhaeltnis", "mehrwert", "entfremdung", "warenfetisch", "externalisierung", "wirkungsverantwortung"] }),
  thinker({ id: "immanuel-kant", title: "Immanuel Kant", sourceGroup: "ethics", short: "Immanuel Kant ist relevant, weil Wirkungsökonomie nicht rein utilitaristisch sein darf.", idea: "Kants Würdebezug, Autonomie und kategorischer Imperativ markieren Grenzen, die nicht durch Gesamtnutzen verrechnet werden dürfen.", woek: "Daraus folgt die Logik von Wirkungsgrenzen, Nichtkompensation und rechtsstaatlicher Begrenzung von Steuerung.", correction: "Die WÖk ist keine reine Pflichtethik; sie fragt zusätzlich nach tatsächlichen Zustandsveränderungen.", related: ["menschenwuerde", "wirkungsgrenze", "nichtkompensation", "rechtsstaatlichkeit", "wirkungsethik"] }),
  thinker({ id: "ludwig-wittgenstein", title: "Ludwig Wittgenstein", sourceGroup: "communication", short: "Ludwig Wittgenstein ist relevant, weil Bedeutung im Gebrauch, in Sprachspielen und Lebensformen entsteht.", idea: "Begriffe wie Freiheit, Leistung, Wert, Markt, Nachhaltigkeit oder Wirkung wirken nicht isoliert. Ihr Gebrauch ordnet Wirklichkeit und Handlungsräume.", woek: "Die WÖk braucht präzise Glossararbeit, weil unterschiedliche Sprachspiele unterschiedliche Wirkungspotenziale entfalten.", correction: "Bedeutung als Gebrauch ist kein Relativismus; Zustandsveränderungen bleiben real.", related: ["sprachspiel", "bedeutung-als-gebrauch", "lebensform", "wirklichkeitskonstruktion", "framing"] }),
  thinker({ id: "ernst-von-glasersfeld", title: "Ernst von Glasersfeld", sourceGroup: "communication", short: "Ernst von Glasersfeld ist relevant, weil Fakten nicht einfach übertragen, sondern konstruktiv verarbeitet werden.", idea: "Radikaler Konstruktivismus erklärt, dass Wissen anhand von Erfahrung, Modellen und Anschlussmöglichkeiten aufgebaut wird.", woek: "Fakten brauchen Resonanz, Anschlussfähigkeit, Kontext und Vertrauen, damit Wirkung aufgenommen werden kann.", correction: "Konstruktivismus bedeutet nicht Beliebigkeit: Wirkung bleibt real, Deutung ist konstruiert.", related: ["wirklichkeitskonstruktion", "viabilitaet", "anschlussfaehigkeit", "lernen", "wirkungsintegration"] }),
  thinker({ id: "paul-watzlawick", title: "Paul Watzlawick", sourceGroup: "communication", short: "Paul Watzlawick ist relevant für Kommunikation als Beziehung, Kontext, Rahmung und Wirkungspotenzial.", idea: "Kommunikation wirkt nicht nur durch Inhalt, sondern auch durch Beziehung, Ton, Wiederholung, Kontext und Metakommunikation.", woek: "Faktenkommunikation ist immer auch Wirkkommunikation und muss Wirkungspotenzial, Reframing und Resonanzraum beachten.", correction: "Nicht jede Kommunikation ist bereits Wirkung im engeren Sinn; sie erzeugt zunächst Potenzial, Deutung und Anschlussfähigkeit.", related: ["kommunikation", "metakommunikation", "reframing", "resonanzraum", "wirklichkeitskonstruktion"] }),
  thinker({ id: "maturana-varela", title: "Humberto Maturana und Francisco Varela", sourceGroup: "communication", short: "Maturana und Varela sind relevant, weil lebende und soziale Systeme nicht mechanisch steuerbar sind.", idea: "Autopoiesis, Strukturdeterminiertheit, strukturelle Kopplung und strukturelles Driften zeigen, dass Systeme Impulse nach eigener Struktur verarbeiten.", woek: "Wenn direkte Kontrolle unmöglich ist, braucht es Rückkopplung, Wirkungsdaten, Resonanzräume und lernende Anreizarchitektur.", correction: "Die WÖk übernimmt Nichtmechanik, bleibt aber demokratisch und steuerungsorientiert.", aliases: ["Humberto Maturana", "Francisco Varela"], related: ["autopoiesis", "strukturdeterminiertheit", "strukturelle-kopplung", "strukturelles-driften", "selbstorganisation"] }),
  thinker({ id: "heinz-von-foerster", title: "Heinz von Foerster", sourceGroup: "systems2", short: "Heinz von Foerster ist relevant, weil Gesellschaft nicht als triviale Maschine verstanden werden kann.", idea: "Nichttrivialität, Beobachtung zweiter Ordnung und Kybernetik zweiter Ordnung machen sichtbar, dass Beobachter:innen Teil des Systems sind.", woek: "Politik, Medien, Märkte und Menschen reagieren nicht linear; Wirkungssteuerung muss lernend, rückgekoppelt, transparent und fehlbar sein.", correction: "Nichttrivialität ist kein Grund, nicht zu steuern, sondern ein Grund, anders zu steuern.", aliases: ["von Foerster"], related: ["triviale-maschine", "nichttriviale-maschine", "beobachtung-zweiter-ordnung", "kybernetik-zweiter-ordnung", "verantwortung"] }),
  thinker({ id: "stafford-beer", title: "Stafford Beer", sourceGroup: "systems2", short: "Stafford Beer ist relevant für Organisationen als lebensfähige, rekursive Systeme.", idea: "Das Viable System Model verbindet operative Einheiten, Koordination, Kontrolle, Intelligenz und normative Identität.", woek: "Beers Systemlogik ist Anschlussmodell für Wirkungsarchitektur, Verwaltung, Unternehmen, Wirkungsrat und lernende Institutionen.", correction: "Kein Organisationsdogma, sondern Werkzeug für Wirkungsgovernance und Rückkopplung.", related: ["viable-system-model", "viabilitaet", "varietaet", "rekursion", "wirkungsarchitektur"] }),
  thinker({ id: "gregory-bateson", title: "Gregory Bateson", sourceGroup: "systems2", short: "Gregory Bateson ist relevant, weil Wirkung in Mustern, Kontexten und Beziehungen entsteht.", idea: "Bateson lenkt Aufmerksamkeit auf Kontext, Lernen, Metakommunikation und den Unterschied, der einen Unterschied macht.", woek: "Das passt zu Resonanzraum, Interdependenz, Wirkungsnetz und Kommunikation als Folgewirkungsraum.", correction: "Nicht als poetische Metapher verwenden, sondern als Hinweis auf Muster und Kontext.", related: ["interdependenz", "resonanzraum", "wirkungsnetz", "metakommunikation", "double-bind"] }),
  thinker({ id: "niklas-luhmann", title: "Niklas Luhmann", sourceGroup: "systems2", short: "Niklas Luhmann ist relevant, weil moderne Gesellschaften nicht zentral durchsteuerbar sind.", idea: "Wirtschaft, Recht, Politik, Wissenschaft und Medien folgen eigenen Codes und erzeugen Anschlusskommunikation.", woek: "Die WÖk muss Wirkungsrückkopplung systemübergreifend, aber nicht naiv zentralistisch denken.", correction: "Die WÖk bleibt normativ und steuerungsorientiert: Sie beschreibt nicht nur, sondern fragt nach Wirkung für Mensch, Planet und Demokratie.", related: ["soziale-systeme", "selbstreferenz", "beobachtung-zweiter-ordnung", "anschlussfaehigkeit", "rueckkopplung"] }),
  thinker({ id: "frederic-vester", title: "Frederic Vester", sourceGroup: "systems2", short: "Frederic Vester ist relevant für vernetztes Denken und nichtlineare Folgewirkungen.", idea: "Vester zeigt, dass Systemverhalten aus Wechselwirkungen, Rückkopplungen und indirekten Effekten entsteht.", woek: "Er unterstützt die WÖk-Logik, dass Einzelindikatoren nicht reichen und Wirkungsnetze nötig sind.", correction: "Vernetztes Denken ersetzt keine normative Bewertung.", related: ["vernetztes-denken", "interdependenz", "rueckkopplung", "folgewirkung", "hebelpunkt"] }),
  thinker({ id: "donella-meadows", title: "Donella Meadows", sourceGroup: "systems2", short: "Donella Meadows ist relevant, weil Zielgrößen und Paradigmen tiefe Hebel in Systemen sind.", idea: "Meadows unterscheidet Parameter, Rückkopplungen, Informationsflüsse, Regeln, Ziele und Paradigmen als Hebelpunkte.", woek: "Die WÖk setzt beim tiefen Hebel an: Kapital als Zielgröße wird durch Wirkung ersetzt.", correction: "Hebelpunkte sind Analysehilfen, keine automatische Steuerungsgarantie.", related: ["hebelpunkt", "systemgrenze", "rueckkopplung", "wirkungslenkung", "wirkungsarchitektur"] }),
  thinker({ id: "peter-drucker", title: "Peter Drucker", sourceGroup: "management2", short: "Peter Drucker ist relevant, weil Gewinn für ihn nicht der eigentliche Zweck, sondern ein Test wirtschaftlicher Tragfähigkeit ist.", idea: "Drucker betont Effektivität, Kundennutzen, Managementverantwortung und Ergebnisse.", woek: "Die WÖk ergänzt: Der Gewinntest ist nur belastbar, wenn Preise Wirkung abbilden.", correction: "In wirkungsblinden Märkten kann Gewinn auch erfolgreiche Externalisierung anzeigen.", related: ["effektivitaet", "effizienz", "kundennutzen", "gewinn-als-test", "management"] }),
  thinker({ id: "hans-ulrich", title: "Hans Ulrich", sourceGroup: "management2", short: "Hans Ulrich ist relevant für Unternehmen als offene, produktive soziale Systeme.", idea: "Sein systemorientiertes Management betrachtet Umweltbezug, Anspruchsgruppen, Ganzheitlichkeit und Wechselwirkungen.", woek: "Die WÖk erweitert diese Sicht um messbare Wirkung auf Mensch, Planet und Demokratie.", correction: "Ganzheitlichkeit bleibt ohne Wirkungsdaten und Rückkopplung zu allgemein.", related: ["systemorientiertes-management", "st-galler-management-modell", "anspruchsgruppen", "management"] }),
  thinker({ id: "fredmund-malik", title: "Fredmund Malik", sourceGroup: "management2", short: "Fredmund Malik ist relevant für Management in komplexen Systemen und wirksame Führung.", idea: "Malik betont Resultatorientierung, Selbstorganisation, Komplexitätsmanagement und systemorientierte Führung.", woek: "Die WÖk ergänzt: Resultate müssen als Wirkung gelesen werden, nicht nur als Zielerreichung oder Performance.", correction: "Wirksamkeit braucht Referenzrahmen Mensch, Planet und Demokratie.", related: ["wirksames-management", "komplexitaetsmanagement", "selbstorganisation", "wirksamkeit"] }),
  thinker({ id: "jochen-roepke", title: "Jochen Röpke", sourceGroup: "innovation", short: "Jochen Röpke ist relevant, weil Transformation unternehmerisches Lernen und Selbstveränderung verlangt.", idea: "Der lernende Unternehmer entwickelt Wahrnehmung, Kompetenz, Risiko- und Innovationsfähigkeit.", woek: "Der WÖk-Unternehmer wird zum Wirkungsakteur, der Wirkungen liest und bessere Wirkungspfade erzeugt.", correction: "Unternehmertypen und Lernebenen bleiben quellenprüfpflichtig, bevor sie endgültig Röpke zugeschrieben werden.", related: ["lernender-unternehmer", "unternehmerisches-lernen", "evolutorischer-unternehmer", "lernebenen"], reviewStatus: "needs_source_check" }),
  thinker({ id: "joseph-schumpeter", title: "Joseph A. Schumpeter", sourceGroup: "innovation", short: "Joseph A. Schumpeter ist relevant für Innovation als neue Kombination.", idea: "Schumpeter beschreibt Unternehmerfunktion, Innovation, wirtschaftliche Entwicklung und schöpferische Zerstörung.", woek: "Die WÖk korrigiert: Neuheit ist nicht automatisch Fortschritt; Fortschritt ist Innovation mit positiver Netto-Wirkung.", correction: "Schöpferische Zerstörung legitimiert keine Schäden an Mensch, Planet oder Demokratie.", aliases: ["Schumpeter"], related: ["innovation", "rekombination", "unternehmerfunktion", "schoepferische-zerstoerung", "wirkungsinnovation"] }),
  thinker({ id: "nikolai-kondratieff", title: "Nikolai Kondratieff", sourceGroup: "innovation", short: "Nikolai Kondratieff ist relevant als Bezugslinie langfristiger wirtschaftlicher Entwicklungswellen.", idea: "Lange Wellen dienen als Deutungsmuster für Bündel aus Technologie, Infrastruktur, Kapital, Kompetenzen, Institutionen und Akzeptanz.", woek: "Die WÖk nutzt Kondratieff vorsichtig, um Transformationswellen und den 6. Kondratieff einzuordnen.", correction: "Nicht deterministisch verwenden.", aliases: ["Kondratieff"], related: ["kondratieff-zyklus", "sechster-kondratieff", "basisinnovation", "transformationswelle"] }),
  thinker({ id: "maja-goepel", title: "Maja Göpel", sourceGroup: "transformation", short: "Maja Göpel ist relevant als Transformations- und Wohlstandsdenkerin.", idea: "Sie steht für Wohlstand neu denken, Systemgrenzen, planetare Grenzen, Zukunftsfähigkeit und Möglichkeitsräume.", woek: "Die WÖk nimmt diese Anschlusslinie auf und ergänzt eine operative Steuerungsarchitektur aus WÖk-IDs, Scorecards, DPP, T-SROI, Wirkungsrat, Preisen, Steuern, Kapital und Rückkopplung.", correction: "Maja Göpel ist Anschlusslinie im Transformationsdenken, keine direkte Grundlage der WÖk.", related: ["wohlstand", "systemgrenze", "planetare-grenzen", "zukunftsfaehigkeit", "wirkungsarchitektur"] }),
  thinker({ id: "amartya-sen", title: "Amartya Sen", sourceGroup: "ethics", short: "Amartya Sen ist relevant, weil Wohlstand nicht nur Einkommen, sondern reale Freiheit und Befähigung ist.", idea: "Development as Freedom verbindet Entwicklung mit tatsächlichen Handlungsmöglichkeiten.", woek: "Die WÖk ergänzt: Befähigungen müssen über Wirkung messbar, steuerbar und systemisch abgesichert werden.", correction: "Befähigung ersetzt keine Wirkungsarchitektur.", related: ["befaehigungen", "reale-freiheit", "wohlstand", "wirkungseinkommen"] }),
  thinker({ id: "martha-nussbaum", title: "Martha Nussbaum", sourceGroup: "ethics", short: "Martha Nussbaum ist relevant für Würde, zentrale Fähigkeiten und gutes Leben.", idea: "Der Capability Approach gibt einen normativen Rahmen für menschliche Entfaltung und soziale Gerechtigkeit.", woek: "Die WÖk übersetzt Befähigung in Wirkung, Scorecards und politische Steuerung.", correction: "Die Liste zentraler Fähigkeiten wird nicht eins zu eins als WÖk-Messsystem übernommen.", related: ["capability-approach", "menschenwuerde", "befaehigungen", "soziale-gerechtigkeit"] }),
  thinker({ id: "hannah-arendt", title: "Hannah Arendt", sourceGroup: "ethics", short: "Hannah Arendt ist relevant, weil menschliches Handeln nicht in Arbeit und Produktion aufgeht.", idea: "Vita activa unterscheidet Arbeiten, Herstellen und Handeln. Öffentlichkeit und politisches Handeln sind eigene Räume.", woek: "Die WÖk liest Öffentlichkeit, Demokratie und Weltbezug als Wirkungsräume, nicht als Nebenfolgen von Wirtschaft.", correction: "Arendt wird nicht auf Arbeitsmarkt- oder Produktivitätsfragen verkürzt.", related: ["oeffentlichkeit", "demokratie", "wirkungsraum", "politisches-handeln"] }),
  thinker({ id: "elinor-ostrom", title: "Elinor Ostrom", sourceGroup: "transformation", short: "Elinor Ostrom ist relevant für dezentrale, regelbasierte Selbstorganisation von Gemeingütern.", idea: "Commons, lokale Institutionen, Vertrauen und polyzentrische Governance zeigen Alternativen zu Markt oder Zentralstaat allein.", woek: "Die WÖk knüpft daran an, wenn Wirkung über Daten, Regeln, Rückkopplung und plural kontrollierte Institutionen gesteuert wird.", correction: "Commons ersetzen keine Wirkungsprüfung und keine demokratische Verantwortlichkeit.", related: ["commons", "gemeingueter", "selbstorganisation", "polyzentrische-governance", "vertrauen"] }),
  thinker({ id: "karl-polanyi", title: "Karl Polanyi", sourceGroup: "capital", short: "Karl Polanyi ist relevant, weil Märkte institutionell eingebettet sind.", idea: "The Great Transformation beschreibt Entbettung, Marktgesellschaft, fiktive Waren und Gegenbewegungen.", woek: "Wirkungssteuerung ist eine neue Einbettung von Märkten in Mensch, Planet und Demokratie.", correction: "Einbettung ist kein Rückzug aus Märkten, sondern bessere Wirkungswahrheit und Rückkopplung.", related: ["einbettung", "entbettung", "markt", "externalisierung", "wirkungssteuer"] }),
  thinker({ id: "friedrich-hayek", title: "Friedrich Hayek", sourceGroup: "capital", short: "Friedrich Hayek ist relevant, weil Märkte dezentrales Wissen verarbeiten.", idea: "Preissignale und Marktprozesse können verstreutes Wissen koordinieren.", woek: "Die WÖk korrigiert: Preise verarbeiten nur, was im Preis erscheint. Wenn Wirkung externalisiert bleibt, ist das Preissignal unwahr.", correction: "Hayek wird als Bezugslinie für Wissensteilung genutzt, nicht als Freibrief wirkungsblinder Märkte.", related: ["dezentrales-wissen", "preissignal", "markt", "wirkungswahrheit", "externalisierung"] }),
  thinker({ id: "john-maynard-keynes", title: "John Maynard Keynes", sourceGroup: "capital", short: "John Maynard Keynes ist relevant für makroökonomische Stabilisierung unter Unsicherheit.", idea: "Keynes zeigt, dass Nachfrage, Investitionen und staatliche Krisenintervention wirtschaftliche Stabilität beeinflussen.", woek: "Die WÖk ergänzt: Stabilisierung braucht Wirkungsrichtung. Staatsausgaben sind nicht automatisch positive Wirkung.", correction: "Nicht jede Nachfrage ist wohlfahrtssteigernd; Wirkung muss mitgeprüft werden.", related: ["makrooekonomische-stabilisierung", "unsicherheit", "wirkungshaushalt", "wirkungssteuer"] }),
  thinker({ id: "alan-watts-daoismus", title: "Alan Watts / Daoismus", sourceGroup: "dao", short: "Alan Watts und Daoismus sind als Erinnerung relevant, dass der Mensch nicht außerhalb der Welt steht, die er steuert.", idea: "Wu Wei, Prozessdenken, Nicht-Dualität und Verbundenheit dienen als Gegenbild zu Beherrschungsillusion.", woek: "Die WÖk nutzt diese Bezugslinie funktional: nicht gegen Steuerung, sondern für Rückkopplung, Selbstorganisation und Nicht-Erzwingen.", correction: "Keine spirituelle Theorie und keine Sammlung einzelner Zitate.", aliases: ["Alan Watts", "Daoismus"], related: ["dao", "wu-wei", "prozessdenken", "nicht-dualitaet", "selbstorganisation"] }),

  term({ id: "wert", title: "Wert", category: CAT_VALUES, concept: "precision", short: "Wert bezeichnet in der Wirkungsökonomie nicht nur Preis, Nutzen oder subjektive Bedeutung, sondern muss nach systemischem und normativem Bezug unterschieden werden.", definition: "Wert ist mehrdeutig. Die WÖk unterscheidet Marktwert, Gebrauchswert, Tauschwert, Business Value, Wirkungswert, systemischen Wert und normativen Wert.", woek: "Ohne Wertunterscheidung werden Preis, Nutzen, Moral und Wirkung vermischt.", related: ["werte", "marktwert", "gebrauchswert", "tauschwert", "wirkungswert", "systemischer-wert", "normativer-wert"], sourceGroup: "capital" }),
  term({ id: "werte", title: "Werte", category: CAT_VALUES, concept: "precision", short: "Werte sind normative Orientierungen, die anzeigen, was als wünschenswert, schützenswert oder handlungsleitend gilt.", definition: "Werte geben Richtung, aber sie ersetzen keine Prüfung tatsächlicher Zustandsveränderungen.", woek: "Werte ohne Wirkung können Symbolik bleiben. Wirkung ohne Werte kann gefährlich werden.", related: ["wert", "wertewandel", "wertekonflikt", "wirkungsethik"], sourceGroup: "ethics" }),
  term({ id: "normativer-wert", title: "Normativer Wert", category: CAT_VALUES, concept: "precision", short: "Normativer Wert fragt, ob eine Wirkung im Referenzrahmen von Mensch, Planet und Demokratie wünschenswert ist.", definition: "Normativer Wert bezieht sich auf Schutzgüter, Ziele, Würde, Rechte, planetare Grenzen und demokratische Voraussetzungen.", woek: "Er verhindert, dass Wirkung nur technisch oder monetär gelesen wird.", related: ["systemischer-wert", "wirkungswert", "wirkungsethik", "mensch-planet-demokratie"], sourceGroup: "ethics" }),
  term({ id: "systemischer-wert", title: "Systemischer Wert", category: CAT_VALUES, concept: "precision", short: "Systemischer Wert fragt, ob eine Wirkung die Funktionsfähigkeit, Stabilität oder Entwicklungsfähigkeit eines Systems stärkt.", definition: "Systemischer Wert betrifft Resilienz, Vertrauen, Lernfähigkeit, Regenerationsfähigkeit und Rückkopplungsfähigkeit.", woek: "Er ergänzt normativen Wert, ohne ihn zu ersetzen.", related: ["normativer-wert", "wirkungswert", "wirkungsresilienz", "systemische-kohaerenz"], sourceGroup: "systems2" }),
  term({ id: "wirkungswert", title: "Wirkungswert", category: CAT_VALUES, concept: "precision", short: "Wirkungswert beschreibt den Wert einer Handlung, eines Produkts, einer Organisation oder Entscheidung gemessen an ihrer tatsächlichen Wirkung auf Mensch, Planet und Demokratie.", definition: "Wirkungswert ist nicht Marktwert. Er entsteht aus realen Zustandsveränderungen und ihrer normativen und systemischen Bewertung.", woek: "Zentral für Scorecards, T-SROI, Wirkungssteuer und positive Netto-Wirkung.", aliases: ["Impact Value"], related: ["impact-value", "positive-netto-wirkung", "t-sroi", "scorecard", "wirkungswertschoepfung"], sourceGroup: "capital" }),
  term({ id: "marktwert", title: "Marktwert", category: CAT_VALUES, short: "Marktwert beschreibt den Preis oder monetären Wert, den ein Gut, Unternehmen oder Vermögenswert am Markt erzielt.", definition: "Marktwert entsteht aus Angebot, Nachfrage, Erwartungen, Knappheit, Macht und Informationslage.", woek: "Marktwert ist nicht Wirkungswert. Er kann steigen, obwohl negative Wirkungen externalisiert werden.", related: ["wert", "wirkungswert", "externalisierung", "kapitalrendite"], sourceGroup: "capital" }),
  term({ id: "gebrauchswert", title: "Gebrauchswert", category: CAT_VALUES, short: "Gebrauchswert beschreibt den Nutzen eines Gutes für konkrete Bedürfnisse oder Zwecke.", definition: "Ein Produkt kann für Nutzer:innen nützlich sein und trotzdem Schäden in Lieferkette, Umwelt oder Demokratie erzeugen.", woek: "Gebrauchswert ist nicht automatisch positive Wirkung.", related: ["wert", "kundennutzen", "wirkungswert", "produktwirkung"], sourceGroup: "capital" }),
  term({ id: "tauschwert", title: "Tauschwert", category: CAT_VALUES, short: "Tauschwert beschreibt den Wert eines Gutes im Austauschverhältnis zu anderen Gütern oder Geld.", definition: "Tauschwert ist kapital- und marktbezogen und kann von Gebrauchswert oder Wirkungswert abweichen.", woek: "Die WÖk ergänzt den Tauschwert um Wirkungswert und Wirkungswahrheit.", related: ["wert", "marktwert", "gebrauchswert", "wirkungswert"], sourceGroup: "capital" }),
  term({ id: "wertewandel", title: "Wertewandel", category: CAT_VALUES, short: "Wertewandel beschreibt die Veränderung gesellschaftlicher Leitwerte über Zeit.", definition: "Wertewandel beeinflusst Wirkungsbewertung, Akzeptanz, Konsum, Innovation und Vertrauen.", woek: "WÖk muss Wertewandel transparent verhandeln, nicht verstecken.", related: ["werte", "wertekonflikt", "vertrauen", "transformationswelle"], sourceGroup: "transformation" }),
  term({ id: "wertekonflikt", title: "Wertekonflikt", category: CAT_VALUES, short: "Ein Wertekonflikt entsteht, wenn unterschiedliche normative Ziele oder Schutzgüter miteinander in Spannung geraten.", definition: "Wertekonflikte erscheinen etwa zwischen Freiheit, Sicherheit, Klima, Teilhabe, Eigentum, Gesundheit oder Demokratie.", woek: "Sie müssen als Zielkonflikte und Wirkungsabwägungen sichtbar gemacht werden. Nichtkompensation schützt rote Linien.", related: ["werte", "wirkungsgrenze", "nichtkompensation", "wirkungsethik"], sourceGroup: "ethics" }),
  term({ id: "wertschoepfung", title: "Wertschöpfung", category: CAT_CAPITAL, short: "Wertschöpfung beschreibt die Erzeugung von wirtschaftlichem Wert durch Arbeit, Kapital, Wissen, Organisation oder Ressourcen.", definition: "Wertschöpfung misst wirtschaftliche Erzeugung, aber nicht automatisch Zustandsverbesserung.", woek: "Die WÖk unterscheidet Wertschöpfung, Wirkungswert und Verlustleistung.", related: ["wirkungswertschoepfung", "wirkungswert", "verlustleistung", "kapital"], sourceGroup: "capital" }),
  term({ id: "wirkungswertschoepfung", title: "Wirkungswertschöpfung", category: CAT_CAPITAL, concept: "precision", short: "Wirkungswertschöpfung entsteht, wenn wirtschaftliche Aktivität reale positive Zustandsveränderungen für Mensch, Planet und Demokratie erzeugt.", definition: "Sie verbindet wirtschaftliche Tätigkeit mit positiven Zuständen, statt Wert nur monetär zu lesen.", woek: "Zielgröße für Unternehmen, Kapital, Beschaffung, Steuer und Transformation.", related: ["wertschoepfung", "wirkungswert", "positive-netto-wirkung", "wirkungskapital"], sourceGroup: "capital" }),
  term({ id: "kapital", title: "Kapital", category: CAT_CAPITAL, concept: "precision", short: "Kapital ist gespeicherte Handlungsmöglichkeit in monetärer, materieller, sozialer, natürlicher oder institutioneller Form.", definition: "Kapital kann ermöglichen, beschleunigen und absichern. Problematisch wird es, wenn es vom Werkzeug zur Zielgröße wird.", woek: "Die WÖk ordnet Kapital der Wirkung unter.", related: ["kapital-als-werkzeug", "kapital-als-machtverhaeltnis", "kapitalwirkung", "kapitalrendite", "wirkungskapital"], sourceGroup: "capital" }),
  term({ id: "kapitalrendite", title: "Kapitalrendite", category: CAT_CAPITAL, short: "Kapitalrendite beschreibt den finanziellen Ertrag auf eingesetztes Kapital.", definition: "Rendite zeigt monetären Rückfluss, aber nicht, welche Zustandsveränderungen dadurch entstehen.", woek: "Kapitalrendite ist nicht Wirkungsrendite. Hohe Rendite kann durch positive Wirkung oder Externalisierung entstehen.", related: ["kapital", "kapitalwirkung", "externalisierung", "wirkungskapital"], sourceGroup: "capital" }),
  term({ id: "kapitalwirkung", title: "Kapitalwirkung", category: CAT_CAPITAL, concept: "precision", short: "Kapitalwirkung beschreibt, welche Zustandsveränderungen Kapital durch Investition, Eigentum, Kredit, Renditeerwartung oder Machtkonzentration erzeugt.", definition: "Kapital wirkt über Allokation, Eigentum, Zugang, Risiko, Zins, Renditeerwartung und institutionelle Macht.", woek: "Kapitalwirkung ist die zentrale Frage, wenn Kapital nicht Ziel, sondern Werkzeug sein soll.", related: ["kapital", "wirkungskapital", "kapitalrendite", "kapital-als-machtverhaeltnis"], sourceGroup: "capital" }),
  term({ id: "kapital-als-machtverhaeltnis", title: "Kapital als Machtverhältnis", category: CAT_CAPITAL, short: "Kapital als Machtverhältnis beschreibt, dass Kapital Zugänge, Abhängigkeiten, Entscheidungsrechte und Einflussmöglichkeiten strukturiert.", definition: "Der Begriff schließt an Marx, Polanyi und moderne Kapitalmarktkritik an.", woek: "Die WÖk ergänzt: Macht muss an Wirkung rückgekoppelt werden.", related: ["kapital", "kapitalwirkung", "externalisierung", "wirkungsverantwortung", "karl-marx"], sourceGroup: "capital" }),
  term({ id: "kapital-als-werkzeug", title: "Kapital als Werkzeug", category: CAT_CAPITAL, concept: "precision", short: "Kapital als Werkzeug bedeutet, dass Kapital Mittel zur Gestaltung von Wirkung ist, aber nicht selbst der Maßstab von Fortschritt.", definition: "Kapital kann Schulen, Forschung, Infrastruktur, Unternehmen und Transformation ermöglichen.", woek: "Kapital wird problematisch, wenn Kapitalvermehrung zum Kompass wird.", related: ["kapital", "kapitalwirkung", "wirkungskapital", "positive-netto-wirkung"], sourceGroup: "capital" }),
  term({ id: "akkumulation", title: "Akkumulation", category: CAT_CAPITAL, short: "Akkumulation beschreibt die Anhäufung von Kapital, Vermögen oder Macht über Zeit.", definition: "Akkumulation kann Investitionsfähigkeit erzeugen, aber auch Machtkonzentration und Abhängigkeit.", woek: "Wirkungsökonomisch zählt, ob angesammeltes Kapital Transformationsfähigkeit stärkt oder demokratische und soziale Risiken verschärft.", related: ["kapital", "kapital-als-machtverhaeltnis", "kapitalwirkung"], sourceGroup: "capital" }),
  term({ id: "externalisierung", title: "Externalisierung", category: CAT_CAPITAL, concept: "precision", short: "Externalisierung beschreibt die Verlagerung von Kosten, Risiken oder Schäden auf andere Menschen, Natur, Institutionen oder zukünftige Generationen.", definition: "Externalisierung macht Schäden für Verursacher:innen unsichtbar oder billiger, während andere die Folgen tragen.", woek: "Externalisierung ist ein zentraler Grundfehler kapitalzentrierter Steuerung. Die WÖk macht externalisierte Wirkung sichtbar und koppelt sie in Preise, Steuern, Kapital und Verantwortung zurück.", related: ["wirkungsblindheit", "wirkungswahrheit", "produktwirkungssteuer", "scope-3", "kapitalwirkung"], sourceGroup: "capital" }),
  term({ id: "entfremdung", title: "Entfremdung", category: CAT_CAPITAL, short: "Entfremdung beschreibt den Verlust von Bezug zu Arbeit, Produkt, Mitmenschen, Natur oder sich selbst.", definition: "Anschluss an Marx, erweitert auf wirkungsblinde Arbeit, sinnlose Bürokratie, Plattformlogik, Konsum und Entkopplung von realen Folgen.", woek: "Entfremdung wird als Wirkungszustand lesbar, wenn Menschen die Folgen ihrer Arbeit oder ihres Konsums nicht mehr erfahren.", related: ["karl-marx", "wirkungsblindheit", "warenfetisch", "sinnvolle-arbeit"], sourceGroup: "capital" }),
  term({ id: "warenfetisch", title: "Warenfetisch", category: CAT_CAPITAL, short: "Warenfetisch beschreibt, dass soziale und ökologische Herstellungsbedingungen hinter der scheinbar neutralen Ware verschwinden.", definition: "Die Ware erscheint als isoliertes Ding, während Arbeit, Lieferkette, Naturverbrauch und Machtverhältnisse verdeckt bleiben.", woek: "Zentral für Produktwirkungssteuer, Digitalen Produktpass und Lieferkettenwirkung: Die WÖk macht sichtbar, was im Warenpreis verborgen bleibt.", related: ["produktwirkungssteuer", "digitaler-produktpass", "lieferkette", "externalisierung", "karl-marx"], sourceGroup: "capital" }),
  term({ id: "mehrwert", title: "Mehrwert", category: CAT_CAPITAL, short: "Mehrwert bezeichnet bei Marx den Wert, der über den gezahlten Arbeitslohn hinaus im Produktionsprozess angeeignet wird.", definition: "Der Begriff ist eine marxsche Wertkategorie und keine vollständige Werttheorie der WÖk.", woek: "Die WÖk fragt umfassender: Welche Wirkung wird erzeugt, wer profitiert, wer trägt Folgekosten?", related: ["karl-marx", "kapital", "wirkungswert", "externalisierung"], sourceGroup: "capital" }),
  term({ id: "wirkungsethik", title: "Wirkungsethik", category: CAT_ETHICS, concept: "core", short: "Wirkungsethik bewertet Handlungen nach ihren tatsächlichen Folgen für Mensch, Planet und Demokratie, unter Beachtung nicht kompensierbarer Grenzen.", definition: "Wirkungsethik fragt nach realen Zustandsveränderungen, aber nicht als reine Nutzenaddition.", woek: "Menschenwürde, Rechtsstaatlichkeit, planetare Grenzen und Demokratie sind rote Linien.", related: ["wirkungsverantwortung", "nichtkompensation", "wirkungsgrenze", "positive-netto-wirkung"], sourceGroup: "ethics" }),
  term({ id: "wirkungsverantwortung", title: "Wirkungsverantwortung", category: CAT_ETHICS, concept: "core", short: "Wirkungsverantwortung bezeichnet die Verantwortung für direkte, indirekte, zeitversetzte und systemische Folgen des eigenen Handelns oder Unterlassens.", definition: "Sie umfasst Wirkungspfade, Folgewirkungen, Risiken, Nichtwissen, Datenqualität und Korrekturfähigkeit.", woek: "Zentral für Unternehmen, Politik, Kapital, Medien, Konsum und Institutionen.", related: ["wirkungsethik", "folgewirkung", "wirkungspfad", "kapitalwirkung", "folgencheck"], sourceGroup: "ethics" }),
  term({ id: "sprachspiel", title: "Sprachspiel", category: CAT_LANGUAGE, short: "Ein Sprachspiel ist ein sozialer Gebrauchszusammenhang, in dem Wörter Bedeutung erhalten.", definition: "Begriffe erhalten Bedeutung durch Regeln, Praktiken, Erwartungen und Lebensformen.", woek: "Wichtig für Freiheit, Leistung, Wert, Markt, Nachhaltigkeit, Vertrauen und Wirkung, weil gleiche Begriffe unterschiedliche Wirkungspotenziale entfalten.", related: ["bedeutung-als-gebrauch", "lebensform", "framing", "resonanzraum", "ludwig-wittgenstein"], sourceGroup: "communication" }),
  term({ id: "bedeutung-als-gebrauch", title: "Bedeutung als Gebrauch", category: CAT_LANGUAGE, short: "Bedeutung entsteht nicht nur durch Definition, sondern durch Gebrauch in sozialen Praktiken.", definition: "Ein Wort wirkt anders, je nachdem, wo, von wem, mit welchem Ziel und in welchem Sprachspiel es verwendet wird.", woek: "Wichtig für politische Sprache, Medienwirkung und Glossararbeit: Begriffe müssen definiert und in ihrer Wirkung beobachtet werden.", related: ["sprachspiel", "lebensform", "wirkungswahrheit", "folgencheck"], sourceGroup: "communication" }),
  term({ id: "lebensform", title: "Lebensform", category: CAT_LANGUAGE, short: "Lebensform beschreibt den sozialen, kulturellen und praktischen Kontext, in dem Sprache, Regeln und Bedeutungen eingebettet sind.", definition: "Lebensformen prägen, was plausibel, selbstverständlich, zumutbar oder fremd erscheint.", woek: "Relevant für Anschlussfähigkeit, Reaktanz, Resonanzräume und Transformation.", related: ["sprachspiel", "anschlussfaehigkeit", "resonanzraum", "wirklichkeitskonstruktion"], sourceGroup: "communication" }),
  term({ id: "wahrheit", title: "Wahrheit", category: CAT_LANGUAGE, concept: "precision", short: "Wahrheit bezeichnet die Übereinstimmung oder belastbare Nähe von Aussage und Wirklichkeit.", definition: "Wahrheit ist nicht nur individuelle Aussagekorrektheit, sondern Voraussetzung gemeinsamer Wirklichkeit, Rechtsstaatlichkeit und Wirkungsprüfung.", woek: "Die WÖk behandelt Wahrheit als demokratische Infrastruktur.", related: ["wahrhaftigkeit", "wirkungswahrheit", "fakten", "rechtsstaatlichkeit", "vertrauen"], sourceGroup: "communication" }),
  term({ id: "wahrhaftigkeit", title: "Wahrhaftigkeit", category: CAT_LANGUAGE, concept: "precision", short: "Wahrhaftigkeit beschreibt die kommunikative Haltung, Informationen nicht absichtlich zu verzerren, zu verschleiern oder manipulierend zu verwenden.", definition: "Wahrhaftigkeit betrifft Absicht, Sorgfalt, Kontext, Auslassung, Ton und Korrekturfähigkeit.", woek: "Sie ist Voraussetzung für Vertrauen, Medienqualität und demokratische Rückkopplung.", related: ["wahrheit", "vertrauen", "medienqualitaet", "wirkungswahrheit"], sourceGroup: "communication" }),
  term({ id: "scheinwahrheit", title: "Scheinwahrheit", category: CAT_LANGUAGE, concept: "precision", short: "Scheinwahrheit entsteht, wenn eine Aussage formal korrekt oder plausibel wirkt, aber wesentliche Wirkungszusammenhänge ausblendet.", definition: "Scheinwahrheit kann durch Kontextverlust, selektive Zahlen, irreführende Frames oder richtige Teilaussagen mit falscher Folgerung entstehen.", woek: "Sie ist ein Risiko für Faktencheck, Medienqualität und Wirkungswahrheit.", related: ["wirkungswahrheit", "faktencheck", "folgencheck", "framing", "wahrheit"], sourceGroup: "communication" }),
  term({ id: "fakten", title: "Fakten", category: CAT_LANGUAGE, short: "Fakten sind überprüfbare Sachverhalte oder Aussagen über Zustände und Ereignisse.", definition: "Fakten sind notwendig, aber sie wirken nicht automatisch. Sie werden gedeutet, gerahmt, angenommen oder abgewehrt.", woek: "Wirkung entsteht erst über Deutung, Resonanz, Vertrauen, Handlungsoptionen und Rückkopplung.", related: ["faktencheck", "folgencheck", "wahrheit", "faktenreaktanz", "vertrauen"], sourceGroup: "communication" }),
  term({ id: "metakommunikation", title: "Metakommunikation", category: CAT_LANGUAGE, short: "Metakommunikation ist Kommunikation über Kommunikation.", definition: "Sie macht sichtbar, wie etwas gesagt, verstanden, gerahmt oder als Beziehungssignal gelesen wird.", woek: "Wichtig, um Wirkmechanismen wie Frames, Reaktanz, Dissonanz oder Vertrauensverschiebung sichtbar zu machen.", related: ["paul-watzlawick", "meta-kognitive-intervention", "reframing", "folgencheck"], sourceGroup: "communication" }),

  term({ id: "platon", title: "Platon", category: CAT_THINKERS, concept: "thinker", publicationStatus: "article_only", short: "Platon bleibt vorerst Backlog, solange er nicht wiederkehrend im WÖk-Content genutzt wird.", definition: "Das Höhlengleichnis kann als Metapher für Wahrnehmung und Deutungsräume dienen; Philosophenherrschaft ist vor allem Abgrenzung gegen Expertokratie.", woek: "Keine große Philosophiegeschichte ohne operative WÖk-Funktion.", related: ["wirklichkeitskonstruktion", "beobachterabhaengigkeit"], sourceGroup: "ethics", reviewStatus: "article_context_only" }),
  term({ id: "hoehlengleichnis", title: "Höhlengleichnis", category: CAT_THINKERS, concept: "sourceLine", publicationStatus: "article_only", short: "Das Höhlengleichnis bleibt Artikel-only, sofern es nicht wiederkehrend als Metapher für Wahrnehmung und Deutungsräume genutzt wird.", definition: "Der Begriff wird nicht als eigenständiger WÖk-Glossarbegriff publiziert, solange keine aktive Verwendung besteht.", woek: "Backlog statt Philosophiegeschichte.", related: ["platon", "wirklichkeitskonstruktion"], sourceGroup: "ethics", reviewStatus: "article_context_only" }),
];

additions.push(...controlledClusterAdditions);

const raw = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const terms = raw.terms || [];
const byId = new Map();
for (const item of terms) {
  byId.set(item.termId || item.id || item.slug, item);
  if (item.slug) byId.set(item.slug, item);
}

function mergeTerm(existing, next) {
  const merged = { ...existing, ...next };
  merged.aliases = unique([...(existing.aliases || []), ...(existing.synonyms || []), ...(next.aliases || [])]);
  merged.synonyms = unique(merged.aliases);
  merged.relatedTerms = unique([...(existing.relatedTerms || []), ...(next.relatedTerms || [])]);
  merged.related_terms = merged.relatedTerms;
  merged.officialSources = unique([...(existing.officialSources || []), ...(next.officialSources || [])]);
  merged.sourceLinks = [...(existing.sourceLinks || []), ...(next.sourceLinks || [])].filter((item, index, all) => {
    const key = `${item.source_type}|${item.title}|${item.url}`;
    return all.findIndex((candidate) => `${candidate.source_type}|${candidate.title}|${candidate.url}` === key) === index;
  });
  merged.source_links = merged.sourceLinks;
  merged.tags = unique([...(existing.tags || []), ...(next.tags || [])]);
  merged.categories = unique([...(existing.categories || []), ...(next.categories || [])]);
  merged.lastUpdated = today;
  merged.updatedAt = today;
  merged.lastReviewed = today;
  merged.last_reviewed = today;
  return merged;
}

for (const next of additions) {
  const existing = byId.get(next.termId) || byId.get(next.slug);
  if (existing) {
    const merged = mergeTerm(existing, next);
    const index = terms.indexOf(existing);
    terms[index] = merged;
    byId.set(merged.termId, merged);
    byId.set(merged.slug, merged);
  } else if (next.publicationStatus === "published") {
    terms.push(next);
    byId.set(next.termId, next);
    byId.set(next.slug, next);
  }
}

const coreUpdates = {
  wirkung: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Wirkung ist neutral und relational: tatsächliche Veränderung von Zuständen. Positive, negative und neutrale Wirkung müssen am Referenzrahmen Mensch, Planet und Demokratie bewertet werden.",
    relatedTerms: ["wirkungspotenzial", "wirkungsrisiko", "wirkungspfad", "folgewirkung", "positive-netto-wirkung"],
  },
  wirkungspotenzial: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Wirkungspotenzial ist die Möglichkeit, dass Wirkung eintreten kann. Es ist keine eingetretene Wirkung und kein Beweis.",
    relatedTerms: ["wirkung", "wirkungsrisiko", "wirkstoff", "resonanzraum", "anschlussfaehigkeit"],
  },
  wirkungsrisiko: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Wirkungsrisiko ist die Möglichkeit negativer oder destabilisierender Wirkung, nicht der bereits eingetretene Schaden.",
    relatedTerms: ["wirkungspotenzial", "folgewirkung", "resonanzrisiko", "klimarisiko", "wirkungsgrenze"],
  },
  wirkungspfad: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Ein Wirkungspfad ist ein plausibler Weg von Auslöser zu Wirkung. Er ist eine Hypothese mit Datenbedarf, kein Kausalbeweis.",
    relatedTerms: ["wirkung", "wirkungspotenzial", "wirkstoff", "folgewirkung", "rueckkopplung"],
  },
  resonanzraum: {
    conceptStatus: "WÖk-Präzisierungsbegriff",
    relatedTerms: ["resonanz", "anschlussfaehigkeit", "salienz", "framing", "strukturdeterminiertheit"],
  },
  anschlussfaehigkeit: {
    conceptStatus: "WÖk-Präzisierungsbegriff",
    relatedTerms: ["resonanzraum", "strukturdeterminiertheit", "diffusion", "wirkungspotenzial"],
  },
  vertrauen: {
    conceptStatus: "WÖk-Präzisierungsbegriff",
    definition: "Vertrauen ist ein sozialer, institutioneller und demokratischer Systemzustand. Es entsteht durch Wahrhaftigkeit, Rechtsstaatlichkeit, Transparenz, Teilhabe, Berechenbarkeit, Korrekturfähigkeit und erlebte Wirkung. Vertrauen ist relational und nicht automatisch positiv.",
    woekRelation: "Vertrauen kann demokratische Stabilität stärken, wenn es sich auf überprüfbare Verfahren, Rechtsstaatlichkeit, Wahrhaftigkeit, Transparenz und Korrekturfähigkeit richtet. Vertrauen kann destruktiv wirken, wenn blinde Loyalität zu Personen, Gruppen oder Narrativen Vertrauen in Medien, Wissenschaft, Institutionen oder gemeinsame Wirklichkeit zerstört. Vertrauen kann Vertrauen zerstören, wenn personalisierte Loyalität institutionelles Vertrauen verdrängt.",
    relatedTerms: ["vertrauensverschiebung", "destruktive-vertrauensbindung", "rechtsstaatlichkeit", "medienqualitaet", "diskursfaehigkeit"],
  },
  wirkungsarchitektur: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Wirkungsarchitektur ist das Gesamtsystem aus Daten, Regeln, Institutionen, Rückkopplung, Governance und Lernen.",
    relatedTerms: ["rueckkopplung", "kybernetik", "viable-system-model", "wirkungsrat", "scorecard"],
  },
  wirkungsresilienz: {
    conceptStatus: "WÖk-Präzisierungsbegriff",
    relatedTerms: ["wirkungsintegration", "vulnerabilitaet", "anpassungskapazitaet", "varietaet", "wirkungsarchitektur"],
  },
  wirkungslenkung: {
    conceptStatus: "WÖk-Kernbegriff",
    relatedTerms: ["hebelpunkt", "rueckkopplung", "wirkungsarchitektur", "positive-netto-wirkung"],
  },
  wirkungsrueckkopplung: {
    conceptStatus: "WÖk-Kernbegriff",
    relatedTerms: ["rueckkopplung", "kybernetik", "wirkungsarchitektur", "wirkungslenkung"],
  },
  "netto-wirkung": {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Netto-Wirkung ist keine einfache Addition. Rote Linien, Nichtkompensation und Datenqualität begrenzen jede Zusammenfassung.",
    relatedTerms: ["positive-netto-wirkung", "reverse-merit-order", "nichtkompensationsprinzip", "wirkungsgrenze"],
  },
  transformationswirkung: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Transformationswirkung ist nicht identisch mit Netto-Wirkung. Sie verändert Systemlogiken, Standards, Anreize oder Handlungspfade.",
    relatedTerms: ["wirkungsinnovation", "transformationswelle", "strukturdeterminiertheit", "diffusion"],
  },
  "nichttriviales-system": {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["nichttriviale-maschine", "triviale-maschine", "strukturdeterminiertheit", "rueckkopplung"],
  },
  "strukturelle-kopplung": {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["strukturdeterminiertheit", "strukturelles-driften", "autopoiesis", "resonanzraum"],
  },
  "strukturelles-driften": {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["strukturelle-kopplung", "normalisierung", "prozessdenken", "rueckkopplung"],
  },
  rueckkopplung: {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["kybernetik", "wirkungsrueckkopplung", "folgewirkung", "hebelpunkt"],
  },
  kipppunkt: {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["schwellenwert", "klimarisiko", "wirkungsrisiko", "baseline-verschiebung"],
  },
  "scope-1-2-3": {
    conceptStatus: "Methodenbegriff",
    canonicalLabel: "Scope 1, Scope 2, Scope 3",
    shortDefinition: "Scope 1, 2 und 3 sind der bisherige Überblickseintrag zu THG-Emissions-Scopes und verweisen auf die Detailbegriffe Scope 1, Scope 2 und Scope 3.",
    woekRelation: "Der Überblick bleibt aus Kompatibilitätsgründen erhalten; spezifische Erwähnungen werden auf Scope 1, Scope 2, Scope 3 oder THG-Emissions-Scopes verlinkt.",
    relatedTerms: ["thg-emissions-scopes", "scope-1", "scope-2", "scope-3", "scope-3-datenqualitaet", "treibhausgasemissionen"],
  },
  "kondratieff-zyklus": {
    conceptStatus: "Quellen-/Bezugslinienbegriff",
    woekRelation: "Kondratieff-Zyklen bleiben ein allgemeines Deutungsmuster langer wirtschaftlicher Wellen. Der 6. Kondratieff ist davon als WÖk-spezifische Präzisierung zu trennen.",
    relatedTerms: ["sechster-kondratieff", "nikolai-kondratieff", "basisinnovation", "transformationswelle", "wirkungsinnovation"],
  },
  treibhausgasemissionen: {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["thg-emissions-scopes", "scope-1", "scope-2", "scope-3", "co2e", "global-warming-potential", "emissionsfaktor"],
  },
  faktencheck: {
    conceptStatus: "Anschlussbegriff",
    woekRelation: "Faktenchecks sind notwendig, aber nicht ausreichend. Die WÖk ergänzt sie um Folgencheck, Wirkungspotenzial, Resonanzraum und Vertrauensfolgen.",
    relatedTerms: ["fakten", "folgencheck", "faktenreaktanz", "wahrheit", "scheinwahrheit", "metakommunikation"],
  },
  folgencheck: {
    conceptStatus: "WÖk-Präzisierungsbegriff",
    woekRelation: "Ein Folgencheck prüft Wirkungspfade, Wirkungspotenziale, Wirkungsrisiken und mögliche Zustandsveränderungen einer Aussage, Maßnahme oder Entscheidung.",
    relatedTerms: ["faktencheck", "fakten", "wirkungspfad", "wirkungspotenzial", "wirkungsrisiko", "metakommunikation", "beobachtung-zweiter-ordnung"],
  },
  wirkungswahrheit: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Wirkungswahrheit beschreibt die Nähe einer Aussage, eines Preises, eines Produkts oder einer Entscheidung zu ihren tatsächlichen Folgen.",
    relatedTerms: ["wahrheit", "wahrhaftigkeit", "scheinwahrheit", "externalisierung", "folgencheck", "wirkungsblindheit"],
  },
  wohnwirkung: {
    relatedTerms: ["wirkungspflicht-eigentum"],
  },
  wirkungsvermietung: {
    relatedTerms: ["wirkungspflicht-eigentum"],
  },
  spekulationslogik: {
    relatedTerms: ["wirkungspflicht-eigentum"],
  },
};

for (const [id, patch] of Object.entries(coreUpdates)) {
  const existing = byId.get(id);
  if (!existing) continue;
  Object.assign(existing, {
    ...patch,
    concept_status: patch.conceptStatus || existing.concept_status,
    publicationStatus: existing.publicationStatus || "published",
    publication_status: existing.publication_status || "published",
    lastReviewed: today,
    last_reviewed: today,
    lastUpdated: today,
    updatedAt: today,
  });
  if (patch.relatedTerms) existing.relatedTerms = unique([...(existing.relatedTerms || []), ...patch.relatedTerms]);
  existing.related_terms = existing.relatedTerms || [];
}

const relationPatches = {
  wohnwirkung: ["wirkungspflicht-eigentum"],
  wirkungsvermietung: ["wirkungspflicht-eigentum"],
  spekulationslogik: ["wirkungspflicht-eigentum"],
};

for (const [id, relatedTerms] of Object.entries(relationPatches)) {
  const existing = byId.get(id);
  if (!existing) continue;
  existing.relatedTerms = unique([...(existing.relatedTerms || []), ...relatedTerms]);
  existing.related_terms = existing.relatedTerms;
}

const termIds = new Set(terms.map((item) => item.termId || item.id || item.slug));
for (const item of terms) {
  item.relatedTerms = unique(item.relatedTerms || []).filter((id) => termIds.has(id));
}
for (const item of terms) {
  for (const relatedId of item.relatedTerms || []) {
    const other = byId.get(relatedId);
    if (!other) continue;
    other.relatedTerms = unique([...(other.relatedTerms || []), item.termId]);
  }
}
for (const item of terms) {
  item.relatedTerms = unique(item.relatedTerms || []).filter((id) => id !== item.termId && termIds.has(id));
  item.related_terms = item.relatedTerms;
  item.publicationStatus ||= "published";
  item.publication_status ||= item.publicationStatus;
  item.concept_status ||= item.conceptStatus || "";
  item.source_links ||= item.sourceLinks || [];
  item.internal_links ||= item.internalLinks || [];
  item.last_reviewed ||= item.lastReviewed || today;
}

terms.sort((a, b) => new Intl.Collator("de", { sensitivity: "base", numeric: true }).compare(a.glossaryOrderKey || a.canonicalLabel, b.glossaryOrderKey || b.canonicalLabel));
raw.terms = terms;
raw.generatedAt = new Date().toISOString();
fs.writeFileSync(registryPath, `${JSON.stringify(raw, null, 2)}\n`);

fs.mkdirSync(glossaryDir, { recursive: true });

const sourceMarkdown = `# Glossar-Quellen und Bezugslinien

Stand: ${today}

Diese Datei bündelt Quellen fuer Glossarbegriffe. Externe Anschlussbegriffe werden nicht als WÖk-Prägungen ausgegeben, sondern wirkungsökonomisch eingeordnet.

## Klassische Ökonomie und Kapital

- Adam Smith: The Theory of Moral Sentiments
- Adam Smith: The Wealth of Nations
- Karl Marx: Das Kapital
- Karl Marx: Ökonomisch-philosophische Manuskripte
- Karl Polanyi: The Great Transformation
- Friedrich Hayek: The Use of Knowledge in Society
- John Maynard Keynes: The General Theory

## Ethik und Philosophie

- Immanuel Kant: Grundlegung zur Metaphysik der Sitten
- Immanuel Kant: Kritik der praktischen Vernunft
- Platon: Politeia, nur Backlog
- Hannah Arendt: Vita activa / The Human Condition
- Amartya Sen: Development as Freedom
- Martha Nussbaum: Creating Capabilities
- Grundgesetz Art. 1 und Art. 20a, https://www.gesetze-im-internet.de/gg/

## Sprache, Kommunikation und Konstruktivismus

- Ludwig Wittgenstein: Philosophische Untersuchungen
- Paul Watzlawick, Janet Beavin, Don Jackson: Pragmatics of Human Communication
- Paul Watzlawick: Die erfundene Wirklichkeit
- Ernst von Glasersfeld: Radical Constructivism
- Maturana / Varela: Autopoiesis and Cognition
- Maturana / Varela: Der Baum der Erkenntnis

## Systemtheorie / Kybernetik

- Humberto Maturana / Francisco Varela: Autopoiesis and Cognition
- Heinz von Foerster: Understanding Understanding
- Heinz von Foerster / Bernhard Pörksen: Wahrheit ist die Erfindung eines Lügners
- Stafford Beer: Brain of the Firm
- Stafford Beer: The Heart of Enterprise
- Stafford Beer: Diagnosing the System for Organizations
- Stafford Beer: The Viable System Model
- Gregory Bateson: Steps to an Ecology of Mind
- Niklas Luhmann: Soziale Systeme
- Donella Meadows: Leverage Points, https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/
- Donella Meadows: Thinking in Systems
- Frederic Vester: Vernetztes Denken

## Management

- Peter Drucker: The Practice of Management
- Peter Drucker: The Effective Executive
- Peter Drucker: Management: Tasks, Responsibilities, Practices
- Drucker Institute, https://drucker.institute/
- Hans Ulrich: Die Unternehmung als produktives soziales System
- St. Galler Management-Modell, https://www.sgmm.ch/en/about-the-model/history/
- Fredmund Malik: Führen Leisten Leben
- Fredmund Malik: Strategie des Managements komplexer Systeme
- Malik Management, https://www.malik-management.com/

## Innovation / Evolution

- Joseph A. Schumpeter: Theorie der wirtschaftlichen Entwicklung
- Joseph A. Schumpeter: Capitalism, Socialism and Democracy
- Nikolai Kondratieff: The Long Waves in Economic Life
- Jochen Röpke: Der lernende Unternehmer
- EconStor als Recherchepunkt fuer Röpke, Kondratieff und Lernebenen: https://www.econstor.eu/

## Transformation und Wohlstand

- Maja Göpel: Unsere Welt neu denken
- Kate Raworth: Doughnut Economics
- Mariana Mazzucato: Mission Economy
- Wellbeing Economy Alliance, https://weall.org/
- Stiglitz-Sen-Fitoussi Report
- OECD Measuring Well-being and Progress, https://www.oecd.org/wise/measuring-well-being-and-progress.htm
- Stockholm Resilience Centre: Planetary Boundaries, https://www.stockholmresilience.org/research/planetary-boundaries.html

## Daoismus / Prozessdenken

- Laozi: Daodejing
- Alan Watts: The Book
- Alan Watts: Taoist Way / Taoismus-Vorträge
- Daoismus wird nur als philosophische Bezugslinie fuer Prozessdenken, Nicht-Erzwingen und Eingebettetheit verwendet.

## Klima / Lebenszyklus

- IPCC AR6 Glossary, https://www.ipcc.ch/report/ar6/syr/downloads/report/IPCC_AR6_SYR_Annex-I.pdf
- IPCC WGII, https://www.ipcc.ch/report/ar6/wg2/
- EU JRC Life Cycle Assessment, https://eplca.jrc.ec.europa.eu/lifecycleassessment.html
- EU Product Environmental Footprint, https://eplca.jrc.ec.europa.eu/EnvironmentalFootprint.html
- ISO 14040, https://www.iso.org/standard/37456.html
- ISO 14064, https://www.iso.org/standard/66453.html
- ISO 14067, https://www.iso.org/standard/71206.html
- GHG Protocol Corporate Standard, https://ghgprotocol.org/corporate-standard
- GHG Protocol Scope 3 Standard, https://ghgprotocol.org/corporate-value-chain-scope-3-standard
- GHG Protocol Product Life Cycle Standard, https://ghgprotocol.org/sites/default/files/standards/Product-Life-Cycle-Accounting-Reporting-Standard_041613.pdf
- ESRS E1 Climate Change, https://www.efrag.org/en/sustainability-reporting/esrs
- JEC Well-to-Wheels, https://joint-research-centre.ec.europa.eu/welcome-jec-website/jec-activities/well-wheels-analyses_en
- Cradle to Cradle Certified, https://c2ccertified.org/the-standard

## Design / Business

- IDEO Design Thinking, https://designthinking.ideo.com/
- Stanford d.school, https://dschool.stanford.edu/
- Strategyzer Business Model Canvas, https://www.strategyzer.com/library/the-business-model-canvas
- Strategyzer Value Proposition Canvas, https://www.strategyzer.com/library/the-value-proposition-canvas
`;
fs.writeFileSync(sourcesPath, sourceMarkdown);

const processMarkdown = `# Glossar-Publizierungsprozess

Stand: ${today}

Bei jedem neuen Artikel oder jeder größeren Überarbeitung gilt:

1. Artikeltext scannen.
2. Erklärungsbedürftige Begriffe markieren.
3. Prüfen, ob ein Glossareintrag existiert.
4. Erste fachlich relevante Nennung verlinken oder durch Hover verfügbar machen.
5. Fehlende Begriffe als Kandidaten ins Backlink-Audit aufnehmen.
6. Relevanz prüfen: wiederkehrend, erklärungsbedürftig, eigene WÖk-Einordnung, Quellenlage, verwandte Begriffe.
7. Bei mindestens drei positiven Kriterien Glossarbegriff anlegen.
8. Related-Terms bidirektional ergänzen.
9. Quellen und Begriffstatus hinterlegen.
10. Suchindex, Sitemap, Glossarübersicht und Hover-Datei neu bauen.
11. Interne Linkprüfung ausführen.
12. Link-Überladung vermeiden: pro Seite nur die erste fachlich zentrale Nennung, bei langen Artikeln zusätzlich in einem späteren Hauptabschnitt.

Begriffstatus:

- WÖk-Kernbegriff
- WÖk-Präzisierungsbegriff
- Anschlussbegriff
- Methodenbegriff
- Quellen-/Bezugslinienbegriff
- Vordenker-/Bezugslinienbegriff
- Artikel-only / nicht ins Glossar

Publikationsstatus:

- published
- draft
- needs_source_check
- article_only
- deprecated
- merge_candidate
`;
fs.writeFileSync(processPath, processMarkdown);

const backlinkTerms = additions.filter((item) => item.publicationStatus === "published").map((item) => ({
  termId: item.termId,
  label: item.canonicalLabel,
  aliases: item.aliases,
}));
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || ["node_modules", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
walk(root);
const audit = {
  generatedAt: new Date().toISOString(),
  rule: "Nicht jede Nennung verlinken. Pro Seite maximal die erste fachlich zentrale Nennung, bei langen Artikeln zusätzlich in einem späteren Hauptabschnitt.",
  newTerms: backlinkTerms.length,
  backlog: [
    "Empathy Map",
    "User Journey",
    "Minimum Viable Product",
    "Lean Startup",
    "Validated Learning",
    "Additionalität",
    "Leakage",
    "Permanenz",
    "Offsetting",
    "Carbon Removal",
    "Carbon Capture",
    "Scope-3-Kategorien im Detail",
    "weitere Behavioral-Economics-Effekte nur bei konkreter Verwendung",
    "Platon",
    "Höhlengleichnis",
    "Aristoteles",
    "Hegel",
    "Nietzsche",
    "Habermas",
    "Foucault",
    "Bourdieu",
    "Rawls",
    "Jonas",
    "Latour",
    "Nassehi",
    "Rosa",
  ],
  terms: [],
};
for (const item of backlinkTerms) {
  const needles = unique(item.aliases).filter((alias) => alias.length > 3).slice(0, 6);
  const occurrences = [];
  for (const file of htmlFiles) {
    const rel = path.relative(root, file);
    if (rel.includes("node_modules") || rel.includes("assets/downloads")) continue;
    const text = fs.readFileSync(file, "utf8");
    const matched = needles.find((needle) => new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
    if (matched) occurrences.push({ file: rel, matched });
    if (occurrences.length >= 12) break;
  }
  audit.terms.push({
    termId: item.termId,
    label: item.label,
    suggestedPages: occurrences,
    action: occurrences.length ? "first_relevant_occurrence_hover_available_or_link_candidate" : "no_existing_occurrence_found",
  });
}
fs.writeFileSync(backlinkAuditPath, `${JSON.stringify(audit, null, 2)}\n`);

console.log(`Updated ${terms.length} glossary terms with architecture clusters.`);
console.log(`Wrote ${path.relative(root, sourcesPath)}, ${path.relative(root, processPath)} and ${path.relative(root, backlinkAuditPath)}.`);
