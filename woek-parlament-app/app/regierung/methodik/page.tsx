import Link from "next/link";
import { CanonicalMethodExplainer } from "@/app/components/CanonicalMethodExplainer";

export default function GovernmentMethodPage() {
  return <section className="section shell government-method-page">
    <p className="eyebrow">Prüfbare Methodik · Bundesregierung</p><h1>Regierungshandeln nach derselben Wirkungslogik prüfen</h1>
    <p className="lead">Für Regierungsakte gilt keine eigene Abkürzung: Erst werden amtlicher Sachverhalt, Problem und Ziel geprüft. Danach folgen Wirkungsanalyse, eine ausschließlich fachlich freigegebene WÖk-Handlungsoption, der getrennte Vergleich an gemeinsamen Zielen und später der Reality Check.</p>
    <blockquote>Eine Wirkungsbewertung soll nicht geglaubt werden müssen. Sie soll geprüft werden können.</blockquote>

    <div className="notice"><strong>Wirkungspotenzial ist noch keine Wirkung</strong><p>Eine Ex-ante-Analyse kann eine fachlich begründete positive, negative, ambivalente oder offene Richtung besitzen, obwohl noch keine Wirkung eingetreten ist. „Ex ante“ bedeutet deshalb nicht „offen“. Fehlende Daten bedeuten nicht neutral und erzeugen keinen Nullwert.</p></div>

    <CanonicalMethodExplainer context="government" />

    <h2>Der damalige Wissensstand bleibt sichtbar</h2>
    <p>Für jede Ex-ante-Analyse gilt ein dokumentierter Wissensstichtag. Geprüft wird, welche Wirkungspotenziale, Risiken, Alternativen und Unsicherheiten vor der Entscheidung erkennbar waren. Amtliche Kommunikation kann Ziele und damalige Annahmen belegen. Sie ersetzt weder unabhängige Evidenz noch die spätere Beobachtung tatsächlicher Wirkung.</p>
    <div className="government-process-line government-process-line--wrap" aria-label="Zeitliche Trennung der Wirkungsanalyse"><span>Vorher verfügbare Quellen</span><b aria-hidden="true">→</b><span>Ex-ante-Wirkungspotenziale</span><b aria-hidden="true">→</b><span>Entscheidung</span><b aria-hidden="true">→</b><span>Umsetzung</span><b aria-hidden="true">→</b><span>Beobachtete Veränderung</span><b aria-hidden="true">→</b><span>Ex-post-Prüfung</span></div>

    <h2>Regierungsakte bleiben eine eigene Faktenschicht</h2>
    <div className="government-method-split"><article><p className="eyebrow">Amtlicher Sachverhalt</p><h3>Was ist geschehen?</h3><p>SourceEvent und Regierungsakt werden getrennt. Eine Pressemitteilung kann einen staatlichen Handlungsgegenstand belegen, ist aber nicht automatisch selbst ein neuer Regierungsakt. Regierung, Parlament, Rechtsakt und Umsetzung bleiben ebenfalls getrennte Objekte.</p></article><article><p className="eyebrow">WÖk-Fachanalyse</p><h3>Was könnte oder hat sich verändert?</h3><p>Wirkungsmechanismus, Empfänger, Zustandsvariable, Richtung, Evidenz, Datenstatus und Zurechnung werden in einer versionierten Analyse dokumentiert. Technische Daten erzeugen diese fachliche Bewertung ausdrücklich nicht automatisch.</p></article></div>

    <h2>Beobachtung ist noch keine Zurechnung</h2>
    <div className="government-formula-card"><p className="formula" aria-label="Beobachtete Veränderung ist der Wert danach minus dem Wert davor">ΔY<sub>beobachtet</sub> = Y<sub>nachher</sub> - Y<sub>vorher</sub></p><p>Diese Differenz zeigt eine Zustandsveränderung. Sie beweist noch nicht, dass der Regierungsakt sie verursacht hat.</p></div>
    <div className="government-formula-card"><p className="formula" aria-label="Geschätzte zusätzliche Veränderung ist die beobachtete Veränderung minus der gegenfaktischen Veränderung">Ŵ = ΔY<sub>beobachtet</sub> - ΔY<sub>gegenfaktisch</sub></p><p>Erst ein tragfähiger Vergleich schätzt, was ohne die Maßnahme wahrscheinlich geschehen wäre. Die Aussagekraft hängt vom Untersuchungsdesign ab; künstliche Prozentgenauigkeit wird nicht erzeugt.</p></div>

    <h2>Wogegen wird Wirkung bewertet?</h2>
    <p>Der Referenzrahmen besteht aus transparent getrennten Ebenen: Mensch, Planet und Demokratie; den Sustainable Development Goals der Vereinten Nationen; SDG+ als ausdrücklich WÖk-eigener Ergänzung; Grundrechten, Staatszielen und Fachrecht; sowie wissenschaftlichen oder technischen Referenzwerten, wo sie fachlich einschlägig sind. SDG+ ist keine offizielle UN-Kategorie. Recht ist nicht dasselbe wie SDG.</p>
    <div className="government-direction-matrix"><article><h3>Wirkungsrichtung</h3><ul><li><span className="direction direction--positive">↑</span> positiv</li><li><span className="direction direction--negative">↓</span> negativ</li><li><span className="direction direction--ambivalent">↕</span> ambivalent</li><li><span className="direction direction--open">?</span> offen</li></ul></article><article><h3>Evidenz</h3><ul><li>hoch</li><li>mittel</li><li>gering</li><li>nicht bewertbar</li></ul><p>Die Evidenzstufe ändert nicht automatisch die Richtung.</p></article><article><h3>Analysephase</h3><ul><li>Fakt</li><li>Ex ante</li><li>Umsetzung</li><li>frühe Beobachtung</li><li>Ex post</li></ul><p>Der Verfahrensstatus ist keine Wirkungsrichtung.</p></article></div>

    <h2>Schwere Schäden lassen sich nicht wegmitteln</h2>
    <p>Eine mögliche Grundrechtsverletzung, ein schwerer irreversibler Schaden oder eine andere begründete Wirkungsgrenze darf nicht durch gute Werte in anderen Feldern aufgerechnet werden. Die Reverse Merit Order ist die Priorisierungslogik; Nichtkompensation ist das Schutzprinzip.</p>
    <div className="government-noncomp"><span>+2</span><span>+3</span><span>+1</span><strong>-3 · Schutzgrenze</strong><b>Keine Durchschnittsschönrechnung</b></div>

    <h2>Kein Ranking von Menschen</h2>
    <p>Das Portal bewertet Handlungen, Entscheidungen, Strukturen und ihre Folgen. Es gibt keine Minister-Note und keinen politischen Social Credit. Amtsträger werden nur genannt, wenn ihre Funktion für die zeitliche und institutionelle Einordnung relevant ist.</p>
    <div className="government-link-row"><Link className="button button-primary" href="/regierung/transparenz">Daten und Grenzen prüfen</Link><Link className="button button-secondary" href="/methodik">Gesamte Portalmethodik</Link></div>
  </section>;
}
