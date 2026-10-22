# Bezahlte Antwort auch bei unlesbarem JSON erhalten

Stand: 22. Oktober 2026

Eine erfolgreiche Providerantwort konnte bisher vor der privaten Archivierung
an `AI_MALFORMED_JSON` oder fehlendem finalem Text scheitern. Kosten und
Versuchssperre blieben erhalten, der Antworttext aber nicht. Ein gruener
Verschluesselungsschritt mit null Dateien ist kein Originalnachweis.

Der Worker reicht deshalb bei diesen Fehlern die unveraenderte Providerantwort
und den ausgelesenen Antworttext ausschliesslich an die private Sicherung weiter:

- Lokale JSON-Datei mit Modus 0600, exklusivem Anlegen und exaktem Readback;
  der vorhandene Workflow verschluesselt sie auch nach einem Verarbeitungsfehler.
- Unveraenderliches Bridge-Archiv mit Job-ID, Eingabehash, Pass, Modell,
  Usage, Kosten, Fehlerkennung und Readback.
- Oeffentlicher Laufbericht nur mit Sicherungsstatus und technischen
  Fehlerkennungen, niemals Antworttext oder Providerpayload.

Das gilt auch, wenn der bereits bestehende Formatnachlieferungspass an JSON
scheitert. Anzahl und Auswahl der Aufrufe werden nicht veraendert.
Ein unklarer Archivschreibausgang wird nicht wiederholt. Scheitern beide
Sicherungen, bleibt dies sichtbar; der bezahlte Versuch bleibt gesperrt.

Die Provideranfrage behaelt `store: false`. Die
[offizielle OpenAI-Dokumentation zur Speicherung](https://developers.openai.com/api/docs/guides/conversation-state)
beschreibt, dass diese Einstellung die regulaere Speicherung von Responses
deaktiviert. Eine spaetere Wiederherstellung beim Anbieter wird nicht zugesagt.

Diese Aenderung stellt keine bereits verlorene Antwort wieder her, repariert
kein JSON, erzeugt keinen Entwurf und erteilt keine Freigabe. Workerversion,
Modelle, Budget, Kontingente, Locks und Inhaltsgates bleiben unveraendert.
Die Regressionen verwenden ausschliesslich simulierte Providerantworten.
