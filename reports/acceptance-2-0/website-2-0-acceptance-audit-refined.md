# Website 2.0 Abnahme-Audit - nachgeschärft

Commit: `64a00755e96cce98d0321e267c0c48da4eefb289`  
Statussummen: {'erfüllt': 26, 'offen': 2}

| Bereich | Anforderung | Status | Beleg |
|---|---|---:|---|
| Deployment | Live-Commit entspricht lokalem Hauptstand | erfüllt | HEAD=64a00755e, origin/main=64a00755e, non-audit dirty=[] |
| Routen | Alle Kernrouten aus 2.0 erreichbar | erfüllt | missing=[] |
| Öffentlicher Wirkungsraum | /oeffentlicher-wirkungsraum/ Kerninhalt vorhanden | erfüllt | missing=[] |
| Öffentlicher Wirkungsraum | /wirkungsradar/resonanz-kompass/ Kerninhalt vorhanden | erfüllt | missing=[] |
| Öffentlicher Wirkungsraum | /wirkungsradar/agenda-radar/ Kerninhalt vorhanden | erfüllt | missing=[] |
| Öffentlicher Wirkungsraum | /wirkungsradar/ursachen-navigator/ Kerninhalt vorhanden | erfüllt | missing=[] |
| Öffentlicher Wirkungsraum | /wirkungsradar/resilienz-prinzipien/ Kerninhalt vorhanden | erfüllt | missing=[] |
| Journal | Journalbeitrag „Nicht jedem Stöckchen hinterher“ vorhanden | offen |  |
| Debatten-Kompass | Live-Debattenseiten folgen Standardstruktur; Aliasse redirecten | erfüllt | content=94, redirects=6, missing=0, examples=[] |
| Debatten-Kompass | Kanonisierung/Dublettenbericht vorhanden | erfüllt | # Debatten-Kompass Kanonisierung  Stand: 2026-06-06T08:14:22.834Z  \| Kennzahl \| Wert \| \|---\|---:\| \| Radar-Seiten \| 583 \| \| Claim-Seiten \| 202 \| \| Kanonische Narrative \| 91 \| \| Dubletten / Kandidaten \| 352 \| \| Zusammengef |
| Glossar | Neue und zentrale Glossarbegriffe vorhanden | erfüllt | missing=[] |
| Glossar | Debatten-Bridge nicht auf normalen Glossar-Samples | erfüllt | bridge=[] |
| Glossar | Keine sichtbaren ASCII-Umlautverdachtsfälle in Glossar-Samples | erfüllt | ascii_suspects=[] |
| Suche | Suchindex enthält neue Glossarbegriffe | offen | index length=7162578 |
| Audio | Audio-Dateien aus Hördokumenten als MP3 öffentlich vorhanden | erfüllt | mp3=46, wav=0, missing_key=[] |
| Mein Wirkungsraum | LocalStorage Namespace und Objekte | erfüllt | missing=[] |
| Mein Wirkungsraum | Merken/Sammlung/Lernliste/Notizen/Sync-Link | erfüllt | missing=[] |
| Mein Wirkungsraum | Nur-gemerkt/Lesefortschritt | erfüllt | missing=[] |
| Mein Wirkungsraum | Dashboard-Reihenfolge/Bereiche vorhanden | erfüllt | missing=[] |
| Mein Wirkungsraum | Seitentyp-Samples laden main.js für dynamische Wirkungsraum-Funktionen | erfüllt | missing_hooks=[] |
| Downloads | Keine öffentlichen DOCX/ZIP/WAV/MD-Dateien; Excel-Ausnahmen bleiben | erfüllt | bad=[], excel=['assets/downloads/woek-register/WOeK_Master_Items_Public_Research_Register_v2.1.xlsx', 'assets/downloads/go2-produktionsreihenfolge/woek_go2_produktionsreihenfolge_detailkonzepte_v1_0.xlsx'] |
| Quellen/Links | Debattenquellen mit Belegfunktion und ohne harte Platzhalter | erfüllt | belegmarker=424, bad_mail=0, placeholders=0, bad_links=0 |
| Public Quality | Keine harten internen Arbeitsmarker in Stichprobe/Top-Level-Crawl | erfüllt | {} |
| Reports | reports/website-2.0-content-inventory.md vorhanden | erfüllt | # Website 2.0 Content Inventory  Stand: 2026-06-05T21:00:25.181Z  ## Zählung  - HTML-Seiten: 8109 - Debatten-Live-Seiten: 101 - Debatten-Detailseiten: 101 - Audio-Dateien in assets |
| Reports | reports/debattenkarten-masterintegration.md vorhanden | erfüllt | # Debattenkarten Website 2.0 Integration  Stand: 2026-06-05  ## Ergebnis  - Karten im Textmaster: 88 - Bestehende Live-Routen überschrieben/aktualisiert: 88 - Neue Live-Routen ange |
| Reports | reports/glossary-final-executive-summary.md vorhanden | erfüllt | # Executive Summary Glossar-Pack 027  - Timestamp: 2026-06-02T06:50:09.381Z - Charakter: Abschluss-, Audit- und Sicherungspack fuer Glossar-Packs 001-026 - Glossarbegriffe vorher:  |
| Reports | docs/audio-explanations-integration-audit.md vorhanden | erfüllt | # Audio-Erklärungen Integration Audit  Integriert: 36 MP3-Dateien.  ## Fehlende Audiodateien  - Erleben / Demos (https://wirkungsoekonomie.de/erleben/): keine passende WAV-Datei im |
| Reports | reports/cta-intent-audit.md vorhanden | erfüllt | # CTA-Intent-Audit  Stand: 2026-06-05  Ziel: Button-Text und Zielseite müssen dieselbe Nutzerabsicht bedienen. Dieser Audit fokussiert auf sichtbare Haupt-CTAs und den konkret geme |