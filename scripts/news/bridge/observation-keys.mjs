// Kennungen der Vermerke in der Ablage, ohne jede Abhängigkeit.
//
// Der Monitor läuft mit einem sparse-checkout und einem engen Speicherrahmen.
// Würde er `personal-publication.mjs` nur für eine Zeichenkette einbinden, zöge
// er dessen ganzen Abhängigkeitsbaum mit (17.09.2026, vom Prüflauf gemeldet).
// Kennungen, die beide Seiten brauchen, stehen deshalb hier.
export const PARKED_KEY = 'editorial-parked';

// Auftraege, deren einziger bezahlter Versuch nichts abgeliefert hat. Sie
// kehren erst mit einer Vertragskorrektur (hoehere Workerversion) zurueck und
// standen bis dahin in keinem Bericht: am 16.09.2026 lagen drei so da, einer
// seit dem 13.09., und Natalie hat sie nie zur Freigabe gesehen.
export const EXHAUSTED_ORDERS_KEY = 'editorial-orders-exhausted';

// Der Grund eines gescheiterten Versuchs steht als "CODE · Detail" im Vermerk.
// Das Detail kann Bruchstuecke des Entwurfs enthalten, und Laufprotokolle sind
// oeffentlich - hinaus geht deshalb nur die Kennung. Beide Seiten, die sie
// brauchen (Worker und Auftragsbefund), lesen dieselbe Funktion.
export function fehlerkennung(wert) {
  const erster = String(wert || '').split('\u00b7')[0].trim();
  if (!erster) return null;
  return /^[A-Z][A-Z_0-9]{3,79}$/.test(erster) ? erster : 'nicht als Kennung lesbar';
}
