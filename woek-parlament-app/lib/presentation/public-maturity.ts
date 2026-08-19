import { publicIndicatorLabel, publicSystemValueLabel } from "@/lib/presentation/labels";
import { assessmentPublicCopyContains } from "@/lib/presentation/overview-assessment";

export type PublicMaturityStatus =
  | "ASSESSMENT_AVAILABLE_WITH_OPEN_POINTS"
  | "PARTIAL_EVIDENCE"
  | "EX_ANTE_POTENTIAL_ONLY"
  | "REALITY_CHECK_PENDING"
  | "ATTRIBUTION_OPEN"
  | "GOAL_REVIEW_PENDING"
  | "RECOMMENDATION_PENDING"
  | "OPERATIONALIZATION_PENDING"
  | "FACT_ONLY"
  | "FULL_ANALYSIS";

export type PublicMaturityLayer = {
  id: "problem" | "goal" | "impact" | "reality" | "recommendation" | "operationalization";
  label: string;
  status: "AVAILABLE" | "PENDING" | "OPEN";
  detail: string;
};

export type PublicMaturityProjection = {
  primary: PublicMaturityStatus;
  flags: PublicMaturityStatus[];
  label: string;
  compactHint: string;
  assessableNow: string[];
  openPoints: string[];
  layers: PublicMaturityLayer[];
};

type AssessmentText = {
  assessmentLabel: string;
  impactCoreSummary: string;
  editorialSummary: string;
  keyFinding: string;
  evidenceSummary: string;
  realityCheckSummary?: string;
};

type GovernmentMaturityInput = {
  impact_case_id: string;
  title: string;
  analysis_mode: string;
  publication_analysis_status: string;
  evidence_level: string;
  impact_core_summary: string;
  impact_summary: {
    strongest_positive_potential?: string;
    main_risk_or_tradeoff?: string;
    measurement_priority?: string;
  };
  missing_structured_fields: string[];
  competence_review_status: string;
  reality_check_status: string;
  reality_check_summary: string;
  recommendation_status: string;
  implementation_status: string;
  raw_record?: unknown;
};

type EuMaturityInput = {
  impact_case_id: string;
  title: string;
  analysis_mode: string;
  evidence_level: string;
  reality_check_status: string;
  key_indicators: string[];
  competence_scope: string;
  implementation_route: string[];
};

type ParliamentMaturityInput = {
  slug: string;
  plainTitle: string;
  publicWorkingAct?: {
    maturity: string;
    dataGaps: string[];
    counterfactualQuestions: string[];
    editorialSummary?: {
      whatIsKnown?: string;
      whatIsNotYetKnown?: string;
      evidenceBoundary?: string;
    };
    reviewDetail?: {
      feedback?: {
        currentStatus?: string;
        interpretation?: string;
      };
    };
  };
};

const labels: Record<PublicMaturityStatus, string> = {
  ASSESSMENT_AVAILABLE_WITH_OPEN_POINTS: "WÖk-Einordnung vorhanden – offene Prüfpunkte bleiben sichtbar",
  PARTIAL_EVIDENCE: "Einordnung mit noch unvollständiger Evidenz",
  EX_ANTE_POTENTIAL_ONLY: "Ex-ante-Einordnung – Wirkung noch nicht beobachtbar",
  REALITY_CHECK_PENDING: "Reality Check steht noch aus",
  ATTRIBUTION_OPEN: "Zurechnung noch offen",
  GOAL_REVIEW_PENDING: "WÖk-Zielprüfung noch offen",
  RECOMMENDATION_PENDING: "WÖk-Handlungsoption noch offen",
  OPERATIONALIZATION_PENDING: "Operationalisierung noch offen",
  FACT_ONLY: "Faktenakte – WÖk-Analyse noch nicht veröffentlicht",
  FULL_ANALYSIS: "Vollständige veröffentlichte WÖk-Analyse",
};

const structuredFieldLabels: Record<string, string> = {
  competence_review: "Kompetenzprüfung",
  legal_and_rights_review: "Rechts- und Grundrechtsprüfung",
  mpd_mapping: "Zuordnung zu Mensch, Planet und Demokratie",
  sdg_mapping: "SDG-Zuordnung",
  sdg_plus_mapping: "SDG+-Zuordnung",
  structured_boundary_review: "Prüfung der Schutz- und Wirkungsgrenzen",
  structured_data_needs: "strukturierter Datenbedarf",
  structured_evidence_summary: "strukturierte Evidenzzusammenfassung",
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function unique(values: Array<string | undefined>) {
  return [...new Set(values.map((value) => text(value)).filter(Boolean))];
}

function approvedLayer(raw: unknown, key: string) {
  const layer = record(record(raw)[key]);
  const status = text(layer.fach_status || layer.status || layer.publication_status);
  return ["APPROVED", "APPROVED_WITH_OPEN_DATA", "PUBLISHED"].includes(status);
}

function openCountHint(primary: PublicMaturityStatus, count: number) {
  if (primary === "FACT_ONLY") return "Faktenstand verfügbar; eine fehlende Analyse wird weder als neutral noch als wirkungslos behandelt.";
  if (primary === "FULL_ANALYSIS") return "Die veröffentlichten Prüfebenen sind vollständig; spätere Evidenz bleibt versionierbar.";
  if (primary === "EX_ANTE_POTENTIAL_ONLY") return `Ex ante: Wirkung noch nicht beobachtbar${count ? ` · ${count} konkrete ${count === 1 ? "Prüffrage" : "Prüffragen"} offen` : ""}.`;
  return `Bewertung möglich · ${count} konkrete ${count === 1 ? "Prüffrage" : "Prüffragen"} offen.`;
}

function isGenericMaturitySentence(value: string | undefined) {
  return /Wirkpfade und Risiken sind aus den vorliegenden amtlichen Quellen strukturiert|Die Akte ist in der ausgewiesenen Reifestufe öffentlich nutzbar/i.test(value ?? "");
}

function layer(id: PublicMaturityLayer["id"], label: string, status: PublicMaturityLayer["status"], detail: string): PublicMaturityLayer {
  return { id, label, status, detail };
}

export function governmentPublicMaturity(
  item: GovernmentMaturityInput,
  assessment: AssessmentText,
  options: {
    recommendationAvailable: boolean;
    operationalizationAvailable?: boolean;
    problemReviewAvailable?: boolean;
    goalReviewAvailable?: boolean;
  } = { recommendationAvailable: false },
): PublicMaturityProjection {
  if (item.publication_analysis_status === "NO_INDEPENDENT_EFFECT_OBJECT") {
    return factOnlyPublicMaturity(item.title, `Der veröffentlichte Sachverhalt zu „${item.title}“ ist als Lebenszyklus- oder Faktenobjekt dokumentiert.`);
  }

  const raw = record(item.raw_record);
  const dataNeeds = Array.isArray(raw.data_needs) ? raw.data_needs.map(record) : [];
  const goalAvailable = options.goalReviewAvailable ?? approvedLayer(raw, "goal_review");
  const problemAvailable = options.problemReviewAvailable ?? approvedLayer(raw, "problem_review");
  const realityPending = item.reality_check_status === "NOT_YET_OBSERVABLE" || item.reality_check_status === "OPEN" || !item.reality_check_status;
  const attribution = text(record(raw.reality_check).attribution);
  const attributionOpen = realityPending || !attribution || /offen|nicht belegt|keine zurechnung/i.test(attribution);
  const recommendationAvailable = options.recommendationAvailable || item.recommendation_status === "APPROVED";
  const operationalizationAvailable = Boolean(options.operationalizationAvailable);
  const partialEvidence = item.evidence_level === "LOW" || item.evidence_level === "NOT_ASSESSABLE" || item.missing_structured_fields.includes("structured_evidence_summary");

  const flags = unique([
    partialEvidence ? "PARTIAL_EVIDENCE" : undefined,
    item.analysis_mode === "IMPACT_POTENTIAL_EX_ANTE" ? "EX_ANTE_POTENTIAL_ONLY" : undefined,
    realityPending ? "REALITY_CHECK_PENDING" : undefined,
    attributionOpen ? "ATTRIBUTION_OPEN" : undefined,
    !goalAvailable ? "GOAL_REVIEW_PENDING" : undefined,
    !recommendationAvailable ? "RECOMMENDATION_PENDING" : undefined,
    !operationalizationAvailable ? "OPERATIONALIZATION_PENDING" : undefined,
  ]) as PublicMaturityStatus[];

  const missingFields = item.missing_structured_fields
    .map((field) => structuredFieldLabels[field])
    .filter((value): value is string => Boolean(value));
  const openPoints = unique([
    ...missingFields.map((field) => `Für „${item.title}“ liegt die ${field} noch nicht als fachlich freigegebene strukturierte Prüfebene vor.`),
    item.competence_review_status !== "REVIEWED_CONCRETE" && !missingFields.includes("Kompetenzprüfung")
      ? `Die Kompetenzprüfung für „${item.title}“ ist noch nicht abschließend strukturiert veröffentlicht.`
      : undefined,
    realityPending ? `${assessment.realityCheckSummary || item.reality_check_summary} Die erwarteten Zustandsänderungen von „${item.title}“ sind damit noch nicht ex post belegt.` : undefined,
    attributionOpen ? `Wie viel einer späteren Zustandsänderung „${item.title}“ zugerechnet werden kann, ist ohne belastbares Gegenfaktum noch offen.` : undefined,
    !problemAvailable ? `Eine fachlich freigegebene WÖk-Problemprüfung für „${item.title}“ liegt noch nicht als eigener Layer vor.` : undefined,
    !goalAvailable ? `Eine fachlich freigegebene WÖk-Zielprüfung mit Zielhierarchie für „${item.title}“ liegt noch nicht als eigener Layer vor.` : undefined,
    !recommendationAvailable ? `Die WÖk-Handlungsoption zu „${item.title}“ ist noch nicht fachlich freigegeben.` : undefined,
    !operationalizationAvailable ? `Ein fachlich freigegebenes WÖk-Inspirations- oder Operationalisierungsmodell ist mit „${item.title}“ noch nicht verknüpft.` : undefined,
    ...dataNeeds.slice(0, 3).map((need) => {
      const question = text(need.question);
      const data = text(need.data);
      return question || data ? `Offener Datenbedarf für „${item.title}“: ${question || data}` : "";
    }),
    !dataNeeds.length && item.impact_summary.measurement_priority
      ? `Für den Reality Check zu „${item.title}“ ist noch zu messen: ${item.impact_summary.measurement_priority}`
      : undefined,
  ]);

  const assessableNow = unique([
    item.impact_summary.strongest_positive_potential && !assessmentPublicCopyContains(assessment, item.impact_summary.strongest_positive_potential)
      ? `Wichtigstes positives Potenzial: ${item.impact_summary.strongest_positive_potential}`
      : undefined,
    item.impact_summary.main_risk_or_tradeoff && !assessmentPublicCopyContains(assessment, item.impact_summary.main_risk_or_tradeoff)
      ? `Wichtigstes materielles Risiko oder Zielkonflikt: ${item.impact_summary.main_risk_or_tradeoff}`
      : undefined,
  ]);
  const primary: PublicMaturityStatus = openPoints.length ? "ASSESSMENT_AVAILABLE_WITH_OPEN_POINTS" : "FULL_ANALYSIS";

  return {
    primary,
    flags,
    label: labels[primary],
    compactHint: openCountHint(primary, openPoints.length),
    assessableNow,
    openPoints,
    layers: [
      layer("problem", "WÖk-Problemprüfung", problemAvailable ? "AVAILABLE" : "PENDING", problemAvailable ? "Fachlich freigegeben." : `Für „${item.title}“ noch nicht als eigener Fachlayer freigegeben.`),
      layer("goal", "WÖk-Zielprüfung und Zielhierarchie", goalAvailable ? "AVAILABLE" : "PENDING", goalAvailable ? "Fachlich freigegeben." : `Für „${item.title}“ noch nicht als eigener Fachlayer freigegeben.`),
      layer("impact", "Wirkungspotenzial und Wirkungsrisiken", "AVAILABLE", "Fachlich freigegebene, fallbezogene Einordnung vorhanden."),
      layer("reality", "Beobachtung und Reality Check", realityPending ? "PENDING" : "AVAILABLE", assessment.realityCheckSummary || item.reality_check_summary),
      layer("recommendation", "WÖk-Handlungsoption", recommendationAvailable ? "AVAILABLE" : "PENDING", recommendationAvailable ? "Fachlich freigegebene Fassung der WÖk-Handlungsoption vorhanden." : `Für „${item.title}“ noch nicht fachlich freigegeben.`),
      layer("operationalization", "WÖk-Inspirations- und Operationalisierungsmodell", operationalizationAvailable ? "AVAILABLE" : "PENDING", operationalizationAvailable ? "Fachlich freigegebenes Modell verknüpft." : `Für „${item.title}“ ist kein freigegebenes Modell verknüpft.`),
    ],
  };
}

export function euPublicMaturity(
  item: EuMaturityInput,
  assessment: AssessmentText,
  options: { recommendationAvailable?: boolean; operationalizationAvailable?: boolean; problemReviewAvailable?: boolean; goalReviewAvailable?: boolean } = {},
): PublicMaturityProjection {
  const isExAnte = item.analysis_mode.includes("EX_ANTE");
  const realityPending = item.reality_check_status === "NOT_YET_OBSERVABLE" || item.reality_check_status === "OPEN";
  const partialEvidence = item.evidence_level === "LOW" || item.evidence_level === "NOT_ASSESSABLE";
  const recommendationAvailable = Boolean(options.recommendationAvailable);
  const operationalizationAvailable = Boolean(options.operationalizationAvailable);
  const problemReviewAvailable = Boolean(options.problemReviewAvailable);
  const goalReviewAvailable = Boolean(options.goalReviewAvailable);
  const publicIndicators = item.key_indicators.map(publicIndicatorLabel).filter((value): value is string => Boolean(value));
  const missingIndicatorLabels = item.key_indicators.length - publicIndicators.length;
  const publicCompetence = publicSystemValueLabel(item.competence_scope);
  const publicImplementationRoutes = item.implementation_route.map(publicSystemValueLabel).filter((value): value is string => Boolean(value));
  const competenceLabelsComplete = Boolean(publicCompetence) && publicImplementationRoutes.length === item.implementation_route.length;
  const competenceSummary = competenceLabelsComplete
    ? `Kompetenz- und Umsetzungsrahmen: ${[publicCompetence, ...publicImplementationRoutes].filter(Boolean).join("; ")}`
    : undefined;
  const flags = unique([
    partialEvidence ? "PARTIAL_EVIDENCE" : undefined,
    isExAnte ? "EX_ANTE_POTENTIAL_ONLY" : undefined,
    realityPending ? "REALITY_CHECK_PENDING" : undefined,
    realityPending ? "ATTRIBUTION_OPEN" : undefined,
    !goalReviewAvailable ? "GOAL_REVIEW_PENDING" : undefined,
    !recommendationAvailable ? "RECOMMENDATION_PENDING" : undefined,
    !operationalizationAvailable ? "OPERATIONALIZATION_PENDING" : undefined,
  ]) as PublicMaturityStatus[];
  const openPoints = unique([
    realityPending ? `${assessment.realityCheckSummary} Für „${item.title}“ liegt damit noch keine beobachtete Netto-Wirkung vor.` : undefined,
    realityPending ? `Eine spätere Zustandsänderung kann „${item.title}“ derzeit nicht kausal zugerechnet werden.` : undefined,
    partialEvidence && publicIndicators.length
      ? `Die Evidenz für „${item.title}“ ist teilweise oder noch nicht belastbar bewertbar; insbesondere fehlen reife Werte zu ${publicIndicators.slice(0, 3).join(", ")}.`
      : partialEvidence ? `Die Evidenz für „${item.title}“ ist teilweise oder noch nicht belastbar bewertbar; fallbezogene Messgrößen bleiben fachlich zu prüfen.` : undefined,
    missingIndicatorLabels > 0 ? `Für ${missingIndicatorLabels} fachlich benannte ${missingIndicatorLabels === 1 ? "Messgröße fehlt" : "Messgrößen fehlen"} noch eine freigegebene öffentliche Bezeichnung.` : undefined,
    !competenceLabelsComplete ? "Für mindestens einen Wert des Kompetenz- und Umsetzungsrahmens fehlt noch eine freigegebene öffentliche Bezeichnung." : undefined,
    !problemReviewAvailable ? `Eine eigenständige fachlich freigegebene WÖk-Problemprüfung für „${item.title}“ ist noch nicht veröffentlicht.` : undefined,
    !goalReviewAvailable ? `Eine eigenständige WÖk-Zielprüfung mit Zielhierarchie für „${item.title}“ ist noch nicht veröffentlicht.` : undefined,
    !recommendationAvailable ? `Eine WÖk-Handlungsoption für „${item.title}“ ist noch nicht fachlich freigegeben.` : undefined,
    !operationalizationAvailable ? `Ein fachlich freigegebenes WÖk-Inspirations- oder Operationalisierungsmodell ist mit „${item.title}“ noch nicht verknüpft.` : undefined,
  ]);
  const primary: PublicMaturityStatus = isExAnte ? "EX_ANTE_POTENTIAL_ONLY" : openPoints.length ? "ASSESSMENT_AVAILABLE_WITH_OPEN_POINTS" : "FULL_ANALYSIS";
  return {
    primary,
    flags,
    label: labels[primary],
    compactHint: openCountHint(primary, openPoints.length),
    assessableNow: unique([
      competenceSummary,
    ]),
    openPoints,
    layers: [
      layer("problem", "WÖk-Problemprüfung", problemReviewAvailable ? "AVAILABLE" : "PENDING", problemReviewAvailable ? "Fachlich geprüft; offene Beurteilungen bleiben ausdrücklich sichtbar." : `Für „${item.title}“ noch nicht als eigener Fachlayer freigegeben.`),
      layer("goal", "WÖk-Zielprüfung und Zielhierarchie", goalReviewAvailable ? "AVAILABLE" : "PENDING", goalReviewAvailable ? "Fachlich geprüft; offene Beurteilungen bleiben ausdrücklich sichtbar." : `Für „${item.title}“ noch nicht als eigener Fachlayer freigegeben.`),
      layer("impact", "Wirkungspotenzial und Wirkungsrisiken", "AVAILABLE", "Fachlich freigegebene, fallbezogene Einordnung vorhanden."),
      layer("reality", "Beobachtung und Reality Check", realityPending ? "PENDING" : "AVAILABLE", assessment.realityCheckSummary || labels.REALITY_CHECK_PENDING),
      layer("recommendation", "WÖk-Handlungsoption", recommendationAvailable ? "AVAILABLE" : "PENDING", recommendationAvailable ? "Fachlich freigegeben." : `Für „${item.title}“ noch nicht fachlich freigegeben.`),
      layer("operationalization", "WÖk-Inspirations- und Operationalisierungsmodell", operationalizationAvailable ? "AVAILABLE" : "PENDING", operationalizationAvailable ? "Fachlich freigegebenes Modell verknüpft." : `Für „${item.title}“ ist kein freigegebenes Modell verknüpft.`),
    ],
  };
}

export function parliamentPublicMaturity(
  item: ParliamentMaturityInput,
  assessment: AssessmentText | null,
  options: { problemReviewAvailable?: boolean; goalReviewAvailable?: boolean; recommendationAvailable?: boolean } = {},
): PublicMaturityProjection {
  if (!assessment || !item.publicWorkingAct) {
    return factOnlyPublicMaturity(item.plainTitle, `Der veröffentlichte parlamentarische Sachverhalt zu „${item.plainTitle}“ bleibt als Faktenakte zugänglich.`);
  }
  const workingAct = item.publicWorkingAct;
  const problemReviewAvailable = Boolean(options.problemReviewAvailable);
  const goalReviewAvailable = Boolean(options.goalReviewAvailable);
  const recommendationAvailable = Boolean(options.recommendationAvailable);
  const feedback = workingAct.reviewDetail?.feedback;
  const realityAvailable = Boolean(feedback?.interpretation && !/offen|noch nicht|vor der entscheidung/i.test(feedback.interpretation));
  const openPoints = unique([
    workingAct.editorialSummary?.whatIsNotYetKnown && !isGenericMaturitySentence(workingAct.editorialSummary.whatIsNotYetKnown) ? `Für „${item.plainTitle}“ noch offen: ${workingAct.editorialSummary.whatIsNotYetKnown}` : undefined,
    workingAct.editorialSummary?.evidenceBoundary && !isGenericMaturitySentence(workingAct.editorialSummary.evidenceBoundary) ? `Aussagegrenze für „${item.plainTitle}“: ${workingAct.editorialSummary.evidenceBoundary}` : undefined,
    ...workingAct.dataGaps.slice(0, 4).map((gap) => `Offener Datenbedarf für „${item.plainTitle}“: ${gap}`),
    !realityAvailable ? `Für „${item.plainTitle}“ ist noch keine fachlich freigegebene ex-post Wirkungsbeobachtung veröffentlicht.` : undefined,
    workingAct.counterfactualQuestions[0] ? `Die Zurechnung bleibt offen, bis diese Vergleichsfrage beantwortet ist: ${workingAct.counterfactualQuestions[0]}` : undefined,
    !problemReviewAvailable ? `Eine eigenständige WÖk-Problemprüfung für „${item.plainTitle}“ ist noch nicht als freigegebener Layer veröffentlicht.` : undefined,
    !goalReviewAvailable ? `Eine eigenständige WÖk-Zielprüfung mit Zielhierarchie für „${item.plainTitle}“ ist noch nicht als freigegebener Layer veröffentlicht.` : undefined,
    !recommendationAvailable ? `Eine WÖk-Handlungsoption für „${item.plainTitle}“ ist noch nicht als freigegebene Fassung veröffentlicht.` : undefined,
    `Ein WÖk-Inspirations- oder Operationalisierungsmodell ist mit „${item.plainTitle}“ noch nicht fachlich freigegeben verknüpft.`,
  ]);
  const flags = unique([
    "EX_ANTE_POTENTIAL_ONLY",
    !realityAvailable ? "REALITY_CHECK_PENDING" : undefined,
    !realityAvailable ? "ATTRIBUTION_OPEN" : undefined,
    !goalReviewAvailable ? "GOAL_REVIEW_PENDING" : undefined,
    !recommendationAvailable ? "RECOMMENDATION_PENDING" : undefined,
    "OPERATIONALIZATION_PENDING",
    workingAct.dataGaps.length ? "PARTIAL_EVIDENCE" : undefined,
  ]) as PublicMaturityStatus[];
  const primary: PublicMaturityStatus = "EX_ANTE_POTENTIAL_ONLY";
  return {
    primary,
    flags,
    label: labels[primary],
    compactHint: openCountHint(primary, openPoints.length),
    assessableNow: unique([
      workingAct.editorialSummary?.whatIsKnown && !isGenericMaturitySentence(workingAct.editorialSummary.whatIsKnown) && !assessmentPublicCopyContains(assessment, workingAct.editorialSummary.whatIsKnown)
        ? `Bereits beurteilt: ${workingAct.editorialSummary.whatIsKnown}`
        : undefined,
    ]),
    openPoints,
    layers: [
      layer("problem", "WÖk-Problemprüfung", problemReviewAvailable ? "AVAILABLE" : "PENDING", problemReviewAvailable ? "Fachlich geprüft; offene Beurteilungen bleiben ausdrücklich sichtbar." : `Für „${item.plainTitle}“ noch nicht als eigener Fachlayer freigegeben.`),
      layer("goal", "WÖk-Zielprüfung und Zielhierarchie", goalReviewAvailable ? "AVAILABLE" : "PENDING", goalReviewAvailable ? "Fachlich geprüft; offene Beurteilungen bleiben ausdrücklich sichtbar." : `Für „${item.plainTitle}“ noch nicht als eigener Fachlayer freigegeben.`),
      layer("impact", "Wirkungspotenzial und Wirkungsrisiken", "AVAILABLE", "Fachlich freigegebene, fallbezogene Einordnung vorhanden."),
      layer("reality", "Beobachtung und Reality Check", realityAvailable ? "AVAILABLE" : "PENDING", assessment.realityCheckSummary || labels.REALITY_CHECK_PENDING),
      layer("recommendation", "WÖk-Handlungsoption", recommendationAvailable ? "AVAILABLE" : "PENDING", recommendationAvailable ? "Fachlich freigegeben." : `Für „${item.plainTitle}“ noch nicht als eigene Fassung freigegeben.`),
      layer("operationalization", "WÖk-Inspirations- und Operationalisierungsmodell", "PENDING", `Für „${item.plainTitle}“ ist kein freigegebenes Modell verknüpft.`),
    ],
  };
}

export function factOnlyPublicMaturity(subject: string, factStatement?: string): PublicMaturityProjection {
  const primary: PublicMaturityStatus = "FACT_ONLY";
  const openPoint = `Für „${subject}“ ist noch keine fachlich freigegebene WÖk-Wirkungsanalyse veröffentlicht; daraus folgt weder Neutralität noch Wirkungslosigkeit.`;
  return {
    primary,
    flags: ["FACT_ONLY", "GOAL_REVIEW_PENDING", "RECOMMENDATION_PENDING"],
    label: labels[primary],
    compactHint: `Zu „${subject}“ ist der Faktenstand verfügbar; eine fehlende Analyse wird weder als neutral noch als wirkungslos behandelt.`,
    assessableNow: [factStatement || `Die öffentlich dokumentierten Fakten zu „${subject}“ bleiben als Sachverhalt zugänglich.`],
    openPoints: [openPoint],
    layers: [
      layer("problem", "WÖk-Problemprüfung", "PENDING", `Für „${subject}“ noch nicht fachlich freigegeben.`),
      layer("goal", "WÖk-Zielprüfung und Zielhierarchie", "PENDING", `Für „${subject}“ noch nicht fachlich freigegeben.`),
      layer("impact", "Wirkungspotenzial und Wirkungsrisiken", "OPEN", openPoint),
      layer("reality", "Beobachtung und Reality Check", "PENDING", `Ohne freigegebenen Wirkungsgegenstand nicht ableitbar.`),
      layer("recommendation", "WÖk-Handlungsoption", "PENDING", `Für „${subject}“ nicht fachlich freigegeben.`),
      layer("operationalization", "WÖk-Inspirations- und Operationalisierungsmodell", "PENDING", `Für „${subject}“ nicht fachlich freigegeben.`),
    ],
  };
}

export function publishedDossierPublicMaturity(subject: string, publishedScope: string): PublicMaturityProjection {
  const openPoint = `Für „${subject}“ ist noch keine fachlich freigegebene strukturierte Executive-WÖk-Kurzbewertung veröffentlicht; der vorhandene Dossierstand wird deshalb nicht zu einer Richtung oder Netto-Wirkung verdichtet.`;
  return {
    primary: "PARTIAL_EVIDENCE",
    flags: ["PARTIAL_EVIDENCE", "REALITY_CHECK_PENDING", "ATTRIBUTION_OPEN", "GOAL_REVIEW_PENDING", "RECOMMENDATION_PENDING", "OPERATIONALIZATION_PENDING"],
    label: "Fachlicher Dossierstand vorhanden – Executive-Einordnung noch offen",
    compactHint: `Der veröffentlichte Dossierstand zu „${subject}“ bleibt nutzbar; offene Prüfebenen werden nicht mit Fülltext ersetzt.`,
    assessableNow: [publishedScope],
    openPoints: [openPoint],
    layers: [
      layer("problem", "WÖk-Problemprüfung", "OPEN", `Für „${subject}“ nicht als eigener freigegebener Layer ausgewiesen.`),
      layer("goal", "WÖk-Zielprüfung und Zielhierarchie", "PENDING", `Für „${subject}“ noch nicht als eigener Fachlayer freigegeben.`),
      layer("impact", "Wirkungspotenzial und Wirkungsrisiken", "OPEN", openPoint),
      layer("reality", "Beobachtung und Reality Check", "PENDING", `Für „${subject}“ noch nicht als freigegebener Reality Check veröffentlicht.`),
      layer("recommendation", "WÖk-Handlungsoption", "PENDING", `Für „${subject}“ noch nicht fachlich freigegeben.`),
      layer("operationalization", "WÖk-Inspirations- und Operationalisierungsmodell", "PENDING", `Für „${subject}“ noch nicht fachlich freigegeben.`),
    ],
  };
}

export function assessmentOnlyPublicMaturity(subject: string, assessment: AssessmentText): PublicMaturityProjection {
  const openPoints = [
    `Die WÖk-Problemprüfung für „${subject}“ liegt in dieser Vorschau noch nicht als eigener freigegebener Layer vor.`,
    `Die WÖk-Zielprüfung mit Zielhierarchie für „${subject}“ liegt in dieser Vorschau noch nicht als eigener freigegebener Layer vor.`,
    `Ein getrennt freigegebener Reality Check und eine belastbare Zurechnung für „${subject}“ sind in dieser Vorschau noch nicht ausgewiesen.`,
    `Eine WÖk-Handlungsoption und ein Inspirations- oder Operationalisierungsmodell für „${subject}“ sind in dieser Vorschau noch nicht fachlich freigegeben.`,
  ];
  const primary: PublicMaturityStatus = "ASSESSMENT_AVAILABLE_WITH_OPEN_POINTS";
  return {
    primary,
    flags: ["REALITY_CHECK_PENDING", "ATTRIBUTION_OPEN", "GOAL_REVIEW_PENDING", "RECOMMENDATION_PENDING", "OPERATIONALIZATION_PENDING"],
    label: labels[primary],
    compactHint: openCountHint(primary, openPoints.length),
    assessableNow: [],
    openPoints,
    layers: [
      layer("problem", "WÖk-Problemprüfung", "PENDING", `Für „${subject}“ in dieser Vorschau nicht als eigener Fachlayer ausgewiesen.`),
      layer("goal", "WÖk-Zielprüfung und Zielhierarchie", "PENDING", `Für „${subject}“ in dieser Vorschau nicht als eigener Fachlayer ausgewiesen.`),
      layer("impact", "Wirkungspotenzial und Wirkungsrisiken", "AVAILABLE", "Fachlich freigegebene, fallbezogene Einordnung vorhanden."),
      layer("reality", "Beobachtung und Reality Check", "PENDING", assessment.realityCheckSummary || `Für „${subject}“ in dieser Vorschau noch nicht ausgewiesen.`),
      layer("recommendation", "WÖk-Handlungsoption", "PENDING", `Für „${subject}“ in dieser Vorschau noch nicht freigegeben.`),
      layer("operationalization", "WÖk-Inspirations- und Operationalisierungsmodell", "PENDING", `Für „${subject}“ in dieser Vorschau noch nicht freigegeben.`),
    ],
  };
}

export function publicMaturityLabel(status: PublicMaturityStatus) {
  return labels[status];
}
