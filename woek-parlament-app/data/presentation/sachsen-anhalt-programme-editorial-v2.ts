export type ProgrammeDirection = "POSITIVE" | "NEGATIVE" | "AMBIVALENT" | "OPEN";
export type ProgrammeEvidence = "HIGH" | "MEDIUM" | "LOW" | "NOT_ASSESSABLE";
export type ProgrammeFindingKind = "positive" | "risk" | "tradeoff" | "open";

export type ProgrammeEditorialFinding = {
  kind: ProgrammeFindingKind;
  label: string;
  text: string;
};

export type CommitmentEditorialAssessment = {
  direction: ProgrammeDirection;
  evidence: ProgrammeEvidence;
  keyFinding: string;
  impactCoreSummary: string;
  editorialSummary: string;
  directionRationale: string;
  competenceNote?: string;
  sourceQuality?: "PASS" | "SOURCE_COLLISION" | "REVIEW_REQUIRED";
};

export type ProgrammeEditorial = {
  sourceKey: string;
  version: "2.0";
  overallLabel: string;
  overallCharacter: "NO_SINGLE_DIRECTION" | "AMBIVALENT" | "OPEN";
  impactCoreSummary: string;
  editorialSummary: string;
  keyFindings: ProgrammeEditorialFinding[];
  readingGuide: string;
  centralAssessments: Record<string, CommitmentEditorialAssessment>;
};

export const saxonyAnhaltProgrammeEditorialV2: Record<string, ProgrammeEditorial> = {
  "ltw-2026-st-cdu": {
    sourceKey: "ltw-2026-st-cdu",
    version: "2.0",
    overallLabel: "Staatliche Handlungsfähigkeit mit deutlichen Freiheits-, Kompetenz- und Ausgestaltungsfragen",
    overallCharacter: "NO_SINGLE_DIRECTION",
    impactCoreSummary: "In den zentral markierten Pfaden verbindet das CDU-Programm den Ausbau staatlicher Sicherheits- und Katastrophenschutzkapazitäten mit Investitions- und Wachstumszielen sowie einer restriktiveren Migrationspolitik. Das stärkste unmittelbar landespolitische positive Potenzial liegt bei belastbarer öffentlicher Infrastruktur und Einsatzfähigkeit; die größten Zielkonflikte entstehen dort, wo zusätzliche Eingriffsbefugnisse, Grundrechte oder Bundeskompetenzen berührt werden.",
    editorialSummary: "Der Fachstand erlaubt keine seriöse Gesamtnote für ein breites Wahlprogramm. Bei konkreten landeseigenen Kapazitätsinvestitionen - etwa im Brand- und Katastrophenschutz - ist ein positives Resilienzpotenzial plausibel. Sicherheits- und Rückführungsforderungen müssen dagegen strikt zwischen möglichem Sicherheits- oder Vollzugsnutzen, Verhältnismäßigkeit, Freiheitsrechten und tatsächlicher Zuständigkeit getrennt werden. Allgemeine Wachstumsversprechen bleiben ohne Instrument, Finanzierung und Gegenfaktum wirkungsökonomisch offen.",
    keyFindings: [
      { kind: "positive", label: "Resilienzhebel", text: "Investitionen in Ausbildung, Übungsinfrastruktur und Katastrophenschutz können die reale Reaktionsfähigkeit des Landes erhöhen, wenn Kapazitätsbedarf und Nutzung belegt sind." },
      { kind: "tradeoff", label: "Sicherheit ist kein Einzelscore", text: "Mehr Personal und Befugnisse können Prävention und Aufklärung stärken, zugleich aber Freiheits-, Datenschutz- und Diskriminierungsrisiken erhöhen." },
      { kind: "open", label: "Wachstum braucht Instrumente", text: "Vertrauen, Investitionen und Wachstum sind Zielzustände. Ohne konkrete Regel-, Finanzierungs- oder Infrastrukturhebel ist die Wirkungsrichtung nicht belastbar zu bestimmen." },
      { kind: "risk", label: "Bundeskompetenz sichtbar machen", text: "Rückführungs- und migrationsrechtliche Forderungen können nicht als reine Landesmaßnahme gelesen werden; tatsächlicher Landeshebel und Bundesrecht müssen getrennt bleiben." }
    ],
    readingGuide: "Die programmweite Einordnung verdichtet nur fachlich belastbare Muster. Eine positive oder negative Richtung wird ausschließlich dort gezeigt, wo der konkrete Wirkpfad sie trägt.",
    centralAssessments: {
      "ltw-2026-st-cdu-0018-das-institut-fuer-brand-und-katastrophenschutz-in-heyroths": {
        direction: "POSITIVE", evidence: "MEDIUM", keyFinding: "HOHES RESILIENZPOTENZIAL",
        impactCoreSummary: "Der Ausbau des IBK Heyrothsberge kann Ausbildungskapazität, Übungsrealität und Einsatzbereitschaft im Brand-, Zivil- und Katastrophenschutz verbessern; positiv wird der Pfad, wenn die Investitionen nachweislich Engpässe beheben und dauerhaft genutzt werden.",
        editorialSummary: "Mehr Lehrgänge, digitale Formate und moderne Übungsinfrastruktur adressieren einen konkreten staatlichen Fähigkeitshebel. Dem stehen Bau-, Betriebs- und Opportunitätskosten gegenüber; ein großer Mitteleinsatz ist nur dann wirkungsökonomisch überzeugend, wenn Kapazitätsbedarf, Auslastung und Qualitätsgewinne belegt werden. Der alte Release-1-Wirkpfad ordnete diesen Gegenstand fälschlich als allgemeinen Bildungspfad ein und wird deshalb nicht mehr als Kurzbewertung verwendet.",
        directionRationale: "Der Mechanismus liegt unmittelbar zwischen Ausbildungskapazität und Einsatzfähigkeit; die Hauptrisiken betreffen Wirtschaftlichkeit und Überdimensionierung, nicht die Grundrichtung des Resilienzhebels.",
        sourceQuality: "REVIEW_REQUIRED"
      },
      "ltw-2026-st-cdu-0026-darauf-muessen-und-wollen-wir-staerker-setzen-auf-eine-pol": {
        direction: "OPEN", evidence: "LOW", keyFinding: "INSTRUMENT OFFEN",
        impactCoreSummary: "Die Aussage zu Vertrauen, Investitionen und Wachstum benennt gewünschte Zielzustände, aber noch keinen hinreichend konkreten politischen Hebel; eine Wirkungsrichtung wäre ohne Instrument und Finanzierung spekulativ.",
        editorialSummary: "Verlässliche Regeln, Infrastruktur oder Finanzierung können Investitionsentscheidungen verbessern. Die Programmpassage legt jedoch nicht fest, welches Instrument verändert werden soll und welche Kosten oder Verteilungsfolgen entstehen. Deshalb wird weder ein positiver noch ein negativer Effekt vorweggenommen.",
        directionRationale: "Zielrichtung allein ist kein Wirkungsnachweis; Mechanismus, Additionalität und Gegenfaktum fehlen."
      },
      "ltw-2026-st-cdu-0001-spuerbare-sicherheit-sicherheit-gewaehrleisten-durch-eine": {
        direction: "AMBIVALENT", evidence: "MEDIUM", keyFinding: "SICHERHEITSNUTZEN VS. FREIHEITSRECHTE",
        impactCoreSummary: "Mehr Polizeipersonal kann Präsenz, Reaktionsfähigkeit und Ermittlungsleistung stärken; weitergehende Befugnisse können zugleich Freiheits-, Datenschutz- und Gleichheitsrechte belasten, sodass Personalaufwuchs und Eingriffserweiterung getrennt bewertet werden müssen.",
        editorialSummary: "Der Personalpfad besitzt ein plausibles positives Kapazitätspotenzial, wenn Stellen tatsächlich besetzt, sinnvoll eingesetzt und an messbaren Sicherheitszielen ausgerichtet werden. Neue Befugnisse benötigen dagegen eine eigenständige Verhältnismäßigkeits- und Rechtsschutzprüfung. Eine gemeinsame positive Gesamtbewertung beider Instrumente wäre fachlich falsch.",
        directionRationale: "Kapazitätsgewinn und Eingriffsrisiko wirken gleichzeitig und betreffen unterschiedliche Schutzgüter."
      },
      "ltw-2026-st-cdu-0014-zugleich-setzen-wir-uns-auf-bundesebene-fuer-die-schnelle": {
        direction: "AMBIVALENT", evidence: "LOW", keyFinding: "BUNDESRECHT UND GRUNDRECHT ENTSCHEIDEND",
        impactCoreSummary: "Schnellere rechtmäßige Rückführungsverfahren können Vollzugsdauer und Verwaltungslasten senken, können bei pauschaler Beschleunigung oder unzureichender Einzelfallprüfung aber Schutz-, Rechtsbehelfs- und Menschenrechtsrisiken erhöhen.",
        editorialSummary: "Die Passage zielt ausdrücklich auf einen Bundespfad und ist keine unmittelbar umsetzbare Landesentscheidung. Wirkungsökonomisch entscheidend sind Verfahrensqualität, tatsächliche Vollziehbarkeit, Kosten, Rückkehrbedingungen und Rechtsschutz - nicht die Zahl der Rückführungen allein. Ohne konkrete bundesrechtliche Ausgestaltung bleibt die Evidenz niedrig.",
        directionRationale: "Ein möglicher Vollzugsnutzen steht materiellen Schutz- und Rechtsrisiken gegenüber; der Landeshebel ist begrenzt.",
        competenceNote: "Bundesrecht beziehungsweise Bundesrats-/Bundespfad erforderlich."
      }
    }
  },
  "ltw-2026-st-spd": {
    sourceKey: "ltw-2026-st-spd",
    version: "2.0",
    overallLabel: "Teilhabe- und Transformationspotenzial - Additionalität und Umsetzung entscheiden",
    overallCharacter: "NO_SINGLE_DIRECTION",
    impactCoreSummary: "Die zentral markierten SPD-Pfade setzen auf Beschäftigungsfähigkeit, Ausbildungszugang, Kreislaufwirtschaft und regionale Strukturentwicklung. Das Wirkungspotenzial ist überwiegend positiv, wenn Förderung zusätzliche reale Teilhabe, Ressourcenschonung und Wertschöpfung erzeugt statt bestehende Aktivitäten lediglich zu finanzieren.",
    editorialSummary: "Mehr Zugang zu Ausbildung und altersgerechter Arbeit adressiert konkrete Teilhabe- und Fachkräfteprobleme. Repair-Cafés können Nutzungsdauern verlängern und lokale Reparaturkompetenz stärken, bleiben aber im Systemmaßstab nur dann relevant, wenn Reichweite und Zusätzlichkeit sichtbar werden. Strukturförderprogramme wie Revier Pionier benötigen klare Auswahlkriterien, Folgewirkungsmessung und einen Nachweis, dass öffentliche Mittel dauerhaft tragfähige lokale Kapazitäten erzeugen.",
    keyFindings: [
      { kind: "positive", label: "Teilhabe als früher Hebel", text: "Ausbildungszugang und Beschäftigungsfähigkeit wirken vor späteren Sozial- und Fachkräftekosten und besitzen deshalb hohes präventives Potenzial." },
      { kind: "positive", label: "Kreislauf lokal stärken", text: "Reparaturförderung kann Produktlebensdauer und Reparaturkompetenz erhöhen, wenn tatsächliche Reparaturen und vermiedene Neuanschaffungen messbar werden." },
      { kind: "tradeoff", label: "Förderung braucht Additionalität", text: "Öffentliche Finanzierung ist kein Wirkungsnachweis. Entscheidend ist, was zusätzlich entsteht und nach Förderende bestehen bleibt." },
      { kind: "open", label: "Regionale Wirkung messen", text: "Strukturwandelprogramme sollten Beschäftigung, Gründungen, lokale Wertschöpfung, Flächen- und Klimaeffekte gemeinsam beobachten." }
    ],
    readingGuide: "Positive Potenziale werden nicht mit Mittelabfluss verwechselt. Förderprogramme werden an zusätzlicher Zustandsveränderung, Verteilung und Dauerhaftigkeit gemessen.",
    centralAssessments: {
      "ltw-2026-st-spd-0016-wir-foerdern-gezielte-massnahmen-zum-erhalt-der-beschaefti": {
        direction: "POSITIVE", evidence: "MEDIUM", keyFinding: "PRÄVENTIVES BESCHÄFTIGUNGSPOTENZIAL",
        impactCoreSummary: "Gesundheitsförderung, altersgerechte Arbeitsplätze und flexible Arbeitszeitmodelle können Erwerbsfähigkeit, Einkommen und Fachkräftebindung älterer Beschäftigter verbessern, wenn Angebote tatsächlich zugänglich und arbeitsplatznah umgesetzt werden.",
        editorialSummary: "Der Pfad setzt vor Erwerbsaustritt, Krankheit und Einkommensverlust an und ist damit ursachennäher als spätere Kompensation. Wichtig sind betriebliche Reichweite, Qualität und eine faire Verteilung zwischen Branchen und Geschlechtern. Mitnahmeeffekte und rein formale Programme müssen über Outcome-Daten ausgeschlossen werden.",
        directionRationale: "Der vorgesehene Mechanismus adressiert Gesundheit und Arbeitsgestaltung direkt und besitzt bei wirksamer Umsetzung ein plausibles positives Netto-Potenzial."
      },
      "ltw-2026-st-spd-0005-repair-caf-s-werden-wir-weiterhin-finanziell-unterstuetzen": {
        direction: "POSITIVE", evidence: "MEDIUM", keyFinding: "KREISLAUFPOTENZIAL MIT REICHWEITENGRENZE",
        impactCoreSummary: "Die Unterstützung von Repair-Cafés kann Reparaturen erleichtern, Produktlebensdauern verlängern und lokale Reparaturkompetenz stärken; die gesamtwirtschaftliche Wirkung hängt von Reichweite, zusätzlich vermiedenen Neuanschaffungen und dauerhafter Infrastruktur ab.",
        editorialSummary: "Der Mechanismus ist konkret und ressourcenbezogen plausibel. Eine kleine Förderung kann lokal hohe soziale und Bildungswirkung haben, darf aber nicht mit einer flächendeckenden Kreislaufwirtschaftswirkung verwechselt werden. Messbar sein sollten Reparaturfälle, Nutzungsverlängerung, Teilnehmendenstruktur und zusätzliche Reparaturkapazität.",
        directionRationale: "Reparatur ersetzt bei erfolgreicher Umsetzung Ressourcenverbrauch; materielle Gegenwirkungen sind begrenzt, Reichweite und Additionalität bleiben entscheidend."
      },
      "ltw-2026-st-spd-0014-auch-jugendliche-ohne-schulabschluss-und-mit-gebrochenen-b": {
        direction: "POSITIVE", evidence: "MEDIUM", keyFinding: "TEILHABE- UND FACHKRÄFTEHEBEL",
        impactCoreSummary: "Ein verbesserter Ausbildungszugang für Jugendliche ohne Abschluss oder mit unterbrochenen Bildungswegen kann Erwerbschancen, Einkommen, soziale Teilhabe und Fachkräfteverfügbarkeit erhöhen, wenn Betriebe und Unterstützungsstrukturen reale Übergänge ermöglichen.",
        editorialSummary: "Der positive Pfad entsteht nicht durch die Zusage eines Zugangs allein, sondern durch tatsächliche Ausbildungsplätze, Begleitung und erfolgreiche Abschlüsse. Betriebe dürfen nicht mit Unterstützungsaufgaben allein gelassen werden; zugleich müssen Qualitätsstandards bestehen bleiben. Relevant sind Übergangs-, Abbruch- und Abschlussquoten sowie spätere Beschäftigung.",
        directionRationale: "Der Ansatz reduziert eine konkrete Zugangshürde und kann langfristige Exklusionskosten vermeiden."
      },
      "ltw-2026-st-spd-0011-projekte-wie-revier-pionier-wollen-wir-deswegen-in-der-kom": {
        direction: "POSITIVE", evidence: "LOW", keyFinding: "REGIONALE ADDITIONALITÄT MUSS BELEGT WERDEN",
        impactCoreSummary: "Die Verstetigung regionaler Strukturwandelprojekte kann lokale Innovations-, Beteiligungs- und Wertschöpfungskapazität stabilisieren; positiv ist der Pfad nur, wenn geförderte Vorhaben zusätzliche dauerhafte Ergebnisse erzeugen.",
        editorialSummary: "Kontinuität kann Projektabbrüche und Wissensverlust vermeiden. Gleichzeitig drohen Förderpfadabhängigkeit, Mitnahmeeffekte und kleinteilige Projekte ohne strukturelle Wirkung. Vor einer Verstetigung sollten Zielgruppen, Auswahlkriterien, Anschlussfinanzierung und beobachtbare regionale Outcomes transparent sein.",
        directionRationale: "Der Mechanismus ist plausibel, aber der konkrete Zusatznutzen des Programms ist aus der Programmaussage allein nicht belegt."
      }
    }
  },
  "ltw-2026-st-gruene": {
    sourceKey: "ltw-2026-st-gruene",
    version: "2.0",
    overallLabel: "Hohes Natur- und Resilienzpotenzial - Nutzungskonflikte und Vollzug bleiben materiell",
    overallCharacter: "NO_SINGLE_DIRECTION",
    impactCoreSummary: "Die zentral markierten grünen Pfade adressieren Biodiversität, Waldbrandresilienz, ökologischen Landbau und wissenschaftsbasiertes Wolfsmanagement. Sie besitzen relevantes positives Natur- und Resilienzpotenzial, wenn Schutz, Nutzung, Landwirtschaft und Infrastruktur räumlich sowie rechtlich so austariert werden, dass Schäden nicht verlagert werden.",
    editorialSummary: "Natur- und Artenschutz kann Regenerationsfähigkeit und Klimaanpassung stärken, ist aber nur wirksam, wenn Vollzug, Flächenmanagement und langfristiges Monitoring gesichert sind. Waldbrandvorsorge ist ein klarer Resilienzhebel, sofern Brandschutzstrukturen selbst ökologisch verträglich geplant werden. Beim Ausbau des Ökolandbaus sind Umweltvorteile gegen Flächenproduktivität, Marktaufnahme und öffentliche Förderkosten zu prüfen; beim Wolfsmanagement bleiben Schutz und Akzeptanz gleichzeitig relevant.",
    keyFindings: [
      { kind: "positive", label: "Regeneration vor Reparatur", text: "Biodiversitäts- und Waldresilienzmaßnahmen setzen früh in der Wirkungskaskade an und können spätere Schadens- und Anpassungskosten reduzieren." },
      { kind: "tradeoff", label: "Fläche ist nicht beliebig", text: "Schutz, Landwirtschaft, Energie, Wohnen und Infrastruktur konkurrieren um Flächen; räumliche Verlagerung von Schäden muss mitgeprüft werden." },
      { kind: "positive", label: "Waldbrandvorsorge", text: "Präventive Strukturen können Feuerdynamik und Einsatzrisiken verringern, wenn sie mit Waldökologie und langfristiger Pflege verbunden werden." },
      { kind: "open", label: "Ökolandbau systemisch messen", text: "Nicht nur Hektaranteil, sondern Nährstoff-, Biodiversitäts-, Ertrags-, Import- und Wertschöpfungswirkungen bestimmen die Netto-Wirkung." }
    ],
    readingGuide: "Ökologische Zielrichtung allein genügt nicht: Flächenwirkung, Verlagerung, Vollzug und langfristige Regeneration werden mitbewertet.",
    centralAssessments: {
      "ltw-2026-st-gruene-0054-der-oekologische-landbau-und-die-mit-ihm-verbundenen-werts": {
        direction: "POSITIVE", evidence: "MEDIUM", keyFinding: "POSITIVES NATURPOTENZIAL - SYSTEMGRENZEN PRÜFEN",
        impactCoreSummary: "Mehr ökologischer Landbau kann Pestizid- und Nährstoffbelastungen mindern, Biodiversität fördern und regionale Wertschöpfung stärken; die Netto-Wirkung hängt zugleich von Erträgen, Flächenbedarf, Nachfrage, Importverlagerung und Förderdesign ab.",
        editorialSummary: "Prämien, Beratung, Ausbildung und Forschung bilden einen kohärenten Transformationspfad. Ein höherer Flächenanteil ist jedoch kein Selbstzweck: Entscheidend sind reale Umweltzustände, wirtschaftliche Tragfähigkeit und die Frage, ob geringere Erträge gegebenenfalls über zusätzliche Fläche oder Importe kompensiert werden. Der Pfad bleibt positiv gerichtet, braucht aber systemische Indikatoren.",
        directionRationale: "Die vorgesehenen Instrumente adressieren anerkannte Umweltbelastungen direkt; Gegenwirkungen betreffen vor allem Flächen-, Ertrags- und Verlagerungseffekte."
      },
      "ltw-2026-st-gruene-0042-solche-strukturen-sollen-die-ausbreitung-von-feuer-kontrol": {
        direction: "POSITIVE", evidence: "MEDIUM", keyFinding: "KLARER RESILIENZHEBEL",
        impactCoreSummary: "Brandschutzstrukturen können die Ausbreitung von Wald- und Vegetationsbränden begrenzen und sichere Einsatzkorridore schaffen; positiv ist der Pfad, wenn Planung, Pflege und ökologische Nebenwirkungen standortbezogen berücksichtigt werden.",
        editorialSummary: "Der Mechanismus wirkt vor dem Schadenseintritt und kann dadurch Menschen, Ökosysteme, Infrastruktur und Einsatzkräfte gleichzeitig schützen. Ungeeignete Schneisen oder harte Eingriffe können jedoch Habitatfunktionen beeinträchtigen. Deshalb sind Brandrisikomodell, Standortwahl und Pflegezustand zentrale Qualitätsbedingungen.",
        directionRationale: "Prävention reduziert Exposition und Schadensausbreitung, solange sie keine gleichwertigen ökologischen Schäden erzeugt."
      },
      "ltw-2026-st-gruene-0001-natur-und-artenschutz-biologische-vielfalt-bewahren-wir-se": {
        direction: "POSITIVE", evidence: "MEDIUM", keyFinding: "HOHES REGENERATIONSPOTENZIAL",
        impactCoreSummary: "Wirksamer Natur- und Artenschutz kann Habitatqualität, Biodiversität, Wasser- und Bodenfunktionen sowie Klimaanpassungsfähigkeit stabilisieren; die Wirkung entsteht erst durch konkrete Schutz-, Nutzungs- und Vollzugsregeln.",
        editorialSummary: "Der Zielzustand ist wirkungsökonomisch klar positiv, weil natürliche Regenerations- und Lebensgrundlagen geschützt werden sollen. Konflikte entstehen bei Flächennutzung, Infrastruktur und wirtschaftlicher Nutzung und dürfen nicht durch pauschale Kompensation überdeckt werden. Entscheidend sind räumliche Baseline, Vollzug, Finanzierung und Langzeitmonitoring.",
        directionRationale: "Der Pfad schützt nicht kompensierbare ökologische Funktionen; die offenen Punkte betreffen Ausgestaltung und Zielkonflikte, nicht die Grundrichtung."
      },
      "ltw-2026-st-gruene-0008-jagdrechtliche-regelungen-in-sachsen-anhalt-sollen-auf-ein": {
        direction: "AMBIVALENT", evidence: "MEDIUM", keyFinding: "WISSENSCHAFTSBASIERTES MANAGEMENT MIT VERTEILUNGSKONFLIKT",
        impactCoreSummary: "Ein wissenschaftsbasiertes Wolfsmanagement mit eng begrenzten Abschussausnahmen kann Artenschutz und evidenzbasierte Eingriffe verbinden, verschiebt aber Risiken und Belastungen zwischen Herdenschutz, Weidetierhaltung, Akzeptanz und Naturschutz.",
        editorialSummary: "Eine unabhängige Datengrundlage und definierte Ausnahmefälle sind robuster als pauschale Abschuss- oder Nichtabschussregeln. Trotzdem hängt die Wirkung stark von Populationsdaten, Herdenschutz, Entschädigung, Vollzug und regionaler Belastung ab. Eine einheitlich positive oder negative Einordnung wäre daher zu grob.",
        directionRationale: "Artenschutz und Konfliktmanagement verfolgen legitime, teilweise gegenläufige Schutzgüter; die konkrete Balance entscheidet."
      }
    }
  },
  "ltw-2026-st-linke": {
    sourceKey: "ltw-2026-st-linke",
    version: "2.0",
    overallLabel: "Starkes Teilhabe- und Demokratiepotenzial - Repräsentativität, Kommunalfinanzen und Quellenqualität prüfen",
    overallCharacter: "NO_SINGLE_DIRECTION",
    impactCoreSummary: "Die zentral markierten Pfade des Linke-Programms zielen auf direkte Demokratie, Ehrenamt, kommunale Beteiligung und politische Teilhabe. Positives Potenzial entsteht durch niedrigere Zugangshürden und stärkere lokale Infrastruktur; Zielkonflikte liegen bei Repräsentativität, Minderheitenschutz, öffentlichen Kosten und der konkreten Verfahrensgestaltung.",
    editorialSummary: "Ehrenamtsfonds, kommunale Budgets und niedrigere Beteiligungshürden können lokale Handlungsfähigkeit und demokratische Selbstwirksamkeit stärken. Direkte Demokratie wird aber nicht automatisch besser, wenn Quoren sinken: Informationsqualität, Beteiligungsbreite, Minderheitenschutz und institutionelle Anschlussfähigkeit bleiben entscheidend. Ein zentraler Release-1-Eintrag enthält zudem eine erkennbare Extraktionskollision mehrerer Textabschnitte und darf bis zur Quellentrennung nicht als belastbare Einzelanalyse erscheinen.",
    keyFindings: [
      { kind: "positive", label: "Lokale Wirkungskapazität", text: "Ehrenamts- und Beteiligungsinfrastruktur kann gesellschaftliche Aufgaben näher an lokale Kompetenzen und Bedarfe bringen." },
      { kind: "tradeoff", label: "Mehr Beteiligung ist nicht automatisch mehr Repräsentativität", text: "Niedrigere Quoren erhöhen Zugänglichkeit, können aber Mobilisierungsunterschiede und Minderheitenrisiken verstärken." },
      { kind: "risk", label: "Kommunale Ressourcen", text: "Neue Fonds, Budgets und personelle Ausstattung brauchen Gegenfinanzierung und klare Kriterien, damit Beteiligung nicht von Finanzkraft abhängt." },
      { kind: "open", label: "Quellenkollision entdeckt", text: "Mindestens ein zentraler Alt-Datensatz verbindet mehrere Programmpassagen. Dieser Pfad wird bis zur erneuten Quellenzerlegung fail-closed behandelt." }
    ],
    readingGuide: "Demokratische Beteiligung wird nicht moralisch, sondern funktional geprüft: Zugang, Repräsentativität, Entscheidungsqualität, Kosten und Schutzrechte bleiben getrennt sichtbar.",
    centralAssessments: {
      "ltw-2026-st-linke-0012-ihre-moeglichkeiten-und-ideen-zur-loesung-der-gesellschaft": {
        direction: "OPEN", evidence: "LOW", keyFinding: "BETEILIGUNGSZIEL OHNE INSTRUMENT",
        impactCoreSummary: "Die Einbindung von Ideen und Fähigkeiten aus der Bevölkerung kann Teilhabe und Problemlösung verbessern, die Passage benennt aber keinen konkreten Beteiligungsmechanismus, keine Auswahlregel und keine Entscheidungskompetenz.",
        editorialSummary: "Dialog und Co-Produktion können institutionelles Wissen ergänzen und Akzeptanz erhöhen. Ohne Verfahren bleibt offen, wer beteiligt wird, wie Repräsentativität entsteht und wie Vorschläge in Entscheidungen einfließen. Deshalb wird das Ziel nicht als bereits positiver Wirkpfad ausgegeben.",
        directionRationale: "Der gewünschte Zustand ist plausibel, aber der politische Mechanismus fehlt."
      },
      "ltw-2026-st-linke-0009-dafuer-in-einem-gesetz-zur-staerkung-des-ehrenamts-den-rec": {
        direction: "POSITIVE", evidence: "MEDIUM", keyFinding: "STÄRKUNG LOKALER WIRKUNGSKAPAZITÄT",
        impactCoreSummary: "Ein rechtlicher Rahmen, Ehrenamtsfonds und kommunale Unterstützungsbudgets können Zugangsbarrieren senken und lokale Engagementstrukturen stabilisieren, wenn Förderung transparent, zusätzlich und administrativ einfach ausgestaltet wird.",
        editorialSummary: "Der Ansatz adressiert Zeit-, Ressourcen- und Infrastrukturengpässe ehrenamtlicher Arbeit. Risiken liegen in Förderbürokratie, politischer Selektivität und dauerhaften kommunalen Folgekosten. Wirkung sollte an Beteiligungsbreite, Projektfortbestand, Zugänglichkeit und tatsächlich gelösten lokalen Aufgaben gemessen werden.",
        directionRationale: "Der Pfad stärkt gesellschaftliche Umsetzungskapazität direkt; seine Qualität hängt von fairer und effizienter Mittelvergabe ab."
      },
      "ltw-2026-st-linke-0005-dass-bei-volksinitiativen-volksbegehren-und-volksentscheid": {
        direction: "AMBIVALENT", evidence: "MEDIUM", keyFinding: "ZUGANG VS. REPRÄSENTATIVITÄT",
        impactCoreSummary: "Niedrigere Quoren können den Zugang zu direkter Demokratie erweitern und mehr Themen zur Abstimmung bringen, können zugleich aber kleinere mobilisierungsstarke Gruppen relativ stärker gewichten und Schutz- oder Legitimitätsfragen verschärfen.",
        editorialSummary: "Der Effekt hängt nicht nur von der Höhe des Quorums ab, sondern von Information, Beteiligungsbreite, Verfahrensfairness, Themenzulässigkeit und Minderheitenschutz. Ein einfacher Mehr-ist-besser-Schluss wäre deshalb methodisch falsch. Zu beobachten sind Teilnahme, soziale Repräsentativität, Verfahrenskosten und spätere Akzeptanz.",
        directionRationale: "Mehr Zugänglichkeit und mögliche Repräsentativitätsrisiken wirken gleichzeitig."
      },
      "ltw-2026-st-linke-0010-dass-ehrenamtliche-mitglieder-der-kommunalen-vertretungen": {
        direction: "OPEN", evidence: "NOT_ASSESSABLE", keyFinding: "QUELLENTRENNUNG ERFORDERLICH",
        impactCoreSummary: "Der vorliegende Alt-Datensatz verbindet eine Passage zur Ausstattung kommunaler Vertretungen mit einem anschließenden Abschnitt zur politischen Bildung. Solange diese Quellenteile nicht sauber getrennt sind, ist keine belastbare Einzelbewertung zulässig.",
        editorialSummary: "Eine fachliche Richtung aus dem zusammengezogenen Text abzuleiten würde zwei unterschiedliche Instrumente vermischen. Der öffentliche Kurzbefund wird deshalb bewusst gesperrt; der Originaltext bleibt für Reproduzierbarkeit sichtbar. Erst nach erneuter Quellenzerlegung werden Wirkpfad, Zuständigkeit und Evidenz getrennt bewertet.",
        directionRationale: "Die Analyseeinheit selbst ist nicht valide.",
        sourceQuality: "SOURCE_COLLISION"
      }
    }
  },
  "ltw-2026-st-bsw": {
    sourceKey: "ltw-2026-st-bsw",
    version: "2.0",
    overallLabel: "Teilhabe- und Freiheitsziele mit hoher Konkretisierungs- und Kompetenzabhängigkeit",
    overallCharacter: "NO_SINGLE_DIRECTION",
    impactCoreSummary: "Die zentral markierten BSW-Pfade verbinden Schutz vor sozialem Druck in militärische Laufbahnen, eine allgemeine Ablehnung weiterer Militarisierung sowie kommunale Beteiligungs- und Dialogziele. Positives Potenzial liegt bei freiwilliger Lebensplanung und demokratischer Teilhabe; mehrere zentrale Aussagen bleiben jedoch so abstrakt, dass ohne konkretes Instrument keine seriöse Wirkungsrichtung angegeben werden kann.",
    editorialSummary: "Der stärkste belastbare Pfad ist nicht eine pauschale Sicherheits- oder Friedensbewertung, sondern die Frage, ob junge Menschen reale zivile Bildungs-, Ausbildungs- und Einkommensalternativen haben. Bürgerbudgets und Bürgerentscheide können Teilhabe stärken, brauchen aber faire Verfahren und kommunale Finanzierung. Aussagen wie „nicht weiter militarisiert“ oder allgemeiner gesellschaftlicher Dialog sind politische Zielbilder; erst ein konkreter landesrechtlicher Hebel macht sie wirkungsökonomisch prüfbar.",
    keyFindings: [
      { kind: "positive", label: "Echte Wahlfreiheit", text: "Soziale Sicherheit und zivile Alternativen können verhindern, dass wirtschaftlicher Druck berufliche Lebensentscheidungen dominiert." },
      { kind: "open", label: "Militarisierung ist kein Instrument", text: "Ohne Definition, Zielzustand und Landeshebel kann aus der Forderung keine belastbare positive oder negative Wirkung abgeleitet werden." },
      { kind: "tradeoff", label: "Direkte Beteiligung braucht Design", text: "Bürgerbudgets und Bürgerentscheide können Selbstwirksamkeit erhöhen, benötigen aber Repräsentativität, Minderheitenschutz und tragfähige kommunale Verfahren." },
      { kind: "open", label: "Dialog ist Vorwirkung, nicht Vollzug", text: "Respektvolle Kommunikation kann gesellschaftlich relevant sein, ersetzt aber kein überprüfbares politisches Instrument." }
    ],
    readingGuide: "Normative Zielaussagen werden nicht automatisch als positive Wirkung gewertet. Erst konkrete Hebel, Zuständigkeit und Gegenfaktum erlauben eine Richtungsbewertung.",
    centralAssessments: {
      "ltw-2026-st-bsw-0005-junge-menschen-duerfen-nicht-aus-sozialer-unsicherheit-ode": {
        direction: "POSITIVE", evidence: "LOW", keyFinding: "WAHLFREIHEIT DURCH ZIVILE ALTERNATIVEN",
        impactCoreSummary: "Wenn soziale Sicherheit, Ausbildung und zivile Berufsalternativen verbessert werden, sinkt das Risiko, dass wirtschaftlicher Druck militärische Berufswahl dominiert; positiv ist dieser Pfad nur, soweit daraus konkrete Unterstützungsinstrumente entstehen.",
        editorialSummary: "Der relevante Wirkmechanismus liegt bei realen Optionen junger Menschen, nicht bei einer pauschalen Bewertung militärischer Berufe. Einkommen, Ausbildungszugang, Berufsberatung und regionale Chancen sind messbare Hebel. Die Programmaussage nennt diese Instrumente noch nicht, deshalb bleibt die Evidenz für den konkreten politischen Beitrag niedrig.",
        directionRationale: "Mehr reale Wahlmöglichkeiten und geringerer ökonomischer Zwang sind positiv; die konkrete Umsetzung ist noch offen."
      },
      "ltw-2026-st-bsw-0004-sachsenanhalt-darf-nicht-weiter-militarisiert-werden": {
        direction: "OPEN", evidence: "NOT_ASSESSABLE", keyFinding: "BEGRIFF UND INSTRUMENT UNBESTIMMT",
        impactCoreSummary: "Die Aussage „Sachsen-Anhalt darf nicht weiter militarisiert werden“ definiert weder den gemeinten Zustand noch das politische Instrument und erlaubt deshalb keine belastbare Wirkungsrichtung.",
        editorialSummary: "Je nach gemeintem Gegenstand könnten Flächennutzung, Rüstungswirtschaft, Bundeswehrstandorte, Forschung, Sicherheit oder zivile Infrastruktur betroffen sein - mit jeweils anderen Wirkpfaden. Eine pauschale Bewertung würde diese Unterschiede verdecken. Der Pfad bleibt bis zur Konkretisierung fachlich offen.",
        directionRationale: "Ohne Analyseeinheit, Mechanismus und Zuständigkeit ist eine Richtung nicht seriös bestimmbar."
      },
      "ltw-2026-st-bsw-0011-auch-auf-kommunaler-ebene-sollen-buergerbudgets-und-buerge": {
        direction: "AMBIVALENT", evidence: "MEDIUM", keyFinding: "MEHR TEILHABE - VERFAHRENSQUALITÄT ENTSCHEIDET",
        impactCoreSummary: "Niedrigere Hürden und finanzierte Bürgerbudgets können kommunale Beteiligung und Selbstwirksamkeit erhöhen, können bei schwacher Beteiligungsbreite oder unklaren Regeln aber Ressourcen verzerren und mobilisierungsstarke Gruppen bevorzugen.",
        editorialSummary: "Der positive Hebel liegt in zugänglichen Verfahren, nicht in möglichst vielen Abstimmungen. Repräsentativität, Transparenz, Minderheitenschutz, Verwaltungsaufwand und verfügbare kommunale Mittel müssen gemeinsam beobachtet werden. Klare rechtliche Rahmenbedingungen sind daher Teil des Wirkmechanismus und nicht nur Umsetzungsdetail.",
        directionRationale: "Zugangsvorteile und Repräsentativitäts-/Ressourcenrisiken bestehen gleichzeitig."
      },
      "ltw-2026-st-bsw-0014-in-sachsenanhalt-wollen-wir-mit-allen-menschen-ins-gesprae": {
        direction: "OPEN", evidence: "LOW", keyFinding: "KOMMUNIKATIVE VORWIRKUNG - KEIN AUSGESTALTETES INSTRUMENT",
        impactCoreSummary: "Respektvoller Dialog kann Vertrauen und Konfliktbearbeitung unterstützen, die Passage beschreibt aber zunächst Kommunikationsabsicht und keinen verbindlichen staatlichen Wirkungshebel.",
        editorialSummary: "Politische Kommunikation kann Erwartungen und Diskursklima verändern. Ob daraus gesellschaftlicher Zusammenhalt entsteht, hängt von Reichweite, tatsächlicher Dialogstruktur, Umgang mit Konflikten und anschließender Entscheidungsresponsivität ab. Deshalb wird das Ziel nicht als bereits positiver Politikpfad ausgegeben.",
        directionRationale: "Eine plausible positive Vorwirkung ist möglich, aber kausaler Mechanismus und staatliches Instrument bleiben unbestimmt."
      }
    }
  },
  "ltw-2026-st-afd": {
    sourceKey: "ltw-2026-st-afd",
    version: "2.0",
    overallLabel: "Konkrete Einzelpotenziale neben materiellen Grundrechts-, Gleichheits- und Zuständigkeitskonflikten",
    overallCharacter: "NO_SINGLE_DIRECTION",
    impactCoreSummary: "Die zentral markierten AfD-Pfade reichen von Familien- und Schwangerschaftspolitik bis zu frühkindlicher Bildung und der Abschaffung nicht näher definierter gesellschaftspolitischer Instrumente. Einzelne konkrete Maßnahmen wie freiwillige Unterstützung für Schwangere oder mehr Vorlesen besitzen positives Potenzial; bei reproduktiven Rechten, Gleichstellung und unbestimmten Abschaffungsforderungen sind Schutzrechte, tatsächlicher Leistungsumfang und Zuständigkeit materiell.",
    editorialSummary: "Eine breite Programmbewertung darf positive und negative Einzelpfade nicht gegeneinander verrechnen. Frühkindliche Sprach- und Leseförderung ist ein konkret plausibler Bildungshebel. Unterstützungsangebote für ungewollt Schwangere können positiv wirken, wenn sie freiwillig, ergebnisoffen und zugänglich sind; sie dürfen nicht mit Einschränkungen reproduktiver Selbstbestimmung vermischt werden. Unbestimmte Sammelbegriffe wie „gesellschaftspolitische Steuerungsinstrumente“ sind vor einer Wirkungsbewertung erst in konkrete Maßnahmen zu zerlegen.",
    keyFindings: [
      { kind: "positive", label: "Frühe Bildung", text: "Mehr qualitativ gutes Vorlesen kann Sprachentwicklung, Wortschatz und spätere Bildungsteilhabe unterstützen." },
      { kind: "positive", label: "Unterstützung muss freiwillig sein", text: "Beratung und materielle Hilfe für ungewollt Schwangere können Belastungen reduzieren, wenn Autonomie und Nichtdirektivität geschützt bleiben." },
      { kind: "risk", label: "Grundrechtsgrenzen materiell", text: "Reproduktive Gesundheit, Gleichheit, Diskriminierungsschutz und individuelle Freiheitsrechte dürfen nicht gegen andere Programmvorteile verrechnet werden." },
      { kind: "open", label: "Unbestimmte Abschaffungsforderungen", text: "Ohne Benennung der betroffenen Instrumente ist weder Haushaltsentlastung noch gesellschaftliche Wirkung belastbar zu beurteilen." }
    ],
    readingGuide: "Nicht kompensierbare Grundrechts- und Schutzgüterfragen werden als eigene Grenze behandelt. Positive Einzelmaßnahmen können eine problematische Schutzrechtswirkung an anderer Stelle nicht ausgleichen.",
    centralAssessments: {
      "ltw-2026-st-afd-0007-wir-halten-an-dem-gesellschaftlichen-kompromiss-fest-wonac": {
        direction: "AMBIVALENT", evidence: "MEDIUM", keyFinding: "REPRODUKTIVE RECHTE UND SCHUTZPFLICHTEN IM ZIELKONFLIKT",
        impactCoreSummary: "Ein stärkerer Schutz ungeborenen Lebens kann auf Schutzpflichten zielen, berührt zugleich körperliche Selbstbestimmung, Gesundheit und Zugang zu rechtssicherer Versorgung schwangerer Personen; die konkrete Wirkung hängt wesentlich vom tatsächlichen Rechtsinstrument ab.",
        editorialSummary: "Die Passage ist nicht als reine Landesmaßnahme zu behandeln, weil das Schwangerschaftsabbruchsrecht wesentlich bundesrechtlich geprägt ist. Wirkungsökonomisch müssen gesundheitliche Sicherheit, Zugang zu Beratung und Versorgung, Autonomie, soziale Belastung und Schutzinteressen getrennt sichtbar bleiben. Eine pauschale positive oder negative Gesamtrichtung wäre ohne konkrete Gesetzesänderung zu grob.",
        directionRationale: "Materielle Schutzgüter stehen in einem echten Zielkonflikt; konkrete Rechtsfolge und Verhältnismäßigkeit entscheiden.",
        competenceNote: "Bundesrechtliche Zuständigkeit ist wesentlich."
      },
      "ltw-2026-st-afd-0001-gesellschaftspolitische-steuerungsinstrumente-die-nicht-nu": {
        direction: "OPEN", evidence: "NOT_ASSESSABLE", keyFinding: "ANALYSEEINHEIT FEHLT",
        impactCoreSummary: "Die angekündigte Abschaffung „gesellschaftspolitischer Steuerungsinstrumente“ benennt nicht, welche Gesetze, Programme, Stellen oder Förderungen betroffen wären; damit fehlen Gegenstand, Kostenbasis und Wirkmechanismus.",
        editorialSummary: "Je nach betroffenem Instrument könnten Verwaltungskosten sinken oder Gleichstellungs-, Teilhabe-, Präventions- und Schutzfunktionen entfallen. Ohne Liste der konkreten Maßnahmen wäre jede Richtung eine Spekulation. Vor einer Bewertung müssen Instrumente einzeln mit Budget, Zielgruppe und Schutzfunktion offengelegt werden.",
        directionRationale: "Ohne konkreten Gegenstand gibt es weder belastbaren Nutzenpfad noch belastbares Risikoquantum."
      },
      "ltw-2026-st-afd-0005-daneben-werden-wir-eine-breit-aufgestellte-unterstuetzungs": {
        direction: "POSITIVE", evidence: "MEDIUM", keyFinding: "UNTERSTÜTZUNGSPOTENZIAL MIT AUTONOMIE-SAFEGUARD",
        impactCoreSummary: "Eine breit zugängliche Unterstützungsstruktur für ungewollt Schwangere kann finanzielle, gesundheitliche und psychosoziale Belastungen senken, wenn Beratung freiwillig, ergebnisoffen, qualifiziert und ohne Zugangshürden erfolgt.",
        editorialSummary: "Materielle Hilfe, Beratung und Versorgungsnavigation können konkrete Probleme früh adressieren. Das positive Potenzial hängt jedoch daran, dass Hilfe nicht an eine gewünschte Schwangerschaftsentscheidung gekoppelt wird und Datenschutz sowie gesundheitliche Versorgung gesichert bleiben. Reichweite, Wartezeiten, freiwillige Nutzung und Outcomes sind geeignete Prüfpunkte.",
        directionRationale: "Freiwillige bedarfsgerechte Unterstützung reduziert Belastungen; Zwang oder einseitige Steuerung würde die Richtung verändern."
      },
      "ltw-2026-st-afd-0031-zudem-muss-das-vorlesen-einen-groesseren-anteil-in-der-vor": {
        direction: "POSITIVE", evidence: "MEDIUM", keyFinding: "FRÜHER BILDUNGSHEBEL",
        impactCoreSummary: "Mehr qualitativ gutes Vorlesen in der vorschulischen Bildung kann Wortschatz, Sprachverständnis, Konzentration und spätere Bildungsteilhabe stärken, wenn es altersgerecht und in eine breitere pädagogische Umgebung eingebettet wird.",
        editorialSummary: "Der Hebel ist niedrigschwellig und wirkt früh in der Bildungskaskade. Entscheidend sind Qualität, Häufigkeit, Zugang zu Büchern, Mehrsprachigkeit und die Einbettung in Interaktion statt bloßer Zeitvorgabe. Der Nutzen sollte über Sprachentwicklung und Teilhabe beobachtet werden, nicht über reine Vorleseminuten.",
        directionRationale: "Der Mechanismus zwischen dialogischem Vorlesen und Sprach-/Literacyentwicklung ist plausibel und mit geringen materiellen Gegenrisiken verbunden."
      }
    }
  }
};

export function saxonyAnhaltProgrammeEditorial(sourceKey: string) {
  return saxonyAnhaltProgrammeEditorialV2[sourceKey] ?? null;
}

export function saxonyAnhaltCommitmentEditorial(sourceKey: string, commitmentKey: string) {
  return saxonyAnhaltProgrammeEditorialV2[sourceKey]?.centralAssessments[commitmentKey] ?? null;
}
