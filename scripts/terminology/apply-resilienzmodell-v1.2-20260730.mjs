import fs from "node:fs";

const registryPath = "assets/data/term-registry.json";
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const date = "2026-07-30";
const guide = "WOeK_Begriffsleitfaden_fuehrend_v1.2.md";
const article = "blog/systemresilienz-statt-nachhaltigkeit/";
const primarySources = [
  "Holling (1973), Resilience and Stability of Ecological Systems|https://doi.org/10.1146/annurev.es.04.110173.000245",
  "Carpenter et al. (2001), From Metaphor to Measurement: Resilience of What to What?|https://doi.org/10.1007/s10021-001-0045-9",
  "Walker et al. (2004), Resilience, Adaptability and Transformability in Social-Ecological Systems|https://www.ecologyandsociety.org/vol9/iss2/art5/",
  "Folke (2006), Resilience: The Emergence of a Perspective for Social-Ecological Systems Analyses|https://doi.org/10.1016/j.gloenvcha.2006.04.002",
  "IPCC (2022), AR6 WGII Annex II: Glossary – Resilience|https://doi.org/10.1017/9781009325844.029",
];
const sourceLinks = primarySources.map((source) => {
  const [title, url] = source.split("|");
  return { title, label: title, url, sourceType: "Primärquelle", status: "Referenz" };
});

const core = [
  "nachhaltigkeit", "resilienz", "systemresilienz", "wirkungsresilienz", "resilienzarchitektur",
  "resilienzmanagement", "nachhaltigkeitsmanagement", "stabilitaet", "robustheit", "rueckkopplung",
  "kipppunkt", "attraktor", "stabilitaetslandschaft", "latitude", "resistance", "precariousness",
  "panarchy", "rueckstellfaehigkeit", "daempfungsfaehigkeit", "anpassungsfaehigkeit", "transformationsfaehigkeit",
];
const related = [...core, "positive-netto-wirkung", "sdgs", "sdg-plus"].filter((slug) => slug !== "");

function unique(values) {
  return [...new Set((values || []).filter(Boolean).map((value) => String(value).trim()))];
}

function mergeSources(existing = []) {
  return unique([...existing, ...primarySources]);
}

function mergeLinks(existing = []) {
  return [...new Map([...existing, ...sourceLinks].map((entry) => [`${entry.title}|${entry.url}`, entry])).values()];
}

function sections({ definition, detail, walker = false, dynamic = false, separate = false }) {
  const entries = [
    { title: "Kurzdefinition", body: definition },
    { title: "Systemfrage", body: "Jede Resilienzaussage muss klären: Resilienz wovon, gegenüber welcher Störung, für wen, zur Erhaltung welcher Funktionen und mit welchen Folgen für andere Systeme?" },
    { title: "Stabilitätslandschaft und Rückkopplung", body: "Latitude, Resistance, Precariousness und Panarchy beschreiben die Stabilitätslandschaft, keine additive Punkteliste. Rückstellfähigkeit beschreibt die Rückkehr nach Wegfall einer Störung; Dämpfungsfähigkeit begrenzt Schwingungen, Überschwingen und Folgekaskaden." },
    { title: "Einordnung", body: detail },
  ];
  if (walker) entries.push({ title: "Wissenschaftliche Zuordnung", body: "Latitude, Resistance, Precariousness und Panarchy sind Anschlussbegriffe aus Walker et al. (2004). Adaptability und Transformability sind dort verwandte, eigenständige Fähigkeiten und nicht Teil der vier Landschaftsdimensionen." });
  if (dynamic) entries.push({ title: "Dynamische WÖk-Präzisierung", body: "Rückstellfähigkeit und Dämpfungsfähigkeit sind keine fünfte oder sechste Walker-Dimension. Sie machen stabilisierende, korrektive und regenerative Rückkopplungen, Puffer und Kaskadenbegrenzung in der WÖk-Erklärung ausdrücklich sichtbar." });
  if (separate) entries.push({ title: "Abgrenzung", body: "Resilienz ist nicht automatisch gut: Ein fossiler Lock-in oder autoritärer Machtapparat kann resilient sein. Nachhaltigkeit verlangt die langfristige Wirkungsresilienz eines MPD-tragfähigen Zustandsraums und gegebenenfalls die Transformation aus schädlichen Attraktoren." });
  entries.push(
    { title: "Querverweise", items: related },
    { title: "Zentraler Journalartikel", body: "Ausführlich: Nachhaltigkeit ist Systemresilienz im Journal der Wirkungsökonomie." },
    { title: "Primärquellen", items: primarySources.map((source) => source.split("|")[0]) },
  );
  return entries;
}

function record({ slug, label, aliases = [], definition, detail, category = "Systeme, Steuerung und Resilienz", walker = false, dynamic = false, separate = false, type = "Anschlussbegriff" }) {
  const existing = registry.terms.find((term) => term.slug === slug);
  const next = {
    ...(existing || {}),
    id: slug,
    termId: slug,
    label,
    canonicalLabel: label,
    slug,
    aliases: unique([label, ...(existing?.aliases || []), ...aliases]),
    synonyms: unique([label, ...(existing?.synonyms || []), ...aliases]),
    status: "approved",
    type,
    begriffstyp: type,
    version: "1.2",
    source: guide,
    sourceDocument: guide,
    sourceSection: "Resilienzsystematik",
    shortDefinition: definition,
    short_definition: definition,
    hoverDefinition: definition,
    definition,
    longDefinition: detail,
    long_definition: detail,
    woekRelation: detail,
    woek_einordnung: detail,
    category,
    categories: unique([...(existing?.categories || []), "resilienz", "wirkungsresilienz", "stabilitaetslandschaft"]),
    relatedTerms: unique([...(existing?.relatedTerms || []), ...related.filter((term) => term !== slug)]),
    related_terms: unique([...(existing?.related_terms || []), ...related.filter((term) => term !== slug)]),
    relatedDocuments: unique([...(existing?.relatedDocuments || []), article]),
    officialSources: mergeSources(existing?.officialSources),
    sourceLinks: mergeLinks(existing?.sourceLinks),
    source_links: mergeLinks(existing?.source_links),
    deepGlossarySections: sections({ definition, detail, walker, dynamic, separate }),
    doNotConfuseWith: unique([...(existing?.doNotConfuseWith || []), "Nachhaltigkeit als bloßen Zielzustand", "eine additive Acht-Punkte-Formel"]),
    classicGlossary: true,
    showInHub: true,
    showHover: true,
    autoLinkAllowed: true,
    maxAutoLinksPerPage: 1,
    pageUrl: `/begriffe/${slug}/`,
    metaTitle: `${label} | Glossar der Wirkungsökonomie`,
    metaDescription: definition,
    glossaryOrderKey: label,
    reviewStatus: "approved",
    conceptStatus: walker ? "wissenschaftlicher Anschlussbegriff" : (dynamic ? "WÖk-Präzisierungsbegriff" : "Anschlussbegriff"),
    concept_status: walker ? "wissenschaftlicher Anschlussbegriff" : (dynamic ? "WÖk-Präzisierungsbegriff" : "Anschlussbegriff"),
    publicationStatus: "published",
    publication_status: "published",
    lastUpdated: date,
    updatedAt: date,
    lastReviewed: date,
    last_reviewed: date,
    updatedBy: "Resilienzmodell v1.2",
  };
  if (existing) Object.assign(existing, next);
  else registry.terms.push(next);
}

record({
  slug: "nachhaltigkeit", label: "Nachhaltigkeit",
  definition: "Nachhaltigkeit ist die langfristige Wirkungsresilienz des gekoppelten Systems Mensch–Planet–Demokratie.",
  detail: "Nachhaltigkeit bezeichnet die langfristige Fähigkeit des gekoppelten Systems Mensch–Planet–Demokratie, innerhalb tragfähiger Grenzen zu bleiben oder in sie zurückzukehren, Lebens-, Regenerations- und demokratische Korrekturfunktionen zu erhalten oder wiederherzustellen, Abstand zu kritischen Schwellen zu bewahren, Störungen durch Rückstell- und Dämpfungsmechanismen zu bewältigen, zu lernen, sich anzupassen und schädliche Attraktoren nötigenfalls durch Transformation zu verlassen – ohne Schäden räumlich, sozial, ökologisch oder zeitlich zu externalisieren.",
  separate: true,
});
record({
  slug: "resilienz", label: "Resilienz",
  definition: "Resilienz bezeichnet die Fähigkeit eines klar abgegrenzten Systems, Störungen aufzunehmen und sich während Veränderung so zu reorganisieren, dass wesentliche Funktionen, Strukturen, Identität und Rückkopplungen innerhalb eines Attraktionsraums erhalten bleiben oder wiederhergestellt werden.",
  detail: "Resilienz ist zunächst wertneutral. Auch unerwünschte Systemzustände können resilient sein; deshalb braucht jede Aussage Systemgrenze, Störung, Betroffene, Funktionen und Folgen für andere Systeme.",
  separate: true,
});
record({
  slug: "systemresilienz", label: "Systemresilienz",
  definition: "Systemresilienz bezeichnet die Fähigkeit eines gekoppelten Systems, Belastungen innerhalb seines tragfähigen Zustandsraums aufzunehmen, zentrale Funktionen zu erhalten oder wiederherzustellen, kritische Schwellen nicht zu überschreiten, Rückstell- und Dämpfungsmechanismen wirksam zu halten und Einflüsse anderer Systemebenen zu verarbeiten.",
  detail: "Systemarchitektur beschreibt Regeln, Daten, Institutionen, Rückkopplungen und Strukturen. Systemresilienz beschreibt ihr dynamisches Verhalten unter Belastung; ob es erwünscht ist, hängt vom normativen Referenzrahmen ab.",
  separate: true,
});
record({
  slug: "wirkungsresilienz", label: "Wirkungsresilienz",
  definition: "Wirkungsresilienz bezeichnet in der Wirkungsökonomie die lernfähige und normativ an Mensch, Planet und Demokratie gebundene Systemresilienz.",
  detail: "Wirkungsresilienz verbindet die Resilienz eines MPD-tragfähigen Zustandsraums mit Anpassungs- und Transformationsfähigkeit. Sie schützt oder regeneriert zentrale Funktionen, begrenzt negative Wirkungen und Kaskaden, lernt aus Rückkopplungen und verlässt schädliche Attraktoren ohne Externalisierung.",
  dynamic: true, separate: true, type: "WÖk-Präzisierungsbegriff",
});
record({
  slug: "resilienzarchitektur", label: "Resilienzarchitektur", aliases: ["Resilience Architecture"],
  definition: "Resilienzarchitektur ist die Gesamtheit der Grenzen, Puffer, Redundanzen, Rückstell-, Dämpfungs-, Regenerations-, Lern- und Transformationsmechanismen sowie der Daten, Regeln, Institutionen und Rückkopplungen, durch die ein System seine tragenden Funktionen unter Belastung erhalten oder wiederherstellen kann.",
  detail: "Sie beschreibt die gestaltbaren Voraussetzungen der Systemresilienz, nicht deren Verhalten selbst.",
  dynamic: true,
});
record({
  slug: "resilienzmanagement", label: "Resilienzmanagement", aliases: ["Resilience Management", "Resilienz-Management"],
  definition: "Resilienzmanagement ist die bewusste Gestaltung und laufende Prüfung der Resilienzarchitektur.",
  detail: "Es beobachtet Latitude, Resistance, Precariousness und Panarchy, stärkt erwünschte Rückstell- und Dämpfungsmechanismen, baut Puffer und Regeneration auf, verringert schädliche Lock-ins und entwickelt Anpassungs- und Transformationsfähigkeit.",
  walker: true, dynamic: true,
});
record({
  slug: "nachhaltigkeitsmanagement", label: "Nachhaltigkeitsmanagement",
  definition: "Nachhaltigkeitsmanagement ist in der Wirkungsökonomie das Management der langfristigen Wirkungsresilienz von Mensch, Planet und Demokratie.",
  detail: "Es verbindet Wirkungsmessung, Risikofrüherkennung, Grenzachtung, Rückkopplung, Puffer, Regeneration, Anpassung und Transformation. Reporting ist ein Nachweis- und Lerninstrument, nicht die Nachhaltigkeit selbst.",
  dynamic: true, separate: true,
});
record({
  slug: "stabilitaet", label: "Stabilität", aliases: ["Systemstabilität"],
  definition: "Stabilität beschreibt die Eigenschaft eines Zustands oder Systems, unter bestimmten Bedingungen nicht stark zu schwanken oder nach einer Abweichung in einen Funktionsbereich zurückzufinden.",
  detail: "Stabilität ist nicht automatisch Nachhaltigkeit. Ein starrer, fossiler oder autoritärer Zustand kann stabil sein und zugleich Mensch, Planet oder Demokratie schädigen.",
  separate: true,
});
record({
  slug: "robustheit", label: "Robustheit",
  definition: "Robustheit bezeichnet die Fähigkeit eines Systems oder Bauteils, eine gegebene Form oder Leistung trotz Belastung aufrechtzuerhalten.",
  detail: "Robustheit kann ein Teil von Resilienz sein, umfasst aber nicht notwendigerweise Rückstellung, Dämpfung, Lernen, Anpassung oder Transformation.",
});
record({
  slug: "rueckkopplung", label: "Rückkopplung", aliases: ["Feedback"],
  definition: "Rückkopplung liegt vor, wenn Ergebnisse, Schäden, Nebenwirkungen oder Verbesserungen wieder auf das System zurückwirken und spätere Entscheidungen verändern.",
  detail: "Stabilisierende, korrektive und regenerative Rückkopplungen können Rückstellfähigkeit erzeugen. Negative Rückkopplung ist ein systemtheoretisch stabilisierender Begriff und nicht mit negativer Wirkung zu verwechseln.",
  dynamic: true,
});
record({
  slug: "kipppunkt", label: "Kipppunkt / Schwellenwert", aliases: ["Kipppunkt", "Schwellenwert"],
  definition: "Ein Kipppunkt ist eine kritische Schwelle, ab der ein System qualitativ in einen anderen Zustand oder Attraktionsraum übergeht.",
  detail: "Latitude beschreibt den Zustandsbereich bis zu einer Schwelle; Precariousness betrachtet zusätzlich die Nähe und Trajektorie relativ zu ihr.",
  walker: true,
});
record({
  slug: "attraktor", label: "Attraktor", aliases: ["Attraktionsraum", "Basin of attraction"],
  definition: "Ein Attraktor ist ein Zustand oder Zustandsbereich, zu dem ein dynamisches System unter seinen Bedingungen tendiert.",
  detail: "Ein Attraktor kann erwünscht oder schädlich sein. Rückstellfähigkeit wirkt innerhalb eines Zustandsraums; Transformationsfähigkeit schafft oder erreicht bei Bedarf einen anderen Attraktionsraum.",
  separate: true,
});
record({
  slug: "stabilitaetslandschaft", label: "Stabilitätslandschaft", aliases: ["Stabilitaetslandschaft", "Kugel-Becken-Modell", "Kugelmodell"],
  definition: "Eine Stabilitätslandschaft veranschaulicht Zustandsräume, Attraktoren, kritische Schwellen und die Dynamik eines Systems als Kugel in einer Landschaft aus Mulden und Barrieren.",
  detail: "Latitude, Resistance, Precariousness und Panarchy beschreiben unterschiedliche Aspekte dieser Landschaft. Rückstell- und Dämpfungsfähigkeit erläutern ihre Dynamik; Adaptability und Transformability sind verwandte, aber eigenständige Fähigkeiten.",
  walker: true, dynamic: true, separate: true,
});
record({ slug: "latitude", label: "Latitude", aliases: ["Toleranzbereich", "Breite des Attraktionsraums"], definition: "Latitude ist die Breite des Attraktionsraums bis zu einer kritischen Schwelle: der tolerierbare Zustandsbereich vor einem Regimewechsel.", detail: "Latitude ist nicht die Höhe des Randes. Die Barriere ergibt sich aus der Landschaftstopologie und gehört vor allem zur Resistance.", walker: true });
record({ slug: "resistance", label: "Resistance", aliases: ["Widerstand gegen Zustandsveränderung"], definition: "Resistance ist die Schwierigkeit, den Systemzustand vom Attraktor weg oder über eine Schwelle zu bewegen; sie wird durch Topologie, Tiefe, Steilheit und Barriere der Stabilitätslandschaft geprägt.", detail: "Resistance ist nicht Rückstellfähigkeit. Sie beschreibt die Veränderungsbarriere, während Rückstellfähigkeit die Bewegung nach Wegfall der äußeren Störung beschreibt.", walker: true });
record({ slug: "precariousness", label: "Precariousness", aliases: ["Prekarität relativ zur Schwelle", "Schwellennähe"], definition: "Precariousness beschreibt die aktuelle Nähe und Trajektorie eines Systems relativ zu einer kritischen Schwelle.", detail: "Sie ist nicht nur ein statischer Abstand: Auch Richtung und Geschwindigkeit der gegenwärtigen Entwicklung zählen.", walker: true });
record({ slug: "panarchy", label: "Panarchy", aliases: ["Skalenübergreifende Dynamik"], definition: "Panarchy bezeichnet den Einfluss von Dynamiken anderer räumlicher, zeitlicher oder institutioneller Ebenen auf den betrachteten Systemzustand und seine Stabilitätslandschaft.", detail: "Panarchy meint keine beliebigen äußeren Faktoren, sondern die Wirkung über- und untergeordneter Systeme auf Mulde, Barriere, Schwelle und Trajektorie.", walker: true });
record({ slug: "rueckstellfaehigkeit", label: "Rückstellfähigkeit", aliases: ["Rueckstellfaehigkeit", "Restorative capacity"], definition: "Rückstellfähigkeit ist die Fähigkeit eines Systems, nach Wegfall einer Störung durch stabilisierende, korrektive oder regenerative Rückkopplungen in einen tragfähigen Funktionsbereich zurückzukehren.", detail: "Im Kugel-Becken-Modell beschreibt sie Richtung und Stärke der Rückbewegung zum Attraktor. Sie ist eine dynamische Präzisierung der WÖk-Erklärung, kein weiterer Walker-Punkt.", dynamic: true });
record({ slug: "daempfungsfaehigkeit", label: "Dämpfungsfähigkeit", aliases: ["Daempfungsfaehigkeit", "Damping capacity"], definition: "Dämpfungsfähigkeit ist die Fähigkeit eines Systems, Schwingungen, Überschwingen, Kaskaden und Sekundärschäden durch Puffer, Reserven, Redundanzen oder institutionelle Mechanismen zu begrenzen.", detail: "Dämpfung ist nicht Rückstellung: Sie begrenzt die Bewegung, während Rückstellung die Richtung zurück zum tragfähigen Attraktor gibt. Sie ist eine dynamische Präzisierung, keine Walker-Dimension.", dynamic: true });
record({ slug: "anpassungsfaehigkeit", label: "Anpassungsfähigkeit / Adaptability", aliases: ["Anpassungsfähigkeit", "Anpassungsfaehigkeit", "Adaptability"], definition: "Anpassungsfähigkeit ist die Fähigkeit von Akteuren und Systemen, Regeln, Verhalten, Infrastruktur und Rückkopplungen zu verändern, um Verwundbarkeit innerhalb eines bestehenden Systemzusammenhangs zu reduzieren.", detail: "Adaptability ist bei Walker et al. (2004) eine verwandte eigenständige Fähigkeit, nicht eine der vier Stabilitätslandschafts-Dimensionen.", walker: true });
record({ slug: "transformationsfaehigkeit", label: "Transformationsfähigkeit / Transformability", aliases: ["Transformationsfähigkeit", "Transformationsfaehigkeit", "Transformability"], definition: "Transformationsfähigkeit ist die Fähigkeit, einen grundsätzlich neuen, tragfähigen Systemzustand beziehungsweise Attraktionsraum zu schaffen, wenn der bisherige Zustand unerwünscht oder unhaltbar ist.", detail: "Transformability ist bei Walker et al. (2004) eine verwandte eigenständige Fähigkeit, nicht eine der vier Stabilitätslandschafts-Dimensionen. Nachhaltigkeit braucht sie, um schädliche Attraktoren verlassen zu können.", walker: true, separate: true });

registry.generatedAt = `${date}T00:00:00.000Z`;
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Resilienzmodell v1.2 aktualisiert: ${core.length} Begriffe.`);
