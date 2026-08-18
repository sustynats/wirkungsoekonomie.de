import generatedWorkingActs from "@/data/public-working-acts.json";

export type CaseKind = "RADAR" | "IMPACT_BRIEF" | "FULL_CHECK" | "RETROSPECTIVE_CASE";
export type EditorialStatus = "DEMONSTRATOR" | "CONTENT_REQUIRED" | "PREPARATION_PUBLISHED" | "WORKING_ACT_PUBLISHED" | "PUBLISHED";
export type Materiality = "VERY_HIGH" | "HIGH" | "MEDIUM" | "WATCH";
export type PublicMaturityStatus = "PRELIMINARY_REVIEW" | "MONITORING" | "EVIDENCE_REVIEW" | "CALCULATION" | "METHOD_REVIEW" | "REVIEW_COMPLETE";

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
  normativeMapping?: PublicNormativeMapping;
};

export type NormativeImpactDirection = "POSITIVE_POTENTIAL" | "NEGATIVE_RISK" | "AMBIVALENT" | "EVIDENCE_OPEN" | "OBSERVED_POSITIVE" | "OBSERVED_NEGATIVE";
export type PublicNormativeFramework = "SDG" | "SDG_PLUS" | "CONSTITUTIONAL_ANCHOR";
export type PublicConstitutionalAnchorType = "FUNDAMENTAL_RIGHT" | "STATE_STRUCTURE_PRINCIPLE" | "STATE_OBJECTIVE" | "PROTECTION_DUTY" | "EU_PRIMARY_LAW" | "HUMAN_RIGHTS" | "STATE_CONSTITUTION";

/**
 * A public, source-linked mapping. The tile is never a score: it makes the
 * affected reference target, direction and evidentiary boundary legible.
 */
export type PublicNormativeMappingItem = {
  id: string;
  framework: PublicNormativeFramework;
  code: string;
  label: string;
  direction: NormativeImpactDirection;
  evidenceStatus: string;
  rationale: string;
  impactPathRefs: string[];
  /** A case page links to the portal's source detail page, never directly away. */
  referenceHref: string;
  constitutionalAnchorType?: PublicConstitutionalAnchorType;
  legalReference?: string;
};

export type PublicNormativeMapping = {
  status: "PROVISIONAL" | "PUBLISHED" | "EVIDENCE_OPEN";
  basis: string;
  sdgItems: PublicNormativeMappingItem[];
  sdgPlusItems: PublicNormativeMappingItem[];
  /**
   * Legal and constitutional anchors are intentionally separate from SDG+.
   * They can set protection boundaries, but they do not create extra scores.
   */
  constitutionalAnchorItems: PublicNormativeMappingItem[];
};

/**
 * The public projection preserves the complete, source-bound reasoning from
 * a review. It intentionally contains no credentials, internal file paths or
 * reviewer metadata. Every entry is framed as an ex-ante hypothesis unless
 * the evidence status says otherwise.
 */
export type PublicImpactPathDetail = {
  id: string;
  lever: string;
  hypothesis: string;
  direction: string;
  affectedDimensions: string[];
  affectedGroups: string[];
  prerequisites: string[];
  risks: string[];
  evidenceBoundary: string;
  evidenceStatus: string;
  changeLever: string;
};

export type PublicCalculationRequirement = {
  id: string;
  name: string;
  specification: string;
  requiredInputs: string[];
  availableInputs: string[];
  missingInputs: string[];
  status: string;
};

export type PublicRiskDetail = {
  id: string;
  description: string;
  status: string;
  nonCompensationRelevant: boolean;
};

export type PublicBoundaryDetail = {
  boundary: string;
  status: string;
  reason: string;
};

export type PublicCounterfactualDetail = {
  question: string;
  status: string;
  causalRule: string;
};

export type PublicFeedbackDetail = {
  currentStatus: string;
  interpretation: string;
  outputFeedback: string;
  outcomeFeedback: string;
  causalReview: string;
  dataGaps: string[];
};

export type PublicReviewDetail = {
  impactPaths: PublicImpactPathDetail[];
  impactDomains: Array<{ domain: string; relevance: string[]; assessment: string }>;
  calculations: PublicCalculationRequirement[];
  risks: PublicRiskDetail[];
  boundaries: PublicBoundaryDetail[];
  counterfactuals: PublicCounterfactualDetail[];
  counterarguments: string[];
  feedback?: PublicFeedbackDetail;
};

/**
 * The complete, approved review payload. It is rendered as a dedicated
 * navigable Fachakte in addition to the orientation views. Keeping this
 * source-bound record prevents the overview layer from becoming the only
 * public representation of a review.
 */
export type PublicFullReview = {
  result: Record<string, unknown>;
  sourceManifest: Array<Record<string, unknown>>;
  sourceHash: string;
  sourceDocumentHash: string;
  requiredContentPaths: string[];
  renderedContentPaths: string[];
  duplicateMappings: Array<{ sourcePath: string; renderedAt: string }>;
  unrenderedContentPaths: string[];
};

/** Plain-language statements approved with the analytical review. */
export type PublicEditorialSummary = {
  keyStatement: string;
  whatIsKnown?: string;
  whatIsNotYetKnown?: string;
  evidenceBoundary?: string;
  improvementOptions: string[];
};

/**
 * A public working act keeps the official decision, provisional impact logic
 * and remaining work distinct. Its detailed review is published progressively:
 * an understandable entry point first, then all approved public reasoning,
 * data gaps and boundaries – without asserting observed impact or a final
 * recommendation that the underlying evidence cannot support.
 */
export type PublicWorkingAct = {
  maturity: PublicMaturityStatus;
  scopeStatement: string;
  overallPotential: string;
  changeLevers: string[];
  risks: string[];
  dataGaps: string[];
  counterfactualQuestions: string[];
  editorialSummary?: PublicEditorialSummary;
  normativeMapping?: PublicNormativeMapping;
  reviewDetail?: PublicReviewDetail;
  fullReview?: PublicFullReview;
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
  publicWorkingAct?: PublicWorkingAct;
  publicAssessment?: PublicAssessment;
};

const dipApi: CaseSource = {
  title: "DIP API – technische Kurzdokumentation",
  publisher: "Deutscher Bundestag",
  url: "https://dip.bundestag.de/documents/informationsblatt_zur_dip_api.pdf",
  retrievedAt: "2026-08-14",
  note: "Methode und Datenzugang; noch keine fallbezogene Quelle."
};

export const editorialSeedCases: ParliamentaryCase[] = [
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
    title: "Parlamentsradar: amtliche Befüllung vorbereiten",
    plainTitle: "Noch keine freigegebene aktuelle Fallanalyse",
    kind: "RADAR",
    editorialStatus: "CONTENT_REQUIRED",
    materiality: "WATCH",
    parliamentaryStatus: "Noch nicht amtlich verifiziert – der DIP-Import wartet auf eine gültige technische Berechtigung",
    statusVerification: "STATUS_UNVERIFIED",
    nextEvent: null,
    lastUpdated: "2026-08-14",
    summary: "Ein aktueller realer Vorgang erscheint mit amtlichem Stand, geprüften Quellen und klar ausgewiesenem Prüfstatus.",
    whatIsDecided: "Der konkrete Entscheidungsgegenstand wird nach amtlichem Quellenabruf ergänzt.",
    analysisStatus: "Kein amtlicher Sachverhalt hinterlegt.",
    intendedGoal: "Ein fachlich belastbarer Radarhinweis statt automatisch erzeugter politischer Inhalte.",
    impactPath: ["Amtliche Daten abrufen.", "Vorgang und Fassung prüfen.", "Materialität begründen.", "Erst dann einen Radarhinweis veröffentlichen."],
    affectedGroups: [],
    questions: ["Welcher Vorgang ist amtlich belegt?", "Welche Fassung ist aktuell?", "Warum ist er wirkungsrelevant?"],
    sources: [dipApi],
    versionNote: "Keine Version veröffentlicht."
  },
  {
    slug: "historie-erster-rueckblick",
    title: "Historische Wirkungschecks: Auftaktfall auswählen",
    plainTitle: "Retrospektiven müssen damaliges und heutiges Wissen trennen",
    kind: "RETROSPECTIVE_CASE",
    editorialStatus: "CONTENT_REQUIRED",
    materiality: "MEDIUM",
    parliamentaryStatus: "Historischer Fall wird derzeit quellenbasiert aufgebaut",
    statusVerification: "STATUS_UNVERIFIED",
    nextEvent: null,
    lastUpdated: "2026-08-14",
    summary: "Die Retrospektivlogik ist angelegt. Vor Veröffentlichung wird ein amtlich belegter Fall mit damaliger Quellenlage, späteren Beobachtungen und klaren Kausalitätsgrenzen kuratiert.",
    whatIsDecided: "Der konkrete historische Entscheidungsgegenstand wird nach Quellenprüfung ergänzt.",
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

/**
 * Static, deliberately limited public projection generated from protected
 * review imports. Raw records and candidate sources are never imported here.
 */
export const parliamentaryCases: ParliamentaryCase[] = [...generatedWorkingActs as ParliamentaryCase[], ...editorialSeedCases];
