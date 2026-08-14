export type CaseKind = "RADAR" | "IMPACT_BRIEF" | "FULL_CHECK" | "RETROSPECTIVE_CASE";
export type EditorialStatus = "DEMONSTRATOR" | "CONTENT_REQUIRED" | "PUBLISHED";
export type Materiality = "VERY_HIGH" | "HIGH" | "MEDIUM" | "WATCH";
export type EvidenceClass = "HIGH" | "MEDIUM" | "LIMITED" | "MODEL_ASSUMPTION" | "DATA_GAP";
export type RecommendationCategory =
  | "TRAGFAEHIG"
  | "UNTER_BEDINGUNGEN"
  | "ERPROBUNG"
  | "NACHARBEITEN"
  | "DERZEIT_NICHT_TRAGFAEHIG"
  | "KEINE_BELASTBARE_EMPFEHLUNG";

export type CaseSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceDate: string;
  retrievedAt: string;
  excerpt: string;
  evidenceClass: EvidenceClass;
  note: string;
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
  phaseLabel: string;
  termLabel: string;
  nextEvent: string | null;
  lastUpdated: string;
  summary: string;
  whatIsDecided: string;
  immediateChange: string;
  analysisStatus: string;
  intendedGoal: string;
  impactPath: Array<{ station: string; evidenceClass: EvidenceClass; possibleBreak?: string }>;
  biggestChance: string;
  biggestRisk: string;
  mainUncertainty: string;
  affectedGroups: string[];
  questions: string[];
  sources: CaseSource[];
  versionNote: string;
  finalVotingVersionVerified: boolean | null;
  retrospective?: boolean;
  changedSinceLastAnalysis?: boolean;
};

const methodSource: CaseSource = {
  id: "SRC-METHOD-001",
  title: "DIP API – technische Kurzdokumentation",
  publisher: "Deutscher Bundestag",
  url: "https://dip.bundestag.de/documents/informationsblatt_zur_dip_api.pdf",
  sourceDate: "2026-08-14",
  retrievedAt: "2026-08-14",
  excerpt: "Technische Dokumentation zum Datenzugang; keine fallbezogene parlamentarische Quelle.",
  evidenceClass: "LIMITED",
  note: "Dieser Beleg dokumentiert den künftigen Datenzugang, nicht einen parlamentarischen Sachverhalt."
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
    phaseLabel: "Demonstrator",
    termLabel: "Kein parlamentarischer Termin",
    nextEvent: null,
    lastUpdated: "2026-08-14",
    summary: "Dieser klar gekennzeichnete Musterfall zeigt Fassung, Wirkpfad, Evidenzgrenze und Korrekturtrigger. Er behauptet keine reale parlamentarische Entscheidung.",
    whatIsDecided: "Eine fiktive Zugangsvoraussetzung wird in einer zweiten Fassung vereinfacht.",
    immediateChange: "Für den Zugang wären weniger Zusatznachweise erforderlich.",
    analysisStatus: "Demonstrator: fachliche Fallbefüllung steht für reale Vorgänge noch aus.",
    intendedGoal: "Darstellung, wie Änderungen einer Fassung auf Annahmen, Betroffene und Prüfbedarf zurückwirken können.",
    impactPath: [
      { station: "Regeländerung: Zugangsvoraussetzung wird vereinfacht.", evidenceClass: "MODEL_ASSUMPTION" },
      { station: "Vollzug: zuständige Stellen prüfen weniger Zusatznachweise.", evidenceClass: "MODEL_ASSUMPTION", possibleBreak: "Die Vollzugspraxis kann neue informelle Hürden erzeugen." },
      { station: "Betroffene: der Zugang kann für mehr berechtigte Menschen erreichbar werden.", evidenceClass: "LIMITED" },
      { station: "Rückkopplung: tatsächliche Nutzung, Vollzugsaufwand und Ausschlüsse müssen beobachtet werden.", evidenceClass: "DATA_GAP" }
    ],
    biggestChance: "Ein nachvollziehbarer Zugang kann bisherige vermeidbare Hürden senken.",
    biggestRisk: "Vereinfachung kann neue Ausschlüsse oder Vollzugslasten verdecken.",
    mainUncertainty: "Ohne beobachtete Nutzungs- und Vollzugsdaten bleibt die Wirkung offen.",
    affectedGroups: ["potenziell berechtigte Menschen", "vollziehende Stellen", "mittelbar betroffene lokale Strukturen"],
    questions: [
      "Welche Gruppen könnten trotz Vereinfachung weiterhin ausgeschlossen bleiben?",
      "Welche Daten würden zeigen, ob sich der Zugang tatsächlich verändert?",
      "Welche unbeabsichtigten Vollzugs- oder Verlagerungseffekte wären zu prüfen?"
    ],
    sources: [methodSource],
    versionNote: "Version A → Version B: illustrative Vereinfachung; bei einem echten Fall wäre ein geprüfter Dokumentdiff erforderlich.",
    finalVotingVersionVerified: null,
    changedSinceLastAnalysis: true
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
    phaseLabel: "Amtliche Prüfung ausstehend",
    termLabel: "Termin noch nicht verifiziert",
    nextEvent: null,
    lastUpdated: "2026-08-14",
    summary: "Die technische Radarstrecke ist vorbereitet. Ein aktueller realer Vorgang wird erst nach amtlichem Abruf, Quellenprüfung und redaktioneller Freigabe veröffentlicht.",
    whatIsDecided: "CONTENT_REQUIRED",
    immediateChange: "CONTENT_REQUIRED",
    analysisStatus: "Kein amtlicher Sachverhalt hinterlegt.",
    intendedGoal: "Ein fachlich belastbarer Radarhinweis statt automatisch erzeugter politischer Inhalte.",
    impactPath: [
      { station: "Amtliche Daten abrufen.", evidenceClass: "DATA_GAP" },
      { station: "Vorgang und Fassung prüfen.", evidenceClass: "DATA_GAP" },
      { station: "Materialität begründen.", evidenceClass: "DATA_GAP" },
      { station: "Erst dann einen Radarhinweis veröffentlichen.", evidenceClass: "DATA_GAP" }
    ],
    biggestChance: "Der Radar macht seine Daten- und Prüfgrenzen sichtbar.",
    biggestRisk: "Ein nicht verifizierter Status könnte fälschlich als politischer Fakt gelesen werden.",
    mainUncertainty: "DIP-Zugang und amtlicher Fallbestand sind noch nicht verbunden.",
    affectedGroups: [],
    questions: ["Welcher Vorgang ist amtlich belegt?", "Welche Fassung ist aktuell?", "Warum ist er wirkungsrelevant?"],
    sources: [methodSource],
    versionNote: "Keine Version veröffentlicht.",
    finalVotingVersionVerified: null
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
    phaseLabel: "Fallauswahl ausstehend",
    termLabel: "Historisches Datum erforderlich",
    nextEvent: null,
    lastUpdated: "2026-08-14",
    summary: "Die Retrospektivlogik ist angelegt. Vor Veröffentlichung wird ein amtlich belegter Fall mit damaliger Quellenlage, späteren Beobachtungen und klaren Kausalitätsgrenzen kuratiert.",
    whatIsDecided: "CONTENT_REQUIRED",
    immediateChange: "CONTENT_REQUIRED",
    analysisStatus: "Kein Rückschauurteil ohne dokumentierte damalige Wissenslage.",
    intendedGoal: "Nachvollziehbar machen, wie Wirkung später gemessen und gelernt werden kann.",
    impactPath: [
      { station: "damalige Entscheidung und Zielsetzung", evidenceClass: "DATA_GAP" },
      { station: "damals verfügbare Evidenz", evidenceClass: "DATA_GAP" },
      { station: "spätere Beobachtungen", evidenceClass: "DATA_GAP" },
      { station: "klar begrenzte ex-post-Einordnung", evidenceClass: "DATA_GAP" }
    ],
    biggestChance: "Lernen wird nachvollziehbar, ohne heutiges Wissen in die Vergangenheit zu übertragen.",
    biggestRisk: "Rückschaufehler vermischt damalige Annahmen und heutige Erkenntnisse.",
    mainUncertainty: "Ein geeigneter, vollständig belegter Ausgangsfall ist noch nicht festgelegt.",
    affectedGroups: [],
    questions: ["Was war damals bekannt?", "Was wissen wir heute zusätzlich?", "Was lässt sich tatsächlich zurechnen?"],
    sources: [methodSource],
    versionNote: "Noch keine historische Fassung veröffentlicht.",
    finalVotingVersionVerified: null,
    retrospective: true
  }
];

export const monitorRows = [
  {
    erwartung: "Zugang kann einfacher werden.",
    indikator: "Tatsächliche Nutzung",
    woekId: "CONTENT_REQUIRED",
    beobachtung: "Keine Beobachtung veröffentlicht.",
    datum: "Datenstand ausstehend",
    status: "DATA_GAP" as const
  },
  {
    erwartung: "Vollzug kann weniger Nachweise prüfen.",
    indikator: "Vollzugsaufwand",
    woekId: "CONTENT_REQUIRED",
    beobachtung: "Keine Beobachtung veröffentlicht.",
    datum: "Datenstand ausstehend",
    status: "NOT_YET_OBSERVABLE" as const
  }
];

export const dialogueQuestions = [
  {
    question: "Ist die Wirkungsrelevanz dieser Frage für Sie nachvollziehbar?",
    comparable: true,
    parliament: 0,
    public: 0,
    meta: "Keine Feldphase. Ergebnisse werden erst ab n ≥ 10 je Gruppe veröffentlicht."
  },
  {
    question: "Welche Information fehlt für eine bessere Folgenabschätzung?",
    comparable: false,
    parliament: 0,
    public: 0,
    meta: "CONTENT_REQUIRED – offene Antwortformate werden nicht als Prozentvergleich dargestellt."
  }
];
