import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase } from "@/lib/cases";

export default async function FrozenVersionPage({ params }: { params: Promise<{ slug: string; versionId: string }> }) {
  const { slug, versionId } = await params;
  const item = getCase(slug);
  if (!item || versionId !== "demonstrator-v1") notFound();
  return <div className="container page-shell"><div className="frozen-banner"><strong>Historische Fassung</strong><span>Diese Ansicht ist eingefroren und wird nicht mit späterem Wissensstand überschrieben.</span></div><header className="page-intro"><p className="kicker">Fassung {versionId}</p><h1>{item.plainTitle}</h1><p>{item.versionNote}</p></header><section className="panel"><h2>Wirkungsänderung</h2><p><span className="chip">MATERIAL</span> Der Zustand zeigt, wie eine materielle Fassungsauswirkung dokumentiert wird. Bei einem echten Vorgang wären Dokument-Hash, Abrufzeit und geprüfter Diff hinterlegt.</p></section><p><Link href={`/entscheidungen/${slug}`}>Zur aktuellen Dauerseite</Link></p></div>;
}
