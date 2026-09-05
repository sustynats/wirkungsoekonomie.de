# Zeitkritische Wahlentwicklung: Quellenprüfung und Erkennung

## Redaktioneller Befund

Die aktuelle Interviewantwort betrifft Siegmunds Kandidatur bei knappster eigener Mehrheit. BILD veröffentlichte den gefundenen Artikel am 5. September um 08:23 Uhr; das Interview stammt vom 4. September. FOCUS berichtete am 5. September um 07:15 Uhr über denselben Interviewursprung. Diese Berichte sind keine zwei unabhängigen Bestätigungen. Das Video wurde nicht eigenständig angehört.

ZDFheute dokumentierte bereits am 2. September um 15:45 Uhr den Vorbehalt einer stabilen eigenen Mehrheit. Deshalb wird kein plötzlicher vollständiger Kurswechsel am Samstagabend behauptet. Nicht belegte interne Abweichler werden nicht übernommen. Die aktuelle Interviewaussage bleibt ausdrücklich attribuiert, mit vorläufigem Nachrichtenstatus. Amtliche Wahl- und Verfassungsquellen belegen nur Termin und Verfahren, nicht persönliche Absichten.

Quellen, begrenzte Belegausschnitte und eigener redaktioneller Text: `content/news/reviews/sachsen-anhalt-kandidatur-2026-09-05.json`. Die Veröffentlichung erfolgt in der bestehenden Stories-Datei, den bestehenden Versionen und Templates. Der explizite redaktionelle Import nutzt dieselben Integritäts-, Evidenz-, Medien-, Self-Frame- und Publikationsgates. Ohne gültige Gates kein Schreibvorgang. Erneuter identischer Import verändert weder Version noch Veröffentlichungsdatum.

## Warum nicht schon automatisch erkannt?

- BILD: Rolle C, deaktiviert; keine freigegebene automatische Discovery. Das bleibt unverändert. FOCUS wird ebenfalls nur als fallbezogene Quelle geführt, kein neuer Polling-Endpunkt.
- ZDF, MDR und DLF: automatisches Hochfrequenznetz. Im geprüften Bestandsstand erfolgreicher Abruf jeweils 5. September 21:26 UTC, keine aufeinanderfolgenden Fehler. Der erfasste stern-Beitrag zur Abschlusskundgebung enthält im Feed keine neue Kandidaturantwort.
- Die konkrete BILD-/FOCUS-URL fehlte im gespeicherten Discovery-Bestand. Deshalb ist nicht belegt, dass genau diese Antwort vom Dedupe verworfen wurde.
- Der Workflow ist rund um die Uhr alle 15 Minuten geplant. Ein verspäteter GitHub-Start wird nicht wegen seiner Uhrzeit verworfen; serielle Läufe und GitHub-Verzögerungen sind trotzdem keine garantierte 15-Minuten-Lieferzeit.
- Für offene/entzogene Kandidaturen oder geänderte Regierungsbildungsbedingungen fehlte ein ausdrücklich benanntes lokales Relevanzsignal. Rücktritt und Wahlergebnis waren bereits teilweise erfasst.

## Dauerhafte Ergänzung

`political-development.mjs` erkennt lokal Kandidaturvorbehalte, Rückzüge, Koalitionsänderungen, Rücktritte und Wahlergebnisse. Die Signale enthalten keine Parteinamen, Personen oder bevorzugten Publisher. Eine aktuelle Meldung mit einem ausdrücklichen Wahl-Nähe-Hinweis bekommt zusätzliche Prüfpriorität. Alte, undatierte und zukünftige Artikel bekommen keinen Eilbonus. Das ist ein Prüfhinweis, kein Beleg eines Kurswechsels oder einer eingetretenen Wirkung.

Veränderte Quellen einer bekannten Story werden als mögliche materielle Entwicklung an die vorhandene Analyse übergeben. Die KI muss vorherigen Stand und neue Aussage vergleichen. Gleiches Wahlthema bedeutet nicht gleiche Nachricht; reine Umformulierungen bleiben mögliche Dubletten. Bekannte URL mit geändertem Inhalt gelangt weiter in die bestehende Versionierung. Es gibt keine Zwangspublikation und keine Absenkung von Evidenz- oder Budgetgrenzen.

Quellen mit gemeinsamem kritischem Interviewursprung können die Bestätigungspflicht nicht über einen anderen Herausgeber umgehen. Eine solche Aussage bleibt offen/zugeschrieben, solange eine tragfähige unabhängige Bestätigung fehlt.

Undatierte amtliche Rechts-/Wahlreferenzen speichern Abrufdatum und fehlendes Veröffentlichungsdatum getrennt. Sie erzeugen keine Nachrichtenaktualität und ersetzen nicht den Hauptbericht. Sonstige undatierte Nachrichten bleiben im Integritätsgate gesperrt.

## Prüfungen und Grenzen

Regressionen: Partei-/Publishersymmetrie, Kandidaturrückzug, Koalitionsänderung, Wahlergebnis, Routine-/Sport-/Rückblickabgrenzung, alte/fehlende/zukünftige Daten, geänderte bekannte URL, Priorität ohne Evidenzanhebung, redaktioneller Import/idempotente Versionierung, falsche Publisher-URL, undatierter amtlicher Kontext, abhängige Interviewabdrucke. Bestehende News-Suite, Registry, Build und Quellengate werden ebenfalls geprüft.

Keine neue kostenpflichtige Analyse oder Bildgenerierung wurde für diesen Import gestartet. Die neuen lokalen Signale verursachen selbst keine API-Aufrufe. Künftige zusätzliche materielle Prüfungen unterliegen den bisherigen Euro- und Stundenlimits.

Verbleibende Grenze: Eine exklusive Entwicklung, die ausschließlich in einer nicht automatisch nutzbaren Quelle vorkommt und von keinem aktiven Feed aufgegriffen wird, kann dieses Portfolio weiterhin verpassen. Dafür wird weder eine unzulässige Quelle aktiviert noch eine lückenlose Breaking-News-Erkennung versprochen.
