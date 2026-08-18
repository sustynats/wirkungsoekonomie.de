import Link from "next/link";
import { FullAnalysisText } from "@/app/components/FullAnalysisText";
import {
  boundaryLabels,
  dataStatusLabels,
  directionLabels,
  evidenceLabels,
  fullSchemaRecord,
  mpdLabels,
  realityCheckLabels,
  type PublicGovernmentImpactRecord,
  type WoeKImpactCase,
} from "@/lib/government/impact-cases";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

function referenceSet(record: WoeKImpactCase, key: "sdg_refs" | "sdg_plus_refs" | "legal_refs") {
  return [...new Set(record.impact_paths.flatMap((path) => path[key] ?? []))];
}

function SourceList({ title, sources, empty }: { title: string; sources: string[]; empty: string }) {
  return <div><h4>{title}</h4>{sources.length ? <ul>{sources.map((source) => <li key={source}><Link href={sourceDetailHrefForUrl(source)}>Quellenakte öffnen</Link></li>)}</ul> : <p>{empty}</p>}</div>;
}

function FullSchemaDetails({ record }: { record: WoeKImpactCase }) {
  const sdgs = referenceSet(record, "sdg_refs");
  const sdgPlus = referenceSet(record, "sdg_plus_refs");
  const legal = referenceSet(record, "legal_refs");
  const mpd = [...new Set(record.impact_paths.flatMap((path) => path.mpd))];
  return <>
    <section aria-labelledby={`paths-${record.impact_case_id}`}>
      <h3 id={`paths-${record.impact_case_id}`}>Wie soll die Wirkung entstehen?</h3>
      <p>Jeder Wirkpfad zeigt Auslöser, Mechanismus, mögliche Zustandsveränderung und Referenz getrennt. Die Pfade werden nicht zu einem Punktwert addiert.</p>
      <div className="government-impact-paths">
        {record.impact_paths.map((path) => <details key={path.path_id}>
          <summary>
            <span className={`impact-direction impact-direction--${path.direction.toLowerCase()}`}>{directionLabels[path.direction] ?? path.direction}</span>
            <strong>{String(path.state_change)}</strong>
            <span>{evidenceLabels[path.evidence] ?? path.evidence}</span>
          </summary>
          <div className="government-impact-path-detail">
            <dl>
              <div><dt>Auslöser</dt><dd>{String(path.trigger)}</dd></div>
              <div><dt>Mechanismus</dt><dd>{String(path.mechanism)}</dd></div>
              <div><dt>Zustandsvariable</dt><dd>{String(path.state_variable)}</dd></div>
              <div><dt>Mögliche Veränderung</dt><dd>{String(path.state_change)}</dd></div>
              <div><dt>Referenz</dt><dd>{(path.reference as string[]).join(", ")}</dd></div>
              <div><dt>Datenstatus</dt><dd>{dataStatusLabels[path.data_status] ?? "offen dokumentiert"}</dd></div>
            </dl>
            {!!(path.affected_groups as string[])?.length && <div><h4>Wer ist betroffen?</h4><ul>{(path.affected_groups as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>}
            {!!(path.conditions as string[])?.length && <div><h4>Bedingungen</h4><ul>{(path.conditions as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>}
            {!!(path.risks as string[])?.length && <div><h4>Gegenmechanismen und Risiken</h4><ul>{(path.risks as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>}
            {!!(path.uncertainties as string[])?.length && <div><h4>Unsicherheiten</h4><ul>{(path.uncertainties as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>}
          </div>
        </details>)}
      </div>
    </section>

    <section className="government-impact-evidence" aria-labelledby={`evidence-${record.impact_case_id}`}>
      <h3 id={`evidence-${record.impact_case_id}`}>Wie belastbar ist die Einordnung?</h3>
      <p>Richtung und Evidenz sind getrennte Aussagen. Ein negatives Potenzial mit geringer Evidenz ist nicht dasselbe wie eine offene Wirkungsrichtung.</p>
      <div className="government-impact-grid">
        <article><h4>Amtlicher Sachverhalt</h4><p>{String(record.evidence_summary.fact_evidence)}</p></article>
        <article><h4>Wirkmechanismus</h4><p>{String(record.evidence_summary.mechanism_evidence)}</p></article>
        <article><h4>Beobachtete Wirkung</h4><p>{String(record.evidence_summary.effect_evidence)}</p></article>
        <article><h4>Unsicherheit</h4><p>{String(record.evidence_summary.uncertainty)}</p></article>
      </div>
      <p><strong>Reality-Check:</strong> {realityCheckLabels[record.reality_check.status] ?? record.reality_check.status}. Beobachtung und kausale Zurechnung bleiben getrennt.</p>
    </section>

    <section aria-labelledby={`assessment-${record.impact_case_id}`}>
      <h3 id={`assessment-${record.impact_case_id}`}>Referenzrahmen und Schutzprüfung</h3>
      <div className="government-reference-groups">
        <div><h4>Mensch - Planet - Demokratie</h4><p>{mpd.map((value) => mpdLabels[value] ?? value).join(", ") || "Kein Bezug ausgewiesen"}</p></div>
        <div><h4>SDGs</h4><p>{sdgs.join(", ") || "Kein Bezug ausgewiesen"}</p></div>
        <div><h4>SDG+ - WÖk-Erweiterung</h4><p>{sdgPlus.join(", ") || "Kein Bezug ausgewiesen"}</p></div>
        <div><h4>Recht und Grundrechte</h4><p>{legal.join(", ") || "Kein Bezug ausgewiesen"}</p></div>
      </div>
      <div className="government-boundaries">{record.boundary_review.map((boundary) => <article key={boundary.boundary_id} className={`boundary boundary--${boundary.status.toLowerCase()}`}>
        <strong>{String(boundary.boundary)}</strong>
        <span>{boundaryLabels[boundary.status] ?? boundary.status}</span>
        <p>{String(boundary.reason)}</p>
      </article>)}</div>
    </section>
  </>;
}

export function GovernmentImpactCase({ record, compact = false }: { record: PublicGovernmentImpactRecord; compact?: boolean }) {
  const fullRecord = fullSchemaRecord(record);
  const summary = record.impact_summary;
  const lead = record.editorial_summary;
  return (
    <article className="government-impact-case" aria-labelledby={`impact-${record.impact_case_id}`}>
      <header>
        <p className="eyebrow">WÖk-Wirkungsanalyse · {record.analysis_mode === "IMPACT_REALITY_CHECK" ? "mit Reality-Check-Stufe" : "Ex ante"}</p>
        <h2 id={`impact-${record.impact_case_id}`}>{record.title}</h2>
        <p className="lead">{lead}</p>
        {record.key_finding && <p className="government-key-finding"><strong>Wichtigster Befund:</strong> {record.key_finding}</p>}
        <div className="government-impact-axis" aria-label="Wirkungsrichtung und Evidenz">
          <span className={`impact-direction impact-direction--${record.primary_direction.toLowerCase()}`}><strong>Richtung:</strong> {directionLabels[record.primary_direction]}</span>
          <span><strong>Evidenz:</strong> {evidenceLabels[record.evidence_level]}</span>
          <span><strong>Reality-Check:</strong> {realityCheckLabels[record.reality_check_status] ?? record.reality_check_status}</span>
        </div>
        <dl className="government-impact-summary">
          <div><dt>Wirkungskern</dt><dd>{record.impact_core_summary}</dd></div>
          {summary.strongest_positive_potential && <div><dt>Stärkstes positives Potenzial</dt><dd>{summary.strongest_positive_potential}</dd></div>}
          {summary.main_risk_or_tradeoff && <div><dt>Wichtigstes Risiko oder Zielkonflikt</dt><dd>{summary.main_risk_or_tradeoff}</dd></div>}
          {summary.direction_dependencies && <div><dt>Entscheidende Bedingungen</dt><dd>{summary.direction_dependencies}</dd></div>}
        </dl>
      </header>

      {!compact && <>
        {fullRecord ? <FullSchemaDetails record={fullRecord} /> : null}

        <section aria-labelledby={`sources-${record.impact_case_id}`}>
          <h3 id={`sources-${record.impact_case_id}`}>Quellen nach Funktion</h3>
          <div className="government-source-groups">
            <SourceList title="Amtliche Faktenquellen" sources={record.official_fact_sources} empty="Keine separate URL im kompakten Datensatz; die vollständige Fachakte dokumentiert die Quellenbasis." />
            <SourceList title="Quellen zum Wirkmechanismus" sources={record.mechanism_sources} empty="Im kompakten Datensatz nicht separat maschinenlesbar ausgewiesen; siehe vollständige Fachakte." />
            <SourceList title="Quellen nach der Entscheidung" sources={record.post_decision_sources} empty="Noch keine separat freigegebenen Ex-post-Quellen." />
          </div>
          <p className="government-method-meta">Analyseversion {record.analysis_version} · Analysestand {record.analysis_as_of} · {record.record_profile === "FULL_SCHEMA_2_0_1" ? "Vollschema 2.0.1" : "kompakte Fachübergabe, inhaltlich unverändert"}</p>
        </section>

        {record.full_analysis_markdown && <details className="government-full-record">
          <summary>Vollständige Fachakte aufklappen</summary>
          <FullAnalysisText source={{
            title: record.title,
            releasedAt: record.analysis_as_of,
            sourceHash: record.source_release.case_markdown_sha256,
            sourceDocumentHash: record.source_release.markdown_sha256,
            markdown: record.full_analysis_markdown,
          }} />
        </details>}
      </>}
      {compact && <Link className="text-link" href={`/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`}>Wirkungspfade, Begründung und vollständige Fachakte öffnen</Link>}
    </article>
  );
}
