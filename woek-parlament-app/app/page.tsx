import Link from "next/link";
import { CaseCard } from "@/app/components/CaseCard";
import { listPublishedCases } from "@/lib/cases";

export default function HomePage() {
  const cases = listPublishedCases();
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">Deutscher Bundestag · MVP</p>
          <h1>Was politische Entscheidungen voraussichtlich verändern – verständlich, prüfbar und transparent.</h1>
          <p className="lead">Das Wirkungsportal ordnet parlamentarische Entscheidungen vor der Abstimmung und im Rückblick ein: Was steht zur Entscheidung? Welche Wirkungen, Risiken und Datenlücken sind plausibel? Woran lässt sich später erkennen, was tatsächlich eingetreten ist?</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/bevorstehend">Wirkungsradar öffnen</Link>
            <Link className="button button-secondary" href="/methodik">So funktioniert es</Link>
          </div>
        </div>
        <aside className="hero-panel" aria-label="Einordnung">
          <p className="eyebrow">Woran Sie sich orientieren können</p>
          <h2>Wirkung ist nicht Absicht.</h2>
          <p>Wir trennen amtliche Fakten, Wirkungspotenzial, Wirkungsrisiken, normative Einordnung und spätere Beobachtung. Eine Zahl oder ein Versprechen wird nicht zur Wirkung erklärt.</p>
          <p className="hero-panel-link"><Link href="/transparenz">Quellen, Versionen und Grenzen ansehen</Link></p>
        </aside>
      </section>

      <section className="shell quick-orientation" aria-labelledby="orientation-title">
        <div><p className="eyebrow">In einer Minute</p><h2 id="orientation-title">Keine Politikbewertung aus dem Bauch.</h2></div>
        <div className="orientation-grid">
          <article><h3>1. Verstehen</h3><p>Der Entscheidungsgegenstand und die tatsächlich relevante Fassung werden aus amtlichen Quellen abgegrenzt.</p></article>
          <article><h3>2. Prüfen</h3><p>Wirkpfade, Betroffene, Daten, Gegenfaktum, Annahmen und Risiken werden sichtbar miteinander verknüpft.</p></article>
          <article><h3>3. Nachvollziehen</h3><p>Die Kernaussage bleibt kurz. Wer tiefer einsteigen möchte, öffnet Berechnung, Quellen, Unsicherheit und Methodenstand.</p></article>
        </div>
      </section>

      <section className="shell section">
        <div className="section-heading">
          <div><p className="eyebrow">Startpunkt</p><h2>Was steht als Nächstes an?</h2></div>
          <Link className="text-link" href="/bevorstehend">Alle Radarhinweise <span aria-hidden="true">→</span></Link>
        </div>
        <div className="notice notice-neutral"><strong>Amtliche Live-Befüllung wird vorbereitet.</strong> Die DIP-Importstrecke wird erst mit einem gültigen API-Zugang, Quellenprüfung und redaktioneller Freigabe aktiviert. Bis dahin zeigt das Portal keine erfundenen parlamentarischen Statusdaten.</div>
      </section>

      <section className="shell section section-surface">
        <div className="section-heading"><div><p className="eyebrow">Portal-Demonstrator</p><h2>So bleibt eine Entscheidung nachvollziehbar.</h2></div></div>
        <div className="card-grid">{cases.map((item) => <CaseCard item={item} key={item.slug} />)}</div>
      </section>

      <section className="shell section example-section" aria-labelledby="example-title">
        <div className="section-heading"><div><p className="eyebrow">Einfach erklärt</p><h2 id="example-title">Was ein Wirkungscheck anders macht.</h2></div></div>
        <div className="example-grid">
          <article><p className="example-label">Nicht nur</p><h3>„Die Maßnahme soll den Zugang verbessern.“</h3><p>Das ist ein politisches Ziel – noch kein Nachweis einer tatsächlichen Zustandsveränderung.</p></article>
          <article><p className="example-label">Sondern zusätzlich</p><h3>„Für wen, wodurch und woran würde sich eine Verbesserung zeigen?“</h3><p>Der Check macht Wirkpfad, Datenbedarf, mögliche Nebenwirkungen und spätere Korrekturpunkte transparent.</p></article>
        </div>
      </section>

      <section className="shell section trust-section" aria-labelledby="trust-title">
        <div><p className="eyebrow">Vertrauen durch Nachvollziehbarkeit</p><h2 id="trust-title">Parteiunabhängig – aber nicht verborgen wertneutral.</h2><p className="lead">Herausgegeben vom Institut für Wirkungsökonomie. Der normative Referenzrahmen – SDGs, Agenda 2030, SDG+ sowie Mensch, Planet und Demokratie – ist öffentlich. Partei, Fraktion und Mehrheitsprognose sind keine Eingaben in die fachliche Einordnung.</p></div>
        <ul>
          <li><strong>Amtliche Quellen zuerst</strong><span>Entscheidungsstand, Fassungen und Abstimmungsergebnisse werden nicht geschätzt.</span></li>
          <li><strong>Keine Blackbox</strong><span>Berechnung, Quellen, Annahmen und Grenzen können auf jeder veröffentlichten Seite geöffnet werden.</span></li>
          <li><strong>Keine Personenbewertung</strong><span>Das Portal bewertet keine Menschen, Gesinnungen oder politischen Nutzerprofile.</span></li>
        </ul>
      </section>

      <section className="shell section pillars">
        <div className="section-heading"><div><p className="eyebrow">Fünf Säulen</p><h2>Von der bevorstehenden Entscheidung bis zum Lernen aus Wirkung.</h2></div></div>
        <ol className="pillar-list">
          <li><span>01</span><div><h3>Wirkungsradar</h3><p>Was steht parlamentarisch an – ausschließlich anhand geprüfter amtlicher Quellen.</p></div></li>
          <li><span>02</span><div><h3>Wirkungschecks</h3><p>Welche Veränderung ist beabsichtigt, welche Wirkpfade und Risiken sind plausibel?</p></div></li>
          <li><span>03</span><div><h3>Wirkungsdialog</h3><p>Später: sorgfältig getrennte, aggregierte Dialog- und Umfrageformate.</p></div></li>
          <li><span>04</span><div><h3>Historische Checks</h3><p>Was war damals bekannt – und welche Veränderungen lassen sich heute beobachten?</p></div></li>
          <li><span>05</span><div><h3>Wirkungsmonitor</h3><p>Wie werden Erkenntnisse in eine überprüfbare Rückkopplung überführt?</p></div></li>
        </ol>
      </section>
    </>
  );
}
