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
};

const conceptStatusMap = {
  core: "WÖk-Kernbegriff",
  precision: "WÖk-Präzisierungsbegriff",
  connection: "Anschlussbegriff",
  method: "Methodenbegriff",
  sourceLine: "Quellen-/Bezugslinienbegriff",
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

## Systemtheorie / Kybernetik

- Humberto Maturana / Francisco Varela: Autopoiesis and Cognition
- Heinz von Foerster: Understanding Understanding
- Stafford Beer: Brain of the Firm
- Stafford Beer: The Viable System Model
- Donella Meadows: Leverage Points, https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/
- Frederic Vester: Vernetztes Denken

## Management

- Peter Drucker: The Effective Executive
- Peter Drucker: Management
- Drucker Institute, https://drucker.institute/
- St. Galler Management-Modell, https://www.sgmm.ch/en/about-the-model/history/
- Hans Ulrich: Die Unternehmung als produktives soziales System
- Fredmund Malik: Führen Leisten Leben
- Malik Management, https://www.malik-management.com/

## Innovation / Evolution

- Joseph A. Schumpeter: Theorie der wirtschaftlichen Entwicklung
- Joseph A. Schumpeter: Capitalism, Socialism and Democracy
- Nikolai Kondratieff: The Long Waves in Economic Life
- Jochen Röpke: Der lernende Unternehmer
- EconStor als Recherchepunkt fuer Röpke, Kondratieff und Lernebenen: https://www.econstor.eu/

## Daoismus / Prozessdenken

- Alan Watts: Taoist Way / Taoismus-Vorträge
- Daoismus wird nur als philosophische Bezugslinie fuer Prozessdenken, Nicht-Erzwingen und Eingebettetheit verwendet.

## Klima / Lebenszyklus

- IPCC AR6 Glossary, https://www.ipcc.ch/report/ar6/syr/downloads/report/IPCC_AR6_SYR_Annex-I.pdf
- IPCC WGII, https://www.ipcc.ch/report/ar6/wg2/
- EU JRC Life Cycle Assessment, https://eplca.jrc.ec.europa.eu/lifecycleassessment.html
- EU Product Environmental Footprint, https://eplca.jrc.ec.europa.eu/EnvironmentalFootprint.html
- ISO 14040, https://www.iso.org/standard/37456.html
- GHG Protocol Product Life Cycle Standard, https://ghgprotocol.org/sites/default/files/standards/Product-Life-Cycle-Accounting-Reporting-Standard_041613.pdf
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
