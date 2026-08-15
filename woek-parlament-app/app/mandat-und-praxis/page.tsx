import type { Metadata } from "next";
import Link from "next/link";
import { politicalSourceCatalog } from "@/lib/commitments/source-catalog";

export const metadata: Metadata = {
  title: "Mandat & Praxis",
  description: "Wahlprogramme, Koalitionsvertrag und parlamentarische Umsetzung werden quellenbasiert mit einem unabhängigen Wirkungscheck verbunden."
};

const comparisonSteps = [
  ["01", "Dokumentierte Zusage", "Eine konkrete Passage aus Wahlprogramm oder Koalitionsvertrag mit Fundstelle, Fassung und Zeitraum."],
  ["02", "Parlamentarisch bearbeitet", "Wurde ein Antrag oder Gesetzentwurf eingebracht? Ein eingebrachter Entwurf ist noch keine Umsetzung."],
  ["03", "Beschlossen und umgesetzt", "Die tatsächlich beschlossene Fassung, ihr Status und der Vollzug – nicht bloß eine Ankündigung."],
  ["04", "Wirkungscheck", "Eine eigenständige Prüfung von Wirkpfad, Daten, Gegenfaktum, Risiken, Berechnung und normativem Referenzrahmen."],
  ["05", "Beobachtete Wirkung", "Was sich später verändert hat, was davon belastbar zurechenbar ist und was offenbleibt."]
] as const;

export default function MandatUndPraxisPage() {
  const electionPrograms = politicalSourceCatalog.filter((source) => source.sourceType === "ELECTION_PROGRAM");
  const coalitionAgreement = politicalSourceCatalog.find((source) => source.sourceType === "COALITION_AGREEMENT");
  const commitmentCount = politicalSourceCatalog.reduce((total, source) => total + source.commitmentCount, 0);

  return (
    <div className="shell content-page mandate-page">
      <header className="page-intro mandate-intro">
        <p className="eyebrow">Mandat &amp; Praxis · 21. Wahlperiode</p>
        <h1>Was wurde versprochen, vereinbart und tatsächlich entschieden?</h1>
        <p className="lead">Dieser Bereich macht politische Zusagen, den Koalitionsvertrag und die parlamentarische Praxis vergleichbar – ohne daraus eine Partei- oder Personenbewertung zu machen. Geprüft wird, wie sich konkrete politische Wege zum bereits bestehenden öffentlichen Referenzrahmen der Bundesrepublik verhalten. Für jede belastbar zuordenbare Verbindung folgt ein eigener Wirkungscheck.</p>
      </header>

      <section className="mandate-overview" aria-labelledby="mandate-overview-title">
        <div><p className="eyebrow">Wahl 2025 · Koalition 2025</p><h2 id="mandate-overview-title">Die Quellenbasis steht. Die Wirkung wird getrennt geprüft.</h2><p>Aus sieben Primärdokumenten sind {commitmentCount.toLocaleString("de-DE")} konkrete Zusagen mit Fundstelle strukturiert. Das ist noch kein Wirkungsurteil: Erst die Verbindung zu einer konkreten Entscheidung, ihren Wirkpfaden, Risiken, Daten und Grenzen erlaubt eine belastbare Einordnung.</p></div>
        <dl>
          <div><dt>Wahlprogramme</dt><dd>{electionPrograms.length}</dd><small>mit {electionPrograms.reduce((total, source) => total + source.commitmentCount, 0).toLocaleString("de-DE")} strukturierten Zusagen</small></div>
          <div><dt>Koalitionsvertrag</dt><dd>{coalitionAgreement?.commitmentCount.toLocaleString("de-DE") ?? "–"}</dd><small>strukturierte Zusagen</small></div>
          <div><dt>Wirkungsurteile</dt><dd>0</dd><small>bis Entscheidungen und Evidenz fallweise geprüft sind</small></div>
        </dl>
      </section>

      <section className="mandate-reference" aria-labelledby="mandate-reference-title">
        <div>
          <p className="eyebrow">Übergeordneter Maßstab</p>
          <h2 id="mandate-reference-title">Ein Wahlprogramm setzt nicht den Maßstab. Es schlägt einen Weg vor.</h2>
          <p>Die Agenda 2030 und ihre SDGs wurden von 193 Staaten vereinbart. Die Bundesrepublik Deutschland hat sich zu ihrer Umsetzung verpflichtet. Deshalb prüft das Portal Wahlprogramme, Koalitionsvereinbarungen und konkrete Entscheidungen nicht im luftleeren Raum: Es fragt, ob sie den bereits öffentlich vereinbarten Zielen, Schutzgütern und Grenzen dienen, sie schwächen oder Zielkonflikte auslösen könnten.</p>
        </div>
        <ol>
          <li><strong>Nicht:</strong><span>„Passt die Entscheidung zu einer Partei?“</span></li>
          <li><strong>Sondern:</strong><span>„Welches Wirkungspotenzial hat sie im Verhältnis zu den gemeinsamen Verpflichtungen und Schutzgütern?“</span></li>
          <li><strong>Und:</strong><span>„Welche Daten, Wirkpfade und Annahmen tragen diese Einordnung – und was bleibt offen?“</span></li>
        </ol>
        <Link className="text-link" href="/transparenz#referenzrahmen">Referenzrahmen vollständig erklärt <span aria-hidden="true">→</span></Link>
      </section>

      <section className="mandate-principle" aria-labelledby="principle-title">
        <div>
          <p className="eyebrow">Wichtige Trennung</p>
          <h2 id="principle-title">Vertragstreue ist nicht automatisch positive Wirkung.</h2>
          <p>Ob eine Entscheidung eine Zusage voranbringt, ist eine belegbare Vergleichsaussage. Ob diese Entscheidung eine positive Netto-Wirkung erwarten lässt oder entfaltet, wird getrennt anhand von Quellen, Wirkpfaden, WÖk-Referenzen, Grenzen und – wo möglich – nachvollziehbaren Berechnungen geprüft.</p>
        </div>
        <dl>
          <div><dt>Fakt</dt><dd>Quelle, Zusage, finale Fassung und Beschlussstatus</dd></div>
          <div><dt>Umsetzungsabgleich</dt><dd>noch nicht aufgegriffen · eingebracht · beschlossen · in Umsetzung · praktisch umgesetzt · offen</dd></div>
          <div><dt>Wirkungscheck</dt><dd>eigenständig, parteiunabhängig und nie aus dem Abgleich abgeleitet</dd></div>
        </dl>
      </section>

      <section className="section section-compact" aria-labelledby="chain-title">
        <div className="section-heading"><div><p className="eyebrow">So wird die Lücke prüfbar</p><h2 id="chain-title">Von der Zusage bis zur Wirkung</h2></div></div>
        <ol className="comparison-chain">
          {comparisonSteps.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
        </ol>
      </section>

      <section className="section section-compact comparison-status" aria-labelledby="status-title">
        <div className="section-heading"><div><p className="eyebrow">Prüfstatus</p><h2 id="status-title">Von der Quelle zur belastbaren Einordnung</h2></div></div>
        <div className="mandate-status-flow" aria-label="Prüfablauf Mandat und Praxis">
          <article><span>01</span><h3>Zusagen dokumentieren</h3><p>{commitmentCount.toLocaleString("de-DE")} Fundstellen aus sieben Primärquellen sind strukturiert.</p></article>
          <article><span>02</span><h3>Mit Entscheidungen verbinden</h3><p>Eine Zusage wird nur mit der tatsächlich relevanten parlamentarischen Fassung verglichen.</p></article>
          <article><span>03</span><h3>Beschluss und Vollzug trennen</h3><p>Ein beschlossenes Gesetz ist nicht automatisch praktisch umgesetzt. Beide Stufen bleiben sichtbar.</p></article>
          <article><span>04</span><h3>Wirkung unabhängig prüfen</h3><p>Wirkpfade, Gegenfaktum, Risiken, Berechnungen und Grenzen folgen getrennt vom Umsetzungsabgleich.</p></article>
        </div>
      </section>

      <section className="section section-compact" aria-labelledby="programmes-title">
        <div className="section-heading"><div><p className="eyebrow">Quellenregister</p><h2 id="programmes-title">Wahlprogramme 2025</h2></div></div>
        <div className="source-register">
          {electionPrograms.map((source) => <article key={source.sourceKey}>
            <p className="source-register-label">Originalquelle der Partei · {source.actor}</p>
            <h3>{source.title}</h3>
            <p>{source.note}</p><p className="commitment-count"><strong>{source.commitmentCount.toLocaleString("de-DE")} strukturierte Zusagen</strong> · mit Quellenfingerabdruck dokumentiert</p>
            <Link className="text-link" href={`/mandat-und-praxis/${source.sourceKey}`}>Zusagen und Fundstellen ansehen <span aria-hidden="true">→</span></Link>
          </article>)}
        </div>
      </section>

      {coalitionAgreement && <section className="section section-compact coalition-source" aria-labelledby="coalition-title">
        <div className="section-heading"><div><p className="eyebrow">Gemeinsame Vereinbarung</p><h2 id="coalition-title">Koalitionsvertrag 2025</h2></div></div>
        <article>
          <p className="source-register-label">Originaldokument der Koalitionsparteien · {coalitionAgreement.actor}</p>
          <h3>{coalitionAgreement.title}</h3>
          <p>{coalitionAgreement.note} Jede spätere Zuordnung wird die konkrete Vertragsstelle, die dazugehörige parlamentarische Entscheidung und ihren Quellenstand zeigen.</p><p className="commitment-count"><strong>{coalitionAgreement.commitmentCount.toLocaleString("de-DE")} strukturierte Zusagen</strong> · mit Quellenfingerabdruck dokumentiert</p>
          <Link className="text-link" href={`/mandat-und-praxis/${coalitionAgreement.sourceKey}`}>Zusagen und Fundstellen ansehen <span aria-hidden="true">→</span></Link>
        </article>
      </section>}

      <section className="section section-compact" aria-labelledby="outcomes-title">
        <div className="section-heading"><div><p className="eyebrow">Später pro Zusage sichtbar</p><h2 id="outcomes-title">Vier Ergebnisse – niemals eine bloße Punktzahl</h2></div></div>
        <div className="outcome-grid">
          <article><h3>Umsetzung</h3><p>Ob eine konkrete Entscheidung eine Zusage nachweisbar voranbringt, nur teilweise erfüllt, von ihr abweicht oder noch nicht vergleichbar ist.</p></article>
          <article><h3>Wirkungspotenzial</h3><p>Welche Veränderung mit welchen Annahmen erwartet werden kann – nicht als bereits eingetretene Wirkung formuliert.</p></article>
          <article><h3>Beobachtete Wirkung</h3><p>Was sich nach Beschluss tatsächlich entwickelt hat und was sich davon belastbar zurechnen lässt.</p></article>
          <article><h3>Lernschleife</h3><p>Welche Annahme sich bestätigt hat, welche Evidenz fehlt und was eine künftige Entscheidung robuster machen würde.</p></article>
        </div>
      </section>

      <section className="notice mandate-next"><strong>Was als Nächstes geschieht</strong><p>Die amtlichen Vorgänge werden in Fallpakete mit finaler Fassung, Beschlussstatus und Quellen überführt. Dann werden vergleichbare Zusagen fallweise verknüpft, der Wirkungscheck unabhängig durchgeführt und erst nach Freigabe veröffentlicht.</p><Link className="text-link" href="/historie">Zum historischen Aufbau <span aria-hidden="true">→</span></Link></section>
      <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
    </div>
  );
}
