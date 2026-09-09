# Wirkungsticker: Discovery- und Relevanzdiagnose

Stand der Ausgangsmessung: 09.09.2026, 17:28 MESZ. Datenstand des letzten abgeschlossenen Imports: 17:07 MESZ (`4a0999d0c2`). Diagnose vor der Implementierung.

## Befund

Es fehlt nicht an Nachrichten. Mehrere relevante Ereignisse erreichen den Rohinput, scheitern aber am Wortlaut-Vorfilter oder werden auf mehrere kleine Kandidaten verteilt. Zugleich fehlt eine von der Auswahl unabhängige Kontrolle übersehener Ereignisse. Ein zusätzlicher Testfehler stoppt die jüngsten Läufe vor dem Import. Das Budget war im letzten erfolgreichen Lauf nicht gesperrt.

## Vorhandene Architektur

`source-registry.json` + `media-registry.json` -> `registry.mjs` -> `sourceDue` -> sichere RSS/Atom/JSON/HTML-Adapter -> Datumsprüfung/Hashing -> `clusterItems`/`living-files` -> `preAnalyzeStory` -> Quellenintegrität -> budgetbegrenzte Queue -> Oracle-KI -> Evidenz-/Qualitätsgate -> atomare Git-Veröffentlichung -> GitHub Pages.

- Der Workflow läuft nominell alle 15 Minuten; Oracle dient als zusätzlicher Taktgeber. GitHub kann Starts verzögern. Fehlerbackoff und quellabhängige Intervalle können einzelne Quellen aussetzen.
- Normalisierung: Datumsbeleg, kanonische URLs, Herausgeber/Agenturherkunft, Text-Hash. Datumsreparatur maximal drei zusätzliche Abrufe. Unbekannte/future-datierte Zeiten werden nicht erfunden.
- Standardmäßig bis 60 Einträge je Quelle, teils kleinere Quelllimits. Keine kategorieweite Abrufgarantie. Quellen werden mit drei parallelen Abrufen verarbeitet; Timeout 18 Sekunden, begrenzte Wiederholung.
- Bundestag bisher nur hib, Umwelt, Wirtschaft; keine eigenständige aktuelle Plenar-/Agenda-Beobachtung. n-tv, BILD, Reuters-Direktdienst und mehrere andere Zugänge sind nicht automatisch aktiv. Konfiguriert ist nicht gleich überwacht.
- Ereignisabgleich nutzt Titelähnlichkeit, dokumentierte Sachverhaltsanker, Aktenzeichen, Datumsfenster und bestehende Lageakten. Schutz gegen fremde Ereignisse bleibt wichtig. Ein Ereignis mit verschiedenen Überschriften kann trotzdem zerfallen.
- Vorfilter: Mindestwert 30, Ausgangswert 10, hauptsächlich Einzeltext-Regeln. `preAnalyzeStory` übernimmt den stärksten Einzeltext statt eines voll erklärten Ereigniswerts. Rede/Interview/Keynote können Abzüge erzeugen. Vorab abgewiesene Texte sieht kein LLM.
- Queue: Frische, Neuveröffentlichung, bekannte materielle Updates, Wartezeit; Reserve für ältere technische Aufgaben. Bisher kein unabhängiger Themenausgleich und keine geschützte TOP-Stufe. Mehrere Kandidaten desselben Ereignisses können Slots verbrauchen.
- KI nur für ausgewählte, quellgeprüfte Kandidaten. Höchstens 12 Kandidaten je Lauf und rollend 40 Anfragen/Stunde; Budgetstufen können weiter begrenzen. Recherche, Qualitätsfreigabe und Preisgrenze sind verschiedene Gates. Keine Erhöhung dieser Grenzen vorgesehen.
- Es gibt bereits Quellen-Funnel, Quellenstatus, Kostenjournal, Wiedervorlagen, Review-Cache, Ereignisse und Entscheidungen in `newsroom.json`. Diese werden erweitert, nicht ersetzt.
- Historische Entscheidungen enthalten teils nur eine Story-ID, teils eine Ereignis-ID. Aktualisierte Quelldokumente überschreiben ihren Fingerprint; dadurch ist die letzte Ablehnungsursache nicht immer direkt auffindbar. Audit muss Quellen-URL, Story und Event gemeinsam auflösen.

## A-F: Fehlerklassen

| Klasse | Bedeutung | Abhilfe |
| --- | --- | --- |
| A Discovery | Kein passender Rohinput | Unabhängige Beobachtung, zugelassene Index-/Agenda-Abfrage, dokumentierte Quelllücke |
| B Extraction | Abruf/Parser/Datierung verhindert Übernahme | Quellstatus und konkrete Fehler; kein Umgehen einer Zugriffssperre |
| C Clustering | Falsche Zuordnung oder unnötige Aufspaltung | Ereignisanker, Datum, getrennte Verfahrensstufen; Kontext nicht automatisch verschmelzen |
| D Relevance | Gefunden, aber abgewertet | Erklärte Ereignissignale statt nur Einzeltextvokabular |
| E Selection | Relevant, aber Kapazität/Prüfslot fehlt | TOP-Schutz, weicher Themenausgleich, dauerhafte Queue |
| F Publication | Ausgewählt, aber Qualitäts-/Technik-/Releasehindernis | Belegbeschaffung bzw. technische Reparatur; Qualitätsgate nicht umgehen |

## Regressionstag 09.09.2026: rekonstruierter Ausgangsstand

Zeiten MESZ. Keine Aussage über sämtliche Medien; untersucht sind gespeicherte Eingänge und Entscheidungen. Quellenversionen sind keine unabhängigen Ereignisse.

| Fall | Rohinput / erster belegter Eingang | Entscheidung vor Änderung | Klasse / erforderliche Reaktion |
| --- | --- | --- | --- |
| Generaldebatte | Mehrere Dutzend Dokumente von ZDF, DLF, MDR, stern u.a.; stern 04:52, gemeinsame ZDF-Akte 09:06 | Viele Werte 0-28; mehrere KI-Ablehnungen wegen fehlendem Beschluss. Keine Hauptmeldung live | C/D: tagesgebundenes Plenarereignis bündeln und inhaltliche politische Tragweite prüfen; Debatte ist kein Beschluss |
| Haushalt | Mehrere Meldungen live, etwa Geldverwendung und Ukraine-/Verteidigungsausgaben | Teilweise weitere Updates wegen Zahlenbeleg zurückgestellt | F bei konkreten Updates, keine vollständige Discovery-Lücke |
| Ost-Umfrage | Kein passender gespeicherter Eingang | Nicht bewertet | A: RTL/ntv-Originalhinweis gezielt prüfen. Originalmitteilung bereits 08.09., Feldzeit 01.-07.09.; keine neue Nachwahlbefragung vom 09.09. |
| Söder / Verbotsverfahren | stern, 08.09. 22:21 | Wert 10, lokal verworfen | D: politische Positionsaussage prüfen. ZDF-Gillamoos-Link vom 07.09. nicht mit Maischberger vom 08.09. verwechseln |
| Ratzeburg / Lidl | Kein Eingang im Snapshot | Keine Entscheidung | A: NDR/zulässige Polizeiquelle prüfen. Opferangaben nicht ohne Beleg bestätigen |
| Rheinfelden / Grenzübergang | Kein Eingang im Snapshot | Keine Entscheidung | A: SWR/Polizei prüfen. Einzelner Grenzübergang, nicht ganze Schweizer Grenze; Sprengstoffverdacht nicht Fund |
| Falt-iPhone | Wiwo bereits 08.09. 19:06, weitere Quellen 09.09. | Wert 10; verworfen | C/D: möglicher Markteintritt/Technologiewechsel plus Agenda; vor Vorstellung ausdrücklich Erwartung, kein bestätigtes Produkt |
| Ölpreis / Märkte | DLF und weitere Medien | DLF-Akte `wt-6a90771161f2b4bb` seit 11:23 live; mehrere Parallelkandidaten und abgelehnte Wiederholungen | C/F für Teilfälle; nicht pauschal als fehlend zählen |
| Leuna Polyamid | Kein passender Eingang | Keine Entscheidung | A: MDR/Unternehmens-/Insolvenzquelle gezielt suchen; Standortfolgen getrennt belegen |
| Kodi | stern/Tagesspiegel 13:07, WDR 14:06 | Wert 10, lokal verworfen | D: Filialschließungen, Arbeitsplätze und regionale Versorgung prüfen |
| Google / Finnland | Wiwo 11:37 | Wert 42; KI: `insufficient_evidence` | F: relevantes Ereignis, aber Originalmitteilung/Zweitbeleg fehlt; keine pauschale Score-Erhöhung als Ersatz |
| USA-China / KI | DLF 08.09. 23:36; chinesische Reaktion 09.09. 12:07 | Wert 10; lokal verworfen | D: Technologiekonflikt/behördliche Vorwürfe prüfen; Vorwurf ist kein erwiesener Diebstahl |
| EU / russische Energie | Kein passender Eingang | Keine Entscheidung | A: Rechnungshof-Originalbericht und Datum verifizieren |

## Laufstörung

Die Läufe `34368248989` und `34369622951` scheiterten im Schritt `Unit and security tests` vor `Import, analyze and build`. Der Test `list and both detail MPD sections show the same available finding without changing the article` benutzt zufällig den neuesten produktiven Artikel als Fixture. Dessen neuer Bewertungsrahmen kollidiert mit künstlich überschriebenen Testpfaden. 727 Tests liefen erfolgreich, einer nicht. Reparatur: deterministischer, vollständiger Testgegenstand statt wechselnder Live-Daten; MPD-Prüfung bleibt erhalten.

## Minimale Änderungsarchitektur

1. Bestehende Ereignisse mit nachvollziehbaren Nachrichtenwert-Signalen und getrennten Teilwerten ergänzen. Zustimmung, Partei, dramatische Adjektive und MPD-Richtung geben keine Punkte.
2. Eng definierte Ereignisidentität verbessern (Institution + Vorgang + Datum), ohne Themenzusammenhang als Ereignisgleichheit zu behandeln.
3. TOP-Schutz und weichen Themenausgleich innerhalb derselben Kapazitäts-/Budgetgrenzen ergänzen.
4. Begrenzte, kostenlose Suche in freigegebenen Metadaten-Indizes; Agenda-Hinweise separat und mit Originalzeit. Neue Domains bleiben ungeprüft, nicht automatisch zugelassen.
5. Nachlauf-Prüfung vergleicht beobachtete größere Ereignisse mit ausgewählten/veröffentlichten Ereignissen. Nachprüfung wird über die vorhandene Queue beauftragt, nicht über zusätzliche unlimitierte KI-Aufrufe.
6. Audit-CLI, Ereignisentscheidungen und Coverage-Warnungen in vorhandene Betriebsberichte integrieren. Keine Garantie weltweiter Vollständigkeit.

Die spätere Ergebnismessung und verbleibende Grenzen stehen im Implementierungsbericht. Neue Relevanz ist Prüfpriorität, niemals Publikationsfreigabe.
