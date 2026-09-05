# Zeitkritische Wahlentwicklung: Quellenprüfung und Erkennung

## Redaktioneller Befund der Erstfassung

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

## Nachkontrolle der öffentlichen Darstellung

Die Live-Kontrolle deckte im bestehenden Medien-Renderer eine Vermischung auf: Der Frame-Sprecher wurde mit dem Text der separat gespeicherten Akteursaussage kombiniert. Die Anzeige nutzt dafür jetzt ausschließlich den Sprecher der Akteursaussage; die Quelle des Frames bleibt daneben getrennt. Fehlt ein Sprecher, wird er nicht aus der Medienquelle geraten. Zuordnungs- und Relevanzcodes werden in deutsche öffentliche Bezeichnungen übersetzt. Zwei zusätzliche Regressionen prüfen diese Trennung und die sicheren Text-Fallbacks. Bestehende Artikeltexte und Analyseversionen bleiben bei dieser reinen Darstellungskorrektur unverändert.

Ein durch die parallel veröffentlichte Methodik-Neugestaltung veralteter Oberflächentest wurde auf deren bestehenden Bus-Einstieg und sechs Prüfschritte ausgerichtet. Die Methodik-Inhalte wurden dafür nicht verändert; Wirkungspotenzial, Wirkungsrisiko, Schutzprinzipien und Rückkopplung bleiben ausdrücklich geprüft.

## Korrektur nach n-tv-Hinweis

Der vom Nutzer ergänzte n-tv-Artikel vom 5. September, 03:20 Uhr, nennt ntv.de, ino/AFP und beruft sich auf dasselbe BILD-Interview. Die Agenturherkunft wird als AFP gespeichert, der konkrete Interviewursprung bleibt BILD. Bei der Nachprüfung wurde ein späterer n-tv-Videobeitrag vom 5. September, 18:24 Uhr, gefunden, dessen Überschrift Siegmund Regierungsbereitschaft auch bei einer Stimme Mehrheit zuschreibt. Dieser spätere Beitrag war in der Erstfassung übersehen worden. Deshalb bleibt die offene Antwort nicht mehr der alleinige aktuelle Stand: Titel, Zusammenfassung, Belegliste und Mediencheck werden versioniert korrigiert. Die alte URL bleibt erhalten; ein sichtbarer Korrekturhinweis benennt die Lücke der Erstfassung. Geprüft sind Überschrift und Datum, kein vollständig angehörter Originalton. Die neuere Aussage bleibt n-tv zugeschrieben.

Die lokale Erkennung berücksichtigt nun auch spätere Bereitschaftserklärungen bei knapper Mehrheit. Die vorhandene Analyseanweisung verlangt ausdrücklich zeitliche Einordnung neuerer Klarstellungen. Beides ist partei- und publisherunabhängig; fehlende Discovery wird damit nicht als vollständig gelöst behauptet. Regressionen sichern die Priorisierung, den identischen Ereignisschlüssel, die stabile URL, frühere Versionen und einen idempotenten Korrekturhinweis.

n-tv ist als fallbezogene Quelle C im bestehenden Register ergänzt. Politik- und Wirtschafts-RSS sind im offiziellen Verzeichnis verlinkt und antworten bei der technischen HEAD-Prüfung mit HTTP 200 / text/xml. Robots wurde gelesen; eine RSL-Verknüpfung steht dort nicht. Die offizielle RSS-Einladung wird nicht zur pauschalen Freigabe jeder automatischen öffentlichen KI-Verarbeitung erklärt. Rechtlicher Nutzungsumfang bleibt offen, automatische Überwachung und Artikelabruf bleiben aus. Es wurden weder ein Abo abgeschlossen noch Tracking-Einwilligungen erteilt, fremde Videos/Bilder kopiert oder neue kostenpflichtige Analysen gestartet.

Quellen: https://www.n-tv.de/politik/Siegmund-will-auch-bei-absoluter-Mehrheit-nicht-unbedingt-Ministerpraesident-werden-id31272045.html ; https://www.n-tv.de/mediathek/videos/politik/Siegmund-Regieren-natuerlich-auch-mit-einer-Stimme-mehr-id31273399.html ; https://www.n-tv.de/incoming/RSS-Feeds-von-n-tv-de-article10735026.html ; https://www.n-tv.de/robots.txt ; https://www.n-tv.de/ntvintern/Impressum-id6405904.html

Prüfstand der Korrektur: 345 Ticker-Tests bestanden, einschließlich des begrenzten Eingabepakets mit 17 Quellen. Die neue Promptregel wurde dafür kompakt gehalten; kein Eingabelimit erhöht. 89 veröffentlichte aktuelle Storys mit 176 Quellen bestanden den strikten Integritätsaudit, ebenso Registry-/Portfolio- und Build-Prüfung. Nur der betroffene Story-Datensatz wurde geändert; die übrigen 421 gespeicherten Datensätze bleiben objektgleich. Erneuter redaktioneller Import ist unverändert und schreibt keine dritte Version. Lokaler Browsercheck: stabile Canonical-URL, Version 2, sichtbarer Korrekturhinweis, korrekte Sprechertrennung, n-tv-Profil ohne automatische Überwachung; bei 390 Pixel Breite kein horizontaler Überlauf und weiße lesbare Überschrift.
