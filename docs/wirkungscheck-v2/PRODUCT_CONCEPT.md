# Wirkungscheck Bundestag V2 – Produktkonzept

## Status und Abgrenzung

Dieses Dokument ist die verbindliche Konzeptgrundlage für V2. Es beschreibt
keine bereits veröffentlichte Anwendung. V1 ist technisch im Git-Tag
`archive/wirkungscheck-v1-2026-08-13` gesichert, wird öffentlich jedoch durch
eine neutrale Überarbeitungsseite ersetzt. V2 entsteht ausschließlich im Branch
`codex/wirkungscheck-v2` und wird erst nach fachlicher und UX-seitiger Abnahme
produktiv geschaltet.

Der sichtbare Produktname lautet **Wirkungscheck Bundestag**. Claim:
**Bundespolitik prüfen. Wirkung vor Ort sichtbar machen.** Die bisherige
Bezeichnung bleibt nur als technische Altbezeichnung und bestehender URL-Pfad
erhalten. Eine spätere kanonische Route `/werkzeuge/bundestag-wirkungscheck/`
wird erst mit der V2-Veröffentlichung entschieden; die alte Route muss dann
dauerhaft kompatibel bleiben.

## Problem, Zielgruppe und Nutzen

Adressiert werden Mitglieder des Deutschen Bundestages und ihre Büros. Sie
brauchen kein Vorwissen zur Wirkungsökonomie. Ihr Arbeitskontext ist eine
bundespolitische Entscheidung, nicht eine Bewertung ihres Wahlkreises.

Der Check beantwortet nach wenigen Angaben:

1. Welcher Zustand soll sich durch Bundespolitik konkret verändern?
2. Was begrenzt diese Veränderung vermutlich?
3. Welcher Bundeshebel ist deshalb ein plausibler erster Prüfauftrag?
4. Woran wäre Erfolg bundesweit und – freiwillig – vor Ort erkennbar?
5. Welches Risiko darf dabei nicht übersehen werden und wann ist
   nachzusteuern?

Der sofortige Nutzwert ist eine Arbeitsgrundlage für Parlaments-, Ausschuss-
oder Wahlkreisarbeit: Wirkungskette, drei Beobachtungsmerkmale,
parlamentarische Prüffrage und Korrekturpunkt. Erst nach diesem Nutzen erklärt
das Produkt den dahinterliegenden Ansatz der Wirkungsökonomie.

## Produktprinzipien

- **Bund zuerst:** Gesetz, Haushalt, Förderung, Zuständigkeit oder Verfahren
  auf Bundesebene sind der Ausgangspunkt.
- **Wahlkreis als Realitätscheck:** Die regionale Ebene ist freiwillige
  Rückkopplung. Sie bestimmt weder das Thema noch die Bundespolitik.
- **Verständlichkeit vor Fachvokabular:** Ein Gedanke pro Frage; Alltagssprache
  im Pflichtteil; Fachbegriffe nur intern oder in freiwilligen Details.
- **Empfehlung statt Gewissheit:** Der Report zeigt plausible Ansatzpunkte,
  keine „richtige Lösung“ und keine Kausalitätsbehauptung ohne Nachweis.
- **Zustände vor Aktivitäten:** Ausgaben, Projekte oder formale Vollzüge sind
  keine Erfolgsbelege. Beobachtet wird, was sich bei Betroffenen tatsächlich
  verändert.
- **Nichtkompensation:** Eine schwere Verschlechterung der ausgewählten roten
  Linie kann nicht durch Vorteile an anderer Stelle aufgewogen werden.
- **Rekonstruktion statt Blackbox:** Jeder Vorschlag lässt sich auf Thema,
  Ziel, Engpass, Bedingungen, Daten und fachlichen Baustein zurückführen.

## Sichtbares Leistungsversprechen

Nach dem Pflichtteil erhält die nutzende Person:

- einen möglichen bundespolitischen Hebel;
- eine kurze, nachvollziehbare Wirkungskette;
- drei geeignete Erfolgsmerkmale;
- eine regionale Rückkopplung oder eine klar bezeichnete Datenlücke;
- eine kopierbare parlamentarische Prüffrage;
- ein relevantes Wirkungsrisiko;
- einen konkreten Zeitpunkt beziehungsweise Trigger zum Überprüfen und
  Nachsteuern;
- die vollständige Herleitung auf Wunsch.

## Nichtziele und Schutzlinien

V2 ist kein Wahl-O-Mat, keine Meinungsumfrage und kein Tool zur Bewertung von
Menschen. Es gibt keinen WÖK-Score, Offenheits- oder Alignment-Score,
Parteienvergleich, Fraktionsprofil, Wahlempfehlung oder Personenranking.

CiviCRM verwaltet gegebenenfalls Einladungen. Der Check erhält daraus keine
Empfängeridentität und übermittelt keine Antworten zurück. Produktanalytik
erfasst nur freigegebene, nicht inhaltliche Ereignisse. Eine Forschungsnutzung
ist ein späterer, klar getrennter Einwilligungsfall.

## Pilotumfang

V2 Phase 1 implementiert nur zwei vollständige Themenmodule:

| Modul | Grund für den Pilot |
| --- | --- |
| Wohnen | Mehrere echte Mechanismen: Bedarf, Bestand, Neubau, Kosten, Verdrängung und Fläche. |
| Gesundheit und Pflege | Andere Wirklogik: Zugang, Kapazität, Übergaben und Versorgungskontinuität. |

Die übrigen acht Themen erscheinen im V2-Pilot nicht als unfertige Auswahl.
Sie erhalten erst nach dem Think-aloud-Test eigene, fachlich freigegebene
Module.

## Abnahmekriterien vor Implementierung

Die Spezifikation ist erst bereit für die nächste Phase, wenn die folgenden
Punkte geprüft wurden:

- Der Pflichtfluss enthält genau sieben inhaltliche Fragen, keine Rangfolge,
  keine explizite Bundesrollenfrage und keine Pflicht-Instrumentenabfrage.
- Wohnen und Gesundheit/Pflege besitzen je vollständige sichtbare Texte und
  fachliche Bausteine.
- V1-Daten sind nach `DATA_AUDIT.md` nur dort verwendbar, wo ihre
  Aussagegrenze zum Wirkpfad passt.
- Modellkurven, Sensitivitätsanalyse und WÖK-KI sind im Pilot deaktiviert.
- Mindestens fünf Personen ohne WÖK-Vorwissen bestehen Landing-, Fragen- und
  Report-Think-alouds gemäß `FLOW.md`.
