<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@aa10de6b5a5c26badb3747fd3e4a97b540e327a7 path=content/lehrgaenge/akademie/curriculum-v4/offerings/wirkungscontrolling/lectures/03-masterregister-wirkindikatorenregister-provenienz.md curriculum=4.0 sanitized=true -->
# WC-V4-03 · Masterregister, Wirkindikatorenregister und Provenienz

**lecture_id:** `WOEK-WB-WC-V4-003`  
**offering_id:** `WOEK-WB-WC`  
**curriculum_version:** `4.0`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**subtitle:** Was betrachten wir – und womit beobachten wir es?  
**legacy_source:** `content/lehrgaenge/wirkungscontrolling-wc-v3.md`  
**migration_class:** `REWRITE_REQUIRED`  
**reviewed_at:** 2026-08-21

## Lernziele

1. MasterItem, StateVariable, Indicator, Observation und Analysis auseinanderhalten.
2. Masterregister und Wirkindikatorenregister als getrennte Ontologien erklären.
3. WÖk-IDs als Mapping-/Registerschlüssel statt als Qualitätssiegel verstehen.
4. Benchmarks nur mit Population, Region, Zeitraum, Quelle und Validierungsstatus verwenden.

## 20-Sekunden-Erklärung

Das Masterregister sagt, was wir betrachten. Das Wirkindikatorenregister sagt, womit wir reale Zustände beobachten. Beides ist wichtig, aber nicht dasselbe. Eine WÖk-ID verbindet Daten und Bedeutung – sie ist kein Gütesiegel und keine automatische Bewertung.

## Einfach erklärt

Ein Stadtplan und ein Thermometer lösen unterschiedliche Aufgaben. Der Plan sagt, was und wo etwas ist. Das Thermometer beobachtet einen Zustand. Genau diese Trennung braucht eine skalierbare Wirkungsdatenarchitektur.

## Begriffe / Glossarbox

- **MasterItem:** ontologisches Wirkungsobjekt oder Wirkungsaspekt.
- **StateVariable:** konkret beschriebener Zustand, der beobachtet werden soll.
- **Indicator:** Mess-/Beobachtungsgröße.
- **Observation:** Datenwert mit Zeit, Ort, Quelle und Qualität.
- **Provenienz:** nachvollziehbare Herkunft und Veränderungsgeschichte von Daten und Bewertungen.
- **Benchmark:** Vergleichsreferenz für eine definierte Population und Zeit; nicht automatisch eine normative Schwelle.

## Fachliche Vertiefung

Die zentrale Kette lautet MasterItem -> StateVariable -> Indicator -> Observation -> Analysis/RealityCheck. Wird eine Ebene übersprungen, entstehen typische Fehler: Indikatoren werden zur Wirkung erklärt oder Registereinträge zu Bewertungen.

WÖk-IDs dienen der eindeutigen technischen und semantischen Zuordnung. Sie können externe Standards referenzieren. Gute Architektur erfindet nicht für jede Frage eine neue Kennzahl, sondern mappt vorhandene geeignete Indikatoren.

Benchmarks brauchen eine definierte Referenzgruppe. Ein Branchenwert aus 2021 ist kein allgemeingültiger Grenzwert für 2026. Ohne Population, Region, Technologie, Zeitraum und Quelle ist die Zahl nicht entscheidungsreif.

Provenienz umfasst Quelle, Importzeitpunkt, Transformation, Version, Prüferstatus und Verwendungszweck. Sie ist Voraussetzung für Audit und Reproduzierbarkeit.

## Konkretes Beispiel

MasterItem „Arbeitsunfallsicherheit“ kann StateVariables wie schwere Unfallhäufigkeit oder Ausfalltage besitzen. Mehrere Indikatoren können diese Zustände beobachten. Ein Wert wird erst zur Observation, wenn Quelle, Zeitraum und Einheit dokumentiert sind.

## Gegenbeispiel / typische Fehlinterpretation

„WÖk-ID 123 ist grün, also ist das Produkt positiv.“ Eine ID identifiziert; sie bewertet nicht automatisch.

## Was bestehende Methoden bereits leisten

Datenkataloge, statistische Klassifikationen, Ontologien und Metadatenstandards arbeiten seit langem mit getrennten Ebenen. WÖk ordnet diese Prinzipien für ihre Wirkungsarchitektur.

## WÖk-spezifische Einordnung

Der WÖk-Zusatz ist die verbindliche Kette von Ontologie über Beobachtung zu Analyse, Schutzprüfung und Rückkopplung – nicht die Behauptung, Register oder Identifikatoren erfunden zu haben.

## Primär- und Anschlussquellen

- WÖk Begriffsleitfaden v1.5: https://wirkungsoekonomie.de/
- WÖk Methodik: https://wirkungsoekonomie.de/methodik/
- EFRAG / ESRS: https://www.efrag.org/
- GRI Standards: https://www.globalreporting.org/standards/
- EU-Taxonomie: https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en
- Destatis: https://www.destatis.de/
- OECD Evaluation: https://www.oecd.org/dac/evaluation/

## Transferfrage / Praxisaufgabe

Baue für ein Thema eine Mini-Kette mit einem MasterItem, zwei StateVariables, je zwei Indicators und je einer möglichen Observation.

## Prüfungsrelevante Kernaussagen

Masterregister vs. Wirkindikatorenregister, WÖk-ID-Status, Provenienz und Benchmarkvalidität.

## Zusammenfassung

Register schaffen Ordnung. Wirkung entsteht aber nicht aus einem Registereintrag, sondern aus beobachteten Zustandsänderungen und ihrer belastbaren Analyse.

## Weiterführende Links

- https://wirkungsoekonomie.de/methodik/
- https://wirkungsoekonomie.de/begriffe/
- https://wirkungsoekonomie.de/akademie/

## Version / Stand / Änderungsgrund

Version 4.0 · Stand 21.08.2026. Zwei-Ebenen-Architektur verbindlich gemacht; WÖk-ID-Siegel- und Benchmark-Automatismen entfernt.

## Sprechertext

Beim Wirkungscontrolling braucht man zwei Dinge: eine Landkarte und Messgeräte. Das Masterregister ist die Landkarte. Es sagt, welche Wirkungsaspekte wir überhaupt im Blick haben. Das Wirkindikatorenregister liefert die Messgeräte. Es sagt, womit wir Zustände beobachten. Wer beides verwechselt, macht aus einem Datenfeld schnell eine Wahrheit. Wer es trennt, kann sauber prüfen.

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.


## Vertiefendes Lehrkapitel · 6. September 2026

Die folgenden Fälle und Zahlen sind didaktische Konstruktionen. Sie ergänzen die historische Kurzfassung um Argumentation, Anwendung und einen Erwartungshorizont.

### Registereintrag, Messung und Urteil getrennt versionieren

Ein Masterregister beschreibt Gegenstände und ihre stabilen Identitäten. Ein Wirkindikatorenregister beschreibt Zustandsvariablen, Indikatoren und deren fachliche Definitionen. Einzelne Beobachtungen erhalten eigene Angaben zu Messung und Herkunft. Die Analyse verknüpft diese Ebenen, ohne sie in einem einzigen überschreibbaren Feld zusammenzuziehen.

Eine WÖk-ID kann diese Verknüpfung erleichtern. Sie ist kein Qualitätssiegel und enthält nicht automatisch ein positives Wirkungsurteil. Auch ein sauber identifizierter Datensatz kann methodisch ungeeignet, veraltet oder für den konkreten Gegenstand nicht übertragbar sein. Identität, Qualität und Interpretation müssen daher getrennt geprüft werden.

### Durchgearbeiteter Fall: eine Definition ändert sich

Ein fiktives Controlling erfasst jährlich die Wartezeit einer Dienstleistung. In Version 1 beginnt die Messung mit Eingang der ersten Anfrage. In Version 2 beginnt sie erst mit Vorliegen vollständiger Unterlagen. Beide Größen heißen im Alltag „Bearbeitungszeit“, messen jedoch unterschiedliche Abschnitte. Ein unkommentierter Zeitvergleich könnte eine Verbesserung anzeigen, die nur durch die neue Definition entstanden ist.

Das Indikatorenregister erhält deshalb eine neue Definitionsversion. Alte Beobachtungen behalten ihre ursprüngliche Zuordnung. Für einen Vergleich wird entweder eine methodisch begründete Umrechnung vorgenommen, eine gemeinsame Teilperiode neu ausgewertet oder die Nichtvergleichbarkeit ausdrücklich benannt. Die historische Definition wird nicht still durch die neue ersetzt.

Ein verwendeter Benchmark benötigt dieselben Angaben: Population, Region, Zeitraum, Definition und Validierungsstatus. Ein nationaler Durchschnitt ist nicht automatisch ein geeigneter Zielwert für eine spezielle Einrichtung. Er kann Kontext liefern, ohne die Entscheidung allein zu bestimmen.

### Lernarbeit mit Erwartungshorizont

Lege für den Fall fünf verknüpfte Karten an: Gegenstand, Zustandsvariable, Indikatorversion, Beobachtung und Analyse. Jede Karte erhält nur die Angaben, die zu ihrer Funktion gehören. Eine gute Lösung kann die veröffentlichte Aussage bis zur ursprünglichen Messdefinition zurückverfolgen.

Ergänze eine Korrekturregel: Was geschieht bei einem fehlerhaften Messwert, was bei einer veränderten Definition und was bei einer neuen Interpretation? Diese Fälle brauchen unterschiedliche Änderungen. Die Provenienzprüfung ist bestanden, wenn eine zweite Person nachvollziehen kann, welche Fassung zu welchem Zeitpunkt Grundlage der Entscheidung war.
