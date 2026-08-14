import Link from "next/link";
import { parliamentaryCases, type ParliamentaryCase } from "@/data/cases";
import { formatDate } from "@/lib/cases";

const benefits = [
  ["Vor der Entscheidung", "Sie sehen die maßgebliche Fassung, den parlamentarischen Stand und die Fragen, die für mögliche Wirkung entscheidend sind."],
  ["Bei der Einordnung", "Wirkungspotenzial, Wirkungsrisiko, Quellen und Unsicherheit bleiben getrennt – statt in einer politischen Kurzmeinung zu verschwimmen."],
  ["Nach der Entscheidung", "Das Portal hält fest, was erwartet wurde, was später beobachtbar ist und wann eine Einordnung überprüft werden muss."],
];

function priorityCase(): { item: ParliamentaryCase; isUpcoming: boolean } | undefined {
  const now = Date.now();
  const published = parliamentaryCases.filter((item) => item.editorialStatus === "PUBLISHED");
  const upcoming = published
    .filter((item) => item.nextEvent && new Date(item.nextEvent).getTime() >= now)
    .sort((a, b) => new Date(a.nextEvent ?? 0).getTime() - new Date(b.nextEvent ?? 0).getTime())[0];
  if (upcoming) return { item: upcoming, isUpcoming: true };
  const latest = published.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))[0];
  return latest ? { item: latest, isUpcoming: false } : undefined;
}

function CurrentPriority() {
  const priority = priorityCase();
  if (!priority) {
    return <aside className="home-priority" aria-label="Aktueller Stand des Wirkungsradars">
      <p className="kicker">Aktuell im Radar</p>
      <h2>Noch kein amtlich verifizierter Vorgang veröffentlicht.</h2>
      <p>Der nächste Eintrag erscheint erst, wenn Termin, maßgebliche Fassung und Quelle geprüft sind. Das Portal füllt diese Fläche nicht mit Vermutungen.</p>
      <span className="chip chip--status_unverified">AMTLICHER IMPORT &amp; QUELLENPRÜFUNG AUSSTEHEND</span>
      <Link className="button button--light" href="/bevorstehend">So funktioniert der Wirkungsradar</Link>
    </aside>;
  }

  const { item, isUpcoming } = priority;
  return <aside className="home-priority" aria-label={isUpcoming ? "Nächste relevante Entscheidung" : "Zuletzt veröffentlichte Entscheidung"}>
    <p className="kicker">{isUpcoming ? "Als Nächstes" : "Zuletzt veröffentlicht"}</p>
    <h2>{item.plainTitle}</h2>
    <p>{isUpcoming ? `Nächster bestätigter Termin: ${formatDate(item.nextEvent ?? "")}.` : `Stand der Veröffentlichung: ${formatDate(item.lastUpdated)}.`}</p>
    <p>{item.summary}</p>
    <Link className="button button--light" href={`/entscheidungen/${item.slug}`}>{isUpcoming ? "Wirkungscheck öffnen" : "Entscheidung ansehen"}</Link>
  </aside>;
}

const conclusionLabels = {
  DECISION_CONFIRMED: "Entscheidung bestätigt",
  DECISION_MOSTLY_CONFIRMED: "Überwiegend bestätigt",
  JUSTIFIABLE_AT_TIME_NOT_CONFIRMED_EX_POST: "Damals vertretbar – heute nicht bestätigt",
  ALTERNATIVE_PREFERABLE: "Alternative vorzugswürdig",
  NO_ROBUST_RETROSPECTIVE_ASSESSMENT: "Keine belastbare Rückschau möglich"
} as const;

function RecentConclusions() {
  const cases = parliamentaryCases
    .filter((item) => item.editorialStatus === "PUBLISHED" && item.retrospective && item.publishedConclusion)
    .sort((a, b) => (b.publishedConclusion?.completedAt ?? "").localeCompare(a.publishedConclusion?.completedAt ?? ""))
    .slice(0, 3);

  if (cases.length === 0) {
    return <section className="section section--paper" aria-labelledby="history-preview-title">
      <div className="container home-history-preview home-history-preview--empty">
        <div><p className="kicker">Aus Entscheidungen lernen</p><h2 id="history-preview-title">Die ersten Abschlusseinordnungen folgen nach dem amtlichen Backfill.</h2></div>
        <div><p>Historische Wirkungschecks trennen strikt: Was war damals bekannt? Was lässt sich heute beobachten? Erst danach wird eine nachvollziehbare Rückschau veröffentlicht.</p><Link className="button" href="/historie">So funktioniert der WÖk-Rückblick</Link></div>
      </div>
    </section>;
  }

  return <section className="section section--paper" aria-labelledby="history-preview-title">
    <div className="container">
      <div className="section-heading home-section-heading"><div><p className="kicker">Aus Entscheidungen lernen</p><h2 id="history-preview-title">Die jüngsten abgeschlossenen Wirkungschecks.</h2></div><Link href="/historie">Alle Rückblicke</Link></div>
      <div className="home-history-grid">
        {cases.map((item) => {
          const conclusion = item.publishedConclusion!;
          return <article key={item.slug}>
            <p className="kicker">{conclusionLabels[conclusion.label]}</p>
            <h3>{item.plainTitle}</h3>
            <p>{conclusion.summary}</p>
            <small>Abgeschlossen am {formatDate(conclusion.completedAt)}</small>
            <Link href={`/entscheidungen/${item.slug}`}>Rückblick ansehen</Link>
          </article>;
        })}
      </div>
    </div>
  </section>;
}

export default function HomePage() {
  return <>
    <section className="hero container">
      <div>
        <p className="kicker">Wirkungsportal Parlament · Deutscher Bundestag</p>
        <h1>Was steht als Nächstes an – und was könnte es bewirken?</h1>
        <p className="lead">Das Portal macht parlamentarische Entscheidungen verständlich und prüfbar: Was wird entschieden, welche Veränderungen sind plausibel, welche Risiken bleiben – und was lässt sich später tatsächlich beobachten?</p>
        <p className="hero-clarifier"><strong>Wirkungsökonomie, kurz:</strong> Sie fragt nicht nur nach dem Ziel einer Maßnahme, sondern nach den möglichen Veränderungen für Menschen, Umwelt und demokratisches Zusammenleben.</p>
        <div className="hero-actions">
          <Link className="button button--primary" href="/bevorstehend">Anstehende Entscheidungen</Link>
          <Link className="button" href="#so-funktioniert-es">So wird geprüft</Link>
        </div>
      </div>
      <CurrentPriority />
    </section>

    <RecentConclusions />

    <section id="so-funktioniert-es" className="section section--paper">
      <div className="container home-intro-grid">
        <div>
          <p className="kicker">Was ist der Mehrwert?</p>
          <h2>Von der Entscheidung zur überprüfbaren Wirkungsfrage.</h2>
          <p className="lead">Vor einer Entscheidung sprechen wir ehrlich von <strong>Wirkungspotenzial</strong> und <strong>Wirkungsrisiko</strong>. Wirkung selbst ist eine tatsächliche Veränderung eines Zustands – und wird erst später beobachtbar.</p>
          <p>Das Portal verbindet amtliche Fakten mit einer offenen Wirkungslogik: Was ändert die Maßnahme? Wen betrifft sie? Über welchen Mechanismus könnte sich etwas verändern? Welche Daten würden die Annahme stützen oder widerlegen?</p>
        </div>
        <dl className="home-definition-list">
          <div><dt>Maßgebliche Fassung</dt><dd>Was wird tatsächlich beraten oder abgestimmt?</dd></div>
          <div><dt>Wirkpfad</dt><dd>Über welche Schritte könnte sich ein Zustand verändern?</dd></div>
          <div><dt>Prüfgrenze</dt><dd>Was ist belegt, was Annahme und was noch offen?</dd></div>
          <div><dt>Rückkopplung</dt><dd>Woran wird später geprüft, ob die Annahme trägt?</dd></div>
        </dl>
      </div>
    </section>

    <section className="section container" aria-labelledby="benefit-title">
      <div className="section-heading home-section-heading"><div><p className="kicker">Ihr Nutzen</p><h2 id="benefit-title">Orientierung ohne Blackbox.</h2></div></div>
      <div className="home-benefit-grid">
        {benefits.map(([title, text], index) => <article key={title}><span aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>

    <section className="section section--navy" aria-labelledby="trust-title">
      <div className="container home-assurance">
        <div className="home-assurance__intro">
          <p className="kicker">Vertrauensanker</p>
          <h2 id="trust-title">Nicht glauben müssen. Prüfen können.</h2>
          <p>Das Portal verkündet keine politische Wahrheit. Es arbeitet mit dokumentierten Daten, offengelegten Wirkmodellen und klaren Grenzen der Aussagekraft.</p>
        </div>
        <dl className="home-assurance__checks">
          <div><dt>Quellen und Fassungen</dt><dd>Amtliche Unterlagen, Daten und fachliche Quellen bleiben pro Aussage nachvollziehbar.</dd></div>
          <div><dt>Rechenwege und Modelle</dt><dd>Regeln, Referenzwerte und Unsicherheit werden sichtbar – keine erfundenen Punktzahlen.</dd></div>
          <div><dt>Unabhängig und korrigierbar</dt><dd>Parteien und Personen sind keine Bewertungsparameter. Neue Evidenz und Fehler führen zu einer datierten Überprüfung.</dd></div>
          <div><dt>Datensparsam</dt><dd>Kein Werbetracking, keine öffentliche Verhaltensanalyse und keine politische Profilbildung von Besucherinnen oder Besuchern.</dd></div>
        </dl>
        <div className="home-assurance__actions"><Link className="button button--gold" href="/transparenz">Transparenz prüfen</Link><Link className="button button--light" href="/methodik">Methodik verstehen</Link></div>
      </div>
    </section>

    <section className="section section--paper" aria-labelledby="example-title">
      <div className="container home-example">
        <div>
          <p className="kicker">Beispiel zum Einstieg</p>
          <h2 id="example-title">Wie sieht ein Wirkungscheck aus?</h2>
          <p>Der Musterfall zeigt in wenigen Schritten, wie eine geänderte Regel über Zugang, Vollzug und spätere Beobachtung geprüft wird. Er ist ausdrücklich kein realer Bundestagsvorgang.</p>
          <Link className="button" href="/entscheidungen/musterfall-fassungswechsel">Musterfall ansehen</Link>
        </div>
        <ol className="home-example-path">
          <li><strong>Beschluss</strong><span>Was wird in der Fassung verändert?</span></li>
          <li><strong>Annahme</strong><span>Welcher Wirkpfad ist plausibel?</span></li>
          <li><strong>Prüfung</strong><span>Welche Quellen, Risiken und Lücken sind relevant?</span></li>
          <li><strong>Beobachtung</strong><span>Woran würde sich tatsächliche Wirkung später zeigen?</span></li>
        </ol>
      </div>
    </section>

    <section className="section container" aria-labelledby="explore-title">
      <div className="section-heading home-section-heading"><div><p className="kicker">Vertiefen, wenn Sie möchten</p><h2 id="explore-title">Methodik, Quellen und Rückblick.</h2></div></div>
      <div className="home-explore-grid">
        <Link href="/methodik"><strong>Methodik verstehen</strong><span>Wie Wirkung, Risiko, Grenzen und positive Netto-Wirkung getrennt geprüft werden.</span></Link>
        <Link href="/transparenz"><strong>Quellen und Unabhängigkeit</strong><span>Was eine Einordnung trägt, wer sie verantwortet und wie Korrekturen sichtbar werden.</span></Link>
        <Link href="/historie"><strong>Aus Entscheidungen lernen</strong><span>Erwartung, tatsächliche Entscheidung und spätere Beobachtung fair vergleichen.</span></Link>
        <Link href="/mandat-und-umsetzung"><strong>Mandat und Umsetzung</strong><span>Wahlprogramm, Koalitionsvertrag und Beschluss transparent vergleichen – ohne Parteienranking.</span></Link>
      </div>
    </section>
  </>;
}
