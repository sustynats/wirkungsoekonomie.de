# Website 2.0 Gap-Audit

Stand: 2026-06-06. Automatischer Abgleich aus 2.0-Briefings gegen lokalen Live-Deploy-Stand im Repo.

| Cluster | Anforderung | Status | Nachweis | Maßnahme |
|---|---|---|---|---|
| Routen | Öffentlicher Wirkungsraum | OK | oeffentlicher-wirkungsraum/index.html |  |
| Routen | Resonanz-Kompass | OK | wirkungsradar/resonanz-kompass/index.html |  |
| Routen | Agenda-Radar | OK | wirkungsradar/agenda-radar/index.html |  |
| Routen | Ursachen-Navigator | OK | wirkungsradar/ursachen-navigator/index.html |  |
| Routen | Resilienz-Prinzipien | OK | wirkungsradar/resilienz-prinzipien/index.html |  |
| Routen | Updates | OK | updates/index.html |  |
| Routen | Mein Wirkungsraum | OK | mein-wirkungsraum/index.html |  |
| Routen | Thomas Piketty | OK | begriffe/thomas-piketty/index.html |  |
| Routen | Kapitalakkumulation | OK | begriffe/kapitalakkumulation/index.html |  |
| Suche | Bibliothekssuche | OK | bibliothek/index.html: data-library-search |  |
| Suche | Veröffentlichungen/Downloads Suche | OK | downloads.html: data-document-search |  |
| Suche | Online-Dokumente Suche | OK | dokumente/index.html: data-online-document-search |  |
| Suche | Journal Suche | OK | blog.html: data-blog-search |  |
| Suche | Updates Suche | FEHLT | updates/index.html: data-updates-search | Suchfeld und Filterlogik ergänzen |
| Bibliothek/Bridge | Kein Wirkungsradar-Dossier-Bridge auf bibliothek/index.html | OK | bad block not present |  |
| Bibliothek/Bridge | Kein Wirkungsradar-Dossier-Bridge auf downloads.html | OK | bad block not present |  |
| Bibliothek/Bridge | Kein Wirkungsradar-Dossier-Bridge auf dokumente/index.html | OK | bad block not present |  |
| Bibliothek/Bridge | Kein Wirkungsradar-Dossier-Bridge auf blog.html | OK | bad block not present |  |
| Debatten-Kompass Template | Pflichtreihenfolge wirkungsradar/live/migration-kostet-nur/index.html | OK | [('inhaltsverzeichnis', 4219), ('behauptung', 5036), ('sofortantwort', 5970), ('folgencheck', 11896), ('wirkpfad', 13664), ('kritische-fragen', 14577), ('faktenlage', 15179), ('quellen', 17061)] |  |
| Debatten-Kompass Template | Pflichtreihenfolge wirkungsradar/live/radwege-in-peru/index.html | OK | [('inhaltsverzeichnis', 4263), ('behauptung', 5080), ('sofortantwort', 6081), ('folgencheck', 11539), ('wirkpfad', 13215), ('kritische-fragen', 14158), ('faktenlage', 14760), ('quellen', 17275)] |  |
| Debatten-Kompass Template | Pflichtreihenfolge wirkungsradar/live/15-minuten-stadt-oder-klimakaefig/index.html | OK | [('inhaltsverzeichnis', 4121), ('behauptung', 4938), ('sofortantwort', 5835), ('folgencheck', 11311), ('wirkpfad', 13001), ('kritische-fragen', 13857), ('faktenlage', 14459), ('quellen', 15690)] |  |
| Dubletten/Kanonisierung | SDGs Weltregierung | PROBLEM | [{"slug": "sdgs-weltregierung", "title": "SDGs sind Weltregierung?", "canonical": "https://wirkungsoekonomie.de/wirkungsradar/live/sdgs-weltregierung/", "redirect": false}, {"slug": "sdgs-sind-weltregierung", "title": "SDGs / Agenda 2030 sind Weltregierung?", "canonical": "https://wirkungsoekonomie.de/wirkungsradar/live/sdgs-sind-weltregierung/", "redirect": false}] | Kanonische Zielseite festlegen; Aliasse als Redirect/Canonical umstellen; Kartenlisten nur kanonisch |
| Dubletten/Kanonisierung | Altparteien/Diktatur | PROBLEM | [{"slug": "altparteien", "title": "Altparteien?", "canonical": "https://wirkungsoekonomie.de/wirkungsradar/live/altparteien/", "redirect": false}, {"slug": "altparteiendiktatur", "title": "Diktatur der Altparteien?", "canonical": "https://wirkungsoekonomie.de/wirkungsradar/live/altparteiendiktatur/", "redirect": false}, {"slug": "diktatur-der-altparteien", "title": "Diktatur der Altparteien?", "canonical": "https://wirkungsoekonomie.de/wirkungsradar/live/diktatur-der-altparteien/", "redirect": f | Kanonische Zielseite festlegen; Aliasse als Redirect/Canonical umstellen; Kartenlisten nur kanonisch |
| Dubletten/Kanonisierung | Remigration | PROBLEM | [{"slug": "remigration", "title": "Remigration / Remigrationslotsen?", "canonical": "https://wirkungsoekonomie.de/wirkungsradar/live/remigration/", "redirect": false}, {"slug": "remigration-remigrationslotsen", "title": "Remigration / Remigrationslotsen?", "canonical": "https://wirkungsoekonomie.de/wirkungsradar/live/remigration-remigrationslotsen/", "redirect": false}] | Kanonische Zielseite festlegen; Aliasse als Redirect/Canonical umstellen; Kartenlisten nur kanonisch |
| Dubletten/Kanonisierung | Leistungsträger ausgepresst | PROBLEM | [{"slug": "leistungstraeger-werden-ausgepresst", "title": "Werden Leistungsträger ausgepresst?", "canonical": "https://wirkungsoekonomie.de/wirkungsradar/live/leistungstraeger-werden-ausgepresst/", "redirect": false}, {"slug": "leistungstraeger-ausgepresst", "title": "Werden Leistungsträger ausgepresst?", "canonical": "https://wirkungsoekonomie.de/wirkungsradar/live/leistungstraeger-ausgepresst/", "redirect": false}] | Kanonische Zielseite festlegen; Aliasse als Redirect/Canonical umstellen; Kartenlisten nur kanonisch |
| Tool-Landschaft | Keine öffentlichen Platzhalter-Toolseiten | PROBLEM | 5 Treffer: werkzeuge/digitale-produktpaesse/index.html, werkzeuge/wirkungsaudit/index.html, werkzeuge/wirkungsdatenraeume/index.html, werkzeuge/wirkungsregister/index.html, werkzeuge/oeffentliche-beschaffung/index.html | Entweder fachlich ausbauen oder als nicht-prominent/Coming-soon sauber kennzeichnen/aus Listen nehmen |
| Kontakt/Einreichen | Keine falschen/unklaren Mailstrecken in öffentlichen Workflows | UNKLAR | 1263 HTML-Treffer, u.a. index.html, wirkungsoekonomie.html, buch.html, impressum.html, ueber.html, mitmachen.html, datenschutz.html, woek-id-register/index.html | Klären, ob impact@ existiert; falls nicht: alle CTAs auf Akademie-/Formularstrecken umstellen |
| Download-Härtung | Keine öffentlichen doc/docx/md/rtf Links in HTML | PROBLEM | 1 HTML-Treffer: begriffe/sexarbeit/index.html | Links auf PDF oder Online-Publikationsseite umstellen |
| Glossar | Glossarseiten vorhanden inkl. Piketty/Kapitalakkumulation | OK | 1727 Begriffsrouten; Piketty/Kapitalakkumulation existieren |  |
| Audio | Audio-Dateien als mp3 vorhanden | UNKLAR | 7 mp3 in assets/audio | Zuordnung gegen Sprechertextliste stichprobenartig/live prüfen |
