# Launch-Checkliste

Stand: 2026-05-31

Diese QA vergleicht das Stage-0-Inventar mit dem aktuellen Stand und nimmt keine inhaltlichen Großänderungen vor.

## Erledigt

- Stage-0-Inventar gelesen: 1195 inventarisierte Routen.
- Alte Routen gegen aktuellen Dateistand geprüft: 1195/1195 erreichbar, weiterleitend oder archiviert.
- Redirect-/Alias-Kandidaten geprüft: 65 ursprünglich als `redirect-needed` markierte Einträge, aktuelle Redirect-/Canonical-Matrix separat in `docs/redirect-map-final.md`.
- Downloads geprüft: 1014 inventarisierte Download-/Dokumentpfade, 1003 aktuelle Download-/Dokumentdateien.
- Demos geprüft: 18 Demo-/Erleben-/Scanner-Seiten.
- Werkzeugseiten geprüft: 62 direkte Werkzeugseiten unter `/werkzeuge/` ohne Dossier-/Detailkonzept-Unterseiten.
- Placeholder-Status geprüft: 5 Seiten mit `In Vorbereitung` oder `Arbeitsfassung`.
- Interne Links per Projekt-Linkchecker vorgesehen; siehe finale Verifikation im Stage-14-Abschluss.

## Inventar-Abgleich

| Status | Anzahl |
| --- | --- |
| archiv | 6 |
| exists | 1145 |
| redirect/alias | 44 |

### Fehlende alte Routen

Keine fehlenden inventarisierten Routen gefunden.

## Downloads

- Inventarisierte Download-/Dokumentpfade: 1014
- Aktuelle Download-/Dokumentdateien: 1003
- Seit Stage 0 zusätzlich vorhanden: 0

### Fehlende inventarisierte Downloads

Keine fehlenden inventarisierten Downloads gefunden.

## Demos und Tools

### Demo-Schutzlinien

Alle geprüften Demo-/Scanner-/Erleben-Seiten enthalten Schutzlinien oder ProtectionNotice-Hinweise.

### Werkzeug-Schutzlinien

| Datei | Titel |
| --- | --- |
| werkzeuge/benchmarks-archetypen/index.html | Benchmarks &amp; Archetypen \| Wirkungsökonomie |
| werkzeuge/datenqualitaet-assurance/index.html | Datenqualität &amp; Assurance \| Wirkungsökonomie |
| werkzeuge/datenraum-reifegradcheck/index.html | Datenraum-Reifegradcheck \| Wirkungsökonomie |
| werkzeuge/digital-souveraenitaetscheck/index.html | Digital-Souveränitätscheck \| Wirkungsökonomie |
| werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/index.html | Digitale Produktpässe und Wirkungsdatenräume \| Wirkungsökonomie |
| werkzeuge/forschungs-wirkungscheck/index.html | Forschungs-Wirkungscheck \| Wirkungsökonomie |
| werkzeuge/impact-controlling/index.html | Impact Controlling \| Wirkungsökonomie |
| werkzeuge/impact-controlling/t-sroi/index.html | T-SROI \| Wirkungsökonomie |
| werkzeuge/innovations-wirkungsportfolio/index.html | Innovations-Wirkungsportfolio \| Wirkungsökonomie |
| werkzeuge/ki-wirkungsrisiko-check/index.html | KI-Wirkungsrisiko-Check \| Wirkungsökonomie |
| werkzeuge/kii-statt-kpi/index.html | KII statt KPI \| Wirkungsökonomie |
| werkzeuge/netto-wirkungs-index/index.html | Netto-Wirkungs-Index \| Wirkungsökonomie |
| werkzeuge/open-science-und-replikationscheck/index.html | Open-Science- und Replikationscheck \| Wirkungsökonomie |
| werkzeuge/politische-wirkungspruefung/index.html | Politische Wirkungsprüfung \| Wirkungsökonomie |
| werkzeuge/reverse-merit-order/index.html | Reverse Merit Order \| Wirkungsökonomie |
| werkzeuge/scorecards/index.html | Scorecards \| Wirkungsökonomie |
| werkzeuge/t-sroi/index.html | T-SROI \| Wirkungsökonomie |
| werkzeuge/unternehmens-wirkungscheck/index.html | Unternehmens-Wirkungscheck \| Wirkungsökonomie |
| werkzeuge/wirkungseinkommensteuer/index.html | Wirkungseinkommensteuer \| Werkzeug der Wirkungsökonomie |
| werkzeuge/wirkungshaushalt/index.html | Wirkungshaushalt \| Wirkungsökonomie |
| werkzeuge/wirkungsportfolio/index.html | Wirkungsportfolio \| Werkzeug der Wirkungsökonomie |
| werkzeuge/wirkungsrat/index.html | Wirkungsrat \| Wirkungsökonomie |
| werkzeuge/wirkungssteuergesetz/index.html | Wirkungssteuergesetz WStG \| Wirkungsökonomie |
| werkzeuge/wissensrat-integritaetsregister/index.html | Wissensrat-/Integritätsregister \| Wirkungsökonomie |
| werkzeuge/woek-ids/index.html | WÖk-IDs \| Wirkungsökonomie |

## Placeholder-Status

Alle geprüften Placeholder-Seiten mit `In Vorbereitung` oder `Arbeitsfassung` enthalten StatusBadge-Markup.

## Offen

- Suffixed Duplicate-Dateien wie `index 2.html` und `* 2.docx/pdf` bleiben erreichbar, sollten aber nach Launch fachlich bereinigt oder gezielt archiviert werden.
- Werkzeugseiten sind teils Methodikseiten, teils Rechner-/Check-Seiten. Fehlende Schutzlinien auf direkten Werkzeugseiten sind Launch-Risiko, wenn die Seite als Entscheidungstool verstanden werden könnte.
- Die Download-Prüfung nutzt zusätzlich `docs/no-delete-list.md`, weil `docs/site-inventory.md` nur einen Teil der Download-Dateien als Routen führt.

## Risiko

- Größtes strukturelles Risiko: Duplicate-/Archivdateien mit Leerzeichen im Dateinamen können Nutzer:innen und Suchmaschinen irritieren.
- Mittleres Risiko: Einige Methodikseiten enthalten nicht durchgehend denselben sichtbaren Schutzlinienblock wie Demos.
- Niedriges Risiko: Redirect-Stubs und alte Aliasrouten bleiben vorhanden; Linkchecker sollte 0 interne 404 melden.

## Empfehlung

- Launch nur mit erfolgreichem Build und Linkcheck freigeben.
- Nach Launch eine eigene Cleanup-Stufe für Duplicate-Dateien und Archivstrategie planen, ohne Dateien zu löschen.
- Für direkte Werkzeugseiten einen einheitlichen Methodik-/Schutzlinien-Footer vorbereiten, aber nicht mehr als Großänderung in dieser Launch-QA erzwingen.
