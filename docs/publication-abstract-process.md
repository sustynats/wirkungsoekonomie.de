# Publikationsprozess: Abstracts für Download- und Lesebereiche

Jede öffentliche Buch-, Paper-, Ausarbeitungs-, Dossier-, Leitlinien- oder Arbeitsfassung braucht vor dem Download eine kurze Orientierung:

- Zusammenfassung: ein bis zwei Sätze zum Inhalt und Zweck.
- Kernaussagen: zwei bis drei Punkte, die Nutzer:innen vor dem Öffnen verstehen sollen.
- Grenze der Aussage: falls relevant, klarstellen, dass es sich um Arbeits-, Modell- oder Lesefassungen handelt und nicht um amtliche Bewertungen.

## Technische Umsetzung

Die sichtbaren Abstracts werden im Build über `scripts/publications/apply-publication-abstracts.mjs` ergänzt. Der Schritt läuft automatisch in `npm run build` und `npm run portal:build`, nachdem die Portal- und Layoutgeneratoren die HTML-Seiten erzeugt haben.

Die kuratierten Abstracts liegen in `assets/data/publication-abstracts.json`. Neue zentrale Publikationen sollten dort mit `summary`, `keyPoints` und passenden `matches` eingetragen werden. Wenn ein Dokument nur in `assets/data/document-registry.json` gepflegt ist, nutzt der Build dessen `summary` als Fallback. Für noch nicht kuratierte Publikationen erzeugt der Build eine knappe automatische Orientierung aus Titel, Typ, Beschreibung und Downloadpfad.

## Qualitätssicherung

`npm run check:publication-abstracts` prüft, ob die Downloadseite, die Dokumentenseite sowie generierte Publikations- und Downloadbereiche sichtbare Abstract-Blöcke enthalten. Der Check soll vor Veröffentlichung zusammen mit Build, Linkcheck und Suchindex laufen.

Neue Publikationen sind damit nicht mehr nur eine Datei mit Link: Sie brauchen immer eine vorher sichtbare inhaltliche Einordnung.

## PDF-Regel für Word-Quellen

Für hochgeladene oder importierte Word-Dokumente gilt zusätzlich:

- DOCX/Word ist nur das interne Quellformat.
- Vor Veröffentlichung wird das Dokument im Publikationstemplate beziehungsweise als templategebundenes DOCX geprüft und als PDF exportiert.
- Öffentliche Downloads sind Onlinefassung und PDF; DOCX, Word-Dateien, Markdown-Rohdateien und editierbare Arbeitsfassungen werden öffentlich nicht angeboten.
- Der PDF-Link muss in `assets/data/document-registry.json` als `pdfUrl` hinterlegt sein.
- `publicFormats` enthält `pdf` und optional `online`, aber niemals `docx`, `doc` oder `word`.
- `allowPublicDocx` bleibt `false` und `docxUrl` bleibt `null`.

Der technische Ablauf ist:

1. Word-Dokument ins Publikationstemplate bringen oder templategebundene Word-Fassung prüfen. Für importierte DOCX-Fassungen wird dafür `python3 scripts/documents/apply-woek-publication-template.py <quelle.docx> <ziel.docx> --title "..." --subtitle "..." --stand "..."` genutzt.
2. PDF mit `npm run publish:docx-to-pdf` erzeugen beziehungsweise aktualisieren. Wenn bei einem Registry-Word-Eintrag noch keine `pdfUrl` gesetzt ist, wird ein Standardpfad unter `assets/pdf/imported/` abgeleitet. Der Konverter bricht bei neu zu rendernden DOCX-Quellen ab, wenn keine WÖk-Templatebindung erkennbar ist.
3. Registry-Eintrag auf Onlinefassung, PDF-URL, Abstract und Kernaussagen prüfen.
4. `npm run check:publication-downloads` ausführen.
5. Danach Build, Suchindex, Linkcheck und Public-Language-Check laufen lassen.

`npm run check:publication-downloads` ist ein harter Gatekeeper: Öffentliche Publikationen ohne PDF, Registry-Einträge mit DOCX-Format oder Word-Dateien in öffentlichen Downloadpfaden schlagen fehl. Dadurch soll ein Word-Upload nicht mehr live gehen können, ohne dass vorher eine einheitliche PDF-Fassung existiert.
