import Link from "next/link";
import methodologyManifest from "@/data/methodology-manifest.json";
import { BoundaryIcon, CalculationIcon, CheckCircleIcon, EvidenceIcon, MonitorIcon, PathIcon, ReferenceIcon, SourceIcon } from "@/app/components/icons";
import { directionLabels, directionRuleExamples, endToEndExample, type ImpactDirection } from "@/lib/methodology";
import { ImpactAssessmentExplanationPanel } from "./ImpactAssessmentExplanationPanel";
import { ImpactCalculationDemo } from "./ImpactCalculationDemo";
import { MethodFormula } from "./MethodFormula";

const processSteps = [
  "Originalquelle",
  "Auslöser",
  "Wirkmechanismus",
  "Wirkungsempfänger",
  "mögliche Zustandsveränderung",
  "Referenzziel",
  "Richtung",
  "Evidenz",
  "Schutzprüfung",
  "spätere Beobachtung",
  "Zurechnung",
  "Rückkopplung"
];

const sourceLevels = [
  {
    number: "1",
    title: "Politischer Originalgegenstand",
    purpose: "Belegt, was tatsächlich gefordert, beraten, verändert oder beschlossen wurde.",
    examples: "Wahlprogramm, Koalitionsvertrag, Gesetzentwurf, Änderungsantrag, finale Fassung, Drucksache, Plenarprotokoll, amtliche Abstimmung, Verordnung oder Haushaltsansatz."
  },
  {
    number: "2",
    title: "Recht und Zuständigkeit",
    purpose: "Zeigt, wer handeln darf und welche rechtlichen Grenzen oder Schutzaufträge gelten.",
    examples: "Grundgesetz, Landesverfassungen, Bundes- und Landesrecht, EU-Recht, amtliche Rechtsprechung und Kompetenzordnung."
  },
  {
    number: "3",
    title: "Referenzrahmen",
    purpose: "Macht offen, woran eine Zustandsveränderung normativ eingeordnet wird.",
    examples: "Agenda 2030, 17 SDGs, SDG+ als WÖk-Erweiterung, Mensch-Planet-Demokratie, Nachhaltigkeitsstrategien sowie getrennt davon Grundrechte und Staatsziele."
  },
  {
    number: "4",
    title: "Wirkmechanismen und Evidenz",
    purpose: "Begründet, warum eine Maßnahme einen Zustand verändern könnte und wie belastbar diese Annahme ist.",
    examples: "Wissenschaftliche Primärliteratur, systematische Reviews, Metaanalysen, amtliche Evaluationen, Statistiken, Fachbehörden, internationale Organisationen und technische Standards."
  },
  {
    number: "5",
    title: "Beobachtung nach Umsetzung",
    purpose: "Zeigt, was sich später tatsächlich verändert hat. Erst ein geeignetes Untersuchungsdesign erlaubt eine kausale Zurechnung.",
    examples: "Destatis, Statistische Landesämter, Umweltbundesamt, Bundesagentur für Arbeit, Fachregister, Monitoring- und Ressortdaten sowie Evaluationen."
  }
];

const directionRows: Array<{ direction: ImpactDirection; symbol: string; explanation: string }> = [
  { direction: "POSITIVE_POTENTIAL", symbol: "↗", explanation: "Die modellierte Zustandsveränderung führt plausibel näher an das Ziel." },
  { direction: "NEGATIVE_RISK", symbol: "↘", explanation: "Die modellierte Zustandsveränderung führt plausibel weiter vom Ziel weg." },
  { direction: "NEUTRAL", symbol: "−", explanation: "Es ist fachlich keine relevante Richtungsänderung erkennbar." },
  { direction: "AMBIVALENT", symbol: "↕", explanation: "Derselbe unteilbare Pfad enthält relevante gegenläufige Richtungen." },
  { direction: "OPEN", symbol: "?", explanation: "Die Richtung ist fachlich noch nicht belastbar bestimmbar. Das ist kein Nullwert." }
];

function DirectionBadge({ direction }: { direction: ImpactDirection }) {
  const className = direction.toLocaleLowerCase("de-DE").replaceAll("_", "-");
  const row = directionRows.find((item) => item.direction === direction);
  return <span className={`method-direction-badge method-direction-${className}`}><span aria-hidden="true">{row?.symbol}</span>{directionLabels[direction]}</span>;
}

function RuleExample({ example, index }: { example: (typeof directionRuleExamples)[number]; index: number }) {
  return (
    <article className="method-rule-example">
      <header><span className="method-example-number">{String(index + 1).padStart(2, "0")}</span><div><p className="eyebrow">Echtes Regelbeispiel</p><h3>{example.title}</h3></div></header>
      <dl className="method-rule-chain"><div><dt>Ausgangsaussage</dt><dd>{example.statement}</dd></div><div><dt>Wirkmechanismus</dt><dd>{example.mechanism}</dd></div><div><dt>Mögliche Zustandsveränderung</dt><dd>{example.stateChange}</dd></div></dl>
      <div className="method-rule-mappings">
        {example.mappings.map((mapping) => <section key={`${example.ruleId}-${mapping.targetId}`}><div><span className="method-target-code">{mapping.targetId}</span><strong>{mapping.targetLabel}</strong></div><DirectionBadge direction={mapping.direction} /><p>{mapping.rationale}</p></section>)}
      </div>
      <p className="method-example-boundary"><strong>Was diese Einordnung nicht sagt:</strong> {example.boundary}</p>
      <details className="method-technical-rule"><summary>Technische Bewertungsregel ansehen</summary><dl><div><dt>Regel-ID</dt><dd><code>{example.ruleId}</code></dd></div><div><dt>Methodenversion</dt><dd>{example.version}</dd></div><div><dt>Regeltyp</dt><dd>{example.policyOrCommunication}</dd></div><div><dt>Prüfhinweise</dt><dd>{example.reviewFlags.join("; ")}</dd></div><div><dt>Zielrichtungen</dt><dd>{example.mappings.map((mapping) => `${mapping.targetId}: ${directionLabels[mapping.direction]}`).join("; ")}</dd></div><div><dt>Passende Messindikatoren</dt><dd><Link href={{ pathname: "/methodik/register", query: { query: example.registerQuery } }}>WÖk-Masterregister durchsuchen</Link></dd></div></dl><p className="method-rule-register-boundary"><strong>Regel-ID und WÖk-ID sind nicht dasselbe.</strong> Die Regel begründet hier das kategorische Ex-ante-Mapping. Eine WÖk-ID wird erst gewählt, wenn ein konkreter messbarer Indikator operationalisiert wird.</p></details>
    </article>
  );
}

export function MethodologyPage() {
  return <div className="methodology-page">
    <section className="method-magic-formula" aria-labelledby="no-magic-formula-title">
      <div><p className="eyebrow">Die wichtigste Klarstellung</p><h2 id="no-magic-formula-title">Es gibt nicht die eine magische Wirkungsformel.</h2></div>
      <div><p>Nicht jede politische Wirkungsfrage lässt sich sofort in eine Zahl übersetzen. Vor einer Entscheidung wird zunächst ein Wirkpfad modelliert: Was könnte sich durch eine Maßnahme bei wem und warum verändern? Daraus lässt sich eine Wirkungsrichtung ableiten. Erst mit geeigneten Zustandsdaten, Ausgangswerten und Vergleichsmöglichkeiten kann tatsächliche Veränderung quantitativ untersucht werden.</p><div className="method-time-views"><section><strong>Vor der Entscheidung</strong><span>Wirkungspotenzial, Risiko, Mechanismus, Richtung und Evidenz.</span></section><section><strong>Nach der Umsetzung</strong><span>Beobachtung, Ausgangswert, Gegenfaktum, Zurechnung und gegebenenfalls Berechnung.</span></section></div><p className="method-key-distinction"><strong>Ex ante bedeutet nicht: Richtung offen.</strong> Eine Wirkung kann noch nicht eingetreten sein und trotzdem ein klar begründbares positives oder negatives Wirkungspotenzial besitzen.</p></div>
    </section>

    <section aria-labelledby="six-modules-title">
      <div className="method-section-heading"><p className="eyebrow">Das Fundament</p><h2 id="six-modules-title">Sechs Module halten die Prüfung zusammen.</h2><p>Die Module bleiben der verständliche Einstieg. Die vollständige Herleitung darunter zeigt, wie jeder Schritt geprüft werden kann.</p></div>
      <div className="method-grid">
        <article><span>A</span><h3>Vor der Wirkung</h3><p>Was soll entschieden werden? Welche Veränderung könnte möglich sein, welches Risiko besteht und warum? Der begründete mögliche Weg heißt Wirkmechanismus.</p></article>
        <article><span>B</span><h3>Umsetzung und Veränderung</h3><p>Was geschieht tatsächlich? Wer setzt die Entscheidung um, was wird unmittelbar erreicht und welche Zustände könnten sich dadurch verändern?</p></article>
        <article><span>C</span><h3>Evidenz und Zurechnung</h3><p>Woher wissen wir das? Daten, Ausgangswert, Vergleichsfrage, Studien und Unsicherheit zeigen, wie belastbar eine Aussage ist und welchen Beitrag die Entscheidung geleistet haben könnte.</p></article>
        <article><span>D</span><h3>Wirkungsbewertung</h3><p>Wie wird eine eingetretene oder modellierte Wirkung eingeordnet? Der Maßstab ist offengelegt: Agenda 2030 und SDGs, ergänzt durch SDG+, Mensch, Planet und Demokratie.</p></article>
        <article><span>E</span><h3>Schutz- und Systemprüfung</h3><p>Welche Neben-, Verteilungs- und Wechselwirkungen sind möglich? Zielkonflikte können abgewogen werden. Materielle Wirkungsgrenzen nicht.</p></article>
        <article><span>F</span><h3>Rückkopplung und Lernen</h3><p>Was folgt daraus? Daten können eine erneute Prüfung auslösen. Dann lassen sich Regeln, Finanzierung, Vollzug oder die Entscheidung selbst gezielt verändern.</p></article>
      </div>
    </section>

    <section className="method-process" aria-labelledby="method-process-title">
      <div className="method-section-heading"><p className="eyebrow">So entsteht eine Wirkungsbewertung</p><h2 id="method-process-title">Vom Originalsatz bis zur späteren Rückkopplung.</h2><p>Hier zeigen wir nicht nur das Ergebnis, sondern den Weg dorthin.</p></div>
      <ol>{processSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>)}</ol>
    </section>

    <section className="method-sources" aria-labelledby="method-sources-title">
      <div className="method-section-heading"><p className="eyebrow">Woher kommen die Daten?</p><h2 id="method-sources-title">Jede Quelle hat eine andere Aufgabe.</h2><p>Was ein politischer Akteur fordert oder beschlossen hat, wird aus der Originalquelle ermittelt. Ein Presseartikel über die Forderung ersetzt diese Quelle nicht.</p></div>
      <ol>{sourceLevels.map((level) => <li key={level.number}><span>{level.number}</span><div><h3>{level.title}</h3><p>{level.purpose}</p><p className="method-source-examples">{level.examples}</p></div></li>)}</ol>
      <aside><SourceIcon /><p><strong>Quelle ist nicht gleich Schwelle.</strong> Ein Berichtsstandard kann festlegen, was gemessen wird. Er begründet nicht automatisch, ab welchem Wert die Wirkungsökonomie einen technischen Score vergibt.</p></aside>
    </section>

    <section className="method-path" aria-labelledby="method-path-title">
      <div className="method-section-heading"><p className="eyebrow">Vom politischen Satz zum Wirkpfad</p><h2 id="method-path-title">Erst kommt die Kausallogik, dann die Mathematik.</h2></div>
      <div className="method-path-layout"><div><MethodFormula kind="impact-path" /><dl><div><dt>A</dt><dd>Auslöser oder politische Maßnahme</dd></div><div><dt>M</dt><dd>Wirkmechanismus</dd></div><div><dt>ΔZ</dt><dd>mögliche oder beobachtete Zustandsveränderung</dd></div><div><dt>R</dt><dd>Referenzziel oder Schutzgut</dd></div></dl></div><div><PathIcon /><p>Zusätzlich werden Wirkungsempfänger, Wirkungsraum, Zeitraum, Bedingungen, Nebenwirkungen und Wirkungen erster, zweiter und dritter Ordnung betrachtet.</p><p className="method-key-distinction"><strong>Ein Wirkpfad ist eine begründete Kausalhypothese.</strong> Er ist noch kein Beweis, dass die Veränderung tatsächlich eintritt.</p></div></div>
    </section>

    <section className="method-mapping" aria-labelledby="method-mapping-title">
      <div className="method-section-heading"><p className="eyebrow">SDG- und SDG+-Mapping</p><h2 id="method-mapping-title">Nicht das Thema entscheidet, sondern die Zustandsveränderung.</h2><p>„Bildung“ wird nicht automatisch SDG 4 zugeordnet. Geprüft wird, welcher Zustand sich plausibel verändert, welches Ziel diesen Zustand beschreibt und ob die Veränderung näher zum Ziel oder weiter davon weg führt.</p></div>
      <div className="method-mapping-questions"><article><span>1</span><p>Welche konkrete Zustandsveränderung wird erwartet?</p></article><article><span>2</span><p>Welches Referenzziel oder Schutzgut beschreibt diesen Zustand?</p></article><article><span>3</span><p>Führt die Veränderung näher zum Ziel oder weiter davon weg?</p></article><article><span>4</span><p>Sind mehrere Ziele mit unterschiedlichen Richtungen betroffen?</p></article></div>
      <MethodFormula kind="direction-set" />
      <div className="method-direction-table" role="table" aria-label="Fünf mögliche Richtungen eines Wirkpfads"><div className="method-direction-table-head" role="row"><span role="columnheader">Richtung</span><span role="columnheader">Bedeutung</span></div>{directionRows.map((row) => <div role="row" key={row.direction}><span role="cell"><DirectionBadge direction={row.direction} /></span><p role="cell">{row.explanation}</p></div>)}</div>
      <p className="method-no-average"><strong>Diese Kategorien sind keine addierbaren Punkte.</strong> Aus positiv, ambivalent und negativ wird kein arithmetischer Mittelwert gebildet.</p>
    </section>

    <section className="method-two-axes" aria-labelledby="method-two-axes-title">
      <div className="method-section-heading"><p className="eyebrow">Zwei getrennte Fragen</p><h2 id="method-two-axes-title">Richtung und Evidenz sind nicht dasselbe.</h2></div>
      <div className="method-axis-grid"><div className="method-axis-direction"><h3>Welche Richtung ist plausibel?</h3>{directionRows.map((row) => <DirectionBadge key={row.direction} direction={row.direction} />)}</div><div className="method-axis-evidence"><h3>Wie sicher ist diese Aussage?</h3><span>hoch</span><span>mittel</span><span>gering</span><span>nicht bewertbar</span></div></div>
      <article className="method-evidence-example"><div><span>Richtung</span><strong>negatives Wirkungspotenzial</strong></div><div><span>Evidenz</span><strong>mittel</strong></div><div><span>Datenstatus</span><strong>modelliert</strong></div><div><span>Tatsächliche Wirkung</span><strong>noch nicht festgestellt</strong></div></article>
      <p className="method-key-distinction"><strong>Ein negatives Wirkungspotenzial mit geringer Evidenz ist etwas anderes als eine offene Wirkungsrichtung.</strong> Farbe und Symbol zeigen ausschließlich die Richtung. Evidenz erhält eine eigene, farbneutrale Kennzeichnung.</p>
    </section>

    <section className="method-rules" aria-labelledby="method-rules-title">
      <div className="method-section-heading"><p className="eyebrow">Regelbasierte Unterstützung</p><h2 id="method-rules-title">Regeln finden Prüfstellen. Menschen verantworten die Freigabe.</h2><p>Automatisierte Regeln helfen, in großen Programmbeständen relevante Aussagen und mögliche Zielbezüge reproduzierbar zu finden. Eine Regel enthält Erkennungsbereich, Zielbezüge, Begründung, Prüfhinweise und Version.</p></div>
      <ol className="method-rule-process"><li><SourceIcon /><span>Originaltext</span></li><li><EvidenceIcon /><span>Kandidatenerkennung</span></li><li><ReferenceIcon /><span>versionierte Regel</span></li><li><PathIcon /><span>vorgeschlagene Zielzuordnung</span></li><li><CheckCircleIcon /><span>fachliche Plausibilitäts- und Materialitätsprüfung</span></li><li><MonitorIcon /><span>veröffentlichte Einordnung</span></li></ol>
      <aside className="method-source-fragment"><BoundaryIcon /><div><h3>Unvollständige Quelle stoppt die Bewertung.</h3><p>Ist ein Quellausschnitt abgeschnitten oder vermischt, erhält er keine Richtungsfarbe und keinen Score. Erst der rekonstruierte und geprüfte Primärtext kann fachlich eingeordnet werden.</p></div></aside>
    </section>

    <section aria-labelledby="method-examples-title">
      <div className="method-section-heading"><p className="eyebrow">Drei echte Regelbeispiele</p><h2 id="method-examples-title">Positiv, negativ und mehrdimensional.</h2><p>Die Beispiele stammen aus dem geprüften Regelstand 1.1. Sie zeigen, warum gleiche Themen je nach Mechanismus unterschiedliche Richtungen haben können.</p></div>
      <div className="method-rule-examples">{directionRuleExamples.map((example, index) => <RuleExample example={example} index={index} key={example.ruleId} />)}</div>
    </section>

    <section className="method-separate-layers" aria-labelledby="method-separate-layers-title">
      <div className="method-section-heading"><p className="eyebrow">Weitere getrennte Achsen</p><h2 id="method-separate-layers-title">Politik, Kommunikation, Kompetenz und Recht nicht vermischen.</h2></div>
      <div className="method-layer-grid"><article><PathIcon /><h3>Sachpolitischer Pfad</h3><p>Was könnte sich verändern, wenn die Forderung umgesetzt wird?</p></article><article><EvidenceIcon /><h3>Kommunikativer Pfad</h3><p>Welches Wirkungspotenzial besitzt bereits die Sprache im öffentlichen Resonanzraum? Frame ist nicht gleich bewiesene Einstellungsänderung. Reichweite ist nicht Wirkung. Eine Absicht wird nicht unterstellt.</p></article><article><DecisionIconFallback /><h3>Kompetenz</h3><p>Liegt die Zuständigkeit beim Land, Bund, der Europäischen Union, einer Kommune oder auf mehreren Ebenen?</p></article><article><BoundaryIcon /><h3>Rechtsstatus</h3><p>Kein offensichtlicher Konflikt, rechtlich prüfbedürftig, erheblicher Konflikt, auf dieser Ebene voraussichtlich nicht umsetzbar oder offen.</p></article></div>
      <p className="method-key-distinction"><strong>Eine Maßnahme kann fachlich ein negatives Klimapotenzial besitzen, auch wenn die betrachtete Ebene sie gar nicht allein umsetzen kann.</strong> Kompetenz beeinflusst Umsetzbarkeit, ersetzt aber nicht die Wirkungsrichtung.</p>
    </section>

    <section className="method-quantification" aria-labelledby="method-quantification-title">
      <div className="method-section-heading"><p className="eyebrow">Vom Wirkungspotenzial zur beobachteten Wirkung</p><h2 id="method-quantification-title">Wann beginnt die quantitative Rechnung?</h2><p>Eine Rechnung ist sinnvoll, wenn geeignete Messwerte, Zeitbezüge, Einheiten und Vergleichsmöglichkeiten vorliegen. Die erste Differenz zeigt nur eine Veränderung des Zustands.</p></div>
      <div className="method-formula-explainers"><article><CalculationIcon /><h3>Vorher und nachher</h3><MethodFormula kind="observed-change" /><p>Der spätere Wert minus dem Ausgangswert ergibt die beobachtete Veränderung. Das ist noch keine kausal zugerechnete Wirkung.</p></article><article><ReferenceIcon /><h3>Gegenfaktum</h3><MethodFormula kind="counterfactual-effect" /><p>Leitfrage: Was wäre wahrscheinlich ohne die Maßnahme passiert? Die geschätzte zusätzliche Veränderung hängt davon ab, wie belastbar dieser Vergleich ist.</p></article><article><EvidenceIcon /><h3>Eine mögliche Evaluationsmethode</h3><MethodFormula kind="difference-in-differences" /><p>Difference-in-Differences zieht zusätzlich die Entwicklung einer geeigneten Vergleichsgruppe ab. Es ist ein mögliches Verfahren, nicht die Standardrechnung jedes Portal-Falls.</p></article></div>
      <ImpactCalculationDemo />
    </section>

    <section className="method-scorecard" aria-labelledby="method-scorecard-title">
      <div className="method-section-heading"><p className="eyebrow">Separate technische Operationalisierung</p><h2 id="method-scorecard-title">Wo die WÖk tatsächlich mit -3 bis +3 arbeitet.</h2><p>Für operationalisierte WÖk-Indikatoren können Messwerte über dokumentierte Regeln in eine Scorecard überführt werden. Diese technische Scorecard ist nicht die Ex-ante-Richtungsbewertung eines Wahlprogramms und erzeugt keinen Parteiscore.</p></div>
      <div className="method-scorecard-layout"><article><h3>Messwert und Regel</h3><MethodFormula kind="auto-score" /><p>Jeder verwendete Wert braucht WÖk-ID, Einheit, Datenquelle, Regel-ID, Schwellenquelle, Status und Version. Eine konkrete Schwellentabelle wird nur veröffentlicht, wenn sie im Master tatsächlich belegt ist.</p></article><article><h3>Strengstes vorhandenes Ergebnis</h3><MethodFormula kind="score-set" /><MethodFormula kind="final-score" /><p>Im derzeitigen Masterstand v1.4 wird nur aus vorhandenen belastbaren Teilbewertungen gewählt. Ein Benchmark zählt nur, wenn er aktiv und validiert ist. Die Formel ist versioniert und kein unveränderliches Naturgesetz.</p></article></div>
      <div className="method-no-data"><MethodFormula kind="no-data-not-zero" /><MethodFormula kind="no-data-not-assessed" /><p>Fehlende Daten werden weder als neutral noch als Nullwert ausgegeben.</p></div>
      <div className="method-benchmark-grid"><article><h3>Externe Schwelle</h3><p>Eine Grenze aus Recht, Wissenschaft oder einem fachlich geeigneten Standard. Quelle und Geltungsbereich bleiben sichtbar.</p></article><article><h3>WÖk-Kalibrierung</h3><p>Eine intern gesetzte Bewertungsgrenze. Sie wird ausdrücklich als WÖk-Kalibrierung gekennzeichnet und nicht als externer Benchmark ausgegeben.</p></article><article><h3>Aktiver Benchmark</h3><p>Erfordert Referenzpopulation, Klasse, Region, Technologie oder Produktgruppe, Datenquelle, Zeitraum, Validierungsstatus und aktiven Status.</p></article></div>
    </section>

    <section className="method-master-register" aria-labelledby="method-master-register-title">
      <div className="method-master-register-copy"><p className="eyebrow">Die technische Grundlage</p><h2 id="method-master-register-title">Das WÖk-Masterregister macht Regeln und offene Fragen sichtbar.</h2><p>WÖk-IDs strukturieren mess- und bewertbare Wirkungsaspekte. Messwert, Einheit, Scoring-Regel, Schwellenherkunft, Benchmarkbedarf, Datenqualität und Prüfstatus bleiben getrennt. Ein Messstandard kann festlegen, was erhoben wird. Er begründet nicht automatisch, ab welchem Wert eine Bewertung +2 oder -3 erhält.</p><p className="method-key-distinction"><strong>FINAL heißt: führende Registerfassung.</strong> Es heißt nicht, dass alle Schwellen extern validiert sind. WÖk-Kalibrierungen, fehlende Benchmarks und offene Fachprüfungen bleiben ausdrücklich sichtbar.</p><div className="method-data-links"><Link className="button" href="/methodik/register">WÖk-Masterregister öffnen</Link><a className="button button-secondary" href="/downloads/woek-masterregister/v1.4/register-v1.4.json">Register als JSON</a></div></div>
      <dl><div><dt>WÖk-IDs</dt><dd>{methodologyManifest.master_register.woek_ids}</dd></div><div><dt>Indikatorfamilien</dt><dd>{methodologyManifest.master_register.indicator_families}</dd></div><div><dt>normalisierte Regeln</dt><dd>{methodologyManifest.master_register.normalized_scoring_rules}</dd></div><div><dt>explizite SDG+-Zuordnungen</dt><dd>{methodologyManifest.master_register.sdg_plus_assignments}</dd></div><div><dt>Version</dt><dd>v{methodologyManifest.master_register.version} · {methodologyManifest.master_register.status}</dd></div></dl>
    </section>

    <section className="method-noncompensation" aria-labelledby="method-noncompensation-title">
      <div className="method-section-heading"><p className="eyebrow">Nichtkompensation und Reverse Merit Order</p><h2 id="method-noncompensation-title">Warum gute Werte schwere Schäden nicht wegmitteln.</h2></div>
      <div className="method-noncomp-layout"><article className="method-bad-average"><h3>So nicht</h3><MethodFormula kind="bad-average" /><p>Ein schwerer Schaden an einem Schutzgut darf nicht durch gute Werte an anderer Stelle zu einem positiven Durchschnitt verschwinden.</p></article><article><h3>Schutzgate</h3><MethodFormula kind="protection-gate" /><p>Erst innerhalb des zulässigen Wirkungsraums kann sinnvoll verdichtet werden. Eine belegte rote Linie bleibt sichtbar.</p></article></div>
      <div className="method-reverse-merit"><div className="method-positive-fields"><span>+2</span><span>+3</span><span>+1</span><small>positive Felder</small></div><div className="method-critical-field"><span>−3</span><strong>kritisches Feld oder Schutzgrenze</strong></div><div className="method-rmo-result"><span aria-hidden="true">→</span><p><strong>Kein Durchschnitt von +0,75.</strong> Der Gesamtstatus wird durch das kritische Feld begrenzt.</p></div></div>
      <p className="method-key-distinction"><strong>Die Reverse Merit Order ist die Bewertungslogik. Nichtkompensation ist das Schutzprinzip.</strong> Beide Begriffe werden nicht gleichgesetzt.</p>
    </section>

    <ImpactAssessmentExplanationPanel assessment={endToEndExample} />

    <section className="method-explanation-contract" aria-labelledby="method-explanation-contract-title">
      <div className="method-section-heading"><p className="eyebrow">Standard für alle Detailseiten</p><h2 id="method-explanation-contract-title">Was „Warum diese Einordnung?“ künftig öffnet.</h2><p>Keine Blackbox-Farbe und kein Pfeil ohne fachliche Begründung.</p></div>
      <ul>{["Originalaussage und Quelle", "Auslöser, Wirkungsempfänger und Wirkmechanismus", "betroffene Ziele und Richtung je Ziel", "ausführliche fachliche Begründung", "Evidenz- und Datenstatus", "tatsächliche Wirkung oder Ex-ante-Grenze", "Kompetenz- und Rechtsstatus", "Risiken und nicht verrechenbare Schutzgrenzen", "Datenbedarf, Regel-ID, Methodenversion und Aktualisierungsdatum"].map((item) => <li key={item}><CheckCircleIcon /><span>{item}</span></li>)}</ul>
    </section>

    <section className="method-version-box" id="methodenstand" aria-labelledby="method-version-title">
      <div><p className="eyebrow">Aktueller Methodenstand</p><h2 id="method-version-title">Versionen bleiben sichtbar und maschinenlesbar.</h2><p>{methodologyManifest.interpretation_boundary}</p></div>
      <dl><div><dt>{methodologyManifest.terminology_guide.label}</dt><dd>v{methodologyManifest.terminology_guide.version}</dd></div><div><dt>{methodologyManifest.parliament_method.label}</dt><dd>v{methodologyManifest.parliament_method.version}</dd></div><div><dt>{methodologyManifest.direction_rules.label}</dt><dd>v{methodologyManifest.direction_rules.version} · {methodologyManifest.direction_rules.rule_count} Regeln</dd></div><div><dt>{methodologyManifest.master_register.label}</dt><dd>v{methodologyManifest.master_register.version} · {methodologyManifest.master_register.woek_ids} WÖk-IDs · {methodologyManifest.master_register.indicator_families} Indikatorfamilien · {methodologyManifest.master_register.normalized_scoring_rules} normalisierte Scoring-Regeln</dd></div></dl>
      <div className="method-data-links"><Link className="button" href="/methodik/register">WÖk-Masterregister öffnen</Link><a className="button button-secondary" href="/methodik/methodenstand.json">Methodenstand als JSON</a><a className="button button-secondary" href="/methodik/regelbeispiele-v1.1.json">Regelbeispiele als JSON</a><Link className="button button-secondary" href="/quellen">Quellenarchiv öffnen</Link></div>
    </section>

    <section className="method-corrections" id="korrekturen" aria-labelledby="method-corrections-title"><div><p className="eyebrow">Korrekturen gehören zur Methode</p><h2 id="method-corrections-title">Reproduzierbarkeit bedeutet nicht Unveränderlichkeit.</h2></div><p>Neue Evidenz, bessere Daten oder gefundene Fehler können zu einer neuen Einordnung führen. Änderungen werden versioniert und nicht stillschweigend überschrieben. Frühere Fassungen bleiben ihrem damaligen Quellen-, Regel- und Wissensstand zugeordnet.</p></section>

    <blockquote className="method-trust-quote"><p>Eine Wirkungsbewertung soll nicht geglaubt werden müssen. Sie soll geprüft werden können.</p><footer>Quelle, Wirkpfad, Referenzziel, Richtung, Evidenz, Annahmen und Rechenweg bleiben deshalb getrennt sichtbar.</footer></blockquote>
  </div>;
}

function DecisionIconFallback() {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20.5h16M6.5 18V9.5h11V18M4.5 9.5h15L12 3.5zM9 12.5v3M12 12.5v3M15 12.5v3" /></svg>;
}
