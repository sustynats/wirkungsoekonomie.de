import Link from "next/link";
import { portalTerminology, type PortalTermKey } from "@/lib/presentation/terminology";

const terms: PortalTermKey[] = ["wirkung", "wirkungspotenzial", "wirkungsrisiko", "wirkmechanismus", "wirkpfad", "wirkungsbewertung", "gegenfaktum", "evidenzgrenze", "zurechnung", "wirkungsgrenze", "nichtkompensation", "rueckkopplung", "wirkungslenkung", "zusaetzlichkeit", "wirkungsradar", "wirkungsbild"];

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
    <p className="page-return"><Link href="/methodik">← Zum Prüfstandard</Link></p>
  </div>;
}
