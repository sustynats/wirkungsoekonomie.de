import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCommitmentRegister } from "@/lib/commitments/public-register";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ sourceKey: string }> }): Promise<Metadata> {
  const register = await getPublicCommitmentRegister((await params).sourceKey);
  return register ? {
    title: register.source.title,
    description: `Quellenregister mit ${register.commitments.length} konkreten Zusagen aus ${register.source.actor}.`
  } : { title: "Quellenregister nicht gefunden" };
}

export default async function CommitmentRegisterPage({ params }: { params: Promise<{ sourceKey: string }> }) {
  const register = await getPublicCommitmentRegister((await params).sourceKey);
  if (!register) notFound();
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
      <p>Dieses Register erschließt {register.commitments.length.toLocaleString("de-DE")} konkrete Zusagen mit ihrer Fundstelle aus der Originalquelle. Es ist eine quellengebundene Arbeitsgrundlage – noch kein Wirkungsurteil.</p>
      <p><Link className="text-link" href={`/quellen/${register.source.sourceKey}`}>Quellensteckbrief ansehen <span aria-hidden="true">→</span></Link></p>
    </header>

    <section className="notice notice-neutral" aria-label="Einordnung des Quellenregisters">
      <strong>Von der Zusage zur Wirkung ist es ein weiterer Weg.</strong>
      <p>Eine Zusage kann später parlamentarisch aufgegriffen, verändert, beschlossen oder nicht umgesetzt werden. Ihre Wirkung wird erst für eine konkrete Entscheidung mit Wirkpfaden, Daten, Gegenfaktum, Risiken und dem Referenzrahmen geprüft. Das Register trennt diese Schritte sichtbar.</p>
    </section>

    <section className="commitment-register-overview" aria-labelledby="commitment-overview-title">
      <div><p className="eyebrow">Im Überblick</p><h2 id="commitment-overview-title">{register.commitments.length.toLocaleString("de-DE")} Zusagen in {Object.keys(grouped).length} Themenfeldern</h2></div>
      <ul>{Object.entries(grouped).map(([domain, commitments]) => <li key={domain}><a href={`#${encodeURIComponent(domain)}`}>{domain} <span>{commitments.length}</span></a></li>)}</ul>
    </section>

    {Object.entries(grouped).map(([domain, commitments]) => <section className="commitment-domain" id={encodeURIComponent(domain)} key={domain} aria-labelledby={`domain-${encodeURIComponent(domain)}`}>
      <header><p className="eyebrow">Themenfeld</p><h2 id={`domain-${encodeURIComponent(domain)}`}>{domain}</h2><p>{commitments.length.toLocaleString("de-DE")} dokumentierte Zusagen</p></header>
      <div className="commitment-list">{commitments.map((commitment) => <article key={commitment.key}>
        <h3>{commitment.title}</h3>
        <p>{commitment.text}</p>
        <dl><div><dt>Fundstelle</dt><dd>{commitment.location ?? "Im Originaldokument noch genauer zu verorten"}</dd></div>{commitment.temporalScope && <div><dt>Zeitraum</dt><dd>{commitment.temporalScope}</dd></div>}</dl>
      </article>)}</div>
    </section>)}
    <p className="page-return"><Link href="/mandat-und-praxis">← Zu Mandat &amp; Praxis</Link></p>
  </div>;
}
