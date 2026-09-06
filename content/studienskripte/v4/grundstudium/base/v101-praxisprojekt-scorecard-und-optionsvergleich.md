<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v101-praxisprojekt-scorecard-und-optionsvergleich.md curriculum=4.0 sanitized=true -->
# V101 · Praxisprojekt: Scorecard, Reverse Merit Order und Optionsvergleich anwenden

**lecture_id:** `WOEK-G-BASE-101`  
**display_code:** `V101`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 ersetzt „Scorecard und Reverse Merit Order anwenden“ als bloße Rechenübung durch einen transparenten Optionsvergleich mit Wirkungsprofilen, Evidenz, Schutzgrenzen, Sensitivität und `NO_ROBUST_RANKING` als zulässigem Ergebnis.

## 20-Sekunden-Einstieg

Jetzt vergleichst du **echte Optionen**. Nicht nur „Maßnahme vs. nichts“, sondern mindestens zwei realistische Wege zum Ziel. Jede Option bekommt dasselbe Wirkungsprofil: gleiche State Variables, gleiche Referenzen, getrennte Evidenz und Schutzgrenzen. Erst danach darf - wenn fachlich sinnvoll - Reverse Merit Order oder eine begründete Teilaggregation helfen. Wenn die Daten keine robuste Rangfolge tragen, ist `NO_ROBUST_RANKING` die richtige Antwort.

## Lernziele

Nach dieser Vorlesung kannst du:

1. einen fairen Common-Target-Optionsvergleich aufbauen.
2. gleiche Systemgrenzen und Indikatoren für Vergleichsoptionen sichern.
3. Scorecards als Profile statt Endnoten anwenden.
4. Reverse Merit Order nur nach Boundary-/Evidenzprüfung einsetzen.
5. Sensitivität und Practical Ties dokumentieren.
6. eine Recommendation nur bei robuster Präferenz vorbereiten.

## 1. Warum mindestens zwei echte Optionen?

Eine Maßnahme kann gegenüber Nichtstun gut aussehen und gegenüber einer besseren Alternative schwach.

Darum verlangt v4:

- No-action/Status-quo-Szenario,
- tatsächliche/behauptete Option,
- mindestens eine realistische Alternative.

Bei politischer WÖk-Empfehlung besser mehrere Optionen.

## 2. Common Targets

Alle Optionen werden gegen dieselben Ziel-/Referenzkriterien geprüft.

Nicht:

- Option A an Klima,
- Option B an Kosten,
- Option C an Akzeptanz.

Sondern:

> Gleiche Problemdefinition, gleicher Zielzustand, gleiche Schutzgrenzen, gleiche State Variables - soweit sinnvoll.

Damit wird Vergleich fair.

## 3. Scorecard je Option

Für jedes Feld:

- Richtung,
- Evidenz,
- Kernmechanismus,
- Distribution,
- Zeit,
- Boundary,
- Open Point,
- Datenfunktion.

Der Vergleich zeigt dann:

- Dominanz,
- Trade-offs,
- Unsicherheit,
- Conditions.

## 4. Boundary Gate zuerst

Eine Option mit ausgelöster nichtkompensierbarer Grenze kann aus dem zulässigen Optionsraum fallen oder Designänderung benötigen.

`BOUNDARY BEFORE RMO`.

Offene Rechts-/Schutzfrage:

`BOUNDARY_OPEN` - nicht automatisch „minus Punkte“.

## 5. Reverse Merit Order

Wenn Optionen vergleichbar und zulässig sind:

- materiell schwächstes Feld prüfen,
- Evidenz/Unsicherheit berücksichtigen,
- Practical Tie zulassen,
- keine automatischen Partei-/Portfoliorankings.

RMO ist Hilfslogik, nicht Endurteil.

## 6. Sensitivität

Ändere plausible Annahmen:

- Preise,
- Lebensdauer,
- Nachfrage,
- Rebound,
- Strommix,
- Delivery,
- Verteilung.

Prüfe:

> Bleibt die qualitative Präferenz bestehen?

Wenn nein:

`CONDITIONAL_PREFERENCE` oder `NO_ROBUST_RANKING`.

## 7. Dominanz

Option A dominiert B nur, wenn sie in relevanten Dimensionen mindestens gleich gut und in mindestens einer materiell besser ist - unter tragfähiger Evidenz und ohne neue Boundary.

In der Praxis ist vollständige Dominanz selten.

## 8. Distribution kann Rangfolge ändern

Durchschnittliche Wirkung kann ähnlich sein, aber Verteilung sehr verschieden.

Beispiel Energiehilfe:

- pauschaler Preisdeckel,
- gezielte Unterstützung vulnerabler Haushalte,
- Effizienzförderung.

Durchschnittskosten allein reichen nicht.

## 9. Beispiel: Hitzeschutzoptionen

A. mobile Klimageräte fördern.

B. Gebäudlicher Sonnenschutz.

C. Stadtgrün/Verschattung.

D. Kombination nach Risikoquartieren.

Vergleich:

- schnelle Gesundheitswirkung,
- Energiebedarf,
- Klima,
- Distribution,
- Kosten,
- Delivery,
- langfristige Resilienz,
- Wasser/Flächenwirkung.

Vielleicht ist D robust - vielleicht je Quartier eine andere Option.

Auch `SEGMENTED_RECOMMENDATION` ist zulässig.

## 10. Recommendation noch nicht veröffentlichen

Am Ende V101 entsteht ein **Optionsvergleich**, keine finale Recommendation.

Die Recommendation folgt erst nach:

- Risiko/Resilienz/Transformation (V102),
- Unsicherheit/Kritik (V103),
- soziale Tragfähigkeit/Missbrauchsschutz (V104).

## 11. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Common Targets | gleiche Ziel-/Referenzbasis für Optionsvergleich |
| Optionsvergleich | systematische Gegenüberstellung realer Handlungsalternativen |
| Dominanz | Option ist in allen relevanten Feldern nicht schlechter und mindestens einem besser |
| Practical Tie | kein materiell belastbarer Unterschied |
| Conditional Preference | Präferenz gilt nur unter expliziten Bedingungen |
| No Robust Ranking | keine stabile Rangfolge unter plausiblen Annahmen |
| Segmented Recommendation | unterschiedliche beste Option für unterschiedliche Kontexte/Segmente |

## 12. Typische Fehlinterpretationen

### „Option vs. nichts reicht.“
Falsch.

### „Ein Score entscheidet.“
Falsch.

### „Boundary Open kann ignoriert werden.“
Falsch.

### „Eine beste Option muss für alle Gruppen gelten.“
Falsch.

### „Keine Rangfolge = Analyse gescheitert.“
Falsch.

## WÖk-Abgrenzung · Scorecard ist kein Empfehlungsautomat

Eine Scorecard strukturiert Befunde; sie erzeugt **keine automatische Recommendation**. Optionen werden gegen dasselbe Problem, dieselben Ziele, Schutzgrenzen, Umsetzungsbedingungen und Unsicherheiten verglichen. Wenn die Evidenz keine robuste Präferenz trägt, lautet das fachlich richtige Ergebnis `NO_ROBUST_RECOMMENDATION`. Reverse Merit Order priorisiert kritische Grenzen, ersetzt aber weder Begründung noch politischen oder rechtlichen Entscheidungsspielraum.

## 13. Quellen

- WÖk Methodik: https://wirkungsoekonomie.de/methodik/
- OECD Regulatory Impact Assessment / alternatives: https://www.oecd.org/gov/regulatory-policy/
- EU Better Regulation Toolbox: https://commission.europa.eu/law/law-making-process/planning-and-proposing-law/better-regulation/better-regulation-guidelines-and-toolbox_en

## 14. Transferaufgabe

Vergleiche mindestens drei reale Optionen für dein Projekt.

Erstelle pro Option dasselbe Profil und dokumentiere:

- Boundary,
- Evidenz,
- Verteilung,
- Delivery,
- Sensitivität.

Formuliere am Ende nur:

- `ROBUST_PREFERENCE`,
- `CONDITIONAL_PREFERENCE`,
- `SEGMENTED_RECOMMENDATION_CANDIDATE`,
- oder `NO_ROBUST_RANKING`.

## 16. Prüfungsrelevanz

- echte Alternativen,
- Common Targets,
- Profile,
- Boundary before RMO,
- Sensitivität,
- Distribution,
- robuste/bedingte/segmentierte Präferenz.

## 17. Sprechertext

Jetzt beginnt der eigentliche Entscheidungsvergleich.

Und dafür brauchen wir Alternativen.

Nicht nur: Unsere Lieblingsmaßnahme gegen Nichtstun.

Denn fast jede Maßnahme kann besser aussehen, wenn die Alternative künstlich schlecht ist.

Also nehmen wir mehrere reale Optionen und prüfen sie gegen dieselben Ziele.

Gleiche Systemgrenze. Gleiche State Variables. Gleiche Schutzgrenzen.

Dann entstehen Scorecards als Profile.

Und erst danach kann Reverse Merit Order helfen.

Was ist die kritischste Schwäche? Ist sie materiell? Wie gut belegt? Gibt es eine harte Grenze?

Dann verändern wir Annahmen.

Was passiert bei anderem Preis, anderer Nachfrage oder schlechterer Delivery?

Wenn der Sieger ständig wechselt, schreiben wir keine falsche Rangliste.

Dann lautet das Ergebnis eben: keine robuste Präferenz.

Der Merksatz lautet:

**Gute Wirkungsentscheidung sucht nicht die schönste Option. Sie sucht die Option, die gegenüber realistischen Alternativen unter mehreren plausiblen Welten robust bleibt.**
