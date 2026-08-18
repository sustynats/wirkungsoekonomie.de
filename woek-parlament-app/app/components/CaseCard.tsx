import Link from "next/link";
import type { ParliamentaryCase } from "@/data/cases";
import { formatDate, materialityLabel } from "@/lib/cases";
import { humanizeSystemValue, verificationLabel } from "@/lib/presentation/labels";
import { BookmarkLink } from "@/app/components/BookmarkLink";
import { CaseTypeMark } from "@/app/components/CaseTypeMark";
import { EditorialReviewAssessment, OverviewAssessment } from "@/app/components/OverviewAssessment";
import { parliamentaryOverviewAssessment } from "@/lib/presentation/overview-assessment";

export function CaseCard({ item }: { item: ParliamentaryCase }) {
  const assessment = parliamentaryOverviewAssessment(item);
  return (
    <article className="case-card" data-woek-preview-card={assessment ? "published" : "review-required"}>
      <h3><Link href={`/entscheidungen/${item.slug}`}>{item.plainTitle}</Link></h3>
      {assessment ? <OverviewAssessment assessment={assessment} compact /> : <EditorialReviewAssessment subject={item.plainTitle} />}
      <div className="case-card-topline" aria-label="Prozess- und Prüfinformationen" data-woek-process-metadata>
        <CaseTypeMark kind={item.kind} maturity={item.publicWorkingAct?.maturity} compact />
        <span className="chip chip--phase">{materialityLabel(item.materiality)}</span>
      </div>
      <dl className="case-meta">
        <div><dt>Parlamentarischer Status</dt><dd>{humanizeSystemValue(item.parliamentaryStatus)}</dd></div>
        <div><dt>Stand der WÖk-Analyse</dt><dd>{humanizeSystemValue(item.analysisStatus)}</dd></div>
        <div><dt>Quellenstatus</dt><dd>{verificationLabel(item.statusVerification)}</dd></div>
        <div><dt>Aktualisiert</dt><dd>{formatDate(item.lastUpdated)}</dd></div>
      </dl>
      <div className="case-card-actions">
        <Link className="text-link" href={`/entscheidungen/${item.slug}`}>Transparenzansicht öffnen <span aria-hidden="true">→</span></Link>
        <BookmarkLink title={item.title} path={`/entscheidungen/${item.slug}`} compact />
      </div>
    </article>
  );
}
