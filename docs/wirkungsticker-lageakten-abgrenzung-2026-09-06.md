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
