# WÖk-Migrationsmatrix v1.1

Stand: 2026-05-23
Zielversion: 1.1 / Referenzordnung
Autorin der Quellinhalte: Natalie Weber

Diese Matrix ordnet ältere und aktuelle Dokumente der Wirkungsökonomie in die neue Begriffssystematik ein. Sie ersetzt keine Originalfassung. PDFs, DOCX- und XLSX-Quellen bleiben als historische oder zitierfähige Originale erhalten; die Online-Referenz nutzt für künftige Texte die führende Begriffsbasis.

## Quellenhierarchie

1. **Führender Begriffsleitfaden der Wirkungsökonomie**
   Maßgeblich für Begriffe, Hovers, Glossarlinks, Synonyme und Terminologieprüfung. Stand: 21. Mai 2026.

2. **Neue Buchfassung / Online-Referenz**
   `Die neue Ordnung des Wohlstands`, 108 Kapitel, Version 2026.2-live-reference als laufend gepflegte Webfassung.

3. **Master-Items / WÖk-IDs**
   `WOeK_Master_Items_final_v1.2.xlsx` und PDF als Register- und Indikatorenbasis.

4. **Alte Gesetzes- und Methodenpapiere**
   Methodisch wertvoll, aber gegen die neue Begriffssystematik, NWI/FinalScore/T-SROI-Trennung und Grundrechtsschutz zu prüfen.

5. **Alte Grundsatz-, Manifest- und Präsentationsdokumente**
   Sichtbar halten, aber als frühere Entwicklungsstände kennzeichnen, wenn sie von der führenden Terminologie abweichen.

## Kernformel für Version 1.1

> Wirkung ist die tatsächliche Veränderung von Zuständen. Sie kann positiv, negativ oder neutral sein. Die Wirkungsökonomie bewertet Wirkung am Referenzrahmen der SDGs, der Agenda 2030 und SDG+ und richtet Wirtschaft, Politik, Kapital, Medien und Entscheidungen auf positive Netto-Wirkung für Mensch, Planet und Demokratie aus.

## Matrix

| Dokument | Alter Stand | Neuer Status | Aktion | Zielversion | Wichtigste Begriffskorrekturen | Methodische Korrekturen | Rechtliche / UX-Hinweise | Priorität | Neuer Zielpfad | Offene Punkte |
|---|---|---|---|---|---|---|---|---|---|---|
| Führender Begriffsleitfaden | v1.0, 21. Mai 2026 | Führend | Nicht umschreiben, als verbindliche Quelle nutzen | 1.1-Begriffsbasis | Wirkung neutral, positive Netto-Wirkung als Zielgröße, Wirkstoff nur Analogie | Begriffe in Glossar, Hovers, Suche und Review ableiten | Keine älteren Definitionen automatisch höher gewichten | Hoch | `src/data/glossary.terms.yml` | Laufende redaktionelle Freigabe künftiger Erweiterungen |
| Neue Buchfassung / Online-Referenz | 2026.0 Source, 2026.2 Web | Führend / Version 1.1 vorbereiten | Begriffe, Metadaten, Hovers, Quellen und Kapitelstruktur prüfen | 2026.2 / 1.1 | SDG+ erklären, Wirkung neutral, NWI/T-SROI trennen | Abschnitts-IDs, Kapitelrouten, Glossarlinks, Quellenkarten | Online-Referenz sichtbar von Originalfassung unterscheiden | Hoch | `/referenz/` | Einzelne Kapitel weiter delta-reviewen |
| Grundlagenpapier Wirkungsökonomie | Frühere Grundsatzfassung | Archivieren / Historische Fassung + Kurzfassung | Historisch markieren, aktualisierte Kurzfassung erstellen | 1.1-Kurzfassung | Alte positive Verwendung von Wirkung korrigieren | Stufenmodell und positive Netto-Wirkung ergänzen | Historische Fassung nicht löschen | Mittel | `docs/grundlagen/Wirkungsoekonomie_Kurzfassung_v1.1.md` | Vollständige redaktionelle Neufassung optional |
| Manifest / Minifest | Frühere Mobilisierungssprache | Aktualisieren | Sprachlich stark anpassen | 1.1-Kurzfassung | Wirkung neutral, positive Netto-Wirkung, SDG+ erklären | Keine T-SROI/Netto-Wirkung-Verwechslung | Als politisch-kommunikative Kurzform kennzeichnen | Mittel | `docs/grundlagen/Manifest_Kurzfassung_v1.1.md` | Tonalität final redaktionell prüfen |
| WÖK-Partei / politische Programme | Politische Frühfassung | Stark überarbeiten | Programmatische Sprache aktualisieren | 1.1-Entwurf | Social-Credit-Abgrenzung, Demokratie-Schutzformeln | Personenbewertung ausschließen | Nicht als fertiges Parteiprogramm der Referenz veröffentlichen | Mittel | `docs/grundlagen/Historische_Dokumente_Hinweis_v1.1.md` | Politische Positionierung separat entscheiden |
| WStG Oktober 2025 | Gesetzes-/Methodenentwurf | Neu schreiben | Als WStG 2.0 - Wirkungssteuerrahmengesetz neu fassen | 2.0-Entwurf | Wirkung neutral, positive Netto-Wirkung, SDG+ als WÖk-Erweiterung | WStG als Rahmen: Governance, Daten, Rechtsschutz, Pilotierung | Kein geltendes Recht behaupten; stufenweise Einführung | Sehr hoch | `docs/gesetze/WStG_2.0_Wirkungssteuerrahmengesetz_Entwurf.md` | Juristische Prüfung erforderlich |
| Technische Leitlinien WUStG | v2 PDF, Methodenstand älter | Stark überarbeiten | Neue v2.1-Entwurfsfassung erstellen | 2.1-Entwurf | Wirkung neutral, NWI/FinalScore/T-SROI trennen | Datenqualität, Einspruch, EU-Kompatibilität, KMU-Schutz | Als Pilot-/Zielarchitektur formulieren | Sehr hoch | `docs/gesetze/WUStG_Technische_Leitlinien_v2.1_Entwurf.md` | Tabellen aus PDF später strukturiert nachziehen |
| T-SROI Whitepaper | T-SROI teils als Wirkungs-/Netto-Kennzahl | Neu ausrichten / stark überarbeiten | T-SROI als Transformationskennzahl definieren | 2.0 | T-SROI ≠ NWI; Transformationswirkung statt operative Netto-Wirkung | NWI zuerst, T-SROI darauf aufbauend | Keine exakte Vorhersage behaupten | Hoch | `docs/whitepaper/T-SROI_v2.0_Transformationswirkung.md` | Beispiele mit Fonds/Projekten ergänzen |
| Lieferkette | Praxispapier älterer Methodenstand | Behalten als Praxisanhang, aber aktualisieren | v1.1-Updatehinweise ergänzen | 1.1 | Wirkungspotenzial, NWI, FinalScore | Datenqualität, Lieferantenentwicklung, Reverse Merit Order | Kein moralisches Lieferantenrating | Hoch | `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md` | Vollwebfassung tabellarisch prüfen |
| WP Produkte | Praxispapier | Behalten / aktualisieren | Produktlogik an NWI und WUStG v2.1 anschließen | 1.1 | Positive Netto-Wirkung als Zielgröße | Scorecard, WÖk-ID, DPP, FinalScore | Als Pilot-/Zielarchitektur | Hoch | `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md` | Produktbeispiele einzeln prüfen |
| Beispiel Apfel | Beispielrechnung | Behalten / aktualisieren | Als Beispielrechnung markieren | 1.1 | Nichtkompensation und SDG+ präzisieren | -3/+3 Scorelogik, NWI, Datenqualität | Keine endgültige Steueranwendung behaupten | Hoch | `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md` | Rechenschritte aus PDF strukturieren |
| Beispiel Konzern | Praxis-/Konzernbeispiel | Behalten / aktualisieren | Konzernlogik als Pilotfenster einordnen | 1.1 | Organisation statt Personen bewerten | Lieferketten, Kapitalflüsse, Portfolio-Wirkung | Rechtsschutz und Datenprüfung ergänzen | Mittel | `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md` | Detailzahlen prüfen |
| WP Einkommen / WEstG | Personennahe Wirkungssysteme | Stark überarbeiten | Personenbewertungsschutz und Pilotlogik ergänzen | 1.1 | Wirkungseinkommen nicht BGE, positive Netto-Wirkung | Tätigkeit, Organisation, Kapitalquelle trennen | Social-Credit-Abgrenzung zwingend | Hoch | `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md` | Juristische und sozialpolitische Prüfung |
| WP Rente | Rentenmodell | Stark überarbeiten | Lebensleistung und Wirkung ohne Personenrating formulieren | 1.1 | Wirkungsrente als Reformidee, nicht fertiges Gesetz | Pilotierung, Datenarmut, Schutzregeln | Keine Gesinnungs- oder Lebensstilbewertung | Hoch | `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md` | Finanzierungsannahmen prüfen |
| Wenn Maschinen arbeiten | Automatisierungspapier | Stark überarbeiten | Wirkungseinkommen als mögliche Ausbaustufe darstellen | 1.1 | Arbeit verliert nicht Würde, sondern Exklusivität als Einkommensanker | Maschinenleistung, Kapitalrückkopplung, Haushalt | Kein klassisches BGE behaupten | Mittel | `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md` | Begriffe WIF/Wirkungsdividende klären |
| WP Wohnungsmarkt | Sektor-/Praxispapier | Aktualisieren | Soziale Abfederung, Mieterschutz und ökologische Wirkung verbinden | 1.1 | Wirkung neutral, positive Netto-Wirkung | Reverse Merit Order, Stranded Assets, NWI | Schutz bezahlbaren Wohnens sichtbar machen | Mittel | `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md` | Regionale Datenbasis prüfen |
| Systemmodell der Wirkungsökonomie | Architekturpapier | Behalten / aktualisieren | Neue Stufenlogik und Rückkopplung ergänzen | 1.1 | Wirkungsarchitektur als Gesamtsystem | Daten, Regeln, Institutionen, Anreize, Kontrolle, Lernen | Als Systemmodell, nicht als fertige Institution | Hoch | `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md` | Diagramme prüfen |
| Nachhaltigkeit-Systemarchitektur | Architekturpapier | Behalten / aktualisieren | Nachhaltigkeit als Systemarchitektur, nicht Add-on | 1.1 | Nachhaltigkeit an positive Netto-Wirkung binden | Interdependente Netto-Wirkung, Resilienz | Anschluss an CSRD/ESRS neutral formulieren | Hoch | `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md` | Quellenstand prüfen |
| Wirkungsrat Konzept | Governancepapier | Aktualisieren | Aufgaben, Unabhängigkeit, Lobby-Schutz, Versionierung schärfen | 1.1 | Wirkungswahrheit ohne Wahrheitsmonopol | Benchmarks, WÖk-IDs, Evaluation, öffentliche Konsultation | Nicht als technokratische Instanz formulieren | Hoch | WStG 2.0 / später eigene v1.1-Fassung | Zusammensetzung final prüfen |
| Leitbild Mensch, Planet und Demokratie | Leitbild | Aktualisieren | SDG+ und MPD sauber erklären | 1.1 | MPD als Zielrahmen positiver Netto-Wirkung | Leitbild mit Bewertungsrahmen verbinden | Keine moralische Pauschalsprache | Mittel | `docs/grundlagen/Historische_Dokumente_Hinweis_v1.1.md` | Kurzfassung prüfen |
| NATS WÖk allgemein | Präsentation/Kommunikation | Archivieren / historische Fassung | Nur als Kontext sichtbar halten | Archiv | Terminologie überholt möglich | Nicht als Methodenquelle verwenden | Historischen Stand klar labeln | Niedrig | `docs/grundlagen/Historische_Dokumente_Hinweis_v1.1.md` | Nur bei Bedarf migrieren |

## Offene Entscheidungen

- Ob die politischen Dokumente in der Hauptreferenz sichtbar bleiben oder in einen Archivbereich wandern, ist redaktionell zu entscheiden.
- Für WStG 2.0, WUStG v2.1 und personenbezogene Module ist eine juristische Prüfung nötig.
- Rechenbeispiele mit Steuerklassen, Prozentwerten oder Skalen sind erst nach methodischer Freigabe als verbindliche Online-Referenz zu markieren.
