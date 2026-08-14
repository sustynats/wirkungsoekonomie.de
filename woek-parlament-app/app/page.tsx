import Link from "next/link";
import { CaseCard } from "@/app/components/CaseCard";
import { parliamentaryCases } from "@/data/cases";

const pillars = [
  ["01", "Wirkungsradar", "Was steht an? Erst nach amtlicher Quelle und Quellenprüfung."],
  ["02", "Wirkungscheck", "Welche Veränderung ist plausibel, was bleibt offen und welche rote Linie gilt?"],
  ["03", "Wirkungsdialog", "Umfragen sind eine Rückkopplung, kein Fachvotum."],
  ["04", "Historie", "Damals verfügbares Wissen und heutige Beobachtung bleiben getrennt."],
  ["05", "Monitor", "Erwartungen, Indikatoren und Beobachtungen ermöglichen Korrektur."],
];

export default function HomePage() {
  return <>
    <section className="hero container"><div><p className="kicker">Deutscher Bundestag · MVP</p><h1>Politik entscheidet über Maßnahmen. Wir schauen darauf, was sie bewirken könnte.</h1><p className="lead">Das Wirkungsportal macht transparent, was zur Entscheidung steht, welche Wirkpfade plausibel sind, was wir wissen und was später überprüft werden muss.</p><div className="hero-actions"><Link className="button button--primary" href="/bevorstehend">Wirkungsradar öffnen</Link><Link className="button" href="/methodik">So funktioniert es</Link></div></div><aside className="hero-aside"><p className="kicker">Die Grundregel</p><h2>Wirkung ist nicht Absicht.</h2><p>Wir trennen Sachverhalt, Wirkungspotenzial, Wirkungsrisiko, normative Einordnung und spätere Beobachtung.</p><Link href="/transparenz">Quellen, Versionen und Grenzen ansehen</Link></aside></section>
    <section className="section container"><div className="section-heading"><div><p className="kicker">Startpunkt</p><h2>Was steht als Nächstes an?</h2></div><Link href="/bevorstehend">Alle Radarhinweise</Link></div><div className="notice"><strong>Amtliche Live-Befüllung wird vorbereitet.</strong><p>Die DIP-Importstrecke wird erst mit gültigem Zugang, Quellenprüfung und redaktioneller Freigabe aktiviert. Bis dahin zeigt das Portal keine erfundenen parlamentarischen Statusdaten.</p></div></section>
    <section className="section section--paper"><div className="container"><div className="section-heading"><div><p className="kicker">Demonstrator</p><h2>So bleibt eine Entscheidung nachvollziehbar.</h2></div></div><div className="card-grid">{parliamentaryCases.map((item) => <CaseCard key={item.slug} item={item} />)}</div></div></section>
    <section className="section container"><div className="section-heading"><div><p className="kicker">Fünf Säulen</p><h2>Von der Entscheidung bis zum Lernen aus Wirkung.</h2></div></div><ol className="pillars">{pillars.map(([number, title, text]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
  </>;
}
