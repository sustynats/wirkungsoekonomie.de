# Gegenstand und Vergleich im unabhängigen MPD-Prüfpass

Stand: 14.09.2026. Ergänzung zur Methodik 2.1, keine historische Neubewertung.

Die Ereignisquelle kann eine Warnung oder Forderung belegen, während das MPD-Profil den zugrunde liegenden Sachverhalt, das Risiko oder die geforderte Maßnahme bewertet. Die Auswahl muss vor der Bewertung erfolgen. Ein Kommunikationsgegenstand bleibt möglich, wenn die Untersuchung tatsächlich der Vermittlung oder Rezeption gilt. Er darf nicht aus dem grammatischen Subjekt der Überschrift übernommen werden.

Das bisherige Datenmodell führte `evaluation_target` und `baseline` als Freitext und `same_target` / `same_baseline` als Wahrheitswerte. Das Antwortschema setzte diese Wahrheitswerte für Hauptpfade auf `true`. Diese strukturelle Einschränkung belegt keine inhaltliche Vergleichbarkeit. Auch eine formal vollständige unabhängige Bestätigung konnte dadurch denselben Gegenstandsfehler übernehmen.

Neue API-Prüfantworten dokumentieren deshalb zusätzlich `review.scope` mit Version `target-baseline-1`:

- Gegenstand, Bezug zum Nachrichtenanlass, zugrunde liegender Sachverhalt und Beleg-IDs.
- Wortgleich gebundener Vergleichszustand, dessen Art und Begründung.
- Einzeln adressierte Haupt- und Nebenpfade der geprüften Endfassung mit Gegenstandsbezug, konkretem Vergleich und Wirkungsrolle.

Ein Haupt- oder Gegenpfad muss eine eigenständige Zustandsveränderung gegenüber dem Vergleich desselben Gegenstands sein. Risikominderung gegenüber einem schlechteren Entwurf, Restschaden, ein Verfahrensschritt, ausbleibender Nutzen oder eine andere Maßnahme können nicht über `counter_path` in die Hauptbilanz gelangen. Wird eine Schutzmaßnahme selbst bewertet, kann ihre Verbesserung gegenüber dem Zustand ohne diese Schutzmaßnahme ein eigenständiger positiver Pfad sein. Es gibt keine Themen-, Parteien- oder Quellenautomatik.

Der lokale Publikationsvalidator prüft Bindung, vollständige Pfadabdeckung und Widersprüche zwischen Rolle und Hauptbilanz. Er entscheidet nicht, ob ein Modell eine Quelle richtig verstanden hat. Diese Verantwortung bleibt beim tatsächlichen unabhängigen Prüfpass einschließlich Quellenprüfung und der bisherigen 14 fachlichen Checks. Die neue Dokumentation ist ein prüfbarer Begründungsnachweis, kein Wahrheitsbeweis.

Bestehende bezahlte Antworten und gespeicherte Profile ohne `scope` behalten ihren ursprünglichen Vertrag. Der Import akzeptiert fehlende historische Scope-Dokumentation; eine vorhandene Dokumentation wird geprüft. Keine Migration, erneute kostenpflichtige Generierung, automatische Freigabe oder historische Richtungsänderung wird ausgelöst. Die spätere direkte Nutzerentscheidung vom 14.09.2026 verlangt bei neu freigegebenen Nachrichten drei numerisch modellierte Dimensionen. Deshalb bietet das frische Antwortschema keine insufficient_basis-Alternative. Ein unvollständiger Vorschlag kann nicht bestätigt werden. Der explizite HOLD-Zweig erhält den gebundenen Entwurf und nennt die ausstehende Recherche, ohne Faktoren zu erfinden. Er verlangt needs_review/blocked und mindestens einen fehlgeschlagenen Fachcheck. Der versionierte neue Auftrag verlangt die Scope-Dokumentation beim Import; eine neue ready-Antwort mit offenem Profil wird zurückgehalten. Alte bezahlte Antworten werden nicht umgeschrieben oder kostenpflichtig neu angefordert. Die drei Korrekturaufträge des Incidents bleiben an ihre bestehenden Sperren gebunden; ein technischer Test gibt sie nicht frei.

Die Lesekompatibilität alter bezahlter Antworten ist keine neue Publikationsfreigabe: Auch ein älterer `ready`-Prüfoutput mit einer Null-Dimension bleibt vor erstmaliger oder erneuter Veröffentlichung im Prüfstatus. Provider, finaler Adapter und Metadatenimport prüfen die drei modellierten Dimensionen unabhängig vom Alter des Auftrags. Ein bezahlter Altoutput wird weder umgeschrieben noch dafür erneut kostenpflichtig erzeugt; wiederholte Reconciliation erzeugt keinen Folgeauftrag. Bereits veröffentlichte historische Profile bleiben weiterhin sichtbar.
