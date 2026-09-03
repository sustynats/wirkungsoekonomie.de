# Same-page-Navigationsaudit, 23. August 2026

## Gemeinsamer Contract

Ansichts-, Modus- und Filterwechsel, die nur den Zustand desselben Dokuments ändern, verwenden `SamePageStateLink` oder `SamePageQueryForm`. Beide setzen das von Next.js unterstützte Scroll-Verhalten explizit auf `false`.

## Gefundene Zustandswechsel

| Oberfläche | Technik | Contract |
| --- | --- | --- |
| sieben Ansichten einer Wirkungsakte | Query-Pills `?ansicht=` | Scrollposition erhalten |
| Zielgruppenmodus auf der Startseite | Query-Pills `?modus=` | Scrollposition erhalten |
| Quellenarchiv-Suche | GET-Query `?q=` | Scrollposition erhalten |
| Filter der Regierungsakten | GET-Query `?q=&typ=&thema=` | Scrollposition erhalten |
| Parlamentssuche und Länder-Zusagenfilter | lokaler React-State | keine Dokumentnavigation |

## Bewusst andere Navigationsarten

- Inhaltsverzeichnisse und Sprunglinks besitzen konkrete Abschnittsanker und sollen zum Ziel scrollen.
- Die Quellenarchiv-Paginierung öffnet eine andere Ergebnisseite und behält das normale Scrollverhalten.
- Globale Navigation, Breadcrumbs, Karten und Detail-Links bleiben normale seitenübergreifende Navigation.

Der automatisierte Gate-Scan blockiert leere `href="#"`-Ziele, neue Buttons ohne expliziten Typ und den Verlust des gemeinsamen Contracts an den geprüften Oberflächen.
