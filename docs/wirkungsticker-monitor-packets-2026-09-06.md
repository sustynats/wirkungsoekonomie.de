# Betriebsmonitor und wachsende Quellenpakete – 6. September 2026

## Bestätigte Ursachen

- Der Betriebsmonitor importiert seit der Stückkosten-Erweiterung `scripts/news/operating-cost.mjs`. Der selektive GitHub-Checkout enthielt diese Datei nicht. Daher brachen die Monitor-Tests vor der eigentlichen Überwachung ab, obwohl die Nachrichtenläufe weiterliefen.
- Die Wahlakte `wt-06476c6e980f5f47` wuchs auf 20 Quellen. Im produktiven Vorabtest benötigte selbst die begrenzte Belegauswahl 19.193 Datenzeichen bei 17.621 verfügbaren Zeichen. Es erfolgte kein kostenpflichtiger Aufruf für diesen unpassenden Eingang; der Auftrag blieb gespeichert.

## Korrekturen

- Der Monitor lädt seine neue Abhängigkeit mit. Ein Regressionstest verfolgt sämtliche lokalen Modulimporte von Monitor und Tests und gleicht sie mit der Checkout-Liste ab. Auch die Workflowdatei selbst wird für diesen Test geladen.
- Dichte Quellenpakete verwenden rohe Tabellenzellen statt zusätzlicher Einzelelement-Arrays. Eine separate Liste unterscheidet explizite Nullwerte von fehlenden Eigenschaften.
- Belegstellen liegen in einer gemeinsamen Tabelle mit ausdrücklichem Quellenindex. Unveränderliche Beleg-IDs, Wortlaut, Reihenfolge und Zuordnung bleiben erhalten.
- Vergleichshistorie wird ebenso verlustfrei tabellarisch transportiert. Wiederholte Herkunftsangaben, Daten und gleichlautende Hinweise zur begrenzten Belegauswahl werden nur einmal übermittelt; Abweichungen bleiben ausdrücklich bestehen.
- Quellen, Claims, Herkunft, Widersprüche und bestehende Artikel werden nicht gelöscht. Die bereits vorhandene Auswahl unveränderter Textstellen bleibt transparent begrenzt; keine zusätzlichen Artikelabrufe oder KI-Dienste wurden eingeführt.
- Die Paketversion wird angehoben, sodass alte Prüfcaches nicht versehentlich den korrigierten Eingang überspringen. Historische Pakete bleiben für Audits dekodierbar.

## Grenzen und Nachweis

Das 39.000-Zeichen-Limit, Stundenkapazität, Monatsbudget und Publikationsgates bleiben unverändert. Technisch tatsächlich unpassende Eingänge verbleiben weiterhin nachvollziehbar in der Queue und verbrauchen keine bezahlten Slots. Der reale 20-Quellen-Fall ist als eingefrorene Regression enthalten, einschließlich zusätzlicher Artikelpassagen und Vergleichskontext. Tests prüfen Herkunft, Daten, Nullwerte, Belegzuordnung, Unverändertheit der Eingabedaten und Rückwärtskompatibilität.

Erfolgreich lokal: 359 Nachrichtentests, 20 Monitortests, Nachrichten-Build, Publikationsvalidierung, strenges Source-Integrity-Audit und Hosting-Kostengate. Der Produktionsnachweis erfolgt zusätzlich über einen erfolgreichen Monitorlauf und den nächsten normalen Nachrichtenlauf; lokale Tests allein sind kein Stabilitätsnachweis.
