import type { Metadata } from "next";
import Link from "next/link";
import { ParliamentSearch } from "@/app/suche/ParliamentSearch";
import { listPublishedCases } from "@/lib/cases";
import { listFachanalysen } from "@/lib/fachanalysen";
import { directionLabels, evidenceLabels, getPublicImpactCases, governmentEditorialProjection } from "@/lib/government/impact-cases";
import { impactRecordAssessmentIconKind, parliamentaryOverviewAssessment } from "@/lib/presentation/overview-assessment";
import { governmentPublicMaturity, parliamentPublicMaturity } from "@/lib/presentation/public-maturity";
import { recommendationForImpactCase } from "@/lib/recommendations";
import type { SearchableCase, SearchableFachanalyse, SearchableGovernmentImpact } from "@/lib/search";
import { publicParliamentSummary } from "@/lib/public-api";
import { approvedCommonTargetLayerIdsForImpactCase, decisionReviewForImpactCase } from "@/lib/decision-method";
import { ACTION_PLAN_META_ID, actionPlanMetaAssessment, actionPlanPublicMaturity, getActionPlanMissions, actionPlanAssessmentForMission } from "@/lib/government/strategy-impact";
import {
  BW_COALITION_ROUTE,
  badenWuerttembergCoalitionAssessment,
  badenWuerttembergCoalitionChapters,
  badenWuerttembergCoalitionPublicMaturity,
  badenWuerttembergCoalitionQualityLayers,
} from "@/lib/states/baden-wuerttemberg-coalition";

export const metadata: Metadata = {
  title: "Suche",
  description: "Durchsuche veröffentlichte Wirkungschecks, Hinweise aus dem Parlamentsradar und historische Rückblicke des Wirkungsportals."
};

export default function SearchPage() {
  const cases: SearchableCase[] = listPublishedCases().map((item) => {
    const assessment = parliamentaryOverviewAssessment(item);
    const analysisPublished = Boolean(assessment);
    return {
      slug: item.slug,
      title: item.title,
      plainTitle: item.plainTitle,
      kind: item.kind,
      editorialStatus: item.editorialStatus,
      materiality: item.materiality,
      parliamentaryStatus: item.parliamentaryStatus,
      statusVerification: item.statusVerification,
      summary: publicParliamentSummary(item),
      whatIsDecided: item.whatIsDecided,
      intendedGoal: analysisPublished ? item.intendedGoal : "",
      analysisStatus: analysisPublished ? item.analysisStatus : "FACT_ONLY",
      impactPath: analysisPublished ? item.impactPath : [],
      affectedGroups: analysisPublished ? item.affectedGroups : [],
      questions: analysisPublished ? item.questions : [],
      sources: item.sources,
      assessment,
      maturity: parliamentPublicMaturity(item, assessment),
    };
  });
  const analyses: SearchableFachanalyse[] = listFachanalysen().map(({ slug, title, subtitle, type, status, scope, summary, focusAreas }) => ({ slug, title, subtitle, type, status, scope, summary, focusAreas }));
  const standardGovernmentImpacts: SearchableGovernmentImpact[] = getPublicImpactCases().map((record) => {
    const editorial = governmentEditorialProjection(record);
    const decisionReview = decisionReviewForImpactCase(record.impact_case_id);
    const assessment = {
      assessmentLabel: editorial.fields.overview_assessment_label,
      impactCoreSummary: editorial.fields.impact_core_summary,
      editorialSummary: editorial.fields.editorial_summary,
      keyFinding: editorial.fields.key_finding,
      directionLabel: directionLabels[record.primary_direction],
      directionKind: impactRecordAssessmentIconKind(record),
      evidenceSummary: `${evidenceLabels[record.evidence_level]}. ${editorial.fields.evidence_summary}`,
      realityCheckSummary: editorial.fields.reality_check_summary,
    };
    return ({
    impactCaseId: record.impact_case_id,
    title: record.title,
    summary: String(record.impact_summary.public_summary),
    analysisMode: record.analysis_mode,
    materiality: record.materiality,
    assessment,
    maturity: governmentPublicMaturity(record, assessment, {
      recommendationAvailable: Boolean(recommendationForImpactCase(record.impact_case_id)),
      problemReviewAvailable: Boolean(decisionReview?.problem_review),
      goalReviewAvailable: Boolean(decisionReview?.goal_review),
      reviewedCommonTargetLayers: approvedCommonTargetLayerIdsForImpactCase(record.impact_case_id),
    }),
    terms: [record.impact_summary.central_lever, record.impact_summary.strongest_positive_potential, record.impact_summary.main_risk_or_tradeoff, record.full_analysis_markdown],
    });
  });
  const actionPlanMissions = getActionPlanMissions();
  const governmentImpacts: SearchableGovernmentImpact[] = [
    {
      impactCaseId: "BW-COALITION-2026-2031",
      href: BW_COALITION_ROUTE,
      title: "Koalitionsvertrag Baden-Württemberg 2026–2031",
      summary: badenWuerttembergCoalitionAssessment.editorialSummary,
      analysisMode: "IMPACT_POTENTIAL_EX_ANTE",
      materiality: "hoch",
      assessment: badenWuerttembergCoalitionAssessment,
      maturity: badenWuerttembergCoalitionPublicMaturity,
      terms: [
        ...badenWuerttembergCoalitionChapters.flatMap((chapter) => [chapter.title, chapter.assessment.assessmentLabel, chapter.assessment.keyFinding, chapter.problemReview, chapter.goalReview]),
        ...badenWuerttembergCoalitionQualityLayers.flatMap((layer) => [layer.title, layer.text]),
      ],
    },
    {
      impactCaseId: ACTION_PLAN_META_ID,
      title: "Aktionsplan Nachhaltigkeit 2026",
      summary: actionPlanMetaAssessment.editorialSummary,
      analysisMode: "IMPACT_POTENTIAL_EX_ANTE",
      materiality: "hoch",
      assessment: actionPlanMetaAssessment,
      maturity: actionPlanPublicMaturity("Aktionsplan Nachhaltigkeit 2026", true),
      terms: ["Deutsche Nachhaltigkeitsstrategie 2025", "DNS 2025", "19 Missionen", "Governance", "Wirkungsorientierung"],
    },
    ...actionPlanMissions.map((mission) => ({
      impactCaseId: mission.id,
      title: `Mission ${mission.mission}: ${mission.title}`,
      summary: mission.target,
      analysisMode: "IMPACT_POTENTIAL_EX_ANTE" as const,
      materiality: "missionsspezifisch",
      assessment: actionPlanAssessmentForMission(mission),
      maturity: actionPlanPublicMaturity(mission.title, Boolean(["WOEK-AKN-2026-M02", "WOEK-AKN-2026-M04"].includes(mission.id))),
      terms: [mission.lead, mission.path.A, mission.path.M, mission.path.delta_Z, mission.path.R, mission.risk, ...mission.monitor],
    })),
    ...standardGovernmentImpacts,
  ];
  return (
    <div className="shell content-page">
      <header className="page-intro">
        <p className="eyebrow">Wirkungsportal durchsuchen</p>
        <h1>Entscheidungen, Wirkungschecks und Quellen finden</h1>
        <p className="lead">Suchen Sie nach einem Thema, einer Drucksache oder einer parlamentarischen Entscheidung. Die Treffer zeigen getrennt, was amtlich belegt, was bereits fachlich eingeordnet und was noch offen ist.</p>
      </header>
      <ParliamentSearch cases={cases} analyses={analyses} governmentImpacts={governmentImpacts} />
      <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
    </div>
  );
}
