import type { ReactNode } from "react";
import Link from "next/link";
import { recommendationForImpactCase } from "@/lib/recommendations";
import {
  commonTargetReviewForImpactCase,
  decisionReviewForImpactCase,
  publicReviewProse,
  publicReviewSystemLabel,
  referenceLayerForTargetId,
  referenceLayerIds,
  referenceLayerLabels,
  reviewObject,
  reviewSourceRefs,
  reviewText,
  reviewTextList,
  type PublicCommonTargetMapping,
  type ReviewObject,
} from "@/lib/decision-method";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

function OpenLayer({ title, layer, children }: { title: string; layer: "problem" | "goal"; children: ReactNode }) {
  return <article className="decision-method-open" data-woek-method-layer={layer}>
    <p className="eyebrow">Fachlich noch offen</p>
    <h3>{title}</h3>
    <p>{children}</p>
    <p><strong>Offen bedeutet weder neutral noch wirkungslos.</strong></p>
  </article>;
}

function publicText(value: unknown) {
  return publicReviewSystemLabel(value) ?? null;
}

function ValueList({ values }: { values: unknown }) {
  const items = reviewTextList(values);
  if (!items.length) return null;
  return <ul>{items.map((item, index) => <li key={`${item}-${index}`}>{publicText(item)}</li>)}</ul>;
}

function Fact({ label, value }: { label: string; value: unknown }) {
  const text = publicText(value);
  const list = reviewTextList(value).map(publicText).filter((item): item is string => Boolean(item));
  if (!text && !list.length) return null;
  return <div><dt>{label}</dt><dd>{text ?? list.join("; ")}</dd></div>;
}

const alignmentLabels: Record<string, string> = {
  MENSCH: "Mensch", Mensch: "Mensch",
  PLANET: "Planet", Planet: "Planet",
  DEMOKRATIE: "Demokratie", Demokratie: "Demokratie",
  status: "Prüfstand",
};

function AlignmentValue({ value }: { value: unknown }) {
  const single = publicText(value);
  if (single) return <p>{single}</p>;
  const list = reviewTextList(value);
  if (list.length) return <ValueList values={list} />;
  const object = reviewObject(value);
  if (!object) return <p>Fachliche Zuordnung noch offen.</p>;
  return <dl>{Object.entries(object).flatMap(([key, entry]) => {
    const entryText = publicText(entry);
    if (!entryText) return [];
    return [<div key={key}><dt>{alignmentLabels[key] ?? publicText(key)}</dt><dd>{entryText}</dd></div>];
  })}</dl>;
}

type DecisionReview = NonNullable<ReturnType<typeof decisionReviewForImpactCase>>;

function ReviewSources({ review }: { review: DecisionReview }) {
  const sources = reviewSourceRefs(review);
  if (!sources.length) return <p className="decision-method-sources"><strong>Quellenstand:</strong> Eine öffentliche Quellenakte ist fachlich noch offen.</p>;
  return <p className="decision-method-sources">
    <strong>Quellen:</strong>{" "}
    {sources.map((source, index) => <span key={source}>{index ? " · " : ""}<Link href={sourceDetailHrefForUrl(source)}>Quellenakte {index + 1}</Link></span>)}
  </p>;
}

function ReviewBlock({ title, children }: { title: string; children: ReactNode }) {
  return <div><h3>{title}</h3>{children}</div>;
}

function RootCauses({ problem }: { problem: ReviewObject }) {
  const causes = reviewTextList(problem.root_cause_tree);
  const single = reviewText(problem.root_cause_or_binding_bottleneck);
  if (!causes.length && !single) return null;
  return <ReviewBlock title="Bindende Ursachen und Engpässe">{causes.length ? <ValueList values={causes} /> : <p>{single}</p>}</ReviewBlock>;
}

function SymptomsAndCauses({ value }: { value: unknown }) {
  const narrative = reviewText(value);
  if (narrative) return <ReviewBlock title="Symptome und Ursachen"><p>{narrative}</p></ReviewBlock>;
  const object = reviewObject(value);
  if (!object) return null;
  const symptoms = reviewTextList(object.symptoms);
  const causes = [...reviewTextList(object.causes), ...reviewTextList(object.causes_or_bottlenecks)];
  return <>
    {symptoms.length > 0 && <ReviewBlock title="Symptome"><ValueList values={symptoms} /></ReviewBlock>}
    {causes.length > 0 && <ReviewBlock title="Ursachen"><ValueList values={causes} /></ReviewBlock>}
  </>;
}

function GoalHierarchy({ value }: { value: unknown }) {
  const items = reviewTextList(value);
  if (items.length) return <ValueList values={items} />;
  const hierarchy = reviewObject(value);
  if (!hierarchy) return <p>Zielhierarchie fachlich noch offen.</p>;
  const terminal = reviewText(hierarchy.terminal_goal) ?? reviewText(hierarchy.terminal_state_goal);
  const intermediate = reviewTextList(hierarchy.intermediate_goals);
  const instruments = reviewTextList(hierarchy.instrument_goals);
  return <>
    {terminal && <p><strong>Zielzustand:</strong> {terminal}</p>}
    {intermediate.length > 0 && <><h4>Zwischenziele</h4><ValueList values={intermediate} /></>}
    {instruments.length > 0 && <><h4>Instrumentenziele</h4><ValueList values={instruments} /></>}
  </>;
}

function IndicatorFunctions({ value }: { value: unknown }) {
  if (!Array.isArray(value)) return null;
  const rows = value.flatMap((entry) => {
    const item = reviewObject(entry);
    const indicator = reviewText(item?.indicator);
    const dataFunction = publicText(item?.data_function);
    return indicator ? [{ indicator, dataFunction }] : [];
  });
  if (!rows.length) return null;
  return <ReviewBlock title="Messgrößen und Datenfunktion"><ul>{rows.map((row) => <li key={`${row.indicator}-${row.dataFunction}`}><strong>{row.indicator}</strong>{row.dataFunction ? ` · ${row.dataFunction}` : ""}</li>)}</ul></ReviewBlock>;
}

function ProblemReview({ review }: { review: DecisionReview }) {
  const problem = review.problem_review;
  const conclusion = publicText(problem.problem_adequacy_status) ?? "Problemprüfung fachlich freigegeben";
  const rationale = reviewText(problem.rationale);
  return <article className="decision-review-detail" data-woek-method-layer="problem">
    <p className="review-conclusion"><strong>{conclusion}</strong>{rationale ? `: ${rationale}` : ""}</p>
    {reviewText(problem.stated_problem) && <p>{reviewText(problem.stated_problem)}</p>}
    <dl className="decision-review-facts">
      <Fact label="Problemtyp" value={problem.problem_type} />
      <Fact label="Ausgangszustand" value={problem.baseline_state} />
      <Fact label="Beobachtungsstand" value={problem.observed_trend} />
      <Fact label="Gegenfaktum ohne Maßnahme" value={problem.counterfactual_without_action} />
      <Fact label="Evidenz" value={problem.evidence_grade} />
      <Fact label="Messqualität" value={problem.measurement_quality} />
      <Fact label="Materialität" value={problem.materiality} />
      <Fact label="Räumlicher Bezug" value={problem.geography} />
      <Fact label="Zeithorizont" value={problem.time_horizon} />
    </dl>
    <div className="decision-review-grid">
      <RootCauses problem={problem} />
      <SymptomsAndCauses value={problem.symptoms_vs_causes} />
      {reviewTextList(problem.alternative_explanations).length > 0 && <ReviewBlock title="Alternative Erklärungen"><ValueList values={problem.alternative_explanations} /></ReviewBlock>}
      {reviewTextList(problem.affected_population).length > 0 && <ReviewBlock title="Betroffene"><ValueList values={problem.affected_population} /></ReviewBlock>}
      {reviewTextList(problem.data_gaps).length > 0 && <ReviewBlock title="Offene Daten"><ValueList values={problem.data_gaps} /></ReviewBlock>}
      <IndicatorFunctions value={problem.indicators_and_data_functions} />
    </div>
    {reviewText(problem.problem_claim_source) && <p><strong>Politische Problemquelle:</strong> {publicText(problem.problem_claim_source)}</p>}
    {reviewTextList(problem.problem_claim_source).length > 0 && <ReviewBlock title="Politische Problemquellen"><ValueList values={problem.problem_claim_source} /></ReviewBlock>}
    {reviewText(problem.narrative_or_frame_dependency) && <p><strong>Abhängigkeit vom Deutungsrahmen:</strong> {reviewText(problem.narrative_or_frame_dependency)}</p>}
    {publicText(problem.uncertainty) && <p><strong>Unsicherheit:</strong> {publicText(problem.uncertainty)}</p>}
    <p className="government-method-meta">Fachlicher Wissensstand: {review.knowledge_cutoff_date ?? review.reviewed_at.slice(0, 10)}{review.review_version ? ` · Prüfversion ${review.review_version}` : ""}</p>
    <ReviewSources review={review} />
  </article>;
}

function GoalReview({ review }: { review: DecisionReview }) {
  const goal = review.goal_review;
  const notAssessable = reviewText(goal.review_disposition) === "REVIEWED_NOT_ASSESSABLE";
  const conclusion = publicText(goal.goal_adequacy_status) ?? "Zielprüfung fachlich freigegeben";
  const rationale = reviewText(goal.rationale);
  return <article className="decision-review-detail" data-woek-method-layer="goal">
    <p className="review-conclusion"><strong>{conclusion}</strong>{rationale ? `: ${rationale}` : ""}</p>
    {notAssessable && <div className="open-state"><strong>Eigenständiger Zielzustand derzeit nicht belastbar beurteilbar.</strong><p>Die Fachprüfung bleibt offen; daraus wird weder ein neutraler noch ein positiver Zielstatus abgeleitet.</p></div>}
    {reviewText(goal.stated_goal) && <p>{reviewText(goal.stated_goal)}</p>}
    {reviewTextList(goal.goal_claim_source).length > 0 && <ReviewBlock title="Politische Zielquellen"><ValueList values={goal.goal_claim_source} /></ReviewBlock>}
    <dl className="decision-review-facts">
      <Fact label="Zieltyp" value={goal.goal_type} />
      <Fact label="Adressiertes Problem" value={goal.underlying_problem} />
      <Fact label="Vom Ausgangs- zum Zielzustand" value={goal.baseline_and_target_state} />
      <Fact label="Warum das Ziel das Problem adressiert" value={goal.evidence_that_goal_addresses_problem} />
      <Fact label="Status der Zielquelle" value={goal.goal_source_status} />
    </dl>
    <div className="decision-review-grid">
      <ReviewBlock title="Zielhierarchie"><GoalHierarchy value={goal.goal_hierarchy} /></ReviewBlock>
      {reviewTextList(goal.goal_conflicts).length > 0 && <ReviewBlock title="Zielkonflikte"><ValueList values={goal.goal_conflicts} /></ReviewBlock>}
      {reviewTextList(goal.affected_groups).length > 0 && <ReviewBlock title="Betroffene Gruppen"><ValueList values={goal.affected_groups} /></ReviewBlock>}
      {(reviewTextList(goal.affected_rights_and_protected_interests).length > 0 || reviewText(goal.constitutional_and_legal_compatibility)) && <ReviewBlock title="Recht und geschützte Interessen"><ValueList values={goal.affected_rights_and_protected_interests} />{reviewText(goal.constitutional_and_legal_compatibility) && <p>{reviewText(goal.constitutional_and_legal_compatibility)}</p>}</ReviewBlock>}
      <ReviewBlock title="Mensch · Planet · Demokratie"><AlignmentValue value={goal.MPD_alignment ?? goal.mpd_relevance} /></ReviewBlock>
      <ReviewBlock title="SDG-Bezüge"><AlignmentValue value={goal.SDG_alignment} /></ReviewBlock>
      <ReviewBlock title="SDG+ – WÖk-Erweiterung"><AlignmentValue value={goal.SDGplus_alignment} /></ReviewBlock>
      <ReviewBlock title="Staatszielbezug"><AlignmentValue value={goal.state_goal_alignment} /></ReviewBlock>
      {reviewTextList(goal.omitted_effects_or_groups).length > 0 && <ReviewBlock title="Ausgelassene Wirkungen oder Gruppen"><ValueList values={goal.omitted_effects_or_groups} /></ReviewBlock>}
      {reviewText(goal.distributional_and_generation_implications) && <ReviewBlock title="Verteilung und Generationen"><p>{reviewText(goal.distributional_and_generation_implications)}</p></ReviewBlock>}
      {reviewText(goal.system_and_resilience_implications) && <ReviewBlock title="System und Resilienz"><p>{reviewText(goal.system_and_resilience_implications)}</p></ReviewBlock>}
    </div>
    {reviewText(goal.proposed_better_goal_if_needed) && <p><strong>Fachlich präzisiertes Ziel:</strong> {reviewText(goal.proposed_better_goal_if_needed)}</p>}
    {reviewTextList(goal.needed_for_assessment).length > 0 && <ReviewBlock title="Für eine belastbare Zielprüfung erforderlich"><ValueList values={goal.needed_for_assessment} /></ReviewBlock>}
    {publicText(goal.uncertainty) && <p><strong>Unsicherheit:</strong> {publicText(goal.uncertainty)}</p>}
    <ReviewSources review={review} />
  </article>;
}

export function ProblemGoalReview({ impactCaseId }: { impactCaseId: string }) {
  const review = decisionReviewForImpactCase(impactCaseId);
  return <section className="decision-method-sequence" aria-label="Problem- und Zielprüfung">
    <div className="decision-method-heading"><p className="eyebrow">1 · Problemprüfung</p><h2>Welches Problem soll tatsächlich gelöst werden?</h2></div>
    {review ? <ProblemReview review={review} /> : <OpenLayer layer="problem" title="Eigenständige WÖk-Problemprüfung noch nicht veröffentlicht">Für diesen Fall liegt noch kein fachlich freigegebener Problem-Review als eigener Datenlayer vor. Aus Titel, Begründung oder politischer Position wird kein Problemzustand abgeleitet.</OpenLayer>}
    <div className="decision-method-heading"><p className="eyebrow">2 · Zielprüfung</p><h2>Welcher Zielzustand ist fachlich begründet?</h2></div>
    {review ? <GoalReview review={review} /> : <OpenLayer layer="goal" title="Eigenständige WÖk-Zielprüfung noch nicht veröffentlicht">Eine fachlich freigegebene Zielhierarchie fehlt noch. Politische Zielangaben werden deshalb nicht still als WÖk-Zielprüfung übernommen.</OpenLayer>}
  </section>;
}

const sourceCatalogLabels: Record<string, string> = {
  PG: "Geprüfte Problem- und Zielakte",
  REC: "Freigegebene WÖk-Handlungsoption",
  DNS: "Indikatorregister der Deutschen Nachhaltigkeitsstrategie",
  EU: "Amtliche EU-Quelle",
};

function CommonTargetSources({ mapping, catalog }: { mapping: PublicCommonTargetMapping; catalog: Record<string, string> }) {
  return <span className="common-targets-sources"><b>Fachbasis:</b>{" "}{mapping.source_refs.map((alias, index) => {
    const url = catalog[alias];
    const label = sourceCatalogLabels[alias] ?? "Fachlich dokumentierte Quelle";
    const href = alias === "DNS" ? "/methodik/wirkindikatoren" : url && /^https:\/\//i.test(url) ? sourceDetailHrefForUrl(url) : null;
    return <span key={`${alias}-${index}`}>{index ? " · " : ""}{href ? <Link href={href}>{label}</Link> : label}</span>;
  })}</span>;
}

function TargetEffectCell({ label, direction, mapping, catalog }: { label: string; direction: string; mapping: PublicCommonTargetMapping; catalog: Record<string, string> }) {
  return <span role="cell" className="common-targets-effect" aria-label={`${label}: ${mapping.target_label}`}>
    <strong>{mapping.target_label}</strong>
    <span>{publicText(direction)}</span>
    <span>{mapping.mechanism_rationale}</span>
    <span><b>Evidenz:</b> {publicText(mapping.evidence_grade)} · <b>Unsicherheit:</b> {publicText(mapping.uncertainty)}</span>
    {mapping.limitations.length > 0 && <span><b>Grenzen und offene Punkte:</b> {mapping.limitations.join("; ")}</span>}
    <CommonTargetSources mapping={mapping} catalog={catalog} />
  </span>;
}

export function CommonTargetsComparison({ impactCaseId }: { impactCaseId: string }) {
  const review = commonTargetReviewForImpactCase(impactCaseId);
  const recommendation = recommendationForImpactCase(impactCaseId);
  const mappings = new Map(referenceLayerIds.map((layer) => [layer, review?.mappings.filter((mapping) => referenceLayerForTargetId(mapping.target_reference_id) === layer) ?? []]));
  return <section className="common-targets" aria-labelledby={`common-targets-${impactCaseId}`} data-woek-common-targets>
    <p className="eyebrow">5 · Gemeinsame Ziele</p>
    <h2 id={`common-targets-${impactCaseId}`}>Wirkung auf gemeinsame Ziele</h2>
    <p>Hier wird getrennt gezeigt, wie die beschlossene Entscheidung und – sofern fachlich freigegeben – die WÖk-Handlungsoption auf dieselben Ziel- und Schutzräume wirken. Eine Zielzuordnung ist noch kein Kausalitätsnachweis. Es gibt weder eine arithmetische Gesamtnote noch einen automatisch erzeugten Zielbezug.</p>
    {!review && <div className="open-state"><strong>Vergleich mit gemeinsamen Zielen fachlich noch offen.</strong><p>Aus Schlagworten, Wirkungspfaden oder vorhandenen Scores wird keine Zielrichtung abgeleitet. Offen bedeutet weder neutral noch wirkungslos.</p></div>}
    {review && !recommendation && <div className="open-state"><strong>WÖk-Handlungsoption im öffentlichen Bestand nicht verfügbar.</strong><p>Der Vergleich bleibt geschlossen, bis die zugehörige fachlich freigegebene WÖk-Handlungsoption öffentlich verknüpft ist.</p></div>}
    {review && recommendation && <>
      <div className="common-target-options"><p><strong>Beschlossene Entscheidung:</strong> {review.actual_option.label}</p>{review.woek_option
        ? <p><strong>WÖk-Handlungsoption:</strong> {review.woek_option.label}</p>
        : <p><strong>Keine robuste WÖk-Handlungsoption freigegeben.</strong> {publicReviewProse(review.not_applicable_reason ?? "")}</p>}</div>
      {review.woek_option ? <>
      <div className="common-targets-table" role="table" aria-label="Vergleich nach getrennten Referenzebenen">
        <div className="common-targets-row common-targets-head" role="row"><span role="columnheader">Referenzebene</span><span role="columnheader">Beschlossene Entscheidung</span><span role="columnheader">WÖk-Handlungsoption</span></div>
        {referenceLayerIds.map((layer) => {
          const layerMappings = mappings.get(layer) ?? [];
          if (!layerMappings.length) return <div className="common-targets-row" role="row" key={layer}><strong role="rowheader">{referenceLayerLabels[layer]}</strong><span role="cell">Für diese Referenzebene ist kein Vergleich fachlich freigegeben.</span><span role="cell">Für diese Referenzebene ist kein Vergleich fachlich freigegeben.</span></div>;
          return layerMappings.map((mapping) => <div className="common-targets-row" role="row" key={`${layer}-${mapping.target_reference_id}`}>
            <strong role="rowheader">{referenceLayerLabels[layer]}<small>{mapping.target_label}</small></strong>
            <TargetEffectCell label="Beschlossene Entscheidung" direction={mapping.direction_actual} mapping={mapping} catalog={review.source_catalog} />
            <TargetEffectCell label="WÖk-Handlungsoption" direction={mapping.direction_woek} mapping={mapping} catalog={review.source_catalog} />
          </div>);
        })}
      </div>
      </> : null}
      <div className="common-target-guard"><p><strong>Schutz vor Rückschaufehlern:</strong> {publicReviewProse(review.hindsight_guard)}</p><p><strong>Zurechnungsgrenze:</strong> {publicReviewProse(review.causal_attribution_disclaimer)}</p><p><strong>Nichtkompensation:</strong> {publicReviewProse(review.aggregation_rule)}</p></div>
    </>}
    <p className="government-method-meta">Maschinelle Kandidaten, lokale Dateipfade oder bloße Schlagworttreffer werden nicht öffentlich als WÖk-Mapping ausgegeben.</p>
  </section>;
}
