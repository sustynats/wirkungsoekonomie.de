# WÖk-Veröffentlichungsprozess für DOCX/PDF

Öffentliche Konzeptpapiere, Dossiers und Arbeitspapiere werden nicht direkt aus
einem Roh-DOCX veröffentlicht. Der Standardprozess ist:

1. Quell-DOCX redaktionell prüfen.
2. WÖk-Dossier/Konzept-Template anwenden.
3. Standardisiertes DOCX als öffentliche Arbeits- oder Diskussionsfassung ablegen.
4. PDF aus dem standardisierten DOCX erzeugen.
5. DOCX/PDF rendern und stichprobenartig visuell prüfen.
6. Bibliothek, Glossar, Toolseiten und Querverlinkungen aktualisieren.
7. Build-, Sprach- und Linkchecks ausführen.

Das Template liegt lokal im WÖk-Dossier-Template-Paket:

```text
/Users/hagen/Documents/Rechner-Cleanup/Sortiert_2026-05-25/01_WOeK/01_Kerndokumente-Konzepte/Pakete-Ordner/Downloads/WOeK_Dossier_Template_Paket/WOeK_Dossier_Konzept_Template.dotx
```

Der wiederholbare Repo-Schritt ist:

```bash
python3 scripts/publications/apply-woek-dossier-template.py \
  input.docx \
  assets/downloads/woek_mein_dossier_v1_0.docx \
  --title "Titel" \
  --subtitle "Untertitel" \
  --document-type "Diskussionspapier" \
  --version "v1.0" \
  --fassung "Diskussionsfassung" \
  --stand "Juni 2026"
```

Danach das DOCX nach PDF exportieren, zum Beispiel mit LibreOffice:

```bash
soffice --headless --convert-to pdf --outdir assets/downloads assets/downloads/woek_mein_dossier_v1_0.docx
```

Vor Veröffentlichung muss die erzeugte PDF-/DOCX-Fassung gerendert und geprüft
werden. PDFs sind ergänzende Downloads; die Onlinefassung bleibt der Hauptzugang.
