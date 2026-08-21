<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v32-scorecards-bewertungsprofile.md curriculum=4.0 sanitized=true -->
# V32 · Scorecards und mehrdimensionale Bewertungsprofile

**lecture_id:** `WOEK-G-BASE-032`  
**display_code:** `V32`  
**curriculum_version:** `4.0`  
**legacy_source:** `content/lehrgaenge/woek-g-v32.md` @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v3.2 lehrte Scorecards bereits als Profil, enthielt aber noch zu starke FinalScore-/Aggregationssignale. v4.0 macht Profile, Evidenz, Schutzgrenzen, Datenfunktion und Nichtkompensation zum Primat; ein verdichteter Wert ist optional und an strenge Gültigkeitsbedingungen gebunden.

## 20-Sekunden-Einstieg

Eine gute Scorecard ist **kein Zeugnis mit einer Endnote**. Sie ist ein Armaturenbrett: Sie zeigt, welche Zustände sich in welche Richtung verändern, wie belastbar die Evidenz ist, wer betroffen ist, welche Schutzgrenzen gelten und wo Daten fehlen. Die wichtigste Information kann gerade das Feld sein, das sich **nicht** sinnvoll in eine Gesamtnote hineinrechnen lässt.

## Lernziele

Nach dieser Vorlesung kannst du:

1. Scorecard, Wirkungsprofil und optionalen Index unterscheiden.
2. Richtung, Evidenz, Datenqualität und Schutzgrenzen separat darstellen.
3. eine Scorecard aus `MasterItem -> StateVariable -> Indicator -> Observation -> Assessment` aufbauen.
4. positive Potenziale, materielle Risiken und offene Punkte ohne Scheingenauigkeit zeigen.
5. erkennen, wann eine Gesamtzahl unzulässig oder irreführend ist.
6. eine Scorecard so lesen, dass sie Entscheidungen und spätere Reality Checks unterstützt.

## 1. Was eine Scorecard leisten soll

Eine Scorecard verdichtet Komplexität, ohne sie zu verstecken.

Sie sollte mindestens zeigen:

- **Wirkungsfeld / MasterItem**
- relevante **State Variables**
- verwendete **Indikatoren / Datenquellen**
- **Wirkungsrichtung**
- **Evidenzgrad**
- **Betroffene / Verteilung**
- **Zeit / Raum**
- **Schutzgrenzen / rote Linien**
- **offene Punkte / Datenlücken**
- ggf. **Reality-Check-Reife**

Ein einzelner Endwert kann diese Informationen nie vollständig ersetzen.

## 2. Richtung ist nicht Evidenz

Eine Scorecard mit nur einer Farbskala vermischt leicht zwei Dinge:

> Was erwarten wir?

und

> Wie gut wissen wir das?

Deshalb trennt v4.0 mindestens:

`impact_direction = POSITIVE | NEGATIVE | NEUTRAL | AMBIVALENT | OPEN`

von

`evidence_level = HIGH | MEDIUM | LOW | NOT_ASSESSABLE`

Beispiel:

Eine neue Verkehrstechnologie kann **wahrscheinlich positiv** auf Unfallrisiken wirken, aber die Evidenz kann **niedrig** sein, weil reale Langzeitdaten fehlen.

Das ist nicht neutral.

## 3. Warum Profile wichtiger sind als Farben

Eine Scorecard könnte so aussehen:

| Feld | Richtung | Evidenz | Schutzgrenze | Kernbefund |
|---|---|---|---|---|
| Klima | positiv | mittel | nein | geringere Emissionen unter bestimmten Nutzungsannahmen |
| Ressourcen | ambivalent | mittel | nein | weniger Betriebsmaterial, aber kritische Rohstoffe |
| Arbeit/Fairness | offen | niedrig | möglich | Lieferkettendaten fehlen |
| Gesundheit/Sicherheit | positiv | hoch | ja | deutlich geringeres lokales Schadstoffrisiko |

Das Profil zeigt sofort:

- wo Potenzial liegt,
- wo Unsicherheit liegt,
- wo ein harter Prüfschritt nötig ist.

Ein Gesamtwert von „+1,4“ würde genau diese Struktur verdecken.

## 4. Datenpfad hinter jedem Feld

Jeder Score braucht einen nachvollziehbaren Datenpfad:

`MasterItem -> StateVariable -> Indicator -> Observation -> Benchmark/Reference -> Assessment`

Beispiel Gesundheit:

- MasterItem: Atemwegsgesundheit
- StateVariable: Exposition gegenüber NO₂/PM
- Indicator: lokale Konzentration / epidemiologischer Risikoparameter
- Observation: gemessener oder modellierter Wert
- Reference: Grenz-/Leitwert, Fachliteratur, Baseline
- Assessment: Richtung + Evidenz + Unsicherheit

Ohne diese Kette ist ein Score nur eine Behauptung.

## 5. Vier-Felder-Scorecard ist ein Werkzeug, kein Naturgesetz

Die WÖk verwendet in vielen Produktbeispielen vier Kernfelder:

- Klima
- Ressourcen & Kreislauf
- Arbeit & Fairness
- Gesundheit & Sicherheit

Diese Struktur ist didaktisch und praktisch nützlich.

Aber sie ist **nicht für jeden Gegenstand vollständig**.

Bei politischen, institutionellen oder Medienfällen können zusätzliche Wirkungsfelder nötig sein, etwa:

- Demokratie / Rechtsstaat
- Verteilung
- Resilienz
- digitale Selbstbestimmung
- internationale Spillover

v4.0 schreibt daher keine starre Vier-Felder-Reduktion für alle Wirkungsobjekte vor.

## 6. Schutzgrenzen separat markieren

Eine Scorecard braucht einen eigenen Boundary-Layer.

Beispiel:

Ein Produkt hat sehr gute Klima- und Ressourcendaten, aber eine Lieferkette verletzt nachweislich eine harte Arbeitsschutzanforderung.

Dann darf die Scorecard nicht sagen:

> „In Summe trotzdem positiv.“

Sie muss zeigen:

`NON_COMPENSABLE_BOUNDARY = TRIGGERED`

und erläutern, welche Verbesserung oder Alternative nötig ist.

## 7. Offene Punkte sichtbar lassen

`OPEN` ist kein Makel einer Scorecard.

Es ist oft die wissenschaftlich richtige Antwort.

Typische Open Points:

- fehlende Lieferkettendaten,
- unklarer Gegenfaktum,
- stark modellabhängige Langzeitwirkung,
- unbekannte Verteilung,
- nicht geklärte Rechtsfrage.

Eine gute Scorecard macht daraus eine **Prüfagenda**, nicht eine versteckte Null.

## 8. Scorecard als Entscheidungs- und Lerninstrument

Vor der Entscheidung:

- Vergleich von Optionen,
- Erkennen kritischer Felder,
- Datenlücken priorisieren,
- Schutzmaßnahmen definieren.

Nach der Entscheidung:

- ursprüngliche Annahmen speichern,
- relevante Indikatoren beobachten,
- Reality Check durchführen,
- Scorecard versionieren,
- Urteil revidieren.

Damit ist eine Scorecard nicht nur Darstellung, sondern Teil des Wirkungsregelkreises.

## 9. Konkretes Beispiel: Lieferantenauswahl

Lieferant A:

- sehr niedrige Emissionen,
- hohe Recyclingquote,
- unklare Arbeitsrechtsdaten,
- gute Produktsicherheit.

Lieferant B:

- mittlere Emissionen,
- mittlere Recyclingquote,
- sehr gute Arbeitsrechtsdaten,
- gute Sicherheit.

Eine naive Gesamtnote könnte A gewinnen lassen.

Eine v4-Scorecard zeigt dagegen:

- A hat hohen Klimanutzen,
- aber `OPEN/BOUNDARY_RISK` im Arbeitsfeld,
- Entscheidung kann von Nachweis/Schutzbedingung abhängen,
- B ist möglicherweise robuster trotz schlechterem Klimawert.

Das ist mehr Entscheidungskompetenz als eine einzige Rangzahl.

## 10. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Scorecard | strukturierte mehrdimensionale Wirkungsdarstellung |
| Wirkungsprofil | Verteilung von Richtung, Evidenz, Risiken und Grenzen über relevante Felder |
| Impact Direction | erwartete/bewertete Wirkungsrichtung |
| Evidence Level | Belastbarkeit des Befunds |
| Boundary | nichtkompensierbare Schutz-/Rechts-/Sicherheitsgrenze |
| Open Point | fachlich noch ungeklärter Punkt |
| Reality Check | spätere Prüfung, ob erwartete Zustandsänderung eingetreten ist |

## 11. Typische Fehlinterpretationen

### „Eine Scorecard braucht immer einen FinalScore.“
Falsch.

### „Grün bedeutet hohe Evidenz.“
Falsch, wenn Richtung und Evidenz getrennt sind.

### „Vier Felder reichen immer.“
Falsch.

### „OPEN ist neutral.“
Falsch.

### „Ein guter Wert kann eine harte Schutzverletzung kompensieren.“
Falsch.

## 12. WÖk-Abgrenzung

Scorecards sind kein WÖk-Alleinstellungsmerkmal. Balanced Scorecards, ESG-Dashboards und Multi-Criteria-Ansätze existieren lange.

WÖk-spezifisch ist die Verbindung mit:

- Problem/Goal Review,
- explizitem Wirkpfad,
- Evidenz-/Richtungstrennung,
- Nichtkompensation,
- Optionsvergleich,
- Reality Check,
- versionierter Provenienz.

## 13. Quellen

- WÖk Methodik: https://wirkungsoekonomie.de/methodik/
- WÖk Werkzeuge: https://wirkungsoekonomie.de/werkzeuge/
- WÖk Referenz: https://wirkungsoekonomie.de/referenz/

Für Feldbewertungen gelten zusätzlich die jeweils einschlägigen fachlichen Primär-/Standardquellen.

## 14. Transferaufgabe

Erstelle für zwei Lieferanten oder zwei Technologien eine Scorecard mit mindestens fünf Feldern.

Für jedes Feld:

- State Variable,
- Datenquelle,
- Richtung,
- Evidenz,
- Open Point,
- Boundary-Status.

Erstelle **keinen** Gesamtscore. Schreibe danach drei Sätze, welche Entscheidung die Profile nahelegen und welche Information noch fehlt.

## 16. Prüfungsrelevanz

- Scorecard vs. Index,
- Richtung/Evidenz,
- Datenpfad,
- flexible Wirkungsfelder,
- Boundary/Open Points,
- Reality Check,
- kein automatischer FinalScore.

## 17. Sprechertext

Eine Scorecard ist ein bisschen wie das Armaturenbrett im Auto.

Du willst nicht nur eine große Zahl sehen: „Auto heute 7,3 von 10“.

Du willst wissen: Wie viel Sprit? Welche Warnleuchte? Wie heiß ist der Motor? Ist der Reifendruck okay?

Genauso ist es mit Wirkung.

Eine gute Scorecard zeigt nicht nur: plus zwei.

Sie zeigt: In welchem Feld? Auf Basis welcher Daten? Wie sicher ist die Aussage? Wer ist betroffen? Gibt es eine rote Linie? Was wissen wir noch nicht?

Und ganz wichtig: Richtung und Evidenz sind getrennt.

Eine Wirkung kann wahrscheinlich positiv sein, obwohl die Evidenz noch niedrig ist. Das ist nicht dasselbe wie neutral.

Auch die bekannten vier WÖk-Felder sind kein Naturgesetz. Für Produkte funktionieren Klima, Ressourcen, Arbeit und Gesundheit oft gut. Bei einem Gesetz brauchen wir vielleicht zusätzlich Demokratie, Verteilung, Recht oder Resilienz.

Und wenn eine harte Schutzgrenze verletzt wird, darf ein anderer guter Wert das nicht wegrechnen.

Darum ist die Scorecard in v4.0 vor allem ein Wirkungsprofil.

Ein Armaturenbrett.

Und ein gutes Armaturenbrett zeigt auch gelbe Warnleuchten.

Nicht nur grüne.
