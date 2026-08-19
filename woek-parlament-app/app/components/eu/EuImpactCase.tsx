import Link from "next/link";
import { FullAnalysisText } from "@/app/components/FullAnalysisText";
import { OverviewAssessment } from "@/app/components/OverviewAssessment";
import { PublicMaturity } from "@/app/components/PublicMaturity";
import { directionLabels, evidenceLabels } from "@/lib/government/impact-cases";
import { euEditorialProjection, type EuImpactRecord } from "@/lib/eu/impact-cases";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { humanizeSystemValue, publicIndicatorLabel } from "@/lib/presentation/labels";
import { euPublicMaturity } from "@/lib/presentation/public-maturity";

export function EuImpactCase({ record, compact = false }: { record: EuImpactRecord; compact?: boolean }) {
  const editorial = euEditorialProjection(record);
  if (editorial.status !== "PASS") return null;
  const assessment = {
    assessmentLabel: editorial.fields.overview_assessment_label,
    impactCoreSummary: editorial.fields.impact_core_summary,
    editorialSummary: editorial.fields.editorial_summary,
    keyFinding: editorial.fields.key_finding,
    directionLabel: directionLabels[record.primary_direction],
    evidenceSummary: `${evidenceLabels[record.evidence_level]}. ${editorial.fields.evidence_summary}`,
    realityCheckSummary: editorial.fields.reality_check_summary,
  };
  const maturity = euPublicMaturity(record, assessment);
  return <article className="government-impact-case" aria-labelledby={`eu-impact-${record.impact_case_id}`} data-woek-preview-card="published">
    <header>
      <h2 id={`eu-impact-${record.impact_case_id}`}>{record.title}</h2>
      <OverviewAssessment compact={compact} assessment={assessment} />
      <PublicMaturity maturity={maturity} compact={compact} />
      {compact && <p className="eyebrow" data-woek-process-metadata>EU-WÖk-Wirkungsanalyse · {record.analysis_mode.includes("REALITY") ? "mit Beobachtungsstufe" : "Ex ante"}</p>}
      <dl className="government-impact-summary">
        <div><dt>Wirkungskern</dt><dd>{record.impact_core_summary}</dd></div>
        <div><dt>Kompetenz</dt><dd>{humanizeSystemValue(record.competence_scope)}</dd></div>
        <div><dt>Rechts- und Umsetzungsweg</dt><dd>{humanizeSystemValue(record.legal_feasibility_status)}{record.implementation_route.length ? ` · ${record.implementation_route.map(humanizeSystemValue).join(", ")}` : ""}</dd></div>
      </dl>
    </header>
    {compact ? <Link className="text-link" href={`/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`}>Vollständige EU-Wirkungsanalyse öffnen</Link> : <>
      <section><h3>Datenbedarf für den Reality Check</h3><ul>{record.key_indicators.map((indicator) => <li key={indicator}>{publicIndicatorLabel(indicator)}</li>)}</ul></section>
      <section className="government-process-meta" aria-label="Institutioneller und rechtlicher Lebenslauf" data-woek-process-metadata>
        <h3>Institutioneller und rechtlicher Lebenslauf</h3>
        <p><strong>Analysephase:</strong> {record.analysis_mode.includes("REALITY") ? "mit Beobachtungsstufe" : "Ex ante"}</p>
        <p><strong>Rechtsstand:</strong> {humanizeSystemValue(record.legal_status)}</p>
        <p><strong>Institutionelle Rolle:</strong> {humanizeSystemValue(record.institutional_actor_role)}</p>
        {record.inherited_legislative_file && <div className="notice"><strong>Geerbtes EU-Verfahren</strong><p>Dieser Vorgang stammt aus einer früheren Kommissionsphase und wird der aktuellen Kommission nicht rückwirkend zugerechnet.</p></div>}
      </section>
      <section><h3>Quellen</h3><ul>{record.official_sources.map((source) => <li key={source}><Link href={sourceDetailHrefForUrl(source)}>Quellenakte öffnen</Link></li>)}</ul></section>
      <details className="government-full-record government-technical-proof"><summary>Vollständige EU-Fachakte aufklappen</summary><FullAnalysisText source={{ title: record.title, releasedAt: record.analysis_as_of, sourceHash: record.source_release.case_markdown_sha256 ?? "", sourceDocumentHash: record.source_release.markdown_sha256 ?? "", markdown: record.full_analysis_markdown }} /></details>
    </>}
  </article>;
}
