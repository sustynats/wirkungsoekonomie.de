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
- WÖk-ID-Register: PDF-Fallback vorhanden; strukturiertes XLSX fehlt.

## Glossar

Das Glossar nutzt die zentrale Struktur `/src/data/glossary.terms.yml` und `/public/data/glossary.terms.json`. Führende Begriffe haben Kurz- und Hoverdefinitionen. Alphabetische und Hoverchecks laufen erfolgreich.

## Suche

Die bestehende Suche wurde über den bestehenden Suchindex erweitert. Referenzkapitel, Arbeitspapiere, Glossar und WÖk-Suchmetadaten sind integriert. Der aktuelle Suchcheck läuft mit 3.787 Einträgen. Es gibt keine zweite Suche.

## IDs und Manifest

Das Manifest liegt unter `/public/data/content-manifest.json`. Es enthält aktuell 25.384 Einträge mit `documentId`, `route`, `sectionId`, `paragraphId`, Versionen, Reviewstatus, Content-Hash und Originaldatei-Hinweisen, soweit vorhanden.

## Versionierung und Review

- Source-Version: `2026.0`
- Web-Version: `2026.1-import`
- Reviewstatus: `partially-reviewed`
- Originaltexte bleiben unverändert zitierfähig.
- Terminologiehinweise und Reviewlogik sind in `CONTENT_VERSIONING.md`, `TERMINOLOGY_REVIEW.md` und `IMPORT_REVIEW_NOTES.md` dokumentiert.

## Offen für Phase 2

- Kommentare
- Discord-Auth
- Server-API
- Datenbank
- Moderation
- dynamischer Dossier-Export
- vollständige redaktionelle Online-Neufassung

## Fehlende oder unvollständige Quellen

- `WOeK_Master_Items_final_v1.2.xlsx`
- aktuelle Fassung `WP_Rente`
- aktuelle Fassung `Nachhaltigkeit-Systemarchitektur`
