<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ee7fec6b8a738b78bda9b989eba252963a325daf path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v106-praxisprojekt-wirkungsdossier-schreiben.md curriculum=4.0 sanitized=true -->
# V106 · Praxisprojekt: Das Wirkungsdossier schreiben - reproduzierbar, prüfbar, versioniert

**lecture_id:** `WOEK-G-BASE-106`  
**display_code:** `V106`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 macht das Abschlussdossier zu einer reproduzierbaren Fachakte mit Source/Version/Problem/Goal/Wirkpfad/Evidenz/Optionen/Boundaries/Recommendation/Reality-Check-Plan statt zu einem linearen Essay ohne Audit-Trail.

## 20-Sekunden-Einstieg

Dein Wirkungsdossier soll nicht nur gut klingen. Eine andere fachkundige Person muss nachvollziehen können, **welchen Gegenstand du analysiert hast, welche Quellen du verwendet hast, welche Annahmen du gemacht hast und warum du zu deinem Ergebnis kommst**. Deshalb ist das Dossier eine versionierte Fachakte: kurze Entscheidungsebene vorne, vollständiger Audit-Trail dahinter.

## Lernziele

Nach dieser Vorlesung kannst du:

1. ein Wirkungsdossier nach einer reproduzierbaren v4-Struktur aufbauen.
2. Executive Summary und Fachakte verlustarm miteinander verbinden.
3. Quellen, Versionen, Analyserecords und Recommendation sauber referenzieren.
4. Open Points, Unsicherheit und Gegenpositionen sichtbar halten.
5. Tabellen/Grafiken ohne Scheingenauigkeit einsetzen.
6. ein Dossier für spätere Reality Checks fortschreibbar machen.

## 1. Zwei Lesetiefen

Ein gutes Dossier dient zwei Gruppen:

### Entscheidungsebene

Braucht in 1-3 Minuten:

- Gegenstand,
- Gesamtbefund,
- stärkste Potenziale,
- größte Risiken,
- Evidenz,
- Open Points,
- Recommendation/keine Recommendation.

### Fachprüfung

Braucht vollständige:

- Quellen,
- Methodik,
- Wirkpfade,
- Daten,
- Gegenfaktum,
- Alternativen,
- Unsicherheit,
- Versionierung.

Beide Ebenen müssen denselben Inhalt spiegeln.

## 2. Verbindliche Dossierstruktur

1. Titel / Project ID / Version.
2. Executive Summary.
3. Gegenstand / Primärquelle / Lifecycle.
4. Scope / Out-of-Scope.
5. Problem Review.
6. Goal Review.
7. bestehende staatliche/externe Prüfung soweit relevant.
8. Wirkpfade A→M→ΔZ→R.
9. State Variables / Indikatoren / Datenquellen.
10. positive Wirkungen.
11. negative Wirkungen / Zielkonflikte.
12. Distribution / Generation / Spatial.
13. Boundaries / Recht / Kompetenz.
14. Delivery / Resources / Financing.
15. Counterfactual / Attribution.
16. Stress / Resilience / Lock-in.
17. Optionsvergleich.
18. Adversarial Review / Gegenevidenz.
19. RecommendationRecord oder No Robust Recommendation.
20. Monitoring / Recheck / Reality Check.
21. Version History / Changelog.
22. Quellenanhang.

## 3. Executive Summary

Maximal so kurz, dass nichts Materielles verzerrt wird.

Es enthält:

- **Was?**
- **Wirkungsrichtung/Potenzial?**
- **Warum?**
- **Wie belastbar?**
- **größter Trade-off?**
- **Boundary/Open?**
- **Recommendation?**

Keine technischen Prozessmetadaten vor dem Fachbefund.

## 4. Source IDs statt Linkfriedhof

Jede Quelle erhält:

- `source_id`,
- Titel,
- Herausgeber,
- Datum/Version,
- URL/Identifier,
- Source Locator,
- Behauptung/Funktion.

Im Text referenzierst du Source IDs.

So kann später eine Quelle aktualisiert werden, ohne Dossierlogik zu verlieren.

## 5. Tabellen und Grafiken

Nützlich:

- Wirkpfaddiagramm,
- Wirkungsprofil,
- Optionsmatrix,
- Evidenzprofil,
- Zeit-/Generationenwirkung,
- Lifecycle-Grafik.

Nicht nützlich:

- dekorative Gauges,
- nicht begründete Gesamtpunkte,
- Diagramme mit abgeschnittenen Achsen,
- Farben ohne Textäquivalent.

## 6. State-vs-WÖk bei Bundesfällen

Wenn vorhanden, eigener Abschnitt:

**Staatliche GFA/Nachhaltigkeitsprüfung/eNAP**

getrennt von:

**Unabhängige WÖk-Analyse**.

Dann:

- Konvergenz,
- zusätzliche Befunde,
- echte Widersprüche,
- Evidenz.

Nicht staatliche Einschätzung still als WÖk übernehmen.

## 7. Zitier- und Behauptungsdisziplin

Jede materielle Tatsachenbehauptung muss eine Quelle haben.

Eigene analytische Schlussfolgerungen klar markieren:

- `WÖk-Befund`,
- `Hypothese`,
- `offen`,
- `Recommendation`.

Keine erfundenen Quellen, keine Sekundärquelle als Ersatz für zugängliche Rechts-/Primärquelle.

## 8. Versionierung

Dossier v1.0 ist nicht endgültig.

Bei neuer Evidenz:

- neue Version,
- Changelog,
- welche Felder geändert?
- warum?
- Recommendation betroffen?
- Reality Check ergänzt?

Keine stille Überschreibung.

## 9. Beispiel eines Revisionseintrags

> v1.2, 2027-05-10: Neue Evaluation zeigt geringeren Outcome als ex ante erwartet. Evidence Level für M2 von MEDIUM auf HIGH, Impact Direction bleibt POSITIVE, Effektstärke deutlich reduziert. Recommendation von ROBUST auf CONDITIONAL geändert. Recheck 2028.

So bleibt Lernen nachvollziehbar.

## 10. Was nicht ins Dossier gehört

- unbelegte politische Werturteile,
- KI-Rohoutput,
- technische IDs ohne Erklärung im Haupttext,
- Prozessstatus vor Ergebnis,
- versteckte Unsicherheit,
- wahllose Materialsammlung.

## 11. Pflichtartefakte im Anhang

- Project Charter,
- Indicator Register Extract,
- Optionsmatrix,
- Risk/Resilience Appendix,
- Adversarial Review Appendix,
- Distribution and Abuse Matrix,
- RecommendationRecord,
- Source Manifest,
- Version History.

## 12. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Wirkungsdossier | versionierte reproduzierbare Fachakte eines Wirkungsfalls |
| Executive Summary | kurze verlustarme Entscheidungsebene |
| Source Manifest | strukturierte Quellenliste mit IDs/Funktionen/Versionen |
| Analysis Version | versionierter Stand der Fachanalyse |
| Changelog | dokumentierte Änderung zwischen Versionen |
| Audit Trail | nachvollziehbare Kette von Quelle über Analyse zu Urteil |

## 13. Typische Fehlinterpretationen

### „Ein Dossier ist ein langer Essay.“
Zu wenig.

### „Executive Summary darf Risiken weglassen.“
Falsch.

### „Links im Fließtext reichen als Provenienz.“
Für ein robustes Fachsystem zu schwach.

### „Neue Evidenz überschreibt alte Version.“
Falsch.

### „KI-Zusammenfassung kann als Quelle dienen.“
Falsch.

## 14. Quellen

- WÖk Methodik: https://wirkungsoekonomie.de/methodik/
- WÖk Referenz: https://wirkungsoekonomie.de/referenz/
- OECD Regulatory Policy: https://www.oecd.org/gov/regulatory-policy/

## 15. Transferaufgabe

Erstelle das Inhaltsverzeichnis deines vollständigen Dossiers und fülle Executive Summary, Source Manifest und Version History aus.

Prüfe anschließend, ob jede Aussage im Summary im Fachteil belegt ist.

## 17. Prüfungsrelevanz

- Dossierstruktur,
- Executive/Fachakte-Konsistenz,
- Source Manifest,
- State-vs-WÖk-Trennung,
- Visual Integrity,
- Version/Changelog,
- Pflichtanhänge.

## 18. Sprechertext

Dein Wirkungsdossier ist kein Aufsatz, den man einmal abgibt und dann vergisst.

Es ist eine Fachakte.

Vorne muss jemand in zwei Minuten verstehen: Worum geht es? Was wirkt wahrscheinlich wie? Was ist das größte Risiko? Wie sicher ist das? Was empfehlen wir - oder eben nicht?

Und hinten muss eine andere Person alles nachprüfen können.

Welche Quelle? Welche Version? Welcher Wirkpfad? Welche Daten? Welches Gegenfaktum?

Wenn du später neue Evidenz bekommst, überschreibst du das Dossier nicht heimlich.

Du machst eine neue Version und erklärst, was sich geändert hat.

So entsteht institutionelles Gedächtnis.

Der Merksatz lautet:

**Ein gutes Dossier überzeugt nicht durch Länge. Es überzeugt dadurch, dass jeder wichtige Satz zurück zu Quelle, Annahme und Entscheidungspfad verfolgt werden kann.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.
