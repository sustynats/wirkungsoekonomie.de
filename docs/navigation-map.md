# Navigation Map

Stand: 2026-05-31. Stage: `site-restructure-stage-1-navigation`.

Diese Datei dokumentiert die sichtbare Hauptnavigation, bestehende Routen und Alias-/Redirect-Entscheidungen. Es wurden keine bestehenden Inhalte geloescht.

## Neue Hauptnavigation

| Sichtbarer Punkt | Kanonische Route | Erhaltene/mitgematchte Routen |
| --- | --- | --- |
| Start | `/index.html` | `/` |
| Verstehen | `/verstehen.html` | `/wirkungsoekonomie.html`, `/wirkungsoekonomie/`, `/verstehen/`, `/modell.html`, `/modell/`, `/kompass.html`, `/begriffe/`, `/glossar.html` |
| Wirkungsfelder | `/wirkungsfelder/` | `/anwendungen.html` |
| Methoden & Werkzeuge | `/werkzeuge/` | `/tools/`, `/methodik/`, `/workflow.html`, `/scanner.html`, `/anwendungen/scanner.html`, `/scorecard-dashboard.html` |
| Erleben | `/erleben/` | `/erleben.html`, `/ausprobieren/` |
| Akademie | `/akademie.html` | `/akademie/` |
| Bibliothek | `/downloads.html` | `/downloads/`, `/dokumente/`, `/referenz/`, `/buch.html`, `/buch/`, `/evidenz/`, `/quellen/`, `/fachbibliothek/`, `/werkstatt/` |
| Mitmachen | `/mitmachen.html` | `/mitmachen/`, `/fuer/` |
| Suche | `/suche.html` | - |

## Alte Routen Und Alias-Regeln

| Alte Route / Bezeichnung | Neue sichtbare Einordnung | Umsetzung |
| --- | --- | --- |
| `Ausprobieren` | `Erleben` | Sichtbarer Menuepunkt umbenannt; Erlebnisroute bleibt erreichbar. |
| `/erleben.html` | `/erleben/` | Alte URL bleibt als bestehende Seite erhalten; Canonical-Metadaten zeigen auf `/erleben/`. |
| `/erleben/` | `Erleben` | Kanonische Route; Inhalt von `erleben.html` wurde als Aliasfassung mit angepassten relativen Pfaden verfuegbar gemacht. |
| `/ausprobieren/` | `/erleben/` | Neuer nicht-indexierbarer Redirect/Alias auf `/erleben/`. |
| `Für wen?` | `Mitmachen` | Zielgruppenroute `/fuer/` bleibt erhalten und wird unter `Mitmachen` mitgematcht. |
| Werkzeuge in `Ausprobieren` | `Methoden & Werkzeuge` | Werkzeug- und Methodik-Routen werden im neuen Hauptpunkt gebuendelt. |

## Zentrale Quellen

- `assets/data/navigation.json`: kanonische Navigationsdaten fuer Header und Footer.
- `templates/header.html`: Header-Template.
- `templates/footer.html`: Footer-Template.
- `tools/sync_layout.py`: verteilt Header/Footer auf statische HTML-Seiten; Backup- und Dependency-Ordner sind vom Sync ausgenommen.
- `assets/js/main.js`: Laufzeit-Fallback fuer die Hauptnavigation und Active-State-Logik.

## Nicht geloescht

- Bestehende Zielgruppenroute `/fuer/` bleibt erhalten.
- Bestehende Erlebnisroute `/erleben.html` bleibt erhalten.
- Bestehende Werkzeug-, Methoden-, Bibliotheks-, Download- und Wirkungsfeldrouten bleiben erhalten.
- Keine Downloads, Assets, Demos oder Dossierseiten wurden entfernt.

## Pruefhinweise

- Nach Aenderungen wurde die Navigation ueber `python3 tools/sync_layout.py` synchronisiert.
- Der Build muss nach dieser Stage laufen, weil `npm run build` den Layout-Sync ebenfalls ausfuehrt.
- Linkpruefung sollte mindestens die Kernrouten `/`, `/verstehen.html`, `/wirkungsfelder/`, `/werkzeuge/`, `/erleben/`, `/erleben.html`, `/ausprobieren/`, `/akademie.html`, `/downloads.html`, `/mitmachen.html` und `/suche.html` abdecken.
