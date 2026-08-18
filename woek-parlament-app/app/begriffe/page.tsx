import Link from "next/link";
import { portalTerminology, type PortalTermKey } from "@/lib/presentation/terminology";
import { portalUsp } from "@/lib/content/portal-usp";

const terms: PortalTermKey[] = ["wirkung", "wirkungspotenzial", "wirkungsrisiko", "wirkmechanismus", "wirkpfad", "wirkungsbewertung", "gegenfaktum", "evidenzgrenze", "zurechnung", "wirkungsgrenze", "nichtkompensation", "rueckkopplung", "wirkungslenkung", "zusaetzlichkeit", "wirkungsradar"];

export const metadata = {
  title: "Begriffe verständlich erklärt",
  description: "Grundbegriffe des Wirkungsportals Parlament in klarer Sprache."
};

export default function GlossaryPage() {
  return <div className="shell content-page">
    <header className="page-intro">
      <p className="eyebrow">Kurz nachschlagen</p>
      <h1>Wirkungsökonomie in klaren Worten</h1>
      <p className="lead">Diese Begriffe helfen beim Lesen eines Wirkungschecks. Sie ersetzen keine Bewertung – sie machen sichtbar, was genau geprüft wird.</p>
    </header>
    <dl className="glossary-page-list">
      {terms.map((termKey) => <div key={termKey}><dt>{portalTerminology[termKey].label}</dt><dd>{portalTerminology[termKey].description}</dd></div>)}
    </dl>
    <section className="notice"><strong>Der Zusammenhang ist wichtig.</strong><p>Ein Wirkungscheck trennt Sachverhalt, Wirkungspotenzial, Wirkungsrisiko, beobachtete Wirkung und normative Einordnung. So wird aus einem Zielversprechen keine voreilige Wirkungsaussage.</p></section>
    <section className="notice notice-neutral"><strong>Der Wirkpfad in einer Zeile: <code>{portalUsp.pathFormula}</code></strong><p>Auslöser, Mechanismus, Zustandsänderung und Referenz gehören zusammen. <code>{portalUsp.observedChange}</code> beschreibt zunächst nur eine beobachtete Veränderung. Erst ein belastbares Gegenfaktum hilft bei der Frage, welchen Beitrag die Entscheidung geleistet hat.</p></section>
    <section className="notice"><strong>Handlungsoption ist keine automatische Politiknote.</strong><p>Eine fachlich freigegebene WÖk-Handlungsoption vergleicht realistische Alternativen am tatsächlichen Engpass, an Wirkpfaden, Systemfolgen, Recht, Umsetzbarkeit und Schutzgrenzen. Wenn die Evidenz nicht reicht, bleibt die Empfehlung ausdrücklich offen.</p></section>
    <p className="page-return"><Link href="/methodik">← Zum Prüfstandard</Link></p>
  </div>;
}
