# Navigationsbericht: Messung und Freigabestatus

Der Bericht misst das fertig gebaute öffentliche Artefakt `_site`, nicht den
Quellbaum. Zuerst `npm run build`, dann `npm run build:artifact`, anschließend:

```sh
python3 -m unittest discover -s tests/navigation -v
node scripts/quality/check-navigation-discovery.mjs --report
```

Die bisherige Discovery-Prüfung bleibt vollständig aktiv. Die zusätzliche
Messung schreibt JSON und Markdown nach `reports/navigation/`. Jeder PR-Lauf
zeigt das Markdown in seiner Zusammenfassung und speichert beide Dateien als
Artefakt. Während Phase 0 und 1 sind Abweichungen Warnungen. Nach Abschluss von
Phase 1 wird ein vollständig geprüfter neuer Referenzbericht gespeichert und
`--gate` in der Pipeline aktiviert; das blockiert sinkende Abdeckung und neue
Navigationsfehler. Der Drei-Klick-Anteil ist weiterhin ein Ziel für Phase 2.

„Ohne Linkpfad“ bedeutet: Von der Startseite existiert über die tatsächlich
vorhandenen HTML-Verweise kein Weg zu dieser URL. Es bedeutet keinen HTTP-404.
Verlinkungen in JavaScript-Daten werden nicht als HTML-Verweise gezählt.
Noindex-Seiten, Weiterleitungshüllen und interne Pfade sind aus der aktiven
Grundgesamtheit ausgeschlossen. Footer werden auch auf historischen
Inhaltsseiten geprüft. Sitemap-Indizes werden rekursiv gelesen; für die Suche
zählt der ausgelieferte Browserindex, nicht ein größeres Maschinenexportformat.

Die Rohdaten enthalten öffentliche Routen, keine lokalen Dateipfade. Die Liste
der Verweise auf Weiterleitungen ist im Bericht auf 100 Beispiele begrenzt;
die Kennzahl zählt sämtliche Verweise. Header- und Footer-Hashes vereinheitlichen
relative Pfade und ignorieren lediglich die aktuelle Seitenmarkierung.
