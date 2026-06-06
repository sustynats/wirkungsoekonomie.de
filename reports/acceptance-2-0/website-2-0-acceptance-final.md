# Website 2.0 Abnahmeaudit - finaler Prüfstand

Stand: 2026-06-06, lokales Public-Artefakt nach `npm run build` und `npm run build:artifact`.

## Zusammenfassung

- erfüllt: 44

## Prüfpunkte

| Bereich | Anforderung | Status | Nachweis | Notiz |
|---|---|---:|---|---|
| Routen/Inhalte | Startseite 2.0 | erfüllt | `index.html` | Öffentlicher Wirkungsraum; Debatten-Kompass; Resonanz-Kompass; Agenda-Radar; Ursachen-Navigator; Resilienz-Prinzipien |
| Routen/Inhalte | Öffentlicher Wirkungsraum | erfüllt | `oeffentlicher-wirkungsraum/index.html` | Debatten-Kompass; Resonanz-Kompass; Agenda-Radar; Ursachen-Navigator; Resilienz-Prinzipien |
| Routen/Inhalte | Debatten-Kompass Start | erfüllt | `wirkungsradar/index.html` | Welche Aussage willst du beantworten; Debatten-Kompass |
| Routen/Inhalte | Live-Karten | erfüllt | `wirkungsradar/live/index.html` | Welche Aussage willst du beantworten; Karten |
| Routen/Inhalte | Mein Wirkungsraum | erfüllt | `mein-wirkungsraum/index.html` | Mein Wirkungsraum; Datenspeicherung |
| Routen/Inhalte | Updates | erfüllt | `updates/index.html` | Neue Inhalte; Journal |
| Routen/Inhalte | Tool-Landschaft | erfüllt | `werkzeuge/index.html` | Werkzeuge; Methoden |
| Routen/Inhalte | Journalbeitrag öffentlicher Wirkungsraum | erfüllt | `blog/oeffentlicher-wirkungsraum-debatten-resonanz-resilienz.html` | Nicht jedem Stöckchen hinterher; Öffentlicher Wirkungsraum |
| Debatten-Kompass | Pflichtstruktur: Behauptung, Sofortantwort 10/30/2, Folgencheck, Wirkpfad, kritische Fragen, Faktenlage, Quellen | erfüllt | `94 echte Live-Seiten geprüft` | 0 mit fehlenden Markern |
| Kanonisierung | Eine Aussage = eine kanonische Seite / Redirects/Synonyme | erfüllt | `reports/wirkungsradar-canonicalization-report.json` | canonical=None, redirects=None, synonyms=None |
| Glossar | Begriff thomas-piketty vorhanden und ohne Debatten-Bridge | erfüllt | `begriffe/thomas-piketty/index.html` |  |
| Glossar | Begriff kapitalakkumulation vorhanden und ohne Debatten-Bridge | erfüllt | `begriffe/kapitalakkumulation/index.html` |  |
| Glossar | Begriff staat vorhanden und ohne Debatten-Bridge | erfüllt | `begriffe/staat/index.html` |  |
| Glossar | Begriff gesetz vorhanden und ohne Debatten-Bridge | erfüllt | `begriffe/gesetz/index.html` |  |
| Mein Wirkungsraum | Namespace | erfüllt | `assets/js/main.js` |  |
| Mein Wirkungsraum | Merkliste | erfüllt | `assets/js/main.js` |  |
| Mein Wirkungsraum | Lesefortschritt | erfüllt | `assets/js/main.js` |  |
| Mein Wirkungsraum | Sammlungen | erfüllt | `assets/js/main.js` |  |
| Mein Wirkungsraum | Lernliste | erfüllt | `assets/js/main.js` |  |
| Mein Wirkungsraum | Notizen | erfüllt | `assets/js/main.js` |  |
| Mein Wirkungsraum | Besuchshistorie | erfüllt | `assets/js/main.js` |  |
| Mein Wirkungsraum | Einstellungen | erfüllt | `assets/js/main.js` |  |
| Mein Wirkungsraum | Privater Wiederherstellungslink | erfüllt | `assets/js/main.js` |  |
| Mein Wirkungsraum | Export/Import | erfüllt | `assets/js/main.js` |  |
| Suche | Public Search JSON valide | erfüllt | `7481 Einträge` |  |
| Suche | Suchindex enthält Thomas Piketty | erfüllt | `assets/search/search-index.json` |  |
| Suche | Suchindex enthält Kapitalakkumulation | erfüllt | `assets/search/search-index.json` |  |
| Suche | Suchindex enthält Nicht jedem Stöckchen hinterher | erfüllt | `assets/search/search-index.json` |  |
| Suche | Suchindex enthält Gender-Ideologie | erfüllt | `assets/search/search-index.json` |  |
| Audio | Audio erleben-demos.mp3 vorhanden | erfüllt | `assets/audio/explanations/` |  |
| Audio | Audio wirkungsrat.mp3 vorhanden | erfüllt | `assets/audio/explanations/` |  |
| Audio | Audio rente-soziale-sicherung.mp3 vorhanden | erfüllt | `assets/audio/explanations/` |  |
| Audio | Öffentlich keine WAV-Dateien | erfüllt | `mp3=46, wav=0` |  |
| Public Artifact | Keine DOCX/ZIP/WAV/MD im Public Artifact | erfüllt | `0 Treffer` |  |
| Public Artifact | Excel-Dateien bleiben erlaubt/verlinkbar | erfüllt | `2 XLSX` | assets/downloads/woek-register/WOeK_Master_Items_Public_Research_Register_v2.1.xlsx, assets/downloads/go2-produktionsreihenfolge/woek_go2_produktionsreihenfolge_detailkonzepte_v1_0.xlsx |
| Layout/Navigation | Header/Footer auf begriffe/gesetz/index.html | erfüllt | `begriffe/gesetz/index.html` |  |
| Layout/Navigation | Header/Footer auf wirkungsradar/index.html | erfüllt | `wirkungsradar/index.html` |  |
| Layout/Navigation | Header/Footer auf oeffentlicher-wirkungsraum/index.html | erfüllt | `oeffentlicher-wirkungsraum/index.html` |  |
| 2.0 Reports | reports/website-2.0-content-inventory.md | erfüllt | `reports/website-2.0-content-inventory.md` |  |
| 2.0 Reports | reports/debate-compass-template-quality-report.md | erfüllt | `reports/debate-compass-template-quality-report.md` |  |
| 2.0 Reports | reports/glossary-final-executive-summary.md | erfüllt | `reports/glossary-final-executive-summary.md` |  |
| 2.0 Reports | reports/cta-intent-audit.md | erfüllt | `reports/cta-intent-audit.md` |  |
| Build Guard | Public JSON validation im Artefakt-Build | erfüllt | `scripts/quality/build-public-artifact.mjs` |  |
| Build Guard | JSON wird nicht mehr als Freitext normalisiert | erfüllt | `scripts/quality/build-public-artifact.mjs` |  |
