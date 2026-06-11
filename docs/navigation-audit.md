# Navigation-Audit

Stand: 22. Mai 2026

## Zentrale Navigation-Config

Die zentrale Navigation liegt in `assets/data/navigation.json`.

Sie definiert drei Bereiche:

- `header`: reduzierte Hauptnavigation
- `more`: Sekundärnavigation im Mehr-Menü
- `footer`: vollständige Footer-Navigation

Die Templates `templates/header.html` und `templates/footer.html` enthalten keine einzeln gepflegten Linklisten mehr, sondern Platzhalter, die durch `tools/sync_layout.py` aus der Navigation-Config gerendert werden.

## Seiten, die sie verwenden

`tools/sync_layout.py` synchronisiert alle HTML-Seiten mit vorhandenem `site-header` und `footer`, inklusive Unterordner-Indexseiten. Beim letzten Lauf wurden 172 HTML-Dateien aktualisiert, darunter die geforderten Seiten:

- `/`
- `/wirkungsoekonomie.html`
- `/modell.html`
- `/ordnung/`
- `/fuer/`
- `/fuer/unternehmen.html`
- `/fuer/politik.html`
- `/fuer/buergerinnen.html`
- `/fuer/mieter.html`
- `/fuer/rente.html`
- `/fuer/wirkungseinkommen.html`
- `/fuer/journalismus.html`
- `/fuer/investoren.html`
- `/fuer/kommunen.html`
- `/fuer/akademie.html`
- `/kompass.html`
- `/scanner.html`
- `/anwendungen.html`
- `/erleben.html`
- `/blog.html`
- `/akademie.html`
- `/downloads.html`
- `/quellen/`
- `/glossar.html`
- `/methodik/daten-standards-regularien.html`
- `/sdg-plus.html`
- `/suche.html`

## Abweichende Navigation vorher

Vorher gab es mehrere abweichende Zustände:

- `templates/header.html` führte `Quellen` früh in der Hauptnavigation.
- Viele Seiten hatten eine verkürzte Navigation ohne `Scanner`.
- Footer-Links waren nicht überall gleich.
- Unterordner-`index.html`-Seiten wurden durch den bisherigen Sync ausgeschlossen.
- Zielgruppen-Seiten hatten teils manuell eingebettete, minifizierte Header/Footer.

## Gültige Header-Reihenfolge

Start, Kompass, Scanner, Für wen, Anwendungen, Akademie, Suche, Mehr.

Im Mehr-Menü:

Wirkungsökonomie, Modell, Ordnung, Erleben, Wissen, Methodik, SDG+, Medien & Demokratie, Blog, Buch, Downloads, Mitmachen, Glossar, Evidenz.

## Gültige Footer-Reihenfolge

WÖk-Kompass, Start, Wirkungsökonomie, Modell, Kompass, Scanner, Für wen, Anwendungen, Ordnung, Erleben, Akademie, Blog, Buch, Downloads, Mitmachen, Glossar, SDG+, Methodik, Medien & Demokratie, Wirkung politischer Sprache, Suche, Natalie Weber, Über die Wirkungsökonomie, Evidenz, Impressum, Datenschutz.

## Evidenz-Platzierung

`Quellen` wurde aus der frühen Hauptnavigation entfernt und als öffentlicher Einstieg durch `Evidenz` ersetzt. Der Link bleibt sichtbar:

- am Ende des Mehr-Menüs als `Evidenz`
- im hinteren Bereich des Footers als `Evidenz`
- in Evidenz-/Stand-Panels der Zielgruppen-Seiten
- auf `/evidenz/` als Evidenz-Hub
- unter `/quellen/` als tieferes Quellenregister

## Active State

Active State wird über `data-nav-match` in den gerenderten Links und `assets/js/main.js` gesteuert.

Regeln:

- `/fuer/` und alle `/fuer/*.html` markieren `Für wen`.
- `/ordnung/` markiert `Ordnung`.
- `/evidenz/` und `/quellen/` markieren `Evidenz` im Mehr-Menü und Footer.
- `/kompass.html` markiert `Kompass`.

## Mobile

Mobile nutzt dieselbe Linkquelle wie Desktop. Die Navigation bleibt als aufklappbares Menü vertikal lesbar, `Mehr` ist ein eigener aufklappbarer Bereich, `Kompass`, `Scanner` und `Suche` bleiben früh sichtbar, `Evidenz` steht unten bei Vertiefung.

Browser-Check lokal auf `http://127.0.0.1:8765/`: Mobile-Menü öffnet per Toggle, die ersten sichtbaren Links sind Start, Kompass, Scanner, Für wen, Anwendungen, Akademie; `Evidenz` ist der letzte Eintrag im Mehr-Menü.

## Hart codierte Reste

Die Linklisten in Header/Footer werden zentral gerendert. Restliche Navigationslinks innerhalb von Seiteninhalten, Breadcrumbs, Teasern oder Kontextboxen sind bewusst inhaltliche Links und keine Header-/Footer-Navigation.
