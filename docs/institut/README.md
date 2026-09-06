# Projektchroniken des Wirkungsinstituts

Der öffentliche Nachtrag vom 06.09.2026 dokumentiert Parlament, Wirkungsticker und Umfragen. Er rekonstruiert belegte Arbeitsstände; er behauptet weder ein unbelegtes Ideendatum noch eine rückdatierte unabhängige Abnahme.

## Führende Orte

- Die Institutsdatenbank führt die bearbeitbaren Projekte, Aufgaben, Dokumentversionen und Quellen. Alle nachgetragenen Aufgaben sind Natalie Weber zugewiesen und sichtbar.
- `content/institut/projects.json` enthält den ausdrücklich öffentlichen Stand des Nachtrags. Die neun Markdown-Dateien hier sind dessen lesbare Dokumentkopien.
- `content/institut/source-revisions.json` hält feste Repository-Versionen für die öffentlich verlinkten Entwicklungsbelege fest. Keine veränderlichen Quelldateien als vermeintlich unveränderliche historische Belege behandeln.
- `scripts/site/build-institut-projects.mjs` erzeugt die Übersicht und drei Projektakten mit dem vorhandenen Content-Template, Navigation, Footer, Suchmetadaten und Sitemap.
- Die Karten der Startseite verwenden den bestehenden, beim Homepage-Build erhaltenen Projektbereich. Der datierte Lerntext und die zugehörigen PDF-Ausgaben bleiben unverändert.

## Fortschreibung

Neue fachliche Arbeitsschritte zuerst im Institut erfassen: eindeutiger Auftrag, Verantwortliche, Status, Arbeits-/Belegdatum, Ergebnis oder nächster Schritt und Abnahmekriterium. Historische Daten und tatsächliche Erfassung getrennt halten. Ohne Prüfung keinen Livegang und keine unabhängige Abnahme behaupten.

Bei einer neuen öffentlichen Zusammenfassung den Snapshot mit neuem Standdatum und nachvollziehbaren Quellen fortschreiben oder eine ergänzende Chronik anlegen. Die öffentliche Chronik vom 06.09.2026 ist kein automatisch synchronisiertes Abbild des aktuellen Boards. Private Daten, Rückmeldungen und geschützte Dokumente werden nicht exportiert.

Generatoren: `npm run build:parlament-info`, `npm run updates:build`, `npm run polls:build`, `npm run news:build`. Der reguläre Gesamtbuild und das Auslieferungsartefakt enthalten die einschlägigen Qualitäts-, Such- und Datenschutzprüfungen.

## Fachlicher Umfang

Im Institut finden ausschließlich fachliche Diskussionen statt. Fachliche Projektaufträge, Konzepte, Arbeitsstände und Ergebnisse gehören in die Projektakten.

Operative Angelegenheiten betreffen ausschließlich die Inhaberin. Sie werden weder im Diskurs noch in öffentlich oder für Institutsmitglieder sichtbaren Projekten, Aufgaben, Dokumenten oder Startseitenhinweisen geführt. Die Sichtbarkeit „intern“ ist ohne nachgewiesene Beschränkung auf die Inhaberin dafür nicht ausreichend.
