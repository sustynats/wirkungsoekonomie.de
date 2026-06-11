# Phase 1 Completion Report

Stand: 2026-05-23

## Umgesetzt

- `/referenz/` ist jetzt ein Portal mit Einstieg, Teilstruktur und Kapitelliste.
- `/referenz/volltext/` erhält die lange Volltextfassung.
- Kapitel 1-108 haben eigene Routen unter `/referenz/kapitel-.../`.
- Teil I-XVIII haben eigene Routen unter `/referenz/teil-.../`.
- Abschnitts- und Absatz-IDs wurden für Hauptwerk und Arbeitspapiere vorbereitet.
- `public/data/content-manifest.json` wurde neu erzeugt.
- Dokumentenbibliothek enthält 20 Webfassungen plus Originaldateien.
- Glossar-Datenstruktur, Hoverdefinitionen und alphabetische Prüfung bleiben zentral.
- Bestehende Suche wurde erweitert; keine zweite Suche wurde eingeführt.
- Standard-Downloads/Originaldateien bleiben verlinkt.

## Seiten

- Hauptwerk-Portal: `/referenz/`
- Volltext: `/referenz/volltext/`
- Kapitelrouten: `/referenz/kapitel-001-.../` bis `/referenz/kapitel-108-.../`
- Teilrouten: `/referenz/teil-01-.../` bis `/referenz/teil-18-.../`
- Dokumente: `/dokumente/`
- Begriffe: `/begriffe/` und `/glossar.html`
- Downloads/Export: `/downloads.html`, `/export/`

## Dokumente als Webfassung

20 Dokumente sind unter `/dokumente/` vorhanden. Originaldateien liegen unter `/public/downloads/originals/` oder beim Hauptwerk unter `/assets/pdf/`.

## Abbildungen und Tabellen

- Hauptwerk: 70 Abbildungen geprüft, eingebunden und mit kapitelbezogenen Alt-Texten/Captions versehen.
- Arbeitspapiere: technische PDF-Webfassungen vorhanden; komplexe Tabellen bleiben als Reviewpunkt dokumentiert.
- WÖk-ID-Register: strukturiertes XLSX wurde importiert; 621 Registerzeilen sind als HTML-Tabelle, JSON-Daten und Suchinhalt verfügbar. Der PDF-Fallback bleibt verlinkt.

## Glossar

Das Glossar nutzt die zentrale Struktur `/src/data/glossary.terms.yml` und `/public/data/glossary.terms.json`. Führende Begriffe haben Kurz- und Hoverdefinitionen. Alphabetische und Hoverchecks laufen erfolgreich.

## Suche

Die bestehende Suche wurde über den bestehenden Suchindex erweitert. Referenzkapitel, Arbeitspapiere, Glossar, WÖk-ID-Register und WÖk-Suchmetadaten sind integriert. Der aktuelle Suchcheck läuft mit 3.567 Einträgen. Es gibt keine zweite Suche.

## IDs und Manifest

Das Manifest liegt unter `/public/data/content-manifest.json`. Es enthält aktuell 24.330 Einträge mit `documentId`, `route`, `sectionId`, `paragraphId`, Versionen, Reviewstatus, Content-Hash und Originaldatei-Hinweisen, soweit vorhanden.

## Versionierung und Review

- Source-Version: `2026.0`
- Import-Version: `2026.1-import`
- Live-Reference-Version: `2026.2-live-reference`
- Reviewstatus: `delta-reviewed` / `partially-delta-reviewed`
- Originaltexte bleiben unverändert zitierfähig.
- Terminologiehinweise und Reviewlogik sind in `CONTENT_VERSIONING.md`, `TERMINOLOGY_REVIEW.md` und `IMPORT_REVIEW_NOTES.md` dokumentiert.
- Live-Reference-Hinweise, Delta-Review, Changelog und Source-Hierarchy sind in `PHASE_1_LIVE_REFERENCE_COMPLETION.md`, `DELTA_REVIEW_REPORT.md`, `LOGIC_CONSISTENCY_REPORT.md`, `DRAFTING_ARTIFACTS_REPORT.md`, `SOURCE_LOGIC_REVIEW.md` und `LIVE_REFERENCE_SOURCE_HIERARCHY.md` dokumentiert.

## Offen für Phase 2

- Kommentare
- Discord-Auth
- Server-API
- Datenbank
- Moderation
- dynamischer Dossier-Export
- vollständige redaktionelle Online-Neufassung

## Fehlende oder unvollständige Quellen

- aktuelle Fassung `WP_Rente`
- aktuelle Fassung `Nachhaltigkeit-Systemarchitektur`
