# Unabhängige Prüfung ohne unnötige Neufassung

Stand: 13.09.2026

Die erste API-Anfrage erstellt die Nachricht mit Wirkungsprofil. Die zweite
prüft Quellen, Artikel und Profil unabhängig. Bisher musste sie das gesamte
Profil erneut ausgeben, auch wenn keine fachliche Änderung nötig war. Außerdem
standen ein identisches Profil und das Antwortschema teilweise doppelt im
Input. Das erhöhte Umfang und Kosten und erzeugte neue inkonsistente Felder.

`impact_review_confirmation_v2` erlaubt zwei eindeutige Antworten:

- Vollständiges korrigiertes `impact_assessment`, `assessment_confirmation:null`.
- `impact_assessment:null` und Bestätigung des unveränderten, über den Auftrag
  gebundenen `proposed_assessment`. Dafür müssen alle 14 Checks bestanden sein.
  Die unabhängige Recherche wird separat dokumentiert. Jeder unsichere Pfad
  braucht einen konkreten Ergebnistext und einen gültigen Verweis auf die
  tatsächlich durchgeführte Recherche. Der erste Entwurf kann diese Prüfung
  nicht selbst bestätigen.

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
