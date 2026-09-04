import Link from "next/link";
import { listPublicRealityCheckCandidates } from "@/lib/observatory/public-data";
import { getPublicImpactCases } from "@/lib/government/impact-cases";
import { humanizeSystemValue, publicObservatoryValueLabel } from "@/lib/presentation/labels";

/** Exact existing candidate projection; selection is not an outcome judgement. */
export function RealityCheckCandidates() {
  const candidates = listPublicRealityCheckCandidates();
  const publicImpactById = new Map(getPublicImpactCases().map((item) => [item.impact_case_id, item]));
  return <section className="section section-compact" aria-labelledby="reality-candidates">
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
    </section>;
}
