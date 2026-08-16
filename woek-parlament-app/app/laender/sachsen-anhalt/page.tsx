import Link from "next/link";
import { jurisdictionById } from "@/lib/parliament/jurisdictions";
import { readProgrammeSummary, saxonyProgrammeAnalyses } from "@/lib/fachbasis";

const saxonyAnhalt = jurisdictionById("sachsen-anhalt");

export const metadata = {
  title: "Landtagswahl Sachsen-Anhalt 2026 | Wirkungsportal Parlament",
  description: "Wahlprogramme vor der Landtagswahl Sachsen-Anhalt 2026: Wirkungspotenziale, Risiken, Quellen und offene Fragen verständlich und nachvollziehbar."
};

export default async function SaxonyAnhaltPage() {
  if (!saxonyAnhalt?.election) return null;
  const electionDate = new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${saxonyAnhalt.election.date}T12:00:00`));
  const programmeSummaries = await Promise.all(saxonyProgrammeAnalyses.map(async (analysis) => ({ analysis, summary: await readProgrammeSummary(analysis) })));

  return (
    <main>
      <section className="shell state-hero-shell">
        <div className="state-hero">
          <div>
            <p className="eyebrow">Wirkungsportal Länder · Sachsen-Anhalt</p>
            <h1>Was könnten die Programme für Sachsen-Anhalt bewirken?</h1>
            <p className="lead">Zur Landtagswahl am {electionDate} bereitet das Portal die Wahlprogramme verständlich auf: Welche Veränderung wird jeweils angestrebt? Für wen? Über welchen Wirkpfad? Wo liegen Risiken, Grenzen und offene Datenfragen?</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#so-funktioniert-es">So wird geprüft</a>
              <Link className="button button-secondary" href="/laender/sachsen-anhalt/quellen">Quellen ansehen</Link>
            </div>
          </div>
          <aside className="state-hero-fact" aria-label="Einordnung des Wahlbereichs">
            <p className="eyebrow">Vor der Wahl</p>
            <h2>Programme sind Versprechen, noch keine Wirkung.</h2>
            <p>Deshalb zeigt der Vergleich Wirkungspotenzial und Wirkungsrisiken klar getrennt von tatsächlich beobachteter Wirkung. Eine Parteizugehörigkeit ist kein Bewertungskriterium.</p>
            <dl>
              <div><dt>Wahltag</dt><dd>{electionDate}</dd></div>
              <div><dt>Start</dt><dd>Quellen- und Programmprüfung</dd></div>
              <div><dt>Danach</dt><dd>Entscheidungen und Umsetzung verfolgen</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="shell section state-purpose" id="so-funktioniert-es" aria-labelledby="state-purpose-title">
        <div className="section-heading"><div><p className="eyebrow">Der Nutzen</p><h2 id="state-purpose-title">Nicht Wahlkampf bewerten. Entscheidungen verständlich machen.</h2></div></div>
        <div className="state-purpose-grid">
          <article><span aria-hidden="true">A</span><h3>Was wird vorgeschlagen?</h3><p>Konkrete Zusagen werden mit ihrer Originalfundstelle und ihren Bedingungen dokumentiert.</p></article>
          <article><span aria-hidden="true">B</span><h3>Was könnte sich verändern?</h3><p>Der Check erklärt mögliche Wirkpfade für Menschen, Umwelt und demokratisches Zusammenleben – einschließlich Risiken und Datenlücken.</p></article>
          <article><span aria-hidden="true">C</span><h3>Woran wird gemessen?</h3><p>SDGs, SDG+ und die Landesverfassung bilden einen offengelegten Referenzrahmen. Sie ersetzen weder Debatte noch demokratische Entscheidung.</p></article>
          <article><span aria-hidden="true">D</span><h3>Was passiert nach der Wahl?</h3><p>Programm, Koalitionsvereinbarung, konkrete Entscheidung, Umsetzung und spätere Beobachtung werden Schritt für Schritt verbunden.</p></article>
        </div>
      </section>

      <section className="shell section state-reference-framework" aria-labelledby="state-reference-title">
        <div className="section-heading"><div><p className="eyebrow">Woran wird Wirkung gemessen?</p><h2 id="state-reference-title">Ein gemeinsamer Maßstab – mit dem Blick auf Sachsen-Anhalt.</h2></div><Link className="text-link" href="/laender/sachsen-anhalt/quellen#referenzrahmen">Grundlagen und Quellen <span aria-hidden="true">→</span></Link></div>
        <p className="lead">Die Bewertung steht nicht im luftleeren Raum: Die globalen Nachhaltigkeitsziele, die Landesverfassung und die landeseigene Nachhaltigkeitsstrategie zeigen transparent, welche Ziele und Schutzgrenzen berührt sind. Diese Ebenen werden nicht zu einer verdeckten Gesamtpunktzahl verrechnet.</p>
        <div className="state-reference-grid">
          {saxonyAnhalt.referenceFramework?.map((reference) => (
            <article key={reference.id}>
              <p className="reference-kind">{reference.authority === "GLOBAL" ? "Gemeinsamer Referenzrahmen" : reference.authority === "CONSTITUTIONAL" ? "Landesrechtlicher Prüfanker" : reference.authority === "STATE_STRATEGY" ? "Landesspezifische Ziele" : "Wirkungsraum"}</p>
              <h3>{reference.label}</h3>
              <p>{reference.description}</p>
              <span className="reference-stability">{reference.stability === "ENDURING" ? "dauerhaft geltender Rahmen" : reference.stability === "VERSIONED_CURRENT" ? "aktuelle, versionierte Referenz" : "je Fall konkret prüfen"}</span>
            </article>
          ))}
        </div>
        <aside className="state-cross-border-note"><strong>Wirkung endet nicht an der Landesgrenze.</strong> Eine Maßnahme kann Zuständigkeiten, Haushalte, Infrastruktur, ökologische Belastungen oder soziale Folgen in anderen Ländern, beim Bund, in Europa oder darüber hinaus berühren. Diese Zusammenhänge werden als eigene Wirkungspfade sichtbar gemacht – nicht stillschweigend dem Land zugerechnet.</aside>
      </section>

      <section className="shell section state-programme-analyses" aria-labelledby="state-status-title">
        <div className="section-heading"><div><p className="eyebrow">Wahlprogramme im Wirkungscheck</p><h2 id="state-status-title">Sechs vollständige Fachakten – einzeln prüfen, nicht Parteien ranken.</h2><p className="lead">Jede Fachakte erschließt quellengebundene Zusagen mit möglichen Wirkpfaden, Risiken, Umsetzungsbedingungen, Datenbedarf und normativen Bezügen. Die vollständige Darstellung bleibt jeweils zugänglich.</p></div></div>
        <div className="state-programme-grid">
          {programmeSummaries.map(({ analysis, summary }) => <article key={analysis.id}>
            <p className="eyebrow">{analysis.eyebrow}</p>
            <h3>{analysis.title}</h3>
            {summary?.resultHeadline ? <div className="programme-card-result"><p className="eyebrow">Kernaussage</p><h4>{summary.resultHeadline}</h4><p>{summary.resultTeaser}</p></div> : <p>{summary?.summary}</p>}
            <dl>
              <div><dt>Zusageeinheiten</dt><dd>{summary?.commitments || "–"}</dd></div>
              <div><dt>Wirkpfade</dt><dd>{summary?.impactPaths || "–"}</dd></div>
              <div><dt>Politikfelder</dt><dd>{summary?.domains || "–"}</dd></div>
            </dl>
            <Link className="text-link" href={`/fachakten/${analysis.id}`}>Vollständige Fachakte öffnen <span aria-hidden="true">→</span></Link>
          </article>)}
        </div>
      </section>

      <section className="shell section state-next" aria-labelledby="state-next-title">
        <div><p className="eyebrow">Was als Nächstes kommt</p><h2 id="state-next-title">Vom Programm zur überprüfbaren politischen Praxis.</h2></div>
        <ol>
          <li><span>01</span><div><h3>Wahlprogramme</h3><p>Quellenbasiert, verständlich und mit Wirkungspotenzialen statt Parolen.</p></div></li>
          <li><span>02</span><div><h3>Koalitionsvereinbarung</h3><p>Welche Zusagen werden übernommen, verändert oder nicht vereinbart?</p></div></li>
          <li><span>03</span><div><h3>Landtagsentscheidungen</h3><p>Was steht konkret zur Entscheidung – und was könnte vor dem Beschluss noch verbessert werden?</p></div></li>
          <li><span>04</span><div><h3>Wirkungsmonitor</h3><p>Was lässt sich später tatsächlich beobachten und begründet zurückkoppeln?</p></div></li>
        </ol>
      </section>
    </main>
  );
}
