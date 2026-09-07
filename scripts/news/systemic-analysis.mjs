import { renderDimensionMeters, renderIcon, renderPathDirection } from "./visuals.mjs";
import { AXES, renderAssessmentAxes, renderEditorialBalance } from "./editorial-judgment.mjs";

export const editorialLabel = analysis => analysis?.analysis_variant === "systemic" ? "WÖk-Sonderanalyse" : "WÖk-Analyse";
export const isCommissionedAnalysis = analysis => analysis?.analysis_variant === "systemic" && analysis?.editorial_mode === "commissioned_review";
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
const STATES = { open: "Offen", announced: "Angekündigt", introduced: "Eingebracht", adopted: "Beschlossen", implemented: "Umgesetzt", measured: "Wirkung gemessen" };
const STATUS = { fact: "Belegt", program_statement: "Programmaussage", analytical_inference: "Plausibler Wirkpfad", scenario: "Bedingtes Szenario", impact_risk: "Bedingtes Risiko" };
const TYPES = new Set(["cards", "cascade", "timeline", "references", "network", "power", "federal"]);

export const EDITORIAL_VISUAL_SCHEMA = { type: "cascade", caption: "Wirkpfad in Alltagssprache", items: [{ title: "Schritt", text: "konkrete Veränderung", status: "fact|program_statement|analytical_inference|scenario|impact_risk", relation: "scope|impact_path", direction: "positive|negative|mixed|open", condition: "Bedingung des Wirkpfads; scope zeigt nur Zuständigkeit/Bezug", source_ids: ["string"] }] };

export function sanitizeEditorialVisual(raw, sourceIds) {
  if (!raw || raw.type !== "cascade") return undefined;
  const clean = (value, max) => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
  return { type: "cascade", caption: clean(raw.caption, 240), items: (Array.isArray(raw.items) ? raw.items : []).slice(0, 5).map(item => ({ title: clean(item.title, 100), text: clean(item.text, 360), status: STATUS[item.status] ? item.status : "scenario", relation: item.relation === "scope" ? "scope" : "impact_path", direction: Object.hasOwn(AXES.direction, item.direction) ? item.direction : "open", condition: clean(item.condition, 360), source_ids: (Array.isArray(item.source_ids) ? item.source_ids : []).filter(id => sourceIds.has(id)) })) };
}

export function editorialVisualErrors(analysis) {
  const errors = [];
  const ids = new Set((analysis.source_snapshot || []).map(source => source.source_id));
  const sections = new Set((analysis.sections || []).map(section => section.id));
  for (const section of analysis.sections || []) {
    if (section.placement && !["lead", "hero"].includes(section.placement)) errors.push("EDITORIAL_SECTION_PLACEMENT_INVALID");
    if (section.anchor && (!section.anchor.thesis || !section.anchor.affected || !section.anchor.condition || Object.entries(AXES).some(([axis, labels]) => !Object.hasOwn(labels, section.anchor.assessment?.[axis])))) errors.push("EDITORIAL_SECTION_ASSESSMENT_REQUIRED");
    const visual = section.visual;
    if (!visual) continue;
    if (!TYPES.has(visual.type) || !visual.caption || !visual.items?.length) errors.push("SYSTEMIC_VISUAL_INVALID");
    if (["network", "power", "federal"].includes(visual.type) && !visual.hub) errors.push("SYSTEMIC_VISUAL_HUB_REQUIRED");
    for (const item of visual.items || []) {
      if (!item.title || !item.text || !STATUS[item.status]) errors.push("SYSTEMIC_VISUAL_EVIDENCE_REQUIRED");
      if (item.href && !/^#[a-z][a-z0-9_-]*$/.test(item.href)) errors.push("SYSTEMIC_VISUAL_LINK_INVALID");
      if (item.href && !sections.has(item.href.slice(1))) errors.push("SYSTEMIC_VISUAL_TARGET_MISSING");
      if (["fact", "program_statement"].includes(item.status) && !item.source_ids?.length) errors.push("SYSTEMIC_VISUAL_SOURCE_REQUIRED");
      if (ids.size && (item.source_ids || []).some(id => !ids.has(id))) errors.push("SYSTEMIC_VISUAL_SOURCE_UNKNOWN");
      if (analysis.editorial_rules_version && !["scope", "impact_path"].includes(item.relation)) errors.push("EDITORIAL_VISUAL_RELATION_REQUIRED");
      if (analysis.editorial_rules_version && item.relation === "impact_path" && (!Object.hasOwn(AXES.direction, item.direction) || !item.condition)) errors.push("EDITORIAL_VISUAL_DIRECTION_REQUIRED");
    }
  }
  return errors;
}

export function systemicValidationErrors(analysis) {
  if (analysis.analysis_variant !== "systemic") return [];
  const errors = editorialVisualErrors(analysis);
  if (!isCommissionedAnalysis(analysis)) errors.push("SYSTEMIC_EDITORIAL_REVIEW_REQUIRED");
  const ids = new Set((analysis.source_snapshot || []).map(source => source.source_id));
  const sections = new Set((analysis.sections || []).map(section => section.id));
  if (sections.size !== analysis.sections?.length) errors.push("SYSTEMIC_DUPLICATE_SECTION");
  for (const section of analysis.sections || []) {
    if (!/^[a-z][a-z0-9_-]{0,39}$/.test(section.id)) errors.push("SYSTEMIC_SECTION_ID_INVALID");
  }
  if (analysis.navigation_groups) {
    const navIds = analysis.navigation_groups.flatMap(group => group.section_ids || []);
    if (analysis.navigation_groups.length > 8 || new Set(navIds).size !== navIds.length || sections.size !== navIds.length || navIds.some(id => !sections.has(id))) errors.push("SYSTEMIC_NAVIGATION_INVALID");
    if (analysis.navigation_groups.some(group => !group.title || !group.section_ids?.length)) errors.push("SYSTEMIC_NAVIGATION_INVALID");
  }
  if (!analysis.subject_dimensions || !analysis.direction_finding) errors.push("SYSTEMIC_DIMENSIONS_REQUIRED");
  if (!analysis.monitoring?.points?.length || !analysis.monitoring?.checked_at) errors.push("SYSTEMIC_MONITOR_REQUIRED");
  for (const point of analysis.monitoring?.points || []) {
    if (!point.id || !point.label || !point.indicator || !STATES[point.status]) errors.push("SYSTEMIC_MONITOR_INVALID");
    if (point.status !== "open" && (!point.evidence_source_ids?.length || !point.evidence_date)) errors.push("SYSTEMIC_MONITOR_EVIDENCE_REQUIRED");
    if ((point.evidence_source_ids || []).some(id => !ids.has(id))) errors.push("SYSTEMIC_MONITOR_SOURCE_UNKNOWN");
  }
  return [...new Set(errors)];
}

// New event material requests a substantive review, not a silent short-form
// overwrite. Headline matches alone can never advance an implementation state.
export function commissionedReviewState(analysis, story) {
  if (!isCommissionedAnalysis(analysis)) return null;
  const changed = Date.parse(story.last_updated || 0) > Date.parse(analysis.monitoring?.checked_at || analysis.updated_at);
  return { status: changed ? "research_pending" : "published", automatic_short_form_rewrite: false, reason: changed ? "commissioned_analysis_new_origin_material" : "commissioned_analysis_current", story_id: story.story_id, analysis_id: analysis.analysis_id };
}

export function renderSystemicVisual(visual, sources) {
  if (!visual || !TYPES.has(visual.type)) return "";
  const tag = ["cascade", "timeline"].includes(visual.type) ? "ol" : "ul";
  return `<figure class="news-systemic-visual news-systemic-visual--${visual.type}"><figcaption>${escape(visual.caption)}</figcaption>${visual.hub ? `<div class="news-systemic-hub">${renderIcon("politik")}<strong>${escape(visual.hub)}</strong>${visual.levers ? `<span>${escape(visual.levers)}</span>` : ""}</div>` : ""}<${tag}>${visual.items.map(item => `<li class="news-systemic-node news-systemic-node--${escape(item.status)}"><span class="news-systemic-status">${escape(item.relation === "scope" && item.status === "analytical_inference" ? "Wirkungsfeld / Bezug" : STATUS[item.status])}</span>${item.relation === "impact_path" ? renderPathDirection(item.direction) : ""}<h3>${item.icon ? renderIcon(item.icon) : ""}${item.href ? `<a href="${escape(item.href)}">${escape(item.title)}</a>` : escape(item.title)}</h3><p>${escape(item.text)}</p>${item.condition ? `<p class="news-method-note"><strong>Bedingung / Grenze:</strong> ${escape(item.condition)}</p>` : ""}${(item.source_ids || []).length ? `<p class="news-method-note">${item.source_ids.map(id => sources.get(id)).filter(Boolean).map(source => `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.publisher)}</a>`).join(" · ")}</p>` : ""}</li>`).join("")}</${tag}>${visual.outcome ? `<div class="news-systemic-outcome">${renderIcon("systemisch")}<p>${escape(visual.outcome)}</p></div>` : ""}</figure>`;
}

export function renderSystemicDimensions(analysis) {
  if (analysis.analysis_variant !== "systemic") return "";
  if (analysis.editorial_rules_version) return renderEditorialBalance(analysis);
  return `<div class="news-systemic-dimensions"><h3>${renderIcon("systemisch")} Relevanz des Regierungsszenarios</h3><p>Die Balken zeigen die Bedeutung der möglichen Zustandsveränderungen, nicht Schaden, Eintrittswahrscheinlichkeit oder eine Bewertung von Menschen.</p>${renderDimensionMeters(analysis.subject_dimensions)}<h3>Richtungsbefund, getrennt von Relevanz</h3><p>${escape(analysis.direction_finding)}</p></div>`;
}

export function renderSectionAnchor(section) {
  if (!section.anchor) return "";
  const item = section.anchor;
  return `<aside class="news-section-anchor"><p class="news-section-anchor__thesis">${escape(item.thesis)}</p><p class="news-section-anchor__labels"><span>${escape(item.direction_label)}</span><span>${escape(item.affected)}</span></p><details><summary>${escape(item.evidence_summary)}</summary>${renderAssessmentAxes(item.assessment)}${item.condition ? `<p>${escape(item.condition)}</p>` : ""}</details></aside>`;
}

export function renderEditorialContents(analysis) {
  const sections = new Map((analysis.sections || []).map(section => [section.id, section]));
  const extra = `${analysis.author_perspective?.paragraphs?.length ? '<li><a href="#meine-einordnung">Meine Einordnung</a></li>' : ""}${analysis.analysis_variant === "systemic" ? '<li><a href="#reality-check">Reality Check</a></li><li><a href="#versionsverlauf">Versionsverlauf</a></li>' : ""}<li><a href="#quellen">Quellen und Belege</a></li>`;
  if (analysis.navigation_groups?.length) {
    return `<nav class="news-editorial-toc news-editorial-toc--grouped" aria-label="Inhaltsverzeichnis der Analyse"><h2>Dein Weg durch die Analyse</h2><ol>${analysis.navigation_groups.map((group, index) => `<li><a href="#${escape(group.section_ids[0])}"><span>${index + 1}</span>${escape(group.title)}</a><details><summary>Kapitel öffnen</summary><ul>${group.section_ids.map(id => `<li><a href="#${escape(id)}">${escape(sections.get(id)?.title)}</a></li>`).join("")}${index === analysis.navigation_groups.length - 1 ? extra : ""}</ul></details></li>`).join("")}</ol></nav>`;
  }
  return `<nav class="news-editorial-toc" aria-label="Inhaltsverzeichnis der Analyse"><details><summary>In dieser Analyse</summary><ol>${[...sections.values()].map(section => `<li><a href="#${escape(section.id)}">${escape(section.title)}</a></li>`).join("")}${extra}</ol></details></nav>`;
}

export function renderSystemicMonitoring(analysis, sources) {
  if (!isCommissionedAnalysis(analysis)) return "";
  return `<section class="news-editorial-article__section" id="reality-check"><h2>Reality Check: Vom Vorhaben zur überprüfbaren Veränderung</h2><p>Prüfstand: ${escape(analysis.monitoring.checked_at.slice(0, 10))}. Die Stufen sind keine automatische Entwicklungskette. Ein Beschluss belegt noch keine Umsetzung; eine Umsetzung noch keine Wirkung oder ihre Zurechnung.</p><p class="news-method-note">Offen → angekündigt → eingebracht → beschlossen → umgesetzt → Wirkung gemessen. Eine spätere Einstufung braucht datierte Belege. Neue Quellen zur Ursprungsgeschichte lösen einen erneuten Recherchebedarf aus; der bestehende Befund bleibt bis zur geprüften Aktualisierung erhalten.</p><details><summary>${analysis.monitoring.points.length} Beobachtungspunkte und Nachweiskriterien</summary><dl class="news-systemic-monitor">${analysis.monitoring.points.map(point => `<div><dt>${escape(point.label)} <span class="news-systemic-status">${escape(STATES[point.status])}</span></dt><dd>${escape(point.indicator)}${point.evidence_date ? `<p>Belegstand: ${escape(point.evidence_date)} · ${(point.evidence_source_ids || []).map(id => sources.get(id)).filter(Boolean).map(source => `<a href="${escape(source.url)}">${escape(source.publisher)}</a>`).join(" · ")}</p>` : ""}</dd></div>`).join("")}</dl></details></section><section class="news-editorial-article__section" id="versionsverlauf"><h2>Stand und Versionsverlauf</h2><ol>${(analysis.versions || []).map(version => `<li>Version ${escape(version.version)} · ${escape(version.analyzed_at?.slice(0, 10))}: ${escape(version.change_note || "Recherche und Einordnung aktualisiert.")}</li>`).join("")}</ol></section>`;
}
