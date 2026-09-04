import Link from "next/link";

export function PortalStandExplanation() {
  return <section className="shell section" id="portalstand" aria-labelledby="portalstand-explanation-title">
    <h2 id="portalstand-explanation-title">Portalstand: Zählweise, Datenstand und Grenzen</h2>
    <p>Die Aktenzahl zählt eindeutige veröffentlichte Objekte im <Link href="/wirkungsakten">gemeinsamen Register</Link>, nicht alle Quellen, Zusagen oder atomaren Wirkpfade des Portals. Ein Quellen- oder Verfahrensdatensatz ist nicht automatisch eine abgeschlossene Fachanalyse. Die Anzahl ist kein Wirkungswert.</p>
    <p>Der Parlamentsradar zählt ausschließlich veröffentlichte Vorgänge seines definierten Prüfumfangs. Er ist kein vollständiger parlamentarischer Kalender. Die drei Startkarten sind ein Ausschnitt dieses Bestands, keine Rangliste nach Wirkung.</p>
    <p>Das Reifeband zählt dieselben Registerobjekte je explizit belegter Stufe. Ex ante, Umsetzung, beobachtete Zustandsveränderung und Zurechnung werden nicht vermischt. Nicht zugeordnete Akten haben eine eigene Kategorie und absolute Zahl. Ein vollständiger Analysebericht beweist keine eingetretene Wirkung.</p>
    <p>Der ausgewiesene Aktenstand ist das jüngste vorhandene Datum im Register, kein Abruf- oder Verifikationsdatum aller Quellen. Akten ohne vergleichbares Datum werden gesondert gezählt. Die Länderkarte verwendet den veröffentlichten, jeweils abgegrenzten Fachstand. Ein vollständiges Wahlprogramm-Prüfpaket sagt nichts über die Vollständigkeit der gesamten Landespolitik aus; initiale Fälle und Materialitätsreviews bleiben Teilbestände.</p>
    <p>Eine Anzahl „fachlich geprüfter amtlicher Quellen“ wird nicht ausgewiesen: Das Quellenregister enthält keine belastbare, einheitliche Freigabeklassifikation für diese Kennzahl. Ein vorhandener Link oder eine amtliche Herkunft ersetzt keinen dokumentierten Fachprüfnachweis.</p>
    <p>Die zugrunde liegenden Akten, Länderprüfungen und Quellenstände bleiben über <Link href="/wirkungsakten">Register</Link>, <Link href="/ebenen/laender">Länderseiten</Link> und <Link href="/pruefstandard/quellen">Quellenarchiv</Link> erreichbar.</p>
  </section>;
}
