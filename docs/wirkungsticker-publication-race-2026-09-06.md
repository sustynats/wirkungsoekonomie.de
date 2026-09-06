# Automatische Veröffentlichung bei parallelen Releases

Der Nachrichtenlauf `34018195681` führte Recherche, Analyse, Build und Validierung durch, scheiterte aber beim Übertragen des Ergebnis-Commits. Während des Uploads war der Hauptzweig erneut weitergelaufen. Der folgende Rebase enthielt zwei lokale Commits: den Nachrichtenlauf und eine zuvor erzeugte Aktualisierung der Ansichten. Die bisherige Wiederherstellung behandelte nur den ersten Konflikt; beim zweiten stoppte sie.

Der bestehende Publisher verarbeitet jetzt nacheinander bis zu 20 Konfliktstopps desselben Rebase. Automatisch ersetzbar bleiben ausschließlich ausdrücklich freigegebene, aus kanonischen Daten neu erzeugbare Ansichten und Berichte. Disjunkte Story-Änderungen werden weiterhin nur als vollständige Datensätze zusammengeführt. Überlappende Änderungen an Artikeln, Quellen oder Code brechen die gesamte Zusammenführung ab; es gibt weder Force-Push noch stillschweigende Auswahl eines neueren Stands.

Wird ein reiner Ansichts-Commit durch die Konfliktauflösung leer, wird ausschließlich dieser nun leere Commit übersprungen. Nach vollständiger Zusammenführung werden sämtliche betroffenen Publikationsdaten aus dem erhaltenen Bestand neu gebaut und validiert. Erst dann erfolgt der erneute Push. Die drei äußeren Push-Versuche bleiben begrenzt.

Regressionen verwenden echte temporäre Git-Repositories mit zwei konkurrierenden Ansichts-Commits und prüfen den Erhalt neuer Nachrichten sowie der neuen Renderer-Version. Weitere Tests sichern spätere kanonische Konflikte und die feste Abbruchgrenze ab. Die Korrektur benötigt keine zusätzliche Recherche, Bildgenerierung oder KI-Analyse.
