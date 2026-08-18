import Link from "next/link";
import { jurisdictionById } from "@/lib/parliament/jurisdictions";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { allPublicationSourceRecords } from "@/lib/publication/fachakten";

const saxonyAnhalt = jurisdictionById("sachsen-anhalt");

export const metadata = {
  title: "Landtagswahl Sachsen-Anhalt 2026 | Wirkungsportal Parlament",
  description: "Wahlprogramme vor der Landtagswahl Sachsen-Anhalt 2026: Wirkungspotenziale, Risiken, Quellen und offene Fragen verständlich und nachvollziehbar."
};

export default function SaxonyAnhaltPage() {
  if (!saxonyAnhalt?.election) return null;
  const electionDate = new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${saxonyAnhalt.election.date}T12:00:00`));
  const reviewBySource = new Map(allPublicationSourceRecords()
    .filter((record) => record.kind === "SAXONY_ANHALT_ELECTION_PROGRAMME_REVIEW" && record.sourceKey)
    .map((record) => [record.sourceKey as string, record]));

  return (
    <main>
      <section className="shell state-hero-shell">
        <div className="state-hero">
          <div>
            <p className="eyebrow">Wirkungsportal Länder · Sachsen-Anhalt</p>
            <h1>Was könnten die Programme für Sachsen-Anhalt bewirken?</h1>
            <p className="lead">Zur Landtagswahl am {electionDate} bereitet das Portal die Wahlprogramme verständlich auf: Welche Veränderung wird jeweils angestrebt? Für wen? Über welchen Wirkpfad? Wo liegen Risiken, Grenzen und offene Datenfragen?</p>
            <div className="hero-actions">
          <Link className="button button-primary" href="#wahlprogramme">6 Wahlprogramme im Wirkungscheck</Link>
              <Link className="button button-secondary" href="/laender/sachsen-anhalt/quellen">Quellen und Programme</Link>
            </div>
          </div>
          <aside className="state-hero-fact" aria-label="Einordnung des Wahlbereichs">
            <p className="eyebrow">Vor der Wahl</p>
            <h2>Programme sind Versprechen, noch keine Wirkung.</h2>
            <p>Deshalb zeigt der Vergleich Wirkungspotenzial und Wirkungsrisiken klar getrennt von tatsächlich beobachteter Wirkung. Eine Parteizugehörigkeit ist kein Bewertungskriterium.</p>
            <dl>
              <div><dt>Wahltag</dt><dd>{electionDate}</dd></div>
              <div><dt>28 Landesziele</dt><dd>mit Fundstelle und SDG-Bezug</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="shell section state-purpose" id="so-funktioniert-es" aria-labelledby="state-purpose-title">
        <div className="section-heading"><div><p className="eyebrow">Der Nutzen</p><h2 id="state-purpose-title">Nicht Wahlkampf bewerten. Entscheidungen verständlich machen.</h2></div></div>
        <div className="state-purpose-grid">
          <article><span aria-hidden="true">A</span><h3>Was wird vorgeschlagen?</h3><p>Konkrete Zusagen werden mit ihrer Originalfundstelle und ihren Bedingungen dokumentiert.</p></article>
          <article><span aria-hidden="true">B</span><h3>Was könnte sich verändern?</h3><p>Der Check erklärt mögliche Wirkpfade für Menschen, Umwelt und demokratisches Zusammenleben – einschließlich Risiken und Datenlücken.</p></article>
          <article><span aria-hidden="true">C</span><h3>Was wird festgestellt – was bewertet?</h3><p>Zuerst geht es um Zustände, Veränderungen und – soweit möglich – Zurechnung. Erst danach folgt die Einordnung an SDGs, SDG+, Mensch – Planet – Demokratie, Recht und Landeszielen.</p></article>
          <article><span aria-hidden="true">D</span><h3>Was passiert nach der Wahl?</h3><p>Programm, Koalitionsvereinbarung, konkrete Entscheidung, Umsetzung und spätere Beobachtung werden Schritt für Schritt verbunden.</p></article>
        </div>
      </section>

      <section className="shell section state-reference-framework" aria-labelledby="state-reference-title">
        <div className="section-heading"><div><p className="eyebrow">Woran wird eine Veränderung bewertet?</p><h2 id="state-reference-title">Ein gemeinsamer Maßstab – mit dem Blick auf Sachsen-Anhalt.</h2></div><Link className="text-link" href="/laender/sachsen-anhalt/quellen#referenzrahmen">Grundlagen und Quellen <span aria-hidden="true">→</span></Link></div>
        <p className="lead">Zuerst werden mögliche oder spätere beobachtete Zustandsveränderungen getrennt von ihrer Zurechnung dargestellt. Für die Bewertung kommen mehrere Ebenen zusammen: SDGs als internationaler Zielrahmen, SDG+ als WÖk-Erweiterung, Mensch – Planet – Demokratie als Wirkungsordnung, Recht als eigene Ebene sowie die Nachhaltigkeitsstrategie Sachsen-Anhalts mit ihren Landeszielen und Indikatoren. Diese Ebenen werden nicht zu einer verdeckten Gesamtpunktzahl verrechnet.</p>
        <div className="state-reference-grid">
          {saxonyAnhalt.referenceFramework?.map((reference) => (
            <article key={reference.id}>
              <p className="reference-kind">{reference.id.includes("sdg-plus") ? "WÖk-Erweiterung" : reference.id.endsWith("-mpd") ? "Systemische Wirkungsordnung" : reference.authority === "GLOBAL" ? "Gemeinsamer Referenzrahmen" : reference.authority === "CONSTITUTIONAL" ? "Landesrechtlicher Prüfanker" : reference.authority === "STATE_STRATEGY" ? "Landesspezifische Ziele" : "Wirkungsraum"}</p>
              <h3>{reference.label}</h3>
              <p>{reference.description}</p>
              <span className="reference-stability">{reference.stability === "ENDURING" ? "dauerhaft geltender Rahmen" : reference.stability === "VERSIONED_CURRENT" ? "aktuelle, versionierte Referenz" : "je Fall konkret prüfen"}</span>
            </article>
          ))}
        </div>
        <aside className="state-cross-border-note"><strong>Wirkung endet nicht an der Landesgrenze.</strong> Eine Maßnahme kann Zuständigkeiten, Haushalte, Infrastruktur, ökologische Belastungen oder soziale Folgen in anderen Ländern, beim Bund, in Europa oder darüber hinaus berühren. Diese Zusammenhänge werden als eigene Wirkungspfade sichtbar gemacht – nicht stillschweigend dem Land zugerechnet.</aside>
      </section>

      <section className="shell section section-surface state-publication-status" aria-labelledby="state-status-title">
        <div><p className="eyebrow">Referenzrahmen und Programme</p><h2 id="state-status-title">Landesziele und Programme bleiben getrennt nachvollziehbar.</h2><p className="lead">Die landeseigenen Nachhaltigkeitsziele sind mit ihren Fundstellen veröffentlicht. Jedes der sechs vorliegenden Wahlprogramme hat eine eigene, quellengestützte Wirkungsakte – nicht eine aus Wahlkampftexten abgeleitete Gesamtwertung.</p></div>
        <ul>
          <li><strong>1. Landesziele</strong><span>28 Zieltexte der Nachhaltigkeitsstrategie sind mit Fundstelle, Indikatorbezug, SDG-Bezug und Wirkungsräumen dokumentiert.</span></li>
          <li><strong>2. Programme</strong><span>Die sechs vorhandenen Programme liegen mit Fassung, Fundstelle, Wirkpfaden, Zuständigkeit, Bedingungen und Datenlücken vor – ohne Parteipunktzahl.</span></li>
          <li><strong>3. Entscheidungen</strong><span>Nach der Wahl werden Koalitionsvereinbarung, Landtagsentscheidungen, Umsetzung und spätere Beobachtung als getrennte Stationen verbunden.</span></li>
        </ul>
      </section>

      <section className="shell section" id="wahlprogramme" aria-labelledby="state-programmes-title">
        <div className="section-heading"><div><p className="eyebrow">Wahlprogramme im Wirkungscheck</p><h2 id="state-programmes-title">Sechs Programme. Sechs vollständige Wirkungsakten.</h2><p className="lead">Die Akten prüfen mögliche Zustandsveränderungen, Risiken, Umsetzungsbedingungen und offene Datenfragen. Sie bewerten keine Parteien oder Personen und geben keine Wahlempfehlung.</p></div></div>
        <div className="source-register state-programme-register">
          {saxonyAnhaltElectionProgrammes.map((programme) => {
            const review = reviewBySource.get(programme.sourceKey);
            const overview = review?.overview && typeof review.overview === "object" && !Array.isArray(review.overview) ? review.overview as Record<string, unknown> : {};
            const count = typeof overview.commitment_count === "number" ? overview.commitment_count : null;
            const summary = typeof overview.summary === "string" ? overview.summary : "Die vollständige Wirkungsakte weist Wirkungspotenziale, Risiken, Bedingungen, Schutzfragen und Datenlücken der dokumentierten Zusagen aus.";
            return <article key={programme.sourceKey}>
              <p className="source-register-label">{programme.party} · Originalprogramm</p>
              <h3>{programme.title}</h3>
              <p>{summary}</p>
              <p className="commitment-count"><strong>{count?.toLocaleString("de-DE") ?? "–"} Zusageeinheiten</strong> · vollständige Fachakte und Zusageregister</p>
              <Link className="text-link" href={`/laender/sachsen-anhalt/wahlprogramme/${programme.sourceKey}`}>Wirkungsakte ansehen <span aria-hidden="true">→</span></Link>
            </article>;
          })}
        </div>
      </section>

      <section className="shell section state-next" aria-labelledby="state-next-title">
        <div><p className="eyebrow">Was als Nächstes kommt</p><h2 id="state-next-title">Vom Programm zur überprüfbaren politischen Praxis.</h2></div>
        <ol>
          <li><span>01</span><div><h3>Wahlprogramme</h3><p>Welche Vorschläge stehen in den Originalfassungen – und welche Wirkungspotenziale, Risiken und Bedingungen sind daran gebunden?</p></div></li>
          <li><span>02</span><div><h3>Koalitionsvereinbarung</h3><p>Welche Zusagen werden übernommen, verändert oder nicht vereinbart?</p></div></li>
          <li><span>03</span><div><h3>Landtagsentscheidungen</h3><p>Was steht konkret zur Entscheidung – und was könnte vor dem Beschluss noch verbessert werden?</p></div></li>
          <li><span>04</span><div><h3>Wirkungsmonitor</h3><p>Was lässt sich später tatsächlich beobachten und begründet zurückkoppeln?</p></div></li>
        </ol>
      </section>
    </main>
  );
}
