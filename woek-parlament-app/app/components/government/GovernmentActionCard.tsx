import Link from "next/link";
import {
  actionTypeLabels,
  coverageLabels,
  formatDate,
  lifecycleLabels,
  readableInstitution,
  type GovernmentAction,
} from "@/lib/government/public-data";
import { directionLabels, evidenceLabels, governmentEditorialProjection, impactCasesForGovernmentAction } from "@/lib/government/impact-cases";
import { OverviewAssessment } from "@/app/components/OverviewAssessment";
import { PublicMaturity } from "@/app/components/PublicMaturity";
import { factOnlyPublicMaturity, governmentPublicMaturity } from "@/lib/presentation/public-maturity";
import { recommendationForImpactCase } from "@/lib/recommendations";
import { impactRecordAssessmentIconKind } from "@/lib/presentation/overview-assessment";

export function GovernmentActionCard({ action }: { action: GovernmentAction }) {
  const impactCases = impactCasesForGovernmentAction(action.government_action_id);
  const assessments = impactCases.flatMap((record) => {
    const editorial = governmentEditorialProjection(record);
    if (editorial.status !== "PASS") return [];
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
    return [{
      record,
      assessment,
      maturity: governmentPublicMaturity(record, assessment, {
        recommendationAvailable: Boolean(recommendationForImpactCase(record.impact_case_id)),
      }),
    }];
  });
  return (
    <article className="government-action-card" data-woek-preview-card={assessments.length ? "published" : "fact-only"}>
      <h2><Link href={`/regierung/akte/${encodeURIComponent(action.government_action_id)}`}>{action.title}</Link></h2>
      {assessments.length ? <div className="government-action-assessments">{assessments.map(({ record, assessment, maturity }) => <div key={record.impact_case_id}>
        {assessments.length > 1 && <p className="source-register-label">Wirkungsgegenstand: {record.title}</p>}
        <OverviewAssessment assessment={assessment} compact />
        <PublicMaturity maturity={maturity} compact />
      </div>)}</div> : <PublicMaturity maturity={factOnlyPublicMaturity(action.title)} compact />}
      <div className="government-card-meta" data-woek-process-metadata>
        <span className="chip chip--depth">{actionTypeLabels[action.action_type] ?? action.action_type}</span>
        <time dateTime={action.decision_date ?? undefined}>{formatDate(action.decision_date)}</time>
      </div>
      <dl className="government-card-facts" data-woek-process-metadata>
        <div><dt>Verfahrensstand</dt><dd>{lifecycleLabels[action.lifecycle_status] ?? action.lifecycle_status}</dd></div>
        <div><dt>Zuständig</dt><dd>{action.responsible_institutions.map(readableInstitution).join(", ") || "Institution noch nicht öffentlich zugeordnet"}</dd></div>
      </dl>
      <p className="coverage-line"><span aria-hidden="true">◌</span> {coverageLabels[action.coverage_scope_status] ?? action.coverage_scope_status}</p>
      <p className="analysis-line"><strong>Wirkungsanalyse:</strong> {impactCases.length ? `${impactCases.length} fachlich freigegebene ${impactCases.length === 1 ? "Analyse" : "Analysen"} verknüpft.` : "Noch nicht fachlich freigegeben. Diese Akte zeigt zunächst den amtlichen Sachverhalt."}</p>
      <Link className="text-link" href={`/regierung/akte/${encodeURIComponent(action.government_action_id)}`}>Regierungsakte öffnen</Link>
    </article>
  );
}
