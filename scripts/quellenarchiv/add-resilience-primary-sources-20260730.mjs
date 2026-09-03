import fs from "node:fs";

const file = "content/quellenarchiv/sources.json";
const archive = JSON.parse(fs.readFileSync(file, "utf8"));
const cluster = "E";
const clusterLabel = "Systemtheorie / Kybernetik / Komplexität";
const entries = [
  {
    code: "WÖK-Q-1019",
    title: "Resilience and Stability of Ecological Systems",
    url: "https://doi.org/10.1146/annurev.es.04.110173.000245",
    doi: "10.1146/annurev.es.04.110173.000245",
    author: "C. S. Holling",
    year: 1973,
    summary: "Grundlagentext, der Resilienz als Fähigkeit ökologischer Systeme beschreibt, Störungen aufzunehmen und sich zu reorganisieren, ohne wesentliche Beziehungen zu verlieren.",
    einordnung: "Primärquelle für die Trennung von Resilienz und bloßer Stabilität. Sie stützt die WÖk-Definitionen, ohne die normative Bewertung selbst vorwegzunehmen.",
  },
  {
    code: "WÖK-Q-1020",
    title: "From Metaphor to Measurement: Resilience of What to What?",
    url: "https://doi.org/10.1007/s10021-001-0045-9",
    doi: "10.1007/s10021-001-0045-9",
    author: "S. R. Carpenter; B. Walker; J. M. Anderies; N. Abel",
    year: 2001,
    summary: "Präzisiert Resilienzdiagnostik über System, Störung und Zustandsraum und fordert, die Frage ‚Resilienz wovon gegenüber was?‘ explizit zu beantworten.",
    einordnung: "Primärquelle für die WÖk-Systemfrage: Resilienz wovon, gegenüber welcher Störung, für wen und zur Erhaltung welcher Funktionen?",
  },
  {
    code: "WÖK-Q-1021",
    title: "Resilience, Adaptability and Transformability in Social-ecological Systems",
    url: "https://www.ecologyandsociety.org/vol9/iss2/art5/",
    doi: "10.5751/ES-00650-090205",
    author: "B. Walker; C. S. Holling; S. R. Carpenter; A. Kinzig",
    year: 2004,
    summary: "Beschreibt Resilienz, Anpassungs- und Transformationsfähigkeit in sozial-ökologischen Systemen und ordnet Latitude, Resistance, Precariousness und Panarchy als diagnostische Aspekte ein.",
    einordnung: "Primärquelle für die Walker-Dimensionen. Diese werden auf der Website diagnostisch genutzt, nicht als additive Rechenformel.",
  },
  {
    code: "WÖK-Q-1022",
    title: "Resilience: The Emergence of a Perspective for Social-ecological Systems Analyses",
    url: "https://doi.org/10.1016/j.gloenvcha.2006.04.002",
    doi: "10.1016/j.gloenvcha.2006.04.002",
    author: "C. Folke",
    year: 2006,
    summary: "Übersicht zur Entwicklung der Resilienzperspektive für gekoppelte sozial-ökologische Systeme, einschließlich Anpassung, Lernen und Transformation.",
    einordnung: "Primärquelle für die Einordnung von Rückkopplungen, Lernen und Transformationsfähigkeit in gekoppelten Systemen.",
  },
  {
    code: "WÖK-Q-1023",
    title: "IPCC AR6 WGII Annex II: Glossary – Resilience",
    url: "https://doi.org/10.1017/9781009325844.029",
    doi: "10.1017/9781009325844.029",
    author: "Intergovernmental Panel on Climate Change (IPCC)",
    year: 2022,
    summary: "Offizielles IPCC-Glossar zu Resilienz im AR6-WGII-Bericht; ergänzt durch die Resilienzbezüge in Kapitel 1 und Kapitel 18.",
    einordnung: "Amtliche wissenschaftliche Referenz für Klima-, Risiko- und Anpassungskontexte. Die WÖk übernimmt daraus keine implizite Personenbewertung, sondern ordnet Resilienz systemisch ein.",
  },
].map((entry) => ({
  ...entry,
  type: "fachartikel",
  typeLabel: "Peer-reviewed Fachartikel",
  cluster,
  clusterLabel,
  origin: "extern",
  reviewStatus: "fuehrend",
  dataQuality: "peer-reviewed",
  impactFields: ["Mensch", "Planet", "Demokratie"],
  sdg: "SDG 13; SDG 16; SDG+ Systemqualität",
  domain: new URL(entry.url).hostname,
}));

for (const entry of entries) {
  const existing = archive.sources.findIndex((source) => source.doi === entry.doi || source.code === entry.code);
  if (existing >= 0) archive.sources[existing] = { ...archive.sources[existing], ...entry };
  else archive.sources.push(entry);
}

const currentJournalUpdates = {
  "WÖK-Q-0638": {
    title: "Nachhaltigkeit ist Systemresilienz",
    url: "https://wirkungsoekonomie.de/blog/systemresilienz-statt-nachhaltigkeit/",
    summary: "Journalbeitrag zur Nachhaltigkeit als langfristiger Wirkungsresilienz des gekoppelten Systems Mensch–Planet–Demokratie; mit Kugel-Becken-Modell, Walker-Dimensionen, Rückstellmechanismen und Regimeresilienz-Abgrenzung.",
    einordnung: "Aktuelle WÖk-Grundlagenfassung. Sie ordnet SDGs und SDG+ als Referenzrahmen positiver Netto-Wirkung ein, trennt Systemarchitektur vom Verhalten unter Belastung und macht Nicht-Externalisierung sowie Nichtkompensation sichtbar.",
  },
  "WÖK-Q-0650": {
    summary: "Einführender Journalartikel zur Nachhaltigkeit als langfristiger Wirkungsresilienz von Mensch, Planet und Demokratie; verweist auf die ausführliche Systemresilienz-Einordnung.",
    einordnung: "Aktualisierte Einordnung eines Grundlagenbeitrags. Unternehmens-, Immobilien- oder Versorgungsresilienz werden als Teilsystembeiträge verstanden; Nachhaltigkeit umfasst die langfristige Wirkungsresilienz des gekoppelten MPD-Systems.",
  },
};
for (const [code, update] of Object.entries(currentJournalUpdates)) {
  const record = archive.sources.find((source) => source.code === code);
  if (!record) throw new Error(`Aktueller Journaldatensatz fehlt: ${code}`);
  Object.assign(record, update);
}
archive.count = archive.sources.length;
archive.generatedAt = "2026-07-30T00:00:00.000Z";
const clusterRecord = archive.clusters.find((item) => item.key === cluster);
if (clusterRecord) clusterRecord.count = archive.sources.filter((source) => source.cluster === cluster).length;
fs.writeFileSync(file, `${JSON.stringify(archive, null, 2)}\n`);
console.log(`Quellenarchiv: ${entries.length} Resilienz-Primärquellen ergänzt; Gesamtbestand ${archive.count}.`);
