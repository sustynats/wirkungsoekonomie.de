import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CaseCard } from "@/app/components/CaseCard";
import { EditorialVisual } from "@/app/components/EditorialVisual";
import { DecisionReadinessGate } from "@/app/components/DecisionReadinessGate";
import { listPublishedCases } from "@/lib/cases";
import { indicatorFunctions, portalMethodSourceUrls, portalUsp } from "@/lib/content/portal-usp";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

const sectionCopy: Record<string, { eyebrow: string; title: string; lead: string; empty: string }> = {
  bundestag: { eyebrow: "Deutscher Bundestag", title: "Entscheidungen des Bundestages verständlich prüfen", lead: "Ein unabhängiges Portal des Instituts für Wirkungsökonomie zu Entscheidungen des Deutschen Bundestages. Amtliche Tatsachen und eigene fachliche Einordnung bleiben dabei klar getrennt.", empty: "Sobald ein Vorgang die Veröffentlichungsprüfung erfüllt, erscheint er hier mit Quellen und nachvollziehbarem Status." },
  bevorstehend: { eyebrow: "Parlamentsradar", title: "Bevorstehende Entscheidungen mit hoher Prüfrelevanz", lead: "Der Parlamentsradar ist kein vollständiger parlamentarischer Kalender. Er zeigt Vorgänge, die wegen Reichweite, Dauer, finanzieller Größenordnung, möglicher Irreversibilität oder systemischer Folgen besonders sorgfältig geprüft werden sollten.", empty: "Sobald ein prüfrelevanter Vorgang mit belegtem Verfahrensstand vorliegt, erscheint er hier." },
  "im-verfahren": { eyebrow: "Parlamentsradar", title: "Laufende parlamentarische Verfahren", lead: "Jeder Verfahrensschritt wird nur angezeigt, wenn er durch eine parlamentarische Originalquelle belegt ist. Der Stand des Verfahrens und der Stand der WÖk-Analyse werden getrennt gezeigt.", empty: "Sobald ein laufendes Verfahren die Veröffentlichungsprüfung erfüllt, erscheint es hier." },
  entscheidungen: { eyebrow: "Wirkungschecks", title: "Vorgänge und Wirkungschecks", lead: "Jede Seite zeigt getrennt, was amtlich belegt ist, welche Fragen die WÖk untersucht und was noch offen ist. Erst mit belastbaren Quellen, Annahmen und Grenzen wird eine fachliche Einordnung veröffentlicht.", empty: "Veröffentlichte Wirkungschecks erscheinen hier mit ihrer Quellen-, Analyse- und Evidenzlage." },
  historie: { eyebrow: "Historische Wirkungschecks", title: "Damals entscheiden. Heute lernen.", lead: "Historische Checks stellen zwei Perspektiven nebeneinander: Was war zum Zeitpunkt der Entscheidung bekannt? Und was lässt sich heute beobachten und der Entscheidung belastbar zurechnen? Späteres Wissen wird nicht als damaliges Wissen ausgegeben.", empty: "Der historische Bereich erläutert die Rückschau-Methode. Veröffentlichte Fälle ergänzen den Zeitstrahl mit Quellen, Beobachtungen und Lernpunkten." },
  monitor: { eyebrow: "Wirkungsmonitor", title: "Nach einer Entscheidung beobachten und lernen", lead: "Monitoring sammelt fortlaufend Daten. Eine spätere Evaluation prüft zusätzlich, warum sich etwas verändert hat und welchen Beitrag eine Entscheidung dazu geleistet hat. Eine einzelne Kennzahl ist deshalb noch kein Wirkungsnachweis.", empty: "Monitorfälle erscheinen mit Ausgangswert, Datenquelle, erwarteter Veränderung, Beobachtungszeitraum und einem Anlass für die erneute Prüfung." },
  werkzeuge: { eyebrow: "Werkzeugkasten", title: "WÖk-Werkzeuge für die parlamentarische Prüfung", lead: "Das Portal verlinkt auf bestehende Methoden und zeigt ihren Reifegrad. Eine Demo ist keine automatische Fachentscheidung.", empty: "Die verbindliche Zuordnung zum führenden WÖMS 2.0 wird kontrolliert importiert." },
  methodik: { eyebrow: "Entscheidungsstandard", title: "Wirkungspfade, Optionen und Reality Check", lead: portalUsp.lead, empty: "Die Methodik ist offen dokumentiert und wird je Veröffentlichung versioniert." },
  transparenz: { eyebrow: "Über das Portal", title: "Vertrauen entsteht durch nachvollziehbare Arbeit", lead: "Wer das Portal herausgibt, wie es bestehende staatliche Prüfungen einordnet, was die WÖk zusätzlich leistet - und wo ihre Grenzen liegen.", empty: "Die Angaben zum Portal werden fortlaufend ergänzt und versioniert." }
};

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section === "dialog") redirect("/");
  const content = sectionCopy[section];
  if (!content) notFound();
  const cases = listPublishedCases().filter((item) => {
    if (section === "bevorstehend" || section === "im-verfahren") return item.kind === "RADAR";
    if (section === "historie") return item.retrospective;
    if (section === "entscheidungen" || section === "bundestag") return true;
    return false;
  });
  const hasStandaloneContent = ["methodik", "transparenz", "werkzeuge", "monitor"].includes(section);
  return (
    <div className="shell content-page">
      <header className="page-intro"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p className="lead">{content.lead}</p></header>
      {section === "methodik" && <Methodology />}
      {section === "transparenz" && <Transparency />}
      {section === "werkzeuge" && <Toolbox />}
      {section === "monitor" && <Monitor />}
      {cases.length > 0 ? <div className="card-grid">{cases.map((item) => <CaseCard item={item} key={item.slug} />)}</div> : !hasStandaloneContent && <div className="notice"><strong>{content.empty}</strong></div>}
      <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
    </div>
  );
}

function Methodology() {
  return <>
    <section className="notice notice-neutral" id="grundlagen"><strong>{portalUsp.lead}</strong><p>{portalUsp.context}</p></section>
    <section className="transparency-list" aria-label="Bestehende staatliche Prüfung und zusätzlicher WÖk-Beitrag">
      <article><h2>Was der Staat bereits prüft</h2><p>Die Gesetzesfolgenabschätzung des Bundes betrachtet beabsichtigte Wirkungen und unbeabsichtigte Nebenwirkungen. Andere Lösungsmöglichkeiten gehören ebenfalls in die Begründung. Die Nachhaltigkeitsprüfung untersucht zudem, welche Ziele und Prinzipien der Deutschen Nachhaltigkeitsstrategie berührt werden.</p><p><Link href={sourceDetailHrefForUrl(portalMethodSourceUrls.ggo)}>GGO §§ 43 und 44 in der Quellenakte</Link> · <Link href={sourceDetailHrefForUrl(portalMethodSourceUrls.dnsGovernance)}>DNS-Steuerung in der Quellenakte</Link></p></article>
      <article><h2>Was WÖk zusätzlich verbindet</h2><p>{portalUsp.safeUsp}</p><p>Das ist eine methodische WÖk-Synthese aus den offengelegten amtlichen Quellen - kein Zitat einer Behörde und kein Angriff auf bestehende Verfahren.</p></article>
    </section>
    <section className="notice"><strong>Was ist ein WÖk-Wirkungscheck?</strong><p>Ein WÖk-Wirkungscheck fragt nicht nur, welche Ziele ein Vorhaben berührt. Er fragt, <strong>was sich wodurch verändern soll</strong>. Vor der Umsetzung sind das überprüfbare Wirkungspotenziale und Wirkungsrisiken - keine behaupteten Erfolge. Nach der Umsetzung werden dieselben Annahmen mit realen Daten, Gegenfaktum und Evidenz erneut geprüft.</p></section>
    <section className="method-grid" aria-label="WÖk-Wirkpfad A M Delta Z R">
      <article><span>A</span><h2>Auslöser</h2><p>Was ändert die Entscheidung konkret an Regeln, Ressourcen, Preisen, Rechten, Risiken oder Kapazitäten?</p></article>
      <article><span>M</span><h2>Mechanismus</h2><p>Warum kann die Änderung Verhalten, Institutionen, Märkte oder ökologische Systeme beeinflussen?</p></article>
      <article><span>ΔZ</span><h2>Zustandsänderung</h2><p>Welcher reale und möglichst beobachtbare Zustand könnte sich für wen, wo und wann verändern?</p></article>
      <article><span>R</span><h2>Referenz</h2><p>Gegen welches Ziel, Schutzgut oder welche Grenze wird diese Veränderung eingeordnet?</p></article>
    </section>
    <section className="notice notice-neutral" aria-label="Formeln zur Beobachtung und Zurechnung"><strong><code>{portalUsp.pathFormula}</code></strong><p>Fehlt ein Glied, entsteht keine scheinpräzise Wirkungsbehauptung. Eine beobachtete Veränderung ist zunächst <code>{portalUsp.observedChange}</code>. Erst ein tragfähiges Gegenfaktum erlaubt vereinfacht <code>{portalUsp.causalEffect}</code>. Wo kausale Identifikation nicht seriös möglich ist, bleibt die Zurechnung offen oder wird als plausible Contribution ausgewiesen.</p></section>
    <section className="trust-principles" aria-label="Datenfunktionen im WÖk-Wirkungscheck">
      {indicatorFunctions.map(([code, description], index) => <article key={code}><span>{String(index + 1).padStart(2, "0")}</span><h2><code>{code}</code></h2><p>{description}</p></article>)}
    </section>
    <section className="notice"><strong>Output ist noch kein Outcome.</strong><p>Ein Fördervolumen zeigt Input oder Umsetzung. Die Zahl geförderter Anlagen ist ein Output. Erst eine relevante Zustandsänderung und ihre belastbare Zurechnung beantworten die Wirkungsfrage. Deshalb erhält jeder Indikator eine sichtbare Funktion.</p></section>
    <section className="transparency-list" aria-label="Konkretes Messbeispiel Netzanschluss">
      <article><h2>Beispiel: schnellere Netzanschlüsse</h2><p><strong>A:</strong> Verfahren werden standardisiert und Anschlussfristen verkürzt. <strong>M:</strong> Wartezeiten und Planungsunsicherheit sinken. <strong>ΔZ:</strong> Bereits geplante erneuerbare Anlagen können früher tatsächlich einspeisen. <strong>R:</strong> Stromsystem, Klima, Versorgung und Resilienz.</p></article>
      <article><h2>Was der Reality Check messen müsste</h2><p>Bearbeitungszeiten bilden die Baseline. Fristgerecht bearbeitete Anträge zeigen Umsetzung. Angeschlossene Leistung ist Output. Tatsächlich zusätzlich eingespeister erneuerbarer Strom ist Outcome. Vergleichsregionen und Vortrends helfen beim Gegenfaktum; Netzengpässe und Systemstabilität bleiben Schutz- und Systemindikatoren.</p></article>
    </section>
    <section className="notice notice-neutral"><strong>WÖk-Handlungsoption</strong><p>Die Analyse fragt - soweit die Evidenz reicht - auch, welche realistische Entscheidung oder Ausgestaltung voraussichtlich wirksamer wäre. Ausgangspunkt ist nicht ein Score, sondern der Problemzustand und sein bindender Engpass. Verglichen werden Wirkmechanismen, Kaskaden, Verteilung, Resilienz, Reversibilität, Recht, Kompetenz, Umsetzbarkeit und Schutzgrenzen. Wenn keine robuste Präferenz möglich ist, bleibt genau das sichtbar.</p><p>Bei rückblickenden Entscheidungen gilt der damalige Wissensstand. Spätere Evidenz darf den Reality Check und eine heutige RecommendationVersion verändern, aber nicht rückwirkend als damals bekannt erscheinen.</p></section>
    <section className="method-grid method-grid--three" aria-label="Wirkung feststellen, zurechnen und bewerten">
      <article><span>01</span><h2>Zustandsveränderung feststellen</h2><p>Welche Baseline gilt? Was verändert sich bei wem, wo, wann und in welchem Umfang? Eine beobachtete Veränderung ist zunächst noch keine kausal belegte Wirkung.</p></article>
      <article><span>02</span><h2>Zurechnung prüfen</h2><p>Was wäre ohne die Entscheidung wahrscheinlich geschehen? Das Portal unterscheidet direkte Zurechnung, plausiblen Beitrag, systemische Mitwirkung und derzeit unklare Zusammenhänge.</p></article>
      <article><span>03</span><h2>Veränderung bewerten</h2><p>Erst danach wird gefragt, wie die festgestellte oder modellierte Veränderung am offengelegten Ziel-, Schutz- und Rechtsrahmen einzuordnen ist.</p></article>
    </section>
    <div id="entscheidungsreife"><DecisionReadinessGate /></div>
    <EditorialVisual
      src="/visuals/woek/parlamentarische-wirkungspruefung.svg"
      alt="Infografik zum Ablauf einer parlamentarischen Wirkungsprüfung: politisches Ziel, bestehende Prüfung und WÖk-Systemcheck, Umsetzung und Rückkopplung."
      eyebrow="Vom Beschluss zum Lernen"
      title="Ein Beschluss ist der Anfang eines Wirkpfads – nicht sein Ergebnis."
      description="Die Grafik zeigt die durchgängige Wirkungslogik: Ziele, vorhandene Prüfungen und Rahmenbedingungen sichtbar machen, mögliche Wirkungen und Risiken getrennt prüfen, Umsetzung und Ressourcen betrachten und später anhand von Daten zurückkoppeln. Jede Stufe bleibt mit Quellen und Annahmen nachvollziehbar."
    />
    <section className="method-grid">
      <article><span>A</span><h2>Vorwirkung</h2><p>Was soll entschieden werden? Welche Veränderung könnte möglich sein, welches Risiko besteht – und warum? Der begründete mögliche Weg heißt Wirkmechanismus.</p></article>
      <article><span>B</span><h2>Wirkungsermittlung</h2><p>Was geschieht tatsächlich? Wer setzt die Entscheidung um, was wird unmittelbar erreicht und welche Zustände verändern sich beobachtbar?</p></article>
      <article><span>C</span><h2>Evidenz &amp; Zurechnung</h2><p>Woher wissen wir das? Daten, Ausgangswert, Vergleichsfrage, Studien und Unsicherheit zeigen, wie belastbar eine Aussage ist und welchen Beitrag die Entscheidung geleistet haben könnte.</p></article>
      <article><span>D</span><h2>Bewertung</h2><p>Wie wird eine festgestellte oder modellierte Veränderung eingeordnet? Der Maßstab ist offengelegt: SDGs, die WÖk-Erweiterung SDG+, Mensch – Planet – Demokratie sowie der getrennt ausgewiesene Rechtsrahmen.</p></article>
      <article><span>E</span><h2>Schutz &amp; Systemprüfung</h2><p>Welche Neben-, Verteilungs- und Wechselwirkungen sind möglich? Zielkonflikte können abgewogen werden. Wirkungsgrenzen nicht.</p></article>
      <article><span>F</span><h2>Rückkopplung &amp; Lernen</h2><p>Was folgt daraus? Daten können eine erneute Prüfung auslösen. Dann lassen sich Regeln, Finanzierung, Vollzug oder die Entscheidung selbst gezielt verändern.</p></article>
    </section>
    <section className="notice"><strong>Unsicherheit bleibt sichtbar.</strong><p>Eine Ex-ante-Analyse kann die Zukunft nicht beweisen. Sie macht Annahmen, Risiken, mögliche Wirkmechanismen und Datenbedarf sichtbar. Nach einer Entscheidung zeigt eine Beobachtung noch nicht automatisch Ursache und Wirkung. Zurechnung wird nur so genau angegeben, wie die Datenlage es erlaubt.</p></section>
    <section className="notice notice-neutral"><strong>Keine einfache Gesamtpunktzahl.</strong><p>Unterschiedliche Wirkungen werden nicht blind zusammengerechnet. Zielkonflikte können abgewogen werden. Schwere Schäden an Schutzgütern dürfen jedoch nicht durch Vorteile in anderen Bereichen unsichtbar werden. Methodische Referenzen und Regeln werden je Veröffentlichung mit Versionsstand, Quellen und Geltungsbereich ausgewiesen.</p></section>
    <section className="notice"><strong>Anschluss an bestehende Wirkungsmodelle.</strong><p>Die Wirkungsökonomie erfindet etablierte Wirkungsinstrumente nicht neu. Sie ordnet sie dort ein, wo sie eine Teilfrage beantworten, und verbindet Wirkungsermittlung, Evidenz, Bewertung, Schutzgrenzen, Systemwirkung und Rückkopplung zu einer gemeinsamen Steuerungsarchitektur.</p></section>
    <section className="transparency-list" aria-label="Amtliche Quellen zur Methodikabgrenzung">
      <article><h2>Amtliche Grundlagen</h2><ul><li><Link href={sourceDetailHrefForUrl(portalMethodSourceUrls.ggo)}>GGO §§ 43 und 44</Link></li><li><Link href={sourceDetailHrefForUrl(portalMethodSourceUrls.dnsGovernance)}>Steuerung der Deutschen Nachhaltigkeitsstrategie</Link></li><li><Link href={sourceDetailHrefForUrl(portalMethodSourceUrls.enapReview)}>Amtlicher eNAP-Erfahrungsbericht 2023</Link></li></ul></article>
      <article><h2>Monitoring und Weiterentwicklung</h2><ul><li><Link href={sourceDetailHrefForUrl(portalMethodSourceUrls.destatisIndicators)}>Destatis-Nachhaltigkeitsindikatoren</Link></li><li><Link href={sourceDetailHrefForUrl(portalMethodSourceUrls.sustainabilityActionPlan)}>Aktionsplan Nachhaltigkeit - Stand Juli 2026</Link></li></ul><p>Die staatliche Praxis entwickelt sich selbst weiter. Der Beteiligungsstand vom Juli 2026 richtet den Aktionsplan stärker auf Wirkung, Handeln und konkrete Ergebnisse aus.</p></article>
    </section>
  </>;
}

function Transparency() {
  return <div className="trust-center">
    <section className="trust-statement" aria-labelledby="trust-statement-title">
      <div><p className="eyebrow">Der Anspruch</p><h2 id="trust-statement-title">Unabhängig einordnen. Selbst prüfen können.</h2></div>
      <p>Das Wirkungsportal Parlament wird vom Institut für Wirkungsökonomie herausgegeben. Es ist kein Angebot des Deutschen Bundestages, keiner Partei und keiner Fraktion. {portalUsp.context} Grundlage sind offengelegte Quellen, Annahmen, Wissensstände und Grenzen.</p>
    </section>

    <section className="transparency-list" aria-label="Einordnung staatlicher Verfahren und WÖk-USP">
      <article><h2>Bestehende Verfahren anerkennen</h2><p>GFA, Nachhaltigkeitsprüfung, eNAP, DNS-Indikatoren und Destatis-Monitoring sind wichtige staatliche Bausteine. Ein Zielbezug oder ein veränderter Indikator zeigt jedoch für sich allein noch keine kausale Wirkung eines einzelnen Gesetzes.</p><p><Link href={sourceDetailHrefForUrl(portalMethodSourceUrls.ggo)}>GGO-Quellenakte</Link> · <Link href={sourceDetailHrefForUrl(portalMethodSourceUrls.destatisIndicators)}>Destatis-Quellenakte</Link></p></article>
      <article><h2>Zusätzliche WÖk-Architektur</h2><p>{portalUsp.safeUsp}</p><p>WÖk informiert demokratische Entscheidung. Sie ersetzt sie nicht und erzeugt weder eine automatische Gesamtnote noch eine Empfehlung aus der Zahl positiver und negativer Pfade.</p></article>
    </section>

    <section className="trust-principles" aria-label="Grundsätze des Wirkungsportals">
      <article><span>01</span><h2>Parteiunabhängig</h2><p>Partei, Fraktion, Regierungs- oder Oppositionsstatus bestimmen keine fachliche Einordnung. Gleiche Quellen, Regeln und Annahmen sollen zu reproduzierbaren Ergebnissen führen. Wo fachliches Ermessen nötig ist, wird es begründet.</p></article>
      <article><span>02</span><h2>Wertmaßstab offengelegt</h2><p>Der Maßstab ist kein Parteiprogramm und keine private Präferenz. Agenda 2030 und die 17 SDGs bilden den internationalen Ausgangsrahmen. SDG+ ist eine offengelegte Erweiterung der Wirkungsökonomie; Rechtsrahmen und Tatsachen bleiben davon getrennt sichtbar.</p></article>
      <article><span>03</span><h2>Quellen zuerst</h2><p>Parlamentarischer Stand, Fassungen und Abstimmungsergebnisse beruhen vorrangig auf amtlichen Originalquellen. Jede veröffentlichte Aussage verweist auf ihre Grundlage.</p></article>
      <article><span>04</span><h2>Keine Blackbox</h2><p>Berechnungen zeigen Eingangswerte, Gegenfaktum, Formel, Annahmen, Unsicherheit und methodische Version. Nicht belastbar Quantifizierbares bleibt sichtbar offen.</p></article>
    </section>

    <section className="reference-framework" id="referenzrahmen" aria-labelledby="reference-framework-title">
      <div className="reference-framework-intro">
        <p className="eyebrow">Der Maßstab</p>
        <h2 id="reference-framework-title">Woran wird eine Veränderung bewertet?</h2>
          <p className="lead">Zuerst werden Zustände, Veränderung, Reichweite und – soweit möglich – der Beitrag einer Entscheidung ermittelt. Erst dann wird gefragt, ob diese Veränderung wünschenswert, schädlich oder ambivalent ist. Dafür verwendet das Portal einen offengelegten Referenzrahmen, keinen Parteimaßstab.</p>
      </div>
      <section className="trust-principles" aria-label="Vier getrennte Ebenen des Referenzrahmens">
        <article><span>01</span><h2>SDGs</h2><p>Die 17 Ziele der Vereinten Nationen sind ein international anschlussfähiger politischer Ziel- und Referenzrahmen. Sie sind keine vollständige Wirkungsmethode und keine Rechtsnorm.</p></article>
        <article><span>02</span><h2>SDG+</h2><p>SDG+ ist eine transparente Erweiterung der Wirkungsökonomie, keine offizielle UN-Kategorie. Demokratie und Rechtsstaatlichkeit fehlen in den SDGs nicht: SDG 16 erfasst wichtige institutionelle Dimensionen. SDG+ macht weitere WÖk-Prüffelder sichtbar.</p></article>
        <article><span>03</span><h2>Mensch – Planet – Demokratie</h2><p>Diese Ordnung strukturiert Wirkungsräume; sie ist keine Summe aus drei frei verrechenbaren Säulen. Demokratie ist auch Schutz- und Korrekturraum.</p></article>
        <article><span>04</span><h2>Recht</h2><p>Grundrechte, Verfassungsprinzipien, Staatsziele, Schutzpflichten und Fachrecht bleiben als eigene rechtliche Ebene sichtbar. Das Portal erstellt kein Rechtsgutachten.</p></article>
      </section>
      <div className="reference-framework-grid">
        <article>
          <p className="reference-number">01</p>
          <h3>Agenda 2030 und SDGs: global vereinbart</h3>
          <p>Die Agenda 2030 ist der internationale Rahmen. Ihre 17 Nachhaltigkeitsziele wurden von den 193 Mitgliedstaaten der Vereinten Nationen vereinbart. Die Verpflichtung trägt damit die Bundesrepublik Deutschland als Staat; eine Regierung setzt sie jeweils um, ist aber nicht der Ursprung dieses Maßstabs.</p>
          <div className="reference-links"><Link href="/quellen/agenda-2030-sdgs">Agenda 2030 einordnen <span aria-hidden="true">→</span></Link></div>
        </article>
        <article>
          <p className="reference-number">02</p>
          <h3>Bundesrepublik: national verankert</h3>
          <p>Die Bundesrepublik Deutschland setzt die Agenda 2030 über die Deutsche Nachhaltigkeitsstrategie um. Das Portal ordnet deutsche Bundesfälle daran ein – als dokumentierte staatliche Verpflichtung, nicht als Etikett einer einzelnen Regierung.</p>
          <div className="reference-links"><Link href="/quellen/deutschland-agenda-2030">Deutschen Bezug ansehen <span aria-hidden="true">→</span></Link></div>
        </article>
        <article>
          <p className="reference-number">03</p>
          <h3>Länder: konkret und einzeln belegt</h3>
          <p>Die Länder tragen die Umsetzung in ihren Zuständigkeiten mit. Ihre Nachhaltigkeitsstrategien und Indikatorensysteme haben jedoch nicht überall denselben Stand. Deshalb weist jeder Landescheck das konkrete Commitment, die Strategie und die Datenbasis des jeweiligen Landes aus – statt eine einheitliche Landeslage zu behaupten.</p>
          <div className="reference-links"><Link href="/quellen/nachhaltigkeitsstrategien-bundeslaender">Länderbezug verstehen <span aria-hidden="true">→</span></Link></div>
        </article>
        <article>
          <p className="reference-number">04</p>
          <h3>Europäische Union: eigener Auftrag</h3>
          <p>Die EU hat nachhaltige Entwicklung in ihren Verträgen verankert und sich zur Agenda 2030 bekannt. EU-Fälle werden deshalb nicht unter Bundespolitik eingeordnet, sondern zusätzlich an den europäischen Rechts- und Verfahrensrahmen gebunden.</p>
          <div className="reference-links"><Link href="/quellen/eu-agenda-2030-nachhaltige-entwicklung">EU-Bezug ansehen <span aria-hidden="true">→</span></Link></div>
        </article>
        <article>
          <p className="reference-number">05</p>
          <h3>SDG+: Voraussetzungen sichtbar machen</h3>
          <p>Die Agenda 2030 enthält bereits Ziele zu Frieden, Gerechtigkeit und starken Institutionen. SDG+ ist zusätzlich eine offen ausgewiesene Erweiterung der Wirkungsökonomie: Sie macht Voraussetzungen wie Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen und digitale Selbstbestimmung genauer prüfbar. SDG+ ist keine UN-Kategorie.</p>
          <div className="reference-links"><Link href="/quellen/sdg-plus-referenzrahmen">SDG+ verstehen <span aria-hidden="true">→</span></Link></div>
        </article>
        <article>
          <p className="reference-number">06</p>
          <h3>Staatsziele und Schutzaufträge</h3>
          <p>Für deutsche Fälle kommt der Verfassungsrahmen hinzu: Grundrechte, Staatsstrukturprinzipien, Staatsziele und Schutzaufträge. Dazu gehören tatsächliche Gleichberechtigung, natürliche Lebensgrundlagen und ausdrücklich auch Tierschutz. Tierwohl und Biodiversität werden getrennt geprüft. Das ist keine zusätzliche SDG+-Dimension und kein Rechtsgutachten.</p>
          <div className="reference-links"><Link href="/quellen/grundgesetz-bundesrepublik-deutschland">Grundgesetz und Schutzrahmen ansehen <span aria-hidden="true">→</span></Link><Link href="/quellen/eu-vertraege-und-grundrechte">EU-Rechtsrahmen ansehen <span aria-hidden="true">→</span></Link></div>
        </article>
        <article>
          <p className="reference-number">07</p>
          <h3>Der Richtungstest</h3>
          <p>Jeder Check fragt: Welches Ziel oder Schutzgut ist betroffen? Wie ist die Ausgangslage? Führt die Maßnahme plausibel näher zum Ziel, weiter davon weg oder bleibt das offen? Der Rahmen wird nicht in eine magische Gesamtnote verwandelt. Wo Daten, Gegenfaktum oder Zurechnung nicht reichen, steht ausdrücklich: nicht belastbar quantifizierbar.</p>
          <Link href="/methodik#grundlagen">So wird ein Wirkungscheck aufgebaut <span aria-hidden="true">→</span></Link>
        </article>
      </div>
      <aside className="reference-framework-boundary"><strong>Wichtig:</strong> Der Referenzrahmen bereitet eine Entscheidung vor, er ersetzt sie nicht. Unterschiedliche demokratische Wege und Abwägungen bleiben möglich. Schwere Schäden an Schutzgütern werden zudem nicht durch Vorteile in anderen Bereichen einfach verrechnet.</aside>
    </section>
    <EditorialVisual
      src="/visuals/woek/sdg-sdgplus-referenzrahmen.png"
      alt="Grafik des Referenzrahmens mit den 17 Nachhaltigkeitszielen und den zusätzlichen WÖk-Prüffeldern Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlicher Zusammenhalt und digitale Selbstbestimmung."
      eyebrow="Der Referenzrahmen im Bild"
      title="SDGs geben Ziele vor. SDG+ macht Voraussetzungen demokratischer Handlungsfähigkeit sichtbar."
      description="Die Darstellung ist ein Kompass, keine Punktekarte. In jeder Akte werden nur tatsächlich berührte SDGs, SDG+-Prüffelder sowie einschlägige Grundrechte, Staatsziele und Schutzaufträge einzeln ausgewiesen. Tierschutz, Biodiversität und andere Schutzgüter werden nicht in einer Gesamtzahl versteckt."
      href="/quellen/sdg-plus-referenzrahmen"
      linkLabel="Referenzrahmen mit Quelle ansehen"
      reversed
    />

    <section className="trust-workflow" aria-labelledby="trust-workflow-title">
      <div><p className="eyebrow">So arbeitet das Portal</p><h2 id="trust-workflow-title">Ein Wirkungscheck ist kein Schnellurteil.</h2></div>
      <ol>
        <li><span>01</span><div><strong>Amtliche Entscheidung sichern</strong><p>Welche finale Fassung lag vor? Was wurde tatsächlich entschieden? Wie war der Verfahrensstand?</p></div></li>
        <li><span>02</span><div><strong>Wirkmechanismen und Evidenz prüfen</strong><p>Ausgangslage, mögliche Wege zur Veränderung, Betroffene, Risiken, Vergleichsfrage und Datenlücken werden getrennt erfasst.</p></div></li>
        <li><span>03</span><div><strong>Nachvollziehbar einordnen</strong><p>Regeln und gegebenenfalls reproduzierbare Berechnungen werden auf die dokumentierte Evidenz angewendet.</p></div></li>
        <li><span>04</span><div><strong>Fachlich einordnen und später prüfen</strong><p>Eine Einordnung bleibt mit ihren Quellen, Annahmen und Grenzen nachvollziehbar. Neue Daten können eine sichtbare Korrektur auslösen.</p></div></li>
      </ol>
    </section>

    <section className="method-grid" aria-label="Status einer veröffentlichten Aussage">
      <article><span>01</span><h2>Parlamentarischer Status</h2><p>Was im Verfahren geschieht: etwa Entwurf veröffentlicht, Ausschussberatung, Abstimmung angekündigt oder beschlossen.</p></article>
      <article><span>02</span><h2>Stand der WÖk-Analyse</h2><p>Ob Quellen geprüft werden, Wirkpfade analysiert werden, eine Gegenprüfung läuft oder eine Einordnung veröffentlicht ist.</p></article>
      <article><span>03</span><h2>Evidenzstatus</h2><p>Ob es sich um einen amtlichen Fakt, empirisch gut belegte Erkenntnis, plausiblen Wirkpfad, Modellannahme oder eine offene Frage handelt.</p></article>
      <article><span>04</span><h2>Korrekturen</h2><p>Neue Daten oder berechtigte Einwände führen zu einer sichtbaren Prüfung und einer nachvollziehbaren Änderung – nie zu einem stillen Austausch.</p></article>
    </section>

    <section className="transparency-list" aria-label="Betrieb, Datenschutz und Grenzen">
      <article><h2>Regelmäßigkeit ohne Scheinaktualität</h2><p>Neue Hinweise erscheinen nur bei amtlich bestätigtem Verfahrensstand. Analysen und Updates erscheinen, wenn ihre Quellen, Annahmen und Grenzen nachvollziehbar dokumentiert sind – nicht nach einem künstlichen Takt.</p></article>
      <article><h2>Freiwillige E-Mail-Updates</h2><p>Wirkungschecks per E-Mail gibt es nur nach bestätigter Anmeldung. Keine Öffnungs- oder Klickmessung, keine politischen Nutzerprofile und eine direkte Abmeldung in jeder Nachricht.</p></article>
      <article><h2>Korrekturen sind Teil des Systems</h2><p>Wenn Quellen, Daten, Berechnungen oder eine Einordnung strittig werden, wird die Prüfung dokumentiert. Eine Korrektur ersetzt nicht stillschweigend die vorherige Version.</p></article>
      <article><h2>Klare Grenzen</h2><p>Das Portal ist kein Rechtsgutachten, keine Wahlhilfe, kein Parteiranking und kein Personen- oder Social-Credit-System. Es ersetzt weder Parlament noch demokratische Entscheidung.</p></article>
    </section>

    <section className="transparency-list" aria-label="Was die Wirkungsökonomie leistet und nicht behauptet">
      <article><h2>Was die WÖk nicht behauptet</h2><ul><li>Politik entscheide ohne Folgenprüfung.</li><li>Jede Wirkung lasse sich vorhersagen oder einer Entscheidung sicher zurechnen.</li><li>Die SDGs seien eine vollständige Wirkungsmethode.</li><li>SDG+ sei eine UN-Kategorie.</li><li>Ein Score ersetze demokratische Entscheidung.</li><li>WÖk-Modelle seien automatisch geltendes Recht.</li></ul></article>
      <article><h2>Was die WÖk zusätzlich leistet</h2><ul><li>Objektspezifische Wirkpfade nach <code>{portalUsp.pathFormula}</code>.</li><li>Explizite Datenfunktionen, Baseline, Gegenfaktum, Evidenz und Unsicherheit.</li><li>Wirkungen erster bis dritter Ordnung, Systemkaskaden, Verteilung und Resilienz.</li><li>Nichtkompensation bei schweren Schutzgrenzen.</li><li>Vergleich realistischer Handlungsoptionen ohne automatischen Score.</li><li>Versionierte Reality Checks und ein öffentliches politisches Wirkungsgedächtnis.</li></ul></article>
    </section>

    <section className="trust-links" aria-label="Weiterführende Informationen">
      <Link className="button button-secondary" href="/methodik">Methodik ansehen</Link>
      <Link className="button button-secondary" href="/quellen">Quellenarchiv öffnen</Link>
      <a className="button button-secondary" href="mailto:wirkungscheck@wirkungsoekonomie.de?subject=Korrektur%20oder%20methodischer%20Hinweis">Korrektur oder Einwand senden</a>
    </section>
  </div>;
}

function Toolbox() {
  return <section className="notice"><strong>Bestehenden WÖk-Werkzeugkasten nutzen.</strong><p>Der vollständige Katalog bleibt auf <a href="https://wirkungsoekonomie.de/werkzeuge/">wirkungsoekonomie.de/werkzeuge</a>. Der parlamentarische Kontext übernimmt nur klar gekennzeichnete Methoden und keine unbestätigten Tool-Backends.</p></section>;
}

function Monitor() {
  return <section className="notice"><strong>Monitoring beobachtet. Evaluation erklärt.</strong><p>Für jeden Monitorfall werden Ausgangswert, erwartete Veränderung, Umsetzungs- und Wirkungsindikator, Quelle, Zeitbezug und betroffene Gruppen sichtbar. Vorab wird außerdem festgelegt, bei welchen späteren Ergebnissen Maßnahme oder Analyse erneut geprüft werden müssen. Diese Überprüfungsschwellen heißen Korrekturtrigger.</p></section>;
}
