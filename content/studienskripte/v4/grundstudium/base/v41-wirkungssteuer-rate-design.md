<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ee7fec6b8a738b78bda9b989eba252963a325daf path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v41-wirkungssteuer-rate-design.md curriculum=4.0 sanitized=true -->
# V41 · Wirkungssteuer: Tarif-, Bonus-Malus- und Boundary-Design statt FinalScore-Automatismus

**lecture_id:** `WOEK-G-BASE-041`  
**display_code:** `V41`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 / frühere 0-25-%-/FinalScore-WÖk-Modelle @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 korrigiert die ältere didaktische Verkürzung „FinalScore -> Steuerklasse/0-25 %“. Ein möglicher Tarifkorridor bleibt ein Policy-Designparameter, keine methodische Wahrheit. Tarifdesign muss dimensions-, rechts-, verteilungs- und boundary-sensitiv sein und darf heterogene Wirkungen nicht blind saldieren.

## 20-Sekunden-Einstieg

Frühere WÖk-Modelle arbeiteten anschaulich mit einem möglichen **0-25-%-Korridor** und einem FinalScore. Das war didaktisch einfach, aber methodisch zu grob, wenn sehr unterschiedliche Wirkungen oder harte Grenzen betroffen sind. v4.0 sagt deshalb: **Kein automatischer Gesamtscore entscheidet den Steuersatz.** Ein Tarifmodell braucht erst zulässige Bemessungsgrößen, klare Wirkungsdimensionen, Schutzgrenzen, Verteilung, Datenqualität und Rechtsprüfung.

## Lernziele

Nach dieser Vorlesung kannst du:

1. historische WÖk-0-25-%-/FinalScore-Modelle als Designprototypen einordnen.
2. Bemessungsgrundlage, Tarif, Bonus-Malus und Steuerklasse unterscheiden.
3. erklären, warum multidimensionale Wirkung nicht blind in einen Steuersatz aggregiert werden darf.
4. Boundary-, Evidenz- und Datenqualitätsregeln vor Tarifzuordnung anwenden.
5. Verteilungs- und Administrationsfolgen eines Tarifmodells prüfen.
6. einen robusteren v4-Tarifprototyp mit Bandbreiten/Teildimensionen entwerfen.

## 1. Warum der alte FinalScore attraktiv war

Ein einfacher Gedanke:

> bessere Wirkung -> geringere Belastung, schlechtere Wirkung -> höhere Belastung.

Ein einzelner FinalScore machte daraus eine leicht verständliche Tariftabelle.

Das hat didaktischen Wert.

Aber sobald Klima, Arbeit, Gesundheit, Ressourcen, Recht und Verteilung zusammenkommen, stellt sich die Frage:

> **Darf all das überhaupt in eine einzige Zahl verrechnet werden?**

Oft lautet die Antwort: nur teilweise oder gar nicht.

## 2. Steuerdesign braucht vier getrennte Entscheidungen

### Bemessungsgrundlage

Woran knüpft die Steuer an?

- Umsatz,
- Menge,
- Emission,
- Produktkategorie,
- Gewinn,
- andere definierte Größe.

### Wirkungskomponente

Welche messbare Wirkung beeinflusst den Tarif?

### Tarif

Wie verändert sich die Belastung?

### Verfahrens-/Boundary-Regel

Welche Mindestanforderungen, Nachweise und Ausschluss-/Korrekturregeln gelten?

Diese Ebenen dürfen nicht in einem Score versteckt werden.

## 3. Warum ein universeller FinalScore problematisch ist

Beispiel Produkt:

- Klima sehr gut,
- Ressourcen gut,
- Sicherheit schlecht,
- Arbeitsrechtslage offen.

Eine Summenzahl kann:

- Sicherheitsgrenze kompensieren,
- OPEN als Mittelwert behandeln,
- normative Gewichte verstecken,
- Datenqualität ignorieren.

v4.0 verlangt daher:

`BOUNDARY -> DATA QUALITY -> DIMENSION PROFILE -> optional partial aggregation -> tariff rule`.

## 4. Mögliche v4-Designfamilien

### A. Dimensionsspezifische Zuschläge/Bonifikationen

Einzelne klar messbare Wirkungen erhalten getrennte Modifikatoren.

Vorteil: Transparenz.

Risiko: Komplexität/Doppelzählung.

### B. Klassenmodell mit Mindestbedingungen

Produkte werden nur innerhalb zulässiger Klassen verglichen; harte Boundaries separat.

Vorteil: verständlicher.

Risiko: Schwellen-/Cliff-Effekte.

### C. Grenzwert + Bonus-Malus

Mindeststandard gesetzlich/technisch, darüber Bonus/Malus nach gradueller Wirkung.

Vorteil: Boundary klar.

### D. Primär wirkungsspezifische Steuer

Zum Beispiel direkt pro Emission/Schadstoff/Materialwirkung, wenn valide Messgröße existiert.

Vorteil: kausal näher.

Keine Familie ist universell beste.

## 5. 0-25 % als Policy-Parameter, nicht Naturkonstante

Ein Tarifkorridor wie 0-25 % kann als Simulationsbereich dienen.

Aber seine Höhe muss geprüft werden gegen:

- Lenkungswirkung,
- Preiselastizität,
- Verteilung,
- Fiskalwirkung,
- EU-/Steuerrecht,
- Marktverzerrung,
- Ausweich-/Importeffekte,
- administrative Machbarkeit.

Daraus folgt:

`0-25 % = PROTOTYPE PARAMETER`, nicht „WÖk-Gesetz“.

## 6. Evidenzabhängigkeit

Wenn Wirkung nur schwach belegt ist, sollte der Tarif nicht so reagieren, als sei sie sicher.

Mögliche Regeln:

- nur HIGH/MEDIUM für harte Tarifanpassung,
- LOW = geringere/keine automatische Modifikation,
- NOT_ASSESSABLE = keine erfundene Neutralität; ggf. Nachweis-/Default-/Review-Regel, rechtlich separat prüfen.

Die konkrete Default-Regel ist normative/rechtliche Policy-Entscheidung, nicht methodisch automatisch vorgegeben.

## 7. Cliff Effects

Wenn 69 Punkte = Klasse C und 70 = Klasse B, können minimale Messfehler große Steuerunterschiede erzeugen.

Gegenmittel:

- Bandbreiten,
- gleitende Tarife,
- Toleranzzonen,
- Practical Tie,
- Review/Appeal.

Scheingenauigkeit darf keine Steuerschuld bestimmen.

## 8. Verteilung und Grundbedarf

Ein höherer Produktpreis kann einkommensschwache Haushalte stärker treffen.

Fragen:

- Ist das Produkt Grundbedarf?
- gibt es zugängliche Alternativen?
- Rückverteilung/Transfer?
- Übergangszeit?
- regionale Unterschiede?

Ein ökologisch gutes Preissignal kann sozial schlecht designt sein.

## 9. Administrative Datenlast

Je mehr Dimensionen tarifrelevant sind, desto höher:

- Messkosten,
- Auditkosten,
- Streitfälle,
- Gaming,
- Updatebedarf.

Deshalb kann es besser sein, wenige hochmateriale, robuste Variablen steuerlich zu verwenden und andere Wirkungen über Standards/Transparenz/Haftung zu steuern.

## 10. Beispiel: Verpackung

Mögliche Variablen:

- Materialmenge,
- Rezyklatanteil,
- Recyclingfähigkeit,
- Schadstoffe,
- Mehrwegfähigkeit.

Ein Tarifmodell könnte:

- Mindestgrenzen für Schadstoffe,
- Bonus/Malus für Material-/Kreislaufparameter,
- separate CO₂-Preissignale

kombinieren.

Nicht nötig: ein Gesamt-MPD-Score für jede Verpackung.

## 11. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Bemessungsgrundlage | Größe, an die eine Steuer rechtlich/rechnerisch anknüpft |
| Tarif | Regel, die aus Bemessungsgrundlage/Parametern Steuerhöhe bestimmt |
| Bonus-Malus | Zu-/Abschlag je nach definiertem Merkmal/Wirkung |
| Cliff Effect | kleine Messänderung erzeugt großen Sprung an Schwelle |
| Tarifkorridor | möglicher Bereich von Steuersätzen/Modifikatoren |
| FinalScore | ältere WÖk-Verdichtungslogik; v4.0 nicht automatische Tarifgrundlage |

## 12. Typische Fehlinterpretationen

### „WÖk verlangt zwingend 0-25 %.“
Falsch.

### „FinalScore bestimmt automatisch Steuerklasse.“
Nicht in v4.0.

### „Mehr Wirkungsdimensionen im Tarif sind immer besser.“
Falsch.

### „OPEN = durchschnittlicher Steuersatz.“
Falsch.

### „Steuerdesign ist nur Mathematik.“
Falsch; Recht, Verteilung, Delivery und Governance sind zentral.

## 13. WÖk-Abgrenzung

v4.0 behält die Leitidee **wirkungssensitiver Anreize**, verwirft aber den Anspruch, ein universeller FinalScore könne ohne zusätzliche Constraints direkt eine rechtlich belastbare Steuerhöhe erzeugen.

## 14. Quellen

- UStG: https://www.gesetze-im-internet.de/ustg_1980/
- OECD Tax and Environment context: https://www.oecd.org/tax/tax-policy/
- EU Better Regulation: https://commission.europa.eu/law/law-making-process/planning-and-proposing-law/better-regulation/better-regulation-guidelines-and-toolbox_en
- WÖk Wirkungssteuer: https://wirkungsoekonomie.de/fuer/wirkungssteuer.html

## 15. Transferaufgabe

Entwirf zwei alternative Tarifmodelle für einen konkreten Produktbereich:

1. einfacher FinalScore-Prototyp,
2. v4-Modell mit Boundary + dimensionsspezifischen Modifikatoren.

Vergleiche Transparenz, Datenlast, Gaming, Verteilung und Rechts-/Administrierbarkeit.

## 17. Prüfungsrelevanz

- FinalScore-Korrektur,
- Tarif/Bemessung/Boundary trennen,
- Designfamilien,
- 0-25 % als Parameter,
- Evidenz/Cliff Effects,
- Distribution/Data burden.

## 18. Sprechertext

Früher war die Wirkungssteuer schön einfach erklärt.

FinalScore rein - Steuerklasse raus. Vielleicht irgendwo zwischen null und 25 Prozent.

Das versteht jeder.

Aber genau diese Einfachheit kann fachlich gefährlich werden.

Was passiert, wenn ein Produkt klimatisch hervorragend ist, aber eine harte Sicherheitsgrenze verletzt?

Was passiert bei offenen Arbeitsrechtsdaten?

Ein Durchschnittsscore kann solche Dinge verstecken.

Darum trennen wir in v4.0.

Erst Schutzgrenzen. Dann Datenqualität. Dann Wirkungsprofil. Und nur dort, wo fachlich vertretbar, eine Teilaggregation oder Tarifregel.

Auch 0 bis 25 Prozent ist kein Naturgesetz.

Es kann ein Simulationsbereich sein. Aber ein echter Tarif braucht Rechtsprüfung, Verteilungsanalyse, Elastizitäten und administrative Machbarkeit.

Der Merksatz lautet:

**Ein guter Wirkungssteuertarif ist nicht der eleganteste Score. Er ist der einfachste rechtlich und praktisch tragfähige Anreiz, der die relevante Wirkung wirklich verändert - ohne kritische Grenzen zu verstecken.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.
