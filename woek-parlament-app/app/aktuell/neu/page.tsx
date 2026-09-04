import Link from "next/link";
import { listPublishedCases } from "@/lib/cases";
import { listFachanalysen } from "@/lib/fachanalysen";
import { getPublicImpactCases } from "@/lib/government/impact-cases";
import { getEuImpactCases } from "@/lib/eu/impact-cases";
import { canonicalPortalHref } from "@/lib/navigation";

export const metadata = { title: "Neu veröffentlicht" };

export default function RecentPublicationsPage() {
  const records = [
    ...listPublishedCases().map((item) => ({ title: item.title, date: item.lastUpdated, href: `/entscheidungen/${item.slug}` })),
    ...listFachanalysen().map((item) => ({ title: item.title, date: item.analysisDate, href: `/fachanalysen/${item.slug}` })),
    ...getPublicImpactCases().map((item) => ({ title: item.title, date: item.analysis_as_of, href: `/regierung/wirkungsanalysen/${encodeURIComponent(item.impact_case_id)}` })),
    ...getEuImpactCases().map((item) => ({ title: item.title, date: item.analysis_as_of, href: `/eu/wirkungsfaelle/${encodeURIComponent(item.impact_case_id)}` })),
  ].sort((a, b) => b.date.localeCompare(a.date) || a.href.localeCompare(b.href));
  return <div className="shell content-page"><header className="page-intro"><h1>Neu veröffentlicht</h1><p className="lead">Veröffentlichte Akten nach ihrem dokumentierten Analyse- oder Aktualisierungsstand. Das Datum ist kein Nachweis einer eingetretenen Wirkung.</p></header>
    <ol className="source-register">{records.map((item) => <li key={item.href}><Link href={canonicalPortalHref(item.href)}>{item.title}</Link><p>Dokumentierter Stand: <time dateTime={item.date}>{item.date}</time></p></li>)}</ol>
  </div>;
}
