import type { ReactNode } from "react";
import Link from "next/link";
import { recommendationForImpactCase } from "@/lib/recommendations";
import { decisionReviewForImpactCase, referenceLayerIds, referenceLayerLabels } from "@/lib/decision-method";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

function OpenLayer({ title, layer, children }: { title: string; layer: "problem" | "goal"; children: ReactNode }) {
  return <article className="decision-method-open" data-woek-method-layer={layer}><p className="eyebrow">Fachlich noch offen</p><h3>{title}</h3><p>{children}</p><p><strong>Offen bedeutet weder neutral noch wirkungslos.</strong></p></article>;
}

function ReviewSources({ sources }: { sources: string[] }) {
  return <p className="decision-method-sources"><strong>Quellen:</strong> {sources.map((source, index) => <Link key={source} href={sourceDetailHrefForUrl(source)}>{index ? `Quellenakte ${index + 1}` : "Quellenakte"}</Link>)}</p>;
}

export function ProblemGoalReview({ impactCaseId }: { impactCaseId: string }) {
  const review = decisionReviewForImpactCase(impactCaseId);
  return <section className="decision-method-sequence" aria-label="Problem- und Zielprüfung">
    <div className="decision-method-heading"><p className="eyebrow">1 · Problemprüfung</p><h2>Welches Problem soll tatsächlich gelöst werden?</h2></div>
    {review?.problem_review ? <article data-woek-method-layer="problem"><p>{review.problem_review.summary}</p><p><strong>Aussagegrenze:</strong> {review.problem_review.evidence_boundary}</p><ReviewSources sources={review.problem_review.source_refs} /></article> : <OpenLayer layer="problem" title="Eigenständige WÖk-Problemprüfung noch nicht veröffentlicht">Für diesen Fall liegt noch kein fachlich freigegebener Problem-Review als eigener Datenlayer vor. Aus Titel, Begründung oder politischer Position wird kein Problemzustand abgeleitet.</OpenLayer>}
    <div className="decision-method-heading"><p className="eyebrow">2 · Zielprüfung</p><h2>Welcher Zielzustand ist fachlich begründet?</h2></div>
    {review?.goal_review ? <article data-woek-method-layer="goal"><p>{review.goal_review.summary}</p>{review.goal_review.hierarchy.length > 0 && <><h3>Zielhierarchie</h3><ol>{review.goal_review.hierarchy.map((item) => <li key={item}>{item}</li>)}</ol></>}{review.goal_review.conflicts.length > 0 && <><h3>Zielkonflikte</h3><ul>{review.goal_review.conflicts.map((item) => <li key={item}>{item}</li>)}</ul></>}<ReviewSources sources={review.goal_review.source_refs} /></article> : <OpenLayer layer="goal" title="Eigenständige WÖk-Zielprüfung noch nicht veröffentlicht">Eine fachlich freigegebene Zielhierarchie fehlt noch. Politische Zielangaben werden deshalb nicht still als WÖk-Zielprüfung übernommen.</OpenLayer>}
  </section>;
}

export function CommonTargetsComparison({ impactCaseId }: { impactCaseId: string }) {
  const review = decisionReviewForImpactCase(impactCaseId);
  const recommendation = recommendationForImpactCase(impactCaseId);
  const mappings = new Map((review?.common_targets ?? []).filter((item) => item.review_status === "FACH_REVIEWED" || item.review_status === "CANONICAL").map((item) => [item.layer, item]));
  return <section className="common-targets" aria-labelledby={`common-targets-${impactCaseId}`} data-woek-common-targets>
    <p className="eyebrow">5 · Gemeinsame Ziele</p><h2 id={`common-targets-${impactCaseId}`}>Wirkung auf gemeinsame Ziele</h2>
    <p>Hier wird getrennt gezeigt, wie die beschlossene Entscheidung und – sofern fachlich freigegeben – die WÖk-Handlungsoption auf dieselben Ziel- und Schutzräume wirken. Eine Zielzuordnung ist noch kein Kausalitätsnachweis. Es gibt weder eine arithmetische Gesamtnote noch einen automatisch erzeugten Zielbezug.</p>
    {!recommendation && <div className="open-state"><strong>WÖk-Handlungsoption fachlich noch offen.</strong><p>Ein Vergleich wird erst veröffentlicht, wenn eine kanonisch freigegebene RecommendationRecord-Fassung vorliegt.</p></div>}
    <div className="common-targets-table" role="table" aria-label="Vergleich nach getrennten Referenzebenen">
      <div className="common-targets-row common-targets-head" role="row"><span role="columnheader">Referenzebene</span><span role="columnheader">Beschlossene Entscheidung</span><span role="columnheader">WÖk-Handlungsoption</span></div>
      {referenceLayerIds.map((layer) => {
        const mapping = mappings.get(layer);
        if (!mapping?.targets.length) return <div className="common-targets-row" role="row" key={layer}><strong role="rowheader">{referenceLayerLabels[layer]}</strong><span role="cell">fachlich noch offen</span><span role="cell">fachlich noch offen</span></div>;
        return mapping.targets.map((target) => <div className="common-targets-row" role="row" key={`${layer}-${target.reference_id_or_target}`}>
          <strong role="rowheader">{referenceLayerLabels[layer]}{mapping.targets.length > 1 ? <small>{target.plain_language_target_label}</small> : null}</strong>
          <TargetEffectCell label="Beschlossene Entscheidung" targetLabel={target.plain_language_target_label} assessment={target.actual_or_adopted_option} />
          {recommendation && target.woek_preferred_option ? <TargetEffectCell label="WÖk-Handlungsoption" targetLabel={target.plain_language_target_label} assessment={target.woek_preferred_option} /> : <span role="cell">fachlich noch offen</span>}
        </div>);
      })}
    </div>
    <p className="government-method-meta">Maschinelle Kandidaten oder bloße Schlagworttreffer werden nicht öffentlich als WÖk-Mapping ausgegeben.</p>
  </section>;
}

function TargetEffectCell({ label, targetLabel, assessment }: { label: string; targetLabel: string; assessment: import("@/lib/decision-method").TargetEffectAssessment }) {
  return <span role="cell" className="common-targets-effect" aria-label={`${label}: ${targetLabel}`}>
    <strong>{targetLabel}</strong>
    <span>{assessment.relation_or_expected_direction}</span>
    <span>{assessment.mechanism_link_or_reason}</span>
    <span><b>Evidenz und Review:</b> {assessment.evidence_or_review_status}</span>
    {assessment.indicator_or_state_variable_if_reviewed.length > 0 && <span><b>Messbezug:</b> {assessment.indicator_or_state_variable_if_reviewed.join("; ")}</span>}
    {assessment.limitations_or_open_points.length > 0 && <span><b>Grenzen und offene Punkte:</b> {assessment.limitations_or_open_points.join("; ")}</span>}
    <span className="common-targets-sources"><b>Quellen:</b> {assessment.source_refs.map((source, index) => <Link key={source} href={sourceDetailHrefForUrl(source)}>{index ? `Quelle ${index + 1}` : "Quellenakte"}</Link>)}</span>
  </span>;
}
