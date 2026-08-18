import type { Metadata } from "next";
import Link from "next/link";
import { ParliamentSearch } from "@/app/suche/ParliamentSearch";
import { listPublishedCases } from "@/lib/cases";
import { listFachanalysen } from "@/lib/fachanalysen";
import { directionLabels, evidenceLabels, getPublicImpactCases, realityCheckLabels } from "@/lib/government/impact-cases";
import { parliamentaryOverviewAssessment } from "@/lib/presentation/overview-assessment";
import type { SearchableCase, SearchableFachanalyse, SearchableGovernmentImpact } from "@/lib/search";

export const metadata: Metadata = {
  title: "Suche",
  description: "Durchsuche veröffentlichte Wirkungschecks, Hinweise aus dem Parlamentsradar und historische Rückblicke des Wirkungsportals."
};

export default function SearchPage() {
  const cases: SearchableCase[] = listPublishedCases().map((item) => ({
    ...item,
    assessment: parliamentaryOverviewAssessment(item),
  }));
  const analyses: SearchableFachanalyse[] = listFachanalysen().map(({ slug, title, subtitle, type, status, scope, summary, focusAreas }) => ({ slug, title, subtitle, type, status, scope, summary, focusAreas }));
  const governmentImpacts: SearchableGovernmentImpact[] = getPublicImpactCases().map((record) => ({
    impactCaseId: record.impact_case_id,
    title: record.title,
    summary: String(record.impact_summary.public_summary),
    analysisMode: record.analysis_mode,
    materiality: record.materiality,
    assessment: {
      assessmentLabel: record.overview_assessment_label,
      impactCoreSummary: record.impact_core_summary,
      editorialSummary: record.editorial_summary,
      keyFinding: record.key_finding,
      directionLabel: directionLabels[record.primary_direction],
      evidenceSummary: `${evidenceLabels[record.evidence_level]}. ${record.evidence_summary_text}`,
      realityCheckSummary: `${realityCheckLabels[record.reality_check_status] ?? record.reality_check_status}. ${record.reality_check_summary}`,
    },
    terms: [record.impact_summary.central_lever, record.impact_summary.strongest_positive_potential, record.impact_summary.main_risk_or_tradeoff, record.full_analysis_markdown],
  }));
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
