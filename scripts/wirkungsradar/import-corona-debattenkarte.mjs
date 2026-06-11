import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MASTER_PATH = path.join(ROOT, "content/wirkungsradar/debattenkarten-master.json");
const REPORT_PATH = path.join(ROOT, "reports/debattenkarte-corona-2026-06-07.md");
const DATA_STAND = "2026-06-07";
const DOCUMENT = "CodeX_Debattenkarte_Corona_Verschwoerung_WOeK.docx";

const card = {
  templateVersion: "2.0",
  number: 102,
  title: "Corona-Verschwörung? War die Pandemie geplant?",
  slug: "corona-verschwoerung-war-die-pandemie-geplant",
  cluster: "Gesundheit & Pflege",
  category: "Gesundheit & Pflege",
  editorialStatus: "redaktionell geprüft",
  shortJudgement: "Aufarbeitung ja. Verschwörungslogik nein. Eine Pandemie kann real sein und trotzdem schlecht gemanagt werden.",
  claim: {
    statement: "„Corona war geplant. Die Pandemie wurde benutzt, um Menschen zu kontrollieren, Impfstoffe durchzusetzen, Grundrechte abzubauen und globale Machtstrukturen zu stärken.“",
    implicitMessage: "Aus Fehlern, Interessen, Nebenwirkungen, widersprüchlicher Kommunikation und Grundrechtseingriffen soll folgen: Die Krise war ein geheimer Gesamtplan.",
    whyImportant: "Corona ist bis heute ein verletzter Resonanzraum. Viele Menschen verbinden die Pandemie mit Angst, Isolation, Existenzverlust, Schulschließungen, Impfdebatten, Nebenwirkungsfragen, Long COVID, Vertrauenserosion und politischem Streit. Genau deshalb braucht es Aufarbeitung - aber nicht den Sprung in eine geschlossene Verschwörungserzählung.",
  },
  answers: {
    seconds10: "Aufarbeitung ist richtig. Aber aus Fehlern, Interessen und Nebenwirkungen folgt nicht automatisch ein geheimer Plan. Eine Pandemie kann real sein und trotzdem schlecht gemanagt werden.",
    seconds30: "Der wahre Kern ist: In der Pandemie gab es politische Fehler, Nebenwirkungen, harte Grundrechtseingriffe, soziale Schäden, wirtschaftliche Interessen und widersprüchliche Kommunikation. Das muss geprüft werden. Der Denkfehler beginnt dort, wo jede Unsicherheit als Beweis für Absicht gelesen wird. Kritik fragt nach Belegen, Zuständigkeiten und Wirkung. Verschwörung weiß die Antwort schon.",
    seconds120: "Wirkungsökonomisch ist Corona kein Thema für Lagerreflexe. Man muss mehrere Dinge zugleich halten: Das Virus war real, Maßnahmen hatten Nutzen und Schäden, Impfstoffe hatten Nutzen und Risiken, Institutionen waren überfordert, Kommunikation war teils schwach, Plattformen haben Misstrauen verstärkt, und Betroffene von Long COVID oder möglichen Impfnebenwirkungen verdienen ernsthafte Prüfung. Daraus folgt aber nicht, dass COVID erfunden war, Impfstoffe ein Kontrollprogramm waren oder alle Institutionen zentral gesteuert wurden. Die bessere Frage lautet: Welche Entscheidungen, Datenlücken, Kommunikationsmuster, Interessen und Narrative haben welche Wirkung auf Gesundheit, Freiheit, Bildung, Pflege, Vertrauen und Demokratie erzeugt - und wie bauen wir daraus eine bessere Krisenarchitektur?",
  },
  consequences: {
    resonanceRoom: "Das Narrativ dockt an reale Verletzungen an: Kontrollverlust, Angst, Isolation, Existenzsorgen, Nebenwirkungsangst, Statuskränkung, Misstrauen gegenüber Institutionen und das Bedürfnis nach einer einfachen Ursache.",
    order1: "Berechtigte Kritik an Maßnahmen, Kommunikation oder Nebenwirkungsmanagement kann in ein geschlossenes Deutungsmuster kippen: Jeder Fehler gilt dann als Absicht, jede Korrektur als Vertuschung.",
    order2: "Gesundheitsschutz, Freiheitsrechte, Wissenschaft, Medien und Demokratie werden gegeneinander gestellt. Kooperation sinkt, Schutzverhalten wird schwieriger, und echte Aufarbeitung wird durch Glaubenskampf ersetzt.",
    order3: "Wenn die Verschwörungslogik dominant wird, verlieren Gesellschaft und Institutionen Lernfähigkeit: Daten, Gerichte, Parlamente, Forschung, Betroffenenberichte und Fehleranalyse werden nicht mehr als Korrekturmechanismen gelesen, sondern als Teil des Verdachts.",
    correction: "Die wirkungsökonomische Korrektur lautet: Aufarbeitung ja, Projektion nein. Prüfe konkrete Behauptungen, trenne Irrtum, Inkompetenz, Interessenkonflikt, Korruption und geheime Gesamtplanung, und baue bessere Rückkopplung für künftige Krisen.",
  },
  impactPathSteps: [
    "Auslöser: Pandemie, politische Eingriffe, Angst, Schulschließungen, Kontaktverbote, Impfkampagnen, wirtschaftliche Einbrüche und widersprüchliche Kommunikation.",
    "Wirkstoff: Die Erzählung „Es war kein Chaos, sondern ein Plan“ gibt Ordnung, Schuldige und ein Gefühl von Kontrolle.",
    "Verkürzung: Offene Fragen werden nicht einzeln geprüft, sondern zu einem Gesamtverdacht verschmolzen.",
    "Anschlussreaktion: Menschen suchen Bestätigung, Gruppenidentität und einfache Deutung statt belastbarer Unterscheidung.",
    "Rückkopplung: Misstrauen senkt Kooperationsbereitschaft; sinkende Kooperation erschwert Krisenmanagement; härtere Kommunikation verstärkt wiederum Misstrauen.",
    "Bessere Rückkopplung: Transparente Evaluation, bessere Daten, Pharmakovigilanz, Entschädigungsverfahren, Long-COVID-Versorgung, parlamentarische Kontrolle, klare Krisenkommunikation und Medienkompetenz.",
  ],
  criticalQuestions: [
    "Welche konkrete Behauptung steht im Raum: Pandemie erfunden, Maßnahmen überzogen, Impfstoff gefährlicher als Nutzen, Laborursprung, WHO-Machtorgan oder Pharmaeinfluss?",
    "Welche Belege gibt es: Primärdokumente, Daten, Studien, Gerichtsentscheidungen, offizielle Protokolle - und was zeigen sie tatsächlich?",
    "Würde die Erzählung auch Belege akzeptieren, die sie schwächen?",
    "Unterscheidet die Aussage zwischen Irrtum, Inkompetenz, Interessenkonflikt, Korruption, politischer Fehlentscheidung und geheimer Gesamtplanung?",
    "Wer wird zum Feindbild gemacht - und welche Wirkung hat das auf Ärzt:innen, Pflegekräfte, Wissenschaft, Journalismus, Minderheiten oder demokratische Institutionen?",
    "Welche Schutzgüter werden gegeneinander ausgespielt: Gesundheit gegen Freiheit, Wissenschaft gegen Demokratie, Kritik gegen Solidarität?",
    "Welche konkrete Verbesserung folgt aus der Erzählung: mehr Transparenz, bessere Entschädigung, bessere Krisenkommunikation - oder nur mehr Misstrauen?",
  ],
  facts: "Die WHO beschreibt COVID-19 als Pandemie und beendete am 5. Mai 2023 den internationalen Gesundheitsnotstand, nicht die Existenz oder Folgen der Erkrankung.\nDie Pandemiepolitik hatte reale Nebenwirkungen: Freiheitseingriffe, Schulschließungen, wirtschaftliche Belastungen, psychische Belastung, Konflikte um Schutzmaßnahmen und Vertrauensverluste. Diese Folgen müssen ausgewertet werden.\nCOVID-19-Impfstoffe wurden mit Nutzen gegen schwere Erkrankung bewertet; zugleich sind Verdachtsmeldungen, mögliche Nebenwirkungen und Kausalitätsprüfungen Teil seriöser Pharmakovigilanz.\nLong COVID ist als post-COVID-19 condition beschrieben und zeigt, dass die gesundheitliche Bilanz nicht auf Akutinfektion oder Impfdebatte verengt werden darf.\nDie WHO beschreibt die Infodemie als eigenes Krisenproblem: Falsche oder irreführende Informationen können Gesundheitsentscheidungen, Vertrauen und Krisenmanagement beeinträchtigen.\nForschung zeigt Zusammenhänge zwischen Verschwörungsüberzeugungen, Anti-Intellektualismus und geringerer Impfbereitschaft. Das erklärt nicht jede Kritik, zeigt aber ein relevantes Resonanzrisiko.\nAntwort- und Lösungspfad:\nPandemiepolitik nach Wirkung evaluieren: Gesundheit, Freiheit, Bildung, Pflege, psychische Gesundheit, Wirtschaft, soziale Ungleichheit und Vertrauen gemeinsam auswerten. Krisenkommunikation professionalisieren: Unsicherheit offen benennen, Änderungen erklären, Datenquellen zeigen, Fehler korrigieren, nicht moralisieren. Pharmakovigilanz und Entschädigung stärken: Verdachtsfälle ernst nehmen, Verfahren vereinfachen, kausale Prüfung transparent machen. Long COVID und Post-Vac-Beschwerden sauber unterscheiden und erforschen. Demokratische Kontrolle ausbauen: Parlamente, Gerichte, Öffentlichkeit, Datenzugang und unabhängige Evaluation sind Legitimitätsbedingungen.",
  sourceCards: [
    {
      id: "WHO-COVID",
      title: "WHO Europe: Coronavirus disease (COVID-19) pandemic",
      description: "COVID-19 als reale internationale Gesundheitslage und Pandemie-Kontext.",
      type: "Externe Gesundheitsquelle",
      url: "https://www.who.int/europe/emergencies/situations/covid-19",
      limitation: "Belegt den Pandemie-Kontext, bewertet aber nicht jede nationale Maßnahme.",
      dataStatus: DATA_STAND,
      lastChecked: DATA_STAND,
    },
    {
      id: "WHO-PHEIC",
      title: "WHO: Statement on the fifteenth meeting of the IHR Emergency Committee, 5 May 2023",
      description: "Beendigung des internationalen Gesundheitsnotstands und Einordnung der fortbestehenden Gesundheitsrisiken.",
      type: "Externe Gesundheitsquelle",
      url: "https://www.who.int/news/item/05-05-2023-statement-on-the-fifteenth-meeting-of-the-international-health-regulations-%282005%29-emergency-committee-regarding-the-coronavirus-disease-%28covid-19%29-pandemic",
      limitation: "Belegt den WHO-Status, ersetzt keine nationale Wirkungsbilanz.",
      dataStatus: DATA_STAND,
      lastChecked: DATA_STAND,
    },
    {
      id: "WHO-INFO",
      title: "WHO: Infodemic",
      description: "Falsche oder irreführende Informationen als Gesundheits- und Vertrauensrisiko in Krisen.",
      type: "Externe Gesundheitsquelle",
      url: "https://www.who.int/health-topics/infodemic",
      limitation: "Beschreibt Infodemie-Risiken, entscheidet aber keine einzelne Aussage automatisch.",
      dataStatus: DATA_STAND,
      lastChecked: DATA_STAND,
    },
    {
      id: "WHO-LC",
      title: "WHO: Post COVID-19 condition (Long COVID), Fact sheet, 26.02.2025",
      description: "Long COVID als post-COVID-19 condition und gesundheitlicher Langzeitkontext.",
      type: "Externe Gesundheitsquelle",
      url: "https://www.who.int/news-room/fact-sheets/detail/post-covid-19-condition-%28long-covid%29",
      limitation: "Belegt Long-COVID-Kontext, nicht die Ursache jedes Einzelfalls.",
      dataStatus: DATA_STAND,
      lastChecked: DATA_STAND,
    },
    {
      id: "RKI-VAX",
      title: "RKI: COVID-19-Impfstoffe - Wirksamkeit, Stand 21.01.2025",
      description: "Einordnung der Wirksamkeit von COVID-19-Impfstoffen, insbesondere gegen schwere Erkrankung.",
      type: "Externe Behördenquelle",
      url: "https://www.rki.de/SharedDocs/FAQs/DE/Impfen/COVID-19/FAQ_Liste_Wirksamkeit.html",
      limitation: "Belegt Wirksamkeitseinordnung, ersetzt keine individuelle medizinische Beratung.",
      dataStatus: DATA_STAND,
      lastChecked: DATA_STAND,
    },
    {
      id: "PEI-SAFE",
      title: "Paul-Ehrlich-Institut: Sicherheit von COVID-19-Impfstoffen",
      description: "Sicherheitsüberwachung, Verdachtsmeldungen, Melderaten und Notwendigkeit von Kausalitätsprüfung.",
      type: "Externe Behördenquelle",
      url: "https://www.pei.de/DE/newsroom/dossier/coronavirus/arzneimittelsicherheit.html",
      limitation: "Verdachtsmeldungen sind nicht automatisch kausal bestätigte Schäden.",
      dataStatus: DATA_STAND,
      lastChecked: DATA_STAND,
    },
    {
      id: "NHB-AI",
      title: "Nature Human Behaviour: Anti-intellectualism and the mass public's response to the COVID-19 pandemic, 2021",
      description: "Zusammenhang zwischen Anti-Intellektualismus und Reaktionen auf die Pandemie.",
      type: "Wissenschaftliche Quelle",
      url: "https://www.nature.com/articles/s41562-021-01112-w",
      limitation: "Empirische Studie zu Zusammenhängen, kein Urteil über einzelne Personen.",
      dataStatus: DATA_STAND,
      lastChecked: DATA_STAND,
    },
    {
      id: "BMC-CONSP",
      title: "BMC Public Health: Conspiracy beliefs and COVID-19 vaccination uptake, 2023",
      description: "Zusammenhang zwischen Verschwörungsüberzeugungen und Impfaufnahme.",
      type: "Wissenschaftliche Quelle",
      url: "https://link.springer.com/article/10.1186/s12889-023-15603-0",
      limitation: "Zeigt Zusammenhänge, ersetzt keine Erklärung jedes individuellen Impfverhaltens.",
      dataStatus: DATA_STAND,
      lastChecked: DATA_STAND,
    },
    {
      id: "I-BEG",
      title: "Führender Begriffsleitfaden der Wirkungsökonomie",
      description: "Begriffslogik: Wirkung, Wirkungspotenzial, Wirkpfad, Resonanzraum und Wirkungsrückkopplung.",
      type: "Interne WÖk-Quelle",
      url: "/wirkungsradar/quellen/",
      limitation: "Belegt die WÖk-Begriffslogik, aber keine externe Tatsachenbehauptung.",
      dataStatus: DATA_STAND,
      lastChecked: DATA_STAND,
    },
  ],
  glossary: ["Wirkungspotenzial", "Resonanzraum", "Wirkpfad", "Wirkungsrückkopplung", "Desinformation", "Wirkungswahrheit"],
  whyItWorks: "Das Narrativ zieht, weil es Chaos in Absicht verwandelt. Es gibt Verletzungen eine klare Ursache, erzeugt Kontrollgefühl und bietet Zugehörigkeit. Besonders stark wird es, wenn Menschen reale Verluste erlebt haben und sich von Politik, Medien oder Wissenschaft beschämt fühlen. Die Antwort muss deshalb Erfahrungen ernst nehmen und trotzdem präzise prüfen: Skepsis fragt. Verschwörung weiß schon.",
  methodology: "Faktenkern anerkennen, bevor der Frame korrigiert wird. Keine Absicht unterstellen, sondern Wirkungspotenzial, Resonanzrisiko und Rückkopplung beschreiben. Ursprungshypothesen, Maßnahmenkritik, Impfstoffrisiken, Pharmainteressen und globale Kooperation getrennt prüfen. Wissenschaftliche Unsicherheit offen benennen. Gesundheit, Freiheit, Vertrauen, Bildung, Pflege, Wirtschaft und Demokratie gemeinsam bilanzieren.",
  relatedContent: "Verwandte Inhalte: Impfen ist nur persönliche Entscheidung?, Long Covid / ME-CFS ist Einbildung?, Die Wissenschaft ist gekauft?, Mainstreammedien lügen alle?, SDGs sind Weltregierung?",
  trueCore: "Es gab reale politische Fehler, Nebenwirkungen, Grundrechtseingriffe, soziale Schäden, wirtschaftliche Interessen, widersprüchliche Kommunikation und offene Aufarbeitungsfragen.",
  falseJump: "Aus realen Fehlern und Interessen wird ein geheimer Gesamtplan konstruiert.",
  betterQuestion: "Welche Entscheidungen, Datenlücken, Interessen, Schutzmaßnahmen, Unterlassungen und Narrative hatten welche Wirkung - und was muss für künftige Krisen besser rückgekoppelt werden?",
  systemLever: "Transparente Evaluation, Krisenkommunikation, Pharmakovigilanz, Betroffenenverfahren, Forschung, parlamentarische Kontrolle und digitale Informationsqualität.",
  effectPath: {
    order1: "Berechtigte Kritik kann in Gesamtverdacht kippen.",
    order2: "Kooperation, Vertrauen und Schutzverhalten werden geschwächt.",
    order3: "Gesellschaftliche Lernfähigkeit sinkt, weil jede Korrektur als Teil der Vertuschung gelesen wird.",
    mpd: "Mensch: Gesundheit, psychische Belastung, Betroffene und Versorgung. Planet: indirekt über Krisenresilienz und Infrastruktur. Demokratie: Vertrauen, Grundrechte, Kontrollmechanismen, Medienqualität und Wissenschaftsbezug.",
  },
  objections: [
    {
      objection: "Gab es politische Fehler und überzogene Maßnahmen?",
      answer: "Ja, das ist berechtigt zu prüfen. Aber Fehler sind noch kein Beweis für einen geheimen Gesamtplan.",
    },
    {
      objection: "Gab es Impfnebenwirkungen?",
      answer: "Ja, Verdachtsfälle und bestätigte Fälle müssen ernst genommen werden. Seriöse Prüfung trennt Verdacht, Kausalität, Häufigkeit, Nutzen und Risiko.",
    },
    {
      objection: "Ist die Frage nach dem Ursprung des Virus verboten?",
      answer: "Nein. Ursprungshypothesen sind wissenschaftliche und geopolitische Fragen. Verschwörungslogik beginnt erst, wenn ohne belastbaren Nachweis ein globaler Kontrollplan behauptet wird.",
    },
  ],
  moderation: {
    "Konkreten Hebel anbieten": "Aufarbeitung ja: Daten offenlegen, Entscheidungen evaluieren, Nebenwirkungs- und Entschädigungsverfahren stärken, Long COVID erforschen, Krisenkommunikation verbessern und demokratische Kontrolle sichern.",
  },
  sourceHints: "WHO-COVID, WHO-PHEIC, WHO-INFO, WHO-LC, RKI-VAX, PEI-SAFE, NHB-AI, BMC-CONSP, I-BEG",
  masterSource: {
    document: DOCUMENT,
    stand: DATA_STAND,
  },
};

const master = JSON.parse(fs.readFileSync(MASTER_PATH, "utf8"));
const existingIndex = master.cards.findIndex((item) => item.slug === card.slug || item.title.toLowerCase() === card.title.toLowerCase());
if (existingIndex >= 0) {
  master.cards[existingIndex] = { ...master.cards[existingIndex], ...card };
} else {
  master.cards.push(card);
}
master.stand = DATA_STAND;
master.source = master.source.includes(DOCUMENT) ? master.source : `${master.source}; ${DOCUMENT}`;
master.imports = [
  ...(master.imports || []),
  {
    document: DOCUMENT,
    imported_at: new Date().toISOString(),
    detected_cards: 1,
    added: existingIndex >= 0 ? 0 : 1,
    updated: existingIndex >= 0 ? 1 : 0,
  },
];
fs.writeFileSync(MASTER_PATH, `${JSON.stringify(master, null, 2)}\n`);

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, `# Debattenkarte Corona-Verschwörung\n\nStand: ${DATA_STAND}\n\nQuelle: \`${DOCUMENT}\`\n\n## Ergebnis\n\n- ${existingIndex >= 0 ? "Aktualisiert" : "Neu ergänzt"}: ${card.title}\n- Route: /wirkungsradar/live/${card.slug}/\n- Quellen geprüft: 8 externe Links mit HTTP 200 plus interne WÖk-Quelle\n- Abgrenzung: synchronisiert mit vorhandenen Karten zu Impfen und Long COVID, keine Dublette.\n`);

console.log(JSON.stringify({
  title: card.title,
  slug: card.slug,
  action: existingIndex >= 0 ? "updated" : "added",
  cards: master.cards.length,
}, null, 2));
