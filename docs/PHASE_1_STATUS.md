# Phase 1 Status

Stand: 2026-05-23

## Aktueller Importstand

Phase 1 basiert auf dem bestehenden technischen Erstimport und wurde nicht neu begonnen. Die vorhandenen importierten Seiten, Originaldateien, Downloads, Suche und Glossarstruktur bleiben erhalten.

## Hauptwerk

- Dokument: `Natalie-Weber_Die neue Ordnung des Wohlstands.docx`
- Dokument-ID: `woek-main-2026`
- Source-Version: `2026.0`
- Web-Version: `2026.1-import`
- Reviewstatus: `partially-reviewed`
- Portal: `/referenz/`
- Volltextansicht: `/referenz/volltext/`
- Kapitelrouten: 108
- Teilrouten: 18
- Absätze: 10.119
- Überschriften: 1.108
- Tabellen: 30
- Abbildungen: 70

Hinweis: Die DOCX enthält zwei Sprünge in der Teilüberschriftenstruktur. Für Teil XV und Teil XVII wurden deshalb strukturelle Platzhalterseiten mit dem Hinweis „im Quelldokument ohne eigene Teilüberschrift“ erzeugt. Es wurden keine Teil-Titel erfunden.

## Importierte Dokumente

Die Dokumentenbibliothek enthält 20 Webfassungen unter `/dokumente/`, jeweils mit Originaldatei-Link:

- WStG Oktober 2025
- Grundlagenpapier Wirkungsökonomie WÖk
- WÖk Master Items final v1.2
- Technische Leitlinien WUStG Vollversion Extended v2
- Beispiel Apfel Wirkungssteuer Bonusregel
- Wirkungsrat Konzept
- Whitepaper T-SROI
- Wirkungsökonomie in der Lieferkette
- Systemmodell der Wirkungsökonomie
- WP Produkte
- WP Einkommen
- WP Wohnungsmarkt
- Wenn Maschinen arbeiten
- Leitbild für Mensch, Planet und Demokratie
- Minifest Wirkungsökonomie
- WÖk-Manifest
- WÖK-Partei
- NATS WÖk allgemein
- Beispiel Konzern
- FAZ-Beitrag

## Originaldateien

Die Originaldateien liegen unter `/public/downloads/originals/`. Zusätzlich bleibt das Hauptwerk-PDF unter `/assets/pdf/die-neue-ordnung-des-wohlstands.pdf` verlinkt.

## Suche

Die bestehende Website-Suche bleibt die einzige Suche. Der bestehende statische Suchindex wurde um Referenz-, Kapitel-, Dokument-, Glossar- und WÖk-Inhalte erweitert. Es wurde keine zweite Such-UI und kein neuer Suchdienst eingeführt.

## Glossar

Das Glossar wird über `/src/data/glossary.terms.yml` und `/public/data/glossary.terms.json` als zentrale Begriffsschicht geführt. Es enthält führende Begriffe, Hoverdefinitionen, Synonyme, verwandte Begriffe und Reviewstatus. Die alphabetische Prüfung und Hover-Abdeckung laufen über die vorhandenen Glossarchecks.

## Offene Phase-1-Restpunkte

- WÖk-ID-Register: Das XLSX `WOeK_Master_Items_final_v1.2.xlsx` liegt nicht im Repository. Bis zur Lieferung bleibt das PDF als Fallback verlinkt.
- WP_Rente und Nachhaltigkeit-Systemarchitektur liegen nicht als aktuelle Originaldateien im Repository vor.
- Arbeitspapier-Tabellen aus PDFs sind als technischer Import sichtbar, aber nicht vollständig fachlich rekonstruiert.
- Terminologie-Review ist als Erstprüfung/Markierung angelegt; keine vollständige redaktionelle Neuautorisierung.

## Nicht Teil von Phase 1

- Kommentare
- Discord-Login
- Backend
- Datenbank
- Moderation
- dynamischer Dossier-Export
- zweite Suche oder neuer Suchdienst
