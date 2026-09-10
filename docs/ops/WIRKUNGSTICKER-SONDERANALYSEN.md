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

Der bestehende Analyse-Lauf erkennt neueres Material zur Ursprungsgeschichte und markiert die beauftragte Sonderanalyse als `research_pending`. Er überschreibt sie nicht mit dem 900-1800-Wörter-Standardprompt. Dieser Schutz ist absichtlich: Die besondere Breite und individuelle Quellenprüfung darf nicht durch einen automatischen Kurzlauf verloren gehen. Eine belegte inhaltliche Fortschreibung erfolgt über ein erneutes Review-Paket. Die automatische Recherche-Markierung ersetzt diese Prüfung nicht und behauptet keine permanente eigenständige Abfrage aller Gesetze oder Ministerien.

## Erstveröffentlichung Sachsen-Anhalt

- URL: `/wirkungsticker/analyse/wenn-aus-programm-staatsmacht-wird-sachsen-anhalt/`
- Analyse-ID: `woek-analysis-1abde052e9be`; Ursprung: `wt-e10c23f5e37ed39e`.
- 18 Minuten Lesezeit, 29 kurze Abschnitte, sechs Visualisierungen, 25 Quellen, 17 zentrale Aussagen, 20 Monitoringpunkte.
- Primärbasis: Landesverfassung mit Reformstand 2026; GG einschließlich Art. 20a; endgültiges AfD-Programm und gesondertes Sofortprogramm; GVG §§ 146/147; BVerfSchG § 6; Landtagsberichte über Kulturgesetz und Parlamentsreform; Gewalthilfegesetz-Erläuterung mit Anspruch ab 2032; Bundesrat/Landesvertretung; Innenministerium; IMK; BA; Klimabeschluss; Agenda 2030; wissenschaftliche Meta-Analyse zum Illusory-Truth-Effekt.
- Eigene Verknüpfungen: Die Partei der Verwundbarkeit, Wirkung statt Weltbild (historischer Entwurf!), Wahl-O-Mat-Analyse, Demokratie braucht mehr als gute Sachpolitik und vorhandene Richter:innen-Wirkungsakte. Eigene Vorarbeiten zählen nicht als unabhängige Bestätigung.
- Relevanz: Mensch sehr hoch, Planet hoch, Demokratie sehr hoch. Ex-ante-Richtungsbefund mit Gegenpfaden und Nichtkompensation; keine behauptete beobachtete Gesamtwirkung.
- Monitoring: Ergebnis/Sitze, Regierung, Ressorts und Leitungen, Sicherheit/Kooperation, Erlasse, Haushalt, Kultur, Demokratieprojekte, Gleichstellung/LGBTQ, Frauen-/Kinderschutz, Schule, Bürgerwacht, Justiz, Hochschulen, MDR, Energie, Bundesrat, Personal/Investition und messbare Wirkung.
- Kosten: keine zusätzliche kostenpflichtige Pipeline-Analyse, kein Bildmodell, keine neue laufende API; Recherche und Autorentext wurden im beauftragten Arbeitsprozess geprüft. Daraus wird kein Preisversprechen für künftige Sonderanalysen abgeleitet.

## Redaktionelle und visuelle Fortschreibung, 7. September 2026

Die neu geprüfte Fassung stellt Lebenslagen und den amtlichen Ausgangsbefund vor die Rechtsgrenzen: Einstufung des AfD-Landesverbandes, organisatorischer Zusammenhang mit dem Innenressort und die im Verfassungsschutzbericht 2025 behandelte Programmatik vom April 2026. Der aktuelle amtliche Bericht ist über den tatsächlich geprüften `/api/media/`-Link eingebunden; alte nicht mehr erreichbare Downloadpfade werden nicht als Beleg verwendet. Amtliche Einstufung, Gerichtsverfahren, Programm und Szenario bleiben getrennt.

Die Fassung hat 18 Minuten Lesezeit, 30 kurze Abschnitte, acht Makro-Navigationsgruppen, sieben Informationsvisualisierungen, 28 Quellen und 20 zentrale Ledger-Aussagen. Ergänzt wurden eine verbundene Systemkarte, Machtkarte mit vier Kompetenzarten, bedingte Kaskade, konkrete gerichtete SDG-/Schutzraum-Pfade, parallele föderale Mitwirkung, Zeitachse und Szenarien. MPD-Kurz- und Langbilanz trennen Relevanz und Richtung. Die abweichende Ereignisbewertung der Ursprungsgeschichte erscheint nicht mehr als Schlussgrafik dieser Sonderanalyse.

Abstrakte Gegengewichte bei Schule, Bürgerwacht, Medien, Energie und Wirtschaft wurden entfernt oder auf konkrete Nachweisanforderungen begrenzt. Die Schutzplanken bleiben in einer zentralen Sektion und an sachlich notwendigen Kompetenzgrenzen. Die persönliche Einordnung folgt dem von der Autorin gelieferten Entwurf; `origin: author_supplied_revision` unterscheidet sie von generierten neuen Einordnungen. Vorige Texte, Quellen und Bewertungen bleiben im Versionsverlauf erhalten. Die neue globale Regel 2.0 ist in der Dokumentation der WÖk-Analysen beschrieben.

Prüfstand der Fortschreibung: News-Regressionen einschließlich Richtungsbindung, Wissensstatus, Autorinnenhistorie und quadratischem Avatar; lokale Browserprüfung bei 320/390 px sowie Desktop 1440 px. Keine horizontalen Überläufe, acht funktionierende Makro-Links mit aufklappbaren Unterkapiteln, tatsächlicher Sprung zur Justizsektion, geladene runde Portraits. Der vollständige Artefaktbau, Typecheck und News-Validierung bestehen. Der allgemeine Sprach-Lint enthält weiter die 25 bekannten Treffer außerhalb dieser Änderung. Verlaufshintergründe werden zusätzlich visuell geprüft, da deren Kontrast vom automatischen Browseraudit nicht vollständig berechnet werden kann.

### Weiter offene Evidenzfragen

Regierungsbildung, Einzelgesetze, Haushalte, Besetzungen und Vollzug bleiben soweit nicht belegt offen. Der Trump-Originalpost und seine genaue Zeit konnten nicht eigenständig verifiziert werden. Die dpa-AFX-Weiterveröffentlichung wird wegen widersprüchlicher Zeiten nur als begrenzter Kontext attribuiert. Keine Behauptung von Wahlwirkung oder gemeinsamer Steuerung mit Russland. Russlands Verantwortlichkeit für Leipzig wird als amtliche Zurechnung vom 1. September ausgewiesen, nicht als eigenständig geprüfte geheime Beweiskette oder neue völkerrechtliche Kriegsfeststellung.

## Prüfungen

508 News-Tests einschließlich der neuen Sonderanalyse-, Richtungs-, Versions- und Avatar-Regressionen sowie des wachsenden Quellenpakets bestanden. Typecheck, Syntaxprüfungen der geänderten Module, News-Build und News-Validierung bestanden. Vollständiger `build:artifact` erfolgreich; öffentliche Linkprüfung: null kaputte interne Links. Datenschutz- und Größenprüfung des öffentlichen Artefakts bestanden. Der allgemeine Sprach-Lint läuft durch, meldet aber 25 bereits vorhandene Treffer außerhalb dieser Ergänzung (unter anderem Fachbegriffe und historische Versionsstände); diese sind keine neu eingeführten Sonderanalysefehler.

Browserprüfung der Fortschreibung: Desktop 1440 px, Mobile 320/390 px, ein H1, sieben Diagramme, Inhaltsnavigation, echte Anker, Leserweg und Quellenstruktur. Die Portraits bleiben auf der Übersicht 72 × 72 Pixel groß und dürfen im Flex-Layout nicht schrumpfen; dadurch entsteht auch auf schmalen Displays keine ovale Form. Der automatisierte Barrierefreiheitscheck des Analyseinhalts meldet keine Verstöße; die Kontrastprüfung von Verlaufshintergründen bleibt zusätzlich eine visuelle Prüfung. Keine neue Daten-API nötig: Die Browserseite liest das aus dem geprüften JSON-Bestand generierte HTML. Produktionsprüfung und Releasebezug werden nach Deployment im Abschlussbericht ergänzt.

## Geänderte maßgebliche Dateien

`AGENTS.md`, `scripts/news/analysis-principles.mjs`, `scripts/news/editorial-judgment.mjs`, `scripts/news/systemic-analysis.mjs`, `scripts/news/visuals.mjs`, `scripts/news/publish-editorial-review.mjs`, `scripts/news/publish-reviewed.mjs`, `scripts/news/editorial-analysis.mjs`, `scripts/news/run-editorial-analyses.mjs`, `scripts/news/run.mjs`, `scripts/news/lib.mjs`, `scripts/news/media-impact.mjs`, `scripts/news/build.mjs`, `assets/css/news.css`, die drei zugehörigen News-Testdateien, das Review-Paket und der bestehende Analysebestand. Abgeleitet: Analyse- und Tickerseiten, Ursprungshinweis, Feeds, Sitemap und Suchmetadaten. Die kanonischen Nachrichten-/Fakten-/Folgencheck-Datensätze und die übrigen 15 Analyse-Datensätze werden nicht geändert.
