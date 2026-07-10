# Handoff: Bibliotheks- und Quellen-Detailseiten

Stand: 10. Juli 2026

## Neue Grundlagenpublikationen

Veröffentlicht und als führende Referenzen registriert sind:

- Das Wirkungsökonomische Managementmodell, WÖMM 2.0, 98 Seiten.
- Das Wirkungsökonomische Methodensystem, WÖMS 2.0, 387 Seiten.

Die Fassungen 2.0 ersetzen die zuvor eingebundenen Fassungen 1.0 vollständig; es werden keine parallelen 1.0-Bibliothekseinträge oder Downloads erzeugt.

Kuratierte Metadaten stehen in `content/publications/grundlagenpublikationen.json`. Die öffentlichen PDFs liegen unter `assets/downloads/grundlagen/`.

## Einheitliche Vorschaltseiten

`scripts/library/build-full-knowledge-library.mjs` erzeugt für jeden sichtbaren Bibliothekseintrag eine Detailseite unter:

`/bibliothek/eintraege/{stabiler-slug}/`

Die Bibliothekskarten öffnen zuerst diese Seite. Erst dort führen getrennte Aktionen zur PDF-, Daten- oder Onlinefassung.

Jede Detailseite enthält, soweit vorhanden:

- Kurzbeschreibung und Abstract
- Kernaussagen und Inhaltsstruktur
- wirkungsökonomische Einordnung
- Dokumentart, Status, Version, Stand, Umfang und Herkunft
- Themen, Methoden und Wirkungsfelder
- Zitierangabe
- Schutz- und Nutzungshinweis
- verwandte Quellen

Das maschinenlesbare Register steht in `assets/data/library-source-details.json`.

## Abgrenzung zum Institut

Das Quellenarchiv des Instituts bleibt die kanonische Quelle für externe und interne Forschungsquellen. Sein öffentlicher Read-only-Spiegel erzeugt bereits eigene Detailseiten unter `/quellenarchiv/{quellen-id}/`.

Die neue Bibliothekslogik ergänzt dasselbe Vorschaltprinzip für Publikationen, Dossiers, Arbeitspapiere, Onlinefassungen, Journal- und Podcast-Einträge. Schreib-, Review- und Diskussionsfunktionen verbleiben im Institut.
