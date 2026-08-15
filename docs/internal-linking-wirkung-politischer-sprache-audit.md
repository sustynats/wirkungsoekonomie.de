# Internal Linking Audit: Wirkung politischer Sprache

Stand: 2026-05-21

## 1. Aktuelle eingehende Links

Vor der Überarbeitung war die Seite `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html` bereits erreichbar, aber nicht durchgehend als Themenpfad sichtbar:

- `index.html`: Karte "Wie politische Sprache wirkt", vorher mit Linktext "Narrativanalyse ansehen".
- `modell.html`: Inline-Link "Narrativanalyse" im Grundverständnis.
- `erleben.html`: Link im Bereich Medienwirkung und Kachel "Politik- und Sprachwirkung".
- `blog/dossiers/medien-demokratie.html`: erster Lesepfad-Eintrag "Wirkung politischer Sprache".
- `methodik/datenbasis.html`: Vertiefungslink "Narrativanalyse öffnen".
- `sdg-plus/medien-demokratie.html`: Parent-Seite existierte bereits und verlinkte im Hero sowie im Analysebereich.
- `glossar.html`: relevante Begriffe existierten, hatten aber noch keine durchgehenden Rücklinks zur Narrativanalyse.
- `assets/search/search-index.json`: Zielseite und einzelne Narrativanker waren bereits im Suchindex enthalten.
- `sitemap.xml`: Zielseite und Parent-Seite waren bereits eingetragen.

Schwer auffindbar waren vor allem die Einstiegspfade über SDG+, Startseiten-Zielgruppen, Anwendungen, Blog-Vorschau, Glossar und Footer.

## 2. Neu ergänzte Links

Neu oder gestärkt wurden:

- `sdg-plus.html`: neue SDG+-Übersichtsseite mit Karte "Medien & Demokratie" und Link zur Zielseite.
- `sdg-plus/medien-demokratie.html`: klickbare Breadcrumbs und SDG+-Subnavigation ergänzt; erste Analysekarte heißt nun "Wirkung politischer Sprache".
- `sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`: klickbare Breadcrumbs und SDG+-Subnavigation ergänzt.
- `index.html`: Linktext auf "Wirkung politischer Sprache ansehen" vereinheitlicht; zusätzlicher Link im Zielgruppenblock "Journalist:in / Creator:in"; zusätzlicher Link in der Medien-und-Demokratie-Anwendungskarte.
- `anwendungen.html`: zweiter Button "Wirkung politischer Sprache ansehen" im Bereich "Medien und Öffentlichkeit"; zusätzliche direkte Karte im Bereich "Medien und Demokratie".
- `erleben.html`: Linktext vereinheitlicht; Kachel 04 heißt nun "Wirkung politischer Sprache".
- `blog.html`: Dossier-Vorschau "Medien, Öffentlichkeit und Demokratie" führt die Zielseite jetzt als ersten Eintrag.
- `modell.html`: sichtbare Karte "Wirkung politischer Sprache" im Abschnitt der Wirkungsräume ergänzt.
- `glossar.html`: Rücklinks bei Wirkungspotenzial, Wirkungsanalyse, Wirkungsraum, Narrativ, Frame, Demokratie, Medienqualität, Diskursfähigkeit und SDG+ ergänzt.
- `templates/footer.html` sowie die wichtigsten betroffenen Seiten-Footer: Links zu SDG+, Medien & Demokratie und Wirkung politischer Sprache ergänzt.
- `assets/search/search-index.json`: neue SDG+-Übersichtsseite in die Suche aufgenommen.
- `sitemap.xml`: `/sdg-plus.html` ergänzt; Parent- und Zielseite auf `2026-05-21` aktualisiert.

## 3. Fehlende oder bewusst nicht gesetzte Links

- Die Hauptnavigation wurde nicht um "SDG+" erweitert, damit die Hauptnavigation nicht überladen wird.
- Stattdessen wurde eine sekundäre Themen-Navigation auf den SDG+-Seiten ergänzt.
- Nicht jede Unterseite der gesamten Website wurde im Footer manuell nachgezogen. Das Template ist aktualisiert; die zentralen Einstiegsseiten enthalten die neuen Footer-Links sichtbar.
- Detailseiten zu Rechtsstaat, Diskursfähigkeit, Medienqualität, Zusammenhalt und digitaler Selbstbestimmung wurden noch nicht erstellt. Sie bleiben als spätere SDG+-Vertiefungen offen.

## 4. Breadcrumb-Logik

Die Zielseite zeigt nun oben klickbar:

`SDG+ → Medien & Demokratie → Wirkung politischer Sprache`

Links:

- `SDG+`: `/sdg-plus.html`
- `Medien & Demokratie`: `/sdg-plus/medien-demokratie.html`
- `Wirkung politischer Sprache`: aktuelle Seite

Die Parent-Seite zeigt:

`SDG+ → Medien & Demokratie`

## 5. Mobile Navigation

Auf SDG+-Seiten wurde eine kleine Subnavigation ergänzt:

- Übersicht
- Medien & Demokratie
- Wirkung politischer Sprache

Sie ist als normale Linkliste im Dokumentfluss angelegt, bricht auf Mobile um und benötigt keine Hover- oder JavaScript-Logik.

## 6. Footer-Links

Ergänzt wurden im Footer beziehungsweise Footer-Template:

- SDG+
- Medien & Demokratie
- Wirkung politischer Sprache
- Methodik
- Glossar

Damit ist der Themenraum auch außerhalb der Hauptnavigation erreichbar.

## 7. SEO- und Sitemap-Prüfung

- `/sdg-plus.html` besitzt Title, Meta Description, Canonical, Open Graph und Twitter-Metadaten.
- `/sdg-plus/medien-demokratie.html` besitzt Canonical und bleibt indexierbar.
- `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html` besitzt Canonical, Meta Description, Open Graph, Twitter und JSON-LD.
- Es wurden keine `noindex`-Tags gefunden oder gesetzt.
- `sitemap.xml` enthält nun:
  - `https://wirkungsoekonomie.de/sdg-plus.html`
  - `https://wirkungsoekonomie.de/sdg-plus/medien-demokratie.html`
  - `https://wirkungsoekonomie.de/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`
- Interne Links sind normale `<a href="">`-Links und nicht nur JavaScript-Interaktionen.

## Ergebnis

Der sichtbare Pfad ist nun:

`Wirkungsökonomie → SDG+ → Medien & Demokratie → Wirkung politischer Sprache`

Die Zielseite ist dadurch nicht mehr nur über direkte Einzelverweise erreichbar, sondern als zentraler SDG+-Baustein auffindbar.
