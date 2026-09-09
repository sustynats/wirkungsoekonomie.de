import { DIMENSIONS, renderIcon } from "./visuals.mjs";

// Versioned additions: old publications are not assigned a new judgment or voice.
export const EDITORIAL_RULES_VERSION = "2.0";
export const EDITORIAL_JUDGMENT_RULE = "Faktische Neutralität ist kein neutrales Urteil: Fakten fair prüfen, MPD-Richtung aus konkreten Maßnahmen und Wirkmechanismen begründen. Asymmetrische Evidenz darf zu einem asymmetrischen Ergebnis führen. Keine False Balance, kein Einerseits/Andererseits aus Stilgründen. Positive Gegenpfade nur bei konkret angekündigter/untersuchter Maßnahme, Quellenbeleg und nachvollziehbarem Mechanismus, nie als abstraktes Gegengewicht. Schutzplanken begrenzen Macht und Eintritt, sind keine positive Gegenwirkung. Status, Eintrittswahrscheinlichkeit, Wirkungsrichtung, Stärke und Evidenzsicherheit getrennt erfassen; offen ist nicht neutral. Ein bedingter Kapazitätsverlust kann klar negativ sein, obwohl Eintritt und Ausmaß offen sind. Im executive_finding den Befund in Alltagssprache erklären. Mindestens eine quellengebundene Wirkungsvisualisierung (cascade) aus 3 bis 5 Schritten, keine erfundenen Zahlen. Nach der methodischen Analyse eine klar getrennte persönliche journalistische Einordnung der Autorin in author_perspective formulieren: vorhandene Befunde gewichten, keine neuen Fakten, persönlichen Erlebnisse oder behauptete manuelle Prüfung erfinden. claim_indices verweisen auf die nullbasierten Ledger-Einträge, die diese Einordnung tragen. Historische Texte erhalten keine erfundene persönliche Haltung. Prüfe alle editorial_quality-Kriterien vor Rückgabe; keine bloß formale Freigabe.";
export const EDITORIAL_QUALITY_KEYS = ["false_balance_checked", "concrete_positive_paths_only", "likelihood_direction_separated", "safeguards_as_limits", "evidence_bound_judgment", "reader_takeaway_clear", "concrete_language_checked", "visuals_explain_mechanism", "author_perspective_separated"];
export const AXES = {
  implementation_status: { open: "Offen", announced: "Angekündigt", adopted: "Beschlossen", implemented: "Umgesetzt" },
  likelihood: { open: "Offen", plausible: "Plausibel", likely: "Wahrscheinlich", observed: "Beobachtet" },
  direction: { positive: "Positiv", neutral: "Neutral", negative: "Negativ", mixed: "Gemischt", open: "Offen" },
  magnitude: { low: "Gering", medium: "Mittel", high: "Hoch", very_high: "Sehr hoch", open: "Größenordnung offen" },
  evidence: { established: "Belegt", plausible_path: "Plausibler Wirkpfad", scenario: "Szenario", open: "Offen" },
};
export const EDITORIAL_JUDGMENT_SCHEMA = {
  executive_finding: "Klarer Befund, 60 bis 100 Wörter: konkrete Folge, Systemkopplung, wichtigste Bedingung",
  subject_dimensions: Object.fromEntries(Object.keys(DIMENSIONS).map(key => [key, {
    relevance: "offen|gering|mittel|hoch|sehr hoch", rationale: "konkrete Folge und Bedingung",
    implementation_status: "open|announced|adopted|implemented", likelihood: "open|plausible|likely|observed",
    direction: "positive|neutral|negative|mixed|open", magnitude: "low|medium|high|very_high|open",
    evidence: "established|plausible_path|scenario|open",
  }])),
  assessment_context: "potential|risk|observed|open",
  assessment_condition: "Bedingung, unter der die bewerteten Pfade gelten",
  author_perspective: { paragraphs: ["80 bis 160 Wörter persönliche Gewichtung in Ich-Form, keine neuen Tatsachen"], claim_indices: [0] },
  positive_path_checks: [{ measure: "konkrete Maßnahme, nicht allgemeine Alternative", source_ids: ["string"], mechanism: "wie genau ein Nutzen entsteht" }],
  counter_evidence_search: { checked: true, result: "Gefundene Gegenbefunde oder Grenzen der erfolglosen Suche, kein positiver Pfad auf Bestellung" },
  editorial_quality: Object.fromEntries(EDITORIAL_QUALITY_KEYS.map(key => [key, true])),
};
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
const clean = (value, max = 1200) => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const list = value => Array.isArray(value) ? value : [];

export function editorialContentSnapshot(analysis) {
  const keys = ["title", "subtitle", "teaser", "seo_description", "analysis_variant", "editorial_genre", "lead_statement", "sections", "claim_ledger", "source_snapshot", "monitoring", "subject_dimensions", "direction_finding", "assessment_context", "assessment_condition", "author_perspective", "executive_finding", "navigation_groups", "editorial_rules_version", "related_analysis_slugs", "title_image"];
  return structuredClone(Object.fromEntries(keys.filter(key => analysis[key] !== undefined).map(key => [key, analysis[key]])));
}

export function sanitizeEditorialJudgment(raw, sourceIds) {
  return {
    editorial_rules_version: EDITORIAL_RULES_VERSION,
    executive_finding: clean(raw.executive_finding),
    subject_dimensions: Object.fromEntries(Object.keys(DIMENSIONS).map(key => {
      const item = raw.subject_dimensions?.[key] || {};
      return [key, { relevance: clean(item.relevance, 20), rationale: clean(item.rationale, 600), ...Object.fromEntries(Object.entries(AXES).map(([axis, labels]) => [axis, Object.hasOwn(labels, item[axis]) ? item[axis] : "open"])) }];
    })),
    assessment_context: ["potential", "risk", "observed", "open"].includes(raw.assessment_context) ? raw.assessment_context : "open",
    assessment_condition: clean(raw.assessment_condition, 600),
    author_perspective: { paragraphs: list(raw.author_perspective?.paragraphs).slice(0, 4).map(item => clean(item, 1400)).filter(Boolean), claim_indices: [...new Set(list(raw.author_perspective?.claim_indices).filter(Number.isInteger))], origin: "generated_from_analysis" },
    positive_path_checks: list(raw.positive_path_checks).slice(0, 6).map(item => ({ measure: clean(item.measure, 400), source_ids: list(item.source_ids).filter(id => sourceIds.has(id)), mechanism: clean(item.mechanism, 600) })),
    counter_evidence_search: { checked: raw.counter_evidence_search?.checked === true, result: clean(raw.counter_evidence_search?.result, 600) },
    editorial_quality: Object.fromEntries(EDITORIAL_QUALITY_KEYS.map(key => [key, raw.editorial_quality?.[key] === true])),
  };
}

export function editorialJudgmentErrors(analysis) {
  if (!analysis.editorial_rules_version) return []; // Historical records remain intact.
  const errors = [];
  if (analysis.editorial_rules_version !== EDITORIAL_RULES_VERSION) errors.push("EDITORIAL_RULES_VERSION_UNKNOWN");
  if ((analysis.executive_finding || "").length < 180 || !analysis.assessment_condition) errors.push("EDITORIAL_FINDING_REQUIRED");
  const validSources = new Set((analysis.source_snapshot || []).map(source => source.source_id));
  // During generation, the source set is validated in the enclosing pipeline.
  for (const dimension of Object.keys(DIMENSIONS)) {
    const item = analysis.subject_dimensions?.[dimension];
    if (!item?.rationale || !["offen", "gering", "mittel", "hoch", "sehr hoch"].includes(item.relevance)) errors.push("EDITORIAL_MPD_REQUIRED");
    if (Object.entries(AXES).some(([axis, labels]) => !Object.hasOwn(labels, item?.[axis]))) errors.push("EDITORIAL_AXES_REQUIRED");
    if (item?.direction === "neutral" && item?.evidence === "open") errors.push("EDITORIAL_OPEN_IS_NOT_NEUTRAL");
    if (item?.likelihood === "observed" && (item?.implementation_status !== "implemented" || item?.evidence !== "established" || analysis.assessment_context !== "observed" || !analysis.claim_ledger?.some(claim => claim.type === "observed_impact" && claim.source_ids?.length && claim.evidence_level === "high"))) errors.push("EDITORIAL_OBSERVED_JUDGMENT_UNSUPPORTED");
  }
  if (!["potential", "risk", "observed", "open"].includes(analysis.assessment_context)) errors.push("EDITORIAL_ASSESSMENT_CONTEXT_REQUIRED");
  const perspective = analysis.author_perspective;
  if (!perspective?.paragraphs?.length || perspective.paragraphs.join(" ").length < 180 || !perspective.claim_indices?.length) errors.push("EDITORIAL_AUTHOR_PERSPECTIVE_REQUIRED");
  if ((perspective?.claim_indices || []).some(index => !Number.isInteger(index) || index < 0 || index >= (analysis.claim_ledger?.length || 0))) errors.push("EDITORIAL_AUTHOR_PERSPECTIVE_UNGROUNDED");
  if (EDITORIAL_QUALITY_KEYS.some(key => analysis.editorial_quality?.[key] !== true)) errors.push("EDITORIAL_JOURNALISTIC_REVIEW_REQUIRED");
  for (const item of analysis.positive_path_checks || []) {
    if (!item.measure || !item.mechanism || !item.source_ids?.length || (validSources.size && item.source_ids.some(id => !validSources.has(id)))) errors.push("EDITORIAL_POSITIVE_PATH_UNGROUNDED");
  }
  const hasPositiveDirection = Object.values(analysis.subject_dimensions || {}).some(item => ['positive', 'mixed'].includes(item.direction)) || (analysis.sections || []).some(section => section.visual?.items?.some(item => item.relation === "impact_path" && ['positive', 'mixed'].includes(item.direction)));
  if (hasPositiveDirection && !analysis.positive_path_checks?.length) errors.push("EDITORIAL_POSITIVE_PATH_UNGROUNDED");
  if (!(analysis.sections || []).some(section => ["cascade", "network"].includes(section.visual?.type) && section.visual.items?.length >= 3 && section.visual.items.some(item => item.relation === "impact_path"))) errors.push("EDITORIAL_IMPACT_VISUAL_REQUIRED");
  return [...new Set(errors)];
}

export function renderAssessmentAxes(item) {
  if (!item) return "";
  const names = { implementation_status: "Maßnahmenstand", likelihood: "Eintritt", direction: "Richtung", magnitude: "Stärke / Ausmaß", evidence: "Evidenz" };
  return `<dl class="news-assessment-axes">${Object.entries(names).map(([key, label]) => `<div><dt>${label}</dt><dd>${escape(AXES[key][item[key]] || "Offen")}</dd></div>`).join("")}</dl>`;
}

export function renderEditorialBalance(analysis, { compact = false } = {}) {
  if (!analysis.editorial_rules_version || !analysis.subject_dimensions) return "";
  const context = { risk: "Risikopotenzial", potential: "Wirkungspotenzial", observed: "Beobachtete Wirkung", open: "Richtung noch offen" }[analysis.assessment_context] || "Offen";
  return `<div class="news-mpd-balance${compact ? " news-mpd-balance--compact" : ""}" role="group" aria-label="Relevanz und Wirkungsrichtung getrennt"><p class="news-method-note">${escape(context)} · ${escape(analysis.assessment_condition)}</p><div class="news-mpd-balance__grid">${Object.entries(DIMENSIONS).map(([key, meta]) => {
    const item = analysis.subject_dimensions[key];
    const negative = item.direction === "negative";
    const direction = negative && item.magnitude === "very_high" ? "Stark negativ" : AXES.direction[item.direction] || "Offen";
    return `<div class="news-mpd-balance__item" role="group" aria-label="Relevanz für ${meta.label}: ${escape(item.relevance)}; ${escape(context)}: ${escape(direction)}"><h3>${renderIcon(meta.icon)} ${meta.label}</h3><p class="news-mpd-balance__relevance">Relevanz: <strong>${escape(item.relevance)}</strong></p><p class="news-mpd-balance__direction" data-direction="${escape(item.direction)}">${renderIcon(negative ? "tendenz-risiko" : item.direction === "positive" ? "tendenz-chance" : "tendenz-gemischt")}<span>${escape(direction)}<small>${escape(context)}</small></span></p><p>${escape(item.rationale)}</p>${compact ? "" : renderAssessmentAxes(item)}</div>`;
  }).join("")}</div></div>`;
}

export function renderEditorialFinding(analysis) {
  if (!analysis.executive_finding) return "";
  return `<aside class="news-editorial-finding" aria-labelledby="woek-befund"><p class="hero-kicker">Das Wichtigste in 90 Sekunden</p><h2 id="woek-befund">WÖk-Befund</h2><p>${escape(analysis.executive_finding)}</p>${renderEditorialBalance(analysis, { compact: true })}</aside>`;
}

export function renderAuthorPerspective(analysis) {
  if (!analysis.author_perspective?.paragraphs?.length) return "";
  return `<section id="meine-einordnung" class="news-author-perspective" aria-labelledby="author-perspective-title"><p class="hero-kicker">Persönliche Einordnung der Autorin</p><h2 id="author-perspective-title">Meine Einordnung</h2><p class="news-method-note">Natalie Weber · Persönliche Gewichtung der zuvor belegten und analysierten Befunde.</p>${analysis.author_perspective.paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join("")}</section>`;
}
