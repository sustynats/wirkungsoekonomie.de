import Link from "next/link";
import { notFound } from "next/navigation";
import { GovernmentImpactCase } from "@/app/components/government/GovernmentImpactCase";
import { getPublicImpactCases, publicRecordFromFullSchema } from "@/lib/government/impact-cases";
import { getApprovedPoliticalImpactCase } from "@/lib/parliament/daily-impact-cases";

export default async function ImpactCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const governmentRecord = getPublicImpactCases().find((entry) => entry.impact_case_id === decoded);
  const parliamentaryRecord = governmentRecord ? null : getApprovedPoliticalImpactCase(decoded);
  const record = governmentRecord ?? (parliamentaryRecord ? publicRecordFromFullSchema(parliamentaryRecord) : null);
  if (!record) notFound();
  return <main className="shell content-page"><nav className="breadcrumb" aria-label="Pfad"><Link href="/wirkungsfaelle">Wirkungsfälle</Link><span aria-hidden="true">/</span><span>{record.title}</span></nav><GovernmentImpactCase record={record} /></main>;
}
