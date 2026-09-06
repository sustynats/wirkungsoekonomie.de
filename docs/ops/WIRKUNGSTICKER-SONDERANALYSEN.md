# WÖk-Sonderanalysen

Stand: 7. September 2026. Ergänzung der bestehenden WÖk-Analysen, keine zweite Datenbank oder Rendering-Architektur.

## Datenfluss und Autorenschaft

Ein ausdrücklich beauftragter, recherchierter Beitrag liegt als freigegebenes Recherchepaket in `content/news/reviews/`. `scripts/news/publish-editorial-review.mjs` prüft es zunächst ohne Schreibzugriff; `--publish` übernimmt es in die bestehende `data/news/editorial-analyses.json`. Der anschließende normale News-Build erzeugt Detailseite, Ursprungshinweis, gemischte Übersicht und Feeds. Website-Suche und Sitemap werden durch die vorhandenen Generatoren aktualisiert.

Die neue Variante lautet `analysis_variant: systemic`, mit `editorial_mode: commissioned_review`. Das öffentliche Label ist **WÖk-Sonderanalyse**, Autorin Natalie Weber. Standardanalysen bleiben `standard` beziehungsweise ohne Variantenfeld und erhalten weder längere Pflichttexte noch zusätzliche Gestaltungselemente.

Prüfen / übernehmen:

```sh
node scripts/news/publish-editorial-review.mjs content/news/reviews/2026-09-07-sachsen-anhalt-sonderanalyse.json
node scripts/news/publish-editorial-review.mjs content/news/reviews/2026-09-07-sachsen-anhalt-sonderanalyse.json --publish
npm run news:build
npm run news:validate
```

`--publish` bedeutet Übernahme in den lokalen Publikationsbestand, nicht bereits Live-Deployment. Gleicher Inhalt ist idempotent. Änderungen erhalten eine neue Version; vorherige Abschnitte, Aussagen, Quellen und Monitoringstände bleiben erhalten. Die zweite lokale Recherchefassung ergänzt vor dem ersten Livegang wissenschaftliche Evidenz zur Wiederholung.

## Fachliche Trennung und Quellen

- Programm, geltendes Recht, analytische Inferenz und Szenario bleiben getrennt. Behauptete Absicht ist kein Wirkungsnachweis.
- `source_snapshot` verwendet die vorhandenen quellengebundenen Review-Metadaten, URL-Fingerprints und Inhaltsbindungen. Das Portal-Programm `ltw-2026-st-afd` wird als vorhandene Identität referenziert.
- Hintergrund- und Rechtsquellen werden nicht als Bestätigung der Wahlnachricht in deren Ereigniscluster eingefügt. Das Evidenzgate nennt ausdrücklich den eigenständigen Szenario-Gegenstand.
- Fehlende Publikationsdaten werden als `published_at: null` und `document_date_status: not_stated` gespeichert. Der Abruf-/Prüfzeitpunkt wird nicht als erfundenes Veröffentlichungsdatum ausgegeben.
- Quellenprüfung, Quellenfunktion und Wirkungsevidenz sind verschiedene Fragen. Eine verifizierte Originalseite kann eine unbestätigte Akteursaussage enthalten.
- `subject_dimensions` enthält die Relevanz des Analysegegenstands, unabhängig von den Ereignisbalken. `direction_finding` erläutert die Richtung separat. Keine Gesamt- oder Personennote.
- Gemeinsame Promptregel und Root-AGENTS verlangen konkrete Folgen vor Zielnummern, mit materiell relevanter Prüfung von Kinder-/Frauensicherheit, Gleichberechtigung und Hilfezugang. Die kompakte Form wahrt das bestehende Eingabebudget auch beim 21-Quellen-Regressionsfall.

## Darstellungsbausteine

`scripts/news/systemic-analysis.mjs` ergänzt kleine generische Renderer. `sections[].visual` unterstützt `cards`, `cascade`, `timeline` und `references`. Jeder Knoten besitzt Titel, Erklärung und Erkenntnisstatus; Fakten brauchen Quellen, Sprungziele müssen existieren. Aussagen werden als Text escaped. Die Semantik wird durch Beschriftung und unterschiedliche Linienarten getragen, nicht allein durch Farbe.

Die erste Sonderanalyse bietet Kurzfassung, Machtkarte, zwölf Systemfelder, bedingte Kaskade, Referenzmatrix, Zeitachse und Szenarien. Sie nutzt vorhandene Relevanzbalken und Icons. Keine erfundenen Wirkungsprozente oder ungeeigneten Zahlenvergleiche. Quellen stehen auf Desktop bei dieser längeren Variante unter dem Beitrag, nicht in einer überlangen haftenden Seitenleiste. Mobile Karten sind einspaltig; die Autorinnenmarke bleibt ein kleines rundes Bild.

## Living Analysis und Grenzen der Automatik

`monitoring.points[]` führt `open`, `announced`, `introduced`, `adopted`, `implemented`, `measured`. Nichtoffene Stufen brauchen Datums- und Quellenbezug. Eine Schlagzeile darf keinen Fortschritt oder Kausalnachweis erzeugen.

Der bestehende Analyse-Lauf erkennt neueres Material zur Ursprungsgeschichte und markiert die beauftragte Sonderanalyse als `research_pending`. Er überschreibt sie nicht mit dem 900–1800-Wörter-Standardprompt. Dieser Schutz ist absichtlich: Die besondere Breite und individuelle Quellenprüfung darf nicht durch einen automatischen Kurzlauf verloren gehen. Eine belegte inhaltliche Fortschreibung erfolgt über ein erneutes Review-Paket. Die automatische Recherche-Markierung ersetzt diese Prüfung nicht und behauptet keine permanente eigenständige Abfrage aller Gesetze oder Ministerien.

## Erstveröffentlichung Sachsen-Anhalt

- URL: `/wirkungsticker/analyse/wenn-aus-programm-staatsmacht-wird-sachsen-anhalt/`
- Analyse-ID: `woek-analysis-1abde052e9be`; Ursprung: `wt-e10c23f5e37ed39e`.
- 18 Minuten Lesezeit, 29 kurze Abschnitte, sechs Visualisierungen, 25 Quellen, 17 zentrale Aussagen, 20 Monitoringpunkte.
- Primärbasis: Landesverfassung mit Reformstand 2026; GG einschließlich Art. 20a; endgültiges AfD-Programm und gesondertes Sofortprogramm; GVG §§ 146/147; BVerfSchG § 6; Landtagsberichte über Kulturgesetz und Parlamentsreform; Gewalthilfegesetz-Erläuterung mit Anspruch ab 2032; Bundesrat/Landesvertretung; Innenministerium; IMK; BA; Klimabeschluss; Agenda 2030; wissenschaftliche Meta-Analyse zum Illusory-Truth-Effekt.
- Eigene Verknüpfungen: Die Partei der Verwundbarkeit, Wirkung statt Weltbild (historischer Entwurf!), Wahl-O-Mat-Analyse, Demokratie braucht mehr als gute Sachpolitik und vorhandene Richter:innen-Wirkungsakte. Eigene Vorarbeiten zählen nicht als unabhängige Bestätigung.
- Relevanz: Mensch sehr hoch, Planet hoch, Demokratie sehr hoch. Ex-ante-Richtungsbefund mit Gegenpfaden und Nichtkompensation; keine behauptete beobachtete Gesamtwirkung.
- Monitoring: Ergebnis/Sitze, Regierung, Ressorts und Leitungen, Sicherheit/Kooperation, Erlasse, Haushalt, Kultur, Demokratieprojekte, Gleichstellung/LGBTQ, Frauen-/Kinderschutz, Schule, Bürgerwacht, Justiz, Hochschulen, MDR, Energie, Bundesrat, Personal/Investition und messbare Wirkung.
- Kosten: keine zusätzliche kostenpflichtige Pipeline-Analyse, kein Bildmodell, keine neue laufende API; Recherche und Autorentext wurden im beauftragten Arbeitsprozess geprüft. Daraus wird kein Preisversprechen für künftige Sonderanalysen abgeleitet.

## Offene Evidenzfragen

Regierungsbildung, Einzelgesetze, Haushalte, Besetzungen und Vollzug bleiben soweit nicht belegt offen. Der Trump-Originalpost und seine genaue Zeit konnten nicht eigenständig verifiziert werden. Die dpa-AFX-Weiterveröffentlichung wird wegen widersprüchlicher Zeiten nur als begrenzter Kontext attribuiert. Keine Behauptung von Wahlwirkung oder gemeinsamer Steuerung mit Russland. Russlands Verantwortlichkeit für Leipzig wird als amtliche Zurechnung vom 1. September ausgewiesen, nicht als eigenständig geprüfte geheime Beweiskette oder neue völkerrechtliche Kriegsfeststellung.

## Prüfungen

495 News-Tests einschließlich elf neuer Sonderanalyse-Regressionen und des wachsenden Quellenpakets bestanden. Typecheck, Syntaxprüfungen der geänderten Module, News-Build und News-Validierung bestanden. Vollständiger `build:artifact` erfolgreich; öffentliche Linkprüfung: null kaputte interne Links. Der allgemeine Sprach-Lint läuft durch, meldet aber 25 bereits vorhandene Treffer außerhalb dieser Ergänzung (unter anderem Fachbegriffe und historische Versionsstände); diese sind keine neu eingeführten Sonderanalysefehler.

Browserprüfung: Desktop 1440 px, Mobile 390 px, ein H1, sechs Diagramme, geladenes Portrait, Inhaltsnavigation, echte Anker, Leserweg und Quellenstruktur. Keine neue Daten-API nötig: Die Browserseite liest das aus dem geprüften JSON-Bestand generierte HTML. Produktionsprüfung und Releasebezug werden nach Deployment im Abschlussbericht ergänzt.

## Geänderte maßgebliche Dateien

`AGENTS.md`, `scripts/news/analysis-principles.mjs`, `scripts/news/systemic-analysis.mjs`, `scripts/news/publish-editorial-review.mjs`, `scripts/news/editorial-analysis.mjs`, `scripts/news/run-editorial-analyses.mjs`, `scripts/news/build.mjs`, `scripts/news/validate.mjs`, `assets/css/news.css`, `tests/news/systemic-analysis.test.mjs`, das Review-Paket und der bestehende Analysebestand. Abgeleitet: Analyse- und Tickerseiten, Ursprungshinweis, Feeds, Sitemap und Suchmetadaten. Die kanonischen Nachrichten-/Fakten-/Folgencheck-Datensätze werden nicht geändert.
