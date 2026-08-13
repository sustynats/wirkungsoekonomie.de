# Research Analytics

Status: verbindlicher Entwurf vor Implementierung

## Zulässiger Pfad

```text
Research Store
  → Aggregationsjob
  → CohortDisclosureGuard und Sekundärunterdrückung
  → research_analytics Cube
  → Dashboard oder Export
```

Research Analytics setzt eine explizite, dokumentierte Research-Freigabe voraus. Das Dashboard
liest standardmäßig nie eine Antwortzeile. Der Product-Analytics-Collector ist kein Eingang für
Researchdaten.

## Cube

Vorgesehene Dimensionen sind `study_id`, `wave_id`, `region_cluster`, `federal_state`,
`urbanity_class`, `question_id` und `answer_code`. `party`, Name und exakter Wahlkreis werden
nicht automatisch als Dimension angelegt.

`ENABLE_PARTY_RESEARCH_ANALYTICS=false` ist der feste Default. Eine Aktivierung bedarf einer
ausdrücklichen methodischen und datenschutzrechtlichen Freigabe und erzeugt niemals einen
Einfluss auf den produktiven Recommendation-Pfad.

## Erlaubte Abfragen

Abfragen erlauben nur registrierte Zeiträume, Studie/Welle und maximal drei Dimensionen. Der
Server lehnt freie Filter, SQL-artige Ausdrücke und Kombinationen ab, die Rückrechnungen
erleichtern. Es gibt keine individuelle Drilldown-, Empfänger- oder Antwortansicht.

## Reporting-Vorbereitung

Die Cube-APIs unterstützen später ein Bundestags-Wirkungsbarometer und weitere Studien wie
`EP_2027`. Eine Veröffentlichung erfolgt nie automatisch; sie verlangt einen eigenen
redaktionellen und methodischen Freigabeschritt.
