# Monitoring Engine

**Entscheidung: REUSE.** Master Items v1.3 liefert Indikator-IDs und Prüfstatus. Jede Monitorzeile hat Erwartung, Indikator, WÖk-ID, Beobachtung, Beobachtungsstand und Status.

Status: `NOT_YET_OBSERVABLE`, `ON_TRACK`, `MIXED`, `OFF_TRACK`, `BOUNDARY_RISK`, `DATA_GAP`. Der Pflichtsatz „Aus einer Zeitreihe allein folgt keine Kausalität“ steht vor jedem Monitor. Kritische Abweichungen erzeugen `VERDICT_REVIEW_REQUIRED`, aber kein automatisches Update.
