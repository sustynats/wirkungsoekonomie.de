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
