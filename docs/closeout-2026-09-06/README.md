# Abschlussprüfung vom 6. September 2026

Fortsetzung der Website- und Publikationsprüfung vom 5./6. September. Das Paket behebt die verbleibenden nachgewiesenen Import-, Navigations- und Konsistenzfehler und schließt die Auslagerung zweier alter lokaler Website-Builds ab.

## Dauerhafte Korrekturen

- PDF-Reader trennen Kapitel an den tatsächlichen Überschriften, einschließlich gemeinsam belegter Seiten. Zeilenumbrüche, gleiche Unterüberschriften und PDF-Sprungziele werden berücksichtigt. Fehlende Überschriften führen zu einem Fehler statt einem stillen Textverlust. Ein Titel allein darf keinen Import in die Onlinefassung eines anderen Dokuments auslösen.
- Reader-Aliase werden anhand der vollständig aufgelösten Zielroute angewendet. Gleichnamige Kapitel anderer Werke bleiben erhalten. Alte öffentliche Adressen bleiben über gezielte Weiterleitungen erreichbar.
- HTML-Bereinigung überschreitet keine Absatz-, Abschnitts- oder Skriptgrenzen. Interne Produktionshinweise werden entfernt; Quellen und fachliche Aussagen bleiben erhalten.
- 18 Originalabschnitte in den Transformationsportalen wurden aus dem vorhandenen Gesamtpaket rekonstruiert. Überlebende Absätze werden nicht verdoppelt. Beschädigte Sätze und eine versehentlich als Listenelement ausgezeichnete Journalüberschrift wurden repariert.
- Veraltete Glossarverweise führen zu heutigen Begriffseinträgen. Download-, Beispiel- und Fragenverweise erhalten fachlich passende Ziele. Die bisherigen Fragmentfundstellen werden am vollständigen Artefakt erneut geprüft.
- Der dokumentübergreifende Zugangscheck prüft tatsächliche Downloadpfade einschließlich eines zwischengeschalteten Bibliothekseintrags. Ein bestimmter Buttonwortlaut allein gilt nicht mehr als Beleg.
- Der gemeinsame PDF-Generator respektiert den Prüfmodus. Fünf während eines Builds unbeabsichtigt neu erzeugte historische PDFs wurden auf die veröffentlichten Originalbytes zurückgesetzt.

- Das Inhaltsverzeichnis der Gesamtstudie zeigt nur tatsächlich vorhandene Abschnitte; zusammengeführte Literaturgruppen erzeugen keine leeren Sprungziele. Die freigegebenen Studienskripte sind aus ihren vollständigen Markdown-Mastern neu erzeugt.

- Reine Gliederungsknoten mit ausschließlich „Inhalt wird ergänzt“ werden auf den anschließenden tatsächlich vorhandenen Text geführt. Alte URLs bleiben als Weiterleitungen erhalten; Inhaltsübersichten und Kapitelnavigation springen direkt zum Text. Absätze mit eigenem Inhalt werden nicht entfernt.

## Fachlicher und publizistischer Stand

Die aktuelle Einführung v1.1 definiert die WÖk ausdrücklich als umfassendes Wirtschafts- und Gesellschaftsmodell. Website und dreiseitige PDF beziehen Wirtschaft, Staat, Institutionen und gesellschaftliches Zusammenleben ein. Der fachliche Versionsstand der vorherigen Ausgabe bleibt historisch nachvollziehbar.

Der neue vierseitige Fachhinweis berücksichtigt die BMF-AAWU vom 13. Januar 2026. Er erklärt die bereits bestehende Trennung von Zielerreichung und ursächlicher Wirkung und beschreibt den möglichen WÖk-Zusatzbeitrag anhand eines Schulküchenbeispiels. Website und PDF werden aus derselben Inhaltsdatei erstellt. Die Ergänzung ist datiert und ersetzt keine historischen Originale.

Die führenden Begriffs-, Register- und Rechenfassungen sowie die vorhandenen Buch- und Paperaddenda bleiben maßgeblich. Die ursprüngliche Inventur der 756 PDF-Pfade ist in `publication-integrity-ledger.csv` dokumentiert. Auf ausdrücklichen Auftrag wurde anschließend der gesamte Dokumentbestand technisch bereinigt. Die alten und neuen Prüfsummen sind getrennt im Berichtigungsnachweis erfasst. Die Volltexterfassung und Kontextprüfung der ausgewiesenen Signale ist keine wissenschaftliche Einzelbegutachtung jeder empirischen Behauptung auf allen PDF-Seiten; fehlende Kalibrierungen und Modellannahmen werden nicht als validiert ausgegeben.

Der Suchindex wird mit einem JSON-Datensatz pro Zeile statt tief eingerückt gespeichert. Inhalt und Datensätze bleiben unverändert; der Index benötigt weniger Speicher und einzelne Einträge bleiben als Git-Diff überprüfbar.

## Technische Publikationsbereinigung

996 lokale Dokumentfassungen (916 PDFs, 67 Word-Dateien, acht Tabellen und fünf Präsentationen) wurden geprüft und bereinigt. Alle eigenen Dokumente nennen Natalie Weber als Autorin und Erstellerin. Typografische Striche sind durch ASCII-Bindestriche ersetzt; private Ablageangaben, Tracking-Zusätze und interne Produktionsnotizen sind entfernt. In zwei Literaturverweisen wird ein Vorname konventionell abgekürzt; die wissenschaftliche Zuordnung bleibt erhalten.

Der Textvergleich der lokalen PDFs umfasst 13.376 Seiten und 21.271 ersetzte Striche. Zusätzlich wurden 308 abweichende historische PDF-Versionen aus den öffentlichen Releases geprüft. Alle 3.744 vorhandenen PDF-Verweise blieben beim Abgleich erhalten. Die Tabellenformeln sind unverändert; sämtliche 67 Word-Dateien wurden erneut gerendert. Der Metadatenscan der 402 lokal vorhandenen Bilder ergab keine beanstandeten Produktions- oder Ortsangaben.

`assets/data/publication-hygiene-2026-09-06.json` bindet die bereinigten Fassungen an ihre geprüften Hashes. Die Prüfsummen historischer Quellstände bleiben erhalten; eine ausdrücklich dokumentierte technische Berichtigung erlaubt genau die geprüften neuen Bytes. Künftige ungeprüfte Änderungen bleiben gesperrt. Auch die 172 typografisch angepassten Akademie-Master behalten ihren ursprünglichen Quellnachweis.

Veröffentlicht und serverseitig per SHA-256 und Dateigröße geprüft sind 1.605 PDF- und Office-Assets in sieben bestehenden GitHub Releases sowie neun zugehörige Manifest- und Prüfsummendateien. Downloadnamen und URLs sind erhalten; es verbleiben keine temporären Upload-Assets. Eine korrigierte Datei wird vor dem Austausch vollständig hochgeladen und gegen die lokale Prüfsumme geprüft. Die Release-Beschreibungen weisen die technische Berichtigung vom 6. September 2026 aus.

## Archivierung und Speicher

Zwei alte lokale Buildstände sind unter `/WOEK/Archiv-Website-2026-09-06` in Dropbox gesichert. 32 Remote-Dateien wurden über die serverseitigen Dropbox-Inhaltshashes gegen die lokalen Uploads geprüft. Alle Archiveinträge wurden lokal per SHA-256 verifiziert; die Ausgangsbäume wurden unmittelbar vor der Entfernung erneut gehasht. Entfernt wurden 1.643.862.656 Byte alter lokaler Builddateien. `archive-receipt.json` und die Wiederherstellungsanleitung dokumentieren den Rückweg.

Das GitHub-Actions-Inventar umfasst zum Aufnahmezeitpunkt 410 Artefakte mit insgesamt 14.054.416.198 Byte. Es enthält Website-Deployments, parlamentarische Quellenstände, fachliche Übergaben und Wiederherstellungsdaten. Diese gesamte Summe ist **kein bestätigter Waste-Bestand**. Unabhängige Oracle-/OCI-Dienste und historische Veröffentlichungsartefakte wurden nicht pauschal gelöscht. Das beschädigte frühere Arbeitsverzeichnis wurde ebenfalls nicht als entbehrlich behandelt.

Nach dem serverseitigen Abgleich wurden zusätzlich 1.703 entbehrliche lokale Archiv- und Downloadkopien mit 1.437.834.350 Byte entfernt. Zusammen mit den alten Buildständen sind damit 3.081.697.006 Byte lokaler Altdateien entfernt. Die aktuellen Dokumente, Git-Objekte und Prüfnachweise bleiben erhalten. `local-backup-cleanup.json` dokumentiert den Vorgang.

Die zusätzlichen Publikationsoriginale sind unter `/WOEK/Archiv-Website-2026-09-06/Publikationsbereinigung` gesichert. Der Nachweis `publication-archive-receipt.json` dokumentiert den serverseitigen Hashabgleich. Die dortigen Originale sind ein privates Wiederherstellungsarchiv und werden nicht als aktuelle Publikationen ausgeliefert.

## Einordnung automatischer Prüfsignale

Kryptografisch gebundene Quellen- und Prüfregister behalten ihre belegten Originalbytes. Diese maschinenlesbaren Eingaben werden bei der Formatbereinigung nicht verändert; ihre Prüfsummen und Quellenbindungen bleiben überprüfbar. Die öffentliche Website-Projektion durchläuft weiterhin die vollständige Typografie- und Datenschutzprüfung. Diese Abgrenzung betrifft keine PDF- oder Office-Publikation.

Die Inventur unterscheidet redaktionelle Fehler von technisch beabsichtigten Strukturen. Blog-Filter verwenden URL-Hashes als Zustandsparameter. API-HTML-Dateien spiegeln maschinenlesbare Daten und erhalten `noindex`; eine Offline-Hilfsseite wird ebenfalls nicht als redaktioneller Suchtreffer geführt. Personenprofile können ihre Hauptüberschrift außerhalb eines `main`-Elements enthalten; der H1-Check erfasst deshalb das ganze Dokument. Gleichnamige Kapitel in verschiedenen Büchern sind nicht allein wegen des Titels doppelte Inhalte.

Der Sprachscan meldet außerdem Fachbegriffe wie Input/Output, ausdrücklich bezeichnete historische Versionsnummern und Quellenrollen als „kanonisch“. Diese Signale sind kontextgeprüft; Begriffsdefinitionen, Versionsangaben und Quellenbeschreibungen werden nicht mechanisch entfernt.

## Nachweise

Der vollständige lokale Build ist einschließlich aller Vor- und Nachprüfungen erfolgreich abgeschlossen. 16 zentrale Downloads wurden erneut über ihre öffentlichen URLs abgerufen und bytegenau geprüft; die 15 PDFs darin umfassen 1.913 Seiten und bestehen zusätzlich den Metadaten- und Textscan. Die abschließenden Artefakt-, Link-, Browser- und Deploymentnachweise werden unter `outputs/closeout-2026-09-06/` abgelegt. Die Veröffentlichung erfolgt über das bestehende GitHub-Pages-Hosting ohne Vercel-Build oder neue kostenpflichtige Infrastruktur.
