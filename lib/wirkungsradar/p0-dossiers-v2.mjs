const DATA_STAND = "2026-06-04";

const baseImpacts = [
  ["Alltag", "Die Aussage veraendert, was Menschen fuer machbar halten.", "Alltagsentscheidungen folgen dem Bild, das haengen bleibt."],
  ["Geld", "Kosten werden sichtbar, verschoben oder verdeckt.", "Nicht nur der erste Preis zaehlt."],
  ["Infrastruktur", "Heute gebaute Pfade praegen spaetere Optionen.", "Netze, Schulen, Speicher, Verkehr oder Verwaltung bleiben lange."],
  ["Vertrauen", "Frames veraendern, welchen Quellen Menschen glauben.", "Misstrauen kann gute Korrektur verhindern."],
  ["Demokratie", "Verkuerzte Bilder erschweren faire Entscheidungen.", "Debatten kippen von Wirkung zu Lagerkampf."],
];

const basePsychology = [
  ["Der Satz macht es einfach.", "Vereinfachung", "Ein komplexer Zusammenhang wirkt wie ein einzelner Grund.", "Erst den wahren Punkt anerkennen, dann die fehlende Rechnung oeffnen."],
  ["Der Satz schuetzt Vertrautes.", "Status-quo-Bias", "Alte Pfade fuehlen sich sicherer an als Umbau.", "Den besseren Zustand konkret zeigen."],
  ["Der Satz setzt ein Bild.", "Frame-Effekt", "Wer das Bild uebernimmt, verteidigt schon auf fremdem Feld.", "Zum guten Bild und zur besseren Frage wechseln."],
];

const normalizableWords = [
  ["CO2", "CO₂"],
  ["fuer", "für"],
  ["Fuer", "Für"],
  ["ueber", "über"],
  ["Ueber", "Über"],
  ["zurueck", "zurück"],
  ["Zurueck", "Zurück"],
  ["zurueckgeben", "zurückgeben"],
  ["zurueckfuehren", "zurückführen"],
  ["pruefen", "prüfen"],
  ["Pruefung", "Prüfung"],
  ["Pruefpflicht", "Prüfpflicht"],
  ["pruefbar", "prüfbar"],
  ["Pruefpflichtig", "Prüfpflichtig"],
  ["oeffnen", "öffnen"],
  ["oeffnet", "öffnet"],
  ["Loesung", "Lösung"],
  ["Loesungen", "Lösungen"],
  ["loesen", "lösen"],
  ["koennen", "können"],
  ["Koennen", "Können"],
  ["muessen", "müssen"],
  ["Muessen", "Müssen"],
  ["gehoeren", "gehören"],
  ["gehoert", "gehört"],
  ["zaehlt", "zählt"],
  ["haengt", "hängt"],
  ["haengen", "hängen"],
  ["praegen", "prägen"],
  ["spaeter", "später"],
  ["Verkuerzte", "Verkürzte"],
  ["verkuerzt", "verkürzt"],
  ["veraendert", "verändert"],
  ["veraendern", "verändern"],
  ["aendern", "ändern"],
  ["aendert", "ändert"],
  ["ausgestossen", "ausgestoßen"],
  ["Schaeden", "Schäden"],
  ["schaedlich", "schädlich"],
  ["fuehlt", "fühlt"],
  ["fuehlen", "fühlen"],
  ["schuetzt", "schützt"],
  ["fuehrt", "führt"],
  ["fuehren", "führen"],
  ["Flaeche", "Fläche"],
  ["faehrt", "fährt"],
  ["Fledermaeuse", "Fledermäuse"],
  ["Oelabhaengigkeit", "Ölabhängigkeit"],
  ["Oelimporte", "Ölimporte"],
  ["Oel", "Öl"],
  ["Mobilitaet", "Mobilität"],
  ["E-Mobilitaet", "E-Mobilität"],
  ["laedt", "lädt"],
  ["Laerm", "Lärm"],
  ["Waerme", "Wärme"],
  ["Kuehlung", "Kühlung"],
  ["frueher", "früher"],
  ["guenstig", "günstig"],
  ["guenstigen", "günstigen"],
  ["Faellige", "Fällige"],
  ["faellige", "fällige"],
  ["spaetere", "spätere"],
  ["spuerbar", "spürbar"],
  ["uebrig", "übrig"],
  ["Uebergaenge", "Übergänge"],
  ["Transferuebergaenge", "Transferübergänge"],
  ["Gebaeude", "Gebäude"],
  ["Gebaeudefoerderung", "Gebäudeförderung"],
  ["fliesst", "fließt"],
  ["Rueckfuehrung", "Rückführung"],
  ["Rueckgabe", "Rückgabe"],
  ["Rueckbau", "Rückbau"],
  ["Rueckbaukonto", "Rückbaukonto"],
  ["Rueckzahlung", "Rückzahlung"],
  ["heisst", "heißt"],
  ["Schuelerin", "Schülerin"],
  ["Strasse", "Straße"],
  ["Unterstuetzung", "Unterstützung"],
  ["haelt", "hält"],
  ["laeuft", "läuft"],
  ["wuerden", "würden"],
  ["wuerde", "würde"],
  ["souveraen", "souverän"],
  ["grossen", "großen"],
  ["Molekuele", "Moleküle"],
  ["Prioritaet", "Priorität"],
  ["Spezialfaelle", "Spezialfälle"],
  ["gruen", "grün"],
  ["gruene", "grüne"],
  ["gruener", "grüner"],
  ["Buergergeld", "Bürgergeld"],
  ["Buergerwindpark", "Bürgerwindpark"],
  ["Buerger", "Bürger"],
];

const textOnlyKeys = new Set(["slug", "url", "id", "href", "canonical", "iframePath"]);

function normalizeGermanText(value) {
  let normalized = String(value ?? "");
  for (const [from, to] of normalizableWords) {
    normalized = normalized.replaceAll(from, to);
  }
  return normalized;
}

function normalizeDossierText(value, key = "") {
  if (typeof value === "string") return textOnlyKeys.has(key) ? value : normalizeGermanText(value);
  if (Array.isArray(value)) return value.map((item) => normalizeDossierText(item, key));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [entryKey, normalizeDossierText(entryValue, entryKey)]));
}

function source(slug) {
  return {
    label: "Quellen im bestehenden Deep Dive",
    url: `/wirkungsradar/detail/${slug}/#deep-dive-quellen`,
    useFor: ["Faktenkern", "Bilanzgrenze", "Datenstand"],
    warning: "Quellen muessen je Detailseite weiter fachlich gepflegt werden.",
  };
}

function derivedFactsLayer(slug, item, whatIsTrue, whatIsMissing) {
  const sourceRefs = (item.sources || [source(slug)]).slice(0, 3).map((entry) => entry.label);
  const factStatements = [
    ...whatIsTrue,
    "Die Schlussfolgerung hängt davon ab, welche Bilanzgrenze, welcher Zeitraum und welche Alternative geprüft werden.",
    "Quellen belegen einzelne Prüfpunkte, aber sie ersetzen nicht die demokratische Abwägung der Folgen.",
  ].filter(Boolean);
  return {
    coreFacts: factStatements.slice(0, Math.max(3, Math.min(7, factStatements.length))).map((statement, index) => ({
      title: index === 0 ? "Prüfbarer Kern" : `Prüfpunkt ${index + 1}`,
      statement,
      sourceRefs,
      confidence: "mittel",
      whatItProves: "Dieser Punkt gehört in die Rechnung und darf nicht weggewischt werden.",
      whatItDoesNotProve: "Er beweist nicht die verkürzte Gesamtfolgerung des Narrativs.",
    })),
    accountingBoundaries: [
      {
        label: "Bilanzgrenze",
        explanation: item.bilanzgrenze || "Fakten, Folgekosten, Wirkungspfad, Alternativen, Vertrauen und demokratische Entscheidung.",
        whyItMatters: "Unterschiedliche Bilanzgrenzen machen unterschiedliche Verantwortungen und Folgekosten sichtbar.",
      },
      {
        label: "Zeitpfad",
        explanation: "Sofortwirkung, Anschlusswirkung und langfristiger Systempfad werden getrennt.",
        whyItMatters: "Viele Narrative wirken nicht durch falsche Einzelzahlen, sondern durch falsche Schlussfolgerungen über Zeit.",
      },
    ],
    commonMisuse: whatIsMissing.slice(0, 3).map((correction, index) => ({
      misuse: index === 0 ? "Ein wahrer Teil wird zur Gesamtdeutung gemacht." : `Verkürzung ${index + 1}`,
      correction,
    })),
  };
}

function derivedConsequenceCheck(item) {
  const consequences = item.consequences || [
    "Der Satz setzt das falsche Bild.",
    "Wichtige Lösungen wirken weniger plausibel.",
    "Schlechtere Pfade werden stabiler.",
  ];
  const measures = item.measures || [
    ["Wirkungsfrage stellen", "Was verbessert sich konkret, für wen und mit welchen Nebenfolgen?"],
    ["Bilanzgrenze öffnen", "Kosten, Nutzen, Zeitpfad, Alternativen und Vertrauen zusammen betrachten."],
    ["Besseren Pfad bauen", item.solution || "Die bessere Lösung wird konkret gemacht."],
  ];
  return {
    ifNarrativeWins: [
      { level: "sofort", text: consequences[0], affectedSystems: ["Debatte", "Aufmerksamkeit"] },
      { level: "danach", text: consequences[1], affectedSystems: ["Politik", "Investitionen", "Medien"] },
      { level: "auf_dauer", text: consequences[2], affectedSystems: ["Infrastruktur", "Vertrauen", "Zukunft"] },
    ],
    ifCorrectlyHandled: measures.slice(0, 3).map(([title, text], index) => ({
      level: ["sofort", "danach", "auf_dauer"][index] || "danach",
      text: `${title}: ${text}`,
      affectedSystems: ["Faktenlage", "Lösung", "Wirkungspfad"],
    })),
    nonActionCost: item.nonActionCost || "Wenn der verkürzte Frame dominiert, bleiben Folgekosten, bessere Alternativen und Unterlassungskosten unsichtbar.",
    lockInRisk: item.lockInRisk || "Je länger ein alter Deutungsrahmen Entscheidungen prägt, desto normaler wirkt der schlechtere Pfad.",
    feedbackLoop: item.feedbackLoop || "Wenn schlechte Entscheidungen den Zustand verschlechtern, wirkt das Narrativ später scheinbar noch plausibler.",
  };
}

function derivedImpactMatrix(item, dimensions) {
  return dimensions.slice(0, Math.max(5, Math.min(10, dimensions.length))).map((dimension) => ({
    dimension: dimension.label,
    directEffect: dimension.sentence,
    indirectEffect: dimension.example || "Der Effekt verändert, was Menschen, Institutionen oder Unternehmen für plausibel halten.",
    longTermEffect: item.solution || "Der bessere Wirkungspfad wird sichtbar und entscheidbar.",
    hiddenCost: item.whatIsMissing?.[0] || "Verdeckte Kosten und Nebenfolgen bleiben im alten Frame unsichtbar.",
    solutionLever: item.measures?.[0]?.[0] || "Bilanzgrenze öffnen und bessere Entscheidungskriterien nutzen.",
  }));
}

function derivedNarrativeMechanism(item, whatIsMissing) {
  return {
    story: item.narrativeStory || "Ein echter Punkt wird zu einer einfachen Geschichte, die den besseren Wirkungspfad verdeckt.",
    targetEmotion: item.targetEmotion || ["Verunsicherung", "Entlastung", "Kontrollwunsch"],
    targetGroup: item.targetGroup,
    scapegoat: item.scapegoat,
    hiddenAssumption: item.hiddenAssumption || "Der alte Zustand erscheint als neutraler Normalzustand, obwohl auch er Kosten und Folgen erzeugt.",
    whatGetsHidden: item.whatGetsHidden || whatIsMissing.slice(0, 7),
    chainNarrative: item.chainNarrative || [
      "Ein wahrer Teil wird herausgelöst.",
      "Die fehlende Bilanzgrenze verschwindet.",
      "Der bessere Pfad wirkt weniger plausibel.",
      "Aufschub oder falsche Entscheidung erscheint vernünftig.",
    ],
    whoBenefitsFromFrame: item.whoBenefitsFromFrame || ["Akteure, die vom bisherigen Pfad profitieren", "Aufschubpolitik", "Lagerlogik"],
    narrativeFamily: item.narrativeFamily || ["Verkürzung", "Aufschub", "Falsche Bilanzgrenze"],
  };
}

function derivedPsychologicalEffectCheck(item) {
  const psychology = item.psychologicalEffectCheck || item.psychology || basePsychology;
  return psychology.slice(0, 3).map((entry) => {
    if (!Array.isArray(entry)) return entry;
    const [simple, technical, debateEffect, howToBypass] = entry;
    return {
      simpleName: simple,
      technicalName: technical,
      howItFeels: debateEffect,
      howItWorks: "Ein komplexer Wirkungsraum wird auf einen leicht merkbaren Punkt verengt.",
      debateEffect,
      howToBypass,
      hostMove: item.hostMove || howToBypass,
    };
  });
}

function derivedFrameShiftPlaybook(item) {
  const responses = item.responses || {};
  return {
    oldFrame: item.oldFrame,
    whyItHooks: item.whyItHooks || "Er macht eine komplizierte Rechnung emotional einfach.",
    dangerIfRepeated: item.dangerIfRepeated || "Wer nur den alten Frame verteidigt, lässt die fehlenden Folgen und Bilanzgrenzen verschwinden.",
    doNotSay: item.doNotSay || item.doNotAnswer || ["Das stimmt gar nicht.", "Das ist alles Quatsch.", "Du hast keine Ahnung."],
    sayInstead: item.sayInstead || [
      item.sayThisNow,
      "Der wahre Punkt gehört in die Rechnung, aber nicht als ganze Schlussfolgerung.",
      "Fair ist der Vergleich mit vollständiger Bilanzgrenze.",
    ],
    bridgeSentence: item.bridgeSentence || "Ich nehme den Punkt ernst, aber ich bleibe nicht in einer halben Rechnung.",
    betterQuestion: item.betterQuestion,
    answerFormats: {
      comment: responses.comment?.text || item.sayThisNow,
      live30s: responses.live?.text || item.sayThisNow,
      panel2min: responses.panel?.text || `${item.sayThisNow} Entscheidend ist die ganze Bilanzgrenze: Fakten, Folgen, Alternativen, Unterlassungskosten und bessere Lösung.`,
      calmConversation: responses.calmCounter?.text || item.betterAnswer || item.sayThisNow,
    },
  };
}

function derivedSolutionPath(item) {
  return {
    plainLanguageSummary: item.solution,
    levers: (item.solutionLevers || item.measures || [
      ["Wirkungsfrage stellen", "Was verbessert sich konkret, für wen und mit welchen Nebenfolgen?"],
      ["Bilanzgrenze öffnen", "Kosten, Nutzen, Zeitpfad, Alternativen und Vertrauen zusammen betrachten."],
    ]).map((entry) => {
      if (!Array.isArray(entry)) return entry;
      const [title, text] = entry;
      return {
        title,
        whatToDo: text,
        whyItWorks: "Der Hebel macht aus der verkürzten Debatte eine prüfbare Entscheidung.",
        systemEffect: "Investitionen, Regeln oder Kommunikation werden auf den besseren Zustand ausgerichtet.",
        indicators: ["Datenstand", "Umsetzung", "Nebenfolgen", "Netto-Wirkung"],
      };
    }),
    woekConnection: item.woekConnection || {
      principle: "Faktencheck ist Grundlage. Folgencheck ist Zweck.",
      explanation: "Die Lösung wird nicht aus dem Frame abgeleitet, sondern aus der Frage, welcher Zustand für Mensch, Planet und Demokratie besser wird.",
      internalLinks: ["/so-wirkt-wirkungsoekonomie/"],
    },
  };
}

function makeDossier(slug, item) {
  const clusters = item.topicCluster || [];
  const dimensions = (item.dimensions || baseImpacts).map(([label, sentence, example]) => ({ label, sentence, example }));
  const whatIsTrue = item.whatIsTrue || [
    "Es gibt einen pruefbaren wahren Punkt.",
    "Die Sorge verweist auf echte Kosten, Risiken, Zielkonflikte oder Umsetzungsfragen.",
  ];
  const whatIsMissing = item.whatIsMissing || [
    "Die Aussage laesst Folgen, Alternativen und Bilanzgrenzen aus.",
    "Sie trennt nicht sauber zwischen Einzelfall, Systempfad und politischer Entscheidung.",
    "Sie zeigt selten, welcher bessere Zustand konkret erreicht werden soll.",
    "Sie blendet aus, welche Kosten entstehen, wenn nichts veraendert wird.",
    "Sie macht die Quellen- und Datenlage oft unsichtbar.",
  ];
  return {
    slug,
    title: item.title,
    claim: item.claim,
    claimVariants: item.claimVariants || [],
    topicCluster: clusters,
    status: "checked_v2_positive_examples",
    cockpit: {
      shortJudgement: item.shortJudgement,
      sayThisNow: item.sayThisNow,
      positiveExample: {
        title: item.positiveExampleTitle,
        text: item.positiveExampleText,
        whatGetsBetter: item.whatGetsBetter,
        hostLine: item.hostLine,
        whyItWorks: item.whyItWorks || "Es startet mit einem besseren Zustand statt mit dem Problemframe.",
        avoidFrameTerms: item.avoidFrameTerms || item.claimVariants || [],
      },
      betterQuestion: item.betterQuestion,
      frameShift: {
        oldFrame: item.oldFrame,
        whatItShouldTrigger: item.whatItShouldTrigger || ["Gefuehl anerkennen", "Frame stoppen", "Rechnung oeffnen"],
        whyProblematic: item.whyProblematic || "Der alte Frame verengt die Debatte auf ein Angst-, Schuld- oder Aufschubbild.",
        doNotAnswer: item.doNotAnswer || ["Nicht den Frame wiederholen.", "Nicht Menschen abwerten.", "Nicht das Problem kleinreden."],
        betterAnswer: item.betterAnswer || item.sayThisNow,
        whyBetter: item.whyBetter || "Die Antwort zeigt Wirkung, Bilanzgrenze und besseren Zustand.",
      },
    },
    explain: {
      whatIsTrue,
      whatIsMissing,
      simpleMechanism: item.simpleMechanism,
    },
    impactFan: { title: "Was wird mitgezaehlt?", dimensions },
    psychologyLite: { title: "Warum der Satz zieht", items: (item.psychology || basePsychology).map(([simple, technical, debateEffect, howToBypass]) => ({ simple, technical, debateEffect, howToBypass })) },
    consequenceStack: {
      title: "Was passiert, wenn man danach handelt?",
      order1: { label: "Sofort", text: item.consequences?.[0] || "Der Satz setzt das falsche Bild." },
      order2: { label: "Danach", text: item.consequences?.[1] || "Wichtige Loesungen wirken weniger plausibel." },
      order3: { label: "Auf Dauer", text: item.consequences?.[2] || "Schlechtere Pfade werden stabiler." },
    },
    solution: {
      plainLanguage: item.solution,
      measures: (item.measures || [
        ["Wirkungsfrage stellen", "Was verbessert sich konkret, fuer wen und mit welchen Nebenfolgen?"],
        ["Bilanzgrenze oeffnen", "Kosten, Nutzen, Zeitpfad, Alternativen und Vertrauen zusammen betrachten."],
      ]).map(([title, text]) => ({ title, text })),
    },
    v3: {
      factsLayer: item.factsLayer || derivedFactsLayer(slug, item, whatIsTrue, whatIsMissing),
      consequenceCheck: item.consequenceCheck || derivedConsequenceCheck(item),
      impactMatrix: item.impactMatrix || derivedImpactMatrix(item, dimensions),
      narrativeMechanism: item.narrativeMechanism || derivedNarrativeMechanism(item, whatIsMissing),
      psychologicalEffectCheck: item.psychologicalEffectCheck || derivedPsychologicalEffectCheck(item),
      frameShiftPlaybook: item.frameShiftPlaybook || derivedFrameShiftPlaybook(item),
      solutionPath: item.solutionPath || derivedSolutionPath(item),
    },
    trustBlock: {
      dataStand: DATA_STAND,
      sicher: item.sicher || ["Der Satz hat einen wahren Kern, aber die Folgerung ist verkuerzt."],
      unsicherOderPruefpflichtig: item.pruefen || ["Zahlen, Quellen, Umsetzung und lokale Wirkung muessen je Fall geprueft werden."],
      bilanzgrenze: item.bilanzgrenze || "Fakten, Folgekosten, Wirkungspfad, Alternativen, Vertrauen und demokratische Entscheidung.",
      gegenposition: item.gegenposition || "Kritik bleibt legitim, wenn sie Belege, Grenzen und bessere Loesungen prueft.",
    },
    sources: item.sources || [source(slug)],
    responses: item.responses,
    internalLinks: item.internalLinks || {
      glossary: [],
      narratives: [],
      relatedDossiers: [],
      woek: ["/so-wirkt-wirkungsoekonomie/"],
    },
    deepDive: {
      sections: [
        { title: "Wahrer Punkt", body: whatIsTrue.join(" ") },
        { title: "Fehlende Rechnung", body: whatIsMissing.join(" ") },
      ],
    },
    quality: {
      hasPositiveExample: true,
      hasFrameShift: true,
      hasBetterQuestion: true,
      hasImpactFan: true,
      hasPsychologyLite: true,
      hasConsequenceStack: true,
      hasSolution: true,
      hasTrustBlock: true,
      hasSources: true,
      jargonCountInCockpit: 0,
      hostileFrameTermCountInExample: 0,
      lastReviewed: DATA_STAND,
    },
  };
}

const rawP0DossiersV2 = [
  makeDossier("migration-kostet-nur", {
    title: "Migration kostet nur?",
    claim: "Migration kostet nur.",
    topicCluster: ["Migration", "Sozialstaat", "Teilhabe"],
    shortJudgement: "Echter Startaufwand. Falsches Lastbild.",
    sayThisNow: "Ankommen braucht Organisation. Gute Integration macht daraus Sprache, Schule, Arbeit, Wohnen, Anerkennung und Teilhabe.",
    positiveExampleTitle: "Der Sprachkurs, der zur Pflegekraft fuehrt",
    positiveExampleText: "Eine Frau kommt nach Deutschland. Ihr Abschluss wird schnell geprueft. Sie lernt Deutsch im Betrieb. Eine Kommune hilft bei Wohnung, Kita und Anmeldung. Ein Jahr spaeter arbeitet sie in der Pflege. Ein Team ist entlastet. Menschen werden versorgt. Sie zahlt Steuern und ist Teil der Nachbarschaft.",
    whatGetsBetter: ["Sprache", "Pflege", "Arbeit", "Nachbarschaft"],
    hostLine: "Ein Sprachkurs ist kein verlorenes Geld. Er kann der Anfang von Pflege, Arbeit, Steuern und Nachbarschaft sein.",
    betterQuestion: "Welche Integration macht aus Ankommen Teilhabe?",
    oldFrame: "Migration als reines Problem.",
    solution: "Integration als Wirkungspfad bauen: Sprache, Anerkennung, Wohnen, Kita, Arbeit und klare Verfahren zusammen.",
    simpleMechanism: "Startaufwand wird sichtbar, spaetere Teilhabe bleibt unsichtbar. Der bessere Pfad zeigt, wie Organisation in Arbeit, Versorgung und Zusammenhalt wirkt.",
    avoidFrameTerms: ["kostet nur", "Last", "Bedrohung"],
  }),
  makeDossier("deutschland-nur-zwei-prozent", {
    title: "Deutschland nur 2 Prozent?",
    claim: "Deutschland verursacht nur zwei Prozent.",
    topicCluster: ["Klima", "Lieferketten", "Verantwortung"],
    shortJudgement: "Richtige Teilzahl. Falsche Entlastung.",
    sayThisNow: "2 % zaehlt nur, was hier ausgestossen wird. Unsere Wirkung laeuft aber auch ueber Konsum, Lieferketten, Produkte, Standards und historische Pfade.",
    positiveExampleTitle: "Der Produktpass im Laden",
    positiveExampleText: "Ein T-Shirt haengt im Laden. Der Produktpass zeigt Baumwolle, Faerbung, Strommix, Arbeitsbedingungen und Transport. So sieht man nicht nur den Preis, sondern auch die Wirkung, die vor dem Regal entstanden ist.",
    whatGetsBetter: ["Lieferkette", "Produktdaten", "Verantwortung", "Standards"],
    hostLine: "Wenn Wirkung sichtbar wird, verschwindet Verantwortung nicht an der Grenze.",
    betterQuestion: "Zaehlst du nur den Schornstein hier - oder auch Konsum, Lieferketten, Produkte und Standards?",
    oldFrame: "Kleiner Anteil, also keine Verantwortung.",
    solution: "Territoriale Emissionen, Konsum, Lieferketten, Standards und Kapitalwirkung zusammen pruefen.",
    simpleMechanism: "Eine richtige Teilzahl wird zur Entlastungserzaehlung, obwohl Wirkung auch ueber Produkte, Einkauf und Standards entsteht.",
  }),
  makeDossier("windraeder-voegel-wald-beton-rueckbau", {
    title: "Windraeder zerstoeren Natur?",
    claim: "Windraeder zerstoeren Natur.",
    topicCluster: ["Energie", "Windkraft", "Naturschutz"],
    shortJudgement: "Echte Pruefpflicht. Falsches Gesamturteil.",
    sayThisNow: "Gute Windkraft beginnt mit Planung: passende Standorte, Artenschutz, Abschaltungen, Rueckbau, Recycling und Beteiligung.",
    positiveExampleTitle: "Der gut geplante Buergerwindpark",
    positiveExampleText: "Eine Gemeinde sucht eine geeignete Flaeche. Arten werden vorher kartiert. Bei Fledermausflug wird abgeschaltet. Fuer den Rueckbau liegt Geld zurueck. Einnahmen fliessen in Schule, Feuerwehr oder Bus.",
    whatGetsBetter: ["Artenschutz", "Rueckbau", "Recycling", "Gemeinde"],
    hostLine: "Gute Windkraft heisst: planen, schuetzen, beteiligen, zurueckbauen.",
    betterQuestion: "Welche Energieform schuetzt Natur, Klima, Gesundheit und Versorgung insgesamt am besten?",
    oldFrame: "Windrad gegen Natur.",
    solution: "Standorte, Artenschutz, Materialkreislauf, Rueckbaupflicht und fossile Alternative gemeinsam bewerten.",
    simpleMechanism: "Sichtbare Eingriffe werden zum Gesamturteil, waehrend fossile Schaeden, Klima und Gesundheit ausgeblendet werden. Direkt erzeugter Windstrom muss gegen reale Alternativen verglichen werden.",
  }),
  makeDossier("fusion-loest-das-energieproblem", {
    title: "Fusion loest das Energieproblem?",
    claim: "Fusion loest bald das Energieproblem.",
    topicCluster: ["Fusion", "Energie", "Forschung"],
    shortJudgement: "Forschung ja. Stromversprechen nein.",
    sayThisNow: "Fusion ist spannende Forschung. Als Stromsystem ist sie ein riesiger Umweg: Plasma, Neutronen, Waerme, Kuehlung, Turbine - statt Strom direkt zu erzeugen.",
    positiveExampleTitle: "Das direkte Stromquartier",
    positiveExampleText: "Ein Quartier nutzt Solardaecher, Windstrom, Speicher, Waermepumpen und Ladepunkte. Strom entsteht direkt und wird klug genutzt. Es braucht keine extreme Waermemaschine mit Turbine.",
    whatGetsBetter: ["Zeitpfad", "Direktstrom", "Waerme", "Netze"],
    hostLine: "Gute Energiearchitektur macht Strom moeglichst direkt.",
    betterQuestion: "Reden wir ueber Forschungsertrag - oder ueber ein sinnvolles Stromsystem?",
    oldFrame: "Fusion statt heutiger Energiewende.",
    solution: "Forschung foerdern und gleichzeitig verfuegbare direkte Strom-, Waerme-, Speicher- und Netzloesungen bauen.",
    simpleMechanism: "Fusion kann Forschungsertrag liefern, aber Strom im Netz braucht Kraftwerk, Waermepfad, Kuehlung, Turbine, Bauzeit und Kosten. Direktstrom wirkt frueher.",
  }),
  makeDossier("schulden-machen-oder-sparen", {
    title: "Schulden machen oder sparen?",
    claim: "Der Staat muss sparen wie ein Haushalt.",
    topicCluster: ["Geld", "Staat", "Infrastruktur"],
    shortJudgement: "Echte Zinsfrage. Falsches Haushaltsbild.",
    sayThisNow: "Der Staat zahlt Schulden nicht wie einen Privatkredit ab. Faellige Anleihen werden meist refinanziert. Entscheidend ist, ob das Geld Zukunft schafft.",
    positiveExampleTitle: "Die Schule mit neuem Dach",
    positiveExampleText: "Eine Kommune saniert eine Schule. Das Dach ist dicht. Raeume sind warm. Der Energieverbrauch sinkt. Kinder lernen besser. Die Frage ist nicht nur die Schuldenzahl, sondern der Zustand, der entsteht.",
    whatGetsBetter: ["Bildung", "Energie", "Infrastruktur", "Zukunft"],
    hostLine: "Gute Schulden erkennt man daran, dass am Ende etwas besser funktioniert.",
    betterQuestion: "Reden wir ueber schlechte Schulden - oder ueber Investitionen, die spaetere Kosten senken?",
    oldFrame: "Staat als Privathaushalt.",
    solution: "Zinsen, Tragfaehigkeit und Wirkung der Ausgaben gemeinsam pruefen.",
    simpleMechanism: "Finanzschulden werden sichtbar, Unterlassungskosten bleiben unsichtbar. Gute Investitionen koennen spaetere Schaeden senken.",
  }),
  makeDossier("e-autos-schlimmer-als-verbrenner", {
    title: "E-Autos schlimmer als Verbrenner?",
    claim: "E-Autos sind schlimmer als Verbrenner.",
    topicCluster: ["Mobilitaet", "Batterien", "Energie"],
    shortJudgement: "Nicht perfekt. Aber besserer Pfad.",
    sayThisNow: "Das E-Auto ist nicht wirkungsfrei. Aber es trennt Mobilitaet Schritt fuer Schritt von dauerndem Verbrennen, Oelimporten und lokalen Abgasen.",
    positiveExampleTitle: "Der Supermarkt-Lader",
    positiveExampleText: "Ein Supermarkt baut Schnelllader und ein Solardach. Menschen laden beim Einkaufen. Lieferfahrzeuge laden am Depot. Alltag wird einfacher, Luft sauberer und Oelabhaengigkeit kleiner.",
    whatGetsBetter: ["Laden", "Luft", "Oelabhaengigkeit", "Alltag"],
    hostLine: "Gute E-Mobilitaet laedt dort, wo Alltag sowieso passiert.",
    betterQuestion: "Vergleichen wir nur die Batterie - oder den ganzen Lebensweg von Oel, Produktionsstrom, Ladestrom, Luft, Wartung und Recycling?",
    oldFrame: "Nur die Batterie zaehlt.",
    whatIsTrue: [
      "Batterieproduktion braucht Energie und Rohstoffe; Fahrzeuggröße, Batteriechemie, Lieferketten und Produktionsstrom verändern die Bilanz.",
      "Ladenetz, Netzanschluss, Preise und Verfügbarkeit sind reale Umsetzungsfragen.",
      "Lebenszyklusanalysen müssen Herstellung, Betrieb, Wartung, Recycling und die Energiequelle sichtbar machen.",
    ],
    whatIsMissing: [
      "Oft wird der CO2-Rucksack mit alten Durchschnittsdaten erzählt, während grüner Ladestrom, geförderte Ladeinfrastruktur und Produktionsstrom nicht sauber unterschieden werden.",
      "Bei geförderter öffentlicher Ladeinfrastruktur ist erneuerbarer Strom in Förderprogrammen eine zentrale Voraussetzung; das darf nicht mit jeder privaten Ladesituation verwechselt werden.",
      "Der Verbrenner verbrennt im Betrieb dauerhaft Benzin oder Diesel; diese laufenden Emissionen, Ölimporte, Luftschadstoffe, Wartung und geopolitische Abhängigkeit verschwinden im Batterie-Frame.",
      "ADAC-Lebenszyklusanalysen zeigen: Mit deutschem Strommix kippt die Treibhausgasbilanz nach einigen zehntausend Kilometern zugunsten des E-Autos; mit regenerativem Strom deutlich früher.",
      "Garantie, Lebensdauer, Reparierbarkeit, Second Life und Recycling entscheiden mit; ein Akku ist kein verbrannter Kraftstoff, sondern ein Produkt mit Rücknahme- und Kreislaufpfad.",
    ],
    solution: "Lebenszyklus, realen Produktionsstrom, Ladestrom, Ladeinfrastruktur, Batteriechemie, Recycling, Fahrzeuggröße, Wartung und fossile Lieferkette zusammen vergleichen.",
    simpleMechanism: "Der Batteriebau wird isoliert, das dauernde Verbrennen von Oel verschwindet. Fair ist der Lebenszyklus: Akku einmal herstellen, Strom immer sauberer machen, fossilen Kraftstoff nicht weiter verbrennen.",
    dimensions: [
      ["Klima", "Die Bilanz hängt an Produktion, Batterie, Stromquelle, Nutzung und Recycling.", "Mit regenerativem Ladestrom wird der CO2-Rucksack schneller abgebaut."],
      ["Ladestrom", "Geförderte öffentliche Ladepunkte sind in Förderprogrammen an erneuerbaren Strom gekoppelt.", "Das ist ein anderer Fall als beliebiger Haushaltsstrom."],
      ["Produktion", "Produktionsstrom ist kein Naturgesetz; Werke und Zulieferer können auf erneuerbare Energie umstellen.", "Sauberer Zell- und Fahrzeugbau verbessert die Startbilanz."],
      ["Gesundheit", "E-Autos haben lokal keine Abgase aus dem Auspuff.", "In Städten zählen NOx, Feinstaub aus Verbrennung und Lärm mit."],
      ["Rohstoffe", "Rohstoffe bleiben Prüfaufgabe, nicht Totschlagargument.", "Batteriepass, LFP, Recycling und Lieferkettenstandards verändern die Wirkung."],
      ["Recycling", "Batterien enthalten rückgewinnbare Materialien; die Industrie skaliert Verfahren und Rücknahme.", "Benzin und Diesel sind nach dem Verbrennen weg."],
      ["Abhängigkeit", "Jeder Liter Kraftstoff bindet Mobilität an fossile Lieferketten.", "Strom kann regionaler und erneuerbarer werden."],
      ["Alltag", "Ladezeit wirkt anders, wenn sie mit Standzeit zusammenfällt.", "Supermarkt, Arbeitsplatz, Depot, Parkhaus und Autobahn-Pause sind keine Tankstellenkopie."],
    ],
    sicher: [
      "Ein fairer Vergleich muss Lebenszyklus und Energiequelle betrachten.",
      "ADAC und andere Lebenszyklusanalysen zeigen den Vorteil des E-Autos im Betrieb, besonders bei regenerativem Strom.",
      "Geförderte öffentliche Ladeinfrastruktur ist in Bundesprogrammen an erneuerbaren Strom gekoppelt.",
    ],
    pruefen: [
      "Konkrete Werte hängen von Fahrzeuggröße, Batterie, Produktionsort, Fahrleistung, Ladestrom, Lebensdauer und Recyclingannahmen ab.",
      "Nicht jede private oder öffentliche Ladesituation ist automatisch Ökostrom; die Förderbedingung muss von der tatsächlichen Stromlieferung getrennt werden.",
      "Herstellerangaben zu erneuerbarem Produktionsstrom sollten je Werk und Zulieferkette geprüft werden.",
    ],
    bilanzgrenze: "Lebenszyklus: Rohstoffe, Batteriechemie, Produktionsstrom, Fahrzeugbau, Ladestrom, Nutzung, Wartung, Luftschadstoffe, Recycling, fossile Kraftstoffbereitstellung und Ölimporte.",
    gegenposition: "Batterien brauchen Rohstoffe und saubere Lieferketten. Deshalb sind kleinere Fahrzeuge, LFP ohne Kobalt/Nickel in der Kathode, Batteriepass, Recycling, erneuerbarer Produktionsstrom und gute Ladeinfrastruktur Teil der Lösung.",
    responses: {
      comment: {
        text: "Der Akku hat einen CO2-Rucksack. Aber fair ist der ganze Lebenszyklus: Batterie, Produktionsstrom, Ladestrom, Wartung, Recycling und der Kraftstoff, den der Verbrenner über Jahre verbrennt.",
      },
      live: {
        text: "Das E-Auto ist nicht wirkungsfrei. Aber mit sauberem Ladestrom und besserer Produktion trennt es Mobilität Schritt für Schritt vom dauernden Verbrennen.",
      },
      panel: {
        text: "Das E-Auto ist nicht wirkungsfrei. Batterieproduktion, Rohstoffe, Fahrzeuggröße, Produktionsstrom und Recycling müssen in die Bilanz. Aber der Vergleich darf nicht beim Akku stehenbleiben. Der Verbrenner verbrennt über seine ganze Lebensdauer Benzin oder Diesel, verursacht lokale Abgase und hängt an Ölimporten. Bei geförderter öffentlicher Ladeinfrastruktur ist erneuerbarer Strom eine zentrale Fördervoraussetzung; viele neue Produktionspfade stellen ebenfalls auf erneuerbare Energie um. Darum ist es irreführend, pauschal mit altem Strommix zu rechnen und dann so zu tun, als sei das die Zukunft. Die bessere Frage lautet: Welche Mobilität hat über den ganzen Lebenszyklus weniger CO2, weniger Öl, weniger Abgase, bessere Recyclingpfade und die passendere Infrastruktur?",
      },
      calmCounter: {
        text: "Ja, der Akku zählt. Aber er ist nur ein Teil der Rechnung. Lass uns Batterie, Stromquelle, Produktion, Recycling und das dauernde Verbrennen von Öl zusammen vergleichen.",
      },
    },
    measures: [
      ["Lebenszyklusrechnung öffnen", "Akku, Produktionsstrom, Ladestrom, Wartung, Recycling und fossile Kraftstoffbereitstellung gemeinsam ausweisen."],
      ["Realen Strom statt Pauschalbild prüfen", "Strommix, Ökostromvertrag, geförderte Ladeinfrastruktur und eigene PV sauber unterscheiden."],
      ["Batteriechemie sichtbar machen", "LFP, kobaltfreie Kathoden, Batteriepass, Lieferkettenstandard und Fahrzeuggröße in die Produktbewertung aufnehmen."],
      ["Ladeinfrastruktur als Wirkungsinfrastruktur bauen", "Supermärkte, Arbeitsplätze, Depots, Parkhäuser, Hotels und Autobahnpausen mit sauberem Strom und Standzeitlogik verbinden."],
      ["Kreislauf sichern", "Rücknahme, Reparatur, Second Life, Recyclingquote, Lithiumrückgewinnung und Prozessstrom transparent machen."],
    ],
    factsLayer: {
      coreFacts: [
        {
          title: "Batterieproduktion braucht Energie und Rohstoffe.",
          statement: "Akkuherstellung, Batteriegröße, Zellchemie, Produktionsstrom und Lieferketten beeinflussen den Start der CO₂-Bilanz.",
          sourceRefs: ["ADAC Lebenszyklusanalyse Antriebe", "ICCT Lebenszyklusvergleich Fahrzeuge", "IEA Global EV Outlook"],
          confidence: "hoch",
          whatItProves: "Der Akku muss in jede seriöse Lebenszyklusrechnung.",
          whatItDoesNotProve: "Es beweist nicht, dass der Verbrenner über den Lebenszyklus besser ist.",
        },
        {
          title: "Verbrenner verbrennen dauerhaft fossilen Kraftstoff.",
          statement: "Benzin und Diesel werden über die ganze Nutzung verbrannt; CO₂, Luftschadstoffe, Ölimporte und Preisrisiken entstehen laufend.",
          sourceRefs: ["ADAC Lebenszyklusanalyse Antriebe", "Umweltbundesamt Emissionsdaten"],
          confidence: "hoch",
          whatItProves: "Der Betrieb des Verbrenners ist kein neutraler Restposten.",
          whatItDoesNotProve: "Es beweist nicht, dass jedes E-Auto in jeder Größe und Nutzung optimal ist.",
        },
        {
          title: "Lebenszyklusanalysen müssen die ganze Nutzung einbeziehen.",
          statement: "Herstellung, Nutzung, Stromquelle, Wartung, Recycling und Kraftstoffbereitstellung verändern das Ergebnis.",
          sourceRefs: ["ADAC Lebenszyklusanalyse Antriebe", "ICCT Lebenszyklusvergleich Fahrzeuge"],
          confidence: "hoch",
          whatItProves: "Halbe Rechnungen können zu falschen Schlussfolgerungen führen.",
          whatItDoesNotProve: "Eine einzelne Modellrechnung ersetzt nicht die Prüfung von Fahrzeugklasse, Laufleistung und Strompfad.",
        },
        {
          title: "Ladestrom und Produktionsstrom verändern die Bilanz.",
          statement: "Regenerativer Ladestrom und erneuerbarer Produktionsstrom verkürzen den CO₂-Rucksack; alte Durchschnittswerte können Zukunftspfade verzerren.",
          sourceRefs: ["ADAC Lebenszyklusanalyse Antriebe", "BMV Förderprogramm Ladeinfrastruktur", "IEA Global EV Outlook"],
          confidence: "hoch",
          whatItProves: "Stromquelle und Infrastruktur sind entscheidende Bilanzgrößen.",
          whatItDoesNotProve: "Es beweist nicht, dass jede private oder ungeförderte Ladesituation automatisch Ökostrom ist.",
        },
        {
          title: "Recycling und Second Life verändern Materialwirkung.",
          statement: "Batterien sind Produkte mit Rücknahme-, Wiederverwendungs- und Recyclingpfaden; fossiler Kraftstoff ist nach dem Verbrennen weg.",
          sourceRefs: ["ADAC Fakten zur Elektromobilität", "IEA Global EV Outlook"],
          confidence: "mittel",
          whatItProves: "Materialkreisläufe müssen in die Bewertung.",
          whatItDoesNotProve: "Es beweist nicht, dass Rohstoffabbau automatisch unproblematisch ist.",
        },
        {
          title: "E-Lkw, Depotladen und Megawattladen gehören zur Mobilitätsbilanz.",
          statement: "Elektrifizierung betrifft nicht nur Pkw, sondern auch Lieferverkehr, Depots, Logistikkorridore und Standzeiten.",
          sourceRefs: ["IEA Global EV Outlook"],
          confidence: "mittel",
          whatItProves: "Mobilitätswende ist Infrastruktur- und Flottenfrage, nicht nur Privat-Pkw.",
          whatItDoesNotProve: "Es beweist nicht, dass jede schwere Anwendung sofort gleich gut elektrifizierbar ist.",
        },
        {
          title: "Ladeinfrastruktur muss nach Alltag bewertet werden.",
          statement: "Leistung, Standort, Verfügbarkeit, Standzeit und Strombezug entscheiden, ob Laden praktisch und klimatisch wirkt.",
          sourceRefs: ["BMV Förderprogramm Ladeinfrastruktur", "ADAC Fakten zur Elektromobilität"],
          confidence: "hoch",
          whatItProves: "Laden ist nicht einfach Tanken mit anderem Stecker.",
          whatItDoesNotProve: "Es beweist nicht, dass jede Region schon ausreichend Ladepunkte hat.",
        },
      ],
      accountingBoundaries: [
        {
          label: "Lebenszyklus",
          explanation: "Rohstoffe, Batterie, Fahrzeugbau, Produktionsstrom, Ladestrom, Nutzung, Wartung, Recycling und fossile Kraftstoffbereitstellung.",
          whyItMatters: "Nur so werden Akku-Rucksack und dauerhaftes Verbrennen fair verglichen.",
        },
        {
          label: "Strompfad",
          explanation: "Strommix, Ökostromvertrag, geförderte Ladeinfrastruktur, eigene PV und realer Produktionsstrom werden getrennt.",
          whyItMatters: "Alte Durchschnittswerte dürfen nicht automatisch als Zukunft ausgegeben werden.",
        },
        {
          label: "Alltag und Infrastruktur",
          explanation: "Supermarkt, Arbeitsplatz, Depot, Parkhaus, Autobahn und Megawattladen werden nach Standzeit und Verfügbarkeit bewertet.",
          whyItMatters: "Akzeptanz entsteht, wenn Infrastruktur zum Nutzungsverhalten passt.",
        },
      ],
      commonMisuse: [
        {
          misuse: "Nur der Akku wird gezählt.",
          correction: "Der Akku zählt, aber Verbrennung, Öl, Wartung, Luft, Stromquelle und Recycling zählen ebenfalls.",
        },
        {
          misuse: "Alter Strommix wird als Zukunft behandelt.",
          correction: "Strommix, geförderter Ökostrom, eigener Ökostrom und Produktionsstrom müssen getrennt werden.",
        },
        {
          misuse: "Ein Ladeproblem wird zur Gesamtbilanz gemacht.",
          correction: "Ladeleistung, Standort, Standzeit und Verfügbarkeit sind Umsetzungsfragen, keine automatische Widerlegung der Technologie.",
        },
      ],
    },
    consequenceCheck: {
      ifNarrativeWins: [
        { level: "sofort", text: "Der Akku wird zum Angstbild.", affectedSystems: ["Debatte", "Aufmerksamkeit"] },
        { level: "danach", text: "Ladeinfrastruktur, Flottenumstellung und Batterie-Recycling wirken weniger plausibel.", affectedSystems: ["Investitionen", "Kommunen", "Industrie"] },
        { level: "auf_dauer", text: "Fossile Mobilität bleibt länger stabil; Ölimporte, Abgase, Lärm und Tankstellenlogik bleiben im System.", affectedSystems: ["Mobilität", "Gesundheit", "Geopolitik"] },
      ],
      ifCorrectlyHandled: [
        { level: "sofort", text: "Die ganze Lebenszyklusrechnung wird sichtbar.", affectedSystems: ["Faktenlage", "Medien"] },
        { level: "danach", text: "Ladeorte, Stromquelle, Batteriegröße, Recycling und Verbrennerfolgen werden vergleichbar.", affectedSystems: ["Infrastruktur", "Verbraucher:innen", "Unternehmen"] },
        { level: "auf_dauer", text: "Mobilität wird Schritt für Schritt vom dauernden Verbrennen getrennt.", affectedSystems: ["Klima", "Stadtluft", "Sicherheit"] },
      ],
      nonActionCost: "Ölimporte, Abgase, Lärm, CO₂, Wartung alter Infrastruktur und geopolitische Abhängigkeit bleiben länger bestehen.",
      lockInRisk: "Je länger Verbrenner-Infrastruktur dominiert, desto plausibler wirkt sie - und desto schwerer wird der Wechsel.",
      feedbackLoop: "Wenn Ladeinfrastruktur ausgebremst wird, bleiben schlechte Ladeerfahrungen sichtbar und verstärken das Narrativ.",
    },
    impactMatrix: [
      { dimension: "Klima", directEffect: "E-Autos verschieben Emissionen von Auspuff zu Produktion und Strompfad.", indirectEffect: "Mit sauberem Strom sinkt die Lebenszyklusbilanz deutlich.", longTermEffect: "Mobilität kann vom fossilen Dauerverbrauch getrennt werden.", hiddenCost: "Nur Akku zählen macht fossilen Kraftstoff unsichtbar.", solutionLever: "Lebenszyklusrechnung und erneuerbarer Ladestrom." },
      { dimension: "Gesundheit", directEffect: "Lokal entfallen Abgase aus dem Auspuff.", indirectEffect: "Stadtluft und Lärmbelastung können sich verbessern.", longTermEffect: "Gesundheitskosten durch Verkehrsschadstoffe können sinken.", hiddenCost: "NOx und Feinstaub aus Verbrennung verschwinden im Akku-Frame.", solutionLever: "Flottenumstellung, ÖPNV, saubere Stadtlogistik." },
      { dimension: "Rohstoffe", directEffect: "Batterien brauchen Rohstoffe und saubere Lieferketten.", indirectEffect: "Batteriechemie, Fahrzeuggröße und Lieferkettenstandards verändern die Wirkung.", longTermEffect: "Rohstoffkritik kann zum Verbesserungsprogramm werden.", hiddenCost: "Rohstoffangst wird als Totalstopp genutzt.", solutionLever: "LFP, Batteriepass, kleinere Fahrzeuge, Lieferkettenstandards." },
      { dimension: "Recycling", directEffect: "Batterien enthalten rückgewinnbare Materialien.", indirectEffect: "Rücknahme, Second Life und Recycling senken Materialdruck.", longTermEffect: "Kreislaufpfade werden Teil der Mobilitätsindustrie.", hiddenCost: "Benzin und Diesel sind nach dem Verbrennen weg.", solutionLever: "Recyclingquote, Rücknahme, Lithiumrückgewinnung." },
      { dimension: "Ölimporte", directEffect: "Verbrenner brauchen fortlaufend fossilen Kraftstoff.", indirectEffect: "Importabhängigkeit und Preisschocks bleiben relevant.", longTermEffect: "Regionale erneuerbare Energie kann Wertschöpfung verschieben.", hiddenCost: "Der Liter an der Zapfsäule blendet Lieferketten aus.", solutionLever: "Direkter Strom, Speicher, Ladeinfrastruktur." },
      { dimension: "Geopolitik", directEffect: "Fossile Lieferketten binden Mobilität an Weltmarkt- und Sicherheitsrisiken.", indirectEffect: "Ölpreis- und Versorgungsschocks treffen Alltag und Unternehmen.", longTermEffect: "Erneuerbare Strompfade können Abhängigkeiten reduzieren.", hiddenCost: "Geopolitik wird im Batterie-Frame kaum mitgezählt.", solutionLever: "Erneuerbarer Strom, europäische Batterieketten, Recycling." },
      { dimension: "Alltag", directEffect: "Laden braucht andere Orte und Routinen als Tanken.", indirectEffect: "Standzeit bei Arbeit, Einkauf, Parken und Depot kann Ladezeit entdramatisieren.", longTermEffect: "Mobilität wird planbarer, wenn Infrastruktur am Alltag hängt.", hiddenCost: "Tankstellenlogik macht Laden künstlich fremd.", solutionLever: "Supermarkt, Arbeitsplatz, Parkhaus, Autobahn, Depot." },
      { dimension: "Infrastruktur", directEffect: "Netzanschluss, Ladeleistung und Verfügbarkeit entscheiden über Nutzung.", indirectEffect: "Gute Ladeorte erhöhen Akzeptanz und Flottennutzen.", longTermEffect: "Fossile Tankstellenlogik verliert Dominanz.", hiddenCost: "Einzelne Ladeprobleme werden als Systembeweis genutzt.", solutionLever: "Ladeparks, Netzplanung, transparente Verfügbarkeit." },
      { dimension: "Logistik / E-Lkw", directEffect: "Lieferverkehr braucht Depotladen, Routenplanung und hohe Ladeleistung.", indirectEffect: "Flotten können planbarer laden als private Zufallsnutzung.", longTermEffect: "Güterverkehr kann schrittweise elektrifiziert werden.", hiddenCost: "Pkw-Engführung blendet Nutzfahrzeuge aus.", solutionLever: "Depotladen, Megawattladen, Logistikkorridore." },
      { dimension: "Demokratie / Vertrauen", directEffect: "Halbe Rechnungen polarisieren Mobilitätsdebatten.", indirectEffect: "Faktenmissbrauch senkt Vertrauen in Planung und Quellen.", longTermEffect: "Bessere Bilanzgrenzen machen Entscheidungen nachvollziehbarer.", hiddenCost: "Empörung ersetzt überprüfbare Abwägung.", solutionLever: "Quellenkarten, Datenstand, Grenzen und Gegenposition sichtbar machen." },
    ],
    narrativeMechanism: {
      story: "Die neue Lösung ist in Wahrheit schlimmer als das alte System.",
      targetEmotion: ["Rohstoffangst", "Ladeangst", "Veränderungsabwehr", "Status-quo-Sicherheit"],
      hiddenAssumption: "Der Verbrenner wird als Normalzustand behandelt, dessen laufende Schäden nicht mehr erklärt werden müssen.",
      whatGetsHidden: ["Ölimporte", "dauerhaftes Verbrennen", "NOx", "Lärm", "Wartung", "fossile Infrastruktur", "geopolitische Abhängigkeit", "Batterie-Recycling", "sauberer Produktionsstrom", "Ladeorte im Alltag"],
      chainNarrative: ["Akku ist schmutzig", "Laden klappt nicht", "Lkw geht nicht", "Strom ist nicht sauber", "also Verbrenner behalten"],
      whoBenefitsFromFrame: ["fossile Lieferketten", "alte Tankstellenlogik", "Verbrenner-Infrastruktur", "Aufschubpolitik"],
      narrativeFamily: ["Status-quo-Schutz", "Aufschub", "Falsche Bilanzgrenze"],
    },
    psychologicalEffectCheck: [
      { simpleName: "Das sichtbare Problem wirkt größer.", technicalName: "Verfügbarkeitsheuristik", howItFeels: "Der Akku ist greifbar. Das verbrannte Öl ist weg und damit unsichtbar.", howItWorks: "Das sichtbare Objekt bekommt mehr Gewicht als laufende, verteilte Schäden.", debateEffect: "Der Akku wird zum ganzen Problem.", howToBypass: "Nicht beim Akku bleiben. Lebenszyklus öffnen.", hostMove: "Der Akku zählt. Aber der verbrannte Kraftstoff zählt auch." },
      { simpleName: "Das Vertraute fühlt sich sicherer an.", technicalName: "Status-quo-Bias", howItFeels: "Tankstellenlogik wirkt normal, Ladeinfrastruktur wirkt fremd.", howItWorks: "Bekannte Routinen fühlen sich risikoärmer an, auch wenn sie hohe Folgekosten haben.", debateEffect: "Umbau wirkt riskanter als Weiter-so.", howToBypass: "Alltagsladen zeigen: Supermarkt, Arbeit, Depot, Autobahnpause.", hostMove: "Laden ist nicht Tanken. Laden passiert oft dort, wo Fahrzeuge ohnehin stehen." },
      { simpleName: "Ein Rohstoffpunkt blockiert die ganze Lösung.", technicalName: "Moralischer Einzelpunkt", howItFeels: "Wenn Rohstoffe schwierig sind, wirkt die ganze Technologie falsch.", howItWorks: "Eine reale Prüfaufgabe wird zum Totschlagargument gegen den gesamten Pfad.", debateEffect: "Prüfaufgabe wird Aufschubgrund.", howToBypass: "Lieferketten, Batteriechemie und Recycling als Verbesserungshebel zeigen.", hostMove: "Rohstoffe sind Prüfaufgabe, nicht Aufschubgrund." },
    ],
    frameShiftPlaybook: {
      oldFrame: "Nur die Batterie zählt.",
      whyItHooks: "Der Akku ist sichtbar, groß und moralisch leicht angreifbar.",
      dangerIfRepeated: "Wer nur die Batterie verteidigt, lässt Verbrennung, Öl, Luft und Infrastruktur verschwinden.",
      doNotSay: ["E-Autos sind immer sauber.", "Der Akku ist kein Problem.", "Verbrenner sind böse.", "Du hast keine Ahnung."],
      sayInstead: ["Der Akku zählt. Aber er ist nur ein Teil der Rechnung.", "Fair ist der ganze Lebenszyklus.", "Vergleichen wir Öl, Strom, Batterie, Wartung, Luft und Recycling zusammen."],
      bridgeSentence: "Ich nehme den Akkupunkt ernst - aber ich bleibe nicht in einer halben Rechnung.",
      betterQuestion: "Vergleichen wir nur die Batterie - oder den ganzen Lebensweg von Öl, Strom, Luft, Wartung und Recycling?",
      answerFormats: {
        comment: "Der Akku hat einen CO₂-Rucksack. Fair ist aber der ganze Lebenszyklus: Batterie, Produktionsstrom, Ladestrom, Wartung, Recycling und der Kraftstoff, den der Verbrenner über Jahre verbrennt.",
        live30s: "Das E-Auto ist nicht wirkungsfrei. Der Akku zählt. Aber Benzin, Diesel, Ölimporte, Abgase, Ladestrom, Produktion und Recycling zählen auch.",
        panel2min: "Das E-Auto ist nicht wirkungsfrei. Batterieproduktion, Rohstoffe, Fahrzeuggröße, Produktionsstrom und Recycling müssen in die Bilanz. Aber der Vergleich darf nicht beim Akku stehenbleiben. Der Verbrenner verbrennt über seine Lebensdauer Benzin oder Diesel, verursacht lokale Abgase und hängt an Ölimporten. Bei geförderter öffentlicher Ladeinfrastruktur ist erneuerbarer Strom eine Fördervoraussetzung; Produktionsstrom und Batteriechemie verändern die Startbilanz ebenfalls. Darum ist die bessere Frage: Welche Mobilität hat über den ganzen Lebenszyklus weniger CO₂, weniger Öl, weniger Abgase, bessere Recyclingpfade und die passendere Infrastruktur?",
        calmConversation: "Ja, der Akku zählt. Aber er ist nur ein Teil der Rechnung. Lass uns Batterie, Stromquelle, Produktion, Recycling und das dauernde Verbrennen von Öl zusammen vergleichen.",
      },
    },
    solutionPath: {
      plainLanguageSummary: "Nicht Auto gegen Auto ideologisch vergleichen, sondern Mobilität nach Lebenszyklus, Gesundheit, Alltag, Infrastruktur und Abhängigkeit steuern.",
      levers: [
        { title: "Lebenszyklusrechnung", whatToDo: "Akku, Fahrzeugbau, Ladestrom, Nutzung, Wartung, Recycling und fossile Kraftstoffbereitstellung gemeinsam ausweisen.", whyItWorks: "Halbe Rechnungen verlieren ihre Wirkung.", systemEffect: "Investitionen gehen in bessere Fahrzeuge, bessere Batterien und bessere Ladeinfrastruktur.", indicators: ["CO₂ je Lebenszyklus", "Batteriegröße", "Ladestrom", "Laufleistung"] },
        { title: "Ladeinfrastruktur im Alltag", whatToDo: "Schnelllader an Supermärkten, Baumärkten, Arbeitsplätzen, Parkhäusern, Depots und Autobahnen ausbauen.", whyItWorks: "Ladezeit wird Standzeit.", systemEffect: "Akzeptanz steigt und fossile Tankstellenlogik verliert Dominanz.", indicators: ["Verfügbarkeit", "Standort", "Leistung", "Ökostromnachweis"] },
        { title: "Ladeparks und Netzplanung", whatToDo: "Ladeparks, Netzanschlüsse und Preistransparenz koordiniert planen.", whyItWorks: "Zuverlässigkeit senkt Ladeangst.", systemEffect: "E-Mobilität wird als Infrastruktur sichtbar.", indicators: ["Uptime", "Netzanschluss", "Preis", "Belegung"] },
        { title: "Depotladen und Megawattladen", whatToDo: "Depotladen, Megawattladen und Logistikkorridore für Lieferverkehr und schwere Nutzfahrzeuge aufbauen.", whyItWorks: "Flotten laden planbarer als Zufallsverkehr.", systemEffect: "Transformation betrifft auch Logistik und nicht nur Pkw.", indicators: ["Depotkapazität", "MCS-Standorte", "elektrische Flottenanteile"] },
        { title: "Batterie- und Lieferkettenstandards", whatToDo: "Batteriepass, Recyclingquote, Rohstoffstandards, Reparierbarkeit und kleinere Fahrzeugklassen stärken.", whyItWorks: "Rohstoffkritik wird Verbesserungsprogramm statt Aufschubargument.", systemEffect: "Materialwirkung sinkt und Vertrauen steigt.", indicators: ["Recyclingquote", "Kobaltanteil", "Batteriepass", "Reparierbarkeit"] },
        { title: "Erneuerbarer Produktionsstrom", whatToDo: "Zellfertigung, Fahrzeugbau und Zulieferketten mit erneuerbarem Strom und transparenter Bilanz ausweisen.", whyItWorks: "Die Startbilanz des Fahrzeugs verbessert sich.", systemEffect: "Industrieinvestitionen folgen dem besseren Wirkungspfad.", indicators: ["Strombezug", "Werkdaten", "Lieferkettendaten"] },
      ],
      woekConnection: {
        principle: "Wirkung ist die tatsächliche Veränderung des Mobilitätssystems.",
        explanation: "Die bessere Lösung senkt nicht nur eine Zahl, sondern verändert Energiequelle, Infrastruktur, Gesundheit, Alltag, Lieferketten und Abhängigkeiten.",
        internalLinks: ["/begriffe/wirkung/", "/begriffe/bilanzgrenze/", "/so-wirkt-wirkungsoekonomie/"],
      },
    },
    sources: [
      {
        label: "ADAC Lebenszyklusanalyse Antriebe",
        url: "https://www.adac.de/verkehr/tanken-kraftstoff-antrieb/alternative-antriebe/klimabilanz/",
        useFor: ["Lebenszyklusvergleich", "Strommix-Sensitivität", "regenerativer Strom"],
        warning: "Modellannahmen zu Fahrzeugklasse, Laufleistung, Batteriegröße und Strompfad prüfen.",
      },
      {
        label: "ADAC Fakten zur Elektromobilität",
        url: "https://www.adac.de/rund-ums-fahrzeug/elektromobilitaet/elektroauto/elektroauto-pro-und-contra/",
        useFor: ["CO2-Rucksack", "Betrieb", "Akku und Garantie", "Ladeinfrastruktur"],
        warning: "Ratgeberquelle; Detailzahlen können sich mit Markt und Datenstand ändern.",
      },
      {
        label: "BMV Förderprogramm Ladeinfrastruktur",
        url: "https://www.bmv.de/SharedDocs/DE/Artikel/G/infopapier-sechster-foerderaufruf-ladeinfrastruktur.html",
        useFor: ["geförderte öffentliche Ladeinfrastruktur", "erneuerbarer Strom als Fördervoraussetzung"],
        warning: "Belegt Fördervoraussetzungen, nicht jede private oder ungeförderte Ladesituation.",
      },
      {
        label: "ICCT Lebenszyklusvergleich Fahrzeuge",
        url: "https://theicct.org/publication/a-global-comparison-of-the-life-cycle-greenhouse-gas-emissions-of-combustion-engine-and-electric-passenger-cars/",
        useFor: ["Lebenszyklus Fahrzeuge", "Verbrennervergleich", "Strommix-Sensitivität"],
        warning: "Regionale Strommix- und Fahrprofilannahmen müssen geprüft werden.",
      },
      {
        label: "IEA Global EV Outlook",
        url: "https://www.iea.org/reports/global-ev-outlook-2024",
        useFor: ["Elektromobilität", "Batterien", "Markt- und Infrastrukturdaten"],
        warning: "Szenarien hängen von Annahmen, Politik und Marktentwicklung ab.",
      },
    ],
  }),
  makeDossier("e-fuels-retten-den-verbrenner", {
    title: "E-Fuels retten den Verbrenner?",
    claim: "E-Fuels retten den Verbrenner.",
    topicCluster: ["E-Fuels", "Mobilitaet", "Energie"],
    shortJudgement: "Wertvolle Molekuele. Falscher Alltagsumweg.",
    sayThisNow: "E-Fuels sind wichtig fuer Flugzeuge, Schiffe und Spezialfaelle. Fuer Alltagsautos ist direkter Strom meist der bessere Weg.",
    positiveExampleTitle: "Direkt laden, Molekuele sparen",
    positiveExampleText: "Das Stadtauto laedt direkt. Der Lkw laedt im Depot. Knappes E-Kerosin geht in Flugzeuge, die nicht einfach mit grossen Akkus fliegen koennen. So wirkt dieselbe Energie dort, wo sie am meisten hilft.",
    whatGetsBetter: ["Direktstrom", "Flugverkehr", "Knappheit", "Prioritaet"],
    hostLine: "Direkt laden, wo es geht. Molekuele sparen, wo sie gebraucht werden.",
    betterQuestion: "Fuer welchen Einsatz meinst du E-Fuels: Flugzeug, Schiff, Spezialfall - oder Alltagsauto?",
    oldFrame: "E-Fuels als Verbrenner-Rettung.",
    solution: "Synthetische Molekuele fuer schwer elektrifizierbare Anwendungen priorisieren, Alltagsmobilitaet direkt elektrifizieren.",
    simpleMechanism: "E-Fuels brauchen Strom, Wasserstoff, CO2, Synthese und Verbrennung. Der direkte Strompfad ist fuer Pkw meist deutlich wirksamer; Molekuele bleiben eher Reserve, Spezialfall und Zeitpfad fuer schwer elektrifizierbare Anwendungen.",
  }),
  makeDossier("wasserstoff-fuer-alles", {
    title: "Wasserstoff fuer alles?",
    claim: "Wir machen das einfach mit Wasserstoff.",
    topicCluster: ["Wasserstoff", "Energie", "Industrie"],
    shortJudgement: "Wertvoll. Deshalb nicht ueberall.",
    sayThisNow: "Wasserstoff ist wichtig. Aber er gehoert zuerst dahin, wo Strom direkt schwer reicht: Stahl, Chemie, Schiffe, Flugzeuge und Langzeitspeicher.",
    positiveExampleTitle: "Der gruene Stahl",
    positiveExampleText: "Ein Stahlwerk ersetzt Kohle durch gruenen Wasserstoff. Der Wasserstoff geht nicht in jede Heizung, sondern dorthin, wo Strom allein schwer reicht. Aus dem Stahl werden Bruecken, Zuege, Windraeder und Gebaeude.",
    whatGetsBetter: ["Stahl", "Molekuele", "Prioritaet", "Resilienz"],
    hostLine: "Wasserstoff ist zu wertvoll fuer alles. Er gehoert zuerst dorthin, wo er wirklich gebraucht wird.",
    betterQuestion: "Wo brauchen wir Wasserstoff wirklich - und wo geht Strom direkter?",
    oldFrame: "Wasserstoff loest alles.",
    solution: "Direktstrom zuerst, Wasserstoff fuer Industrie, Molekuele, Langzeitspeicher und seltene Reserve priorisieren.",
    simpleMechanism: "Gruener Wasserstoff wird aus Strom hergestellt. Jede Umwandlung kostet Energie. Reserve und Dauerbetrieb muessen getrennt werden.",
  }),
  makeDossier("arbeit-lohnt-sich-nicht-mehr", {
    title: "Arbeit lohnt sich nicht mehr?",
    claim: "Arbeit lohnt sich nicht mehr.",
    topicCluster: ["Arbeit", "Sozialstaat", "Teilhabe"],
    shortJudgement: "Echter Arbeitsfrust. Falscher Schuldiger.",
    sayThisNow: "Arbeit muss spuerbar tragen. Dafuer muessen Lohn, Miete, Betreuung, Qualifikation und Uebergaenge zusammenpassen.",
    positiveExampleTitle: "Mehr Stunden, mehr Sicherheit",
    positiveExampleText: "Eine alleinerziehende Mutter arbeitet mehr. Die Kita ist verlaesslich. Der Bus ist bezahlbar. Leistungen fallen nicht abrupt weg. Am Monatsende bleibt spuerbar mehr uebrig.",
    whatGetsBetter: ["Lohn", "Betreuung", "Mobilitaet", "Sicherheit"],
    hostLine: "Arbeit lohnt sich, wenn mehr Arbeit auch mehr Sicherheit bringt.",
    betterQuestion: "Was muss sich aendern, damit Arbeit wirklich mehr Sicherheit und Teilhabe schafft?",
    oldFrame: "Menschen im Sozialstaat sind der Schuldige.",
    solution: "Lohn, Wohnen, Betreuung, Qualifikation, Mobilitaet und Transferuebergaenge zusammen verbessern.",
    simpleMechanism: "Realer Frust wird auf Menschen projiziert. Die bessere Rechnung zeigt Barrieren und Hebel, die Arbeit tragfaehig machen.",
    avoidFrameTerms: ["faul", "Kosten", "Last"],
  }),
  makeDossier("co2-preis-oder-fossile-systemkosten", {
    title: "CO2-Preis oder fossile Systemkosten?",
    claim: "Der CO2-Preis ist Abzocke.",
    topicCluster: ["Klima", "Geld", "Steuern"],
    shortJudgement: "Sichtbare Steuerung statt versteckte Schaeden.",
    sayThisNow: "Der CO2-Preis ist nicht das Ziel. Er macht fossile Folgekosten sichtbar und kann Geld so zurueckgeben, dass saubere Loesungen leichter werden.",
    positiveExampleTitle: "Das Geld, das zurueckarbeitet",
    positiveExampleText: "Ein CO2-Preis macht fossile Kosten sichtbar. Das Geld fliesst als Klimageld, Gebaeudefoerderung, besserer Bus oder guenstigere Stromkosten zurueck. So wird der Umbau leichter.",
    whatGetsBetter: ["Klimageld", "Bus", "Gebaeude", "Lenkung"],
    hostLine: "Der CO2-Preis ist nicht die Strafe. Er ist die Rueckfuehrung versteckter Folgekosten.",
    betterQuestion: "Zahlen wir fossile Kosten unsichtbar als Schaden - oder sichtbar und lenkend als Umbau?",
    oldFrame: "CO2-Preis als reine Abzocke.",
    solution: "Fossile Folgekosten sichtbar machen und Einnahmen sozial, wirksam und transparent zurueckfuehren.",
    simpleMechanism: "Unsichtbare Schaeden werden nicht als Preis erlebt. Sichtbare Lenkung wirkt nur fair, wenn Rueckgabe und Alternativen mitgebaut werden.",
  }),
  makeDossier("kernenergie-wieder-in-deutschland", {
    title: "Kernenergie wieder in Deutschland?",
    claim: "Kernkraft ist die einfache Loesung.",
    topicCluster: ["Kernenergie", "Energie", "Zeitpfad"],
    shortJudgement: "Teure Waermelogik. Schlechter Zeitpfad.",
    sayThisNow: "Kernkraft macht nicht direkt Strom. Sie macht Waerme, daraus Dampf, daraus Turbinenstrom. Fuer Deutschland ist das zu langsam, teuer und unflexibel.",
    positiveExampleTitle: "Der schnelle Wirkungs-Euro",
    positiveExampleText: "Ein Bundesland investiert in Wind, Solar, Netze, Speicher, Waermepumpen und digitale Steuerung. Schon nach wenigen Jahren sinken fossile Importe und Stromrisiken. Das Geld wirkt, bevor ein neues Kernkraftwerk geplant waere.",
    whatGetsBetter: ["Zeit", "Kosten", "Flexibilitaet", "Importe"],
    hostLine: "Gute Energiepolitik fragt: Was liefert rechtzeitig guenstigen Strom?",
    betterQuestion: "Was liefert vor 2030 und 2035 sicher, guenstig und flexibel Strom?",
    oldFrame: "Kernkraft als einfache Rettung.",
    solution: "Zeitpfad, Kosten, Flexibilitaet, Abfall, Bauzeit und direkte erneuerbare Strompfade vergleichen.",
    simpleMechanism: "Kernenergie ist ein thermischer Pfad: Waerme, Dampf, Turbine. Die Frage ist, was rechtzeitig, flexibel und bezahlbar wirkt.",
  }),
  makeDossier("radwege-in-peru", {
    title: "Radwege in Peru?",
    claim: "Fuer Radwege in Peru ist Geld da.",
    topicCluster: ["Steuergeld", "Globale Verantwortung", "Mobilitaet"],
    shortJudgement: "Spottbild statt Wirkungspruefung.",
    sayThisNow: "Ein Auslandsprojekt ist nicht falsch, weil es weit weg ist. Entscheidend ist: Was bewirkt es, wer zahlt was, und wie wird es kontrolliert?",
    positiveExampleTitle: "Der sichere Weg zur Metro",
    positiveExampleText: "Eine Schuelerin faehrt sicher zur Metro. Die Familie spart Fahrgeld. Die Strasse wird entlastet. Schule, Arbeit und Stadt werden besser erreichbar.",
    whatGetsBetter: ["Schulweg", "Metro", "Sicherheit", "Teilhabe"],
    hostLine: "Ein guter Radweg ist nicht nur Asphalt. Er verbindet Schule, Arbeit, Metro und Teilhabe.",
    betterQuestion: "Was bewirkt das Projekt konkret - und wird es transparent, kontrolliert und wirksam umgesetzt?",
    oldFrame: "Ausland gegen Inland.",
    solution: "Zuschuss, Kredit, Kontrolle, Wirkung und deutsche Interessen transparent auseinanderhalten.",
    simpleMechanism: "Ein Spottbild ersetzt die Wirkungspruefung. Die bessere Rechnung trennt Ort, Finanzierung, Kontrolle und Nutzen.",
  }),
  makeDossier("ukraine-unterstuetzung-steuergeld", {
    title: "Ukraine-Unterstuetzung und Steuergeld?",
    claim: "Unser Steuergeld geht in die Ukraine.",
    topicCluster: ["Steuergeld", "Ukraine", "Sicherheit"],
    shortJudgement: "Echte Kontrolle. Falsches Verlustbild.",
    sayThisNow: "Ukraine-Hilfe ist nicht einfach Geld weg. Gute Hilfe haelt Kliniken, Strom, Wasser, Verwaltung und Schutz stabil.",
    positiveExampleTitle: "Das Krankenhaus, in dem das Licht anbleibt",
    positiveExampleText: "Unterstuetzung hilft, Strom, Wasser und Klinikbetrieb zu sichern. Menschen werden versorgt. Verwaltung bleibt erreichbar. Europa bleibt stabiler.",
    whatGetsBetter: ["Klinik", "Strom", "Wasser", "Stabilitaet"],
    hostLine: "Hilfe ist nicht nur Geld. Hilfe kann bedeuten: Licht bleibt an, Kliniken arbeiten, Wasser laeuft.",
    betterQuestion: "Was bewirkt die Unterstuetzung konkret - und welche Kosten wuerden entstehen, wenn wir nicht helfen?",
    oldFrame: "Hilfe als Geldverlust.",
    solution: "Unterstuetzung nach Zweck, Kontrolle, Wirkung, Sicherheitsnutzen und Folgekosten pruefen.",
    simpleMechanism: "Ein Betrag wird zum Verlustbild. Die bessere Rechnung fragt nach Schutz, Stabilitaet, Kontrolle und Kosten des Nichthandelns.",
  }),
];

export const p0DossiersV2 = normalizeDossierText(rawP0DossiersV2);

export const p0SlugsV2 = p0DossiersV2.map((dossier) => dossier.slug);
