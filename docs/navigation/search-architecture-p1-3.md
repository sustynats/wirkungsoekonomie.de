# Sucharchitektur P1.3

Stand: 13. Oktober 2026

## Entscheidung

Die bestehende WÖk-Suche wird als aufgeteilter, versionsgebundener Index weitergeführt. Pagefind wird in P1.3 nicht eingeführt.

Diese Lösung verwendet die kanonische öffentliche Routenliste direkt und kann deshalb dieselben 17.717 Seiten wie die Sitemaps abdecken. Sie erhält außerdem die vorhandenen deutschen Suchbegriffe und Beziehungen aus `search-dictionary.json` und `search-associations.json`. Die benötigten Facetten `raum`, `typ`, `thema` und `rolle` werden im Index mitgeführt. Ein zusätzlicher Suchgenerator oder eine neue Laufzeitabhängigkeit ist nicht nötig.

## Auslieferung und Last

Der bisherige öffentliche Fallback `search-index.json` umfasste 81.109.636 Bytes und wird nicht mehr ausgeliefert. An seine Stelle treten inhaltsadressierte Dateien:

- Kernindex: 7.118 Seiten, 9.798.276 Bytes als JSON und 1.306.518 Bytes komprimiert
- Bibliotheksindex: 9.113 Seiten, 12.390.575 Bytes als JSON und 1.176.235 Bytes komprimiert
- Quellenarchivindex: 1.486 Seiten, 2.110.058 Bytes als JSON und 230.154 Bytes komprimiert
- Vorschlagsindex: 469 Einträge, 179.821 Bytes als JSON und 38.582 Bytes komprimiert

Der kleine Vorschlagsindex wird unabhängig geladen. Die Volltextsuche lädt den Kern und die beiden gesonderten Archivteile bei Bedarf. Alle Dateien sind über einen kleinen Manifestdatensatz versionsgebunden; bei fehlender Gzip-Unterstützung kann der Browser dieselbe Teilmenge als JSON laden. Es gibt keinen Rückfall auf die frühere 81-MB-Datei.

Die vollständige komprimierte Suchmenge beträgt 2.712.907 Bytes. Das öffentliche Gesamtartefakt sank dadurch auf 831,1 MB.

## Öffentliche Schnittstelle für die Suchoberfläche

`assets/js/search-api.js` exportiert die beiden vereinbarten asynchronen Funktionen:

- `suggest(prefix, { limit })` liefert `[{ title, url, type, raum, snippet }]`.
- `search(query, { raum, typ, thema, rolle, page })` liefert `{ total, results, groups, facets }`.

Die Ergebnisfacetten werden aus den tatsächlichen Treffern gebildet und enthalten ausschließlich Werte mit mindestens einem Treffer. Eine Seite umfasst 20 Ergebnisse. Deutsche Umlaute, `ß`, hinterlegte Schreibvarianten, Begriffe und Beziehungen fließen in die Suche ein.

## Build-Prüfungen

Der Build prüft die exakte Übereinstimmung zwischen Routenliste und Suche, eindeutige URLs, den Ausschluss von Weiterleitungen, gültige Taxonomiefelder, dekodierte Titel, die niedrige Ticker-Priorität, alle kuratierten Ziele und die Größenbegrenzung des Vorschlagsindex. Auch bestehende Instituts- und Methodenprüfungen lesen die aufgeteilten Dateien.

Ergebnis des vollständigen Artefaktlaufs: 17.717 von 17.717 Routen im Suchindex, 0 Weiterleitungen, 0 gebrochene Artefaktlinks und 0 öffentliche redaktionelle Resthinweise.
