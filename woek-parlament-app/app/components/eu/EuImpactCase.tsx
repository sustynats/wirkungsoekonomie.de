import Link from "next/link";
import { FullAnalysisText } from "@/app/components/FullAnalysisText";
import { OverviewAssessment } from "@/app/components/OverviewAssessment";
import { PublicMaturity } from "@/app/components/PublicMaturity";
import { RecommendationSection } from "@/app/components/recommendations/RecommendationSection";
import { directionLabels, evidenceLabels } from "@/lib/government/impact-cases";
import { euEditorialProjection, type EuImpactRecord } from "@/lib/eu/impact-cases";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { publicIndicatorLabel, publicSystemValueLabel } from "@/lib/presentation/labels";
import { euPublicMaturity } from "@/lib/presentation/public-maturity";
import { impactRecordAssessmentIconKind } from "@/lib/presentation/overview-assessment";

export function EuImpactCase({ record, compact = false }: { record: EuImpactRecord; compact?: boolean }) {
  const editorial = euEditorialProjection(record);
  if (editorial.status !== "PASS") return null;
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
  const maturity = euPublicMaturity(record, assessment);
  const competence = publicSystemValueLabel(record.competence_scope);
  const legalFeasibility = publicSystemValueLabel(record.legal_feasibility_status);
  const implementationRoutes = record.implementation_route.map(publicSystemValueLabel).filter((label): label is string => Boolean(label));
  const indicators = record.key_indicators.map(publicIndicatorLabel).filter((label): label is string => Boolean(label));
  const legalStatus = publicSystemValueLabel(record.legal_status);
  const actorRole = publicSystemValueLabel(record.institutional_actor_role);
  const Title = compact ? "h2" : "h1";
  return <article className="government-impact-case" aria-labelledby={`eu-impact-${record.impact_case_id}`} data-woek-preview-card="published">
    <header>
      <Title id={`eu-impact-${record.impact_case_id}`}>{record.title}</Title>
      <OverviewAssessment compact={compact} assessment={assessment} />
      <PublicMaturity maturity={maturity} compact={compact} />
      {compact && <p className="eyebrow" data-woek-process-metadata>EU-WÖk-Wirkungsanalyse · {record.analysis_mode.includes("REALITY") ? "mit Beobachtungsstufe" : "Ex ante"}</p>}
      {(competence || legalFeasibility || implementationRoutes.length > 0) && <dl className="government-impact-summary">
        {competence && <div><dt>Kompetenz</dt><dd>{competence}</dd></div>}
        {(legalFeasibility || implementationRoutes.length > 0) && <div><dt>Rechts- und Umsetzungsweg</dt><dd>{[legalFeasibility, ...implementationRoutes].filter(Boolean).join(" · ")}</dd></div>}
      </dl>}
    </header>
    {compact ? <Link className="text-link" href={`/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`}>Vollständige EU-Wirkungsanalyse öffnen</Link> : <>
      {indicators.length > 0 && <section><h3>Datenbedarf für den Reality Check</h3><ul>{indicators.map((indicator) => <li key={indicator}>{indicator}</li>)}</ul></section>}
      {indicators.length < record.key_indicators.length && <p className="open-state">Für {record.key_indicators.length - indicators.length} fachlich benannte Messgrößen liegt noch keine freigegebene öffentliche Klartextbezeichnung vor. Sie bleiben bis zur Freigabe in dieser Ansicht ausgeblendet.</p>}
      <details className="government-full-record government-technical-proof" data-woek-substantive-impact="published"><summary>Vollständige EU-Fachakte aufklappen</summary><FullAnalysisText source={{ title: record.title, releasedAt: record.analysis_as_of, sourceHash: record.source_release.case_markdown_sha256 ?? "", sourceDocumentHash: record.source_release.markdown_sha256 ?? "", markdown: record.full_analysis_markdown }} /></details>
      <RecommendationSection impactCaseId={record.impact_case_id} />
      <section data-woek-source-layer="published"><h3>Quellen</h3><ul>{record.official_sources.map((source) => <li key={source}><Link href={sourceDetailHrefForUrl(source)}>Quellenakte öffnen</Link></li>)}</ul></section>
      <section className="government-process-meta" aria-label="Institutioneller und rechtlicher Lebenslauf" data-woek-process-metadata>
        <h3>Institutioneller und rechtlicher Lebenslauf</h3>
        <p><strong>Analysephase:</strong> {record.analysis_mode.includes("REALITY") ? "mit Beobachtungsstufe" : "Ex ante"}</p>
        {legalStatus && <p><strong>Rechtsstand:</strong> {legalStatus}</p>}
        {actorRole && <p><strong>Institutionelle Rolle:</strong> {actorRole}</p>}
        {record.inherited_legislative_file && <div className="notice"><strong>Geerbtes EU-Verfahren</strong><p>Dieser Vorgang stammt aus einer früheren Kommissionsphase und wird der aktuellen Kommission nicht rückwirkend zugerechnet.</p></div>}
      </section>
    </>}
  </article>;
}
