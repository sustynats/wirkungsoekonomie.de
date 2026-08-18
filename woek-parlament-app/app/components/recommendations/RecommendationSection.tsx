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
        <div><dt>Zentraler Engpass</dt><dd>{recommendation.root_cause_or_binding_bottleneck}</dd></div>
        <div><dt>Systemhebel</dt><dd>{recommendation.system_leverage}</dd></div>
        <div><dt>Kompetenz- und Umsetzungsweg</dt><dd>{recommendation.competence_scope} · {recommendation.implementation_route}</dd></div>
        <div><dt>Evidenz und Unsicherheit</dt><dd>{recommendation.evidence_grade} · {recommendation.uncertainty}</dd></div>
        <div><dt>Reality-Check</dt><dd>{recommendation.reality_check_plan}</dd></div>
      </dl>
      <h3>Warum diese Option?</h3>
      <ul>{recommendation.why_preferred.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      <h3>Wirkungsgrenzen und Schutzbedingungen</h3>
      <p>{recommendation.non_compensation_check}</p>
      <ul>{recommendation.rights_and_boundary_conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
      <p className="government-method-meta">RecommendationVersion {recommendation.recommendation_version} · fachlich freigegeben · keine aus Scores berechnete Empfehlung</p>
    </> : <p><strong>WÖk-Handlungsoption wird fachlich ergänzt.</strong></p>}
  </section>;
}
