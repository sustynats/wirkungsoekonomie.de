<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v35-nichtkompensation.md curriculum=4.0 sanitized=true -->
# V35 · Nichtkompensation: Schutz vor Greenwashing, Rights-Washing und Scheinsaldierung

**lecture_id:** `WOEK-G-BASE-035`  
**display_code:** `V35`  
**curriculum_version:** `4.0`  
**legacy_source:** `content/lehrgaenge/woek-g-v35.md` @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 erweitert Nichtkompensation von einem Anti-Greenwashing-Prinzip zu einer allgemeinen Schutzregel für harte rechtliche, menschenbezogene, sicherheitsbezogene und wissenschaftlich begründete Grenzen. Sie wird vor Aggregation und Empfehlung geprüft.

## 20-Sekunden-Einstieg

Eine Entscheidung kann in drei Bereichen gut und in einem Bereich unzulässig sein. Dann ist „im Durchschnitt positiv“ keine ausreichende Antwort. **Nichtkompensation** bedeutet: Harte Schutzgrenzen werden nicht durch Vorteile an anderer Stelle rechnerisch aufgehoben. Das schützt nicht nur vor Greenwashing, sondern auch davor, Grundrechte, Sicherheit oder irreversible Schäden in einem Gesamtscore verschwinden zu lassen.

## Lernziele

Nach dieser Vorlesung kannst du:

1. kompensierbare Zielkonflikte von nichtkompensierbaren Schutzgrenzen unterscheiden.
2. erklären, warum Nichtkompensation vor Aggregation geprüft wird.
3. rechtliche, sicherheitsbezogene, menschenbezogene und ökologische Boundary-Typen unterscheiden.
4. einen Boundary Trigger quellen- und fallbezogen dokumentieren.
5. Greenwashing und „Rights-Washing“ als Scheinsaldierungsprobleme erkennen.
6. eine Option verbessern oder ausschließen, statt ihre harte Schwäche wegzurechnen.

## 1. Warum Durchschnittswerte gefährlich sein können

Angenommen, eine Maßnahme hat:

- starke Klimavorteile,
- moderate Kostenvorteile,
- gute Innovationswirkung,
- aber einen unzulässigen Eingriff in ein Grundrecht.

Ein arithmetischer Gesamtscore könnte trotzdem positiv sein.

Das wäre methodisch falsch.

Denn bestimmte Grenzen sind **keine Handelsware im Punktesystem**.

## 2. Vier typische Boundary-Kategorien

### 2.1 Rechtliche Grenzen

Zum Beispiel zwingendes Recht, unzulässige Grundrechtseingriffe oder verbindliche Sicherheitsanforderungen.

WÖk ersetzt die juristische Prüfung nicht. Wenn eine Rechtsfrage materiell ist, muss sie fachjuristisch geprüft oder `LEGAL_OPEN` markiert werden.

### 2.2 Menschenbezogene Mindestbedingungen

Zum Beispiel elementare Sicherheit, Menschenwürde oder schwerwiegende Ausbeutung.

Nicht jeder soziale Nachteil ist automatisch harte Grenze. Die Grenze braucht eine begründete Quelle/Norm.

### 2.3 Sicherheits-/Gesundheitsgrenzen

Zum Beispiel eindeutig nicht tolerierbare Produktsicherheits- oder Expositionsrisiken.

Auch hier muss der Schwellenwert fachlich belegt sein.

### 2.4 Ökologische Schwellen / Irreversibilität

Bei bestimmten Schäden kann Überschreitung sehr schwer oder nicht reversibel sein.

Nicht jede Umweltwirkung ist harte Grenze. `BOUNDARY` setzt einen belastbaren normativen/rechtlichen/wissenschaftlichen Bezug voraus.

## 3. Zielkonflikt ist nicht automatisch harte Grenze

Zwei legitime Ziele können sich widersprechen.

Beispiel:

- schneller Netzausbau,
- Natur-/Flächenschutz.

Das ist zunächst ein Zielkonflikt.

Er verlangt:

- Alternativen,
- Vermeidungs-/Minderungsmaßnahmen,
- räumliche Planung,
- Abwägung.

Eine harte Grenze liegt erst vor, wenn ein Mindeststandard oder eine nicht zulässige Überschreitung erreicht wird.

## 4. Boundary Gate vor Score

Die Reihenfolge in v4.0:

1. Gegenstand/Quelle klären.
2. Problem/Goal Review.
3. Wirkpfade und relevante Grenzen identifizieren.
4. Boundary-Status je Grenze prüfen.
5. Erst danach optionale Aggregation/RMO.

Mögliche Status:

- `NOT_TRIGGERED`
- `TRIGGERED`
- `OPEN`
- `NOT_APPLICABLE`

Ein `OPEN` Boundary-Risiko darf nicht einfach in die normale Scorearithmetik einfließen.

## 5. Was passiert bei `TRIGGERED`?

Nichtkompensation bedeutet nicht automatisch, dass jede Option sofort verworfen wird.

Mögliche Konsequenzen:

- Option ist rechtlich/unzulässig und fällt aus dem Optionsraum.
- Design muss verändert werden.
- Schutzmaßnahme ist zwingende Bedingung.
- Alternative muss gewählt werden.
- zusätzliche Evidenz ist nötig.

Die Handlung hängt vom Boundary-Typ ab.

## 6. Beispiel: Batterie mit sehr gutem CO₂-Fußabdruck

Eine Batterie hat:

- sehr niedrige Lebenszyklus-Emissionen,
- hohe Recyclingquote,
- gute Energiedichte.

Gleichzeitig gibt es glaubhafte Hinweise auf schwere Zwangsarbeitsrisiken in einem Rohstoffpfad.

Eine WÖk-Scorecard darf nicht sagen:

> „Der positive Klimanutzen gleicht das aus.“

Stattdessen:

- Menschen-/Arbeitsrechts-Boundary prüfen,
- Lieferkette/Quelle verifizieren,
- alternative Beschaffung oder Nachweis verlangen,
- Klimanutzen separat sichtbar lassen.

## 7. Greenwashing und Rights-Washing

### Greenwashing

Positive Umweltaspekte werden hervorgehoben, während andere relevante Umwelt-/Sozialwirkungen ausgeblendet werden.

### Rights-Washing

Positive soziale oder wirtschaftliche Nutzen werden genutzt, um Grundrechts-/Schutzprobleme rhetorisch kleinzurechnen.

Nichtkompensation bekämpft beide Muster, indem sie **Boundary-Fragen separat** hält.

## 8. Keine erfundenen Grenzen

Eine harte Grenze ist mächtig - und deshalb missbrauchsanfällig.

WÖk darf nicht beliebige politische Präferenzen zu „roten Linien“ erklären.

Für jede Boundary braucht es:

- konkrete Quelle/Norm/Schwelle,
- Anwendungsbereich,
- Systemrand,
- Evidenz,
- Begründung, warum kompensatorische Abwägung unzulässig oder fachlich inadäquat ist.

Wenn das nicht geklärt ist:

`BOUNDARY_STATUS = OPEN`.

## 9. Nichtkompensation und Optionen

Das stärkste Ergebnis ist oft nicht „Nein“, sondern **besseres Design**.

Beispiel:

Eine Infrastrukturvariante verletzt einen Schutzraum. Eine alternative Trasse erreicht das gleiche Versorgungsziel mit geringerem Eingriff.

Dann hilft Nichtkompensation, den Optionsvergleich zu schärfen.

Sie macht Zielkonflikte produktiv: Nicht „ob wir Ziel A oder B opfern“, sondern „welche Option erfüllt beide unter den Grenzen am robustesten?“

## 10. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Nichtkompensation | harte Grenzen werden nicht durch Vorteile in anderen Feldern verrechnet |
| Boundary | fachlich/rechtlich begründete harte Schutz-/Mindestgrenze |
| Boundary Trigger | konkrete Feststellung, dass eine Boundary betroffen/überschritten ist |
| Target Conflict | Spannung zwischen legitimen Zielen; nicht automatisch harte Grenze |
| Mitigation | Maßnahme zur Vermeidung/Minderung einer negativen Wirkung |
| Rights-Washing | rhetorische oder rechnerische Verdeckung von Rechte-/Schutzproblemen durch andere Vorteile |

## 11. Typische Fehlinterpretationen

### „Jede negative Wirkung ist nichtkompensierbar.“
Falsch.

### „Boundary = persönliche rote Linie.“
Falsch.

### „OPEN Boundary kann wie 0 behandelt werden.“
Falsch.

### „Nichtkompensation verhindert jeden Trade-off.“
Falsch. Sie trennt harte Grenzen von normalen Zielkonflikten.

### „Ein Boundary Trigger sagt automatisch, welche Alternative gewählt werden muss.“
Falsch. Er schränkt den zulässigen Optionsraum ein; Optionsvergleich bleibt nötig.

## 12. WÖk-Abgrenzung

Nichtkompensatorische Constraints existieren auch in Recht, Sicherheitsmanagement, Multi-Criteria-Decision-Analysis und Nachhaltigkeitskonzepten. WÖk übernimmt diese Logik als explizites Gate vor Aggregation und Recommendation.

Ihr Zweck ist nicht moralische Härte, sondern Schutz vor falscher Saldierung.

## 13. Quellen

- Grundgesetz: https://www.gesetze-im-internet.de/gg/
- EU-Grundrechtecharta: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:12012P/TXT
- WÖk Methodik: https://wirkungsoekonomie.de/methodik/
- WÖk Referenzrahmen: https://wirkungsoekonomie.de/referenzrahmen/

Konkrete Boundaries brauchen jeweils die einschlägige Rechts-/Fach-/Wissenschaftsquelle.

## 14. Transferaufgabe

Nimm einen Fall mit mindestens fünf Wirkungsfeldern.

Markiere:

- normale negative Wirkungen,
- Zielkonflikte,
- mögliche harte Boundaries,
- Quellen der Boundary,
- Status `NOT_TRIGGERED/TRIGGERED/OPEN`,
- Designänderungen/Alternativen.

Erzeuge bewusst **keine** Gesamtsaldierung vor diesem Gate.

## 16. Prüfungsrelevanz

- Boundary-Kategorien,
- Zielkonflikt vs. harte Grenze,
- Gate vor Aggregation,
- Boundary-Status,
- Green-/Rights-Washing,
- Quellenpflicht,
- Optionsverbesserung.

## 17. Sprechertext

Stell dir vor, du bewertest eine Batterie.

Klima: sehr gut.

Recycling: sehr gut.

Leistung: sehr gut.

Und dann taucht ein glaubhafter Hinweis auf schwere Zwangsarbeit in der Rohstoffkette auf.

Was machen wir?

Wir rechnen nicht: dreimal plus drei, einmal minus drei - macht immer noch positiv.

Genau dafür gibt es Nichtkompensation.

Bestimmte Schutzgrenzen sind keine Punkte, die man durch andere Vorteile wegkaufen kann.

Aber auch hier müssen wir vorsichtig sein.

Nicht jede negative Wirkung ist eine harte Grenze. Ein Zielkonflikt ist etwas anderes als eine rechtliche oder wissenschaftlich begründete rote Linie.

Darum braucht jede Boundary eine Quelle.

Welches Recht? Welche Sicherheitsnorm? Welche wissenschaftliche Schwelle? Welcher konkrete Anwendungsbereich?

Wenn wir das noch nicht wissen, schreiben wir OPEN.

Nicht null.

Und Nichtkompensation heißt auch nicht immer: Projekt stoppen.

Vielleicht kann die Lieferkette geändert werden. Vielleicht eine Trasse verlegt. Vielleicht eine Schutzmaßnahme eingebaut.

Dann hilft uns die harte Grenze, bessere Optionen zu bauen.

Der Merksatz lautet:

**Ein guter Durchschnitt darf keine unzulässige Schwäche verstecken. Aber eine harte Grenze muss selbst hart begründet sein.**
