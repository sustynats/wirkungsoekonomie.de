# Survey Architecture

**Entscheidung: REUSE + EXTEND.** Ausgangspunkt ist `ops/wahlkreis-wirkungscheck/` mit CiviCRM/LimeSurvey, Moderation und Disclosure-Control. Produktionsversand bleibt hinter dokumentierter Vier-Augen-Freigabe.

Umfragen sind Dialogdaten, kein Wirkungsnachweis und kein Fachvotum. Aggregierte Werte benötigen `n >= 10` je Kohorte, Zeitraum, Auswahlverfahren und Repräsentativitätshinweis. Gruppen werden nur bei methodisch identischer Frage verglichen; Person, Antwort und Analyse werden nicht verknüpft.
