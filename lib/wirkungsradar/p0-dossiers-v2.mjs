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
  ["zaehlst", "zählst"],
  ["Zaehlst", "Zählst"],
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
  ["laesst", "lässt"],
  ["Laesst", "Lässt"],
  ["wuerden", "würden"],
  ["wuerde", "würde"],
  ["souveraen", "souverän"],
  ["grossen", "großen"],
  ["Entlastungserzaehlung", "Entlastungserzählung"],
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
    warning: "Quellen müssen je Detailseite weiter fachlich gepflegt werden.",
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
        explanation: item.bilanzgrenze || "Fakten, Folgekosten, bessere Lösungswege, Alternativen, Vertrauen und demokratische Entscheidung.",
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
  const claim = item.claim || item.title || "diese Aussage";
  const missing = item.whatIsMissing || [];
  const truePoint = item.whatIsTrue?.[0] || "ein berechtigter Punkt wird sichtbar";
  const solution = item.solution || item.betterAnswer || item.betterQuestion || "der bessere Wirkungspfad muss konkret belegt werden";
  const consequences = item.consequences?.length >= 3 ? item.consequences : [
    `Die Aussage „${claim}“ macht ${truePoint} zur Gesamtdeutung und verengt die erste Wahrnehmung.`,
    missing[0]
      ? `${missing[0]} Dadurch werden Entscheidungen wahrscheinlicher, die diesen fehlenden Teil nicht mitprüfen.`
      : `Die Debatte prüft seltener, welche Alternative, welcher Zeitraum und welche Nebenfolgen mitgezählt werden müssen.`,
    `Der bessere Pfad wird verzögert: ${solution}`,
  ];
  const measures = item.measures || [
    ["Wirkungsfrage stellen", `Welche Zustandsveränderung entsteht, wenn Menschen der Aussage „${claim}“ folgen?`],
    ["Bilanzgrenze öffnen", missing[0] || "Kosten, Nutzen, Zeitpfad, Alternativen und Nebenfolgen fallbezogen zusammen betrachten."],
    ["Gegensteuerung benennen", solution],
  ];
  const pathway = [
    `Auslöser: ${claim}`,
    `Wirkmechanismus: ${item.simpleMechanism || missing[0] || "ein wahrer Kern wird zu einer zu engen Schlussfolgerung"}`,
    `Gegensteuerung: ${solution}`,
  ];
  return {
    ifNarrativeWins: [
      {
        level: "Wirkung 1. Ordnung",
        narrative: claim,
        mechanism: item.simpleMechanism || missing[0] || "Ein wahrer Kern wird als ganze Erklärung gesetzt.",
        impactPath: pathway[0],
        dimension: "Wahrnehmung",
        reason: `Diese Wirkung folgt aus der konkreten Behauptung, weil sie die Debatte zuerst auf „${claim}“ ausrichtet.`,
        text: consequences[0],
        affectedSystems: [claim, "Wahrnehmung"],
      },
      {
        level: "Wirkung 2. Ordnung",
        narrative: claim,
        mechanism: missing[0] || "Die Bilanzgrenze wird enger als der reale Wirkungsraum.",
        impactPath: pathway[1],
        dimension: "Entscheidung",
        reason: "Die Anschlussentscheidung wird riskanter, weil ein fehlender Teil der Rechnung politisch weniger sichtbar wird.",
        text: consequences[1],
        affectedSystems: [missing[0] || claim, "Entscheidung"],
      },
      {
        level: "Wirkung 3. Ordnung",
        narrative: claim,
        mechanism: item.lockInRisk || "Der verkürzte Frame stabilisiert einen schlechteren Systempfad.",
        impactPath: pathway[2],
        dimension: "Systempfad",
        reason: "Die langfristige Wirkung entsteht, wenn Aufschub, falsche Prioritäten oder fehlende Gegensteuerung wiederholt werden.",
        text: consequences[2],
        affectedSystems: [solution, "Systempfad"],
      },
    ],
    ifCorrectlyHandled: measures.slice(0, 3).map(([title, text], index) => ({
      level: ["Gegensteuerung 1", "Gegensteuerung 2", "Gegensteuerung 3"][index] || "Gegensteuerung",
      text: `${title}: ${text}`,
      affectedSystems: [claim, title],
    })),
    mpd: item.mpd || {
      mensch: item.mpdMensch || consequences.find((text) => /mensch|arbeit|gesund|pflege|teilhabe|alltag|w(?:ü|ue)rde|sicherheit/i.test(text)) || consequences[0],
      planet: item.mpdPlanet || consequences.find((text) => /planet|klima|energie|ressource|natur|emission|dekarbon/i.test(text)) || missing.find((text) => /klima|energie|ressource|natur|emission|planet/i.test(text)) || "",
      demokratie: item.mpdDemokratie || consequences.find((text) => /demokratie|vertrauen|quelle|institution|medien|entscheidung|debatte/i.test(text)) || "Die Debatte braucht überprüfbare Quellen, klare Bilanzgrenzen und faire Sprache.",
    },
    woekAssessment: item.woekAssessment || `Wirkungsökonomisch zählt hier nicht das Schlagwort, sondern ob die Behauptung „${claim}“ bessere Entscheidungen wahrscheinlicher macht oder einen schlechteren Pfad stabilisiert.`,
    nonActionCost: item.nonActionCost || `Wenn der Frame „${claim}“ dominiert, bleiben die konkreten Alternativen und Unterlassungskosten dieser Debatte unsichtbar.`,
    lockInRisk: item.lockInRisk || `Je länger diese Deutung Entscheidungen prägt, desto normaler wirkt der schlechtere Pfad statt: ${solution}`,
    feedbackLoop: item.feedbackLoop || `Wenn daraus schlechtere Entscheidungen entstehen, wirkt die ursprüngliche Behauptung später scheinbar plausibler.`,
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
  const mediumFallback = item.betterAnswer || `${item.sayThisNow} Entscheidend ist die fehlende Bilanzgrenze: ${item.betterQuestion}`;
  const longFallback = [
    item.sayThisNow,
    item.simpleMechanism,
    `Der wahre Kern gehört in die Rechnung, aber nicht als ganze Schlussfolgerung.`,
    `Darum muss man prüfen: Fakten, Folgen, Alternativen, Unterlassungskosten und bessere Lösung.`,
    `Die bessere Frage lautet: ${item.betterQuestion}`,
  ].filter(Boolean).join(" ");
  const calmFallback = item.betterAnswer || `Ich nehme den Punkt ernst. Lass uns die Rechnung öffnen: ${item.betterQuestion}`;
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
      short10s: responses.short10s?.text || responses.comment?.text || item.sayThisNow,
      medium30s: responses.medium30s?.text || responses.live?.text || mediumFallback,
      long2min: responses.long2min?.text || responses.panel?.text || longFallback,
      comment: responses.comment?.text || item.sayThisNow,
      live30s: responses.live?.text || mediumFallback,
      panel2min: responses.panel?.text || longFallback,
      calmConversation: responses.calmCounter?.text || calmFallback,
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
      order1: { label: "Wirkung 1. Ordnung", text: (item.consequences || derivedConsequenceCheck(item).ifNarrativeWins.map((entry) => entry.text))[0] },
      order2: { label: "Wirkung 2. Ordnung", text: (item.consequences || derivedConsequenceCheck(item).ifNarrativeWins.map((entry) => entry.text))[1] },
      order3: { label: "Wirkung 3. Ordnung", text: (item.consequences || derivedConsequenceCheck(item).ifNarrativeWins.map((entry) => entry.text))[2] },
    },
    solution: {
      plainLanguage: item.solution,
      measures: (item.measures || [
        ["Wirkungsfrage stellen", "Was verbessert sich konkret, für wen und mit welchen Nebenfolgen?"],
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
      unsicherOderPruefpflichtig: item.pruefen || ["Zahlen, Quellen, Umsetzung und lokale Wirkung müssen je Fall geprüft werden."],
      bilanzgrenze: item.bilanzgrenze || "Fakten, Folgekosten, bessere Lösungswege, Alternativen, Vertrauen und demokratische Entscheidung.",
      gegenposition: item.gegenposition || "Kritik bleibt legitim, wenn sie Belege, Grenzen und bessere Lösungen prüft.",
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
    shortJudgement: "Echter Startaufwand. Falsches Dauerurteil.",
    sayThisNow: "Ja, Ankommen braucht zunächst Geld und Organisation. Menschen sind aber kein Rechnungsposten. Integration entscheidet, ob daraus Arbeit, Beiträge, Versorgung und Teilhabe werden.",
    positiveExampleTitle: "Der Sprachkurs, der zur Pflegekraft führt",
    positiveExampleText: "Eine Frau kommt nach Deutschland. Ihr Abschluss wird schnell geprüft. Sie lernt Deutsch im Betrieb. Eine Kommune hilft bei Wohnung, Kita und Anmeldung. Ein Jahr später arbeitet sie in der Pflege. Ein Team ist entlastet. Menschen werden versorgt. Sie zahlt Steuern und ist Teil der Nachbarschaft.",
    whatGetsBetter: ["Sprache", "Pflege", "Arbeit", "Nachbarschaft"],
    hostLine: "Ein Sprachkurs ist kein verlorenes Geld, wenn er mit Anerkennung, Arbeit und Wohnen verbunden ist.",
    betterQuestion: "Welche Integration macht aus Startaufwand später Arbeit, Beiträge, Versorgung und demokratische Teilhabe?",
    oldFrame: "Migration als reine Ausgabenerzählung.",
    whyItHooks: "Startkosten sind sichtbar, kommunale Engpässe sind real und einzelne problematische Fälle bleiben emotional hängen.",
    dangerIfRepeated: "Wer nur über Ausgaben spricht, macht aus Menschen ein Verwaltungsproblem und blendet den Wirkungspfad aus: Sprache, Verfahren, Arbeit, Schule, Wohnen, Sicherheit und Beiträge.",
    bridgeSentence: "Der Startaufwand ist real; die Schlussfolgerung 'Migration kostet nur' ist trotzdem keine vollständige Rechnung.",
    doNotSay: [
      "Migration kostet gar nichts.",
      "Wer Kosten anspricht, ist gegen Migration.",
      "Das ist alles nur Stimmungsmache.",
    ],
    sayInstead: [
      "Startkosten und kommunale Belastung gehören in die Rechnung.",
      "Die entscheidende Frage ist, ob Integration in Sprache, Schule, Arbeit, Wohnen und Anerkennung gelingt.",
      "Wir müssen Kosten, Beiträge, Fachkräftebedarf, Unterlassungskosten und Teilhabe zusammen prüfen.",
    ],
    betterAnswer: "Startkosten anerkennen, Integration als Infrastruktur bauen und dann nach Wirkung prüfen: Wer lernt Sprache, wer kommt in Arbeit, welche Kommune wird entlastet, welche Beiträge entstehen und welche Probleme werden vermieden?",
    whyBetter: "Die Antwort leugnet den kommunalen Druck nicht. Sie trennt Startaufwand, Integrationsqualität, Arbeitsmarkt, Sozialstaat und langfristige Wirkung.",
    solution: "Integration als Infrastruktur bauen: schnelle Verfahren, Sprache, Schule, Kita, Anerkennung, Wohnen, Arbeitsmarktzugang, klare Regeln und kommunale Finanzierung zusammen.",
    simpleMechanism: "Startaufwand ist sofort sichtbar; spätere Arbeit, Beiträge, Pflege, Ausbildung, Steuerleistung und Nachbarschaft sind zeitversetzt. Die verkürzte Aussage macht aus einem Zeitpfad ein Gruppenurteil.",
    avoidFrameTerms: ["kostet nur", "reine Ausgaben", "Bedrohung"],
    responses: {
      short10s: {
        text: "Ja, Ankommen braucht zunächst Geld und Organisation. Menschen sind aber kein Rechnungsposten. Integration entscheidet, ob daraus Arbeit, Beiträge, Versorgung und Teilhabe werden.",
      },
      medium30s: {
        text: "Der wahre Kern ist: Aufnahme, Unterbringung, Schule, Sprache und Verwaltung brauchen am Anfang Geld und Personal. Der Denkfehler ist: Daraus folgt nicht, dass Migration nur kostet oder Menschen als Rechnungsposten gelesen werden dürfen. Entscheidend ist der Zeitpfad. Wenn Verfahren, Sprachkurse, Anerkennung von Abschlüssen, Wohnen, Kita und Arbeitsmarktzugang funktionieren, entstehen Arbeit, Beiträge, Steuern, Fachkräfte, Nachbarschaft und Versorgung. Wenn diese Infrastruktur fehlt, werden Menschen länger abhängig und Kommunen bleiben belastet.",
      },
      long2min: {
        text: "Ich würde die Kosten nicht wegreden. Kommunen brauchen Unterkünfte, Verwaltung, Schulen, Kitas, Sprachkurse, Beratung und Sicherheit. Das ist realer Startaufwand. Aber die Aussage 'Migration kostet nur' macht aus diesem Startaufwand ein dauerhaftes Pauschalurteil über Menschen. Fachlich sauber ist eine andere Rechnung: Erstens müssen wir Zeit unterscheiden. In den ersten Jahren entstehen höhere Integrations- und Unterstützungsaufgaben. Zweitens müssen wir die Integrationsqualität prüfen: Sprache, Schulbildung, Anerkennung von Abschlüssen, schneller Arbeitsmarktzugang, Wohnen, Kinderbetreuung und klare Verfahren. Drittens müssen wir die Alternative mitzählen: Fachkräftelücken, unbesetzte Pflege- und Ausbildungsstellen, demografischer Druck, Schwarzarbeit, lange Wartezeiten und Vertrauensverlust, wenn Integration schlecht organisiert ist. Das IAB zeigt am Beispiel der 2015 zugezogenen Geflüchteten, dass Erwerbsintegration Zeit braucht, aber deutlich vorankommt: 2024 lag ihre Beschäftigungsquote bei 64 Prozent und damit nahe am Durchschnitt der Gesamtbevölkerung von 70 Prozent. Die Bundesagentur für Arbeit weist außerdem darauf hin, dass absolute Zahlen allein nicht reichen; entscheidend sind Beschäftigungs-, Arbeitslosen- und SGB-II-Quoten. Die bessere Frage lautet deshalb nicht: Kostet Migration? Natürlich kostet Aufnahme am Anfang. Die bessere Frage lautet: Welche Integration macht aus Ankommen möglichst schnell Sprache, Arbeit, Beiträge, Versorgung, Sicherheit und Teilhabe?",
      },
      calmCounter: {
        text: "Ich verstehe den Kostendruck. Aber lass uns die Rechnung vollständig machen: Was kostet Aufnahme am Anfang, was kostet schlechte Integration, und was entsteht, wenn Sprache, Arbeit, Wohnen und Anerkennung funktionieren?",
      },
    },
    whatIsTrue: [
      "Aufnahme, Unterbringung, Sprachkurse, Schule, Kita, Verwaltung und Beratung verursachen am Anfang echte öffentliche Kosten.",
      "Viele Kommunen stehen unter Druck, wenn Unterbringung, Personal, Wohnraum, Schule und Integration nicht planbar finanziert sind.",
      "Arbeitsmarktintegration braucht Zeit, Sprache, passende Verfahren, Anerkennung von Qualifikationen und realistische Übergänge.",
      "Einzelne Problemfälle, Sozialleistungsbezug oder Integrationsabbrüche müssen konkret geprüft werden.",
    ],
    whatIsMissing: [
      "Die Aussage verwechselt Startaufwand mit dauerhafter Nettowirkung.",
      "Sie blendet Arbeit, Beiträge, Steuern, Fachkräftebedarf, Pflege, Ausbildung und demografische Wirkung aus.",
      "Sie trennt nicht zwischen Schutzmigration, Arbeitsmigration, Familiennachzug, EU-Freizügigkeit und Menschen, die schon lange in Deutschland leben.",
      "Sie betrachtet absolute Kosten, aber nicht Beschäftigungs-, Arbeitslosen- und SGB-II-Quoten als bessere Indikatoren.",
      "Sie zählt die Kosten schlechter Integration und die Kosten nicht besetzter Arbeit nicht mit.",
    ],
    dimensions: [
      ["Kommunen", "Unterbringung, Verwaltung, Schule, Kita und Sozialarbeit brauchen planbare Finanzierung.", "Gute Strukturen senken Chaoskosten und beschleunigen Integration."],
      ["Sprache", "Sprache ist kein Nice-to-have, sondern Zugang zu Arbeit, Bildung, Verwaltung und Nachbarschaft.", "Sprachkurs, Betrieb und Alltag müssen zusammenwirken."],
      ["Arbeit", "Arbeitsmarktzugang, Anerkennung und Matching entscheiden, ob aus Unterstützung Beiträge werden.", "Qualifikationen dürfen nicht jahrelang ungenutzt bleiben."],
      ["Sozialstaat", "Leistungen können Startbrücke oder Dauerabhängigkeit sein.", "Die Wirkung hängt an Verfahren, Qualifikation und Arbeitsmarkt."],
      ["Pflege und Fachkräfte", "Viele Engpassberufe brauchen zusätzliche Arbeitskräfte.", "Migration ersetzt keine Reformen, kann aber Versorgung stabilisieren."],
      ["Wohnen", "Wohnraumknappheit ist ein Systemproblem, kein Gruppenmerkmal.", "Bauen, Belegung, Verteilung und kommunale Planung gehören in dieselbe Rechnung."],
      ["Demokratie", "Pauschale Kostenframes machen aus Verwaltungsproblemen Gruppenabwertung.", "Faire Debatten trennen Belastung, Verantwortung und Menschenwürde."],
    ],
    psychology: [
      ["Der sichtbare Startaufwand wirkt wie die ganze Wahrheit.", "Salienz-Bias", "Unterkunft, Bürgergeld oder Verwaltungskosten sind sichtbar; spätere Beiträge und Arbeit sind zeitversetzt.", "Startkosten anerkennen und dann den Zeitpfad bis Arbeit, Beiträgen und Versorgung öffnen."],
      ["Aus Einzelfällen wird ein Gruppenbild.", "Verfügbarkeitsheuristik", "Auffällige Fälle bleiben stärker hängen als leise gelingende Integration.", "Einzelfall prüfen, aber keine Gruppe zur Erklärung machen."],
      ["Komplexe Ursachen bekommen eine einfache Schuldgruppe.", "Sündenbockmechanismus", "Wohnungsnot, Schulsystem, Fachkräftemangel und Verwaltung werden auf Migration verengt.", "Von Schuld zu Struktur wechseln: Welche Verfahren, Mittel und Regeln verbessern den Zustand?"],
    ],
    consequences: [
      "Menschen erscheinen als Kostenstelle, bevor Integrationspfade sichtbar werden.",
      "Politik wird eher auf Abwehr und Symbolik ausgerichtet als auf Sprache, Anerkennung, Arbeit, Wohnen und kommunale Leistungsfähigkeit.",
      "Schlechte Integration wird wahrscheinlicher - und bestätigt später scheinbar den ursprünglichen Kostenframe.",
    ],
    factsLayer: {
      coreFacts: [
        {
          title: "Startaufwand ist real",
          statement: "Aufnahme, Unterbringung, Verwaltung, Sprachkurse, Schule, Kita und Beratung brauchen am Anfang Geld, Personal und Koordination.",
          sourceRefs: ["SVR Jahresgutachten 2024", "BA Migration und Arbeitsmarkt"],
          confidence: "hoch",
          whatItProves: "Kosten und kommunale Belastung dürfen nicht beschönigt werden.",
          whatItDoesNotProve: "Es beweist nicht, dass Migration dauerhaft nur kostet oder dass Menschen als Kostenstelle gelesen werden dürfen.",
        },
        {
          title: "Erwerbsintegration ist ein Zeitpfad",
          statement: "Das IAB berichtet, dass die 2015 zugezogenen Geflüchteten 2024 eine Beschäftigungsquote von 64 Prozent erreichten und sich damit dem Durchschnitt der Gesamtbevölkerung von 70 Prozent deutlich angenähert haben.",
          sourceRefs: ["IAB 10 Jahre Fluchtmigration"],
          confidence: "hoch",
          whatItProves: "Integration kann, wenn sie gelingt, aus anfänglicher Unterstützung Erwerbsarbeit machen.",
          whatItDoesNotProve: "Es beweist nicht, dass jede Gruppe, jeder Ort und jede politische Maßnahme automatisch erfolgreich ist.",
        },
        {
          title: "Indikatoren statt Bauchgefühl",
          statement: "Die BA betont für Migration und Arbeitsmarkt, dass Beschäftigungs-, Arbeitslosen- und SGB-II-Hilfequoten oft aussagekräftiger sind als absolute Zahlen.",
          sourceRefs: ["Bundesagentur für Arbeit"],
          confidence: "hoch",
          whatItProves: "Die Debatte braucht Verhältniswerte, Zeitreihen und Statusgruppen.",
          whatItDoesNotProve: "Eine einzelne Quote ersetzt keine Analyse von Bildung, Herkunft, Aufenthaltsstatus, Region und Arbeitsmarkt.",
        },
        {
          title: "Kommunale Struktur entscheidet",
          statement: "Der SVR beschreibt, dass Kommunen mit aufrechterhaltenen Aufnahme- und Integrationsstrukturen schneller und pragmatischer reagieren konnten.",
          sourceRefs: ["SVR Jahresgutachten 2024"],
          confidence: "hoch",
          whatItProves: "Integration ist auch eine Frage von Infrastruktur, Zuständigkeiten und Finanzierung.",
          whatItDoesNotProve: "Es beweist nicht, dass unbegrenzte Aufnahme ohne Kapazitätsplanung funktioniert.",
        },
        {
          title: "Arbeits- und Fachkräftebedarf gehört in die Rechnung",
          statement: "OECD und SVR verweisen auf Arbeitsmarktintegration und Fachkräfteeinwanderung als zentrale politische Felder in Deutschland.",
          sourceRefs: ["OECD International Migration Outlook 2024", "SVR Jahresgutachten 2024"],
          confidence: "mittel",
          whatItProves: "Migration wirkt nicht nur auf Ausgaben, sondern auch auf Arbeit, Versorgung, Beiträge und Standortfähigkeit.",
          whatItDoesNotProve: "Es beweist nicht, dass jede Form von Migration kurzfristig fiskalisch positiv ist.",
        },
      ],
      accountingBoundaries: [
        {
          label: "Zeit",
          explanation: "Startkosten, Übergangskosten, Erwerbsintegration und langfristige Beiträge getrennt betrachten.",
          whyItMatters: "Ohne Zeitpfad wirkt jeder Anfang wie Dauerzustand.",
        },
        {
          label: "Statusgruppen",
          explanation: "Schutzmigration, Arbeitsmigration, Familiennachzug, EU-Freizügigkeit und lange ansässige Menschen getrennt auswerten.",
          whyItMatters: "Eine Gruppe erklärt nicht die Wirkung aller Gruppen.",
        },
        {
          label: "Alternativen",
          explanation: "Auch die Kosten schlechter Integration und unbesetzter Arbeit mitzählen.",
          whyItMatters: "Nicht-Handeln ist ebenfalls eine Entscheidung mit Folgekosten.",
        },
      ],
      commonMisuse: [
        {
          misuse: "Startkosten werden als dauerhafte Nettobilanz erzählt.",
          correction: "Startaufwand, Integrationspfad und spätere Beiträge trennen.",
        },
        {
          misuse: "Absolute Zahlen werden ohne Quoten und Zeitreihen genutzt.",
          correction: "Beschäftigungs-, Arbeitslosen- und SGB-II-Quoten mit Status und Zeitraum prüfen.",
        },
        {
          misuse: "Kommunale Überlastung wird Menschen zugeschrieben.",
          correction: "Zuständigkeit, Finanzierung, Verfahren und Wohnungsmarkt als Systemfragen behandeln.",
        },
      ],
    },
    consequenceCheck: {
      ifNarrativeWins: [
        { level: "sofort", text: "Menschen werden als Kostenstelle wahrgenommen.", affectedSystems: ["Würde", "Debatte"] },
        { level: "danach", text: "Investitionen in Sprache, Anerkennung, Arbeit und Wohnen wirken politisch weniger plausibel.", affectedSystems: ["Kommunen", "Arbeitsmarkt"] },
        { level: "auf Dauer", text: "Schlechte Integration erzeugt mehr Folgekosten und bestätigt den Frame scheinbar selbst.", affectedSystems: ["Sozialstaat", "Vertrauen"] },
      ],
      ifCorrectlyHandled: [
        { level: "sofort", text: "Startkosten anerkennen und als Integrationsaufgabe statt Gruppenurteil einordnen.", affectedSystems: ["Orientierung", "Fairness"] },
        { level: "danach", text: "Sprache, Verfahren, Anerkennung, Wohnen, Kita und Arbeitsmarktzugang als gemeinsamen Wirkungspfad prüfen.", affectedSystems: ["Kommunen", "Arbeit"] },
        { level: "auf Dauer", text: "Integration an Beschäftigung, Bildung, Beiträgen, Teilhabe und kommunaler Entlastung messen.", affectedSystems: ["Sozialstaat", "Demokratie"] },
      ],
      nonActionCost: "Wenn Integration schlecht organisiert ist, entstehen längere Abhängigkeit, ungenutzte Qualifikation, kommunale Überlastung und mehr Misstrauen.",
      lockInRisk: "Je länger Menschen auf Verfahren, Sprache, Anerkennung, Arbeit oder Wohnen warten, desto teurer und schwieriger wird gelingende Teilhabe.",
      feedbackLoop: "Schlechte Organisation erzeugt schlechte Ergebnisse; schlechte Ergebnisse werden dann als Beweis gegen Migration genutzt.",
    },
    impactMatrix: [
      {
        dimension: "Kommunale Leistungsfähigkeit",
        directEffect: "Unterbringung, Schule, Kita und Verwaltung werden belastet.",
        indirectEffect: "Ohne planbare Finanzierung konkurrieren Aufgaben gegeneinander.",
        longTermEffect: "Stabile Aufnahme- und Integrationsstrukturen senken Reibungskosten.",
        hiddenCost: "Ad-hoc-Krisenmanagement ist teurer als vorbereitete Struktur.",
        solutionLever: "Kommunale Finanzierung, digitale Verfahren und lokale Integrationsketten sichern.",
      },
      {
        dimension: "Arbeitsmarkt",
        directEffect: "Sprache, Anerkennung und Vermittlung entscheiden über Beschäftigung.",
        indirectEffect: "Wartezeiten halten Qualifikation ungenutzt.",
        longTermEffect: "Gelingende Erwerbsintegration stärkt Beiträge, Steuern und Versorgung.",
        hiddenCost: "Fachkräftelücken und unbesetzte Stellen kosten ebenfalls Wohlstand.",
        solutionLever: "Abschlussanerkennung, Qualifizierung, Jobmatching und Betriebssprache beschleunigen.",
      },
      {
        dimension: "Sozialstaat",
        directEffect: "Leistungen sichern den Anfang und können Abhängigkeit verlängern, wenn Übergänge fehlen.",
        indirectEffect: "Transferbezug wird schnell moralisiert statt als Übergangspfad geprüft.",
        longTermEffect: "Arbeit, Bildung und Teilhabe verwandeln Startunterstützung in Beitragsfähigkeit.",
        hiddenCost: "Schlechte Integration kostet länger als frühe Investition in Sprache und Arbeit.",
        solutionLever: "Leistungsbezug, Arbeitsmarktzugang und Qualifizierung gemeinsam steuern.",
      },
      {
        dimension: "Wohnen und Bildung",
        directEffect: "Wohnungsnot, Klassenkapazität und Kita-Plätze werden sichtbar belastet.",
        indirectEffect: "Systemengpässe werden einer Gruppe zugeschrieben.",
        longTermEffect: "Wohnungsbau, Schulkapazität und frühe Bildung wirken für alle.",
        hiddenCost: "Nicht gebaute Infrastruktur trifft Zugewanderte und Einheimische zugleich.",
        solutionLever: "Integration mit Wohnungs-, Bildungs- und Infrastrukturpolitik koppeln.",
      },
      {
        dimension: "Demokratie und Vertrauen",
        directEffect: "Pauschale Kostenframes erzeugen Ärger und Abwertung.",
        indirectEffect: "Sachliche Kritik an Kapazitäten wird mit Menschenabwertung vermischt.",
        longTermEffect: "Faire, datenbasierte Steuerung schützt Zusammenhalt und Handlungsfähigkeit.",
        hiddenCost: "Sündenbockdebatten untergraben Vertrauen in Institutionen und Nachbarschaft.",
        solutionLever: "Kritik präzise machen: Welche Kosten, welcher Zeitraum, welche Zuständigkeit, welche Lösung?",
      },
    ],
    narrativeMechanism: {
      story: "Ein sichtbarer Startaufwand wird zur Erzählung, dass eine ganze Gruppe nur nehme und nichts beitrage.",
      targetEmotion: ["Kostenangst", "Kontrollverlust", "Überforderung", "Ungerechtigkeitsgefühl"],
      hiddenAssumption: "Der Sozialstaat wäre ohne Migration stabil und konfliktfrei.",
      whatGetsHidden: [
        "Fachkräftebedarf und demografischer Druck",
        "Zeitpfad von Sprachlernen, Anerkennung und Erwerbsintegration",
        "kommunale Finanzierung und Zuständigkeiten",
        "Kosten schlechter Integration",
        "Unterschiede zwischen Migrationsformen und Aufenthaltsstatus",
        "Beiträge, Steuern, Arbeit, Versorgung und Nachbarschaft",
      ],
      chainNarrative: [
        "Ein realer Engpass wird gezeigt.",
        "Der Engpass wird einer Gruppe zugeschrieben.",
        "Integration wirkt wie Zusatzlast statt als Lösungspfad.",
        "Investitionen in Sprache, Wohnen und Arbeit verlieren Plausibilität.",
        "Schlechte Ergebnisse bestätigen den Frame scheinbar selbst.",
      ],
      whoBenefitsFromFrame: ["Sündenbockpolitik", "Aufmerksamkeitslogik", "Akteure, die keine Systemlösung liefern müssen"],
      narrativeFamily: ["Sündenbock", "Nullsummenframe", "Startkosten-Frame"],
    },
    psychologicalEffectCheck: [
      {
        simpleName: "Das Sichtbare wirkt wie das Ganze.",
        technicalName: "Salienz-Bias",
        howItFeels: "Unterkunft, Bürgergeld, Schule und Verwaltung sind konkret sichtbar.",
        howItWorks: "Spätere Arbeit, Beiträge und vermiedene Fachkräftelücken sind zeitverzögert und weniger sichtbar.",
        debateEffect: "Startkosten werden zur Gesamtbilanz.",
        howToBypass: "Sichtbares anerkennen und den Zeitpfad öffnen.",
        hostMove: "Ja, der Start kostet. Was passiert nach Sprache, Anerkennung und Arbeit?",
      },
      {
        simpleName: "Einzelfälle werden zum Gruppenbild.",
        technicalName: "Verfügbarkeitsheuristik",
        howItFeels: "Ein auffälliger Fall bleibt hängen und wirkt repräsentativ.",
        howItWorks: "Das Gedächtnis ersetzt Verhältniszahlen durch ein starkes Beispiel.",
        debateEffect: "Aus Prüfung wird Pauschalurteil.",
        howToBypass: "Einzelfall prüfen, Quoten und Zeitreihen danebenstellen.",
        hostMove: "Lass uns den Fall prüfen - und zusätzlich fragen, was die Daten insgesamt zeigen.",
      },
      {
        simpleName: "Eine Gruppe trägt die Systemlast.",
        technicalName: "Sündenbockmechanismus",
        howItFeels: "Komplexe Probleme bekommen einen eindeutigen Schuldigen.",
        howItWorks: "Wohnungsnot, Verwaltung, Schule und Arbeit werden nicht als Systemengpässe gelesen.",
        debateEffect: "Lösungen werden durch Abwehr ersetzt.",
        howToBypass: "Verantwortung auf Strukturen zurückführen.",
        hostMove: "Welche Zuständigkeit, welches Verfahren und welche Investition verbessert den Zustand?",
      },
    ],
    solutionPath: {
      plainLanguageSummary: "Integration wird wirksam, wenn der Weg von Ankommen zu Sprache, Schule, Arbeit, Wohnen, Sicherheit und Teilhabe kurz und überprüfbar wird.",
      levers: [
        {
          title: "Kommunale Integrationsketten",
          whatToDo: "Unterbringung, Anmeldung, Schule, Kita, Sprache, Beratung und Arbeit lokal als durchgehende Kette organisieren.",
          whyItWorks: "Menschen verlieren weniger Zeit in Zuständigkeitslücken.",
          systemEffect: "Kommunen werden planbarer, Integration wird früher messbar.",
          indicators: ["Bearbeitungszeit", "Sprachkursstart", "Schul-/Kita-Zugang", "Wohnstabilität"],
        },
        {
          title: "Sprache und Arbeit verbinden",
          whatToDo: "Sprachkurse, Berufsorientierung, Betriebssprache und Qualifizierung früh koppeln.",
          whyItWorks: "Sprache wird schneller alltags- und arbeitsfähig.",
          systemEffect: "Aus Wartezeit wird Erwerbs- und Ausbildungsfähigkeit.",
          indicators: ["Sprachabschluss", "Beschäftigungsquote", "Ausbildungsaufnahme", "Jobmatching"],
        },
        {
          title: "Anerkennung beschleunigen",
          whatToDo: "Qualifikationen schneller prüfen und Brückenqualifikationen anbieten.",
          whyItWorks: "Vorhandene Fähigkeiten bleiben nicht ungenutzt.",
          systemEffect: "Pflege, Handwerk, Bildung und Dienstleistungen gewinnen schneller Personal.",
          indicators: ["Anerkennungsdauer", "Nachqualifizierung", "Beschäftigung im erlernten Beruf"],
        },
        {
          title: "Daten statt Pauschalurteil",
          whatToDo: "Kosten, Beschäftigung, Arbeitslosigkeit, SGB-II-Quote, Bildung und kommunale Kapazitäten getrennt veröffentlichen.",
          whyItWorks: "Die Debatte wird prüfbar und weniger anfällig für Einzelfallframes.",
          systemEffect: "Politische Verantwortung wird sichtbar: Bund, Land, Kommune, Arbeitsmarkt, Bildungssystem.",
          indicators: ["Beschäftigungsquote", "SGB-II-Quote", "Kommunalkosten", "Integrationskursabschluss"],
        },
      ],
      woekConnection: {
        principle: "Startkosten sind nicht die ganze Wirkung.",
        explanation: "Wirkungsökonomisch zählt nicht, ob ein Posten am Anfang Geld kostet, sondern welcher Zustand durch gute Organisation später entsteht: Arbeit, Versorgung, Sicherheit, Teilhabe und Vertrauen.",
        internalLinks: ["/begriffe/integration-als-infrastruktur/", "/begriffe/sozialstaats-suendenbock/", "/wirkungsradar/narrative/suendenbock/"],
      },
    },
    sicher: [
      "Startkosten und kommunale Belastung sind real.",
      "Erwerbsintegration ist zeitabhängig und wird durch Institutionen, Sprache, Anerkennung und Arbeitsmarktzugang beeinflusst.",
      "Pauschale absolute Zahlen sind ohne Quoten, Gruppen und Zeiträume wenig aussagekräftig.",
    ],
    pruefen: [
      "Konkrete lokale Kosten, Wohnraumlage, Schulkapazität, Aufenthaltsstatus, Bildungsstand und Arbeitsmarktlage müssen fallbezogen geprüft werden.",
      "Fiskalische Gesamtrechnungen hängen stark von Annahmen zu Qualifikation, Beschäftigung, Alter, Familienstruktur und Integrationsdauer ab.",
    ],
    bilanzgrenze: "Startkosten, kommunale Kapazität, Statusgruppen, Zeitpfad, Erwerbsintegration, Beiträge, Fachkräftebedarf, Bildung, Wohnen, Sicherheit und Kosten schlechter Integration.",
    gegenposition: "Kritik ist legitim, wenn sie konkret fragt: Welche Kosten, welche Zuständigkeit, welcher Zeitraum, welche Gruppe, welche Lösung und welche Wirkung?",
    sources: [
      {
        label: "IAB: 10 Jahre Fluchtmigration",
        url: "https://iab.de/presseinfo/10-jahre-fluchtmigration-beschaeftigungsquote-von-gefluechteten-naehert-sich-dem-durchschnitt-in-deutschland-an/",
        useFor: ["Beschäftigungsquote 2015 Zugezogene", "Zeitpfad Erwerbsintegration"],
        warning: "Bezieht sich auf die untersuchte Geflüchtetenkohorte und ist nicht pauschal auf alle Migrationsformen übertragbar.",
      },
      {
        label: "Bundesagentur für Arbeit: Migration und Arbeitsmarkt",
        url: "https://statistik.arbeitsagentur.de/DE/Navigation/Statistiken/Interaktive-Statistiken/Migration-Zuwanderung-Flucht/Migration-Zuwanderung-Flucht-Nav.html",
        useFor: ["Beschäftigungs-, Arbeitslosen- und SGB-II-Quoten", "Indikatorenlogik"],
        warning: "Zeitreihen, Statusgruppen und Definitionsgrenzen beachten.",
      },
      {
        label: "SVR Jahresgutachten 2024",
        url: "https://www.svr-migration.de/publikationen/jahresgutachten/2024/",
        useFor: ["Kommunale Aufnahmestrukturen", "Integration und Teilhabe", "Handlungsempfehlungen"],
        warning: "Politische Empfehlungen sind ein fachlicher Bewertungsrahmen, keine automatische Entscheidung.",
      },
      {
        label: "OECD International Migration Outlook 2024: Germany",
        url: "https://www.oecd.org/en/publications/international-migration-outlook-2024_50b0353e-en/full-report/germany_1c19b40c",
        useFor: ["Arbeitsmigration", "Integrations- und Rechtsentwicklung", "internationaler Kontext"],
        warning: "OECD-Daten müssen mit nationalen Detaildaten abgeglichen werden.",
      },
    ],
    internalLinks: {
      glossary: ["/begriffe/integration-als-infrastruktur/", "/begriffe/sozialstaats-suendenbock/", "/begriffe/arbeitsanreiz/"],
      narratives: ["/wirkungsradar/narrative/suendenbock/", "/wirkungsradar/narrative/ohnmacht/"],
      relatedDossiers: ["/wirkungsradar/live/nie-eingezahlt/", "/wirkungsradar/live/auslaender-pluendern-sozialstaat/", "/wirkungsradar/live/fachkraeftemangel-ohne-zuwanderung/"],
      woek: ["/so-wirkt-wirkungsoekonomie/", "/wirkungsradar/psychologie/"],
    },
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
    title: "Windräder zerstören Natur?",
    claim: "Windräder zerstören Natur.",
    topicCluster: ["Energie", "Windkraft", "Naturschutz"],
    shortJudgement: "Echte Pruefpflicht. Falsches Gesamturteil.",
    sayThisNow: "Gute Windkraft beginnt mit Planung: passende Standorte, Artenschutz, Abschaltungen, Rueckbau, Recycling und Beteiligung.",
    positiveExampleTitle: "Der gut geplante Buergerwindpark",
    positiveExampleText: "Eine Gemeinde sucht eine geeignete Fläche. Arten werden vorher kartiert. Bei Fledermausflug wird abgeschaltet. Für den Rückbau liegt Geld zurück. Einnahmen fließen in Schule, Feuerwehr oder Bus.",
    whatGetsBetter: ["Artenschutz", "Rueckbau", "Recycling", "Gemeinde"],
    hostLine: "Gute Windkraft heißt: planen, schützen, beteiligen, zurückbauen.",
    betterQuestion: "Welche Energieform schuetzt Natur, Klima, Gesundheit und Versorgung insgesamt am besten?",
    oldFrame: "Windrad gegen Natur.",
    solution: "Standorte, Artenschutz, Materialkreislauf, Rueckbaupflicht und fossile Alternative gemeinsam bewerten.",
    simpleMechanism: "Sichtbare Eingriffe werden zum Gesamturteil, waehrend fossile Schaeden, Klima und Gesundheit ausgeblendet werden. Direkt erzeugter Windstrom muss gegen reale Alternativen verglichen werden.",
  }),
  makeDossier("fusion-loest-das-energieproblem", {
    title: "Fusion löst das Energieproblem?",
    claim: "Fusion löst bald das Energieproblem.",
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
    sayThisNow: "Das E-Auto ist nicht wirkungsfrei. Aber es trennt Mobilität Schritt für Schritt von dauerndem Verbrennen, Ölimporten und lokalen Abgasen.",
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
    sayThisNow: "E-Fuels sind wichtig für Flugzeuge, Schiffe und Spezialfälle. Für Alltagsautos ist direkter Strom meist der bessere Weg.",
    positiveExampleTitle: "Direkt laden, Molekuele sparen",
    positiveExampleText: "Das Stadtauto laedt direkt. Der Lkw laedt im Depot. Knappes E-Kerosin geht in Flugzeuge, die nicht einfach mit grossen Akkus fliegen koennen. So wirkt dieselbe Energie dort, wo sie am meisten hilft.",
    whatGetsBetter: ["Direktstrom", "Flugverkehr", "Knappheit", "Prioritaet"],
    hostLine: "Direkt laden, wo es geht. Molekuele sparen, wo sie gebraucht werden.",
    betterQuestion: "Fuer welchen Einsatz meinst du E-Fuels: Flugzeug, Schiff, Spezialfall - oder Alltagsauto?",
    oldFrame: "E-Fuels als Verbrenner-Rettung.",
    solution: "Synthetische Moleküle für schwer elektrifizierbare Anwendungen priorisieren, Alltagsmobilität direkt elektrifizieren.",
    simpleMechanism: "E-Fuels brauchen Strom, Wasserstoff, CO₂, Synthese und Verbrennung. Der direkte Strompfad ist für Pkw meist deutlich wirksamer; Moleküle bleiben eher Reserve, Spezialfall und Zeitpfad für schwer elektrifizierbare Anwendungen.",
  }),
  makeDossier("wasserstoff-fuer-alles", {
    title: "Wasserstoff für alles?",
    claim: "Wir machen das einfach mit Wasserstoff.",
    topicCluster: ["Wasserstoff", "Energie", "Industrie"],
    shortJudgement: "Wertvoll. Deshalb nicht ueberall.",
    sayThisNow: "Wasserstoff ist wichtig. Aber er gehoert zuerst dahin, wo Strom direkt schwer reicht: Stahl, Chemie, Schiffe, Flugzeuge und Langzeitspeicher.",
    positiveExampleTitle: "Der gruene Stahl",
    positiveExampleText: "Ein Stahlwerk ersetzt Kohle durch grünen Wasserstoff. Der Wasserstoff geht nicht in jede Heizung, sondern dorthin, wo Strom allein schwer reicht. Aus dem Stahl werden Brücken, Züge, Windräder und Gebäude.",
    whatGetsBetter: ["Stahl", "Molekuele", "Prioritaet", "Resilienz"],
    hostLine: "Wasserstoff ist zu wertvoll für alles. Er gehört zuerst dorthin, wo er wirklich gebraucht wird.",
    betterQuestion: "Wo brauchen wir Wasserstoff wirklich - und wo geht Strom direkter?",
    oldFrame: "Wasserstoff loest alles.",
    solution: "Direktstrom zuerst, Wasserstoff für Industrie, Moleküle, Langzeitspeicher und seltene Reserve priorisieren.",
    simpleMechanism: "Grüner Wasserstoff wird aus Strom hergestellt. Jede Umwandlung kostet Energie. Reserve und Dauerbetrieb müssen getrennt werden.",
  }),
  makeDossier("arbeit-lohnt-sich-nicht-mehr", {
    title: "Arbeit lohnt sich nicht mehr?",
    claim: "Arbeit lohnt sich nicht mehr.",
    topicCluster: ["Arbeit", "Sozialstaat", "Teilhabe"],
    shortJudgement: "Echter Arbeitsfrust. Falscher Schuldiger.",
    sayThisNow: "Arbeit muss spürbar tragen. Dafür müssen Lohn, Miete, Betreuung, Qualifikation und Übergänge zusammenpassen.",
    positiveExampleTitle: "Mehr Stunden, mehr Sicherheit",
    positiveExampleText: "Eine alleinerziehende Mutter arbeitet mehr. Die Kita ist verlässlich. Der Bus ist bezahlbar. Leistungen fallen nicht abrupt weg. Am Monatsende bleibt spürbar mehr übrig.",
    whatGetsBetter: ["Lohn", "Betreuung", "Mobilitaet", "Sicherheit"],
    hostLine: "Arbeit lohnt sich, wenn mehr Arbeit auch mehr Sicherheit bringt.",
    betterQuestion: "Was muss sich aendern, damit Arbeit wirklich mehr Sicherheit und Teilhabe schafft?",
    oldFrame: "Menschen im Sozialstaat sind der Schuldige.",
    solution: "Lohn, Wohnen, Betreuung, Qualifikation, Mobilitaet und Transferuebergaenge zusammen verbessern.",
    simpleMechanism: "Realer Frust wird auf Menschen projiziert. Die bessere Rechnung zeigt Barrieren und Hebel, die Arbeit tragfähig machen.",
    avoidFrameTerms: ["faul", "Kosten", "Last"],
  }),
  makeDossier("co2-preis-oder-fossile-systemkosten", {
    title: "CO₂-Preis oder fossile Systemkosten?",
    claim: "Der CO₂-Preis ist Abzocke.",
    topicCluster: ["Klima", "Geld", "Steuern"],
    shortJudgement: "Sichtbare Steuerung statt versteckte Schaeden.",
    sayThisNow: "Der CO₂-Preis ist nicht das Ziel. Er macht fossile Folgekosten sichtbar und kann Geld so zurückgeben, dass saubere Lösungen leichter werden.",
    positiveExampleTitle: "Das Geld, das zurückarbeitet",
    positiveExampleText: "Ein CO₂-Preis macht fossile Kosten sichtbar. Das Geld fließt als Klimageld, Gebäudeförderung, besserer Bus oder günstigere Stromkosten zurück. So wird der Umbau leichter.",
    whatGetsBetter: ["Klimageld", "Bus", "Gebaeude", "Lenkung"],
    hostLine: "Der CO₂-Preis ist nicht die Strafe. Er ist die Rückführung versteckter Folgekosten.",
    betterQuestion: "Zahlen wir fossile Kosten unsichtbar als Schaden - oder sichtbar und lenkend als Umbau?",
    oldFrame: "CO₂-Preis als reine Abzocke.",
    solution: "Fossile Folgekosten sichtbar machen und Einnahmen sozial, wirksam und transparent zurückführen.",
    simpleMechanism: "Unsichtbare Schaeden werden nicht als Preis erlebt. Sichtbare Lenkung wirkt nur fair, wenn Rueckgabe und Alternativen mitgebaut werden.",
  }),
  makeDossier("kernenergie-wieder-in-deutschland", {
    title: "Kernenergie wieder in Deutschland?",
    claim: "Kernkraft ist die einfache Lösung.",
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
    title: "Radwege in Peru - verschenktes Geld oder verkürzte Empörung?",
    claim: "Für Radwege in Peru ist Geld da, aber für Deutschland nicht.",
    topicCluster: ["Steuergeld", "Globale Verantwortung", "Mobilität"],
    shortJudgement: "Verkürzte Empörung statt Wirkungsprüfung.",
    sayThisNow: "Die Behauptung ist verkürzt. Ein Teil sind Zuschüsse, vieles läuft über Kredite. Entscheidend sind Wirkung, Rückzahlung, Kontrolle und Nutzen für Menschen dort und auch für Deutschland.",
    positiveExampleTitle: "Der sichere Weg zur Metro",
    positiveExampleText: "Eine Schülerin fährt sicher zur Metro. Die Familie spart Fahrgeld. Der Radweg ist Zubringer zu Bus, Metro, Schule, Ausbildung und Arbeit. Wenn Nutzung, Vergabe und Baufortschritt stimmen, wird Mobilität sicherer, günstiger und sauberer.",
    whatGetsBetter: ["Schulweg", "Metro", "Sicherheit", "Teilhabe", "Stau", "Luft"],
    hostLine: "Ein guter Radweg ist nicht nur Asphalt. Er verbindet Schule, Arbeit, Metro, Gesundheit und Teilhabe.",
    betterQuestion: "Welche Finanzierungsform, welche Wirkung, welche Rückzahlung, welcher Nutzen und welche Risiken liegen tatsächlich vor?",
    oldFrame: "Ausland gegen Inland.",
    solution: "Zuschuss, Kredit, Rückzahlung, Kontrolle, Wirkung und deutsche Interessen transparent auseinanderhalten.",
    simpleMechanism: "Ein Spottbild ersetzt die Wirkungsprüfung. Die bessere Rechnung trennt Zuschuss, Kredit, Rückzahlung, Metro, Bus, Radweg, Mobilitätsnutzen, Kontrolle, Klimawirkung und deutschen Nutzen.",
    responses: {
      comment: {
        text: "Die Rechnung ist verkürzt. Ein Teil sind Zuschüsse, vieles läuft über Kredite. Entscheidend ist die Frage nach Wirkung, Rückzahlung, Kontrolle und deutschem Nutzen.",
      },
      live: {
        text: "Der wahre Punkt ist: Öffentliches Geld muss geprüft werden. Der Denkfehler ist, Zuschüsse, Kredite, Metro, Bus und Radwege als ein einziges Geldgeschenk zu erzählen. Seriös ist die Trennung: Was ist Zuschuss, was Kredit, was wird zurückgezahlt, was bewirkt es, wer kontrolliert es und welchen Nutzen hat es auch für Deutschland?",
      },
      panel: {
        text: "Das Radwege-in-Peru-Narrativ funktioniert, weil es aus einem komplexen Finanzierungs- und Mobilitätsprogramm ein Spottbild macht: dort Radwege, hier Probleme. Der wahre Kern ist: Öffentliche Mittel müssen begründet, kontrolliert und wirksam eingesetzt werden. Der falsche Sprung ist: Alles werde verschenkt und Deutschland habe nichts davon. Man muss Finanzierung, Projekt und Wirkung trennen: Zuschüsse sind nicht rückzahlbar; Entwicklungskredite und Förderkredite müssen anders bewertet werden. Es geht nicht nur um Radwege, sondern um nachhaltige Stadtmobilität mit Metro, Bus, ÖPNV-Organisation und sicheren Zubringern. Wirkungsökonomisch zählt: Kommen Menschen sicherer zu Schule, Arbeit, Markt und Metro? Sinken Stau, Luftbelastung und CO₂? Welche deutschen Interessen entstehen durch Klima, Partnerschaft, Standards und Unternehmensaufträge? Und welche Risiken bleiben bei Nutzung, Vergabe, Korruptionsschutz und Evaluation? Die bessere Frage lautet: Welche Finanzierungsform, welche Wirkung, welche Rückzahlung, welcher Nutzen und welche Risiken liegen tatsächlich vor?",
      },
      calmCounter: {
        text: "Ich verstehe den Reflex: Wenn hier Brücken, Schulen oder Bahnen fehlen, wirkt ein Radweg in Peru absurd. Genau deshalb sollten wir sauber prüfen: Was ist Zuschuss, was Kredit, was wird zurückgezahlt, was bewirkt es, wer kontrolliert es und welchen Nutzen hat es auch für Deutschland?",
      },
    },
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
