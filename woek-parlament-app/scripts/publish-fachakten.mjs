import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Creates the public, static long-form editions of the supplied Fachakten.
// The source delivery stays in .local and is never part of a deployment.
// Static delivery is intentional: some complete records exceed Vercel's 4.5 MB
// function-response limit and must not disappear or be silently abbreviated.
const appRoot = process.cwd();
const sourceRoot = process.env.FACHBASIS_SOURCE_ROOT ?? path.join(appRoot, ".local", "fachbasis-source-release-1.1");
const outputRoot = path.join(appRoot, "public", "fachakten", "dossiers");
const integrityRoot = path.join(appRoot, "public", "fachakten", "integrity");
const publicIndex = JSON.parse(fs.readFileSync(path.join(appRoot, "data", "fachakten", "public", "index.json"), "utf8"));
const publicAnalyses = JSON.parse(fs.readFileSync(path.join(appRoot, "data", "public-fachanalysen.json"), "utf8"));

const programmeDocuments = [
  ["sachsen-anhalt-cdu", "CDU Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-cdu-programme-review-VOLLSTAENDIG.md"],
  ["sachsen-anhalt-spd", "SPD Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-spd-programme-review-VOLLSTAENDIG.md"],
  ["sachsen-anhalt-gruene", "BÜNDNIS 90/DIE GRÜNEN Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-gruene-programme-review-VOLLSTAENDIG.md"],
  ["sachsen-anhalt-linke", "DIE LINKE Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-linke-programme-review-VOLLSTAENDIG.md"],
  ["sachsen-anhalt-afd", "AfD Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-afd-programme-review-VOLLSTAENDIG.md"],
  ["sachsen-anhalt-bsw", "BSW Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-bsw-programme-review-VOLLSTAENDIG.md"],
  ["bund-btw-2025-cdu-csu", "CDU/CSU – Bundestagswahlprogramm 2025", "01_bundesprogramme/publication/btw-2025-cdu-csu-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-btw-2025-spd", "SPD – Regierungsprogramm 2025", "01_bundesprogramme/publication/btw-2025-spd-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-btw-2025-gruene", "BÜNDNIS 90/DIE GRÜNEN – Regierungsprogramm 2025", "01_bundesprogramme/publication/btw-2025-gruene-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-btw-2025-linke", "DIE LINKE – Wahlprogramm 2025", "01_bundesprogramme/publication/btw-2025-linke-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-btw-2025-afd", "AfD – Wahlprogramm 2025", "01_bundesprogramme/publication/btw-2025-afd-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-btw-2025-ssw", "SSW – Wahlprogramm 2025", "01_bundesprogramme/publication/btw-2025-ssw-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-coalition-2025-cdu-csu-spd", "Koalitionsvertrag für die 21. Legislaturperiode", "01_bundesprogramme/publication/coalition-2025-cdu-csu-spd-VOLLSTAENDIGE-FACHDARSTELLUNG.md"]
];

function normalizePublicText(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return normalizePublicText(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

function inline(value, sourceReferences = new Map()) {
  const cleaned = String(value).replace(/\bGEG-SRC-\d{2}\s*·\s*/g, "");
  const escaped = escapeHtml(humanizeMachineTokens(cleaned));
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => {
      const href = publicSourceDetailHref(url);
      return href ? `<a href="${href}">${label}</a>` : label;
    })
    .replace(/(?<!href=")https:\/\/[^\s<)]+/g, (url) => {
      const href = publicSourceDetailHref(url.replace(/&amp;/g, "&"));
      return href ? `<a href="${href}">Quellendetail ansehen</a>` : "Quellendetail nicht verfügbar";
    })
    .replace(new RegExp(`\\b(${publicSourceTokenPattern})\\b`, "gi"), (sourceId) => {
      const reference = sourceReferences.get(sourceId);
      if (!reference) return "eingeordnete Quelle";
      const title = escapeHtml(reference.title || reference.institution || "Eingeordnete Quelle");
      const href = reference.url ? publicSourceDetailHref(reference.url) : null;
      return href ? `<a href="${href}">${title}</a>` : title;
    });
}

const machineValues = {
  MULTI_LEVEL: "mehrere politische Ebenen",
  CONDITIONAL: "nur unter Bedingungen entscheidungsreif",
  LIMITED: "begrenzt",
  POSITIVE_POTENTIAL: "positives Wirkungspotenzial",
  NEGATIVE_RISK: "negatives Wirkungsrisiko",
  NEUTRAL: "richtungsneutral",
  AMBIVALENT: "gegenläufige Richtungen im selben Wirkpfad",
  OPEN: "offen",
  MATERIAL: "materiell relevant",
  REVIEW_REQUIRED: "Prüfung erforderlich",
  NOT_MATERIAL_IDENTIFIED: "keine materielle Relevanz festgestellt",
  EX_ANTE_PROGRAMME_COMMITMENT: "Ex-ante-Prüfung einer Programmzusage",
  PLAUSIBLE_PATHS_NOT_OBSERVED_EFFECTS: "plausible Wirkpfade, keine beobachteten Wirkungen",
  DATA_GAP_UNTIL_IMPLEMENTATION_DESIGN: "Datenlücke bis zur konkreten Ausgestaltung",
  MATERIAL_GAPS: "wesentliche Informationslücken",
  PARTLY_REVERSIBLE: "teilweise reversibel",
  SECURITY_POLICE_JUSTICE: "Sicherheit, Polizei und Justiz",
  TAX_FISCAL_BUDGET: "Steuern, Finanzen und Haushalt",
  OTHER: "weitere Querschnittsthemen",
  EDUCATION: "Bildung",
  FAMILY_EQUALITY: "Familie und Gleichstellung",
  WORK_SOCIAL_SECURITY: "Arbeit und soziale Sicherung",
  HEALTH_CARE: "Gesundheit und Pflege",
  MIGRATION_ASYL: "Migration und Asyl",
  DEFENCE_FOREIGN_EU: "Verteidigung, Außenpolitik und Europa",
  ADMINISTRATION_STATE: "Verwaltung und Staat",
  MEDIA_COMMUNICATION: "Medien und Kommunikation",
  MOBILITY_INFRASTRUCTURE: "Mobilität und Infrastruktur",
  HOUSING: "Wohnen und Bauen",
  SCIENCE_RESEARCH: "Wissenschaft und Forschung",
  ENERGY_CLIMATE: "Energie und Klima",
  ECONOMY_INDUSTRY_TRADE: "Wirtschaft, Industrie und Handel",
  AGRICULTURE_FOOD_ANIMAL: "Landwirtschaft, Ernährung und Tierwohl",
  NATURE_WATER_RESOURCES: "Natur, Wasser und Ressourcen",
  CULTURE_RELIGION_SPORT: "Kultur, Religion und Sport",
  DIGITAL_AI_DATA: "Digitalisierung, Daten und künstliche Intelligenz",
  DEMOCRACY_RULE_OF_LAW: "Demokratie und Rechtsstaatlichkeit",
  HIGHER_IS_BETTER: "höher ist besser",
  LOWER_IS_BETTER: "niedriger ist besser",
  DATA_GAP: "Daten fehlen noch",
  DATA_GAP_OR_NOT_YET_OBSERVABLE: "Daten fehlen oder die Wirkung ist noch nicht beobachtbar",
  PLAUSIBLE_MECHANISM_DATA_GAP: "Wirkmechanismus plausibel; empirischer Beleg fehlt",
  PLAUSIBLE_COMMUNICATIVE_EFFECT_PATH: "kommunikativer Wirkpfad plausibel",
  ACTUAL_EFFECT_DATA_GAP: "Beleg einer eingetretenen Wirkung fehlt",
  TO_BE_TESTED: "muss noch geprüft werden",
  MUST_BE_TESTED: "muss noch geprüft werden",
  REQUIRED_NOT_ESTABLISHED: "erforderlich, aber noch nicht belegt",
  NOT_YET_ASSESSABLE: "noch nicht belastbar bewertbar",
  LAND: "Landesebene",
  BUND: "Bundesebene",
  CANDIDATE_ONLY: "vorläufige Quelle",
  PROPOSED_PENDING_REFERENCE_RECONCILIATION: "vorläufig zugeordnet; Referenzabgleich ausstehend",
  NOT_ROBUSTLY_QUANTIFIABLE: "nicht belastbar quantifizierbar",
  DECISION_CONFIRMED: "Entscheidung bestätigt",
  PENDING_PARLIAMENTARY_DECISION: "parlamentarische Entscheidung steht noch aus",
  NO_ROBUST_RETROSPECTIVE_ASSESSMENT: "keine belastbare Rückschau möglich",
  METHOD_REVIEW_REQUIRED: "Methodenprüfung erforderlich",
  EVIDENCE_REQUIRED: "weitere Evidenz erforderlich",
  PASS: "Anforderung erfüllt",
  PARTIAL: "teilweise erfüllt",
  FAIL: "Anforderung nicht erfüllt",
  CLEAR: "keine bestätigte Schutzgrenzenverletzung",
  INDIRECT: "indirekt relevant",
  PENDING: "steht noch aus",
  VOTED: "abgestimmt",
  YES: "Ja",
  NO: "Nein",
  ADOPTED: "angenommen",
  MONITORING: "Beobachtung und Rückkopplung",
  IMPLEMENTATION: "Umsetzung",
  OBSERVATION: "Beobachtung",
  AVAILABLE_AT_DECISION_TIME: "zum Entscheidungszeitpunkt verfügbar",
  PUBLISHED_AFTER_DECISION: "nach der Entscheidung veröffentlicht",
  CURRENT_REFERENCE: "aktuelle Referenz",
  CAUSAL_HYPOTHESIS_EX_ANTE: "Ex-ante-Wirkungshypothese",
  RISK_HYPOTHESIS_EX_ANTE: "Ex-ante-Risikohypothese",
  SOURCE_ANCHORED_EX_ANTE_HYPOTHESIS: "quellengebundene Ex-ante-Hypothese",
  CONSTITUTIONAL_ANCHOR: "verfassungsrechtlicher Bezugsrahmen",
  OTHER_PRIMARY_SOURCE: "weitere Primärquelle",
  OFFICIAL_STATISTICS: "amtliche Statistik",
  GG_ART_20_STATE_STRUCTURE: "Grundgesetz, Artikel 20 – Staatsstrukturprinzipien",
  GG_ART_20A_NATURAL_FOUNDATIONS: "Grundgesetz, Artikel 20a – natürliche Lebensgrundlagen",
  GG_ART_20A_ANIMAL_PROTECTION: "Grundgesetz, Artikel 20a – Tierschutz",
  GG_FUNDAMENTAL_RIGHTS: "Grundrechte des Grundgesetzes",
  GG_ART_23_EUROPEAN_INTEGRATION: "Grundgesetz, Artikel 23 – europäische Integration",
  GG_ART_109_2_MACROECONOMIC_BALANCE: "Grundgesetz, Artikel 109 Absatz 2 – gesamtwirtschaftliches Gleichgewicht",
  AEUV_ART_13_ANIMAL_WELFARE: "AEUV, Artikel 13 – Wohlergehen der Tiere",
  RULE_BASED_COMMUNICATIVE_RISK: "regelbasiert festgestelltes kommunikatives Risiko",
  NEGATIVE_POTENTIAL: "mögliches negatives Wirkungspotenzial",
  NEGATIVE: "negatives Wirkungspotenzial",
  POSITIVE: "positives Wirkungspotenzial",
  REJECTED: "abgelehnt",
  SUPPORTED: "unterstützt",
  ABSTAINED: "enthalten",
  DECIDED: "entschieden",
  DELIBERATION: "parlamentarische Beratung",
  PROMULGATED: "verkündet",
  IDENTIFIED: "identifiziert"
  ,HIGH: "hoch"
  ,MEDIUM: "mittel"
  ,LOW: "niedrig"
  ,NONE: "keine"
  ,POLICY: "politisches Instrument"
};

const publicPhraseTranslations = new Map([
  ["decision context source only; analytical causal hypothesis requires validation", "Als Beleg liegt bislang nur die Quelle zum Entscheidungsgegenstand vor; die Wirkungshypothese muss empirisch überprüft werden"],
  ["official proposal source; ex ante causal hypothesis requires validation", "Amtliche Vorlage vorhanden; die Ex-ante-Wirkungshypothese muss empirisch überprüft werden"],
  ["defined not applied", "definiert, aber noch nicht angewendet"],
  ["not publication ready", "noch nicht veröffentlichungsreif"],
  ["ready for public release with maturity label", "mit Reifegradkennzeichnung veröffentlichbar"],
  ["data gap or not yet observable", "Daten fehlen oder die Wirkung ist noch nicht beobachtbar"],
  ["no score permitted", "keine Gesamtpunktzahl zulässig"],
  ["incomplete pending two leading references", "unvollständig; zwei führende Referenzen fehlen"],
  ["controlled with one metadata conflict", "kontrollierter Stand; ein Metadatenkonflikt ist offen"],
  ["conditional material evidence gaps", "nur unter Bedingungen entscheidungsreif; wesentliche Evidenzlücken bestehen"],
  ["materiality screen required", "Materialitätsprüfung erforderlich"],
  ["must be checked", "muss geprüft werden"],
  ["not applicable yet", "derzeit nicht anwendbar"],
  ["not roll call", "keine namentliche Abstimmung"],
  ["material plausible", "materielle Relevanz plausibel"],
  ["ex ante only", "nur Ex-ante-Einordnung"],
  ["ex ante design option requires decision and later evaluation", "Ex-ante-Gestaltungsoption; erfordert eine Entscheidung und spätere Evaluation"],
  ["Current parliamentary status and proposal are source-backed in the package.", "Parlamentarischer Stand und Vorlage sind im Fallpaket durch Quellen belegt."],
  ["The ex-ante review is restricted to proposal mechanics, potentials, risks and change levers.", "Die Ex-ante-Prüfung beschränkt sich auf Regelungsmechanik, Wirkungspotenziale, Risiken und veränderbare Hebel."],
  ["No decision, implementation or observation period exists for the current proposal.", "Für die aktuelle Vorlage liegen noch keine Entscheidung, Umsetzung oder Beobachtungsperiode vor."],
  ["No final calculation is permitted while material inputs or causal boundaries remain missing.", "Solange wesentliche Eingangsdaten oder Kausalitätsgrenzen fehlen, ist keine abschließende Berechnung zulässig."],
  ["The embedded WÖk reference snapshot is preserved unchanged and marks a pending reference gap; no final score is generated.", "Der eingebettete WÖk-Referenzstand bleibt unverändert erhalten und weist eine offene Referenzlücke aus; eine Gesamtpunktzahl wird nicht erzeugt."],
  ["Protection boundaries are identified but no final scored assessment is made.", "Schutzgrenzen sind benannt; eine abschließende Punktbewertung erfolgt nicht."],
  ["Final decision metadata, decision date, parliamentary status and outcome are source-backed within the package.", "Entscheidungsdaten, Entscheidungsdatum, parlamentarischer Stand und Ergebnis sind im Fallpaket durch Quellen belegt."],
  ["Only at-decision-time source IDs are used for ex-ante logic, but the provided excerpts are limited and do not support full-document verification of every proposition.", "Für die Ex-ante-Logik werden nur damals verfügbare Quellen verwendet. Die gelieferten Auszüge reichen jedoch nicht aus, um jede Aussage im Gesamtdokument zu prüfen."],
  ["Package follow-up sources confirm parliamentary status only; no verified outcome/impact evidence is supplied.", "Die späteren Quellen im Fallpaket bestätigen nur den parlamentarischen Stand; überprüfte Ergebnis- oder Wirkungsevidenz liegt nicht vor."],
  ["Impact paths and risks are structured as hypotheses; causal reach, attribution and counterfactual remain unverified.", "Wirkpfade und Risiken sind als Hypothesen strukturiert; Reichweite, Zurechnung und Gegenfaktum sind noch nicht überprüft."],
  ["Material inputs required by the calculation requirements are missing or unverified.", "Wesentliche, für die Berechnung benötigte Eingangsdaten fehlen oder sind noch nicht überprüft."],
  ["Relevant protection gates are identified but cannot be applied to a final assessment until evidence and the normative snapshot are complete.", "Relevante Schutzgrenzen sind identifiziert, können aber erst bei vollständiger Evidenz und vollständigem Referenzstand abschließend geprüft werden."],
  ["No causal attribution or net-impact claim without an explicit counterfactual or justified causal alternative.", "Keine kausale Zurechnung und keine Aussage zur Netto-Wirkung ohne ausdrückliches Gegenfaktum oder begründete kausale Alternative."],
  ["No causal attribution or net-impact claim without an explicit counterfactual or justified quasi-experimental/causal alternative.", "Keine kausale Zurechnung und keine Aussage zur Netto-Wirkung ohne ausdrückliches Gegenfaktum oder begründete quasi-experimentelle beziehungsweise kausale Alternative."],
  ["source anchored ex ante hypothesis", "quellengebundene Ex-ante-Hypothese"],
  ["risk hypothesis ex ante", "Ex-ante-Risikohypothese"],
  ["separate negative risk path", "gesonderter negativer Risikopfad"],
  ["split positive potential", "gesondertes positives Wirkungspotenzial"],
  ["plausible mechanism data gap", "Wirkmechanismus plausibel; empirischer Beleg fehlt"],
  ["plausible communicative effect path; actual effect data gap", "Kommunikativer Wirkpfad plausibel; Beleg einer eingetretenen Wirkung fehlt"],
  ["comm marker taxonomy", "regelbasiertes Prüfmuster für kommunikative Vorwirkungen"],
  ["official portal interface", "amtliches Portal"],
  ["official version available", "amtliche Fassung verfügbar"],
  ["parliamentary government draft", "parlamentarischer Regierungsentwurf"],
  ["government draft", "Regierungsentwurf"],
  ["first public hearing", "erste öffentliche Anhörung"],
  ["second public hearing", "zweite öffentliche Anhörung"],
  ["deliberation on changed design", "Beratung der geänderten Ausgestaltung"],
  ["committee final parliamentary version", "abschließende Ausschussfassung"],
  ["bundestag decision", "Entscheidung des Bundestages"],
  ["bundesrat proceeding completed", "Bundesratsverfahren abgeschlossen"],
  ["promulgated law", "verkündetes Gesetz"],
  ["implementation start", "Beginn der gestuften Umsetzung"],
  ["in force", "in Kraft"],
  ["official source identified", "amtliche Quelle identifiziert"],
  ["attribution unresolved", "Zurechnung noch ungeklärt"],
  ["data gap", "Datenlücke"],
  ["modelled", "modelliert"],
  ["not observed", "nicht beobachtet"],
  ["observed", "beobachtet"],
  ["positive potential", "positives Wirkungspotenzial"],
  ["negative risk", "negatives Wirkungsrisiko"],
  ["not applicable", "nicht anwendbar"]
  ,["not rated", "noch nicht eingestuft"]
  ,["modeled ex ante direction", "modellierte Ex-ante-Richtung"]
  ,["source text appears complete", "Quelltext erscheint vollständig"]
  ,["not established ex ante", "ex ante nicht als eingetretene Wirkung belegt"]
  ,["no high materiality marker identified at commitment level", "kein hochmaterialer kommunikativer Auslöser auf Ebene dieses Programmpunkts festgestellt"]
  ,["no high confidence boundary trigger identified", "kein Schutzgrenzen-Auslöser mit hoher Sicherheit festgestellt"]
  ,["no high confidence mismatch identified", "keine eindeutige fachliche Fehlzuordnung festgestellt"]
  ,["land direct or unclear", "unmittelbare Landeszuständigkeit oder noch zu klären"]
  ,["none identified", "keine festgestellt"]
  ,["context dependent", "kontextabhängig"]
  ,["material fundamental rights review", "vertiefte Grundrechtsprüfung erforderlich"]
  ,["not materially assessable", "aus diesem Quellfragment nicht belastbar materiell bewertbar"]
  ,["not decision ready", "noch nicht entscheidungsreif"]
  ,["not assessed from commitment fragment", "aus diesem Programmausschnitt nicht bewertet"]
  ,["Supplied commitment record is a table-of-contents/layout or generic programme fragment, not a sufficiently autonomous material commitment.", "Der gelieferte Programmeintrag ist ein Inhaltsverzeichnis-, Layout- oder allgemeines Fragment und keine hinreichend eigenständige materielle Zusage. Der Primärtext muss vor einer Richtungsbewertung rekonstruiert werden."]
  ,["Programme-level communicative analysis is retained separately.", "Die kommunikative Einordnung des Gesamtprogramms wird gesondert ausgewiesen."]
  ,["No mapping from unresolved/non-material source fragment.", "Aus einem ungeklärten oder nicht materiellen Quellfragment wird keine Zielzuordnung abgeleitet."]
  ,["verified reconstructed single", "als einzelner rekonstruierter Quellenbezug geprüft"]
  ,["plausible paths, no observed effects", "plausible Wirkpfade, keine beobachteten Wirkungen"]
  ,["policy", "politisches Instrument"]
]);

const publicTaxonomyValues = {
  rule_based_communicative_risk: "regelbasiert festgestelltes kommunikatives Risiko",
  institutional_delegitimation: "Delegitimierung von Institutionen",
  migration_othering_threat: "ausgrenzendes oder bedrohungsbezogenes Migrationsframing",
  media_information_delegitimation: "Delegitimierung von Medien und Informationsquellen",
  gender_family_sexuality_othering: "ausgrenzendes Framing zu Geschlecht, Familie oder Sexualität",
  climate_energy_delegitimation: "Delegitimierung von Klima- oder Energiepolitik",
  war_geopolitics: "Krieg und Geopolitik",
  elite_outgroup_conflict: "Konfliktframing zwischen Eliten und Außengruppen"
};

function humanizeMachineTokens(value) {
  let result = String(value);
  for (const [source, target] of publicPhraseTranslations) {
    result = result.replace(new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), target);
  }
  result = result
    .replace(/SDG_PLUS_([A-Z0-9_]+)/g, (_, key) => `SDG+ ${key.toLowerCase().replace(/_/g, " ")}`)
    .replace(/SDG_0?([0-9]{1,2})/g, "SDG $1")
    .replace(/\b[A-Z][A-Z0-9_]{2,}\b/g, (token) => machineValues[token] ?? (token.includes("_") ? token.toLowerCase().replace(/_/g, " ") : token))
    .replace(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g, (token) => publicTaxonomyValues[token] ?? labels[token] ?? token.replace(/_/g, " "))
    .replace(/\btrue\b/g, "ja")
    .replace(/\bfalse\b/g, "nein")
    .replace(/\bnull\b/g, "nicht angegeben");
  for (const [source, target] of publicPhraseTranslations) {
    result = result.replace(new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), target);
  }
  return result;
}

const labels = {
  material_commitments: "Dokumentierte Zusagen",
  commitment_assessments: "Dokumentierte Zusagen",
  central_impact_paths: "Zentrale Wirkpfade",
  cross_cutting_patterns: "Übergreifende Muster",
  cross_cutting_dependencies: "Übergreifende Abhängigkeiten",
  cross_case_links: "Zusammenhänge mit anderen Fällen",
  programme_level_communicative_pre_effect: "Kommunikative Vorwirkungen",
  calculation_requirements: "Berechnungsanforderungen",
  impact_paths: "Wirkpfade",
  impact_domains: "Betroffene Wirkungsfelder",
  counterfactuals: "Gegenfaktische Fragen",
  counterarguments: "Gegenargumente",
  data_gaps: "Offene Datenfragen",
  non_compensable_boundaries: "Nicht kompensierbare Grenzen",
  normative_mapping: "Zuordnung zum Referenzrahmen",
  source_refs: "Quellenbezüge",
  source_text: "Originalpassage",
  decision_or_measure: "Vorgeschlagene Maßnahme",
  intended_change: "Angestrebte Veränderung",
  decision_readiness: "Entscheidungsreife",
  responsible_actors: "Zuständige Akteure",
  affected_groups: "Betroffene Gruppen",
  impact_potential: "Wirkungspotenzial",
  impact_risks: "Wirkungsrisiken",
  implementation_conditions: "Bedingungen der Umsetzung",
  baseline_required: "Benötigter Ausgangswert",
  counterfactual_required: "Benötigtes Gegenfaktum",
  communicative_pre_effect: "Kommunikative Vorwirkung",
  evidence_status: "Evidenzstand",
  state_target_ids: "Berührte Landesziele",
  programme_profile: "Profil der Programmprüfung",
  declared_objectives: "Dokumentierter Prüfgegenstand",
  implementation_boundary: "Zuständigkeits- und Umsetzungsgrenze",
  material_policy_domains: "Berührte Politikfelder",
  impact_orders: "Wirkungen erster, zweiter und dritter Ordnung",
  distribution_and_time: "Verteilung und Zeitbezug",
  public_summary: "Kernaussage",
  plain_language_summary: "Kurz erklärt",
  public_release_boundary: "Grenze der Aussage",
  historical_feedback: "Rückblick",
  commitment_key: "Zusage-ID",
  location: "Fundstelle",
  page: "Seite oder Abschnitt",
  section: "Kapitel",
  status: "Status",
  missing_parameters: "Noch fehlende Angaben",
  path_id: "Wirkpfad-ID",
  expected_state_change: "Mögliche Zustandsveränderung",
  mechanism: "Wirkmechanismus",
  indicators: "Mögliche Indikatoren",
  risk: "Risiko",
  trigger_or_condition: "Auslöser oder Bedingung",
  affected_groups_or_goods: "Betroffene Gruppen oder Schutzgüter",
  outcome: "Zu prüfende Zustandsveränderung",
  possible_indicator: "Möglicher Indikator",
  baseline: "Ausgangswert",
  counterfactual: "Gegenfaktum",
  required_operands: "Benötigte Rechengrößen",
  data_gap: "Datenlücke",
  concern: "Prüfpunkt",
  rationale: "Begründung",
  question: "Prüffrage",
  human: "Mensch",
  planet: "Planet",
  democracy: "Demokratie",
  sdgs: "SDGs",
  sdg_plus: "SDG+",
  id: "Referenz",
  direction: "Richtung",
  release_1_1_change: "Änderung in Fachrevision 1.1",
  split_from: "Abgeleitet aus Wirkpfad",
  v1_1_review: "Fachrevision 1.1",
  direction_and_evidence: "Richtung und Evidenz",
  policy_modeled_direction: "Modellierte Richtung des politischen Instruments",
  policy_direction_targets: "Zielbezüge der modellierten Richtung",
  communicative_modeled_direction: "Modellierte kommunikative Richtung",
  combined_display_direction: "Richtung der öffentlichen Darstellung",
  direction_confidence: "Sicherheit der Richtungszuordnung",
  direction_confidence_note: "Hinweis zur Sicherheit der Richtungszuordnung",
  methodology_version: "Angewandter Methodenstand",
  confidence: "Sicherheit der Zuordnung",
  actual_effect_status: "Status beobachteter Wirkung",
  source_fragment_quality: "Qualität des Quellfragments",
  competence_and_legal: "Zuständigkeit und rechtlicher Prüfstatus",
  legal_review_flags: "Erforderliche rechtliche Prüfungen",
  legal_refs: "Rechtliche Bezugspunkte",
  legal_opinion_boundary: "Grenze der rechtlichen Einordnung",
  flag_id: "Prüfhinweis",
  analysis_time_status: "Zeitbezug der Analyse",
  first_order: "Erste Ordnung",
  second_order: "Zweite Ordnung",
  third_order: "Dritte Ordnung",
  benefit_and_burden_test: "Verteilung von Nutzen und Lasten",
  short_term: "Kurzfristig",
  medium_term: "Mittelfristig",
  long_term: "Langfristig",
  intergenerational_relevance: "Bedeutung für kommende Generationen",
  implementation_and_capacity: "Umsetzung und Kapazitäten",
  requirements: "Voraussetzungen",
  capacity_status: "Stand der Umsetzungskapazität",
  note: "Hinweis",
  reversibility_and_lock_in: "Reversibilität und Pfadbindung",
  decision_information_gap: "Informationslücken vor einer bindenden Entscheidung",
  required_before_binding_decision: "Vor einer bindenden Entscheidung erforderlich",
  monitoring_and_feedback: "Monitoring und Rückkopplung",
  primary_indicator: "Primärer Indikator",
  unit: "Einheit",
  earliest_review: "Frühester Prüfzeitpunkt",
  correction_trigger: "Korrekturtrigger",
  decision: "Die parlamentarische Entscheidung",
  ex_ante: "Ex ante: vor der Entscheidung",
  ex_post: "Ex post: nach der Entscheidung",
  ex_post_current_proposal: "Heutige Einordnung der aktuellen Vorlage",
  assessment_type: "Art der Prüfung",
  assessment: "Bewertungsstand",
  assessment_status: "Bewertungsstand",
  assessment_unit: "Bewertungseinheit",
  case_id: "Fallreferenz",
  consolidation_rule: "Regel für die Zusammenführung",
  debt_rule_relevant_net_borrowing_eur: "Für die Schuldenregel relevante Nettokreditaufnahme in Euro",
  ex_post_assessment: "Ex-post-Einordnung",
  source_conflict: "Quellenkonflikt",
  distributional_effects: "Wer profitiert – und wer trägt Belastungen?",
  implementation_dependencies: "Wovon hängt die Umsetzung ab?",
  questions: "Noch zu klärende Fragen",
  affected_mpd_dimensions: "Berührte Bereiche Mensch, Planet und Demokratie",
  normative_target_areas: "Berührte Ziel- und Schutzbereiche",
  source_ids: "Verwendete Quellen",
  required_sources: "Noch benötigte Quellen",
  official_sources: "Amtliche Quellen",
  candidate_sources: "Weitere zu prüfende Quellen",
  sources_and_evidence: "Quellen und Evidenz",
  official_inputs: "Amtliche Ausgangsdaten",
  available_inputs: "Verfügbare Eingangsdaten",
  calculation: "Berechnung",
  calculation_inputs: "Eingangsdaten der Berechnung",
  calculation_id: "Berechnungs-ID",
  assumptions_and_uncertainty: "Annahmen und Unsicherheit",
  baseline_needed: "Benötigter Ausgangswert",
  counterfactual_requirements: "Anforderungen an das Gegenfaktum",
  counterfactual_status: "Stand des Gegenfaktums",
  causal_boundary: "Grenze der kausalen Aussage",
  causal_claim_gate: "Prüfgate für kausale Aussagen",
  causal_effect: "Kausal zurechenbare Wirkung",
  causal_impact: "Kausal zurechenbare Wirkung",
  causal_limit: "Grenze der Kausalitätsaussage",
  causal_rule: "Regel für Kausalitätsaussagen",
  implementation_or_output: "Umsetzung oder erbrachte Leistung",
  observed_state_change: "Beobachtete Zustandsveränderung",
  observed_developments: "Beobachtbare Entwicklungen",
  output_outcome_impact_separation: "Leistung, Ergebnis und Wirkung getrennt betrachten",
  output: "Erbrachte Leistung",
  overall: "Gesamteinordnung",
  overall_potential: "Gesamtes Wirkungspotenzial",
  impact_logic: "Wirkungslogik",
  impact_information_readiness: "Reife der Wirkungsinformationen",
  impact_path_refs: "Zugehörige Wirkpfade",
  improvement_options: "Möglichkeiten für eine bessere Wirkung",
  effect_improving_options: "Möglichkeiten für eine bessere Wirkung",
  effect_improving_options_structured: "Strukturierte Möglichkeiten für eine bessere Wirkung",
  change_lever_for_positive_net_impact: "Hebel für eine positive Netto-Wirkung",
  why_it_can_improve_impact: "Warum dies die Wirkung verbessern kann",
  lever: "Veränderbarer Hebel",
  alternative_designs_and_counterfactuals: "Alternativen und Gegenfakten",
  better_decision_question: "Leitfrage für eine bessere Entscheidung",
  decision_basis: "Grundlage der Entscheidung",
  decision_gate_conclusion: "Ergebnis der Entscheidungsprüfung",
  decision_object_clarity: "Klarheit des Entscheidungsgegenstands",
  decision_state: "Stand der Entscheidung",
  decision_observed: "Entscheidung beobachtet",
  missing_inputs: "Fehlende Eingangsdaten",
  missing_decision_parameters: "Fehlende Angaben zur Entscheidung",
  material_missing_information: "Wesentliche fehlende Informationen",
  material_data_gap_count: "Wesentliche Datenlücken",
  required_before_or_for_review: "Vor einer Prüfung erforderlich",
  required_follow_up_data: "Benötigte Daten für die Rückkopplung",
  required_analysis: "Noch erforderliche Analyse",
  required_inputs: "Benötigte Eingangsdaten",
  prerequisites: "Voraussetzungen",
  pre_decision_effect_screening: "Folgenprüfung vor der Entscheidung",
  screen_dimensions: "Geprüfte Dimensionen",
  ten_policy_field_screening: "Prüfung der zehn Politikfelder",
  non_compensation: "Nichtkompensationsprüfung",
  non_compensation_relevance: "Bedeutung für die Nichtkompensationsprüfung",
  no_end_score: "Keine vereinfachende Gesamtpunktzahl",
  no_score_permitted: "Keine Gesamtpunktzahl zulässig",
  no_party_or_person_assessment: "Keine Bewertung von Parteien oder Personen",
  normative_framework: "Normativer Referenzrahmen",
  reference_frame: "Referenzrahmen",
  reference_snapshot_reconciliation: "Abgleich des Referenzstands",
  constitutional_anchor_mappings: "Verfassungs- und Schutzbezüge",
  protection_gates: "Schutzgrenzen",
  source_anchor_risks: "Grenzen der Quellenbelege",
  source_completeness: "Vollständigkeit der Quellen",
  source_status: "Quellenstatus",
  source_title: "Quellentitel",
  source_institution: "Herausgebende Stelle",
  source_note: "Hinweis zur Quelle",
  source_id: "Technischer Quellenbezug",
  canonical_url: "Quellendetail",
  url: "Quellendetail",
  title: "Titel",
  institution: "Herausgebende Stelle",
  temporal_class: "Zeitliche Einordnung",
  exact_location: "Genaue Fundstelle",
  relevant_locations: "Relevante Fundstellen",
  needed_for: "Wofür die Quelle benötigt wird",
  what_it_actually_supports: "Was die Quelle tatsächlich belegt",
  what_it_does_not_support: "Was die Quelle nicht belegt",
  what_it_supports: "Was die Quelle belegt",
  verification_status: "Prüfstand der Quelle",
  source_type: "Quellenart",
  publication_date: "Veröffentlichungsdatum",
  retrieval_date: "Abrufdatum",
  mapping_status: "Stand der Zuordnung",
  qualitative_mapping_status: "Stand der qualitativen Zuordnung",
  sdg_mappings: "Zuordnung zu den Nachhaltigkeitszielen",
  sdg_plus_mappings: "Zuordnung zu SDG+",
  tile_mappings: "Darstellung der Zielbezüge",
  mpd_dimensions: "Mensch, Planet und Demokratie",
  framework: "Referenzrahmen",
  gate: "Schutzgrenze",
  gate_status: "Stand der Schutzgrenzenprüfung",
  score_status: "Stand der Gesamtbewertung",
  quantification_status: "Stand der Quantifizierung",
  evidence_type: "Art der Evidenz",
  evidence_boundary: "Grenze der Evidenzaussage",
  effect_evidence_available_in_package: "Wirkungsevidenz im Fallpaket vorhanden",
  source_use_rule: "Regel für die Quellenverwendung",
  relevance: "Relevanz",
  risks: "Risiken",
  risks_and_side_effects: "Risiken und mögliche Nebenwirkungen",
  risk_id: "Risiko-ID",
  severity: "Bedeutung",
  boundary: "Schutzgrenze",
  correction_triggers: "Korrekturtrigger",
  monitoring_plan: "Plan für Beobachtung und Rückkopplung",
  earliest_credible_review_date: "Frühester belastbarer Prüfzeitpunkt",
  earliest_meaningful_review_date: "Frühester sinnvoller Prüfzeitpunkt",
  observation_period: "Beobachtungszeitraum",
  actual_outcome: "Tatsächliches Ergebnis",
  final_version: "Beschlossene Fassung",
  parliamentary_status: "Parlamentarischer Stand",
  confirmation_status: "Bestätigungsstand",
  vote_layer: "Abstimmungsebene",
  vote_interpretation_rule: "Regel zur Einordnung des Abstimmungsverhaltens",
  roll_call: "Namentliche Abstimmung",
  factions: "Fraktionen",
  members: "Abgeordnete",
  individual_records_status: "Stand der Einzelstimmen",
  yes: "Ja",
  no: "Nein",
  abstain: "Enthaltung",
  not_voted: "Nicht abgestimmt",
  intent_boundary: "Grenze der Absichtsaussage",
  interpretation_boundary: "Grenze der Einordnung",
  separation_rule: "Trennungsregel",
  status_rationale: "Begründung des Status",
  publication_readiness: "Veröffentlichungsreife",
  public_release_status: "Veröffentlichungsstand",
  public_title: "Öffentlicher Titel",
  public_key_statement: "Öffentliche Kernaussage",
  key_statement: "Kernaussage",
  what_is_known: "Was bekannt ist",
  what_is_not_yet_known: "Was noch nicht bekannt ist",
  maturity_label: "Reifegrad",
  maturity_stage: "Reifestufe",
  case_snapshot_preserved: "Ursprünglicher Fallstand gesichert",
  preserved_case_snapshot_status: "Stand des gesicherten Fallstands",
  controlled_release_snapshot_id: "Kontrollierter Referenzstand",
  controlled_release_snapshot_status: "Stand des kontrollierten Referenzstands",
  release_1_0: "Freigegebener Veröffentlichungsstand",
  release_1_1_note: "Hinweis zur Fachrevision 1.1",
  scope_statement: "Gegenstand der Prüfung",
  statement: "Aussage",
  finding_id: "Prüfbefund",
  meaning: "Bedeutung",
  consequence: "Folge für die Einordnung",
  rule: "Regel",
  specification: "Konkretisierung",
  aggregation_effect: "Folge für die Zusammenführung",
  option: "Option",
  option_id: "Option",
  date_rule: "Regel zum Zeitbezug",
  date: "Datum",
  learning_point: "Lernpunkt",
  result: "Ergebnis",
  label: "Bezeichnung",
  dimension: "Dimension",
  domain: "Wirkungsfeld",
  policy_field: "Politikfeld",
  name: "Bezeichnung",
  type: "Art",
  hypothesis: "Wirkungshypothese",
  requires_validation: "Empirische Prüfung erforderlich",
  analytical_derivation: "Analytisch hergeleitet",
  general_path: "Allgemeiner Wirkpfad",
  portfolio: "Gesamtportfolio",
  portfolio_architecture: "Architektur des Gesamtportfolios",
  ministry_allocation_signals: "Verteilungssignale zwischen Ressorts",
  separately_reported_special_funds: "Gesondert ausgewiesene Sondervermögen",
  open_calculation_requirement_count: "Offene Berechnungsanforderungen",
  not_equivalent_to_review_status: "Nicht gleichzusetzen mit dem fachlichen Prüfstand",
  affected_commitment_keys: "Zugehörige Programmzusagen",
  case_ids: "Verknüpfte Fälle",
  communicative_pre_effect_v1_1: "Mögliche kommunikative Vorwirkung",
  programme_level_communicative_pre_effect_v1_1: "Kommunikative Vorwirkung des Gesamtprogramms",
  competence_rule_counts: "Anzahl der Zuständigkeitsprüfungen",
  competence_rule_hits: "Ergebnisse der Zuständigkeitsprüfung",
  effect_path: "Wirkpfad",
  evidence_map: "Übersicht der Evidenz",
  exposure_to_effect_ladder: "Von der Wahrnehmung zur möglichen Wirkung",
  media_and_perception_layer: "Medien- und Wahrnehmungsebene",
  non_compensation_gate: "Nichtkompensationsprüfung",
  observed_outcomes: "Beobachtete Zustandsveränderungen",
  quality_gate: "Qualitätsprüfung",
  required_evidence: "Noch benötigte Evidenz",
  risks_and_boundaries: "Risiken und Schutzgrenzen",
  rule_hits: "Angewandte Regeln",
  layer: "Prüfebene",
  matched_excerpt: "Auslösende Textstelle",
  priority: "Priorität",
  flags: "Prüfhinweise",
  source_components: "Bestandteile der Quelle",
  components: "Quellenausschnitte",
  text: "Originalpassage",
  source_evidence: "Quellenbelege",
  source_fragment_gate: "Prüfung des Quellenausschnitts",
  source_summary: "Zusammenfassung der Quelle",
  source_v1_0: "Quellenstand",
  source_verification: "Prüfung des Quellenbezugs",
  actual_effect_boundary: "Grenze der Aussage über tatsächliche Wirkung",
  basis_rule: "Grundregel",
  bundestag_decision_date: "Datum der Bundestagsentscheidung",
  causal_attribution: "Kausale Zurechnung",
  causal_media_to_behaviour_evidence: "Evidenz für den Pfad von Medien zu Verhalten",
  causal_quality: "Qualität der kausalen Evidenz",
  causal_status: "Stand der kausalen Einordnung",
  component_no: "Quellenbestandteil",
  core_rule: "Kernregel",
  cross_bubble_amplification: "Verstärkung über verschiedene Öffentlichkeiten hinweg",
  diagnosis_or_frame: "Diagnose oder Deutungsrahmen",
  document_date: "Dokumentdatum",
  effect_boundary: "Grenze der Wirkungsaussage",
  epistemic_status: "Wissensstand",
  evidence: "Evidenz",
  expected_impact_potential: "Erwartetes Wirkungspotenzial",
  illusory_truth_assessment: "Prüfung möglicher Wiederholungseffekte",
  illusory_truth_risk: "Risiko eines Wiederholungseffekts",
  impact_potential_only: "Nur Wirkungspotenzial",
  implementation: "Umsetzung",
  implementation_statistics: "Daten zur Umsetzung",
  input_commitment_register_hash: "Prüfsumme des Zusagenregisters",
  input_register_text: "Text im Zusagenregister",
  link_resolution_status: "Stand der Verknüpfung",
  material_commitment_count: "Materielle Programmzusagen",
  net_impact: "Netto-Wirkung",
  no_individual_motive_claims: "Keine Zuschreibung individueller Motive",
  no_intent_inference: "Keine Absichtszuschreibung",
  no_party_score: "Keine Gesamtpunktzahl für Parteien",
  normative_demand_or_proposal: "Normative Forderung oder Vorschlag",
  not_observed_reason: "Warum noch keine Wirkung beobachtbar ist",
  official_name: "Amtliche Bezeichnung",
  official_status_check: "Prüfung des amtlichen Stands",
  official_status_reconciliation: "Abgleich des amtlichen Stands",
  original_implementation_level: "Ursprünglich angesprochene politische Ebene",
  platform_and_media_boundary: "Grenze der Plattform- und Medienaussage",
  policy_commitment_or_proposal: "Politische Zusage oder Vorschlag",
  publication_status: "Veröffentlichungsstand",
  reference_status: "Stand des Referenzrahmens",
  release_boundary: "Grenze der Veröffentlichungsaussage",
  release_status: "Freigabestand",
  representative_perception_evidence: "Repräsentative Evidenz zur Wahrnehmung",
  rule_based_communicative_risk: "Regelbasiert festgestelltes kommunikatives Risiko",
  rule_id: "Angewandte Regel",
  scope_and_boundary: "Gegenstand und Grenze der Prüfung",
  source_component: "Quellenbestandteil",
  source_document_hash: "Prüfsumme des Quelldokuments",
  source_excerpt: "Quellenausschnitt",
  source_fidelity: "Quellentreue",
  source_fragment_review_candidates: "Zu prüfende Quellenausschnitte",
  source_location: "Fundstelle",
  source_page: "Quellenseite",
  source_preservation: "Sicherung der Quelle",
  source_rule: "Regel für die Quellenverwendung",
  source_text_reviewed: "Quelltext geprüft",
  source_verification_method: "Methode der Quellenprüfung",
  cluster: "Prüfmuster",
  marker: "Auslösende Formulierung",
  markers: "Auslösende Formulierungen",
  frame_clusters: "Kommunikative Prüfmuster",
  items: "Einzelprüfungen",
  communicative_direction_counts: "Verteilung der kommunikativen Richtungen",
  reviewed_competence_path: "Geprüfter Zuständigkeitsweg",
  "DIAGNOSIS OR FRAME": "Diagnose oder Deutungsrahmen",
  "NORMATIVE DEMAND OR PROPOSAL": "Normative Forderung oder Vorschlag",
  "POLICY COMMITMENT OR PROPOSAL": "Politische Zusage oder Vorschlag",
  DIAGNOSIS_OR_FRAME: "Diagnose oder Deutungsrahmen",
  NORMATIVE_DEMAND_OR_PROPOSAL: "Normative Forderung oder Vorschlag",
  POLICY_COMMITMENT_OR_PROPOSAL: "Politische Zusage oder Vorschlag",
  publisher: "Herausgeber",
  analysis_cutoff: "Stand der Analyse",
  promulgation: "Verkündung",
  principal_entry_into_force: "Überwiegendes Inkrafttreten",
  version: "Fassung",
  version_timeline: "Zeitlicher Verlauf der Fassungen",
  core_content: "Kerninhalt",
  change_from_previous: "Änderung gegenüber der vorherigen Fassung",
  retrieved_at: "Abgerufen am",
  knowledge_cutoff: "Wissensstand bis",
  observation_cutoff: "Beobachtungsstand bis",
  referentenentwurf: "Referentenentwurf",
  current_law: "Geltendes Recht",
  provided_primary_documents: "Bereitgestellte Primärdokumente",
  scenario_id: "Szenario",
  description: "Beschreibung",
  pattern_id: "Prüfmuster",
  pattern: "Muster",
  period: "Zeitraum",
  potential_path: "Möglicher Wirkpfad",
  strongest_alternative_explanation: "Stärkste alternative Erklärung",
  outcome_id: "Beobachtungsgegenstand",
  classification: "Einordnung",
  observation: "Beobachtung",
  year: "Jahr",
  value: "Wert",
  attribution_basis: "Grundlage der Zurechnung",
  uncertainty: "Unsicherheit",
  data_quality: "Datenqualität",
  model_quality: "Modellqualität",
  argument: "Argument",
  response: "Einordnung",
  government_draft: "Regierungsentwurf",
  committee_final: "Abschließende Ausschussfassung"
  ,applied: "Angewendet"
  ,correction_caveat: "Einschränkung der Korrektur"
  ,deep_reviewed_at: "Vertieft geprüft am"
  ,indicator: "Indikator"
  ,measure: "Maßnahme"
  ,reason: "Begründung"
  ,reference: "Referenz"
  ,reviewed_at: "Geprüft am"
  ,topic: "Themenbereich"
  ,additional_layers: "Weitere Prüfebenen"
  ,candidate_coalition_commitment_keys: "Mögliche Bezüge zum Koalitionsvertrag"
  ,changed_commitment_keys: "Geänderte Zusagen"
  ,coalition_to_parliament_review: "Abgleich zwischen Koalitionsvertrag und Parlament"
  ,commitment_keys: "Zugehörige Zusagen"
  ,component_topics: "Themen der Quellenausschnitte"
  ,conditions: "Bedingungen"
  ,frame_markers: "Auslösende kommunikative Muster"
  ,method_reference: "Methodischer Bezug"
  ,methodology_extension: "Methodische Erweiterung"
  ,programme_to_coalition_review: "Abgleich zwischen Wahlprogramm und Koalitionsvertrag"
  ,provenance: "Herkunft und Nachvollziehbarkeit"
  ,quality_assurance: "Qualitätssicherung"
  ,research_need: "Weiterer Forschungsbedarf"
};

function labelFor(value) {
  const clean = value.trim().replace(/:$/, "");
  return labels[clean] ?? clean.replace(/_/g, " ");
}

function publicSourceDetailHref(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return `/quellen/quelle-${crypto.createHash("sha256").update(url.toString()).digest("hex").slice(0, 16)}`;
  } catch {
    return null;
  }
}

function collectSourceReferences(...roots) {
  const references = new Map();
  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;
    const id = typeof value.source_id === "string" ? value.source_id.trim() : "";
    const title = typeof value.title === "string" ? value.title.trim() : typeof value.source_title === "string" ? value.source_title.trim() : "";
    const institution = typeof value.institution === "string" ? value.institution.trim() : typeof value.source_institution === "string" ? value.source_institution.trim() : "";
    const url = typeof value.url === "string" ? value.url.trim() : typeof value.canonical_url === "string" ? value.canonical_url.trim() : "";
    if (id && (title || institution || url)) {
      const previous = references.get(id) ?? {};
      references.set(id, {
        title: title || previous.title || "",
        institution: institution || previous.institution || "",
        url: url || previous.url || ""
      });
    }
    Object.values(value).forEach(visit);
  };
  roots.forEach(visit);
  return references;
}

const publicSourceTokenPattern = "(?:[0-9a-f]{8}-[0-9a-f-]{27,}|CAND-[A-Z0-9-]+|GEG-SRC-\\d{2})";

function sourceAliases(markdown) {
  const ids = [];
  const matcher = new RegExp(`(?:^[-*]\\s+|^\\*\\*source_id:\\*\\*\\s*)(${publicSourceTokenPattern})\\s*$`, "gmi");
  for (const match of markdown.matchAll(matcher)) {
    if (!ids.includes(match[1])) ids.push(match[1]);
  }
  return new Map(ids.map((id, index) => [id, `Quelle ${index + 1}`]));
}

function renderSourceReference(id, references, aliases) {
  const reference = references.get(id);
  const alias = aliases.get(id) ?? "Quelle der Fachakte";
  if (!reference) {
    return `<span class="source-reference"><strong>${escapeHtml(alias)}</strong><small>Die Detailbezeichnung ist im bereitgestellten Fallpaket nicht enthalten.</small></span>`;
  }
  const title = reference.title || alias;
  const meta = reference.institution && reference.institution !== title ? `<small>${escapeHtml(reference.institution)}</small>` : "";
  const href = reference.url ? publicSourceDetailHref(reference.url) : null;
  const link = href ? `<a href="${href}">Quellendetail ansehen</a>` : "";
  return `<span class="source-reference"><strong>${escapeHtml(title)}</strong>${meta}${link}</span>`;
}

function isInternalLine(line) {
  return /^(#+ .*vollständige Darstellung|#+ GEG – vollständige Publikationsquelle|#+ Teil [AB] –|#+ Strukturierte GEG-Fachanalyse|> Vollständige, automatisch strukturierte Darstellung|> Die ursprüngliche Review-Datei|> Diese Publikationsquelle erhält|\*\*(Quellendatei|SHA-256|schema_version|source_key|source_hash|review_status|analysis_version|input_package_hash|review_id|previous_review_id|generated_at|reference_snapshot_id|case_id|source_id):)/i.test(line.trim());
}

const hiddenPublicFieldKeys = new Set([
  "schema_version",
  "source_key",
  "source_document_hash",
  "input_package_hash",
  "input_commitment_register_hash",
  "reference_snapshot_id",
  "review_status",
  "commitment_key",
  "case_id",
  "source_id",
  "match_score",
  "token_coverage",
  "new_token_coverage",
  "coverage",
  "top_score"
  ,"programme_commitment_key"
]);

function markdownToArticle(markdown, sourceReferences = new Map()) {
  const lines = markdown.split(/\r?\n/).filter((line) => !isInternalLine(line));
  const html = [];
  let listOpen = false;
  let paragraph = [];
  let activeHeading = "";
  let rootHeading = "";
  let commitmentOpen = false;
  let commitment = null;
  const aliases = sourceAliases(markdown);

  const closeList = () => {
    if (listOpen) html.push("</ul>");
    listOpen = false;
  };
  const closeParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(" "), sourceReferences)}</p>`);
    paragraph = [];
  };
  const closeCommitment = () => {
    closeParagraph();
    closeList();
    if (commitmentOpen && commitment && !commitment.directionRendered) {
      const measure = normalizePublicText(commitment.measure || "dieser Programmpunkt");
      const stateChange = normalizePublicText(commitment.stateChange || "Der konkrete Zielzustand, die Reichweite und die Verteilungsfolgen sind im vorliegenden Programmpunkt nicht hinreichend bestimmt.");
      const sourceReason = normalizePublicText(commitment.reason || "");
      const detailedReason = sourceReason || `Der Programmpunkt „${measure}“ beschreibt eine politische Absicht. Als mögliche Zustandsveränderung ist dokumentiert: ${stateChange} Ob diese Veränderung den Referenzrahmen stärkt oder schwächt, hängt jedoch von Ausgestaltung, Reichweite, betroffenen Gruppen, Gegenfaktum und Vollzug ab. Ohne diese Angaben wäre eine positive, negative oder neutrale Festlegung fachlich nicht belastbar.`;
      html.push(`<aside class="commitment-direction commitment-direction--open" aria-label="Wirkungsökonomische Kurzeinordnung dieses Programmpunkts"><p class="commitment-direction-label">Wirkungsökonomische Kurzeinordnung · Wirkungsrichtung offen – nicht neutral</p>${commitment.measure ? `<p><strong>Programmpunkt:</strong> ${inline(commitment.measure, sourceReferences)}</p>` : ""}<p><strong>Was sich verändern könnte:</strong> ${inline(stateChange, sourceReferences)}</p><p><strong>Ausführliche Begründung:</strong> ${inline(detailedReason, sourceReferences)}</p>${commitment.risks.length ? `<p><strong>Besonders zu prüfen:</strong> ${commitment.risks.map((risk) => inline(risk, sourceReferences)).join("; ")}.</p>` : ""}</aside>`);
    }
    if (commitmentOpen) html.push("</section>");
    commitmentOpen = false;
    commitment = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeParagraph();
      closeList();
      continue;
    }
    if (/^---+$/.test(line)) {
      closeParagraph(); closeList(); html.push("<hr>"); continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      closeParagraph(); closeList();
      const sourceLevel = heading[1].length;
      const rawHeading = heading[2].trim().replace(/:$/, "");
      if (["material_commitments", "commitment_assessments", "Dokumentierte Zusagen"].includes(rawHeading)) {
        closeCommitment();
        rootHeading = rawHeading;
      } else if (((rootHeading === "material_commitments" && sourceLevel === 3) || (rootHeading === "commitment_assessments" && sourceLevel === 4) || (rootHeading === "Dokumentierte Zusagen" && [3, 4].includes(sourceLevel))) && /^Eintrag\s+\d+$/i.test(rawHeading)) {
        closeCommitment();
        commitmentOpen = true;
        commitment = { measure: "", stateChange: "", risks: [], reason: "", directionRationale: "", directionPhase: false, directionRendered: false };
        html.push('<section class="commitment-analysis">');
      } else if (sourceLevel <= 3) {
        closeCommitment();
        rootHeading = rawHeading;
      }
      // The document already has one visible h1. Preserve the source nesting
      // below it so the long record can be navigated and grouped correctly.
      const level = Math.min(Math.max(sourceLevel - 1, 2), 5);
      activeHeading = rawHeading;
      html.push(`<h${level}>${inline(labelFor(activeHeading), sourceReferences)}</h${level}>`);
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      closeParagraph();
      if (!listOpen) { html.push("<ul>"); listOpen = true; }
      const sourceId = new RegExp(`^(${publicSourceTokenPattern})$`, "i").exec(bullet[1])?.[1];
      if (sourceId && ["source_ids", "source_refs", "source_refs_used", "required_sources"].includes(activeHeading)) {
        html.push(`<li>${renderSourceReference(sourceId, sourceReferences, aliases)}</li>`);
      } else if (sourceId && activeHeading === "case_ids") {
        const relatedCase = publicIndex.cases[sourceId];
        html.push(relatedCase
          ? `<li><a href="/fachakten/case-${escapeHtml(sourceId)}">${inline(relatedCase.title ?? relatedCase.resultHeadline ?? "Verknüpfte Wirkungsakte")}</a></li>`
          : "<li>Verknüpfte Wirkungsakte</li>");
      } else {
        html.push(`<li>${inline(bullet[1], sourceReferences)}</li>`);
      }
      continue;
    }
    closeList();
    const sourceIdLine = new RegExp(`^\\*\\*(?:source_id|case_id):\\*\\*\\s*(${publicSourceTokenPattern})$`, "i").exec(line);
    if (sourceIdLine) continue;
    const sourceUrlLine = /^\*\*(?:canonical_url|url):\*\*\s*(https:\/\/\S+)$/i.exec(line);
    if (sourceUrlLine) {
      closeParagraph();
      const href = publicSourceDetailHref(sourceUrlLine[1]);
      if (href) html.push(`<p><strong>Quellendetail:</strong> <a href="${href}">Quelle, Einordnung und Fundstellen ansehen</a></p>`);
      continue;
    }
    const field = /^\*\*([^*]+):\*\*\s*(.*)$/.exec(line);
    if (field && hiddenPublicFieldKeys.has(field[1])) continue;
    if (commitment && field) {
      const [, key, value] = field;
      if (["decision_or_measure", "measure"].includes(key)) commitment.measure = value;
      if (["expected_state_change", "intended_change"].includes(key) && !commitment.stateChange) commitment.stateChange = value;
      if (key === "risk" && commitment.risks.length < 3) commitment.risks.push(value);
      if (key === "reason" && !commitment.reason) commitment.reason = value;
      if (key === "policy_modeled_direction") commitment.directionPhase = true;
      if (key === "rationale" && commitment.directionPhase) commitment.directionRationale = value;
      if (key === "combined_display_direction") {
        closeParagraph();
        const direction = value.trim().toUpperCase();
        const directionLabel = humanizeMachineTokens(direction);
        const directionClass = ["POSITIVE", "NEGATIVE", "AMBIVALENT", "OPEN"].includes(direction) ? direction.toLowerCase() : "open";
        const detailedReason = commitment.directionRationale || (direction === "OPEN"
          ? "Die Richtung wird ausdrücklich nicht als neutral behandelt. Das Programm benennt eine Maßnahme, lässt aber mindestens Ausgestaltung, Reichweite, Gegenfaktum oder Verteilungsfolgen offen. Deshalb kann die Veränderung vor einer Konkretisierung nicht seriös als positiv oder negativ festgelegt werden."
          : "Die Richtung ergibt sich aus dem dokumentierten Wirkmechanismus und den betroffenen Ziel- und Schutzbereichen; sie ist eine Ex-ante-Einordnung und noch kein Nachweis einer eingetretenen Wirkung.");
        html.push(`<aside class="commitment-direction commitment-direction--${directionClass}" aria-label="Wirkungsökonomische Kurzeinordnung dieses Programmpunkts"><p class="commitment-direction-label">Wirkungsökonomische Kurzeinordnung · ${escapeHtml(directionLabel)}</p>${commitment.measure ? `<p><strong>Programmpunkt:</strong> ${inline(commitment.measure, sourceReferences)}</p>` : ""}${commitment.stateChange ? `<p><strong>Was sich verändern könnte:</strong> ${inline(commitment.stateChange, sourceReferences)}</p>` : ""}<p><strong>Ausführliche Begründung:</strong> ${inline(detailedReason, sourceReferences)}</p>${commitment.risks.length ? `<p><strong>Besonders zu prüfen:</strong> ${commitment.risks.map((risk) => inline(risk, sourceReferences)).join("; ")}.</p>` : ""}</aside>`);
        commitment.directionRendered = true;
        commitment.directionPhase = false;
      }
    }
    paragraph.push(line.replace(/^\*\*([^*]+):\*\*/, (_, key) => `**${labelFor(key)}:**`));
  }
  closeCommitment();
  return html.join("\n");
}

function summaryFor(id) {
  if (id === "gebaeudeenergiegesetz-medienwirkung") {
    const analysis = publicAnalyses.find((item) => item.slug === id);
    return analysis ? {
      resultHeadline: "Fassung, Wirkungspotenzial, Umsetzung und Medienresonanz bleiben getrennt",
      resultTeaser: analysis.summary,
      impactPaths: analysis.impactPaths?.length ?? 0,
      calculations: analysis.calculationRequirements?.length ?? 0,
      dataGaps: analysis.dataGaps?.length ?? 0,
      sourceCount: analysis.sources?.length ?? 0,
      potentialHighlights: [analysis.exAnte?.summary].filter(Boolean),
      riskHighlights: [analysis.publicationBoundary].filter(Boolean),
      conditions: ["Beobachtete Entwicklung erst mit Gegenfaktum, Zurechnung und Unsicherheitsangabe als Wirkung einordnen."]
    } : null;
  }
  if (id.startsWith("case-")) return publicIndex.cases[id.slice(5)] ?? null;
  const sourceKey = id.startsWith("sachsen-anhalt-")
    ? `ltw-2026-st-${id.slice("sachsen-anhalt-".length)}`
    : id.slice("bund-".length);
  return publicIndex.programmes[sourceKey] ?? null;
}

function resultOverview(summary) {
  if (!summary) return "";
  const metrics = [
    [summary.commitments ?? null, "quellengebundene Zusagen"],
    [summary.impactPaths ?? null, "zentrale Wirkpfade"],
    [summary.domains ?? summary.calculations ?? null, summary.domains !== undefined ? "berührte Politikfelder" : "Berechnungsansätze"],
    [summary.dataGaps ?? null, "offene Datenfragen"],
    [summary.sourceCount ?? null, "eingeordnete Quellen"]
  ].filter(([value]) => value !== null && value !== undefined);
  const cards = [
    ["<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"6\" cy=\"12\" r=\"2.5\"></circle><circle cx=\"18\" cy=\"12\" r=\"2.5\"></circle><path d=\"M8.5 12h7\"></path></svg>", "Wirkungspotenzial", summary.potentialHighlights],
    ["!", "Risiken und Zielkonflikte", summary.riskHighlights],
    ["?", "Vor einer Entscheidung klären", summary.conditions]
  ].filter(([, , items]) => Array.isArray(items) && items.length > 0);
  return `<section class="dossier-overview" aria-labelledby="dossier-result-title">
    <div class="dossier-result-copy"><p class="eyebrow">Ergebnis auf einen Blick</p><h2 id="dossier-result-title">${inline(summary.resultHeadline ?? "Wirkungsprüfung mit dokumentierter Herleitung")}</h2><p>${inline(summary.resultTeaser ?? summary.summary ?? "Die Kurzansicht ordnet den vollständigen Prüfbestand ein.")}</p></div>
    ${metrics.length ? `<dl class="dossier-metrics">${metrics.map(([value, label]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>` : ""}
    ${cards.length ? `<div class="dossier-result-grid">${cards.map(([icon, heading, items]) => `<article><span class="dossier-icon" aria-hidden="true">${icon}</span><h3>${heading}</h3><ul>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul></article>`).join("")}</div>` : ""}
    ${summary.communicationNote ? `<aside class="dossier-communication"><strong>Kommunikative Vorwirkung</strong><p>${inline(summary.communicationNote)}</p></aside>` : ""}
  </section>`.replace(/^[ \t]+$/gm, "");
}

function documentHtml({ id, title, article, overviewHref, summary }) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Institut für Wirkungsökonomie">
  <title>${escapeHtml(title)} – Vollständige Fachakte</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/fachakten/dossiers.css">
  <script src="/fachakten/dossiers.js" defer></script>
</head>
<body>
  <header class="dossier-header"><div><a href="${overviewHref}">← Zur kompakten Fachakte</a><p class="eyebrow">Institut für Wirkungsökonomie · vollständige Wirkungsakte</p><h1>${escapeHtml(title)}</h1><p>Ergebnis zuerst, vollständige Herleitung darunter: Quelle, Wirkpfade, Risiken, Schutzgrenzen, Berechnungsbedarf und Datenlücken bleiben bis zum einzelnen Prüfpunkt nachvollziehbar.</p></div></header>
  <main>
    ${resultOverview(summary)}
    <section class="dossier-method-path" aria-labelledby="method-path-title"><div><p class="eyebrow">So liest sich die Akte</p><h2 id="method-path-title">Vom politischen Satz zur überprüfbaren Wirkung.</h2></div><ol><li><span aria-hidden="true">1</span><strong>Quelle</strong><small>Was wird konkret vorgeschlagen?</small></li><li><span aria-hidden="true">2</span><strong>Wirkpfad</strong><small>Welcher Zustand könnte sich wie verändern?</small></li><li><span aria-hidden="true">3</span><strong>Referenz</strong><small>Welche SDGs, SDG+ und Schutzgüter sind berührt?</small></li><li><span aria-hidden="true">4</span><strong>Prüfung</strong><small>Welche Risiken, Grenzen und Alternativen zählen?</small></li><li><span aria-hidden="true">5</span><strong>Messung</strong><small>Welche Daten würden Wirkung belegen?</small></li></ol></section>
    <section class="dossier-tools" aria-label="Werkzeuge für die vollständige Akte"><label for="dossier-search">In der vollständigen Akte suchen</label><div><input id="dossier-search" type="search" placeholder="Begriff, Politikfeld oder Zusage"><button type="button" data-action="expand">Alle Treffer öffnen</button><button type="button" data-action="collapse">Alle schließen</button></div><p id="dossier-search-status" role="status" aria-live="polite"></p></section>
    <div class="dossier-layout"><aside class="dossier-toc"><nav aria-label="Inhalt der Fachakte"><strong>In dieser Akte</strong><ol id="dossier-toc-list"></ol></nav></aside><article id="dossier-content" data-dossier-id="${escapeHtml(id)}">${article}</article></div>
  </main>
  <footer><p><strong>Herausgeber:</strong> Institut für Wirkungsökonomie</p><p><a href="${overviewHref}">Zur kompakten Fachakte</a> · <a href="/methodik">Methodik</a> · <a href="/quellen">Quellen</a></p></footer>
</body>
</html>`;
}

const documents = programmeDocuments.map(([id, title, relativePath]) => ({ id, title, source: path.join(sourceRoot, relativePath), overviewHref: `/fachakten/${id}` }));
documents.push({
  id: "gebaeudeenergiegesetz-medienwirkung",
  title: "Gebäudeenergiegesetz 2023: Medienwirkung und Umsetzung",
  source: path.join(sourceRoot, "02_parlament_28_and_votes", "fachanalysen", "geg", "GEG-VOLLSTAENDIGE-PUBLIKATIONSQUELLE.md"),
  overviewHref: "/fachanalysen/gebaeudeenergiegesetz-medienwirkung"
});
const caseDirectory = path.join(sourceRoot, "02_parlament_28_and_votes", "cases");
for (const caseId of fs.readdirSync(caseDirectory)) {
  const reviewPath = path.join(caseDirectory, caseId, "review-result.json");
  const markdownPath = path.join(caseDirectory, caseId, "VOLLSTAENDIGE-FACHDARSTELLUNG.md");
  if (!fs.existsSync(reviewPath) || !fs.existsSync(markdownPath)) continue;
  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  const supplementPath = path.join(caseDirectory, caseId, "decision-and-vote-supplement.json");
  const supplement = fs.existsSync(supplementPath) ? JSON.parse(fs.readFileSync(supplementPath, "utf8")) : {};
  documents.push({ id: `case-${caseId}`, caseId, review, supplement, title: review.release_1_0?.public_title ?? review.public_summary?.headline ?? review.decision?.object ?? "Wirkungsakte", source: markdownPath, overviewHref: `/fachakten/case-${caseId}` });
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.rmSync(integrityRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
fs.mkdirSync(integrityRoot, { recursive: true });
const integrityReports = [];

const publishableReviewFields = ["decision", "ex_ante", "ex_post", "impact_paths", "impact_domains", "calculation_requirements", "risks", "non_compensable_boundaries", "counterarguments", "counterfactuals", "cross_case_links", "data_gaps", "normative_mapping", "source_completeness", "source_conflicts", "release_1_0", "public_summary"];
const publishableSupplementFields = ["decision_object_clarity", "impact_information_readiness", "decision_readiness", "missing_decision_parameters", "better_decision_question", "alternative_designs_and_counterfactuals", "pre_decision_effect_screening", "reversibility_and_lock_in", "decision_information_gap", "decision_gate_conclusion", "vote_layer", "vote_interpretation_rule"];

function hasPublicValue(value) {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function substantiveSentinel(value) {
  if (typeof value === "string" && value.trim().length >= 24 && !/^https?:/i.test(value)) return value.trim();
  if (Array.isArray(value)) for (const item of value) { const candidate = substantiveSentinel(item); if (candidate) return candidate; }
  if (value && typeof value === "object") for (const item of Object.values(value)) { const candidate = substantiveSentinel(item); if (candidate) return candidate; }
  return "";
}

function fieldRendered(article, field, value) {
  const sentinel = substantiveSentinel(value);
  if (sentinel && article.includes(escapeHtml(humanizeMachineTokens(sentinel)))) return true;
  return article.includes(`>${escapeHtml(labelFor(field))}<`) || article.includes(`<strong>${escapeHtml(labelFor(field))}:`);
}

for (const entry of documents) {
  if (!fs.existsSync(entry.source)) throw new Error(`Fachakte fehlt: ${entry.source}`);
  const sourceMarkdown = fs.readFileSync(entry.source, "utf8");
  const sourceReferences = collectSourceReferences(entry.review, entry.supplement);
  if (entry.id === "gebaeudeenergiegesetz-medienwirkung") {
    const analysis = publicAnalyses.find((item) => item.slug === entry.id);
    analysis?.sources?.forEach((source, index) => {
      sourceReferences.set(`GEG-SRC-${String(index + 1).padStart(2, "0")}`, {
        title: source.title || "Eingeordnete Quelle",
        institution: source.institution || "",
        url: source.canonicalUrl || ""
      });
    });
  }
  const body = markdownToArticle(sourceMarkdown, sourceReferences);
  fs.writeFileSync(path.join(outputRoot, `${entry.id}.html`), documentHtml({ id: entry.id, title: entry.title, article: body, overviewHref: entry.overviewHref, summary: summaryFor(entry.id) }));
  if (entry.caseId) {
    const required = [
      ...publishableReviewFields.filter((field) => hasPublicValue(entry.review[field])).map((field) => `review-result.${field}`),
      ...publishableSupplementFields.filter((field) => hasPublicValue(entry.supplement[field])).map((field) => `decision-and-vote-supplement.${field}`)
    ];
    const rendered = required.filter((field) => {
      const [document, key] = field.split(".");
      return fieldRendered(body, key, document === "review-result" ? entry.review[key] : entry.supplement[key]);
    });
    const missing = required.filter((field) => !rendered.includes(field));
    const fallbackOverwrites = /Schutzgrenze wird geprüft|Wirkungsbereich\s*<\/p>\s*<h4>evidenz offen/i.test(body) ? ["generic-public-fallback"] : [];
    const report = {
      case_id: entry.caseId,
      source_hash: crypto.createHash("sha256").update(JSON.stringify({ review: entry.review, supplement: entry.supplement })).digest("hex"),
      required_paths: required,
      rendered_paths: rendered,
      missing_paths: missing,
      fallback_overwrites: fallbackOverwrites,
      canonical_full_source_url: `/fachakten/dossiers/${entry.id}.html`,
      result: missing.length === 0 && fallbackOverwrites.length === 0 ? "PASS" : "FAIL"
    };
    integrityReports.push(report);
    fs.writeFileSync(path.join(integrityRoot, `${entry.caseId}.json`), `${JSON.stringify(report, null, 2)}\n`);
  }
}
const productionIntegrity = {
  generated_at: new Date().toISOString(),
  publisher: "Institut für Wirkungsökonomie",
  cases: integrityReports.length,
  missing_paths: integrityReports.flatMap((report) => report.missing_paths.map((field) => ({ case_id: report.case_id, field }))),
  fallback_overwrites: integrityReports.flatMap((report) => report.fallback_overwrites.map((field) => ({ case_id: report.case_id, field }))),
  result: integrityReports.every((report) => report.result === "PASS") ? "PASS" : "FAIL"
};
fs.writeFileSync(path.join(appRoot, "public", "fachakten", "production-integrity-report.json"), `${JSON.stringify(productionIntegrity, null, 2)}\n`);
if (productionIntegrity.result !== "PASS") throw new Error(`Publikationsintegrität fehlgeschlagen: ${productionIntegrity.missing_paths.length} fehlende Pfade, ${productionIntegrity.fallback_overwrites.length} Fallback-Überschreibungen.`);
console.log(JSON.stringify({ status: "published", dossiers: documents.length, cases: integrityReports.length, integrity: productionIntegrity.result, output: "public/fachakten/dossiers" }));
