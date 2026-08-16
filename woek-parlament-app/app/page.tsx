import Link from "next/link";
import { CaseCard } from "@/app/components/CaseCard";
import { listPublishedCases } from "@/lib/cases";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ modus?: string }> }) {
  const parliamentMode = (await searchParams).modus === "parlament";
  const heroCopy = parliamentMode
    ? {
        eyebrow: "Unabhängiges Portal des Instituts für Wirkungsökonomie",
        title: "Entscheidungen mit Blick auf ihr Wirkungspotenzial vorbereiten.",
        lead: "Politik prüft Folgen bereits heute. Der Parlament-Modus führt diese Betrachtung systemisch weiter: Welche Zustände sollen sich verändern? Welche Neben-, Verteilungs- und Systemwirkungen sind möglich? Was kann vor der Entscheidung noch robuster ausgestaltet werden?",
        primary: "Anstehende Vorgänge prüfen",
        secondary: "Prüfstandard ansehen",
        directionQuestion: "Bringt diese Maßnahme das Ziel näher – oder entfernt sie sich davon?"
      }
    : {
        eyebrow: "Unabhängiges Portal des Instituts für Wirkungsökonomie",
        title: "Von der politischen Absicht zur tatsächlichen Wirkung.",
        lead: "Politik prüft Folgen bereits heute. Das Wirkungsportal führt diese Betrachtung systemisch weiter: Welche Zustände sollen sich verändern? Welche Neben-, Verteilungs- und Systemwirkungen sind möglich? Was verändert sich nach der Umsetzung tatsächlich – und was folgt daraus für die nächste Entscheidung?",
        primary: "Bevorstehende Entscheidungen ansehen",
        secondary: "Wirkungscheck verstehen",
        directionQuestion: "Bringt diese Maßnahme das Ziel näher – oder entfernt sie sich davon?"
      };
  const cases = listPublishedCases();
  const upcomingCases = cases.filter((item) => item.kind === "RADAR");
  const workingActs = cases.filter((item) => item.publicWorkingAct);
  const releasedChecks = cases.filter((item) => item.publicAssessment);
  return (
    <>
      <section className="shell hero-shell">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">{heroCopy.eyebrow}</p>
              <h1>{heroCopy.title}</h1>
              <p className="lead">{heroCopy.lead}</p>
              <p className="hero-independence">Kein Angebot des Deutschen Bundestages, keiner Partei oder Fraktion.</p>
              <div className="hero-actions">
                <Link className="button button-primary" href="/bevorstehend">{heroCopy.primary}</Link>
                <Link className="button button-secondary" href="/methodik">{heroCopy.secondary}</Link>
              </div>
            </div>
            <aside className="hero-education" aria-labelledby="hero-education-title">
              <p className="eyebrow">{parliamentMode ? "Für die parlamentarische Vorbereitung" : "Was ist Wirkungsökonomie?"}</p>
              <h2 id="hero-education-title">{parliamentMode ? "Wirkungspotenzial, Risiken und veränderbare Stellschrauben." : "Nicht nur Ziele zählen. Sondern was sich in der Wirklichkeit verändert."}</h2>
              <p>{parliamentMode ? "Der Modus zeigt, welche Annahmen tragen, welche Daten fehlen und welche Änderung einen möglichen Wirkmechanismus robuster machen könnte." : "Wirkung ist das, was sich tatsächlich verändert. Wirkungsökonomie ergänzt bestehende Folgenprüfungen: Sie verbindet Ausgangslage, Wirkpfad, Zurechnung, Bewertung und Rückkopplung in einem offen nachvollziehbaren Zusammenhang."}</p>
              <div className="hero-direction-test"><span>Die Kernfrage</span><strong>{heroCopy.directionQuestion}</strong></div>
              <ol className="hero-education-steps">
                <li><span>01</span><div><strong>Zustandsveränderung bestimmen</strong><small>Was ist die Ausgangslage? Was verändert sich – für wen, wo und wann?</small></div></li>
                <li><span>02</span><div><strong>Zurechnung prüfen</strong><small>Was lässt sich der Entscheidung zurechnen – und was bleibt unsicher?</small></div></li>
                <li><span>03</span><div><strong>Bewerten und lernen</strong><small>Wie ist die Veränderung einzuordnen – und was folgt für die nächste Entscheidung?</small></div></li>
              </ol>
              <Link className="hero-education-link" href="/methodik#grundlagen">Wirkungsökonomie verständlich erklärt <span aria-hidden="true">→</span></Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="shell section">
        <div className="section-heading">
          <div><p className="eyebrow">Startpunkt</p><h2>Was steht als Nächstes an?</h2></div>
          <Link className="text-link" href="/bevorstehend">Alle bevorstehenden Entscheidungen <span aria-hidden="true">→</span></Link>
        </div>
        {upcomingCases.length > 0 ? <div className="card-grid">{upcomingCases.slice(0, 3).map((item) => <CaseCard item={item} key={item.slug} />)}</div> : <div className="notice notice-neutral"><strong>Der Parlamentsradar zeigt nur prüfrelevante Vorgänge mit belegtem Verfahrensstand.</strong> Er ist kein vollständiger parlamentarischer Kalender. Aufgenommen werden Entscheidungen, deren Reichweite, Dauer, finanzielle Größenordnung, mögliche Irreversibilität oder systemische Folgen eine frühe Prüfung besonders sinnvoll machen.</div>}
      </section>

      <section className="shell quick-orientation" aria-labelledby="orientation-title">
        <div><p className="eyebrow">Was Sie hier bekommen</p><h2 id="orientation-title">Ein verständlicher Zugang zu komplexen parlamentarischen Vorlagen.</h2><p className="orientation-intro">Die amtlichen Dokumente bleiben maßgeblich. Das Portal ordnet sie so, dass Gegenstand, mögliche Folgen, Annahmen, Unsicherheiten und spätere Prüfpunkte leichter nachvollziehbar werden.</p></div>
        <div className="orientation-grid">
          <article><p className="example-label">Verstehen</p><h3>Was steht konkret zur Entscheidung?</h3><p>Wir grenzen Gegenstand, relevante Fassung, Verfahrensstand und amtliche Quellen klar voneinander ab.</p></article>
          <article><p className="example-label">Prüfen</p><h3>Welche Veränderung ist möglich – und unter welchen Bedingungen?</h3><p>Wirkpfade, Betroffene, mögliche Nebenwirkungen, Zielbezug, Grenzen und Datenlücken werden nachvollziehbar dargestellt.</p></article>
          <article><p className="example-label">Nachvollziehen</p><h3>Warum lautet die Einordnung so?</h3><p>Die Kurzfassung bleibt lesbar. Quellen, Annahmen, Rechenweg und Unsicherheit lassen sich bei Bedarf öffnen.</p></article>
        </div>
      </section>

      <section className="shell section impact-architecture" aria-labelledby="impact-architecture-title">
        <div className="section-heading"><div><p className="eyebrow">Wirkungslogik</p><h2 id="impact-architecture-title">Von der Ausgangslage zur überprüfbaren Rückkopplung.</h2></div></div>
        <ol>
          <li><strong>Problem und Zustand</strong><span>Was ist der Ausgangspunkt?</span></li>
          <li><strong>Politisches Ziel</strong><span>Was soll sich verändern?</span></li>
          <li><strong>Instrument und Prüfung</strong><span>Was wird vorgeschlagen und bereits geprüft?</span></li>
          <li><strong>WÖk-Systemcheck</strong><span>Welche Wirkpfade, Risiken und Grenzen sind relevant?</span></li>
          <li><strong>Beobachtung und Zurechnung</strong><span>Was verändert sich tatsächlich – und wodurch?</span></li>
          <li><strong>Bewertung und Lernen</strong><span>Was sollte bei der nächsten Entscheidung anders geschehen?</span></li>
        </ol>
      </section>

      <section className="shell section section-compact mandate-teaser" aria-labelledby="mandate-teaser-title">
        <div className="section-heading"><div><p className="eyebrow">Mandat &amp; Praxis</p><h2 id="mandate-teaser-title">Versprechen, Vereinbarung, Entscheidung – und ihre Wirkung.</h2></div><Link className="text-link" href="/mandat-und-praxis">Bereich öffnen <span aria-hidden="true">→</span></Link></div>
        <p className="lead">Wahlprogramme, Koalitionsvertrag, konkrete Entscheidungen und spätere Beobachtungen werden miteinander verbunden. Die Umsetzungsbilanz bleibt vom WÖk-Wirkungscheck getrennt: Eine umgesetzte Zusage ist nicht automatisch eine positive Netto-Wirkung.</p>
        <p><Link className="text-link" href="/fachanalysen">Auch vertiefende WÖk-Fachanalysen ansehen <span aria-hidden="true">→</span></Link></p>
      </section>

      <section className="shell section section-compact federal-to-states" aria-labelledby="states-teaser-title">
        <div>
          <p className="eyebrow">Wirkungsportal Länder</p>
          <h2 id="states-teaser-title">Wirkung endet nicht an der Bundesebene.</h2>
          <p className="lead">Das Portal wächst auf Länder und später Europa. Den Anfang macht Sachsen-Anhalt: Vor der Landtagswahl werden Wahlprogramme als Quellen erschlossen und ihr Wirkungspotenzial nachvollziehbar gemacht.</p>
          <Link className="text-link" href="/laender">Länderbereich öffnen <span aria-hidden="true">→</span></Link>
        </div>
        <aside>
          <p className="eyebrow">Als Nächstes</p>
          <h3>Landtagswahl Sachsen-Anhalt</h3>
          <p>6. September 2026</p>
          <Link className="button button-primary" href="/laender/sachsen-anhalt">Wahlprogramme im Wirkungscheck</Link>
        </aside>
      </section>

      <section className="shell section section-surface" aria-labelledby="latest-checks-title">
        <div className="section-heading"><div><p className="eyebrow">Aktuelle Wirkungsakten</p><h2 id="latest-checks-title">Was bereits geprüft wird – und was noch offen ist.</h2></div><Link className="text-link" href="/entscheidungen">Alle Wirkungsakten <span aria-hidden="true">→</span></Link></div>
        {workingActs.length > 0 ? <div className="card-grid">{workingActs.filter((item) => item.kind === "RETROSPECTIVE_CASE").slice(0, 3).map((item) => <CaseCard item={item} key={item.slug} />)}</div> : releasedChecks.length > 0 ? <div className="card-grid">{releasedChecks.slice(0, 3).map((item) => <CaseCard item={item} key={item.slug} />)}</div> : <div className="notice"><strong>Der erste vollständige Wirkungscheck erscheint mit Quellen, Wirkpfaden, Annahmen und Grenzen.</strong><p>Das aktuelle Parlamentsradar zeigt bereits amtlich gesicherte, noch veränderbare Vorgänge. Bis eine fachliche Einordnung vorliegt, bleibt klar sichtbar, was geprüft wird und was noch offen ist.</p></div>}
      </section>

      <section className="shell section example-section" aria-labelledby="example-title">
        <div className="section-heading"><div><p className="eyebrow">Einfach erklärt</p><h2 id="example-title">Geld und Maßnahmen sind Mittel. Wirkung ist die Veränderung, die daraus entsteht.</h2></div></div>
        <div className="example-grid">
          <article><p className="example-label">Beispiel</p><h3>Eine Milliarde Euro für Schulgebäude</h3><p>Mit dem Beschluss wird Geld bereitgestellt. Das ist noch keine Wirkung. Erst danach können Schulen saniert oder gebaut werden.</p></article>
          <article><p className="example-label">Der Wirkungscheck fragt</p><h3>Was verändert sich dadurch wirklich?</h3><p>Erreichen die Mittel Schulen mit dem größten Bedarf? Verbessern sich Lernbedingungen, Gesundheit, Barrierefreiheit oder Bildungschancen? Und woran lässt sich das später prüfen?</p></article>
        </div>
      </section>

      <section className="shell section trust-section" aria-labelledby="trust-title">
        <div><p className="eyebrow">Unabhängig und nachvollziehbar</p><h2 id="trust-title">Ein offener Referenzrahmen statt einer versteckten Wertung.</h2><p className="lead">Das Portal wird vom Institut für Wirkungsökonomie herausgegeben. Es ist kein Angebot des Deutschen Bundestages, keiner Partei und keiner Fraktion. SDGs, die offengelegte WÖk-Erweiterung SDG+, Mensch–Planet–Demokratie und der jeweilige Rechtsrahmen werden sichtbar getrennt angewandt. Partei, Fraktion und Mehrheitsprognose bestimmen keine fachliche Einordnung.</p></div>
        <ul>
          <li><strong>Amtliche Fakten getrennt</strong><span>Entscheidungsstand, Fassungen und Abstimmungsergebnisse stammen aus gekennzeichneten Originalquellen. Die WÖk-Analyse bleibt davon sichtbar getrennt.</span></li>
          <li><strong>Keine Blackbox</strong><span>Berechnung, Quellen, Annahmen und Grenzen können auf jeder veröffentlichten Seite geöffnet werden.</span></li>
          <li><strong>Getrennte Maßstäbe</strong><span>SDGs, SDG+, Mensch–Planet–Demokratie und Recht werden nicht zu einer verdeckten Durchschnittsnote verrechnet.</span></li>
          <li><strong>Keine Personenbewertung</strong><span>Das Portal bewertet keine Menschen, Gesinnungen oder politischen Nutzerprofile.</span></li>
        </ul>
        <p><Link className="text-link" href="/transparenz#referenzrahmen">Warum dieser Referenzrahmen? <span aria-hidden="true">→</span></Link></p>
      </section>

      <section className="shell section pillars">
        <div className="section-heading"><div><p className="eyebrow">Vier Säulen</p><h2>Von der bevorstehenden Entscheidung bis zum Lernen aus Wirkung.</h2></div></div>
        <ol className="pillar-list">
          <li><span>01</span><div><h3>Parlamentsradar</h3><p>Welche besonders prüfrelevanten Entscheidungen stehen parlamentarisch an – ausschließlich anhand belegter Quellen.</p></div></li>
          <li><span>02</span><div><h3>Wirkungschecks</h3><p>Welche Veränderung ist beabsichtigt, welche Wirkpfade und Risiken sind plausibel?</p></div></li>
          <li><span>03</span><div><h3>Historische Checks</h3><p>Was war damals bekannt – und welche Veränderungen lassen sich heute beobachten?</p></div></li>
          <li><span>04</span><div><h3>Wirkungsmonitor</h3><p>Wie werden Erkenntnisse in eine überprüfbare Rückkopplung überführt?</p></div></li>
        </ol>
      </section>
    </>
  );
}
