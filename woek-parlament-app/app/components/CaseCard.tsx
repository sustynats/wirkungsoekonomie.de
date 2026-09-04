import Link from "next/link";
import type { ParliamentaryCase } from "@/data/cases";
import { formatDate, materialityLabel } from "@/lib/cases";
import { humanizeSystemValue } from "@/lib/presentation/labels";
import { CaseTypeMark } from "@/app/components/CaseTypeMark";
import { ImpactSignature } from "@/app/components/ImpactSignature";
import { findingExcerpt, projectImpactSignature } from "@/lib/presentation/impact-signature";
import { parliamentaryOverviewAssessment } from "@/lib/presentation/overview-assessment";
import { parliamentPublicMaturity } from "@/lib/presentation/public-maturity";

export function CaseCard({ item, variant = "card" }: { item: ParliamentaryCase; variant?: "card" | "row" }) {
  const assessment = parliamentaryOverviewAssessment(item);
  const maturity = parliamentPublicMaturity(item, assessment);
  return (
    <article className={`case-card case-card--${variant}`} data-woek-preview-card={assessment ? "published" : "fact-only"}>
      <div className="case-card-topline" role="group" aria-label="Objekttyp und Prüfrelevanz">
        <CaseTypeMark kind={item.kind} compact />
        <span className="chip chip--phase">{materialityLabel(item.materiality)}</span>
      </div>
      <h3><Link href={`/entscheidungen/${item.slug}`}>{item.plainTitle}</Link></h3>
      <div data-woek-preview-assessment={assessment ? "published" : undefined} data-woek-public-maturity={maturity.primary} data-woek-fact-only-status={!assessment ? "published" : undefined}>
        <p className="case-card-finding">{assessment ? <><small>Auszug: </small>{findingExcerpt(assessment.keyFinding)}</> : "Faktenakte – WÖk-Einordnung offen."}</p>
        <ImpactSignature signature={projectImpactSignature(assessment, maturity)} compact />
      </div>
      <div className="case-card-actions" data-woek-process-metadata>
        <small>{humanizeSystemValue(item.parliamentaryStatus)} · <span>Aktualisiert</span> <time dateTime={item.lastUpdated}>{formatDate(item.lastUpdated)}</time></small>
        <Link className="text-link" href={`/entscheidungen/${item.slug}`}>Akte öffnen <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
