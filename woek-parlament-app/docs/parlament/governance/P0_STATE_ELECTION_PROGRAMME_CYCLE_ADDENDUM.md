# P0 - Automatischer Wahl-, Programm-, Mandats- und Regierungszyklus der Länder

Stand: 18. August 2026

Dieses Addendum ist verbindlich für den föderalen WÖk-Autopiloten.

## Zwei unabhängige Zustandsachsen

`government_lifecycle_state` beschreibt den laufenden Regierungsterm.
`election_cycle_state` beschreibt die nächste Wahl. Eine Regierung kann deshalb
weiter unter `GOVERNMENT_MONITORING` stehen, während die kommende Wahl bereits
unter `PRE_ELECTION_WATCH` oder `PROGRAMME_ANALYSIS` läuft.

Der amtliche Wahlkalender wird cloudbasiert überwacht. Ein präzise amtlich
bekanntgegebener Termin erzeugt einen versionierten `ElectionCycle`. Wahltermin,
Programmfassung, Wahlergebnis, Mandatsdokument und Regierungsbildung werden nie
stillschweigend überschrieben.

## Quellen und Programme

- Wahltermine: Landeswahlleitungen und Bundeswahlleiterin;
- Programme: parteioffizielle Landesquelle, Parteitagsbeschluss, Programmseite
  oder offizielles PDF;
- Medienberichte sind keine Programmquelle;
- Originalfassung, URL, Abrufzeit, Version, Status und Inhalts-Hash bleiben
  erhalten;
- Status: `DRAFT`, `PARTY_CONVENTION_DRAFT`, `ADOPTED`, `FINAL`,
  `SUPERSEDED`;
- unvollständige Quellfragmente werden nicht fachlich bewertet.

CodeX extrahiert quellengebundene `ElectionCommitment`-Kandidaten einschließlich
Fundstelle, Problemannahme, Instrument und vorläufigem Kompetenzbereich. CodeX
erzeugt keine Wirkungsrichtung, keinen Rechtskonflikt, keinen Parteien- oder
Personenscore. Die WÖk-Fachanalyse kommt ausschließlich aus einer
`DEPLOY-APPROVED`-Übergabe des Instituts.

## Kompetenz und Übergänge

Zulässige Kompetenzbereiche sind `LAND_FULL`, `LAND_PARTIAL_SHARED`,
`MUNICIPAL`, `FEDERAL`, `EU`, `OTHER` und `OPEN`, jeweils mit Grundlage,
benötigtem externen Akteur und Umsetzungsweg.

Nach dem amtlichen Ergebnis folgt die getrennte Koalitions-/Regierungsbildung.
Ein `StateGovernmentTerm` endet nicht am Wahltag, sondern erst mit der amtlich
belegten Bildung der neuen Regierung. `GoverningMandateDocument` erzwingt keinen
Koalitionsvertrag und kennt auch Regierungs-, Kooperations-, Prioritäten- und
sonstige Mandatsdokumente.

Die öffentliche Kette lautet:

`ElectionCommitment -> MandateCommitment -> StateGovernmentAction ->
StateParliamentaryCase -> StateLegalAct -> ImplementationObject ->
WÖkImpactCase -> EvidenceEvent -> RealityCheck`

Umsetzungstreue ist keine Wirkung. Es wird keine arithmetische
Parteigesamtnote erzeugt.

## Fail-closed

Nur `DEPLOY-APPROVED` wird veröffentlicht. Quellenfehler, Identitätskonflikte,
offene Kompetenz oder eine manuelle Ausnahme werden in eine Review-Queue
geschrieben. Gleicher Dateiname mit verändertem Hash stoppt den Handoff.

Pflichttests umfassen Wahltrigger, offizielle Programmquelle, Version und Hash,
Fundstelle, Kompetenz, Draft-vs.-Final, Mandats- und Regierungsübergang,
Nichtbeendigung des Terms am Wahltag, Verbot automatischer Wirkungsrichtung und
Parteiennote sowie Source-vs.-View.
