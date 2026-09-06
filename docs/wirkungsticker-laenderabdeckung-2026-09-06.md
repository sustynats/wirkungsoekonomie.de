# Regionale Quellenabdeckung – 6. September 2026

## Ergebnis und Grenzen

Das bisher aktive Regionalnetz aus NDR, WDR, MDR, SWR Aktuell, rbb24 und hessenschau ist explizit 13 Bundesländern zugeordnet. NDR wird nicht für Bremen, SWR nicht für das Saarland gezählt. Ein allgemeines `DE`-Label ist keine regionale Abdeckung.

Neu sind zwei stündlich vorgesehene amtliche Zugänge im Probebetrieb: Bayerische Staatsregierung (Presse-RSS) und Bremer Senat (aktuelle öffentliche Presseübersicht). Damit sind regionale Zugänge für 15 von 16 Ländern eingerichtet. Ein erster erfolgreicher Produktionsabruf wird erst nach dem tatsächlichen Lauf ausgewiesen, nicht anhand des lokalen Tests. Unabhängiger Regionaljournalismus ist weiterhin für 13 Länder eingerichtet. Amtliche Pressemitteilungen ersetzen ihn nicht; Aussagen bleiben Regierungsangaben.

Das Saarland bleibt eine offene regionale Lücke. Die offizielle Presse- und RSS-Übersicht antwortete bei der Prüfung mit HTTP 403. Kein Umgehen dieser Sperre, kein geratener Feed. Radio Bremen/buten un binnen und Saarländischer Rundfunk bleiben Kandidaten für zusätzliche unabhängige Zugänge; es wurde keine ungesicherte Freigabe aus Markennamen oder RSS-Verfügbarkeit abgeleitet.

## Verifizierte Zugänge und Nutzungsrahmen

- Bayern: Die [offizielle RSS-Übersicht](https://www.bayern.de/buergerservice/apps-messenger-rss/) verlinkt `https://www.bayern.de/rss/pm_alle.php`. HTTP 200, XML, 40 aktuelle Einträge im begrenzten Test. Das [Impressum](https://www.bayern.de/impressum/) erlaubt die Auswertung von Pressemitteilungen und Reden mit Quellenangabe ausdrücklich. Nur begrenzte Pressemetadaten/-auszüge, keine Bilder und keine Volltextspiegelung. Robots HTTP 200 ohne Sperre; keine RSL-Verknüpfung im geprüften Robots-Dokument, HTTP-Link-Header oder offiziellen Verzeichnis.
- Bremen: Die [Startseite](https://www.senatspressestelle.bremen.de/) verweist auf die [aktuelle Presseübersicht](https://www.senatspressestelle.bremen.de/pressemitteilungen-1464). HTTP 200, 20 Datensätze mit Titel, Datum, Ressort und Link. Das [Impressum](https://www.senatspressestelle.bremen.de/impressum-1478) nimmt Pressemitteilungen ausdrücklich von seinen Weiterverarbeitungsbeschränkungen aus. Nur erste aktuelle Indexseite; kein Archivcrawl, keine Artikel-/Bildabrufe. Robots HTTP 200 ohne Sperrregel, keine RSL-Verknüpfung in den geprüften Verweisen. Kein aktueller RSS-Link entdeckt; deshalb expliziter Tabellenadapter innerhalb der vorhandenen HTML-Index-Infrastruktur.
- BR24: Der Feed ist bereits technisch verifiziert. Die [RSS-Bedingungen](https://www.br.de/service/nutzungsbedingungen-rss-feeds-100.html) (Stand 7. Oktober 2025) beschränken Archivierung und Weitergabe an Dritte. Die aktuelle `robots.txt` enthält eine RAG-/Grounding-Ausnahme zu Trainingsbeschränkungen; sie klärt nicht automatisch die getrennten RSS-Bedingungen für unsere persistente Pipeline mit externem Modell. Daher Rolle E, deaktiviert, Klärung mit `distribution@br.de` erforderlich. Keine Anfrage ohne gesonderten Versandauftrag versendet.
- Saarland: Im [Impressum](https://www.saarland.de/DE/services/impressum) ist eine Ausnahme für Pressemitteilungen erkennbar. Das ersetzt nicht den fehlenden verifizierten technischen Zugang. Fallbezogene Rolle D; keine regelmäßige Überwachung behaupten.

Diese dokumentierte Prüfung ist keine pauschale Rechtsfreigabe anderer Angebote derselben Herausgeber. Zugangssperren, Robots und deklarierte RSL-Bedingungen bleiben Laufzeitgates.

## Dauerhafte Umsetzung

- `federal_states` und `regional_coverage_kind` ergänzen die bestehende Source Registry. Keine zweite Quellenliste oder Datenbank. Der Registry-Validator prüft gültige, eindeutige Ländercodes.
- `regionalCoverage` verwendet dieselbe Zugriffskontrolle und `sourceHealth` wie der Collector. Unterscheidung: Lücke, eingerichtet/Erstabruf offen, erfolgreich überwacht, gestört/überfällig. Deaktivierte, rechtlich offene und zeitweise gesperrte Quellen zählen nicht als gesunde Überwachung.
- Jeder reguläre Nachrichtenlauf ergänzt `report.regional_coverage`; der vorhandene Portfolio-Auditor enthält dieselben Angaben und eine Review-Markierung. Bekannte Abdeckungslücken werden nicht als Absturz eines ansonsten erfolgreichen Laufs ausgegeben. Bestehende Betriebsfehler bleiben unverändert gemeldet.
- Die öffentliche Quellenübersicht zeigt alle 16 Länder, verlinkte Quellen, amtliche/journalistische Rolle, Probebetrieb und tatsächlichen Abrufstand.
- Der regionale Filter bleibt lokal. Repräsentationstermine ohne neue materielle Information werden unter die Eingangsschwelle gesetzt; Entscheidungen und systemisch relevante Vorfälle bleiben prüffähig. Der Auswahlkontext bleibt auch nach Annotation im gespeicherten Quellendatensatz erhalten.
- Presseauszüge bleiben begrenzt; Tagesdaten des Bremer Index erhalten `published_precision=day`, keine erfundene Veröffentlichungsuhrzeit.
- Bestehende Taktung, Deduplizierung, Quellenintegrität, Kostenlimits und Veröffentlichungsgates bleiben aktiv. Keine zusätzliche KI-Klassifikation, kein massenhafter Backfill.

## Tests

- 421 Nachrichtentests erfolgreich, darunter acht neue Tests zu Länderzuordnung, Gesundheit/Erstlauf/Sperre, Rollen, Registervalidierung, öffentlicher Übersicht, Parser, Vorfilter und begrenztem RSS-Auszug.
- Echter Collector-/Parser-Test: Bayern 40, Bremen 20 Datensätze. 16 bzw. 19 lagen lokal unter Score 30, zusammen 35 von 60; kein KI-Aufruf. Das ist eine Momentaufnahme, keine belastbare langfristige Sparquote.
- Registry, `news:build`, Suchindex, Taxonomie, `news:validate`, Source-Portfolio- und Source-Integrity-Audit mit `--strict` erfolgreich. 94 aktive Stories und 186 Quellen ohne offenes Integritätsgate.
- Lokaler Browsercheck bei 390 und 1280 Pixeln: 16 Landeszeilen, Quellenprofile erreichbar, keine horizontale Überbreite, keine JavaScript-Seitenfehler. Die Anzeige des noch ausstehenden Erstlaufs wurde ausdrücklich geprüft.
- Die Liveprüfung erfolgt nach dem Deployment; der lokale Abruf wurde nicht als Produktionslauf in `data/news/state.json` eingetragen.

## Weiter erforderlich

1. Saarland: zulässigen, erreichbaren regionalen Nachrichten-/Pressezugang verifizieren.
2. BR24: Pipeline-Nutzung mit dem Anbieter klären; keine stillschweigende Aktivierung.
3. Bayern/Bremen: unabhängige Regionalberichterstattung zusätzlich erschließen; amtliche Grundabdeckung nicht mit journalistischer Vollständigkeit verwechseln.
4. Probebetrieb über den bestehenden Quellen-Funnel bewerten: Neuigkeiten, Dubletten, Verwerfungen, Fehler und tatsächliche Kosten.
