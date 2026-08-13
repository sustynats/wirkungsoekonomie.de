# Analytics Testing und Launch Gate

Status: Collector- und Disclosure-Unit-Tests implementiert; vollständiges Launch-Gate offen

## Pflicht-Tests

| Bereich | Test | Erwartung |
| --- | --- | --- |
| Schema | unbekanntes Event oder zusätzliches Feld | HTTP 400, keine Speicherung |
| Sensitive Data Guard | künstliche E-Mail, Name, Partei, Antwortwert, Token, Response-ID, Freitext, IP und User-Agent | Event verworfen, Alert ohne Payload |
| Antwortschutz | `answerId`, `answerValue` oder ausgewähltes Thema | Event verworfen |
| Deduplizierung | gleiche Nonce und gleiche Client-Event-ID | genau ein Rohereignis und ein Aggregatzähler |
| Nonce-Trennung | Survey- oder Invitation-ID anstelle des Analytics-Nonce | Event verworfen |
| TTL | Event/Nonce älter als 72 Stunden | vollständig gelöscht, Aggregate bleiben korrekt |
| Metriken | 100 Starts, 80 Abschlüsse | Completion Rate = 80 % |
| Disclosure | `n < 10` und rückrechenbare Totale | serverseitig unterdrückt, Export identisch geschützt |
| RBAC | `ANALYTICS_VIEWER` gegen Research-Row-Level-Route | 403 oder Route nicht vorhanden |
| Export | CSV/PDF mit kleiner Kohorte | kein Bypass gegenüber Dashboard |
| Neutralität | synthetische Fixtures für Partei, Name, Geschlecht und irrelevante Metadaten | invariantes Ergebnis, deterministische Reproduzierbarkeit |
| Quellen | veraltete und fehlende Quelle | Status `STALE` beziehungsweise `MISSING` sichtbar |
| E2E | Einladung, Einlösung, Survey, zehn Schritte, Abschluss, Report, Freigabe | kein Store enthält Identität und Antworten gemeinsam |

## CI-Schutz

CI führt Typ-, Unit- und Integrationstests aus und verweigert Änderungen, die neue
Analytics-Properties ohne Katalogeintrag einführen. Ein Architekturtest prüft explizit, dass es
keinen Join-Pfad zwischen `InvitationRecipient` und `ProductAnalyticsEvent` gibt.

## Produktiv-Gate

Vor dem ersten Produktivereignis wird dokumentiert beantwortet:

1. Kann Analytics die Antwort einer bestimmten Person offenlegen? **Nein.**
2. Kann Product Analytics politische Antwortwerte speichern? **Nein.**
3. Sind kleine Gruppen durch serverseitige Disclosure Controls geschützt? **Ja.**
4. Kann das System Fragebogenprobleme, Methodenqualität und Quellenalter erkennen? **Ja.**
5. Ist die Recommendation Engine parteiunabhängig und aus Analytics nicht beeinflussbar? **Ja.**
6. Sind Test- und Produktivdaten getrennt? **Ja.**

Ein negativer oder nicht belegter Punkt sperrt den Produktionsstart.
