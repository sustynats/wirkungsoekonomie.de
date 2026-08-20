import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SaxonyAnhaltProgrammeAnalysisV3 } from "@/app/components/SaxonyAnhaltProgrammeAnalysisV3";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { getSaxonyAnhaltPublicationSources } from "@/lib/publication/fachakten";

export const dynamic = "force-dynamic";

function programmeFor(sourceKey: string) {
  return saxonyAnhaltElectionProgrammes.find((programme) => programme.sourceKey === sourceKey) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ sourceKey: string }> }): Promise<Metadata> {
  const sourceKey = (await params).sourceKey;
  const programme = programmeFor(sourceKey);
  if (!programme) return { title: "Wahlprogramm nicht gefunden" };
  return {
    title: `${programme.party} · WÖk-Wahlprogrammanalyse Sachsen-Anhalt 2026`,
    description: `Wirkungsökonomische Gesamtzusammenfassung, Key Findings, Richtungs- und Evidenzbewertung sowie quellengebundene Einzelanalysen zum Wahlprogramm von ${programme.party}.`
  };
}

export default async function SaxonyAnhaltProgrammePage({ params }: { params: Promise<{ sourceKey: string }> }) {
  const sourceKey = (await params).sourceKey;
  const programme = programmeFor(sourceKey);
  if (!programme) notFound();

  const [review, commitments] = await getSaxonyAnhaltPublicationSources(sourceKey);
  if (!review || !commitments) notFound();

  return <main className="section shell">
    <nav className="breadcrumb" aria-label="Pfad">
      <Link href="/laender">Bundesländer</Link><span aria-hidden="true">/</span>
      <Link href="/laender/sachsen-anhalt">Sachsen-Anhalt</Link><span aria-hidden="true">/</span>
      <span>Wahlprogrammanalyse</span>
    </nav>
    <SaxonyAnhaltProgrammeAnalysisV3 programme={programme} review={review} commitments={commitments} />
  </main>;
}
