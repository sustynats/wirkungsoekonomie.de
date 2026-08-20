import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteSourceRecord } from "@/app/components/CompleteSourceRecord";
import { CompletePublicationSource } from "@/app/components/CompletePublicationSource";
import { getPublicCommitmentRegister } from "@/lib/commitments/public-register";
import { getFederalPublicationSource } from "@/lib/publication/fachakten";

export const dynamic = "force-dynamic";

type Overview = { summary?: unknown; review_status?: unknown; commitment_count?: unknown };

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function generateMetadata({ params }: { params: Promise<{ sourceKey: string }> }): Promise<Metadata> {
  const register = await getPublicCommitmentRegister((await params).sourceKey);
  return register ? {
    title: `${register.source.actor} · Wahlprogramm-/Mandatsakte`,
    description: `Quellengebundene Fachakte mit ${register.commitments.length} strukturierten Zusagen aus ${register.source.actor}.`
  } : { title: "Dokumentakte nicht gefunden" };
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
  const overview = (completePublication?.overview ?? {}) as Overview;
  const overviewSummary = text(overview.summary);

  return <div className="shell content-page commitment-register-page">
    <nav className="breadcrumb" aria-label="Pfad"><Link href="/mandat-und-praxis">Wahlprogramme &amp; Koalition</Link><span aria-hidden="true">/</span><span>{sourceKind}</span></nav>
    <header className="page-intro">
      <p className="eyebrow">{sourceKind} · Quellen- und Fachakte</p>
      <h1>{register.source.actor}</h1>
      <p className="lead">{register.source.title}</p>
      <p>{overviewSummary ?? `Dieses Register erschließt ${register.commitments.length.toLocaleString("de-DE")} konkrete Zusagen mit Fundstelle aus der Originalquelle.`}</p>
      <div className="hero-actions"><a className="button button-primary" href="#themen">Zu den Zusagen</a>{completePublication && <a className="button button-secondary" href="#vollstaendige-fachakte">Vollständige Fachakte</a>}<Link className="button button-secondary" href={`/quellen/${register.source.sourceKey}`}>Quellensteckbrief</Link></div>
    </header>

    <section className="notice notice-neutral" id="fachstatus" aria-label="Fachstatus der Dokumentanalyse">
      <strong>{completePublication ? "Vollständige Ex-ante-Fachakte vorhanden" : "Quellenregister vorhanden"}</strong>
      <p>{completePublication
        ? "Der autorisierte Fachbestand bleibt vollständig abrufbar. Die neue redaktionelle Kurzschicht wird separat nach dem verschärften Editorial-Gate aufgebaut: Richtung und Evidenz werden erst dann als fertige Kurzbewertung angezeigt, wenn sie objektspezifisch begründet sind."
        : "Eine fertige WÖk-Wirkungsanalyse wird aus dem Quellenregister allein nicht abgeleitet."}</p>
    </section>

    <section className="commitment-register-overview" aria-labelledby="commitment-overview-title">
      <div><p className="eyebrow">Im Überblick</p><h2 id="commitment-overview-title">{register.commitments.length.toLocaleString("de-DE")} Zusagen in {Object.keys(grouped).length} Themenfeldern</h2><p>Die Themenübersicht dient der Navigation. Bei Layout- oder Extraktionskollisionen hat die Originalfundstelle Vorrang; unklare Fragmente werden nicht zu einer Wirkungsaussage gezwungen.</p></div>
      <ul>{Object.entries(grouped).map(([domain, commitments]) => <li key={domain}><a href={`#${encodeURIComponent(domain)}`}>{domain} <span>{commitments.length}</span></a></li>)}</ul>
    </section>

    <section id="themen" aria-labelledby="themen-title">
      <div className="section-heading"><div><p className="eyebrow">Quellengebundene Einzelzusagen</p><h2 id="themen-title">Erst Überblick, dann Details.</h2><p>Die einzelnen Zusagen sind standardmäßig eingeklappt. So bleibt die Seite auch bei großen Programmen lesbar.</p></div></div>
      {Object.entries(grouped).map(([domain, commitments]) => <details className="commitment-domain" id={encodeURIComponent(domain)} key={domain}>
        <summary><strong>{domain}</strong> · {commitments.length.toLocaleString("de-DE")} Zusagen</summary>
        <div className="commitment-list">{commitments.map((commitment, index) => <details id={commitment.key} key={commitment.key} className="commitment-complete-record">
          <summary><strong>{commitment.title}</strong><span className="source-register-label">Zusage {index + 1}{commitment.location ? ` · ${commitment.location}` : ""}</span></summary>
          <div>
            <blockquote className="quote"><strong>Originalaussage:</strong> {commitment.text}</blockquote>
            <dl data-woek-process-metadata><div><dt>Themenfeld</dt><dd>{commitment.policyDomain}</dd></div>{commitment.location && <div><dt>Fundstelle</dt><dd>{commitment.location}</dd></div>}{commitment.temporalScope && <div><dt>Zeitraum</dt><dd>{commitment.temporalScope}</dd></div>}</dl>
            {commitment.relationships.length > 0 && <section className="commitment-relationships" aria-label={`Dokumentierte Verbindungen für Zusage ${index + 1}`}><h4>{sourceKind === "Koalitionsvertrag" ? "Von der Vereinbarung zur parlamentarischen Praxis" : "Vom Wahlprogramm zur Vereinbarung"}</h4>{commitment.relationships.map((relationship, relationshipIndex) => <article key={`${relationship.stage}-${relationshipIndex}`}><dl>
              <div><dt>Status des Quellenabgleichs</dt><dd>{relationship.status}</dd></div>
              {relationship.rationale && <div><dt>Begründung des Abgleichs</dt><dd>{relationship.rationale}</dd></div>}
              {relationship.linkedCommitmentKeys.length > 0 && <div><dt>Verknüpfte Zusagen</dt><dd>{relationship.linkedCommitmentKeys.join(" · ")}</dd></div>}
              {relationship.caseIds.length > 0 && <div><dt>Parlamentarische Fälle</dt><dd>{relationship.caseIds.join(" · ")}</dd></div>}
              {relationship.evidenceStatus && <div><dt>Evidenzstatus</dt><dd>{relationship.evidenceStatus}</dd></div>}
              {relationship.effectAssessment && <div><dt>Wirkungsbezug</dt><dd>{relationship.effectAssessment}</dd></div>}
            </dl></article>)}</section>}
            <details data-woek-technical-proof="federal-commitment-record"><summary>Vollständigen technischen Fachdatensatz anzeigen</summary><div><CompleteSourceRecord record={commitment.exactRecord} /></div></details>
          </div>
        </details>)}</div>
      </details>)}
    </section>

    <section className="full-source-record" aria-labelledby="source-record-title"><p className="eyebrow">Quellenprovenienz</p><h2 id="source-record-title">Vollständiger Datensatz der Originalquelle</h2><p>Dokumentbezogene Angaben bleiben vollständig einsehbar und ersetzen nicht die Originalquelle.</p><details><summary>Dokumentdatensatz anzeigen</summary><div><CompleteSourceRecord record={register.sourceRecord} /></div></details></section>

    {completePublication ? <section id="vollstaendige-fachakte" aria-labelledby="fachakte-title"><div className="section-heading"><div><p className="eyebrow">Autorisierter Release-1-Fachbestand</p><h2 id="fachakte-title">Vollständige Ex-ante-Fachakte</h2><p>Dieser Vollnachweis bleibt aus Gründen der Reproduzierbarkeit vollständig erhalten. Generische oder nicht materiell beurteilbare Fragmente werden im neuen Editorial-Re-Audit nicht als aktuelle Kurzbewertung übernommen.</p></div></div><CompletePublicationSource source={completePublication} idPrefix="vollstaendige-fachakte" /></section> : null}
    <p className="page-return"><Link href="/mandat-und-praxis">← Zu Wahlprogramme &amp; Koalition</Link></p>
  </div>;
}
