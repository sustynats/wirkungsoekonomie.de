import Link from "next/link";
import { FullAnalysisText } from "@/app/components/FullAnalysisText";
import { OverviewAssessment } from "@/app/components/OverviewAssessment";
import { PublicMaturity } from "@/app/components/PublicMaturity";
import { RecommendationSection } from "@/app/components/recommendations/RecommendationSection";
import {
  boundaryLabels,
  dataStatusLabels,
  directionLabels,
  evidenceLabels,
  fullSchemaRecord,
  governmentEditorialProjection,
  mpdLabels,
  realityCheckLabels,
  type PublicGovernmentImpactRecord,
  type WoeKImpactCase,
} from "@/lib/government/impact-cases";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { humanizeSystemValue, publicStructuredFieldLabel } from "@/lib/presentation/labels";
import { governmentPublicMaturity } from "@/lib/presentation/public-maturity";
import { recommendationForImpactCase } from "@/lib/recommendations";

function referenceSet(record: WoeKImpactCase, key: "sdg_refs" | "sdg_plus_refs" | "legal_refs") {
  return [...new Set(record.impact_paths.flatMap((path) => path[key] ?? []))];
}

function publicValue(value: unknown) {
  return humanizeSystemValue(String(value));
}

const impactOrderLabels: Record<string, string> = {
  FIRST: "erste Ordnung",
  SECOND: "zweite Ordnung",
  THIRD: "dritte Ordnung",
  SYSTEMIC: "systemische Wirkung",
};

const timeHorizonLabels: Record<string, string> = {
  IMMEDIATE: "unmittelbar",
  SHORT: "kurzfristig",
  MEDIUM: "mittelfristig",
  LONG: "langfristig",
  INTERGENERATIONAL: "generationenübergreifend",
  NOT_YET_OBSERVABLE: "noch nicht beobachtbar",
};

const indicatorFunctionLabels: Record<string, string> = {
  BASELINE: "Ausgangszustand",
  IMPLEMENTATION: "Umsetzung und Vollzug",
  OUTPUT: "unmittelbares Ergebnis",
  OUTCOME: "beobachtete Zustandsveränderung",
  COUNTERFACTUAL: "Gegenfaktum",
  DISTRIBUTION: "Verteilung",
  BOUNDARY: "Schutzgrenze",
  ATTRIBUTION: "Zurechnung",
};

const materialityLevelLabels: Record<string, string> = {
  HIGH: "hohe Materialität",
  MEDIUM: "mittlere Materialität",
  LOW: "geringe Materialität",
  OPEN: "Materialität noch offen",
};

function stateObjectiveReference(value: string) {
  return /staatsziel|art\.?\s*20a\s*(?:gg|grundgesetz)/i.test(value);
}

function constitutionalReference(value: string) {
  return !stateObjectiveReference(value) && /grundrecht|menschenrecht|grundgesetz|\bgg\b|verfassungsprinzip|schutzpflicht/i.test(value);
}

function SourceList({ title, sources, empty }: { title: string; sources: string[]; empty: string }) {
  return <div><h4>{title}</h4>{sources.length ? <ul>{sources.map((source) => <li key={source}><Link href={sourceDetailHrefForUrl(source)}>Quellenakte öffnen</Link></li>)}</ul> : <p>{empty}</p>}</div>;
}

function FullSchemaDetails({ record }: { record: WoeKImpactCase }) {
  const sdgs = referenceSet(record, "sdg_refs");
  const sdgPlus = referenceSet(record, "sdg_plus_refs");
  const legal = referenceSet(record, "legal_refs");
  const stateObjectives = legal.filter(stateObjectiveReference);
  const constitutional = legal.filter(constitutionalReference);
  const otherLaw = legal.filter((value) => !stateObjectiveReference(value) && !constitutionalReference(value));
  const mpd = [...new Set(record.impact_paths.flatMap((path) => path.mpd))];
  const resilienceAndGeneration = [...new Set(record.impact_paths.flatMap((path) => path.reference as string[])
    .filter((value) => /resilien|generation|schwelle|planetare grenze|intergeneration/i.test(value)))];
  return <>
    <section aria-labelledby={`decision-${record.impact_case_id}`}>
      <h3 id={`decision-${record.impact_case_id}`}>Was wird entschieden?</h3>
      <dl className="government-impact-summary">
        <div><dt>Intervention</dt><dd>{record.scope.intervention}</dd></div>
        <div><dt>Politischer Gegenstand</dt><dd>{record.scope.policy_object}</dd></div>
        <div><dt>Umsetzungsstand</dt><dd>{publicValue(record.scope.implementation_state)}</dd></div>
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
            <strong>{publicValue(path.state_change)}</strong>
            <span>{evidenceLabels[path.evidence] ?? path.evidence}</span>
          </summary>
          <div className="government-impact-path-detail">
            <dl>
              <div><dt>Auslöser</dt><dd>{publicValue(path.trigger)}</dd></div>
              <div><dt>Wirkungsordnung</dt><dd>{impactOrderLabels[path.impact_order] ?? publicValue(path.impact_order)}</dd></div>
              <div><dt>Mechanismus</dt><dd>{publicValue(path.mechanism)}</dd></div>
              <div><dt>Zustandsvariable</dt><dd>{publicValue(path.state_variable)}</dd></div>
              <div><dt>Baseline</dt><dd>{path.baseline === null || path.baseline === undefined ? "nicht ausgewiesen" : publicValue(path.baseline)}</dd></div>
              <div><dt>Mögliche Veränderung</dt><dd>{publicValue(path.state_change)}</dd></div>
              <div><dt>Referenz</dt><dd>{(path.reference as string[]).map(publicValue).join(", ")}</dd></div>
              <div><dt>Zeithorizont</dt><dd>{timeHorizonLabels[path.time_horizon] ?? publicValue(path.time_horizon)}</dd></div>
              <div><dt>Datenstatus</dt><dd>{dataStatusLabels[path.data_status] ?? "offen dokumentiert"}</dd></div>
            </dl>
            {!!(path.affected_groups as string[])?.length && <div><h4>Wer ist betroffen?</h4><ul>{(path.affected_groups as string[]).map((item) => <li key={item}>{publicValue(item)}</li>)}</ul></div>}
            {!!(path.distributional_effects as string[])?.length && <div><h4>Verteilung und Generationen</h4><ul>{(path.distributional_effects as string[]).map((item) => <li key={item}>{publicValue(item)}</li>)}</ul></div>}
            {!!(path.conditions as string[])?.length && <div><h4>Bedingungen</h4><ul>{(path.conditions as string[]).map((item) => <li key={item}>{publicValue(item)}</li>)}</ul></div>}
            {!!(path.risks as string[])?.length && <div><h4>Gegenmechanismen und Risiken</h4><ul>{(path.risks as string[]).map((item) => <li key={item}>{publicValue(item)}</li>)}</ul></div>}
            {!!(path.uncertainties as string[])?.length && <div><h4>Unsicherheiten</h4><ul>{(path.uncertainties as string[]).map((item) => <li key={item}>{publicValue(item)}</li>)}</ul></div>}
            {!!(path.indicators as WoeKImpactCase["impact_paths"][number]["indicators"])?.length && <div><h4>Indikatoren</h4><ul>{path.indicators.map((item) => <li key={`${item.indicator}-${item.function}`}><strong>{publicValue(item.indicator)}</strong> - {indicatorFunctionLabels[item.function] ?? publicValue(item.function)}{item.unit ? ` · ${publicValue(item.unit)}` : ""}{item.preferred_source ? ` · ${publicValue(item.preferred_source)}` : ""}{item.woek_id ? ` · ${item.woek_id} (${publicValue(item.woek_id_status)})` : ""}</li>)}</ul></div>}
            {!!(path.evidence_basis as string[])?.length && <div><h4>Evidenzbasis des Pfads</h4><ul>{path.evidence_basis.map((item) => <li key={item}>{publicValue(item)}</li>)}</ul></div>}
          </div>
        </details>)}
      </div>
    </section>

    <section aria-labelledby={`affected-${record.impact_case_id}`}>
      <h3 id={`affected-${record.impact_case_id}`}>Wer und welche Systeme sind betroffen?</h3>
      <div className="government-impact-grid">
        <article><h4>Wirkungsempfänger</h4><ul>{record.scope.affected_groups.map((item) => <li key={item}>{publicValue(item)}</li>)}</ul></article>
        <article><h4>Betroffene Systeme</h4><ul>{record.scope.affected_systems.map((item) => <li key={item}>{publicValue(item)}</li>)}</ul></article>
        <article><h4>Materialität</h4><p>{materialityLevelLabels[record.materiality.level] ?? publicValue(record.materiality.level)}: {publicValue(record.materiality.rationale)}</p><p>{record.materiality.drivers.map(publicValue).join(", ")}</p></article>
        <article><h4>Kompetenzprüfung</h4><p>{record.scope.competence_note ? publicValue(record.scope.competence_note) : "In dieser Fachübergabe nicht strukturiert geprüft."}</p></article>
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
        <div><h4>Recht und Grundrechte · Verfassungsprinzipien</h4><p>{constitutional.join(", ") || "Nicht als eigener Referenzlayer ausgewiesen"}</p></div>
        <div><h4>Staatsziele und weitere rechtlich relevante Vorgaben</h4><p>{stateObjectives.join(", ") || "Nicht als eigener Referenzlayer ausgewiesen"}</p></div>
        <div><h4>EU-, Fach- und Völkerrecht</h4><p>{otherLaw.join(", ") || "Nicht als eigener Referenzlayer ausgewiesen"}</p></div>
        <div><h4>17 UN-SDGs</h4><p>{sdgs.join(", ") || "Kein Bezug ausgewiesen"}</p></div>
        <div><h4>SDG+ - WÖk-Erweiterung</h4><p>{sdgPlus.join(", ") || "Kein Bezug ausgewiesen"}</p></div>
        <div><h4>Mensch - Planet - Demokratie</h4><p>{mpd.map((value) => mpdLabels[value] ?? value).join(", ") || "Kein Bezug ausgewiesen"}</p></div>
        <div><h4>WÖk-Schutzgrenzen und Nichtkompensation</h4><p>{record.boundary_review.map((item) => `${publicValue(item.boundary)}: ${boundaryLabels[item.status] ?? item.status}`).join("; ") || "Keine strukturierte Schutzprüfung ausgewiesen"}</p></div>
        <div><h4>Wissenschaftliche Schwellen, Resilienz und Generationen</h4><p>{resilienceAndGeneration.map(publicValue).join(", ") || "Nicht als eigener Referenzlayer ausgewiesen"}</p></div>
      </div>
      <div className="government-boundaries">{record.boundary_review.map((boundary) => <article key={boundary.boundary_id} className={`boundary boundary--${boundary.status.toLowerCase()}`}>
        <strong>{publicValue(boundary.boundary)}</strong>
        <span>{boundaryLabels[boundary.status] ?? boundary.status}</span>
        <p>{publicValue(boundary.reason)}</p>
        {!!boundary.evidence_basis.length && <ul>{boundary.evidence_basis.map((item) => <li key={item}>{publicValue(item)}</li>)}</ul>}
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
      <p><strong>Bekannter Umsetzungsstand:</strong> {publicValue(record.implementation_tracking.known_status)}</p>
      <div className="government-impact-grid">
        <article><h4>Umsetzungsfragen</h4><ul>{record.implementation_tracking.implementation_questions.map((item) => <li key={item}>{publicValue(item)}</li>)}</ul></article>
        <article><h4>Umsetzungsindikatoren</h4><ul>{record.implementation_tracking.implementation_indicators.map((item) => <li key={item}>{publicValue(item)}</li>)}</ul></article>
        <article><h4>Konkrete Datenbedarfe</h4><ul>{record.data_needs.map((item) => <li key={item.data_id}><strong>{publicValue(item.priority)} · {indicatorFunctionLabels[item.function] ?? publicValue(item.function)}:</strong> {publicValue(item.question)} - {publicValue(item.data)}{item.preferred_source ? ` · ${publicValue(item.preferred_source)}` : ""}</li>)}</ul></article>
      </div>
    </section>

    <section aria-labelledby={`reality-${record.impact_case_id}`}>
      <h3 id={`reality-${record.impact_case_id}`}>Reality Check</h3>
      <p><strong>Status:</strong> {realityCheckLabels[record.reality_check.status] ?? record.reality_check.status}</p>
      <p><strong>Beobachtungsfenster:</strong> {record.reality_check.observation_window ?? "noch nicht festgelegt"}</p>
      <p><strong>Zurechnung:</strong> {record.reality_check.attribution ?? "nicht belegt"}</p>
      {record.reality_check.observations.length ? <ul>{record.reality_check.observations.map((item) => <li key={`${item.indicator}-${item.source}`}><strong>{publicValue(item.indicator)}:</strong> {publicValue(item.observation)} · Quelle: {publicValue(item.source)} · Grenze: {publicValue(item.interpretation_limit)}</li>)}</ul> : <p>Noch keine fachlich freigegebene Beobachtung.</p>}
      <p><strong>Nächste Prüfung:</strong> {record.reality_check.next_check ?? "noch nicht terminiert"}</p>
    </section>
  </>;
}

export function GovernmentImpactCase({ record, compact = false }: { record: PublicGovernmentImpactRecord; compact?: boolean }) {
  const fullRecord = fullSchemaRecord(record);
  const summary = record.impact_summary;
  const editorial = governmentEditorialProjection(record);
  const missingStructuredLabels = record.missing_structured_fields
    .map(publicStructuredFieldLabel)
    .filter((label): label is string => Boolean(label));
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
  const maturity = governmentPublicMaturity(record, assessment, {
    recommendationAvailable: Boolean(recommendationForImpactCase(record.impact_case_id)),
  });
  return (
    <article className="government-impact-case" aria-labelledby={`impact-${record.impact_case_id}`} data-woek-preview-card="published">
      <header>
        <h2 id={`impact-${record.impact_case_id}`}>{record.title}</h2>
        <OverviewAssessment compact={compact} assessment={assessment} />
        <PublicMaturity maturity={maturity} compact={compact} />
        {compact && <p className="eyebrow" data-woek-process-metadata>Analysephase · {record.analysis_mode === "IMPACT_REALITY_CHECK" ? "mit Reality-Check-Stufe" : "Ex ante"}</p>}
        {record.public_evidence_explanation && <p><strong>Öffentliche Evidenzeinordnung:</strong> {humanizeSystemValue(record.public_evidence_explanation)}</p>}
        {record.boundary_review_note && <p><strong>Schutz- und Wirkungsgrenzen:</strong> {humanizeSystemValue(record.boundary_review_note)}</p>}
        {record.impact_summary.public_summary && record.impact_summary.public_summary !== record.editorial_summary && <p><strong>Fachliche Original-Kurzfassung:</strong> {humanizeSystemValue(record.impact_summary.public_summary)}</p>}
        {record.public_analysis_depth === "LIMITED_FACH_RECORD" && <div className="open-state"><span aria-hidden="true">i</span><div><strong>Begrenzte Fachübergabe - keine strukturierte Vollanalyse.</strong><p>Die vollständige Fachakte bleibt unverändert zugänglich.{missingStructuredLabels.length ? ` Folgende Bereiche liegen noch nicht als strukturierte Datenfelder vor: ${missingStructuredLabels.join("; ")}.` : " Weitere strukturierte Prüfbereiche werden erst nach fachlicher Freigabe öffentlich benannt."}</p></div></div>}
        <dl className="government-impact-summary">
          <div><dt>Wirkungskern</dt><dd>{editorial.fields.impact_core_summary}</dd></div>
          {summary.strongest_positive_potential && <div><dt>Stärkstes positives Potenzial</dt><dd>{humanizeSystemValue(summary.strongest_positive_potential)}</dd></div>}
          {summary.main_risk_or_tradeoff && <div><dt>Wichtigstes Risiko oder Zielkonflikt</dt><dd>{humanizeSystemValue(summary.main_risk_or_tradeoff)}</dd></div>}
          {summary.direction_dependencies && <div><dt>Entscheidende Bedingungen</dt><dd>{humanizeSystemValue(summary.direction_dependencies)}</dd></div>}
        </dl>
      </header>

      {!compact && <>
        {fullRecord ? <FullSchemaDetails record={fullRecord} /> : null}

        <RecommendationSection impactCaseId={record.impact_case_id} />

        <section className="government-process-meta" aria-label="Politischer und administrativer Verfahrensstand" data-woek-process-metadata>
          <h3>Politischer und administrativer Prozess</h3>
          <p><strong>Analysephase:</strong> {record.analysis_mode === "IMPACT_REALITY_CHECK" ? "mit Reality-Check-Stufe" : "Ex ante"}</p>
          <p><strong>Bekannter Umsetzungsstand:</strong> {publicValue(record.implementation_status)}</p>
        </section>

        {record.full_analysis_markdown && <details className="government-full-record government-technical-proof">
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
            <div><dt>Datensatzprofil</dt><dd>{publicValue(record.record_profile)} · {publicValue(record.schema_validation)}{record.schema_id ? ` · ${record.schema_id}` : ""}</dd></div>
            <div><dt>Analysemodus</dt><dd>{publicValue(record.analysis_mode)}</dd></div>
            <div><dt>Fachstatus</dt><dd>{publicValue(record.publication_analysis_status)}</dd></div>
            <div><dt>Publikationsstatus</dt><dd>{publicValue(record.publication_status)}</dd></div>
            <div><dt>Materialität</dt><dd>{publicValue(record.materiality)}</dd></div>
            <div><dt>Fachliche Charakterisierung</dt><dd>{publicValue(record.overall_character)}</dd></div>
            <div><dt>Richtungscode</dt><dd>{publicValue(record.primary_direction)}</dd></div>
            <div><dt>Evidenzcode</dt><dd>{publicValue(record.evidence_level)}</dd></div>
            <div><dt>Umsetzungsstatus</dt><dd>{publicValue(record.implementation_status)}</dd></div>
            <div><dt>Schutzprüfung</dt><dd>{publicValue(record.boundary_status)}</dd></div>
            <div><dt>Reality-Check-Code</dt><dd>{publicValue(record.reality_check_status)}</dd></div>
            <div><dt>Empfehlungsstatus</dt><dd>{publicValue(record.recommendation_status)}</dd></div>
            <div><dt>Strukturierungsgrad</dt><dd>{publicValue(record.public_analysis_depth)}</dd></div>
            <div><dt>Kompetenzprüfung</dt><dd>{publicValue(record.competence_review_status)}: {publicValue(record.competence_status)}</dd></div>
            <div><dt>Zentraler Hebel</dt><dd>{record.impact_summary.central_lever || "im kompakten Datensatz nicht separat strukturiert"}</dd></div>
            <div><dt>Messpriorität</dt><dd>{record.impact_summary.measurement_priority || "im kompakten Datensatz nicht separat strukturiert"}</dd></div>
            <div><dt>Fachquelle</dt><dd>{record.source_release.jsonl_file} · SHA-256 {record.source_release.jsonl_sha256}</dd></div>
            <div><dt>Menschenlesbare Fachakte</dt><dd>{record.source_release.markdown_file} · SHA-256 {record.source_release.markdown_sha256}</dd></div>
            <div><dt>Fallauszug</dt><dd>SHA-256 {record.source_release.case_markdown_sha256}</dd></div>
            {record.editorial_evidence_overlay && <div><dt>Editorial-/Evidenz-Overlay</dt><dd>{record.editorial_evidence_overlay.source_file} · {publicValue(record.editorial_evidence_overlay.fach_status)} · SHA-256 {record.editorial_evidence_overlay.source_sha256}</dd></div>}
          </dl>
          {record.linked_government_action_ids.length ? <div><h4>Verknüpfte GovernmentActions</h4><ul>{record.linked_government_action_ids.map((id) => <li key={id}>{id}</li>)}</ul></div> : <p>Keine belastbar aufgelöste GovernmentAction-Verknüpfung veröffentlicht.</p>}
        </details>

      </>}
      {compact && <Link className="text-link" href={`/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`}>Wirkungspfade, Begründung und vollständige Fachakte öffnen</Link>}
    </article>
  );
}
