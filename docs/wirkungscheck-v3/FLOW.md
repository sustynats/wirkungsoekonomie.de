# Wirkungscheck Bundestag V3 – Ablauf

## Sichtbarer Ablauf

```text
Landing-Page
  → optional Wahlkreis als Rückkopplungsebene
  → Thema
  → Ziel
  → politischer Ansatz
  → unmittelbare Wirkungsvorschau
  → begrenzender Faktor
  → Kombinationserklärung
  → rote Linie
  → Risikovorschau
  → bundesweite Erfolgssignale
  → Evidenzhinweis
  → regionale Praxisrückmeldung
  → optionaler Umsetzungsrahmen, nur wenn er den Fall differenziert
  → Kurzreport
  → Herleitung, Instrumente, freiwillige WÖK-KI
```

Es gibt keinen separaten Einführungsscreen. Die Landing-Page erklärt Zweck,
Absender, Nutzen, Wahlkreisrolle, Schutz und Dauer vollständig.

## Pflichtschritte

| Schritt | Sichtbare Frage | Auswahl | Anpassung |
| --- | --- | --- | --- |
| 1 | Welches bundespolitische Thema möchten Sie heute betrachten? | genau eins | Pilot: Wohnen oder Gesundheit und Pflege |
| 2 | Was soll sich konkret verbessern? | genau eins | themenspezifische Zielzustände |
| 3 | Welchen politischen Ansatz würden Sie zunächst prüfen? | genau eins | abhängig von Thema und Ziel |
| 3a | Was verändert dieser Ansatz zunächst? | keine Auswahl | direkte Wirkung, offene Bedingung, nächste Frage |
| 4 | Was blockiert diesen Weg derzeit am stärksten? | ein oder zwei Punkte | abhängig von Thema und Ansatz |
| 4a | Was bedeutet diese Kombination? | keine Auswahl | Passung Ansatz–Engpass, möglicher zusätzlicher Bundeshebel |
| 5 | Was darf eine Lösung auf keinen Fall verschlechtern? | ein oder zwei Punkte | themenspezifische rote Linien |
| 5a | Was folgt aus dieser Grenze? | keine Auswahl | Nichtkompensation in Alltagssprache |
| 6 | Woran müsste bundesweit erkennbar sein, dass der Ansatz funktioniert? | bis zu drei | themenspezifische Zustandsindikatoren |
| 6a | Was zeigen diese Daten – und was nicht? | keine Auswahl | Output–Wirkung-Erläuterung |
| 7 | Woran zeigt sich das in Praxis oder Wahlkreis? | genau eins, optionaler Freitext | abhängig von Wahlkreiswahl und Thema |
| 8 | Was ist Ihnen bei der Umsetzung besonders wichtig? | bis zu zwei | nur, wenn die Regelengine daraus eine relevante Differenzierung ableitet |

## Verhalten der Sofortreaktionen

- Eine Sofortreaktion erscheint direkt nach der Auswahl im selben Schritt.
- Sie wird nicht als Zustimmung, Fehler oder Korrektur der politischen
  Entscheidung formuliert.
- Sie verwendet drei feste Teile: **Was verändert sich zunächst?**,
  **Was folgt daraus noch nicht automatisch?**, **Deshalb fragen wir als
  Nächstes …**
- Der Weiter-Button wird erst nach Sichtbarkeit der Karte angeboten. Es gibt
  keinen automatischen Sprung und keinen Sprung an den Seitenanfang.
- Gleiches Input-Set erzeugt dieselbe Reaktion und denselben Report.

## Wahlkreiswahl

Vor Schritt 1 ist die Wahlkreiswahl optional:

- **Wahlkreis einbeziehen:** Der Report enthält eine passende regionale
  Rückkopplungsfrage. Daten werden nur angezeigt, wenn sie nach
  `DATA_AUDIT_V3.md` fachlich passend und verifiziert sind.
- **Nur Bundesebene betrachten:** Der vollständige Check läuft weiter; die
  letzte Frage bezieht sich auf Regionen oder Praxis.

Der Wahlkreis wird nicht bewertet, nicht gerankt und beeinflusst keine
politische Empfehlung.

## Unterbrechung, Zurückgehen, Teilen

- Antworten bleiben lokal im Browser und können später fortgesetzt werden.
- Zurückgehen ändert eine frühere Auswahl; davon abhängige Antworten müssen
  anschließend geprüft und gegebenenfalls neu gewählt werden.
- Ein Report-Link enthält die gewählten Angaben ausschließlich im
  URL-Fragment. Das Fragment wird nicht an den Webserver übertragen. Der
  Linkhinweis macht die enthaltenen Angaben transparent.
