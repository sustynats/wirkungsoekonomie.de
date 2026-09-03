# Analytics Retention

Status: Raw-Event-Purge implementiert; weitere Speicherfristen sind Launch-Gates

## Vorgesehene Fristen

| Speicher | Inhalt | Standardfrist | Löschmechanismus | Monitoring |
| --- | --- | --- | --- | --- |
| `analytics.raw_events` | minimaler Event-Datensatz samt kurzlebiger Nonce | 72 Stunden | `purgeExpiredAnalyticsEvents()` mindestens stündlich | ältester Raw Event, nächster Lauf, Fehlerstatus |
| `analytics.dedupe_keys` | Nonce plus Client-Event-ID | 72 Stunden | gleicher Job wie Raw Events | Anzahl abgelaufener Schlüssel |
| `analytics.daily_*` | nicht personenbezogene Tagesaggregate | 36 Monate | täglicher Retention-Job | älteste Aggregatzeile |
| `research_analytics.*` | disclosure-kontrollierte Research-Aggregate | laut je Studie freigegebenem Forschungsplan, maximal 60 Monate als Default | täglicher Studien-Retention-Job | Frist je Studie/Welle |
| `method_analytics.*` | Qualitäts-, Test- und Quellenstatus | 36 Monate | monatlicher Retention-Job | älteste Messung |
| `privacy_ops.*` | Lösch- und Privacy-Operations | 36 Monate | monatlicher Retention-Job | letzte erfolgreiche Bereinigung |
| `security_monitoring.*` | minimale Security-Alert-Metadaten | 180 Tage | täglicher Retention-Job | ältester Alert |

Die Studieneinstellung kann Fristen nur verkürzen, nicht verlängern. Die endgültigen
Forschungsfristen werden vor Produktivstart im Datenschutz- und Forschungskonzept bestätigt.

## Job-Verhalten

Ein Job ist erfolgreich erst, wenn er die erwartete Zahl abgelaufener Datensätze löscht, den
Laufzeitpunkt in `privacy_ops.retention_runs` erfasst und einen fehlerfreien Health-Status liefert.
Der Job protokolliert keine Rohpayloads.

Fehlt ein erfolgreicher Raw-Purge länger als 90 Minuten, wird ein Privacy-Alert ausgelöst. Die
Admin-Ansicht `Data Retention Health` zeigt ältesten Rohdatensatz, nächsten Lauf und fehlgeschlagene
Jobs; sie zeigt nie den Inhalt eines Rohereignisses.

Der stündlich laufende Container-Job führt die implementierte Funktion
`purgeExpiredAnalyticsEvents()` für `analytics.raw_events` aus. Die Fristen für Research-,
Method-, Privacy- und Security-Speicher werden erst zusammen mit den dafür noch fehlenden
Pipelines implementiert und blockieren deren Produktivnutzung.
