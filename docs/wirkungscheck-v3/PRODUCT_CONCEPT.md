# Wirkungscheck Bundestag V3 - Produktkonzept

**Status:** Fach- und UX-Spezifikation vor der Implementierung.
**Stand:** 13. August 2026.
**Pilotumfang:** Wohnen sowie Gesundheit und Pflege.

## Ausgangspunkt

Der Wirkungscheck Bundestag ist kein Fragebogen über politische Haltungen und
keine Bewertung von Abgeordneten. Er ist ein parteiunabhängiges
Arbeitsinstrument für Mitglieder des Deutschen Bundestages und ihre
Mitarbeitenden.

Eine politische Entscheidung kann ein Gesetz, einen Haushalt, eine Förderung,
eine Regel oder ein Verfahren verändern. Ob sich dadurch der gewünschte Zustand
tatsächlich verändert, ist damit noch nicht entschieden. V3 macht diese
Unterscheidung im Ablauf sichtbar:

```text
Politisches Ziel → gewählter Ansatz → unmittelbare Folge → möglicher Engpass
→ Schutzgrenze → beobachtbare Veränderung → regionale Praxisrückmeldung
→ Korrekturpunkt
```

Der Wahlkreis ist dabei eine optionale Rückkopplungsebene. Er entscheidet nicht,
welche Bundespolitik richtig ist, und wird nicht mit anderen Wahlkreisen
verglichen.

## Zielgruppe und Nutzungssituation

V3 richtet sich an Menschen mit politischer und fachlicher Erfahrung, aber ohne
erforderliches Vorwissen zur Wirkungsökonomie. Der Check muss in vier bis fünf
Minuten verständlich sein und darf nicht wie ein Lehrbuch, ein Parteitest oder
eine wissenschaftliche Erhebung wirken.

Die Anwendung beantwortet für einen einzelnen Fall:

1. Was soll Bundespolitik tatsächlich verändern?
2. Welcher politische Ansatz wird zunächst betrachtet?
3. Welche unmittelbare Folge hat dieser Ansatz - und was folgt daraus noch
   nicht automatisch?
4. Wo kann der Wirkpfad abbrechen?
5. Welche Verschlechterung darf nicht gegen andere Fortschritte aufgerechnet
   werden?
6. Woran wäre Erfolg bundesweit und optional im Wahlkreis erkennbar?
7. Wann muss eine Annahme überprüft oder der Ansatz korrigiert werden?

## Sichtbares Leistungsversprechen

Nach jedem entscheidenden Schritt erscheint eine kurze, redaktionell
freigegebene Wirkungsvorschau. Sie bewertet keine Antwort, sondern erklärt die
Folge der Auswahl und leitet zur nächsten Frage über.

Nach dem Pflichtteil entsteht ein persönlicher, deterministisch erzeugter
**Bundespolitik-Wirkungsreport** mit:

- dem gewählten Ziel und Ansatz;
- einer Einordnung, ob der Ansatz den genannten Engpass unmittelbar, teilweise
  oder zunächst nicht unmittelbar adressiert;
- einem oder zwei möglichen Bundeshebeln;
- einem Wirkpfad mit höchstens fünf Stationen;
- bis zu drei geeigneten Erfolgssignalen;
- einer regionalen Praxisrückmeldung oder einer klaren Datenlücke;
- einer roten Linie nach dem Nichtkompensationsprinzip;
- einem Korrekturpunkt;
- einer kopierbaren parlamentarischen Prüffrage;
- einer nachvollziehbaren Herleitung auf Wunsch.

Im Anschluss folgen höchstens zwei passende WÖk-Instrumente sowie optional eine
separat einwilligungsbasierte Vertiefung mit der WÖK-KI.

## UX-Prinzipien

- **Entscheiden, Folge sehen, weiterdenken:** Eine Auswahl erzeugt sofort eine
  konkrete Erklärung, keine abstrakte Belehrung.
- **Ein Gedanke pro Screen:** Pflichttexte enthalten nur die für die aktuelle
  Entscheidung nötige Information.
- **Bund zuerst:** Der bundespolitische Wirkpfad steht vor regionalen
  Rückmeldungen.
- **Zustände statt Aktivitäten:** Projekte, Mittelabfluss und formaler Vollzug
  sind keine Belege dafür, dass sich das Ziel bei Betroffenen verändert.
- **Keine Scheingenauigkeit:** Wo passende Daten fehlen oder mehrere Hebel
  plausibel sind, zeigt der Check dies offen.
- **Keine künstliche Eindeutigkeit:** Er liefert Prüfaufträge, keine
  Wahlempfehlung, keine Parteiposition und keine endgültige Kausalbehauptung.
- **Keine Personenbewertung:** Kein WÖK-Score, kein Alignment-Score,
  kein Parteivergleich, keine Rangliste und kein Fraktions- oder
  Persönlichkeitsprofil.

## Technische und methodische Leitplanken

- Die Sofortreaktionen und der Pflichtreport sind deterministisch und zentral
  redaktionell versioniert. Im Fragebogenkern wird kein LLM verwendet.
- Die vier internen Bundesrollen bleiben erhalten: Rechtsrahmen und Standards,
  Finanzierung und Anreize, Vollzug und Umsetzbarkeit, Wirkungsdaten und
  Rückkopplung. Nutzer:innen wählen sie nicht selbst.
- Die Ableitung verwendet Thema, Ziel, Ansatz, Engpass, rote Linie,
  Erfolgssignale, optionalen Umsetzungsrahmen und geprüfte Daten.
- Der Hauptreport enthält keine modellierte Wirkungskurve und keine
  Pseudoprognose. Er zeigt Wirkpfadstationen.
- Der Check überträgt keine Antworten im Hintergrund. Analytics erfasst nur
  freigegebene Ereignisse ohne politische Antwortwerte.
- Die WÖK-KI startet nur nach ausdrücklicher Einwilligung. Sie erhält keine
  Partei, Fraktion, E-Mail-Adresse, CiviCRM-ID oder dauerhafte Zuordnung zu
  einer eingeladenen Person.

## Abgrenzung und Versionierung

V1 ist im Tag `archive/wirkungscheck-v1-2026-08-13` gesichert. V2 ist im Tag
`archive/wirkungscheck-v2-preview-2026-08-13` gesichert. Beide bleiben
technisch nachvollziehbar, sind jedoch keine Grundlage für weitere
Nutzertests.

Der bestehende öffentliche Altpfad bleibt während der V3-Entwicklung auf einer
neutralen Überarbeitungsseite. V3 wird erst nach fachlicher Abnahme,
Datenaudit und Think-Aloud-Test produktiv geschaltet.

## Abnahmekriterien

V3 darf in den Pilot erst übergehen, wenn mindestens vier von fünf Personen
ohne WÖk-Vorwissen in einem Think-Aloud-Test:

1. den Zweck innerhalb von 15 Sekunden erklären können;
2. Bundespolitik als Hauptgegenstand und den Wahlkreis als optionalen
   Realitätscheck erkennen;
3. jede Pflichtfrage ohne zusätzliche Erklärung beantworten können;
4. die Sofortreaktionen als hilfreiche Folgeerklärung und nicht als Bewertung
   verstehen;
5. mindestens einen Reportbaustein als praktisch nutzbar bezeichnen können.
