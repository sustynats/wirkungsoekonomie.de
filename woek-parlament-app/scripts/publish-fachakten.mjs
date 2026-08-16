import fs from "node:fs";
import path from "node:path";

// Creates the public, static long-form editions of the supplied Fachakten.
// The source delivery stays in .local and is never part of a deployment.
// Static delivery is intentional: some complete records exceed Vercel's 4.5 MB
// function-response limit and must not disappear or be silently abbreviated.
const appRoot = process.cwd();
const sourceRoot = process.env.FACHBASIS_SOURCE_ROOT ?? path.join(appRoot, ".local", "fachbasis-source-20260816");
const outputRoot = path.join(appRoot, "public", "fachakten", "dossiers");

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

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

function inline(value) {
  const escaped = escapeHtml(humanizeMachineTokens(value));
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
}

const machineValues = {
  MULTI_LEVEL: "mehrere politische Ebenen",
  CONDITIONAL: "nur unter Bedingungen entscheidungsreif",
  LIMITED: "begrenzt",
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
  LOWER_IS_BETTER: "niedriger ist besser"
};

function humanizeMachineTokens(value) {
  return String(value)
    .replace(/SDG_PLUS_([A-Z0-9_]+)/g, (_, key) => `SDG+ ${key.toLowerCase().replace(/_/g, " ")}`)
    .replace(/SDG_0?([0-9]{1,2})/g, "SDG $1")
    .replace(/\b[A-Z][A-Z0-9_]{2,}\b/g, (token) => machineValues[token] ?? (token.includes("_") ? token.toLowerCase().replace(/_/g, " ") : token));
}

const labels = {
  material_commitments: "Dokumentierte Zusagen",
  commitment_assessments: "Dokumentierte Zusagen",
  central_impact_paths: "Zentrale Wirkpfade",
  cross_cutting_patterns: "Übergreifende Muster",
  cross_cutting_dependencies: "Übergreifende Abhängigkeiten",
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
  sources_and_evidence: "Quellen und Evidenz",
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
  human: "Mensch",
  planet: "Planet",
  democracy: "Demokratie",
  sdgs: "SDGs",
  sdg_plus: "SDG+",
  id: "Referenz",
  direction: "Richtung",
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
  correction_trigger: "Korrekturtrigger"
};

function labelFor(value) {
  const clean = value.trim().replace(/:$/, "");
  return labels[clean] ?? clean.replace(/_/g, " ");
}

function isInternalLine(line) {
  return /^(# .*vollständige Darstellung|> Vollständige, automatisch strukturierte Darstellung|> Die ursprüngliche Review-Datei|\*\*(Quellendatei|SHA-256|schema_version|source_key|source_hash|review_status|analysis_version|input_package_hash|review_id|previous_review_id|generated_at|reference_snapshot_id):)/i.test(line.trim());
}

function markdownToArticle(markdown) {
  const lines = markdown.split(/\r?\n/).filter((line) => !isInternalLine(line));
  const html = [];
  let listOpen = false;
  let paragraph = [];
  let suppressedHeadingDepth = 0;

  const closeList = () => {
    if (listOpen) html.push("</ul>");
    listOpen = false;
  };
  const closeParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
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
    if (heading && suppressedHeadingDepth && heading[1].length <= suppressedHeadingDepth) suppressedHeadingDepth = 0;
    if (suppressedHeadingDepth) continue;
    if (heading) {
      closeParagraph(); closeList();
      if (/^(methodology_extension|provenance|quality_assurance|source_completeness|release_1_0)$/i.test(heading[2].trim())) {
        suppressedHeadingDepth = heading[1].length;
        continue;
      }
      const level = Math.min(heading[1].length + 1, 4);
      html.push(`<h${level}>${inline(labelFor(heading[2]))}</h${level}>`);
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      closeParagraph();
      if (!listOpen) { html.push("<ul>"); listOpen = true; }
      html.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }
    closeList();
    paragraph.push(line.replace(/^\*\*([^*]+):\*\*/, (_, key) => `**${labelFor(key)}:**`));
  }
  closeParagraph(); closeList();
  return html.join("\n");
}

function documentHtml({ title, article, overviewHref }) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index, follow">
  <title>${escapeHtml(title)} – Vollständige Fachakte</title>
  <link rel="stylesheet" href="/fachakten/dossiers.css">
</head>
<body>
  <header><a href="${overviewHref}">← Zur Fachakte im Wirkungsportal</a><p class="eyebrow">Institut für Wirkungsökonomie · vollständige Fachakte</p><h1>${escapeHtml(title)}</h1><p>Vollständige, veröffentlichte Darstellung mit Quellenbezügen, möglichen Wirkpfaden, Risiken, Bedingungen und Datenlücken. Wirkungspotenzial, Wirkungsrisiko und später beobachtbare Wirkung bleiben getrennt.</p></header>
  <main><article>${article}</article></main>
</body>
</html>`;
}

const documents = programmeDocuments.map(([id, title, relativePath]) => ({ id, title, source: path.join(sourceRoot, relativePath), overviewHref: `/fachakten/${id}` }));
const caseDirectory = path.join(sourceRoot, "02_parlament_28_and_votes", "cases");
for (const caseId of fs.readdirSync(caseDirectory)) {
  const reviewPath = path.join(caseDirectory, caseId, "review-result.json");
  const markdownPath = path.join(caseDirectory, caseId, "VOLLSTAENDIGE-FACHDARSTELLUNG.md");
  if (!fs.existsSync(reviewPath) || !fs.existsSync(markdownPath)) continue;
  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  documents.push({ id: `case-${caseId}`, title: review.release_1_0?.public_title ?? review.public_summary?.headline ?? review.decision?.object ?? "Wirkungsakte", source: markdownPath, overviewHref: `/fachakten/case-${caseId}` });
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
for (const entry of documents) {
  if (!fs.existsSync(entry.source)) throw new Error(`Fachakte fehlt: ${entry.source}`);
  const body = markdownToArticle(fs.readFileSync(entry.source, "utf8"));
  fs.writeFileSync(path.join(outputRoot, `${entry.id}.html`), documentHtml({ title: entry.title, article: body, overviewHref: entry.overviewHref }));
}
console.log(JSON.stringify({ status: "published", dossiers: documents.length, output: "public/fachakten/dossiers" }));
