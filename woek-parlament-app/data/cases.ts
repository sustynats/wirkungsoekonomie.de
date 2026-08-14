export type CaseKind = "RADAR" | "IMPACT_BRIEF" | "FULL_CHECK" | "RETROSPECTIVE_CASE";
export type EditorialStatus = "DEMONSTRATOR" | "CONTENT_REQUIRED" | "PUBLISHED";
export type Materiality = "VERY_HIGH" | "HIGH" | "MEDIUM" | "WATCH";

export type CaseSource = {
  title: string;
  publisher: string;
  url: string;
  retrievedAt: string;
  note: string;
};

/**
 * Only populated for an officially sourced, editorially released case.
 * The short view makes the result readable; the nested provenance fields
 * preserve the path to calculation, assumptions and sources.
 */
export type PublicAssessment = {
  category: string;
  summary: string;
  rationale: string[];
  evidenceStatus: string;
  calculationCoverage: {
    quantified: number;
    ruleBased: number;
    notRobustlyQuantifiable: number;
  };
  calculationSteps: Array<{
    label: string;
    value: string;
    note: string;
  }>;
  uncertainty: string;
  changeConditions: string[];
};

export type ParliamentaryCase = {
  slug: string;
  title: string;
  plainTitle: string;
  kind: CaseKind;
  editorialStatus: EditorialStatus;
  materiality: Materiality;
  parliamentaryStatus: string;
  statusVerification: "STATUS_UNVERIFIED" | "EDITORIAL_DEMONSTRATOR" | "VERIFIED";
  nextEvent: string | null;
  lastUpdated: string;
  summary: string;
  whatIsDecided: string;
  analysisStatus: string;
  intendedGoal: string;
  impactPath: string[];
  affectedGroups: string[];
  questions: string[];
  sources: CaseSource[];
  versionNote: string;
  retrospective?: boolean;
  publicAssessment?: PublicAssessment;
};

const dipApi: CaseSource = {
  title: "DIP API – technische Kurzdokumentation",
  publisher: "Deutscher Bundestag",
  url: "https://dip.bundestag.de/documents/informationsblatt_zur_dip_api.pdf",
  retrievedAt: "2026-08-14",
  note: "Methode und Datenzugang; noch keine fallbezogene Quelle."
};

export const parliamentaryCases: ParliamentaryCase[] = [
  {
    slug: "musterfall-fassungswechsel",
    title: "Musterfall: Änderung einer Zugangsvoraussetzung",
    plainTitle: "Wie eine geänderte Fassung den Wirkpfad verändern kann",
    kind: "FULL_CHECK",
    editorialStatus: "DEMONSTRATOR",
    materiality: "HIGH",
    parliamentaryStatus: "Synthetischer Demonstrator – kein amtlicher Vorgang",
    statusVerification: "EDITORIAL_DEMONSTRATOR",
    nextEvent: null,
    lastUpdated: "2026-08-14",
    summary: "Dieser klar gekennzeichnete Musterfall zeigt die Produktlogik mit Fassung, Wirkpfad, Evidenzgrenze und Korrekturtrigger. Er behauptet keine reale parlamentarische Entscheidung.",
    whatIsDecided: "Eine fiktive Zugangsvoraussetzung wird in einer zweiten Fassung vereinfacht.",
    analysisStatus: "Demonstrator: fachliche Fallbefüllung steht für reale Vorgänge noch aus.",
    intendedGoal: "Darstellung, wie Änderungen einer Fassung auf Annahmen, Betroffene und Prüfbedarf zurückwirken können.",
    impactPath: [
      "Regeländerung: Zugangsvoraussetzung wird vereinfacht.",
      "Vollzug: zuständige Stellen prüfen weniger Zusatznachweise.",
      "Betroffene: der Zugang kann für mehr berechtigte Menschen erreichbar werden.",
      "Rückkopplung: tatsächliche Nutzung, Vollzugsaufwand und Ausschlüsse müssen beobachtet werden."
    ],
    affectedGroups: ["potenziell berechtigte Menschen", "vollziehende Stellen", "mittelbar betroffene lokale Strukturen"],
    questions: [
      "Welche Gruppen könnten trotz Vereinfachung weiterhin ausgeschlossen bleiben?",
      "Welche Daten würden zeigen, ob sich der Zugang tatsächlich verändert?",
      "Welche unbeabsichtigten Vollzugs- oder Verlagerungseffekte wären zu prüfen?"
    ],
    sources: [dipApi],
    versionNote: "Version A → Version B: illustrative Vereinfachung; bei einem echten Fall wäre ein geprüfter Dokumentdiff erforderlich."
  },
  {
    slug: "radar-befuellung-ausstehend",
    title: "Wirkungsradar: amtliche Befüllung vorbereiten",
    plainTitle: "Noch keine freigegebene aktuelle Fallanalyse",
    kind: "RADAR",
    editorialStatus: "CONTENT_REQUIRED",
    materiality: "WATCH",
    parliamentaryStatus: "STATUS_UNVERIFIED – DIP-Import noch nicht konfiguriert",
    statusVerification: "STATUS_UNVERIFIED",
    nextEvent: null,
    lastUpdated: "2026-08-14",
    summary: "Die technische Radarstrecke ist vorbereitet. Ein aktueller realer Vorgang wird erst nach amtlichem Abruf, Quellenprüfung und redaktioneller Freigabe veröffentlicht.",
    whatIsDecided: "CONTENT_REQUIRED",
    analysisStatus: "Kein amtlicher Sachverhalt hinterlegt.",
    intendedGoal: "Ein fachlich belastbarer Radarhinweis statt automatisch erzeugter politischer Inhalte.",
    impactPath: ["Amtliche Daten abrufen.", "Vorgang und Fassung prüfen.", "Materialität begründen.", "Erst dann einen Radarhinweis veröffentlichen."],
    affectedGroups: [],
    questions: ["Welcher Vorgang ist amtlich belegt?", "Welche Fassung ist aktuell?", "Warum ist er wirkungsrelevant?"],
    sources: [dipApi],
    versionNote: "Keine Version veröffentlicht."
  },
  {
    slug: "historie-redaktioneller-auftakt",
    title: "Historische Wirkungschecks: Auftaktfall auswählen",
    plainTitle: "Retrospektiven müssen damaliges und heutiges Wissen trennen",
    kind: "RETROSPECTIVE_CASE",
    editorialStatus: "CONTENT_REQUIRED",
    materiality: "MEDIUM",
    parliamentaryStatus: "Historischer Fall noch nicht redaktionell festgelegt",
    statusVerification: "STATUS_UNVERIFIED",
    nextEvent: null,
    lastUpdated: "2026-08-14",
    summary: "Die Retrospektivlogik ist angelegt. Vor Veröffentlichung wird ein amtlich belegter Fall mit damaliger Quellenlage, späteren Beobachtungen und klaren Kausalitätsgrenzen kuratiert.",
    whatIsDecided: "CONTENT_REQUIRED",
    analysisStatus: "Kein Rückschauurteil ohne dokumentierte damalige Wissenslage.",
    intendedGoal: "Nachvollziehbar machen, wie Wirkung später gemessen und gelernt werden kann.",
    impactPath: ["damalige Entscheidung und Zielsetzung", "damals verfügbare Evidenz", "spätere Beobachtungen", "klar begrenzte ex-post-Einordnung"],
    affectedGroups: [],
    questions: ["Was war damals bekannt?", "Was wissen wir heute zusätzlich?", "Was lässt sich tatsächlich zurechnen?"],
    sources: [dipApi],
    versionNote: "Noch keine historische Fassung veröffentlicht.",
    retrospective: true
  }
];
