# Wirkungscheck Bundestag V2 - Nutzungsfluss und Abnahme

## Hauptfluss

```text
Landingpage
  → Regionalen Bezug optional wählen
  → Sieben kurze Fragen
  → Bundespolitik-Wirkungsreport
  → „Warum sehe ich dieses Ergebnis?“
  → freiwillig: zwei passende WÖK-Ansätze ansehen
```

Es gibt keinen zusätzlichen Intro-Screen, keine Themenrangfolge, keinen
Review-Marathon und keinen verpflichtenden Instrumententeil.

## Screen 1: Landingpage

Die Seite beantwortet binnen etwa 15 Sekunden: Wer wird angesprochen? Worum
geht es? Was erhält die Person? Welche Rolle hat der Wahlkreis? Werden Person
oder Partei bewertet? Was geschieht mit den Daten?

- Primäre Aktion: **Wirkungscheck starten**.
- Sekundäre Aktion: **So arbeitet der Wirkungscheck**.
- Vertrauensebene: Antworten bleiben lokal; keine Personen- oder
  Parteibewertung; Übertragungen nur in späteren, getrennten Funktionen.

## Screen 2: Regionaler Bezug

Frage: **Möchten Sie zusätzlich eine regionale Rückkopplung einbeziehen?**

| Auswahl | Folge |
| --- | --- |
| Meinen Wahlkreis einbeziehen | Suche nach Name, Nummer, Ort oder PLZ; anschließend siebte Frage mit regionalen Signalen. |
| Nur Bundesebene betrachten | Vollständiger Bundesreport; siebte Frage fragt nach einer wichtigen praktischen Rückmeldung. |

Pflichthinweis: Der Wahlkreis bestimmt nicht, welche Bundespolitik verfolgt
werden soll. Er dient nur als optionaler Realitätscheck: Kommt die gewünschte
bundespolitische Veränderung vor Ort tatsächlich an?

## Screen 3: Fragen

Die Fortschrittsanzeige zählt sieben Fragen. Bei Mehrfachauswahl wird die
Obergrenze unmittelbar verständlich angezeigt. Nach einer Auswahl bleibt der
Viewport an der Frage; ein automatisches Springen an den Seitenanfang ist
verboten. Die Weiter-Aktion ist immer sichtbar und erklärt, falls eine
Pflichtangabe fehlt, was noch gebraucht wird.

| Nr. | Nutzerfrage | Auswahl | Internes Feld |
| --- | --- | --- | --- |
| 1 | Bei welchem bundespolitischen Thema möchten Sie die Wirkung heute genauer betrachten? | genau eins | `topic` |
| 2 | Was soll sich durch Bundespolitik in diesem Bereich konkret verbessern? | genau eins, modulabhängig | `federal_objective` |
| 3 | Was blockiert diese Veränderung derzeit aus Ihrer Sicht am stärksten? | höchstens zwei | `bottlenecks` |
| 4 | Woran müsste bundesweit erkennbar sein, dass die Veränderung tatsächlich eintritt? | zwei oder drei, modulabhängig | `federal_success_signals` |
| 5 | Was darf eine Lösung auf keinen Fall verschlechtern? | höchstens zwei, modulabhängig | `non_compensable_boundaries` |
| 6 | Welche Anforderungen muss ein politischer Ansatz für Sie besonders erfüllen? | höchstens drei | `policy_constraints` |
| 7 | Woran würden Sie vor Ort / in der Praxis erkennen, dass die Bundespolitik ankommt? | modulabhängig; bei Wahlkreis regionale, sonst praktische Rückmeldung | `regional_feedback` |

Ein optionales Freitextfeld folgt separat: maximal 300 Zeichen, keine
vertraulichen oder personenbezogenen Angaben Dritter. Es verändert weder
Personenprofil noch Baseline und wird ohne separate Freigabe nicht übertragen.

## Screen 4: Kurzreport

Der Report beginnt ohne fachliche Vorrede mit dem Nutzen. Reihenfolge:

1. Ihr Ziel;
2. möglicher Bundeshebel;
3. Wirkungskette in höchstens fünf Stationen;
4. drei Dinge beobachten;
5. regionale Rückkopplung oder Datenlücke;
6. parlamentarische Prüffrage;
7. Risiko und Nachsteuerung.

Danach erst: „Was Sie gerade gemacht haben“ und freiwillige Instrumenten-
Vertiefung. Die Features `FEATURE_SENSITIVITY=false` und
`FEATURE_WOEK_AI=false` gelten im Pilot.

## Think-aloud-Abnahme

Mindestens fünf Personen ohne WÖK-Vorwissen bearbeiten den Check ohne
Einführung. Beobachtet wird, nicht erklärt.

| Test | Bestehen, wenn … |
| --- | --- |
| Landing, nach 15 Sekunden | mindestens vier von fünf erklären Zielgruppe, Zweck, persönlichen Nutzen, Wahlkreisrolle und fehlende Personen-/Parteibewertung korrekt. |
| Jede Frage | die Testperson ohne Hilfe sagen kann: „Die wollen gerade von mir wissen, …“ |
| Report, nach zwei Minuten | Ziel, Bundeshebel, Begründung, Erfolgssignal, größtes Risiko und parlamentarische Verwendung korrekt benannt werden. |
| Nutzwert | mindestens ein Reportbaustein für die Arbeit am nächsten Tag konkret verwendbar ist. |
| Zeit | Median des Pflichtteils liegt ungefähr bei vier Minuten, ohne künstliche Zeitgarantie. |
