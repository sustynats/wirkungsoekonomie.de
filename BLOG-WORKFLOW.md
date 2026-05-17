# Blog-Workflow

Der Blog ist ein statischer Bereich der Website. Neue Beiträge werden als eigene HTML-Dateien im Ordner `blog/` angelegt und anschließend auf `blog.html` als Blogkarte ergänzt.

## Neuen Blogartikel anlegen

1. Natalie liefert die Angaben aus dem Template unten.
2. Codex erstellt eine neue Artikelseite unter `blog/<slug>.html`.
3. Codex ergänzt den Beitrag auf `blog.html` mit Kategorie, Titel, Kurzthese, Datum, Lesedauer und Link.
4. Falls ein Beitragsbild genutzt wird, legt Codex es unter `assets/img/blog/` ab.
5. Codex pflegt Meta Title und Meta Description in der Artikelseite.
6. Codex prüft lokal, ob die Blogübersicht, der neue Beitrag, Navigation, Footer und mobile Ansicht funktionieren.

## Was Natalie liefern muss

- Titel
- gewünschte Kategorie
- Kurzthese
- Haupttext oder Rohfassung
- gewünschtes Datum oder Freigabedatum
- gewünschte Lesedauer, falls abweichend
- Quellen oder Referenzen
- interne Links, die gesetzt werden sollen
- Bildwunsch oder vorhandenes Beitragsbild

## Welche Dateien Codex aktualisiert

- `blog/<slug>.html`
- `blog.html`
- optional `assets/img/blog/<dateiname>`
- optional weitere interne Seiten, wenn ein Beitrag dort verlinkt werden soll

## Bilder ablegen

Beitragsbilder liegen unter:

```text
assets/img/blog/
```

Empfohlene Benennung:

```text
YYYY-MM-DD-slug.jpg
YYYY-MM-DD-slug.png
```

Der Blog soll ruhig und hochwertig bleiben. Keine Stockfotos mit Businessmenschen, keine Blätterklischees, keine Hände mit Erde. Geeignet sind reduzierte Systemgrafiken, Kartenlogiken, abstrakte Architektur, ruhige Diagramme oder präzise editorial Bildmotive.

## blog.html aktualisieren

Für jeden neuen Beitrag wird eine neue Blogkarte ergänzt mit:

- Kategorie
- Titel
- Kurzthese
- Datum
- Lesedauer
- Link zur Artikelseite
- optional Beitragsbild

Neue Beiträge stehen oben. Ältere Beiträge wandern nach unten oder später in ein Archiv.

## SEO-Daten pflegen

Jede Artikelseite braucht:

- eindeutigen `title`
- präzise `meta description`
- genau ein `h1`
- sprechenden Slug
- interne Links zu passenden Seiten wie `wirkungsoekonomie.html`, `modell.html`, `anwendungen.html`, `buch.html` oder `downloads.html`

## Template

Neuer Blogartikel:

- Titel:
- Slug:
- Datum:
- Kategorie:
- Kurzthese:
- Lesedauer:
- Meta Title:
- Meta Description:
- Beitragsbild:
- Haupttext:
- Quellen:
- Interne Links:
