import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompletePublicationSource } from "@/app/components/CompletePublicationSource";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { getSaxonyAnhaltPublicationSources } from "@/lib/publication/fachakten";

export const dynamic = "force-dynamic";

function programmeFor(sourceKey: string) {
  return saxonyAnhaltElectionProgrammes.find((programme) => programme.sourceKey === sourceKey) ?? null;
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(date);
}

export async function generateMetadata({ params }: { params: Promise<{ sourceKey: string }> }): Promise<Metadata> {
  const sourceKey = (await params).sourceKey;
  const programme = programmeFor(sourceKey);
  if (!programme) return { title: "Wahlprogramm nicht gefunden" };
  return {
    title: `${programme.party} · Landtagswahl Sachsen-Anhalt 2026`,
    description: `Vollständige freigegebene WÖk-Wirkungsakte und Zusageregister zum Wahlprogramm von ${programme.party} für die Landtagswahl Sachsen-Anhalt 2026.`
  };
}

export default async function SaxonyAnhaltProgrammePage({ params }: { params: Promise<{ sourceKey: string }> }) {
  const sourceKey = (await params).sourceKey;
  const programme = programmeFor(sourceKey);
  if (!programme) notFound();

  const [review, commitments] = await getSaxonyAnhaltPublicationSources(sourceKey);
  if (!review || !commitments) notFound();

  const decisionDate = formatDate(programme.decisionDate);

  return <div className="shell content-page">
    <nav className="breadcrumb" aria-label="Pfad">
      <Link href="/laender">Bundesländer</Link><span aria-hidden="true">/</span>
      <Link href="/laender/sachsen-anhalt">Sachsen-Anhalt</Link><span aria-hidden="true">/</span>
      <span>Wahlprogramm</span>
    </nav>

    <header className="page-intro">
      <p className="eyebrow">Landtagswahl Sachsen-Anhalt 2026 · Wahlprogramm</p>
      <h1>{programme.party}</h1>
      <p className="lead">{programme.title}</p>
      <p>Diese Seite veröffentlicht die vollständige freigegebene WÖk-Wirkungsakte und das vollständige Zusageregister aus dem kanonischen Release-1-Fachbestand. Die Originalquelle, ihre Fundstellen, Wirkungspfade, Referenzbezüge, Datenlücken und fachlichen Einschränkungen bleiben vollständig nachvollziehbar.</p>
      <div className="hero-actions">
        <a className="button button-primary" href="#vollstaendige-wirkungsakte">WÖk-Wirkungsakte</a>
        <a className="button button-secondary" href="#vollstaendiges-zusageregister">Zusageregister</a>
      </div>
    </header>

    <section className="notice notice-neutral" aria-label="Quellen- und Einordnungsstatus">
      <strong>Programm, Wirkungsanalyse und spätere reale Wirkung bleiben getrennte Ebenen.</strong>
      <p>Ein Wahlprogramm beschreibt politische Vorschläge. Die Fachakte prüft deren dokumentierte Wirkungspfade und offenen Evidenzfragen. Ob und welche Wirkung später tatsächlich eintritt, ist davon getrennt zu beobachten und zuzurechnen.</p>
      <dl>
        <div><dt>Dokumentstatus</dt><dd>{programme.documentStatus === "BESCHLOSSEN" ? "Beschlossenes Wahlprogramm" : "Veröffentlichte Webfassung"}</dd></div>
        <div><dt>Quellenformat</dt><dd>{programme.sourceFormat}</dd></div>
        {decisionDate && <div><dt>Beschlussdatum</dt><dd>{decisionDate}</dd></div>}
      </dl>
      <p><Link className="text-link" href="/laender/sachsen-anhalt/quellen">Quellen und Programme öffnen <span aria-hidden="true">→</span></Link></p>
    </section>

    <CompletePublicationSource source={review} idPrefix="vollstaendige-wirkungsakte" />
    <CompletePublicationSource source={commitments} idPrefix="vollstaendiges-zusageregister" />

    <p className="page-return"><Link href="/laender/sachsen-anhalt">← Zurück zu Sachsen-Anhalt</Link></p>
  </div>;
}
