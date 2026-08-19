import type { CompletePublicationSource } from "@/lib/publication/fachakten";

const publicLabels: Record<string, string> = {
  "programme-review": "WÖk-Wirkungsakte",
  "commitment-register": "Zusageregister",
  schema_version: "Schema-Version",
  source_key: "Quellschlüssel",
  source_hash: "Prüfhash der Programmquelle",
  review_status: "Prüfstatus",
  plain_language_summary: "Kurzfassung",
  programme_profile: "Programmprofil",
  declared_objectives: "Dokumentierte Ziel- und Zusagenbasis",
  implementation_boundary: "Zuständigkeit und Umsetzungsebene",
  material_policy_domains: "Berührte Politikfelder",
  material_commitments: "Geprüfte Zusagen und Wirkpfade",
  commitments: "Vollständiges Zusageregister",
  commitment_key: "Zusage-ID",
  commitment_text: "Programmzusage",
  source_refs: "Originalfundstelle",
  source_location: "Originalfundstelle",
  source_context: "Kontext der Programmzusage",
  source_text: "Originaltext",
  page: "Seite",
  section: "Abschnitt",
  lead_in: "Einleitung im Programm",
  title: "Kurztitel",
  decision_or_measure: "Vorgeschlagene Entscheidung oder Maßnahme",
  intended_change: "Beabsichtigte Veränderung",
  decision_readiness: "Entscheidungsreife",
  status: "Status",
  missing_parameters: "Noch offene Ausgestaltungsfragen",
  responsible_actors: "Zuständige Akteure",
  affected_groups: "Betroffene Gruppen und Systeme",
  impact_potential: "Wirkungspotenziale",
  path_id: "Wirkpfad-ID",
  expected_state_change: "Mögliche Zustandsveränderung",
  mechanism: "Wirkmechanismus",
  implementation_conditions: "Bedingungen für die Umsetzung",
  baseline_required: "Erforderlicher Ausgangszustand",
  counterfactual_required: "Erforderlicher Vergleichsfall",
  indicators: "Beobachtungsindikatoren",
  evidence_status: "Evidenzstatus",
  impact_risks: "Wirkungsrisiken",
  risk: "Risiko",
  trigger_or_condition: "Auslöser oder Bedingung",
  affected_groups_or_goods: "Betroffene Gruppen oder Schutzgüter",
  communicative_pre_effect: "Mögliche kommunikative Vorwirkung",
  frame_markers: "Hinweise auf kommunikative Rahmung",
  evidence_boundary: "Grenze der Aussagekraft",
  calculation_requirements: "Anforderungen an eine spätere Wirkungsmessung",
  outcome: "Zu beobachtender Zielzustand",
  possible_indicator: "Möglicher Indikator",
  baseline: "Ausgangszustand",
  counterfactual: "Vergleichsfall",
  required_operands: "Erforderliche Messgrößen",
  data_gap: "Datenlücke",
  non_compensable_boundaries: "Nicht kompensierbare Schutzgrenzen",
  concern: "Zu prüfendes Schutzgut",
  rationale: "Begründung",
  normative_mapping: "Einordnung in gemeinsame Referenzrahmen",
  human: "Mensch",
  planet: "Planet",
  democracy: "Demokratie",
  sdgs: "UN-Nachhaltigkeitsziele",
  sdg_plus: "WÖk-SDG+",
  state_target_ids: "Landesziele Sachsen-Anhalt",
  direction: "Wirkungsrichtung",
  data_gaps: "Offene Daten- und Evidenzfragen",
  analysis_time_status: "Zeitbezug der Analyse",
  impact_orders: "Folgewirkungen und Wirkungskaskade",
  first_order: "Erste Ordnung",
  second_order: "Zweite Ordnung",
  third_order: "Dritte Ordnung",
  distribution_and_time: "Verteilung, Zeit und Generationen",
  benefit_and_burden_test: "Prüfung von Nutzen und Belastungen",
  short_term: "Kurzfristig",
  medium_term: "Mittelfristig",
  long_term: "Langfristig",
  intergenerational_relevance: "Generationengerechtigkeit",
  implementation_and_capacity: "Umsetzung und staatliche Kapazität",
  requirements: "Voraussetzungen",
  capacity_status: "Stand der Umsetzungskapazität",
  note: "Einordnung",
  reversibility_and_lock_in: "Reversibilität und Lock-in-Risiken",
  decision_information_gap: "Informationsbedarf vor einer bindenden Entscheidung",
  required_before_binding_decision: "Vor einer bindenden Entscheidung erforderlich",
  monitoring_and_feedback: "Monitoring und Rückkopplung",
  primary_indicator: "Leitindikator",
  unit: "Einheit",
  earliest_review: "Frühester sinnvoller Reality Check",
  correction_trigger: "Korrekturtrigger",
  implementation_level: "Umsetzungsebene",
  policy_domain: "Politikfeld",
  temporal_scope: "Zeithorizont",
  COMPLETE: "vollständig fachlich geprüft",
  CONDITIONAL: "bedingt entscheidungsreif",
  MULTI_LEVEL: "Mehr-Ebenen-Pfad zwischen Land, Bund und/oder EU",
  LAND: "Land Sachsen-Anhalt",
  LIMITED: "begrenzte Evidenz",
  REVIEW_REQUIRED: "Schutzprüfung erforderlich",
  NOT_MATERIAL_IDENTIFIED: "keine eigenständige materielle Vorwirkung festgestellt",
  PLAUSIBLE_PATHS_NOT_OBSERVED_EFFECTS: "plausible Wirkpfade - noch keine beobachteten Wirkungen",
  EX_ANTE_PROGRAMME_COMMITMENT: "Ex-ante-Prüfung einer Programmzusage",
  DATA_GAP_UNTIL_IMPLEMENTATION_DESIGN: "Datenlücke bis zur konkreten Ausgestaltung und Umsetzung",
  PARTLY_REVERSIBLE: "teilweise reversibel",
  MATERIAL_GAPS: "wesentliche Informationslücken",
  MATERIAL: "wesentlich",
  OPEN: "offen - keine Null- oder Neutralbewertung",
  WORK_SOCIAL_SECURITY: "Arbeit und soziale Sicherung",
  SECURITY_POLICE_JUSTICE: "Sicherheit, Polizei und Justiz",
  OTHER: "weitere Politikfelder",
  TAX_FISCAL_BUDGET: "Steuern, Finanzen und Haushalt",
  EDUCATION: "Bildung",
  NATURE_WATER_RESOURCES: "Natur, Wasser und Ressourcen",
  FAMILY_EQUALITY: "Familie, Gleichstellung und Teilhabe",
  MOBILITY_INFRASTRUCTURE: "Mobilität und Infrastruktur",
  HOUSING: "Wohnen",
  ENERGY_CLIMATE: "Energie und Klima",
  DIGITAL_AI_DATA: "Digitalisierung, KI und Daten",
  ADMINISTRATION_STATE: "Verwaltung und handlungsfähiger Staat",
  ECONOMY_INDUSTRY_TRADE: "Wirtschaft, Industrie und Handel",
  HEALTH_CARE: "Gesundheit und Pflege",
  SCIENCE_RESEARCH: "Wissenschaft und Forschung",
  AGRICULTURE_FOOD_ANIMAL: "Landwirtschaft, Ernährung und Tierschutz",
  MIGRATION_ASYL: "Migration und Asyl",
  MEDIA_COMMUNICATION: "Medien und Kommunikation",
  CULTURE_RELIGION_SPORT: "Kultur, Religion und Sport",
  DEFENCE_FOREIGN_EU: "Verteidigung, Außenpolitik und Europa",
  DEMOCRACY_RULE_OF_LAW: "Demokratie und Rechtsstaat"
};

const replacements = Object.entries(publicLabels).sort(([left], [right]) => right.length - left.length);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function publicSaxonyAnhaltLabel(value: string) {
  return publicLabels[value] ?? value;
}

export function presentSaxonyAnhaltMarkdown(markdown: string) {
  return replacements.reduce((text, [technical, publicLabel]) => {
    const pattern = new RegExp(`(?<![A-Za-z0-9_])${escapeRegExp(technical)}(?![A-Za-z0-9_])`, "g");
    return text.replace(pattern, publicLabel);
  }, markdown)
    .replace(/#\s+(ltw-2026-st-[a-z]+)\s+[–-]\s+WÖk-Wirkungsakte\s+[–-]\s+vollständige Darstellung/g, "# WÖk-Wirkungsakte - vollständige Darstellung")
    .replace(/#\s+(ltw-2026-st-[a-z]+)\s+[–-]\s+Zusageregister\s+[–-]\s+vollständige Darstellung/g, "# Zusageregister - vollständige Darstellung")
    .replace(/`null`/g, "nicht angegeben")
    .replace(/`DIE_LINKE_WILL`/g, "Programmaussage")
    .replace(/`([A-Z][A-Z0-9_]+)`/g, "$1");
}

export function presentSaxonyAnhaltSource(source: CompletePublicationSource): CompletePublicationSource {
  return { ...source, markdown: presentSaxonyAnhaltMarkdown(source.markdown) };
}

export type SaxonyAnhaltProgrammeOverview = {
  summary: string;
  objective: string | null;
  implementationBoundary: string | null;
  policyDomains: string[];
  commitmentCount: number | null;
};

function cleanInline(value: string) {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

export function saxonyAnhaltProgrammeOverview(markdown: string): SaxonyAnhaltProgrammeOverview {
  const summary = cleanInline(markdown.match(/\*\*plain_language_summary:\*\*\s*([^\n]+)/)?.[1] ?? "Die vollständige Fachakte ist veröffentlicht. Sie trennt Programmzusage, Wirkungspotenzial, Wirkungsrisiko, Evidenz und spätere reale Wirkung.");
  const objectiveBlock = markdown.match(/####\s+declared_objectives\s*\n+([\s\S]*?)(?=\n\*\*implementation_boundary:\*\*)/)?.[1] ?? "";
  const objective = objectiveBlock.match(/^[-*]\s+(.+)$/m)?.[1]?.trim() ?? null;
  const implementationBoundary = markdown.match(/\*\*implementation_boundary:\*\*\s*([^\n]+)/)?.[1]?.trim() ?? null;
  const domainBlock = markdown.match(/####\s+material_policy_domains\s*\n+([\s\S]*?)(?=\n###\s+material_commitments)/)?.[1] ?? "";
  const policyDomains = [...domainBlock.matchAll(/^[-*]\s+([^\n]+)$/gm)]
    .map((match) => publicSaxonyAnhaltLabel(match[1].trim()))
    .filter(Boolean);
  const countText = [summary, objective ?? ""].join(" ");
  const commitmentCount = Number(countText.match(/\b(\d{1,5})\s+quellengebundene/)?.[1] ?? "") || null;
  return { summary, objective, implementationBoundary, policyDomains, commitmentCount };
}
