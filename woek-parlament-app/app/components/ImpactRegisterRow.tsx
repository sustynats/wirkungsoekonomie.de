import Link from "next/link";
import { ImpactSignature } from "./ImpactSignature";
import { findingExcerpt } from "@/lib/presentation/impact-signature";
import { formatDate } from "@/lib/cases";
import { humanizeSystemValue } from "@/lib/presentation/labels";
import type { RegisterObject } from "@/lib/register-model";

export function ImpactRegisterRow({ item }: { item: RegisterObject }) {
  return <article className="case-card case-card--row impact-register-row" data-register-id={item.id}>
    <div className="case-card-topline"><span className="chip">{item.typeLabel}</span><span className="chip">{item.relevance ?? "Prüfrelevanz offen"}</span></div>
    <h3><Link href={item.href}>{item.title}</Link></h3>
    <div>
      <p className="case-card-finding"><small>Auszug: </small>{findingExcerpt(item.finding)}</p>
      <ImpactSignature signature={item.signature} compact />
    </div>
    <div className="case-card-actions" data-woek-process-metadata>
      <small>{humanizeSystemValue(item.status)}{item.date && <> · <time dateTime={item.date}>{formatDate(item.date)}</time></>}</small>
      <Link className="text-link" href={item.href}>Akte öffnen <span aria-hidden="true">→</span></Link>
    </div>
  </article>;
}
