# Gezielte ChatGPT-Korrekturen im Wirkungsticker

Stand: 10. September 2026. Ergänzung zu Bridge-3 auf ausdrücklichen Auftrag der Projektinhaberin. Vertrag und Fehlerhistorie werden nicht rückwirkend verändert.

Ein ungültiges Ergebnis bleibt unveröffentlicht. Korrigierbare Schema-, Zusammenfassungs-, native Qualitäts- und Merge-Ereignisfehler werden automatisch an denselben ChatGPT-Prozess zurückgegeben. Reine Wiederholung desselben ungültigen Outputs ist keine Reparatur.

- Gleiche Job-ID, gleicher input_hash, unveränderter Originalinput und Quellenbestand.
- Höchstens zwei redaktionelle Korrekturrunden pro Job. Danach gezielte Klärung mit Fehlergrund und Betriebswarnung; kein Endloslauf.
- Test-only-Jobs, bereits quittierte Jobs, falsche Bindungen und unbekannte technische Fehler werden nicht automatisch zur redaktionellen Korrektur freigegeben.
- Der Importer persistiert zuerst den Korrekturauftrag privat. Er bewahrt das fehlerhafte Output unverändert in `90_ERRORS/<JOB_ID>.correction-<N>.output.json` auf.
- Danach schreibt er atomar `00_INBOX/<JOB_ID>.repair-<N>.json`. Das Paket enthält den unveränderten Originalinput, Fehlercodes und den Verweis auf das fehlerhafte Ergebnis. Bei historischen Reparaturen kann das ursprüngliche Input bereits in `90_ERRORS` liegen; maßgeblich ist deshalb der eingebettete Originalinput, nicht ein angenommener Claim-Pfad.
- Discovery schreibt weiterhin ausschließlich neue input.json-Pakete. Import schreibt nur die zu seinen eigenen Jobs gehörenden repair-Pakete. Beide laufen mit ihren bestehenden getrennten Locks. Kein zweiter fachlicher Datenbestand und keine zusätzliche manuelle Queue.

## Verarbeitung in ChatGPT

Vor und während jedes laufenden Durchgangs sowohl offene input.json als auch repair-N.json in 00_INBOX prüfen. Bestehendes ACK oder fertiges Output zuerst prüfen. Einen repair-Auftrag nach 10_CLAIMED verschieben und genau dessen Job nacharbeiten. Originale in 90_ERRORS unverändert lassen. Nach Korrektur alle nativen Prüfungen beachten, nicht nur den zuerst sichtbaren Fehler. Vollständiges output.json atomar und zuletzt nach 20_OUTPUT_READY zurückschreiben. Keine Bilder erzeugen, keine API-Aufrufe.

Vor Rückgabe:

1. Native Analyse vollständig fertigstellen; dann story.short_summary exakt aus analysis.summary und story.detailed_summary exakt aus analysis.source_summary übernehmen.
2. Quellen- und Evidence-IDs müssen im unveränderten Input existieren. Zahlen brauchen passende Belege in genau den zugeordneten Evidenzausschnitten.
3. MPD-Enums, vollständige konkrete Pfade, Referenzzustand und Pfadrollen aus dem nativen Prompt verwenden. Keine Gegenwirkung oder Quelle zum Bestehen eines Gates erfinden.
4. Den gegebenenfalls angeforderten nativen Mediencheck liefern. Das äußere frame_check ersetzt analysis.media_impact nicht.
5. Merge nur mit tatsächlich veröffentlichtem, identischem Ereignis und bekannten aktuellen Hashes. Sonst begründet hold/reject. Nicht zutreffende optionale Hash-Felder weglassen, nicht null setzen.
6. Schema, job_id, input_hash und test_only unverändert respektieren. Ein gehaltenes Ergebnis ist zulässig; falsche Sicherheit nicht.

## Zeitachsen und Fehlerbehandlung

ChatGPT verarbeitet Korrekturen während eines bereits aktiven Durchgangs oder beim nächsten bestehenden Stundenlauf (HH:00 Europe/Berlin). Ein direkter manueller Nutzeranstoß ist möglich. Der Server weckt ChatGPT nicht auf; es gibt keinen neuen Scheduler und keinen versteckten API-Aufruf.

Der Importer prüft weiterhin alle fünf Minuten; fertige Korrekturen müssen nicht bis zur vollen Stunde warten. Fehlendes Output bleibt PROCESSING_PENDING und erhöht keine Versuche. Unterbrochene Übertragung des Korrekturauftrags wird höchstens dreimal mit demselben Paket wiederaufgenommen. Eine neue redaktionelle Runde wird dabei nicht angelegt.

ACK entsteht erst nach privatem Staging oder dem bestehenden dauerhaft übernommenen Publikationsschritt. Abgeschlossene repair-Dateien werden mit demselben Job archiviert; 90_ERRORS bleibt unverändert erhalten. Fehlende Claim-/Output-Rückgabe gilt weiterhin erst jenseits der bestehenden Zwei-Stunden-Schwelle als auffällig.

Aktivierung: WOEK_NEWS_BRIDGE_CORRECTIONS_ENABLED=true. Kosten: nur bestehende Dropbox-/Oracle-/GitHub-Operationen. Higgsfield wird erst nach einer gültigen Veröffentlichungsempfehlung aufgerufen; keine anderen KI-Anbieter.
