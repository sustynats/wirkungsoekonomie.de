import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteSourceRecord } from "@/app/components/CompleteSourceRecord";
import { CompletePublicationSource } from "@/app/components/CompletePublicationSource";
import { EditorialReviewAssessment } from "@/app/components/OverviewAssessment";
import { getPublicCommitmentRegister } from "@/lib/commitments/public-register";
import { getFederalPublicationSource } from "@/lib/publication/fachakten";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ sourceKey: string }> }): Promise<Metadata> {
  const register = await getPublicCommitmentRegister((await params).sourceKey);
  return register ? {
    title: register.source.title,
    description: `Quellenregister mit ${register.commitments.length} konkreten Zusagen aus ${register.source.actor}.`
  } : { title: "Quellenregister nicht gefunden" };
}

export default async function CommitmentRegisterPage({ params }: { params: Promise<{ sourceKey: string }> }) {
  const sourceKey = (await params).sourceKey;
  const register = await getPublicCommitmentRegister(sourceKey);
  if (!register) notFound();
  const completePublication = await getFederalPublicationSource(sourceKey);
  const grouped = register.commitments.reduce<Record<string, typeof register.commitments>>((groups, commitment) => {
    (groups[commitment.policyDomain] ??= []).push(commitment);
    return groups;
  }, {});
  const sourceKind = register.source.sourceType === "COALITION_AGREEMENT" ? "Koalitionsvertrag" : "Wahlprogramm";
  return <div className="shell content-page commitment-register-page">
    <nav className="breadcrumb" aria-label="Pfad"><Link href="/mandat-und-praxis">Mandat &amp; Praxis</Link><span aria-hidden="true">/</span><span>{sourceKind}</span></nav>
    <header className="page-intro">
      <p className="eyebrow">{sourceKind} · Originalquelle</p>
      <h1>{register.source.actor}</h1>
      <p className="lead">{register.source.title}</p>
      <p>Dieses Register erschließt {register.commitments.length.toLocaleString("de-DE")} konkrete Zusagen mit ihrer Fundstelle aus der Originalquelle. Es veröffentlicht den vollständigen vorliegenden Fachbestand pro Zusage – einschließlich Wirkpfaden, Referenzbezügen, Datenlücken und dokumentierten Verbindungen. Eine Zusage ist dennoch keine bereits eingetretene Wirkung.</p>
      <p><Link className="text-link" href={`/quellen/${register.source.sourceKey}`}>Quellensteckbrief ansehen <span aria-hidden="true">→</span></Link></p>
    </header>

    <section className="notice notice-neutral" aria-label="Einordnung des Quellenregisters">
      <strong>Von der Zusage zum Folgencheck.</strong>
      <p>Eine politische Zusage beschreibt zunächst einen vorgeschlagenen Weg. Das Portal trennt deshalb: Was steht im Originaldokument? Was wurde in einer Vereinbarung aufgegriffen? Was wurde parlamentarisch entschieden? Was wurde umgesetzt? Und was lässt sich später tatsächlich beobachten und zurechnen? Verbindungen zwischen diesen Stufen sind hier als Quellenbefund sichtbar – keine Partei- oder Personenwertung.</p>
    </section>

    <section className="commitment-register-overview" aria-labelledby="commitment-overview-title">
      <div><p className="eyebrow">Im Überblick</p><h2 id="commitment-overview-title">{register.commitments.length.toLocaleString("de-DE")} Zusagen in {Object.keys(grouped).length} Themenfeldern</h2><p>Alle Zusagen bleiben mit ihrem vollständigen Fachdatensatz im Dokument. Die Kurzzeile dient nur der Orientierung.</p></div>
      <ul>{Object.entries(grouped).map(([domain, commitments]) => <li key={domain}><a href={`#${encodeURIComponent(domain)}`}>{domain} <span>{commitments.length}</span></a></li>)}</ul>
    </section>

    {Object.entries(grouped).map(([domain, commitments]) => <section className="commitment-domain" id={encodeURIComponent(domain)} key={domain} aria-labelledby={`domain-${encodeURIComponent(domain)}`}>
      <header><p className="eyebrow">Themenfeld</p><h2 id={`domain-${encodeURIComponent(domain)}`}>{domain}</h2><p>{commitments.length.toLocaleString("de-DE")} dokumentierte Zusagen</p></header>
      <div className="commitment-list">{commitments.map((commitment, index) => <article id={commitment.key} key={commitment.key} data-woek-preview-card="review-required">
        <h3>{commitment.title}</h3>
        <EditorialReviewAssessment subject={commitment.title} />
        <p className="source-register-label" data-woek-process-metadata>Zusage {index + 1} · {commitment.policyDomain}</p>
        <p className="commitment-full-text">{commitment.text}</p>
        <dl data-woek-process-metadata><div><dt>Fundstelle</dt><dd>{commitment.location ?? "Im gelieferten Fachbestand nicht genauer ausgewiesen"}</dd></div>{commitment.temporalScope && <div><dt>Zeitraum</dt><dd>{commitment.temporalScope}</dd></div>}</dl>
        {commitment.relationships.length > 0 && <section className="commitment-relationships" aria-label={`Dokumentierte Verbindungen für Zusage ${index + 1}`}><h4>{sourceKind === "Koalitionsvertrag" ? "Von der Vereinbarung zur parlamentarischen Praxis" : "Vom Wahlprogramm zur Vereinbarung"}</h4>{commitment.relationships.map((relationship, relationshipIndex) => <article key={`${relationship.stage}-${relationshipIndex}`}><dl>
          <div><dt>Status des Quellenabgleichs</dt><dd>{relationship.status}</dd></div>
          {relationship.rationale && <div><dt>Begründung des Abgleichs</dt><dd>{relationship.rationale}</dd></div>}
          {relationship.linkedCommitmentKeys.length > 0 && <div><dt>Verknüpfte Zusagen</dt><dd>{relationship.linkedCommitmentKeys.join(" · ")}</dd></div>}
          {relationship.caseIds.length > 0 && <div><dt>Parlamentarische Fälle</dt><dd>{relationship.caseIds.join(" · ")}</dd></div>}
          {relationship.evidenceStatus && <div><dt>Evidenzstatus</dt><dd>{relationship.evidenceStatus}</dd></div>}
          {relationship.effectAssessment && <div><dt>Wirkungsbezug</dt><dd>{relationship.effectAssessment}</dd></div>}
        </dl></article>)}</section>}
        <details className="commitment-complete-record"><summary>Vollständigen Fachdatensatz dieser Zusage anzeigen</summary><div><CompleteSourceRecord record={commitment.exactRecord} /></div></details>
      </article>)}</div>
    </section>)}
    <section className="full-source-record" aria-labelledby="source-record-title"><p className="eyebrow">Quellenprovenienz</p><h2 id="source-record-title">Vollständiger Datensatz der Originalquelle</h2><p>Auch die dokumentbezogenen Angaben bleiben vollständig einsehbar. Sie ergänzen die einzelnen Zusagen und ersetzen nicht die Originalquelle.</p><details><summary>Dokumentdatensatz anzeigen</summary><div><CompleteSourceRecord record={register.sourceRecord} /></div></details></section>
    {completePublication ? <CompletePublicationSource source={completePublication} idPrefix="vollstaendige-fachakte" /> : null}
    <p className="page-return"><Link href="/mandat-und-praxis">← Zu Mandat &amp; Praxis</Link></p>
  </div>;
}
