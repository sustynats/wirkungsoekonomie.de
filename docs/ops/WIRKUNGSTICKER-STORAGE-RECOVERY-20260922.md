# Veröffentlichungsstau vom 21./22. September 2026

## Ursache und Korrektur

GitHub verweigerte den atomaren Push: `data/news/newsroom.json` erreichte
103,10 MiB und überschritt das Dateilimit von 100 MiB. Dadurch gelangten
fertige Prüfungen und neu erzeugte Lage-Seiten nicht auf main oder die Website.
Der Abbruch war weder ein Budgetlimit noch ein Browser-Cache-Problem.

`scripts/news/newsroom-store.mjs` liest weiterhin alte vollständige JSON-Dateien.
Beim Schreiben entsteht jetzt ein kleines Manifest am bisherigen Pfad und
verlustfreie JSON-Teile unter `data/news/newsroom.json.parts/`. Kein Teil darf
8 MiB überschreiten. Datensätze, Array-Reihenfolge und sämtliche Felder bleiben
erhalten. Jeder Teil wird über SHA-256, Bytezahl und Datensatzanzahl geprüft;
fehlende oder beschädigte Teile führen zum Fehler, niemals zu einem leeren
Ersatzbestand. Neue Teile werden zuerst, das Manifest atomar zuletzt geschrieben.
Nur nicht mehr referenzierte generierte Teile werden anschließend entfernt;
Git-Historie und Sicherungsartefakte bewahren die alten Fassungen.

Import, redaktionelle Recherche und Ereignisaudit verwenden denselben Leser.
Das Fehlerartefakt enthält Manifest **und** Teile. Die übrigen großen Laufdateien
werden ohne Einrückungsleerzeichen geschrieben (unveränderter JSON-Datenvertrag).
Ein vorgelagerter Push-Check weist geänderte Dateien über 95 MiB mit einem
eindeutigen Fehler zurück, bevor ein nicht übertragbarer Commit entsteht.

Der letzte übertragbare Bestand enthielt 17.007 Quellenstände, 18.999 Ereignisse,
17.007 Quellen-Ereignis-Verknüpfungen und 20.000 Entscheidungsvermerke.
104.619.306 Bytes eingerücktes JSON entsprechen 75.739.943 Bytes ohne
Einrückung - knapp 29 MB bestanden allein aus Formatierung. Die Aufteilung
begrenzt die **einzelne Datei**, ohne die Recherchehistorie zu löschen.

## Wiederherstellung

Die `news-recovery-*`-Artefakte sind die Sicherungen bereits bezahlter Arbeit.
Rohantworten sind keine Veröffentlichungsfreigabe. Übernommen werden nur ganze,
vom bisherigen Ablauf freigegebene Story-Datensätze; Quellen, Analyse, Version
und Wirkungspotenzial bleiben zusammen. Neuere redaktionelle Arbeit darf nicht
mit alten Snapshots überschrieben werden. Kosten werden je Lauf-ID dedupliziert,
fehlgeschlagene/abgelehnte Versuche werden nicht als neue Veröffentlichungen
ausgegeben. Nach Übernahme sind Build, bestehende Qualitätsprüfung und die
Live-Prüfung verpflichtend. Es wird kein Modell zur Wiederherstellung aufgerufen.

`recover-approved-snapshots.mjs` übernimmt geprüfte vollständige Fassungen und
prüft sie mit dem aktuellen Qualitätsgate erneut. Ein unveränderter Altstand
aus einem späteren Runner darf eine zwischenzeitlich gerettete Fassung nicht
zurücksetzen. Neuere redaktionelle Änderungen bleiben geschützt; manuelle
Buchformate sind ausgeschlossen. Die Nutzungsbuchungen werden über Lauf-ID
**und** Startzeit dedupliziert. Vorbereitete, noch nicht ausgelieferte Meldungen
werden dort nicht rückwirkend als bereits veröffentlicht gezählt.

Die nachgeholten Lagen erhalten einen sichtbaren Verspätungshinweis. Er bleibt
auch dann erhalten, wenn ein normaler Folgelauf dieselbe Ausgabe neu berechnet.
Die bestehenden Nachrichtenfenster 06:00, 12:00 und 18:00 Uhr sowie Modelle,
Ausgabenlimits und Freigaberegeln werden nicht verändert.

## Rückfall

Manifest und zugehörige Teile sind eine Einheit. Bei einem Rollback zuerst einen
vollständigen alten JSON-Bestand aus der Sicherung wiederherstellen, dann den
alten Leser. Niemals nur den Leser zurückrollen. Keine Löschung von Artikeln,
Quellen, Nutzungsbuchungen oder manuellen Freigaben als Größenkorrektur.
