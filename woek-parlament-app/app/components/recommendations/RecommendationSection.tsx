import { recommendationForImpactCase, recommendationStatusLabels } from "@/lib/recommendations";

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
        <div><dt>Kompetenz- und Umsetzungsweg</dt><dd>{recommendation.competence_scope} · {recommendation.implementation_route}</dd></div>
        <div><dt>Reversibilität</dt><dd>{recommendation.reversibility}</dd></div>
        <div><dt>Evidenz und Unsicherheit</dt><dd>{recommendation.evidence_grade} · {recommendation.uncertainty}</dd></div>
        <div><dt>Reality-Check</dt><dd>{recommendation.reality_check_plan}</dd></div>
      </dl>
      <h3>Geprüfte Optionen</h3>
      <div className="government-impact-grid">{recommendation.option_set.map((option) => <article key={option.option_id}><h4>{option.label}{option.option_id === recommendation.woek_preferred_option ? " - fachlich bevorzugt" : ""}</h4><p>{option.description}</p><p><strong>Status quo:</strong> {option.status_quo ? "ja" : "nein"}</p><ul>{Object.entries(option.dimensions).map(([key, value]) => <li key={key}><strong>{key}:</strong> {value}</li>)}</ul></article>)}</div>
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
      <p>{recommendation.non_compensation_check}</p>
      <ul>{recommendation.legal_constraints.map((condition) => <li key={condition}>{condition}</li>)}</ul>
      <ul>{recommendation.rights_and_boundary_conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
      <h3>Vollzug, Sicherungen und Fallback</h3>
      <ul>{[...recommendation.resource_and_capacity_constraints, ...recommendation.safeguards, ...recommendation.monitoring_indicators].map((item) => <li key={item}>{item}</li>)}</ul>
      <p><strong>Fallback:</strong> {recommendation.fallback_option ?? "fachlich nicht ausgewiesen"}</p>
      {recommendation.analysis_mode === "RETROSPECTIVE_DECISION_REVIEW" && <div className="notice"><strong>Hindsight Guard</strong><p>Entscheidungsdatum: {recommendation.decision_date} · Wissensgrenze: {recommendation.knowledge_cutoff_date}</p><p>{recommendation.hindsight_limitations}</p><h4>Damals verfügbar</h4><ul>{recommendation.evidence_available_at_decision_time?.map((item) => <li key={item}>{item}</li>)}</ul><h4>Erst später verfügbar</h4><ul>{recommendation.evidence_only_available_later?.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      <p className="government-method-meta">RecommendationVersion {recommendation.recommendation_version}{recommendation.supersedes_recommendation_version ? ` · ersetzt ${recommendation.supersedes_recommendation_version}` : ""} · fachlich freigegeben · keine aus Scores berechnete Empfehlung</p>
      <p>{recommendation.public_change_summary}</p>
    </> : <p><strong>WÖk-Handlungsoption wird fachlich ergänzt.</strong></p>}
  </section>;
}
