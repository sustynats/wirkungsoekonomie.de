# Analytics-Metriken und Data Dictionary

Status: Kernformeln implementiert; Admin-API und Export noch nicht vorhanden

## Einheitliche Definitionen

| Metrik | Bedeutung | Zähler | Nenner | Quelle | Aktualisierung | Datenschutzklasse |
| --- | --- | --- | --- | --- | --- | --- |
| Zustellbare Einladungen | technisch versendete Einladungen | `sent` | keiner | Einladungs-Aggregatadapter | täglich | Invitation aggregate |
| Eingelöste Tokens | eingelöste Einladungen | `redeemed` | `sent` optional für Rate | Einladungs-Aggregatadapter | täglich | Invitation aggregate |
| Survey Starts | begonnene Befragungen | `SURVEY_STARTED` | keiner | `analytics.daily_funnel` | täglich | Product aggregate |
| Abgeschlossene Surveys | abgeschlossene Befragungen | `SURVEY_COMPLETED` | keiner | `analytics.daily_funnel` | täglich | Product aggregate |
| Completion Rate | Abschlussquote der begonnenen Befragungen | `SURVEY_COMPLETED` | `SURVEY_STARTED` | `analytics.daily_funnel` | täglich | Product aggregate |
| Median Duration | mittlere Dauerklasse im Prozess | aggregierte Dauer-Buckets | keiner | `analytics.daily_questions` | täglich | Product aggregate |
| Reports Generated | erzeugte Reports | `REPORT_GENERATED` | keiner | `analytics.daily_report_usage` | täglich | Product aggregate |
| Research Opt-in Rate | Anteil akzeptierter Research-Freigaben | `RESEARCH_OPT_IN_ACCEPTED` | `RESEARCH_OPT_IN_SHOWN` | `analytics.daily_consent_usage` | täglich | Product aggregate |
| Public Opt-in Rate | Anteil akzeptierter öffentlicher Freigaben | `PUBLIC_SHARE_OPT_IN_ACCEPTED` | `PUBLIC_SHARE_OPT_IN_SHOWN` | `analytics.daily_consent_usage` | täglich | Product aggregate |
| Report Utility | durchschnittliche Report-Bewertung | Summe `rating` | Anzahl gültiger Bewertungen | `analytics.daily_feedback` | täglich | Product aggregate |

Bei einem Nenner von null wird keine Rate angezeigt. Jede Ansicht trägt Zeitraum, Studie,
Welle, Survey-Version und Methoden-Version. Dashboard und Export verwenden ausschließlich diese
Definitionen.

## Vorgesehene Aggregattabellen

```text
analytics.daily_funnel
date, study_id, wave_id, survey_version,
started_count, completed_count, report_generated_count,
research_opt_in_shown_count, research_opt_in_count,
public_opt_in_shown_count, public_opt_in_count

analytics.daily_steps
date, study_id, wave_id, survey_version, step_index,
view_count, back_navigation_count, drop_off_count

analytics.daily_questions
date, study_id, wave_id, survey_version, step_index, question_type,
view_count, completion_count, skip_count, back_navigation_count,
answer_change_count, duration_p50_bucket, duration_p90_bucket, drop_off_count

analytics.daily_report_usage
date, study_id, wave_id, survey_version, metric_key, count

analytics.daily_consent_usage
date, study_id, wave_id, survey_version, consent_key, shown_count, accepted_count

analytics.daily_feedback
date, study_id, wave_id, survey_version, rating, submission_count
```

Alle Zählungen sind Ereigniszählungen, keine Personen- oder Sessionzählungen. Das ist bewusst
kein Instrument zur Personen- oder Gruppenbewertung.

## Funnel-Registry

```yaml
survey_completion_rate:
  numerator: SURVEY_COMPLETED
  denominator: SURVEY_STARTED
  source: analytics.daily_funnel
  method_version: "1.0"
```

Die konkrete Registry wird mit dem Analytics-Service versioniert und in Unit-Tests mit festen
Fixtures geprüft, zum Beispiel `100 Starts / 80 Completions = 80 %`.

Die gemeinsame Formelsammlung liegt in
`ops/wahlkreis-wirkungscheck/analytics/src/metrics-registry.ts`. Die künftige Dashboard- und
Export-Implementierung muss sie verwenden; eine eigene Formel im Frontend ist nicht zulässig.
