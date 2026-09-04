# Wirkungsticker: allgemeine Eingabe- und Wiederholungsprüfung

Stand: 2026-09-04. Ergänzt die Betriebs- und Living-File-Dokumentation.

## Ursache und Grundsatz

`AI_INPUT_TOO_LARGE` entsteht lokal, bevor die Oracle-Schnittstelle aufgerufen wird. Die Frage darf höchstens 39.000 Zeichen enthalten (API-Grenze 40.000). Wachsende Akten wiederholten denselben Text als Quellenkurztext, Quellenaussage und Belegauszug. Ein solcher lokaler Fehler ist kein belegter 503 und kein Anbieterausfall.

Die Vorprüfung gilt für alle Kandidaten. Keine pauschale Quellenobergrenze, keine Lockerung von Materialitäts-, Aktualitäts-, Ereigniszuordnungs- oder Evidenzgates. Herkunft und mögliche Abhängigkeiten bleiben erhalten; derselbe Agenturtext wird durch mehrere Abdrucke nicht unabhängig bestätigt.

## Ablauf

1. Feed-/URL-Deduplizierung und Ereigniszuordnung bleiben unverändert.
2. Nach Quellenvereinigung und Aktualitätsvergleich: bereits geprüften Quellenstand erkennen und Eingabegröße lokal prüfen, bevor ein begrenzter KI-Slot vergeben wird.
3. `evidence-packets.mjs` und `fitAnalysisInput()` referenzieren identische Textteile verlustfrei. `excerpt_from:[field,start,length]` bezieht sich auf denselben Quellenkurztext/-titel, `excerpt_text` auf einen story-lokalen Textkatalog. Gemeinsame Metadaten stehen einmal in Defaults. Quellen- und Beleg-IDs bleiben unverändert; `resolveEvidenceReferences()` bindet Modellantworten weiterhin an die Originalpassagen.
4. Die bereits bestehende begrenzte Auswahl zusätzlicher Belegpassagen bleibt explizit als unvollständig markiert. Nicht gelieferter Artikelkontext darf nicht als gelesen gelten. Nicht mehr referenzierte Katalogtexte werden nicht mitgesendet. Quellenidentitäten, Quellenaussagen und Provenienz werden nicht wegen der Zahl der Quellen entfernt.
5. Bis zu drei zulässige öffentliche Artikelauszüge: geänderte/neue Dokumente zuerst, dann Primärquellen und jüngere Quellen. Exakte Wiederholungen desselben Ursprungs und derselben Rolle brauchen keinen zweiten Abruf. Abweichende Aussagen, Rollen oder Ursprünge werden dadurch nicht ausgeschlossen.
6. Nach einer gültigen redaktionellen Ablehnung eines Aktenupdates (`no_new_information`, `not_material`, `superseded`) wird ein interner Prüfstand gespeichert. Keine neue Veröffentlichung, Version, Push-Nachricht oder Bildgeneration für eine bloße Wiederholung.

## Prüfstand / Cache

`review_checkpoint` enthält Versionskennung, Fingerabdruck, Prüfzeit, Ablaufzeit, Ergebnis und geprüfte Quellenkurztexte; keine vollständigen Artikeltexte. Neue Quellen, geänderter Inhalt, Datum, Rolle, Herkunft, öffentlicher Versionsstand oder verwandter Kontext invalidieren den Fingerabdruck. Fällige Follow-ups und Vertiefungen umgehen ihn. Technische Fehler und unzureichende Evidenz werden nicht als redaktionelles „keine Neuigkeit“ gespeichert.

Der Prüfstand gilt höchstens sechs Stunden. Sein Ablauf erzeugt **keinen** zusätzlichen periodischen KI-Auftrag: Neue Quellen und die vorhandenen Follow-up-/Vertiefungsregeln steuern die fachliche Wiederprüfung. Bei einem wieder eintreffenden identischen Auftrag innerhalb der Gültigkeit entfällt der KI-Aufruf. Geprüfte Zusatzquellen bleiben für spätere Vergleiche erhalten, ohne rückwirkend die veröffentlichten Quellenbelege umzuschreiben.

Eine weiterhin zu große Akte bleibt vollständig vorgemerkt (`AI_INPUT_TOO_LARGE`) und wird im Monitoring separat als Eingabeproblem ausgewiesen. Sie blockiert nicht die Slots anderer geeigneter Kandidaten. Identische Größenprobleme werden höchstens nach Ablauf des Prüfstands erneut gepackt, bei neuen Daten oder geänderter Paketversion früher. Dies ist ein sichtbarer Fehlerzustand, keine stillschweigende erfolgreiche Veröffentlichung und keine kostenpflichtige Endlosschleife.

## Kosten und Nachweis

Reports/Nutzungsprotokolle enthalten `reviews_reused`, `input_holds`, `prompt_chars_sent`, echte `ai_requests` sowie neue und aktualisierte Akten getrennt. Lokale Prüfungen mit null Anfragen sind keine unbekannten KI-Kosten. Einsparungen sind anhand tatsächlicher Tokens/Kosten und entfallener Aufrufe zu beurteilen, nicht pauschal aus Zeichenlängen abzuleiten. Das 25-EUR-Monatsbudget einschließlich bestehender Reserven und alle Stunden-/Laufgrenzen bleiben unverändert.

Regressionstests: exakte Text-/ID-Rückauflösung, widersprüchliche Aussagen, Quellenrollen, Cache-Invalidierung, headless Wiederanlauf, keine Scheinversion/Push-Änderung, Eingabeproblem ohne Providerfehlalarm und Weiterverarbeitung anderer Kandidaten. Ein eingefrorener wachsender 15-Quellen-Fall einschließlich Zusatzpassagen und verwandter Akten muss unter das Limit passen.

Deployment über den bestehenden GitHub-Worker und GitHub Pages. Kein neuer Dienst, kein Vercel-Build, keine neue Nachrichtenlizenz und keine Änderung der Oracle-Kapazität erforderlich. Rollback: Code-Release zurücknehmen; bestehende Inhalte/Versionen und vorgemerkte Quellen bleiben erhalten. Bei einer Änderung des Paket-/Prüfvertrags `EVIDENCE_PACKET_VERSION` erhöhen.
