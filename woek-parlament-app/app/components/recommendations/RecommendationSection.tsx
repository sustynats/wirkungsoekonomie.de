import Link from "next/link";
import { recommendationForImpactCase, recommendationStatusLabels } from "@/lib/recommendations";
import { humanizeSystemValue } from "@/lib/presentation/labels";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

const evidenceLabels = {
  HIGH: "hoch",
  MEDIUM: "mittel",
  LOW: "gering",
  NOT_ASSESSABLE: "nicht bewertbar",
} as const;

const analysisModeLabels = {
  IMPACT_POTENTIAL_EX_ANTE: "Wirkungspotenzial vor der Entscheidung",
  RETROSPECTIVE_DECISION_REVIEW: "Rückschau mit damaligem Wissensstand",
  CURRENT_RECOMMENDATION_AFTER_REALITY_CHECK: "Heutige Handlungsoption nach Reality-Check",
} as const;

const fachStatusLabels = {
  APPROVED: "fachlich freigegeben",
  APPROVED_WITH_OPEN_DATA: "fachlich freigegeben; offene Daten sind ausgewiesen",
} as const;

export function RecommendationSection({ impactCaseId }: { impactCaseId: string }) {
  const recommendation = recommendationForImpactCase(impactCaseId);
  return <section className="government-recommendation" aria-labelledby={`recommendation-${impactCaseId}`}>
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
        <div><dt>Kompetenz- und Umsetzungsweg</dt><dd>{humanizeSystemValue(recommendation.competence_scope)} · {humanizeSystemValue(recommendation.implementation_route)}</dd></div>
        <div><dt>Reversibilität</dt><dd>{recommendation.reversibility}</dd></div>
        <div><dt>Evidenz und Unsicherheit</dt><dd>{evidenceLabels[recommendation.evidence_grade]} · {recommendation.uncertainty}</dd></div>
        <div><dt>Reality-Check</dt><dd>{recommendation.reality_check_plan}</dd></div>
      </dl>
      {recommendation.woek_preferred_option && <p><strong>Fachlich bevorzugte Ausgestaltung:</strong> {recommendation.woek_preferred_option}</p>}
      <h3>Geprüfte Optionen</h3>
      <div className="government-impact-grid">{recommendation.option_set.map((option) => <article key={option.option_id}><h4>{option.label}{option.option_id === recommendation.woek_preferred_option ? " - fachlich bevorzugt" : ""}</h4><p>{option.description}</p><p><strong>Status quo:</strong> {option.status_quo ? "ja" : "nein"}</p><ul>{Object.entries(option.dimensions).map(([key, value]) => <li key={key}><strong>{humanizeSystemValue(key)}:</strong> {humanizeSystemValue(value)}</li>)}</ul></article>)}</div>
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
      <p>{humanizeSystemValue(recommendation.non_compensation_check)}</p>
      <ul>{recommendation.legal_constraints.map((condition) => <li key={condition}>{condition}</li>)}</ul>
      <ul>{recommendation.rights_and_boundary_conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
      <h3>Vollzug, Sicherungen und Fallback</h3>
      <ul>{[...recommendation.resource_and_capacity_constraints, ...recommendation.safeguards, ...recommendation.monitoring_indicators].map((item) => <li key={item}>{item}</li>)}</ul>
      <p><strong>Fallback:</strong> {recommendation.fallback_option ?? "fachlich nicht ausgewiesen"}</p>
      {recommendation.analysis_mode === "RETROSPECTIVE_DECISION_REVIEW" && <div className="notice"><strong>Hindsight Guard</strong><p>Entscheidungsdatum: {recommendation.decision_date} · Wissensgrenze: {recommendation.knowledge_cutoff_date}</p><p>{recommendation.hindsight_limitations}</p><h4>Damals verfügbar</h4><ul>{recommendation.evidence_available_at_decision_time?.map((item) => <li key={item}>{item}</li>)}</ul><h4>Erst später verfügbar</h4><ul>{recommendation.evidence_only_available_later?.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      <p className="government-method-meta">RecommendationVersion {recommendation.recommendation_version}{recommendation.supersedes_recommendation_version ? ` · ersetzt ${recommendation.supersedes_recommendation_version}` : ""} · fachlich freigegeben · keine aus Scores berechnete Empfehlung</p>
      <p>{recommendation.public_change_summary}</p>
      <h3>Quellenbasis der Handlungsoption</h3>
      <ul>{recommendation.source_refs.map((source) => source.startsWith("https://")
        ? <li key={source}><Link data-recommendation-source href={sourceDetailHrefForUrl(source)}>Recommendation-Quellenakte öffnen</Link></li>
        : <li key={source}>Kanonische WÖk-Fachakte im freigegebenen Release</li>)}</ul>
      <details className="government-technical-proof">
        <summary>Technischen Recommendation-Nachweis ansehen</summary>
        <dl className="government-impact-summary">
          <div><dt>Recommendation-ID</dt><dd>{recommendation.recommendation_id}</dd></div>
          <div><dt>ImpactCase-ID</dt><dd>{recommendation.impact_case_id}</dd></div>
          <div><dt>Jurisdiktion</dt><dd>{recommendation.jurisdiction_id}</dd></div>
          <div><dt>Analysemodus</dt><dd>{analysisModeLabels[recommendation.analysis_mode]}</dd></div>
          <div><dt>Fachstatus</dt><dd>{fachStatusLabels[recommendation.fach_status]}</dd></div>
        </dl>
      </details>
    </> : <p><strong>WÖk-Handlungsoption wird fachlich ergänzt.</strong></p>}
  </section>;
}
