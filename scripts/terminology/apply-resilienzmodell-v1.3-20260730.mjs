import fs from "node:fs";

const registryPath = "assets/data/term-registry.json";
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const date = "2026-07-30";
const guide = "WOeK_Begriffsleitfaden_fuehrend_v1.3.md";
const publication = "nachhaltigkeit-als-systemresilienz-definition-und-klimamodell";
const publicationRoute = "bibliothek/nachhaltigkeit-als-systemresilienz-definition-und-klimamodell/";
const journal = "blog/systemresilienz-statt-nachhaltigkeit/";
const guideRoute = "bibliothek/woek-begriffsleitfaden-fuehrend/";
const sourceRecord = {
  title: "WÖk (2026): Nachhaltigkeit als Systemresilienz. Resilienzdefinition, Kugelmodell, Klima-Beispiel und mathematische Herleitung",
  label: "WÖk (2026): Nachhaltigkeit als Systemresilienz",
  url: `/${publicationRoute}`,
  sourceType: "WÖk-Fachveröffentlichung",
  status: "Vertiefung",
};
const core = [
  "nachhaltigkeit", "resilienz", "systemresilienz", "wirkungsresilienz", "resilienzarchitektur",
  "resilienzmanagement", "nachhaltigkeitsmanagement", "stabilitaet", "robustheit", "rueckkopplung",
  "attraktor", "stabilitaetslandschaft", "kipppunkt", "rueckstellfaehigkeit", "daempfungsfaehigkeit",
  "anpassungsfaehigkeit", "transformationsfaehigkeit", "latitude", "resistance", "precariousness", "panarchy",
];

const definitions = {
  nachhaltigkeit: [
    "Nachhaltigkeit ist die langfristig gesicherte Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie.",
    "Nachhaltigkeit bezeichnet die dauerhaft gesicherte Fähigkeit des gekoppelten Systems Mensch-Planet-Demokratie, innerhalb tragfähiger und nicht beliebig kompensierbarer Grenzen funktions-, regenerations-, lern- und transformationsfähig zu bleiben. Das System kann Störungen aufnehmen, lebensnotwendige und demokratische Grundfunktionen durch stabilisierende, korrektive und regenerative Rückkopplungen erhalten oder wiederherstellen, ausreichend Abstand zu kritischen Schwellen bewahren, Einflüsse anderer Ebenen verarbeiten und schädliche Attraktoren verlassen - ohne Belastungen räumlich, sozial, ökologisch oder zeitlich zu externalisieren.",
  ],
  resilienz: [
    "Resilienz ist die Fähigkeit eines Systems, Störungen aufzunehmen, auf sie zu reagieren oder sich neu zu organisieren, dabei wesentliche Funktionen, Identität und Struktur zu erhalten oder wiederherzustellen und zugleich die Fähigkeit zu Anpassung, Lernen und Transformation zu bewahren.",
    "Resilienz ist zunächst beschreibend: Auch ein unerwünschter Systemzustand kann resilient sein. Jede Resilienzaussage muss deshalb Systemgrenze, Störung, Betroffene, Funktionen und Folgen für andere Systeme benennen.",
  ],
  systemresilienz: [
    "Systemresilienz bezeichnet die Fähigkeit eines klar abgegrenzten Systems, Störungen zu verarbeiten, wesentliche Funktionen unter Belastung zu erhalten, wiederherzustellen oder angepasst fortzuführen und seine Anpassungs-, Lern- und Transformationsfähigkeit zu bewahren.",
    "Systemresilienz beschreibt dynamisches Verhalten unter Belastung. Ohne Systemgrenze, Störung, Betroffene und Funktionen bleibt der Begriff unvollständig. Systemarchitektur beschreibt dagegen die Bauweise aus Regeln, Daten, Institutionen, Grenzen, Puffern und Rückkopplungen.",
  ],
  wirkungsresilienz: [
    "Wirkungsresilienz bezeichnet in der Wirkungsökonomie die lernfähige und normativ an Mensch, Planet und Demokratie gebundene Resilienz des gekoppelten Systems.",
    "Wirkungsresilienz erkennt negative Wirkungen und Störungen früh, schützt oder stellt Funktionen wieder her, baut Puffer und Regeneration auf, lernt aus Rückkopplungen, passt sich an und transformiert untragbare Strukturen - ohne Schäden räumlich, sozial oder zeitlich zu externalisieren.",
  ],
  resilienzarchitektur: [
    "Resilienzarchitektur ist die gestaltbare Gesamtheit von Grenzen, Daten, Regeln, Institutionen, Puffern, Redundanzen und Rückkopplungen, die Systemresilienz ermöglichen.",
    "Resilienzarchitektur beschreibt die Bauweise; Systemresilienz beschreibt das dynamische Verhalten dieser Bauweise unter Belastung. Zu ihr gehören stabilisierende, korrektive und regenerative Rückkopplungen ebenso wie Lern- und Transformationsmöglichkeiten.",
  ],
  resilienzmanagement: [
    "Resilienzmanagement ist die bewusste Gestaltung und laufende Prüfung einer Resilienzarchitektur für ein klar bestimmtes System.",
    "Es klärt Systemgrenze, Störung, Betroffene und Funktionen, diagnostiziert Stabilitätslandschaft, Rückstellung und Dämpfung, baut Puffer und Regeneration auf und entwickelt Anpassungs- und Transformationsfähigkeit. Ein stabiler Teilsystemvorteil genügt nicht, wenn er Schäden externalisiert.",
  ],
  nachhaltigkeitsmanagement: [
    "Nachhaltigkeitsmanagement ist das Management von Beiträgen zur langfristig gesicherten Wirkungsresilienz von Mensch, Planet und Demokratie.",
    "Es verbindet Wirkungs-, Risiko- und Rückkopplungssteuerung mit Grenzachtung, Regeneration, Lernen und Nicht-Externalisierung. Reporting, ESG-Berichte und Audits können Nachweise und Lerninstrumente sein, nicht Nachhaltigkeit selbst.",
  ],
  stabilitaet: [
    "Stabilität beschreibt die Eigenschaft eines Zustands oder Systems, unter bestimmten Bedingungen nicht stark zu schwanken oder nach einer Abweichung in einen Funktionsbereich zurückzufinden.",
    "Stabilität ist nicht automatisch Resilienz und nicht automatisch Nachhaltigkeit. Ein starrer, fossiler oder autoritärer Zustand kann stabilisiert sein und zugleich Mensch, Planet oder Demokratie schädigen.",
  ],
  robustheit: [
    "Robustheit bezeichnet die Fähigkeit eines Systems oder Bauteils, eine gegebene Form oder Leistung trotz Belastung aufrechtzuerhalten.",
    "Robustheit kann ein Teil von Resilienz sein, umfasst aber nicht notwendig Reorganisation, Rückstellung, Dämpfung, Lernen, Anpassung oder Transformation. Hohe Robustheit kann auch einen schädlichen Lock-in sichern.",
  ],
  rueckkopplung: [
    "Rückkopplung liegt vor, wenn Ergebnisse, Schäden, Nebenwirkungen oder Verbesserungen wieder auf ein System zurückwirken und spätere Entscheidungen oder Zustände verändern.",
    "Stabilisierende, korrektive und regenerative Rückkopplungen können Rückstellfähigkeit erzeugen. Negative Rückkopplung kann in der Systemtheorie stabilisieren und ist nicht mit negativer Wirkung zu verwechseln.",
  ],
  attraktor: [
    "Ein Attraktor ist ein Zustand oder Zustandsbereich, zu dem ein dynamisches System unter seinen Bedingungen tendiert.",
    "Attraktoren können erwünscht oder schädlich sein. Rückstellfähigkeit stabilisiert innerhalb eines Zustandsraums; Transformationsfähigkeit schafft oder erreicht bei Bedarf einen anderen tragfähigen Attraktor.",
  ],
  stabilitaetslandschaft: [
    "Eine Stabilitätslandschaft veranschaulicht Zustandsräume, Attraktoren, Schwellen und Trajektorien als Kugel in einer Landschaft aus Mulden und Barrieren.",
    "Latitude, Resistance, Precariousness und Panarchy sind vier analytische Aspekte dieser Landschaft. Rückstell- und Dämpfungsfähigkeit erklären die dynamische Antwort; Anpassungs- und Transformationsfähigkeit bleiben verwandte, eigenständige Fähigkeiten.",
  ],
  kipppunkt: [
    "Ein Kipppunkt ist eine kritische Schwelle, ab der ein System qualitativ in einen anderen Zustand oder Attraktionsraum übergeht.",
    "Kipppunkte entstehen in mehrdimensionalen, gekoppelten Landschaften. Latitude beschreibt den Spielraum bis zur Schwelle, Precariousness die aktuelle Nähe und Trajektorie; kein einzelner Indikator ersetzt die Systemdiagnose.",
  ],
  rueckstellfaehigkeit: [
    "Rückstellfähigkeit ist die Fähigkeit eines Systems, nach Wegfall einer Störung durch stabilisierende, korrektive oder regenerative Rückkopplungen in einen tragfähigen Funktionsbereich zurückzukehren.",
    "Sie beschreibt Richtung und Stärke der Rückbewegung zum Attraktor. Rückstellfähigkeit ist nicht Resistance und keine weitere Walker-Dimension; sie macht die dynamische Antwort eines Systems sichtbar.",
  ],
  daempfungsfaehigkeit: [
    "Dämpfungsfähigkeit ist die Fähigkeit eines Systems, Schwingungen, Überschwingen, Kaskaden und Sekundärschäden durch Puffer, Reserven, Redundanzen oder institutionelle Mechanismen zu begrenzen.",
    "Dämpfung begrenzt die Bewegung, Rückstellung gibt die Richtung. Ozeane sind im Klima-Beispiel Wärmespeicher mit hoher thermischer Trägheit: Sie puffern und verzögern Temperaturreaktionen, sind aber nicht wörtlich mechanische Reibung.",
  ],
  anpassungsfaehigkeit: [
    "Anpassungsfähigkeit ist die Fähigkeit von Akteuren und Systemen, Regeln, Verhalten, Infrastruktur und Rückkopplungen zu verändern, um Verwundbarkeit innerhalb eines noch tragfähigen Zustandsraums zu reduzieren.",
    "Adaptability ist bei Walker et al. (2004) eine verwandte eigenständige Fähigkeit, nicht eine der vier Stabilitätslandschafts-Dimensionen. Anpassung ersetzt weder Ursachenminderung noch Transformation aus einem schädlichen Attraktor.",
  ],
  transformationsfaehigkeit: [
    "Transformationsfähigkeit ist die Fähigkeit, einen grundsätzlich neuen, tragfähigen Systemzustand oder Attraktionsraum zu schaffen, wenn der bisherige Zustand unerwünscht oder unhaltbar ist.",
    "Transformability ist bei Walker et al. (2004) eine verwandte eigenständige Fähigkeit, nicht eine der vier Stabilitätslandschafts-Dimensionen. Nachhaltigkeit braucht sie, um fossile, repressive oder externalisierende Attraktoren zu verlassen.",
  ],
  latitude: [
    "Latitude ist die Breite des Attraktionsraums bis zu einer kritischen Schwelle: der tolerierbare Zustandsbereich vor einem Regimewechsel.",
    "Latitude ist nicht die Höhe des Randes. Sie beschreibt den Spielraum im Zustandsraum; Barrieren und Veränderungswiderstand gehören stärker zur Resistance.",
  ],
  resistance: [
    "Resistance ist die Schwierigkeit, einen Systemzustand vom Attraktor weg oder über eine Schwelle zu bewegen; sie wird durch Tiefe, Steilheit und Barrieren der Stabilitätslandschaft geprägt.",
    "Resistance ist nicht Rückstellfähigkeit. Hohe Resistance kann erwünschte Funktionen schützen oder schädliche Lock-ins gegen notwendige Veränderung stabilisieren.",
  ],
  precariousness: [
    "Precariousness beschreibt die aktuelle Nähe und Trajektorie eines Systems relativ zu einer kritischen Schwelle.",
    "Precariousness ist nicht nur ein statischer Abstand. Richtung und Geschwindigkeit der Entwicklung zählen, weil ein noch funktionierendes System trotzdem nur geringe Sicherheitsreserven haben kann.",
  ],
  panarchy: [
    "Panarchy bezeichnet den Einfluss von Dynamiken anderer räumlicher, zeitlicher oder institutioneller Ebenen auf den betrachteten Systemzustand und seine Stabilitätslandschaft.",
    "Panarchy meint nicht beliebige äußere Faktoren, sondern skalenübergreifende Veränderungen von Mulden, Barrieren, Schwellen und Trajektorien. Lokale Teilsystemresilienz kann durch globale Dynamiken geschwächt oder gestärkt werden.",
  ],
};

const unique = (values) => [...new Set((values || []).filter(Boolean).map((value) => String(value).trim()))];
const mergeLinks = (existing = []) => {
  const values = [sourceRecord, ...existing];
  return [...new Map(values.map((entry) => [`${entry.title}|${entry.url}`, entry])).values()];
};

for (const slug of core) {
  const term = registry.terms.find((entry) => entry.slug === slug);
  if (!term) throw new Error(`Glossarbegriff fehlt: ${slug}`);
  const [shortDefinition, detail] = definitions[slug];
  Object.assign(term, {
    version: "1.3",
    source: guide,
    sourceDocument: guide,
    sourceSection: "Resilienzmodell v1.3",
    shortDefinition,
    short_definition: shortDefinition,
    hoverDefinition: shortDefinition,
    definition: shortDefinition,
    longDefinition: detail,
    long_definition: detail,
    woekRelation: detail,
    woek_einordnung: detail,
    relatedDocuments: unique([...(term.relatedDocuments || []), publication, journal, guideRoute]),
    sourceLinks: mergeLinks(term.sourceLinks),
    source_links: mergeLinks(term.source_links),
    deepGlossarySections: [
      { title: "Kurzdefinition", body: shortDefinition },
      { title: "Systemfrage", body: "Jede Resilienzaussage muss klären: Resilienz wovon, gegenüber welcher Störung, für wen, zur Erhaltung welcher Funktionen und mit welchen Folgen für andere Systeme?" },
      { title: "Acht Analysebausteine", body: "Latitude, Resistance, Precariousness und Panarchy beschreiben die Stabilitätslandschaft. Rückstell- und Dämpfungsfähigkeit erklären die dynamische Antwort. Anpassungs- und Transformationsfähigkeit beschreiben Systementwicklung. Diese acht Bausteine sind keine additive Punkteliste und nicht als acht Walker-Punkte zu bezeichnen." },
      { title: "Einordnung", body: detail },
      { title: "Vertiefung", body: "Die vollständige Herleitung mit Kugel-Becken-Modell, Klima-Beispiel und MPD-Zustandsraum steht in der Bibliotheksveröffentlichung Nachhaltigkeit als Systemresilienz." },
      { title: "Querverweise", items: unique([...(term.relatedTerms || []), ...core.filter((candidate) => candidate !== slug)]) },
    ],
    lastUpdated: date,
    updatedAt: date,
    lastReviewed: date,
    last_reviewed: date,
    updatedBy: "Resilienzmodell v1.3",
    reviewStatus: "approved",
    publicationStatus: "published",
    publication_status: "published",
  });
}

registry.generatedAt = `${date}T00:00:00.000Z`;
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Resilienzmodell v1.3 aktualisiert: ${core.length} Begriffe.`);
