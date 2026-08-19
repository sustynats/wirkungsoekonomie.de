import type { Metadata } from "next";
import Link from "next/link";
import { ParliamentSearch } from "@/app/suche/ParliamentSearch";
import { listPublishedCases } from "@/lib/cases";
import { listFachanalysen } from "@/lib/fachanalysen";
import { directionLabels, evidenceLabels, getPublicImpactCases, governmentEditorialProjection } from "@/lib/government/impact-cases";
import { parliamentaryOverviewAssessment } from "@/lib/presentation/overview-assessment";
import { governmentPublicMaturity, parliamentPublicMaturity } from "@/lib/presentation/public-maturity";
import { recommendationForImpactCase } from "@/lib/recommendations";
import type { SearchableCase, SearchableFachanalyse, SearchableGovernmentImpact } from "@/lib/search";
import { publicParliamentSummary } from "@/lib/public-api";

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
  const governmentImpacts: SearchableGovernmentImpact[] = getPublicImpactCases().map((record) => {
    const editorial = governmentEditorialProjection(record);
    const assessment = {
      assessmentLabel: editorial.fields.overview_assessment_label,
      impactCoreSummary: editorial.fields.impact_core_summary,
      editorialSummary: editorial.fields.editorial_summary,
      keyFinding: editorial.fields.key_finding,
      directionLabel: directionLabels[record.primary_direction],
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
    }),
    terms: [record.impact_summary.central_lever, record.impact_summary.strongest_positive_potential, record.impact_summary.main_risk_or_tradeoff, record.full_analysis_markdown],
    });
  });
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
