import Link from "next/link";
import { CaseCard } from "@/app/components/CaseCard";
import { EditorialVisual } from "@/app/components/EditorialVisual";
import { GovernmentActionCard } from "@/app/components/government/GovernmentActionCard";
import { listPublishedCases } from "@/lib/cases";
import { getGovernmentPublicData } from "@/lib/government/public-data";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ modus?: string }> }) {
  const parliamentMode = (await searchParams).modus === "parlament";
  const heroCopy = parliamentMode
    ? {
        eyebrow: "Unabhängiges Portal des Instituts für Wirkungsökonomie",
        title: "Von der politischen Absicht zur tatsächlichen Wirkung.",
        lead: "Politik prüft Folgen bereits heute. Der Parlament-Modus führt diese Betrachtung systemisch weiter: Was lässt sich vor einer Abstimmung noch verbessern? Welche Bedingungen, Risiken und offenen Fragen verändern das Wirkungspotenzial? Die politische Entscheidung bleibt beim Parlament.",
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
  const governmentActions = process.env.GOVERNMENT_STAGING === "1"
    ? getGovernmentPublicData().actions.slice(0, 3)
    : [];
  return (
    <>
      <section className="shell hero-shell">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">{heroCopy.eyebrow}</p>
              <h1>{heroCopy.title}</h1>
              <p className="lead">{heroCopy.lead}</p>
              <p className="hero-independence">Kein Angebot des Deutschen Bundestages, keiner Partei oder Fraktion. Folgen weiterdenken. Wirkung überprüfen. Besser nachsteuern.</p>
              <div className="hero-actions">
                <Link className="button button-primary" href="/bevorstehend">{heroCopy.primary}</Link>
                <Link className="button button-secondary" href="/methodik">{heroCopy.secondary}</Link>
              </div>
            </div>
            <aside className="hero-education" aria-labelledby="hero-education-title">
              <p className="eyebrow">{parliamentMode ? "Für die parlamentarische Vorbereitung" : "Was ist Wirkungsökonomie?"}</p>
              <h2 id="hero-education-title">{parliamentMode ? "Wirkungspotenzial, Risiken und veränderbare Stellschrauben." : "Die WÖk ergänzt vorhandene Prüfung – und führt sie weiter."}</h2>
              <p>{parliamentMode ? "Der Modus zeigt, welche Annahmen tragen, welche Daten fehlen und welche Änderung einen möglichen Wirkmechanismus robuster machen könnte." : "Wirkung ist zunächst eine tatsächliche Zustandsveränderung. Die WÖk verbindet bestehende Fach- und Folgenprüfungen über Zeit und Systemgrenzen hinweg: von der Ausgangslage über mögliche Wirkpfade bis zu Beobachtung, Zurechnung und Lernen."}</p>
              <div className="hero-direction-test"><span>Die Kernfrage</span><strong>{heroCopy.directionQuestion}</strong></div>
              <ol className="hero-education-steps">
                <li><span>01</span><div><strong>Bestehende Prüfung einordnen</strong><small>Problem, Ziel, Instrument und fachlicher Kontext.</small></div></li>
                <li><span>02</span><div><strong>Zustände und Wirkpfade prüfen</strong><small>Was könnte sich für wen verändern? Was bleibt offen?</small></div></li>
                <li><span>03</span><div><strong>Später rückkoppeln</strong><small>Was ist beobachtbar – und welcher Beitrag ist belegbar?</small></div></li>
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

      {governmentActions.length > 0 ? (
        <section className="section section-surface government-home-teaser" aria-labelledby="government-home-title">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Regierungshandeln &amp; Wirkung</p>
                <h2 id="government-home-title">Was tut die Bundesregierung - und was war über mögliche Folgen schon bekannt?</h2>
              </div>
              <Link className="text-link" href="/regierung">Regierungsarbeit verfolgen <span aria-hidden="true">→</span></Link>
            </div>
            <p className="lead">Der eigene Regierungsbereich verbindet Kabinettsbeschlüsse und eigenständiges Ressorthandeln mit Parlament, Recht und späterer Umsetzung. Dabei bleibt sichtbar, welche Wirkungspotenziale und Risiken vor dem Handeln aus den damaligen Quellen erkennbar waren - und was sich erst später beobachten oder zurechnen lässt.</p>
            <div className="government-home-principles" aria-label="Prüfschritte der Regierungsakten">
              <span>1. Amtlicher Gegenstand</span>
              <span>2. Damaliger Wissensstand</span>
              <span>3. Umsetzung und Beobachtung</span>
            </div>
            <div className="government-action-grid">
              {governmentActions.map((action) => <GovernmentActionCard key={action.government_action_id} action={action} />)}
            </div>
            <div className="government-home-actions">
              <Link className="button button-primary" href="/regierung">Zum Bereich Regierungshandeln &amp; Wirkung</Link>
              <Link className="button button-secondary" href="/regierung/methodik">So wird der frühere Wissensstand geprüft</Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="shell quick-orientation" aria-labelledby="orientation-title">
        <div><p className="eyebrow">Was Sie hier bekommen</p><h2 id="orientation-title">Ein verständlicher Zugang zu komplexen parlamentarischen Vorlagen.</h2><p className="orientation-intro">Die amtlichen Dokumente und vorhandene Fachprüfungen bleiben maßgeblich. Das Portal verbindet sie so, dass Gegenstand, mögliche Folgen, Annahmen, Unsicherheiten und spätere Prüfpunkte leichter nachvollziehbar werden.</p></div>
        <div className="orientation-grid">
          <article><p className="example-label">Verstehen</p><h3>Was steht konkret zur Entscheidung?</h3><p>Wir grenzen Gegenstand, relevante Fassung, Verfahrensstand und amtliche Quellen klar voneinander ab.</p></article>
          <article><p className="example-label">Feststellen und zurechnen</p><h3>Welche Zustände verändern sich – und welchen Beitrag leistet die Entscheidung?</h3><p>Baseline, Veränderung, Betroffene, Gegenfaktum und Evidenz bleiben getrennt sichtbar. Beobachtung ist noch keine Kausalität.</p></article>
          <article><p className="example-label">Bewerten und lernen</p><h3>Wie wird eine Veränderung eingeordnet?</h3><p>Erst danach folgen Referenzrahmen, Schutzgrenzen und Rückkopplung. Quellen, Annahmen, Rechenweg und Unsicherheit lassen sich öffnen.</p></article>
        </div>
      </section>

      <section className="shell impact-architecture" aria-labelledby="impact-architecture-title">
        <header>
          <p className="eyebrow">Die gemeinsame Wirkungsarchitektur</p>
          <h2 id="impact-architecture-title">Von der Frage zur nächsten, besser prüfbaren Entscheidung.</h2>
          <p>Die WÖk ersetzt keine ministerielle Facharbeit, Gesetzesfolgenabschätzung, Rechtsprüfung, parlamentarische Beratung oder Evaluation. Sie verbindet diese Perspektiven über einen gemeinsamen Wirkungsbegriff und erweitert den Blick auf Systemfolgen und spätere Rückkopplung.</p>
        </header>
        <ol>
          <li><span>01</span><strong>Problem und Ziel</strong><small>Welcher Zustand soll sich verändern?</small></li>
          <li><span>02</span><strong>Instrument und Prüfung</strong><small>Was wird vorgeschlagen, und was ist bereits fachlich oder rechtlich geprüft?</small></li>
          <li><span>03</span><strong>WÖk-Systemcheck</strong><small>Wirkpfade, Betroffene, Verteilung, Grenzen und Alternativen.</small></li>
          <li><span>04</span><strong>Entscheidung und Umsetzung</strong><small>Welche Fassung wurde beschlossen – und was geschieht im Vollzug?</small></li>
          <li><span>05</span><strong>Beobachtung und Zurechnung</strong><small>Was verändert sich? Was wäre ohne die Entscheidung geschehen?</small></li>
          <li><span>06</span><strong>Bewertung und Lernen</strong><small>Wie ist dies am offenen Referenz- und Rechtsrahmen einzuordnen?</small></li>
        </ol>
      </section>

      <EditorialVisual
        src="/visuals/woek/wirkung-und-wirkungspotenzial.svg"
        alt="Infografik: Wirkungspotenzial kann über einen Wirkmechanismus zu beobachtbarer Wirkung führen. Risiken und Schutzgrenzen werden dabei getrennt geprüft."
        eyebrow="Einfach unterscheiden"
        title="Eine Entscheidung kann etwas ermöglichen. Ob sie wirklich etwas verändert, zeigt sich erst später."
        description="Vor einer Abstimmung untersucht das Portal Wirkungspotenzial und Wirkungsrisiken: Was könnte sich verändern, über welchen Weg und unter welchen Voraussetzungen? Nach der Umsetzung wird getrennt beobachtet, was tatsächlich geschieht und was sich der Entscheidung belastbar zurechnen lässt."
        href="/methodik#grundlagen"
        linkLabel="Den Prüfweg verstehen"
      />

      <section className="shell section section-compact mandate-teaser" aria-labelledby="mandate-teaser-title">
        <div className="section-heading"><div><p className="eyebrow">Mandat &amp; Praxis</p><h2 id="mandate-teaser-title">Versprechen, Vereinbarung, Entscheidung – und ihre Wirkung.</h2></div><Link className="text-link" href="/mandat-und-praxis">Bereich öffnen <span aria-hidden="true">→</span></Link></div>
        <p className="lead">Wahlprogramme und Koalitionsvertrag werden mit konkreten, amtlich belegten Entscheidungen verbunden. So wird sichtbar, was aus einer politischen Absicht in eine maßgebliche Fassung, Umsetzung und später beobachtbare Zustandsveränderung wird. Eine umgesetzte Zusage ist nicht automatisch eine positive Netto-Wirkung.</p>
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
        <div><p className="eyebrow">Unabhängig und nachvollziehbar</p><h2 id="trust-title">Ein offener Referenzrahmen – keine versteckte Parteibewertung.</h2><p className="lead">Das Portal wird vom Institut für Wirkungsökonomie herausgegeben. Es ist kein Angebot des Deutschen Bundestages, keiner Partei und keiner Fraktion. Die Agenda 2030 und ihre 17 SDGs bilden einen international anschlussfähigen Ziel- und Referenzrahmen. SDG+ ist eine offen ausgewiesene WÖk-Erweiterung, keine UN-Kategorie. Mensch – Planet – Demokratie ordnet Wirkungsräume; Grundrechte, Staatsziele und Fachrecht bleiben eine getrennte rechtliche Ebene.</p></div>
        <ul>
          <li><strong>Amtliche Fakten getrennt</strong><span>Entscheidungsstand, Fassungen und Abstimmungsergebnisse stammen aus gekennzeichneten Originalquellen. Die WÖk-Analyse bleibt davon sichtbar getrennt.</span></li>
          <li><strong>Keine Blackbox</strong><span>Berechnung, Quellen, Annahmen und Grenzen können auf jeder veröffentlichten Seite geöffnet werden.</span></li>
          <li><strong>Gemeinsamer Maßstab</strong><span>Erst werden Zustandsveränderungen festgestellt und – soweit möglich – zugerechnet. Danach werden sie an SDGs, SDG+, Mensch – Planet – Demokratie sowie dem getrennt ausgewiesenen Rechtsrahmen eingeordnet.</span></li>
          <li><strong>Keine Personenbewertung</strong><span>Das Portal bewertet keine Menschen, Gesinnungen oder politischen Nutzerprofile.</span></li>
        </ul>
        <p><Link className="text-link" href="/transparenz#referenzrahmen">Warum dieser Referenzrahmen? <span aria-hidden="true">→</span></Link></p>
      </section>

      <section className="shell section pillars">
        <div className="section-heading"><div><p className="eyebrow">Vier Säulen</p><h2>Von der bevorstehenden Entscheidung bis zum Lernen aus Wirkung.</h2></div></div>
        <ol className="pillar-list">
          <li><span>01</span><div><h3>Parlamentsradar</h3><p>Welche besonders prüfrelevanten Entscheidungen stehen parlamentarisch an – ausschließlich anhand belegter Quellen.</p></div></li>
          <li><span>02</span><div><h3>Wirkungschecks</h3><p>Welche Veränderung ist beabsichtigt, welche Wirkpfade und Risiken sind plausibel?</p></div></li>
          <li><span>03</span><div><h3>Politisches Wirkungsgedächtnis</h3><p>Was war damals bekannt – und welche Veränderungen lassen sich heute beobachten?</p></div></li>
          <li><span>04</span><div><h3>Wirkungsmonitor</h3><p>Wie werden Erkenntnisse in eine überprüfbare Rückkopplung für die nächste Entscheidung überführt?</p></div></li>
        </ol>
      </section>
    </>
  );
}
