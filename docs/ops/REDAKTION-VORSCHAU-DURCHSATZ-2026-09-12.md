# Redaktion: Vorschau und Nachweis des Nachrichtendurchsatzes

## Fehler und Korrektur

Ein `staged`-ACK bestätigt die technische Übernahme, nicht einen fertig geprüften Artikel. Die Auftragsliste kennzeichnet solche Ergebnisse jetzt als Zwischenstand oder laufende Weiterverarbeitung. Eine blockierte Prüfung hat Vorrang vor dem alten Staging-Status. Erst der versionierte Review meldet „Bereit für Deine Freigabe“.

Die alte Inline-Vorschau zeigte Fehler am Seitenende und konnte durch die periodische Aktualisierung der Karten verschwinden. Der neue unabhängige Lesebereich zeigt Ladezustand, Fehler und Wiederholung direkt am Text. Absätze bleiben erhalten, fremder Text wird ausschließlich als Text dargestellt. Verspätete Antworten nach einem Ansichtswechsel werden ignoriert. Der Service-Worker-Shellcache erhält Version 6; private API-Antworten werden weiterhin nicht gespeichert.

Im Bridge-Modus war die frühere Prüfung auf ausbleibende Veröffentlichungen ausgemustert worden. Die verbleibenden Prüfungen erfassten Verfügbarkeit und abgeschlossene Arbeitsaufträge, aber nicht den Unterschied zwischen Fachprüfungen, Ablehnungen, privaten Entwürfen und veröffentlichten Nachrichten. Neu sind getrennte Alarme für fehlende Shards und über zwei Stunden ausbleibende Nachrichtenveröffentlichungen trotz wartender aktueller Nachrichten. Diese verwenden den tatsächlichen Abschlussnachweis, keine neu gesetzten Datumswerte.

Processor-Health unterscheidet aktuelle Nachrichtenaufträge ohne vollständige Ausgabe, in Zweitprüfung, mit Korrekturbedarf und vor dem Import. Zweitprüfjobs und historische Neubewertungen zählen dabei nicht als zusätzliche Nachrichtenaufträge. Die vorhandene tägliche private Discord-Auswertung zeigt diese Stufen und nennt abgeschlossene Jobs ausdrücklich nicht Artikel.

Abgeschnittene Antworten beim Lesen der Bridge bleiben nach dem begrenzten Wiederholungsversuch ein sichtbarer Transportfehler. Sie dürfen aber auch nach mehreren Läufen keinen vollständigen Output als fachlich fehlerhaft quarantänisieren. Solche Leseausfälle behalten denselben Auftrag und unveränderten Output mit begrenztem Retry-Zeitpunkt. Schreiboperationen werden nicht blind wiederholt; Zugriffsfehler erhalten diese Behandlung nicht. Die vorbereitete serverseitige Pagination muss zusätzlich auf Oracle installiert werden.

Die private Redaktionsoberfläche löst die fremde schreibende #253-Inhaltsprojektion nicht mehr aus. Deren automatischer Commit hatte andernfalls hunderte öffentliche Projektionen in den UX-PR geschrieben und Konflikte mit laufenden News-Imports erzeugt. Die vollständigen Website-, Datenschutz-, Such- und Sicherheitsprüfungen laufen weiter.

## Unveränderte Grenzen

Keine Lockerung der Quellen-, Fakten-, MPD- oder Freigabegates. Keine Erfindung von Autorenmeinungen. Kein Übergehen eines fehlgeschlagenen Transports. Kein neuer Dienst und keine zusätzlichen kostenpflichtigen Anbieter. Die Änderungen am Monitor und Processor werden von den bestehenden GitHub-Läufen genutzt; keine neue lokale Automation ist erforderlich.

## Prüfung

- `npm run news:test`
- `npm run typecheck`
- `npm run lint` (bestehende 25 Sprachbefunde unverändert)
- `node tests/news/editorial-preview.browser.mjs`
- vollständiger Build und Veröffentlichung über den bestehenden PR-/Pages-Prozess

Der Browsertest verwendet ausschließlich lokale Beispieldaten. Er prüft Statusvorrang, sichtbaren Fehler mit Wiederholung, lesbaren sicheren Text, Erhalt bei Aktualisierung, ignorierte verspätete Antwort und die mobile Ansicht. Ein Browserzugang zur echten privaten Redaktion muss separat mit dem berechtigten Konto geprüft werden; ein lokaler Test attestiert keine serverseitige Fertigstellung eines konkreten Beitrags.
