import Link from "next/link";
import { listPublicEvidenceEvents, listPublicRealityCheckCandidates } from "@/lib/observatory/public-data";
import { getPublicImpactCases } from "@/lib/government/impact-cases";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

export const metadata = {
  title: "Wirkungsobservatorium",
  description: "Amtliche Zustandsbeobachtungen, EvidenceEvents und fachlich freigegebene Reality-Check-Anlässe - getrennt von politischer Zurechnung.",
};

function qualityLabel(value: string | Record<string, string>) {
  if (typeof value === "string") return value;
  return Object.entries(value).map(([key, item]) => `${key}: ${item}`).join(" · ");
}

export default function ImpactObservatoryPage() {
  const events = listPublicEvidenceEvents();
  const candidates = listPublicRealityCheckCandidates();
  const publicImpactIds = new Set(getPublicImpactCases().map((item) => item.impact_case_id));
  return <main className="shell content-page">
    <header className="page-intro">
      <p className="eyebrow">Wirkungsobservatorium</p>
      <h1>Was verändert sich tatsächlich?</h1>
      <p className="lead">Das Observatorium sammelt freigegebene Zustandsbeobachtungen, Evaluationen und materielle Ereignisse. Ein neuer Datenpunkt ist noch keine Regierungswirkung. Er kann aber zeigen, wann eine frühere Wirkungshypothese erneut geprüft werden muss.</p>
    </header>
    <section className="section section-compact" aria-labelledby="evidence-events">
      <p className="eyebrow">Öffentliche Evidenzspur</p>
      <h2 id="evidence-events">Neue EvidenceEvents</h2>
      {events.length ? <div className="source-register">{events.map((event) => <article id={event.evidence_event_id} key={event.evidence_event_id}>
        <p className="source-register-label">Beobachtung {new Date(event.observation_date).toLocaleString("de-DE")} · {event.materiality}</p>
        <h3>{event.title}</h3>
        <p>{event.concise_public_summary}</p>
        <p><strong>Was sich für die Prüfung ändert:</strong> {event.what_changed_or_may_change}</p>
        <p><strong>Zurechnung:</strong> {event.attribution_status} · <strong>Datenqualität:</strong> {qualityLabel(event.data_quality)}</p>
        {event.notes_public && <p>{event.notes_public}</p>}
        <ul>{event.official_source_refs.map((source) => { const url = typeof source === "string" ? source : source.url; const label = typeof source === "string" ? "Quellenakte" : source.source; return <li key={url}><Link href={sourceDetailHrefForUrl(url)}>{label} - Quellenakte öffnen</Link></li>; })}</ul>
        {event.linked_impact_case_ids.map((id) => publicImpactIds.has(id) ? <p key={id}><Link className="text-link" href={`/wirkungsfaelle/${encodeURIComponent(id)}`}>Verknüpften Wirkungsfall öffnen →</Link></p> : <p key={id}><strong>Fachbezug:</strong> {id} - Wirkungsanalyse ist noch nicht redaktionell publikationsreif.</p>)}
      </article>)}</div> : <p>Derzeit ist kein öffentlich freigegebenes EvidenceEvent registriert.</p>}
    </section>
    <section className="section section-compact" aria-labelledby="reality-candidates">
      <p className="eyebrow">Prüfanlässe</p>
      <h2 id="reality-candidates">Fachlich freigegebene Reality-Check-Kandidaten</h2>
      <p>Ein Kandidat löst eine fachliche Prüfung aus. Er ändert weder Richtung noch Zurechnung automatisch.</p>
      {candidates.length ? <div className="source-register">{candidates.map((candidate) => <article key={candidate.reality_candidate_id}>
        <p className="source-register-label">{candidate.priority} · {candidate.attribution_status}</p>
        <h3>{candidate.linked_impact_case_id}</h3>
        <p>{candidate.reason_for_recheck}</p>
        <details><summary>Offene Prüffragen</summary><ul>{candidate.required_review_questions.map((question) => <li key={question}>{question}</li>)}</ul></details>
      </article>)}</div> : <p>Derzeit ist kein freigegebener Reality-Check-Kandidat registriert.</p>}
    </section>
  </main>;
}
