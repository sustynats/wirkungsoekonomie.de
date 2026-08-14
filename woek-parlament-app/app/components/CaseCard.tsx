import Link from "next/link";
import type { ParliamentaryCase } from "@/data/cases";
import { formatDate, materialityLabel } from "@/lib/cases";

export function CaseCard({ item }: { item: ParliamentaryCase }) {
  const statusClass = item.statusVerification === "VERIFIED" ? "verified" : item.statusVerification === "EDITORIAL_DEMONSTRATOR" ? "demo" : "unverified";
  return (
    <article className="case-card">
      <div className="case-card-topline">
        <span className={`status-pill ${statusClass}`}>{item.kind.replaceAll("_", " ")}</span>
        <span className="materiality">{materialityLabel(item.materiality)}</span>
      </div>
      <h3><Link href={`/entscheidungen/${item.slug}`}>{item.title}</Link></h3>
      <p>{item.summary}</p>
      <dl className="case-meta">
        <div><dt>Parlamentarischer Status</dt><dd>{item.parliamentaryStatus}</dd></div>
        <div><dt>Analyse</dt><dd>{item.analysisStatus}</dd></div>
        <div><dt>Aktualisiert</dt><dd>{formatDate(item.lastUpdated)}</dd></div>
      </dl>
      <Link className="text-link" href={`/entscheidungen/${item.slug}`}>Transparenzansicht öffnen <span aria-hidden="true">→</span></Link>
    </article>
  );
}
