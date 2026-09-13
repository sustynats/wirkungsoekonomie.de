# Unabhängige Prüfung ohne unnötige Neufassung

Stand: 13.09.2026

Die erste API-Anfrage erstellt die Nachricht mit Wirkungsprofil. Die zweite
prüft Quellen, Artikel und Profil unabhängig. Bisher musste sie das gesamte
Profil erneut ausgeben, auch wenn keine fachliche Änderung nötig war. Außerdem
standen ein identisches Profil und das Antwortschema teilweise doppelt im
Input. Das erhöhte Umfang und Kosten und erzeugte neue inkonsistente Felder.

`impact_review_bound_confirmation_v3` erlaubt zwei eindeutig getrennte
Antwortzweige in `assessment_result`:

- `action:replace` mit vollständigem korrigiertem `impact_assessment`.
- `action:confirm` und Bestätigung des unveränderten, über den Auftrag
  gebundenen `proposed_assessment`. Dafür müssen alle 14 Checks bestanden sein.
  Die unabhängige Recherche wird separat dokumentiert. Jeder vorhandene Pfad
  braucht einen konkreten Ergebnistext und einen gültigen Verweis auf die
  tatsächlich durchgeführte Recherche. Der erste Entwurf kann diese Prüfung
  nicht selbst bestätigen. Haupt- UND Nebenpfade stehen bereits vor dem Aufruf
  als individuell erforderliche Schlüssel im strikten Antwortschema; eine frei
  lange Liste darf diese Vollständigkeit nicht erst nachträglich prüfen.

Die Software expandiert die Bestätigung in einer Arbeitskopie. Faktoren,
Richtungen, Belegbindungen, Annahmen und Wirkpfade stammen unverändert aus dem
gebundenen Vorschlag. Nur die ausdrücklich gelieferten Rechercheergebnisse
werden ergänzt. Originalauftrag und rohe Anbieterantwort bleiben unverändert.
Das bestehende Importformat, Quellenprüfung und sämtliche fachlichen
Publikationsgates bleiben maßgeblich. Fehlende Quellen, Faktoren, notwendige
unabgeschlossene Recherche oder negative Checks sperren weiterhin.

Ein identisches doppeltes Profil entfällt im Review-Prompt. Ein abweichendes
historisches Profil bleibt enthalten. Das strikte Antwortschema wird einmal
über `text.format` gesendet. Die unveränderte Originalanfrage bleibt Grundlage
für Journal und Idempotenz; vorhandene bezahlte Ergebnisse sind kostenfrei
wieder abrufbar. Alte vollständige Review-Ausgaben bleiben kompatibel.

Beide getrennten Aufrufe verwenden `gpt-5.6-luna` mit `medium` Reasoning; es
gibt keinen zusätzlichen kostenpflichtigen Fallback. Der Prüfschritt behält
seinen eigenen Auftrag, die 14 Checks und bis zu zwei Suchzugriffe. Die
Unabhängigkeit wird über getrennte, unveränderlich gebundene Aufträge und
eigenständige Begründungen geprüft, nicht allein über verschiedene Modellnamen.
Die offiziellen Angaben bestätigen Structured Outputs, Web Search und Preise
von 0,20 USD Input / 1,20 USD Output je Million Tokens. Toolkosten kommen hinzu:
[OpenAI-Modellseite](https://developers.openai.com/api/docs/models/gpt-5.6-luna).
Das Kostenziel und die fachliche Trefferquote sind am realen Durchlauf zu
messen, nicht aus dem Modellnamen abzuleiten.

Weiterhin höchstens ein bezahlter Aufruf pro unveränderlichem Auftrag, keine
automatischen Neufassungen, kein Modell-Fallback und keine Budgeterhöhung.
Eine technische Wiederprüfung startet keinen weiteren Modellaufruf. Zwei
Aufrufe sind das Prozessziel, kein Anspruch auf Veröffentlichung ungeprüfter
oder fachlich gesperrter Inhalte. Eine Meldung ist erst ausgeliefert, wenn ihr
veröffentlichter Datensatz und ihre öffentliche Detail-URL geprüft wurden.

Validierung: Transporttests prüfen unveränderte Bewertungen, vollständige
Recherchebindung, Ablehnung ungültiger Bestätigungen, negative Checks,
unbekannte Quellen, fehlende Faktoren, alte Ausgaben und eindeutige
Auftragsbindung. Der bestehende Nachrichtentest, Build und Validator sowie
Runtime-Typecheck, Build und Tests müssen vor Installation bestehen.

Installation: bestehende Oracle-Runtime und Worker gemeinsam und commitgebunden
aktualisieren, nur bei deaktiviertem Timer und ohne laufenden API-Auftrag.
Vorherige Codefassung und Zustandsjournale privat sichern. Bei Fehlern Code
zurückrollen; Kosten- und Auftragsjournale niemals zurücksetzen. Der Timer
bleibt bis zum belegten vollständigen neuen Zwei-Aufruf-Durchlauf deaktiviert.

## Abschluss der zweiten Prüfung (13. September, Vertragsversion 5)

Der zweite Aufruf prüft die Endfassung: unveränderten Nachrichtenwortlaut,
bestätigtes oder korrigiertes Wirkungsprofil und gegebenenfalls einen vollständig
ergänzten Mediencheck. Das strukturierte Antwortschema ordnet das Prüfurteil
hinter diesen Feldern an. Behobene Erstfassungsfehler werden dokumentiert;
unbehobene Text-, Quellen- oder Methodenfehler bleiben ein HOLD. Vorhandene
negative Prüfurteile werden weder umgedeutet noch automatisch freigegeben.

Bei einem fehlenden Mediencheck kann der unabhängige Prüfer jetzt auch einen
vollständigen positiven Relevanzbefund liefern. Es gelten der bestehende
Medienvalidator und dessen Quellen-/Attributionsregeln. Unbelegte politische
Zuschreibungen, unbelegte beobachtete Medienwirkung und eine weiterhin nötige
Textkorrektur sperren die Ausgabe. Eine nachvollziehbare negative
Relevanzentscheidung bleibt zulässig. Persönliche Beiträge sind davon unberührt.

Der lokale Protokollvalidator prüft `anyOf`-Varianten ausdrücklich; die
Strukturgarantie des Anbieters ersetzt keine Prüfung importierter Antworten.
Neue Rechercheauszüge müssen zusammenhängend und wörtlich sein. Die freie
Zusammenfassung steht in `supports`, nicht im Feld `quote`. Fehlgeschlagene
Zitatverifikation bleibt ein Sperrgrund und erzeugt keinen dritten Aufruf.

Lokal geprüft: 1.244 Nachrichtentests, 96 Runtime-Tests, Nachrichtenbuild,
Nachrichtenvalidator, Lint und Typecheck. Diese Ergebnisse belegen noch keinen
neuen produktiven Artikel; der Betriebsnachweis braucht weiterhin die beiden
bezahlten Journale, die unabhängige Freigabe, den Import und die öffentliche URL.
