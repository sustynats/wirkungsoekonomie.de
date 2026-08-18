import type { CaseKind, EditorialStatus, Materiality, ParliamentaryCase } from "@/data/cases";

const caseKindLabels: Record<CaseKind, string> = {
  RADAR: "Parlamentsradar",
  IMPACT_BRIEF: "Wirkungsbrief",
  FULL_CHECK: "Vollständiger Wirkungscheck",
  RETROSPECTIVE_CASE: "Historischer Wirkungscheck"
};

const editorialStatusLabels: Record<EditorialStatus, string> = {
  DEMONSTRATOR: "Demonstrator",
  CONTENT_REQUIRED: "Fachliche Prüfung steht noch aus",
  PREPARATION_PUBLISHED: "Amtlich vorbereitet – Fachprüfung läuft",
  WORKING_ACT_PUBLISHED: "Wirkungsakte veröffentlicht – Datenlücken und nächster Prüfschritt sind ausgewiesen",
  PUBLISHED: "Fachlich veröffentlicht"
};

const materialityLabels: Record<Materiality, string> = {
  VERY_HIGH: "sehr hohe Prüfrelevanz",
  HIGH: "hohe Prüfrelevanz",
  MEDIUM: "mittlere Prüfrelevanz",
  WATCH: "beobachten"
};

const verificationLabels: Record<ParliamentaryCase["statusVerification"], string> = {
  VERIFIED: "amtliche Quelle geprüft",
  EDITORIAL_DEMONSTRATOR: "Demonstrator",
  STATUS_UNVERIFIED: "noch ohne veröffentlichte Fallquelle"
};

const systemValueLabels: Record<string, string> = {
  "DECISION_CONTEXT_SOURCE_ONLY; ANALYTICAL_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION": "amtliche Ausgangslage belegt; Wirkannahme muss noch geprüft werden",
  "OFFICIAL_PROPOSAL_SOURCE; EX_ANTE_CAUSAL_HYPOTHESIS_REQUIRES_VALIDATION": "amtliche Vorlage belegt; Wirkannahme muss noch geprüft werden",
  MATERIAL: "Wesentlich",
  INDIRECT: "indirekt betroffen",
  NOT_MATERIAL_IDENTIFIED: "keine materielle Betroffenheit festgestellt",
  EVIDENCE_OPEN: "Evidenz offen",
  DATA_GAP: "Datenlücke",
  DATA_GAP_OR_NOT_YET_OBSERVABLE: "Datenlücke oder noch nicht beobachtbar",
  SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS: "quellengebundene Annahme vor der Entscheidung",
  CAUSAL_HYPOTHESIS_EX_ANTE: "Wirkannahme vor der Entscheidung",
  EX_ANTE_ONLY: "nur vor der Entscheidung beurteilbar",
  MUST_BE_TESTED: "muss vor der Einordnung geprüft werden",
  TO_BE_TESTED: "wird noch geprüft",
  REQUIRED_NOT_ESTABLISHED: "erforderlich, aber noch nicht belegt",
  FINAL_DECISION: "endgültige Entscheidung",
  PRELIMINARY_REVIEW: "Prüfung vor der Entscheidung",
  EVIDENCE_REVIEW: "Evidenzprüfung",
  MONITORING: "Beobachtung und Rückkopplung",
  PROVISIONAL: "vorläufige Einordnung",
  ON_TRACK: "Wie erwartet",
  MIXED: "gemischte Entwicklung",
  OFF_TRACK: "Weicht ab",
  NOT_YET_OBSERVABLE: "Noch nicht beobachtbar",
  BOUNDARY_RISK: "Grenzwertrisiko",
  STATUS_UNVERIFIED: "noch nicht amtlich verifiziert",
  CONTENT_REQUIRED: "fachliche Befüllung erforderlich",
  EDITORIAL_DEMONSTRATOR: "redaktioneller Demonstrator",
  NOT_STARTED: "noch nicht begonnen",
  READY_FOR_APPROVAL: "zur Freigabe vorbereitet",
  RULE_BASED_ASSESSMENT: "regelbasiert eingeordnet",
  QUANTIFIED_EXPECTED_EFFECT: "Wirkungspotenzial quantifiziert",
  QUANTIFIED_OBSERVED_EFFECT: "beobachtete Wirkung quantifiziert",
  NO_ROBUST_RETROSPECTIVE_ASSESSMENT: "keine belastbare Rückschau möglich",
  DECISION_CONFIRMED: "Entscheidung bestätigt",
  DECISION_MOSTLY_CONFIRMED: "Entscheidung überwiegend bestätigt",
  JUSTIFIABLE_AT_TIME_NOT_CONFIRMED_EX_POST: "damals vertretbar, heute nicht bestätigt",
  ALTERNATIVE_PREFERABLE: "Alternative vorzugswürdig",
  POSITIVE_POTENTIAL: "Positives Wirkungspotenzial",
  NEGATIVE_RISK: "Materielles Wirkungsrisiko",
  AMBIVALENT: "Gegenläufige Wirkungsrichtungen",
  "OPEN-not-neutral": "Offen ist nicht neutral",
  OPEN: "Wirkungseinordnung noch offen",
  PORTFOLIO_DISAGGREGATION_REQUIRED: "Wirkung nur auf Ebene der Einzelmaßnahmen belastbar bewertbar",
  NO_ROBUST_OVERALL_DIRECTION: "Keine belastbare einheitliche Wirkungsrichtung",
  POSITIVES_WIRKUNGSPOTENZIAL: "Positives Wirkungspotenzial",
  UEBERWIEGEND_POSITIVES_WIRKUNGSPOTENZIAL: "Überwiegend positives Wirkungspotenzial",
  AMBIVALENTES_WIRKUNGSPOTENZIAL: "Gegenläufige Wirkungspotenziale und Risiken",
  EU_EXCLUSIVE: "ausschließliche EU-Zuständigkeit",
  EU_SHARED: "geteilte EU-Zuständigkeit",
  EU_SUPPORTING: "unterstützende EU-Zuständigkeit",
  MEMBER_STATE: "Zuständigkeit der Mitgliedstaaten",
  PASS_WITH_WATCH: "ohne festgestellte Grenzverletzung, weiter beobachten"
};

export function caseKindLabel(value: CaseKind) {
  return caseKindLabels[value];
}

export function editorialStatusLabel(value: EditorialStatus) {
  return editorialStatusLabels[value];
}

export function materialityLabel(value: Materiality) {
  return materialityLabels[value];
}

export function verificationLabel(value: ParliamentaryCase["statusVerification"]) {
  return verificationLabels[value];
}

/**
 * API and database values are deliberately kept separate from public copy.
 * This replaces known system codes even when they occur inside a longer,
 * explanatory sentence received from an import.
 */
export function humanizeSystemValue(value: string) {
  const translated = Object.entries(systemValueLabels).reduce(
    (label, [systemValue, publicLabel]) => label.replaceAll(systemValue, publicLabel),
    value
  );
  return translated.replace(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g, (systemValue) => {
    const words = systemValue.toLocaleLowerCase("de-DE").replaceAll("_", " ");
    return `${words.charAt(0).toLocaleUpperCase("de-DE")}${words.slice(1)}`;
  });
}
