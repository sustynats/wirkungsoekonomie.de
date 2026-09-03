# Sprint 9 - Performance Audit

Datum: 2026-05-22

## Ergebnis

| Bereich | Status | Befund |
|---|---|---|
| Sitemap-Größe | green | 63 gezielte öffentliche URLs, keine Audit- oder rejected-Dateien |
| Startseite | green | keine Tool-JS-Last außer allgemeinem Skript, Hero ruhig |
| Bilder | yellow | Kernvisuals haben `width`/`height` und Lazy Loading; einige Archiv-/Buchbilder sind groß |
| Rejected Visuals | green | `/assets/visuals/rejected/` per Robots ausgeschlossen |
| Archive | yellow | LinkedIn-Archiv bleibt erhalten, aber `/blog/linkedin/` ist aus Robots ausgeschlossen |
| Externe Skripte | green | keine Tracker oder API-Keys im Kernbereich gefunden |
| Fonts | yellow | Kernseiten nutzen lokale/systemische Fonts; einzelne Archivimporte enthalten externe Font-Preconnects und sind nicht in der Sitemap |

## Korrekturen

- `robots.txt` schließt `/docs/`, `/assets/visuals/rejected/`, `/assets/visuals/archive/`, `/quellen/`, `/blog/linkedin/`, `/templates/`, `/content/` und die Draft-Seite `/fuer/wirkungssteuer.html` aus.
- Sitemap entschlackt: keine LinkedIn-Archivmasse, keine PDFs, keine Quellen-Alias-Seiten, keine Drafts.

## Offene Punkte

- Archivbilder und Buch-Extraktionsbilder können später komprimiert werden. Kein Launch-Blocker, weil sie nicht die Kernpfade dominieren.
