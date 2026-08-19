import Link from "next/link";
import { recommendationForImpactCase, recommendationStatusLabels } from "@/lib/recommendations";
import { publicNarrativeText, publicStructuredFieldLabel, publicSystemLabel } from "@/lib/presentation/labels";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

const evidenceLabels = {
  HIGH: "hoch",
  MEDIUM: "mittel",
  LOW: "gering",
  NOT_ASSESSABLE: "nicht bewertbar",
} as const;

export function RecommendationSection({ impactCaseId }: { impactCaseId: string }) {
  const recommendation = recommendationForImpactCase(impactCaseId);
  const competenceLabel = recommendation ? publicSystemLabel(recommendation.competence_scope) : null;
  const nonCompensation = recommendation ? publicNarrativeText(recommendation.non_compensation_check) : null;
  const hindsightLimitations = recommendation?.hindsight_limitations ? publicNarrativeText(recommendation.hindsight_limitations) : null;
  return <section className="government-recommendation" aria-labelledby={`recommendation-${impactCaseId}`} data-woek-recommendation-layer="published">
    <p className="eyebrow">WÖk-Handlungsoption</p>
    <h2 id={`recommendation-${impactCaseId}`}>Was wäre aus Wirkungssicht besser?</h2>
    {recommendation ? <>
      <p><strong>Status:</strong> {recommendationStatusLabels[recommendation.recommendation_status]}</p>
      <p className="lead">{recommendation.recommendation_core_summary}</p>
      <dl className="government-impact-summary">
        <div><dt>Problemzustand</dt><dd>{recommendation.problem_state}</dd></div>
        <div><dt>Zielzustand</dt><dd>{recommendation.target_state}</dd></div>
        <div><dt>Zentraler Engpass</dt><dd>{recommendation.root_cause_or_binding_bottleneck}</dd></div>
        <div><dt>Systemhebel</dt><dd>{recommendation.system_leverage}</dd></div>
        {competenceLabel && <div><dt>Kompetenzebene</dt><dd>{competenceLabel}</dd></div>}
        <div><dt>Umsetzungsweg</dt><dd>{recommendation.implementation_route}</dd></div>
        <div><dt>Reversibilität</dt><dd>{recommendation.reversibility}</dd></div>
        <div><dt>Evidenz und Unsicherheit</dt><dd>{evidenceLabels[recommendation.evidence_grade]} · {recommendation.uncertainty}</dd></div>
        <div><dt>Reality-Check</dt><dd>{recommendation.reality_check_plan}</dd></div>
      </dl>
      {recommendation.woek_preferred_option && <p><strong>Fachlich bevorzugte Ausgestaltung:</strong> {recommendation.woek_preferred_option}</p>}
      <h3>Geprüfte Optionen</h3>
      <div className="government-impact-grid">{recommendation.option_set.map((option) => { const publicDimensions = Object.entries(option.dimensions).flatMap(([key, value]) => { const keyLabel = publicStructuredFieldLabel(key); const valueLabel = publicSystemLabel(value); return keyLabel && valueLabel ? [{ key, keyLabel, valueLabel }] : []; }); return <article key={option.option_id}><h4>{option.label}</h4><p>{option.description}</p><p><strong>Status quo:</strong> {option.status_quo ? "ja" : "nein"}</p>{publicDimensions.length > 0 && <ul>{publicDimensions.map((item) => <li key={item.key}><strong>{item.keyLabel}:</strong> {item.valueLabel}</li>)}</ul>}</article>; })}</div>
      <h3>Warum diese Option?</h3>
      <ul>{recommendation.why_preferred.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      <h3>Zielkonflikte und Kaskaden</h3>
      <ul>{[...recommendation.key_tradeoffs, ...recommendation.cascade_effects].map((item) => <li key={item}>{item}</li>)}</ul>
      <div className="government-impact-grid">
        <article><h4>Erste Ordnung</h4><ul>{recommendation.first_order_effects.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h4>Zweite Ordnung</h4><ul>{recommendation.second_order_effects.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h4>Dritte Ordnung</h4><ul>{recommendation.third_order_effects.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h4>Rebound, Spillover und Leakage</h4><ul>{recommendation.rebound_spillover_leakage.map((item) => <li key={item}>{item}</li>)}</ul></article>
      </div>
      <h3>Betroffene, Verteilung und Generationen</h3>
      <ul>{[...recommendation.affected_groups, ...recommendation.distributional_effects, ...recommendation.time_and_generation_effects].map((item) => <li key={item}>{item}</li>)}</ul>
      <h3>Resilienz und Transformation</h3>
      <ul>{[...recommendation.resilience_effects, ...recommendation.transformation_effects].map((item) => <li key={item}>{item}</li>)}</ul>
      <h3>Wirkungsgrenzen und Schutzbedingungen</h3>
      {nonCompensation && <p>{nonCompensation}</p>}
      <ul>{recommendation.legal_constraints.map((condition) => <li key={condition}>{condition}</li>)}</ul>
      <ul>{recommendation.rights_and_boundary_conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
      <h3>Vollzug, Sicherungen und Fallback</h3>
      <ul>{[...recommendation.resource_and_capacity_constraints, ...recommendation.safeguards, ...recommendation.monitoring_indicators].map((item) => <li key={item}>{item}</li>)}</ul>
      <p><strong>Fallback:</strong> {recommendation.fallback_option ?? "fachlich nicht ausgewiesen"}</p>
      {Boolean(recommendation.evidence_available_at_decision_time?.length || recommendation.evidence_only_available_later?.length || hindsightLimitations) && <div className="notice"><strong>{recommendation.analysis_mode === "RETROSPECTIVE_DECISION_REVIEW" ? "Schutz vor Rückschaufehlern" : "Wissensstand der Handlungsoption"}</strong>{(recommendation.decision_date || recommendation.knowledge_cutoff_date) && <p>{recommendation.decision_date ? `Entscheidungsdatum: ${recommendation.decision_date}` : ""}{recommendation.decision_date && recommendation.knowledge_cutoff_date ? " · " : ""}{recommendation.knowledge_cutoff_date ? `Wissensgrenze: ${recommendation.knowledge_cutoff_date}` : ""}</p>}{hindsightLimitations && <p>{hindsightLimitations}</p>}{recommendation.evidence_available_at_decision_time?.length ? <><h4>Zum damaligen Wissensstand verfügbar</h4><ul>{recommendation.evidence_available_at_decision_time.map((item) => <li key={item}>{item}</li>)}</ul></> : null}{recommendation.evidence_only_available_later?.length ? <><h4>Erst später verfügbar</h4><ul>{recommendation.evidence_only_available_later.map((item) => <li key={item}>{item}</li>)}</ul></> : null}</div>}
      <p className="government-method-meta">Fassung der WÖk-Handlungsoption {recommendation.recommendation_version}{recommendation.supersedes_recommendation_version ? ` · ersetzt ${recommendation.supersedes_recommendation_version}` : ""} · fachlich freigegeben · nicht aus Punktwerten berechnet</p>
      <p>{recommendation.public_change_summary}</p>
      <h3>Quellenbasis der Handlungsoption</h3>
      <ul>{recommendation.source_refs.map((source) => source.startsWith("https://")
        ? <li key={source}><Link data-recommendation-source href={sourceDetailHrefForUrl(source)}>Quellenakte der Handlungsoption öffnen</Link></li>
        : <li key={source}>Kanonische WÖk-Fachakte im freigegebenen Release</li>)}</ul>
    </> : <p><strong>WÖk-Handlungsoption wird fachlich ergänzt.</strong></p>}
  </section>;
}
