import type { Metadata } from "next";
import Link from "next/link";
import { commitmentComparisons, mandateSources } from "@/data/mandate-monitor";

export const metadata: Metadata = {
  title: "Mandat und Umsetzung",
  description: "Wahlprogramm, Koalitionsvertrag und tatsächlich beschlossene Fassung transparent vergleichen – ohne Parteienranking."
};

export default function MandatUndUmsetzungPage() {
  const publishedComparisons = commitmentComparisons.filter((item) => item.editorialStatus === "PUBLISHED");
  const verifiedSources = mandateSources.filter((item) => item.status === "VERIFIED");

  return <div className="container page-shell">
    <header className="page-intro">
      <p className="kicker">Mandat und Umsetzung</p>
      <h1>Vom Wahlprogramm über den Koalitionsvertrag zur Entscheidung.</h1>
      <p>Dieser Bereich dokumentiert, was politische Dokumente tatsächlich sagen, was später verbindlich vereinbart wurde und was der Bundestag schließlich beschlossen hat. Er bewertet Texte und Entscheidungen – keine Menschen, Parteien oder Fraktionen.</p>
    </header>

    <section className="mandate-chain" aria-label="Vergleichsebenen">
      <article><span>1</span><p className="kicker">Ausgangstext</p><h2>Wahlprogramm</h2><p>Konkrete, belegte Vorhaben werden mit Fundstelle, Fassung und Veröffentlichungsdatum archiviert.</p></article>
      <article><span>2</span><p className="kicker">Vereinbarung</p><h2>Koalitionsvertrag</h2><p>Das Portal zeigt, ob und wie ein Vorhaben dort ausdrücklich aufgegriffen, verändert oder nicht vereinbart wurde.</p></article>
      <article><span>3</span><p className="kicker">Tatsächlicher Beschluss</p><h2>Finale Fassung</h2><p>Verglichen wird nur die amtlich dokumentierte, tatsächlich beschlossene oder abgelehnte Fassung – nicht eine frühe Entwurfsfassung.</p></article>
      <article><span>4</span><p className="kicker">WÖk-Prüfung</p><h2>Wirkung getrennt einordnen</h2><p>Der Textvergleich und die wirkungsökonomische Analyse bleiben getrennt: Quellen → Wirkpfad → Evidenz → Grenzen → Fachvotum.</p></article>
    </section>

    <section className="section" aria-labelledby="mandate-rules-title">
      <div className="section-heading"><div><p className="kicker">Vergleichsregeln</p><h2 id="mandate-rules-title">Kein Treue- oder Parteien-Score.</h2></div></div>
      <div className="editorial-grid">
        <article><h3>Textbeziehung statt Urteil</h3><p>Eine Zuordnung lautet beispielsweise „ausdrücklich aufgegriffen“, „teilweise aufgegriffen“, „materiell verändert“, „noch keine dokumentierte Entscheidung“ oder „nicht eindeutig zuordenbar“.</p></article>
        <article><h3>Wirkungsprüfung ist eigenständig</h3><p>Eine programmatische Übereinstimmung sagt noch nichts über positive Netto-Wirkung. Die WÖk-Einordnung folgt denselben Quellen-, Evidenz-, Grenz- und Nichtkompensationsregeln wie jeder andere Vorgang.</p></article>
        <article><h3>Keine Scheinvollständigkeit</h3><p>Keine Zuordnung ohne zitierfähige Passage, geprüfte Fassung und redaktionelle Freigabe. Nicht zuordenbare oder offene Fälle bleiben sichtbar offen.</p></article>
      </div>
    </section>

    {verifiedSources.length === 0 && publishedComparisons.length === 0 ? <section className="notice" aria-label="Importstatus"><strong>Quellenimport steht noch aus.</strong><p>Wahlprogramme, Koalitionsvertrag und finale Entscheidungen werden erst nach gesichertem Original-Link, Versionsstand, Fundstelle und Inhalts-Hash aufgenommen. Bis dahin veröffentlicht das Portal keine Behauptung über Übereinstimmung oder Wirkung.</p></section> : null}

    <section className="section mandate-next" aria-labelledby="mandate-next-title">
      <p className="kicker">Was hier später nachvollziehbar wird</p>
      <h2 id="mandate-next-title">Jeder Vergleich führt zurück zu den Originalstellen und zum Wirkungscheck.</h2>
      <p>Bei einer veröffentlichten Zuordnung erscheinen die relevanten Textpassagen, die Beziehung zwischen den drei Ebenen, die zeitliche Einordnung und – falls fachlich freigegeben – der vollständige Wirkungscheck. Daraus entsteht keine Rangliste, sondern eine überprüfbare Dokumentation politischer Umsetzung.</p>
      <div className="hero-actions"><Link className="button button--primary" href="/historie">WÖk-Rückblicke ansehen</Link><Link className="button" href="/transparenz">Prüfstandard ansehen</Link></div>
    </section>
  </div>;
}
