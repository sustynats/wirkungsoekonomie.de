import Link from "next/link";
import { notFound } from "next/navigation";
import { EuImpactCase } from "@/app/components/eu/EuImpactCase";
import { euImpactCaseById, getEuImpactCases } from "@/lib/eu/impact-cases";

export const dynamicParams = false;

export function generateStaticParams() {
  return getEuImpactCases().map((record) => ({ id: record.impact_case_id }));
}

export default async function EuImpactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = euImpactCaseById(decodeURIComponent(id));
  if (!record) notFound();
  return <div className="shell content-page"><p className="record-context"><Link href="/eu">Europäische Union</Link><span aria-hidden="true">/</span><Link href="/eu/wirkungsfaelle">Wirkungsfälle</Link><span aria-hidden="true">/</span><span>{record.title}</span></p><EuImpactCase record={record} /></div>;
}
