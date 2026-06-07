# Phase 1 UX Completion Report

Stand: 2026-06-07

## Corporate Design

Die Referenz verwendet die bestehende visuelle Sprache der Website: Navy, Ivory, Green, Gold, Source-Serif-Headlines, Inter-Fließtext, 8px-Karten, bestehende Buttons, Header und Footer. Kein fremdes Docs-Theme wurde eingeführt.

## Neue Struktur

- `/referenz/`: gestaltetes Portal mit Hero, sechs Einstiegskarten, Teilatlas, Kapitel-Navigator, Changelog und Begriffsschärfungen
- `/referenz/lesen/`: geführter Buchmodus
- `/referenz/volltext/`: lange Volltextansicht bleibt erhalten
- `/referenz/teile/`: Teilübersicht
- `/referenz/kapitel/`: Kapitelübersicht mit lokalem Filter
- `/referenz/glossar/`: Einbindung der zentralen Begriffsschicht
- `/referenz/quellen/`: Quellenkarten mit Backlinks
- `/referenz/versionen/`: Versionen und Changelog
- `/referenz/export/`: Export- und Zitierbereich

## Kapitelrouten

Alle 108 Kapitelrouten existieren. Priorisierte Kapitel wurden als Reader-Seiten mit linker Abschnittsnavigation, rechter Kontextleiste, Lesemodi, Quellenchips, VersionRibbon, Live-Reference-Addenda und Vor-/Zurück-Navigation gestaltet.

## UX-perfektionierte Kapitelcluster

- Kapitel 10: Wirkung
- Kapitel 11: Wirkungspotenzial
- Kapitel 12: Handlung, Unterlassen und Rückkopplung
- Kapitel 13: Wirkungsträger, Wirkungsempfänger, Wirkungsräume
- Kapitel 16: Das Begriffssystem der Wirkungsökonomie
- Kapitel 18: Wirkungsordnungen
- Kapitel 21: Das Wirkungsrad
- Kapitel 22: Wirkungslenkung
- Kapitel 30: Von Wirkung zu Messung
- Kapitel 31: WÖk-IDs und Indikatorenarchitektur
- Kapitel 32: Benchmarks, Skalen und Scorecards
- Kapitel 33: Reverse Merit Order
- Kapitel 34: T-SROI und systemische Transformationsmessung
- Kapitel 35: Digitale Produktpässe und Wirkungsdatenräume
- Kapitel 36: Wirkung als Rechtsprinzip
- Kapitel 37: Das Wirkungssteuergesetz WStG
- Kapitel 38: Das WUStG und die Produktwirkungssteuer
- Kapitel 39: Wirkungshaushalt und öffentliche Mittel
- Kapitel 40: Der Wirkungsrat
- Kapitel 41: Verwaltung, Rechtsschutz und Körperschaftslogik
- Kapitel 48: Produkte als Wirkungsträger
- Kapitel 49: Ehrliche Preise
- Kapitel 50: Produktscorecards
- Kapitel 51: Das Apfelbeispiel
- Kapitel 52: Konsumwirkung und Verbraucherinformation
- Kapitel 53: Markttransformation
- Kapitel 56: Arbeit, Automatisierung und Maschinenleistung
- Kapitel 57: Wirkungseinkommen
- Kapitel 58: Wirkungsrente
- Kapitel 101: Warum neue Maßstäbe Widerstand erzeugen
- Kapitel 102: Die SDGs zwischen globaler Kooperation und Verschwörungsnarrativ
- Kapitel 103: Technokratie, Überwachung und die Angst vor Steuerung
- Kapitel 104: Wirkungsmessung, Manipulation und Wirkungssimulation
- Kapitel 105: Freiheit, Markt und der Vorwurf der Planwirtschaft
- Kapitel 106: Die Fehlbarkeit der Wirkungsökonomie

## Nur technisch strukturierte Kapitel

Nicht priorisierte Kapitel behalten vollständigen Text, Kapitelroute, Abschnitts-IDs, Versionierung, Quellen und Grund-Reader-UX, sind aber fachlich noch nicht vollständig delta-reviewed.

## Arbeitspapiere

Prioritäre Arbeitspapiere erscheinen als gestaltete Webdokumente mit Dokument-Hero, Metadaten, Originaldatei, Druck-/Glossar-/Referenzaktionen und Inhaltsminiatur. Einzelne PDF-Importe enthalten weiterhin technische Seitenumbrüche und zusammengezogene Tabellen. Diese Stellen sind als Importstatus sichtbar und bleiben Nacharbeit für die redaktionelle Konsolidierung.

## Glossar-Hovers

Die bestehenden Glossar-Hovers aus `assets/js/main.js` werden auf Referenz- und Dokumentseiten geladen. Zentrale Begriffe werden clientseitig kontrolliert beim ersten Vorkommen verlinkt; mobile Nutzung öffnet ein Sheet.

## Quellenkarten

Quellen-IDs werden im Reader als `source-chip` dargestellt und auf `/referenz/quellen/` verlinkt. Das Quellenregister erzeugt Karten mit intern/extern-Markierung und Kapitel-Backlink.

## Kontextpanels

Kapitel enthalten eine rechte Kontextleiste mit Begriffen, verwandten Dokumenten, Version, Original/Export und Diskurs-Platzhalter. Auf Mobile wird sie als normale Sektion unter dem Text lesbar.

## Suche

Die bestehende Suche bleibt die einzige Suche. Neue Referenzrouten, Kapitel, Quellen, Versionen, Export und Dokumente werden in den bestehenden Index übernommen.

## Mobile UX

Die Kapitel-Navigation wird oberhalb des Texts kompakt, Tabellen bleiben horizontal scrollbar, Kontextleisten werden einspaltig, Glossar-Hovers öffnen mobil als Sheet.

## Exportoptionen

Der Exportbereich unterscheidet Originalfassungen, Web-Volltext, Glossar, Dokumentenbibliothek und Arbeitspapier-Originale. Kein dynamischer Composer in Phase 1.

## Offen

- Einige Arbeitspapier-Webfassungen brauchen redaktionelle Tabellenrekonstruktion.
- Nicht priorisierte Kapitel sind strukturell, aber noch nicht fachlich vollständig delta-reviewed.
- Der Suchindex ist groß und sollte perspektivisch gesplittet oder komprimiert werden.
