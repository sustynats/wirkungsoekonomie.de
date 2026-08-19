import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GovernmentImpactCase } from "@/app/components/government/GovernmentImpactCase";
import { EditorialReviewAssessment } from "@/app/components/OverviewAssessment";
import { PublicMaturity } from "@/app/components/PublicMaturity";
import {
  actionById,
  actionTypeLabels,
  coverageLabels,
  formatDate,
  lifecycleLabels,
  readableInstitution,
  sourceFunctionLabels,
} from "@/lib/government/public-data";
import { impactCasesForGovernmentAction } from "@/lib/government/impact-cases";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { factOnlyPublicMaturity } from "@/lib/presentation/public-maturity";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const action = actionById(decodeURIComponent(id));
  return { title: action?.title ?? "Regierungsakte", robots: { index: false, follow: false } };
}

function identifierRows(identifiers: Record<string, string[]>) {
  return Object.entries(identifiers).flatMap(([kind, values]) => values.map((value) => ({ kind, value })));
}

export default async function GovernmentActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const action = actionById(decodeURIComponent(id));
  if (!action) notFound();
  const identifiers = identifierRows(action.official_identifiers);
  const impactCases = impactCasesForGovernmentAction(action.government_action_id);

  return (
    <article className="government-detail">
      <header className="shell government-detail-hero">
        <h1>{action.title}</h1>
        {impactCases.length ? <div className="government-linked-impact-cases">{impactCases.map((record) => <GovernmentImpactCase key={record.impact_case_id} record={record} compact />)}</div> : <><EditorialReviewAssessment subject={action.title} compact={false} /><PublicMaturity maturity={factOnlyPublicMaturity(action.title, `Die amtlich belegte Regierungsakte „${action.title}“ ist als Sachverhalt veröffentlicht.`)} /></>}
        <p className="eyebrow" data-woek-process-metadata>Regierungsakte · Faktenschicht</p>
        <div className="government-detail-badges" data-woek-process-metadata>
          <span className="chip chip--depth">{actionTypeLabels[action.action_type] ?? action.action_type}</span>
          <span className="chip chip--phase">{lifecycleLabels[action.lifecycle_status] ?? action.lifecycle_status}</span>
          <span className="chip chip--phase">Fakten geprüft</span>
        </div>
        <dl className="government-key-facts" data-woek-process-metadata>
          <div><dt>Entscheidungs-/Veröffentlichungsdatum</dt><dd>{formatDate(action.decision_date)}</dd></div>
          <div><dt>Institutionell zuständig</dt><dd>{action.responsible_institutions.map(readableInstitution).join(", ") || "Öffentliche Zuordnung offen"}</dd></div>
          <div><dt>Datenabdeckung</dt><dd>{coverageLabels[action.coverage_scope_status] ?? action.coverage_scope_status}</dd></div>
          <div><dt>WÖk-Analyse</dt><dd>Noch nicht fachlich freigegeben</dd></div>
        </dl>
        <div className="notice notice-neutral"><strong>Wissensstand</strong><p>Diese Seite trennt amtlichen Sachverhalt, WÖk-Analyse und Evidenz. Der Faktenstatus belegt keine positive oder negative Wirkung. Quellen, Datenstand und offene Punkte bleiben sichtbar.</p></div>
      </header>

      <nav className="shell government-tab-nav" aria-label="Abschnitte dieser Regierungsakte">
        <a href="#sachverhalt">Amtlicher Sachverhalt</a><a href="#lebenslauf">Politischer Lebenslauf</a><a href="#voranalyse">WÖk-Voranalyse</a><a href="#umsetzung">Umsetzung</a><a href="#wirkung">Beobachtete Wirkung</a><a href="#schutz">Schutz &amp; System</a><a href="#quellen">Quellen &amp; Changelog</a>
      </nav>

      <div className="shell government-detail-sections">
        <section id="sachverhalt">
          <p className="eyebrow">1 · Amtlicher Sachverhalt</p><h2>Was ist belegt?</h2>
          <p>Die amtliche Quelle dokumentiert einen Regierungsakt vom Typ <strong>{actionTypeLabels[action.action_type] ?? action.action_type}</strong>. Sein belegter Verfahrensstand lautet <strong>{lifecycleLabels[action.lifecycle_status] ?? action.lifecycle_status}</strong>. Eine darüber hinausgehende Ziel-, Umsetzungs- oder Wirkungsaussage wird hier nicht aus dem Titel abgeleitet.</p>
          {identifiers.length > 0 && <dl className="government-identifier-list">{identifiers.map(({ kind, value }) => <div key={`${kind}-${value}`}><dt>{kind.toUpperCase()}</dt><dd>{value}</dd></div>)}</dl>}
          {action.parliamentary_case_refs.length > 0 && <p><strong>Parlamentarische Verknüpfung:</strong> {action.parliamentary_case_refs.join(", ")}. Die Regierungshandlung und der parlamentarische Fall bleiben getrennte Objekte.</p>}
        </section>

        <section id="lebenslauf">
          <p className="eyebrow">2 · Politischer Lebenslauf</p><h2>Belegte Stationen</h2>
          <ol className="government-timeline"><li><time>{formatDate(action.decision_date)}</time><div><strong>{lifecycleLabels[action.lifecycle_status] ?? action.lifecycle_status}</strong><p>Diese Station ist durch die unten aufgeführten amtlichen Quellen belegt.</p></div></li>{action.effective_date && <li><time>{formatDate(action.effective_date)}</time><div><strong>Wirksamkeitsdatum</strong><p>Das Datum wurde in der Faktenschicht dokumentiert.</p></div></li>}</ol>
          <p className="open-state">Weitere Lebenszyklusstationen werden erst ergänzt, wenn sie amtlich belegt und eindeutig diesem Regierungsakt zugeordnet sind.</p>
        </section>

        <section id="voranalyse">
          <p className="eyebrow">3 · WÖk-Voranalyse</p><h2>Was war vor dem Handeln über mögliche Wirkungen bekannt?</h2>
          <p>Die Ex-ante-Prüfung hält den damaligen Wissensstand fest: Welche positiven oder negativen Wirkungspotenziale und Risiken waren vor der Entscheidung aus amtlichen Angaben, Forschung, Evaluationen und anderen zeitlich verfügbaren Belegen erkennbar? Spätere Erkenntnisse dürfen nicht rückwirkend als damaliges Wissen erscheinen.</p>
          {impactCases.length ? <p>Die verknüpften, fachlich freigegebenen WÖk-Kurzbewertungen stehen am Anfang dieser Akte. Von dort führen die Links in die vollständigen Wirkungsanalysen.</p> : <div className="open-state"><span aria-hidden="true">?</span><div><strong>Noch keine fachliche Ex-ante-Einordnung freigegeben.</strong><p>Das bedeutet weder neutrale Wirkung noch fehlende Wirkung. Wirkungsempfänger, Mechanismen, Wirkungsrichtung, Evidenz, SDGs/SDG+, Mensch-Planet-Demokratie, Risiken und Schutzgrenzen werden erst nach dem Materialitäts-Gate in einer versionierten Fachakte ergänzt.</p></div></div>}
          <div className="notice notice-neutral"><strong>Rolle der Kommunikation</strong><p>Amtliche Kommunikation kann zeigen, welche Ziele, Annahmen oder erwarteten Wirkungen die Regierung vor der Entscheidung benannt hat. Sie ist eine zeitlich einzuordnende Quelle - aber noch kein Nachweis, dass die behauptete Wirkung tatsächlich eintritt.</p></div>
          <Link className="text-link" href="/regierung/methodik">So entsteht eine WÖk-Analyse</Link>
        </section>

        <section id="umsetzung">
          <p className="eyebrow">4 · Umsetzung</p><h2>Umsetzungsdaten noch nicht vollständig angebunden</h2>
          <p>Diese Regierungsakte ist amtlich dokumentiert. Für Haushaltsvollzug, Förderung, Beschaffung oder administrative Umsetzung liegen in diesem Staging derzeit noch keine vollständigen verknüpften Daten vor. Das ist eine Datenlücke - kein Hinweis auf fehlende Umsetzung.</p>
        </section>

        <section id="wirkung">
          <p className="eyebrow">5 · Beobachtete Wirkung</p><h2>Wirkung noch nicht belastbar beobachtbar</h2>
          <p>Für eine Ex-post-Einordnung fehlen derzeit ausreichende Beobachtungsdaten, ein geeigneter Zeitraum oder eine tragfähige Zurechnung. Es wird deshalb weder „0 Wirkung“ noch „neutral“ angezeigt.</p>
        </section>

        <section id="schutz">
          <p className="eyebrow">6 · Schutz &amp; System</p><h2>Schutzprüfung noch nicht freigegeben</h2>
          <p>Wirkungsgrenzen, Grundrechte, Nichtkompensation, Reverse Merit Order, Verteilung, Rebound, Pfadabhängigkeit und Resilienz gehören in die Fachanalyse. Aus der amtlichen Faktenschicht allein werden sie nicht behauptet.</p>
        </section>

        <section id="quellen">
          <p className="eyebrow">7 · Quellen &amp; Changelog</p><h2>Amtliche Belege</h2>
          <ul className="government-source-list">{action.source_refs.map((source) => <li key={source.source_event_id}><div><strong>{source.title}</strong><span>{sourceFunctionLabels[source.source_function] ?? source.source_function} · veröffentlicht {formatDate(source.published_at)} · geprüft {formatDate(source.retrieved_at)}</span></div><Link href={sourceDetailHrefForUrl(source.url)}>Quellenakte öffnen <span aria-hidden="true">→</span></Link></li>)}</ul>
          <dl className="government-changelog"><div><dt>Datenversion</dt><dd>{action.data_version}</dd></div><div><dt>Zuletzt geprüft</dt><dd>{formatDate(action.last_verified_at)}</dd></div><div><dt>Veröffentlichungsstufe</dt><dd>Faktenschicht</dd></div></dl>
        </section>
      </div>
    </article>
  );
}
