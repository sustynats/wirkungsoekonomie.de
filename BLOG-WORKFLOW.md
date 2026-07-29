# Journal-Workflow

Das Journal ist ein statischer Inhaltsbereich mit automatischer Übersichtsseite. Neue Beiträge werden als eigene HTML-Dateien im Ordner `blog/` angelegt. Die Übersichtsseite `blog.html` wird nicht mehr manuell mit Karten nachgepflegt, sondern rendert alle veröffentlichten Beiträge automatisch aus `assets/data/blog-index.json`.

## Neuen Journalartikel anlegen

1. Natalie liefert die Angaben aus dem Template unten.
2. Codex erstellt eine neue Artikelseite unter `blog/<slug>.html`.
3. Codex pflegt in der Artikelseite Veröffentlichungsdatum, Kategorie, Titel, Kurzthese, Lesedauer, Tags und optional Bild-Metadaten.
4. Falls ein Beitragsbild genutzt wird, legt Codex es unter `assets/img/blog/` ab.
5. Codex pflegt Meta Title und Meta Description in der Artikelseite.
6. Codex führt `node scripts/blog/build-blog-index.mjs` aus. Der neue Beitrag wird dadurch automatisch in `assets/data/blog-index.json` aufgenommen.
7. Codex führt `npm run check:journal` aus. Der Check stellt sicher, dass alle veröffentlichten Journalartikel im Index stehen und neueste Beiträge vorne erscheinen.
8. Codex führt `npm run build:journal-pdfs` aus. Der Schritt erzeugt nur für neue oder geänderte veröffentlichte Artikel eine druckoptimierte PDF-Lesefassung unter `assets/pdf/journal/`.
9. Codex führt `python3 tools/sync_layout.py` oder `npm run build:search` aus, damit Header/Footer und Suche aktualisiert werden.
10. Codex prüft lokal, ob die Journalübersicht, der neue Beitrag, Navigation, Footer, Suche, PDF-Download und mobile Ansicht funktionieren.

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
- `assets/data/blog-index.json` wird automatisch neu erzeugt
- `assets/search/search-index.json` wird automatisch neu erzeugt
- `assets/pdf/journal/<artikelpfad>.pdf` wird automatisch neu erzeugt oder aktualisiert
- `assets/data/journal-pdf-manifest.json` dokumentiert den jeweiligen Inhaltsstand der PDFs
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

Das Journal soll ruhig und hochwertig bleiben. Keine Stockfotos mit Businessmenschen, keine Blätterklischees, keine Hände mit Erde. Geeignet sind reduzierte Systemgrafiken, Kartenlogiken, abstrakte Architektur, ruhige Diagramme oder präzise editorial Bildmotive.

## Automatische Journalübersicht

`blog.html` besitzt den Container `data-journal-list`. `assets/js/blog-journal.js` lädt `assets/data/blog-index.json`, sortiert veröffentlichte Beiträge nach Datum absteigend und rendert daraus die Karten. Neue Beiträge stehen dadurch automatisch oben, sobald der Index neu gebaut und live gestellt wurde.

Wichtig:

- Keine neuen Journal-Karten manuell in `blog.html` einfügen.
- Keine manuelle Sortierung der Übersichtsseite.
- Für jeden neuen Artikel `node scripts/blog/build-blog-index.mjs` und `npm run check:journal` ausführen.
- Der Check muss grün sein, bevor live gestellt wird.

Veröffentlichte Journalseiten werden nicht gelöscht. Wenn ein Beitrag redaktionell konsolidiert wird, bleibt die URL erhalten oder erhält ein dokumentiertes Redirect-Mapping.

## Blog-Löschregel

Veröffentlichte Journalartikel werden nicht gelöscht.

Stattdessen gilt:

- Leitartikel sichtbar hervorheben.
- Dossierartikel thematisch bündeln.
- LinkedIn-Importe als Archiv behalten.
- Dubletten prüfen und nur mit 301-Redirect konsolidieren.
- Platzhalter aus dem Hauptfeed entfernen oder `noindex` setzen.
- Kurze tagespolitische Beiträge als Zeitdiagnose archivieren.
- Keine bestehenden URLs ohne Redirect brechen.

Vor jeder Entfernung, Ausblendung oder Konsolidierung müssen diese Dateien beziehungsweise Prüfungen vorliegen:

1. `blog-audit.md`
2. `redirect-map.md`
3. Liste betroffener interner Links
4. Empfehlung je URL: behalten / archivieren / konsolidieren / noindex / redirect

Keine technische Umsetzung von Redirects oder `noindex` erfolgt ohne vorherige redaktionelle Prüfung der betroffenen URLs und internen Links.

## LinkedIn-Archiv

Übernommene LinkedIn-Beiträge liegen unter:

```text
blog/linkedin/
```

Sie gelten als veröffentlichte Seiten und dürfen nicht ersatzlos entfernt werden. In der Blogübersicht werden sie mit `data-origin="linkedin"` gekennzeichnet. Redaktionelle Website-Beiträge erhalten `data-origin="redaktion"`.

Das Importskript `tools/import_linkedin_articles.py` erzeugt neue LinkedIn-Archivseiten und aktualisiert `blog/linkedin-artikel.html`, löscht bestehende veröffentlichte HTML-Dateien aber nicht.

Nach Importen wird `tools/sync_layout.py` ausgeführt, damit Header und Footer der neu erzeugten Seiten wieder dem zentralen Template unter `templates/` entsprechen und neue Inhalte automatisch in `assets/search/search-index.json` erscheinen.

## Suche automatisch aktualisieren

Neue veröffentlichte HTML-Seiten werden über `tools/build_search_index.py` in die Website-Suche aufgenommen. Der normale Aktualisierungsschritt ist:

```text
python3 tools/sync_layout.py
```

Dieser Schritt ruft den Suchindex-Build automatisch mit auf. Wer nur die Suche neu erzeugen will, kann alternativ direkt ausführen:

```text
python3 tools/build_search_index.py
```

Ausgenommen bleiben Weiterleitungsseiten mit `noindex` und sehr kurze technische Seiten. Neue Journalartikel, Dossiers, Methodikseiten, SDG+-Seiten und normale statische Inhaltsseiten sind danach ohne manuelle Pflege im Suchindex auffindbar.

## SEO-Daten pflegen

Jede Artikelseite braucht:

- eindeutigen `title`
- präzise `meta description`
- genau ein `h1`
- sprechenden Slug
- interne Links zu passenden Seiten wie `wirkungsoekonomie.html`, `modell.html`, `anwendungen.html`, `buch.html` oder `downloads.html`

## Template

Neuer Journalartikel:

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
