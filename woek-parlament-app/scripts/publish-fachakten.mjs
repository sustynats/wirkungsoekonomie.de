import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Creates the public, static long-form editions of the supplied Fachakten.
// The source delivery stays in .local and is never part of a deployment.
// Static delivery is intentional: some complete records exceed Vercel's 4.5 MB
// function-response limit and must not disappear or be silently abbreviated.
const appRoot = process.cwd();
const sourceRoot = process.env.FACHBASIS_SOURCE_ROOT ?? path.join(appRoot, ".local", "fachbasis-source-20260816");
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
    if (heading) {
      closeParagraph(); closeList();
      // The document already has one visible h1. Preserve the source nesting
      // below it so the long record can be navigated and grouped correctly.
      const level = Math.min(Math.max(heading[1].length - 1, 2), 5);
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
  const body = markdownToArticle(sourceMarkdown);
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
