import Link from "next/link";

type CanonicalMethodExplainerProps = {
  context?: "portal" | "government";
};

const stages = [
  {
    id: "fact",
    number: "01",
    title: "Amtlichen Sachverhalt und Entscheidungsobjekt sichern",
    text: "Zuerst wird geklärt, welche Fassung, Handlung oder Entscheidung tatsächlich vorliegt. Quelle, Zuständigkeit, Zeitpunkt und politisch-rechtlicher Lebenslauf bleiben als Faktenschicht von jeder WÖk-Analyse getrennt.",
  },
  {
    id: "problem",
    number: "02",
    title: "WÖk-Problemprüfung",
    text: "Gibt es das behauptete Problem wirklich - und was genau ist es? Geprüft werden Zustand und Ausgangslage, Symptom und Ursache, Materialität, eigentliche Problemursache oder bindender Engpass, ein plausibles Gegenfaktum sowie offene Evidenz. Fehlt ein fachlich freigegebener Problem-Review, bleibt diese Stufe sichtbar offen.",
  },
  {
    id: "goal",
    number: "03",
    title: "WÖk-Zielprüfung",
    text: "Danach wird geprüft, ob das politische Ziel das festgestellte Problem tatsächlich adressiert und rechtlich, verfassungsrechtlich sowie systemisch tragfähig ist. Die Zielprüfung ist weder Instrumentenwahl noch Wirkungsanalyse.",
  },
  {
    id: "impact",
    number: "04",
    title: "Wirkungsanalyse: A → M → ΔZ → R",
    text: "Auslöser oder Instrument (A), Wirkmechanismus (M), mögliche oder beobachtete Zustandsänderung (ΔZ) und offengelegter Referenzrahmen (R) bilden die kausale Prüfkette. Wirkungspotenzial, Wirkungsrisiko, Evidenz und Unsicherheit bleiben getrennt.",
  },
  {
    id: "recommendation",
    number: "05",
    title: "Fachlich freigegebene WÖk-Handlungsoption",
    text: "Eine bessere Entscheidung oder Ausgestaltung wird nur aus einer fachlich freigegebenen WÖk-Handlungsoption gezeigt. CodeX leitet keine Empfehlung aus Scores, Richtung, Zielbegriffen oder Parteipositionen ab. Fehlt die Freigabe, bleibt die Handlungsoption ausdrücklich offen.",
  },
  {
    id: "common-targets",
    number: "06",
    title: "Vergleich an gemeinsamen Zielen",
    text: "Die tatsächliche Entscheidung und eine freigegebene WÖk-Handlungsoption können an denselben, getrennten Ziel- und Referenzebenen verglichen werden. Das erzeugt weder eine Gesamtnote noch eine kausale Zurechnung. Veröffentlicht werden nur fachlich geprüfte oder kanonische Zuordnungen.",
  },
  {
    id: "reality-check",
    number: "07",
    title: "Reality Check",
    text: "Nach Umsetzung werden Zustandsdaten und neue Evidenz beobachtet. Erst eine eigene Zurechnungsprüfung fragt, welchen Beitrag die Entscheidung geleistet hat. Beobachtung allein ist noch keine Attribution und überschreibt die ursprüngliche Ex-ante-Analyse nicht.",
  },
  {
    id: "inspiration",
    number: "08",
    title: "Optionales Inspirations- und Operationalisierungsmodell",
    text: "Ein fachlich freigegebenes Modell kann zusätzliche umsetzbare Gestaltungswege sichtbar machen. Es bleibt von Analyse und Empfehlung getrennt und wird niemals automatisch ergänzt, wenn ein Fachlayer fehlt.",
  },
] as const;

export function CanonicalMethodExplainer({ context = "portal" }: CanonicalMethodExplainerProps) {
  const contextCopy = context === "government"
    ? "Für Regierungshandeln gilt dieselbe Portalmethodik. Institution, Ressort, Kabinettsbeschluss, Vollzug und Rechtsstand werden innerhalb dieser Ordnung eingeordnet – nicht in einer abweichenden Regierungsmethode."
    : "Diese Reihenfolge ist für Bundesregierung, Parlament, Länder und Europäische Union verbindlich. Fachlich noch nicht freigegebene Stufen werden nicht aus vorhandenen Texten abgeleitet.";

  return (
    <>
      <section className="canonical-method" aria-labelledby={`canonical-method-title-${context}`}>
        <header className="canonical-method-intro">
          <p className="eyebrow">Verbindliche Prüfreihenfolge</p>
          <h2 id={`canonical-method-title-${context}`}>Erst Problem und Ziel klären. Dann Wirkung und bessere Ausgestaltung prüfen.</h2>
          <p>{contextCopy}</p>
        </header>
        <ol className="canonical-method-steps">
          {stages.map((stage) => (
            <li key={stage.id} data-method-stage={stage.id}>
              <span className="canonical-method-number" aria-hidden="true">{stage.number}</span>
              <div>
                <h3>{stage.title}</h3>
                <p>{stage.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="measurement-architecture" aria-labelledby={`measurement-architecture-title-${context}`}>
        <div>
          <p className="eyebrow">Messarchitektur</p>
          <h2 id={`measurement-architecture-title-${context}`}>Was wichtig ist, bleibt von seiner Beobachtung getrennt.</h2>
          <p>Das Masterregister beschreibt, welche Zustände und Wirkungsgegenstände fachlich relevant sind. Das Indikatorenregister beschreibt, wie ausgewählte Zustände beobachtet werden können. Eine Messgröße ist weder ein Wirkungsbeweis noch eine Empfehlung.</p>
        </div>
        <div className="measurement-chain" aria-label="MasterItem führt zu StateVariable, Indicator, Observation und schließlich Analyse oder Reality Check">
          <span>MasterItem</span><b aria-hidden="true">→</b><span>StateVariable</span><b aria-hidden="true">→</b><span>Indicator</span><b aria-hidden="true">→</b><span>Observation</span><b aria-hidden="true">→</b><span>Analysis / RealityCheck</span>
        </div>
        <div className="measurement-principles">
          <article><h3>Amtliche DNS-Indikatoren</h3><p>Sie dokumentieren Ziel-, Mess- und Monitoringbezüge der Deutschen Nachhaltigkeitsstrategie. Sie belegen für sich allein weder Kausalität noch politische Wirkung.</p></article>
          <article><h3>Output ist noch kein Outcome</h3><p>Beschluss, Mittelabfluss und Verwaltungsleistung zeigen Umsetzung. Erst eine Zustandsänderung beschreibt ein Ergebnis; erst eine tragfähige Prüfung kann daraus Wirkung oder Beitrag ableiten.</p></article>
          <article><h3>Richtung ist nicht Evidenz</h3><p>Eine modellierte Wirkungsrichtung und die Belastbarkeit ihrer Evidenz werden getrennt ausgewiesen. Fehlende Daten bedeuten offen – niemals neutral oder null.</p></article>
          <article><h3>Keine Durchschnittsschönrechnung</h3><p>Es gibt keinen beliebigen Gesamtscore. Nichtkompensation und Schutzgrenzen verhindern, dass ein schwerer Schaden durch Vorteile in anderen Feldern unsichtbar wird.</p></article>
        </div>
        <p><Link className="text-link" href="/methodik/wirkindikatoren">Die 82 amtlichen DNS-Indikatoren und ihre Messgrenzen ansehen →</Link></p>
      </section>
    </>
  );
}
