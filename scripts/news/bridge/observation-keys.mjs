// Kennungen der Vermerke in der Ablage, ohne jede Abhängigkeit.
//
// Der Monitor läuft mit einem sparse-checkout und einem engen Speicherrahmen.
// Würde er `personal-publication.mjs` nur für eine Zeichenkette einbinden, zöge
// er dessen ganzen Abhängigkeitsbaum mit (17.09.2026, vom Prüflauf gemeldet).
// Kennungen, die beide Seiten brauchen, stehen deshalb hier.
export const PARKED_KEY = 'editorial-parked';
