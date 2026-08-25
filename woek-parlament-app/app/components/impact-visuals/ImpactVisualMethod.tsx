import Link from "next/link";
import { GlossaryBasics } from "@/app/components/GlossaryBasics";
import styles from "./ImpactVisualScenario.module.css";

export function ImpactVisualMethod() {
  return <section className={styles.method} id="wirkungsbilder" aria-labelledby="impact-visual-method-title">
    <header>
      <p className={styles.eyebrow}>Wirkungsbilder</p>
      <h2 id="impact-visual-method-title">Was Visualisierung leisten kann – und was nicht.</h2>
      <p className="lead">Ein Wirkungsbild ist eine didaktische Projektion bereits freigegebener Wirkungspfade. Es ist weder Evidenz noch Prognose und ersetzt weder Fachakte noch Quellen.</p>
    </header>
    <div className={styles.methodGrid}>
      <article><span>01</span><h3>Analyse vor Bild</h3><p>Programmtext, Gesetzestitel, Slogan, Keyword, Parteiidentität und Bildmodell sind keine Fachanalyse. Ein Asset darf nur aus einem geprüften, versionierten Visual Brief entstehen.</p></article>
      <article><span>02</span><h3>Sichtbar und nicht sichtbar</h3><p>Jedes sichtbare Element verweist auf einen freigegebenen Wirkpfad. Rechtliche, fiskalische, institutionelle, verteilungsbezogene oder langfristige Folgen bleiben daneben ausdrücklich lesbar, wenn sie fachlich freigegeben sind.</p></article>
      <article><span>03</span><h3>Ex ante und ex post</h3><p>Ex ante zeigt ein Bild nur ein mögliches Szenario. Spätere Beobachtungen erhalten einen getrennten, versionierten Reality Check und überschreiben das ursprüngliche Szenario nicht.</p></article>
      <article><span>04</span><h3>Unsicherheit sichtbar</h3><p>Richtung und Evidenz bleiben getrennt. Offene oder nicht belastbar beurteilbare Folgen werden nicht als eingetretener Zustand abgebildet; geringe Evidenz bleibt als Unsicherheit erkennbar.</p></article>
      <article><span>05</span><h3>Frame- und Stilrisiko</h3><p>Keine Parteifarben, moralische Lichtregie, emotionalen Stereotype oder zusätzlichen Zeichen von Ordnung, Chaos, Wohlstand oder Verfall. Gleicher Perspektiv-, Detail- und Realismusvertrag für alle politischen Gegenstände.</p></article>
      <article><span>06</span><h3>Provenienz und Korrektur</h3><p>Analyseversion, Brief, Modell, Datum, Prompt- und Asset-Hash, Reviewstatus und Änderungshistorie bleiben nachvollziehbar. Neue Analyseversionen erzeugen eine neue Bildversion statt stiller Regeneration.</p></article>
    </div>
    <aside className={styles.methodBoundary}><strong>Harte Grenze:</strong> „Instrument vorhanden“ bedeutet nicht „behaupteter Vorteil eingetreten“. Aus weniger Anspruch für Gruppe A folgt nicht automatisch mehr Wohlstand für Gruppe B; ebenso wenig folgen Wachstum, Sicherheit, weniger Stau, Teilhabe oder positive Netto-Wirkung automatisch aus Steuerentlastung, mehr Polizei, Straßenbau, Subvention oder kostenlosem Angebot.</aside>
    <GlossaryBasics termKeys={["wirkungsbild", "wirkungspotenzial", "wirkpfad", "evidenzgrenze"]} title="Begriffe zum Wirkungsbild" />
    <p><Link className="text-link" href="/laender/sachsen-anhalt#wirkungsbilder">Zum Sachsen-Anhalt-Pilot →</Link></p>
  </section>;
}
