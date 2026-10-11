# Wirkungsökonomie

Dies ist das statische Website-Repository für `wirkungsoekonomie.de`.

## Was ist die Website?

Die Website ist das digitale Portal der Wirkungsökonomie. Sie erklärt das Modell, verweist auf das Grundlagenwerk, ordnet Anwendungen, Blogbeiträge, Akademie-Inhalte und Downloads.

## Was ist Wirkungsökonomie?

Die Wirkungsökonomie ist ein eigenständiges Gesellschafts- und Wirtschaftsmodell. Sie macht Wirkung auf Mensch, Planet und Demokratie zur zentralen Steuerungsgröße. Die zentrale Formel lautet: Wirkung statt Kapital - für Mensch, Planet und Demokratie.

## Wer ist Natalie Weber?

Natalie Weber ist Begründerin der Wirkungsökonomie und Autorin des Grundlagenwerks „Die neue Ordnung des Wohlstands“.

## Welche Rolle hat das Buch?

„Die neue Ordnung des Wohlstands. Begründung und Grundlagen der Wirkungsökonomie“ ist das Grundlagenwerk der Wirkungsökonomie. Es ist frei als PDF verfügbar und liegt unter `assets/pdf/die-neue-ordnung-des-wohlstands.pdf`.

## Nutzungshinweis

Das Werk und das Modell dürfen gelesen, geteilt, zitiert und diskutiert werden. Die Autorinnenschaft und der Ursprung des Modells bleiben bei Natalie Weber. Bei Zitaten oder Weiterverwendung soll die Quelle sichtbar genannt werden.

## Inhalte veröffentlichen

Nach neuen oder geänderten HTML-Inhalten wird ausgeführt:

```text
python3 tools/sync_layout.py
```

Der Schritt synchronisiert Header/Footer und baut den Suchindex automatisch neu. Dadurch werden neue veröffentlichte Seiten, Blogartikel und ältere Beiträge ohne manuelle Indexpflege über `suche.html` auffindbar.

## Online-Styleguide

Der verbindliche Website-Styleguide liegt unter `styleguide.html`. Neue Seiten und Komponenten verwenden zuerst die zentralen Design-Tokens und Komponentenregeln aus `assets/css/style.css`: Typografie, Abstände, Buttons, Karten, Tabellen, Bildsprache und Responsive-Verhalten werden dort gepflegt.

## Kontakt

impact@wirkungsoekonomie.org

## Gemeinsame Header-Quelle (P0.1)

`assets/data/navigation.json` enthält die heutigen deutschen Menüeinträge. `scripts/lib/site-shell.mjs`
exportiert die gemeinsame Funktion `renderSiteHeader(base, locale)`. Die
Python-Generatoren verwenden den Adapter `scripts/lib/site_shell.py`.
`templates/header.html` ist ein deterministischer Build-Cache;
`node scripts/site/render-site-shell.mjs --templates` erzeugt ihn.
Änderungen am Menü erfolgen ausschließlich in den Navigationsdaten.

Die Normalisierung erfasst auch neu erzeugte öffentliche HTML-Dateien. Sie
läuft nach dem vollständigen Build einschließlich Postbuild sowie in den
Teil-Pipelines `news:build` und `build:parlament-info`. Die lokale Ticker-Leiste
bleibt unter dem globalen Header erhalten. Die CSS-Regel für das noch
ausgeblendete Desktop-Menü bleibt bis zur Entscheidung über Phase 2 bestehen.
