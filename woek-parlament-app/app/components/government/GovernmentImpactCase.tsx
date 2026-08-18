import Link from "next/link";
import { FullAnalysisText } from "@/app/components/FullAnalysisText";
import { RecommendationSection } from "@/app/components/recommendations/RecommendationSection";
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
    <section aria-labelledby={`decision-${record.impact_case_id}`}>
      <h3 id={`decision-${record.impact_case_id}`}>Was wird entschieden?</h3>
      <dl className="government-impact-summary">
        <div><dt>Intervention</dt><dd>{record.scope.intervention}</dd></div>
        <div><dt>Politischer Gegenstand</dt><dd>{record.scope.policy_object}</dd></div>
        <div><dt>Umsetzungsstand</dt><dd>{record.scope.implementation_state}</dd></div>
        <div><dt>Wissensstand der Entscheidung</dt><dd>{record.scope.decision_knowledge_cutoff ?? "nicht als Datum ausgewiesen"}</dd></div>
      </dl>
    </section>

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
              <div><dt>Wirkungsordnung</dt><dd>{String(path.impact_order)}</dd></div>
              <div><dt>Mechanismus</dt><dd>{String(path.mechanism)}</dd></div>
              <div><dt>Zustandsvariable</dt><dd>{String(path.state_variable)}</dd></div>
              <div><dt>Baseline</dt><dd>{path.baseline === null || path.baseline === undefined ? "nicht ausgewiesen" : String(path.baseline)}</dd></div>
              <div><dt>Mögliche Veränderung</dt><dd>{String(path.state_change)}</dd></div>
              <div><dt>Referenz</dt><dd>{(path.reference as string[]).join(", ")}</dd></div>
              <div><dt>Zeithorizont</dt><dd>{String(path.time_horizon)}</dd></div>
              <div><dt>Datenstatus</dt><dd>{dataStatusLabels[path.data_status] ?? "offen dokumentiert"}</dd></div>
            </dl>
            {!!(path.affected_groups as string[])?.length && <div><h4>Wer ist betroffen?</h4><ul>{(path.affected_groups as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>}
            {!!(path.distributional_effects as string[])?.length && <div><h4>Verteilung und Generationen</h4><ul>{(path.distributional_effects as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>}
            {!!(path.conditions as string[])?.length && <div><h4>Bedingungen</h4><ul>{(path.conditions as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>}
            {!!(path.risks as string[])?.length && <div><h4>Gegenmechanismen und Risiken</h4><ul>{(path.risks as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>}
            {!!(path.uncertainties as string[])?.length && <div><h4>Unsicherheiten</h4><ul>{(path.uncertainties as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>}
            {!!(path.indicators as WoeKImpactCase["impact_paths"][number]["indicators"])?.length && <div><h4>Indikatoren</h4><ul>{path.indicators.map((item) => <li key={`${item.indicator}-${item.function}`}><strong>{item.indicator}</strong> - {item.function}{item.unit ? ` · ${item.unit}` : ""}{item.preferred_source ? ` · ${item.preferred_source}` : ""}{item.woek_id ? ` · ${item.woek_id} (${item.woek_id_status})` : ""}</li>)}</ul></div>}
            {!!(path.evidence_basis as string[])?.length && <div><h4>Evidenzbasis des Pfads</h4><ul>{path.evidence_basis.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          </div>
        </details>)}
      </div>
    </section>

    <section aria-labelledby={`affected-${record.impact_case_id}`}>
      <h3 id={`affected-${record.impact_case_id}`}>Wer und welche Systeme sind betroffen?</h3>
      <div className="government-impact-grid">
        <article><h4>Wirkungsempfänger</h4><ul>{record.scope.affected_groups.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h4>Betroffene Systeme</h4><ul>{record.scope.affected_systems.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h4>Materialität</h4><p>{record.materiality.level}: {record.materiality.rationale}</p><p>{record.materiality.drivers.join(", ")}</p></article>
        <article><h4>Kompetenzprüfung</h4><p>{record.scope.competence_note ?? "In dieser Fachübergabe nicht strukturiert geprüft."}</p></article>
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
      <p><strong>Wissensgrenze:</strong> {record.evidence_summary.decision_time_evidence_boundary}</p>
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
        {!!boundary.evidence_basis.length && <ul>{boundary.evidence_basis.map((item) => <li key={item}>{item}</li>)}</ul>}
      </article>)}</div>
    </section>

    <section aria-labelledby={`counterfactual-${record.impact_case_id}`}>
      <h3 id={`counterfactual-${record.impact_case_id}`}>Gegenfaktum und Zurechnung</h3>
      <p><strong>Prüffrage:</strong> {record.counterfactual.primary_question}</p>
      <p><strong>Ohne Maßnahme plausibel:</strong> {record.counterfactual.plausible_without_measure}</p>
      <div className="government-impact-grid">
        <article><h4>Alternativdesigns</h4><ul>{record.counterfactual.alternative_designs.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h4>Identifikationsstrategie</h4><ul>{record.counterfactual.identification_strategy.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h4>Grenzen</h4><ul>{record.counterfactual.limitations.map((item) => <li key={item}>{item}</li>)}</ul></article>
      </div>
    </section>

    <section aria-labelledby={`data-${record.impact_case_id}`}>
      <h3 id={`data-${record.impact_case_id}`}>Datenbedarf und Umsetzung</h3>
      <p><strong>Bekannter Umsetzungsstand:</strong> {record.implementation_tracking.known_status}</p>
      <div className="government-impact-grid">
        <article><h4>Umsetzungsfragen</h4><ul>{record.implementation_tracking.implementation_questions.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h4>Umsetzungsindikatoren</h4><ul>{record.implementation_tracking.implementation_indicators.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h4>Konkrete Datenbedarfe</h4><ul>{record.data_needs.map((item) => <li key={item.data_id}><strong>{item.priority} · {item.function}:</strong> {item.question} - {item.data}{item.preferred_source ? ` · ${item.preferred_source}` : ""}</li>)}</ul></article>
      </div>
    </section>

    <section aria-labelledby={`reality-${record.impact_case_id}`}>
      <h3 id={`reality-${record.impact_case_id}`}>Reality Check</h3>
      <p><strong>Status:</strong> {realityCheckLabels[record.reality_check.status] ?? record.reality_check.status}</p>
      <p><strong>Beobachtungsfenster:</strong> {record.reality_check.observation_window ?? "noch nicht festgelegt"}</p>
      <p><strong>Zurechnung:</strong> {record.reality_check.attribution ?? "nicht belegt"}</p>
      {record.reality_check.observations.length ? <ul>{record.reality_check.observations.map((item) => <li key={`${item.indicator}-${item.source}`}><strong>{item.indicator}:</strong> {item.observation} · Quelle: {item.source} · Grenze: {item.interpretation_limit}</li>)}</ul> : <p>Noch keine fachlich freigegebene Beobachtung.</p>}
      <p><strong>Nächste Prüfung:</strong> {record.reality_check.next_check ?? "noch nicht terminiert"}</p>
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
        <p className="government-overview-assessment"><strong>Zusammenfassende Einordnung:</strong> {record.overview_assessment_label}</p>
        <p className="lead">{lead}</p>
        {record.impact_summary.public_summary && record.impact_summary.public_summary !== lead && <p><strong>Fachliche Original-Kurzfassung:</strong> {record.impact_summary.public_summary}</p>}
        {record.key_finding && <p className="government-key-finding"><strong>Wichtigster Befund:</strong> {record.key_finding}</p>}
        <div className="government-impact-axis" aria-label="Wirkungsrichtung und Evidenz">
          <span className={`impact-direction impact-direction--${record.primary_direction.toLowerCase()}`}><strong>Richtung:</strong> {directionLabels[record.primary_direction]}</span>
          <span><strong>Evidenz:</strong> {evidenceLabels[record.evidence_level]}</span>
          <span><strong>Reality-Check:</strong> {realityCheckLabels[record.reality_check_status] ?? record.reality_check_status}</span>
        </div>
        <p><strong>Evidenz kurz erklärt:</strong> {record.evidence_summary_text}</p>
        <p><strong>Reality-Check kurz erklärt:</strong> {record.reality_check_summary}</p>
        {record.public_analysis_depth === "LIMITED_FACH_RECORD" && <div className="open-state"><span aria-hidden="true">i</span><div><strong>Begrenzte Fachübergabe - keine strukturierte Vollanalyse.</strong><p>Die vollständige Fachakte bleibt unverändert zugänglich. Noch nicht maschinenlesbar strukturiert: {record.missing_structured_fields.join(", ")}.</p></div></div>}
        <dl className="government-impact-summary">
          <div><dt>Wirkungskern</dt><dd>{record.impact_core_summary}</dd></div>
          {summary.strongest_positive_potential && <div><dt>Stärkstes positives Potenzial</dt><dd>{summary.strongest_positive_potential}</dd></div>}
          {summary.main_risk_or_tradeoff && <div><dt>Wichtigstes Risiko oder Zielkonflikt</dt><dd>{summary.main_risk_or_tradeoff}</dd></div>}
          {summary.direction_dependencies && <div><dt>Entscheidende Bedingungen</dt><dd>{summary.direction_dependencies}</dd></div>}
        </dl>
      </header>

      {!compact && <>
        {fullRecord ? <FullSchemaDetails record={fullRecord} /> : null}

        <RecommendationSection impactCaseId={record.impact_case_id} />

        {record.full_analysis_markdown && <details className="government-full-record">
          <summary>Vollständige, unveränderte Fachakte aufklappen</summary>
          <FullAnalysisText source={{
            title: record.title,
            releasedAt: record.analysis_as_of,
            sourceHash: record.source_release.case_markdown_sha256,
            sourceDocumentHash: record.source_release.markdown_sha256,
            markdown: record.full_analysis_markdown,
          }} />
        </details>}

        <section aria-labelledby={`sources-${record.impact_case_id}`}>
          <h3 id={`sources-${record.impact_case_id}`}>Quellen nach Funktion</h3>
          <div className="government-source-groups">
            <SourceList title="Amtliche Faktenquellen" sources={record.official_fact_sources} empty="Keine separate URL im kompakten Datensatz; die vollständige Fachakte dokumentiert die Quellenbasis." />
            <SourceList title="Quellen zum Wirkmechanismus" sources={record.mechanism_sources} empty="Im kompakten Datensatz nicht separat maschinenlesbar ausgewiesen; siehe vollständige Fachakte." />
            <SourceList title="Quellen nach der Entscheidung" sources={record.post_decision_sources} empty="Noch keine separat freigegebenen Ex-post-Quellen." />
          </div>
          <p className="government-method-meta">Analyseversion {record.analysis_version} · Analysestand {record.analysis_as_of} · {record.record_profile === "FULL_SCHEMA_2_0_1" ? "Vollschema 2.0.1" : "kompakte Fachübergabe, inhaltlich unverändert"}</p>
        </section>

        <details className="government-technical-proof">
          <summary>Technischen Publikationsnachweis ansehen</summary>
          <dl className="government-impact-summary">
            <div><dt>ImpactCase-ID</dt><dd>{record.impact_case_id}</dd></div>
            <div><dt>Datensatzprofil</dt><dd>{record.record_profile} · {record.schema_validation}{record.schema_id ? ` · ${record.schema_id}` : ""}</dd></div>
            <div><dt>Analysemodus</dt><dd>{record.analysis_mode}</dd></div>
            <div><dt>Fachstatus</dt><dd>{record.publication_analysis_status}</dd></div>
            <div><dt>Publikationsstatus</dt><dd>{record.publication_status}</dd></div>
            <div><dt>Materialität</dt><dd>{record.materiality}</dd></div>
            <div><dt>Fachliche Charakterisierung</dt><dd>{record.overall_character}</dd></div>
            <div><dt>Richtungscode</dt><dd>{record.primary_direction}</dd></div>
            <div><dt>Evidenzcode</dt><dd>{record.evidence_level}</dd></div>
            <div><dt>Umsetzungsstatus</dt><dd>{record.implementation_status}</dd></div>
            <div><dt>Schutzprüfung</dt><dd>{record.boundary_status}</dd></div>
            <div><dt>Reality-Check-Code</dt><dd>{record.reality_check_status}</dd></div>
            <div><dt>Empfehlungsstatus</dt><dd>{record.recommendation_status}</dd></div>
            <div><dt>Strukturierungsgrad</dt><dd>{record.public_analysis_depth}</dd></div>
            <div><dt>Kompetenzprüfung</dt><dd>{record.competence_review_status}: {record.competence_status}</dd></div>
            <div><dt>Zentraler Hebel</dt><dd>{record.impact_summary.central_lever || "im kompakten Datensatz nicht separat strukturiert"}</dd></div>
            <div><dt>Messpriorität</dt><dd>{record.impact_summary.measurement_priority || "im kompakten Datensatz nicht separat strukturiert"}</dd></div>
            <div><dt>Fachquelle</dt><dd>{record.source_release.jsonl_file} · SHA-256 {record.source_release.jsonl_sha256}</dd></div>
            <div><dt>Menschenlesbare Fachakte</dt><dd>{record.source_release.markdown_file} · SHA-256 {record.source_release.markdown_sha256}</dd></div>
            <div><dt>Fallauszug</dt><dd>SHA-256 {record.source_release.case_markdown_sha256}</dd></div>
          </dl>
          {record.linked_government_action_ids.length ? <div><h4>Verknüpfte GovernmentActions</h4><ul>{record.linked_government_action_ids.map((id) => <li key={id}>{id}</li>)}</ul></div> : <p>Keine belastbar aufgelöste GovernmentAction-Verknüpfung veröffentlicht.</p>}
        </details>

      </>}
      {compact && <Link className="text-link" href={`/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`}>Wirkungspfade, Begründung und vollständige Fachakte öffnen</Link>}
    </article>
  );
}
