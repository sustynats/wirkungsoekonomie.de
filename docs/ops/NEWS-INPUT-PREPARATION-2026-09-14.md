# Nachrichtenaufträge vor Kostenbuchung prüfen

`prepared` bezeichnete bisher lediglich das gebaute Bridge-Paket. Discovery
prüfte Auswahl, Quellenidentität und Eingabegröße, ließ bei fehlgeschlagenem
Artikelabruf aber auch reine Metadaten weiterlaufen. Der API-Service prüfte
Transport, Hash-Bindung, Budget und Idempotenz. Eine gemeinsame Prüfung des
tatsächlich übermittelten Belegmaterials fehlte. Die ChatGPT-Vorauswahl war
kein verpflichtender Produktionsschritt.

## Korrektur

`newsInputReadiness` prüft das native, bereits begrenzte Eingabepaket kostenlos:
ein Nachrichtengegenstand, Quellenidentität und Datum, gebundene Claims,
auflösbare Belegreferenzen und mindestens einen lesbaren Auszug jenseits der
Überschrift. Der technische Mindestumfang beträgt 120 Zeichen und 18 Wörter;
er bestätigt keine Tatsachen und keine redaktionelle Relevanz. Aussagekräftige
RSS-Auszüge bleiben zulässig. Keine pauschale Zwei-Quellen- oder Volltextpflicht.
Sammelüberschriften mit mehreren `++`-Meldungen brauchen zunächst einen
Ereigniszuschnitt; TV-Programmvorschauen werden nicht als Ereignisaufträge
behandelt. Player-Konfiguration zählt nicht als Artikeltext.

Die Prüfung läuft nach Quellenabruf in Discovery, vor einem neuen Claim im
Worker sowie direkt vor Kostenreservierung im API-Service. Fehlende Vorbereitung
bleibt als `NEEDS_PREPARATION` mit konkreten Gründen erhalten. Sie erzeugt keinen
Claim, keine Budgetreservierung und keinen bezahlten Aufruf und verbraucht im
Worker keinen der bezahlten Durchlaufplätze. Discovery darf später neue, tatsächlich
veränderte Belege liefern. Keine Neuanlage als Umgehung verbrauchter Aufträge.

HTML-Attribute werden jetzt vor Entity-Decodierung entfernt. Dadurch gelangen
Player-JSON und darin enthaltene HTML-Fragmente nicht in den Quellenauszug.

`READY_FOR_DRAFT` bedeutet ausschließlich technisch vollständiger Eingang.
Nachrichtenwert, Aussagegehalt, Gegenbelege und MPD-Richtigkeit sind damit nicht
bewiesen. Die nachgelagerte fachliche Prüfung bleibt erforderlich. Die bisherigen
18 `validation_failed`-Fälle sind Fehler nach einem API-Ergebnis; diese Änderung
behauptet nicht, dass alle durch Eingabeprobleme verursacht wurden. Ihre genauen
Fehler erscheinen im privaten Processor-Health-Report, nicht im öffentlichen Feed.

## Rollout und Rückfall

Discovery verwendet den gemergten GitHub-Stand. Auf Oracle müssen API-Service
und Worker gesondert aktualisiert werden. Der Service meldet
`execution_policy.input_readiness_version`; der neue Worker verlangt die
passende Version vor seinem Read-/Write-Preflight. Ein grüner GitHub-Deploy
ist kein Nachweis dieses Oracle-Rollouts.

Beim Runtime-Wechsel aktiven Worker abschließen lassen, Timer kontrolliert
anhalten, Prozesslock erwerben, beide Runtimes privat sichern, als Dienstbenutzer
Module laden und authentifizierte Gesundheit prüfen. Neue Runtime nur bei PASS
aktivieren. Fehler: vorherige Runtime wiederherstellen. Queue, Rohantworten,
Claims, ACKs und Kostenjournale niemals zurücksetzen. Bereits bezahlte Ergebnisse
bleiben unabhängig von der neuen Eingabeprüfung kostenlos wieder abrufbar.

Die zusätzliche Prüfung ist keine neue kostenpflichtige Auswahlstufe. Die
beiden Modellschritte und alle bisherigen Publikations-/Autorenfreigaben bleiben.
