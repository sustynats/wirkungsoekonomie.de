# Site Inventory

Stand: 2026-05-19

## Projektform

Die Website ist eine statische HTML/CSS/JS-Site. Es gibt kein CMS, keine Build-Pipeline und keine zentrale Template-Engine. Navigation, Footer, Blogkarten und Artikel-Layouts sind in HTML-Dateien gepflegt und werden nur teilweise durch `assets/js/main.js` verbessert.

## Wichtige Dateien

- `index.html` und weitere Top-Level-Seiten: Startseite, Modell, Anwendungen, Erleben, Blog, Akademie, Buch, Downloads, Glossar, Über, Mitmachen, Impressum, Datenschutz.
- `blog.html`: zentrale Blogübersicht mit statischen Karten, Themenfeldern, Schlagworten und JavaScript-Filtern.
- `blog/*.html`: redaktionelle Einzelartikel und die LinkedIn-Archivseite.
- `blog/linkedin/*.html`: importierte LinkedIn-Artikel als veröffentlichte Einzel-URLs.
- `assets/css/style.css`: zentrales Styling für Layout, Navigation, Karten, Blog, Artikel, Erleben-Module und Footer.
- `assets/js/main.js`: Navigation, Analytics-Zustimmung und Blogfilter.
- `assets/js/erleben.js`: interaktive Erleben-Module, Scorecards, Medien- und Risikosimulationen.
- `assets/js/scorecard-dashboard.js`: Scorecard-Dashboard.
- `assets/data/scorecard-examples.json`: zentrale Beispieldaten für Scorecards.
- `tools/import_linkedin_articles.py`: Import/Render-Skript für LinkedIn-Artikel und Archiv.
- `404.html` und Slug-Verzeichnisse mit `index.html`: Redirect-Fallbacks für alte URLs.
- `sitemap.xml`, `robots.txt`, `llms.txt`, `humans.txt`: Indexierungs- und Metadaten-Dateien.

## Assets

- Bilder: `assets/img/**` mit Branding, Bloggrafiken, LinkedIn-Bildern und visuellen Assets für interaktive Seiten.
- PDFs: `assets/pdf/**` mit herunterladbaren Materialien.
- Favicon und Signet: `assets/img/brand/**`.

## Blog-Inventar

- Insgesamt veröffentlichte Blog-HTML-Dateien: 103.
- LinkedIn-Importe unter `blog/linkedin/`: 93.
- Redaktionelle Blogseiten außerhalb des LinkedIn-Ordners bleiben als eigene URLs bestehen.
- LinkedIn-Importe werden in der Blogübersicht als Archivbeiträge geführt und zusätzlich unter `blog/linkedin-artikel.html` gebündelt.

## Strukturelle Beobachtungen

- Navigation und Footer sind HTML-dupliziert, werden aber über `templates/header.html`, `templates/footer.html` und `tools/sync_layout.py` synchronisiert. Eine spätere echte Vereinheitlichung könnte über Includes oder einen Static-Site-Generator erfolgen.
- Aktuell verbessert `assets/js/main.js` die Navigation clientseitig: aktive Navigationspunkte und `aria-current` werden aus der aktuellen URL abgeleitet.
- Die Blogübersicht ist statisch, nutzt aber `data-category`, `data-tags` und `data-origin` als leichte Datenstruktur für Filter.
- Das LinkedIn-Importskript darf keine veröffentlichten Artikel löschen. Neue Importe sollen ergänzen oder überschreiben, aber bestehende URLs nicht ersatzlos entfernen.

## URL-Regel

Keine veröffentlichte Blogseite wird gelöscht. Wenn Inhalte später zusammengeführt werden, braucht es vorab:

1. Bestands-URL.
2. Ziel-URL.
3. Begründung.
4. Redirect-Datei oder 404-Alias.
5. Update in `sitemap.xml`.

## Aktuell betroffene URLs

Diese Optimierung ändert keine bestehenden Artikel-URLs. Betroffen sind nur Darstellung und Metadaten von:

- `https://wirkungsoekonomie.de/blog.html`
- `https://wirkungsoekonomie.de/assets/css/style.css`
- `https://wirkungsoekonomie.de/assets/js/main.js`
- `tools/import_linkedin_articles.py` für künftige Importe.
