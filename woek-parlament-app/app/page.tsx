import Link from "next/link";
import { CaseCard } from "@/app/components/CaseCard";
import { parliamentaryCases } from "@/data/cases";

const pillars = [
  ["01", "Wirkungsradar", "Was steht an – und warum ist dieser Vorgang prüfungsrelevant?"],
  ["02", "Wirkungscheck", "Welche Veränderungen sind plausibel, welche Risiken bleiben und was wissen wir noch nicht?"],
  ["03", "Wirkungsdialog", "Perspektiven und offene Fragen aufnehmen – ohne ein Fachvotum durch Umfragen zu ersetzen."],
  ["04", "WÖk-Rückblick", "Damals verfügbares Wissen und heutige Beobachtung fair voneinander trennen."],
  ["05", "Wirkungsmonitor", "Erwartungen, Indikatoren und Beobachtungen verbinden – und bei Abweichungen korrigieren."],
];

const benefits = [
  ["Vor der Entscheidung", "Sie sehen, was tatsächlich zur Beratung oder Abstimmung steht, welche Fassung maßgeblich ist und welche Fragen für die Wirkung entscheidend sind."],
  ["Bei der Einordnung", "Sie sehen Wirkungspotenziale, Wirkungsrisiken, Quellen und Unsicherheiten getrennt – nicht eine politische Kurzmeinung."],
  ["Nach der Entscheidung", "Sie können nachverfolgen, welche Erwartungen sich beobachten lassen, was offen bleibt und wann eine Einordnung überprüft werden muss."],
];

export default function HomePage() {
  return <>
    <section className="hero container">
      <div>
        <p className="kicker">Deutscher Bundestag · öffentliches Fachangebot</p>
        <h1>Was bewirken politische Entscheidungen – und woran lässt es sich überprüfen?</h1>
        <p className="lead">Das Wirkungsportal Parlament macht sichtbar, was zur Entscheidung steht, welche Veränderungen dadurch möglich sind, welche Risiken bedacht werden müssen und was später tatsächlich beobachtet werden kann.</p>
        <p className="hero-clarifier"><strong>In einem Satz:</strong> Wirkungsökonomie fragt nicht nur, was eine Maßnahme beabsichtigt, sondern welche Zustände sie für Menschen, Umwelt und demokratisches Zusammenleben verändern kann.</p>
        <div className="hero-actions">
          <Link className="button button--primary" href="#so-funktioniert-es">So funktioniert das Portal</Link>
          <Link className="button" href="/bevorstehend">Anstehende Entscheidungen ansehen</Link>
        </div>
      </div>
      <aside className="hero-aside">
        <p className="kicker">Nicht nur ein Kommentar</p>
        <h2>Absicht ist noch keine Wirkung.</h2>
        <p>Ein Gesetz kann ein gutes Ziel nennen und dennoch an Umsetzung, Zugang, Nebenwirkungen oder fehlenden Daten scheitern.</p>
        <ul className="hero-checklist">
          <li>amtliche Fassung und Quellen</li>
          <li>Wirkpfad statt Schlagwort</li>
          <li>sichtbare Annahmen und Grenzen</li>
          <li>spätere Überprüfung statt Selbstbestätigung</li>
        </ul>
      </aside>
    </section>

    <section id="so-funktioniert-es" className="section section--paper">
      <div className="container home-intro-grid">
        <div>
          <p className="kicker">Wirkungsökonomie, kurz erklärt</p>
          <h2>Von der Maßnahme zur nachprüfbaren Veränderung.</h2>
          <p className="lead">Wirkung ist eine tatsächliche Veränderung eines Zustands. Vor einer Entscheidung sprechen wir deshalb ehrlich von <strong>Wirkungspotenzial</strong> und <strong>Wirkungsrisiko</strong> – nicht so, als sei die Zukunft bereits eingetreten.</p>
          <p>Das Portal verbindet Fakten aus amtlichen Quellen mit einer offengelegten Wirkungslogik: Was ändert die Maßnahme? Wen betrifft sie? Über welchen Mechanismus könnte sich etwas verändern? Welche Daten würden die Annahme stützen oder widerlegen?</p>
        </div>
        <dl className="home-definition-list">
          <div><dt>Maßnahme</dt><dd>Was wird in der maßgeblichen Fassung entschieden?</dd></div>
          <div><dt>Wirkpfad</dt><dd>Über welche Schritte könnte sich ein Zustand verändern?</dd></div>
          <div><dt>Prüfgrenze</dt><dd>Was lässt sich belegen, was ist nur Annahme – und was wissen wir nicht?</dd></div>
          <div><dt>Rückkopplung</dt><dd>Woran wird später überprüft, ob die Annahme trägt?</dd></div>
        </dl>
      </div>
    </section>

    <section className="section container" aria-labelledby="benefit-title">
      <div className="section-heading home-section-heading">
        <div><p className="kicker">Ihr Nutzen</p><h2 id="benefit-title">Politik besser prüfen, ohne sich auf eine Blackbox verlassen zu müssen.</h2></div>
      </div>
      <div className="home-benefit-grid">
        {benefits.map(([title, text], index) => <article key={title}>
          <span aria-hidden="true">0{index + 1}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>)}
      </div>
    </section>

    <section className="section section--paper" aria-labelledby="example-title">
      <div className="container home-example">
        <div>
          <p className="kicker">Ein Beispiel, klar als Muster gekennzeichnet</p>
          <h2 id="example-title">Weniger Nachweise sollen den Zugang vereinfachen.</h2>
          <p>Eine Regel könnte für einen Antrag weniger zusätzliche Nachweise verlangen. Das Portal würde nicht behaupten: „Der Zugang ist jetzt besser.“ Es zeigt den prüfbaren Weg dorthin – und was noch fehlen kann.</p>
          <Link className="button" href="/entscheidungen/musterfall-fassungswechsel">Musterfall im Wirkungscheck ansehen</Link>
        </div>
        <ol className="home-example-path">
          <li><strong>1 · Beschluss</strong><span>Eine Zugangsvoraussetzung wird vereinfacht.</span></li>
          <li><strong>2 · Annahme</strong><span>Weniger Nachweise könnten eine Hürde senken.</span></li>
          <li><strong>3 · Prüfung</strong><span>Vollzug, Ausschlüsse und Nutzung werden mit Quellen und Grenzen betrachtet.</span></li>
          <li><strong>4 · Beobachtung</strong><span>Erst spätere Daten zeigen, ob sich der Zugang tatsächlich verändert hat.</span></li>
        </ol>
      </div>
    </section>

    <section className="section container" aria-labelledby="calculation-title">
      <div className="home-ledger">
        <div>
          <p className="kicker">Nachvollziehbar statt nur überzeugend klingend</p>
          <h2 id="calculation-title">Jede belastbare Zahl braucht einen Rechenweg.</h2>
          <p>Wo sich etwas seriös quantifizieren lässt, veröffentlicht das Portal Ausgangsdaten, Gegenfaktum, Reichweite, Zurechnung, Formel, Referenzwert und Unsicherheit. Wo das nicht tragfähig möglich ist, steht dort ausdrücklich: <strong>nicht belastbar quantifizierbar</strong>.</p>
        </div>
        <div className="home-ledger-chain" aria-label="Rechenweg einer quantifizierten Wirkung">
          <span>Quelle</span><i aria-hidden="true">→</i><span>Ausgangswert</span><i aria-hidden="true">→</i><span>Gegenfaktum</span><i aria-hidden="true">→</i><span>Berechnung</span><i aria-hidden="true">→</i><span>Unsicherheit</span>
        </div>
      </div>
    </section>

    <section className="section section--navy" aria-labelledby="trust-title">
      <div className="container home-trust-grid">
        <div>
          <p className="kicker">Herausgeberschaft und Unabhängigkeit</p>
          <h2 id="trust-title">Parteiunabhängig. Methodisch offen. Korrigierbar.</h2>
          <p>Herausgeber ist das Institut für Wirkungsökonomie. Partei, Fraktion, Regierungs- oder Oppositionsstatus sind keine Eingaben der Wirkungsbewertung. Das Portal bewertet Maßnahmen und ihre dokumentierten Wirkpfade – keine Menschen und keine Parteien.</p>
        </div>
        <div>
          <p><strong>Keine versteckte Wertung:</strong> Parteiunabhängigkeit heißt nicht Wertfreiheit. Die normative Grundlage – SDGs, Agenda 2030, die offen ausgewiesene WÖk-Erweiterung SDG+ sowie Mensch, Planet und Demokratie – wird veröffentlicht und bleibt pro Einordnung sichtbar.</p>
          <p><strong>Keine Scheingenauigkeit:</strong> KI und Automatisierung dürfen weder Fakten noch Zahlen erfinden. Jede Analyse nennt ihren Quellen-, Fassungs- und Methodenstand; Fehler oder neue Evidenz lösen eine überprüfbare Korrektur aus.</p>
          <div className="hero-actions"><Link className="button button--gold" href="/transparenz">Transparenz ansehen</Link><Link className="button button--light" href="/methodik">Methodik verstehen</Link></div>
        </div>
      </div>
    </section>

    <section className="section container">
      <div className="section-heading">
        <div><p className="kicker">Startpunkt</p><h2>Was steht als Nächstes an?</h2></div>
        <Link href="/bevorstehend">Zum Wirkungsradar</Link>
      </div>
      <div className="notice"><strong>Amtliche Daten werden zuerst als Prüfbestand importiert.</strong><p>Der Vorlauf erfasst nur bestätigte, datierte DIP-Verfahrensschritte. Jeder neue Eintrag bleibt zunächst intern als Entwurf: Quellen, Fassung und Wirkungsrelevanz werden geprüft, bevor etwas als parlamentarischer Status oder Fachvotum veröffentlicht wird.</p></div>
    </section>

    <section className="section section--paper">
      <div className="container">
        <div className="section-heading"><div><p className="kicker">Demonstrator</p><h2>So bleibt eine Entscheidung nachvollziehbar.</h2></div></div>
        <div className="card-grid">{parliamentaryCases.map((item) => <CaseCard key={item.slug} item={item} />)}</div>
      </div>
    </section>

    <section className="section container">
      <div className="section-heading"><div><p className="kicker">Eine Lernschleife</p><h2>Vorher verstehen. Entscheidung prüfen. Nachher lernen.</h2></div></div>
      <ol className="pillars">{pillars.map(([number, title, text]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
    </section>
  </>;
}
