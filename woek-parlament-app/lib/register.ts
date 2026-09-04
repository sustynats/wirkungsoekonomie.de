import "server-only";
import { listPublishedCases, materialityLabel } from "./cases";
import { listFachanalysen } from "./fachanalysen";
import { getPublicImpactCases, fullSchemaRecord, governmentEditorialProjection, directionLabels, evidenceLabels, publicRecordFromFullSchema, type PublicGovernmentImpactRecord } from "./government/impact-cases";
import { getApprovedParliamentDailyImpactCases } from "./parliament/daily-impact-cases";
import { getEuImpactCases, euEditorialProjection } from "./eu/impact-cases";
import { parliamentaryOverviewAssessment, impactRecordAssessmentIconKind, type OverviewAssessmentData } from "./presentation/overview-assessment";
import { parliamentPublicMaturity, governmentPublicMaturity, euPublicMaturity, publishedDossierPublicMaturity } from "./presentation/public-maturity";
import { projectImpactSignature } from "./presentation/impact-signature";
import { recommendationForImpactCase } from "./recommendations";
import { approvedCommonTargetLayerIdsForImpactCase, decisionReviewForImpactCase } from "./decision-method";
import { ACTION_PLAN_META_ID, actionPlanMetaAssessment, actionPlanAssessmentForMission, actionPlanPublicMaturity, getActionPlanMissions, missionDeepDives, actionPlanRouteFor } from "./government/strategy-impact";
import { governmentPublicationGatesPass } from "./government/publication-gates";
import { canonicalPortalHref } from "./navigation";
import { explicitRegisterFields, type RegisterObject } from "./register-model";
import { BW_COALITION_ROUTE, badenWuerttembergCoalitionAssessment, badenWuerttembergCoalitionPublicMaturity } from "./states/baden-wuerttemberg-coalition";
import { RLP_COALITION_ROUTE, rheinlandPfalzCoalitionAssessment, rheinlandPfalzCoalitionPublicMaturity } from "./states/rheinland-pfalz-coalition";
import { caseKindLabel, humanizeSystemValue } from "./presentation/labels";

function methodOptions(id: string) {
  const review = decisionReviewForImpactCase(id);
  return {
    recommendationAvailable: Boolean(recommendationForImpactCase(id)),
    problemReviewAvailable: Boolean(review?.problem_review), goalReviewAvailable: Boolean(review?.goal_review),
    reviewedCommonTargetLayers: approvedCommonTargetLayerIdsForImpactCase(id),
  };
}

function governmentObject(record: PublicGovernmentImpactRecord, daily = false): RegisterObject {
  const editorial = governmentEditorialProjection(record);
  if (editorial.status !== "PASS") throw new Error(`Unpublished register source: ${record.impact_case_id}`);
  const assessment: OverviewAssessmentData = {
    assessmentLabel: editorial.fields.overview_assessment_label, impactCoreSummary: editorial.fields.impact_core_summary,
    editorialSummary: editorial.fields.editorial_summary, keyFinding: editorial.fields.key_finding,
    directionLabel: directionLabels[record.primary_direction], directionKind: impactRecordAssessmentIconKind(record),
    evidenceSummary: `${evidenceLabels[record.evidence_level]}. ${editorial.fields.evidence_summary}`,
    realityCheckSummary: editorial.fields.reality_check_summary,
  };
  return {
    id: `${daily ? "daily" : "government"}:${record.impact_case_id}`, sourceId: record.impact_case_id,
    href: canonicalPortalHref(`/${daily ? "wirkungsfaelle" : "regierung/wirkungsanalysen"}/${encodeURIComponent(record.impact_case_id)}`),
    title: record.title, typeLabel: daily ? "Parlaments-Wirkungsfall" : "Regierungs-Wirkungsfall",
    relevance: ({ HIGH: "hohe Prüfrelevanz", MEDIUM: "mittlere Prüfrelevanz", LOW: "geringe Prüfrelevanz", OPEN: "Prüfrelevanz offen" } as Record<string, string>)[record.materiality] ?? humanizeSystemValue(record.materiality),
    finding: assessment.keyFinding, status: record.analysis_mode === "IMPACT_REALITY_CHECK" ? "Reality-Check-Stufe" : "Ex ante",
    date: record.analysis_as_of, signature: projectImpactSignature(assessment, governmentPublicMaturity(record, assessment, methodOptions(record.impact_case_id))),
    level: "bund", organ: daily ? "bundestag" : "bundesregierung",
    fields: explicitRegisterFields(fullSchemaRecord(record)?.impact_paths.flatMap((path) => path.mpd) ?? []),
    collections: daily ? ["wirkungsfaelle"] : ["wirkungsfaelle", "regierung"],
  };
}

/** Union of public objects, not a merger of their source records or judgements. */
export function getPublicRegister(): RegisterObject[] {
  const governmentReleased = governmentPublicationGatesPass();
  const parliament: RegisterObject[] = listPublishedCases().map((item) => {
    const assessment = parliamentaryOverviewAssessment(item);
    return {
      id: `parliament:${item.slug}`, sourceId: item.slug, href: `/entscheidungen/${item.slug}`, title: item.plainTitle,
      typeLabel: caseKindLabel(item.kind), relevance: materialityLabel(item.materiality), finding: assessment?.keyFinding ?? "Faktenakte – WÖk-Einordnung offen.",
      status: item.parliamentaryStatus, date: item.lastUpdated,
      signature: projectImpactSignature(assessment, parliamentPublicMaturity(item, assessment)),
      level: "bund", organ: "bundestag", fields: explicitRegisterFields(item.publicWorkingAct?.reviewDetail?.impactDomains.map((domain) => domain.domain) ?? []),
      collections: ["entscheidungen"],
    };
  });
  const eu: RegisterObject[] = getEuImpactCases().map((record) => {
    const editorial = euEditorialProjection(record);
    if (editorial.status !== "PASS") throw new Error(`Unpublished EU register source: ${record.impact_case_id}`);
    const assessment: OverviewAssessmentData = {
      assessmentLabel: editorial.fields.overview_assessment_label, impactCoreSummary: editorial.fields.impact_core_summary,
      editorialSummary: editorial.fields.editorial_summary, keyFinding: editorial.fields.key_finding,
      directionLabel: directionLabels[record.primary_direction], directionKind: impactRecordAssessmentIconKind(record),
      evidenceSummary: `${evidenceLabels[record.evidence_level]}. ${editorial.fields.evidence_summary}`,
      realityCheckSummary: editorial.fields.reality_check_summary,
    };
    return {
      id: `eu:${record.impact_case_id}`, sourceId: record.impact_case_id,
      href: canonicalPortalHref(`/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`), title: record.title,
      typeLabel: "EU-Wirkungsfall", finding: assessment.keyFinding, status: record.analysis_mode.includes("REALITY") ? "Beobachtungsstufe" : "Ex ante",
      date: record.analysis_as_of, signature: projectImpactSignature(assessment, euPublicMaturity(record, assessment, methodOptions(record.impact_case_id))),
      level: "eu", organ: "eu", fields: [], collections: ["wirkungsfaelle", "eu"],
    };
  });
  const dossiers: RegisterObject[] = listFachanalysen().map((analysis) => ({
    id: `dossier:${analysis.slug}`, sourceId: analysis.slug, href: canonicalPortalHref(`/fachanalysen/${analysis.slug}`), title: analysis.title,
    typeLabel: "Fachanalyse", finding: analysis.summary, status: "Veröffentlichtes Dossier", date: analysis.analysisDate,
    signature: projectImpactSignature(null, publishedDossierPublicMaturity(analysis.title, `Das Dossier „${analysis.title}“ ist mit seinem veröffentlichten Quellen-, Evidenz- und Arbeitsstand zugänglich.`)),
    level: "offen", organ: "offen", fields: explicitRegisterFields(analysis.referenceFields?.mpd ?? []), collections: ["fachanalysen"],
  }));
  const strategies: RegisterObject[] = governmentReleased ? [
    { id: `strategy:${ACTION_PLAN_META_ID}`, sourceId: ACTION_PLAN_META_ID, href: canonicalPortalHref(actionPlanRouteFor(ACTION_PLAN_META_ID)),
      title: "Aktionsplan Nachhaltigkeit 2026 – Meta-Wirkungsfall", typeLabel: "Strategieakte", finding: actionPlanMetaAssessment.keyFinding,
      status: "Beteiligungsfassung", date: null, signature: projectImpactSignature(actionPlanMetaAssessment, actionPlanPublicMaturity("Aktionsplan Nachhaltigkeit 2026", true)),
      level: "bund", organ: "bundesregierung", fields: [], collections: ["regierung"] },
    ...getActionPlanMissions().map((mission): RegisterObject => ({
      id: `strategy:${mission.id}`, sourceId: mission.id, href: canonicalPortalHref(actionPlanRouteFor(mission.id)),
      title: `Mission ${mission.mission}: ${mission.title}`, typeLabel: "Missionsakte", finding: actionPlanAssessmentForMission(mission).keyFinding,
      status: "Beteiligungsfassung", date: null,
      signature: projectImpactSignature(actionPlanAssessmentForMission(mission), actionPlanPublicMaturity(mission.title, Boolean(missionDeepDives[mission.id]))),
      level: "bund", organ: "bundesregierung", fields: [], collections: ["regierung"],
    })),
  ] : [];
  // These two public dossiers were already searchable; preserve the same projections.
  const coalitions = ([
    ["BW-COALITION-2026-2031", BW_COALITION_ROUTE, "Koalitionsvertrag Baden-Württemberg 2026–2031", badenWuerttembergCoalitionAssessment, badenWuerttembergCoalitionPublicMaturity],
    ["RLP-COALITION-2026-2031", RLP_COALITION_ROUTE, "Koalitionsvertrag Rheinland-Pfalz 2026–2031", rheinlandPfalzCoalitionAssessment, rheinlandPfalzCoalitionPublicMaturity],
  ] as const).map(([id, href, title, assessment, maturity]): RegisterObject => ({
    id: `coalition:${id}`, sourceId: id, href: canonicalPortalHref(href), title,
    typeLabel: "Koalitionsakte", finding: assessment.keyFinding,
    status: "Ex ante", date: null, signature: projectImpactSignature(assessment, maturity),
    level: "land", organ: "land", fields: [], collections: ["laender"],
  }));
  const objects = [...parliament, ...(governmentReleased ? getPublicImpactCases().map((record) => governmentObject(record)) : []),
    ...getApprovedParliamentDailyImpactCases().map((record) => governmentObject(publicRecordFromFullSchema(record), true)), ...eu, ...dossiers, ...strategies, ...coalitions];
  if (new Set(objects.map((item) => item.id)).size !== objects.length) throw new Error("Duplicate register identity; explicit source resolution required.");
  if (new Set(objects.map((item) => item.href)).size !== objects.length) throw new Error("Duplicate register destination; no implicit semantic merge allowed.");
  return objects.sort((a, b) => a.title.localeCompare(b.title, "de") || a.id.localeCompare(b.id));
}
