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
  LEGAL_ACT_AND_POLICY_DESIGN: "Rechtsakt und politische Ausgestaltung",
  MECHANISM_AND_SCOPE_BASELINE: "Ausgangslage für Wirkmechanismus und Regelungsumfang",
  NOT_OUTCOME_ATTRIBUTION: "kein Nachweis beobachteter oder zurechenbarer Wirkung",
  POLICY_DESIGN: "politische Ausgestaltung",
  MARKET_MECHANISM_REFERENCE: "Referenz für den Marktmechanismus",
  EARLY_CONTEXT_OBSERVATION: "frühe Kontextbeobachtung",
  NOT_CAUSAL_ATTRIBUTION: "keine kausale Zurechnung",
  STRATEGY_AND_IMPLEMENTATION_DESIGN: "Strategie und Umsetzungsarchitektur",
  CAPACITY_MECHANISM_BASELINE: "Ausgangslage für den Kapazitätsmechanismus",
  NOT_AVOIDED_DAMAGE_PROOF: "kein Nachweis vermiedener Schäden",
  LEGISLATIVE_PROPOSAL_AND_POLICY_DESIGN: "Gesetzgebungsvorschlag und politische Ausgestaltung",
  SUPPLY_RESILIENCE_MECHANISM: "Mechanismus der Versorgungsresilienz",
  NOT_SHORTAGE_OUTCOME_PROOF: "kein Nachweis verringerter Versorgungsengpässe",
  SECURITY_STRATEGY_AND_GOVERNANCE_DESIGN: "Sicherheitsstrategie und Governance-Architektur",
  COORDINATION_MECHANISM: "Koordinationsmechanismus",
  FUNDAMENTAL_RIGHTS_RISK_REFERENCE: "Referenz für Grundrechtsrisiken",
  NOT_SECURITY_OUTCOME_ATTRIBUTION: "keine Zurechnung einer beobachteten Sicherheitswirkung",
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
  PARLIAMENTARY_PROCESS: "parlamentarisches Verfahren",
  AUCTION_OPEN: "Ausschreibung geöffnet",
  BUNDESTAG_ADOPTED: "vom Bundestag beschlossen",
  BUNDESTAG_ADOPTED_ROLLOUT_PLANNED_2027: "vom Bundestag beschlossen; Einführung für 2027 vorgesehen",
  BUNDESTAG_AND_BUNDESRAT_PASSED_EFFECTS_MAINLY_FROM_2027: "von Bundestag und Bundesrat beschlossen; wesentliche Änderungen ab 2027",
  CABINET_CONSENT_TO_SIGNATURE: "Bundeskabinett hat der Unterzeichnung zugestimmt",
  CABINET_DECIDED: "vom Bundeskabinett beschlossen",
  "CABINET_DECIDED / COMMISSION_SETUP": "vom Bundeskabinett beschlossen; Kommission wird eingerichtet",
  "CABINET_DECIDED / IMPLEMENTATION_PORTFOLIO": "vom Bundeskabinett beschlossen; Umsetzung über mehrere Maßnahmen",
  "CABINET_DECIDED / IMPLEMENTING_PROGRAMME": "vom Bundeskabinett beschlossen; Umsetzung über ein Programm",
  "CABINET_DECIDED / PARLIAMENTARY_PROCESS": "vom Bundeskabinett beschlossen; parlamentarisches Verfahren läuft",
  "CABINET_FRAMEWORK_DECIDED / IMPLEMENTATION_PENDING": "Rahmen vom Bundeskabinett beschlossen; Umsetzung steht aus",
  IMPLEMENTING: "in Umsetzung",
  INTERNATIONAL_AGREEMENT_LEGAL_IMPLEMENTATION: "internationale Vereinbarung in rechtlicher Umsetzung",
  IN_FORCE: "in Kraft",
  IN_FORCE_IMPLEMENTATION_DEPENDENT: "in Kraft; Wirkung hängt vom Vollzug ab",
  IN_FORCE_IMPLEMENTING: "in Kraft und in Umsetzung",
  IN_FORCE_PAYOUT_FROM_2027: "in Kraft; Auszahlung ab 2027",
  "IN_FORCE_SINCE_2025-12-06": "seit 6. Dezember 2025 in Kraft",
  "IN_FORCE_SINCE_2026-01-01": "seit 1. Januar 2026 in Kraft",
  LAW_IN_FORCE_BENEFIT_FROM_2027_RETROACTIVE_PAYOUT_2028: "Gesetz in Kraft; Leistung ab 2027 mit rückwirkender Auszahlung 2028",
  LETTER_OF_INTENT_NOT_FINAL_SUPPLY_CONTRACT: "Absichtserklärung; noch kein endgültiger Liefervertrag",
  PARLIAMENTARY_APPROVAL_REQUIRED: "parlamentarische Zustimmung erforderlich",
  "PARLIAMENTARY_PROCESS / IMPLEMENTATION_ORDINANCE_PENDING": "parlamentarisches Verfahren; Umsetzungsverordnung steht aus",
  RATIFICATION_PROCESS: "Ratifikationsverfahren",
  "SIGNED / RATIFICATION_AND_ENTRY_INTO_FORCE_PENDING": "unterzeichnet; Ratifikation und Inkrafttreten stehen aus",
  PROMULGATED: "verkündet",
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
  CLIMATE_RESOURCE: "Klima und Ressourcen",
  FINANCIAL_SCALE: "finanzielle Tragweite",
  HEALTH_SAFETY: "Gesundheit und Sicherheit",
  HIGH_UNCERTAINTY_HIGH_HARM: "hohe Unsicherheit bei möglichem großem Schaden",
  POPULATION_SCALE: "Reichweite in der Bevölkerung",
  "Climate resource": "Klima und Ressourcen",
  "Structural change": "Strukturwandel",
  "Path dependence": "Pfadabhängigkeit",
  "System resilience": "Systemresilienz",
  BLOCK: "Schutzgrenze verletzt – keine Kompensation zulässig",
  RecommendationVersion: "Fassung der WÖk-Handlungsoption",
  RecommendationVersions: "Fassungen der WÖk-Handlungsoption",
  EvidenceEvent: "Evidenzereignis",
  EvidenceEvents: "Evidenzereignisse",
  ExternalShock: "außergewöhnliches externes Ereignis",
  StateObservation: "amtliche Zustandsbeobachtung",
  "State Variables": "Zustandsvariablen",
  RealityCheckCandidate: "Anlass für eine spätere Wirkungsprüfung",
  AnalysisVersion: "Analysefassung",
  WÖkImpactCase: "WÖk-Wirkungsfall",
  ImpactCase: "Wirkungsfall",
  GovernmentAction: "amtliche Regierungshandlung",
  GovernmentActions: "amtliche Regierungshandlungen",
  ParliamentaryCase: "parlamentarischer Vorgang",
  ParliamentaryCases: "parlamentarische Vorgänge",
  LegalAct: "Rechtsakt",
  LegalActs: "Rechtsakte",
  SourceEvent: "amtliche Quellenveröffentlichung",
  SourceEvents: "amtliche Quellenveröffentlichungen",
  VoteEvent: "Abstimmungsereignis",
  VoteEvents: "Abstimmungsereignisse",
  IndividualVote: "amtlich dokumentierte Einzelstimme",
  IndividualVotes: "amtlich dokumentierte Einzelstimmen",
  NO_SINGLE_DIRECTION_ALLOWED: "Keine einheitliche Wirkungsrichtung zulässig",
  VERY_HIGH: "sehr hohe Prüfrelevanz",
  HIGH_MEDIUM: "hohe bis mittlere Prüfrelevanz",
  MEDIUM_HIGH: "mittlere bis hohe Prüfrelevanz",
  HIGH_PROTECTION: "hohe Schutzrelevanz",
  HIGH_SYSTEMIC: "hohe systemische Prüfrelevanz",
  VERY_HIGH_CLIMATE_NATURE: "sehr hohe Klima- und Naturrelevanz",
  VERY_HIGH_HEALTH_SOCIAL_FINANCE: "sehr hohe Relevanz für Gesundheit, Soziales und Finanzierung",
  VERY_HIGH_INTERGENERATIONAL: "sehr hohe generationenübergreifende Relevanz",
  VERY_HIGH_RIGHTS_SECURITY: "sehr hohe Grundrechts- und Sicherheitsrelevanz",
  VERY_HIGH_SOCIAL: "sehr hohe soziale Relevanz",
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
  UEBERWIEGEND_POSITIVES_WIRKUNGSPOTENZIAL_MIT_SEPARAT_SICHTBAREN_RISIKEN: "Überwiegend positives Wirkungspotenzial mit separat sichtbaren Risiken",
  AMBIVALENTES_WIRKUNGSPOTENZIAL: "Gegenläufige Wirkungspotenziale und Risiken",
  EU_EXCLUSIVE: "ausschließliche EU-Zuständigkeit",
  EU_SHARED: "geteilte EU-Zuständigkeit",
  EU_SHARED_INTERNAL_MARKET_ENVIRONMENT_INDUSTRY: "Geteilte EU-Zuständigkeit - Binnenmarkt, Umwelt und Industrie",
  MIXED_EU_SUPPORTING_EXISTING_DIGITAL_INTERNAL_MARKET_RULES: "Gemischte EU-Zuständigkeit mit unterstützender Rolle auf Grundlage bestehender Binnenmarkt- und Digitalregeln",
  EU_ROUTE_WITH_HIGH_FUNDAMENTAL_RIGHTS_CONSTRAINTS: "EU-Umsetzungsweg mit hohen grundrechtlichen Anforderungen",
  COMMISSION_STRATEGY: "Strategie der Europäischen Kommission",
  DSA_EXISTING_ENFORCEMENT: "Vollzug des bestehenden Digital Services Act",
  MEMBER_STATE_AND_CIVIL_SOCIETY_COORDINATION: "Koordination mit Mitgliedstaaten und Zivilgesellschaft",
  EU_SHARED_MIXED: "Gemischte geteilte EU-Zuständigkeit",
  EU_ROUTE_WITH_CONSTRAINTS: "EU-Umsetzungsweg mit rechtlichen und administrativen Anforderungen",
  MEMBER_STATE_ADMINISTRATION_REQUIRED: "Umsetzung durch Verwaltungen der Mitgliedstaaten erforderlich",
  REGIONAL_LOCAL_IMPLEMENTATION: "Regionale und lokale Umsetzung",
  EU_BUDGET_OR_FUNDING: "EU-Haushalt oder EU-Förderung",
  STRATEGY_AND_COMMUNICATION: "Strategie und Mitteilung der Europäischen Kommission",
  COMMISSION_EXECUTIVE_STRATEGIC: "strategische Exekutivrolle der Europäischen Kommission",
  IMPACT_POTENTIAL_WITH_IMPLEMENTATION_OBSERVATION: "Wirkungspotenzial mit Beobachtung der Umsetzung",
  WATCH_HIGH: "hohe Schutz- und Beobachtungsrelevanz",
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
  BUND_WITH_EU_STATE_AID_AND_ELECTRICITY_MARKET_CONSTRAINTS: "Bundeskompetenz unter EU-beihilfe- und strommarktrechtlichen Anforderungen",
  BUND_FINANCING_QUALITY_FRAMEWORK_WITH_LAENDER_HOSPITAL_PLANNING: "Bundesrahmen für Finanzierung und Qualität; Krankenhausplanung der Länder",
  BUND_WITH_EU_FINANCIAL_MARKET_AND_TAX_CONSTRAINTS: "Bundeskompetenz unter EU-finanzmarkt- und steuerrechtlichen Anforderungen",
  BUND_SGB_II_WITH_FEDERAL_IMPLEMENTATION_BY_BA_AND_MUNICIPAL_JOBCENTERS: "Bundesrecht im SGB II; Vollzug durch Bundesagentur und kommunale Jobcenter",
  BUND_PUBLIC_PROCUREMENT_AND_LABOUR_CONDITIONS_WITH_EU_PROCUREMENT_CONSTRAINTS: "Bundeskompetenz für Vergabe- und Arbeitsbedingungen unter EU-Vergaberecht",
  BUND_ASYL_PROCEDURE_WITH_BINDING_EU_ASYL_PROCEDURE_AND_FUNDAMENTAL_RIGHTS_CONSTRAINTS: "Bundeskompetenz im Asylverfahren unter bindendem EU- und Grundrechtsschutz",
  ALTERNATIVE: "Alternative",
  AUSGANGSSTATUS: "Ausgangsstatus",
  BESCHLOSSENE_OPTION: "beschlossene Option",
  REFERENZOPTION: "Referenzoption",
  WOEK_PRAEFERIERTE_AUSGESTALTUNG: "von der WÖk fachlich bevorzugte Ausgestaltung",
  SCHUTZMAXIMIERENDE_OPTION: "schutzmaximierende Option",
  GEZIELTE_SCHUTZOPTION: "gezielte Schutzoption",
  DATENSPARSAME_ALTERNATIVE: "datensparsame Alternative",
  SCHNELLER_ROLLOUT: "schneller Rollout",
  WOEK_PRAEFERIERTER_NAECHSTER_SCHRITT: "von der WÖk fachlich bevorzugter nächster Schritt",
  KONSERVATIVE_REFERENZ: "konservative Referenz",
};

const observatoryValueLabels: Record<string, string> = {
  ACTIVE: "aktiv",
  PROVISIONAL: "vorläufig",
  EXTERNAL_CONTEXT: "externer Kontext",
  PROVISIONAL_UNTIL_OFFICIAL_VALIDATION: "vorläufig bis zur amtlichen Validierung",
  NOT_ESTABLISHED: "nicht nachgewiesen",
  HIGH: "hoch",
  MEDIUM: "mittel",
  LOW: "gering",
  VERY_HIGH: "sehr hohe Relevanz",
};

const observatoryQualityFieldLabels: Record<string, string> = {
  measurement: "Messwert",
  historical_comparison: "historischer Vergleich",
  record_classification: "Einordnung des Rekordstatus",
  causal_attribution: "kausale Zurechnung",
};

const structuredFieldLabels: Record<string, string> = {
  competence_scope: "Kompetenz",
  implementation_route: "Umsetzungsweg",
  legal_feasibility_status: "Rechtliche Umsetzbarkeit",
  institutional_actor_role: "Institutionelle Rolle",
  current_commission_role: "Rolle der aktuellen Kommission",
  inherited_legislative_file: "Geerbtes Gesetzgebungsverfahren",
  reality_check_status: "Reality-Check-Status",
  boundary_status: "Prüfung der Schutz- und Wirkungsgrenzen",
  competence_review: "Kompetenzprüfung",
  legal_and_rights_review: "Rechts- und Grundrechtsprüfung",
  mpd_mapping: "MPD-Zuordnung",
  sdg_mapping: "SDG-Zuordnung",
  sdg_plus_mapping: "SDG+-Zuordnung",
  structured_boundary_review: "Prüfung von Schutz- und Wirkungsgrenzen",
  structured_data_needs: "strukturierter Datenbedarf",
  structured_evidence_summary: "strukturierte Evidenzzusammenfassung",
  comparison_role: "Rolle im Variantenvergleich",
};

const indicatorLabels: Record<string, string> = {
  low_carbon_material_share: "Anteil CO2-armer Materialien in der betroffenen Beschaffung",
  material_carbon_intensity: "Reale CO2-Intensität der eingesetzten Materialien",
  public_procurement_cost: "Kosten der öffentlichen Beschaffung / Total Cost of Ownership",
  eu_manufacturing_capacity: "Zusätzliche industrielle Produktionskapazität in der EU",
  supply_concentration: "Importkonzentration und Lieferkettenabhängigkeit",
  fdi_quality: "Qualität ausländischer Direktinvestitionen, einschließlich Wissens- und Technologietransfer",
  permit_duration_with_protection: "Genehmigungsdauer bei gleichbleibenden Schutzstandards",
  fimi_detection_time: "Zeit bis zur Erkennung koordinierter Informationsmanipulation",
  network_diffusion_after_response: "Ausbreitung eines Manipulationsnetzwerks nach einer Reaktion",
  false_classification_appeals: "Einsprüche gegen Fehlklassifikationen",
  independent_oversight: "Unabhängige Aufsicht",
  media_pluralism: "Medienpluralismus",
  civil_society_operability: "Handlungsfähigkeit der Zivilgesellschaft",
  fundamental_rights_cases: "Grundrechtsbeschwerden und -verfahren",
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
  return translated;
}

const publicationArchiveTokenLabels: Record<string, string> = {
  programme_profile: "Programmprofil",
  material_commitments: "Materielle Programmaussagen",
  central_impact_paths: "Zentrale Wirkungspfade",
  cross_cutting_patterns: "Themenübergreifende Muster",
  programme_level_communicative_pre_effect: "Kommunikative Vorwirkung auf Programmebene",
  methodology_extension: "Methodische Ergänzung",
  schema_version: "Schemaversion",
  source_key: "Quellenkennung",
  source_hash: "Quellenprüfsumme",
  review_status: "Prüfstatus",
  plain_language_summary: "Verständliche Zusammenfassung",
  declared_objectives: "Benannte Ziele",
  implementation_boundary: "Umsetzungsgrenze",
  material_policy_domains: "Materielle Politikfelder",
  commitment_key: "Kennung der Programmaussage",
  source_refs: "Quellenverweise",
  source_text: "Quelltext",
  decision_or_measure: "Entscheidung oder Maßnahme",
  intended_change: "Beabsichtigte Veränderung",
  decision_readiness: "Entscheidungsreife",
  missing_parameters: "Fehlende Parameter",
  responsible_actors: "Zuständige Akteure",
  affected_groups: "Betroffene Gruppen",
  impact_potential: "Wirkungspotenzial",
  path_id: "Wirkpfadkennung",
  expected_state_change: "Erwartete Zustandsveränderung",
  implementation_conditions: "Umsetzungsbedingungen",
  baseline_required: "Baseline erforderlich",
  counterfactual_required: "Gegenfaktum erforderlich",
  evidence_status: "Evidenzstatus",
  impact_risks: "Wirkungsrisiken",
  trigger_or_condition: "Auslöser oder Bedingung",
  affected_groups_or_goods: "Betroffene Gruppen oder Schutzgüter",
  communicative_pre_effect: "Kommunikative Vorwirkung",
  frame_markers: "Rahmungsmerkmale",
  evidence_boundary: "Evidenzgrenze",
  calculation_requirements: "Rechenanforderungen",
  possible_indicator: "Möglicher Indikator",
  required_operands: "Erforderliche Operanden",
  data_gap: "Datenlücke",
  non_compensable_boundaries: "Nicht kompensierbare Grenzen",
  normative_mapping: "Normative Zuordnung",
  sdg_plus: "SDG+",
  state_target_ids: "Kennungen der Landesziele",
  data_gaps: "Datenlücken",
  analysis_time_status: "Zeitstatus der Analyse",
  impact_orders: "Wirkungsordnungen",
  first_order: "Erste Ordnung",
  second_order: "Zweite Ordnung",
  third_order: "Dritte Ordnung",
  distribution_and_time: "Verteilung und Zeit",
  benefit_and_burden_test: "Nutzen- und Belastungsprüfung",
  short_term: "Kurzfristig",
  medium_term: "Mittelfristig",
  long_term: "Langfristig",
  intergenerational_relevance: "Generationenübergreifende Relevanz",
  implementation_and_capacity: "Umsetzung und Kapazität",
  capacity_status: "Kapazitätsstatus",
  reversibility_and_lock_in: "Reversibilität und Lock-in",
  decision_information_gap: "Informationslücke für die Entscheidung",
  required_before_binding_decision: "Vor bindender Entscheidung erforderlich",
  monitoring_and_feedback: "Monitoring und Rückkopplung",
  primary_indicator: "Leitindikator",
  earliest_review: "Frühester Review",
  correction_trigger: "Korrekturauslöser",
  MULTI_LEVEL: "mehrere Zuständigkeitsebenen",
  NONE_IDENTIFIED: "keine benannt",
  EX_ANTE_PROGRAMME_COMMITMENT: "Ex-ante-Prüfung einer Programmaussage",
  PLAUSIBLE_PATHS_NOT_OBSERVED_EFFECTS: "plausible Wirkungspfade, keine beobachteten Wirkungen",
  CONTEXT_DEPENDENT: "kontextabhängig",
  DATA_GAP_UNTIL_IMPLEMENTATION_DESIGN: "Datenlücke bis zur Festlegung der Umsetzung",
  PARTLY_REVERSIBLE: "teilweise reversibel",
  MATERIAL_GAPS: "materielle Informationslücken",
  NOT_DECISION_READY: "noch nicht entscheidungsreif",
  REVIEW_REQUIRED: "Prüfung erforderlich",
  LOCK_IN_RISK: "Lock-in-Risiko",
  ECONOMY_INDUSTRY_TRADE: "Wirtschaft, Industrie und Handel",
  SECURITY_POLICE_JUSTICE: "Sicherheit, Polizei und Justiz",
  WORK_SOCIAL_SECURITY: "Arbeit und soziale Sicherung",
  NATURE_WATER_RESOURCES: "Natur, Wasser und Ressourcen",
  CULTURE_RELIGION_SPORT: "Kultur, Religion und Sport",
  SCIENCE_RESEARCH: "Wissenschaft und Forschung",
  ENERGY_CLIMATE: "Energie und Klima",
  FAMILY_EQUALITY: "Familie und Gleichstellung",
  MOBILITY_INFRASTRUCTURE: "Mobilität und Infrastruktur",
  HEALTH_CARE: "Gesundheit und Pflege",
  ADMINISTRATION_STATE: "Verwaltung und Staat",
  MEDIA_COMMUNICATION: "Medien und Kommunikation",
  DIGITAL_AI_DATA: "Digitales, KI und Daten",
  DEFENCE_FOREIGN_EU: "Verteidigung, Außenpolitik und EU",
  TAX_FISCAL_BUDGET: "Steuern, Finanzen und Haushalt",
  MIGRATION_ASYL: "Migration und Asyl",
  AGRICULTURE_FOOD_ANIMAL: "Landwirtschaft, Ernährung und Tierwohl",
};

/**
 * The immutable publication archive contains technical source notation. This
 * presentation-only projection preserves every token while replacing machine
 * separators with readable text. It is deliberately separate from the strict
 * publicSystemLabel gate used for substantive UI assertions.
 */
export function publicArchiveText(value: string) {
  const reviewed = humanizeSystemValue(value);
  return reviewed.replace(/\b[\p{L}0-9]+(?:_[\p{L}0-9]+)+\b/gu, (token) => {
    const exact = publicationArchiveTokenLabels[token];
    if (exact) return exact;
    const sdg = token.match(/^SDG_(\d+)$/);
    if (sdg) return `SDG ${Number(sdg[1])}`;
    const words = token.replaceAll("_", " ");
    const readable = token === token.toLocaleUpperCase("de-DE") ? words.toLocaleLowerCase("de-DE") : words;
    return `${readable.charAt(0).toLocaleUpperCase("de-DE")}${readable.slice(1)}`;
  });
}

/** Technical control values may appear in normal public UI only through an
 * exact reviewed mapping. Unknown codes are suppressed by the caller instead
 * of being cosmetically title-cased. */
export function publicSystemLabel(value: string) {
  return systemValueLabels[value] ?? null;
}

/** Name used by the cross-system publication contract. Kept as an alias so
 * existing callers remain stable while the strict fail-closed semantics are
 * explicit at new public projection boundaries. */
export function publicSystemValueLabel(value: string) {
  return publicSystemLabel(value);
}

export function publicIndicatorLabel(value: string) {
  return indicatorLabels[value] ?? null;
}

/** The observatory has context-specific labels: HIGH describes data quality,
 * not evidence strength. Unknown values and keys fail closed. */
export function publicObservatoryValueLabel(value: string) {
  return observatoryValueLabels[value] ?? null;
}

export function publicObservatoryQualityFieldLabel(value: string) {
  return observatoryQualityFieldLabels[value] ?? null;
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
  const exact = publicSystemLabel(value);
  if (exact) return exact;
  const assignment = value.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*=\s*(.+?)\s*$/);
  if (assignment) {
    const key = publicStructuredFieldLabel(assignment[1]) ?? publicSystemLabel(assignment[1]);
    const label = publicSystemLabel(assignment[2]);
    return key && label ? `${key}: ${label}` : null;
  }
  if (/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b|\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/.test(value)) return null;
  return humanizeSystemValue(value).replace(/\s*=\s*/g, ": ");
}

/** Fachlich freigegebene narrative copy is preserved verbatim. A leading
 * control-code prefix may be omitted for public prose; any other embedded
 * machine token fails closed instead of being cosmetically translated. */
export function publicNarrativeText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const prefixed = trimmed.match(/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+:\s*([\s\S]+)$/);
  if (prefixed) return /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/.test(prefixed[1]) ? null : humanizeSystemValue(prefixed[1].trim());
  if (/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b|\b[a-z]+_[a-z0-9_]+\b/.test(trimmed)) return null;
  return humanizeSystemValue(trimmed);
}

export function isMarkdownSeparatorOnly(value: string) {
  return /^(?:---|\*\*\*|___)$/.test(value.trim());
}
