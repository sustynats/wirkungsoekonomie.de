# Abschlussprüfung vom 6. September 2026

Fortsetzung der Website- und Publikationsprüfung vom 5./6. September. Das Paket behebt die verbleibenden nachgewiesenen Import-, Navigations- und Konsistenzfehler und schließt die Auslagerung zweier alter lokaler Website-Builds ab.

## Dauerhafte Korrekturen

- PDF-Reader trennen Kapitel an den tatsächlichen Überschriften, einschließlich gemeinsam belegter Seiten. Zeilenumbrüche, gleiche Unterüberschriften und PDF-Sprungziele werden berücksichtigt. Fehlende Überschriften führen zu einem Fehler statt einem stillen Textverlust. Ein Titel allein darf keinen Import in die Onlinefassung eines anderen Dokuments auslösen.
- Reader-Aliase werden anhand der vollständig aufgelösten Zielroute angewendet. Gleichnamige Kapitel anderer Werke bleiben erhalten. Alte öffentliche Adressen bleiben über gezielte Weiterleitungen erreichbar.
- HTML-Bereinigung überschreitet keine Absatz-, Abschnitts- oder Skriptgrenzen. Fachliche Nennungen von KI-Produkten bleiben von redaktionellen Produktionshinweisen unterscheidbar.
- 18 Originalabschnitte in den Transformationsportalen wurden aus dem vorhandenen Gesamtpaket rekonstruiert. Überlebende Absätze werden nicht verdoppelt. Beschädigte Sätze und eine versehentlich als Listenelement ausgezeichnete Journalüberschrift wurden repariert.
- Veraltete Glossarverweise führen zu heutigen Begriffseinträgen. Download-, Beispiel- und Fragenverweise erhalten fachlich passende Ziele. Die bisherigen Fragmentfundstellen werden am vollständigen Artefakt erneut geprüft.
- Der dokumentübergreifende Zugangscheck prüft tatsächliche Downloadpfade einschließlich eines zwischengeschalteten Bibliothekseintrags. Ein bestimmter Buttonwortlaut allein gilt nicht mehr als Beleg.
- Der gemeinsame PDF-Generator respektiert den Prüfmodus. Fünf während eines Builds unbeabsichtigt neu erzeugte historische PDFs wurden auf die veröffentlichten Originalbytes zurückgesetzt.

- Das Inhaltsverzeichnis der Gesamtstudie zeigt nur tatsächlich vorhandene Abschnitte; zusammengeführte Literaturgruppen erzeugen keine leeren Sprungziele. Die freigegebenen Studienskripte sind aus ihren vollständigen Markdown-Mastern neu erzeugt.

## Fachlicher und publizistischer Stand

Die aktuelle Einführung v1.1 definiert die WÖk ausdrücklich als umfassendes Wirtschafts- und Gesellschaftsmodell. Website und dreiseitige PDF beziehen Wirtschaft, Staat, Institutionen und gesellschaftliches Zusammenleben ein. Die vorherige Ausgabe wird transparent abgelöst, nicht überschrieben.

Der neue vierseitige Fachhinweis berücksichtigt die BMF-AAWU vom 13. Januar 2026. Er erklärt die bereits bestehende Trennung von Zielerreichung und ursächlicher Wirkung und beschreibt den möglichen WÖk-Zusatzbeitrag anhand eines Schulküchenbeispiels. Website und PDF werden aus derselben Inhaltsdatei erstellt. Die Ergänzung ist datiert und ersetzt keine historischen Originale.

Die führenden Begriffs-, Register- und Rechenfassungen sowie die vorhandenen Buch- und Paperaddenda bleiben maßgeblich. Für die 756 zuvor inventarisierten PDF-Pfade dokumentiert `publication-integrity-ledger.csv` die unveränderten Originaldateien und den tatsächlichen Prüfumfang. Die Volltexterfassung und Kontextprüfung der ausgewiesenen Signale ist keine wissenschaftliche Einzelbegutachtung jeder empirischen Behauptung auf allen PDF-Seiten; fehlende Kalibrierungen und Modellannahmen werden nicht als validiert ausgegeben.

## Archivierung und Speicher

Zwei alte lokale Buildstände sind unter `/WOEK/Archiv-Website-2026-09-06` in Dropbox gesichert. 32 Remote-Dateien wurden über die serverseitigen Dropbox-Inhaltshashes gegen die lokalen Uploads geprüft. Alle Archiveinträge wurden lokal per SHA-256 verifiziert; die Ausgangsbäume wurden unmittelbar vor der Entfernung erneut gehasht. Entfernt wurden 1.643.862.656 Byte alter lokaler Builddateien. `archive-receipt.json` und die Wiederherstellungsanleitung dokumentieren den Rückweg.

Das GitHub-Actions-Inventar umfasst zum Aufnahmezeitpunkt 410 Artefakte mit insgesamt 14.054.416.198 Byte. Es enthält Website-Deployments, parlamentarische Quellenstände, fachliche Übergaben und Wiederherstellungsdaten. Diese gesamte Summe ist **kein bestätigter Waste-Bestand**. Unabhängige Oracle-/OCI-Dienste und historische Veröffentlichungsartefakte wurden nicht pauschal gelöscht. Das beschädigte frühere Arbeitsverzeichnis wurde ebenfalls nicht als entbehrlich behandelt.

## Nachweise

Die abschließenden Build-, Artefakt-, Link-, Browser- und Deploymentnachweise werden unter `outputs/closeout-2026-09-06/` abgelegt. Die Veröffentlichung erfolgt über das bestehende GitHub-Pages-Hosting ohne Vercel-Build oder neue kostenpflichtige Infrastruktur.
