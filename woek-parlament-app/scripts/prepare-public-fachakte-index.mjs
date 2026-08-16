import fs from "node:fs";
import path from "node:path";

const inputRoot = process.argv[2];
const outputPath = process.argv[3];
if (!inputRoot || !outputPath) throw new Error("Usage: node prepare-public-fachakte-index.mjs <source-root> <output-path>");

const programmeNarratives = {
  "ltw-2026-st-afd": {
    resultHeadline: "Hohe Eingriffstiefe – die Wirkungsrichtung hängt besonders von Schutzgrenzen und Ausgestaltung ab.",
    resultTeaser: "Das Programm verbindet weitreichende Änderungen bei Sicherheit, Migration, Familie, Verwaltung und öffentlichen Finanzen. Möglichen Entlastungs-, Ordnungs- und Unterstützungswirkungen stehen erhebliche Freiheits-, Gleichbehandlungs-, Verteilungs- und Vertrauensrisiken gegenüber.",
    potentialHighlights: [
      "Unterstützungs-, Bildungs-, Verwaltungs- und Sicherheitsmaßnahmen können Zugang, Handlungsfähigkeit und Versorgung verändern.",
      "Einzelne Vorschläge setzen an konkreten Engpässen wie vorschulischer Bildung, Familienunterstützung und Verwaltungskapazität an."
    ],
    riskHighlights: [
      "Überbreite Eingriffsbefugnisse, pauschale Gruppenbilder und unklare Abgrenzungen können Freiheit, Gleichbehandlung und gesellschaftliches Vertrauen beeinträchtigen.",
      "Entlastungen und Leistungsausweitungen ohne belastbare Gegenfinanzierung können öffentliche Handlungskapazität oder kommende Generationen belasten."
    ],
    conditions: [
      "Rechtsschutz, Ausnahmen und Eingriffsvoraussetzungen müssen vor einer bindenden Entscheidung konkretisiert werden.",
      "Benötigt werden Baselines, Gegenfaktum, Finanzierungs- und Verteilungsdaten sowie überprüfbare Korrekturregeln."
    ],
    communicationNote: "Die Fachakte weist kommunikative Vorwirkungen als materiellen Prüfpfad aus. Eine gesellschaftliche Wirkung wird daraus ohne Reichweiten-, Wiederholungs- und Einstellungsdaten nicht abgeleitet."
  },
  "ltw-2026-st-bsw": {
    resultHeadline: "Breites Umbauprogramm – viele zentrale Hebel reichen über die Zuständigkeit des Landes hinaus.",
    resultTeaser: "Soziale Sicherheit, demokratische Beteiligung, Energieversorgung, Medienordnung und analoger Zugang zu digitalen Leistungen bilden zentrale Prüfcluster. Wirkungspotenzial besteht, bleibt aber stark von Finanzierung, rechtlicher Zuständigkeit und konkreter Umsetzung abhängig.",
    potentialHighlights: [
      "Bürgerbudgets, analoge Zugangswege und soziale Sicherungsansätze können Teilhabe und Erreichbarkeit stärken.",
      "Vorschläge zu Energie, Verwaltung und öffentlicher Infrastruktur können Preise, Versorgungssicherheit und staatliche Handlungsfähigkeit verändern."
    ],
    riskHighlights: [
      "Ungeklärte Zuständigkeiten zwischen Land, Bund und Europa können Zusagen praktisch unwirksam machen.",
      "Fehlende Finanzierungs-, Förder- und Vollzugsparameter lassen Verteilungswirkungen und Folgekosten offen."
    ],
    conditions: [
      "Für zentrale Vorhaben müssen Landeskompetenz, Finanzierungsweg und überprüfbarer Zielzustand benannt werden.",
      "Erforderlich sind gruppen- und regionalspezifische Ausgangsdaten sowie belastbare Umsetzungs- und Evaluationsregeln."
    ],
    communicationNote: "Kommunikative Vorwirkungen werden als eigener Prüfpfad behandelt; aus dem Programmtext allein folgt keine beobachtete gesellschaftliche Wirkung."
  },
  "ltw-2026-st-cdu": {
    resultHeadline: "Sicherheit, Wirtschaft und Bevölkerungsschutz stehen im Zentrum – entscheidend sind konkrete Instrumente und Ressourcen.",
    resultTeaser: "Das Programm setzt auf Entlastung, Investition, Sicherheits- und Katastrophenschutz sowie gesellschaftliches Engagement. Die Zielrichtungen sind erkennbar; Wirkung bleibt offen, solange Schwellen, Finanzierung, Zusätzlichkeit und Vollzugskapazität nicht feststehen.",
    potentialHighlights: [
      "Investitions-, Forschungs- und Entlastungsansätze können regionale Wertschöpfung, Innovation und Beschäftigung unterstützen.",
      "Bevölkerungs-, Brand- und Katastrophenschutz können Resilienz und Reaktionsfähigkeit verbessern."
    ],
    riskHighlights: [
      "Entlastungen können Mitnahmeeffekte erzeugen oder öffentliche Leistungen schwächen, wenn zusätzliche Wirkung und Gegenfinanzierung fehlen.",
      "Sicherheitsmaßnahmen brauchen enge Eingriffsgrenzen, Datenschutz und überprüfbaren Rechtsschutz."
    ],
    conditions: [
      "Finanzierungsumfang, Förderkriterien, Schwellenwerte und zuständige Vollzugsstellen müssen festgelegt werden.",
      "Erfolg ist an reale Investitionen, Einsatzfähigkeit und Zustandsverbesserungen statt an Mittelabfluss zu messen."
    ]
  },
  "ltw-2026-st-gruene": {
    resultHeadline: "Natur-, Klima- und Agrartransformation prägen das Programm – Netto-Wirkung entscheidet sich im Vollzug.",
    resultTeaser: "Ökologischer Landbau, Natur- und Artenschutz, Klimaanpassung und Beteiligungsrechte bilden zentrale Wirkungsfelder. Positive Zielbezüge sind plausibel, dürfen aber Flächen-, Verteilungs-, Akzeptanz- und Umsetzungskonflikte nicht verdecken.",
    potentialHighlights: [
      "Natur-, Wasser-, Boden- und Klimaschutzmaßnahmen können ökologische Resilienz und regionale Wertschöpfung stärken.",
      "Wissenschaftsbasierte Regeln und Beteiligungsrechte können Entscheidungen nachvollziehbarer und korrekturfähiger machen."
    ],
    riskHighlights: [
      "Flächen-, Rohstoff- und Nutzungskonflikte können Belastungen zwischen Regionen und Gruppen verlagern.",
      "Förder- und Schutzinstrumente bleiben ohne Personal, Kontrolle und messbare Zielzustände leicht auf Output beschränkt."
    ],
    conditions: [
      "Benötigt werden ökologische Baselines, regionale Verteilungsdaten sowie klare Förder- und Kontrollkriterien.",
      "Zielkonflikte zwischen Schutz, Produktion, Infrastruktur und Bezahlbarkeit müssen vor Entscheidungen sichtbar geprüft werden."
    ]
  },
  "ltw-2026-st-linke": {
    resultHeadline: "Soziale Infrastruktur, Bildung und Beteiligung bieten breites Potenzial – Finanzierung und Kapazität sind der Engpass.",
    resultTeaser: "Investitionen in Kitas, Schulen, Hochschulen, soziale Angebote, Ehrenamt und demokratische Beteiligung stehen im Vordergrund. Die angestrebten Zugangs- und Teilhabewirkungen sind plausibel, aber ohne Personal-, Finanzierungs- und Vollzugsplan nicht belastbar gesichert.",
    potentialHighlights: [
      "Soziale und Bildungsinfrastruktur kann Zugang, Chancengerechtigkeit, Versorgung und regionale Teilhabe verbessern.",
      "Direkte Beteiligung und die Stärkung des Ehrenamts können demokratische Mitwirkung und lokale Handlungsfähigkeit fördern."
    ],
    riskHighlights: [
      "Zusätzliche Ansprüche ohne dauerhaftes Personal und Finanzierung können Wartezeiten, Überlastung oder Scheinangebote erzeugen.",
      "Förder- und Beteiligungsmodelle brauchen transparente Kriterien, damit Zugang und Repräsentation nicht ungleich verteilt werden."
    ],
    conditions: [
      "Erforderlich sind ein finanzierter Umsetzungsplan, Personalbedarf, regionale Bedarfsdaten und messbare Qualitätsziele.",
      "Beteiligungsinstrumente müssen Barrierefreiheit, Repräsentativität, Transparenz und Rückkopplung sichern."
    ]
  },
  "ltw-2026-st-spd": {
    resultHeadline: "Beschäftigung, soziale Versorgung und Strukturwandel bilden die Haupthebel – Personal und Umsetzung entscheiden.",
    resultTeaser: "Das Programm verbindet Beschäftigungsfähigkeit, Bildung, Gesundheit, Energie- und Strukturpolitik. Potenziale für Teilhabe, Versorgung und regionale Entwicklung sind erkennbar; ihre Realisierung hängt besonders von Fachkräften, Finanzierung und überprüfbaren Zielgrößen ab.",
    potentialHighlights: [
      "Qualifizierung, Bildungszugang und Beschäftigungsförderung können Erwerbschancen und soziale Sicherheit stärken.",
      "Gesundheits-, Energie- und Strukturmaßnahmen können Versorgung, Resilienz und regionale Wertschöpfung verbessern."
    ],
    riskHighlights: [
      "Neue Programme ohne Personal und dauerhafte Finanzierung können Verwaltungsaktivität statt Zustandsverbesserung erzeugen.",
      "Kosten und Nutzen von Energie-, Förder- und Sozialmaßnahmen können zwischen Haushalten und Regionen ungleich verteilt sein."
    ],
    conditions: [
      "Personal-, Finanzierungs- und Zuständigkeitsfragen müssen je Maßnahme vor der Umsetzung geklärt werden.",
      "Ausgangswerte, Zielgruppen, Gegenfaktum und Korrekturtrigger müssen in ein verbindliches Monitoring überführt werden."
    ]
  }
};

const output = { schemaVersion: "1.1.0", programmes: {}, cases: {} };
const programmeSets = [
  ["03_sachsen_anhalt_programme/results", "programme-review.json"],
  ["01_bundesprogramme/results", "programme-wirkungsakte.json"]
];
for (const [folder, name] of programmeSets) {
  const directory = path.join(inputRoot, folder);
  for (const entry of fs.readdirSync(directory)) {
    const source = path.join(directory, entry, name);
    if (!fs.existsSync(source)) continue;
    const review = JSON.parse(fs.readFileSync(source, "utf8"));
    output.programmes[review.source_key] = {
      summary: review.plain_language_summary ?? null,
      commitments: Array.isArray(review.material_commitments) ? review.material_commitments.length : Array.isArray(review.commitment_assessments) ? review.commitment_assessments.length : 0,
      impactPaths: Array.isArray(review.central_impact_paths) ? review.central_impact_paths.length : 0,
      domains: Array.isArray(review.programme_profile?.material_policy_domains) ? review.programme_profile.material_policy_domains.length : 0,
      ...(programmeNarratives[review.source_key] ?? {})
    };
  }
}
for (const caseId of fs.readdirSync(path.join(inputRoot, "02_parlament_28_and_votes/cases"))) {
  const source = path.join(inputRoot, "02_parlament_28_and_votes/cases", caseId, "review-result.json");
  if (!fs.existsSync(source)) continue;
  const review = JSON.parse(fs.readFileSync(source, "utf8"));
  output.cases[caseId] = {
    title: review.public_summary?.headline ?? review.release_1_0?.public_title ?? null,
    summary: review.public_summary?.key_statement ?? review.release_1_0?.public_key_statement ?? null,
    impactPaths: Array.isArray(review.impact_paths) ? review.impact_paths.length : 0,
    calculations: Array.isArray(review.calculation_requirements) ? review.calculation_requirements.length : 0,
    dataGaps: Array.isArray(review.data_gaps) ? review.data_gaps.length : 0
  };
}
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ programmes: Object.keys(output.programmes).length, cases: Object.keys(output.cases).length }));
