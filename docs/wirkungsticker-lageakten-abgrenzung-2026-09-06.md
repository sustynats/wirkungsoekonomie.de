# Lageakten: Fallentwicklung ist nicht Themenähnlichkeit

## Rückwirkender Befund

Die Untersuchung aller 92 aktiven Meldungen zeigte zwei Fehlbündelungen:

- Der allgemeine Bericht über hybride Risiken für Unternehmen (`wt-f7d7115a53ff2c2f`) war Teil der Sabotage-Chronik. Gemeinsame Wörter wie Sabotage, Stromversorgung und Schutzmaßnahmen hatten die Zuordnung begünstigt. Der Bericht beschreibt jedoch keine neue Entwicklung des konkreten Vorfalls.
- Zwei Iran-Meldungen waren über gemeinsame Wörter und US-Akteure mit der Ukraine-Chronik verbunden. Gemeinsame Akteure und die Kategorie Krieg sind kein Nachweis desselben Konflikts.

Alle drei Meldungen bleiben unverändert veröffentlicht und erscheinen wieder eigenständig. Die Sabotage-Lageakte enthält 20, die Ukraine-Lageakte sechs Entwicklungen. Insgesamt werden 68 statt 65 Lagen und Einzelmeldungen sichtbar; keine zusätzlichen Artikel wurden erzeugt. Alle vorhandenen Artikel-URLs bleiben gültig.

## Dauerhafte Regeln

Der vorhandene Generator `scripts/news/case-files.mjs` prüft bei jedem Build den gesamten Bestand. Es gibt keine Einzelfall-Ausnahmeliste und keine zusätzliche KI-Analyse.

1. Allgemeine Studien, Umfragen, Risiko- und Hintergrundberichte bleiben eigenständige Meldungen. Einzelne Erwähnungen eines Angriffs machen daraus keine Fallentwicklung.
2. Konkrete neue Befunde zum Vorfall, etwa ein Gutachten zur Brandursache, können weiterhin zur Lageakte gehören. Dasselbe gilt für ausreichend verbundene konkrete Forderungen, angekündigte Maßnahmen und Entscheidungen.
3. Ausdrücklich benannte Konflikte werden aus Überschrift bzw. erstem Sachverhaltsabsatz abgegrenzt. Unterschiedliche Konflikte und konfliktübergreifende Vergleichsartikel werden nicht über gemeinsame Wörter verbunden. Bei fehlender eindeutiger Zuordnung bleibt die Meldung eigenständig.
4. Zeitliche Nähe, thematische Überschneidung und spezifische gemeinsame Merkmale bleiben zusätzlich erforderlich. Der Ortsname eines Verhandlungstreffens ersetzt nicht den Gegenstand der Verhandlungen.
5. Die Chronik unterscheidet Forderung/Position, angekündigte Maßnahme und Entscheidung/Maßnahme. Ein Substantiv wie Schutzmaßnahmen im Hintergrundabsatz belegt keine Entscheidung.

Die Zuordnung verändert nur die Darstellung: Übersicht, Chroniken auf sämtlichen Mitgliedsseiten, Nachbar-Navigation und öffentliche Feed-/Storydaten werden aus demselben Bestand neu aufgebaut. Quellen, Faktenchecks, Folgenchecks, Bewertungen, Artikeltexte und historische Analyseversionen werden nicht umgeschrieben.

## Tests und Grenzen

Regressionen prüfen den hybriden Risikobericht, politisch und fachlich unterschiedliche Hintergrundthemen, konkrete Gutachten, Forderungen/Ankündigungen/Entscheidungen, transitive Hintergrundbrücken, unterschiedliche benannte Konflikte, alternative Ortsformulierungen, Unverändertheit und wiederholbare rückwirkende Verarbeitung. Das maschinenlesbare Änderungsprotokoll liegt unter `reports/wirkungsticker-case-audit-2026-09-06.json`.

Dies ist eine konservative lokale Zuordnungsprüfung, kein allgemeiner semantischer Beweis für Ereignisidentität. Unsichere Meldungen bleiben eigenständig sichtbar. Sie werden weder verworfen noch automatisch als Beleg eines anderen Ereignisses benutzt.

Lokaler Abnahmenachweis: 369 Nachrichtentests, 20 Monitortests, Nachrichten- und Such-Build, strenges Quellenintegritätsaudit und Publikationsvalidierung erfolgreich. Zusätzlich wurden alle 26 Mitgliedsseiten und die drei wieder eigenständigen Seiten geprüft, einschließlich Chronik-Inhalt, öffentlicher Storydaten und Feed. Die öffentliche Darstellungsrevision wurde erhöht, damit die WebApp die Korrektur auch ohne geändertes Artikeldatum erkennt.

## Nachtrag: Schutz vor künftigen Verkettungen

Die erste Korrektur beseitigte die beobachteten Hintergrund- und Konflikt-Fehlzuordnungen. Die zusätzliche Prüfung zeigte aber eine strukturelle Schwäche: Der Generator verwendete weiterhin zusammenhängende Graphkomponenten. Eine passende Verbindung A–B und B–C genügte, obwohl A und C nicht zusammenpassten.

Ab Darstellungsrevision `20260906-case-integrity2` gilt deshalb:

- **Jedes Paar prüfen:** Eine neue Meldung muss mit jedem bisherigen Mitglied vereinbar sein. Es gibt keine transitive Vereinigung mehr. Auch das maximale Zeitfenster gilt für die gesamte Gruppe, nicht nur für aufeinanderfolgende Schritte.
- **Mehrdeutigkeit getrennt lassen:** Passt ein Beitrag gleichzeitig vollständig in mehrere getrennte Gruppen, bleibt er eigenständig. Die Reihenfolge der Eingabedaten entscheidet nicht über eine willkürliche Zuordnung; verarbeitet wird nach ursprünglichem Erfassungsdatum und stabiler ID.
- **Benannte Gegenstände abgrenzen:** Unterschiedliche konkret erkennbare Vorfallsobjekte, Wahlgebiete, Konflikte und Firmennamen mit Rechtsform verhindern eine Zusammenfassung. Wahl-Komposita wie Landtagswahl werden mit erkannt. Fehlende/ungültige Zeitangaben begründen keine zeitliche Nähe.
- **Auch vor tatsächlicher Zusammenführung:** Der gemeinsame Gegenstandsprüfer gilt in der bestehenden Quellensuche und Dublettenzuordnung. Vor dem Schreiben einer Zusammenführung werden die aktuelle Akte und schon übernommene Mitglieder nochmals auf Widersprüche geprüft; auch ein veralteter Zusammenführungsplan darf das nicht umgehen.
- **Publikationsprüfung:** `caseIntegrityErrors()` prüft sämtliche Mitgliederpaare nochmals. Unbekannte/doppelte Mitglieder und nicht passende Paare lassen die Validierung fehlschlagen. Detailseiten eigenständiger Meldungen dürfen keine alte Lageakten-Zuordnung enthalten.

Rückprüfung am Bestand von 93 aktiven Meldungen: 84 sichtbare Lagen/Einzelmeldungen, drei kleine Lageakten mit 3/3/6 Mitgliedern; alle zehn WÖk-Analysen bleiben erhalten. Die bisher breite Sabotage-Bündelung wird konservativer getrennt. Das bedeutet **nicht**, dass für sämtliche getrennten Beiträge ein Zusammenhang widerlegt wäre: Er reicht unter der strengeren lokalen Zuordnung nicht für eine gemeinsame Chronik. Thematische Querverweise bleiben die geeignete Alternative. Die Ukraine-Verhandlungschronik bleibt zusammen.

Es wurden keine Artikeltexte, Quellen, Bewertungen oder Analyseversionen geändert und keine kostenpflichtigen Analysen gestartet. Regressionstests decken zusätzlich akute Brückenberichte zwischen verschiedenen Tatorten, Firmen/Wahlgebiete mit nahezu identischer Wortwahl, Zeitfenster-Ketten, fehlende Daten, Wiederholungsereignisse, vertauschte Eingabereihenfolge und veraltete Zusammenführungspläne ab.

Der Betriebsmonitor verwendet dieselbe Lageaktenberechnung. Sein reduzierter Checkout enthält deshalb auch die drei neu benötigten lokalen Abhängigkeiten (`living-files`, `newsroom`, `access-policy`). Der bestehende rekursive Abhängigkeitstest sichert das ab. Hosting bleibt GitHub Pages/Oracle; es gibt keinen Vercel-Build und keine neue KI-Abhängigkeit.

Zusätzlicher Namensschutz: Mehrteilige Firmennamen bleiben vollständig; „Nordstern Energie GmbH“ und „Südstern Energie GmbH“ werden nicht auf den gemeinsamen Branchenbestandteil reduziert. Die Grenze zwischen Überschrift und Nachrichtentext bleibt bei der Namenserkennung erhalten. „Auswahl“ löst keine Wahlgebietszuordnung aus.

Abnahme des integrierten Standes: 386 Nachrichtentests und 20 Monitortests erfolgreich; Nachrichten-/Such-Build, Quellenintegritätsaudit (93 Meldungen, 186 Quellen, kein offener Befund), Registry-/Portfolioaudit, Publikationsvalidierung und Hosting-Kostengate erfolgreich.

Grenze: Die Prüfung ist eine konservative lokale Heuristik, kein universeller semantischer Beweis. Nicht jedes Unternehmen und jeder Vorfall ist durch diese Textmuster vollständig erkennbar. Deshalb keine Zusage absoluter Fehlerfreiheit; nachgewiesene Fehlertypen werden als Regressionen gesichert. Ein offener Lageaktenbezug blockiert keine ansonsten geprüfte Einzelmeldung.
