import { renderDimensionMeters, renderIcon } from "./visuals.mjs";

export const editorialLabel = analysis => analysis?.analysis_variant === "systemic" ? "WÖk-Sonderanalyse" : "WÖk-Analyse";
export const isCommissionedAnalysis = analysis => analysis?.analysis_variant === "systemic" && analysis?.editorial_mode === "commissioned_review";
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
const STATES = { open: "Offen", announced: "Angekündigt", introduced: "Eingebracht", adopted: "Beschlossen", implemented: "Umgesetzt", measured: "Wirkung gemessen" };
const STATUS = { fact: "Belegt", program_statement: "Programmaussage", analytical_inference: "Plausibler Wirkpfad", scenario: "Bedingtes Szenario", impact_risk: "Bedingtes Risiko" };
const TYPES = new Set(["cards", "cascade", "timeline", "references"]);

export function systemicValidationErrors(analysis) {
  if (analysis.analysis_variant !== "systemic") return [];
  const errors = [];
  if (!isCommissionedAnalysis(analysis)) errors.push("SYSTEMIC_EDITORIAL_REVIEW_REQUIRED");
  const ids = new Set((analysis.source_snapshot || []).map(source => source.source_id));
  const sections = new Set((analysis.sections || []).map(section => section.id));
  if (sections.size !== analysis.sections?.length) errors.push("SYSTEMIC_DUPLICATE_SECTION");
  for (const section of analysis.sections || []) {
    if (!/^[a-z][a-z0-9_-]{0,39}$/.test(section.id)) errors.push("SYSTEMIC_SECTION_ID_INVALID");
    const visual = section.visual;
    if (!visual) continue;
    if (!TYPES.has(visual.type) || !visual.caption || !visual.items?.length) errors.push("SYSTEMIC_VISUAL_INVALID");
    for (const item of visual.items || []) {
      if (!item.title || !item.text || !STATUS[item.status]) errors.push("SYSTEMIC_VISUAL_EVIDENCE_REQUIRED");
      if (item.href && !/^#[a-z][a-z0-9_-]*$/.test(item.href)) errors.push("SYSTEMIC_VISUAL_LINK_INVALID");
      if (item.href && !sections.has(item.href.slice(1))) errors.push("SYSTEMIC_VISUAL_TARGET_MISSING");
      if (["fact", "program_statement"].includes(item.status) && !item.source_ids?.length) errors.push("SYSTEMIC_VISUAL_SOURCE_REQUIRED");
      if ((item.source_ids || []).some(id => !ids.has(id))) errors.push("SYSTEMIC_VISUAL_SOURCE_UNKNOWN");
    }
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
  return `<figure class="news-systemic-visual news-systemic-visual--${visual.type}"><figcaption>${escape(visual.caption)}</figcaption><${tag}>${visual.items.map(item => `<li class="news-systemic-node news-systemic-node--${escape(item.status)}"><span class="news-systemic-status">${escape(STATUS[item.status])}</span><h3>${item.href ? `<a href="${escape(item.href)}">${escape(item.title)}</a>` : escape(item.title)}</h3><p>${escape(item.text)}</p>${item.condition ? `<p class="news-method-note"><strong>Bedingung / Grenze:</strong> ${escape(item.condition)}</p>` : ""}${(item.source_ids || []).length ? `<p class="news-method-note">${item.source_ids.map(id => sources.get(id)).filter(Boolean).map(source => `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.publisher)}</a>`).join(" · ")}</p>` : ""}</li>`).join("")}</${tag}></figure>`;
}

export function renderSystemicDimensions(analysis) {
  if (analysis.analysis_variant !== "systemic") return "";
  return `<div class="news-systemic-dimensions"><h3>${renderIcon("systemisch")} Relevanz des Regierungsszenarios</h3><p>Die Balken zeigen die Bedeutung der möglichen Zustandsveränderungen, nicht Schaden, Eintrittswahrscheinlichkeit oder eine Bewertung von Menschen.</p>${renderDimensionMeters(analysis.subject_dimensions)}<h3>Richtungsbefund, getrennt von Relevanz</h3><p>${escape(analysis.direction_finding)}</p></div>`;
}

export function renderSystemicMonitoring(analysis, sources) {
  if (!isCommissionedAnalysis(analysis)) return "";
  return `<section class="news-editorial-article__section" id="reality-check"><h2>Reality Check: Vom Vorhaben zur überprüfbaren Veränderung</h2><p>Prüfstand: ${escape(analysis.monitoring.checked_at.slice(0, 10))}. Die Stufen sind keine automatische Entwicklungskette. Ein Beschluss belegt noch keine Umsetzung; eine Umsetzung noch keine Wirkung oder ihre Zurechnung.</p><p class="news-method-note">Offen → angekündigt → eingebracht → beschlossen → umgesetzt → Wirkung gemessen. Eine spätere Einstufung braucht datierte Belege. Neue Quellen zur Ursprungsgeschichte lösen einen erneuten Recherchebedarf aus; der bestehende Befund bleibt bis zur geprüften Aktualisierung erhalten.</p><details><summary>${analysis.monitoring.points.length} Beobachtungspunkte und Nachweiskriterien</summary><dl class="news-systemic-monitor">${analysis.monitoring.points.map(point => `<div><dt>${escape(point.label)} <span class="news-systemic-status">${escape(STATES[point.status])}</span></dt><dd>${escape(point.indicator)}${point.evidence_date ? `<p>Belegstand: ${escape(point.evidence_date)} · ${(point.evidence_source_ids || []).map(id => sources.get(id)).filter(Boolean).map(source => `<a href="${escape(source.url)}">${escape(source.publisher)}</a>`).join(" · ")}</p>` : ""}</dd></div>`).join("")}</dl></details></section><section class="news-editorial-article__section" id="versionsverlauf"><h2>Stand und Versionsverlauf</h2><ol>${(analysis.versions || []).map(version => `<li>Version ${escape(version.version)} · ${escape(version.analyzed_at?.slice(0, 10))}: ${escape(version.change_note || "Recherche und Einordnung aktualisiert.")}</li>`).join("")}</ol></section>`;
}
