import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompletePublicationSource } from "@/app/components/CompletePublicationSource";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { getSaxonyAnhaltPublicationSources } from "@/lib/publication/fachakten";
import {
  presentSaxonyAnhaltSource,
  saxonyAnhaltProgrammeOverview
} from "@/lib/presentation/sachsen-anhalt-programmes";

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
    title: `${programme.party} · Wirkungsanalyse Landtagswahl Sachsen-Anhalt 2026`,
    description: `Verständlich aufbereitete, vollständige WÖk-Wirkungsanalyse und Zusageregister zum Wahlprogramm von ${programme.party} für die Landtagswahl Sachsen-Anhalt 2026.`
  };
}

export default async function SaxonyAnhaltProgrammePage({ params }: { params: Promise<{ sourceKey: string }> }) {
  const sourceKey = (await params).sourceKey;
  const programme = programmeFor(sourceKey);
  if (!programme) notFound();

  const [review, commitments] = await getSaxonyAnhaltPublicationSources(sourceKey);
  if (!review || !commitments) notFound();

  const decisionDate = formatDate(programme.decisionDate);
  const overview = saxonyAnhaltProgrammeOverview(review.markdown);
  const publicReview = presentSaxonyAnhaltSource(review);
  const publicCommitments = presentSaxonyAnhaltSource(commitments);

  return <main>
    <section className="shell section">
      <nav className="breadcrumb" aria-label="Pfad">
        <Link href="/laender">Bundesländer</Link><span aria-hidden="true">/</span>
        <Link href="/laender/sachsen-anhalt">Sachsen-Anhalt</Link><span aria-hidden="true">/</span>
        <span>Wahlprogramm</span>
      </nav>

      <div className="state-hero">
        <div>
          <p className="eyebrow">Landtagswahl Sachsen-Anhalt 2026 · WÖk-Wirkungsanalyse</p>
          <h1>{programme.party}</h1>
          <p className="lead">{programme.title}</p>
          <p>{overview.summary}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#kurzueberblick">Kurzüberblick</a>
            <a className="button button-secondary" href="#vollstaendige-wirkungsakte">Vollständige Wirkungsakte</a>
          </div>
        </div>
        <aside className="state-hero-fact" aria-label="WÖk-Kurzüberblick">
          <p className="eyebrow">Auf einen Blick</p>
          <h2>Was wird hier bewertet?</h2>
          <p>Nicht die Partei und nicht Personen. Geprüft werden die im Programm dokumentierten Vorschläge und ihre möglichen Wirkpfade - einschließlich Risiken, Bedingungen, Schutzgrenzen und offener Evidenz.</p>
          <dl>
            {overview.commitmentCount && <div><dt>Zusageeinheiten</dt><dd>{overview.commitmentCount.toLocaleString("de-DE")}</dd></div>}
            <div><dt>Perspektive</dt><dd>Ex ante - vor einer möglichen Umsetzung</dd></div>
            <div><dt>Ergebnis</dt><dd>Wirkungspotenziale und Risiken, keine Wahlempfehlung</dd></div>
          </dl>
        </aside>
      </div>
    </section>

    <section className="shell section state-purpose" id="kurzueberblick" aria-labelledby="programme-overview-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">WÖk-Kurzüberblick</p>
          <h2 id="programme-overview-title">Vom Wahlversprechen zum überprüfbaren Wirkpfad.</h2>
          <p className="lead">Die Analyse zerlegt die Programmaussagen so, dass später nachvollziehbar bleibt, was tatsächlich beschlossen, umgesetzt und beobachtet wurde.</p>
        </div>
      </div>
      <div className="state-purpose-grid">
        <article><span aria-hidden="true">1</span><h3>Was wird vorgeschlagen?</h3><p>{overview.objective ?? "Die quellengebundenen Programmzusagen werden einzeln mit Originalfundstelle dokumentiert."}</p></article>
        <article><span aria-hidden="true">2</span><h3>Was könnte sich verändern?</h3><p>Für jede materielle Zusage werden mögliche Zustandsveränderungen, Wirkmechanismen sowie Wirkungen erster, zweiter und dritter Ordnung sichtbar gemacht.</p></article>
        <article><span aria-hidden="true">3</span><h3>Wo liegen Risiken und Grenzen?</h3><p>Die Akte weist Wirkungsrisiken, Verteilungsfragen, Schutzgrenzen, Lock-ins, Umsetzungsbedingungen und offene Daten ausdrücklich aus.</p></article>
        <article><span aria-hidden="true">4</span><h3>Wie wird später geprüft?</h3><p>Baseline, Gegenfaktum, Beobachtungsindikatoren und Korrekturtrigger zeigen, was nach einer realen Umsetzung für einen Reality Check gebraucht wird.</p></article>
      </div>
    </section>

    <section className="shell section state-reference-framework" aria-labelledby="programme-scope-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Prüfumfang</p>
          <h2 id="programme-scope-title">Wirkung endet nicht an Ressort- oder Landesgrenzen.</h2>
        </div>
      </div>
      {overview.implementationBoundary && <aside className="state-cross-border-note"><strong>Zuständigkeit und Umsetzung:</strong> {overview.implementationBoundary}</aside>}
      {overview.policyDomains.length > 0 && <div className="state-reference-grid">
        {overview.policyDomains.map((domain) => <article key={domain}><p className="reference-kind">materielles Politikfeld</p><h3>{domain}</h3><p>Für dieses Feld enthält die Fachakte mindestens einen quellengebundenen Prüfpfad. Die konkrete Wirkungsrichtung wird auf Ebene der jeweiligen Zusage geprüft.</p></article>)}
      </div>}
    </section>

    <section className="shell section section-surface state-publication-status" aria-labelledby="programme-method-title">
      <div>
        <p className="eyebrow">So ist die Bewertung aufgebaut</p>
        <h2 id="programme-method-title">Keine Gesamtnote - sondern nachvollziehbare Wirkungspfade.</h2>
        <p className="lead">Eine offene Evidenzlage ist weder neutral noch null. Programmabsicht, mögliche Wirkung, spätere Beobachtung und Zurechnung bleiben getrennt.</p>
      </div>
      <ul>
        <li><strong>1. Quelle und Zusage</strong><span>Originalfundstelle, konkrete Aussage, Zuständigkeit und noch offene Ausgestaltung.</span></li>
        <li><strong>2. Wirkungspotenzial und Risiko</strong><span>Mögliche Zustandsveränderung, Wirkmechanismus, Folgewirkungen, Betroffene und Verteilung.</span></li>
        <li><strong>3. Schutz- und Referenzrahmen</strong><span>Mensch, Planet, Demokratie, SDGs, WÖk-SDG+, Recht und nicht kompensierbare Grenzen.</span></li>
        <li><strong>4. Evidenz und Reality Check</strong><span>Datenlücken, Baseline, Gegenfaktum, Indikatoren und Bedingungen für spätere Korrektur.</span></li>
      </ul>
    </section>

    <section className="shell section">
      <div className="notice notice-neutral" aria-label="Quellen- und Einordnungsstatus">
        <strong>Programm, Wirkungsanalyse und spätere reale Wirkung bleiben getrennte Ebenen.</strong>
        <p>Ein Wahlprogramm dokumentiert politische Vorschläge. Die Fachakte prüft deren mögliche Wirkpfade. Ob eine Maßnahme später beschlossen und umgesetzt wird und welche Zustandsveränderung ihr zurechenbar ist, muss danach separat beobachtet werden.</p>
        <dl>
          <div><dt>Dokumentstatus</dt><dd>{programme.documentStatus === "BESCHLOSSEN" ? "Beschlossenes Wahlprogramm" : "Veröffentlichte Webfassung"}</dd></div>
          <div><dt>Quellenformat</dt><dd>{programme.sourceFormat}</dd></div>
          {decisionDate && <div><dt>Beschlussdatum</dt><dd>{decisionDate}</dd></div>}
          <div><dt>Fachstand</dt><dd>vollständige freigegebene Wirkungsakte mit Zusageregister</dd></div>
        </dl>
        <p><Link className="text-link" href="/laender/sachsen-anhalt/quellen">Originalquellen und Programmnachweise öffnen <span aria-hidden="true">→</span></Link></p>
      </div>
    </section>

    <div className="shell content-page">
      <CompletePublicationSource source={publicReview} idPrefix="vollstaendige-wirkungsakte" />
      <CompletePublicationSource source={publicCommitments} idPrefix="vollstaendiges-zusageregister" />
      <p className="page-return"><Link href="/laender/sachsen-anhalt">← Zurück zu Sachsen-Anhalt</Link></p>
    </div>
  </main>;
}
