<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v105-praxisprojekt-iteration-umsetzungsplan.md curriculum=4.0 sanitized=true -->
# V105 · Praxisprojekt: Iteration, Recommendation und Umsetzungsplan

**lecture_id:** `WOEK-G-BASE-105`  
**display_code:** `V105`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 macht aus „Iteration und Umsetzungsplan“ ein hartes Recommendation-Gate: keine Empfehlung aus Score, sondern nur aus Problem-/Goal-Review, Optionenvergleich, Schutzgrenzen, Delivery, Distribution, Robustheit und Evidenz. `NO_ROBUST_RECOMMENDATION` bleibt zulässig.

## 20-Sekunden-Einstieg

Jetzt darfst du zum ersten Mal eine Empfehlung formulieren - aber nur, wenn die Analyse sie wirklich trägt. Eine WÖk-Recommendation ist **kein Score-Sieger**. Sie muss sagen: Welche Option ist unter welchen Bedingungen gegenüber realistischen Alternativen vorzuziehen? Welche Schutzgrenzen gelten? Was muss umgesetzt werden? Welche Daten werden beobachtet? Und wann wird die Empfehlung zurückgezogen oder geändert?

## Lernziele

Nach dieser Vorlesung kannst du:

1. eine Recommendation aus dem vollständigen Analysepfad ableiten.
2. robuste, bedingte, segmentierte und nicht mögliche Recommendations unterscheiden.
3. Conditions, Delivery, Verantwortlichkeit und Ressourcen in einen Umsetzungsplan übersetzen.
4. Monitoring-, Recheck- und Fallbackregeln definieren.
5. vermeiden, dass eine Empfehlung als unveränderliche Wahrheit erscheint.
6. ein versioniertes RecommendationRecord für dein Praxisprojekt erstellen.

## 1. Recommendation kommt zuletzt

Die Reihenfolge ist bindend:

`Fact/Source -> Problem Review -> Goal Review -> Options -> Impact Paths -> Evidence -> Boundaries -> Distribution -> Delivery -> Stress/Robustness -> Recommendation`.

Nicht:

`Score -> Recommendation`.

## 2. Vier zulässige Recommendation-Typen

### ROBUST_RECOMMENDATION

Eine Option ist über plausible Annahmen und relevante Dimensionen robust vorzuziehen.

### CONDITIONAL_RECOMMENDATION

Präferenz gilt nur unter expliziten Bedingungen.

Beispiel:

> Option A ist vorzuziehen, sofern Netzanschluss bis Datum X gesichert und Förderbedarf unter Schwelle Y bleibt.

### SEGMENTED_RECOMMENDATION

Unterschiedliche Kontexte brauchen unterschiedliche Optionen.

Beispiel:

> In dichtem Stadtgebiet A, in ländlichem Gebiet B.

### NO_ROBUST_RECOMMENDATION

Evidenz, Boundaries oder Trade-offs tragen keine belastbare Präferenz.

Das ist ein vollwertiges Ergebnis.

## 3. RecommendationRecord

Pflichtfelder:

- `recommendation_id`,
- `analysis_version`,
- `recommended_option`,
- `recommendation_type`,
- `rationale`,
- `conditions`,
- `non_compensable_boundaries`,
- `distributional_safeguards`,
- `delivery_requirements`,
- `resources_financing`,
- `monitoring_indicators`,
- `recheck_triggers`,
- `fallback`,
- `valid_from`,
- `review_due`,
- `status`.

Recommendation wird nie technisch aus einem Score generiert.

## 4. Umsetzungsplan

Ein Umsetzungsplan beantwortet:

- Wer macht was?
- bis wann?
- mit welchen Ressourcen?
- welche rechtliche Grundlage?
- welche Abhängigkeiten?
- welche Zwischenoutputs?
- welche Outcome-Indikatoren?
- welche Schutz-/Härtefallmechanismen?
- welche Eskalations-/Fallbackwege?

Ohne Delivery bleibt Recommendation Theorie.

## 5. Ressourcen und Finanzierung

Prüfe:

- Investitionskosten,
- Betriebskosten,
- Personal,
- IT,
- Beschaffung,
- Folgekosten,
- Finanzierungssicherheit,
- Additionalität,
- Opportunitätskosten.

Eine Option kann wirkungsstark und trotzdem unfinanzierbar oder personell nicht skalierbar sein.

Dann ist das ein Delivery-/Optionsdesignproblem.

## 6. Conditions sind Teil der Empfehlung

Nicht im Kleingedruckten verstecken.

Wenn die Wirkung von Bedingungen abhängt, gehören sie in den ersten Satz.

Beispiel:

> Wärmepumpenoption A ist im definierten Gebäudesegment vorzuziehen, **wenn** Vorlauftemperatur/Netzanschluss/Finanzierung X erfüllen; andernfalls Alternative B prüfen.

So bleibt Recommendation ehrlich.

## 7. Monitoringdesign

Für die Umsetzung wählst du wenige entscheidende Indikatoren:

- Delivery,
- Output,
- Outcome,
- Distribution,
- Boundary,
- Kosten,
- Frühwarnung.

Jeder mit:

- Datenquelle,
- Frequenz,
- Verantwortlichkeit,
- Schwelle,
- Recheck-Trigger.

## 8. Fallback

Jede fragile Annahme braucht einen Plan B.

Fallback kann sein:

- alternative Technologie,
- Übergangsregel,
- temporärer Schutz,
- gestufter Rollout,
- Ausstieg,
- Rückkehr zur vorherigen Option.

Ein Fallback ist keine Niederlage, sondern Resilienz.

## 9. Beispiel: kommunaler Hitzeschutz

Recommendation:

> priorisierte Kombination aus Verschattung, Stadtgrün und gezieltem Schutz vulnerabler Einrichtungen; mobile Klimatisierung nur ergänzend in Hochrisikosituationen.

Conditions:

- Wasser-/Pflegekonzept,
- Flächenverfügbarkeit,
- vulnerable Quartiere priorisiert.

Monitoring:

- lokale Temperatur,
- hitzebedingte Gesundheitsereignisse,
- Zugang vulnerabler Gruppen,
- Pflege-/Wasserbedarf.

Recheck:

- Wirkung bleibt nach zwei Sommern aus,
- Wasserbedarf überschreitet Schwelle,
- neue bessere Option verfügbar.

## 10. Iteration vor Veröffentlichung

Vor finaler Recommendation:

1. Gegenpositionen prüfen.
2. Boundary erneut prüfen.
3. Scope prüfen.
4. neue Quellen seit Start suchen.
5. Conditions in Summary ziehen.
6. RecommendationRecord versionieren.

Danach erst freigeben.

## 11. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| RecommendationRecord | versionierter fachlich freigegebener Empfehlungsdatensatz |
| Condition | notwendige Bedingung für Gültigkeit/Wirksamkeit einer Empfehlung |
| Delivery Requirement | praktische Voraussetzung für Umsetzung |
| Recheck Trigger | definierter Anlass zur erneuten Prüfung |
| Fallback | alternative Handlungsoption bei Scheitern einer Annahme |
| Review Due | geplanter Zeitpunkt zur Überprüfung |
| No Robust Recommendation | keine belastbare Präferenz möglich |

## 12. Typische Fehlinterpretationen

### „Beste Scorecard gewinnt.“
Falsch.

### „Eine Recommendation muss immer existieren.“
Falsch.

### „Conditions gehören in den Anhang.“
Falsch, wenn sie die Gültigkeit tragen.

### „Umsetzungsplan ist Projektmanagement, nicht Wirkung.“
Falsch; Delivery bestimmt reale Wirkung.

### „Fallback zeigt Unsicherheit und schwächt Empfehlung.“
Nein, er erhöht Robustheit.

## 13. Quellen

- WÖk Methodik: https://wirkungsoekonomie.de/methodik/
- OECD Regulatory Policy / implementation and evaluation: https://www.oecd.org/gov/regulatory-policy/
- EU Better Regulation: https://commission.europa.eu/law/law-making-process/planning-and-proposing-law/better-regulation/better-regulation-guidelines-and-toolbox_en

## 14. Transferaufgabe

Erstelle dein RecommendationRecord.

Wenn keine robuste Präferenz besteht, dokumentiere `NO_ROBUST_RECOMMENDATION` und liste die Information/Entscheidung, die für einen späteren Recheck fehlt.

## 16. Prüfungsrelevanz

- Recommendation Gate,
- Recommendation-Typen,
- Conditions,
- Delivery/Resources,
- Monitoring,
- Recheck/Fallback,
- Versionierung.

## 17. Sprechertext

Jetzt darfst du empfehlen.

Aber nur, wenn die Analyse wirklich so weit ist.

Eine Empfehlung entsteht nicht, weil eine Option 74 Punkte hat und die andere 71.

Sie entsteht, wenn Problem und Ziel stimmen, der Wirkpfad trägt, die Evidenz ausreichend ist, Schutzgrenzen eingehalten werden und die Option auch praktisch umsetzbar ist.

Und manchmal lautet die richtige Empfehlung: Wir wissen es noch nicht robust genug.

Das ist kein Ausweichen.

Das ist wissenschaftliche Disziplin.

Wenn du empfiehlst, schreibst du Bedingungen dazu.

Nicht in Fußnote zehn.

Direkt sichtbar.

Und du sagst, wann du die Empfehlung wieder öffnen würdest.

Welche Daten? Welche Schwelle? Welcher Fallback?

Der Merksatz lautet:

**Eine gute Recommendation sagt nicht nur, was wir tun sollten. Sie sagt auch, unter welchen Bedingungen sie gilt - und wann wir unsere Meinung ändern müssen.**
