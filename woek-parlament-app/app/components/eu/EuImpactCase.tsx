import Link from "next/link";
import { FullAnalysisText } from "@/app/components/FullAnalysisText";
import { directionLabels, evidenceLabels, realityCheckLabels } from "@/lib/government/impact-cases";
import type { EuImpactRecord } from "@/lib/eu/impact-cases";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

export function EuImpactCase({ record, compact = false }: { record: EuImpactRecord; compact?: boolean }) {
  return <article className="government-impact-case" aria-labelledby={`eu-impact-${record.impact_case_id}`}>
    <header>
      <p className="eyebrow">EU-WÖk-Wirkungsanalyse · {record.analysis_mode.includes("REALITY") ? "mit Beobachtungsstufe" : "Ex ante"}</p>
      <h2 id={`eu-impact-${record.impact_case_id}`}>{record.title}</h2>
      <p className="lead">{record.editorial_summary}</p>
      <p className="government-key-finding"><strong>Wichtigster Befund:</strong> {record.key_finding}</p>
      <div className="government-impact-axis" aria-label="Wirkungsrichtung und Evidenz">
        <span className={`impact-direction impact-direction--${record.primary_direction.toLowerCase()}`}><strong>Richtung:</strong> {directionLabels[record.primary_direction]}</span>
        <span><strong>Evidenz:</strong> {evidenceLabels[record.evidence_level]}</span>
        <span><strong>Reality-Check:</strong> {realityCheckLabels[record.reality_check_status] ?? record.reality_check_status}</span>
      </div>
      <dl className="government-impact-summary">
        <div><dt>Wirkungskern</dt><dd>{record.impact_core_summary}</dd></div>
        <div><dt>Kompetenz</dt><dd>{record.competence_scope}</dd></div>
        <div><dt>Rechts- und Umsetzungsweg</dt><dd>{record.legal_feasibility_status}{record.implementation_route.length ? ` · ${record.implementation_route.join(", ")}` : ""}</dd></div>
      </dl>
    </header>
    {compact ? <Link className="text-link" href={`/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`}>Vollständige EU-Wirkungsanalyse öffnen</Link> : <>
      {record.inherited_legislative_file && <div className="notice"><strong>Geerbtes EU-Verfahren</strong><p>Dieser Vorgang stammt aus einer früheren Kommissionsphase und wird der aktuellen Kommission nicht rückwirkend zugerechnet.</p></div>}
      <section><h3>Datenbedarf für den Reality Check</h3><ul>{record.key_indicators.map((indicator) => <li key={indicator}>{indicator}</li>)}</ul></section>
      <section><h3>Quellen</h3><ul>{record.official_sources.map((source) => <li key={source}><Link href={sourceDetailHrefForUrl(source)}>Quellenakte öffnen</Link></li>)}</ul></section>
      <details className="government-full-record"><summary>Vollständige EU-Fachakte aufklappen</summary><FullAnalysisText source={{ title: record.title, releasedAt: record.analysis_as_of, sourceHash: record.source_release.case_markdown_sha256 ?? "", sourceDocumentHash: record.source_release.markdown_sha256 ?? "", markdown: record.full_analysis_markdown }} /></details>
    </>}
  </article>;
}
