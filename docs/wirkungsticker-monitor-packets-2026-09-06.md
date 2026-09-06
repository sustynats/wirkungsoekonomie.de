# Betriebsmonitor und wachsende Quellenpakete – 6. September 2026

## Bestätigte Ursachen

- Der Betriebsmonitor importiert seit der Stückkosten-Erweiterung `scripts/news/operating-cost.mjs`. Der selektive GitHub-Checkout enthielt diese Datei nicht. Daher brachen die Monitor-Tests vor der eigentlichen Überwachung ab, obwohl die Nachrichtenläufe weiterliefen.
- Die Wahlakte `wt-06476c6e980f5f47` wuchs auf 20 Quellen. Im produktiven Vorabtest benötigte selbst die begrenzte Belegauswahl 19.193 Datenzeichen bei 17.621 verfügbaren Zeichen. Es erfolgte kein kostenpflichtiger Aufruf für diesen unpassenden Eingang; der Auftrag blieb gespeichert.

## Korrekturen

- Der Monitor lädt seine neue Abhängigkeit mit. Ein Regressionstest verfolgt sämtliche lokalen Modulimporte von Monitor und Tests und gleicht sie mit der Checkout-Liste ab. Auch die Workflowdatei selbst wird für diesen Test geladen.
- Dichte Quellenpakete verwenden rohe Tabellenzellen statt zusätzlicher Einzelelement-Arrays. Eine separate Liste unterscheidet explizite Nullwerte von fehlenden Eigenschaften.
- Belegstellen liegen in einer gemeinsamen Tabelle mit ausdrücklichem Quellenindex. Wortlaut, Reihenfolge und Zuordnung bleiben erhalten. Der erste produktive Versuch lag noch acht Zeichen über dem Datenbudget. Deshalb erhalten Belege für die Übertragung kurze, ausschließlich im jeweiligen Auftrag gültige Verweise. Vor Validierung und Speicherung werden sie aus dem exakten Eingang wieder in Quellenkennung, vollständige URL und unveränderten Wortlaut aufgelöst. Historische Hash-Kennungen bleiben gültig; unbekannte oder gemischte Verweise werden nicht repariert.
- Vergleichshistorie wird ebenso verlustfrei tabellarisch transportiert. Wiederholte Herkunftsangaben, Daten und gleichlautende Hinweise zur begrenzten Belegauswahl werden nur einmal übermittelt; Abweichungen bleiben ausdrücklich bestehen.
- Quellen, Claims, Herkunft, Widersprüche und bestehende Artikel werden nicht gelöscht. Die bereits vorhandene Auswahl unveränderter Textstellen bleibt transparent begrenzt; keine zusätzlichen Artikelabrufe oder KI-Dienste wurden eingeführt.
- Die Paketversion wird angehoben, sodass alte Prüfcaches nicht versehentlich den korrigierten Eingang überspringen. Historische Pakete bleiben für Audits dekodierbar.

## Grenzen und Nachweis

Das 39.000-Zeichen-Limit, Stundenkapazität, Monatsbudget und Publikationsgates bleiben unverändert. Technisch tatsächlich unpassende Eingänge verbleiben weiterhin nachvollziehbar in der Queue und verbrauchen keine bezahlten Slots. Der reale 20-Quellen-Fall ist als eingefrorene Regression enthalten, einschließlich zusätzlicher Artikelpassagen und Vergleichskontext. Tests prüfen Herkunft, Daten, Nullwerte, Belegzuordnung, Unverändertheit der Eingabedaten und Rückwärtskompatibilität.

Der Regressionstest prüft zusätzlich Reserve für wachsenden Vergleichskontext, mehrere Dokumente derselben Quelle, Widersprüche, nicht fortlaufend ausgewählte Belegstellen und ungültige Referenzen. Der Monitorlauf `34017274544` war produktiv erfolgreich. Der Nachrichtenlauf `34017288428` verringerte den Rückstand von 13 auf zehn Prüfaufträge, meldete aber noch den acht Zeichen zu großen Eingang. Die abschließende Produktionsprüfung der kurzen Belegverweise steht damit gesondert an; lokale Tests allein sind kein Stabilitätsnachweis.
