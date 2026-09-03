# P0 - WÖk-Wirkungsobservatorium, EvidenceEvents und Reality Checks

Stand: 18. August 2026

Politische Wirkungsanalysen bleiben versioniert und lernfähig. Neue Messwerte,
Evaluationen oder außergewöhnliche Ereignisse dürfen eine Bewertung aber nie
automatisch oder still verändern.

## Trennung der Objekte

- `StateObservation`: quellengebundener Messwert ohne Interpretation;
- `OutcomeSeries`: definierte, versionierte Zeitreihe;
- `ExternalShock`: äußerer Kontext, niemals `GovernmentAction`;
- `EvidenceEvent`: materieller, öffentlich erklärter Befund;
- `RealityCheckCandidate`: fachlicher Prüfbedarf, noch keine Zurechnung;
- `AnalysisVersionUpdate`: freigegebene, öffentlich begründete Änderung.

Eine neue Analyseversion braucht `supersedes_analysis_version`, mindestens ein
öffentliches `triggering_evidence_event_id`, einen Änderungsgrund, eine
öffentliche Zusammenfassung und die geänderten Felder. Alte Versionen und
revidierte Beobachtungswerte bleiben erhalten.

## Zurechnung

Zulässige Stufen sind `EXTERNAL_CONTEXT`, `NO_ATTRIBUTION`,
`POSSIBLE_CONTRIBUTION`, `PLAUSIBLE_CONTRIBUTION`, `PARTIAL_ATTRIBUTION`,
`DIRECT_ATTRIBUTION` und `OPEN`. Zeitliches Zusammentreffen ist kein
Kausalitätsnachweis. Ein Source-Release oder Grenzwert-Trigger bedeutet nur
Reviewbedarf.

Beziehungen zu einem Wirkungsfall bleiben explizit: Mechanismus stützen oder
widersprechen, Baseline oder Kontext ändern, Risiko oder positives Potenzial
materialisieren, Reality Check auslösen, Gegenfaktum, Verteilung oder Resilienz
betreffen oder nur Kontext sein.

## Quellenmonitoring

Cloudbasierte Release-Monitore beobachten amtliche Quellenfamilien für Wetter,
Wasser, Wald, Landwirtschaft, Natur, Emissionen, Energie, Infrastruktur,
Gesundheit, Pflege, Arbeitsmarkt, Wirtschaft, Preise, Wohnen, Bildung,
Demografie, Migration, Finanzen, Sozialsysteme und institutionelle Resilienz.
Eine geänderte Seite wird nur als Quellenkandidat erfasst. Erst fachlich
freigegebene `APPROVED_PUBLIC_EVIDENCE_EVENTS`,
`APPROVED_ANALYSIS_UPDATES` und `APPROVED_REALITY_CHECKS` dürfen in den
öffentlichen Stand eingehen.

Migration und Generationengerechtigkeit bleiben mehrdimensional. Es gibt keine
undefinierte „Migrationszahl“ und keine einzelne Generationengerechtigkeitsnote.
Extreme Wetter-, Versorgungs-, Infrastruktur- oder Gesundheitsereignisse sind
`ExternalShock` und werden nicht einer Regierung zugerechnet, nur weil sie in
deren Amtszeit auftreten.

## Public UI und Gate

Relevante Wirkungsfälle können Beobachtungsreihen, eine chronologische
EvidenceEvent-Timeline und den Vergleich zweier Analyseversionen zeigen. Jede
Änderung erklärt Quelle, Datenqualität, Wirkpfadbezug und Zurechnungsgrenze.

Der vollständige Prüfpfad lautet:

`Originalquelle -> StateObservation -> EvidenceEvent -> WÖkImpactCase ->
AnalysisVersion -> Public Export -> Website`

Ohne öffentlich referenzierbares EvidenceEvent schlägt das Publication Gate
einer bewertungsändernden Analyseversion fehl.
