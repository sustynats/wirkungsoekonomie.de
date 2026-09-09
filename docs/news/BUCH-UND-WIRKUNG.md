# Buch & Wirkung: verbindlicher Formatstandard

Manuelle, redaktionell freigegebene Buchbesprechungen von Natalie Weber
(Spitzname Nats). Kein Nachrichten-Ingest und kein automatisch erzeugter Kommentar.

## Inhalt und Veröffentlichung

- Kanonische Originalmanuskripte: content/news/manual/*.md.
- editions.json enthält Freigabestatus, Datum, SHA-256 des unveränderten
  Manuskripts, Verlagscover samt Herkunft/Prüfsumme und verwandte Beiträge.
- Immer format=book_and_impact, manual_only=true,
  editorial_mode=manual_manuscript. Fehlt die Autorisierung oder stimmt eine
  Prüfsumme nicht, bricht der Build ab.
- Keine automatische Erzeugung, Ergänzung, Zusammenfassung, Sprachkorrektur,
  Aktualisierung oder nachträgliche LLM-Bearbeitung. Dies gilt auch für Audio.
- Automatische News-/Analyse-Jobs lesen und schreiben nur ihre bestehenden
  News-Stores; diese manuelle Sammlung ist ausschließlich eine Lesequelle
  für den gemeinsamen Seiten-Build. Modellgrenzen weisen das Format zurück.
- Neue Rezension: offizielles Cover + Buchdaten + freigegebener vollständiger
  Text. Kein neuer Renderer, kein individuelles Portrait erforderlich.
- Inhaltliche Änderungen brauchen einen neuen freigegebenen Text, neue
  Prüfsumme und einen transparenten Versionsverlauf. Historie nicht still ändern.

## Bildregel (letzte Freigabe vom 09.09.2026)

Das feste Dropbox-Portrait zeigt Nats mit ihrem EIGENEN Buch
„Die neue Ordnung des Wohlstands“. Dies ist beabsichtigt. Es bleibt unverändert
und wird für alle Beiträge der Rubrik verwendet.

Asset: assets/img/people/natalie-weber-buch-und-wirkung.jpeg.
Dropbox-Quelle: /WOEK/WIRKUNGSTICKER-BUCH-UND-WIRKUNG/6787AC7F-7327-4AB1-8482-ABFA3F481B51_1_201_a.jpeg.
Die feste Prüfsumme wird im manuellen Adapter validiert.

Das rezensierte Buch erscheint als SEPARATES offizielles Verlagscover im
Hero-/Buchbereich und auf der Übersicht. Portrait und Cover bleiben getrennte
Assets. Keine KI-Bilder, keine Montage, kein Buchtausch in Nats' Händen,
kein neues Portrait pro Rezension. Die Dateien werden unverändert ausgeliefert.
Das bestehende Meinung-&-Analyse-Portrait und historische Beiträge bleiben unverändert.

## Gemeinsame Architektur und Prüfungen

Der manuelle Adapter liefert Daten an den vorhandenen Meinung-&-Analyse-
Renderer: gemeinsame Navigation, Autorinnenbereich, Stil, Merken/Teilen,
Leseweg, RSS/Atom/JSON, Suche, Sitemap und OpenGraph.
Die Rubrik ist über /wirkungsticker/?thema=book_and_impact filterbar.
„Grundlagenbuch“ ist eine optionale redaktionelle Kennzeichnung im Manuskript.
Aus der Buchrezension werden keine erfundenen News-Fakten, MPD-Scores oder
automatische Wirkungsbewertungen abgeleitet.

Vor Veröffentlichung: news:test, news:build, news:validate, Typecheck und
build:artifact. check-manual-pages prüft auch im finalen Deploy-Artefakt jeden
Originaltextblock in Reihenfolge und mit unveränderter Zeichensetzung.
Redaktionell freigegebene Manuskripte sind von globalen Textnormalisierungen
ausgenommen; Sicherheits- und Datenschutzprüfungen bleiben aktiv.

Desktop und Mobile prüfen: komplettes Portrait, separate unverzerrte Cover,
scrollbare Tabellen, Quellen, Rubrikfilter, interne Links und Share-Metadaten.
Veröffentlichung über den vorhandenen GitHub-Pages-Releaseweg. Keine neue
Hostingplattform und keine kostenpflichtigen Dienste für dieses Format.
