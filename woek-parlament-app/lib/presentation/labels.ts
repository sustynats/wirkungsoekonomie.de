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
  OBSERVATION_ONLY: "Beobachtung ohne Zurechnung",
  PLAUSIBLE_CONTRIBUTION: "plausibler Beitrag",
  PARTIAL_ATTRIBUTION: "teilweise Zurechnung",
  CAUSAL_EVIDENCE: "kausale Evidenz",
  CONFLICTING_EVIDENCE: "widersprüchliche Evidenz",
  IMPACT_POTENTIAL_EX_ANTE: "Wirkungspotenzial vor der Entscheidung",
  IMPACT_REALITY_CHECK: "Wirkungsprüfung anhand beobachteter Entwicklung",
  PORTFOLIO_EX_ANTE: "Portfolioanalyse vor der Entscheidung",
  GOVERNMENT_DRAFT: "Regierungsentwurf",
  PROMULGATED: "verkündet",
  IN_FORCE: "in Kraft",
  PROPOSAL: "Vorschlag",
  SYSTEMIC: "systemische Wirkung",
  FIRST: "erste Ordnung",
  SECOND: "zweite Ordnung",
  THIRD: "dritte Ordnung",
  IMMEDIATE: "unmittelbar",
  SHORT: "kurzfristig",
  LONG: "langfristig",
  INTERGENERATIONAL: "generationenübergreifend",
  IMPLEMENTATION: "Umsetzung und Vollzug",
  OUTPUT: "unmittelbares Ergebnis",
  OUTCOME: "beobachtete Zustandsveränderung",
  DISTRIBUTION: "Verteilung",
  ATTRIBUTION: "Zurechnung",
  COUNTERFACTUAL: "Gegenfaktum",
  BASELINE: "Ausgangszustand",
  BOUNDARY: "Schutzgrenze",
  STRUCTURAL_CHANGE: "Strukturwandel",
  PATH_DEPENDENCE: "Pfadabhängigkeit",
  SYSTEM_RESILIENCE: "Systemresilienz",
  "Climate resource": "Klima und Ressourcen",
  "Structural change": "Strukturwandel",
  "Path dependence": "Pfadabhängigkeit",
  "System resilience": "Systemresilienz",
  NO_SINGLE_DIRECTION_ALLOWED: "Keine einheitliche Wirkungsrichtung zulässig",
  VERY_HIGH: "sehr hohe Prüfrelevanz",
  STANDARD_WOEK_ANALYSIS: "WÖk-Standardanalyse",
  NOT_ASSESSABLE: "nicht belastbar bewertbar",
  NOT_APPLICABLE: "nicht anwendbar",
  BACKFILL_REQUIRED: "fachliche Ergänzung erforderlich",
  LIMITED_FACH_RECORD: "begrenzte Fachakte",
  NOT_STRUCTURED: "nicht strukturiert",
  WATCH: "Beobachtung erforderlich",
  POSITIVE: "positives Wirkungspotenzial",
  NEGATIVE: "negatives Wirkungspotenzial",
  NEUTRAL: "begründet ohne materielle Richtungsänderung",
  HIGH: "hohe Evidenz",
  MEDIUM: "mittlere Evidenz",
  LOW: "geringe Evidenz",
  PASS: "bestanden",
  APPROVED: "freigegeben",
  FULL_SCHEMA_2_0_1: "WÖk-Vollschema 2.0.1",
  VERIFIED_FACH_RELEASE_COMPACT: "verifizierte kompakte Fachübergabe",
  COMPACT_SOURCE_PRESERVED_NO_SCHEMA_REPAIR: "kompakte Quelle unverändert erhalten; keine stillschweigende Schema-Reparatur",
  FULL_WOEK_ANALYSIS: "vollständige WÖk-Analyse",
  REALITY_CHECK: "Reality Check",
  APPROVED_FOR_PUBLIC_IMPORT: "für die öffentliche Integration fachlich freigegeben",
  reality_check_status: "Reality-Check-Status",
  record_profile: "Datensatzprofil",
  analysis_mode: "Analysemodus",
  publication_status: "Publikationsstatus",
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
  EU_SHARED_INTERNAL_MARKET_ENVIRONMENT_INDUSTRY: "Geteilte EU-Zuständigkeit - Binnenmarkt, Umwelt und Industrie",
  EU_SUPPORTING: "unterstützende EU-Zuständigkeit",
  MEMBER_STATE: "Zuständigkeit der Mitgliedstaaten",
  EU_COLEGISLATION: "Ordentliches Gesetzgebungsverfahren",
  MEMBER_STATE_PROCUREMENT_AND_PERMITTING: "Umsetzung durch die Mitgliedstaaten - insbesondere Beschaffung und Genehmigung",
  REQUIRES_COLEGISLATION: "Ordentliches Gesetzgebungsverfahren erforderlich",
  PASS_WITH_WATCH: "ohne festgestellte Grenzverletzung, weiter beobachten",
  "Analysis Mode": "Analysemodus",
  "Boundary Review": "Prüfung von Schutz- und Wirkungsgrenzen",
  BOUNDARY_STATUS: "Prüfung von Schutz- und Wirkungsgrenzen",
  BOUNDARY_REVIEW: "Prüfung der Schutz- und Wirkungsgrenzen",
};

const structuredFieldLabels: Record<string, string> = {
  competence_review: "Kompetenzprüfung",
  legal_and_rights_review: "Rechts- und Grundrechtsprüfung",
  mpd_mapping: "MPD-Zuordnung",
  sdg_mapping: "SDG-Zuordnung",
  sdg_plus_mapping: "SDG+-Zuordnung",
  structured_boundary_review: "Prüfung von Schutz- und Wirkungsgrenzen",
  structured_data_needs: "strukturierter Datenbedarf",
  structured_evidence_summary: "strukturierte Evidenzzusammenfassung",
};

const indicatorLabels: Record<string, string> = {
  low_carbon_material_share: "Anteil CO2-armer Materialien in der betroffenen Beschaffung",
  material_carbon_intensity: "Reale CO2-Intensität der eingesetzten Materialien",
  public_procurement_cost: "Kosten der öffentlichen Beschaffung / Total Cost of Ownership",
  eu_manufacturing_capacity: "Zusätzliche industrielle Produktionskapazität in der EU",
  supply_concentration: "Importkonzentration und Lieferkettenabhängigkeit",
  fdi_quality: "Qualität ausländischer Direktinvestitionen, einschließlich Wissens- und Technologietransfer",
  permit_duration_with_protection: "Genehmigungsdauer bei gleichbleibenden Schutzstandards"
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
  const exact = systemValueLabels[value];
  if (exact) return exact;
  const translated = Object.entries(systemValueLabels)
    .sort(([left], [right]) => right.length - left.length)
    .reduce(
      (label, [systemValue, publicLabel]) => label.replace(new RegExp(`\\b${systemValue}\\b`, "g"), publicLabel),
      value
    );
  return translated.replace(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g, (systemValue) => {
    const words = systemValue.toLocaleLowerCase("de-DE").replaceAll("_", " ");
    return `${words.charAt(0).toLocaleUpperCase("de-DE")}${words.slice(1)}`;
  }).replace(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g, (systemValue) => {
    const words = systemValue.replaceAll("_", " ");
    return `${words.charAt(0).toLocaleUpperCase("de-DE")}${words.slice(1)}`;
  });
}

export function publicIndicatorLabel(value: string) {
  return indicatorLabels[value] ?? humanizeSystemValue(value);
}

/** Internal schema keys may only reach public copy through an explicit,
 * reviewed label. Unknown keys stay suppressed instead of being title-cased. */
export function publicStructuredFieldLabel(value: string) {
  return structuredFieldLabels[value] ?? null;
}

/** Backtick spans in a released Markdown source are presentation syntax, not
 * public control-language. The source value remains unchanged; the renderer
 * only exposes a readable label/value clause. */
export function publicControlText(value: string) {
  return humanizeSystemValue(value).replace(/\s*=\s*/g, ": ");
}

export function isMarkdownSeparatorOnly(value: string) {
  return /^(?:---|\*\*\*|___)$/.test(value.trim());
}
