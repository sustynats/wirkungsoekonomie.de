import Link from "next/link";
import { CaseCard } from "@/app/components/CaseCard";
import { PortalStand } from "@/app/components/PortalStand";
import { StateCartogram } from "@/app/components/StateCartogram";
import { listPublishedCases } from "@/lib/cases";
import { getPublicRegister } from "@/lib/register";
import { portalStand } from "@/lib/portal-stand";

export default function HomePage() {
  const radar = listPublishedCases().filter((item) => item.kind === "RADAR");
  const stand = portalStand(getPublicRegister(), radar.map((item) => item.slug));
  return <div className="portal-home">
    <section className="shell home-hero" data-home-block="hero">
      <p className="eyebrow">Unabhängiges Portal des Instituts für Wirkungsökonomie</p>
      <h1>Von der politischen Absicht zur tatsächlichen Wirkung.</h1>
      <p className="lead">Welche Zustände soll eine Entscheidung verändern, welche Nebenwirkungen sind möglich – und was verändert sich nach der Umsetzung wirklich?</p>
      <p className="home-independence">Kein Angebot des Deutschen Bundestages, keiner Partei oder Fraktion.</p>
      <div className="hero-actions"><Link className="button button-primary" href="/aktuell/radar">Was steht als Nächstes an?</Link><Link className="button button-secondary" href="/pruefstandard/methodik">So prüfen wir</Link></div>
    </section>
    <PortalStand stand={stand} />
    <section className="shell section" data-home-block="radar">
      <div className="section-heading"><div><p className="eyebrow">Startpunkt</p><h2>Was steht als Nächstes an?</h2></div><Link className="text-link" href="/aktuell/radar">Alle bevorstehenden Entscheidungen <span aria-hidden="true">→</span></Link></div>
      {radar.length ? <div className="card-grid">{radar.slice(0, 3).map((item) => <CaseCard item={item} key={item.slug} />)}</div> : <p>Derzeit kein veröffentlichter Radar-Vorgang. <Link href="/aktuell/radar">Geltungsbereich ansehen</Link></p>}
    </section>
    <section className="home-signature-legend" data-home-block="legend" aria-labelledby="home-signature-title"><div className="shell">
      <h2 id="home-signature-title">Drei Achsen. Keine Note.</h2>
      <dl><div><dt>Wirkungsrichtung</dt><dd>↗ ↘ Gegenläufige Pfade bleiben getrennt. Kein Mittelwert.</dd></div><div><dt>Evidenz</dt><dd>○ Vier Stufen nur bei freigegebener Einstufung. Offen ist weder neutral noch null.</dd></div><div><dt>Reifegrad</dt><dd>● Ex ante, Umsetzung, Beobachtung und Zurechnung sind getrennte Wissensstände.</dd></div></dl>
    </div></section>
    <section className="shell section" data-home-block="ways">
      <h2>Vier Wege ins Portal</h2>
      <div className="home-ways">
        <Link href="/wirkungsakten"><h3>Wirkungsakten</h3><p>Entscheidungen und Analysen gezielt finden.</p><span>Register öffnen →</span></Link>
        <Link href="/monitor"><h3>Wirkungsmonitor</h3><p>Beobachtung, Reality-Checks, Versprechen und Praxis.</p><span>Monitor öffnen →</span></Link>
        <Link href="/ebenen"><h3>Bund, Länder &amp; EU</h3><p>Institutionen und ihre veröffentlichten Prüffälle.</p><span>Ebenen öffnen →</span></Link>
        <Link href="/pruefstandard"><h3>Prüfstandard</h3><p>Methode, Referenzrahmen, Begriffe und Quellen.</p><span>Standard öffnen →</span></Link>
      </div>
    </section>
    <section className="shell section home-states" data-home-block="states">
      <h2>Fachstand in den Ländern</h2><StateCartogram />
      <ul className="home-trust"><li>Unabhängig und parteiunabhängig.</li><li>Amtliche Fakten und WÖk-Analyse getrennt.</li><li>Quellen, Annahmen und Grenzen nachvollziehbar.</li><li>Keine Personenbewertung. <Link href="/pruefstandard/transparenz">Transparenz vollständig lesen →</Link></li></ul>
    </section>
  </div>;
}
