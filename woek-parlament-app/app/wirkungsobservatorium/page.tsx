import Link from "next/link";
import { listExternalShocks, listOutcomeSeries, listPublicEvidenceEvents, listPublicRealityCheckCandidates, listStateObservations } from "@/lib/observatory/public-data";
import { getPublicImpactCases } from "@/lib/government/impact-cases";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { humanizeSystemValue, publicObservatoryQualityFieldLabel, publicObservatoryValueLabel } from "@/lib/presentation/labels";

export const metadata = {
  title: "Wirkungsobservatorium",
  description: "Amtliche Zustandsbeobachtungen, öffentliche Evidenzereignisse und fachlich freigegebene Anlässe für spätere Wirkungsprüfungen - getrennt von politischer Zurechnung.",
};

function qualityLabel(value: string | Record<string, string>) {
  if (typeof value === "string") {
    const label = publicObservatoryValueLabel(value);
    return { label, missingPublicLabel: !label };
  }
  let missingPublicLabel = false;
  const labels = Object.entries(value).flatMap(([key, item]) => {
    const fieldLabel = publicObservatoryQualityFieldLabel(key);
    const itemLabel = publicObservatoryValueLabel(item);
    if (!fieldLabel || !itemLabel) missingPublicLabel = true;
    return fieldLabel && itemLabel ? [`${fieldLabel}: ${itemLabel}`] : [];
  });
  return { label: labels.length ? labels.join(" · ") : null, missingPublicLabel };
}

export default function ImpactObservatoryPage() {
  const events = listPublicEvidenceEvents();
  const candidates = listPublicRealityCheckCandidates();
  const observations = listStateObservations();
  const series = listOutcomeSeries();
  const shocks = listExternalShocks();
  const publicImpacts = getPublicImpactCases();
  const publicImpactById = new Map(publicImpacts.map((item) => [item.impact_case_id, item]));
  return <main className="shell content-page">
    <header className="page-intro">
      <p className="eyebrow">Wirkungsobservatorium</p>
      <h1>Was verändert sich tatsächlich?</h1>
      <p className="lead">Das Observatorium sammelt freigegebene Zustandsbeobachtungen, Evaluationen und materielle Ereignisse. Ein neuer Datenpunkt ist noch keine Regierungswirkung. Er kann aber zeigen, wann eine frühere Wirkungshypothese erneut geprüft werden muss.</p>
    </header>
    <section className="section section-compact" aria-labelledby="state-observations">
      <p className="eyebrow">Messwert vor Deutung</p>
      <h2 id="state-observations">Amtliche Zustandsbeobachtungen</h2>
      <p>Messwert, außergewöhnliches Ereignis, Wirkungsfall und politische Zurechnung bleiben unterschiedliche Objekte.</p>
      <div className="source-register">{observations.map((observation) => {
        const outcome = series.find((item) => item.observation_ids.includes(observation.observation_id));
        const shock = shocks.find((item) => item.source_refs.includes(observation.source_ref));
        const revisionStatus = publicObservatoryValueLabel(observation.revision_status);
        const dataQuality = qualityLabel(observation.data_quality);
        const seriesStatus = outcome ? publicObservatoryValueLabel(outcome.status) : null;
        const shockAttribution = shock ? publicObservatoryValueLabel(shock.attribution_status) : null;
        return <article key={observation.observation_id}>
          {(revisionStatus || dataQuality.label) && <p className="source-register-label">{revisionStatus}{revisionStatus && dataQuality.label ? " · " : ""}{dataQuality.label ? `Datenqualität ${dataQuality.label}` : ""}</p>}
          <h3>{observation.definition}</h3>
          <p><strong>Messwert:</strong> {observation.value ?? "fehlend"} {observation.unit} · <strong>Zeitraum:</strong> {observation.observation_period}</p>
          <p><strong>Referenz:</strong> {observation.reference ?? "nicht ausgewiesen"}</p>
          <p><strong>Messreihe:</strong> {outcome ? <>{outcome.definition}{seriesStatus ? ` · ${seriesStatus}` : ""}</> : "keine Messreihe verknüpft"}</p>
          <p><strong>Außergewöhnliches externes Ereignis:</strong> {shock ? <>{shock.title}{shockAttribution ? ` · ${shockAttribution}` : ""}</> : "kein außergewöhnliches Ereignis verknüpft"}</p>
          {dataQuality.missingPublicLabel && <p className="open-state">Für einen technischen Datenqualitätswert liegt noch keine freigegebene öffentliche Bezeichnung vor. Er bleibt in dieser Ansicht ausgeblendet.</p>}
          <Link href={sourceDetailHrefForUrl(observation.source_ref)}>Amtliche Messquelle in der Quellenakte öffnen</Link>
        </article>;
      })}</div>
    </section>
    <section className="section section-compact" aria-labelledby="evidence-events">
      <p className="eyebrow">Öffentliche Evidenzspur</p>
      <h2 id="evidence-events">Neue Evidenzereignisse</h2>
      {events.length ? <div className="source-register">{events.map((event) => { const materiality = publicObservatoryValueLabel(event.materiality); const attribution = publicObservatoryValueLabel(event.attribution_status); const dataQuality = qualityLabel(event.data_quality); return <article id={event.evidence_event_id} key={event.evidence_event_id}>
        <p className="source-register-label">Beobachtung {new Date(event.observation_date).toLocaleString("de-DE")}{materiality ? ` · ${materiality}` : ""}</p>
        <h3>{event.title}</h3>
        <p>{event.concise_public_summary}</p>
        <p><strong>Was sich für die Prüfung ändert:</strong> {event.what_changed_or_may_change}</p>
        <p><strong>Betroffene Zustandsvariablen:</strong> {event.affected_state_variables.join(", ")}</p>
        {(attribution || dataQuality.label) && <p>{attribution ? <><strong>Zurechnung:</strong> {attribution}</> : null}{attribution && dataQuality.label ? " · " : ""}{dataQuality.label ? <><strong>Datenqualität:</strong> {dataQuality.label}</> : null}</p>}
        {dataQuality.missingPublicLabel && <p className="open-state">Für einen technischen Datenqualitätswert liegt noch keine freigegebene öffentliche Bezeichnung vor. Er bleibt in dieser Ansicht ausgeblendet.</p>}
        {event.notes_public && <p>{event.notes_public}</p>}
        <ul>{event.official_source_refs.map((source) => { const url = typeof source === "string" ? source : source.url; const label = typeof source === "string" ? "Quellenakte" : source.source; return <li key={url}><Link href={sourceDetailHrefForUrl(url)}>{label} - Quellenakte öffnen</Link></li>; })}</ul>
        {event.linked_impact_case_ids.map((id) => publicImpactById.has(id) ? <p key={id}><Link className="text-link" href={`/wirkungsfaelle/${encodeURIComponent(id)}`}>Verknüpften Wirkungsfall öffnen →</Link></p> : <p key={id}><strong>Fachbezug:</strong> Die verknüpfte Wirkungsanalyse ist noch nicht redaktionell publikationsreif.</p>)}
      </article>; })}</div> : <p>Derzeit ist kein öffentlich freigegebenes Evidenzereignis registriert.</p>}
    </section>
    <section className="section section-compact" aria-labelledby="reality-candidates">
      <p className="eyebrow">Prüfanlässe</p>
      <h2 id="reality-candidates">Fachlich freigegebene Reality-Check-Kandidaten</h2>
      <p>Ein Kandidat löst eine fachliche Prüfung aus. Er ändert weder Richtung noch Zurechnung automatisch.</p>
      {candidates.length ? <div className="source-register">{candidates.map((candidate) => { const impact = publicImpactById.get(candidate.linked_impact_case_id); const attribution = publicObservatoryValueLabel(candidate.attribution_status); return <article key={candidate.reality_candidate_id}>
        {attribution && <p className="source-register-label">Zurechnung: {attribution}</p>}
        <h3>{impact?.title ?? "Prüfanlass für einen verknüpften Wirkungsfall"}</h3>
        <p>{candidate.reason_for_recheck}</p>
        <details><summary>Offene Prüffragen</summary><ul>{candidate.required_review_questions.map((question) => <li key={question}>{humanizeSystemValue(question)}</li>)}</ul></details>
        {impact && <p><Link className="text-link" href={`/wirkungsfaelle/${encodeURIComponent(impact.impact_case_id)}`}>Verknüpften Wirkungsfall öffnen →</Link></p>}
      </article>; })}</div> : <p>Derzeit ist kein freigegebener Reality-Check-Kandidat registriert.</p>}
    </section>
  </main>;
}
